/**
 * CloudWatch Logging Integration
 * TASK-PR-002: Implement centralized logging
 */

import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

/**
 * Create CloudWatch transport
 */
export const createCloudWatchTransport = () => {
    if (process.env.CLOUDWATCH_ENABLED !== 'true') {
        return null;
    }

    if (!process.env.AWS_REGION || !process.env.CLOUDWATCH_LOG_GROUP) {
        console.warn('CloudWatch not configured - skipping');
        return null;
    }

    return new WinstonCloudWatch({
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP || '/meri-shikayat/api',
        logStreamName: () => {
            const date = new Date().toISOString().split('T')[0];
            return `${process.env.NODE_ENV}-${date}-${process.env.HOSTNAME || 'unknown'}`;
        },
        awsRegion: process.env.AWS_REGION,
        messageFormatter: ({ level, message, ...meta }) => {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                level,
                message,
                ...meta
            });
        },
        retentionInDays: 30,
        uploadRate: 2000, // Send logs every 2 seconds
        errorHandler: (error) => {
            console.error('CloudWatch logging error:', error);
        }
    });
};

/**
 * Enhanced logger with CloudWatch
 */
export const createProductionLogger = () => {
    const transports = [
        // Console transport (always enabled)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                })
            )
        }),

        // File transports
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10485760,
            maxFiles: 5
        })
    ];

    // Add CloudWatch transport if enabled
    const cloudWatchTransport = createCloudWatchTransport();
    if (cloudWatchTransport) {
        transports.push(cloudWatchTransport);
        console.log('✅ CloudWatch logging enabled');
    }

    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        ),
        transports,
        // Don't exit on error
        exitOnError: false
    });
};

export default {
    createCloudWatchTransport,
    createProductionLogger
};
