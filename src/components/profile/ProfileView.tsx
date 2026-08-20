import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Globe,
  Calendar,
  Award,
  Zap,
  Target,
  Clock,
  Check,
  Shield,
  Trash2,
  AlertTriangle,
  Lock,
  X,
  ExternalLink,
  Users,
  CheckCircle2,
  RefreshCw,
  Search,
  Ban,
  Bell,
  Mail,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

interface ProfileViewProps {
  onOpenAuth?: () => void;
  onSavedHome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth, onSavedHome }) => {
  const {
    user,
    profile,
    loading,
    updateUserProfile,
    deleteAccount,
    addNotification,
    adminUpdateUser,
    notifications,
    markNotificationRead,
    clearNotifications
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'admin'>('profile');
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'global' | 'direct'>('all');
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [country, setCountry] = useState(profile?.country || '🇺🇿 Uzbekistan');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [bannerColor, setBannerColor] = useState(profile?.bannerColor || '#38bdf8');
  const [twitter, setTwitter] = useState(profile?.socialLinks?.twitter || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [website, setWebsite] = useState(profile?.socialLinks?.website || '');
  const [saving, setSaving] = useState(false);

  // Sync form inputs with profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || 'Yolnoma typing ishtirokchisi');
      setCountry(profile.country || '🇺🇿 Uzbekistan');
      setAvatarUrl(profile.avatarUrl || '');
      setBannerColor(profile.bannerColor || '#38bdf8');
      setTwitter(profile.socialLinks?.twitter || '');
      setGithub(profile.socialLinks?.github || '');
      setWebsite(profile.socialLinks?.website || '');
    }
  }, [profile]);

  // Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Admin Search
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminUsersList, setAdminUsersList] = useState<UserProfile[]>([]);

  if (loading && user) {
    return (
      <div className="w-full max-w-md mx-auto p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--main-color)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[var(--sub-color)]">Profil ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 my-8 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl text-center space-y-5 shadow-lg animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[var(--main-color)]/10 text-[var(--main-color)] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Diqqat! Ro'yhatdan o'tilmagan</h2>
          <p className="text-sm font-medium text-[var(--sub-color)] leading-relaxed max-w-md mx-auto">
            Oldin kirishni bosing, Google orqali ro'yhatdan o'ting, keyin bemalol profilingizga kira olasiz! Rahmat.
          </p>
        </div>

        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[var(--main-color)] text-white font-bold text-sm shadow-md hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Kirish / Google orqali ro'yhatdan o'tish</span>
          </button>
        )}
      </div>
    );
  }

  const changesLeft = profile.usernameChangesLeft ?? 2;

  const presetAvatars = [
    `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=yolnoma1`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=yolnoma2`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=cyber1`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=cyber2`,
    `https://api.dicebear.com/7.x/shapes/svg?seed=speed1`,
    `https://api.dicebear.com/7.x/shapes/svg?seed=speed2`
  ];

  const presetCountries = [
    '🇺🇿 Uzbekistan',
    '🇺🇸 United States',
    '🇬🇧 United Kingdom',
    '🇩🇪 Germany',
    '🇹🇷 Turkey',
    '🇰🇿 Kazakhstan',
    '🇰🇬 Kyrgyzstan',
    '🇹🇯 Tajikistan',
    '🇹🇲 Turkmenistan',
    '🇦🇿 Azerbaijan'
  ];

  const emojis = ['⚡', '🏆', '⌨️', '🚀', '💻', '🎮', '🔥', '💯'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !bio.trim()) {
      addNotification('Maydonlar to\'liq emas', 'Ismingiz va Bio ma\'lumotingizni kiritishingiz shart!', 'warning');
      return;
    }

    setSaving(true);

    const updates: Partial<UserProfile> = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      country,
      avatarUrl: avatarUrl || profile.avatarUrl,
      bannerColor,
      socialLinks: {
        twitter,
        github,
        website
      }
    };

    // Username change check
    const currentUsername = profile?.username || '';
    if (username.trim().toLowerCase() !== currentUsername.toLowerCase()) {
      if (changesLeft <= 0) {
        addNotification('Cannot Change Username', 'You have reached the maximum limit of 2 username changes.', 'warning');
        setSaving(false);
        return;
      }
      updates.username = username.trim().toLowerCase().replace(/\s+/g, '_');
      updates.usernameChangesLeft = Math.max(0, changesLeft - 1);
    }

    await updateUserProfile(updates);
    localStorage.setItem('yolnoma_auth_completed', 'true');
    setSaving(false);
    setIsEditing(false);
    addNotification('Profil Saqlandi!', 'Profilingiz muvaffaqiyatli saqlandi. Bosh sahifaga yo\'naltirildingiz.');

    if (onSavedHome) {
      onSavedHome();
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      setDeleting(false);
    }
  };

  const handleAdminResetUsernameChanges = async (targetUid: string) => {
    await adminUpdateUser(targetUid, { usernameChangesLeft: 2 });
  };

  const handleAdminToggleVerification = async (targetUser: UserProfile) => {
    await adminUpdateUser(targetUser.uid, { isVerified: !targetUser.isVerified });
  };

  const handleAdminToggleBan = async (targetUser: UserProfile) => {
    await adminUpdateUser(targetUser.uid, { isBanned: !targetUser.isBanned });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    if (notifFilter === 'global') return n.target === 'all';
    if (notifFilter === 'direct') return n.target !== 'all';
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Profile Tab Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--sub-alt)] pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[var(--main-color)] text-white shadow-md shadow-[var(--main-color)]/20'
                : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mening Profilim</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-[var(--main-color)] text-white shadow-md shadow-[var(--main-color)]/20'
                : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Habarnomalar</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {profile.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[var(--card-bg)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Boshqaruv</span>
            </button>
          )}
        </div>

        {activeTab === 'notifications' && notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-[var(--sub-color)] hover:text-rose-500 font-bold transition-colors cursor-pointer"
          >
            Hammasini o'qildi qilish
          </button>
        )}
      </div>

      {activeTab === 'notifications' && (
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--sub-alt)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--main-color)]/15 text-[var(--main-color)]">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-color)] tracking-tight">
                  Sizga Yuborilgan Habarnomalar
                </h2>
                <p className="text-xs text-[var(--sub-color)]">
                  Admin tomonidan yuborilgan eʼlonlar, maxsus xabarlar va tizim yangiliklari
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-rose-500/10 hover:text-rose-500 text-xs font-bold text-[var(--sub-color)] transition-all cursor-pointer"
              >
                Hammasini o'qildi qilish
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setNotifFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                notifFilter === 'all'
                  ? 'bg-[var(--main-color)] text-white shadow-sm'
                  : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              Barchasi ({notifications.length})
            </button>
            <button
              onClick={() => setNotifFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                notifFilter === 'unread'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              O'qilmaganlar ({notifications.filter((n) => !n.read).length})
            </button>
            <button
              onClick={() => setNotifFilter('global')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                notifFilter === 'global'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              🌐 Umumiy Eʼlonlar
            </button>
            <button
              onClick={() => setNotifFilter('direct')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                notifFilter === 'direct'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)]'
              }`}
            >
              👤 Shaxsiy Xabarlar
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--sub-color)] space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p>Hozircha hech qanday habarnoma topilmadi</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isUnread = !n.read;
                let icon = <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />;

                if (n.type === 'success') {
                  icon = <Check className="w-4 h-4 text-emerald-400 shrink-0" />;
                } else if (n.type === 'warning') {
                  icon = <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
                } else if (n.type === 'achievement' || n.type === 'level_up') {
                  icon = <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />;
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isUnread
                        ? 'bg-[var(--card-bg)] border-[var(--main-color)]/50 shadow-md ring-1 ring-[var(--main-color)]/20'
                        : 'bg-[var(--sub-alt)]/40 border-[var(--sub-alt)] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {icon}
                        <h4 className="font-extrabold text-sm text-[var(--text-color)] truncate">
                          {n.title}
                        </h4>
                        {n.target === 'all' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono">
                            Eʼlon
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono">
                            Shaxsiy
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        )}
                        <span className="text-[10px] text-[var(--sub-color)] font-mono">
                          {new Date(n.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-color)]/95 leading-relaxed whitespace-pre-wrap pl-6">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--sub-alt)] text-[11px] pl-6">
                      <span className="font-semibold text-[var(--main-color)]">
                        Yuboruvchi: {n.sender || 'Admin (Yolnoma)'}
                      </span>
                      {isUnread ? (
                        <span className="text-emerald-500 font-bold hover:underline">
                          O'qildi deb belgilash ✓
                        </span>
                      ) : (
                        <span className="text-[var(--sub-color)] font-mono">O'qilgan</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' ? (
        <>
          {(!profile.bio || profile.bio.trim() === '') && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Xush kelibsiz! Profilingizni to'liq faollashtirish uchun Ismingiz va Bio ma'lumotingizni kiriting. (Ikkala maydon ham majburiy)</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs shrink-0 cursor-pointer"
              >
                To'ldirish
              </button>
            </div>
          )}

          {/* Profile Header Banner */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-sm">
            <div
              className="h-36 w-full relative"
              style={{ backgroundColor: profile.bannerColor || '#38bdf8' }}
            />

            <div className="p-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <img
                      src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                      alt="avatar"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-[var(--card-bg)] shadow-md bg-[var(--sub-alt)]"
                    />
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--card-bg)]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-color)]">{profile.displayName}</h2>
                      {profile.isVerified && (
                        <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" title="Verified User" />
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-[10px] font-extrabold uppercase">
                        {profile.rankTitle || 'Typing Novice'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-black uppercase font-mono flex items-center gap-1">
                        <Award className="w-3 h-3" /> LVL {profile.level || 1}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--sub-color)] font-mono">@{profile.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-xs font-semibold hover:bg-[var(--main-color)] hover:text-white transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              {/* Bio & Socials */}
              <p className="text-xs text-[var(--text-color)] max-w-2xl leading-relaxed mb-4 whitespace-pre-wrap">
                {profile.bio || 'No bio written yet. Click edit to introduce yourself to the typing community!'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--sub-color)] border-t border-[var(--sub-alt)] pt-4">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[var(--main-color)]" />
                  <span>{profile.country || '🇺🇿 Uzbekistan'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[var(--main-color)]" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[var(--text-color)]">{profile.followersCount || 0}</strong> Followers
                </span>
              </div>
            </div>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
              <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Highest Speed</span>
              <div className="text-2xl font-mono font-extrabold text-[var(--main-color)] mt-1">
                {profile.highestWpm} <span className="text-xs font-normal text-[var(--sub-color)]">WPM</span>
              </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
              <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Accuracy</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-500 mt-1">{profile.highestAccuracy}%</div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
              <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Completed Tests</span>
              <div className="text-2xl font-mono font-extrabold text-[var(--text-color)] mt-1">{profile.totalTests}</div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
              <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Active Streak</span>
              <div className="text-2xl font-mono font-extrabold text-amber-500 mt-1">
                {profile.currentStreak || 1} Days
              </div>
            </div>
          </div>

          {/* Danger Zone / Deletion Row */}
          <div className="bg-[var(--card-bg)] border border-rose-500/20 p-5 rounded-3xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-500">Danger Zone: Account Deletion</h4>
              <p className="text-[11px] text-[var(--sub-color)]">
                Permanently remove your profile, stats, and historical typing test scores.
              </p>
            </div>

            <button
              onClick={() => {
                setDeleteStep(1);
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </>
      ) : (
        /* Admin Control Panel View */
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--main-color)]" />
                <span>Admin User Management</span>
              </h3>
              <p className="text-xs text-[var(--sub-color)]">Manage user permissions, verification status, and username quotas.</p>
            </div>
          </div>

          {/* Current User Quick Management */}
          <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/50 space-y-3">
            <h4 className="text-xs font-bold uppercase text-[var(--sub-color)]">Manage Current Logged-in User</h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleAdminResetUsernameChanges(profile.uid)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card-bg)] text-xs font-bold hover:text-[var(--main-color)] transition-all border border-[var(--sub-alt)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Grant +2 Username Changes</span>
              </button>

              <button
                onClick={() => handleAdminToggleVerification(profile)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card-bg)] text-xs font-bold hover:text-sky-400 transition-all border border-[var(--sub-alt)]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{profile.isVerified ? 'Remove Verified Badge' : 'Grant Verified Badge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 shadow-2xl text-[var(--text-color)] my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Profile Settings</h3>
              <button onClick={() => setIsEditing(false)} className="text-[var(--sub-color)] hover:text-[var(--text-color)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Avatar Preset Picker */}
              <div>
                <label className="block font-semibold mb-2 text-[var(--sub-color)]">Choose Avatar Preset or Custom Image URL</label>
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2">
                  {presetAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="preset"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-10 h-10 rounded-xl cursor-pointer border-2 bg-[var(--sub-alt)] ${
                        avatarUrl === url ? 'border-[var(--main-color)] scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 outline-none focus:border-[var(--main-color)]"
                />
              </div>

              {/* Display Name */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-[var(--sub-color)]">
                    Ismingiz (Display Name) <span className="text-rose-500 font-bold">* (Majburiy)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--sub-color)]">{displayName.length} / 50</span>
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.substring(0, 50))}
                  maxLength={50}
                  placeholder="Ismingizni kiriting..."
                  required
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 outline-none focus:border-[var(--main-color)] font-semibold"
                />
              </div>

              {/* Username with Rules & Counter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-[var(--sub-color)]">Unique Username</label>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      changesLeft > 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {changesLeft} change{changesLeft === 1 ? '' : 's'} remaining
                  </span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={changesLeft <= 0}
                  className={`w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 font-mono outline-none ${
                    changesLeft <= 0 ? 'opacity-50 cursor-not-allowed' : 'focus:border-[var(--main-color)]'
                  }`}
                />
                {changesLeft <= 0 ? (
                  <p className="text-[10px] text-rose-400 mt-1">
                    You have reached the maximum number of username changes (0 remaining).
                  </p>
                ) : (
                  <p className="text-[10px] text-[var(--sub-color)] mt-1">
                    You can change your username only 2 times total.
                  </p>
                )}
              </div>

              {/* Bio with 250 character counter & emojis */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-[var(--sub-color)]">
                    Bio / Ma'lumot <span className="text-rose-500 font-bold">* (Majburiy)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--sub-color)]">{bio.length} / 250</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.substring(0, 250))}
                  maxLength={250}
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 outline-none focus:border-[var(--main-color)]"
                  placeholder="O'zingiz haqingizda qisqacha ma'lumot yozing..."
                />
                {/* Emoji Bar */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-[var(--sub-color)] font-mono mr-1">Emojis:</span>
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => bio.length < 250 && setBio((prev) => (prev + emoji).substring(0, 250))}
                      className="p-1 hover:bg-[var(--sub-alt)] rounded text-xs"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block font-semibold mb-1 text-[var(--sub-color)]">Country / Flag</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 outline-none focus:border-[var(--main-color)]"
                >
                  {presetCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Banner Color */}
              <div>
                <label className="block font-semibold mb-1 text-[var(--sub-color)]">Cover Banner Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs uppercase text-[var(--sub-color)]">{bannerColor}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sub-alt)]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--sub-alt)] font-bold text-[var(--sub-color)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[var(--main-color)] text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Double Confirmation Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Delete Account Permanently</h3>
                <p className="text-xs text-[var(--sub-color)]">Step {deleteStep} of 2</p>
              </div>
            </div>

            {deleteStep === 1 ? (
              <div className="space-y-4 text-xs leading-relaxed text-[var(--text-color)]">
                <p className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300">
                  Are you absolutely sure you want to permanently delete your account? This action cannot be undone. All your profile information, test history, achievements, and leaderboard records will be erased.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--sub-alt)] font-bold text-[var(--sub-color)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold"
                  >
                    Proceed to Step 2
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-[var(--text-color)]">
                <p>
                  To confirm permanent deletion, please type <strong className="text-rose-500 font-mono">DELETE</strong> in the box below:
                </p>

                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder="Type DELETE here..."
                  className="w-full p-3 rounded-xl bg-[var(--sub-alt)] border border-rose-500/30 font-mono text-center font-bold text-rose-500 outline-none"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--sub-alt)] font-bold text-[var(--sub-color)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmInput !== 'DELETE' || deleting}
                    className={`px-5 py-2 rounded-xl text-white font-bold transition-all ${
                      deleteConfirmInput === 'DELETE'
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-rose-500/40 cursor-not-allowed'
                    }`}
                  >
                    {deleting ? 'Deleting Account...' : 'Permanently Delete Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
