// Telegram Bot Congratulation Service
const TELEGRAM_BOT_TOKEN = '8591793719:AAEMGGe7Hh-olimHmtzesr4GeK2KYOSzegE';

// Chat IDs provided by user (Group 1, Group 2, Channel)
// Included both raw IDs and standard Telegram supergroup/channel -100 prefixes
const TARGET_CHAT_IDS = [
  '8269163077',
  '-1008269163077',
  '-8269163077',
  '3760506671',
  '-1003760506671',
  '-3760506671',
  '3922595440',
  '-1003922595440',
  '-3922595440'
];

interface CongratulationData {
  rank: number;
  displayName: string;
  username: string;
  wpm: number;
  accuracy: number;
  xp: number;
  isNewRecord?: boolean;
  prevTopWpm?: number;
  prevTopAccuracy?: number;
}

// Persistent storage helpers to avoid sending duplicates even after browser refresh
const getSentKeys = (): Set<string> => {
  try {
    const stored = localStorage.getItem('yolnoma_sent_tg_keys');
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.warn('LocalStorage read error for Telegram keys:', e);
  }
  return new Set();
};

const markKeyAsSent = (key: string) => {
  try {
    const keys = getSentKeys();
    keys.add(key);
    const arr = Array.from(keys).slice(-100);
    localStorage.setItem('yolnoma_sent_tg_keys', JSON.stringify(arr));
  } catch (e) {
    console.warn('LocalStorage write error for Telegram keys:', e);
  }
};

export const sendTelegramTop3Congratulation = async (data: CongratulationData) => {
  if (data.rank < 1 || data.rank > 3) return;

  const cacheKey = `${data.username || data.displayName}_rank_${data.rank}_wpm_${data.wpm}_acc_${data.accuracy}`;
  const sentKeys = getSentKeys();
  if (sentKeys.has(cacheKey)) return;
  markKeyAsSent(cacheKey);

  const medalEmoji = data.rank === 1 ? '🥇' : data.rank === 2 ? '🥈' : '🥉';
  const rankText = data.rank === 1 ? "1-O'RIN (CHAMPION)" : data.rank === 2 ? "2-O'RIN (SILVER)" : "3-O'RIN (BRONZE)";

  let recordNote = '';
  if (data.rank === 1) {
    if (data.prevTopAccuracy && data.accuracy < data.prevTopAccuracy) {
      recordNote = `\n🔥 <b>YANGI REKORD BOSH CHARXLANDI!</b>\n⚡ Siz oldingi tezlik natijasidan o'zib ketib, mutlaq 1-o'rinni egalladingiz! Aniqligingiz (${data.accuracy}%) biroz pastroq bo'lsada, shiddatli tezlik (${data.wpm} WPM) evaziga Peshqadamsiz! 💪\n`;
    } else {
      recordNote = `\n⚡ <b>MUTLAQ CHEMPIONLIK REKORDI!</b>\nYuqori yozish tezligi va ajoyib aniqlik bilan peshqadamlik taxtini egalladingiz! 👑\n`;
    }
  }

  const messageText = `ASSALOMU ALAYKUM ${data.username ? '@' + data.username : data.displayName}! 🎉

Sizni samimiy tabriklaymiz! Yolnoma Tez Yozish Platformasining global reytingida <b>${rankText}</b> ni egalladingiz! ${medalEmoji}
${recordNote}
📊 <b>Natijalaringiz:</b>
⚡ Tezlik: <b>${data.wpm} WPM</b>
🎯 Aniqlik: <b>${data.accuracy}%</b>
⭐ Tajriba: <b>${data.xp} XP</b>

Barcha ishtirokchilarga omad va yangi g'alabalar tilaymiz! 🚀
#Yolnoma #Top3 #Leaderboard #Typing #Poyga`;

  for (const chatId of TARGET_CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.warn(`Telegram message send warning for chat ${chatId}:`, err);
    }
  }
};
