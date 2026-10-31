import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePlainTextBody, sanitizePlainTextValue } from '../../src/middleware/plainText.js';

test('stored text sanitizer removes active HTML recursively while preserving plain text', () => {
    const value = sanitizePlainTextValue({
        title: '<img src=x onerror=alert(1)>Road damage',
        nested: { city: '<script>alert(1)</script>Delhi' },
        comments: ['<svg onload=alert(1)>Hello', '<STYLE>body{display:none}</STYLE>Visible']
    });
    assert.equal(value.title, 'Road damage');
    assert.equal(value.nested.city, 'Delhi');
    assert.equal(value.comments[0], 'Hello');
    assert.equal(value.comments[1], 'Visible');
});

test('plain-text middleware replaces the request body before controller execution', () => {
    const req = { body: { content: '<b onclick=alert(1)>Hello</b>' } };
    let called = false;
    sanitizePlainTextBody(req, {}, () => { called = true; });
    assert.equal(called, true);
    assert.equal(req.body.content, 'Hello');
});
