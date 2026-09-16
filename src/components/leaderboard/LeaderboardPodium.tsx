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
  scoreLabel?: string;
  scoreValue?: string | number;
  subStatLabel?: string;
  subStatValue?: string | number;
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
            className={`order-2 md:order-1 relative p-4 rounded-xl border transition-colors cursor-pointer group flex flex-col items-center text-center ${
              currentUserId === second.uid
                ? 'bg-[var(--card-bg)] border-slate-300'
                : 'bg-[var(--card-bg)] border-slate-400/30 hover:border-slate-300'
            }`}
          >
            {/* Medal Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-400/15 border border-slate-300/30 text-slate-200 text-xs font-mono font-bold mb-2.5">
              <span>🥈</span>
              <span>{t('podiumRank2')}</span>
            </div>

            {/* Avatar with Silver Ring */}
            <div className="relative mb-2.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-slate-300">
                <img
                  src={second.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${second.uid}`}
                  alt={second.displayName}
                  className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center">
                2
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1 max-w-[180px] mb-0.5">
              <span className="font-bold text-sm text-[var(--text-color)] truncate">
                {second.displayName}
              </span>
              {second.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-2.5 truncate max-w-[160px]">
              @{second.username}
            </span>

            {/* Metrics */}
            <div className="w-full pt-2.5 border-t border-[var(--sub-alt)]/40 flex items-center justify-around">
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-200 tracking-tight">
                  {second.scoreValue !== undefined ? second.scoreValue : second.displayWpm}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  {second.scoreLabel || 'WPM'}
                </div>
              </div>
              <div className="h-6 w-px bg-[var(--sub-alt)]/40" />
              <div>
                <div className="text-sm font-bold font-mono text-slate-300">
                  {second.subStatValue !== undefined ? second.subStatValue : (second.highestAccuracy > 0 ? `${Number(second.highestAccuracy).toFixed(1)}%` : '100%')}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  {second.subStatLabel || t('accLabel')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 flex flex-col p-4 rounded-xl border border-dashed border-slate-500/30 bg-slate-500/5 items-center justify-center text-center space-y-2 min-h-[180px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-400/10 border border-slate-400/20 text-slate-400 text-xs font-mono font-bold">
              <span>🥈 2-o'rin</span>
              <span className="text-[10px] text-slate-500">(Ochiq)</span>
            </div>
            <div className="w-12 h-12 rounded-full border border-dashed border-slate-400/30 flex items-center justify-center text-slate-500 text-lg font-mono">
              ?
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-300">Kumush pog'ona bo'sh</p>
              <p className="text-[10px] text-[var(--sub-color)] max-w-[160px]">
                Natijangizni ko'rsatib, 2-o'rinni egallang!
              </p>
            </div>
          </div>
        )}

        {/* 1-O'RIN (Gold Champion) - Center Column */}
        {first ? (
          <div
            onClick={() => onSelectUser(first)}
            className={`order-1 md:order-2 relative p-5 rounded-xl border transition-colors cursor-pointer group flex flex-col items-center text-center ${
              currentUserId === first.uid
                ? 'bg-[var(--card-bg)] border-amber-400'
                : 'bg-[var(--card-bg)] border-amber-400/60 hover:border-amber-400'
            }`}
          >
            {/* Top Crown Floater */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-[#090d16] text-xs font-black tracking-wider uppercase flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" />
              <span>{t('podiumRank1')}</span>
            </div>

            {/* Avatar with Gold Ring */}
            <div className="relative mt-1 mb-2.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-amber-400">
                <img
                  src={first.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${first.uid}`}
                  alt={first.displayName}
                  className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-[#090d16] font-black text-xs flex items-center justify-center">
                1
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1 max-w-[200px] mb-0.5">
              <span className="font-bold text-base text-[var(--text-color)] truncate">
                {first.displayName}
              </span>
              {first.isVerified && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>
            <span className="text-xs text-amber-300/90 font-mono mb-2.5 truncate max-w-[170px]">
              @{first.username}
            </span>

            {/* Metrics */}
            <div className="w-full pt-2.5 border-t border-[var(--sub-alt)]/40 flex items-center justify-around">
              <div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight">
                  {first.scoreValue !== undefined ? first.scoreValue : first.displayWpm}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-mono text-amber-300 font-bold">
                  {first.scoreLabel || 'WPM'}
                </div>
              </div>
              <div className="h-6 w-px bg-[var(--sub-alt)]/40" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-amber-200">
                  {first.subStatValue !== undefined ? first.subStatValue : (first.highestAccuracy > 0 ? `${Number(first.highestAccuracy).toFixed(1)}%` : '100%')}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-mono text-amber-300 font-bold">
                  {first.subStatLabel || t('accLabel')}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3-O'RIN (Bronze) - Right Column */}
        {third ? (
          <div
            onClick={() => onSelectUser(third)}
            className={`order-3 relative p-4 rounded-xl border transition-colors cursor-pointer group flex flex-col items-center text-center ${
              currentUserId === third.uid
                ? 'bg-[var(--card-bg)] border-amber-600'
                : 'bg-[var(--card-bg)] border-amber-700/40 hover:border-amber-600'
            }`}
          >
            {/* Medal Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-800/20 border border-amber-700/30 text-amber-300 text-xs font-mono font-bold mb-2.5">
              <span className="text-sm">🥉</span>
              <span>{t('podiumRank3')}</span>
            </div>

            {/* Avatar with Bronze Ring */}
            <div className="relative mb-2.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-amber-700">
                <img
                  src={third.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${third.uid}`}
                  alt={third.displayName}
                  className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center">
                3
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1 max-w-[180px] mb-0.5">
              <span className="font-bold text-sm text-[var(--text-color)] truncate">
                {third.displayName}
              </span>
              {third.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-2.5 truncate max-w-[160px]">
              @{third.username}
            </span>

            {/* Metrics */}
            <div className="w-full pt-2.5 border-t border-[var(--sub-alt)]/40 flex items-center justify-around">
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 tracking-tight">
                  {third.scoreValue !== undefined ? third.scoreValue : third.displayWpm}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  {third.scoreLabel || 'WPM'}
                </div>
              </div>
              <div className="h-6 w-px bg-[var(--sub-alt)]/40" />
              <div>
                <div className="text-sm font-bold font-mono text-amber-200">
                  {third.subStatValue !== undefined ? third.subStatValue : (third.highestAccuracy > 0 ? `${Number(third.highestAccuracy).toFixed(1)}%` : '100%')}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--sub-color)]">
                  {third.subStatLabel || t('accLabel')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-3 flex flex-col p-4 rounded-xl border border-dashed border-amber-800/30 bg-amber-900/5 items-center justify-center text-center space-y-2 min-h-[180px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-800/10 border border-amber-800/20 text-amber-500 text-xs font-mono font-bold">
              <span>🥉 3-o'rin</span>
              <span className="text-[10px] text-amber-600">(Ochiq)</span>
            </div>
            <div className="w-12 h-12 rounded-full border border-dashed border-amber-700/30 flex items-center justify-center text-amber-600 text-lg font-mono">
              ?
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-amber-300">Bronza pog'ona bo'sh</p>
              <p className="text-[10px] text-[var(--sub-color)] max-w-[160px]">
                TOP 3 talikka kirish uchun shohsupani egallang!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
