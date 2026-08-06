import { LanguageCode } from '../types';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  script: string;
  words: string[];
  sentences: string[];
  quotes: { text: string; author: string }[];
}

export const languagesList: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'i', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand', 'old', 'life', 'tell', 'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off', 'child', 'few', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow', 'during', 'present', 'without', 'again', 'hold', 'code', 'keyboard', 'speed', 'screen', 'typing', 'accuracy', 'focus', 'flow', 'mind', 'practice', 'mastery'
    ],
    sentences: [
      'The quick brown fox jumps over the lazy dog.',
      'Practice makes perfect when learning touch typing.',
      'A journey of a thousand miles begins with a single keystroke.',
      'Simplicity is the ultimate sophistication in software engineering.',
      'Always code as if the person maintaining it is a violent psychopath.'
    ],
    quotes: [
      { text: 'Knowledge is power.', author: 'Francis Bacon' },
      { text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
      { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
      { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' }
    ]
  },
  {
    code: 'uz-latn',
    name: 'Uzbek (Latin)',
    nativeName: 'Oʻzbekcha',
    flag: '🇺🇿',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'va', 'bir', 'bu', 'uchun', 'ham', 'bilan', 'bilan', 'yoki', 'darak', 'bilan', 'bol', 'shu', 'oz', 'deb', 'xazina', 'keldi', 'bilan', 'bolib', 'hamda', 'kabi', 'har', 'bilan', 'biz', 'sen', 'u', 'siz', 'ular', 'men', 'davlat', 'yosh', 'katta', 'yangi', 'zamon', 'ish', 'ilm', 'fan', 'texnika', 'klaviatura', 'tezlik', 'xatosiz', 'matn', 'mashq', 'natija', 'yutuq', 'dunyo', 'hayot', 'vaqt', 'kun', 'yil', 'shahar', 'inson', 'doʻst', 'oila', 'kitob', 'soʻz', 'maktab', 'ilm', 'tarix', 'kelajak', 'orzu', 'maqsad', 'yoʻl', 'omad', 'baxt', 'bilim', 'taʼlim', 'tarbiya', 'madaniyat', 'tizim', 'dastur', 'sahifa', 'til', 'yozuv', 'tugma'
    ],
    sentences: [
      'Oʻzbekiston - kelajagi buyuk devlet, yoshlar esa uning tayanchi.',
      'Ilm olish igna bilan kuyu qazish kabidir, lekin mevasi shiringa teng.',
      'Har kuni ozgina mashq qilish orqali klaviaturada yozish tezligingizni oshiring.',
      'Yolnoma Typing platformasida oʻzingizni sinab koʻring va natijalaringizni yaxshilang.'
    ],
    quotes: [
      { text: 'Kuch — adolatdadir.', author: 'Amir Temur' },
      { text: 'Odamiylikning bosh mezon bilimi va odabidir.', author: 'Alisher Navoiy' }
    ]
  },
  {
    code: 'uz-cyrl',
    name: 'Uzbek (Cyrillic)',
    nativeName: 'Ўзбекча',
    flag: '🇺🇿',
    dir: 'ltr',
    script: 'Cyrillic',
    words: [
      'ва', 'бир', 'бу', 'учун', 'ҳам', 'билан', 'ёки', 'бўлиб', 'шу', 'ўз', 'деб', 'келди', 'ҳамда', 'каби', 'ҳар', 'биз', 'сен', 'у', 'сиз', 'улар', 'мен', 'давлат', 'ёш', 'катта', 'янги', 'замон', 'иш', 'ильм', 'фан', 'техника', 'клавиатура', 'тезлик', 'мато', 'машқ', 'натижа', 'ютуқ', 'дунё', 'ҳаёт', 'вақт', 'кун', 'йил', 'шаҳар', 'инсон', 'дўст', 'оила', 'китоб', 'сўз', 'мактаб', 'тарих', 'келажак', 'орзу', 'мақсад', 'йўл', 'омад', 'бахт', 'билим', 'таълим'
    ],
    sentences: [
      'Билим олиш ҳар бир инсоннинг бурчидир.',
      'Клавиатурада тез ва хатосиз ёзишни ўрганинг.',
      'Вақт — энг қимматбаҳо бойликдир.'
    ],
    quotes: [
      { text: 'Куч — адолатдадир.', author: 'Амир Темур' }
    ]
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
    script: 'Cyrillic',
    words: [
      'и', 'в', 'не', 'на', 'я', 'что', 'тот', 'быть', 'с', 'он', 'а', 'как', 'по', 'но', 'они', 'к', 'у', 'ты', 'из', 'мы', 'за', 'вы', 'все', 'так', 'его', 'от', 'сказать', 'этот', 'который', 'знать', 'пойти', 'свои', 'про', 'бы', 'год', 'время', 'дело', 'жизнь', 'день', 'рука', 'человек', 'работа', 'слово', 'глаз', 'место', 'город', 'дом', 'клавиатура', 'скорость', 'текст', 'точность', 'печать', 'пальцы', 'мышление', 'успех'
    ],
    sentences: [
      'Быстрая коричневая лиса прыгает через ленивую собаку.',
      'Практика — ключ к мастерству быстрой печати.',
      'Каждый день дает нам новый шанс стать лучше.'
    ],
    quotes: [
      { text: 'Красота спасет мир.', author: 'Федор Достоевский' },
      { text: 'Учиться, учиться и еще раз учиться.', author: 'Народная мудрость' }
    ]
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    script: 'Arabic',
    words: [
      'من', 'في', 'على', 'أن', 'إلى', 'هذا', 'كان', 'مع', 'عن', 'التي', 'الذي', 'كل', 'بعد', 'قد', 'لا', 'أو', 'لم', 'ما', 'هذه', 'بين', 'يكون', 'إذا', 'قبل', 'حتى', 'أكثر', 'أول', 'كما', 'عند', 'نفس', 'خلال', 'لكن', 'أيضاً', 'طريق', 'علم', 'عمل', 'وقت', 'كتابة', 'سرعة', 'دقة', 'لوحة', 'مفاتيح', 'لغة', 'عرب', 'نجاح', 'حياة', 'إنسان', 'معرفة'
    ],
    sentences: [
      'العلم نور والجهل ظلام في جميع الأوقات.',
      'التدريب المستمر على الطباعة يطور مهاراتك بشكل كبير.',
      'السرعة والدقة هما مفتاح إتقان الكتابة على لوحة المفاتيح.'
    ],
    quotes: [
      { text: 'من طلب العلا سهر الليالي.', author: 'حكمة عربية' },
      { text: 'العلم في الصغر كالنقش على الحجر.', author: 'حكمة عربية' }
    ]
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    script: 'Latin',
    words: [
      've', 'bir', 'bu', 'da', 'de', 'için', 'ile', 'o', 'daha', 'en', 'çok', 'gibi', 'kadar', 'sonra', 'yok', 'var', 'göre', 'oldu', 'zaman', 'her', 'kendi', 'olarak', 'ben', 'biz', 'siz', 'yeni', 'büyük', 'gün', 'iş', 'insan', 'klavye', 'hız', 'doğruluk', 'yazma', 'başarı', 'pratik', 'dünya', 'hayat', 'bilgi', 'eğitim', 'gelecek'
    ],
    sentences: [
      'Hızlı ve doğru klavye kullanımı zaman kazandırır.',
      'Bilgi güçtür ve öğrenmenin sonu yoktur.',
      'Her gün düzenli pratik yaparak gelişiminizi takip edin.'
    ],
    quotes: [
      { text: 'Hayatta en hakiki mürşit ilimdir.', author: 'Mustafa Kemal Atatürk' }
    ]
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'das', 'ist', 'du', 'ich', 'nicht', 'die', 'es', 'und', 'sie', 'der', 'wir', 'was', 'er', 'zu', 'mit', 'ja', 'wie', 'den', 'auf', 'mich', 'dass', 'so', 'hier', 'einen', 'eine', 'sie', 'sind', 'gut', 'tastatur', 'geschwindigkeit', 'genauigkeit', 'text', 'uebung', 'erfolg', 'zeit', 'arbeit', 'leben'
    ],
    sentences: [
      'Übung macht den Meister beim schnellen Tippen.',
      'Die Tastatur ist das wichtigste Werkzeug des Entwicklers.',
      'Erfolg ist die Summe kleiner täglicher Anstrengungen.'
    ],
    quotes: [
      { text: 'Wissen ist Macht.', author: 'Francis Bacon' }
    ]
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'du', 'une', 'que', 'est', 'pour', 'qui', 'dans', 'a', 'par', 'sur', 'pas', 'plus', 'avec', 'au', 'ce', 'ne', 'fais', 'clavier', 'vitesse', 'precision', 'texte', 'pratique', 'succes', 'temps', 'vie', 'monde'
    ],
    sentences: [
      'La vitesse et la précision viennent avec la pratique.',
      'Chaque jour est une nouvelle opportunité d apprendre.',
      'Maîtriser le dactylographie ouvre de nouvelles portes.'
    ],
    quotes: [
      { text: 'Je pense, donc je suis.', author: 'René Descartes' }
    ]
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'teclado', 'velocidad', 'precisión', 'texto', 'práctica', 'éxito', 'tiempo', 'vida', 'mundo'
    ],
    sentences: [
      'La práctica constante mejora la velocidad al escribir.',
      'Aprender a mecanografiar sin mirar el teclado ahorra tiempo.',
      'El éxito consiste en ir de fracaso en fracaso sin perder el entusiasmo.'
    ],
    quotes: [
      { text: 'Caminante, no hay camino, se hace camino al andar.', author: 'Antonio Machado' }
    ]
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    script: 'Japanese',
    words: [
      'これ', 'それ', 'あれ', '私', 'あなた', '時間', '世界', '仕事', '学校', 'キーボード', 'タイピング', '速度', '正確さ', '練習', '成功', '未来', '夢', '言葉', '生活', '勉強'
    ],
    sentences: [
      '毎日の練習がタイピング速度を向上させます。',
      '正確なキー入力は効率的な作業の基本です。',
      '継続は力なり、諦めずに練習を続けましょう。'
    ],
    quotes: [
      { text: '塵も積もれば山となる。', author: '日本の諺' }
    ]
  },
  {
    code: 'zh-hans',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    dir: 'ltr',
    script: 'Chinese',
    words: [
      '打字', '键盘', '速度', '准确率', '练习', '成功', '时间', '世界', '生活', '工作', '学习', '未来', '梦想', '科技', '编程', '思想', '知识', '力量'
    ],
    sentences: [
      '熟能生巧，每天坚持盲打练习能有效提升打字速度。',
      '保持正确的坐姿和手势是提高打字效率的关键。',
      '知识就是力量，不断学习才能迎接未来的挑战。'
    ],
    quotes: [
      { text: '千里之行，始于足下。', author: '老子' }
    ]
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    script: 'Korean',
    words: [
      '타자', '키보드', '속도', '정확도', '연습', '성공', '시간', '세상', '삶', '일', '공부', '미래', '꿈', '기술', '언어', '생각', '지식', '마음'
    ],
    sentences: [
      '매일 조금씩 연습하면 타자 속도가 빠르게 향상됩니다.',
      '정확하고 올바른 손가락 위치가 타자 연습의 기본입니다.',
      '배움에는 끝이 없으며 연습만이 완벽을 만듭니다.'
    ],
    quotes: [
      { text: '시작이 반이다.', author: '한국 속담' }
    ]
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    dir: 'rtl',
    script: 'Hebrew',
    words: [
      'של', 'את', 'על', 'כי', 'עם', 'זה', 'גם', 'לא', 'מה', 'אל', 'אם', 'היה', 'כל', 'כמו', 'מקדלת', 'מהירות', 'דיוק', 'הקלדה', 'תרגול', 'הצלחה', 'זמן', 'חיים'
    ],
    sentences: [
      'תרגול יומי במקלדת משפר את מהירות ההקלדה והדיוק.',
      'ידע הוא כוח והלמידה אינה מסתיימת לעולם.'
    ],
    quotes: [
      { text: 'אם אין אני לי, מי לי?', author: 'הלל הזקן' }
    ]
  }
];

// Fallback generator for languages with generic word structures
export function getLanguageInfo(code: LanguageCode): LanguageInfo {
  const found = languagesList.find((l) => l.code === code);
  if (found) return found;

  // Generic fallback for other languages
  return {
    code,
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
    flag: '🌐',
    dir: ['ar', 'he', 'fa', 'ur'].includes(code) ? 'rtl' : 'ltr',
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
    `import time\n\nstart_time = time.time()\n# Perform computation\nelapsed = time.time() - start_time\nprint(f"Time taken: {elapsed:.2f}s")`
  ],
  html: [
    `<div class="typing-container" dir="auto">\n  <span class="correct">Hello</span>\n  <span class="current">World</span>\n</div>`,
    `<button id="restart" onclick="resetTest()">\n  Restart Test\n</button>`
  ]
};

// UI Localized Strings dictionary
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
  ar: {
    typingTest: 'اختبار السرعة',
    dashboard: 'لوحة التحكم',
    leaderboard: 'المتصدرون',
    statistics: 'الإحصائيات',
    history: 'السجل',
    achievements: 'الإنجازات',
    challenges: 'التحديات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    about: 'حول',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    time: 'الوقت',
    words: 'الكلمات',
    mode: 'الوضع',
    language: 'اللغة',
    difficulty: 'الصعوبة',
    restart: 'إعادة الاختبار',
    nextTest: 'الاختبار التالي',
    wpm: 'كلمة/دقيقة',
    cpm: 'حرف/دقيقة',
    accuracy: 'الدقة',
    raw: 'السرعة الكلية',
    errors: 'الأخطاء',
    personalBest: 'أفضل رقم',
    shareResult: 'مشاركة النتيجة',
    dailyStreak: 'السلسلة اليومية',
    totalTests: 'إجمالي الاختبارات',
    searchPlayers: 'البحث عن لاعبين...'
  }
};

export function t(key: string, lang: LanguageCode): string {
  const dict = uiTranslations[lang] || uiTranslations.en;
  return dict[key] || uiTranslations.en[key] || key;
}
