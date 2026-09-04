// Vercel Serverless Function: /api/telegram-test
export default async function handler(req, res) {
  const RAW_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const BOT_TOKEN = (RAW_TOKEN && !RAW_TOKEN.includes('AAEK0fs'))
    ? RAW_TOKEN
    : '8591793719:AAHq07so4BoSstxU63zNL7YC55O-BenNUzg';
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8269163077';

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ success: false, error: 'Bot konfiguratsiyasi topilmadi' });
  }

  const testMessage =
    `🤖 <b>YOLNOMA BOT ALOQA TESTI (VERCEL SERVERLESS)</b>\n\n` +
    `✅ Telegram bot integratsiyasi serverless API orqali muvaffaqiyatli ulandi!\n` +
    `🕒 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}\n` +
    `🛡 <b>Himoya:</b> Token Cloak + Anti-Cheat Armored\n\n` +
    `<i>Bu xabar Yolnoma platformasidan sinov tariqasida yuborildi.</i>`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Telegram xatosi');
    }

    return res.status(200).json({
      success: true,
      message: 'Sinov xabari Telegramga muvaffaqiyatli yuborildi!',
      messageId: data.result?.message_id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
