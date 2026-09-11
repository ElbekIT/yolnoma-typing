import React from 'react';
import { Play, Swords, Sparkles, Zap, Globe, Shield, Trophy } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { MiniLeaderboard } from './MiniLeaderboard';

interface HeroSectionProps {
  onStartTyping: () => void;
  onGoToBattle: () => void;
  onViewFullLeaderboard: () => void;
  onOpenLogin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartTyping,
  onGoToBattle,
  onViewFullLeaderboard,
  onOpenLogin
}) => {
  const { t } = useI18n();

  return (
    <section className="relative w-full max-w-7xl mx-auto pt-6 sm:pt-10 pb-8 sm:pb-12 px-3 sm:px-6">
      {/* Background Decorative Neon Gradients */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Attention-Grabbing Hero Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5 sm:space-y-6">
          {/* Small Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-emerald-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-sans font-medium tracking-wide shadow-sm shadow-amber-500/10 animate-fade-in">
            <span className="text-base leading-none">⚡️</span>
            <span>{t('heroBadge').replace('⚡️ ', '')}</span>
          </div>

          {/* Large H1 Catchy Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-[1.15] sm:leading-[1.18]">
            <span>{t('heroTitlePart1')}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 drop-shadow-[0_2px_18px_rgba(6,182,212,0.35)]">
              {t('heroTitleHighlight')}
            </span>
            <span>{t('heroTitlePart2')}</span>
          </h1>

          {/* Short Narrative Description */}
          <p className="text-sm sm:text-base md:text-lg text-gray-300/90 leading-relaxed max-w-2xl font-normal">
            {t('heroDesc')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1 w-full sm:w-auto">
            {/* Primary START Button */}
            <button
              onClick={onStartTyping}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#090d16] font-bold text-base transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Play className="w-5 h-5 fill-current text-[#090d16] transition-transform group-hover:scale-110" />
              <span>{t('startTypingBtn')}</span>
            </button>

            {/* Secondary BATTLE Button */}
            <button
              onClick={onGoToBattle}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#101726]/85 hover:bg-[#152033] border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
            >
              <Swords className="w-4 h-4 text-cyan-400 group-hover:text-emerald-300 transition-colors" />
              <span>{t('battleArenaBtn')}</span>
            </button>
          </div>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-white/10 w-full max-w-xl text-gray-400 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs text-gray-300 font-sans">{t('statLanguages')}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs text-gray-300 font-sans">{t('statMultiplayer')}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs text-gray-300 font-sans">{t('statFree')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Mini-Leaderboard Card */}
        <div className="lg:col-span-5 w-full">
          <MiniLeaderboard
            onViewFullLeaderboard={onViewFullLeaderboard}
            onOpenLogin={onOpenLogin}
          />
        </div>
      </div>
    </section>
  );
};
