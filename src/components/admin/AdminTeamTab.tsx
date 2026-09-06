import React, { useState, useEffect } from 'react';
import {
  Shield,
  Crown,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Trophy,
  UserX,
  Bell,
  Mail,
  Server,
  Wrench,
  Users,
  ShieldCheck,
  AlertTriangle,
  Check,
  ShieldAlert
} from 'lucide-react';
import { AdminPermissions, UserProfile } from '../../types';
import { AdminPermissionsModal } from './AdminPermissionsModal';
import { getAdminToken } from '../../utils/ownerAuth';
import { ref, update } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { rtdb, db } from '../../config/firebase';

interface AdminTeamTabProps {
  usersList: UserProfile[];
  currentUserEmail?: string | null;
  onRefresh: () => void;
}

const ROOT_OWNER_EMAIL = 'yuldashivagavharoy@gmail.com';

export const AdminTeamTab: React.FC<AdminTeamTabProps> = ({
  usersList,
  currentUserEmail,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<UserProfile | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [userToPromoteSearch, setUserToPromoteSearch] = useState('');
  const [demoteTargetUser, setDemoteTargetUser] = useState<UserProfile | null>(null);
  const [isDemoting, setIsDemoting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Find Root Owner in list or build virtual root owner
  const rootOwnerUser = usersList.find(
    (u) =>
      u.email.toLowerCase() === ROOT_OWNER_EMAIL ||
      u.email.toLowerCase().startsWith('yuldashivagavharoy')
  ) || {
    uid: 'root_owner_gavharoy',
    email: ROOT_OWNER_EMAIL,
    username: 'gavharoy',
    displayName: 'Gavharoy Yuldashiva',
    role: 'owner' as const,
    customAdminTitle: '👑 Asosiy Bosh Administrator',
    createdAt: 1700000000000,
    lastActive: Date.now(),
    xp: 999999,
    level: 99,
    rankTitle: 'Grandmaster Owner',
    usernameChangesLeft: 10,
    privacy: { profilePublic: true, showStats: true, showWpm: true, allowChallenges: true },
    followers: [],
    following: [],
    followersCount: 120,
    followingCount: 1,
    pinnedAchievements: [],
    unlockedAchievements: [],
    totalTests: 500,
    totalTimeTypedSeconds: 50000,
    adminPermissions: {
      canManageLeaderboard: true,
      canBlockUsers: true,
      canSendNotifications: true,
      canManageInbox: true,
      canViewServer: true,
      canManageMaintenance: true,
      canManageAdmins: true
    }
  };

  // Filter appointed sub-admins
  const subAdmins = usersList.filter(
    (u) =>
      u.role === 'admin' &&
      u.email.toLowerCase() !== ROOT_OWNER_EMAIL &&
      !u.email.toLowerCase().startsWith('yuldashivagavharoy')
  );

  // Candidates for promotion (regular users)
  const candidateUsers = usersList.filter(
    (u) =>
      u.role !== 'admin' &&
      u.role !== 'owner' &&
      u.email.toLowerCase() !== ROOT_OWNER_EMAIL &&
      !u.email.toLowerCase().startsWith('yuldashivagavharoy') &&
      (u.username.toLowerCase().includes(userToPromoteSearch.toLowerCase()) ||
       u.displayName.toLowerCase().includes(userToPromoteSearch.toLowerCase()) ||
       u.email.toLowerCase().includes(userToPromoteSearch.toLowerCase()))
  ).slice(0, 10);

  const permissionLabels: Record<keyof AdminPermissions, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    canManageLeaderboard: { label: 'Reyting', icon: Trophy },
    canBlockUsers: { label: 'Bloklash', icon: UserX },
    canSendNotifications: { label: 'Xabarnomalar', icon: Bell },
    canManageInbox: { label: 'Inbox', icon: Mail },
    canViewServer: { label: 'Server & DDoS', icon: Server },
    canManageMaintenance: { label: 'Maintenance', icon: Wrench },
    canManageAdmins: { label: 'Adminlar', icon: Users }
  };

  const handleExecuteDemote = async () => {
    if (!demoteTargetUser) return;
    if (
      demoteTargetUser.email.toLowerCase() === ROOT_OWNER_EMAIL ||
      demoteTargetUser.email.toLowerCase().startsWith('yuldashivagavharoy')
    ) {
      alert('Asosiy Bosh Administrator daxlsiz! Uni chiqarib boʻlmaydi.');
      setDemoteTargetUser(null);
      return;
    }

    setIsDemoting(true);
    try {
      // 1. Direct Firebase Realtime Database Demote
      await update(ref(rtdb, `users/${demoteTargetUser.uid}`), {
        role: 'user',
        customAdminTitle: null,
        adminPermissions: null
      });

      // 2. Direct Firestore Demote
      try {
        const userDocRef = doc(db, 'users', demoteTargetUser.uid);
        await updateDoc(userDocRef, {
          role: 'user',
          customAdminTitle: null,
          adminPermissions: null
        });
      } catch {}

      // 3. Server-side session invalidation & memory deletion
      try {
        const token = getAdminToken();
        await fetch('/api/admin/demote-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'x-user-email': currentUserEmail || ROOT_OWNER_EMAIL
          },
          credentials: 'include',
          body: JSON.stringify({
            uid: demoteTargetUser.uid,
            email: demoteTargetUser.email || (demoteTargetUser.username ? `${demoteTargetUser.username}@yolnoma.uz` : ''),
            username: demoteTargetUser.username,
            demotedBy: currentUserEmail || 'Root Owner'
          })
        });
      } catch {}

      setFeedback({
        type: 'success',
        text: `✅ ${demoteTargetUser.displayName || demoteTargetUser.username} adminlikdan chiqarildi! U endi Admin Panelga kira olmaydi.`
      });

      setDemoteTargetUser(null);
      onRefresh();

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: `Xatolik yuz berdi: ${err?.message || 'Qayta urinib koʻring'}`
      });
    } finally {
      setIsDemoting(false);
    }
  };

  return (
    <div id="admin-team-tab" className="space-y-6 animate-in fade-in">
      {/* Feedback Notification */}
      {feedback && (
        <div
          id="admin-team-feedback"
          className={`p-4 rounded-2xl flex items-center gap-3 border text-xs font-bold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-auto text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Administratorlar va Vakolatlar Boshqaruvi</span>
              </h2>
              <p className="text-xs text-[var(--sub-color)] mt-0.5">
                Barcha tayinlangan adminlarni koʻrish, ruxsatlarini boshqarish va kerak boʻlganda adminlikdan chiqarish
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          id="btn-open-promote-modal"
          onClick={() => setIsPromoteModalOpen(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yangi Admin Tayinlash</span>
        </button>
      </div>

      {/* Roster Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Platforma Asosiy Rahbariyati</span>
        </h3>

        {/* 1. ROOT OWNER CARD (IMMUNE) */}
        <div
          id="root-owner-card"
          className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 border-2 border-amber-500/50 shadow-xl shadow-amber-950/30 relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30 shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-amber-400 font-black text-xl">
                  👑
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-base font-black text-white">
                    {rootOwnerUser.displayName}
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    ASOSIY BOSH OWNER (DAXLSIZ)
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-3 flex-wrap">
                  <span>@{rootOwnerUser.username}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-300/90">{ROOT_OWNER_EMAIL}</span>
                </div>
              </div>
            </div>

            {/* Immunity Status Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/50 border border-amber-500/40 text-xs font-mono text-amber-200 shrink-0">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Daxlsiz: Hech kim chiqara olmaydi</span>
            </div>
          </div>

          {/* Root Owner Permissions - All Enabled */}
          <div className="mt-5 pt-4 border-t border-amber-500/20">
            <span className="text-[11px] font-mono text-amber-400/80 block uppercase tracking-wider mb-2">
              Toʻliq Mutlaq Vakolatlar (Barcha 7 ta ruxsat 100% ochiq):
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(permissionLabels).map(([key, item]) => {
                const Icon = item.icon;
                return (
                  <span
                    key={key}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.label}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. SUB-ADMINS SECTION */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Tayinlangan Administratorlar ({subAdmins.length})</span>
            </h3>

            {subAdmins.length > 0 && (
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Adminlarni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {subAdmins.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-slate-800 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-bold">Hozircha qoʻshimcha sub-admin tayinlanmagan.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Yuqoridagi &ldquo;Yangi Admin Tayinlash&rdquo; tugmasi orqali istalgan faol foydalanuvchini moderator yoki admin etib tayinlab, unga oʻzingiz istagan ruxsatlarni berishingiz mumkin.
              </p>
              <button
                type="button"
                id="btn-add-first-admin"
                onClick={() => setIsPromoteModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Birinchi Adminni Tayinlash</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subAdmins
                .filter(
                  (a) =>
                    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((admin) => {
                  const perms = admin.adminPermissions || {
                    canManageLeaderboard: true,
                    canBlockUsers: true,
                    canSendNotifications: true,
                    canManageInbox: true,
                    canViewServer: false,
                    canManageMaintenance: false,
                    canManageAdmins: false
                  };

                  return (
                    <div
                      key={admin.uid}
                      id={`sub-admin-card-${admin.uid}`}
                      className="p-5 rounded-3xl bg-[var(--card-bg)] border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-4 shadow-lg shadow-black/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
                            {admin.displayName.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>{admin.displayName}</span>
                              <span className="text-xs text-cyan-400 font-mono">(@{admin.username})</span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{admin.email}</div>
                            {admin.customAdminTitle && (
                              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
                                {admin.customAdminTitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id={`btn-edit-perms-${admin.uid}`}
                            onClick={() => setSelectedUserForPerms(admin)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                            title="Ruxsatlarni Tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Ruxsatlar</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-demote-admin-${admin.uid}`}
                            onClick={() => setDemoteTargetUser(admin)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                            title="Admindan Chiqarish"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                            <span>Admindan Chiqarish</span>
                          </button>
                        </div>
                      </div>

                      {/* Enabled Permissions Badges */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                          <span>Berilgan Ruxsatlar:</span>
                          <span className="text-cyan-400">
                            {Object.values(perms).filter(Boolean).length} / 7
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(permissionLabels).map(([key, item]) => {
                            const isAllowed = Boolean((perms as any)[key]);
                            const Icon = item.icon;
                            if (!isAllowed) return null;

                            return (
                              <span
                                key={key}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-slate-300 text-[11px] font-medium flex items-center gap-1"
                              >
                                <Icon className="w-3 h-3 text-cyan-400" />
                                <span>{item.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* PROMOTE CANDIDATES SELECTION MODAL */}
      {isPromoteModalOpen && (
        <div
          id="modal-select-candidate-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            id="modal-select-candidate-content"
            className="max-w-xl w-full bg-[#0d1222] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-950/50 relative text-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Yangi Admin Tanlash</h3>
                  <p className="text-xs text-slate-400">Foydalanuvchini qidirib toping va admin sifatida tayinlang</p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-candidate-modal"
                onClick={() => setIsPromoteModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-search-candidate"
                placeholder="Ismi, username yoki email boʻyicha qidiring..."
                value={userToPromoteSearch}
                onChange={(e) => setUserToPromoteSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Results list */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {candidateUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Foydalanuvchi topilmadi
                </div>
              ) : (
                candidateUsers.map((cand) => (
                  <div
                    key={cand.uid}
                    id={`cand-user-${cand.uid}`}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{cand.displayName || cand.username}</span>
                        <span className="text-cyan-400 font-mono">(@{cand.username})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{cand.email}</div>
                    </div>

                    <button
                      type="button"
                      id={`btn-choose-cand-${cand.uid}`}
                      onClick={() => {
                        setIsPromoteModalOpen(false);
                        setSelectedUserForPerms(cand);
                      }}
                      className="py-1.5 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      Admin Qilish
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEMOTE CONFIRMATION MODAL */}
      {demoteTargetUser && (
        <div
          id="modal-confirm-demote-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            id="modal-confirm-demote-card"
            className="max-w-md w-full bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl shadow-rose-950/60 relative text-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-400 font-extrabold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Adminlikdan Chiqarish</span>
              </div>
              <button
                type="button"
                id="btn-close-demote-modal"
                disabled={isDemoting}
                onClick={() => setDemoteTargetUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="text-white font-bold text-sm">
                {demoteTargetUser.displayName || demoteTargetUser.username}
              </div>
              <div className="text-cyan-400 font-mono">
                @{demoteTargetUser.username}
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                {demoteTargetUser.email}
              </div>
              {demoteTargetUser.customAdminTitle && (
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
                  {demoteTargetUser.customAdminTitle}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Muhim Ogohlantirish:</span>
              </div>
              <p className="leading-relaxed">
                Ushbu foydalanuvchi barcha maʼmuriy huquqlardan va Admin Paneldan butunlay mahrum etiladi. Uning roli oddiy foydalanuvchiga qaytariladi va seansi darhol toʻxtatiladi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-demote"
                disabled={isDemoting}
                onClick={() => setDemoteTargetUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Bekor Qilish
              </button>

              <button
                type="button"
                id="btn-confirm-demote"
                disabled={isDemoting}
                onClick={handleExecuteDemote}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDemoting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Chiqarilmoqda...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Ha, Admindan Chiqarilsin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSIONS MODAL */}
      <AdminPermissionsModal
        isOpen={Boolean(selectedUserForPerms)}
        onClose={() => setSelectedUserForPerms(null)}
        user={selectedUserForPerms}
        onSuccess={() => {
          setSelectedUserForPerms(null);
          onRefresh();
        }}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
};
