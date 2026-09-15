/**
 * Client-Side Security & Input Sanitization Engine
 * Protects against XSS, Injection, and Protocol-based attacks
 */

/**
 * Strips script tags, HTML markup, dangerous event handlers, and javascript: protocols
 */
export function sanitizeText(input: unknown, maxLength = 300): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes usernames to alphanumeric, underscores, and dashes only
 */
export function sanitizeUsername(input: unknown): string {
  if (typeof input !== 'string') return 'User';
  const cleaned = input
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .trim()
    .slice(0, 24);
  return cleaned.length >= 2 ? cleaned : `user_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Validates room code format (alphanumeric uppercase, 4-10 chars)
 */
export function sanitizeRoomCode(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 10);
}

/**
 * Anti-tampering number bounds helper
 */
export function clampSafeNumber(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (Number.isNaN(n) || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
