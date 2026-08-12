import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { RefreshCw, Smartphone, MousePointer, Sparkles, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { languagesList } from '../../config/languages';
import { soundSynth } from '../../utils/audio';
import { antiCheatManager } from '../../utils/antiCheat';

interface TypingDisplayProps {
  targetText: string;
  typedInput: string;
  onInputChange: (newInput: string) => void;
  onRestart: () => void;
  isTestFinished: boolean;
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  targetText,
  typedInput,
  onInputChange,
  onRestart,
  isTestFinished
}) => {
  const { language, caretStyle, smoothCaret, soundProfile, fontFamily, fontSize } = useSettings();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [mouseHidden, setMouseHidden] = useState(false);
  const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const langInfo = languagesList.find((l) => l.code === language) || languagesList[0];
  const isRtl = langInfo.dir === 'rtl';

  // Initialize global anti-cheat listeners with user ID
  useEffect(() => {
    antiCheatManager.init((reason) => {
      // Instantly trigger device & user ban
      antiCheatManager.banDeviceAndUser(reason);
      window.location.reload();
    }, user?.uid);
  }, [user]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [targetText]);

  // Hide mouse cursor during active typing (Monkeytype style)
  useEffect(() => {
    if (typedInput.length > 0 && !isTestFinished) {
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      mouseTimerRef.current = setTimeout(() => {
        setMouseHidden(true);
      }, 1200);
    } else {
      setMouseHidden(false);
    }

    return () => {
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    };
  }, [typedInput, isTestFinished]);

  const handleMouseMove = () => {
    if (mouseHidden) {
      setMouseHidden(false);
    }
    if (typedInput.length > 0 && !isTestFinished) {
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      mouseTimerRef.current = setTimeout(() => {
        setMouseHidden(true);
      }, 1200);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      return;
    }

    if (e.key === 'Escape') {
      if (inputRef.current) inputRef.current.blur();
      setIsFocused(false);
      return;
    }

    // Anti-cheat keystroke check
    const isValid = antiCheatManager.registerKeystroke(e, typedInput.length);
    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Play sound asynchronously
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
      const charAtPress = typedInput.length;
      setTimeout(() => {
        if (e.key !== 'Backspace' && charAtPress < targetText.length) {
          const targetChar = targetText[charAtPress];
          if (e.key === targetChar) {
            soundSynth.playKeyPress(soundProfile);
          } else {
            soundSynth.playErrorSound();
          }
        } else {
          soundSynth.playKeyPress(soundProfile);
        }
      }, 0);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isTestFinished) return;
      const newValue = e.target.value;

      // Anti-Cheat: Detect multi-character sudden injection (Paste or Auto-Typer bot)
      if (newValue.length - typedInput.length > 3) {
        antiCheatManager.banDeviceAndUser('Ketma-ket ko\'p harflar kiritish (Auto-Typer Bot / Paste) aniqlandi va kirish bloklandi!');
        window.location.reload();
        return;
      }

      onInputChange(newValue);
    },
    [isTestFinished, typedInput.length, onInputChange]
  );

  // Group text into whole words so words NEVER break mid-word across lines
  const parsedWords = useMemo(() => {
    if (!targetText) return [];
    const wordsList = targetText.split(' ');
    let charOffset = 0;

    return wordsList.map((wordStr, wordIdx) => {
      const startIndex = charOffset;
      const chars = wordStr.split('').map((char, charInWordIdx) => ({
        char,
        globalIndex: startIndex + charInWordIdx
      }));

      const hasTrailingSpace = wordIdx < wordsList.length - 1;
      const spaceGlobalIndex = hasTrailingSpace ? startIndex + wordStr.length : null;
      charOffset += wordStr.length + (hasTrailingSpace ? 1 : 0);

      return {
        wordIdx,
        chars,
        spaceGlobalIndex
      };
    });
  }, [targetText]);

  const typedChars = typedInput.split('');
  const currentTypedLen = typedInput.length;

  // Active word index calculation
  const activeWordIdx = useMemo(() => {
    for (let i = 0; i < parsedWords.length; i++) {
      const wordObj = parsedWords[i];
      const wordEndIndex =
        wordObj.spaceGlobalIndex !== null
          ? wordObj.spaceGlobalIndex
          : wordObj.chars[wordObj.chars.length - 1]?.globalIndex ?? 0;
      if (currentTypedLen <= wordEndIndex) {
        return i;
      }
    }
    return Math.max(0, parsedWords.length - 1);
  }, [parsedWords, currentTypedLen]);

  // Windowed word rendering for ultra-fast performance
  const visibleWords = useMemo(() => {
    const start = Math.max(0, activeWordIdx - 20);
    const end = Math.min(parsedWords.length, activeWordIdx + 50);
    return parsedWords.slice(start, end);
  }, [parsedWords, activeWordIdx]);

  // Reset scroll on test restart or text change
  useEffect(() => {
    if (currentTypedLen === 0) {
      setScrollOffset(0);
    }
  }, [currentTypedLen, targetText]);

  // Handle smooth 3-line scrolling
  useLayoutEffect(() => {
    const activeEl = wordRefs.current[activeWordIdx];
    const firstEl = wordRefs.current[0];
    if (activeEl && firstEl) {
      const lineDifference = activeEl.offsetTop - firstEl.offsetTop;
      if (lineDifference !== scrollOffset) {
        setScrollOffset(lineDifference);
      }
    }
  }, [activeWordIdx, parsedWords.length]);

  const calculatedFontSize = Math.max(18, fontSize);
  const containerHeight = Math.round(calculatedFontSize * 1.65 * 3); // 3 lines height

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onTouchStart={handleContainerClick}
      onMouseMove={handleMouseMove}
      className={`relative w-full max-w-5xl mx-auto my-2 sm:my-4 bg-transparent border-0 rounded-2xl p-3 sm:p-6 select-none gpu-accelerated transition-all duration-300 ${
        mouseHidden ? 'cursor-none' : 'cursor-text'
      }`}
      style={{
        fontFamily: fontFamily || `'Roboto Mono', 'JetBrains Mono', monospace`,
        fontSize: `${calculatedFontSize}px`,
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      {/* Hidden input element optimized for Mobile iOS & Android soft keyboard */}
      <input
        ref={inputRef}
        type="text"
        value={typedInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        disabled={isTestFinished}
        className="absolute opacity-0 w-full h-full inset-0 z-10 cursor-default focus:outline-none"
      />

      {/* Unfocused overlay with mouse click focus hint */}
      {!isFocused && !isTestFinished && (
        <div className="absolute inset-0 bg-[var(--bg-color)]/85 backdrop-blur-[4px] rounded-2xl z-20 flex flex-col items-center justify-center text-xs sm:text-sm font-bold text-[var(--main-color)] gap-2 border border-[var(--sub-alt)] cursor-pointer p-4 text-center animate-in fade-in duration-200">
          <div className="flex items-center gap-2 bg-[var(--main-color)]/10 px-5 py-2.5 rounded-full border border-[var(--main-color)]/20 shadow-lg group hover:bg-[var(--main-color)]/20 transition-all">
            <MousePointer className="w-4 h-4 text-[var(--main-color)] animate-bounce" />
            <Smartphone className="w-4 h-4 sm:hidden animate-bounce" />
            <span>Sichqoncha yoki ekranga bosing (yozish uchun)</span>
          </div>
        </div>
      )}

      {/* 3-Line Scroll Viewport with smooth text fade on text key change */}
      <div
        key={targetText.slice(0, 15)}
        className="relative w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ height: `${containerHeight}px` }}
      >
        <div
          className="flex flex-wrap leading-relaxed tracking-normal text-left relative transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(-${scrollOffset}px)`,
            direction: isRtl ? 'rtl' : 'ltr'
          }}
        >
          {visibleWords.map((wordObj) => {
            const idx = wordObj.wordIdx;
            return (
              <div
                key={wordObj.wordIdx}
                ref={(el) => {
                  wordRefs.current[idx] = el;
                }}
                className="inline-block whitespace-nowrap my-1 mr-[0.45em]"
              >
                {/* Word Characters */}
                {wordObj.chars.map(({ char, globalIndex }) => {
                  const typedChar = typedChars[globalIndex];
                  const isCurrent = globalIndex === currentTypedLen;
                  const isTyped = typedChar !== undefined;
                  const isCorrect = isTyped && typedChar === char;

                  let charClass = 'relative inline-block transition-colors duration-75 ';

                  if (!isTyped) {
                    charClass += 'text-[var(--sub-color)] opacity-70 ';
                  } else if (isCorrect) {
                    charClass += 'text-[var(--text-color)] font-bold ';
                  } else {
                    charClass += 'text-red-400 bg-red-500/20 rounded-[2px] font-bold ';
                  }

                  // Caret style
                  let caretElement = null;
                  if (isCurrent && isFocused && !isTestFinished) {
                    if (caretStyle === 'line' || !caretStyle) {
                      caretElement = (
                        <span
                          className={`absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-[var(--main-color)] rounded-full ${
                            smoothCaret ? 'transition-all duration-75' : 'animate-pulse'
                          }`}
                        />
                      );
                    } else if (caretStyle === 'block') {
                      caretElement = (
                        <span className="absolute inset-0 bg-[var(--main-color)]/40 rounded-[2px] animate-pulse" />
                      );
                    } else if (caretStyle === 'underline') {
                      caretElement = (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--main-color)] rounded-full animate-pulse" />
                      );
                    } else if (caretStyle === 'outline') {
                      caretElement = (
                        <span className="absolute inset-0 border-2 border-[var(--main-color)] rounded-[2px] animate-pulse" />
                      );
                    }
                  }

                  return (
                    <span key={globalIndex} className={charClass}>
                      {caretElement}
                      {char}
                    </span>
                  );
                })}

                {/* Trailing Space Character */}
                {wordObj.spaceGlobalIndex !== null && (() => {
                  const spaceIdx = wordObj.spaceGlobalIndex;
                  const typedSpace = typedChars[spaceIdx];
                  const isCurrentSpace = spaceIdx === currentTypedLen;
                  const isTypedSpace = typedSpace !== undefined;
                  const isCorrectSpace = isTypedSpace && typedSpace === ' ';

                  let spaceClass = 'relative inline-block ';
                  if (!isTypedSpace) {
                    spaceClass += 'text-[var(--sub-color)] opacity-50 ';
                  } else if (isCorrectSpace) {
                    spaceClass += 'text-[var(--text-color)] ';
                  } else {
                    spaceClass += 'text-red-400 bg-red-500/30 rounded-[2px] ';
                  }

                  let spaceCaret = null;
                  if (isCurrentSpace && isFocused && !isTestFinished) {
                    spaceCaret = (
                      <span
                        className={`absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-[var(--main-color)] rounded-full ${
                          smoothCaret ? 'transition-all duration-75' : 'animate-pulse'
                        }`}
                      />
                    );
                  }

                  return (
                    <span key={`space-${spaceIdx}`} className={spaceClass}>
                      {spaceCaret}
                      {'\u00A0'}
                    </span>
                  );
                })()}
              </div>
            );
          })}

          {/* Extra characters typed past targetText length */}
          {typedChars.length > targetText.length &&
            typedChars.slice(targetText.length).map((extraChar, extraIdx) => (
              <span
                key={`extra-${extraIdx}`}
                className="text-red-400 bg-red-500/20 font-bold px-0.5 rounded-[2px]"
              >
                {extraChar === ' ' ? '\u00A0' : extraChar}
              </span>
            ))}
        </div>
      </div>

      {/* Quick Mouse & Keyboard Controls Bar */}
      <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
              if (inputRef.current) {
                inputRef.current.focus();
                setIsFocused(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--main-color)] border border-[var(--sub-alt)] transition-all group opacity-85 hover:opacity-100 cursor-pointer shadow-sm active:scale-95 font-semibold text-xs"
            title="Sichqoncha bilan yangilash yoki Tab + Enter"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300 text-[var(--main-color)]" />
            <span>Matnni yangilash</span>
          </button>
        </div>

        {/* Shortcut Footer Hints */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-[var(--sub-color)] text-[11px] font-mono select-none opacity-80">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--sub-color)] text-[10px]">tab</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--sub-color)] text-[10px]">enter</kbd>
            <span className="ml-1">- yangi matn</span>
          </div>
          <span className="hidden sm:inline text-[var(--sub-color)]/40">•</span>
          <div className="flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-[var(--main-color)]" />
            <span>Sichqonchani surish orqali boshqarish</span>
          </div>
        </div>
      </div>
    </div>
  );
};
