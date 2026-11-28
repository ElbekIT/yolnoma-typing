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
 setUiLanguage(langCode);
 const typingLang = langCode === 'uz' ? 'uz-latn' : langCode;
 setLanguage(typingLang as any);

 try {
 localStorage.setItem('yolnoma_lang', langCode);
 localStorage.setItem('yolnoma_ui_lang', langCode);
 document.documentElement.lang = langCode;
 } catch {}

 if (typeof window !== 'undefined') {
 const pathname = window.location.pathname;
 const parts = pathname.split('/').filter(Boolean);
 const restOfPath =
 parts.length > 0 && (parts[0] === 'uz' || parts[0] === 'ru' || parts[0] === 'en')
 ? parts.slice(1).join('/')
 : parts.join('/');
 const newPath = `/${langCode}${restOfPath ? `/${restOfPath}`: ''}${window.location.search}${window.location.hash}`;
 if (window.location.pathname !== newPath) {
 window.history.pushState({ lang: langCode }, '', newPath);
 }
 }
 };

 if (compact) {
 return (
 <div className="grid grid-cols-3 gap-1 w-full bg-[var(--sub-alt)]/50 p-1 rounded-xl">
 {LANGUAGES.map((l) => {
 const isActive = l.code === uiLanguage;
 return (
 <button
 key={l.code}
 id={`drawer-lang-btn-${l.code}`}
 onClick={() => handleSelect(l.code)}
 className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
 isActive
 ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-black'
 : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
 }`}
 title={`${l.name} (${l.flag})`}
 >
 <span className="text-sm leading-none">{l.flag}</span>
 <span className="uppercase">{l.code}</span>
 </button>
 );
 })}
 </div>
 );
 }

 return (
 <div className="inline-flex items-center bg-[var(--card-bg)] p-1 rounded-xl">
 {LANGUAGES.map((l) => {
 const isActive = l.code === uiLanguage;
 return (
 <button
 key={l.code}
 id={`navbar-lang-btn-${l.code}`}
 onClick={() => handleSelect(l.code)}
 className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
 isActive
 ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-black'
 : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
 }`}
 title={`${l.name} (${l.flag})`}
 >
 <span className="text-sm leading-none">{l.flag}</span>
 <span className="uppercase">{l.code}</span>
 </button>
 );
 })}
 </div>
 );
};
