import React, { useState } from 'react';
import {
  Heart,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface SupportViewProps {
  onBackToHome?: () => void;
  onStartTyping?: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  onBackToHome,
  onStartTyping
}) => {
  const { uiLanguage } = useI18n();
  const [copied, setCopied] = useState(false);

  const cardNumber = '4073 4200 8456 9577';
  const rawCardNumber = '4073420084569577';
  const cardHolder = 'Qoriyev Elbek';

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(rawCardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = rawCardNumber;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Header / Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-bold transition-colors cursor-pointer border border-[var(--sub-alt)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{uiLanguage === 'ru' ? 'Назад' : uiLanguage === 'en' ? 'Back' : 'Orqaga'}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-extrabold font-mono">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>YOLNOMA LOYIHASINI QO'LLAB-QUVVATLASH</span>
        </div>
      </div>

      {/* Main Pitch Card: Inspiring & Powerful Call-to-Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--card-bg)] to-[var(--sub-alt)]/30 border border-[var(--sub-alt)] p-5 sm:p-8 lg:p-10 shadow-xl space-y-6">
        
        {/* Header Title & Pitch */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20 mb-1">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-color)] tracking-tight">
            Yolnoma Loyihasiga O'z Hisangizni Qo'shing
          </h1>

          <p className="text-sm sm:text-base text-[var(--sub-color)] leading-relaxed font-medium">
            <strong className="text-[var(--text-color)] font-extrabold">Yolnoma</strong> — O'zbekistondagi har bir o'quvchi, talaba va yosh dasturchi uchun <span className="text-emerald-400 font-bold">mutlaqo bepul, reklamasiz va mustaqil</span> ta'lim platformasidir.
          </p>

          <p className="text-xs sm:text-sm text-[var(--text-color)]/90 bg-[var(--sub-alt)]/40 p-3.5 rounded-2xl border border-[var(--sub-alt)] leading-relaxed">
            Loyihaning uzluksiz ishlashi, yuqori tezlikdagi xavfsiz serverlar va yangi imkoniyatlar yaratilishi siz kabi saxovatli yurtdoshlarimizning e'tibori bilan amalga oshadi.
            <span className="block mt-1 font-bold text-rose-400">
              O'z xohishingiz va imkoniyatingizga ko'ra istalgan miqdordagi qo'llab-quvvatlovingiz — platformaning abadiy bepul va reklamasiz qolishiga qo'shilgan bebaho hissadir!
            </span>
          </p>
        </div>

        {/* Banking Card UI (Responsive, Never Overflowing) */}
        <div className="max-w-md w-full mx-auto">
          <div className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-950 text-white p-5 sm:p-7 border border-slate-700/80 shadow-2xl overflow-hidden select-none">
            {/* Subtle card glow & aesthetic lines */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Chip & Network */}
            <div className="relative z-10 flex items-center justify-between mb-5 sm:mb-6">
              <div className="flex items-center gap-2">
                {/* Metallic Gold Chip */}
                <div className="w-10 h-7 sm:w-11 sm:h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-1 flex flex-col justify-between shadow-inner border border-amber-200/50">
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                  <div className="w-full h-0.5 bg-amber-800/40 rounded-full" />
                </div>
                {/* Contactless Wave */}
                <svg className="w-4 h-4 text-slate-400 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                </svg>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase font-mono">
                  UZCARD / HUMO
                </span>
                <div className="text-[9px] text-slate-400 font-mono">SO'M KARTA</div>
              </div>
            </div>

            {/* Middle: Card Number (Guaranteed 100% fully visible on all screen sizes, never truncated) */}
            <div className="relative z-10 my-3 sm:my-4">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">
                <span>Karta Raqami</span>
                <span className="text-[9px] text-amber-400 font-bold">UZCARD / HUMO</span>
              </div>

              {/* 4 distinct digit blocks - perfectly formatted and responsive */}
              <div
                onClick={handleCopyCard}
                className="group relative bg-black/60 hover:bg-black/75 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/80 hover:border-amber-400/60 transition-all cursor-pointer select-all shadow-inner"
                title="Karta raqamini nusxalash uchun bosing"
              >
                <div className="flex items-center justify-between gap-1 xs:gap-2 font-mono font-black text-[15px] xs:text-base sm:text-2xl tracking-normal xs:tracking-wider sm:tracking-widest text-white whitespace-nowrap">
                  <span>4073</span>
                  <span>4200</span>
                  <span>8456</span>
                  <span>9577</span>
                </div>

                {/* Interactive copy helper bar inside card */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80">
                  <span className="text-[9px] text-slate-400 group-hover:text-amber-300 transition-colors">
                    Nusxalash uchun bosing
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 group-hover:text-amber-300">
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Nusxalash</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Cardholder & Expiry */}
            <div className="relative z-10 flex items-end justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block">
                  Karta Egasi
                </span>
                <span className="font-mono font-bold tracking-wider text-slate-150 uppercase text-xs sm:text-sm">
                  {cardHolder}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Tekshirilgan</span>
              </div>
            </div>
          </div>

          {/* Quick Copy Action Pill */}
          <div className="mt-3.5 text-center">
            <button
              onClick={handleCopyCard}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm border ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20'
                  : 'bg-[var(--sub-alt)]/80 hover:bg-rose-500 text-[var(--text-color)] hover:text-white border-[var(--sub-alt)] hover:border-rose-500 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>4073 4200 8456 9577 — Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-400" />
                  <span>Karta raqamini nusxalash (4073 4200 8456 9577)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* How to Send via Payment Apps Guide */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)] max-w-2xl mx-auto space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-color)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Qanday o'tkazish mumkin? (1 daqiqada)</span>
          </h4>

          <ol className="text-xs text-[var(--sub-color)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Yuqoridagi <strong className="text-[var(--text-color)]">Nusxalash</strong> tugmasini bosing (karta raqami nusxalanadi).
            </li>
            <li>
              Istalgan to'lov ilovangizga kiring: <strong className="text-[var(--text-color)]">Payme, Click Up, Uzum Bank</strong> yoki boshqa mobil banking.
            </li>
            <li>
              <strong className="text-[var(--text-color)]">"O'tkazmalar" &rarr; "Kartaga o'tkazish"</strong> bo'limiga raqamni qo'ying va o'zingiz istagan summani yuboring.
            </li>
          </ol>
        </div>

        {/* 3 Pillars of Trust */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)] text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-extrabold text-[var(--text-color)]">100% Reklamasiz</h5>
            <p className="text-[11px] text-[var(--sub-color)]">Foydalanuvchilarni chalg'ituvchi bannerlar va reklamalarsiz toza ta'lim.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)] text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mx-auto mb-1.5">
              <Zap className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-extrabold text-[var(--text-color)]">Tezkor Serverlar</h5>
            <p className="text-[11px] text-[var(--sub-color)]">Kiber-hujumlardan himoyalangan va kechayu-kunduz barqaror ishlaydigan tizim.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)] text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-1.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-extrabold text-[var(--text-color)]">Milliy Loyiha</h5>
            <p className="text-[11px] text-[var(--sub-color)]">O'zbek yoshlarining kompyuter savodxonligi va tez yozish ko'nikmasi uchun.</p>
          </div>
        </div>

        {/* Sincere Gratitude Note */}
        <div className="text-center pt-2 border-t border-[var(--sub-alt)]">
          <p className="text-xs text-[var(--sub-color)] italic">
            "Har bir qo'llab-quvvatlovchi saxovatli yurtdoshimizga chin yurakdan minnatdorchilik bildiramiz! Siz sababli Yolnoma yanada kuchliroq bo'lmoqda."
          </p>
          <p className="text-[11px] font-bold text-[var(--main-color)] mt-1">
            — Qoriyev Elbek va Yolnoma jamoasi
          </p>
        </div>

      </div>

      {/* Return to typing practice */}
      <div className="text-center">
        <button
          onClick={onStartTyping || onBackToHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--main-color)] hover:opacity-95 text-white font-black text-sm shadow-lg shadow-[var(--main-color)]/25 transition-all cursor-pointer"
        >
          <span>Trenajyorda mashq qilish</span>
          <Zap className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
