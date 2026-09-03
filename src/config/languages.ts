import { LanguageCode } from '../types';
import { LanguageInfo } from './languages/types';
import { turkicLanguages } from './languages/turkic';
import { europeanLanguages } from './languages/european';
import { slavicCyrillicLanguages } from './languages/slavic_cyrillic';
import { middleEasternLanguages } from './languages/middle_eastern';
import { southAsianLanguages } from './languages/south_asian';
import { eastAsianLanguages } from './languages/east_asian';
import { africanLanguages } from './languages/african';
import { caucasusAmericasLanguages } from './languages/caucasus_americas';

export type { LanguageInfo };

// Master compiled list of all world languages across every continent
export const languagesList: LanguageInfo[] = [
  ...turkicLanguages,
  ...europeanLanguages,
  ...slavicCyrillicLanguages,
  ...middleEasternLanguages,
  ...southAsianLanguages,
  ...eastAsianLanguages,
  ...africanLanguages,
  ...caucasusAmericasLanguages
];

export function getLanguageInfo(code: LanguageCode): LanguageInfo {
  let customLangs: LanguageInfo[] = [];
  try {
    const raw = localStorage.getItem('yolnoma_owner_custom_languages');
    if (raw) {
      customLangs = JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }

  const allLangs = [...languagesList, ...customLangs];
  const found = allLangs.find((l) => l.code.toLowerCase() === code.toLowerCase());
  if (found) return found;

  return {
    code,
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
    flag: '🌐',
    dir: ['ar', 'he', 'fa', 'ur', 'ps', 'ug', 'dv', 'sd'].includes(code) ? 'rtl' : 'ltr',
    script: 'Latin',
    words: languagesList[0].words,
    sentences: languagesList[0].sentences,
    quotes: languagesList[0].quotes
  };
}

export const codeSnippets = {
  javascript: [
    `function calculateWpm(typedChars, timeInSeconds) {\n  const words = typedChars / 5;\n  const minutes = timeInSeconds / 60;\n  return Math.round(words / minutes);\n}`,
    `const quickSelect = (arr, k) => {\n  if (arr.length <= 1) return arr[0];\n  const pivot = arr[Math.floor(arr.length / 2)];\n  return pivot;\n};`,
    `async function fetchLeaderboard(lang) {\n  const response = await fetch('/api/leaderboard?lang=' + lang);\n  return await response.json();\n}`
  ],
  python: [
    `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)`,
    `import time\n\nstart_time = time.time()\nelapsed = time.time() - start_time\nprint(f"Time taken: {elapsed:.2f}s")`
  ],
  html: [
    `<div class="typing-container" dir="auto">\n  <span class="correct">Yolnoma</span>\n  <span class="current">Typing</span>\n</div>`,
    `<button id="restart" onclick="resetTest()">\n  Restart Test\n</button>`
  ]
};

export const uiTranslations: Record<string, Record<string, string>> = {
  en: {
    typingTest: 'Typing Test',
    dashboard: 'Dashboard',
    leaderboard: 'Leaderboard',
    statistics: 'Statistics',
    history: 'History',
    achievements: 'Achievements',
    challenges: 'Challenges',
    profile: 'Profile',
    settings: 'Settings',
    about: 'About',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    time: 'Time',
    words: 'Words',
    mode: 'Mode',
    language: 'Language',
    selectLanguage: 'Select Language',
    difficulty: 'Difficulty',
    restart: 'Restart Test',
    nextTest: 'Next Test',
    wpm: 'WPM',
    cpm: 'CPM',
    accuracy: 'Accuracy',
    raw: 'Raw WPM',
    errors: 'Errors',
    personalBest: 'Personal Best',
    shareResult: 'Share Result',
    dailyStreak: 'Daily Streak',
    totalTests: 'Total Tests',
    searchPlayers: 'Search players...'
  },
  'uz-latn': {
    typingTest: 'Yozish Testi',
    dashboard: 'Boshqaruv Paneli',
    leaderboard: 'Peshqadamlar',
    statistics: 'Statistika',
    history: 'Tarix',
    achievements: 'Yutuqlar',
    challenges: 'Muvaffaqiyatlar',
    profile: 'Profil',
    settings: 'Sozlamalar',
    about: 'Haqida',
    signIn: 'Kirish',
    signOut: 'Chiqish',
    time: 'Vaqt',
    words: 'Soʻzlar',
    mode: 'Rejim',
    language: 'Til',
    selectLanguage: 'Tilni Tanlang',
    difficulty: 'Qiyinchilik',
    restart: 'Qayta Boshlash',
    nextTest: 'Keyingi Test',
    wpm: 'Soʻz/daq',
    cpm: 'Belgi/daq',
    accuracy: 'Aniqlik',
    raw: 'Xom WPM',
    errors: 'Xatolar',
    personalBest: 'Shaxsiy Rekord',
    shareResult: 'Natijani Ulashish',
    dailyStreak: 'Kunlik Seriya',
    totalTests: 'Jami Testlar',
    searchPlayers: 'Oʻyinchilarni qidirish...'
  },
  ru: {
    typingTest: 'Тест печати',
    dashboard: 'Панель',
    leaderboard: 'Лидеры',
    statistics: 'Статистика',
    history: 'История',
    achievements: 'Достижения',
    challenges: 'Испытания',
    profile: 'Профиль',
    settings: 'Настройки',
    about: 'О нас',
    signIn: 'Войти',
    signOut: 'Выйти',
    time: 'Время',
    words: 'Слова',
    mode: 'Режим',
    language: 'Язык',
    selectLanguage: 'Выберите язык',
    difficulty: 'Сложность',
    restart: 'Перезапустить',
    nextTest: 'Следующий тест',
    wpm: 'Слова/мин',
    cpm: 'Знаки/мин',
    accuracy: 'Точность',
    raw: 'Сырой WPM',
    errors: 'Ошибки',
    personalBest: 'Личный рекорд',
    shareResult: 'Поделиться',
    dailyStreak: 'Дней подряд',
    totalTests: 'Всего тестов',
    searchPlayers: 'Поиск игроков...'
  },
  tr: {
    typingTest: 'Yazma Testi',
    dashboard: 'Panel',
    leaderboard: 'Liderler',
    statistics: 'İstatistikler',
    history: 'Geçmiş',
    achievements: 'Başarılar',
    challenges: 'Görevler',
    profile: 'Profil',
    settings: 'Ayarlar',
    about: 'Hakkında',
    signIn: 'Giriş Yap',
    signOut: 'Çıkış Yap',
    time: 'Süre',
    words: 'Kelimeler',
    mode: 'Mod',
    language: 'Dil',
    selectLanguage: 'Dil Seçin',
    difficulty: 'Zorluk',
    restart: 'Yeniden Başlat',
    nextTest: 'Sonraki Test',
    wpm: 'Kelime/dk',
    cpm: 'Karakter/dk',
    accuracy: 'Doğruluk',
    raw: 'Ham WPM',
    errors: 'Hatalar',
    personalBest: 'Kişisel Rekor',
    shareResult: 'Paylaş',
    dailyStreak: 'Günlük Seri',
    totalTests: 'Toplam Test',
    searchPlayers: 'Oyuncu ara...'
  },
  ar: {
    typingTest: 'اختبار الطباعة',
    dashboard: 'لوحة التحكم',
    leaderboard: 'المتصدرين',
    statistics: 'الإحصائيات',
    history: 'السجل',
    achievements: 'الإنجازات',
    challenges: 'التحديات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    about: 'حول الموقع',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    time: 'الوقت',
    words: 'الكلمات',
    mode: 'الوضع',
    language: 'اللغة',
    selectLanguage: 'اختر اللغة',
    difficulty: 'الصعوبة',
    restart: 'إعادة الاختبار',
    nextTest: 'الاختبار التالي',
    wpm: 'كلمة/دقيقة',
    cpm: 'حرف/دقيقة',
    accuracy: 'الدقة',
    raw: 'السرعة الخام',
    errors: 'الأخطاء',
    personalBest: 'أفضل نتيجة',
    shareResult: 'مشاركة النتيجة',
    dailyStreak: 'أيام متتالية',
    totalTests: 'إجمالي الاختبارات',
    searchPlayers: 'بحث عن اللاعبين...'
  }
};

export function t(key: string, lang: LanguageCode): string {
  const dict = uiTranslations[lang] || uiTranslations.en;
  return dict[key] || uiTranslations.en[key] || key;
}
