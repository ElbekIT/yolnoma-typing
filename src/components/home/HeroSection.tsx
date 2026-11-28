import React from 'react';
import { ArrowRight, Swords, GraduationCap, Languages } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HeroSectionProps {
 onStartTyping: () => void;
 onGoToBattle: () => void;
 onOpenLogin: () => void;
 onGoToLessons?: () => void;
 onGoToLeaderboard?: () => void;
 onGoToEnglish?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
 onStartTyping,
 onGoToBattle,
 onGoToLessons,
 onGoToEnglish
}) => {
 const { uiLanguage } = useI18n();

 return (
 <section className="w-full max-w-5xl mx-auto pt-4 sm:pt-8 pb-4 px-2 sm:px-4 text-center flex flex-col items-center space-y-6">
 {/* Subtle Mono Kicker */}
 <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--card-bg)] text-[var(--main-color)] text-xs font-mono font-semibold">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
 <span>
 {uiLanguage === 'ru'
 ? 'Платформа скоростной печати №1 в Узбекистане'
 : uiLanguage === 'en'
 ? '#1 Touch Typing Platform in Uzbekistan'
 : "O'zbekistondagi #1 Tez Yozish Platformasi"}
 </span>
 </div>

 {/* Main Title */}
 <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight leading-[1.14] max-w-3xl">
 {uiLanguage === 'ru' ? (
 <>
 Проверьте скорость печати и освойте{' '}
 <span className="text-[var(--main-color)]">10-пальцевый метод</span>
 </>
 ) : uiLanguage === 'en' ? (
 <>
 Test Your Typing Speed & Master{' '}
 <span className="text-[var(--main-color)]">10-Finger Technique</span>
 </>
 ) : (
 <>
 Klaviaturada <span className="text-[var(--main-color)]">Tez Yozish</span> va{' '}
 <span className="text-[var(--main-color)]">10 Barmoq</span> Mahorati
 </>
 )}
 </h1>

 {/* Narrative Subtitle */}
 <p className="text-sm sm:text-base text-[var(--sub-color)] leading-relaxed max-w-xl font-normal">
 {uiLanguage === 'ru'
 ? 'Чистый и быстрый тренажер без лишнего шума. Измеряйте WPM, соревнуйтесь 1 на 1 и поднимайтесь в рейтинге.'
 : uiLanguage === 'en'
 ? 'Clean, distraction-free typing arena. Measure WPM, race friends 1v1, and climb the national leaderboard.'
 : "Ortiqcha shovqinsiz yengil arena. WPM tezligingizni o'lchang, 1v1 poyga qiling va milliy reytingda peshqadam bo'ling."}
 </p>

 {/* Primary CTA + Borderless Secondary Actions */}
 <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
 <button
 type="button"
 onClick={onStartTyping}
 className="px-7 py-3.5 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] font-black text-sm sm:text-base transition-all inline-flex items-center gap-2.5 cursor-pointer"
 >
 <span>
 {uiLanguage === 'ru' ? 'Начать тест' : uiLanguage === 'en' ? 'Start Typing' : 'Yozishni boshlash'}
 </span>
 <ArrowRight className="w-4 h-4 stroke-[2.5]"/>
 </button>

 <button
 type="button"
 onClick={onGoToBattle}
 className="px-5 py-3.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-[var(--text-color)] font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
 >
 <Swords className="w-4 h-4 text-rose-400"/>
 <span>{uiLanguage === 'ru' ? '1v1 Арена' : uiLanguage === 'en' ? '1v1 Arena' : '1v1 Jang'}</span>
 </button>

 {onGoToLessons && (
 <button
 type="button"
 onClick={onGoToLessons}
 className="px-5 py-3.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-[var(--text-color)] font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
 >
 <GraduationCap className="w-4 h-4 text-sky-400"/>
 <span>{uiLanguage === 'ru' ? '10 пальцев' : uiLanguage === 'en' ? 'Lessons' : '10 Barmoq'}</span>
 </button>
 )}

 {onGoToEnglish && (
 <button
 type="button"
 onClick={onGoToEnglish}
 className="px-5 py-3.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-emerald-400 font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
 >
 <Languages className="w-4 h-4"/>
 <span>{uiLanguage === 'ru' ? 'English · Бесплатно' : uiLanguage === 'en' ? 'English · Free' : 'Ingliz tili · Bepul'}</span>
 </button>
 )}
 </div>

 {/* Minimalist Inline Metrics (No bordered boxes) */}
 <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-xs font-mono text-[var(--sub-color)]">
 <span><strong className="text-[var(--text-color)]">125+</strong> til va kod</span>
 <span className="opacity-30">•</span>
 <span><strong className="text-[var(--text-color)]">1v1</strong> jonli duel</span>
 <span className="opacity-30">•</span>
 <span><strong className="text-[var(--text-color)]">35 ta</strong> bepul ingliz darsi</span>
 <span className="opacity-30">•</span>
 <span className="text-emerald-400 font-bold">100% bepul</span>
 </div>
 </section>
 );
};
