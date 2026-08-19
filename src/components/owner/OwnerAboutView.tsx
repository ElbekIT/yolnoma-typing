import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { user, profile } = useAuth();

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackPhone, setFeedbackPhone] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Security & Anti-Proxy/Bot states
  const [formRenderTime] = useState<number>(() => Date.now());
  const [secChallenge, setSecChallenge] = useState<{
    token: string;
    timestamp: number;
    nonce: string;
  } | null>(null);

  const phoneNumber = '+998904063090';
  const formattedPhone = '+998 90 406 30 90';
  const developerName = 'Elbek Qoriyev';
  const developerRole = 'Full-Stack Web Dasturchi & Platforma Asoschisi';

  // Get or create persistent device fingerprint (bypasses proxy IP rotations)
  const getOrCreateDeviceId = (): string => {
    try {
      let dId = localStorage.getItem('yolnoma_device_sec_id');
      if (!dId) {
        const raw = `${navigator.userAgent}_${window.screen.width}x${window.screen.height}_${Intl.DateTimeFormat().resolvedOptions().timeZone}_${Date.now()}_${Math.random()}`;
        dId = 'dev_' + btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
        localStorage.setItem('yolnoma_device_sec_id', dId);
      }
      return dId;
    } catch {
      return 'dev_fallback_' + Date.now();
    }
  };

  // Fetch security verification challenge on mount
  useEffect(() => {
    fetch('/api/security/challenge')
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setSecChallenge({
            token: data.token,
            timestamp: data.timestamp,
            nonce: data.nonce
          });
        }
      })
      .catch(() => {});
  }, []);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (user && !feedbackName) {
      setFeedbackName(profile?.displayName || user.displayName || '');
    }
  }, [user, profile]);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(formattedPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackMsg.trim()) return;

    // Honeypot check (Silent trap for bots)
    if (honeypot) {
      setSendSuccess(true);
      return;
    }

    setIsSending(true);
    setSendError(null);

    const userContext = {
      isAuth: !!user,
      email: user?.email || '',
      displayName: profile?.displayName || user?.displayName || '',
      wpm: profile?.highestWpm || 0,
      tests: profile?.totalTests || 0,
      level: profile?.level || 1,
      uid: user?.uid || ''
    };

    const deviceId = getOrCreateDeviceId();
    const BOT_TOKEN = '8591793719:AAEK0fsg9zUtkKpLcI9YT8fkQwealbBLGLg';
    const CHAT_ID = '8269163077';

    // Helper to format direct telegram HTML message
    const buildTelegramMessage = () => {
      const escapeHtml = (text: string) =>
        String(text || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      const safeName = escapeHtml(feedbackName.trim());
      const safeContact = escapeHtml(feedbackPhone.trim() || 'Kiritilmagan');
      const safeMsg = escapeHtml(feedbackMsg.trim());

      const formattedDate = new Date().toLocaleString('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
🚀 <b>YANGI MUROJAAT — Yolnoma Typing</b>

👤 <b>Yuboruvchi:</b> ${safeName}
📞 <b>Telefon / Telegram:</b> ${safeContact}
💬 <b>Xabar matni:</b>
${safeMsg}

━━━━━━━━━━━━━━━━━━━━
📊 <b>Foydalanuvchi ma'lumotlari:</b>
• <b>Holat:</b> ${userContext.isAuth ? '✅ Tizimga kirgan aʼzo' : '👤 Mehmon (Guest)'}
${userContext.isAuth ? `• <b>Ism/Nik:</b> ${escapeHtml(userContext.displayName)}
• <b>Email:</b> <code>${escapeHtml(userContext.email)}</code>
• <b>Daraja:</b> LVL ${userContext.level}
• <b>Eng yuqori WPM:</b> ${userContext.wpm} WPM
• <b>Jami testlar:</b> ${userContext.tests} ta` : ''}
🛡️ <b>Xavfsizlik:</b> Himoyalangan Sessiya
⏰ <b>Vaqt:</b> ${formattedDate} (Toshkent)
      `.trim();
    };

    let sentSuccessfully = false;

    // 1. Try Backend Proxy /api/contact first
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: feedbackName.trim(),
          phone: feedbackPhone.trim(),
          message: feedbackMsg.trim(),
          userContext,
          deviceId,
          renderTime: formRenderTime,
          secToken: secChallenge?.token,
          secTimestamp: secChallenge?.timestamp,
          secNonce: secChallenge?.nonce,
          _hp: honeypot
        })
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = null;
      }

      if (response.ok && data?.success) {
        sentSuccessfully = true;
      } else if (response.status === 429 && data?.error) {
        // Rate limited by backend
        throw new Error(data.error);
      }
    } catch (apiErr: any) {
      if (apiErr.message && apiErr.message.includes('chegarasi')) {
        setSendError(apiErr.message);
        setIsSending(false);
        return;
      }
      // If backend returned 404 or HTML (e.g., static hosting on yolnoma.uz), fallback to direct API
    }

    // 2. Direct Telegram API Fallback (if backend is not mounted or static hosting)
    if (!sentSuccessfully) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: buildTelegramMessage(),
            parse_mode: 'HTML'
          })
        });

        const tgText = await tgRes.text();
        let tgData: any = null;
        try {
          tgData = JSON.parse(tgText);
        } catch {
          tgData = null;
        }

        if (tgRes.ok && tgData?.ok) {
          sentSuccessfully = true;
        } else {
          throw new Error(tgData?.description || 'Telegramga yuborishda xatolik');
        }
      } catch (tgErr: any) {
        console.error('Direct Telegram send error:', tgErr);
      }
    }

    if (sentSuccessfully) {
      setSendSuccess(true);
      setFeedbackMsg('');
      if (!user) {
        setFeedbackName('');
        setFeedbackPhone('');
      }
      setTimeout(() => setSendSuccess(false), 5000);
    } else {
      setSendError('Xabarni yuborishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
    }

    setIsSending(false);
  };

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
    { name: "Telegram Bot API", category: "Instant Direct Feedback", level: "Integration" }
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
      a: "Web-saytlar, murakkab CRM tizimlar, Telegram botlar, Full-Stack web ilovalar, startap loyihalar yoki ta'limiy platformalarni noldan yaratish bo'yicha bevosita Elbek Qoriyev bilan bog'lanishingiz mumkin."
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

            {/* Direct Contact Phone Box */}
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase tracking-wider block">To'g'ridan-to'g'ri Telefon</span>
                    <a
                      href={`tel:${phoneNumber}`}
                      className="text-base sm:text-lg font-mono font-black text-[var(--text-color)] hover:text-[var(--main-color)] transition-colors"
                    >
                      {formattedPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPhone}
                    className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      copiedPhone
                        ? 'bg-emerald-500 text-white font-black'
                        : 'bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/80 text-[var(--text-color)] border border-[var(--sub-color)]/20'
                    }`}
                    title="Raqamdan nusxa olish"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Nusxa Olindi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nusxa olish</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${phoneNumber}`}
                    className="px-3.5 py-2 rounded-xl bg-[var(--main-color)] text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Qo'ng'iroq</span>
                  </a>
                </div>
              </div>

              {/* Telegram link */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--sub-color)]/15 text-xs">
                <a
                  href="https://t.me/qoriyev_elbek"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram: @qoriyev_elbek</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  href={`sms:${phoneNumber}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS Yuborish</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIRECT TELEGRAM FEEDBACK FORM (Fast, Connected to Bot) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col justify-between space-y-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[var(--main-color)] tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>To'g'ridan-to'g'ri Aloqa</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
              Dasturchiga Xabar Qoldirish
            </h3>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Xabaringiz <strong className="text-[var(--text-color)]">Telegram Bot</strong> orqali bevosita Elbek Qoriyevga soniyalar ichida yetib boradi. Fikr-mulohazalaringiz yoki hamkorlik takliflaringizni yozib qoldirishingiz mumkin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 space-y-2.5">
            <div className="text-xs font-bold text-[var(--text-color)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--main-color)]" />
              <span>Sizning Ma'lumotlaringiz:</span>
            </div>
            <div className="text-xs text-[var(--sub-color)] space-y-1">
              <div>
                <strong className="text-[var(--text-color)]">Holat:</strong>{' '}
                {user ? (
                  <span className="text-emerald-500 font-bold">Akkauntga kirilgan ({user.email})</span>
                ) : (
                  <span className="text-amber-500 font-bold">Mehmon (Kiritilgan ma'lumotlar bilan yuboriladi)</span>
                )}
              </div>
              {profile?.highestWpm ? (
                <div>
                  <strong className="text-[var(--text-color)]">Shaxsiy rekord:</strong> {profile.highestWpm} WPM
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)]">
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base sm:text-lg font-black text-[var(--text-color)] flex items-center gap-2">
                <Send className="w-4 h-4 text-[var(--main-color)]" />
                <span>To'g'ridan-to'g'ri Xabar Qoldirish</span>
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20">
                Telegram Bot Ulangan
              </span>
            </div>

            {sendSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-emerald-500 text-sm">Xabaringiz Muvaffaqiyatli Yuborildi!</h5>
                  <p className="text-[var(--sub-color)] mt-0.5">
                    Xabar Telegram orqali dasturchiga yetkazildi. Tez orada siz bilan bog'laniladi.
                  </p>
                </div>
              </div>
            )}

            {sendError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-rose-500 text-sm">Yuborishda xatolik</h5>
                  <p className="text-[var(--sub-color)] mt-0.5">{sendError}</p>
                </div>
              </div>
            )}

            {/* Honeypot field (hidden from real users, traps spambots) */}
            <input
              type="text"
              name="_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

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
              disabled={isSending}
              className="w-full py-3 rounded-xl bg-[var(--main-color)] text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Telegramga Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Xabarni Yuborish</span>
                </>
              )}
            </button>
          </form>
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
        </div>
      </section>
    </div>
  );
};
