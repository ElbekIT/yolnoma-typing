import React, { useEffect, useState } from 'react';
import { Swords, Check, X, Shield, Zap, Flame, Crown } from 'lucide-react';

export interface BattleInviteData {
  inviteId: string;
  roomId: string;
  inviterUid: string;
  inviterName: string;
  inviterAvatar?: string;
  inviterWpm?: number;
  timestamp: number;
}

interface PubgInviteModalProps {
  invite: BattleInviteData | null;
  onAccept: (invite: BattleInviteData) => void;
  onDecline: (invite: BattleInviteData) => void;
}

export const PubgInviteModal: React.FC<PubgInviteModalProps> = ({ invite, onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    if (!invite) return;
    setTimeLeft(15);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(invite);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [invite, onDecline]);

  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* PUBG Mobile Style Card */}
      <div className="relative max-w-md w-full bg-[#0c1220] border-2 border-cyan-500/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden text-white space-y-5">
        {/* Glowing Top Cyber Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-cyan-400 to-rose-500 animate-pulse" />

        {/* PUBG Lobby Badge Title Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Swords className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider text-amber-400 font-mono uppercase flex items-center gap-1.5">
                BATTLE TAKLIFI <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">1v1 DUEL</span>
              </h2>
              <p className="text-[11px] text-slate-400">Yolnoma Arena Lobby Chaqirig'i</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-xl border border-cyan-800">
              ⏱️ {timeLeft}s
            </span>
          </div>
        </div>

        {/* Inviter Info Card */}
        <div className="bg-gradient-to-br from-slate-900 to-[#131d33] border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-inner">
          <div className="relative">
            <img
              src={invite.inviterAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${invite.inviterName}`}
              alt={invite.inviterName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 p-0.5 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px]">
              🟢
            </span>
          </div>

          <div className="flex-1 overflow-hidden space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-white truncate">{invite.inviterName}</h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                PRO ARENA
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Shaxsiy Rekord: <span className="text-amber-400 font-mono font-bold">{invite.inviterWpm || 85} WPM</span>
            </p>
            <p className="text-[11px] text-slate-400 italic">"Siz bilan tezkora yozish duelini o'ynamoqchi!"</p>
          </div>
        </div>

        {/* PUBG Action Buttons: HA / YO'Q */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Decline Button (YO'Q) */}
          <button
            onClick={() => onDecline(invite)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border-2 border-rose-500/40 font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md"
          >
            <X className="w-4 h-4" />
            <span>RAD ETISH (Yo'q)</span>
          </button>

          {/* Accept Button (HA) */}
          <button
            onClick={() => onAccept(invite)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 border border-emerald-400"
          >
            <Check className="w-4 h-4" />
            <span>QABUL QILISH (Ha)</span>
          </button>
        </div>

        {/* Timer Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
