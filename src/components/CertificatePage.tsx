import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Activity,
  Flame,
  ArrowLeft,
  Lock,
  ShieldCheck,
  LogIn,
  Timer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWpmTitle } from './share/ShareResultCertificateModal';

interface CertificatePageProps {
  onBackToHome: () => void;
  onOpenLogin?: () => void;
  initialResult?: {
    wpm?: number;
    accuracy?: number;
    duration?: number;
  };
}

export const CertificatePage: React.FC<CertificatePageProps> = ({
  onBackToHome,
  onOpenLogin,
  initialResult
}) => {
  const { user, profile, loading } = useAuth();

  // 1 to 100 loading progress state
  const [loadProgress, setLoadProgress] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Exact 10 seconds timer after 100% loading
  const [timeLeftMs, setTimeLeftMs] = useState<number>(10000); // 10,000 ms = 10s
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [screenshotNotified, setScreenshotNotified] = useState<boolean>(false);

  const certCardRef = useRef<HTMLDivElement>(null);

  // 1. Loading sequence from 1% to 100%
  useEffect(() => {
    if (!user) return; // Authentication gate handles unauthenticated users

    setLoadProgress(1);
    setIsLoaded(false);
    setIsExpired(false);
    setTimeLeftMs(10000);

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        // Increment smoothly to reach 100% in ~1.5 seconds
        const step = Math.floor(Math.random() * 4) + 2;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoaded(true);
          }, 250);
          return 100;
        }
        return next;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [user]);

  // 2. Exact 10-second auto-expiry countdown once loaded
  useEffect(() => {
    if (!isLoaded || isExpired) return;

    const intervalTime = 100; // update every 100ms for ultra-smooth countdown bar
    const timer = setInterval(() => {
      setTimeLeftMs((prev) => {
        const remaining = prev - intervalTime;
        if (remaining <= 0) {
          clearInterval(timer);
          // 10 soniya o'tdi: eski sertifikat o'chiriladi va bosh sahifaga qaytiladi!
          setIsExpired(true);
          setTimeout(() => {
            onBackToHome();
          }, 800);
          return 0;
        }
        return remaining;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isLoaded, isExpired, onBackToHome]);

  // Handle mock flash effect when user takes screenshot
  const handleTriggerScreenshotMode = () => {
    setIsFlashActive(true);
    setScreenshotNotified(true);
    setTimeout(() => {
      setIsFlashActive(false);
    }, 350);
  };

  // User stats & metrics calculation
  const bestWpm = initialResult?.wpm || profile?.highestWpm || 65;
  const bestAccuracy = Math.round(initialResult?.accuracy || profile?.highestAccuracy || 98);
  const testDuration = initialResult?.duration || 60;
  const totalCompletedTests = profile?.totalTests || 1;
  const currentStreak = profile?.currentStreak || 1;

  const { title: rankTitle, badge: rankBadge, color: rankColor } = getWpmTitle(bestWpm);

  const userDisplayName =
    profile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Tezkor Yozuvchi');

  const avatarUrl =
    profile?.avatarUrl ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userDisplayName)}`;

  const certificateNumber = `YLN-${(profile?.uid || user?.uid || 'CERT').slice(0, 6).toUpperCase()}-${bestWpm}`;
  const issueDate = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const secondsRemaining = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / 10000) * 100));

  // =========================================================================
  // Gate: Only authenticated users can receive the official certificate
  // =========================================================================
  if (!loading && !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] tracking-tight">
              Sertifikat Faqat Ro'yxatdan O'tganlarga Beriladi!
            </h2>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Rasmiy Yolnoma Typing sertifikati egasining shaxsini tasdiqlash uchun ro'yxatdan o'tgan bo'lishi talab etiladi. Natijangiz va ism-sharifingiz profilga biriktiriladi.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBackToHome}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] font-bold text-xs transition-colors cursor-pointer"
            >
              Bosh Sahifaga Qaytish
            </button>
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Kirish / Ro'yxatdan O'tish</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Loading Stage: 1 dan 100 gacha zagruzka
  // =========================================================================
  if (!isLoaded) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative shadow-inner">
              <Award className="w-10 h-10 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/40 animate-ping opacity-25" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Sertifikatingiz Tayyorlanmoqda...
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {loadProgress < 40 && "Foydalanuvchi ma'lumotlari tekshirilmoqda..."}
                {loadProgress >= 40 && loadProgress < 75 && "Tezlik va aniqlik ko'rsatkichlari hisoblanmoqda..."}
                {loadProgress >= 75 && loadProgress < 100 && "Elektron muhr va unvon biriktirilmoqda..."}
                {loadProgress === 100 && "Sertifikat tayyor! Yuklanmoqda..."}
              </p>
            </div>

            {/* Dynamic 1 to 100% Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  Yuklanish holati:
                </span>
                <span className="text-emerald-400 font-black text-base">{loadProgress}%</span>
              </div>
              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-75 shadow-sm"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>O'zbekiston №1 Rasmiy Milliy Reytingi</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Expired Stage: 10 soniya o'tdi, eski sertifikat o'chib ketadi
  // =========================================================================
  if (isExpired) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-out-95 duration-500">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">
            10 Sekundlik Ko'rish Vaqti Tugadi!
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Eski sertifikat xavfsizlik maqsadida o'chirildi. Bosh sahifaga avtomatik tarzda yo'naltirilmoqdasiz...
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Main Certificate Screen (Screenshot ready, 10s auto-closing)
  // =========================================================================
  return (
    <div className="min-h-[90vh] py-4 px-2 sm:px-4 max-w-4xl mx-auto flex flex-col items-center justify-center relative animate-in fade-in duration-300">
      {/* Screen flash effect for screenshot */}
      {isFlashActive && (
        <div className="fixed inset-0 z-50 bg-white opacity-80 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Top Controller Bar: Countdown timer & Quick Screenshot Button */}
      <div className="w-full max-w-3xl flex flex-col gap-2.5 mb-4 bg-slate-900/95 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Bosh sahifaga</span>
          </button>

          {/* 10 Second Auto-Close Countdown Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-black">
              <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>
                Avtomatik yopilish: <strong className="text-white text-sm ml-1 font-mono">{secondsRemaining}s</strong>
              </span>
            </div>
          </div>

          {/* Screenshot Shutter Button */}
          <button
            onClick={handleTriggerScreenshotMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Ekraningizni bemalol screenshot qilib oling"
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>Screenshot olish</span>
          </button>
        </div>

        {/* Depleting 10-second progress bar (10s to 0s) */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {screenshotNotified && (
        <div className="w-full max-w-3xl mb-3 p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Telefoningizda skrinshot (Power+Ovoz) yoki kompyuterda (Win+Shift+S) orqali saqlab oling!</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ================= ULTRA LUXURY CERTIFICATE ============= */}
      {/* ======================================================== */}
      <div
        ref={certCardRef}
        id="official-certificate-card"
        className="w-full max-w-3xl relative rounded-3xl p-6 sm:p-10 border-4 border-amber-500/40 shadow-2xl overflow-hidden select-none bg-gradient-to-br from-[#0a0f1d] via-[#0f172a] to-[#060913] text-white"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(59, 130, 246, 0.15)'
        }}
      >
        {/* Luxury Gold/Cyan Corner Ornaments */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-400/80 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-400/80 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-400/80 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-400/80 rounded-br-3xl pointer-events-none" />

        {/* Ambient Radial Lights */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Watermark Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Inner Border Line */}
        <div className="border border-amber-400/20 rounded-2xl p-5 sm:p-8 relative z-10 flex flex-col items-center text-center">
          {/* 1. Header: Platform Emblem & Official Title */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-400/30 shadow-md">
              <Award className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black tracking-widest text-blue-400 font-mono block">
                YOLNOMA TYPING
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                O'zbekiston №1 Klaviatura Trenajyori
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase mt-3 mb-1">
            Rasmiy Mahorat Sertifikati
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-300 font-mono max-w-lg mb-6">
            Ushbu sertifikat egasining kompyuter klaviaturasida tez va aniq matn terish bo'yicha yuqori darajadagi professional ko'nikmaga ega ekanligini tasdiqlaydi.
          </p>

          {/* 2. User Profile Picture & Name (Centered at the very top of certificate) */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-blue-500 to-indigo-500 shadow-xl">
                <img
                  src={avatarUrl}
                  alt={userDisplayName}
                  className="w-full h-full rounded-full object-cover bg-slate-900 border-2 border-slate-900"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', `https://api.dicebear.com/7.x/bottts/svg?seed=Yolnoma`);
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md border-2 border-slate-900" title="Tasdiqlangan Foydalanuvchi">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{userDisplayName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Tasdiqlangan
              </span>
            </h2>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border shadow-sm"
                style={{
                  backgroundColor: `${rankColor}20`,
                  borderColor: `${rankColor}50`,
                  color: rankColor
                }}
              >
                {rankBadge} • {rankTitle}
              </span>
            </div>
          </div>

          {/* 3. Hero WPM Indicator */}
          <div className="w-full max-w-md bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden shadow-inner">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
              Qayd Etilgan Tezlik
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-md">
                {bestWpm}
              </span>
              <span className="text-lg sm:text-2xl font-black font-mono text-blue-400">
                WPM
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              (daqiqasiga so'z soni / Words Per Minute)
            </div>
          </div>

          {/* 4. Detailed Metrics 4-Box Grid: Aniqlik, Davomiylik, Mashqlar soni, Streak */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full mb-6">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
              <Target className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Aniqlik (Acc)</span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">{bestAccuracy}%</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
              <Clock className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Yozish Vaqti</span>
              <span className="text-lg sm:text-xl font-black font-mono text-sky-400">{testDuration} soniya</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
              <Activity className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Mashqlar Soni</span>
              <span className="text-lg sm:text-xl font-black font-mono text-purple-400">{totalCompletedTests} marta</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center">
              <Flame className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Faol Ketma-ketlik</span>
              <span className="text-lg sm:text-xl font-black font-mono text-amber-400">{currentStreak} kun</span>
            </div>
          </div>

          {/* 5. Official Verification Stamp & Serial ID */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/90 text-left">
            <div className="flex items-center gap-3">
              {/* Gold Official Stamp */}
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400/70 p-1 flex items-center justify-center text-amber-400 shrink-0">
                <div className="w-full h-full rounded-full border border-amber-400/50 flex flex-col items-center justify-center text-[8px] font-mono font-black uppercase leading-tight text-center">
                  <span>YOLNOMA</span>
                  <span className="text-[6px] text-amber-200">VERIFIED</span>
                  <span>★★★★★</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Sertifikat Seriyasi:</span>
                <span className="text-xs font-mono font-bold text-amber-300 block">{certificateNumber}</span>
                <span className="text-[10px] text-slate-500 font-mono block">Berilgan sana: {issueDate}</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 font-mono block">Rasmiy Manzil:</span>
              <span className="text-xs font-mono font-bold text-blue-400 block">https://www.yolnoma.uz</span>
              <span className="text-[9px] text-slate-500 font-mono block">Elektron tekshiruvdan o'tgan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Helper notice */}
      <p className="mt-4 text-[11px] text-slate-400 font-mono text-center max-w-md">
        📸 <span className="text-amber-300 font-bold">Screenshot qilib oling:</span> Telefoningiz yoki kompyuteringiz orqali ushbu sahifani rasmga olib saqlang. 10 soniyadan so'ng eski sertifikat o'chiriladi va bosh sahifaga qaytiladi.
      </p>
    </div>
  );
};
