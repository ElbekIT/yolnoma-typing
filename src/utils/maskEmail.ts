/**
 * Utility for masking user email addresses to protect privacy across the platform.
 * e.g. "gavharoy@gmail.com" -> "ga***y@gmail.com"
 * e.g. "elbek@yolnoma.uz" -> "el***k@yolnoma.uz"
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim();
  if (!trimmed.includes('@')) {
    if (trimmed.length <= 3) return '***';
    return `${trimmed.slice(0, 2)}***${trimmed.slice(-1)}`;
  }

  const [username, domain] = trimmed.split('@');
  if (!username || !domain) return '***@***.***';

  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }

  const firstPart = username.slice(0, 2);
  const lastPart = username.slice(-1);
  return `${firstPart}***${lastPart}@${domain}`;
}
