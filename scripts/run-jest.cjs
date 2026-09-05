// Resolve through npm's workspace layout instead of assuming server/node_modules.
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const path = require('node:path');
const serverRequire = createRequire(path.resolve(__dirname, '../server/package.json'));
const result = spawnSync(process.execPath, [
    '--experimental-vm-modules',
    serverRequire.resolve('jest/bin/jest'),
    ...process.argv.slice(2)
], { cwd: path.resolve(__dirname, '../server'), stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
