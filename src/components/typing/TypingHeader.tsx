import React, { useState } from 'react';
import { Clock, Type, Code, Layers, Globe, Sparkles, Check, Search, X } from 'lucide-react';
import { TextMode, TimeMode, WordCountMode, DifficultyMode, LanguageCode } from '../../types';
import { languagesList } from '../../config/languages';
import { useSettings } from '../../context/SettingsContext';

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
  difficulty,
  setDifficulty,
  customText,
  setCustomText,
  onReset,
  isTestActive = false
}) => {
  const { language, setLanguage } = useSettings();
  const [showLangModal, setShowLangModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const timeOptions: TimeMode[] = [15, 30, 60, 120];
  const wordOptions: WordCountMode[] = [10, 25, 50, 100];
  const modesList: { id: TextMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'words', label: "So'zlar", icon: Type },
    { id: 'sentences', label: 'Jumlalar', icon: Layers },
    { id: 'story', label: 'Hikoyalar', icon: Sparkles },
    { id: 'custom', label: 'Shaxsiy Matn', icon: Code },
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
        className={`w-full max-w-4xl mx-auto mb-5 flex flex-col items-center gap-3 transition-all duration-300 transform ${
          isTestActive
            ? 'opacity-0 pointer-events-none -translate-y-4 scale-95 h-0 overflow-hidden mb-0'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Yolnoma Control Bar */}
        <div className="w-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--sub-alt)] rounded-2xl p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          {/* Language Selector Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setShowLangModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:border-[var(--main-color)] border border-[var(--sub-color)]/20 hover:bg-[var(--sub-alt)]/80 transition-all font-bold group shrink-0 cursor-pointer"
            title="Matn tilini o'zgartirish"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--main-color)] group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-sm">{currentLang.flag}</span>
            <span className="text-xs font-extrabold">{currentLang.nativeName}</span>
            <span className="text-[10px] text-[var(--main-color)] font-mono uppercase bg-[var(--main-color)]/15 px-1.5 py-0.5 rounded font-black">
              {currentLang.code}
            </span>
          </button>

          <div className="h-5 w-[1px] bg-[var(--sub-color)]/20 hidden sm:block" />

          {/* Mode Selector (So'zlar, Jumlalar, Hikoyalar, Shaxsiy Matn) */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 bg-[var(--sub-alt)]/40 p-1 rounded-xl">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[var(--main-color)] text-white font-bold shadow-md shadow-[var(--main-color)]/30'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-5 w-[1px] bg-[var(--sub-color)]/20 hidden md:block" />

          {/* Sub-modes: Time or Word Count */}
          <div className="flex items-center gap-2">
            {/* Time Options */}
            <div className="flex items-center gap-1 bg-[var(--sub-alt)]/60 p-1 rounded-xl border border-[var(--sub-alt)]">
              <Clock className="w-3.5 h-3.5 text-[var(--main-color)] ml-1" />
              {timeOptions.map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => {
                    setTimeMode(tVal);
                    setWordCountMode(0);
                    onReset();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all font-mono font-bold text-xs cursor-pointer ${
                    timeMode === tVal && wordCountMode === 0
                      ? 'bg-[var(--main-color)] text-white shadow-sm'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {tVal}s
                </button>
              ))}
            </div>

            {/* Word Options */}
            <div className="flex items-center gap-1 bg-[var(--sub-alt)]/60 p-1 rounded-xl border border-[var(--sub-alt)]">
              <Type className="w-3.5 h-3.5 text-[var(--main-color)] ml-1" />
              {wordOptions.map((wVal) => (
                <button
                  key={wVal}
                  onClick={() => {
                    setWordCountMode(wVal);
                    setTimeMode(0);
                    onReset();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all font-mono font-bold text-xs cursor-pointer ${
                    wordCountMode === wVal && timeMode === 0
                      ? 'bg-[var(--main-color)] text-white shadow-sm'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {wVal}w
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Text Box */}
        {mode === 'custom' && (
          <div className="w-full max-w-xl bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--sub-alt)] space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-bold text-[var(--sub-color)] block uppercase font-mono">
              Shaxsiy Matningizni Kiriting:
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                onReset();
              }}
              placeholder="Bu yerga o'z matningizni qo'ying va yozishni boshlang..."
              className="w-full bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] rounded-xl p-3 text-xs text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none focus:border-[var(--main-color)] font-mono resize-none"
            />
          </div>
        )}
      </div>

      {/* Centered Modal for Language Selection */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLangModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl shadow-2xl p-6 z-50 text-xs space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sub-alt)]">
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
            <div className="relative">
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
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
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
