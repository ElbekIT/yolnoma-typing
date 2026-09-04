import React from 'react';
import { ShieldAlert, AlertOctagon, RefreshCw, Mail, Terminal, Lock, Flame } from 'lucide-react';

interface IpBlockedScreenProps {
  ip?: string;
  reason?: string;
  bannedAt?: number;
  unbanAt?: number;
  attackType?: string;
}

export const IpBlockedScreen: React.FC<IpBlockedScreenProps> = ({
  ip = 'Aniqlanmoqda...',
  reason = "Saytga ruxsatsiz noqonuniy so'rovlar (DDoS, DRDoS hujumi yoki xavfli skanerlash) yuborilganligi aniqlandi.",
  bannedAt = Date.now(),
  unbanAt,
  attackType = 'DDoS / DRDoS Hujumi'
}) => {
  const formattedDate = new Date(bannedAt).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const remainingMinutes = unbanAt
    ? Math.max(1, Math.round((unbanAt - Date.now()) / 60000))
    : null;

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e112a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 blur-[130px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-800/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Armor Card */}
      <div className="max-w-xl w-full bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/50 backdrop-blur-xl relative z-10 space-y-6 text-center">
        {/* Top Warning Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
            <AlertOctagon className="w-4 h-4" />
            <span>KIBER XAVFSIZLIK FILTRI • IP CHEKLANDI</span>
          </div>
        </div>

        {/* Pulsing Shield Icon */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-b from-rose-500/25 to-rose-950/40 border-2 border-rose-500/50 p-4 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-500/25 relative">
          <ShieldAlert className="w-12 h-12 animate-bounce" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        {/* Titles */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sizning IP Manzilingiz Bloklandi!
          </h1>
          <p className="text-xs sm:text-sm text-rose-300/90 leading-relaxed font-medium">
            Ushbu IP manzildan Yolnoma platformasiga ruxsatsiz noqonuniy soʻrovlar yoki destruktiv tarmoq harakatlari (DDoS, DRDoS, HTTP Range Bomb yoki skanerlash) qayd etilganligi sababli kirish butunlay toʻxtatildi.
          </p>
        </div>

        {/* Security Details Box */}
        <div className="bg-black/60 border border-rose-500/30 rounded-2xl p-4 sm:p-5 text-left space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              Bloklangan IP:
            </span>
            <span className="text-rose-400 font-black text-sm bg-rose-500/15 px-2.5 py-0.5 rounded border border-rose-500/30">
              {ip}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400">Qoidabuzarlik turi:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              {attackType}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400">Qayd etilgan vaqt:</span>
            <span className="text-slate-300">{formattedDate}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Bloklanish sababi:</span>
            <p className="text-rose-300 font-sans font-medium text-xs leading-relaxed bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20">
              {reason}
            </p>
          </div>

          {remainingMinutes && (
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Avtomatik blokdan chiqish:</span>
              <span className="text-white font-bold">{remainingMinutes} daqiqadan soʻng</span>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3 text-left">
          <Mail className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px] leading-relaxed">
            <p className="text-slate-200 font-medium">
              Agar siz ushbu IP orqali xatolik sababli cheklovga uchragan boʻlsangiz yoki tarmoq administratori boʻlsangiz, blokdan chiqarish uchun murojaat qiling:
            </p>
            <p className="font-mono text-rose-400 font-bold">
              support@yolnoma.uz <span className="text-slate-500 font-normal">yoki</span> @elbekdesign_va_webdasturchi_uz
            </p>
          </div>
        </div>

        {/* Reload Check Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Holatni Qayta Tekshirish (Reload)</span>
        </button>
      </div>
    </div>
  );
};
