import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';

import { frontendOrigins } from '../config/env';
import { authenticateSocket } from './middleware/socket-auth.middleware';
import { registerConversationHandlers } from './handlers/conversation.handlers';
import { registerMessageHandlers } from './handlers/message.handlers';
import {
  registerPresenceHandlers,
  broadcastPresenceChange,
} from './handlers/presence.handlers';
import { registerSocket, unregisterSocket } from './presence';
import { setIo } from './instance';
import { userRoom } from './rooms';

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: frontendOrigins, credentials: true },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  setIo(io);
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.user.id as string;
    socket.join(userRoom(userId));

    const cameOnline = registerSocket(userId, socket.id);
    console.log(
      `[socket] connected user=${userId} socket=${socket.id} ${cameOnline ? '(came online)' : '(additional device)'}`,
    );

    registerConversationHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    if (cameOnline) {
      broadcastPresenceChange(io, userId, 'online').catch((err) =>
        console.error('[socket] presence online broadcast failed', err),
      );
    }

    socket.on('ping:client', (_payload: unknown, cb?: (r: unknown) => void) => {
      cb?.({ ok: true, ts: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      const wentOffline = unregisterSocket(userId, socket.id);
      console.log(
        `[socket] disconnected user=${userId} socket=${socket.id} reason=${reason} ${wentOffline ? '(went offline)' : '(still has other devices)'}`,
      );
      if (wentOffline) {
        broadcastPresenceChange(io, userId, 'offline').catch((err) =>
          console.error('[socket] presence offline broadcast failed', err),
        );
      }
    });
  });

  return io;
}