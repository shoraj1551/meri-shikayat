/**
 * ML Service Client
 * Communicates with Python ML microservices
 */

import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_ENABLED = process.env.ML_SERVICE_ENABLED === 'true';

/**
 * Auto-categorize complaint description
 */
export async function categorizeComplaint(description) {
    if (!ML_SERVICE_ENABLED) {
        return null;
    }

    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/categorize`,
            { description },
            { timeout: 5000 }
        );
        return response.data;
    } catch (error) {
        console.error('ML categorization failed:', error.message);
        return null;
    }
}

/**
 * Analyze sentiment and urgency
 */
export async function analyzeSentiment(text) {
    if (!ML_SERVICE_ENABLED) {
        return null;
    }

    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/sentiment`,
            { text },
            { timeout: 5000 }
        );
        return response.data;
    } catch (error) {
        console.error('ML sentiment analysis failed:', error.message);
        return null;
    }
}

/**
 * Analyze image quality
 */
export async function analyzeImage(imageBuffer) {
    if (!ML_SERVICE_ENABLED) {
        return null;
    }

    try {
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('file', imageBuffer, { filename: 'image.jpg' });

        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/analyze-image`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 10000
            }
        );
        return response.data;
    } catch (error) {
        console.error('ML image analysis failed:', error.message);
        return null;
    }
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
    checkMLServiceHealth
};
