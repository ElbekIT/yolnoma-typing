// Vercel Serverless Function: /api/leaderboard
// Provides ultra-fast, cached national typing leaderboard with Realtime Database synchronization

const DEFAULT_NATIONAL_LEADERBOARD = [
  {
    uid: 'usr_shamsiddin',
    displayName: 'Shamsiddin',
    username: 'shamsiddin_dev',
    avatarUrl: '/shamsiddin_partner.jpg',
    country: '🇺🇿 Oʻzbekiston (Toshkent)',
    highestWpm: 142,
    highestAccuracy: 99,
    time15Wpm: 148,
    time30Wpm: 144,
    time60Wpm: 142,
    time120Wpm: 135,
    totalTests: 620,
    level: 45,
    xp: 68000,
    rankTitle: 'Afsonaviy Teruvchi',
    bio: 'Tez yozish chempioni va hamkor',
    isVerified: true,
    language: 'uz',
    rawWpm: 150,
    consistency: 96
  },
  {
    uid: 'usr_gavharoy',
    displayName: 'Gavharoy',
    username: 'gavharoy',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=gavharoy',
    country: '🇺🇿 Oʻzbekiston (Toshkent)',
    highestWpm: 128,
    highestAccuracy: 99,
    time15Wpm: 135,
    time30Wpm: 130,
    time60Wpm: 128,
    time120Wpm: 120,
    totalTests: 450,
    level: 35,
    xp: 45000,
    rankTitle: 'Grandmaster Typer',
    bio: 'Respublika yetakchisi',
    isVerified: true,
    language: 'uz',
    rawWpm: 134,
    consistency: 97
  },
  {
    uid: 'usr_jasurbek',
    displayName: 'Jasurbek Haydarov',
    username: 'KanYonA',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=KanYonA',
    country: '🇺🇿 Oʻzbekiston',
    highestWpm: 122,
    highestAccuracy: 98,
    time15Wpm: 128,
    time30Wpm: 124,
    time60Wpm: 122,
    time120Wpm: 114,
    totalTests: 390,
    level: 30,
    xp: 39000,
    rankTitle: 'Grandmaster Dasturchi',
    bio: 'Fullstack Dasturchi • @KanYonA',
    isVerified: true,
    language: 'uz',
    rawWpm: 129,
    consistency: 95
  },
  {
    uid: 'usr_elbek',
    displayName: 'Elbek Qoriyev',
    username: 'elbek_pro',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=elbek',
    country: '🇺🇿 Oʻzbekiston (Samarqand)',
    highestWpm: 115,
    highestAccuracy: 98,
    time15Wpm: 122,
    time30Wpm: 118,
    time60Wpm: 115,
    time120Wpm: 108,
    totalTests: 380,
    level: 28,
    xp: 38000,
    rankTitle: 'Grandmaster Typer',
    bio: 'Frontend arxitektori',
    isVerified: true,
    language: 'uz',
    rawWpm: 121,
    consistency: 94
  },
  {
    uid: 'usr_maqsud',
    displayName: 'Maqsud </> Baxtiyorov',
    username: 'maqsud_baxtiyorov',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=maqsud',
    country: '🇺🇿 Oʻzbekiston',
    highestWpm: 108,
    highestAccuracy: 97,
    time15Wpm: 114,
    time30Wpm: 110,
    time60Wpm: 108,
    time120Wpm: 100,
    totalTests: 310,
    level: 24,
    xp: 31000,
    rankTitle: 'Master Typer',
    bio: 'Speedway Jangchisi • @maqsud_baxtiyorov',
    isVerified: true,
    language: 'uz',
    rawWpm: 114,
    consistency: 93
  },
  {
    uid: 'usr_sardor',
    displayName: 'Sardorbek',
    username: 'sardor_typer',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sardor',
    country: '🇺🇿 Oʻzbekiston (Fargʻona)',
    highestWpm: 98,
    highestAccuracy: 97,
    time15Wpm: 105,
    time30Wpm: 101,
    time60Wpm: 98,
    time120Wpm: 90,
    totalTests: 210,
    level: 19,
    xp: 22000,
    rankTitle: 'Master Typer',
    bio: 'Cyber Sportchi',
    isVerified: true,
    language: 'uz',
    rawWpm: 103,
    consistency: 92
  },
  {
    uid: 'usr_madina',
    displayName: 'Madina Olimova',
    username: 'madina_o',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=madina',
    country: '🇺🇿 Oʻzbekiston (Buxoro)',
    highestWpm: 92,
    highestAccuracy: 98,
    time15Wpm: 98,
    time30Wpm: 94,
    time60Wpm: 92,
    time120Wpm: 85,
    totalTests: 185,
    level: 17,
    xp: 19500,
    rankTitle: 'Master Typer',
    bio: 'Leksikograf va tarjimon',
    isVerified: true,
    language: 'uz',
    rawWpm: 96,
    consistency: 94
  },
  {
    uid: 'usr_azamat',
    displayName: 'Azamat Karimov',
    username: 'azamat_k',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=azamat',
    country: '🇺🇿 Oʻzbekiston (Andijon)',
    highestWpm: 88,
    highestAccuracy: 96,
    time15Wpm: 94,
    time30Wpm: 90,
    time60Wpm: 88,
    time120Wpm: 81,
    totalTests: 160,
    level: 15,
    xp: 16000,
    rankTitle: 'Master Typer',
    bio: 'Backend dasturchi',
    isVerified: true,
    language: 'uz',
    rawWpm: 92,
    consistency: 91
  },
  {
    uid: 'usr_javohir',
    displayName: 'Javohir Rustamov',
    username: 'javohir_r',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=javohir',
    country: '🇺🇿 Oʻzbekiston (Xorazm)',
    highestWpm: 82,
    highestAccuracy: 95,
    time15Wpm: 88,
    time30Wpm: 84,
    time60Wpm: 82,
    time120Wpm: 75,
    totalTests: 140,
    level: 13,
    xp: 14000,
    rankTitle: 'Pro Typer',
    bio: 'Talaba va dasturchi',
    isVerified: true,
    language: 'uz',
    rawWpm: 86,
    consistency: 90
  },
  {
    uid: 'usr_dilshod',
    displayName: 'Dilshodbek',
    username: 'dilshod_code',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=dilshod',
    country: '🇺🇿 Oʻzbekiston (Namangan)',
    highestWpm: 76,
    highestAccuracy: 94,
    time15Wpm: 82,
    time30Wpm: 78,
    time60Wpm: 76,
    time120Wpm: 69,
    totalTests: 110,
    level: 11,
    xp: 11500,
    rankTitle: 'Pro Typer',
    bio: 'Python muxlisi',
    isVerified: true,
    language: 'uz',
    rawWpm: 80,
    consistency: 89
  },
  {
    uid: 'usr_nodira',
    displayName: 'Nodira Yusupova',
    username: 'nodira_yu',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nodira',
    country: '🇺🇿 Oʻzbekiston (Qarshi)',
    highestWpm: 71,
    highestAccuracy: 95,
    time15Wpm: 77,
    time30Wpm: 73,
    time60Wpm: 71,
    time120Wpm: 64,
    totalTests: 95,
    level: 9,
    xp: 9800,
    rankTitle: 'Pro Typer',
    bio: 'Pedagog • 10 barmoqli teruvchi',
    isVerified: true,
    language: 'uz',
    rawWpm: 75,
    consistency: 91
  },
  {
    uid: 'usr_bobur',
    displayName: 'Bobur Mirzayev',
    username: 'bobur_m',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bobur',
    country: '🇺🇿 Oʻzbekiston (Jizzax)',
    highestWpm: 64,
    highestAccuracy: 93,
    time15Wpm: 70,
    time30Wpm: 66,
    time60Wpm: 64,
    time120Wpm: 58,
    totalTests: 75,
    level: 7,
    xp: 7500,
    rankTitle: 'Pro Typer',
    bio: 'Oʻquvchi',
    isVerified: true,
    language: 'uz',
    rawWpm: 68,
    consistency: 88
  },
  {
    uid: 'usr_umid',
    displayName: 'Umidjon Aliyev',
    username: 'umid_al',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=umid',
    country: '🇺🇿 Oʻzbekiston (Navoiy)',
    highestWpm: 58,
    highestAccuracy: 92,
    time15Wpm: 63,
    time30Wpm: 60,
    time60Wpm: 58,
    time120Wpm: 51,
    totalTests: 50,
    level: 5,
    xp: 5200,
    rankTitle: 'Typing Novice',
    bio: 'Yangi boshlovchi',
    isVerified: true,
    language: 'uz',
    rawWpm: 61,
    consistency: 86
  },
  {
    uid: 'usr_sevara',
    displayName: 'Sevara Karimova',
    username: 'sevara_k',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sevara',
    country: '🇺🇿 Oʻzbekiston (Guliston)',
    highestWpm: 52,
    highestAccuracy: 91,
    time15Wpm: 57,
    time30Wpm: 54,
    time60Wpm: 52,
    time120Wpm: 46,
    totalTests: 35,
    level: 4,
    xp: 3800,
    rankTitle: 'Typing Novice',
    bio: 'Mashq qilmoqda',
    isVerified: true,
    language: 'uz',
    rawWpm: 55,
    consistency: 85
  },
  {
    uid: 'usr_temur',
    displayName: 'Temur Malik',
    username: 'temur_m',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=temur',
    country: '🇺🇿 Oʻzbekiston (Nukus)',
    highestWpm: 48,
    highestAccuracy: 90,
    time15Wpm: 52,
    time30Wpm: 50,
    time60Wpm: 48,
    time120Wpm: 42,
    totalTests: 25,
    level: 3,
    xp: 2600,
    rankTitle: 'Typing Novice',
    bio: 'Koʻr-koʻrona yozishni oʻrganmoqda',
    isVerified: true,
    language: 'uz',
    rawWpm: 51,
    consistency: 84
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const language = req.query.language || req.query.lang;
  const timeMode = req.query.timeMode ? Number(req.query.timeMode) : undefined;
  const speedTier = req.query.speedTier;

  const now = Date.now();
  const userMap = new Map();

  // 1. Populate with baseline champions
  DEFAULT_NATIONAL_LEADERBOARD.forEach((u) => {
    userMap.set(u.uid, { ...u, lastActive: now });
  });

  // 2. Fetch fresh updates from Firebase Realtime Database
  try {
    const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://typing-euro-default-rtdb.firebaseio.com';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const rtdbRes = await fetch(`${dbUrl}/leaderboard.json`, {
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (rtdbRes && rtdbRes.ok) {
      const rtdbData = await rtdbRes.json().catch(() => null);
      if (rtdbData && typeof rtdbData === 'object') {
        Object.keys(rtdbData).forEach((uid) => {
          if (!uid || uid.startsWith('guest_') || uid.startsWith('bot_')) return;
          const lb = rtdbData[uid];
          if (!lb || typeof lb !== 'object') return;
          if (lb.isBanned || lb.isBlocked) return;

          const wpm = Number(lb.highestWpm || lb.wpm || 0);
          if (wpm <= 0 || wpm > 280) return;

          const existing = userMap.get(uid);
          userMap.set(uid, {
            uid,
            displayName: lb.displayName || lb.username || existing?.displayName || 'Foydalanuvchi',
            username: lb.username || existing?.username || 'user',
            avatarUrl: lb.avatarUrl || lb.photoURL || existing?.avatarUrl || '',
            country: lb.country || existing?.country || '🇺🇿 Oʻzbekiston',
            highestWpm: Math.max(wpm, existing?.highestWpm || 0),
            highestAccuracy: Math.min(100, Math.max(0, Number(lb.highestAccuracy || existing?.highestAccuracy || 98))),
            time15Wpm: Number(lb.time15Wpm || existing?.time15Wpm || wpm),
            time30Wpm: Number(lb.time30Wpm || existing?.time30Wpm || wpm),
            time60Wpm: Number(lb.time60Wpm || existing?.time60Wpm || wpm),
            time120Wpm: Number(lb.time120Wpm || existing?.time120Wpm || wpm),
            totalTests: Math.max(Number(lb.totalTests || 1), existing?.totalTests || 1),
            level: Number(lb.level || existing?.level || Math.max(1, Math.floor(wpm / 12))),
            xp: Number(lb.xp || existing?.xp || wpm * 20),
            rankTitle: lb.rankTitle || existing?.rankTitle || (wpm >= 110 ? 'Grandmaster Typer' : wpm >= 85 ? 'Master Typer' : 'Pro Typer'),
            lastActive: Number(lb.lastActive || now),
            bio: lb.bio || existing?.bio || '',
            isVerified: true,
            language: lb.language || existing?.language || 'uz',
            rawWpm: Number(lb.rawWpm || existing?.rawWpm || Math.round(wpm * 1.05)),
            consistency: Number(lb.consistency || existing?.consistency || 92)
          });
        });
      }
    }
  } catch (err) {
    // Graceful fallback to default roster
  }

  let list = Array.from(userMap.values());

  // Filter by language if requested
  if (language) {
    list = list.filter((r) => !r.language || r.language.toLowerCase().includes(String(language).toLowerCase()));
  }

  // Filter by speed tier if requested
  if (speedTier && speedTier !== 'all') {
    list = list.filter((u) => {
      const wpm = u.highestWpm || 0;
      if (speedTier === 'mythic') return wpm >= 140;
      if (speedTier === 'grandmaster') return wpm >= 110 && wpm < 140;
      if (speedTier === 'master') return wpm >= 85 && wpm < 110;
      if (speedTier === 'pro') return wpm >= 60 && wpm < 85;
      if (speedTier === 'novice') return wpm < 60;
      return true;
    });
  }

  // Sort according to time mode or all-time highest WPM
  if (timeMode === 15) {
    list.sort((a, b) => (b.time15Wpm || b.highestWpm) - (a.time15Wpm || a.highestWpm));
  } else if (timeMode === 30) {
    list.sort((a, b) => (b.time30Wpm || b.highestWpm) - (a.time30Wpm || a.highestWpm));
  } else if (timeMode === 60) {
    list.sort((a, b) => (b.time60Wpm || b.highestWpm) - (a.time60Wpm || a.highestWpm));
  } else if (timeMode === 120) {
    list.sort((a, b) => (b.time120Wpm || b.highestWpm) - (a.time120Wpm || a.highestWpm));
  } else {
    list.sort((a, b) => b.highestWpm - a.highestWpm);
  }

  const sliced = list.slice(0, limit);

  return res.status(200).json({
    success: true,
    totalVerified: list.length,
    leaderboard: sliced,
    users: sliced
  });
}
