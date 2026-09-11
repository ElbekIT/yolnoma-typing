import React, { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  Download
} from 'lucide-react';
import { TypingResult } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { ShareModal } from '../share/ShareModal';
import { ShareResultCertificateModal } from '../share/ShareResultCertificateModal';
import { KeyboardHeatmap } from './KeyboardHeatmap';

interface ResultModalProps {
  result: TypingResult | null;
  onRestart: () => void;
  onNextTest: () => void;
  onGoToLeaderboard?: () => void;
  onOpenLogin?: () => void;
  onStartTargetedPractice?: (keys: string[]) => void;
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
  onGoToLeaderboard,
  onOpenLogin,
  onStartTargetedPractice
}) => {
  const { themeConfig } = useSettings();
  const { user, profile, signInWithGoogle, signInWithGithub } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto safe-top safe-bottom">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-4 sm:p-7 shadow-2xl text-[var(--text-color)] my-auto max-h-[94vh] overflow-y-auto">
        
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
                {user ? (
                  "Natijangiz hisobga olindi va profilingizga saqlandi"
                ) : (
                  <span className="text-amber-400 font-medium">
                    Mehmon rejimi • Reytingda ko'rinish uchun tizimga kiring
                  </span>
                )}
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

        {/* Feature 5: Keyboard Heatmap & Error Analysis */}
        <KeyboardHeatmap
          charStats={result.charStats}
          onStartTargetedPractice={onStartTargetedPractice}
        />

        {/* Guest Leaderboard CTA: Prompt Google / GitHub login */}
        {!user && (
          <div className="mb-5 p-4 rounded-xl bg-[var(--sub-alt)]/40 border border-amber-500/30 text-left space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-color)]">
                  Natijangiz va reytingda ko'rinish uchun tizimga kiring
                </h4>
                <p className="text-[11px] text-[var(--sub-color)] mt-0.5 leading-relaxed">
                  Siz mehmon sifatida yozdingiz. Natijangiz saqlanib, milliy va global reytingda o'rningiz chiqishi uchun Google yoki GitHub orqali 1 soniyada tizimga kiring:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pl-8">
              <button
                type="button"
                onClick={async () => {
                  setAuthLoading(true);
                  try {
                    await signInWithGoogle();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setAuthLoading(true);
                  try {
                    await signInWithGithub();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>

              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-xs font-mono text-[var(--main-color)] hover:underline ml-1 cursor-pointer"
                >
                  login sahifasiga o'tish →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--sub-alt)]">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {/* Share Certificate Button (Viral feature) */}
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              title="Instagram Story yoki Banner formatida rasmiy sertifikat yuklab olish"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Sertifikat</span>
            </button>

            {/* Share button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm"
              title="Do'stlarga ulashish va musobaqaga chaqirish"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Ulashish</span>
            </button>

            {/* Optional Leaderboard button */}
            {onGoToLeaderboard && (
              <button
                onClick={onGoToLeaderboard}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-xs font-semibold text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Reyting</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Restart button */}
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--sub-color)]/20 transition-colors cursor-pointer"
              title="Qayta boshlash (Esc)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Qayta topshirish</span>
            </button>

            {/* Next Test Button */}
            <button
              onClick={onNextTest}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-[var(--main-color)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity cursor-pointer"
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

      {/* 1-Tap Viral Share Dialog */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        payload={{
          wpm: result.wpm,
          accuracy: result.accuracy,
          source: 'test_result'
        }}
      />

      {/* Feature 1: Result Certificate Generator Modal */}
      <ShareResultCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        result={result}
        displayName={profile?.displayName || user?.displayName || 'Tezkor Yozuvchi'}
      />
    </div>
  );
};
