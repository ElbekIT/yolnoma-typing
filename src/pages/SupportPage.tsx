import React, { useState } from 'react';
import { Heart, Copy, Check, Sparkles } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const cardNumber = "4073 4200 8456 9577";

  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-8 sm:space-y-12 py-10 sm:py-16 px-4">
      {/* Header Info - Much more compelling copy */}
      <div className="text-center space-y-5">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 bg-rose-500/20 rounded-2xl animate-pulse blur-xl" />
          <div className="relative w-full h-full bg-gradient-to-tr from-rose-500/10 to-amber-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/30 shadow-lg backdrop-blur-sm">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-color)] tracking-tight flex items-center justify-center gap-3">
          Loyihani Qo'llab-Quvvatlang <Sparkles className="w-6 h-6 text-amber-400" />
        </h1>
        
        <p className="text-[var(--sub-color)] font-medium max-w-xl mx-auto leading-relaxed text-sm sm:text-base px-2">
          Yolnoma platformasi barcha uchun <strong className="text-[var(--text-color)]">mutlaqo bepul</strong> va <strong className="text-[var(--text-color)]">reklamasiz</strong> ishlaydi. Agar sayt sizga foyda keltirayotgan bo'lsa va uning kelajakdagi rivojiga o'z hissangizni qo'shishni xohlasangiz, bizni qo'llab-quvvatlang! 
          <br className="hidden sm:block mt-2" />
          <span className="text-emerald-400 font-bold mt-2 inline-block">Sizning har qanday e'tiboringiz biz uchun ulkan motivatsiya! 🚀</span>
        </p>
      </div>

      {/* Premium Bank Card - Wider and properly scaled so text never wraps */}
      <div className="w-full max-w-[420px] p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-[#1a1f2e] border border-[var(--sub-alt)] shadow-2xl relative overflow-hidden group">
        
        {/* Subtle Card Background Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start gap-8">
          
          <div className="flex w-full items-center justify-between">
            {/* Embedded EMV Chip visualization for realistic card look */}
            <div className="w-10 h-8 sm:w-11 sm:h-9 bg-gradient-to-br from-amber-200/80 to-amber-500/60 rounded-md flex flex-col justify-evenly p-1 shadow-inner border border-amber-900/20 opacity-80">
              <div className="w-full h-[1px] bg-amber-900/20" />
              <div className="w-full h-[1px] bg-amber-900/20" />
              <div className="w-full h-[1px] bg-amber-900/20" />
            </div>
            
            <div className="px-2.5 py-1 bg-black/40 rounded-md flex items-center border border-[var(--sub-alt)] backdrop-blur-md shadow-sm">
              <span className="text-[10px] sm:text-xs font-black text-[var(--text-color)] tracking-[0.2em]">UZCARD</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            {/* Force single line with whitespace-nowrap and slightly reduced font size on small screens */}
            <div className="text-[22px] sm:text-[26px] font-mono font-black tracking-widest text-white drop-shadow-md whitespace-nowrap">
              {cardNumber}
            </div>
            
            <button
              type="button"
              onClick={handleCopy}
              className="p-2.5 ml-3 rounded-xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
              title="Karta raqamidan nusxa olish"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex w-full items-center justify-between pt-5 border-t border-[var(--sub-alt)]/60">
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] uppercase font-black text-[var(--sub-color)] tracking-[0.2em] mb-1">Karta Egasi</span>
              <span className="text-sm sm:text-base font-bold text-[var(--text-color)] uppercase tracking-wider drop-shadow-sm">Qoriyev Elbek</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
