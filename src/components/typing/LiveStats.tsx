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
    <div className="w-full max-w-5xl mx-auto mb-2 flex flex-col gap-1 px-4">
      <div className="flex items-center justify-between text-sm font-semibold">
        {/* Large Clean Timer */}
        <div className="text-3xl font-mono font-bold text-[var(--main-color)] tracking-tight">
          {timeLeft}s
        </div>

        {/* Live WPM & Accuracy */}
        {showLiveWpm && (
          <div className="flex items-center gap-6 text-sm font-mono opacity-80">
            <div className="flex items-center gap-2">
              <span className="text-[var(--sub-color)] text-xs uppercase font-sans">WPM</span>
              <span className="font-bold text-lg text-[var(--text-color)]">{wpm}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--sub-color)] text-xs uppercase font-sans">ACC</span>
              <span className="font-bold text-lg text-[var(--text-color)]">{accuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-[var(--sub-alt)]/40 h-1 rounded-full overflow-hidden mt-1">
        <div
          className="bg-[var(--main-color)] h-full transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
