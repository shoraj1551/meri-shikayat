
const CACHE_NAME = 'meri-shikayat-v2';
const API_BASE_URL = new URL(self.location.href).searchParams.get('apiBase') || '/api/v1';
const PRECACHE_ASSETS = self.__PRECACHE_MANIFEST || [
    '/',
    '/index.html',
    '/offline.html',
    '/favicon.ico',
    '/manifest.json'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First for API, Cache First for Static
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    const apiUrl = new URL(API_BASE_URL, self.location.origin);
    const isApiRequest = url.origin === apiUrl.origin &&
        url.pathname.startsWith(`${apiUrl.pathname.replace(/\/$/, '')}/`);

    // API requests are never cached or converted into successful responses.
    if (isApiRequest) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(JSON.stringify({ error: 'offline' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    if (event.request.method !== 'GET') return;

    // Static assets use stale-while-revalidate. Navigations fall back to the
    // cached app shell and then the dedicated offline page.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse.ok) {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                }
                return networkResponse;
            }).catch(async () => {
                if (event.request.mode === 'navigate') {
                    return (await caches.match('/index.html')) || caches.match('/offline.html');
                }
                return cachedResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});

// Background Sync - Handle Offline Complaints
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-complaints') {
        // Authentication credentials are deliberately not persisted in
        // IndexedDB. Ask an authenticated window to flush the queue instead.
        event.waitUntil(notifyClients('SYNC_REQUESTED'));
    }
});

// Web Push - display server payloads while the app is closed or backgrounded.
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { body: event.data?.text() || 'You have a new notification' };
    }
    const title = typeof data.title === 'string' ? data.title.slice(0, 200) : 'Meri Shikayat';
    const options = {
        body: typeof data.body === 'string' ? data.body.slice(0, 1000) : 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url: typeof data.url === 'string' ? data.url : '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    let destination = new URL('/', self.location.origin);
    try {
        const requested = new URL(event.notification.data?.url || '/', self.location.origin);
        if (requested.origin === self.location.origin) destination = requested;
    } catch {}

    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
        if (existing) {
            await existing.navigate(destination.href);
            return existing.focus();
        }
        return self.clients.openWindow(destination.href);
    })());
});

async function notifyClients(type, message) {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => {
        client.postMessage({
            type,
            message
        });
    });
}
