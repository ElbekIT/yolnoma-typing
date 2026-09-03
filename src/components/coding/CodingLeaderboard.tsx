import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Search,
  CheckCircle2,
  Zap,
  ArrowRight,
  Code2,
  Sparkles,
  User,
  Shield
} from 'lucide-react';
import { CodingLeaderboardEntry } from '../../types/coding';
import {
  getLocalCodingProgress,
  SEED_CODING_LEADERBOARD,
  getRankBadge
} from '../../utils/codingStorage';
import { useAuth } from '../../context/AuthContext';
import { rtdb } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';

interface CodingLeaderboardProps {
  onGoToSolve?: () => void;
}

export const CodingLeaderboard: React.FC<CodingLeaderboardProps> = ({ onGoToSolve }) => {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<CodingLeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const localProgress = getLocalCodingProgress();

    // Fetch from Firebase RTDB or fallback to seed + local
    const dbRef = ref(rtdb, 'coding_leaderboard');
    const unsub = onValue(
      dbRef,
      (snapshot) => {
        const data = snapshot.val();
        let list: CodingLeaderboardEntry[] = [...SEED_CODING_LEADERBOARD];

        if (data && typeof data === 'object') {
          Object.values(data).forEach((item: any) => {
            if (item && item.uid) {
              const existingIdx = list.findIndex((e) => e.uid === item.uid);
              const entry: CodingLeaderboardEntry = {
                uid: item.uid,
                displayName: item.displayName || 'Dasturchi',
                username: item.username || 'coder',
                avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.uid}`,
                rank: 0,
                score: Number(item.score) || 0,
                solvedCount: Number(item.solvedCount) || 0,
                rankBadge: getRankBadge(Number(item.score) || 0),
                streak: item.streak || 1,
                isCurrentUser: user?.uid === item.uid
              };

              if (existingIdx >= 0) {
                list[existingIdx] = entry;
              } else {
                list.push(entry);
              }
            }
          });
        }

        // Add or update current local user if not already in list
        const currentUid = user?.uid || 'guest-local';
        const userExists = list.find((e) => e.uid === currentUid);
        if (!userExists && localProgress.totalScore > 0) {
          list.push({
            uid: currentUid,
            displayName: profile?.displayName || user?.displayName || 'Siz (O\'quvchi)',
            username: profile?.username || 'you',
            avatarUrl: profile?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=currentuser',
            rank: 0,
            score: localProgress.totalScore,
            solvedCount: localProgress.solvedProblemIds.length,
            rankBadge: getRankBadge(localProgress.totalScore),
            streak: 1,
            isCurrentUser: true
          });
        } else if (userExists) {
          userExists.isCurrentUser = true;
          if (localProgress.totalScore > userExists.score) {
            userExists.score = localProgress.totalScore;
            userExists.solvedCount = localProgress.solvedProblemIds.length;
            userExists.rankBadge = getRankBadge(localProgress.totalScore);
          }
        }

        // Sort by score desc, then by solvedCount desc
        list.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.solvedCount - a.solvedCount;
        });

        // Assign ranks
        list = list.map((item, index) => ({
          ...item,
          rank: index + 1
        }));

        setEntries(list);
        setLoading(false);
      },
      (err) => {
        console.error('Coding leaderboard error:', err);
        // Fallback
        const local = getLocalCodingProgress();
        const fallbackList = [...SEED_CODING_LEADERBOARD];
        if (local.totalScore > 0) {
          fallbackList.push({
            uid: user?.uid || 'guest-local',
            displayName: profile?.displayName || 'Siz (O\'quvchi)',
            username: profile?.username || 'you',
            avatarUrl: profile?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=currentuser',
            rank: 0,
            score: local.totalScore,
            solvedCount: local.solvedProblemIds.length,
            rankBadge: getRankBadge(local.totalScore),
            streak: 1,
            isCurrentUser: true
          });
        }
        fallbackList.sort((a, b) => b.score - a.score);
        setEntries(fallbackList.map((it, idx) => ({ ...it, rank: idx + 1 })));
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, profile]);

  const filtered = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return e.displayName.toLowerCase().includes(q) || e.username.toLowerCase().includes(q);
  });

  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)]">
                Kodlash & Algoritmlar Reytingi
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Online Judge
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              10 ta testdan to'liq o'tgan masalalar bo'yicha eng yuqori natija ko'rsatgan dasturchilar
            </p>
          </div>
        </div>

        {onGoToSolve && (
          <button
            onClick={onGoToSolve}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>Masala Yechish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* User's Current Standing Card */}
      {currentUserEntry && (
        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-900/50 flex items-center justify-center font-mono font-black text-cyan-300">
              #{currentUserEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--text-color)]">Sizning o'rningiz:</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  {currentUserEntry.rankBadge}
                </span>
              </div>
              <p className="text-xs text-[var(--sub-color)] font-mono mt-0.5">
                {currentUserEntry.solvedCount} ta masala yechilgan • {currentUserEntry.score} ball (XP)
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-[var(--sub-color)]">Jami Ball:</div>
            <div className="text-xl font-black text-cyan-400">{currentUserEntry.score} XP</div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sub-color)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Dasturchi ismi yoki login bo'yicha qidirish..."
          className="w-full bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Table of Top Coders */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[var(--sub-alt)]/60 text-[var(--sub-color)] uppercase tracking-wider text-[10px] border-b border-[var(--sub-alt)]">
                <th className="py-3 px-4 w-16 text-center">O'rin</th>
                <th className="py-3 px-4">Dasturchi</th>
                <th className="py-3 px-4 text-center">Unvon & Daraja</th>
                <th className="py-3 px-4 text-center">Yechilgan</th>
                <th className="py-3 px-4 text-right">Umumiy Ball</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sub-alt)]/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--sub-color)]">
                    <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-2" />
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--sub-color)]">
                    Hech qanday dasturchi topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  return (
                    <tr
                      key={item.uid}
                      className={`transition-colors ${
                        item.isCurrentUser
                          ? 'bg-cyan-500/10 font-bold'
                          : 'hover:bg-[var(--sub-alt)]/30'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 text-center font-bold">
                        {isTop1 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            <Crown className="w-4 h-4" />
                          </div>
                        ) : isTop2 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/40">
                            <Medal className="w-4 h-4" />
                          </div>
                        ) : isTop3 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40">
                            <Medal className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-[var(--sub-color)]">#{item.rank}</span>
                        )}
                      </td>

                      {/* Developer Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl}
                            alt={item.displayName}
                            className="w-8 h-8 rounded-full border border-[var(--sub-alt)] bg-[var(--sub-alt)] object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--text-color)]">
                                {item.displayName}
                              </span>
                              {item.isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500 text-white font-bold">
                                  Siz
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--sub-color)]">
                              @{item.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rank Title Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--sub-alt)]/80 text-[var(--text-color)] border border-[var(--sub-alt)]">
                          {item.rankBadge}
                        </span>
                      </td>

                      {/* Solved Count */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.solvedCount} / 30</span>
                        </div>
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-sm text-cyan-400">
                          {item.score} <span className="text-[10px] font-normal text-[var(--sub-color)]">XP</span>
                        </span>
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
  );
};
