import test from 'node:test';
import assert from 'node:assert/strict';
import { fork, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';

test('production child process handles SIGTERM and exits after closing its listener', { timeout: 15000 }, async t => {
    const child = fork(fileURLToPath(new URL('./process.fixture.mjs', import.meta.url)), [], {
        env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });
    t.after(() => { if (child.exitCode === null) child.kill(); });
    let output = '';
    child.stderr.on('data', chunk => { output += chunk; });
    child.stdout.resume();
    const [message] = await once(child, 'message');
    await request('http://127.0.0.1:' + message.port).get('/api/v1/health/live').expect(200);
    const exited = once(child, 'exit');
    // Windows has no POSIX signal delivery; exercise the identical registered process event.
    if (process.platform === 'win32') child.send('SIGTERM');
    else child.kill('SIGTERM');
    const [code, signal] = await exited;
    assert.equal(code, 0, output);
    assert.equal(signal, null);
});

test('actual production CLI fails fast for invalid configuration without printing credential values', () => {
    const marker = 'sensitive-short-value';
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../../src/index.js', import.meta.url))], {
        env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: marker, MONGODB_URI: 'mongodb://127.0.0.1:1/isolated_bootstrap' },
        encoding: 'utf8', timeout: 10000
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /API startup failed/);
    assert.doesNotMatch(result.stdout + result.stderr, /sensitive-short-value|API listening/);
});
