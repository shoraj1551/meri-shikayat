import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
