import React from 'react';
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
  accuracy,
  timeLeft,
  progressPercent
}) => {
  const { showLiveWpm } = useSettings();

  return (
    <div className="w-full max-w-4xl mx-auto mb-2 flex flex-col gap-1 px-1 sm:px-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        {/* Large Clean Timer - uses theme main color */}
        <div className="text-3xl font-mono font-extrabold text-[var(--main-color)] tracking-tight transition-colors duration-200">
          {timeLeft}
        </div>

        {/* Live WPM & Accuracy - uses theme colors */}
        {showLiveWpm && (
          <div className="flex items-center gap-6 text-sm font-mono text-[var(--sub-color)]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-mono">wpm:</span>
              <span className="font-bold text-lg text-[var(--text-color)]">{wpm}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-mono">acc:</span>
              <span className="font-bold text-lg text-[var(--text-color)]">{accuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Theme Progress Bar */}
      <div className="w-full bg-[var(--sub-alt)]/40 h-1.5 rounded-full overflow-hidden mt-1">
        <div
          className="bg-[var(--main-color)] h-full transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
