import React, { useState, useRef, useEffect } from 'react';
import { useI18n, UiLanguage } from '../context/I18nContext';
import { useSettings } from '../context/SettingsContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
  code: UiLanguage;
  name: string;
  flag: string;
  typingLangCode: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿', typingLangCode: 'uz-latn' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', typingLangCode: 'ru' },
  { code: 'en', name: 'English', flag: '🇬🇧', typingLangCode: 'en' }
];

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { uiLanguage, setUiLanguage } = useI18n();
  const { setLanguage } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === uiLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    setUiLanguage(lang.code);
    // Optionally align default typing language if user switches interface
    setLanguage(lang.typingLangCode as any);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-[#101726]/80 p-1 rounded-xl border border-cyan-500/20 shadow-inner">
        {LANGUAGES.map((l) => {
          const isActive = l.code === uiLanguage;
          return (
            <button
              key={l.code}
              onClick={() => handleSelect(l)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#090d16] shadow-sm shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={l.name}
            >
              <span>{l.flag}</span>
              <span className="uppercase">{l.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101726]/90 hover:bg-[#152033] border border-cyan-500/20 hover:border-cyan-400/40 text-gray-200 text-xs font-mono font-semibold transition-all duration-200 shadow-sm hover:shadow-cyan-500/10 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Interfeys tilini almashtirish"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="uppercase tracking-wider font-bold text-cyan-300">{current.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#0e1422] border border-cyan-500/25 shadow-2xl shadow-black/80 backdrop-blur-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-cyan-400/70 border-b border-cyan-500/10 mb-1">
            Tilni tanlang / Select
          </div>
          {LANGUAGES.map((l) => {
            const isSelected = l.code === uiLanguage;
            return (
              <button
                key={l.code}
                onClick={() => handleSelect(l)}
                className={`w-full px-3 py-2 text-xs font-sans flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{l.flag}</span>
                  <span>{l.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
