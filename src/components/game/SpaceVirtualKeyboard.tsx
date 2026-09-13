import React from 'react';
import { Zap } from 'lucide-react';
import { SpaceLanguage } from '../../data/spaceWords';

interface SpaceVirtualKeyboardProps {
  language: SpaceLanguage;
  nextExpectedChar?: string | null;
  empCharges: number;
  onKeyPress: (char: string) => void;
  onEmpPress: () => void;
}

const LAYOUTS: Record<SpaceLanguage, string[][]> = {
  uz: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', "'"]
  ],
  en: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ],
  ru: [
    ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
    ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
    ['Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю']
  ]
};

export const SpaceVirtualKeyboard: React.FC<SpaceVirtualKeyboardProps> = ({
  language,
  nextExpectedChar,
  empCharges,
  onKeyPress,
  onEmpPress
}) => {
  const rows = LAYOUTS[language] || LAYOUTS.uz;
  const targetChar = nextExpectedChar ? nextExpectedChar.toUpperCase() : null;

  const handleKeyClick = (char: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    onKeyPress(char.toLowerCase());
  };

  const handleEmpClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (empCharges > 0) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([20, 30, 40]);
        } catch {}
      }
      onEmpPress();
    }
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-slate-950/90 border border-cyan-500/40 rounded-2xl shadow-xl shadow-cyan-950/60 backdrop-blur-md select-none touch-manipulation"
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Keyboard Rows */}
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
          {row.map((key) => {
            const isHighlighted = targetChar === key;

            return (
              <button
                key={key}
                type="button"
                onMouseDown={(e) => handleKeyClick(key, e)}
                onTouchStart={(e) => handleKeyClick(key, e)}
                className={`flex-1 max-w-[42px] sm:max-w-[48px] h-10 sm:h-12 rounded-xl font-bold font-mono text-sm sm:text-base flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md select-none ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-emerald-400 to-teal-600 text-slate-950 font-black border-2 border-emerald-300 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400 animate-pulse'
                    : 'bg-slate-900/90 text-slate-100 hover:bg-slate-800 hover:text-cyan-300 border border-slate-700/80 active:bg-cyan-600 active:text-white'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}

      {/* Bottom Bar: EMP Super Bomb Button */}
      <div className="w-full flex items-center justify-center gap-2 pt-1">
        <button
          type="button"
          disabled={empCharges <= 0}
          onMouseDown={handleEmpClick}
          onTouchStart={handleEmpClick}
          className={`w-full max-w-md py-2.5 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs sm:text-sm font-mono tracking-wider transition-all active:scale-95 shadow-lg select-none cursor-pointer ${
            empCharges > 0
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white border border-cyan-300 shadow-cyan-500/30'
              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Zap className={`w-4 h-4 ${empCharges > 0 ? 'text-amber-300 fill-current animate-bounce' : 'text-slate-600'}`} />
          <span>⚡ EMP BOMBA ({empCharges}) ⚡</span>
        </button>
      </div>
    </div>
  );
};
