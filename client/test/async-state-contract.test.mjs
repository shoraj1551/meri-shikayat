import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { Loading, renderDataState } from '../src/js/components/loading.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('shared data states are accessible, escaped, and visually consistent', () => {
    const loading = renderDataState('loading', { message: '<loading>', count: 2 });
    const empty = Loading.empty('<empty>', 'Nothing & nowhere');
    const error = Loading.error('<error>', 'Try again', { actionLabel: 'Retry' });

    assert.match(loading, /role="status"/);
    assert.match(loading, /aria-busy="true"/);
    assert.match(loading, /&lt;loading&gt;/);
    assert.equal((loading.match(/ui-skeleton__row/g) || []).length, 2);
    assert.match(empty, /ui-state--empty/);
    assert.match(empty, /&lt;empty&gt;/);
    assert.match(error, /role="alert"/);
    assert.match(error, /data-state-action="retry"/);
});

test('all primary asynchronous screen families use the shared state component', async () => {
    const paths = [
        'src/js/pages/dashboard.js',
        'src/js/pages/community-hub.js',
        'src/js/pages/messages.js',
        'src/js/pages/stories-feed.js',
        'src/js/pages/admin-complaints.js',
        'src/js/pages/admin-pending.js',
        'src/js/pages/admin-permission-requests.js',
        'src/js/pages/authorities.js',
        'src/js/pages/authority-detail.js',
        'src/js/pages/contractors.js'
    ];
    const sources = await Promise.all(paths.map(read));
    sources.forEach((source, index) => {
        assert.match(source, /components\/loading\.js/, `${paths[index]} must import the shared state component`);
        assert.match(source, /Loading\.(?:state|skeleton|empty|error)/, `${paths[index]} must render a shared state`);
    });
});

test('the router catches renderer failures with the shared retryable error state', async () => {
    const router = await read('src/js/router.js');
    assert.match(router, /renderDataState\('error'/);
    assert.match(router, /data-state-action="retry"/);
    assert.match(router, /catch \(error\)[\s\S]*?this\.renderError\(error\)/);
});

test('legacy Loading call sites are backed by compatible methods', async () => {
    const pages = await read('src/js/pages/profile.js');
    assert.match(pages, /Loading\.show\(/);
    assert.equal(typeof Loading.show, 'function');
    assert.equal(typeof Loading.hide, 'function');
    assert.equal(typeof Loading.skeleton, 'function');
});
