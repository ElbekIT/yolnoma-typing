import React, { useState, useEffect } from 'react';
import { Youtube, ExternalLink, Sparkles, CheckCircle2, ChevronRight, X, Play, Clock } from 'lucide-react';

interface YoshAvlodBannerProps {
  onClose?: () => void;
  autoCloseSeconds?: number;
  compact?: boolean;
}

export const YoshAvlodBanner: React.FC<YoshAvlodBannerProps> = ({
  onClose,
  autoCloseSeconds = 10,
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(autoCloseSeconds);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const YOUTUBE_URL = 'https://www.youtube.com/@YoshAvlodKanali/videos';

  useEffect(() => {
    if (autoCloseSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onClose) {
            onClose();
          } else {
            setIsMinimized(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoCloseSeconds, onClose]);

  const handleOpenYoutube = () => {
    window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer');
  };

  if (isMinimized) {
    return (
      <div className="w-full bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black border border-amber-500/50 p-1 flex items-center justify-center shrink-0">
            <img src="/yosh_avlod_logo.svg" alt="Yosh Avlod" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-bold text-amber-300">Yosh Avlod Kanali (BEKFURR) — Bosh Homiy</span>
        </div>
        <button
          onClick={handleOpenYoutube}
          className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Youtube className="w-3.5 h-3.5 fill-white" />
          <span>YouTube</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden text-white animate-in fade-in duration-300">
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top micro bar */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Bosh Homiy & Hamkor
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">Platforma Homiyasi</span>
        </div>

        <div className="flex items-center gap-2">
          {timeLeft > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{timeLeft}s</span>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Channel Info */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleOpenYoutube}>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black border-2 border-amber-400 p-1.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
            <img src="/yosh_avlod_logo.svg" alt="Yosh Avlod Logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-black text-white hover:text-amber-300 transition-colors">
                Yosh Avlod Kanali(BEKFURR)
              </h3>
              <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-950 shrink-0" />
            </div>
            <p className="text-xs text-slate-300 font-mono">
              @YoshAvlodKanali • 6,22 ming obunachi • Direktor: <strong className="text-amber-300">SHAMSIDDIN</strong>
            </p>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              DeepSeek Jailbreak, Claude OMNIROUTE, Kiberxavfsizlik va IT darsliklari
            </p>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleOpenYoutube}
            className="flex-1 md:flex-none py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Youtube className="w-4 h-4 fill-white" />
            <span>Kanalga Kirish</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
