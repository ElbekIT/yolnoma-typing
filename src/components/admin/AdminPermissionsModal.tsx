import React, { useState, useEffect } from 'react';
import {
  Shield,
  Crown,
  Check,
  X,
  Lock,
  Trophy,
  UserX,
  Bell,
  Mail,
  Server,
  Wrench,
  Users,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { AdminPermissions, UserProfile } from '../../types';
import { getAdminToken } from '../../utils/ownerAuth';

interface AdminPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccess: () => void;
  currentUserEmail?: string | null;
}

const ROOT_OWNER_EMAIL = 'yuldashivagavharoy@gmail.com';

export const AdminPermissionsModal: React.FC<AdminPermissionsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  currentUserEmail
}) => {
  const isTargetRootOwner = Boolean(
    user?.email && (
      user.email.toLowerCase() === ROOT_OWNER_EMAIL ||
      user.email.toLowerCase().startsWith('yuldashivagavharoy')
    )
  );

  const [customTitle, setCustomTitle] = useState(user?.customAdminTitle || 'Administrator');
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canManageLeaderboard: user?.adminPermissions?.canManageLeaderboard ?? true,
    canBlockUsers: user?.adminPermissions?.canBlockUsers ?? true,
    canSendNotifications: user?.adminPermissions?.canSendNotifications ?? true,
    canManageInbox: user?.adminPermissions?.canManageInbox ?? true,
    canViewServer: user?.adminPermissions?.canViewServer ?? true,
    canManageMaintenance: user?.adminPermissions?.canManageMaintenance ?? false,
    canManageAdmins: user?.adminPermissions?.canManageAdmins ?? false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setCustomTitle(user.customAdminTitle || (isTargetRootOwner ? '👑 Asosiy Bosh Administrator' : 'Administrator'));
      setPermissions({
        canManageLeaderboard: isTargetRootOwner ? true : (user.adminPermissions?.canManageLeaderboard ?? true),
        canBlockUsers: isTargetRootOwner ? true : (user.adminPermissions?.canBlockUsers ?? true),
        canSendNotifications: isTargetRootOwner ? true : (user.adminPermissions?.canSendNotifications ?? true),
        canManageInbox: isTargetRootOwner ? true : (user.adminPermissions?.canManageInbox ?? true),
        canViewServer: isTargetRootOwner ? true : (user.adminPermissions?.canViewServer ?? true),
        canManageMaintenance: isTargetRootOwner ? true : (user.adminPermissions?.canManageMaintenance ?? false),
        canManageAdmins: isTargetRootOwner ? true : (user.adminPermissions?.canManageAdmins ?? false)
      });
      setFeedback(null);
    }
  }, [user, isTargetRootOwner]);

  if (!isOpen || !user) return null;

  const togglePermission = (key: keyof AdminPermissions) => {
    if (isTargetRootOwner) return; // Root owner cannot be modified
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTargetRootOwner) {
      setFeedback({
        type: 'error',
        text: "Asosiy Bosh Administrator (yuldashivagavharoy@gmail.com) daxlsiz! Uni oʻzgartirib boʻlmaydi."
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const token = getAdminToken();

    try {
      const res = await fetch('/api/admin/promote-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          customTitle: customTitle.trim() || 'Administrator',
          permissions,
          promotedBy: currentUserEmail || 'Root Owner'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Admin qilishda xatolik yuz berdi');
      }

      setFeedback({
        type: 'success',
        text: `✅ ${user.displayName || user.username} muvaffaqiyatli Admin etib tayinlandi!`
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Xatolik yuz berdi'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemote = async () => {
    if (isTargetRootOwner) {
      alert("Asosiy Bosh Administrator (yuldashivagavharoy@gmail.com) daxlsiz! Uni chiqarib boʻlmaydi.");
      return;
    }

    if (!window.confirm(`${user.displayName || user.username} ni adminlikdan chiqarmoqchimisiz?`)) {
      return;
    }

    setIsSubmitting(true);
    const token = getAdminToken();

    try {
      const res = await fetch('/api/admin/demote-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          demotedBy: currentUserEmail || 'Root Owner'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Adminlikdan chiqarishda xatolik');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Xatolik yuz berdi'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const permissionItems: Array<{
    key: keyof AdminPermissions;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }> = [
    {
      key: 'canManageLeaderboard',
      title: 'Reyting & Natijalarni Boshqarish',
      desc: 'Foydalanuvchilar natijalari, WPM va reyting ballarini tahrirlash yoki oʻchirish',
      icon: Trophy,
      accentColor: 'text-amber-400'
    },
    {
      key: 'canBlockUsers',
      title: 'Foydalanuvchilarni Bloklash & Unban',
      desc: 'Qoidabuzarlarni jazolash, bloklash sababini kiritish va blokdan chiqarish',
      icon: UserX,
      accentColor: 'text-rose-400'
    },
    {
      key: 'canSendNotifications',
      title: 'Xabarnomalar & Eʼlonlar Yuborish',
      desc: 'Barcha foydalanuvchilarga yoki shaxsiy hisoblarga tizim xabarlarini yoʻllash',
      icon: Bell,
      accentColor: 'text-cyan-400'
    },
    {
      key: 'canManageInbox',
      title: 'Murojaatlar (Inbox) bilan Ishlash',
      desc: 'Saytdan kelgan taklif, shikoyat va apellyatsiyalarni koʻrish va javob berish',
      icon: Mail,
      accentColor: 'text-indigo-400'
    },
    {
      key: 'canViewServer',
      title: 'DDoS/DRDoS Qalqoni & Xavfsizlik',
      desc: 'Server statistikasi, DDoS/DRDoS hujumlar jurnali va IP bloklash tizimini boshqarish',
      icon: Server,
      accentColor: 'text-emerald-400'
    },
    {
      key: 'canManageMaintenance',
      title: 'Sayt Yangilanish (Maintenance) Rejimi',
      desc: 'Saytni texnik ishlar uchun hamma foydalanuvchilarga yopish va qayta ochish',
      icon: Wrench,
      accentColor: 'text-purple-400'
    },
    {
      key: 'canManageAdmins',
      title: 'Yangi Adminlarni Tayinlash',
      desc: 'Boshqa foydalanuvchilarni admin qilish va ularning ruxsatlarini boshqarish',
      icon: Users,
      accentColor: 'text-blue-400'
    }
  ];

  return (
    <div
      id="modal-admin-permissions-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="modal-admin-permissions-content"
        className="max-w-2xl w-full bg-[#0d1222] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-950/50 relative text-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Admin Ruxsatlarini Sozlash</span>
                {isTargetRootOwner && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    👑 ROOT OWNER
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Moslashuvchan nozik ruxsatlar boshqaruvi
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-permissions-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSave} className="overflow-y-auto pr-1 space-y-5 my-4 flex-1">
          {/* Target User Info Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{user.displayName || user.username}</span>
                <span className="text-xs text-cyan-400 font-mono">(@{user.username})</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Joriy Rol:</span>
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                isTargetRootOwner
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : user.role === 'admin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {isTargetRootOwner ? '👑 Bosh Owner' : user.role === 'admin' ? '🛡️ Admin' : 'Oddiy Foydalanuvchi'}
              </span>
            </div>
          </div>

          {/* Root Owner Protection Banner */}
          {isTargetRootOwner && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-300 mb-0.5">Daxlsiz Bosh Administrator!</strong>
                Ushbu akkaunt platforma asoschisi (Root Owner) hisoblanadi. Hech bir administrator uni lavozimidan tushira olmaydi, ruxsatlarini olib tashlay olmaydi yoki bloklay olmaydi.
              </div>
            </div>
          )}

          {/* Custom Admin Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Maxsus Unvoni (Custom Title):</span>
            </label>
            <input
              type="text"
              id="input-admin-custom-title"
              disabled={isTargetRootOwner}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Masalan: Reyting Nazoratchisi, Katta Admin, Texnik Ekspert..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400">
              Ushbu unvon admin panel va xabarlarda foydalanuvchi ismining yonida koʻrinadi.
            </p>
          </div>

          {/* Permissions Matrix (Granular access toggles) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Admin Vakolatlari (Ruxsatlar):</span>
              <span className="text-[11px] text-cyan-400 font-mono">
                {Object.values(permissions).filter(Boolean).length} / {permissionItems.length} faol
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {permissionItems.map((item) => {
                const isEnabled = permissions[item.key];
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    id={`perm-item-${item.key}`}
                    onClick={() => togglePermission(item.key)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none ${
                      isTargetRootOwner
                        ? 'bg-slate-900/50 border-slate-800 cursor-not-allowed'
                        : isEnabled
                        ? 'bg-cyan-950/20 border-cyan-500/50 hover:bg-cyan-950/30 cursor-pointer'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${item.accentColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{item.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                        isEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            {user.role === 'admin' && !isTargetRootOwner && (
              <button
                type="button"
                id="btn-demote-admin"
                disabled={isSubmitting}
                onClick={handleDemote}
                className="py-2.5 px-4 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>Adminlikdan Olish</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                id="btn-cancel-permissions"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              {!isTargetRootOwner && (
                <button
                  type="submit"
                  id="btn-save-admin-permissions"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saqlanmoqda...' : user.role === 'admin' ? 'Ruxsatlarni Saqlash' : 'Admin Qilish'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
