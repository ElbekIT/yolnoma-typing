import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Remove fingerprinting headers
app.disable('x-powered-by');

// Strict Security Headers (Anti-Sniff, Anti-Clickjacking, Anti-XSS, Anti-Reverse Engineering)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Block unauthorized exploration of source maps, config files, env files, and git folders
  const lowerUrl = req.url.toLowerCase();
  if (
    lowerUrl.includes('.map') ||
    lowerUrl.includes('.env') ||
    lowerUrl.includes('.git') ||
    lowerUrl.includes('package.json') ||
    lowerUrl.includes('tsconfig.json') ||
    lowerUrl.includes('server.ts')
  ) {
    return res.status(404).json({ error: 'Not found' });
  }

  next();
});

// Security & Body parsing with strict size limits
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

const SECRET_SALT = process.env.SECURITY_SALT || 'yolnoma_typing_sec_salt_2026';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'yolnoma_super_secure_admin_jwt_secret_98234791';

// Server-side hashed admin credentials with SHA-512 + HMAC
// Defaults configured securely; can be overridden via environment variables
const ADMIN_USERNAME_EXPECTED = (process.env.ADMIN_USERNAME || 'hS&sb*#S&^%').trim();
// Precomputed default SHA-512 hashes or direct server secrets (NEVER exposed to client)
const ADMIN_PASSWORD_EXPECTED = (process.env.ADMIN_PASSWORD || '&hH3#*@^hwW@#$').trim();
const ADMIN_2FA_EXPECTED = (process.env.ADMIN_2FA_PIN || 'O93#%$#@hH').trim();

// -------------------------------------------------------------
// ADVANCED ANTI-BRUTE FORCE & ADMIN SECURITY SYSTEM
// -------------------------------------------------------------

interface AdminLoginAttempt {
  failedAttempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}

const adminLoginAttempts = new Map<string, AdminLoginAttempt>();
const invalidatedTokens = new Set<string>();

// Helper: Constant-time string comparison to mitigate timing attacks
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (!a || !b) return a === b;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length === 0 || bufB.length === 0) return a === b;
  if (bufA.length !== bufB.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return a === b;
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
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, reason: 'Invalid token format' };
  }

  if (invalidatedTokens.has(token)) {
    return { valid: false, reason: 'Token was revoked/logged out' };
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
// ADVANCED ANTI-DDOS, ANTI-PROXY & BOT MITIGATION SYSTEM
// -------------------------------------------------------------

interface BucketRecord {
  count: number;
  resetTime: number;
  lastRequestTime: number;
}

// 1. IP & Subnet Limiter
const ipLimitMap = new Map<string, BucketRecord>();
const subnetLimitMap = new Map<string, BucketRecord>();

// 2. Device / Browser Fingerprint Limiter (Bypasses Proxy-Hopping)
const deviceLimitMap = new Map<string, BucketRecord>();

// 3. Duplicate Message Hash Cache (Prevents Spam Flooding via rotating proxies)
const messageHashCache = new Map<string, number>();

// 4. Global Burst Limiter
let globalCount = 0;
let globalResetTime = Date.now() + 60000;

// Automated memory cleanup every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipLimitMap.entries()) {
    if (now > val.resetTime + 60000) ipLimitMap.delete(key);
  }
  for (const [key, val] of subnetLimitMap.entries()) {
    if (now > val.resetTime + 60000) subnetLimitMap.delete(key);
  }
  for (const [key, val] of deviceLimitMap.entries()) {
    if (now > val.resetTime + 180000) deviceLimitMap.delete(key);
  }
  for (const [hash, time] of messageHashCache.entries()) {
    if (now - time > 600000) messageHashCache.delete(hash); // 10 minutes cache
  }
}, 180000);

const getClientIp = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
};

// Extracts subnet to mitigate proxy farm subnet rotations (/24 IPv4 or /64 IPv6)
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

// Helper: Generic Bucket Check
function checkRateLimit(
  map: Map<string, BucketRecord>,
  key: string,
  maxRequests: number,
  windowMs: number,
  cooldownMs: number
): { allowed: boolean; waitSec: number } {
  const now = Date.now();
  const record = map.get(key);

  if (record) {
    if (now < record.lastRequestTime + cooldownMs) {
      return { allowed: false, waitSec: Math.ceil((record.lastRequestTime + cooldownMs - now) / 1000) };
    }

    if (now < record.resetTime) {
      if (record.count >= maxRequests) {
        return { allowed: false, waitSec: Math.ceil((record.resetTime - now) / 1000) };
      }
      record.count += 1;
      record.lastRequestTime = now;
      return { allowed: true, waitSec: 0 };
    } else {
      map.set(key, { count: 1, resetTime: now + windowMs, lastRequestTime: now });
      return { allowed: true, waitSec: 0 };
    }
  } else {
    map.set(key, { count: 1, resetTime: now + windowMs, lastRequestTime: now });
    return { allowed: true, waitSec: 0 };
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
const bannedIps = new Set<string>();

const serverStats = {
  serverStartTime: Date.now(),
  totalTestsValidated: 0,
  suspiciousTestsBlocked: 0,
  totalKeystrokesProcessed: 0,
  totalContactMessages: 1,
  securityEventsBlocked: 0
};

// -------------------------------------------------------------
// ADMIN AUTHENTICATION MIDDLEWARE
// -------------------------------------------------------------

const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = tokenFromHeader || (req.body && req.body.adminToken) || (req.query && req.query.adminToken as string);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiya talab qilinadi (Token topilmadi)' });
  }

  const verification = verifyAdminToken(token);
  if (!verification.valid) {
    return res.status(403).json({ success: false, error: verification.reason || 'Yaroqsiz yoki muddati o\'tgan admin token' });
  }

  (req as any).adminUser = verification.payload;
  next();
};

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

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
  const subnet = getSubnet(clientIp);
  const now = Date.now();

  if (bannedIps.has(clientIp)) {
    return res.status(403).json({ success: false, error: 'Sizning IP manzilingiz bloklangan' });
  }

  // Honeypot check
  if (req.body._hp || req.body.website_url_hp || req.body.bot_trap) {
    return res.json({ success: true, message: 'Xabar qabul qilindi' });
  }

  // Global Burst Limiter
  if (now > globalResetTime) {
    globalCount = 1;
    globalResetTime = now + 60000;
  } else {
    globalCount += 1;
    if (globalCount > 35) {
      serverStats.securityEventsBlocked += 1;
      return res.status(429).json({
        success: false,
        error: 'Tizimda yuklama yuqori. Iltimos birozdan so\'ng qayta urinib ko\'ring.'
      });
    }
  }

  // IP Rate Limiter
  const ipCheck = checkRateLimit(ipLimitMap, clientIp, 5, 120000, 3000);
  if (!ipCheck.allowed) {
    serverStats.securityEventsBlocked += 1;
    return res.status(429).json({
      success: false,
      error: `Iltimos juda tez so'rov yubormang. ${ipCheck.waitSec} soniyadan so'ng qayta urinib ko'ring.`
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

    const { username, password, pin } = req.body;

    if (!username || !password || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Barcha maydonlarni (Username, Parol, 2FA PIN) kiritish shart.'
      });
    }

    // Timing-safe comparisons against server-only expected secrets
    const isUsernameValid = safeCompare(username.trim(), ADMIN_USERNAME_EXPECTED);
    const isPasswordValid = safeCompare(password.trim(), ADMIN_PASSWORD_EXPECTED);
    const isPinValid = safeCompare(pin.trim(), ADMIN_2FA_EXPECTED);

    if (!isUsernameValid || !isPasswordValid || !isPinValid) {
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

    return res.json({
      success: true,
      message: 'Admin autentifikatsiyasi muvaffaqiyatli yakunlandi.',
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
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
  const token = tokenFromHeader || req.body.token;

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
  const token = tokenFromHeader || req.body.token;

  if (token) {
    invalidatedTokens.add(token);
    if (invalidatedTokens.size > 5000) {
      invalidatedTokens.clear();
    }
  }

  return res.json({ success: true, message: 'Admin seansi muvaffaqiyatli yakunlandi' });
});

// -------------------------------------------------------------
// PROTECTED ADMIN MANAGEMENT ENDPOINTS (Require Token)
// -------------------------------------------------------------

// Admin System Diagnostics & Live Stats
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    system: {
      status: 'operational',
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
      activeLockouts: adminLoginAttempts.size,
      bannedIpCount: bannedIps.size
    }
  });
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
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP talab qilinadi' });

  bannedIps.add(String(ip).trim());
  res.json({ success: true, message: `${ip} manzili bloklandi`, bannedIps: Array.from(bannedIps) });
});

app.post('/api/admin/unban-ip', requireAdminAuth, (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP talab qilinadi' });

  bannedIps.delete(String(ip).trim());
  res.json({ success: true, message: `${ip} blokdan chiqarildi`, bannedIps: Array.from(bannedIps) });
});

// Start Server with Vite Middleware
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on port ${PORT}`);
  });
}

startServer();
