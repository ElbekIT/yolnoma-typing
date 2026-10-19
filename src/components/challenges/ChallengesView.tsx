import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  Play,
  Sparkles,
  Zap,
  Gift,
  Check,
  Calendar,
  Swords
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface ChallengesViewProps {
  onStartChallenge: () => void;
  onGoToBattle?: () => void;
}

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  rewardXP: number;
  difficulty: 'Oson' | 'Oʻrtacha' | 'Qiyin';
  difficultyColor: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isClaimed: boolean;
  progressText: string;
  progressPercent: number;
  actionText: string;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  onStartChallenge,
  onGoToBattle
}) => {
  const { profile, userResultsHistory, addXp } = useAuth();
  const { language } = useSettings();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const storageKey = `yolnoma_claimed_quests_${todayStr}`;

  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timeLeft, setTimeLeft] = useState('');

  // Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter results completed today
  const todayResults = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();

    return userResultsHistory.filter((r) => r.timestamp >= startTimestamp);
  }, [userResultsHistory]);

  // Compute daily quest completion state
  const quests: DailyQuest[] = useMemo(() => {
    // Quest 1: Speed Sprint (At least 50 WPM with >= 95% accuracy)
    const bestSpeedTest = todayResults.find((r) => r.wpm >= 50 && r.accuracy >= 95);
    const q1Completed = Boolean(bestSpeedTest);
    const maxSpeedToday = todayResults.reduce((max, r) => Math.max(max, r.wpm), 0);

    // Quest 2: Volume & Endurance (Complete at least 3 tests OR a 60s+ test)
    const longTest = todayResults.find((r) => r.testTimeSeconds >= 60);
    const testCountToday = todayResults.length;
    const q2Completed = Boolean(longTest || testCountToday >= 3);

    // Quest 3: Precision Master (At least 98% accuracy on any test)
    const highAccTest = todayResults.find((r) => r.accuracy >= 98);
    const q3Completed = Boolean(highAccTest);
    const maxAccToday = todayResults.reduce((max, r) => Math.max(max, r.accuracy), 0);

    return [
      {
        id: `q1_${todayStr}`,
        title: 'Tezkor Sprint',
        description: 'Bugun kamida 50 WPM tezlik va 95% aniqlik bilan test topshiring.',
        rewardXP: 150,
        difficulty: 'Oson',
        difficultyColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: <Zap className="w-5 h-5 text-emerald-400" />,
        isCompleted: q1Completed,
        isClaimed: claimedIds.includes(`q1_${todayStr}`),
        progressText: q1Completed ? 'Bajarildi (50+ WPM)' : `${maxSpeedToday} / 50 WPM`,
        progressPercent: Math.min(100, Math.round((maxSpeedToday / 50) * 100)),
        actionText: 'Sprintni boshlash'
      },
      {
        id: `q2_${todayStr}`,
        title: 'Barqaror Matonat',
        description: 'Bugun 3 ta test topshiring yoki 60+ soniyalik uzoq testni yakunlang.',
        rewardXP: 200,
        difficulty: 'Oʻrtacha',
        difficultyColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: <Clock className="w-5 h-5 text-amber-400" />,
        isCompleted: q2Completed,
        isClaimed: claimedIds.includes(`q2_${todayStr}`),
        progressText: q2Completed ? 'Bajarildi (3/3 test)' : `${Math.min(3, testCountToday)} / 3 test`,
        progressPercent: Math.min(100, Math.round((testCountToday / 3) * 100)),
        actionText: 'Mashqni boshlash'
      },
      {
        id: `q3_${todayStr}`,
        title: 'Zargarona Aniqlik',
        description: 'Xatolarsiz yozish: istalgan testda 98% yoki undan yuqori aniqlikka erishing.',
        rewardXP: 250,
        difficulty: 'Qiyin',
        difficultyColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: <Target className="w-5 h-5 text-rose-400" />,
        isCompleted: q3Completed,
        isClaimed: claimedIds.includes(`q3_${todayStr}`),
        progressText: q3Completed ? 'Bajarildi (98%+ aniqlik)' : `${maxAccToday}% / 98%`,
        progressPercent: Math.min(100, Math.round((maxAccToday / 98) * 100)),
        actionText: 'Aniqlik testini boshlash'
      }
    ];
  }, [todayStr, todayResults, claimedIds]);

  const handleClaimReward = async (questId: string, rewardXP: number) => {
    if (claimedIds.includes(questId)) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const newClaimed = [...claimedIds, questId];
    setClaimedIds(newClaimed);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newClaimed));
    } catch {}

    // Add real XP
    await addXp(rewardXP);
  };

  const currentStreak = profile?.currentStreak || Number(localStorage.getItem('yolnoma_guest_streak') || 1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Banner & Daily Streak Tracker */}
      <div className="bg-gradient-to-r from-[var(--card-bg)] via-[var(--sub-alt)]/50 to-[var(--card-bg)] border border-[var(--sub-alt)] p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <span>Kunlik Faollik & Olov</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
              Kunlik Topshiriqlar & Streak
            </h2>
            <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1.5 max-w-xl leading-relaxed">
              Har kuni yangi vazifalarni bajaring, XP ballarini toʻplang, olovni soʻndirmang va platformadagi unvoningizni yuksaltiring!
            </p>
          </div>

          {/* Daily Streak Highlight Card */}
          <div className="flex items-center gap-4 bg-[var(--card-bg)]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[var(--sub-alt)] shadow-md shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
              <Flame className="w-8 h-8 fill-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono text-[var(--text-color)]">{currentStreak}</span>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">kunlik olov</span>
              </div>
              <p className="text-[11px] text-[var(--sub-color)] mt-0.5">
                {currentStreak > 1
                  ? "Ajoyib davomiylik! Olovni so'ndirmang 🔥"
                  : "Bugun test topshirib olovni yoqing!"}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--sub-alt)]/60 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--sub-color)]">
          <div className="flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Keyingi vazifalar yangilanishiga:</span>
            <span className="font-bold text-[var(--text-color)] bg-[var(--sub-alt)] px-2 py-0.5 rounded-lg border border-[var(--sub-color)]/20">
              {timeLeft || '00:00:00'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">Bajarilgan vazifalar:</span>
            <span className="font-mono font-bold text-[var(--main-color)]">
              {quests.filter((q) => q.isCompleted).length} / {quests.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quests.map((q) => (
          <div
            key={q.id}
            className={`bg-[var(--card-bg)] border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
              q.isClaimed
                ? 'border-emerald-500/40 opacity-90'
                : q.isCompleted
                ? 'border-amber-500/60 shadow-lg shadow-amber-500/5'
                : 'border-[var(--sub-alt)] hover:border-[var(--main-color)]/60'
            }`}
          >
            <div>
              {/* Header: Difficulty & Icon */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${q.difficultyColor}`}>
                  {q.difficulty}
                </span>

                <div className="p-2 rounded-xl bg-[var(--sub-alt)]">
                  {q.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-base text-[var(--text-color)]">{q.title}</h3>
              <p className="text-xs text-[var(--sub-color)] mt-1 leading-relaxed">
                {q.description}
              </p>

              {/* Reward Badge */}
              <div className="mt-4 p-3 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] flex items-center justify-between text-xs">
                <span className="text-[var(--sub-color)] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mukofot:</span>
                </span>
                <span className="font-mono font-black text-amber-500">+{q.rewardXP} XP</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-[var(--sub-color)]">
                  <span>Jarayon</span>
                  <span className={q.isCompleted ? 'text-emerald-400 font-bold' : ''}>
                    {q.progressText}
                  </span>
                </div>
                <div className="w-full bg-[var(--sub-alt)] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      q.isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-[var(--main-color)]'
                    }`}
                    style={{ width: `${q.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-2">
              {q.isClaimed ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 select-none">
                  <Check className="w-4 h-4" />
                  <span>Mukofot Olingan ✅</span>
                </div>
              ) : q.isCompleted ? (
                <button
                  onClick={() => handleClaimReward(q.id, q.rewardXP)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>+{q.rewardXP} XP Mukofotni Olish!</span>
                </button>
              ) : (
                <button
                  onClick={onStartChallenge}
                  className="w-full py-2.5 rounded-xl bg-[var(--main-color)] hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{q.actionText}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Extra Motivation Card: Speedway Battle Arena CTA */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-color)]">
              Jonli Raqobat: Speedway Battle
            </h4>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              Doʻstlaringiz yoki Kiber Botlar bilan 1v1 poyga oʻtkazib, koʻproq gʻalaba XP ballarini qoʻlga kiriting!
            </p>
          </div>
        </div>

        {onGoToBattle && (
          <button
            onClick={onGoToBattle}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
          >
            <span>Speedway Battle-ga oʻtish</span>
            <Swords className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
