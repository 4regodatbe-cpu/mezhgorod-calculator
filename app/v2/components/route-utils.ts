import type { Trip } from "./types";

export function pickOptimal(fast: Trip, free: Trip | null) {
  if (!free) return fast;
  return free.meters < fast.meters || (free.meters === fast.meters && free.seconds < fast.seconds) ? free : fast;
}
