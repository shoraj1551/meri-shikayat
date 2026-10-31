import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { validateUploadedImage } from '../../src/middleware/fileValidation.js';
import { createApp } from '../../src/app.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

async function withTempDirectory(run) {
    const directory = await mkdtemp(path.join(tmpdir(), 'profile-upload-'));
    try { await run(directory); } finally { await rm(directory, { recursive: true, force: true }); }
}

test('profile image validation rejects forged image metadata and deletes the upload', async () => {
    await withTempDirectory(async directory => {
        const filePath = path.join(directory, 'forged.upload');
        await writeFile(filePath, '<script>alert(1)</script>');
        const req = { file: { path: filePath, filename: 'forged.upload', originalname: 'avatar.jpg', mimetype: 'image/jpeg', size: 25 } };
        const res = responseRecorder();
        let nextCalled = false;

        await validateUploadedImage(req, res, () => { nextCalled = true; });

        assert.equal(nextCalled, false);
        assert.equal(res.statusCode, 400);
        assert.match(res.body.message, /validation failed/);
        await assert.rejects(stat(filePath), error => error.code === 'ENOENT');
    });
});

test('profile image validation accepts real image bytes and normalizes the extension', async () => {
    await withTempDirectory(async directory => {
        const filePath = path.join(directory, 'random.upload');
        await sharp({ create: { width: 32, height: 32, channels: 3, background: '#336699' } }).png().toFile(filePath);
        const req = { file: { path: filePath, filename: 'random.upload', originalname: 'avatar.jpg', mimetype: 'image/jpeg', size: (await stat(filePath)).size } };
        const res = responseRecorder();
        let nextCalled = false;

        await validateUploadedImage(req, res, () => { nextCalled = true; });

        assert.equal(nextCalled, true);
        assert.equal(req.file.filename, 'random.png');
        assert.equal(req.file.mimetype, 'image/png');
        assert.equal(req.validatedFile.mimeType, 'image/png');
        assert.ok((await readFile(req.file.path)).length > 0);
    });
});

test('profile image validation rejects excessive dimensions and cleans up', async () => {
    await withTempDirectory(async directory => {
        const filePath = path.join(directory, 'wide.upload');
        await sharp({ create: { width: 10001, height: 1, channels: 3, background: '#ffffff' } }).png().toFile(filePath);
        const req = { file: { path: filePath, filename: 'wide.upload', originalname: 'wide.png', mimetype: 'image/png', size: (await stat(filePath)).size } };
        const res = responseRecorder();

        await validateUploadedImage(req, res, () => assert.fail('invalid dimensions must not continue'));

        assert.equal(res.statusCode, 400);
        assert.match(res.body.error, /width/);
        await assert.rejects(stat(filePath), error => error.code === 'ENOENT');
    });
});

test('application startup creates the profile upload directory', async () => {
    await withTempDirectory(async directory => {
        const uploadsPath = path.join(directory, 'uploads');
        const dependency = { isReady: () => true };
        await createApp({ database: dependency, redis: dependency, routes: [], uploadsPath });
        assert.equal((await stat(path.join(uploadsPath, 'profiles'))).isDirectory(), true);
    });
});

test('profile route and production image require validation and directory creation', async () => {
    const routeSource = await readFile(new URL('../../src/routes/profile.routes.js', import.meta.url), 'utf8');
    const dockerSource = await readFile(new URL('../../Dockerfile', import.meta.url), 'utf8');
    assert.match(routeSource, /upload\.single\('profilePicture'\)[\s\S]*validateUploadedImage/);
    assert.match(routeSource, /handleMulterError/);
    assert.match(dockerSource, /mkdir -p uploads\/profiles/);
});
