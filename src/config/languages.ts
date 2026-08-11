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
      'va', 'bir', 'bu', 'uchun', 'ham', 'bilan', 'yoki', 'bolib', 'shu', 'oz', 'deb', 'xazina', 'keldi', 'hamda', 'kabi', 'har', 'biz', 'sen', 'u', 'siz', 'ular', 'men', 'davlat', 'yosh', 'katta', 'yangi', 'zamon', 'ish', 'ilm', 'fan', 'texnika', 'klaviatura', 'tezlik', 'xatosiz', 'matn', 'mashq', 'natija', 'yutuq', 'dunyo', 'hayot', 'vaqt', 'kun', 'yil', 'shahar', 'inson', 'dost', 'oila', 'kitob', 'soz', 'maktab', 'tarix', 'kelajak', 'orzu', 'maqsad', 'yol', 'omad', 'baxt', 'bilim', 'talim', 'tarbiya', 'madaniyat', 'tizim', 'dastur', 'sahifa', 'til', 'yozuv', 'tugma', 'sheriyat', 'adabiyot', 'mahorat', 'chiroyli', 'yozish', 'fikr', 'aqsh', 'vatandosh', 'yulduz', 'quyosh', 'osmon', 'samari', 'zarafshon', 'toshkent', 'samarqand', 'buxoro', 'xiva', 'fargona', 'andijon', 'namangan', 'termiz', 'qarshi', 'guliston', 'jizzax', 'navoiy', 'falsafa', 'hikmat', 'aql', 'zakovat', 'ijod', 'muvaffaqiyat', 'Ghoza', 'Ghalaba', 'Qalbi', 'Niyat'
    ],
    sentences: [
      "O'zbekiston - kelajagi buyuk devlet, yoshlar esa uning mustahkam tayanchi va kelajak bunyodkoridir.",
      "Ilm olish igna bilan quduq qazish kabidir, lekin uning mevasi har qanday xazinadan ko'ra shirinroqdir.",
      "Odamiylikning bosh mezon bilimi va odabidir. Bilimsiz kishi mevasiz daraxtga o'xshaydi.",
      "Moziyga qaytib ish ko'rish xayrlikdir. O'tmishdan saboq olmagan xalqning kelajak yo'li ravshan bo'lmaydi.",
      "Kitob - insoniyat erishgan eng buyuk mo'jizalardan biridir, u qalbni nurga va zehnni bilimga to'ldiradi.",
      "Klaviaturada tez va xatosiz yozish zamonaviy texnologiyalar asrida har bir inson uchun zarur mahoratdir.",
      "Yolnoma Typing platformasida har kuni mashq qiling, yozish tezligingiz va aniqligingizni oshirib boring.",
      "Muvaffaqiyat tasodif emas, u tinimsiz mehnat, sabr-toqat va buyuk maqsadlar sari intilish natijasidir.",
      "Yurtim, seni quchmoq uchun qo'llarim kamlik qiladi, bag'ringda yotib nafas olsam jonimga jon kiradi.",
      "Sehrli qalam va tezkor barmoqlar har qanday g'oyani lahzalar ichida haqiqatga aylantirish imkonini beradi.",
      "Inson o'z taqdirining bunyodkoridir. Har bir bosilgan qadam va aytilgan so'z kelajak poydevorini tiklaydi.",
      "Tariximiz sahifalarida Amir Temur, Alisher Navoiy va Ulug'bek kabi buyuk daho siymolarimiz nomi mangu yashaydi.",
      "Vaqt - inson hayotidagi eng qimmatbaho manbadir, uni bilim olish va xayrli ishlarga sarflash darkor.",
      "Dasturlash va axborot texnologiyalari inson mantiqiy fikrlash doirasini kengaytiradi va yangi ufqlarni ochadi."
    ],
    quotes: [
      { text: "Kuch — adolatdadir.", author: "Amir Temur" },
      { text: "Odamiylikning bosh mezon bilimi va odabidir.", author: "Alisher Navoiy" },
      { text: "Hunarni asrabon netgumdir oxir, O'zib olamg'a yoygumdir oxir.", author: "Alisher Navoiy" },
      { text: "Moziyga qaytib ish ko'rish xayrlikdir.", author: "Abdulla Qodiriy" },
      { text: "Tilin boyotgan xalq kelajagini ham boyitadi.", author: "Erkin Vohidov" },
      { text: "O'zligini anglagan inson hech qachon yo'lidan adashmaydi.", author: "Abdulla Oripov" },
      { text: "Bilim va aql insonning eng mustahkam qal'asidir.", author: "Abu Rayhon Beruniy" },
      { text: "Dunyoning go'zalligi va komilligi fanda va ma'rifatdadir.", author: "Abu Ali ibn Sino" }
    ],
    stories: [
      "Alisher Navoiy bolaligidanoq she'riyatga va ilmg'a cheksiz mehr qo'ygan edi. U oz vaqt ichida minglab g'azal va dostonlarni yod oldi, ulug' ustozlardan saboq oldi. Keyinchalik o'zining mashhur Xamsa asarini yaratib, turkiy tilning naqadar boy va jozibador ekanligini butun dunyoga isbotlab berdi.",
      "Amir Temur davlatni idora etishda doimo odillik va ilmu ma'rifatga tayanar edi. U o'zining Tuzuklar asarida shunday yozadi: Qay yerda adolat hukm sursa, o'sha yerda obodonchilik, baraka va el-yurt osoyishtaligi barqaror bo'lg'usidir.",
      "Klaviaturada so'zlarni xuddi musiqaday ravon va tez yozish - bu uzoq davom etgan mashqlar va e'tibor mahsulidir. Har bir bosilgan tugma xuddi fortepiano torlaridagi kuy kabi ravon eshitiladi. Tajribali typist harf qidirib o'tirmaydi, balki fikri to'g'ridan-to'g'ri ekranga tushadi."
    ]
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
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
      'Great minds discuss ideas; average minds discuss events; small minds discuss people.',
      'Touch typing allows your thoughts to flow straight onto the digital canvas without friction.',
      'Mastery is not a destination, it is a continuous daily journey of learning and refinement.',
      'In the quiet moments of deep focus, speed and accuracy merge into effortless creative rhythm.'
    ],
    quotes: [
      { text: 'Knowledge is power.', author: 'Francis Bacon' },
      { text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
      { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
      { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
      { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' }
    ],
    stories: [
      'In the early days of personal computing, keyboards were loud mechanical devices that echoed across office halls. Today, modern touch typists flow effortlessly across sleek keys, transmitting thoughts into code and literature at lightning speed.',
      'Dedication is the quiet bridge between ambition and achievement. Every expert typist started with hesitations and misplaced fingers, but through steady daily practice, achieved poetic typing elegance.'
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
      'ва', 'бир', 'бу', 'учун', 'ҳам', 'билан', 'ёки', 'бўлиб', 'шу', 'ўз', 'деб', 'келди', 'ҳамда', 'каби', 'ҳар', 'биз', 'сен', 'у', 'сиз', 'улар', 'мен', 'давлат', 'ёш', 'катта', 'янги', 'замон', 'иш', 'ильм', 'фан', 'техника', 'клавиатура', 'тезлик', 'мато', 'машқ', 'натижа', 'ютуқ', 'дунё', 'ҳаёт', 'вақт', 'кун', 'йил', 'шаҳар', 'инсон', 'дўст', 'оила', 'китоб', 'сўз', 'мактаб', 'тарих', 'келажак', 'орзу', 'мақсад', 'йўл', 'омад', 'бахт', 'билим', 'таълим', 'шеърият', 'адабиёт', 'самарқанд', 'бухоро', 'тошкент'
    ],
    sentences: [
      'Ўзбекистон - келажаги буюк давлат, ёшлар эса унинг мустаҳкам таянчидир.',
      'Билим олиш ҳар бир инсоннинг бурчи ва ҳаётий эҳтиёжидир.',
      'Клавиатурада тез ва хатосиз ёзишни ўрганиш вақтингизни тежайди.',
      'Вақт — инсон ҳаётидаги энг қимматбаҳо ва қайтариб бўлмас бойликдир.',
      'Одамийликнинг бош мезони билими ва одобидир.'
    ],
    quotes: [
      { text: 'Куч — адолатдадир.', author: 'Амир Темур' },
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
      'и', 'в', 'не', 'на', 'я', 'что', 'тот', 'быть', 'с', 'он', 'а', 'как', 'по', 'но', 'они', 'к', 'у', 'ты', 'из', 'мы', 'за', 'вы', 'все', 'так', 'его', 'от', 'сказать', 'этот', 'который', 'знать', 'пойти', 'свои', 'про', 'бы', 'год', 'время', 'дело', 'жизнь', 'день', 'рука', 'человек', 'работа', 'слово', 'глаз', 'место', 'город', 'дом', 'клавиатура', 'скорость', 'текст', 'точность', 'печать', 'пальцы', 'мышление', 'успех', 'знание', 'мастерство'
    ],
    sentences: [
      'Быстрая и точная печать — это навык, который значительно повышает вашу продуктивность.',
      'Практика и регулярные упражнения развивают мышечную память пальцев.',
      'Каждый новый день дает нам отличную возможность научиться чему-то новому и важному.',
      'Красота мысли проявляется в гармонии и точности каждого произнесенного слова.'
    ],
    quotes: [
      { text: 'Красота спасет мир.', author: 'Федор Достоевский' },
      { text: 'Учиться, учиться и еще раз учиться.', author: 'Народная мудрость' },
      { text: 'Век живи — век учись.', author: 'Пословица' }
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
      'العلم نور والجهل ظلام في جميع الأوقات والمجالات.',
      'التدريب المستمر على الطباعة السريعة يطور مهاراتك بشكل مذهل.',
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
      'Hızlı ve doğru klavye kullanımı zaman kazandırır ve verimliliği artırır.',
      'Bilgi güçtür ve öğrenmenin sonu olmayan harika bir yolculuktur.',
      'Her gün düzenli pratik yaparak gelişiminizin farkına varın.'
    ],
    quotes: [
      { text: 'Hayatta en hakiki mürşit ilimdir.', author: 'Mustafa Kemal Atatürk' }
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
  }
};

export function t(key: string, lang: LanguageCode): string {
  const dict = uiTranslations[lang] || uiTranslations.en;
  return dict[key] || uiTranslations.en[key] || key;
}
