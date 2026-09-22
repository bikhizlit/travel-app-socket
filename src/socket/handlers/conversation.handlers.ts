import type { Server, Socket } from 'socket.io';

import { AppDataSource } from '../../db/data-source';
import { ConversationParticipant } from '../../entities/ConversationParticipant.entity';
import type { SocketAck } from '../../common/types';
import { SocketEvents } from '../events';
import { conversationRoom } from '../rooms';
import { sendPresenceSnapshot } from './presence.handlers';

async function isParticipant(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const repo = AppDataSource.getRepository(ConversationParticipant);
  const row = await repo.findOne({
    where: { conversationId, userId },
    select: ['id'],
  });
  return row !== null;
}

export function registerConversationHandlers(io: Server, socket: Socket) {
  const userId = socket.data.user.id as string;

  socket.on(
    SocketEvents.ConversationJoin,
    async (
      payload: { conversationId?: string },
      ack?: (res: SocketAck) => void,
    ) => {
      try {
        const conversationId = payload?.conversationId;
        if (typeof conversationId !== 'string' || conversationId.length === 0) {
          return ack?.({ ok: false, error: 'conversationId required' });
        }

        if (!(await isParticipant(conversationId, userId))) {
          return ack?.({ ok: false, error: 'Not a participant' });
        }

        await socket.join(conversationRoom(conversationId));
        await sendPresenceSnapshot(socket, conversationId, userId);
        return ack?.({ ok: true });
      } catch (err) {
        console.error('[socket] conversation:join failed', err);
        return ack?.({ ok: false, error: 'Internal error' });
      }
    },
  );

  socket.on(
    SocketEvents.ConversationLeave,
    async (
      payload: { conversationId?: string },
      ack?: (res: SocketAck) => void,
    ) => {
      const conversationId = payload?.conversationId;
      if (typeof conversationId !== 'string' || conversationId.length === 0) {
        return ack?.({ ok: false, error: 'conversationId required' });
      }
      await socket.leave(conversationRoom(conversationId));
      return ack?.({ ok: true });
    },
  );
}