import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, Youtube, CheckCircle2, ShieldCheck, X, Tv, Play, BellRing, Eye } from 'lucide-react';

interface YoshAvlodAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'modal' | 'banner' | 'corner' | 'inline';
  durationSeconds?: number;
}

export const YoshAvlodAdModal: React.FC<YoshAvlodAdModalProps> = ({
  isOpen,
  onClose,
  variant = 'modal',
  durationSeconds = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [canClose, setCanClose] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const YOUTUBE_URL = 'https://www.youtube.com/@YoshAvlodKanali/videos';

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(durationSeconds);
      setCanClose(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(durationSeconds);
    setCanClose(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanClose(true);
          // Auto close after 10s countdown finishes
          setTimeout(() => {
            onClose();
          }, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, durationSeconds, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer');
  };

  // Video previews from Yosh Avlod Kanali
  const sampleVideos = [
    {
      title: "JAILBREAK DEEPSEEK — CHEGARASIZ ISHLAYDI",
      badge: "DeepSeek AI",
      views: "1.2k ko'rish",
      time: "11:02",
      color: "from-blue-600 to-indigo-900",
      accent: "text-cyan-400"
    },
    {
      title: "NMAP — SCRIPTING ENGINE VA SAQLASH #4",
      badge: "Kiberxavfsizlik",
      views: "2.4k ko'rish",
      time: "14:07",
      color: "from-slate-800 to-zinc-950",
      accent: "text-emerald-400"
    },
    {
      title: "OMNIROUTE — CLAUDE ENDI MUTLAQO BEPUL",
      badge: "Claude Free AI",
      views: "3.5k ko'rish",
      time: "23:16",
      color: "from-rose-950 to-neutral-900",
      accent: "text-amber-400"
    }
  ];

  const progressPercent = Math.max(0, Math.min(100, ((durationSeconds - timeLeft) / durationSeconds) * 100));

  // Corner Toast Floating Variant
  if (variant === 'corner') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-950/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black border border-amber-500/70 p-1 flex items-center justify-center shrink-0">
              <img src="/yosh_avlod_logo.svg" alt="Yosh Avlod" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-400 tracking-tight">Yosh Avlod Kanali</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-red-600 text-white font-bold rounded">LIVE</span>
              </div>
              <p className="text-[11px] text-slate-300">SHAMSIDDIN • Bosh Homiy</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {timeLeft}s
            </span>
            {canClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-3 line-clamp-2">
          IT, DeepSeek, Claude va Kiberxavfsizlik bo'yicha eng dolzarb video darslar!
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-3">
          <div
            className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLinkClick}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-lg cursor-pointer"
          >
            <Youtube className="w-4 h-4 fill-white" />
            <span>Kanalga o'tish</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
          {canClose && (
            <button
              onClick={onClose}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Yopish
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Screen / Central Sponsor Modal (10s Countdown)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar with Timer & Badge */}
        <div className="relative z-10 flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Rasmiy Homiy & Hamkor
            </span>
          </div>

          {/* 10-second countdown badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/40 font-mono text-xs text-amber-300">
              <span className="text-[10px] text-slate-400">Yopilishiga:</span>
              <span className="font-black text-sm text-amber-400">{timeLeft}</span>
              <span className="text-[10px] text-slate-400">soniya</span>
            </div>

            {canClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Banner Hero Showcase */}
        <div className="relative z-10 pt-4 space-y-4">
          <div
            onClick={handleLinkClick}
            className="group cursor-pointer bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 sm:p-5 transition-all hover:bg-slate-850 shadow-xl relative overflow-hidden"
          >
            {/* Top Channel Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Channel Big Avatar Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-amber-400 p-2 shadow-lg shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img
                  src="/yosh_avlod_logo.svg"
                  alt="Yosh Avlod Kanali Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                />
              </div>

              {/* Channel Text Info */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Yosh Avlod Kanali(BEKFURR)
                  </h2>
                  <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-950 shrink-0" />
                </div>

                <p className="text-xs text-slate-300 font-mono">
                  @YoshAvlodKanali • <strong className="text-amber-300">6,22 ming</strong> obunachi • <strong className="text-amber-300">275</strong> video
                </p>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Kanal direktori: <strong className="text-amber-400 uppercase font-black tracking-wide">SHAMSIDDIN</strong>. Dasturlash, AI neyrotarmoqlar va Kiberxavfsizlik bo'yicha maxsus darsliklar.
                </p>
              </div>
            </div>

            {/* Featured Videos Showcase Mini Grid */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Play className="w-3 h-3 text-red-500 fill-red-500" /> Mashhur Videolar & Darsliklar:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sampleVideos.map((vid, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${vid.color} border border-slate-700/60 flex flex-col justify-between h-24 hover:border-amber-400/60 transition-colors`}
                  >
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase ${vid.accent}`}>
                        {vid.badge}
                      </span>
                      <p className="text-[11px] font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                        {vid.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1">
                      <span>{vid.views}</span>
                      <span className="px-1 py-0.2 bg-black/60 rounded text-slate-300 font-bold">{vid.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Animated 10s Timeline Progress Indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Homiy e'loni</span>
              <span>{timeLeft}s qoldi (Avtomatik o'tadi)</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-red-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleLinkClick}
              className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Youtube className="w-5 h-5 fill-white" />
              <span>Kanalga Obuna Bo'lish va Ko'rish</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {canClose ? (
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors cursor-pointer border border-slate-700"
              >
                Yopish va Saytga o'tish
              </button>
            ) : (
              <div className="text-xs text-slate-400 font-mono px-3 py-2 text-center">
                {timeLeft}s dan so'ng yopiladi...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
