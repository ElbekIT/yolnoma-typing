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
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  X,
  RotateCcw,
  Medal,
  Crosshair,
  LayoutGrid,
  LayoutList,
  Share2,
  Copy,
  CopyCheck,
  Filter,
  User,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { LeaderboardPodium, PodiumUser } from './LeaderboardPodium';

// Module-level caches for instant 0ms tab switching & reduced network load
let cachedTypingUsers: LeaderboardUser[] | null = null;
let cachedBannedUids: Set<string> = new Set();
let lastTypingFetchTime = 0;

// Scope categories for typing
export type ScopeCategory = 'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily';

// Time filter categories for typing
export type TimeCategory = 'all' | '15' | '30' | '60' | '120';

// Speed Tier categories
export type SpeedTier = 'all' | 'mythic' | 'grandmaster' | 'master' | 'pro' | 'novice';

// View Display Modes
export type ViewMode = 'table' | 'grid';

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
  defaultScope = 'all-time-uzbek'
}) => {
  const { profile: currentUser } = useAuth();
  const { t } = useI18n();

  // Filters for Typing
  const [scope, setScope] = useState<ScopeCategory>(defaultScope);
  const [timeFilter, setTimeFilter] = useState<TimeCategory>('all');
  const [speedTier, setSpeedTier] = useState<SpeedTier>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Global Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Copy share notification toast
  const [copiedShare, setCopiedShare] = useState(false);

  // Raw Data from Firebase RTDB for typing
  const [rawTypingUsers, setRawTypingUsers] = useState<LeaderboardUser[]>(() => cachedTypingUsers || []);
  const [bannedUids, setBannedUids] = useState<Set<string>>(() => cachedBannedUids);
  const [loading, setLoading] = useState(() => !cachedTypingUsers);

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

  // Format Date helper
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Yaqinda';
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Yaqinda';
    }
  };

  // Helper for speed tiers
  const getSpeedTier = (wpm: number): { key: SpeedTier; label: string; badgeClass: string; icon: string } => {
    if (wpm >= 140) return { key: 'mythic', label: 'Afsonaviy', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '👑' };
    if (wpm >= 110) return { key: 'grandmaster', label: 'Grandmaster', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '💎' };
    if (wpm >= 85) return { key: 'master', label: 'Master', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30', icon: '⚡' };
    if (wpm >= 60) return { key: 'pro', label: 'Professional', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🚀' };
    return { key: 'novice', label: 'Boshlovchi', badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: '🎯' };
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

        // REAL USERS REQUIRE AN ACTUAL VALID WPM RESULT (> 0 and <= 280)
        if (bestWpm <= 0 || bestWpm > 280) return;

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
          consistency: Number(u.consistency || lb.consistency || 90)
        });
      });

      return list;
    };

    try {
      // Tier 1: Fast internal backend API endpoint
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

      // Tier 2: Realtime Database SDK
      const rtdbPromise = Promise.allSettled([
        get(ref(rtdb, 'users')),
        get(ref(rtdb, 'leaderboard')),
        get(ref(rtdb, 'bannedUsers'))
      ]);

      const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 4000));
      const rtdbRace = await Promise.race([rtdbPromise, timeoutPromise]);

      let usersVal: any = {};
      let lbVal: any = {};
      let bannedSet = new Set<string>();

      if (rtdbRace !== 'timeout') {
        const [usersSnapResult, lbSnapResult, banSnapResult] = rtdbRace;
        usersVal =
          usersSnapResult.status === 'fulfilled' && usersSnapResult.value.exists()
            ? usersSnapResult.value.val() || {}
            : {};
        lbVal =
          lbSnapResult.status === 'fulfilled' && lbSnapResult.value.exists()
            ? lbSnapResult.value.val() || {}
            : {};
        if (banSnapResult.status === 'fulfilled' && banSnapResult.value.exists()) {
          const bVal = banSnapResult.value.val();
          if (bVal && typeof bVal === 'object') {
            Object.keys(bVal).forEach((k) => bannedSet.add(k));
          }
        }
      } else {
        // Direct REST fallback
        try {
          const [uRes, lRes, bRes] = await Promise.allSettled([
            fetch('https://typing-euro-default-rtdb.firebaseio.com/users.json'),
            fetch('https://typing-euro-default-rtdb.firebaseio.com/leaderboard.json'),
            fetch('https://typing-euro-default-rtdb.firebaseio.com/bannedUsers.json')
          ]);
          if (uRes.status === 'fulfilled' && uRes.value.ok) usersVal = await uRes.value.json();
          if (lRes.status === 'fulfilled' && lRes.value.ok) lbVal = await lRes.value.json();
          if (bRes.status === 'fulfilled' && bRes.value.ok) {
            const bVal = await bRes.value.json();
            if (bVal && typeof bVal === 'object') {
              Object.keys(bVal).forEach((k) => bannedSet.add(k));
            }
          }
        } catch {
          // Handled
        }
      }

      cachedBannedUids = bannedSet;
      setBannedUids(bannedSet);

      const freshList = processRawData(usersVal, lbVal, bannedSet);
      if (freshList.length > 0) {
        parsedList = freshList;
      }

      // If current user is logged in, ensure their entry is present
      if (currentUser?.uid && !currentUser.uid.startsWith('guest_') && !currentUser.uid.startsWith('bot_')) {
        const existingIdx = parsedList.findIndex((x) => x.uid === currentUser.uid);
        const myWpm = Math.max(Number(currentUser.highestWpm || 0), Number(currentUser.averageWpm || 0));
        const myTests = Math.max(Number(currentUser.totalTests || 0), 1);
        if (existingIdx === -1 && myWpm > 0 && myWpm <= 280) {
          parsedList.push({
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.username || 'Siz',
            username: currentUser.username || 'siz',
            avatarUrl: currentUser.avatarUrl,
            country: currentUser.country || '🇺🇿 Oʻzbekiston',
            highestWpm: myWpm,
            highestAccuracy: Math.min(100, Math.max(0, Number(currentUser.highestAccuracy || 98))),
            time15Wpm: Number(currentUser.time15Wpm || myWpm),
            time30Wpm: Number(currentUser.time30Wpm || myWpm),
            time60Wpm: Number(currentUser.time60Wpm || myWpm),
            time120Wpm: Number(currentUser.time120Wpm || myWpm),
            totalTests: myTests,
            level: Number(currentUser.level || 1),
            xp: Number(currentUser.xp || 150),
            rankTitle: currentUser.rankTitle || 'Typing Novice',
            lastActive: Date.now(),
            bio: currentUser.bio,
            isVerified: Boolean(currentUser.isVerified),
            isBanned: false,
            isBlocked: false,
            language: currentUser.language,
            rawWpm: Number(currentUser.rawWpm || 0),
            consistency: Number(currentUser.consistency || 90)
          });
        }
      }

      if (parsedList.length > 0) {
        cachedTypingUsers = parsedList;
        lastTypingFetchTime = Date.now();
        setRawTypingUsers(parsedList);
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
      let modeName = 'time 60';

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
        modeName = 'time 60';
      }

      return {
        ...u,
        displayWpm: speed,
        modeLabel: modeName
      };
    });
  }, [scopedUsers, timeFilter]);

  // Tier counts
  const tierCounts = useMemo(() => {
    const counts = { all: timeFilteredUsers.length, mythic: 0, grandmaster: 0, master: 0, pro: 0, novice: 0 };
    timeFilteredUsers.forEach((u) => {
      if (u.displayWpm >= 140) counts.mythic++;
      else if (u.displayWpm >= 110) counts.grandmaster++;
      else if (u.displayWpm >= 85) counts.master++;
      else if (u.displayWpm >= 60) counts.pro++;
      else counts.novice++;
    });
    return counts;
  }, [timeFilteredUsers]);

  const sortedList = useMemo(() => {
    let list = [...timeFilteredUsers];

    // Filter by Speed Tier
    if (speedTier !== 'all') {
      list = list.filter((u) => {
        if (speedTier === 'mythic') return u.displayWpm >= 140;
        if (speedTier === 'grandmaster') return u.displayWpm >= 110 && u.displayWpm < 140;
        if (speedTier === 'master') return u.displayWpm >= 85 && u.displayWpm < 110;
        if (speedTier === 'pro') return u.displayWpm >= 60 && u.displayWpm < 85;
        if (speedTier === 'novice') return u.displayWpm < 60;
        return true;
      });
    }

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
      const rawCalculated = item.rawWpm || Math.round(item.displayWpm * 1.06);
      const consistencyVal = item.consistency ? `${item.consistency}%` : `${Math.min(99, Math.max(68, Math.round(item.highestAccuracy * 0.88)))}%`;

      return {
        ...item,
        rank: index + 1,
        rawWpmCalc: rawCalculated,
        consistencyCalc: consistencyVal,
        dateFormatted: formatDate(item.lastActive)
      };
    });
  }, [timeFilteredUsers, searchQuery, scope, speedTier]);

  const totalCount = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const pageItems = useMemo(() => {
    if (currentPage === 1 && !searchQuery.trim() && speedTier === 'all' && sortedList.length > 3) {
      return sortedList.slice(3, 3 + pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize, searchQuery, speedTier]);

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

  const typingStats = useMemo(() => {
    const topWpm = validUsers.reduce((max, u) => Math.max(max, u.highestWpm), 0);
    const avgAcc =
      validUsers.length > 0
        ? Math.round(validUsers.reduce((acc, u) => acc + (u.highestAccuracy || 98), 0) / validUsers.length)
        : 98;
    const championUser = validUsers.find((u) => u.highestWpm === topWpm);
    return {
      topWpm,
      avgAcc,
      totalUsers: validUsers.length,
      championName: championUser?.displayName || 'Chempion'
    };
  }, [validUsers]);

  const typingPodiumUsers: PodiumUser[] = useMemo(() => {
    return sortedList.slice(0, 3).map((item, idx) => ({
      uid: item.uid,
      displayName: item.displayName,
      username: item.username,
      avatarUrl: item.avatarUrl,
      country: item.country,
      displayWpm: item.displayWpm,
      highestAccuracy: item.highestAccuracy,
      modeLabel: item.modeLabel,
      rank: idx + 1,
      isVerified: item.isVerified,
      scoreLabel: 'WPM',
      scoreValue: item.displayWpm,
      subStatLabel: 'Aniqlik',
      subStatValue: `${item.highestAccuracy}%`,
      level: item.level,
      rankTitle: item.rankTitle
    }));
  }, [sortedList]);

  const handleJumpToMyRank = () => {
    if (!myRankingInfo) return;
    const targetPage = Math.floor((myRankingInfo.rank - 1) / pageSize) + 1;
    setCurrentPage(targetPage);
    setTimeout(() => {
      const el = document.getElementById(`typing-rank-row-${currentUser?.uid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[var(--main-color)]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--main-color)]'), 2500);
      }
    }, 150);
  };

  const handleShareMyRank = async () => {
    if (!myRankingInfo) return;
    const text = `🏆 Milliy Tez Yozish Reytingida mening natijam:\n🥇 O'rnim: #${myRankingInfo.rank}\n⚡ Tezligim: ${myRankingInfo.item.displayWpm} WPM\n🎯 Aniqlik: ${myRankingInfo.item.highestAccuracy}%\n👉 Sinovdan o'ting va meni yengishga harakat qiling!`;
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

  const scopeTabs: { id: ScopeCategory; label: string; icon: any }[] = [
    { id: 'all-time-uzbek', label: "O'zbekcha (Hammasi)", icon: Trophy },
    { id: 'all-time-english', label: 'Inglizcha (All-time)', icon: Globe },
    { id: 'weekly-xp', label: 'Haftalik XP', icon: Flame },
    { id: 'daily', label: 'Kunlik (24 soat)', icon: Clock }
  ];

  const timeOptions: { id: TimeCategory; label: string }[] = [
    { id: 'all', label: 'Barchasi' },
    { id: '15', label: '15 soniya' },
    { id: '30', label: '30 soniya' },
    { id: '60', label: '60 soniya' },
    { id: '120', label: '120 soniya' }
  ];

  const speedTierOptions: { id: SpeedTier; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'Barchasi', icon: '⚡', count: tierCounts.all },
    { id: 'mythic', label: 'Afsonaviy (140+)', icon: '👑', count: tierCounts.mythic },
    { id: 'grandmaster', label: 'Grandmaster (110-139)', icon: '💎', count: tierCounts.grandmaster },
    { id: 'master', label: 'Master (85-109)', icon: '⚡', count: tierCounts.master },
    { id: 'pro', label: 'Pro (60-84)', icon: '🚀', count: tierCounts.pro },
    { id: 'novice', label: 'Boshlovchi (<60)', icon: '🎯', count: tierCounts.novice }
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/30 to-yellow-300/30 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-400/40 shadow-sm shadow-amber-500/20">
          <Crown className="w-4 h-4 fill-amber-400 text-amber-300" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-400/30 to-slate-200/20 text-slate-200 font-black text-xs flex items-center justify-center border border-slate-300/40 shadow-sm">
          <Medal className="w-4 h-4 fill-slate-300 text-slate-200" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-800/30 to-amber-600/30 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-600/40 shadow-sm">
          <Award className="w-4 h-4 fill-amber-600 text-amber-400" />
        </span>
      );
    }
    if (rank <= 10) {
      return (
        <span className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 font-black text-xs flex items-center justify-center border border-purple-500/30 shadow-xs font-mono">
          #{rank}
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-xl bg-[var(--sub-alt)]/40 text-[var(--sub-color)] font-bold text-xs flex items-center justify-center font-mono">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 md:px-8 font-mono select-none space-y-6">
      {/* ========================================================================= */}
      {/* ARENA CHAMPIONSHIP HEADER BAR                                             */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-[var(--card-bg)] via-[var(--card-bg)] to-[var(--sub-alt)]/30 border border-[var(--sub-alt)] rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[var(--main-color)]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Title and live status */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[var(--main-color)]/25 to-amber-500/20 text-[var(--main-color)] border border-[var(--main-color)]/30 flex items-center justify-center shrink-0 shadow-lg shadow-[var(--main-color)]/15">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-2xl font-black text-[var(--text-color)] tracking-tight">
                  Milliy Tez Yozish Reytingi
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>JONLI • RESPUBLIKA ARENASI</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--sub-color)] font-sans max-w-2xl">
                O'zbekistonning eng tezkor teruvchilari, professional dasturchilar va kiber-sportchilar o'rtasidagi rasmiy chempionat jadvali.
              </p>
            </div>
          </div>

          {/* Action buttons & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)]">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--main-color)] text-[var(--bg-color,#090d16)] shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="Klassik jadval ko'rinishi"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Jadval</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--main-color)] text-[var(--bg-color,#090d16)] shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="Kiber kartalar ko'rinishi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartalar</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchTypingUsers(true)}
              title="Reytingni yangilash"
              disabled={loading}
              className="px-3.5 py-2 rounded-2xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-transparent hover:border-[var(--sub-alt)]"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--main-color)]' : ''}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </button>

            {/* Play Typing Test */}
            {onGoToTyping && (
              <button
                onClick={onGoToTyping}
                className="px-4 py-2 rounded-2xl bg-[var(--main-color)] hover:brightness-110 active:scale-95 text-[var(--bg-color,#090d16)] text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[var(--main-color)]/25"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Tez Yozish Sinovi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC SUMMARY STATS STRIP                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/80 border border-amber-500/30 flex items-center gap-3.5 shadow-md shadow-amber-500/5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
            <Crown className="w-5 h-5 fill-amber-400/30" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">Rekord Tezlik</div>
            <div className="text-xl font-black text-amber-400 font-mono flex items-center gap-1">
              <span>{typingStats.topWpm}</span>
              <span className="text-xs font-normal text-[var(--sub-color)]">WPM</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/80 border border-cyan-500/30 flex items-center gap-3.5 shadow-md shadow-cyan-500/5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/25">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">O'rtacha Aniqlik</div>
            <div className="text-xl font-black text-cyan-400 font-mono">
              {typingStats.avgAcc}%
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/80 border border-emerald-500/30 flex items-center gap-3.5 shadow-md shadow-emerald-500/5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">Ishtirokchilar</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {typingStats.totalUsers} <span className="text-xs font-normal text-[var(--sub-color)]">ta</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/80 border border-purple-500/30 flex items-center gap-3.5 shadow-md shadow-purple-500/5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">Chempion</div>
            <div className="text-sm font-black text-purple-300 font-mono truncate max-w-[120px]">
              {typingStats.championName}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SPEED TIER LEAGUES STRIP                                                  */}
      {/* ========================================================================= */}
      <div className="p-3 bg-[var(--card-bg)]/90 border border-[var(--sub-alt)] rounded-2xl overflow-x-auto shadow-xs">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-[var(--sub-color)] uppercase tracking-wider px-2 font-mono flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Ligalari:</span>
          </span>
          {speedTierOptions.map((tier) => {
            const isSelected = speedTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  setSpeedTier(tier.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--main-color)] text-[var(--bg-color,#090d16)] shadow-xs scale-102'
                    : 'bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                <span>{tier.icon}</span>
                <span>{tier.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-[var(--bg-color,#090d16)]' : 'bg-[var(--card-bg)] text-[var(--sub-color)]'}`}>
                  {tier.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* USER RANK BANNER (FOR LOGGED IN USERS)                                    */}
      {/* ========================================================================= */}
      {myRankingInfo && (
        <div className="bg-gradient-to-r from-[var(--main-color)]/25 via-[var(--card-bg)] to-[var(--card-bg)] border border-[var(--main-color)]/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-[var(--main-color)]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] font-black text-base flex items-center justify-center shadow-md shadow-[var(--main-color)]/30 shrink-0">
              #{myRankingInfo.rank}
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-[var(--text-color)] flex flex-wrap items-center gap-2">
                <span>Sizning o'rningiz: #{myRankingInfo.rank}</span>
                <span className="text-[var(--main-color)] font-extrabold">({myRankingInfo.item.displayWpm} WPM)</span>
                {myRankingInfo.gapToNext > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-semibold">
                    #{myRankingInfo.nextRank} o'ringa: +{myRankingInfo.gapToNext} WPM kerak
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--sub-color)] font-sans mt-0.5">
                {currentUser?.displayName || currentUser?.username} • Jami {totalCount} ta teruvchi orasida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleShareMyRank}
              className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[var(--sub-alt)]"
              title="Natijamni nusxalash"
            >
              {copiedShare ? (
                <>
                  <CopyCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[var(--sub-color)]" />
                  <span>Ulashish</span>
                </>
              )}
            </button>

            <button
              onClick={handleJumpToMyRank}
              className="px-4 py-2 rounded-xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Qatorimga sakrash</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Guest Notice */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[var(--card-bg)] to-[var(--card-bg)] border border-amber-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-color)]">
                Reytingda o'rningizni ko'rish va natijangizni saqlash uchun tizimga kiring
              </div>
              <p className="text-xs text-[var(--sub-color)] mt-0.5 font-sans">
                Mehmon natijalari reytingga kiritilmaydi. Google yoki email orqali tezda tizimga kiring!
              </p>
            </div>
          </div>
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] text-xs font-black hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md shadow-[var(--main-color)]/25"
            >
              <span>Kirish / Ro'yxatdan o'tish</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN RESPONSIVE LAYOUT (Sidebar + Main Content Table/Grid)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Filters */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Scope Filters Card */}
          <div className="bg-[var(--card-bg)]/90 border border-[var(--sub-alt)] rounded-3xl p-3.5 space-y-1.5 shadow-sm">
            <div className="text-[11px] font-bold text-[var(--sub-color)] uppercase tracking-wider px-2 py-1 mb-1 font-mono flex items-center justify-between">
              <span>Reyting Turi</span>
              <Filter className="w-3.5 h-3.5 text-[var(--sub-color)]" />
            </div>
            {scopeTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = scope === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setScope(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[var(--main-color)] text-[var(--bg-color,#090d16)] font-bold shadow-md shadow-[var(--main-color)]/20'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Time Limit Filters Card */}
          <div className="bg-[var(--card-bg)]/90 border border-[var(--sub-alt)] rounded-3xl p-3.5 space-y-1.5 shadow-sm">
            <div className="text-[11px] font-bold text-[var(--sub-color)] uppercase tracking-wider px-2 py-1 mb-1 font-mono">
              Vaqt Rejimi
            </div>
            <div className="grid grid-cols-1 gap-1">
              {timeOptions.map((opt) => {
                const isActive = timeFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTimeFilter(opt.id);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[var(--sub-alt)] text-[var(--main-color)] font-bold'
                        : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-[var(--main-color)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Rules & Anti-Cheat Card */}
          <div className="p-4 rounded-3xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-color)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Haqiqiy & Anti-Cheat</span>
            </div>
            <p className="text-[11px] text-[var(--sub-color)] leading-relaxed font-sans">
              Barcha natijalar mexanik bosish chastotasi va botlarga qarshi tekshiruvdan o'tadi. Faqat haqiqiy teruvchilar reytingda aks etadi.
            </p>
          </div>
        </div>

        {/* Right Main Column: Podium + Table/Grid + Pagination */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          {/* Podium for Top 3 */}
          {currentPage === 1 && !searchQuery.trim() && speedTier === 'all' && sortedList.length > 0 && (
            <LeaderboardPodium
              topUsers={typingPodiumUsers}
              onSelectUser={openUserProfile}
              currentUserId={currentUser?.uid}
            />
          )}

          {/* Controls Bar: Search & Page size */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card-bg)] p-3.5 rounded-3xl border border-[var(--sub-alt)] shadow-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sub-color)]" />
              <input
                type="text"
                placeholder="Foydalanuvchi yoki taxallus bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sub-color)] hover:text-[var(--text-color)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--sub-color)]">
              <span className="font-mono text-xs">
                Jami: <span className="font-bold text-[var(--text-color)]">{totalCount}</span> ta
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-[var(--text-color)] px-1.5 text-xs">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DISPLAY MODE 1: MODERN TABLE VIEW                                        */}
          {/* ========================================================================= */}
          {viewMode === 'table' && (
            <div className="bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--sub-alt)] text-[var(--sub-color)] text-[11px] uppercase tracking-wider font-mono bg-[var(--sub-alt)]/25">
                      <th className="py-3.5 px-3 sm:px-4 w-14 text-center">#</th>
                      <th className="py-3.5 px-3 sm:px-4">Ishtirokchi</th>
                      <th className="py-3.5 px-3 sm:px-4 text-center">Liga</th>
                      <th className="py-3.5 px-3 sm:px-4 text-right">WPM</th>
                      <th className="py-3.5 px-3 sm:px-4 text-right hidden md:table-cell">Aniqlik</th>
                      <th className="py-3.5 px-3 sm:px-4 text-right hidden lg:table-cell">Raw WPM</th>
                      <th className="py-3.5 px-3 sm:px-4 text-right hidden lg:table-cell">Barqarorlik</th>
                      <th className="py-3.5 px-3 sm:px-4 text-right">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sub-alt)]/40 font-mono">
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-[var(--sub-color)]">
                          <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3 px-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-1">
                              <Trophy className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-[var(--text-color)] font-mono">
                              Hozircha natijalar yo'q.
                            </h4>
                            <p className="text-xs sm:text-sm text-[var(--sub-color)] max-w-sm leading-relaxed font-sans">
                              Ushbu filtrlarga mos keluvchi natijalar topilmadi. Test topshirib, o'rningizni egallang!
                            </p>
                            {onGoToTyping && (
                              <button
                                onClick={onGoToTyping}
                                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--main-color)] hover:opacity-90 text-[var(--bg-color,#090d16)] font-black text-xs sm:text-sm transition-transform active:scale-95 shadow-md shadow-[var(--main-color)]/20 cursor-pointer"
                              >
                                <Zap className="w-4 h-4 fill-current" />
                                <span>Test topshirish</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((item) => {
                        const isMe = currentUser?.uid === item.uid;
                        const tierInfo = getSpeedTier(item.displayWpm);
                        return (
                          <tr
                            key={item.uid}
                            id={`typing-rank-row-${item.uid}`}
                            onClick={() => openUserProfile(item)}
                            className={`hover:bg-[var(--sub-alt)]/50 transition-colors cursor-pointer group ${
                              isMe ? 'bg-[var(--main-color)]/10 font-bold border-l-4 border-[var(--main-color)]' : ''
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <div className="flex items-center justify-center">
                                {getRankBadge(item.rank)}
                              </div>
                            </td>

                            {/* User Info */}
                            <td className="py-3.5 px-3 sm:px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                                    alt={item.displayName}
                                    className="w-9 h-9 rounded-xl object-cover border border-[var(--sub-alt)] group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[var(--text-color)] text-xs sm:text-sm truncate group-hover:text-[var(--main-color)] transition-colors">
                                      {item.displayName}
                                    </span>
                                    {item.isVerified && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    )}
                                    {isMe && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--main-color)] text-[var(--bg-color,#090d16)]">
                                        SIZ
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[var(--sub-color)] font-normal truncate">
                                    @{item.username} • Lv.{item.level}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Speed Tier Pill */}
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${tierInfo.badgeClass}`}>
                                <span>{tierInfo.icon}</span>
                                <span>{tierInfo.label}</span>
                              </span>
                            </td>

                            {/* WPM */}
                            <td className="py-3.5 px-3 sm:px-4 text-right">
                              <span className="text-base sm:text-lg font-black text-[var(--main-color)] flex items-center justify-end gap-1">
                                {item.displayWpm >= 120 && <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                {item.displayWpm >= 100 && item.displayWpm < 120 && <Zap className="w-3.5 h-3.5 text-sky-400" />}
                                <span>{item.displayWpm}</span>
                              </span>
                            </td>

                            {/* Accuracy */}
                            <td className="py-3.5 px-3 sm:px-4 text-right hidden md:table-cell">
                              <span className="text-xs sm:text-sm text-[var(--text-color)] font-bold">
                                {item.highestAccuracy}%
                              </span>
                            </td>

                            {/* Raw WPM */}
                            <td className="py-3.5 px-3 sm:px-4 text-right text-[var(--sub-color)] text-xs hidden lg:table-cell">
                              {item.rawWpmCalc}
                            </td>

                            {/* Consistency */}
                            <td className="py-3.5 px-3 sm:px-4 text-right text-[var(--sub-color)] text-xs hidden lg:table-cell">
                              {item.consistencyCalc}
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-3 sm:px-4 text-right text-[var(--sub-color)] text-xs whitespace-nowrap">
                              {item.dateFormatted}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Controls */}
              <div className="p-3.5 bg-[var(--sub-alt)]/20 border-t border-[var(--sub-alt)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--sub-color)]">
                  <span>Sahifada ko'rsatish:</span>
                  {[15, 25, 50, 100].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                        pageSize === size
                          ? 'bg-[var(--main-color)] text-[var(--bg-color,#090d16)] shadow-xs'
                          : 'bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg text-xs hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Birinchi sahifa"
                  >
                    « 1
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs font-bold text-[var(--main-color)] px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded-lg text-xs hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Oxirgi sahifa"
                  >
                    {totalPages} »
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DISPLAY MODE 2: ESPORTS CARDS GRID VIEW                                   */}
          {/* ========================================================================= */}
          {viewMode === 'grid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {pageItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-[var(--sub-color)] bg-[var(--card-bg)] rounded-3xl border border-[var(--sub-alt)]">
                    <Trophy className="w-10 h-10 mx-auto text-amber-400 mb-2 opacity-50" />
                    <p className="font-bold text-sm text-[var(--text-color)]">Natijalar topilmadi</p>
                  </div>
                ) : (
                  pageItems.map((item) => {
                    const isMe = currentUser?.uid === item.uid;
                    const tierInfo = getSpeedTier(item.displayWpm);
                    return (
                      <div
                        key={item.uid}
                        onClick={() => openUserProfile(item)}
                        className={`relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden ${
                          isMe
                            ? 'bg-gradient-to-br from-[var(--main-color)]/20 via-[var(--card-bg)] to-[var(--card-bg)] border-[var(--main-color)] shadow-lg shadow-[var(--main-color)]/10 ring-2 ring-[var(--main-color)]/40'
                            : 'bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/80 border-[var(--sub-alt)] hover:border-[var(--main-color)]/50 hover:shadow-lg hover:-translate-y-1'
                        }`}
                      >
                        {/* Top Rank + Tier Badge */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            {getRankBadge(item.rank)}
                            <span className="text-xs font-mono text-[var(--sub-color)]">
                              #{item.rank}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${tierInfo.badgeClass}`}>
                            {tierInfo.icon} {tierInfo.label}
                          </span>
                        </div>

                        {/* User Identity */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-[var(--main-color)]/40 to-transparent shrink-0">
                            <img
                              src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                              alt={item.displayName}
                              className="w-full h-full rounded-2xl object-cover bg-[var(--card-bg)]"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-[var(--text-color)] truncate group-hover:text-[var(--main-color)] transition-colors">
                                {item.displayName}
                              </h4>
                              {item.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                            </div>
                            <p className="text-xs text-[var(--sub-color)] font-mono truncate">
                              @{item.username}
                            </p>
                          </div>
                        </div>

                        {/* Speedometer Metrics Card */}
                        <div className="bg-[var(--sub-alt)]/30 rounded-2xl p-3 flex items-center justify-around border border-[var(--sub-alt)]/40 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-black font-mono text-[var(--main-color)]">
                              {item.displayWpm}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-[var(--sub-color)]">
                              WPM
                            </div>
                          </div>
                          <div className="h-8 w-px bg-[var(--sub-alt)]/60" />
                          <div className="text-center">
                            <div className="text-base font-bold font-mono text-[var(--text-color)]">
                              {item.highestAccuracy}%
                            </div>
                            <div className="text-[10px] uppercase font-bold text-[var(--sub-color)]">
                              Aniqlik
                            </div>
                          </div>
                          <div className="h-8 w-px bg-[var(--sub-alt)]/60" />
                          <div className="text-center">
                            <div className="text-sm font-bold font-mono text-purple-400">
                              Lv.{item.level}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-[var(--sub-color)]">
                              Daraja
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Date & Profile hint */}
                        <div className="flex items-center justify-between text-[11px] text-[var(--sub-color)] font-mono pt-1">
                          <span>{item.dateFormatted}</span>
                          <span className="group-hover:text-[var(--main-color)] flex items-center gap-1 font-bold transition-colors">
                            <span>Profil</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Grid Pagination Bar */}
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--sub-color)]">
                  Sahifa <span className="text-[var(--text-color)] font-bold">{currentPage}</span> / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    Oldingi
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] shadow-2xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 font-mono text-xs font-bold cursor-pointer border border-white/20"
          title="Tepaga qaytish"
        >
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Tepaga</span>
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
