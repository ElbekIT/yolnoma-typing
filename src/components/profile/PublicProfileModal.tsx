import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Globe,
  Share2,
  QrCode,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Award,
  ExternalLink,
  Check
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { initialAchievements } from '../../config/achievements';

interface PublicProfileModalProps {
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  userProfile,
  isOpen,
  onClose
}) => {
  const { profile: currentProfile, followUser, addNotification } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [reported, setReported] = useState(false);

  if (!isOpen || !userProfile) return null;

  const isSelf = currentProfile?.uid === userProfile.uid;
  const isFollowing = currentProfile?.following?.includes(userProfile.uid) || false;

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${userProfile.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    addNotification('Profile Link Copied', `Copied link for @${userProfile.username} to clipboard.`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReport = () => {
    setReported(true);
    addNotification('Report Submitted', `Thank you. Your report regarding @${userProfile.username} has been recorded.`);
  };

  const renderFormattedBio = (bioText?: string) => {
    if (!bioText) return 'No personal bio provided.';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = bioText.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--main-color)] underline font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
          >
            {part} <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }
      return part;
    });
  };

  const unlockedBadges = initialAchievements.filter((a) =>
    userProfile.unlockedAchievements?.includes(a.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-2xl text-[var(--text-color)] my-8">
        <div
          className="h-32 w-full relative"
          style={{ backgroundColor: userProfile.bannerColor || '#38bdf8' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="relative">
              <img
                src={userProfile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${userProfile.uid}`}
                alt={userProfile.username}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[var(--card-bg)] shadow-lg bg-[var(--sub-alt)]"
              />
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[var(--card-bg)] ${
                  Date.now() - userProfile.lastActive < 300000 ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={Date.now() - userProfile.lastActive < 300000 ? 'Online' : 'Offline'}
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!isSelf && currentProfile && (
                <button
                  onClick={() => followUser(userProfile.uid)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    isFollowing
                      ? 'bg-[var(--sub-alt)] text-[var(--text-color)] hover:bg-rose-500/10 hover:text-rose-500'
                      : 'bg-[var(--main-color)] text-white hover:opacity-90'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:bg-[var(--main-color)] hover:text-white transition-all cursor-pointer"
                title="Share Profile"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:bg-[var(--main-color)] hover:text-white transition-all cursor-pointer"
                title="QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              {!isSelf && (
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-rose-500 transition-all cursor-pointer"
                  title="Report User"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-[var(--text-color)]">{userProfile.displayName}</h2>
              {userProfile.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" title="Verified User" />
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-[10px] font-extrabold uppercase">
                {userProfile.rankTitle || 'Typing Novice'}
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)] font-mono">@{userProfile.username}</p>
          </div>

          {(() => {
            const calculatedXp =
              typeof userProfile.xp === 'number' && userProfile.xp >= 0
                ? userProfile.xp
                : (userProfile.level || 1) * 250;
            const currentLevel = userProfile.level || Math.max(1, Math.floor(calculatedXp / 500) + 1);
            const xpInLevel = calculatedXp % 500;
            const progressPercent = Math.min(100, Math.max(10, Math.round((xpInLevel / 500) * 100)));
            return (
              <div className="bg-[var(--sub-alt)] p-3 rounded-2xl border border-[var(--sub-color)]/10 mb-4">
                <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                  <span className="text-[var(--main-color)] font-extrabold">Level {currentLevel}</span>
                  <span className="text-[var(--sub-color)] font-mono">{calculatedXp} XP</span>
                </div>
                <div className="w-full bg-[var(--card-bg)] h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-[var(--main-color)] h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })()}

          <div className="p-3.5 rounded-2xl bg-[var(--sub-alt)]/50 text-xs text-[var(--text-color)] leading-relaxed mb-4 whitespace-pre-wrap">
            {renderFormattedBio(userProfile.bio)}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--sub-color)] mb-6">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>{userProfile.country || '🇺🇿 Uzbekistan'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span>
              <strong className="text-[var(--text-color)]">{userProfile.followersCount || 0}</strong> Followers
            </span>
            <span>•</span>
            <span>
              <strong className="text-[var(--text-color)]">{userProfile.followingCount || 0}</strong> Following
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-[var(--sub-alt)] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[var(--sub-color)] uppercase font-bold">Highest WPM</span>
              <div className="text-xl font-mono font-extrabold text-[var(--main-color)] mt-0.5">
                {userProfile.highestWpm}
              </div>
            </div>
            <div className="bg-[var(--sub-alt)] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[var(--sub-color)] uppercase font-bold">Accuracy</span>
              <div className="text-xl font-mono font-extrabold text-emerald-500 mt-0.5">
                {userProfile.highestAccuracy}%
              </div>
            </div>
            <div className="bg-[var(--sub-alt)] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[var(--sub-color)] uppercase font-bold">Total Tests</span>
              <div className="text-xl font-mono font-extrabold text-[var(--text-color)] mt-0.5">
                {userProfile.totalTests}
              </div>
            </div>
            <div className="bg-[var(--sub-alt)] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[var(--sub-color)] uppercase font-bold">Streak</span>
              <div className="text-xl font-mono font-extrabold text-amber-500 mt-0.5">
                {userProfile.currentStreak || 1} Days
              </div>
            </div>
          </div>

          {(userProfile.dinoHighScore || 0) > 0 && (
            <div className="p-3 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🦖</span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-color)]">Dino Runner Rekordi</h4>
                  <p className="text-[10px] text-[var(--sub-color)]">
                    {userProfile.dinoMaxDistance || 0} metr masofa
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 font-mono text-xs font-black">
                {userProfile.dinoHighScore} ball
              </span>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-[var(--sub-color)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Unlocked Badges ({unlockedBadges.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {unlockedBadges.length > 0 ? (
                unlockedBadges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)] border border-amber-500/20 text-xs font-bold text-[var(--text-color)]"
                    title={b.description}
                  >
                    <span>{b.icon}</span>
                    <span>{b.title}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-[var(--sub-color)]">No achievements unlocked yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl text-center max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Profile QR Code</h3>
            <p className="text-xs text-[var(--sub-color)]">Scan with mobile camera to view @{userProfile.username}</p>
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
              <div className="w-48 h-48 bg-slate-900 rounded-xl p-2 flex flex-col justify-between text-white font-mono text-[9px] break-all border-4 border-slate-900">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white bg-black p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-10 h-10 border-4 border-white bg-black p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                </div>
                <div className="text-center font-bold text-amber-400 py-2 text-xs">
                  YOLNOMA / @{userProfile.username.toUpperCase()}
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-10 h-10 border-4 border-white bg-black p-1">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-bold text-black text-sm">
                    Y
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--main-color)] text-white font-bold text-xs cursor-pointer"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
