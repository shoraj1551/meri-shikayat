import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const launch = (args, env = {}) => spawnSync(process.execPath, ['scripts/run-api-tests.cjs', ...args], {
    cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 15000
});
test('integration launcher refuses inherited application URI before connecting', () => {
    const result = launch(['integration'], { MONGODB_URI: 'mongodb://production.example.com/customer-data' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Refusing inherited MONGODB_URI/);
    assert.doesNotMatch(result.stderr, /customer-data/);
});
test('a real failing assertion propagates through the API CI launcher', () => {
    const result = launch(['unit', '--runInBand', '--testMatch=**/failure.fixture.js']);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /intentional regression proves the CI command fails/);
    assert.match(result.stderr, /Expected: 999/);
});
test('integration preflight rejects remote or application-named test service URIs', () => {
    for (const uri of ['mongodb://127.0.0.1:27017/production', 'mongodb://db.example.com:27017/', '']) {
        const result = launch(['integration'], { MONGODB_URI: '', TEST_MONGODB_BASE_URI: uri, TEST_REDIS_BASE_URI: 'redis://127.0.0.1:6379/0' });
        assert.equal(result.status, 1);
        assert.match(result.stderr, /require explicit disposable loopback/);
    }
});
