import React from 'react';
import {
  RotateCcw,
  Zap,
  Target,
  Clock,
  Award,
  Share2,
  Check,
  TrendingUp
} from 'lucide-react';
import { TypingStats } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ResultViewProps {
  stats: TypingStats;
  onRestart: () => void;
  language: string;
}

export const ResultView: React.FC<ResultViewProps> = ({ stats, onRestart, language }) => {
  const { themeConfig } = useSettings();
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    const text = `🚀 I just scored ${stats.wpm} WPM with ${stats.accuracy}% accuracy on Yolnoma Typing Platform! Try to beat my score!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = stats.history.map((h, i) => ({
    second: i + 1,
    wpm: h.wpm,
    rawWpm: h.rawWpm,
    errors: h.errors
  }));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[var(--sub-alt)] pb-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sub-color)]">
              Test Completed
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-6xl font-black font-mono text-[var(--main-color)]">{stats.wpm}</span>
              <span className="text-xl font-bold font-mono text-[var(--sub-color)]">WPM</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)]">Accuracy</span>
              <div className="text-2xl font-black font-mono text-emerald-500 mt-0.5">{stats.accuracy}%</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)]">Raw WPM</span>
              <div className="text-2xl font-black font-mono text-[var(--text-color)] mt-0.5">{stats.rawWpm}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)]">Characters</span>
              <div className="text-2xl font-black font-mono text-[var(--text-color)] mt-0.5">
                <span className="text-emerald-500">{stats.correctChars}</span>/
                <span className="text-rose-500">{stats.incorrectChars}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)]">Time</span>
              <div className="text-2xl font-black font-mono text-[var(--text-color)] mt-0.5">{stats.timeElapsed}s</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[var(--sub-color)] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--main-color)]" /> Speed & Consistency Curve
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="resultWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeConfig.mainColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={themeConfig.mainColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.subColor} opacity={0.15} />
                  <XAxis dataKey="second" stroke={themeConfig.subColor} tick={{ fontSize: 10 }} />
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
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke={themeConfig.mainColor}
                    fillOpacity={1}
                    fill="url(#resultWpm)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <button
            onClick={onRestart}
            autoFocus
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--main-color)] text-white font-extrabold text-sm shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next Test (Tab + Enter)</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--sub-alt)] text-[var(--text-color)] font-bold text-sm hover:bg-[var(--sub-color)]/20 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied Result!' : 'Share Score'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
