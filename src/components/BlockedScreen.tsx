import React from 'react';
import { ShieldAlert, LogOut, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BlockedScreenProps {
  reason?: string;
}

export const BlockedScreen: React.FC<BlockedScreenProps> = ({ reason }) => {
  const { user, profile, logout } = useAuth();
  const displayReason = reason || profile?.blockReason || 'Tizim xavfsizlik qoidalarini buzgani yoki taqiqlangan dasturlardan (auto-clicker/bot) foydalanilgani sababli.';

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/15 border border-rose-500/40 p-4 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Kirish Butunlay Cheklangan
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Siz Bloklangansiz va Qayta Kira Olmaysiz!
          </h1>
          <p className="text-xs text-rose-300 font-medium leading-relaxed">
            Akkountingiz qoidalarni buzgani uchun doimiy bloklandi. Saytdan foydalanish va yozish testlariga kirish ruxsati bekor qilingan.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-rose-500/20 rounded-2xl p-4 text-left space-y-2 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Bloklanish Sababi:
          </span>
          <p className="text-rose-300 font-bold leading-relaxed">{displayReason}</p>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 space-y-1 font-mono">
          <p>Foydalanuvchi: {profile?.displayName || user?.email}</p>
          <p className="truncate">UID: {user?.uid}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-center gap-2">
          <Mail className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-left text-[11px]">
            Murojaat va qayta tiklash bo'yicha email: <strong className="text-rose-400">yuldashivagavharoy@gmail.com</strong>
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Tizimdan Chiqish</span>
        </button>
      </div>
    </div>
  );
};
