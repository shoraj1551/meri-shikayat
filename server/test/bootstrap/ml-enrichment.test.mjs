import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichComplaintWithML } from '../../src/services/complaint-enrichment.service.js';

test('ML enrichment combines category, urgency and image quality for complaint triage', async () => {
    const result = await enrichComplaintWithML({
        description: 'Dangerous broken road needs urgent repair',
        imagePath: 'evidence.jpg',
        imageMimeType: 'image/jpeg'
    }, {
        categorize: async () => ({ category: 'roads', confidence: 0.91, suggestions: ['roads', 'drainage'] }),
        sentiment: async () => ({
            sentiment: 'negative', polarity: -0.7, subjectivity: 0.8,
            urgency: 'high', urgency_score: 0.95, emotion: 'angry', confidence: 0.75
        }),
        loadImage: async path => Buffer.from(path),
        image: async buffer => ({
            valid: true, quality_score: 0.82, quality_level: 'good', issues: [],
            received: buffer.toString()
        })
    });

    assert.equal(result.suggestedCategory, 'roads');
    assert.equal(result.suggestedPriority, 'high');
    assert.equal(result.analysis.category.confidence, 0.91);
    assert.equal(result.analysis.sentiment.urgencyScore, 0.95);
    assert.equal(result.analysis.imageQuality.level, 'good');
    assert.ok(result.analysis.analyzedAt instanceof Date);
});

test('ML enrichment is failure-safe and preserves partial results', async () => {
    const result = await enrichComplaintWithML({ description: 'Water supply is unavailable' }, {
        categorize: async () => { throw new Error('categorizer offline'); },
        sentiment: async () => ({ sentiment: 'neutral', urgency: 'medium', urgency_score: 0.6 }),
        image: async () => null
    });
    assert.equal(result.suggestedCategory, null);
    assert.equal(result.suggestedPriority, 'medium');
    assert.equal(result.analysis.category, undefined);
    assert.equal(result.analysis.sentiment.label, 'neutral');
});

test('ML enrichment returns null when disabled clients return no analysis', async () => {
    const result = await enrichComplaintWithML({ description: 'A valid complaint description' }, {
        categorize: async () => null,
        sentiment: async () => null,
        image: async () => null
    });
    assert.equal(result, null);
});

test('low-confidence ML categories are recorded but not auto-assigned', async () => {
    const result = await enrichComplaintWithML({ description: 'Unclear local issue' }, {
        categorize: async () => ({ category: 'roads', confidence: 0.25, suggestions: ['roads'] }),
        sentiment: async () => null,
        image: async () => null
    });
    assert.equal(result.suggestedCategory, null);
    assert.equal(result.analysis.category.name, 'roads');
    assert.equal(result.analysis.category.confidence, 0.25);
});

test('non-image attachments are not sent to image analysis', async () => {
    let imageCalls = 0;
    await enrichComplaintWithML({
        description: 'A valid complaint description', imagePath: 'evidence.mp4', imageMimeType: 'video/mp4'
    }, {
        categorize: async () => ({ category: 'other', confidence: 0.2, suggestions: [] }),
        sentiment: async () => null,
        loadImage: async () => { throw new Error('must not read non-images'); },
        image: async () => { imageCalls++; }
    });
    assert.equal(imageCalls, 0);
});
