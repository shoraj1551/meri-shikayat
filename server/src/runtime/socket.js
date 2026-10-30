import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const ADMIN_ROLES = new Set(['viewer', 'moderator', 'manager', 'super_admin']);
const MAX_TIMER_DELAY_MS = 2_147_483_647;

function disconnectAtExpiry(socket, expiresAt) {
    if (!Number.isFinite(expiresAt)) return;
    let timer;
    const schedule = () => {
        const remaining = expiresAt - Date.now();
        if (remaining <= 0) {
            socket.disconnect(true);
            return;
        }
        timer = setTimeout(schedule, Math.min(remaining, MAX_TIMER_DELAY_MS));
        timer.unref?.();
    };
    schedule();
    socket.once('disconnect', () => clearTimeout(timer));
}

function monitorAuthorization(socket, authenticateAdmin, intervalMs) {
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) return;
    let checking = false;
    const interval = setInterval(async () => {
        if (checking || !socket.connected) return;
        checking = true;
        try {
            const identity = await authenticateAdmin(socket);
            const admin = identity?.admin || identity;
            if (!admin?._id || String(admin._id) !== socket.data.admin.id || !ADMIN_ROLES.has(admin.role)) {
                throw new Error('Unauthorized');
            }
            socket.data.admin.role = admin.role;
        } catch {
            socket.disconnect(true);
        } finally {
            checking = false;
        }
    }, intervalMs);
    interval.unref?.();
    socket.once('disconnect', () => clearInterval(interval));
}

export function extractSocketToken(socket) {
    const authToken = socket.handshake?.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken.trim();

    const authorization = socket.handshake?.headers?.authorization;
    if (typeof authorization === 'string') {
        const match = authorization.match(/^Bearer\s+(.+)$/i);
        if (match) return match[1].trim();
    }
    return null;
}

export function createAdminSocketAuthorizer({
    secret = process.env.JWT_SECRET,
    findAdminById = id => Admin.findById(id).select('_id role status')
} = {}) {
    return async socket => {
        const token = extractSocketToken(socket);
        if (!token || !secret) throw new Error('Unauthorized');

        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
        const adminId = decoded.id || decoded.userId;
        if (!adminId) throw new Error('Unauthorized');

        const admin = await findAdminById(adminId);
        if (!admin || admin.status !== 'active' || !ADMIN_ROLES.has(admin.role)) {
            throw new Error('Unauthorized');
        }
        return {
            admin,
            expiresAt: Number.isFinite(decoded.exp) ? decoded.exp * 1000 : null
        };
    };
}

export function attachSockets(httpServer, app, corsOptions, {
    authorizeAdmin,
    revalidateMs = Number(process.env.SOCKET_AUTH_REVALIDATE_MS || 60000)
} = {}) {
    const io = new Server(httpServer, { cors: { ...corsOptions, methods: ['GET', 'POST'] } });
    app.set('io', io);
    const authenticateAdmin = authorizeAdmin || createAdminSocketAuthorizer();

    io.use(async (socket, next) => {
        try {
            const identity = await authenticateAdmin(socket);
            const admin = identity?.admin || identity;
            if (!admin?._id || !ADMIN_ROLES.has(admin.role)) throw new Error('Unauthorized');
            socket.data.admin = { id: String(admin._id), role: admin.role };
            socket.data.authExpiresAt = identity?.admin ? identity.expiresAt : null;
            next();
        } catch {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', socket => {
        // Only authenticated, active admins reach this handler.
        socket.join('admin_notifications');
        disconnectAtExpiry(socket, socket.data.authExpiresAt);
        monitorAuthorization(socket, authenticateAdmin, revalidateMs);
    });
    return io;
}
