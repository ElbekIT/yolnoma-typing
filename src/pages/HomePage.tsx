import React from 'react';
import { MessageSquareMore, Clock, Heart, ArrowRight } from 'lucide-react';
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
  onGoToLeaderboard: () => void;
  onOpenLogin: () => void;
  onGoToSupport: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToLeaderboard,
  onOpenLogin,
  onGoToSupport
}) => {
  const handleThematicAction = (action: ThematicActionType) => {
    if (action === 'battle') {
      onGoToBattle();
    } else {
      onStartTyping(action);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6 sm:space-y-8">
      {/* Dedicated Home Page Language Selector Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--sub-color)]">
          <span className="w-2 h-2 rounded-full bg-[var(--main-color)]" />
          <span className="font-bold">Interfeys tili (Language):</span>
        </div>
        <div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Quick Support Banner */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
        <button
          onClick={onGoToSupport}
          type="button"
          className="w-full relative overflow-hidden p-0.5 rounded-2xl group cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-[var(--bg-color)] group-hover:from-rose-500/30 group-hover:via-amber-500/20 transition-all rounded-2xl" />
          <div className="relative bg-[var(--card-bg)] px-4 sm:px-5 py-3 rounded-[14px] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border border-[var(--sub-alt)]/50 group-hover:border-rose-500/30 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                <Heart className="w-5 h-5 fill-rose-500/80" />
              </div>
              <div>
                <h3 className="text-[13px] sm:text-sm font-bold text-[var(--text-color)] leading-tight mb-0.5">
                  Qo'llab-quvvatlash
                </h3>
                <p className="text-[10px] sm:text-[11px] font-medium text-[var(--sub-color)]">
                  Saytga o'z hissangizni qo'shing (o'z xohishingizga bog'liq)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[var(--text-color)] px-4 py-2 bg-[var(--sub-alt)]/50 rounded-lg whitespace-nowrap group-hover:bg-[var(--sub-alt)] transition-colors">
              <span>O'tish</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
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


      {/* 5. Features / Imkoniyatlar Block */}
      <FeaturesSection />

      {/* 6. How It Works / Qanday Ishlaydi Block */}
      <HowItWorksSection onStartTyping={() => onStartTyping()} />

      {/* 7. Thematic Tests / Mavzuli Testlar Cards */}
      <ThematicTests onSelectAction={handleThematicAction} />

      {/* 8. SEO Article & FAQ Block */}
      <SeoArticleSection />
    </div>
  );
};
