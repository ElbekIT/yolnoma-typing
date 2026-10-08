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
  onOpenFeedback?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToLeaderboard,
  onOpenLogin,
  onOpenFeedback
}) => {
  const handleThematicAction = (action: ThematicActionType) => {
    if (action === 'battle') {
      onGoToBattle();
    } else {
      onStartTyping(action);
    }
  };

  const handleOpenFeedback = () => {
    if (onOpenFeedback) {
      onOpenFeedback();
    } else {
      window.dispatchEvent(new CustomEvent('open_site_feedback'));
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
        onOpenFeedback={handleOpenFeedback}
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

      {/* 4. Interactive Feedback & Community Chat Callout Banner */}
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-md flex flex-col md:flex-row items-center justify-between gap-5 relative">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 relative">
              <MessageSquareMore className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--card-bg)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] uppercase tracking-wider border border-amber-500/25">
                  💬 Sizning Fikringiz Muhim
                </span>
                <span className="text-[11px] font-mono text-[var(--sub-color)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  24h Limitli
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-color)] tracking-tight">
                Sayt haqida o'z fikringizni bildiring
              </h3>
              <p className="text-xs text-[var(--sub-color)] mt-0.5 max-w-xl leading-relaxed">
                Platforma qulayligi yoki takliflaringiz to'g'ridan-to'g'ri Administrator paneliga yetib boradi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenFeedback}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <MessageSquareMore className="w-4 h-4" />
            <span>Fikr Bildirish</span>
          </button>
        </div>
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
