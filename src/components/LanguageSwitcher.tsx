import React from 'react';
import { useI18n, UiLanguage } from '../context/I18nContext';
import { useSettings } from '../context/SettingsContext';

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

  const handleSelect = (langCode: UiLanguage) => {
    // 1. Update UI language state
    setUiLanguage(langCode);

    // 2. Update typing engine language ('ru', 'uz-latn', or 'en')
    const typingLang = langCode === 'uz' ? 'uz-latn' : langCode;
    setLanguage(typingLang as any);

    // 3. Persist to localStorage directly
    try {
      localStorage.setItem('yolnoma_lang', langCode);
      localStorage.setItem('yolnoma_ui_lang', langCode);
      document.documentElement.lang = langCode;
    } catch {}

    // 4. Update URL path with language prefix e.g. /uz/test -> /ru/test or /uz -> /ru
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      let restOfPath = '';
      if (parts.length > 0 && (parts[0] === 'uz' || parts[0] === 'ru' || parts[0] === 'en')) {
        restOfPath = parts.slice(1).join('/');
      } else {
        restOfPath = parts.join('/');
      }
      const newPath = `/${langCode}${restOfPath ? `/${restOfPath}` : ''}${window.location.search}${window.location.hash}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ lang: langCode }, '', newPath);
      }
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-1.5 w-full bg-[#101726]/90 p-1.5 rounded-2xl border border-cyan-500/25 shadow-inner">
        {LANGUAGES.map((l) => {
          const isActive = l.code === uiLanguage;
          return (
            <button
              key={l.code}
              id={`drawer-lang-btn-${l.code}`}
              onClick={() => handleSelect(l.code)}
              className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/40 border border-emerald-300 ring-1 ring-emerald-300/80 scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={`${l.name} (${l.flag})`}
            >
              <span className="text-sm leading-none">{l.flag}</span>
              <span className="uppercase font-black tracking-wider">{l.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center bg-[#101726]/90 p-0.5 sm:p-1 rounded-xl border border-cyan-500/25 shadow-inner">
      {LANGUAGES.map((l) => {
        const isActive = l.code === uiLanguage;
        return (
          <button
            key={l.code}
            id={`navbar-lang-btn-${l.code}`}
            onClick={() => handleSelect(l.code)}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/40 border border-emerald-300 ring-1 ring-emerald-300/80'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title={`${l.name} (${l.flag})`}
          >
            <span className="hidden sm:inline text-xs leading-none">{l.flag}</span>
            <span className="uppercase font-black">{l.code}</span>
          </button>
        );
      })}
    </div>
  );
};
