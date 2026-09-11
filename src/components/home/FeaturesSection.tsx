import React from 'react';
import { Globe, ShieldCheck, Sparkles, Activity, Layers } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export const FeaturesSection: React.FC = () => {
  const { t } = useI18n();

  const features = [
    {
      icon: Globe,
      title: t('featLanguagesTitle'),
      desc: t('featLanguagesDesc'),
      accent: 'from-cyan-500/20 via-blue-500/20 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
      iconColor: 'text-cyan-400',
      badge: '3 Tillarda'
    },
    {
      icon: ShieldCheck,
      title: t('featFreeTitle'),
      desc: t('featFreeDesc'),
      accent: 'from-emerald-500/20 via-teal-500/20 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
      iconColor: 'text-emerald-400',
      badge: '0 So\'m'
    },
    {
      icon: Sparkles,
      title: t('featAnimationsTitle'),
      desc: t('featAnimationsDesc'),
      accent: 'from-amber-500/20 via-orange-500/20 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-400/60',
      iconColor: 'text-amber-400',
      badge: 'Neon Dark'
    },
    {
      icon: Activity,
      title: t('featStatsTitle'),
      desc: t('featStatsDesc'),
      accent: 'from-purple-500/20 via-indigo-500/20 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-400/60',
      iconColor: 'text-purple-400',
      badge: 'Anti-Cheat'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto py-12 sm:py-16 px-3 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>{t('featuresBadge')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {t('featuresTitle')}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-2.5">
          {t('featuresSubtitle')}
        </p>
      </div>

      {/* Grid of 4 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className={`group relative rounded-2xl bg-[#101726]/80 hover:bg-[#131d31] border ${feat.borderColor} p-6 transition-all duration-200 shadow-lg shadow-black/40 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
            >
              {/* Top ambient hover glow */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feat.accent} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.accent} border border-white/10 flex items-center justify-center ${feat.iconColor} shadow-inner group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 font-semibold tracking-wide">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
