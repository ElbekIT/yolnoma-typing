import React from 'react';
import { Palette, Keyboard, ArrowRight, Zap } from 'lucide-react';

interface WelcomeEntrancePortalProps {
  onGoToDesign: () => void;
  onGoToTyping: () => void;
}

export const WelcomeEntrancePortal: React.FC<WelcomeEntrancePortalProps> = ({
  onGoToDesign,
  onGoToTyping
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-2 sm:my-3 px-2 sm:px-4">
      <div className="p-5 sm:p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-center space-y-4">
        <div className="space-y-1.5 max-w-3xl mx-auto">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Rasmiy Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
            Assalomu alaykum!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed">
            Siz bu saytdan xohlasangiz <strong className="text-amber-400 font-bold">dizayn buyurtma bera olasiz</strong>, xohlasangiz <strong className="text-cyan-400 font-bold">typing tezligingizni sinab va mashq qilishingiz</strong> mumkin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 max-w-3xl mx-auto text-left">
          {/* Action 1: Dizayn Buyurtma Qilish */}
          <div
            onClick={onGoToDesign}
            className="p-4 rounded-xl bg-[var(--bg-color)] border border-amber-500/40 hover:border-amber-400 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  Elbek Design
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Dizayn Buyurtma Qilish
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  YouTube, Telegram, Instagram va PUBG Mobile uchun professional dizaynlar.
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--sub-alt)] flex items-center justify-between font-mono text-xs text-amber-400 font-bold">
              <span>Studiyaga Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Action 2: Typing Mashqi */}
          <div
            onClick={onGoToTyping}
            className="p-4 rounded-xl bg-[var(--bg-color)] border border-cyan-500/40 hover:border-cyan-400 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Keyboard className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  WPM Arena
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Typing Tez Yozish Mashqi
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  10 barmoqli ko'r-ko'rona terish trenajyori, jahon tillari va milliy reyting.
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--sub-alt)] flex items-center justify-between font-mono text-xs text-cyan-400 font-bold">
              <span>Mashqni Boshlash</span>
              <Zap className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
