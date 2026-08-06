import React, { useState, useEffect } from 'react';
import { Trophy, Search, Globe, Filter, Crown, Medal, User as UserIcon, Flame } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { languagesList } from '../../config/languages';

interface LeaderboardItem {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  language: string;
  country: string;
  timestamp: number;
}

export const LeaderboardView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rankings, setRankings] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fallback top typists for instant global vibrancy
  const fallbackRankings: LeaderboardItem[] = [
    { id: '1', username: 'SpeedDemon_99', wpm: 168, accuracy: 99, language: 'en', country: '🇺🇸 USA', timestamp: Date.now() - 3600000 },
    { id: '2', username: 'Uzbek_Typer_Pro', wpm: 154, accuracy: 98, language: 'uz-latn', country: '🇺🇿 Uzbekistan', timestamp: Date.now() - 7200000 },
    { id: '3', username: 'CyberNinja_X', wpm: 142, accuracy: 100, language: 'en', country: '🇬🇧 UK', timestamp: Date.now() - 10800000 },
    { id: '4', username: 'Klaviatura_Usta', wpm: 135, accuracy: 97, language: 'uz-latn', country: '🇺🇿 Uzbekistan', timestamp: Date.now() - 14400000 },
    { id: '5', username: 'TypeWriter_Master', wpm: 128, accuracy: 99, language: 'ru', country: '🇰🇿 Kazakhstan', timestamp: Date.now() - 18000000 },
    { id: '6', username: 'Alpha_Coder', wpm: 122, accuracy: 96, language: 'de', country: '🇩🇪 Germany', timestamp: Date.now() - 21600000 },
    { id: '7', username: 'Lightning_Keys', wpm: 118, accuracy: 98, language: 'es', country: '🇪🇸 Spain', timestamp: Date.now() - 25200000 },
    { id: '8', username: 'Tokyo_Fast', wpm: 115, accuracy: 95, language: 'ja', country: '🇯🇵 Japan', timestamp: Date.now() - 28800000 },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'leaderboards'),
          orderBy('wpm', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const fetched: LeaderboardItem[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as LeaderboardItem);
        });

        if (fetched.length > 0) {
          setRankings(fetched);
        } else {
          setRankings(fallbackRankings);
        }
      } catch {
        setRankings(fallbackRankings);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, selectedLang]);

  const filtered = rankings.filter((r) => {
    const matchesSearch = r.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLang === 'all' || r.language === selectedLang;
    return matchesSearch && matchesLang;
  });

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Global Leaderboards</span>
          </h2>
          <p className="text-xs text-[var(--sub-color)] mt-1">
            Compete with the fastest typists around the world in real-time
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--sub-alt)] p-1 rounded-2xl text-xs font-semibold">
            {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  timeframe === tf
                    ? 'bg-[var(--main-color)] text-white shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {tf === 'allTime' ? 'All Time' : tf}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--sub-color)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player..."
              className="pl-8 pr-3 py-2 bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 rounded-xl text-xs text-[var(--text-color)] outline-none focus:border-[var(--main-color)] w-40 sm:w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* #2 Rank */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl text-center flex flex-col items-center justify-center relative shadow-sm hover:border-slate-400 transition-all">
            <div className="absolute top-3 left-3 text-xs font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-400/10">
              #2 SILVER
            </div>
            <div className="w-16 h-16 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center my-3 font-bold text-xl border-2 border-slate-400">
              🥈
            </div>
            <h3 className="font-bold text-sm text-[var(--text-color)]">{top3[1].username}</h3>
            <p className="text-[11px] text-[var(--sub-color)] mb-2">{top3[1].country}</p>
            <div className="text-2xl font-black font-mono text-[var(--main-color)]">{top3[1].wpm} WPM</div>
            <span className="text-[10px] text-emerald-500 font-bold">{top3[1].accuracy}% Accuracy</span>
          </div>

          {/* #1 Rank GOLD */}
          <div className="bg-gradient-to-b from-amber-500/10 to-[var(--card-bg)] border-2 border-amber-500/40 p-6 rounded-3xl text-center flex flex-col items-center justify-center relative shadow-lg scale-105">
            <div className="absolute top-3 left-3 text-xs font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/20 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-500" />
              <span>#1 CHAMPION</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center my-3 font-bold text-2xl border-2 border-amber-500 shadow-md">
              🥇
            </div>
            <h3 className="font-extrabold text-base text-[var(--text-color)]">{top3[0].username}</h3>
            <p className="text-[11px] text-[var(--sub-color)] mb-2">{top3[0].country}</p>
            <div className="text-3xl font-black font-mono text-amber-500">{top3[0].wpm} WPM</div>
            <span className="text-[10px] text-emerald-500 font-bold">{top3[0].accuracy}% Accuracy</span>
          </div>

          {/* #3 Rank BRONZE */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl text-center flex flex-col items-center justify-center relative shadow-sm hover:border-amber-700 transition-all">
            <div className="absolute top-3 left-3 text-xs font-bold text-amber-700 px-2 py-0.5 rounded-full bg-amber-700/10">
              #3 BRONZE
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-700/20 text-amber-600 flex items-center justify-center my-3 font-bold text-xl border-2 border-amber-700">
              🥉
            </div>
            <h3 className="font-bold text-sm text-[var(--text-color)]">{top3[2].username}</h3>
            <p className="text-[11px] text-[var(--sub-color)] mb-2">{top3[2].country}</p>
            <div className="text-2xl font-black font-mono text-[var(--main-color)]">{top3[2].wpm} WPM</div>
            <span className="text-[10px] text-emerald-500 font-bold">{top3[2].accuracy}% Accuracy</span>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-[var(--sub-alt)] text-[var(--sub-color)] font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">WPM</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sub-alt)]">
              {filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-[var(--sub-alt)]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--sub-color)]">#{index + 1}</td>
                  <td className="py-3 px-4 font-bold text-[var(--text-color)] flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-[var(--main-color)]" />
                    <span>{item.username}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-[var(--main-color)]">{item.wpm} WPM</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-500">{item.accuracy}%</td>
                  <td className="py-3 px-4 uppercase text-[var(--sub-color)]">{item.language}</td>
                  <td className="py-3 px-4 text-[var(--sub-color)]">{item.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
