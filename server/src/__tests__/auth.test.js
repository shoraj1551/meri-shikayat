import { it } from 'node:test';
import assert from 'node:assert/strict';
import { integrationHarness } from '../../test/harness/integration.mjs';
import { api, registration } from '../../test/harness/fixtures.mjs';
import User from '../models/User.js';
const context = integrationHarness(import.meta.url);

it('registers through the real versioned app and never returns a password', async () => {
    const data = registration();
    const response = await api(context, 'post', '/auth/register').send(data).expect(201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.email, data.email);
    assert.equal(response.body.data.firstName, data.firstName);
    assert.equal(typeof response.body.token, 'string');
    assert.equal(response.body.data.password, undefined);
    const stored = await User.findById(response.body.data.id).select('+password');
    assert.notEqual(stored.password, data.password);
    assert.equal(await stored.comparePassword(data.password), true);
});
it('rejects duplicate registration', async () => {
    const data = registration();
    await api(context, 'post', '/auth/register').send(data).expect(201);
    const response = await api(context, 'post', '/auth/register').send(data).expect(400);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /already exists/);
});
it('rejects an unknown login identity', async () => {
    await api(context, 'post', '/auth/login').send({ identifier: 'missing@example.com', password: 'Wrong@1234' }).expect(401);
});
it('rejects the wrong password for an existing identity', async () => {
    const data = registration();
    await api(context, 'post', '/auth/register').send(data).expect(201);
    const response = await api(context, 'post', '/auth/login').send({ identifier: data.email, password: 'Wrong@1234' }).expect(401);
    assert.equal(response.body.message, 'Invalid credentials');
});
