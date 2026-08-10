import React, { useState } from 'react';
import {
  Keyboard,
  Sparkles,
  Zap,
  Trophy,
  ShieldCheck,
  Globe,
  ArrowRight,
  Flame,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      localStorage.setItem('yolnoma_auth_completed', 'true');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Google orqali kirishda xatolik yuz berdi');
      } else {
        setError('Google orqali kirishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="max-w-7xl w-full mx-auto p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-cyan-500/20">
            Y
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Yolnoma <span className="text-cyan-400 font-bold text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">PRO ARENA</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Uzbekistan #1 Speed Typing Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firebase Realtime Sync Live</span>
        </div>
      </header>

      {/* Main Content Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 my-auto">
        {/* Left Side: Pitch & Features */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Monkeytype Level Typing Experience</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Klaviaturada yozish <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">tezligingizni</span> maksimal darajaga ko'taring
          </h2>

          <p className="text-slate-300 text-base leading-relaxed max-w-xl">
            Google orqali tizimga kiring va barcha natijalaringiz real vaqt rejimida har bir qurilmangizda avtomatsiz saqlansin. Global reytingda o'z o'rningizni egallang!
          </p>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Xavfsiz Google Sync</h4>
                <p className="text-xs text-slate-400 mt-0.5">Barcha statistikalar profil bo'yicha doimiy saqlanadi.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Jonli Jonli Reyting</h4>
                <p className="text-xs text-slate-400 mt-0.5">Telefon va kompyuterdan bir xil reytingda ko'rinishingiz.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Chuqur WPM Analitika</h4>
                <p className="text-xs text-slate-400 mt-0.5">Anqiylik va xatolar hisobi bilan professional tahlil.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Level & Unvonlar</h4>
                <p className="text-xs text-slate-400 mt-0.5">XP to'plang va Cyber Legend unvoniga erishing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Primary Single Auth Card */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Tizimga Kirish</h3>
            <p className="text-xs text-slate-400 font-medium">Saytdan foydalanish uchun Google orqali kiring</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          {/* Primary Action Button: Google Sign-In */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Orqali Kirish</span>
            </button>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              1-Klik orqali profil yaratiladi va reytingda ko'rinadi
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl w-full mx-auto p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 z-10 border-t border-slate-900">
        <p>© 2026 Yolnoma Typing Platform. Barcha huquqlar saqlangan.</p>
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 px-5 py-2.5 rounded-2xl text-amber-300 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/10">
          <div className="w-8 h-8 rounded-xl bg-black border border-amber-500/60 p-0.5 flex items-center justify-center flex-shrink-0">
            <img src="/yosh_avlod_logo.svg" alt="Yosh Avlod" className="w-full h-full object-contain" />
          </div>
          <span>Bosh Hamkor: <strong className="text-white text-sm sm:text-base">Yosh Avlod Kanali</strong> (Direktor: <strong className="text-amber-400 text-sm sm:text-base">SHAMSIDDIN</strong>)</span>
        </div>
      </footer>
    </div>
  );
};
