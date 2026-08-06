import React, { useState } from 'react';
import { User, Edit3, Globe, Calendar, Award, Zap, Target, Clock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { user, profile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [saving, setSaving] = useState(false);

  if (!user || !profile) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl text-center">
        <User className="w-12 h-12 text-[var(--sub-color)] mx-auto mb-3" />
        <h2 className="text-xl font-bold">Guest Profile</h2>
        <p className="text-xs text-[var(--sub-color)] mt-1">
          Sign in to customize your profile, set a bio, upload an avatar, and climb global leaderboards!
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile({
      displayName,
      bio,
      country
    });
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Profile Header Banner */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl overflow-hidden shadow-sm">
        <div
          className="h-36 w-full relative"
          style={{ backgroundColor: profile.bannerColor || '#38bdf8' }}
        />

        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                alt="avatar"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[var(--card-bg)] shadow-md bg-[var(--sub-alt)]"
              />
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--text-color)]">{profile.displayName}</h2>
                <p className="text-xs text-[var(--sub-color)] font-mono">@{profile.username}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-xs font-semibold hover:bg-[var(--main-color)] hover:text-white transition-all self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          <p className="text-xs text-[var(--text-color)] max-w-2xl leading-relaxed mb-4">
            {profile.bio || 'No bio written yet. Click edit to introduce yourself to the typing community!'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--sub-color)] border-t border-[var(--sub-alt)] pt-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>{profile.country || 'Global'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Highest WPM</span>
          <div className="text-2xl font-mono font-extrabold text-[var(--main-color)] mt-1">{profile.highestWpm}</div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Accuracy</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-500 mt-1">{profile.highestAccuracy}%</div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Total Tests</span>
          <div className="text-2xl font-mono font-extrabold text-[var(--text-color)] mt-1">{profile.totalTests}</div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--sub-color)] font-bold uppercase">Current Streak</span>
          <div className="text-2xl font-mono font-extrabold text-amber-500 mt-1">{profile.currentStreak} Days</div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 shadow-2xl text-[var(--text-color)]">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[var(--sub-color)]">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] outline-none focus:border-[var(--main-color)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--sub-color)]">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] outline-none focus:border-[var(--main-color)]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--sub-color)]">Country / Flag</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="🇺🇿 Uzbekistan"
                  className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] outline-none focus:border-[var(--main-color)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
