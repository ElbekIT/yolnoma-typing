import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Award,
  ExternalLink,
  Globe,
  Heart,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Code2,
  Calendar,
  Cpu,
  UserCheck,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { SponsorItem } from '../../types';
import { rtdb } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

export const PartnersView: React.FC = () => {
  const { user, profile } = useAuth();
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    profile?.role === 'owner' ||
    (user?.email && user.email.toLowerCase().includes('yuldashivagavharoy'))
  );

  // Sync sponsors in realtime from Firebase RTDB with API fallback
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const sponsorsRef = ref(rtdb, 'sponsors');
      unsubscribe = onValue(sponsorsRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: SponsorItem[] = Object.keys(val).map((k) => ({
            id: k,
            name: val[k].name || 'Homiy',
            addedBy: val[k].addedBy || 'Admin',
            createdAt: val[k].createdAt || Date.now()
          })).sort((a, b) => b.createdAt - a.createdAt);
          setSponsors(list);
          setLoadingSponsors(false);
        } else {
          fetchFallbackSponsors();
        }
      }, (err) => {
        console.warn('Sponsors RTDB listener error:', err);
        fetchFallbackSponsors();
      });
    } catch (e) {
      fetchFallbackSponsors();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchFallbackSponsors = async () => {
    try {
      const res = await fetch('/api/sponsors');
      const data = await res.json();
      if (data.success && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      }
    } catch (err) {
      console.warn('Failed to load fallback sponsors:', err);
    } finally {
      setLoadingSponsors(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 px-2 sm:px-4 animate-in fade-in duration-300">
      {/* Header Banner - Compact & Refined */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 space-y-2.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rasmiy Hamkor va Homiyimiz</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Bizning <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Hamkor va Homiyimiz</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Yolnoma platformasining rivojlanishi, zamonaviy sun'iy intellekt texnologiyalari va yoshlarning IT hamda klaviaturada tez yozish ko'nikmalarini oshirishdagi rasmiy hamkori va homiysi.
          </p>
        </div>
      </div>

      {/* Main Partner & Sponsor Showcase Card */}
      <div className="bg-[var(--card-bg)] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left Column: Portrait Photo & Channels & Quick Action */}
          <div className="flex flex-col items-center text-center w-full lg:w-72 flex-shrink-0 space-y-4">
            {/* Photo Avatar with Crown & Golden Ring */}
            <div className="relative">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-slate-900 border-4 border-amber-500/80 shadow-2xl shadow-amber-500/20 group transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src="/shamsiddin_partner.jpg"
                  alt="Shamsiddin Kamoliddinov"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG if needed
                    e.currentTarget.src = '/yosh_avlod_logo.svg';
                  }}
                />
              </div>

              {/* Verified Crown Badge */}
              <div className="absolute -top-2.5 -right-2.5 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 p-2 rounded-2xl shadow-lg border-2 border-slate-900">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>

              {/* Status indicator */}
              <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-slate-950/90 border border-amber-500/60 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-md">
                HAMKOR VA HOMIY
              </div>
            </div>

            {/* Badges and Project Label */}
            <div className="space-y-1.5 w-full pt-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Yosh Avlod Kanali Asoschisi</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rasmiy Tasdiqlangan Hamkor</span>
              </div>
            </div>

            {/* Official Website Button */}
            <div className="w-full space-y-2 pt-1">
              <a
                href="https://yosh-avlod-kanali.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Hamkorimiz Saytiga O'tish</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://yosh-avlod-kanali.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[var(--sub-color)] hover:text-amber-400 transition-colors flex items-center justify-center gap-1 truncate px-2"
              >
                <Globe className="w-3 h-3 flex-shrink-0 text-amber-400" />
                <span className="truncate">yosh-avlod-kanali.vercel.app</span>
              </a>
            </div>
          </div>

          {/* Right Column: Information, Profession, Bio, and Expertise */}
          <div className="flex-1 space-y-4 text-left min-w-0">
            {/* Title & Role */}
            <div className="space-y-2 border-b border-[var(--sub-alt)] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" /> Mutaxassisligi:
                </span>
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  AI / ML muhandisi
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-color)] tracking-tight">
                Shamsiddin Kamoliddinov Aqliddin o'g'li
              </h2>

              {/* Education & Location details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--sub-color)] pt-1">
                <div className="flex items-center gap-2 bg-[var(--sub-alt)]/40 p-2.5 rounded-xl border border-[var(--sub-color)]/10">
                  <GraduationCap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Farg'ona Davlat Texnika Universiteti (TATF)</span>
                </div>
                <div className="flex items-center gap-2 bg-[var(--sub-alt)]/40 p-2.5 rounded-xl border border-[var(--sub-color)]/10">
                  <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Sun'iy intellekt yo'nalishi 4-bosqich</span>
                </div>
              </div>
            </div>

            {/* Biography & Presentation Text */}
            <div className="space-y-3 bg-[var(--sub-alt)]/25 border border-[var(--sub-color)]/15 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>Hamkor va Homiy Haqida Ma'lumot</span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed font-normal">
                Men Shamsiddin Kamoliddinov Aqliddin o'g'li 2005-yil 15-fevral Farg'ona viloyati Toshloq tumanida tavallud topganman. Hozirda Farg'ona Davlat Texnika Universiteti Axborot texnologiyalari va telekommunikatsiyalar fakulteti Sun'iy intellekt yo'nalishi 4-bosqich talabasiman.
              </p>

              <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed font-normal">
                Dasturlash bo'yicha 7 yillik tajribaga egaman. Kiberxavfsizlik, AI menejmenti va Computer Science sohalarida ish olib boraman. Sun'iy intellekt bo'yicha ko'plab loyihalar va tadqiqotlar muallifiman. Kiberxavfsizlik va IT bo'yicha YouTube va Telegram tarmoqlarida shaxsiy blog yuritib, yosh avlodni zamonaviy texnologiyalar bilan tanishtirib kelaman.
              </p>
            </div>

            {/* Competencies Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> 7 yillik tajriba
              </span>
              <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Kiberxavfsizlik
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Menejmenti
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Computer Science
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors Section (Homiylar Bo'limi) */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--sub-alt)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                Loyiha Homiylari
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-black text-xs">
                {sponsors.length}
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)]">
              Yolnoma platformasini moddiy va ma'naviy qo'llab-quvvatlayotgan rasmiy homiylarimiz
            </p>
          </div>

          {isAdmin && (
            <div className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin: Homiylarni "Admin Panel" orqali boshqarishingiz mumkin</span>
            </div>
          )}
        </div>

        {/* Sponsors Display Grid */}
        {loadingSponsors ? (
          <div className="p-8 text-center text-xs text-[var(--sub-color)]">
            Homiylar ro'yxati yuklanmoqda...
          </div>
        ) : sponsors.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--sub-alt)]/20 border border-dashed border-[var(--sub-color)]/20 text-center space-y-2">
            <Heart className="w-8 h-8 text-amber-400/40 mx-auto" />
            <p className="text-sm font-bold text-[var(--text-color)]">Hozircha homiylar ro'yxati shakllanmoqda</p>
            <p className="text-xs text-[var(--sub-color)] max-w-md mx-auto">
              Loyihani qo'llab-quvvatlash istagidagi tashkilot va homiylar bilan doimo hamkorlikka tayyormiz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className="p-4 rounded-2xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)]/70 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Heart className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-[var(--text-color)] truncate">
                      {sponsor.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--sub-color)] mt-0.5">
                      <span className="text-amber-400/80 font-bold uppercase tracking-wider">Homiy</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(sponsor.createdAt).toLocaleDateString('uz-UZ', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-amber-400/60 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 flex-shrink-0">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
