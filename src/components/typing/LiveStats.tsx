import React from 'react';
import { Flame, Zap, Gauge, Clock, Target } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface LiveStatsProps {
  wpm: number;
  cpm: number;
  accuracy: number;
  timeLeft: number;
  progressPercent: number;
  isTestActive: boolean;
  combo?: number;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  wpm,
  cpm,
  accuracy,
  timeLeft,
  progressPercent,
  isTestActive,
  combo = 0
}) => {
  const { showLiveWpm } = useSettings();

  // Speedometer needle / arc calculation for live WPM (0 to 140 WPM)
  const maxLiveGauge = 140;
  const liveGaugePercent = Math.min(100, Math.max(0, (wpm / maxLiveGauge) * 100));

  // Determine dynamic speed status
  const getSpeedLabel = (w: number) => {
    if (w >= 100) return 'GODLIKE 🔥';
    if (w >= 80) return 'TURBO ⚡';
    if (w >= 60) return 'PRO 🏎️';
    if (w >= 40) return 'FAST 💨';
    return 'STEADY';
  };

  return (
    <div className="w-full max-w-[1220px] xl:max-w-[1300px] mx-auto mb-3 px-2 sm:px-4 md:px-6 select-none transition-all duration-200">
      <div className="bg-slate-950/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-2.5 sm:px-5 sm:py-3 shadow-lg flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Futuristic Digital Countdown Clock */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={timeLeft <= 5 && isTestActive ? '#f43f5e' : '#06b6d4'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="113.1"
                strokeDashoffset={113.1 * (1 - Math.min(1, Math.max(0, progressPercent / 100)))}
                className="transition-all duration-150"
                style={{
                  filter: timeLeft <= 5 && isTestActive ? 'drop-shadow(0 0 6px #f43f5e)' : 'drop-shadow(0 0 4px #06b6d4)'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-sm sm:text-base text-white">
              {timeLeft}
            </div>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              {isTestActive ? 'Qolgan Vaqt' : 'Vaqt (Sekund)'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Center: Live Speedometer / Tachometer Bar & Streak Combo */}
        {showLiveWpm && (
          <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-3">
              {/* Dynamic WPM Readout */}
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {wpm}
                </span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">
                  wpm
                </span>
              </div>

              {/* Combo & Streak Fire Indicator */}
              {combo >= 5 && (
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase tracking-wider transition-all duration-150 ${
                    combo >= 30
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/30 animate-pulse'
                      : combo >= 15
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  <Flame className="w-3 h-3 fill-current text-amber-400" />
                  <span>{combo} COMBO</span>
                </div>
              )}

              {/* Dynamic Speed Tier */}
              {isTestActive && wpm > 10 && (
                <span className="hidden md:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">
                  {getSpeedLabel(wpm)}
                </span>
              )}
            </div>

            {/* Segmented LED RPM rev-meter bar */}
            <div className="w-full max-w-xs bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 p-[1px] flex">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-150 ease-out"
                style={{
                  width: `${liveGaugePercent}%`,
                  boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)'
                }}
              />
            </div>
          </div>
        )}

        {/* Right: Accuracy & CPM */}
        {showLiveWpm && (
          <div className="flex items-center gap-3 sm:gap-5 font-mono text-right">
            {/* Accuracy */}
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Aniqlik
              </span>
              <span className={`text-xs sm:text-sm font-black ${accuracy >= 95 ? 'text-emerald-400' : accuracy >= 85 ? 'text-amber-400' : 'text-rose-400'}`}>
                {accuracy}%
              </span>
            </div>

            {/* CPM */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Belgi/daq
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-200">
                {cpm}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Ultra-smooth Glowing Laser Progress Track */}
      <div className="w-full bg-slate-900/60 h-[2px] rounded-full overflow-hidden mt-1 relative">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-100 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            boxShadow: '0 0 6px rgba(6, 182, 212, 0.8)'
          }}
        />
      </div>
    </div>
  );
};
