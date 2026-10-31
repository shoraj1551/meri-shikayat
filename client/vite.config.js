import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function enforceVercelPersistentApi() {
    return {
        name: 'enforce-vercel-persistent-api',
        apply: 'build',
        configResolved() {
            if (process.env.VERCEL !== '1') return;
            const api = process.env.VITE_API_URL;
            const socket = process.env.VITE_SOCKET_URL;
            if (!api || !socket) throw new Error('Vercel builds require VITE_API_URL and VITE_SOCKET_URL');
            const apiOrigin = new URL(api).origin;
            const socketUrl = new URL(socket);
            if (apiOrigin !== socketUrl.origin || socketUrl.hostname !== 'meri-shikayat-api.onrender.com') {
                throw new Error('Vercel HTTP and Socket.IO traffic must use meri-shikayat-api.onrender.com');
            }
        }
    };
}

function injectServiceWorkerPrecache() {
    return {
        name: 'inject-service-worker-precache',
        apply: 'build',
        async writeBundle(outputOptions, bundle) {
            const outputDirectory = resolve(outputOptions.dir || 'dist');
            const workerPath = resolve(outputDirectory, 'service-worker.js');
            const generatedAssets = Object.keys(bundle)
                .filter(file => !file.endsWith('.map') && !file.endsWith('.gz') && !file.endsWith('.br'))
                .map(file => `/${file}`);
            const assets = [...new Set([
                '/', '/index.html', '/offline.html', '/favicon.ico', '/manifest.json',
                ...generatedAssets
            ])];
            const worker = await readFile(workerPath, 'utf8');
            if (!worker.includes('self.__PRECACHE_MANIFEST')) {
                throw new Error('Service worker precache placeholder is missing');
            }
            await writeFile(
                workerPath,
                worker.replace('self.__PRECACHE_MANIFEST', JSON.stringify(assets)),
                'utf8'
            );
        }
    };
}

export default defineConfig({
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                ws: true
            }
        }
    },
    plugins: [
        enforceVercelPersistentApi(),
        injectServiceWorkerPrecache(),
        // Gzip compression
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 10240, // Only compress files larger than 10KB
            deleteOriginFile: false
        }),
        // Brotli compression (better compression ratio)
        viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 10240,
            deleteOriginFile: false
        }),
        // Bundle analyzer (generates stats.html)
        visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true
        })
    ],
    build: {
        outDir: 'dist',
        sourcemap: true,
        cssCodeSplit: true,
        minify: 'terser',
        chunkSizeWarningLimit: 500, // Warn for chunks > 500KB
        rollupOptions: {
            output: {
                // Improved code splitting strategy
                manualChunks: (id) => {
                    // Vendor chunks
                    if (id.includes('node_modules')) {
                        if (id.includes('leaflet')) {
                            return 'vendor-leaflet';
                        }
                        return 'vendor';
                    }

                    // API services
                    if (id.includes('/src/js/api/')) {
                        return 'api-services';
                    }

                    // Components
                    if (id.includes('/src/js/components/')) {
                        return 'components';
                    }

                    // Pages - split by route
                    if (id.includes('/src/js/pages/')) {
                        if (id.includes('admin')) {
                            return 'pages-admin';
                        }
                        if (id.includes('dashboard')) {
                            return 'pages-dashboard';
                        }
                        if (id.includes('complaint')) {
                            return 'pages-complaint';
                        }
                        return 'pages-other';
                    }

                    // Utils
                    if (id.includes('/src/js/utils/')) {
                        return 'utils';
                    }
                },
                // Optimize chunk file names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.css')) {
                        return 'assets/css/[name]-[hash][extname]';
                    }
                    if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(assetInfo.name)) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
                        return 'assets/fonts/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        },
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                passes: 2 // Run compression twice for better results
            },
            mangle: {
                safari10: true // Fix Safari 10 issues
            },
            format: {
                comments: false // Remove all comments
            }
        }
    },
    css: {
        devSourcemap: true
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['leaflet']
    }
});
