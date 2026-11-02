import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const clientRoot = fileURLToPath(new URL('..', import.meta.url));
const stylesRoot = `${clientRoot}/src/styles`;
const readClientFile = (path) => readFile(`${clientRoot}/${path}`, 'utf8');

async function cssFiles(directory = stylesRoot) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) return cssFiles(path);
        return entry.name.endsWith('.css') ? [path] : [];
    }));
    return nested.flat();
}

test('canonical design tokens load before all consuming styles', async () => {
    const entry = await readClientFile('src/main.js');
    const tokens = entry.indexOf("import './styles/tokens/design-tokens.css'");
    const main = entry.indexOf("import './styles/main.css'");

    assert.ok(tokens >= 0, 'the canonical token stylesheet must be imported');
    assert.ok(tokens < main, 'tokens must load before styles that consume them');
});

test('only the canonical token file owns global root custom properties', async () => {
    const files = await cssFiles();
    const offenders = [];

    for (const path of files) {
        if (path.endsWith('/tokens/design-tokens.css')) continue;
        const source = await readFile(path, 'utf8');
        if (/(^|\n)\s*:root\s*\{/.test(source)) offenders.push(path);
    }

    assert.deepEqual(offenders, []);
});

test('legacy names resolve to canonical scales instead of redefining values', async () => {
    const tokens = await readClientFile('src/styles/tokens/design-tokens.css');
    const requiredAliases = [
        ['primary-color', 'color-primary-600'],
        ['text-primary', 'color-text-primary'],
        ['bg-surface', 'color-bg-primary'],
        ['font-family', 'font-family-base'],
        ['text-4xl', 'font-size-4xl'],
        ['spacing-2xl', 'space-12'],
        ['duration-normal', 'duration-base']
    ];

    for (const [alias, canonical] of requiredAliases) {
        assert.match(tokens, new RegExp(`--${alias}:\\s*var\\(--${canonical}\\)`));
    }
});

test('accessibility preferences are implemented in the active token layer', async () => {
    const tokens = await readClientFile('src/styles/tokens/design-tokens.css');
    assert.match(tokens, /@media\s*\(prefers-color-scheme:\s*dark\)/);
    assert.match(tokens, /color-scheme:\s*dark/);
    assert.match(tokens, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(tokens, /animation-duration:\s*0\.01ms\s*!important/);
});
