import assert from 'node:assert/strict';
import test from 'node:test';

import { Router } from '../src/js/router.js';

function fakeDocument() {
    const elements = new Map();
    const focusTarget = {
        attributes: new Map(),
        focused: false,
        hasAttribute(name) { return this.attributes.has(name); },
        setAttribute(name, value) { this.attributes.set(name, value); },
        focus() { this.focused = true; }
    };
    const app = {
        innerHTML: '',
        querySelector(selector) {
            if (selector === '[data-route-retry]' || selector === '[data-route-home]') return null;
            return focusTarget;
        }
    };
    const meta = { content: '', setAttribute(name, value) { this[name] = value; } };
    elements.set('app', app);

    const document = {
        title: '',
        body: { style: {}, appendChild(element) { if (element.id) elements.set(element.id, element); } },
        head: { appendChild() {} },
        getElementById(id) { return elements.get(id) || null; },
        querySelector(selector) { return selector === 'meta[name="description"]' ? meta : null; },
        createElement() {
            return {
                id: '', className: '', textContent: '',
                setAttribute(name, value) { this[name] = value; }
            };
        }
    };
    return { document, app, meta, focusTarget, elements };
}

function fakeWindow(pathname = '/') {
    const calls = [];
    return {
        location: { origin: 'https://example.test', pathname, search: '', hash: '', href: `https://example.test${pathname}` },
        scrollX: 0,
        scrollY: 0,
        addEventListener() {},
        removeEventListener() {},
        scrollTo(...position) { calls.push(position); },
        scrollCalls: calls
    };
}

function fakeHistory() {
    const calls = [];
    return {
        state: null,
        scrollRestoration: 'auto',
        pushState(state, unused, url) { this.state = state; calls.push(['push', url]); },
        replaceState(state, unused, url) { this.state = state; calls.push(['replace', url]); },
        calls
    };
}

test('initial routing renders without adding a redundant history entry', async () => {
    const windowRef = fakeWindow('/');
    const history = fakeHistory();
    globalThis.history = history;
    const router = new Router({ windowRef });
    let rendered = false;
    router.register('/', () => { rendered = true; });

    await router.init();

    assert.equal(rendered, true);
    assert.equal(history.calls.filter(([method]) => method === 'push').length, 0);
    assert.equal(history.scrollRestoration, 'manual');
});

test('route parameters are URL-decoded and malformed encodings show 404', async () => {
    const router = new Router();
    let received;
    router.register('/authorities/:id', ({ id }) => { received = id; });
    globalThis.history = fakeHistory();

    await router.navigate('/authorities/Water%20Board');
    assert.equal(received, 'Water Board');
    assert.equal(router.matchRoute('/authorities/%E0%A4%A'), null);
});

test('guards redirect before protected route rendering', async () => {
    const history = fakeHistory();
    globalThis.history = history;
    const router = new Router();
    let protectedRendered = false;
    let loginRendered = false;
    router.register('/private', () => { protectedRendered = true; });
    router.register('/login', () => { loginRendered = true; });
    router.addGuard(({ path }) => path === '/private' ? '/login?redirect=%2Fprivate' : true);

    await router.navigate('/private');

    assert.equal(protectedRendered, false);
    assert.equal(loginRendered, true);
    assert.equal(history.calls.at(-1)[1], '/login?redirect=%2Fprivate');
});

test('successful transitions update metadata, focus, announcements, and scroll', async () => {
    const ui = fakeDocument();
    const windowRef = fakeWindow('/dashboard');
    globalThis.history = fakeHistory();
    const router = new Router({ documentRef: ui.document, windowRef });
    router.register('/dashboard', () => {}, [], { title: 'My dashboard', description: 'Citizen complaint dashboard.' });

    await router.navigate('/dashboard');

    assert.equal(ui.document.title, 'My dashboard | Meri Shikayat');
    assert.equal(ui.meta.content, 'Citizen complaint dashboard.');
    assert.equal(ui.focusTarget.focused, true);
    assert.deepEqual(windowRef.scrollCalls.at(-1), [0, 0]);
    assert.equal(ui.elements.get('route-announcer').textContent, 'My dashboard page loaded');
});

test('router provides loading, error, and user-visible 404 states', async () => {
    const ui = fakeDocument();
    const windowRef = fakeWindow('/broken');
    globalThis.history = fakeHistory();
    const router = new Router({ documentRef: ui.document, windowRef });
    let sawLoading = false;
    let errorCleanup = 0;
    router.register('/broken', (_params, lifecycle) => {
        sawLoading = ui.app.innerHTML.includes('Loading page');
        lifecycle.onCleanup(() => { errorCleanup += 1; });
        throw new Error('failure');
    });

    await router.navigate('/broken');
    assert.equal(sawLoading, true);
    assert.equal(errorCleanup, 1);
    assert.match(ui.app.innerHTML, /Page unavailable/);

    await router.navigate('/does-not-exist');
    assert.match(ui.app.innerHTML, /404/);
    assert.match(ui.app.innerHTML, /Page not found/);
});

test('404 navigation supersedes an in-flight route', async () => {
    const ui = fakeDocument();
    const windowRef = fakeWindow('/slow');
    globalThis.history = fakeHistory();
    let release;
    const router = new Router({
        documentRef: ui.document,
        windowRef,
        styleApplicator: () => new Promise((resolve) => { release = resolve; })
    });
    let rendered = false;
    router.register('/slow', () => { rendered = true; });

    const slow = router.navigate('/slow');
    await Promise.resolve();
    await router.navigate('/missing');
    release(true);
    await slow;

    assert.equal(rendered, false);
    assert.match(ui.app.innerHTML, /Page not found/);
});

test('leaving a route invokes its teardown exactly once', async () => {
    globalThis.history = fakeHistory();
    const router = new Router();
    let cleanups = 0;
    router.register('/first', () => () => { cleanups += 1; });
    router.register('/second', () => {});

    await router.navigate('/first');
    await router.navigate('/second');

    assert.equal(cleanups, 1);
});

test('route lifecycle aborts listeners and releases timers and media resources', async () => {
    const ui = fakeDocument();
    globalThis.history = fakeHistory();
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    const cleared = [];
    globalThis.setInterval = () => 73;
    globalThis.clearInterval = (id) => cleared.push(id);

    try {
        const router = new Router({ documentRef: ui.document });
        const track = { stopped: 0, stop() { this.stopped += 1; } };
        let signal;
        let customCleanup = 0;
        router.register('/active', (_params, lifecycle) => {
            signal = lifecycle.signal;
            lifecycle.setInterval(() => {}, 1000);
            lifecycle.trackMediaStream({ getTracks: () => [track] });
            lifecycle.onCleanup(() => { customCleanup += 1; });
        });
        router.register('/next', () => {});

        await router.navigate('/active');
        ui.document.body.style.overflow = 'hidden';
        await router.navigate('/next');

        assert.equal(signal.aborted, true);
        assert.deepEqual(cleared, [73]);
        assert.equal(track.stopped, 1);
        assert.equal(customCleanup, 1);
        assert.equal(ui.document.body.style.overflow, '');
    } finally {
        globalThis.setInterval = originalSetInterval;
        globalThis.clearInterval = originalClearInterval;
    }
});

test('popstate restores recorded scroll without writing history', async () => {
    const history = fakeHistory();
    globalThis.history = history;
    const windowRef = fakeWindow('/dashboard');
    const router = new Router({ windowRef });
    router.register('/dashboard', () => {});

    await router.handlePopState({ state: { scroll: [12, 340] } });

    assert.deepEqual(windowRef.scrollCalls.at(-1), [12, 340]);
    assert.equal(history.calls.length, 0);
});
