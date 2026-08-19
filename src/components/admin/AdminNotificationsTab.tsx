import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Radio,
  MessageSquare,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
  Users,
  User,
  Trash2,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserNotificationItem } from '../../types';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';

interface AdminNotificationsTabProps {
  usersList: UserProfile[];
  preselectedUser?: UserProfile | null;
  onClearPreselectedUser?: () => void;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
  usersList,
  preselectedUser,
  onClearPreselectedUser
}) => {
  const { sendAdminNotification, deleteAdminNotification } = useAuth();

  const [targetType, setTargetType] = useState<'all' | 'specific'>(
    preselectedUser ? 'specific' : 'all'
  );
  const [selectedUid, setSelectedUid] = useState<string>(
    preselectedUser ? preselectedUser.uid : ''
  );
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<UserNotificationItem['type']>('info');

  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sent announcements history
  const [announcementsList, setAnnouncementsList] = useState<UserNotificationItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync preselected user if changes
  useEffect(() => {
    if (preselectedUser) {
      setTargetType('specific');
      setSelectedUid(preselectedUser.uid);
    }
  }, [preselectedUser]);

  // Realtime load global announcements from RTDB
  useEffect(() => {
    const annRef = ref(rtdb, 'global_announcements');
    const unsub = onValue(annRef, (snapshot) => {
      const list: UserNotificationItem[] = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        Object.keys(val).forEach((key) => {
          const item = val[key];
          if (item) {
            list.push({
              id: key,
              title: item.title || 'Eʼlon',
              message: item.message || '',
              timestamp: item.timestamp || Date.now(),
              read: true,
              type: item.type || 'info',
              sender: item.sender || 'Admin (Yolnoma)',
              target: 'all'
            });
          }
        });
      }
      list.sort((a, b) => b.timestamp - a.timestamp);
      setAnnouncementsList(list);
      setLoadingHistory(false);
    });

    return () => unsub();
  }, []);

  const handleApplyTemplate = (
    tmplTitle: string,
    tmplMsg: string,
    tmplType: UserNotificationItem['type']
  ) => {
    setTitle(tmplTitle);
    setMessage(tmplMsg);
    setNotifType(tmplType);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const selectedTargetUser = usersList.find((u) => u.uid === selectedUid);

  const filteredUsers = usersList.filter(
    (u) =>
      u.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Iltimos, xabar sarlavhasini kiriting!');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Iltimos, xabar matnini kiriting!');
      return;
    }
    if (targetType === 'specific' && !selectedUid) {
      setErrorMsg('Iltimos, qabul qiluvchi foydalanuvchini tanlang!');
      return;
    }

    setSending(true);
    try {
      if (targetType === 'all') {
        await sendAdminNotification('all', title.trim(), message.trim(), notifType);
        setSuccessMsg("Barcha foydalanuvchilarga xabar muvaffaqiyatli yuborildi! 🚀");
      } else {
        const targetName = selectedTargetUser ? selectedTargetUser.displayName : 'Foydalanuvchi';
        await sendAdminNotification(selectedUid, title.trim(), message.trim(), notifType, targetName);
        setSuccessMsg(
          `@${selectedTargetUser?.username || 'user'} ga shaxsiy xabarnoma muvaffaqiyatli yuborildi! ✨`
        );
      }

      setTitle('');
      setMessage('');
      if (onClearPreselectedUser) onClearPreselectedUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xabar yuborishda xatolik yuz berdi.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdminNotification(id, 'all');
    } catch (err) {
      console.error('Delete announcement error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--text-color)] tracking-tight">
              Foydalanuvchilarga Habar Yuborish & Eʼlonlar
            </h2>
            <p className="text-xs text-[var(--sub-color)]">
              Admin paneldan to'g'ridan-to'g'ri foydalanuvchilar profiliga real vaqtda xabar yoki umumiy e'lon yuborish
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[var(--sub-alt)] px-3.5 py-2 rounded-2xl border border-[var(--sub-alt)] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[var(--text-color)]">Realtime Habarnoma Tizimi Faol</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Send Message Form */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-3">
            <h3 className="font-black text-sm text-[var(--text-color)] flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--main-color)]" />
              <span>Yangi Xabar Yaratish</span>
            </h3>
            <span className="text-[11px] text-[var(--sub-color)] font-mono">Real-time Push</span>
          </div>

          {/* Target Audience Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-color)] block">
              Kimga yuborilsin?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('all');
                  if (onClearPreselectedUser) onClearPreselectedUser();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                  targetType === 'all'
                    ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/25'
                    : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-transparent hover:border-[var(--sub-color)]/30'
                }`}
              >
                <Users className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-black">Barcha Foydalanuvchilarga</div>
                  <div className={`text-[10px] ${targetType === 'all' ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                    Umumiy e'lon ({usersList.length} ta a'zo)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('specific')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                  targetType === 'specific'
                    ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/25'
                    : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-transparent hover:border-[var(--sub-color)]/30'
                }`}
              >
                <User className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-black">Bitta Foydalanuvchiga</div>
                  <div className={`text-[10px] ${targetType === 'specific' ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                    Shaxsiy to'g'ridan-to'g'ri xabar
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Specific User Selector if chosen */}
          {targetType === 'specific' && (
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] space-y-3 animate-in fade-in">
              <label className="text-xs font-bold text-[var(--text-color)] block flex items-center justify-between">
                <span>Qabul qiluvchi foydalanuvchini tanlang:</span>
                {selectedTargetUser && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Tanlandi: {selectedTargetUser.displayName} (@{selectedTargetUser.username})
                  </span>
                )}
              </label>

              {/* User Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--sub-color)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Foydalanuvchini ism, @username yoki email orqali qidiring..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none focus:border-[var(--main-color)]"
                />
              </div>

              {/* User Dropdown List */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {filteredUsers.slice(0, 15).map((u) => {
                  const isSelected = selectedUid === u.uid;
                  return (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => setSelectedUid(u.uid)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--main-color)] text-white font-bold'
                          : 'bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-6 h-6 rounded-full bg-slate-800 font-black text-[10px] flex items-center justify-center text-amber-400 shrink-0">
                          {u.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold truncate">{u.displayName}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                          @{u.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono">Lvl {u.level || 1}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Templates */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[var(--sub-color)] uppercase tracking-wider block">
              Tayyor Shablonlar (1 ta bosishda to'ldirish):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleApplyTemplate(
                    '⚡ Yangi Turnir & Musobaqa Boshlandi!',
                    'Bugun platformada eng tez yozuvchi foydalanuvchilar oʻrtasida maxsus sovrinli musobaqa boʻlib oʻtmoqda. Ishtirok eting va 1-oʻrinni oling!',
                    'success'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>Turnir Eʼloni</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyTemplate(
                    '🚀 Yangi Imkoniyatlar & Matnlar Qoʻshildi!',
                    'Saytga yangi tillar va qiziqarli hikoyalar qoʻshildi. Sinab koʻring va barmoqlaringiz tezligini oshiring!',
                    'info'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Yangilanish</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyTemplate(
                    '🏆 Tabriklaymiz! Yangi Yutuqqa Eirishdingiz',
                    'Siz platformadagi faolligingiz va yuqori tezligingiz bilan yangi darajaga koʻtarildingiz. Olgʻa!',
                    'achievement'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Tabrik</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyTemplate(
                    '⚠️ Profilingizda Qoidabuzarlik Belgilandi',
                    'Iltimos, yozish jarayonida bot yoki avto-kliker vositalaridan foydalanmang. Aks holda profilingiz avtomatik bloklanadi.',
                    'warning'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Ogohlantirish</span>
              </button>
            </div>
          </div>

          {/* Form inputs */}
          <form onSubmit={handleSend} className="space-y-4">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-color)] block">
                Xabar Sarlavhasi (Title):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: ⚡ Haftalik Reyting G'oliblari E'lon Qilindi!"
                className="w-full p-3 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] font-bold placeholder-[var(--sub-color)] focus:outline-none focus:border-[var(--main-color)] transition-all"
              />
            </div>

            {/* Notification Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-color)] block">
                Xabar Turi / Kategoriya:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setNotifType('info')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    notifType === 'info'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-sm'
                      : 'bg-[var(--sub-alt)]/60 text-[var(--sub-color)] border-transparent'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ℹ️ Maʼlumot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotifType('success')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    notifType === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-sm'
                      : 'bg-[var(--sub-alt)]/60 text-[var(--sub-color)] border-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>🎉 Yutuq / Tabrik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotifType('warning')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    notifType === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-sm'
                      : 'bg-[var(--sub-alt)]/60 text-[var(--sub-color)] border-transparent'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>⚠️ Ogohlantirish</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotifType('achievement')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    notifType === 'achievement'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500 shadow-sm'
                      : 'bg-[var(--sub-alt)]/60 text-[var(--sub-color)] border-transparent'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Maxsus</span>
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-color)]">
                <span>Xabar Matni:</span>
                <span className="text-[10px] text-[var(--sub-color)] font-mono">
                  {message.length} belgi
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Foydalanuvchilarga yetkazilishi kerak bo'lgan xabar yoki e'lon matnini yozing..."
                className="w-full p-3.5 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none focus:border-[var(--main-color)] transition-all leading-relaxed"
              />
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Xabar Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {targetType === 'all'
                      ? 'Barchaga Habarni Yuborish 🚀'
                      : 'Foydalanuvchiga Yuborish ✉️'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Preview & Sent History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-2.5">
              <span className="text-xs font-black text-[var(--text-color)] flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[var(--main-color)]" />
                <span>Foydalanuvchi Ekrani (Jonli Ko'rinish):</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                Live Preview
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--main-color)]/40 shadow-md space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-extrabold text-xs text-[var(--text-color)]">
                    {title || 'Xabar Sarlavhasi (Bu yerda koʻrinadi)'}
                  </span>
                </div>
                <span className="text-[9px] text-[var(--sub-color)] font-mono">Hozirgina</span>
              </div>

              <p className="text-[11px] text-[var(--text-color)]/90 leading-relaxed whitespace-pre-wrap pl-4">
                {message ||
                  'Foydalanuvchi profiliga bosib, "Habarnomalar" boʻlimini ochganda siz yozgan xabar xuddi shu tarzda qizil bildirishnoma bilan paydo boʻladi.'}
              </p>

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-[var(--sub-alt)]/60 pl-4">
                <span className="font-semibold text-[var(--main-color)]">Admin (Yolnoma)</span>
                <span className="text-emerald-500 font-bold">O'qildi deb belgilash ✓</span>
              </div>
            </div>
          </div>

          {/* Active Global Announcements History */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-2.5">
              <h3 className="text-xs font-black text-[var(--text-color)] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Faol Eʼlonlar Tarixi ({announcementsList.length})</span>
              </h3>
              <span className="text-[10px] text-[var(--sub-color)] font-mono">Barchaga ochiq</span>
            </div>

            {loadingHistory ? (
              <div className="py-6 text-center text-xs text-[var(--sub-color)] font-mono animate-pulse">
                Eʼlonlar yuklanmoqda...
              </div>
            ) : announcementsList.length === 0 ? (
              <p className="py-6 text-center text-xs text-[var(--sub-color)]">
                Hozircha faol umumiy eʼlonlar mavjud emas
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {announcementsList.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-2xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] space-y-1.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-xs text-[var(--text-color)]">{ann.title}</h4>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        disabled={deletingId === ann.id}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Eʼlonni bekor qilish / o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[var(--sub-color)] line-clamp-2 leading-relaxed">
                      {ann.message}
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-mono text-[var(--sub-color)] pt-1 border-t border-[var(--sub-alt)]/60">
                      <span>{new Date(ann.timestamp).toLocaleString()}</span>
                      <span className="text-amber-400 uppercase font-bold">{ann.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
