import { afterAll, afterEach, jest } from '@jest/globals';
import net from 'node:net';
// A pure unit suite must not reach any network service, even with inherited env.
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = () => { throw new Error('Unit tests cannot open network connections; use the integration harness'); };
afterAll(() => { net.Socket.prototype.connect = originalConnect; });
afterEach(() => jest.useRealTimers());
