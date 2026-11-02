import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { Router } from '../src/js/router.js';

const clientRoot = fileURLToPath(new URL('..', import.meta.url));
const readClientFile = (path) => readFile(`${clientRoot}/${path}`, 'utf8');

async function cssFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map(entry => {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) return cssFiles(path);
        return entry.name.endsWith('.css') ? [path] : [];
    }))).flat();
}

test('index does not globally load page-specific CSS', async () => {
    const html = await readClientFile('index.html');
    const localStyleLinks = [...html.matchAll(/<link\b[^>]+href=["']\/src\/styles\/([^"']+)["'][^>]*>/g)];

    assert.equal(localStyleLinks.length, 0);
    assert.doesNotMatch(html, /rel=["']preload["'][^>]+\/src\/styles\//);
});

test('Leaflet JavaScript and CSS load only when the complaint map is requested', async () => {
    const [html, complaintPage] = await Promise.all([
        readClientFile('index.html'),
        readClientFile('src/js/pages/file-complaint-new.js')
    ]);

    assert.doesNotMatch(html, /leaflet|unpkg\.com/i);
    assert.match(complaintPage, /import\(['"]leaflet['"]\)/);
    assert.match(complaintPage, /import\(['"]leaflet\/dist\/leaflet\.css['"]\)/);
    assert.doesNotMatch(complaintPage, /window\.L/);
});

test('mobile and admin navigation selectors are namespaced independently', async () => {
    const [styles, bottomNav] = await Promise.all([
        readClientFile('src/styles/main.css'),
        readClientFile('src/js/components/BottomNav.js')
    ]);

    assert.match(styles, /\.sidebar-nav[\s\S]*?\.nav-item\s*\{/);
    assert.match(styles, /\/\* Bottom Navigation \*\/[\s\S]*?\.bottom-nav__item\s*\{/);
    assert.doesNotMatch(bottomNav, /class=["'`]nav-item\b/);
    assert.match(bottomNav, /bottom-nav__item/);
});

test('router applies registered styles before rendering a route', async () => {
    const events = [];
    const router = new Router({
        styleApplicator: async (styles) => events.push(`styles:${styles.join(',')}`)
    });
    router.register('/dashboard', () => events.push('render'), ['dashboardPremium']);
    globalThis.history = { pushState() {} };

    await router.navigate('/dashboard');

    assert.deepEqual(events, ['styles:dashboardPremium', 'render']);
});

test('a superseded navigation cannot render after a slower style load', async () => {
    const pending = new Map();
    const rendered = [];
    const router = new Router({
        styleApplicator: (styles) => new Promise((resolve) => pending.set(styles[0], resolve))
    });
    router.register('/slow', () => rendered.push('slow'), ['slow']);
    router.register('/fast', () => rendered.push('fast'), ['fast']);
    globalThis.history = { pushState() {} };

    const slowNavigation = router.navigate('/slow');
    await Promise.resolve();
    const fastNavigation = router.navigate('/fast');
    await Promise.resolve();
    pending.get('fast')(true);
    await fastNavigation;
    pending.get('slow')(true);
    await slowNavigation;

    assert.deepEqual(rendered, ['fast']);
});

test('responsive behavior is owned by base and component styles without overflow masking', async () => {
    const files = await cssFiles(`${clientRoot}/src/styles`);
    const overflowMasks = [];
    for (const file of files) {
        const source = await readFile(file, 'utf8');
        if (/overflow-x\s*:\s*(?:hidden|clip)/.test(source)) overflowMasks.push(file);
    }
    const [app, registry, main, social, community] = await Promise.all([
        readClientFile('src/js/app.js'),
        readClientFile('src/js/route-styles.js'),
        readClientFile('src/styles/main.css'),
        readClientFile('src/styles/social-features.css'),
        readClientFile('src/styles/community-feed.css')
    ]);

    assert.deepEqual(overflowMasks, []);
    assert.doesNotMatch(`${app}\n${registry}`, /responsiveFixes|homeEnhancements|dashboardLayout/);
    assert.match(main, /\.mobile-nav\.active \{ transform: translateX\(0\)/);
    assert.match(main, /img,[\s\S]*?max-width: 100%/);
    assert.match(social, /grid-template-columns: minmax\(14rem, 300px\) minmax\(0, 1fr\)/);
    assert.match(social, /chat-container\.chat-active/);
    assert.match(community, /width: min\(350px, calc\(100vw - 3rem\)\)/);
});
