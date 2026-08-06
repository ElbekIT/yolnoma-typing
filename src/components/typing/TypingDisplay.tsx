import React, { useRef, useEffect, useState } from 'react';
import { MousePointer, RefreshCw } from 'lucide-react';
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

    // Play sound feedback
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
      const currentIndex = typedInput.length;
      if (e.key !== 'Backspace' && currentIndex < targetText.length) {
        const targetChar = targetText[currentIndex];
        if (e.key === targetChar) {
          soundSynth.playKeyPress(soundProfile);
        } else {
          soundSynth.playErrorSound();
        }
      } else {
        soundSynth.playKeyPress(soundProfile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTestFinished) return;
    onInputChange(e.target.value);
  };

  // Render text character by character
  const targetChars = targetText.split('');
  const typedChars = typedInput.split('');

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full max-w-4xl mx-auto my-6 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-6 sm:p-8 min-h-[180px] cursor-text select-none shadow-sm transition-all"
      style={{ fontFamily, fontSize: `${fontSize}px`, direction: isRtl ? 'rtl' : 'ltr' }}
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

      {/* Focus Overlay warning if unfocused */}
      {!isFocused && !isTestFinished && (
        <div className="absolute inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center text-xs font-semibold text-[var(--main-color)] gap-2">
          <MousePointer className="w-5 h-5 animate-bounce" />
          <span>Click here or press any key to focus & start typing</span>
        </div>
      )}

      {/* Main Text Content */}
      <div className="flex flex-wrap leading-relaxed tracking-wide text-left relative break-words" dir={isRtl ? 'rtl' : 'ltr'}>
        {targetChars.map((char, index) => {
          const typedChar = typedChars[index];
          const isCurrent = index === typedChars.length;
          const isTyped = typedChar !== undefined;
          const isCorrect = isTyped && typedChar === char;

          let charClass = 'transition-colors duration-100 relative ';

          if (!isTyped) {
            charClass += 'text-[var(--sub-color)] opacity-60 ';
          } else if (isCorrect) {
            charClass += 'text-[var(--correct-color)] font-medium ';
          } else {
            charClass += 'text-[var(--error-color)] bg-[var(--error-color)]/15 rounded-sm font-bold ';
          }

          // Caret style
          let caretElement = null;
          if (isCurrent && isFocused && !isTestFinished) {
            if (caretStyle === 'line') {
              caretElement = (
                <span
                  className={`absolute -left-0.5 top-0 bottom-0 w-[2.5px] bg-[var(--caret-color)] rounded-full ${
                    smoothCaret ? 'transition-all duration-100' : 'animate-pulse'
                  }`}
                />
              );
            } else if (caretStyle === 'block') {
              caretElement = (
                <span className="absolute inset-0 bg-[var(--caret-color)]/40 rounded-sm animate-pulse" />
              );
            } else if (caretStyle === 'underline') {
              caretElement = (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--caret-color)] rounded-full animate-pulse" />
              );
            } else if (caretStyle === 'outline') {
              caretElement = (
                <span className="absolute inset-0 border-2 border-[var(--caret-color)] rounded-sm animate-pulse" />
              );
            }
          }

          return (
            <span key={index} className={charClass}>
              {caretElement}
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}

        {/* Extra characters typed past targetText length */}
        {typedChars.length > targetChars.length &&
          typedChars.slice(targetChars.length).map((extraChar, extraIdx) => (
            <span
              key={`extra-${extraIdx}`}
              className="text-[var(--extra-color)] bg-[var(--extra-color)]/20 font-bold px-0.5 rounded-sm"
            >
              {extraChar === ' ' ? '\u00A0' : extraChar}
            </span>
          ))}
      </div>

      {/* Quick Restart Action Floating Button */}
      <div className="mt-8 flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestart();
          }}
          className="p-3 rounded-2xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--main-color)] hover:bg-[var(--card-bg)] border border-[var(--sub-color)]/20 shadow-sm transition-all group"
          title="Restart Test (Tab + Enter)"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
