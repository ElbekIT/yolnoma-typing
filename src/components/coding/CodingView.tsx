import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Play,
  Send,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  Search,
  Filter,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Layers,
  Flame,
  Award,
  Clock,
  Terminal,
  Cpu,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CodingProblem, CodingLanguage, TestResult } from '../../types/coding';
import { CODING_PROBLEMS } from '../../data/codingProblems';
import { runCodeOnTestCases } from '../../utils/codeRunner';
import {
  getLocalCodingProgress,
  markProblemSolved,
  saveCodeDraft,
  getCodeDraft,
  getRankBadge
} from '../../utils/codingStorage';
import { CodingLeaderboard } from './CodingLeaderboard';
import { useAuth } from '../../context/AuthContext';

export const CodingView: React.FC = () => {
  const { user, profile } = useAuth();

  // Navigation tab inside coding view
  const [activeSubTab, setActiveSubTab] = useState<'solve' | 'leaderboard'>('solve');

  // Selected stage filter (0 = all, 1, 2, 3)
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Selected problem
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);

  // Coding language
  const [language, setLanguage] = useState<CodingLanguage>('javascript');

  // User's code in the editor
  const [code, setCode] = useState<string>(() => {
    return (
      getCodeDraft(CODING_PROBLEMS[0].id, 'javascript') ||
      CODING_PROBLEMS[0].starterCode.javascript
    );
  });

  // Progress state
  const [progress, setProgress] = useState(() => getLocalCodingProgress());

  // Running & Test state
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTestTab, setActiveTestTab] = useState<number>(1);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [allPassedNotification, setAllPassedNotification] = useState<boolean>(false);
  const [awardedXP, setAwardedXP] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);

  // Editor ref & line numbers
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // When problem or language changes, load draft or starter code
  useEffect(() => {
    const draft = getCodeDraft(selectedProblem.id, language);
    if (draft) {
      setCode(draft);
    } else {
      setCode(selectedProblem.starterCode[language]);
    }
    setTestResults([]);
    setSyntaxError(null);
    setExecutionLogs([]);
    setAllPassedNotification(false);
    setShowHint(false);
    setActiveTestTab(1);
  }, [selectedProblem, language]);

  // Handle Code changes and save draft
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveCodeDraft(selectedProblem.id, language, newCode);
  };

  // Synchronize scrolling between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Support Tab key in editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  '; // 2 spaces indentation

      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);
      saveCodeDraft(selectedProblem.id, language, newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  // Reset to initial boilerplate
  const handleResetCode = () => {
    const starter = selectedProblem.starterCode[language];
    setCode(starter);
    saveCodeDraft(selectedProblem.id, language, starter);
    setTestResults([]);
    setSyntaxError(null);
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Code against the 10 test cases
  const handleRunTests = async (isSubmit: boolean = false) => {
    setIsRunning(true);
    setSyntaxError(null);
    setAllPassedNotification(false);

    // Small delay to let UI render loading spinner
    await new Promise((r) => setTimeout(r, 200));

    const result = await runCodeOnTestCases(
      code,
      language,
      selectedProblem.functionName,
      selectedProblem.testCases
    );

    setIsRunning(false);
    setTestResults(result.results);
    setExecutionLogs(result.logs);

    if (result.syntaxError) {
      setSyntaxError(result.syntaxError);
      return;
    }

    // If submit and all 10 tests passed!
    if (result.allPassed) {
      const { isNewSolve, pointsAwarded, updatedProgress } = markProblemSolved(
        selectedProblem.id,
        user?.uid,
        {
          displayName: profile?.displayName || user?.displayName,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl
        }
      );

      setProgress(updatedProgress);
      setAwardedXP(isNewSolve ? pointsAwarded : 0);
      setAllPassedNotification(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      // Find first failing test and open its tab
      const firstFailed = result.results.find((t) => !t.passed);
      if (firstFailed) {
        setActiveTestTab(firstFailed.testId);
      }
    }
  };

  // Switch to next problem
  const handleNextProblem = () => {
    const currentIdx = CODING_PROBLEMS.findIndex((p) => p.id === selectedProblem.id);
    if (currentIdx < CODING_PROBLEMS.length - 1) {
      setSelectedProblem(CODING_PROBLEMS[currentIdx + 1]);
    }
    setAllPassedNotification(false);
  };

  // Filtered problems list
  const filteredProblems = CODING_PROBLEMS.filter((p) => {
    const matchesStage = selectedStage === 0 || p.stage === selectedStage;
    const matchesSearch =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const isSolved = progress.solvedProblemIds.includes(selectedProblem.id);
  const totalSolved = progress.solvedProblemIds.length;
  const lineCount = Math.max(code.split('\n').length, 12);
  const currentTest = testResults.find((t) => t.testId === activeTestTab) || {
    testId: activeTestTab,
    inputDisplay: selectedProblem.testCases[activeTestTab - 1]?.inputDisplay || '',
    expected: selectedProblem.testCases[activeTestTab - 1]?.expected,
    actual: undefined,
    passed: false,
    executionTimeMs: 0,
    isHidden: selectedProblem.testCases[activeTestTab - 1]?.isHidden
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 font-mono space-y-4 animate-in fade-in duration-200">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[var(--text-color)]">
                Kodlash Arenasi
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Online Judge
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)]">
              Interactive Coding Platform & Algoritmlar (JavaScript / Python)
            </p>
          </div>
        </div>

        {/* Sub-tabs & User Stats */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Solved Stat Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[var(--text-color)] font-bold">
              {totalSolved} / {CODING_PROBLEMS.length}
            </span>
            <span className="text-[var(--sub-color)] hidden md:inline">yechildi</span>
            <span className="text-cyan-400 font-black ml-1">+{progress.totalScore} XP</span>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-[var(--sub-alt)]/50 p-1 rounded-xl border border-[var(--sub-alt)]">
            <button
              onClick={() => setActiveSubTab('solve')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'solve'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Masalalar</span>
            </button>
            <button
              onClick={() => setActiveSubTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'leaderboard'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Reyting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'leaderboard' ? (
        <CodingLeaderboard onGoToSolve={() => setActiveSubTab('solve')} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Problem List & Filters (3 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Stage Selector Pills */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-2.5 space-y-2">
              <div className="text-[11px] font-bold text-[var(--sub-color)] uppercase tracking-wider px-1">
                Bosqichlar
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setSelectedStage(0)}
                  className={`px-2.5 py-1.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedStage === 0
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-[var(--sub-alt)]/40 text-[var(--sub-color)] hover:text-[var(--text-color)] border-[var(--sub-alt)]'
                  }`}
                >
                  <span>Barchasi</span>
                  <span className="text-[10px] opacity-80">30 ta</span>
                </button>
                <button
                  onClick={() => setSelectedStage(1)}
                  className={`px-2.5 py-1.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedStage === 1
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-[var(--sub-alt)]/40 text-[var(--sub-color)] hover:text-[var(--text-color)] border-[var(--sub-alt)]'
                  }`}
                >
                  <span>1-Bosqich</span>
                  <span className="text-[10px] opacity-80">Boshlang'ich</span>
                </button>
                <button
                  onClick={() => setSelectedStage(2)}
                  className={`px-2.5 py-1.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedStage === 2
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-[var(--sub-alt)]/40 text-[var(--sub-color)] hover:text-[var(--text-color)] border-[var(--sub-alt)]'
                  }`}
                >
                  <span>2-Bosqich</span>
                  <span className="text-[10px] opacity-80">O'rta</span>
                </button>
                <button
                  onClick={() => setSelectedStage(3)}
                  className={`px-2.5 py-1.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedStage === 3
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-[var(--sub-alt)]/40 text-[var(--sub-color)] hover:text-[var(--text-color)] border-[var(--sub-alt)]'
                  }`}
                >
                  <span>3-Bosqich</span>
                  <span className="text-[10px] opacity-80">Algoritmlar</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative pt-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sub-color)]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Masala qidirish..."
                  className="w-full bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Problem List Items */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-2 max-h-[520px] overflow-y-auto space-y-1 divide-y divide-[var(--sub-alt)]/30">
              {filteredProblems.map((p) => {
                const solved = progress.solvedProblemIds.includes(p.id);
                const isSelected = selectedProblem.id === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProblem(p)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/50 text-[var(--text-color)]'
                        : 'hover:bg-[var(--sub-alt)]/40 text-[var(--sub-color)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {solved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[var(--sub-color)]/50 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] opacity-60">#{p.number}</span>
                          <span className="text-xs font-bold truncate text-[var(--text-color)]">
                            {p.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--sub-color)]">
                          <span>{p.category}</span>
                          <span>•</span>
                          <span
                            className={
                              p.difficulty === 'Oson'
                                ? 'text-emerald-400'
                                : p.difficulty === "O'rta"
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {p.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-cyan-400 shrink-0">
                      +{p.points} XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Problem Details, Code Editor & Test Cases (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Problem Header & Info Box */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sub-alt)] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {selectedProblem.stageName} #{selectedProblem.number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedProblem.difficulty === 'Oson'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedProblem.difficulty === "O'rta"
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {selectedProblem.difficulty}
                  </span>
                  <span className="text-xs text-[var(--sub-color)]">
                    {selectedProblem.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSolved && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Yechilgan
                    </span>
                  )}
                  <span className="text-xs font-bold text-cyan-400">
                    +{selectedProblem.points} XP
                  </span>
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h2 className="text-base sm:text-lg font-black text-[var(--text-color)] mb-2">
                  {selectedProblem.title}
                </h2>
                <p className="text-xs text-[var(--text-color)]/90 leading-relaxed">
                  {selectedProblem.description}
                </p>
              </div>

              {/* Input / Output Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[var(--sub-alt)]/30 p-2.5 rounded-xl border border-[var(--sub-alt)]/50">
                <div>
                  <span className="text-[var(--sub-color)] font-bold">Kiritish formati:</span>
                  <p className="text-[var(--text-color)] mt-0.5">{selectedProblem.inputFormat}</p>
                </div>
                <div>
                  <span className="text-[var(--sub-color)] font-bold">Chiqarish formati:</span>
                  <p className="text-[var(--text-color)] mt-0.5">{selectedProblem.outputFormat}</p>
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--sub-color)] uppercase tracking-wider">
                  Misollar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProblem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-[var(--sub-alt)]/40 p-2.5 rounded-xl border border-[var(--sub-alt)] text-xs space-y-1 font-mono"
                    >
                      <div>
                        <span className="text-[var(--sub-color)]">Kiritish: </span>
                        <code className="text-cyan-400">{ex.input}</code>
                      </div>
                      <div>
                        <span className="text-[var(--sub-color)]">Natija: </span>
                        <code className="text-emerald-400">{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="text-[10px] text-[var(--sub-color)] pt-1 border-t border-[var(--sub-alt)]/40">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint Toggle */}
              {selectedProblem.hint && (
                <div>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Maslahatni yashirish' : 'Yordam / Maslahat kerakmi?'}</span>
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 leading-relaxed animate-in fade-in duration-150">
                      💡 {selectedProblem.hint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Code Editor Container */}
            <div className="bg-[#111622] border border-[var(--sub-alt)] rounded-2xl overflow-hidden shadow-md">
              {/* Editor Header: Language switcher, Reset, Copy, Font Size */}
              <div className="bg-[#0b0f17] border-b border-[var(--sub-alt)]/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                {/* Language Switcher Tabs */}
                <div className="flex items-center gap-1 bg-[#161d2d] p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setLanguage('javascript')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      language === 'javascript'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>JavaScript</span>
                  </button>

                  <button
                    onClick={() => setLanguage('python')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      language === 'python'
                        ? 'bg-cyan-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Python</span>
                  </button>
                </div>

                {/* Editor Action Buttons */}
                <div className="flex items-center gap-1.5 text-xs">
                  {/* Font Size Selector */}
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="bg-[#161d2d] border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px] focus:outline-none"
                    title="Shrift o'lchami"
                  >
                    <option value={12}>12px</option>
                    <option value={14}>14px</option>
                    <option value={16}>16px</option>
                  </select>

                  {/* Reset Button */}
                  <button
                    onClick={handleResetCode}
                    className="p-1.5 rounded-lg bg-[#161d2d] hover:bg-[#1f293d] text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
                    title="Boshlang'ich kodga qaytarish"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-[#161d2d] hover:bg-[#1f293d] text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
                    title="Kodni nusxalash"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Area with Line Numbers */}
              <div className="relative flex min-h-[220px] max-h-[360px] overflow-hidden bg-[#0d121c]">
                {/* Line Numbers Column */}
                <div
                  ref={lineNumbersRef}
                  className="w-10 sm:w-12 py-3 bg-[#090d14] text-slate-600 text-right pr-2 select-none border-r border-white/5 font-mono overflow-hidden"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                >
                  {Array.from({ length: lineCount }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea Code Input */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  className="flex-1 w-full py-3 px-3 bg-transparent text-emerald-300 font-mono focus:outline-none resize-none overflow-y-auto"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.6',
                    tabSize: 2
                  }}
                  placeholder="Kodingizni shu yerga yozing..."
                />
              </div>

              {/* Syntax Error Box if any */}
              {syntaxError && (
                <div className="p-3 bg-rose-950/50 border-t border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Sintaktik xatolik (Syntax Error):</span>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] opacity-90">
                      {syntaxError}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons: Run Tests vs Submit Solution */}
              <div className="bg-[#0b0f17] border-t border-[var(--sub-alt)]/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>10 ta test keys orqali tekshiriladi</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunTests(false)}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sinab ko'rish</span>
                  </button>

                  <button
                    onClick={() => handleRunTests(true)}
                    disabled={isRunning}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isRunning ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Topshirish (Submit)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results & 10 Test Cases Panel */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                    Test Natijalari (10 ta Test Keys)
                  </h3>
                </div>

                {testResults.length > 0 && (
                  <div className="text-xs font-bold">
                    {testResults.filter((t) => t.passed).length === 10 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Barcha 10 ta testdan o'tdi!
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        {testResults.filter((t) => t.passed).length} / 10 ta testdan o'tdi
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 10 Test Case Pills (1, 2, 3, 4, 5, 6, 7, 8, 9, 10) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const testId = idx + 1;
                  const res = testResults.find((t) => t.testId === testId);
                  const isSelected = activeTestTab === testId;

                  return (
                    <button
                      key={testId}
                      onClick={() => setActiveTestTab(testId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                          : res?.passed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : res && !res.passed
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-[var(--sub-alt)]/40 text-[var(--sub-color)] border-[var(--sub-alt)]'
                      }`}
                    >
                      {res?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : res && !res.passed ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--sub-color)]" />
                      )}
                      <span>Test {testId}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Test Case Inspector */}
              <div className="bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)]/60 rounded-xl p-3 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-[11px] text-[var(--sub-color)] border-b border-[var(--sub-alt)]/40 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-color)]">
                      Test Keys #{currentTest.testId}
                    </span>
                    {currentTest.isHidden && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        Maxfiy Test
                      </span>
                    )}
                  </div>

                  {currentTest.executionTimeMs > 0 && (
                    <span className="text-[var(--sub-color)]">
                      Vaqt: {currentTest.executionTimeMs} ms
                    </span>
                  )}
                </div>

                {/* Input Display */}
                <div>
                  <span className="text-[var(--sub-color)]">Kiritilgan argumentlar:</span>
                  <pre className="mt-1 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] text-cyan-400 overflow-x-auto">
                    {currentTest.inputDisplay || 'Standart qiymat'}
                  </pre>
                </div>

                {/* Expected Output vs Actual Output */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[var(--sub-color)]">Kutilgan natija (Expected):</span>
                    <pre className="mt-1 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] text-emerald-400 overflow-x-auto font-bold">
                      {JSON.stringify(currentTest.expected)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[var(--sub-color)]">Sizning kodingiz natijasi (Actual):</span>
                    <pre
                      className={`mt-1 p-2 rounded-lg bg-[var(--card-bg)] border overflow-x-auto font-bold ${
                        currentTest.actual === undefined
                          ? 'text-[var(--sub-color)] border-[var(--sub-alt)]'
                          : currentTest.passed
                          ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5'
                          : 'text-rose-400 border-rose-500/40 bg-rose-500/5'
                      }`}
                    >
                      {currentTest.actual === undefined
                        ? "Hali tekshirilmadi ('Sinab ko'rish' yoki 'Topshirish' ni bosing)"
                        : JSON.stringify(currentTest.actual)}
                    </pre>
                  </div>
                </div>

                {currentTest.error && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                    ⚠️ {currentTest.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal Celebration when all 10 tests pass */}
      {allPassedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] border-2 border-emerald-500/50 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--text-color)]">
                Qabul Qilindi! (Accepted) 🎉
              </h3>
              <p className="text-xs text-[var(--sub-color)] mt-1">
                Kodingiz barcha 10 ta testdan xatosiz va muvaffaqiyatli o'tdi!
              </p>
            </div>

            {awardedXP > 0 ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-emerald-300">
                  +{awardedXP} XP Coding Reytingingizga qo'shildi!
                </span>
              </div>
            ) : (
              <div className="text-xs text-[var(--sub-color)] font-mono">
                Masala allaqachon yechilgan edi (qayta topshirildi)
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setAllPassedNotification(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--sub-alt)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--sub-alt)]/50 transition-colors cursor-pointer"
              >
                Yopish
              </button>
              <button
                onClick={handleNextProblem}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>Keyingi Masala</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
