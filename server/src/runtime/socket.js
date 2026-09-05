import { Server } from 'socket.io';

export function attachSockets(httpServer, app, corsOptions) {
    const io = new Server(httpServer, { cors: { ...corsOptions, methods: ['GET', 'POST'] } });
    app.set('io', io);
    // Existing event contract preserved. Authentication/room authorization is story B09.
    io.on('connection', socket => {
        socket.on('join_admin_room', () => socket.join('admin_notifications'));
    });
    return io;
}
