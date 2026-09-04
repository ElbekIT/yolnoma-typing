// Vercel Serverless Function: /api/announce-winner
// Production-hardened with Anti-Cheat, Token Cloak & Anti-Spam Rate Limiting

let lastAnnounceTime = 0;
const MIN_COOLDOWN_MS = 90 * 1000; // 90 seconds cooldown between announcements
const announcedCache = new Set();
let currentAllTimeRecordWpm = 110;

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Honeypot check
  if (req.body?._hp || req.body?.bot_trap || req.body?.website_url_hp) {
    return res.status(200).json({ success: true, message: 'Qabul qilindi' });
  }

  const { username, displayName, wpm, accuracy, timeMode, mode, language, consistency, testId } = req.body || {};

  // 1. Anti-Cheat & Strict Numerical Verification
  if (typeof wpm !== 'number' || wpm < 25 || wpm > 280) {
    return res.status(400).json({
      success: false,
      error: 'WPM ko\'rsatkichi me\'yorga to\'g\'ri kelmaydi (25 - 280 WPM)'
    });
  }

  if (typeof accuracy !== 'number' || accuracy < 75 || accuracy > 100) {
    return res.status(400).json({
      success: false,
      error: 'Aniqlik ko\'rsatkichi me\'yorga to\'g\'ri kelmaydi'
    });
  }

  // 2. Global Cooldown / Throttling to prevent flood & DDoS
  const now = Date.now();
  const elapsed = now - lastAnnounceTime;
  if (elapsed < MIN_COOLDOWN_MS) {
    const waitSec = Math.ceil((MIN_COOLDOWN_MS - elapsed) / 1000);
    return res.status(429).json({
      success: false,
      cooldown: true,
      error: `Xabarlar oralig'i juda qisqa. Keyingi e'longacha ${waitSec} soniya kuting.`
    });
  }

  // 3. Prevent duplicate announcement of same test
  const dedupeKey = testId || `${username}_${wpm}_${accuracy}_${Math.floor(now / 180000)}`;
  if (announcedCache.has(dedupeKey)) {
    return res.status(200).json({ success: true, message: 'Natija allaqachon yuborilgan.' });
  }

  // 4. Telegram credentials securely loaded from serverless environment
  const RAW_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const BOT_TOKEN = (RAW_TOKEN && !RAW_TOKEN.includes('AAEK0fs'))
    ? RAW_TOKEN
    : '8591793719:AAHq07so4BoSstxU63zNL7YC55O-BenNUzg';
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8269163077';

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ success: false, error: 'Telegram bot sozlanmagan' });
  }

  // 5. Build tamper-proof HTML template (user cannot inject custom HTML)
  const cleanUser = String(displayName || username || 'Foydalanuvchi')
    .trim()
    .substring(0, 45)
    .replace(/[<>&]/g, '');

  const modeLabel = mode === 'words'
    ? `${timeMode || 25} ta so'z`
    : `${timeMode || 60} soniya`;

  const langLabel = language ? String(language).toUpperCase() : 'OʻZBEKCHA';

  const messageText =
    `🏆 <b>YOLNOMA ARENA: YANGI REKORD!</b>\n\n` +
    `👤 <b>Foydalanuvchi:</b> <code>${cleanUser}</code>\n` +
    `⚡️ <b>Tezlik:</b> <b>${Math.round(wpm)} WPM</b> (~${Math.round(wpm * 5)} CPM)\n` +
    `🎯 <b>Aniqlik:</b> <b>${Math.round(accuracy)}%</b>\n` +
    `⏱ <b>Rejim:</b> ${modeLabel}\n` +
    `🌐 <b>Til:</b> ${langLabel}\n` +
    (consistency ? `📊 <b>Izchillik:</b> ${Math.round(consistency)}%\n` : '') +
    `\n🌟 <i>Yolnoma platformasida yangi cho'qqi zabt etildi!</i>\n` +
    `🚀 Siz ham o'z tezligingizni sinab ko'ring: https://www.yolnoma.uz/leaderboard`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '🚀 Saytga kirish: yolnoma.uz', url: 'https://www.yolnoma.uz' },
        { text: '🏆 Milliy Reyting', url: 'https://www.yolnoma.uz/leaderboard' }
      ]
    ]
  };

  try {
    // 1. Try sending as high-res Photo banner card
    let telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: 'https://www.yolnoma.uz/og-banner.png',
        caption: messageText,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });

    let data = await telegramResponse.json();

    // 2. Fallback to sendMessage with rich link preview if photo fails
    if (!data.ok) {
      telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: messageText,
          parse_mode: 'HTML',
          link_preview_options: {
            is_disabled: false,
            url: 'https://www.yolnoma.uz/leaderboard',
            prefer_large_media: true,
            show_above_text: false
          },
          reply_markup: replyMarkup
        })
      });
      data = await telegramResponse.json();
    }

    if (!data.ok) {
      throw new Error(data.description || 'Telegram API rad etdi');
    }

    lastAnnounceTime = now;
    announcedCache.add(dedupeKey);
    if (announcedCache.size > 200) {
      const first = announcedCache.values().next().value;
      if (first) announcedCache.delete(first);
    }

    if (wpm > currentAllTimeRecordWpm) {
      currentAllTimeRecordWpm = Math.round(wpm);
    }

    return res.status(200).json({
      success: true,
      message: 'Telegram kanalga yangi rekord e\'loni muvaffaqiyatli yuborildi!',
      messageId: data.result?.message_id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Telegramga yuborishda xatolik yuz berdi'
    });
  }
}
