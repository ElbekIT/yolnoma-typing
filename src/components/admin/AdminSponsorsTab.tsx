import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, Award, Calendar, AlertCircle, RefreshCw, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { SponsorItem } from '../../types';
import { rtdb } from '../../config/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { getAdminToken } from '../../utils/ownerAuth';
import { useAuth } from '../../context/AuthContext';

export const AdminSponsorsTab: React.FC = () => {
  const { user, profile } = useAuth();
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSponsors = async () => {
    try {
      const res = await fetch('/api/sponsors');
      const data = await res.json();
      if (data.success && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      }
    } catch (err) {
      console.error('Failed to load sponsors from server API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync with Server API and RTDB
  useEffect(() => {
    fetchSponsors();

    // Listen to local / window update events
    const handleSponsorUpdate = () => {
      fetchSponsors();
    };
    window.addEventListener('yolnoma_sponsors_updated', handleSponsorUpdate);
    window.addEventListener('storage', handleSponsorUpdate);

    // Also listen to RTDB if available
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
        }
      }, () => {
        // Fallback silently if RTDB rules forbid direct access
      });
    } catch {
      // Fallback silently
    }

    return () => {
      window.removeEventListener('yolnoma_sponsors_updated', handleSponsorUpdate);
      window.removeEventListener('storage', handleSponsorUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSponsorName.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', text: 'Iltimos, homiy nomini kiriting!' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const token = getAdminToken();
    const adminEmail = user?.email || profile?.email || 'yuldashivagavharoy@gmail.com';
    const adminDisplayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Admin (Yolnoma)';

    try {
      // 1. Save via Server Admin API
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
          addedBy: adminDisplayName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server xatoligi yuz berdi');
      }

      const savedSponsor: SponsorItem = data.sponsor || {
        id: `sp-${Date.now()}`,
        name: trimmed,
        addedBy: adminDisplayName,
        createdAt: Date.now()
      };

      // Instantly update state in Admin table
      setSponsors((prev) => [savedSponsor, ...prev.filter((s) => s.id !== savedSponsor.id)]);
      setNewSponsorName('');
      setFeedback({ type: 'success', text: `"${trimmed}" muvaffaqiyatli qo'shildi va "Hamkor va Homiy" sahifasida jonli joylandi!` });

      // Notify other components & tabs
      window.dispatchEvent(new CustomEvent('yolnoma_sponsors_updated'));
      try {
        localStorage.setItem('yolnoma_sponsors_sync', String(Date.now()));
      } catch {}

      // Optional background sync to RTDB
      try {
        await set(ref(rtdb, `sponsors/${savedSponsor.id}`), savedSponsor);
      } catch {
        // RTDB may be restricted; server is source of truth
      }

      setTimeout(() => setFeedback(null), 5000);
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

    const token = getAdminToken();
    const adminEmail = user?.email || profile?.email || 'yuldashivagavharoy@gmail.com';

    try {
      // 1. Delete via Server API
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

      // Immediately update state
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: 'success', text: `"${name}" ro'yxatdan o'chirildi.` });

      // Notify other components & tabs
      window.dispatchEvent(new CustomEvent('yolnoma_sponsors_updated'));
      try {
        localStorage.setItem('yolnoma_sponsors_sync', String(Date.now()));
      } catch {}

      // Optional RTDB cleanup
      try {
        await remove(ref(rtdb, `sponsors/${id}`));
      } catch {
        // Silently handled
      }

      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert('O\'chirishda xatolik: ' + (err?.message || err));
    }
  };

  const filteredSponsors = sponsors.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.addedBy && s.addedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            Platformaning barcha rasmiy homiylarini boshqarish. Bu yerdan kiritilgan homiylar darhol "Hamkor va Homiy" sahifasida barcha foydalanuvchilarga jonli aks etadi.
          </p>
        </div>

        <button
          onClick={fetchSponsors}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-color)]/20 text-xs font-bold text-[var(--text-color)] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
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
          Faqatgina homiy nomini (shaxs, brend, homiy tashkilot yoki kanal) kiritishingiz kifoya. Rasm talab qilinmaydi, tizim avtomatik rasmiy bezak bilan saytga joylaydi.
        </p>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleAddSponsor} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newSponsorName}
            onChange={(e) => setNewSponsorName(e.target.value)}
            placeholder="Homiy nomi (masalan: Yosh Avlod Kanali, IT Academy, Smart Solutions...)"
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
        <div className="p-4 sm:p-5 border-b border-[var(--sub-alt)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-sm sm:text-base text-[var(--text-color)]">
              Mavjud Homiylar Ro'yxati
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--sub-alt)] font-bold text-[var(--text-color)]">
              {sponsors.length}
            </span>
          </div>

          {/* Search filter */}
          {sponsors.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sub-color)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Homiylardan qidirish..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-[var(--text-color)] placeholder:text-[var(--sub-color)]/60 outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--sub-color)] flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Homiylar ro'yxati yuklanmoqda...</span>
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="p-12 text-center text-[var(--sub-color)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[var(--text-color)]">
              {searchQuery ? 'Qidiruv bo\'yicha homiy topilmadi' : 'Hali hech qanday homiy qo\'shilmagan'}
            </p>
            <p className="text-xs max-w-sm mx-auto">
              {searchQuery
                ? 'Qidiruv so\'zini o\'zgartirib ko\'ring'
                : 'Yuqoridagi formadan homiy nomini yozib "Homiy Qo\'shish" tugmasini bosing.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--sub-alt)]">
            {filteredSponsors.map((sponsor, index) => (
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
