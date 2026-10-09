import React from 'react';
import { MessageSquareMore, Clock } from 'lucide-react';
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
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToLeaderboard,
  onOpenLogin
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
