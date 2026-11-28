import React from 'react';
import {
 Zap,
 Timer,
 Trophy,
 Swords,
 Code2,
 BookOpen,
 ArrowRight,
 ChevronRight
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface InteractiveModesHubProps {
 onStartMode: (mode: string) => void;
 onGoToBattle: () => void;
 onGoToLessons: () => void;
 onGoToLeaderboard: () => void;
}

export const InteractiveModesHub: React.FC<InteractiveModesHubProps> = ({
 onStartMode,
 onGoToBattle,
 onGoToLeaderboard
}) => {
 const { uiLanguage } = useI18n();

 const modes = [
 {
 id: '15',
 title: uiLanguage === 'ru' ? '15s Блиц' : uiLanguage === 'en' ? '15s Blitz' : '15s Blitz',
 desc: uiLanguage === 'ru' ? 'Короткий спринт для максимального WPM.' : uiLanguage === 'en' ? 'Short sprint for peak WPM reflexes.' : 'Tezkor reaksiya va maksimal WPM uchun.',
 tag: 'BLITZ',
 icon: Zap,
 iconColor: 'text-amber-400',
 onClick: () => onStartMode('15')
 },
 {
 id: '30',
 title: uiLanguage === 'ru' ? '30s Стандарт' : uiLanguage === 'en' ? '30s Standard' : '30s Standart',
 desc: uiLanguage === 'ru' ? 'Золотой стандарт точности и скорости.' : uiLanguage === 'en' ? 'Gold standard of speed and precision.' : 'Aniqlik va tezlikning asosiy mezoni.',
 tag: 'TOP',
 icon: Timer,
 iconColor: 'text-cyan-400',
 onClick: () => onStartMode('30')
 },
 {
 id: '60',
 title: uiLanguage === 'ru' ? '60s Марафон' : uiLanguage === 'en' ? '60s Marathon' : '60s Marafon',
 desc: uiLanguage === 'ru' ? 'Полная минута стабильной печати.' : uiLanguage === 'en' ? 'Full minute of sustained stamina.' : "1 daqiqalik barqaror tezlik sinovi.",
 tag: 'PRO',
 icon: Trophy,
 iconColor: 'text-emerald-400',
 onClick: () => onStartMode('60')
 },
 {
 id: 'battle',
 title: uiLanguage === 'ru' ? '1v1 Арена' : uiLanguage === 'en' ? '1v1 Speedway' : '1v1 Jang',
 desc: uiLanguage === 'ru' ? 'Дуэль в реальном времени с друзьями.' : uiLanguage === 'en' ? 'Real-time PvP race with friends.' : "Do'stlar bilan real-vaqtda duel.",
 tag: 'LIVE',
 icon: Swords,
 iconColor: 'text-rose-400',
 onClick: onGoToBattle
 },
 {
 id: 'code',
 title: uiLanguage === 'ru' ? 'Код Режим' : uiLanguage === 'en' ? 'Developer Code' : 'Dasturchi Kodi',
 desc: uiLanguage === 'ru' ? 'Синтаксис JS, Python, C++ и HTML.' : uiLanguage === 'en' ? 'Real syntax for JS, Python, C++.' : 'Python, JS, C++ va maxsus belgilar.',
 tag: 'DEV',
 icon: Code2,
 iconColor: 'text-purple-400',
 onClick: () => onStartMode('code')
 },
 {
 id: 'quotes',
 title: uiLanguage === 'ru' ? 'Цитаты' : uiLanguage === 'en' ? 'Wise Quotes' : 'Iqtiboslar',
 desc: uiLanguage === 'ru' ? 'Классические цитаты и глубокие мысли.' : uiLanguage === 'en' ? 'Inspiring quotes and literature.' : 'Allomalar hikmatlari va adabiy matnlar.',
 tag: 'TEXT',
 icon: BookOpen,
 iconColor: 'text-yellow-400',
 onClick: () => onStartMode('quotes')
 }
 ];

 const tiers = [
 { title: 'Boshlovchi', speed: '0–30', icon: '🥉' },
 { title: 'Havaskor', speed: '31–60', icon: '🥈' },
 { title: 'Usta', speed: '61–90', icon: '🥇' },
 { title: 'Chempion', speed: '91–110', icon: '💎' },
 { title: 'Afsonaviy', speed: '110+', icon: '👑' }
 ];

 return (
 <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
 <div>
 <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-color)] tracking-tight">
 {uiLanguage === 'ru' ? 'Режимы тестирования' : uiLanguage === 'en' ? 'Practice Modes' : 'Sinov Rejimlari'}
 </h2>
 <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-0.5">
 {uiLanguage === 'ru'
 ? 'Выберите формат от 15с спринта до живой дуэли'
 : uiLanguage === 'en'
 ? 'Pick a format from a 15s sprint to live duels'
 : '15 soniyalik sprintdan jonli 1v1 poygagacha'}
 </p>
 </div>

 <button
 type="button"
 onClick={onGoToLeaderboard}
 className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--main-color)] hover:underline cursor-pointer self-start sm:self-auto"
 >
 <span>{uiLanguage === 'ru' ? 'Топ 100 Рейтинг' : uiLanguage === 'en' ? 'Full Leaderboard' : 'Milliy Reyting (Top 100)'}</span>
 <ChevronRight className="w-3.5 h-3.5"/>
 </button>
 </div>

 {/* Borderless 3-column tonal surface grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
 {modes.map((mode) => {
 const Icon = mode.icon;
 return (
 <button
 key={mode.id}
 type="button"
 onClick={mode.onClick}
 className="text-left rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/75 p-5 transition-colors cursor-pointer group flex flex-col justify-between gap-4"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl bg-[var(--sub-alt)]/80 flex items-center justify-center ${mode.iconColor} shrink-0`}>
 <Icon className="w-5 h-5"/>
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-bold text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
 {mode.title}
 </h3>
 <span className="text-[10px] font-mono font-bold text-[var(--sub-color)] uppercase">
 {mode.tag}
 </span>
 </div>
 </div>

 <ArrowRight className="w-4 h-4 text-[var(--sub-color)] group-hover:text-[var(--main-color)] transition-colors shrink-0 mt-1"/>
 </div>

 <p className="text-xs text-[var(--sub-color)] leading-relaxed">
 {mode.desc}
 </p>
 </button>
 );
 })}
 </div>

 {/* Compact Borderless WPM Mastery Strip */}
 <div className="rounded-2xl bg-[var(--card-bg)] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 <div className="shrink-0">
 <div className="text-xs font-mono font-bold text-[var(--main-color)] uppercase">WPM Darajalari</div>
 <div className="text-sm font-bold text-[var(--text-color)]">Qaysi unvonga yetdingiz?</div>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
 {tiers.map((tier) => (
 <button
 key={tier.title}
 type="button"
 onClick={() => onStartMode('30')}
 className="rounded-xl bg-[var(--sub-alt)]/45 hover:bg-[var(--sub-alt)] px-3 py-2 text-left transition-colors cursor-pointer"
 >
 <div className="flex items-center justify-between text-xs font-bold text-[var(--text-color)]">
 <span>{tier.title}</span>
 <span>{tier.icon}</span>
 </div>
 <div className="text-[11px] font-mono text-[var(--sub-color)] mt-0.5">{tier.speed} WPM</div>
 </button>
 ))}
 </div>
 </div>
 </section>
 );
};
