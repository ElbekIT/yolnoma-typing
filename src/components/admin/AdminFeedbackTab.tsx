import React, { useState, useEffect } from 'react';
import {
  MessageSquareMore,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Star,
  Send,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Zap,
  Crown,
  RefreshCw,
  MessageCircle,
  CornerDownRight,
  Flame,
  Award,
  Globe
} from 'lucide-react';
import { rtdb } from '../../config/firebase';
import { ref, onValue, remove, update, get } from 'firebase/database';
import { SiteFeedbackItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getAdminToken } from '../../utils/ownerAuth';

interface AdminFeedbackTabProps {
  onRefreshStats?: () => void;
}

export const AdminFeedbackTab: React.FC<AdminFeedbackTabProps> = () => {
  const { sendAdminNotification, user: currentAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState<SiteFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showFullEmails, setShowFullEmails] = useState(false);

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState<SiteFeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  // Purge / cleaning state
  const [isPurging, setIsPurging] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);

  const maskEmail = (email?: string) => {
    if (!email) return 'Nomaʼlum email';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const maskedName = name.length <= 2 ? name + '***' : name.slice(0, 2) + '***' + name.slice(-1);
    return `${maskedName}@${parts[1]}`;
  };

  // Fetch feedbacks from both Backend and Firebase RTDB
  const fetchFeedbacks = async () => {
    const token = getAdminToken();
    let backendFeedbacks: SiteFeedbackItem[] = [];

    if (token) {
      try {
        const res = await fetch('/api/admin/feedbacks', {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-email': currentAdmin?.email || 'yuldashivagavharoy@gmail.com'
          },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.feedbacks)) {
            backendFeedbacks = data.feedbacks;
          }
        }
      } catch (err) {
        console.warn('Backend feedbacks fetch warning:', err);
      }
    }

    // Also listen to Firebase RTDB node
    if (rtdb) {
      try {
        const feedbackRef = ref(rtdb, 'site_feedbacks');
        const snapshot = await get(feedbackRef);
        let rtdbList: SiteFeedbackItem[] = [];
        if (snapshot.exists()) {
          const val = snapshot.val();
          const now = Date.now();
          rtdbList = Object.keys(val).map((k) => ({
            id: k,
            ...val[k]
          }));

          // Auto purge any feedback where now > expiresAt
          rtdbList.forEach((item) => {
            if (item.expiresAt && now > item.expiresAt) {
              remove(ref(rtdb, `site_feedbacks/${item.id}`)).catch(() => {});
            }
          });
        }

        // Merge backend + rtdb
        const map = new Map<string, SiteFeedbackItem>();
        backendFeedbacks.forEach((f) => map.set(f.id, f));
        rtdbList.forEach((f) => {
          if (!map.has(f.id)) map.set(f.id, f);
        });

        const merged = Array.from(map.values())
          .filter((f) => !f.expiresAt || f.expiresAt > Date.now())
          .sort((a, b) => b.createdAt - a.createdAt);

        setFeedbacks(merged);
        setLoading(false);
        return;
      } catch (err) {
        // Fallback to backend list
      }
    }

    setFeedbacks(backendFeedbacks);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();

    // Setup RTDB live listener
    if (rtdb) {
      const feedbackRef = ref(rtdb, 'site_feedbacks');
      const unsubscribe = onValue(feedbackRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SiteFeedbackItem[] = Object.keys(val).map((k) => ({
            id: k,
            ...val[k]
          }));
          setFeedbacks((prev) => {
            const map = new Map<string, SiteFeedbackItem>();
            prev.forEach((p) => map.set(p.id, p));
            list.forEach((l) => map.set(l.id, l));
            return Array.from(map.values())
              .filter((f) => !f.expiresAt || f.expiresAt > Date.now())
              .sort((a, b) => b.createdAt - a.createdAt);
          });
        }
      });
      return () => unsubscribe();
    }
  }, [currentAdmin?.email]);

  // Purge expired feedbacks manually
  const handlePurgeExpired = async () => {
    setIsPurging(true);
    const token = getAdminToken();
    try {
      if (token) {
        await fetch('/api/admin/feedbacks/purge-expired', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-email': currentAdmin?.email || 'yuldashivagavharoy@gmail.com'
          },
          credentials: 'include'
        });
      }

      // Also clean up RTDB expired
      if (rtdb) {
        const feedbackRef = ref(rtdb, 'site_feedbacks');
        const snap = await get(feedbackRef);
        if (snap.exists()) {
          const val = snap.val();
          const now = Date.now();
          for (const key of Object.keys(val)) {
            if (val[key].expiresAt && now > val[key].expiresAt) {
              await remove(ref(rtdb, `site_feedbacks/${key}`)).catch(() => {});
            }
          }
        }
      }

      await fetchFeedbacks();
      setPurgeNotice('24 soatdan oshgan eskirgan fikrlar muvaffaqiyatli tozalandi!');
      setTimeout(() => setPurgeNotice(null), 3000);
    } catch (err: any) {
      alert('Tozalashda xatolik: ' + err?.message);
    } finally {
      setIsPurging(false);
    }
  };

  // Toggle Read Status
  const handleToggleRead = async (item: SiteFeedbackItem) => {
    const token = getAdminToken();
    try {
      if (token) {
        await fetch(`/api/admin/feedbacks/${item.id}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-email': currentAdmin?.email || 'yuldashivagavharoy@gmail.com'
          },
          credentials: 'include'
        });
      }

      if (rtdb) {
        await update(ref(rtdb, `site_feedbacks/${item.id}`), {
          isRead: !item.isRead,
          status: !item.isRead ? 'reviewed' : 'active'
        });
      }

      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, isRead: !f.isRead, status: !f.isRead ? 'reviewed' : 'active' }
            : f
        )
      );
    } catch (err) {
      console.error('Error toggling read status:', err);
    }
  };

  // Delete Feedback
  const handleDelete = async (item: SiteFeedbackItem) => {
    if (!window.confirm(`"${item.userName}" tomonidan qoldirilgan fikrni o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    const token = getAdminToken();
    try {
      if (token) {
        await fetch(`/api/admin/feedbacks/${item.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-email': currentAdmin?.email || 'yuldashivagavharoy@gmail.com'
          },
          credentials: 'include'
        });
      }

      if (rtdb) {
        await remove(ref(rtdb, `site_feedbacks/${item.id}`));
      }

      setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
    } catch (err) {
      alert('O\'chirishda xatolik: ' + err);
    }
  };

  // Send Reply to User
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;

    setIsSendingReply(true);
    const token = getAdminToken();
    const adminName = currentAdmin?.displayName || currentAdmin?.email || 'Admin (Yolnoma)';

    try {
      // 1. Send system notification to user profile if user has UID
      if (replyTarget.userId && !replyTarget.userId.startsWith('guest_')) {
        await sendAdminNotification(
          'Sayt haqidagi fikringizga Admin javobi! 💬',
          replyText.trim(),
          'info',
          replyTarget.userId,
          replyTarget.userName
        );
      }

      // 2. Call backend reply endpoint
      if (token) {
        await fetch('/api/admin/feedbacks/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-user-email': currentAdmin?.email || 'yuldashivagavharoy@gmail.com'
          },
          credentials: 'include',
          body: JSON.stringify({
            feedbackId: replyTarget.id,
            replyText: replyText.trim(),
            adminName
          })
        });
      }

      // 3. Update in RTDB
      if (rtdb) {
        await update(ref(rtdb, `site_feedbacks/${replyTarget.id}`), {
          isRead: true,
          status: 'replied',
          replyText: replyText.trim(),
          repliedAt: Date.now(),
          repliedBy: adminName
        });
      }

      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === replyTarget.id
            ? {
                ...f,
                isRead: true,
                status: 'replied',
                replyText: replyText.trim(),
                repliedAt: Date.now(),
                repliedBy: adminName
              }
            : f
        )
      );

      setReplySuccess(true);
      setTimeout(() => {
        setReplySuccess(false);
        setReplyTarget(null);
        setReplyText('');
      }, 1500);
    } catch (err: any) {
      alert('Javob yuborishda xatolik: ' + err?.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Calculations for stats
  const totalCount = feedbacks.length;
  const unreadCount = feedbacks.filter((f) => !f.isRead).length;
  const averageRating = totalCount > 0
    ? (feedbacks.reduce((acc, cur) => acc + (cur.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';

  // Filtered feedbacks
  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchSearch =
      searchTerm === '' ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchRating = filterRating === 'all' || item.rating === filterRating;

    return matchSearch && matchCategory && matchRating;
  });

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] block">Jami Fikrlar</span>
            <span className="text-2xl font-black text-[var(--text-color)]">{totalCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <MessageSquareMore className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] block">Yangi / O'qilmagan</span>
            <span className="text-2xl font-black text-rose-400">{unreadCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] block">O'rtacha Baho</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-400">{averageRating}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] block">Avto-Tozalash</span>
            <span className="text-xs font-black text-emerald-400 block mt-1">24 Soatlik Sikl</span>
          </div>
          <button
            onClick={handlePurgeExpired}
            disabled={isPurging}
            title="Eskirgan fikrlarni qo'lda tozalash"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isPurging ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {purgeNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{purgeNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Foydalanuvchi, email yoki fikr bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-white focus:outline-none"
          >
            <option value="all">Barcha Turlar</option>
            <option value="fikr">⭐ Fikr</option>
            <option value="taklif">💡 Taklif</option>
            <option value="xato">🛠️ Xatolik</option>
            <option value="dizayn">🎨 Dizayn</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-white focus:outline-none"
          >
            <option value="all">Barcha Baholar</option>
            <option value="5">5 Yulduz (A'lo)</option>
            <option value="4">4 Yulduz</option>
            <option value="3">3 Yulduz</option>
            <option value="2">2 Yulduz</option>
            <option value="1">1 Yulduz</option>
          </select>

          {/* Email toggle */}
          <button
            onClick={() => setShowFullEmails(!showFullEmails)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            {showFullEmails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFullEmails ? 'Emaillarni Yashirish' : 'To\'liq Email'}</span>
          </button>
        </div>
      </div>

      {/* Feedbacks List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-medium">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
          Foydalanuvchilar fikrlari yuklanmoqda...
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2">
          <MessageSquareMore className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-[var(--text-color)]">Hozircha faol fikrlar mavjud emas</h4>
          <p className="text-xs text-[var(--sub-color)]">
            Foydalanuvchilar sayt haqida fikr bildirganda, ular to'liq profil ma'lumotlari bilan shu yerda paydo bo'ladi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFeedbacks.map((item) => {
            const timeLeftMs = Math.max(0, (item.expiresAt || item.createdAt + 86400000) - Date.now());
            const hoursLeft = Math.floor(timeLeftMs / 3600000);
            const minsLeft = Math.floor((timeLeftMs % 3600000) / 60000);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-[var(--card-bg)] border transition-all duration-200 relative overflow-hidden ${
                  !item.isRead
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'border-[var(--sub-alt)]'
                }`}
              >
                {/* Status Indicator Bar */}
                {!item.isRead && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300" />
                )}

                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  {/* User Profile Information Block */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-black flex items-center justify-center text-base shadow-md overflow-hidden shrink-0 mt-0.5">
                      {item.userAvatar ? (
                        <img src={item.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{item.userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-[var(--text-color)]">
                          {item.userName}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                            item.userRole === 'owner' || item.userRole === 'admin'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          }`}
                        >
                          {item.userRole === 'owner' ? '👑 Owner' : item.userRole === 'admin' ? '🛡️ Admin' : '👤 Foydalanuvchi'}
                        </span>

                        {item.userRank && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                            {item.userRank}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[var(--sub-color)] mt-1 flex-wrap">
                        <span>
                          {showFullEmails ? (item.userEmail || 'Nomaʼlum email') : maskEmail(item.userEmail)}
                        </span>
                        {item.userWpm ? (
                          <span className="font-mono text-amber-400 font-bold">
                            ⚡ {item.userWpm} WPM ({item.userAccuracy || 98}%)
                          </span>
                        ) : null}
                        {item.userLevel ? (
                          <span className="font-mono text-slate-400">
                            Daraja: {item.userLevel}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                        <span>UID: {item.userId}</span>
                        {item.ip && <span>• IP: {item.ip}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Badges & 24h Expiration Timer */}
                  <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                    {/* Category */}
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs font-bold text-amber-400">
                      {item.category === 'taklif'
                        ? '💡 Taklif'
                        : item.category === 'xato'
                        ? '🛠️ Xatolik'
                        : item.category === 'dizayn'
                        ? '🎨 Dizayn'
                        : '⭐ Fikr'}
                    </span>

                    {/* Rating */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    {/* 24-Hour Expiration Countdown */}
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {timeLeftMs > 0 ? `${hoursLeft}s ${minsLeft}d qoldi` : 'Muddati tugagan'}
                    </span>
                  </div>
                </div>

                {/* Feedback Message Body */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-[var(--sub-alt)]">
                  <p className="text-xs text-[var(--text-color)] font-medium leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>

                {/* Admin Reply Block if exists */}
                {item.replyText && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[var(--card-bg)] to-amber-500/5 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        Administrator javobi: ({item.repliedBy || 'Admin'})
                      </span>
                      {item.repliedAt && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.repliedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-200">
                      {item.replyText}
                    </p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-[var(--sub-alt)] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        item.isRead
                          ? 'bg-slate-900 text-slate-400 border-[var(--sub-alt)]'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                    >
                      {item.isRead ? 'Ko\'rib chiqilgan' : 'O\'qilmagan'}
                    </button>

                    <button
                      onClick={() => {
                        setReplyTarget(item);
                        setReplyText(item.replyText || '');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{item.replyText ? 'Javobni yangilash' : 'Javob yozish'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleString('uz-UZ')}
                    </span>

                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Foydalanuvchiga javob yozish
                </h3>
              </div>
              <button
                onClick={() => setReplyTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-[var(--sub-alt)] text-xs space-y-1">
              <div className="font-bold text-amber-400">{replyTarget.userName}</div>
              <div className="text-slate-300 italic line-clamp-2">"{replyTarget.message}"</div>
            </div>

            {replySuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                Javobingiz muvaffaqiyatli yetkazildi!
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Admin Javobi Matni:
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Fikr uchun tashakkur! Ushbu taklifingiz bo'yicha..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--sub-alt)] text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSendingReply || !replyText.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingReply ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Yuborish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
