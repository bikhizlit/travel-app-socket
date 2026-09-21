export type Role = 'user' | 'guide' | 'coordinator' | 'vendor' | 'admin';
export type Plan = 'free' | 'pro';
export type SocketAck<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };