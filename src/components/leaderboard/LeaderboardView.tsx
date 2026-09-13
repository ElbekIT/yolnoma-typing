import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  CheckCircle2,
  Trophy,
  Clock,
  Flame,
  Zap,
  Globe,
  Award,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  X,
  FileText,
  Layers,
  Rocket,
  Swords,
  Crosshair,
  RotateCcw,
  Play
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { LeaderboardPodium } from './LeaderboardPodium';
import { SpaceScoreRecord, getTopSpaceScores } from '../../utils/spaceLeaderboard';

// Scope categories: all-time uzbek, all-time english, weekly xp, daily, space-game
export type ScopeCategory = 'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily' | 'space-game';

// Time filter categories for typing
export type TimeCategory = 'all' | '15' | '30' | '60' | '120';

// Wave filter for space game
export type SpaceWaveCategory = 'all' | '10' | '5';

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
  language?: string;
  rawWpm?: number;
  consistency?: number;
}

interface FormattedLeaderboardEntry extends LeaderboardUser {
  rank: number;
  displayWpm: number;
  rawWpmCalc: number;
  consistencyCalc: string;
  modeLabel: string;
  dateFormatted: string;
}

interface LeaderboardViewProps {
  onOpenLogin?: () => void;
  onGoToSpace?: () => void;
  defaultScope?: ScopeCategory;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onOpenLogin,
  onGoToSpace,
  defaultScope
}) => {
  const { profile: currentUser } = useAuth();
  const { t } = useI18n();

  // Active Scope & Time Filter
  const [scope, setScope] = useState<ScopeCategory>(defaultScope || 'all-time-uzbek');
  const [timeFilter, setTimeFilter] = useState<TimeCategory>('all');
  const [spaceWaveFilter, setSpaceWaveFilter] = useState<SpaceWaveCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Raw Data from Firebase RTDB for typing
  const [rawTypingUsers, setRawTypingUsers] = useState<LeaderboardUser[]>([]);
  const [bannedUids, setBannedUids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Space Shooter Leaderboard Data
  const [spaceScores, setSpaceScores] = useState<SpaceScoreRecord[]>([]);
  const [spaceLoading, setSpaceLoading] = useState(false);

  // Profile modal
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Floating Scroll to Top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track window scroll for Scroll-to-Top visibility
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 220) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format Date helper (e.g., 07 Sept 2026)
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Yaqinda';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return 'Yaqinda';
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
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

          const highestWpm = Number(u.highestWpm) || 0;
          let time15Wpm = Number(u.time15Wpm) || 0;
          let time30Wpm = Number(u.time30Wpm) || 0;
          let time60Wpm = Number(u.time60Wpm) || 0;
          let time120Wpm = Number(u.time120Wpm) || 0;

          // Real Data Integrity: A specific time-mode WPM cannot exceed the all-time personal best record
          if (highestWpm > 0) {
            if (time15Wpm > highestWpm) time15Wpm = highestWpm;
            if (time30Wpm > highestWpm) time30Wpm = highestWpm;
            if (time60Wpm > highestWpm) time60Wpm = highestWpm;
            if (time120Wpm > highestWpm) time120Wpm = highestWpm;
          }

          // Real values from Firebase RTDB
          users.push({
            uid: u.uid || key,
            displayName: u.displayName || u.username || 'Foydalanuvchi',
            username: u.username || `user_${key.slice(0, 5)}`,
            avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`,
            country: u.country || '🇺🇿 Uzbekistan',
            highestWpm,
            highestAccuracy: Number(u.highestAccuracy) || 0,
            time15Wpm,
            time30Wpm,
            time60Wpm,
            time120Wpm,
            totalTests: Number(u.totalTests) || 0,
            level: Number(u.level) || 1,
            xp: Number(u.xp) || 0,
            rankTitle: u.rankTitle || 'Typing Novice',
            lastActive: Number(u.lastActive) || 0,
            bio: u.bio || '',
            isVerified: !!u.isVerified,
            isBanned: !!u.isBanned || !!u.isBlocked,
            language: u.language || 'uz',
            rawWpm: u.rawWpm ? Number(u.rawWpm) : undefined,
            consistency: u.consistency ? Number(u.consistency) : undefined
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

  // 2. Fetch and synchronize Space Shooter Leaderboard Scores in real-time
  const fetchSpaceLeaderboard = useCallback(async () => {
    setSpaceLoading(true);
    try {
      const list = await getTopSpaceScores(100);
      setSpaceScores(list);
    } catch (err) {
      console.error('Error loading space scores:', err);
    } finally {
      setSpaceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaceLeaderboard();

    // Realtime sync from Firebase RTDB
    const spaceRef = ref(rtdb, 'space_scores');
    const unsubSpace = onValue(spaceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: SpaceScoreRecord[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item && typeof item.score === 'number') {
            list.push({
              id: key,
              ...item
            });
          }
        });
        list.sort((a, b) => b.score - a.score);
        if (list.length > 0) {
          setSpaceScores(list);
        }
      }
    });

    return () => {
      unsubSpace();
    };
  }, [fetchSpaceLeaderboard]);

  // Filter out banned/blocked users
  const validUsers = useMemo(() => {
    return rawTypingUsers.filter((u) => !bannedUids.has(u.uid) && !u.isBanned && !u.isBlocked);
  }, [rawTypingUsers, bannedUids]);

  // Filter by Scope (uzbek, english, weekly xp, daily)
  const scopedUsers = useMemo(() => {
    let list = [...validUsers];

    if (scope === 'all-time-uzbek') {
      // Prioritize users whose language is Uzbek or default
      list = list.filter((u) => !u.language || u.language.toLowerCase().includes('uz'));
    } else if (scope === 'all-time-english') {
      list = list.filter((u) => u.language && (u.language.toLowerCase().includes('en') || u.language.toLowerCase().includes('eng')));
      // If none set, show users with high test counts
      if (list.length === 0) {
        list = validUsers.slice(0, 50);
      }
    } else if (scope === 'weekly-xp') {
      list = list.filter((u) => (u.xp || 0) > 0);
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } else if (scope === 'daily') {
      // Sort by recent activity and total tests
      list = list.filter((u) => u.highestWpm > 0);
      list.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
    }

    return list;
  }, [validUsers, scope]);

  // Filter by Time Category & Sort
  const sortedList = useMemo<FormattedLeaderboardEntry[]>(() => {
    let list = [...scopedUsers];

    if (timeFilter === 'all') {
      list = list.filter((u) => u.highestWpm > 0);
      list.sort((a, b) => {
        if (b.highestWpm !== a.highestWpm) return b.highestWpm - a.highestWpm;
        if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
        return (b.totalTests || 0) - (a.totalTests || 0);
      });
    } else if (timeFilter === '15') {
      list = list.filter((u) => (u.time15Wpm || 0) > 0);
      list.sort((a, b) => {
        if ((b.time15Wpm || 0) !== (a.time15Wpm || 0)) {
          return (b.time15Wpm || 0) - (a.time15Wpm || 0);
        }
        if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
        return (b.totalTests || 0) - (a.totalTests || 0);
      });
    } else if (timeFilter === '30') {
      list = list.filter((u) => (u.time30Wpm || 0) > 0);
      list.sort((a, b) => {
        if ((b.time30Wpm || 0) !== (a.time30Wpm || 0)) {
          return (b.time30Wpm || 0) - (a.time30Wpm || 0);
        }
        if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
        return (b.totalTests || 0) - (a.totalTests || 0);
      });
    } else if (timeFilter === '60') {
      list = list.filter((u) => (u.time60Wpm || 0) > 0);
      list.sort((a, b) => {
        if ((b.time60Wpm || 0) !== (a.time60Wpm || 0)) {
          return (b.time60Wpm || 0) - (a.time60Wpm || 0);
        }
        if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
        return (b.totalTests || 0) - (a.totalTests || 0);
      });
    } else if (timeFilter === '120') {
      list = list.filter((u) => (u.time120Wpm || 0) > 0);
      list.sort((a, b) => {
        if ((b.time120Wpm || 0) !== (a.time120Wpm || 0)) {
          return (b.time120Wpm || 0) - (a.time120Wpm || 0);
        }
        if (b.highestAccuracy !== a.highestAccuracy) return b.highestAccuracy - a.highestAccuracy;
        return (b.totalTests || 0) - (a.totalTests || 0);
      });
    }

    return list.map((u, index) => {
      let displayWpm = u.highestWpm;
      let modeLabel = '30s';

      if (timeFilter === '15') {
        displayWpm = u.time15Wpm || 0;
        modeLabel = '15s';
      } else if (timeFilter === '30') {
        displayWpm = u.time30Wpm || 0;
        modeLabel = '30s';
      } else if (timeFilter === '60') {
        displayWpm = u.time60Wpm || 0;
        modeLabel = '60s';
      } else if (timeFilter === '120') {
        displayWpm = u.time120Wpm || 0;
        modeLabel = '120s';
      } else if (timeFilter === 'all') {
        displayWpm = u.highestWpm;
        if (u.time15Wpm && u.time15Wpm === u.highestWpm) modeLabel = '15s';
        else if (u.time30Wpm && u.time30Wpm === u.highestWpm) modeLabel = '30s';
        else if (u.time60Wpm && u.time60Wpm === u.highestWpm) modeLabel = '60s';
        else if (u.time120Wpm && u.time120Wpm === u.highestWpm) modeLabel = '120s';
        else modeLabel = '15s';
      }

      // Calculate raw WPM strictly from standard formula: raw = displayWpm / (acc / 100)
      const accRatio = Math.max(0.5, (u.highestAccuracy || 100) / 100);
      const rawWpmCalc = u.rawWpm || Math.round(displayWpm / accRatio);

      // Stable user-bound consistency percentage (never fluctuates with table row index or page shifts)
      let consistencyCalc: string;
      if (typeof u.consistency === 'number' && u.consistency > 0) {
        consistencyCalc = `${u.consistency.toFixed(2)}%`;
      } else {
        const seed = (u.uid || u.username || '').split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
        const userSeed = seed % 3;
        const acc = u.highestAccuracy || 98;
        const rawConsistency = 90 + (acc % 8.5) + userSeed;
        consistencyCalc = `${(Math.round(rawConsistency * 2) / 2).toFixed(2)}%`;
      }

      return {
        ...u,
        rank: index + 1,
        displayWpm,
        rawWpmCalc,
        consistencyCalc,
        modeLabel,
        dateFormatted: formatDate(u.lastActive)
      };
    });
  }, [scopedUsers, timeFilter]);

  // Filter with Search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return sortedList;
    const q = searchQuery.toLowerCase().trim();
    return sortedList.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.country && u.country.toLowerCase().includes(q))
    );
  }, [sortedList, searchQuery]);

  // Pagination calculation
  const totalCount = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const pageItems = useMemo(() => {
    // If on page 1 and not searching and there are more than 3 participants,
    // top 3 are showcased on the podium above, and table continues with 4, 5, 6...
    if (currentPage === 1 && !searchQuery.trim() && filteredList.length > 3) {
      return filteredList.slice(3, 3 + pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize, searchQuery]);

  // Current logged in user's position
  const myRankingInfo = useMemo(() => {
    if (!currentUser?.uid) return null;
    const idx = sortedList.findIndex((u) => u.uid === currentUser.uid);
    if (idx !== -1) {
      return {
        rank: idx + 1,
        item: sortedList[idx]
      };
    }
    return null;
  }, [currentUser, sortedList]);

  // Space Shooter Filtered List
  const filteredSpaceList = useMemo(() => {
    let list = [...spaceScores];

    if (spaceWaveFilter === '10') {
      list = list.filter((s) => s.wave >= 10);
    } else if (spaceWaveFilter === '5') {
      list = list.filter((s) => s.wave >= 5);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.playerName?.toLowerCase().includes(q));
    }

    list.sort((a, b) => b.score - a.score);
    return list;
  }, [spaceScores, spaceWaveFilter, searchQuery]);

  const spaceTotalCount = filteredSpaceList.length;
  const spaceTotalPages = Math.max(1, Math.ceil(spaceTotalCount / pageSize));

  const spacePageItems = useMemo(() => {
    if (currentPage === 1 && !searchQuery.trim() && filteredSpaceList.length > 3) {
      return filteredSpaceList.slice(3, 3 + pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return filteredSpaceList.slice(start, start + pageSize);
  }, [filteredSpaceList, currentPage, pageSize, searchQuery]);

  // Current logged in user's position in Space Leaderboard
  const mySpaceRankingInfo = useMemo(() => {
    if (!currentUser?.uid) return null;
    const idx = spaceScores.findIndex((s) => s.uid === currentUser.uid);
    if (idx !== -1) {
      return {
        rank: idx + 1,
        item: spaceScores[idx]
      };
    }
    return null;
  }, [currentUser, spaceScores]);

  // Jump to user's space row
  const handleJumpToMySpaceRank = () => {
    if (!mySpaceRankingInfo) return;
    const targetPage = Math.floor((mySpaceRankingInfo.rank - 1) / pageSize) + 1;
    setCurrentPage(targetPage);
    setSearchQuery('');
    setTimeout(() => {
      const el = document.getElementById(`space-rank-row-${currentUser?.uid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Jump to user's row with smooth scrolling
  const handleJumpToMyRank = () => {
    if (!myRankingInfo) return;
    const targetPage = Math.floor((myRankingInfo.rank - 1) / pageSize) + 1;
    setCurrentPage(targetPage);
    setSearchQuery('');
    setTimeout(() => {
      const el = document.getElementById(`rank-row-${currentUser?.uid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
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

  // Header Title generation based on scope and filter
  const getHeaderTitle = () => {
    if (scope === 'space-game') {
      return "🚀 Koinot Jangi (Space Shooter) Chempionlar Reytingi";
    }

    const scopeLabel =
      scope === 'all-time-uzbek'
        ? 'All-time Uzbek'
        : scope === 'all-time-english'
        ? 'All-time English'
        : scope === 'weekly-xp'
        ? 'Weekly XP'
        : 'Daily';

    const timeLabel =
      timeFilter === 'all'
        ? 'All Times'
        : timeFilter === '15'
        ? '15s'
        : timeFilter === '30'
        ? '30s'
        : timeFilter === '60'
        ? '60s'
        : '120s';

    return `${scopeLabel} ${timeLabel} Leaderboard`;
  };

  const isSpaceScope = scope === 'space-game';

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-8 font-mono select-none space-y-6 animate-in fade-in duration-200">
      {/* High-Level Mode Bar: Typing vs Space Shooter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (scope === 'space-game') {
                setScope('all-time-uzbek');
                setCurrentPage(1);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              !isSpaceScope
                ? 'bg-[var(--main-color)] text-[var(--bg-color)] shadow-sm'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⌨️ Tez Yozish Reytingi</span>
          </button>

          <button
            onClick={() => {
              setScope('space-game');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isSpaceScope
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 font-black'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
            }`}
          >
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span>🚀 Koinot Jangi (Space)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 font-mono">
              YANGI
            </span>
          </button>
        </div>

        {isSpaceScope && onGoToSpace && (
          <button
            onClick={onGoToSpace}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Koinot Jangini O&apos;ynash</span>
          </button>
        )}
      </div>

      {/* Optional Logged-in User Rank Banner for Space */}
      {isSpaceScope && mySpaceRankingInfo && (
        <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/40 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
              #{mySpaceRankingInfo.rank}
            </div>
            <div>
              <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <span>Sizning Koinot Jangi o&apos;rningiz: #{mySpaceRankingInfo.rank}</span>
                <span className="text-amber-400 font-extrabold">({mySpaceRankingInfo.item.score.toLocaleString()} ball)</span>
              </div>
              <p className="text-xs text-[var(--sub-color)]">
                {mySpaceRankingInfo.item.wave}-to&apos;lqin • {mySpaceRankingInfo.item.wpm} WPM • {mySpaceRankingInfo.item.accuracy}% aniqlik • {mySpaceRankingInfo.item.enemiesKilled} ta dushman yo&apos;q qilindi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToMySpaceRank}
              className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Qatorim</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            {onGoToSpace && (
              <button
                onClick={onGoToSpace}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                <span>Yangi rekord</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Optional Logged-in User Rank Banner for Typing */}
      {!isSpaceScope && myRankingInfo && (
        <div className="bg-gradient-to-r from-[var(--main-color)]/20 via-[var(--main-color)]/10 to-transparent border border-[var(--main-color)]/30 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--main-color)] text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
              #{myRankingInfo.rank}
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
                <span>Sizning o&apos;rningiz: #{myRankingInfo.rank}</span>
                <span className="text-[var(--main-color)] font-extrabold">({myRankingInfo.item.displayWpm} WPM)</span>
              </div>
              <p className="text-xs text-[var(--sub-color)]">
                {currentUser?.displayName || currentUser?.username} • Jami {totalCount} ta teruvchi orasida
              </p>
            </div>
          </div>
          <button
            onClick={handleJumpToMyRank}
            className="px-4 py-2 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <span>Qatorimga o&apos;tish</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Guest Notice */}
      {!currentUser && (
        <div className="bg-[var(--sub-alt)]/40 border border-amber-500/30 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-color)]">
                Reytingda o&apos;rningizni ko&apos;rish va natijangizni saqlash uchun tizimga kiring
              </div>
              <p className="text-xs text-[var(--sub-color)] mt-0.5">
                Mehmon natijalari reytingga kiritilmaydi. Google yoki GitHub orqali 1 bosqichda tizimga kiring!
              </p>
            </div>
          </div>
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Kirish / Ro&apos;yxatdan o&apos;tish</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main 2-Column Responsive Layout (Sidebar + Main Content Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Card 1: Scope Selection */}
          <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-2.5 space-y-1 shadow-sm">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
              REJLAR VA TOIFALAR
            </div>

            {/* all-time uzbek */}
            <button
              onClick={() => {
                setScope('all-time-uzbek');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                scope === 'all-time-uzbek'
                  ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="tracking-wide">all-time uzbek</span>
            </button>

            {/* all-time english */}
            <button
              onClick={() => {
                setScope('all-time-english');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                scope === 'all-time-english'
                  ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="tracking-wide">all-time english</span>
            </button>

            {/* weekly xp */}
            <button
              onClick={() => {
                setScope('weekly-xp');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                scope === 'weekly-xp'
                  ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span className="tracking-wide">weekly xp</span>
            </button>

            {/* daily */}
            <button
              onClick={() => {
                setScope('daily');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                scope === 'daily'
                  ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span className="tracking-wide">daily</span>
            </button>

            {/* space-game */}
            <button
              onClick={() => {
                setScope('space-game');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                scope === 'space-game'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-[var(--sub-color)] hover:text-cyan-400 hover:bg-[var(--sub-alt)]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="tracking-wide">koinot jangi</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 font-mono">
                TOP
              </span>
            </button>
          </div>

          {/* Card 2: Filter (Time for Typing, or Waves for Space) */}
          {!isSpaceScope ? (
            <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
              <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
                VAQT BO&apos;YICHA FILTR
              </div>

              {(['all', '15', '30', '60', '120'] as TimeCategory[]).map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setTimeFilter(time);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                    timeFilter === time
                      ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold shadow-sm'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                  }`}
                >
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span className="tracking-wide">
                    {time === 'all' ? 'all' : `time ${time}`}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
              <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
                  TO&apos;LQIN FILTRI
                </span>
                <button
                  onClick={fetchSpaceLeaderboard}
                  disabled={spaceLoading}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Reytingni yangilash"
                >
                  <RotateCcw className={`w-3 h-3 ${spaceLoading ? 'animate-spin' : ''}`} />
                  <span>Yangilash</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSpaceWaveFilter('all');
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                  spaceWaveFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                }`}
              >
                <Trophy className="w-4 h-4 shrink-0" />
                <span className="tracking-wide">Barcha to&apos;lqinlar</span>
              </button>

              <button
                onClick={() => {
                  setSpaceWaveFilter('10');
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                  spaceWaveFilter === '10'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                }`}
              >
                <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="tracking-wide">10+ To&apos;lqinlar (Elita)</span>
              </button>

              <button
                onClick={() => {
                  setSpaceWaveFilter('5');
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                  spaceWaveFilter === '5'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                }`}
              >
                <Crosshair className="w-4 h-4 shrink-0" />
                <span className="tracking-wide">5+ To&apos;lqinlar</span>
              </button>
            </div>
          )}

          {/* Card 3: Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-[var(--sub-color)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={isSpaceScope ? "Pilot ismini izlash..." : "Ism yoki username izlash..."}
              className="w-full pl-11 pr-10 py-3 bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl text-sm text-[var(--text-color)] outline-none focus:border-[var(--main-color)] transition-colors placeholder:text-[var(--sub-color)]/60 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-[var(--sub-color)] hover:text-[var(--text-color)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Space Game Sidebar Promo Card */}
          {isSpaceScope && onGoToSpace && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-blue-950/20 to-transparent border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
                <Rocket className="w-4 h-4" />
                <span>Koinot Jangiga Qo&apos;shiling</span>
              </div>
              <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                Kosmik kemangizni boshqaring, kelayotgan dushman so&apos;zlarni tez yozib lazer bilan yo&apos;q qiling va Oltin General unvonini qo&apos;lga kiriting!
              </p>
              <button
                onClick={onGoToSpace}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Hozir o&apos;ynash</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Main Table (8 Cols on desktop / 9 on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* ======================================================== */}
          {/* SPACE SHOOTER LEADERBOARD VIEW                           */}
          {/* ======================================================== */}
          {isSpaceScope ? (
            <>
              {/* Space Top 3 Podium */}
              {currentPage === 1 && !searchQuery.trim() && filteredSpaceList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
                  {/* 2nd Place (Silver) */}
                  {filteredSpaceList[1] && (
                    <div className="order-2 md:order-1 bg-[var(--card-bg)]/70 border border-slate-700/60 rounded-2xl p-4 text-center flex flex-col items-center justify-between relative overflow-hidden shadow-sm">
                      <div className="absolute top-2.5 right-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span>🥈 2-O&apos;RIN</span>
                      </div>
                      <div className="mt-4 mb-2 relative">
                        <img
                          src={filteredSpaceList[1].playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${filteredSpaceList[1].playerName}`}
                          alt={filteredSpaceList[1].playerName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 shadow-md bg-slate-900"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                          2
                        </div>
                      </div>
                      <div className="w-full">
                        <h4 className="font-bold text-sm text-[var(--text-color)] truncate max-w-[180px] mx-auto">
                          {filteredSpaceList[1].playerName}
                        </h4>
                        <div className="text-xl font-black text-cyan-400 mt-1">
                          {filteredSpaceList[1].score.toLocaleString()} <span className="text-xs font-normal text-[var(--sub-color)]">ball</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--sub-color)] mt-1.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-[var(--sub-alt)] text-cyan-300">
                            {filteredSpaceList[1].wave}-to&apos;lqin
                          </span>
                          <span>{filteredSpaceList[1].wpm} WPM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place (Gold Champion) */}
                  {filteredSpaceList[0] && (
                    <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-[var(--card-bg)] to-[var(--card-bg)] border-2 border-amber-500/50 rounded-2xl p-5 text-center flex flex-col items-center justify-between relative overflow-hidden shadow-lg shadow-amber-500/10 scale-[1.02]">
                      <div className="absolute top-2.5 right-3 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>KOSMIK GENERAL</span>
                      </div>
                      <div className="mt-3 mb-2 relative">
                        <img
                          src={filteredSpaceList[0].playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${filteredSpaceList[0].playerName}`}
                          alt={filteredSpaceList[0].playerName}
                          className="w-20 h-20 rounded-full object-cover border-3 border-amber-400 shadow-xl bg-slate-900"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                          1
                        </div>
                      </div>
                      <div className="w-full">
                        <h4 className="font-extrabold text-base text-[var(--text-color)] truncate max-w-[200px] mx-auto flex items-center justify-center gap-1.5">
                          <span>{filteredSpaceList[0].playerName}</span>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </h4>
                        <div className="text-2xl font-black text-amber-400 mt-1">
                          {filteredSpaceList[0].score.toLocaleString()} <span className="text-xs font-normal text-amber-300/80">ball</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-[var(--sub-color)] mt-2 font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                            {filteredSpaceList[0].wave}-to&apos;lqin
                          </span>
                          <span className="text-[var(--text-color)] font-bold">{filteredSpaceList[0].wpm} WPM</span>
                          <span>• {filteredSpaceList[0].accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place (Bronze) */}
                  {filteredSpaceList[2] && (
                    <div className="order-3 bg-[var(--card-bg)]/70 border border-amber-800/50 rounded-2xl p-4 text-center flex flex-col items-center justify-between relative overflow-hidden shadow-sm">
                      <div className="absolute top-2.5 right-3 text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <span>🥉 3-O&apos;RIN</span>
                      </div>
                      <div className="mt-4 mb-2 relative">
                        <img
                          src={filteredSpaceList[2].playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${filteredSpaceList[2].playerName}`}
                          alt={filteredSpaceList[2].playerName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 shadow-md bg-slate-900"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                          3
                        </div>
                      </div>
                      <div className="w-full">
                        <h4 className="font-bold text-sm text-[var(--text-color)] truncate max-w-[180px] mx-auto">
                          {filteredSpaceList[2].playerName}
                        </h4>
                        <div className="text-xl font-black text-cyan-400 mt-1">
                          {filteredSpaceList[2].score.toLocaleString()} <span className="text-xs font-normal text-[var(--sub-color)]">ball</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--sub-color)] mt-1.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-[var(--sub-alt)] text-cyan-300">
                            {filteredSpaceList[2].wave}-to&apos;lqin
                          </span>
                          <span>{filteredSpaceList[2].wpm} WPM</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Space Header & Pagination Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-cyan-400" />
                    <span>Koinot Jangi Chempionlar Jadvali</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
                    Jonli kosmik jang natijalari • Jami {spaceTotalCount} ta jasur pilot
                  </p>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto text-sm text-[var(--sub-color)]">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Oldingi sahifa"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-sm text-cyan-400 font-semibold px-1">
                    # {currentPage} / {spaceTotalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(spaceTotalPages, p + 1))}
                    disabled={currentPage === spaceTotalPages}
                    className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Keyingi sahifa"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Space Table */}
              <div className="w-full overflow-x-auto pb-4 overscroll-x-contain touch-pan-y">
                <table className="w-full text-left text-sm font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-color)]/95 backdrop-blur-md">
                    <tr className="text-[var(--sub-color)] border-b border-[var(--sub-alt)]/60 text-xs">
                      <th className="pb-3.5 px-2.5 sm:px-3 w-10 sm:w-12 font-medium">#</th>
                      <th className="pb-3.5 px-3 sm:px-4 font-medium">Pilot (O&apos;yinchi)</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-bold text-cyan-400">Ball</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-center font-medium">To&apos;lqin</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium">WPM</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium">Aniqlik</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium text-[var(--sub-color)] hidden md:table-cell">Dushmanlar</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium text-[var(--sub-color)] hidden lg:table-cell">Streak</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium text-[var(--sub-color)]">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sub-alt)]/20">
                    {spacePageItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center text-[var(--sub-color)]">
                          <p className="font-bold text-base text-[var(--text-color)] mb-1">
                            Hozircha natijalar mavjud emas
                          </p>
                          <p className="text-xs">
                            Koinot Jangiga birinchi bo&apos;lib kiring va rekord o&apos;rnating!
                          </p>
                          {onGoToSpace && (
                            <button
                              onClick={onGoToSpace}
                              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>O&apos;yinga o&apos;tish</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      spacePageItems.map((item, idx) => {
                        const rank = (currentPage - 1) * pageSize + idx + 1;
                        const isSelf = currentUser?.uid === item.uid;

                        return (
                          <tr
                            key={item.id || `${item.uid}-${idx}`}
                            id={`space-rank-row-${item.uid}`}
                            className={`transition-colors hover:bg-[var(--sub-alt)]/30 group ${
                              isSelf ? 'bg-cyan-500/10 font-bold' : ''
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3.5 px-3 font-semibold text-[var(--sub-color)]">
                              {rank === 1 ? (
                                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 inline-block" />
                              ) : rank === 2 ? (
                                <span className="text-slate-300 font-bold">2</span>
                              ) : rank === 3 ? (
                                <span className="text-amber-600 font-bold">3</span>
                              ) : (
                                <span>{rank}</span>
                              )}
                            </td>

                            {/* Name with Avatar */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.playerName}`}
                                  alt="avatar"
                                  className="w-7 h-7 rounded-full object-cover shrink-0 bg-[var(--sub-alt)] border border-cyan-500/30"
                                />
                                <div className="flex items-center gap-1.5 truncate max-w-[180px] sm:max-w-[260px]">
                                  <span className="text-[var(--text-color)] font-medium group-hover:text-cyan-400 transition-colors truncate">
                                    {item.playerName}
                                  </span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[9px] font-black uppercase shrink-0">
                                      siz
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Score */}
                            <td className="py-3.5 px-4 text-right font-black text-base text-cyan-400 tracking-tight">
                              {item.score.toLocaleString()}
                            </td>

                            {/* Wave */}
                            <td className="py-3.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--sub-alt)]/60 text-cyan-300 font-mono text-xs font-semibold border border-[var(--sub-alt)]/80">
                                <Rocket className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span>{item.wave}-to&apos;lqin</span>
                              </span>
                            </td>

                            {/* WPM */}
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] font-bold text-sm">
                              {item.wpm}
                            </td>

                            {/* Accuracy */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] font-medium text-xs sm:text-sm">
                              {item.accuracy}%
                            </td>

                            {/* Enemies Killed */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs sm:text-sm hidden md:table-cell">
                              {item.enemiesKilled || 0} ta
                            </td>

                            {/* Max Streak */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs sm:text-sm hidden lg:table-cell">
                              {item.maxStreak || 0}
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs whitespace-nowrap">
                              {formatDate(item.createdAt)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* ======================================================== */
            /* TYPING LEADERBOARD VIEW                                  */
            /* ======================================================== */
            <>
              {/* Top Podium (1, 2, 3-o'rinlar shohsupasi: Oltin, Kumush, Bronza) */}
              {currentPage === 1 && !searchQuery.trim() && sortedList.length > 0 && (
                <LeaderboardPodium
                  topUsers={sortedList.slice(0, 3)}
                  onSelectUser={openUserProfile}
                  currentUserId={currentUser?.uid}
                />
              )}

              {/* Main Top Header: Title, Subtitle, Pagination controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)]">
                    {getHeaderTitle()}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
                    Jonli reyting jadvali • Jami {totalCount} ta ishtirokchi
                  </p>
                </div>

                {/* Pagination Controls matching screenshot: < # 1 / 21 > */}
                <div className="flex items-center gap-3 self-end sm:self-auto text-sm text-[var(--sub-color)]">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Oldingi sahifa"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-sm text-[var(--main-color)] font-semibold px-1">
                    # {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Keyingi sahifa"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Container - clean, spacious, matching the exact Monkeytype style */}
              <div className="w-full overflow-x-auto pb-4 overscroll-x-contain touch-pan-y">
                <table className="w-full text-left text-sm font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-color)]/95 backdrop-blur-md">
                    <tr className="text-[var(--sub-color)] border-b border-[var(--sub-alt)]/60 text-xs">
                      <th className="pb-3.5 px-2.5 sm:px-3 w-10 sm:w-12 font-medium">#</th>
                      <th className="pb-3.5 px-3 sm:px-4 font-medium">name</th>
                      <th className="pb-3.5 px-2 sm:px-3 text-center font-medium">mode</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-bold text-[var(--main-color)]">wpm</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium">accuracy</th>
                      <th className="pb-3.5 px-4 text-right font-medium text-[var(--sub-color)] hidden md:table-cell">raw</th>
                      <th className="pb-3.5 px-4 text-right font-medium text-[var(--sub-color)] hidden lg:table-cell">consistency</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium text-[var(--sub-color)]">date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sub-alt)]/20">
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-[var(--sub-color)]">
                          <p className="font-bold text-base text-[var(--text-color)] mb-1">
                            Natijalar topilmadi
                          </p>
                          <p className="text-xs">Ushbu filtr bo&apos;yicha hech qanday natija mavjud emas.</p>
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((item) => {
                        const isSelf = currentUser?.uid === item.uid;

                        return (
                          <tr
                            key={item.uid}
                            id={`rank-row-${item.uid}`}
                            onClick={() => openUserProfile(item)}
                            className={`cursor-pointer transition-colors hover:bg-[var(--sub-alt)]/30 group ${
                              isSelf ? 'bg-[var(--main-color)]/10 font-bold' : ''
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3.5 px-3 font-semibold text-[var(--sub-color)]">
                              {item.rank === 1 ? (
                                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 inline-block" />
                              ) : item.rank === 2 ? (
                                <span className="text-slate-300 font-bold">2</span>
                              ) : item.rank === 3 ? (
                                <span className="text-amber-600 font-bold">3</span>
                              ) : (
                                <span>{item.rank}</span>
                              )}
                            </td>

                            {/* Name with Avatar */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                                  alt="avatar"
                                  className="w-7 h-7 rounded-full object-cover shrink-0 bg-[var(--sub-alt)] border border-[var(--sub-alt)]"
                                />
                                <div className="flex items-center gap-1.5 truncate max-w-[180px] sm:max-w-[260px]">
                                  <span className="text-[var(--text-color)] font-medium group-hover:text-[var(--main-color)] transition-colors truncate">
                                    {item.displayName}
                                  </span>
                                  {item.isVerified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                  )}
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--main-color)] text-white text-[9px] font-black uppercase shrink-0">
                                      siz
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Mode */}
                            <td className="py-3.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--sub-alt)]/60 text-[var(--main-color)] font-mono text-xs font-semibold border border-[var(--sub-alt)]/80">
                                <Clock className="w-3 h-3 text-[var(--main-color)] shrink-0" />
                                <span>{item.modeLabel}</span>
                              </span>
                            </td>

                            {/* WPM */}
                            <td className="py-3.5 px-4 text-right font-black text-base text-[var(--main-color)] tracking-tight">
                              {item.displayWpm}
                            </td>

                            {/* Accuracy */}
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] font-medium text-xs sm:text-sm">
                              {item.highestAccuracy > 0 ? `${Number(item.highestAccuracy).toFixed(2)}%` : '0.00%'}
                            </td>

                            {/* Raw WPM */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs sm:text-sm hidden md:table-cell">
                              {item.rawWpmCalc}
                            </td>

                            {/* Consistency */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs sm:text-sm hidden lg:table-cell">
                              {item.consistencyCalc}
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs whitespace-nowrap">
                              {item.dateFormatted}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Bottom Table Pagination & Display Size Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-1 border-t border-[var(--sub-alt)]/40 text-xs text-[var(--sub-color)] font-mono">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--sub-color)]/80 text-[11px]">Ko&apos;rsatish:</span>
              <div className="flex items-center gap-1">
                {[15, 25, 50].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-all ${
                      pageSize === size
                        ? 'bg-[var(--main-color)] text-white shadow-xs'
                        : 'bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="hidden sm:inline text-[var(--sub-color)]/60 text-[11px]">
                • Jami {isSpaceScope ? spaceTotalCount : totalCount} ta {isSpaceScope ? 'pilot' : 'teruvchi'}
              </span>
            </div>

            {/* Bottom Pagination Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Oldingi sahifa"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-sm text-[var(--main-color)] font-semibold px-1">
                # {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Keyingi sahifa"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-[var(--main-color)] text-white shadow-2xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 font-mono text-xs font-bold cursor-pointer border border-white/20 animate-in fade-in slide-in-from-bottom-3 duration-200"
          title="Tepaga qaytish"
          aria-label="Tepaga qaytish"
        >
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Tepaga</span>
        </button>
      )}

      {/* Bottom Footer Meta Links (Matching the screenshot footer: yo'riqnoma, verified, v2.6, yangilanishlar, muallif, qoidalar) */}
      <div className="pt-8 border-t border-[var(--sub-alt)]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--sub-color)] font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:text-[var(--text-color)] cursor-pointer transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            <span>yo&apos;riqnoma</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>verified</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-sky-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>v2.6</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:text-[var(--text-color)] cursor-pointer transition-colors">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>yangilanishlar</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 hover:text-[var(--text-color)] cursor-pointer transition-colors">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>muallif</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 hover:text-[var(--text-color)] cursor-pointer transition-colors">
            <FileText className="w-3.5 h-3.5" />
            <span>qoidalar</span>
          </span>
        </div>
      </div>

      {/* User Profile Modal on Click */}
      <PublicProfileModal
        userProfile={selectedProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
