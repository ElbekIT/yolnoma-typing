import React from 'react';
import { Keyboard, ShieldCheck, Info, Sparkles, Zap } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenUpdates?: () => void;
  onOpenOwner?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenUpdates,
  onOpenOwner,
  onOpenAdmin
}) => {
  return (
    <footer className="w-full py-4 px-4 mt-auto select-none safe-bottom">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[var(--sub-color)] opacity-80 hover:opacity-100 transition-opacity">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[var(--text-color)] font-bold">
            <Keyboard className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span>yolnoma</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>verified</span>
          </span>
          <span>•</span>
          {onOpenUpdates ? (
            <button
              onClick={onOpenUpdates}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5 cursor-pointer font-bold px-1.5 py-0.5 rounded-md hover:bg-[var(--sub-alt)]"
              title="Sayt yangilanishlari xronologiyasi (Changelog)"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>v2.6</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          ) : (
            <span>v2.6</span>
          )}
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4">
          {onOpenUpdates && (
            <button
              onClick={onOpenUpdates}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>yangilanishlar</span>
            </button>
          )}

          {onOpenOwner && (
            <button
              onClick={onOpenOwner}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[var(--main-color)]" />
              <span>muallif</span>
            </button>
          )}

          <button
            onClick={onOpenAbout}
            className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3 h-3" />
            <span>qoidalar</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
