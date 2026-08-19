import React from 'react';
import {
  Sparkles,
  Code2,
  Phone,
  Globe,
  ShieldCheck,
  Keyboard,
  Trophy,
  Swords,
  GraduationCap,
  MessageSquare,
  Cpu,
  Layers,
  CheckCircle2,
  Telegram
} from 'lucide-react';

interface OwnerAboutViewProps {
  onStartTyping?: () => void;
  onGoToBattle?: () => void;
  onGoToLessons?: () => void;
  onGoToLeaderboard?: () => void;
}

export const OwnerAboutView: React.FC<OwnerAboutViewProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToLeaderboard
}) => {
  const telegramLink = 'https://t.me/elbekdesign_va_webdasturchi_uz';
  const developerName = 'Elbek Qoriyev';
  const developerRole = 'Full-Stack Web Dasturchi & Platforma Asoschisi';

  const platformFeatures = [
    {
      icon: Keyboard,
      title: "Real-time Tezlik O'lchash",
      desc: "WPM (so'z/daqiqa), CPM (belgi/daqiqa) va Aniqlik (%) ko'rsatkichlarini har lahzada hisoblovchi matematik dvigatel.",
      badge: "Tezkor Motor"
    },
    {
      icon: Swords,
      title: "Jonli Battle Arena",
      desc: "Do'stlar va onlayn ishtirokchilar bilan real-vaqtda klaviatura poygalari o'tkazish hamda PUBG uslubidagi taklifnomalar.",
      badge: "Realtime Battle"
    },
    {
      icon: GraduationCap,
      title: "Interaktiv Saboqlar & Mashqlar",
      desc: "10 barmoq bilan ko'r-ko'rona yozish (touch typing) metodikasi va bosqichma-bosqich malaka oshirish darslari.",
      badge: "Ta'limiy Darslar"
    },
    {
      icon: Trophy,
      title: "Global & Milliy Reyting",
      desc: "Doimiy avtomatik yangilanuvchi yetakchilar jadvali, ligalar, chempionlik unvonlari va eng yuqori natijalar ro'yxati.",
      badge: "Jonli Reyting"
    },
    {
      icon: ShieldCheck,
      title: "Xavfsizlik & Anti-Cheat",
      desc: "Nusxa ko'chirish (paste), botlar va soxta natijalarni aniqlab, reytingni halol saqlovchi xavfsizlik filtri.",
      badge: "100% Halol"
    },
    {
      icon: Globe,
      title: "50+ Tillar va RTL Qo'llab-quvvatlash",
      desc: "O'zbekcha (Lotin/Kirill), Ingliz, Rus, Arab va 50 dan ortiq dunyo tillarida yozish imkoniyati.",
      badge: "Universal"
    }
  ];

  const techStack = [
    { name: "React 18", category: "Frontend Framework", level: "Senior" },
    { name: "TypeScript", category: "Type Safety & Robust Logic", level: "Advanced" },
    { name: "Tailwind CSS", category: "Modern Responsive UI/UX", level: "Expert" },
    { name: "Firebase RTDB", category: "Realtime Battle & Sockets", level: "Architecture" },
    { name: "Cloud Firestore", category: "Persistent Database", level: "Database" },
    { name: "Web Audio API", category: "Sound Synthesizer", level: "Interactive" },
    { name: "Anti-Cheat Engine", category: "Keystroke Validation", level: "Security" },
    { name: "Admin Realtime Inbox", category: "Realtime Direct Feedback", level: "Integration" }
  ];

  const faqs = [
    {
      q: "Yolnoma Typing nima uchun yaratilgan?",
      a: "Yolnoma platformasi O'zbekistonda yoshlar, dasturchilar, talabalar va barcha foydalanuvchilarning klaviaturada 10 barmoq bilan tez va aniq yozish ko'nikmalarini oshirish maqsadida yaratilgan milliy tizimdir."
    },
    {
      q: "WPM va Aniqlik qanday hisoblanadi?",
      a: "WPM (Words Per Minute) har 5 ta to'g'ri kiritilgan belgi 1 ta standart so'z hisoblanadi va sarflangan daqiqaga bo'linadi. Aniqlik esa to'g'ri kiritilgan belgilarning umumiy bosilgan tugmalarga nisbatidir."
    },
    {
      q: "Dasturchi bilan qanday loyihalar bo'yicha bog'lanish mumkin?",
      a: "Web-saytlar, murakkab CRM tizimlar, Full-Stack web ilovalar, startap loyihalar yoki ta'limiy platformalarni noldan yaratish bo'yicha bevosita Elbek Qoriyev bilan bog'lanishingiz mumkin."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. HERO SECTION - Clean, light & fast */}
      <section className="relative rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platforma & Muallif Haqida</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-color)] tracking-tight leading-snug">
            Yolnoma Typing — O'zbekistondagi №1 Zamonaviy Tez Yozish Ekotizimi
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-[var(--sub-color)] font-medium leading-relaxed">
            Ushbu platforma klaviaturada <span className="text-[var(--text-color)] font-bold">10 barmoq bilan ko'r-ko'rona</span> tez va professional yozishni o'rganish, jonli musobaqalarda qatnashish hamda kompyuterda ishlash unumdorligini oshirish uchun noldan maxsus ishlab chiqilgan.
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]">
              <div className="text-2xl font-black text-[var(--main-color)] font-mono">100%</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Bepul & Ochiq</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]">
              <div className="text-2xl font-black text-emerald-500 font-mono">50+</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Dunyo Tillari</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]">
              <div className="text-2xl font-black text-amber-500 font-mono">0.05s</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Tezkor Javob</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]">
              <div className="text-2xl font-black text-purple-500 font-mono">24/7</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Jonli Battle Arena</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CREATOR / OWNER CARD */}
      <section className="rounded-3xl bg-[var(--card-bg)] border-2 border-[var(--main-color)]/40 p-6 sm:p-8 lg:p-10 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Avatar & Badges */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[var(--main-color)] to-cyan-500 text-white flex flex-col items-center justify-center p-2 shadow-md">
              <span className="font-black text-3xl sm:text-4xl tracking-tight">EQ</span>
              <span className="text-[10px] font-black uppercase tracking-wider opacity-90 mt-0.5">
                Founder & Dev
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black mt-3.5 text-[var(--text-color)] flex items-center gap-1.5">
              {developerName}
              <CheckCircle2 className="w-5 h-5 text-[var(--main-color)]" />
            </h2>
            <p className="text-xs font-bold text-[var(--main-color)] mt-0.5">
              {developerRole}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold mt-2.5 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hamkorlikka Ochiq</span>
            </div>
          </div>

          {/* Details & Direct Contact */}
          <div className="lg:col-span-8 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--main-color)]">
                <Code2 className="w-4 h-4" />
                <span>Loyiha Asoschisi & Dasturchi</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)]">
                "Ushbu platforma yoshlarimizning kompyuter va klaviatura ko'nikmalarini oshirish uchun yaratildi."
              </h3>
              <p className="text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed">
                Men <strong className="text-[var(--text-color)] font-bold">{developerName}</strong> — Full-Stack Web dasturchiman. Zamonaviy foydalanuvchi interfeyslari (UI/UX), real-vaqt ma'lumotlar almashinuvi va yuqori tezlikda ishlovchi web ilovalarni yaratishga ixtisoslashganman. 
                <br />
                <strong>Yolnoma Typing</strong> loyihasining dizayni, arxitekturasi va dasturiy kodi to'liq men tomonimdan ishlab chiqilgan.
              </p>
            </div>

            {/* Telegram Contact */}
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center shrink-0">
                    <Telegram className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase tracking-wider block">Telegram orqali bog'lanish</span>
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base sm:text-lg font-mono font-black text-[var(--text-color)] hover:text-[var(--main-color)] transition-colors"
                    >
                      @elbekdesign_va_webdasturchi_uz
                    </a>
                  </div>
                </div>

                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[var(--main-color)] text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <Telegram className="w-3.5 h-3.5" />
                  <span>Telegramga yozish</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--sub-color)]/15 text-xs">
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors font-bold"
                >
                  <Telegram className="w-3.5 h-3.5" />
                  <span>Telegram orqali murojat qilish</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TELEGRAM CONTACT CTA */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[var(--main-color)] tracking-wider">
              <Telegram className="w-4 h-4" />
              <span>Telegram orqali aloqa</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
              Murojaat qilish uchun Telegramga o'ting
            </h3>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Fikr, taklif yoki loyiha bo'yicha savolaringiz bo'lsa, quyidagi Telegram kanaliga kirib bemalol murojaat qilishingiz mumkin.
            </p>
          </div>

          <a
            href={telegramLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--main-color)] text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
          >
            <Telegram className="w-4 h-4" />
            <span>Telegramga kirish</span>
          </a>
        </div>
      </section>

      {/* 4. PLATFORM CORE FEATURES */}
      <section className="space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-xs font-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Platforma Imkoniyatlari</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] tracking-tight">
            Nega Aynan Yolnoma Typing?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-[var(--main-color)]/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--sub-alt)] text-[var(--main-color)] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] font-mono">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[var(--text-color)]">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[var(--sub-color)] mt-1 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TECH STACK & ARCHITECTURE */}
      <section className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--sub-alt)] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[var(--main-color)] tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Arxitektura & Texnologiyalar</span>
            </div>
            <h3 className="text-lg font-black text-[var(--text-color)] mt-0.5">
              Zamonaviy Muhandislik & Yuqori Tezlik
            </h3>
          </div>
          <p className="text-xs text-[var(--sub-color)] max-w-md">
            Sayt har qanday sekinlashuvsiz, yengil va tezkor reaktiv texnologiyalar asosida qurilgan.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[var(--text-color)]">{tech.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)]">
                  {tech.level}
                </span>
              </div>
              <p className="text-[10px] text-[var(--sub-color)] truncate">{tech.category}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQS */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)]">
            Tez-tez So'raladigan Savollar
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-1.5">
              <h4 className="font-bold text-xs text-[var(--text-color)] flex items-start gap-1.5">
                <span className="text-[var(--main-color)] font-mono">Q.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. QUICK ACTION CTAS */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--main-color)]/30 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)]">
            O'z Tezligingizni Sinashga Tayyormisiz?
          </h3>
          <p className="text-xs text-[var(--sub-color)]">
            Hoziroq yozish testini boshlang yoki Battle Arenada bellashing!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onStartTyping && (
            <button
              onClick={onStartTyping}
              className="px-5 py-2.5 rounded-xl bg-[var(--main-color)] text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>Yozish Testini Boshlash</span>
            </button>
          )}

          {onGoToBattle && (
            <button
              onClick={onGoToBattle}
              className="px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] hover:text-[var(--main-color)] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4 text-rose-500" />
              <span>Battle Arena</span>
            </button>
          )}

          {onGoToLessons && (
            <button
              onClick={onGoToLessons}
              className="px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] hover:text-[var(--main-color)] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Saboqlar</span>
            </button>
          )}

          {onGoToLeaderboard && (
            <button
              onClick={onGoToLeaderboard}
              className="px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] hover:text-[var(--main-color)] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Reyting</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
