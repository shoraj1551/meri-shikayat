import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Complaint from '../../src/models/Complaint.js';
import { getImpactStats } from '../../src/controllers/stories.controller.js';

test('public impact statistics are calculated from persisted complaints', async t => {
    const originalCount = Complaint.countDocuments;
    const originalAggregate = Complaint.aggregate;
    Complaint.countDocuments = async query => query?.status === 'resolved' ? 30 : 100;
    Complaint.aggregate = async () => [{ averageDays: 4.24 }];
    t.after(() => {
        Complaint.countDocuments = originalCount;
        Complaint.aggregate = originalAggregate;
    });

    let response;
    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { response = body; return this; }
    };
    await getImpactStats({}, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(response.data, {
        complaintsFiled: 100,
        issuesResolved: 30,
        resolutionRate: 30,
        averageResolutionDays: 4.2
    });
});

test('contractor dashboard is authenticated and reads assignment records for the current User contractor', async () => {
    const routes = await readFile(new URL('../../src/routes/contractors.js', import.meta.url), 'utf8');
    const controller = await readFile(new URL('../../src/controllers/contractorsController.js', import.meta.url), 'utf8');
    const assignment = await readFile(new URL('../../src/models/ContractorAssignment.js', import.meta.url), 'utf8');
    assert.match(routes, /router\.get\('\/dashboard\/me', protect, getMyContractorDashboard\)/);
    assert.match(controller, /ContractorAssignment\.find\(\{ contractor: req\.user\._id \}\)/);
    assert.match(assignment, /ref: 'User'/);
});
