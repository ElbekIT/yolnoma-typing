import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareMore,
  X,
  Send,
  Star,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  Zap,
  Flame,
  Award,
  RefreshCw,
  MessageCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rtdb } from '../../config/firebase';
import { ref, set, get, remove } from 'firebase/database';
import { SiteFeedbackItem } from '../../types';

interface SiteFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
}

const STORAGE_KEY = 'yolnoma_site_feedback_timestamp';
const STORAGE_DATA_KEY = 'yolnoma_site_feedback_record';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const SiteFeedbackModal: React.FC<SiteFeedbackModalProps> = ({
  isOpen,
  onClose,
  onFeedbackSubmitted
}) => {
  const { user, profile } = useAuth();

  const [category, setCategory] = useState<'fikr' | 'taklif' | 'xato' | 'dizayn'>('fikr');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // 24-hour limit state
  const [canSubmit, setCanSubmit] = useState<boolean>(true);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [existingFeedback, setExistingFeedback] = useState<SiteFeedbackItem | null>(null);

  // Countdown timer hook
  useEffect(() => {
    if (remainingMs <= 0) return;
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          // Re-enable submission once 24h passed
          setCanSubmit(true);
          setExistingFeedback(null);
          try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_DATA_KEY);
          } catch {}
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingMs]);

  // Check 24-hour status whenever modal opens or user changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const checkStatus = async () => {
      const now = Date.now();
      const currentUserId = user?.uid || profile?.uid;

      // 1. LocalStorage check first
      try {
        const storedTsStr = localStorage.getItem(STORAGE_KEY);
        const storedDataStr = localStorage.getItem(STORAGE_DATA_KEY);
        if (storedTsStr) {
          const storedTs = parseInt(storedTsStr, 10);
          const elapsed = now - storedTs;
          if (elapsed < ONE_DAY_MS) {
            const left = ONE_DAY_MS - elapsed;
            if (isMounted) {
              setCanSubmit(false);
              setRemainingMs(left);
              if (storedDataStr) {
                try {
                  setExistingFeedback(JSON.parse(storedDataStr));
                } catch {}
              }
            }
          } else {
            // Expired in localStorage -> auto clear
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_DATA_KEY);
          }
        }
      } catch {}

      // 2. Backend verification
      try {
        const url = `/api/feedback/status${currentUserId ? `?userId=${encodeURIComponent(currentUserId)}` : ''}`;
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (!data.canSubmit && data.remainingMs > 0) {
              setCanSubmit(false);
              setRemainingMs(data.remainingMs);
              if (data.activeFeedback) {
                setExistingFeedback(data.activeFeedback);
                try {
                  localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data.activeFeedback));
                  localStorage.setItem(STORAGE_KEY, String(data.activeFeedback.createdAt || Date.now()));
                } catch {}
              }
            } else if (data.canSubmit) {
              // Can submit
              setCanSubmit(true);
              setRemainingMs(0);
              setExistingFeedback(null);
              try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(STORAGE_DATA_KEY);
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('Backend feedback check failed, relying on local storage state', err);
      }

      // 3. RTDB check if user is logged in
      if (currentUserId && rtdb) {
        try {
          const userFeedbackRef = ref(rtdb, `user_feedback_limits/${currentUserId}`);
          const snapshot = await get(userFeedbackRef);
          if (snapshot.exists()) {
            const val = snapshot.val();
            if (val && val.expiresAt) {
              const diff = val.expiresAt - now;
              if (diff > 0) {
                if (isMounted) {
                  setCanSubmit(false);
                  setRemainingMs(diff);
                  if (val.feedback) {
                    setExistingFeedback(val.feedback);
                  }
                }
              } else {
                // Expired: auto-clean RTDB node!
                await remove(userFeedbackRef).catch(() => {});
              }
            }
          }
        } catch (err) {
          // Non-blocking
        }
      }

      if (isMounted) setLoading(false);
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.uid, profile?.uid]);

  // Submit Feedback Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 5) {
      setError('Iltimos, fikringizni kamida 5 ta belgi bilan batafsilroq yozing.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const now = Date.now();
    const expiresAt = now + ONE_DAY_MS;
    const activeUid = user?.uid || profile?.uid || `guest_${Math.random().toString(36).slice(2, 9)}`;
    const activeName =
      profile?.displayName ||
      profile?.username ||
      user?.displayName ||
      guestName.trim() ||
      'Foydalanuvchi';
    const activeEmail = user?.email || profile?.email;

    const feedbackPayload: SiteFeedbackItem = {
      id: `fb-${now}-${Math.random().toString(36).slice(2, 7)}`,
      userId: activeUid,
      userName: activeName,
      userEmail: activeEmail,
      userAvatar: profile?.avatarUrl || user?.photoURL || undefined,
      userRole: profile?.role || 'user',
      userRank: profile?.rankTitle || 'Typing Yangi',
      userWpm: profile?.highestWpm || 0,
      userAccuracy: profile?.highestAccuracy || 98,
      userLevel: profile?.level || 1,
      category,
      rating,
      message: trimmedMsg,
      createdAt: now,
      expiresAt,
      status: 'active',
      isRead: false
    };

    try {
      // 1. Send to Backend API
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(feedbackPayload)
      });

      const responseText = await res.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('API javobini oqishda xato:', responseText);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Serverga yuborishda xatolik (Status: ${res.status}). API ishlayotganiga ishonch hosil qiling.`);
      }

      const returnedFeedback: SiteFeedbackItem = data.feedback || feedbackPayload;

      // 2. Push to Firebase Realtime Database for instant push updates in Admin Panel
      if (rtdb) {
        try {
          const rtdbRef = ref(rtdb, `site_feedbacks/${returnedFeedback.id}`);
          await set(rtdbRef, returnedFeedback);

          // Set 24h limit node for user
          if (activeUid) {
            const limitRef = ref(rtdb, `user_feedback_limits/${activeUid}`);
            await set(limitRef, {
              expiresAt,
              feedbackId: returnedFeedback.id,
              feedback: returnedFeedback
            });
          }
        } catch (rtdbErr) {
          console.warn('Firebase RTDB feedback sync error (non-blocking):', rtdbErr);
        }
      }

      // 3. Save local limit in localStorage
      try {
        localStorage.setItem(STORAGE_KEY, String(now));
        localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(returnedFeedback));
      } catch {}

      // Update state
      setExistingFeedback(returnedFeedback);
      setCanSubmit(false);
      setRemainingMs(ONE_DAY_MS);
      setSuccess(true);
      setMessage('');

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      // Reset success banner after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
    } catch (err: any) {
      setError(err?.message || 'Serverga ulanishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Format countdown
  const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
  const minsLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const secsLeft = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const ratingDescriptions: Record<number, string> = {
    1: 'Qoniqarsiz 🙁',
    2: 'O\'rtacha 😐',
    3: 'Yaxshi 🙂',
    4: 'Juda yaxshi! 🚀',
    5: 'A\'lo darajada! ⭐'
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80">
      <div
        className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with 3-dots SMS chat icon */}
        <div className="relative px-6 py-4 bg-[var(--card-bg)] border-b border-[var(--sub-alt)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center relative">
              <MessageSquareMore className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-[var(--card-bg)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-bold text-[10px] tracking-wider uppercase">
                  💬 Jonli Muloqot & Chat
                </span>
                <span className="text-[11px] font-mono text-[var(--sub-color)]">
                  24h Limit
                </span>
              </div>
              <h2 className="text-base font-bold text-[var(--text-color)] tracking-tight mt-0.5">
                Sayt haqida o'z fikringizni bildiring
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--sub-color)] hover:text-white hover:bg-[var(--sub-alt)] cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* User Profile Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[var(--sub-alt)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center text-sm overflow-hidden shrink-0">
                {profile?.avatarUrl || user?.photoURL ? (
                  <img
                    src={profile?.avatarUrl || user?.photoURL || ''}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(profile?.displayName || user?.displayName || guestName || 'Y')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[var(--text-color)] truncate">
                    {profile?.displayName || user?.displayName || guestName.trim() || 'Mehmon Foydalanuvchi'}
                  </span>
                  {user ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/30">
                      FAOL PROFIL
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-md bg-slate-700 text-slate-300 text-[9px] font-semibold">
                      MEHMON
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--sub-color)] flex items-center gap-2 mt-0.5">
                  {user?.email ? (
                    <span className="truncate">{user.email}</span>
                  ) : (
                    <span>Tizimga kirmagan (Mehmon)</span>
                  )}
                  {profile?.highestWpm ? (
                    <span className="text-amber-400 font-mono font-bold">
                      ⚡ {profile.highestWpm} WPM
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium">Yetib boradi:</span>
              <span className="text-[11px] font-bold text-amber-400 flex items-center justify-end gap-1">
                <Shield className="w-3 h-3" />
                Admin Panel
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Fikringiz muvaffaqiyatli qabul qilindi!</p>
                <p className="text-[11px] text-emerald-400/90 mt-0.5">
                  Sizning fikringiz admin panelga yetkazildi. Rahmat!
                </p>
              </div>
            </div>
          )}

          {/* CASE A: USER HAS SUBMITTED WITHIN 24 HOURS (ACTIVE LIMIT) */}
          {!canSubmit && (
            <div className="space-y-4">
              {/* Limit status notification */}
              <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-amber-500/30 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-1.5 border border-amber-500/30">
                    <span>⏳ 1 Kunlik Limit Faol</span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-color)]">
                    Siz bugun o'z fikringizni bildirgansiz!
                  </h3>
                  <p className="text-xs text-[var(--sub-color)] mt-1 max-w-sm mx-auto leading-relaxed">
                    Qoidaga ko'ra, har bir foydalanuvchi bir kunda faqat 1 marotaba fikr qoldira oladi.
                    Eski xabaringiz 24 soatdan so'ng avtomatik tarzda tozalanadi va yangi fikr yozish ochiladi.
                  </p>
                </div>

                {/* Live Countdown Display */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Yangi fikr bildirishgacha qolgan vaqt:
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-center min-w-[60px]">
                      <span className="text-lg font-black font-mono text-amber-400 block">
                        {String(hoursLeft).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Soat</span>
                    </div>
                    <span className="text-lg font-black text-amber-400">:</span>
                    <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-center min-w-[60px]">
                      <span className="text-lg font-black font-mono text-amber-400 block">
                        {String(minsLeft).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Daqiqa</span>
                    </div>
                    <span className="text-lg font-black text-amber-400">:</span>
                    <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-center min-w-[60px]">
                      <span className="text-lg font-black font-mono text-amber-400 block">
                        {String(secsLeft).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Soniya</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show previously submitted feedback */}
              {existingFeedback && (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-[var(--sub-alt)] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--sub-color)] flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      Siz qoldirgan bugungi fikr:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      {existingFeedback.status === 'replied' ? 'Admin javob berdi' : 'Admin ko\'rib chiqmoqda'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {Array.from({ length: existingFeedback.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] text-slate-400 ml-1">
                      ({ratingDescriptions[existingFeedback.rating || 5] || 'Baholandi'})
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-color)] italic bg-[var(--card-bg)]/80 p-3 rounded-xl border border-[var(--sub-alt)] leading-relaxed">
                    "{existingFeedback.message}"
                  </p>

                  {/* If admin replied */}
                  {existingFeedback.replyText && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Administrator javobi:</span>
                      </div>
                      <p className="text-xs text-amber-200">
                        {existingFeedback.replyText}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-[var(--text-color)] font-bold text-xs cursor-pointer"
                >
                  Tushunarli, Oynani Yopish
                </button>
              </div>
            </div>
          )}

          {/* CASE B: USER CAN SUBMIT NEW FEEDBACK */}
          {canSubmit && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guest name input if not logged in */}
              {!user && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-color)] mb-1.5">
                    Ismingiz yoki taxallusingiz (ixtiyoriy):
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Masalan: Sardorbek yoki Mehmon"
                    maxLength={40}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-[var(--text-color)] placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Category Pills */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-color)] mb-1.5">
                  Fikr turi / Yo'nalishi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('fikr')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold cursor-pointer border text-center ${
                      category === 'fikr'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-slate-900 text-[var(--sub-color)] border-[var(--sub-alt)] hover:text-white'
                    }`}
                  >
                    ⭐ Fikr
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('taklif')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold cursor-pointer border text-center ${
                      category === 'taklif'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-slate-900 text-[var(--sub-color)] border-[var(--sub-alt)] hover:text-white'
                    }`}
                  >
                    💡 Taklif
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('xato')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold cursor-pointer border text-center ${
                      category === 'xato'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-slate-900 text-[var(--sub-color)] border-[var(--sub-alt)] hover:text-white'
                    }`}
                  >
                    🛠️ Xatolik
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('dizayn')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold cursor-pointer border text-center ${
                      category === 'dizayn'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-slate-900 text-[var(--sub-color)] border-[var(--sub-alt)] hover:text-white'
                    }`}
                  >
                    🎨 Dizayn
                  </button>
                </div>
              </div>

              {/* 5-Star Rating Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--text-color)]">
                    Platformaga bahoingiz:
                  </label>
                  <span className="text-xs font-bold text-amber-400">
                    {ratingDescriptions[hoverRating ?? rating]}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-[var(--sub-alt)] justify-center">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating ?? rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(starVal)}
                        className="p-1 text-2xl focus:outline-none cursor-pointer"
                        aria-label={`${starVal} yulduz`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600 fill-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--text-color)]">
                    Fikringiz yoki taklifingiz:
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {message.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Saytdagi klaviatura tezligi, 1v1 janglar, personajlar yoki boshqa yangiliklar haqida o'z xolis fikringizni yozing..."
                  maxLength={1000}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-xs text-[var(--text-color)] placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              {/* 24-Hour Notice Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Muhim:</strong> Fikringiz yuborilgach, yangi fikrni 24 soat (1 kun) dan so'ng qoldirishingiz mumkin bo'ladi. Eski bildirgan fikringiz 1 kundan so'ng avtomatik o'chib ketadi.
                </span>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-[var(--text-color)] font-bold text-xs cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting || message.trim().length < 5}
                  className="flex-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Fikrni Yuborish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
