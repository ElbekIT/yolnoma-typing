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
      <div className="rounded-3xl bg-gradient-to-b from-[#101726]/90 to-[#0c121e]/90 border border-cyan-500/20 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl">
        {/* Background Subtle Gradient Blurs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('howItWorksBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-2.5">
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
                className="relative rounded-2xl bg-[#090d16]/70 border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.accent} border ${step.borderColor} flex items-center justify-center ${step.iconColor} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black font-mono text-cyan-400/30 group-hover:text-cyan-400/60 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                {/* Subtle Step arrow indicator on desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-500/40 pointer-events-none">
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
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#090d16] font-bold text-base transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 active:scale-95 cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-current text-[#090d16] transition-transform group-hover:scale-110" />
            <span>{t('tryNowBtn')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
