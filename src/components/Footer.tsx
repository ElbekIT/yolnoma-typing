import React, { useState } from 'react';
import {
 Keyboard,
 ShieldCheck,
 Info,
 Sparkles,
 Zap,
 Share2,
 Swords,
 GraduationCap,
 Globe,
 Handshake,
 Send,
 ChevronDown,
 ChevronUp,
 Heart,
 Video,
 MessageSquare,
 Languages,
 Disc
} from 'lucide-react';
import { ShareModal } from './share/ShareModal';
import { useI18n } from '../context/I18nContext';

interface FooterProps {
 onOpenAbout: () => void;
 onOpenUpdates?: () => void;
 onOpenOwner?: () => void;
 onOpenAdmin?: () => void;
 onNavigate?: (tab: string) => void;
}

export const Footer = React.memo<FooterProps>(({
 onOpenAbout,
 onOpenUpdates,
 onOpenOwner,
 onNavigate
}) => {
 const { t } = useI18n();
 const [showShareModal, setShowShareModal] = useState(false);
 const [showSeoDetails, setShowSeoDetails] = useState(false);

 const handleNav = (tab: string, e: React.MouseEvent) => {
 e.preventDefault();
 if (onNavigate) onNavigate(tab);
 };

 return (
 <footer className="w-full mt-auto select-none safe-bottom py-6 px-3 sm:px-6">
 <div className="max-w-7xl mx-auto space-y-4">
 {/* Clean Borderless Links Row */}
 <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs font-mono text-[var(--sub-color)]">
 <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"aria-label="Asosiy bo'limlar">
 <a href="/"onClick={(e) => handleNav('typing', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Keyboard className="w-3.5 h-3.5"/>
 <span>{t('navTyping')}</span>
 </a>
 <a href="/battle"onClick={(e) => handleNav('battle', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Swords className="w-3.5 h-3.5"/>
 <span>{t('navBattle')}</span>
 </a>
 <a href="/lessons"onClick={(e) => handleNav('lessons', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <GraduationCap className="w-3.5 h-3.5"/>
 <span>{t('navLessons')}</span>
 </a>
 <a href="/english"onClick={(e) => handleNav('english', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Languages className="w-3.5 h-3.5"/>
 <span>Ingliz Tili</span>
 </a>
 <a href="/baraban"onClick={(e) => handleNav('baraban', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Disc className="w-3.5 h-3.5"/>
 <span>Random Baraban</span>
 </a>
 <a href="/languages"onClick={(e) => handleNav('languages', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Globe className="w-3.5 h-3.5"/>
 <span>{t('statLanguages')}</span>
 </a>
 <a href="/partners"onClick={(e) => handleNav('partners', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Handshake className="w-3.5 h-3.5"/>
 <span>{t('navPartners')}</span>
 </a>
 <a href="/video"onClick={(e) => handleNav('video', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <Video className="w-3.5 h-3.5"/>
 <span>Video</span>
 </a>
 <a href="/reviews"onClick={(e) => handleNav('reviews', e)} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1.5">
 <MessageSquare className="w-3.5 h-3.5"/>
 <span>Fikrlar</span>
 </a>
 <a href="/support"onClick={(e) => handleNav('support', e)} className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
 <Heart className="w-3.5 h-3.5 text-rose-400"/>
 <span>Qo'llab-quvvatlash</span>
 </a>
 </nav>

 <div className="flex items-center gap-2">
 <a
 href="https://t.me/yolnoma_uz1"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-[#229ED9] text-[11px] font-bold transition-colors"
 >
 <Send className="w-3 h-3"/>
 <span>@yolnoma_uz1</span>
 </a>
 <button
 onClick={() => setShowShareModal(true)}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-[11px] font-bold transition-colors cursor-pointer"
 >
 <Share2 className="w-3 h-3"/>
 <span>Ulashish</span>
 </button>
 </div>
 </div>

 {/* Collapsible SEO Info (Borderless) */}
 {showSeoDetails && (
 <div className="p-4 rounded-2xl bg-[var(--card-bg)] text-left text-xs text-[var(--sub-color)] space-y-2">
 <h4 className="font-bold text-[var(--text-color)] text-sm">
 Yolnoma Typing — O'zbekistondagi №1 Tez Yozish va 10 Barmoq Mashqlari Portali
 </h4>
 <p className="leading-relaxed">
 Yolnoma Typing — klaviaturada 10 barmoq bilan tez yozish ko'nikmalarini oshirish, WPM/CPM ko'rsatkichlarini aniqlash va milliy reytingda bellashish platformasi.
 </p>
 </div>
 )}

 {/* Bottom Minimal Bar */}
 <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 text-[11px] font-mono text-[var(--sub-color)]/80">
 <div className="flex flex-wrap items-center justify-center gap-2.5">
 <span className="flex items-center gap-1.5 text-[var(--text-color)] font-bold">
 <Keyboard className="w-3.5 h-3.5 text-[var(--main-color)]"/>
 yolnoma
 </span>
 <span>•</span>
 <span className="flex items-center gap-1">
 <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/>
 rasmiy & himoyalangan
 </span>
 <span>•</span>
 <button
 onClick={() => setShowSeoDetails(!showSeoDetails)}
 className="hover:text-[var(--text-color)] transition-colors inline-flex items-center gap-1 cursor-pointer"
 >
 <span>platforma haqida</span>
 {showSeoDetails ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
 </button>
 </div>

 <div className="flex items-center gap-3.5">
 {onOpenUpdates && (
 <button onClick={onOpenUpdates} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer">
 <Zap className="w-3 h-3 text-amber-400"/>
 <span>v2.7</span>
 </button>
 )}
 {onOpenOwner && (
 <button onClick={onOpenOwner} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer">
 <Sparkles className="w-3 h-3 text-[var(--main-color)]"/>
 <span>muallif</span>
 </button>
 )}
 <button onClick={onOpenAbout} className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer">
 <Info className="w-3 h-3"/>
 <span>qoidalar & faq</span>
 </button>
 </div>
 </div>
 </div>

 <ShareModal
 isOpen={showShareModal}
 onClose={() => setShowShareModal(false)}
 payload={{ source: 'footer' }}
 />
 </footer>
 );
});
