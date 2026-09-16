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
  Swords,
  Crosshair,
  RotateCcw,
  Play,
  Rocket
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { LeaderboardPodium, PodiumUser } from './LeaderboardPodium';
import { SentenceScoreRecord, getTopSentenceScores, deduplicateSentenceScores } from '../../utils/sentencesLeaderboard';
import { SpaceScoreRecord, getTopSpaceScores, deduplicateSpaceScores } from '../../utils/spaceLeaderboard';

// Module-level caches for instant 0ms tab switching & reduced network load
let cachedTypingUsers: LeaderboardUser[] | null = null;
let cachedBannedUids: Set<string> = new Set();
let lastTypingFetchTime = 0;
let cachedSentenceScores: SentenceScoreRecord[] | null = null;
let lastSentenceFetchTime = 0;
let cachedSpaceScores: SpaceScoreRecord[] | null = null;
let lastSpaceFetchTime = 0;

// Main Leaderboard Domains (Completely Separated)
export type LeaderboardDomain = 'typing' | 'sentences' | 'space';

// Ranking mode: best personal score per player vs all attempts
export type LeaderboardViewMode = 'unique' | 'all';

// Scope categories for typing
export type ScopeCategory = 'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily';

// Time filter categories for typing
export type TimeCategory = 'all' | '15' | '30' | '60' | '120';

// Category filter for sentence practice
export type SentenceCategoryFilter = 'all' | 'daily' | 'business' | 'tech' | 'ielts';

// Language filter for Space Battle
export type SpaceLanguageFilter = 'all' | 'uz' | 'en';

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
  onGoToSentences?: () => void;
  onGoToSpace?: () => void;
  onGoToTyping?: () => void;
  defaultScope?: ScopeCategory;
  initialDomain?: LeaderboardDomain;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onOpenLogin,
  onGoToSentences,
  onGoToSpace,
  onGoToTyping,
  defaultScope,
  initialDomain
}) => {
  const { profile: currentUser } = useAuth();
  const { t } = useI18n();

  // Active Main Domain (Tez Yozish vs Inglizcha Jumlalar vs Koinot Jangi)
  const [domain, setDomain] = useState<LeaderboardDomain>(initialDomain || 'typing');

  // Filters for Typing
  const [scope, setScope] = useState<ScopeCategory>(defaultScope || 'all-time-uzbek');
  const [timeFilter, setTimeFilter] = useState<TimeCategory>('all');

  // Filters for Sentences
  const [sentenceCategoryFilter, setSentenceCategoryFilter] = useState<SentenceCategoryFilter>('all');

  // Filters for Space Battle
  const [spaceLanguageFilter, setSpaceLanguageFilter] = useState<SpaceLanguageFilter>('all');

  // Global Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Raw Data from Firebase RTDB for typing
  const [rawTypingUsers, setRawTypingUsers] = useState<LeaderboardUser[]>(() => cachedTypingUsers || []);
  const [bannedUids, setBannedUids] = useState<Set<string>>(() => cachedBannedUids);
  const [loading, setLoading] = useState(() => !cachedTypingUsers);

  // Sentences Practice Leaderboard Data (Real scores only)
  const [sentenceScores, setSentenceScores] = useState<SentenceScoreRecord[]>(() => cachedSentenceScores || []);
  const [sentenceLoading, setSentenceLoading] = useState(false);

  // Space Battle Leaderboard Data (Real scores only)
  const [spaceScores, setSpaceScores] = useState<SpaceScoreRecord[]>(() => cachedSpaceScores || []);
  const [spaceLoading, setSpaceLoading] = useState(false);
  // Default to 'unique' (only 1 best record per player, prevents duplicate entries)
  const [spaceModeFilter, setSpaceModeFilter] = useState<LeaderboardViewMode>('unique');
  const [sentenceModeFilter, setSentenceModeFilter] = useState<LeaderboardViewMode>('unique');

  // Profile modal
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Floating Scroll to Top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync initialDomain if changed from parent
  useEffect(() => {
    if (initialDomain) {
      setDomain(initialDomain);
    }
  }, [initialDomain]);

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
  // 1. TYPING USERS DATA FETCHING (RTDB - Cached & Fast)
  // =========================================================================
  const fetchTypingUsers = useCallback(async (force = false) => {
    if (!force && cachedTypingUsers && Date.now() - lastTypingFetchTime < 60000) {
      setRawTypingUsers(cachedTypingUsers);
      setBannedUids(cachedBannedUids);
      setLoading(false);
      return;
    }

    setLoading(!cachedTypingUsers);
    try {
      const [bansSnap, usersSnap] = await Promise.all([
        get(ref(rtdb, 'banned_uids')),
        get(ref(rtdb, 'users'))
      ]);

      const bannedSet = new Set<string>();
      if (bansSnap.exists()) {
        const val = bansSnap.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => bannedSet.add(k));
        }
      }
      cachedBannedUids = bannedSet;
      setBannedUids(bannedSet);

      if (usersSnap.exists()) {
        const val = usersSnap.val();
        const list: LeaderboardUser[] = [];

        Object.keys(val).forEach((uid) => {
          const u = val[uid];
          if (!u) return;

          const isGuest = uid.startsWith('guest_') || u.isGuest;
          if (isGuest) return;

          const wpm15 = Number(u.time15Wpm || 0);
          const wpm30 = Number(u.time30Wpm || 0);
          const wpm60 = Number(u.time60Wpm || 0);
          const wpm120 = Number(u.time120Wpm || 0);
          const bestWpm = Math.max(
            Number(u.highestWpm || 0),
            wpm15,
            wpm30,
            wpm60,
            wpm120,
            Number(u.averageWpm || 0)
          );

          list.push({
            uid,
            displayName: u.displayName || u.username || 'Foydalanuvchi',
            username: u.username || 'user',
            avatarUrl: u.avatarUrl,
            country: u.country || '🇺🇿 Uzbekistan',
            highestWpm: bestWpm,
            highestAccuracy: Number(u.highestAccuracy || 98),
            time15Wpm: wpm15 || (bestWpm > 0 ? bestWpm : 0),
            time30Wpm: wpm30 || (bestWpm > 0 ? Math.round(bestWpm * 0.95) : 0),
            time60Wpm: wpm60 || (bestWpm > 0 ? Math.round(bestWpm * 0.9) : 0),
            time120Wpm: wpm120 || (bestWpm > 0 ? Math.round(bestWpm * 0.85) : 0),
            totalTests: Number(u.totalTests || 1),
            level: Number(u.level || 1),
            xp: Number(u.xp || 0),
            rankTitle: u.rankTitle || 'Typing Novice',
            lastActive: Number(u.lastActive || Date.now()),
            bio: u.bio,
            isVerified: Boolean(u.isVerified),
            isBanned: Boolean(u.isBanned),
            isBlocked: Boolean(u.isBlocked),
            language: u.language,
            rawWpm: Number(u.rawWpm || 0),
            consistency: Number(u.consistency || 0)
          });
        });

        cachedTypingUsers = list;
        lastTypingFetchTime = Date.now();
        setRawTypingUsers(list);
      } else {
        cachedTypingUsers = [];
        setRawTypingUsers([]);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domain === 'typing') {
      fetchTypingUsers();
    }
  }, [domain, fetchTypingUsers]);

  // =========================================================================
  // 2. SENTENCES LEADERBOARD DATA FETCHING (Real scores only, Cached)
  // =========================================================================
  const fetchSentenceLeaderboard = useCallback(async (force = false) => {
    if (!force && cachedSentenceScores && Date.now() - lastSentenceFetchTime < 60000) {
      setSentenceScores(cachedSentenceScores);
      return;
    }
    setSentenceLoading(!cachedSentenceScores);
    try {
      const snap = await get(ref(rtdb, 'sentence_scores'));
      if (snap.exists()) {
        const data = snap.val();
        const list: SentenceScoreRecord[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item && typeof item.score === 'number') {
            list.push({ id: key, ...item });
          }
        });
        list.sort((a, b) => b.score - a.score);
        cachedSentenceScores = list;
        lastSentenceFetchTime = Date.now();
        setSentenceScores(list);
      } else {
        const list = await getTopSentenceScores(100);
        cachedSentenceScores = list;
        lastSentenceFetchTime = Date.now();
        setSentenceScores(list);
      }
    } catch (err) {
      console.error('Error loading sentence scores:', err);
    } finally {
      setSentenceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domain === 'sentences') {
      fetchSentenceLeaderboard();
    }
  }, [domain, fetchSentenceLeaderboard]);

  // =========================================================================
  // 3. SPACE BATTLE LEADERBOARD DATA FETCHING (Real scores only, Cached)
  // =========================================================================
  const fetchSpaceLeaderboard = useCallback(async (force = false) => {
    if (!force && cachedSpaceScores && Date.now() - lastSpaceFetchTime < 60000) {
      setSpaceScores(cachedSpaceScores);
      return;
    }
    setSpaceLoading(!cachedSpaceScores);
    try {
      const snap = await get(ref(rtdb, 'space_scores'));
      if (snap.exists()) {
        const data = snap.val();
        const list: SpaceScoreRecord[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item && typeof item.score === 'number') {
            list.push({ id: key, ...item });
          }
        });
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
        cachedSpaceScores = list;
        lastSpaceFetchTime = Date.now();
        setSpaceScores(list);
      } else {
        const list = await getTopSpaceScores(100);
        cachedSpaceScores = list;
        lastSpaceFetchTime = Date.now();
        setSpaceScores(list);
      }
    } catch (err) {
      console.error('Error loading space scores:', err);
    } finally {
      setSpaceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domain === 'space') {
      fetchSpaceLeaderboard();
    }
  }, [domain, fetchSpaceLeaderboard]);

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
    } else if (scope === 'all-time-english') {
      list = list.filter((u) => u.language && (u.language.toLowerCase().includes('en') || u.language.toLowerCase().includes('eng')));
      if (list.length === 0) {
        list = validUsers.slice(0, 50);
      }
    } else if (scope === 'weekly-xp') {
      list = list.filter((u) => (u.xp || 0) > 0);
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } else if (scope === 'daily') {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      list = list.filter((u) => (u.lastActive || 0) >= oneDayAgo);
      if (list.length < 5) {
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

  // =========================================================================
  // SENTENCES COMPUTATIONS & STATS
  // =========================================================================
  const sentenceStats = useMemo(() => {
    let topScore = 0;
    let totalSentences = 0;
    let maxCombo = 0;
    sentenceScores.forEach((s) => {
      if (s.score > topScore) topScore = s.score;
      totalSentences += s.sentencesCompleted || 0;
      if (s.maxCombo > maxCombo) maxCombo = s.maxCombo;
    });
    return { topScore, totalSentences, maxCombo, totalPlayers: sentenceScores.length };
  }, [sentenceScores]);

  const filteredSentenceList = useMemo(() => {
    let list = [...sentenceScores];

    if (sentenceModeFilter === 'unique') {
      list = deduplicateSentenceScores(list);
    }

    if (sentenceCategoryFilter !== 'all') {
      list = list.filter((s) => s.category === sentenceCategoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.playerName?.toLowerCase().includes(q));
    }

    list.sort((a, b) => (b.score || 0) - (a.score || 0));
    return list;
  }, [sentenceScores, sentenceModeFilter, sentenceCategoryFilter, searchQuery]);

  // Har bir qatorga aniq global rank berish
  const rankedSentenceList = useMemo(() => {
    return filteredSentenceList.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [filteredSentenceList]);

  const sentenceTotalCount = rankedSentenceList.length;
  const sentenceTotalPages = Math.max(1, Math.ceil(sentenceTotalCount / pageSize));

  const sentencePageItems = useMemo(() => {
    if (currentPage === 1 && !searchQuery.trim() && rankedSentenceList.length > 3) {
      return rankedSentenceList.slice(3, 3 + pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return rankedSentenceList.slice(start, start + pageSize);
  }, [rankedSentenceList, currentPage, pageSize, searchQuery]);

  const mySentenceRankingInfo = useMemo(() => {
    if (!currentUser?.uid) return null;
    const idx = rankedSentenceList.findIndex((s) => s.uid === currentUser.uid);
    if (idx !== -1) {
      return {
        rank: rankedSentenceList[idx].rank,
        item: rankedSentenceList[idx]
      };
    }
    return null;
  }, [currentUser, rankedSentenceList]);

  // =========================================================================
  // SPACE BATTLE COMPUTATIONS & STATS
  // =========================================================================
  const spaceStats = useMemo(() => {
    let topScore = 0;
    let maxWave = 0;
    let totalEnemies = 0;
    const uniquePilots = deduplicateSpaceScores(spaceScores);
    spaceScores.forEach((s) => {
      if ((s.score || 0) > topScore) topScore = s.score;
      if ((s.wave || 1) > maxWave) maxWave = s.wave;
      totalEnemies += s.enemiesKilled || 0;
    });
    return { topScore, maxWave, totalEnemies, totalPilots: uniquePilots.length };
  }, [spaceScores]);

  const filteredSpaceList = useMemo(() => {
    let list = [...spaceScores];

    if (spaceModeFilter === 'unique') {
      list = deduplicateSpaceScores(list);
    }

    if (spaceLanguageFilter !== 'all') {
      list = list.filter((s) => s.language === spaceLanguageFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.playerName?.toLowerCase().includes(q));
    }

    list.sort((a, b) => (b.score || 0) - (a.score || 0));
    return list;
  }, [spaceScores, spaceModeFilter, spaceLanguageFilter, searchQuery]);

  // Har bir uchuvchiga aniq global o'rin (rank) berish
  const rankedSpaceList = useMemo(() => {
    return filteredSpaceList.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [filteredSpaceList]);

  const spaceTotalCount = rankedSpaceList.length;
  const spaceTotalPages = Math.max(1, Math.ceil(spaceTotalCount / pageSize));

  const spacePageItems = useMemo(() => {
    if (currentPage === 1 && !searchQuery.trim() && rankedSpaceList.length > 3) {
      return rankedSpaceList.slice(3, 3 + pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return rankedSpaceList.slice(start, start + pageSize);
  }, [rankedSpaceList, currentPage, pageSize, searchQuery]);

  const mySpaceRankingInfo = useMemo(() => {
    if (!currentUser?.uid) return null;
    const idx = rankedSpaceList.findIndex((s) => s.uid === currentUser.uid);
    if (idx !== -1) {
      return {
        rank: rankedSpaceList[idx].rank,
        item: rankedSpaceList[idx]
      };
    }
    return null;
  }, [currentUser, rankedSpaceList]);

  // =========================================================================
  // PODIUM MAPPINGS
  // =========================================================================
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

  const sentencePodiumUsers: PodiumUser[] = useMemo(() => {
    return filteredSentenceList.slice(0, 3).map((item, idx) => ({
      uid: item.uid,
      displayName: item.playerName || 'O\'quvchi',
      username: item.playerName ? item.playerName.toLowerCase().replace(/\s+/g, '_') : 'user',
      avatarUrl: item.playerAvatar,
      country: '🇺🇿 Uzbekistan',
      displayWpm: item.wpm || 0,
      highestAccuracy: item.accuracy || 100,
      modeLabel: item.ieltsBand || `Lv.${item.userLevel || 1}`,
      rank: idx + 1,
      isVerified: true,
      scoreLabel: 'Ball',
      scoreValue: item.score?.toLocaleString() || '0',
      subStatLabel: 'Jumlalar',
      subStatValue: `${item.sentencesCompleted || 0} ta`
    }));
  }, [filteredSentenceList]);

  const spacePodiumUsers: PodiumUser[] = useMemo(() => {
    return filteredSpaceList.slice(0, 3).map((item, idx) => ({
      uid: item.uid,
      displayName: item.playerName || 'Kosmik Uchuvchi',
      username: item.playerName ? item.playerName.toLowerCase().replace(/\s+/g, '_') : 'pilot',
      avatarUrl: item.playerAvatar,
      country: item.language === 'en' ? '🇬🇧 English' : '🇺🇿 O\'zbekcha',
      displayWpm: item.wpm || 0,
      highestAccuracy: item.accuracy || 100,
      modeLabel: `Wave ${item.wave || 1}`,
      rank: idx + 1,
      isVerified: true,
      scoreLabel: 'Kosmik Ball',
      scoreValue: item.score?.toLocaleString() || '0',
      subStatLabel: 'Dushmanlar',
      subStatValue: `${item.enemiesKilled || 0} ta`
    }));
  }, [filteredSpaceList]);

  // Jump to user's rows
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

  const handleJumpToMySentenceRank = () => {
    if (!mySentenceRankingInfo) return;
    const targetPage = Math.floor((mySentenceRankingInfo.rank - 1) / pageSize) + 1;
    setCurrentPage(targetPage);
    setSearchQuery('');
    setTimeout(() => {
      const el = document.getElementById(`sentence-rank-row-${currentUser?.uid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

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

  // Open profile modal
  const openUserProfile = (u: LeaderboardUser | any) => {
    const profile: UserProfile = {
      uid: u.uid || 'user',
      email: '',
      username: u.username || 'user',
      displayName: u.displayName || u.playerName || u.username || 'Foydalanuvchi',
      avatarUrl: u.avatarUrl || u.playerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.uid || 'pilot'}`,
      country: u.country || '🇺🇿 Uzbekistan',
      highestWpm: u.highestWpm || u.displayWpm || u.wpm || 0,
      highestAccuracy: u.highestAccuracy || u.accuracy || 100,
      averageWpm: u.highestWpm || u.displayWpm || u.wpm || 0,
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

  // Header Title generation for typing
  const getTypingHeaderTitle = () => {
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

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-8 font-mono select-none space-y-6">
      {/* ========================================================================= */}
      {/* 3 DISTINCT TOP LEADERBOARD TABS: Tez Yozish / Inglizcha Jumlalar / Koinot Jangi */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Tab 1: Tez Yozish Reytingi */}
          <button
            onClick={() => {
              setDomain('typing');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              domain === 'typing'
                ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⌨️ Tez Yozish Reytingi</span>
          </button>

          {/* Tab 2: Inglizcha Jumlalar Reytingi */}
          <button
            onClick={() => {
              setDomain('sentences');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              domain === 'sentences'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-[var(--sub-color)] hover:text-emerald-400 hover:bg-[var(--sub-alt)]/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>🎓 Inglizcha Jumlalar Reytingi</span>
          </button>

          {/* Tab 3: Koinot Jangi Reytingi */}
          <button
            onClick={() => {
              setDomain('space');
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              domain === 'space'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-[var(--sub-color)] hover:text-cyan-400 hover:bg-[var(--sub-alt)]/50'
            }`}
          >
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span>🚀 Koinot Jangi Reytingi</span>
          </button>
        </div>

        {/* Quick Action Buttons according to active domain */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {domain === 'typing' && onGoToTyping && (
            <button
              onClick={onGoToTyping}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--sub-alt)] hover:bg-[var(--main-color)] hover:text-[var(--bg-color)] text-[var(--text-color)] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tez Yozish Sinovi</span>
            </button>
          )}

          {domain === 'sentences' && onGoToSentences && (
            <button
              onClick={onGoToSentences}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Jumlalarni Mashq Qilish</span>
            </button>
          )}

          {domain === 'space' && onGoToSpace && (
            <button
              onClick={onGoToSpace}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Koinot Jangi O&apos;ynash</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC SUMMARY STATS STRIP                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {domain === 'typing' && (
          <>
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
                <div className="text-[11px] text-[var(--sub-color)] font-sans">O&apos;rtacha Aniqlik</div>
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
          </>
        )}

        {domain === 'sentences' && (
          <>
            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-emerald-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Eng Yuqori Ball</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {sentenceStats.topScore.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-emerald-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Yozilgan Jumlalar</div>
                <div className="text-lg font-black text-[var(--text-color)] font-mono">
                  {sentenceStats.totalSentences.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-emerald-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Rekord Combo</div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  x{sentenceStats.maxCombo}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-emerald-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">O&apos;rganuvchilar</div>
                <div className="text-lg font-black text-[var(--text-color)] font-mono">
                  {sentenceStats.totalPlayers} ta
                </div>
              </div>
            </div>
          </>
        )}

        {domain === 'space' && (
          <>
            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-cyan-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Galaktika Rekordi</div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {spaceStats.topScore > 0 ? spaceStats.topScore.toLocaleString() : '—'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-cyan-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Maksimal To&apos;lqin</div>
                <div className="text-lg font-black text-[var(--text-color)] font-mono">
                  {spaceStats.maxWave > 0 ? `Wave ${spaceStats.maxWave}` : '—'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-cyan-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Mag&apos;lub Dushmanlar</div>
                <div className="text-lg font-black text-rose-400 font-mono">
                  {spaceStats.totalEnemies > 0 ? `${spaceStats.totalEnemies.toLocaleString()} ta` : '—'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/80 border border-cyan-500/30 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--sub-color)] font-sans">Kosmik Uchuvchilar</div>
                <div className="text-lg font-black text-[var(--text-color)] font-mono">
                  {spaceStats.totalPilots} ta
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* USER RANK BANNER (FOR LOGGED IN USERS)                                    */}
      {/* ========================================================================= */}
      {domain === 'sentences' && mySentenceRankingInfo && (
        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/40 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
              #{mySentenceRankingInfo.rank}
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <span>Sizning Jumlalar bo&apos;yicha o&apos;rningiz: #{mySentenceRankingInfo.rank}</span>
                <span className="text-amber-400 font-extrabold">({mySentenceRankingInfo.item.score.toLocaleString()} ball)</span>
              </div>
              <p className="text-xs text-[var(--sub-color)]">
                {mySentenceRankingInfo.item.sentencesCompleted} ta jumla • {mySentenceRankingInfo.item.wpm} WPM • {mySentenceRankingInfo.item.accuracy}% aniqlik • Max Combo: x{mySentenceRankingInfo.item.maxCombo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToMySentenceRank}
              className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Qatorim</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            {onGoToSentences && (
              <button
                onClick={onGoToSentences}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                <span>Mashq qilish</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>
      )}

      {domain === 'space' && mySpaceRankingInfo && (
        <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/40 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
              #{mySpaceRankingInfo.rank}
            </div>
            <div>
              <div className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <span>Sizning Koinot Jangidagi o&apos;rningiz: #{mySpaceRankingInfo.rank}</span>
                <span className="text-amber-400 font-extrabold">({mySpaceRankingInfo.item.score.toLocaleString()} ball)</span>
              </div>
              <p className="text-xs text-[var(--sub-color)]">
                Wave {mySpaceRankingInfo.item.wave} • {mySpaceRankingInfo.item.wpm} WPM • {mySpaceRankingInfo.item.accuracy}% aniqlik • {mySpaceRankingInfo.item.enemiesKilled} ta dushman
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
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                <span>Jangni boshlash</span>
                <Rocket className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {domain === 'typing' && myRankingInfo && (
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

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN RESPONSIVE LAYOUT (Sidebar + Main Content Table)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* SIDEBAR FOR TYPING */}
          {domain === 'typing' && (
            <>
              <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-2.5 space-y-1 shadow-sm">
                <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
                  REJLAR VA TOIFALAR
                </div>

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
              </div>

              {/* Time Filter */}
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
            </>
          )}

          {/* SIDEBAR FOR SENTENCES */}
          {domain === 'sentences' && (
            <>
              <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
                <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
                    JUMLA TOIFALARI
                  </span>
                  <button
                    onClick={fetchSentenceLeaderboard}
                    disabled={sentenceLoading}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Reytingni yangilash"
                  >
                    <RotateCcw className={`w-3 h-3 ${sentenceLoading ? 'animate-spin' : ''}`} />
                    <span>Yangilash</span>
                  </button>
                </div>

                {[
                  { id: 'all', label: 'Barcha to\'plam' },
                  { id: 'daily', label: '🗣 Kundalik suhbat' },
                  { id: 'business', label: '💼 Biznes va Ish' },
                  { id: 'tech', label: '💻 IT va Dasturlash' },
                  { id: 'ielts', label: '📚 IELTS & Akademik' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSentenceCategoryFilter(cat.id as SentenceCategoryFilter);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                      sentenceCategoryFilter === cat.id
                        ? 'bg-emerald-500 text-white font-bold shadow-sm'
                        : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="tracking-wide">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Sentences Info Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-teal-950/20 to-transparent border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>Jumlalar O&apos;rganish</span>
                </div>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Har bir to&apos;g&apos;ri jumla uchun ball to&apos;plang. Xatosiz ketma-ket kombolar orqali IELTS va daraja unvonlarini qo&apos;lga kiriting!
                </p>
                {onGoToSentences && (
                  <button
                    onClick={onGoToSentences}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mashqni boshlash</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* SIDEBAR FOR SPACE BATTLE */}
          {domain === 'space' && (
            <>
              {/* Leaderboard View Mode: 1 best per player vs All attempts */}
              <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
                <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
                    REYTING TURI
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    {spaceModeFilter === 'unique' ? '1 ta / ishtirokchi' : 'barchasi'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSpaceModeFilter('unique');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                    spaceModeFilter === 'unique'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span>Eng yuqori natijalar</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono font-bold">
                    Faqat 1 ta
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSpaceModeFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                    spaceModeFilter === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Barcha urinishlar</span>
                  </span>
                </button>
              </div>

              <div className="bg-[var(--card-bg)]/80 border border-[var(--sub-alt)] rounded-2xl p-3 space-y-1 shadow-sm">
                <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sub-color)]">
                    TIL BO&apos;YICHA FILTR
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

                {[
                  { key: 'all', label: 'Barcha tillar', icon: '🌐' },
                  { key: 'uz', label: "O'zbekcha so'zlar", icon: '🇺🇿' },
                  { key: 'en', label: 'Inglizcha so\'zlar', icon: '🇬🇧' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSpaceLanguageFilter(item.key as SpaceLanguageFilter);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      spaceLanguageFilter === item.key
                        ? 'bg-cyan-500 text-white font-bold shadow-sm'
                        : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {spaceLanguageFilter === item.key && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Space Shooter Info Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-blue-950/20 to-transparent border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Rocket className="w-4 h-4" />
                  <span>Koinot Jangi</span>
                </div>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Lazer zarbasi berish uchun dushman kemalaridagi so&apos;zlarni xatosiz tering. Har bir yangi to&apos;lqin (Wave) dushmanlar tezligini oshiradi!
                </p>
                {onGoToSpace && (
                  <button
                    onClick={onGoToSpace}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Jangni boshlash</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-[var(--sub-color)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Ism yoki taxallus qidirish..."
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
        </div>

        {/* Right Main Table (8 Cols on desktop / 9 on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* ======================================================== */}
          {/* 1. TYPING LEADERBOARD                                    */}
          {/* ======================================================== */}
          {domain === 'typing' && (
            <>
              {/* Podium */}
              {currentPage === 1 && !searchQuery.trim() && sortedList.length > 0 && (
                <LeaderboardPodium
                  topUsers={typingPodiumUsers}
                  onSelectUser={openUserProfile}
                  currentUserId={currentUser?.uid}
                />
              )}

              {/* Header Title & Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[var(--main-color)]" />
                    <span>{getTypingHeaderTitle()}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
                    Haqiqiy foydalanuvchilarning jonli natijalari • Jami {totalCount} ta ishtirokchi
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-sm text-[var(--sub-color)]">
                  <button
                    onClick={() => fetchTypingUsers(true)}
                    disabled={loading}
                    className="text-xs text-[var(--main-color)] hover:brightness-110 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Reytingni yangilash"
                  >
                    <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Yangilash</span>
                  </button>

                  <div className="h-4 w-px bg-[var(--sub-alt)]" />

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

              {/* Table */}
              <div className="w-full overflow-x-auto pb-4 overscroll-x-contain touch-pan-y">
                <table className="w-full text-left text-sm font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-color)]">
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
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                                  alt="avatar"
                                  className="w-7 h-7 rounded-full object-cover shrink-0 bg-[var(--sub-alt)] border border-[var(--sub-alt)]"
                                  referrerPolicy="no-referrer"
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
                            <td className="py-3.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--sub-alt)]/60 text-[var(--main-color)] font-mono text-xs font-semibold border border-[var(--sub-alt)]/80">
                                <Clock className="w-3 h-3 text-[var(--main-color)] shrink-0" />
                                <span>{item.modeLabel}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-base text-[var(--main-color)] tracking-tight">
                              {item.displayWpm}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] font-medium text-xs sm:text-sm">
                              {item.highestAccuracy > 0 ? `${Number(item.highestAccuracy).toFixed(2)}%` : '0.00%'}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs sm:text-sm hidden md:table-cell">
                              {item.rawWpmCalc}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--sub-color)] text-xs sm:text-sm hidden lg:table-cell">
                              {item.consistencyCalc}
                            </td>
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

          {/* ======================================================== */}
          {/* 2. SENTENCES LEADERBOARD                                 */}
          {/* ======================================================== */}
          {domain === 'sentences' && (
            <>
              {/* Podium */}
              {currentPage === 1 && !searchQuery.trim() && filteredSentenceList.length > 0 && (
                <LeaderboardPodium
                  topUsers={sentencePodiumUsers}
                  onSelectUser={openUserProfile}
                  currentUserId={currentUser?.uid}
                />
              )}

              {/* Header Title & Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>🎓 Inglizcha Jumlalar Chempionlar Reytingi</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
                    Jumlalar trenajyorining haqiqiy rekordlari • Jami {sentenceTotalCount} ta o&apos;quvchi
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-sm text-[var(--sub-color)]">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Oldingi sahifa"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-sm text-emerald-400 font-semibold px-1">
                    # {currentPage} / {sentenceTotalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(sentenceTotalPages, p + 1))}
                    disabled={currentPage === sentenceTotalPages}
                    className="p-1 rounded hover:text-[var(--text-color)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Keyingi sahifa"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sentences Table */}
              <div className="w-full overflow-x-auto pb-4 overscroll-x-contain touch-pan-y">
                <table className="w-full text-left text-sm font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-color)]">
                    <tr className="text-[var(--sub-color)] border-b border-[var(--sub-alt)]/60 text-xs">
                      <th className="pb-3.5 px-2.5 sm:px-3 w-10 sm:w-12 font-medium">#</th>
                      <th className="pb-3.5 px-3 sm:px-4 font-medium">O&apos;quvchi</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-center font-bold text-emerald-400">Daraja / IELTS</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-bold text-emerald-400">Ball</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-center font-medium">Toifa</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium">Jumlalar</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium">WPM</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium">Aniqlik</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium text-amber-400">Max Combo</th>
                      <th className="pb-3.5 px-3 sm:px-4 text-right font-medium text-[var(--sub-color)]">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sub-alt)]/20">
                    {sentencePageItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-[var(--sub-color)]">
                          <div className="max-w-md mx-auto flex flex-col items-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-xs">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-base text-[var(--text-color)]">
                              Hozircha natijalar mavjud emas
                            </p>
                            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                              Inglizcha jumlalar bo&apos;limida birinchi bo&apos;lib mashq qiling va o&apos;z rekordingizni o&apos;rnating!
                            </p>
                            {onGoToSentences && (
                              <button
                                onClick={onGoToSentences}
                                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                              >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Jumlalar Mashqini Boshlash</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sentencePageItems.map((item, idx) => {
                        const globalRank = (item as any).rank || ((currentPage - 1) * pageSize + (idx + 1));
                        const isSelf = currentUser?.uid === item.uid;

                        return (
                          <tr
                            key={item.id || `${item.uid}_${idx}`}
                            id={`sentence-rank-row-${item.uid}`}
                            className={`transition-colors hover:bg-[var(--sub-alt)]/30 group ${
                              isSelf ? 'bg-emerald-500/10 font-bold border-l-2 border-emerald-400' : ''
                            }`}
                          >
                            <td className="py-3.5 px-3 text-[var(--sub-color)] font-medium text-xs font-mono">
                              {globalRank === 1 ? (
                                <span className="text-amber-400 font-bold">🥇 1</span>
                              ) : globalRank === 2 ? (
                                <span className="text-slate-300 font-bold">🥈 2</span>
                              ) : globalRank === 3 ? (
                                <span className="text-amber-600 font-bold">🥉 3</span>
                              ) : (
                                <span>#{globalRank}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[var(--text-color)] text-xs">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.playerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                                  alt=""
                                  className="w-7 h-7 rounded-full bg-[var(--sub-alt)] object-cover border border-emerald-500/30 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                                  {item.playerName || 'O\'quvchi'}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                    Siz
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                                {item.ieltsBand || `Lv.${item.userLevel || 1}`}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                              {item.score?.toLocaleString() || 0}
                            </td>
                            <td className="py-3.5 px-4 text-center text-xs text-[var(--sub-color)] capitalize">
                              {item.category === 'daily'
                                ? 'Kundalik'
                                : item.category === 'business'
                                ? 'Biznes'
                                : item.category === 'tech'
                                ? 'IT'
                                : item.category === 'ielts'
                                ? 'IELTS'
                                : 'Aralash'}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] text-xs">
                              {item.sentencesCompleted} ta
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] text-xs">
                              {item.wpm}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] text-xs">
                              {item.accuracy}%
                            </td>
                            <td className="py-3.5 px-4 text-right text-amber-400 font-mono text-xs">
                              🔥 x{item.maxCombo}
                            </td>
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
          )}

          {/* ======================================================== */}
          {/* 3. SPACE BATTLE LEADERBOARD                              */}
          {/* ======================================================== */}
          {domain === 'space' && (
            <>
              {/* Podium */}
              {currentPage === 1 && !searchQuery.trim() && filteredSpaceList.length > 0 && (
                <LeaderboardPodium
                  topUsers={spacePodiumUsers}
                  onSelectUser={openUserProfile}
                  currentUserId={currentUser?.uid}
                />
              )}

              {/* Header Title & Pagination */}
              <div className="flex flex-col gap-3 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-cyan-400" />
                      <span>🚀 Koinot Jangi (Space Typing Shooter) Chempionlar Reytingi</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
                      Kosmik jang merganlarining haqiqiy natijalari • Jami {spaceTotalCount} ta {spaceModeFilter === 'unique' ? 'ishtirokchi rekordi' : 'urinish'}
                    </p>
                  </div>

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

                {/* Quick Toggle: Best record per player vs All attempts */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--sub-alt)]/30">
                  <div className="inline-flex p-1 rounded-xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] text-xs font-medium">
                    <button
                      onClick={() => {
                        setSpaceModeFilter('unique');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        spaceModeFilter === 'unique'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Shaxsiy eng yuqori rekordlar (1 ta / o&apos;yinchi)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSpaceModeFilter('all');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        spaceModeFilter === 'all'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Barcha o&apos;yinlar tarixi</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-[var(--sub-color)] font-mono">
                    {spaceModeFilter === 'unique'
                      ? '✓ Har bir o\'yinchining faqat eng yaxshi rekordi'
                      : '✓ O\'yinchilarning barcha urinishlari'}
                  </span>
                </div>
              </div>

              {/* Space Table */}
              <div className="w-full overflow-x-auto pb-4 overscroll-x-contain touch-pan-y">
                <table className="w-full text-left text-sm font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-color)]">
                    <tr className="text-[var(--sub-color)] border-b border-[var(--sub-alt)]/60 text-xs">
                      <th className="pb-3.5 px-3 w-12 font-medium">#</th>
                      <th className="pb-3.5 px-4 font-medium">Uchuvchi</th>
                      <th className="pb-3.5 px-4 text-right font-bold text-cyan-400">Kosmik Ball</th>
                      <th className="pb-3.5 px-4 text-center font-medium">To&apos;lqin</th>
                      <th className="pb-3.5 px-3 text-center font-medium">Til</th>
                      <th className="pb-3.5 px-4 text-right font-medium">WPM</th>
                      <th className="pb-3.5 px-4 text-right font-medium">Aniqlik</th>
                      <th className="pb-3.5 px-4 text-right font-medium">Dushmanlar</th>
                      <th className="pb-3.5 px-4 text-right font-medium">Max Streak</th>
                      <th className="pb-3.5 px-4 text-right font-medium">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sub-alt)]/20">
                    {spacePageItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-[var(--sub-color)]">
                          <div className="max-w-md mx-auto flex flex-col items-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shadow-xs">
                              <Rocket className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-base text-[var(--text-color)]">
                              Hozircha natijalar mavjud emas
                            </p>
                            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                              Hozircha Koinot Jangida natijalar yo&apos;q. Birinchi bo&apos;lib kosmik jangni boshlang va o&apos;z rekordingizni o&apos;rnating!
                            </p>
                            {onGoToSpace && (
                              <button
                                onClick={onGoToSpace}
                                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 active:scale-95"
                              >
                                <Rocket className="w-4 h-4" />
                                <span>Koinot Jangini Boshlash 🚀</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      spacePageItems.map((item, idx) => {
                        const globalRank = (item as any).rank || ((currentPage - 1) * pageSize + (idx + 1));
                        const isSelf = currentUser?.uid === item.uid;

                        return (
                          <tr
                            key={item.id || `${item.uid}_${idx}`}
                            id={`space-rank-row-${item.uid}`}
                            className={`transition-colors hover:bg-[var(--sub-alt)]/30 group ${
                              isSelf ? 'bg-cyan-500/10 font-bold border-l-2 border-cyan-400' : ''
                            }`}
                          >
                            <td className="py-3.5 px-3 text-[var(--sub-color)] font-medium text-xs font-mono">
                              {globalRank === 1 ? (
                                <span className="text-amber-400 font-bold">🥇 1</span>
                              ) : globalRank === 2 ? (
                                <span className="text-slate-300 font-bold">🥈 2</span>
                              ) : globalRank === 3 ? (
                                <span className="text-amber-600 font-bold">🥉 3</span>
                              ) : (
                                <span>#{globalRank}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[var(--text-color)] text-xs">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.playerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid || 'pilot'}`}
                                  alt=""
                                  className="w-7 h-7 rounded-full bg-[var(--sub-alt)] object-cover border border-cyan-500/30 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                                  {item.playerName || 'Kosmik Uchuvchi'}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                                    Siz
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-cyan-400 text-sm">
                              {item.score?.toLocaleString() || 0}
                            </td>
                            <td className="py-3.5 px-4 text-center text-xs font-mono font-bold text-blue-300">
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                                Wave {item.wave || 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center text-xs">
                              {item.language === 'en' ? '🇬🇧 EN' : '🇺🇿 UZ'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-[var(--text-color)] text-xs">
                              {item.wpm || 0}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-color)] text-xs">
                              {item.accuracy || 100}%
                            </td>
                            <td className="py-3.5 px-4 text-right text-rose-400 font-semibold text-xs">
                              {item.enemiesKilled || 0} ta
                            </td>
                            <td className="py-3.5 px-4 text-right text-amber-400 font-mono text-xs">
                              🔥 {item.maxStreak || 0}
                            </td>
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
                        ? domain === 'sentences'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : domain === 'space'
                          ? 'bg-cyan-500 text-white shadow-xs'
                          : 'bg-[var(--main-color)] text-white shadow-xs'
                        : 'bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="hidden sm:inline text-[var(--sub-color)]/60 text-[11px]">
                • Jami {domain === 'sentences' ? sentenceTotalCount : domain === 'space' ? spaceTotalCount : totalCount} ta natija
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

              <span
                className={`font-mono text-sm font-semibold px-1 ${
                  domain === 'sentences'
                    ? 'text-emerald-400'
                    : domain === 'space'
                    ? 'text-cyan-400'
                    : 'text-[var(--main-color)]'
                }`}
              >
                # {currentPage} / {domain === 'sentences' ? sentenceTotalPages : domain === 'space' ? spaceTotalPages : totalPages}
              </span>

              <button
                onClick={() => {
                  const maxP = domain === 'sentences' ? sentenceTotalPages : domain === 'space' ? spaceTotalPages : totalPages;
                  setCurrentPage((p) => Math.min(maxP, p + 1));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                disabled={
                  currentPage ===
                  (domain === 'sentences'
                    ? sentenceTotalPages
                    : domain === 'space'
                    ? spaceTotalPages
                    : totalPages)
                }
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

      {/* User Profile Modal on Click */}
      <PublicProfileModal
        userProfile={selectedProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
