import React, { useEffect, useState } from 'react';
import { Terminal, ShieldAlert, XCircle, RefreshCw, Lock, EyeOff } from 'lucide-react';
import { antiCheatManager } from '../utils/antiCheat';

export const DevToolsBlockedScreen: React.FC = () => {
  const [dots, setDots] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleManualCheck = () => {
    setIsChecking(true);
    const isOpen = antiCheatManager.checkDevToolsNow();
    setTimeout(() => {
      setIsChecking(false);
      if (!isOpen) {
        window.location.reload();
      }
    }, 400);
  };

  return (
    <div
      id="devtools-security-overlay"
      className="fixed inset-0 z-[999999] bg-[#070a12]/95 backdrop-blur-xl text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black overflow-y-auto"
    >
      <div className="max-w-lg w-full bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden my-auto">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/50 p-4 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20">
          <Terminal className="w-10 h-10 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 px-3.5 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Xavfsizlik Himoyasi
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Konsol (DevTools) Ochiq Qolgan!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Sayt xavfsizligi va adolatli reyting tizimi uchun brauzer dasturchilar paneli (Console / DevTools / Inspect) ochiq holatda saytdan foydalanish taqiqlangan.
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              Holat:
            </span>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Dasturchilar Paneli Ochiq
            </span>
          </div>
          <p className="text-xs text-amber-200/90 font-medium">
            Konsol panelini yopishingiz kutilmoqda{dots} Yopilishi bilan sayt avtomatik ochiladi.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
          <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-amber-400" /> Qanday yopish kerak?
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300 leading-relaxed font-sans text-[11.5px]">
            <li>
              Brauzerdagi <strong>F12</strong> tugmasini qayta bosing yoki ochilgan konsol oynasining <strong>[✕]</strong> (Yopish) tugmasini bosing.
            </li>
            <li>
              Agar konsol alohida yangi oynada ochilgan bo'lsa, o'sha oynani yoping.
            </li>
            <li>
              Klaviatura orqali <strong>Ctrl + Shift + I</strong> (Mac-da <strong>Cmd + Option + I</strong>) bosing.
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Tekshirilmoqda...' : 'Konsolni Yopdim (Qayta Tekshirish)'}</span>
          </button>
          <p className="text-[10px] text-slate-500">
            Yolnoma Anti-Cheat &amp; Data Integrity Protection Engine v2.6
          </p>
        </div>
      </div>
    </div>
  );
};
