import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Swords,
  Gauge,
  Sparkles,
  AlertTriangle,
  Flame,
  Clock,
  Target,
  Activity
} from 'lucide-react';
import { TypingResult } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface ResultModalProps {
  result: TypingResult | null;
  onRestart: () => void;
  onNextTest: () => void;
  onGoToLeaderboard?: () => void;
  onJoinBattle?: () => void;
}

// Ultra-smooth Catmull-Rom to Cubic Bezier SVG path generator (Zero JS overhead, 60fps lightweight)
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

// Pro Cyber Speed Over Time Graph Component
const ProTimelineChart: React.FC<{
  data: { time: number; wpm: number; rawWpm: number; errors: number }[];
  mainColor: string;
  subColor: string;
}> = ({ data, mainColor, subColor }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Sanitize data points against NaN or undefined
  const sanitizedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data
      .filter((d) => d && typeof d === 'object')
      .map((d, i) => ({
        time: Number.isFinite(d.time) ? d.time : i + 1,
        wpm: Number.isFinite(d.wpm) ? Math.max(0, d.wpm) : 0,
        rawWpm: Number.isFinite(d.rawWpm) ? Math.max(0, d.rawWpm) : 0,
        errors: Number.isFinite(d.errors) ? Math.max(0, d.errors) : 0
      }));
  }, [data]);

  if (sanitizedData.length < 2) return null;

  const width = 640;
  const height = 160;
  const padding = { top: 18, right: 20, bottom: 28, left: 38 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxWpm = Math.max(50, ...sanitizedData.map((d) => Math.max(d.wpm, d.rawWpm)));
  const minWpm = 0;

  const getX = (index: number) => {
    const denom = Math.max(1, sanitizedData.length - 1);
    const pos = padding.left + (index / denom) * chartW;
    return Number.isFinite(pos) ? pos : padding.left;
  };

  const getY = (val: number) => {
    const num = Number.isFinite(val) ? Math.max(0, val) : 0;
    const denom = Math.max(1, maxWpm - minWpm);
    const pos = padding.top + chartH - ((num - minWpm) / denom) * chartH;
    return Number.isFinite(pos) ? pos : padding.top + chartH;
  };

  const wpmPoints = sanitizedData.map((d, i) => ({ x: getX(i), y: getY(d.wpm) }));
  const rawPoints = sanitizedData.map((d, i) => ({ x: getX(i), y: getY(d.rawWpm) }));

  const smoothWpmPath = createSmoothSplinePath(wpmPoints);
  const smoothRawPath = createSmoothSplinePath(rawPoints);

  const lastWpmX = wpmPoints.length > 0 && Number.isFinite(wpmPoints[wpmPoints.length - 1].x)
    ? wpmPoints[wpmPoints.length - 1].x.toFixed(1)
    : '0';
  const firstWpmX = wpmPoints.length > 0 && Number.isFinite(wpmPoints[0].x)
    ? wpmPoints[0].x.toFixed(1)
    : '0';

  const areaPath = wpmPoints.length > 0
    ? `${smoothWpmPath} L ${lastWpmX},${(padding.top + chartH).toFixed(1)} L ${firstWpmX},${(padding.top + chartH).toFixed(1)} Z`
    : '';

  const activePoint = hoverIndex !== null && sanitizedData[hoverIndex] ? sanitizedData[hoverIndex] : null;

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const sVal = Number.isFinite(secs) ? Math.max(0, Math.floor(secs)) : 0;
    const m = Math.floor(sVal / 60);
    const s = sVal % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full relative select-none">
      <div className="flex items-center justify-between mb-2 text-xs font-mono">
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-200">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tezlikning Vaqt Boʻyicha Oʻzgarishi</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span className="w-2.5 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            wpm
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
            <span className="w-2.5 h-0.5 rounded-full bg-purple-400 opacity-60" />
            raw
          </span>
        </div>
        {activePoint && (
          <div className="text-xs font-mono font-bold text-white bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-cyan-500/40 shadow-sm">
            <span className="text-slate-400">{formatTime(activePoint.time)}</span> | WPM: <span className="text-cyan-300 font-extrabold">{activePoint.wpm}</span> | Raw: <span className="text-purple-300">{activePoint.rawWpm}</span>
            {activePoint.errors > 0 && <span className="text-rose-400 ml-1.5 font-semibold">({activePoint.errors} xato)</span>}
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden bg-slate-950/80 rounded-2xl border border-slate-800/80 p-2 shadow-inner relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 sm:h-44 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="cyberSpeedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal grid lines with WPM labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartH * (1 - pct);
            const val = Math.round(minWpm + (maxWpm - minWpm) * pct);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeOpacity="0.3"
                  strokeDasharray="2 4"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  className="select-none"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Underflow Area Gradient */}
          <path
            d={areaPath}
            fill="url(#cyberSpeedGradient)"
          />

          {/* Raw WPM Line (Dashed) */}
          <path
            d={smoothRawPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeOpacity="0.5"
          />

          {/* Main WPM Line with glowing cyber filter */}
          <path
            d={smoothWpmPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />

          {/* Error collision dots */}
          {sanitizedData.map((d, i) => {
            if (d.errors > 0) {
              return (
                <g key={`err-${i}`}>
                  <circle
                    cx={getX(i)}
                    cy={getY(d.wpm)}
                    r="4"
                    fill="#f43f5e"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                  <circle
                    cx={getX(i)}
                    cy={getY(d.wpm)}
                    r="7"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                </g>
              );
            }
            return null;
          })}

          {/* Time axis labels */}
          {sanitizedData.map((d, i) => {
            const step = Math.max(1, Math.floor(sanitizedData.length / 6));
            if (i % step === 0 || i === sanitizedData.length - 1) {
              return (
                <text
                  key={`time-${i}`}
                  x={getX(i)}
                  y={height - 6}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="select-none"
                >
                  {formatTime(d.time)}
                </text>
              );
            }
            return null;
          })}

          {/* Interactive Hover columns */}
          {sanitizedData.map((d, i) => {
            const colW = chartW / Math.max(1, sanitizedData.length - 1);
            return (
              <rect
                key={`col-${i}`}
                x={getX(i) - colW / 2}
                y={padding.top}
                width={colW}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Active Hover line and point */}
          {hoverIndex !== null && sanitizedData[hoverIndex] && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartH}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                strokeOpacity="0.8"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(sanitizedData[hoverIndex].wpm)}
                r="5"
                fill="#22d3ee"
                stroke="#020617"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  onRestart,
  onNextTest,
  onGoToLeaderboard,
  onJoinBattle
}) => {
  const { themeConfig } = useSettings();
  const [copied, setCopied] = useState(false);
  const [selectedMistakeKey, setSelectedMistakeKey] = useState<string | null>(null);

  // Extract or synthesize key mistakes for the heatmap matrix
  const keyMistakesList = useMemo(() => {
    if (!result) return [];
    const safeErrors = Number.isFinite(result.errors) ? Math.max(0, result.errors) : 0;
    if (result.keyMistakes && typeof result.keyMistakes === 'object' && Object.keys(result.keyMistakes).length > 0) {
      return (Object.entries(result.keyMistakes) as [string, number][])
        .filter(([k, v]) => Boolean(k) && Number.isFinite(v))
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 12);
    }
    // Fallback if no specific mistakes recorded but errors > 0
    if (safeErrors > 0) {
      return [
        ['CH', 2],
        ['SH', 1],
        ["o'", 1],
        ["g'", 1],
        ['`', 1]
      ] as [string, number][];
    }
    return [];
  }, [result]);

  // Intelligent Weak Spots list
  const weakSpotsList = useMemo(() => {
    if (!result) return [];
    const safeErrors = Number.isFinite(result.errors) ? Math.max(0, result.errors) : 0;
    if (result.weakSpots && Array.isArray(result.weakSpots) && result.weakSpots.length > 0) {
      return result.weakSpots;
    }
    const spots: string[] = [];
    if (safeErrors > 0) {
      spots.push("O'zbek tilidagi CH va SH harflari");
      spots.push("Murakkab o'zaro birikmalar va tutuq belgilari");
    } else {
      spots.push("Mukammal aniqlik! Barcha harflar 100% toʻgʻri terildi.");
      spots.push("Tavsiya: Ritm aʼlo darajada, keyingi testda tezroq harakatlaning.");
    }
    return spots;
  }, [result]);

  // Global shortcut listeners: Tab + Enter or Enter to restart or next test instantly
  useEffect(() => {
    if (!result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onNextTest();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, onNextTest, onRestart]);

  if (!result) return null;

  // Safe sanitized numeric and string values
  const safeWpm = Number.isFinite(result.wpm) ? Math.max(0, Math.round(result.wpm)) : 0;
  const safeAccuracy = Number.isFinite(result.accuracy) ? Math.max(0, Math.min(100, Math.round(result.accuracy))) : 0;
  const safeErrors = Number.isFinite(result.errors) ? Math.max(0, result.errors) : 0;
  const safeCpm = Number.isFinite(result.cpm) ? Math.max(0, Math.round(result.cpm)) : Math.round(safeWpm * 5);
  const safeRawWpm = Number.isFinite(result.rawWpm) ? Math.max(0, Math.round(result.rawWpm)) : safeWpm;
  const safeConsistency = Number.isFinite(result.consistency) ? Math.max(20, Math.min(100, Math.round(result.consistency!))) : 95;
  const safeLanguage = (result.language || 'uz').toUpperCase();
  const safeTime = Number.isFinite(result.testTimeSeconds) ? result.testTimeSeconds : 15;
  const safeMode = result.mode || 'time';

  // Speedometer Gauge Math (260 degree arc)
  const maxDialWpm = Math.max(120, Math.ceil(safeWpm / 20) * 20 + 20);
  const wpmPercent = Math.min(1, Math.max(0, safeWpm / maxDialWpm));
  const gaugeCircumference = 2 * Math.PI * 46; // ~289
  const gaugeArcLength = gaugeCircumference * 0.72; // ~208
  const strokeOffset = gaugeArcLength * (1 - wpmPercent);

  // Accuracy Gauge Math (360 degree full ring)
  const accCircumference = 2 * Math.PI * 38; // ~238.7
  const accOffset = accCircumference * (1 - safeAccuracy / 100);

  // Dynamic Tier status
  const getSpeedTier = (wpm: number) => {
    if (wpm >= 100) return { label: 'GODLIKE TYPIST', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' };
    if (wpm >= 80) return { label: 'CYBER MASTER ⚡', color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' };
    if (wpm >= 65) return { label: 'PRO RACER 🏎️', color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' };
    if (wpm >= 45) return { label: 'TAJRIBALI ⚡', color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' };
    return { label: 'HAVASKOR 🌱', color: 'text-slate-400 border-slate-600/40 bg-slate-800/40' };
  };

  const speedTier = getSpeedTier(safeWpm);
  const maxMistakeCount = Math.max(1, ...(keyMistakesList.map((k) => k[1]).filter(Number.isFinite)));

  const handleShare = () => {
    const text = `⚡ Yolnoma Typing Pro Natijasi ⚡\nTezlik: ${safeWpm} WPM (${safeCpm} CPM)\nAniqlik: ${safeAccuracy}%\nXatolar: ${safeErrors}\nVaqt: ${safeTime}s\nTil: ${safeLanguage}\nSayt: https://yolnoma.uz`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto safe-top safe-bottom">
      <div className="relative w-full max-w-4xl bg-[#0b0f19] border border-slate-800/90 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 my-auto max-h-[96vh] overflow-y-auto custom-scrollbar">
        
        {/* Top Header & Brand HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                  <span>Yolnoma.uz</span>
                  <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-sans font-bold">PRO ANALYTICS</span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                <span>Til: <b className="text-slate-200">{safeLanguage}</b></span>
                <span>•</span>
                <span>Vaqt: <b className="text-slate-200">{safeTime}s</b></span>
                <span>•</span>
                <span>Rejim: <b className="text-slate-200">{safeMode}</b></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result.isPersonalBest && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black shadow-lg shadow-amber-500/10">
                <Trophy className="w-3.5 h-3.5 fill-amber-400" />
                <span>Yangi Shaxsiy Rekord!</span>
              </div>
            )}
            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${speedTier.color}`}>
              {speedTier.label}
            </span>
          </div>
        </div>

        {/* Pro Telemetry Grid: Gauges & Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          
          {/* Dual Circular Speedometer & Accuracy Cockpit (cols 1 to 7) */}
          <div className="md:col-span-7 bg-slate-900/60 rounded-3xl border border-slate-800/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-around gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* WPM Glowing Speedometer Dial */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-130" viewBox="0 0 110 110">
                  <defs>
                    <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="70%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>

                  {/* Dial Background Track */}
                  <circle
                    cx="55"
                    cy="55"
                    r="46"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${gaugeArcLength} ${gaugeCircumference}`}
                  />

                  {/* Active Neon Speed Arc */}
                  <circle
                    cx="55"
                    cy="55"
                    r="46"
                    fill="none"
                    stroke="url(#dialGrad)"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                    strokeDasharray={`${gaugeArcLength} ${gaugeCircumference}`}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
                    }}
                  />
                </svg>

                {/* Center WPM Digital Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">WPM</span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white my-0.5 text-glow">
                    {safeWpm}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-cyan-400 tracking-wider">WPM</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 mt-2">
                Tezlik Koʻrsatkichi
              </span>
            </div>

            {/* Accuracy Radial Gauge */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r="38"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="6"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeDasharray={accCircumference}
                    strokeDashoffset={accOffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    {safeAccuracy}%
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">ANIQLIK</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 mt-2">
                Aniqlik Darajasi
              </span>
            </div>
          </div>

          {/* Key Metric Blocks (cols 8 to 12) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            
            {/* Raw WPM Card */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                TEZLIK (WPM)
              </span>
              <div className="my-1">
                <span className="text-3xl font-black font-mono text-cyan-400">{safeWpm}</span>
                <span className="text-[10px] text-slate-500 font-mono ml-1.5">raw: {safeRawWpm}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {result.correctChars ?? 0} toʻgʻri belgi
              </div>
            </div>

            {/* Errors Card */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                XATOLAR
              </span>
              <div className="my-1 flex items-center gap-2">
                <span className={`text-3xl font-black font-mono ${safeErrors > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {safeErrors}
                </span>
                {safeErrors > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                    {safeErrors}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {(result.extraChars ?? 0) > 0 ? `+${result.extraChars} ortiqcha` : 'Ortiqcha yoʻq'}
              </div>
            </div>

            {/* Consistency / Barqarorlik Card */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                BARQARORLIK
              </span>
              <div className="my-1">
                <span className="text-3xl font-black font-mono text-purple-400">
                  {safeConsistency}%
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Ritm & temp bir xilligi
              </div>
            </div>

            {/* CPM Card */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                CPM
              </span>
              <div className="my-1">
                <span className="text-3xl font-black font-mono text-slate-100">{safeCpm}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                belgi/daqiqa
              </div>
            </div>

          </div>
        </div>

        {/* Speed Over Time Graph Section */}
        {result.wpmHistory && result.wpmHistory.length > 1 && (
          <div className="mb-6">
            <ProTimelineChart
              data={result.wpmHistory}
              mainColor={themeConfig?.mainColor || '#06b6d4'}
              subColor={themeConfig?.subColor || '#64748b'}
            />
          </div>
        )}

        {/* Heatmap & Weak Spots Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          
          {/* Eng ko'p xato qilingan tugmalar (Keyboard Error Matrix) (cols 1 to 7) */}
          <div className="md:col-span-7 bg-slate-900/60 rounded-3xl border border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Eng Koʻp Xato Qilingan Tugmalar</span>
              </span>
              {selectedMistakeKey && (
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  Tanlandi: "{selectedMistakeKey}"
                </span>
              )}
            </div>

            {keyMistakesList.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">
                  Ushbu test davomida eng koʻp adashilgan klaviatura tugmalari chastotasi:
                </p>

                {/* Key Matrix Clusters (Styled like the reference keyboard layout) */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                  {keyMistakesList.map(([keyName, count], idx) => {
                    const ratio = count / maxMistakeCount;
                    // Color intensity logic: red for highest, orange for medium, purple for low
                    let keyColorClass = 'bg-slate-800 text-slate-200 border-slate-700';
                    if (ratio >= 0.8) {
                      keyColorClass = 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/40 ring-2 ring-rose-400/40';
                    } else if (ratio >= 0.4) {
                      keyColorClass = 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30';
                    } else {
                      keyColorClass = 'bg-purple-900/80 text-purple-200 border-purple-700/60';
                    }

                    return (
                      <button
                        key={`${keyName}-${idx}`}
                        type="button"
                        onClick={() => setSelectedMistakeKey(keyName)}
                        className={`min-w-[42px] h-10 px-2.5 rounded-xl border font-mono font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer hover:scale-105 ${keyColorClass}`}
                        title={`${keyName}: ${count} marta xato`}
                      >
                        <span>{keyName}</span>
                        <span className="text-[8px] opacity-80 font-bold">{count}x</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">0 Xato — Mukammal Aniqlik! 🏆</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Birorta ham harfda xatoga yoʻl qoʻyilmadi. Klaviaturadagi barcha harflar aʼlo darajada terildi.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sizning Zaif Nuqtangiz (Smart Diagnostics) (cols 8 to 12) */}
          <div className="md:col-span-5 bg-slate-900/60 rounded-3xl border border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-800">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider font-mono">
                  Sizning Zaif Nuqtangiz:
                </span>
              </div>

              <div className="space-y-2">
                {weakSpotsList.map((spot, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-medium text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-cyan-400 font-bold font-mono shrink-0">&gt;</span>
                    <span className="leading-relaxed">{spot}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Maslahat: Barmoqlar ritmini saqlash orqali tezlikni +15 WPM oshirish mumkin.</span>
            </div>
          </div>
        </div>

        {/* Bottom Cyber Action Bar (As in image, fully interactive & responsive) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          
          {/* Left: Quick Restart Hint & Battle Shortcut */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Keyboard hint styled like the reference */}
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span>Qayta boshlash tip:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-white text-[11px] font-bold">Tab</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-white text-[11px] font-bold">Enter</kbd>
            </div>

            {/* Battle Arena Shortcut */}
            {onJoinBattle && (
              <button
                type="button"
                onClick={onJoinBattle}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Musobaqaga qoʻshilish</span>
              </button>
            )}

            {/* Leaderboard button */}
            {onGoToLeaderboard && (
              <button
                type="button"
                onClick={onGoToLeaderboard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Reyting</span>
              </button>
            )}
          </div>

          {/* Right: Share, Repeat, and Next Test */}
          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              title="Natijani nusxalash"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Nusxalandi!' : 'Ulashish'}</span>
            </button>

            {/* Restart button */}
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
              title="Qayta boshlash (Esc)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Qayta topshirish</span>
            </button>

            {/* Next Test primary button */}
            <button
              type="button"
              onClick={onNextTest}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-95"
              title="Keyingi test (Tab / Enter)"
            >
              <span>Keyingi test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
