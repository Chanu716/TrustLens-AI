import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (sessionId: string): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  s.emit('session:join', sessionId);
  return s;
};

export const disconnectSocket = (sessionId?: string): void => {
  if (socket) {
    if (sessionId) socket.emit('session:leave', sessionId);
    socket.disconnect();
    socket = null;
  }
};
