import React from 'react';
import { Wrench, RefreshCw, Clock, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface MaintenanceScreenProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  updatedAt?: number;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  title = "Saytda Katta Yangilanish Ketmoqda! 🛠️",
  message = "Hurmatli foydalanuvchilar, platformada muhim xavfsizlik yangilanishi va yangi qulayliklar oʻrnatilmoqda. Bir necha daqiqadan soʻng barcha xizmatlar toʻliq qayta ishga tushadi.",
  estimatedTime = "10-15 daqiqa"
}) => {
  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-black relative overflow-hidden font-sans">
      {/* Dynamic Cyber Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(#152033_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glass Card */}
      <div className="max-w-xl w-full bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl relative z-10 space-y-7 text-center">
        {/* Top Status Pill */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            <span>TEXNIK ISHLAR & YANGILANISH REJIMI</span>
          </div>
        </div>

        {/* Animated Cyber Icon */}
        <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-cyan-500/20 to-blue-950/40 border-2 border-cyan-500/50 p-5 text-cyan-400 flex items-center justify-center shadow-xl shadow-cyan-500/25 relative group">
          <Wrench className="w-12 h-12 sm:w-14 sm:h-14 animate-[spin_6s_linear_infinite]" />
          <Cpu className="w-6 h-6 text-cyan-300 absolute -top-1 -right-1 bg-slate-900 rounded-lg p-0.5 border border-cyan-500/40" />
        </div>

        {/* Title & Message from Admin */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>
          <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-cyan-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium text-left">
            <p className="whitespace-pre-line">{message}</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-2.5 text-left">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Kutilayotgan vaqt:</span>
              <span className="text-white font-bold">{estimatedTime}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-2.5 text-left">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Tizim holati:</span>
              <span className="text-emerald-400 font-bold">Auto-sinxronlashuv faol</span>
            </div>
          </div>
        </div>

        {/* Live Note */}
        <div className="p-3 bg-cyan-950/30 rounded-2xl border border-cyan-500/20 text-slate-300 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Sahifani yangilash shart emas. Yangilanish tugashi bilan sayt avtomatik ochiladi.</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Saytni Yangilash (Tekshirish)</span>
        </button>
      </div>
    </div>
  );
};
