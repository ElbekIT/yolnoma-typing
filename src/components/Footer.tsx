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
        <div className="bg-gradient-to-r from-amber-950/50 via-[var(--sub-alt)] to-amber-950/50 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Subtle Glow background */}
          <div className="absolute -top-10 -left-10 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Partner Info Left */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 z-10 text-center sm:text-left">
            {/* Golden Logo Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-black border-2 border-amber-500/80 p-2 shadow-2xl shadow-amber-500/30 flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/yosh_avlod_logo.svg"
                  alt="Yosh Avlod Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                />
              </div>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
                <Crown className="w-5 h-5 fill-slate-950" />
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300 bg-amber-950/90 px-3.5 py-1 rounded-full border border-amber-500/50 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Rasmiy Bosh Hamkor
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight flex items-center justify-center sm:justify-start gap-2">
                Yosh Avlod Kanali
                <Tv className="w-6 h-6 text-amber-400" />
              </h3>
              <p className="text-sm sm:text-base text-[var(--sub-color)] font-medium flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Kanal Asoschisi va Direktori:</span>
                <strong className="text-amber-300 font-black text-base sm:text-lg uppercase tracking-wide bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">SHAMSIDDIN</strong>
              </p>
            </div>
          </div>

          {/* Partner Badge / Action Right */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 z-10">
            <div className="px-5 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-amber-500/10">
              <Crown className="w-5 h-5 text-amber-400" />
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
