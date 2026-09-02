import React from 'react';
import { Trophy, Zap, Flag, Flame, Skull, ShieldCheck } from 'lucide-react';
import { DinoBattlePlayerState } from '../../types';

interface DinoBattleTrackProps {
  player1: DinoBattlePlayerState;
  player2: DinoBattlePlayerState;
  isRacing: boolean;
}

export const DinoBattleTrack: React.FC<DinoBattleTrackProps> = ({ player1, player2, isRacing }) => {
  const maxDistance = Math.max(1000, player1.distance, player2.distance, 600);
  const p1Progress = Math.min(100, Math.max(0, (player1.distance / maxDistance) * 100));
  const p2Progress = Math.min(100, Math.max(0, (player2.distance / maxDistance) * 100));

  const isP1Leading = player1.distance > player2.distance;
  const isP2Leading = player2.distance > player1.distance;

  return (
    <div className="w-full bg-[#0d1322] border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3 relative overflow-hidden">
      {/* Glow Top Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 animate-pulse" />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base animate-bounce">🦖</span>
          <h2 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase font-mono flex items-center gap-2">
            DINO SURVIVAL ARENA <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-sans border border-amber-500/30">1v1 DINO BATTLE</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> JONLI REJIM
          </span>
          <span className="text-amber-400">REKORD DUELI</span>
        </div>
      </div>

      {/* 2 Player Track Lanes */}
      <div className="space-y-3">
        {[player1, player2].map((racer, idx) => {
          const isPlayer1 = idx === 0;
          const progress = isPlayer1 ? p1Progress : p2Progress;
          const isLeader = isPlayer1 ? isP1Leading : isP2Leading;

          return (
            <div key={racer.id || idx} className="space-y-1.5">
              {/* Telemetry Top Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={racer.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${racer.name}`}
                      alt={racer.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                    />
                    {racer.isWinner && (
                      <span className="absolute -top-2 -right-1 text-xs">👑</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="truncate max-w-[110px] sm:max-w-[180px]">{racer.name}</span>
                    {isPlayer1 ? (
                      <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1 py-0.2 rounded uppercase font-mono">
                        SIZ
                      </span>
                    ) : racer.isBot ? (
                      <span className="text-[8px] bg-purple-950 text-purple-400 border border-purple-800 px-1 py-0.2 rounded uppercase font-mono">
                        BOT
                      </span>
                    ) : (
                      <span className="text-[8px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded uppercase font-mono">
                        RAQIB
                      </span>
                    )}

                    {racer.isAlive ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full border border-emerald-500/40 font-mono font-bold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> TIRIK
                      </span>
                    ) : (
                      <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full border border-rose-500/40 font-mono font-bold flex items-center gap-0.5">
                        <Skull className="w-2.5 h-2.5" /> YIQILDI
                      </span>
                    )}

                    {isLeader && isRacing && racer.isAlive && (
                      <span className="hidden sm:inline text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/40 font-mono font-bold">
                        ⚡ OLDINDA
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Stats */}
                <div className="flex items-center gap-3 sm:gap-4 font-mono">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Trophy className="w-3 h-3" />
                    <span className="text-xs font-black">{racer.score || 0}</span>
                    <span className="text-[9px] text-slate-400">ball</span>
                  </div>

                  <div className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-black">{Math.floor(racer.distance || 0)}</span>
                    <span className="text-[9px] text-slate-400">m</span>
                  </div>

                  <div className="bg-slate-800 px-2 py-0.5 rounded-lg text-emerald-400 font-black text-[11px] border border-slate-700">
                    🌵 {racer.obstaclesDodged || 0}
                  </div>
                </div>
              </div>

              {/* Desert Mini Track */}
              <div className="relative h-11 sm:h-12 w-full bg-[#131a29] rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center px-2">
                {/* Track Ground Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-50" />
                <div className="absolute bottom-2 left-0 right-0 h-[2px] bg-amber-700/40" />

                {/* Finish / Milestone Flag on right */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <Flag className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[8px] font-mono text-amber-300 font-bold">REKORD</span>
                </div>

                {/* Animated Runner Dinosaur along Track */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 transition-all duration-150 ease-out"
                  style={{
                    left: `calc(12px + ${progress}% * 0.82)`
                  }}
                >
                  <div className={`relative px-2 py-1 rounded-xl flex items-center gap-1 shadow-md border ${
                    racer.isAlive
                      ? isPlayer1
                        ? 'bg-cyan-600/90 border-cyan-400 text-white'
                        : 'bg-amber-600/90 border-amber-400 text-white'
                      : 'bg-slate-800 border-rose-500/60 text-slate-400 opacity-70'
                  }`}>
                    <span className={`text-sm ${racer.isAlive ? 'animate-bounce' : ''}`}>
                      {racer.isAlive ? '🦖' : '💥'}
                    </span>
                    <span className="text-[10px] font-mono font-black">{Math.floor(racer.distance || 0)}m</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
