import React, { useState } from 'react';
import {
  Palette,
  Volume2,
  MousePointer,
  Keyboard,
  Type,
  Globe,
  Eye,
  Sliders,
  Check,
  Sparkles,
  Zap,
  Gauge,
  Timer
} from 'lucide-react';
import { useSettings, TypingAnimation, TypingAnimationSpeed } from '../../context/SettingsContext';
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
    typingAnimation,
    setTypingAnimation,
    typingAnimationSpeed,
    setTypingAnimationSpeed,
    typingAnimDurationMs,
    setTypingAnimDurationMs,
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

  const [previewInput, setPreviewInput] = useState('Tezkor yozish');
  const [animTrigger, setAnimTrigger] = useState(0);

  const typingAnimationOptions: {
    id: TypingAnimation;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    { id: 'jump', label: 'Sakrash (Jump)', desc: 'Harf bosilganda tepaga sakrab tushadi', icon: '🚀' },
    { id: 'bounce', label: 'Koptokcha (Bounce)', desc: 'Harf kattalashib elastik tarzda joylashadi', icon: '⚡' },
    { id: 'glow', label: 'Neon Nur (Glow)', desc: 'Harf bosilganda yorqin neon nur taratadi', icon: '✨' },
    { id: 'wave', label: "To'lqin (Wave)", desc: "Harf bosilganda qiya to'lqinlanadi", icon: '🌊' },
    { id: 'slide', label: 'Pastdan Chiqish (Slide)', desc: 'Harf pastdan silliq ko‘tariladi', icon: '⬆️' },
    { id: 'pulse', label: 'Pulsatsiya (Pulse)', desc: 'Harf yengil puls berib mustahkamlanadi', icon: '💓' },
    { id: 'none', label: 'Oddiy (Off)', desc: 'Statik yozilish, animatsiyasiz', icon: '⚪' }
  ];

  const animationSpeedOptions: {
    id: TypingAnimationSpeed;
    label: string;
    duration: string;
    desc: string;
    tag: string;
  }[] = [
    { id: 'ultra_fast', label: "O'ta Tez", duration: '120ms', desc: 'Chaqqon & dinamik', tag: '0.12s' },
    { id: 'fast', label: 'Tez', duration: '180ms', desc: 'Yengil & tezkor', tag: '0.18s' },
    { id: 'normal', label: "O'rtacha", duration: '260ms', desc: 'Standart mezon', tag: '0.26s' },
    { id: 'slow', label: 'Sekin', duration: '500ms', desc: 'Sokin va yaqqol sezilarli', tag: '0.50s' },
    { id: 'very_slow', label: 'Juda Sekin', duration: '800ms', desc: 'Mayin va cho‘ziq harakat', tag: '0.80s' },
    { id: 'super_slow', label: 'Super Sekin', duration: '1200ms', desc: 'Kinematik sekin animatsiya', tag: '1.20s' },
  ];

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

      {/* Harflar Yozilish Animatsiyalari (Typing Letter Animation Effects) */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--main-color)]" />
            <span>Harflar Yozilish Animatsiyalari (Typing Letter Effects)</span>
          </h3>
          <span className="text-[11px] font-mono text-[var(--sub-color)] bg-[var(--sub-alt)] px-2.5 py-0.5 rounded-full w-fit">
            Hozirgi effekt: <strong className="text-[var(--main-color)] uppercase">{typingAnimation}</strong>
          </span>
        </div>

        <p className="text-xs text-[var(--sub-color)] mb-4">
          Klaviatura tugmasi bosilganda harfning sakrab o'z o'rniga tushishi, kattalashib elastik bo'lishi, neon nur taratishi yoki to'lqinlanishi effektini tanlang.
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6">
          {typingAnimationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setTypingAnimation(opt.id);
                setAnimTrigger((prev) => prev + 1);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                typingAnimation === opt.id
                  ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/20'
                  : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20 hover:border-[var(--main-color)]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{opt.icon}</span>
                  <span className="font-bold text-xs">{opt.label}</span>
                </div>
                {typingAnimation === opt.id && <Check className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] leading-tight ${typingAnimation === opt.id ? 'text-white/85' : 'text-[var(--sub-color)]'}`}>
                {opt.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Animation Speed & Duration Control (Tezlik / Sekinlikni sozlash) */}
        {typingAnimation !== 'none' && (
          <div className="pt-4 border-t border-[var(--sub-alt)] mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[var(--text-color)] flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[var(--main-color)]" />
                <span>Animatsiya Tezligi (Davomiyligi / Sekinligi)</span>
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--sub-color)]">
                <Timer className="w-3.5 h-3.5 text-[var(--main-color)]" />
                <span>Tanlangan vaqt: <strong className="text-[var(--main-color)] font-bold">{typingAnimDurationMs} ms</strong> ({ (typingAnimDurationMs / 1000).toFixed(2) } s)</span>
              </div>
            </div>

            {/* Speed Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {animationSpeedOptions.map((sp) => {
                const isSelected = typingAnimationSpeed === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setTypingAnimationSpeed(sp.id);
                      setAnimTrigger((prev) => prev + 1);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/20'
                        : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20 hover:border-[var(--main-color)]/50'
                    }`}
                  >
                    <span className="font-bold text-xs">{sp.label}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-white/90' : 'text-[var(--main-color)] font-semibold'}`}>
                      {sp.duration}
                    </span>
                    <span className={`text-[9px] leading-tight ${isSelected ? 'text-white/75' : 'text-[var(--sub-color)]'}`}>
                      {sp.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Fine-Tuning Slider */}
            <div className="bg-[var(--sub-alt)]/60 p-3.5 rounded-2xl border border-[var(--sub-alt)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--sub-color)] font-semibold">Aniq millisekundlarda sozlash (Sekinroq & Tezroq):</span>
                <span className="font-mono text-[var(--main-color)] font-bold">{typingAnimDurationMs} ms</span>
              </div>
              <input
                type="range"
                min="80"
                max="1500"
                step="10"
                value={typingAnimDurationMs}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTypingAnimDurationMs(val);
                  setAnimTrigger((prev) => prev + 1);
                }}
                className="w-full h-2 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--main-color)]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--sub-color)] mt-1.5">
                <span>80ms (O'ta Tez)</span>
                <span>260ms (Mezon)</span>
                <span>600ms (Sekin)</span>
                <span>1000ms (Juda Sekin)</span>
                <span>1500ms (Super Sekin)</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Live Testing Sandbox */}
        <div className="bg-[var(--bg-color)]/70 border border-[var(--sub-alt)] p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--sub-color)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>Jonli Sinov (Live Preview):</span>
            </span>
            <button
              type="button"
              onClick={() => setAnimTrigger((prev) => prev + 1)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--sub-alt)] hover:bg-[var(--main-color)] hover:text-white transition-colors cursor-pointer text-[var(--text-color)] flex items-center gap-1"
            >
              <span>Qayta ko'rish</span>
              <span>🔄</span>
            </button>
          </div>

          {/* Animated Text Sample Display */}
          <div className="py-4 px-4 bg-[var(--card-bg)] rounded-xl border border-[var(--sub-alt)] font-mono text-xl sm:text-2xl text-[var(--text-color)] flex items-center justify-center gap-1.5 select-none overflow-x-auto min-h-[64px]">
            {previewInput.split('').map((ch, i) => (
              <span
                key={`${i}-${ch}-${animTrigger}`}
                className={`inline-block font-semibold transition-all ${
                  typingAnimation !== 'none' ? `anim-char-${typingAnimation}` : ''
                } ${ch === ' ' ? 'w-3' : 'text-[var(--main-color)]'}`}
                style={{ animationDelay: `${i * Math.min(60, Math.max(20, typingAnimDurationMs * 0.15))}ms` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>

          {/* User Input Test Field */}
          <div className="mt-3">
            <input
              type="text"
              value={previewInput}
              onChange={(e) => {
                setPreviewInput(e.target.value);
                setAnimTrigger((prev) => prev + 1);
              }}
              placeholder="Harflarni yozib ko'ring (tezligi va sekinligini sinang)..."
              className="w-full bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
            />
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
