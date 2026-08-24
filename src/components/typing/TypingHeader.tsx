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
        className={`w-full max-w-4xl mx-auto mb-2 sm:mb-4 px-1 transition-opacity duration-150 ${
          isTestActive
            ? 'opacity-0 pointer-events-none h-0 overflow-hidden mb-0'
            : 'opacity-100'
        }`}
      >
        {/* Yolnoma Control Bar - Responsive Mobile & Desktop Layout */}
        <div className="w-full bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col md:flex-row md:items-center justify-between gap-1.5 text-xs font-semibold">
          
          {/* Top Row on Mobile: Language Selector & Mode Selector */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full md:w-auto">
            {/* Language Selector Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setLanguagesList(getAllLanguages());
                setShowLangModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] hover:border-[var(--main-color)] border border-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 transition-colors font-bold shrink-0 cursor-pointer text-xs"
              title="Matn tilini o'zgartirish"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--main-color)] shrink-0" />
              <span className="text-sm">{currentLang.flag}</span>
              <span className="text-xs font-bold max-w-[70px] sm:max-w-none truncate">{currentLang.nativeName}</span>
              <span className="text-[9px] sm:text-[10px] text-[var(--main-color)] font-mono uppercase bg-[var(--main-color)]/15 px-1 sm:px-1.5 py-0.5 rounded font-bold">
                {currentLang.code}
              </span>
            </button>

            <div className="h-4 w-[1px] bg-[var(--sub-alt)] hidden md:block" />

            {/* Mode Selector (So'zlar, Jumlalar, Hikoyalar) */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--sub-alt)]/40 p-0.5 rounded-lg overflow-x-auto no-scrollbar">
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
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer text-[11px] sm:text-xs ${
                      isActive
                        ? 'bg-[var(--main-color)] text-white font-bold'
                        : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[var(--sub-alt)] hidden md:block" />

          {/* Sub-modes: Time or Word Count (Horizontal scrolling with no-scrollbar on mobile) */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pt-0.5 md:pt-0">
            {/* Time Options */}
            <div className="flex items-center gap-0.5 bg-[var(--sub-alt)]/60 p-0.5 rounded-lg border border-[var(--sub-alt)] shrink-0">
              <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[var(--main-color)] ml-1 shrink-0" />
              {timeOptions.map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => {
                    setTimeMode(tVal);
                    setWordCountMode(0);
                    onReset();
                  }}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors font-mono font-bold text-[11px] sm:text-xs cursor-pointer ${
                    timeMode === tVal && wordCountMode === 0
                      ? 'bg-[var(--main-color)] text-white'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {tVal}s
                </button>
              ))}
            </div>

            {/* Word Options */}
            <div className="flex items-center gap-0.5 bg-[var(--sub-alt)]/60 p-0.5 rounded-lg border border-[var(--sub-alt)] shrink-0">
              <Type className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[var(--main-color)] ml-1 shrink-0" />
              {wordOptions.slice(0, 3).map((wVal) => (
                <button
                  key={wVal}
                  onClick={() => {
                    setWordCountMode(wVal);
                    setTimeMode(0);
                    onReset();
                  }}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors font-mono font-bold text-[11px] sm:text-xs cursor-pointer ${
                    wordCountMode === wVal && timeMode === 0
                      ? 'bg-[var(--main-color)] text-white'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {wVal}w
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Modal for Language Selection */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowLangModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl shadow-xl p-4 sm:p-5 z-50 text-xs space-y-3 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sub-alt)] shrink-0">
              <div className="flex items-center gap-2.5 text-[var(--text-color)]">
                <div className="p-2 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">Matn Tilini Tanlang</h3>
                  <p className="text-[11px] text-[var(--sub-color)] font-medium">Testingiz uchun tilni tanlang</p>
                </div>
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/80 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-[var(--sub-color)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tilni izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none focus:border-[var(--main-color)] font-bold text-xs transition-all"
                autoFocus
              />
            </div>

            {/* Language List */}
            <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
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
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all font-bold cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--main-color)] text-white shadow-md shadow-[var(--main-color)]/30 scale-[1.01]'
                          : 'text-[var(--text-color)] hover:bg-[var(--sub-alt)]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{l.flag}</span>
                        <div className="text-left">
                          <div className="text-xs font-black">{l.nativeName}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                            {l.name} ({l.script})
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-white font-bold" />}
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-[var(--sub-color)] py-6 text-xs">
                  Bunday til topilmadi
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
