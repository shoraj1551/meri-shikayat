import test from 'node:test';
import assert from 'node:assert/strict';
import { registration, complaintData } from './fixtures.mjs';
import { registerSchema, loginSchema } from '../../src/validators/auth.validator.js';
import User from '../../src/models/User.js';
import Admin from '../../src/models/Admin.js';
import Complaint from '../../src/models/Complaint.js';
import { generateTestToken, extractUserIdFromToken } from '../../src/__tests__/helpers/testAuth.js';
import { clearDatabase as legacyClear } from '../../src/__tests__/helpers/testDb.js';
const validate = (schema, body) => schema.validate(body, { abortEarly: false, stripUnknown: true, convert: true });
test('registration fixtures satisfy the mounted API validator and real User model', async () => {
    const { error, value } = validate(registerSchema, registration());
    assert.equal(error, undefined);
    await new User(value).validate();
});
test('mounted registration rejects HTML rather than silently sanitizing it', () => {
    const { error } = validate(registerSchema, registration({ firstName: '<script>xss</script>John' }));
    assert.ok(error.details.some(detail => detail.path[0] === 'firstName'));
});
test('login fixtures use identifier; obsolete email-only payload is rejected', () => {
    assert.equal(validate(loginSchema, { identifier: 'citizen@example.com', password: 'Citizen@1234' }).error, undefined);
    assert.ok(validate(loginSchema, { email: 'citizen@example.com', password: 'Citizen@1234' }).error);
});
test('complaint fixtures match real required fields and the optional category rule', async () => {
    await new Complaint({ ...complaintData(), complaintId: 'MSK-2026-000001' }).validate();
    await assert.rejects(new Complaint({ ...complaintData({ location: {} }), complaintId: 'MSK-2026-000002' }).validate());
});
test('admin fixtures validate against Admin, not the separate unified User model', async () => {
    await new Admin({ firstName: 'Test', lastName: 'Admin', email: 'admin@example.com', phone: '9876543211',
        password: 'Admin@1234', adminId: 'TEST-ADMIN', status: 'active', role: 'manager',
        permissions: { editComplaints: true } }).validate();
});
test('API token helper roundtrips the id claim expected by mounted auth middleware', () => {
    const id = '507f1f77bcf86cd799439011';
    assert.equal(extractUserIdFromToken(generateTestToken({ _id: id })), id);
});
test('legacy cleanup helper cannot bypass the new ownership guard', async () => {
    await assert.rejects(legacyClear(), /test-run identity/);
});
