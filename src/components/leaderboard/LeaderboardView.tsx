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
  Users
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';

interface LeaderboardEntry extends UserProfile {
  rank: number;
}

export const LeaderboardView: React.FC = () => {
  const { profile: currentUser } = useAuth();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Comprehensive fallback entries
  const fallbackUsers: UserProfile[] = [
    {
      uid: 'user_1',
      email: 'speed@yolnoma.app',
      username: 'speeddemon_99',
      displayName: 'Speed Demon ⚡',
      highestWpm: 168,
      highestAccuracy: 99,
      totalTests: 1420,
      totalTimeTypedSeconds: 84000,
      totalWordsTyped: 42000,
      totalCharsTyped: 210000,
      averageWpm: 152,
      currentStreak: 45,
      longestStreak: 60,
      createdAt: Date.now() - 100000000,
      lastActive: Date.now() - 60000,
      country: '🇺🇸 United States',
      isVerified: true,
      xp: 8400,
      level: 17,
      rankTitle: 'Cyber Legend',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 342,
      followingCount: 12,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test', 'wpm_100', 'wpm_150', 'streak_30'],
      isPublic: true,
      rankChange: 'up',
      rankChangeAmount: 1,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Professional esports typist & software developer. 168 WPM record.'
    },
    {
      uid: 'user_2',
      email: 'uzbek@yolnoma.app',
      username: 'uzbek_typer_pro',
      displayName: 'Klaviatura Ustasi',
      highestWpm: 154,
      highestAccuracy: 98,
      totalTests: 980,
      totalTimeTypedSeconds: 58000,
      totalWordsTyped: 31000,
      totalCharsTyped: 155000,
      averageWpm: 140,
      currentStreak: 28,
      longestStreak: 35,
      createdAt: Date.now() - 80000000,
      lastActive: Date.now() - 120000,
      country: '🇺🇿 Uzbekistan',
      isVerified: true,
      xp: 6200,
      level: 13,
      rankTitle: 'Speed Demon',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 210,
      followingCount: 45,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test', 'wpm_100'],
      isPublic: true,
      rankChange: 'same',
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Oʻzbekistondagi eng tez yozuvchilardan biri. Yolnoma Typing platformasida 1-oʻrin uchun kurashaman!'
    },
    {
      uid: 'user_3',
      email: 'cyber@yolnoma.app',
      username: 'cyberninja_x',
      displayName: 'CyberNinja',
      highestWpm: 142,
      highestAccuracy: 100,
      totalTests: 760,
      totalTimeTypedSeconds: 45000,
      totalWordsTyped: 24000,
      totalCharsTyped: 120000,
      averageWpm: 132,
      currentStreak: 19,
      longestStreak: 22,
      createdAt: Date.now() - 60000000,
      lastActive: Date.now() - 300000,
      country: '🇬🇧 United Kingdom',
      isVerified: false,
      xp: 4800,
      level: 10,
      rankTitle: 'Speed Demon',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 88,
      followingCount: 30,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test', 'accuracy_100'],
      isPublic: true,
      rankChange: 'down',
      rankChangeAmount: 1,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Precision over speed. 100% accuracy enthusiast.'
    },
    {
      uid: 'user_4',
      email: 'tashkent@yolnoma.app',
      username: 'tashkent_coder',
      displayName: 'Tashkent Dev',
      highestWpm: 135,
      highestAccuracy: 97,
      totalTests: 620,
      totalTimeTypedSeconds: 38000,
      totalWordsTyped: 19000,
      totalCharsTyped: 95000,
      averageWpm: 125,
      currentStreak: 12,
      longestStreak: 18,
      createdAt: Date.now() - 50000000,
      lastActive: Date.now() - 600000,
      country: '🇺🇿 Uzbekistan',
      isVerified: false,
      xp: 3900,
      level: 8,
      rankTitle: 'Keyboard Warrior',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 64,
      followingCount: 20,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'up',
      rankChangeAmount: 2,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'React & Node.js Engineer from Tashkent.'
    },
    {
      uid: 'user_5',
      email: 'type@yolnoma.app',
      username: 'typewriter_master',
      displayName: 'TypeMaster',
      highestWpm: 128,
      highestAccuracy: 99,
      totalTests: 510,
      totalTimeTypedSeconds: 31000,
      totalWordsTyped: 16000,
      totalCharsTyped: 80000,
      averageWpm: 118,
      currentStreak: 14,
      longestStreak: 25,
      createdAt: Date.now() - 40000000,
      lastActive: Date.now() - 1200000,
      country: '🇰🇿 Kazakhstan',
      isVerified: false,
      xp: 3100,
      level: 7,
      rankTitle: 'Keyboard Warrior',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 50,
      followingCount: 15,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'same',
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Typing on custom mechanical switches.'
    },
    {
      uid: 'user_6',
      email: 'alpha@yolnoma.app',
      username: 'alpha_coder',
      displayName: 'Alpha Coder',
      highestWpm: 122,
      highestAccuracy: 96,
      totalTests: 450,
      totalTimeTypedSeconds: 27000,
      totalWordsTyped: 14000,
      totalCharsTyped: 70000,
      averageWpm: 112,
      currentStreak: 8,
      longestStreak: 15,
      createdAt: Date.now() - 35000000,
      lastActive: Date.now() - 2000000,
      country: '🇩🇪 Germany',
      isVerified: false,
      xp: 2600,
      level: 6,
      rankTitle: 'Keyboard Warrior',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 42,
      followingCount: 10,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'up',
      rankChangeAmount: 1,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Backend developer & Linux fan.'
    },
    {
      uid: 'user_7',
      email: 'samarkand@yolnoma.app',
      username: 'samarkand_fast',
      displayName: 'Samarkand Typer',
      highestWpm: 118,
      highestAccuracy: 98,
      totalTests: 390,
      totalTimeTypedSeconds: 23000,
      totalWordsTyped: 12000,
      totalCharsTyped: 60000,
      averageWpm: 108,
      currentStreak: 10,
      longestStreak: 14,
      createdAt: Date.now() - 30000000,
      lastActive: Date.now() - 3600000,
      country: '🇺🇿 Uzbekistan',
      isVerified: false,
      xp: 2200,
      level: 5,
      rankTitle: 'Keyboard Warrior',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 30,
      followingCount: 12,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'same',
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Greetings from ancient Samarkand!'
    },
    {
      uid: 'user_8',
      email: 'tokyo@yolnoma.app',
      username: 'tokyo_keys',
      displayName: 'Tokyo Keys',
      highestWpm: 115,
      highestAccuracy: 95,
      totalTests: 340,
      totalTimeTypedSeconds: 20000,
      totalWordsTyped: 10000,
      totalCharsTyped: 50000,
      averageWpm: 104,
      currentStreak: 5,
      longestStreak: 10,
      createdAt: Date.now() - 25000000,
      lastActive: Date.now() - 7200000,
      country: '🇯🇵 Japan',
      isVerified: false,
      xp: 1800,
      level: 4,
      rankTitle: 'Typing Novice',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 25,
      followingCount: 8,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'down',
      rankChangeAmount: 1,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Keyboard enthusiast from Tokyo.'
    },
    {
      uid: 'user_9',
      email: 'bukhara@yolnoma.app',
      username: 'bukhara_pro',
      displayName: 'Bukhara Speed',
      highestWpm: 110,
      highestAccuracy: 97,
      totalTests: 290,
      totalTimeTypedSeconds: 17000,
      totalWordsTyped: 8500,
      totalCharsTyped: 42500,
      averageWpm: 99,
      currentStreak: 7,
      longestStreak: 11,
      createdAt: Date.now() - 20000000,
      lastActive: Date.now() - 10800000,
      country: '🇺🇿 Uzbekistan',
      isVerified: false,
      xp: 1500,
      level: 3,
      rankTitle: 'Typing Novice',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 18,
      followingCount: 5,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'up',
      rankChangeAmount: 2,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Bukhara city typing champion.'
    },
    {
      uid: 'user_10',
      email: 'istanbul@yolnoma.app',
      username: 'istanbul_runner',
      displayName: 'Istanbul Fast',
      highestWpm: 105,
      highestAccuracy: 96,
      totalTests: 240,
      totalTimeTypedSeconds: 14000,
      totalWordsTyped: 7000,
      totalCharsTyped: 35000,
      averageWpm: 94,
      currentStreak: 4,
      longestStreak: 9,
      createdAt: Date.now() - 15000000,
      lastActive: Date.now() - 14400000,
      country: '🇹🇷 Turkey',
      isVerified: false,
      xp: 1200,
      level: 3,
      rankTitle: 'Typing Novice',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 15,
      followingCount: 4,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'same',
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'F-keyboard & Q-keyboard master.'
    },
    {
      uid: 'user_11',
      email: 'fergana@yolnoma.app',
      username: 'fergana_typer',
      displayName: 'Fergana Valley',
      highestWpm: 101,
      highestAccuracy: 95,
      totalTests: 200,
      totalTimeTypedSeconds: 12000,
      totalWordsTyped: 6000,
      totalCharsTyped: 30000,
      averageWpm: 90,
      currentStreak: 3,
      longestStreak: 8,
      createdAt: Date.now() - 12000000,
      lastActive: Date.now() - 18000000,
      country: '🇺🇿 Uzbekistan',
      isVerified: false,
      xp: 950,
      level: 2,
      rankTitle: 'Typing Novice',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 12,
      followingCount: 3,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'up',
      rankChangeAmount: 1,
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Fergana valley typing league.'
    },
    {
      uid: 'user_12',
      email: 'almaty@yolnoma.app',
      username: 'almaty_keys',
      displayName: 'Almaty Typer',
      highestWpm: 96,
      highestAccuracy: 94,
      totalTests: 170,
      totalTimeTypedSeconds: 10000,
      totalWordsTyped: 5000,
      totalCharsTyped: 25000,
      averageWpm: 86,
      currentStreak: 2,
      longestStreak: 6,
      createdAt: Date.now() - 10000000,
      lastActive: Date.now() - 21600000,
      country: '🇰🇿 Kazakhstan',
      isVerified: false,
      xp: 750,
      level: 2,
      rankTitle: 'Typing Novice',
      role: 'user',
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 9,
      followingCount: 2,
      pinnedAchievements: [],
      unlockedAchievements: ['first_test'],
      isPublic: true,
      rankChange: 'same',
      privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
      bio: 'Practicing daily for 100+ WPM.'
    }
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), orderBy('highestWpm', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        const fetched: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
        });

        let source = fetched.length > 0 ? fetched : fallbackUsers;

        // Ensure current user is in leaderboard
        if (currentUser && !source.some((u) => u.uid === currentUser.uid)) {
          source = [currentUser, ...source].sort((a, b) => b.highestWpm - a.highestWpm);
        }

        const formatted = source.map((user, idx) => ({
          ...user,
          rank: idx + 1
        }));

        setRankings(formatted);
      } catch {
        let source = fallbackUsers;
        if (currentUser && !source.some((u) => u.uid === currentUser.uid)) {
          source = [currentUser, ...source].sort((a, b) => b.highestWpm - a.highestWpm);
        }
        setRankings(source.map((u, idx) => ({ ...u, rank: idx + 1 })));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  // Filter Logic
  const filtered = rankings.filter((r) => {
    const matchesSearch =
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.displayName.toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* Top 3 Podium Section */}
      {top3.length >= 3 && !friendsOnly && searchQuery === '' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Rank SILVER */}
          <div
            onClick={() => openUserProfile(top3[1])}
            className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl text-center flex flex-col items-center justify-center relative shadow-sm hover:border-slate-400 transition-all cursor-pointer group"
          >
            <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-400 px-2.5 py-1 rounded-full bg-slate-400/10">
              #2 SILVER
            </div>
            <div className="relative my-3">
              <img
                src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[1].uid}`}
                alt={top3[1].username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-400 shadow-md bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-2 -right-2 text-xl">🥈</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--text-color)]">
              <span>{top3[1].displayName}</span>
              {top3[1].isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />}
            </div>
            <p className="text-[11px] text-[var(--sub-color)] font-mono mb-2">@{top3[1].username}</p>
            <div className="text-2xl font-black font-mono text-[var(--main-color)]">{top3[1].highestWpm} WPM</div>
            <span className="text-[10px] text-emerald-500 font-bold">{top3[1].highestAccuracy}% Accuracy</span>
          </div>

          {/* #1 Rank GOLD */}
          <div
            onClick={() => openUserProfile(top3[0])}
            className="bg-gradient-to-b from-amber-500/15 via-[var(--card-bg)] to-[var(--card-bg)] border-2 border-amber-500/50 p-6 rounded-3xl text-center flex flex-col items-center justify-center relative shadow-xl scale-105 cursor-pointer group"
          >
            <div className="absolute top-3 left-3 text-[10px] font-extrabold text-amber-500 px-2.5 py-1 rounded-full bg-amber-500/20 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-500" />
              <span>#1 CHAMPION</span>
            </div>
            <div className="relative my-3">
              <img
                src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[0].uid}`}
                alt={top3[0].username}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-lg bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-2 -right-2 text-2xl">🥇</span>
            </div>
            <div className="flex items-center gap-1.5 font-extrabold text-base text-[var(--text-color)]">
              <span>{top3[0].displayName}</span>
              {top3[0].isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />}
            </div>
            <p className="text-[11px] text-[var(--sub-color)] font-mono mb-2">@{top3[0].username}</p>
            <div className="text-3xl font-black font-mono text-amber-500">{top3[0].highestWpm} WPM</div>
            <span className="text-[10px] text-emerald-500 font-bold">{top3[0].highestAccuracy}% Accuracy</span>
          </div>

          {/* #3 Rank BRONZE */}
          <div
            onClick={() => openUserProfile(top3[2])}
            className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl text-center flex flex-col items-center justify-center relative shadow-sm hover:border-amber-700 transition-all cursor-pointer group"
          >
            <div className="absolute top-3 left-3 text-[10px] font-bold text-amber-700 px-2.5 py-1 rounded-full bg-amber-700/10">
              #3 BRONZE
            </div>
            <div className="relative my-3">
              <img
                src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[2].uid}`}
                alt={top3[2].username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-700 shadow-md bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-2 -right-2 text-xl">🥉</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--text-color)]">
              <span>{top3[2].displayName}</span>
              {top3[2].isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />}
            </div>
            <p className="text-[11px] text-[var(--sub-color)] font-mono mb-2">@{top3[2].username}</p>
            <div className="text-2xl font-black font-mono text-[var(--main-color)]">{top3[2].highestWpm} WPM</div>
            <span className="text-[10px] text-emerald-500 font-bold">{top3[2].highestAccuracy}% Accuracy</span>
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
              {pageRankings.map((item) => {
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
                      Lvl {item.level || 1}
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
              })}
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
