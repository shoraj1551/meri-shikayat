import { startServer } from '../../src/runtime/server.js';
import { adapters, emptyApp } from './helpers.mjs';
const runtime = await startServer({
    ...adapters(), createApplication: emptyApp,
    host: '127.0.0.1', port: 0, handleSignals: true, shutdownTimeoutMs: 1000
});
process.on('message', message => {
    if (message === 'SIGTERM') process.emit('SIGTERM');
});
process.send({ port: runtime.server.address().port });
