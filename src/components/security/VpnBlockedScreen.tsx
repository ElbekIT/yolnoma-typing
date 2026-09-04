import React from 'react';
import { ShieldAlert, Globe2, RefreshCw, AlertTriangle, ShieldCheck, PowerOff, Network } from 'lucide-react';

interface VpnBlockedScreenProps {
  detectedIp?: string;
  detectedReason?: string;
}

export const VpnBlockedScreen: React.FC<VpnBlockedScreenProps> = ({
  detectedIp = 'Aniqlangan IP',
  detectedReason = 'Anonimlashtiruvchi VPN yoki Proksi server'
}) => {
  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black relative overflow-hidden font-sans">
      {/* Background Cyber Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#152033_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none animate-pulse" />

      {/* Main Container */}
      <div className="max-w-lg w-full bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 backdrop-blur-xl relative z-10 space-y-6 text-center">
        {/* Top Warning Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>KIBER XAVFSIZLIK • VPN / PROKSI BLOKIROVKASI</span>
          </div>
        </div>

        {/* Big Icon */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-2 border-amber-500/50 p-4 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 relative">
          <Globe2 className="w-12 h-12" />
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-slate-900">
            <PowerOff className="w-4 h-4" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            VPN orqali kirish taqiqlangan!
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
            Siz VPN yoki Proksi server orqali saytga kira olmaysiz. Iltimos, VPN-ni oʻchirib, oʻz haqiqiy internet tarmogʻingiz orqali kiring.
          </p>
        </div>

        {/* Explanatory Guide Box */}
        <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-4 sm:p-5 text-left space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-amber-400" />
              Aniqlangan ulanish:
            </span>
            <span className="text-amber-400 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
              {detectedReason}
            </span>
          </div>

          <div className="space-y-2 text-slate-300 leading-relaxed">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              Nima uchun bu cheklov oʻrnatilgan?
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Yolnoma platformasida adolatli milliy reyting, botlar, DDoS/DRDoS hujumlari hamda hisob oʻgʻirlashlarining oldini olish maqsadida barcha anonim proksi va VPN tarmoqlariga kirish bloklangan.
            </p>
          </div>

          <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/20 space-y-1 text-[11px]">
            <span className="font-bold text-amber-300 block">Saytga kirish uchun:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Qurilmangizdagi VPN dasturini (1.1.1.1, Turbo VPN, Planet VPN va b.) oʻchiring.</li>
              <li>Brauzerdagi proksi kengaytmasini faolsizlantiring.</li>
              <li>Quyidagi tugma orqali sahifani yangilang.</li>
            </ol>
          </div>
        </div>

        {/* Reload Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>VPN-ni Oʻchirdim, Qayta Tekshirish</span>
        </button>
      </div>
    </div>
  );
};
