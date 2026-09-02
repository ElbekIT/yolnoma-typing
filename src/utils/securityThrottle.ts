const callTimestamps = new Map<string, number[]>();

export function checkClientThrottle(key: string, maxCalls: number = 5, windowMs: number = 3000): boolean {
  const now = Date.now();
  const timestamps = callTimestamps.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxCalls) {
    return false;
  }

  validTimestamps.push(now);
  callTimestamps.set(key, validTimestamps);
  return true;
}

export function resetClientThrottle(key: string): void {
  callTimestamps.delete(key);
}
