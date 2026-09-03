import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Clock, Type, Layers, Globe, Sparkles, Search, X, Film } from 'lucide-react';
import { TextMode, TimeMode, WordCountMode, DifficultyMode, LanguageCode } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { getAllLanguages } from '../../utils/customContentStore';

interface TypingHeaderProps {
  mode: TextMode;
  setMode: (m: TextMode) => void;
  timeMode: TimeMode;
  setTimeMode: (t: TimeMode) => void;
  wordCountMode: WordCountMode;
  setWordCountMode: (w: WordCountMode) => void;
  difficulty: DifficultyMode;
  setDifficulty: (d: DifficultyMode) => void;
  customText: string;
  setCustomText: (txt: string) => void;
  onReset: () => void;
  isTestActive?: boolean;
  onOpenLanguagePage?: () => void;
}

export const TypingHeader: React.FC<TypingHeaderProps> = ({
  mode,
  setMode,
  timeMode,
  setTimeMode,
  wordCountMode,
  setWordCountMode,
  onReset,
  isTestActive = false,
  onOpenLanguagePage
}) => {
  const { language, setLanguage, modeBarWidth, modeBarScale, tapeMode, setTapeMode } = useSettings();
  const [showLangModal, setShowLangModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const timeOptions: TimeMode[] = [15, 30, 60, 120];
  const wordOptions: WordCountMode[] = [100, 200, 300, 400, 500];
  const modesList: { id: TextMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'words', label: "So'zlar", icon: Type },
    { id: 'sentences', label: 'Jumlalar', icon: Layers },
    { id: 'story', label: 'Hikoyalar', icon: Sparkles },
  ];

  // Fast memoized languages list
  const languagesList = useMemo(() => {
    return getAllLanguages();
  }, [showLangModal]);

  const currentLang = useMemo(
    () => languagesList.find((l) => l.code.toLowerCase() === language.toLowerCase()) || languagesList[0],
    [languagesList, language]
  );

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return languagesList;
    return languagesList.filter(
      (l) =>
        l.nativeName.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [languagesList, searchQuery]);

  // When modal opens, set highlighted index and focus search input instantly
  useEffect(() => {
    if (showLangModal) {
      const idx = filteredLanguages.findIndex((l) => l.code.toLowerCase() === language.toLowerCase());
      setHighlightedIndex(idx >= 0 ? idx : 0);
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      });
    } else {
      setSearchQuery('');
    }
  }, [showLangModal]);

  // Reset highlighted index on query change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code as LanguageCode);
    setShowLangModal(false);
    onReset();
  };

  const scrollIndexIntoView = (index: number) => {
    if (!listContainerRef.current) return;
    const items = listContainerRef.current.querySelectorAll('[data-lang-item]');
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowLangModal(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredLanguages.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredLanguages.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredLanguages[highlightedIndex]) {
        handleSelectLanguage(filteredLanguages[highlightedIndex].code);
      }
    }
  };

  const widthClass = {
    compact: 'max-w-xl',
    standard: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'max-w-7xl',
  }[modeBarWidth || 'standard'];

  const scaleConfig = {
    small: {
      container: 'py-0.5 px-2 text-[11px] gap-1.5 sm:gap-2.5',
      button: 'px-1.5 py-0.5 text-[11px] gap-1',
      icon: 'w-3 h-3',
      divider: 'h-3',
    },
    medium: {
      container: 'py-1 px-2.5 sm:px-3 text-xs gap-2 sm:gap-4',
      button: 'px-2 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
      divider: 'h-3.5',
    },
    large: {
      container: 'py-1.5 px-3.5 sm:px-4 text-sm gap-2.5 sm:gap-5',
      button: 'px-2.5 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4',
      divider: 'h-4',
    },
  }[modeBarScale || 'medium'];

  return (
    <>
      <div
        className={`w-full ${widthClass} mx-auto mb-4 sm:mb-6 px-2 transition-all duration-150 ${
          isTestActive
            ? 'opacity-0 pointer-events-none h-0 overflow-hidden mb-0'
            : 'opacity-100'
        }`}
      >
        {/* Monkeytype Style Minimal Floating Pill Bar */}
        <div className={`w-full bg-[var(--card-bg)]/90 border border-[var(--sub-alt)] rounded-xl ${scaleConfig.container} flex items-center justify-center font-mono select-none overflow-x-auto no-scrollbar shadow-sm`}>
          {/* Modes List */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {modesList.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    onReset();
                  }}
                  className={`flex items-center ${scaleConfig.button} rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[var(--main-color)] font-bold'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  <Icon className={scaleConfig.icon} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className={`${scaleConfig.divider} w-[1px] bg-[var(--sub-alt)] shrink-0`} />

          {/* Time Options */}
          {mode === 'words' && timeMode > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className={`${scaleConfig.icon} text-[var(--sub-color)]`} />
              {timeOptions.map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => {
                    setTimeMode(tVal);
                    setWordCountMode(0);
                    onReset();
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    timeMode === tVal && wordCountMode === 0
                      ? 'text-[var(--main-color)] font-bold'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {tVal}
                </button>
              ))}
            </div>
          )}

          {/* Word Count Options */}
          {mode === 'words' && wordCountMode > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Type className={`${scaleConfig.icon} text-[var(--sub-color)]`} />
              {wordOptions.slice(0, 4).map((wVal) => (
                <button
                  key={wVal}
                  onClick={() => {
                    setWordCountMode(wVal);
                    setTimeMode(0);
                    onReset();
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    wordCountMode === wVal && timeMode === 0
                      ? 'text-[var(--main-color)] font-bold'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {wVal}
                </button>
              ))}
            </div>
          )}

          {/* Quick toggle between Time vs Word mode when on 'words' tab */}
          {mode === 'words' && (
            <>
              <div className={`${scaleConfig.divider} w-[1px] bg-[var(--sub-alt)] shrink-0`} />
              <button
                onClick={() => {
                  if (timeMode > 0) {
                    setTimeMode(0);
                    setWordCountMode(100);
                  } else {
                    setTimeMode(30);
                    setWordCountMode(0);
                  }
                  onReset();
                }}
                className="text-[10px] text-[var(--sub-color)] hover:text-[var(--main-color)] px-1 py-0.5 rounded transition-colors cursor-pointer"
                title="Vaqt / So'z soni rejimini almashtirish"
              >
                {timeMode > 0 ? 'vaqt' : "so'z"}
              </button>
            </>
          )}
        </div>

        {/* Minimalist Centered Language & Tape Mode Indicators (Monkeytype style) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3">
          <button
            onClick={() => {
              setSearchQuery('');
              setShowLangModal(true);
            }}
            className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer font-mono opacity-80 hover:opacity-100 py-0.5 px-2 rounded-lg hover:bg-[var(--sub-alt)]/40"
            title="Tilni tezkor almashtirish (125+ jahon tillari)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{currentLang.flag} {currentLang.nativeName}</span>
          </button>

          <span className="text-[var(--sub-color)] opacity-30 text-xs select-none">•</span>

          <button
            onClick={() => {
              const nextMode = tapeMode === 'off' ? 'letter' : tapeMode === 'letter' ? 'word' : 'off';
              setTapeMode(nextMode);
              onReset();
            }}
            className={`flex items-center gap-1.5 text-xs transition-all cursor-pointer font-mono py-0.5 px-2 rounded-lg hover:bg-[var(--sub-alt)]/40 ${
              tapeMode !== 'off'
                ? 'text-[var(--main-color)] font-semibold bg-[var(--main-color)]/10'
                : 'text-[var(--sub-color)] opacity-80 hover:opacity-100'
            }`}
            title="Lenta rejimini almashtirish (Tape mode: off -> letter -> word)"
          >
            <Film className="w-3.5 h-3.5" />
            <span>tape: {tapeMode}</span>
          </button>
        </div>
      </div>

      {/* Monkeytype Style Super-Fast Instant Language Command Palette Modal */}
      {showLangModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-[2px]"
          onClick={() => setShowLangModal(false)}
        >
          {/* Modal Box */}
          <div
            className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--sub-alt)] bg-[var(--card-bg)] shrink-0">
              <Search className="w-4 h-4 text-[var(--sub-color)] opacity-70" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tilni qidirish / search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-[var(--text-color)] placeholder-[var(--sub-color)]/50 focus:outline-none font-mono text-xs sm:text-sm"
              />
              <button
                onClick={() => setShowLangModal(false)}
                className="p-1 rounded-md text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50 transition-colors cursor-pointer"
                title="Yopish (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language List */}
            <div
              ref={listContainerRef}
              className="overflow-y-auto p-1.5 space-y-0.5 flex-1 select-none custom-scrollbar"
            >
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((l, idx) => {
                  const isSelected = language.toLowerCase() === l.code.toLowerCase();
                  const isHighlighted = highlightedIndex === idx;
                  return (
                    <button
                      key={l.code}
                      data-lang-item
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`w-full flex items-center px-3.5 py-2 rounded-lg text-left font-mono text-xs transition-colors cursor-pointer ${
                        isHighlighted
                          ? 'bg-[var(--text-color)] text-[var(--bg-color)] font-bold'
                          : isSelected
                          ? 'bg-[var(--sub-alt)] text-[var(--text-color)] font-semibold'
                          : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
                      }`}
                    >
                      <span className="w-6 shrink-0 text-sm">
                        {l.flag || '🌐'}
                      </span>
                      <span className="w-5 shrink-0 text-xs font-mono font-bold">
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="truncate flex-1 font-medium">
                        {l.nativeName}
                        {l.name && l.name !== l.nativeName ? (
                          <span className="ml-1.5 opacity-60 text-[11px] font-normal">({l.name})</span>
                        ) : null}
                      </span>
                      <span
                        className={`text-[10px] font-mono ml-2 uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 ${
                          isHighlighted
                            ? 'text-[var(--bg-color)]/90'
                            : 'text-[var(--sub-color)]'
                        }`}
                      >
                        {l.code}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center text-[var(--sub-color)] py-8 font-mono text-xs opacity-60">
                  Bunday til topilmadi
                </div>
              )}
            </div>

            {/* Footer Prompt */}
            <div className="px-4 py-2.5 border-t border-[var(--sub-alt)]/60 bg-[var(--card-bg)]/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[var(--sub-color)] opacity-80 shrink-0">
              <div className="flex items-center gap-2">
                <span>{filteredLanguages.length} ta jahon tili</span>
                {onOpenLanguagePage && (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => {
                        setShowLangModal(false);
                        onOpenLanguagePage();
                      }}
                      className="text-[var(--main-color)] hover:underline font-bold cursor-pointer"
                    >
                      Barcha 125+ tillar sahifasi →
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-[9px] opacity-70">
                <span>↑↓ - harakat</span>
                <span>enter - tanlash</span>
                <span>esc - yopish</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
