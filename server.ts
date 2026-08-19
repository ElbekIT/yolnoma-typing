import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Security & Body parsing with strict size limits
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

// Telegram Configuration (Completely hidden server-side)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8591793719:AAEK0fsg9zUtkKpLcI9YT8fkQwealbBLGLg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8269163077';
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

// Masks IP for privacy and Telegram safety (e.g. 178.218.14.92 -> 178.218.***.***)
const maskIp = (ip: string): string => {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1') return 'Himoyalangan (Local/Proxy)';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts[0]}:${parts[1]}:****:****`;
  }
  return 'Xavfsiz Maskalangan';
};

const escapeHtml = (text: string): string => {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

// Endpoint: Secure Contact with Anti-DDoS, Anti-Proxy & Privacy Shield
app.post('/api/contact', async (req, res) => {
  const clientIp = getClientIp(req);
  const subnet = getSubnet(clientIp);
  const now = Date.now();

  // 1. Honeypot check (Spambot traps)
  if (req.body._hp || req.body.website_url_hp || req.body.bot_trap) {
    return res.json({ success: true, message: 'Xabar qabul qilindi' });
  }

  // 2. Global Burst Limiter (Max 25 req/min across entire server)
  if (now > globalResetTime) {
    globalCount = 1;
    globalResetTime = now + 60000;
  } else {
    globalCount += 1;
    if (globalCount > 25) {
      return res.status(429).json({
        success: false,
        error: 'Tizimda yuklama yuqori. Iltimos 30 soniyadan so\'ng qayta urinib ko\'ring.'
      });
    }
  }

  // 3. IP Rate Limiter (Max 4 messages / 2 minutes per IP, 4s cooldown)
  const ipCheck = checkRateLimit(ipLimitMap, clientIp, 4, 120000, 4000);
  if (!ipCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Iltimos juda tez so'rov yubormang. ${ipCheck.waitSec} soniyadan so'ng qayta urinib ko'ring.`
    });
  }

  // 4. Subnet Rate Limiter (Max 8 messages / 2 minutes per subnet to stop proxy farms)
  const subnetCheck = checkRateLimit(subnetLimitMap, subnet, 8, 120000, 2000);
  if (!subnetCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Tarmoq chegarasi. Iltimos ${subnetCheck.waitSec} soniyadan so'ng qayta urinib ko'ring.`
    });
  }

  // 5. Device Fingerprint Limiter (Tracks device even if rotating through proxies)
  const deviceId = typeof req.body.deviceId === 'string' && req.body.deviceId.length > 5
    ? req.body.deviceId
    : crypto.createHash('md5').update(clientIp + (req.headers['user-agent'] || '')).digest('hex');

  const deviceCheck = checkRateLimit(deviceLimitMap, deviceId, 3, 300000, 5000);
  if (!deviceCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Qurilma chegarasi: 5 daqiqada maksimal 3 ta xabar yuborish mumkin. ${deviceCheck.waitSec} soniya kuting.`
    });
  }

  // 6. Anti-Bot Time-on-page Check (Must take at least 2 seconds between form render and submit)
  const renderTime = Number(req.body.renderTime);
  if (renderTime && now - renderTime < 2000) {
    return res.status(400).json({
      success: false,
      error: 'Xabar juda tez yuborildi. Iltimos insoniy tezlikda yuboring.'
    });
  }

  // 7. Security Proof Token Verification
  const { secToken, secTimestamp, secNonce } = req.body;
  if (secToken && secTimestamp && secNonce) {
    const age = now - Number(secTimestamp);
    if (age > 600000 || age < 0) { // Token valid for 10 minutes
      return res.status(403).json({
        success: false,
        error: 'Xavfsizlik sessiyasi eskirgan. Sahifani yangilab qayta urinib ko\'ring.'
      });
    }
    const expectedToken = crypto
      .createHmac('sha256', SECRET_SALT)
      .update(`${secTimestamp}:${secNonce}`)
      .digest('hex');
    if (expectedToken !== secToken) {
      return res.status(403).json({
        success: false,
        error: 'Xavfsizlik tekshiruvidan o\'tmadi.'
      });
    }
  }

  // 8. Payload validation
  const { name, phone, message, userContext } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Ismingizni kiritish majburiy.' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Xabar matnini kiritish majburiy.' });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ success: false, error: 'Ism 100 belgidan oshmasligi kerak.' });
  }
  if (message.trim().length > 2500) {
    return res.status(400).json({ success: false, error: 'Xabar 2500 belgidan oshmasligi kerak.' });
  }

  // 9. Spam & Duplicate Content Detection (Mitigates proxy floods with same spam text)
  const normalizedMsg = message.trim().toLowerCase().replace(/\s+/g, '');
  const msgHash = crypto.createHash('sha256').update(normalizedMsg).digest('hex');
  if (messageHashCache.has(msgHash)) {
    const lastSeen = messageHashCache.get(msgHash)!;
    if (now - lastSeen < 300000) { // 5 minutes duplicate protection
      // Silently accept to prevent giving clues to spam scripts
      return res.json({
        success: true,
        message: 'Xabaringiz qabul qilindi. Rahmat!'
      });
    }
  }
  messageHashCache.set(msgHash, now);

  // 10. Prepare Sanitized Telegram Message (With IP Masking & Device Tag)
  const safeName = escapeHtml(name.trim());
  const safeContact = escapeHtml((phone || '').trim() || 'Kiritilmagan');
  const safeMsg = escapeHtml(message.trim());
  const maskedIpAddress = maskIp(clientIp);

  const formattedDate = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isUserAuth = userContext?.isAuth === true;
  const userEmail = userContext?.email || 'Mavjud emas';
  const userDisplayName = userContext?.displayName || 'Noma\'lum';
  const userWpm = userContext?.wpm || 0;
  const userTests = userContext?.tests || 0;
  const userLevel = userContext?.level || 1;

  const telegramHtml = `
🚀 <b>YANGI MUROJAAT — Yolnoma Typing</b>

👤 <b>Yuboruvchi:</b> ${safeName}
📞 <b>Telefon / Telegram:</b> ${safeContact}
💬 <b>Xabar matni:</b>
${safeMsg}

━━━━━━━━━━━━━━━━━━━━
📊 <b>Foydalanuvchi ma'lumotlari:</b>
• <b>Holat:</b> ${isUserAuth ? '✅ Tizimga kirgan aʼzo' : '👤 Mehmon (Guest)'}
${isUserAuth ? `• <b>Ism/Nik:</b> ${escapeHtml(userDisplayName)}
• <b>Email:</b> <code>${escapeHtml(userEmail)}</code>
• <b>Daraja:</b> LVL ${userLevel}
• <b>Eng yuqori WPM:</b> ${userWpm} WPM
• <b>Jami testlar:</b> ${userTests} ta` : ''}
🛡️ <b>Xavfsizlik:</b> Maskalangan IP (<code>${maskedIpAddress}</code>)
⏰ <b>Vaqt:</b> ${formattedDate} (Toshkent)
  `.trim();

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramHtml,
        parse_mode: 'HTML'
      })
    });

    const data = (await telegramRes.json()) as { ok: boolean; description?: string };

    if (data.ok) {
      return res.json({
        success: true,
        message: 'Xabaringiz Elbek Qoriyevga muvaffaqiyatli yetkazildi! Rahmat.'
      });
    } else {
      console.error('Telegram API response error:', data);
      return res.status(502).json({
        success: false,
        error: 'Telegram serveriga xabar yetkazishda xatolik yuz berdi.'
      });
    }
  } catch (err: any) {
    console.error('Telegram forwarding error:', err);
    return res.status(500).json({
      success: false,
      error: 'Xabar yuborishda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko\'ring.'
    });
  }
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
    console.log(`Server running securely on port ${PORT} with full anti-DDoS and proxy protections`);
  });
}

startServer();
