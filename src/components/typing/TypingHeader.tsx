import React, { useState } from 'react';
import { Clock, Type, Layers, Globe, Sparkles, Check, Search, X } from 'lucide-react';
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
}

export const TypingHeader: React.FC<TypingHeaderProps> = ({
  mode,
  setMode,
  timeMode,
  setTimeMode,
  wordCountMode,
  setWordCountMode,
  onReset,
  isTestActive = false
}) => {
  const { language, setLanguage } = useSettings();
  const [showLangModal, setShowLangModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [languagesList, setLanguagesList] = useState(getAllLanguages());

  const timeOptions: TimeMode[] = [15, 30, 60, 120];
  const wordOptions: WordCountMode[] = [100, 200, 300, 400, 500];
  const modesList: { id: TextMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'words', label: "So'zlar", icon: Type },
    { id: 'sentences', label: 'Jumlalar', icon: Layers },
    { id: 'story', label: 'Hikoyalar', icon: Sparkles },
  ];

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  const filteredLanguages = languagesList.filter(
    (l) =>
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div
        className={`w-full max-w-3xl mx-auto mb-4 sm:mb-6 px-2 transition-opacity duration-150 ${
          isTestActive
            ? 'opacity-0 pointer-events-none h-0 overflow-hidden mb-0'
            : 'opacity-100'
        }`}
      >
        {/* Monkeytype Style Minimal Floating Pill Bar */}
        <div className="w-full bg-[var(--card-bg)]/90 border border-[var(--sub-alt)] rounded-xl py-1 px-2.5 sm:px-3 flex items-center justify-center gap-2 sm:gap-4 text-xs font-mono select-none overflow-x-auto no-scrollbar shadow-sm">
          {/* Modes List */}
          <div className="flex items-center gap-1 sm:gap-2">
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
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-xs ${
                    isActive
                      ? 'text-[var(--main-color)] font-bold'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-3.5 w-[1px] bg-[var(--sub-alt)] shrink-0" />

          {/* Time Options */}
          {mode === 'words' && timeMode > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="w-3 h-3 text-[var(--sub-color)]" />
              {timeOptions.map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => {
                    setTimeMode(tVal);
                    setWordCountMode(0);
                    onReset();
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors text-xs cursor-pointer ${
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
              <Type className="w-3 h-3 text-[var(--sub-color)]" />
              {wordOptions.slice(0, 4).map((wVal) => (
                <button
                  key={wVal}
                  onClick={() => {
                    setWordCountMode(wVal);
                    setTimeMode(0);
                    onReset();
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors text-xs cursor-pointer ${
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
              <div className="h-3.5 w-[1px] bg-[var(--sub-alt)] shrink-0" />
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

        {/* Minimalist Centered Language Indicator (Monkeytype style) */}
        <div className="flex items-center justify-center mt-3">
          <button
            onClick={() => {
              setSearchQuery('');
              setLanguagesList(getAllLanguages());
              setShowLangModal(true);
            }}
            className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer font-mono opacity-80 hover:opacity-100 py-0.5 px-2 rounded-lg hover:bg-[var(--sub-alt)]/40"
            title="Tilni tanlash"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{currentLang.nativeName}</span>
          </button>
        </div>
      </div>

      {/* Monkeytype Style Language Command Palette Modal */}
      {showLangModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
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
                type="text"
                placeholder="Tilni qidirish / search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowLangModal(false);
                  } else if (e.key === 'Enter' && filteredLanguages.length > 0) {
                    setLanguage(filteredLanguages[0].code as LanguageCode);
                    setShowLangModal(false);
                    onReset();
                  }
                }}
                className="w-full bg-transparent text-[var(--text-color)] placeholder-[var(--sub-color)]/50 focus:outline-none font-mono text-xs sm:text-sm"
                autoFocus
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
            <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 select-none">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((l) => {
                  const isSelected = language === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code as LanguageCode);
                        setShowLangModal(false);
                        onReset();
                      }}
                      className={`w-full flex items-center px-3.5 py-2 rounded-lg text-left font-mono text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--text-color)] text-[var(--bg-color)] font-bold'
                          : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-xs font-mono font-bold">
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="truncate flex-1">
                        {l.nativeName.toLowerCase()}
                      </span>
                      <span
                        className={`text-[10px] font-mono ml-2 ${
                          isSelected ? 'text-[var(--bg-color)]/80' : 'text-[var(--sub-color)]/60'
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
            <div className="px-4 py-2 border-t border-[var(--sub-alt)]/60 bg-[var(--card-bg)]/80 flex items-center justify-between text-[10px] font-mono text-[var(--sub-color)] opacity-60 shrink-0">
              <span>{filteredLanguages.length} ta til mavjud</span>
              <span>esc - yopish</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
