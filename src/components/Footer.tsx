import React from 'react';
import { Keyboard, ShieldCheck, Heart, Terminal, Info } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { t } from '../config/languages';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  const { language } = useSettings();

  return (
    <footer className="w-full bg-[var(--card-bg)] border-t border-[var(--sub-alt)] py-6 px-4 mt-auto transition-colors duration-200">
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
    </footer>
  );
};
