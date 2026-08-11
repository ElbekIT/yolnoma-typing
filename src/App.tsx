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
import { BattleView } from './components/battle/BattleView';
import { PubgInviteModal, BattleInviteData } from './components/battle/PubgInviteModal';
import { rtdb } from './config/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { BlockedScreen } from './components/BlockedScreen';
import { LessonsView } from './components/lessons/LessonsView';
import { AdminView } from './components/admin/AdminView';

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

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('typing');
  const prevUserRef = useRef<string | null>(null);

  // Modals & Battle Invite
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState<BattleInviteData | null>(null);

  // Realtime Battle Invites listener
  useEffect(() => {
    if (!user) return;
    try {
      const inviteRef = ref(rtdb, `battles/invites/${user.uid}`);
      const unsubscribe = onValue(inviteRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setIncomingInvite(data as BattleInviteData);
        } else {
          setIncomingInvite(null);
        }
      });
      return () => unsubscribe();
    } catch {
      // Ignore firebase offline error
    }
  }, [user]);

  const handleAcceptInvite = (invite: BattleInviteData) => {
    if (user) {
      try {
        remove(ref(rtdb, `battles/invites/${user.uid}`));
      } catch {}
    }
    setIncomingInvite(null);
    setActiveTab('battle');
  };

  const handleDeclineInvite = (invite: BattleInviteData) => {
    if (user) {
      try {
        remove(ref(rtdb, `battles/invites/${user.uid}`));
      } catch {}
    }
    setIncomingInvite(null);
  };

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
    keyTimestampsRef.current = [];

    const initialTime = timeMode > 0 ? timeMode : 60;
    setTimeLeft(initialTime);

    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, language, difficulty, wordCountMode, customText, timeMode]);

  useEffect(() => {
    initTestText();
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

    const wpm = calculateWpm(correctCount, totalSeconds);
    const cpm = calculateCpm(typedChars.length, totalSeconds);
    const rawWpm = calculateWpm(typedChars.length, totalSeconds);
    const accuracy = calculateAccuracy(correctCount, typedChars.length);

    const resultObj: Omit<TypingResult, 'userId' | 'username'> = {
      wpm,
      cpm,
      rawWpm,
      accuracy,
      errors: wrongCount,
      correctChars: correctCount,
      wrongChars: wrongCount,
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

        const currentWpm = calculateWpm(currentCorrect, elapsed);
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

  // Loading state gate (AFTER ALL HOOKS)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center space-y-4">
        <img
          src="/yolnoma_icon.svg"
          alt="Yolnoma"
          className="w-16 h-16 animate-bounce drop-shadow-lg"
        />
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase animate-pulse">
          Yolnoma Typing Platform Yuklanmoqda...
        </p>
      </div>
    );
  }

  // Mandatory Login Gate if user is not authenticated (AFTER ALL HOOKS)
  if (!user) {
    return <LoginPage />;
  }

  // Blocked / Banned User Gate
  if (profile?.isBanned) {
    return <BlockedScreen reason={profile?.blockReason} />;
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
      totalKeystrokesRef.current += (newInput.length - typedInput.length);
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

  // Live stats calculation
  const liveElapsed = startTimeRef.current > 0 && isTestActive
    ? Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
    : (elapsedSeconds || 1);

  const targetChars = targetText.split('');
  const typedChars = typedInput.split('');
  let liveCorrect = 0;
  typedChars.forEach((ch, idx) => {
    if (idx < targetChars.length && ch === targetChars[idx]) liveCorrect++;
  });

  const liveWpm = calculateWpm(liveCorrect, liveElapsed);
  const liveCpm = calculateCpm(typedInput.length, liveElapsed);
  const totalAttempted = Math.max(typedInput.length, totalKeystrokesRef.current);
  const liveAcc = calculateAccuracy(liveCorrect, totalAttempted);
  const progressPercent = Math.min(100, (typedInput.length / Math.max(1, targetText.length)) * 100);

  const currentTargetChar = targetText[typedInput.length] || '';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'typing' && (
          <div className="flex flex-col items-center justify-center py-4">
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

        {activeTab === 'lessons' && <LessonsView />}
        {activeTab === 'battle' && <BattleView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'statistics' && <StatisticsView />}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'challenges' && <ChallengesView onStartChallenge={() => setActiveTab('typing')} />}
        {activeTab === 'partners' && <PartnersView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenAuth={() => setIsAuthOpen(true)}
            onSavedHome={() => setActiveTab('typing')}
          />
        )}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <Footer onOpenAbout={() => setIsAboutOpen(true)} />

      <PubgInviteModal
        invite={incomingInvite}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />
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
