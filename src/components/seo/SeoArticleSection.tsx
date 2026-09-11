import React, { useState } from 'react';
import { 
  Keyboard, 
  Gauge, 
  Award, 
  HelpCircle, 
  ChevronDown, 
  CheckCircle2, 
  Zap, 
  Target, 
  BrainCircuit, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useI18n, UiLanguage } from '../../context/I18nContext';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: Record<UiLanguage, FAQItem[]> = {
  uz: [
    {
      question: "Klaviaturada tez yozish nima va nima uchun 10 barmoq texnikasi kerak?",
      answer: "Klaviaturada tez yozish (touch typing yoki ko'r-ko'rona yozish) — klaviatura tugmalariga qaramasdan, mushak xotirasi orqali barcha 10 barmoq bilan matn terish mahoratidir. Ushbu texnika orqali yozish tezligingiz 2-3 baravarga oshadi (daqiqasiga 60-100+ so'zgacha), diqqatni klaviaturaga emas, to'g'ridan-to'g'ri fikrlaringizga qaratasiz, ko'z va bo'yin charchog'i 70% ga kamayadi."
    },
    {
      question: "WPM va CPM nima, ular bir-biridan qanday farq qiladi?",
      answer: "WPM (Words Per Minute) — bir daqiqada xatosiz terilgan so'zlar sonini bildiradi. Xalqaro standart bo'yicha 1 ta so'z 5 ta bosilgan belgiga teng deb olinadi. CPM (Characters Per Minute) esa bir daqiqada bosilgan sof belgilar (harflar, belgilar va bo'shliqlar) sonidir. Masalan, 300 CPM tezlik taxminan 60 WPM ga teng bo'ladi (300 / 5 = 60)."
    },
    {
      question: "Yolnoma Typing platformasida shug'ullanish bepulmi?",
      answer: "Ha, Yolnoma Typing barcha foydalanuvchilar, o'quvchilar, talabalar va IT mutaxassislari uchun 100% mutlaqo bepul. Platformada 125 dan ortiq jahon tillari, 10 barmoq saboqlari, shaxsiy statistika tahlili, Speedway Battle janglari va O'zbekiston milliy reytingida cheklovlarsiz ishtirok etishingiz mumkin."
    },
    {
      question: "Yozish tezligini 20 WPM dan 80+ WPM ga oshirish uchun qancha vaqt kerak?",
      answer: "Har kuni atigi 15-25 daqiqa muntazam mashq qilish orqali aksariyat foydalanuvchilar 2-4 hafta ichida 40-50 WPM ga, 2-3 oy davomida esa barqaror 70-90+ WPM professional ko'rsatkichga erishadilar. Eng muhim qoida: boshida tezlikka emas, 96-98%+ aniqlikka e'tibor berishdir. Tezlik aniqlik ortidan avtomatik ravishda o'sib boradi."
    },
    {
      question: "O'zbek tilida (Lotin va Kirill alifbolarida) mashq qilsa bo'ladimi?",
      answer: "Albatta! Yolnoma Typing O'zbekiston foydalanuvchilari uchun maxsus moslashtirilgan. Siz O'zbek tili Lotin (o'zbekcha so'z boyligi, Oʻ, Gʻ, Sh, Ch harflari bilan) hamda O'zbek tili Kirill alifbolarida, shuningdek Rus, Ingliz va dasturlash tillarida (HTML, CSS, JavaScript, Python) mashqlarni bemalol bajarishingiz mumkin."
    }
  ],
  ru: [
    {
      question: "Что такое слепая печать и зачем нужен 10-пальцевый метод?",
      answer: "Слепая печать (touch typing) — это навык ввода текста всеми десятью пальцами без взгляда на клавиатуру с использованием мышечной памяти. Этот метод увеличивает скорость в 2–3 раза (до 60–100+ слов в минуту), снижает утомляемость глаз и шеи на 70% и позволяет полностью сосредоточиться на содержании мысли."
    },
    {
      question: "В чем разница между WPM и CPM?",
      answer: "WPM (Words Per Minute) — это количество слов, набранных за одну минуту (по международному стандарту 1 слово = 5 нажатий). CPM (Characters Per Minute) — это число знаков в минуту. Например, скорость 300 CPM соответствует примерно 60 WPM (300 / 5 = 60)."
    },
    {
      question: "Бесплатна ли платформа Yolnoma Typing?",
      answer: "Да, тренажер Yolnoma Typing абсолютно бесплатен для всех: школьников, студентов, разработчиков и копирайтеров. Доступны более 125 языков мира, онлайн-битвы 1v1, подробная аналитика и таблица лидеров без каких-либо подписок."
    },
    {
      question: "Сколько времени нужно, чтобы поднять скорость с 20 до 80+ WPM?",
      answer: "При регулярных занятиях по 15–25 минут в день большинство пользователей достигают 40–50 WPM за 2–4 недели, а за 2–3 месяца выходят на уверенные 70–90+ WPM. Главный секрет: в начале держите точность выше 97%, а скорость придет автоматически."
    },
    {
      question: "Поддерживаются ли узбекский, русский и языки программирования?",
      answer: "Да! Поддерживаются узбекский (латиница с буквами Oʻ, Gʻ, Sh, Ch и кириллица), русский, английский, а также реальный код на JavaScript, Python, C++ и HTML."
    }
  ],
  en: [
    {
      question: "What is touch typing and why should I learn the 10-finger technique?",
      answer: "Touch typing is the ability to type with all ten fingers using muscle memory without looking down at the keyboard keys. It typically triples your typing speed (reaching 60–100+ WPM), frees cognitive focus for ideas, and reduces neck and eye strain by over 70%."
    },
    {
      question: "What is the difference between WPM and CPM?",
      answer: "WPM stands for Words Per Minute (standardized globally as 5 keystrokes per word). CPM stands for Characters Per Minute. For example, 300 CPM equals approximately 60 WPM (300 / 5 = 60)."
    },
    {
      question: "Is Yolnoma Typing free to use?",
      answer: "Yes, Yolnoma Typing is 100% free and open to everyone: students, software developers, copywriters, and competitive typists. You get full access to 125+ languages, 1v1 live Speedway battles, and real-time national leaderboards."
    },
    {
      question: "How long does it take to advance from 20 WPM to 80+ WPM?",
      answer: "With just 15–25 minutes of focused daily practice, most learners reach 40–50 WPM within 2–4 weeks and steady 70–90+ WPM within 2–3 months. The golden rule is to prioritize 97%+ accuracy first; speed naturally follows precision."
    },
    {
      question: "Can I practice Uzbek, English, and code syntax?",
      answer: "Absolutely! Yolnoma offers dedicated modes for Uzbek (Latin with Oʻ, Gʻ, Sh, Ch and Cyrillic), English, Russian, and developer syntaxes including JavaScript, Python, C++, and HTML."
    }
  ]
};

export const SeoArticleSection: React.FC<{ onStartPractice?: () => void }> = ({ onStartPractice }) => {
  const { uiLanguage, t } = useI18n();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const faqList = FAQ_DATA[uiLanguage] || FAQ_DATA.uz;

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
        <div className="p-6 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)]/60 backdrop-blur-xs flex flex-col justify-between">
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

        <div className="p-6 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)]/60 backdrop-blur-xs flex flex-col justify-between">
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
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-[var(--main-color)]" />
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-color)] tracking-tight">
            {t('faqTitle')}
          </h3>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-[var(--sub-alt)]/60 bg-[var(--card-bg)]/60 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-[var(--text-color)] hover:text-[var(--main-color)] transition-colors cursor-pointer"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--sub-color)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--main-color)]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed border-t border-[var(--sub-alt)]/30 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Call to Action */}
      {onStartPractice && (
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border border-cyan-500/20 text-center flex flex-col items-center">
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
