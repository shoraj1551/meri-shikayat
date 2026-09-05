// Local counterpart of CI's disposable Mongo/Redis services. No existing data volumes.
import { randomBytes } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'ms-b04-' + randomBytes(6).toString('hex');
const created = [];
async function docker(...args) {
    return (await execute('docker', args, { timeout: 180000, maxBuffer: 1024 * 1024 })).stdout.trim();
}
async function start(name, port, image) {
    await docker('run', '-d', '--name', name, '-p', '127.0.0.1::' + port, image);
    created.push(name);
    const mapping = await docker('port', name, port + '/tcp');
    if (!/^127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(mapping)) throw new Error('Unexpected Docker port binding');
    return mapping;
}
async function ready(check, label) {
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
        try { await check(); return; } catch {}
        await delay(1000);
    }
    throw new Error(label + ' readiness timed out');
}
try {
    const mongo = await start(prefix + '-mongo', 27017, 'mongo:8.0');
    const redis = await start(prefix + '-redis', 6379, 'redis:7-alpine');
    await ready(() => docker('exec', prefix + '-mongo', 'mongosh', '--quiet', '--eval', 'quit(db.runCommand({ping:1}).ok ? 0 : 1)'), 'Mongo');
    await ready(() => docker('exec', prefix + '-redis', 'redis-cli', 'ping'), 'Redis');
    const env = { ...process.env, TEST_MONGODB_BASE_URI: 'mongodb://' + mongo + '/', TEST_REDIS_BASE_URI: 'redis://' + redis + '/0' };
    // Do not strip an inherited application URI: the launcher must refuse it.
    const status = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['scripts/run-api-tests.cjs', 'integration'], { cwd: root, env, stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', code => resolve(code ?? 1));
    });
    process.exitCode = status;
} finally {
    const results = await Promise.allSettled(created.reverse().map(name => docker('rm', '-f', '-v', name)));
    if (results.some(result => result.status === 'rejected')) {
        console.error('Could not remove all disposable test containers:', prefix);
        process.exitCode = 1;
    } else if (created.length) {
        console.log('Removed this run’s disposable Mongo/Redis containers and anonymous volumes.');
    }
}
