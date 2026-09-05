import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export { createApp } from './app.js';
export { startServer } from './runtime/server.js';

// Imports never own process lifecycle; only the executable starts listening.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    const { startConfiguredServer } = await import('./runtime/server.js');
    try {
        const runtime = await startConfiguredServer();
        console.log(`API listening on port ${runtime.server.address().port}`);
    } catch {
        console.error('API startup failed. Check dependency availability and configuration.');
        process.exit(1);
    }
}
