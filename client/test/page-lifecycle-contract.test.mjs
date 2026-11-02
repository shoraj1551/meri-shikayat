import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const clientRoot = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFile(`${clientRoot}/${path}`, 'utf8');

test('shared navbar listeners are bound to the active route signal', async () => {
    const [navbar, drawer] = await Promise.all([
        read('src/js/components/navbar.js'),
        read('src/js/components/mobile-drawer.js')
    ]);
    assert.match(navbar, /initializeNavbar\(lifecycle\)/);
    assert.match(navbar, /initializeMobileDrawer\([\s\S]*?lifecycle/);
    assert.match(drawer, /document\.addEventListener\('keydown',[\s\S]*?signal:\s*lifecycle\?\.signal/);
    assert.match(drawer, /lifecycle\?\.onCleanup\([\s\S]*?restoreFocus:\s*false/);
});

test('long-running page resources register route cleanup', async () => {
    const paths = [
        'src/js/pages/home.js',
        'src/js/pages/admin-dashboard.js',
        'src/js/pages/file-complaint-new.js',
        'src/js/pages/verify-account.js',
        'src/js/pages/forgot-password-verify.js',
        'src/js/pages/admin-login.js'
    ];
    const sources = await Promise.all(paths.map(read));
    for (const [index, source] of sources.entries()) {
        assert.match(source, /lifecycle/, `${paths[index]} must consume the route lifecycle`);
    }
    assert.match(sources[0], /lifecycle\.setInterval/);
    assert.match(sources[1], /unsubscribeNewComplaint/);
    assert.match(sources[2], /getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/);
    assert.match(sources[2], /createTrackedObjectUrl/);
});
