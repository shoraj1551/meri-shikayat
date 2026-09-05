import './environment.cjs';
import net from 'node:net';
// Loaded with --import before test-file imports.
net.Socket.prototype.connect = () => { throw new Error('Native unit tests cannot open network connections'); };
