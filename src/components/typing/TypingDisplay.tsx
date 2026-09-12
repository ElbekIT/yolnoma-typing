import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect, memo } from 'react';
import { RefreshCw, Smartphone, MousePointer } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { languagesList } from '../../config/languages';
import { soundSynth } from '../../utils/audio';
import { antiCheatManager } from '../../utils/antiCheat';
import { getLockedMinLength, getNextWordStartIndexOnSpace } from '../../utils/typingEngine';

// Memoized Character Component: Only re-renders when its own typed state or caret changes
interface CharItemProps {
  char: string;
  typedChar?: string;
  isCurrent: boolean;
  isFocused: boolean;
  isTestFinished: boolean;
  isTestActive: boolean;
  caretStyle: string;
  smoothCaret: boolean;
  typingAnimation?: string;
  globalIndex: number;
  onRef: (el: HTMLSpanElement | null, idx: number) => void;
}

const CharItem = memo<CharItemProps>(
  ({
    char,
    typedChar,
    isCurrent,
    isFocused,
    isTestFinished,
    isTestActive,
    caretStyle,
    smoothCaret,
    typingAnimation,
    globalIndex,
    onRef
  }) => {
    const isTyped = typedChar !== undefined;
    const isCorrect = isTyped && typedChar === char;

    let charClass = 'relative inline-block font-normal select-none ';

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

    // Hardware accelerated caret element
    let caretElement = null;
    if (isCurrent && isFocused && !isTestFinished) {
      const caretHwStyle: React.CSSProperties = {
        transform: 'translateZ(0)',
        willChange: 'transform, opacity'
      };

      if (caretStyle === 'line' || !caretStyle) {
        caretElement = (
          <span
            style={caretHwStyle}
            className={`absolute -left-[1px] top-0 bottom-0 w-[2.5px] bg-[var(--main-color)] rounded-full ${
              smoothCaret ? 'transition-all duration-75' : isTestActive ? '' : 'animate-pulse'
            }`}
          />
        );
      } else if (caretStyle === 'block') {
        caretElement = (
          <span
            style={caretHwStyle}
            className={`absolute inset-0 bg-[var(--main-color)]/35 rounded-[2px] ${isTestActive ? '' : 'animate-pulse'}`}
          />
        );
      } else if (caretStyle === 'underline') {
        caretElement = (
          <span
            style={caretHwStyle}
            className={`absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--main-color)] rounded-full ${isTestActive ? '' : 'animate-pulse'}`}
          />
        );
      } else if (caretStyle === 'outline') {
        caretElement = (
          <span
            style={caretHwStyle}
            className={`absolute inset-0 border-2 border-[var(--main-color)] rounded-[2px] ${isTestActive ? '' : 'animate-pulse'}`}
          />
        );
      }
    }

    return (
      <span
        ref={(el) => onRef(el, globalIndex)}
        className={charClass}
        style={{ transform: 'translateZ(0)' }}
      >
        {caretElement}
        {char}
      </span>
    );
  },
  (prev, next) => {
    return (
      prev.char === next.char &&
      prev.typedChar === next.typedChar &&
      prev.isCurrent === next.isCurrent &&
      prev.isFocused === next.isFocused &&
      prev.isTestFinished === next.isTestFinished &&
      prev.isTestActive === next.isTestActive &&
      prev.caretStyle === next.caretStyle &&
      prev.smoothCaret === next.smoothCaret &&
      prev.typingAnimation === next.typingAnimation
    );
  }
);

// Memoized Space Component
interface SpaceItemProps {
  spaceIdx: number;
  typedSpace?: string;
  isCurrentSpace: boolean;
  isFocused: boolean;
  isTestFinished: boolean;
  isTestActive: boolean;
  smoothCaret: boolean;
  typingAnimation?: string;
  onRef: (el: HTMLSpanElement | null, idx: number) => void;
}

const SpaceItem = memo<SpaceItemProps>(
  ({
    spaceIdx,
    typedSpace,
    isCurrentSpace,
    isFocused,
    isTestFinished,
    isTestActive,
    smoothCaret,
    typingAnimation,
    onRef
  }) => {
    const isTypedSpace = typedSpace !== undefined;
    const isCorrectSpace = isTypedSpace && typedSpace === ' ';

    let spaceClass = 'relative inline-block font-normal select-none ';
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
          style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
          className={`absolute -left-[1px] top-0 bottom-0 w-[2.5px] bg-[var(--main-color)] rounded-full ${
            smoothCaret ? 'transition-all duration-75' : isTestActive ? '' : 'animate-pulse'
          }`}
        />
      );
    }

    return (
      <span
        ref={(el) => onRef(el, spaceIdx)}
        className={spaceClass}
        style={{ transform: 'translateZ(0)' }}
      >
        {spaceCaret}
        {'\u00A0'}
      </span>
    );
  },
  (prev, next) => {
    return (
      prev.spaceIdx === next.spaceIdx &&
      prev.typedSpace === next.typedSpace &&
      prev.isCurrentSpace === next.isCurrentSpace &&
      prev.isFocused === next.isFocused &&
      prev.isTestFinished === next.isTestFinished &&
      prev.isTestActive === next.isTestActive &&
      prev.smoothCaret === next.smoothCaret &&
      prev.typingAnimation === next.typingAnimation
    );
  }
);

// Memoized Word Component: Isolates updates to only the active word
interface WordItemProps {
  wordObj: {
    wordIdx: number;
    chars: { char: string; globalIndex: number }[];
    spaceGlobalIndex: number | null;
  };
  typedInput: string;
  currentTypedLen: number;
  isFocused: boolean;
  isTestFinished: boolean;
  isTestActive: boolean;
  caretStyle: string;
  smoothCaret: boolean;
  typingAnimation?: string;
  isTape: boolean;
  onWordRef: (el: HTMLDivElement | null, idx: number) => void;
  onCharRef: (el: HTMLSpanElement | null, idx: number) => void;
}

const WordItem = memo<WordItemProps>(
  ({
    wordObj,
    typedInput,
    currentTypedLen,
    isFocused,
    isTestFinished,
    isTestActive,
    caretStyle,
    smoothCaret,
    typingAnimation,
    isTape,
    onWordRef,
    onCharRef
  }) => {
    const idx = wordObj.wordIdx;

    return (
      <div
        ref={(el) => onWordRef(el, idx)}
        className={`inline-block whitespace-nowrap max-w-full ${isTape ? 'mr-0' : 'my-0.5'}`}
        style={{ transform: 'translateZ(0)' }}
      >
        {wordObj.chars.map(({ char, globalIndex }) => {
          const typedChar = typedInput[globalIndex];
          const isCurrent = globalIndex === currentTypedLen;

          return (
            <CharItem
              key={`c-${globalIndex}`}
              char={char}
              typedChar={typedChar}
              isCurrent={isCurrent}
              isFocused={isFocused}
              isTestFinished={isTestFinished}
              isTestActive={isTestActive}
              caretStyle={caretStyle}
              smoothCaret={smoothCaret}
              typingAnimation={typingAnimation}
              globalIndex={globalIndex}
              onRef={onCharRef}
            />
          );
        })}

        {wordObj.spaceGlobalIndex !== null && (
          <SpaceItem
            key={`s-${wordObj.spaceGlobalIndex}`}
            spaceIdx={wordObj.spaceGlobalIndex}
            typedSpace={typedInput[wordObj.spaceGlobalIndex]}
            isCurrentSpace={wordObj.spaceGlobalIndex === currentTypedLen}
            isFocused={isFocused}
            isTestFinished={isTestFinished}
            isTestActive={isTestActive}
            smoothCaret={smoothCaret}
            typingAnimation={typingAnimation}
            onRef={onCharRef}
          />
        )}
      </div>
    );
  },
  (prev, next) => {
    // Only re-render word if typing status within this word changed or focus/finish status changed
    const firstIdx = prev.wordObj.chars[0]?.globalIndex ?? 0;
    const lastIdx =
      prev.wordObj.spaceGlobalIndex !== null
        ? prev.wordObj.spaceGlobalIndex
        : prev.wordObj.chars[prev.wordObj.chars.length - 1]?.globalIndex ?? 0;

    const wasActive = prev.currentTypedLen >= firstIdx && prev.currentTypedLen <= lastIdx;
    const isNowActive = next.currentTypedLen >= firstIdx && next.currentTypedLen <= lastIdx;

    // If it was active or is now active, or if user typed/backspaced across this word
    if (wasActive || isNowActive) return false;

    // Check if typed slice for this word changed
    const prevSlice = prev.typedInput.slice(firstIdx, lastIdx + 1);
    const nextSlice = next.typedInput.slice(firstIdx, lastIdx + 1);
    if (prevSlice !== nextSlice) return false;

    return (
      prev.isFocused === next.isFocused &&
      prev.isTestFinished === next.isTestFinished &&
      prev.isTestActive === next.isTestActive &&
      prev.caretStyle === next.caretStyle &&
      prev.smoothCaret === next.smoothCaret &&
      prev.typingAnimation === next.typingAnimation &&
      prev.isTape === next.isTape
    );
  }
);

interface TypingDisplayProps {
  targetText: string;
  typedInput: string;
  onInputChange: (newInput: string) => void;
  onRestart: () => void;
  isTestFinished: boolean;
  quoteMeta?: { author: string; source?: string };
  codeLang?: string;
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  targetText,
  typedInput,
  onInputChange,
  onRestart,
  isTestFinished,
  quoteMeta,
  codeLang
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
  const isTestActive = typedInput.length > 0 && !isTestFinished;

  // Initialize anti-cheat
  useEffect(() => {
    antiCheatManager.init((reason) => {
      antiCheatManager.banDeviceAndUser(reason);
      window.location.reload();
    }, user?.uid);
  }, [user]);

  // Global shortcut to restart test (Tab key)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
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

  // Hide mouse cursor during active typing
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

  const handleMouseMove = useCallback(() => {
    if (mouseHidden) {
      setMouseHidden(false);
    }
    if (typedInput.length > 0 && !isTestFinished) {
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      mouseTimerRef.current = setTimeout(() => {
        setMouseHidden(true);
      }, 1200);
    }
  }, [mouseHidden, typedInput.length, isTestFinished]);

  const handleContainerClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  }, []);

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

    // Space Key: Pad input to jump directly to start of next word
    if (e.key === ' ') {
      if (e.repeat) {
        e.preventDefault();
        return;
      }

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

    // Audio feedback (Zero latency async)
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

      if (e.nativeEvent && e.nativeEvent.isTrusted === false) {
        antiCheatManager.banDeviceAndUser('Avto-Typer kengaytmasi aniqlandi va bloklandi!');
        window.location.reload();
        return;
      }

      const newValue = e.target.value;

      if (newValue.length - typedInput.length > 10) {
        antiCheatManager.banDeviceAndUser('Avto-Typer Bot yozuvi aniqlandi va bloklandi!');
        window.location.reload();
        return;
      }

      const minLen = getLockedMinLength(targetText, typedInput);
      if (newValue.length < minLen) {
        return;
      }

      onInputChange(newValue);
    },
    [isTestFinished, typedInput, targetText, onInputChange]
  );

  // Group text into whole words
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

  const [measuredLineHeight, setMeasuredLineHeight] = useState<number>(36);

  useLayoutEffect(() => {
    const updateLineHeight = () => {
      const firstEl = wordRefs.current[0];
      if (firstEl) {
        const h = firstEl.offsetHeight;
        if (h > 0) {
          setMeasuredLineHeight(h);
        }
      }
    };

    updateLineHeight();
    const timer = setTimeout(updateLineHeight, 50);
    window.addEventListener('resize', updateLineHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLineHeight);
    };
  }, [fontFamily, fontSize, targetText]);

  // Reset scroll on test restart
  useEffect(() => {
    if (currentTypedLen === 0) {
      setScrollOffset(0);
      setTapeOffset(0);
    }
  }, [currentTypedLen, targetText]);

  // Smooth 3-line vertical scrolling (Monkeytype Standard Mode)
  useLayoutEffect(() => {
    if (tapeMode !== 'off') return;
    const activeEl = wordRefs.current[activeWordIdx];
    const firstEl = wordRefs.current[0];
    if (!activeEl || !firstEl) {
      setScrollOffset(0);
      return;
    }

    const topDiff = activeEl.offsetTop - firstEl.offsetTop;
    const effLineHeight = measuredLineHeight > 0 ? measuredLineHeight : 36;

    if (topDiff < effLineHeight * 0.75) {
      setScrollOffset(0);
    } else if (topDiff < effLineHeight * 1.75) {
      setScrollOffset(0);
    } else {
      const targetOffset = topDiff - effLineHeight;
      setScrollOffset(Math.max(0, targetOffset));
    }
  }, [activeWordIdx, measuredLineHeight, tapeMode, targetText]);

  // Smooth horizontal scrolling for Tape mode
  useLayoutEffect(() => {
    if (tapeMode === 'off') return;
    const vpEl = tapeViewportRef.current;
    if (!vpEl) return;

    const vpWidth = vpEl.clientWidth;
    const anchorX = vpWidth * 0.35;

    if (tapeMode === 'letter') {
      const activeCharEl = charRefs.current[currentTypedLen];
      if (activeCharEl) {
        const charCenter = activeCharEl.offsetLeft + activeCharEl.offsetWidth / 2;
        const targetOffset = charCenter - anchorX;
        setTapeOffset(Math.max(0, targetOffset));
      } else if (currentTypedLen === 0) {
        setTapeOffset(0);
      }
    } else if (tapeMode === 'word') {
      const activeWordEl = wordRefs.current[activeWordIdx];
      if (activeWordEl) {
        const wordCenter = activeWordEl.offsetLeft + activeWordEl.offsetWidth / 2;
        const targetOffset = wordCenter - anchorX;
        setTapeOffset(Math.max(0, targetOffset));
      } else if (activeWordIdx === 0) {
        setTapeOffset(0);
      }
    }
  }, [tapeMode, currentTypedLen, activeWordIdx, targetText]);

  const baseFontSize = Math.max(20, fontSize || 28);
  const lineHeightMultiplier = 1.55;
  const isTape = tapeMode !== 'off';
  const effHeight = measuredLineHeight > 0 ? measuredLineHeight : Math.round(baseFontSize * lineHeightMultiplier);
  const containerHeight = isTape
    ? Math.round(effHeight * 1.35)
    : Math.round(effHeight * 3 + 8);

  const handleWordRef = useCallback((el: HTMLDivElement | null, idx: number) => {
    wordRefs.current[idx] = el;
  }, []);

  const handleCharRef = useCallback((el: HTMLSpanElement | null, idx: number) => {
    charRefs.current[idx] = el;
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onTouchStart={handleContainerClick}
      onMouseMove={handleMouseMove}
      className={`relative w-full max-w-[1220px] xl:max-w-[1300px] mx-auto my-1.5 sm:my-4 bg-transparent border-0 select-none px-2 sm:px-4 md:px-6 touch-manipulation ${
        mouseHidden ? 'cursor-none' : 'cursor-text'
      }`}
      style={{
        fontFamily: fontFamily || `'Roboto Mono', 'JetBrains Mono', 'Fira Code', monospace`,
        fontSize: `clamp(17px, 4.5vw, ${baseFontSize}px)`,
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      {/* Hidden input element */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        enterKeyHint="done"
        value={typedInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        disabled={isTestFinished}
        className="absolute top-0 left-0 w-full h-[80%] opacity-0 z-0 cursor-text focus:outline-none"
      />

      {/* Lightweight Unfocused Overlay (No expensive backdrop-blur) */}
      {!isFocused && !isTestFinished && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (inputRef.current) {
              inputRef.current.focus();
              setIsFocused(true);
            }
          }}
          className="absolute inset-x-0 top-0 h-[80%] bg-[var(--bg-color)]/90 rounded-xl z-20 flex flex-col items-center justify-center text-sm font-medium text-[var(--main-color)] gap-3 border border-[var(--sub-alt)] cursor-pointer p-4 text-center transition-opacity duration-150"
        >
          <div className="flex items-center gap-2.5 bg-[var(--sub-alt)] px-5 py-2.5 rounded-xl border border-[var(--sub-color)]/20 shadow-sm hover:scale-105 transition-transform">
            <MousePointer className="w-4 h-4 text-[var(--main-color)]" />
            <Smartphone className="w-4 h-4 sm:hidden text-[var(--main-color)]" />
            <span className="font-mono text-xs sm:text-sm text-[var(--text-color)] font-medium">
              Yozish uchun bosing yoki klaviaturani bosing
            </span>
          </div>
        </div>
      )}

      {/* Scroll Viewport with Hardware Acceleration */}
      <div
        ref={tapeViewportRef}
        key={`${targetText.slice(0, 15)}-${tapeMode}`}
        className={`relative w-full overflow-hidden ${isTape ? 'flex items-center' : ''}`}
        style={{
          height: `${containerHeight}px`,
          transform: 'translateZ(0)',
          willChange: 'transform',
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
              ? `translateX(-${tapeOffset}px) translateZ(0)`
              : `translateY(-${scrollOffset}px) translateZ(0)`,
            willChange: 'transform',
            transition: smoothCaret
              ? isTape
                ? 'transform 85ms cubic-bezier(0.2, 0, 0, 1)'
                : 'transform 150ms ease-out'
              : 'none',
            lineHeight: lineHeightMultiplier,
            direction: isRtl ? 'rtl' : 'ltr'
          }}
        >
          {parsedWords.map((wordObj) => (
            <WordItem
              key={`w-${wordObj.wordIdx}`}
              wordObj={wordObj}
              typedInput={typedInput}
              currentTypedLen={currentTypedLen}
              isFocused={isFocused}
              isTestFinished={isTestFinished}
              isTestActive={isTestActive}
              caretStyle={caretStyle}
              smoothCaret={smoothCaret}
              typingAnimation={typingAnimation}
              isTape={isTape}
              onWordRef={handleWordRef}
              onCharRef={handleCharRef}
            />
          ))}

          {/* Extra characters typed past targetText */}
          {typedInput.length > targetText.length &&
            typedInput.slice(targetText.length).split('').map((extraChar, extraIdx) => (
              <span
                key={`extra-${extraIdx}`}
                className="text-[var(--error-color,#ef4444)] border-b-2 border-red-500 font-semibold opacity-90"
              >
                {extraChar === ' ' ? '\u00A0' : extraChar}
              </span>
            ))}
        </div>

        {quoteMeta && (
          <div className="mt-3 text-right text-xs font-mono text-[var(--main-color)] italic select-none opacity-90">
            — {quoteMeta.author}{quoteMeta.source ? `, «${quoteMeta.source}»` : ''}
          </div>
        )}
        {codeLang && (
          <div className="mt-2 flex items-center justify-end">
            <span className="text-[10px] font-mono uppercase bg-[var(--sub-alt)] text-[var(--main-color)] px-2 py-0.5 rounded border border-[var(--main-color)]/30">
              Stack: {codeLang}
            </span>
          </div>
        )}
      </div>

      {/* Quick Restart Button */}
      <div className="mt-6 relative z-30 pointer-events-auto flex flex-col items-center justify-center gap-2.5">
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
          className="group flex items-center justify-center p-3 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/80 transition-all cursor-pointer border border-transparent hover:border-[var(--sub-color)]/25 active:scale-95 shadow-sm"
          title="Qayta boshlash (Tab yoki Tab + Enter)"
          aria-label="Restart Test"
        >
          <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 group-active:rotate-360 text-[var(--sub-color)] group-hover:text-[var(--main-color)]" />
        </button>

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
