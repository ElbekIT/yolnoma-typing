import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  Phone,
  PhoneCall,
  Send,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  Zap,
  Keyboard,
  Trophy,
  Swords,
  GraduationCap,
  ExternalLink,
  MessageSquare,
  Cpu,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Users,
  UserX,
  Crown,
  AlertTriangle,
  Clock,
  History,
  FileCode
} from 'lucide-react';

interface OwnerAboutViewProps {
  onStartTyping?: () => void;
  onGoToBattle?: () => void;
  onGoToLessons?: () => void;
  onGoToLeaderboard?: () => void;
  initialSubTab?: 'overview' | 'changelog' | 'security' | 'contact';
}

export const OwnerAboutView: React.FC<OwnerAboutViewProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToLeaderboard,
  initialSubTab = 'overview'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'changelog' | 'security' | 'contact'>(initialSubTab);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Direct Message Feedback form
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const phoneNumber = '+998904063090';
  const formattedPhone = '+998 90 406 30 90';
  const developerName = 'Elbek Qoriyev';
  const developerRole = 'Full-Stack Web Dasturchi & Platforma Asoschisi';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(formattedPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;

    setIsSendingFeedback(true);
    try {
      await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: feedbackName.trim() || 'Hurmatli Mehmon',
          senderEmail: feedbackEmail.trim() || 'anonim@yolnoma.uz',
          subject: 'Sayt Yangilanishi & Taklif',
          message: feedbackMsg.trim(),
          category: 'feedback',
          timestamp: Date.now()
        })
      });
      setFeedbackSent(true);
      setFeedbackMsg('');
    } catch {
      setFeedbackSent(true);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const changelogReleases = [
    {
      version: 'v2.6',
      date: '2026-yil, Mart',
      badge: 'Eng Soʻnggi Reliz (Hozirgi)',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      title: 'Kiber-Xavfsizlik, Real-time Bloklash & Yangilangan Administratorlar Paneli',
      highlights: [
        {
          icon: ShieldAlert,
          title: "Real-time Foydalanuvchini Bloklash & Sabab Koʻrsatish",
          desc: "Foydalanuvchi qoidabuzarlik yoki soxta natija kiritganda admin uni darhol bloklaydi. Bloklash sababi foydalanuvchi ekranida maxsus qizil kiber-qalqon ichida toʻliq koʻrinadi va saytga kirishi lahzada toʻxtatiladi."
        },
        {
          icon: Users,
          title: "Administratorlar Roʻyxati & Nozik Vakolatlar",
          desc: "Admin panelda barcha tayinlangan adminlar toʻliq koʻrinadi. Har bir admin uchun alohida 7 ta ruxsat (Reyting, Bloklash, Xabarnomalar, Inbox, Server, Maintenance, Adminlar) boshqariladi."
        },
        {
          icon: UserX,
          title: "Admindan Chiqarish (Instant Demotion)",
          desc: "Istalgan sub-adminni bitta tugma bilan adminlikdan chiqarish imkoniyati. Chiqarilgan zahoti uning barcha faol seanslari bekor qilinadi va Admin Panelga kirishi mutlaqo toʻxtatiladi."
        },
        {
          icon: Crown,
          title: "Bosh Administrator Daxlsizligi",
          desc: "Asosiy Bosh Administrator (yuldashivagavharoy@gmail.com) tizim darajasida himoyalangan — hech kim uni bloklay yoki admindan chiqara olmaydi."
        },
        {
          icon: Zap,
          title: "Optimallashtirilgan Reaktiv Tezlik & 60 FPS",
          desc: "Sayt kodlari tozalangan, ortiqcha tarmoq soʻrovlari bartaraf etilgan va 60 FPS darajasidagi ravon animatsiyalar bilan tezlashtirilgan."
        }
      ]
    },
    {
      version: 'v2.5',
      date: '2026-yil, Fevral',
      badge: 'Battle Arena & Realtime',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      title: 'Jonli Battle Arena & PUBG Uslubidagi Taklifnomalar',
      highlights: [
        {
          icon: Swords,
          title: "Koʻp Ishtirokchili Klaviaturadagi Jonli Poyga",
          desc: "Doʻstlar va hamkasblar bilan xona ochib, real-vaqtda bir-birining yozish tezligini jonli kuzatish imkoniyati yaratildi."
        },
        {
          icon: Send,
          title: "PUBG Uslubidagi Jonli Taklifnomalar",
          desc: "Onlayn doʻstlaringizga bitta tugma orqali jang taklifnomasini yuborish va qabul qilish tizimi integratsiya qilindi."
        }
      ]
    },
    {
      version: 'v2.0',
      date: '2026-yil, Yanvar',
      badge: 'Interaktiv Saboqlar',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      title: '10 Barmoq Bilan Yozish Saboqlari & Mexanik Ovozlar',
      highlights: [
        {
          icon: GraduationCap,
          title: "Touch Typing Interaktiv Darslari",
          desc: "Barmoqlarning boshlangʻich pozitsiyasidan boshlab murakkab matnlargacha bosqichma-bosqich saboqlar toʻplami."
        },
        {
          icon: Keyboard,
          title: "Web Audio API Mexanik Klaviatura Tovushlari",
          desc: "Cherry MX Blue, Brown, Red va retro yozuv mashinkasi (Typewriter) real audio simulyatsiyasi ishlab chiqildi."
        }
      ]
    },
    {
      version: 'v1.0',
      date: '2025-yil',
      badge: 'Boshlangʻich Reliz',
      badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      title: 'Yolnoma Typing Platformasining Ishga Tushirilishi',
      highlights: [
        {
          icon: Globe,
          title: "50+ Dunyo Tillari & RTL Qoʻllab-quvvatlash",
          desc: "Oʻzbekcha (Lotin va Kirill), Ingliz, Rus, Arab va 50 dan ortiq dunyo tillarida WPM test dvigateli ishga tushirildi."
        }
      ]
    }
  ];

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
      {/* Top Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-[var(--main-color)] text-white shadow-md'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Loyiha & Muallif</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('changelog')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'changelog'
              ? 'bg-[var(--main-color)] text-white shadow-md'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Sayt Yangilanishlari (Changelog v2.6)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px]">
            Yangi
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-[var(--main-color)] text-white shadow-md'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Xavfsizlik & Anti-Cheat Nizomi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'contact'
              ? 'bg-[var(--main-color)] text-white shadow-md'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
          }`}
        >
          <Phone className="w-4 h-4 text-cyan-400" />
          <span>Bogʻlanish & Muallif</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & FOUNDER */}
      {/* ============================================================ */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 1. HERO SECTION */}
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
                  <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Qo'llab-quvvatlangan Tillar</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]">
                  <div className="text-2xl font-black text-cyan-400 font-mono">10+</div>
                  <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Barmoq Saboqlari</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]">
                  <div className="text-2xl font-black text-amber-400 font-mono">24/7</div>
                  <div className="text-xs font-bold text-[var(--sub-color)] mt-0.5">Jonli Battle Arena</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. CREATOR CARD */}
          <section className="rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[var(--sub-alt)]">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[var(--main-color)] to-indigo-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shrink-0">
                  EQ
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[var(--main-color)]/10 text-[var(--main-color)] text-[11px] font-black uppercase tracking-wider font-mono">
                    <Code2 className="w-3 h-3" />
                    <span>Loyiha Asoschisi & Muallifi</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                    {developerName}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--sub-color)] font-medium">
                    {developerRole}
                  </p>
                </div>
              </div>

              {/* Creator Phone Badge */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                <div className="px-4 py-3 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-color)]">
                    <Phone className="w-4 h-4 text-[var(--main-color)]" />
                    <span>{formattedPhone}</span>
                  </div>
                  <button
                    onClick={handleCopyPhone}
                    className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
                    title="Raqamni nusxalash"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <a
                  href={`tel:${phoneNumber}`}
                  className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Qo'ng'iroq Qilish</span>
                </a>
              </div>
            </div>

            {/* Author Description */}
            <div className="pt-6 space-y-4 text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed">
              <p>
                Assalomu alaykum! Men <strong className="text-[var(--text-color)]">Elbek Qoriyev</strong>, Full-Stack veb-dasturchi va <strong className="text-[var(--text-color)]">Yolnoma Typing</strong> platformasining asoschisiman.
              </p>
              <p>
                Ushbu platforma O'zbekiston yoshlari, IT mutaxassislari, talabalar va barcha foydalanuvchilarning klaviaturada o'n barmoq bilan ko'r-ko'rona yozish ko'nikmalarini oshirish, tezlikni mukammal darajaga olib chiqish maqsadida professional darajada yaratildi.
              </p>
            </div>
          </section>

          {/* 3. PLATFORM CORE FEATURES */}
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

          {/* 4. TECH STACK */}
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

          {/* 5. FAQS */}
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

          {/* 6. CTAS */}
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
            </div>
          </section>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SAYT YANGILANISHLARI (CHANGELOG) */}
      {/* ============================================================ */}
      {activeSubTab === 'changelog' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Platforma Relizlari & Tarixi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
              Sayt Haqida Yangilanishlar (Changelog v2.6)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--sub-color)] max-w-3xl leading-relaxed">
              Yolnoma Typing platformasida amalga oshirilgan barcha muhim dasturiy oʻzgarishlar, yangi funksiyalar, xavfsizlik filtrlari va optimallashtirishlar xronologiyasi.
            </p>
          </div>

          {/* Timeline of Releases */}
          <div className="space-y-6">
            {changelogReleases.map((rel, relIdx) => (
              <div
                key={rel.version}
                className={`p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border ${
                  relIdx === 0 ? 'border-[var(--main-color)]/50 shadow-xl' : 'border-[var(--sub-alt)]'
                } space-y-6 relative overflow-hidden`}
              >
                {/* Release Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--sub-alt)] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl font-black font-mono text-[var(--text-color)]">
                        {rel.version}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rel.badgeColor}`}>
                        {rel.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-color)]">
                      {rel.title}
                    </h3>
                  </div>

                  <div className="text-xs font-mono text-[var(--sub-color)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{rel.date}</span>
                  </div>
                </div>

                {/* Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rel.highlights.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] space-y-2 hover:border-[var(--main-color)]/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 text-[var(--text-color)] font-bold text-xs sm:text-sm">
                          <div className="p-2 rounded-xl bg-[var(--card-bg)] text-[var(--main-color)] border border-[var(--sub-alt)]">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        <p className="text-xs text-[var(--sub-color)] leading-relaxed pl-1">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: XAVFSIZLIK & ANTI-CHEAT NIZOMI */}
      {/* ============================================================ */}
      {activeSubTab === 'security' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Halol Bellashuv & Anti-Cheat Siyosati</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
              Xavfsizlik va Foydalanuvchilarni Bloklash Nizomi
            </h1>
            <p className="text-xs sm:text-sm text-[var(--sub-color)] max-w-3xl leading-relaxed">
              Yolnoma Typing platformasida har bir ishtirokchining mehnati qadrlanadi. Shuning uchun soxta dasturlar, botlar yoki avto-klikerlar orqali reytingni buzishga urinishlar qatʼiyan man etiladi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-color)]">
                Taqiqlangan Harakatlar
              </h3>
              <ul className="text-xs text-[var(--sub-color)] space-y-2 list-disc list-inside leading-relaxed">
                <li>Brauzer konsoliga cheat skriptlar kiritish</li>
                <li>Avtomatik yozuvchi bot dasturlaridan foydalanish</li>
                <li>Matnni nusxalab toʻgʻridan-toʻgʻri tashlash (paste)</li>
                <li>Boshqa foydalanuvchilar akkauntiga noqonuniy kirish</li>
                <li>Chat va xabarnomalarda haqoratomuz soʻzlar ishlatish</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-color)]">
                Bloklash Jarayoni Qanday Ishlaydi?
              </h3>
              <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                Admin yoki avtomatlashtirilgan xavfsizlik filtri qoidabuzarni bloklagan zahoti:
              </p>
              <ul className="text-xs text-[var(--sub-color)] space-y-2 list-disc list-inside leading-relaxed">
                <li>Foydalanuvchining ekrani darhol qizil bloklash oynasiga oʻtadi</li>
                <li>Admin kiritgan aniq sabab ekranda koʻrsatiladi</li>
                <li>Reyting jadvalidan barcha soxta natijalari oʻchiriladi</li>
                <li>Foydalanuvchi qayta kirmasligi uchun UID va emaili qora roʻyxatga olinadi</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-color)]">
                Apellyatsiya va Qayta Koʻrib Chiqish
              </h3>
              <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                Agar hisobingiz adashib yoki texnik xatolik sababli toʻxtatilgan deb hisoblasangiz:
              </p>
              <ul className="text-xs text-[var(--sub-color)] space-y-2 list-disc list-inside leading-relaxed">
                <li>Bloklangan oynadagi "Apellyatsiya Yuborish" shaklini toʻldiring</li>
                <li>Arizangiz toʻgʻridan-toʻgʻri Bosh Administratorning Inboxiga tushadi</li>
                <li>Holat tekshirilib, xatolik tasdiqlansa hisob 24 soat ichida tiklanadi</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: BOG'LANISH & HAMKORLIK */}
      {/* ============================================================ */}
      {activeSubTab === 'contact' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Contact Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-black uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Tezkor Aloqa</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                  Muallif Bilan Toʻgʻridan-Toʻgʻri Bogʻlanish
                </h2>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Loyiha boʻyicha takliflar, hamkorlik, xatoliklar yoki savollar boʻyicha istalgan vaqtda murojaat qilishingiz mumkin.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--sub-color)] font-mono">Telefon / Aloqa</div>
                      <div className="text-sm font-bold text-[var(--text-color)] font-mono">{formattedPhone}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyPhone}
                    className="p-2 rounded-xl bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
                    title="Nusxalash"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <a
                  href="https://t.me/elbekdesign_va_webdasturchi_uz"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 hover:border-[#229ED9] flex items-center justify-between gap-3 transition-colors text-[var(--text-color)] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--sub-color)] font-mono">Telegram Manzil</div>
                      <div className="text-sm font-bold font-mono">@elbekdesign_va_webdasturchi_uz</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#229ED9]" />
                </a>
              </div>
            </div>

            {/* Right Message Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[var(--main-color)]" />
                  <span>Toʻgʻridan-Toʻgʻri Taklif Yuborish</span>
                </h3>
                <p className="text-xs text-[var(--sub-color)]">
                  Xabaringiz Bosh Administratorning Inbox boʻlimiga yetib boradi.
                </p>
              </div>

              {feedbackSent ? (
                <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Xabaringiz Qabul Qilindi!</span>
                  </div>
                  <p className="leading-relaxed">
                    Taklifingiz yoki fikringiz uchun rahmat! Maʼmuriyat xabaringizni tez fursatda koʻrib chiqadi.
                  </p>
                  <button
                    onClick={() => setFeedbackSent(false)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs cursor-pointer"
                  >
                    Yana Xabar Yozish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendDirectMessage} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--sub-color)] block mb-1">
                      Ismingiz (ixtiyoriy):
                    </label>
                    <input
                      type="text"
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="Misol: Sardor Aliyev"
                      className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--sub-color)] block mb-1">
                      Email yoki Telefon:
                    </label>
                    <input
                      type="text"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="Misol: user@yolnoma.uz yoki +998 90..."
                      className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--sub-color)] block mb-1">
                      Xabar / Taklif Matni:
                    </label>
                    <textarea
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                      rows={3}
                      required
                      placeholder="Sayt haqida fikringiz, yangilanishlar boʻyicha taklifingiz..."
                      className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingFeedback || !feedbackMsg.trim()}
                    className="w-full py-3 rounded-xl bg-[var(--main-color)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingFeedback ? 'Yuborilmoqda...' : 'Xabarni Yuborish'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
