import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { circuitBreakers } from '../../src/utils/circuitBreaker.js';

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

test('ML client sends text and image requests to the configured service', async t => {
    const requests = [];
    const server = http.createServer((req, res) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            requests.push({ url: req.url, type: req.headers['content-type'], body: Buffer.concat(chunks) });
            res.setHeader('content-type', 'application/json');
            if (req.url.endsWith('/categorize')) {
                res.end(JSON.stringify({ category: 'roads', confidence: 0.9, suggestions: ['roads'] }));
            } else if (req.url.endsWith('/sentiment')) {
                res.end(JSON.stringify({ sentiment: 'negative', urgency: 'high', urgency_score: 0.9 }));
            } else {
                res.end(JSON.stringify({ valid: true, quality_score: 0.8, quality_level: 'good', issues: [] }));
            }
        });
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => server.close());

    process.env.ML_SERVICE_ENABLED = 'true';
    process.env.ML_SERVICE_URL = `http://127.0.0.1:${server.address().port}`;
    t.after(() => {
        delete process.env.ML_SERVICE_ENABLED;
        delete process.env.ML_SERVICE_URL;
    });
    const ml = await import(`../../src/services/ml.service.js?client-test=${Date.now()}`);

    assert.equal((await ml.categorizeComplaint('Dangerous broken road')).category, 'roads');
    assert.equal((await ml.analyzeSentiment('This is urgent')).urgency, 'high');
    assert.equal((await ml.analyzeImage(Buffer.from('image-bytes'))).quality_level, 'good');

    assert.deepEqual(requests.map(request => request.url), [
        '/api/ml/categorize', '/api/ml/sentiment', '/api/ml/analyze-image'
    ]);
    assert.match(requests[0].type, /application\/json/);
    assert.match(requests[2].type, /multipart\/form-data; boundary=/);
    assert.match(requests[2].body.toString('latin1'), /filename="image.jpg"/);
});

test('ML client fails fast when the shared concurrency limit is saturated', async t => {
    let requestCount = 0;
    const server = http.createServer(async (req, res) => {
        requestCount += 1;
        await delay(150);
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ category: 'roads', confidence: 0.9, suggestions: ['roads'] }));
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => server.close());

    circuitBreakers.ml.reset();
    process.env.ML_SERVICE_ENABLED = 'true';
    process.env.ML_SERVICE_URL = `http://127.0.0.1:${server.address().port}`;
    process.env.ML_MAX_CONCURRENCY = '1';
    t.after(() => {
        delete process.env.ML_SERVICE_ENABLED;
        delete process.env.ML_SERVICE_URL;
        delete process.env.ML_MAX_CONCURRENCY;
        circuitBreakers.ml.reset();
    });
    const ml = await import(`../../src/services/ml.service.js?concurrency-test=${Date.now()}`);

    const first = ml.categorizeComplaint('First complaint');
    await delay(30);
    const second = await ml.analyzeSentiment('Second complaint');

    assert.equal(second, null);
    assert.equal(ml.getMLClientState().concurrency.rejected, 1);
    assert.equal(requestCount, 1);
    await first;
    assert.equal(ml.getMLClientState().concurrency.active, 0);
    assert.equal(circuitBreakers.ml.getState().failureCount, 0);
});

test('ML failures open the circuit and later requests do not reach the service', async t => {
    let requestCount = 0;
    const server = http.createServer((req, res) => {
        requestCount += 1;
        res.statusCode = 503;
        res.end('unavailable');
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => server.close());

    circuitBreakers.ml.reset();
    process.env.ML_SERVICE_ENABLED = 'true';
    process.env.ML_SERVICE_URL = `http://127.0.0.1:${server.address().port}`;
    t.after(() => {
        delete process.env.ML_SERVICE_ENABLED;
        delete process.env.ML_SERVICE_URL;
        circuitBreakers.ml.reset();
    });
    const ml = await import(`../../src/services/ml.service.js?breaker-test=${Date.now()}`);

    for (let attempt = 0; attempt < 5; attempt += 1) {
        assert.equal(await ml.categorizeComplaint('Broken road'), null);
    }
    assert.equal(ml.getMLClientState().circuitBreaker.state, 'OPEN');
    assert.equal(requestCount, 5);

    assert.equal(await ml.categorizeComplaint('This request must be rejected'), null);
    assert.equal(requestCount, 5);
    assert.equal(ml.getMLClientState().concurrency.active, 0);
});

test('timed-out ML work releases its concurrency slot', async t => {
    const server = http.createServer(() => {});
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => {
        server.closeAllConnections();
        server.close();
    });

    circuitBreakers.ml.reset();
    process.env.ML_SERVICE_ENABLED = 'true';
    process.env.ML_SERVICE_URL = `http://127.0.0.1:${server.address().port}`;
    process.env.ML_MAX_CONCURRENCY = '1';
    process.env.ML_TEXT_TIMEOUT_MS = '100';
    t.after(() => {
        delete process.env.ML_SERVICE_ENABLED;
        delete process.env.ML_SERVICE_URL;
        delete process.env.ML_MAX_CONCURRENCY;
        delete process.env.ML_TEXT_TIMEOUT_MS;
        circuitBreakers.ml.reset();
    });
    const ml = await import(`../../src/services/ml.service.js?timeout-test=${Date.now()}`);

    assert.equal(await ml.categorizeComplaint('Slow request'), null);
    assert.equal(ml.getMLClientState().concurrency.active, 0);
    assert.equal(ml.getMLClientState().circuitBreaker.failureCount, 1);
});
