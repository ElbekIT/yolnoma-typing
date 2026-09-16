import React from 'react';
import { Play, Swords, Sparkles, Zap, Globe, Shield, BookOpen, GraduationCap, ChevronRight, Keyboard, Trophy, Rocket } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HeroSectionProps {
  onStartTyping: () => void;
  onGoToBattle: () => void;
  onOpenLogin: () => void;
  onGoToSentences?: () => void;
  onGoToLessons?: () => void;
  onGoToLeaderboard?: () => void;
  onGoToSpace?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartTyping,
  onGoToBattle,
  onOpenLogin,
  onGoToSentences,
  onGoToLessons,
  onGoToLeaderboard,
  onGoToSpace
}) => {
  const { t } = useI18n();

  return (
    <section className="relative w-full max-w-7xl mx-auto pt-4 sm:pt-8 pb-6 sm:pb-8 px-3 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Attention-Grabbing Hero Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4 sm:space-y-5">
          {/* Small Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] text-[var(--main-color)] text-xs font-mono font-medium">
            <span className="text-sm leading-none">⚡️</span>
            <span>{t('heroBadge').replace('⚡️ ', '')}</span>
          </div>

          {/* Large H1 Catchy Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-color)] tracking-tight leading-[1.18]">
            <span>{t('heroTitlePart1')}</span>
            <span className="text-[var(--main-color)]">
              {t('heroTitleHighlight')}
            </span>
            <span>{t('heroTitlePart2')}</span>
          </h1>

          {/* Short Narrative Description */}
          <p className="text-sm sm:text-base text-[var(--sub-color)] leading-relaxed max-w-2xl font-normal">
            {t('heroDesc')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1 w-full sm:w-auto">
            {/* Primary START Button */}
            <button
              onClick={onStartTyping}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              <span>{t('startTypingBtn')}</span>
            </button>

            {/* Secondary BATTLE Button */}
            <button
              onClick={onGoToBattle}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Swords className="w-4 h-4 text-rose-400 transition-colors" />
              <span>{t('battleArenaBtn')}</span>
            </button>
          </div>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-[var(--sub-alt)]/40 w-full max-w-xl text-[var(--sub-color)] font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--sub-alt)]/50 text-cyan-400 flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs text-[var(--sub-color)] font-sans">{t('statLanguages')}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--sub-alt)]/50 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs text-[var(--sub-color)] font-sans">{t('statMultiplayer')}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--sub-alt)]/50 text-amber-400 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs text-[var(--sub-color)] font-sans">{t('statFree')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Practice Training Hub Card */}
        <div className="lg:col-span-5 w-full">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)]/60 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--sub-alt)]/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-color)]">
                  Mashg'ulotlar Markazi
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Tezkor Kirish
              </span>
            </div>

            <div className="space-y-2.5">
              {/* English Sentences Training */}
              <button
                type="button"
                onClick={onGoToSentences || onStartTyping}
                className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-color)] hover:bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">Inglizcha Jumlalar</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300">
                        0 dan IELTS 9
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--sub-color)]">
                      Yozib o'rganish, 2 tomonlama tarjima va avto-oqim
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-emerald-400 transition-colors" />
              </button>

              {/* Classic Speed Typing */}
              <button
                type="button"
                onClick={onStartTyping}
                className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-color)] hover:bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">Klassik Tez Yozish Sinovi</span>
                    <p className="text-[11px] text-[var(--sub-color)]">
                      15s, 30s, 60s vaqt rejimlari, WPM va aniqlik
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* 10-Finger Lessons */}
              <button
                type="button"
                onClick={onGoToLessons || onStartTyping}
                className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-color)] hover:bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">10 Barmoq Mashqlari</span>
                    <p className="text-[11px] text-[var(--sub-color)]">
                      Klaviaturaga qaramay yozish saboqlari
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-amber-400 transition-colors" />
              </button>

              {/* 1v1 Speedway Battle */}
              <button
                type="button"
                onClick={onGoToBattle}
                className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-color)] hover:bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <Swords className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">Speedway 1v1 Arena</span>
                    <p className="text-[11px] text-[var(--sub-color)]">
                      Do'stlar bilan real vaqtda poyga va jang
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-rose-400 transition-colors" />
              </button>

              {/* Koinot Jangi (Space Shooter) */}
              {onGoToSpace && (
                <button
                  type="button"
                  onClick={onGoToSpace}
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-color)] hover:bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">Koinot Jangi (Space Battle)</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300">
                          ARKADA
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--sub-color)]">
                        Lazerlar bilan dushman kemalarini portlatish va rekord o'rnatish
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-cyan-400 transition-colors" />
                </button>
              )}

              {/* Leaderboard / Peshqadamlar */}
              {onGoToLeaderboard && (
                <button
                  type="button"
                  onClick={onGoToLeaderboard}
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-color)] hover:bg-[var(--sub-alt)]/50 border border-[var(--sub-alt)]/50 text-left transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">Milliy Reyting (Top 100)</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--sub-color)]">
                        O'zbekistonning eng tezkor yozuvchilari peshqadami
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-amber-400 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
