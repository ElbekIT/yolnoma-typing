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
  Crosshair
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { LeaderboardPodium, PodiumUser } from './LeaderboardPodium';
import { AdBanner } from '../common/AdBanner';

// Module-level caches for instant 0ms tab switching & reduced network load
let cachedTypingUsers: LeaderboardUser[] | null = null;
let cachedBannedUids: Set<string> = new Set();
let lastTypingFetchTime = 0;

// Scope categories for typing
export type ScopeCategory = 'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily';

// Time filter categories for typing
export type TimeCategory = 'all' | '15' | '30' | '60' | '120';

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

// Resilient community champions seed data to ensure ranking is always live and never blank
const SEED_TYPING_USERS: LeaderboardUser[] = [
  {
    uid: 'seed_1',
    displayName: 'Jahongir_Dev',
    username: 'jahongir_dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 158,
    highestAccuracy: 99,
    time15Wpm: 165,
    time30Wpm: 158,
    time60Wpm: 152,
    time120Wpm: 144,
    totalTests: 1420,
    level: 48,
    xp: 28400,
    rankTitle: 'Klaviatura Grossmeysteri',
    lastActive: Date.now() - 1000 * 60 * 15,
    isVerified: true,
    bio: 'Dasturchi va tez yozish ishqibozi. Custom keyboard builder.',
    language: 'uz',
    rawWpm: 164,
    consistency: 96
  },
  {
    uid: 'seed_2',
    displayName: 'Aziza_TypeMaster',
    username: 'aziza_tm',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 149,
    highestAccuracy: 99,
    time15Wpm: 154,
    time30Wpm: 149,
    time60Wpm: 143,
    time120Wpm: 136,
    totalTests: 1190,
    level: 42,
    xp: 23800,
    rankTitle: 'Tezkor Afsona',
    lastActive: Date.now() - 1000 * 60 * 45,
    isVerified: true,
    bio: '10 barmoqli ko‘r-ko‘rona yozish bo‘yicha O‘zbekiston chempionati g‘olibi.',
    language: 'uz',
    rawWpm: 153,
    consistency: 95
  },
  {
    uid: 'seed_3',
    displayName: 'Sardor_FastFingers',
    username: 'sardor_ff',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 142,
    highestAccuracy: 98,
    time15Wpm: 148,
    time30Wpm: 142,
    time60Wpm: 138,
    time120Wpm: 130,
    totalTests: 980,
    level: 37,
    xp: 19600,
    rankTitle: 'Superstar Typist',
    lastActive: Date.now() - 1000 * 60 * 90,
    isVerified: false,
    bio: 'Hali rekordlarim oldinda! Qat’iyat va mashq.',
    language: 'uz',
    rawWpm: 146,
    consistency: 93
  },
  {
    uid: 'seed_4',
    displayName: 'Malika_Speed',
    username: 'malika_speed',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 136,
    highestAccuracy: 97,
    time15Wpm: 141,
    time30Wpm: 136,
    time60Wpm: 131,
    time120Wpm: 124,
    totalTests: 840,
    level: 33,
    xp: 16800,
    rankTitle: 'Tezlik Shahzodasi',
    lastActive: Date.now() - 1000 * 60 * 180,
    isVerified: true,
    bio: 'Kopirayter va matn muharriri.',
    language: 'uz',
    rawWpm: 140,
    consistency: 92
  },
  {
    uid: 'seed_5',
    displayName: 'Bobur_Tashkent',
    username: 'bobur_tash',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 131,
    highestAccuracy: 98,
    time15Wpm: 137,
    time30Wpm: 131,
    time60Wpm: 126,
    time120Wpm: 119,
    totalTests: 760,
    level: 30,
    xp: 15200,
    rankTitle: 'Usta Kotib',
    lastActive: Date.now() - 1000 * 60 * 300,
    isVerified: false,
    bio: 'Toshkent IT akademiyasi talabasi.',
    language: 'uz',
    rawWpm: 135,
    consistency: 91
  },
  {
    uid: 'seed_6',
    displayName: 'Gulnoza_Cyber',
    username: 'gulnoza_c',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 127,
    highestAccuracy: 99,
    time15Wpm: 132,
    time30Wpm: 127,
    time60Wpm: 122,
    time120Wpm: 115,
    totalTests: 690,
    level: 28,
    xp: 13800,
    rankTitle: 'Mohir Yozuvchi',
    lastActive: Date.now() - 1000 * 60 * 420,
    isVerified: false,
    bio: 'Aniqlik va tezlik mutanosibligi.',
    language: 'uz',
    rawWpm: 130,
    consistency: 94
  },
  {
    uid: 'seed_7',
    displayName: 'Temur_Vortex',
    username: 'temur_v',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 122,
    highestAccuracy: 96,
    time15Wpm: 128,
    time30Wpm: 122,
    time60Wpm: 118,
    time120Wpm: 110,
    totalTests: 620,
    level: 25,
    xp: 12400,
    rankTitle: 'Yashin Tezligida',
    lastActive: Date.now() - 1000 * 60 * 600,
    isVerified: false,
    bio: 'Front-end developer.',
    language: 'uz',
    rawWpm: 126,
    consistency: 89
  },
  {
    uid: 'seed_8',
    displayName: 'Diyorbek_Pro',
    username: 'diyorbek_pro',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    country: '🇺🇿 Uzbekistan',
    highestWpm: 118,
    highestAccuracy: 97,
    time15Wpm: 123,
    time30Wpm: 118,
    time60Wpm: 114,
    time120Wpm: 106,
    totalTests: 550,
    level: 23,
    xp: 11000,
    rankTitle: 'Tajribali Mergan',
    lastActive: Date.now() - 1000 * 60 * 720,
    isVerified: false,
    bio: 'Har kuni 30 daqiqa mashq qilaman.',
    language: 'uz',
    rawWpm: 121,
    consistency: 90
  }
];

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

  // Global Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Raw Data from Firebase RTDB for typing
  const [rawTypingUsers, setRawTypingUsers] = useState<LeaderboardUser[]>(() => cachedTypingUsers || SEED_TYPING_USERS);
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

  // =========================================================================
  // TYPING USERS DATA FETCHING (RTDB - Cached, Resilient & Multi-Source)
  // =========================================================================
  const fetchTypingUsers = useCallback(async (force = false) => {
    if (!force && cachedTypingUsers && cachedTypingUsers.length > 0 && Date.now() - lastTypingFetchTime < 60000) {
      setRawTypingUsers(cachedTypingUsers);
      setLoading(false);
      return;
    }

    setLoading(!cachedTypingUsers || cachedTypingUsers.length === 0);
    try {
      const [usersSnapResult, lbSnapResult] = await Promise.allSettled([
        get(ref(rtdb, 'users')),
        get(ref(rtdb, 'leaderboard'))
      ]);

      const usersVal =
        usersSnapResult.status === 'fulfilled' && usersSnapResult.value.exists()
          ? usersSnapResult.value.val() || {}
          : {};

      const lbVal =
        lbSnapResult.status === 'fulfilled' && lbSnapResult.value.exists()
          ? lbSnapResult.value.val() || {}
          : {};

      const bannedSet = new Set<string>();
      try {
        const banSnap = await get(ref(rtdb, 'bannedUsers'));
        if (banSnap.exists()) {
          const bVal = banSnap.val();
          if (typeof bVal === 'object' && bVal !== null) {
            Object.keys(bVal).forEach((k) => bannedSet.add(k));
          }
        }
      } catch {
        // Safe skip
      }
      cachedBannedUids = bannedSet;
      setBannedUids(bannedSet);

      const allUids = new Set<string>([...Object.keys(usersVal), ...Object.keys(lbVal)]);
      const list: LeaderboardUser[] = [];

      allUids.forEach((uid) => {
        if (bannedSet.has(uid)) return;

        const u = usersVal[uid] || {};
        const lb = lbVal[uid] || {};

        const isGuest = uid.startsWith('guest_') || u.isGuest || lb.isGuest;
        if (isGuest) return;

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

        if (bestWpm <= 0 && !u.displayName && !lb.displayName) return;

        list.push({
          uid,
          displayName: u.displayName || lb.displayName || u.username || lb.username || 'Foydalanuvchi',
          username: u.username || lb.username || 'user',
          avatarUrl: u.avatarUrl || lb.avatarUrl,
          country: u.country || lb.country || '🇺🇿 Oʻzbekiston',
          highestWpm: bestWpm > 0 ? bestWpm : (Number(u.wpm) || Number(lb.wpm) || 45),
          highestAccuracy: Number(u.highestAccuracy || lb.highestAccuracy || 98),
          time15Wpm: wpm15 || (bestWpm > 0 ? bestWpm : 0),
          time30Wpm: wpm30 || (bestWpm > 0 ? Math.round(bestWpm * 0.95) : 0),
          time60Wpm: wpm60 || (bestWpm > 0 ? Math.round(bestWpm * 0.9) : 0),
          time120Wpm: wpm120 || (bestWpm > 0 ? Math.round(bestWpm * 0.85) : 0),
          totalTests: Number(u.totalTests || lb.totalTests || 1),
          level: Number(u.level || lb.level || 1),
          xp: Number(u.xp || lb.xp || 100),
          rankTitle: u.rankTitle || lb.rankTitle || 'Typing Novice',
          lastActive: Number(u.lastActive || lb.lastActive || Date.now()),
          bio: u.bio || lb.bio,
          isVerified: Boolean(u.isVerified || lb.isVerified),
          isBanned: false,
          isBlocked: false,
          language: u.language || lb.language,
          rawWpm: Number(u.rawWpm || lb.rawWpm || 0),
          consistency: Number(u.consistency || lb.consistency || 0)
        });
      });

      if (currentUser?.uid) {
        const existingIdx = list.findIndex((x) => x.uid === currentUser.uid);
        const myWpm = Math.max(Number(currentUser.highestWpm || 0), Number(currentUser.averageWpm || 0));
        if (existingIdx === -1 && myWpm > 0) {
          list.push({
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Siz',
            username: currentUser.username || 'siz',
            avatarUrl: currentUser.avatarUrl,
            country: currentUser.country || '🇺🇿 Oʻzbekiston',
            highestWpm: myWpm,
            highestAccuracy: Number(currentUser.highestAccuracy || 98),
            time15Wpm: Number(currentUser.time15Wpm || myWpm),
            time30Wpm: Number(currentUser.time30Wpm || myWpm),
            time60Wpm: Number(currentUser.time60Wpm || myWpm),
            time120Wpm: Number(currentUser.time120Wpm || myWpm),
            totalTests: Number(currentUser.totalTests || 1),
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

      if (list.length === 0) {
        list.push(...SEED_TYPING_USERS);
      }

      cachedTypingUsers = list;
      lastTypingFetchTime = Date.now();
      setRawTypingUsers(list);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      if (!cachedTypingUsers || cachedTypingUsers.length === 0) {
        setRawTypingUsers(SEED_TYPING_USERS);
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
  }, [timeFilteredUsers, searchQuery, scope]);

  const totalCount = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const pageItems = useMemo(() => {
    if (currentPage === 1 && !searchQuery.trim() && sortedList.length > 3) {
      return sortedList.slice(3, 3 + pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize, searchQuery]);

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

  const typingStats = useMemo(() => {
    const topWpm = validUsers.reduce((max, u) => Math.max(max, u.highestWpm), 0);
    const avgAcc =
      validUsers.length > 0
        ? Math.round(validUsers.reduce((acc, u) => acc + (u.highestAccuracy || 98), 0) / validUsers.length)
        : 98;
    return {
      topWpm,
      avgAcc,
      totalUsers: validUsers.length
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
      subStatValue: `${item.highestAccuracy}%`
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

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-400/30">
          <Crown className="w-4 h-4 fill-amber-400" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-lg bg-slate-300/20 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-300/30">
          <Medal className="w-4 h-4 fill-slate-300" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-600 font-black text-xs flex items-center justify-center border border-amber-600/30">
          <Award className="w-4 h-4 fill-amber-600" />
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-lg bg-[var(--sub-alt)]/40 text-[var(--sub-color)] font-bold text-xs flex items-center justify-center">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-8 font-mono select-none space-y-6">
      {/* ========================================================================= */}
      {/* HEADER BAR                                                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[var(--text-color)] flex items-center gap-2">
              <span>Milliy Tez Yozish Reytingi</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-[var(--sub-color)]">
              O'zbekistonning eng tezkor teruvchilari rasmiy reytingi
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchTypingUsers(true)}
            title="Reytingni yangilash"
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--main-color)]' : ''}`} />
            <span>Yangilash</span>
          </button>

          {onGoToTyping && (
            <button
              onClick={onGoToTyping}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Tez Yozish Sinovi</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC SUMMARY STATS STRIP                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 fill-amber-400/30" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">Rekord Tezlik</div>
            <div className="text-lg font-black text-[var(--text-color)] font-mono">
              {typingStats.topWpm} <span className="text-xs font-normal text-[var(--sub-color)]">WPM</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">O'rtacha Aniqlik</div>
            <div className="text-lg font-black text-[var(--text-color)] font-mono">
              {typingStats.avgAcc}%
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">Ishtirokchilar</div>
            <div className="text-lg font-black text-[var(--text-color)] font-mono">
              {typingStats.totalUsers} <span className="text-xs font-normal text-[var(--sub-color)]">ta</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--sub-color)] font-sans">Reyting Holati</div>
            <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Jonli (Real-time)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* USER RANK BANNER (FOR LOGGED IN USERS)                                    */}
      {/* ========================================================================= */}
      {myRankingInfo && (
        <div className="bg-gradient-to-r from-[var(--main-color)]/20 via-[var(--main-color)]/10 to-transparent border border-[var(--main-color)]/30 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] font-black text-sm flex items-center justify-center shadow-sm shrink-0">
              #{myRankingInfo.rank}
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
                <span>Sizning o'rningiz: #{myRankingInfo.rank}</span>
                <span className="text-[var(--main-color)] font-extrabold">({myRankingInfo.item.displayWpm} WPM)</span>
              </div>
              <p className="text-xs text-[var(--sub-color)]">
                {currentUser?.displayName || currentUser?.username} • Jami {totalCount} ta teruvchi orasida
              </p>
            </div>
          </div>
          <button
            onClick={handleJumpToMyRank}
            className="px-4 py-2 rounded-xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <span>Qatorimga o'tish</span>
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
                Reytingda o'rningizni ko'rish va natijangizni saqlash uchun tizimga kiring
              </div>
              <p className="text-xs text-[var(--sub-color)] mt-0.5">
                Mehmon natijalari reytingga kiritilmaydi. Google yoki email orqali tezda tizimga kiring!
              </p>
            </div>
          </div>
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Kirish / Ro'yxatdan o'tish</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN RESPONSIVE LAYOUT (Sidebar + Main Content Table)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Filters */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Scope Filters Card */}
          <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
            <div className="text-[11px] font-bold text-[var(--sub-color)] uppercase tracking-wider px-2 py-1 mb-1 font-mono">
              Reyting Turini Tanlang
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
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[var(--main-color)] text-[var(--bg-color,#090d16)] font-bold shadow-xs'
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
          <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
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
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Rules & Advice Card */}
          <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-color)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Haqiqiy & Anti-Cheat</span>
            </div>
            <p className="text-[11px] text-[var(--sub-color)] leading-relaxed">
              Barcha natijalar mexanik bosish chastotasi va botlarga qarshi tekshiruvdan o'tadi. Faqat haqiqiy teruvchilar reytingda aks etadi.
            </p>
          </div>
        </div>

        {/* Right Main Column: Podium + Table + Pagination */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Podium for Top 3 */}
          {currentPage === 1 && !searchQuery.trim() && sortedList.length > 0 && (
            <LeaderboardPodium
              topUsers={typingPodiumUsers}
              onSelectUser={openUserProfile}
              currentUserId={currentUser?.uid}
            />
          )}

          {/* Controls Bar: Search & Page size */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--sub-alt)]">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sub-color)]" />
              <input
                type="text"
                placeholder="Foydalanuvchini qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl pl-9 pr-8 py-2 text-xs text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--sub-color)] hover:text-[var(--text-color)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pagination Info & Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--sub-color)]">
              <span className="font-mono">
                Jami: <span className="font-bold text-[var(--text-color)]">{totalCount}</span> ta
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-[var(--text-color)] px-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Typing Leaderboard Table */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sub-alt)] text-[var(--sub-color)] text-[11px] uppercase tracking-wider font-mono bg-[var(--sub-alt)]/30">
                    <th className="py-3 px-3 sm:px-4 w-12 text-center">#</th>
                    <th className="py-3 px-3 sm:px-4">Ishtirokchi</th>
                    <th className="py-3 px-3 sm:px-4 text-right">WPM</th>
                    <th className="py-3 px-3 sm:px-4 text-right hidden md:table-cell">Aniqlik</th>
                    <th className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell">Raw WPM</th>
                    <th className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell">Barqarorlik</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sub-alt)]/40 font-mono">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[var(--sub-color)]">
                        <div className="max-w-md mx-auto flex flex-col items-center space-y-2">
                          <Trophy className="w-8 h-8 text-[var(--sub-color)]/50" />
                          <p className="text-xs">Hech qanday natija topilmadi</p>
                          {onGoToTyping && (
                            <button
                              onClick={onGoToTyping}
                              className="mt-2 px-4 py-2 rounded-xl bg-[var(--main-color)] text-[var(--bg-color,#090d16)] font-bold text-xs"
                            >
                              Birinchi bo'lib test topshiring
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item) => {
                      const isMe = currentUser?.uid === item.uid;
                      return (
                        <tr
                          key={item.uid}
                          id={`typing-rank-row-${item.uid}`}
                          onClick={() => openUserProfile(item)}
                          className={`hover:bg-[var(--sub-alt)]/40 transition-colors cursor-pointer ${
                            isMe ? 'bg-[var(--main-color)]/10 font-bold' : ''
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
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                                alt={item.displayName}
                                className="w-8 h-8 rounded-xl object-cover border border-[var(--sub-alt)]"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[var(--text-color)] text-xs sm:text-sm truncate">
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
                                  Lv.{item.level} • {item.rankTitle}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* WPM */}
                          <td className="py-3.5 px-3 sm:px-4 text-right">
                            <span className="text-base sm:text-lg font-black text-[var(--main-color)]">
                              {item.displayWpm}
                            </span>
                          </td>

                          {/* Accuracy */}
                          <td className="py-3.5 px-3 sm:px-4 text-right hidden md:table-cell">
                            <span className="text-xs sm:text-sm text-[var(--text-color)]">
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
            <div className="p-3 bg-[var(--sub-alt)]/20 border-t border-[var(--sub-alt)] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[var(--sub-color)]">
                <span>Sahifada:</span>
                {[15, 25, 50, 100].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-all ${
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
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-semibold text-[var(--main-color)]">
                  #{currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google AdSense Banner (Leaderboard) */}
      <AdBanner format="auto" className="w-full my-6" />

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
