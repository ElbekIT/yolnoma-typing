import React from 'react';
import { Target, Flame, Clock, Award, CheckCircle2, Play } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface ChallengesViewProps {
  onStartChallenge: () => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ onStartChallenge }) => {
  const { language } = useSettings();

  const dailyChallenges = [
    {
      id: 'd1',
      title: 'Precision Sprint',
      description: 'Achieve at least 60 WPM with 98% accuracy on a 30s test.',
      rewardXP: 150,
      targetWpm: 60,
      targetAccuracy: 98,
      timeLeft: '08h 14m',
      difficulty: 'Medium'
    },
    {
      id: 'd2',
      title: 'Multilingual Polyglot',
      description: 'Complete 3 typing tests in 3 different languages.',
      rewardXP: 250,
      targetWpm: 50,
      targetAccuracy: 95,
      timeLeft: '14h 30m',
      difficulty: 'Hard'
    },
    {
      id: 'd3',
      title: 'Code Syntax Warrior',
      description: 'Type a programming code snippet with over 45 WPM.',
      rewardXP: 300,
      targetWpm: 45,
      targetAccuracy: 96,
      timeLeft: '20h 45m',
      difficulty: 'Expert'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
          <Target className="w-6 h-6 text-rose-500" />
          <span>Daily & Weekly Typing Challenges</span>
        </h2>
        <p className="text-xs text-[var(--sub-color)] mt-1">
          Complete special daily missions to earn XP points, level up your profile, and earn badges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dailyChallenges.map((ch) => (
          <div
            key={ch.id}
            className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:border-[var(--main-color)] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase">
                  {ch.difficulty}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[var(--sub-color)] font-mono">
                  <Clock className="w-3 h-3" /> {ch.timeLeft} left
                </span>
              </div>

              <h3 className="font-bold text-base text-[var(--text-color)]">{ch.title}</h3>
              <p className="text-xs text-[var(--sub-color)] mt-1 leading-relaxed">{ch.description}</p>

              <div className="mt-4 p-3 rounded-2xl bg-[var(--sub-alt)] flex items-center justify-between text-xs">
                <span className="text-[var(--sub-color)]">Reward XP:</span>
                <span className="font-mono font-extrabold text-amber-500">+{ch.rewardXP} XP</span>
              </div>
            </div>

            <button
              onClick={onStartChallenge}
              className="w-full mt-6 py-2.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Challenge</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
