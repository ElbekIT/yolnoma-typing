/**
 * Yolnoma Typing - Advanced SEO & Viral Growth Utility Engine
 * Handles dynamic meta tags, JSON-LD structured data, rich social previews,
 * and high-converting 1-tap social sharing (Telegram, WhatsApp, Twitter, etc.).
 */

export interface PageSEOInfo {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
}

export const SEO_PAGE_CONFIG: Record<string, PageSEOInfo> = {
  home: {
    title: "Yolnoma Typing - O'zbekistonda №1 Tez Yozish Platformasi",
    description: "Klaviaturada tez yozishni o'rganing, 10 barmoq mashqlarini bajaring va milliy reytingda bellashing!",
    keywords: "yolnoma, yolnoma typing, tez yozish testi, klaviaturada tez yozish, 10 barmoq bilan yozish, wpm test uzbek, speed typing uzbekistan, klaviatura trenajyori, touch typing test",
    canonicalUrl: "https://www.yolnoma.uz/"
  },
  typing: {
    title: "Tez Yozish Trenajyori & WPM Arena - Yolnoma Typing",
    description: "Klaviaturada tez yozish trenajyori, 125+ tilda so'zlar, kod testi va jonli WPM tezlik hisoblagichi.",
    keywords: "tez yozish trenajyori, yolnoma test, wpm hisoblagich, monkeytype uzbek",
    canonicalUrl: "https://www.yolnoma.uz/test"
  },
  leaderboard: {
    title: "Milliy Reyting - O'zbekistonning Eng Tezkor Yozuvchilari | Yolnoma Typing",
    description: "Yolnoma Typing rasmiy milliy peshqadamlar jadvali. O'zbekiston bo'yicha eng yuqori WPM tezlikka ega foydalanuvchilar va kunlik rekordlar.",
    keywords: "yolnoma reyting, eng tez yozuvchilar, typing leaderboard uzbekistan, wpm rekordlar, typing arena reyting, o'zbekcha tez yozish chempionlari",
    canonicalUrl: "https://www.yolnoma.uz/leaderboard"
  },
  battle: {
    title: "Speedway Battle Arena - Jonli 1v1 Tez Yozish Janglari | Yolnoma Typing",
    description: "Boshqa foydalanuvchilar bilan real-vaqtda klaviaturada tez yozish jangi. Duelda g'alaba qozoning va tajriba ballaringizni oshiring!",
    keywords: "yolnoma battle, tez yozish jangi, typing arena 1v1, speedway battle, klaviatura dueli, real-time typing battle uzbek",
    canonicalUrl: "https://www.yolnoma.uz/battle"
  },
  lessons: {
    title: "10 Barmoq Mashqlari & Saboqlar - Ko'r-ko'rona Yozish Kursi | Yolnoma",
    description: "Klaviaturaga qaramasdan 10 barmoq bilan tez yozishni bosqichma-bosqich o'rganing. Boshlang'ichdan professional darajagacha bepul interaktiv mashqlar.",
    keywords: "10 barmoq saboqlari, klaviaturada yozishni organish, touch typing darslari, kor korona yozish uzbekcha, tez yozish kurslari",
    canonicalUrl: "https://www.yolnoma.uz/lessons"
  },
  languages: {
    title: "125+ Jahon Tillari & Lug'atlar - Klaviaturada Tez Yozish | Yolnoma",
    description: "O'zbek (Lotin va Kirill), Ingliz, Rus va dunyoning 125 dan ortiq tillarida yozish mashqlari. Istalgan tilda WPM tezligingizni sinab ko'ring.",
    keywords: "yolnoma tillar, o'zbekcha yozish testi, ruscha tez yozish, inglizcha typing test, 125 languages typing",
    canonicalUrl: "https://www.yolnoma.uz/languages"
  },
  statistics: {
    title: "Shaxsiy Statistika & Tahlil - Tezlik O'sish Grafigi | Yolnoma",
    description: "Barcha topshirilgan testlar tarixi, WPM va aniqlik dinamikasi, eng ko'p adashilgan harflar tahlili.",
    keywords: "typing statistika, wpm grafigi, aniqlik tahlili, klaviatura tezlik rekordi",
    canonicalUrl: "https://www.yolnoma.uz/statistics"
  },
  achievements: {
    title: "Yutuqlar & Unvonlar - Professional Tipist Pog'onalari | Yolnoma",
    description: "Tez yozish orqali yangi unvonlar, medallar va yutuqlarni qo'lga kiriting. O'z mahoratingizni isbotlang!",
    keywords: "yolnoma yutuqlar, typing badges, tez yozish medali, unvonlar",
    canonicalUrl: "https://www.yolnoma.uz/achievements"
  },
  challenges: {
    title: "Musobaqalar & Maxsus Bellashuvlar | Yolnoma Typing",
    description: "Kunlik va haftalik tez yozish topshiriqlari, murakkab matnlar va tezlik musobaqalari.",
    keywords: "typing challenges, kunlik musobaqa, tez yozish topshirig'i",
    canonicalUrl: "https://www.yolnoma.uz/challenges"
  },
  partners: {
    title: "Rasmiy Hamkor va Homiyimiz - Shamsiddin Kamoliddinov | Yolnoma Typing",
    description: "Yolnoma platformasining rivojlanishi va yoshlarning IT hamda klaviaturada tez yozish ko'nikmalarini oshirishdagi rasmiy hamkor va homiysi.",
    keywords: "yolnoma hamkor, yolnoma homiy, shamsiddin kamoliddinov, Farg'ona Davlat Texnika Universiteti, sun'iy intellekt",
    canonicalUrl: "https://www.yolnoma.uz/partners"
  },
  owner: {
    title: "Sayt Haqida & Muallif - Yolnoma Typing Tarixi",
    description: "Yolnoma platformasi haqida ma'lumot, yaratilish tarixi va maqsadlari.",
    keywords: "yolnoma haqida, muallif, yolnoma kim yaratgan",
    canonicalUrl: "https://www.yolnoma.uz/about"
  },
  dashboard: {
    title: "Boshqaruv Paneli | Yolnoma Typing",
    description: "Foydalanuvchi shaxsiy boshqaruv va statistika paneli.",
    keywords: "yolnoma dashboard, profil boshqaruvi",
    canonicalUrl: "https://www.yolnoma.uz/dashboard"
  }
};

/**
 * Dynamically updates document title and SEO meta tags in the document head
 */
export function updatePageSEO(tabKey: string, customTitle?: string, customDesc?: string) {
  if (typeof document === 'undefined') return;

  const info = SEO_PAGE_CONFIG[tabKey] || SEO_PAGE_CONFIG.typing;
  const finalTitle = customTitle || info.title;
  const finalDesc = customDesc || info.description;

  document.title = finalTitle;

  // Helper to set or create meta tag
  const setMeta = (nameAttr: string, nameValue: string, content: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${nameValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, nameValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Primary meta
  setMeta('name', 'title', finalTitle);
  setMeta('name', 'description', finalDesc);
  setMeta('name', 'keywords', info.keywords);

  // OpenGraph
  setMeta('property', 'og:title', finalTitle);
  setMeta('property', 'og:description', finalDesc);
  setMeta('property', 'og:url', info.canonicalUrl);

  // Twitter
  setMeta('name', 'twitter:title', finalTitle);
  setMeta('name', 'twitter:description', finalDesc);
  setMeta('name', 'twitter:url', info.canonicalUrl);

  // Canonical link
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', info.canonicalUrl);
}

export const OFFICIAL_TELEGRAM_CHANNEL = 'https://t.me/yolnoma_uz1';
export const OFFICIAL_TELEGRAM_HANDLE = '@yolnoma_uz1';

export function openTelegramChannel() {
  window.open(OFFICIAL_TELEGRAM_CHANNEL, '_blank', 'noopener,noreferrer');
}

/**
 * Viral Sharing Helpers
 */
export interface SharePayload {
  wpm?: number;
  accuracy?: number;
  rank?: number;
  customText?: string;
  source?: string;
}

export function generateShareUrl(payload?: SharePayload): string {
  const baseUrl = 'https://www.yolnoma.uz';
  if (!payload) return baseUrl;

  const params = new URLSearchParams();
  if (payload.wpm) params.set('wpm', String(payload.wpm));
  if (payload.accuracy) params.set('acc', String(payload.accuracy));
  if (payload.rank) params.set('rank', String(payload.rank));
  if (payload.source) params.set('ref', payload.source);

  const queryString = params.toString();
  return queryString ? `${baseUrl}/?${queryString}` : baseUrl;
}

export function generateShareMessage(payload?: SharePayload): string {
  if (payload?.wpm) {
    const accText = payload.accuracy ? ` (${payload.accuracy}% aniqlik)` : '';
    const rankText = payload.rank ? ` va milliy reytingda #${payload.rank}-o'rinni oldim` : '';
    return `⚡ Men Yolnoma Typing platformasida ${payload.wpm} WPM tezlikka erishdim${accText}${rankText}! 🏆 Siz qanchalik tez yoza olasiz? O'z kuchingizni sinab ko'ring:`;
  }

  return `🚀 Klaviaturada 10 barmoq bilan tez yozishni xohlaysizmi? Yolnoma Typing platformasida 125+ tilda tezligingizni sinab ko'ring va milliy reytingda qatnashing:`;
}

/**
 * Open Telegram 1-tap share
 */
export function shareToTelegram(payload?: SharePayload) {
  const text = generateShareMessage(payload);
  const url = generateShareUrl(payload);
  const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Open WhatsApp 1-tap share
 */
export function shareToWhatsApp(payload?: SharePayload) {
  const text = `${generateShareMessage(payload)} ${generateShareUrl(payload)}`;
  const fullUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Open Twitter / X 1-tap share
 */
export function shareToTwitter(payload?: SharePayload) {
  const text = generateShareMessage(payload);
  const url = generateShareUrl(payload);
  const fullUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=Yolnoma,TypingTest,TouchTyping,Uzbekistan`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Open Facebook 1-tap share
 */
export function shareToFacebook(payload?: SharePayload) {
  const url = generateShareUrl(payload);
  const fullUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Copy shareable challenge text to clipboard
 */
export async function copyShareText(payload?: SharePayload): Promise<boolean> {
  const text = `${generateShareMessage(payload)} ${generateShareUrl(payload)}`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (e) {
    console.error('Clipboard copy failed:', e);
    return false;
  }
}
