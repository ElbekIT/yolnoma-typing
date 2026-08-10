import React from 'react';
import { Crown, Sparkles, Tv, UserCheck, ShieldCheck, Heart, Award, ExternalLink, Globe, Zap, Users } from 'lucide-react';

export const PartnersView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Rasmiy Bosh Hamkorlarimiz</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Bizning <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Bosh Hamkorimiz</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Yolnoma Typing platformasining rivojlanishi va yoshlarning IT hamda klaviaturada tez yozish ko'nikmalarini oshirishdagi rasmiy bosh homiysi va hamkori.
          </p>
        </div>
      </div>

      {/* Main Showcase Card for Yosh Avlod Kanali & SHAMSIDDIN */}
      <div className="bg-[var(--card-bg)] border-2 border-amber-500/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Logo & Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-black border-4 border-amber-500/80 p-3 shadow-2xl shadow-amber-500/30 flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/yosh_avlod_logo.svg"
                  alt="Yosh Avlod Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                />
              </div>
              <span className="absolute -top-3 -right-3 bg-amber-400 text-slate-950 p-2 rounded-full shadow-xl">
                <Crown className="w-6 h-6 fill-slate-950" />
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/50 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Bosh Homiy
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  Tasdiqlangan Hamkor
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-color)] flex items-center justify-center sm:justify-start gap-3">
                Yosh Avlod Kanali
                <Tv className="w-7 h-7 text-amber-400" />
              </h2>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-200 text-sm font-semibold flex items-center gap-3 justify-center sm:justify-start">
                <UserCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 text-xs block">Kanal Asoschisi, Direktori va Egasi:</span>
                  <strong className="text-amber-300 font-black text-lg sm:text-xl tracking-wide uppercase">
                    SHAMSIDDIN
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-[var(--text-color)]">Yosh Avlod</p>
              <p className="text-[11px] text-[var(--sub-color)] font-medium">Loyiha Bosh Kanali</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-amber-400">#1 Partner</p>
              <p className="text-[11px] text-[var(--sub-color)] font-medium">Tashkilotchi</p>
            </div>
          </div>
        </div>

        {/* Details & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[var(--sub-alt)]">
          <div className="p-5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-color)]/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Loyiha Maqsadi</span>
            </div>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Yosh Avlod kanali rahbari SHAMSIDDIN boshchiligida respublika bo'ylab yoshlarni kompyuter savodxonligi va klaviatura tezligini oshirishga yo'naltirilgan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-color)]/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Heart className="w-4 h-4" />
              <span>Qo'llab-Quvvatlash</span>
            </div>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Yolnoma platformasining barcha texnik, infratuzilma va sovrinli musobaqalari Yosh Avlod kanali tomonidan qo'llab-quvvatlanadi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--sub-alt)]/50 border border-[var(--sub-color)]/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Crown className="w-4 h-4" />
              <span>E'tirof</span>
            </div>
            <p className="text-xs text-[var(--sub-color)] leading-relaxed">
              Kanal va uning asoschisi SHAMSIDDIN ga loyihani doimiy rivojlantirishga qo'shgan hissasi uchun minnatdorchilik bildiramiz!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
