import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  RotateCcw,
  Share2,
  ArrowRight,
  AlertTriangle,
  Check,
  Target,
  Zap,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart2,
  Hash,
  Activity
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
  onGoToLeaderboard
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'insights' | 'pace' | 'ranking'>('insights');
  const [hoverPoint, setHoverPoint] = useState<{ time: number; wpm: number; rawWpm: number; errors: number; x: number; y: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showRawCurve, setShowRawCurve] = useState(true);

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
  const numAccuracy = Number.isFinite(result.accuracy) ? result.accuracy : 100;
  const safeRawWpm = Number.isFinite(result.rawWpm) ? Math.max(0, Math.round(result.rawWpm)) : safeWpm;
  const safeTime = Number.isFinite(result.testTimeSeconds) ? result.testTimeSeconds : 15;
  const safeConsistency = Number.isFinite(result.consistency) ? Math.max(10, Math.min(100, Math.round(result.consistency!))) : 88;
  
  const correctChars = Number.isFinite(result.correctChars) ? result.correctChars : Math.round(safeWpm * 5);
  const wrongChars = Number.isFinite(result.errors) ? result.errors : 0;
  const extraChars = Number.isFinite(result.extraChars) ? result.extraChars : 0;
  const missedChars = 0;

  // Format difficulty label in uppercase (OSON / O'RTA / QIYIN)
  const difficultyLabel = useMemo(() => {
    if (result.difficulty === 'hard') return 'Qiyin';
    if (result.difficulty === 'medium') return "O'rta";
    return 'Oson';
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
    const points = [];
    const dur = Math.max(5, safeTime);
    for (let s = 1; s <= dur; s++) {
      const progress = s / dur;
      const curveWpm = Math.round(safeWpm * (1.15 - 0.2 * Math.min(1, progress * 1.2) + 0.05 * Math.sin(progress * Math.PI)));
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

  // Peak speed calculation
  const peakSpeed = useMemo(() => {
    if (timelineData.length === 0) return safeWpm;
    return Math.max(...timelineData.map(d => d.wpm));
  }, [timelineData, safeWpm]);

  // Chart dimensions and coordinates calculation
  const chartWidth = 640;
  const chartHeight = 220;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 24;
  const padBottom = 28;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(60, ...timelineData.map((d) => Math.max(d.wpm, d.rawWpm)));
  const dynamicMaxY = Math.max(60, Math.ceil(maxVal / 15) * 15);
  const actualYTicks = [
    0,
    Math.round(dynamicMaxY * 0.25),
    Math.round(dynamicMaxY * 0.5),
    Math.round(dynamicMaxY * 0.75),
    dynamicMaxY
  ];

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

  // Closed area polygon under the curve for background gradient
  const areaPolygon = useMemo(() => {
    if (wpmPoints.length < 2) return '';
    const first = wpmPoints[0];
    const last = wpmPoints[wpmPoints.length - 1];
    const bottomY = padTop + innerH;
    return `${wpmSpline} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;
  }, [wpmPoints, wpmSpline, innerH, padTop]);

  // Performance evaluation headline
  const performanceBadge = useMemo(() => {
    if (numAccuracy === 100 && safeWpm >= 80) return { title: '🔥 Afsonaviy Natija!', desc: '100% mutlaq aniqlik va yuqori tezlik', color: 'text-amber-500' };
    if (numAccuracy === 100) return { title: '🎯 100% Mukammal Aniqlik!', desc: 'Birorta ham xato qilinmadi', color: 'text-emerald-500' };
    if (safeWpm >= 90) return { title: '⚡ Chempion Tezlik!', desc: 'Yuqori ligadagi tezlik koʻrsatkichi', color: 'text-[var(--main-color)]' };
    if (safeWpm >= 65) return { title: '🚀 Ajoyib Marra!', desc: 'Oʻrtacha koʻrsatkichdan ancha yuqori', color: 'text-[var(--main-color)]' };
    return { title: '👏 Yaxshi Harakat!', desc: 'Muntazam mashq mahoratni oshiradi', color: 'text-[var(--sub-color)]' };
  }, [numAccuracy, safeWpm]);

  // Key mistakes heatmap
  const keyMistakesList = useMemo(() => {
    if (result.keyMistakes && typeof result.keyMistakes === 'object' && Object.keys(result.keyMistakes).length > 0) {
      return (Object.entries(result.keyMistakes) as [string, number][])
        .filter(([k, v]) => Boolean(k) && Number.isFinite(v))
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 8);
    }
    return [];
  }, [result.keyMistakes]);

  // Share result copy action
  const handleShare = () => {
    const shareText = `⚡ Yolnoma Typing natijam:\n🚀 Tezlik: ${safeWpm} WPM (Raw: ${safeRawWpm})\n🎯 Aniqlik: ${safeAccuracy}\n⏱️ Vaqt: ${safeTime}s · Barqarorlik: ${safeConsistency}%\n👉 https://yolnoma.uz`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }).catch(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8 px-3 sm:px-6 font-mono select-none animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* TOP PANORAMIC HERO SECTION: PRIMARY METRICS + SPEED GRAPH                 */}
      {/* ========================================================================= */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-5 sm:p-7 shadow-sm transition-colors">
        
        {/* Upper flex: Left Hero (WPM & Acc) + Right Panoramic SVG Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT: Major Numbers (WPM & Accuracy) */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-5">
            
            {/* Achievement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] w-fit">
              <Sparkles className={`w-3.5 h-3.5 ${performanceBadge.color}`} />
              <span className={`text-xs font-bold ${performanceBadge.color}`}>
                {performanceBadge.title}
              </span>
            </div>

            {/* WPM Display */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--sub-color)] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--main-color)]" />
                <span>Tezlik (WPM)</span>
              </div>
              <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-[var(--main-color)] leading-none mt-1">
                {safeWpm}
              </div>
              <div className="text-xs text-[var(--sub-color)] mt-1.5">
                soʻz / daqiqa
              </div>
            </div>

            {/* Accuracy Display */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--sub-color)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Aniqlik</span>
              </div>
              <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-color)] leading-none mt-1">
                {safeAccuracy}
              </div>
              <div className="text-xs text-[var(--sub-color)] mt-1.5">
                toʻgʻri terilgan belgilar ulushi
              </div>
            </div>

          </div>

          {/* RIGHT: High-Resolution Interactive Timeline Chart */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            
            <div className="w-full relative h-[200px] sm:h-[220px]">
              <svg
                className="w-full h-full overflow-visible"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                onMouseLeave={() => setHoverPoint(null)}
              >
                <defs>
                  {/* Subtle Gradient fill under WPM curve */}
                  <linearGradient id="wpmFillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--main-color)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--main-color)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

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
                        x={padLeft - 8}
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
                  if (timelineData.length > 20 && i % 2 !== 0 && i !== timelineData.length - 1) return null;
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

                {/* Area fill under curve */}
                {areaPolygon && (
                  <path
                    d={areaPolygon}
                    fill="url(#wpmFillGradient)"
                  />
                )}

                {/* Raw WPM dashed curve */}
                {showRawCurve && (
                  <path
                    d={rawSpline}
                    fill="none"
                    stroke="currentColor"
                    className="text-[var(--sub-color)]"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity={0.7}
                  />
                )}

                {/* Real WPM solid primary curve */}
                <path
                  d={wpmSpline}
                  fill="none"
                  stroke="var(--main-color)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Error dots on curve */}
                {timelineData.map((d, i) => {
                  if (d.errors <= 0) return null;
                  const xPos = getX(i);
                  const yPos = getY(d.wpm);
                  return (
                    <circle
                      key={`err-${i}`}
                      cx={xPos}
                      cy={yPos}
                      r="4"
                      fill="currentColor"
                      className="text-rose-500 stroke-2 stroke-[var(--card-bg)]"
                    />
                  );
                })}

                {/* Hover guide line & point */}
                {hoverPoint && (
                  <g>
                    <line
                      x1={hoverPoint.x}
                      y1={padTop}
                      x2={hoverPoint.x}
                      y2={chartHeight - padBottom}
                      stroke="currentColor"
                      className="text-[var(--sub-color)]"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={hoverPoint.x}
                      cy={hoverPoint.y}
                      r="5"
                      fill="var(--main-color)"
                      stroke="var(--card-bg)"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Transparent hit area overlays */}
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
                  className="absolute z-20 px-3 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs font-mono shadow-xl pointer-events-none text-[var(--text-color)]"
                  style={{
                    left: `${Math.min(chartWidth - 120, Math.max(10, hoverPoint.x - 40))}px`,
                    top: `${Math.max(10, hoverPoint.y - 50)}px`
                  }}
                >
                  <div className="font-bold">{hoverPoint.time}-soniya</div>
                  <div className="text-[var(--main-color)] font-bold">WPM: {hoverPoint.wpm}</div>
                  <div className="text-[var(--sub-color)] text-[11px]">Raw: {hoverPoint.rawWpm}</div>
                  {hoverPoint.errors > 0 && <div className="text-rose-500 font-bold">{hoverPoint.errors} xato</div>}
                </div>
              )}
            </div>

            {/* Graph Legend & Curve Toggle */}
            <div className="flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-[var(--sub-alt)] text-xs text-[var(--sub-color)]">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-0.5 bg-[var(--main-color)] rounded-full inline-block" />
                  <span className="text-[var(--text-color)] font-medium text-xs">WPM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawCurve(!showRawCurve)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  title="Raw chizigʻini yoqish/oʻchirish"
                >
                  <span className={`w-3.5 h-0.5 border-b-2 border-dashed ${showRawCurve ? 'border-[var(--sub-color)]' : 'border-transparent'} inline-block`} />
                  <span className={showRawCurve ? 'text-[var(--sub-color)] font-medium text-xs' : 'text-[var(--sub-color)]/50 line-through text-xs'}>
                    Raw WPM
                  </span>
                </button>
                {wrongChars > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                    <span className="text-rose-400 font-medium text-xs">Xatolar</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-[var(--sub-color)]">
                Eng yuqori tezlik: <b className="text-[var(--text-color)]">{peakSpeed} WPM</b>
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* ========================================================================= */}
      {/* MIDDLE SECTION: PERFORMANCE METRIC CARDS (Clean Horizontal Ribbon)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
        
        {/* Card 1: Test turi */}
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[var(--sub-color)] font-medium">
            Test turi
          </span>
          <div className="mt-2">
            <div className="text-base font-bold text-[var(--text-color)]">
              {safeTime}s · {difficultyLabel}
            </div>
            <div className="text-[11px] text-[var(--sub-color)] mt-0.5">
              Standart rejim
            </div>
          </div>
        </div>

        {/* Card 2: Raw WPM */}
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[var(--sub-color)] font-medium">
            Xom tezlik
          </span>
          <div className="mt-2">
            <div className="text-base font-bold text-[var(--text-color)]">
              {safeRawWpm} <span className="text-xs font-normal text-[var(--sub-color)]">WPM</span>
            </div>
            <div className="text-[11px] text-[var(--sub-color)] mt-0.5">
              Barcha klavishlar
            </div>
          </div>
        </div>

        {/* Card 3: Belgilar (Aniq / Xato / Ortiqcha) */}
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[var(--sub-color)] font-medium">
            Belgilar
          </span>
          <div className="mt-2">
            <div className="text-base font-bold flex items-center gap-1 text-[var(--text-color)]">
              <span className="text-emerald-500 font-extrabold">{correctChars}</span>
              <span className="text-[var(--sub-color)] font-normal">/</span>
              <span className="text-rose-500 font-extrabold">{wrongChars}</span>
              <span className="text-[var(--sub-color)] font-normal">/</span>
              <span className="text-amber-500 font-extrabold">{extraChars}</span>
            </div>
            <div className="text-[11px] text-[var(--sub-color)] mt-0.5">
              aniq / xato / ortiqcha
            </div>
          </div>
        </div>

        {/* Card 4: Barqarorlik (Consistency) */}
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[var(--sub-color)] font-medium">
            Barqarorlik
          </span>
          <div className="mt-2">
            <div className="text-base font-bold text-[var(--text-color)]">
              {safeConsistency}%
            </div>
            {/* Visual mini bar */}
            <div className="w-full bg-[var(--sub-alt)] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[var(--main-color)] rounded-full transition-all"
                style={{ width: `${safeConsistency}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Vaqt */}
        <div className="col-span-2 sm:col-span-1 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[var(--sub-color)] font-medium">
            Vaqt
          </span>
          <div className="mt-2">
            <div className="text-base font-bold text-[var(--text-color)]">
              {safeTime}.0s
            </div>
            <div className="text-[11px] text-[var(--sub-color)] mt-0.5">
              Sinov davomiyligi
            </div>
          </div>
        </div>

      </div>


      {/* ========================================================================= */}
      {/* ACTION BAR: PRIMARY WORKFLOW CONTROLS (Center Stage & Ergonomic)          */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 p-3 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl">
        
        {/* Left: Quick Actions (Keyingi test, Qaytadan) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Next Test button (Primary CTA) */}
          <button
            type="button"
            onClick={onNextTest}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--main-color)] hover:opacity-90 text-[var(--bg-color)] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
            title="Keyingi testga oʻtish (Tab)"
          >
            <span>Keyingi test</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Restart button */}
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-medium text-xs sm:text-sm transition-all cursor-pointer active:scale-95 border border-[var(--sub-alt)]"
            title="Qaytadan topshirish (Enter)"
          >
            <RotateCcw className="w-4 h-4 text-[var(--sub-color)]" />
            <span>Qaytadan</span>
          </button>
        </div>

        {/* Center/Right: Secondary Controls (Share, Leaderboard, Keyboard helper) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          
          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-medium text-xs sm:text-sm transition-all cursor-pointer active:scale-95 border border-[var(--sub-alt)]"
            title="Natijani nusxalash"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Nusxalandi!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[var(--sub-color)]" />
                <span>Ulashish</span>
              </>
            )}
          </button>

          {/* Go to Leaderboard */}
          {onGoToLeaderboard && (
            <button
              type="button"
              onClick={onGoToLeaderboard}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-medium text-xs sm:text-sm transition-all cursor-pointer active:scale-95 border border-[var(--sub-alt)]"
              title="Reyting jadvalini koʻrish"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Reyting</span>
            </button>
          )}

        </div>

      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-[var(--sub-color)]">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-[var(--text-color)] font-mono text-[10px] font-bold">Tab</kbd>
          <span>Keyingi test</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-[var(--text-color)] font-mono text-[10px] font-bold">Enter</kbd>
          <span>Qaytadan</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-alt)] text-[var(--text-color)] font-mono text-[10px] font-bold">Esc</kbd>
          <span>Bekor qilish</span>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* PERFORMANCE INSIGHTS & TABS: DEEP DIVE ANALYTICS                          */}
      {/* ========================================================================= */}
      <div className="mt-5 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-4 sm:p-5">
        
        {/* Insights Tab Headers */}
        <div className="flex items-center gap-2 border-b border-[var(--sub-alt)] pb-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-[var(--sub-alt)] text-[var(--text-color)] shadow-xs'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span>Xatolar tahlili</span>
            {wrongChars > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {wrongChars}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pace')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pace'
                ? 'bg-[var(--sub-alt)] text-[var(--text-color)] shadow-xs'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tezlik dinamikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ranking'
                ? 'bg-[var(--sub-alt)] text-[var(--text-color)] shadow-xs'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Daraja & Oʻrin</span>
          </button>
        </div>

        {/* TAB 1: Key Mistakes & Accuracy Insights */}
        {activeTab === 'insights' && (
          <div>
            {wrongChars === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Check className="w-6 h-6 shrink-0" />
                <div>
                  <div className="text-sm font-bold">Tabriklaymiz! 100% mutlaq aniqlik.</div>
                  <div className="text-xs opacity-90 mt-0.5">
                    Ushbu testda birorta ham xato qilmadingiz. Har bir belgi oʻz vaqtida va aniq kiritildi.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs text-[var(--sub-color)] mb-2.5 flex items-center justify-between">
                  <span>Xatolik yuz bergan klavishlar va ularning takrorlanishi:</span>
                  <span className="text-rose-500 font-semibold">{wrongChars} ta notoʻgʻri belgi</span>
                </div>

                {keyMistakesList.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {keyMistakesList.map(([keyName, count], idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2"
                      >
                        <span className="font-mono text-sm">"{keyName}"</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[11px] font-normal">
                          {count} marta xato
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--sub-alt)] text-xs text-[var(--sub-color)]">
                    Xatoliklar kiritish vaqtida tezda tuzatildi (Backspaced).
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Pace Progression & Timing Stats */}
        {activeTab === 'pace' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)]">
              <div className="text-[11px] text-[var(--sub-color)] font-medium">Maksimal tezlik nuqtasi</div>
              <div className="text-xl font-bold text-[var(--text-color)] mt-1">{peakSpeed} WPM</div>
              <div className="text-[11px] text-[var(--sub-color)] mt-0.5">Testning eng tez surʼati</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)]">
              <div className="text-[11px] text-[var(--sub-color)] font-medium">Boshlangʻich tezlik (1-3s)</div>
              <div className="text-xl font-bold text-[var(--text-color)] mt-1">
                {timelineData[0]?.wpm || safeWpm} WPM
              </div>
              <div className="text-[11px] text-[var(--sub-color)] mt-0.5">Tezlikka kirishish surʼati</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)]">
              <div className="text-[11px] text-[var(--sub-color)] font-medium">Tezlik farqi (WPM vs Raw)</div>
              <div className="text-xl font-bold text-[var(--text-color)] mt-1">
                {Math.max(0, safeRawWpm - safeWpm)} WPM
              </div>
              <div className="text-[11px] text-[var(--sub-color)] mt-0.5">Xatolar sabab yoʻqotilgan tezlik</div>
            </div>
          </div>
        )}

        {/* TAB 3: Community Percentile & Standing */}
        {activeTab === 'ranking' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-alt)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-[var(--text-color)]">
                  {safeWpm >= 85 ? 'Top 5% — Elita darajasi!' : safeWpm >= 65 ? 'Top 25% — Yuqori daraja!' : safeWpm >= 45 ? 'Top 50% — Oʻrtacha daraja' : 'Boshlangʻich daraja'}
                </div>
                <div className="text-xs text-[var(--sub-color)] mt-1">
                  Sizning tezligingiz Oʻzbekiston boʻyicha typistlar orasida mustahkam oʻrin egallaydi.
                </div>
              </div>
              {onGoToLeaderboard && (
                <button
                  type="button"
                  onClick={onGoToLeaderboard}
                  className="px-4 py-2 rounded-xl bg-[var(--main-color)] text-[var(--bg-color)] font-bold text-xs transition-opacity hover:opacity-90 shrink-0 cursor-pointer"
                >
                  Toʻliq reytingni koʻrish
                </button>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
