import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Check,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Heart,
  ChevronRight,
  Settings,
  LogIn,
  Lock,
  Youtube,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { rtdb, db, ensureFirebaseAuth } from '../../config/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface VideoGuideViewProps {
  onBackToHome: () => void;
  onStartTyping: () => void;
  onGoToBattle?: () => void;
  onGoToLessons?: () => void;
  onGoToSupport?: () => void;
  onOpenAuth?: () => void;
}

// Official YouTube Video ID and link provided by user
const DEFAULT_YOUTUBE_ID = 'EW7Mnfu7OFo';
const DEFAULT_YOUTUBE_URL = 'https://youtu.be/EW7Mnfu7OFo?si=rkVNcZuGUccOOgSm';

export const extractYouTubeId = (input: string): string => {
  if (!input) return DEFAULT_YOUTUBE_ID;
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return DEFAULT_YOUTUBE_ID;
};

export const VideoGuideView: React.FC<VideoGuideViewProps> = ({
  onBackToHome,
  onStartTyping,
  onGoToBattle,
  onGoToSupport,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const { uiLanguage } = useI18n();

  // YouTube Player States
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_youtube_video_id');
      return saved ? extractYouTubeId(saved) : DEFAULT_YOUTUBE_ID;
    } catch {
      return DEFAULT_YOUTUBE_ID;
    }
  });

  const [playerKey, setPlayerKey] = useState<number>(0);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showUrlSettings, setShowUrlSettings] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  // Authentication prompt modal state (only registered users can like/dislike)
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);

  // Like & Dislike System States - Strict 0 baseline, pure organic registered user votes only
  const [likesCount, setLikesCount] = useState<number>(0);
  const [dislikesCount, setDislikesCount] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_video_reaction');
      return (saved === 'like' || saved === 'dislike') ? saved : null;
    } catch {
      return null;
    }
  });
  const [isSubmittingReaction, setIsSubmittingReaction] = useState<boolean>(false);

  // Active user identifier: strictly registered authenticated users
  const userIdentifier = user?.uid || '';

  // 1. Initialize and Subscribe to Firebase RTDB for Realtime Likes & Dislikes
  useEffect(() => {
    let unsubscribeRtdb: (() => void) | undefined;

    const setupFirebaseSync = async () => {
      try {
        await ensureFirebaseAuth();
      } catch (err) {
        console.warn('Firebase auth check in video view:', err);
      }

      try {
        const feedbackRef = ref(rtdb, 'video_feedback/main_guide');
        unsubscribeRtdb = onValue(feedbackRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Automatically reset legacy artificial mock seed values (142 / 3) to 0
            if (data.likes === 142 && data.dislikes === 3) {
              set(feedbackRef, { likes: 0, dislikes: 0, updatedAt: Date.now() }).catch(() => {});
              setLikesCount(0);
              setDislikesCount(0);
              return;
            }
            if (typeof data.likes === 'number') {
              setLikesCount(Math.max(0, data.likes));
            } else {
              setLikesCount(0);
            }
            if (typeof data.dislikes === 'number') {
              setDislikesCount(Math.max(0, data.dislikes));
            } else {
              setDislikesCount(0);
            }
          } else {
            // Organic starting baseline is strictly 0 likes and 0 dislikes
            set(feedbackRef, { likes: 0, dislikes: 0, updatedAt: Date.now() }).catch(() => {});
            setLikesCount(0);
            setDislikesCount(0);
          }
        }, (error) => {
          console.warn('[RTDB Video] Fallback to Firestore:', error);
          fetchFromFirestore();
        });

        // Fetch user's existing reaction from RTDB if logged in
        if (userIdentifier) {
          const userReactionRef = ref(rtdb, `video_reactions/${userIdentifier}`);
          get(userReactionRef).then((snap) => {
            if (snap.exists()) {
              const val = snap.val();
              if (val === 'like' || val === 'dislike') {
                setUserReaction(val);
                try { localStorage.setItem('yolnoma_video_reaction', val); } catch {}
              }
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('[Video feedback init error]:', err);
        fetchFromFirestore();
      }
    };

    const fetchFromFirestore = async () => {
      try {
        const docRef = doc(db, 'video_feedback', 'main_guide');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          // Reset legacy artificial mock if present in firestore
          if (data.likes === 142 && data.dislikes === 3) {
            setDoc(docRef, { likes: 0, dislikes: 0, updatedAt: Date.now() }, { merge: true }).catch(() => {});
            setLikesCount(0);
            setDislikesCount(0);
            return;
          }
          if (typeof data.likes === 'number') setLikesCount(Math.max(0, data.likes));
          if (typeof data.dislikes === 'number') setDislikesCount(Math.max(0, data.dislikes));
        }
      } catch {}
    };

    setupFirebaseSync();

    return () => {
      if (unsubscribeRtdb) {
        unsubscribeRtdb();
      }
    };
  }, [userIdentifier]);

  // 2. Handle Like or Dislike Click (Only registered users, strict single choice)
  const handleToggleReaction = async (target: 'like' | 'dislike') => {
    // Only registered authenticated users can like or dislike
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (isSubmittingReaction) return;
    setIsSubmittingReaction(true);

    const prevReaction = userReaction;
    let nextReaction: 'like' | 'dislike' | null = null;
    let nextLikes = likesCount;
    let nextDislikes = dislikesCount;

    // Strict single choice rule:
    // If clicking same button -> toggle off (neutral)
    // If clicking opposite button -> decrement other, increment clicked
    // If clicking from neutral -> increment clicked
    if (prevReaction === target) {
      // Toggle OFF
      nextReaction = null;
      if (target === 'like') {
        nextLikes = Math.max(0, nextLikes - 1);
      } else {
        nextDislikes = Math.max(0, nextDislikes - 1);
      }
    } else {
      // Switching or newly choosing
      nextReaction = target;
      if (target === 'like') {
        nextLikes += 1;
        if (prevReaction === 'dislike') {
          nextDislikes = Math.max(0, nextDislikes - 1);
        }
      } else {
        nextDislikes += 1;
        if (prevReaction === 'like') {
          nextLikes = Math.max(0, nextLikes - 1);
        }
      }
    }

    // Optimistic UI update
    setUserReaction(nextReaction);
    setLikesCount(nextLikes);
    setDislikesCount(nextDislikes);

    try {
      if (nextReaction) {
        localStorage.setItem('yolnoma_video_reaction', nextReaction);
      } else {
        localStorage.removeItem('yolnoma_video_reaction');
      }
    } catch {}

    // Persist to Firebase RTDB & Firestore
    try {
      await ensureFirebaseAuth();

      // Update RTDB Counts atomically
      const feedbackRef = ref(rtdb, 'video_feedback/main_guide');
      await set(feedbackRef, {
        likes: nextLikes,
        dislikes: nextDislikes,
        updatedAt: Date.now()
      });

      // Update User reaction record in RTDB
      const userReactionRef = ref(rtdb, `video_reactions/${userIdentifier}`);
      if (nextReaction) {
        await set(userReactionRef, nextReaction);
      } else {
        await set(userReactionRef, null);
      }

      // Sync to Firestore for backup persistence
      try {
        const firestoreDocRef = doc(db, 'video_feedback', 'main_guide');
        await setDoc(firestoreDocRef, {
          likes: nextLikes,
          dislikes: nextDislikes,
          updatedAt: Date.now()
        }, { merge: true });

        const userDocRef = doc(db, 'video_reactions', userIdentifier);
        if (nextReaction) {
          await setDoc(userDocRef, { reaction: nextReaction, updatedAt: Date.now() }, { merge: true });
        } else {
          await setDoc(userDocRef, { reaction: null, updatedAt: Date.now() }, { merge: true });
        }
      } catch {}
    } catch (err) {
      console.warn('[Video Reaction persist notice]:', err);
    } finally {
      setIsSubmittingReaction(false);
    }
  };

  const handleCopyShareLink = () => {
    const youtubeUrl = `https://youtu.be/${youtubeVideoId}`;
    navigator.clipboard.writeText(youtubeUrl).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }).catch(() => {});
  };

  const handleSaveCustomSource = () => {
    if (!customUrlInput.trim()) return;
    const extractedId = extractYouTubeId(customUrlInput);
    setYoutubeVideoId(extractedId);
    setPlayerKey(prev => prev + 1);
    try {
      localStorage.setItem('yolnoma_youtube_video_id', extractedId);
    } catch {}
    setShowUrlSettings(false);
  };

  const handleResetToDefaultSource = () => {
    setYoutubeVideoId(DEFAULT_YOUTUBE_ID);
    setPlayerKey(prev => prev + 1);
    try {
      localStorage.removeItem('yolnoma_youtube_video_id');
    } catch {}
    setShowUrlSettings(false);
  };

  // Positive like percentage ratio - organic calculation based solely on real votes
  const totalVotes = likesCount + dislikesCount;
  const likeRatio = totalVotes > 0 ? Math.round((likesCount / totalVotes) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--sub-alt)]/60 pb-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)]/80 text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{uiLanguage === 'ru' ? 'Главная страница' : uiLanguage === 'en' ? 'Back to Home' : 'Bosh Sahifa'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Watch on YouTube button */}
          <a
            href={`https://youtu.be/${youtubeVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 border border-red-500/25 text-xs font-bold transition-all"
            title="YouTube ilovasida yoki saytida ochish"
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">YouTube'da ochish</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          {/* Refresh Player */}
          <button
            onClick={() => setPlayerKey(prev => prev + 1)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-semibold transition-colors cursor-pointer"
            title="Videoni qayta yuklash"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Change Video Source / Info Button */}
          <button
            onClick={() => setShowUrlSettings(!showUrlSettings)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--main-color)] text-xs font-bold transition-all cursor-pointer"
            title="YouTube havolasini sozlash"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sozlash</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Ushbu video havolasini nusxalash"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Nusxalandi!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Ulashish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin / Owner Video Configuration Panel (Collapsible) */}
      {showUrlSettings && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--sub-alt)]/40 border border-amber-500/30 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h4 className="font-extrabold text-[var(--text-color)] text-sm">
                YouTube Video Havolasini O'zgartirish
              </h4>
            </div>
            <button
              onClick={() => setShowUrlSettings(false)}
              className="text-[var(--sub-color)] hover:text-[var(--text-color)] font-bold text-xs"
            >
              Yopish
            </button>
          </div>

          <p className="text-[var(--sub-color)] leading-relaxed">
            Istalgan YouTube video havolasini (masalan: <code>https://youtu.be/EW7Mnfu7OFo</code> yoki <code>https://www.youtube.com/watch?v=EW7Mnfu7OFo</code>) kiriting. Tizim video identifikatorini avtomatik ajratib olib sayt ichida ko'rsatadi:
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              placeholder="https://youtu.be/EW7Mnfu7OFo?si=rkVNcZuGUccOOgSm"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-[var(--text-color)] font-mono text-xs focus:outline-hidden focus:border-red-500"
            />
            <button
              onClick={handleSaveCustomSource}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all cursor-pointer shrink-0"
            >
              O'rnatish
            </button>
            <button
              onClick={handleResetToDefaultSource}
              className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)]/70 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] font-semibold transition-all cursor-pointer shrink-0"
            >
              Asliga Qaytarish
            </button>
          </div>
          <div className="text-[11px] text-[var(--sub-color)]/80 font-mono">
            Hozirgi YouTube Video ID: <span className="text-red-400 font-bold">{youtubeVideoId}</span>
          </div>
        </div>
      )}

      {/* Main Video Presentation Banner */}
      <div className="space-y-4">
        {/* Title & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono font-bold">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>Rasmiy YouTube Video Qo'llanma</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-color)] tracking-tight">
            Sayt Haqida To'liq Video Qo'llanma
          </h1>
          <p className="text-sm sm:text-base text-[var(--sub-color)] max-w-3xl leading-relaxed">
            Yolnoma Typing platformasiga kirish, ro'yxatdan o'tish va sayt imkoniyatlari bo'yicha to'g'ridan-to'g'ri YouTube orqali tayyorlangan rasmiy qo'llanma.
          </p>
        </div>

        {/* Responsive YouTube Video Player Embed Container */}
        <div
          id="video-player-container"
          className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-[var(--sub-alt)] shadow-2xl group ring-1 ring-white/5"
        >
          <iframe
            key={`youtube-player-${youtubeVideoId}-${playerKey}`}
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
            title="Yolnoma - Sayt Haqida Rasmiy Video Qo'llanma"
            className="w-full h-full border-0 rounded-3xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* ============================================================== */}
        {/* EXACT USER SPECIFICATION: LIKE & DISLIKE SECTION UNDER VIDEO    */}
        {/* Single reaction rule, count of likes & dislikes shown, Firebase */}
        {/* Only registered users can like or dislike                       */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Info: Video metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-extrabold text-[var(--text-color)] text-base sm:text-lg">
                  Sizga ushbu video qo'llanma yoqdimi?
                </h3>
              </div>
              <p className="text-xs text-[var(--sub-color)]">
                Fikringiz biz uchun muhim. Like yoki Dislike tugmasini bosish orqali loyihani baholang.
              </p>
            </div>

            {/* Right: Exact Like and Dislike Action Group (Registered Users Only) */}
            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => handleToggleReaction('like')}
                  disabled={isSubmittingReaction}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer select-none active:scale-95 shadow-xs ${
                    userReaction === 'like'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                      : 'bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-alt)] hover:border-emerald-500/40'
                  }`}
                  title={user ? "Videoga layk bosish" : "Layk bosish uchun tizimga kiring"}
                >
                  <ThumbsUp
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                      userReaction === 'like' ? 'fill-white scale-110' : 'text-emerald-500'
                    }`}
                  />
                  <span className="font-mono tracking-tight font-black">{likesCount.toLocaleString()}</span>
                  <span className="text-[11px] opacity-80 hidden xs:inline">Like</span>
                </button>

                {/* Dislike Button */}
                <button
                  type="button"
                  onClick={() => handleToggleReaction('dislike')}
                  disabled={isSubmittingReaction}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer select-none active:scale-95 shadow-xs ${
                    userReaction === 'dislike'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/25 ring-2 ring-rose-500/30'
                      : 'bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-alt)] hover:border-rose-500/40'
                  }`}
                  title={user ? "Videoga dislayk bosish" : "Dislayk bosish uchun tizimga kiring"}
                >
                  <ThumbsDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                      userReaction === 'dislike' ? 'fill-white scale-110' : 'text-rose-500'
                    }`}
                  />
                  <span className="font-mono tracking-tight font-black">{dislikesCount.toLocaleString()}</span>
                  <span className="text-[11px] opacity-80 hidden xs:inline">Dislike</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)] text-xs font-bold transition-all cursor-pointer"
                  title="Videoni ulashish"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Ulashish</span>
                </button>
              </div>

              {!user && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Ovoz berish faqat ro'yxatdan o'tgan foydalanuvchilar uchun</span>
                </div>
              )}
            </div>
          </div>

          {/* Reaction Ratio Bar & Trust Metric */}
          <div className="pt-2 border-t border-[var(--sub-alt)]/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--sub-color)]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Ijobiy baholash darajasi:{' '}
                  <strong className={totalVotes > 0 ? "text-emerald-400 font-bold" : "text-[var(--sub-color)] font-bold"}>
                    {totalVotes > 0 ? `${likeRatio}%` : '0%'}
                  </strong>
                </span>
              </span>
              <span>
                Jami ovozlar: <strong className="text-[var(--text-color)]">{totalVotes}</strong> ta
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-[var(--sub-alt)]/50 overflow-hidden flex">
              {totalVotes > 0 ? (
                <>
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${likeRatio}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${100 - likeRatio}%` }}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-[var(--sub-alt)]/30" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Practical Instructions Cards */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-[var(--text-color)] text-base sm:text-lg">
            Saytdan Unumli Foydalanish Bo'yicha 4 Muhim Qadam
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)]/60 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h5 className="font-bold text-xs sm:text-sm text-[var(--text-color)]">Ro'yxatdan O'ting</h5>
            <p className="text-[11px] text-[var(--sub-color)] leading-relaxed">
              Google akkauntingiz orqali 1 bosishda kiring va yozish natijalaringizni milliy reytingda aks ettiring.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)]/60 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h5 className="font-bold text-xs sm:text-sm text-[var(--text-color)]">Tezlikni Sinang</h5>
            <p className="text-[11px] text-[var(--sub-color)] leading-relaxed">
              15, 30 yoki 60 soniyalik testni tanlab, WPM tezligingiz va aniqligingizni tekshirib ko'ring.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)]/60 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h5 className="font-bold text-xs sm:text-sm text-[var(--text-color)]">10 Barmoq Mashqi</h5>
            <p className="text-[11px] text-[var(--sub-color)] leading-relaxed">
              Klaviaturaga qaramasdan ko'r-ko'rona yozish saboqlarini o'rganing va barmoq xotirasini kuchaytiring.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)]/60 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h5 className="font-bold text-xs sm:text-sm text-[var(--text-color)]">1v1 Speedway Bellashuv</h5>
            <p className="text-[11px] text-[var(--sub-color)] leading-relaxed">
              Do'stingizga xona kodini yuboring va real vaqtda kim tezroq yozishini poygada aniqlang!
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onStartTyping}
          className="px-6 py-3 rounded-2xl bg-[var(--main-color)] hover:brightness-105 text-white font-black text-sm shadow-lg shadow-[var(--main-color)]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <span>Tez Yozishni Boshlash</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {onGoToBattle && (
          <button
            onClick={onGoToBattle}
            className="px-5 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-sm transition-all cursor-pointer active:scale-95"
          >
            Speedway Battle Arenasi
          </button>
        )}

        {onGoToSupport && (
          <button
            onClick={onGoToSupport}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500/15 to-amber-500/15 hover:from-rose-500/25 hover:to-amber-500/25 border border-rose-500/30 text-rose-400 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Heart className="w-4 h-4 fill-rose-500/30 text-rose-500" />
            <span>Qo'llab-quvvatlash</span>
          </button>
        )}
      </div>

      {/* Auth Requirement Prompt Modal (Only registered users can like/dislike) */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer"
              title="Yopish"
            >
              ✕
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LogIn className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)]">
                Ro'yxatdan o'tish talab etiladi
              </h3>
              <p className="text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed">
                Video qo'llanmaga <strong>Like</strong> yoki <strong>Dislike</strong> bosish faqat ro'yxatdan o'tgan foydalanuvchilar uchun amal qiladi. Ovoz berish uchun iltimos, hisobingizga kiring yoki ro'yxatdan o'ting.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowAuthPrompt(false);
                  if (onOpenAuth) onOpenAuth();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[var(--main-color)] hover:brightness-105 text-white font-bold text-sm transition-all shadow-lg shadow-[var(--main-color)]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Kirish / Ro'yxatdan o'tish</span>
              </button>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] font-semibold text-sm transition-all cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
