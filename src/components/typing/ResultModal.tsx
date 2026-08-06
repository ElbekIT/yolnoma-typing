import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Target,
  Clock,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TypingResult } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface ResultModalProps {
  result: TypingResult | null;
  onRestart: () => void;
  onNextTest: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onRestart, onNextTest }) => {
  const { themeConfig } = useSettings();
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleShare = () => {
    const text = `⚡ Yolnoma Typing Test Result ⚡\n🚀 Speed: ${result.wpm} WPM (${result.cpm} CPM)\n🎯 Accuracy: ${result.accuracy}%\n❌ Errors: ${result.errors}\n⏱️ Time: ${result.testTimeSeconds}s\n🌐 Language: ${result.language.toUpperCase()}\nTry it out at Yolnoma Typing!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-8 shadow-2xl text-[var(--text-color)] my-8">
        {/* Personal Best Badge */}
        {result.isPersonalBest && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold animate-bounce">
            <Trophy className="w-4 h-4 fill-amber-500" />
            <span>NEW PERSONAL BEST RECORD!</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Main WPM Card */}
          <div className="bg-[var(--sub-alt)] p-4 rounded-2xl border border-[var(--sub-color)]/10 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--sub-color)] font-medium uppercase tracking-wider">WPM</span>
            <span className="text-4xl font-extrabold text-[var(--main-color)] font-mono my-1">
              {result.wpm}
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">Raw: {result.rawWpm}</span>
          </div>

          {/* Accuracy Card */}
          <div className="bg-[var(--sub-alt)] p-4 rounded-2xl border border-[var(--sub-color)]/10 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--sub-color)] font-medium uppercase tracking-wider">Accuracy</span>
            <span className="text-4xl font-extrabold text-emerald-500 font-mono my-1">
              {result.accuracy}%
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">{result.correctChars} Correct</span>
          </div>

          {/* CPM Card */}
          <div className="bg-[var(--sub-alt)] p-4 rounded-2xl border border-[var(--sub-color)]/10 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--sub-color)] font-medium uppercase tracking-wider">CPM</span>
            <span className="text-4xl font-extrabold text-[var(--text-color)] font-mono my-1">
              {result.cpm}
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">Chars/min</span>
          </div>

          {/* Errors Card */}
          <div className="bg-[var(--sub-alt)] p-4 rounded-2xl border border-[var(--sub-color)]/10 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--sub-color)] font-medium uppercase tracking-wider">Errors</span>
            <span className="text-4xl font-extrabold text-[var(--error-color)] font-mono my-1">
              {result.errors}
            </span>
            <span className="text-[10px] text-[var(--sub-color)] font-mono">{result.backspaceCount} Backspaces</span>
          </div>
        </div>

        {/* WPM Progress Graph */}
        {result.wpmHistory && result.wpmHistory.length > 1 && (
          <div className="bg-[var(--sub-alt)] p-4 rounded-2xl border border-[var(--sub-color)]/10 mb-6">
            <h4 className="text-xs font-semibold text-[var(--sub-color)] mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[var(--main-color)]" />
              <span>Speed Consistency Timeline</span>
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.wpmHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.subColor} opacity={0.15} />
                  <XAxis dataKey="time" stroke={themeConfig.subColor} tick={{ fontSize: 10 }} />
                  <YAxis stroke={themeConfig.subColor} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: themeConfig.cardBg,
                      borderColor: themeConfig.subAlt,
                      borderRadius: '12px',
                      color: themeConfig.textColor,
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke={themeConfig.mainColor}
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="rawWpm"
                    stroke={themeConfig.subColor}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--sub-alt)]">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sub-alt)] text-xs font-semibold text-[var(--text-color)] hover:bg-[var(--main-color)] hover:text-white transition-all"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Share Result'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--sub-alt)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--sub-color)]/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              onClick={onNextTest}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-extrabold shadow-md hover:opacity-90 transition-all"
            >
              <span>Next Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
