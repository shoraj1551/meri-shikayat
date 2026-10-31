const REQUIRED_COMPLAINT_FIELDS = ['title', 'type', 'description', 'location'];

export function serializeComplaintFormData(formData) {
    if (!(formData instanceof FormData)) throw new TypeError('Offline complaints must use FormData');
    const entries = [];
    for (const [name, value] of formData.entries()) {
        if (value instanceof Blob) {
            entries.push({ name, kind: 'blob', value, filename: value.name || 'evidence' });
        } else {
            entries.push({ name, kind: 'text', value: String(value) });
        }
    }

    const names = new Set(entries.map(entry => entry.name));
    const missing = REQUIRED_COMPLAINT_FIELDS.filter(field => !names.has(field));
    if (!names.has('category') && !names.has('customCategory')) missing.push('category');
    if (missing.length) throw new Error(`Offline complaint is incomplete: ${missing.join(', ')}`);
    return entries;
}

export function restoreComplaintFormData(entries, FormDataCtor = FormData) {
    const formData = new FormDataCtor();
    for (const entry of entries) {
        if (entry.kind === 'blob') formData.append(entry.name, entry.value, entry.filename);
        else formData.append(entry.name, entry.value);
    }
    return formData;
}

class PWAManager {
    constructor() {
        this.registration = null;
        this.deferredPrompt = null;
        this.flushPromise = null;
    }

    /**
     * Initialize PWA features
     */
    async init() {
        if ('serviceWorker' in navigator) {
            await this.registerServiceWorker();
            this.setupInstallPrompt();
            this.setupUpdateNotification();
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data?.type === 'SYNC_REQUESTED') this.flushOfflineComplaints();
            });
        }
        this.setupConnectivityListeners();
        if (navigator.onLine) await this.flushOfflineComplaints();
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            const { API_BASE_URL } = await import('../config/api.js');
            const workerUrl = `/service-worker.js?apiBase=${encodeURIComponent(API_BASE_URL)}`;
            this.registration = await navigator.serviceWorker.register(workerUrl);
            console.log('[PWA] Service Worker registered successfully');

            // Check for updates every hour
            setInterval(() => {
                this.registration.update();
            }, 60 * 60 * 1000);

        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
        }
    }

    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default prompt
            e.preventDefault();

            // Store event for later use
            this.deferredPrompt = e;

            // Show custom install button
            this.showInstallButton();
        });

        // Track installation
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.deferredPrompt = null;
            this.hideInstallButton();

            // Track analytics
            this.trackEvent('pwa_installed');
        });
    }

    /**
     * Show install button
     */
    showInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => this.promptInstall());
        }
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    /**
     * Prompt user to install
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }

        // Show install prompt
        this.deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;

        console.log(`[PWA] User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install prompt`);

        // Track choice
        this.trackEvent('pwa_install_prompt', { outcome });

        // Clear prompt
        this.deferredPrompt = null;
    }

    /**
     * Setup update notification
     */
    setupUpdateNotification() {
        if (!this.registration) return;

        this.registration.addEventListener('updatefound', () => {
            const newWorker = this.registration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    this.showUpdateNotification();
                }
            });
        });
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="pwa-update-content">
                <span>🎉 A new version is available!</span>
                <button onclick="window.pwaManager.applyUpdate()">Update Now</button>
                <button onclick="this.parentElement.parentElement.remove()">Later</button>
            </div>
        `;

        document.body.appendChild(notification);
    }

    /**
     * Apply update
     */
    applyUpdate() {
        if (!this.registration || !this.registration.waiting) {
            return;
        }

        // Tell service worker to skip waiting
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload page when new service worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }

    /**
     * Check if app is installed
     */
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    }

    /**
     * Request notification permission
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('[PWA] Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Subscribe to push notifications
     */
    /**
     * Subscribe to push notifications
     */
    async subscribeToPush() {
        if (!this.registration) {
            console.error('[PWA] Service Worker not registered');
            return null;
        }

        try {
            const existing = await this.registration.pushManager.getSubscription();
            if (existing) {
                await this.saveSubscriptionToServer(existing);
                return existing;
            }

            // Read the public key from the API so it always matches the server's
            // private key; a build-time key may still be used as a fallback.
            const { apiUrl } = await import('../config/api.js');
            let vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            const keyResponse = await fetch(apiUrl('/notifications/public-key'));
            if (keyResponse.ok) {
                const keyBody = await keyResponse.json();
                vapidKey = keyBody.data?.publicKey;
            }
            if (!vapidKey || vapidKey === 'PLACEHOLDER_VAPID_PUBLIC_KEY') {
                throw new Error('Push notifications are not configured');
            }

            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
            });

            console.log('[PWA] Push subscription successful');

            // Send subscription to server
            await this.saveSubscriptionToServer(subscription);

            return subscription;

        } catch (error) {
            console.error('[PWA] Push subscription failed:', error);
            return null;
        }
    }

    /**
     * Save subscription to server
     */
    async saveSubscriptionToServer(subscription) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // User not logged in

            const { apiUrl } = await import('../config/api.js');
            const response = await fetch(apiUrl('/notifications/subscribe'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(subscription)
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription on server');
            }
        } catch (error) {
            console.error('[PWA] Error saving subscription:', error);
        }
    }

    async unsubscribeFromPush() {
        if (!this.registration) return false;
        const subscription = await this.registration.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();

        const token = localStorage.getItem('token');
        if (token) {
            const { apiUrl } = await import('../config/api.js');
            const response = await fetch(apiUrl('/notifications/subscribe'), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok && response.status !== 404) throw new Error('Failed to remove push subscription');
        }
        return true;
    }

    /**
     * Convert VAPID key
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Register background sync
     */
    async registerSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const sw = await navigator.serviceWorker.ready;
                await sw.sync.register('sync-complaints');
                console.log('[PWA] Background sync registered');
            } catch (error) {
                console.error('[PWA] Background sync registration failed:', error);
            }
        }
    }

    /**
     * Save complaint offline
     */
    async saveOfflineComplaint(complaintData) {
        if (!('indexedDB' in window)) return false;

        try {
            const db = await this.openDB();
            await this.addComplaintToDB(db, serializeComplaintFormData(complaintData));
            db.close();
            await this.registerSync();
            return true;
        } catch (error) {
            console.error('[PWA] Failed to save offline complaint:', error);
            return false;
        }
    }

    /**
     * Setup connectivity listeners
     */
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.updateOnlineStatus();
            this.flushOfflineComplaints();
        });
        window.addEventListener('offline', () => this.updateOnlineStatus());
        this.updateOnlineStatus(); // Initial check
    }

    updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const banner = document.getElementById('offline-banner') || this.createOfflineBanner();

        if (isOnline) {
            banner.classList.add('hidden');
            banner.textContent = 'You are back online. Syncing data...';
            setTimeout(() => banner.classList.add('hidden'), 3000);
        } else {
            banner.classList.remove('hidden');
            banner.textContent = 'You are offline. Changes will be saved locally.';
        }
    }

    createOfflineBanner() {
        const banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.className = 'offline-banner hidden';
        document.body.appendChild(banner);
        return banner;
    }

    // IndexedDB Helpers for Main Thread
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('meri-shikayat-offline', 2);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Version 1 stored bearer tokens and incomplete JSON payloads.
                // Remove that incompatible, sensitive queue during migration.
                if (e.oldVersion < 2 && db.objectStoreNames.contains('complaints')) {
                    db.deleteObjectStore('complaints');
                }
                if (!db.objectStoreNames.contains('complaints')) {
                    db.createObjectStore('complaints', { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    addComplaintToDB(db, entries) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('complaints', 'readwrite');
            const store = transaction.objectStore('complaints');
            const item = {
                id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
                entries,
                timestamp: Date.now()
            };
            const request = store.add(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    getAllOfflineComplaints(db) {
        return new Promise((resolve, reject) => {
            const request = db.transaction('complaints', 'readonly').objectStore('complaints').getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    deleteOfflineComplaint(db, id) {
        return new Promise((resolve, reject) => {
            const request = db.transaction('complaints', 'readwrite').objectStore('complaints').delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async flushOfflineComplaints(fetchImpl = fetch) {
        if (this.flushPromise) return this.flushPromise;
        const flush = () => this.performOfflineComplaintFlush(fetchImpl);
        this.flushPromise = navigator.locks?.request
            ? navigator.locks.request('meri-shikayat-complaint-sync', { ifAvailable: true }, lock => (
                lock ? flush() : { synced: 0, pending: true }
            ))
            : flush();
        try {
            return await this.flushPromise;
        } finally {
            this.flushPromise = null;
        }
    }

    async performOfflineComplaintFlush(fetchImpl = fetch) {
        if (!navigator.onLine || !('indexedDB' in window)) return { synced: 0, pending: true };
        const token = localStorage.getItem('token');
        if (!token) return { synced: 0, pending: true };

        const db = await this.openDB();
        let synced = 0;
        try {
            const complaints = await this.getAllOfflineComplaints(db);
            if (!complaints.length) return { synced: 0, pending: false };
            const { apiUrl } = await import('../config/api.js');

            for (const complaint of complaints) {
                const response = await fetchImpl(apiUrl('/complaints'), {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: restoreComplaintFormData(complaint.entries)
                });
                if (response.status === 401 || response.status === 403) break;
                if (!response.ok) continue;
                await this.deleteOfflineComplaint(db, complaint.id);
                synced += 1;
            }
            return { synced, pending: synced < complaints.length };
        } catch (error) {
            console.error('[PWA] Offline complaint sync failed:', error);
            return { synced, pending: true };
        } finally {
            db.close();
        }
    }

    /**
     * Track analytics event
     */
    trackEvent(eventName, data = {}) {
        // Log to console for dev
        console.log('[PWA] Analytics Event:', eventName, data);

        // Google Analytics (GA4)
        if (window.gtag) {
            window.gtag('event', eventName, data);
        }

        // Mixpanel (if integrated)
        if (window.mixpanel) {
            window.mixpanel.track(eventName, data);
        }
    }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.pwaManager = new PWAManager();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.pwaManager.init();
        });
    } else {
        window.pwaManager.init();
    }
}

export default PWAManager;
