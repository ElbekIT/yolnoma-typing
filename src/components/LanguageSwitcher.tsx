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

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = () => {
  const { uiLanguage, setUiLanguage } = useI18n();
  const { setLanguage } = useSettings();

  const handleSelect = (langCode: UiLanguage) => {
    if (langCode === uiLanguage) return;
    setUiLanguage(langCode);
    const typingLang = langCode === 'uz' ? 'uz-latn' : langCode;
    setLanguage(typingLang as any);

    // Update URL path with language prefix e.g. /uz/test -> /ru/test
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
        window.history.pushState(null, '', newPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  return (
    <div className="flex items-center bg-[#101726]/90 p-0.5 sm:p-1 rounded-xl border border-cyan-500/25 shadow-inner">
      {LANGUAGES.map((l) => {
        const isActive = l.code === uiLanguage;
        return (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-[#090d16] font-black shadow-sm shadow-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title={`${l.name} (${l.flag})`}
          >
            <span className="hidden sm:inline text-xs leading-none">{l.flag}</span>
            <span className="uppercase">{l.code}</span>
          </button>
        );
      })}
    </div>
  );
};
