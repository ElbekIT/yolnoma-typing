import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, LogOut, Mail, Send, CheckCircle2, Clock, User, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserBlockedScreenProps {
  reason?: string;
  bannedAt?: number;
  displayName?: string;
  username?: string;
  email?: string;
}

export const UserBlockedScreen: React.FC<UserBlockedScreenProps> = ({
  reason = 'Qoidabuzarlik, sunʼiy avto-kliker dasturlaridan foydalanish yoki ruxsatsiz xatti-harakatlar aniqlangani sababli hisob toʻxtatildi.',
  bannedAt,
  displayName,
  username,
  email
}) => {
  const { logout } = useAuth();
  const [appealSent, setAppealSent] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [showAppealBox, setShowAppealBox] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const formattedDate = bannedAt
    ? new Date(bannedAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
    : new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

  const handleSendAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) return;
    setIsSending(true);

    try {
      await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: displayName || username || 'Bloklangan Foydalanuvchi',
          senderEmail: email || 'nomalum@yolnoma.uz',
          subject: 'Apellyatsiya: Blokdan chiqarish arizasi',
          message: `Foydalanuvchi @${username || 'foydalanuvchi'} (Email: ${email || 'nomaʼlum'}) apellyatsiya yubordi:\n\n${appealText.trim()}`,
          category: 'appeal',
          timestamp: Date.now()
        })
      });
      setAppealSent(true);
    } catch {
      setAppealSent(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="user-blocked-screen"
      className="min-h-screen bg-[#070913] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white relative overflow-hidden font-sans"
    >
      {/* Dynamic Red Cyber Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(#200c14_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-900/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div
        id="user-blocked-card"
        className="max-w-xl w-full bg-slate-900/95 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-rose-950/60 backdrop-blur-2xl relative z-10 space-y-6 text-center"
      >
        {/* Top Danger Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-black uppercase tracking-wider">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span>HISOBINGIZ BUTUNLAY BLOKLANDI</span>
          </div>
        </div>

        {/* Warning Icon */}
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-rose-500/20 to-red-950/50 border-2 border-rose-500/60 p-4 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-600/25 relative">
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 animate-pulse" />
          <Lock className="w-5 h-5 text-rose-300 absolute -top-1 -right-1 bg-slate-950 rounded-lg p-0.5 border border-rose-500/50" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Kirish Taqiqlangan!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Platforma xavfsizlik filtri va maʼmuriyati tomonidan ushbu profilning barcha harakatlari toʻxtatildi.
          </p>
        </div>

        {/* User & Incident Forensics */}
        <div className="bg-black/60 border border-rose-500/25 rounded-2xl p-4 text-left font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-400" />
              Foydalanuvchi:
            </span>
            <span className="text-white font-bold">
              {displayName || 'Foydalanuvchi'} {username ? `(@${username})` : ''}
            </span>
          </div>

          {email && (
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                Email:
              </span>
              <span className="text-slate-300 truncate max-w-[240px]">{email}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              Qayd etilgan vaqt:
            </span>
            <span className="text-slate-300">{formattedDate}</span>
          </div>

          <div className="pt-1">
            <span className="text-rose-400 font-bold block mb-1">Bloklanish sababi:</span>
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-sans leading-relaxed">
              {reason}
            </div>
          </div>
        </div>

        {/* Appeal Form / Support Box */}
        {appealSent ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 text-left font-sans">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>
              Apellyatsiya arizangiz maʼmuriyatga muvaffaqiyatli yetkazildi. 24 soat ichida koʻrib chiqiladi.
            </span>
          </div>
        ) : showAppealBox ? (
          <form onSubmit={handleSendAppeal} className="space-y-3 text-left font-sans animate-in fade-in">
            <label className="text-xs font-bold text-slate-300 block">
              Maʼmuriyatga apellyatsiya arizasi yozish:
            </label>
            <textarea
              id="input-appeal-text"
              rows={3}
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Qarordan norozi boʻlsangiz, vaziyatni batafsil tushuntirib bering..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                id="btn-submit-appeal"
                disabled={isSending || !appealText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Yuborilmoqda...' : 'Arizani Yuborish'}</span>
              </button>
              <button
                type="button"
                id="btn-cancel-appeal"
                onClick={() => setShowAppealBox(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              id="btn-open-appeal"
              onClick={() => setShowAppealBox(true)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>Apellyatsiya berish</span>
            </button>
            <a
              href="mailto:support@yolnoma.uz"
              className="text-slate-400 hover:text-rose-400 transition-colors underline"
            >
              support@yolnoma.uz
            </a>
          </div>
        )}

        {/* Log Out Action */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-logout-blocked"
            onClick={logout}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Boshqa Hisobga Oʻtish (Chiqish)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
