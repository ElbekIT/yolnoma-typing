import React from 'react';
import { WelcomeEntrancePortal } from '../components/home/WelcomeEntrancePortal';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { MiniLeaderboard } from '../components/home/MiniLeaderboard';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { ThematicTests, ThematicActionType } from '../components/home/ThematicTests';
import { SeoArticleSection } from '../components/seo/SeoArticleSection';

interface HomePageProps {
  onStartTyping: (mode?: string) => void;
  onGoToBattle: () => void;
  onGoToLessons: () => void;
  onGoToLeaderboard: () => void;
  onOpenLogin: () => void;
  onGoToDesign?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToLeaderboard,
  onOpenLogin,
  onGoToDesign
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
      {/* 0. Central Welcome Portal (Design Order vs Typing Practice) */}
      <WelcomeEntrancePortal
        onGoToDesign={() => {
          if (onGoToDesign) onGoToDesign();
        }}
        onGoToTyping={() => onStartTyping()}
      />

      {/* 1. Hero Section (H1 Title + Start Button + Practice Hub) */}
      <HeroSection
        onStartTyping={() => onStartTyping()}
        onGoToBattle={onGoToBattle}
        onGoToLessons={onGoToLessons}
        onGoToLeaderboard={onGoToLeaderboard}
        onOpenLogin={onOpenLogin}
      />

      {/* 2. Top 5 Milliy Reyting / Mini Leaderboard Showcase */}
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
        <MiniLeaderboard
          onViewFullLeaderboard={onGoToLeaderboard}
          onOpenLogin={onOpenLogin}
        />
      </div>

      {/* 3. Features / Imkoniyatlar Block */}
      <FeaturesSection />

      {/* 4. How It Works / Qanday Ishlaydi Block */}
      <HowItWorksSection onStartTyping={() => onStartTyping()} />

      {/* 5. Thematic Tests / Mavzuli Testlar Cards */}
      <ThematicTests onSelectAction={handleThematicAction} />

      {/* 6. SEO Article & FAQ Block */}
      <SeoArticleSection />
    </div>
  );
};
