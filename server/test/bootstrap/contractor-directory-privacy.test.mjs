import test from 'node:test';
import assert from 'node:assert/strict';
import Contractor from '../../src/models/Contractor.js';
import ContractorAssignment from '../../src/models/ContractorAssignment.js';
import {
    getAllContractors,
    getContractorById,
    getContractorStatistics
} from '../../src/controllers/contractorsController.js';

const id = '507f1f77bcf86cd799439011';
const sensitiveFields = [
    'registrationNumber', 'gstNumber', 'panNumber', 'primaryContactPerson',
    'email', 'phone', 'alternatePhone', 'address', 'pincode',
    'contractStartDate', 'contractEndDate', 'contractValue', 'certifications',
    'recentJobs'
];

const contractorRecord = {
    _id: id,
    companyName: 'Public Company',
    companyNameHindi: 'Public Hindi Name',
    city: 'Delhi',
    state: 'Delhi',
    specialization: ['maintenance'],
    serviceAreas: ['Central Delhi'],
    establishedYear: 2012,
    totalJobsCompleted: 14,
    avgRating: 4.5,
    isVerified: true,
    registrationNumber: 'SECRET-REG',
    gstNumber: 'SECRET-GST',
    panNumber: 'SECRET-PAN',
    primaryContactPerson: 'Private Person',
    email: 'private@example.test',
    phone: '9999999999',
    address: 'Private street',
    contractValue: 999999,
    certifications: [{ number: 'PRIVATE-CERT' }]
};

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

function assertNoSensitiveData(value) {
    const serialized = JSON.stringify(value);
    for (const field of sensitiveFields) assert.equal(serialized.includes(`"${field}"`), false, field);
    for (const secret of ['SECRET-', 'private@example.test', '9999999999', 'Private street']) {
        assert.equal(serialized.includes(secret), false, secret);
    }
}

test('public contractor list is verified-only and uses an explicit safe projection', async () => {
    const originalFind = Contractor.find;
    let criteria;
    let projection;
    Contractor.find = query => {
        criteria = query;
        return {
            select(value) { projection = value; return this; },
            lean() { return this; },
            async sort() { return [contractorRecord]; }
        };
    };

    try {
        const res = responseRecorder();
        await getAllContractors({ query: {} }, res);
        assert.deepEqual(criteria, { isActive: true, isVerified: true, status: 'active' });
        assert.match(projection, /companyName/);
        for (const field of sensitiveFields) assert.equal(projection.includes(field), false, field);
        assertNoSensitiveData(res.body);
        assert.equal(res.body.data[0].companyName, 'Public Company');
    } finally {
        Contractor.find = originalFind;
    }
});

test('public contractor detail is verified-only and omits identity, contact, contract and job data', async () => {
    const originalFindOne = Contractor.findOne;
    const originalAssignmentFind = ContractorAssignment.find;
    let criteria;
    Contractor.findOne = query => {
        criteria = query;
        return {
            select() { return this; },
            async lean() { return contractorRecord; }
        };
    };
    ContractorAssignment.find = async () => [];

    try {
        const res = responseRecorder();
        await getContractorById({ params: { id } }, res);
        assert.deepEqual(criteria, { _id: id, isActive: true, isVerified: true, status: 'active' });
        assert.equal(res.statusCode, 200);
        assertNoSensitiveData(res.body);
        assert.deepEqual(res.body.data.performance, {
            totalJobsCompleted: 14,
            avgRating: 4.5,
            onTimeCompletion: '0%'
        });
    } finally {
        Contractor.findOne = originalFindOne;
        ContractorAssignment.find = originalAssignmentFind;
    }
});

test('public detail and statistics return the same 404 for invalid or non-public IDs', async () => {
    const invalidDetail = responseRecorder();
    await getContractorById({ params: { id: 'not-an-object-id' } }, invalidDetail);
    assert.equal(invalidDetail.statusCode, 404);

    const invalidStats = responseRecorder();
    await getContractorStatistics({ params: { id: 'not-an-object-id' } }, invalidStats);
    assert.deepEqual(invalidStats.body, { success: false, message: 'Contractor not found' });

    const originalFindOne = Contractor.findOne;
    Contractor.findOne = () => ({ select() { return this; }, async lean() { return null; } });
    try {
        const hidden = responseRecorder();
        await getContractorById({ params: { id } }, hidden);
        assert.equal(hidden.statusCode, 404);
        assert.deepEqual(hidden.body, { success: false, message: 'Contractor not found' });
    } finally {
        Contractor.findOne = originalFindOne;
    }
});
