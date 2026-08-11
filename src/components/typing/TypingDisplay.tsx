import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { languagesList } from '../../config/languages';
import { soundSynth } from '../../utils/audio';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  const langInfo = languagesList.find((l) => l.code === language) || languagesList[0];
  const isRtl = langInfo.dir === 'rtl';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [targetText]);

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
      onInputChange(e.target.value);
    },
    [isTestFinished, onInputChange]
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

  // Windowed word rendering for ultra-fast performance (renders only words in viewport)
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

  // Handle smooth Monkeytype 3-line scrolling
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

  const calculatedFontSize = Math.max(20, fontSize);
  const containerHeight = Math.round(calculatedFontSize * 1.65 * 3); // 3 lines height

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full max-w-5xl mx-auto my-4 bg-transparent border-0 rounded-2xl p-4 sm:p-6 cursor-text select-none"
      style={{
        fontFamily: fontFamily || `'Roboto Mono', 'JetBrains Mono', monospace`,
        fontSize: `${calculatedFontSize}px`,
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      {/* Hidden input element */}
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
        className="absolute opacity-0 pointer-events-none inset-0"
      />

      {/* Focus hint when unfocused */}
      {!isFocused && !isTestFinished && (
        <div className="absolute inset-0 bg-[var(--bg-color)]/95 rounded-2xl z-20 flex items-center justify-center text-sm font-bold text-[var(--main-color)] gap-2 border border-[var(--sub-alt)]">
          <span>Sichqonchani bosing yoki tugmani bosing yozishni boshlash uchun</span>
        </div>
      )}

      {/* Monkeytype 3-Line Scroll Viewport */}
      <div
        className="relative w-full overflow-hidden"
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

                  let charClass = 'relative inline-block ';

                  if (!isTyped) {
                    charClass += 'text-[var(--sub-color)] opacity-40 ';
                  } else if (isCorrect) {
                    charClass += 'text-[var(--text-color)] font-semibold ';
                  } else {
                    charClass += 'text-[#f87171] bg-[#f87171]/20 rounded-[2px] font-bold ';
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
                    spaceClass += 'text-[var(--sub-color)] opacity-20 ';
                  } else if (isCorrectSpace) {
                    spaceClass += 'text-[var(--text-color)] ';
                  } else {
                    spaceClass += 'text-[#f87171] bg-[#f87171]/30 rounded-[2px] ';
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
                className="text-[#f87171] bg-[#f87171]/20 font-bold px-0.5 rounded-[2px]"
              >
                {extraChar === ' ' ? '\u00A0' : extraChar}
              </span>
            ))}
        </div>
      </div>

      {/* Quick Restart Button */}
      <div className="mt-8 flex items-center justify-center">
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
          className="p-3 rounded-xl text-[var(--sub-color)] hover:text-[var(--main-color)] hover:bg-[var(--sub-alt)]/50 transition-all group opacity-60 hover:opacity-100"
          title="Qayta boshlash (Tab + Enter)"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

