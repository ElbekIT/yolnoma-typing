import React, { useMemo } from 'react';
import { Clock, Type, Layers, Globe, Sparkles, Film } from 'lucide-react';
import { TextMode, TimeMode, WordCountMode, DifficultyMode } from '../../types';
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
  const { language, modeBarWidth, modeBarScale, tapeMode, setTapeMode } = useSettings();

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
  }, []);

  const currentLang = useMemo(
    () => languagesList.find((l) => l.code.toLowerCase() === language.toLowerCase()) || languagesList[0],
    [languagesList, language]
  );

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
              if (onOpenLanguagePage) {
                onOpenLanguagePage();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer font-mono opacity-85 hover:opacity-100 py-0.5 px-2.5 rounded-lg hover:bg-[var(--sub-alt)]/40 border border-transparent hover:border-[var(--sub-alt)]"
            title="125+ Jahon Tillari katalogiga o'tish"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span className="font-semibold">{currentLang.flag} {currentLang.nativeName}</span>
          </button>

          <span className="text-[var(--sub-color)] opacity-30 text-xs select-none">•</span>

          <button
            onClick={() => {
              const nextMode = tapeMode === 'off' ? 'letter' : tapeMode === 'letter' ? 'word' : 'off';
              setTapeMode(nextMode);
              onReset();
            }}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer font-mono py-0.5 px-2 rounded-lg hover:bg-[var(--sub-alt)]/40 ${
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
  );
};
