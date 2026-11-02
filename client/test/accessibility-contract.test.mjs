import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const clientRoot = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFile(`${clientRoot}/${path}`, 'utf8');

async function sourceFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) return sourceFiles(path);
        return /\.(css|js)$/.test(entry.name) ? [path] : [];
    }))).flat();
}

test('interactive controls retain a consistent visible keyboard focus indicator', async () => {
    const files = await sourceFiles(`${clientRoot}/src`);
    const offenders = [];
    for (const path of files) {
        const source = await readFile(path, 'utf8');
        if (/outline:\s*(?:none|0)\b/.test(source)) offenders.push(path);
    }
    const main = await read('src/styles/main.css');
    assert.deepEqual(offenders, []);
    assert.match(main, /:is\(a, button, input, select, textarea, summary, \[tabindex\]\):focus-visible/);
    assert.match(main, /@media\s*\(forced-colors:\s*active\)/);
});

test('both mobile-menu implementations expose the complete dialog-like navigation contract', async () => {
    const [navbar, home, drawer] = await Promise.all([
        read('src/js/components/navbar.js'),
        read('src/js/pages/home.js'),
        read('src/js/components/mobile-drawer.js')
    ]);
    for (const markup of [navbar, home]) {
        assert.match(markup, /aria-expanded="false"/);
        assert.match(markup, /aria-controls=/);
        assert.match(markup, /aria-label="Mobile navigation"/);
        assert.match(markup, /aria-hidden="true"/);
        assert.match(markup, /tabindex="-1" inert/);
    }
    assert.match(drawer, /event\.key !== 'Tab'/);
    assert.match(drawer, /event\.key === 'Escape'/);
    assert.match(drawer, /element\.inert = true/);
    assert.match(drawer, /drawer\.inert = false/);
    assert.match(drawer, /toggle\.focus\(\)/);
    assert.match(drawer, /aria-expanded', 'true'/);
});

test('dynamic feedback receives standardized live-region semantics', async () => {
    const [accessibility, entry] = await Promise.all([
        read('src/js/components/accessibility.js'),
        read('src/main.js')
    ]);
    assert.match(accessibility, /\.error-message/);
    assert.match(accessibility, /applyLiveRegion\(element, 'alert', 'assertive'\)/);
    assert.match(accessibility, /applyLiveRegion\(element, 'status', 'polite'\)/);
    assert.match(accessibility, /new MutationObserver/);
    assert.match(entry, /installAccessibilityEnhancements\(\)/);
});

test('application feedback replaces native dialogs with accessible, safe UI', async () => {
    const files = await sourceFiles(`${clientRoot}/src`);
    const nativeDialogOffenders = [];
    for (const path of files.filter(path => path.endsWith('.js'))) {
        const source = await readFile(path, 'utf8');
        if (/(^|[^\w.])(alert|confirm|prompt)\s*\(/m.test(source)) nativeDialogOffenders.push(path);
    }

    const [feedback, entry, styles] = await Promise.all([
        read('src/js/components/feedback.js'),
        read('src/main.js'),
        read('src/styles/main.css')
    ]);
    assert.deepEqual(nativeDialogOffenders, []);
    assert.match(entry, /window\.appFeedback = appFeedback/);
    assert.match(feedback, /setAttribute\('aria-live'/);
    assert.match(feedback, /setAttribute\('aria-modal', 'true'\)/);
    assert.match(feedback, /event\.key === 'Escape'/);
    assert.match(feedback, /event\.key !== 'Tab'/);
    assert.match(feedback, /element\.inert = true/);
    assert.match(feedback, /element\.inert = inert/);
    assert.match(feedback, /previouslyFocused\.focus\(\)/);
    assert.match(feedback, /text\.textContent = String\(message/);
    assert.match(feedback, /input\.setAttribute\('aria-invalid', 'true'\)/);
    assert.match(styles, /\.feedback-toast-region/);
    assert.match(styles, /\.feedback-dialog-backdrop/);
});

test('bottom navigation retains accessible names and active-page semantics', async () => {
    const source = await read('src/js/components/BottomNav.js');
    assert.match(source, /createElement\('nav'\)/);
    assert.match(source, /aria-label', 'Primary mobile navigation'/);
    assert.match(source, /aria-current="page"/);
    assert.match(source, /aria-label="\$\{item\.label\}"/);
});

test('production language metadata matches the single fully supported interface locale', async () => {
    const [index, entry, navbar, home, profile, authorities] = await Promise.all([
        read('index.html'),
        read('src/main.js'),
        read('src/js/components/navbar.js'),
        read('src/js/pages/home.js'),
        read('src/js/pages/profile.js'),
        read('src/js/pages/authorities.js')
    ]);
    assert.match(index, /<html lang="en">/);
    assert.match(entry, /document\.documentElement\.lang = 'en'/);
    assert.match(entry, /localStorage\.removeItem\('language'\)/);
    assert.doesNotMatch(`${navbar}\n${home}`, /lang-btn|data-lang=/);
    assert.doesNotMatch(navbar, /showLanguage/);
    assert.doesNotMatch(profile, /name="language"|Language Preference/);
    assert.match(navbar, /lang="hi">मेरी शिकायत/);
    assert.match(authorities, /class="hindi-name" lang="hi"/);
});
