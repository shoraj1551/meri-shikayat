/**
 * ML Service Client
 * Communicates with Python ML microservices
 */

import axios from 'axios';
import logger from '../utils/logger.js';
import { circuitBreakers } from '../utils/circuitBreaker.js';
import { ConcurrencyLimiter } from '../utils/concurrencyLimiter.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_ENABLED = process.env.ML_SERVICE_ENABLED === 'true';
const boundedInteger = (value, fallback, minimum, maximum) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};
const ML_MAX_CONCURRENCY = boundedInteger(process.env.ML_MAX_CONCURRENCY, 4, 1, 100);
// Keep transport deadlines below the ML circuit breaker's 15-second deadline so
// capacity is never released while an underlying request is still running.
const ML_TEXT_TIMEOUT_MS = boundedInteger(process.env.ML_TEXT_TIMEOUT_MS, 5000, 100, 14000);
const ML_IMAGE_TIMEOUT_MS = boundedInteger(process.env.ML_IMAGE_TIMEOUT_MS, 10000, 100, 14000);
const mlConcurrency = new ConcurrencyLimiter(ML_MAX_CONCURRENCY);

async function runOptionalML(operation, request) {
    if (!ML_SERVICE_ENABLED) return null;

    const release = mlConcurrency.tryAcquire();
    if (!release) {
        logger.warn('ML enrichment skipped because concurrency limit is saturated', {
            operation,
            ...mlConcurrency.getState()
        });
        return null;
    }

    try {
        return await circuitBreakers.ml.execute(request);
    } catch (error) {
        logger.warn('Optional ML enrichment failed', {
            operation,
            message: error.message,
            circuitState: circuitBreakers.ml.getState().state
        });
        return null;
    } finally {
        release();
    }
}

/**
 * Auto-categorize complaint description
 */
export async function categorizeComplaint(description) {
    return runOptionalML('categorization', async () => {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/categorize`,
            { description },
            { timeout: ML_TEXT_TIMEOUT_MS }
        );
        return response.data;
    });
}

/**
 * Analyze sentiment and urgency
 */
export async function analyzeSentiment(text) {
    return runOptionalML('sentiment', async () => {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/sentiment`,
            { text },
            { timeout: ML_TEXT_TIMEOUT_MS }
        );
        return response.data;
    });
}

/**
 * Analyze image quality
 */
export async function analyzeImage(imageBuffer) {
    return runOptionalML('image-analysis', async () => {
        const formData = new FormData();
        formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'image.jpg');

        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/analyze-image`,
            formData,
            {
                timeout: ML_IMAGE_TIMEOUT_MS
            }
        );
        return response.data;
    });
}

export function getMLClientState() {
    return {
        enabled: ML_SERVICE_ENABLED,
        concurrency: mlConcurrency.getState(),
        circuitBreaker: circuitBreakers.ml.getState()
    };
}

/**
 * Check ML service health
 */
export async function checkMLServiceHealth() {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
        return response.data;
    } catch (error) {
        return { status: 'unavailable', error: error.message };
    }
}

export default {
    categorizeComplaint,
    analyzeSentiment,
    analyzeImage,
    getMLClientState,
    checkMLServiceHealth
};
