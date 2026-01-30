
const CACHE_NAME = 'meri-shikayat-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/main.js',
    '/src/styles/main.css',
    '/src/styles/home.css',
    '/src/js/utils/pwa.js',
    '/src/js/app.js',
    '/favicon.ico',
    '/manifest.json'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
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

    // API Requests - Network First, no cache
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If offline and it's a POST request (complaint), we might return a custom offline response
                // But generally we rely on Background Sync for writes
                return new Response(JSON.stringify({ error: 'offline' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Static Assets - Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});

// Background Sync - Handle Offline Complaints
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-complaints') {
        console.log('[Service Worker] Syncing complaints...');
        event.waitUntil(syncComplaints());
    }
});

async function syncComplaints() {
    try {
        const db = await openDB();
        const complaints = await getAllComplaints(db);

        for (const complaint of complaints) {
            try {
                console.log(`[Service Worker] Syncing complaint ${complaint.id}`);

                const response = await fetch('/api/v1/complaints', {
                    method: 'POST',
                    headers: complaint.headers,
                    body: JSON.stringify(complaint.body)
                });

                if (response.ok) {
                    await deleteComplaint(db, complaint.id);
                    console.log(`[Service Worker] Complaint ${complaint.id} synced successfully`);

                    // Optional: Notify client
                    notifyClients('Complaint synced successfully');
                }
            } catch (error) {
                console.error(`[Service Worker] Failed to sync complaint ${complaint.id}`, error);
            }
        }
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// IndexedDB Helpers (Duplicated from pwa.js because SW doesn't support imports easily without bundler)
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('meri-shikayat-offline', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllComplaints(db) {
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

async function notifyClients(message) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_COMPLETE',
            message: message
        });
    });
}
