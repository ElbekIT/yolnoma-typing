import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/about/AboutModal';
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
  const hasAutoPromptedAuthRef = useRef(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Auto-prompt Google sign in on site open if not logged in and never completed before
  useEffect(() => {
    const hasCompletedAuthBefore = localStorage.getItem('yolnoma_auth_completed') === 'true';
    if (!loading && !user && !hasAutoPromptedAuthRef.current && !hasCompletedAuthBefore) {
      setIsAuthOpen(true);
      hasAutoPromptedAuthRef.current = true;
    }
  }, [loading, user]);

  // When user logs in, mark auth completed, close modal and go to profile tab
  useEffect(() => {
    if (user) {
      localStorage.setItem('yolnoma_auth_completed', 'true');
      setIsAuthOpen(false);
      if (!prevUserRef.current) {
        setActiveTab('profile');
      }
    }
    prevUserRef.current = user ? user.uid : null;
  }, [user]);

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

  // Initialize test text
  const initTestText = useCallback(() => {
    const generated = generateTestText(
      mode,
      language,
      difficulty,
      wordCountMode,
      customText
    );
    setTargetText(generated.rawText);
    setTypedInput('');
    setIsTestActive(false);
    setIsTestFinished(false);
    setFinalResult(null);
    setWpmHistory([]);
    setElapsedSeconds(0);

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

    const totalSeconds = elapsedSeconds > 0 ? elapsedSeconds : (timeMode > 0 ? timeMode : 1);
    const targetChars = targetText.split('');
    const typedChars = typedInput.split('');

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
    const cpm = calculateCpm(typedInput.length, totalSeconds);
    const rawWpm = calculateWpm(typedInput.length, totalSeconds);
    const accuracy = calculateAccuracy(correctCount, typedInput.length);

    const resultObj: Omit<TypingResult, 'userId' | 'username'> = {
      wpm,
      cpm,
      rawWpm,
      accuracy,
      errors: wrongCount,
      correctChars: correctCount,
      wrongChars: wrongCount,
      extraChars: Math.max(0, typedInput.length - targetText.length),
      missedChars: Math.max(0, targetText.length - typedInput.length),
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
  }, [elapsedSeconds, timeMode, targetText, typedInput, mode, wordCountMode, difficulty, language, wpmHistory, saveTestResult]);

  // Timer loop
  useEffect(() => {
    if (isTestActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        if (timeMode > 0) {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              finishTest();
              return 0;
            }
            return prev - 1;
          });
        }

        // Capture wpm history point with real correct chars and error counts
        const targetCharsArr = targetText.split('');
        const typedCharsArr = typedInput.split('');
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

        const currentWpm = calculateWpm(currentCorrect, elapsedSeconds + 1);
        const rawWpm = calculateWpm(typedInput.length, elapsedSeconds + 1);
        setWpmHistory((prev) => [
          ...prev,
          { time: elapsedSeconds + 1, wpm: currentWpm, rawWpm, errors: currentErrors }
        ]);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, timeMode, typedInput.length, elapsedSeconds, finishTest]);

  // Input change handler
  const handleInputChange = (newInput: string) => {
    if (isTestFinished) return;

    if (!isTestActive && newInput.length > 0) {
      setIsTestActive(true);
    }

    setTypedInput(newInput);

    // If word count mode or finished text
    if (newInput.length >= targetText.length) {
      finishTest();
    }
  };

  // Live stats calculation
  const targetChars = targetText.split('');
  const typedChars = typedInput.split('');
  let liveCorrect = 0;
  typedChars.forEach((ch, idx) => {
    if (idx < targetChars.length && ch === targetChars[idx]) liveCorrect++;
  });

  const liveWpm = calculateWpm(liveCorrect, elapsedSeconds || 1);
  const liveCpm = calculateCpm(typedInput.length, elapsedSeconds || 1);
  const liveAcc = calculateAccuracy(liveCorrect, typedInput.length);
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
            />
          </div>
        )}

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'statistics' && <StatisticsView />}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'challenges' && <ChallengesView onStartChallenge={() => setActiveTab('typing')} />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenAuth={() => setIsAuthOpen(true)}
            onSavedHome={() => setActiveTab('typing')}
          />
        )}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <Footer onOpenAbout={() => setIsAboutOpen(true)} />

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
