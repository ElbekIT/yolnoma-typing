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
    <div className="w-full bg-[#0d1322] border border-cyan-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Track Background Neon Glow Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 animate-pulse" />

      {/* Track Header Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-400 animate-bounce" />
          <h2 className="text-sm sm:text-base font-black tracking-wider text-white uppercase font-mono flex items-center gap-2">
            SPEEDWAY POYGA ARENASI <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-sans border border-cyan-500/30">PRO CIRCUIT</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> LIVE TELEMETRIYA</span>
          <span className="hidden sm:inline-block text-cyan-400">MARRA: 100%</span>
        </div>
      </div>

      {/* Lanes list */}
      <div className="space-y-6">
        {racers.map((racer, index) => {
          // Clamp progress between 0 and 100
          const clampedProgress = Math.min(100, Math.max(0, racer.progressPercent));

          return (
            <div key={racer.id} className="space-y-2">
              {/* Racer Info & Telemetry Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={racer.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${racer.name}`}
                      alt={racer.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-slate-700"
                    />
                    {racer.isWinner && (
                      <Crown className="w-4 h-4 text-amber-400 absolute -top-2 -right-1 drop-shadow-md animate-bounce" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-sm text-white">
                      <span>{racer.name}</span>
                      {racer.isBot && (
                        <span className="text-[9px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-mono">
                          BOT
                        </span>
                      )}
                      {racer.isWinner && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/40 font-mono font-bold">
                          🏆 G'OLIB!
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Bo'lak #{index + 1}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 sm:gap-6 font-mono">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-sm font-black">{racer.wpm}</span>
                    <span className="text-[10px] text-slate-400">WPM</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-sm font-black">{racer.accuracy}%</span>
                    <span className="text-[10px] text-slate-400">ACC</span>
                  </div>
                  <div className="bg-slate-800 px-2.5 py-1 rounded-xl text-amber-400 font-black text-xs border border-slate-700">
                    {Math.round(clampedProgress)}%
                  </div>
                </div>
              </div>

              {/* Asphalt Race Lane Track */}
              <div className="relative h-20 sm:h-24 w-full bg-[#111827] rounded-2xl border-2 border-slate-800 overflow-hidden shadow-inner flex items-center">
                {/* Lane Asphalt Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

                {/* Dashed Center Road Line */}
                <div className="absolute w-full top-1/2 -translate-y-1/2 border-b-2 border-dashed border-slate-600/50" />

                {/* Distance Markers (0%, 25%, 50%, 75%, 100%) */}
                <div className="absolute inset-0 flex justify-between px-6 items-center pointer-events-none opacity-20 text-[10px] font-mono text-white font-black">
                  <span>START</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>FINISH</span>
                </div>

                {/* Checkered Finish Line Flag Banner at 100% */}
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-transparent to-black/60 flex flex-col justify-between items-center py-1 border-l-2 border-amber-400">
                  <div className="w-full h-full bg-[repeating-conic-gradient(#000000_0%_25%,#ffffff_0%_50%)] [background-size:10px_10px] opacity-80" />
                </div>

                {/* Animated Car Positioned along the Track */}
                <div
                  className="absolute transition-all duration-300 ease-out flex items-center pointer-events-none"
                  style={{
                    left: `calc(${clampedProgress}% * 0.82 + 8px)`,
                  }}
                >
                  <CarSvg
                    color={racer.carColor}
                    isMoving={isRacing && clampedProgress < 100}
                    className="w-20 h-9 sm:w-28 sm:h-12"
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
