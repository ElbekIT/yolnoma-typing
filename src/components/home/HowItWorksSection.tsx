import React from 'react';
import { SlidersHorizontal, Keyboard, Award, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HowItWorksSectionProps {
  onStartTyping: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartTyping }) => {
  const { t } = useI18n();

  const steps = [
    {
      num: t('step1Num'),
      icon: SlidersHorizontal,
      title: t('step1Title'),
      desc: t('step1Desc'),
      accent: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30'
    },
    {
      num: t('step2Num'),
      icon: Keyboard,
      title: t('step2Title'),
      desc: t('step2Desc'),
      accent: 'from-teal-500/20 to-emerald-500/20',
      iconColor: 'text-teal-400',
      borderColor: 'border-teal-500/30'
    },
    {
      num: t('step3Num'),
      icon: Award,
      title: t('step3Title'),
      desc: t('step3Desc'),
      accent: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto py-12 sm:py-16 px-3 sm:px-6">
      <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)]/70 p-6 sm:p-10 lg:p-12">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] text-[var(--main-color)] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('howItWorksBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-color)] tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[var(--sub-color)] mt-2.5">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-[var(--bg-color)]/70 border border-[var(--sub-alt)] p-6 flex flex-col justify-between hover:border-[var(--main-color)]/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-[var(--sub-alt)]/70 flex items-center justify-center ${step.iconColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black font-mono text-[var(--main-color)]/30 group-hover:text-[var(--main-color)]/60 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-color)] mb-2 group-hover:text-[var(--main-color)] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                {/* Subtle Step arrow indicator on desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[var(--main-color)]/40 pointer-events-none">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            onClick={onStartTyping}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] font-bold text-base transition-colors cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t('tryNowBtn')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
