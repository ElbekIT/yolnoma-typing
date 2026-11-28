import React, { useState, useEffect } from 'react';
import { ArrowRight, Flame, CheckCircle2, Languages } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { InteractiveModesHub } from '../components/home/InteractiveModesHub';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { MiniLeaderboard } from '../components/home/MiniLeaderboard';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { ThematicTests, ThematicActionType } from '../components/home/ThematicTests';
import { SeoArticleSection } from '../components/seo/SeoArticleSection';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { getDailyChallengeState, DailyChallengeLocalState } from '../utils/dailyChallenge';

interface HomePageProps {
 onStartTyping: (mode?: string) => void;
 onStartDailyChallenge?: () => void;
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
 onStartDailyChallenge,
 onGoToBattle,
 onGoToLessons,
 onGoToEnglish,
 onGoToLeaderboard,
 onOpenLogin
}) => {
 const [dailyState, setDailyState] = useState<DailyChallengeLocalState>(() => getDailyChallengeState());

 useEffect(() => {
 const syncDaily = () => setDailyState(getDailyChallengeState());
 window.addEventListener('yolnoma_daily_updated', syncDaily);
 return () => window.removeEventListener('yolnoma_daily_updated', syncDaily);
 }, []);

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
 <div className="w-full flex flex-col space-y-10 sm:space-y-14 pb-8">
 {/* Top Minimal Utility Strip: Daily Challenge Pill + Language Switcher */}
 <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 flex flex-wrap items-center justify-between gap-3 pt-1">
 {onStartDailyChallenge ? (
 <button
 onClick={onStartDailyChallenge}
 className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/70 transition-colors text-xs cursor-pointer"
 >
 <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0"/>
 <span className="font-bold text-[var(--text-color)]">Bugungi sinov</span>
 <span className="font-mono text-[11px] text-amber-400 font-bold">
 {dailyState.streak} kun
 </span>
 {dailyState.todayCompleted ? (
 <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
 <CheckCircle2 className="w-3 h-3"/>
 {dailyState.todayBestWpm} WPM
 </span>
 ) : (
 <ArrowRight className="w-3 h-3 text-[var(--sub-color)]"/>
 )}
 </button>
 ) : (
 <div />
 )}

 <div className="flex items-center gap-2">
 {onGoToEnglish && (
 <button
 onClick={onGoToEnglish}
 className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/70 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
 >
 <Languages className="w-3.5 h-3.5"/>
 <span>Ingliz tili · 0 dan IELTS 9 gacha</span>
 </button>
 )}
 <LanguageSwitcher />
 </div>
 </div>

 {/* 1. Open Editorial Hero (Borderless) */}
 <HeroSection
 onStartTyping={() => onStartTyping()}
 onGoToBattle={onGoToBattle}
 onGoToLessons={onGoToLessons}
 onGoToLeaderboard={onGoToLeaderboard}
 onOpenLogin={onOpenLogin}
 onGoToEnglish={onGoToEnglish}
 />

 {/* 2. Modes Hub & Mastery Progression (Borderless) */}
 <InteractiveModesHub
 onStartMode={(mode) => onStartTyping(mode)}
 onGoToBattle={onGoToBattle}
 onGoToLessons={onGoToLessons}
 onGoToLeaderboard={onGoToLeaderboard}
 />

 {/* 3. Balanced Two-Column Showcase: Live Leaderboard + Thematic Practice */}
 <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 <div className="lg:col-span-5">
 <MiniLeaderboard
 onViewFullLeaderboard={onGoToLeaderboard}
 onOpenLogin={onOpenLogin}
 />
 </div>
 <div className="lg:col-span-7">
 <ThematicTests onSelectAction={handleThematicAction} />
 </div>
 </section>

 {/* 4. Features & How It Works (Compact Borderless Blocks) */}
 <FeaturesSection />
 <HowItWorksSection onStartTyping={() => onStartTyping()} />

 {/* 5. Guide & FAQ (Borderless) */}
 <SeoArticleSection />
 </div>
 );
};
