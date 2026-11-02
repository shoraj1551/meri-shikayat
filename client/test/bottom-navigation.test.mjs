import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    getNavigationIdentity,
    isNavigationItemActive,
    shouldShowBottomNavigation
} from '../src/js/components/BottomNav.js';
import { Router } from '../src/js/router.js';

const clientRoot = fileURLToPath(new URL('..', import.meta.url));
const storage = (values = {}) => ({ getItem: (key) => values[key] ?? null });

test('bottom navigation is hidden for anonymous, administrator, and contractor identities', () => {
    assert.equal(getNavigationIdentity(storage()), 'anonymous');
    assert.equal(shouldShowBottomNavigation('/', storage()), false);

    const admin = storage({ token: 'user-token', adminToken: 'admin-token' });
    assert.equal(getNavigationIdentity(admin), 'admin');
    assert.equal(shouldShowBottomNavigation('/admin/dashboard', admin), false);

    const unifiedAdmin = storage({ token: 'token', user: JSON.stringify({ userType: 'admin' }) });
    assert.equal(getNavigationIdentity(unifiedAdmin), 'admin');
    assert.equal(shouldShowBottomNavigation('/dashboard', unifiedAdmin), false);

    const contractor = storage({ token: 'token', user: JSON.stringify({ userType: 'contractor' }) });
    assert.equal(getNavigationIdentity(contractor), 'contractor');
    assert.equal(shouldShowBottomNavigation('/contractor/dashboard', contractor), false);
});

test('authenticated citizen navigation is hidden on focused authentication and setup routes', () => {
    const citizen = storage({ token: 'token', user: JSON.stringify({ userType: 'general_user' }) });
    assert.equal(shouldShowBottomNavigation('/dashboard', citizen), true);
    assert.equal(shouldShowBottomNavigation('/login', citizen), false);
    assert.equal(shouldShowBottomNavigation('/register/step-2', citizen), false);
    assert.equal(shouldShowBottomNavigation('/forgot-password-reset', citizen), false);
    assert.equal(shouldShowBottomNavigation('/admin/complaints', citizen), false);
});

test('active matching supports nested routes and grouped community screens', () => {
    assert.equal(isNavigationItemActive('/dashboard/complaints', ['/dashboard']), true);
    assert.equal(isNavigationItemActive('/messages/thread-1', ['/community', '/messages', '/stories']), true);
    assert.equal(isNavigationItemActive('/profile', ['/']), false);
    assert.equal(isNavigationItemActive('/', ['/']), true);
});

test('navigation markup uses semantic, accessible, dependency-free icons', async () => {
    const source = await readFile(`${clientRoot}/src/js/components/BottomNav.js`, 'utf8');
    assert.match(source, /createElement\('nav'\)/);
    assert.match(source, /aria-label', 'Primary mobile navigation'/);
    assert.match(source, /aria-current="page"/);
    assert.match(source, /aria-label="\$\{item\.label\}"/);
    assert.match(source, /<svg\b/);
    assert.doesNotMatch(source, /\bfas\s+fa-/);
});

test('router subscribers receive successful programmatic navigation', async () => {
    const received = [];
    const router = new Router();
    const unsubscribe = router.subscribe((path) => received.push(path));
    router.register('/community', () => {});
    globalThis.history = { pushState() {} };

    await router.navigate('/community');
    unsubscribe();
    await router.navigate('/community');

    assert.deepEqual(received, ['/community']);
});
