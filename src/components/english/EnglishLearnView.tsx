import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  BookOpen,
  ArrowRight,
  Send,
  HelpCircle,
  Lightbulb,
  Keyboard,
  Languages,
  Check,
  Zap,
  Clock,
  Compass,
  Trophy,
  Lock,
  ShieldAlert,
  LogIn,
  Home,
  Crown
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

export const EnglishLearnView: React.FC<EnglishLearnViewProps> = ({
  onBackToHome,
  onOpenAuth,
  onGoToLessons
}) => {
  const { user, loading } = useAuth();

  const isAuthorizedOwner = Boolean(
    user?.email && (
      user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' ||
      user.email.toLowerCase().startsWith('yuldashivagavharoy')
    )
  );
  // -------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  // Current active unit (1 to 7, each unit holds 5 lessons)
  const [currentUnit, setCurrentUnit] = useState<number>(1);
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  
  // Practice modes: 'typing' (Real-time letter-by-letter typing) or 'translate' (Write English from Uzbek prompt)
  const [practiceMode, setPracticeMode] = useState<'typing' | 'translate'>('typing');
  
  // Input tracking
  const [typingInput, setTypingInput] = useState<string>('');
  const [translateInput, setTranslateInput] = useState<string>('');
  const [translateStatus, setTranslateStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Audio settings
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 0.8 or 1.0

  // Session Statistics for current lesson
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [correctKeyCount, setCorrectKeyCount] = useState<number>(0);
  const [totalKeyCount, setTotalKeyCount] = useState<number>(0);
  const [completedItemsCount, setCompletedItemsCount] = useState<number>(0);
  
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
    // Default: Lesson 1 unlocked
    return {
      1: { completed: false, stars: 0, bestWpm: 0, bestAcc: 0 }
    };
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('yolnoma_english_xp') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_english_streak');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Current Lesson & Item
  const activeLesson: EnglishLesson = ENGLISH_LESSONS.find(l => l.id === activeLessonId) || ENGLISH_LESSONS[0];
  const currentItem: EnglishWordItem | undefined = activeLesson.items[currentItemIndex];
  const activeLevel: CourseLevel = COURSE_LEVELS.find(lvl => lvl.id === activeLesson.levelId) || COURSE_LEVELS[0];

  // Lessons in current 5-lesson unit
  const unitLessons = ENGLISH_LESSONS.filter(l => l.unitNumber === currentUnit);

  // Input element reference
  const typingInputRef = useRef<HTMLInputElement>(null);
  const translateInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // TEXT-TO-SPEECH (NATIVE PRONUNCIATION)
  // -------------------------------------------------------------
  const speakEnglish = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech safety catch
    }
  }, [speechRate]);

  // Trigger speech when item changes if autoSpeak is on
  useEffect(() => {
    if (autoSpeak && currentItem) {
      const timer = setTimeout(() => {
        speakEnglish(currentItem.english);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentItemIndex, activeLessonId, autoSpeak, speakEnglish]);

  // Keep focus on input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (practiceMode === 'typing') {
        typingInputRef.current?.focus();
      } else {
        translateInputRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [practiceMode, currentItemIndex, activeLessonId]);

  // -------------------------------------------------------------
  // SAVE PROGRESS HELPER
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

    // Unlock next lesson
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

    // Add XP (+50 for lesson completion)
    const earnedXp = 50 + (stars * 10);
    const updatedXp = totalXp + earnedXp;
    setTotalXp(updatedXp);
    try {
      localStorage.setItem('yolnoma_english_xp', updatedXp.toString());
    } catch {}

    return earnedXp;
  };

  // -------------------------------------------------------------
  // HANDLE LESSON COMPLETION
  // -------------------------------------------------------------
  const handleFinishLesson = () => {
    const elapsedSeconds = sessionStartTime ? Math.max(1, (Date.now() - sessionStartTime) / 1000) : 30;
    const finalAccuracy = totalKeyCount > 0 ? Math.round((correctKeyCount / totalKeyCount) * 100) : 98;
    
    // Approximate WPM calculation based on words
    const totalWords = activeLesson.items.reduce((acc, it) => acc + it.english.split(' ').length, 0);
    const calculatedWpm = Math.max(15, Math.round((totalWords / elapsedSeconds) * 60));

    // Calculate stars: 95%+ = 3 stars, 80%+ = 2 stars, otherwise 1 star
    let starsAwarded = 1;
    if (finalAccuracy >= 95) starsAwarded = 3;
    else if (finalAccuracy >= 82) starsAwarded = 2;

    const earnedXp = saveLessonProgress(activeLessonId, starsAwarded, calculatedWpm, finalAccuracy);

    setLastFinishedStats({
      wpm: calculatedWpm,
      accuracy: finalAccuracy,
      stars: starsAwarded,
      xpEarned: earnedXp
    });

    setShowCompleteModal(true);
    soundSynth.playCoinSound();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // -------------------------------------------------------------
  // TYPING MODE: REAL-TIME KEYSTROKE HANDLER
  // -------------------------------------------------------------
  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!currentItem) return;

    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    const target = currentItem.english;
    setTotalKeyCount(prev => prev + 1);

    // Case-insensitive check if it matches target prefix or exact match
    // E.g. If target is 'A', accepting 'a' or 'A'
    const isMatchingPrefix = target.toLowerCase().startsWith(val.toLowerCase());

    if (isMatchingPrefix) {
      setTypingInput(val);
      setCorrectKeyCount(prev => prev + 1);

      // Sound feedback on key
      soundSynth.playKeyPress('cherry-blue');

      // Check if word/sentence is fully typed
      if (val.trim().toLowerCase() === target.trim().toLowerCase()) {
        soundSynth.playCoinSound();
        setCompletedItemsCount(prev => prev + 1);
        setTypingInput('');
        setShowHint(false);

        // Advance to next item or finish lesson
        if (currentItemIndex < activeLesson.items.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          handleFinishLesson();
        }
      }
    } else {
      // Mistake sound
      soundSynth.playErrorSound();
      setTypingInput(val);
    }
  };

  // -------------------------------------------------------------
  // TRANSLATE MODE: SUBMIT & VERIFY ANSWER
  // -------------------------------------------------------------
  const handleCheckTranslation = () => {
    if (!currentItem || !translateInput.trim()) return;

    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    setTotalKeyCount(prev => prev + 1);

    // Normalize strings: remove extra punctuation and compare lowercase
    const cleanUser = translateInput.trim().toLowerCase().replace(/[.,!?'"]/g, '');
    const cleanTarget = currentItem.english.trim().toLowerCase().replace(/[.,!?'"]/g, '');

    if (cleanUser === cleanTarget) {
      setTranslateStatus('correct');
      soundSynth.playCoinSound();
      setCorrectKeyCount(prev => prev + 1);
      setCompletedItemsCount(prev => prev + 1);

      setTimeout(() => {
        setTranslateInput('');
        setTranslateStatus('idle');
        setShowHint(false);

        if (currentItemIndex < activeLesson.items.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          handleFinishLesson();
        }
      }, 700);
    } else {
      setTranslateStatus('incorrect');
      soundSynth.playErrorSound();
    }
  };

  // -------------------------------------------------------------
  // RESTART OR SWITCH LESSON
  // -------------------------------------------------------------
  const startLesson = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setCurrentItemIndex(0);
    setTypingInput('');
    setTranslateInput('');
    setTranslateStatus('idle');
    setShowHint(false);
    setSessionStartTime(null);
    setCorrectKeyCount(0);
    setTotalKeyCount(0);
    setCompletedItemsCount(0);
    setShowCompleteModal(false);
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

  // Summary counts
  const totalCompletedLessons = Object.values(progressMap).filter(p => p.completed).length;
  const totalStars = Object.values(progressMap).reduce((acc, p) => acc + (p.stars || 0), 0);

  // -------------------------------------------------------------
  // TEMPORARY RESTRICTION: ONLY yuldashivagavharoy@gmail.com CAN ACCESS
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

  if (!isAuthorizedOwner) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-16 text-center select-none animate-in fade-in duration-300">
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-[#0e1628] to-slate-950 border border-amber-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Glowing background circles */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Animated Lock Icon Badge */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/15 to-transparent border border-amber-500/40 text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
            <Lock className="w-9 h-9 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          {/* Main Title Required by User */}
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yangi Dastur &bull; Test Rejimi</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              ASSALOMU ALAYKUM, BU SAHIFA VAQTINCHALIK YOPIQ!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              Hozirda ushbu yangi <strong>"Ingliz Tilini 0 dan IELTS 9 gacha Yozib O'rganish"</strong> kursi ustida yakuniy sozlash, test va optimallashtirish ishlari olib borilmoqda.
            </p>
          </div>

          {/* Explanatory Info Card */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-slate-300">
                <span className="font-bold text-white block">Kirish cheklovi:</span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Ushbu sahifaga hozircha faqat loyiha muallifi (<code className="text-amber-400 font-mono">yuldashivagavharoy@gmail.com</code>) hisobidan kirish mumkin. Tez kunda barcha foydalanuvchilar uchun to'liq bepul ochiladi!
                </p>
              </div>
            </div>

            {user?.email && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Hozirgi hisobingiz:</span>
                <span className="font-mono text-slate-200 font-bold">{user.email}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!user ? (
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Ruxsat etilgan hisobga kirish (Login)</span>
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

            {onGoToLessons && (
              <button
                onClick={onGoToLessons}
                className="px-5 py-2.5 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--main-color)] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>10 Barmoq Mashqlari</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Authorized VIP / Owner Notice Banner */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Muallif Rejimi: Siz <strong className="text-white font-mono">yuldashivagavharoy@gmail.com</strong> hisobi bilan kirdingiz. Barcha 35 ta dars va 7 ta unit siz uchun to'liq ochiq!</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black shrink-0 shadow-xs">
          VIP ACCESS
        </span>
      </div>

      {/* ============================================================
          TOP HEADER: HERO BANNER & STATS
          ============================================================ */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1628]/80 to-slate-900/90 border border-slate-800/80 p-4 sm:p-6 overflow-hidden shadow-xl backdrop-blur-md">
        {/* Glow ambient spots */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>0 dan IELTS 9 gacha</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Languages className="w-3 h-3 text-emerald-400" />
                <span>Ingliz Tilini Yozib O'rganish</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>English Mastery by Typing</span>
              <span className="text-sm font-bold text-[var(--main-color)] font-mono">v1.0</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
              Klaviaturada yozish orqali ingliz tilini boshlang'ich alifbodan tortib, jonli dialoglar, murakkab grammatika va 
              <strong> IELTS 9.0 Band</strong> darajasidagi akademik insho jumlalarigacha o'rganing.
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-xs">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Kunlik Streak</div>
                <div className="text-xs sm:text-sm font-black text-white font-mono">{streakDays} kun</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-xs">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Jami XP</div>
                <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">{totalXp} XP</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-xs">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Yulduzlar</div>
                <div className="text-xs sm:text-sm font-black text-yellow-300 font-mono">{totalStars}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">O'tildi</div>
                <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  {totalCompletedLessons} / {TOTAL_ENGLISH_LESSONS}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN WORKSPACE: CURRENT LESSON CARD & INTERACTIVE TYPING
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Interactive Exercise Arena */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
            
            {/* Top Bar inside exercise: Level Badge, Lesson Title, Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--sub-alt)]/40">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
                  style={{ backgroundColor: activeLevel.bgGlow, color: activeLevel.color, border: `1px solid ${activeLevel.color}40` }}
                >
                  {activeLesson.unitNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[10.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: activeLevel.bgGlow, color: activeLevel.color }}
                    >
                      {activeLesson.levelBadge} &bull; {activeLevel.cefr}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--sub-color)]">
                      {activeLevel.ieltsTarget}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[var(--text-color)] leading-snug">
                    {activeLesson.title}
                  </h2>
                </div>
              </div>

              {/* Practice Mode Switcher (Typing vs Translate) */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900/70 border border-slate-800">
                <button
                  onClick={() => setPracticeMode('typing')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    practiceMode === 'typing'
                      ? 'bg-[var(--main-color)] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Harfma-harf terib yozish rejimi"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Yozib O'rganish</span>
                </button>

                <button
                  onClick={() => setPracticeMode('translate')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    practiceMode === 'translate'
                      ? 'bg-[var(--main-color)] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="O'zbekchadan inglizchaga tarjima qilib yozish rejimi"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Tarjima Qilib Yozish</span>
                </button>
              </div>
            </div>

            {/* Exercise Progress Indicator (1/10) */}
            <div className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono text-[var(--sub-color)]">
              <div className="flex items-center gap-2">
                <span>Vazifa: <strong>{currentItemIndex + 1}</strong> / {activeLesson.items.length}</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-bold">{Math.round(((currentItemIndex) / activeLesson.items.length) * 100)}% yakunlandi</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    autoSpeak 
                      ? 'bg-sky-500/15 border-sky-500/30 text-sky-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={autoSpeak ? "Avtomatik ovoz yoqilgan" : "Avtomatik ovoz o'chirilgan"}
                >
                  {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setSpeechRate(speechRate === 1.0 ? 0.8 : 1.0)}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[10px] font-bold font-mono text-slate-300 hover:text-white cursor-pointer"
                  title="Talaffuz tezligi"
                >
                  {speechRate === 1.0 ? "1.0x" : "0.8x (Sekin)"}
                </button>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-sky-400 transition-all duration-300"
                style={{ width: `${((currentItemIndex) / activeLesson.items.length) * 100}%` }}
              />
            </div>

            {/* -------------------------------------------------------------
                CURRENT ITEM DISPLAY CARD
                ------------------------------------------------------------- */}
            {currentItem && (
              <div className="space-y-6">
                
                {/* Visual Learning Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 text-center relative shadow-inner">
                  
                  {/* Uzbek Meaning Banner */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs sm:text-sm font-semibold mb-3">
                    <span>O'zbekcha:</span>
                    <strong className="text-emerald-400">{currentItem.uzbek}</strong>
                  </div>

                  {/* Target English Text (Hidden or blurred in translate mode until answered) */}
                  {practiceMode === 'typing' ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide font-sans">
                          {currentItem.english}
                        </span>
                        
                        <button
                          onClick={() => speakEnglish(currentItem.english)}
                          className="p-2.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 transition-transform active:scale-95 cursor-pointer shadow-sm"
                          title="Talaffuzni eshitish (Pronounce)"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      {currentItem.phonetic && (
                        <div className="text-xs sm:text-sm font-mono text-sky-300/80 tracking-wider">
                          Talaffuzi: {currentItem.phonetic}
                        </div>
                      )}
                    </div>
                  ) : (
                    // In Translate Mode: Prominently show Uzbek, hide English as task
                    <div className="space-y-2 py-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Quyidagi iborani ingliz tilida yozing:
                      </p>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 tracking-wide">
                        "{currentItem.uzbek}"
                      </h3>
                      
                      {showHint && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 animate-in fade-in">
                          Boshlanishi: <strong>{currentItem.english.slice(0, Math.max(1, Math.floor(currentItem.english.length / 3)))}...</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Example Context Sentence if available */}
                  {currentItem.exampleSentence && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 text-left text-xs sm:text-sm space-y-1">
                      <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Jonli nutqda qo'llanishi:</span>
                      </div>
                      <div className="text-slate-200 font-semibold italic pl-5">
                        "{currentItem.exampleSentence}"
                      </div>
                      {currentItem.exampleUzbek && (
                        <div className="text-slate-400 text-[11px] pl-5">
                          &rarr; {currentItem.exampleUzbek}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* -------------------------------------------------------------
                    INPUT FIELD & INTERACTIVE CONTROLS
                    ------------------------------------------------------------- */}
                {practiceMode === 'typing' ? (
                  // TYPING MODE INPUT
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        ref={typingInputRef}
                        type="text"
                        value={typingInput}
                        onChange={handleTypingChange}
                        placeholder="Klaviaturada aynan shu so'zni yozing..."
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        className={`w-full px-5 py-4 rounded-xl text-lg sm:text-xl font-mono tracking-wide bg-slate-900 border transition-all duration-150 outline-none text-center shadow-lg ${
                          typingInput && !currentItem.english.toLowerCase().startsWith(typingInput.toLowerCase())
                            ? 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-rose-500/20'
                            : 'border-slate-700 text-white focus:border-[var(--main-color)] focus:ring-2 focus:ring-[var(--main-color)]/20'
                        }`}
                      />

                      {/* Matching letter visual preview */}
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs font-mono text-slate-400">
                        <span>To'g'ri yozilgan harflar:</span>
                        <span className="font-bold text-emerald-400">
                          {typingInput}
                        </span>
                        <span className="opacity-40">
                          {currentItem.english.slice(typingInput.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // TRANSLATE MODE INPUT
                  <div className="space-y-3">
                    <div className="relative flex items-center gap-2">
                      <input
                        ref={translateInputRef}
                        type="text"
                        value={translateInput}
                        onChange={(e) => {
                          setTranslateInput(e.target.value);
                          if (translateStatus !== 'idle') setTranslateStatus('idle');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCheckTranslation();
                          }
                        }}
                        placeholder="Inglizcha tarjimasini kiriting va Enter bosing..."
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        className={`w-full px-5 py-4 rounded-xl text-base sm:text-lg font-sans bg-slate-900 border transition-all duration-150 outline-none shadow-lg ${
                          translateStatus === 'correct'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : translateStatus === 'incorrect'
                            ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                            : 'border-slate-700 text-white focus:border-[var(--main-color)] focus:ring-2 focus:ring-[var(--main-color)]/20'
                        }`}
                      />

                      <button
                        onClick={handleCheckTranslation}
                        disabled={!translateInput.trim()}
                        className="px-6 py-4 rounded-xl font-bold font-sans text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        <span>Tekshirish</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Feedback Status */}
                    {translateStatus === 'correct' && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Ajoyib! To'g'ri javob: "{currentItem.english}"</span>
                      </div>
                    )}

                    {translateStatus === 'incorrect' && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-center justify-between gap-2 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          <span>Xatolik bor! To'g'ri javob: <strong className="text-white underline">{currentItem.english}</strong></span>
                        </div>
                        <button
                          onClick={() => {
                            setTranslateInput(currentItem.english);
                            setTranslateStatus('idle');
                          }}
                          className="text-xs text-amber-300 hover:underline shrink-0"
                        >
                          Nusxalash
                        </button>
                      </div>
                    )}

                    {/* Hint Button */}
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="inline-flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{showHint ? "Yordamni yashirish" : "Yordam (Hint)"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--sub-alt)]/30 text-xs font-mono">
                  <button
                    onClick={() => {
                      if (currentItemIndex > 0) {
                        setCurrentItemIndex(prev => prev - 1);
                        setTypingInput('');
                        setTranslateInput('');
                        setTranslateStatus('idle');
                      }
                    }}
                    disabled={currentItemIndex === 0}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Oldingisi</span>
                  </button>

                  <button
                    onClick={() => startLesson(activeLessonId)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer"
                    title="Darsni boshidan boshlash"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Qayta boshlash</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentItemIndex < activeLesson.items.length - 1) {
                        setCurrentItemIndex(prev => prev + 1);
                        setTypingInput('');
                        setTranslateInput('');
                        setTranslateStatus('idle');
                      } else {
                        handleFinishLesson();
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--main-color)] text-slate-950 font-bold hover:brightness-110 cursor-pointer shadow-md"
                  >
                    <span>{currentItemIndex < activeLesson.items.length - 1 ? "Keyingisi" : "Yakunlash"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Course Map, Levels & 5-Lesson Unit Switcher */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Level Selector Carousel / Tabs */}
          <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[var(--main-color)]" />
                <span>Bosqichlar (Units 1 - 7)</span>
              </h3>
              <span className="text-[11px] font-mono text-[var(--sub-color)]">
                5 tadan darslik
              </span>
            </div>

            {/* Units Horizontal Carousel (1 to 7) */}
            <div className="grid grid-cols-7 gap-1.5">
              {COURSE_LEVELS.map((lvl) => {
                const isSelected = lvl.id === currentUnit;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setCurrentUnit(lvl.id);
                      // Start first lesson of this unit
                      const firstLessonOfUnit = ENGLISH_LESSONS.find(l => l.unitNumber === lvl.id);
                      if (firstLessonOfUnit) {
                        startLesson(firstLessonOfUnit.id);
                      }
                    }}
                    className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--main-color)] text-slate-950 font-black shadow-md scale-105'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                    title={`${lvl.name} (${lvl.badge})`}
                  >
                    <span className="text-xs font-black">{lvl.id}</span>
                    <span className="text-[9px] font-mono leading-none">{lvl.cefr}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Level Detail Pill */}
            <div 
              className="p-3 rounded-xl border space-y-1 transition-all"
              style={{ backgroundColor: activeLevel.bgGlow, borderColor: `${activeLevel.color}40` }}
            >
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: activeLevel.color }}>
                <span>{activeLevel.name}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700">
                  {activeLevel.ieltsTarget}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {activeLevel.description}
              </p>
            </div>
          </div>

          {/* 5-Lesson Unit Cards (Dars 1-5, Dars 6-10, ...) */}
          <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--sub-alt)]/30">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Unit {currentUnit} Darslari ({unitLessons[0]?.id}-{unitLessons[unitLessons.length - 1]?.id})</span>
              </h4>

              {/* Prev/Next Unit Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (currentUnit > 1) {
                      const prevUnit = currentUnit - 1;
                      setCurrentUnit(prevUnit);
                      const first = ENGLISH_LESSONS.find(l => l.unitNumber === prevUnit);
                      if (first) startLesson(first.id);
                    }
                  }}
                  disabled={currentUnit === 1}
                  className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Oldingi 5 ta dars"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (currentUnit < 7) {
                      const nextUnit = currentUnit + 1;
                      setCurrentUnit(nextUnit);
                      const first = ENGLISH_LESSONS.find(l => l.unitNumber === nextUnit);
                      if (first) startLesson(first.id);
                    }
                  }}
                  disabled={currentUnit === 7}
                  className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Keyingi 5 ta dars"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List of 5 Lessons */}
            <div className="space-y-2">
              {unitLessons.map((lesson) => {
                const isCurrent = lesson.id === activeLessonId;
                const prog = progressMap[lesson.id];
                const isCompleted = prog?.completed;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => startLesson(lesson.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[var(--sub-alt)]/60 border-[var(--main-color)] shadow-md'
                        : isCompleted
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/25'
                        : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                        isCurrent
                          ? 'bg-[var(--main-color)] text-slate-950'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {lesson.id}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{lesson.title.split(':')[1] || lesson.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {lesson.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Stars and status badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3 h-3 ${
                                starIdx <= (prog.stars || 1)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                          {lesson.items.length} so'z
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick jump to Next Unit Button */}
            {currentUnit < 7 && (
              <button
                onClick={() => {
                  const nextUnit = currentUnit + 1;
                  setCurrentUnit(nextUnit);
                  const first = ENGLISH_LESSONS.find(l => l.unitNumber === nextUnit);
                  if (first) startLesson(first.id);
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Keyingi 5 ta dars (Unit {currentUnit + 1})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ============================================================
          LESSON COMPLETE CONGRATS MODAL
          ============================================================ */}
      {showCompleteModal && lastFinishedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-[#0e1628] border border-amber-500/40 p-6 shadow-2xl text-center space-y-5 relative">
            
            {/* Top Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Dars Muvaffaqiyatli Yakunlandi!
              </h3>
              <p className="text-xs text-slate-300">
                {activeLesson.title} bo'yicha barcha so'z va iboralar to'liq o'zlashtirildi.
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

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center font-mono">
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-[10px] text-slate-400 uppercase">Tezlik</div>
                <div className="text-sm font-black text-amber-400">{lastFinishedStats.wpm} WPM</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-[10px] text-slate-400 uppercase">Aniqlik</div>
                <div className="text-sm font-black text-emerald-400">{lastFinishedStats.accuracy}%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
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

    </div>
  );
};
