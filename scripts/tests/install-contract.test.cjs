const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, readFileSync, mkdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const repo = path.resolve(__dirname, '../..');

function fixture() {
    // Only new disposable fixtures; never mutate or clean a user's checkout.
    const dir = mkdtempSync(path.join(tmpdir(), 'meri-b02-'));
    for (const name of ['client', 'server']) {
        mkdirSync(path.join(dir, name));
        writeFileSync(path.join(dir, name, 'package.json'), readFileSync(path.join(repo, name, 'package.json')));
    }
    writeFileSync(path.join(dir, 'package.json'), readFileSync(path.join(repo, 'package.json')));
    return dir;
}

function ci(dir) {
    assert.ok(process.env.npm_execpath, 'Run through npm run test:tooling');
    return spawnSync(process.execPath, [
        process.env.npm_execpath, 'ci', '--ignore-scripts', '--offline', '--no-audit', '--no-fund'
    ], { cwd: dir, encoding: 'utf8', timeout: 30000 });
}

test('npm ci refuses a missing lockfile', () => {
    const result = ci(fixture());
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /package-lock.json|shrinkwrap/);
});

test('npm ci refuses a manifest out of sync with its lock', () => {
    const dir = fixture();
    writeFileSync(path.join(dir, 'package-lock.json'), readFileSync(path.join(repo, 'package-lock.json')));
    const manifest = JSON.parse(readFileSync(path.join(dir, 'package.json')));
    mkdirSync(path.join(dir, 'local-package'));
    writeFileSync(path.join(dir, 'local-package/package.json'), JSON.stringify({
        name: 'b02-fixture', version: '1.0.0'
    }));
    manifest.dependencies = { 'b02-fixture': 'file:./local-package' };
    writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest));
    const result = ci(dir);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /in sync/);
    assert.match(result.stderr, /Missing:.*(b02-fixture|local-package)/);
});

test('CI environment preparation writes strong independent masked secrets', () => {
    const dir = fixture();
    const envFile = path.join(dir, 'ci-env');
    const result = spawnSync(process.execPath, [path.join(repo, 'scripts/prepare-ci-env.cjs')], {
        env: { ...process.env, GITHUB_ENV: envFile }, encoding: 'utf8'
    });
    assert.equal(result.status, 0);
    const entries = Object.fromEntries(readFileSync(envFile, 'utf8').trim().split('\n').map(line => line.split('=')));
    assert.match(entries.JWT_SECRET, /^[a-f0-9]{128}$/);
    assert.match(entries.SESSION_SECRET, /^[a-f0-9]{128}$/);
    assert.notEqual(entries.JWT_SECRET, entries.SESSION_SECRET);
    assert.equal(result.stdout.trim().split(/\r?\n/).length, 2);
    assert.ok(result.stdout.split(/\r?\n/).filter(Boolean).every(line => line.startsWith('::add-mask::')));
});
