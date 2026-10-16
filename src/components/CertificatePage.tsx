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
  // Main Certificate Screen (Screenshot ready, landscape, 10s auto-closing)
  // =========================================================================
  return (
    <div className="min-h-[85vh] py-2 sm:py-4 px-2 sm:px-4 max-w-4xl mx-auto flex flex-col items-center justify-center relative animate-in fade-in duration-300">
      {/* Screen flash effect for screenshot */}
      {isFlashActive && (
        <div className="fixed inset-0 z-50 bg-white opacity-80 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Top Controller Bar: Countdown timer & Quick Screenshot Button */}
      <div className="w-full max-w-4xl flex flex-col gap-2 mb-3 bg-slate-900/95 border border-slate-800/80 p-2.5 sm:p-3 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bosh sahifaga</span>
          </button>

          {/* 10 Second Auto-Close Countdown Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-black">
              <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>
                Avtomatik yopilish: <strong className="text-white text-xs sm:text-sm ml-1 font-mono">{secondsRemaining}s</strong>
              </span>
            </div>
          </div>

          {/* Screenshot Shutter Button */}
          <button
            type="button"
            onClick={handleTriggerScreenshotMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Ekraningizni bemalol screenshot qilib oling"
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Screenshot olish</span>
            <span className="sm:hidden">Rasmga olish</span>
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
        <div className="w-full max-w-4xl mb-2.5 p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Telefoningizda (Power+Ovoz) yoki kompyuterda (Win+Shift+S) orqali saqlab oling!</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ============ LUXURY LANDSCAPE CERTIFICATE ============== */}
      {/* ======================================================== */}
      <div
        ref={certCardRef}
        id="official-certificate-card"
        className="w-full max-w-4xl relative rounded-3xl p-3 sm:p-5 md:p-6 border-2 sm:border-3 border-amber-400/50 shadow-2xl overflow-hidden select-none bg-gradient-to-br from-[#060a14] via-[#0c1426] to-[#04060c] text-white"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(59, 130, 246, 0.12)'
        }}
      >
        {/* Luxury Gold Corner Ornaments (Scale safely without overlapping text) */}
        <div className="absolute top-0 left-0 w-8 h-8 sm:w-14 sm:h-14 border-t-2 sm:border-t-3 border-l-2 sm:border-l-3 border-amber-400/70 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 sm:w-14 sm:h-14 border-t-2 sm:border-t-3 border-r-2 sm:border-r-3 border-amber-400/70 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-14 sm:h-14 border-b-2 sm:border-b-3 border-l-2 sm:border-l-3 border-amber-400/70 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-14 sm:h-14 border-b-2 sm:border-b-3 border-r-2 sm:border-r-3 border-amber-400/70 rounded-br-2xl pointer-events-none" />

        {/* Ambient Radial Glows */}
        <div className="absolute -top-16 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Watermark Matrix */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Inner Border Frame */}
        <div className="border border-amber-400/25 rounded-2xl p-3.5 sm:p-5 md:p-6 relative z-10 flex flex-col justify-between">
          {/* 1. Header: Platform Emblem & Official Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-400/20 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-400/30 shadow-md">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black tracking-widest text-blue-400 font-mono block">
                  YOLNOMA TYPING
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                  O'zbekiston №1 Klaviatura Trenajyori
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase">
                Rasmiy Mahorat Sertifikati
              </h1>
              <span className="text-[9px] sm:text-[10px] text-amber-300/80 font-mono block tracking-wider uppercase">
                Rasmiy Tasdiqlangan Hujjat • Official Skill Certificate
              </span>
            </div>
          </div>

          {/* 2. Main Horizontal 2-Column Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6 items-stretch my-3.5">
            {/* Left Column (5 cols): User Identity & Official Seal */}
            <div className="md:col-span-5 flex flex-col justify-between bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 text-center sm:text-left">
              {/* User Identity */}
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2.5">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-blue-500 to-indigo-500 shadow-md">
                      <img
                        src={avatarUrl}
                        alt={userDisplayName}
                        className="w-full h-full rounded-full object-cover bg-slate-900 border-2 border-slate-900"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', `https://api.dicebear.com/7.x/bottts/svg?seed=Yolnoma`);
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-md border-2 border-slate-900" title="Tasdiqlangan Foydalanuvchi">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate max-w-[170px] sm:max-w-[200px]">
                        {userDisplayName}
                      </h2>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                        Tasdiqlangan
                      </span>
                    </div>

                    <div className="mt-1">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border shadow-xs"
                        style={{
                          backgroundColor: `${rankColor}15`,
                          borderColor: `${rankColor}40`,
                          color: rankColor
                        }}
                      >
                        {rankBadge} • {rankTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-300/90 font-mono leading-relaxed mt-2">
                  Ushbu sertifikat egasining kompyuter klaviaturasida yuqori professional tezlik va aniqlikda matn terish mahoratiga ega ekanligini tasdiqlaydi.
                </p>
              </div>

              {/* Stamp & Serial Bar */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3 mt-3 border-t border-slate-800/80">
                {/* Official Gold Seal Stamp */}
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400/70 p-0.5 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <div className="w-full h-full rounded-full border border-amber-400/40 flex flex-col items-center justify-center text-[7px] font-mono font-black uppercase leading-tight text-center">
                    <span>YOLNOMA</span>
                    <span className="text-[5px] text-amber-200">VERIFIED</span>
                    <span>★★★★★</span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-[9px] text-slate-400 block">Sertifikat Seriyasi:</span>
                  <span className="text-xs font-bold text-amber-300 block">{certificateNumber}</span>
                  <span className="text-[9px] text-slate-500 block">Berilgan: {issueDate}</span>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Speed Hero & 4 Metrics */}
            <div className="md:col-span-7 flex flex-col justify-between gap-2.5 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4">
              {/* Hero WPM Display Card */}
              <div className="bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800/90 rounded-xl p-3 sm:p-4 text-center relative overflow-hidden shadow-inner">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  Qayd Etilgan Tezlik
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-200 drop-shadow-md">
                    {bestWpm}
                  </span>
                  <span className="text-base sm:text-2xl font-black font-mono text-blue-400">
                    WPM
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  (daqiqasiga so'z soni / Words Per Minute)
                </div>
              </div>

              {/* 4 Key Metrics (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="bg-slate-900/80 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono block truncate">Aniqlik (Acc)</span>
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-400 block">{bestAccuracy}%</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono block truncate">Yozish Vaqti</span>
                    <span className="text-sm sm:text-base font-black font-mono text-sky-400 block">{testDuration} soniya</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono block truncate">Mashqlar Soni</span>
                    <span className="text-sm sm:text-base font-black font-mono text-purple-400 block">{totalCompletedTests} marta</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono block truncate">Ketma-ketlik</span>
                    <span className="text-sm sm:text-base font-black font-mono text-amber-400 block">{currentStreak} kun</span>
                  </div>
                </div>
              </div>

              {/* Bottom Verification Footer */}
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80 px-1">
                <span>Manzil: <strong className="text-blue-400">https://www.yolnoma.uz</strong></span>
                <span className="text-slate-500">Elektron tekshiruvdan o'tgan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Helper notice */}
      <p className="mt-2.5 text-[10px] sm:text-[11px] text-slate-400 font-mono text-center max-w-lg">
        📸 <span className="text-amber-300 font-bold">Screenshot qilib oling:</span> Telefoningiz yoki kompyuteringiz orqali ushbu sahifani rasmga olib saqlang. 10 soniyadan so'ng eski sertifikat o'chiriladi va bosh sahifaga qaytiladi.
      </p>
    </div>
  );
};
