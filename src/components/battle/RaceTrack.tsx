import React from 'react';
import { CarSvg } from './CarSvg';
import { Crown, Flag, Zap, Target } from 'lucide-react';

export interface RacerProgress {
  id: string;
  name: string;
  avatarUrl?: string;
  wpm: number;
  accuracy: number;
  progressPercent: number; // 0 to 100
  carColor: 'blue' | 'red' | 'gold' | 'green' | 'purple';
  isWinner?: boolean;
  isBot?: boolean;
}

interface RaceTrackProps {
  racers: RacerProgress[];
  isRacing: boolean;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ racers, isRacing }) => {
  return (
    <div className="w-full bg-[#0d1322] border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3 relative overflow-hidden">
      {/* Track Background Neon Glow Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 animate-pulse" />

      {/* Track Header Title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-400 animate-bounce" />
          <h2 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase font-mono flex items-center gap-2">
            SPEEDWAY ARENA <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-sans border border-cyan-500/30">1v1 PvP</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> LIVE</span>
          <span className="text-cyan-400">MARRA: 100%</span>
        </div>
      </div>

      {/* Lanes list */}
      <div className="space-y-3">
        {racers.map((racer, index) => {
          // Clamp progress between 0 and 100
          const clampedProgress = Math.min(100, Math.max(0, racer.progressPercent));

          return (
            <div key={racer.id} className="space-y-1.5">
              {/* Racer Info & Telemetry Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={racer.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${racer.name}`}
                      alt={racer.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                    />
                    {racer.isWinner && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1 drop-shadow-md animate-bounce" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <span className="truncate max-w-[120px] sm:max-w-[180px]">{racer.name}</span>
                      {racer.isBot && (
                        <span className="text-[8px] bg-slate-800 text-cyan-400 px-1 py-0.2 rounded uppercase font-mono">
                          BOT
                        </span>
                      )}
                      {racer.isWinner && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full border border-amber-500/40 font-mono font-bold">
                          🏆 G'OLIB!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 sm:gap-4 font-mono">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-black">{racer.wpm}</span>
                    <span className="text-[9px] text-slate-400">WPM</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Target className="w-3 h-3" />
                    <span className="text-xs font-black">{racer.accuracy}%</span>
                  </div>
                  <div className="bg-slate-800 px-2 py-0.5 rounded-lg text-amber-400 font-black text-[11px] border border-slate-700">
                    {Math.round(clampedProgress)}%
                  </div>
                </div>
              </div>

              {/* Compact Asphalt Race Lane Track */}
              <div className="relative h-12 sm:h-14 w-full bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center">
                {/* Lane Asphalt Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:10px_10px] opacity-40" />

                {/* Dashed Center Road Line */}
                <div className="absolute w-full top-1/2 -translate-y-1/2 border-b border-dashed border-slate-600/50" />

                {/* Distance Markers (START, 25%, 50%, 75%, FINISH) */}
                <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none opacity-20 text-[9px] font-mono text-white font-black">
                  <span>START</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>FINISH</span>
                </div>

                {/* Checkered Finish Line Flag Banner at 100% */}
                <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-transparent to-black/60 flex flex-col justify-between items-center py-0.5 border-l border-amber-400">
                  <div className="w-full h-full bg-[repeating-conic-gradient(#000000_0%_25%,#ffffff_0%_50%)] [background-size:8px_8px] opacity-80" />
                </div>

                {/* Animated Car Positioned along the Track */}
                <div
                  className="absolute transition-all duration-200 ease-out flex items-center pointer-events-none"
                  style={{
                    left: `calc(${clampedProgress}% * 0.82 + 4px)`,
                  }}
                >
                  <CarSvg
                    color={racer.carColor}
                    isMoving={isRacing && clampedProgress < 100}
                    className="w-14 h-6 sm:w-16 sm:h-7"
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
