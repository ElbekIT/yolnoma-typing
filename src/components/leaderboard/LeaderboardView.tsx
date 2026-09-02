import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Globe,
  Clock,
  Zap,
  Target,
  CheckCircle2,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { LeaderboardEntry, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';

interface LeaderboardViewProps {
  onOpenAuth?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onOpenAuth }) => {
  const { user, profile } = useAuth();
  const { language } = useSettings();
  const [filterMode, setFilterMode] = useState<number>(30);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rtdb) {
      setLoading(false);
      return;
    }
    const leaderboardRef = ref(rtdb, 'leaderboard');
    const unsubscribe = onValue(
      leaderboardRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: LeaderboardEntry[] = Object.keys(val).map((k) => ({
            ...val[k],
            id: k
          }));
          list.sort((a, b) => {
            if (b.wpm !== a.wpm) return b.wpm - a.wpm;
            return b.accuracy - a.accuracy;
          });
          setActiveLeaderboard(list);
        } else {
          setActiveLeaderboard([]);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredEntries = activeLeaderboard.filter((entry) => {
    if (filterMode && entry.timeMode !== filterMode) return false;
    return true;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-400 flex items-center justify-center font-bold font-mono">
          <Medal className="w-5 h-5" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-300/20 border border-slate-300 text-slate-300 flex items-center justify-center font-bold font-mono">
          <Medal className="w-5 h-5" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-700/20 border border-amber-700 text-amber-600 flex items-center justify-center font-bold font-mono">
          <Medal className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] flex items-center justify-center font-bold font-mono text-xs">
        #{rank}
      </div>
    );
  };

  const handleUserClick = (entry: LeaderboardEntry) => {
    const mockProfile: UserProfile = {
      uid: entry.userId,
      email: '',
      displayName: entry.displayName || entry.username,
      username: entry.username,
      avatarUrl: entry.avatarUrl,
      bio: 'Yolnoma typing raqobatchisi',
      country: entry.country || '🇺🇿 Uzbekistan',
      highestWpm: entry.wpm,
      highestAccuracy: entry.accuracy,
      totalTests: 1,
      totalTimeTypedSeconds: 60,
      currentStreak: 1,
      longestStreak: 1,
      totalWordsTyped: 50,
      totalCharsTyped: 250,
      averageWpm: entry.wpm,
      unlockedAchievements: [],
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      pinnedAchievements: [],
      usernameChangesLeft: 2,
      privacy: {
        profileVisibility: 'public',
        allowMessages: 'everyone',
        showOnlineStatus: true,
        showStats: true,
        allowFollow: true
      },
      isPublic: true,
      isVerified: entry.isVerified,
      rankTitle: entry.wpm >= 100 ? 'Cyber Legend' : entry.wpm >= 70 ? 'Typing Master' : 'Speed Novice',
      role: 'user',
      createdAt: entry.timestamp || Date.now(),
      lastActive: Date.now(),
      level: Math.max(1, Math.floor(entry.wpm / 15)),
      xp: entry.wpm * 20
    };
    setSelectedUser(mockProfile);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Global Typing Leaderboard</span>
          </h2>
          <p className="text-xs text-[var(--sub-color)] mt-1">
            Real-time rankings across all languages and test duration modes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--sub-alt)] p-1 rounded-2xl">
            {[15, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setFilterMode(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  filterMode === sec
                    ? 'bg-[var(--main-color)] text-white shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[var(--main-color)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--sub-color)] font-mono">Loading rankings...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Trophy className="w-12 h-12 text-[var(--sub-color)]/30 mx-auto" />
            <h4 className="text-sm font-bold text-[var(--text-color)]">No Scores Yet for {filterMode}s Mode</h4>
            <p className="text-xs text-[var(--sub-color)] max-w-sm mx-auto">
              Be the first to complete a typing test in this mode to claim the #1 spot on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-[var(--sub-alt)] text-[var(--sub-color)] font-bold uppercase text-[10px] bg-[var(--sub-alt)]/30">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Speed (WPM)</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sub-alt)]">
                {filteredEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrent = profile?.uid === entry.userId;
                  return (
                    <tr
                      key={entry.id || idx}
                      className={`hover:bg-[var(--sub-alt)]/50 transition-colors ${
                        isCurrent ? 'bg-[var(--main-color)]/5 border-l-4 border-[var(--main-color)]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">{getRankBadge(rank)}</td>
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => handleUserClick(entry)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={
                              entry.avatarUrl ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${entry.userId}`
                            }
                            alt={entry.username}
                            className="w-9 h-9 rounded-xl object-cover bg-[var(--sub-alt)] border border-[var(--sub-alt)] group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
                                {entry.displayName || entry.username}
                              </span>
                              {entry.isVerified && (
                                <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" title="Verified" />
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--sub-color)] font-mono">@{entry.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[var(--main-color)]">
                        {entry.wpm} <span className="text-[10px] font-normal text-[var(--sub-color)]">WPM</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">{entry.accuracy}%</td>
                      <td className="py-3.5 px-4 text-[var(--text-color)] font-mono">{entry.timeMode}s</td>
                      <td className="py-3.5 px-4 text-[var(--sub-color)] uppercase font-mono">{entry.language}</td>
                      <td className="py-3.5 px-4 text-[var(--sub-color)]">{new Date(entry.timestamp).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PublicProfileModal
        isOpen={!!selectedUser}
        userProfile={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};
