import React from 'react';
import { Crown, Medal, Award, CheckCircle2, Zap, Flame, Trophy } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export interface PodiumUser {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  country?: string;
  displayWpm: number;
  highestAccuracy: number;
  modeLabel: string;
  rank: number;
  isVerified?: boolean;
}

interface LeaderboardPodiumProps {
  topUsers: PodiumUser[];
  onSelectUser: (user: any) => void;
  currentUserId?: string;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  topUsers,
  onSelectUser,
  currentUserId
}) => {
  const { t } = useI18n();

  if (!topUsers || topUsers.length === 0) return null;

  const first = topUsers[0];
  const second = topUsers[1];
  const third = topUsers[2];

  return (
    <div className="w-full mb-8 pt-2">
      {/* Section Subtitle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
              <span>{t('podiumTitle')}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                TOP 3
              </span>
            </h3>
            <p className="text-xs text-[var(--sub-color)]">
              {t('podiumSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Podium Cards Grid: 2nd (left), 1st (center, elevated), 3rd (right) on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
        {/* 2-O'RIN (Silver) - Left Column */}
        {second ? (
          <div
            onClick={() => onSelectUser(second)}
            className={`order-2 md:order-1 relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center ${
              currentUserId === second.uid
                ? 'bg-gradient-to-b from-slate-400/20 via-slate-500/10 to-[var(--card-bg)] border-slate-300 ring-2 ring-slate-400/50 shadow-lg shadow-slate-400/10'
                : 'bg-gradient-to-b from-slate-400/15 via-slate-500/5 to-[var(--card-bg)] border-slate-400/40 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-400/10'
            }`}
          >
            {/* Medal Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-400/20 border border-slate-300/40 text-slate-200 text-xs font-mono font-bold mb-3">
              <span className="text-sm">🥈</span>
              <span>{t('podiumRank2')}</span>
            </div>

            {/* Avatar with Silver Ring */}
            <div className="relative mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 shadow-md">
                <img
                  src={second.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${second.uid}`}
                  alt={second.displayName}
                  className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md">
                2
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1 max-w-[200px] mb-1">
              <span className="font-bold text-sm sm:text-base text-[var(--text-color)] group-hover:text-cyan-300 transition-colors truncate">
                {second.displayName}
              </span>
              {second.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-3 truncate max-w-[180px]">
              @{second.username}
            </span>

            {/* Metrics */}
            <div className="w-full pt-3 border-t border-slate-400/20 flex items-center justify-around">
              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-200 tracking-tight">
                  {second.displayWpm}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  WPM
                </div>
              </div>
              <div className="h-7 w-px bg-slate-400/20" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-slate-300">
                  {second.highestAccuracy > 0 ? `${Number(second.highestAccuracy).toFixed(1)}%` : '100%'}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  {t('accLabel')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 hidden md:flex p-5 rounded-2xl border border-dashed border-[var(--sub-alt)] items-center justify-center text-xs text-[var(--sub-color)] h-64">
            2-o'rin bo'sh
          </div>
        )}

        {/* 1-O'RIN (Gold Champion) - Center Column (Taller & Prominent) */}
        {first ? (
          <div
            onClick={() => onSelectUser(first)}
            className={`order-1 md:order-2 relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center md:-translate-y-3 ${
              currentUserId === first.uid
                ? 'bg-gradient-to-b from-amber-500/25 via-amber-600/10 to-[var(--card-bg)] border-amber-300 ring-2 ring-amber-400/60 shadow-2xl shadow-amber-500/25'
                : 'bg-gradient-to-b from-amber-500/20 via-amber-600/5 to-[var(--card-bg)] border-amber-400/60 hover:border-amber-300 shadow-xl shadow-amber-500/15 hover:shadow-2xl hover:shadow-amber-500/25'
            }`}
          >
            {/* Top Crown Floater */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#090d16] text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>{t('podiumRank1')}</span>
            </div>

            {/* Avatar with Gold Glowing Ring */}
            <div className="relative mt-2 mb-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 shadow-xl shadow-amber-500/30">
                <img
                  src={first.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${first.uid}`}
                  alt={first.displayName}
                  className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-[#090d16] font-black text-sm flex items-center justify-center shadow-lg">
                1
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1.5 max-w-[220px] mb-1">
              <span className="font-extrabold text-base sm:text-lg text-[var(--text-color)] group-hover:text-amber-300 transition-colors truncate">
                {first.displayName}
              </span>
              {first.isVerified && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>
            <span className="text-xs text-amber-300/80 font-mono mb-3 truncate max-w-[190px]">
              @{first.username}
            </span>

            {/* Metrics */}
            <div className="w-full pt-3.5 border-t border-amber-400/20 flex items-center justify-around">
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)] tracking-tight">
                  {first.displayWpm}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-amber-300/80 font-bold">
                  WPM
                </div>
              </div>
              <div className="h-8 w-px bg-amber-400/20" />
              <div>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-200">
                  {first.highestAccuracy > 0 ? `${Number(first.highestAccuracy).toFixed(1)}%` : '100%'}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-amber-300/80 font-bold">
                  {t('accLabel')}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3-O'RIN (Bronze) - Right Column */}
        {third ? (
          <div
            onClick={() => onSelectUser(third)}
            className={`order-3 relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center ${
              currentUserId === third.uid
                ? 'bg-gradient-to-b from-amber-800/20 via-amber-900/10 to-[var(--card-bg)] border-amber-700 ring-2 ring-amber-700/50 shadow-lg shadow-amber-900/20'
                : 'bg-gradient-to-b from-amber-800/15 via-amber-900/5 to-[var(--card-bg)] border-amber-700/40 hover:border-amber-600 hover:shadow-lg hover:shadow-amber-900/20'
            }`}
          >
            {/* Medal Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-800/20 border border-amber-700/40 text-amber-300 text-xs font-mono font-bold mb-3">
              <span className="text-sm">🥉</span>
              <span>{t('podiumRank3')}</span>
            </div>

            {/* Avatar with Bronze Ring */}
            <div className="relative mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 shadow-md">
                <img
                  src={third.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${third.uid}`}
                  alt={third.displayName}
                  className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md">
                3
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1 max-w-[200px] mb-1">
              <span className="font-bold text-sm sm:text-base text-[var(--text-color)] group-hover:text-amber-400 transition-colors truncate">
                {third.displayName}
              </span>
              {third.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-3 truncate max-w-[180px]">
              @{third.username}
            </span>

            {/* Metrics */}
            <div className="w-full pt-3 border-t border-amber-700/20 flex items-center justify-around">
              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight">
                  {third.displayWpm}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  WPM
                </div>
              </div>
              <div className="h-7 w-px bg-amber-700/20" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-amber-200">
                  {third.highestAccuracy > 0 ? `${Number(third.highestAccuracy).toFixed(1)}%` : '100%'}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  {t('accLabel')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-3 hidden md:flex p-5 rounded-2xl border border-dashed border-[var(--sub-alt)] items-center justify-center text-xs text-[var(--sub-color)] h-64">
            3-o'rin bo'sh
          </div>
        )}
      </div>
    </div>
  );
};
