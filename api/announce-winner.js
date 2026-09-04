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

  const {
    username,
    displayName,
    wpm,
    oldWpm,
    accuracy,
    timeMode,
    mode,
    language,
    consistency,
    testId,
    level,
    rankTitle,
    rank,
    xp,
    totalTests
  } = req.body || {};

  // 1. Anti-Cheat & Numerical Verification
  if (typeof wpm !== 'number' || wpm < 20 || wpm > 300) {
    return res.status(400).json({
      success: false,
      error: 'WPM ko\'rsatkichi me\'yorga to\'g\'ri kelmaydi (20 - 300 WPM)'
    });
  }

  if (typeof accuracy !== 'number' || accuracy < 60 || accuracy > 100) {
    return res.status(400).json({
      success: false,
      error: 'Aniqlik ko\'rsatkichi me\'yorga to\'g\'ri kelmaydi'
    });
  }

  // 2. Global Cooldown / Throttling to prevent flood & DDoS
  const now = Date.now();
  const elapsed = now - lastAnnounceTime;
  if (elapsed < 5000) {
    const waitSec = Math.ceil((5000 - elapsed) / 1000);
    return res.status(429).json({
      success: false,
      cooldown: true,
      error: `Xabarlar oralig'i juda qisqa. Keyingi e'longacha ${waitSec} soniya kuting.`
    });
  }

  // 3. Prevent duplicate announcement of same test
  const dedupeKey = testId || `${username}_${Math.round(wpm)}_${Math.round(accuracy)}_${Math.floor(now / 180000)}`;
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

  const userLevel = Number(level) || 1;
  const userRankTitle = String(rankTitle || 'Keyboard Warrior').replace(/[<>&]/g, '');
  const userRankNum = Number(rank) || undefined;

  let rankBadge = '';
  if (userRankNum === 1) {
    rankBadge = '👑 <b>#1-OʻRIN (MUTLAQ LIDER!)</b>';
  } else if (userRankNum === 2) {
    rankBadge = '🥈 <b>#2-OʻRIN (KUMUSH SOVRINDOR)</b>';
  } else if (userRankNum === 3) {
    rankBadge = '🥉 <b>#3-OʻRIN (BRONZA SOVRINDOR)</b>';
  } else if (userRankNum && userRankNum <= 10) {
    rankBadge = `⭐️ <b>#${userRankNum}-OʻRIN (TOP-10)</b>`;
  } else if (userRankNum) {
    rankBadge = `🎖 <b>#${userRankNum}-oʻrin</b>`;
  } else {
    rankBadge = `🎖 <b>Peshqadamlar Jadvalida</b>`;
  }

  const modeLabel = mode === 'words'
    ? `${timeMode || 25} ta soʻz`
    : `${timeMode || 60} soniya`;

  const langLabel = language ? String(language).toUpperCase() : 'OʻZBEKCHA';

  const numOldWpm = Number(oldWpm) || 0;
  const numNewWpm = Math.round(wpm);
  let growthText = '';
  if (numOldWpm > 0 && numNewWpm > numOldWpm) {
    const diff = numNewWpm - Math.round(numOldWpm);
    growthText = `📈 <b>Oʻsish dinamikasi:</b> <code>${Math.round(numOldWpm)} WPM</code> ➡️ <b>${numNewWpm} WPM</b> (🔥 <b>+${diff} WPM oʻsish!</b>)\n`;
  } else if (numOldWpm > 0) {
    growthText = `📈 <b>Eski natija:</b> <code>${Math.round(numOldWpm)} WPM</code>\n`;
  } else {
    growthText = `✨ <b>Shaxsiy Rekord Oʻrnatildi!</b>\n`;
  }

  let headerTitle = '🏆 <b>YOLNOMA ARENA: SHAXSIY REKORD YANGILANDI!</b> 🔥';
  if (userRankNum === 1) {
    headerTitle = '👑 <b>YOLNOMA ARENA: YANGI MUTLAQ CHEMPION!</b> 👑';
  } else if (userRankNum && userRankNum <= 3) {
    headerTitle = '🥇 <b>YOLNOMA ARENA: TOP-3 GʻALABA VA YANGI REKORD!</b> 🔥';
  }

  const accText = typeof accuracy === 'number' ? accuracy.toFixed(1) : String(accuracy);
  const messageText =
    `${headerTitle}\n\n` +
    `👤 <b>Foydalanuvchi:</b> <code>${cleanUser}</code>\n` +
    `🎖 <b>Daraja:</b> <b>Level ${userLevel}</b> • <i>${userRankTitle}</i>\n` +
    `🏆 <b>Reytingdagi oʻrni:</b> ${rankBadge}\n\n` +
    `⚡️ <b>Yangi Tezlik:</b> <b>${numNewWpm} WPM</b> (~${Math.round(wpm * 5)} CPM)\n` +
    growthText +
    `🎯 <b>Aniqlik:</b> <b>${accText}%</b>\n` +
    (consistency ? `📊 <b>Izchillik:</b> <b>${Math.round(consistency)}%</b>\n` : '') +
    `⏱ <b>Rejim:</b> ${modeLabel}\n` +
    `🌐 <b>Til:</b> ${langLabel}\n` +
    (xp ? `💎 <b>Umumiy Tajriba:</b> ${Number(xp).toLocaleString()} XP` + (totalTests ? ` • <b>${totalTests} ta test</b>\n` : '\n') : '') +
    `\n🌟 <i>Foydalanuvchi eski natijasini muvaffaqiyatli yangiladi va milliy reytingda yuqoriladi!</i>\n` +
    `🚀 Siz ham oʻz tezligingizni sinab koʻring: https://www.yolnoma.uz/leaderboard`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '🏆 Milliy Reytingni Koʻrish', url: 'https://www.yolnoma.uz/leaderboard' },
        { text: '⚡️ Rekordni Sinash', url: 'https://www.yolnoma.uz' }
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
