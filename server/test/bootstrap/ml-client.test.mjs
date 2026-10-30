import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';

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
