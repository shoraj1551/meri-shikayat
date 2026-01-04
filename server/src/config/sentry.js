/**
 * Sentry Error Tracking Integration
 * TASK-009: Implement comprehensive error tracking and monitoring
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import logger from '../utils/logger.js';

/**
 * Initialize Sentry error tracking
 */
export const initializeSentry = (app) => {
    // Only initialize in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && process.env.SENTRY_ENABLED !== 'true') {
        logger.info('Sentry disabled in development mode');
        return;
    }

    if (!process.env.SENTRY_DSN) {
        logger.warn('SENTRY_DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.npm_package_version || '1.0.5',

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

        // Profiling
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
            new ProfilingIntegration(),
        ],

        // Filter sensitive data
        beforeSend(event, hint) {
            // Remove sensitive data from error reports
            if (event.request) {
                // Remove authorization headers
                if (event.request.headers) {
                    delete event.request.headers.authorization;
                    delete event.request.headers.cookie;
                }

                // Remove sensitive query parameters
                if (event.request.query_string) {
                    event.request.query_string = event.request.query_string
                        .replace(/password=[^&]*/gi, 'password=[REDACTED]')
                        .replace(/token=[^&]*/gi, 'token=[REDACTED]')
                        .replace(/api_key=[^&]*/gi, 'api_key=[REDACTED]');
                }

                // Remove sensitive body data
                if (event.request.data) {
                    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'otp'];
                    for (const field of sensitiveFields) {
                        if (event.request.data[field]) {
                            event.request.data[field] = '[REDACTED]';
                        }
                    }
                }
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser errors
            'Non-Error promise rejection captured',
            // Network errors
            'Network request failed',
            'NetworkError',
            // Validation errors (handled by application)
            'ValidationError',
            'Validation failed'
        ]
    });

    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    logger.info('Sentry error tracking initialized', {
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version
    });
};

/**
 * Sentry error handler middleware (must be added after routes)
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
        // Capture all errors with status code >= 500
        if (error.status >= 500) {
            return true;
        }
        // Also capture specific error types
        if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
            return true;
        }
        return false;
    }
});

/**
 * Capture exception manually
 */
export const captureException = (error, context = {}) => {
    Sentry.captureException(error, {
        tags: context.tags || {},
        extra: context.extra || {},
        user: context.user || {},
        level: context.level || 'error'
    });
};

/**
 * Capture message manually
 */
export const captureMessage = (message, level = 'info', context = {}) => {
    Sentry.captureMessage(message, {
        level,
        tags: context.tags || {},
        extra: context.extra || {}
    });
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user) => {
    if (user) {
        Sentry.setUser({
            id: user.id || user._id?.toString(),
            email: user.email,
            username: user.username,
            role: user.role
        });
    } else {
        Sentry.setUser(null);
    }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, category = 'custom', level = 'info', data = {}) => {
    Sentry.addBreadcrumb({
        message,
        category,
        level,
        data
    });
};

export default {
    initializeSentry,
    sentryErrorHandler,
    captureException,
    captureMessage,
    setUserContext,
    addBreadcrumb
};
