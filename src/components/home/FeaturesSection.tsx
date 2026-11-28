import React from 'react';
import { Globe, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export const FeaturesSection: React.FC = () => {
 const { t } = useI18n();

 const features = [
 { icon: Globe, title: t('featLanguagesTitle'), desc: t('featLanguagesDesc'), color: 'text-cyan-400' },
 { icon: ShieldCheck, title: t('featFreeTitle'), desc: t('featFreeDesc'), color: 'text-emerald-400' },
 { icon: Sparkles, title: t('featAnimationsTitle'), desc: t('featAnimationsDesc'), color: 'text-amber-400' },
 { icon: Activity, title: t('featStatsTitle'), desc: t('featStatsDesc'), color: 'text-purple-400' }
 ];

 return (
 <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 space-y-5">
 <div className="max-w-xl">
 <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-color)] tracking-tight">
 {t('featuresTitle')}
 </h2>
 <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
 {t('featuresSubtitle')}
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
 {features.map((feat, idx) => {
 const Icon = feat.icon;
 return (
 <div key={idx} className="rounded-2xl bg-[var(--card-bg)] p-5 space-y-3">
 <div className={`w-10 h-10 rounded-xl bg-[var(--sub-alt)]/70 flex items-center justify-center ${feat.color}`}>
 <Icon className="w-5 h-5"/>
 </div>
 <h3 className="text-sm sm:text-base font-bold text-[var(--text-color)]">{feat.title}</h3>
 <p className="text-xs text-[var(--sub-color)] leading-relaxed">{feat.desc}</p>
 </div>
 );
 })}
 </div>
 </section>
 );
};
