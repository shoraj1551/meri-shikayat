import { connectDatabase, closeDatabase, getConnectionHealth } from '../config/database.js';
import { initializeRedis, closeRedisConnection, getRedisStatus } from '../config/redis.js';

export const databaseAdapter = {
    connect: connectDatabase,
    close: closeDatabase,
    isReady: () => getConnectionHealth().readyState === 1
};
export const redisAdapter = {
    connect: initializeRedis,
    close: closeRedisConnection,
    isReady: () => getRedisStatus().connected === true
};
