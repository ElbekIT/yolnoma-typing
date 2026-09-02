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

export function maskUid(uid?: string | null): string {
  if (!uid || typeof uid !== 'string') return '***';
  if (uid.startsWith('guest_')) {
    return `Mehmon_${uid.slice(-4)}`;
  }
  if (uid.length <= 6) return 'usr_***';
  return `usr_***${uid.slice(-4)}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 7) return '***';
  return `${clean.slice(0, 4)}***${clean.slice(-2)}`;
}

export function maskIp(ip?: string | null): string {
  if (!ip || typeof ip !== 'string') return '***.***.***.***';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return '***:***:***:****';
}
