import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { THEME_LIST, ThemeConfig } from '../config/themes';
import { ThemeMode } from '../types';

export const ThemeSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme, themeConfig } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (tId: ThemeMode) => {
    setTheme(tId);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span>Mavzuni tanlash (Theme)</span>
          </span>
          <span className="text-[11px] font-mono text-[var(--main-color)] font-bold">{themeConfig.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {THEME_LIST.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id as ThemeMode)}
                className={`p-2 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'border-[var(--main-color)] bg-[var(--sub-alt)] ring-1 ring-[var(--main-color)]'
                    : 'border-[var(--sub-alt)]/60 bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-xs"
                    style={{ backgroundColor: t.mainColor }}
                  />
                  <span className="text-xs font-semibold truncate text-[var(--text-color)]">
                    {t.name.split(' (')[0]}
                  </span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-[var(--main-color)] shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Theme Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer border border-[var(--sub-alt)]/60 flex items-center gap-1.5"
        title="Sayt mavzusini o'zgartirish (Themes)"
        aria-label="Change Site Theme"
        aria-expanded={isOpen}
      >
        <Palette className="w-4 h-4 text-[var(--main-color)]" />
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shrink-0 shadow-xs"
          style={{ backgroundColor: themeConfig.mainColor }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--sub-alt)]/60 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--main-color)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                Sayt Mavzulari (10 xil)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--sub-color)] font-medium">
              Jonli almashtirish
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {THEME_LIST.map((t: ThemeConfig) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTheme(t.id as ThemeMode)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'border-[var(--main-color)] bg-[var(--sub-alt)]/70 ring-1 ring-[var(--main-color)] shadow-xs'
                      : 'border-[var(--sub-alt)]/50 bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/35 hover:border-[var(--sub-alt)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual 3-dot color preview */}
                    <div className="flex items-center -space-x-1 shrink-0 p-1 rounded-lg border border-[var(--sub-alt)] bg-[var(--bg-color)]">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 z-20 shadow-xs"
                        style={{ backgroundColor: t.mainColor }}
                        title="Asosiy rang"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 z-10"
                        style={{ backgroundColor: t.cardBg }}
                        title="Karta foni"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 z-0"
                        style={{ backgroundColor: t.bg }}
                        title="Sayt foni"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--text-color)] truncate">
                          {t.name}
                        </span>
                        {t.isDark ? (
                          <Moon className="w-3 h-3 text-[var(--sub-color)] shrink-0 opacity-60" />
                        ) : (
                          <Sun className="w-3 h-3 text-amber-500 shrink-0 opacity-80" />
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--sub-color)] truncate mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--main-color)] text-[var(--bg-color,#060913)] shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
