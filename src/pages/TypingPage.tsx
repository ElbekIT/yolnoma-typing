import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { TypingHeader } from '../components/typing/TypingHeader';
import { LiveStats } from '../components/typing/LiveStats';
import { TypingDisplay } from '../components/typing/TypingDisplay';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { ResultModal } from '../components/typing/ResultModal';
import { TextMode, TimeMode, WordCountMode, DifficultyMode, TypingResult } from '../types';
import { CodeLanguage } from '../data/codeSnippets';
import { useI18n } from '../context/I18nContext';

interface TypingPageProps {
  mode: TextMode;
  setMode: (mode: TextMode) => void;
  timeMode: TimeMode;
  setTimeMode: (time: TimeMode) => void;
  wordCountMode: WordCountMode;
  setWordCountMode: (count: WordCountMode) => void;
  difficulty: DifficultyMode;
  setDifficulty: (diff: DifficultyMode) => void;
  customText: string;
  setCustomText: (text: string) => void;
  codeLanguage: CodeLanguage;
  setCodeLanguage: (lang: CodeLanguage) => void;
  isTestActive: boolean;
  isTestFinished: boolean;
  setIsTestFinished: (finished: boolean) => void;
  targetText: string;
  typedInput: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  initTestText: () => void;
  quoteMeta?: { author: string; source?: string };
  codeLang?: string;
  currentTargetChar: string;
  liveWpm: number;
  liveCpm: number;
  liveAcc: number;
  timeLeft: number;
  elapsedSeconds: number;
  progressPercent: number;
  finalResult: TypingResult | null;
  challengeBanner: { wpm: number; acc?: number } | null;
  setChallengeBanner: (banner: { wpm: number; acc?: number } | null) => void;
  onOpenLanguagePage: () => void;
  onGoToLeaderboard: () => void;
  onOpenLogin: () => void;
  onStartTargetedPractice: (keys: string[]) => void;
  onBackToHome?: () => void;
}

export const TypingPage: React.FC<TypingPageProps> = ({
  mode,
  setMode,
  timeMode,
  setTimeMode,
  wordCountMode,
  setWordCountMode,
  difficulty,
  setDifficulty,
  customText,
  setCustomText,
  codeLanguage,
  setCodeLanguage,
  isTestActive,
  isTestFinished,
  setIsTestFinished,
  targetText,
  typedInput,
  handleInputChange,
  initTestText,
  quoteMeta,
  codeLang,
  currentTargetChar,
  liveWpm,
  liveCpm,
  liveAcc,
  timeLeft,
  elapsedSeconds,
  progressPercent,
  finalResult,
  challengeBanner,
  setChallengeBanner,
  onOpenLanguagePage,
  onGoToLeaderboard,
  onOpenLogin,
  onStartTargetedPractice,
  onBackToHome
}) => {
  const { t } = useI18n();

  return (
    <div id="typing-arena" className="w-full flex flex-col items-center justify-center py-2 sm:py-4 animate-fade-in">
      {/* Top Bar with Back button */}
      {onBackToHome && (
        <div className="w-full max-w-4xl flex items-center justify-between pb-3 px-2">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-mono font-semibold transition-all duration-200 cursor-pointer active:scale-95"
            title="Bosh sahifaga qaytish"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToHome')}</span>
          </button>

          <div className="text-[11px] font-mono text-[var(--sub-color)]/70 uppercase tracking-wider">
            {t('arenaTitle')}
          </div>
        </div>
      )}

      {/* Viral Social Challenge Banner */}
      {challengeBanner && (
        <div className="w-full max-w-2xl mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 flex items-center justify-between gap-3 text-amber-400 shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-xl shrink-0">⚡</span>
            <div className="text-xs sm:text-sm font-bold text-[var(--text-color)]">
              Do'stingiz sizni{' '}
              <span className="text-amber-400 font-mono font-black text-sm sm:text-base">
                {challengeBanner.wpm} WPM
              </span>
              {challengeBanner.acc ? ` (${challengeBanner.acc}% aniqlik)` : ''} tezlik bilan bellashuvga chaqirdi!
              <span className="hidden sm:inline text-xs font-normal text-[var(--sub-color)] ml-1.5">
                Qani, uni yengib ko'ring-chi!
              </span>
            </div>
          </div>
          <button
            onClick={() => setChallengeBanner(null)}
            className="px-2 py-1 rounded-lg text-xs font-bold text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer shrink-0"
            title="Yopish"
          >
            ✕
          </button>
        </div>
      )}

      {/* Typing Header Controls */}
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
        onOpenLanguagePage={onOpenLanguagePage}
        codeLanguage={codeLanguage}
        setCodeLanguage={setCodeLanguage}
      />

      {/* Live Stats */}
      <LiveStats
        wpm={liveWpm}
        cpm={liveCpm}
        accuracy={liveAcc}
        timeLeft={timeMode > 0 ? timeLeft : elapsedSeconds}
        progressPercent={progressPercent}
        isTestActive={isTestActive}
      />

      {/* Interactive Typing Display */}
      <TypingDisplay
        targetText={targetText}
        typedInput={typedInput}
        onInputChange={handleInputChange}
        onRestart={initTestText}
        isTestFinished={isTestFinished}
        quoteMeta={quoteMeta}
        codeLang={codeLang}
      />

      {/* Virtual Keyboard */}
      <VirtualKeyboard activeChar={currentTargetChar} />

      {/* Result Modal */}
      <ResultModal
        result={finalResult}
        onRestart={initTestText}
        onNextTest={initTestText}
        onGoToLeaderboard={() => {
          setIsTestFinished(false);
          onGoToLeaderboard();
        }}
        onOpenLogin={() => {
          setIsTestFinished(false);
          onOpenLogin();
        }}
        onStartTargetedPractice={onStartTargetedPractice}
      />
    </div>
  );
};
