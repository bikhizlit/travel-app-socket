import { timingSafeEqual } from 'node:crypto';
import { Router, type Request, type Response } from 'express';

import { env } from '../config/env';
import { getIo } from '../socket/instance';
import { userRoom } from '../socket/rooms';
import { isInternalEvent } from './events';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

interface EmitBody {
  userId?: unknown;
  event?: unknown;
  payload?: unknown;
  eventId?: unknown;
}

export function createInternalRouter(): Router {
  const router = Router();

  router.post('/emit', (req: Request, res: Response) => {
    // 1. Auth — constant-time compare
    const provided = req.header('X-Internal-Key') ?? '';
    if (!safeEqual(provided, env.INTERNAL_API_KEY)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // 2. Validate body
    const { userId, event, payload, eventId } = (req.body ?? {}) as EmitBody;

    if (typeof userId !== 'string' || userId.length === 0) {
      return res.status(400).json({ ok: false, error: 'userId is required' });
    }
    if (!isInternalEvent(event)) {
      return res.status(400).json({ ok: false, error: 'Unknown event' });
    }
    if (payload !== undefined && (typeof payload !== 'object' || payload === null)) {
      return res.status(400).json({ ok: false, error: 'payload must be an object' });
    }
    if (eventId !== undefined && typeof eventId !== 'string') {
      return res.status(400).json({ ok: false, error: 'eventId must be a string' });
    }

    // 3. Emit to that user's room(s)
    const outgoing = {
      ...(payload as Record<string, unknown> | undefined),
      ...(eventId ? { eventId } : {}),
    };

    getIo().to(userRoom(userId)).emit(event, outgoing);

    return res.json({ ok: true });
  });

  return router;
}