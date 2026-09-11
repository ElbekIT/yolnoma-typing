import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { ThematicTests, ThematicActionType } from '../components/home/ThematicTests';
import { SeoArticleSection } from '../components/seo/SeoArticleSection';

interface HomePageProps {
  onStartTyping: (mode?: string) => void;
  onGoToBattle: () => void;
  onViewFullLeaderboard: () => void;
  onOpenLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTyping,
  onGoToBattle,
  onViewFullLeaderboard,
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
    <div className="w-full flex flex-col space-y-4 sm:space-y-6 animate-fade-in">
      {/* 1. Hero Section (H1 Title + Start Button + Mini Leaderboard) */}
      <HeroSection
        onStartTyping={() => onStartTyping()}
        onGoToBattle={onGoToBattle}
        onViewFullLeaderboard={onViewFullLeaderboard}
        onOpenLogin={onOpenLogin}
      />

      {/* 2. Features / Imkoniyatlar Block */}
      <FeaturesSection />

      {/* 3. How It Works / Qanday Ishlaydi Block */}
      <HowItWorksSection onStartTyping={() => onStartTyping()} />

      {/* 4. Thematic Tests / Mavzuli Testlar Cards */}
      <ThematicTests onSelectAction={handleThematicAction} />

      {/* 5. SEO Article & FAQ Block */}
      <SeoArticleSection />
    </div>
  );
};
