export interface EnglishWordItem {
  id: string;
  english: string;
  uzbek: string;
  phonetic: string;
  explanation?: string;
  exampleSentence?: string;
  exampleUzbek?: string;
}

export interface EnglishLesson {
  id: number;
  levelId: number;
  levelName: string;
  levelBadge: string;
  levelColor: string;
  unitNumber: number; // 1 to 7 (5 lessons per unit)
  title: string;
  subtitle: string;
  description: string;
  iconName?: string;
  items: EnglishWordItem[];
}

export interface CourseLevel {
  id: number;
  name: string;
  badge: string;
  color: string;
  bgGlow: string;
  description: string;
  ieltsTarget: string;
  cefr: string;
  totalLessons: number;
}

export const COURSE_LEVELS: CourseLevel[] = [
  {
    id: 1,
    name: "0 - Alifbo va Tovushlar",
    badge: "Alphabet & Phonics",
    color: "#38bdf8",
    bgGlow: "rgba(56, 189, 248, 0.15)",
    description: "Ingliz alifbosi, harflar, tovushlar va eng birinchi boshlang'ich so'zlar.",
    ieltsTarget: "Band 1.0 - 2.0",
    cefr: "Pre-A1",
    totalLessons: 5
  },
  {
    id: 2,
    name: "A1 - Boshlang'ich (Beginner)",
    badge: "A1 Beginner",
    color: "#34d399",
    bgGlow: "rgba(52, 211, 153, 0.15)",
    description: "Salomlashish, tanishuv, oila, raqamlar, ranglar va kundalik eng zarur so'zlar.",
    ieltsTarget: "Band 3.0 - 3.5",
    cefr: "A1",
    totalLessons: 5
  },
  {
    id: 3,
    name: "A2 - Elementar Muloqot",
    badge: "A2 Elementary",
    color: "#facc15",
    bgGlow: "rgba(250, 204, 21, 0.15)",
    description: "Do'konda, restoranda, shaharda yo'l so'rash, ob-havo va oddiy suhbatlar.",
    ieltsTarget: "Band 4.0 - 4.5",
    cefr: "A2",
    totalLessons: 5
  },
  {
    id: 4,
    name: "B1 - O'rta Daraja (Intermediate)",
    badge: "B1 Intermediate",
    color: "#fb923c",
    bgGlow: "rgba(251, 146, 60, 0.15)",
    description: "Sayohat, do'stlar bilan jonli dialoglar, fikr bildirish va kundalik iboralar.",
    ieltsTarget: "Band 5.0 - 5.5",
    cefr: "B1",
    totalLessons: 5
  },
  {
    id: 5,
    name: "B2 - Ravon So'zlashuv",
    badge: "B2 Upper-Int",
    color: "#f43f5e",
    bgGlow: "rgba(244, 63, 94, 0.15)",
    description: "Jonli idiomalar, ishbilarmonlik, texnologiya va fikrni erkin tushuntirish.",
    ieltsTarget: "Band 6.0 - 6.5",
    cefr: "B2",
    totalLessons: 5
  },
  {
    id: 6,
    name: "C1 - Professional / Yuqori",
    badge: "C1 Advanced",
    color: "#a855f7",
    bgGlow: "rgba(168, 85, 247, 0.15)",
    description: "Murakkab leksika, boy kollokatsiyalar, iqtisodiyot va falsafiy mulohaza.",
    ieltsTarget: "Band 7.0 - 7.5",
    cefr: "C1",
    totalLessons: 5
  },
  {
    id: 7,
    name: "IELTS 8.5 - 9.0 Master (C2)",
    badge: "IELTS 9 / C2 Master",
    color: "#e2b714",
    bgGlow: "rgba(226, 183, 20, 0.22)",
    description: "Haqiqiy IELTS 9 darajadagi akademik insho, murakkab grammatika va oliy so'z boyligi.",
    ieltsTarget: "Band 8.5 - 9.0",
    cefr: "C2",
    totalLessons: 5
  }
];

export const ENGLISH_LESSONS: EnglishLesson[] = [
  // ==============================================================
  // UNIT 1: ALPHABET & PHONICS (Dars 1 - 5)
  // ==============================================================
  {
    id: 1,
    levelId: 1,
    levelName: "0 - Alifbo va Tovushlar",
    levelBadge: "Alphabet",
    levelColor: "#38bdf8",
    unitNumber: 1,
    title: "1-Dars: A dan E gacha Harflar",
    subtitle: "A, B, C, D, E harflari va birinchi so'zlar",
    description: "Harflarni klaviaturada to'g'ri terish, tovushlarni eshitish va ularga oid so'zlarni yozish.",
    items: [
      {
        id: "1-1",
        english: "A",
        uzbek: "A harfi (Ey)",
        phonetic: "/eɪ/",
        explanation: "Ingliz alifbosining 1-harfi. Misol: Apple (Olma).",
        exampleSentence: "A is for Apple.",
        exampleUzbek: "A harfi Apple (Olma) so'zi uchun."
      },
      {
        id: "1-2",
        english: "apple",
        uzbek: "olma",
        phonetic: "/ˈæp.əl/",
        explanation: "Meva nomi. Ko'p ishlatiladigan dastlabki so'z.",
        exampleSentence: "I like this red apple.",
        exampleUzbek: "Menga bu qizil olma yoqadi."
      },
      {
        id: "1-3",
        english: "B",
        uzbek: "B harfi (Bi)",
        phonetic: "/biː/",
        explanation: "Ingliz alifbosining 2-harfi. Misol: Ball (Koptok).",
        exampleSentence: "B is for Ball.",
        exampleUzbek: "B harfi Ball (Koptok) uchun."
      },
      {
        id: "1-4",
        english: "book",
        uzbek: "kitob",
        phonetic: "/bʊk/",
        explanation: "Kitob so'zi 'b' harfi bilan boshlanadi.",
        exampleSentence: "This is my English book.",
        exampleUzbek: "Bu mening ingliz tili kitobim."
      },
      {
        id: "1-5",
        english: "C",
        uzbek: "C harfi (Si)",
        phonetic: "/siː/",
        explanation: "3-harf. Ko'pincha 'k' yoki 's' tovushini beradi.",
        exampleSentence: "C is for Cat.",
        exampleUzbek: "C harfi Cat (Mushuk) uchun."
      },
      {
        id: "1-6",
        english: "cat",
        uzbek: "mushuk",
        phonetic: "/kæt/",
        explanation: "Mushuk so'zida 'C' harfi 'K' tovushi beradi.",
        exampleSentence: "The cat is sleeping.",
        exampleUzbek: "Mushuk uxlamoqda."
      },
      {
        id: "1-7",
        english: "D",
        uzbek: "D harfi (Di)",
        phonetic: "/diː/",
        explanation: "4-harf. Misol: Dog (It).",
        exampleSentence: "D is for Dog.",
        exampleUzbek: "D harfi Dog (It) uchun."
      },
      {
        id: "1-8",
        english: "dog",
        uzbek: "kuchuk / it",
        phonetic: "/dɒɡ/",
        explanation: "It, vafodor uy hayvoni.",
        exampleSentence: "My dog is friendly.",
        exampleUzbek: "Mening itim do'stona."
      },
      {
        id: "1-9",
        english: "E",
        uzbek: "E harfi (I)",
        phonetic: "/iː/",
        explanation: "5-harf. Unli tovush.",
        exampleSentence: "E is for Elephant.",
        exampleUzbek: "E harfi Fil so'zi uchun."
      },
      {
        id: "1-10",
        english: "egg",
        uzbek: "tuxum",
        phonetic: "/eɡ/",
        explanation: "Nonushtada iste'mol qilinadigan tuxum.",
        exampleSentence: "I eat an egg for breakfast.",
        exampleUzbek: "Men nonushtaga tuxum yeyman."
      }
    ]
  },
  {
    id: 2,
    levelId: 1,
    levelName: "0 - Alifbo va Tovushlar",
    levelBadge: "Alphabet",
    levelColor: "#38bdf8",
    unitNumber: 1,
    title: "2-Dars: F dan J gacha Harflar",
    subtitle: "F, G, H, I, J harflari va so'zlar",
    description: "Keyingi harflarni o'rganish, tovushlarni to'g'ri talaffuz qilish va terish mashqi.",
    items: [
      { id: "2-1", english: "F", uzbek: "F harfi (Ef)", phonetic: "/ef/", explanation: "F harfi lab-tish tovushi." },
      { id: "2-2", english: "fish", uzbek: "baliq", phonetic: "/fɪʃ/", exampleSentence: "A small fish swims fast.", exampleUzbek: "Kichik baliq tez suzadi." },
      { id: "2-3", english: "G", uzbek: "G harfi (Dji)", phonetic: "/dʒiː/", explanation: "G harfi 'g' yoki 'j' o'qilishi mumkin." },
      { id: "2-4", english: "girl", uzbek: "qiz bola", phonetic: "/ɡɜːl/", exampleSentence: "The girl is reading a story.", exampleUzbek: "Qiz hikoya o'qiyapti." },
      { id: "2-5", english: "H", uzbek: "H harfi (Eych)", phonetic: "/eɪtʃ/", explanation: "Yengil nafasli 'H' tovushi." },
      { id: "2-6", english: "hat", uzbek: "shlyapa / bosh kiyim", phonetic: "/hæt/", exampleSentence: "He wears a black hat.", exampleUzbek: "U qora shlyapa kiygan." },
      { id: "2-7", english: "I", uzbek: "I harfi (Ay)", phonetic: "/aɪ/", explanation: "Ingliz tilida 'Men' ma'nosini ham anglatadi." },
      { id: "2-8", english: "ice", uzbek: "muz", phonetic: "/aɪs/", exampleSentence: "Ice is very cold.", exampleUzbek: "Muz juda sovuq." },
      { id: "2-9", english: "J", uzbek: "J harfi (Djay)", phonetic: "/dʒeɪ/", explanation: "Klaviaturadagi o'ng qo'l ko'rsatkich barmog'i turadigan asosiy harf." },
      { id: "2-10", english: "juice", uzbek: "sharbat", phonetic: "/dʒuːs/", exampleSentence: "Fresh orange juice is tasty.", exampleUzbek: "Yangi apelsin sharbati mazali." }
    ]
  },
  {
    id: 3,
    levelId: 1,
    levelName: "0 - Alifbo va Tovushlar",
    levelBadge: "Alphabet",
    levelColor: "#38bdf8",
    unitNumber: 1,
    title: "3-Dars: K dan O gacha Harflar",
    subtitle: "K, L, M, N, O harflari va so'zlar",
    description: "O'rta qatlam va yuqori qatlam harflari yordamida yangi so'zlarni shakllantirish.",
    items: [
      { id: "3-1", english: "K", uzbek: "K harfi (Key)", phonetic: "/keɪ/" },
      { id: "3-2", english: "kite", uzbek: "varrak", phonetic: "/kaɪt/", exampleSentence: "The kite flies high in the sky.", exampleUzbek: "Varrak osmonda baland uchadi." },
      { id: "3-3", english: "L", uzbek: "L harfi (El)", phonetic: "/el/" },
      { id: "3-4", english: "lemon", uzbek: "limon", phonetic: "/ˈlem.ən/", exampleSentence: "Lemon is sour and yellow.", exampleUzbek: "Limon nordon va sariq." },
      { id: "3-5", english: "M", uzbek: "M harfi (Em)", phonetic: "/em/" },
      { id: "3-6", english: "moon", uzbek: "oy (falakdagi)", phonetic: "/muːn/", exampleSentence: "The moon shines at night.", exampleUzbek: "Tunda oy porlaydi." },
      { id: "3-7", english: "N", uzbek: "N harfi (En)", phonetic: "/en/" },
      { id: "3-8", english: "nest", uzbek: "uya (qush inisi)", phonetic: "/nest/", exampleSentence: "The birds built a nest.", exampleUzbek: "Qushlar uya qurdilar." },
      { id: "3-9", english: "O", uzbek: "O harfi (Ou)", phonetic: "/oʊ/" },
      { id: "3-10", english: "orange", uzbek: "apelsin", phonetic: "/ˈɒr.ɪndʒ/", exampleSentence: "I love sweet oranges.", exampleUzbek: "Men shirin apelsinlarni yaxshi ko'raman." }
    ]
  },
  {
    id: 4,
    levelId: 1,
    levelName: "0 - Alifbo va Tovushlar",
    levelBadge: "Alphabet",
    levelColor: "#38bdf8",
    unitNumber: 1,
    title: "4-Dars: P dan T gacha Harflar",
    subtitle: "P, Q, R, S, T harflari va so'zlar",
    description: "Eng faol harflar bilan tanishuv va ularni barmoqlar bilan tez yozish ko'nikmasi.",
    items: [
      { id: "4-1", english: "P", uzbek: "P harfi (Pi)", phonetic: "/piː/" },
      { id: "4-2", english: "pen", uzbek: "ruchka", phonetic: "/pen/", exampleSentence: "Write with a blue pen.", exampleUzbek: "Ko'k ruchka bilan yozing." },
      { id: "4-3", english: "Q", uzbek: "Q harfi (Kyu)", phonetic: "/kjuː/" },
      { id: "4-4", english: "queen", uzbek: "qirolicha", phonetic: "/kwiːn/", exampleSentence: "The queen lived in a castle.", exampleUzbek: "Qirolicha qasrda yashardi." },
      { id: "4-5", english: "R", uzbek: "R harfi (Ar)", phonetic: "/ɑːr/" },
      { id: "4-6", english: "red", uzbek: "qizil", phonetic: "/red/", exampleSentence: "She has a red dress.", exampleUzbek: "Uning qizil ko'ylagi bor." },
      { id: "4-7", english: "S", uzbek: "S harfi (Es)", phonetic: "/es/" },
      { id: "4-8", english: "sun", uzbek: "quyosh", phonetic: "/sʌn/", exampleSentence: "The sun gives light and warmth.", exampleUzbek: "Quyosh nur va iliqlik beradi." },
      { id: "4-9", english: "T", uzbek: "T harfi (Ti)", phonetic: "/tiː/" },
      { id: "4-10", english: "tree", uzbek: "daraxt", phonetic: "/triː/", exampleSentence: "A big green tree.", exampleUzbek: "Katta yashil daraxt." }
    ]
  },
  {
    id: 5,
    levelId: 1,
    levelName: "0 - Alifbo va Tovushlar",
    levelBadge: "Alphabet",
    levelColor: "#38bdf8",
    unitNumber: 1,
    title: "5-Dars: U dan Z gacha Harflar",
    subtitle: "Alifboni to'liq yakunlash: U, V, W, X, Y, Z",
    description: "Ingliz alifbosining oxirgi harflari va to'liq alifbo bo'yicha mustahkamlash.",
    items: [
      { id: "5-1", english: "U", uzbek: "U harfi (Yu)", phonetic: "/juː/" },
      { id: "5-2", english: "umbrella", uzbek: "soyabon", phonetic: "/ʌmˈbrel.ə/", exampleSentence: "Take an umbrella when it rains.", exampleUzbek: "Yomg'ir yoqqanda soyabon oling." },
      { id: "5-3", english: "V", uzbek: "V harfi (Vi)", phonetic: "/viː/" },
      { id: "5-4", english: "van", uzbek: "furgon mashina", phonetic: "/væn/", exampleSentence: "The delivery van arrived.", exampleUzbek: "Yetkazib berish mashinasi yetib keldi." },
      { id: "5-5", english: "W", uzbek: "W harfi (Dabl-yu)", phonetic: "/ˈdʌb.əl.juː/" },
      { id: "5-6", english: "water", uzbek: "suv", phonetic: "/ˈwɔː.tər/", exampleSentence: "Clean water is essential for life.", exampleUzbek: "Toza suv hayot uchun zarurdir." },
      { id: "5-7", english: "X", uzbek: "X harfi (Eks)", phonetic: "/eks/" },
      { id: "5-8", english: "box", uzbek: "quti", phonetic: "/bɒks/", exampleSentence: "Open the surprise box.", exampleUzbek: "Kutilmagan qutini oching." },
      { id: "5-9", english: "Y", uzbek: "Y harfi (Uay)", phonetic: "/waɪ/" },
      { id: "5-10", english: "yellow", uzbek: "sariq", phonetic: "/ˈjel.oʊ/", exampleSentence: "The sunflowers are yellow.", exampleUzbek: "Kungaboqarlar sariq rangda." },
      { id: "5-11", english: "Z", uzbek: "Z harfi (Zed / Zi)", phonetic: "/zed/" },
      { id: "5-12", english: "zebra", uzbek: "zebra", phonetic: "/ˈzeb.rə/", exampleSentence: "A zebra has black and white stripes.", exampleUzbek: "Zebrada qora va oq chiziqlar bor." }
    ]
  },

  // ==============================================================
  // UNIT 2: A1 BEGINNER (Dars 6 - 10)
  // ==============================================================
  {
    id: 6,
    levelId: 2,
    levelName: "A1 - Boshlang'ich",
    levelBadge: "A1 Beginner",
    levelColor: "#34d399",
    unitNumber: 2,
    title: "6-Dars: Salomlashish & Tanishuv",
    subtitle: "Hello, My name is, Nice to meet you",
    description: "Ingliz tilida odamlar bilan suhbat boshlash, o'zini tanishtirish va salomlashish iboralari.",
    items: [
      { id: "6-1", english: "Hello!", uzbek: "Salom!", phonetic: "/həˈloʊ/", exampleSentence: "Hello! How are you today?", exampleUzbek: "Salom! Bugun ahvolingiz qanday?" },
      { id: "6-2", english: "Good morning", uzbek: "Xayrli tong", phonetic: "/ɡʊd ˈmɔː.nɪŋ/", exampleSentence: "Good morning, everyone!", exampleUzbek: "Xayrli tong, barchaga!" },
      { id: "6-3", english: "Good evening", uzbek: "Xayrli kech", phonetic: "/ɡʊd ˈiːv.nɪŋ/", exampleSentence: "Good evening, welcome to our home.", exampleUzbek: "Xayrli kech, uyimizga xush kelibsiz." },
      { id: "6-4", english: "My name is John", uzbek: "Mening ismim Jon", phonetic: "/maɪ neɪm ɪz dʒɒn/", exampleSentence: "My name is John, nice to meet you.", exampleUzbek: "Mening ismim Jon, siz bilan tanishganimdan xursandman." },
      { id: "6-5", english: "Nice to meet you", uzbek: "Tanishganimdan xursandman", phonetic: "/naɪs tuː miːt juː/", exampleSentence: "It is very nice to meet you.", exampleUzbek: "Siz bilan tanishganimdan juda xursandman." },
      { id: "6-6", english: "How are you?", uzbek: "Qalaysiz? / Ahvollaringiz qanday?", phonetic: "/haʊ ɑːr juː/", exampleSentence: "Hi friend, how are you doing?", exampleUzbek: "Salom do'stim, ahvollaring qanday?" },
      { id: "6-7", english: "I am fine, thank you", uzbek: "Men yaxshiman, rahmat", phonetic: "/aɪ æm faɪn θæŋk juː/", exampleSentence: "I am fine, thank you. And you?", exampleUzbek: "Men yaxshiman, rahmat. O'zingiz-chi?" },
      { id: "6-8", english: "Goodbye!", uzbek: "Xayr! / Ko'rishguncha!", phonetic: "/ˌɡʊdˈbaɪ/", exampleSentence: "Goodbye, have a great day!", exampleUzbek: "Xayr, kuningiz ajoyib o'tsin!" }
    ]
  },
  {
    id: 7,
    levelId: 2,
    levelName: "A1 - Boshlang'ich",
    levelBadge: "A1 Beginner",
    levelColor: "#34d399",
    unitNumber: 2,
    title: "7-Dars: Oila va Yaqinlar",
    subtitle: "Mother, Father, Brother, Sister, Family",
    description: "Oila a'zolari va yaqinlar haqida inglizcha gaplashishni o'rganing.",
    items: [
      { id: "7-1", english: "family", uzbek: "oila", phonetic: "/ˈfæm.əl.i/", exampleSentence: "I love my family so much.", exampleUzbek: "Men oilamni juda yaxshi ko'raman." },
      { id: "7-2", english: "mother", uzbek: "ona / onam", phonetic: "/ˈmʌð.ər/", exampleSentence: "My mother is very kind and caring.", exampleUzbek: "Mening onam juda mehribon va g'amxo'r." },
      { id: "7-3", english: "father", uzbek: "ota / otam", phonetic: "/ˈfɑː.ðər/", exampleSentence: "My father works as an engineer.", exampleUzbek: "Mening otam muhandis bo'lib ishlaydi." },
      { id: "7-4", english: "brother", uzbek: "aka yoki uka", phonetic: "/ˈbrʌð.ər/", exampleSentence: "My brother plays football very well.", exampleUzbek: "Mening ukam futbolni juda yaxshi o'ynaydi." },
      { id: "7-5", english: "sister", uzbek: "opa yoki singil", phonetic: "/ˈsɪs.tər/", exampleSentence: "My sister loves learning English.", exampleUzbek: "Mening opam ingliz tilini o'rganishni yaxshi ko'radi." },
      { id: "7-6", english: "friend", uzbek: "do'st", phonetic: "/frend/", exampleSentence: "A true friend is always there for you.", exampleUzbek: "Haqiqiy do'st har doim yoningda bo'ladi." },
      { id: "7-7", english: "This is my brother", uzbek: "Bu mening ukam (akam)", phonetic: "/ðɪs ɪz maɪ ˈbrʌð.ər/", exampleSentence: "This is my brother, his name is Aziz.", exampleUzbek: "Bu mening ukam, uning ismi Aziz." }
    ]
  },
  {
    id: 8,
    levelId: 2,
    levelName: "A1 - Boshlang'ich",
    levelBadge: "A1 Beginner",
    levelColor: "#34d399",
    unitNumber: 2,
    title: "8-Dars: Raqamlar va Vaqt",
    subtitle: "Numbers, Clock, Days and Time",
    description: "Raqamlarni to'g'ri yozish, soatni so'rash va vaqt bilan bog'liq asosiy iboralar.",
    items: [
      { id: "8-1", english: "one, two, three", uzbek: "bir, ikki, uch", phonetic: "/wʌn, tuː, θriː/", exampleSentence: "Count: one, two, three.", exampleUzbek: "Sana: bir, ikki, uch." },
      { id: "8-2", english: "four, five, six", uzbek: "to'rt, besh, olti", phonetic: "/fɔːr, faɪv, sɪks/" },
      { id: "8-3", english: "seven, eight, nine, ten", uzbek: "yetti, sakkiz, to'qqiz, o'n", phonetic: "/ˈsev.ən, eɪt, naɪn, ten/" },
      { id: "8-4", english: "What time is it?", uzbek: "Soat necha bo'ldi?", phonetic: "/wɒt taɪm ɪz ɪt/", exampleSentence: "Excuse me, what time is it now?", exampleUzbek: "Kechirasiz, hozir soat necha bo'ldi?" },
      { id: "8-5", english: "It is five o'clock", uzbek: "Soat roppa-rosa besh", phonetic: "/ɪt ɪz faɪv əˈklɒk/", exampleSentence: "The lesson starts at five o'clock.", exampleUzbek: "Dars soat beshda boshlanadi." },
      { id: "8-6", english: "today and tomorrow", uzbek: "bugun va ertaga", phonetic: "/təˈdeɪ ænd təˈmɒr.oʊ/", exampleSentence: "I am busy today, let's meet tomorrow.", exampleUzbek: "Men bugun bandman, ertaga uchrashaylik." }
    ]
  },
  {
    id: 9,
    levelId: 2,
    levelName: "A1 - Boshlang'ich",
    levelBadge: "A1 Beginner",
    levelColor: "#34d399",
    unitNumber: 2,
    title: "9-Dars: Ranglar & Sifatlar",
    subtitle: "Colors, Big, Small, Beautiful, Happy",
    description: "Atrofdagi narsalarni tasvirlash: ranglar, o'lchamlar va kayfiyat sifatlari.",
    items: [
      { id: "9-1", english: "blue sky", uzbek: "moviy osmon", phonetic: "/bluː skaɪ/", exampleSentence: "Look at the clear blue sky.", exampleUzbek: "Musaffo moviy osmonga qara." },
      { id: "9-2", english: "green tree", uzbek: "yashil daraxt", phonetic: "/ɡriːn triː/", exampleSentence: "The green tree gives good shade.", exampleUzbek: "Yashil daraxt yaxshi soya beradi." },
      { id: "9-3", english: "big city", uzbek: "katta shahar", phonetic: "/bɪɡ ˈsɪt.i/", exampleSentence: "Tashkent is a very big city.", exampleUzbek: "Toshkent juda katta shahar." },
      { id: "9-4", english: "small gift", uzbek: "kichik sovg'a", phonetic: "/smɔːl ɡɪft/", exampleSentence: "I have a small gift for you.", exampleUzbek: "Siz uchun kichik sovg'am bor." },
      { id: "9-5", english: "happy family", uzbek: "baxtli oila", phonetic: "/ˈhæp.i ˈfæm.əl.i/", exampleSentence: "They are a very happy family.", exampleUzbek: "Ular juda baxtli oila." },
      { id: "9-6", english: "beautiful day", uzbek: "go'zal kun", phonetic: "/ˈbjuː.tɪ.fəl deɪ/", exampleSentence: "It is such a beautiful day today.", exampleUzbek: "Bugun shunchalik go'zal kun." }
    ]
  },
  {
    id: 10,
    levelId: 2,
    levelName: "A1 - Boshlang'ich",
    levelBadge: "A1 Beginner",
    levelColor: "#34d399",
    unitNumber: 2,
    title: "10-Dars: Kundalik Harakat Fe'llari",
    subtitle: "Eat, Drink, Go, Come, See, Speak, Read",
    description: "Eng ko'p ishlatiladigan kundalik asosiy fe'llar va sodda gaplar tuzish.",
    items: [
      { id: "10-1", english: "I speak English", uzbek: "Men inglizcha gapiraman", phonetic: "/aɪ spiːk ˈɪŋ.ɡlɪʃ/", exampleSentence: "I speak English every single day.", exampleUzbek: "Men har kuni inglizcha gapiraman." },
      { id: "10-2", english: "I read books", uzbek: "Men kitoblar o'qiyman", phonetic: "/aɪ riːd bʊks/", exampleSentence: "I read interesting books at night.", exampleUzbek: "Men kechqurun qiziqarli kitoblar o'qiyman." },
      { id: "10-3", english: "I drink water", uzbek: "Men suv ichaman", phonetic: "/aɪ drɪŋk ˈwɔː.tər/", exampleSentence: "I drink plenty of water every morning.", exampleUzbek: "Men har tong ko'p suv ichaman." },
      { id: "10-4", english: "I go to school", uzbek: "Men maktabga boraman", phonetic: "/aɪ ɡoʊ tuː skuːl/", exampleSentence: "I go to school by bus.", exampleUzbek: "Men maktabga avtobusda boraman." },
      { id: "10-5", english: "I want to learn", uzbek: "Men o'rganishni xohlayman", phonetic: "/aɪ wɒnt tuː lɜːn/", exampleSentence: "I want to learn English fast.", exampleUzbek: "Men ingliz tilini tez o'rganishni xohlayman." }
    ]
  },

  // ==============================================================
  // UNIT 3: A2 ELEMENTARY (Dars 11 - 15)
  // ==============================================================
  {
    id: 11,
    levelId: 3,
    levelName: "A2 - Elementar Muloqot",
    levelBadge: "A2 Elementary",
    levelColor: "#facc15",
    unitNumber: 3,
    title: "11-Dars: Shaharda Yo'l So'rash",
    subtitle: "Where is the bank? Turn left, Go straight",
    description: "Chet elda adashmasdan yo'l topish va joylashuvni so'rash suhbati.",
    items: [
      { id: "11-1", english: "Excuse me, where is the station?", uzbek: "Kechirasiz, bekat qayerda joylashgan?", phonetic: "/ɪkˈskjuːz miː, weər ɪz ðə ˈsteɪ.ʃən/", exampleSentence: "Excuse me, where is the nearest metro station?", exampleUzbek: "Kechirasiz, eng yaqin metro bekati qayerda?" },
      { id: "11-2", english: "Go straight ahead", uzbek: "To'g'riga qarab boring", phonetic: "/ɡoʊ streɪt əˈhed/", exampleSentence: "Go straight ahead for two blocks.", exampleUzbek: "Ikki kvartal to'g'riga qarab boring." },
      { id: "11-3", english: "Turn left at the corner", uzbek: "Burchakdan chapga buriling", phonetic: "/tɜːn left æt ðə ˈkɔː.nər/", exampleSentence: "Turn left at the corner and you will see it.", exampleUzbek: "Burchakdan chapga buriling va uni ko'rasiz." },
      { id: "11-4", english: "Turn right at the traffic light", uzbek: "Svetofordan o'ngga buriling", phonetic: "/tɜːn raɪt æt ðə ˈtræf.ɪk laɪt/", exampleSentence: "Turn right at the traffic light.", exampleUzbek: "Svetofordan o'ngga buriling." },
      { id: "11-5", english: "Is it far from here?", uzbek: "Bu yerdan uzoqmi?", phonetic: "/ɪz ɪt fɑːr frɒm hɪər/", exampleSentence: "No, it is only a five-minute walk.", exampleUzbek: "Yo'q, piyoda bor-yo'g'i besh daqiqalik yo'l." }
    ]
  },
  {
    id: 12,
    levelId: 3,
    levelName: "A2 - Elementar Muloqot",
    levelBadge: "A2 Elementary",
    levelColor: "#facc15",
    unitNumber: 3,
    title: "12-Dars: Do'kon & Savdo-Sotiq",
    subtitle: "How much is this? Can I pay by card?",
    description: "Do'konda narx so'rash, kiyim o'lchamini bilish va to'lov qilish jumlalari.",
    items: [
      { id: "12-1", english: "How much is this jacket?", uzbek: "Bu kurtka qancha turadi?", phonetic: "/haʊ mʌtʃ ɪz ðɪs ˈdʒæk.ɪt/", exampleSentence: "Excuse me, how much is this jacket?", exampleUzbek: "Kechirasiz, bu kurtka qancha turadi?" },
      { id: "12-2", english: "Can I try this on?", uzbek: "Buni kiyib ko'rsam bo'ladimi?", phonetic: "/kæn aɪ traɪ ðɪs ɒn/", exampleSentence: "Can I try this on in medium size?", exampleUzbek: "Buning o'rtacha (M) o'lchamini kiyib ko'rsam bo'ladimi?" },
      { id: "12-3", english: "Do you accept credit cards?", uzbek: "Siz karta orqali to'lov qabul qilasizmi?", phonetic: "/duː juː əkˈsept ˈkred.ɪt kɑːdz/", exampleSentence: "Do you accept credit cards or cash only?", exampleUzbek: "Karta qabul qilasizmi yoki faqat naqdmi?" },
      { id: "12-4", english: "It is too expensive", uzbek: "Bu juda qimmat", phonetic: "/ɪt ɪz tuː ɪkˈspen.sɪv/", exampleSentence: "It is too expensive, do you have a discount?", exampleUzbek: "Bu juda qimmat, chegirmangiz bormi?" },
      { id: "12-5", english: "Can I get a receipt?", uzbek: "Chek (kvitansiya) olsam bo'ladimi?", phonetic: "/kæn aɪ ɡet ə rɪˈsiːt/", exampleSentence: "Can I get a receipt for my purchase?", exampleUzbek: "Xaridim uchun chek olsam bo'ladimi?" }
    ]
  },
  {
    id: 13,
    levelId: 3,
    levelName: "A2 - Elementar Muloqot",
    levelBadge: "A2 Elementary",
    levelColor: "#facc15",
    unitNumber: 3,
    title: "13-Dars: Restoran va Kafeda Buyurtma",
    subtitle: "I would like to order, The bill please",
    description: "Ofitsiant bilan muloqot, taom buyurtma qilish va hisobni to'lash.",
    items: [
      { id: "13-1", english: "A table for two, please", uzbek: "Ikki kishilik stol, iltimos", phonetic: "/ə ˈteɪ.bəl fɔːr tuː pliːz/", exampleSentence: "Hello, a table for two, please.", exampleUzbek: "Salom, ikki kishilik stol, iltimos." },
      { id: "13-2", english: "Could we see the menu?", uzbek: "Menyuni ko'rsak bo'ladimi?", phonetic: "/kʊd wiː siː ðə ˈmen.juː/", exampleSentence: "Could we see the drinks menu, please?", exampleUzbek: "Ichimliklar menyusini ko'rsak bo'ladimi, iltimos?" },
      { id: "13-3", english: "I would like to order tea", uzbek: "Men choy buyurtma qilmoqchiman", phonetic: "/aɪ wʊd laɪk tuː ˈɔː.dər tiː/", exampleSentence: "I would like to order green tea without sugar.", exampleUzbek: "Men shakarsiz ko'k choy buyurtma qilmoqchiman." },
      { id: "13-4", english: "The food is delicious", uzbek: "Ovqat juda mazali", phonetic: "/ðə fuːd ɪz dɪˈlɪʃ.əs/", exampleSentence: "Thank you, the food is delicious!", exampleUzbek: "Rahmat, ovqat juda mazali!" },
      { id: "13-5", english: "Could we have the bill, please?", uzbek: "Hisobni olib kelsangiz, iltimos?", phonetic: "/kʊd wiː hæv ðə bɪl pliːz/", exampleSentence: "Excuse me, could we have the bill, please?", exampleUzbek: "Kechirasiz, hisobni olib kelsangiz, iltimos?" }
    ]
  },
  {
    id: 14,
    levelId: 3,
    levelName: "A2 - Elementar Muloqot",
    levelBadge: "A2 Elementary",
    levelColor: "#facc15",
    unitNumber: 3,
    title: "14-Dars: Kasblar va Ish Faoliyati",
    subtitle: "What is your job? I work as a developer",
    description: "O'z kasbi, ish joyi va mutaxassisligi haqida erkin gapirish.",
    items: [
      { id: "14-1", english: "What do you do for a living?", uzbek: "Nima kasb bilan shug'ullanasiz?", phonetic: "/wɒt duː juː duː fɔːr ə ˈlɪv.ɪŋ/", exampleSentence: "So, what do you do for a living?", exampleUzbek: "Xo'sh, tirikchilik uchun nima kasb qilasiz?" },
      { id: "14-2", english: "I work as a software engineer", uzbek: "Men dasturchi-muhandis bo'lib ishlayman", phonetic: "/aɪ wɜːk æz ə ˈsɒft.weər ˌen.dʒɪˈnɪər/", exampleSentence: "I work as a software engineer in an IT firm.", exampleUzbek: "Men IT firmasida dasturchi muhandis bo'lib ishlayman." },
      { id: "14-3", english: "She is a skilled teacher", uzbek: "U mohir o'qituvchi", phonetic: "/ʃiː ɪz ə skɪld ˈtiː.tʃər/", exampleSentence: "She is a skilled English teacher.", exampleUzbek: "U mohir ingliz tili o'qituvchisidir." },
      { id: "14-4", english: "I enjoy working in a team", uzbek: "Menga jamoada ishlash yoqadi", phonetic: "/aɪ ɪnˈdʒɔɪ ˈwɜː.kɪŋ ɪn ə tiːm/", exampleSentence: "I enjoy working in a friendly team.", exampleUzbek: "Menga ahil jamoada ishlash yoqadi." }
    ]
  },
  {
    id: 15,
    levelId: 3,
    levelName: "A2 - Elementar Muloqot",
    levelBadge: "A2 Elementary",
    levelColor: "#facc15",
    unitNumber: 3,
    title: "15-Dars: Ob-havo va Kayfiyat",
    subtitle: "It is sunny today, I feel energetic",
    description: "Ob-havo holati va insonning ruhiy kayfiyatini tasvirlovchi dialoglar.",
    items: [
      { id: "15-1", english: "What is the weather like today?", uzbek: "Bugun ob-havo qanday?", phonetic: "/wɒt ɪz ðə ˈweð.ər laɪk təˈdeɪ/", exampleSentence: "What is the weather like outside?", exampleUzbek: "Tashqarida ob-havo qanday?" },
      { id: "15-2", english: "It is sunny and warm outside", uzbek: "Tashqarida quyoshli va iliq", phonetic: "/ɪt ɪz ˈsʌn.i ænd wɔːm ˌaʊtˈsaɪd/", exampleSentence: "It is sunny and warm outside, let's go for a walk.", exampleUzbek: "Tashqari quyoshli va iliq, aylanib kelaylik." },
      { id: "15-3", english: "I feel great and energetic", uzbek: "Men o'zimni ajoyib va g'ayratli his qilyapman", phonetic: "/aɪ fiːl ɡreɪt ænd ˌen.əˈdʒet.ɪk/", exampleSentence: "After a good rest, I feel great and energetic.", exampleUzbek: "Yaxshi dam olgach, o'zimni g'ayratli his qilyapman." },
      { id: "15-4", english: "It looks like it will rain", uzbek: "Yomg'ir yog'adiganga o'xshaydi", phonetic: "/ɪt lʊks laɪk ɪt wɪl reɪn/", exampleSentence: "Dark clouds are gathering, it looks like it will rain.", exampleUzbek: "Qora bulutlar yig'ilyapti, yomg'ir yog'adiganga o'xshaydi." }
    ]
  },

  // ==============================================================
  // UNIT 4: B1 INTERMEDIATE (Dars 16 - 20)
  // ==============================================================
  {
    id: 16,
    levelId: 4,
    levelName: "B1 - O'rta Daraja",
    levelBadge: "B1 Intermediate",
    levelColor: "#fb923c",
    unitNumber: 4,
    title: "16-Dars: Sayohat & Aeroportda Muloqot",
    subtitle: "Boarding pass, Passport control, Flight delayed",
    description: "Aeroportda ro'yxatdan o'tish, parvoz va mehmonxona bron qilish suhbatlari.",
    items: [
      { id: "16-1", english: "Here is my passport and ticket", uzbek: "Mana mening pasportim va chiptam", phonetic: "/hɪər ɪz maɪ ˈpɑːs.pɔːt ænd ˈtɪk.ɪt/", exampleSentence: "Good morning, here is my passport and ticket.", exampleUzbek: "Xayrli tong, mana mening pasportim va chiptam." },
      { id: "16-2", english: "Which gate does the flight board?", uzbek: "Samolyot qaysi darvozadan (gate) chiqadi?", phonetic: "/wɪtʃ ɡeɪt dʌz ðə flaɪt bɔːd/", exampleSentence: "Excuse me, which gate does the flight board from?", exampleUzbek: "Kechirasiz, parvoz qaysi darvozadan amalga oshiriladi?" },
      { id: "16-3", english: "I have a hotel reservation under my name", uzbek: "Mening nomimga mehmonxona band qilingan", phonetic: "/aɪ hæv ə hoʊˈtel ˌrez.əˈveɪ.ʃən ˈʌn.dər maɪ neɪm/", exampleSentence: "Hello, I have a hotel reservation under my name.", exampleUzbek: "Salom, mening nomimga xona band qilingan." },
      { id: "16-4", english: "Our flight has been delayed by an hour", uzbek: "Bizning reysimiz bir soatga kechiktirildi", phonetic: "/ˈaʊər flaɪt hæz biːn dɪˈleɪd baɪ ən aʊər/", exampleSentence: "Unfortunately, our flight has been delayed by an hour.", exampleUzbek: "Afsuski, bizning parvozimiz bir soatga kechiktirildi." }
    ]
  },
  {
    id: 17,
    levelId: 4,
    levelName: "B1 - O'rta Daraja",
    levelBadge: "B1 Intermediate",
    levelColor: "#fb923c",
    unitNumber: 4,
    title: "17-Dars: Do'stona Jonli Suhbat & Hol-ahvol",
    subtitle: "What have you been up to? Let's catch up",
    description: "Native speakerlar kabi samimiy suhbatlashish va uzoq vaqt ko'rishmagan do'st bilan gaplashish.",
    items: [
      { id: "17-1", english: "Long time no see!", uzbek: "Ko'rishmaganimizga ancha bo'ldi!", phonetic: "/lɒŋ taɪm noʊ siː/", exampleSentence: "Hey friend, long time no see! How have you been?", exampleUzbek: "Salom do'stim, ancha bo'ldi ko'rishmaganimizga! Qandaysan?" },
      { id: "17-2", english: "What have you been up to recently?", uzbek: "So'nggi paytlarda nimalar bilan bandsan?", phonetic: "/wɒt hæv juː biːn ʌp tuː ˈriː.sənt.li/", exampleSentence: "So, what have you been up to recently?", exampleUzbek: "Xo'sh, oxirgi paytlarda nimalar bilan shug'ullanyapsan?" },
      { id: "17-3", english: "We definitely need to catch up soon", uzbek: "Tez orada albatta dildan suhbatlashib olishimiz kerak", phonetic: "/wiː ˈdef.ɪ.nət.li niːd tuː kætʃ ʌp suːn/", exampleSentence: "Let's grab a coffee, we definitely need to catch up soon.", exampleUzbek: "Bir qahva ichaylik, albatta gaplashib olishimiz kerak." },
      { id: "17-4", english: "That sounds like a wonderful plan!", uzbek: "Bu ajoyib reja bo'lib eshitilyapti!", phonetic: "/ðæt saʊndz laɪk ə ˈwʌn.də.fəl plæn/", exampleSentence: "Meeting this weekend? That sounds like a wonderful plan!", exampleUzbek: "Bu dam olish kunida uchrashishmi? Juda zo'r reja!" }
    ]
  },
  {
    id: 18,
    levelId: 4,
    levelName: "B1 - O'rta Daraja",
    levelBadge: "B1 Intermediate",
    levelColor: "#fb923c",
    unitNumber: 4,
    title: "18-Dars: Fikr Bildirish & Kelishuv",
    subtitle: "In my opinion, I completely agree, That makes sense",
    description: "O'z shaxsiy fikrini madaniyatli ifodalash, boshqalar bilan bahslashish va qo'shilish.",
    items: [
      { id: "18-1", english: "In my opinion, practice makes perfect", uzbek: "Mening fikrimcha, mashq mukammallikka olib boradi", phonetic: "/ɪn maɪ əˈpɪn.jən, ˈpræk.tɪs meɪks ˈpɜː.fɪkt/", exampleSentence: "In my opinion, regular typing practice makes perfect.", exampleUzbek: "Mening fikrimcha, muntazam yozish mashqi mukammallikka eltadi." },
      { id: "18-2", english: "I completely agree with your point", uzbek: "Fikringizga to'liq qo'shilaman", phonetic: "/aɪ kəmˈpliːt.li əˈɡriː wɪð jɔːr pɔɪnt/", exampleSentence: "I completely agree with your point on modern education.", exampleUzbek: "Zamonaviy ta'lim bo'yicha fikringizga to'liq qo'shilaman." },
      { id: "18-3", english: "That makes complete sense to me", uzbek: "Bu menga mutlaqo mantiqli va to'g'ri tuyulmoqda", phonetic: "/ðæt meɪks kəmˈpliːt sens tuː miː/", exampleSentence: "Your suggestion makes complete sense to me.", exampleUzbek: "Sizning taklifingiz menga mutlaqo mantiqli tuyulmoqda." },
      { id: "18-4", english: "I see what you mean, but hear me out", uzbek: "Nima demoqchiligingizni tushundim, lekin meni ham tinglang", phonetic: "/aɪ siː wɒt juː miːn, bʌt hɪər miː aʊt/", exampleSentence: "I see what you mean, but let us look at the facts.", exampleUzbek: "Nima demoqchiligingizni tushundim, biroq keling dalillarga qaraylik." }
    ]
  },
  {
    id: 19,
    levelId: 4,
    levelName: "B1 - O'rta Daraja",
    levelBadge: "B1 Intermediate",
    levelColor: "#fb923c",
    unitNumber: 4,
    title: "19-Dars: Eng Zarur Phrasal Verblar",
    subtitle: "Look for, Give up, Find out, Figure out",
    description: "Ingliz tilining asosi bo'lgan iborali fe'llarni ma'noli kontekstda terish va o'rganish.",
    items: [
      { id: "19-1", english: "Never give up on your dreams", uzbek: "Orzularingizdan hech qachon taslim bo'lmang", phonetic: "/ˈnev.ər ɡɪv ʌp ɒn jɔːr driːmz/", exampleSentence: "No matter how tough it gets, never give up on your dreams.", exampleUzbek: "Qanchalik qiyin bo'lmasin, orzularingizdan aslo taslim bo'lmang." },
      { id: "19-2", english: "I need to figure out the solution", uzbek: "Men bu yechimni tushunib yetishim / topishim kerak", phonetic: "/aɪ niːd tuː ˈfɪɡ.ər aʊt ðə səˈluː.ʃən/", exampleSentence: "Give me some time to figure out the solution.", exampleUzbek: "Yechimni topib olishim uchun menga biroz vaqt bering." },
      { id: "19-3", english: "I will look into this matter immediately", uzbek: "Men bu masalani darhol o'rganib chiqaman", phonetic: "/aɪ wɪl lʊk ˈɪn.tuː ðɪs ˈmæt.ər ɪˈmiː.di.ət.li/", exampleSentence: "Thank you for the report, I will look into this matter immediately.", exampleUzbek: "Xabar uchun rahmat, bu masalani darhol ko'rib chiqaman." },
      { id: "19-4", english: "She came up with a brilliant idea", uzbek: "U ajoyib bir aqlbovar g'oya o'ylab topdi", phonetic: "/ʃiː keɪm ʌp wɪð ə ˈbrɪl.jənt aɪˈdɪə/", exampleSentence: "During the meeting, she came up with a brilliant idea.", exampleUzbek: "Yig'ilish davomida u ajoyib bir g'oyani o'ylab topdi." }
    ]
  },
  {
    id: 20,
    levelId: 4,
    levelName: "B1 - O'rta Daraja",
    levelBadge: "B1 Intermediate",
    levelColor: "#fb923c",
    unitNumber: 4,
    title: "20-Dars: Muammolarni Hal Qilish & Yechimlar",
    subtitle: "Everything is under control, We found a way",
    description: "Murakkab vaziyatlarda xotirjamlikni saqlash va konstruktiv muloqot qilish.",
    items: [
      { id: "20-1", english: "Do not worry, everything is under control", uzbek: "Xavotir olmang, hamma narsa to'liq nazorat ostida", phonetic: "/duː nɒt ˈwʌr.i, ˈev.ri.θɪŋ ɪz ˈʌn.dər kənˈtroʊl/", exampleSentence: "Stay calm, everything is under control.", exampleUzbek: "Xotirjam bo'ling, barchasi nazorat ostida." },
      { id: "20-2", english: "We will find an effective solution together", uzbek: "Biz birgalikda samarali yechim topamiz", phonetic: "/wiː wɪl faɪnd ən ɪˈfek.tɪv səˈluː.ʃən təˈɡeð.ər/", exampleSentence: "Do not stress, we will find an effective solution together.", exampleUzbek: "Siqilmang, birgalikda samarali yechim topamiz." },
      { id: "20-3", english: "Could you please give me a hand?", uzbek: "Iltimos, menga yordam berib yubora olasizmi?", phonetic: "/kʊd juː pliːz ɡɪv miː ə hænd/", exampleSentence: "This task is heavy, could you please give me a hand?", exampleUzbek: "Bu vazifa og'ir, yordam berib yubora olasizmi?" }
    ]
  },

  // ==============================================================
  // UNIT 5: B2 UPPER-INTERMEDIATE (Dars 21 - 25)
  // ==============================================================
  {
    id: 21,
    levelId: 5,
    levelName: "B2 - Ravon So'zlashuv",
    levelBadge: "B2 Upper-Int",
    levelColor: "#f43f5e",
    unitNumber: 5,
    title: "21-Dars: Jonli Ingliz Idiomalari",
    subtitle: "Piece of cake, Once in a blue moon, Hit the nail",
    description: "Nutqni boyituvchi va native speakerdek eshitilishga yordam beruvchi mashhur idiomalar.",
    items: [
      { id: "21-1", english: "This task was a piece of cake", uzbek: "Bu vazifa xamirdek oson (juda oson) bo'ldi", phonetic: "/ðɪs tɑːsk wɒz ə piːs əv keɪk/", exampleSentence: "With enough preparation, the exam was a piece of cake.", exampleUzbek: "Yetarlicha tayyorgarlik bilan imtihon juda oson kechdi." },
      { id: "21-2", english: "It happens once in a blue moon", uzbek: "Bu juda kamdan-kam, yilda bir marta sodir bo'ladi", phonetic: "/ɪt ˈhæp.ənz wʌns ɪn ə bluː muːn/", exampleSentence: "He visits his hometown once in a blue moon.", exampleUzbek: "U o'z qadrdon shahriga juda kamdan-kam keladi." },
      { id: "21-3", english: "You hit the nail on the head", uzbek: "Siz ayni nishonga urdingiz (aniq to'g'ri aytdingiz)", phonetic: "/juː hɪt ðə neɪl ɒn ðə hed/", exampleSentence: "Your analysis hit the nail on the head.", exampleUzbek: "Sizning tahlilingiz ayni haqiqatni nishonga urdi." },
      { id: "21-4", english: "Actions speak louder than words", uzbek: "Harakatlar so'zlardan ko'ra balandroq gapiradi (gap emas, ish muhim)", phonetic: "/ˈæk.ʃənz spiːk ˈlaʊ.dər ðæn wɜːdz/", exampleSentence: "Always remember that actions speak louder than words.", exampleUzbek: "Har doim esda tutingki, amallar gapdan ustundir." }
    ]
  },
  {
    id: 22,
    levelId: 5,
    levelName: "B2 - Ravon So'zlashuv",
    levelBadge: "B2 Upper-Int",
    levelColor: "#f43f5e",
    unitNumber: 5,
    title: "22-Dars: Biznes & Professional Muloqot",
    subtitle: "Meet the deadline, Win-win situation, Pitch",
    description: "Xalqaro kompaniyalarda, loyihalarda va muzokaralarda qo'llaniladigan ishbilarmonlik tili.",
    items: [
      { id: "22-1", english: "We need to meet the strict project deadline", uzbek: "Biz loyihaning qat'iy muddatiga (deadline) ulgurishimiz kerak", phonetic: "/wiː niːd tuː miːt ðə strɪkt ˈprɒdʒ.ekt ˈded.laɪn/", exampleSentence: "Our entire team worked hard to meet the strict project deadline.", exampleUzbek: "Butun jamoamiz muddatga ulgurish uchun qattiq ishladi." },
      { id: "22-2", english: "This partnership creates a win-win situation", uzbek: "Bu sheriklik ikkala tomon uchun ham manfaatli holat yaratadi", phonetic: "/ðɪs ˈpɑːt.nə.ʃɪp kriːˈeɪts ə wɪn wɪn ˌsɪtʃ.uˈeɪ.ʃən/", exampleSentence: "Both companies benefit, making it a true win-win situation.", exampleUzbek: "Har ikki kompaniya foyda ko'rib, o'zaro manfaatli yechimga erishdi." },
      { id: "22-3", english: "Let us schedule a follow-up meeting", uzbek: "Keling, keyingi xulosaviy uchrashuv vaqtini belgilaylik", phonetic: "/let ʌs ˈʃedʒ.uːl ə ˈfɒl.oʊ ʌp ˈmiː.tɪŋ/", exampleSentence: "Let us schedule a follow-up meeting next Tuesday.", exampleUzbek: "Keling, keyingi seshanba kuni uchrashuv belgilaylik." }
    ]
  },
  {
    id: 23,
    levelId: 5,
    levelName: "B2 - Ravon So'zlashuv",
    levelBadge: "B2 Upper-Int",
    levelColor: "#f43f5e",
    unitNumber: 5,
    title: "23-Dars: Axborot Texnologiyalari & AI",
    subtitle: "Artificial intelligence, Innovation, Cloud computing",
    description: "Sun'iy intellekt, dasturlash va innovatsiyalar haqidagi zamonaviy texnologik iboralar.",
    items: [
      { id: "23-1", english: "Artificial intelligence transforms global industries", uzbek: "Sun'iy intellekt butun dunyo sanoatini tubdan o'zgartirmoqda", phonetic: "/ˌɑː.tɪˈfɪʃ.əl ɪnˈtel.ɪ.dʒəns trænsˈfɔːmz ˈɡloʊ.bəl ˈɪn.də.striz/", exampleSentence: "Artificial intelligence transforms global industries at breathtaking speed.", exampleUzbek: "Sun'iy intellekt dunyo sanoatini hayratlanarli tezlikda o'zgartirmoqda." },
      { id: "23-2", english: "Data security is of utmost importance", uzbek: "Ma'lumotlar xavfsizligi eng oliy darajadagi ahamiyatga ega", phonetic: "/ˈdeɪ.tə sɪˈkjʊə.rɪ.ti ɪz əv ˈʌt.moʊst ɪmˈpɔː.təns/", exampleSentence: "In modern banking, data security is of utmost importance.", exampleUzbek: "Zamonaviy bank tizimida ma'lumotlar xavfsizligi o'ta muhimdir." },
      { id: "23-3", english: "Continuous learning is the key to innovation", uzbek: "Uzluksiz o'rganish innovatsiyaning asosiy kalitidir", phonetic: "/kənˈtɪn.ju.əs ˈlɜː.nɪŋ ɪz ðə kiː tuː ˌɪn.əˈveɪ.ʃən/", exampleSentence: "For any developer, continuous learning is the key to innovation.", exampleUzbek: "Har qanday dasturchi uchun uzluksiz o'rganish yangilik kiritish kalitidir." }
    ]
  },
  {
    id: 24,
    levelId: 5,
    levelName: "B2 - Ravon So'zlashuv",
    levelBadge: "B2 Upper-Int",
    levelColor: "#f43f5e",
    unitNumber: 5,
    title: "24-Dars: Atrof-muhit & Barqaror Rivojlanish",
    subtitle: "Renewable energy, Sustainable future, Ecology",
    description: "Ekologiya, qayta tiklanuvchi energiya va kelajak avlod haqidagi mavzuli fikrlar.",
    items: [
      { id: "24-1", english: "Renewable energy paves the way for a greener future", uzbek: "Qayta tiklanuvchi energiya yashil kelajak sari yo'l ochadi", phonetic: "/rɪˈnjuː.ə.bəl ˈen.ə.dʒi peɪvz ðə weɪ fɔːr ə ˈɡriː.nər ˈfjuː.tʃər/", exampleSentence: "Solar power and renewable energy pave the way for a greener future.", exampleUzbek: "Quyosh quvvati va qayta tiklanuvchi energiya yashil kelajak sari yo'l ochadi." },
      { id: "24-2", english: "We must protect natural biodiversity", uzbek: "Biz tabiiy biologik xilma-xillikni asrab-avaylashimiz shart", phonetic: "/wiː mʌst prəˈtekt ˈnætʃ.ər.əl ˌbaɪ.oʊ.daɪˈvɜː.sɪ.ti/", exampleSentence: "It is our collective duty to protect natural biodiversity.", exampleUzbek: "Tabiiy xilma-xillikni himoya qilish bizning umumiy burchimizdir." }
    ]
  },
  {
    id: 25,
    levelId: 5,
    levelName: "B2 - Ravon So'zlashuv",
    levelBadge: "B2 Upper-Int",
    levelColor: "#f43f5e",
    unitNumber: 5,
    title: "25-Dars: Munozara & Strukturaviy Bog'lovchilar",
    subtitle: "Furthermore, Consequently, On the other hand",
    description: "Fikrni mantiqiy bog'lash, taqqoslash va insho hamda nutqda fikrni silliq davom ettirish.",
    items: [
      { id: "25-1", english: "Furthermore, evidence suggests positive growth", uzbek: "Bundan tashqari, dalillar ijobiy o'sishni ko'rsatmoqda", phonetic: "/ˌfɜː.ðəˈmɔːr, ˈev.ɪ.dəns səˈdʒests ˈpɒz.ə.tɪv ɡroʊθ/", exampleSentence: "Furthermore, recent evidence suggests positive economic growth.", exampleUzbek: "Bundan tashqari, so'nggi dalillar ijobiy iqtisodiy o'sishdan dalolat beradi." },
      { id: "25-2", english: "On the other hand, there are notable challenges", uzbek: "Boshqa tomondan esa, sezilarli qiyinchiliklar ham mavjud", phonetic: "/ɒn ðə ˈʌð.ər hænd, ðeər ɑːr ˈnoʊ.tə.bəl ˈtʃæl.ɪn.dʒɪz/", exampleSentence: "On the other hand, there are notable challenges we must overcome.", exampleUzbek: "Boshqa tomondan, biz yengib o'tishimiz lozim bo'lgan jiddiy to'siqlar bor." }
    ]
  },

  // ==============================================================
  // UNIT 6: C1 ADVANCED (Dars 26 - 30)
  // ==============================================================
  {
    id: 26,
    levelId: 6,
    levelName: "C1 - Professional / Yuqori",
    levelBadge: "C1 Advanced",
    levelColor: "#a855f7",
    unitNumber: 6,
    title: "26-Dars: Murakkab Akademik Kollokatsiyalar",
    subtitle: "Profound impact, Ubiquitous presence, Unprecedented",
    description: "Nutq va yozuvni oliy darajaga ko'taruvchi boy akademik so'z birikmalari.",
    items: [
      { id: "26-1", english: "Technology has exerted a profound impact on society", uzbek: "Texnologiya jamiyatga chuqur va beqiyos ta'sir ko'rsatdi", phonetic: "/tekˈnɒl.ə.dʒi hæz ɪɡˈzɜː.tɪd ə prəˈfaʊnd ˈɪm.pækt ɒn səˈsaɪ.ə.ti/", exampleSentence: "Digital technology has exerted a profound impact on modern communication.", exampleUzbek: "Raqamli texnologiya zamonaviy muloqotga chuqur ta'sir ko'rsatdi." },
      { id: "26-2", english: "We are witnessing unprecedented technological advancement", uzbek: "Biz misli ko'rilmagan texnologik taraqqiyotning guvohi bo'lmoqdamiz", phonetic: "/wiː ɑːr ˈwɪt.nəs.ɪŋ ʌnˈpres.ɪ.den.tɪd ˌtek.nəˈlɒdʒ.ɪ.kəl ədˈvɑːns.mənt/", exampleSentence: "In this era, we are witnessing unprecedented technological advancement.", exampleUzbek: "Ushbu asrda biz misli ko'rilmagan texnologik yuksalishga guvoh bo'lyapmiz." },
      { id: "26-3", english: "Smartphones have established an ubiquitous presence", uzbek: "Smartfonlar har qadamda uchraydigan (ubiquitous) mavqega ega bo'ldi", phonetic: "/ˈsmɑːt.foʊnz hæv ɪˈstæb.lɪʃt ən juːˈbɪk.wɪ.təs ˈprez.əns/", exampleSentence: "Portable devices have established an ubiquitous presence in our daily lives.", exampleUzbek: "Portativ qurilmalar kundalik hayotimizda har qadamda uchraydigan odatga aylandi." }
    ]
  },
  {
    id: 27,
    levelId: 6,
    levelName: "C1 - Professional / Yuqori",
    levelBadge: "C1 Advanced",
    levelColor: "#a855f7",
    unitNumber: 6,
    title: "27-Dars: Falsafiy Mulohaza & Intellekt",
    subtitle: "Cognitive bias, Introspection, Resilience of mind",
    description: "Chuqur tushunchalar, inson ruhiyati va intellektual salohiyatni ifodalash.",
    items: [
      { id: "27-1", english: "Introspection allows individuals to understand subconscious motives", uzbek: "O'zini ichki tahlil qilish (introspeksiya) ongsiz mayllarni anglashga yordam beradi", phonetic: "/ˌɪn.trəˈspek.ʃən əˈlaʊz ˌɪn.dɪˈvɪdʒ.u.əlz tuː ˌʌn.dəˈstænd sʌbˈkɒn.ʃəs ˈmoʊ.tɪvz/", exampleSentence: "Regular introspection allows individuals to cultivate profound self-awareness.", exampleUzbek: "Muntazam ichki tafakkur insonga chuqur o'z-o'zini anglashni baxsh etadi." },
      { id: "27-2", english: "Mental resilience enables people to withstand adversity", uzbek: "Ruhiy matonat insonlarga har qanday qiyinchiliklarga bardosh berish qudratini beradi", phonetic: "/ˈmen.təl rɪˈzɪl.jəns ɪˈneɪ.bəlz ˈpiː.pəl tuː wɪðˈstænd ədˈvɜː.sə.ti/", exampleSentence: "Developing mental resilience enables people to triumph over extreme adversity.", exampleUzbek: "Ruhiy matonatni rivojlantirish insonlarga og'ir sinovlarni yengish imkonini beradi." }
    ]
  },
  {
    id: 28,
    levelId: 6,
    levelName: "C1 - Professional / Yuqori",
    levelBadge: "C1 Advanced",
    levelColor: "#a855f7",
    unitNumber: 6,
    title: "28-Dars: Madaniyat & Estetika",
    subtitle: "Aesthetic appreciation, Cultural heritage, Nuance",
    description: "Madaniy meros, san'at va estetik nozikliklarni ifodalovchi boy leksika.",
    items: [
      { id: "28-1", english: "Preserving cultural heritage fosters social cohesion", uzbek: "Madaniy merosni asrab-avaylash ijtimoiy birdamlikni mustahkamlaydi", phonetic: "/prɪˈzɜː.vɪŋ ˈkʌl.tʃər.əl ˈher.ɪ.tɪdʒ ˈfɒs.təz ˈsoʊ.ʃəl koʊˈhiː.ʒən/", exampleSentence: "Preserving historical cultural heritage fosters social cohesion across generations.", exampleUzbek: "Tarixiy madaniy merosni saqlash avlodlararo birdamlikni yuksaltiradi." },
      { id: "28-2", english: "A nuanced interpretation reveals underlying artistic depth", uzbek: "Nozik va teran talqin asarning ichki badiiy mohiyatini ochib beradi", phonetic: "/ə ˈnjuː.ɑːnst ɪnˌtɜː.prɪˈteɪ.ʃən rɪˈviːlz ˌʌn.dəˈlaɪ.ɪŋ ɑːˈtɪs.tɪk depθ/", exampleSentence: "A nuanced interpretation reveals profound poetic resonance.", exampleUzbek: "Nozik talqin she'riyatning chuqur ohangini yuzaga chiqaradi." }
    ]
  },
  {
    id: 29,
    levelId: 6,
    levelName: "C1 - Professional / Yuqori",
    levelBadge: "C1 Advanced",
    levelColor: "#a855f7",
    unitNumber: 6,
    title: "29-Dars: Ijtimoiy-Iqtisodiy Tahlil",
    subtitle: "Socioeconomic disparity, Fiscal policy, Paradigm shift",
    description: "Iqtisodiy islohotlar, davlat siyosati va global paradigmalar haqida tahliliy jumlalar.",
    items: [
      { id: "29-1", english: "Prudent fiscal policies mitigate long-term economic instability", uzbek: "Oqilona moliyaviy siyosat uzoq muddatli iqtisodiy beqarorlikning oldini oladi", phonetic: "/ˈpruː.dənt ˈfɪs.kəl ˈpɒl.ə.siz ˈmɪt.ɪ.ɡeɪt lɒŋ tɜːm ˌiː.kəˈnɒm.ɪk ˌɪn.stəˈbɪl.ə.ti/", exampleSentence: "Implementing prudent fiscal policies mitigates widespread economic volatility.", exampleUzbek: "Oqilona byudjet siyosatini yuritish keng ko'lamli tebranishlarni yumshatadi." },
      { id: "29-2", english: "A paradigm shift is reshaping modern scientific inquiry", uzbek: "Tafakkur paradigmasining o'zgarishi zamonaviy ilmiy tadqiqotlarni qayta shakllantirmoqda", phonetic: "/ə ˈpær.ə.daɪm ʃɪft ɪz riːˈʃeɪ.pɪŋ ˈmɒd.ən ˌsaɪənˈtɪf.ɪk ɪnˈkwaɪə.ri/", exampleSentence: "The emergence of quantum computing marks a fundamental paradigm shift.", exampleUzbek: "Kvant hisoblashning paydo bo'lishi fundamental paradigma o'zgarishini anglatadi." }
    ]
  },
  {
    id: 30,
    levelId: 6,
    levelName: "C1 - Professional / Yuqori",
    levelBadge: "C1 Advanced",
    levelColor: "#a855f7",
    unitNumber: 6,
    title: "30-Dars: C1 Eloquent Idioms & Stylistics",
    subtitle: "Epitome of excellence, Burn the midnight oil",
    description: "Insho va ma'ruzalarda oliy baho kafolatlovchi stilistik durdonalar.",
    items: [
      { id: "30-1", english: "This masterpiece stands as the epitome of artistic excellence", uzbek: "Bu shoh asar badiiy kamolotning eng yuksak namunasi (timsoli) hisoblanadi", phonetic: "/ðɪs ˈmɑː.stə.piːs stændz æz ðɪ ɪˈpɪt.ə.mi əv ɑːˈtɪs.tɪk ˈek.səl.əns/", exampleSentence: "His latest novel stands as the epitome of narrative brilliance.", exampleUzbek: "Uning so'nggi romani hikoya mahoratining eng yuksak cho'qqisi hisoblanadi." },
      { id: "30-2", english: "Dedicated scholars often burn the midnight oil in pursuit of truth", uzbek: "Fidoyi olimlar haqiqat yo'lida tunlarni tongga ulab mehnat qilishadi", phonetic: "/ˈded.ɪ.keɪ.tɪd ˈskɒl.əz ˈɒf.ən bɜːn ðə ˈmɪd.naɪt ɔɪl ɪn pəˈsjuːt əv truːθ/", exampleSentence: "Ambitious researchers burn the midnight oil before groundbreaking discoveries.", exampleUzbek: "Izlanuvchan tadqiqotchilar buyuk kashfiyotlar arafasida kechalari tinimsiz ishlaydilar." }
    ]
  },

  // ==============================================================
  // UNIT 7: IELTS 8.5 - 9.0 MASTER (Dars 31 - 35)
  // ==============================================================
  {
    id: 31,
    levelId: 7,
    levelName: "IELTS 8.5 - 9.0 Master",
    levelBadge: "IELTS 9",
    levelColor: "#e2b714",
    unitNumber: 7,
    title: "31-Dars: IELTS 9 Task 2 Kirish va Bog'lovchilar",
    subtitle: "It is widely asserted that, Merits close scrutiny",
    description: "IELTS Writing Task 2 imtihonida Band 9.0 oluvchi rasmiy akademik kirish jumlalari.",
    items: [
      { id: "31-1", english: "It is widely asserted that education serves as a fundamental catalyst for progress", uzbek: "Ta'lim taraqqiyotning fundamental harakatlantiruvchi kuchi ekanligi keng e'tirof etiladi", phonetic: "/ɪt ɪz ˈwaɪd.li əˈsɜː.tɪd ðæt ˌedʒ.uˈkeɪ.ʃən sɜːvz æz ə ˌfʌn.dəˈmen.təl ˈkæt.əl.ɪst fɔːr ˈprəʊ.ɡres/", exampleSentence: "It is widely asserted that holistic education serves as an indispensable catalyst for civil progress.", exampleUzbek: "Keng qamrovli ta'lim sivilizatsiya yuksalishining ajralmas omili ekanligi e'tirof etiladi." },
      { id: "31-2", english: "This contentious socioeconomic dilemma warrants meticulous examination", uzbek: "Ushbu bahsli ijtimoiy-iqtisodiy masala o'ta sinchkovlik bilan tekshirishni talab etadi", phonetic: "/ðɪs kənˈten.ʃəs ˌsoʊ.si.oʊˌiː.kəˈnɒm.ɪk dɪˈlem.ə ˈwɒr.ənts məˈtɪk.jə.ləs ɪɡˌzæm.ɪˈneɪ.ʃən/", exampleSentence: "Whether automation diminishes employment warrants meticulous examination.", exampleUzbek: "Avtomatlashtirish ish o'rinlarini qisqartirishi masalasi chuqur tahlilni talab qiladi." },
      { id: "31-3", english: "A quintessential illustration of this phenomenon can be observed globally", uzbek: "Ushbu hodisaning yaqqol va yorqin namunasi butun dunyo bo'ylab kuzatilishi mumkin", phonetic: "/ə ˌkwɪn.tɪˈsen.ʃəl ˌɪl.əˈstreɪ.ʃən əv ðɪs fəˈnɒm.ɪ.nən kæn biː əbˈzɜːvd ˈɡloʊ.bəl.i/", exampleSentence: "Renewable energy adoption provides a quintessential illustration of sustainability.", exampleUzbek: "Yashil energiyaning ommalashishi barqarorlikning eng yorqin dalilidir." }
    ]
  },
  {
    id: 32,
    levelId: 7,
    levelName: "IELTS 8.5 - 9.0 Master",
    levelBadge: "IELTS 9",
    levelColor: "#e2b714",
    unitNumber: 7,
    title: "32-Dars: IELTS Band 9 Oliy Akademik So'zlar",
    subtitle: "Exacerbate, Ubiquitous, Proliferate, Mitigate, Substantiate",
    description: "IELTS Speaking va Writing bo'yicha eng yuqori ballni ta'minlovchi leksik durdonalar.",
    items: [
      { id: "32-1", english: "Unchecked pollution will exacerbate environmental degradation", uzbek: "Nazoratsiz ifloslanish atrof-muhit tanazzulini yanada kuchaytiradi (keskinlashtiradi)", phonetic: "/ʌnˈtʃekt pəˈluː.ʃən wɪl ɪɡˈzæs.ə.beɪt ɪnˌvaɪ.rənˈmen.təl ˌdeɡ.rəˈdeɪ.ʃən/", exampleSentence: "Failing to act promptly will inevitably exacerbate existing social inequities.", exampleUzbek: "O'z vaqtida chora ko'rmaslik mavjud ijtimoiy tengsizlikni yanada chuqurlashtiradi." },
      { id: "32-2", english: "Empirical data substantiates the viability of this hypothesis", uzbek: "Tajriba dalillari ushbu gipotezaning haqqoniyligini to'liq isbotlaydi (substantiate)", phonetic: "/ɪmˈpɪr.ɪ.kəl ˈdeɪ.tə səbˈstæn.ʃi.eɪts ðə ˌvaɪ.əˈbɪl.ə.ti əv ðɪs haɪˈpɒθ.ə.sɪs/", exampleSentence: "Substantial statistical research substantiates our initial hypothesis.", exampleUzbek: "Keng qamrovli statistik tadqiqot dastlabki taxminimizni to'laqonli tasdiqlaydi." },
      { id: "32-3", english: "Governments must implement measures to mitigate severe climate repercussions", uzbek: "Hukumatlar iqlimning og'ir oqibatlarini yumshatish (mitigate) choralarini ko'rishlari shart", phonetic: "/ˈɡʌv.ən.mənts mʌst ˈɪm.plɪ.ment ˈmeʒ.əz tuː ˈmɪt.ɪ.ɡeɪt sɪˈvɪər ˈklaɪ.mət ˌriː.pəˈkʌʃ.ənz/", exampleSentence: "Proactive environmental policies can effectively mitigate severe ecological risks.", exampleUzbek: "Faol ekologik siyosat jiddiy xatarlarni sezilarli darajada yumshatishga qodir." }
    ]
  },
  {
    id: 33,
    levelId: 7,
    levelName: "IELTS 8.5 - 9.0 Master",
    levelBadge: "IELTS 9",
    levelColor: "#e2b714",
    unitNumber: 7,
    title: "33-Dars: Band 9 Advanced Collocations",
    subtitle: "Play a pivotal role, Incontrovertible evidence, Paramount",
    description: "Native leksikani namoyish etuvchi va ravonlik darajasini 9 ga chiqaruvchi kollokatsiyalar.",
    items: [
      { id: "33-1", english: "Critical thinking plays a pivotal role in intellectual development", uzbek: "Tanqidiy fikrlash intellektual yuksalishda hal qiluvchi (pivotal) o'rin tutadi", phonetic: "/ˈkrɪt.ɪ.kəl ˈθɪŋ.kɪŋ pleɪz ə ˈpɪv.ə.təl roʊl ɪn ˌɪn.təlˈek.tʃu.əl dɪˈvel.əp.mənt/", exampleSentence: "Fostering analytical curiosity plays a pivotal role in cognitive maturity.", exampleUzbek: "Tahliliy qiziquvchanlikni rag'batlantirish aqliy kamolotda hal qiluvchi rol o'ynaydi." },
      { id: "33-2", english: "The incontrovertible evidence leaves no room for ambiguity", uzbek: "Inkor etib bo'lmas qat'iy dalillar hech qanday noaniqlikka o'rin qoldirmaydi", phonetic: "/ðiː ˌɪn.kɒn.trəˈvɜː.tə.bəl ˈev.ɪ.dəns liːvz noʊ ruːm fɔːr ˌæm.bɪˈɡjuː.ə.ti/", exampleSentence: "The incontrovertible scientific consensus affirms accelerated planetary warming.", exampleUzbek: "Inkor etib bo'lmas ilmiy xulosa sayyoramizning isishi tezlashganini tasdiqlaydi." }
    ]
  },
  {
    id: 34,
    levelId: 7,
    levelName: "IELTS 8.5 - 9.0 Master",
    levelBadge: "IELTS 9",
    levelColor: "#e2b714",
    unitNumber: 7,
    title: "34-Dars: Tanqidiy Argumentatsiya & Qarshi Fikr",
    subtitle: "Counterargument, Flawed premise, Rebuttal",
    description: "IELTS Writing Task 2 va Speaking Part 3 da raqib dalilini rad etish va o'z nuqtai nazarini himoyalash.",
    items: [
      { id: "34-1", english: "While detractors argue otherwise, empirical reality refutes their premise", uzbek: "Qarshi chiquvchilar boshqacha fikr bildirishsa-da, amaliy voqelik ularning da'vosini rad etadi", phonetic: "/waɪl dɪˈtræk.təz ˈɑːɡ.juː ˈʌð.ə.waɪz, ɪmˈpɪr.ɪ.kəl riˈæl.ə.ti rɪˈfjuːts ðeər ˈprem.ɪs/", exampleSentence: "While skeptics argue otherwise, empirical reality demonstrates overwhelming economic gains.", exampleUzbek: "Shubha bilan qarovchilar e'tiroz bildirishsa-da, amaliyot ulkan iqtisodiy yutuqlarni isbotlamoqda." },
      { id: "34-2", english: "This assertion rests upon an inherently flawed ontological foundation", uzbek: "Bu da'vo tubdan xato bo'lgan poydevor ustiga qurilgan", phonetic: "/ðɪs əˈsɜː.ʃən rests əˈpɒn ən ɪnˈher.ənt.li flɔːd ˌɒn.təˈlɒdʒ.ɪ.kəl faʊnˈdeɪ.ʃən/", exampleSentence: "Rigorous scholarly scrutiny reveals that the opposing claim rests upon a flawed premise.", exampleUzbek: "Qat'iy ilmiy tahlil shuni ko'rsatadiki, qarshi da'vo xato poydevorga asoslangan." }
    ]
  },
  {
    id: 35,
    levelId: 7,
    levelName: "IELTS 8.5 - 9.0 Master",
    levelBadge: "IELTS 9",
    levelColor: "#e2b714",
    unitNumber: 7,
    title: "35-Dars: IELTS 9 Master Xulosa & Yakuniy Matn",
    subtitle: "In summation, Inevitable corollary, Synthesize",
    description: "Inshoni eng yuqori darajada xulosalash va mukammal IELTS 9 c2 yozuvchiga aylanish.",
    items: [
      { id: "35-1", english: "In summation, harmonious synergy between innovation and ethics remains paramount", uzbek: "Xulosa qilib aytganda, innovatsiya va axloq o'rtasidagi uyg'unlik eng oliy ahamiyatga egadir", phonetic: "/ɪn səˈmeɪ.ʃən, hɑːˈmoʊ.ni.əs ˈsɪn.ə.dʒi bɪˈtwiːn ˌɪn.əˈveɪ.ʃən ænd ˈeθ.ɪks rɪˈmeɪnz ˈpær.ə.maʊnt/", exampleSentence: "In summation, fostering ethical technological innovation remains paramount for posterity.", exampleUzbek: "Xulosa qilib aytganda, axloqiy innovatsiyani rivojlantirish kelajak avlod uchun eng oliy masaladir." },
      { id: "35-2", english: "Rapid urbanization inevitably exacerbates socioeconomic disparities unless mitigated", uzbek: "Tezkor urbanizatsiya o'z vaqtida yumshatilmasa, ijtimoiy-iqtisodiy tengsizlikni muqarrar oshiradi", phonetic: "/ˈræp.ɪd ˌɜː.bən.aɪˈzeɪ.ʃən ɪnˈev.ɪ.tə.bli ɪɡˈzæs.ə.beɪts ˌsoʊ.si.oʊˌiː.kəˈnɒm.ɪk dɪˈspær.ə.tiz ənˈles ˈmɪt.ɪ.ɡeɪ.tɪd/", exampleSentence: "Rapid urbanization inevitably exacerbates socioeconomic disparities unless balanced by visionary urban planning.", exampleUzbek: "Tezkor urbanizatsiya uzoqni ko'zlagan shaharsozlik bilan muvozanatlashmasa, ijtimoiy tengsizlikni kuchaytiradi." }
    ]
  }
];

export const TOTAL_ENGLISH_LESSONS = ENGLISH_LESSONS.length; // 35 lessons across 7 units
