import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSocketOrigin } from '../src/js/utils/socket-service.js';

test('socket origin follows relative same-origin API deployments', () => {
    assert.equal(
        resolveSocketOrigin('/api/v1', 'https://complaints.example.gov'),
        'https://complaints.example.gov'
    );
});

test('socket origin follows explicitly configured cross-origin API deployments', () => {
    assert.equal(
        resolveSocketOrigin('https://api.example.gov/api/v1', 'https://complaints.example.gov'),
        'https://api.example.gov'
    );
});

test('invalid or absent API configuration safely falls back to the page origin', () => {
    const pageOrigin = 'https://complaints.example.gov';
    assert.equal(resolveSocketOrigin(undefined, pageOrigin), pageOrigin);
    assert.equal(resolveSocketOrigin('http://[invalid', pageOrigin), pageOrigin);
});
