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
  stories?: string[];
}

export const languagesList: LanguageInfo[] = [
  {
    code: 'uz-latn',
    name: 'Uzbek (Latin)',
    nativeName: "O'zbekcha",
    flag: '🇺🇿',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'va', 'bir', 'bu', 'uchun', 'ham', 'bilan', 'yoki', 'bolib', 'shu', 'oz', 'deb', 'xazina', 'keldi', 'hamda', 'kabi', 'har', 'biz', 'sen', 'u', 'siz', 'ular', 'men', 'davlat', 'yosh', 'katta', 'yangi', 'zamon', 'ish', 'ilm', 'fan', 'texnika', 'tezlik', 'xatosiz', 'matn', 'mashq', 'natija', 'yutuq', 'dunyo', 'hayot', 'vaqt', 'kun', 'yil', 'shahar', 'inson', 'dost', 'oila', 'kitob', 'soz', 'maktab', 'tarix', 'kelajak', 'orzu', 'maqsad', 'yol', 'omad', 'baxt', 'bilim', 'talim', 'tarbiya', 'madaniyat', 'tizim', 'dastur', 'sahifa', 'til', 'yozuv', 'tugma', 'sheriyat', 'adabiyot', 'mahorat', 'chiroyli', 'yozish', 'fikr', 'yulduz', 'quyosh', 'osmon', 'zarafshon', 'toshkent', 'samarqand', 'buxoro', 'xiva', 'fargona', 'andijon', 'namangan', 'termiz', 'qarshi', 'guliston', 'jizzax', 'navoiy', 'falsafa', 'hikmat', 'aql', 'zakovat', 'ijod', 'muvaffaqiyat', 'nur', 'kuch', 'bosh', 'yaxshi', 'yomon', 'uzoq', 'yaqin', 'tez', 'sekin', 'aniq', 'ravshan', 'tinch', 'ozod', 'obod', 'ziyo', 'orasta', 'shirin', 'dono', 'kamol', 'baho', 'qadam', 'chora', 'qalb', 'mehr', 'zar', 'sim', 'gavhar', 'dur', 'surat', 'siyrat', 'sado', 'navo', 'ohang', 'zarba', 'davo', 'suhbat', 'majlis', 'xush', 'porloq', 'yorug', 'ochiq', 'erkin', 'teran', 'chuqur', 'keng', 'baland', 'yuksak', 'ulug', 'shon', 'shuhrat', 'amaliy', 'sinov', 'harakat', 'shiddat', 'chaqqon', 'ildam', 'ilgari', 'oldinga', 'marra', 'vatan', 'el', 'yurt', 'diyor', 'quvvat', 'joy', 'korik', 'sezgi', 'musiqa', 'tovush', 'qalam', 'qogoz', 'chiziq', 'harf', 'soat', 'daqiqa', 'soniya', 'fasl', 'bahor', 'yoz', 'kuz', 'qish', 'daryo', 'tog', 'dala', 'bog', 'chaman', 'gul', 'lola', 'daraxt', 'barg', 'shox', 'meva', 'hosil', 'dehqon', 'ishchi', 'ustoz', 'shogird', 'olim', 'fozil', 'shoir', 'yozuvchi', 'qahramon', 'jasur', 'botir', 'mard', 'halol', 'pok', 'sodiq', 'vafodor', 'mehribon', 'saxiy', 'saxovat', 'himmat', 'odob', 'axloq', 'talab', 'javob', 'savol', 'yechim', 'usul', 'uslub', 'qoida', 'qonun', 'adolat', 'haqiqat', 'ishonch', 'umid', 'sabot', 'matonat', 'jasorat', 'himoya', 'xavfsiz', 'barqaror', 'mustahkam', 'mustaqil', 'saodat', 'shodlik', 'quvonch', 'kulgu', 'tabassum', 'orom', 'huzur', 'halovat', 'xotira', 'meros', 'anana', 'qadriyat', 'hurmat', 'izzat', 'iltifot', 'marhamat', 'yordam', 'hamkorlik', 'ittifoq', 'birlik', 'hamjihat', 'totuv', 'inoq', 'ahil', 'tadbirkor', 'tashabbus', 'izlanish', 'kashfiyot', 'intilish', 'parvoz', 'qanot', 'cheksiz', 'koinot', 'falak', 'munavvar', 'ravnaq', 'taraqqiyot', 'kamolot', 'istiqbol'
    ],
    sentences: [
      "O'zbekiston - kelajagi buyuk davlat, yoshlar esa uning mustahkam tayanchi va kelajak bunyodkoridir.",
      "Ilm olish igna bilan quduq qazish kabidir, lekin uning mevasi har qanday xazinadan ko'ra shirinroqdir.",
      "Odamiylikning bosh mezoni bilimi va odabidir. Bilimsiz kishi mevasiz daraxtga o'xshaydi.",
      "Moziyga qaytib ish ko'rish xayrlikdir. O'tmishdan saboq olmagan xalqning kelajak yo'li ravshan bo'lmaydi.",
      "Kitob - insoniyat erishgan eng buyuk mo'jizalardan biridir, u qalbni nurga va zehnni bilimga to'ldiradi.",
      "Klaviaturada tez va xatosiz yozish zamonaviy texnologiyalar asrida har bir inson uchun zarur mahoratdir.",
      "Yolnoma Typing platformasida har kuni mashq qiling, yozish tezligingiz va aniqligingizni oshirib boring.",
      "Muvaffaqiyat tasodif emas, u tinimsiz mehnat, sabr-toqat va buyuk maqsadlar sari intilish natijasidir."
    ],
    quotes: [
      { text: "Kuch - adolatdadir.", author: "Amir Temur" },
      { text: "Odamiylikning bosh mezoni bilimi va odabidir.", author: "Alisher Navoiy" },
      { text: "Hunarni asrabon netgumdir oxir, O'zib olamg'a yoygumdir oxir.", author: "Alisher Navoiy" },
      { text: "Moziyga qaytib ish ko'rish xayrlikdir.", author: "Abdulla Qodiriy" }
    ],
    stories: [
      "Alisher Navoiy bolaligidanoq she'riyatga va ilmg'a cheksiz mehr qo'ygan edi. U oz vaqt ichida minglab g'azal va dostonlarni yod oldi, ulug' ustozlardan saboq oldi. Keyinchalik o'zining mashhur Xamsa asarini yaratib, turkiy tilning naqadar boy va jozibador ekanligini butun dunyoga isbotlab berdi.",
      "Amir Temur davlatni idora etishda doimo odillik va ilmu ma'rifatga tayanar edi. U o'zining Tuzuklar asarida shunday yozadi: Qay yerda adolat hukm sursa, o'sha yerda obodonchilik, baraka va el-yurt osoyishtaligi barqaror bo'lg'usidir."
    ]
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'i', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand', 'old', 'life', 'tell', 'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off', 'child', 'few', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow', 'during', 'present', 'without', 'again', 'hold', 'code', 'keyboard', 'speed', 'screen', 'typing', 'accuracy', 'focus', 'flow', 'mind', 'practice', 'mastery', 'rhythm', 'precision', 'elegance', 'creativity', 'future'
    ],
    sentences: [
      'The quick brown fox jumps over the lazy dog in a display of seamless typing mechanics.',
      'Practice and repetition unlock the true potential of subconscious muscle memory.',
      'A journey of a thousand miles begins with a single deliberate keystroke on the keyboard.',
      'Simplicity is the ultimate sophistication in software design and human interaction.',
      'Touch typing allows your thoughts to flow straight onto the digital canvas without friction.',
      'Mastery is not a destination, it is a continuous daily journey of learning and refinement.'
    ],
    quotes: [
      { text: 'Knowledge is power.', author: 'Francis Bacon' },
      { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
      { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' }
    ],
    stories: [
      'In the early days of personal computing, keyboards were loud mechanical devices that echoed across office halls. Today, modern touch typists flow effortlessly across sleek keys, transmitting thoughts into code and literature at lightning speed.'
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
      'ва', 'бир', 'бу', 'учун', 'ҳам', 'билан', 'ёки', 'бўлиб', 'шу', 'ўз', 'деб', 'хазина', 'келди', 'ҳамда', 'каби', 'ҳар', 'биз', 'сен', 'у', 'сиз', 'улар', 'мен', 'давлат', 'ёш', 'катта', 'янги', 'замон', 'иш', 'илм', 'фан', 'техника', 'тезлик', 'хатосиз', 'матн', 'машқ', 'натижа', 'ютуқ', 'дунё', 'ҳаёт', 'вақт', 'кун', 'йил', 'шаҳар', 'инсон', 'дўст', 'оила', 'китоб', 'сўз', 'мактаб', 'тарих', 'келажак', 'орзу', 'мақсад', 'йўл', 'омад', 'бахт', 'билим', 'таълим', 'тарбия', 'маданият', 'тизим', 'дастур'
    ],
    sentences: [
      'Ўзбекистон - келажаги буюк давлат, ёшлар эса унинг мустаҳкам таянчидир.',
      'Илм олиш игна билан қудуқ қазиш кабидир, лекин унинг меваси шириндир.',
      'Китоб - инсоният эришган энг буюк мўъжизалардан биридир.'
    ],
    quotes: [
      { text: 'Куч - адолатдадир.', author: 'Амир Темур' },
      { text: 'Одамийликнинг бош мезони билими ва одобидир.', author: 'Алишер Навоий' }
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
      'и', 'в', 'не', 'на', 'я', 'что', 'тот', 'быть', 'с', 'он', 'а', 'весь', 'это', 'как', 'она', 'по', 'но', 'они', 'к', 'у', 'ты', 'из', 'мы', 'за', 'вы', 'же', 'от', 'сказать', 'этот', 'который', 'человек', 'один', 'еще', 'бы', 'такой', 'только', 'себя', 'свое', 'какой', 'когда', 'уже', 'для', 'вот', 'кто', 'да', 'говорить', 'год', 'знать', 'мой', 'до', 'время', 'если', 'сам', 'жизнь', 'клавиатура', 'скорость', 'точность', 'успех'
    ],
    sentences: [
      'Слепая печать десятью пальцами значительно ускоряет работу и развивает концентрацию.',
      'Учиться никогда не поздно, каждый новый день открывает перед нами новые горизонты.',
      'Красота и гармония в деталях создают настоящее ощущение профессионализма.'
    ],
    quotes: [
      { text: 'Век живи — век учись.', author: 'Пословица' },
      { text: 'Красота спасет мир.', author: 'Федор Достоевский' }
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
      'el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'mas', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'muy', 'sin', 'vez', 'mucho', 'saber', 'que', 'sobre', 'mi', 'alguno', 'mismo', 'yo', 'tambien', 'hasta', 'ano', 'dos', 'querer', 'entre', 'asi', 'primero', 'desde', 'grande', 'tiempo', 'pasar', 'vida', 'mundo', 'teclado', 'escribir', 'rapido', 'exito'
    ],
    sentences: [
      'La práctica constante de mecanografía mejora la velocidad y la concentración mental.',
      'El conocimiento es el tesoro más valioso que un ser humano puede adquirir en la vida.'
    ],
    quotes: [
      { text: 'El que lee mucho y anda mucho, ve mucho y sabe mucho.', author: 'Miguel de Cervantes' },
      { text: 'Caminante, no hay camino, se hace camino al andar.', author: 'Antonio Machado' }
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
      've', 'bir', 'bu', 'da', 'de', 'icin', 'ile', 'o', 'daha', 'en', 'cok', 'gibi', 'kadar', 'sonra', 'yok', 'var', 'gore', 'oldu', 'zaman', 'her', 'kendi', 'olarak', 'ben', 'biz', 'siz', 'yeni', 'buyuk', 'gun', 'is', 'insan', 'klavye', 'hiz', 'dogruluk', 'yazma', 'basari', 'pratik', 'dunya', 'hayat', 'bilgi', 'egitim', 'gelecek'
    ],
    sentences: [
      'Hızlı ve doğru klavye kullanımı zaman kazandırır ve verimliliği artırır.',
      'Bilgi güçtür ve öğrenmenin sonu olmayan harika bir yolculuktur.'
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
      'und', 'in', 'den', 'der', 'zu', 'das', 'die', 'von', 'ein', 'sie', 'mit', 'ist', 'im', 'dem', 'nicht', 'es', 'eine', 'auch', 'als', 'auf', 'fur', 'an', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'uber', 'einen', 'so', 'sie', 'haben', 'aus', 'durch', 'nur', 'wenn', 'zeit', 'arbeit', 'leben', 'tastatur', 'schnell', 'genau'
    ],
    sentences: [
      'Übung macht den Meister, besonders beim schnellen und fehlerfreien Tippen auf der Tastatur.',
      'Wissen ist Macht und Bildung öffnet die Türen zu einer erfolgreichen Zukunft.'
    ],
    quotes: [
      { text: 'Es ist nicht genug zu wissen, man muss auch anwenden.', author: 'Johann Wolfgang von Goethe' }
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
      'le', 'de', 'un', 'a', 'etre', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'il', 'qui', 'ne', 'sur', 'se', 'pas', 'plus', 'pouvoir', 'par', 'je', 'avec', 'tout', 'faire', 'son', 'mettre', 'autre', 'on', 'mais', 'nous', 'comme', 'ou', 'si', 'leur', 'y', 'dire', 'elle', 'devoir', 'avant', 'deux', 'temps', 'vie', 'clavier', 'vitesse', 'precision', 'succes'
    ],
    sentences: [
      'La pratique régulière de la dactylographie transforme votre façon de travailler sur ordinateur.',
      'Le savoir est une richesse que nul ne peut vous enlever.'
    ],
    quotes: [
      { text: 'Penser, c est vivre.', author: 'Voltaire' }
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
      'في', 'من', 'على', 'أن', 'إلى', 'هذا', 'كان', 'ما', 'هو', 'عن', 'مع', 'أو', 'لا', 'التي', 'كل', 'ذلك', 'بعد', 'لوحة', 'سرعة', 'دقة', 'نجاح', 'معرفة', 'حياة', 'عالم', 'وقت', 'يوم', 'سنة', 'إنسان', 'عمل'
    ],
    sentences: [
      'العلم نور والجهل ظلام، والممارسة المستمرة تحقق أعلى درجات الإتقان.',
      'الكتابة السريعة على لوحة المفاتيح مهارة حديثة توفر الوقت والجهد.'
    ],
    quotes: [
      { text: 'اطلبوا العلم من المهد إلى اللحد.', author: 'حكمة عربية' }
    ]
  }
];

export function getLanguageInfo(code: LanguageCode): LanguageInfo {
  let customLangs: LanguageInfo[] = [];
  try {
    const raw = localStorage.getItem('yolnoma_owner_custom_languages');
    if (raw) {
      customLangs = JSON.parse(raw);
    }
  } catch (e) {}

  const allLangs = [...languagesList, ...customLangs];
  const found = allLangs.find((l) => l.code.toLowerCase() === code.toLowerCase());
  if (found) return found;

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
    words: "So'zlar",
    mode: 'Rejim',
    language: 'Til',
    selectLanguage: 'Tilni Tanlang',
    difficulty: 'Qiyinchilik',
    restart: 'Qayta Boshlash',
    nextTest: 'Keyingi Test',
    wpm: "So'z/daq",
    cpm: 'Belgi/daq',
    accuracy: 'Aniqlik',
    raw: 'Xom WPM',
    errors: 'Xatolar',
    personalBest: 'Shaxsiy Rekord',
    shareResult: 'Natijani Ulashish',
    dailyStreak: 'Kunlik Seriya',
    totalTests: 'Jami Testlar',
    searchPlayers: "O'yinchilarni qidirish..."
  }
};

export function t(key: string, lang: LanguageCode): string {
  const dict = uiTranslations[lang] || uiTranslations.en;
  return dict[key] || uiTranslations.en[key] || key;
}

export const supportedLanguages = languagesList;

