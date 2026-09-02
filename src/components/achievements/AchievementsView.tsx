import React from 'react';
import { Award, Lock, CheckCircle } from 'lucide-react';
import { initialAchievements } from '../../config/achievements';
import { useAuth } from '../../context/AuthContext';

export const AchievementsView: React.FC = () => {
  const { profile, userResultsHistory } = useAuth();
  const unlockedIds = profile?.unlockedAchievements || [];
  const highestWpm = profile?.highestWpm || Math.max(...userResultsHistory.map((r) => r.wpm), 0);
  const totalTests = profile?.totalTests || userResultsHistory.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <span>Achievements & Badges</span>
        </h2>
        <p className="text-xs text-[var(--sub-color)] mt-1">
          Unlock milestone badges as you reach higher speeds, better accuracy, and longer streaks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {initialAchievements.map((ach) => {
          let isUnlocked = unlockedIds.includes(ach.id);
          let currentVal = 0;
          if (ach.id === 'first_test') {
            currentVal = totalTests;
            if (totalTests >= 1) isUnlocked = true;
          } else if (ach.id === 'speed_50') {
            currentVal = highestWpm;
            if (highestWpm >= 50) isUnlocked = true;
          } else if (ach.id === 'speed_100') {
            currentVal = highestWpm;
            if (highestWpm >= 100) isUnlocked = true;
          } else if (ach.id === 'speed_150') {
            currentVal = highestWpm;
            if (highestWpm >= 150) isUnlocked = true;
          } else if (ach.id === 'tests_10') {
            currentVal = totalTests;
            if (totalTests >= 10) isUnlocked = true;
          } else if (ach.id === 'tests_100') {
            currentVal = totalTests;
            if (totalTests >= 100) isUnlocked = true;
          }
          const progressPercent = Math.min(100, Math.round((currentVal / ach.targetValue) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-gradient-to-b from-[var(--card-bg)] to-[var(--sub-alt)] border-amber-500/40 shadow-md'
                  : 'bg-[var(--card-bg)] border-[var(--sub-alt)] opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{ach.icon}</span>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--sub-color)] bg-[var(--sub-alt)] px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> LOCKED
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[var(--text-color)]">{ach.title}</h3>
                <p className="text-xs text-[var(--sub-color)] mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--sub-alt)]">
                <div className="flex justify-between text-[10px] font-mono text-[var(--sub-color)] mb-1">
                  <span>Progress</span>
                  <span>
                    {currentVal} / {ach.targetValue}
                  </span>
                </div>
                <div className="w-full bg-[var(--sub-alt)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUnlocked ? 'bg-amber-500' : 'bg-[var(--main-color)]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
