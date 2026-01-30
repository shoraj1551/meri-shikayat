/**
 * PWA Registration and Management
 * Handles service worker registration and PWA features
 */

class PWAManager {
    constructor() {
        this.registration = null;
        this.deferredPrompt = null;
    }

    /**
     * Initialize PWA features
     */
    async init() {
        if ('serviceWorker' in navigator) {
            await this.registerServiceWorker();
            this.setupInstallPrompt();
            this.setupUpdateNotification();
        }
        this.setupConnectivityListeners();
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register('/service-worker.js');
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
            // Check for VAPID key
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Using Vite env var
            if (!vapidKey || vapidKey === 'PLACEHOLDER_VAPID_PUBLIC_KEY') {
                console.warn('[PWA] VAPID Public Key not found. Push subscription skipped.');
                return null;
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

            const response = await fetch('/api/v1/notifications/subscribe', {
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
            await this.addComplaintToDB(db, complaintData);
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
        window.addEventListener('online', () => this.updateOnlineStatus());
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

    addComplaintToDB(db, data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('complaints', 'readwrite');
            const store = transaction.objectStore('complaints');
            const item = {
                id: Date.now().toString(),
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth is preserved
                },
                timestamp: Date.now()
            };
            const request = store.add(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
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

// Create global instance
window.pwaManager = new PWAManager();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaManager.init();
    });
} else {
    window.pwaManager.init();
}

export default PWAManager;
