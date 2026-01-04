/**
 * DataDog APM Integration
 * TASK-PR-001: Set up DataDog monitoring
 */

import tracer from 'dd-trace';
import logger from '../utils/logger.js';

/**
 * Initialize DataDog APM
 */
export const initializeDataDog = () => {
    if (process.env.DD_ENABLED !== 'true') {
        logger.info('DataDog APM disabled');
        return;
    }

    if (!process.env.DD_API_KEY) {
        logger.warn('DD_API_KEY not set - DataDog monitoring disabled');
        return;
    }

    tracer.init({
        service: process.env.DD_SERVICE || 'meri-shikayat-api',
        env: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.5',
        hostname: process.env.DD_AGENT_HOST || 'localhost',
        port: process.env.DD_TRACE_AGENT_PORT || 8126,

        // Sampling
        sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Profiling
        profiling: true,
        runtimeMetrics: true,

        // Logging
        logInjection: true,

        // Tags
        tags: {
            'team': 'backend',
            'component': 'api',
            'deployment': process.env.DEPLOYMENT_ENV || 'unknown'
        }
    });

    logger.info('DataDog APM initialized', {
        service: process.env.DD_SERVICE,
        env: process.env.NODE_ENV,
        version: process.env.npm_package_version
    });
};

/**
 * Custom metric tracking
 */
export const trackMetric = (name, value, tags = {}) => {
    if (process.env.DD_ENABLED !== 'true') return;

    const dogstatsd = tracer.dogstatsd;
    dogstatsd.gauge(name, value, tags);
};

/**
 * Track business metrics
 */
export const trackBusinessMetrics = {
    complaintCreated: (category) => {
        trackMetric('complaints.created', 1, { category });
    },

    userRegistered: (method) => {
        trackMetric('users.registered', 1, { method });
    },

    otpSent: (channel) => {
        trackMetric('otp.sent', 1, { channel });
    },

    loginAttempt: (success) => {
        trackMetric('auth.login', 1, { success: success.toString() });
    }
};

export default {
    initializeDataDog,
    trackMetric,
    trackBusinessMetrics
};
