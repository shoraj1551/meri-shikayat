import { it } from 'node:test';
import assert from 'node:assert/strict';
import { integrationHarness } from '../../../test/harness/integration.mjs';
import { api, registration } from '../../../test/harness/fixtures.mjs';
const context = integrationHarness(import.meta.url);
async function register() {
    const data = registration();
    const response = await api(context, 'post', '/auth/register').send(data).expect(201);
    return { data, token: response.body.token, id: response.body.data.id };
}
it('registers a user and returns the current top-level token/data contract', async () => {
    const user = await register();
    assert.ok(user.id);
    assert.equal(user.token.split('.').length, 3);
});
it('rejects invalid registration with structured field errors', async () => {
    const response = await api(context, 'post', '/auth/register').send({ firstName: 'J', email: 'invalid', password: 'weak' }).expect(400);
    assert.equal(response.body.success, false);
    assert.ok(Array.isArray(response.body.errors));
});
it('prevents duplicate email registration', async () => {
    const { data } = await register();
    await api(context, 'post', '/auth/register').send(data).expect(400);
});
it('rejects HTML in names under the mounted registration validator', async () => {
    const response = await api(context, 'post', '/auth/register')
        .send(registration({ firstName: '<script>alert("xss")</script>John' })).expect(400);
    assert.ok(response.body.errors.some(error => error.field === 'firstName'));
});
it('logs in with the identifier field and returns a usable API token', async () => {
    const { data } = await register();
    const response = await api(context, 'post', '/auth/login').send({ identifier: data.email, password: data.password }).expect(200);
    assert.equal(response.body.data.email, data.email);
    assert.equal(typeof response.body.token, 'string');
    assert.equal(response.body.data.password, undefined);
    await api(context, 'get', '/auth/me').set('Authorization', 'Bearer ' + response.body.token).expect(200);
});
it('rejects an invalid password', async () => {
    const { data } = await register();
    await api(context, 'post', '/auth/login').send({ identifier: data.email, password: 'Wrong@1234' }).expect(401);
});
it('enforces the real five-failure login limit without mocking middleware', async () => {
    for (let i = 0; i < 5; i++) {
        await api(context, 'post', '/auth/login').send({ identifier: 'unknown@example.com', password: 'Wrong@1234' }).expect(401);
    }
    await api(context, 'post', '/auth/login').send({ identifier: 'unknown@example.com', password: 'Wrong@1234' }).expect(429);
});
it('gets the authenticated user at /auth/me, not the nonexistent /auth/profile', async () => {
    const { token, data } = await register();
    const response = await api(context, 'get', '/auth/me').set('Authorization', 'Bearer ' + token).expect(200);
    assert.equal(response.body.data.email, data.email);
    assert.equal(response.body.data.password, undefined);
});
it('rejects a missing bearer token', async () => {
    await api(context, 'get', '/auth/me').expect(401);
});
it('rejects an invalid bearer token', async () => {
    await api(context, 'get', '/auth/me').set('Authorization', 'Bearer invalid').expect(401);
});
