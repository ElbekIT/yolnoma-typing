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
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>(() => cachedMiniList || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedMiniList);

  useEffect(() => {
    // If cached in last 2 minutes, use cache directly
    if (cachedMiniList && Date.now() - lastMiniFetchTime < 120000) {
      return;
    }

    let isMounted = true;
    const fetchTop = async () => {
      try {
        // Fast Tier 1: /api/leaderboard endpoint (server-cached and synchronized with RTDB)
        try {
          const apiRes = await fetch('/api/leaderboard?limit=5');
          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            if (apiJson.success && Array.isArray(apiJson.leaderboard) && apiJson.leaderboard.length > 0) {
              const formatted: LeaderboardEntry[] = apiJson.leaderboard.slice(0, 5).map((u: any) => ({
                uid: u.uid,
                name: u.displayName || u.username || 'Foydalanuvchi',
                username: u.username || 'user',
                avatar: u.avatarUrl || u.photoURL,
                wpm: u.highestWpm,
                accuracy: u.highestAccuracy || 98
              }));
              cachedMiniList = formatted;
              lastMiniFetchTime = Date.now();
              if (isMounted) {
                setTopUsers(formatted);
                setIsLoading(false);
              }
            }
          }
        } catch {
          // Continue to RTDB fetch
        }

        // Tier 2: Realtime Database leaderboard fallback (Merge seamlessly by uid)
        const entryMap = new Map<string, LeaderboardEntry>();
        if (cachedMiniList && cachedMiniList.length > 0) {
          cachedMiniList.forEach((e) => entryMap.set(e.uid, e));
        }

        try {
          const lbSnap = await get(ref(rtdb, 'leaderboard'));
          if (lbSnap.exists()) {
            const lbVal = lbSnap.val() || {};
            Object.keys(lbVal).forEach((uid) => {
              if (
                !uid ||
                uid.startsWith('guest_') ||
                uid.startsWith('bot_') ||
                uid.startsWith('ai_') ||
                uid.startsWith('seed_') ||
                uid.startsWith('dummy_') ||
                uid.startsWith('fake_') ||
                uid === 'guest'
              ) {
                return;
              }
              const lb = lbVal[uid] || {};
              if (lb.isGuest || lb.isBot || lb.isBanned || lb.isBlocked) return;
              const wpm = Number(lb.highestWpm || lb.wpm || 0);
              if (wpm <= 0 || wpm > 280) return;
              const existing = entryMap.get(uid);
              entryMap.set(uid, {
                uid,
                name: lb.displayName || lb.username || existing?.name || 'Foydalanuvchi',
                username: lb.username || existing?.username || 'user',
                avatar: lb.avatarUrl || lb.photoURL || existing?.avatar,
                wpm: Math.max(wpm, existing?.wpm || 0),
                accuracy: Math.min(100, Math.max(0, Number(lb.highestAccuracy || existing?.accuracy || 98)))
              });
            });
          }
        } catch {
          // Handled
        }

        // Also ensure current user is represented if eligible
        if (user?.uid && !user.uid.startsWith('bot_')) {
          const myWpm = Math.max(Number(profile?.highestWpm || 0), Number(profile?.averageWpm || 0));
          if (myWpm > 0 && myWpm <= 280) {
            const existing = entryMap.get(user.uid);
            entryMap.set(user.uid, {
              uid: user.uid,
              name: profile?.displayName || profile?.username || existing?.name || 'Siz',
              username: profile?.username || existing?.username || 'siz',
              avatar: profile?.avatarUrl || profile?.photoURL || existing?.avatar,
              wpm: Math.max(myWpm, existing?.wpm || 0),
              accuracy: Math.min(100, Math.max(0, Number(profile?.highestAccuracy || existing?.accuracy || 98)))
            });
          }
        }

        let list = Array.from(entryMap.values());

        list.sort((a, b) => b.wpm - a.wpm);
        const finalList = list.slice(0, 5);

        if (finalList.length > 0) {
          cachedMiniList = finalList;
          lastMiniFetchTime = Date.now();
          if (isMounted) {
            setTopUsers(finalList);
          }
        }
      } catch (err) {
        console.error('MiniLeaderboard fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTop();
    return () => { isMounted = false; };
  }, [user, profile]);

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
      {topUsers.length === 0 ? (
        <div className="py-7 px-4 my-2 rounded-xl bg-[var(--bg-color)]/50 border border-dashed border-[var(--sub-alt)]/60 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-color)] font-mono">
            Hozircha natijalar yo'q
          </h4>
          <p className="text-[11px] text-[var(--sub-color)] max-w-xs mt-0.5 leading-relaxed">
            Test topshiring va birinchi bo'lib milliy reytingda o'rin egallang!
          </p>
        </div>
      ) : (
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
      )}

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

