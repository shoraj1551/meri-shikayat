const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const yaml = require('js-yaml');

test('pilot CI retains quality gates without Docker Hub publishing or placeholder deployments', () => {
    const source = readFileSync(resolve(__dirname, '../../.github/workflows/ci-cd.yml'), 'utf8');
    const workflow = yaml.load(source);
    for (const job of ['installation', 'container-build', 'test']) assert.ok(workflow.jobs[job]);
    assert.deepEqual(workflow.jobs.installation.strategy.matrix.os, ['ubuntu-latest', 'windows-latest']);
    assert.ok(workflow.jobs.test.services.mongodb);
    assert.ok(workflow.jobs.test.services.redis);
    assert.equal(workflow.jobs.lint['continue-on-error'], undefined);
    assert.equal(workflow.jobs['security-scan']['continue-on-error'], undefined);
    assert.ok(workflow.jobs.installation.steps.some(step => step.run === 'npm test --workspace client'));
    assert.ok(workflow.jobs.lint.steps.some(step => step.run === 'npm run lint --workspace server'));
    assert.ok(workflow.jobs['security-scan'].steps.some(step => step.run === 'npm audit --omit=dev --audit-level=high'));
    assert.doesNotMatch(source, /continue-on-error:\s*true/);
    assert.ok(workflow.jobs['container-build'].steps.some(step => step.run === 'node scripts/test-api-container.mjs'));
    assert.doesNotMatch(source, /docker\/login-action|docker\/build-push-action|DOCKER_PASSWORD/);
    assert.equal(workflow.jobs['deploy-staging'], undefined);
    assert.equal(workflow.jobs['deploy-production'], undefined);
});

test('Vercel serves only the SPA while the persistent Render service owns API and sockets', () => {
    const profiles = ['vercel.json', 'vercel.dev.json', 'vercel.uat.json'];

    for (const profile of profiles) {
        const config = JSON.parse(readFileSync(resolve(__dirname, '../..', profile), 'utf8'));
        assert.equal(config.buildCommand, 'npm run build-client');
        assert.equal(config.outputDirectory, 'client/dist');
        assert.equal(config.builds, undefined);
        assert.equal(config.routes, undefined);
        assert.equal(config.build.env.VITE_API_URL, 'https://meri-shikayat-api.onrender.com/api/v1');
        assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
    }

    const render = yaml.load(readFileSync(resolve(__dirname, '../../render.yaml'), 'utf8'));
    const api = render.services.find(service => service.name === 'meri-shikayat-api');
    assert.ok(api);
    assert.equal(api.type, 'web');
    assert.equal(api.healthCheckPath, '/api/v1/health/ready');
    assert.match(api.envVars.find(entry => entry.key === 'CORS_ORIGIN').value, /meri-shikayat-prod\.vercel\.app/);
});
