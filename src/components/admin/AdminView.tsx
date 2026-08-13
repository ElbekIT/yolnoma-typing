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
  Mail,
  Shield,
  X,
  Crown,
  FileText,
  Globe,
  Plus
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

  // Ban Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState('Nomaʼlum qoida buzilishi / Avto-kliker dastur ishlatilgan.');

  // Owner Content Modal State
  const [showContentModal, setShowContentModal] = useState(false);

  // Fetch users from Firebase Realtime DB & Leaderboard
  useEffect(() => {
    try {
      const usersRef = ref(rtdb, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: UserProfile[] = Object.keys(val).map((uid) => ({
            uid,
            email: val[uid].email || `${uid.slice(0, 8)}@yolnoma.uz`,
            username: val[uid].username || val[uid].displayName || 'Foydalanuvchi',
            displayName: val[uid].displayName || val[uid].username || 'Foydalanuvchi',
            highestWpm: val[uid].highestWpm || 0,
            highestAccuracy: val[uid].highestAccuracy || 98,
            level: val[uid].level || 1,
            rankTitle: val[uid].rankTitle || 'Typing Master',
            xp: val[uid].xp || 250,
            isBanned: !!val[uid].isBanned,
            blockReason: val[uid].blockReason || '',
            createdAt: val[uid].createdAt || Date.now(),
            lastActive: val[uid].lastActive || Date.now(),
            role: val[uid].role || 'user',
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
            pinnedAchievements: [],
            unlockedAchievements: [],
            totalTests: val[uid].totalTests || 0,
            totalTimeTypedSeconds: 0,
            totalWordsTyped: 0,
            totalCharsTyped: 0,
            averageWpm: val[uid].highestWpm || 0,
            currentStreak: 1,
            longestStreak: 1,
            isPublic: true,
            usernameChangesLeft: 2,
            privacy: { profileVisibility: 'public', allowMessages: 'everyone', showOnlineStatus: true, showStats: true, allowFollow: true }
          }));
          setUsersList(list);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Realtime DB fetch error in Admin:', e);
      setLoading(false);
    }
  }, []);

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
              Aynan <strong className="text-amber-400">yuldashivagavharoy@gmail.com</strong> uchun cheksiz matnlar kiritish va foydalanuvchilarni nazorat qilish paneli
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
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Jami A'zo</span>
              <span className="text-lg font-mono font-black text-white">{usersList.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase block">Bloklangan</span>
              <span className="text-lg font-mono font-black text-rose-400">
                {usersList.filter((u) => u.isBanned).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--sub-color)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Qidiruv (nomi, email, username)..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
          />
        </div>

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
      </div>

      {/* Users Table */}
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
                      {u.isBanned ? (
                        <button
                          onClick={() => handleUnblockUser(u)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-[11px] border border-emerald-500/40 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Blokdan Chiqarish</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-[11px] border border-rose-500/40 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Bloklash</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
