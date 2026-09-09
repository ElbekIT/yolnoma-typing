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

      {/* Main Partner & Sponsor Showcase Card (Pure Typographic & Badges - No Photo) */}
      <div className="bg-[var(--card-bg)] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        {/* Subtle decorative glow elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Section with Status Badges & Quick Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-amber-500/25 pb-6">
          <div className="space-y-2.5">
            {/* Status & Project Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>Bosh Hamkor va Homiy</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Yosh Avlod Kanali Asoschisi</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rasmiy Tasdiqlangan</span>
              </span>
            </div>

            {/* Partner's Full Name */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-color)] tracking-tight">
              Shamsiddin Kamoliddinov Aqliddin o'g'li
            </h2>

            {/* Primary Specialization Label */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400/90">
                Mutaxassisligi:
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-lg">
                AI / ML muhandisi
              </span>
              <span className="text-xs text-[var(--sub-color)] font-medium">
                • 2005-yil 15-fevral, Farg'ona viloyati Toshloq tumani
              </span>
            </div>
          </div>

          {/* Official Website Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 flex-shrink-0">
            <a
              href="https://yosh-avlod-kanali.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Hamkorimiz Saytiga O'tish</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="https://yosh-avlod-kanali.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[var(--sub-color)] hover:text-amber-400 transition-colors flex items-center justify-center lg:justify-end gap-1 px-1"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>yosh-avlod-kanali.vercel.app</span>
            </a>
          </div>
        </div>

        {/* Education & Academic Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/35 border border-[var(--sub-color)]/15 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Oliy Ta'lim Muassasasi</p>
              <p className="text-sm font-bold text-[var(--text-color)]">
                Farg'ona Davlat Texnika Universiteti (TATF)
              </p>
              <p className="text-xs text-[var(--sub-color)]">
                Axborot texnologiyalari va telekommunikatsiyalar fakulteti
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/35 border border-[var(--sub-color)]/15 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0 mt-0.5">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Yo'nalish & Bosqich</p>
              <p className="text-sm font-bold text-[var(--text-color)]">
                Sun'iy intellekt (Artificial Intelligence) yo'nalishi
              </p>
              <p className="text-xs text-[var(--sub-color)]">
                4-bosqich bitiruvchi talabasi
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Bio & About Text */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[var(--sub-alt)]/40 to-[var(--sub-alt)]/20 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Hamkor va Homiy Haqida Ma'lumot</span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
            Men Shamsiddin Kamoliddinov Aqliddin o'g'li 2005-yil 15-fevral Farg'ona viloyati Toshloq tumanida tavallud topganman. Hozirda Farg'ona Davlat Texnika Universiteti Axborot texnologiyalari va telekommunikatsiyalar fakulteti Sun'iy intellekt yo'nalishi 4-bosqich talabasiman.
          </p>

          <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
            Dasturlash bo'yicha 7 yillik tajribaga egaman. Kiberxavfsizlik, AI menejmenti va Computer Science sohalarida ish olib boraman. Sun'iy intellekt bo'yicha ko'plab loyihalar va tadqiqotlar muallifiman. Kiberxavfsizlik va IT bo'yicha YouTube va Telegram tarmoqlarida shaxsiy blog yuritib, yosh avlodni zamonaviy texnologiyalar bilan tanishtirib kelaman.
          </p>
        </div>

        {/* Competencies & Badges List */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" /> 7 yillik tajriba
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Kiberxavfsizlik
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> AI Menejmenti
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" /> Computer Science
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> IT Blog (YouTube & Telegram)
          </span>
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
