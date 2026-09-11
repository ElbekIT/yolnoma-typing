import React, { useState, useEffect } from 'react';
import { Trophy, Crown, ArrowRight, LogIn, Flame, Sparkles, UserCheck } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';

interface LeaderboardEntry {
  uid: string;
  name: string;
  username: string;
  avatar?: string;
  wpm: number;
  accuracy: number;
}

const DEFAULT_CHAMPIONS: LeaderboardEntry[] = [
  { uid: 'u1', name: 'Jasur_Dev', username: 'jasur_dev', wpm: 136, accuracy: 99 },
  { uid: 'u2', name: 'CyberUz', username: 'cyber_uz', wpm: 124, accuracy: 98 },
  { uid: 'u3', name: 'Alisher_K', username: 'alisher_k', wpm: 115, accuracy: 97 },
  { uid: 'u4', name: 'Shahzoda_T', username: 'shahzoda_t', wpm: 108, accuracy: 98 },
  { uid: 'u5', name: 'Bekzod_Speed', username: 'bekzod_speed', wpm: 99, accuracy: 96 }
];

interface MiniLeaderboardProps {
  onViewFullLeaderboard: () => void;
  onOpenLogin: () => void;
}

export const MiniLeaderboard: React.FC<MiniLeaderboardProps> = ({
  onViewFullLeaderboard,
  onOpenLogin
}) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>(DEFAULT_CHAMPIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const lbRef = ref(rtdb, 'leaderboard');
      const bansRef = ref(rtdb, 'bannedUsers');

      const unsubscribe = onValue(lbRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: LeaderboardEntry[] = [];

          Object.keys(data).forEach((key) => {
            const u = data[key];
            if (!u) return;
            const wpm = Number(u.highestWpm) || Number(u.wpm) || 0;
            if (wpm > 0 && !u.isBanned && !u.isBlocked) {
              list.push({
                uid: u.uid || key,
                name: u.displayName || u.username || 'Foydalanuvchi',
                username: u.username || 'foydalanuvchi',
                avatar: u.avatarUrl || u.photoURL,
                wpm: Math.min(wpm, 250), // Realistic cap
                accuracy: Number(u.highestAccuracy) || 97
              });
            }
          });

          // Sort descending by highest WPM
          list.sort((a, b) => b.wpm - a.wpm);

          if (list.length >= 5) {
            setTopUsers(list.slice(0, 5));
          } else if (list.length > 0) {
            // Merge with default list for clean visual structure
            const combined = [...list, ...DEFAULT_CHAMPIONS.slice(list.length)].slice(0, 5);
            setTopUsers(combined);
          }
        }
        setLoading(false);
      }, (error) => {
        console.warn('MiniLeaderboard fetch note:', error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold text-xs shadow-sm shadow-amber-400/20">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
          </div>
        );
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-300/20 border border-slate-300/50 flex items-center justify-center text-slate-200 font-bold text-xs">
            2
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-700/20 border border-amber-600/50 flex items-center justify-center text-amber-400 font-bold text-xs">
            3
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-mono text-xs">
            {index + 1}
          </div>
        );
    }
  };

  const userPersonalBest = profile?.highestWpm || 0;

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#101726]/90 via-[#0d1320]/95 to-[#090d16] border border-cyan-500/25 p-5 shadow-xl shadow-black/60 backdrop-blur-md overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative flex items-center justify-between pb-3.5 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-400/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{t('miniLeaderboardTitle')}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-gray-400 font-sans line-clamp-1">
              {t('miniLeaderboardSub')}
            </p>
          </div>
        </div>

        <button
          onClick={onViewFullLeaderboard}
          className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer group shrink-0"
        >
          <span className="hidden sm:inline">{t('viewFullLeaderboard').replace(' →', '')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Top 5 List */}
      <div className="relative py-3 space-y-2">
        {topUsers.map((item, idx) => {
          const isCurrentUser = user && (user.uid === item.uid);
          return (
            <div
              key={item.uid || idx}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-150 ${
                isCurrentUser
                  ? 'bg-cyan-500/15 border-cyan-400/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-[#131b2c]/50 hover:bg-[#152033]/80 border-white/5 hover:border-cyan-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getRankBadge(idx)}

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-400/30 overflow-hidden flex items-center justify-center text-xs font-bold text-cyan-200 shrink-0">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{item.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>

                {/* User details */}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-100 truncate flex items-center gap-1">
                    <span>{item.name}</span>
                    {idx === 0 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                        TOP 1
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    @{item.username.replace('@', '')} • {item.accuracy}% aniq
                  </div>
                </div>
              </div>

              {/* WPM badge */}
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <div className="px-2.5 py-1 rounded-lg bg-[#090d16] border border-cyan-500/30 flex items-center gap-1 font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-sm font-extrabold text-cyan-300">{item.wpm}</span>
                  <span className="text-[10px] text-gray-400">WPM</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action / User Status */}
      <div className="relative pt-3 border-t border-cyan-500/15">
        {user ? (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] text-gray-300 font-sans">
                <span className="font-bold text-white">{profile?.displayName || 'Siz'}</span> •{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  {userPersonalBest > 0 ? `${userPersonalBest} WPM` : 'Yangi'}
                </span>
              </div>
            </div>
            <button
              onClick={onViewFullLeaderboard}
              className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
            >
              {t('viewFullLeaderboard')}
            </button>
          </div>
        ) : (
          <div className="bg-[#101726] border border-cyan-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-[11px] text-gray-300 font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('joinLeaderboardText')}</span>
            </div>
            <button
              onClick={() => signInWithGoogle().catch(() => onOpenLogin())}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#090d16] font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('loginWithGoogle')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
