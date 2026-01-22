import { io } from 'socket.io-client';

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

        // Use the API_BASE_URL window variable or default
        const baseUrl = window.API_BASE_URL ? window.API_BASE_URL.replace('/api', '') : 'http://localhost:5000';

        this.socket = io(baseUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
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

        if (this.socket.connected) {
            this.socket.emit('join_admin_room');
        } else {
            this.socket.on('connect', () => {
                this.socket.emit('join_admin_room');
            });
        }
    }

    /**
     * Listen for new complaints
     * @param {Function} callback - Function to run when a new complaint arrives
     */
    onNewComplaint(callback) {
        if (!this.socket) this.connect();
        this.socket.on('new_complaint', (data) => {
            console.log('[Socket] New Complaint Received:', data);
            callback(data);
        });
    }

    /**
     * Listen for status updates
     * @param {Function} callback 
     */
    onStatusUpdate(callback) {
        if (!this.socket) this.connect();
        this.socket.on('complaint_status_update', (data) => {
            console.log('[Socket] Status Updated:', data);
            callback(data);
        });
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
