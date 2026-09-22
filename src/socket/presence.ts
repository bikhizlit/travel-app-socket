/**
 * In-memory presence registry.
 *
 * Maps userId → set of currently-connected socket ids.
 * A user is "online" iff that set is non-empty.
 *
 * Process-local. If we ever run multiple socket instances behind a
 * load balancer, this must move to Redis. For a single Render
 * instance, in-memory is correct and O(1).
 */

const online = new Map<string, Set<string>>();

/**
 * Register a socket for a user.
 * @returns true if this is the user's first socket (they just came online)
 */
export function registerSocket(userId: string, socketId: string): boolean {
  let set = online.get(userId);
  const wasOffline = !set || set.size === 0;

  if (!set) {
    set = new Set();
    online.set(userId, set);
  }
  set.add(socketId);

  return wasOffline;
}

/**
 * Unregister a socket for a user.
 * @returns true if this was the user's last socket (they just went offline)
 */
export function unregisterSocket(userId: string, socketId: string): boolean {
  const set = online.get(userId);
  if (!set) return false;

  set.delete(socketId);

  if (set.size === 0) {
    online.delete(userId);
    return true;
  }

  return false;
}

export function isOnline(userId: string): boolean {
  const set = online.get(userId);
  return !!set && set.size > 0;
}

export function presenceFor(
  userIds: string[],
): Array<{ userId: string; status: 'online' | 'offline' }> {
  return userIds.map((userId) => ({
    userId,
    status: isOnline(userId) ? 'online' : 'offline',
  }));
}