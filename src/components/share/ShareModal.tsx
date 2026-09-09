import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Send,
  MessageCircle,
  Twitter,
  Facebook,
  Copy,
  CheckCircle2,
  Sparkles,
  Trophy,
  Flame,
  QrCode,
  Download,
  Smartphone
} from 'lucide-react';
import {
  SharePayload,
  generateShareUrl,
  generateShareMessage,
  shareToTelegram,
  shareToWhatsApp,
  shareToTwitter,
  shareToFacebook,
  copyShareText
} from '../../utils/seo';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload?: SharePayload;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, payload }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const shareUrl = generateShareUrl(payload);
  const shareMessage = generateShareMessage(payload);

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
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("Ilovani o'rnatish uchun brauzer menyusidan 'Bosh ekranga qo'shish' (Add to Home Screen) yoki manzil satridagi 'O'rnatish' tugmasini bosing.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border-2 border-amber-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] flex items-center gap-1.5">
                <span>Do'stlarga Ulashish</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-[var(--sub-color)]">
                Yolnomani do'stlaringizga yuboring va tezlikda bellashing!
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[var(--sub-alt)]/40 to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
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

            <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
              Musobaqa Chaqirig'i
            </div>
          </div>
        )}

        {/* 1-Tap Social Action Buttons */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[var(--sub-color)] block uppercase tracking-wider">
            Ijtimoiy Tarmoqlar Orqali Ulashish
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Telegram (Most popular in UZ) */}
            <button
              onClick={() => shareToTelegram(payload)}
              className="px-4 py-3 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => shareToWhatsApp(payload)}
              className="px-4 py-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={() => shareToTwitter(payload)}
              className="px-4 py-3 rounded-2xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--text-color)] border border-[var(--sub-alt)] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter (X)</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => shareToFacebook(payload)}
              className="px-4 py-3 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* Copy Direct Link Section */}
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
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Telefon yoki kompyuterga o'rnatish</span>
          </div>

          <button
            onClick={handleInstallPwa}
            className="px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-amber-400 font-bold text-xs transition-colors cursor-pointer"
          >
            Ilovani o'rnatish
          </button>
        </div>
      </div>
    </div>
  );
};
