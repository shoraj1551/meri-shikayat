import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { lazyPage } from '../src/js/app.js';

const read = relative => readFile(new URL(relative, import.meta.url), 'utf8');

test('product screens use persisted APIs or explicit unavailable states instead of mock success data', async () => {
    const [dashboard, contractor, success, social] = await Promise.all([
        read('../src/js/pages/dashboard.js'),
        read('../src/js/pages/contractor-dashboard.js'),
        read('../src/js/pages/success-stories.js'),
        read('../src/js/services/social-media.service.js')
    ]);
    assert.match(dashboard, /storiesService\.getFeed/);
    assert.doesNotMatch(dashboard, /mockFeedData/);
    assert.match(contractor, /\/contractors\/dashboard\/me/);
    assert.match(success, /storiesService\.getImpact/);
    assert.doesNotMatch(success, /5,480|4,100|Rahul Sharma|Priya Singh/);
    assert.match(social, /configured: false/);
    assert.doesNotMatch(social, /mockSocialFeeds|setTimeout|unsplash\.com/);
});

test('production controls complete their advertised action instead of showing placeholders', async () => {
    const [dashboard, adminComplaints, stories, storyService, home, storyController] = await Promise.all([
        read('../src/js/pages/dashboard.js'),
        read('../src/js/pages/admin-complaints.js'),
        read('../src/js/pages/stories-feed.js'),
        read('../src/js/api/stories.service.js'),
        read('../src/js/pages/home.js'),
        read('../../server/src/controllers/stories.controller.js')
    ]);

    for (const source of [dashboard, adminComplaints, stories]) {
        assert.doesNotMatch(source, /coming soon|reload to see|Media Attachment/i);
    }
    assert.match(dashboard, /openComplaintDetails\(complaint\)/);
    assert.match(dashboard, /dialog\.showModal\(\)/);
    assert.match(adminComplaints, /filterStatus/);
    assert.match(adminComplaints, /filteredComplaints/);
    assert.match(stories, /comments-list/);
    assert.match(stories, /appendChild\(item\)/);
    assert.match(stories, /story-media-gallery/);
    assert.match(storyService, /return data/);
    assert.match(storyController, /populate\('media'/);
    assert.match(home, /authorityMark\('municipal'\)/);
    assert.doesNotMatch(home, /logo-placeholder/);
});

test('all complaint entry points resolve to one canonical submission experience', async () => {
    const [app, bottomNav, home, authorities, authorityDetail, routeStyles] = await Promise.all([
        read('../src/js/app.js'),
        read('../src/js/components/BottomNav.js'),
        read('../src/js/pages/home.js'),
        read('../src/js/pages/authorities.js'),
        read('../src/js/pages/authority-detail.js'),
        read('../src/js/route-styles.js')
    ]);

    assert.match(app, /router\.register\('\/submit-complaint', pages\.submitComplaint/);
    assert.match(app, /router\.register\('\/file-complaint', redirectToComplaintForm\)/);
    assert.match(app, /router\.register\('\/register-gateway', redirectToComplaintForm\)/);
    assert.doesNotMatch(app, /renderSubmitComplaintPage|renderComplaintQuickPage|renderRegistrationGatewayPage/);
    for (const source of [bottomNav, home, authorities, authorityDetail]) {
        assert.match(source, /\/submit-complaint/);
    }
    assert.doesNotMatch(bottomNav, /href: '\/file-complaint'/);
    assert.doesNotMatch(routeStyles, /complaintQuick|registrationGateway/);
});

test('page routes are lazy boundaries and failed module downloads can be retried', async () => {
    const [app, vite] = await Promise.all([
        read('../src/js/app.js'),
        read('../vite.config.js')
    ]);
    assert.doesNotMatch(app, /from ['"]\.\/pages\//);
    assert.ok((app.match(/import\(['"]\.\/pages\//g) || []).length >= 35);
    assert.doesNotMatch(vite, /pages-admin|pages-dashboard|pages-other|api-services|return 'components'|return 'utils'/);

    let loads = 0;
    const renderCalls = [];
    const handler = lazyPage(async () => {
        loads += 1;
        return { render: (...args) => renderCalls.push(args) };
    }, 'render');
    await handler('first');
    await handler('second');
    assert.equal(loads, 1);
    assert.deepEqual(renderCalls, [['first'], ['second']]);

    let attempts = 0;
    const retryable = lazyPage(async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('network');
        return { render: () => 'loaded' };
    }, 'render');
    await assert.rejects(retryable(), /network/);
    assert.equal(await retryable(), 'loaded');
    assert.equal(attempts, 2);
});

test('every Vercel target routes HTTP and Socket.IO to the same persistent Render service', async () => {
    for (const file of ['../../vercel.json', '../../vercel.dev.json', '../../vercel.uat.json']) {
        const config = JSON.parse(await read(file));
        const environment = config.build.env;
        assert.equal(environment.VITE_API_URL, 'https://meri-shikayat-api.onrender.com/api/v1');
        assert.equal(environment.VITE_SOCKET_URL, 'https://meri-shikayat-api.onrender.com');
        assert.equal(new URL(environment.VITE_API_URL).origin, new URL(environment.VITE_SOCKET_URL).origin);
        assert.equal(config.functions, undefined);
    }
    const socketSource = await read('../src/js/utils/socket-service.js');
    assert.match(socketSource, /resolveSocketOrigin\(SOCKET_URL/);
});
