import React, { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const cardNumber = "4073 4200 8456 9577";

  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-10 sm:py-16 px-4">
      {/* Header Info */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-sm">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
          Assalomu Alaykum
        </h1>
        <p className="text-[var(--sub-color)] font-medium max-w-lg mx-auto leading-relaxed text-sm sm:text-base px-2">
          Saytga o'z hissangizni qo'shing, o'z xohishingizga bog'liq.<br className="hidden sm:block" /> Qo'llab-quvvatlaganingiz uchun rahmat!
        </p>
      </div>

      {/* Clean Minimalist Bank Card */}
      <div className="w-full sm:w-96 p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-lg relative overflow-hidden group">
        <div className="relative z-10 flex flex-col items-start gap-8">
          <div className="flex w-full items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase tracking-widest">
              Bank Kartasi
            </span>
            <div className="px-2 py-1 bg-[var(--sub-alt)]/50 rounded flex items-center border border-[var(--sub-alt)]">
              <span className="text-[10px] font-black text-[var(--text-color)] tracking-wider">KARTA</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-[0.1em] sm:tracking-[0.12em] text-[var(--text-color)] drop-shadow-sm">
              {cardNumber}
            </div>
            <button
              onClick={handleCopy}
              className="p-2 ml-2 rounded-xl bg-[var(--sub-alt)]/30 hover:bg-[var(--sub-alt)] border border-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer shrink-0"
              title="Nusxa olish"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex w-full items-center justify-between pt-4 border-t border-[var(--sub-alt)]/80">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black text-[var(--sub-color)] tracking-widest mb-1">Karta Egasi</span>
              <span className="text-sm font-bold text-[var(--text-color)] uppercase tracking-wider">Qoriyev Elbek</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
