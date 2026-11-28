import React from 'react';
import { SlidersHorizontal, Keyboard, Award, Play } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HowItWorksSectionProps {
 onStartTyping: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartTyping }) => {
 const { t } = useI18n();

 const steps = [
 { num: t('step1Num'), icon: SlidersHorizontal, title: t('step1Title'), desc: t('step1Desc'), color: 'text-cyan-400' },
 { num: t('step2Num'), icon: Keyboard, title: t('step2Title'), desc: t('step2Desc'), color: 'text-teal-400' },
 { num: t('step3Num'), icon: Award, title: t('step3Title'), desc: t('step3Desc'), color: 'text-emerald-400' }
 ];

 return (
 <section className="w-full max-w-7xl mx-auto px-2 sm:px-4">
 <div className="rounded-2xl bg-[var(--card-bg)] p-6 sm:p-8 space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-color)] tracking-tight">
 {t('howItWorksTitle')}
 </h2>
 <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">{t('howItWorksSubtitle')}</p>
 </div>
 <button
 onClick={onStartTyping}
 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
 >
 <Play className="w-4 h-4 fill-current"/>
 <span>{t('tryNowBtn')}</span>
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
 {steps.map((step, idx) => {
 const Icon = step.icon;
 return (
 <div key={idx} className="rounded-xl bg-[var(--sub-alt)]/40 p-5 space-y-3">
 <div className="flex items-center justify-between">
 <div className={`w-9 h-9 rounded-lg bg-[var(--card-bg)] flex items-center justify-center ${step.color}`}>
 <Icon className="w-4 h-4"/>
 </div>
 <span className="text-xl font-black font-mono text-[var(--sub-color)]/40">{step.num}</span>
 </div>
 <h3 className="text-sm sm:text-base font-bold text-[var(--text-color)]">{step.title}</h3>
 <p className="text-xs text-[var(--sub-color)] leading-relaxed">{step.desc}</p>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
};
