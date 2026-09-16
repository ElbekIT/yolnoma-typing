import React, { useState, useEffect } from 'react';
import { Trophy, Crown, ArrowRight, LogIn, Flame, Sparkles, UserCheck } from 'lucide-react';
import { ref, get } from 'firebase/database';
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

let cachedMiniList: LeaderboardEntry[] | null = null;
let lastMiniFetchTime = 0;

interface MiniLeaderboardProps {
  onViewFullLeaderboard: () => void;
  onOpenLogin: () => void;
}

export const MiniLeaderboard = React.memo<MiniLeaderboardProps>(({
  onViewFullLeaderboard,
  onOpenLogin
}) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>(() => cachedMiniList || DEFAULT_CHAMPIONS);

  useEffect(() => {
    // If cached in last 2 minutes, use cache directly
    if (cachedMiniList && Date.now() - lastMiniFetchTime < 120000) {
      return;
    }

    let isMounted = true;
    const fetchTop = async () => {
      try {
        const usersSnap = await get(ref(rtdb, 'users'));
        if (!isMounted) return;

        if (usersSnap.exists()) {
          const data = usersSnap.val();
          const list: LeaderboardEntry[] = [];

          Object.keys(data).forEach((key) => {
            const u = data[key];
            if (!u || u.isBanned || u.isBlocked) return;
            const wpm = Number(u.highestWpm) || Number(u.wpm) || 0;
            if (wpm > 0 && wpm <= 260) {
              list.push({
                uid: u.uid || key,
                name: u.displayName || u.username || 'Foydalanuvchi',
                username: u.username || 'foydalanuvchi',
                avatar: u.avatarUrl || u.photoURL,
                wpm: Math.min(wpm, 260),
                accuracy: Math.min(100, Number(u.highestAccuracy) || 97)
              });
            }
          });

          list.sort((a, b) => b.wpm - a.wpm);
          const finalList = list.length >= 5 ? list.slice(0, 5) : [...list, ...DEFAULT_CHAMPIONS.slice(list.length)].slice(0, 5);
          cachedMiniList = finalList;
          lastMiniFetchTime = Date.now();
          setTopUsers(finalList);
        }
      } catch (err) {
        console.warn('MiniLeaderboard fetch note:', err);
      }
    };

    fetchTop();
    return () => { isMounted = false; };
  }, []);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
            <Crown className="w-3 h-3 text-amber-300" />
          </div>
        );
      case 1:
        return (
          <div className="w-5 h-5 rounded-full bg-slate-300/20 border border-slate-300/40 flex items-center justify-center text-slate-200 font-bold text-[11px]">
            2
          </div>
        );
      case 2:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-700/20 border border-amber-600/40 flex items-center justify-center text-amber-400 font-bold text-[11px]">
            3
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] flex items-center justify-center text-[var(--sub-color)] font-mono text-[11px]">
            {index + 1}
          </div>
        );
    }
  };

  const userPersonalBest = profile?.highestWpm || 0;

  return (
    <div className="relative rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)]/60 p-4 sm:p-5 flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--sub-alt)]/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-color)] tracking-tight flex items-center gap-1.5">
              <span>{t('miniLeaderboardTitle')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h3>
            <p className="text-[11px] text-[var(--sub-color)] font-sans line-clamp-1">
              {t('miniLeaderboardSub')}
            </p>
          </div>
        </div>

        <button
          onClick={onViewFullLeaderboard}
          className="text-xs font-mono font-semibold text-[var(--main-color)] hover:brightness-110 flex items-center gap-1 transition-colors cursor-pointer group shrink-0"
        >
          <span className="hidden sm:inline">{t('viewFullLeaderboard').replace(' →', '')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Top 5 List */}
      <div className="py-2.5 space-y-1.5">
        {topUsers.map((item, idx) => {
          const isCurrentUser = user && (user.uid === item.uid);
          return (
            <div
              key={item.uid || idx}
              className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                isCurrentUser
                  ? 'bg-[var(--main-color)]/10 border-[var(--main-color)]/40'
                  : 'bg-[var(--bg-color)]/80 hover:bg-[var(--sub-alt)]/40 border-[var(--sub-alt)]/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getRankBadge(idx)}

                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[var(--main-color)] shrink-0">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <span>{item.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>

                {/* User details */}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[var(--text-color)] truncate flex items-center gap-1">
                    <span>{item.name}</span>
                    {idx === 0 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                        TOP 1
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--sub-color)] font-mono">
                    @{item.username.replace('@', '')} • {item.accuracy}%
                  </div>
                </div>
              </div>

              {/* WPM badge */}
              <div className="flex items-center gap-1 shrink-0 pl-2 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs sm:text-sm font-extrabold text-[var(--main-color)]">{item.wpm}</span>
                <span className="text-[9px] text-[var(--sub-color)]">WPM</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action / User Status */}
      <div className="pt-2.5 border-t border-[var(--sub-alt)]/40">
        {user ? (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-3 h-3" />
              </div>
              <div className="text-[11px] text-[var(--sub-color)] font-sans">
                <span className="font-bold text-[var(--text-color)]">{profile?.displayName || 'Siz'}</span> •{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  {userPersonalBest > 0 ? `${userPersonalBest} WPM` : 'Yangi'}
                </span>
              </div>
            </div>
            <button
              onClick={onViewFullLeaderboard}
              className="text-[11px] font-mono text-[var(--main-color)] hover:underline cursor-pointer"
            >
              {t('viewFullLeaderboard')}
            </button>
          </div>
        ) : (
          <div className="bg-[var(--bg-color)] border border-[var(--sub-alt)]/50 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] text-[var(--sub-color)] font-sans flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('joinLeaderboardText')}</span>
            </div>
            <button
              onClick={() => signInWithGoogle().catch(() => onOpenLogin())}
              className="px-3 py-1.5 rounded-lg bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogIn className="w-3 h-3" />
              <span>{t('loginWithGoogle')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

