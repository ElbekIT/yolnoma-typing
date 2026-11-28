import React from 'react';
import { Crown, Medal, Award, CheckCircle2, Zap, Flame, Trophy, Sparkles, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
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
  level?: number;
  rankTitle?: string;
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

  const triggerChampionConfetti = (e: React.MouseEvent, user: PodiumUser) => {
    e.stopPropagation();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#10b981']
      });
    } catch {
      // safe fallback
    }
    onSelectUser(user);
  };

  const getTierBadge = (wpm: number) => {
    if (wpm >= 140) return { label: 'Afsonaviy', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    if (wpm >= 110) return { label: 'Grandmaster', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' };
    if (wpm >= 85) return { label: 'Master', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
    if (wpm >= 60) return { label: 'Pro', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    return { label: 'Teruvchi', color: 'bg-[var(--sub-alt)]/40 text-[var(--sub-color)] border-[var(--sub-alt)]' };
  };

  return (
    <div className="w-full mb-8 pt-1">
      {/* Section Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--main-color)]/15 flex items-center justify-center text-[var(--main-color)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] tracking-tight">
                {t('podiumTitle')}
              </h3>
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--main-color)]/15 text-[var(--main-color)] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--main-color)]" />
                TOP 3 SHOHSUPA
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              Eng nufuzli teruvchilar va respublika rekordchilari
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[var(--sub-color)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Jonli reyting pog'onasi</span>
        </div>
      </div>

      {/* Podium Cards Grid: 2nd (left), 1st (center, tallest), 3rd (right) on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-end max-w-4xl mx-auto">
        {/* ========================================================================= */}
        {/* 2-O'RIN (SILVER - KUMUSH) - Left Column                                   */}
        {/* ========================================================================= */}
        {second ? (
          <div
            onClick={() => onSelectUser(second)}
            className={`order-2 md:order-1 relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center overflow-hidden bg-[var(--card-bg)] ${
              currentUserId === second.uid
                ? 'border-slate-300 shadow-sm ring-2 ring-slate-400/40'
                : 'border-[var(--sub-alt)] hover:border-slate-300 hover:shadow-sm hover:-translate-y-1'
            }`}
          >
            {/* Top ambient glare */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-slate-400/10 to-transparent pointer-events-none" />

            {/* Medal Pill Badge */}
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--sub-alt)]/60 text-[var(--text-color)] text-xs font-mono font-bold mb-3">
              <Medal className="w-3.5 h-3.5 text-slate-400 fill-slate-400/30" />
              <span>2-O'RIN • KUMUSH</span>
            </div>

            {/* Avatar with Silver Pedestal Ring */}
            <div className="relative mb-3">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-1 bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400">
                <img
                  src={second.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${second.uid}`}
                  alt={second.displayName}
                  className="w-full h-full rounded-xl object-cover bg-[var(--card-bg)]"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center">
                2
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-center gap-1.5 max-w-[200px] mb-0.5">
              <span className="font-bold text-sm text-[var(--text-color)] truncate group-hover:text-[var(--main-color)] transition-colors">
                {second.displayName}
              </span>
              {second.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-2 truncate max-w-[170px]">
              @{second.username}
            </span>

            {/* Tier Badge */}
            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold mb-3.5 ${getTierBadge(second.displayWpm).color}`}>
              {getTierBadge(second.displayWpm).label}
            </div>

            {/* Metrics Pedestal Strip */}
            <div className="w-full pt-3 flex items-center justify-around bg-[var(--sub-alt)]/25 rounded-2xl px-2 py-2">
              <div className="text-center">
                <div className="text-2xl font-black font-mono text-[var(--text-color)] tracking-tight flex items-center justify-center gap-1">
                  <span>{second.scoreValue !== undefined ? second.scoreValue : second.displayWpm}</span>
                  <Zap className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)] font-semibold">
                  {second.scoreLabel || 'WPM'}
                </div>
              </div>
              <div className="h-8 w-px bg-[var(--sub-alt)]" />
              <div className="text-center">
                <div className="text-base font-bold font-mono text-[var(--text-color)]">
                  {second.subStatValue !== undefined ? second.subStatValue : (second.highestAccuracy > 0 ? `${Number(second.highestAccuracy).toFixed(1)}%` : '100%')}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)] font-semibold">
                  {second.subStatLabel || t('accLabel')}
                </div>
              </div>
            </div>

            {/* Inspect hover action */}
            <div className="mt-3 text-[11px] font-mono text-[var(--sub-color)] group-hover:text-[var(--main-color)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <span>Profilni ko'rish</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 flex flex-col p-6 rounded-3xl border border-dashed border-slate-500/30 bg-slate-500/5 items-center justify-center text-center space-y-2.5 min-h-[220px]">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-400/10 text-slate-400 text-xs font-mono font-bold">
              <span>🥈 2-o'rin</span>
              <span className="text-[10px] text-slate-500">(Ochiq)</span>
            </div>
            <div className="w-14 h-14 rounded-2xl border border-dashed border-slate-400/30 flex items-center justify-center text-slate-500 text-xl font-mono">
              ?
            </div>
            <p className="text-xs font-bold text-slate-300">Kumush pog'ona bo'sh</p>
            <p className="text-[11px] text-[var(--sub-color)] max-w-[160px]">
              Natijangizni ko'rsatib, 2-o'rinni egallang!
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1-O'RIN (GOLD CHAMPION - OLTIN CHEMPION) - Center Column (Tallest/Elevated) */}
        {/* ========================================================================= */}
        {first ? (
          <div
            onClick={(e) => triggerChampionConfetti(e, first)}
            className={`order-1 md:order-2 relative p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center overflow-hidden shadow-sm bg-[var(--card-bg)] ${
              currentUserId === first.uid
                ? 'border-[var(--main-color)] shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-2 ring-[var(--main-color)]/60'
                : 'border-[var(--main-color)]/80 hover:border-[var(--main-color)] hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:-translate-y-2'
            }`}
          >
            {/* Top crown aura */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--main-color)]/20 via-[var(--main-color)]/5 to-transparent pointer-events-none" />

            {/* Glowing Top Floating Crown Banner */}
            <div className="relative -mt-2 mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase flex items-center gap-2">
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>{t('podiumRank1')} • CHEMPION</span>
            </div>

            {/* Champion Avatar with Radiant Halo Ring */}
            <div className="relative mb-3 mt-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1.5 bg-gradient-to-tr from-amber-500 via-amber-200 to-yellow-400">
                <img
                  src={first.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${first.uid}`}
                  alt={first.displayName}
                  className="w-full h-full rounded-2xl object-cover bg-[var(--card-bg)]"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center">
                1
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-center gap-1.5 max-w-[220px] mb-0.5">
              <span className="font-black text-base sm:text-lg text-[var(--text-color)] truncate group-hover:text-[var(--main-color)] transition-colors">
                {first.displayName}
              </span>
              {first.isVerified && <CheckCircle2 className="w-4 h-4 text-[var(--main-color)] shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-2 truncate max-w-[190px]">
              @{first.username}
            </span>

            {/* Tier Badge */}
            <div className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[var(--main-color)]/20 text-[var(--main-color)] mb-4 flex items-center gap-1">
              <Flame className="w-3 h-3 text-[var(--main-color)] fill-current" />
              <span>{getTierBadge(first.displayWpm).label} • {first.displayWpm >= 120 ? 'Rekordchi' : 'Lider'}</span>
            </div>

            {/* Metrics Pedestal Strip */}
            <div className="w-full pt-3 flex items-center justify-around bg-[var(--sub-alt)]/30 rounded-2xl px-3 py-2.5">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono text-[var(--main-color)] tracking-tight flex items-center justify-center gap-1">
                  <span>{first.scoreValue !== undefined ? first.scoreValue : first.displayWpm}</span>
                  <Flame className="w-5 h-5 text-[var(--main-color)] fill-[var(--main-color)]/30" />
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)] font-bold">
                  {first.scoreLabel || 'WPM (TEZLIK)'}
                </div>
              </div>
              <div className="h-10 w-px bg-[var(--sub-alt)]" />
              <div className="text-center">
                <div className="text-base sm:text-lg font-black font-mono text-[var(--text-color)]">
                  {first.subStatValue !== undefined ? first.subStatValue : (first.highestAccuracy > 0 ? `${Number(first.highestAccuracy).toFixed(1)}%` : '100%')}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)] font-bold">
                  {first.subStatLabel || t('accLabel')}
                </div>
              </div>
            </div>

            {/* Inspect hover action */}
            <div className="mt-3.5 text-xs font-mono text-[var(--main-color)] flex items-center gap-1.5 opacity-90 group-hover:scale-105 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-bold">Chempionni tabriklash</span>
            </div>
          </div>
        ) : null}

        {/* ========================================================================= */}
        {/* 3-O'RIN (BRONZE - BRONZA) - Right Column                                  */}
        {/* ========================================================================= */}
        {third ? (
          <div
            onClick={() => onSelectUser(third)}
            className={`order-3 relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center overflow-hidden bg-[var(--card-bg)] ${
              currentUserId === third.uid
                ? 'border-amber-600 shadow-sm ring-2 ring-amber-600/40'
                : 'border-[var(--sub-alt)] hover:border-amber-600 hover:shadow-sm hover:-translate-y-1'
            }`}
          >
            {/* Top ambient glare */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-amber-700/10 to-transparent pointer-events-none" />

            {/* Medal Pill Badge */}
            <div className="relative inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--sub-alt)]/60 text-[var(--text-color)] text-xs font-mono font-bold mb-3">
              <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-600/30" />
              <span>3-O'RIN • BRONZA</span>
            </div>

            {/* Avatar with Bronze Pedestal Ring */}
            <div className="relative mb-3">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-1 bg-gradient-to-tr from-amber-800 via-amber-600 to-amber-700">
                <img
                  src={third.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${third.uid}`}
                  alt={third.displayName}
                  className="w-full h-full rounded-xl object-cover bg-[var(--card-bg)]"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center">
                3
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-center gap-1.5 max-w-[200px] mb-0.5">
              <span className="font-bold text-sm text-[var(--text-color)] truncate group-hover:text-[var(--main-color)] transition-colors">
                {third.displayName}
              </span>
              {third.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>
            <span className="text-xs text-[var(--sub-color)] font-mono mb-2 truncate max-w-[170px]">
              @{third.username}
            </span>

            {/* Tier Badge */}
            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold mb-3.5 ${getTierBadge(third.displayWpm).color}`}>
              {getTierBadge(third.displayWpm).label}
            </div>

            {/* Metrics Pedestal Strip */}
            <div className="w-full pt-3 flex items-center justify-around bg-[var(--sub-alt)]/25 rounded-2xl px-2 py-2">
              <div className="text-center">
                <div className="text-2xl font-black font-mono text-[var(--text-color)] tracking-tight flex items-center justify-center gap-1">
                  <span>{third.scoreValue !== undefined ? third.scoreValue : third.displayWpm}</span>
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)] font-semibold">
                  {third.scoreLabel || 'WPM'}
                </div>
              </div>
              <div className="h-8 w-px bg-[var(--sub-alt)]" />
              <div className="text-center">
                <div className="text-base font-bold font-mono text-[var(--text-color)]">
                  {third.subStatValue !== undefined ? third.subStatValue : (third.highestAccuracy > 0 ? `${Number(third.highestAccuracy).toFixed(1)}%` : '100%')}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--sub-color)] font-semibold">
                  {third.subStatLabel || t('accLabel')}
                </div>
              </div>
            </div>

            {/* Inspect hover action */}
            <div className="mt-3 text-[11px] font-mono text-[var(--sub-color)] group-hover:text-[var(--main-color)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <span>Profilni ko'rish</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        ) : (
          <div className="order-3 flex flex-col p-6 rounded-3xl border border-dashed border-[var(--sub-alt)] bg-[var(--card-bg)]/40 items-center justify-center text-center space-y-2.5 min-h-[220px]">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--sub-alt)]/50 text-[var(--sub-color)] text-xs font-mono font-bold">
              <span>🥉 3-o'rin</span>
              <span className="text-[10px]">(Ochiq)</span>
            </div>
            <div className="w-14 h-14 rounded-2xl border border-dashed border-[var(--sub-alt)] flex items-center justify-center text-[var(--sub-color)] text-xl font-mono">
              ?
            </div>
            <p className="text-xs font-bold text-[var(--text-color)]">Bronza pog'ona bo'sh</p>
            <p className="text-[11px] text-[var(--sub-color)] max-w-[160px]">
              TOP 3 talikka kirish uchun shohsupani egallang!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
