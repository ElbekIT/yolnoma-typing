import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  ShieldCheck,
  Cpu,
  Lock,
  RefreshCw,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { getAdminToken } from '../../utils/ownerAuth';

interface ServerStatsData {
  system: {
    status: string;
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
  metrics: {
    totalTestsValidated: number;
    suspiciousTestsBlocked: number;
    totalKeystrokesProcessed: number;
    totalContactMessages: number;
    securityEventsBlocked: number;
    activeLockouts: number;
    bannedIpCount: number;
  };
}

export const AdminServerTab: React.FC = () => {
  const [stats, setStats] = useState<ServerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualIpToBan, setManualIpToBan] = useState('');
  const [isBanning, setIsBanning] = useState(false);
  const [banFeedback, setBanFeedback] = useState<string | null>(null);

  const fetchServerStats = async () => {
    const token = getAdminToken();
    if (!token) {
      setError('Admin token topilmadi');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Server xatosi: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Server statistikasini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStats();
    const interval = setInterval(fetchServerStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBanIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpToBan.trim()) return;

    const token = getAdminToken();
    if (!token) return;

    setIsBanning(true);
    setBanFeedback(null);

    try {
      const res = await fetch('/api/admin/ban-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ip: manualIpToBan.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setBanFeedback(`✅ ${manualIpToBan} manzili muvaffaqiyatli server darajasida bloklandi`);
        setManualIpToBan('');
        fetchServerStats();
      } else {
        setBanFeedback(`❌ Xatolik: ${data.error || 'Bloklash amalga oshmadi'}`);
      }
    } catch (err) {
      setBanFeedback('❌ Server bilan ulanishda xatolik');
    } finally {
      setIsBanning(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}k ${h}s ${m}d`;
    if (h > 0) return `${h}s ${m}d ${s}son`;
    return `${m}d ${s}son`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--card-bg)] border border-amber-500/30 p-5 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-400" />
              <span>Node.js / Express Backend Tizim Diagnostikasi</span>
            </h2>
          </div>
          <p className="text-xs text-[var(--sub-color)] mt-1">
            Real vaqt rejimida server xotirasi, Anti-Cheat tekshiruvlari va xavfsizlik himoyasi holati
          </p>
        </div>

        <button
          onClick={fetchServerStats}
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 text-xs font-black transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Uptime */}
          <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
              <span>Server Uptime</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              {formatUptime(stats.system.uptimeSeconds)}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Holat: {stats.system.status}</span>
            </div>
          </div>

          {/* Anti-Cheat Validated */}
          <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
              <span>Tekshirilgan Testlar</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-black text-amber-400">
              {stats.metrics.totalTestsValidated.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--sub-color)] font-mono">
              Bloklangan bot/cheat: {stats.metrics.suspiciousTestsBlocked}
            </div>
          </div>

          {/* Keystrokes Processed */}
          <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
              <span>Jami Bosilgan Belgilar</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              {stats.metrics.totalKeystrokesProcessed.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--sub-color)] font-mono">
              Serverda tekshirilgan
            </div>
          </div>

          {/* RAM / Memory */}
          <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--sub-color)] font-bold">
              <span>RAM Xotirasi (RSS)</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono font-black text-cyan-400">
              {stats.system.memory.rssMb} MB
            </div>
            <div className="text-[11px] text-[var(--sub-color)] font-mono">
              Heap: {stats.system.memory.heapUsedMb} / {stats.system.memory.heapTotalMb} MB
            </div>
          </div>
        </div>
      )}

      {/* Security Architecture & Anti-Cheat Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anti-DDoS & Security Features */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-4">
          <div className="flex items-center gap-2 text-white font-black text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Xavfsizlik & Anti-Cheat Arxitekturasi</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Anti-Cheat Matematik Tekshiruv:</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                FAOL (280 WPM Limit)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">HMAC-SHA256 Token Imzolash:</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                FAOL
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Anti-Brute Force Lockout:</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                Max 4 Urinish / 15 daqiqa
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Honeypot Spambot Tuzoqlari:</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                O'rnatilgan
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">IP / Subnet / Burst Rate Limiter:</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                FAOL
              </span>
            </div>
          </div>
        </div>

        {/* IP Ban & Firewall Management */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-4">
          <div className="flex items-center gap-2 text-white font-black text-sm">
            <Ban className="w-5 h-5 text-rose-400" />
            <span>Server IP Firewall Boshqaruvi</span>
          </div>
          <p className="text-xs text-[var(--sub-color)]">
            Hujum qilayotgan yoki shubhali IP manzillarni to'g'ridan-to'g'ri backend server darajasida bloklash.
          </p>

          <form onSubmit={handleBanIp} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Bloklanuvchi IP Manzili:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualIpToBan}
                  onChange={(e) => setManualIpToBan(e.target.value)}
                  placeholder="Masalan: 198.51.100.45"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={isBanning}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isBanning ? '...' : 'Bloklash'}</span>
                </button>
              </div>
            </div>
          </form>

          {banFeedback && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 animate-in fade-in">
              {banFeedback}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Bloklangan IPlar soni: <span className="text-rose-400 font-bold">{stats?.metrics.bannedIpCount || 0}</span> ta
          </div>
        </div>
      </div>
    </div>
  );
};
