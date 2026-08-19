import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  Phone,
  PhoneCall,
  Mail,
  Send,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  Zap,
  Award,
  Keyboard,
  Trophy,
  Swords,
  GraduationCap,
  Heart,
  ExternalLink,
  MessageSquare,
  Cpu,
  Layers,
  CheckCircle2,
  Users,
  Star,
  ChevronRight,
  Terminal
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
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackPhone, setFeedbackPhone] = useState('');

  const phoneNumber = '+998904063090';
  const formattedPhone = '+998 90 406 30 90';
  const developerName = 'Elbek Qoriyev';
  const developerRole = 'Full-Stack Web Dasturchi & Platforma Asoschisi';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(formattedPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackName('');
      setFeedbackPhone('');
      setFeedbackMsg('');
      setFeedbackSent(false);
    }, 4000);
  };

  const platformFeatures = [
    {
      icon: Keyboard,
      title: "Real-time Tezlik O'lchash",
      desc: "WPM (so'z/daqiqa), CPM (belgi/daqiqa) va Aniqlik (%) ko'rsatkichlarini soniyaning har bir mikrolahzasida hisoblovchi matematik motor.",
      badge: "Tezkor Motor",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Swords,
      title: "Jonli Battle Arena",
      desc: "Do'stlar va onlayn foydalanuvchilar bilan real-vaqtda klaviatura poygalari o'tkazish, taklifnoma yuborish va PUBG-uslubidagi jang tizimi.",
      badge: "Realtime Multiplayer",
      color: "from-rose-500 to-amber-500"
    },
    {
      icon: GraduationCap,
      title: "Interaktiv Saboqlar & Mashqlar",
      desc: "10 barmoq bilan ko'r-ko'rona yozish (touch typing) metodikasi, barmoqlar pozitsiyasi va bosqichma-bosqich malaka oshirish kurslari.",
      badge: "Ta'limiy Darslar",
      color: "from-emerald-500 to-teal-400"
    },
    {
      icon: Trophy,
      title: "Global & Milliy Reyting",
      desc: "Doimiy avtomatik yangilanuvchi yetakchilar jadvali, ligalar, chempionlik unvonlari va eng yuqori natijalar ro'yxati.",
      badge: "Jonli Sinxronlash",
      color: "from-amber-500 to-yellow-400"
    },
    {
      icon: ShieldCheck,
      title: "Xavfsizlik & Anti-Cheat",
      desc: "Nusxa ko'chirish (paste), sun'iy skriptlar va botlarni bir zumda aniqlab, soxta natijalarni reytingdan cheklovchi xavfsizlik algoritmi.",
      badge: "100% Halol Natija",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "50+ Tillar va RTL Qo'llab-quvvatlash",
      desc: "O'zbekcha (Lotin/Kirill), Ingliz, Rus, Arab va 50 dan ortiq dunyo tillarida yozish imkoniyati hamda Right-To-Left yozuv tizimi.",
      badge: "Universal Ekotizim",
      color: "from-teal-500 to-emerald-400"
    }
  ];

  const techStack = [
    { name: "React 18", category: "Frontend Framework", level: "Senior" },
    { name: "TypeScript", category: "Type Safety & Robust Logic", level: "Advanced" },
    { name: "Tailwind CSS", category: "Modern Responsive UI/UX", level: "Expert" },
    { name: "Firebase RTDB", category: "Realtime Battle & Sockets", level: "Architecture" },
    { name: "Cloud Firestore", category: "Persistent Big Data", level: "Database" },
    { name: "Web Audio API", category: "Mechanical Switch Sound Synthesizer", level: "Interactive" },
    { name: "Anti-Cheat Engine", category: "Keystroke Timing Validation", level: "Security" },
    { name: "PWA & Cloud Run", category: "Cloud Deployment & Scale", level: "DevOps" }
  ];

  const faqs = [
    {
      q: "Yolnoma Typing nima uchun yaratilgan?",
      a: "Yolnoma platformasi O'zbekistonda yoshlar, dasturchilar, talabalar va barcha kasb egalarining klaviaturada tez va aniq yozish ko'nikmalarini oshirish, ularning mehnat unumdorligini 3-5 baravarga ko'paytirish maqsadida yaratilgan zamonaviy milliy ekotizimdir."
    },
    {
      q: "WPM va Aniqlik qanday hisoblanadi?",
      a: "WPM (Words Per Minute) xalqaro standart bo'yicha har 5 ta to'g'ri terilgan belgi 1 ta standart so'z hisoblanadi va sarflangan daqiqaga bo'linadi. Aniqlik esa umumiy bosilgan tugmalar ichida to'g'ri kiritilgan belgilar foizini ifodalaydi."
    },
    {
      q: "Sayt orqali dasturchi bilan qanday loyihalar bo'yicha bog'lanish mumkin?",
      a: "Web-saytlar, murakkab CRM tizimlar, Telegram botlar, Full-Stack web ilovalar, startap loyihalar yoki ta'limiy platformalarni noldan yaratish bo'yicha bevosita Elbek Qoriyev bilan bog'lanishingiz mumkin."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--sub-alt)]/50 to-[var(--card-bg)] border border-[var(--sub-alt)] p-6 sm:p-10 lg:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[var(--main-color)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--main-color)]/15 border border-[var(--main-color)]/30 text-[var(--main-color)] text-xs font-black uppercase tracking-wider mb-5">
            <Sparkles className="w-4 h-4" />
            <span>Platforma & Muallif Haqida</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-color)] tracking-tight leading-tight mb-5">
            Yolnoma Typing — O'zbekistondagi №1 Zamonaviy Tez Yozish Ekotizimi
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--sub-color)] font-medium leading-relaxed mb-8">
            Ushbu platforma klaviaturada <span className="text-[var(--text-color)] font-bold">10 barmoq bilan ko'r-ko'rona</span> tez va professional yozishni o'rganish, jonli musobaqalarda qatnashish hamda kompyuterda ishlash samaradorligini eng yuqori darajaga olib chiqish uchun noldan maxsus ishlab chiqilgan.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-[var(--main-color)] font-mono">100%</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Bepul & Ochiq</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">50+</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Dunyo Tillari</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">0.05s</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Realtime Javob</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">24/7</div>
              <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Jonli Battle Arena</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CREATOR / OWNER CARD (Highlighted & Prominent) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-[var(--main-color)]/50 p-6 sm:p-10 lg:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--main-color)]/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Avatar & Badges */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[var(--main-color)] via-cyan-400 to-indigo-500 opacity-75 blur group-hover:opacity-100 transition duration-500" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-slate-900 border-2 border-[var(--main-color)] flex flex-col items-center justify-center p-4 overflow-hidden shadow-2xl">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[var(--main-color)] to-cyan-400 text-slate-950 flex items-center justify-center font-black text-4xl shadow-inner">
                  EQ
                </div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--main-color)]">
                  Founder & Dev
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mt-4 tracking-tight text-white flex items-center gap-2">
              {developerName}
              <CheckCircle2 className="w-6 h-6 text-[var(--main-color)] fill-[var(--main-color)]/20" />
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 mt-1">
              {developerRole}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Loyiha va Hamkorlikka Ochiq</span>
            </div>
          </div>

          {/* Details & Direct Contact */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--main-color)]">
                <Code2 className="w-4 h-4" />
                <span>Loyiha Muallifi Haqida</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                "Ushbu platforma yoshlarimizning kompyuter va dasturlash olamidagi tezligini yangi bosqichga olib chiqish uchun yaratildi."
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Men <strong className="text-white font-bold">{developerName}</strong> — Full-Stack Web dasturchiman. Zamonaviy foydalanuvchi interfeyslari (UI/UX), real-vaqt ma'lumotlar almashinuvi, xavfsiz va yuqori tezlikda ishlovchi web ilovalarni yaratishga ixtisoslashganman. 
                <br className="hidden sm:inline" />
                <strong>Yolnoma Typing</strong> loyihasining g'oyasi, dizayni, arxitekturasi va dasturiy kodi to'liq men tomonimdan ishlab chiqilgan.
              </p>
            </div>

            {/* Direct Contact Phone Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--main-color)]/20 border border-[var(--main-color)]/40 text-[var(--main-color)] flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">To'g'ridan-to'g'ri Telefon</span>
                    <a
                      href={`tel:${phoneNumber}`}
                      className="text-lg sm:text-xl font-mono font-black text-white hover:text-[var(--main-color)] transition-colors"
                    >
                      {formattedPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPhone}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      copiedPhone
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                    title="Raqamdan nusxa olish"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Nusxa Olindi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Nusxa olish</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${phoneNumber}`}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--main-color)] to-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-[var(--main-color)]/30 hover:opacity-95 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Qo'ng'iroq Qilish</span>
                  </a>
                </div>
              </div>

              {/* Quick Communication Channels */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
                <a
                  href="https://t.me/qoriyev_elbek"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 transition-colors font-bold"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram: @qoriyev_elbek</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>

                <a
                  href={`sms:${phoneNumber}`}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-colors font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS Yuborish</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CORE FEATURES */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-xs font-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Platforma Imkoniyatlari</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
            Nega Aynan Yolnoma Typing?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--sub-color)]">
            Foydalanuvchiga maksimal qulaylik, mukammal o'rganish tajribasi va adolatli raqobat muhitini taqdim etuvchi xususiyatlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platformFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-[var(--main-color)]/50 transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--sub-alt)] group-hover:bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[var(--sub-alt)] text-[var(--sub-color)] font-mono">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[var(--sub-color)] mt-2 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TECH STACK & ARCHITECTURE */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--sub-alt)] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[var(--main-color)] tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Arxitektura & Texnologiyalar</span>
            </div>
            <h3 className="text-xl font-black text-[var(--text-color)] mt-1">
              Zamonaviy Muhandislik Va Tezkorlik
            </h3>
          </div>
          <p className="text-xs text-[var(--sub-color)] max-w-md">
            Sayt har qanday sekinlashuvsiz, soniyaning yuzdan bir ulushida ishlovchi reaktiv texnologiyalar asosida qurilgan.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] space-y-1 hover:border-[var(--main-color)]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-[var(--text-color)]">{tech.name}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)]">
                  {tech.level}
                </span>
              </div>
              <p className="text-[11px] text-[var(--sub-color)] truncate">{tech.category}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEEDBACK / CONTACT FORM */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--sub-alt)]/60 border border-[var(--sub-alt)] flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[var(--main-color)] tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Hamkorlik & Aloqa</span>
            </div>
            <h3 className="text-2xl font-black text-[var(--text-color)]">
              Taklif yoki Savolingiz Bormi?
            </h3>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Platformani yanada rivojlantirish bo'yicha takliflaringiz, homiylik yoki web-dasturlash xizmatlari bo'yicha buyurtmalaringiz bo'lsa, to'g'ridan-to'g'ri murojaat qilishingiz mumkin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
            <div className="text-xs font-bold text-[var(--text-color)] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--main-color)]" />
              <span>Bog'lanish Ma'lumotlari:</span>
            </div>
            <div className="text-xs text-[var(--sub-color)] space-y-1">
              <div><strong className="text-[var(--text-color)]">Dasturchi:</strong> {developerName}</div>
              <div><strong className="text-[var(--text-color)]">Telefon:</strong> {formattedPhone}</div>
              <div><strong className="text-[var(--text-color)]">Telegram:</strong> @qoriyev_elbek</div>
              <div><strong className="text-[var(--text-color)]">Hudud:</strong> O'zbekiston</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)]">
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <h4 className="text-lg font-black text-[var(--text-color)]">
              To'g'ridan-to'g'ri Xabar Qoldirish
            </h4>

            {feedbackSent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="text-base font-black text-emerald-300">Xabaringiz Qabul Qilindi!</h5>
                <p className="text-xs text-slate-300">
                  Murojaatingiz uchun tashakkur. Tez orada siz bilan bog'lanamiz.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-color)]">Ismingiz</label>
                    <input
                      type="text"
                      required
                      placeholder="Ismingizni kiriting..."
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-color)]">Telefon yoki Telegram</label>
                    <input
                      type="text"
                      required
                      placeholder="+998 90 ... yoki @username"
                      value={feedbackPhone}
                      onChange={(e) => setFeedbackPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-color)]">Xabaringiz / Fikringiz</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Platforma haqida fikringiz yoki hamkorlik taklifingizni yozing..."
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--main-color)] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[var(--main-color)]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Xabarni Yuborish</span>
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* 6. FAQS */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
            Tez-tez So'raladigan Savollar
          </h3>
          <p className="text-xs text-[var(--sub-color)]">
            Foydalanuvchilar tomonidan eng ko'p beriladigan savollarga javoblar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--text-color)] flex items-start gap-2">
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
      <section className="p-8 rounded-3xl bg-gradient-to-r from-[var(--main-color)]/15 via-[var(--sub-alt)] to-[var(--main-color)]/10 border border-[var(--main-color)]/30 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
            O'z Tezligingizni Sinashga Tayyormisiz?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--sub-color)]">
            Hoziroq yozish testini boshlang yoki do'stlaringiz bilan Battle Arenada kuch sinashing!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onStartTyping && (
            <button
              onClick={onStartTyping}
              className="px-6 py-3 rounded-2xl bg-[var(--main-color)] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[var(--main-color)]/25 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>Yozish Testini Boshlash</span>
            </button>
          )}

          {onGoToBattle && (
            <button
              onClick={onGoToBattle}
              className="px-5 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--text-color)] hover:text-[var(--main-color)] hover:border-[var(--main-color)] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4 text-rose-500" />
              <span>Battle Arena</span>
            </button>
          )}

          {onGoToLessons && (
            <button
              onClick={onGoToLessons}
              className="px-5 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--text-color)] hover:text-[var(--main-color)] hover:border-[var(--main-color)] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Saboqlar</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
