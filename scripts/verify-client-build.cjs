const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { gunzipSync, brotliDecompressSync } = require('node:zlib');
const dist = path.resolve(__dirname, '../client/dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(match => match[1]).filter(url => url.startsWith('/assets/'));
assert.ok(assets.length, 'Built HTML must reference generated assets');
let compressed = 0;
for (const asset of assets) {
    const file = path.resolve(dist, '.' + asset);
    assert.ok(file.startsWith(dist + path.sep), 'Asset must remain within dist');
    assert.ok(fs.statSync(file).isFile(), 'Missing built asset: ' + asset);
}
function verifyCompression(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) verifyCompression(file);
        else if (/\.(gz|br)$/.test(file)) {
            const original = fs.readFileSync(file.replace(/\.(gz|br)$/, ''));
            const encoded = fs.readFileSync(file);
            const decoded = file.endsWith('.gz') ? gunzipSync(encoded) : brotliDecompressSync(encoded);
            assert.deepEqual(decoded, original, 'Compressed asset differs: ' + file);
            compressed++;
        }
    }
}
verifyCompression(dist);
assert.ok(compressed > 0, 'Compression plugins must emit assets');
console.log('Build verified: ' + assets.length + ' HTML asset references; ' + compressed + ' compressed assets.');
