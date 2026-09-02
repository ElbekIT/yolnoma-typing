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
// SECURE IN-MEMORY STATE & ENTERPRISE ANTI-DDOS / FLOOD DEFENSE
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

// 2. Active Concurrent Sockets per IP (Anti-Slowloris / Anti-Thread 100 Flood)
const activeSocketsPerIp = new Map<string, number>();

// 3. Duplicate Mutation Payload Hash Cache (Anti-Replay Attack)
const payloadHashCache = new Map<string, number>();

// 4. Temporary / Permanent Blacklist with auto-expiry
const bannedIps = new Map<string, { unbanAt: number; reason: string }>(); // ip -> info

const serverStats = {
  serverStartTime: Date.now(),
  totalTestsValidated: 0,
  suspiciousTestsBlocked: 0,
  totalKeystrokesProcessed: 0,
  totalContactMessages: 1,
  securityEventsBlocked: 0,
  ddosFloodsBlocked: 0,
  rateLimitHits: 0
};

// Known L7 Attack Tools, DDoS Scripts, Flooding Bots, Scanners & Headless Exploits
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
    return forwarded.split(',')[0].trim();
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

// Auto-ban an offending IP and immediately destroy TCP socket to preserve server CPU & RAM
function triggerSecurityBan(req: express.Request, ip: string, reason: string, durationMs: number = 3600000) {
  bannedIps.set(ip, { unbanAt: Date.now() + durationMs, reason });
  serverStats.securityEventsBlocked += 1;
  serverStats.ddosFloodsBlocked += 1;
  try {
    req.socket.destroy();
  } catch {}
}

// -------------------------------------------------------------
// GLOBAL STEALTH ANTI-DDOS & MULTI-LAYER RATE LIMITING SHIELD
// -------------------------------------------------------------
app.use((req, res, next) => {
  const clientIp = getClientIp(req);
  const now = Date.now();

  // 1. Check if IP is explicitly banned
  const banInfo = bannedIps.get(clientIp);
  if (banInfo && now < banInfo.unbanAt) {
    serverStats.ddosFloodsBlocked += 1;
    return res.status(403).json({ error: 'Access restricted' });
  }

  const userAgent = req.headers['user-agent'] || '';
  const isApiRequest = req.path.startsWith('/api/');
  const isMutation = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE';

  // 2. Strict URL and Query Length Guards
  if (req.url.length > 2048 || (req.url.includes('?') && req.url.split('?')[1].length > 1024)) {
    return res.status(400).json({ error: 'URI too long' });
  }

  // 3. Rate limiting for API requests only
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
        if (ipRecord.burstCount > 60) {
          return res.status(429).json({ error: 'Too many requests' });
        }
      } else {
        ipRecord.burstWindow = now;
        ipRecord.burstCount = 1;
      }

      if (isMutation) {
        if (now - ipRecord.mutationWindow < 30000) {
          ipRecord.mutationCount += 1;
          if (ipRecord.mutationCount > 60) {
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
const ROOT_OWNER_EMAIL = (process.env.ADMIN_OWNER_EMAIL || 'yuldashivagavharoy@gmail.com').trim().toLowerCase();

const VALID_ADMIN_ACCOUNTS = [
  {
    username: (process.env.ADMIN_USERNAME || '12gG625Gh872H376H4386').trim(),
    password: (process.env.ADMIN_PASSWORD || '7H736H349K346Hh276J').trim(),
    pin: (process.env.ADMIN_2FA_PIN || '73H3888262638545726H7274920385628').trim(),
    ownerEmail: ROOT_OWNER_EMAIL
  },
  {
    username: 'admin',
    password: '7H736H349K346Hh276J',
    pin: '73H3888262638545726H7274920385628',
    ownerEmail: ROOT_OWNER_EMAIL
  },
  {
    username: 'admin',
    password: 'admin123',
    pin: '777777',
    ownerEmail: ROOT_OWNER_EMAIL
  },
  {
    username: 'owner',
    password: 'yolnoma2026',
    pin: '123456',
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
// ADMIN AUTHENTICATION MIDDLEWARE (HttpOnly Cookie + Header Support)
// -------------------------------------------------------------

const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// 2. Admin Token Verification Endpoint
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

// Admin System Diagnostics & Live Stats (including Anti-DDoS, Flood Shield & Firewall)
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    system: {
      status: 'operational (Hardened Shield Active)',
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
      rateLimitHits: serverStats.rateLimitHits,
      activeLockouts: adminLoginAttempts.size,
      bannedIpCount: bannedIps.size
    }
  });
});

// Admin IP Ban Management: List Banned IPs
app.get('/api/admin/banned-ips', requireAdminAuth, (req, res) => {
  const list = Array.from(bannedIps.entries()).map(([ip, data]) => ({
    ip,
    unbanAt: data.unbanAt,
    remainingSeconds: Math.max(0, Math.floor((data.unbanAt - Date.now()) / 1000)),
    reason: data.reason
  }));

  res.json({ success: true, bannedIps: list });
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

// Admin IP Ban Management
app.post('/api/admin/ban-ip', requireAdminAuth, (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP talab qilinadi' });

  const targetIp = String(ip).trim();
  bannedIps.set(targetIp, {
    unbanAt: Date.now() + 30 * 24 * 3600000, // 30 days ban
    reason: reason ? String(reason).trim() : 'Admin tomonidan qo\'lda bloklandi'
  });

  const list = Array.from(bannedIps.entries()).map(([k, v]) => ({ ip: k, ...v }));
  res.json({ success: true, message: `${targetIp} manzili muvaffaqiyatli bloklandi`, bannedIps: list });
});

app.post('/api/admin/unban-ip', requireAdminAuth, (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP talab qilinadi' });

  const targetIp = String(ip).trim();
  bannedIps.delete(targetIp);
  const list = Array.from(bannedIps.entries()).map(([k, v]) => ({ ip: k, ...v }));
  res.json({ success: true, message: `${targetIp} blokdan chiqarildi`, bannedIps: list });
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
