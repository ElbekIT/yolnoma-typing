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
  Timer,
  Film,
  Sun,
  Moon,
  Search,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { useSettings, TypingAnimation, TypingAnimationSpeed } from '../../context/SettingsContext';
import { useDevice } from '../../context/DeviceContext';
import { DEVICE_PROFILES } from '../../data/devices';
import { useAuth } from '../../context/AuthContext';
import { themes, THEME_LIST, ThemeConfig } from '../../config/themes';
import { languagesList } from '../../config/languages';
import { ThemeMode, CaretStyle, TapeMode, SoundProfile, LanguageCode } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    caretStyle,
    setCaretStyle,
    smoothCaret,
    setSmoothCaret,
    tapeMode,
    setTapeMode,
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

  const { currentDevice, recalibrate } = useDevice();

  const [previewInput, setPreviewInput] = useState('Tezkor yozish');
  const [animTrigger, setAnimTrigger] = useState(0);

  // 1000 Themes Navigation & Filtering State
  const [themeSearch, setThemeSearch] = useState('');
  const [selectedThemeCat, setSelectedThemeCat] = useState<string>('all');
  const [themePage, setThemePage] = useState<number>(1);
  const THEMES_PER_PAGE = 24;

  const typingAnimationOptions: {
    id: TypingAnimation;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    { id: 'pop', label: 'Elastik Pop (Uzbektype)', desc: 'Harf bosilganda elastik pop bo‘lib kattalashib joylashadi', icon: '✨' },
    { id: 'bounce', label: 'Sakrash (Bounce Up)', desc: 'Harf bosilganda yuqoriga yengil sakrab tushadi', icon: '⚡' },
    { id: 'bounceDown', label: 'Pastga sakrash (Bounce Down)', desc: 'Harf bosilganda pastga yengil sakrab joylashadi', icon: '⏬' },
    { id: 'jump', label: 'Katta Sakrash (Jump)', desc: 'Harf bosilganda tepaga sakrab tushadi', icon: '🚀' },
    { id: 'glow', label: 'Neon Nur (Glow)', desc: 'Harf bosilganda yorqin neon nur taratadi', icon: '🌟' },
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

      {/* Theme Picker: 1000 Curated Themes Gallery */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 sm:p-6 rounded-3xl shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--sub-alt)]/60">
          <div>
            <h3 className="text-base font-bold text-[var(--text-color)] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--main-color)]" />
              <span>Sayt Mavzulari Galereyasi ({THEME_LIST.length} xil Theme)</span>
            </h3>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              Dasturchilar muhitlari, kiberpunk neon, kosmik galaktikalar, olovli va minimal yorug' {THEME_LIST.length} xil boy ranglar to'plami
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Random Theme Surprise Button */}
            <button
              type="button"
              onClick={() => {
                const randomTheme = THEME_LIST[Math.floor(Math.random() * THEME_LIST.length)];
                if (randomTheme) setTheme(randomTheme.id as ThemeMode);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--main-color)] hover:text-white border border-[var(--sub-alt)] text-[var(--text-color)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Tasodifiy mavzuni tanlash (Surprise me)"
            >
              <Shuffle className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>Tasodifiy Mavzu</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)] text-xs font-mono text-[var(--main-color)] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{THEME_LIST.length} ta mavzu</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sub-color)]" />
            <input
              type="text"
              value={themeSearch}
              onChange={(e) => {
                setThemeSearch(e.target.value);
                setThemePage(1);
              }}
              placeholder="Mavzu nomini yoki turini qidirish... (Masalan: Dracula, Neon, Cyber, Matrix, Gold, Matcha, Light)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] text-xs text-[var(--text-color)] placeholder:text-[var(--sub-color)] focus:outline-none focus:border-[var(--main-color)] transition-colors"
            />
            {themeSearch && (
              <button
                type="button"
                onClick={() => setThemeSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--sub-color)] hover:text-[var(--text-color)] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'all', label: `Barchasi (${THEME_LIST.length})` },
              { id: 'code', label: `💻 Kod & Dasturchi (${THEME_LIST.filter(t => t.category === 'code').length})` },
              { id: 'cyber', label: `⚡ Kiber & Neon (${THEME_LIST.filter(t => t.category === 'cyber').length})` },
              { id: 'space', label: `🌌 Kosmos (${THEME_LIST.filter(t => t.category === 'space').length})` },
              { id: 'nature', label: `🌲 Tabiat & Okean (${THEME_LIST.filter(t => t.category === 'nature').length})` },
              { id: 'fire', label: `🌋 Olov & Quyosh (${THEME_LIST.filter(t => t.category === 'fire').length})` },
              { id: 'pastel', label: `🌸 Pastel & Shirin (${THEME_LIST.filter(t => t.category === 'pastel').length})` },
              { id: 'luxury', label: `👑 Hashamat & Oltin (${THEME_LIST.filter(t => t.category === 'luxury').length})` },
              { id: 'light', label: `📄 Minimal & Yorug' (${THEME_LIST.filter(t => !t.isDark || t.category === 'light').length})` },
              { id: 'retro', label: `🕹️ Retro & O'yin (${THEME_LIST.filter(t => t.category === 'retro').length})` }
            ].map((cat) => {
              const isSelected = selectedThemeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedThemeCat(cat.id);
                    setThemePage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-xs'
                      : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] border-[var(--sub-alt)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtered Themes Grid */}
        {(() => {
          const query = themeSearch.toLowerCase().trim();
          const filtered = THEME_LIST.filter((t) => {
            const matchesCategory =
              selectedThemeCat === 'all' ||
              t.category === selectedThemeCat ||
              (selectedThemeCat === 'light' && !t.isDark);
            if (!matchesCategory) return false;
            if (!query) return true;
            return (
              t.name.toLowerCase().includes(query) ||
              t.description.toLowerCase().includes(query) ||
              t.categoryName.toLowerCase().includes(query) ||
              (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
            );
          });

          const totalPages = Math.ceil(filtered.length / THEMES_PER_PAGE) || 1;
          const safePage = Math.min(themePage, totalPages);
          const paginated = filtered.slice(
            (safePage - 1) * THEMES_PER_PAGE,
            safePage * THEMES_PER_PAGE
          );

          if (filtered.length === 0) {
            return (
              <div className="p-8 text-center rounded-2xl bg-[var(--sub-alt)]/30 border border-dashed border-[var(--sub-alt)] space-y-2">
                <p className="text-sm font-semibold text-[var(--text-color)]">
                  "{themeSearch}" so'rovi bo'yicha hech qanday mavzu topilmadi
                </p>
                <p className="text-xs text-[var(--sub-color)]">
                  Boshqa so'z bilan qidirib ko'ring yoki barcha kategoriyalarni oching.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setThemeSearch('');
                    setSelectedThemeCat('all');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--main-color)] text-white text-xs font-semibold cursor-pointer"
                >
                  Qidiruvni tozalash
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--sub-color)] px-1">
                <span>
                  Topildi: <strong className="text-[var(--text-color)]">{filtered.length}</strong> ta mavzu
                </span>
                <span>
                  Sahifa <strong className="text-[var(--text-color)]">{safePage}</strong> / {totalPages}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {paginated.map((t: ThemeConfig) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as ThemeMode)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        isActive
                          ? 'border-[var(--main-color)] bg-[var(--sub-alt)]/75 ring-2 ring-[var(--main-color)]/50 shadow-md'
                          : 'border-[var(--sub-alt)]/80 bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/35 hover:border-[var(--sub-alt)]'
                      }`}
                    >
                      {/* Top: Header & Status Check */}
                      <div className="flex items-start justify-between gap-2 mb-2 w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-xs flex items-center justify-center"
                            style={{ backgroundColor: t.mainColor }}
                          >
                            {t.isDark ? (
                              <Moon className="w-2.5 h-2.5 text-white/90" />
                            ) : (
                              <Sun className="w-2.5 h-2.5 text-white/90" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-[var(--text-color)] truncate">
                            {t.name}
                          </span>
                        </div>

                        {isActive ? (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--main-color)] text-[var(--bg-color,#060913)] shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[var(--sub-alt)] text-[var(--sub-color)]">
                            {t.categoryName || t.category}
                          </span>
                        )}
                      </div>

                      {/* Middle: Short Description */}
                      <p className="text-[11px] text-[var(--sub-color)] leading-snug line-clamp-2 mb-3">
                        {t.description}
                      </p>

                      {/* Bottom: Mini Interactive Palette Preview & Sample Typing Text */}
                      <div
                        className="w-full p-2 rounded-xl border border-white/10 flex items-center justify-between"
                        style={{ backgroundColor: t.bg }}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-mono font-medium">
                          <span style={{ color: t.correctColor }}>tez</span>
                          <span style={{ color: t.subColor }}>yozish</span>
                          <span
                            className="inline-block w-1.5 h-3.5 rounded-xs animate-pulse"
                            style={{ backgroundColor: t.caretColor }}
                          />
                        </div>

                        {/* 3 Color Dots */}
                        <div className="flex items-center -space-x-1 shrink-0">
                          <div
                            className="w-3 h-3 rounded-full border border-black/30 shadow-xs"
                            style={{ backgroundColor: t.mainColor }}
                            title="Asosiy rang"
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-black/30"
                            style={{ backgroundColor: t.cardBg }}
                            title="Karta"
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-black/30"
                            style={{ backgroundColor: t.caretColor }}
                            title="Kursor"
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--sub-alt)]/60">
                  <div className="flex items-center gap-1.5">
                    {/* Jump to first page */}
                    {safePage > 2 && (
                      <button
                        type="button"
                        onClick={() => setThemePage(1)}
                        className="px-2.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-semibold cursor-pointer transition-colors"
                        title="Birinchi sahifa"
                      >
                        « 1
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setThemePage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Oldingi</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && safePage > 3) {
                        pageNum = safePage - 3 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setThemePage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            safePage === pageNum
                              ? 'bg-[var(--main-color)] text-white shadow-xs'
                              : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setThemePage((p) => Math.min(totalPages, p + 1))}
                      className="px-3.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Keyingi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Jump to last page */}
                    {safePage < totalPages - 1 && (
                      <button
                        type="button"
                        onClick={() => setThemePage(totalPages)}
                        className="px-2.5 py-2 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] text-xs font-semibold cursor-pointer transition-colors"
                        title="Oxirgi sahifa"
                      >
                        {totalPages} »
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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

      {/* Device Compatibility & Responsive Calibration */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center text-xl shrink-0">
              {currentDevice.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2 font-mono">
                <span>avtomatik qurilma moslashuvi</span>
              </h3>
              <p className="text-xs text-[var(--sub-color)] font-mono">
                Aniqlandi: <strong className="text-[var(--text-color)]">{currentDevice.name}</strong> ({currentDevice.width}×{currentDevice.height}px, DPR: {currentDevice.dpr})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={recalibrate}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--main-color)] text-[var(--bg-color)] text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>⚡ Qayta moslashtirish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tape Mode (Monkeytype style horizontal conveyor) */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2 font-mono">
            <Film className="w-4 h-4 text-[var(--main-color)]" />
            <span>tape mode</span>
          </h3>
          <div className="flex items-center bg-[var(--sub-alt)] p-1 rounded-xl border border-[var(--sub-color)]/20">
            {(['off', 'letter', 'word', 'drum'] as TapeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTapeMode(mode)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  tapeMode === mode
                    ? 'bg-[var(--main-color)] text-white shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {mode === 'drum' ? 'drum (baraban)' : mode}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--sub-color)] font-mono leading-relaxed mt-2">
          Lenta rejimlari: gorizontal oqim (<strong>word</strong> / <strong>letter</strong>) yoki markaziy aylanuvchi futuristik monoxrom doiraviy baraban (<strong>drum</strong>). Baraban rejimida matn aylana bo‘ylab joylashadi va har bir belgi yozilganda silliq aylanib boradi!
        </p>

        <div className="mt-4 pt-3 border-t border-[var(--sub-alt)] flex items-center justify-between text-xs text-[var(--sub-color)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse" />
            <span>Holat: <strong className="text-[var(--text-color)] font-mono uppercase">{tapeMode}</strong></span>
          </span>
          <span className="font-mono text-[11px] opacity-75">
            {tapeMode === 'off' && '3 qatorli klassik vertikal rejim'}
            {tapeMode === 'letter' && 'Harfma-harf gorizontal oqim (Letter stream)'}
            {tapeMode === 'word' && 'Soʻzma-soʻz gorizontal lenta (Word scroll)'}
            {tapeMode === 'drum' && 'Baraban (Rotary Drum) – Doiraviy aylanuvchi futuristik baraban'}
          </span>
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
