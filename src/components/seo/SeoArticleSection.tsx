import React, { useState, useMemo } from 'react';
import { 
  Keyboard, 
  Gauge, 
  HelpCircle, 
  ChevronDown, 
  CheckCircle2, 
  Zap, 
  BookOpen,
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { useI18n, UiLanguage } from '../../context/I18nContext';

export interface FAQItem {
  id: string;
  category: 'all' | 'method' | 'speed' | 'languages' | 'battle' | 'health' | 'platform';
  question: string;
  answer: string;
}

const FAQ_DATA: Record<UiLanguage, FAQItem[]> = {
  uz: [
    {
      id: 'q1',
      category: 'method',
      question: "Klaviaturada tez yozish (touch typing) nima va nima uchun 10 barmoq texnikasi kerak?",
      answer: "Klaviaturada koʻr-koʻrona yozish (touch typing) — klaviatura tugmalariga mutlaqo qaramasdan, mushak xotirasi (muscle memory) orqali barcha 10 ta barmoq bilan matn terish mahoratidir. Ushbu texnika orqali yozish tezligingiz 2-3 barobarga oshadi (daqiqasiga 60-100+ soʻzgacha), diqqatni klaviaturaga emas, toʻgʻridan-toʻgʻri fikr va gʻoyalaringizga qaratish imkonini beradi hamda koʻz va boʻyin charchogʻini 70% ga kamaytiradi."
    },
    {
      id: 'q2',
      category: 'speed',
      question: "WPM va CPM nima, ular bir-biridan qanday farq qiladi va qanday hisoblanadi?",
      answer: "WPM (Words Per Minute) — bir daqiqada xatosiz terilgan soʻzlar sonidir. Xalqaro standart boʻyicha 1 ta soʻz 5 ta bosilgan belgiga (harf, belgi yoki boʻshliq) teng deb olinadi: formulasi: ((Toʻgʻri Belgilar / 5) / Sarflangan Daqiqa). CPM (Characters Per Minute) esa bir daqiqada bosilgan sof belgilar sonidir. Masalan, 350 CPM tezlik taxminan 70 WPM ga teng boʻladi (350 / 5 = 70)."
    },
    {
      id: 'q3',
      category: 'speed',
      question: "Yozish tezligini 20-30 WPM dan 80-100+ WPM ga oshirishning asosiy siri nima?",
      answer: "Eng muhim oltin qoida: dastlab aslo tezlik ketidan quvmang, balki 97-98%+ aniqlikka eʼtibor qarating! Shoshilmasdan, har bir harfni aynan unga biriktirilgan barmoq bilan bosing. Bir xil ritmda (metronom kabi) yozishga odatlaning. Aniqlik mustahkamlangach, miyada yangi neyron yoʻllari ochiladi va mushak xotirasi evaziga tezlik tabiiy ravishda keskin oshadi."
    },
    {
      id: 'q4',
      category: 'method',
      question: "Kuniga necha daqiqa mashq qilish tavsiya etiladi va natija qachon seziladi?",
      answer: "Kuniga atigi 15–25 daqiqa muntazam va toʻliq diqqat bilan mashq qilish kifoya. Bir kunda 3 soat mashq qilib, keyingi kunlari tashlab qoʻygandan koʻra, har kuni 20 daqiqadan shugʻullanish samaradorligi 5 barobar yuqori. Odatda 2–4 haftada sezilarli oʻsish (40–55 WPM), 2–3 oyda esa barqaror professional 75–100+ WPM koʻrsatkichiga erishiladi."
    },
    {
      id: 'q5',
      category: 'languages',
      question: "Oʻzbek tilidagi Oʻ, Gʻ, Sh, Ch harflari va tinish belgilarini qanday tez terish mumkin?",
      answer: "Yolnoma Typing Oʻzbekiston foydalanuvchilari uchun maxsus moslashtirilgan. Platformada oʻzbekcha soʻz boyligi, Oʻ, Gʻ (maxsus tutuq belgisi bilan) hamda Sh, Ch harflari boʻyicha maxsus mashqlar mavjud. Oʻng qoʻl jimjiloq barmogʻini Shift va apostrof tugmasiga toʻgʻri yoʻnaltirishni oʻrgangach, oʻzbekcha matnlarni ham inglizcha kabi yengil va tez yoza olasiz."
    },
    {
      id: 'q6',
      category: 'languages',
      question: "Platformada qanday tillar va dasturlash tillari (kod mashqlari) mavjud?",
      answer: "Platformada 125 dan ortiq jahon tillari qoʻllab-quvvatlanadi: Oʻzbekcha (Lotin va Kirill), Ingliz, Rus, Qoraqalpoq, Qozoq, Turk, Arab (RTL) va barcha asosiy tillar. Dasturchilar uchun esa JavaScript, Python, C++, HTML/CSS, Java, SQL, Rust, TypeScript va Go tillarida haqiqiy kod sintaksisi, qavslar va maxsus belgilarni tez terish rejimlari mavjud."
    },
    {
      id: 'q7',
      category: 'battle',
      question: "Speedway Battle (1v1 jonli yozish jangi) nima va doʻstlar bilan qanday bellashiladi?",
      answer: "Speedway Battle — boshqa typistlar bilan real vaqtda poyga mashinalari tarzida bellashish maydonidir. «Tezkor Bellashuv» orqali tizimdagi tasodifiy raqib bilan toʻqnashishingiz yoki «Xona Yaratish» tugmasi orqali maxsus 6 xonali kod olib, havolani doʻstingizga yuborishingiz mumkin. Ekranda har bir ishtirokchining mashinasi tezligi, xatolari va progressi jonli aks etadi."
    },
    {
      id: 'q8',
      category: 'battle',
      question: "Oʻzbekiston Milliy Reytingi (Leaderboard)ga qanday kiriladi va Anti-Cheat tizimi qanday ishlaydi?",
      answer: "Reytingga kirish uchun tizimga Google hisobingiz orqali kiring va 15, 30 yoki 60 soniyalik testlardan birini bajaring. Tizim eng yaxshi natijangizni (WPM, Aniqlik va vaqt) avtomatik reytingga kiritadi. Halol raqobatni taʼminlash uchun aqlli Anti-Cheat himoyasi tugmalar bosilish intervallari (keystroke dynamics), nusxa koʻchirish (copy-paste) va bot harakatlarini tekshirib, sunʼiy natijalarni darhol bekor qiladi."
    },
    {
      id: 'q9',
      category: 'method',
      question: "Klaviaturaga qaramaslik odatini qanday shakllantirish mumkin?",
      answer: "Klaviaturadagi F va J tugmalaridagi maxsus boʻrtiqchalar (taktil belgilar)ga eʼtibor bering. Ular koʻrsatkich barmoqlaringiz uchun «boshlangʻich maydon» (Home Row: ASDF va JKL;) hisoblanadi. Yozish paytida hatto adashib ketsangiz ham, nigohingizni ekrandan uzmang! Boshida tezlik pasayishi tabiiy, biroq 3-4 kundan soʻng barmoqlaringiz oʻz yoʻlini mustaqil topa boshlaydi."
    },
    {
      id: 'q10',
      category: 'health',
      question: "Mexanik klaviatura va membranali klaviatura: qaysi biri tez yozish uchun eng yaxshi?",
      answer: "Ikkala turdagi klaviaturada ham yuqori tezlikka erishish mumkin, biroq mexanik klaviaturalar (ayniqsa Red, Brown yoki Silver chiziqli switchlar) tugmaning tubigacha bosilishini talab qilmaydi (ishga tushish nuqtasi 1.2-2mm). Bu barmoqlar zoʻriqishini kamaytiradi, tezroq harakatlanish imkonini beradi va taktil sezuvchanlik hisobiga tezlikni 10-15% ga oshirishga koʻmaklashadi."
    },
    {
      id: 'q11',
      category: 'method',
      question: "Notoʻgʻri (2-3 ta barmoq bilan) yozish odatidan qanday qutulish mumkin?",
      answer: "Eski uslubdan toʻliq voz kechib, Yolnoma «10 Barmoq Saboqlari» boʻlimida harflarni bosqichma-bosqich oʻrganing. Dastlabki kunlarda tezligingiz 15–20 WPM ga tushib qolishi tabiiy va bu oʻrganish jarayonining ajralmas qismidir. Asosiysi, eski 2 barmoqli usulga qaytmaslik! Bir hafta ichida yangi mushak xotirasi shakllanib, avvalgi rekordingizdan ancha oʻzib ketasiz."
    },
    {
      id: 'q12',
      category: 'speed',
      question: "Tez yozish mahorati zamonaviy kasblar va oʻqishda qanday afzalliklar beradi?",
      answer: "Tez yozish — inson miyasidagi fikr oqimi bilan kompyuter ekrani oʻrtasidagi toʻsiqni olib tashlaydi. Dasturchilar, talabalar, kopirayterlar, maʼlumotlar tahlilchilari va menejerlar har kuni 4-6 soat klaviaturada ishlaydilar. 80+ WPM tezlik kuniga kamida 1.5–2 soat sof vaqtni tejaydi, diqqatni texnik terishga emas, ijodiy va mantiqiy vazifalarga qaratishga yordam beradi."
    },
    {
      id: 'q13',
      category: 'health',
      question: "Toʻgʻri oʻtirish va ergonomika: qoʻl va boʻyin salomatligini qanday asrash kerak?",
      answer: "Gavdangizni toʻgʻri tuting, bel orqa suyanchiqqa tayansin, oyoqlar polga toʻliq tegsiz. Tirsaklar burchagi taxminan 90 daraja boʻlishi, bilaklar esa stolga qattiq bosilmasdan erkin osilib turishi kerak (karpal tunnel sindromining oldini olish uchun). Har 30 daqiqada barmoq va bilaklarni yozish uchun qisqa choʻzish mashqlarini bajaring hamda koʻzlar uchun 20-20-20 qoidasiga amal qiling."
    },
    {
      id: 'q14',
      category: 'platform',
      question: "Yolnoma platformasidagi eng foydali tezkor tugmalar (Hotkeys) qaysilar?",
      answer: "Testni bir zumda qayta boshlash: Tab + Enter. Kursor fokusini matnga qaytarish yoki oynadan chiqish: Esc. Butun soʻzni birdaniga tezda oʻchirish: Ctrl + Backspace (Mac qurilmalarida Option + Backspace). Tezkor til va rejim almashtirish sichqonchaga teginmasdan klaviatura orqali qulay bajariladi."
    },
    {
      id: 'q15',
      category: 'platform',
      question: "Platformadan foydalanish mutlaqo bepulmi? Hech qanday cheklovlar yoʻqmi?",
      answer: "Ha, Yolnoma Typing 100% mutlaqo bepul, ochiq va milliy taʼlimiy platformadir. Barcha test rejimlari, 125+ tillar, batafsil tahliliy statistika, saboqlar, kundalik topshiriqlar va Speedway Battle janglari har bir foydalanuvchi uchun cheklovlarsiz ochiq. Hech qanday yashirin toʻlovlar yoki majburiy pullik obunalar mavjud emas!"
    }
  ],
  ru: [
    {
      id: 'q1',
      category: 'method',
      question: "Что такое слепая печать и зачем нужен 10-пальцевый метод?",
      answer: "Слепая печать (touch typing) — это навык ввода текста всеми десятью пальцами без взгляда на клавиатуру с использованием мышечной памяти. Этот метод увеличивает скорость в 2–3 раза (до 60–100+ слов в минуту), снижает утомляемость глаз и шеи на 70% и позволяет полностью сосредоточиться на содержании мысли."
    },
    {
      id: 'q2',
      category: 'speed',
      question: "В чем разница между WPM и CPM и как они рассчитываются?",
      answer: "WPM (Words Per Minute) — это количество слов, набранных за одну минуту (по международному стандарту 1 слово = 5 нажатий). Формула: ((Правильные символы / 5) / Минуты). CPM (Characters Per Minute) — это число знаков в минуту. Например, скорость 350 CPM соответствует 70 WPM (350 / 5 = 70)."
    },
    {
      id: 'q3',
      category: 'speed',
      question: "Как поднять скорость печати с 20-30 WPM до 80-100+ WPM?",
      answer: "Главный секрет: в начале тренируйте не скорость, а точность 97–99%! Нажимайте каждую клавишу строго закрепленным за ней пальцем и держите ровный ритм. Как только закрепится мышечная память, скорость вырастет сама собой естественным образом."
    },
    {
      id: 'q4',
      category: 'method',
      question: "Сколько времени в день нужно уделять тренировкам?",
      answer: "Достаточно 15–25 минут регулярных ежедневных занятий. Ежедневные 20 минут намного эффективнее, чем 3 часа раз в неделю. За 2–4 недели вы достигнете уверенных 45–60 WPM, а за 2–3 месяца выйдете на профессиональный уровень 80–100+ WPM."
    },
    {
      id: 'q5',
      category: 'languages',
      question: "Поддерживаются ли узбекский (латиница и кириллица), русский и английский языки?",
      answer: "Да! Yolnoma Typing идеально оптимизирован для узбекского языка (латиница со специфическими буквами Oʻ, Gʻ, Sh, Ch и кириллица), а также для русского, английского и других языков с аутентичной базой текстов."
    },
    {
      id: 'q6',
      category: 'languages',
      question: "Есть ли режим набора реального программного кода?",
      answer: "Да, для программистов доступны специализированные режимы с реальным кодом на JavaScript, Python, C++, HTML/CSS, Java, SQL, Rust и Go с акцентом на специальные символы, фигурные скобки и отступы."
    },
    {
      id: 'q7',
      category: 'battle',
      question: "Как работает режим Speedway Battle (онлайн-дуэли 1v1)?",
      answer: "Speedway Battle позволяет соревноваться с другими пользователями в реальном времени в виде гонок на машинках. Вы можете нажать «Быстрый бой» для поиска случайного соперника или «Создать комнату» и отправить код другу."
    },
    {
      id: 'q8',
      category: 'battle',
      question: "Как попасть в Национальный Рейтинг (Leaderboard) и как работает защита от читов?",
      answer: "Авторизуйтесь через Google и пройдите тест на 15, 30 или 60 секунд. Ваш рекорд сразу попадет в таблицу лидеров. Алгоритм Anti-Cheat анализирует динамику нажатий клавиш и блокирует ботов и вставку из буфера обмена."
    },
    {
      id: 'q9',
      category: 'method',
      question: "Как перестать смотреть на клавиатуру во время набора?",
      answer: "Ориентируйтесь по рельефным выступам на клавишах F и J (исходная позиция ASDF и JKL;). Даже если ошиблись, не опускайте глаза. Через 3–4 дня упорства пальцы начнут находить клавиши автоматически."
    },
    {
      id: 'q10',
      category: 'health',
      question: "Механическая клавиатура или мембранная: что выбрать для скорости?",
      answer: "Механические клавиатуры (особенно с линейными переключателями Red, Brown или Silver) срабатывают без полного прожимания клавиши до упора. Это снижает усталость пальцев и дает прирост в 10–15% к скорости."
    },
    {
      id: 'q11',
      category: 'method',
      question: "Как переучиться, если я годами печатал 2–3 пальцами?",
      answer: "Начните с раздела «Уроки слепой печати» Yolnoma с самых азов. В первые пару дней скорость может упасть до 15–20 WPM, но это нормально. Главное — не возвращаться к старой привычке, и уже через неделю вы превзойдете свой прошлый максимум."
    },
    {
      id: 'q12',
      category: 'speed',
      question: "Зачем высокая скорость печати разработчикам и офисным сотрудникам?",
      answer: "Быстрая печать убирает барьер между мыслью и экраном. Экономия 1.5–2 часов рабочего времени ежедневно позволяет сфокусироваться на архитектуре, творчестве и логике задач, а не на поиске нужной буквы."
    },
    {
      id: 'q13',
      category: 'health',
      question: "Правильная осанка и эргономика: как сберечь здоровье кистей?",
      answer: "Держите спину прямо, локти под углом 90 градусов, а запястья не прижимайте сильно к столу во избежание туннельного синдрома. Каждые 30 минут делайте разминку пальцев и соблюдайте правило 20-20-20 для глаз."
    },
    {
      id: 'q14',
      category: 'platform',
      question: "Полезные горячие клавиши (Hotkeys) на платформе Yolnoma:",
      answer: "Быстрый перезапуск теста: Tab + Enter. Сброс фокуса или выход: Esc. Удаление слова целиком: Ctrl + Backspace (Option + Backspace на Mac). Быстрое переключение без мыши."
    },
    {
      id: 'q15',
      category: 'platform',
      question: "Платформа полностью бесплатна? Есть ли платные подписки?",
      answer: "Да, Yolnoma Typing на 100% бесплатна, открыта и не имеет скрытых платежей. Все 125+ языков, статистика, битвы и уроки доступны каждому без ограничений."
    }
  ],
  en: [
    {
      id: 'q1',
      category: 'method',
      question: "What is touch typing and why is the 10-finger technique essential?",
      answer: "Touch typing is typing with all ten fingers using muscle memory without looking down at the keyboard. It increases your typing speed 2-3x (up to 60–100+ WPM), frees cognitive focus for pure ideas, and reduces neck and eye strain by over 70%."
    },
    {
      id: 'q2',
      category: 'speed',
      question: "What is the difference between WPM and CPM and how are they calculated?",
      answer: "WPM (Words Per Minute) measures the number of standardized words typed per minute (1 word = 5 keystrokes globally): ((Accurate Chars / 5) / Elapsed Minutes). CPM (Characters Per Minute) tracks raw characters per minute. For example, 350 CPM equals roughly 70 WPM (350 / 5 = 70)."
    },
    {
      id: 'q3',
      category: 'speed',
      question: "What is the golden secret to advancing from 20-30 WPM to 80-100+ WPM?",
      answer: "The number one rule: never chase raw speed at the start; prioritize 97–99% accuracy! Type each letter with its designated finger at a steady metronome rhythm. Once neural accuracy paths are locked in muscle memory, velocity accelerates exponentially on its own."
    },
    {
      id: 'q4',
      category: 'method',
      question: "How many minutes per day should I practice?",
      answer: "15–25 minutes of daily focused practice is optimal. Daily 20-minute sessions are 5 times more effective than practicing for 3 hours once a week. Most typists reach 45–60 WPM in 2–4 weeks and steady 80–100+ WPM within 2–3 months."
    },
    {
      id: 'q5',
      category: 'languages',
      question: "Can I practice Uzbek (Latin with Oʻ, Gʻ, Sh, Ch and Cyrillic) and world languages?",
      answer: "Yes! Yolnoma is purpose-built for Uzbek (both Latin and Cyrillic script with dedicated apostrophe mechanics), English, Russian, and 125+ world languages with authentic linguistic dictionaries."
    },
    {
      id: 'q6',
      category: 'languages',
      question: "Is there a real-world code typing mode for software developers?",
      answer: "Yes, developers can practice real code syntax in JavaScript, Python, C++, HTML/CSS, Java, SQL, Rust, TypeScript, and Go, mastering brackets, indentation, and special character combinations."
    },
    {
      id: 'q7',
      category: 'battle',
      question: "How does Speedway Battle (1v1 live multiplayer) work?",
      answer: "Speedway Battle allows you to race real opponents in real time. Click 'Quick Match' for instant matchmaking or 'Create Room' to get a private 6-digit code to challenge a friend or colleague."
    },
    {
      id: 'q8',
      category: 'battle',
      question: "How do I join the National Leaderboard and how does Anti-Cheat work?",
      answer: "Sign in with Google and complete a 15s, 30s, or 60s test. Your top score is automatically logged on the leaderboard. An intelligent Anti-Cheat engine analyzes keystroke timing dynamics to ban bots and paste scripts."
    },
    {
      id: 'q9',
      category: 'method',
      question: "How do I break the habit of glancing down at the keyboard?",
      answer: "Rest index fingers on the tactile bumps of F and J (the home row: ASDF and JKL;). Even when you make a mistake, keep your eyes on the screen. Within 3–4 days your fingers will map the keys effortlessly."
    },
    {
      id: 'q10',
      category: 'health',
      question: "Mechanical vs Membrane keyboard: which is better for speed typing?",
      answer: "While fast typing is possible on both, mechanical keyboards with linear switches (Red, Brown, or Silver) activate before bottoming out, easing finger fatigue and boosting typing speed by 10–15%."
    },
    {
      id: 'q11',
      category: 'method',
      question: "How can I unlearn bad 2-3 finger typing habits?",
      answer: "Start fresh with the structured 'Touch Typing Lessons' on Yolnoma. Speed will temporarily drop during the first few days, but stick to the strict finger zones and you will quickly shatter your previous personal record."
    },
    {
      id: 'q12',
      category: 'speed',
      question: "Why is high-speed typing such a game-changer in tech and modern careers?",
      answer: "Touch typing eliminates the friction between thought and computer. Writing at 80+ WPM saves 1.5–2 hours of work daily, letting developers, writers, and students stay in pure creative and cognitive flow."
    },
    {
      id: 'q13',
      category: 'health',
      question: "Ergonomics and posture: how to protect wrists and neck health?",
      answer: "Sit upright with feet flat on the floor, elbows at 90 degrees, and wrists floating without pressing hard on the desk edge to prevent carpal tunnel syndrome. Stretch every 30 minutes and practice the 20-20-20 eye rule."
    },
    {
      id: 'q14',
      category: 'platform',
      question: "What are the essential keyboard shortcuts (Hotkeys) on Yolnoma?",
      answer: "Instant restart test: Tab + Enter. Reset focus or escape modal: Esc. Delete whole word: Ctrl + Backspace (Option + Backspace on Mac). Fast, frictionless navigation without lifting hands to the mouse."
    },
    {
      id: 'q15',
      category: 'platform',
      question: "Is Yolnoma Typing 100% free? Are there any hidden subscriptions?",
      answer: "Yes, Yolnoma Typing is 100% free, open, and community-driven. All 125+ languages, deep statistics, 10-finger lessons, and multiplayer battles are unlocked with zero paywalls or subscriptions."
    }
  ]
};

const CATEGORIES: { id: FAQItem['category']; labelUz: string; labelRu: string; labelEn: string }[] = [
  { id: 'all', labelUz: "Barchasi", labelRu: "Все вопросы", labelEn: "All Questions" },
  { id: 'method', labelUz: "Metodika & Texnika", labelRu: "Методика", labelEn: "Methodology" },
  { id: 'speed', labelUz: "Tezlik & WPM", labelRu: "Скорость и WPM", labelEn: "Speed & WPM" },
  { id: 'languages', labelUz: "Tillar & Kod", labelRu: "Языки и Код", labelEn: "Languages & Code" },
  { id: 'battle', labelUz: "Reyting & Duel", labelRu: "Рейтинг и Битвы", labelEn: "Rank & Battles" },
  { id: 'health', labelUz: "Ergonomika & Salomatlik", labelRu: "Эргономика", labelEn: "Ergonomics" },
  { id: 'platform', labelUz: "Hotkeys & Imkoniyatlar", labelRu: "Платформа", labelEn: "Platform" }
];

export const SeoArticleSection: React.FC<{ onStartPractice?: () => void }> = ({ onStartPractice }) => {
  const { uiLanguage, t } = useI18n();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // First question open by default
  const [selectedCategory, setSelectedCategory] = useState<FAQItem['category']>('all');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const rawList = FAQ_DATA[uiLanguage] || FAQ_DATA.uz;

  const filteredFaqList = useMemo(() => {
    if (selectedCategory === 'all') return rawList;
    return rawList.filter(item => item.category === selectedCategory);
  }, [rawList, selectedCategory]);

  return (
    <section className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 pt-10 border-t border-[var(--sub-alt)]/60 text-[var(--text-color)] font-sans">
      {/* Article Header */}
      <header className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-[var(--main-color)]/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('guideTitle')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-color)] leading-tight mb-4">
          {t('guideHeader')}
        </h2>
        <p className="text-base sm:text-lg text-[var(--sub-color)] max-w-3xl leading-relaxed">
          {t('guideDesc')}
        </p>
      </header>

      {/* 2-Column Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center mb-4">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2.5 text-[var(--text-color)]">
              {uiLanguage === 'ru' 
                ? "Методика 10-пальцевого слепого набора" 
                : uiLanguage === 'en' 
                ? "10-Finger Touch Typing Methodology" 
                : "10 Barmoq Bilan Ko'r-Ko'rona Yozish Metodikasi"}
            </h3>
            <p className="text-sm text-[var(--sub-color)] leading-relaxed mb-4">
              {uiLanguage === 'ru'
                ? "Осознанное закрепление клавиш за каждым пальцем позволяет поднять скорость с 25 до 80–120+ слов в минуту, экономя до 2 часов рабочего времени ежедневно."
                : uiLanguage === 'en'
                ? "Assigning designated keyboard zones to each finger raises your typing speed from 25 to 80–120+ WPM, saving up to 2 hours of valuable work time each day."
                : "Har bir barmoqqa aniq klavishlar hududini biriktirish yozish tezligini daqiqasiga 80-120+ so'zgacha olib chiqadi. Bu har qanday dasturchi va talaba uchun kuniga kamida 1.5-2 soat vaqtni tejaydi."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--main-color)]">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {uiLanguage === 'ru' ? "Эргономика и здоровье кистей" : uiLanguage === 'en' ? "Ergonomic wrist health" : "Ergonomik barmoq salomatligi"}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2.5 text-[var(--text-color)]">
              {uiLanguage === 'ru'
                ? "WPM и точность: как достичь 100+ слов в минуту"
                : uiLanguage === 'en'
                ? "WPM & Accuracy: Scaling Beyond 100+ Words"
                : "WPM va Aniqlik: 100+ So'zga Qanday Chiqiladi?"}
            </h3>
            <p className="text-sm text-[var(--sub-color)] leading-relaxed mb-4">
              {uiLanguage === 'ru'
                ? "Сначала тренируйте 98%+ точность без спешки. Мышечная память зафиксирует траектории, и пальцы начнут печатать со сверхзвуковой скоростью."
                : uiLanguage === 'en'
                ? "Focus first on achieving 98%+ accuracy at a calm pace. Muscle memory will solidify key paths, and raw velocity will skyrocket naturally."
                : "Dastlab shoshilmasdan 98%+ aniqlikda mashq qiling. Mushak xotirasi harakatlarni to'g'ri mustahkamlagach, tezlik tabiiy ravishda keskin oshadi."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <Zap className="w-4 h-4" />
            <span>
              {uiLanguage === 'ru' ? "98%+ точность — залог успеха" : uiLanguage === 'en' ? "98%+ accuracy standard" : "98%+ aniqlik — muvaffaqiyat garovi"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-color)] tracking-tight">
                {t('faqTitle')}
              </h3>
              <p className="text-xs text-[var(--sub-color)]">
                {uiLanguage === 'ru'
                  ? "Ответы на ключевые вопросы о скорости, методике и платформе Yolnoma"
                  : uiLanguage === 'en'
                  ? "Answers to key questions about speed typing, methodology, and Yolnoma"
                  : "Tez yozish, 10 barmoq metodikasi va platforma bo'yicha to'liq javoblar"}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-[var(--main-color)] bg-[var(--main-color)]/10 px-2.5 py-1 rounded-full border border-[var(--main-color)]/20 self-start sm:self-auto font-bold">
            {filteredFaqList.length} {uiLanguage === 'ru' ? 'вопросов' : uiLanguage === 'en' ? 'questions' : 'ta savol-javob'}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const label = uiLanguage === 'ru' ? cat.labelRu : uiLanguage === 'en' ? cat.labelEn : cat.labelUz;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenFaqIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--main-color)] text-slate-950 font-bold shadow-sm'
                    : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] border border-[var(--sub-alt)]/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredFaqList.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[var(--card-bg)] border-[var(--main-color)]/50 shadow-md ring-1 ring-[var(--main-color)]/20'
                    : 'bg-[var(--card-bg)]/60 border-[var(--sub-alt)]/60 hover:border-[var(--sub-alt)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-[var(--text-color)] hover:text-[var(--main-color)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[var(--sub-alt)]/80 text-[var(--sub-color)] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1 leading-snug">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--sub-color)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--main-color)]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed border-t border-[var(--sub-alt)]/30 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-[var(--bg-color)]/60 border border-[var(--sub-alt)]/30 text-[var(--text-color)] leading-relaxed font-sans">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Call to Action */}
      {onStartPractice && (
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border border-cyan-500/20 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">
            {uiLanguage === 'ru'
              ? "Готовы проверить свою скорость прямо сейчас?"
              : uiLanguage === 'en'
              ? "Ready to test your typing speed right now?"
              : "Hoziroq yozish tezligingizni sinab ko'rishga tayyormisiz?"}
          </h4>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mb-5">
            {uiLanguage === 'ru'
              ? "Запустите бесплатный тест, узнайте свой WPM и начните восхождение в таблице лидеров!"
              : uiLanguage === 'en'
              ? "Start a free typing test, benchmark your WPM, and climb the national leaderboard!"
              : "Bepul testni boshlang, WPM ko'rsatkichingizni aniqlang va milliy reytingda peshqadam bo'ling!"}
          </p>
          <button
            onClick={onStartPractice}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#090d16] font-bold text-sm transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>{t('startTypingBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
