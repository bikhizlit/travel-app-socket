import type { Server, Socket } from 'socket.io';

import { AppDataSource } from '../../db/data-source';
import { ConversationParticipant } from '../../entities/ConversationParticipant.entity';
import { SocketEvents } from '../events';
import { conversationRoom } from '../rooms';
import { presenceFor } from '../presence';

const TYPING_TIMEOUT_MS = 5_000;

// key: `${socketId}:${conversationId}` → timer
const typingTimers = new Map<string, NodeJS.Timeout>();

function clearTypingTimer(socketId: string, conversationId: string) {
  const key = `${socketId}:${conversationId}`;
  const t = typingTimers.get(key);
  if (t) {
    clearTimeout(t);
    typingTimers.delete(key);
  }
}

function armTypingTimer(
  socket: Socket,
  conversationId: string,
  userId: string,
) {
  const key = `${socket.id}:${conversationId}`;

  const existing = typingTimers.get(key);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    typingTimers.delete(key);
    socket
      .to(conversationRoom(conversationId))
      .volatile.emit(SocketEvents.TypingStop, { conversationId, userId });
  }, TYPING_TIMEOUT_MS);

  typingTimers.set(key, timer);
}

export function registerPresenceHandlers(_io: Server, socket: Socket) {
  const userId = socket.data.user.id as string;

  socket.on(
    SocketEvents.TypingStart,
    (payload: { conversationId?: string }) => {
      const conversationId = payload?.conversationId;
      if (typeof conversationId !== 'string') return;

      const room = conversationRoom(conversationId);
      if (!socket.rooms.has(room)) return; // not a participant / not joined

      socket
        .to(room)
        .volatile.emit(SocketEvents.TypingStart, { conversationId, userId });

      armTypingTimer(socket, conversationId, userId);
    },
  );

  socket.on(
    SocketEvents.TypingStop,
    (payload: { conversationId?: string }) => {
      const conversationId = payload?.conversationId;
      if (typeof conversationId !== 'string') return;

      const room = conversationRoom(conversationId);
      if (!socket.rooms.has(room)) return;

      clearTypingTimer(socket.id, conversationId);

      socket
        .to(room)
        .volatile.emit(SocketEvents.TypingStop, { conversationId, userId });
    },
  );

  // Clean up timers on disconnect
  socket.on('disconnect', () => {
    const prefix = `${socket.id}:`;
    for (const key of Array.from(typingTimers.keys())) {
      if (key.startsWith(prefix)) {
        const t = typingTimers.get(key);
        if (t) clearTimeout(t);
        typingTimers.delete(key);
      }
    }
  });
}

/**
 * Emit the current online/offline status of all OTHER participants
 * of a conversation to the socket that just joined it.
 */
export async function sendPresenceSnapshot(
  socket: Socket,
  conversationId: string,
  selfUserId: string,
) {
  const repo = AppDataSource.getRepository(ConversationParticipant);
  const others = await repo.find({
    where: { conversationId },
    select: ['userId'],
  });

  const userIds = others
    .map((o) => o.userId)
    .filter((id) => id !== selfUserId);

  socket.emit(SocketEvents.PresenceSnapshot, {
    conversationId,
    users: presenceFor(userIds),
  });
}

/**
 * Broadcast a presence change to every conversation the user participates in.
 * Called once per online/offline transition (not per socket).
 */
export async function broadcastPresenceChange(
  io: Server,
  userId: string,
  status: 'online' | 'offline',
) {
  const repo = AppDataSource.getRepository(ConversationParticipant);
  const parts = await repo.find({
    where: { userId },
    select: ['conversationId'],
  });

  if (parts.length === 0) return;

  const rooms = parts.map((p) => conversationRoom(p.conversationId));
  io.to(rooms).emit(SocketEvents.PresenceUpdate, { userId, status });
}