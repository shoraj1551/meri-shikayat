import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { escapeHtml, escapeHtmlDeep, escapeJsString, safeUrl } from '../src/js/utils/html.js';

test('HTML encoding neutralizes element, attribute and entity payloads', () => {
    const payload = `<img src=x onerror="globalThis.pwned=1">'&`;
    const encoded = escapeHtml(payload);
    assert.equal(encoded, '&lt;img src=x onerror=&quot;globalThis.pwned=1&quot;&gt;&#39;&amp;');
    assert.doesNotMatch(encoded, /<img/i);

    const nested = escapeHtmlDeep({ name: payload, comments: [{ text: '<script>alert(1)</script>' }] });
    assert.doesNotMatch(nested.name, /</);
    assert.doesNotMatch(nested.comments[0].text, /</);
});

test('inline JavaScript string encoding cannot break out of quoted handlers', () => {
    const encoded = escapeJsString(`');alert(1);//\u2028<svg>`);
    assert.doesNotMatch(encoded, /['"<>&\u2028\u2029]/);
    assert.match(encoded, /\\u0027/);
    assert.match(encoded, /\\u003c/);
});

test('URL policy rejects executable schemes and permits HTTP, HTTPS and relative paths', () => {
    assert.equal(safeUrl('javascript:alert(1)'), '');
    assert.equal(safeUrl('data:text/html,<script>alert(1)</script>'), '');
    assert.equal(safeUrl('https://example.test/a?x=1&y=2'), 'https://example.test/a?x=1&amp;y=2');
    assert.equal(safeUrl('/uploads/image.png'), '/uploads/image.png');
});

test('stored-data pages import the shared contextual encoders', async () => {
    const pages = [
        'messages.js', 'stories-feed.js', 'community-hub.js', 'admin-complaints.js',
        'admin-permission-requests.js', 'admin-pending.js', 'profile.js'
    ];
    for (const page of pages) {
        const path = fileURLToPath(new URL(`../src/js/pages/${page}`, import.meta.url));
        const source = await readFile(path, 'utf8');
        assert.match(source, /utils\/html\.js/, `${page} must use the shared encoding policy`);
    }
});

test('message and story rendering boundaries encode malicious stored records', async t => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = { location: { href: 'https://example.test/' } };
    globalThis.document = {
        createElement: () => ({ textContent: '' }),
        head: { appendChild() {} }
    };
    t.after(() => {
        globalThis.window = originalWindow;
        globalThis.document = originalDocument;
    });
    const { renderMessageMarkup } = await import('../src/js/pages/messages.js');
    const { renderStoryCard } = await import('../src/js/pages/stories-feed.js');
    const attack = '<img src=x onerror="globalThis.pwned=1">';

    const message = renderMessageMarkup({ sender: 'other', content: attack, createdAt: 0 }, 'me');
    assert.doesNotMatch(message, /<img/i);
    assert.match(message, /&lt;img/);

    const story = renderStoryCard({
        _id: "x');alert(1)//", title: attack, description: '<script>alert(1)</script>', status: 'resolved',
        createdAt: 0, media: [], hypes: [], shares: 0,
        category: { name: attack }, user: { firstName: attack, lastName: attack },
        comments: [{ text: attack, user: { firstName: attack } }]
    }, { _id: 'me' });
    assert.doesNotMatch(story, /<script|<img/i);
    assert.doesNotMatch(story, /onclick="[^"]*x'\);alert\(1\)/i);
    assert.match(story, /x\\u0027\);alert\(1\)/);
    assert.match(story, /&lt;script/);
});
