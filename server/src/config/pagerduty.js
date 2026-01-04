/**
 * PagerDuty Alerting Configuration
 * TASK-PR-003: Create alerting rules
 */

import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * PagerDuty alert severity levels
 */
export const SEVERITY = {
    CRITICAL: 'critical',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Send alert to PagerDuty
 */
export const sendAlert = async (summary, details, severity = SEVERITY.ERROR) => {
    if (!process.env.PAGERDUTY_INTEGRATION_KEY) {
        logger.warn('PagerDuty not configured - alert not sent', { summary });
        return;
    }

    try {
        const payload = {
            routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
            event_action: 'trigger',
            dedup_key: `${summary}-${Date.now()}`,
            payload: {
                summary,
                severity,
                source: 'meri-shikayat-api',
                timestamp: new Date().toISOString(),
                custom_details: details
            }
        };

        await axios.post('https://events.pagerduty.com/v2/enqueue', payload);

        logger.info('PagerDuty alert sent', { summary, severity });
    } catch (error) {
        logger.error('Failed to send PagerDuty alert', {
            error: error.message,
            summary
        });
    }
};

/**
 * Predefined alert templates
 */
export const alerts = {
    /**
     * High error rate alert
     */
    highErrorRate: (errorRate, threshold = 5) => {
        return sendAlert(
            `High Error Rate: ${errorRate}%`,
            {
                errorRate,
                threshold,
                action: 'Check error logs and recent deployments'
            },
            SEVERITY.CRITICAL
        );
    },

    /**
     * Database connection lost
     */
    databaseConnectionLost: () => {
        return sendAlert(
            'Database Connection Lost',
            {
                database: 'MongoDB',
                action: 'Check MongoDB status and connection string'
            },
            SEVERITY.CRITICAL
        );
    },

    /**
     * High response time
     */
    highResponseTime: (p95, threshold = 2000) => {
        return sendAlert(
            `High Response Time: p95 ${p95}ms`,
            {
                p95,
                threshold,
                action: 'Check slow query log and server resources'
            },
            SEVERITY.WARNING
        );
    },

    /**
     * Redis connection lost
     */
    redisConnectionLost: () => {
        return sendAlert(
            'Redis Connection Lost',
            {
                service: 'Redis',
                impact: 'Rate limiting and caching degraded',
                action: 'Check Redis status'
            },
            SEVERITY.ERROR
        );
    },

    /**
     * Disk space low
     */
    diskSpaceLow: (percentUsed) => {
        return sendAlert(
            `Disk Space Low: ${percentUsed}% used`,
            {
                percentUsed,
                threshold: 85,
                action: 'Clean up logs or increase disk size'
            },
            SEVERITY.WARNING
        );
    },

    /**
     * Memory usage high
     */
    memoryUsageHigh: (percentUsed) => {
        return sendAlert(
            `Memory Usage High: ${percentUsed}%`,
            {
                percentUsed,
                threshold: 90,
                action: 'Check for memory leaks, restart if necessary'
            },
            SEVERITY.WARNING
        );
    }
};

/**
 * Alert monitoring middleware
 */
export const alertMonitoring = () => {
    // Track error rate
    let errorCount = 0;
    let requestCount = 0;

    setInterval(() => {
        if (requestCount > 0) {
            const errorRate = (errorCount / requestCount) * 100;
            if (errorRate > 5) {
                alerts.highErrorRate(errorRate.toFixed(2));
            }
        }
        // Reset counters
        errorCount = 0;
        requestCount = 0;
    }, 5 * 60 * 1000); // Check every 5 minutes

    return (req, res, next) => {
        requestCount++;

        res.on('finish', () => {
            if (res.statusCode >= 500) {
                errorCount++;
            }
        });

        next();
    };
};

export default {
    SEVERITY,
    sendAlert,
    alerts,
    alertMonitoring
};
