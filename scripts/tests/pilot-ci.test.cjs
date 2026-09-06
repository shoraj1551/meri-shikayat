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
    assert.ok(workflow.jobs['container-build'].steps.some(step => step.run === 'node scripts/test-api-container.mjs'));
    assert.doesNotMatch(source, /docker\/login-action|docker\/build-push-action|DOCKER_PASSWORD/);
    assert.equal(workflow.jobs['deploy-staging'], undefined);
    assert.equal(workflow.jobs['deploy-production'], undefined);
});
