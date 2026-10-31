import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
    complaintCategories,
    resolveComplaintCategoryLabel
} from '../../src/config/complaintTaxonomy.js';
import { enrichComplaintWithML } from '../../src/services/complaint-enrichment.service.js';

const expectedNames = [
    'Roads', 'Water Supply', 'Sanitation', 'Electricity', 'Street Lights',
    'Drainage', 'Parks & Gardens', 'Public Transport', 'Other'
];

test('canonical taxonomy covers every seeded category and has unique IDs and aliases', async () => {
    assert.deepEqual(complaintCategories.map(item => item.name), expectedNames);
    assert.equal(new Set(complaintCategories.map(item => item.id)).size, complaintCategories.length);
    for (const category of complaintCategories) {
        assert.equal(resolveComplaintCategoryLabel(category.id), category);
        assert.equal(resolveComplaintCategoryLabel(category.name), category);
        for (const alias of category.aliases) assert.equal(resolveComplaintCategoryLabel(alias), category);
    }

    const seedSource = await readFile(new URL('../../src/scripts/seedCategories.js', import.meta.url), 'utf8');
    assert.match(seedSource, /complaintCategories\.map/);
});

test('legacy ML labels normalize to assignable canonical database categories', async () => {
    const water = await enrichComplaintWithML({ description: 'Water has stopped for the whole neighbourhood' }, {
        categorize: async () => ({ category: 'water', confidence: 0.95, suggestions: ['water', 'drainage'] }),
        sentiment: async () => null
    });
    assert.equal(water.suggestedCategory, 'water_supply');
    assert.equal(water.analysis.category.name, 'water_supply');

    const garbage = await enrichComplaintWithML({ description: 'Garbage is overflowing beside our homes' }, {
        categorize: async () => ({ category: 'garbage', confidence: 0.95, suggestions: ['garbage', 'other'] }),
        sentiment: async () => null
    });
    assert.equal(garbage.suggestedCategory, 'sanitation');
    assert.deepEqual(garbage.analysis.category.suggestions, ['sanitation', 'other']);
});

test('unknown ML labels are recorded for audit but never auto-assigned', async () => {
    const result = await enrichComplaintWithML({ description: 'A long enough complaint description' }, {
        categorize: async () => ({ category: 'invented_label', confidence: 0.99, suggestions: ['invented_label'] }),
        sentiment: async () => null
    });
    assert.equal(result.analysis.category.name, 'invented_label');
    assert.equal(result.suggestedCategory, null);
});
