import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Zap,
  Flame,
  X,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Shield,
  Rocket
} from 'lucide-react';
import { SpaceScoreRecord, getTopSpaceScores } from '../../utils/spaceLeaderboard';

interface SpaceLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const SpaceLeaderboardModal: React.FC<SpaceLeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserId
}) => {
  const [scores, setScores] = useState<SpaceScoreRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScores = async () => {
    setIsLoading(true);
    try {
      const list = await getTopSpaceScores(10);
      setScores(list);
    } catch (e) {
      console.error('Error fetching space scores:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#090d1f] border-2 border-cyan-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/80 text-white space-y-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                <span>🏆 Koinot Qahramonlari</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  TOP 10
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Koinot Jangida eng yuqori natija ko'rsatgan eng tezkor merganlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchScores}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
              title="Yangilash"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Peshqadamlar natijalari yuklanmoqda...</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Hali natijalar mavjud emas. Birinchi bo'lib rekord o'rnating!
            </div>
          ) : (
            scores.map((item, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              const isCurrentUser = currentUserId && item.uid === currentUserId;

              return (
                <div
                  key={item.id || `${item.uid}_${index}`}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400'
                      : isFirst
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 border-amber-500/50 shadow-md shadow-amber-900/20'
                      : isSecond
                      ? 'bg-gradient-to-r from-slate-800/50 via-slate-900/90 to-slate-900/90 border-slate-500/40'
                      : isThird
                      ? 'bg-gradient-to-r from-orange-950/30 via-slate-900/90 to-slate-900/90 border-orange-700/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  {/* Left: Rank & Player Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0 ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950 shadow-md'
                          : isThird
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${index + 1}`}
                    </div>

                    {/* Avatar */}
                    <img
                      src={item.playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.playerName}`}
                      alt={item.playerName}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-cyan-500/30 bg-slate-950 object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    {/* Name & Wave Info */}
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{item.playerName}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 font-mono">
                            Siz
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">To'lqin {item.wave}</span>
                        <span>•</span>
                        <span>{item.wpm} WPM</span>
                        <span>•</span>
                        <span>{item.accuracy}% aniqlik</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-sm sm:text-base font-black text-amber-400 font-mono tracking-wide">
                      {item.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">
                      BALL
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Rocket className="w-3.5 h-3.5" />
            <span>Koinotda yangi rekord qo'ying!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
