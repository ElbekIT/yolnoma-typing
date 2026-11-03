import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  BookOpen,
  ArrowRight,
  Check,
  Zap,
  Lock,
  ShieldAlert,
  LogIn,
  Home,
  Crown,
  Eye,
  EyeOff,
  CornerDownLeft,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ENGLISH_LESSONS,
  COURSE_LEVELS,
  EnglishLesson,
  EnglishWordItem,
  CourseLevel,
  TOTAL_ENGLISH_LESSONS
} from '../../data/englishCourseData';
import { soundSynth } from '../../utils/audio';
import { useAuth } from '../../context/AuthContext';
import { EnglishPremiumModal } from './EnglishPremiumModal';

interface LessonProgress {
  completed: boolean;
  stars: number;
  bestWpm: number;
  bestAcc: number;
}

export interface EnglishLearnViewProps {
  onBackToHome?: () => void;
  onOpenAuth?: () => void;
  onGoToLessons?: () => void;
}

// Clean word helper (strip punctuation and lowercase)
const cleanWord = (w: string): string => {
  return w.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
};

// Slot colors matching Julebu.ai aesthetic
const SLOT_UNDERLINE_COLORS = [
  '#818cf8', // Indigo / Purple
  '#fb7185', // Rose
  '#38bdf8', // Sky
  '#f472b6', // Pink
  '#fb923c', // Orange
  '#a78bfa', // Violet
  '#4ade80', // Green
  '#facc15'  // Yellow
];

export const EnglishLearnView: React.FC<EnglishLearnViewProps> = ({
  onBackToHome,
  onOpenAuth,
  onGoToLessons
}) => {
  const { user, loading } = useAuth();

  // Temporary owner check (only yuldashivagavharoy@gmail.com can enter by default)
  const isAuthorizedOwner = Boolean(
    user?.email && (
      user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' ||
      user.email.toLowerCase().startsWith('yuldashivagavharoy')
    )
  );

  // -------------------------------------------------------------
  // PREMIUM SUBSCRIPTION & FREEMIUM 3-WORD TRIAL ENGINE
  // -------------------------------------------------------------
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState<boolean>(false);

  // Free practiced count (max 3 for free users)
  const [freePracticedCount, setFreePracticedCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('yolnoma_english_free_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Check subscription from backend
  const checkSubscription = useCallback(() => {
    const userIdentifier = user?.uid || user?.email;
    if (!userIdentifier) return;

    fetch(`/api/user/subscription?userId=${encodeURIComponent(userIdentifier)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.active) {
          setIsPremiumActive(true);
          setSubscriptionPlan(data.planId || 'premium');
          setRemainingDays(data.remainingDays);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check URL params for payment return
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setShowPaymentSuccessAlert(true);
        setIsPremiumActive(true);
        // Refresh subscription
        checkSubscription();
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}
  }, [checkSubscription]);

  // -------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  const [currentUnit, setCurrentUnit] = useState<number>(1);
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

  // Active Lesson & Item
  const activeLesson: EnglishLesson = ENGLISH_LESSONS.find(l => l.id === activeLessonId) || ENGLISH_LESSONS[0];
  const currentItem: EnglishWordItem | undefined = activeLesson.items[currentItemIndex];
  const activeLevel: CourseLevel = COURSE_LEVELS.find(lvl => lvl.id === activeLesson.levelId) || COURSE_LEVELS[0];
  const unitLessons = ENGLISH_LESSONS.filter(l => l.unitNumber === currentUnit);

  // Split current target English phrase into word tokens
  const targetTokens = useMemo(() => {
    if (!currentItem) return [];
    const words = currentItem.english.trim().split(/\s+/);
    return words.map((w, idx) => {
      const match = w.match(/^(.+?)([.,!?;:]*)$/);
      const core = match ? match[1] : w;
      const trailingPunc = match ? match[2] : '';
      return {
        index: idx,
        raw: w,
        core,
        clean: cleanWord(core),
        trailingPunc
      };
    });
  }, [currentItem]);

  // Julebu.ai Word Slots State: array of strings entered by user
  const [userWords, setUserWords] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  // UI state
  const [showAnswer, setShowAnswer] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);

  // Audio / Speech settings
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Session Statistics
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [totalKeyCount, setTotalKeyCount] = useState<number>(0);
  const [correctKeyCount, setCorrectKeyCount] = useState<number>(0);

  // Finish Modal
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [lastFinishedStats, setLastFinishedStats] = useState<{
    wpm: number;
    accuracy: number;
    stars: number;
    xpEarned: number;
  } | null>(null);

  // LocalStorage Persisted Progress
  const [progressMap, setProgressMap] = useState<Record<number, LessonProgress>>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_english_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      1: { completed: false, stars: 0, bestWpm: 0, bestAcc: 0 }
    };
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('yolnoma_english_xp') || '1900', 10);
    } catch {
      return 1900;
    }
  });

  // Hidden input ref for capturing keyboard input smoothly
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset words array whenever item changes
  useEffect(() => {
    if (targetTokens.length > 0) {
      setUserWords(new Array(targetTokens.length).fill(''));
      setActiveWordIndex(0);
      setIsSuccess(false);
      setIsShake(false);
      setErrorMessage(null);
    }
  }, [targetTokens]);

  // Keep input focused automatically
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      focusInput();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentItemIndex, activeLessonId, focusInput]);

  // -------------------------------------------------------------
  // TEXT-TO-SPEECH (NATIVE PRONUNCIATION)
  // -------------------------------------------------------------
  const speakEnglish = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel') ||
        v.name.includes('US')
      )) || voices.find(v => v.lang.startsWith('en'));

      if (enVoice) {
        utterance.voice = enVoice;
      }

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      if (onDone) onDone();
    }
  }, [speechRate]);

  // -------------------------------------------------------------
  // PROGRESS & LESSON COMPLETION
  // -------------------------------------------------------------
  const saveLessonProgress = (lessonId: number, stars: number, wpm: number, acc: number) => {
    const newProgress = { ...progressMap };
    const prev = newProgress[lessonId] || { completed: false, stars: 0, bestWpm: 0, bestAcc: 0 };

    newProgress[lessonId] = {
      completed: true,
      stars: Math.max(prev.stars, stars),
      bestWpm: Math.max(prev.bestWpm, wpm),
      bestAcc: Math.max(prev.bestAcc, acc)
    };

    if (lessonId < TOTAL_ENGLISH_LESSONS && !newProgress[lessonId + 1]) {
      newProgress[lessonId + 1] = {
        completed: false,
        stars: 0,
        bestWpm: 0,
        bestAcc: 0
      };
    }

    setProgressMap(newProgress);
    try {
      localStorage.setItem('yolnoma_english_progress', JSON.stringify(newProgress));
    } catch {}

    const earnedXp = 100 + (stars * 20);
    const updatedXp = totalXp + earnedXp;
    setTotalXp(updatedXp);
    try {
      localStorage.setItem('yolnoma_english_xp', updatedXp.toString());
    } catch {}

    return earnedXp;
  };

  const handleFinishLesson = () => {
    const elapsedSeconds = sessionStartTime ? Math.max(1, (Date.now() - sessionStartTime) / 1000) : 30;
    const finalAccuracy = totalKeyCount > 0 ? Math.round((correctKeyCount / totalKeyCount) * 100) : 98;
    const totalWords = activeLesson.items.reduce((acc, it) => acc + it.english.split(' ').length, 0);
    const calculatedWpm = Math.max(15, Math.round((totalWords / elapsedSeconds) * 60));

    let starsAwarded = 1;
    if (finalAccuracy >= 92) starsAwarded = 3;
    else if (finalAccuracy >= 78) starsAwarded = 2;

    const earnedXp = saveLessonProgress(activeLessonId, starsAwarded, calculatedWpm, finalAccuracy);

    setLastFinishedStats({
      wpm: calculatedWpm,
      accuracy: finalAccuracy,
      stars: starsAwarded,
      xpEarned: earnedXp
    });

    setShowCompleteModal(true);
    soundSynth.playCoinSound();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // -------------------------------------------------------------
  // ADVANCE TO NEXT SENTENCE OR COMPLETE
  // -------------------------------------------------------------
  const goToNextSentence = useCallback(() => {
    setIsSuccess(false);
    setIsVerifying(false);
    if (currentItemIndex < activeLesson.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      handleFinishLesson();
    }
  }, [currentItemIndex, activeLesson.items.length]);

  // -------------------------------------------------------------
  // VERIFY ANSWER & PRONOUNCE (CORE JULEBU.AI EXPERIENCE)
  // -------------------------------------------------------------
  const verifyCurrentSentence = useCallback(() => {
    if (!currentItem || isVerifying || isSuccess) return;

    // Check if free trial limit of 3 words has already been reached
    if (!isPremiumActive && !isAuthorizedOwner && freePracticedCount >= 3) {
      setIsLimitReached(true);
      setShowPremiumModal(true);
      return;
    }

    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    // Check if every token matches
    let allCorrect = true;
    let targetChars = 0;

    targetTokens.forEach((token, idx) => {
      const userWord = userWords[idx] || '';
      const cleanUser = cleanWord(userWord);
      targetChars += token.core.length;

      if (cleanUser !== token.clean) {
        allCorrect = false;
      }
    });

    setTotalKeyCount(prev => prev + targetChars);

    if (allCorrect) {
      // SUCCESS!
      setIsVerifying(true);
      setIsSuccess(true);
      setErrorMessage(null);
      setCorrectKeyCount(prev => prev + targetChars);

      // Play success chime
      soundSynth.playCoinSound();

      // Floating XP bonus animation
      setFloatingXp(100);
      setTotalXp(prev => {
        const next = prev + 100;
        try {
          localStorage.setItem('yolnoma_english_xp', next.toString());
        } catch {}
        return next;
      });

      // Update free count
      const newFreeCount = freePracticedCount + 1;
      setFreePracticedCount(newFreeCount);
      try {
        localStorage.setItem('yolnoma_english_free_count', newFreeCount.toString());
      } catch {}

      // Confetti burst
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.55 }
        });
      } catch {}

      // SAYT O'QIB BERADI GAPIRIB ENGLISH TILIDA!
      speakEnglish(currentItem.english, () => {
        setTimeout(() => {
          setFloatingXp(null);
          // If free trial reached 3 words and user is not premium / owner:
          if (!isPremiumActive && !isAuthorizedOwner && newFreeCount >= 3) {
            setIsLimitReached(true);
            setShowPremiumModal(true);
            return;
          }
          goToNextSentence();
        }, 350);
      });
    } else {
      // INCORRECT OR INCOMPLETE
      soundSynth.playErrorSound();
      setIsShake(true);
      setErrorMessage("Javob mos kelmadi. Qayta tekshirib ko'ring!");

      setTimeout(() => {
        setIsShake(false);
      }, 600);

      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  }, [currentItem, isVerifying, isSuccess, isPremiumActive, isAuthorizedOwner, freePracticedCount, sessionStartTime, targetTokens, userWords, speakEnglish, goToNextSentence]);

  // -------------------------------------------------------------
  // KEYBOARD INPUT & WORD SLOT NAVIGATION
  // -------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSuccess || !currentItem) return;

    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    // ENTER: Submit & verify
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyCurrentSentence();
      return;
    }

    // SPACE: Move to next word slot
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      const currentVal = userWords[activeWordIndex] || '';
      if (currentVal.trim().length > 0 && activeWordIndex < targetTokens.length - 1) {
        setActiveWordIndex(prev => prev + 1);
        soundSynth.playKeyPress('cherry-blue');
      }
      return;
    }

    // BACKSPACE: Delete or step back to previous word slot
    if (e.key === 'Backspace') {
      const currentVal = userWords[activeWordIndex] || '';
      if (currentVal.length === 0 && activeWordIndex > 0) {
        e.preventDefault();
        setActiveWordIndex(prev => prev - 1);
        return;
      }
    }

    // LEFT ARROW: Move to previous slot
    if (e.key === 'ArrowLeft' && activeWordIndex > 0) {
      const currentVal = userWords[activeWordIndex] || '';
      if (currentVal.length === 0) {
        e.preventDefault();
        setActiveWordIndex(prev => prev - 1);
      }
      return;
    }

    // RIGHT ARROW: Move to next slot
    if (e.key === 'ArrowRight' && activeWordIndex < targetTokens.length - 1) {
      const currentVal = userWords[activeWordIndex] || '';
      if (currentVal.length > 0) {
        e.preventDefault();
        setActiveWordIndex(prev => prev + 1);
      }
      return;
    }

    // Shortcut: Ctrl+H or Cmd+H to toggle answer hint
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      setShowAnswer(prev => !prev);
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSuccess || !currentItem) return;

    const val = e.target.value;

    // Check if user pasted or typed multiple words separated by space
    if (val.includes(' ')) {
      const parts = val.split(/\s+/).filter(Boolean);
      if (parts.length > 1) {
        const nextWords = [...userWords];
        let idx = activeWordIndex;
        parts.forEach((part) => {
          if (idx < targetTokens.length) {
            nextWords[idx] = part;
            idx++;
          }
        });
        setUserWords(nextWords);
        setActiveWordIndex(Math.min(targetTokens.length - 1, idx));
        soundSynth.playKeyPress('cherry-blue');
        return;
      }
    }

    // Standard single word character update
    const nextWords = [...userWords];
    nextWords[activeWordIndex] = val.trim();
    setUserWords(nextWords);
    soundSynth.playKeyPress('cherry-blue');
  };

  // Start specific lesson
  const startLesson = (lessonId: number) => {
    // If trial limit reached:
    if (!isPremiumActive && !isAuthorizedOwner && freePracticedCount >= 3) {
      setIsLimitReached(true);
      setShowPremiumModal(true);
      return;
    }

    setActiveLessonId(lessonId);
    setCurrentItemIndex(0);
    setUserWords([]);
    setActiveWordIndex(0);
    setIsSuccess(false);
    setIsVerifying(false);
    setErrorMessage(null);
    setSessionStartTime(null);
    setShowCompleteModal(false);
    focusInput();
  };

  const handleNextLesson = () => {
    if (activeLessonId < TOTAL_ENGLISH_LESSONS) {
      const nextId = activeLessonId + 1;
      const nextLesson = ENGLISH_LESSONS.find(l => l.id === nextId);
      if (nextLesson && nextLesson.unitNumber !== currentUnit) {
        setCurrentUnit(nextLesson.unitNumber);
      }
      startLesson(nextId);
    }
  };

  // -------------------------------------------------------------
  // ACCESS RESTRICTION: ONLY OWNER OR PREMIUM USERS (OR FREE 3-WORD TRIAL)
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-16 text-center select-none">
        <div className="w-10 h-10 rounded-full border-3 border-[var(--sub-alt)] border-t-amber-400 animate-spin mb-4" />
        <p className="text-xs font-mono font-bold tracking-wider text-[var(--sub-color)] uppercase">
          Tekshirilmoqda...
        </p>
      </div>
    );
  }

  // If user is not authorized owner and page is temporarily closed:
  if (!isAuthorizedOwner && !isPremiumActive && freePracticedCount >= 3) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-16 text-center select-none animate-in fade-in duration-300">
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-[#0e1628] to-slate-950 border border-amber-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/15 to-transparent border border-amber-500/40 text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
            <Lock className="w-9 h-9 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 ta Bepul Sinov Yakunlandi</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              ASSALOMU ALAYKUM, BU SAHIFA VAQTINCHALIK YOPIQ!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              Siz bepul sinovdagi 3 ta mashqni bajardingiz. English tilini 0 dan IELTS 9 gacha to'liq o'rganish va cheksiz mashq qilish uchun <strong>Click orqali Premium</strong> oling yoki muallif hisobiga kiring.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsLimitReached(true);
                setShowPremiumModal(true);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Crown className="w-4 h-4" />
              <span>Click orqali Premium Olish (10,000 so'mdan)</span>
            </button>

            {!user ? (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Muallif hisobiga kirish</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Boshqa hisobga o'tish</span>
              </button>
            )}

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Bosh sahifaga qaytish</span>
              </button>
            )}
          </div>
        </div>

        <EnglishPremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          userId={user?.uid || user?.email || 'guest'}
          userEmail={user?.email || undefined}
          isLimitReached={true}
        />
      </div>
    );
  }

  // Current active word for the hidden input
  const currentActiveWordValue = userWords[activeWordIndex] || '';

  // Progress percentage
  const progressPercent = Math.round(((currentItemIndex + 1) / activeLesson.items.length) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Payment Success Alert */}
      {showPaymentSuccessAlert && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/50 p-4 flex items-center justify-between gap-3 text-xs text-emerald-200 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-sm">To'lov muvaffaqiyatli qabul qilindi! 🎉</span>
              <span>English kursi uchun Premium obunangiz faollashtirildi. Barcha darslar to'liq ochiq!</span>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentSuccessAlert(false)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:brightness-110 cursor-pointer"
          >
            Tushundim
          </button>
        </div>
      )}

      {/* Top Banner: Owner or Premium Status */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          {isAuthorizedOwner ? (
            <span>Muallif Rejimi: Siz <strong className="text-white font-mono">yuldashivagavharoy@gmail.com</strong> hisobi bilan kirdingiz. Barcha 35 ta dars siz uchun to'liq ochiq!</span>
          ) : isPremiumActive ? (
            <span>VIP Premium Faol: {subscriptionPlan?.toUpperCase()} &bull; Barcha darslar cheksiz ochiq! ({remainingDays ? `${remainingDays} kun qoldi` : 'Aktiv'})</span>
          ) : (
            <span>Sinov Rejimi: 3 ta bepul mashqdan <strong>{Math.min(3, freePracticedCount)}/3</strong> tasi bajarildi.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isPremiumActive && !isAuthorizedOwner && (
            <button
              onClick={() => {
                setIsLimitReached(false);
                setShowPremiumModal(true);
              }}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 text-[11px] font-mono font-black flex items-center gap-1 cursor-pointer shadow-md"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Premium Olish</span>
            </button>
          )}

          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black shrink-0 shadow-xs">
            {isAuthorizedOwner ? "VIP OWNER" : isPremiumActive ? "PREMIUM VIP" : "FREE TRIAL"}
          </span>
        </div>
      </div>

      {/* ============================================================
          MAIN JULEBU.AI STYLE INTERACTIVE ARENA CARD
          ============================================================ */}
      <div 
        onClick={focusInput}
        className={`relative rounded-3xl bg-[#0e121d] border border-slate-800/90 shadow-2xl p-5 sm:p-8 md:p-10 min-h-[480px] flex flex-col justify-between overflow-hidden backdrop-blur-xl transition-all duration-300 ${
          isShake ? 'animate-shake' : ''
        }`}
        style={{
          boxShadow: isSuccess 
            ? '0 0 50px -10px rgba(16, 185, 129, 0.35)' 
            : '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        {/* TOP TOAST NOTIFICATION (MATCHING JULEBU.AI 不在答案页) */}
        {errorMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/95 border border-rose-500/50 text-rose-300 text-xs font-medium shadow-2xl shadow-rose-950/80 backdrop-blur-md">
              <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* TOP BAR: INSTRUCTIONS, PROGRESS BAR, SCORE */}
        <div className="relative space-y-3 z-10">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="hidden sm:inline">Klaviaturadan inglizcha yozing, bo'sh joy (Space) yoki tasdiqlash uchun (Enter)</span>
              <span className="sm:hidden">Inglizcha yozing (Space / Enter)</span>
              <span className="font-bold text-slate-200">
                ({currentItemIndex + 1}/{activeLesson.items.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {floatingXp && (
                <span className="text-xs font-mono font-black text-emerald-400 animate-bounce">
                  +{floatingXp} XP
                </span>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-amber-400 font-mono font-black text-xs sm:text-sm shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{totalXp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CENTER CONTENT: HINT PILL, UZBEK PROMPT, WORD SLOTS */}
        <div className="relative my-8 sm:my-10 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 z-10">
          
          {/* Top Hint Bubble */}
          {currentItem && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              {showAnswer ? (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEnglish(currentItem.english);
                  }}
                  className="group px-6 sm:px-8 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/70 hover:border-sky-500/50 shadow-xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center max-w-lg"
                  title="Talaffuzni eshitish uchun bosing"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-2xl font-black text-white tracking-wide font-sans">
                      {currentItem.english}
                    </span>
                    <Volume2 className={`w-4 h-4 text-sky-400 transition-transform ${isSpeaking ? 'scale-125 text-amber-400' : 'group-hover:scale-110'}`} />
                  </div>
                  {currentItem.phonetic && (
                    <span className="text-xs sm:text-sm font-mono text-slate-400 tracking-wider mt-0.5">
                      {currentItem.phonetic}
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAnswer(true);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Javob yashirilgan (Ko'rish uchun bosing)</span>
                </div>
              )}
            </div>
          )}

          {/* Central Uzbek Translation Prompt */}
          {currentItem && (
            <div className="space-y-1 max-w-2xl px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-snug">
                {currentItem.uzbek}
              </h2>
            </div>
          )}

          {/* WORD SLOTS WITH INDIVIDUAL UNDERLINES (JULEBU SIGNATURE) */}
          <div className="w-full max-w-3xl flex flex-wrap items-end justify-center gap-x-4 sm:gap-x-6 gap-y-6 pt-2">
            {targetTokens.map((token, idx) => {
              const userWord = userWords[idx] || '';
              const isActive = idx === activeWordIndex;
              const hasContent = userWord.length > 0;

              const baseUnderlineColor = SLOT_UNDERLINE_COLORS[idx % SLOT_UNDERLINE_COLORS.length];
              const underlineColor = isSuccess 
                ? '#10b981' 
                : isActive 
                ? '#38bdf8' 
                : hasContent 
                ? baseUnderlineColor 
                : baseUnderlineColor;

              const minWidthPx = Math.max(54, token.core.length * 16);

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveWordIndex(idx);
                    focusInput();
                  }}
                  className={`group relative flex flex-col items-center cursor-pointer transition-all ${
                    isActive ? 'scale-105' : 'hover:opacity-90'
                  }`}
                  style={{ minWidth: `${minWidthPx}px` }}
                >
                  <div className="h-9 sm:h-11 flex items-center justify-center px-1 font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-wider transition-colors duration-150">
                    <span className={isSuccess ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-emerald-400'}>
                      {userWord}
                    </span>

                    {isActive && !isSuccess && (
                      <span className="w-0.5 h-6 sm:h-7 bg-amber-400 ml-0.5 animate-pulse rounded-full" />
                    )}

                    {token.trailingPunc && (
                      <span className="text-slate-400 text-lg sm:text-xl font-bold ml-0.5">
                        {token.trailingPunc}
                      </span>
                    )}
                  </div>

                  <div
                    className="w-full h-[3px] rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: underlineColor,
                      boxShadow: isActive || isSuccess 
                        ? `0 0 10px ${underlineColor}` 
                        : 'none',
                      opacity: isActive ? 1 : hasContent ? 0.9 : 0.6
                    }}
                  />
                </div>
              );
            })}
          </div>

        </div>

        {/* BOTTOM ACTION BUTTONS (EXACT JULEBU 3 BUTTONS) */}
        <div className="relative pt-4 sm:pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono z-10">
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (currentItem) speakEnglish(currentItem.english);
            }}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-slate-800/60"
          >
            <Volume2 className={`w-4 h-4 text-sky-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>Talaffuzni eshitish</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              verifyCurrentSentence();
            }}
            disabled={isSuccess}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <CornerDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Tekshirish (Enter)</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAnswer(prev => !prev);
            }}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-slate-800/60"
          >
            {showAnswer ? (
              <>
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span>Javobni yashirish</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Javobni ko'rsatish</span>
              </>
            )}
          </button>

        </div>

        {/* OFFSCREEN / HIDDEN INPUT CAPTURING ACTUAL KEYSTROKES */}
        <input
          ref={inputRef}
          type="text"
          value={currentActiveWordValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="absolute -top-[9999px] -left-[9999px] opacity-0 pointer-events-none"
        />

      </div>

      {/* COURSE NAVIGATOR: 7 UNITS & 35 LESSONS PICKER */}
      <div className="rounded-2xl bg-[#0e121d] border border-slate-800/80 p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Kurs Bo'limlari (Units 1 - 7 &bull; 0 dan IELTS 9 gacha)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Dars: <strong className="text-white">{activeLesson.title}</strong></span>
          </div>
        </div>

        {/* 7 Unit Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {COURSE_LEVELS.map((lvl) => {
            const isSelected = lvl.id === currentUnit;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  setCurrentUnit(lvl.id);
                  const firstLessonOfUnit = ENGLISH_LESSONS.find(l => l.unitNumber === lvl.id);
                  if (firstLessonOfUnit) {
                    startLesson(firstLessonOfUnit.id);
                  }
                }}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-lg scale-102'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-black">Unit {lvl.id}</span>
                <span className="text-[10px] font-mono opacity-80">{lvl.cefr}</span>
              </button>
            );
          })}
        </div>

        {/* 5 Lessons in Current Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2">
          {unitLessons.map((lesson) => {
            const isCurrent = lesson.id === activeLessonId;
            const prog = progressMap[lesson.id];
            const isCompleted = prog?.completed;

            return (
              <div
                key={lesson.id}
                onClick={() => startLesson(lesson.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{lesson.id}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-white line-clamp-1">
                  {lesson.title.split(':')[1] || lesson.title}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1">
                  {lesson.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LESSON COMPLETE CONGRATS MODAL */}
      {showCompleteModal && lastFinishedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 to-[#0e1628] border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-center space-y-6 relative">
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Dars Muvaffaqiyatli Yakunlandi!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {activeLesson.title} bo'yicha barcha jumlalarni to'liq yozib o'rgandingiz.
              </p>
            </div>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-8 h-8 transition-all ${
                    starIdx <= lastFinishedStats.stars
                      ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900">
                <div className="text-[10px] text-slate-400 uppercase">Tezlik</div>
                <div className="text-sm font-black text-amber-400">{lastFinishedStats.wpm} WPM</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900">
                <div className="text-[10px] text-slate-400 uppercase">Aniqlik</div>
                <div className="text-sm font-black text-emerald-400">{lastFinishedStats.accuracy}%</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900">
                <div className="text-[10px] text-slate-400 uppercase">Mukofot</div>
                <div className="text-sm font-black text-sky-400">+{lastFinishedStats.xpEarned} XP</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => startLesson(activeLessonId)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta topshirish</span>
              </button>

              <button
                onClick={handleNextLesson}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Keyingi Dars</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* English Premium Modal */}
      <EnglishPremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userId={user?.uid || user?.email || 'guest'}
        userEmail={user?.email || undefined}
        isLimitReached={isLimitReached}
      />

    </div>
  );
};
