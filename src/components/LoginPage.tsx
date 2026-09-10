import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
  onBackToTyping?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToTyping }) => {
  const {
    user,
    signInWithGoogle,
    signInWithGithub,
    loginWithEmail,
    registerWithEmail,
    resetPassword
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user && onSuccess) {
      onSuccess();
    }
  }, [user, onSuccess]);

  // Keyboard shortcut: Escape to go back to typing test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBackToTyping) {
        e.preventDefault();
        onBackToTyping();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToTyping]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      localStorage.setItem('yolnoma_auth_completed', 'true');
      if (onSuccess) onSuccess();
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
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithGithub();
      localStorage.setItem('yolnoma_auth_completed', 'true');
      if (onSuccess) onSuccess();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Iltimos, pochtangizni (email) kiriting');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMessage('Parolni tiklash havolasi pochtangizga yuborildi! Xatni tekshiring.');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Parolni tiklashda xatolik yuz berdi');
        } else {
          setError('Parolni tiklashda xatolik yuz berdi');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Iltimos, parolingizni kiriting');
      return;
    }

    if (mode === 'register') {
      if (!username.trim()) {
        setError('Iltimos, taxallus (username) kiriting');
        return;
      }
      if (password.length < 6) {
        setError('Parol kamida 6 ta belgidan iborat bo\'lishi shart');
        return;
      }
      if (verifyPassword && password !== verifyPassword) {
        setError('Kiritilgan parollar bir-biriga mos kelmadi');
        return;
      }

      setLoading(true);
      try {
        await registerWithEmail(email.trim(), password, username.trim());
        localStorage.setItem('yolnoma_auth_completed', 'true');
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
        } else {
          setError('Ro\'yxatdan o\'tishda xatolik yuz berdi');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      localStorage.setItem('yolnoma_auth_completed', 'true');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Kirishda xatolik yuz berdi. Email yoki parol noto\'g\'ri');
      } else {
        setError('Kirishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-3 py-6 select-none">
      <div className="w-full max-w-[340px] sm:max-w-[370px] mx-auto space-y-4">
        
        {/* Minimalist Monkeytype Header Title */}
        <div className="flex items-center gap-2 text-[var(--sub-color)] text-xs sm:text-sm font-mono tracking-wide">
          <ArrowRight className="w-3.5 h-3.5 text-[var(--main-color)]" />
          <span className="font-bold text-[var(--text-color)] lowercase">
            {mode === 'login' ? 'login' : mode === 'register' ? 'register' : 'reset password'}
          </span>
        </div>

        {/* OAuth Social Buttons (Google & GitHub Side-by-Side) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--text-color)] font-mono text-xs font-bold transition-all border border-[var(--sub-alt)] hover:border-[var(--sub-color)]/30 cursor-pointer disabled:opacity-50"
              title="Google orqali kirish"
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
              <span>Google</span>
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--text-color)] font-mono text-xs font-bold transition-all border border-[var(--sub-alt)] hover:border-[var(--sub-color)]/30 cursor-pointer disabled:opacity-50"
              title="GitHub orqali kirish"
            >
              <svg className="w-4 h-4 fill-current text-[var(--text-color)] shrink-0" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        )}

        {/* Minimal Divider: "or" */}
        {mode !== 'forgot' && (
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--sub-alt)]" />
            </div>
            <span className="relative px-2.5 bg-[var(--bg-color)] text-[var(--sub-color)] font-mono text-[11px]">
              yoki
            </span>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5 font-mono">
          {mode === 'register' && (
            <div>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                disabled={loading}
                autoComplete="username"
                className="w-full bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)]/60 focus:bg-[var(--sub-alt)]/80 border border-[var(--sub-alt)] focus:border-[var(--main-color)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-color)] placeholder:text-[var(--sub-color)]/50 focus:outline-none transition-all"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="w-full bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)]/60 focus:bg-[var(--sub-alt)]/80 border border-[var(--sub-alt)] focus:border-[var(--main-color)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-color)] placeholder:text-[var(--sub-color)]/50 focus:outline-none transition-all"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)]/60 focus:bg-[var(--sub-alt)]/80 border border-[var(--sub-alt)] focus:border-[var(--main-color)] rounded-xl py-2 pl-3.5 pr-9 text-xs text-[var(--text-color)] placeholder:text-[var(--sub-color)]/50 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors p-1"
                title={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="verify password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                className="w-full bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)]/60 focus:bg-[var(--sub-alt)]/80 border border-[var(--sub-alt)] focus:border-[var(--main-color)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-color)] placeholder:text-[var(--sub-color)]/50 focus:outline-none transition-all"
              />
            </div>
          )}

          {/* Remember Me Checkbox */}
          {mode === 'login' && (
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer select-none"
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                    rememberMe
                      ? 'bg-[var(--main-color)] border-[var(--main-color)] text-white'
                      : 'border-[var(--sub-color)]/40 bg-[var(--sub-alt)]/40'
                  }`}
                >
                  {rememberMe && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>remember me</span>
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1.5 py-2.5 px-4 rounded-xl bg-[var(--sub-alt)]/80 hover:bg-[var(--sub-alt)] text-[var(--text-color)] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all border border-[var(--sub-alt)] hover:border-[var(--main-color)]/50 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">yuklanmoqda...</span>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--main-color)]" />
                <span>
                  {mode === 'login'
                    ? 'sign in'
                    : mode === 'register'
                    ? 'sign up'
                    : 'send reset email'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Switch Mode & Forgot Password Links */}
        <div className="pt-1 flex flex-col items-center gap-1.5 text-[11px] font-mono text-[var(--sub-color)]">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('forgot');
                }}
                className="hover:text-[var(--text-color)] transition-colors cursor-pointer"
              >
                forgot password?
              </button>

              <div className="flex items-center gap-1 mt-0.5">
                <span>hisobingiz yo&apos;qmi?</span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode('register');
                  }}
                  className="text-[var(--main-color)] font-bold hover:underline cursor-pointer"
                >
                  ro&apos;yxatdan o&apos;tish (register)
                </button>
              </div>
            </>
          ) : mode === 'register' ? (
            <div className="flex items-center gap-1">
              <span>allaqachon hisobingiz bormi?</span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-[var(--main-color)] font-bold hover:underline cursor-pointer"
              >
                kirish (sign in)
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setMode('login');
              }}
              className="hover:text-[var(--text-color)] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>kirishga qaytish</span>
            </button>
          )}
        </div>

        {/* Back to typing test link */}
        {onBackToTyping && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBackToTyping}
              className="text-[10.5px] font-mono text-[var(--sub-color)] hover:text-[var(--main-color)] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>tez yozishga qaytish</span>
              <kbd className="px-1 py-0.2 rounded bg-[var(--sub-alt)] text-[9px] text-[var(--sub-color)] border border-[var(--sub-alt)]">
                esc
              </kbd>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

