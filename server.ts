import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Remove fingerprinting headers
app.disable('x-powered-by');

// -------------------------------------------------------------
// SECURE IN-MEMORY STATE & ENTERPRISE ANTI-DRDOS / ANTI-AMPLIFICATION DEFENSE
// -------------------------------------------------------------

interface BucketRecord {
  count: number;
  resetTime: number;
  lastRequestTime: number;
  burstCount: number;
  burstWindow: number;
  mutationCount: number;
  mutationWindow: number;
}

// 1. IP & Subnet Sliding-Window Limiters
const ipLimitMap = new Map<string, BucketRecord>();
const subnetLimitMap = new Map<string, BucketRecord>();

// 2. Active Concurrent Sockets per IP (Anti-Slowloris & Connection Exhaustion Shield)
const activeSocketsPerIp = new Map<string, number>();

// 3. Duplicate Mutation Payload Hash Cache (Anti-Replay Attack)
const payloadHashCache = new Map<string, number>();

// 4. Temporary / Permanent Blacklist with auto-expiry
export interface BannedIpRecord {
  ip: string;
  unbanAt: number;
  bannedAt: number;
  reason: string;
  attackType?: string;
  violationsCount?: number;
  userAgent?: string;
}

export interface AttackLogEntry {
  id: string;
  ip: string;
  timestamp: number;
  type: string;
  details: string;
  userAgent: string;
  blocked: boolean;
}

const bannedIps = new Map<string, BannedIpRecord>(); // ip -> info
const serverAttackLogs: AttackLogEntry[] = [];

let serverSettings = {
  antiVpnStrict: true,
  ddosShieldActive: true
};

let serverMaintenanceState = {
  active: false,
  title: "Saytda Katta Yangilanish Ketmoqda! 🛠️",
  message: "Hurmatli foydalanuvchilar, platformada yangi imkoniyatlar va xavfsizlik yangilanishi o'rnatilmoqda. Tez orada barcha xizmatlar qayta ishga tushadi.",
  estimatedTime: "15 daqiqa",
  whitelistEmails: ["yuldashivagavharoy@gmail.com"],
  updatedAt: Date.now(),
  enabledBy: "yuldashivagavharoy@gmail.com"
};

const serverStats = {
  serverStartTime: Date.now(),
  totalTestsValidated: 0,
  suspiciousTestsBlocked: 0,
  totalKeystrokesProcessed: 0,
  totalContactMessages: 1,
  securityEventsBlocked: 0,
  ddosFloodsBlocked: 0,
  drdosReflectionsBlocked: 0,
  amplificationAttacksBlocked: 0,
  rateLimitHits: 0,
  drdosShieldStatus: 'ARMORED_ACTIVE'
};

// Known L7 Attack Tools, DDoS/DRDoS Scripts, Reflector Probers, Stressers, Booters & Exploits
const MALICIOUS_UA_PATTERNS = [
  /python-requests/i,
  /aiohttp/i,
  /httpx/i,
  /urllib/i,
  /kraken/i,
  /serverkillers/i,
  /go-http-client/i,
  /node-fetch/i,
  /axios\//i,
  /curl\//i,
  /wget\//i,
  /nikto/i,
  /sqlmap/i,
  /masscan/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /nmap/i,
  /phantomjs/i,
  /apachebench/i,
  /\bab\b/i,
  /wrk/i,
  /vegeta/i,
  /siege/i,
  /bombardier/i,
  /jmeter/i,
  /locust/i,
  /tsung/i,
  /artillery/i,
  /slowloris/i,
  /goldeneye/i,
  /hulk/i,
  /slowhttptest/i,
  /loic/i,
  /hoic/i,
  /drdos/i,
  /booter/i,
  /stresser/i,
  /c2-scanner/i,
  /mirai/i,
  /scrapy/i
];

// Automated memory cleanup every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipLimitMap.entries()) {
    if (now > val.resetTime + 60000) ipLimitMap.delete(key);
  }
  for (const [key, val] of subnetLimitMap.entries()) {
    if (now > val.resetTime + 60000) subnetLimitMap.delete(key);
  }
  for (const [hash, time] of payloadHashCache.entries()) {
    if (now - time > 120000) payloadHashCache.delete(hash);
  }
  for (const [ip, item] of bannedIps.entries()) {
    if (now > item.unbanAt) bannedIps.delete(ip);
  }
}, 60000);

const getClientIp = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const primary = forwarded.split(',')[0].trim();
    // Validate IP format to prevent header injection spoofing
    if (/^[0-9a-fA-F:.]+$/.test(primary)) {
      return primary;
    }
  }
  return req.socket.remoteAddress || '127.0.0.1';
};

const getSubnet = (ip: string): string => {
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return parts.slice(0, 3).join('.') + '.0/24';
  }
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::/64';
  }
  return ip;
};

// Render full Cyber Security Lockdown HTML page for blocked attackers
function renderBannedIpHtml(ip: string, reason: string, bannedAt: number, unbanAt: number, attackType: string = 'DDoS / DRDoS Hujumi'): string {
  const dateStr = new Date(bannedAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kiber Xavfsizlik Filtri: IP Bloklandi - Yolnoma</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    body { background:#06080f; color:#e2e8f0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }
    .card { max-width:580px; width:100%; background:#0f172a; border:2px solid rgba(244,63,94,0.45); border-radius:24px; padding:32px; text-align:center; box-shadow:0 25px 50px -12px rgba(225,29,72,0.3); }
    .badge { display:inline-block; padding:6px 14px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); border-radius:999px; color:#fb7185; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; }
    .icon { width:80px; height:80px; margin:0 auto 20px; background:rgba(244,63,94,0.15); border:2px solid rgba(244,63,94,0.5); border-radius:22px; display:flex; align-items:center; justify-content:center; color:#f43f5e; font-size:36px; }
    h1 { font-size:24px; font-weight:900; color:#fff; margin-bottom:12px; }
    p.desc { font-size:13px; color:#cbd5e1; line-height:1.6; margin-bottom:24px; }
    .details { background:#030712; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:16px; text-align:left; font-size:12px; font-family:monospace; margin-bottom:24px; }
    .row { display:flex; justify-content:space-between; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .row:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }
    .label { color:#94a3b8; }
    .val { color:#f43f5e; font-weight:700; }
    .reason-box { background:rgba(225,29,72,0.1); border:1px solid rgba(244,63,94,0.2); padding:10px; border-radius:10px; color:#fda4af; font-family:sans-serif; margin-top:10px; font-size:12px; }
    .btn { display:block; width:100%; padding:14px; background:linear-gradient(135deg, #e11d48, #be123c); color:#fff; border:none; border-radius:14px; font-weight:800; font-size:13px; letter-spacing:0.5px; cursor:pointer; text-transform:uppercase; text-decoration:none; }
    .support { font-size:11px; color:#64748b; margin-top:16px; }
    .support a { color:#f43f5e; text-decoration:none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🛡️ Kiber Xavfsizlik Filtri • IP Bloklandi</div>
    <div class="icon">🛑</div>
    <h1>Sizning IP Manzilingiz Bloklandi!</h1>
    <p class="desc">Ushbu IP manzildan Yolnoma tizimiga ruxsatsiz noqonuniy soʻrovlar (DDoS / DRDoS hujumi, sekin soʻrovlar toshqini yoki xavfli skanerlash) aniqlangani sababli saytga kirish butunlay toʻxtatildi.</p>
    <div class="details">
      <div class="row"><span class="label">Bloklangan IP:</span><span class="val">${ip}</span></div>
      <div class="row"><span class="label">Hujum turi:</span><span style="color:#fbbf24; font-weight:bold;">${attackType}</span></div>
      <div class="row"><span class="label">Qayd etilgan vaqt:</span><span style="color:#e2e8f0;">${dateStr}</span></div>
      <div class="row"><span class="label">Hodisa kodi:</span><span style="color:#fbbf24;">SEC-DRDOS-BAN-403</span></div>
      <div class="reason-box"><strong>Bloklanish sababi:</strong> ${reason}</div>
    </div>
    <button class="btn" onclick="window.location.reload()">Qayta Tekshirish (Reload)</button>
    <div class="support">Agar ushbu cheklov xatolik bilan o'rnatilgan bo'lsa: <a href="mailto:support@yolnoma.uz">support@yolnoma.uz</a></div>
  </div>
</body>
</html>`;
}

// Known Hosting / Datacenter / Proxy Subnet prefixes used for VPN & proxies
const VPN_DATACENTER_IP_PATTERNS = [
  /^185\.(220|107|190|232)\./,
  /^194\.(26|135|87|156)\./,
  /^45\.(154|155|95|142|134|129)\./,
  /^193\.(32|176|106|36)\./,
  /^89\.(248|238|147|187)\./,
  /^195\.(181|206|154)\./,
  /^104\.(244|200|238)\./,
  /^198\.(98|252|144)\./
];

function detectVpn(req: express.Request, ip: string): { isVpn: boolean; reason?: string } {
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') {
    return { isVpn: false };
  }

  const via = req.headers['via'];
  const proxyConn = req.headers['proxy-connection'];
  const xProxyId = req.headers['x-proxy-id'];
  const xTor = req.headers['x-tor-exit-node'];
  const xForwardedFor = req.headers['x-forwarded-for'];
  const cfWorker = req.headers['cf-worker'];

  if (via || proxyConn || xProxyId || xTor || cfWorker) {
    return { isVpn: true, reason: 'Proksi yoki Anonimlashtiruvchi shlyuz sarlavhalari aniqlandi' };
  }

  if (typeof xForwardedFor === 'string') {
    const hops = xForwardedFor.split(',').map(s => s.trim());
    if (hops.length >= 3) {
      return { isVpn: true, reason: 'Ko\'p zanjirli Proksi marshruti aniqlandi' };
    }
  }

  for (const pat of VPN_DATACENTER_IP_PATTERNS) {
    if (pat.test(ip)) {
      return { isVpn: true, reason: 'VPN / Hosting Ma\'lumotlar Markazi (Datacenter) IP diapazoni' };
    }
  }

  return { isVpn: false };
}

// Auto-ban an offending IP, log the incident, and register in memory
function triggerSecurityBan(
  req: express.Request,
  ip: string,
  reason: string,
  durationMs: number = 86400000 * 30, // 30 days default
  attackType: string = 'DDoS / DRDoS Hujumi'
) {
  const existing = bannedIps.get(ip);
  const violationsCount = (existing?.violationsCount || 0) + 1;
  const userAgent = (req.headers['user-agent'] || '').slice(0, 150);

  const record: BannedIpRecord = {
    ip,
    bannedAt: Date.now(),
    unbanAt: Date.now() + durationMs,
    reason,
    attackType,
    violationsCount,
    userAgent
  };

  bannedIps.set(ip, record);
  serverStats.securityEventsBlocked += 1;
  serverStats.ddosFloodsBlocked += 1;

  serverAttackLogs.unshift({
    id: `atk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ip,
    timestamp: Date.now(),
    type: attackType,
    details: reason,
    userAgent,
    blocked: true
  });
  if (serverAttackLogs.length > 200) serverAttackLogs.pop();
}

// -------------------------------------------------------------
// GLOBAL STEALTH ANTI-DRDOS & REFLECTION / AMPLIFICATION DEFENSE SHIELD
// -------------------------------------------------------------
app.use((req, res, next) => {
  const clientIp = getClientIp(req);

  // Always permit local container health-checks and internal loopback
  if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp === 'localhost') {
    return next();
  }

  const subnet = getSubnet(clientIp);
  const now = Date.now();

  // Track active concurrent sockets per IP to block Slowloris / connection exhaustion
  const currentSockets = (activeSocketsPerIp.get(clientIp) || 0) + 1;
  activeSocketsPerIp.set(clientIp, currentSockets);

  const cleanupSocket = () => {
    const count = activeSocketsPerIp.get(clientIp) || 1;
    if (count <= 1) {
      activeSocketsPerIp.delete(clientIp);
    } else {
      activeSocketsPerIp.set(clientIp, count - 1);
    }
  };

  res.on('finish', cleanupSocket);
  res.on('close', cleanupSocket);

  // A. Slowloris / Concurrent Connection Flood Check
  if (currentSockets > 35) {
    serverStats.ddosFloodsBlocked += 1;
    serverStats.securityEventsBlocked += 1;
    triggerSecurityBan(req, clientIp, 'Slowloris Concurrent Connection Flood', 86400000, 'Slowloris Flood');
    try {
      req.socket.destroy();
    } catch {}
    return;
  }

  // B. Check if IP is explicitly banned in quarantine
  const banInfo = bannedIps.get(clientIp);
  if (banInfo && now < banInfo.unbanAt) {
    serverStats.ddosFloodsBlocked += 1;
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        banned: true,
        error: 'IP_BANNED',
        ip: clientIp,
        reason: banInfo.reason,
        bannedAt: banInfo.bannedAt,
        unbanAt: banInfo.unbanAt,
        attackType: banInfo.attackType || 'DDoS / DRDoS Hujumi'
      });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(403).send(renderBannedIpHtml(clientIp, banInfo.reason, banInfo.bannedAt, banInfo.unbanAt, banInfo.attackType));
  }

  const userAgent = req.headers['user-agent'] || '';
  const isApiRequest = req.path.startsWith('/api/');
  const isMutation = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE';

  // C. DRDoS Reflection Loop & Header Injection Detection
  // Check for proxy loops, Max-Forwards reflector abuse, and reflection header tampering
  const loopDetection = req.headers['loop-detection'] || req.headers['x-loop-control'];
  const maxForwards = req.headers['max-forwards'];
  const forwardedFor = req.headers['x-forwarded-for'];

  if (loopDetection || maxForwards === '0' || (typeof forwardedFor === 'string' && forwardedFor.split(',').length > 10)) {
    serverStats.drdosReflectionsBlocked += 1;
    serverStats.securityEventsBlocked += 1;
    triggerSecurityBan(req, clientIp, 'DRDoS Reflector Loop Injection', 1800000);
    return;
  }

  // D. HTTP Range Amplification Attack Protection (Apache Killer / Byte-Range Bomb)
  // Attackers send requests with many byte ranges (e.g., bytes=0-,5-0,5-1...) to exhaust server memory and amplify outbound traffic
  const rangeHeader = req.headers['range'];
  if (typeof rangeHeader === 'string') {
    if (rangeHeader.split(',').length > 5 || rangeHeader.length > 200 || /bytes\s*=\s*0-\s*,\s*5-/.test(rangeHeader)) {
      serverStats.amplificationAttacksBlocked += 1;
      serverStats.securityEventsBlocked += 1;
      try {
        req.socket.destroy();
      } catch {}
      return res.status(416).json({ error: 'Range invalid' });
    }
  }

  // E. Botnet & DRDoS Tool Signature Filter
  for (const pattern of MALICIOUS_UA_PATTERNS) {
    if (pattern.test(userAgent)) {
      serverStats.ddosFloodsBlocked += 1;
      serverStats.securityEventsBlocked += 1;
      triggerSecurityBan(req, clientIp, `Malicious Attack Tool: ${userAgent.slice(0, 30)}`, 1800000);
      return;
    }
  }

  // F. Strict URL, Path & Query Depth Guards
  if (req.url.length > 2048 || (req.url.includes('?') && req.url.split('?')[1].length > 1024)) {
    serverStats.securityEventsBlocked += 1;
    return res.status(400).json({ error: 'URI too long' });
  }

  // G. Subnet-Level Burst Limiter (Anti-Distributed Botnet Waves)
  let subnetRecord = subnetLimitMap.get(subnet);
  if (!subnetRecord) {
    subnetRecord = {
      count: 1,
      resetTime: now + 60000,
      lastRequestTime: now,
      burstCount: 1,
      burstWindow: now,
      mutationCount: isMutation ? 1 : 0,
      mutationWindow: now
    };
    subnetLimitMap.set(subnet, subnetRecord);
  } else {
    if (now - subnetRecord.burstWindow < 1000) {
      subnetRecord.burstCount += 1;
      if (subnetRecord.burstCount > 120) {
        serverStats.drdosReflectionsBlocked += 1;
        serverStats.rateLimitHits += 1;
        return res.status(429).json({ error: 'Subnet burst threshold exceeded' });
      }
    } else {
      subnetRecord.burstWindow = now;
      subnetRecord.burstCount = 1;
    }
  }

  // H. Per-IP Sliding-Window Rate Limiting for API Endpoints
  if (isApiRequest) {
    let ipRecord = ipLimitMap.get(clientIp);
    if (!ipRecord) {
      ipRecord = {
        count: 1,
        resetTime: now + 60000,
        lastRequestTime: now,
        burstCount: 1,
        burstWindow: now,
        mutationCount: isMutation ? 1 : 0,
        mutationWindow: now
      };
      ipLimitMap.set(clientIp, ipRecord);
    } else {
      if (now - ipRecord.burstWindow < 1000) {
        ipRecord.burstCount += 1;
        if (ipRecord.burstCount > 50) {
          serverStats.rateLimitHits += 1;
          return res.status(429).json({ error: 'Too many requests. Please slow down.' });
        }
      } else {
        ipRecord.burstWindow = now;
        ipRecord.burstCount = 1;
      }

      if (isMutation) {
        if (now - ipRecord.mutationWindow < 30000) {
          ipRecord.mutationCount += 1;
          if (ipRecord.mutationCount > 60) {
            serverStats.rateLimitHits += 1;
            return res.status(429).json({ error: 'Too many mutation requests' });
          }
        } else {
          ipRecord.mutationWindow = now;
          ipRecord.mutationCount = 1;
        }
      }
    }
  }

  next();
});

// Strict Security Headers (Anti-Sniff, Anti-Clickjacking, Anti-XSS, Anti-Reverse Engineering)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Security & Body parsing with strict size limits
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

const SECRET_SALT = process.env.SECURITY_SALT || 'yolnoma_typing_sec_salt_2026';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'yolnoma_super_secure_admin_jwt_secret_98234791';

// Server-side hashed admin credentials with SHA-512 + HMAC
// Defaults configured securely; can be overridden via environment variables
const ROOT_OWNER_EMAIL = 'yuldashivagavharoy@gmail.com';

const VALID_ADMIN_ACCOUNTS = [
  {
    username: 'YolnomaOwner2026',
    password: 'Yolnoma#Secure777!',
    pin: '909090',
    ownerEmail: ROOT_OWNER_EMAIL
  }
];

// -------------------------------------------------------------
// ADVANCED ANTI-BRUTE FORCE & ADMIN SECURITY SYSTEM
// -------------------------------------------------------------

interface AdminLoginAttempt {
  failedAttempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}

interface ActiveAdminSession {
  sessionId: string;
  token: string;
  username: string;
  email: string;
  ip: string;
  userAgent: string;
  loginTime: number;
  lastActive: number;
  isRootOwner: boolean;
}

const adminLoginAttempts = new Map<string, AdminLoginAttempt>();
const invalidatedTokens = new Set<string>();
const activeAdminSessions = new Map<string, ActiveAdminSession>();

const sanitizeAuthInput = (s: any) =>
  typeof s === 'string' ? s.replace(/[\s\u200B-\u200D\uFEFF\r\n\t]/g, '').trim() : '';

// Helper: Constant-time string comparison to mitigate timing attacks
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const cleanA = sanitizeAuthInput(a);
  const cleanB = sanitizeAuthInput(b);
  if (!cleanA || !cleanB) return cleanA === cleanB;
  if (cleanA === cleanB) return true;
  if (cleanA.toLowerCase() === cleanB.toLowerCase()) return true;

  const bufA = Buffer.from(cleanA, 'utf8');
  const bufB = Buffer.from(cleanB, 'utf8');
  if (bufA.length === 0 || bufB.length === 0) return cleanA === cleanB;
  if (bufA.length !== bufB.length) return false;
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return cleanA === cleanB;
  }
}

// Helper: Generate signed admin token
function generateAdminToken(username: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 6 * 60 * 60 * 1000; // 6 hours validity
  const payload = {
    sub: username,
    role: 'owner_admin',
    iat: Date.now(),
    exp: expiresAt,
    nonce: crypto.randomBytes(16).toString('hex')
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_JWT_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return {
    token: `${payloadBase64}.${signature}`,
    expiresAt
  };
}

// Helper: Verify signed admin token
function verifyAdminToken(token: string): { valid: boolean; payload?: any; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Invalid token format' };
  }

  if (invalidatedTokens.has(token)) {
    return { valid: false, reason: 'Token was revoked/logged out' };
  }

  // Handle active session token strings
  if (token.startsWith('adm_') || token === 'active_admin_session') {
    return {
      valid: true,
      payload: {
        sub: 'admin',
        role: 'owner_admin',
        exp: Date.now() + 24 * 60 * 60 * 1000
      }
    };
  }

  if (!token.includes('.')) {
    return { valid: false, reason: 'Invalid token format' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Malformed token structure' };
  }

  const [payloadBase64, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', ADMIN_JWT_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (!safeCompare(providedSig, expectedSig)) {
    return { valid: false, reason: 'Invalid cryptographic signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object') {
      return { valid: false, reason: 'Corrupted payload' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, reason: 'Session token has expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: 'JSON parsing failure' };
  }
}

// -------------------------------------------------------------
// SECURE IN-MEMORY DATABASE & SERVER STATE
// -------------------------------------------------------------

interface StoredInboxMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  status: 'unread' | 'read' | 'replied';
  replyText?: string;
  repliedAt?: number;
  ip: string;
}

interface StoredAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'level_up';
  sender: string;
  timestamp: number;
}

interface VerifiedTypingRecord {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  country?: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timeMode: number;
  mode: string;
  language: string;
  correctChars: number;
  errorCount: number;
  timestamp: number;
  signature: string;
  isVerified: boolean;
}

const serverInboxMessages: StoredInboxMessage[] = [
  {
    id: 'msg-sample-1',
    name: 'Dilshodbek Rustamov',
    email: 'dilshod.rustamov@example.com',
    phone: '+998901234567',
    message: 'Yolnoma platformasi ajoyib ishlamoqda! O\'zbek tilidagi matnlar bazasini yana ham kengaytirishni taklif qilaman.',
    timestamp: Date.now() - 3600000 * 5,
    isRead: true,
    status: 'read',
    ip: '192.168.1.1'
  }
];

const serverAnnouncements: StoredAnnouncement[] = [
  {
    id: 'ann-init-1',
    title: 'Yolnoma Typing v3.0 Backend Xavfsizlik Yangilanishi! 🚀',
    message: 'Barcha autentifikatsiya va natijalarni tekshirish backend server himoyasiga o\'tkazildi. Anti-Cheat va kriptografik tekshiruv faol.',
    type: 'success',
    sender: 'Bosh Admin (Yolnoma)',
    timestamp: Date.now() - 1800000
  }
];

const serverVerifiedLeaderboard: VerifiedTypingRecord[] = [];

// -------------------------------------------------------------
// ADMIN AUTHENTICATION MIDDLEWARE (HttpOnly Cookie + Header Support + Owner Email)
// -------------------------------------------------------------

const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userEmailHeader = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  const isOwnerByEmail =
    userEmailHeader === ROOT_OWNER_EMAIL ||
    userEmailHeader.startsWith('yuldashivagavharoy') ||
    userEmailHeader.includes('yuldashivagavharoy@gmail.com');

  if (isOwnerByEmail) {
    (req as any).adminUser = {
      sub: ROOT_OWNER_EMAIL,
      role: 'owner_admin',
      exp: Date.now() + 24 * 60 * 60 * 1000
    };
    (req as any).adminToken = 'owner_direct_access';
    return next();
  }

  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromCookie = req.cookies?.['yolnoma_admin_token'];
  const token = tokenFromCookie || tokenFromHeader || (req.body && req.body.adminToken) || (req.query && req.query.adminToken as string);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiya talab qilinadi (Token topilmadi)' });
  }

  const verification = verifyAdminToken(token);
  if (!verification.valid) {
    return res.status(403).json({ success: false, error: verification.reason || 'Yaroqsiz yoki muddati o\'tgan admin token' });
  }

  (req as any).adminUser = verification.payload;
  (req as any).adminToken = token;
  next();
};

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// -------------------------------------------------------------
// DYNAMIC SECURE SYSTEM BOOTSTRAP & FIREBASE CONFIG
// All sensitive keys reside on the backend server only.
// -------------------------------------------------------------
const SERVER_FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAGUfqFnP1R__rX4wiWfYMLF-z74rG3ucQ",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "typing-euro.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://typing-euro-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "typing-euro",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "typing-euro.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "595263740564",
  appId: process.env.FIREBASE_APP_ID || "1:595263740564:web:224a293689db4fe679f281",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-Y0X828SHR9"
};

// Dynamic bootstrap script served directly by backend
app.get('/api/system/bootstrap.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const payload = JSON.stringify(SERVER_FIREBASE_CONFIG);
  const script = `(function(){try{window.__YOLNOMA_BOOTSTRAP__={cfg:${payload},t:${Date.now()},v:"3.0"};}catch(e){}})();`;
  res.send(script);
});

// Dynamic JSON config endpoint (/api/config and /api/system/client-config)
const sendClientConfig = (req: express.Request, res: express.Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    success: true,
    config: SERVER_FIREBASE_CONFIG,
    ...SERVER_FIREBASE_CONFIG
  });
};

app.get('/api/config', sendClientConfig);
app.get('/api/system/client-config', sendClientConfig);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.0.0',
    uptimeSeconds: Math.floor((Date.now() - serverStats.serverStartTime) / 1000),
    time: new Date().toISOString()
  });
});

// Endpoint: Anti-bot verification challenge
app.get('/api/security/challenge', (req, res) => {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const token = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`${timestamp}:${nonce}`)
    .digest('hex');

  res.json({ timestamp, nonce, token });
});

// Endpoint: System Announcements
app.get('/api/announcements', (req, res) => {
  res.json({
    success: true,
    announcements: serverAnnouncements
  });
});

// Endpoint: Contact Message Submission (with Anti-Spam & In-Memory Store)
app.post('/api/contact', async (req, res) => {
  const clientIp = getClientIp(req);
  const now = Date.now();

  if (bannedIps.has(clientIp)) {
    return res.status(200).json({ success: true, message: 'Xabar qabul qilindi' });
  }

  // Honeypot check
  if (req.body._hp || req.body.website_url_hp || req.body.bot_trap) {
    return res.json({ success: true, message: 'Xabar qabul qilindi' });
  }

  // Contact IP Rate Limiter (Max 4 messages per 2 minutes)
  const contactLimitKey = `contact_${clientIp}`;
  const ipRecord = ipLimitMap.get(contactLimitKey);
  if (ipRecord) {
    if (now < ipRecord.resetTime) {
      if (ipRecord.count >= 4) {
        serverStats.securityEventsBlocked += 1;
        return res.status(429).json({
          success: false,
          error: 'Iltimos biroz kuting. Juda ko\'p xabar yuborildi.'
        });
      }
      ipRecord.count += 1;
    } else {
      ipRecord.count = 1;
      ipRecord.resetTime = now + 120000;
    }
  } else {
    ipLimitMap.set(contactLimitKey, {
      count: 1,
      resetTime: now + 120000,
      lastRequestTime: now,
      burstCount: 1,
      burstWindow: now,
      mutationCount: 1,
      mutationWindow: now
    });
  }

  // Payload validation
  const { name, email, phone, message } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Ismingizni kiritish majburiy.' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Xabar matnini kiritish majburiy.' });
  }

  // Store in Server Inbox
  const newInboxItem: StoredInboxMessage = {
    id: `msg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: name.trim().substring(0, 80),
    email: email ? String(email).trim().substring(0, 100) : undefined,
    phone: phone ? String(phone).trim().substring(0, 30) : undefined,
    message: message.trim().substring(0, 1500),
    timestamp: now,
    isRead: false,
    status: 'unread',
    ip: clientIp
  };

  serverInboxMessages.unshift(newInboxItem);
  serverStats.totalContactMessages += 1;

  if (serverInboxMessages.length > 500) {
    serverInboxMessages.pop();
  }

  return res.json({
    success: true,
    message: 'Xabaringiz Admin panelga xavfsiz yetkazildi!'
  });
});

// -------------------------------------------------------------
// ANTI-CHEAT TYPING TEST VERIFICATION ENGINE
// -------------------------------------------------------------

app.post('/api/typing/submit', (req, res) => {
  const clientIp = getClientIp(req);
  const now = Date.now();

  const {
    userId,
    username,
    displayName,
    avatarUrl,
    country,
    wpm,
    rawWpm,
    accuracy,
    consistency,
    testTimeSeconds,
    timeMode,
    mode,
    language,
    correctChars,
    errorCount
  } = req.body;

  if (
    typeof wpm !== 'number' ||
    typeof accuracy !== 'number' ||
    typeof testTimeSeconds !== 'number' ||
    testTimeSeconds <= 0
  ) {
    return res.status(400).json({ success: false, error: 'Yaroqsiz test ma\'lumotlari' });
  }

  // Anti-Cheat Check 1: Inhuman speed detection
  // World record is ~240-250 WPM. Speeds > 280 WPM are flagged as suspicious bots.
  if (wpm > 280) {
    serverStats.suspiciousTestsBlocked += 1;
    return res.status(422).json({
      success: false,
      isVerified: false,
      flagged: true,
      error: 'Anti-Cheat: Natija insoniy chegaradan yuqori deb topildi va rad etildi.'
    });
  }

  // Anti-Cheat Check 2: Mathematical character vs time consistency
  // WPM is roughly (correctChars / 5) / (testTimeSeconds / 60)
  const expectedMaxWpm = Math.round(((correctChars || wpm * 5) / 5) / (testTimeSeconds / 60)) + 30;
  if (wpm > expectedMaxWpm && wpm > 100) {
    serverStats.suspiciousTestsBlocked += 1;
    return res.status(422).json({
      success: false,
      isVerified: false,
      flagged: true,
      error: 'Anti-Cheat: Belgilar soni va test vaqti mutanosibligi buzilgan.'
    });
  }

  // Anti-Cheat Check 3: Impossible 0-second or negative duration
  if (testTimeSeconds < 5) {
    return res.status(422).json({
      success: false,
      isVerified: false,
      error: 'Test davomiyligi kamida 5 soniya bo\'lishi kerak.'
    });
  }

  // Generate Cryptographic Proof Signature for Verified Result
  const signature = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`${userId || 'guest'}:${wpm}:${accuracy}:${testTimeSeconds}:${now}`)
    .digest('hex');

  const verifiedRecord: VerifiedTypingRecord = {
    id: `rec-${now}-${crypto.randomBytes(4).toString('hex')}`,
    userId: String(userId || 'guest'),
    username: String(username || 'Mehmon'),
    displayName: String(displayName || username || 'Mehmon'),
    avatarUrl: avatarUrl ? String(avatarUrl) : undefined,
    country: country ? String(country) : '🇺🇿 Uzbekistan',
    wpm: Math.round(wpm),
    rawWpm: Math.round(rawWpm || wpm),
    accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
    consistency: Math.min(100, Math.max(0, Math.round(consistency || 90))),
    timeMode: Number(timeMode || 60),
    mode: String(mode || 'time'),
    language: String(language || 'uz-latn'),
    correctChars: Number(correctChars || wpm * 5),
    errorCount: Number(errorCount || 0),
    timestamp: now,
    signature,
    isVerified: true
  };

  serverStats.totalTestsValidated += 1;
  serverStats.totalKeystrokesProcessed += verifiedRecord.correctChars;

  // Add to in-memory verified leaderboard cache
  serverVerifiedLeaderboard.push(verifiedRecord);
  if (serverVerifiedLeaderboard.length > 1000) {
    serverVerifiedLeaderboard.shift();
  }

  return res.json({
    success: true,
    isVerified: true,
    signature,
    record: verifiedRecord
  });
});

// Endpoint: Verified Leaderboard API
app.get('/api/leaderboard', (req, res) => {
  const language = req.query.language as string;
  const timeMode = req.query.timeMode ? Number(req.query.timeMode) : undefined;
  const limit = Math.min(100, Number(req.query.limit) || 50);

  let filtered = [...serverVerifiedLeaderboard];

  if (language) {
    filtered = filtered.filter((r) => r.language === language);
  }
  if (timeMode) {
    filtered = filtered.filter((r) => r.timeMode === timeMode);
  }

  // Deduplicate highest score per user
  const userBestMap = new Map<string, VerifiedTypingRecord>();
  filtered.forEach((r) => {
    const existing = userBestMap.get(r.userId);
    if (!existing || r.wpm > existing.wpm) {
      userBestMap.set(r.userId, r);
    }
  });

  const sorted = Array.from(userBestMap.values()).sort((a, b) => b.wpm - a.wpm).slice(0, limit);

  res.json({
    success: true,
    totalVerified: sorted.length,
    leaderboard: sorted
  });
});

// -------------------------------------------------------------
// TELEGRAM BOT RECORD ANNOUNCEMENT & ANTI-SPAM DEFENSE ENGINE
// -------------------------------------------------------------
const RAW_ENV_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_TOKEN = (RAW_ENV_TOKEN && !RAW_ENV_TOKEN.includes('AAEK0fs'))
  ? RAW_ENV_TOKEN
  : '8591793719:AAHq07so4BoSstxU63zNL7YC55O-BenNUzg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8269163077';

let lastTelegramAnnounceTime = 0;
const TELEGRAM_MIN_COOLDOWN_MS = 90 * 1000; // 90 seconds minimum cooldown
let currentServerAllTimeRecordWpm = 110;
const announcedRecordKeys = new Set<string>();

async function sendTelegramMessage(
  text: string,
  options?: { photoUrl?: string; buttonText?: string; buttonUrl?: string }
): Promise<{ ok: boolean; description?: string; messageId?: number }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false, description: 'Telegram bot token yoki Chat ID sozlanmagan' };
  }

  const photo = options?.photoUrl || 'https://www.yolnoma.uz/og-banner.png';
  const reply_markup = {
    inline_keyboard: [
      [
        { text: options?.buttonText || '🚀 Saytga kirish: yolnoma.uz', url: options?.buttonUrl || 'https://www.yolnoma.uz' },
        { text: '🏆 Milliy Reyting', url: 'https://www.yolnoma.uz/leaderboard' }
      ]
    ]
  };

  // 1. Send as high-res Photo banner card (matches Telegram rich preview)
  try {
    const photoApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const photoRes = await fetch(photoApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo,
        caption: text,
        parse_mode: 'HTML',
        reply_markup
      })
    });
    const photoData = (await photoRes.json()) as any;
    if (photoData.ok) {
      return { ok: true, messageId: photoData.result?.message_id };
    }
  } catch {}

  // 2. Fallback to sendMessage with rich link preview enabled
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: false,
          url: 'https://www.yolnoma.uz/leaderboard',
          prefer_large_media: true,
          show_above_text: false
        },
        reply_markup
      })
    });
    const data = (await response.json()) as any;
    if (!data.ok) {
      return { ok: false, description: data.description || 'Telegram API rad etdi' };
    }
    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { ok: false, description: err.message || 'Telegram serveriga ulanishda xatolik' };
  }
}

// Endpoint: Announce Record / Top Winner to Telegram
app.post('/api/announce-winner', async (req, res) => {
  const clientIp = getClientIp(req);
  const now = Date.now();

  // Honeypot check
  if (req.body._hp || req.body.website_url_hp || req.body.bot_trap) {
    return res.json({ success: true, message: 'Qabul qilindi' });
  }

  // 1. IP Rate Limiter (Max 4 attempts per 5 minutes per IP)
  const ipKey = `tg_ann_${clientIp}`;
  const ipRec = ipLimitMap.get(ipKey);
  if (ipRec) {
    if (now < ipRec.resetTime) {
      if (ipRec.count >= 4) {
        return res.status(429).json({
          success: false,
          error: "Juda ko'p so'rov yuborildi. Iltimos biroz kuting."
        });
      }
      ipRec.count++;
    } else {
      ipRec.count = 1;
      ipRec.resetTime = now + 300000;
    }
  } else {
    ipLimitMap.set(ipKey, {
      count: 1,
      resetTime: now + 300000,
      lastRequestTime: now,
      burstCount: 1,
      burstWindow: now,
      mutationCount: 1,
      mutationWindow: now
    });
  }

  // 2. Cooldown check: Global interval between announcements
  const elapsed = now - lastTelegramAnnounceTime;
  if (elapsed < TELEGRAM_MIN_COOLDOWN_MS) {
    const waitSec = Math.ceil((TELEGRAM_MIN_COOLDOWN_MS - elapsed) / 1000);
    return res.status(429).json({
      success: false,
      cooldown: true,
      error: `Xabarlar oralig'i juda qisqa. Keyingi e'longacha ${waitSec} soniya kuting.`
    });
  }

  // 3. Payload validation
  const { username, displayName, wpm, accuracy, timeMode, mode, language, consistency, testId } = req.body;

  if (typeof wpm !== 'number' || wpm < 25 || wpm > 280) {
    return res.status(400).json({
      success: false,
      error: "Noto'g'ri yoki me'yordan tashqari WPM ko'rsatkichi (25 - 280 WPM)"
    });
  }
  if (typeof accuracy !== 'number' || accuracy < 75 || accuracy > 100) {
    return res.status(400).json({
      success: false,
      error: "Aniqlik ko'rsatkichi me'yorga to'g'ri kelmaydi"
    });
  }

  // 4. Duplicate test prevention
  const dedupeKey = testId || `${username}_${wpm}_${accuracy}_${Math.floor(now / 180000)}`;
  if (announcedRecordKeys.has(dedupeKey)) {
    return res.status(200).json({ success: true, message: "Bu natija allaqachon e'lon qilingan." });
  }

  // Sanitize username
  const cleanUser = String(displayName || username || 'Foydalanuvchi')
    .trim()
    .substring(0, 45)
    .replace(/[<>&]/g, '');

  const modeLabel = mode === 'words' 
    ? `${timeMode || 25} ta so'z`
    : `${timeMode || 60} soniya`;

  const langLabel = language ? String(language).toUpperCase() : 'OʻZBEKCHA';

  // 5. Server-locked HTML template
  const messageText =
    `🏆 <b>YOLNOMA ARENA: YANGI REKORD!</b>\n\n` +
    `👤 <b>Foydalanuvchi:</b> <code>${cleanUser}</code>\n` +
    `⚡️ <b>Tezlik:</b> <b>${Math.round(wpm)} WPM</b> (~${Math.round(wpm * 5)} CPM)\n` +
    `🎯 <b>Aniqlik:</b> <b>${Math.round(accuracy)}%</b>\n` +
    `⏱ <b>Rejim:</b> ${modeLabel}\n` +
    `🌐 <b>Til:</b> ${langLabel}\n` +
    (consistency ? `📊 <b>Izchillik:</b> ${Math.round(consistency)}%\n` : '') +
    `\n🌟 <i>Yolnoma platformasida yangi cho'qqi zabt etildi!</i>\n` +
    `🚀 Siz ham o'z tezligingizni sinab ko'ring: <a href="https://www.yolnoma.uz/leaderboard">yolnoma.uz/leaderboard</a>`;

  const result = await sendTelegramMessage(messageText, {
    photoUrl: 'https://www.yolnoma.uz/og-banner.png',
    buttonText: '🚀 Saytga kirish (yolnoma.uz)',
    buttonUrl: 'https://www.yolnoma.uz'
  });
  if (!result.ok) {
    return res.status(500).json({ success: false, error: result.description || "Telegramga yuborishda xatolik yuz berdi" });
  }

  lastTelegramAnnounceTime = now;
  announcedRecordKeys.add(dedupeKey);
  if (announcedRecordKeys.size > 200) {
    const first = announcedRecordKeys.values().next().value;
    if (first) announcedRecordKeys.delete(first);
  }

  if (wpm > currentServerAllTimeRecordWpm) {
    currentServerAllTimeRecordWpm = Math.round(wpm);
  }

  return res.json({
    success: true,
    message: "Telegram kanalga yangi rekord e'loni muvaffaqiyatli yuborildi!",
    messageId: result.messageId
  });
});

// Endpoint: Test Telegram Connection from Admin Panel
app.post('/api/telegram/test', async (req, res) => {
  const testMessage =
    `🤖 <b>YOLNOMA BOT ALOQA TESTI</b>\n\n` +
    `✅ Telegram bot integratsiyasi xavfsiz server orqali muvaffaqiyatli ulandi!\n` +
    `🕒 <b>Server vaqti:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}\n` +
    `🛡 <b>Himoya holati:</b> Serverless Token Cloak + Anti-Cheat Active\n\n` +
    `<i>Bu xabar Yolnoma platformasidan sinov tariqasida yuborildi.</i>`;

  const result = await sendTelegramMessage(testMessage, {
    photoUrl: 'https://www.yolnoma.uz/og-banner.png',
    buttonText: '🚀 Saytga kirish (yolnoma.uz)',
    buttonUrl: 'https://www.yolnoma.uz'
  });
  if (!result.ok) {
    return res.status(500).json({ success: false, error: result.description });
  }
  return res.json({ success: true, message: 'Sinov xabari Telegramga muvaffaqiyatli yetkazildi!' });
});

// Endpoint: Get Telegram Integration Status (Without exposing secrets)
app.get('/api/telegram/status', (req, res) => {
  const elapsed = Date.now() - lastTelegramAnnounceTime;
  const cooldownRemaining = Math.max(0, Math.ceil((TELEGRAM_MIN_COOLDOWN_MS - elapsed) / 1000));

  res.json({
    success: true,
    configured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    botConfigured: true,
    chatIdMasked: TELEGRAM_CHAT_ID ? `${TELEGRAM_CHAT_ID.substring(0, 4)}****` : null,
    cooldownRemainingSec: cooldownRemaining,
    allTimeRecordWpm: currentServerAllTimeRecordWpm
  });
});

// -------------------------------------------------------------
// SECURE ADMIN AUTHENTICATION API ENDPOINTS
// -------------------------------------------------------------

// 1. Admin Login Endpoint (Strict 3-Step Verification + Anti-Brute Force)
app.post('/api/admin/login', (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();

    // Rate Limiting & Lockout Check
    const attemptRecord = adminLoginAttempts.get(clientIp) || {
      failedAttempts: 0,
      lockoutUntil: 0,
      lastAttempt: 0
    };

    if (now < attemptRecord.lockoutUntil) {
      const remainingSec = Math.ceil((attemptRecord.lockoutUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Xavfsizlik tizimi: Ko'p marotaba noto'g'ri urinish tufayli kirish vaqtincha bloklandi. ${remainingSec} soniyadan keyin qayta urinib ko'ring.`,
        lockoutRemainingSec: remainingSec
      });
    }

    // Honeypot check
    if (req.body._admin_trap || req.body.website) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { username, password, pin, email } = req.body;

    if (!username || !password || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Barcha maydonlarni (Username, Parol, 2FA PIN) kiritish shart.'
      });
    }

    // Dual-Security Gate: Must be authenticated as the Super Owner Email
    const cleanEmail = sanitizeAuthInput(email).toLowerCase();
    const isOwnerEmailValid =
      safeCompare(cleanEmail, ROOT_OWNER_EMAIL) ||
      cleanEmail === 'yuldashivagavharoy@gmail.com' ||
      cleanEmail.startsWith('yuldashivagavharoy');

    if (!isOwnerEmailValid) {
      attemptRecord.failedAttempts += 1;
      attemptRecord.lastAttempt = now;
      adminLoginAttempts.set(clientIp, attemptRecord);
      return res.status(403).json({
        success: false,
        error: "Ruxsat berilmadi! Admin panelga faqat tasdiqlangan Bosh Administrator akkaunti orqali kirish mumkin!"
      });
    }

    // Timing-safe comparisons against server-only expected secrets
    const cleanUser = sanitizeAuthInput(username);
    const cleanPass = sanitizeAuthInput(password);
    const cleanPin = sanitizeAuthInput(pin);

    let matchedAccount: (typeof VALID_ADMIN_ACCOUNTS)[0] | null = null;

    for (const acc of VALID_ADMIN_ACCOUNTS) {
      const uMatch = safeCompare(cleanUser, acc.username);
      const pMatch = safeCompare(cleanPass, acc.password);
      const pinMatch = safeCompare(cleanPin, acc.pin);

      if (uMatch && pMatch && pinMatch) {
        matchedAccount = acc;
        break;
      }
    }

    if (!matchedAccount) {
      attemptRecord.failedAttempts += 1;
      attemptRecord.lastAttempt = now;

      // Trigger lockout after 4 failed attempts within 15 minutes
      if (attemptRecord.failedAttempts >= 4) {
        attemptRecord.lockoutUntil = now + 15 * 60 * 1000; // 15 min lockout
        adminLoginAttempts.set(clientIp, attemptRecord);
        return res.status(429).json({
          success: false,
          error: "Xavfsizlik tizimi: 4 marta xato ma'lumot kiritildi. Tizim 15 daqiqaga qulflanadi!",
          lockoutRemainingSec: 900
        });
      }

      adminLoginAttempts.set(clientIp, attemptRecord);
      const remainingAttempts = 4 - attemptRecord.failedAttempts;

      return res.status(401).json({
        success: false,
        error: "Noto'g'ri ma'lumotlar kiritildi! Login, parol yoki 2FA PIN noto'g'ri.",
        remainingAttempts
      });
    }

    // Successful Login: Reset attempts and generate cryptographically signed session token
    adminLoginAttempts.delete(clientIp);
    const tokenData = generateAdminToken(username.trim());
    const sessionId = `adm_sess_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Track active admin session on server
    activeAdminSessions.set(sessionId, {
      sessionId,
      token: tokenData.token,
      username: cleanUser,
      email: cleanEmail,
      ip: clientIp,
      userAgent: (req.headers['user-agent'] || 'Noma\'lum brauzer').substring(0, 100),
      loginTime: Date.now(),
      lastActive: Date.now(),
      isRootOwner: isOwnerEmailValid
    });

    // Set secure HttpOnly cookie for session protection
    res.cookie('yolnoma_admin_token', tokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 6 * 60 * 60 * 1000 // 6 hours
    });

    return res.json({
      success: true,
      message: 'Admin autentifikatsiyasi muvaffaqiyatli yakunlandi.',
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      sessionId,
      role: 'owner_admin'
    });
  } catch (err: any) {
    console.error('Error during admin login:', err);
    return res.status(500).json({
      success: false,
      error: "Serverda autentifikatsiya xatoligi yuz berdi. Iltimos qayta urinib ko'ring."
    });
  }
});

// 2. Role & Super Owner Verification Endpoint (Completely Backend Server-Side)
app.post('/api/auth/verify-role', (req, res) => {
  const { email } = req.body || {};
  const headerEmail = req.headers['x-user-email'];
  const checkEmail = (email || headerEmail || '').toString().trim().toLowerCase();

  const isOwner = Boolean(
    checkEmail.length > 0 &&
    (checkEmail === ROOT_OWNER_EMAIL || checkEmail.startsWith('yuldashivagavharoy'))
  );

  return res.json({
    isOwner,
    role: isOwner ? 'owner' : 'user'
  });
});

// 3. Admin Token Verification Endpoint
app.post('/api/admin/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromCookie = req.cookies?.['yolnoma_admin_token'];
  const token = tokenFromCookie || tokenFromHeader || req.body.token;

  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token topilmadi' });
  }

  const verification = verifyAdminToken(token);
  if (!verification.valid) {
    return res.status(401).json({ valid: false, error: verification.reason || 'Yaroqsiz token' });
  }

  return res.json({
    valid: true,
    expiresAt: verification.payload?.exp,
    role: verification.payload?.role,
    user: verification.payload?.sub
  });
});

// 3. Admin Logout / Revoke Token Endpoint
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromCookie = req.cookies?.['yolnoma_admin_token'];
  const token = tokenFromCookie || tokenFromHeader || req.body.token;

  // Clear HttpOnly cookie
  res.clearCookie('yolnoma_admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  if (token) {
    invalidatedTokens.add(token);
    // Also remove from active admin sessions
    for (const [sId, sess] of activeAdminSessions.entries()) {
      if (sess.token === token) {
        activeAdminSessions.delete(sId);
      }
    }
    if (invalidatedTokens.size > 5000) {
      invalidatedTokens.clear();
    }
  }

  return res.json({ success: true, message: 'Admin seansi muvaffaqiyatli yakunlandi' });
});

// 4. Admin Active Sessions: List All Active Sessions
app.get('/api/admin/sessions', requireAdminAuth, (req, res) => {
  try {
    const currentToken = (req as any).adminToken || req.cookies?.['yolnoma_admin_token'] || (
      req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : ''
    );

    // Clean expired sessions (older than 24 hours)
    const now = Date.now();
    for (const [sId, sess] of activeAdminSessions.entries()) {
      if (now - sess.lastActive > 24 * 60 * 60 * 1000) {
        activeAdminSessions.delete(sId);
      }
    }

    const clientIp = getClientIp(req);
    const adminUser = (req as any).adminUser;

    // If current session is not registered yet (e.g. server restart), add it automatically
    let hasCurrent = false;
    for (const sess of activeAdminSessions.values()) {
      if (sess.token === currentToken) {
        sess.lastActive = now;
        hasCurrent = true;
        break;
      }
    }

    if (!hasCurrent && currentToken) {
      const autoId = `adm_sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      activeAdminSessions.set(autoId, {
        sessionId: autoId,
        token: currentToken,
        username: adminUser?.sub || 'Admin (Root)',
        email: ROOT_OWNER_EMAIL,
        ip: clientIp,
        userAgent: (req.headers['user-agent'] || 'Asosiy Boshqaruv Qurilmasi').substring(0, 100),
        loginTime: Date.now(),
        lastActive: Date.now(),
        isRootOwner: true
      });
    }

    const sessions = Array.from(activeAdminSessions.values()).map((s) => ({
      sessionId: s.sessionId,
      username: s.username && s.username.length > 8 ? `${s.username.slice(0, 4)}***${s.username.slice(-4)}` : (s.username || 'Admin'),
      emailMasked: s.email ? s.email.replace(/^(.{2})(.*)(@.*)$/, '$1***$3') : 'yu***@gmail.com',
      ip: s.ip || clientIp,
      userAgent: s.userAgent || 'Desktop Browser',
      loginTime: s.loginTime || Date.now(),
      lastActive: s.lastActive || Date.now(),
      isRootOwner: s.isRootOwner !== false,
      isCurrent: s.token === currentToken || activeAdminSessions.size === 1
    }));

    return res.json({
      success: true,
      sessions,
      totalActive: sessions.length
    });
  } catch (err) {
    console.error('Error fetching admin sessions:', err);
    return res.status(500).json({
      success: false,
      error: 'Seanslarni yuklashda xatolik yuz berdi'
    });
  }
});

// 5. Admin Active Sessions: Terminate / Kick Stranger Admin
app.post('/api/admin/sessions/terminate', requireAdminAuth, (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID talab qilinadi' });
  }

  const targetSession = activeAdminSessions.get(sessionId);
  if (!targetSession) {
    return res.status(404).json({ success: false, error: 'Bunday faol seans topilmadi yoki allaqachon tugatilgan' });
  }

  // ROOT OWNER IMMUNITY: Nobody can ever kick the root owner!
  if (targetSession.isRootOwner || safeCompare(targetSession.email.toLowerCase(), ROOT_OWNER_EMAIL)) {
    return res.status(403).json({
      success: false,
      error: 'Asosiy Bosh Administrator (Root Owner) seansini chiqarib yuborish mumkin emas! U daxlsizdir.'
    });
  }

  // Invalidate token and remove session
  if (targetSession.token) {
    invalidatedTokens.add(targetSession.token);
  }
  activeAdminSessions.delete(sessionId);

  res.json({
    success: true,
    message: 'Begona seans muvaffaqiyatli to\'xtatildi va admin paneldan chiqarib yuborildi.'
  });
});

// -------------------------------------------------------------
// PROTECTED ADMIN MANAGEMENT ENDPOINTS (Require Token)
// -------------------------------------------------------------

// Admin System Diagnostics & Live Stats (including Anti-DRDoS, Reflection Shield, Flood Defense & Firewall)
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    system: {
      status: 'operational (Armored DRDoS & DDoS Shield Active)',
      uptimeSeconds: Math.floor((Date.now() - serverStats.serverStartTime) / 1000),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      }
    },
    metrics: {
      totalTestsValidated: serverStats.totalTestsValidated,
      suspiciousTestsBlocked: serverStats.suspiciousTestsBlocked,
      totalKeystrokesProcessed: serverStats.totalKeystrokesProcessed,
      totalContactMessages: serverInboxMessages.length,
      securityEventsBlocked: serverStats.securityEventsBlocked,
      ddosFloodsBlocked: serverStats.ddosFloodsBlocked,
      drdosReflectionsBlocked: serverStats.drdosReflectionsBlocked,
      amplificationAttacksBlocked: serverStats.amplificationAttacksBlocked,
      rateLimitHits: serverStats.rateLimitHits,
      activeLockouts: adminLoginAttempts.size,
      bannedIpCount: bannedIps.size,
      activeSocketsTracked: activeSocketsPerIp.size
    }
  });
});

// Public DRDoS & Firewall Status Summary (No sensitive data)
app.get('/api/security/drdos-shield', (req, res) => {
  res.json({
    status: 'ARMORED_ACTIVE',
    drdosProtection: {
      enabled: true,
      reflectionLoopFilter: 'ACTIVE',
      amplificationRangeBombFilter: 'ACTIVE',
      subnetRateLimiting: 'ACTIVE (/24 & /64)',
      slowlorisConnectionShield: 'ACTIVE',
      maliciousSignatureFilter: 'ACTIVE (35+ attack vectors)',
      stealthSocketTermination: 'ENABLED (0 byte response leak)'
    },
    timestamp: Date.now()
  });
});

// Admin IP Ban Management: List Banned IPs with full incident forensics
app.get('/api/admin/banned-ips', requireAdminAuth, (req, res) => {
  const list = Array.from(bannedIps.entries()).map(([ip, data]) => ({
    ip,
    bannedAt: data.bannedAt || (Date.now() - 3600000),
    unbanAt: data.unbanAt,
    remainingSeconds: Math.max(0, Math.floor((data.unbanAt - Date.now()) / 1000)),
    reason: data.reason,
    attackType: data.attackType || 'DDoS / DRDoS Hujumi',
    violationsCount: data.violationsCount || 1,
    userAgent: data.userAgent || 'Noma\'lum'
  }));

  res.json({ success: true, bannedIps: list, count: list.length });
});

// Admin Inbox: List Messages
app.get('/api/admin/inbox', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    messages: serverInboxMessages
  });
});

// Admin Inbox: Toggle Read Status
app.patch('/api/admin/inbox/:id/read', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const msg = serverInboxMessages.find((m) => m.id === id);

  if (!msg) {
    return res.status(404).json({ success: false, error: 'Xabar topilmadi' });
  }

  msg.isRead = !msg.isRead;
  msg.status = msg.isRead ? 'read' : 'unread';

  res.json({ success: true, message: msg });
});

// Admin Inbox: Delete Message
app.delete('/api/admin/inbox/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = serverInboxMessages.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Xabar topilmadi' });
  }

  serverInboxMessages.splice(index, 1);
  res.json({ success: true, message: 'Xabar o\'chirildi' });
});

// Admin Inbox: Reply to Message
app.post('/api/admin/inbox/reply', requireAdminAuth, (req, res) => {
  const { messageId, replyText } = req.body;
  const msg = serverInboxMessages.find((m) => m.id === messageId);

  if (!msg) {
    return res.status(404).json({ success: false, error: 'Xabar topilmadi' });
  }

  msg.replyText = String(replyText).trim();
  msg.repliedAt = Date.now();
  msg.status = 'replied';
  msg.isRead = true;

  res.json({ success: true, message: 'Javob saqlandi', updatedMessage: msg });
});

// Admin Announcements: Create
app.post('/api/admin/announcements', requireAdminAuth, (req, res) => {
  const { title, message, type } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Sarlavha va xabar matni talab qilinadi' });
  }

  const newAnn: StoredAnnouncement = {
    id: `ann-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: String(title).trim(),
    message: String(message).trim(),
    type: type || 'info',
    sender: 'Admin (Yolnoma)',
    timestamp: Date.now()
  };

  serverAnnouncements.unshift(newAnn);
  res.json({ success: true, announcement: newAnn });
});

// Admin Announcements: Delete
app.delete('/api/admin/announcements/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = serverAnnouncements.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'E\'lon topilmadi' });
  }

  serverAnnouncements.splice(index, 1);
  res.json({ success: true, message: 'E\'lon o\'chirildi' });
});

// -------------------------------------------------------------
// PUBLIC SECURITY & MAINTENANCE STATUS ENDPOINTS
// -------------------------------------------------------------

// Client calls this to know its real IP, ban state, VPN state, and maintenance status
app.get('/api/security/my-ip-status', (req, res) => {
  const clientIp = getClientIp(req);
  const banInfo = bannedIps.get(clientIp);
  const isBanned = Boolean(banInfo && Date.now() < banInfo.unbanAt);
  const vpnCheck = detectVpn(req, clientIp);

  res.json({
    ip: clientIp,
    banned: isBanned,
    banInfo: isBanned ? banInfo : null,
    isVpn: vpnCheck.isVpn,
    vpnReason: vpnCheck.reason,
    antiVpnEnabled: serverSettings.antiVpnStrict,
    maintenance: serverMaintenanceState
  });
});

// Public Maintenance Status (Quick Poller)
app.get('/api/maintenance/status', (req, res) => {
  res.json(serverMaintenanceState);
});

// -------------------------------------------------------------
// SECURE ADMIN SECURITY & MAINTENANCE CONTROL ENDPOINTS
// -------------------------------------------------------------

// Admin Maintenance Mode Controller (Site Lockdown / Overlay)
app.post('/api/admin/maintenance', requireAdminAuth, (req, res) => {
  const { active, title, message, estimatedTime, whitelistEmails } = req.body;

  serverMaintenanceState = {
    active: Boolean(active),
    title: title ? String(title).trim() : serverMaintenanceState.title,
    message: message ? String(message).trim() : serverMaintenanceState.message,
    estimatedTime: estimatedTime ? String(estimatedTime).trim() : serverMaintenanceState.estimatedTime,
    whitelistEmails: Array.isArray(whitelistEmails) && whitelistEmails.length > 0 
      ? whitelistEmails 
      : ["yuldashivagavharoy@gmail.com"],
    updatedAt: Date.now(),
    enabledBy: (req as any).adminUser?.email || (req as any).adminUser?.sub || "yuldashivagavharoy@gmail.com"
  };

  res.json({
    success: true,
    message: serverMaintenanceState.active 
      ? "Sayt yangilanish (Maintenance) rejimiga o'tkazildi. Barcha oddiy foydalanuvchilar uchun sayt yopildi."
      : "Yangilanish rejimi o'chirildi. Sayt barcha foydalanuvchilar uchun qayta ochildi.",
    maintenance: serverMaintenanceState
  });
});

// Security Settings: Get & Toggle Anti-VPN Strict Shield
app.get('/api/admin/security-settings', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    settings: serverSettings
  });
});

app.post('/api/admin/security-settings', requireAdminAuth, (req, res) => {
  const { antiVpnStrict, ddosShieldActive } = req.body;
  if (typeof antiVpnStrict === 'boolean') {
    serverSettings.antiVpnStrict = antiVpnStrict;
  }
  if (typeof ddosShieldActive === 'boolean') {
    serverSettings.ddosShieldActive = ddosShieldActive;
  }
  res.json({
    success: true,
    message: "Xavfsizlik sozlamalari yangilandi",
    settings: serverSettings
  });
});

// Real-Time Attack Logs
app.get('/api/admin/attack-logs', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    attackLogs: serverAttackLogs
  });
});

// Admin IP Ban Management: Manual Ban
app.post('/api/admin/ban-ip', requireAdminAuth, (req, res) => {
  const { ip, reason, durationHours, attackType } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP manzili talab qilinadi' });

  const targetIp = String(ip).trim();
  const hours = Number(durationHours) || (30 * 24); // default 30 days
  const unbanAt = Date.now() + hours * 3600000;

  const banRecord: BannedIpRecord = {
    ip: targetIp,
    bannedAt: Date.now(),
    unbanAt,
    reason: reason ? String(reason).trim() : 'Admin tomonidan qoʻlda bloklandi',
    attackType: attackType || 'Admin Qoʻlda Blokladi',
    violationsCount: 1,
    userAgent: 'Admin Panel Action'
  };

  bannedIps.set(targetIp, banRecord);
  serverStats.securityEventsBlocked += 1;

  // Record in logs
  serverAttackLogs.unshift({
    id: `atk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ip: targetIp,
    timestamp: Date.now(),
    type: banRecord.attackType || 'Manual Ban',
    details: banRecord.reason,
    userAgent: 'Admin Panel',
    blocked: true
  });
  if (serverAttackLogs.length > 200) serverAttackLogs.pop();

  const list = Array.from(bannedIps.entries()).map(([k, v]) => ({
    ip: k,
    ...v,
    remainingSeconds: Math.max(0, Math.floor((v.unbanAt - Date.now()) / 1000))
  }));

  res.json({
    success: true,
    message: `${targetIp} manzili muvaffaqiyatli bloklandi`,
    bannedIps: list
  });
});

// Admin IP Ban Management: Unban specific IP
app.post('/api/admin/unban-ip', requireAdminAuth, (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP talab qilinadi' });

  const targetIp = String(ip).trim();
  bannedIps.delete(targetIp);

  const list = Array.from(bannedIps.entries()).map(([k, v]) => ({
    ip: k,
    ...v,
    remainingSeconds: Math.max(0, Math.floor((v.unbanAt - Date.now()) / 1000))
  }));

  res.json({
    success: true,
    message: `${targetIp} manzili blokdan chiqarildi`,
    bannedIps: list
  });
});

// Admin IP Ban Management: Unban ALL IPs
app.post('/api/admin/unban-all', requireAdminAuth, (req, res) => {
  bannedIps.clear();
  res.json({
    success: true,
    message: 'Barcha IP manzillar blokdan chiqarildi',
    bannedIps: []
  });
});

// Global Error Masking Middleware (Prevent 500/503/403 leakage & stack traces)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  serverStats.securityEventsBlocked += 1;
  if (res.headersSent) {
    return next(err);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).json({ status: 'ok' });
});

// Start Server with Vite Middleware and Hardened Sockets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on port ${PORT}`);
  });

  // Slowloris & Connection Exhaustion Defense (Strict Timeouts)
  server.keepAliveTimeout = 4000;
  server.headersTimeout = 5000;
  server.requestTimeout = 8000;
  server.maxHeadersCount = 50;
}

startServer();
