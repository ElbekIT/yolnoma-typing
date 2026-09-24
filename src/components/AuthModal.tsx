import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatAuthError, FormattedAuthError } from '../utils/authErrorHelper';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithGithub, registerWithEmail, loginWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formattedError, setFormattedError] = useState<FormattedAuthError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setFormattedError(null);
    setSuccess(null);
  };

  const handleTabChange = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    resetMessages();
    if (newMode === 'register' && !username && email) {
      const suggested = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16);
      if (suggested) setUsername(suggested);
    }
  };

  const switchToRegisterWithCurrentCredentials = () => {
    setMode('register');
    resetMessages();
    if (!username && email) {
      const suggested = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16);
      setUsername(suggested || 'foydalanuvchi');
    }
  };

  const switchToLoginWithCurrentCredentials = () => {
    setMode('login');
    resetMessages();
  };

  const switchToForgotWithCurrentCredentials = () => {
    setMode('forgot');
    resetMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanUsername = username.trim();

    if (!cleanEmail) {
      setFormattedError({
        code: 'auth/missing-email',
        userMessage: 'Iltimos, email pochtangizni kiriting.',
        actionHint: 'Masalan: ism@example.com'
      });
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccess(`${cleanEmail} pochtangizga parolni tiklash havolasi yuborildi! Pochtani (Inbox va Spam) tekshiring.`);
      } catch (err: unknown) {
        setFormattedError(formatAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!cleanPassword) {
      setFormattedError({
        code: 'auth/missing-password',
        userMessage: 'Iltimos, parolingizni kiriting.'
      });
      return;
    }

    if (mode === 'register') {
      if (!cleanUsername) {
        setFormattedError({
          code: 'validation/missing-username',
          userMessage: 'Iltimos, taxallusingizni (username) kiriting.'
        });
        return;
      }
      if (cleanUsername.length < 3) {
        setFormattedError({
          code: 'validation/short-username',
          userMessage: 'Taxallus kamida 3 ta belgidan iborat bo\'lishi shart.'
        });
        return;
      }
      if (cleanPassword.length < 6) {
        setFormattedError({
          code: 'auth/weak-password',
          userMessage: 'Parol juda qisqa.',
          actionHint: 'Xavfsizlik uchun parol kamida 6 ta belgidan iborat bo\'lishi kerak.'
        });
        return;
      }

      setLoading(true);
      try {
        await registerWithEmail(cleanEmail, cleanPassword, cleanUsername);
        onClose();
      } catch (err: unknown) {
        setFormattedError(formatAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // mode === 'login'
    setLoading(true);
    try {
      await loginWithEmail(cleanEmail, cleanPassword);
      onClose();
    } catch (err: unknown) {
      setFormattedError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      setFormattedError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    resetMessages();
    setLoading(true);
    try {
      await signInWithGithub();
      onClose();
    } catch (err: unknown) {
      setFormattedError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-6 shadow-2xl text-[var(--text-color)] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--main-color)]/10 text-[var(--main-color)] flex items-center justify-center mx-auto mb-2.5">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'login' ? 'Tizimga Kirish' : mode === 'register' ? 'Yangi Hisob Yaratish' : 'Parolni Tiklash'}
          </h2>
          <p className="text-xs text-[var(--sub-color)] mt-1">
            {mode === 'login'
              ? 'Natijalarni saqlash va global reytingda ko\'tarilish uchun kiring'
              : mode === 'register'
              ? 'Yolnoma typing a\'zosi bo\'ling va shaxsiy statistikangizni yuriting'
              : 'Qayta tiklash havolasini olish uchun pochtangizni kiriting'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--sub-alt)]/60 rounded-xl mb-4 border border-[var(--sub-alt)]">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-[var(--main-color)] text-white shadow-sm'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Kirish</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-[var(--main-color)] text-white shadow-sm'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Ro'yxatdan o'tish</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('forgot')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'forgot'
                ? 'bg-[var(--main-color)] text-white shadow-sm'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Tiklash</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {formattedError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="font-semibold block text-rose-400">{formattedError.userMessage}</span>
                {formattedError.actionHint && (
                  <p className="text-[var(--sub-color)] text-[11px] leading-relaxed">{formattedError.actionHint}</p>
                )}
              </div>
            </div>

            {/* Smart Recovery Actions */}
            <div className="pt-1 flex flex-wrap gap-2 border-t border-rose-500/15">
              {formattedError.suggestRegister && mode === 'login' && (
                <button
                  type="button"
                  onClick={switchToRegisterWithCurrentCredentials}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--main-color)]/20 hover:bg-[var(--main-color)]/30 text-[var(--main-color)] text-[11px] font-semibold transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Ushbu email bilan ro'yxatdan o'tish</span>
                </button>
              )}

              {formattedError.suggestLogin && mode === 'register' && (
                <button
                  type="button"
                  onClick={switchToLoginWithCurrentCredentials}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-semibold transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Kirish bo'limiga o'tish</span>
                </button>
              )}

              {formattedError.suggestReset && (
                <button
                  type="button"
                  onClick={switchToForgotWithCurrentCredentials}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-[var(--text-color)] text-[11px] font-medium transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Parolni tiklash</span>
                </button>
              )}

              {formattedError.isIframeBlocked && (
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[11px] font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Yangi tabda ochish</span>
                </button>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <span>{success}</span>
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="block mt-1.5 font-bold text-emerald-300 hover:underline text-[11px]"
                >
                  Kirish sahifasiga qaytish &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Social Sign-In (Google & GitHub) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--sub-alt)] hover:border-[var(--main-color)] bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Google orqali</span>
            </button>

            {/* GitHub Sign In */}
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--sub-alt)] hover:border-[var(--main-color)] bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-[var(--text-color)]" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub orqali</span>
            </button>
          </div>
        )}

        {mode !== 'forgot' && (
          <div className="relative flex items-center justify-center my-3.5">
            <div className="border-t border-[var(--sub-alt)] w-full" />
            <span className="bg-[var(--card-bg)] px-3 text-[10px] text-[var(--sub-color)] font-semibold uppercase tracking-wider">
              yoki email orqali
            </span>
          </div>
        )}

        {/* Email Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--sub-color)]">
                Taxallus (Username)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-[var(--sub-color)]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="masalan: gavharoy"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 focus:border-[var(--main-color)] text-xs text-[var(--text-color)] outline-none transition-all placeholder:text-[var(--sub-color)]/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--sub-color)]">
              Email Pochta Manzili
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[var(--sub-color)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 focus:border-[var(--main-color)] text-xs text-[var(--text-color)] outline-none transition-all placeholder:text-[var(--sub-color)]/50"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--sub-color)]">Parol</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-[11px] text-[var(--main-color)] hover:underline font-medium cursor-pointer"
                  >
                    Parolni unutdingizmi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[var(--sub-color)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Kamida 6 ta belgi' : '••••••••'}
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 focus:border-[var(--main-color)] text-xs text-[var(--text-color)] outline-none transition-all placeholder:text-[var(--sub-color)]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
                  title={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-[var(--sub-color)] mt-1">
                  Parol xavfsizlik uchun kamida 6 ta belgidan iborat bo'lishi shart.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-[0.99] transition-all mt-4 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Tekshirilmoqda...</span>
              </span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Kirish</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Hisob Ochish</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Tiklash Havolasini Yuborish</span>
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Links */}
        <div className="text-center mt-4 text-xs text-[var(--sub-color)] font-medium">
          {mode === 'login' ? (
            <p>
              Hisobingiz yo'qmi?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className="text-[var(--main-color)] font-bold hover:underline cursor-pointer"
              >
                Ro'yxatdan o'tish
              </button>
            </p>
          ) : mode === 'register' ? (
            <p>
              Allaqachon ro'yxatdan o'tganmisiz?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="text-[var(--main-color)] font-bold hover:underline cursor-pointer"
              >
                Kirish
              </button>
            </p>
          ) : (
            <p>
              Parolni esladingizmi?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="text-[var(--main-color)] font-bold hover:underline cursor-pointer"
              >
                Kirish bo'limiga qaytish
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
