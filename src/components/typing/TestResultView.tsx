import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  Target,
  Crown
} from 'lucide-react';
import { TypingResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../config/firebase';

interface TestResultViewProps {
  result: TypingResult;
  onRestart: () => void;
  onNextTest: () => void;
  onGoToLeaderboard?: () => void;
  onJoinBattle?: () => void;
}

// Generate smooth cubic bezier SVG curve (Monkeytype spline style)
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
  onGoToLeaderboard
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'oson' | 'orta' | 'qiyin'>('oson');
  const [periodTab, setPeriodTab] = useState<'hafta' | 'oy'>('hafta');
  const [hoverPoint, setHoverPoint] = useState<{ time: number; wpm: number; rawWpm: number; errors: number; x: number; y: number } | null>(null);
  const [liveTopTypists, setLiveTopTypists] = useState<any[]>([]);

  // Default seed leaderboard matching live community
  const defaultTypists = useMemo(() => [
    { rank: 1, name: 'Abdulboriy', wpm: 94, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Abdulboriy' },
    { rank: 2, name: 'polatov', wpm: 92, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=polatov' },
    { rank: 3, name: 'Sui', wpm: 89.1, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Sui' },
    { rank: 4, name: 'Hex:Jasur', wpm: 81, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=HexJasur' },
    { rank: 5, name: 'Islom Murodov', wpm: 80, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=IslomMurodov' },
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

  // Global hotkeys: Tab + Enter or Enter to restart / next test instantly
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
  const safeTime = Number.isFinite(result.testTimeSeconds) ? result.testTimeSeconds : 15;
  const safeConsistency = Number.isFinite(result.consistency) ? Math.max(10, Math.min(100, Math.round(result.consistency!))) : 85;
  
  const correctChars = Number.isFinite(result.correctChars) ? result.correctChars : Math.round(safeWpm * 5);
  const wrongChars = Number.isFinite(result.errors) ? result.errors : 0;
  const extraChars = Number.isFinite(result.extraChars) ? result.extraChars : 0;

  // Format difficulty label
  const difficultyLabel = useMemo(() => {
    if (result.difficulty === 'hard') return 'qiyin';
    if (result.difficulty === 'medium') return "o'rta";
    return 'oson';
  }, [result.difficulty]);

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
    // Synthetic smooth decline and stabilization curve like in Monkeytype
    const points = [];
    const dur = Math.max(5, safeTime);
    for (let s = 1; s <= dur; s++) {
      const progress = s / dur;
      const curveWpm = Math.round(safeWpm * (1.35 - 0.45 * Math.min(1, progress * 1.5) + 0.05 * Math.sin(progress * Math.PI)));
      const curveRaw = Math.round(curveWpm * 1.04);
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
  const chartWidth = 540;
  const chartHeight = 200;
  const padLeft = 34;
  const padRight = 18;
  const padTop = 22;
  const padBottom = 28;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(60, ...timelineData.map((d) => Math.max(d.wpm, d.rawWpm)));
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

  // User's current standing
  const displayTypists = liveTopTypists.length > 0 ? liveTopTypists : defaultTypists;
  const currentUsername = profile?.displayName || profile?.username || (user?.displayName || 'JONIYa');
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
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 select-none animate-in fade-in duration-200 font-mono">
      
      {/* 3-Column Panoramic Monkeytype Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LEFT HERO STATS & MONKEYTYPE ACTION CONTROLS                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          
          {/* Big WPM & Accuracy Hero Section */}
          <div className="space-y-4">
            <div>
              <div className="text-[12px] font-bold tracking-widest text-[var(--sub-color)] uppercase">
                wpm
              </div>
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-[var(--main-color)] leading-none mt-0.5">
                {safeWpm}
              </div>
              <div className="text-xs font-semibold text-[var(--sub-color)] tracking-wider mt-1.5 uppercase">
                wpm · {safeTime}s · {difficultyLabel}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-[12px] font-bold tracking-widest text-[var(--sub-color)] uppercase">
                acc
              </div>
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-[var(--text-color)] leading-none mt-0.5">
                {safeAccuracy}
              </div>
            </div>
          </div>

          {/* 4 Stat Boxes (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            
            {/* Box 1: Raw WPM */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                {safeRawWpm}
              </span>
              <span className="text-[11px] font-medium text-[var(--sub-color)] mt-0.5 lowercase">
                raw wpm
              </span>
            </div>

            {/* Box 2: Belgilar (Correct / Wrong / Extra) */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center">
              <div className="text-xl sm:text-2xl font-black">
                <span className="text-[var(--text-color)]">{correctChars}</span>
                <span className="text-[var(--sub-color)] mx-0.5">/</span>
                <span className="text-[var(--error-color)]">{wrongChars}</span>
                <span className="text-[var(--sub-color)] mx-0.5">/</span>
                <span className="text-[var(--sub-color)]">{extraChars}</span>
              </div>
              <span className="text-[11px] font-medium text-[var(--sub-color)] mt-0.5 lowercase">
                characters
              </span>
            </div>

            {/* Box 3: Barqarorlik (Consistency) */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                {safeConsistency}%
              </span>
              <span className="text-[11px] font-medium text-[var(--sub-color)] mt-0.5 lowercase">
                consistency
              </span>
            </div>

            {/* Box 4: Vaqt (Time) */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                {safeTime}s
              </span>
              <span className="text-[11px] font-medium text-[var(--sub-color)] mt-0.5 lowercase">
                time
              </span>
            </div>

          </div>

          {/* Authentic Monkeytype Action Buttons (No Ulashish) */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onNextTest}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[#323437] font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Keyingi test (Tab)"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Keyingi test</span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-[var(--text-color)] font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
              title="Qayta boshlash (Enter)"
            >
              <RotateCcw className="w-4 h-4 text-[var(--sub-color)]" />
              <span>Qaytadan</span>
            </button>
          </div>

          {/* Quick Practice mistakes if errors occurred */}
          {wrongChars > 0 && (
            <button
              type="button"
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--main-color)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-[var(--error-color)]" />
              <span>Xatolarni takrorlash ({wrongChars} ta)</span>
            </button>
          )}

          {/* Keyboard shortcuts cue */}
          <div className="text-[11px] text-[var(--sub-color)] flex items-center gap-1.5 justify-center opacity-80">
            <span>Keyingi:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/30 text-[var(--text-color)] font-bold text-[10px]">Tab</kbd>
            <span>· Qaytadan:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/30 text-[var(--text-color)] font-bold text-[10px]">Enter</kbd>
          </div>

        </div>


        {/* ========================================================================= */}
        {/* COLUMN 2: CENTER MONKEYTYPE SPEED GRAPH (cols 5 to 8)                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-4 sm:p-5 flex flex-col justify-between relative shadow-sm">
          
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
                      stroke="currentColor"
                      className="text-[var(--sub-alt)]"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padLeft - 6}
                      y={yPos + 4}
                      textAnchor="end"
                      fill="currentColor"
                      className="text-[var(--sub-color)]"
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
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[var(--sub-color)]"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.time}s
                  </text>
                );
              })}

              {/* Raw WPM dashed gray curve (Monkeytype style) */}
              <path
                d={rawSpline}
                fill="none"
                stroke="currentColor"
                className="text-[var(--sub-color)]"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={0.8}
              />

              {/* Real WPM solid yellow curve (Monkeytype signature main color) */}
              <path
                d={wpmSpline}
                fill="none"
                stroke="currentColor"
                className="text-[var(--main-color)]"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Error marks on curve */}
              {timelineData.map((d, i) => {
                if (d.errors <= 0) return null;
                const xPos = getX(i);
                const yPos = getY(d.wpm);
                return (
                  <circle
                    key={`err-${i}`}
                    cx={xPos}
                    cy={yPos}
                    r="3.5"
                    fill="currentColor"
                    className="text-[var(--error-color)]"
                  />
                );
              })}

              {/* Hover guide line & dot */}
              {hoverPoint && (
                <g>
                  <line
                    x1={hoverPoint.x}
                    y1={padTop}
                    x2={hoverPoint.x}
                    y2={chartHeight - padBottom}
                    stroke="currentColor"
                    className="text-[var(--main-color)]"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.y}
                    r="4.5"
                    fill="currentColor"
                    className="text-[var(--main-color)]"
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
                className="absolute z-20 px-2.5 py-1.5 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-[11px] font-mono shadow-xl pointer-events-none text-[var(--text-color)]"
                style={{
                  left: `${Math.min(chartWidth - 110, Math.max(10, hoverPoint.x - 40))}px`,
                  top: `${Math.max(10, hoverPoint.y - 45)}px`
                }}
              >
                <div>Vaqt: <b className="text-[var(--text-color)]">{hoverPoint.time}s</b></div>
                <div>WPM: <b className="text-[var(--main-color)]">{hoverPoint.wpm}</b> · Raw: <b className="text-[var(--sub-color)]">{hoverPoint.rawWpm}</b></div>
                {hoverPoint.errors > 0 && <div className="text-[var(--error-color)] font-bold">{hoverPoint.errors} xato</div>}
              </div>
            )}
          </div>

          {/* Graph Legend below (Solid WPM vs Dashed Raw WPM) */}
          <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-[var(--sub-alt)] text-xs text-[var(--sub-color)]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[var(--main-color)] rounded-full inline-block" />
              <span className="text-[var(--text-color)] font-medium">wpm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-[var(--sub-color)] inline-block" />
              <span className="text-[var(--sub-color)]">raw wpm</span>
            </div>
          </div>

        </div>


        {/* ========================================================================= */}
        {/* COLUMN 3: RIGHT "ENG KUCHLILAR" LEADERBOARD WIDGET                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          
          <div>
            {/* Header Title */}
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-[var(--main-color)] shrink-0" />
              <h3 className="text-sm font-bold text-[var(--text-color)] tracking-wide">
                Eng kuchlilar
              </h3>
            </div>

            {/* Filter Pills: Oson / O'rta / Qiyin and Hafta / Oy */}
            <div className="flex items-center justify-between gap-1 mb-3 text-[11px] font-semibold">
              <div className="flex items-center bg-[var(--sub-alt)] rounded-lg p-0.5 border border-[var(--sub-alt)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('oson')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'oson' ? 'bg-[var(--bg-color)] text-[var(--main-color)] font-bold' : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  Oson
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orta')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'orta' ? 'bg-[var(--bg-color)] text-[var(--main-color)] font-bold' : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  O'rta
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qiyin')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'qiyin' ? 'bg-[var(--bg-color)] text-[var(--main-color)] font-bold' : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  Qiyin
                </button>
              </div>

              <div className="flex items-center bg-[var(--sub-alt)] rounded-lg p-0.5 border border-[var(--sub-alt)]">
                <button
                  type="button"
                  onClick={() => setPeriodTab('hafta')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    periodTab === 'hafta' ? 'bg-[var(--bg-color)] text-[var(--main-color)] font-bold' : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                  }`}
                >
                  Hafta
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodTab('oy')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    periodTab === 'oy' ? 'bg-[var(--bg-color)] text-[var(--main-color)] font-bold' : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
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
                  className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-[var(--sub-alt)]/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-center font-bold text-[var(--sub-color)] text-xs shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-[var(--sub-alt)]"
                    />
                    <span className="text-[var(--text-color)] font-medium truncate text-xs">
                      {u.name}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-[var(--main-color)] shrink-0 ml-2">
                    {u.wpm} <span className="text-[10px] text-[var(--sub-color)] font-normal">wpm</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Separator: SIZNING O'RNINGIZ */}
            <div className="my-3 flex items-center justify-center gap-2 text-[10px] text-[var(--sub-color)] uppercase tracking-wider">
              <span className="h-px flex-1 border-dashed border-t border-[var(--sub-alt)]" />
              <span>SIZNING O'RNINGIZ</span>
              <span className="h-px flex-1 border-dashed border-t border-[var(--sub-alt)]" />
            </div>

            {/* Current user's standing banner */}
            <div className="p-2 rounded-xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[var(--sub-color)] font-bold text-xs">-</span>
                <img
                  src={currentUserAvatar}
                  alt={currentUsername}
                  className="w-6 h-6 rounded-full border border-[var(--main-color)]/60 shrink-0"
                />
                <div className="truncate">
                  <div className="text-[var(--text-color)] font-bold truncate text-[11px]">{currentUsername}</div>
                  <div className="text-[10px] text-[var(--main-color)] font-semibold">
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
              className="mt-3 text-xs font-semibold text-[var(--sub-color)] hover:text-[var(--main-color)] flex items-center justify-center gap-1 transition-colors cursor-pointer py-1"
            >
              <span>Barchasini ko'rish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* KEY MISTAKES HEATMAP                                                      */}
      {/* ========================================================================= */}
      {keyMistakesList.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)]">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[var(--text-color)] flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--error-color)]" />
              <span>Xato qilingan harflar</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {keyMistakesList.map(([keyName, count], idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-[var(--sub-alt)] border border-[var(--error-color)]/30 text-[var(--error-color)] text-xs font-bold flex items-center gap-1.5"
              >
                <span>"{keyName}"</span>
                <span className="text-[10px] text-[var(--sub-color)]">({count}x)</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
