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

  // Top Level Mode: Typing (Dino removed)
  const [boardType, setBoardType] = useState<'typing'>('typing');

  // Typing Mode selections (Monkeytype style)
  const [selectedCategory, setSelectedCategory] = useState<'all-time-uzbek' | 'all-time-english' | 'weekly-xp' | 'daily'>('all-time-uzbek');
  const [selectedTimeMode, setSelectedTimeMode] = useState<'all' | 15 | 30 | 60 | 120>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  // Dino rankings removed
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected User Profile Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Typing Leaderboard
  useEffect(() => {
    if (boardType !== 'typing') return;

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
            highestAccuracy: 98,
            country: '🇺🇿 Uzbekistan',
            level: 1,
            rankTitle: 'Mehmon Typer',
            bio: 'Tezkor Mehmon',
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
        console.warn('Guest profile load error:', e);
      }

      const getWpmForSelectedMode = (u: UserProfile) => {
        if (selectedTimeMode === 15) return u.time15Wpm || u.highestWpm || 0;
        if (selectedTimeMode === 30) return u.time30Wpm || u.highestWpm || 0;
        if (selectedTimeMode === 60) return u.time60Wpm || u.highestWpm || 0;
        if (selectedTimeMode === 120) return u.time120Wpm || u.highestWpm || 0;
        return u.highestWpm || 0;
      };

      const updateRankingsFromMap = () => {
        let source = Array.from(fetchedMap.values());
        // Strict anti-tamper filter: Ignore impossible speeds (human max 260 WPM), impossible accuracy or fake levels
        source = source.filter(
          (u) =>
            (u.highestWpm || 0) > 0 &&
            (u.highestWpm || 0) <= 260 &&
            (u.highestAccuracy || 0) <= 100 &&
            (u.level || 1) <= 100 &&
            !u.isBanned &&
            !u.isBlocked
        );

        // Sort based on category
        if (selectedCategory === 'weekly-xp') {
          source.sort((a, b) => Math.min(250000, b.xp || 0) - Math.min(250000, a.xp || 0));
        } else {
          source.sort((a, b) => getWpmForSelectedMode(b) - getWpmForSelectedMode(a));
        }

        const formatted = source.map((u, idx) => {
          const rawSpeed = getWpmForSelectedMode(u);
          const wpmVal = Math.min(260, Math.max(0, rawSpeed));
          const rawWpmVal = Math.round(wpmVal * 1.05);
          const consistencyVal = Math.min(99.9, Math.max(82.0, (u.highestAccuracy || 98) - 2.5));
          const dateStr = u.lastActive
            ? new Date(u.lastActive).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : 'Bugun';

          return {
            ...u,
            highestWpm: wpmVal,
            rank: idx + 1,
            rawWpm: rawWpmVal,
            consistency: Number(consistencyVal.toFixed(2)),
            testDateFormatted: dateStr
          };
        });

        setRankings(formatted);
        setLoading(false);
      };

      updateRankingsFromMap();

      // Realtime Firebase DB sync
      try {
        const bannedSet = new Set<string>();

        const bannedRef = ref(rtdb, 'bannedUsers');
        onValue(bannedRef, (bannedSnap) => {
          bannedSet.clear();
          if (bannedSnap.exists()) {
            const bannedObj = bannedSnap.val();
            Object.keys(bannedObj).forEach((id) => {
              if (bannedObj[id]) bannedSet.add(id);
            });
          }
          bannedSet.forEach((bannedId) => {
            fetchedMap.delete(bannedId);
          });
          updateRankingsFromMap();
        });

        const leaderboardRef = ref(rtdb, 'leaderboard');
        unsubscribeRtdb = onValue(leaderboardRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const activeKeys = new Set(Object.keys(val));
            fetchedMap.forEach((_, mapKey) => {
              if (!activeKeys.has(mapKey) && mapKey !== currentUser?.uid && !mapKey.startsWith('guest_')) {
                fetchedMap.delete(mapKey);
              }
            });

            Object.keys(val).forEach((key) => {
              const item = val[key];
              if (!item) return;

              if (bannedSet.has(key) || item.isBanned || item.isBlocked) {
                fetchedMap.delete(key);
                return;
              }

              const existing = fetchedMap.get(key);
              if (!existing) {
                fetchedMap.set(key, {
                  uid: key,
                  email: '',
                  username: item.username || item.displayName || 'typer',
                  displayName: item.displayName || item.username || 'Typer',
                  highestWpm: item.highestWpm || 0,
                  time15Wpm: item.time15Wpm || 0,
                  time30Wpm: item.time30Wpm || 0,
                  time60Wpm: item.time60Wpm || 0,
                  time120Wpm: item.time120Wpm || 0,
                  highestAccuracy: item.highestAccuracy || 0,
                  country: item.country || '🇺🇿 Uzbekistan',
                  level: item.level || 1,
                  rankTitle: item.rankTitle || 'Typing Novice',
                  bio: item.bio || '',
                  avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`,
                  totalTests: item.totalTests || 1,
                  totalTimeTypedSeconds: 60,
                  totalWordsTyped: Math.round(item.highestWpm || 0),
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
                if (item.avatarUrl) existing.avatarUrl = item.avatarUrl;
                if (item.isBanned !== undefined) existing.isBanned = item.isBanned;
              }
            });
            updateRankingsFromMap();
          } else {
            setLoading(false);
          }
        });
      } catch (e) {
        console.warn('RTDB setup error:', e);
        setLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      if (unsubscribeRtdb) unsubscribeRtdb();
    };
  }, [boardType, selectedCategory, selectedTimeMode, currentUser]);

  // Dino leaderboard removed

  // Filter rankings for Typing
  const filteredTyping = rankings.filter((r) => {
    const uname = r.username || '';
    const dname = r.displayName || '';
    return (
      uname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeFilteredList = filteredTyping;
  const totalPages = Math.max(1, Math.ceil(activeFilteredList.length / pageSize));
  const pageRankings = activeFilteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
      {/* Top Level Game Switcher Tabs */}
      <div className="p-1.5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-sm max-w-xl mx-auto grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setBoardType('typing');
            setCurrentPage(1);
            setSearchQuery('');
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
            boardType === 'typing'
              ? 'bg-[var(--main-color)] text-white shadow-md'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Tez Yozish Reytingi</span>
        </button>

        {/* Dino mode removed */}
      </div>

      {/* Grid with Left Sidebar & Main Table */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Category & Time Selectors */}
        <div className="md:col-span-1 space-y-4">
          {boardType === 'typing' ? (
            <>
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
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
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
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>daily</span>
                  </span>
                </button>
              </div>

              {/* Time Mode Sub-Group */}
              {selectedCategory !== 'weekly-xp' && (
                <div className="bg-[var(--card-bg)]/60 p-2 rounded-2xl border border-[var(--sub-alt)] space-y-1">
                  {(['all', 15, 30, 60, 120] as const).map((tm) => (
                    <button
                      key={tm}
                      onClick={() => {
                        setSelectedTimeMode(tm);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            </>
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
                Jonli reyting jadvali • Jami {activeFilteredList.length} ta ishtirokchi
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

          {/* Table View: Typing Leaderboard */}
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
                          : 'all'
                        : `time ${selectedTimeMode}`;

                    return (
                      <tr
                        key={item.uid}
                        className={`transition-all hover:bg-[var(--sub-alt)]/30 ${
                          isSelf ? 'bg-amber-500/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2 font-bold text-[var(--sub-color)]">
                          {item.rank}
                        </td>

                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.uid}`}
                              alt="avatar"
                              className="w-6 h-6 rounded-full object-cover shrink-0 bg-[var(--sub-alt)] border border-[var(--sub-color)]/20"
                            />
                            <span className="text-[var(--text-color)] font-semibold truncate max-w-[120px] sm:max-w-[170px]">
                              {item.displayName}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[8px] font-black uppercase">siz</span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] font-mono text-[10px] font-bold border border-[var(--sub-color)]/20 shadow-xs">
                            {activeTimeDisplay}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-right font-black text-sm text-amber-500 font-mono">{item.highestWpm}</td>

                        <td className="py-2.5 px-2 text-right text-[var(--sub-color)]">{item.highestAccuracy}%</td>

                        <td className="py-2.5 px-2 text-right hidden sm:table-cell">{item.rawWpm || item.highestWpm}</td>

                        <td className="py-2.5 px-2 text-right hidden md:table-cell">{(item.consistency || 92.5).toFixed(2)}%</td>

                        <td className="py-2.5 px-2 text-right text-[var(--sub-color)] text-[10px]">{item.testDateFormatted || 'Bugun'}</td>
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
