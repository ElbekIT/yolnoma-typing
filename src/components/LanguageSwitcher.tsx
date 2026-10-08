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
      <div className="grid grid-cols-3 gap-1.5 w-full bg-[var(--card-bg)] p-1.5 rounded-2xl border border-[var(--sub-color)]/20 shadow-xs">
        {LANGUAGES.map((l) => {
          const isActive = l.code === uiLanguage;
          return (
            <button
              key={l.code}
              id={`drawer-lang-btn-${l.code}`}
              onClick={() => handleSelect(l.code)}
              className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-black shadow-xs'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
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
    <div className="flex items-center bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--sub-color)]/20 shadow-xs">
      {LANGUAGES.map((l) => {
        const isActive = l.code === uiLanguage;
        return (
          <button
            key={l.code}
            id={`navbar-lang-btn-${l.code}`}
            onClick={() => handleSelect(l.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-black shadow-xs'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
            }`}
            title={`${l.name} (${l.flag})`}
          >
            <span className="text-sm leading-none">{l.flag}</span>
            <span className="uppercase font-black">{l.code}</span>
          </button>
        );
      })}
    </div>
  );
};
