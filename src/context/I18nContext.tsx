import React, { createContext, useContext, useState, useEffect } from 'react';

export type UiLanguage = 'uz' | 'ru' | 'en';

export interface I18nContextType {
  uiLanguage: UiLanguage;
  setUiLanguage: (lang: UiLanguage) => void;
  t: (key: string) => string;
}

export const translations: Record<UiLanguage, Record<string, string>> = {
  uz: {
    // Brand & Hero
    heroBadge: "⚡️ Sekin yozish ish va o'qishda vaqtingizni o'g'irlaydi",
    heroTitlePart1: "Yozish Tezligingizni Sinab Ko'ring va ",
    heroTitleHighlight: "10 Barmoq Texnikasini",
    heroTitlePart2: " Egallang",
    heroDesc: "Yolnoma yordamida klaviaturadagi tezligingizni aniqlang, do'stlaringiz bilan 1v1 poyga qiling va milliy reytingda peshqadam bo'ling.",
    startTypingBtn: "Boshlash",
    battleArenaBtn: "1v1 Battle Arenasi",
    statLanguages: "125+ Jahon Tillari",
    statMultiplayer: "1v1 Jonli Musobaqa",
    statFree: "100% Mutlaqo Bepul",

    // Mini Leaderboard
    miniLeaderboardTitle: "Haftalik Peshqadamlar",
    miniLeaderboardSub: "Eng yuqori WPM qayd etgan tezkor foydalanuvchilar",
    joinLeaderboardText: "Reytingda qatnashish uchun Google orqali kiring",
    loginWithGoogle: "Google orqali kirish",
    viewFullLeaderboard: "To'liq reytingni ko'rish →",
    yourBestWpm: "Sizning shaxsiy natijangiz",
    youAreRanked: "Siz tizimdasiz va natijalaringiz reytingda hisoblanmoqda!",

    // Typing Arena
    arenaTitle: "Tez Yozish Trenajyori",
    arenaSubtitle: "Matnni imkon qadar tez va xatosiz terishga harakat qiling",
    wpmLabel: "WPM",
    cpmLabel: "CPM",
    accLabel: "Aniqlik",
    timeLabel: "Vaqt",
    pressAnyKeyToStart: "Yozishni boshlash uchun klaviaturadan istalgan harfni bosing...",
    backToHome: "← Bosh sahifa",
    podiumTitle: "Shohsupa — Eng Tezkor Ishtirokchilar",
    podiumSubtitle: "Haftalik eng yuqori WPM qayd etgan chempionlar",
    podiumRank1: "1-o'rin • Chempion",
    podiumRank2: "2-o'rin",
    podiumRank3: "3-o'rin",

    // Thematic Cards
    thematicTitle: "Mavzuli Mashqlar va Maxsus Imkoniyatlar",
    thematicSubtitle: "Klaviaturaning turli qismlarini charxlash va o'zingizga mos yo'nalishda shug'ullanish uchun tanlang",
    cardCodeTitle: "Dasturchilar uchun kod testi",
    cardCodeDesc: "JavaScript, Python, C++ va HTML sintaksislari. Qavslar, operatorlar va dasturchi kodlarini tez terish.",
    cardUzbekTitle: "O'zbek lotin harflari mashqi",
    cardUzbekDesc: "Oʻ, Gʻ, Sh, Ch, Ng va tutuq belgisi kabi o'ziga xos harflarni avtomatlashtirilgan 10 barmoq mashqi.",
    cardSymbolsTitle: "Tinish belgilari va raqamlar",
    cardSymbolsDesc: "Shift tugmasi kombinatsiyalari, foizlar, qavslar, maxsus belgilar va raqamli bloklar bilan ishlash.",
    cardQuotesTitle: "Mashhur hikmatlar va iqtiboslar",
    cardQuotesDesc: "Alisher Navoiy, Abdulla Qodiriy, Cho'lpon va jahon donishmandlarining teran falsafiy durdonalari.",
    cardBattleTitle: "1v1 Speedway Battle",
    cardBattleDesc: "Do'stlaringizga xona kodi yuboring va real vaqtda bir-biringiz bilan kim tezroq yozishini sinang!",
    startPractice: "Mashqni boshlash →",
    enterBattle: "Jangga kirish →",

    // Imkoniyatlar (Features)
    featuresBadge: "Platforma Afzalliklari",
    featuresTitle: "Zamonaviy va Mukammal Imkoniyatlar",
    featuresSubtitle: "Yolnoma platformasi tez yozish mahoratingizni yangi bosqichga olib chiqish uchun yaratilgan",
    featLanguagesTitle: "To'liq 3 ta Til & 125+ Lug'at",
    featLanguagesDesc: "O'zbekcha (Lotin va Kirill), Ruscha va Inglizcha to'liq interfeys hamda 125 dan ortiq jahon tillaridagi boy lug'at bazasi.",
    featFreeTitle: "100% Bepul va Ochiq",
    featFreeDesc: "Barcha imkoniyatlar, 10 barmoq saboqlari, 1v1 onlayn poygalar va milliy reyting hech qanday to'lovlarsiz barchaga ochiq.",
    featAnimationsTitle: "Silliq Animatsiya va Neon Dizayn",
    featAnimationsDesc: "Ko'zni toliqtirmaydigan qorong'u (Dark) fon, zamonaviy neon effektlar va harakatli silliq kursor animatsiyasi.",
    featStatsTitle: "Aniq Statistika va Anti-Cheat",
    featStatsDesc: "Haqiqiy WPM, CPM, aniqlik, ritm tahlili hamda sun'iy bot va avtoklikerlardan himoyalangan rasmiy milliy reyting.",

    // Qanday ishlaydi (How it works)
    howItWorksBadge: "Oddiy va Qulay",
    howItWorksTitle: "Qanday Ishlaydi?",
    howItWorksSubtitle: "Bor-yo'g'i 3 ta oddiy qadam bilan o'z tezligingizni sinang va mahoratingizni oshiring",
    step1Num: "01",
    step1Title: "Test rejimini tanlang",
    step1Desc: "15, 30 yoki 60 soniyali vaqt rejimini yoki maxsus mavzuli (dasturlash, lotin harflari, iqtiboslar) mashqni tanlang.",
    step2Num: "02",
    step2Title: "Matnni tez va aniq tering",
    step2Desc: "Klaviatura orqali matnni imkon qadar tez, ritmni saqlagan holda va xatolarsiz kiritishni boshlang.",
    step3Num: "03",
    step3Title: "Natija va reytingni oling",
    step3Desc: "Soniyalar ichida shaxsiy WPM va aniqlik ko'rsatkichlaringizni bilib oling hamda O'zbekiston milliy reytingida o'rningizni ko'ring!",
    tryNowBtn: "Hozir Sinab Ko'rish",
    navHome: "Bosh Sahifa",

    // Navigation & Common
    navTyping: "Yozish Testi",
    navSpaceGame: "Koinot Jangi",
    navLanguages: "Tillar",
    navLessons: "Saboqlar",
    navBattle: "Battle Arena",
    navDashboard: "Boshqaruv",
    navLeaderboard: "Peshqadamlar",
    navStatistics: "Statistika",
    navAchievements: "Yutuqlar",
    navChallenges: "Musobaqalar",
    navPartners: "Hamkorlar",
    navAbout: "Sayt Haqida",
    navLogin: "Kirish",
    navLogout: "Chiqish",
    navSettings: "Sozlamalar",
    themeLabel: "Mavzu",
    soundLabel: "Ovoz",

    // SEO & FAQ
    faqTitle: "Ko'p Beriladigan Savollar (FAQ)",
    guideTitle: "Foydali Qo'llanma & Yo'riqnoma",
    guideHeader: "Klaviaturada Tez Yozish va 10 Barmoq Mashqlari — Yolnoma Typing",
    guideDesc: "O'zbekistonda klaviaturada ko'r-ko'rona tez yozish (touch typing) madaniyatini rivojlantirish, barmoqlarni to'g'ri joylashtirish, WPM tezligini oshirish va professional darajaga chiqish bo'yicha to'liq qo'llanma."
  },

  ru: {
    // Brand & Hero
    heroBadge: "⚡️ Медленная печать отнимает время в работе и учебе",
    heroTitlePart1: "Проверьте Скорость Печати и Освойте ",
    heroTitleHighlight: "10-пальцевый Метод",
    heroTitlePart2: " Набора",
    heroDesc: "Определите свою скорость на клавиатуре с помощью Yolnoma, соревнуйтесь с друзьями в битвах 1v1 и станьте лидером национального рейтинга.",
    startTypingBtn: "Начать",
    battleArenaBtn: "Арена Битв 1v1",
    statLanguages: "125+ Языков Мира",
    statMultiplayer: "1v1 Онлайн Гонки",
    statFree: "100% Бесплатно",

    // Mini Leaderboard
    miniLeaderboardTitle: "Лидеры Недели",
    miniLeaderboardSub: "Самые быстрые пользователи с наивысшим WPM",
    joinLeaderboardText: "Войдите через Google, чтобы попасть в рейтинг",
    loginWithGoogle: "Войти через Google",
    viewFullLeaderboard: "Смотреть весь рейтинг →",
    yourBestWpm: "Ваш личный рекорд",
    youAreRanked: "Вы авторизованы, ваши результаты учитываются в рейтинге!",

    // Typing Arena
    arenaTitle: "Тренажер Быстрой Печати",
    arenaSubtitle: "Старайтесь набирать текст максимально быстро и без ошибок",
    wpmLabel: "WPM (Сл/мин)",
    cpmLabel: "CPM (Зн/мин)",
    accLabel: "Точность",
    timeLabel: "Время",
    pressAnyKeyToStart: "Нажмите любую клавишу, чтобы начать тест печати...",
    backToHome: "← На главную",
    podiumTitle: "Пьедестал — Самые Быстрые Участники",
    podiumSubtitle: "Еженедельные чемпионы с самым высоким WPM",
    podiumRank1: "1-е место • Чемпион",
    podiumRank2: "2-е место",
    podiumRank3: "3-е место",

    // Thematic Cards
    thematicTitle: "Тематические Тесты и Возможности",
    thematicSubtitle: "Выберите подходящее направление для тренировки пальцев и улучшения навыков",
    cardCodeTitle: "Тест кода для программистов",
    cardCodeDesc: "Синтаксис JavaScript, Python, C++ и HTML. Скоростной набор скобок, операторов и ключевых слов.",
    cardUzbekTitle: "Практика узбекской латиницы",
    cardUzbekDesc: "Специальные упражнения на буквы Oʻ, Gʻ, Sh, Ch, Ng и апострофы для идеального набора.",
    cardSymbolsTitle: "Знаки препинания и цифры",
    cardSymbolsDesc: "Комбинации с клавишей Shift, проценты, скобки, математические символы и цифровой блок.",
    cardQuotesTitle: "Знаменитые цитаты и афоризмы",
    cardQuotesDesc: "Мудрые изречения Алишера Навои, Абдуллы Кадыри и великих мыслителей мира.",
    cardBattleTitle: "Гонка 1v1 Speedway Battle",
    cardBattleDesc: "Отправьте код комнаты другу и выясните в реальном времени, кто печатает быстрее!",
    startPractice: "Начать тренировку →",
    enterBattle: "Вступить в бой →",

    // Возможности (Features)
    featuresBadge: "Преимущества Платформы",
    featuresTitle: "Современные и Мощные Возможности",
    featuresSubtitle: "Платформа Yolnoma создана для вывода вашей скорости печати на совершенно новый уровень",
    featLanguagesTitle: "3 Языка Интерфейса & 125+ Словарей",
    featLanguagesDesc: "Полная поддержка Узбекского, Русского и Английского интерфейсов, а также тексты на более чем 125 языках мира.",
    featFreeTitle: "100% Бесплатно и Открыто",
    featFreeDesc: "Все функции, уроки 10-пальцевого набора, онлайн-битвы 1v1 и национальный рейтинг абсолютно бесплатны для всех.",
    featAnimationsTitle: "Плавная Анимация и Неон",
    featAnimationsDesc: "Комфортная темная тема, стильный неоновый дизайн, эргономичный интерфейс и плавный курсор печати.",
    featStatsTitle: "Точная Статистика и Anti-Cheat",
    featStatsDesc: "Реальный расчет WPM, CPM, точности и ритма с надежной серверной защитой от ботов и читеров.",

    // Как это работает (How it works)
    howItWorksBadge: "Просто и Удобно",
    howItWorksTitle: "Как Это Работает?",
    howItWorksSubtitle: "Всего 3 простых шага для проверки скорости и совершенствования навыков печати",
    step1Num: "01",
    step1Title: "Выберите режим теста",
    step1Desc: "Выберите время (15, 30 или 60 секунд) либо тематический режим (код, цитаты, латиница, знаки).",
    step2Num: "02",
    step2Title: "Печатайте быстро и точно",
    step2Desc: "Набирайте отображаемый текст на клавиатуре, сохраняя высокий темп, ритм и минимум ошибок.",
    step3Num: "03",
    step3Title: "Получите результат и рейтинг",
    step3Desc: "Мгновенно узнайте свои показатели WPM и точности и займите достойное место в общем рейтинге лидеров!",
    tryNowBtn: "Попробовать Сейчас",
    navHome: "Главная",

    // Navigation & Common
    navTyping: "Тест Печати",
    navSpaceGame: "Космическая Битва",
    navLanguages: "Языки",
    navLessons: "Уроки",
    navBattle: "Арена Битв",
    navDashboard: "Панель",
    navLeaderboard: "Лидеры",
    navStatistics: "Статистика",
    navAchievements: "Достижения",
    navChallenges: "Испытания",
    navPartners: "Партнеры",
    navAbout: "О проекте",
    navLogin: "Войти",
    navLogout: "Выйти",
    navSettings: "Настройки",
    themeLabel: "Тема",
    soundLabel: "Звук",

    // SEO & FAQ
    faqTitle: "Часто Задаваемые Вопросы (FAQ)",
    guideTitle: "Полезное Руководство & Инструкция",
    guideHeader: "Быстрая Печать на Клавиатуре и 10-пальцевые Упражнения — Yolnoma Typing",
    guideDesc: "Полное руководство по развитию слепого 10-пальцевого набора, правильной постановке пальцев, повышению скорости WPM и достижению профессионализма в печати."
  },

  en: {
    // Brand & Hero
    heroBadge: "⚡️ Slow typing steals valuable time from work & studies",
    heroTitlePart1: "Test Your Typing Speed & Master the ",
    heroTitleHighlight: "10-Finger Touch",
    heroTitlePart2: " Technique",
    heroDesc: "Discover your true keyboard typing speed with Yolnoma, challenge friends in live 1v1 speed battles, and climb the national leaderboard.",
    startTypingBtn: "Start Typing",
    battleArenaBtn: "1v1 Battle Arena",
    statLanguages: "125+ World Languages",
    statMultiplayer: "1v1 Live Races",
    statFree: "100% Free Forever",

    // Mini Leaderboard
    miniLeaderboardTitle: "Weekly Champions",
    miniLeaderboardSub: "Top fastest typists with the highest WPM",
    joinLeaderboardText: "Sign in with Google to enter the leaderboard",
    loginWithGoogle: "Sign in with Google",
    viewFullLeaderboard: "View Full Leaderboard →",
    yourBestWpm: "Your Personal Record",
    youAreRanked: "You are signed in and your scores are ranked!",

    // Typing Arena
    arenaTitle: "Touch Typing Arena",
    arenaSubtitle: "Type the target text as quickly and accurately as possible",
    wpmLabel: "WPM",
    cpmLabel: "CPM",
    accLabel: "Accuracy",
    timeLabel: "Time",
    pressAnyKeyToStart: "Press any key on your keyboard to start typing...",
    backToHome: "← Home",
    podiumTitle: "Podium — Top Fastest Typists",
    podiumSubtitle: "Weekly champions with the highest WPM score",
    podiumRank1: "1st Place • Champion",
    podiumRank2: "2nd Place",
    podiumRank3: "3rd Place",

    // Thematic Cards
    thematicTitle: "Thematic Tests & Core Capabilities",
    thematicSubtitle: "Target specific muscle groups and choose practice categories tailored to your goals",
    cardCodeTitle: "Code Typing for Developers",
    cardCodeDesc: "JavaScript, Python, C++, and HTML syntax practice. Brackets, operators, and code formatting.",
    cardUzbekTitle: "Uzbek Latin Alphabet Practice",
    cardUzbekDesc: "Focused drills on unique Uzbek letters: Oʻ, Gʻ, Sh, Ch, Ng, and apostrophe combinations.",
    cardSymbolsTitle: "Punctuation & Number Drills",
    cardSymbolsDesc: "Master the Shift key, brackets, currencies, percentages, and upper numeric row accuracy.",
    cardQuotesTitle: "Famous Quotes & Timeless Wisdom",
    cardQuotesDesc: "Inspiring excerpts from Alisher Navoiy, Abdulla Qodiriy, and legendary world literature.",
    cardBattleTitle: "1v1 Speedway Battle Arena",
    cardBattleDesc: "Share a private room code with friends and race head-to-head in real time!",
    startPractice: "Start Practice →",
    enterBattle: "Enter Battle →",

    // Features
    featuresBadge: "Platform Highlights",
    featuresTitle: "Modern & Powerful Capabilities",
    featuresSubtitle: "Engineered from the ground up to elevate your typing speed and muscle memory to the highest level",
    featLanguagesTitle: "3 UI Languages & 125+ Dictionaries",
    featLanguagesDesc: "Comprehensive trilingual interface (Uzbek, Russian, English) paired with extensive dictionaries across 125+ languages.",
    featFreeTitle: "100% Free Forever",
    featFreeDesc: "All features, touch typing lessons, real-time 1v1 multiplayer races, and national leaderboards are free with zero paywalls.",
    featAnimationsTitle: "Smooth Animations & Neon Design",
    featAnimationsDesc: "Eye-friendly dark canvas (#090d16), vibrant neon accents, responsive layout, and an ultra-smooth typing caret.",
    featStatsTitle: "Precise Analytics & Anti-Cheat",
    featStatsDesc: "True WPM, CPM, accuracy, keystroke rhythm analysis backed by cryptographic anti-cheat validation.",

    // How it works
    howItWorksBadge: "Simple & Seamless",
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Just 3 simple steps to test your typing speed and master touch typing",
    step1Num: "01",
    step1Title: "Choose your test mode",
    step1Desc: "Pick your preferred time duration (15s, 30s, 60s) or thematic category (code, quotes, alphabet drills, symbols).",
    step2Num: "02",
    step2Title: "Type with speed and precision",
    step2Desc: "Begin typing the displayed text on your keyboard, focusing on rhythm, accuracy, and proper finger placement.",
    step3Num: "03",
    step3Title: "View results & climb rankings",
    step3Desc: "Instantly unlock your detailed WPM stats, accuracy breakdown, and see where you stand on the national leaderboard!",
    tryNowBtn: "Try It Now",
    navHome: "Home",

    // Navigation & Common
    navTyping: "Typing Test",
    navSpaceGame: "Space Shooter",
    navLanguages: "Languages",
    navLessons: "Lessons",
    navBattle: "Battle Arena",
    navDashboard: "Dashboard",
    navLeaderboard: "Leaderboard",
    navStatistics: "Statistics",
    navAchievements: "Achievements",
    navChallenges: "Challenges",
    navPartners: "Partners",
    navAbout: "About",
    navLogin: "Sign In",
    navLogout: "Sign Out",
    navSettings: "Settings",
    themeLabel: "Theme",
    soundLabel: "Sound",

    // SEO & FAQ
    faqTitle: "Frequently Asked Questions (FAQ)",
    guideTitle: "Comprehensive Guide & Manual",
    guideHeader: "Touch Typing & 10-Finger Keyboard Practice — Yolnoma Typing",
    guideDesc: "The ultimate guide to mastering blind touch typing, ergonomic finger placement, boosting your WPM, and achieving typing mastery in Uzbekistan."
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLanguage, setUiLanguageState] = useState<UiLanguage>(() => {
    // 1. Check URL path prefix first (e.g., /uz, /ru, /en)
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts[0] === 'uz' || parts[0] === 'ru' || parts[0] === 'en') {
        return parts[0] as UiLanguage;
      }
    }
    const saved = localStorage.getItem('yolnoma_ui_lang');
    if (saved === 'uz' || saved === 'ru' || saved === 'en') {
      return saved;
    }
    // Default to uz as specified: "Standart sahifa: https://www.yolnoma.uz/uz (O'zbekcha)"
    return 'uz';
  });

  const setUiLanguage = (lang: UiLanguage) => {
    setUiLanguageState(lang);
    try {
      localStorage.setItem('yolnoma_ui_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = uiLanguage;

    const handleLocationChange = () => {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts[0] === 'uz' || parts[0] === 'ru' || parts[0] === 'en') {
        setUiLanguageState(parts[0] as UiLanguage);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [uiLanguage]);

  const t = (key: string): string => {
    const langDict = translations[uiLanguage];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to Uzbek, then English
    if (translations.uz[key]) return translations.uz[key];
    if (translations.en[key]) return translations.en[key];
    return key;
  };

  return (
    <I18nContext.Provider value={{ uiLanguage, setUiLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
