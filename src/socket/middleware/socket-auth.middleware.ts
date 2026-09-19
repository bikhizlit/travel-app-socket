import type { Socket } from 'socket.io';

import { verifyAccessToken } from '../../auth/jwt.js';

export interface AuthenticatedSocket extends Socket {
  data: Socket['data'] & {
    user: {
      id: string;
    };
  };
}

export function authenticateSocket(
  socket: Socket,
  next: (error?: Error) => void,
) {
  try {
    const token = socket.handshake.auth?.token;

    if (typeof token !== 'string' || token.length === 0) {
      return next(new Error('Authentication token required'));
    }

    const payload = verifyAccessToken(token);

    socket.data.user = {
      id: payload.sub,
    };

    next();
  } catch {
    next(new Error('Unauthorized'));
  }
}