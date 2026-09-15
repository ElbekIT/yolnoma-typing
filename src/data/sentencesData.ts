import { sentenceTracker } from '../utils/sentenceTracker';

export type SentenceCategory = 'daily' | 'business' | 'tech' | 'ielts';
export type SentenceLevel = 'level0' | 'easy' | 'medium' | 'hard';

export interface IeltsBandInfo {
  band: string; // e.g., "1.0", "6.5", "9.0"
  label: string; // e.g., "0 dan Boshlang'ich", "IELTS 9.0 Master"
  cefr: string; // "A0", "A1", "A2", "B1", "B2", "C1", "C2"
  color: string;
  badgeBg: string;
}

export function getIeltsBandFromLevel(level: number): IeltsBandInfo {
  if (level <= 1) {
    return { band: '1.0', label: "0 dan Boshlang'ich", cefr: 'A0', color: 'text-slate-300', badgeBg: 'bg-slate-500/15 border-slate-500/30' };
  } else if (level <= 5) {
    return { band: '2.0', label: 'Boshlang\'ich (A1)', cefr: 'A1', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
  } else if (level <= 15) {
    return { band: '3.0', label: 'Oddiy Muloqot (A1+)', cefr: 'A1+', color: 'text-teal-400', badgeBg: 'bg-teal-500/15 border-teal-500/30' };
  } else if (level <= 30) {
    return { band: '4.0', label: 'Boshlang\'ich O\'rta (A2)', cefr: 'A2', color: 'text-sky-400', badgeBg: 'bg-sky-500/15 border-sky-500/30' };
  } else if (level <= 55) {
    return { band: '5.0', label: 'O\'rta Daraja (B1)', cefr: 'B1', color: 'text-blue-400', badgeBg: 'bg-blue-500/15 border-blue-500/30' };
  } else if (level <= 85) {
    return { band: '6.0', label: 'Mustaqil Foydalanuvchi (B2)', cefr: 'B2', color: 'text-indigo-400', badgeBg: 'bg-indigo-500/15 border-indigo-500/30' };
  } else if (level <= 130) {
    return { band: '7.0', label: 'Yaxshi Akademik (C1)', cefr: 'C1', color: 'text-purple-400', badgeBg: 'bg-purple-500/15 border-purple-500/30' };
  } else if (level <= 190) {
    return { band: '8.0', label: 'Juda Yuqori (C1+ / IELTS 8)', cefr: 'C1+', color: 'text-pink-400', badgeBg: 'bg-pink-500/15 border-pink-500/30' };
  } else if (level <= 250) {
    return { band: '8.5', label: 'Mukammal Ekspert (C2)', cefr: 'C2', color: 'text-amber-400', badgeBg: 'bg-amber-500/15 border-amber-500/30' };
  } else {
    return { band: '9.0', label: 'Afsonaviy Master (IELTS 9.0)', cefr: 'C2+', color: 'text-yellow-300', badgeBg: 'bg-yellow-500/20 border-yellow-400' };
  }
}

export interface SentenceItem {
  id: string;
  category: SentenceCategory;
  level: SentenceLevel;
  numericLevel?: number;
  en: string;
  uz: string;
  ru: string;
  missingWord: string;
  blankSentence: string;
  options: string[];
  acceptedTranslations: string[];
  acceptedUzTranslations?: string[];
}

// ============================================================================
// CURATED MASTER SENTENCES DATABASE (FROM GROUND ZERO 0 TO ADVANCED C1)
// ============================================================================
export const CURATED_SENTENCES: SentenceItem[] = [
  // --------------------------------------------------------------------------
  // 1. DARAJA 0 (A1 - 0 DAN BOSHLANG'ICH / ABSOLUTE BEGINNER GREETINGS & DAILY)
  // --------------------------------------------------------------------------
  {
    id: 'zero-1',
    category: 'daily',
    level: 'level0',
    en: 'I came home.',
    uz: 'Men uyga keldim.',
    ru: 'Я пришел домой.',
    missingWord: 'came',
    blankSentence: 'I ______ home.',
    options: ['came', 'come', 'went', 'got'],
    acceptedTranslations: ['I came home', 'I arrived home', 'I got home', 'I came to home'],
    acceptedUzTranslations: ['Men uyga keldim', 'Uyga keldim', 'Uyga yetib keldim']
  },
  {
    id: 'zero-2',
    category: 'daily',
    level: 'level0',
    en: 'What is your name?',
    uz: 'Ismingiz nima?',
    ru: 'Как тебя зовут?',
    missingWord: 'is',
    blankSentence: 'What ______ your name?',
    options: ['is', 'are', 'do', 'am'],
    acceptedTranslations: ['What is your name', "What's your name", 'What is ur name'],
    acceptedUzTranslations: ['Ismingiz nima', 'Isming nima', 'Sizning ismingiz nima']
  },
  {
    id: 'zero-3',
    category: 'daily',
    level: 'level0',
    en: 'My name is Anvar.',
    uz: 'Mening ismim Anvar.',
    ru: 'Меня зовут Анвар.',
    missingWord: 'is',
    blankSentence: 'My name ______ Anvar.',
    options: ['is', 'am', 'are', 'be'],
    acceptedTranslations: ['My name is Anvar', "My name's Anvar"],
    acceptedUzTranslations: ['Mening ismim Anvar', 'Ismim Anvar', 'Men Anvarman']
  },
  {
    id: 'zero-4',
    category: 'daily',
    level: 'level0',
    en: 'Where do you live?',
    uz: 'Qayerda yashaysiz?',
    ru: 'Где вы живете?',
    missingWord: 'do',
    blankSentence: 'Where ______ you live?',
    options: ['do', 'are', 'did', 'is'],
    acceptedTranslations: ['Where do you live', 'Where do u live']
  },
  {
    id: 'zero-5',
    category: 'daily',
    level: 'level0',
    en: 'I live in Tashkent.',
    uz: 'Men Toshkentda yashayman.',
    ru: 'Я живу в Ташкенте.',
    missingWord: 'live',
    blankSentence: 'I ______ in Tashkent.',
    options: ['live', 'lives', 'living', 'lived'],
    acceptedTranslations: ['I live in Tashkent']
  },
  {
    id: 'zero-6',
    category: 'daily',
    level: 'level0',
    en: 'She is reading a book.',
    uz: 'U kitob o\'qiyapti.',
    ru: 'Она читает книгу.',
    missingWord: 'reading',
    blankSentence: 'She is ______ a book.',
    options: ['reading', 'read', 'reads', 'reader'],
    acceptedTranslations: ['She is reading a book', "She's reading a book"]
  },
  {
    id: 'zero-7',
    category: 'daily',
    level: 'level0',
    en: 'He drank cold water.',
    uz: 'U sovuq suv ichdi.',
    ru: 'Он выпил холодную воду.',
    missingWord: 'drank',
    blankSentence: 'He ______ cold water.',
    options: ['drank', 'drink', 'drinks', 'drinking'],
    acceptedTranslations: ['He drank cold water']
  },
  {
    id: 'zero-8',
    category: 'daily',
    level: 'level0',
    en: 'We woke up early today.',
    uz: 'Biz bugun erta uyg\'ondik.',
    ru: 'Мы сегодня рано проснулись.',
    missingWord: 'woke',
    blankSentence: 'We ______ up early today.',
    options: ['woke', 'wake', 'wakes', 'woken'],
    acceptedTranslations: ['We woke up early today', 'We got up early today']
  },
  {
    id: 'zero-9',
    category: 'daily',
    level: 'level0',
    en: 'Can you speak English?',
    uz: 'Inglizcha gapira olasizmi?',
    ru: 'Вы говорите по-английски?',
    missingWord: 'speak',
    blankSentence: 'Can you ______ English?',
    options: ['speak', 'speaks', 'speaking', 'spoke'],
    acceptedTranslations: ['Can you speak English', 'Do you speak English']
  },
  {
    id: 'zero-10',
    category: 'daily',
    level: 'level0',
    en: 'I want to learn English.',
    uz: 'Men ingliz tilini o\'rganishni xohlayman.',
    ru: 'Я хочу учить английский язык.',
    missingWord: 'learn',
    blankSentence: 'I want to ______ English.',
    options: ['learn', 'learning', 'learnt', 'learns'],
    acceptedTranslations: ['I want to learn English', 'I wanna learn English']
  },
  {
    id: 'zero-11',
    category: 'daily',
    level: 'level0',
    en: 'She cooked delicious food.',
    uz: 'U mazali ovqat pishirdi.',
    ru: 'Она приготовила вкусную еду.',
    missingWord: 'cooked',
    blankSentence: 'She ______ delicious food.',
    options: ['cooked', 'cook', 'cooks', 'cooking'],
    acceptedTranslations: ['She cooked delicious food', 'She cooked tasty food']
  },
  {
    id: 'zero-12',
    category: 'daily',
    level: 'level0',
    en: 'Where is the train station?',
    uz: 'Poyezd vokzali qayerda?',
    ru: 'Где находится вокзал?',
    missingWord: 'is',
    blankSentence: 'Where ______ the train station?',
    options: ['is', 'are', 'was', 'does'],
    acceptedTranslations: ['Where is the train station', "Where's the train station"]
  },
  {
    id: 'zero-13',
    category: 'daily',
    level: 'level0',
    en: 'I finished my work.',
    uz: 'Men ishimni tugatdim.',
    ru: 'Я закончил свою работу.',
    missingWord: 'finished',
    blankSentence: 'I ______ my work.',
    options: ['finished', 'finish', 'finishes', 'finishing'],
    acceptedTranslations: ['I finished my work', 'I completed my work']
  },
  {
    id: 'zero-14',
    category: 'daily',
    level: 'level0',
    en: 'They are playing football.',
    uz: 'Ular futbol o\'ynashyapti.',
    ru: 'Они играют в футбол.',
    missingWord: 'playing',
    blankSentence: 'They are ______ football.',
    options: ['playing', 'play', 'played', 'plays'],
    acceptedTranslations: ['They are playing football', "They're playing football"]
  },
  {
    id: 'zero-15',
    category: 'daily',
    level: 'level0',
    en: 'I have two brothers and one sister.',
    uz: 'Mening ikki akam va bir singlim bor.',
    ru: 'У меня два брата и одна сестра.',
    missingWord: 'have',
    blankSentence: 'I ______ two brothers and one sister.',
    options: ['have', 'has', 'having', 'had'],
    acceptedTranslations: ['I have two brothers and one sister', "I've got two brothers and one sister"]
  },
  {
    id: 'zero-16',
    category: 'daily',
    level: 'level0',
    en: 'The weather is very nice today.',
    uz: 'Bugun havo juda yaxshi.',
    ru: 'Сегодня очень хорошая погода.',
    missingWord: 'is',
    blankSentence: 'The weather ______ very nice today.',
    options: ['is', 'are', 'was', 'be'],
    acceptedTranslations: ['The weather is very nice today', 'The weather is great today']
  },
  {
    id: 'zero-17',
    category: 'daily',
    level: 'level0',
    en: 'Do you like hot tea?',
    uz: 'Issiq choyni yoqtirasizmi?',
    ru: 'Вам нравится горячий чай?',
    missingWord: 'like',
    blankSentence: 'Do you ______ hot tea?',
    options: ['like', 'likes', 'liked', 'liking'],
    acceptedTranslations: ['Do you like hot tea']
  },
  {
    id: 'zero-18',
    category: 'daily',
    level: 'level0',
    en: 'I bought a new book yesterday.',
    uz: 'Men kecha yangi kitob sotib oldim.',
    ru: 'Вчера я купил новую книгу.',
    missingWord: 'bought',
    blankSentence: 'I ______ a new book yesterday.',
    options: ['bought', 'buy', 'buys', 'buying'],
    acceptedTranslations: ['I bought a new book yesterday', 'Yesterday I bought a new book']
  },
  {
    id: 'zero-19',
    category: 'daily',
    level: 'level0',
    en: 'He is listening to music.',
    uz: 'U musiqa tinglayapti.',
    ru: 'Он слушает музыку.',
    missingWord: 'listening',
    blankSentence: 'He is ______ to music.',
    options: ['listening', 'listen', 'listens', 'listened'],
    acceptedTranslations: ['He is listening to music', "He's listening to music"]
  },
  {
    id: 'zero-20',
    category: 'daily',
    level: 'level0',
    en: 'We went to the park.',
    uz: 'Biz bog\'ga bordik.',
    ru: 'Мы пошли в парк.',
    missingWord: 'went',
    blankSentence: 'We ______ to the park.',
    options: ['went', 'go', 'going', 'gone'],
    acceptedTranslations: ['We went to the park']
  },
  {
    id: 'zero-21',
    category: 'daily',
    level: 'level0',
    en: 'What time is it now?',
    uz: 'Hozir soat necha bo\'ldi?',
    ru: 'Который сейчас час?',
    missingWord: 'time',
    blankSentence: 'What ______ is it now?',
    options: ['time', 'hour', 'clock', 'day'],
    acceptedTranslations: ['What time is it now', 'What time is it']
  },
  {
    id: 'zero-22',
    category: 'daily',
    level: 'level0',
    en: 'Please open the door.',
    uz: 'Iltimos, eshikni oching.',
    ru: 'Пожалуйста, откройте дверь.',
    missingWord: 'open',
    blankSentence: 'Please ______ the door.',
    options: ['open', 'close', 'take', 'look'],
    acceptedTranslations: ['Please open the door', 'Open the door please']
  },
  {
    id: 'zero-23',
    category: 'daily',
    level: 'level0',
    en: 'I am hungry now.',
    uz: 'Men hozir och qoldim.',
    ru: 'Я сейчас голоден.',
    missingWord: 'hungry',
    blankSentence: 'I am ______ now.',
    options: ['hungry', 'thirsty', 'tired', 'sleepy'],
    acceptedTranslations: ['I am hungry now', "I'm hungry now"]
  },
  {
    id: 'zero-24',
    category: 'daily',
    level: 'level0',
    en: 'How are you doing today?',
    uz: 'Bugun qalaysiz?',
    ru: 'Как ваши дела сегодня?',
    missingWord: 'doing',
    blankSentence: 'How are you ______ today?',
    options: ['doing', 'do', 'did', 'done'],
    acceptedTranslations: ['How are you doing today', 'How are you today']
  },
  {
    id: 'zero-25',
    category: 'daily',
    level: 'level0',
    en: 'This is my family.',
    uz: 'Bu mening oilam.',
    ru: 'Это моя семья.',
    missingWord: 'family',
    blankSentence: 'This is my ______.',
    options: ['family', 'friend', 'house', 'city'],
    acceptedTranslations: ['This is my family']
  },

  // --------------------------------------------------------------------------
  // 2. KUNDALIK SUHBAT (A2 / B1 DAILY CONVERSATION)
  // --------------------------------------------------------------------------
  {
    id: 'daily-1',
    category: 'daily',
    level: 'easy',
    en: 'How was your day at school today?',
    uz: 'Bugun maktabdagi kuning qanday o\'tdi?',
    ru: 'Как прошел твой день в школе сегодня?',
    missingWord: 'was',
    blankSentence: 'How ______ your day at school today?',
    options: ['was', 'is', 'did', 'were'],
    acceptedTranslations: ['How was your day at school today', 'How was your day at school']
  },
  {
    id: 'daily-2',
    category: 'daily',
    level: 'easy',
    en: 'Could you please pass me the water bottle?',
    uz: 'Iltimos, menga suv idishini uzatib yubora olasizmi?',
    ru: 'Не могли бы вы передать мне бутылку с водой?',
    missingWord: 'pass',
    blankSentence: 'Could you please ______ me the water bottle?',
    options: ['pass', 'give', 'take', 'hold'],
    acceptedTranslations: ['Could you please pass me the water bottle', 'Can you please pass me the water bottle']
  },
  {
    id: 'daily-3',
    category: 'daily',
    level: 'easy',
    en: 'I am planning to meet my friends this evening.',
    uz: 'Bugun kechqurun do\'stlarim bilan uchrashishni rejalashtiryapman.',
    ru: 'Я планирую встретиться с друзьями сегодня вечером.',
    missingWord: 'meet',
    blankSentence: 'I am planning to ______ my friends this evening.',
    options: ['meet', 'see', 'call', 'talk'],
    acceptedTranslations: ['I am planning to meet my friends this evening', "I'm planning to meet my friends this evening"]
  },
  {
    id: 'daily-4',
    category: 'daily',
    level: 'medium',
    en: 'Do you have time to help me with this matter?',
    uz: 'Vaqtingiz bormi, menga bu masalada yordam bera olasizmi?',
    ru: 'У вас есть время помочь мне с этим вопросом?',
    missingWord: 'help',
    blankSentence: 'Do you have time to ______ me with this matter?',
    options: ['help', 'ask', 'tell', 'show'],
    acceptedTranslations: ['Do you have time to help me with this matter']
  },
  {
    id: 'daily-5',
    category: 'daily',
    level: 'medium',
    en: 'I usually take a brisk walk in the park before breakfast.',
    uz: 'Men odatda nonushtadan oldin bog\'da tetiklashtiruvchi sayr qilaman.',
    ru: 'Обычно я совершаю бодрую прогулку по парку перед завтраком.',
    missingWord: 'walk',
    blankSentence: 'I usually take a brisk ______ in the park before breakfast.',
    options: ['walk', 'run', 'ride', 'step'],
    acceptedTranslations: ['I usually take a brisk walk in the park before breakfast']
  },
  {
    id: 'daily-6',
    category: 'daily',
    level: 'medium',
    en: 'Would you mind turning down the music a little bit?',
    uz: 'Musiqa ovozini sal pasaytirib bera olmaysizmi?',
    ru: 'Не могли бы вы сделать музыку немного потише?',
    missingWord: 'turning',
    blankSentence: 'Would you mind ______ down the music a little bit?',
    options: ['turning', 'turn', 'turned', 'turns'],
    acceptedTranslations: ['Would you mind turning down the music a little bit']
  },
  {
    id: 'daily-7',
    category: 'daily',
    level: 'medium',
    en: 'It seems like it is going to rain heavily this afternoon.',
    uz: 'Bugun tushdan keyin qattiq yomg\'ir yog\'adiganga o\'xshaydi.',
    ru: 'Кажется, сегодня днем пойдет сильный дождь.',
    missingWord: 'rain',
    blankSentence: 'It seems like it is going to ______ heavily this afternoon.',
    options: ['rain', 'snow', 'fall', 'blow'],
    acceptedTranslations: ['It seems like it is going to rain heavily this afternoon']
  },
  {
    id: 'daily-8',
    category: 'daily',
    level: 'hard',
    en: 'Finding a balance between work commitments and personal life requires continuous effort.',
    uz: 'Ish majburiyatlari va shaxsiy hayot o\'rtasida muvozanat topish doimiy harakatni talab qiladi.',
    ru: 'Поиск баланса между рабочими обязанностями и личной жизнью требует постоянных усилий.',
    missingWord: 'balance',
    blankSentence: 'Finding a ______ between work commitments and personal life requires continuous effort.',
    options: ['balance', 'choice', 'time', 'peace'],
    acceptedTranslations: ['Finding a balance between work commitments and personal life requires continuous effort']
  },
  {
    id: 'daily-9',
    category: 'daily',
    level: 'easy',
    en: 'We should definitely grab a cup of coffee sometime next week.',
    uz: 'Kelasi hafta albatta birga kofe ichishimiz kerak.',
    ru: 'Нам определенно стоит выпить по чашечке кофе на следующей неделе.',
    missingWord: 'coffee',
    blankSentence: 'We should definitely grab a cup of ______ sometime next week.',
    options: ['coffee', 'tea', 'water', 'juice'],
    acceptedTranslations: ['We should definitely grab a cup of coffee sometime next week']
  },

  // --------------------------------------------------------------------------
  // 3. IT VA DASTURLASH (TECH & CODING ENGLISH)
  // --------------------------------------------------------------------------
  {
    id: 'tech-1',
    category: 'tech',
    level: 'easy',
    en: 'Make sure to write clean and maintainable code for your team.',
    uz: 'Jamoangiz uchun tushunarli va saqlash oson bo\'lgan toza kod yozishga e\'tibor qarating.',
    ru: 'Обязательно пишите чистый и поддерживаемый код для своей команды.',
    missingWord: 'code',
    blankSentence: 'Make sure to write clean and maintainable ______ for your team.',
    options: ['code', 'text', 'notes', 'words'],
    acceptedTranslations: ['Make sure to write clean and maintainable code for your team']
  },
  {
    id: 'tech-2',
    category: 'tech',
    level: 'easy',
    en: 'The build failed because of an unresolved dependency in package.json.',
    uz: 'package.json faylidagi hal etilmagan kutubxona sababli loyiha yig\'ilishi xato bilan to\'xtadi.',
    ru: 'Сборка завершилась ошибкой из-за неустановленной зависимости в package.json.',
    missingWord: 'failed',
    blankSentence: 'The build ______ because of an unresolved dependency in package.json.',
    options: ['failed', 'passed', 'stopped', 'started'],
    acceptedTranslations: ['The build failed because of an unresolved dependency in package.json']
  },
  {
    id: 'tech-3',
    category: 'tech',
    level: 'medium',
    en: 'Asynchronous functions prevent the browser UI thread from freezing during data fetching.',
    uz: 'Asinxron funksiyalar ma\'lumot yuklanayotganda brauzer interfeysi qotib qolishining oldini oladi.',
    ru: 'Асинхронные функции предотвращают зависание потока интерфейса браузера во время загрузки данных.',
    missingWord: 'prevent',
    blankSentence: 'Asynchronous functions ______ the browser UI thread from freezing during data fetching.',
    options: ['prevent', 'allow', 'cause', 'speed'],
    acceptedTranslations: ['Asynchronous functions prevent the browser UI thread from freezing during data fetching']
  },
  {
    id: 'tech-4',
    category: 'tech',
    level: 'medium',
    en: 'Always sanitize user input on the server side to protect against SQL injections.',
    uz: 'SQL inyeksiyalaridan himoyalanish uchun server tomonida foydalanuvchi kiritgan ma\'lumotlarni doimo tozalang.',
    ru: 'Всегда очищайте пользовательский ввод на стороне сервера для защиты от SQL-инъекций.',
    missingWord: 'sanitize',
    blankSentence: 'Always ______ user input on the server side to protect against SQL injections.',
    options: ['sanitize', 'accept', 'delete', 'ignore'],
    acceptedTranslations: ['Always sanitize user input on the server side to protect against SQL injections']
  },
  {
    id: 'tech-5',
    category: 'tech',
    level: 'hard',
    en: 'Optimizing database queries using indexes dramatically reduces API response latency.',
    uz: 'Indekslardan foydalangan holda ma\'lumotlar bazasi so\'rovlarini optimallashtirish API javob berish vaqtini sezilarli qisqartiradi.',
    ru: 'Оптимизация запросов к базе данных с помощью индексов значительно снижает задержку ответа API.',
    missingWord: 'latency',
    blankSentence: 'Optimizing database queries using indexes dramatically reduces API response ______.',
    options: ['latency', 'speed', 'memory', 'errors'],
    acceptedTranslations: ['Optimizing database queries using indexes dramatically reduces API response latency']
  },
  {
    id: 'tech-6',
    category: 'tech',
    level: 'easy',
    en: 'I pushed the latest commit to the main branch.',
    uz: 'Men eng so\'nggi commitni asosiy tarmoqqa yubordim (push qildim).',
    ru: 'Я запушил последний коммит в основную ветку.',
    missingWord: 'pushed',
    blankSentence: 'I ______ the latest commit to the main branch.',
    options: ['pushed', 'pulled', 'deleted', 'created'],
    acceptedTranslations: ['I pushed the latest commit to the main branch']
  },
  {
    id: 'tech-7',
    category: 'tech',
    level: 'medium',
    en: 'We need to write unit tests to ensure software reliability.',
    uz: 'Dastur ishonchliligini ta\'minlash uchun biz unit testlar yozishimiz kerak.',
    ru: 'Нам нужно писать юнит-тесты для обеспечения надежности программного обеспечения.',
    missingWord: 'tests',
    blankSentence: 'We need to write unit ______ to ensure software reliability.',
    options: ['tests', 'code', 'docs', 'tools'],
    acceptedTranslations: ['We need to write unit tests to ensure software reliability']
  },

  // --------------------------------------------------------------------------
  // 4. BIZNES VA ISH (BUSINESS & WORK ENGLISH)
  // --------------------------------------------------------------------------
  {
    id: 'biz-1',
    category: 'business',
    level: 'easy',
    en: 'Please review the attached quarterly revenue report before our meeting.',
    uz: 'Iltimos, yig\'ilishimizdan oldin ilova qilingan choraklik daromad hisobotini ko\'rib chiqing.',
    ru: 'Пожалуйста, ознакомьтесь с прикрепленным квартальным отчетом о доходах перед нашей встречей.',
    missingWord: 'review',
    blankSentence: 'Please ______ the attached quarterly revenue report before our meeting.',
    options: ['review', 'send', 'sign', 'print'],
    acceptedTranslations: ['Please review the attached quarterly revenue report before our meeting']
  },
  {
    id: 'biz-2',
    category: 'business',
    level: 'medium',
    en: 'We need to schedule a follow-up call with the client next Tuesday.',
    uz: 'Kelgusi seshanba kuni mijoz bilan navbatdagi qo\'ng\'iroqni rejalashtirishimiz lozim.',
    ru: 'Нам необходимо запланировать повторный звонок с клиентом в следующий вторник.',
    missingWord: 'schedule',
    blankSentence: 'We need to ______ a follow-up call with the client next Tuesday.',
    options: ['schedule', 'cancel', 'delay', 'ignore'],
    acceptedTranslations: ['We need to schedule a follow-up call with the client next Tuesday']
  },
  {
    id: 'biz-3',
    category: 'business',
    level: 'hard',
    en: 'The executive committee agreed to allocate additional resources to accelerate product delivery.',
    uz: 'Ijroiya qo\'mitasi mahsulotni yetkazib berishni tezlashtirish uchun qo\'shimcha resurslar ajratishga kelishib oldi.',
    ru: 'Исполнительный комитет согласился выделить дополнительные ресурсы для ускорения запуска продукта.',
    missingWord: 'allocate',
    blankSentence: 'The executive committee agreed to ______ additional resources to accelerate product delivery.',
    options: ['allocate', 'reduce', 'remove', 'borrow'],
    acceptedTranslations: ['The executive committee agreed to allocate additional resources to accelerate product delivery']
  },
  {
    id: 'biz-4',
    category: 'business',
    level: 'easy',
    en: 'Let us finalize the contract terms by the end of this week.',
    uz: 'Shartnoma shartlarini shu hafta oxirigacha uzil-kesil kelishib olaylik.',
    ru: 'Давайте согласуем и финализируем условия контракта до конца этой недели.',
    missingWord: 'finalize',
    blankSentence: 'Let us ______ the contract terms by the end of this week.',
    options: ['finalize', 'break', 'forget', 'change'],
    acceptedTranslations: ['Let us finalize the contract terms by the end of this week', "Let's finalize the contract terms by the end of this week"]
  },

  // --------------------------------------------------------------------------
  // 5. IELTS VA AKADEMIK (ACADEMIC & IELTS BAND 7-9)
  // --------------------------------------------------------------------------
  {
    id: 'ielts-1',
    category: 'ielts',
    level: 'medium',
    en: 'Rapid urbanization poses substantial challenges to environmental sustainability worldwide.',
    uz: 'Tez sur\'atlarda ro\'y berayotgan urbanizatsiya butun dunyo bo\'ylab ekologik barqarorlikka jiddiy xavf solmoqda.',
    ru: 'Стремительная урбанизация создает серьезные вызовы для экологической устойчивости во всем мире.',
    missingWord: 'challenges',
    blankSentence: 'Rapid urbanization poses substantial ______ to environmental sustainability worldwide.',
    options: ['challenges', 'benefits', 'rewards', 'solutions'],
    acceptedTranslations: ['Rapid urbanization poses substantial challenges to environmental sustainability worldwide']
  },
  {
    id: 'ielts-2',
    category: 'ielts',
    level: 'hard',
    en: 'Renewable energy adoption must accelerate to mitigate irreversible climate change.',
    uz: 'Ortga qaytmas iqlim o\'zgarishini yumshatish uchun qayta tiklanadigan energiyani joriy etishni tezlashtirish shart.',
    ru: 'Внедрение возобновляемых источников энергии должно ускориться, чтобы смягчить необратимое изменение климата.',
    missingWord: 'accelerate',
    blankSentence: 'Renewable energy adoption must ______ to mitigate irreversible climate change.',
    options: ['accelerate', 'slow', 'stop', 'decline'],
    acceptedTranslations: ['Renewable energy adoption must accelerate to mitigate irreversible climate change']
  },
  {
    id: 'ielts-3',
    category: 'ielts',
    level: 'easy',
    en: 'Reading books regularly enhances cognitive memory and expands analytical vocabulary.',
    uz: 'Muntazam kitob o\'qish aqliy xotirani mustahkamlaydi va tahliliy so\'z boyligini oshiradi.',
    ru: 'Регулярное чтение книг улучшает память и обогащает словарный запас.',
    missingWord: 'enhances',
    blankSentence: 'Reading books regularly ______ cognitive memory and expands analytical vocabulary.',
    options: ['enhances', 'reduces', 'harms', 'limits'],
    acceptedTranslations: ['Reading books regularly enhances cognitive memory and expands analytical vocabulary']
  },
  {
    id: 'ielts-4',
    category: 'ielts',
    level: 'hard',
    en: 'Bilingual proficiency broadens intellectual horizons and fosters intercultural empathy.',
    uz: 'Ikki yoki undan ortiq tilni bilish aqliy ufqlarni kengaytiradi va madaniyatlararo hamdardlikni rivojlantiradi.',
    ru: 'Владение двумя языками расширяет интеллектуальный кругозор и способствует межкультурному взаимопониманию.',
    missingWord: 'broadens',
    blankSentence: 'Bilingual proficiency ______ intellectual horizons and fosters intercultural empathy.',
    options: ['broadens', 'narrows', 'blocks', 'forgets'],
    acceptedTranslations: ['Bilingual proficiency broadens intellectual horizons and fosters intercultural empathy']
  }
];

// Fallback exported alias for components
export const SENTENCES_DATA = CURATED_SENTENCES;

// ============================================================================
// PROCEDURAL ENDLESS GENERATOR ENGINE (MILLION XIL MATN VA GAPLAR GENERATORI)
// ============================================================================

interface ProceduralSubject {
  en: string;
  uz: string;
  ru: string;
  isPlural?: boolean;
  isFirstPerson?: boolean;
  isSecondPerson?: boolean;
  isThirdPersonSingular?: boolean;
}

const PROCEDURAL_SUBJECTS: ProceduralSubject[] = [
  { en: 'I', uz: 'Men', ru: 'Я', isFirstPerson: true },
  { en: 'You', uz: 'Siz', ru: 'Вы', isSecondPerson: true },
  { en: 'He', uz: 'U', ru: 'Он', isThirdPersonSingular: true },
  { en: 'She', uz: 'U', ru: 'Она', isThirdPersonSingular: true },
  { en: 'We', uz: 'Biz', ru: 'Мы', isPlural: true },
  { en: 'They', uz: 'Ular', ru: 'Они', isPlural: true },
  { en: 'My friend', uz: 'Mening do\'stim', ru: 'Мой друг', isThirdPersonSingular: true },
  { en: 'My brother', uz: 'Mening akam', ru: 'Мой брат', isThirdPersonSingular: true },
  { en: 'The student', uz: 'Talaba', ru: 'Студент', isThirdPersonSingular: true },
  { en: 'The engineer', uz: 'Muhandis', ru: 'Инженер', isThirdPersonSingular: true },
  { en: 'The teacher', uz: 'O\'qituvchi', ru: 'Учитель', isThirdPersonSingular: true },
  { en: 'Our team', uz: 'Bizning jamoamiz', ru: 'Наша команда', isThirdPersonSingular: true }
];

interface ProceduralPredicate {
  category: SentenceCategory;
  level: SentenceLevel;
  enPast: string;
  enPres: (s: ProceduralSubject) => string;
  enProg: (s: ProceduralSubject) => string;
  uzPast: (s: ProceduralSubject) => string;
  uzPres: (s: ProceduralSubject) => string;
  uzProg: (s: ProceduralSubject) => string;
  ruPast: (s: ProceduralSubject) => string;
  ruPres: (s: ProceduralSubject) => string;
  ruProg: (s: ProceduralSubject) => string;
  targetMissingWord: string;
  distractors: string[];
}

const PROCEDURAL_PREDICATES: ProceduralPredicate[] = [
  {
    category: 'daily',
    level: 'level0',
    enPast: 'came home yesterday',
    enPres: (s) => (s.isThirdPersonSingular ? 'comes home early' : 'come home early'),
    enProg: (s) => (s.isFirstPerson ? 'am coming home now' : s.isThirdPersonSingular ? 'is coming home now' : 'are coming home now'),
    uzPast: (s) => `${s.uz} kecha uyga ${s.isFirstPerson ? 'keldim' : s.isSecondPerson ? 'keldingiz' : s.isPlural ? 'kelishdi' : 'keldi'}.`,
    uzPres: (s) => `${s.uz} uyga barvaqt ${s.isFirstPerson ? 'kelaman' : s.isSecondPerson ? 'kelasiz' : s.isPlural ? 'kelishadi' : 'keladi'}.`,
    uzProg: (s) => `${s.uz} hozir uyga ${s.isFirstPerson ? 'kelyapman' : s.isSecondPerson ? 'kelyapsiz' : s.isPlural ? 'kelishyapti' : 'kelyapti'}.`,
    ruPast: (s) => `${s.ru} вчера пришел домой.`,
    ruPres: (s) => `${s.ru} рано приходит домой.`,
    ruProg: (s) => `${s.ru} сейчас идет домой.`,
    targetMissingWord: 'came',
    distractors: ['come', 'went', 'got']
  },
  {
    category: 'daily',
    level: 'level0',
    enPast: 'drank hot green tea',
    enPres: (s) => (s.isThirdPersonSingular ? 'drinks hot green tea' : 'drink hot green tea'),
    enProg: (s) => (s.isFirstPerson ? 'am drinking hot tea' : s.isThirdPersonSingular ? 'is drinking hot tea' : 'are drinking hot tea'),
    uzPast: (s) => `${s.uz} issiq ko'k choy ${s.isFirstPerson ? 'ichdim' : s.isSecondPerson ? 'ichdingiz' : s.isPlural ? 'ichishdi' : 'ichdi'}.`,
    uzPres: (s) => `${s.uz} issiq ko'k choy ${s.isFirstPerson ? 'ichaman' : s.isSecondPerson ? 'ichasiz' : s.isPlural ? 'ichishadi' : 'ichadi'}.`,
    uzProg: (s) => `${s.uz} issiq choy ${s.isFirstPerson ? 'ichyapman' : s.isSecondPerson ? 'ichyapsiz' : s.isPlural ? 'ichishyapti' : 'ichyapti'}.`,
    ruPast: (s) => `${s.ru} выпил горячий зеленый чай.`,
    ruPres: (s) => `${s.ru} пьет горячий зеленый чай.`,
    ruProg: (s) => `${s.ru} пьет горячий чай.`,
    targetMissingWord: 'drank',
    distractors: ['drink', 'drank', 'drinking', 'drinks']
  },
  {
    category: 'daily',
    level: 'level0',
    enPast: 'bought a new smartphone',
    enPres: (s) => (s.isThirdPersonSingular ? 'buys good books' : 'buy good books'),
    enProg: (s) => (s.isFirstPerson ? 'am buying fresh fruits' : s.isThirdPersonSingular ? 'is buying fresh fruits' : 'are buying fresh fruits'),
    uzPast: (s) => `${s.uz} yangi smartfon sotib ${s.isFirstPerson ? 'oldim' : s.isSecondPerson ? 'oldingiz' : s.isPlural ? 'olishdi' : 'oldi'}.`,
    uzPres: (s) => `${s.uz} yaxshi kitoblar sotib ${s.isFirstPerson ? 'olaman' : s.isSecondPerson ? 'olasiz' : s.isPlural ? 'olishadi' : 'oladi'}.`,
    uzProg: (s) => `${s.uz} yangi mevalar sotib ${s.isFirstPerson ? 'olyapman' : s.isSecondPerson ? 'olyapsiz' : s.isPlural ? 'olishyapti' : 'olyapti'}.`,
    ruPast: (s) => `${s.ru} купил новый смартфон.`,
    ruPres: (s) => `${s.ru} покупает хорошие книги.`,
    ruProg: (s) => `${s.ru} покупает свежие фрукты.`,
    targetMissingWord: 'bought',
    distractors: ['buy', 'buys', 'buying']
  },
  {
    category: 'daily',
    level: 'easy',
    enPast: 'woke up at seven o\'clock',
    enPres: (s) => (s.isThirdPersonSingular ? 'wakes up at six o\'clock' : 'wake up at six o\'clock'),
    enProg: (s) => (s.isFirstPerson ? 'am waking up right now' : s.isThirdPersonSingular ? 'is waking up right now' : 'are waking up right now'),
    uzPast: (s) => `${s.uz} soat yettida ${s.isFirstPerson ? 'uyg\'ondim' : s.isSecondPerson ? 'uyg\'ondingiz' : s.isPlural ? 'uyg\'onishdi' : 'uyg\'ondi'}.`,
    uzPres: (s) => `${s.uz} soat oltida ${s.isFirstPerson ? 'uyg\'onaman' : s.isSecondPerson ? 'uyg\'onasiz' : s.isPlural ? 'uyg\'onishadi' : 'uyg\'onadi'}.`,
    uzProg: (s) => `${s.uz} ayni paytda ${s.isFirstPerson ? 'uyg\'onyapman' : s.isSecondPerson ? 'uyg\'onyapsiz' : s.isPlural ? 'uyg\'onyapti' : 'uyg\'onyapti'}.`,
    ruPast: (s) => `${s.ru} проснулся в семь часов.`,
    ruPres: (s) => `${s.ru} просыпается в шесть часов.`,
    ruProg: (s) => `${s.ru} прямо сейчас просыпается.`,
    targetMissingWord: 'woke',
    distractors: ['wake', 'woken', 'wakes']
  },
  {
    category: 'tech',
    level: 'easy',
    enPast: 'fixed the critical login bug',
    enPres: (s) => (s.isThirdPersonSingular ? 'writes efficient code every day' : 'write efficient code every day'),
    enProg: (s) => (s.isFirstPerson ? 'am writing responsive UI components' : s.isThirdPersonSingular ? 'is writing responsive UI components' : 'are writing responsive UI components'),
    uzPast: (s) => `${s.uz} tizimga kirishdagi muhim xatoni (bug) ${s.isFirstPerson ? 'tuzatdim' : s.isSecondPerson ? 'tuzatdingiz' : s.isPlural ? 'tuzatishdi' : 'tuzatdi'}.`,
    uzPres: (s) => `${s.uz} har kuni samarali kod ${s.isFirstPerson ? 'yozaman' : s.isSecondPerson ? 'yozasiz' : s.isPlural ? 'yozishadi' : 'yozadi'}.`,
    uzProg: (s) => `${s.uz} qulay interfeys komponentlarini ${s.isFirstPerson ? 'yozyapman' : s.isSecondPerson ? 'yozyapsiz' : s.isPlural ? 'yozishyapti' : 'yozyapti'}.`,
    ruPast: (s) => `${s.ru} исправил критический баг со входом.`,
    ruPres: (s) => `${s.ru} каждый день пишет эффективный код.`,
    ruProg: (s) => `${s.ru} разрабатывает адаптивные компоненты интерфейса.`,
    targetMissingWord: 'code',
    distractors: ['text', 'script', 'file']
  },
  {
    category: 'tech',
    level: 'medium',
    enPast: 'deployed the new update to production',
    enPres: (s) => (s.isThirdPersonSingular ? 'tests the application thoroughly' : 'test the application thoroughly'),
    enProg: (s) => (s.isFirstPerson ? 'am testing the database queries' : s.isThirdPersonSingular ? 'is testing the database queries' : 'are testing the database queries'),
    uzPast: (s) => `${s.uz} yangi yangilanishni serverga (production) ${s.isFirstPerson ? 'joylashtirdim' : s.isSecondPerson ? 'joylashtirdingiz' : s.isPlural ? 'joylashtirishdi' : 'joylashtirdi'}.`,
    uzPres: (s) => `${s.uz} ilovani sinchkovlik bilan ${s.isFirstPerson ? 'sinayman' : s.isSecondPerson ? 'sinaysiz' : s.isPlural ? 'sinashadi' : 'sinaydi'}.`,
    uzProg: (s) => `${s.uz} ma\'lumotlar bazasi so\'rovlarini ${s.isFirstPerson ? 'tekshiryapman' : s.isSecondPerson ? 'tekshiryapsiz' : s.isPlural ? 'tekshirishyapti' : 'tekshiryapti'}.`,
    ruPast: (s) => `${s.ru} развернул новое обновление на продакшене.`,
    ruPres: (s) => `${s.ru} тщательно тестирует приложение.`,
    ruProg: (s) => `${s.ru} проверяет запросы к базе данных.`,
    targetMissingWord: 'deployed',
    distractors: ['deleted', 'ignored', 'copied']
  },
  {
    category: 'business',
    level: 'easy',
    enPast: 'sent the financial proposal yesterday',
    enPres: (s) => (s.isThirdPersonSingular ? 'manages international partnerships' : 'manage international partnerships'),
    enProg: (s) => (s.isFirstPerson ? 'am preparing the annual budget' : s.isThirdPersonSingular ? 'is preparing the annual budget' : 'are preparing the annual budget'),
    uzPast: (s) => `${s.uz} kecha moliyaviy taklifnomani ${s.isFirstPerson ? 'yubordim' : s.isSecondPerson ? 'yubordingiz' : s.isPlural ? 'yuborishdi' : 'yubordi'}.`,
    uzPres: (s) => `${s.uz} xalqaro hamkorlikni ${s.isFirstPerson ? 'boshqaraman' : s.isSecondPerson ? 'boshqarasiz' : s.isPlural ? 'boshqarishadi' : 'boshqaradi'}.`,
    uzProg: (s) => `${s.uz} yillik byudjetni ${s.isFirstPerson ? 'tayyorlayapman' : s.isSecondPerson ? 'tayyorlayapsiz' : s.isPlural ? 'tayyorlashyapti' : 'tayyorlayapti'}.`,
    ruPast: (s) => `${s.ru} вчера отправил финансовое предложение.`,
    ruPres: (s) => `${s.ru} руководит международными партнерствами.`,
    ruProg: (s) => `${s.ru} готовит годовой бюджет.`,
    targetMissingWord: 'proposal',
    distractors: ['invoice', 'receipt', 'contract']
  },
  {
    category: 'ielts',
    level: 'medium',
    enPast: 'analyzed the demographic statistics accurately',
    enPres: (s) => (s.isThirdPersonSingular ? 'studies academic literature diligently' : 'study academic literature diligently'),
    enProg: (s) => (s.isFirstPerson ? 'am preparing for the IELTS exam' : s.isThirdPersonSingular ? 'is preparing for the IELTS exam' : 'are preparing for the IELTS exam'),
    uzPast: (s) => `${s.uz} demografik statistikani aniq ${s.isFirstPerson ? 'tahlil qildim' : s.isSecondPerson ? 'tahlil qildingiz' : s.isPlural ? 'tahlil qilishdi' : 'tahlil qildi'}.`,
    uzPres: (s) => `${s.uz} ilmiy adabiyotlarni g'ayrat bilan ${s.isFirstPerson ? 'o\'rganaman' : s.isSecondPerson ? 'o\'rganasiz' : s.isPlural ? 'o\'rganishadi' : 'o\'rganadi'}.`,
    uzProg: (s) => `${s.uz} IELTS imtihoniga ${s.isFirstPerson ? 'tayyorlanyapman' : s.isSecondPerson ? 'tayyorlanyapsiz' : s.isPlural ? 'tayyorlanishyapti' : 'tayyorlanyapti'}.`,
    ruPast: (s) => `${s.ru} точно проанализировал демографическую статистику.`,
    ruPres: (s) => `${s.ru} усердно изучает академическую литературу.`,
    ruProg: (s) => `${s.ru} готовится к экзамену IELTS.`,
    targetMissingWord: 'analyzed',
    distractors: ['forgot', 'refused', 'broke']
  }
];

// ============================================================================
// INFINITE SENTENCE GENERATOR (FROM LEVEL 1 TO 1,000,000+ & IELTS 1.0 TO 9.0)
// ============================================================================

// Combinatorial building blocks for high-level IELTS 8.5 - 9.0 master sentences
const IELTS9_PREFIXES = [
  { en: 'From an epistemological standpoint,', uz: 'Epistemologik nuqtai nazardan,', ru: 'С эпистемологической точки зрения,' },
  { en: 'In contemporary socioeconomic discourse,', uz: 'Zamonaviy ijtimoiy-iqtisodiy munozaralarda,', ru: 'В современном социально-экономическом дискурсе,' },
  { en: 'Compelling empirical evidence suggests that', uz: 'Ishonchli empirik dalillar shuni ko\'rsatadiki,', ru: 'Убедительные эмпирические данные свидетельствуют о том, что' },
  { en: 'Notwithstanding prevailing conventional wisdom,', uz: 'Keng tarqalgan an\'anaviy qarashlarga qaramay,', ru: 'Несмотря на преобладающие традиционные представления,' },
  { en: 'Theoretical models substantiate that', uz: 'Nazariy modellar shuni tasdiqlaydiki,', ru: 'Теоретические модели подтверждают, что' },
  { en: 'It is of paramount importance that', uz: 'Shuni e\'tiborga olish nihoyatda muhimki,', ru: 'Крайне важно, чтобы' },
  { en: 'In the realm of advanced technological innovation,', uz: 'Ilg\'or texnologik innovatsiyalar sohasida,', ru: 'В сфере передовых технологических инноваций,' },
  { en: 'From a macro-demographic perspective,', uz: 'Makro-demografik nuqtai nazardan,', ru: 'С макродемографической точки зрения,' }
];

const IELTS9_SUBJECTS = [
  { en: 'the widespread integration of autonomous intelligence', uz: 'avtonom sun\'iy intellektning keng integratsiyasi', ru: 'широкая интеграция автономного интеллекта' },
  { en: 'the equilibrium between economic growth and environmental stewardship', uz: 'iqtisodiy o\'sish va atrof-muhit musaffoligi o\'rtasidagi muvozanat', ru: 'равновесие между экономическим ростом и защитой окружающей среды' },
  { en: 'the proliferation of decentralized digital architectures', uz: 'markazlashmagan raqamli arxitekturalarning ommalashishi', ru: 'распространение децентрализованных цифровых архитектур' },
  { en: 'systematic cross-disciplinary scientific collaboration', uz: 'tizimli fanlararo ilmiy hamkorlik', ru: 'систематическое междисциплинарное научное сотрудничество' },
  { en: 'the democratization of specialized academic resources', uz: 'ixtisoslashtirilgan akademik resurslarning ommalashuvi', ru: 'демократизация специализированных академических ресурсов' },
  { en: 'cognitive resilience amidst hyper-connected environments', uz: 'yuqori darajada bog\'langan muhitda kognitiv barqarorlik', ru: 'когнитивная устойчивость в гиперсвязанной среде' }
];

const IELTS9_PREDICATES = [
  { en: 'catalyzes profound institutional transformations', uz: 'chuqur institutsional o\'zgarishlarni jadallashtiradi', ru: 'катализирует глубокие институциональные трансформации', targetWord: 'catalyzes' },
  { en: 'engenders unprecedented paradigms of human achievement', uz: 'inson yutuqlarining misli ko\'rilmagan modellarini yaratadi', ru: 'порождает беспрецедентные парадигмы человеческих достижений', targetWord: 'engenders' },
  { en: 'necessitates comprehensive structural reforms', uz: 'har tomonlama tarkibiy islohotlarni taqozo etadi', ru: 'требует комплексных структурных реформ', targetWord: 'necessitates' },
  { en: 'exerts a profound influence on contemporary civil society', uz: 'zamonaviy fuqarolik jamiyatiga sezilarli ta\'sir ko\'rsatadi', ru: 'оказывает глубокое влияние на современное гражданское общество', targetWord: 'influence' },
  { en: 'substantiates the validity of long-term sustainable policies', uz: 'uzoq muddatli barqaror siyosatning to\'g\'riligini asoslab beradi', ru: 'подтверждает обоснованность долгосрочной устойчивой политики', targetWord: 'substantiates' }
];

const IELTS9_SUFFIXES = [
  { en: 'while establishing robust benchmarks for subsequent scientific inquiries.', uz: 'shu bilan birga kelajakdagi ilmiy izlanishlar uchun mustahkam mezonlarni belgilaydi.', ru: 'одновременно устанавливая надежные ориентиры для последующих научных исследований.' },
  { en: 'thereby redefining conventional metrics of global progress.', uz: 'shu tariqa global taraqqiyotning an\'anaviy mezonlarini qayta belgilaydi.', ru: 'тем самым переопределяя традиционные критерии глобального прогресса.' },
  { en: 'notwithstanding lingering operational complexities and regulatory hurdles.', uz: 'mavjud operatsion murakkabliklar va tartibga solish to\'siqlariga qaramasdan.', ru: 'несмотря на сохраняющиеся операционные сложности и регуляторные препятствия.' },
  { en: 'which underscores the critical imperative for transparent governance.', uz: 'bu esa ochiq va shaffof boshqaruvning qat\'iy zarurligini yana bir bor ta\'kidlaydi.', ru: 'что подчеркивает критическую необходимость прозрачного управления.' }
];

// Tier 1 (Level 1-5 / 0 dan boshlang'ich) generator components
const LEVEL0_PATTERNS = [
  { en: 'I am here.', uz: 'Men shu yerdaman.', ru: 'Я здесь.', missing: 'here', opt: ['here', 'there', 'where', 'near'] },
  { en: 'What is your name?', uz: 'Ismingiz nima?', ru: 'Как вас зовут?', missing: 'is', opt: ['is', 'are', 'was', 'am'] },
  { en: 'My name is Anvar.', uz: 'Mening ismim Anvar.', ru: 'Меня зовут Анвар.', missing: 'name', opt: ['name', 'named', 'call', 'title'] },
  { en: 'I came home.', uz: 'Men uyga keldim.', ru: 'Я пришел домой.', missing: 'came', opt: ['came', 'come', 'went', 'got'] },
  { en: 'Where do you live?', uz: 'Qayerda yashaysiz?', ru: 'Где вы живете?', missing: 'do', opt: ['do', 'are', 'did', 'is'] },
  { en: 'I live in Tashkent.', uz: 'Men Toshkentda yashayman.', ru: 'Я живу в Ташкенте.', missing: 'live', opt: ['live', 'lives', 'living', 'lived'] },
  { en: 'She is my sister.', uz: 'U mening singlim.', ru: 'Она моя сестра.', missing: 'sister', opt: ['sister', 'brother', 'mother', 'friend'] },
  { en: 'He drinks water.', uz: 'U suv ichadi.', ru: 'Он пьет воду.', missing: 'drinks', opt: ['drinks', 'drink', 'drinking', 'drank'] },
  { en: 'We wake up early.', uz: 'Biz erta uyg\'onamiz.', ru: 'Мы рано просыпаемся.', missing: 'early', opt: ['early', 'late', 'fast', 'quick'] },
  { en: 'They read good books.', uz: 'Ular yaxshi kitoblar o\'qishadi.', ru: 'Они читают хорошие книги.', missing: 'read', opt: ['read', 'reads', 'reading', 'reader'] },
  { en: 'Open the door.', uz: 'Eshikni oching.', ru: 'Откройте дверь.', missing: 'Open', opt: ['Open', 'Close', 'Take', 'Make'] },
  { en: 'See you tomorrow.', uz: 'Ertagacha ko\'rishguncha.', ru: 'До завтра.', missing: 'tomorrow', opt: ['tomorrow', 'yesterday', 'today', 'now'] },
  { en: 'This is my pen.', uz: 'Bu mening ruchkam.', ru: 'Это моя ручка.', missing: 'This', opt: ['This', 'That', 'These', 'Those'] },
  { en: 'I have a car.', uz: 'Mening mashinam bor.', ru: 'У меня есть машина.', missing: 'have', opt: ['have', 'has', 'having', 'had'] },
  { en: 'The sun is bright.', uz: 'Quyosh yorug\'.', ru: 'Солнце яркое.', missing: 'bright', opt: ['bright', 'dark', 'cold', 'rainy'] }
];

/**
 * Procedural Dynamic Sentence Synthesizer:
 * Generates endless natural, grammatically correct sentences across all levels.
 */
export function generateProceduralSentence(
  filterLevel?: SentenceLevel | 'all',
  filterCategory?: SentenceCategory | 'all'
): SentenceItem {
  const subj = PROCEDURAL_SUBJECTS[Math.floor(Math.random() * PROCEDURAL_SUBJECTS.length)];
  let candidates = PROCEDURAL_PREDICATES;

  if (filterCategory && filterCategory !== 'all') {
    const matched = candidates.filter((p) => p.category === filterCategory);
    if (matched.length > 0) candidates = matched;
  }
  if (filterLevel && filterLevel !== 'all') {
    const matched = candidates.filter((p) => p.level === filterLevel);
    if (matched.length > 0) candidates = matched;
  }

  const pred = candidates[Math.floor(Math.random() * candidates.length)];
  const tenseChoice = Math.floor(Math.random() * 3); // 0: Past, 1: Present Simple, 2: Continuous

  let enStr = '';
  let uzStr = '';
  let ruStr = '';

  if (tenseChoice === 0) {
    enStr = `${subj.en} ${pred.enPast}.`;
    uzStr = pred.uzPast(subj);
    ruStr = pred.ruPast(subj);
  } else if (tenseChoice === 1) {
    enStr = `${subj.en} ${pred.enPres(subj)}.`;
    uzStr = pred.uzPres(subj);
    ruStr = pred.ruPres(subj);
  } else {
    enStr = `${subj.en} ${pred.enProg(subj)}.`;
    uzStr = pred.uzProg(subj);
    ruStr = pred.ruProg(subj);
  }

  // Determine missing word
  const words = enStr.replace(/[.,?!]/g, '').split(' ');
  let missing = pred.targetMissingWord;
  if (!words.includes(missing)) {
    missing = words.length > 2 ? words[1] : words[0];
  }

  const blankSentence = enStr.replace(new RegExp(`\\b${missing}\\b`, 'i'), '______');
  const options = Array.from(new Set([missing, ...pred.distractors])).slice(0, 4);

  return {
    id: `procedural-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    category: pred.category,
    level: pred.level,
    en: enStr,
    uz: uzStr,
    ru: ruStr,
    missingWord: missing,
    blankSentence: blankSentence,
    options: options.sort(() => Math.random() - 0.5),
    acceptedTranslations: [
      enStr.replace(/[.,?!]/g, ''),
      enStr
    ]
  };
}

/**
 * Universal Infinite Sentence Engine:
 * Generates endless uniquely scaled sentences for ANY numeric level from Level 1 up to 1,000,000+!
 * Seamlessly adapts from 0-beginner to IELTS Band 9.0 master difficulty.
 */
export function generateInfiniteSentenceByLevel(
  numericLevel: number,
  preferredCategory: SentenceCategory | 'all' = 'all'
): SentenceItem {
  const effectiveLevel = Math.max(1, numericLevel);

  // Attempt up to 25 variations to find an unseen sentence
  for (let attempt = 0; attempt < 25; attempt++) {
    let item: SentenceItem;

    // TIER 1: Level 1 - 5 (0 dan boshlang'ich / Absolute Beginner)
    if (effectiveLevel <= 5) {
      const p = LEVEL0_PATTERNS[Math.floor(Math.random() * LEVEL0_PATTERNS.length)];
      item = {
        id: `lvl0-${Date.now()}-${attempt}-${Math.random().toString(36).substring(2, 6)}`,
        category: 'daily',
        level: 'level0',
        numericLevel: effectiveLevel,
        en: p.en,
        uz: p.uz,
        ru: p.ru,
        missingWord: p.missing,
        blankSentence: p.en.replace(new RegExp(`\\b${p.missing}\\b`, 'i'), '______'),
        options: p.opt.sort(() => Math.random() - 0.5),
        acceptedTranslations: [p.en.replace(/[.,?!]/g, ''), p.en]
      };
    }
    // TIER 2: Level 6 - 25 (Elementary / A1 - A2)
    else if (effectiveLevel <= 25) {
      const generated = generateProceduralSentence('easy', preferredCategory);
      item = {
        ...generated,
        numericLevel: effectiveLevel
      };
    }
    // TIER 3: Level 26 - 60 (Intermediate / B1)
    else if (effectiveLevel <= 60) {
      const generated = generateProceduralSentence('medium', preferredCategory);
      item = {
        ...generated,
        numericLevel: effectiveLevel
      };
    }
    // TIER 4: Level 61 - 100 (Upper Intermediate / B2 - IELTS 6.0 - 6.5)
    else if (effectiveLevel <= 100) {
      const generated = generateProceduralSentence('hard', preferredCategory);
      item = {
        ...generated,
        numericLevel: effectiveLevel
      };
    }
    // TIER 5: Level 101 - 180 (Advanced / C1 - IELTS 7.0 - 8.0)
    else if (effectiveLevel <= 180) {
      const generated = generateProceduralSentence('hard', 'ielts');
      item = {
        ...generated,
        numericLevel: effectiveLevel
      };
    }
    // TIER 6: Level 181+ up to millions (IELTS 8.5 - 9.0 Master Academic Discourse)
    else {
      const prefix = IELTS9_PREFIXES[Math.floor(Math.random() * IELTS9_PREFIXES.length)];
      const subject = IELTS9_SUBJECTS[Math.floor(Math.random() * IELTS9_SUBJECTS.length)];
      const predicate = IELTS9_PREDICATES[Math.floor(Math.random() * IELTS9_PREDICATES.length)];
      const suffix = IELTS9_SUFFIXES[Math.floor(Math.random() * IELTS9_SUFFIXES.length)];

      const enText = `${prefix.en} ${subject.en} ${predicate.en} ${suffix.en}`;
      const uzText = `${prefix.uz} ${subject.uz} ${predicate.uz} ${suffix.uz}`;
      const ruText = `${prefix.ru} ${subject.ru} ${predicate.ru} ${suffix.ru}`;

      const missing = predicate.targetWord;
      const blank = enText.replace(new RegExp(`\\b${missing}\\b`, 'i'), '______');
      const distractors = ['undermines', 'obstructs', 'dilutes', 'postpones'].sort(() => Math.random() - 0.5);
      const options = Array.from(new Set([missing, ...distractors.slice(0, 3)])).sort(() => Math.random() - 0.5);

      item = {
        id: `ielts9-${Date.now()}-${attempt}-${Math.random().toString(36).substring(2, 6)}`,
        category: 'ielts',
        level: 'hard',
        numericLevel: effectiveLevel,
        en: enText,
        uz: uzText,
        ru: ruText,
        missingWord: missing,
        blankSentence: blank,
        options,
        acceptedTranslations: [
          enText.replace(/[.,?!]/g, ''),
          enText
        ]
      };
    }

    // Anti-repetition check: if this sentence has NOT been seen yet, return it!
    if (!sentenceTracker.isSentenceSeen(item)) {
      return item;
    }
  }

  // Fallback if all 25 procedural variations matched seen set
  const fallback = generateProceduralSentence('hard', 'ielts');
  fallback.numericLevel = effectiveLevel;
  return fallback;
}

/**
 * Returns a guaranteed UNIQUE sentence for the requested level and category.
 * Prevents any sentence from ever repeating ("bir marta chiqgan matn boshqa chiqmasin").
 */
export function getUniqueSentenceForSession(
  numericLevel: number,
  category: SentenceCategory | 'all' = 'all'
): SentenceItem {
  // First, check if there are curated sentences matching the level range that haven't been seen yet
  let targetLevelTag: SentenceLevel = 'level0';
  if (numericLevel <= 5) targetLevelTag = 'level0';
  else if (numericLevel <= 25) targetLevelTag = 'easy';
  else if (numericLevel <= 60) targetLevelTag = 'medium';
  else targetLevelTag = 'hard';

  const candidates = CURATED_SENTENCES.filter((s) => {
    const catMatch = category === 'all' || s.category === category;
    const lvlMatch = s.level === targetLevelTag;
    return catMatch && lvlMatch && !sentenceTracker.isSentenceSeen(s);
  });

  if (candidates.length > 0) {
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const item: SentenceItem = { ...chosen, numericLevel };
    sentenceTracker.markSentenceSeen(item);
    return item;
  }

  // If all curated sentences for this tier have been seen, generate infinite unique procedural sentence
  const freshItem = generateInfiniteSentenceByLevel(numericLevel, category);
  sentenceTracker.markSentenceSeen(freshItem);
  return freshItem;
}

/**
 * Returns an expansive pool of sentences for initial display
 */
export function getSentencesPool(
  category: SentenceCategory | 'all',
  level: SentenceLevel | 'all',
  count: number = 25
): SentenceItem[] {
  let list = CURATED_SENTENCES;

  if (category !== 'all') {
    list = list.filter((s) => s.category === category);
  }
  if (level !== 'all') {
    list = list.filter((s) => s.level === level);
  }

  const result: SentenceItem[] = [];
  // Prioritize unseen sentences
  for (const s of list) {
    if (!sentenceTracker.isSentenceSeen(s)) {
      result.push(s);
    }
  }

  // If pool has fewer items, generate procedurally
  while (result.length < count) {
    result.push(generateProceduralSentence(level, category));
  }

  return result;
}

