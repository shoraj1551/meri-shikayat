// Three explicit modes. Unit is the safe default; integrations require disposable services.
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mode = process.argv[2] || 'unit';
const allowed = ['unit', 'integration', 'harness'];
if (!allowed.includes(mode)) throw new Error('Unknown API test mode');
const env = { ...process.env, NODE_ENV: 'test', MS_TEST_MODE: mode,
    MS_TEST_RUN_ID: randomBytes(12).toString('hex'), NO_UPDATE_NOTIFIER: '1' };
if (mode === 'integration' && process.env.MONGODB_URI) {
    console.error('Refusing inherited MONGODB_URI. Unset it; supply disposable TEST_MONGODB_BASE_URI and TEST_REDIS_BASE_URI.');
    process.exit(1);
}
if (mode === 'integration') {
    try {
        const { serviceAddress } = require('../server/test/harness/identity.mjs');
        serviceAddress(env.TEST_MONGODB_BASE_URI, 'mongodb');
        serviceAddress(env.TEST_REDIS_BASE_URI, 'redis');
    } catch {
        console.error('Integration tests require explicit disposable loopback TEST_MONGODB_BASE_URI and TEST_REDIS_BASE_URI (no application database name or credentials).');
        process.exit(1);
    }
}
function run(args) {
    const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit', timeout: 180000 });
    if (result.error) console.error(result.error.message);
    return result.status ?? 1;
}
if (mode === 'unit') {
    const status = run(['scripts/run-jest.cjs', ...process.argv.slice(3)]);
    if (status) process.exit(status);
}
if (mode === 'integration') {
    const status = run(['--import', './server/test/harness/environment.cjs', '--test', '--test-concurrency=2', '--test-timeout=30000',
        'server/src/__tests__/auth.test.js', 'server/src/__tests__/complaints.test.js', 'server/src/__tests__/admin.test.js',
        'server/src/__tests__/integration/*.test.js']);
    process.exitCode = status;
} else {
    process.exitCode = run(['--import', './server/test/harness/native-unit-setup.mjs', '--test',
        '--test-timeout=15000', 'server/test/harness/*.test.mjs',
        ...(mode === 'unit' ? ['server/src/__tests__/middleware/validation.test.js'] : [])]);
}
