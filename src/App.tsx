import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/about/AboutModal';
import { LoginPage } from './components/LoginPage';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { TypingHeader } from './components/typing/TypingHeader';
import { LiveStats } from './components/typing/LiveStats';
import { TypingDisplay } from './components/typing/TypingDisplay';
import { ResultModal } from './components/typing/ResultModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { PartnersView } from './components/partners/PartnersView';
// Battle and Dino game removed
import { update } from 'firebase/database';
import { BlockedScreen } from './components/BlockedScreen';
import { DevToolsBlockedScreen } from './components/DevToolsBlockedScreen';
import { LessonsView } from './components/lessons/LessonsView';
import { AdminView } from './components/admin/AdminView';
import { OwnerAboutView } from './components/owner/OwnerAboutView';
import { LanguageSelectView } from './components/languages/LanguageSelectView';
import { antiCheatManager } from './utils/antiCheat';

import {
  TextMode,
  TimeMode,
  WordCountMode,
  DifficultyMode,
  TypingResult
} from './types';
import { generateTestText, calculateWpm, calculateCpm, calculateAccuracy } from './utils/typingEngine';

function MainAppContent() {
  const { language } = useSettings();
  const { user, profile, loading, saveTestResult } = useAuth();

  // Active navigation tab with subdomain / URL parameter support (Obfuscated routing)
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const _adm = atob('YWRtaW4='); // 'admin'
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      if (hostname.startsWith(`${_adm}.`) || pathname === `/${_adm}` || searchParams.get('tab') === _adm) {
        return _adm;
      }
    } catch {}
    return 'typing';
  });
  const prevUserRef = useRef<string | null>(null);

  // DevTools detection state
  const [isDevToolsBlocked, setIsDevToolsBlocked] = useState<boolean>(() => antiCheatManager.isDevToolsOpen());

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('navigate_tab', handleNav);
    return () => window.removeEventListener('navigate_tab', handleNav);
  }, []);

  useEffect(() => {
    const unsubscribe = antiCheatManager.subscribeDevTools((isOpen) => {
      setIsDevToolsBlocked(isOpen);
    });
    return () => unsubscribe();
  }, []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Test Configurations
  const [mode, setMode] = useState<TextMode>('words');
  const [timeMode, setTimeMode] = useState<TimeMode>(30);
  const [wordCountMode, setWordCountMode] = useState<WordCountMode>(0);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy');
  const [customText, setCustomText] = useState('');

  // Test Runtime State
  const [targetText, setTargetText] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number; rawWpm: number; errors: number }[]>([]);
  const [finalResult, setFinalResult] = useState<TypingResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When user logs in, close modal and remember user
  useEffect(() => {
    if (user) {
      localStorage.setItem('yolnoma_auth_completed', 'true');
      setIsAuthOpen(false);
    }
    prevUserRef.current = user ? user.uid : null;
  }, [user]);

  const startTimeRef = useRef<number>(0);
  const typedInputRef = useRef<string>('');
  const targetTextRef = useRef<string>('');
  const totalMistakesCountRef = useRef<number>(0);

  typedInputRef.current = typedInput;
  targetTextRef.current = targetText;
  const totalKeystrokesRef = useRef<number>(0);
  const keyTimestampsRef = useRef<number[]>([]);

  // Initialize test text
  const initTestText = useCallback(() => {
    const wordCountToGenerate = timeMode > 0 ? Math.max(120, wordCountMode) : wordCountMode;
    const generated = generateTestText(
      mode,
      language,
      difficulty,
      wordCountToGenerate,
      customText
    );
    setTargetText(generated.rawText);
    setTypedInput('');
    setIsTestActive(false);
    setIsTestFinished(false);
    setFinalResult(null);
    setWpmHistory([]);
    setElapsedSeconds(0);
    startTimeRef.current = 0;
    totalKeystrokesRef.current = 0;
    totalMistakesCountRef.current = 0;
    keyTimestampsRef.current = [];

    const initialTime = timeMode > 0 ? timeMode : 60;
    setTimeLeft(initialTime);

    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, language, difficulty, wordCountMode, customText, timeMode]);

  useEffect(() => {
    initTestText();

    const handleContentUpdate = () => {
      initTestText();
    };

    // Auto-refresh text when switching back to tab/window (Monkeytype style)
    const handleFocus = () => {
      if (!startTimeRef.current && typedInputRef.current.length === 0) {
        initTestText();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !startTimeRef.current && typedInputRef.current.length === 0) {
        initTestText();
      }
    };

    window.addEventListener('custom-content-updated', handleContentUpdate);
    window.addEventListener('storage', handleContentUpdate);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Shortcut for Admin Panel (Ctrl + Shift + A or Alt + A)
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setActiveTab('admin');
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);

    return () => {
      window.removeEventListener('custom-content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleContentUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [initTestText]);

  // Handle finish test
  const finishTest = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);
    setIsTestFinished(true);

    const now = Date.now();
    const totalSeconds = startTimeRef.current > 0
      ? Math.max(1, Math.round((now - startTimeRef.current) / 1000))
      : (elapsedSeconds > 0 ? elapsedSeconds : 1);

    const targetChars = targetTextRef.current.split('');
    const typedChars = typedInputRef.current.split('');

    let correctCount = 0;
    let wrongCount = 0;

    typedChars.forEach((ch, idx) => {
      if (idx < targetChars.length) {
        if (ch === targetChars[idx]) correctCount++;
        else wrongCount++;
      } else {
        wrongCount++;
      }
    });

    const totalAttempts = Math.max(typedChars.length, correctCount + totalMistakesCountRef.current);
    const wpm = calculateWpm(correctCount, totalSeconds, typedChars.length);
    const cpm = calculateCpm(typedChars.length, totalSeconds);
    const rawWpm = calculateWpm(typedChars.length, totalSeconds);
    const accuracy = totalAttempts > 0 ? calculateAccuracy(correctCount, totalAttempts) : 0;
    const finalErrors = Math.max(wrongCount, totalMistakesCountRef.current);

    const resultObj: Omit<TypingResult, 'userId' | 'username'> = {
      wpm,
      cpm,
      rawWpm,
      accuracy,
      errors: finalErrors,
      correctChars: correctCount,
      wrongChars: finalErrors,
      extraChars: Math.max(0, typedChars.length - targetChars.length),
      missedChars: Math.max(0, targetChars.length - typedChars.length),
      backspaceCount: 0,
      testTimeSeconds: totalSeconds,
      mode,
      timeMode,
      wordCountMode,
      difficulty,
      language,
      timestamp: Date.now(),
      wpmHistory
    };

    const saved = await saveTestResult(resultObj);
    setFinalResult(saved);
  }, [elapsedSeconds, timeMode, mode, wordCountMode, difficulty, language, wpmHistory, saveTestResult]);

  // Timer loop (depends ONLY on isTestActive and timeMode)
  useEffect(() => {
    if (isTestActive) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.max(1, Math.floor((now - startTimeRef.current) / 1000));
        setElapsedSeconds(elapsed);

        if (timeMode > 0) {
          const remaining = Math.max(0, timeMode - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            finishTest();
          }
        }

        // Capture wpm history point with real correct chars and error counts
        const targetCharsArr = targetTextRef.current.split('');
        const typedCharsArr = typedInputRef.current.split('');
        let currentCorrect = 0;
        let currentErrors = 0;
        typedCharsArr.forEach((ch, idx) => {
          if (idx < targetCharsArr.length) {
            if (ch === targetCharsArr[idx]) currentCorrect++;
            else currentErrors++;
          } else {
            currentErrors++;
          }
        });

        const currentWpm = calculateWpm(currentCorrect, elapsed, typedCharsArr.length);
        const rawWpm = calculateWpm(typedCharsArr.length, elapsed);
        setWpmHistory((prev) => [
          ...prev,
          { time: elapsed, wpm: currentWpm, rawWpm, errors: currentErrors }
        ]);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, timeMode, finishTest]);

  // DevTools Security Gate (Runs before loading, login, and application screens)
  if (isDevToolsBlocked) {
    return <DevToolsBlockedScreen />;
  }

  // Loading state gate (AFTER ALL HOOKS)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center space-y-3">
        <img
          src="/yolnoma_icon.svg"
          alt="Yolnoma"
          className="w-12 h-12"
        />
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Yuklanmoqda...
        </p>
      </div>
    );
  }

  // Mandatory Login Gate if user is not authenticated (AFTER ALL HOOKS)
  if (!user) {
    return <LoginPage />;
  }

  // Blocked / Banned User Gate (Cloud & Device Local Anti-Cheat)
  const deviceBan = antiCheatManager.isDeviceBanned();
  if (profile && !profile.isBanned && deviceBan.banned) {
    antiCheatManager.clearDeviceBan();
  }

  if (profile?.role !== 'admin' && (profile?.isBanned || antiCheatManager.isDeviceBanned().banned)) {
    return <BlockedScreen reason={profile?.blockReason || antiCheatManager.isDeviceBanned().reason || undefined} />;
  }

  // Input change handler
  const handleInputChange = (newInput: string) => {
    if (isTestFinished) return;

    const now = Date.now();
    keyTimestampsRef.current.push(now);

    // Anti-cheat Bot Detection Engine
    if (keyTimestampsRef.current.length >= 15) {
      const timestamps = keyTimestampsRef.current.slice(-20);
      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;

      // Bot rules:
      // 1. Average interval < 12ms (unrealistically fast > 1000 WPM)
      // 2. Variance == 0 (robotic constant timer)
      // 3. Impossibly high WPM (> 320 WPM)
      if (avgInterval < 12 || (variance === 0 && intervals.length > 10) || liveWpm > 320) {
        if (user) {
          const reason = 'Anti-Cheat: Avto-kliker yoki robot/bot dasturi ishlatilgani sababli akkauntingiz bloklandi.';
          try {
            update(ref(rtdb, `users/${user.uid}`), {
              isBanned: true,
              blockReason: reason
            });
          } catch {}
        }
        return;
      }
    }

    if (!isTestActive && newInput.length > 0) {
      startTimeRef.current = Date.now();
      setIsTestActive(true);
    }

    if (newInput.length > typedInput.length) {
      const addedCount = newInput.length - typedInput.length;
      totalKeystrokesRef.current += addedCount;

      // Track errors on newly typed characters
      const startIndex = typedInput.length;
      for (let i = startIndex; i < newInput.length; i++) {
        const charTyped = newInput[i];
        const targetChar = targetText[i];
        if (targetChar === undefined || charTyped !== targetChar) {
          totalMistakesCountRef.current += 1;
        }
      }
    }

    setTypedInput(newInput);

    // Infinite Word Expansion for Time Mode
    if (timeMode > 0 && mode !== 'custom') {
      const remainingChars = targetText.length - newInput.length;
      if (remainingChars < 120) {
        const extraBatch = generateTestText(mode, language, difficulty, 60);
        setTargetText((prev) => prev + ' ' + extraBatch.rawText);
      }
    }

    // Finish test logic: for word count mode or custom text mode
    if (timeMode === 0 || mode === 'custom') {
      if (newInput.length >= targetText.length && targetText.length > 0) {
        finishTest();
      }
    }
  };

  // Live stats calculation (Exact International Standard - Accuracy accounts for fixed & unfixed errors)
  const hasStartedTyping = typedInput.length > 0 && isTestActive && startTimeRef.current > 0;
  const liveElapsed = hasStartedTyping
    ? Math.max(0.5, (Date.now() - startTimeRef.current) / 1000)
    : 0;

  const targetChars = targetText.split('');
  const typedChars = typedInput.split('');
  let liveCorrect = 0;
  typedChars.forEach((ch, idx) => {
    if (idx < targetChars.length && ch === targetChars[idx]) liveCorrect++;
  });

  const totalAttemptedKeystrokes = Math.max(typedInput.length, liveCorrect + totalMistakesCountRef.current);
  const liveWpm = hasStartedTyping && typedInput.length > 0
    ? calculateWpm(liveCorrect, liveElapsed, typedInput.length)
    : 0;
  const liveCpm = hasStartedTyping && typedInput.length > 0
    ? calculateCpm(typedInput.length, liveElapsed)
    : 0;
  const liveAcc = totalAttemptedKeystrokes > 0 && liveCorrect > 0
    ? calculateAccuracy(liveCorrect, totalAttemptedKeystrokes)
    : (totalAttemptedKeystrokes > 0 && totalMistakesCountRef.current > 0 ? 0 : 0);
  const progressPercent = Math.min(100, (typedInput.length / Math.max(1, targetText.length)) * 100);

  const currentTargetChar = targetText[typedInput.length] || '';

  // DevTools inspection block
  if (isDevToolsBlocked) {
    return <DevToolsBlockedScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-200 overflow-x-hidden w-full">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 overflow-x-hidden">
        {activeTab === 'typing' && (
          <div className="flex flex-col items-center justify-center py-1 sm:py-3 w-full">
            <TypingHeader
              mode={mode}
              setMode={setMode}
              timeMode={timeMode}
              setTimeMode={setTimeMode}
              wordCountMode={wordCountMode}
              setWordCountMode={setWordCountMode}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              customText={customText}
              setCustomText={setCustomText}
              onReset={initTestText}
              isTestActive={isTestActive}
              onOpenLanguagePage={() => setActiveTab('languages')}
            />

            <LiveStats
              wpm={liveWpm}
              cpm={liveCpm}
              accuracy={liveAcc}
              timeLeft={timeMode > 0 ? timeLeft : elapsedSeconds}
              progressPercent={progressPercent}
              isTestActive={isTestActive}
            />

            <TypingDisplay
              targetText={targetText}
              typedInput={typedInput}
              onInputChange={handleInputChange}
              onRestart={initTestText}
              isTestFinished={isTestFinished}
            />

            <VirtualKeyboard activeChar={currentTargetChar} />

            <ResultModal
              result={finalResult}
              onRestart={initTestText}
              onNextTest={initTestText}
              onGoToLeaderboard={() => {
                setIsTestFinished(false);
                setActiveTab('leaderboard');
              }}
            />
          </div>
        )}

        {activeTab === 'languages' && (
          <LanguageSelectView
            onConfirm={() => {
              initTestText();
              setActiveTab('typing');
            }}
            onCancel={() => setActiveTab('typing')}
          />
        )}

        {activeTab === 'lessons' && <LessonsView />}
        {/* Battle and Dino game views removed */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'statistics' && <StatisticsView />}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'challenges' && <ChallengesView onStartChallenge={() => setActiveTab('typing')} />}
        {activeTab === 'partners' && <PartnersView />}
        {activeTab === 'owner' && (
          <OwnerAboutView
            onStartTyping={() => setActiveTab('typing')}
            onGoToLessons={() => setActiveTab('lessons')}
            onGoToLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenAuth={() => setIsAuthOpen(true)}
            onSavedHome={() => setActiveTab('typing')}
          />
        )}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <Footer
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenOwner={() => setActiveTab('owner')}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      {/* Battle invite modal removed */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainAppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}
