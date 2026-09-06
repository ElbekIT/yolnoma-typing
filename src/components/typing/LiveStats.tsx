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
    <div className="w-full max-w-[1220px] xl:max-w-[1300px] mx-auto mb-2 flex flex-col gap-1 px-2 sm:px-4 md:px-6 select-none">
      <div className="flex items-center justify-between">
        {/* Clean Timer - Monkeytype style */}
        <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--main-color)] tracking-tight">
          {timeLeft}
        </div>

        {/* Live WPM & Accuracy */}
        {showLiveWpm && (
          <div className="flex items-center gap-5 text-xs sm:text-sm font-mono text-[var(--sub-color)]">
            <div className="flex items-center gap-1.5">
              <span className="opacity-60 text-[11px] uppercase">wpm</span>
              <span className="font-bold text-[var(--text-color)]">{wpm}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="opacity-60 text-[11px] uppercase">acc</span>
              <span className="font-bold text-[var(--text-color)]">{accuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-[var(--sub-alt)]/30 h-1 rounded-full overflow-hidden mt-0.5">
        <div
          className="bg-[var(--main-color)] h-full transition-all duration-100 opacity-80"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
