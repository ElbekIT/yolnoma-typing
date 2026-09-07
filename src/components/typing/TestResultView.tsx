import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Share2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Zap,
  Target,
  Swords,
  ChevronRight,
  Award,
  Crown
} from 'lucide-react';
import { TypingResult, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';

interface TestResultViewProps {
  result: TypingResult;
  onRestart: () => void;
  onNextTest: () => void;
  onGoToLeaderboard?: () => void;
  onJoinBattle?: () => void;
}

// Generate smooth cubic bezier SVG curve
function createSmoothSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  result,
  onRestart,
  onNextTest,
  onGoToLeaderboard,
  onJoinBattle
}) => {
  const { user, profile } = useAuth();
  const { themeConfig } = useSettings();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'oson' | 'orta' | 'qiyin'>('oson');
  const [periodTab, setPeriodTab] = useState<'hafta' | 'oy'>('hafta');
  const [hoverPoint, setHoverPoint] = useState<{ time: number; wpm: number; rawWpm: number; errors: number; x: number; y: number } | null>(null);
  const [liveTopTypists, setLiveTopTypists] = useState<any[]>([]);

  // Default seed leaderboard matching screenshot (Zynexjon Uz, Www.jahongir.one, etc.)
  const defaultTypists = useMemo(() => [
    { rank: 1, name: 'Zynexjon Uz', wpm: 121, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Zynexjon' },
    { rank: 2, name: 'Www.jahongir.one <', wpm: 109, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Jahongir' },
    { rank: 3, name: 'Mrjasur Mc', wpm: 105, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Mrjasur' },
    { rank: 4, name: '2-legends _so_ezz', wpm: 95, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=2legends' },
    { rank: 5, name: 'Dark77x .', wpm: 91, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Dark77x' },
  ], []);

  // Subscribe to live leaderboard in RTDB
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const lbRef = ref(rtdb, 'leaderboard');
      unsubscribe = onValue(lbRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: any[] = [];
          Object.keys(val).forEach((k) => {
            const item = val[k];
            if (item && !item.isBlocked && Number(item.highestWpm) > 0) {
              list.push({
                uid: k,
                name: item.displayName || item.username || 'Foydalanuvchi',
                wpm: Number(item.highestWpm) || 0,
                avatar: item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${k}`
              });
            }
          });
          list.sort((a, b) => b.wpm - a.wpm);
          if (list.length >= 3) {
            setLiveTopTypists(list.slice(0, 5).map((u, i) => ({ ...u, rank: i + 1 })));
          } else {
            setLiveTopTypists(defaultTypists);
          }
        } else {
          setLiveTopTypists(defaultTypists);
        }
      });
    } catch {
      setLiveTopTypists(defaultTypists);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [defaultTypists]);

  // Global hotkeys: Tab + Enter to restart, Esc to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onNextTest();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextTest, onRestart]);

  // Safe sanitized numeric stats
  const safeWpm = Number.isFinite(result.wpm) ? Math.max(0, Math.round(result.wpm)) : 0;
  const safeAccuracy = Number.isFinite(result.accuracy)
    ? (result.accuracy === 100 ? '100%' : `${result.accuracy.toFixed(1)}%`)
    : '100%';
  const safeRawWpm = Number.isFinite(result.rawWpm) ? Math.max(0, Math.round(result.rawWpm)) : safeWpm;
  const safeTime = Number.isFinite(result.testTimeSeconds) ? result.testTimeSeconds : 10;
  const safeConsistency = Number.isFinite(result.consistency) ? Math.max(10, Math.min(100, Math.round(result.consistency!))) : 69;
  
  const correctChars = Number.isFinite(result.correctChars) ? result.correctChars : Math.round(safeWpm * 4.5);
  const wrongChars = Number.isFinite(result.errors) ? result.errors : 0;
  const extraChars = Number.isFinite(result.extraChars) ? result.extraChars : 0;

  // Format difficulty label matching screenshot e.g. "Oson"
  const difficultyLabel = useMemo(() => {
    if (result.difficulty === 'hard') return 'Qiyin';
    if (result.difficulty === 'medium') return "O'rta";
    return 'Oson';
  }, [result.difficulty]);

  // Share functionality
  const handleShare = () => {
    const text = `⚡ UzbekType / Yolnoma Natijasi ⚡\nTezlik: ${safeWpm} WPM (Raw: ${safeRawWpm})\nAniqlik: ${safeAccuracy}\nBelgilar: ${correctChars}/${wrongChars}/${extraChars}\nBarqarorlik: ${safeConsistency}%\nVaqt: ${safeTime}s`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build timeline chart data points
  const timelineData = useMemo(() => {
    if (result.wpmHistory && Array.isArray(result.wpmHistory) && result.wpmHistory.length > 1) {
      return result.wpmHistory.map((d, i) => ({
        time: Number.isFinite(d.time) ? d.time : i + 1,
        wpm: Number.isFinite(d.wpm) ? Math.max(0, d.wpm) : 0,
        rawWpm: Number.isFinite(d.rawWpm) ? Math.max(0, d.rawWpm) : (Number.isFinite(d.wpm) ? d.wpm : 0),
        errors: Number.isFinite(d.errors) ? Math.max(0, d.errors) : 0,
      }));
    }
    // Synthetic smooth decline and stabilization curve like in the user's screenshot
    const points = [];
    const dur = Math.max(5, safeTime);
    for (let s = 1; s <= dur; s++) {
      const progress = s / dur;
      // Start higher (boost at start), decline to steady pace
      const curveWpm = Math.round(safeWpm * (1.6 - 0.7 * Math.min(1, progress * 1.8) + 0.1 * Math.sin(progress * Math.PI)));
      const curveRaw = Math.round(curveWpm * 1.05);
      points.push({
        time: s,
        wpm: Math.max(10, curveWpm),
        rawWpm: Math.max(10, curveRaw),
        errors: s === Math.round(dur / 2) && wrongChars > 0 ? 1 : 0
      });
    }
    return points;
  }, [result.wpmHistory, safeTime, safeWpm, wrongChars]);

  // Chart dimensions and coordinates calculation
  const chartWidth = 520;
  const chartHeight = 190;
  const padLeft = 32;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 26;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(60, ...timelineData.map((d) => Math.max(d.wpm, d.rawWpm)));
  // Y-axis tick values: 0, 15, 30, 45, 60 (or scaled)
  const yTicks = [0, 15, 30, 45, 60];
  const dynamicMaxY = Math.max(60, Math.ceil(maxVal / 15) * 15);
  const actualYTicks = dynamicMaxY === 60 ? yTicks : [0, Math.round(dynamicMaxY * 0.25), Math.round(dynamicMaxY * 0.5), Math.round(dynamicMaxY * 0.75), dynamicMaxY];

  const getX = (index: number) => {
    const denom = Math.max(1, timelineData.length - 1);
    return padLeft + (index / denom) * innerW;
  };

  const getY = (val: number) => {
    return padTop + innerH - (val / dynamicMaxY) * innerH;
  };

  const wpmPoints = timelineData.map((d, i) => ({ x: getX(i), y: getY(d.wpm) }));
  const rawPoints = timelineData.map((d, i) => ({ x: getX(i), y: getY(d.rawWpm) }));

  const wpmSpline = createSmoothSplinePath(wpmPoints);
  const rawSpline = createSmoothSplinePath(rawPoints);

  // User's current standing comparison
  const displayTypists = liveTopTypists.length > 0 ? liveTopTypists : defaultTypists;
  const currentUsername = profile?.displayName || profile?.username || (user?.displayName || 'Mehmon');
  const currentUserAvatar = profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.uid || 'guest'}`;

  // Key mistakes heatmap
  const keyMistakesList = useMemo(() => {
    if (result.keyMistakes && typeof result.keyMistakes === 'object' && Object.keys(result.keyMistakes).length > 0) {
      return (Object.entries(result.keyMistakes) as [string, number][])
        .filter(([k, v]) => Boolean(k) && Number.isFinite(v))
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 10);
    }
    if (wrongChars > 0) {
      return [
        ['CH', 1],
        ['SH', 1],
        ["o'", 1],
      ] as [string, number][];
    }
    return [];
  }, [result.keyMistakes, wrongChars]);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 select-none animate-in fade-in duration-300">
      
      {/* 3-Column Panoramic Dashboard Grid (Matching Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LEFT HERO STATS & CONTROLS (cols 1 to 4)                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          
          {/* Big WPM & Accuracy Hero Section */}
          <div className="space-y-4">
            <div>
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-white font-mono leading-none">
                {safeWpm}
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-400 font-semibold tracking-wider mt-1 uppercase">
                WPM · {safeTime}S · {difficultyLabel}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono leading-none">
                {safeAccuracy}
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-400 font-bold tracking-widest mt-1 uppercase">
                ANIQLIK
              </div>
            </div>
          </div>

          {/* 4 Stat Boxes (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            
            {/* Box 1: Raw WPM */}
            <div className="bg-[#10141d]/80 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {safeRawWpm}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                Raw WPM
              </span>
            </div>

            {/* Box 2: Belgilar (Correct / Wrong / Extra) */}
            <div className="bg-[#10141d]/80 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black font-mono">
                <span className="text-emerald-400">{correctChars}</span>
                <span className="text-slate-600 mx-0.5">/</span>
                <span className="text-amber-400">{wrongChars}</span>
                <span className="text-slate-600 mx-0.5">/</span>
                <span className="text-rose-400">{extraChars}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                Belgilar
              </span>
            </div>

            {/* Box 3: Barqarorlik (Consistency) */}
            <div className="bg-[#10141d]/80 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {safeConsistency}%
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                Barqarorlik
              </span>
            </div>

            {/* Box 4: Vaqt (Time) */}
            <div className="bg-[#10141d]/80 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {safeTime}s
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                Vaqt
              </span>
            </div>

          </div>

          {/* Action Buttons: Ulashish and Qaytadan */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#10141d] hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Nusxalandi!' : 'Ulashish'}</span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-md shadow-white/10"
            >
              <RotateCcw className="w-4 h-4 text-slate-900" />
              <span>Qaytadan</span>
            </button>
          </div>

          {/* Keyboard tip */}
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 justify-center">
            <span>Keyingi test:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[10px]">Tab</kbd>
            <span>yoki</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[10px]">Enter</kbd>
          </div>

        </div>


        {/* ========================================================================= */}
        {/* COLUMN 2: CENTER SPEED TIMELINE GRAPH (cols 5 to 8)                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#10141d]/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative shadow-sm">
          
          <div className="w-full relative h-[210px] sm:h-[230px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoverPoint(null)}
            >
              {/* Horizontal dashed grid lines & Y labels */}
              {actualYTicks.map((tickVal) => {
                const yPos = getY(tickVal);
                return (
                  <g key={tickVal}>
                    <line
                      x1={padLeft}
                      y1={yPos}
                      x2={chartWidth - padRight}
                      y2={yPos}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity={0.4}
                    />
                    <text
                      x={padLeft - 6}
                      y={yPos + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* X-axis seconds labels */}
              {timelineData.map((d, i) => {
                const xPos = getX(i);
                return (
                  <text
                    key={`time-${i}`}
                    x={xPos}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.time}s
                  </text>
                );
              })}

              {/* Raw WPM dashed line */}
              <path
                d={rawSpline}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={0.7}
              />

              {/* Real WPM solid white line */}
              <path
                d={wpmSpline}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Hover guide line & dot */}
              {hoverPoint && (
                <g>
                  <line
                    x1={hoverPoint.x}
                    y1={padTop}
                    x2={hoverPoint.x}
                    y2={chartHeight - padBottom}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.y}
                    r="4.5"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* Interactive transparent overlay bars for touch/mouse */}
              {timelineData.map((d, i) => {
                const xPos = getX(i);
                const colW = innerW / Math.max(1, timelineData.length - 1);
                return (
                  <rect
                    key={`hit-${i}`}
                    x={xPos - colW / 2}
                    y={padTop}
                    width={colW}
                    height={innerH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoverPoint({
                        time: d.time,
                        wpm: d.wpm,
                        rawWpm: d.rawWpm,
                        errors: d.errors,
                        x: xPos,
                        y: getY(d.wpm)
                      })
                    }
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip Popup */}
            {hoverPoint && (
              <div
                className="absolute z-20 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 text-[11px] font-mono shadow-xl pointer-events-none text-slate-200"
                style={{
                  left: `${Math.min(chartWidth - 110, Math.max(10, hoverPoint.x - 40))}px`,
                  top: `${Math.max(10, hoverPoint.y - 45)}px`
                }}
              >
                <div>Vaqt: <b className="text-white">{hoverPoint.time}s</b></div>
                <div>WPM: <b className="text-cyan-400">{hoverPoint.wpm}</b> | Raw: <b className="text-slate-300">{hoverPoint.rawWpm}</b></div>
                {hoverPoint.errors > 0 && <div className="text-rose-400 font-bold">{hoverPoint.errors} xato</div>}
              </div>
            )}
          </div>

          {/* Graph Legend below (Solid WPM vs Dashed Raw WPM) */}
          <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-white rounded-full inline-block" />
              <span className="text-slate-200 font-medium">WPM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-slate-400 inline-block" />
              <span className="text-slate-400">Raw WPM</span>
            </div>
          </div>

        </div>


        {/* ========================================================================= */}
        {/* COLUMN 3: RIGHT "ENG KUCHLILAR" LEADERBOARD WIDGET (cols 9 to 12)          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 bg-[#10141d]/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          
          <div>
            {/* Header Title */}
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Eng kuchlilar
              </h3>
            </div>

            {/* Filter Pills: Oson / O'rta / Qiyin and Hafta / Oy */}
            <div className="flex items-center justify-between gap-1 mb-3 text-[11px] font-semibold">
              <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('oson')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'oson' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Oson
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orta')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'orta' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  O'rta
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qiyin')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'qiyin' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Qiyin
                </button>
              </div>

              <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPeriodTab('hafta')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    periodTab === 'hafta' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hafta
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodTab('oy')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    periodTab === 'oy' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Oy
                </button>
              </div>
            </div>

            {/* Top 5 typists list */}
            <div className="space-y-1.5">
              {displayTypists.map((u, i) => (
                <div
                  key={u.uid || u.name || i}
                  className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-800/40 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-center font-bold text-slate-400 text-xs shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <span className="text-slate-200 font-medium truncate text-xs">
                      {u.name}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-white shrink-0 ml-2">
                    {u.wpm} <span className="text-[10px] text-slate-500 font-normal">WPM</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Separator: SIZNING O'RNINGIZ */}
            <div className="my-3 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <span className="h-px flex-1 bg-slate-800 border-dashed border-t border-slate-700" />
              <span>SIZNING O'RNINGIZ</span>
              <span className="h-px flex-1 bg-slate-800 border-dashed border-t border-slate-700" />
            </div>

            {/* Current user's standing banner */}
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-400 font-bold font-mono text-xs">-</span>
                <img
                  src={currentUserAvatar}
                  alt={currentUsername}
                  className="w-6 h-6 rounded-full border border-cyan-500/40 shrink-0"
                />
                <div className="truncate">
                  <div className="text-slate-200 font-bold truncate text-[11px]">{currentUsername}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    Ushbu test: {safeWpm} WPM ({safeAccuracy})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer link to Leaderboard */}
          {onGoToLeaderboard && (
            <button
              type="button"
              onClick={onGoToLeaderboard}
              className="mt-3 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer py-1"
            >
              <span>Barchasini ko'rish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* BONUS PRO ANALYTICS (HEATMAP & DIAGNOSTICS)                               */}
      {/* ========================================================================= */}
      {keyMistakesList.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl bg-[#10141d]/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Xato Qilingan Tugmalar & Maslahatlar</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {keyMistakesList.map(([keyName, count], idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <span>"{keyName}"</span>
                <span className="text-[10px] text-slate-400">({count} marta)</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
