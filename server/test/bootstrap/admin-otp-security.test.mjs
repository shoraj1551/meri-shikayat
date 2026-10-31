import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Admin from '../../src/models/Admin.js';
import { verifyAdminOtp } from '../../src/controllers/admin.controller.js';
import { generateOTP, hashOTP } from '../../src/services/otp.service.js';
import { adminOtpVerificationSchema } from '../../src/validators/auth.validator.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

function queryReturning(admin) {
    return { select: async () => admin };
}

async function withAdminStubs(admin, findOneAndUpdate, updateOne, run) {
    const originalFindById = Admin.findById;
    const originalFindOneAndUpdate = Admin.findOneAndUpdate;
    const originalUpdateOne = Admin.updateOne;
    Admin.findById = () => queryReturning(admin);
    Admin.findOneAndUpdate = findOneAndUpdate;
    Admin.updateOne = updateOne;
    try {
        await run();
    } finally {
        Admin.findById = originalFindById;
        Admin.findOneAndUpdate = originalFindOneAndUpdate;
        Admin.updateOne = originalUpdateOne;
    }
}

async function activeAdmin(otp = '654321', attempts = 0) {
    return {
        _id: '507f1f77bcf86cd799439011',
        adminId: 'ADM-000001',
        firstName: 'Secure',
        lastName: 'Admin',
        email: 'admin@example.test',
        role: 'manager',
        permissions: { viewComplaints: true },
        status: 'active',
        loginOtp: await hashOTP(otp),
        loginOtpExpires: new Date(Date.now() + 60_000),
        loginOtpAttempts: attempts,
        saves: 0,
        async save() {
            this.saves += 1;
        }
    };
}

test('legacy universal admin code is rejected when it is not the issued OTP', async () => {
    const admin = await activeAdmin();
    const res = responseRecorder();

    await withAdminStubs(admin, async (_filter, update) => {
        assert.deepEqual(update, { $inc: { loginOtpAttempts: 1 } });
        admin.loginOtpAttempts += 1;
        return admin;
    }, async () => {
        throw new Error('first invalid OTP must not lock the code');
    }, async () => {
        await verifyAdminOtp({ body: { adminId: admin._id, otp: '123456' } }, res);
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.token, undefined);
    assert.equal(admin.loginOtpAttempts, 1);
    assert.equal(admin.saves, 0);
});

test('admin OTP is invalidated when the per-code attempt limit is reached', async () => {
    const admin = await activeAdmin('654321', 2);
    const res = responseRecorder();

    await withAdminStubs(admin, async (_filter, update) => {
        assert.deepEqual(update, { $inc: { loginOtpAttempts: 1 } });
        admin.loginOtpAttempts += 1;
        return admin;
    }, async () => {
        admin.loginOtp = undefined;
        admin.loginOtpExpires = undefined;
        admin.loginOtpAttempts = undefined;
    }, async () => {
        await verifyAdminOtp({ body: { adminId: admin._id, otp: '111111' } }, res);
    });

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Maximum OTP verification attempts exceeded/);
    assert.equal(admin.loginOtp, undefined);
    assert.equal(admin.loginOtpExpires, undefined);
    assert.equal(admin.loginOtpAttempts, undefined);
});

test('a valid admin OTP is atomically consumed and cannot be replayed', async () => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const admin = await activeAdmin();
    let available = true;
    const consume = async () => {
        if (!available) return null;
        available = false;
        return admin;
    };

    try {
        await withAdminStubs(admin, consume, async () => {}, async () => {
            const first = responseRecorder();
            await verifyAdminOtp({ body: { adminId: admin._id, otp: '654321' } }, first);
            assert.equal(first.statusCode, 200);
            assert.equal(first.body.success, true);
            assert.equal(typeof first.body.token, 'string');

            const replay = responseRecorder();
            await verifyAdminOtp({ body: { adminId: admin._id, otp: '654321' } }, replay);
            assert.equal(replay.statusCode, 400);
            assert.match(replay.body.message, /already been used/);
            assert.equal(replay.body.token, undefined);
        });
    } finally {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    }
});

test('parallel invalid attempts are atomically counted and invalidate the OTP', async () => {
    const admin = await activeAdmin();
    let storedAttempts = 0;
    let invalidated = false;

    const increment = async (_filter, update) => {
        assert.deepEqual(update, { $inc: { loginOtpAttempts: 1 } });
        if (invalidated || storedAttempts >= 3) return null;
        storedAttempts += 1;
        return { ...admin, loginOtpAttempts: storedAttempts };
    };
    const invalidate = async () => {
        invalidated = true;
        admin.loginOtp = undefined;
        admin.loginOtpExpires = undefined;
        admin.loginOtpAttempts = undefined;
    };

    await withAdminStubs(admin, increment, invalidate, async () => {
        const responses = await Promise.all(Array.from({ length: 3 }, async (_, index) => {
            const res = responseRecorder();
            await verifyAdminOtp({ body: { adminId: admin._id, otp: `11111${index}` } }, res);
            return res;
        }));
        assert.ok(responses.every(res => res.statusCode === 400));
    });

    assert.equal(storedAttempts, 3);
    assert.equal(invalidated, true);
    assert.equal(admin.loginOtp, undefined);
});

test('suspending an admin invalidates an outstanding OTP before rejecting verification', async () => {
    const admin = await activeAdmin();
    admin.status = 'suspended';
    let invalidated = false;
    const res = responseRecorder();

    await withAdminStubs(admin, async () => null, async () => {
        invalidated = true;
    }, async () => {
        await verifyAdminOtp({ body: { adminId: admin._id, otp: '654321' } }, res);
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.token, undefined);
    assert.equal(invalidated, true);
});

test('admin OTP implementation contains no bypass, insecure RNG, or secret logging', async () => {
    const controllerPath = fileURLToPath(new URL('../../src/controllers/admin.controller.js', import.meta.url));
    const source = await readFile(controllerPath, 'utf8');
    assert.doesNotMatch(source, /otp\s*===\s*['"]123456['"]/);
    assert.doesNotMatch(source, /Math\.random\s*\(/);
    assert.doesNotMatch(source, /ADMIN LOGIN OTP/);

    const generated = Array.from({ length: 10 }, () => generateOTP());
    assert.ok(generated.every(value => /^\d{6}$/.test(value)));
    assert.ok(new Set(generated).size > 1);
});

test('admin OTP request validation rejects malformed identifiers and codes', () => {
    assert.ok(adminOtpVerificationSchema.validate({ adminId: 'not-an-object-id', otp: '654321' }).error);
    assert.ok(adminOtpVerificationSchema.validate({ adminId: '507f1f77bcf86cd799439011', otp: 'abcdef' }).error);
    assert.ok(adminOtpVerificationSchema.validate({ adminId: '507f1f77bcf86cd799439011', otp: '12345' }).error);
    assert.equal(
        adminOtpVerificationSchema.validate({ adminId: '507f1f77bcf86cd799439011', otp: '654321' }).error,
        undefined
    );
});
