const test = require('node:test');
const assert = require('node:assert/strict');
const { checkToolchain } = require('../check-toolchain.cjs');
const { engines } = require('../../package.json');

test('accepts the pinned toolchain', () => {
    assert.doesNotThrow(() => checkToolchain(engines.node, `npm/${engines.npm} node/v${engines.node} win32 x64`));
});
test('rejects unsupported Node before installation', () => {
    assert.throws(() => checkToolchain('20.18.0', `npm/${engines.npm}`), /Use Node/);
});
test('rejects a different npm version', () => {
    assert.throws(() => checkToolchain(engines.node, 'npm/10.8.2'), /Use npm/);
});
test('rejects missing npm context with an actionable error', () => {
    assert.throws(() => checkToolchain(engines.node), /npm run check:toolchain/);
});
