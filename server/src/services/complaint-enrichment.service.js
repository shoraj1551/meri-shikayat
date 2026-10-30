import { readFile } from 'node:fs/promises';
import { categorizeComplaint, analyzeSentiment, analyzeImage } from './ml.service.js';

const validPriorities = new Set(['low', 'medium', 'high']);
const finiteNumber = value => Number.isFinite(Number(value)) ? Number(value) : undefined;

export async function enrichComplaintWithML({ description, imagePath, imageMimeType } = {}, {
    categorize = categorizeComplaint,
    sentiment = analyzeSentiment,
    image = analyzeImage,
    loadImage = readFile
} = {}) {
    if (typeof description !== 'string' || !description.trim()) return null;

    const jobs = [categorize(description), sentiment(description)];
    const shouldAnalyzeImage = imagePath && imageMimeType?.startsWith('image/');
    if (shouldAnalyzeImage) jobs.push(loadImage(imagePath).then(buffer => image(buffer)));

    const [categoryResult, sentimentResult, imageResult] = await Promise.allSettled(jobs);
    const category = categoryResult.status === 'fulfilled' ? categoryResult.value : null;
    const tone = sentimentResult.status === 'fulfilled' ? sentimentResult.value : null;
    const imageQuality = imageResult?.status === 'fulfilled' ? imageResult.value : null;

    if (!category && !tone && !imageQuality) return null;

    const analysis = {
        analyzedAt: new Date(),
        category: category ? {
            name: category.category,
            confidence: finiteNumber(category.confidence),
            suggestions: Array.isArray(category.suggestions) ? category.suggestions.slice(0, 3) : []
        } : undefined,
        sentiment: tone ? {
            label: tone.sentiment,
            polarity: finiteNumber(tone.polarity),
            subjectivity: finiteNumber(tone.subjectivity),
            urgency: tone.urgency,
            urgencyScore: finiteNumber(tone.urgency_score),
            emotion: tone.emotion,
            confidence: finiteNumber(tone.confidence)
        } : undefined,
        imageQuality: imageQuality ? {
            valid: imageQuality.valid === true,
            score: finiteNumber(imageQuality.quality_score),
            level: imageQuality.quality_level,
            issues: Array.isArray(imageQuality.issues) ? imageQuality.issues.slice(0, 10) : []
        } : undefined
    };

    const categoryConfidence = finiteNumber(category?.confidence);
    const configuredThreshold = Number(process.env.ML_CATEGORY_CONFIDENCE_THRESHOLD ?? 0.6);
    const categoryThreshold = Number.isFinite(configuredThreshold) ? configuredThreshold : 0.6;

    return {
        analysis,
        suggestedCategory: categoryConfidence >= categoryThreshold ? category?.category || null : null,
        suggestedPriority: validPriorities.has(tone?.urgency) ? tone.urgency : null
    };
}
