import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Globe, Check, ArrowRight, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { LanguageCode } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { getAllLanguages } from '../../utils/customContentStore';
import { LanguageInfo } from '../../config/languages';

interface LanguageSelectViewProps {
  onConfirm: () => void;
  onCancel?: () => void;
}

export const LanguageSelectView: React.FC<LanguageSelectViewProps> = ({ onConfirm, onCancel }) => {
  const { language, setLanguage } = useSettings();
  const [selectedLangCode, setSelectedLangCode] = useState<LanguageCode>(language);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all merged languages (built-in + admin custom languages)
  const allLanguages = useMemo(() => {
    return getAllLanguages();
  }, []);

  // Filtered languages by search query
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allLanguages;
    return allLanguages.filter(
      (l) =>
        l.nativeName.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        (l.script && l.script.toLowerCase().includes(q))
    );
  }, [allLanguages, searchQuery]);

  // Selected language object
  const activeLangObj = useMemo(() => {
    return allLanguages.find((l) => l.code.toLowerCase() === selectedLangCode.toLowerCase()) || allLanguages[0];
  }, [allLanguages, selectedLangCode]);

  // Focus search input on page mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setSelectedLangCode(code);
  };

  const handleConfirm = () => {
    setLanguage(selectedLangCode);
    onConfirm();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--sub-alt)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel || onConfirm}
            className="p-2 sm:p-2.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Orqaga</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--main-color)]" />
              <h1 className="text-lg sm:text-2xl font-black text-[var(--text-color)] tracking-tight">
                Matn Tilini Tanlash
              </h1>
            </div>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              Tez yozish mashqlari va testlar uchun o'zingizga qulay tilni tanlang
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleConfirm}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--main-color)] text-[var(--bg-color)] font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[var(--main-color)]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Tanladim va Boshlash</span>
          <ArrowRight className="w-4 h-4 opacity-80" />
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Left Column: Search & Languages Grid (2 columns on large) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box */}
          <div className="relative flex items-center bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-[var(--main-color)] transition-colors">
            <Search className="w-4 h-4 text-[var(--sub-color)] shrink-0 mr-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Til nomi yoki kodi bo'yicha qidirish (masalan: o'zbekcha, english, ruscha)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--text-color)] placeholder-[var(--sub-color)]/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[var(--sub-color)] hover:text-[var(--text-color)] px-1.5 py-0.5 rounded bg-[var(--sub-alt)] font-mono"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Languages Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[62vh] overflow-y-auto pr-1 custom-scrollbar">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((l) => {
                const isSelected = selectedLangCode.toLowerCase() === l.code.toLowerCase();
                return (
                  <div
                    key={l.code}
                    onClick={() => handleSelect(l.code)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[var(--main-color)]/10 border-[var(--main-color)] shadow-sm'
                        : 'bg-[var(--card-bg)] border-[var(--sub-alt)] hover:border-[var(--sub-color)]/60 hover:bg-[var(--sub-alt)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">
                        {l.flag || '🌐'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isSelected ? 'text-[var(--main-color)]' : 'text-[var(--text-color)]'
                            }`}
                          >
                            {l.nativeName}
                          </h3>
                          {l.script && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] font-mono">
                              {l.script}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--sub-color)] truncate">
                          {l.name}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator Checkbox / Checkmark */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-[var(--main-color)] border-[var(--main-color)] text-[var(--bg-color)]'
                          : 'border-[var(--sub-alt)] bg-[var(--sub-alt)]/50 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-[var(--sub-color)] bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl">
                <Globe className="w-8 h-8 mx-auto opacity-40 mb-2" />
                <p className="text-sm font-semibold">Bunday til topilmadi</p>
                <p className="text-xs opacity-70 mt-1">Qidiruv so'zini o'zgartirib ko'ring</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Language Preview & Details */}
        <div className="space-y-4">
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sub-alt)]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--sub-color)]">
                Tanlangan Til Ko'rinishi
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-bold">
                {activeLangObj.code}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-4xl">{activeLangObj.flag || '🌐'}</span>
              <div>
                <h2 className="text-lg font-black text-[var(--text-color)]">
                  {activeLangObj.nativeName}
                </h2>
                <p className="text-xs text-[var(--sub-color)]">{activeLangObj.name}</p>
              </div>
            </div>

            {/* Language Stats Info */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)]/60">
                <span className="text-[var(--sub-color)] block text-[10px]">Alifbo / Yozuv</span>
                <span className="font-bold text-[var(--text-color)] mt-0.5 block font-mono">
                  {activeLangObj.script || 'Standart'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)]/60">
                <span className="text-[var(--sub-color)] block text-[10px]">So'zlar bazasi</span>
                <span className="font-bold text-[var(--text-color)] mt-0.5 block font-mono">
                  {activeLangObj.words?.length || 0}+ ta
                </span>
              </div>
            </div>

            {/* Sample Text Preview */}
            <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--sub-color)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--main-color)]" />
                <span>Namuna matn:</span>
              </div>
              <p className="text-xs text-[var(--text-color)]/80 italic font-mono leading-relaxed line-clamp-3">
                "{activeLangObj.sentences?.[0] || activeLangObj.words?.slice(0, 10).join(' ') || 'Namuna mavjud emas'}"
              </p>
            </div>

            {/* Confirm Button inside Preview for Mobile / Quick Access */}
            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-[var(--main-color)] text-[var(--bg-color)] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Shu tilni tanlash & Boshlash</span>
            </button>
          </div>

          {/* Quick Tip Card */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-xs text-[var(--sub-color)] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[var(--main-color)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Tilni o'zgartirganingizdan so'ng, tez yozish testi darhol tanlangan tilning lug'at bazasi bilan yangilanadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
