import React, { useState } from 'react';
import {
  Keyboard,
  ShieldCheck,
  Info,
  Sparkles,
  Zap,
  Share2,
  Trophy,
  Swords,
  GraduationCap,
  Globe,
  Handshake,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ShareModal } from './share/ShareModal';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenUpdates?: () => void;
  onOpenOwner?: () => void;
  onOpenAdmin?: () => void;
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenUpdates,
  onOpenOwner,
  onOpenAdmin,
  onNavigate
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSeoDetails, setShowSeoDetails] = useState(false);

  const handleNav = (tab: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <footer className="w-full mt-auto select-none safe-bottom border-t border-[var(--sub-alt)]/60 bg-[var(--card-bg)]/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Top SEO Crawlable Navigation Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs font-semibold text-[var(--sub-color)] border-b border-[var(--sub-alt)]/40 pb-4">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Asosiy bo'limlar">
            <a
              href="/"
              onClick={(e) => handleNav('typing', e)}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5"
              title="Klaviaturada tez yozish testi"
            >
              <Keyboard className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>Yozish Testi</span>
            </a>

            <a
              href="/leaderboard"
              onClick={(e) => handleNav('leaderboard', e)}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5"
              title="O'zbekiston milliy reytingi"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Milliy Reyting</span>
            </a>

            <a
              href="/battle"
              onClick={(e) => handleNav('battle', e)}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5"
              title="Speedway 1v1 yozish jangi"
            >
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Speedway Battle</span>
            </a>

            <a
              href="/lessons"
              onClick={(e) => handleNav('lessons', e)}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5"
              title="10 barmoq bilan ko'r-ko'rona yozish saboqlari"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>10 Barmoq Saboqlari</span>
            </a>

            <a
              href="/languages"
              onClick={(e) => handleNav('languages', e)}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5"
              title="125 dan ortiq jahon tillari"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>125+ Jahon Tillari</span>
            </a>

            <a
              href="/partners"
              onClick={(e) => handleNav('partners', e)}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5"
              title="Rasmiy hamkor va homiylar"
            >
              <Handshake className="w-3.5 h-3.5 text-amber-500" />
              <span>Hamkor & Homiy</span>
            </a>
          </nav>

          {/* Quick Viral Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Do'stlarga ulashish"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Do'stlarga Ulashish</span>
          </button>
        </div>

        {/* SEO Collapsible Information & Platform Description */}
        <div className="text-center">
          <button
            onClick={() => setShowSeoDetails(!showSeoDetails)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer py-1"
          >
            <span>Yolnoma Typing Platformasi Haqida & SEO Ma'lumotlari</span>
            {showSeoDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showSeoDetails && (
            <div className="mt-3 p-4 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)] text-left text-xs text-[var(--sub-color)] space-y-3 animate-in fade-in duration-200">
              <h4 className="font-bold text-[var(--text-color)] text-sm">
                Yolnoma Typing — O'zbekistondagi №1 Tez Yozish va 10 Barmoq Mashqlari Portali
              </h4>
              <p className="leading-relaxed">
                Yolnoma Typing — klaviaturada ko'r-ko'rona 10 barmoq bilan tez yozish (touch typing) ko'nikmalarini oshirish, 
                WPM (Words Per Minute — bir daqiqadagi so'zlar soni) va CPM (Characters Per Minute — belgilar soni) ko'rsatkichlarini real-vaqtda aniqlash 
                hamda O'zbekiston milliy reytingida yetakchilik qilish uchun mo'ljallangan zamonaviy onlayn platformadir.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)]">
                  <div className="font-bold text-[var(--text-color)] mb-1">⚡ 125+ Jahon Tillari</div>
                  <div className="text-[11px]">O'zbekcha (Lotin & Kirill), Ruscha, Inglizcha va boshqa 120 dan ortiq tillarda professional yozish mashqlari.</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)]">
                  <div className="font-bold text-[var(--text-color)] mb-1">🏆 Jonli Milliy Reyting</div>
                  <div className="text-[11px]">Barcha natijalar Firebase orqali xavfsiz hisoblanadi va mamlakatning eng tezkor tipistlari ro'yxatida aks etadi.</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)]">
                  <div className="font-bold text-[var(--text-color)] mb-1">🏎️ Speedway Battle Arena</div>
                  <div className="text-[11px]">Do'stlaringiz yoki onlayn raqiblaringiz bilan 1v1 poygada klaviatura tezligingizni sinab ko'ring.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[var(--sub-color)] pt-2 border-t border-[var(--sub-alt)]/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[var(--text-color)] font-bold">
              <Keyboard className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>yolnoma</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>rasmiy & himoyalangan</span>
            </span>
            <span>•</span>
            {onOpenUpdates ? (
              <button
                onClick={onOpenUpdates}
                className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5 cursor-pointer font-bold px-1.5 py-0.5 rounded-md hover:bg-[var(--sub-alt)]"
                title="Sayt yangilanishlari xronologiyasi (Changelog)"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>v2.6</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            ) : (
              <span>v2.6</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {onOpenUpdates && (
              <button
                onClick={onOpenUpdates}
                className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>yangilanishlar</span>
              </button>
            )}

            {onOpenOwner && (
              <button
                onClick={onOpenOwner}
                className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[var(--main-color)]" />
                <span>muallif</span>
              </button>
            )}

            <button
              onClick={onOpenAbout}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>qoidalar & faq</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        payload={{ source: 'footer' }}
      />
    </footer>
  );
};
