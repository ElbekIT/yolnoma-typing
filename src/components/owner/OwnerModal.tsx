import React from 'react';
import { X, Sparkles, Heart, Globe, Award, ShieldCheck, Mail, Send } from 'lucide-react';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerModal: React.FC<OwnerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-8 shadow-2xl text-[var(--text-color)] space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[var(--main-color)] to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-[var(--main-color)]/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Yolnoma Typing Platform</h2>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">O'zbekistonning #1 Tez Yozish Ekosistemasi</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-3 text-xs leading-relaxed text-[var(--text-color)]">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--main-color)]">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Loyiha Haqida</span>
          </div>
          <p>
            Yolnoma — klaviaturada o'n barmoqli tez yozish (touch typing) mahoratini oshirish, milliy va xalqaro tillarda (O'zbek, Ingliz, Rus, Arab va h.k.) adolatli onlayn reytinglarda bellashish uchun yaratilgan zamonaviy platforma.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-500">
            <Award className="w-4 h-4" />
            <span>Bosh Hamkor va Qo'llab-quvvatlovchi</span>
          </div>
          <p className="text-[var(--text-color)]">
            <strong>Yosh Avlod Kanali</strong> — Yoshlarni zamonaviy IT va texnologiyalar sari yetaklovchi media loyiha.
          </p>
          <p className="text-[var(--sub-color)] text-[11px]">
            Direktor: <strong className="text-amber-400">SHAMSIDDIN</strong>
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sub-alt)]">
            <span className="text-[var(--sub-color)] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--main-color)]" /> Bog'lanish Email
            </span>
            <span className="font-mono font-bold text-[var(--text-color)]">yuldashivagavharoy@gmail.com</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sub-alt)]">
            <span className="text-[var(--sub-color)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Anti-Cheat Versiyasi
            </span>
            <span className="font-mono font-bold text-emerald-500">v2.6 Secure Engine</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[var(--main-color)] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          Tushunarli / Yopish
        </button>
      </div>
    </div>
  );
};
