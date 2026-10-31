import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('user and admin dashboards consume canonical complaint status values', async () => {
    const [dashboard, adminComplaints] = await Promise.all([
        readFile(new URL('../src/js/pages/dashboard.js', import.meta.url), 'utf8'),
        readFile(new URL('../src/js/pages/admin-complaints.js', import.meta.url), 'utf8')
    ]);

    for (const status of ['pending', 'in_progress', 'resolved', 'rejected']) {
        assert.match(adminComplaints, new RegExp(`c\\.status === '${status}'`));
        assert.match(adminComplaints, new RegExp(`value="${status}"`));
    }
    assert.doesNotMatch(adminComplaints, /c\.status === '(?:Pending|In Progress|Resolved|Rejected)'/);
    assert.match(dashboard, /c\.status === 'pending' \|\| c\.status === 'in_progress'/);
    assert.match(dashboard, /c\.status === 'resolved'/);
    assert.match(dashboard, /c\.status === 'rejected'/);
});
