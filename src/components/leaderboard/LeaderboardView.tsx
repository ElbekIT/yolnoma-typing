import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Search,
  Globe,
  Filter,
  Crown,
  Medal,
  User as UserIcon,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  Users,
  Sparkles
} from 'lucide-react';
import { ref, onValue, get } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';

interface LeaderboardEntry extends UserProfile {
  rank: number;
}

const SEED_TYPERS: UserProfile[] = [];

export const LeaderboardView: React.FC = () => {
  const { profile: currentUser } = useAuth();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribeRtdb: (() => void) | null = null;

    const fetchLeaderboard = async () => {
      const fetchedMap = new Map<string, UserProfile>();

      // 1. Load current user if completed tests
      if (currentUser && (currentUser.highestWpm || 0) > 0) {
        fetchedMap.set(currentUser.uid, currentUser);
      }

      // 2. Load guest if completed test
      try {
        const guestId = localStorage.getItem('yolnoma_guest_id');
        const guestBest = Number(localStorage.getItem('yolnoma_guest_best_wpm') || 0);
        if (guestId && guestBest > 0 && !currentUser) {
          fetchedMap.set(guestId, {
            uid: guestId,
            email: '',
            username: guestId,
            displayName: `Mehmon (${guestId.replace('guest_', '')})`,
            highestWpm: guestBest,
            highestAccuracy: 98,
            country: '🇺🇿 Uzbekistan',
            level: 1,
            rankTitle: 'Mehmon Typer',
            bio: 'Tezkor Mehmon Foydalanuvchi',
            avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${guestId}`,
            totalTests: 1,
            totalTimeTypedSeconds: 60,
            totalWordsTyped: guestBest,
            totalCharsTyped: guestBest * 5,
            averageWpm: guestBest,
            currentStreak: 1,
            longestStreak: 1,
            createdAt: Date.now(),
            lastActive: Date.now(),
            isVerified: false,
            xp: 250,
            role: 'user',
            usernameChangesLeft: 2,
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
            pinnedAchievements: [],
            unlockedAchievements: ['first_test'],
            isPublic: true,
            privacy: {
              profileVisibility: 'public',
              allowMessages: 'everyone',
              showOnlineStatus: true,
              showStats: true,
              allowFollow: true
            },
            socialLinks: { twitter: '', github: '', discord: '', website: '' },
            notificationsConfig: { emailAlerts: true, achievementAlerts: true, streakReminders: true }
          });
        }
      } catch (e) {
        console.warn('Guest map error:', e);
      }

      const updateRankingsFromMap = () => {
        let source = Array.from(fetchedMap.values());
        source = source.filter((u) => (u.highestWpm || 0) > 0);
        source.sort((a, b) => (b.highestWpm || 0) - (a.highestWpm || 0));
        const formatted = source.map((user, idx) => ({
          ...user,
          rank: idx + 1
        }));
        setRankings(formatted);
      };

      updateRankingsFromMap();

      // 3. Real-time Database live listener for all users & leaderboards
      try {
        const leaderboardRef = ref(rtdb, 'leaderboard');
        unsubscribeRtdb = onValue(leaderboardRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            Object.keys(val).forEach((key) => {
              const item = val[key];
              if (!item) return;
              const existing = fetchedMap.get(key);
              if (!existing) {
                fetchedMap.set(key, {
                  uid: key,
                  email: '',
                  username: item.username || item.displayName || 'typer',
                  displayName: item.displayName || item.username || 'Typer',
                  highestWpm: item.highestWpm || 0,
                  highestAccuracy: item.highestAccuracy || 0,
                  country: item.country || '🇺🇿 Uzbekistan',
                  level: item.level || 1,
                  rankTitle: item.rankTitle || 'Typing Novice',
                  bio: item.bio || '',
                  avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`,
                  totalTests: item.totalTests || 1,
                  totalTimeTypedSeconds: 60,
                  totalWordsTyped: Math.round((item.highestWpm || 0)),
                  totalCharsTyped: Math.round((item.highestWpm || 0) * 5),
                  averageWpm: item.highestWpm || 0,
                  currentStreak: 1,
                  longestStreak: 1,
                  createdAt: item.createdAt || Date.now(),
                  lastActive: item.lastActive || Date.now(),
                  isVerified: false,
                  xp: typeof item.xp === 'number' ? item.xp : (item.level || 1) * 250,
                  role: 'user',
                  usernameChangesLeft: 2,
                  followers: [],
                  following: [],
                  followersCount: 0,
                  followingCount: 0,
                  pinnedAchievements: [],
                  unlockedAchievements: ['first_test'],
                  isPublic: true,
                  privacy: {
                    profileVisibility: 'public',
                    allowMessages: 'everyone',
                    showOnlineStatus: true,
                    showStats: true,
                    allowFollow: true
                  },
                  socialLinks: { twitter: '', github: '', discord: '', website: '' },
                  notificationsConfig: { emailAlerts: true, achievementAlerts: true, streakReminders: true }
                });
              } else {
                if (item.highestWpm !== undefined && item.highestWpm >= (existing.highestWpm || 0)) {
                  existing.highestWpm = item.highestWpm;
                }
                if (item.highestAccuracy !== undefined && item.highestAccuracy > 0) {
                  existing.highestAccuracy = item.highestAccuracy;
                }
                if (typeof item.xp === 'number') existing.xp = item.xp;
                if (item.level) existing.level = item.level;
                if (item.displayName) existing.displayName = item.displayName;
                if (item.username) existing.username = item.username;
                if (item.bio) existing.bio = item.bio;
                if (item.avatarUrl) existing.avatarUrl = item.avatarUrl;
                if (item.country) existing.country = item.country;
              }
            });
            updateRankingsFromMap();
          }
        });
      } catch (e) {
        console.warn('RTDB listener setup error:', e);
      }
    };

    fetchLeaderboard();

    return () => {
      if (unsubscribeRtdb) unsubscribeRtdb();
    };
  }, [timeframe, currentUser]);

  // Filter Logic
  const filtered = rankings.filter((r) => {
    const uname = r.username || '';
    const dname = r.displayName || '';
    const matchesSearch =
      uname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || r.country === countryFilter;
    const matchesFriends =
      !friendsOnly || (currentUser?.following && currentUser.following.includes(r.uid)) || r.uid === currentUser?.uid;

    return matchesSearch && matchesCountry && matchesFriends;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRankings = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // User rank location
  const currentUserIndex = filtered.findIndex((r) => r.uid === currentUser?.uid);
  const currentUserRank = currentUserIndex !== -1 ? filtered[currentUserIndex].rank : null;
  const isCurrentUserOnPage = currentUserIndex >= (currentPage - 1) * pageSize && currentUserIndex < currentPage * pageSize;

  const jumpToMyRank = () => {
    if (currentUserIndex !== -1) {
      const targetPage = Math.floor(currentUserIndex / pageSize) + 1;
      setCurrentPage(targetPage);
    }
  };

  const top3 = rankings.slice(0, 3);

  const openUserProfile = (u: UserProfile) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Title & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Global Typing Leaderboard</span>
          </h2>
          <p className="text-xs text-[var(--sub-color)] mt-1">
            Real-time global rankings, speed metrics, accuracy streaks, and player profiles
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-[var(--sub-alt)] p-1 rounded-2xl text-xs font-semibold">
            {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  timeframe === tf
                    ? 'bg-[var(--main-color)] text-white shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {tf === 'allTime' ? 'All Time' : tf}
              </button>
            ))}
          </div>

          {/* Friends Filter Tab */}
          <button
            onClick={() => setFriendsOnly(!friendsOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              friendsOnly
                ? 'bg-[var(--main-color)] text-white border-[var(--main-color)]'
                : 'bg-[var(--sub-alt)] text-[var(--sub-color)] border-[var(--sub-color)]/20 hover:text-[var(--text-color)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friends Only</span>
          </button>

          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 rounded-xl text-xs text-[var(--text-color)] outline-none"
          >
            <option value="all">🌍 All Countries</option>
            <option value="🇺🇿 Uzbekistan">🇺🇿 Uzbekistan</option>
            <option value="🇺🇸 United States">🇺🇸 United States</option>
            <option value="🇬🇧 United Kingdom">🇬🇧 United Kingdom</option>
            <option value="🇩🇪 Germany">🇩🇪 Germany</option>
            <option value="🇹🇷 Turkey">🇹🇷 Turkey</option>
            <option value="🇰🇿 Kazakhstan">🇰🇿 Kazakhstan</option>
          </select>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--sub-color)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user..."
              className="pl-8 pr-3 py-2 bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 rounded-xl text-xs text-[var(--text-color)] outline-none focus:border-[var(--main-color)] w-36 sm:w-44 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section - Compact & Responsive across all devices */}
      {top3.length >= 3 && !friendsOnly && searchQuery === '' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
          {/* #2 Rank SILVER */}
          <div
            onClick={() => openUserProfile(top3[1])}
            className="bg-[var(--card-bg)] border border-slate-700/50 p-2.5 sm:p-4 rounded-2xl text-center flex flex-col items-center justify-between relative shadow-sm hover:border-slate-400 transition-all cursor-pointer group"
          >
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded-full bg-slate-700/40 font-mono">
              #2 SILVER
            </div>
            <div className="relative my-1.5 sm:my-2">
              <img
                src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[1].uid}`}
                alt={top3[1].username}
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-slate-400 shadow bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 text-sm sm:text-base">🥈</span>
            </div>
            <div className="w-full text-center">
              <div className="flex items-center justify-center gap-1 font-bold text-xs sm:text-sm text-[var(--text-color)] truncate px-1">
                <span className="truncate">{top3[1].displayName}</span>
                {top3[1].isVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />}
              </div>
              <p className="text-[9px] sm:text-[10px] text-[var(--sub-color)] font-mono truncate mb-1">@{top3[1].username}</p>
              
              <div className="text-sm sm:text-lg font-black font-mono text-[var(--main-color)]">{top3[1].highestWpm} <span className="text-[9px] font-normal text-[var(--sub-color)]">WPM</span></div>
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-mono mt-0.5">
                <span className="text-emerald-400 font-bold">{top3[1].highestAccuracy || 98}% Acc</span>
                <span className="text-amber-400 font-bold">• {top3[1].xp || (top3[1].level || 1) * 250} XP</span>
              </div>
            </div>
          </div>

          {/* #1 Rank GOLD */}
          <div
            onClick={() => openUserProfile(top3[0])}
            className="bg-gradient-to-b from-amber-500/20 via-[var(--card-bg)] to-[var(--card-bg)] border-2 border-amber-500/60 p-2.5 sm:p-4 rounded-2xl text-center flex flex-col items-center justify-between relative shadow-lg cursor-pointer group"
          >
            <div className="text-[9px] sm:text-[10px] font-extrabold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/20 flex items-center justify-center gap-1 font-mono">
              <Crown className="w-3 h-3 fill-amber-400 shrink-0" />
              <span>#1 CHAMPION</span>
            </div>
            <div className="relative my-1.5 sm:my-2">
              <img
                src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[0].uid}`}
                alt={top3[0].username}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-amber-400 shadow-md bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 text-base sm:text-lg">🥇</span>
            </div>
            <div className="w-full text-center">
              <div className="flex items-center justify-center gap-1 font-extrabold text-xs sm:text-base text-[var(--text-color)] truncate px-1">
                <span className="truncate">{top3[0].displayName}</span>
                {top3[0].isVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />}
              </div>
              <p className="text-[9px] sm:text-[10px] text-[var(--sub-color)] font-mono truncate mb-1">@{top3[0].username}</p>
              
              <div className="text-base sm:text-xl font-black font-mono text-amber-400">{top3[0].highestWpm} <span className="text-[9px] font-normal text-[var(--sub-color)]">WPM</span></div>
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-mono mt-0.5">
                <span className="text-emerald-400 font-bold">{top3[0].highestAccuracy || 98}% Acc</span>
                <span className="text-amber-400 font-bold">• {top3[0].xp || (top3[0].level || 1) * 250} XP</span>
              </div>
            </div>
          </div>

          {/* #3 Rank BRONZE */}
          <div
            onClick={() => openUserProfile(top3[2])}
            className="bg-[var(--card-bg)] border border-amber-800/40 p-2.5 sm:p-4 rounded-2xl text-center flex flex-col items-center justify-between relative shadow-sm hover:border-amber-700 transition-all cursor-pointer group"
          >
            <div className="text-[9px] sm:text-[10px] font-bold text-amber-600 px-2 py-0.5 rounded-full bg-amber-700/20 font-mono">
              #3 BRONZE
            </div>
            <div className="relative my-1.5 sm:my-2">
              <img
                src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[2].uid}`}
                alt={top3[2].username}
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-amber-700 shadow bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 text-sm sm:text-base">🥉</span>
            </div>
            <div className="w-full text-center">
              <div className="flex items-center justify-center gap-1 font-bold text-xs sm:text-sm text-[var(--text-color)] truncate px-1">
                <span className="truncate">{top3[2].displayName}</span>
                {top3[2].isVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />}
              </div>
              <p className="text-[9px] sm:text-[10px] text-[var(--sub-color)] font-mono truncate mb-1">@{top3[2].username}</p>
              
              <div className="text-sm sm:text-lg font-black font-mono text-[var(--main-color)]">{top3[2].highestWpm} <span className="text-[9px] font-normal text-[var(--sub-color)]">WPM</span></div>
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-mono mt-0.5">
                <span className="text-emerald-400 font-bold">{top3[2].highestAccuracy || 98}% Acc</span>
                <span className="text-amber-400 font-bold">• {top3[2].xp || (top3[2].level || 1) * 250} XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-[var(--sub-alt)] text-[var(--sub-color)] font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sub-alt)]">
              {pageRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[var(--sub-color)]">
                    <p className="font-semibold text-sm mb-1 text-[var(--text-color)]">Hozircha reytingda real foydalanuvchilar mavjud emas</p>
                    <p className="text-xs">Profil oching va test topshirib 1-o'rinni egallang! Barcha natijalar Firebase bazasida saqlanadi.</p>
                  </td>
                </tr>
              ) : (
                pageRankings.map((item) => {
                  const isSelf = currentUser?.uid === item.uid;

                return (
                  <tr
                    key={item.uid}
                    onClick={() => openUserProfile(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelf
                        ? 'bg-[var(--main-color)]/10 border-l-4 border-l-[var(--main-color)] font-semibold'
                        : 'hover:bg-[var(--sub-alt)]/50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="text-[var(--sub-color)]">#{item.rank}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                          alt="avatar"
                          className="w-8 h-8 rounded-xl object-cover bg-[var(--sub-alt)] shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-[var(--text-color)]">
                            <span>{item.displayName}</span>
                            {item.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />}
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded bg-[var(--main-color)] text-white text-[9px] font-black uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--sub-color)] font-mono">@{item.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[var(--text-color)]">
                      <span>Lvl {item.level || 1}</span>
                      <span className="text-[10px] text-amber-400 block font-normal">{item.xp || (item.level || 1) * 250} XP</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-extrabold text-[var(--main-color)] text-sm">
                      {item.highestWpm} <span className="text-[10px] text-[var(--sub-color)] font-normal">WPM</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-500">
                      {item.highestAccuracy}%
                    </td>

                    <td className="py-3 px-4 text-[var(--sub-color)]">{item.country || '🇺🇿 Uzbekistan'}</td>

                    <td className="py-3 px-4 text-right">
                      {item.rankChange === 'up' ? (
                        <span className="text-emerald-500 font-bold flex items-center justify-end gap-0.5 text-[10px]">
                          <ArrowUp className="w-3 h-3" /> {item.rankChangeAmount || 1}
                        </span>
                      ) : item.rankChange === 'down' ? (
                        <span className="text-rose-500 font-bold flex items-center justify-end gap-0.5 text-[10px]">
                          <ArrowDown className="w-3 h-3" /> {item.rankChangeAmount || 1}
                        </span>
                      ) : (
                        <span className="text-[var(--sub-color)] flex items-center justify-end text-[10px]">
                          <Minus className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-[var(--sub-alt)] pt-4 text-xs">
          <span className="text-[var(--sub-color)] font-mono">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filtered.length} players)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] disabled:opacity-40"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl font-mono font-bold transition-all ${
                      currentPage === p
                        ? 'bg-[var(--main-color)] text-white'
                        : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] disabled:opacity-40"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Floating Rank Banner (If user is not on current page) */}
      {currentUser && currentUserRank && !isCurrentUserOnPage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[var(--card-bg)] border-2 border-[var(--main-color)] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>
              Your Rank Position: <strong className="font-mono text-base text-[var(--main-color)]">#{currentUserRank}</strong> ({currentUser.highestWpm} WPM)
            </span>
          </div>

          <button
            onClick={jumpToMyRank}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--main-color)] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Jump to My Position
          </button>
        </div>
      )}

      {/* Public Profile View Modal */}
      <PublicProfileModal
        userProfile={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
