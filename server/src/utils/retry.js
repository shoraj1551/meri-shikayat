/**
 * Retry Logic Utility
 * TASK-PR-006: Add retry logic for external services
 */

import logger from '../utils/logger.js';

/**
 * Exponential backoff with jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {number} Delay in milliseconds
 */
const calculateBackoff = (attempt, baseDelay = 1000) => {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Add up to 1s jitter
    return Math.min(exponentialDelay + jitter, 30000); // Max 30s
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of successful execution
 */
export const retryWithBackoff = async (fn, options = {}) => {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        onRetry = null,
        shouldRetry = (error) => true
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if we should retry this error
            if (!shouldRetry(error)) {
                throw error;
            }

            // Don't retry if this was the last attempt
            if (attempt === maxRetries) {
                break;
            }

            const delay = calculateBackoff(attempt, baseDelay);

            logger.warn('Retrying after error', {
                attempt: attempt + 1,
                maxRetries,
                delay,
                error: error.message
            });

            // Call retry callback if provided
            if (onRetry) {
                onRetry(attempt + 1, error, delay);
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // All retries exhausted
    logger.error('All retries exhausted', {
        maxRetries,
        error: lastError.message
    });

    throw lastError;
};

/**
 * Retry wrapper for SMS service
 */
export const retrySMS = (fn) => {
    return retryWithBackoff(fn, {
        maxRetries: 3,
        baseDelay: 2000,
        shouldRetry: (error) => {
            // Retry on network errors, not on validation errors
            return error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.response?.status >= 500;
        }
    });
};

/**
 * Retry wrapper for email service
 */
export const retryEmail = (fn) => {
    return retryWithBackoff(fn, {
        maxRetries: 3,
        baseDelay: 2000,
        shouldRetry: (error) => {
            return error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.responseCode >= 500;
        }
    });
};

/**
 * Retry wrapper for ML service
 */
export const retryML = (fn) => {
    return retryWithBackoff(fn, {
        maxRetries: 2,
        baseDelay: 1000,
        shouldRetry: (error) => {
            return error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.response?.status >= 500;
        }
    });
};

export default {
    retryWithBackoff,
    retrySMS,
    retryEmail,
    retryML
};
