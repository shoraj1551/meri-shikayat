import { createServer } from 'node:http';

export function installProcessHandlers(runtime, {
    target = process,
    exit = code => process.exit(code),
    report = error => console.error('API process failure:', error?.message || 'unknown')
} = {}) {
    const signal = () => { void runtime.stop().then(result => exit(result.timedOut || result.errors.length ? 1 : 0)); };
    const failure = error => {
        report(error);
        void runtime.stop().then(() => exit(1));
    };
    target.on('SIGTERM', signal);
    target.on('SIGINT', signal);
    target.on('uncaughtException', failure);
    target.on('unhandledRejection', failure);
    return () => {
        target.off('SIGTERM', signal);
        target.off('SIGINT', signal);
        target.off('uncaughtException', failure);
        target.off('unhandledRejection', failure);
    };
}

// Explicitly start an HTTP server regardless of NODE_ENV. Factories/imports never listen.
export async function startServer({
    database, redis, createApplication,
    attachSockets,
    port = Number(process.env.PORT || 5000),
    host = process.env.HOST || '0.0.0.0',
    redisRequired = process.env.REDIS_REQUIRED === 'true',
    shutdownTimeoutMs = 10000,
    handleSignals = false,
    corsOptions
} = {}) {
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 to 65535');
    if (!Number.isFinite(shutdownTimeoutMs) || shutdownTimeoutMs <= 0) throw new Error('Shutdown timeout must be positive');
    if (!database || !redis) throw new Error('Explicit database and Redis adapters are required');
    createApplication ??= (await import('../app.js')).createApp;
    attachSockets ??= (await import('./socket.js')).attachSockets;
    corsOptions ??= (await import('../app.js')).createCorsOptions();
    let draining = false;
    let stopPromise;
    let removeHandlers = () => {};
    let httpServer;
    let io;
    const sockets = new Set();
    const errors = [];

    const stop = () => {
        if (stopPromise) return stopPromise;
        draining = true;
        stopPromise = (async () => {
            let timeout;
            const cleanup = (async () => {
                // Stop accepting requests, drain active HTTP responses and close upgraded sockets.
                const httpClosed = new Promise(resolve => {
                    if (!httpServer?.listening) return resolve();
                    httpServer.close(() => resolve());
                    httpServer.closeIdleConnections?.();
                });
                // Close Engine.IO too, including clients that never joined a namespace.
                // Socket.IO close also closes HTTP; concurrent close callbacks are safe.
                const transportResults = await Promise.allSettled([
                    httpClosed, Promise.resolve().then(() => io?.close())
                ]);
                errors.push(...transportResults.filter(r => r.status === 'rejected').map(r => r.reason));
                const results = await Promise.allSettled([
                    Promise.resolve().then(() => database.close()),
                    Promise.resolve().then(() => redis.close())
                ]);
                errors.push(...results.filter(r => r.status === 'rejected').map(r => r.reason));
                return { timedOut: false, errors };
            })().catch(error => { errors.push(error); return { timedOut: false, errors }; });
            const deadline = new Promise(resolve => {
                timeout = setTimeout(() => {
                    for (const socket of sockets) socket.destroy();
                    io?.disconnectSockets(true);
                    resolve({ timedOut: true, errors });
                }, shutdownTimeoutMs);
            });
            const result = await Promise.race([cleanup, deadline]);
            clearTimeout(timeout);
            removeHandlers();
            return result;
        })();
        return stopPromise;
    };

    try {
        await database.connect();
        let redisReady = false;
        try { redisReady = await redis.connect(); } catch (error) {
            if (redisRequired) throw error;
        }
        if (redisRequired && !redisReady) throw new Error('Required Redis dependency is unavailable');
        const app = await createApplication({ database, redis, redisRequired, isDraining: () => draining, corsOptions });
        httpServer = createServer(app);
        httpServer.on('connection', socket => {
            sockets.add(socket);
            socket.once('close', () => sockets.delete(socket));
        });
        io = attachSockets(httpServer, app, corsOptions);
        await new Promise((resolve, reject) => {
            const failed = error => { httpServer.off('listening', ready); reject(error); };
            const ready = () => { httpServer.off('error', failed); resolve(); };
            httpServer.once('error', failed);
            httpServer.once('listening', ready);
            httpServer.listen(port, host);
        });
        const runtime = { app, server: httpServer, io, stop, isDraining: () => draining };
        if (handleSignals) removeHandlers = installProcessHandlers(runtime);
        return runtime;
    } catch (error) {
        await stop();
        throw error;
    }
}

// Load environment before dynamically importing modules that read secrets/config.
export async function startConfiguredServer() {
    await import('../config/env.js');
    const { validateEnvironment } = await import('../utils/validateEnv.js');
    validateEnvironment();
    const { databaseAdapter, redisAdapter } = await import('./dependencies.js');
    return startServer({ database: databaseAdapter, redis: redisAdapter, handleSignals: true });
}
