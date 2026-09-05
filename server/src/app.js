import express from 'express';
import cors from 'cors';
import { resolve } from 'node:path';

export function createCorsOptions(originList = process.env.CORS_ORIGIN) {
    const allowed = originList
        ? originList.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173', 'http://localhost:4176'];
    return {
        origin(origin, callback) {
            callback(!origin || allowed.includes(origin) ? null : new Error('Not allowed by CORS'),
                !origin || allowed.includes(origin));
        },
        credentials: true,
        optionsSuccessStatus: 200
    };
}

// No listeners, process handlers or dependency connections are created on import.
// Await the factory; supply adapters to exercise the same app with isolated services.
export async function createApp({
    database,
    redis,
    redisRequired = process.env.REDIS_REQUIRED === 'true',
    isDraining = () => false,
    routes,
    corsOptions = createCorsOptions(),
    uploadsPath = resolve('uploads')
} = {}) {
    database ??= (await import('./runtime/dependencies.js')).databaseAdapter;
    redis ??= (await import('./runtime/dependencies.js')).redisAdapter;
    const { securityHeaders, mongoSanitization, createGlobalRateLimiter } = await import('./middleware/security.js');
    const { errorHandler, notFoundHandler } = await import('./middleware/errorHandler.js');
    const app = express();
    app.disable('x-powered-by');
    app.use(cors(corsOptions));
    app.use(securityHeaders);

    const live = (req, res) => {
        res.set('Cache-Control', 'no-store').json({ status: 'OK', service: 'meri-shikayat-api' });
    };
    app.get('/api/v1/health', live);
    app.get('/api/v1/health/live', live);
    app.get('/api/health', (req, res) => {
        res.set('X-API-Deprecated', 'true');
        res.set('X-API-Deprecation-Info', 'Please use /api/v1/health/live instead');
        live(req, res);
    });
    // Dependency adapters expose booleans; infrastructure names/addresses never leave this endpoint.
    app.get('/api/v1/health/ready', (req, res) => {
        let databaseReady = false;
        let redisReady = false;
        try { databaseReady = database.isReady() === true; } catch {}
        try { redisReady = redis.isReady() === true; } catch {}
        const ready = !isDraining() && databaseReady && (!redisRequired || redisReady);
        res.set('Cache-Control', 'no-store').status(ready ? 200 : 503).json({
            status: ready ? 'ready' : 'not_ready',
            dependencies: {
                database: databaseReady ? 'ready' : 'unavailable',
                redis: redisReady ? 'ready' : (redisRequired ? 'unavailable' : 'optional_unavailable')
            }
        });
    });

    app.use((req, res, next) => {
        if (isDraining()) return res.status(503).set('Connection', 'close').json({ success: false, message: 'Service is shutting down' });
        next();
    });
    app.use(createGlobalRateLimiter());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(mongoSanitization);
    app.use('/uploads', express.static(uploadsPath));
    app.use('/api/v1', (req, res, next) => {
        if (!database.isReady()) return res.status(503).json({ success: false, message: 'Service temporarily unavailable' });
        next();
    });

    routes ??= (await import('./routes/index.js')).default;
    for (const [prefix, router] of routes) app.use('/api/v1' + prefix, router);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
export default createApp;
