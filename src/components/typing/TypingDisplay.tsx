import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { RefreshCw, Smartphone, MousePointer, Sparkles, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { languagesList } from '../../config/languages';
import { soundSynth } from '../../utils/audio';
import { antiCheatManager } from '../../utils/antiCheat';
import { getLockedMinLength, getNextWordStartIndexOnSpace } from '../../utils/typingEngine';

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
  const { language, caretStyle, smoothCaret, tapeMode, typingAnimation, soundProfile, fontFamily, fontSize } = useSettings();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tapeViewportRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [tapeOffset, setTapeOffset] = useState(0);
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

  // Global shortcut to restart test (Tab key or Tab + Enter)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Don't trigger if user is inside a modal or typing in an input/textarea outside TypingDisplay
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'TEXTAREA' ||
          (activeEl.tagName === 'INPUT' && activeEl !== inputRef.current))
      ) {
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        onRestart();
        if (inputRef.current) {
          inputRef.current.focus();
          setIsFocused(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [onRestart]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
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

    // Lock completed words: Cannot backspace into previous words once space is typed
    if (e.key === 'Backspace') {
      const minLen = getLockedMinLength(targetText, typedInput);
      if (typedInput.length <= minLen) {
        e.preventDefault();
        return;
      }
    }

    // Space Key: Pad input to jump directly to start of next word (Prevent auto-skip on hold)
    if (e.key === ' ') {
      // 1. Prevent repeat events when holding down space key
      if (e.repeat) {
        e.preventDefault();
        return;
      }

      // 2. Prevent skipping words if nothing in the current word has been typed yet
      if (typedInput.length === 0 || typedInput.endsWith(' ')) {
        e.preventDefault();
        return;
      }

      const targetNextIdx = getNextWordStartIndexOnSpace(targetText, typedInput);
      if (targetNextIdx && typedInput.length < targetNextIdx) {
        e.preventDefault();
        const paddedInput = typedInput.padEnd(targetNextIdx, ' ');
        onInputChange(paddedInput);
        return;
      }
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

      // Anti-Cheat: Detect untrusted synthetic input from extension scripts
      if (e.nativeEvent && e.nativeEvent.isTrusted === false) {
        antiCheatManager.banDeviceAndUser('Avto-Typer (Grom/Google Chrome) kengaytmasi aniqlandi va kirish bloklandi!');
        window.location.reload();
        return;
      }

      const newValue = e.target.value;

      // If text jump is abnormally large (>10 characters at once from injection script)
      if (newValue.length - typedInput.length > 10) {
        antiCheatManager.banDeviceAndUser('Robotik (Auto-Typer Bot) yozuv aniqlandi va kirish bloklandi!');
        window.location.reload();
        return;
      }

      // Word Boundary Lock: Prevent backspacing into completed words
      const minLen = getLockedMinLength(targetText, typedInput);
      if (newValue.length < minLen) {
        return;
      }

      onInputChange(newValue);
    },
    [isTestFinished, typedInput, targetText, onInputChange]
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

  // Windowed word rendering for ultra-fast performance in 3-line mode, or full words in tape mode
  const visibleWords = useMemo(() => {
    if (tapeMode !== 'off') {
      return parsedWords;
    }
    const start = Math.max(0, activeWordIdx - 30);
    const end = Math.min(parsedWords.length, activeWordIdx + 140);
    return parsedWords.slice(start, end);
  }, [parsedWords, activeWordIdx, tapeMode]);

  // Reset scroll on test restart or text change
  useEffect(() => {
    if (currentTypedLen === 0) {
      setScrollOffset(0);
      setTapeOffset(0);
    }
  }, [currentTypedLen, targetText]);

  // Handle smooth 3-line vertical scrolling (Standard mode)
  useLayoutEffect(() => {
    if (tapeMode !== 'off') return;
    const activeEl = wordRefs.current[activeWordIdx];
    const firstEl = wordRefs.current[0];
    if (activeEl && firstEl) {
      const lineDifference = activeEl.offsetTop - firstEl.offsetTop;
      if (lineDifference !== scrollOffset) {
        setScrollOffset(lineDifference);
      }
    }
  }, [activeWordIdx, parsedWords.length, tapeMode]);

  // Handle smooth horizontal scrolling for Tape mode (letter / word)
  useLayoutEffect(() => {
    if (tapeMode === 'off') return;
    const vpEl = tapeViewportRef.current;
    if (!vpEl) return;

    const vpWidth = vpEl.clientWidth;
    const anchorX = vpWidth * 0.35; // Position active focus around 35% across screen (Monkeytype style)

    if (tapeMode === 'letter') {
      // Letter Tape Mode: keep active character anchored in clear viewport zone
      const activeCharEl = charRefs.current[currentTypedLen];
      if (activeCharEl) {
        const charCenter = activeCharEl.offsetLeft + (activeCharEl.offsetWidth / 2);
        const targetOffset = charCenter - anchorX;
        setTapeOffset(Math.max(0, targetOffset));
      } else if (currentTypedLen === 0) {
        setTapeOffset(0);
      }
    } else if (tapeMode === 'word') {
      // Word Tape Mode: keep active word anchored in clear viewport zone
      const activeWordEl = wordRefs.current[activeWordIdx];
      if (activeWordEl) {
        const wordCenter = activeWordEl.offsetLeft + (activeWordEl.offsetWidth / 2);
        const targetOffset = wordCenter - anchorX;
        setTapeOffset(Math.max(0, targetOffset));
      } else if (activeWordIdx === 0) {
        setTapeOffset(0);
      }
    }
  }, [tapeMode, currentTypedLen, activeWordIdx, targetText]);

  const calculatedFontSize = Math.max(22, fontSize || 28);
  const lineHeightMultiplier = 1.55;
  // In Tape Mode: height is 1 single line; in standard mode: 3 lines
  const isTape = tapeMode !== 'off';
  const containerHeight = isTape
    ? Math.round(calculatedFontSize * lineHeightMultiplier * 1.35)
    : Math.round(calculatedFontSize * lineHeightMultiplier * 3);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onTouchStart={handleContainerClick}
      onMouseMove={handleMouseMove}
      className={`relative w-full max-w-[1220px] xl:max-w-[1300px] mx-auto my-3 sm:my-5 bg-transparent border-0 select-none px-2 sm:px-4 md:px-6 ${
        mouseHidden ? 'cursor-none' : 'cursor-text'
      }`}
      style={{
        fontFamily: fontFamily || `'Roboto Mono', 'JetBrains Mono', 'Fira Code', monospace`,
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
        <div
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
              setIsFocused(true);
            }
          }}
          className="absolute inset-0 bg-[var(--bg-color)]/85 backdrop-blur-[1px] rounded-xl z-20 flex flex-col items-center justify-center text-sm font-medium text-[var(--main-color)] gap-3 border border-[var(--sub-alt)] cursor-pointer p-4 text-center transition-opacity duration-150"
        >
          <div className="flex items-center gap-2.5 bg-[var(--sub-alt)] px-5 py-2.5 rounded-xl border border-[var(--sub-color)]/20 shadow-sm hover:scale-105 transition-transform">
            <MousePointer className="w-4 h-4 text-[var(--main-color)]" />
            <Smartphone className="w-4 h-4 sm:hidden text-[var(--main-color)]" />
            <span className="font-mono text-xs sm:text-sm text-[var(--text-color)] font-medium">Yozish uchun bosing yoki tugmani bosing</span>
          </div>
        </div>
      )}

      {/* Scroll Viewport: 3-Line Scroll or Single-Line Tape Conveyor */}
      <div
        ref={tapeViewportRef}
        key={`${targetText.slice(0, 15)}-${tapeMode}`}
        className={`relative w-full overflow-hidden ${isTape ? 'flex items-center' : ''}`}
        style={{
          height: `${containerHeight}px`,
          ...(isTape
            ? {
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)'
              }
            : {})
        }}
      >
        <div
          className={`relative text-left ${
            isTape
              ? 'flex flex-nowrap whitespace-nowrap items-center pl-[28%] sm:pl-[35%]'
              : 'flex flex-wrap'
          }`}
          style={{
            transform: isTape
              ? `translateX(-${tapeOffset}px)`
              : `translateY(-${scrollOffset}px)`,
            transition: smoothCaret
              ? isTape
                ? 'transform 85ms cubic-bezier(0.2, 0, 0, 1)'
                : 'transform 150ms ease-out'
              : 'none',
            lineHeight: lineHeightMultiplier,
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
                className={`inline-block whitespace-nowrap ${isTape ? 'mr-0' : 'my-0.5'}`}
              >
                {/* Word Characters */}
                {wordObj.chars.map(({ char, globalIndex }) => {
                  const typedChar = typedChars[globalIndex];
                  const isCurrent = globalIndex === currentTypedLen;
                  const isTyped = typedChar !== undefined;
                  const isCorrect = isTyped && typedChar === char;

                  let charClass = 'relative inline-block font-normal transition-colors duration-75 ';

                  if (!isTyped) {
                    charClass += 'text-[var(--sub-color)] opacity-85 ';
                  } else if (isCorrect) {
                    charClass += 'text-[var(--text-color)] font-medium ';
                  } else {
                    charClass += 'text-[var(--error-color,#ef4444)] font-semibold bg-[var(--error-color,#ef4444)]/15 border-b-2 border-[var(--error-color,#ef4444)] rounded-xs ';
                  }

                  if (isTyped && typingAnimation && typingAnimation !== 'none') {
                    charClass += `anim-char-${typingAnimation} `;
                  }

                  // Caret style
                  let caretElement = null;
                  if (isCurrent && isFocused && !isTestFinished) {
                    if (caretStyle === 'line' || !caretStyle) {
                      caretElement = (
                        <span
                          className={`absolute -left-[1px] top-0 bottom-0 w-[2.5px] bg-[var(--main-color)] rounded-full ${
                            smoothCaret ? 'transition-all duration-75' : 'animate-pulse'
                          }`}
                        />
                      );
                    } else if (caretStyle === 'block') {
                      caretElement = (
                        <span className="absolute inset-0 bg-[var(--main-color)]/35 rounded-[2px] animate-pulse" />
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
                    <span
                      key={`${globalIndex}-${isTyped ? 't' : 'u'}`}
                      ref={(el) => {
                        charRefs.current[globalIndex] = el;
                      }}
                      className={charClass}
                    >
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

                  let spaceClass = 'relative inline-block font-normal ';
                  if (!isTypedSpace) {
                    spaceClass += 'text-[var(--sub-color)] opacity-70 ';
                  } else if (isCorrectSpace) {
                    spaceClass += 'text-[var(--text-color)] ';
                  } else {
                    spaceClass += 'text-[var(--error-color,#ef4444)] bg-red-500/25 border-b-2 border-[var(--error-color,#ef4444)] rounded-xs ';
                  }

                  if (isTypedSpace && typingAnimation && typingAnimation !== 'none') {
                    spaceClass += `anim-char-${typingAnimation} `;
                  }

                  let spaceCaret = null;
                  if (isCurrentSpace && isFocused && !isTestFinished) {
                    spaceCaret = (
                      <span
                        className={`absolute -left-[1px] top-0 bottom-0 w-[2.5px] bg-[var(--main-color)] rounded-full ${
                          smoothCaret ? 'transition-all duration-75' : 'animate-pulse'
                        }`}
                      />
                    );
                  }

                  return (
                    <span
                      key={`space-${spaceIdx}-${isTypedSpace ? 't' : 'u'}`}
                      ref={(el) => {
                        charRefs.current[spaceIdx] = el;
                      }}
                      className={spaceClass}
                    >
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
                className={`text-[var(--error-color,#ef4444)] border-b-2 border-red-500 font-semibold opacity-90 ${
                  typingAnimation && typingAnimation !== 'none' ? `anim-char-${typingAnimation}` : ''
                }`}
              >
                {extraChar === ' ' ? '\u00A0' : extraChar}
              </span>
            ))}
        </div>
      </div>

      {/* Quick Mouse & Keyboard Controls Bar */}
      <div className="mt-6 flex flex-col items-center justify-center gap-2.5">
        <button
          id="restart-test-button"
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
          className="group p-2.5 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60 transition-all cursor-pointer border border-transparent hover:border-[var(--sub-color)]/20 active:scale-95"
          title="Qayta boshlash (Tab yoki Tab + Enter)"
          aria-label="Restart Test"
        >
          <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 group-active:rotate-360 text-[var(--sub-color)] group-hover:text-[var(--main-color)]" />
        </button>

        {/* Shortcut Footer Hints (Desktop only for keyboard hints) */}
        <div className="hidden sm:flex items-center gap-1.5 text-[var(--sub-color)] text-[11px] font-mono select-none opacity-70">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] text-[10px] border border-[var(--sub-color)]/20">tab</kbd>
          <span className="opacity-60">+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] text-[10px] border border-[var(--sub-color)]/20">enter</kbd>
          <span className="ml-1">- qayta boshlash</span>
        </div>
      </div>
    </div>
  );
};
