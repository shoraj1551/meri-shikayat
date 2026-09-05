const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const path = require('node:path');
const serverRequire = createRequire(path.resolve(__dirname, '../server/package.json'));
const args = process.argv.slice(2);
if (args.some(arg => /^--(integration|config|forceExit|passWithNoTests)(=|$)/.test(arg))) {
    console.error('Use the checked-in unit configuration or npm run test:integration. Forced exit and empty-suite success are not allowed.');
    process.exit(1);
}
const result = spawnSync(process.execPath, [
    '--experimental-vm-modules', serverRequire.resolve('jest/bin/jest'),
    '--config', 'jest.config.js', ...args
], { cwd: path.resolve(__dirname, '../server'), env: { ...process.env, MS_TEST_MODE: 'unit', NODE_ENV: 'test' }, stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
