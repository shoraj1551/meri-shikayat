// Vercel adapter: no HTTP listener, Socket.IO server or process handlers.
export function createServerlessHandler({ initialize }) {
    let pending;
    return async (req, res) => {
        try {
            pending ??= Promise.resolve().then(initialize).catch(error => { pending = undefined; throw error; });
            const { app, database, redis, redisRequired = false } = await pending;
            const path = (req.url || '').split('?')[0];
            const live = ['/api/health', '/api/v1/health', '/api/v1/health/live'].includes(path);
            if (!live) {
                if (!database.isReady()) await database.connect();
                if (redisRequired && !redis?.isReady() && !await redis?.connect()) {
                    throw new Error('Required Redis dependency unavailable');
                }
            }
            return app(req, res);
        } catch {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Service temporarily unavailable' }));
        }
    };
}

export default createServerlessHandler({
    async initialize() {
        await import('./config/env.js');
        const { validateEnvironment } = await import('./utils/validateEnv.js');
        validateEnvironment();
        const { createApp } = await import('./app.js');
        const { databaseAdapter, redisAdapter } = await import('./runtime/dependencies.js');
        // Redis remains optional here; API startup/connection happens on demand.
        return {
            app: await createApp({ database: databaseAdapter, redis: redisAdapter }),
            database: databaseAdapter,
            redis: redisAdapter,
            redisRequired: process.env.REDIS_REQUIRED === 'true'
        };
    }
});
