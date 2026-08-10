import React from 'react';
import { Keyboard, ShieldCheck, Heart, Terminal, Info, Crown, Sparkles, Tv, UserCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { t } from '../config/languages';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  const { language } = useSettings();

  return (
    <footer className="w-full bg-[var(--card-bg)] border-t border-[var(--sub-alt)] py-8 px-4 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Official Partner Banner: Yosh Avlod Kanali & SHAMSIDDIN */}
        <div className="bg-gradient-to-r from-amber-950/40 via-[var(--sub-alt)] to-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Subtle Glow background */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Partner Info Left */}
          <div className="flex items-center gap-3 z-10 text-left">
            {/* Golden Logo Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black border border-amber-500/80 p-1 shadow-md shadow-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/yosh_avlod_logo.svg"
                  alt="Yosh Avlod Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 p-0.5 rounded-full shadow-sm">
                <Crown className="w-3 h-3 fill-slate-950" />
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Rasmiy Bosh Hamkor
                </span>
                <span className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-tight flex items-center gap-1">
                  Yosh Avlod Kanali
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                </span>
              </div>

              <p className="text-xs text-[var(--sub-color)] font-medium flex items-center gap-1.5 flex-wrap">
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Asoschi va Direktor:</span>
                <strong className="text-amber-300 font-black text-xs uppercase tracking-wide bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">SHAMSIDDIN</strong>
              </p>
            </div>
          </div>

          {/* Partner Badge / Action Right */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Loyiha Bosh Homiysi</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--sub-color)] pt-2 border-t border-[var(--sub-alt)]/50">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold text-[var(--text-color)]">
            <Keyboard className="w-4 h-4 text-[var(--main-color)]" />
            <span>Yolnoma Typing</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Firebase Connected</span>
          </span>
          <span>•</span>
          <span className="hidden sm:inline">v2.5 Production</span>
        </div>

        {/* Shortcuts Hint */}
        <div className="flex items-center gap-2 bg-[var(--sub-alt)] px-3 py-1.5 rounded-lg border border-[var(--sub-color)]/10 font-mono text-[11px]">
          <span className="text-[var(--text-color)] font-bold">Tab + Enter</span>
          <span>: Quick Restart</span>
          <span className="mx-1">•</span>
          <span className="text-[var(--text-color)] font-bold">Esc</span>
          <span>: Reset Focus</span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 font-medium">
          <button
            onClick={onOpenAbout}
            className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>FAQ & Privacy</span>
          </button>
          <span>•</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for typists
          </span>
        </div>
      </div>
    </div>
  </footer>
  );
};
