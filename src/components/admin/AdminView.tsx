import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Search,
  UserX,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  X,
  Crown,
  FileText,
  Globe,
  Plus,
  Trophy,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { rtdb, db } from '../../config/firebase';
import { ref, onValue, update, set, remove } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { OwnerPanelModal } from './OwnerPanelModal';

export const AdminView: React.FC = () => {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'blocked' | 'active'>('all');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'users'>('leaderboard');

  // Ban Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState('Nomaʼlum qoida buzilishi / Avto-kliker dastur ishlatilgan.');

  // Edit Leaderboard / User Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editWpm, setEditWpm] = useState<number>(0);
  const [editAccuracy, setEditAccuracy] = useState<number>(98);
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editRankTitle, setEditRankTitle] = useState('Typing Master');
  const [editTotalTests, setEditTotalTests] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Owner Content Modal State
  const [showContentModal, setShowContentModal] = useState(false);

  const [leaderboardList, setLeaderboardList] = useState<UserProfile[]>([]);

  // Fetch users & leaderboard from Firebase Realtime DB with exact LeaderboardView synchronization
  useEffect(() => {
    try {
      const bannedRef = ref(rtdb, 'bannedUsers');
      const leaderboardRef = ref(rtdb, 'leaderboard');
      const usersRef = ref(rtdb, 'users');

      let bannedSet = new Set<string>();
      let rawLeaderboard: Record<string, any> = {};
      let rawUsers: Record<string, any> = {};

      const rebuildLists = () => {
        const profileMap = new Map<string, UserProfile>();

        // 1. Process leaderboard node
        Object.keys(rawLeaderboard).forEach((key) => {
          const item = rawLeaderboard[key];
          if (!item) return;

          const isBanned = bannedSet.has(key) || !!item.isBanned || !!item.isBlocked;
          if (isBanned) return;

          const wpm = item.highestWpm || item.wpm || 0;
          const acc = item.highestAccuracy || item.accuracy || 98;

          profileMap.set(key, {
            uid: key,
            email: item.email || `${key.slice(0, 8)}@yolnoma.uz`,
            username: item.username || item.displayName || 'Foydalanuvchi',
            displayName: item.displayName || item.username || 'Foydalanuvchi',
            highestWpm: wpm,
            highestAccuracy: acc,
            level: item.level || 1,
            rankTitle: item.rankTitle || 'Typing Master',
            xp: item.xp || 250,
            isBanned: false,
            blockReason: '',
            createdAt: item.createdAt || Date.now(),
            lastActive: item.lastActive || Date.now(),
            role: item.role || 'user',
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
            pinnedAchievements: [],
            unlockedAchievements: [],
            totalTests: item.totalTests || 1,
            totalTimeTypedSeconds: 0,
            totalWordsTyped: 0,
            totalCharsTyped: 0,
            averageWpm: wpm,
            currentStreak: 1,
            longestStreak: 1,
            isPublic: true,
            usernameChangesLeft: 2,
            privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true }
          });
        });

        // 2. Process users node
        Object.keys(rawUsers).forEach((uid) => {
          const u = rawUsers[uid];
          if (!u) return;

          const isBanned = bannedSet.has(uid) || !!u.isBanned;
          const userWpm = Math.max(u.highestWpm || 0, u.wpm || 0);
          const userAcc = Math.max(u.highestAccuracy || 0, u.accuracy || 0) || 98;

          if (profileMap.has(uid)) {
            const existing = profileMap.get(uid)!;
            existing.email = u.email || existing.email;
            existing.isBanned = isBanned;
            existing.blockReason = u.blockReason || existing.blockReason;
            existing.role = u.role || existing.role;
            existing.highestWpm = Math.max(existing.highestWpm, userWpm);
            existing.highestAccuracy = Math.max(existing.highestAccuracy, userAcc);
            existing.level = u.level || existing.level;
            existing.rankTitle = u.rankTitle || existing.rankTitle;
            existing.totalTests = u.totalTests || existing.totalTests;
          } else {
            profileMap.set(uid, {
              uid,
              email: u.email || `${uid.slice(0, 8)}@yolnoma.uz`,
              username: u.username || u.displayName || 'Foydalanuvchi',
              displayName: u.displayName || u.username || 'Foydalanuvchi',
              highestWpm: userWpm,
              highestAccuracy: userAcc,
              level: u.level || 1,
              rankTitle: u.rankTitle || 'Typing Master',
              xp: u.xp || 250,
              isBanned,
              blockReason: u.blockReason || '',
              createdAt: u.createdAt || Date.now(),
              lastActive: u.lastActive || Date.now(),
              role: u.role || 'user',
              followers: [],
              following: [],
              followersCount: 0,
              followingCount: 0,
              pinnedAchievements: [],
              unlockedAchievements: [],
              totalTests: u.totalTests || 0,
              totalTimeTypedSeconds: 0,
              totalWordsTyped: 0,
              totalCharsTyped: 0,
              averageWpm: userWpm,
              currentStreak: 1,
              longestStreak: 1,
              isPublic: true,
              usernameChangesLeft: 2,
              privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true }
            });
          }
        });

        const allUsersList = Array.from(profileMap.values());
        setUsersList(allUsersList);

        // Leaderboard List: Only users with highestWpm > 0 and NOT banned, sorted by WPM DESC, then Accuracy DESC
        const sortedLeaderboard = allUsersList
          .filter((u) => !u.isBanned && u.highestWpm > 0)
          .sort((a, b) => {
            if (b.highestWpm !== a.highestWpm) return b.highestWpm - a.highestWpm;
            return b.highestAccuracy - a.highestAccuracy;
          });

        setLeaderboardList(sortedLeaderboard);
        setLoading(false);
      };

      const unsubBanned = onValue(bannedRef, (snap) => {
        bannedSet.clear();
        if (snap.exists()) {
          const val = snap.val();
          Object.keys(val).forEach((id) => { if (val[id]) bannedSet.add(id); });
        }
        rebuildLists();
      });

      const unsubLeaderboard = onValue(leaderboardRef, (snap) => {
        rawLeaderboard = snap.exists() ? snap.val() : {};
        rebuildLists();
      });

      const unsubUsers = onValue(usersRef, (snap) => {
        rawUsers = snap.exists() ? snap.val() : {};
        rebuildLists();
      });

      return () => {
        unsubBanned();
        unsubLeaderboard();
        unsubUsers();
      };
    } catch (e) {
      console.warn('Realtime DB fetch error in Admin:', e);
      setLoading(false);
    }
  }, []);

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditDisplayName(u.displayName);
    setEditUsername(u.username);
    setEditWpm(u.highestWpm);
    setEditAccuracy(u.highestAccuracy);
    setEditLevel(u.level);
    setEditRankTitle(u.rankTitle);
    setEditTotalTests(u.totalTests);
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const updates: Record<string, any> = {
        displayName: editDisplayName.trim(),
        username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        highestWpm: Number(editWpm),
        wpm: Number(editWpm),
        highestAccuracy: Number(editAccuracy),
        accuracy: Number(editAccuracy),
        level: Number(editLevel),
        rankTitle: editRankTitle.trim(),
        totalTests: Number(editTotalTests)
      };

      // 1. Update in Realtime DB users node
      await update(ref(rtdb, `users/${editingUser.uid}`), updates);

      // 2. Sync / Update in Realtime DB leaderboard node if WPM > 0
      if (editWpm > 0 && !editingUser.isBanned) {
        await update(ref(rtdb, `leaderboard/${editingUser.uid}`), {
          userId: editingUser.uid,
          displayName: editDisplayName.trim(),
          username: editUsername.trim().toLowerCase(),
          wpm: Number(editWpm),
          highestWpm: Number(editWpm),
          accuracy: Number(editAccuracy),
          highestAccuracy: Number(editAccuracy),
          level: Number(editLevel),
          rankTitle: editRankTitle.trim(),
          totalTests: Number(editTotalTests),
          timestamp: Date.now()
        });
      } else {
        // If WPM is set to 0, remove from leaderboard
        await remove(ref(rtdb, `leaderboard/${editingUser.uid}`));
      }

      // 3. Try updating Firestore
      try {
        await updateDoc(doc(db, 'users', editingUser.uid), updates);
      } catch {}

      setEditingUser(null);
    } catch (e) {
      alert('Natijani saqlashda xatolik yuz berdi: ' + e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromLeaderboard = async (user: UserProfile) => {
    if (!window.confirm(`"${user.displayName}" foydalanuvchisini Reyting (Leaderboard) jadvalidan olib tashlashni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      // Remove from RTDB leaderboard node
      await remove(ref(rtdb, `leaderboard/${user.uid}`));

      // Reset highestWpm in RTDB users node
      await update(ref(rtdb, `users/${user.uid}`), {
        highestWpm: 0,
        wpm: 0
      });

      alert(`"${user.displayName}" reytingdan muvaffaqiyatli olib tashlandi!`);
    } catch (e) {
      alert('Reytingdan olib tashlashda xatolik: ' + e);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      // Update in RTDB users node
      await update(ref(rtdb, `users/${selectedUser.uid}`), {
        isBanned: true,
        blockReason: banReason,
        bannedAt: Date.now()
      });

      // Set in bannedUsers node
      await set(ref(rtdb, `bannedUsers/${selectedUser.uid}`), true);

      // Immediately REMOVE from leaderboard in RTDB
      await remove(ref(rtdb, `leaderboard/${selectedUser.uid}`));

      // Update in Firestore
      try {
        await updateDoc(doc(db, 'users', selectedUser.uid), {
          isBanned: true,
          blockReason: banReason
        });
      } catch {}

      setSelectedUser(null);
    } catch (e) {
      alert('Foydalanuvchini bloklashda xatolik yuz berdi: ' + e);
    }
  };

  const handleUnblockUser = async (user: UserProfile) => {
    try {
      await update(ref(rtdb, `users/${user.uid}`), {
        isBanned: false,
        blockReason: ''
      });

      await remove(ref(rtdb, `bannedUsers/${user.uid}`));

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isBanned: false,
          blockReason: ''
        });
      } catch {}

      alert(`"${user.displayName}" muvaffaqiyatli BAN'dan chiqarildi! Endi saytdan bemalol foydalanishi mumkin.`);
    } catch (e) {
      alert('Foydalanuvchini blokdan chiqarishda xatolik: ' + e);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'blocked') return matchesSearch && u.isBanned;
    if (filterStatus === 'active') return matchesSearch && !u.isBanned;
    return matchesSearch;
  });

  const filteredLeaderboard = leaderboardList.filter((u) =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-[var(--card-bg)] to-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Crown className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-extrabold text-[10px] uppercase tracking-wider">
                VERIFIED OWNER
              </span>
              <span className="text-xs font-mono text-amber-300/80">yuldashivagavharoy@gmail.com</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Owner & Admin Boshqaruv Paneli
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Reytingdagi foydalanuvchilarni tahrirlash, o'chirish, matnlar va tizimni to'liq boshqarish
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Button to Open Content Modal */}
          <button
            onClick={() => setShowContentModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wide"
          >
            <FileText className="w-4 h-4" />
            <span>Matnlar & Tillar Kiratish</span>
          </button>

          <div className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/20">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Reytingdagilar</span>
              <span className="text-lg font-mono font-black text-amber-400">{leaderboardList.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Jami A'zo</span>
              <span className="text-lg font-mono font-black text-white">{usersList.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-[var(--sub-alt)] pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-white border border-[var(--sub-alt)]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>🏆 Reyting Boshqaruvi ({leaderboardList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-white border border-[var(--sub-alt)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Barcha Foydalanuvchilar ({usersList.length})</span>
        </button>

      </div>

      {/* Search & Filter Bar (Only for Leaderboard and Users tabs) */}
      {(
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--sub-color)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Qidiruv (ism, username, email)..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
            />
          </div>

          {activeTab === 'users' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  filterStatus === 'all'
                    ? 'bg-[var(--main-color)] text-white shadow-sm'
                    : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                Barchasi ({usersList.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  filterStatus === 'active'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                Aktiv ({usersList.filter((u) => !u.isBanned).length})
              </button>
              <button
                onClick={() => setFilterStatus('blocked')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  filterStatus === 'blocked'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                Bloklangan ({usersList.filter((u) => u.isBanned).length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: REYTING BOSHQARUVI */}
      {activeTab === 'leaderboard' && (
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--sub-color)] font-mono animate-pulse">
              Reyting ishtirokchilari yuklanmoqda...
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--sub-color)]">
              Reytingda hech kim topilmadi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--sub-alt)]/60 text-[var(--sub-color)] font-bold uppercase tracking-wider border-b border-[var(--sub-alt)]">
                  <tr>
                    <th className="p-4">O'rin</th>
                    <th className="p-4">Foydalanuvchi</th>
                    <th className="p-4">WPM (Tezlik)</th>
                    <th className="p-4">Aniqlik</th>
                    <th className="p-4">Daraja & Unvon</th>
                    <th className="p-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sub-alt)]/40">
                  {filteredLeaderboard.map((u, idx) => (
                    <tr key={u.uid} className="hover:bg-[var(--sub-alt)]/30 transition-colors">
                      <td className="p-4 font-mono font-black">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-extrabold ${
                          idx === 0
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                            : idx === 1
                            ? 'bg-slate-300 text-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 font-black flex items-center justify-center text-amber-400">
                            {u.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-[var(--text-color)] flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                            </div>
                            <span className="text-[10px] text-[var(--sub-color)] font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold">
                        <span className="text-emerald-400 text-sm font-black flex items-center gap-1">
                          <Zap className="w-4 h-4 fill-emerald-400" /> {u.highestWpm} WPM
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-amber-400">
                        {u.highestAccuracy}%
                      </td>

                      <td className="p-4 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                          Lvl {u.level} • {u.rankTitle}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black font-bold text-[11px] border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Natija va ma'lumotlarni tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Tahrirlash</span>
                          </button>

                          <button
                            onClick={() => handleRemoveFromLeaderboard(u)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-[11px] border border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Reytingdan olib tashlash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reytingdan O'chirish</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BARCHA FOYDALANUVCHILAR */}
      {activeTab === 'users' && (
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--sub-color)] font-mono animate-pulse">
              Foydalanuvchilar roʻyxati yuklanmoqda...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--sub-color)]">
              Mos keluvchi foydalanuvchilar topilmadi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--sub-alt)]/60 text-[var(--sub-color)] font-bold uppercase tracking-wider border-b border-[var(--sub-alt)]">
                  <tr>
                    <th className="p-4">Foydalanuvchi</th>
                    <th className="p-4">Reyting & WPM</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Holat</th>
                    <th className="p-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sub-alt)]/40">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-[var(--sub-alt)]/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 font-black flex items-center justify-center text-amber-400">
                            {u.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-[var(--text-color)] flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                              {u.role === 'admin' && (
                                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[9px] font-mono uppercase font-black">
                                  Owner
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--sub-color)] font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" /> {u.highestWpm} WPM
                          </span>
                          <span className="text-[var(--sub-color)]">• Level {u.level}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[var(--sub-color)] truncate max-w-[180px]">
                        {u.email}
                      </td>

                      <td className="p-4">
                        {u.isBanned ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black">
                              <ShieldAlert className="w-3 h-3" /> Bloklangan
                            </span>
                            {u.blockReason && (
                              <p className="text-[10px] text-rose-300 truncate max-w-[200px]" title={u.blockReason}>
                                {u.blockReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black">
                            <CheckCircle className="w-3 h-3" /> Aktiv
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black font-bold text-[11px] border border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Tahrirlash</span>
                          </button>

                          {u.highestWpm > 0 && (
                            <button
                              onClick={() => handleRemoveFromLeaderboard(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white font-bold text-[11px] border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                              title="Reytingdan olib tashlash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {u.isBanned ? (
                            <button
                              onClick={() => handleUnblockUser(u)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-[11px] border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Unban</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-[11px] border border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Bloklash</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}



      {/* EDIT LEADERBOARD / USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wide">
                <Edit3 className="w-5 h-5" />
                <span>Reyting & Profilni Tahrirlash</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Ism (Display Name):</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Username (@tag):</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-emerald-400 block">Reyting WPM (Tezlik):</label>
                <input
                  type="number"
                  value={editWpm}
                  onChange={(e) => setEditWpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-sm text-emerald-400 focus:outline-none focus:border-emerald-400 font-mono font-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-400 block">Aniqlik % (Accuracy):</label>
                <input
                  type="number"
                  value={editAccuracy}
                  onChange={(e) => setEditAccuracy(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-sm text-amber-400 focus:outline-none focus:border-amber-400 font-mono font-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Daraja (Level):</label>
                <input
                  type="number"
                  value={editLevel}
                  onChange={(e) => setEditLevel(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Unvon (Rank Title):</label>
                <input
                  type="text"
                  value={editRankTitle}
                  onChange={(e) => setEditRankTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                "Saqlash" tugmasini bosganingizda foydalanuvchining reyting natijasi va profili birdaniga Realtime bazada yangilanadi.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                onClick={handleSaveUserEdit}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 cursor-pointer hover:opacity-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saqlanmoqda...' : 'Saqlash & Yangilash'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Foydalanuvchini Bloklash</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <p className="font-bold text-white">{selectedUser.displayName}</p>
              <p className="text-slate-400 font-mono">{selectedUser.email}</p>
              <p className="text-amber-400 font-mono">UID: {selectedUser.uid}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Bloklash Sababini Yozing:
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
                placeholder="Misol: Anti-cheat xabardorligi / Avto-kliker bot ishlatilgani sababli..."
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>
                Bloklangan zahoti ushbu foydalanuvchining saytdagi seansi uziladi va bloklash sahifasi koʻrinadi.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                onClick={handleBlockUser}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Tasdiqlash & Bloklash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Content Modal */}
      <OwnerPanelModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        onContentUpdated={() => window.dispatchEvent(new Event('storage'))}
      />
    </div>
  );
};

