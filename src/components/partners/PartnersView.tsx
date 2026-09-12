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
  CheckCircle2,
  ZoomIn,
  X,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  Bot,
  Send,
  MessageSquare,
  Clock,
  Copy,
  Check,
  Zap,
  CheckCircle
} from 'lucide-react';
import { SponsorItem } from '../../types';
import { rtdb } from '../../config/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { getAdminToken } from '../../utils/ownerAuth';

export const PartnersView: React.FC = () => {
  const { user, profile } = useAuth();
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isBotPhotoOpen, setIsBotPhotoOpen] = useState(false);
  const [copiedBotLink, setCopiedBotLink] = useState(false);

  // Admin Quick Add Sponsor State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickSponsorName, setQuickSponsorName] = useState('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCopyBotLink = () => {
    navigator.clipboard.writeText('https://t.me/autoreply_mbot');
    setCopiedBotLink(true);
    setTimeout(() => setCopiedBotLink(false), 2200);
  };

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    profile?.role === 'owner' ||
    (user?.email && user.email.toLowerCase().includes('yuldashivagavharoy'))
  );

  const fetchSponsorsList = async () => {
    try {
      const res = await fetch('/api/sponsors');
      const data = await res.json();
      if (data.success && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      }
    } catch (err) {
      console.warn('Failed to load sponsors list:', err);
    } finally {
      setLoadingSponsors(false);
    }
  };

  // Sync sponsors in realtime from Server API + Event dispatchers + RTDB
  useEffect(() => {
    fetchSponsorsList();

    const handleUpdate = () => {
      fetchSponsorsList();
    };

    window.addEventListener('yolnoma_sponsors_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Auto-poll every 12 seconds to keep in sync
    const interval = setInterval(fetchSponsorsList, 12000);

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
        }
      }, () => {
        // Silently fallback to server API
      });
    } catch {
      // Silently fallback
    }

    return () => {
      window.removeEventListener('yolnoma_sponsors_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickSponsorName.trim();
    if (!trimmed) {
      setQuickFeedback({ type: 'error', text: 'Homiy nomini kiriting!' });
      return;
    }

    setIsQuickSubmitting(true);
    setQuickFeedback(null);

    const token = getAdminToken();
    const adminEmail = user?.email || profile?.email || 'yuldashivagavharoy@gmail.com';
    const adminName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Admin (Yolnoma)';

    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'active_admin_session'}`,
          'x-user-email': adminEmail
        },
        credentials: 'include',
        body: JSON.stringify({
          name: trimmed,
          userEmail: adminEmail,
          addedBy: adminName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server xatoligi yuz berdi');
      }

      const newSponsor: SponsorItem = data.sponsor || {
        id: `sp-${Date.now()}`,
        name: trimmed,
        addedBy: adminName,
        createdAt: Date.now()
      };

      setSponsors((prev) => [newSponsor, ...prev.filter((s) => s.id !== newSponsor.id)]);
      setQuickSponsorName('');
      setQuickFeedback({ type: 'success', text: `"${trimmed}" muvaffaqiyatli loyiha homiylariga qo'shildi!` });

      // Notify other tabs and components
      window.dispatchEvent(new CustomEvent('yolnoma_sponsors_updated'));
      try {
        localStorage.setItem('yolnoma_sponsors_sync', String(Date.now()));
      } catch {}

      // Background RTDB save if allowed
      try {
        await set(ref(rtdb, `sponsors/${newSponsor.id}`), newSponsor);
      } catch {}

      setTimeout(() => {
        setQuickFeedback(null);
        setIsQuickAddOpen(false);
      }, 2500);
    } catch (err: any) {
      setQuickFeedback({ type: 'error', text: 'Xatolik: ' + (err?.message || err) });
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const handleQuickDelete = async (id: string, name: string) => {
    if (!window.confirm(`Haqiqatdan ham "${name}" homiysini o'chirmoqchimisiz?`)) {
      return;
    }

    const token = getAdminToken();
    const adminEmail = user?.email || profile?.email || 'yuldashivagavharoy@gmail.com';

    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'active_admin_session'}`,
          'x-user-email': adminEmail
        },
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'O\'chirishda xatolik yuz berdi');
      }

      setSponsors((prev) => prev.filter((s) => s.id !== id));
      window.dispatchEvent(new CustomEvent('yolnoma_sponsors_updated'));
      try {
        localStorage.setItem('yolnoma_sponsors_sync', String(Date.now()));
      } catch {}

      try {
        await remove(ref(rtdb, `sponsors/${id}`));
      } catch {}
    } catch (err: any) {
      alert('Xatolik: ' + (err?.message || err));
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
            <span>Rasmiy Hamkor va Homiylarimiz</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Bizning <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Hamkor va Homiylarimiz</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Yolnoma platformasining rivojlanishi, zamonaviy sun'iy intellekt texnologiyalari, IT ekotizimi va foydalanuvchilarimiz uchun foydali xizmatlarni taqdim etuvchi rasmiy hamkor va homiylarimiz.
          </p>
        </div>
      </div>

      {/* Main Partner & Sponsor Showcase Card with Photo & Executive Badges */}
      <div className="bg-[var(--card-bg)] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xl relative overflow-hidden space-y-6">
        {/* Subtle decorative glow elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Section with Photo & Core Partner Information */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 border-b border-amber-500/25 pb-6">
          {/* Partner Photo Card */}
          <div className="flex flex-col items-center flex-shrink-0 space-y-3">
            <div className="relative group">
              {/* Glowing ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 rounded-3xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
              
              {/* Photo Container */}
              <div
                onClick={() => setIsPhotoOpen(true)}
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-500/80 shadow-2xl cursor-pointer"
                title="Rasmni kattalashtirib ko'rish"
              >
                <img
                  src="/photo_2024-10-04_23-21-18.jpg"
                  alt="Shamsiddin Kamoliddinov - Hamkor va Homiy"
                  className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to partner photo path
                    const target = e.currentTarget;
                    if (target.src.indexOf('/shamsiddin_partner.jpg') === -1) {
                      target.src = '/shamsiddin_partner.jpg';
                    }
                  }}
                />

                {/* Hover overlay with Zoom Icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-[2px]">
                  <ZoomIn className="w-4 h-4 text-amber-300" />
                  <span>Kattalashtirish</span>
                </div>
              </div>

              {/* VIP Crown Badge on Top Right */}
              <div className="absolute -top-2.5 -right-2.5 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 p-2 rounded-2xl shadow-lg border-2 border-slate-950 flex items-center justify-center">
                <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
              </div>

              {/* Status Pill on Bottom */}
              <div className="absolute -bottom-2.5 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-slate-950/95 border border-amber-500/70 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-md">
                HAMKOR VA HOMIY
              </div>
            </div>

            {/* Quick Status Sub-label */}
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-bold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rasmiy Tasdiqlangan Hamkor</span>
            </div>
          </div>

          {/* Partner Details & Actions */}
          <div className="flex-1 space-y-4 text-center lg:text-left min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>Bosh Hamkor va Homiy</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Yosh Avlod Kanali Asoschisi</span>
              </span>
            </div>

            {/* Partner Name */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-color)] tracking-tight">
                Shamsiddin Kamoliddinov Aqliddin o'g'li
              </h2>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
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

            {/* Official Website Button & Link */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="https://yosh-avlod-kanali.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Hamkorimiz Saytiga O'tish</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://yosh-avlod-kanali.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--sub-color)] hover:text-amber-400 transition-colors flex items-center gap-1.5 px-2 py-1"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>yosh-avlod-kanali.vercel.app</span>
              </a>
            </div>
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

      {/* NEW PARTNER & BOT SHOWCASE: Auto Reply & Auto Clock Bot */}
      <div className="bg-[var(--card-bg)] border-2 border-cyan-500/40 hover:border-cyan-400/60 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xl relative overflow-hidden space-y-6 transition-colors">
        {/* Subtle Neon Glows */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Section with Photo & Info */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 border-b border-cyan-500/25 pb-6">
          {/* Bot Logo Card */}
          <div className="flex flex-col items-center flex-shrink-0 space-y-3">
            <div className="relative group">
              {/* Glowing ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse" />

              {/* Photo Container */}
              <div
                onClick={() => setIsBotPhotoOpen(true)}
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden bg-slate-950 border-2 border-cyan-400 shadow-2xl cursor-pointer"
                title="Logoni kattalashtirib ko'rish"
              >
                <img
                  src="/autoreply_logo.jpg"
                  alt="Auto Reply & Auto Clock - Telegram Bot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.indexOf('/photo_2024-10-04_23-21-18.jpg') === -1) {
                      target.src = '/photo_2024-10-04_23-21-18.jpg';
                    }
                  }}
                />

                {/* Hover overlay with Zoom Icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-[2px]">
                  <ZoomIn className="w-4 h-4 text-cyan-300" />
                  <span>Kattalashtirish</span>
                </div>
              </div>

              {/* Bot Badge on Top Right */}
              <div className="absolute -top-2.5 -right-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white p-2 rounded-2xl shadow-lg border-2 border-slate-950 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>

              {/* Status Pill on Bottom */}
              <div className="absolute -bottom-2.5 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-slate-950/95 border border-cyan-400/80 text-cyan-300 text-[10px] font-black uppercase tracking-wider shadow-md">
                HAMKOR BOT
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400 font-bold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rasmiy Tasdiqlangan Bot</span>
            </div>
          </div>

          {/* Bot Details & Actions */}
          <div className="flex-1 space-y-4 text-center lg:text-left min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-500/20">
                <Bot className="w-3.5 h-3.5 text-white" />
                <span>Rasmiy Hamkor Bot</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto Clock & Bio</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>24/7 Doimiy Aktiv</span>
              </span>
            </div>

            {/* Title & Slogan */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-color)] tracking-tight flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span>🤖 Auto Reply & Auto Clock</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                Telegram profilingiz endi to'liq avtomatlashadi!
              </p>
            </div>

            {/* Lead Description Text */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
              <span className="font-bold text-cyan-400 mr-1.5">✉️</span>
              Shaxsiy Telegram akkauntingiz uchun eng mukammal yordamchi. Siz band bo‘lsangiz, uxlayotgan bo‘lsangiz, darsda yoki telefondan uzoqda bo‘lsangiz ham — profilingiz har doim aktiv va chiroyli ko'rinishda bo'ladi!
            </div>

            {/* Buttons: Open in Telegram & Copy Link */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <a
                href="https://t.me/autoreply_mbot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>@autoreply_mbot ga o'tish</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleCopyBotLink}
                className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] border border-cyan-500/30 text-xs font-black text-[var(--text-color)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                title="Bot havolasini nusxalash"
              >
                {copiedBotLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Havola nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Havolani nusxalash</span>
                  </>
                )}
              </button>

              <a
                href="https://t.me/autoreply_mbot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--sub-color)] hover:text-cyan-400 transition-colors flex items-center gap-1.5 px-2 py-1"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>t.me/autoreply_mbot</span>
              </a>
            </div>
          </div>
        </div>

        {/* Highlighted Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Free Tier Notice Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 flex-shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">Bepul Tarif Imkoniyati</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black">Free</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-color)] leading-relaxed">
                Bepul tarifda faqat <span className="text-amber-300 font-bold underline decoration-amber-500/40">xabarni o'zgartirish</span> (avto-javob matnini o'zingiz xohlagandek sozlash) imkoniyati mavjud.
              </p>
            </div>
          </div>

          {/* Auto Clock & Full Info Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/30 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 flex-shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">Auto Clock & To'liq Ma'lumot</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-black">Smart</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-color)] leading-relaxed">
                Profilingizda jonli vaqt soatini aks ettirish hamda qolgan barcha qo'shimcha imkoniyatlar va tariflar haqida <span className="text-cyan-300 font-bold">botning o'zida to'liq ma'lumot olishingiz mumkin!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Banner to Enter Bot */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b1b30] to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Telegram hisobingizni hoziroq avtomatlashtiring
              </p>
              <p className="text-[11px] text-slate-400">
                Botga kiring va <code className="text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">/start</code> tugmasini bosing
              </p>
            </div>
          </div>

          <a
            href="https://t.me/autoreply_mbot"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <span>Botga kirish</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
                {sponsors.length} ta
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)]">
              Yolnoma platformasini moddiy va ma'naviy qo'llab-quvvatlayotgan rasmiy homiylarimiz
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={fetchSponsorsList}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-xs font-bold text-[var(--text-color)] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Yangilash"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yangilash</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsQuickAddOpen(!isQuickAddOpen);
                  setQuickFeedback(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isQuickAddOpen ? 'Yopish' : "Homiy Qo'shish"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Form for Admin */}
        {isAdmin && isQuickAddOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border-2 border-amber-500/30 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Tezkor Homiy Qo'shish (Admin)</span>
              </div>
              <span className="text-[11px] text-[var(--sub-color)]">
                Admin paneldan yoki shu yerdan kiritishingiz mumkin
              </span>
            </div>

            {quickFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  quickFeedback.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {quickFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{quickFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={quickSponsorName}
                onChange={(e) => setQuickSponsorName(e.target.value)}
                placeholder="Homiy nomi (masalan: Najot Ta'lim, Alisher Usmonov, TechCorp...)"
                className="flex-1 bg-[var(--bg-color)] border border-[var(--sub-alt)] focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text-color)] placeholder:text-[var(--sub-color)]/60 outline-none transition-colors"
                disabled={isQuickSubmitting}
                autoFocus
              />
              <button
                type="submit"
                disabled={isQuickSubmitting || !quickSponsorName.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isQuickSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Qo'shilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Qo'shish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Sponsors Display Grid */}
        {loadingSponsors ? (
          <div className="p-8 text-center text-xs text-[var(--sub-color)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Homiylar ro'yxati yuklanmoqda...</span>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--sub-alt)]/20 border border-dashed border-[var(--sub-color)]/20 text-center space-y-2">
            <Heart className="w-8 h-8 text-amber-400/40 mx-auto" />
            <p className="text-sm font-bold text-[var(--text-color)]">Hozircha homiylar ro'yxati shakllanmoqda</p>
            <p className="text-xs text-[var(--sub-color)] max-w-md mx-auto">
              Loyihani qo'llab-quvvatlash istagidagi tashkilot va homiylar bilan doimo hamkorlikka tayyormiz.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Birinchi homiyni qo'shish
              </button>
            )}
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

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono font-bold text-amber-400/60 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">
                    #{index + 1}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleQuickDelete(sponsor.id, sponsor.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                      title="Homiyni o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* High-Resolution Photo Lightbox Modal */}
      {isPhotoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsPhotoOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-4 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPhotoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer z-10"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Preview */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border border-amber-500/30">
              <img
                src="/photo_2024-10-04_23-21-18.jpg"
                alt="Shamsiddin Kamoliddinov - Bosh Hamkor va Homiy"
                className="w-full h-full object-cover object-top filter grayscale contrast-110"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.indexOf('/shamsiddin_partner.jpg') === -1) {
                    target.src = '/shamsiddin_partner.jpg';
                  }
                }}
              />
            </div>

            {/* Modal Caption */}
            <div className="text-center space-y-1 pb-1">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Shamsiddin Kamoliddinov
                </h3>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">
                AI / ML muhandisi • Yolnoma Bosh Hamkori va Homiysi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bot Logo High-Resolution Lightbox Modal */}
      {isBotPhotoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsBotPhotoOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-950 border-2 border-cyan-400/80 rounded-3xl p-4 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsBotPhotoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer z-10"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Preview */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border border-cyan-500/30">
              <img
                src="/autoreply_logo.jpg"
                alt="Auto Reply & Auto Clock - Telegram Bot"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Caption */}
            <div className="text-center space-y-1 pb-1">
              <div className="flex items-center justify-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  🤖 Auto Reply & Auto Clock
                </h3>
              </div>
              <p className="text-xs text-cyan-300/90 font-medium">
                Telegram profilingiz uchun eng mukammal avtomatlashtirish boti (@autoreply_mbot)
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href="https://t.me/autoreply_mbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegramda ochish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
