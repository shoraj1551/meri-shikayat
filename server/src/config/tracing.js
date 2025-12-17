/**
 * Distributed Tracing with OpenTelemetry
 * TASK-015: Implement request tracing across services
 */

import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import logger from '../utils/logger.js';

/**
 * Initialize OpenTelemetry tracing
 */
export const initializeTracing = () => {
    if (process.env.TRACING_ENABLED !== 'true') {
        logger.info('Distributed tracing disabled');
        return;
    }

    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: 'meri-shikayat-api',
            [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.5',
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
        })
    });

    // Configure exporter (Jaeger or Console)
    const exporter = process.env.JAEGER_ENDPOINT
        ? new JaegerExporter({
            endpoint: process.env.JAEGER_ENDPOINT,
            serviceName: 'meri-shikayat-api'
        })
        : new ConsoleSpanExporter();

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    // Auto-instrument HTTP, Express, MongoDB
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation()
        ]
    });

    logger.info('Distributed tracing initialized', {
        exporter: process.env.JAEGER_ENDPOINT ? 'Jaeger' : 'Console'
    });
};

export default { initializeTracing };
