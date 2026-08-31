import React, { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { TypingResult } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface ResultModalProps {
  result: TypingResult | null;
  onRestart: () => void;
  onNextTest: () => void;
  onGoToLeaderboard?: () => void;
}

// Ultra-fast lightweight SVG timeline chart (Zero CPU overhead, no heavy chart libraries)
const LightweightSvgChart: React.FC<{
  data: { time: number; wpm: number; rawWpm: number; errors: number }[];
  mainColor: string;
  subColor: string;
}> = ({ data, mainColor, subColor }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const width = 600;
  const height = 140;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxWpm = Math.max(...data.map((d) => Math.max(d.wpm || 0, d.rawWpm || 0, 30)), 40);
  const minWpm = 0;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minWpm) / (maxWpm - minWpm || 1)) * chartH;

  const wpmPoints = data.map((d, i) => `${getX(i)},${getY(d.wpm)}`).join(' ');
  const rawPoints = data.map((d, i) => `${getX(i)},${getY(d.rawWpm)}`).join(' ');

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div className="w-full relative select-none">
      <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-[var(--sub-color)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-[var(--text-color)]">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--main-color)]" />
            Tezlik grafigi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: mainColor }} />
            wpm
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full opacity-50" style={{ backgroundColor: subColor }} />
            raw
          </span>
        </div>
        {activePoint && (
          <div className="text-xs font-mono font-bold text-[var(--text-color)] bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--sub-alt)]">
            {activePoint.time}s | WPM: <span style={{ color: mainColor }}>{activePoint.wpm}</span> | Raw: {activePoint.rawWpm}
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden bg-[var(--sub-alt)]/40 rounded-xl border border-[var(--sub-alt)] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 sm:h-36 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((pct, i) => {
            const y = padding.top + chartH * (1 - pct);
            const val = Math.round(minWpm + (maxWpm - minWpm) * pct);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={subColor}
                  strokeOpacity="0.15"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill={subColor}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  opacity="0.7"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Raw WPM Line (dashed) */}
          <polyline
            fill="none"
            stroke={subColor}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
            points={rawPoints}
          />

          {/* Main WPM Line */}
          <polyline
            fill="none"
            stroke={mainColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={wpmPoints}
          />

          {/* Error markers */}
          {data.map((d, i) => {
            if (d.errors > 0) {
              return (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(d.wpm)}
                  r="3"
                  fill="var(--error-color, #ef4444)"
                />
              );
            }
            return null;
          })}

          {/* Interactive hover overlay columns */}
          {data.map((d, i) => {
            const colW = chartW / Math.max(1, data.length - 1);
            return (
              <rect
                key={i}
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

          {/* Hover indicator line and dot */}
          {hoverIndex !== null && data[hoverIndex] && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartH}
                stroke={subColor}
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].wpm)}
                r="4"
                fill={mainColor}
                stroke="var(--card-bg)"
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
  onGoToLeaderboard
}) => {
  const { themeConfig } = useSettings();
  const [copied, setCopied] = useState(false);

  // Keyboard shortcut listener: Enter / Tab / Space to restart or start next test instantly
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

  const handleShare = () => {
    const text = `⚡ Yolnoma Typing Natijasi ⚡\nTezlik: ${result.wpm} WPM (${result.cpm} CPM)\nAniqlik: ${result.accuracy}%\nXatolar: ${result.errors}\nVaqt: ${result.testTimeSeconds}s\nTil: ${result.language.toUpperCase()}\nSayt: https://yolnoma.uz`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-5 sm:p-7 shadow-2xl text-[var(--text-color)] my-auto">
        
        {/* Top Header & PB Notification */}
        <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-[var(--sub-alt)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-color)]">
                Test Yakunlandi
              </h2>
              <p className="text-[11px] text-[var(--sub-color)]">
                Natijangiz hisobga olindi va reytingga saqlandi
              </p>
            </div>
          </div>

          {result.isPersonalBest && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold shrink-0">
              <Trophy className="w-3.5 h-3.5 fill-amber-500" />
              <span>Yangi Rekord!</span>
            </div>
          )}
        </div>

        {/* Primary Monkeytype-style Main Stats Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {/* Main WPM */}
          <div className="bg-[var(--sub-alt)]/60 p-3.5 rounded-xl border border-[var(--sub-alt)] flex flex-col items-center justify-center">
            <span className="text-[11px] text-[var(--sub-color)] font-mono uppercase tracking-wider font-semibold">wpm</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--main-color)] font-mono my-0.5">
              {result.wpm}
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">raw: {result.rawWpm}</span>
          </div>

          {/* Accuracy */}
          <div className="bg-[var(--sub-alt)]/60 p-3.5 rounded-xl border border-[var(--sub-alt)] flex flex-col items-center justify-center">
            <span className="text-[11px] text-[var(--sub-color)] font-mono uppercase tracking-wider font-semibold">acc</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-500 font-mono my-0.5">
              {result.accuracy}%
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">{result.correctChars} to'g'ri</span>
          </div>

          {/* CPM */}
          <div className="bg-[var(--sub-alt)]/60 p-3.5 rounded-xl border border-[var(--sub-alt)] flex flex-col items-center justify-center">
            <span className="text-[11px] text-[var(--sub-color)] font-mono uppercase tracking-wider font-semibold">cpm</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--text-color)] font-mono my-0.5">
              {result.cpm}
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">belgi/daq</span>
          </div>

          {/* Errors */}
          <div className="bg-[var(--sub-alt)]/60 p-3.5 rounded-xl border border-[var(--sub-alt)] flex flex-col items-center justify-center">
            <span className="text-[11px] text-[var(--sub-color)] font-mono uppercase tracking-wider font-semibold">xatolar</span>
            <span className={`text-3xl sm:text-4xl font-extrabold font-mono my-0.5 ${result.errors > 0 ? 'text-[var(--error-color)]' : 'text-emerald-500'}`}>
              {result.errors}
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">{result.testTimeSeconds}s vaqt</span>
          </div>
        </div>

        {/* Ultra-lightweight Timeline Chart */}
        {result.wpmHistory && result.wpmHistory.length > 1 && (
          <div className="mb-5">
            <LightweightSvgChart
              data={result.wpmHistory}
              mainColor={themeConfig.mainColor}
              subColor={themeConfig.subColor}
            />
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[var(--sub-alt)]">
          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] text-xs font-semibold text-[var(--text-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Nusxalandi!' : 'Ulashish'}</span>
            </button>

            {/* Optional Leaderboard button */}
            {onGoToLeaderboard && (
              <button
                onClick={onGoToLeaderboard}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-xs font-semibold text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Reyting</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Restart button */}
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--sub-color)]/20 transition-colors cursor-pointer"
              title="Qayta boshlash (Esc)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Qayta topshirish</span>
            </button>

            {/* Next Test Button */}
            <button
              onClick={onNextTest}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity cursor-pointer"
              title="Keyingi test (Tab / Enter)"
            >
              <span>Keyingi test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="mt-3 text-center text-[10px] text-[var(--sub-color)] font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)]">Tab</kbd> yoki <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)]">Enter</kbd> bosilsa keyingi test boshlanadi
        </div>
      </div>
    </div>
  );
};
