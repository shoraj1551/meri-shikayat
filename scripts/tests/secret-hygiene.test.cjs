const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '../..');
const credentialUri = /mongodb(?:\+srv)?:\/\/[^\s"'<>]+:[^\s"'<>]+@/;

test('tracked text files contain no credential-shaped MongoDB URIs', () => {
    const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
    const violations = [];
    for (const file of files) {
        const path = resolve(root, file);
        if (!existsSync(path)) continue;
        const bytes = readFileSync(path);
        if (bytes.includes(0)) continue;
        if (credentialUri.test(bytes.toString('utf8'))) violations.push(file);
    }
    // Report paths only, never matched credentials.
    assert.deepEqual(violations, [], 'Remove credential-shaped MongoDB URLs from tracked files');
});

test('credential URI detector recognizes standard and SRV forms', () => {
    for (const scheme of ['mongodb', 'mongodb+srv']) {
        assert.ok(credentialUri.test(scheme + '://' + 'fixture' + ':' + 'fixture' + '@example.invalid/db'));
    }
    assert.equal(credentialUri.test('REPLACE_WITH_MONGODB_URI_FROM_SECRET_MANAGER'), false);
});
