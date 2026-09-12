import React from 'react';
import { SpaceShooter } from '../components/game/SpaceShooter';
import {
  Rocket,
  Keyboard,
  Trophy,
  Zap,
  Target,
  Sparkles,
  Flame,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface SpaceGamePageProps {
  onBackToHome?: () => void;
  onGoToTyping?: () => void;
  onGoToLeaderboard?: () => void;
}

export const SpaceGamePage: React.FC<SpaceGamePageProps> = ({
  onBackToHome,
  onGoToTyping,
  onGoToLeaderboard
}) => {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-start py-4 px-2 sm:px-4 space-y-6">
      {/* Game Viewport Container */}
      <SpaceShooter
        onBackToHome={onBackToHome}
        onGoToTyping={onGoToTyping}
        onGoToLeaderboard={onGoToLeaderboard}
      />

      {/* Feature & Educational Cards below Game */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Touch Typing Speed */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-md space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-color)]">
            Tez Korrelyatsiya & Reaksiya
          </h3>
          <p className="text-xs text-[var(--sub-color)] leading-relaxed">
            Ko'r-ko'rona yozish (touch typing) va ko'rish reflekslarini bir vaqtda rivojlantiradi. Harflarni qidirishga vaqt sarflamay, avtomatik barmoq xotirasiga o'tasiz.
          </p>
        </div>

        {/* Card 2: Accuracy & Multiplier */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-md space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-color)]">
            Streak va 100% Aniqlik
          </h3>
          <p className="text-xs text-[var(--sub-color)] leading-relaxed">
            Xato qilmasdan ketma-ket harflarni terish orqali ball multiplikatorini oshiring va rekord o'rnating. Har bir to'g'ri nishon lazer zarbasiga aylanadi.
          </p>
        </div>

        {/* Card 3: Boss & Strategy */}
        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-md space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-color)]">
            To'lqinlar va Boss Janglari
          </h3>
          <p className="text-xs text-[var(--sub-color)] leading-relaxed">
            Har 5-to'lqinda 3 bosqichli gigant Flagman kema bilan to'qnashuv! Qiyin vaziyatda favqulodda EMP bombadan oqilona foydalaning.
          </p>
        </div>
      </div>

      {/* Quick Navigation Footer Row */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-xs text-[var(--sub-color)]">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-cyan-400" />
          <span>Yolnoma Koinot Jangi — ZType ochiq arkada o'yini</span>
        </div>

        <div className="flex items-center gap-3">
          {onGoToTyping && (
            <button
              onClick={onGoToTyping}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Oddiy Yozish Testiga o'tish</span>
            </button>
          )}

          {onGoToLeaderboard && (
            <button
              onClick={onGoToLeaderboard}
              className="hover:text-[var(--main-color)] transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Peshqadamlar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
