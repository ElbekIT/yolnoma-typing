import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  Trash2,
  Ban,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldAlert,
  Flame,
  Zap,
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { ref, onValue, remove, update, set } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { DinoLeaderboardEntry, UserProfile } from '../../types';

interface AdminDinoTabProps {
  onInspectUser?: (user: UserProfile) => void;
}

export const AdminDinoTab: React.FC<AdminDinoTabProps> = () => {
  const [dinoList, setDinoList] = useState<DinoLeaderboardEntry[]>([]);
  const [bannedUids, setBannedUids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'guest' | 'suspicious' | 'banned'>('all');

  // Modals
  const [editingEntry, setEditingEntry] = useState<DinoLeaderboardEntry | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editDistance, setEditDistance] = useState<number>(0);
  const [editObstacles, setEditObstacles] = useState<number>(0);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Ban Modal
  const [banningEntry, setBanningEntry] = useState<DinoLeaderboardEntry | null>(null);
  const [banReason, setBanReason] = useState<string>('Dino Runner oʻyinida avto-sakrash / Cheat skript ishlatilgan');
  const [isBanning, setIsBanning] = useState(false);

  // Feedback Notification
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Real-time listener for dino_leaderboard & bannedUsers
  useEffect(() => {
    setLoading(true);
    let unsubBanned: (() => void) | null = null;
    let unsubDino: (() => void) | null = null;

    try {
      const bannedRef = ref(rtdb, 'bannedUsers');
      unsubBanned = onValue(bannedRef, (snapshot) => {
        const bannedSet = new Set<string>();
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((id) => {
            if (data[id]) bannedSet.add(id);
          });
        }
        setBannedUids(bannedSet);
      });

      const dinoRef = ref(rtdb, 'dino_leaderboard');
      unsubDino = onValue(dinoRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: DinoLeaderboardEntry[] = Object.keys(val).map((k) => {
            const item = val[k];
            return {
              uid: k,
              username: item.username || k,
              displayName: item.displayName || item.username || 'Dino Runner',
              score: Number(item.score || 0),
              distance: Number(item.distance || 0),
              obstaclesDodged: Number(item.obstaclesDodged || 0),
              avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${k}`,
              level: Number(item.level || 1),
              rankTitle: item.rankTitle || 'Runner',
              country: item.country || '🇺🇿 Uzbekistan',
              timestamp: Number(item.timestamp || Date.now()),
              isBanned: false
            };
          });

          // Sort by Score DESC
          list.sort((a, b) => b.score - a.score);

          // Assign ranks
          const ranked = list.map((item, idx) => ({
            ...item,
            rank: idx + 1
          }));

          setDinoList(ranked);
        } else {
          setDinoList([]);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Error fetching Dino leaderboard:', err);
      setLoading(false);
    }

    return () => {
      if (unsubBanned) unsubBanned();
      if (unsubDino) unsubDino();
    };
  }, []);

  // 1. Delete from Dino Leaderboard
  const handleDeleteDinoScore = async (entry: DinoLeaderboardEntry) => {
    if (
      !window.confirm(
        `Haqiqatan ham "${entry.displayName}" (${entry.score} ball) o'yin natijasini Dino Reytingidan butunlay o'chirmoqchimisiz?`
      )
    ) {
      return;
    }

    try {
      // 1. Remove from RTDB dino_leaderboard
      await remove(ref(rtdb, `dino_leaderboard/${entry.uid}`));

      // 2. Reset in users profile if registered user
      if (!entry.uid.startsWith('guest_')) {
        await update(ref(rtdb, `users/${entry.uid}`), {
          dinoHighScore: 0,
          dinoMaxDistance: 0
        });
      }

      showFeedback(`"${entry.displayName}" natijasi Dino reytingidan muvaffaqiyatli o'chirildi!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Natijani oʻchirishda xatolik yuz berdi';
      showFeedback(msg, 'error');
    }
  };

  // 2. Open Edit Score Modal
  const handleOpenEdit = (entry: DinoLeaderboardEntry) => {
    setEditingEntry(entry);
    setEditDisplayName(entry.displayName);
    setEditScore(entry.score);
    setEditDistance(entry.distance || Math.round(entry.score * 0.7));
    setEditObstacles(entry.obstaclesDodged || Math.floor(entry.score / 50));
  };

  // 3. Save Edited Score
  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    setIsSaving(true);

    try {
      const updates = {
        displayName: editDisplayName.trim(),
        score: Number(editScore),
        distance: Number(editDistance),
        obstaclesDodged: Number(editObstacles),
        timestamp: Date.now()
      };

      // 1. Update in dino_leaderboard
      if (Number(editScore) > 0) {
        await update(ref(rtdb, `dino_leaderboard/${editingEntry.uid}`), updates);
      } else {
        await remove(ref(rtdb, `dino_leaderboard/${editingEntry.uid}`));
      }

      // 2. Update in users profile if registered
      if (!editingEntry.uid.startsWith('guest_')) {
        await update(ref(rtdb, `users/${editingEntry.uid}`), {
          dinoHighScore: Number(editScore),
          dinoMaxDistance: Number(editDistance)
        });
      }

      showFeedback(`"${editDisplayName}" ning Dino o'yin bali muvaffaqiyatli yangilandi!`);
      setEditingEntry(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tahrirlashda xatolik yuz berdi';
      showFeedback(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Ban Player from Game and Platform
  const handleOpenBan = (entry: DinoLeaderboardEntry) => {
    setBanningEntry(entry);
    setBanReason('Dino Runner oʻyinida bot / Cheat skript orqali ball oshirilgan');
  };

  const handleConfirmBan = async () => {
    if (!banningEntry) return;
    setIsBanning(true);

    try {
      const uid = banningEntry.uid;

      // 1. Add to bannedUsers node
      await set(ref(rtdb, `bannedUsers/${uid}`), {
        uid,
        displayName: banningEntry.displayName,
        username: banningEntry.username,
        reason: banReason.trim(),
        bannedAt: Date.now(),
        bannedFrom: 'Dino Game & Platform'
      });

      // 2. Mark isBanned in users profile if registered
      if (!uid.startsWith('guest_')) {
        await update(ref(rtdb, `users/${uid}`), {
          isBanned: true,
          blockReason: banReason.trim(),
          bannedAt: Date.now()
        });
      }

      // 3. Remove immediately from dino_leaderboard and typing leaderboard
      await remove(ref(rtdb, `dino_leaderboard/${uid}`));
      await remove(ref(rtdb, `leaderboard/${uid}`));

      showFeedback(`"${banningEntry.displayName}" muvaffaqiyatli BLOKLANDI va barcha reytinglardan o'chirildi!`);
      setBanningEntry(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bloklashda xatolik yuz berdi';
      showFeedback(msg, 'error');
    } finally {
      setIsBanning(false);
    }
  };

  // 5. Unban Player
  const handleUnban = async (entry: DinoLeaderboardEntry) => {
    if (!window.confirm(`Haqiqatan ham "${entry.displayName}" ni blokdan chiqarmoqchimisiz?`)) {
      return;
    }

    try {
      await remove(ref(rtdb, `bannedUsers/${entry.uid}`));
      if (!entry.uid.startsWith('guest_')) {
        await update(ref(rtdb, `users/${entry.uid}`), {
          isBanned: false,
          blockReason: null
        });
      }
      showFeedback(`"${entry.displayName}" blokdan chiqarildi!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Blokdan chiqarishda xatolik';
      showFeedback(msg, 'error');
    }
  };

  // 6. Bulk Clean Impossible Scores (> 25,000 pts)
  const handlePurgeImpossibleScores = async () => {
    const suspicious = dinoList.filter((e) => e.score > 25000);
    if (suspicious.length === 0) {
      alert("Hozirda 25,000 balldan oshgan sun'iy rekordlar mavjud emas.");
      return;
    }

    if (
      !window.confirm(
        `Topilgan ${suspicious.length} ta shubhali (>25,000 ball) bot natijalarini tozalab o'chirib tashlaysizmi?`
      )
    ) {
      return;
    }

    try {
      for (const item of suspicious) {
        await remove(ref(rtdb, `dino_leaderboard/${item.uid}`));
        if (!item.uid.startsWith('guest_')) {
          await update(ref(rtdb, `users/${item.uid}`), {
            dinoHighScore: 0
          });
        }
      }
      showFeedback(`${suspicious.length} ta sun'iy bot natijalari tozalandi!`);
    } catch (err) {
      showFeedback('Tozalashda xatolik yuz berdi', 'error');
    }
  };

  // Filtered List
  const filteredList = dinoList.filter((entry) => {
    const isBanned = bannedUids.has(entry.uid);
    const isGuest = entry.uid.startsWith('guest_');
    const isSuspicious = entry.score > 15000;

    const matchesSearch =
      entry.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.uid.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'registered') return !isGuest && !isBanned;
    if (filterType === 'guest') return isGuest && !isBanned;
    if (filterType === 'suspicious') return isSuspicious;
    if (filterType === 'banned') return isBanned;
    return true;
  });

  // Calculate high-level stats
  const totalPlayers = dinoList.length;
  const highestScore = dinoList.length > 0 ? Math.max(...dinoList.map((d) => d.score)) : 0;
  const avgScore =
    dinoList.length > 0 ? Math.round(dinoList.reduce((acc, d) => acc + d.score, 0) / dinoList.length) : 0;
  const suspiciousCount = dinoList.filter((d) => d.score > 15000).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-lg ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
            <span>Dino O'yinchilari</span>
            <Gamepad2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{totalPlayers.toLocaleString()}</div>
          <div className="text-[11px] text-[var(--sub-color)]">Reytingdagi jami o'yinchilar</div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
            <span>Mutlaq Rekord</span>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-mono font-black text-yellow-400">{highestScore.toLocaleString()} ball</div>
          <div className="text-[11px] text-yellow-500/80 font-mono">Dino Runner chempioni</div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
            <span>O'rtacha Natija</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-black text-cyan-400">{avgScore.toLocaleString()} ball</div>
          <div className="text-[11px] text-[var(--sub-color)]">O'yin o'rtacha balli</div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
            <span>Shubhali Bot Natijalar</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-black text-rose-400">{suspiciousCount} ta</div>
          <div className="text-[11px] text-rose-400/80 font-mono">&gt; 15,000 ball (Tekshirish lozim)</div>
        </div>
      </div>

      {/* Search, Filter & Quick Purge Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--sub-color)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dino o'yinchisini qidirish (ism, UID)..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white'
            }`}
          >
            Barchasi ({dinoList.length})
          </button>
          <button
            onClick={() => setFilterType('registered')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              filterType === 'registered'
                ? 'bg-emerald-500 text-black shadow-sm font-black'
                : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white'
            }`}
          >
            A'zolar ({dinoList.filter((d) => !d.uid.startsWith('guest_') && !bannedUids.has(d.uid)).length})
          </button>
          <button
            onClick={() => setFilterType('guest')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              filterType === 'guest'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white'
            }`}
          >
            Mehmonlar ({dinoList.filter((d) => d.uid.startsWith('guest_') && !bannedUids.has(d.uid)).length})
          </button>
          <button
            onClick={() => setFilterType('suspicious')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              filterType === 'suspicious'
                ? 'bg-rose-500 text-white shadow-sm font-black'
                : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white'
            }`}
          >
            Shubhali ({suspiciousCount})
          </button>

          {suspiciousCount > 0 && (
            <button
              onClick={handlePurgeImpossibleScores}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Botlarni Tozalash</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-xs text-[var(--sub-color)] font-mono animate-pulse">
            Dino o'yini reytingi yuklanmoqda...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 text-center text-xs text-[var(--sub-color)]">
            Mos keluvchi Dino o'yinchisi topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--sub-alt)] bg-[var(--bg-color)]/50 text-[11px] font-black uppercase tracking-wider text-[var(--sub-color)]">
                  <th className="py-4 px-6 w-16">O'rin</th>
                  <th className="py-4 px-6">O'yinchi</th>
                  <th className="py-4 px-6">Rekord Ball</th>
                  <th className="py-4 px-6">Masofa</th>
                  <th className="py-4 px-6">To'siqlar</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6">Holat</th>
                  <th className="py-4 px-6 text-right">Admin Boshqaruvi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sub-alt)] text-xs font-medium">
                {filteredList.map((entry) => {
                  const isBanned = bannedUids.has(entry.uid);
                  const isGuest = entry.uid.startsWith('guest_');
                  const isSuspicious = entry.score > 15000;

                  return (
                    <tr
                      key={entry.uid}
                      className={`hover:bg-[var(--sub-alt)]/30 transition-colors ${
                        isBanned ? 'bg-rose-500/5 opacity-75' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6">
                        {entry.rank === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 font-mono font-black flex items-center justify-center border border-amber-400/40 text-xs">
                            🥇 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-300/20 text-slate-300 font-mono font-black flex items-center justify-center border border-slate-400/40 text-xs">
                            🥈 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 font-mono font-black flex items-center justify-center border border-amber-700/40 text-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-[var(--sub-color)] font-bold text-xs pl-2">
                            #{entry.rank}
                          </span>
                        )}
                      </td>

                      {/* Player Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatarUrl}
                            alt={entry.displayName}
                            className="w-9 h-9 rounded-xl object-cover border border-[var(--sub-alt)] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${entry.uid}`;
                            }}
                          />
                          <div>
                            <div className="font-black text-white flex items-center gap-2">
                              <span>{entry.displayName}</span>
                              {isGuest ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                                  Mehmon
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-mono">
                                  A'zo
                                </span>
                              )}
                              {isSuspicious && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3" /> Bot?
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--sub-color)] font-mono flex items-center gap-2">
                              <span>@{entry.username}</span>
                              <span>•</span>
                              <span>{entry.country || '🇺🇿'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* High Score */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-amber-400 text-sm flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span>{entry.score.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-[var(--sub-color)] font-mono">ball</div>
                      </td>

                      {/* Distance */}
                      <td className="py-4 px-6 font-mono text-[var(--sub-color)]">
                        <span className="text-white font-bold">{entry.distance || Math.round(entry.score * 0.7)}</span>{' '}
                        metr
                      </td>

                      {/* Obstacles Dodged */}
                      <td className="py-4 px-6 font-mono text-[var(--sub-color)]">
                        <span className="text-emerald-400 font-bold">
                          {entry.obstaclesDodged || Math.floor(entry.score / 50)}
                        </span>{' '}
                        ta
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-[11px] text-[var(--sub-color)] font-mono">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('uz-UZ') : 'Bugun'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isBanned ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
                            🚫 BLOKLANGAN
                          </span>
                        ) : isSuspicious ? (
                          <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-mono text-[10px] font-bold">
                            ⚠️ SHUBHALI
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                            ✓ FAOL
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Score */}
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            title="Ballni tahrirlash / tozalash"
                            className="p-2 rounded-xl bg-[var(--sub-alt)] hover:bg-amber-500/20 text-[var(--sub-color)] hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Ban / Unban */}
                          {isBanned ? (
                            <button
                              onClick={() => handleUnban(entry)}
                              title="Blokdan chiqarish"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-mono text-xs font-bold transition-all cursor-pointer"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBan(entry)}
                              title="O'yindan va saytdan bloklash (Ban)"
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete from Dino Leaderboard */}
                          <button
                            onClick={() => handleDeleteDinoScore(entry)}
                            title="Reytingdan butunlay o'chirish"
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT SCORE MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-4">
              <div className="flex items-center gap-2 text-white font-black text-base">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Dino O'yin Natijasini Tahrirlash</span>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-[var(--sub-color)] hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">O'yinchi Ismi:</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Rekord Ball (Score):
                </label>
                <input
                  type="number"
                  value={editScore}
                  onChange={(e) => setEditScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-amber-400 text-base font-black font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Masofa (m):</label>
                  <input
                    type="number"
                    value={editDistance}
                    onChange={(e) => setEditDistance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">To'siqlar:</label>
                  <input
                    type="number"
                    value={editObstacles}
                    onChange={(e) => setEditObstacles(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                💡 Eslatma: Ballni 0 qilsangiz, o'yinchi avtomatik tarzda Dino reytingidan o'chiriladi.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white font-bold text-xs cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAN CONFIRMATION MODAL */}
      {banningEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card-bg)] border border-rose-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-black text-base">
                <Ban className="w-5 h-5" />
                <span>O'yinchini Bloklash (BAN)</span>
              </div>
              <button
                onClick={() => setBanningEntry(null)}
                className="text-[var(--sub-color)] hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Siz <strong className="text-white">"{banningEntry.displayName}"</strong> (@{banningEntry.username}) ni
                o'yin va butun platformadan bloklamoqchisiz. Uning o'yin rekordi ({banningEntry.score} ball) va barcha
                peshqadamlar ro'yxatidagi o'rni bekor qilinadi.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Bloklash Sababi:</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-white text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBanningEntry(null)}
                className="px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white font-bold text-xs cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isBanning}
                onClick={handleConfirmBan}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>{isBanning ? 'Bloklanmoqda...' : 'Bloklash va Oʻchirish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
