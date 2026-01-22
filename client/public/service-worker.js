/**
 * Service Worker for Meri Shikayat PWA
 * Provides offline support and caching
 */

const CACHE_NAME = 'meri-shikayat-v1.0.0';
const RUNTIME_CACHE = 'meri-shikayat-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/styles/main.css',
    '/src/styles/responsive-fixes.css',
    '/src/styles/form-validation.css',
    '/src/styles/skeleton.css',
    '/src/js/main.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API requests (let them go to network)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ error: 'Offline - API not available' }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                })
        );
        return;
    }

    // For navigation requests, use network-first strategy
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache the new version
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE)
                        .then(cache => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Show offline page
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // For other requests, use cache-first strategy
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    fetch(request)
                        .then(response => {
                            caches.open(RUNTIME_CACHE)
                                .then(cache => cache.put(request, response));
                        })
                        .catch(() => { }); // Ignore network errors

                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then(response => {
                        // Cache the response
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE)
                            .then(cache => cache.put(request, responseClone));
                        return response;
                    })
                    .catch(() => {
                        // Network failed, show offline page for HTML requests
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Background sync for complaint submissions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-complaints') {
        console.log('[SW] Background sync triggered: sync-complaints');
        event.waitUntil(syncComplaints());
    }
});

async function syncComplaints() {
    try {
        const db = await openDB();
        const complaints = await getPendingComplaints(db);

        console.log(`[SW] Found ${complaints.length} pending complaints to sync`);

        for (const complaint of complaints) {
            try {
                console.log('[SW] Attempting to sync complaint:', complaint.id);

                // Construct form data if it was stored as such, or JSON
                const response = await fetch('/api/v1/complaints', {
                    method: 'POST',
                    headers: complaint.headers,
                    body: JSON.stringify(complaint.body) // Assuming body is stored as JSON compatible object
                });

                if (response.ok) {
                    console.log('[SW] Complaint synced successfully:', complaint.id);
                    await deleteComplaint(db, complaint.id);
                } else {
                    console.error('[SW] Failed to sync complaint:', complaint.id, await response.text());
                }
            } catch (err) {
                console.error('[SW] Network error during sync for:', complaint.id, err);
            }
        }
    } catch (error) {
        console.error('[SW] Error during background sync:', error);
    }
}

// Simple IndexedDB Helpers
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('meri-shikayat-offline', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('complaints')) {
                db.createObjectStore('complaints', { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getPendingComplaints(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('complaints', 'readonly');
        const store = transaction.objectStore('complaints');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteComplaint(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('complaints', 'readwrite');
        const store = transaction.objectStore('complaints');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Push notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Meri Shikayat', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// Message event - for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
