import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Send,
  ExternalLink,
  Copy,
  CheckCircle2,
  Sparkles,
  Flame,
  Smartphone,
  Check
} from 'lucide-react';
import {
  SharePayload,
  generateShareUrl,
  generateShareMessage,
  shareToTelegram,
  OFFICIAL_TELEGRAM_CHANNEL,
  OFFICIAL_TELEGRAM_HANDLE,
  openTelegramChannel,
  copyShareText
} from '../../utils/seo';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload?: SharePayload;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, payload }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const shareUrl = generateShareUrl(payload);

  const handleCopy = async () => {
    const success = await copyShareText(payload);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      alert("Ilovani o'rnatish uchun brauzer menyusidan 'Bosh ekranga qo'shish' (Add to Home Screen) yoki manzil satridagi 'O'rnatish' tugmasini bosing.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border-2 border-[#229ED9]/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Subtle Telegram glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#229ED9]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30 shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] flex items-center gap-1.5">
                <span>Telegram & Ulashish</span>
                <Sparkles className="w-4 h-4 text-[#229ED9]" />
              </h3>
              <p className="text-xs text-[var(--sub-color)]">
                Rasmiy kanalimiz va do'stlaringizga natijalarni yuboring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* WPM Highlight if result provided */}
        {payload?.wpm && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#229ED9]/15 via-[var(--sub-alt)]/40 to-amber-500/10 border border-[#229ED9]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center font-black">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#229ED9] tracking-wider">
                  Sizning Ko'rsatkichingiz
                </span>
                <div className="text-xl font-black text-[var(--text-color)] font-mono">
                  {payload.wpm} <span className="text-xs text-[var(--sub-color)]">WPM</span>
                  {payload.accuracy ? (
                    <span className="text-xs text-emerald-400 ml-2 font-sans font-bold">
                      {payload.accuracy}% aniqlik
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#229ED9]/20 text-[#229ED9] font-bold text-xs border border-[#229ED9]/30">
              Musobaqa Chaqirig'i
            </div>
          </div>
        )}

        {/* 1. Official Telegram Channel Card (Primary Action) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#229ED9] block uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Rasmiy Telegram Kanalimiz</span>
          </label>

          <div
            onClick={openTelegramChannel}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#229ED9]/20 to-[#1e88e5]/10 border-2 border-[#229ED9]/40 hover:border-[#229ED9] transition-all cursor-pointer shadow-lg shadow-[#229ED9]/10 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shadow-[#229ED9]/30 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Send className="w-6 h-6 ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-white">Yolnoma Typing</h4>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#229ED9]/30 text-[#38bdf8] text-[10px] font-bold">
                      Rasmiy
                    </span>
                  </div>
                  <p className="text-xs text-[#38bdf8] font-mono font-bold mt-0.5">
                    {OFFICIAL_TELEGRAM_HANDLE}
                  </p>
                  <p className="text-[11px] text-[var(--sub-color)] mt-1">
                    Barcha yangiliklar, turnirlar, yangi tillar va tanlovlar!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#229ED9] text-white text-xs font-bold shadow-md shadow-[#229ED9]/20 group-hover:bg-[#1e88e5] transition-colors flex-shrink-0">
                <span>A'zo Bo'lish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Share to Telegram Friends Button */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--sub-color)] block uppercase tracking-wider">
            Do'stlarga Yuborish
          </label>

          <button
            onClick={() => shareToTelegram(payload)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0284c7] hover:from-[#1e88e5] hover:to-[#0369a1] text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#229ED9]/25 hover:shadow-[#229ED9]/40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram Orqali Do'stlarga Ulashish</span>
          </button>
        </div>

        {/* 3. Telegram Link Preview Mockup (Showing Image Preview Card) */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[var(--sub-color)] block uppercase tracking-wider">
            Telegram'da Qanday Ko'rinadi (Havola Kartochkasi):
          </label>

          <div className="p-3 rounded-2xl bg-[#0b1329] border border-[#229ED9]/30 text-left space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-[#38bdf8]">
              <span className="w-2 h-2 rounded-full bg-[#229ED9] animate-pulse" />
              <span className="font-mono font-bold">https://www.yolnoma.uz/</span>
            </div>

            {/* Telegram-style Quote Card with Blue Left Line */}
            <div className="border-l-4 border-[#229ED9] pl-3 py-1 bg-[#101b38]/60 rounded-r-xl space-y-1.5">
              <div className="text-[10px] uppercase font-extrabold text-[#38bdf8] tracking-wider">
                Yolnoma Typing
              </div>
              <div className="text-xs font-bold text-white">
                Yolnoma Typing - O'zbekiston №1 Tez Yozish Arenasi
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Klaviatura tezligingizni oshiring, 125+ tilda 10 barmoq mashqlarini bajaring va milliy reytingda 1-o'rinni egallang!
              </p>
              <div className="relative rounded-lg overflow-hidden border border-[#229ED9]/30 mt-2 bg-[#0c1427]">
                <img
                  src="/og-banner.jpg"
                  alt="Yolnoma Typing Preview Banner"
                  className="w-full h-28 sm:h-32 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Copy Direct Link Section */}
        <div className="space-y-2 pt-2 border-t border-[var(--sub-alt)]">
          <label className="text-xs font-bold text-[var(--sub-color)] block uppercase tracking-wider">
            Havolani Nusxalash
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-color)] font-mono outline-none select-all"
            />

            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#229ED9] hover:bg-[#1e88e5] text-white shadow-md shadow-[#229ED9]/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Nusxalash</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PWA Mobile App Install Bar */}
        <div className="pt-2 border-t border-[var(--sub-alt)] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--sub-color)]">
            <Smartphone className="w-4 h-4 text-[#229ED9]" />
            <span>Telefon yoki kompyuterga o'rnatish</span>
          </div>

          <button
            onClick={handleInstallPwa}
            className="px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-[#38bdf8] font-bold text-xs transition-colors cursor-pointer"
          >
            Ilovani o'rnatish
          </button>
        </div>
      </div>
    </div>
  );
};

