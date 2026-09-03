import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Globe, Check, ArrowRight, ArrowLeft, Sparkles, BookOpen, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { LanguageCode } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { getAllLanguages } from '../../utils/customContentStore';
import { LanguageInfo } from '../../config/languages';

interface LanguageSelectViewProps {
  onConfirm: () => void;
  onCancel?: () => void;
}

export type LanguageCategory =
  | 'all'
  | 'turkic'
  | 'european'
  | 'east_asian'
  | 'south_asian'
  | 'middle_eastern'
  | 'african'
  | 'americas_caucasus'
  | 'cyrillic'
  | 'rtl';

export const LanguageSelectView: React.FC<LanguageSelectViewProps> = ({ onConfirm, onCancel }) => {
  const { language, setLanguage } = useSettings();
  const [selectedLangCode, setSelectedLangCode] = useState<LanguageCode>(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<LanguageCategory>('all');
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all merged languages (built-in + admin custom languages)
  const allLanguages = useMemo(() => {
    return getAllLanguages();
  }, []);

  // Category classification helper
  const getLanguageCategory = (l: LanguageInfo): LanguageCategory[] => {
    const cats: LanguageCategory[] = ['all'];
    const code = l.code.toLowerCase();

    // Turkic languages
    if (['uz-latn', 'uz-cyrl', 'tr', 'kk', 'ky', 'tk', 'az', 'kaa', 'ug', 'tt', 'ba', 'cv', 'sah', 'crh', 'gag'].includes(code)) {
      cats.push('turkic');
    }
    // European languages
    if (['en', 'es', 'de', 'fr', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'is', 'et', 'lt', 'lv', 'pl', 'cs', 'sk', 'ro', 'hu', 'el', 'bg', 'hr', 'sr', 'bs', 'sl', 'mk', 'sq', 'ga', 'cy', 'ca', 'eu', 'gl', 'mt', 'lb', 'fo', 'la', 'eo'].includes(code)) {
      cats.push('european');
    }
    // East & Southeast Asian / Pacific
    if (['zh-hans', 'zh-hant', 'ja', 'ko', 'vi', 'th', 'id', 'ms', 'tl', 'my', 'km', 'lo', 'jv', 'su', 'ceb', 'haw', 'mi'].includes(code)) {
      cats.push('east_asian');
    }
    // South Asian (Indic)
    if (['hi', 'bn', 'pa', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'ne', 'si', 'or', 'as', 'sa', 'sd'].includes(code)) {
      cats.push('south_asian');
    }
    // Middle Eastern
    if (['ar', 'fa', 'he', 'ur', 'ps', 'ku', 'dv'].includes(code)) {
      cats.push('middle_eastern');
    }
    // African
    if (['sw', 'am', 'ha', 'yo', 'ig', 'zu', 'xh', 'af', 'so', 'om', 'mg', 'rw', 'sn', 'ny', 'st', 'tn', 'wo', 'ti'].includes(code)) {
      cats.push('african');
    }
    // Caucasus & Americas
    if (['ka', 'hy', 'qu', 'gn', 'ay', 'ht', 'nah'].includes(code)) {
      cats.push('americas_caucasus');
    }
    // Cyrillic script
    if (l.script === 'Cyrillic' || ['uz-cyrl', 'ru', 'kk', 'ky', 'tg', 'uk', 'be', 'bg', 'sr', 'mn', 'tt', 'ba', 'cv', 'sah', 'ce', 'os', 'ab', 'mk'].includes(code)) {
      cats.push('cyrillic');
    }
    // RTL
    if (l.dir === 'rtl' || ['ar', 'fa', 'ur', 'he', 'ps', 'ug', 'dv', 'sd'].includes(code)) {
      cats.push('rtl');
    }

    return cats;
  };

  // Filtered languages by search query and category
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allLanguages.filter((l) => {
      // Category check
      if (activeCategory !== 'all') {
        const cats = getLanguageCategory(l);
        if (!cats.includes(activeCategory)) return false;
      }

      // Search query check
      if (!q) return true;
      return (
        l.nativeName.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        (l.script && l.script.toLowerCase().includes(q))
      );
    });
  }, [allLanguages, searchQuery, activeCategory]);

  // Reset to page 1 on query, category, or items-per-page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, itemsPerPage]);

  // Total pages
  const actualItemsPerPage = itemsPerPage === -1 ? filteredLanguages.length || 1 : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredLanguages.length / actualItemsPerPage));

  // Current page items
  const paginatedLanguages = useMemo(() => {
    if (itemsPerPage === -1) {
      return filteredLanguages;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLanguages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLanguages, currentPage, itemsPerPage]);

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

  const categories = [
    { id: 'all' as LanguageCategory, label: 'Barchasi', count: allLanguages.length },
    { id: 'turkic' as LanguageCategory, label: 'Turkiy tillar', count: allLanguages.filter(l => getLanguageCategory(l).includes('turkic')).length },
    { id: 'european' as LanguageCategory, label: 'Yevropa tillari', count: allLanguages.filter(l => getLanguageCategory(l).includes('european')).length },
    { id: 'east_asian' as LanguageCategory, label: 'Sharqiy & Tinch Okeani', count: allLanguages.filter(l => getLanguageCategory(l).includes('east_asian')).length },
    { id: 'south_asian' as LanguageCategory, label: 'Janubiy Osiyo (Hindiston)', count: allLanguages.filter(l => getLanguageCategory(l).includes('south_asian')).length },
    { id: 'middle_eastern' as LanguageCategory, label: 'Yaqin Sharq', count: allLanguages.filter(l => getLanguageCategory(l).includes('middle_eastern')).length },
    { id: 'african' as LanguageCategory, label: 'Afrika tillari', count: allLanguages.filter(l => getLanguageCategory(l).includes('african')).length },
    { id: 'americas_caucasus' as LanguageCategory, label: 'Kavkaz & Amerika', count: allLanguages.filter(l => getLanguageCategory(l).includes('americas_caucasus')).length },
    { id: 'cyrillic' as LanguageCategory, label: 'Kirill yozuvida', count: allLanguages.filter(l => getLanguageCategory(l).includes('cyrillic')).length },
    { id: 'rtl' as LanguageCategory, label: 'Oʻngdan-chapga (RTL)', count: allLanguages.filter(l => getLanguageCategory(l).includes('rtl')).length }
  ];

  // Smart visible page numbers (sliding window)
  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  return (
    <div className="w-full max-w-6xl mx-auto py-3 sm:py-6 px-2 sm:px-4">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--sub-alt)]">
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
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] font-mono font-bold border border-[var(--main-color)]/20">
                {allLanguages.length} ta jahon tili
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              Dunyodagi barcha qit'alar va xalqlar tillarida professional darajada tez yozish mashqlari
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

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 custom-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-[var(--main-color)] text-[var(--bg-color)] border-[var(--main-color)] font-bold shadow-sm'
                  : 'bg-[var(--card-bg)] text-[var(--sub-color)] border-[var(--sub-alt)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/40'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-black/20 text-[var(--bg-color)]'
                    : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Search, Controls & Languages Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box & Per Page Selector */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-[var(--main-color)] transition-colors">
              <Search className="w-4 h-4 text-[var(--sub-color)] shrink-0 mr-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Til nomi, alifbo yoki kodi (masalan: o'zbekcha, english, español, العربية, 日本語)..."
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

            {/* Items Per Page */}
            <div className="flex items-center gap-1 self-end sm:self-auto bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-1 shrink-0">
              {[12, 24, 48, -1].map((n) => (
                <button
                  key={n}
                  onClick={() => setItemsPerPage(n)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    itemsPerPage === n
                      ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {n === -1 ? 'Barchasi' : n}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-h-[360px]">
            {paginatedLanguages.length > 0 ? (
              paginatedLanguages.map((l, idx) => {
                const isSelected = selectedLangCode.toLowerCase() === l.code.toLowerCase();
                const globalIndex = itemsPerPage === -1 ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1;
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
                      {/* Number Index */}
                      <span className="text-[11px] font-mono text-[var(--sub-color)]/60 w-6 shrink-0 text-right">
                        {globalIndex}.
                      </span>

                      {/* Flag */}
                      <span className="text-2xl shrink-0 select-none">
                        {l.flag || '🌐'}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isSelected ? 'text-[var(--main-color)]' : 'text-[var(--text-color)]'
                            }`}
                          >
                            {l.nativeName}
                          </h3>
                          {l.script && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] font-mono shrink-0">
                              {l.script}
                            </span>
                          )}
                          {l.dir === 'rtl' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-mono shrink-0 font-bold">
                              RTL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--sub-color)] truncate">
                          {l.name}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-[var(--main-color)] border-[var(--main-color)] text-[var(--bg-color)] scale-105'
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
                <p className="text-xs opacity-70 mt-1">Qidiruv so'zini yoki toifani o'zgartirib ko'ring</p>
              </div>
            )}
          </div>

          {/* Numbered Sliding Pagination */}
          {totalPages > 1 && itemsPerPage !== -1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[var(--sub-alt)]">
              <div className="text-xs text-[var(--sub-color)] font-mono">
                Ko'rsatilmoqda:{' '}
                <span className="text-[var(--text-color)] font-bold">
                  {(currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredLanguages.length)}
                </span>{' '}
                / jami <span className="text-[var(--text-color)] font-bold">{filteredLanguages.length}</span> ta til
              </div>

              <div className="flex items-center gap-1">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Oldingi sahifa"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {visiblePages.map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-[var(--sub-color)] select-none">
                        ...
                      </span>
                    );
                  }
                  const pageNum = item as number;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-[var(--main-color)] text-[var(--bg-color)] border-[var(--main-color)] shadow-sm'
                          : 'bg-[var(--card-bg)] text-[var(--sub-color)] border-[var(--sub-alt)] hover:border-[var(--sub-color)] hover:text-[var(--text-color)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Keyingi sahifa"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected Language Preview & Details */}
        <div className="space-y-4">
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-5 shadow-sm space-y-4 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sub-alt)]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--sub-color)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--main-color)]" />
                Tanlangan Til Ko'rinishi
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-bold border border-[var(--main-color)]/20">
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
                <span className="text-[var(--sub-color)] block text-[10px]">Lug'at boyligi</span>
                <span className="font-bold text-[var(--text-color)] mt-0.5 block font-mono">
                  {activeLangObj.words?.length || 0}+ ta so'z
                </span>
              </div>
            </div>

            {/* Text Direction Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)]/50 text-xs">
              <span className="text-[var(--sub-color)] text-[11px]">Yozuv yo'nalishi:</span>
              <span className="font-bold font-mono text-[var(--text-color)]">
                {activeLangObj.dir === 'rtl' ? 'Oʻngdan chapga (RTL)' : 'Chapdan oʻngga (LTR)'}
              </span>
            </div>

            {/* Sample Text Preview */}
            <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--sub-color)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--main-color)]" />
                <span>Namuna matn:</span>
              </div>
              <p className="text-xs text-[var(--text-color)]/90 italic font-mono leading-relaxed line-clamp-3" dir={activeLangObj.dir || 'ltr'}>
                "{activeLangObj.sentences?.[0] || activeLangObj.words?.slice(0, 10).join(' ') || 'Namuna mavjud emas'}"
              </p>
            </div>

            {/* Sample Quote Preview if available */}
            {activeLangObj.quotes?.[0] && (
              <div className="p-3 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/40 text-xs space-y-1">
                <span className="text-[10px] text-[var(--sub-color)] font-mono block">Hikmatli so'z:</span>
                <p className="text-[var(--text-color)] italic" dir={activeLangObj.dir || 'ltr'}>
                  "{activeLangObj.quotes[0].text}"
                </p>
                <p className="text-[10px] text-[var(--main-color)] font-semibold text-right">
                  — {activeLangObj.quotes[0].author}
                </p>
              </div>
            )}

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
              Tilni o'zgartirganingizdan so'ng, tez yozish testi darhol tanlangan tilning lug'at bazasi va so'zlari bilan yangilanadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
