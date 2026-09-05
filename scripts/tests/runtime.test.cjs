const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');

test('native image dependency can encode and inspect an image', async () => {
    const sharp = require('sharp');
    const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 2);
    assert.equal(metadata.height, 2);
});

function loadTokenService(secret) {
    const env = { ...process.env, NODE_ENV: 'test', LOG_LEVEL: 'error' };
    delete env.JWT_SECRET;
    delete env.JWT_SECRET_PREVIOUS;
    if (secret !== undefined) env.JWT_SECRET = secret;
    return spawnSync(process.execPath, [
        '-e',
        "import('./server/src/services/token.service.js').catch(e=>{console.error(e.message);process.exitCode=1})"
    ], { cwd: path.resolve(__dirname, '../..'), env, encoding: 'utf8', timeout: 15000 });
}

test('token configuration loads with a generated strong secret', () => {
    assert.equal(loadTokenService(randomBytes(64).toString('hex')).status, 0);
});
test('token configuration refuses a missing secret before serving requests', () => {
    const result = loadTokenService();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /JWT_SECRET environment variable is not set/);
});
test('token configuration refuses an undersized secret', () => {
    const result = loadTokenService('abc');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /at least 64 characters/);
});
