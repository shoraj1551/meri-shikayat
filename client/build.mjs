// Load this plain-JavaScript config with the pinned Node runtime, avoiding
// esbuild's ancestor-directory discovery just to bundle the config itself.
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import config from './vite.config.js';

await build({
    ...config,
    root: fileURLToPath(new URL('.', import.meta.url)),
    configFile: false
});
