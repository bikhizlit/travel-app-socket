import type { Server, Socket } from 'socket.io';

import { AppDataSource } from '../../db/data-source';
import { Conversation } from '../../entities/Conversation.entity';
import { ConversationParticipant } from '../../entities/ConversationParticipant.entity';
import { Message, MessageType } from '../../entities/Message.entity';
import type { SocketAck } from '../../common/types';
import { SocketEvents } from '../events';
import { conversationRoom, userRoom } from '../rooms';

const MAX_BODY_LENGTH = 4000;
const CLIENT_ALLOWED_TYPES: readonly MessageType[] = [
  'text',
  'image',
  'phone_share',
  'photo_share',
];

interface SendPayload {
  conversationId?: string;
  body?: string;
  type?: MessageType;
  attachments?: { url: string; mime?: string; name?: string }[];
  clientMessageId?: string;
}

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

export function registerMessageHandlers(io: Server, socket: Socket) {
  const userId = socket.data.user.id as string;

  socket.on(
    SocketEvents.MessageSend,
    async (payload: SendPayload, ack?: (res: SocketAck) => void) => {
      try {
        const conversationId = payload?.conversationId;
        if (typeof conversationId !== 'string' || conversationId.length === 0) {
          return ack?.({ ok: false, error: 'conversationId required' });
        }

        const type: MessageType = payload?.type ?? 'text';
        if (!CLIENT_ALLOWED_TYPES.includes(type)) {
          return ack?.({ ok: false, error: 'Invalid message type' });
        }

        const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
        if (type === 'text' && body.length === 0) {
          return ack?.({ ok: false, error: 'body required' });
        }
        if (body.length > MAX_BODY_LENGTH) {
          return ack?.({ ok: false, error: 'body too long' });
        }

        const attachments = Array.isArray(payload?.attachments)
          ? payload.attachments.slice(0, 10)
          : null;

        if (!(await isParticipant(conversationId, userId))) {
          return ack?.({ ok: false, error: 'Not a participant' });
        }

        const messageRepo = AppDataSource.getRepository(Message);
        const conversationRepo = AppDataSource.getRepository(Conversation);

        const message = messageRepo.create({
          conversationId,
          senderId: userId,
          type,
          body: body.length > 0 ? body : undefined,
          attachments: attachments ?? null,
          edited: false,
        });

        const saved = await messageRepo.save(message);

        // Fire-and-forget: the message is persisted; ordering of the
        // conversation timestamp is not worth blocking the ack on.
        conversationRepo
          .update({ id: conversationId }, { lastMessageAt: new Date() })
          .catch((err) =>
            console.error('[socket] lastMessageAt update failed', err),
          );

        const outbound = {
          id: saved.id,
          conversationId: saved.conversationId,
          senderId: saved.senderId,
          type: saved.type,
          body: saved.body,
          attachments: saved.attachments,
          edited: saved.edited,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
          clientMessageId: payload.clientMessageId,
        };

        io.to(conversationRoom(conversationId)).emit(
          SocketEvents.MessageNew,
          outbound,
        );

        return ack?.({ ok: true, data: outbound });
      } catch (err) {
        console.error('[socket] message:send failed', err);
        return ack?.({ ok: false, error: 'Internal error' });
      }
    },
  );
}

// `userRoom` is imported for upcoming per-user fan-out (match notifications).
// Kept in scope now to avoid churn when we add that handler in Phase 6.
void userRoom;