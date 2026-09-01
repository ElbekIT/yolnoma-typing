/**
 * Yolnoma Client-Side Security & Anti-Flood Throttle
 * Protects frontend API calls against accidental loops, multi-click spam, and denial-of-service triggers.
 */

const callTimestamps = new Map<string, number[]>();

/**
 * Throttle a given key (e.g. 'submit_test', 'create_room', 'contact_form')
 * Returns true if allowed, false if rate limited.
 */
export function checkClientThrottle(key: string, maxCalls: number = 5, windowMs: number = 3000): boolean {
  const now = Date.now();
  const timestamps = callTimestamps.get(key) || [];
  
  // Keep only timestamps within window
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);
  
  if (validTimestamps.length >= maxCalls) {
    return false;
  }
  
  validTimestamps.push(now);
  callTimestamps.set(key, validTimestamps);
  return true;
}

/**
 * Reset throttle for a specific key
 */
export function resetClientThrottle(key: string): void {
  callTimestamps.delete(key);
}
