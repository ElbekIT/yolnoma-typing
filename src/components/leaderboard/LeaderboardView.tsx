import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  Globe,
  X,
  RotateCcw,
  Zap,
  Share2,
  CopyCheck,
  User as UserIcon
} from 'lucide-react';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';

// Module-level caches for instant 0ms tab switching & reduced network load
let cachedTypingUsers: LeaderboardUser[] | null = null;
const cachedBannedUids: Set<string> = new Set();
let lastTypingFetchTime = 0;

// Scope categories for typing (matching sidebar items)
export type ScopeCategory = 'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily';

// Time filter categories for typing
export type TimeCategory = '15' | '30' | '60' | '120' | 'all';

// Speed Tier categories
export type SpeedTier = 'all' | 'mythic' | 'grandmaster' | 'master' | 'pro' | 'novice';

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

export interface LeaderboardViewProps {
  onOpenLogin?: () => void;
  onGoToTyping?: () => void;
  defaultScope?: ScopeCategory;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onOpenLogin,
  onGoToTyping,
  defaultScope = 'all-time-english'
}) => {
  const { profile: currentUser } = useAuth();

  // Filters for Typing (Defaulting to 'all-time-english' and '15' as in the reference screenshot)
  const [scope, setScope] = useState<ScopeCategory>(defaultScope);
  const [timeFilter, setTimeFilter] = useState<TimeCategory>('15');

  // Global Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Copy share notification toast
  const [copiedShare, setCopiedShare] = useState(false);

  // Raw Data from Firebase RTDB for typing
  const [rawTypingUsers, setRawTypingUsers] = useState<LeaderboardUser[]>(() => cachedTypingUsers || []);
  const [bannedUids] = useState<Set<string>>(() => cachedBannedUids);
  const [loading, setLoading] = useState(() => !cachedTypingUsers);

  // Profile modal
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Floating Scroll to Top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Countdown timer for "Next update in: 02:58"
  const [nextUpdateSeconds, setNextUpdateSeconds] = useState(178);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdateSeconds((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Track window scroll for Scroll-to-Top visibility
  useEffect(() => {
    const handleWindowScroll = () => {
      if (typeof window !== 'undefined' && window.scrollY > 220) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Format Date into 2 distinct lines (e.g. "28 May 2026" / "20:01")
  const formatDateParts = (timestamp?: number): { date: string; time: string } => {
    if (!timestamp) return { date: '28 May 2026', time: '20:00' };
    try {
      const d = new Date(timestamp);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const date = `${day} ${month} ${year}`;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { date, time };
    } catch {
      return { date: 'Yaqinda', time: '12:00' };
    }
  };

  // Helper for speed tiers (Styled after Monkeytype rank badges)
  const getSpeedTier = (wpm: number): { key: SpeedTier; label: string; badgeClass: string; icon: string } => {
    if (wpm >= 140) return { key: 'mythic', label: 'Mythical', badgeClass: 'bg-[#6c5ce7] text-white', icon: '🚀' };
    if (wpm >= 110) return { key: 'grandmaster', label: 'Grandmaster', badgeClass: 'bg-[#e67e22] text-white', icon: '💎' };
    if (wpm >= 85) return { key: 'master', label: 'Master', badgeClass: 'bg-[#0984e3] text-white', icon: '⚡' };
    if (wpm >= 60) return { key: 'pro', label: 'Pro', badgeClass: 'bg-[#00b894] text-white', icon: '🚀' };
    return { key: 'novice', label: 'Novice', badgeClass: 'bg-[#636e72] text-slate-100', icon: '🎯' };
  };

  // Dynamic Header Title generator matching reference screenshot
  const getLeaderboardTitle = (): string => {
    let scopeText = 'All-time English';
    if (scope === 'all-time-uzbek') scopeText = 'All-time Uzbek';
    else if (scope === 'all-time-english') scopeText = 'All-time English';
    else if (scope === 'weekly-xp') return 'Weekly XP Leaderboard';
    else if (scope === 'daily') return 'Daily Leaderboard';

    let timeText = '';
    if (timeFilter !== 'all') {
      timeText = `Time ${timeFilter}`;
    }

    return `${scopeText} ${timeText ? `${timeText} ` : ''}Leaderboard`.trim();
  };

  // =========================================================================
  // TYPING USERS DATA FETCHING (RTDB - Cached, Resilient & Multi-Source)
  // =========================================================================
  const fetchTypingUsers = useCallback(async (force = false) => {
    if (!force && cachedTypingUsers && cachedTypingUsers.length > 0 && Date.now() - lastTypingFetchTime < 30000) {
      setRawTypingUsers(cachedTypingUsers);
      setLoading(false);
      return;
    }

    setLoading(!cachedTypingUsers || cachedTypingUsers.length === 0);

    let parsedList: LeaderboardUser[] = [];

    // Helper: process raw objects into clean LeaderboardUser list
    const processRawData = (usersVal: any = {}, lbVal: any = {}, bannedSet: Set<string> = new Set()) => {
      const allUids = new Set<string>([...Object.keys(usersVal || {}), ...Object.keys(lbVal || {})]);
      const list: LeaderboardUser[] = [];

      allUids.forEach((uid) => {
        if (!uid || bannedSet.has(uid)) return;

        // Strictly eliminate any bots, guests, synthetic seed users, or mock users
        if (
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

        const u = (usersVal && usersVal[uid]) || {};
        const lb = (lbVal && lbVal[uid]) || {};

        if (u.isGuest || lb.isGuest || u.isBot || lb.isBot || u.isDummy || lb.isDummy) {
          return;
        }

        if (u.isBanned || u.isBlocked || lb.isBanned || lb.isBlocked) return;

        const wpm15 = Number(u.time15Wpm || lb.time15Wpm || 0);
        const wpm30 = Number(u.time30Wpm || lb.time30Wpm || 0);
        const wpm60 = Number(u.time60Wpm || lb.time60Wpm || 0);
        const wpm120 = Number(u.time120Wpm || lb.time120Wpm || 0);
        const bestWpm = Math.max(
          Number(u.highestWpm || 0),
          Number(lb.highestWpm || 0),
          wpm15,
          wpm30,
          wpm60,
          wpm120,
          Number(u.averageWpm || 0),
          Number(lb.averageWpm || 0)
        );

        // REAL USERS REQUIRE AN ACTUAL VALID WPM RESULT (> 0 and <= 340)
        if (bestWpm <= 0 || bestWpm > 340) return;

        const totalTests = Math.max(Number(u.totalTests || lb.totalTests || 0), 1);

        list.push({
          uid,
          displayName: u.displayName || lb.displayName || u.username || lb.username || 'Foydalanuvchi',
          username: u.username || lb.username || 'user',
          avatarUrl: u.avatarUrl || lb.avatarUrl || u.photoURL,
          country: u.country || lb.country || '🇺🇿 Oʻzbekiston',
          highestWpm: bestWpm,
          highestAccuracy: Math.min(100, Math.max(0, Number(u.highestAccuracy || lb.highestAccuracy || 98))),
          time15Wpm: wpm15,
          time30Wpm: wpm30,
          time60Wpm: wpm60,
          time120Wpm: wpm120,
          totalTests: totalTests,
          level: Number(u.level || lb.level || 1),
          xp: Number(u.xp || lb.xp || 100),
          rankTitle: u.rankTitle || lb.rankTitle || 'Typing Novice',
          lastActive: Number(u.lastActive || lb.lastActive || Date.now()),
          bio: u.bio || lb.bio,
          isVerified: Boolean(u.isVerified || lb.isVerified),
          isBanned: false,
          isBlocked: false,
          language: u.language || lb.language,
          rawWpm: Number(u.rawWpm || lb.rawWpm || Math.round(bestWpm * 1.05)),
          consistency: Number(u.consistency || lb.consistency || 91.7)
        });
      });

      return list;
    };

    try {
      // Tier 1: Fast internal backend API endpoint (Returns all verified national typists)
      try {
        const apiRes = await fetch('/api/leaderboard?limit=100');
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (apiJson.success && Array.isArray(apiJson.leaderboard) && apiJson.leaderboard.length > 0) {
            parsedList = apiJson.leaderboard;
            cachedTypingUsers = parsedList;
            lastTypingFetchTime = Date.now();
            setRawTypingUsers(parsedList);
            setLoading(false);
          }
        }
      } catch {
        // Fallback to RTDB
      }

      // Tier 2: Realtime Database leaderboard fallback
      try {
        let lbSnap;
        try {
          const lbQuery = query(ref(rtdb, 'leaderboard'), orderByChild('highestWpm'), limitToLast(100));
          lbSnap = await get(lbQuery);
        } catch {
          lbSnap = await get(ref(rtdb, 'leaderboard'));
        }

        if (lbSnap && lbSnap.exists()) {
          const lbVal = lbSnap.val() || {};
          const freshList = processRawData({}, lbVal, new Set<string>());
          if (freshList.length > 0) {
            const userMap = new Map<string, LeaderboardUser>();
            parsedList.forEach((u) => userMap.set(u.uid, u));
            freshList.forEach((u) => {
              const existing = userMap.get(u.uid);
              if (!existing) {
                userMap.set(u.uid, u);
              } else {
                userMap.set(u.uid, {
                  ...existing,
                  ...u,
                  highestWpm: Math.max(existing.highestWpm, u.highestWpm),
                  highestAccuracy: Math.max(existing.highestAccuracy, u.highestAccuracy),
                  time15Wpm: Math.max(existing.time15Wpm || 0, u.time15Wpm || 0),
                  time30Wpm: Math.max(existing.time30Wpm || 0, u.time30Wpm || 0),
                  time60Wpm: Math.max(existing.time60Wpm || 0, u.time60Wpm || 0),
                  time120Wpm: Math.max(existing.time120Wpm || 0, u.time120Wpm || 0),
                  totalTests: Math.max(existing.totalTests, u.totalTests),
                  lastActive: Math.max(existing.lastActive, u.lastActive)
                });
              }
            });
            parsedList = Array.from(userMap.values());
          }
        }
      } catch {
        // Handled
      }

      // Also try fetching users node from RTDB if accessible
      try {
        const usersSnap = await get(ref(rtdb, 'users'));
        if (usersSnap.exists()) {
          const usersVal = usersSnap.val() || {};
          const usersList = processRawData(usersVal, {}, new Set<string>());
          if (usersList.length > 0) {
            const userMap = new Map<string, LeaderboardUser>();
            parsedList.forEach((u) => userMap.set(u.uid, u));
            usersList.forEach((u) => {
              const existing = userMap.get(u.uid);
              if (!existing) {
                userMap.set(u.uid, u);
              } else {
                userMap.set(u.uid, {
                  ...existing,
                  ...u,
                  highestWpm: Math.max(existing.highestWpm, u.highestWpm),
                  highestAccuracy: Math.max(existing.highestAccuracy, u.highestAccuracy),
                  totalTests: Math.max(existing.totalTests, u.totalTests)
                });
              }
            });
            parsedList = Array.from(userMap.values());
          }
        }
      } catch {}

      // Incorporate local session results for current user or guest
      let localMaxWpm = Number(localStorage.getItem('yolnoma_guest_best_wpm') || 0);
      let localAccuracy = 98;
      try {
        const localResultsRaw = localStorage.getItem('yolnoma_results_history');
        if (localResultsRaw) {
          const parsed = JSON.parse(localResultsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((r: any) => {
              if (r && typeof r.wpm === 'number' && r.wpm > localMaxWpm && r.wpm <= 340) {
                localMaxWpm = r.wpm;
                if (typeof r.accuracy === 'number') localAccuracy = r.accuracy;
              }
            });
          }
        }
      } catch {}

      // Ensure logged in user is in the leaderboard
      if (currentUser?.uid && !currentUser.uid.startsWith('bot_')) {
        const existingIdx = parsedList.findIndex((x) => x.uid === currentUser.uid);
        const myWpm = Math.max(Number(currentUser.highestWpm || 0), Number(currentUser.averageWpm || 0), localMaxWpm);
        const myTests = Math.max(Number(currentUser.totalTests || 0), 1);
        if (myWpm > 0 && myWpm <= 340) {
          const myEntry: LeaderboardUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.username || 'Siz',
            username: currentUser.username || 'siz',
            avatarUrl: currentUser.avatarUrl,
            country: currentUser.country || '🇺🇿 Oʻzbekiston',
            highestWpm: myWpm,
            highestAccuracy: Math.min(100, Math.max(0, Number(currentUser.highestAccuracy || localAccuracy))),
            time15Wpm: Number(currentUser.time15Wpm || myWpm),
            time30Wpm: Number(currentUser.time30Wpm || myWpm),
            time60Wpm: Number(currentUser.time60Wpm || myWpm),
            time120Wpm: Number(currentUser.time120Wpm || myWpm),
            totalTests: myTests,
            level: Number(currentUser.level || Math.max(1, Math.floor(myWpm / 12))),
            xp: Number(currentUser.xp || myWpm * 20),
            rankTitle: currentUser.rankTitle || (myWpm >= 110 ? 'Grandmaster Typer' : myWpm >= 85 ? 'Master Typer' : 'Pro Typer'),
            lastActive: Date.now(),
            bio: currentUser.bio,
            isVerified: true,
            isBanned: false,
            isBlocked: false,
            language: currentUser.language || 'en',
            rawWpm: Number(currentUser.rawWpm || Math.round(myWpm * 1.05)),
            consistency: Number(currentUser.consistency || 91.7)
          };
          if (existingIdx !== -1) {
            parsedList[existingIdx] = {
              ...parsedList[existingIdx],
              ...myEntry,
              highestWpm: Math.max(parsedList[existingIdx].highestWpm, myWpm)
            };
          } else {
            parsedList.push(myEntry);
          }
        }
      }

      if (parsedList.length > 0) {
        cachedTypingUsers = parsedList;
        lastTypingFetchTime = Date.now();
        setRawTypingUsers(parsedList);
      } else {
        setRawTypingUsers([]);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      if (!cachedTypingUsers || cachedTypingUsers.length === 0) {
        setRawTypingUsers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTypingUsers();
  }, [fetchTypingUsers]);

  // =========================================================================
  // TYPING COMPUTATIONS & STATS
  // =========================================================================
  const validUsers = useMemo(() => {
    return rawTypingUsers.filter((u) => !bannedUids.has(u.uid) && !u.isBanned && !u.isBlocked);
  }, [rawTypingUsers, bannedUids]);

  const scopedUsers = useMemo(() => {
    let list = [...validUsers];

    if (scope === 'all-time-uzbek') {
      list = list.filter((u) => !u.language || u.language.toLowerCase().includes('uz'));
      if (list.length === 0) {
        list = validUsers.slice(0, 50);
      }
    } else if (scope === 'all-time-english') {
      list = list.filter((u) => u.language && (u.language.toLowerCase().includes('en') || u.language.toLowerCase().includes('eng')));
      if (list.length === 0) {
        list = validUsers.slice(0, 50);
      }
    } else if (scope === 'weekly-xp') {
      list = list.filter((u) => (u.xp || 0) > 0);
      if (list.length === 0) {
        list = validUsers.slice(0, 50);
      }
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } else if (scope === 'daily') {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      list = list.filter((u) => (u.lastActive || 0) >= oneDayAgo);
      if (list.length < 3) {
        list = [...validUsers].sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)).slice(0, 25);
      }
    }

    return list;
  }, [validUsers, scope]);

  const timeFilteredUsers = useMemo(() => {
    return scopedUsers.map((u) => {
      let speed = u.highestWpm;
      let modeName = 'time 15';

      if (timeFilter === '15') {
        speed = u.time15Wpm || u.highestWpm;
        modeName = 'time 15';
      } else if (timeFilter === '30') {
        speed = u.time30Wpm || u.highestWpm;
        modeName = 'time 30';
      } else if (timeFilter === '60') {
        speed = u.time60Wpm || u.highestWpm;
        modeName = 'time 60';
      } else if (timeFilter === '120') {
        speed = u.time120Wpm || u.highestWpm;
        modeName = 'time 120';
      } else {
        speed = u.highestWpm;
        modeName = 'time 15';
      }

      return {
        ...u,
        displayWpm: speed,
        modeLabel: modeName
      };
    });
  }, [scopedUsers, timeFilter]);

  const sortedList = useMemo(() => {
    let list = [...timeFilteredUsers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }

    if (scope === 'weekly-xp') {
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } else {
      list.sort((a, b) => b.displayWpm - a.displayWpm);
    }

    return list.map((item, index): FormattedLeaderboardEntry => {
      const rawCalculated = item.rawWpm || Math.round(item.displayWpm * 1.05);
      const consistencyVal = item.consistency ? `${item.consistency.toFixed(2)}%` : '91.70%';

      return {
        ...item,
        rank: index + 1,
        rawWpmCalc: rawCalculated,
        consistencyCalc: consistencyVal,
        dateFormatted: formatDateParts(item.lastActive).date
      };
    });
  }, [timeFilteredUsers, searchQuery, scope]);

  const totalCount = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize]);

  const myRankingInfo = useMemo(() => {
    if (!currentUser?.uid) return null;
    const idx = sortedList.findIndex((u) => u.uid === currentUser.uid);
    if (idx !== -1) {
      const nextPerson = idx > 0 ? sortedList[idx - 1] : null;
      const gapToNext = nextPerson ? Math.max(1, nextPerson.displayWpm - sortedList[idx].displayWpm + 1) : 0;
      return {
        rank: idx + 1,
        item: sortedList[idx],
        gapToNext,
        nextRank: idx > 0 ? idx : null
      };
    }
    return null;
  }, [currentUser, sortedList]);

  const handleJumpToMyRank = () => {
    if (!myRankingInfo) {
      setCurrentPage(1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const targetPage = Math.floor((myRankingInfo.rank - 1) / pageSize) + 1;
    setCurrentPage(targetPage);
    setTimeout(() => {
      const el = document.getElementById(`typing-rank-row-${currentUser?.uid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#e2b714]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[#e2b714]'), 2500);
      }
    }, 150);
  };

  const handleShareMyRank = async () => {
    if (!myRankingInfo) return;
    const text = `🏆 Milliy Tez Yozish Reytingida mening natijam:\n🥇 O'rnim: #${myRankingInfo.rank}\n⚡ Tezligim: ${myRankingInfo.item.displayWpm} WPM\n🎯 Aniqlik: ${myRankingInfo.item.highestAccuracy}%\n👉 Sinovdan o'ting: https://www.yolnoma.uz`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    } catch {
      // Fallback
    }
  };

  const openUserProfile = (user: { uid: string; displayName?: string; username?: string; avatarUrl?: string }) => {
    const fullProfile = rawTypingUsers.find((u) => u.uid === user.uid);
    if (fullProfile) {
      setSelectedProfile({
        uid: fullProfile.uid,
        displayName: fullProfile.displayName,
        username: fullProfile.username,
        avatarUrl: fullProfile.avatarUrl,
        country: fullProfile.country,
        highestWpm: fullProfile.highestWpm,
        averageWpm: fullProfile.highestWpm,
        highestAccuracy: fullProfile.highestAccuracy,
        averageAccuracy: fullProfile.highestAccuracy,
        totalTests: fullProfile.totalTests,
        completedTests: fullProfile.totalTests,
        time15Wpm: fullProfile.time15Wpm,
        time30Wpm: fullProfile.time30Wpm,
        time60Wpm: fullProfile.time60Wpm,
        time120Wpm: fullProfile.time120Wpm,
        level: fullProfile.level,
        xp: fullProfile.xp,
        rankTitle: fullProfile.rankTitle,
        bio: fullProfile.bio,
        isVerified: fullProfile.isVerified,
        joinedAt: Date.now() - 30 * 86400000,
        lastActive: fullProfile.lastActive,
        totalTimeSpent: fullProfile.totalTests * 45
      });
    } else {
      setSelectedProfile({
        uid: user.uid,
        displayName: user.displayName || 'Foydalanuvchi',
        username: user.username || 'user',
        avatarUrl: user.avatarUrl,
        country: '🇺🇿 Oʻzbekiston',
        highestWpm: 120,
        averageWpm: 105,
        highestAccuracy: 98,
        averageAccuracy: 96,
        totalTests: 250,
        completedTests: 250,
        level: 15,
        xp: 3500,
        rankTitle: 'Mohir Yozuvchi',
        joinedAt: Date.now() - 14 * 86400000,
        lastActive: Date.now(),
        totalTimeSpent: 18000
      });
    }
    setIsProfileOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-8 font-mono select-none text-[#d1d0c5]">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER TITLE (e.g. All-time English Time 15 Leaderboard)           */}
      {/* ========================================================================= */}
      <div className="mb-6 sm:mb-8 border-b border-transparent">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono text-[#d1d0c5] tracking-tight font-normal">
          {getLeaderboardTitle()}
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT (Left Sidebar Pills + Right Content Table)        */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
        {/* ----------------------------------------------------------------------- */}
        {/* Left Sidebar: 2 Dark Rounded Container Cards                            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex flex-row lg:flex-col flex-wrap gap-3.5 w-full lg:w-48 xl:w-52 shrink-0">
          {/* Card 1: Scopes (all-time english / weekly xp / daily) */}
          <div className="bg-[#2c2e31] border border-slate-800/40 rounded-xl p-2 flex flex-col gap-1 w-full sm:w-auto lg:w-full shrink-0 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setScope('all-time-english');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2.5 cursor-pointer ${
                scope === 'all-time-english'
                  ? 'bg-[#e2b714] text-[#2c2e31] font-bold shadow-xs'
                  : 'text-[#646669] hover:text-[#d1d0c5] hover:bg-[#323437]/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>all-time english</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScope('all-time-uzbek');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2.5 cursor-pointer ${
                scope === 'all-time-uzbek'
                  ? 'bg-[#e2b714] text-[#2c2e31] font-bold shadow-xs'
                  : 'text-[#646669] hover:text-[#d1d0c5] hover:bg-[#323437]/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>all-time uzbek</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScope('weekly-xp');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2.5 cursor-pointer ${
                scope === 'weekly-xp'
                  ? 'bg-[#e2b714] text-[#2c2e31] font-bold shadow-xs'
                  : 'text-[#646669] hover:text-[#d1d0c5] hover:bg-[#323437]/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>weekly xp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScope('daily');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2.5 cursor-pointer ${
                scope === 'daily'
                  ? 'bg-[#e2b714] text-[#2c2e31] font-bold shadow-xs'
                  : 'text-[#646669] hover:text-[#d1d0c5] hover:bg-[#323437]/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>daily</span>
            </button>
          </div>

          {/* Card 2: Time Modes (time 15, time 60, time 30, time 120) */}
          {scope !== 'weekly-xp' && (
            <div className="bg-[#2c2e31] border border-slate-800/40 rounded-xl p-2 flex flex-col gap-1 w-full sm:w-auto lg:w-full shrink-0 shadow-sm">
              {(['15', '60', '30', '120'] as TimeCategory[]).map((tVal) => {
                const isActive = timeFilter === tVal;
                return (
                  <button
                    key={tVal}
                    type="button"
                    onClick={() => {
                      setTimeFilter(tVal);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#e2b714] text-[#2c2e31] font-bold shadow-xs'
                        : 'text-[#646669] hover:text-[#d1d0c5] hover:bg-[#323437]/60'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>time {tVal}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Refresh & Start Practice CTA */}
          <div className="w-full flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => fetchTypingUsers(true)}
              title="Reytingni yangilash"
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg bg-[#2c2e31]/60 hover:bg-[#2c2e31] text-[#646669] hover:text-[#d1d0c5] text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-slate-800/40"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#e2b714]' : ''}`} />
              <span>refresh</span>
            </button>

            {onGoToTyping && (
              <button
                type="button"
                onClick={onGoToTyping}
                className="w-full px-3 py-2 rounded-lg bg-[#e2b714]/15 hover:bg-[#e2b714]/25 text-[#e2b714] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#e2b714]/30"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>start test</span>
              </button>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* Right Main Column: Subheader Controls + Table + Bottom Controls         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 w-full min-w-0">
          {/* Subheader: Next update in & Crown / Pagination controls */}
          <div className="flex items-center justify-between gap-4 mb-4 text-xs font-mono">
            {/* Left: Next update timer + inline subtle search */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="text-[#646669] flex items-center gap-1.5 whitespace-nowrap text-xs">
                <span>Next update in:</span>
                <span className="text-[#646669] font-mono">{formatCountdown(nextUpdateSeconds)}</span>
              </div>

              {/* Minimal inline search */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#646669] absolute left-2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-[#2c2e31]/70 hover:bg-[#2c2e31] focus:bg-[#2c2e31] text-[#d1d0c5] placeholder-[#646669] text-xs font-mono pl-7 pr-6 py-1 rounded-md border border-slate-800/40 focus:border-[#646669] focus:outline-none transition-all w-28 sm:w-36 focus:w-48"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-[#646669] hover:text-[#d1d0c5] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Crown button + Prev + Page Pill + Next */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Crown jump button */}
              <button
                type="button"
                onClick={handleJumpToMyRank}
                title={myRankingInfo ? `Sizning o'rningiz: #${myRankingInfo.rank}` : "1-o'ringa sakrash"}
                className="p-1.5 rounded text-[#646669] hover:text-[#e2b714] transition-colors cursor-pointer"
              >
                <Crown className="w-4 h-4" />
              </button>

              {/* Prev Page Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-[#646669] hover:text-[#d1d0c5] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Oldingi sahifa"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Indicator Pill: # 1 */}
              <div className="bg-[#2c2e31] border border-slate-800/50 text-[#d1d0c5] font-mono font-bold text-xs px-3 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
                <span className="text-[#646669]">#</span>
                <span>{currentPage}</span>
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded text-[#646669] hover:text-[#d1d0c5] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Keyingi sahifa"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* Main Leaderboard Table                                                  */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-full overflow-x-auto rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="text-[#646669] text-xs font-normal border-b border-transparent">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">name</th>
                  <th className="py-2.5 px-3 text-right">wpm</th>
                  <th className="py-2.5 px-3 text-right">accuracy</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell">raw</th>
                  <th className="py-2.5 px-3 text-right hidden md:table-cell">consistency</th>
                  <th className="py-2.5 px-3 text-right">date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {loading && pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#646669] font-mono text-xs">
                      loading leaderboard...
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#646669] font-mono text-xs">
                      no entries found for this category
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item, idx) => {
                    const isMe = currentUser?.uid === item.uid;
                    const tierInfo = getSpeedTier(item.displayWpm);
                    const dateParts = formatDateParts(item.lastActive);

                    return (
                      <tr
                        key={item.uid}
                        id={`typing-rank-row-${item.uid}`}
                        onClick={() => openUserProfile(item)}
                        className={`transition-colors cursor-pointer group ${
                          idx % 2 === 0 ? 'bg-[#2c2e31]/30' : 'bg-transparent'
                        } hover:bg-[#2c2e31]/75 ${
                          isMe ? 'bg-[#e2b714]/10 border-l-2 border-[#e2b714]' : ''
                        }`}
                      >
                        {/* Rank (#) */}
                        <td className="py-3 px-3 text-center">
                          {item.rank === 1 ? (
                            <Crown className="w-4 h-4 text-[#d1d0c5] fill-[#d1d0c5] mx-auto" />
                          ) : (
                            <span className="text-[#646669]">{item.rank}</span>
                          )}
                        </td>

                        {/* Name + Avatar + Badge */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.displayName}
                                className="w-5 h-5 rounded-full object-cover shrink-0 bg-[#2c2e31]"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#2c2e31] flex items-center justify-center shrink-0 text-[#646669]">
                                <UserIcon className="w-3 h-3" />
                              </div>
                            )}

                            <span className="text-[#d1d0c5] group-hover:text-[#e2b714] transition-colors truncate max-w-[120px] sm:max-w-[200px]">
                              {item.displayName || item.username}
                            </span>

                            {/* Monkeytype style Pill Badge (e.g. 🚀 Mythical) */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1 shrink-0 ${tierInfo.badgeClass}`}
                            >
                              <span>{tierInfo.icon}</span>
                              <span>{tierInfo.label}</span>
                            </span>

                            {item.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}

                            {isMe && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#e2b714] text-[#2c2e31]">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        {/* WPM (e.g. 318.99) */}
                        <td className="py-3 px-3 text-right text-[#d1d0c5] font-mono">
                          {item.displayWpm.toFixed(2)}
                        </td>

                        {/* Accuracy (e.g. 99.03%) */}
                        <td className="py-3 px-3 text-right text-[#d1d0c5] font-mono">
                          {Number(item.highestAccuracy || 98).toFixed(2)}%
                        </td>

                        {/* Raw WPM (e.g. 328.58) */}
                        <td className="py-3 px-3 text-right text-[#d1d0c5] font-mono hidden sm:table-cell">
                          {Number(item.rawWpmCalc).toFixed(2)}
                        </td>

                        {/* Consistency (e.g. 91.70%) */}
                        <td className="py-3 px-3 text-right text-[#d1d0c5] font-mono hidden md:table-cell">
                          {item.consistency ? `${Number(item.consistency).toFixed(2)}%` : item.consistencyCalc}
                        </td>

                        {/* Date (2 lines: "28 May 2026" / "20:01") */}
                        <td className="py-3 px-3 text-right font-mono text-[10px] leading-tight text-[#646669] whitespace-nowrap">
                          <div>{dateParts.date}</div>
                          <div className="text-[9px] text-[#646669]/70">{dateParts.time}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* Bottom Table Controls: Page size & Navigation                           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="mt-4 pt-4 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#646669]">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span>display:</span>
              {[15, 25, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    pageSize === size
                      ? 'text-[#e2b714] font-bold underline'
                      : 'text-[#646669] hover:text-[#d1d0c5]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Bottom Pagination */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === 1}
                className="px-2 py-0.5 rounded text-xs text-[#646669] hover:text-[#d1d0c5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                « 1
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === 1}
                className="p-1 rounded text-[#646669] hover:text-[#d1d0c5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[#d1d0c5] font-bold px-1.5">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-[#646669] hover:text-[#d1d0c5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(totalPages);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-2 py-0.5 rounded text-xs text-[#646669] hover:text-[#d1d0c5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {totalPages} »
              </button>
            </div>
          </div>

          {/* User Rank Card (if logged in) */}
          {myRankingInfo && (
            <div className="mt-6 p-3.5 rounded-xl bg-[#2c2e31]/60 border border-slate-800/60 flex items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-[#e2b714] font-bold">#{myRankingInfo.rank}</span>
                <span className="text-[#d1d0c5]">
                  {currentUser?.displayName || currentUser?.username}
                </span>
                <span className="text-[#646669]">({myRankingInfo.item.displayWpm.toFixed(2)} WPM)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareMyRank}
                  className="px-2.5 py-1 rounded bg-[#2c2e31] hover:bg-[#323437] text-[#d1d0c5] text-xs font-mono flex items-center gap-1.5 cursor-pointer border border-slate-800/50"
                >
                  {copiedShare ? (
                    <>
                      <CopyCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#646669]" />
                      <span>share</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleJumpToMyRank}
                  className="px-2.5 py-1 rounded bg-[#e2b714] text-[#2c2e31] font-bold text-xs font-mono cursor-pointer hover:brightness-105"
                >
                  jump to me
                </button>
              </div>
            </div>
          )}

          {/* Guest login reminder if not authenticated */}
          {!currentUser && onOpenLogin && (
            <div className="mt-6 p-3.5 rounded-xl bg-[#2c2e31]/40 border border-slate-800/40 flex items-center justify-between gap-4 text-xs font-mono">
              <span className="text-[#646669]">
                Sign in to save your score and claim your place on the leaderboard.
              </span>
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3 py-1 rounded-lg bg-[#e2b714] text-[#2c2e31] font-bold text-xs font-mono hover:brightness-105 cursor-pointer whitespace-nowrap"
              >
                sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-xl bg-[#2c2e31] border border-slate-700/60 text-[#d1d0c5] hover:text-[#e2b714] shadow-xl hover:bg-[#323437] active:scale-95 transition-all flex items-center gap-1.5 font-mono text-xs cursor-pointer"
          title="Tepaga qaytish"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* User Profile Modal on Click */}
      <PublicProfileModal
        userProfile={selectedProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
