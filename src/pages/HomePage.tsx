import React from 'react';
import { Heart, ArrowRight, Video, Languages, Sparkles } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { InteractiveModesHub } from '../components/home/InteractiveModesHub';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { MiniLeaderboard } from '../components/home/MiniLeaderboard';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { ThematicTests, ThematicActionType } from '../components/home/ThematicTests';
import { SeoArticleSection } from '../components/seo/SeoArticleSection';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

interface HomePageProps {
  onStartTyping: (mode?: string) => void;
  onGoToBattle: () => void;
  onGoToLessons: () => void;
  onGoToEnglish?: () => void;
  onGoToLeaderboard: () => void;
  onOpenLogin: () => void;
  onGoToSupport?: () => void;
  onGoToVideo?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToEnglish,
  onGoToLeaderboard,
  onOpenLogin,
  onGoToSupport,
  onGoToVideo
}) => {
  const handleThematicAction = (action: ThematicActionType) => {
    if (action === 'battle') {
      onGoToBattle();
    } else if (action === 'english') {
      if (onGoToEnglish) onGoToEnglish();
    } else {
      onStartTyping(action);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4 sm:space-y-6">
      {/* Top Support Banner & Language Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-1 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--sub-color)]">
            <span className="w-2 h-2 rounded-full bg-[var(--main-color)]" />
            <span className="font-bold">Interfeys tili (Language):</span>
          </div>
          <div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Grand English Learning Banner (0 dan IELTS 9 gacha) */}
        {onGoToEnglish && (
          <button
            onClick={onGoToEnglish}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 hover:from-amber-500/25 hover:via-emerald-500/20 hover:to-sky-500/25 border border-amber-500/35 transition-all text-xs font-semibold group cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shrink-0 shadow-sm">
                <Languages className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black text-xs sm:text-sm tracking-tight flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>YANGI: Ingliz Tilini 0 dan IELTS 9 gacha Yozib O'rganish!</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline">
                    7 Bosqich &bull; 35 Dars
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  Alifbodan boshlab hayotiy dialoglar, kundalik iboralar va IELTS Band 9 akademik insho jumlalarigacha klaviaturada terib o'rganing.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--main-color)] text-slate-950 font-black text-xs shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <span>Boshlash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        )}

        {/* Dual Highlight Banners: Support & Video Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Eye-catching Support Banner */}
          <button
            onClick={onGoToSupport}
            className="w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-[var(--main-color)]/10 hover:from-rose-500/20 hover:via-amber-500/20 hover:to-[var(--main-color)]/20 border border-rose-500/25 transition-all text-xs font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/20 text-rose-500 shrink-0">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
              </span>
              <p className="truncate text-left text-[var(--text-color)] font-bold">
                <span className="text-rose-400 font-black">Yolnoma-ni qo'llab-quvvatlash:</span>
                <span className="ml-1.5 text-[var(--sub-color)] hidden sm:inline">Sayt 100% bepul rivojlanishiga hissa qo'shing.</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500 text-white font-extrabold text-[11px] shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <span>Hissa qo'shish</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Sayt Haqida Video Qo'llanma Banner */}
          <button
            onClick={onGoToVideo}
            className="w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-[var(--main-color)]/10 hover:from-amber-500/20 hover:via-cyan-500/20 hover:to-[var(--main-color)]/20 border border-amber-500/25 transition-all text-xs font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Video className="w-3.5 h-3.5" />
              </span>
              <p className="truncate text-left text-[var(--text-color)] font-bold">
                <span className="text-amber-400 font-black">Sayt haqida video:</span>
                <span className="ml-1.5 text-[var(--sub-color)] hidden sm:inline">Ro'yxatdan o'tish va foydalanish qo'llanmasi.</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-[11px] shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <span>Videoni ko'rish</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>

      {/* 1. Grand Hero Section (Panoramic Banner + Characters + Badge Buttons) */}
      <HeroSection
        onStartTyping={() => onStartTyping()}
        onGoToBattle={onGoToBattle}
        onGoToLessons={onGoToLessons}
        onGoToLeaderboard={onGoToLeaderboard}
        onOpenLogin={onOpenLogin}
      />

      {/* 2. Interactive Modes & Mastery Tiers Hub (Instant Play, PvP & WPM Ranks) */}
      <InteractiveModesHub
        onStartMode={(mode) => onStartTyping(mode)}
        onGoToBattle={onGoToBattle}
        onGoToLessons={onGoToLessons}
        onGoToLeaderboard={onGoToLeaderboard}
      />

      {/* 3. Top 5 Milliy Reyting / Mini Leaderboard Showcase */}
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
        <MiniLeaderboard
          onViewFullLeaderboard={onGoToLeaderboard}
          onOpenLogin={onOpenLogin}
        />
      </div>

      {/* 4. Features / Imkoniyatlar Block */}
      <FeaturesSection />

      {/* 5. How It Works / Qanday Ishlaydi Block */}
      <HowItWorksSection onStartTyping={() => onStartTyping()} />

      {/* 6. Thematic Tests / Mavzuli Testlar Cards */}
      <ThematicTests onSelectAction={handleThematicAction} />

      {/* 7. SEO Article & FAQ Block */}
      <SeoArticleSection />
    </div>
  );
};
