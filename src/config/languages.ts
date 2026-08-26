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
      "Odamiylikning bosh mezon bilimi va odabidir. Bilimsiz kishi mevasiz daraxtga o'xshaydi.",
      "Moziyga qaytib ish ko'rish xayrlikdir. O'tmishdan saboq olmagan xalqning kelajak yo'li ravshan bo'lmaydi.",
      "Kitob - insoniyat erishgan eng buyuk mo'jizalardan biridir, u qalbni nurga va zehnni bilimga to'ldiradi.",
      "Klaviaturada tez va xatosiz yozish zamonaviy texnologiyalar asrida har bir inson uchun zarur mahoratdir.",
      "Yolnoma Typing platformasida har kuni mashq qiling, yozish tezligingiz va aniqligingizni oshirib boring.",
      "Muvaffaqiyat tasodif emas, u tinimsiz mehnat, sabr-toqat va buyuk maqsadlar sari intilish natijasidir."
    ],
    quotes: [
      { text: "Kuch — adolatdadir.", author: "Amir Temur" },
      { text: "Odamiylikning bosh mezon bilimi va odabidir.", author: "Alisher Navoiy" },
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
      'ва', 'бир', 'бу', 'учун', 'ҳам', 'билан', 'ёки', 'бўлиб', 'шу', 'ўз', 'деб', 'келди', 'ҳамда', 'каби', 'ҳар', 'биз', 'сен', 'у', 'сиз', 'улар', 'мен', 'давлат', 'ёш', 'катта', 'янги', 'замон', 'иш', 'ильм', 'фан', 'техника', 'клавиатура', 'тезлик', 'мато', 'машқ', 'натижа', 'ютуқ', 'дунё', 'ҳаёт', 'вақт', 'кун', 'йил', 'шаҳар', 'инсон', 'дўст', 'оила', 'китоб', 'сўз', 'мактаб', 'тарих', 'келажак', 'орзу', 'мақсад', 'йўл', 'омад', 'бахт', 'билим', 'таълим', 'шеърият', 'адабиёт', 'самарқанд', 'бухоро', 'тошкент'
    ],
    sentences: [
      'Ўзбекистон - келажаги буюк давлат, ёшлар эса унинг мустаҳкам таянчидир.',
      'Билим олиш ҳар бир инсоннинг бурчи ва ҳаётий эҳтиёжидир.',
      'Клавиатурада тез ва хатосиз ёзишни ўрганиш вақтингизни тежайди.'
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
      'Каждый новый день дает нам отличную возможность научиться чему-то новому и важному.'
    ],
    quotes: [
      { text: 'Красота спасет мир.', author: 'Федор Достоевский' },
      { text: 'Век живи — век учись.', author: 'Пословица' }
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
      've', 'bir', 'bu', 'da', 'de', 'için', 'ile', 'o', 'daha', 'en', 'çok', 'gibi', 'kadar', 'sonra', 'yok', 'var', 'göre', 'oldu', 'zaman', 'her', 'kendi', 'olarak', 'ben', 'biz', 'siz', 'yeni', 'büyük', 'gün', 'iş', 'insan', 'klavye', 'hız', 'doğruluk', 'yazma', 'başarı', 'pratik', 'dünya', 'hayat', 'bilgi', 'eğitim', 'gelecek'
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
      'und', 'in', 'den', 'der', 'zu', 'das', 'die', 'von', 'ein', 'sie', 'mit', 'ist', 'im', 'dem', 'nicht', 'es', 'eine', 'auch', 'als', 'auf', 'für', 'an', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'sie', 'haben', 'aus', 'durch', 'nur', 'wenn', 'zeit', 'arbeit', 'leben', 'tastatur', 'schnell', 'genau'
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
      { text: 'Penser, c’est vivre.', author: 'Voltaire' }
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
      'التدريب المستمر على الطباعة السريعة يطور مهاراتك بشكل مذهل.'
    ],
    quotes: [
      { text: 'من طلب العلا سهر الليالي.', author: 'حكمة عربية' }
    ]
  },
  {
    code: 'kk',
    name: 'Kazakh',
    nativeName: 'Қазақша',
    flag: '🇰🇿',
    dir: 'ltr',
    script: 'Cyrillic',
    words: [
      'және', 'бір', 'бұл', 'үшін', 'де', 'мен', 'немесе', 'болып', 'сол', 'өзі', 'деп', 'келді', 'сияқты', 'әр', 'біз', 'сен', 'ол', 'сіз', 'олар', 'мен', 'мемлекет', 'жас', 'үлкен', 'жаңа', 'заман', 'жұмыс', 'ғылым', 'техника', 'пернетақта', 'жылдамдық', 'мәтін', 'жаттығу', 'нәтиже', 'жетістік', 'әлем', 'өмір', 'уақыт', 'күн', 'жыл', 'қала', 'адам', 'дос', 'отбасы', 'кітап', 'сөз', 'мектеп', 'тарих', 'болашақ', 'арман', 'мақсат', 'жол', 'бақыт', 'білім'
    ],
    sentences: [
      'Қазақстан — болашағы жарқын, білімді жастарға сенім артатын ұлы ел.',
      'Еңбек етсең ерінбей, тояды қарның тіленбей.'
    ],
    quotes: [
      { text: 'Ғылым таппай мақтанба.', author: 'Абай Құнанбаев' }
    ]
  },
  {
    code: 'ky',
    name: 'Kyrgyz',
    nativeName: 'Кыргызча',
    flag: '🇰🇬',
    dir: 'ltr',
    script: 'Cyrillic',
    words: [
      'жана', 'бир', 'бул', 'үчүн', 'дагы', 'менен', 'же', 'болуп', 'ошол', 'өз', 'деп', 'келди', 'сыяктуу', 'ар', 'биз', 'сен', 'ал', 'сиз', 'алар', 'мамлекет', 'жаш', 'чоң', 'жаңы', 'заман', 'иш', 'илим', 'техника', 'терүү', 'ылдамдык', 'текст', 'көнүгүү', 'жыйынтык', 'ийгилик', 'дүйнө', 'жашоо', 'убакыт', 'күн', 'жыл', 'шаар', 'адам', 'дос', 'үй-бүлө', 'китеп', 'сөз', 'мектеп', 'тарых', 'келечек', 'максат', 'жол', 'бакыт', 'билим'
    ],
    sentences: [
      'Билим — түгөнбөс кенч, өнөр — өлбөс мурас.',
      'Ылдам жана катасыз терүү — заманбап адамдын маанилүү сапаты.'
    ],
    quotes: [
      { text: 'Өнөр алды — кызыл тил.', author: 'Эл макалы' }
    ]
  },
  {
    code: 'tg',
    name: 'Tajik',
    nativeName: 'Тоҷикӣ',
    flag: '🇹🇯',
    dir: 'ltr',
    script: 'Cyrillic',
    words: [
      'ва', 'як', 'ин', 'барои', 'ҳам', 'бо', 'ё', 'буда', 'он', 'худ', 'гуфт', 'омад', 'мисли', 'ҳар', 'мо', 'ту', 'вай', 'шумо', 'онҳо', 'давлат', 'ҷавон', 'калон', 'нав', 'замон', 'кор', 'илм', 'техника', 'суръат', 'матн', 'машқ', 'натиҷа', 'муваффақият', 'ҷаҳон', 'ҳаёт', 'вақт', 'рӯз', 'сол', 'шаҳр', 'инсон', 'дӯст', 'оила', 'китоб', 'сухан', 'мактаб', 'таърих', 'оянда', 'мақсад', 'роҳ', 'бахт', 'дониш'
    ],
    sentences: [
      'Илм чароғи ақл аст ва роҳи ояндаро равшан месозад.',
      'Навиштани тез ва бехато дар компютер маҳорати басо зарурӣ мебошад.'
    ],
    quotes: [
      { text: 'Тавоно бувад ҳар кӣ доно бувад.', author: 'Абӯлқосим Фирдавсӣ' }
    ]
  },
  {
    code: 'az',
    name: 'Azerbaijani',
    nativeName: 'Azərbaycanca',
    flag: '🇦🇿',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'və', 'bir', 'bu', 'üçün', 'həm', 'ilə', 'və ya', 'olaraq', 'o', 'öz', 'deyə', 'gəldi', 'kimi', 'hər', 'biz', 'sən', 'o', 'siz', 'onlar', 'dövlət', 'gənc', 'böyük', 'yeni', 'zaman', 'iş', 'elm', 'texnika', 'klaviatura', 'sürət', 'mətn', 'məşq', 'nəticə', 'uğur', 'dünya', 'həyat', 'vaxt', 'gün', 'il', 'şəhər', 'insan', 'dost', 'ailə', 'kitab', 'söz', 'məktəb', 'tarix', 'gələcək', 'məqsəd', 'yol', 'xoşbəxtlik', 'bilik'
    ],
    sentences: [
      'Elm öyrənmək heç vaxt gec deyil, hər bir yeni gün bir fürsətdir.',
      'Klaviatura ilə sürətli və dəqiq yazmaq işinizi asanlaşdırır.'
    ],
    quotes: [
      { text: 'Ağıl yaşda deyil, başdadır.', author: 'Atalar sözü' }
    ]
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'o', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'nao', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'sua', 'seu', 'ou', 'quando', 'muito', 'nos', 'ja', 'eu', 'tambem', 'so', 'pelo', 'pela', 'ate', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos', 'seus', 'quem', 'tempo', 'vida', 'teclado', 'escrever', 'rapido', 'sucesso'
    ],
    sentences: [
      'A prática diária de digitação aumenta a velocidade e a agilidade mental.',
      'O conhecimento é a chave mestra para abrir as portas do futuro.'
    ],
    quotes: [
      { text: 'Tudo vale a pena quando a alma não é pequena.', author: 'Fernando Pessoa' }
    ]
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'il', 'di', 'e', 'che', 'la', 'un', 'in', 'a', 'per', 'una', 'sono', 'non', 'con', 'si', 'da', 'lo', 'ha', 'le', 'come', 'nel', 'io', 'della', 'ma', 'cosa', 'piu', 'al', 'questo', 'tutto', 'fare', 'del', 'ci', 'su', 'anche', 'lui', 'loro', 'mio', 'molto', 'tempo', 'vita', 'tastiera', 'scrivere', 'veloce', 'successo', 'mente'
    ],
    sentences: [
      'Digitare rapidamente sulla tastiera richiede concentrazione e ritmo costante.',
      'La conoscenza è l’unica ricchezza che cresce quando viene condivisa.'
    ],
    quotes: [
      { text: 'La semplicità è l’estrema perfezione.', author: 'Leonardo da Vinci' }
    ]
  },
  {
    code: 'zh-hans',
    name: 'Chinese (Pinyin)',
    nativeName: '中文 (Pinyin)',
    flag: '🇨🇳',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'wo', 'ni', 'ta', 'men', 'de', 'le', 'shi', 'zai', 'you', 'zhe', 'ge', 'he', 'shuo', 'qu', 'lai', 'kan', 'da', 'xiao', 'hao', 'duo', 'shao', 'ren', 'tian', 'nian', 'yue', 'ri', 'shi', 'jian', 'gong', 'zuo', 'xue', 'xi', 'jian', 'pan', 'da', 'zi', 'kuai', 'zhun', 'xin', 'xiang', 'zhi', 'dao', 'ke', 'yi', 'mei', 'you', 'shen', 'me', 'wei', 'shen', 'me'
    ],
    sentences: [
      'Qian li zhi xing, shi yu zu xia.',
      'Shu shan you lu qin wei jing, xue hai wu ya ku zuo zhou.'
    ],
    quotes: [
      { text: 'Xue er bu si ze wang, si er bu xue ze dai.', author: 'Kong Zi (Confucius)' }
    ]
  },
  {
    code: 'ja',
    name: 'Japanese (Romaji)',
    nativeName: '日本語 (Romaji)',
    flag: '🇯🇵',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'watashi', 'anata', 'kore', 'sore', 'are', 'doko', 'dare', 'nani', 'itsu', 'dou', 'suru', 'kuru', 'iku', 'miru', 'kiku', 'hanasu', 'taberu', 'nomu', 'yomu', 'kaku', 'kyou', 'ashita', 'kinou', 'ima', 'jikan', 'hito', 'tomodachi', 'kazoku', 'hon', 'kotoba', 'nihon', 'sekai', 'taipingu', 'hayai', 'seikaku', 'keizoku', 'chikara'
    ],
    sentences: [
      'Keizoku wa chikara nari. Mainichi no renshuu ga seikou e no kagi desu.',
      'Chiri mo tsumoreba yama to naru.'
    ],
    quotes: [
      { text: 'Nana korobi ya oki.', author: 'Kotowaza' }
    ]
  },
  {
    code: 'ko',
    name: 'Korean (Hangul)',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    script: 'Hangul',
    words: [
      '나', '너', '우리', '그', '그녀', '사람', '시간', '일', '날', '년', '말', '글', '책', '집', '학교', '친구', '사랑', '마음', '생각', '세상', '키보드', '타자', '연습', '속도', '정확도', '성공', '노력', '희망', '미래', '배움', '열정', '시작'
    ],
    sentences: [
      '매일 꾸준한 타자 연습은 놀라운 속도와 집중력을 가져다줍니다.',
      '시작이 반이다. 작은 첫 걸음이 위대한 결과를 만듭니다.'
    ],
    quotes: [
      { text: '아는 것이 힘이다.', author: '속담' }
    ]
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Devanagari',
    words: [
      'और', 'है', 'के', 'में', 'की', 'एक', 'से', 'को', 'का', 'हैं', 'पर', 'भी', 'यह', 'ने', 'हो', 'कर', 'तो', 'ही', 'या', 'था', 'कि', 'लिए', 'रहा', 'गया', 'समय', 'काम', 'जीवन', 'ज्ञान', 'सफलता', 'अभ्यास', 'टाइपिंग', 'गति', 'शुद्धता'
    ],
    sentences: [
      'नियमित अभ्यास से टाइपिंग की गति और सटीकता में निरंतर सुधार होता है।',
      'ज्ञान ही मनुष्य की सबसे बड़ी शक्ति और संपत्ति है।'
    ],
    quotes: [
      { text: 'कर्म ही पूजा है।', author: 'भारतीय सुविचार' }
    ]
  },
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    dir: 'rtl',
    script: 'Arabic',
    words: [
      'و', 'در', 'به', 'از', 'که', 'این', 'را', 'با', 'است', 'برای', 'آن', 'یک', 'خود', 'تا', 'کرد', 'بر', 'هم', 'نیز', 'گفت', 'می', 'شد', 'وی', 'او', 'ما', 'زمان', 'زندگی', 'کار', 'کتاب', 'دانش', 'کیبورد', 'تایپ', 'سرعت', 'دقت', 'موفقیت'
    ],
    sentences: [
      'تمرین روزانه تایپ مهارت و سرعت شما را به طرز شگفت‌انگیزی افزایش می‌دهد.',
      'توانا بود هر که دانا بود، ز دانش دل پیر برنا بود.'
    ],
    quotes: [
      { text: 'دانش بالاترین ثروت انسان است.', author: 'فردوسی' }
    ]
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    dir: 'ltr',
    script: 'Cyrillic',
    words: [
      'і', 'в', 'не', 'на', 'що', 'до', 'він', 'з', 'та', 'як', 'я', 'а', 'й', 'про', 'ми', 'вони', 'це', 'ти', 'ви', 'за', 'по', 'але', 'час', 'життя', 'день', 'людина', 'робота', 'слово', 'клавіатура', 'швидкість', 'точність', 'успіх', 'знання'
    ],
    sentences: [
      'Швидкий та точний набір тексту значно полегшує щоденну роботу за комп’ютером.',
      'Знання — це сила, яка відкриває двері у щасливе майбутнє.'
    ],
    quotes: [
      { text: 'Борітеся — поборете!', author: 'Тарас Шевченко' }
    ]
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'i', 'w', 'na', 'z', 'do', 'to', 'sie', 'nie', 'ze', 'o', 'od', 'po', 'jak', 'a', 'ale', 'tak', 'dla', 'za', 'co', 'jest', 'jego', 'ja', 'on', 'my', 'wy', 'czas', 'zycie', 'dzien', 'czlowiek', 'praca', 'slowo', 'klawiatura', 'predkosc', 'dokladnosc', 'sukces'
    ],
    sentences: [
      'Regularne ćwiczenie szybkiego pisania na klawiaturze przynosi znakomite rezultaty.',
      'Trening czyni mistrza w każdej dziedzinie życia.'
    ],
    quotes: [
      { text: 'Dla chcącego nic trudnego.', author: 'Przysłowie' }
    ]
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'dan', 'di', 'yang', 'ke', 'dari', 'ini', 'dalam', 'untuk', 'tidak', 'dengan', 'ada', 'pada', 'itu', 'adalah', 'akan', 'bisa', 'saya', 'kami', 'kamu', 'mereka', 'waktu', 'hidup', 'hari', 'orang', 'kerja', 'kata', 'keyboard', 'kecepatan', 'akurasi', 'sukses', 'belajar'
    ],
    sentences: [
      'Latihan mengetik secara konsisten meningkatkan kecepatan dan ketepatan jari Anda.',
      'Ilmu pengetahuan adalah pelita kehidupan yang menerangi masa depan.'
    ],
    quotes: [
      { text: 'Rajin pangkal pandai.', author: 'Peribahasa' }
    ]
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'va', 'cua', 'la', 'co', 'trong', 'de', 'khong', 'nguoi', 'mot', 'cac', 'duoc', 'voi', 'cho', 'nay', 'nhung', 'den', 'khi', 'ra', 'toi', 'chung', 'ban', 'thoi gian', 'cuoc song', 'ngay', 'cong viec', 'ban phim', 'toc do', 'chinh xac', 'thanh cong', 'hoc tap'
    ],
    sentences: [
      'Luyện gõ bàn phím hàng ngày giúp bạn làm việc nhanh hơn và hiệu quả hơn.',
      'Học tập là hạt giống của kiến thức và tương lai.'
    ],
    quotes: [
      { text: 'Có công mài sắt, có ngày nên kim.', author: 'Tục ngữ' }
    ]
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'de', 'van', 'en', 'het', 'een', 'in', 'is', 'dat', 'op', 'te', 'voor', 'met', 'als', 'zijn', 'er', 'maar', 'om', 'ook', 'door', 'over', 'ze', 'bij', 'tijd', 'leven', 'dag', 'mens', 'werk', 'toetsenbord', 'snelheid', 'precisie', 'succes'
    ],
    sentences: [
      'Regelmatig oefenen met typen verhoogt uw snelheid en focus op het toetsenbord.',
      'Kennis is een schat die overal met zijn eigenaar meegaat.'
    ],
    quotes: [
      { text: 'Oefening baart kunst.', author: 'Spreekwoord' }
    ]
  },
  {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    dir: 'ltr',
    script: 'Latin',
    words: [
      'och', 'i', 'att', 'det', 'som', 'en', 'pa', 'ar', 'av', 'for', 'med', 'till', 'den', 'har', 'de', 'inte', 'om', 'ett', 'men', 'var', 'tid', 'liv', 'dag', 'manniska', 'arbete', 'tangentbord', 'snabbhet', 'precision', 'framgang'
    ],
    sentences: [
      'Snabb och felfri maskinskrivning sparar tid och ökar din produktivitet.',
      'Kunskap är lätt att bära men tung att mista.'
    ],
    quotes: [
      { text: 'Övning ger färdighet.', author: 'Ordspråk' }
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
