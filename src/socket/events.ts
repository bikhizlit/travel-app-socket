/**
 * Socket event names — single source of truth.
 * Client and server must import from here (or duplicate intentionally).
 */
export const SocketEvents = {
  // Client → Server
  ConversationJoin: 'conversation:join',
  ConversationLeave: 'conversation:leave',
  MessageSend: 'message:send',
  TypingStart: 'typing:start',
  TypingStop: 'typing:stop',

  // Server → Client
  MessageNew: 'message:new',
  PresenceUpdate: 'presence:update',
  PresenceSnapshot: 'presence:snapshot',
} as const;

export type SocketEventName =
  (typeof SocketEvents)[keyof typeof SocketEvents];