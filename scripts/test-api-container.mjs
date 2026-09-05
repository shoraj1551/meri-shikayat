// Run after building meri-shikayat-api:verify. Uses disposable containers only;
// no host ports, host volumes, .env files, or existing databases are used.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
const execute = promisify(execFile);
const prefix = 'ms-b03-' + randomBytes(6).toString('hex');
const network = prefix + '-network';
const mongo = prefix + '-mongo';
const redis = prefix + '-redis';
const api = prefix + '-api';
const created = [];
let networkCreated = false;
const env = { ...process.env, JWT_SECRET: randomBytes(64).toString('hex') };
async function docker(...args) {
    return (await execute('docker', args, { env, timeout: 180000, maxBuffer: 1024 * 1024 })).stdout.trim();
}
async function container(name, ...args) {
    await docker('run', '-d', '--name', name, '--network', network, ...args);
    created.push(name);
}
async function until(check, label, timeoutMs = 60000) {
    const deadline = Date.now() + timeoutMs;
    let failure;
    while (Date.now() < deadline) {
        try { await check(); return; } catch (error) { failure = error; }
        await delay(1000);
    }
    throw new Error(label + ' timed out', { cause: failure });
}
async function probe(path, expected) {
    await docker('exec', api, 'node', '-e',
        "fetch('http://127.0.0.1:'+process.env.PORT+'" + path +
        "',{signal:AbortSignal.timeout(2000)}).then(r=>process.exit(r.status===" + expected + "?0:1)).catch(()=>process.exit(1))");
}
try {
    await docker('network', 'create', network);
    networkCreated = true;
    await container(mongo, 'mongo:8.0');
    await container(redis, 'redis:7-alpine');
    await until(() => docker('exec', mongo, 'mongosh', '--quiet', '--eval', 'quit(db.runCommand({ping:1}).ok ? 0 : 1)'), 'Mongo startup');
    await until(async () => assert.equal(await docker('exec', redis, 'redis-cli', 'ping'), 'PONG'), 'Redis startup');
    await container(api,
        '--env', 'JWT_SECRET', '--env', 'NODE_ENV=production', '--env', 'PORT=5081',
        '--env', 'NO_UPDATE_NOTIFIER=1', '--env', 'MONGODB_URI=mongodb://' + mongo + ':27017/bootstrap_only',
        '--env', 'REDIS_HOST=' + redis, '--env', 'REDIS_REQUIRED=true',
        '--env', 'CORS_ORIGIN=http://localhost:5173', 'meri-shikayat-api:verify');
    await until(() => probe('/api/v1/health/ready', 200), 'Production API readiness');
    await probe('/api/v1/health/live', 200);
    console.log('PASS: actual production entrypoint listens on custom PORT with Mongo and required Redis');

    await docker('stop', '--time', '5', redis);
    await until(() => probe('/api/v1/health/ready', 503), 'Redis outage readiness');
    await probe('/api/v1/health/live', 200);
    await docker('start', redis);
    await until(() => probe('/api/v1/health/ready', 200), 'Redis recovery readiness');

    await docker('stop', '--time', '5', mongo);
    await until(() => probe('/api/v1/health/ready', 503), 'Mongo outage readiness');
    await probe('/api/v1/health/live', 200);
    console.log('PASS: required dependency outages affect readiness, not liveness');

    await docker('kill', '--signal', 'SIGTERM', api);
    await until(async () => assert.equal(await docker('inspect', '--format', '{{.State.Running}}', api), 'false'), 'SIGTERM exit', 15000);
    assert.equal(await docker('inspect', '--format', '{{.State.ExitCode}}', api), '0');
    console.log('PASS: SIGTERM exits cleanly');
} finally {
    // Only names successfully created by this invocation can be removed.
    const cleanup = await Promise.allSettled(created.reverse().map(name => docker('rm', '-f', '-v', name)));
    if (networkCreated) cleanup.push(...await Promise.allSettled([docker('network', 'rm', network)]));
    if (cleanup.some(result => result.status === 'rejected')) {
        console.error('Some disposable B03 resources could not be removed:', prefix);
        process.exitCode = 1;
    }
}
