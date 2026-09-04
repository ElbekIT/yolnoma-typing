import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw
} from 'lucide-react';
import { rtdb } from '../../config/firebase';
import { ref, onValue, set as rtdbSet } from 'firebase/database';
import { getAdminToken } from '../../utils/ownerAuth';

interface MaintenanceState {
  active: boolean;
  title: string;
  message: string;
  estimatedTime: string;
  whitelistEmails: string[];
  updatedAt: number;
  enabledBy?: string;
}

export const AdminMaintenanceTab: React.FC = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceState>({
    active: false,
    title: 'Saytda Katta Yangilanish Ketmoqda! 🛠️',
    message: 'Hurmatli foydalanuvchilar, platformada muhim xavfsizlik yangilanishi va yangi qulayliklar oʻrnatilmoqda. Tez orada barcha xizmatlar toʻliq qayta ishga tushadi.',
    estimatedTime: '15 daqiqa',
    whitelistEmails: ['yuldashivagavharoy@gmail.com'],
    updatedAt: Date.now(),
    enabledBy: 'yuldashivagavharoy@gmail.com'
  });

  const [titleInput, setTitleInput] = useState(maintenance.title);
  const [messageInput, setMessageInput] = useState(maintenance.message);
  const [timeInput, setTimeInput] = useState(maintenance.estimatedTime);
  const [isExemptOwner, setIsExemptOwner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync from Firebase RTDB in real time
  useEffect(() => {
    const maintenanceRef = ref(rtdb, 'system/maintenance');
    const unsub = onValue(maintenanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data.active === 'boolean') {
        setMaintenance(data);
        setTitleInput(data.title || 'Saytda Katta Yangilanish Ketmoqda! 🛠️');
        setMessageInput(data.message || '');
        setTimeInput(data.estimatedTime || '15 daqiqa');
      }
    });

    // Also fetch from backend
    fetch('/api/maintenance/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.active === 'boolean') {
          setMaintenance(data);
          setTitleInput(data.title || 'Saytda Katta Yangilanish Ketmoqda! 🛠️');
          setMessageInput(data.message || '');
          setTimeInput(data.estimatedTime || '15 daqiqa');
        }
      })
      .catch(() => {});

    return () => unsub();
  }, []);

  const handleUpdateMaintenance = async (activate: boolean) => {
    setLoading(true);
    setFeedback(null);

    const token = getAdminToken();
    const whitelist = ['yuldashivagavharoy@gmail.com', 'elbek@yolnoma.uz'];

    const payload: MaintenanceState = {
      active: activate,
      title: titleInput.trim() || 'Saytda Katta Yangilanish Ketmoqda! 🛠️',
      message: messageInput.trim() || 'Hurmatli foydalanuvchilar, saytda yangilanish ishlari olib borilmoqda...',
      estimatedTime: timeInput.trim() || '15 daqiqa',
      whitelistEmails: whitelist,
      updatedAt: Date.now(),
      enabledBy: 'yuldashivagavharoy@gmail.com'
    };

    try {
      // 1. Sync to Express backend API (Authoritative server)
      if (token) {
        const res = await fetch('/api/admin/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Server xatosi (${res.status})`);
        }
      }

      // 2. Also sync to Firebase RTDB if permitted (safe fallback)
      try {
        await rtdbSet(ref(rtdb, 'system/maintenance'), payload);
      } catch {
        // Ignored: Server API already holds the authoritative state
      }

      setMaintenance(payload);
      setFeedback({
        type: 'success',
        text: activate
          ? '🔴 Sayt barcha foydalanuvchilar uchun yopildi va ogohlantirish ekrani ishga tushirildi! (yuldashivagavharoy@gmail.com hisobi uchun sayt toʻliq ochiq)'
          : '🟢 Yangilanish rejimi oʻchirildi! Sayt barcha foydalanuvchilar uchun qayta ochildi.'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: `Xatolik yuz berdi: ${err?.message || 'Ulanish xatosi'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner Card */}
      <div className={`p-6 rounded-3xl border transition-all ${
        maintenance.active
          ? 'bg-rose-950/40 border-rose-500/50 shadow-xl shadow-rose-950/30'
          : 'bg-[var(--card-bg)] border-cyan-500/30 shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border ${
              maintenance.active
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
            }`}>
              <Wrench className={`w-8 h-8 ${maintenance.active ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-mono font-extrabold text-[10px] uppercase tracking-wider ${
                  maintenance.active
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {maintenance.active ? '🔴 REJIM: YANGILANISH (SAYT YOPILGAN)' : '🟢 REJIM: NORMAL (SAYT OCHIQ)'}
                </span>
                <span className="text-xs font-mono text-[var(--sub-color)]">
                  Real-time Instant Push faol
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Saytni Yangilash & Maintenance Boshqaruvi
              </h2>
              <p className="text-xs text-[var(--sub-color)]">
                Saytni yangilamoqchi boʻlganingizda barcha oddiy foydalanuvchilar ekranida sayt avtomatik yopiladi va markazda siz yozgan ogohlantirish chiqadi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Istisno: <strong className="text-amber-400">yuldashivagavharoy@gmail.com</strong>
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-5">
          <div className="flex items-center gap-2 text-white font-black text-sm border-b border-[var(--sub-alt)] pb-3">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Foydalanuvchilarga Yuboriladigan Ogohlantirish Sozlamalari</span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Ekranda Chiqadigan Sarlavha:</span>
            </label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Masalan: Saytda Katta Yangilanish Ketmoqda! 🛠️"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Message Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Batafsil Ogohlantirish Matni:</span>
            </label>
            <textarea
              rows={4}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Foydalanuvchilarga nima boʻlayotgani haqida xabar yozing..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium leading-relaxed resize-none"
            />
          </div>

          {/* Estimated Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Taxminiy / Kutilayotgan Vaqt:</span>
            </label>
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="Masalan: 10-15 daqiqa"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Whitelist Option */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isExemptOwner}
                onChange={(e) => setIsExemptOwner(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
              />
              <div className="text-xs text-slate-200">
                <span className="font-bold text-amber-400">Mendan tashqari</span> (<code>yuldashivagavharoy@gmail.com</code> hisobiga sayt doimiy ochiq qolsin)
              </div>
            </label>
            <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
              Ushbu belgi yoqilgan boʻlsa, siz saytda yangi funksiyalarni bemalol sinab koʻra olasiz, oddiy mehmon va foydalanuvchilarga esa ekran avtomatik yopiladi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleUpdateMaintenance(true)}
              disabled={loading}
              className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>Saytni Barchaga Yopish va Ogohlantirishni Joʻnatish</span>
            </button>

            {maintenance.active && (
              <button
                onClick={() => handleUpdateMaintenance(false)}
                disabled={loading}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>Yangilanish Tugadi (Saytni Ochish)</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview of what users see */}
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-3">
            <div className="flex items-center gap-2 text-white font-black text-xs">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Foydalanuvchilar Ekrani (Koʻrinishi)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
              Jonli Preview
            </span>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center flex flex-col justify-center space-y-3 relative overflow-hidden">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Wrench className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-white leading-tight">
                {titleInput || 'Sarlavha...'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-normal line-clamp-4">
                {messageInput || 'Xabar matni bu yerda koʻrinadi...'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-[10px] font-mono text-cyan-300 flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Kutilayotgan vaqt: {timeInput}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Siz tugmani bosishingiz bilan barcha foydalanuvchilar ekranida ushbu oyna darhol paydo boʻladi.
          </p>
        </div>
      </div>
    </div>
  );
};
