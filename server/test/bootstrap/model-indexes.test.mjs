import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { readdir } from 'node:fs/promises';

const modelsDirectory = new URL('../../src/models/', import.meta.url);
for (const file of (await readdir(modelsDirectory)).filter(name => name.endsWith('.js')).sort()) {
    await import(new URL(file, modelsDirectory));
}

test('model schemas do not register duplicate index key definitions', () => {
    for (const [modelName, model] of Object.entries(mongoose.models)) {
        const seen = new Map();
        for (const [keys, options] of model.schema.indexes()) {
            const signature = JSON.stringify(keys);
            assert.equal(
                seen.has(signature),
                false,
                `${modelName} registers ${signature} more than once: ` +
                    JSON.stringify([seen.get(signature), options])
            );
            seen.set(signature, options);
        }
    }
});

test('deduplication preserves unique and TTL index semantics', () => {
    const indexOptions = (modelName, keys) => mongoose.model(modelName).schema.indexes()
        .find(([candidate]) => JSON.stringify(candidate) === JSON.stringify(keys))?.[1];

    assert.equal(indexOptions('Complaint', { complaintId: 1 })?.unique, true);
    assert.equal(indexOptions('Category', { name: 1 })?.unique, true);
    assert.equal(indexOptions('Department', { code: 1 })?.unique, true);
    assert.equal(indexOptions('Department', { name: 1 })?.unique, true);
    assert.equal(indexOptions('DepartmentOffice', { officeCode: 1 })?.unique, true);
    assert.equal(indexOptions('Session', { refreshToken: 1 })?.unique, true);
    assert.equal(indexOptions('AuditLog', { timestamp: 1 })?.expireAfterSeconds, 7776000);
    assert.equal(indexOptions('OTPLog', { expiresAt: 1 })?.expireAfterSeconds, 0);
    assert.equal(indexOptions('Session', { expiresAt: 1 })?.expireAfterSeconds, 0);
});
