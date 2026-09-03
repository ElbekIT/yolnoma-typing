import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  Search,
  Swords,
  Trophy,
  BookOpen,
  Globe,
  BarChart3,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NotFoundViewProps {
  onGoHome: () => void;
  onNavigate: (tab: string) => void;
  attemptedPath?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onGoHome,
  onNavigate,
  attemptedPath
}) => {
  const currentPath = attemptedPath || (typeof window !== 'undefined' ? window.location.pathname : '/404');

  // Mini typing challenge phrase
  const challengePhrase = "Adashgan yo'l yangi mahoratga yetaklar!";
  const [typedInput, setTypedInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus typing input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Handle typing challenge input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted) return;
    const val = e.target.value;
    setTypedInput(val);

    if (val === challengePhrase) {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Automatically redirect home after celebration
      setTimeout(() => {
        onGoHome();
      }, 1500);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onGoHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGoHome]);

  const quickLinks = [
    {
      id: 'typing',
      title: 'Yozish Arenasi',
      desc: 'Tezlik va aniqlikni sinash',
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10'
    },
    {
      id: 'battle',
      title: 'Speedway Battle',
      desc: 'Jonli PvP poyga musobaqasi',
      icon: <Swords className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10'
    },
    {
      id: 'languages',
      title: '125+ Jahon Tillari',
      desc: 'Barcha qit\'alar va xalqlar tillari',
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10'
    },
    {
      id: 'leaderboard',
      title: 'Peshqadamlar',
      desc: 'Eng kuchli rekordlar va reyting',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      color: 'border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/10'
    },
    {
      id: 'lessons',
      title: '10 Barmoq Darslari',
      desc: 'Blind typing bosqichma-bosqich',
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10'
    },
    {
      id: 'statistics',
      title: 'Statistika',
      desc: 'Shaxsiy grafik va natijalar',
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
    }
  ];

  const filteredLinks = quickLinks.filter((link) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return link.title.toLowerCase().includes(q) || link.desc.toLowerCase().includes(q);
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 flex flex-col items-center text-center">
      {/* 404 Glitch & Neon Badge */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-[var(--main-color)]/20 to-amber-500/20 blur-2xl rounded-full opacity-60 animate-pulse pointer-events-none" />
        
        <div className="relative inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-lg mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-xs font-mono font-bold tracking-wider text-[var(--sub-color)] uppercase">
            Xatolik kodi: 404 • Not Found
          </span>
        </div>

        {/* Big Stylized 404 Typography */}
        <h1 className="text-7xl sm:text-9xl font-black font-mono tracking-tight select-none bg-gradient-to-b from-[var(--text-color)] via-[var(--main-color)] to-[var(--sub-color)] bg-clip-text text-transparent drop-shadow-sm">
          404
        </h1>
      </div>

      {/* Primary Message */}
      <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--text-color)] tracking-tight mb-2">
        Sahifa topilmadi yoki ko'chirilgan
      </h2>
      <p className="text-sm sm:text-base text-[var(--sub-color)] max-w-xl leading-relaxed mb-6">
        Siz qidirayotgan manzil mavjud emas yoki yangilanish jarayonida boshqa joyga ko'chirilgan bo'lishi mumkin.
      </p>

      {/* Terminal Details Card */}
      <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-4 sm:p-5 shadow-md mb-8 text-left font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--sub-alt)] mb-3">
          <div className="flex items-center gap-2 text-[var(--sub-color)]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-1.5 font-semibold text-[11px] text-[var(--text-color)]">system.terminal</span>
          </div>
          <span className="text-[10px] text-[var(--sub-color)]">HTTP 404</span>
        </div>
        <div className="space-y-1.5 text-[var(--sub-color)]">
          <p>
            <span className="text-cyan-400 font-bold">&gt; So'rov yo'li:</span>{' '}
            <span className="text-[var(--text-color)] bg-[var(--sub-alt)] px-1.5 py-0.5 rounded">
              {currentPath}
            </span>
          </p>
          <p>
            <span className="text-amber-400 font-bold">&gt; Holat:</span>{' '}
            <span>Manzil serverda yoki marshrutlar ro'yxatida topilmadi.</span>
          </p>
          <p>
            <span className="text-emerald-400 font-bold">&gt; Tavsiya:</span>{' '}
            <span>Bosh sahifaga qayting yoki quyidagi mashhur bo'limlardan birini tanlang.</span>
          </p>
        </div>
      </div>

      {/* Interactive 404 Typing Mini-Challenge ("404 dan qochish") */}
      <div className="w-full max-w-xl bg-gradient-to-b from-[var(--card-bg)] to-[var(--sub-alt)]/20 border border-[var(--sub-alt)] hover:border-[var(--main-color)]/50 rounded-2xl p-5 shadow-lg mb-8 transition-colors">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-left">
            <Sparkles className="w-4 h-4 text-[var(--main-color)]" />
            <span className="text-xs font-bold text-[var(--text-color)] uppercase tracking-wider">
              404-dan Chiqish Tezlik Mashqi
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-bold">
            {isCompleted ? '✓ Bajarildi!' : 'Yozib ko\'ring'}
          </span>
        </div>

        <p className="text-xs text-[var(--sub-color)] mb-3 text-left">
          Quyidagi iborani klaviaturada xatosiz yozsangiz, tizim sizni avtomatik bosh sahifaga o'tkazadi:
        </p>

        {/* Phrase Display with Character Matching */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] font-mono text-sm sm:text-base tracking-wide text-left mb-3 select-none overflow-x-auto whitespace-nowrap">
          {challengePhrase.split('').map((char, idx) => {
            let color = 'text-[var(--sub-color)]/50';
            if (idx < typedInput.length) {
              color = typedInput[idx] === char ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold bg-red-500/20';
            } else if (idx === typedInput.length) {
              color = 'text-[var(--text-color)] underline decoration-[var(--main-color)] decoration-2';
            }
            return (
              <span key={idx} className={color}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={typedInput}
            onChange={handleInputChange}
            disabled={isCompleted}
            placeholder="Shu yerga yozishni boshlang..."
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] focus:border-[var(--main-color)] text-sm font-mono text-[var(--text-color)] placeholder-[var(--sub-color)]/50 focus:outline-none transition-colors"
          />
          {isCompleted && (
            <div className="absolute right-3 flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bosh sahifaga o'tilmoqda...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          onClick={onGoHome}
          className="px-6 py-3 rounded-xl bg-[var(--main-color)] text-[var(--bg-color)] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[var(--main-color)]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Bosh Sahifaga Qaytish</span>
        </button>

        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              onGoHome();
            }
          }}
          className="px-5 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:bg-[var(--sub-alt)] text-[var(--text-color)] font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga Qaytish</span>
        </button>

        <button
          onClick={() => onNavigate('languages')}
          className="px-5 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-emerald-500/50 hover:bg-emerald-500/10 text-[var(--text-color)] font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>125+ Tillar Bo'limi</span>
        </button>
      </div>

      {/* Search Filter for Quick Sections */}
      <div className="w-full max-w-2xl text-left mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--main-color)]" />
            <span>Mavjud Asosiy Bo'limlar</span>
          </h3>
          <span className="text-xs text-[var(--sub-color)] font-mono">
            Tanlang va darhol o'ting
          </span>
        </div>

        <div className="relative flex items-center bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl px-3.5 py-2 mb-4 focus-within:border-[var(--main-color)] transition-colors">
          <Search className="w-4 h-4 text-[var(--sub-color)] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bo'lim qidirish (arena, reyting, tillar, darslar, duel)..."
            className="w-full bg-transparent text-xs sm:text-sm text-[var(--text-color)] placeholder-[var(--sub-color)]/50 focus:outline-none"
          />
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`p-3.5 rounded-xl bg-[var(--card-bg)] border ${link.color} transition-all cursor-pointer flex items-start gap-3 group`}
            >
              <div className="p-2 rounded-lg bg-[var(--sub-alt)]/50 shrink-0 group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
                  {link.title}
                </h4>
                <p className="text-[11px] text-[var(--sub-color)] truncate">
                  {link.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
