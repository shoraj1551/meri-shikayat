import { createApp } from '../../src/app.js';
export function adapters({ databaseReady = true, redisReady = false } = {}) {
    const database = { ready: databaseReady, connects: 0, closes: 0,
        isReady() { return this.ready; },
        async connect() { this.connects++; this.ready = true; },
        async close() { this.closes++; this.ready = false; } };
    const redis = { ready: redisReady, connects: 0, closes: 0,
        isReady() { return this.ready; },
        async connect() { this.connects++; return this.ready; },
        async close() { this.closes++; this.ready = false; } };
    return { database, redis };
}
export const emptyApp = options => createApp({ ...options, routes: [] });
export const signals = ['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'];
export const listenerCounts = () => signals.map(name => process.listenerCount(name));
