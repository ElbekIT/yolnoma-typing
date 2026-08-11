import React, { useState } from 'react';
import { Clock, Type, Quote, Sliders, Globe, Check, Search, X, Hash, AtSign, Triangle } from 'lucide-react';
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
  const [showCustomInput, setShowCustomInput] = useState(false);

  const timeOptions: TimeMode[] = [15, 30, 60, 120];
  const wordOptions: WordCountMode[] = [10, 25, 50, 100];

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  const filteredLanguages = languagesList.filter(
    (l) =>
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTimeModeActive = timeMode > 0;
  const isWordModeActive = wordCountMode > 0;

  return (
    <>
      <div
        className={`w-full max-w-4xl mx-auto mb-6 flex flex-col items-center gap-3 transition-all duration-200 transform ${
          isTestActive
            ? 'opacity-0 pointer-events-none -translate-y-4 scale-95 h-0 overflow-hidden mb-0'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Monkeytype Pill Header Bar */}
        <div className="bg-[#2c2e31] text-[#646669] rounded-xl px-4 py-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono select-none shadow-md border border-[#323437]">
          {/* Main Mode Toggles (Left Group) */}
          <div className="flex items-center gap-3">
            {/* Punctuation */}
            <button
              onClick={() => {
                if (mode === 'sentences') {
                  setMode('words');
                } else {
                  setMode('sentences');
                }
                onReset();
              }}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                mode === 'sentences' ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'
              }`}
            >
              <AtSign className="w-3.5 h-3.5" />
              <span>punctuation</span>
            </button>

            {/* Numbers */}
            <button
              onClick={() => {
                if (mode === 'numbers') {
                  setMode('words');
                } else {
                  setMode('numbers');
                }
                onReset();
              }}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                mode === 'numbers' ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>numbers</span>
            </button>

            {/* Divider */}
            <div className="w-[2px] h-3.5 bg-[#323437]" />

            {/* Time Mode */}
            <button
              onClick={() => {
                setMode('words');
                setWordCountMode(0);
                if (timeMode === 0) setTimeMode(30);
                onReset();
              }}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                isTimeModeActive && mode !== 'quotes' && mode !== 'custom'
                  ? 'text-[#e2b714] font-bold'
                  : 'hover:text-[#d1d0c5]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>time</span>
            </button>

            {/* Words Mode */}
            <button
              onClick={() => {
                setMode('words');
                setTimeMode(0);
                if (wordCountMode === 0) setWordCountMode(25);
                onReset();
              }}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                isWordModeActive && mode !== 'quotes' && mode !== 'custom'
                  ? 'text-[#e2b714] font-bold'
                  : 'hover:text-[#d1d0c5]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>words</span>
            </button>

            {/* Quotes Mode */}
            <button
              onClick={() => {
                setMode('quotes');
                setTimeMode(0);
                setWordCountMode(0);
                onReset();
              }}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                mode === 'quotes' ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>quote</span>
            </button>

            {/* Custom Text Mode */}
            <button
              onClick={() => {
                setMode('custom');
                setShowCustomInput(!showCustomInput);
                onReset();
              }}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${
                mode === 'custom' ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>custom</span>
            </button>
          </div>

          {/* Sub Option Values (Right Group) */}
          {mode !== 'quotes' && mode !== 'custom' && (
            <>
              {/* Divider */}
              <div className="w-[2px] h-3.5 bg-[#323437]" />

              <div className="flex items-center gap-2.5">
                {isTimeModeActive &&
                  timeOptions.map((tVal) => (
                    <button
                      key={tVal}
                      onClick={() => {
                        setTimeMode(tVal);
                        setWordCountMode(0);
                        onReset();
                      }}
                      className={`transition-colors duration-150 font-bold ${
                        timeMode === tVal ? 'text-[#e2b714]' : 'hover:text-[#d1d0c5]'
                      }`}
                    >
                      {tVal}
                    </button>
                  ))}

                {isWordModeActive &&
                  wordOptions.map((wVal) => (
                    <button
                      key={wVal}
                      onClick={() => {
                        setWordCountMode(wVal);
                        setTimeMode(0);
                        onReset();
                      }}
                      className={`transition-colors duration-150 font-bold ${
                        wordCountMode === wVal ? 'text-[#e2b714]' : 'hover:text-[#d1d0c5]'
                      }`}
                    >
                      {wVal}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Custom Text Drawer if Custom Selected */}
        {mode === 'custom' && (
          <div className="w-full max-w-lg bg-[#2c2e31] p-3 rounded-xl border border-[#323437] space-y-2">
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                onReset();
              }}
              placeholder="O'zingizning matningizni bura kiriting..."
              className="w-full bg-[#1e1f23] border border-[#323437] rounded-lg p-2.5 text-xs text-[#d1d0c5] placeholder-[#646669] focus:outline-none focus:border-[#e2b714] font-mono resize-none"
            />
          </div>
        )}

        {/* Language Badge (Centered under header bar like Monkeytype) */}
        <button
          onClick={() => {
            setSearchQuery('');
            setShowLangModal(true);
          }}
          className="flex items-center gap-1.5 text-xs font-mono text-[#646669] hover:text-[#d1d0c5] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#2c2e31]/50 cursor-pointer"
          title="Matn tilini o'zgartirish"
        >
          <Globe className="w-3.5 h-3.5 text-[#e2b714]" />
          <span>{currentLang.nativeName.toLowerCase()}</span>
        </button>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLangModal(false)}
          />

          <div className="relative w-full max-w-md bg-[#2c2e31] border border-[#323437] rounded-2xl shadow-2xl p-5 z-50 text-xs font-mono space-y-4 animate-in zoom-in-95 duration-150 text-[#d1d0c5]">
            <div className="flex items-center justify-between pb-2 border-b border-[#323437]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#e2b714]" />
                <h3 className="font-bold text-sm text-[#d1d0c5]">Select Language</h3>
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="p-1 rounded-lg text-[#646669] hover:text-[#d1d0c5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#646669] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1e1f23] border border-[#323437] text-[#d1d0c5] placeholder-[#646669] focus:outline-none focus:border-[#e2b714] text-xs transition-colors"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-mono ${
                        isSelected
                          ? 'bg-[#e2b714] text-[#2c2e31] font-bold shadow-sm'
                          : 'text-[#d1d0c5] hover:bg-[#323437]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 font-bold" />}
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-[#646669] py-4 text-xs">No language found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

