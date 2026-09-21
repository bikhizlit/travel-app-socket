import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';

import { frontendOrigins } from '../config/env';
import { authenticateSocket } from './middleware/socket-auth.middleware';
import { registerConversationHandlers } from './handlers/conversation.handlers';
import { registerMessageHandlers } from './handlers/message.handlers';
import { userRoom } from './rooms';

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: frontendOrigins,
      credentials: true,
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.user.id as string;
    socket.join(userRoom(userId));
    console.log(`[socket] connected user=${userId} socket=${socket.id}`);

    registerConversationHandlers(io, socket);
    registerMessageHandlers(io, socket);

    socket.on('ping:client', (_payload: unknown, cb?: (r: unknown) => void) => {
      cb?.({ ok: true, ts: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected user=${userId} reason=${reason}`);
    });
  });

  return io;
}