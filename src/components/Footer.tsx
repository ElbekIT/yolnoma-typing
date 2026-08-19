import React from 'react';
import { Keyboard, ShieldCheck, Heart, Terminal, Info, Crown, Sparkles, Tv, UserCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { t } from '../config/languages';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenOwner?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, onOpenOwner }) => {
  const { language } = useSettings();

  return (
    <footer className="w-full bg-[var(--card-bg)] border-t border-[var(--sub-alt)] py-5 px-4 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--sub-color)]">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold text-[var(--text-color)]">
            <Keyboard className="w-4 h-4 text-[var(--main-color)]" />
            <span>Yolnoma Typing</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Platform</span>
          </span>
          <span>•</span>
          <span className="hidden sm:inline">v2.5 Production</span>
        </div>

        {/* Shortcuts Hint */}
        <div className="flex items-center gap-2 bg-[var(--sub-alt)] px-3 py-1.5 rounded-lg border border-[var(--sub-color)]/10 font-mono text-[11px]">
          <span className="text-[var(--text-color)] font-bold">Tab + Enter</span>
          <span>: Qayta boshlash</span>
          <span className="mx-1">•</span>
          <span className="text-[var(--text-color)] font-bold">Esc</span>
          <span>: Diqqatni jamlash</span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 font-medium">
          {onOpenOwner && (
            <button
              onClick={onOpenOwner}
              className="hover:text-[var(--main-color)] text-[var(--main-color)] transition-colors flex items-center gap-1 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sayt Haqida & Muallif</span>
            </button>
          )}

          <button
            onClick={onOpenAbout}
            className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Tizim & Qoidalar</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
