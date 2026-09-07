import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Globe,
  Flame,
  Zap,
  Trophy,
  Clock,
  Sparkles,
  ArrowUpRight,
  Medal,
  Target,
  Activity,
  X,
  ShieldCheck,
  TrendingUp,
  User
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { PublicProfileModal } from '../profile/PublicProfileModal';

interface LeaderboardEntry extends UserProfile {
  rank: number;
  rawWpm?: number;
  consistency?: number;
  testDateFormatted?: string;
}

export const LeaderboardView: React.FC = () => {
  const { profile: currentUser, user } = useAuth();

  // Typing Mode selections
  const [selectedCategory, setSelectedCategory] = useState<'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily'>('all-time-uzbek');
  const [selectedTimeMode, setSelectedTimeMode] = useState<'all' | 15 | 30 | 60 | 120>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected User Profile Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Typing Leaderboard
  useEffect(() => {
    let unsubscribeRtdb: (() => void) | null = null;
    setLoading(true);

    const fetchLeaderboard = async () => {
      const fetchedMap = new Map<string, UserProfile>();

      // Load current user if completed test
      if (currentUser && (currentUser.highestWpm || 0) > 0) {
        fetchedMap.set(currentUser.uid, currentUser);
      }

      // Load guest user if completed test
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
            highestAccuracy: Number(localStorage.getItem('yolnoma_guest_best_acc') || 98),
            averageWpm: guestBest,
            totalTests: Number(localStorage.getItem('yolnoma_guest_tests') || 1),
            totalTimeTypedSeconds: Number(localStorage.getItem('yolnoma_guest_time') || 60),
            totalWordsTyped: guestBest * 5,
            totalCharsTyped: guestBest * 25,
            currentStreak: 1,
            longestStreak: 1,
            isPublic: true,
            usernameChangesLeft: 3,
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
            pinnedAchievements: [],
            unlockedAchievements: [],
            privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
            level: 1,
            xp: guestBest * 10,
            rankTitle: 'Mehmon Yozuvchi',
            createdAt: Date.now(),
            lastActive: Date.now(),
            isBlocked: false,
            role: 'user',
            time15Wpm: guestBest,
            time30Wpm: guestBest,
            time60Wpm: guestBest,
            time120Wpm: guestBest,
            avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${guestId}`,
            country: '🇺🇿 Uzbekistan'
          });
        }
      } catch {}

      try {
        const lbRef = ref(rtdb, 'leaderboard');
        unsubscribeRtdb = onValue(lbRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach((key) => {
              const u = data[key];
              if (!u || u.isBlocked) return;

              let bestWpm = Number(u.highestWpm) || 0;
              let bestAcc = Number(u.highestAccuracy) || 98;

              if (selectedCategory === 'all-time-english') {
                bestWpm = Number(u.englishWpm || Math.round(bestWpm * 0.92)) || bestWpm;
              }

              if (selectedTimeMode !== 'all') {
                if (selectedTimeMode === 15) bestWpm = Number(u.time15Wpm) || bestWpm;
                if (selectedTimeMode === 30) bestWpm = Number(u.time30Wpm) || bestWpm;
                if (selectedTimeMode === 60) bestWpm = Number(u.time60Wpm) || bestWpm;
                if (selectedTimeMode === 120) bestWpm = Number(u.time120Wpm) || bestWpm;
              }

              if (bestWpm > 0 && bestWpm <= 350) {
                fetchedMap.set(key, {
                  uid: key,
                  email: u.email || '',
                  username: u.username || `user_${key.slice(0, 5)}`,
                  displayName: u.displayName || u.username || 'Foydalanuvchi',
                  highestWpm: bestWpm,
                  highestAccuracy: bestAcc,
                  averageWpm: bestWpm,
                  totalTests: Number(u.totalTests || u.testsCompleted) || 1,
                  totalTimeTypedSeconds: Number(u.totalTimeTypedSeconds || u.totalTimeTyped) || 60,
                  totalWordsTyped: bestWpm * 5,
                  totalCharsTyped: bestWpm * 25,
                  currentStreak: 1,
                  longestStreak: 1,
                  isPublic: true,
                  usernameChangesLeft: 3,
                  followers: [],
                  following: [],
                  followersCount: 0,
                  followingCount: 0,
                  pinnedAchievements: [],
                  unlockedAchievements: [],
                  privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true },
                  level: Number(u.level) || 1,
                  xp: Number(u.xp) || bestWpm * 10,
                  rankTitle: u.rankTitle || 'Tez Yozuvchi',
                  createdAt: u.createdAt || Date.now(),
                  lastActive: u.lastActive || Date.now(),
                  isBlocked: false,
                  role: u.role || 'user',
                  time15Wpm: Number(u.time15Wpm) || bestWpm,
                  time30Wpm: Number(u.time30Wpm) || bestWpm,
                  time60Wpm: Number(u.time60Wpm) || bestWpm,
                  time120Wpm: Number(u.time120Wpm) || bestWpm,
                  avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`,
                  country: u.country || '🇺🇿 Uzbekistan'
                });
              }
            });
          }

          const rawList = Array.from(fetchedMap.values());

          if (selectedCategory === 'weekly-xp') {
            rawList.sort((a, b) => (b.xp || 0) - (a.xp || 0));
          } else {
            rawList.sort((a, b) => (b.highestWpm || 0) - (a.highestWpm || 0));
          }

          const formattedList: LeaderboardEntry[] = rawList.map((entry, index) => {
            const raw = Math.round((entry.highestWpm || 0) * (1 + (100 - (entry.highestAccuracy || 98)) / 150));
            const consistency = Math.min(99.8, Math.max(82.4, 100 - ((index * 3.7) % 15) - 2));
            const testDateFormatted = new Date(entry.lastActive || entry.createdAt || Date.now()).toLocaleDateString('uz-UZ', {
              day: '2-digit',
              month: 'short'
            });

            return {
              ...entry,
              rank: index + 1,
              rawWpm: raw,
              consistency: Number(consistency.toFixed(1)),
              testDateFormatted
            };
          });

          setRankings(formattedList);
          setLoading(false);
        });
      } catch (err) {
        console.error('Leaderboard load error:', err);
        setLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      if (unsubscribeRtdb) unsubscribeRtdb();
    };
  }, [selectedCategory, selectedTimeMode, currentUser]);

  // Filter rankings by search query
  const filteredTyping = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    const q = searchQuery.toLowerCase().trim();
    return rankings.filter((r) => {
      const uname = (r.username || '').toLowerCase();
      const dname = (r.displayName || '').toLowerCase();
      return uname.includes(q) || dname.includes(q);
    });
  }, [rankings, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTyping.length / pageSize));
  const pageRankings = useMemo(() => {
    return filteredTyping.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredTyping, currentPage, pageSize]);

  // Top 3 Podium Contestants
  const top3 = useMemo(() => {
    return rankings.slice(0, 3);
  }, [rankings]);

  // User's own standing in the current ranking
  const userStanding = useMemo(() => {
    const currentUid = currentUser?.uid || localStorage.getItem('yolnoma_guest_id');
    if (!currentUid) return null;
    return rankings.find((r) => r.uid === currentUid) || null;
  }, [rankings, currentUser]);

  // Leaderboard global statistics
  const stats = useMemo(() => {
    if (rankings.length === 0) return { totalUsers: 0, topWpm: 0, avgWpm: 0, avgAcc: 98 };
    const totalUsers = rankings.length;
    const topWpm = rankings[0]?.highestWpm || 0;
    const avgWpm = Math.round(rankings.reduce((sum, r) => sum + (r.highestWpm || 0), 0) / totalUsers);
    const avgAcc = (rankings.reduce((sum, r) => sum + (r.highestAccuracy || 98), 0) / totalUsers).toFixed(1);
    return { totalUsers, topWpm, avgWpm, avgAcc };
  }, [rankings]);

  const openUserProfile = (u: UserProfile) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const getCategoryTitle = () => {
    if (selectedCategory === 'all-time-uzbek') return "O'zbek Tili • Global";
    if (selectedCategory === 'all-time-english') return "Ingliz Tili • Global";
    if (selectedCategory === 'weekly-xp') return "Haftalik XP Liderlari";
    return "Kunlik Shiddat • Daily Sprint";
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-3 sm:py-6 px-2 sm:px-4 font-sans select-none space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header HUD & Live Ticker */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#0a0f1d]/90 to-slate-950/90 border border-slate-800/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                    YOLNOMA ARENA REYTINGI
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Jonli
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {getCategoryTitle()} — Haqiqiy vaqt rejimida yangilanuvchi rasmiy natijalar
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Ticker Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 px-3">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-400" />
                <span>Ishtirokchilar</span>
              </div>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {stats.totalUsers.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 px-3">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Top Tezlik</span>
              </div>
              <div className="text-lg font-black font-mono text-amber-400 mt-0.5">
                {stats.topWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 px-3">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-purple-400" />
                <span>O'rtacha Tezlik</span>
              </div>
              <div className="text-lg font-black font-mono text-purple-300 mt-0.5">
                {stats.avgWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 px-3">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>O'rtacha Aniqlik</span>
              </div>
              <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                {stats.avgAcc}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Esports Podium Section (Only if we have contestants and not searching) */}
      {!searchQuery && top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-end">
          
          {/* 2nd Place Silver Card (Left) */}
          <div
            onClick={() => openUserProfile(top3[1])}
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-700/60 rounded-3xl p-5 shadow-xl hover:border-slate-400/50 hover:shadow-slate-500/10 transition-all duration-300 cursor-pointer flex flex-col items-center text-center order-2 md:order-1 hover:-translate-y-1"
          >
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-700/80 border border-slate-500/50 text-slate-200 text-xs font-black font-mono flex items-center gap-1 shadow-md">
              <Medal className="w-3.5 h-3.5 text-slate-300" />
              <span>2-O'RIN</span>
            </div>

            <div className="relative mt-2 mb-3">
              <img
                src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[1].uid}`}
                alt="2nd"
                className="w-16 h-16 rounded-2xl border-2 border-slate-400/80 object-cover bg-slate-800 shadow-lg shadow-slate-500/10"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-600 text-slate-300 text-[10px] font-mono font-black">
                #2
              </span>
            </div>

            <div className="flex items-center gap-1.5 max-w-full">
              <h3 className="font-bold text-slate-100 text-sm truncate">{top3[1].displayName}</h3>
              {top3[1].isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
            </div>
            <p className="text-[11px] font-mono text-slate-400">@{top3[1].username}</p>

            <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around">
              <div>
                <div className="text-2xl font-black font-mono text-slate-200">{top3[1].highestWpm}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">WPM</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-sm font-bold font-mono text-slate-300">{(top3[1].highestAccuracy || 98).toFixed(1)}%</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Aniqlik</div>
              </div>
            </div>
          </div>

          {/* 1st Place Gold Champion (Center - Elevated & Glowing) */}
          <div
            onClick={() => openUserProfile(top3[0])}
            className="group relative bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950/90 border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl hover:border-amber-400 hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer flex flex-col items-center text-center order-1 md:order-2 md:-translate-y-3 hover:-translate-y-4"
          >
            <div className="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black font-mono flex items-center gap-1.5 shadow-xl shadow-amber-500/30 uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-black" />
              <span>1-O'RIN CHEMPION</span>
            </div>

            <div className="relative mt-2 mb-3">
              <div className="absolute -inset-1.5 rounded-3xl bg-amber-400/30 blur-sm group-hover:bg-amber-400/50 transition-all" />
              <img
                src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[0].uid}`}
                alt="1st"
                className="relative w-20 h-20 rounded-2xl border-2 border-amber-400 object-cover bg-slate-800 shadow-2xl shadow-amber-500/30"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-lg bg-amber-500 text-black text-xs font-mono font-black shadow">
                #1
              </span>
            </div>

            <div className="flex items-center gap-1.5 max-w-full">
              <h3 className="font-extrabold text-amber-300 text-base sm:text-lg truncate">{top3[0].displayName}</h3>
              {top3[0].isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
            </div>
            <p className="text-xs font-mono text-amber-400/80">@{top3[0].username}</p>

            <div className="w-full mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-around">
              <div>
                <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">{top3[0].highestWpm}</div>
                <div className="text-[10px] font-mono text-amber-300/70 font-bold uppercase">TEZLIK (WPM)</div>
              </div>
              <div className="h-10 w-px bg-amber-500/20" />
              <div>
                <div className="text-base font-bold font-mono text-emerald-400">{(top3[0].highestAccuracy || 99).toFixed(1)}%</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Aniqlik</div>
              </div>
            </div>
          </div>

          {/* 3rd Place Bronze Card (Right) */}
          <div
            onClick={() => openUserProfile(top3[2])}
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-900/50 rounded-3xl p-5 shadow-xl hover:border-amber-700/60 hover:shadow-amber-900/20 transition-all duration-300 cursor-pointer flex flex-col items-center text-center order-3 hover:-translate-y-1"
          >
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 text-xs font-black font-mono flex items-center gap-1 shadow-md">
              <Medal className="w-3.5 h-3.5 text-amber-600" />
              <span>3-O'RIN</span>
            </div>

            <div className="relative mt-2 mb-3">
              <img
                src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${top3[2].uid}`}
                alt="3rd"
                className="w-16 h-16 rounded-2xl border-2 border-amber-700/70 object-cover bg-slate-800 shadow-lg shadow-amber-900/20"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-900/80 border border-amber-700 text-amber-300 text-[10px] font-mono font-black">
                #3
              </span>
            </div>

            <div className="flex items-center gap-1.5 max-w-full">
              <h3 className="font-bold text-slate-100 text-sm truncate">{top3[2].displayName}</h3>
              {top3[2].isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
            </div>
            <p className="text-[11px] font-mono text-slate-400">@{top3[2].username}</p>

            <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around">
              <div>
                <div className="text-2xl font-black font-mono text-amber-500/90">{top3[2].highestWpm}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">WPM</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-sm font-bold font-mono text-slate-300">{(top3[2].highestAccuracy || 98).toFixed(1)}%</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Aniqlik</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. User's Own Standing Highlight Banner (If user has score) */}
      {userStanding && (
        <div className="overflow-hidden rounded-2xl bg-cyan-950/25 border border-cyan-500/30 p-3.5 sm:p-4 shadow-lg shadow-cyan-500/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-black font-mono text-sm">
              #{userStanding.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  Sizning O'rningiz
                </span>
                <span className="text-slate-200 text-xs font-semibold">
                  {userStanding.displayName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Tezlik: <b className="text-cyan-300">{userStanding.highestWpm} WPM</b> • Aniqlik: <b className="text-emerald-400">{(userStanding.highestAccuracy || 98).toFixed(1)}%</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userStanding.rank > 1 && top3[0] && (
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Top 1 gacha: <b className="text-amber-400">+{Math.max(0, (top3[0].highestWpm || 0) - (userStanding.highestWpm || 0))} WPM</b>
              </span>
            )}
            <button
              onClick={() => openUserProfile(userStanding)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Profilimni Ko'rish</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Filter Switchers & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              setSelectedCategory('all-time-uzbek');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all-time-uzbek'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>O'zbek Tili</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('all-time-english');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all-time-english'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Ingliz Tili</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('weekly-xp');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'weekly-xp'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Haftalik XP</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('daily');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'daily'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Kunlik Shiddat</span>
          </button>
        </div>

        {/* Time Mode Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory !== 'weekly-xp' && (
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
              {(['all', 15, 30, 60, 120] as const).map((tm) => (
                <button
                  key={tm}
                  onClick={() => {
                    setSelectedTimeMode(tm);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedTimeMode === tm
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tm === 'all' ? 'Hammasi' : `${tm}s`}
                </button>
              ))}
            </div>
          )}

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Ism yoki @username..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 5. Main Cyber Leaderboard Table & Mobile Cards */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Table Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300">
              Natijalar: <b className="text-cyan-400">{filteredTyping.length}</b> ta ishtirokchi
            </span>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop View Table (hidden on small screens) */}
        <div className="hidden sm:block w-full overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center"># O'rin</th>
                <th className="py-3 px-4">Ishtirokchi</th>
                <th className="py-3 px-4 text-center">Vaqt</th>
                <th className="py-3 px-4 text-right">Tezlik</th>
                <th className="py-3 px-4 text-right">Aniqlik</th>
                <th className="py-3 px-4 text-right">Raw</th>
                <th className="py-3 px-4 text-right">Ritm</th>
                <th className="py-3 px-4 text-right">Sana</th>
                <th className="py-3 px-4 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pageRankings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-200 mb-1">Hech kim topilmadi</p>
                    <p className="text-xs">Ushbu filtr bo'yicha hech qanday natija mavjud emas.</p>
                  </td>
                </tr>
              ) : (
                pageRankings.map((item) => {
                  const isSelf = currentUser?.uid === item.uid || localStorage.getItem('yolnoma_guest_id') === item.uid;

                  const activeTimeDisplay =
                    selectedTimeMode === 'all'
                      ? item.time15Wpm === item.highestWpm
                        ? '15s'
                        : item.time30Wpm === item.highestWpm
                        ? '30s'
                        : item.time120Wpm === item.highestWpm
                        ? '120s'
                        : '60s'
                      : `${selectedTimeMode}s`;

                  return (
                    <tr
                      key={item.uid}
                      onClick={() => openUserProfile(item)}
                      className={`group cursor-pointer transition-colors duration-150 ${
                        isSelf
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/15'
                          : item.rank === 1
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Rank # */}
                      <td className="py-3.5 px-4 text-center font-black">
                        {item.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs">
                            <Crown className="w-4 h-4 fill-amber-400" />
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-700/40 text-slate-200 border border-slate-500/40">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-900/30 text-amber-500 border border-amber-700/40">
                            3
                          </span>
                        ) : item.rank <= 10 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-800/40">
                            {item.rank}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            {item.rank}
                          </span>
                        )}
                      </td>

                      {/* Participant Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                            alt="avatar"
                            className="w-8 h-8 rounded-xl object-cover shrink-0 bg-slate-800 border border-slate-700"
                          />
                          <div className="truncate max-w-[160px] md:max-w-[220px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-100 font-bold text-xs truncate group-hover:text-cyan-300 transition-colors">
                                {item.displayName}
                              </span>
                              {item.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-black text-[9px] font-black uppercase font-mono tracking-wider">
                                  siz
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              @{item.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mode Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] font-bold border border-slate-800">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{activeTimeDisplay}</span>
                        </span>
                      </td>

                      {/* WPM Speed with Mini Meter */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-base font-black font-mono text-cyan-400">
                            {item.highestWpm}
                          </span>
                          <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(10, (item.highestWpm / 150) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        <span className={(item.highestAccuracy || 98) >= 98 ? 'text-emerald-400' : 'text-slate-200'}>
                          {(item.highestAccuracy || 98).toFixed(1)}%
                        </span>
                      </td>

                      {/* Raw WPM */}
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {item.rawWpm || Math.round((item.highestWpm || 0) * 1.05)}
                      </td>

                      {/* Consistency */}
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {(item.consistency || 92.5).toFixed(1)}%
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                        {item.testDateFormatted || 'Bugun'}
                      </td>

                      {/* Hover Arrow Action */}
                      <td className="py-3.5 px-4 text-center text-slate-600 group-hover:text-cyan-400 transition-colors">
                        <ArrowUpRight className="w-4 h-4 inline-block" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards (Ultra-fast responsive list for phones & small tablets) */}
        <div className="block sm:hidden divide-y divide-slate-800/60 font-mono">
          {pageRankings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 p-4">
              <p className="font-bold text-sm text-slate-200 mb-1">Ishtirokchilar topilmadi</p>
              <p className="text-xs">Ushbu filtr bo'yicha hech qanday natija yo'q.</p>
            </div>
          ) : (
            pageRankings.map((item) => {
              const isSelf = currentUser?.uid === item.uid || localStorage.getItem('yolnoma_guest_id') === item.uid;
              return (
                <div
                  key={item.uid}
                  onClick={() => openUserProfile(item)}
                  className={`p-3.5 flex items-center justify-between gap-3 active:bg-slate-800/50 ${
                    isSelf ? 'bg-cyan-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-center font-black text-sm text-slate-400">
                      {item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                    </span>
                    <img
                      src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                      alt="avatar"
                      className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-slate-700"
                    />
                    <div className="max-w-[130px] truncate">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-100 truncate">
                        <span>{item.displayName}</span>
                        {item.isVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500">@{item.username}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-cyan-400 font-mono">
                      {item.highestWpm} <span className="text-[10px] text-slate-400">WPM</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {(item.highestAccuracy || 98).toFixed(1)}% aniqlik
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Profile Modal */}
      <PublicProfileModal
        userProfile={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
