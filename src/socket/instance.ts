import type { Server } from 'socket.io';

let ioRef: Server | null = null;

export function setIo(io: Server): void {
  ioRef = io;
}

export function getIo(): Server {
  if (!ioRef) throw new Error('Socket.IO has not been initialized yet');
  return ioRef;
}