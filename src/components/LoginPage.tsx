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
  const { signInWithGoogle, signInWithGithub } = useAuth();
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

  const handleGithubSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGithub();
      localStorage.setItem('yolnoma_auth_completed', 'true');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'GitHub orqali kirishda xatolik yuz berdi');
      } else {
        setError('GitHub orqali kirishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full pointer-events-none" />

      {/* Top Brand Header */}
      <header className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src="/yolnoma_icon.svg"
            alt="Yolnoma Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-xl"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Yolnoma <span className="text-cyan-400 font-bold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">PRO ARENA</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Uzbekistan #1 Speed Typing Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Online Arena</span>
        </div>
      </header>

      {/* Main Content Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 my-auto">
        {/* Left Side: Pitch & Features */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tez Yozish Platformasi</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Klaviaturada yozish <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">tezligingizni</span> maksimal darajaga ko'taring
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Google yoki GitHub orqali tizimga kiring va barcha natijalaringiz har bir qurilmangizda avtomatik va xavfsiz saqlansin. Global reytingda o'z o'rningizni egallang!
          </p>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Xavfsiz Cloud Sync</h4>
                <p className="text-xs text-slate-400 mt-0.5">Barcha statistikalar profil bo'yicha doimiy saqlanadi.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Jonli Milliy & Global Reyting</h4>
                <p className="text-xs text-slate-400 mt-0.5">Telefon va kompyuterdan bir xil reytingda ko'rinishingiz.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Chuqur WPM Analitika</h4>
                <p className="text-xs text-slate-400 mt-0.5">Aniqlik va xatolar hisobi bilan professional tahlil.</p>
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

        {/* Right Side: Primary Auth Card */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Tizimga Kirish</h3>
            <p className="text-xs text-slate-400 font-medium">Google yoki GitHub orqali kiring</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Action Buttons: Google & GitHub Sign-In */}
          <div className="space-y-3 pt-2">
            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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

            {/* GitHub Sign-In */}
            <button
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm border border-slate-700 transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Orqali Kirish</span>
            </button>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              1-bosqichda profil yaratiladi va reytingda ko'rinadi
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
