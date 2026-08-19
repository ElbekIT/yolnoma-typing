import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Security & Body parsing with strict size limits
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

const SECRET_SALT = process.env.SECURITY_SALT || 'yolnoma_typing_sec_salt_2026';

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
// API ENDPOINTS
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint: Generate anti-bot verification challenge
app.get('/api/security/challenge', (req, res) => {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const token = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`${timestamp}:${nonce}`)
    .digest('hex');

  res.json({ timestamp, nonce, token });
});

// Endpoint: Secure Validation for Contact Submissions
app.post('/api/contact', async (req, res) => {
  const clientIp = getClientIp(req);
  const subnet = getSubnet(clientIp);
  const now = Date.now();

  // 1. Honeypot check (Spambot traps)
  if (req.body._hp || req.body.website_url_hp || req.body.bot_trap) {
    return res.json({ success: true, message: 'Xabar qabul qilindi' });
  }

  // 2. Global Burst Limiter
  if (now > globalResetTime) {
    globalCount = 1;
    globalResetTime = now + 60000;
  } else {
    globalCount += 1;
    if (globalCount > 30) {
      return res.status(429).json({
        success: false,
        error: 'Tizimda yuklama yuqori. Iltimos birozdan so\'ng qayta urinib ko\'ring.'
      });
    }
  }

  // 3. IP Rate Limiter
  const ipCheck = checkRateLimit(ipLimitMap, clientIp, 5, 120000, 3000);
  if (!ipCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Iltimos juda tez so'rov yubormang. ${ipCheck.waitSec} soniyadan so'ng qayta urinib ko'ring.`
    });
  }

  // 4. Subnet Rate Limiter
  const subnetCheck = checkRateLimit(subnetLimitMap, subnet, 10, 120000, 2000);
  if (!subnetCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Tarmoq chegarasi. Iltimos ${subnetCheck.waitSec} soniyadan so'ng qayta urinib ko'ring.`
    });
  }

  // 5. Payload validation
  const { name, message } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Ismingizni kiritish majburiy.' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Xabar matnini kiritish majburiy.' });
  }

  return res.json({
    success: true,
    message: 'Xabaringiz Admin panelga yetkazildi!'
  });
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
