import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, Sparkles, ShieldCheck, Award, Calendar, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SponsorItem } from '../../types';
import { rtdb } from '../../config/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { getAdminToken } from '../../utils/ownerAuth';

export const AdminSponsorsTab: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync with Firebase RTDB + Server API
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const sponsorsRef = ref(rtdb, 'sponsors');
      unsubscribe = onValue(sponsorsRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const items: SponsorItem[] = Object.keys(val).map((k) => ({
            id: k,
            name: val[k].name || 'Homiy',
            addedBy: val[k].addedBy || 'Admin',
            createdAt: val[k].createdAt || Date.now()
          })).sort((a, b) => b.createdAt - a.createdAt);
          setSponsors(items);
          setLoading(false);
        } else {
          // Fetch from server API fallback
          fetchFallback();
        }
      }, (err) => {
        console.warn('RTDB sponsors listener error:', err);
        fetchFallback();
      });
    } catch (e) {
      fetchFallback();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchFallback = async () => {
    try {
      const res = await fetch('/api/sponsors');
      const data = await res.json();
      if (data.success && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      }
    } catch (err) {
      console.error('Failed to load sponsors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSponsorName.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', text: 'Iltimos, homiy nomini kiriting!' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const sponsorId = `sp-${Date.now()}`;
    const newSponsor: SponsorItem = {
      id: sponsorId,
      name: trimmed,
      addedBy: 'Boshqaruv Administratsiyasi',
      createdAt: Date.now()
    };

    try {
      // 1. Save to Firebase RTDB
      try {
        await set(ref(rtdb, `sponsors/${sponsorId}`), newSponsor);
      } catch (rtdbErr) {
        console.warn('Could not write directly to RTDB:', rtdbErr);
      }

      // 2. Save via Server Admin API
      const token = getAdminToken();
      await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed })
      });

      setNewSponsorName('');
      setFeedback({ type: 'success', text: `"${trimmed}" muvaffaqiyatli homiylar safiga qo'shildi!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Homiy qo\'shishda xatolik: ' + (err?.message || err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (id: string, name: string) => {
    if (!window.confirm(`Haqiqatdan ham "${name}" homiysini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      // 1. Delete from Firebase RTDB
      try {
        await remove(ref(rtdb, `sponsors/${id}`));
      } catch (rtdbErr) {
        console.warn('RTDB delete error:', rtdbErr);
      }

      // 2. Delete via Server API
      const token = getAdminToken();
      await fetch(`/api/admin/sponsors/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      setSponsors((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: 'success', text: `"${name}" ro'yxatdan o'chirildi.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert('O\'chirishda xatolik: ' + (err?.message || err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Heart className="w-5 h-5 fill-amber-400/20" />
            </div>
            <h2 className="text-xl font-black text-[var(--text-color)]">Homiylar Boshqaruvi</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {sponsors.length} ta homiy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--sub-color)]">
            Platformaning barcha rasmiy homiylarini boshqarish. Bu yerdan kiritilgan homiylar darhol "Hamkor va Homiy" sahifasida barcha foydalanuvchilarga ko'rinadi.
          </p>
        </div>

        <button
          onClick={fetchFallback}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-xs font-bold text-[var(--text-color)] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Yangilash
        </button>
      </div>

      {/* Add New Sponsor Form */}
      <div className="bg-[var(--card-bg)] border-2 border-amber-500/40 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
          <Plus className="w-5 h-5" />
          <span>Yangi Homiy Qo'shish</span>
        </div>

        <p className="text-xs text-[var(--sub-color)]">
          Faqatgina homiy nomini (shaxs, brend yoki kompaniya) kiritishingiz kifoya. Rasm talab qilinmaydi.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleAddSponsor} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newSponsorName}
            onChange={(e) => setNewSponsorName(e.target.value)}
            placeholder="Homiy nomi (masalan: IT Academy, Alisher Usmonov, Smart Solutions...)"
            className="flex-1 bg-[var(--bg-color)] border border-[var(--sub-alt)] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-[var(--text-color)] placeholder:text-[var(--sub-color)]/60 outline-none transition-colors"
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={submitting || !newSponsorName.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Qo'shilmoqda...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Homiy Qo'shish</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sponsors List Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl overflow-hidden shadow-md">
        <div className="p-4 sm:p-5 border-b border-[var(--sub-alt)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-sm sm:text-base text-[var(--text-color)]">
              Mavjud Homiylar Ro'yxati
            </h3>
          </div>
          <span className="text-xs text-[var(--sub-color)]">
            Jami: {sponsors.length} ta
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--sub-color)] flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Homiylar ro'yxati yuklanmoqda...</span>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="p-12 text-center text-[var(--sub-color)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[var(--text-color)]">Hali hech qanday homiy qo'shilmagan</p>
            <p className="text-xs max-w-sm mx-auto">
              Yuqoridagi formadan homiy nomini yozib "Homiy Qo'shish" tugmasini bosing.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--sub-alt)]">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[var(--sub-alt)]/30 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 font-black text-sm">
                    #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-black text-[var(--text-color)] truncate flex items-center gap-2">
                      {sponsor.name}
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Homiy
                      </span>
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--sub-color)] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(sponsor.createdAt).toLocaleDateString('uz-UZ', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>Qo'shdi: {sponsor.addedBy || 'Admin'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer flex-shrink-0"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
