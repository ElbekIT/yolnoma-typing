import React from 'react';
import { Clock, Type, Code, Hash, Quote, Layers, Globe, Sparkles, Sliders } from 'lucide-react';
import { TextMode, TimeMode, WordCountMode, DifficultyMode, LanguageCode } from '../../types';
import { languagesList, t } from '../../config/languages';
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
  const [showLangMenu, setShowLangMenu] = React.useState(false);

  const timeOptions: TimeMode[] = [15, 30, 60, 120];
  const wordOptions: WordCountMode[] = [10, 25, 50, 100];
  const modesList: { id: TextMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'words', label: 'Soʻzlar', icon: Type },
    { id: 'sentences', label: 'Jumlalar', icon: Layers },
    { id: 'story', label: 'Hikoyalar', icon: Sparkles },
    { id: 'custom', label: 'Shaxsiy Matn', icon: Code },
  ];

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  return (
    <div
      className={`w-full max-w-4xl mx-auto mb-4 flex flex-col gap-2 transition-all duration-300 transform ${
        isTestActive ? 'opacity-0 pointer-events-none -translate-y-4 scale-95 h-0 overflow-hidden mb-0' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      {/* Explicit Language Bar on ALL Devices */}
      <div className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl px-3.5 py-2 shadow-sm text-xs font-bold">
        <div className="flex items-center gap-2 text-[var(--sub-color)]">
          <Globe className="w-4 h-4 text-[var(--main-color)]" />
          <span>Tilni Tanlang:</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:border-[var(--main-color)] border border-[var(--sub-color)]/20 transition-all font-black"
          >
            <span className="text-sm">{currentLang.flag}</span>
            <span>{currentLang.nativeName}</span>
            <span className="text-[10px] text-[var(--main-color)] font-mono uppercase bg-[var(--main-color)]/10 px-1.5 py-0.5 rounded">
              {currentLang.code}
            </span>
          </button>

          {showLangMenu && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setShowLangMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-60 max-h-72 overflow-y-auto bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl shadow-2xl z-50 p-2 text-xs font-semibold">
                <div className="px-2 py-1 text-[var(--sub-color)] font-extrabold uppercase text-[10px] tracking-wider pb-1 border-b border-[var(--sub-alt)] mb-1">
                  Matn Tilini Tanlang
                </div>
                {languagesList.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as LanguageCode);
                      setShowLangMenu(false);
                      onReset();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-bold ${
                      language === l.code
                        ? 'bg-[var(--main-color)] text-white shadow-md'
                        : 'text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </span>
                    <span className="text-[10px] opacity-70">({l.script})</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modes Bar */}
      <div className="w-full bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--sub-alt)] rounded-2xl p-2.5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1 bg-[var(--sub-alt)]/40 p-1 rounded-xl">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap ${
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
        <div className="flex items-center gap-2.5">
          {/* Time Options */}
          <div className="flex items-center gap-1 bg-[var(--sub-alt)]/60 p-1 rounded-xl border border-[var(--sub-alt)]">
            <Clock className="w-3.5 h-3.5 text-[var(--main-color)] ml-1.5" />
            {timeOptions.map((tVal) => (
              <button
                key={tVal}
                onClick={() => {
                  setTimeMode(tVal);
                  setWordCountMode(0);
                  onReset();
                }}
                className={`px-2.5 py-1 rounded-lg transition-all font-mono font-bold text-xs ${
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
            <Type className="w-3.5 h-3.5 text-[var(--main-color)] ml-1.5" />
            {wordOptions.map((wVal) => (
              <button
                key={wVal}
                onClick={() => {
                  setWordCountMode(wVal);
                  setTimeMode(0);
                  onReset();
                }}
                className={`px-2.5 py-1 rounded-lg transition-all font-mono font-bold text-xs ${
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
    </div>
  );
};
