export const INTERNAL_EVENTS = [
  'match:new',
  'match:accepted',
  'match:declined',
] as const;

export type InternalEvent = (typeof INTERNAL_EVENTS)[number];

export function isInternalEvent(value: unknown): value is InternalEvent {
  return (
    typeof value === 'string' &&
    (INTERNAL_EVENTS as readonly string[]).includes(value)
  );
}