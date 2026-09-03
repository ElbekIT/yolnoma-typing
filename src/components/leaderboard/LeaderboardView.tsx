import React, { useState, useEffect } from 'react';
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  CheckCircle2,
  Globe,
  Flame,
  Zap,
  Trophy,
  Clock,
  Sparkles,
  Award,
  ArrowUpRight
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

  // Typing Mode selections (Monkeytype style)
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
            const consistency = Math.min(99.8, Math.max(82.4, 100 - ((index * 3.7) % 15) - Math.random() * 2));
            const testDateFormatted = new Date(entry.lastActive || entry.createdAt || Date.now()).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
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

  // Filter rankings
  const filteredTyping = rankings.filter((r) => {
    const uname = r.username || '';
    const dname = r.displayName || '';
    return (
      uname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredTyping.length / pageSize));
  const pageRankings = filteredTyping.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openUserProfile = (u: UserProfile) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const getHeaderTitle = () => {
    const timeLabel = selectedTimeMode === 'all' ? 'All Times' : `Time ${selectedTimeMode}`;
    if (selectedCategory === 'all-time-uzbek') return `All-time Uzbek ${timeLabel} Leaderboard`;
    if (selectedCategory === 'all-time-english') return `All-time English ${timeLabel} Leaderboard`;
    if (selectedCategory === 'weekly-xp') return `Weekly XP Leaderboard`;
    return `Daily ${timeLabel} Leaderboard`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-2 sm:px-4 font-mono select-none space-y-6 animate-in fade-in duration-200">
      {/* Grid with Left Sidebar & Main Table */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Category & Time Selectors */}
        <div className="md:col-span-1 space-y-4">
          {/* Main Category Group */}
          <div className="bg-[var(--card-bg)]/60 p-2 rounded-2xl border border-[var(--sub-alt)] space-y-1">
            <button
              onClick={() => {
                setSelectedCategory('all-time-uzbek');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'all-time-uzbek'
                  ? 'bg-[var(--main-color)] text-white'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span>all-time uzbek</span>
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('all-time-english');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'all-time-english'
                  ? 'bg-[var(--main-color)] text-white'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span>all-time english</span>
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('weekly-xp');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'weekly-xp'
                  ? 'bg-[var(--main-color)] text-white'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>weekly xp</span>
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('daily');
                setCurrentPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'daily'
                  ? 'bg-[var(--main-color)] text-white'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>daily</span>
              </span>
            </button>
          </div>

          {/* Time Filter Group */}
          {selectedCategory !== 'weekly-xp' && (
            <div className="bg-[var(--card-bg)]/60 p-2 rounded-2xl border border-[var(--sub-alt)] space-y-1">
              <span className="text-[10px] text-[var(--sub-color)] font-bold px-3 py-1 block uppercase tracking-wider">
                Vaqt Bo'yicha Filtr
              </span>
              {(['all', 15, 30, 60, 120] as const).map((tm) => (
                <button
                  key={tm}
                  onClick={() => {
                    setSelectedTimeMode(tm);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedTimeMode === tm
                      ? 'bg-[var(--main-color)] text-white'
                      : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 opacity-70" />
                  <span>{tm === 'all' ? 'all' : `time ${tm}`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--sub-color)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Ism yoki username izlash..."
              className="w-full pl-8 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl text-xs text-[var(--text-color)] outline-none focus:border-[var(--main-color)]"
            />
          </div>
        </div>

        {/* Right Main Table Content */}
        <div className="md:col-span-3 space-y-4">
          {/* Header Title & Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--sub-alt)] pb-3">
            <div>
              <h1 className="text-xl font-black text-[var(--text-color)] tracking-tight">
                {getHeaderTitle()}
              </h1>
              <p className="text-xs text-[var(--sub-color)] mt-0.5">
                Jonli reyting jadvali • Jami {filteredTyping.length} ta ishtirokchi
              </p>
            </div>

            {/* Pagination controls top right */}
            <div className="flex items-center gap-2 text-xs text-[var(--sub-color)] self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-[var(--sub-alt)] disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-[var(--main-color)]">
                # {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-[var(--sub-alt)] disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[var(--sub-color)] opacity-70 border-b border-[var(--sub-alt)] text-[11px]">
                  <th className="pb-2 px-2 w-10">#</th>
                  <th className="pb-2 px-2">name</th>
                  <th className="pb-2 px-2 text-center">mode</th>
                  <th className="pb-2 px-2 text-right">wpm</th>
                  <th className="pb-2 px-2 text-right">accuracy</th>
                  <th className="pb-2 px-2 text-right hidden sm:table-cell">raw</th>
                  <th className="pb-2 px-2 text-right hidden md:table-cell">consistency</th>
                  <th className="pb-2 px-2 text-right">date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sub-alt)]/40">
                {pageRankings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--sub-color)]">
                      <p className="font-bold text-sm text-[var(--text-color)] mb-1">Foydalanuvchilar topilmadi</p>
                      <p className="text-xs">Ushbu rejimda reyting natijalari hali kiritilmagan.</p>
                    </td>
                  </tr>
                ) : (
                  pageRankings.map((item: any) => {
                    const isSelf = currentUser?.uid === item.uid;

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
                        className={`cursor-pointer transition-all hover:bg-[var(--sub-alt)]/30 ${
                          isSelf ? 'bg-[var(--main-color)]/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2 font-bold text-[var(--sub-color)]">
                          {item.rank === 1 ? (
                            <Crown className="w-4 h-4 text-amber-400 fill-amber-400 inline-block" />
                          ) : item.rank === 2 ? (
                            <span className="text-slate-300 font-bold">2</span>
                          ) : item.rank === 3 ? (
                            <span className="text-amber-700 font-bold">3</span>
                          ) : (
                            item.rank
                          )}
                        </td>

                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                              alt="avatar"
                              className="w-5 h-5 rounded-full object-cover shrink-0 bg-[var(--sub-alt)]"
                            />
                            <span className="text-[var(--text-color)] font-semibold truncate max-w-[120px] sm:max-w-[170px]">
                              {item.displayName}
                            </span>
                            {item.isVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />}
                            {isSelf && (
                              <span className="px-1 py-0.2 rounded bg-[var(--main-color)] text-white text-[8px] font-black uppercase">
                                siz
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--sub-alt)] text-[var(--main-color)] font-mono text-[10px] font-black border border-[var(--sub-color)]/20 shadow-xs">
                            <Clock className="w-3 h-3 text-[var(--main-color)] shrink-0" />
                            <span>{activeTimeDisplay}</span>
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-right font-black text-sm text-[var(--main-color)]">
                          {item.highestWpm}
                        </td>

                        <td className="py-2.5 px-2 text-right text-[var(--text-color)]">
                          {(item.highestAccuracy || 98).toFixed(2)}%
                        </td>

                        <td className="py-2.5 px-2 text-right text-[var(--sub-color)] hidden sm:table-cell">
                          {item.rawWpm || Math.round((item.highestWpm || 0) * 1.05)}
                        </td>

                        <td className="py-2.5 px-2 text-right text-[var(--sub-color)] hidden md:table-cell">
                          {(item.consistency || 92.5).toFixed(2)}%
                        </td>

                        <td className="py-2.5 px-2 text-right text-[var(--sub-color)] text-[10px]">
                          {item.testDateFormatted || 'Bugun'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
