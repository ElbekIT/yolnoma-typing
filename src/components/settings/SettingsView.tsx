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
    </div>
  );
};
