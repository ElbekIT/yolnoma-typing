import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Laptop,
  Globe,
  Clock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';
import { fetchAdminSessions, terminateAdminSession, AdminSessionItem } from '../../utils/ownerAuth';

export const AdminSessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminSessions();
      if (res.success) {
        setSessions(res.sessions);
      } else if (res.error) {
        setNotification({ type: 'error', message: res.error });
      }
    } catch {
      setNotification({ type: 'error', message: 'Seanslarni yuklashda xatolik yuz berdi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const handleKickSession = async (session: AdminSessionItem) => {
    if (session.isRootOwner) {
      setNotification({
        type: 'error',
        message: 'Asosiy Bosh Administrator (Root Owner) seansini chiqarib yuborish mumkin emas! U daxlsizdir.'
      });
      return;
    }

    const confirmKick = window.confirm(
      `Haqiqatan ham ushbu begona/ikkinchi seansni (IP: ${session.ip}) majburiy to'xtatib, tizimdan chiqarib yubormoqchimisiz?`
    );
    if (!confirmKick) return;

    setTerminatingId(session.sessionId);
    setNotification(null);

    try {
      const res = await terminateAdminSession(session.sessionId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Seans muvaffaqiyatli to\'xtatildi va chiqarib yuborildi!'
        });
        // Remove locally
        setSessions((prev) => prev.filter((s) => s.sessionId !== session.sessionId));
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Seansni tugatishda xatolik yuz berdi'
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Server bilan aloqa uzildi' });
    } finally {
      setTerminatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-color)] flex items-center gap-2">
                Faol Admin Seanslari Nazorati
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {sessions.length} ta faol seans
                </span>
              </h2>
              <p className="text-xs text-[var(--sub-color)]">
                Admin panelga kirgan barcha qurilmalar va seanslar roʻyxati. Begona admin seanslarini bir bosish bilan chiqarib yuborishingiz mumkin.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadSessions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-[var(--text-color)] hover:border-amber-500/40 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[var(--sub-color)] hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security notice */}
      <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
        <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-color)] leading-relaxed">
          <span className="font-bold text-amber-400">Bosh Administrator Himoyasi:</span> Bosh Administrator (Root Owner) akkaunti daxlsizdir. Begona shaxs yoki zaxira admin bosh egasini tizimdan chiqarib yubora olmaydi. Agar begona seans aniqlansa, darhol <span className="font-mono text-rose-400">"Chiqarib yuborish"</span> tugmasini bosing.
        </div>
      </div>

      {/* Sessions list */}
      {loading && sessions.length === 0 ? (
        <div className="py-16 text-center text-xs text-[var(--sub-color)] flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <span>Faol admin seanslari tekshirilmoqda...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center text-xs text-[var(--sub-color)] bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl">
          Hozirda faol seanslar roʻyxati boʻsh
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((sess) => (
            <div
              key={sess.sessionId}
              className={`bg-[var(--card-bg)] border rounded-3xl p-5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                sess.isRootOwner
                  ? 'border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'border-[var(--sub-alt)] hover:border-rose-500/30'
              }`}
            >
              {/* Left Column: Device & Role info */}
              <div className="flex items-start gap-4">
                <div
                  className={`p-3.5 rounded-2xl shrink-0 ${
                    sess.isRootOwner
                      ? 'bg-gradient-to-br from-amber-500/20 to-amber-700/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {sess.isRootOwner ? <Crown className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-[var(--text-color)] font-mono">
                      {sess.username}
                    </span>

                    {sess.isRootOwner ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Crown className="w-3 h-3" />
                        Asosiy Egasi (Root Owner)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        <Shield className="w-3 h-3" />
                        Qoʻshimcha Admin
                      </span>
                    )}

                    {sess.isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Hozirgi qurilma
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--sub-color)] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-mono text-[var(--text-color)]">{sess.ip}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-purple-400" />
                      <span className="truncate max-w-[280px]" title={sess.userAgent}>
                        {sess.userAgent}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Kirilgan: {new Date(sess.loginTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[var(--sub-alt)]">
                {sess.isRootOwner ? (
                  <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center gap-2 select-none shadow-sm">
                    <Lock className="w-3.5 h-3.5" />
                    <span>👑 Daxlsiz Egasi</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleKickSession(sess)}
                    disabled={terminatingId === sess.sessionId}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {terminatingId === sess.sessionId ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    <span>Seansni majburiy to'xtatish (Chiqarish)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
