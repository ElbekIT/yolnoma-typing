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
  onReset
}) => {
  const { language, setLanguage } = useSettings();

  const timeOptions: TimeMode[] = [15, 30, 60, 120];
  const wordOptions: WordCountMode[] = [10, 25, 50, 100];
  const modesList: { id: TextMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'words', label: 'Words', icon: Type },
    { id: 'quotes', label: 'Quotes', icon: Quote },
    { id: 'code', label: 'Code Syntax', icon: Code },
    { id: 'numbers', label: 'Numbers', icon: Hash },
    { id: 'symbols', label: 'Symbols', icon: Sliders },
    { id: 'custom', label: 'Custom Text', icon: Sparkles },
  ];

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-medium">
      {/* Mode Selector */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--main-color)] text-white font-bold shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-[var(--sub-color)]/20 hidden md:block" />

      {/* Sub-modes: Time or Word Count */}
      <div className="flex items-center gap-3">
        {/* Time Options */}
        <div className="flex items-center gap-1 bg-[var(--sub-alt)] p-1 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-[var(--sub-color)] ml-1.5" />
          {timeOptions.map((tVal) => (
            <button
              key={tVal}
              onClick={() => {
                setTimeMode(tVal);
                setWordCountMode(0);
                onReset();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all font-mono font-bold ${
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
        <div className="flex items-center gap-1 bg-[var(--sub-alt)] p-1 rounded-xl">
          <Type className="w-3.5 h-3.5 text-[var(--sub-color)] ml-1.5" />
          {wordOptions.map((wVal) => (
            <button
              key={wVal}
              onClick={() => {
                setWordCountMode(wVal);
                setTimeMode(0);
                onReset();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all font-mono font-bold ${
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
  );
};
