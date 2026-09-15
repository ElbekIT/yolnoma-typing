import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Flame,
  Zap,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Trophy,
  CheckCircle2,
  ArrowLeft,
  Lightbulb,
  Keyboard,
  HelpCircle,
  Shuffle,
  Check,
  Languages,
  Award,
  Sliders,
  TrendingUp,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import {
  CURATED_SENTENCES,
  SentenceItem,
  SentenceCategory,
  SentenceLevel,
  getIeltsBandFromLevel,
  getUniqueSentenceForSession,
  getSentencesPool
} from '../data/sentencesData';
import { sentenceTracker } from '../utils/sentenceTracker';
import { sentencesSound } from '../utils/sentencesSound';
import { saveSentenceScore } from '../utils/sentencesLeaderboard';

interface SentencesPageProps {
  onBackToHome?: () => void;
  onGoToLeaderboard?: () => void;
  onOpenLogin?: () => void;
}

export type PracticeMode = 'translate' | 'missing' | 'typing';
export type CategoryFilter = 'all' | 'daily' | 'business' | 'tech' | 'ielts';

export const SentencesPage: React.FC<SentencesPageProps> = ({
  onBackToHome,
  onGoToLeaderboard
}) => {
  const { user, profile } = useAuth();
  const { uiLanguage, t } = useI18n();

  // Load stored level progress
  const initialProgress = useMemo(() => sentenceTracker.getStoredProgress(), []);

  // --------------------------------------------------------------------------
  // LEVEL & PROGRESSION ENGINE (FROM LEVEL 1 UP TO MILLIONS & IELTS 1.0 TO 9.0)
  // --------------------------------------------------------------------------
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    if (profile?.sentenceLevel && profile.sentenceLevel > 0) {
      return profile.sentenceLevel;
    }
    return initialProgress.currentLevel || 1;
  });

  const [levelXp, setLevelXp] = useState<number>(initialProgress.xp || 0);
  const [levelUpCelebration, setLevelUpCelebration] = useState<{
    level: number;
    band: string;
    label: string;
  } | null>(null);

  // Active IELTS Band info
  const ieltsBand = useMemo(() => getIeltsBandFromLevel(currentLevel), [currentLevel]);

  // XP needed for next level (smooth formula: 3 sentences for early, scaling to 5)
  const xpToNextLevel = useMemo(() => {
    if (currentLevel <= 5) return 2;
    if (currentLevel <= 30) return 3;
    if (currentLevel <= 100) return 4;
    return 5;
  }, [currentLevel]);

  // Total unique sentences seen count
  const [seenCount, setSeenCount] = useState<number>(() => sentenceTracker.getSeenCount());

  // --------------------------------------------------------------------------
  // MODES & FILTERS
  // --------------------------------------------------------------------------
  // 1. translate = Gap Tuzish & Tarjima (Strict Typing - NO chip clicking!)
  // 2. missing = Tushib Qolgan So'zni Topish (Missing Word Cloze)
  // 3. typing = Klassik Tez Yozish (Letter-by-letter)
  const [activeMode, setActiveMode] = useState<PracticeMode>('translate');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('daily');
  const [isMuted, setIsMuted] = useState<boolean>(() => sentencesSound.getMuted());

  // Current active sentence (guaranteed unique and unseen!)
  const [currentSentence, setCurrentSentence] = useState<SentenceItem>(() =>
    getUniqueSentenceForSession(currentLevel, selectedCategory)
  );

  // --------------------------------------------------------------------------
  // MODE 1: TRANSLATE & BUILD BY TYPING STATE
  // --------------------------------------------------------------------------
  const [translateInput, setTranslateInput] = useState('');
  const [isTranslateSuccess, setIsTranslateSuccess] = useState(false);
  const [isTranslateError, setIsTranslateError] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  // --------------------------------------------------------------------------
  // TRANSLATION DIRECTION (UZB -> ENG and ENG -> UZB)
  // --------------------------------------------------------------------------
  const [translationDirection, setTranslationDirection] = useState<'uz-to-en' | 'en-to-uz' | 'mixed'>('uz-to-en');
  const [currentActiveDirection, setCurrentActiveDirection] = useState<'uz-to-en' | 'en-to-uz'>('uz-to-en');

  // --------------------------------------------------------------------------
  // MODE 2: MISSING WORD STATE
  // --------------------------------------------------------------------------
  const [missingWordInput, setMissingWordInput] = useState('');
  const [isMissingSuccess, setIsMissingSuccess] = useState(false);
  const [isMissingError, setIsMissingError] = useState(false);

  // --------------------------------------------------------------------------
  // MODE 3: SPEED TYPING STATE
  // --------------------------------------------------------------------------
  const [typedInput, setTypedInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  // --------------------------------------------------------------------------
  // COMBOS & STATS
  // --------------------------------------------------------------------------
  const [completedCount, setCompletedCount] = useState(initialProgress.completedCount || 0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(initialProgress.highestCombo || 0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [comboAlert, setComboAlert] = useState<{ text: string; icon: string; id: number } | null>(null);

  // Summary modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [scoreSavedSuccess, setScoreSavedSuccess] = useState(false);

  // Input refs for instant auto-focus
  const translateInputRef = useRef<HTMLInputElement | null>(null);
  const missingInputRef = useRef<HTMLInputElement | null>(null);
  const typingHiddenInputRef = useRef<HTMLInputElement | null>(null);

  const focusCurrentInput = useCallback(() => {
    if (activeMode === 'translate') {
      translateInputRef.current?.focus();
    } else if (activeMode === 'missing') {
      missingInputRef.current?.focus();
    } else if (activeMode === 'typing') {
      typingHiddenInputRef.current?.focus();
    }
  }, [activeMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      focusCurrentInput();
    }, 60);
    return () => clearTimeout(timer);
  }, [currentSentence, activeMode, focusCurrentInput]);

  const handleToggleMute = () => {
    const muted = sentencesSound.toggleMute();
    setIsMuted(muted);
  };

  const triggerCombo = useCallback((newCombo: number) => {
    if (newCombo === 3) {
      setComboAlert({ text: 'COMBO x3!', icon: '⚡️', id: Date.now() });
      sentencesSound.playComboWhoosh(3);
    } else if (newCombo === 5) {
      setComboAlert({ text: 'COMBO x5! Olov!', icon: '🔥', id: Date.now() });
      sentencesSound.playComboWhoosh(5);
    } else if (newCombo === 10) {
      setComboAlert({ text: 'COMBO x10! Ajoyib!', icon: '✨', id: Date.now() });
      sentencesSound.playComboWhoosh(10);
    } else if (newCombo === 20) {
      setComboAlert({ text: 'COMBO x20! To\'xtatib bo\'lmas!', icon: '👑', id: Date.now() });
      sentencesSound.playComboWhoosh(20);
    } else if (newCombo > 20 && newCombo % 10 === 0) {
      setComboAlert({ text: `COMBO x${newCombo}! Afsonaviy!`, icon: '🏆', id: Date.now() });
      sentencesSound.playComboWhoosh(newCombo);
    }
  }, []);

  useEffect(() => {
    if (comboAlert) {
      const timer = setTimeout(() => {
        setComboAlert(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [comboAlert]);

  // Auto-dismiss level up celebration so user never has to click anything
  useEffect(() => {
    if (levelUpCelebration) {
      const timer = setTimeout(() => {
        setLevelUpCelebration(null);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [levelUpCelebration]);

  const resetCurrentTyping = useCallback(() => {
    setTypedInput('');
    setTranslateInput('');
    setMissingWordInput('');
    setErrorIndex(null);
    setHasStarted(false);
    setStartTime(null);
    setIsMissingSuccess(false);
    setIsMissingError(false);
    setIsTranslateSuccess(false);
    setIsTranslateError(false);
    setHintLevel(0);
    focusCurrentInput();
  }, [focusCurrentInput]);

  // Advance to next GUARANTEED UNIQUE sentence and update XP/Level
  const advanceToNextSentence = useCallback((advanceLevelOnXp = true) => {
    let nextXp = levelXp;
    let nextLevel = currentLevel;

    if (advanceLevelOnXp) {
      nextXp = levelXp + 1;
      if (nextXp >= xpToNextLevel) {
        // LEVEL UP!
        nextLevel = currentLevel + 1;
        nextXp = 0;
        const newBand = getIeltsBandFromLevel(nextLevel);

        setLevelUpCelebration({
          level: nextLevel,
          band: newBand.band,
          label: newBand.label
        });
        sentencesSound.playComboWhoosh(15);

        // Auto-save persistent progress
        sentenceTracker.saveProgress({
          currentLevel: nextLevel,
          xp: 0,
          completedCount: completedCount + 1,
          highestCombo: maxCombo
        });

        // Background sync to user profile
        if (user?.uid) {
          saveSentenceScore({
            uid: user.uid,
            playerName: profile?.displayName || user.displayName || 'O\'quvchi',
            playerAvatar: profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            wpm: 75,
            accuracy: 99,
            sentencesCompleted: completedCount + 1,
            maxCombo: maxCombo,
            category: selectedCategory,
            level: `LVL ${nextLevel}`,
            userLevel: nextLevel,
            ieltsBand: newBand.band,
            score: (completedCount + 1) * 150 + maxCombo * 100,
            createdAt: Date.now()
          }).catch(() => {});
        }
      } else {
        sentenceTracker.saveProgress({
          currentLevel,
          xp: nextXp,
          completedCount: completedCount + 1,
          highestCombo: maxCombo
        });
      }
    }

    setCurrentLevel(nextLevel);
    setLevelXp(nextXp);

    // Switch active direction if in mixed mode
    if (translationDirection === 'mixed') {
      setCurrentActiveDirection((prev) => (prev === 'uz-to-en' ? 'en-to-uz' : 'uz-to-en'));
    }

    // Fetch guaranteed unseen unique sentence for next step
    const freshSentence = getUniqueSentenceForSession(nextLevel, selectedCategory);
    setCurrentSentence(freshSentence);
    setSeenCount(sentenceTracker.getSeenCount());
    resetCurrentTyping();
  }, [levelXp, currentLevel, xpToNextLevel, completedCount, maxCombo, selectedCategory, user, profile, resetCurrentTyping, translationDirection]);

  const handleDirectionChange = (newDir: 'uz-to-en' | 'en-to-uz' | 'mixed') => {
    setTranslationDirection(newDir);
    if (newDir === 'mixed') {
      setCurrentActiveDirection('uz-to-en');
    } else {
      setCurrentActiveDirection(newDir);
    }
    resetCurrentTyping();
  };

  // --------------------------------------------------------------------------
  // HANDLERS FOR MODE 1: TRANSLATE & BUILD BY TYPING (STRICT TYPING ONLY!)
  // --------------------------------------------------------------------------
  const normalizeSentence = (str: string) => {
    return str
      .toLowerCase()
      .replace(/['’‘ʻ`]/g, "'") // Handle all types of apostrophes / tutuq belgilari
      .replace(/[^a-z0-9' a-zа-яёўқғҳ]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getAcceptedUzVariations = (uzSentence: string): string[] => {
    const list: string[] = [uzSentence];
    const clean = uzSentence.trim();

    // Support dropping personal pronouns common in natural Uzbek
    const pronouns = ['men ', 'biz ', 'u ', 'siz ', 'sen ', 'ular '];
    for (const p of pronouns) {
      if (clean.toLowerCase().startsWith(p)) {
        list.push(clean.slice(p.length));
      }
    }

    // Version without apostrophes
    list.push(clean.replace(/['’‘ʻ`]/g, ''));
    return list;
  };

  const checkTranslationMatch = useCallback(
    (textToTest: string) => {
      if (!currentSentence || isTranslateSuccess) return false;
      const normalizedInput = normalizeSentence(textToTest);
      if (!normalizedInput) return false;

      if (currentActiveDirection === 'uz-to-en') {
        // User is typing in English (Uzb -> Eng)
        const normalizedTarget = normalizeSentence(currentSentence.en);
        const acceptedList = (currentSentence.acceptedTranslations || []).map(normalizeSentence);
        acceptedList.push(normalizedTarget);
        return acceptedList.includes(normalizedInput);
      } else {
        // User is typing in Uzbek (Eng -> Uzb)
        const uzVariations = getAcceptedUzVariations(currentSentence.uz);
        const acceptedUz = (currentSentence.acceptedUzTranslations || []).concat(uzVariations);
        const normalizedList = acceptedUz.map(normalizeSentence);
        return normalizedList.includes(normalizedInput);
      }
    },
    [currentSentence, isTranslateSuccess, currentActiveDirection]
  );

  const handleTranslationSuccess = useCallback(() => {
    setIsTranslateSuccess(true);
    setIsTranslateError(false);
    sentencesSound.playSentenceSuccess();

    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setMaxCombo((prev) => Math.max(prev, nextCombo));
    setCompletedCount((prev) => prev + 1);
    triggerCombo(nextCombo);

    // Auto-advance smoothly after 360ms
    setTimeout(() => {
      advanceToNextSentence(true);
    }, 360);
  }, [combo, triggerCombo, advanceToNextSentence]);

  const handleTranslateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTranslateInput(val);
    if (!hasStarted) {
      setHasStarted(true);
      setStartTime(Date.now());
    }
    setTotalKeystrokes((prev) => prev + 1);
    sentencesSound.playKeyTick();

    // Auto-advance instant detection as soon as user types the complete sentence!
    if (checkTranslationMatch(val)) {
      handleTranslationSuccess();
    }
  };

  const handleTranslateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleShowHint();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (checkTranslationMatch(translateInput)) {
        handleTranslationSuccess();
      } else {
        setIsTranslateError(true);
        setCombo(0);
        sentencesSound.playErrorBump();
        setTimeout(() => setIsTranslateError(false), 500);
      }
    }
  };

  const handleShowHint = () => {
    sentencesSound.playClueHint();
    if (hintLevel === 0) {
      setHintLevel(1);
    } else {
      setHintLevel(2);
    }
    focusCurrentInput();
  };

  // --------------------------------------------------------------------------
  // HANDLERS FOR MODE 2: MISSING WORD
  // --------------------------------------------------------------------------
  const evaluateMissingWord = (word: string) => {
    if (!currentSentence || isMissingSuccess) return;
    const cleanAttempt = word.trim().toLowerCase();
    const cleanTarget = (currentSentence.missingWord || '').trim().toLowerCase();

    if (cleanAttempt === cleanTarget) {
      setIsMissingSuccess(true);
      setIsMissingError(false);
      setMissingWordInput(currentSentence.missingWord);
      sentencesSound.playWordCorrect();

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCompletedCount((prev) => prev + 1);
      triggerCombo(nextCombo);

      setTimeout(() => {
        advanceToNextSentence(true);
      }, 350);
    } else {
      setIsMissingError(true);
      setCombo(0);
      sentencesSound.playErrorBump();
      setTimeout(() => {
        setIsMissingError(false);
      }, 600);
    }
  };

  const handleMissingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMissingWordInput(val);
    setTotalKeystrokes((prev) => prev + 1);
    sentencesSound.playKeyTick();

    if (val.trim().toLowerCase() === (currentSentence.missingWord || '').trim().toLowerCase()) {
      evaluateMissingWord(val);
    }
  };

  const handleMissingKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      evaluateMissingWord(missingWordInput);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS FOR MODE 3: SPEED TYPING
  // --------------------------------------------------------------------------
  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const targetText = currentSentence.en;

    if (!hasStarted && rawVal.length > 0) {
      setHasStarted(true);
      setStartTime(Date.now());
    }

    if (rawVal.length < typedInput.length) {
      setTypedInput(rawVal);
      setErrorIndex(null);
      return;
    }

    const nextCharIndex = rawVal.length - 1;
    const typedChar = rawVal[nextCharIndex];
    const expectedChar = targetText[nextCharIndex];

    setTotalKeystrokes((prev) => prev + 1);

    if (typedChar === expectedChar) {
      setTypedInput(rawVal);
      setErrorIndex(null);
      sentencesSound.playKeyTick();

      if (rawVal.length === targetText.length) {
        sentencesSound.playSentenceSuccess();
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));
        setCompletedCount((prev) => prev + 1);
        triggerCombo(nextCombo);

        setTimeout(() => {
          advanceToNextSentence(true);
        }, 240);
      }
    } else {
      setMistakesCount((prev) => prev + 1);
      setErrorIndex(nextCharIndex);
      setCombo(0);
      sentencesSound.playErrorBump();
    }
  };

  const liveStats = useMemo(() => {
    if (!startTime || !hasStarted) {
      return { wpm: 0, accuracy: 100 };
    }
    const elapsedMinutes = Math.max(0.01, (Date.now() - startTime) / 60000);
    const words = (typedInput.length || translateInput.length) / 5;
    const wpm = Math.round(words / elapsedMinutes);
    const acc =
      totalKeystrokes > 0
        ? Math.round(((totalKeystrokes - mistakesCount) / totalKeystrokes) * 100)
        : 100;
    return {
      wpm: Math.min(260, Math.max(0, wpm)),
      accuracy: Math.max(0, Math.min(100, acc))
    };
  }, [startTime, hasStarted, typedInput.length, translateInput.length, totalKeystrokes, mistakesCount]);

  // --------------------------------------------------------------------------
  // AUTO PROGRESSION: RESET TO 0 (LEVEL 1) IF USER DESIRES
  // --------------------------------------------------------------------------
  const handleResetToLevelOne = () => {
    setCurrentLevel(1);
    setLevelXp(0);

    sentenceTracker.saveProgress({
      currentLevel: 1,
      xp: 0,
      completedCount,
      highestCombo: maxCombo
    });

    const fresh = getUniqueSentenceForSession(1, selectedCategory);
    setCurrentSentence(fresh);
    resetCurrentTyping();
  };

  // --------------------------------------------------------------------------
  // SAVE SCORE & PROFILE INTEGRATION
  // --------------------------------------------------------------------------
  const handleSaveToLeaderboard = async () => {
    if (isSavingScore) return;
    setIsSavingScore(true);

    const calculatedScore = Math.round(
      Math.max(1, completedCount) * 130 +
      maxCombo * 95 +
      currentLevel * 100 +
      (liveStats.wpm || 65) * 10
    );

    const record = {
      uid: user?.uid || `guest_${Date.now()}`,
      playerName: profile?.displayName || (user ? 'Yolnoma O\'quvchisi' : 'Mehmon O\'quvchi'),
      playerAvatar:
        profile?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`,
      wpm: liveStats.wpm || 65,
      accuracy: liveStats.accuracy || 98,
      sentencesCompleted: Math.max(1, completedCount),
      maxCombo: maxCombo,
      category: selectedCategory,
      level: `LVL ${currentLevel}`,
      userLevel: currentLevel,
      ieltsBand: ieltsBand.band,
      score: calculatedScore,
      createdAt: Date.now()
    };

    try {
      await saveSentenceScore(record);
      setScoreSavedSuccess(true);
      setTimeout(() => {
        if (onGoToLeaderboard) {
          onGoToLeaderboard();
        }
      }, 1000);
    } catch (err) {
      console.error('Reytingga saqlashda xatolik:', err);
    } finally {
      setIsSavingScore(false);
    }
  };

  const categoryTabs: { id: CategoryFilter; uz: string; ru: string; en: string }[] = [
    { id: 'daily', uz: '🗣 Kundalik Suhbat', ru: '🗣 Разговорный', en: '🗣 Daily Life' },
    { id: 'tech', uz: '💻 IT va Dasturlash', ru: '💻 IT и кодинг', en: '💻 Tech & Coding' },
    { id: 'business', uz: '💼 Biznes va Ish', ru: '💼 Бизнес и работа', en: '💼 Business' },
    { id: 'ielts', uz: '📚 IELTS & Akademik', ru: '📚 IELTS & Академик', en: '📚 IELTS' },
    { id: 'all', uz: '🌟 Barcha to\'plam', ru: '🌟 Все категории', en: '🌟 All' }
  ];

  // Target word count for Translate mode
  const targetWordsCount = useMemo(() => {
    if (!currentSentence) return 0;
    const text = currentActiveDirection === 'uz-to-en' ? currentSentence.en : currentSentence.uz;
    return text ? text.trim().split(/\s+/).length : 0;
  }, [currentSentence, currentActiveDirection]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-5 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--sub-alt)]/60">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--main-color)] hover:text-white text-[var(--sub-color)] transition-all cursor-pointer shadow-xs"
              title="Asosiy sahifaga qaytish"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[var(--text-color)] flex items-center gap-2">
                <span>Inglizcha Jumlalar</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-black tracking-wide uppercase border border-emerald-500/30">
                  0 dan IELTS 9 gacha
                </span>
              </h1>
            </div>
            <p className="text-xs text-[var(--sub-color)] hidden sm:block">
              Yozib gap tuzish, tushib qolgan so'zlarni topish va million xil betakror matnlar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onGoToLeaderboard && (
            <button
              onClick={onGoToLeaderboard}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Jumlalar Reytingi"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Jumlalar Reytingi</span>
            </button>
          )}

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-[var(--sub-alt)] border-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
            title={isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs (Strict typing - no chips!) */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[var(--card-bg)] rounded-2xl border border-[var(--sub-alt)]">
        <button
          onClick={() => {
            setActiveMode('translate');
            resetCurrentTyping();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'translate'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.01]'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Gap Yozish & Tarjima</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('missing');
            resetCurrentTyping();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'missing'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.01]'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tushib Qolgan So'z</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('typing');
            resetCurrentTyping();
          }}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'typing'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.01]'
              : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Tez Yozish (WPM)</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* LEVEL PROGRESSION & IELTS BAND DASHBOARD BANNER                      */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Level & Band Display */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center font-black shadow-md shadow-emerald-500/30 shrink-0">
              <span className="text-[10px] leading-none opacity-80 uppercase">LVL</span>
              <span className="text-lg leading-tight font-mono">{currentLevel}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-[var(--text-color)]">
                  Level {currentLevel}: {ieltsBand.label}
                </span>
                <span className={`px-2 py-0.5 rounded-lg border font-mono text-[11px] font-bold ${ieltsBand.badgeBg} ${ieltsBand.color}`}>
                  IELTS Band {ieltsBand.band} • {ieltsBand.cefr}
                </span>
              </div>
              <p className="text-xs text-[var(--sub-color)] mt-0.5">
                {currentLevel <= 5
                  ? '0 dan boshlang\'ich eng sodda jumlalar (2-4 ta so\'z)'
                  : currentLevel <= 25
                  ? 'Kundalik suhbat va elementar jumlalar (A1-A2)'
                  : currentLevel <= 60
                  ? 'O\'rta murakkablikdagi fe\'l va zamonlar (B1)'
                  : currentLevel <= 100
                  ? 'Murakkab bog\'langan gaplar va texnologiya (B2)'
                  : currentLevel <= 180
                  ? 'Akademik insho va rasmiy maqolalar (C1 / IELTS 7-8)'
                  : 'IELTS 9.0 Master: falsafiy va ilmiy matnlar'}
              </p>
            </div>
          </div>

          {/* Automatic Level Progression Flow Badge */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-black flex items-center gap-2 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Avto Darajalanish (0 dan)</span>
            </div>

            {currentLevel > 1 && (
              <button
                onClick={handleResetToLevelOne}
                className="px-2.5 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-rose-500/20 hover:text-rose-400 text-[var(--sub-color)] text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Qaytadan 0 dan boshlash (Level 1)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">0 dan</span>
              </button>
            )}
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--sub-color)]">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>Keyingi Levelgacha: {levelXp} / {xpToNextLevel} XP</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Jami betakror o'rganilgan: <strong className="text-[var(--text-color)]">{seenCount}</strong> ta</span>
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[var(--sub-alt)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (levelXp / xpToNextLevel) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoryTabs.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              const fresh = getUniqueSentenceForSession(currentLevel, cat.id);
              setCurrentSentence(fresh);
              resetCurrentTyping();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[var(--text-color)] text-[var(--bg-color)] shadow-xs scale-[1.02]'
                : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)]'
            }`}
          >
            {uiLanguage === 'ru' ? cat.ru : cat.uz}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* MAIN PRACTICE ARENA CARD                                             */}
      {/* ==================================================================== */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-[var(--card-bg)] border-2 border-[var(--sub-alt)] shadow-xl overflow-hidden">
        {/* Anti-repetition & Unique Guarantee Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[var(--sub-alt)]/50 text-xs font-mono text-[var(--sub-color)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Betakror Matn</span>
            </span>
            <span className="text-[11px] opacity-70">
              Ushbu matn qayta chiqmaydi
            </span>
          </div>

          <div className="flex items-center gap-4">
            {combo > 0 && (
              <div className="flex items-center gap-1 text-amber-400 font-extrabold animate-pulse">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>x{combo} STREAK</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedCount} ta yechildi</span>
            </div>

            <button
              onClick={resetCurrentTyping}
              className="p-1 rounded-lg text-[var(--sub-color)] hover:text-[var(--main-color)] transition-colors cursor-pointer"
              title="Qayta boshlash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* VIEW 1: TRANSLATE & BUILD BY TYPING (STRICT TYPING ONLY!)          */}
        {/* ================================================================== */}
        {activeMode === 'translate' && (
          <div className="space-y-5 my-2">
            {/* Translation Direction Switcher (UZB -> ENG / ENG -> UZB / Mixed) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)]/60">
              <span className="text-xs font-mono font-bold text-[var(--sub-color)] flex items-center gap-1.5 pl-1">
                <Languages className="w-4 h-4 text-emerald-400" />
                <span>Yo'nalish:</span>
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDirectionChange('uz-to-en')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    translationDirection === 'uz-to-en'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                  }`}
                >
                  <span>🇺🇿 Uzb ➔ 🇬🇧 English</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectionChange('en-to-uz')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    translationDirection === 'en-to-uz'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                  }`}
                >
                  <span>🇬🇧 English ➔ 🇺🇿 O'zbekcha</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectionChange('mixed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    translationDirection === 'mixed'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                      : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                  }`}
                  title="Har bir gapda yo'nalish navbatma-navbat almashib turadi"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>🔀 Smart Mix</span>
                </button>
              </div>
            </div>

            {/* Target Prompt in Uzbek or English */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-mono font-bold text-emerald-400">
                    {currentActiveDirection === 'uz-to-en'
                      ? '🇺🇿 O\'zbekcha ➔ 🇬🇧 Ingliz tiliga tarjima qilib yozing:'
                      : '🇬🇧 English ➔ 🇺🇿 O\'zbek tiliga tarjima qilib yozing:'}
                  </span>
                </div>

                <button
                  onClick={handleShowHint}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all cursor-pointer border border-amber-500/20"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{hintLevel > 0 ? 'To\'liq yordam' : 'Maslahat'}</span>
                </button>
              </div>

              {/* Large prominent prompt text */}
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-color)] tracking-tight">
                {currentActiveDirection === 'uz-to-en'
                  ? (uiLanguage === 'ru' ? currentSentence.ru : currentSentence.uz)
                  : currentSentence.en}
              </p>

              {/* Word Count Hint badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[var(--sub-alt)]/60 text-[var(--sub-color)] font-mono text-[11px] font-bold">
                  {targetWordsCount} ta so'zdan iborat
                </span>
                {hintLevel > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                    {currentActiveDirection === 'uz-to-en'
                      ? (hintLevel === 1
                          ? `Boshlang'ich so'z: "${currentSentence.en.split(' ')[0]}"`
                          : `To'liq javob: "${currentSentence.en}"`)
                      : (hintLevel === 1
                          ? `Boshlang'ich so'z: "${currentSentence.uz.split(' ')[0]}"`
                          : `To'liq javob: "${currentSentence.uz}"`)}
                  </span>
                )}
              </div>
            </div>

            {/* STRICT TYPING INPUT BOX */}
            <div className="space-y-2">
              <div
                className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center ${
                  isTranslateSuccess
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse'
                    : isTranslateError
                    ? 'bg-rose-500/10 border-rose-500 animate-shake'
                    : 'bg-[var(--bg-color)] border-[var(--sub-alt)] focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20'
                }`}
              >
                <input
                  ref={translateInputRef}
                  type="text"
                  value={translateInput}
                  onChange={handleTranslateTextChange}
                  onKeyDown={handleTranslateKeyDown}
                  disabled={isTranslateSuccess}
                  placeholder={
                    currentActiveDirection === 'uz-to-en'
                      ? "Inglizcha gapni shu yerga yozing (avto o'tadi)..."
                      : "O'zbekcha gapni shu yerga yozing (avto o'tadi)..."
                  }
                  autoFocus
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-transparent font-mono text-base sm:text-xl font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/40 focus:outline-none"
                />

                {/* Status Indicator */}
                <div className="shrink-0 pl-2">
                  {isTranslateSuccess ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs sm:text-sm font-mono animate-bounce">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>To'g'ri! +XP</span>
                    </div>
                  ) : isTranslateError ? (
                    <span className="text-rose-400 font-bold text-xs font-mono">Qayta urinib ko'ring!</span>
                  ) : (
                    <kbd className="px-2 py-1 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] text-[10px] font-mono font-bold">
                      ENTER ↵
                    </kbd>
                  )}
                </div>
              </div>

              {/* Instructions & Keyboard Helpers */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[var(--sub-color)]/90 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">⚡️ Auto-Flow:</span>
                  <span>Jumlani yozishingiz bilan avtomatik keyingisiga o'tadi</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] font-bold">Enter ↵ tekshirish</span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] font-bold">Tab ⇥ maslahat</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 2: MISSING WORD CLOZE                                         */}
        {/* ================================================================== */}
        {activeMode === 'missing' && (
          <div className="space-y-6 my-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--main-color)]" />
                <span className="text-xs uppercase tracking-widest font-mono font-bold text-[var(--sub-color)]">
                  {uiLanguage === 'ru' ? 'Перевод:' : 'Ma\'nosi:'}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[var(--sub-color)]">
                {uiLanguage === 'ru' ? currentSentence.ru : currentSentence.uz}
              </p>
            </div>

            {/* Sentence with Blank ______ */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-lg sm:text-2xl font-mono leading-relaxed text-[var(--text-color)]">
              {currentSentence.blankSentence.split('______').map((part, pIdx, arr) => (
                <React.Fragment key={pIdx}>
                  <span>{part}</span>
                  {pIdx < arr.length - 1 && (
                    <span
                      className={`inline-block mx-1.5 px-3 py-1 rounded-xl border-2 font-bold transition-all duration-200 ${
                        isMissingSuccess
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-bounce'
                          : isMissingError
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                          : 'bg-[var(--card-bg)] border-[var(--main-color)] text-[var(--main-color)] shadow-xs'
                      }`}
                    >
                      {isMissingSuccess ? currentSentence.missingWord : missingWordInput || '______'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Direct Input & Options */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  ref={missingInputRef}
                  type="text"
                  value={missingWordInput}
                  onChange={handleMissingInputChange}
                  onKeyDown={handleMissingKeyDown}
                  placeholder="Tushib qolgan so'zni yozing..."
                  disabled={isMissingSuccess}
                  autoFocus
                  className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-color)] border-2 font-mono text-base font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/50 focus:outline-none transition-all ${
                    isMissingSuccess
                      ? 'border-emerald-500 text-emerald-400'
                      : isMissingError
                      ? 'border-rose-500 text-rose-400'
                      : 'border-[var(--sub-alt)] focus:border-[var(--main-color)]'
                  }`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {currentSentence.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => evaluateMissingWord(option)}
                    disabled={isMissingSuccess}
                    className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--main-color)] hover:text-white text-[var(--text-color)] font-mono font-bold text-xs sm:text-sm border border-[var(--sub-alt)]/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {optIdx + 1}. {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 3: SPEED TYPING                                               */}
        {/* ================================================================== */}
        {activeMode === 'typing' && (
          <div className="space-y-6 my-2">
            <input
              ref={typingHiddenInputRef}
              type="text"
              value={typedInput}
              onChange={handleTypingChange}
              autoFocus
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="opacity-0 absolute -top-9999 left-0 pointer-events-none"
            />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--main-color)]" />
                <span className="text-xs uppercase tracking-widest font-mono font-bold text-[var(--sub-color)]">
                  {uiLanguage === 'ru' ? 'Перевод' : 'Tarjimasi'}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[var(--text-color)] leading-snug">
                {uiLanguage === 'ru' ? currentSentence.ru : currentSentence.uz}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)]">
              <div className="flex flex-wrap items-center font-mono text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-wide select-none">
                {currentSentence.en.split('').map((char, idx) => {
                  const isTyped = idx < typedInput.length;
                  const isCurrent = idx === typedInput.length;
                  const isError = errorIndex === idx;

                  let colorClass = 'text-[var(--sub-color)]/60 opacity-80';
                  if (isTyped) {
                    colorClass = 'text-emerald-400 font-bold';
                  } else if (isError) {
                    colorClass = 'text-rose-500 bg-rose-500/20 underline decoration-rose-500 animate-pulse';
                  }

                  return (
                    <span
                      key={idx}
                      className={`relative transition-colors duration-75 inline-block ${colorClass} ${
                        char === ' ' ? 'w-3 sm:w-4' : ''
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] bg-[var(--main-color)] rounded-full animate-pulse shadow-sm shadow-[var(--main-color)]" />
                      )}
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono font-bold text-[var(--sub-color)]">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-4 h-4" />
                <span>{liveStats.wpm} WPM</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span>{liveStats.accuracy}% ACC</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Arena Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-5 border-t border-[var(--sub-alt)]/40">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--sub-color)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Avtomatik O'tish Rejimi (To'g'ri yozilishi bilan darhol yangi jumla ochiladi)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSummaryModal(true)}
              className="text-xs text-[var(--sub-color)] hover:text-emerald-400 font-mono font-bold transition-colors cursor-pointer"
            >
              Mashqni yakunlash & Saqlash →
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CELEBRATION TOAST: LEVEL UP!                                        */}
      {/* ==================================================================== */}
      {levelUpCelebration && (
        <div className="fixed inset-x-4 top-6 z-50 max-w-md mx-auto p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide">
                Level Up! Darajangiz Oshdi!
              </h4>
              <p className="text-xs opacity-90">
                Endi siz <strong>Level {levelUpCelebration.level}</strong> (IELTS {levelUpCelebration.band} • {levelUpCelebration.label}) dasiz!
              </p>
            </div>
          </div>
          <button
            onClick={() => setLevelUpCelebration(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: SUMMARY & LEADERBOARD SUBMIT                                */}
      {/* ==================================================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-[var(--text-color)]">Ajoyib Natija!</h2>
              <p className="text-xs text-[var(--sub-color)] mt-1">
                Siz <strong>Level {currentLevel}</strong> (IELTS {ieltsBand.band}) darajasida {completedCount} ta betakror jumlani muvaffaqiyatli yechdingiz!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] text-left">
              <div>
                <div className="text-[10px] font-bold text-[var(--sub-color)] uppercase">Level</div>
                <div className="text-lg font-black text-emerald-400">LVL {currentLevel}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--sub-color)] uppercase">IELTS Band</div>
                <div className="text-lg font-black text-amber-400">{ieltsBand.band}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--sub-color)] uppercase">Ball</div>
                <div className="text-lg font-black text-cyan-400">
                  {completedCount * 130 + maxCombo * 95 + currentLevel * 100}
                </div>
              </div>
            </div>

            {scoreSavedSuccess ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Natijangiz va Levelingiz Reytingga muvaffaqiyatli saqlandi!</span>
              </div>
            ) : (
              <button
                onClick={handleSaveToLeaderboard}
                disabled={isSavingScore}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trophy className="w-4 h-4" />
                <span>
                  {isSavingScore
                    ? 'Reytingga saqlanmoqda...'
                    : 'Natijani Peshqadamlar Reytingiga Saqlash'}
                </span>
              </button>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  advanceToNextSentence(false);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Keyingi Jumlaga O'tish</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
