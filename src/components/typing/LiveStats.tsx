import React from 'react';
import { Activity, Target, Clock, Zap } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface LiveStatsProps {
  wpm: number;
  cpm: number;
  accuracy: number;
  timeLeft: number;
  progressPercent: number;
  isTestActive: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  wpm,
  cpm,
  accuracy,
  timeLeft,
  progressPercent,
  isTestActive
}) => {
  const { showLiveWpm } = useSettings();

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-semibold px-2">
        {/* Timer / Progress Counter */}
        <div className="flex items-center gap-2 text-2xl font-mono font-bold text-[var(--main-color)]">
          <Clock className="w-6 h-6 animate-pulse" />
          <span>{timeLeft}s</span>
        </div>

        {/* Live WPM & Accuracy */}
        {showLiveWpm && (
          <div className="flex items-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-1.5 bg-[var(--card-bg)] px-3 py-1.5 rounded-xl border border-[var(--sub-alt)]">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[var(--sub-color)]">WPM:</span>
              <span className="font-mono font-bold text-base text-[var(--text-color)]">{wpm}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--card-bg)] px-3 py-1.5 rounded-xl border border-[var(--sub-alt)]">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-[var(--sub-color)]">ACC:</span>
              <span className="font-mono font-bold text-base text-[var(--text-color)]">{accuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--sub-alt)] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[var(--main-color)] h-full transition-all duration-200"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
