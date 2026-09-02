import React from 'react';
import {
  Zap,
  Target,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useSettings } from '../../context/SettingsContext';

export const DashboardView: React.FC = () => {
  const { profile, userResultsHistory } = useAuth();
  const { themeConfig } = useSettings();

  const totalTests = profile?.totalTests || userResultsHistory.length;
  const highestWpm = profile?.highestWpm || Math.max(...userResultsHistory.map((r) => r.wpm), 0);
  const highestAccuracy = profile?.highestAccuracy || Math.max(...userResultsHistory.map((r) => r.accuracy), 0);
  const totalSeconds = profile?.totalTimeTypedSeconds || userResultsHistory.reduce((acc, r) => acc + r.testTimeSeconds, 0);
  const totalHoursFormatted = (totalSeconds / 3600).toFixed(1);

  const chartData = [...userResultsHistory]
    .slice(0, 15)
    .reverse()
    .map((r, i) => ({
      index: i + 1,
      wpm: r.wpm,
      accuracy: r.accuracy,
      date: new Date(r.timestamp).toLocaleDateString()
    }));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-[var(--main-color)] to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {profile?.displayName || 'Typer'}! 👋
          </h2>
          <p className="text-xs sm:text-sm opacity-90 mt-2 max-w-xl">
            You have completed <span className="font-bold">{totalTests} tests</span> and spent{' '}
            <span className="font-bold">{totalHoursFormatted} hours</span> honing your typing speed and precision.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <Award className="w-10 h-10 text-amber-300" />
          <div>
            <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Current Streak</span>
            <div className="text-2xl font-black font-mono">{profile?.currentStreak || 1} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--sub-color)] mb-2">
            <span className="text-xs font-semibold uppercase">Highest WPM</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-[var(--main-color)]">{highestWpm}</div>
          <p className="text-[10px] text-[var(--sub-color)] mt-1">Personal Best Speed</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--sub-color)] mb-2">
            <span className="text-xs font-semibold uppercase">Best Accuracy</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-emerald-500">{highestAccuracy}%</div>
          <p className="text-[10px] text-[var(--sub-color)] mt-1">Peak Precision</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--sub-color)] mb-2">
            <span className="text-xs font-semibold uppercase">Total Tests</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-[var(--text-color)]">{totalTests}</div>
          <p className="text-[10px] text-[var(--sub-color)] mt-1">Completed Sessions</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[var(--sub-color)] mb-2">
            <span className="text-xs font-semibold uppercase">Time Typed</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-mono font-extrabold text-[var(--text-color)]">{totalHoursFormatted}h</div>
          <p className="text-[10px] text-[var(--sub-color)] mt-1">Total Time Spent</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--main-color)]" />
          <span>Speed Trend Progression</span>
        </h3>
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeConfig.mainColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={themeConfig.mainColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.subColor} opacity={0.15} />
                <XAxis dataKey="index" stroke={themeConfig.subColor} tick={{ fontSize: 10 }} />
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
                  fill="url(#wpmGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-[var(--sub-color)]">
            Complete your first typing test to see performance trends!
          </div>
        )}
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--main-color)]" />
          <span>Recent Test History</span>
        </h3>
        {userResultsHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-[var(--sub-alt)] text-[var(--sub-color)] font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">WPM</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sub-alt)]">
                {userResultsHistory.slice(0, 10).map((r, idx) => (
                  <tr key={idx} className="hover:bg-[var(--sub-alt)]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[var(--main-color)]">{r.wpm} WPM</td>
                    <td className="py-3 px-3 font-mono text-emerald-500 font-bold">{r.accuracy}%</td>
                    <td className="py-3 px-3 text-[var(--text-color)] capitalize">{r.mode} ({r.timeMode || r.wordCountMode}s)</td>
                    <td className="py-3 px-3 text-[var(--sub-color)] uppercase">{r.language}</td>
                    <td className="py-3 px-3 text-[var(--sub-color)]">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[var(--sub-color)] py-4">No test history available yet.</p>
        )}
      </div>
    </div>
  );
};
