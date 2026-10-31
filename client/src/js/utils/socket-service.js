import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api.js';

export function resolveSocketOrigin(configuredApiUrl, pageOrigin) {
    if (!configuredApiUrl) return pageOrigin;
    try {
        return new URL(configuredApiUrl, pageOrigin).origin;
    } catch {
        return pageOrigin;
    }
}

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    /**
     * Initialize Socket connection
     */
    connect() {
        if (this.socket) return;

        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            console.warn('[Socket] Admin authentication is required');
            return;
        }

        const baseUrl = resolveSocketOrigin(SOCKET_URL, window.location.origin);

        this.socket = io(baseUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            auth: { token: adminToken }
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
        });
    }

    /**
     * Join Admin Room to receive notifications
     */
    joinAdminRoom() {
        if (!this.socket) this.connect();
        // The server joins authenticated admins to the room automatically.
    }

    /**
     * Listen for new complaints
     * @param {Function} callback - Function to run when a new complaint arrives
     */
    onNewComplaint(callback) {
        if (!this.socket) this.connect();
        if (!this.socket) return;
        const listener = (data) => {
            console.log('[Socket] New Complaint Received:', data);
            callback(data);
        };
        this.socket.on('new_complaint', listener);
        return () => this.socket?.off('new_complaint', listener);
    }

    /**
     * Listen for status updates
     * @param {Function} callback 
     */
    onStatusUpdate(callback) {
        if (!this.socket) this.connect();
        if (!this.socket) return;
        const listener = (data) => {
            console.log('[Socket] Status Updated:', data);
            callback(data);
        };
        this.socket.on('complaint_status_update', listener);
        return () => this.socket?.off('complaint_status_update', listener);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Export singleton
export const socketService = new SocketService();
