import React from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Type,
  Volume2,
  VolumeX,
  Keyboard,
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { themesList } from '../../config/themes';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    soundTheme,
    setSoundTheme,
    soundVolume,
    setSoundVolume,
    caretStyle,
    setCaretStyle,
    smoothCaret,
    setSmoothCaret,
    blindMode,
    setBlindMode,
    quickRestart,
    setQuickRestart,
    showLiveWpm,
    setShowLiveWpm,
    showLiveAccuracy,
    setShowLiveAccuracy,
    showTimerProgress,
    setShowTimerProgress,
    showKeyboard,
    setShowKeyboard,
    resetSettings
  } = useSettings();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[var(--main-color)]" />
            <span>Preferences & Customization</span>
          </h2>
          <p className="text-xs text-[var(--sub-color)] mt-1">
            Tailor visual aesthetics, audio mechanical switch feedback, and typing ergonomics
          </p>
        </div>
        <button
          onClick={resetSettings}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-rose-500/10 hover:text-rose-500 text-xs font-bold text-[var(--sub-color)] transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Themes Section */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-color)]">
          <Palette className="w-4 h-4 text-[var(--main-color)]" />
          <span>Color Themes ({themesList.length})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {themesList.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                theme === t.id
                  ? 'border-[var(--main-color)] ring-2 ring-[var(--main-color)]/20 shadow-md'
                  : 'border-[var(--sub-alt)] hover:border-[var(--sub-color)]/40'
              }`}
              style={{ backgroundColor: t.cardBg }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: t.textColor }}>
                  {t.name}
                </span>
                {theme === t.id && (
                  <Check className="w-3.5 h-3.5" style={{ color: t.mainColor }} />
                )}
              </div>
              <div className="flex gap-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.bg }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.mainColor }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.subColor }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography & Layout */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-color)]">
          <Type className="w-4 h-4 text-[var(--main-color)]" />
          <span>Typography & Font Sizing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--sub-color)] block">Font Family</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mono', label: 'JetBrains Mono' },
                { id: 'sans', label: 'Plus Jakarta' },
                { id: 'serif', label: 'Georgia Serif' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    fontFamily === f.id
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)]'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-alt)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--sub-color)] block">Font Size ({fontSize}px)</label>
            <input
              type="range"
              min="16"
              max="36"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[var(--main-color)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Mechanical Switch Audio */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-color)]">
          <Volume2 className="w-4 h-4 text-[var(--main-color)]" />
          <span>Mechanical Key Switch Sound Feedback</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--sub-color)] block">Switch Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'off', label: 'Muted (Off)' },
                { id: 'mechanical', label: 'Cherry MX Blue' },
                { id: 'cherry_blue', label: 'Holy Panda' },
                { id: 'click', label: 'Alpaca Linear' },
                { id: 'pop', label: 'Thock Pop' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSoundTheme(s.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    soundTheme === s.id
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)]'
                      : 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-alt)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--sub-color)] block">
              Volume Level ({Math.round(soundVolume * 100)}%)
            </label>
            <div className="flex items-center gap-3">
              {soundVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-[var(--sub-color)]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[var(--main-color)]" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-full accent-[var(--main-color)] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ergonomics & Behavioral Toggles */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-color)]">
          <Sliders className="w-4 h-4 text-[var(--main-color)]" />
          <span>Typing Experience & HUD Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[var(--sub-alt)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-color)] block">Live WPM Counter</span>
              <span className="text-[10px] text-[var(--sub-color)]">Show real-time speed while typing</span>
            </div>
            <input
              type="checkbox"
              checked={showLiveWpm}
              onChange={(e) => setShowLiveWpm(e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sub-alt)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-color)] block">Live Accuracy Counter</span>
              <span className="text-[10px] text-[var(--sub-color)]">Show percentage precision in HUD</span>
            </div>
            <input
              type="checkbox"
              checked={showLiveAccuracy}
              onChange={(e) => setShowLiveAccuracy(e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sub-alt)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-color)] block">On-Screen Virtual Keyboard</span>
              <span className="text-[10px] text-[var(--sub-color)]">Visual finger placement guidance</span>
            </div>
            <input
              type="checkbox"
              checked={showKeyboard}
              onChange={(e) => setShowKeyboard(e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sub-alt)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-color)] block">Quick Restart (Tab + Enter)</span>
              <span className="text-[10px] text-[var(--sub-color)]">Instant hotkey test resets</span>
            </div>
            <input
              type="checkbox"
              checked={quickRestart}
              onChange={(e) => setQuickRestart(e.target.checked)}
              className="w-4 h-4 accent-[var(--main-color)] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
