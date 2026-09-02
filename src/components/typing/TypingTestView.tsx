import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Clock,
  FileText,
  Quote as QuoteIcon,
  Sparkles,
  Hash,
  AtSign,
  Volume2,
  VolumeX,
  Keyboard as KeyboardIcon,
  Globe,
  Sliders,
  Play
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { TypingStats, TypingMode } from '../../types';
import { generateWords, generateQuote } from '../../utils/typingEngine';
import { soundEngine } from '../../utils/audio';
import { antiCheatManager } from '../../utils/antiCheat';
import { VirtualKeyboard } from '../VirtualKeyboard';
import { ResultView } from './ResultView';
import { DinoGameView } from '../dino/DinoGameView';
import { supportedLanguages } from '../../config/languages';
import confetti from 'canvas-confetti';

export const TypingTestView: React.FC = () => {
  const {
    themeConfig,
    language,
    setLanguage,
    typingMode,
    setTypingMode,
    timeMode,
    setTimeMode,
    wordCountMode,
    setWordCountMode,
    includePunctuation,
    setIncludePunctuation,
    includeNumbers,
    setIncludeNumbers,
    fontSize,
    fontFamily,
    soundTheme,
    soundVolume,
    showLiveWpm,
    showLiveAccuracy,
    showKeyboard,
    quickRestart
  } = useSettings();

  const { saveTypingResult } = useAuth();

  const [words, setWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(timeMode);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [historyPoints, setHistoryPoints] = useState<{ second: number; wpm: number; rawWpm: number; errors: number }[]>([]);
  const [showDino, setShowDino] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeChar = words[currentWordIndex]?.[currentInput.length] || ' ';

  const initTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    let newWords: string[] = [];
    if (typingMode === 'quote') {
      newWords = generateQuote(language);
    } else if (typingMode === 'words') {
      newWords = generateWords(wordCountMode, language, includePunctuation, includeNumbers);
    } else {
      newWords = generateWords(100, language, includePunctuation, includeNumbers);
    }

    setWords(newWords);
    setCurrentInput('');
    setCurrentWordIndex(0);
    setTypedHistory([]);
    setIsTestActive(false);
    setIsCompleted(false);
    setTimeLeft(timeMode);
    setTimeElapsed(0);
    setStats(null);
    setHistoryPoints([]);

    antiCheatManager.reset();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [typingMode, timeMode, wordCountMode, language, includePunctuation, includeNumbers]);

  useEffect(() => {
    initTest();
  }, [initTest]);

  // Calculate live stats
  const calculateStats = useCallback(() => {
    let totalTypedChars = 0;
    let correctChars = 0;
    let incorrectChars = 0;

    typedHistory.forEach((typedWord, idx) => {
      const targetWord = words[idx] || '';
      totalTypedChars += typedWord.length + 1; // +1 space
      for (let i = 0; i < typedWord.length; i++) {
        if (typedWord[i] === targetWord[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }
      if (typedWord === targetWord) {
        correctChars++; // space bonus
      } else {
        incorrectChars++;
      }
    });

    // Current word
    const targetWord = words[currentWordIndex] || '';
    totalTypedChars += currentInput.length;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === targetWord[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const minutes = Math.max(timeElapsed / 60, 0.016);
    const wpm = Math.max(0, Math.round(correctChars / 5 / minutes));
    const rawWpm = Math.max(0, Math.round(totalTypedChars / 5 / minutes));
    const accuracy =
      totalTypedChars > 0
        ? Math.max(0, Math.min(100, Math.round((correctChars / totalTypedChars) * 100)))
        : 100;

    return {
      wpm,
      rawWpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars: totalTypedChars,
      timeElapsed,
      history: historyPoints
    };
  }, [typedHistory, words, currentWordIndex, currentInput, timeElapsed, historyPoints]);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);
    setIsCompleted(true);

    const finalStats = calculateStats();
    setStats(finalStats);

    // Save result to Firebase & update profile
    saveTypingResult({
      wpm: finalStats.wpm,
      rawWpm: finalStats.rawWpm,
      accuracy: finalStats.accuracy,
      testTimeSeconds: timeElapsed || timeMode,
      mode: typingMode,
      timeMode: typingMode === 'time' ? timeMode : undefined,
      wordCountMode: typingMode === 'words' ? wordCountMode : undefined,
      language,
      correctChars: finalStats.correctChars,
      incorrectChars: finalStats.incorrectChars,
      timestamp: Date.now()
    });

    // Fire confetti for good runs
    if (finalStats.wpm >= 60 && finalStats.accuracy >= 90) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [calculateStats, saveTypingResult, timeElapsed, timeMode, typingMode, wordCountMode, language]);

  // Timer Tick
  useEffect(() => {
    if (isTestActive && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const nextSec = prev + 1;

          // Record history point
          const currentSnap = calculateStats();
          setHistoryPoints((hp) => [
            ...hp,
            {
              second: nextSec,
              wpm: currentSnap.wpm,
              rawWpm: currentSnap.rawWpm,
              errors: currentSnap.incorrectChars
            }
          ]);

          return nextSec;
        });

        if (typingMode === 'time') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              finishTest();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, isCompleted, typingMode, finishTest, calculateStats]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isTestActive && !isCompleted) {
      setIsTestActive(true);
    }

    // Play switch sound
    soundEngine.playKeySound(soundTheme, soundVolume);

    // If space pressed, move to next word
    if (value.endsWith(' ')) {
      const trimmed = value.trim();
      const newHistory = [...typedHistory, trimmed];
      setTypedHistory(newHistory);
      setCurrentInput('');
      const nextWordIdx = currentWordIndex + 1;
      setCurrentWordIndex(nextWordIdx);

      // Check end of words
      if (nextWordIdx >= words.length) {
        finishTest();
      }
      return;
    }

    setCurrentInput(value);
  };

  // Keyboard Navigation & Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (quickRestart && e.key === 'Tab') {
      e.preventDefault();
      initTest();
    }
  };

  if (showDino) {
    return <DinoGameView onBackToTyping={() => setShowDino(false)} />;
  }

  if (isCompleted && stats) {
    return <ResultView stats={stats} onRestart={initTest} language={language} />;
  }

  const liveStats = calculateStats();
  const langConfig = supportedLanguages.find((l) => l.code === language);
  const isRtl = langConfig?.dir === 'rtl';

  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Configuration HUD Bar */}
      <div className="w-full max-w-3xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] p-2 sm:p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-sm text-xs font-semibold select-none">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[var(--sub-alt)]/50 p-1 rounded-xl">
          <button
            onClick={() => {
              setTypingMode('time');
              initTest();
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              typingMode === 'time'
                ? 'bg-[var(--main-color)] text-white shadow-sm font-bold'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>
          <button
            onClick={() => {
              setTypingMode('words');
              initTest();
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              typingMode === 'words'
                ? 'bg-[var(--main-color)] text-white shadow-sm font-bold'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>
          <button
            onClick={() => {
              setTypingMode('quote');
              initTest();
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              typingMode === 'quote'
                ? 'bg-[var(--main-color)] text-white shadow-sm font-bold'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <QuoteIcon className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>
          <button
            onClick={() => setShowDino(true)}
            className="px-3 py-1.5 rounded-lg flex items-center gap-1 text-[var(--sub-color)] hover:text-amber-400 transition-all cursor-pointer font-bold"
          >
            <span>🦖 Dino</span>
          </button>
        </div>

        {/* Sub-mode Options */}
        {typingMode === 'time' && (
          <div className="flex items-center gap-1 bg-[var(--sub-alt)]/50 p-1 rounded-xl font-mono">
            {[15, 30, 60, 120].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeMode(t as any);
                  initTest();
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeMode === t
                    ? 'text-[var(--main-color)] font-black scale-105'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {typingMode === 'words' && (
          <div className="flex items-center gap-1 bg-[var(--sub-alt)]/50 p-1 rounded-xl font-mono">
            {[10, 25, 50, 100].map((w) => (
              <button
                key={w}
                onClick={() => {
                  setWordCountMode(w as any);
                  initTest();
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  wordCountMode === w
                    ? 'text-[var(--main-color)] font-black scale-105'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {/* Language Selection */}
        <div className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-[var(--sub-color)]" />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              initTest();
            }}
            className="bg-[var(--sub-alt)] text-[var(--text-color)] border border-[var(--sub-alt)] rounded-xl py-1 px-2.5 text-xs outline-none cursor-pointer font-medium"
          >
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live HUD Indicator (Timer / WPM / Accuracy) */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4 text-sm font-mono font-bold select-none min-h-[32px]">
        <div className="flex items-center gap-4">
          <div className="text-2xl sm:text-3xl text-[var(--main-color)] font-black">
            {typingMode === 'time' ? timeLeft : `${currentWordIndex} / ${words.length}`}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-[var(--sub-color)]">
          {showLiveWpm && isTestActive && (
            <div className="flex items-center gap-1">
              <span>WPM:</span>
              <span className="text-[var(--text-color)] font-mono">{liveStats.wpm}</span>
            </div>
          )}
          {showLiveAccuracy && isTestActive && (
            <div className="flex items-center gap-1">
              <span>ACC:</span>
              <span className="text-emerald-500 font-mono">{liveStats.accuracy}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Word Box */}
      <div
        className="w-full max-w-4xl min-h-[160px] p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)]/40 border border-[var(--sub-alt)]/60 relative cursor-text select-none shadow-sm flex flex-wrap gap-x-2.5 gap-y-3 leading-relaxed transition-all"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily === 'mono' ? 'JetBrains Mono, monospace' : fontFamily === 'serif' ? 'Georgia, serif' : 'inherit',
          direction: isRtl ? 'rtl' : 'ltr'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute inset-0 cursor-default pointer-events-auto"
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
        />

        {words.map((word, wordIdx) => {
          const isPassed = wordIdx < currentWordIndex;
          const isCurrent = wordIdx === currentWordIndex;
          const userTypedWord = typedHistory[wordIdx] || '';

          if (isPassed) {
            const isFullyCorrect = userTypedWord === word;
            return (
              <span
                key={wordIdx}
                className={`transition-colors ${
                  isFullyCorrect ? 'text-[var(--text-color)] opacity-90' : 'text-rose-500 underline decoration-rose-500/50'
                }`}
              >
                {userTypedWord || word}
              </span>
            );
          }

          if (isCurrent) {
            return (
              <span key={wordIdx} className="relative inline-flex">
                {word.split('').map((char, charIdx) => {
                  const typedChar = currentInput[charIdx];
                  let charClass = 'text-[var(--sub-color)] opacity-50';
                  if (typedChar !== undefined) {
                    charClass = typedChar === char ? 'text-[var(--text-color)]' : 'text-rose-500 bg-rose-500/20 rounded';
                  }

                  const isCaretHere = charIdx === currentInput.length;

                  return (
                    <span key={charIdx} className={`relative ${charClass}`}>
                      {isCaretHere && (
                        <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-[var(--main-color)] animate-pulse shadow-[0_0_8px_var(--main-color)]" />
                      )}
                      {char}
                    </span>
                  );
                })}
                {/* Extra typed characters */}
                {currentInput.length > word.length &&
                  currentInput.slice(word.length).split('').map((extraChar, extraIdx) => (
                    <span key={extraIdx} className="text-rose-400 bg-rose-500/20 rounded">
                      {extraChar}
                    </span>
                  ))}
                {currentInput.length >= word.length && (
                  <span className="w-[2px] bg-[var(--main-color)] animate-pulse inline-block h-full align-middle ml-0.5" />
                )}
              </span>
            );
          }

          // Future words
          return (
            <span key={wordIdx} className="text-[var(--sub-color)] opacity-40">
              {word}
            </span>
          );
        })}
      </div>

      {/* Restart Button & Shortcut Indicator */}
      <div className="flex flex-col items-center justify-center gap-2 select-none pt-2">
        <button
          onClick={initTest}
          className="p-3 rounded-2xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-color)]/20 transition-all hover:rotate-180 duration-300 cursor-pointer shadow-sm"
          title="Restart Test"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <span className="text-[10px] text-[var(--sub-color)] font-mono font-medium">
          Tab + Enter — qayta boshlash
        </span>
      </div>

      {/* On-Screen Virtual Keyboard */}
      {showKeyboard && <VirtualKeyboard activeChar={activeChar} />}
    </div>
  );
};
