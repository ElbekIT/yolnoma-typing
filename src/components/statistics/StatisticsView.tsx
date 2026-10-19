import React, { useMemo } from 'react';
import {
  BarChart3,
  AlertCircle,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
  TrendingUp,
  Award,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StatisticsViewProps {
  onStartTargetedPractice?: (keys: string[]) => void;
  onGoToTyping?: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  onStartTargetedPractice,
  onGoToTyping
}) => {
  const { userResultsHistory, profile } = useAuth();

  // Real character accuracy statistics calculation from user test history
  const { weakestKeys, masteredKeys, totalCharsTyped, totalErrorsRecorded } = useMemo(() => {
    const charStats: Record<string, { total: number; errors: number }> = {};
    let totalChars = 0;
    let totalErrors = 0;

    userResultsHistory.forEach((r) => {
      if (r.charStats) {
        Object.entries(r.charStats).forEach(([char, data]) => {
          if (!charStats[char]) {
            charStats[char] = { total: 0, errors: 0 };
          }
          charStats[char].total += data.total;
          charStats[char].errors += data.errors;
          totalChars += data.total;
          totalErrors += data.errors;
        });
      }
    });

    const charArray = Object.entries(charStats)
      .filter(([char, data]) => data.total >= 3 && char.trim() !== '')
      .map(([char, data]) => ({
        char,
        total: data.total,
        errors: data.errors,
        accuracy: Math.max(0, Math.round(((data.total - data.errors) / data.total) * 100))
      }));

    // Weakest keys (lowest accuracy or most errors)
    const weak = [...charArray]
      .filter((k) => k.accuracy < 96 || k.errors > 0)
      .sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors)
      .slice(0, 6);

    // Mastered keys (highest accuracy >= 98%)
    const mastered = [...charArray]
      .filter((k) => k.accuracy >= 98 && k.total >= 10)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    return {
      weakestKeys: weak,
      masteredKeys: mastered,
      totalCharsTyped: totalChars,
      totalErrorsRecorded: totalErrors
    };
  }, [userResultsHistory]);

  const highestWpm = profile?.highestWpm || (userResultsHistory.length > 0 ? Math.max(...userResultsHistory.map(r => r.wpm)) : 0);
  const avgWpm = profile?.averageWpm || (userResultsHistory.length > 0 ? Math.round(userResultsHistory.reduce((acc, r) => acc + r.wpm, 0) / userResultsHistory.length) : 0);
  const avgAccuracy = userResultsHistory.length > 0
    ? Math.round(userResultsHistory.reduce((acc, r) => acc + r.accuracy, 0) / userResultsHistory.length)
    : (profile?.highestAccuracy || 100);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--main-color)]/15 text-[var(--main-color)] text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>Shaxsiy Diagnostika</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
              Klaviatura Tahlili & Zaif Tugmalar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1 max-w-xl">
              Haqiqiy testlaringiz asosida xato ketayotgan klavishlarni aniqlang va ularni alohida mashq qiling.
            </p>
          </div>

          {onGoToTyping && (
            <button
              onClick={onGoToTyping}
              className="px-5 py-2.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Yangi Test Topshirish</span>
            </button>
          )}
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--sub-alt)]">
          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] text-center">
            <span className="text-[10px] font-mono uppercase text-[var(--sub-color)] font-bold">Eng Yuqori Tezlik</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--main-color)] mt-0.5">
              {highestWpm} <span className="text-xs font-normal text-[var(--sub-color)]">WPM</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] text-center">
            <span className="text-[10px] font-mono uppercase text-[var(--sub-color)] font-bold">Oʻrtacha Tezlik</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-color)] mt-0.5">
              {avgWpm} <span className="text-xs font-normal text-[var(--sub-color)]">WPM</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] text-center">
            <span className="text-[10px] font-mono uppercase text-[var(--sub-color)] font-bold">Oʻrtacha Aniqlik</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500 mt-0.5">
              {avgAccuracy}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] text-center">
            <span className="text-[10px] font-mono uppercase text-[var(--sub-color)] font-bold">Jami Testlar</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400 mt-0.5">
              {profile?.totalTests || userResultsHistory.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Weak Keys & Practice Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: Weak Keys (Needs practice) */}
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Mashq Talab Qiluvchi Zaif Tugmalar</span>
              </h3>
              {weakestKeys.length > 0 && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold">
                  {weakestKeys.length} ta klavish
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {weakestKeys.length > 0 ? (
                weakestKeys.map((item) => (
                  <div
                    key={item.char}
                    className="flex items-center justify-between bg-[var(--sub-alt)]/70 hover:bg-[var(--sub-alt)] p-3 rounded-2xl border border-[var(--sub-alt)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-[var(--card-bg)] text-[var(--main-color)] font-mono font-bold flex items-center justify-center uppercase border border-[var(--sub-color)]/20 shadow-xs">
                        {item.char}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-color)] uppercase">
                          '{item.char}' Tugmasi
                        </div>
                        <div className="text-[11px] text-[var(--sub-color)] font-mono">
                          {item.errors} ta xato • {item.total} marta bosilgan
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-rose-400">{item.accuracy}%</div>
                      <div className="text-[10px] text-[var(--sub-color)]">aniqlik</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl bg-[var(--sub-alt)]/30 border border-dashed border-[var(--sub-alt)]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-[var(--text-color)]">
                    Zaif klavishlar topilmadi!
                  </p>
                  <p className="text-[11px] text-[var(--sub-color)] mt-1">
                    Bir nechta tezlik testlarini topshiring, tizim adashilgan harflarni avtomatik tahlil qiladi.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Targeted Practice Action Button */}
          {weakestKeys.length > 0 && onStartTargetedPractice && (
            <button
              onClick={() => onStartTargetedPractice(weakestKeys.map((k) => k.char))}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Target className="w-4 h-4" />
              <span>Ushbu Zaif Harflarni Mashq Qilish ({weakestKeys.map(k => k.char).join(', ')})</span>
            </button>
          )}
        </div>

        {/* Card B: Mastered Keys & AI Training Tips */}
        <div className="space-y-6">
          {/* Mastered Keys Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Mukammal Oʻzlashtirilgan Harflar (98%+)</span>
            </h3>

            {masteredKeys.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                {masteredKeys.map((item) => (
                  <div
                    key={item.char}
                    className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[var(--card-bg)] font-mono font-bold text-emerald-400 flex items-center justify-center uppercase border border-emerald-500/30 mb-1">
                      {item.char}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">{item.accuracy}%</span>
                    <span className="text-[9px] text-[var(--sub-color)]">{item.total} marta</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                Testlar soni koʻpaygani sari siz bexato bosadigan eng ishonchli harflar shu yerda namoyon boʻladi.
              </p>
            )}
          </div>

          {/* AI Training Tips Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Yozish Samaradorligini Oshirish Maslahatlari</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[var(--text-color)] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-500 mb-0.5">Avval Aniqlik, Keyin Tezlik</strong>
                  <span className="text-[var(--sub-color)]">Tezlik tabiiy ravishda aniqlik ortidan keladi. Tezlashishdan oldin doimo 97%+ aniqlikka intiling.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[var(--text-color)] flex items-start gap-3">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-indigo-400 mb-0.5">Yozishning Bir Maromdagi Ritmi</strong>
                  <span className="text-[var(--sub-color)]">Oson soʻzlarni shoshilib yozib, qiyin harflarda toʻxtab qolish oʻrniga bir maromda (metronom kabi) yozish tezlikni keskin oshiradi.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

