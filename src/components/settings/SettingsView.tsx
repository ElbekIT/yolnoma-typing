import React from 'react';
import {
  Palette,
  Volume2,
  MousePointer,
  Keyboard,
  Type,
  Globe,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { themes } from '../../config/themes';
import { languagesList } from '../../config/languages';
import { ThemeMode, CaretStyle, SoundProfile, LanguageCode } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    caretStyle,
    setCaretStyle,
    smoothCaret,
    setSmoothCaret,
    soundProfile,
    setSoundProfile,
    volume,
    setVolume,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    headerIconSize,
    setHeaderIconSize,
    modeBarWidth,
    setModeBarWidth,
    modeBarScale,
    setModeBarScale,
    language,
    setLanguage,
    showKeyboard,
    setShowKeyboard,
    showLiveWpm,
    setShowLiveWpm
  } = useSettings();

  const caretOptions: CaretStyle[] = ['line', 'block', 'underline', 'outline'];
  const soundProfiles: { id: SoundProfile; label: string }[] = [
    { id: 'off', label: 'Mute (Off)' },
    { id: 'thock', label: 'Mechanical Thock' },
    { id: 'cherry-blue', label: 'Cherry MX Blue' },
    { id: 'cherry-red', label: 'Cherry MX Red' },
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'soft-bubble', label: 'Soft Bubble' }
  ];

  const fontsList = [
    'JetBrains Mono',
    'Fira Code',
    'Roboto Mono',
    'Courier New',
    'Inter'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
          <Sliders className="w-6 h-6 text-[var(--main-color)]" />
          <span>Platform Customization & Settings</span>
        </h2>
        <p className="text-xs text-[var(--sub-color)] mt-1">
          Customize typing themes, mechanical keyboard sounds, caret animations, fonts, and language preferences
        </p>
      </div>

      {/* Theme Picker */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--main-color)]" />
          <span>Color Themes</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(themes).map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id as ThemeMode)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                theme === th.id
                  ? 'border-[var(--main-color)] bg-[var(--sub-alt)] shadow-md ring-2 ring-[var(--main-color)]/30'
                  : 'border-[var(--sub-color)]/20 bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--text-color)]">{th.name}</span>
                {theme === th.id && <Check className="w-4 h-4 text-[var(--main-color)]" />}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: th.bg }} />
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: th.cardBg }} />
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: th.mainColor }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Sound Settings */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[var(--main-color)]" />
          <span>Keyboard Sound Feedback</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--sub-color)]">Switch Sound Profile</label>
            <div className="grid grid-cols-2 gap-2">
              {soundProfiles.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSoundProfile(sp.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    soundProfile === sp.id
                      ? 'bg-[var(--main-color)] text-white font-bold border-[var(--main-color)]'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2 text-[var(--sub-color)]">
              <span>Volume Level</span>
              <span className="font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[var(--main-color)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Caret & Display Options */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <MousePointer className="w-4 h-4 text-[var(--main-color)]" />
          <span>Caret Style & Visual Assists</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-semibold mb-2 text-[var(--sub-color)]">Caret Style</label>
            <div className="flex gap-2">
              {caretOptions.map((cs) => (
                <button
                  key={cs}
                  onClick={() => setCaretStyle(cs)}
                  className={`flex-1 py-2 rounded-xl border font-mono font-bold capitalize transition-all ${
                    caretStyle === cs
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)]'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20'
                  }`}
                >
                  {cs}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)] cursor-pointer">
              <span className="font-bold">Smooth Caret Movement</span>
              <input
                type="checkbox"
                checked={smoothCaret}
                onChange={(e) => setSmoothCaret(e.target.checked)}
                className="w-4 h-4 accent-[var(--main-color)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)] cursor-pointer">
              <span className="font-bold">Show Virtual Onscreen Keyboard</span>
              <input
                type="checkbox"
                checked={showKeyboard}
                onChange={(e) => setShowKeyboard(e.target.checked)}
                className="w-4 h-4 accent-[var(--main-color)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)] cursor-pointer">
              <span className="font-bold">Display Real-time WPM Bar</span>
              <input
                type="checkbox"
                checked={showLiveWpm}
                onChange={(e) => setShowLiveWpm(e.target.checked)}
                className="w-4 h-4 accent-[var(--main-color)]"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Header & Navigation Customization */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--main-color)]" />
          <span>Yuqori Menyu Ikonkalari O'lchami (Header Icons Size)</span>
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-[var(--sub-color)]">
            Yuqori qatordagi menyu (yozish, peshqadamlar, saboqlar, arena, sozlamalar) tugmalari va ikonkalari o'lchamini o'zingizga qulay qilib sozlang.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'small' as const, label: "Kichik (16px)", desc: 'Minimalist & ixcham', iconClass: 'w-4 h-4' },
              { id: 'medium' as const, label: "O'rtacha (20px)", desc: 'Standart qulay o\'lcham', iconClass: 'w-5 h-5' },
              { id: 'large' as const, label: "Katta (24px)", desc: 'Ko\'rinarli & yirik', iconClass: 'w-6 h-6' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setHeaderIconSize(opt.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  headerIconSize === opt.id
                    ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/20'
                    : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20 hover:border-[var(--main-color)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className={opt.iconClass} />
                    <span className="font-bold text-xs">{opt.label}</span>
                  </div>
                  {headerIconSize === opt.id && <Check className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] ${headerIconSize === opt.id ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Navigation Bar Customization (So'zlar, Jumlalar, Hikoyalar menyusi) */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Type className="w-4 h-4 text-[var(--main-color)]" />
          <span>Yozish Rejimlari Paneli (So'zlar, Jumlalar, Vaqt Paneli)</span>
        </h3>

        <div className="space-y-6">
          {/* Width Selection */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--sub-color)]">
              Panel Kengligi (Uzunligi)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'compact' as const, label: 'Ixcham (Compact)', desc: 'Toraytirilgan' },
                { id: 'standard' as const, label: 'Standart', desc: "O'rtacha qulay" },
                { id: 'wide' as const, label: 'Keng (Wide)', desc: 'Kengaytirilgan' },
                { id: 'full' as const, label: "To'liq (Full)", desc: 'Maksimal keng' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setModeBarWidth(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    modeBarWidth === item.id
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/20'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20 hover:border-[var(--main-color)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{item.label}</span>
                    {modeBarWidth === item.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] ${modeBarWidth === item.id ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale Selection */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--sub-color)]">
              Tugmalar va Matn O'lchami
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'small' as const, label: "Kichik (Small)", desc: 'Ixcham 11px font' },
                { id: 'medium' as const, label: "O'rtacha (Medium)", desc: 'Standart 12px font' },
                { id: 'large' as const, label: "Katta (Large)", desc: 'Yirik 14px font' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setModeBarScale(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    modeBarScale === item.id
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/20'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20 hover:border-[var(--main-color)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{item.label}</span>
                    {modeBarScale === item.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] ${modeBarScale === item.id ? 'text-white/80' : 'text-[var(--sub-color)]'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Font Customization */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Type className="w-4 h-4 text-[var(--main-color)]" />
          <span>Typing Typography</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--sub-color)]">Font Family</label>
            <div className="flex flex-wrap gap-2">
              {fontsList.map((f) => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f)}
                  style={{ fontFamily: f }}
                  className={`px-3 py-2 rounded-xl border text-xs transition-all ${
                    fontFamily === f
                      ? 'bg-[var(--main-color)] text-white font-bold border-[var(--main-color)]'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2 text-[var(--sub-color)]">
              <span>Font Size</span>
              <span className="font-mono">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="32"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--main-color)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Account Privacy & Security Settings */}
      <PrivacyAndSecurityCard />
    </div>
  );
};

const PrivacyAndSecurityCard: React.FC = () => {
  const { profile, updateUserProfile, resetPassword, user } = useAuth();
  const [resetSent, setResetSent] = React.useState(false);

  if (!profile) return null;

  const privacy = profile.privacy || {
    profileVisibility: 'public',
    allowMessages: 'everyone',
    showOnlineStatus: true,
    showStats: true,
    allowFollow: true
  };

  const handleTogglePrivacy = (key: keyof typeof privacy, val: any) => {
    updateUserProfile({
      privacy: {
        ...privacy,
        [key]: val
      }
    });
  };

  const handlePasswordReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
        <Eye className="w-4 h-4 text-[var(--main-color)]" />
        <span>Privacy & Account Security</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-3">
          <div>
            <label className="block font-semibold mb-1 text-[var(--sub-color)]">Profile Visibility</label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => handleTogglePrivacy('profileVisibility', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[var(--text-color)] outline-none"
            >
              <option value="public">Public (Visible to everyone)</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private (Hidden from searches)</option>
            </select>
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)] cursor-pointer">
            <span className="font-bold">Show Online / Offline Status</span>
            <input
              type="checkbox"
              checked={privacy.showOnlineStatus}
              onChange={(e) => handleTogglePrivacy('showOnlineStatus', e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)]"
            />
          </label>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)] cursor-pointer">
            <span className="font-bold">Publicly Show Speed Statistics</span>
            <input
              type="checkbox"
              checked={privacy.showStats}
              onChange={(e) => handleTogglePrivacy('showStats', e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)] cursor-pointer">
            <span className="font-bold">Allow Follow Requests</span>
            <input
              type="checkbox"
              checked={privacy.allowFollow}
              onChange={(e) => handleTogglePrivacy('allowFollow', e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)]"
            />
          </label>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--sub-alt)] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold block">Password & Security</span>
          <span className="text-[10px] text-[var(--sub-color)]">Send a password reset link to {user?.email}</span>
        </div>

        <button
          onClick={handlePasswordReset}
          className="px-4 py-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] font-bold text-xs hover:bg-[var(--main-color)] hover:text-white transition-all"
        >
          {resetSent ? 'Reset Link Sent ✓' : 'Reset Password'}
        </button>
      </div>
    </div>
  );
};
