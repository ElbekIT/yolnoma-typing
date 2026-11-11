import React, { useState, useEffect, useRef } from 'react';
import {
  WHEEL_THEMES,
  WheelThemeId,
  WheelTheme
} from './wheelThemes';
import { WheelCanvas, SpinSpeed } from './WheelCanvas';
import { CharacterRevealCanvas, RevealSpeed } from './CharacterRevealCanvas';
import { wheelAudio } from './wheelAudio';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Upload,
  Shuffle,
  ArrowDownAZ,
  Trash2,
  Sparkles,
  Trophy,
  History,
  FileText,
  ListOrdered,
  RotateCw,
  Check,
  X,
  Play,
  Palette,
  Gauge
} from 'lucide-react';

interface RandomWheelViewProps {
  onBackToHome?: () => void;
}

type ViewMode = 'wheel' | 'character';

const DEFAULT_SAMPLE_NAMES = [
  "Azizbek Karimov",
  "Gavharoy Yo'ldosheva",
  "Jasurbek Rustamov",
  "Madinabonu Rahimova",
  "Shahzodbek Aliyev",
  "Dilnoza Qosimova",
  "Boburmirzo Mirzayev",
  "Nilufarxon Saidova",
  "Otabek Mahmudov",
  "Zuhra Qodirova",
  "Sardorbek Jo'rayev",
  "Fotima Yoqubova"
];

export const RandomWheelView: React.FC<RandomWheelViewProps> = ({ onBackToHome }) => {
  // Mode: wheel or character
  const [mode, setMode] = useState<ViewMode>('wheel');

  // Selected visual theme
  const [themeId, setThemeId] = useState<WheelThemeId>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_wheel_theme');
      return (saved as WheelThemeId) || 'classic';
    } catch {
      return 'classic';
    }
  });

  // Speed controls
  const [spinSpeed, setSpinSpeed] = useState<SpinSpeed>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_wheel_spin_speed');
      return (saved as SpinSpeed) || 'normal';
    } catch {
      return 'normal';
    }
  });

  const [revealSpeed, setRevealSpeed] = useState<RevealSpeed>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_wheel_reveal_speed');
      return (saved as RevealSpeed) || 'normal';
    } catch {
      return 'normal';
    }
  });

  // Sound mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => wheelAudio.getMuted());

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);

  // Entries list state
  const [entries, setEntries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_wheel_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SAMPLE_NAMES;
  });

  const [textInput, setTextInput] = useState<string>(() => entries.join('\n'));
  const [activeSideTab, setActiveSideTab] = useState<'entries' | 'results'>('entries');

  // Spinning state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Winner modal state
  const [winner, setWinner] = useState<{ name: string; index: number } | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  // Results history
  const [results, setResults] = useState<{ name: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('yolnoma_wheel_results');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Number generator modal state
  const [showNumberModal, setShowNumberModal] = useState<boolean>(false);
  const [numFrom, setNumFrom] = useState<number>(1);
  const [numTo, setNumTo] = useState<number>(30);

  // Persist entries
  useEffect(() => {
    try {
      localStorage.setItem('yolnoma_wheel_entries', JSON.stringify(entries));
    } catch {}
  }, [entries]);

  // Persist results
  useEffect(() => {
    try {
      localStorage.setItem('yolnoma_wheel_results', JSON.stringify(results));
    } catch {}
  }, [results]);

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem('yolnoma_wheel_theme', themeId);
    } catch {}
  }, [themeId]);

  // Persist speeds
  useEffect(() => {
    try {
      localStorage.setItem('yolnoma_wheel_spin_speed', spinSpeed);
    } catch {}
  }, [spinSpeed]);

  useEffect(() => {
    try {
      localStorage.setItem('yolnoma_wheel_reveal_speed', revealSpeed);
    } catch {}
  }, [revealSpeed]);

  // Sync textarea with entries
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);
    const parsed = val
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    setEntries(parsed);
  };

  // Toggle audio
  const handleToggleMute = () => {
    const next = wheelAudio.toggleMute();
    setIsMuted(next);
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // TXT / CSV file upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      const lines = content
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (lines.length > 0) {
        setEntries(lines);
        setTextInput(lines.join('\n'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Quick operations on entries
  const handleShuffle = () => {
    const shuffled = [...entries];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setEntries(shuffled);
    setTextInput(shuffled.join('\n'));
  };

  const handleSort = () => {
    const sorted = [...entries].sort((a, b) => a.localeCompare(b, 'uz'));
    setEntries(sorted);
    setTextInput(sorted.join('\n'));
  };

  const handleClear = () => {
    if (confirm("Rostdan ham barcha ismlar ro'yxatini tozalashni xohlaysizmi?")) {
      setEntries([]);
      setTextInput('');
    }
  };

  const handleLoadSample = () => {
    setEntries(DEFAULT_SAMPLE_NAMES);
    setTextInput(DEFAULT_SAMPLE_NAMES.join('\n'));
  };

  const handleGenerateNumbers = () => {
    const from = Math.min(numFrom, numTo);
    const to = Math.max(numFrom, numTo);
    const generated: string[] = [];
    for (let i = from; i <= to; i++) {
      generated.push(String(i));
    }
    setEntries(generated);
    setTextInput(generated.join('\n'));
    setShowNumberModal(false);
  };

  // Spin callbacks
  const handleSpinStart = () => {
    setIsSpinning(true);
  };

  const handleSpinEnd = (winnerStr: string, idx: number) => {
    setIsSpinning(false);
    setWinner({ name: winnerStr, index: idx });
    setShowWinnerModal(true);

    // Append to results
    setResults(prev => [{ name: winnerStr, timestamp: Date.now() }, ...prev]);
  };

  // Winner Actions
  const handleRemoveWinner = () => {
    if (!winner) return;
    const next = entries.filter((_, i) => i !== winner.index);
    setEntries(next);
    setTextInput(next.join('\n'));
    setShowWinnerModal(false);
  };

  const currentTheme = WHEEL_THEMES[themeId] || WHEEL_THEMES.classic;

  return (
    <div
      ref={mainContainerRef}
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 select-none animate-in fade-in duration-300"
    >
      {/* ============================================================
          TOP HEADER & CONTROLS BAR
          ============================================================ */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-lg backdrop-blur-md">
        
        {/* Left: Title & Mode Switcher */}
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎡</span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-color)] tracking-tight">
                Random Baraban
              </h1>
              <p className="text-xs text-[var(--sub-color)] hidden sm:block">
                Wheel of Names & Sehrli Varaq Ochish
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-900/60 dark:bg-slate-950/80 rounded-xl border border-[var(--sub-alt)]">
            <button
              type="button"
              onClick={() => setMode('wheel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'wheel'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <span>🎡</span>
              <span>Baraban</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('character')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'character'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <span>📜</span>
              <span>Sehrli Qahramon</span>
            </button>
          </div>
        </div>

        {/* Right: Speed Controls, Theme, Sound, Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          
          {/* Speed Selector */}
          {mode === 'wheel' ? (
            <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-[var(--sub-alt)] text-xs">
              <span className="text-[11px] text-[var(--sub-color)] px-1.5 font-medium flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Tezlik:</span>
              </span>
              <button
                type="button"
                onClick={() => setSpinSpeed('fast')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  spinSpeed === 'fast'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="Tez aylanish (3 soniya)"
              >
                ⚡ 3s
              </button>
              <button
                type="button"
                onClick={() => setSpinSpeed('normal')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  spinSpeed === 'normal'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="O'rtacha aylanish (6 soniya)"
              >
                ⏱️ 6s
              </button>
              <button
                type="button"
                onClick={() => setSpinSpeed('slow')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  spinSpeed === 'slow'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="Sekin, hayajonli aylanish (10 soniya)"
              >
                ⏳ 10s
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-[var(--sub-alt)] text-xs">
              <span className="text-[11px] text-[var(--sub-color)] px-1.5 font-medium flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Tezlik:</span>
              </span>
              <button
                type="button"
                onClick={() => setRevealSpeed('fast')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  revealSpeed === 'fast'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="Tezkor yurish va yozish"
              >
                ⚡ Tez
              </button>
              <button
                type="button"
                onClick={() => setRevealSpeed('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  revealSpeed === 'normal'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="O'rtacha yurish va yozish"
              >
                ⏱️ Oʻrtacha
              </button>
              <button
                type="button"
                onClick={() => setRevealSpeed('slow')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  revealSpeed === 'slow'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
                title="Sekin va hayajonli"
              >
                ⏳ Sekin
              </button>
            </div>
          )}

          {/* Theme Dropdown (for wheel mode) */}
          {mode === 'wheel' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/60 rounded-xl border border-[var(--sub-alt)] text-xs">
              <Palette className="w-4 h-4 text-amber-400" />
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value as WheelThemeId)}
                className="bg-transparent text-[var(--text-color)] font-semibold outline-hidden cursor-pointer"
              >
                {Object.values(WHEEL_THEMES).map((th) => (
                  <option key={th.id} value={th.id} className="bg-slate-900 text-white">
                    {th.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-slate-900/60 border-[var(--sub-alt)] text-[var(--text-color)] hover:bg-slate-800'
            }`}
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/60 border border-[var(--sub-alt)] text-[var(--text-color)] hover:bg-slate-800 transition-all"
            title="To'liq ekranga o'tish"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ============================================================
          MAIN BODY: LEFT STAGE & RIGHT ENTRIES PANEL
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: Interactive Wheel or Character Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-xl relative min-h-[500px]">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-5xl">📋</span>
              <h3 className="text-lg font-bold text-[var(--text-color)]">
                Roʻyxat boʻsh!
              </h3>
              <p className="text-xs text-[var(--sub-color)] max-w-sm">
                Barabanni aylantirish uchun oʻng tarafdagi roʻyxatga ismlar yozing, TXT fayl yuklang yoki namunani bosing.
              </p>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition-all"
              >
                Namunaviy ismlarni yuklash
              </button>
            </div>
          ) : mode === 'wheel' ? (
            <WheelCanvas
              entries={entries}
              theme={currentTheme}
              isSpinning={isSpinning}
              spinSpeed={spinSpeed}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
            />
          ) : (
            <CharacterRevealCanvas
              entries={entries}
              speed={revealSpeed}
              onWinnerSelected={(name, idx) => handleSpinEnd(name, idx)}
            />
          )}

          {/* Helper Instruction Banner */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--sub-color)]">
              {mode === 'wheel'
                ? "💡 Baraban markazidagi «AYLANTIR» tugmasini yoki g'ildirakni bosing"
                : "💡 Qahramonni tanlang va «START» tugmasini bosib g'olibni aniqlang"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Entries & History Management */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-xl overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="flex items-center border-b border-[var(--sub-alt)] bg-slate-900/40">
            <button
              type="button"
              onClick={() => setActiveSideTab('entries')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all ${
                activeSideTab === 'entries'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Nomzodlar ({entries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSideTab('results')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all ${
                activeSideTab === 'results'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Gʻoliblar ({results.length})</span>
            </button>
          </div>

          {/* Tab 1: Entries Management */}
          {activeSideTab === 'entries' && (
            <div className="p-4 space-y-4">
              
              {/* Quick Action Buttons Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-[var(--text-color)] font-medium transition-all"
                  title="Ismlarni aralashtirish"
                >
                  <Shuffle className="w-3 h-3 text-cyan-400" />
                  <span>Aralashtirish</span>
                </button>
                <button
                  type="button"
                  onClick={handleSort}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-[var(--text-color)] font-medium transition-all"
                  title="Alifbo bo'yicha saralash"
                >
                  <ArrowDownAZ className="w-3 h-3 text-green-400" />
                  <span>Saralash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNumberModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-[var(--text-color)] font-medium transition-all"
                  title="Sonlar generatsiyasi"
                >
                  <ListOrdered className="w-3 h-3 text-amber-400" />
                  <span>Sonlar</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-xs text-red-400 font-medium transition-all ml-auto"
                  title="Ro'yxatni tozalash"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Tozalash</span>
                </button>
              </div>

              {/* Textarea for typing/pasting lines */}
              <div className="relative">
                <textarea
                  value={textInput}
                  onChange={handleTextChange}
                  rows={12}
                  placeholder="Har bir qatorga bittadan ism yoki son yozing..."
                  className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-[var(--sub-alt)] text-sm font-mono text-[var(--text-color)] placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500/70 transition-all resize-y leading-relaxed"
                />
                <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono">
                  {entries.length} qator
                </div>
              </div>

              {/* TXT File Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Fayldan yuklash (.txt, .csv)</span>
                </button>
                <p className="text-[11px] text-[var(--sub-color)] text-center mt-1.5">
                  Fayldagi har bir qatordagi ismlar avtomatik barabanga joylanadi
                </p>
              </div>

              {/* Sample Data Link */}
              <div className="text-center pt-2 border-t border-[var(--sub-alt)]">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-amber-400/80 hover:text-amber-400 underline transition-colors"
                >
                  Oʻzbekcha namunaviy ismlarni qayta yuklash
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Results History */}
          {activeSideTab === 'results' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--sub-color)]">
                  Gʻoliblar roʻyxati ({results.length})
                </span>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setResults([])}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Tarixni oʻchirish</span>
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--sub-color)]">
                  Hozircha gʻoliblar aniqlanmadi. Barabanni aylantiring!
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {results.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-[var(--sub-alt)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                          {results.length - i}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-[var(--text-color)]">
                            {res.name}
                          </div>
                          <div className="text-[10px] text-[var(--sub-color)]">
                            {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className="text-base">🏆</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          WINNER CELEBRATION MODAL (Clean, Static, Zero Lag, No Bouncing)
          ============================================================ */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 shadow-2xl text-center space-y-6">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Static Clean Glowing Trophy Badge (No jump / bounce) */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-4xl shadow-lg shadow-amber-500/25">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                Gʻolib Aniqlandi!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words px-2">
                {winner.name}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRemoveWinner}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Gʻolibni roʻyxatdan oʻchirish</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all active:scale-98"
              >
                Roʻyxatda qoldirish va yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          QUICK NUMBER GENERATOR MODAL
          ============================================================ */}
      {showNumberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-color)]">
                Sonlar generatsiyasi
              </h3>
              <button
                type="button"
                onClick={() => setShowNumberModal(false)}
                className="text-[var(--sub-color)] hover:text-[var(--text-color)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setNumFrom(1);
                    setNumTo(cnt);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    numTo === cnt && numFrom === 1
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1–{cnt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[var(--sub-color)] block mb-1">
                  Boshlangʻich son:
                </label>
                <input
                  type="number"
                  value={numFrom}
                  onChange={(e) => setNumFrom(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-sm text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--sub-color)] block mb-1">
                  Tugash soni:
                </label>
                <input
                  type="number"
                  value={numTo}
                  onChange={(e) => setNumTo(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[var(--sub-alt)] text-sm text-center font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateNumbers}
              className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all text-xs"
            >
              Sonlarni yaratish va joylash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
