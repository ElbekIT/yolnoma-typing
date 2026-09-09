import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Trophy,
  Clock,
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Target,
  Zap,
  Globe,
  Filter,
  BarChart3,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';

export type LeaderboardCategory = 'all' | '15' | '30' | '60' | '120' | 'xp' | 'accuracy' | 'activity';

export type SortField = 'metric' | 'accuracy' | 'tests' | 'level' | 'date';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  country?: string;
  highestWpm: number;
  highestAccuracy: number;
  time15Wpm?: number;
  time30Wpm?: number;
  time60Wpm?: number;
  time120Wpm?: number;
  totalTests: number;
  level: number;
  xp: number;
  rankTitle: string;
  lastActive: number;
  bio?: string;
  isVerified?: boolean;
  isBanned?: boolean;
  isBlocked?: boolean;
}

interface FormattedTypingEntry extends LeaderboardUser {
  rank: number;
  displayValue: number;
  modeLabel: string;
  dateFormatted: string;
  percentile: string;
}

export const LeaderboardView: React.FC = () => {
  const { profile: currentUser } = useAuth();

  // Selected Category & Filters
  const [category, setCategory] = useState<LeaderboardCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('metric');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Raw Data from Firebase RTDB
  const [rawTypingUsers, setRawTypingUsers] = useState<LeaderboardUser[]>([]);
  const [bannedUids, setBannedUids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Profile modal
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Format Date helper
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Yaqinda';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return 'Yaqinda';
      return d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Yaqinda';
    }
  };

  // 1. Listen to Realtime Firebase Data (leaderboard, bannedUsers)
  useEffect(() => {
    setLoading(true);
    const lbRef = ref(rtdb, 'leaderboard');
    const bansRef = ref(rtdb, 'bannedUsers');

    let unsubLb: (() => void) | null = null;
    let unsubBans: (() => void) | null = null;

    // Listen to banned users
    unsubBans = onValue(bansRef, (snapshot) => {
      const newBans = new Set<string>();
      if (snapshot.exists()) {
        const bansData = snapshot.val();
        Object.keys(bansData).forEach((k) => newBans.add(k));
      }
      setBannedUids(newBans);
    });

    // Listen to typing leaderboard
    unsubLb = onValue(lbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const users: LeaderboardUser[] = [];

        Object.keys(data).forEach((key) => {
          const u = data[key];
          if (!u) return;

          // Strictly real fields from Firebase RTDB
          users.push({
            uid: u.uid || key,
            displayName: u.displayName || u.username || 'Foydalanuvchi',
            username: u.username || `user_${key.slice(0, 5)}`,
            avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`,
            country: u.country || '🇺🇿 Uzbekistan',
            highestWpm: Number(u.highestWpm) || 0,
            highestAccuracy: Number(u.highestAccuracy) || 0,
            time15Wpm: Number(u.time15Wpm) || 0,
            time30Wpm: Number(u.time30Wpm) || 0,
            time60Wpm: Number(u.time60Wpm) || 0,
            time120Wpm: Number(u.time120Wpm) || 0,
            totalTests: Number(u.totalTests) || 0,
            level: Number(u.level) || 1,
            xp: Number(u.xp) || 0,
            rankTitle: u.rankTitle || 'Typing Novice',
            lastActive: Number(u.lastActive) || 0,
            bio: u.bio || '',
            isVerified: !!u.isVerified,
            isBanned: !!u.isBanned || !!u.isBlocked
          });
        });

        setRawTypingUsers(users);
      } else {
        setRawTypingUsers([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Leaderboard RTDB subscription error:', err);
      setLoading(false);
    });

    return () => {
      if (unsubLb) unsubLb();
      if (unsubBans) unsubBans();
    };
  }, []);

  // Filter out banned users
  const validTypingUsers = useMemo(() => {
    return rawTypingUsers.filter((u) => !bannedUids.has(u.uid) && !u.isBanned && !u.isBlocked);
  }, [rawTypingUsers, bannedUids]);

  // Global Community Statistics
  const globalStats = useMemo(() => {
    const activeUsers = validTypingUsers.filter((u) => u.highestWpm > 0);
    const count = activeUsers.length;
    if (count === 0) {
      return {
        totalUsers: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        maxWpm: 0,
        topUser: '—'
      };
    }

    const totalWpm = activeUsers.reduce((sum, u) => sum + u.highestWpm, 0);
    const totalAcc = activeUsers.reduce((sum, u) => sum + (u.highestAccuracy || 0), 0);
    
    // Sort to find true absolute record holder
    const sorted = [...activeUsers].sort((a, b) => b.highestWpm - a.highestWpm);
    const topRecord = sorted[0];

    return {
      totalUsers: count,
      avgWpm: Math.round(totalWpm / count),
      avgAccuracy: Math.round((totalAcc / count) * 10) / 10,
      maxWpm: topRecord.highestWpm,
      topUser: topRecord.displayName
    };
  }, [validTypingUsers]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: validTypingUsers.filter((u) => u.highestWpm > 0).length,
      time15: validTypingUsers.filter((u) => (u.time15Wpm || 0) > 0).length,
      time30: validTypingUsers.filter((u) => (u.time30Wpm || 0) > 0).length,
      time60: validTypingUsers.filter((u) => (u.time60Wpm || 0) > 0).length,
      time120: validTypingUsers.filter((u) => (u.time120Wpm || 0) > 0).length,
      xp: validTypingUsers.filter((u) => (u.xp || 0) > 0).length,
      accuracy: validTypingUsers.filter((u) => u.highestAccuracy >= 95 && u.totalTests >= 3).length,
      activity: validTypingUsers.filter((u) => (u.totalTests || 0) > 0).length
    };
  }, [validTypingUsers]);

  // Process and sort typing rankings strictly according to Firebase values
  const sortedTypingList = useMemo<FormattedTypingEntry[]>(() => {
    let filtered = [...validTypingUsers];

    // Filter according to category
    if (category === 'all') {
      filtered = filtered.filter((u) => u.highestWpm > 0);
    } else if (category === '15') {
      filtered = filtered.filter((u) => (u.time15Wpm || 0) > 0);
    } else if (category === '30') {
      filtered = filtered.filter((u) => (u.time30Wpm || 0) > 0);
    } else if (category === '60') {
      filtered = filtered.filter((u) => (u.time60Wpm || 0) > 0);
    } else if (category === '120') {
      filtered = filtered.filter((u) => (u.time120Wpm || 0) > 0);
    } else if (category === 'xp') {
      filtered = filtered.filter((u) => (u.xp || 0) > 0);
    } else if (category === 'accuracy') {
      filtered = filtered.filter((u) => (u.highestAccuracy || 0) > 0 && (u.totalTests || 0) >= 3);
    } else if (category === 'activity') {
      filtered = filtered.filter((u) => (u.totalTests || 0) > 0);
    }

    // Default primary metric value for each user
    const getMetricValue = (u: LeaderboardUser): number => {
      if (category === '15') return u.time15Wpm || u.highestWpm;
      if (category === '30') return u.time30Wpm || u.highestWpm;
      if (category === '60') return u.time60Wpm || u.highestWpm;
      if (category === '120') return u.time120Wpm || u.highestWpm;
      if (category === 'xp') return u.xp;
      if (category === 'accuracy') return u.highestAccuracy;
      if (category === 'activity') return u.totalTests;
      return u.highestWpm;
    };

    // Primary sorting based on active category & sortField
    filtered.sort((a, b) => {
      if (sortField === 'accuracy') {
        if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
        return b.highestWpm - a.highestWpm;
      }
      if (sortField === 'tests') {
        if (b.totalTests !== a.totalTests) return (b.totalTests || 0) - (a.totalTests || 0);
        return b.highestWpm - a.highestWpm;
      }
      if (sortField === 'level') {
        if (b.level !== a.level) return (b.level || 1) - (a.level || 1);
        return (b.xp || 0) - (a.xp || 0);
      }
      if (sortField === 'date') {
        return (b.lastActive || 0) - (a.lastActive || 0);
      }

      // Default 'metric' sorting
      const valA = getMetricValue(a);
      const valB = getMetricValue(b);
      if (valB !== valA) return valB - valA;
      if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
      return (b.totalTests || 0) - (a.totalTests || 0);
    });

    const totalCount = filtered.length;

    return filtered.map((u, index) => {
      const displayValue = getMetricValue(u);
      let modeLabel = '30s';

      if (category === '15') modeLabel = '15s';
      else if (category === '30') modeLabel = '30s';
      else if (category === '60') modeLabel = '60s';
      else if (category === '120') modeLabel = '120s';
      else if (category === 'xp') modeLabel = 'XP';
      else if (category === 'accuracy') modeLabel = 'Acc';
      else if (category === 'activity') modeLabel = 'Tests';
      else if (category === 'all') {
        if (u.time15Wpm && u.time15Wpm === u.highestWpm) modeLabel = '15s';
        else if (u.time30Wpm && u.time30Wpm === u.highestWpm) modeLabel = '30s';
        else if (u.time60Wpm && u.time60Wpm === u.highestWpm) modeLabel = '60s';
        else if (u.time120Wpm && u.time120Wpm === u.highestWpm) modeLabel = '120s';
      }

      const topPercentile = Math.max(1, Math.round(((index + 1) / (totalCount || 1)) * 100));

      return {
        ...u,
        rank: index + 1,
        displayValue,
        modeLabel,
        dateFormatted: formatDate(u.lastActive),
        percentile: `Top ${topPercentile}%`
      };
    });
  }, [validTypingUsers, category, sortField]);

  // Filter with search query & verified filter
  const filteredList = useMemo(() => {
    let list = sortedTypingList;
    if (verifiedOnly) {
      list = list.filter((u) => u.isVerified);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.country && u.country.toLowerCase().includes(q))
    );
  }, [sortedTypingList, searchQuery, verifiedOnly]);

  // Pagination
  const currentTotal = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Top 3 Podium entries (only shown on page 1 without search)
  const topPodium = useMemo(() => {
    if (currentPage !== 1 || searchQuery.trim() !== '' || verifiedOnly) return [];
    return sortedTypingList.slice(0, 3);
  }, [sortedTypingList, currentPage, searchQuery, verifiedOnly]);

  // Current logged in user's position in active category
  const myRankingInfo = useMemo(() => {
    if (!currentUser?.uid) return null;
    const idx = sortedTypingList.findIndex((u) => u.uid === currentUser.uid);
    if (idx !== -1) {
      const item = sortedTypingList[idx];
      let valueString = `${item.displayValue} WPM`;
      if (category === 'xp') valueString = `${item.displayValue.toLocaleString()} XP`;
      else if (category === 'accuracy') valueString = `${item.displayValue}% Aniqlik`;
      else if (category === 'activity') valueString = `${item.displayValue} ta test`;

      return {
        rank: idx + 1,
        total: sortedTypingList.length,
        valueString,
        accuracy: `${item.highestAccuracy}%`,
        percentile: item.percentile,
        item
      };
    }
    return null;
  }, [currentUser, category, sortedTypingList]);

  // Jump to user's row
  const handleJumpToMyRank = () => {
    if (!myRankingInfo) return;
    const targetPage = Math.floor((myRankingInfo.rank - 1) / pageSize) + 1;
    setCurrentPage(targetPage);
    setSearchQuery('');
    setVerifiedOnly(false);
  };

  // Open profile modal
  const openUserProfile = (u: LeaderboardUser) => {
    const profile: UserProfile = {
      uid: u.uid,
      email: '',
      username: u.username || 'user',
      displayName: u.displayName || u.username || 'Foydalanuvchi',
      avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.uid}`,
      country: u.country || '🇺🇿 Uzbekistan',
      highestWpm: u.highestWpm || 0,
      highestAccuracy: u.highestAccuracy || 100,
      averageWpm: u.highestWpm || 0,
      time15Wpm: u.time15Wpm || 0,
      time30Wpm: u.time30Wpm || 0,
      time60Wpm: u.time60Wpm || 0,
      time120Wpm: u.time120Wpm || 0,
      totalTests: u.totalTests || 1,
      totalTimeTypedSeconds: 0,
      totalWordsTyped: 0,
      totalCharsTyped: 0,
      currentStreak: 1,
      longestStreak: 1,
      level: u.level || 1,
      xp: u.xp || 0,
      rankTitle: u.rankTitle || 'Typing Novice',
      createdAt: u.lastActive || Date.now(),
      lastActive: u.lastActive || Date.now(),
      isPublic: true,
      isBlocked: false,
      role: 'user',
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      pinnedAchievements: [],
      unlockedAchievements: [],
      usernameChangesLeft: 3,
      privacy: {
        profileVisibility: 'public',
        allowMessages: 'everyone',
        showOnlineStatus: true,
        showStats: true,
        allowFollow: true
      }
    };
    setSelectedProfile(profile);
    setIsProfileOpen(true);
  };

  // Speed Badge Styling
  const getSpeedBadgeClass = (wpm: number) => {
    if (wpm >= 100) return 'text-amber-400 font-black drop-shadow-sm';
    if (wpm >= 80) return 'text-purple-400 font-extrabold';
    if (wpm >= 60) return 'text-emerald-400 font-bold';
    if (wpm >= 40) return 'text-sky-400 font-semibold';
    return 'text-[var(--text-color)]';
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-3 sm:px-6 font-mono select-none space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Live Realtime Statistics */}
      <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--sub-alt)] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2.5 rounded-2xl bg-[var(--main-color)]/10 text-[var(--main-color)] shadow-xs">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-color)] flex items-center gap-2">
                  <span>Jonli Reyting Jadvali</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--main-color)]/15 text-[var(--main-color)] font-bold">
                    PRO
                  </span>
                </h1>
                <p className="text-xs text-[var(--sub-color)] flex items-center gap-2 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Firebase Realtime Database bilan 100% jonli va real ma&apos;lumotlar</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Real Platform Statistics Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 text-xs">
            <div className="px-3.5 py-2 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[var(--main-color)] shrink-0" />
              <div>
                <span className="text-[10px] text-[var(--sub-color)] block font-medium">Jami Teruvchilar</span>
                <span className="font-bold text-[var(--text-color)]">{globalStats.totalUsers} ta</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] flex items-center gap-2.5">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-[var(--sub-color)] block font-medium">Absolyut Rekord</span>
                <span className="font-bold text-amber-400">{globalStats.maxWpm} WPM ({globalStats.topUser})</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-[10px] text-[var(--sub-color)] block font-medium">O&apos;rtacha Tezlik</span>
                <span className="font-bold text-[var(--text-color)]">{globalStats.avgWpm} WPM</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] flex items-center gap-2.5">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-[var(--sub-color)] block font-medium">O&apos;rtacha Aniqlik</span>
                <span className="font-bold text-emerald-400">{globalStats.avgAccuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. My Rank Notification Bar (If logged-in user has record) */}
      {myRankingInfo && (
        <div className="bg-gradient-to-r from-[var(--main-color)]/20 via-[var(--main-color)]/10 to-transparent border border-[var(--main-color)]/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--main-color)] text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
              #{myRankingInfo.rank}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
                <span>Sizning o&apos;rningiz: #{myRankingInfo.rank}</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--main-color)]/20 text-[var(--main-color)] font-extrabold text-xs">
                  {myRankingInfo.valueString}
                </span>
                <span className="text-emerald-400 font-bold text-xs">
                  ({myRankingInfo.percentile})
                </span>
              </div>
              <p className="text-[11px] text-[var(--sub-color)]">
                {currentUser?.displayName || currentUser?.username} • Jami {myRankingInfo.total} ishtirokchi orasida
              </p>
            </div>
          </div>

          <button
            onClick={handleJumpToMyRank}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <span>Qatorimga o&apos;tish</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Top Mode Category Tabs */}
      <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-3xl p-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {/* Umumiy */}
          <button
            onClick={() => {
              setCategory('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === 'all'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Umumiy (All-Time)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === 'all' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.all}
            </span>
          </button>

          {/* 15 soniya */}
          <button
            onClick={() => {
              setCategory('15');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === '15'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>15 soniya</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === '15' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.time15}
            </span>
          </button>

          {/* 30 soniya */}
          <button
            onClick={() => {
              setCategory('30');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === '30'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>30 soniya</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === '30' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.time30}
            </span>
          </button>

          {/* 60 soniya */}
          <button
            onClick={() => {
              setCategory('60');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === '60'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>60 soniya</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === '60' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.time60}
            </span>
          </button>

          {/* 120 soniya */}
          <button
            onClick={() => {
              setCategory('120');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === '120'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>120 soniya</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === '120' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.time120}
            </span>
          </button>

          {/* XP & Level */}
          <button
            onClick={() => {
              setCategory('xp');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === 'xp'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Tajriba (XP)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === 'xp' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.xp}
            </span>
          </button>

          {/* Aniqlik Ustalari */}
          <button
            onClick={() => {
              setCategory('accuracy');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === 'accuracy'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Aniqlik (Accuracy)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === 'accuracy' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.accuracy}
            </span>
          </button>

          {/* Eng Faol Teruvchilar */}
          <button
            onClick={() => {
              setCategory('activity');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              category === 'activity'
                ? 'bg-[var(--main-color)] text-white shadow-md'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/60'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Eng Faollar</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              category === 'activity' ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--sub-color)]'
            }`}>
              {categoryCounts.activity}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Top 3 Podium (Shown on Page 1 without search filter) */}
      {topPodium.length >= 3 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-6 items-end pt-5 pb-3">
          {/* 2nd Place (Silver) */}
          <div
            onClick={() => openUserProfile(topPodium[1])}
            className="bg-[var(--card-bg)]/90 border border-slate-300/40 rounded-3xl p-3 sm:p-5 text-center cursor-pointer transition-all hover:scale-[1.02] hover:border-slate-300 relative shadow-sm group"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md">
              2
            </div>
            <img
              src={topPodium[1].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${topPodium[1].uid}`}
              alt="avatar"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 border-2 border-slate-300 object-cover bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center justify-center gap-1">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-color)] truncate max-w-[120px] sm:max-w-[160px]">
                {topPodium[1].displayName}
              </h3>
              {topPodium[1].isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
            </div>
            <div className="text-sm sm:text-xl font-black text-slate-300 mt-1">
              {category === 'xp' ? `${topPodium[1].displayValue.toLocaleString()} XP` : `${topPodium[1].displayValue} WPM`}
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--sub-color)] mt-0.5">
              {topPodium[1].highestAccuracy}% aniqlik • Lvl {topPodium[1].level}
            </div>
          </div>

          {/* 1st Place (Gold Champion) */}
          <div
            onClick={() => openUserProfile(topPodium[0])}
            className="bg-gradient-to-b from-amber-500/20 via-[var(--card-bg)] to-[var(--card-bg)] border-2 border-amber-400/90 rounded-3xl p-4 sm:p-6 text-center cursor-pointer transition-all hover:scale-[1.03] relative shadow-xl -translate-y-3 group"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs flex items-center justify-center shadow-lg animate-bounce">
              <Crown className="w-5 h-5 fill-amber-950" />
            </div>
            <img
              src={topPodium[0].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${topPodium[0].uid}`}
              alt="avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 border-3 border-amber-400 object-cover bg-[var(--sub-alt)] shadow-lg group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-sm sm:text-base font-black text-[var(--text-color)] truncate max-w-[140px] sm:max-w-[200px]">
                {topPodium[0].displayName}
              </h3>
              {topPodium[0].isVerified && (
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              )}
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-400 mt-1 drop-shadow-sm">
              {category === 'xp' ? `${topPodium[0].displayValue.toLocaleString()} XP` : `${topPodium[0].displayValue} WPM`}
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--sub-color)] font-medium mt-0.5">
              {topPodium[0].highestAccuracy}% aniqlik • {topPodium[0].totalTests} ta test • Lvl {topPodium[0].level}
            </div>
          </div>

          {/* 3rd Place (Bronze) */}
          <div
            onClick={() => openUserProfile(topPodium[2])}
            className="bg-[var(--card-bg)]/90 border border-amber-700/40 rounded-3xl p-3 sm:p-5 text-center cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-700 relative shadow-sm group"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md">
              3
            </div>
            <img
              src={topPodium[2].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${topPodium[2].uid}`}
              alt="avatar"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 border-2 border-amber-700 object-cover bg-[var(--sub-alt)] group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center justify-center gap-1">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-color)] truncate max-w-[120px] sm:max-w-[160px]">
                {topPodium[2].displayName}
              </h3>
              {topPodium[2].isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
            </div>
            <div className="text-sm sm:text-xl font-black text-amber-600 mt-1">
              {category === 'xp' ? `${topPodium[2].displayValue.toLocaleString()} XP` : `${topPodium[2].displayValue} WPM`}
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--sub-color)] mt-0.5">
              {topPodium[2].highestAccuracy}% aniqlik • Lvl {topPodium[2].level}
            </div>
          </div>
        </div>
      )}

      {/* 5. Control Bar: Search, Filters, Sorting, Page size */}
      <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--sub-color)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Ism, username yoki davlat bo'yicha izlash..."
            className="w-full pl-10 pr-9 py-2 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl text-xs text-[var(--text-color)] outline-none focus:border-[var(--main-color)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[var(--sub-color)] hover:text-[var(--text-color)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Verified toggle */}
          <button
            onClick={() => {
              setVerifiedOnly(!verifiedOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              verifiedOnly
                ? 'bg-sky-500/15 border-sky-400 text-sky-400 shadow-xs'
                : 'border-[var(--sub-alt)] bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faqat tasdiqlanganlar</span>
          </button>

          {/* Sort selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--sub-color)] hidden sm:inline">Saralash:</span>
            <select
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as SortField);
                setCurrentPage(1);
              }}
              className="bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--text-color)] text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="metric">Asosiy ko&apos;rsatkich (WPM/XP)</option>
              <option value="accuracy">Aniqlik bo&apos;yicha</option>
              <option value="tests">Testlar soni bo&apos;yicha</option>
              <option value="level">Level bo&apos;yicha</option>
              <option value="date">So&apos;nggi faollik bo&apos;yicha</option>
            </select>
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--text-color)] text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value={10}>10 tadan</option>
            <option value={15}>15 tadan</option>
            <option value={25}>25 tadan</option>
            <option value={50}>50 tadan</option>
            <option value={100}>100 tadan</option>
          </select>
        </div>
      </div>

      {/* 6. Main High-Precision Leaderboard Table */}
      <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-3xl p-3 sm:p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-[var(--sub-color)]">
            <span>Ko&apos;rsatilmoqda: </span>
            <span className="font-bold text-[var(--text-color)]">{currentTotal}</span>
            <span> ta ishtirokchidan {pageItems.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, currentTotal)}` : 0} oralig&apos;i</span>
          </div>

          {/* Pagination Navigation */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-[var(--sub-alt)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-[var(--main-color)] px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-[var(--sub-alt)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[var(--sub-color)] border-b border-[var(--sub-alt)] text-[11px] uppercase tracking-wider">
                <th className="pb-3 px-3 w-14 font-bold"># O&apos;rin</th>
                <th className="pb-3 px-3">Ishtirokchi</th>
                <th className="pb-3 px-3 text-center">Rejim</th>
                <th className="pb-3 px-3 text-right font-black text-[var(--main-color)]">
                  {category === 'xp' ? 'XP Ball' : category === 'accuracy' ? 'Aniqlik' : category === 'activity' ? 'Testlar' : 'Tezlik (WPM)'}
                </th>
                <th className="pb-3 px-3 text-right">Aniqlik</th>
                <th className="pb-3 px-3 text-right hidden sm:table-cell">Testlar</th>
                <th className="pb-3 px-3 text-right hidden md:table-cell">Daraja</th>
                <th className="pb-3 px-3 text-right">So&apos;nggi Faollik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sub-alt)]/30">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--sub-color)]">
                    <p className="font-bold text-sm text-[var(--text-color)] mb-1">
                      Natijalar topilmadi
                    </p>
                    <p className="text-xs">Ushbu parametr bo&apos;yicha hech qanday ishtirokchi topilmadi.</p>
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const isSelf = currentUser?.uid === item.uid;

                  return (
                    <tr
                      key={item.uid}
                      onClick={() => openUserProfile(item)}
                      className={`cursor-pointer transition-all hover:bg-[var(--sub-alt)]/40 ${
                        isSelf ? 'bg-[var(--main-color)]/10 font-bold border-l-2 border-[var(--main-color)]' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-3 font-bold text-[var(--sub-color)]">
                        {item.rank === 1 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-black">
                            <Crown className="w-4 h-4 fill-amber-400" />
                            <span>1</span>
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="inline-flex items-center gap-1 text-slate-300 font-bold">
                            <Award className="w-4 h-4 text-slate-300" />
                            <span>2</span>
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                            <Award className="w-4 h-4 text-amber-700" />
                            <span>3</span>
                          </span>
                        ) : (
                          <span className="px-1">{item.rank}</span>
                        )}
                      </td>

                      {/* User Info Column */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover shrink-0 bg-[var(--sub-alt)] border border-[var(--sub-alt)]"
                          />
                          <div className="truncate max-w-[130px] sm:max-w-[190px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[var(--text-color)] font-semibold truncate">
                                {item.displayName}
                              </span>
                              {item.isVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              )}
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-[var(--main-color)] text-white text-[8px] font-black uppercase shrink-0">
                                  siz
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--sub-color)] block truncate">
                              @{item.username} • {item.country || '🇺🇿 Uzbekistan'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mode Badge Column */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--sub-alt)]/60 text-[var(--main-color)] font-mono text-[10px] font-bold border border-[var(--sub-alt)]">
                          <Clock className="w-3 h-3 text-[var(--main-color)] shrink-0" />
                          <span>{item.modeLabel}</span>
                        </span>
                      </td>

                      {/* Primary Value Column */}
                      <td className={`py-3 px-3 text-right text-sm sm:text-base ${getSpeedBadgeClass(item.displayValue)}`}>
                        {category === 'xp' ? (
                          item.xp.toLocaleString()
                        ) : category === 'accuracy' ? (
                          `${item.highestAccuracy}%`
                        ) : category === 'activity' ? (
                          `${item.totalTests} ta`
                        ) : (
                          item.displayValue
                        )}
                      </td>

                      {/* Accuracy Column */}
                      <td className="py-3 px-3 text-right text-[var(--text-color)] font-semibold">
                        <span className={item.highestAccuracy >= 98 ? 'text-emerald-400' : ''}>
                          {item.highestAccuracy > 0 ? `${item.highestAccuracy}%` : '0%'}
                        </span>
                      </td>

                      {/* Total Tests Column */}
                      <td className="py-3 px-3 text-right text-[var(--sub-color)] hidden sm:table-cell">
                        {item.totalTests} ta
                      </td>

                      {/* Level Column */}
                      <td className="py-3 px-3 text-right text-[var(--sub-color)] hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--sub-alt)] text-[10px] font-bold text-[var(--text-color)]">
                          Lvl {item.level}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="py-3 px-3 text-right text-[var(--sub-color)] text-[11px]">
                        {item.dateFormatted}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Info */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--sub-alt)] text-xs text-[var(--sub-color)]">
          <div>
            Sahifa {currentPage} dan {totalPages} gacha
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-xl border border-[var(--sub-alt)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs"
            >
              Oldingi
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-xl border border-[var(--sub-alt)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <PublicProfileModal
        userProfile={selectedProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
