import React from 'react';
import {
  Zap,
  Timer,
  Trophy,
  Swords,
  Code2,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
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
  onGoToLessons,
  onGoToLeaderboard
}) => {
  const { uiLanguage } = useI18n();

  const modes = [
    {
      id: '15',
      title: uiLanguage === 'ru' ? '15s Блиц' : uiLanguage === 'en' ? '15s Blitz' : '15s Blitz Sinov',
      subtitle: uiLanguage === 'ru' ? 'Взрывная скорость' : uiLanguage === 'en' ? 'Explosive Speed' : 'Portlovchi Reaktsiya',
      desc: uiLanguage === 'ru' ? 'Короткий спринт для проверки рефлексов и максимального WPM.' : uiLanguage === 'en' ? 'Short sprint to test raw typing reflexes and peak WPM.' : "Barmoq chaqqonligi va maksimal WPM tezligini aniqlash uchun eng tezkor sinov.",
      badge: 'BLITZ',
      icon: Zap,
      gradient: 'from-amber-500/20 via-orange-500/15 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-400/70',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      iconColor: 'text-amber-400',
      onClick: () => onStartMode('15')
    },
    {
      id: '30',
      title: uiLanguage === 'ru' ? '30s Стандарт' : uiLanguage === 'en' ? '30s Standard' : '30s Standart Sinov',
      subtitle: uiLanguage === 'ru' ? 'Официальный зачёт' : uiLanguage === 'en' ? 'Official Benchmark' : 'Rasmiy Reyting Sinovi',
      desc: uiLanguage === 'ru' ? 'Золотой стандарт соревнований. Оптимальный баланс точности и темпа.' : uiLanguage === 'en' ? 'The competitive gold standard. Best balance of speed and precision.' : "Dunyo bo'ylab eng ko'p tanlangan rejim. Aniqlik va tezlikning ideal balansi.",
      badge: 'TOP CHOICE',
      icon: Timer,
      gradient: 'from-cyan-500/20 via-blue-500/15 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400/70',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      iconColor: 'text-cyan-400',
      onClick: () => onStartMode('30')
    },
    {
      id: '60',
      title: uiLanguage === 'ru' ? '60s Марафон' : uiLanguage === 'en' ? '60s Marathon' : '60s Marafon',
      subtitle: uiLanguage === 'ru' ? 'Выносливость и фокус' : uiLanguage === 'en' ? 'Endurance Test' : 'Chidamlilik va Mahorat',
      desc: uiLanguage === 'ru' ? 'Полная минута безошибочной печати для настоящих мастеров клавиатуры.' : uiLanguage === 'en' ? 'Full minute of sustained typing stamina for true keyboard masters.' : "To'liq 1 daqiqalik yuqori temp. Haqiqiy typing ustalari uchun mustahkam sinov.",
      badge: 'PRO RANK',
      icon: Trophy,
      gradient: 'from-emerald-500/20 via-teal-500/15 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/70',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      onClick: () => onStartMode('60')
    },
    {
      id: 'battle',
      title: uiLanguage === 'ru' ? '1v1 Арена' : uiLanguage === 'en' ? '1v1 Speedway' : 'Speedway 1v1 Jang',
      subtitle: uiLanguage === 'ru' ? 'Битва с соперником' : uiLanguage === 'en' ? 'Live PvP Race' : "Jonli Raqobatli Poyga",
      desc: uiLanguage === 'ru' ? 'Сражайтесь в реальном времени с друзьями или случайными игроками.' : uiLanguage === 'en' ? 'Race head-to-head in real time with friends or online typists.' : "Do'stlaringizga havola yuboring yoki onlayn raqiblar bilan real vaqtda duel qiling.",
      badge: 'LIVE PVP',
      icon: Swords,
      gradient: 'from-rose-500/20 via-purple-500/15 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-400/70',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      iconColor: 'text-rose-400',
      onClick: onGoToBattle
    },
    {
      id: 'code',
      title: uiLanguage === 'ru' ? 'Dev Kod Rejimi' : uiLanguage === 'en' ? 'Developer Code' : 'Dasturchi Rejimi',
      subtitle: uiLanguage === 'ru' ? 'Синтаксис языков' : uiLanguage === 'en' ? 'Coding Syntax' : 'Kod va Maxsus Belgilar',
      desc: uiLanguage === 'ru' ? 'Печатайте код на JS, Python, HTML и C++. Быстрый ввод скобок и знаков.' : uiLanguage === 'en' ? 'Type real syntax for JS, Python, HTML, C++. Master brackets & symbols.' : "Python, JavaScript, C++ va SQL sintaksisi. Qavslar va belgilarni ko'rmasdan yozing.",
      badge: 'DEV MODE',
      icon: Code2,
      gradient: 'from-purple-500/20 via-indigo-500/15 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-400/70',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      iconColor: 'text-purple-400',
      onClick: () => onStartMode('code')
    },
    {
      id: 'quotes',
      title: uiLanguage === 'ru' ? 'Цитаты и Книги' : uiLanguage === 'en' ? 'Wise Quotes' : 'Hikmatli Iqtiboslar',
      subtitle: uiLanguage === 'ru' ? 'Глубокие мысли' : uiLanguage === 'en' ? 'Meaningful Text' : 'Tafakkur va Ma\'no',
      desc: uiLanguage === 'ru' ? 'Печатайте вдохновляющие цитаты великих авторов и классиков литературы.' : uiLanguage === 'en' ? 'Type famous quotes from history, science, literature, and philosophy.' : "Dunyo allomalari va adiblarining mashhur hikmatlari hamda teran fikrlari.",
      badge: 'WISDOM',
      icon: BookOpen,
      gradient: 'from-yellow-500/20 via-amber-500/15 to-transparent',
      borderColor: 'border-yellow-500/30 hover:border-yellow-400/70',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      iconColor: 'text-yellow-400',
      onClick: () => onStartMode('quotes')
    }
  ];

  const tiers = [
    {
      rank: '1',
      title: 'Yangi Boshlovchi',
      speed: '0 - 30 WPM',
      icon: '🥉',
      color: 'border-amber-700/50 bg-amber-950/20 text-amber-500',
      desc: "Klaviaturani o'rganish bosqichi"
    },
    {
      rank: '2',
      title: 'Havaskor Yozuvchi',
      speed: '31 - 60 WPM',
      icon: '🥈',
      color: 'border-slate-400/50 bg-slate-900/30 text-slate-300',
      desc: "Qaramasdan yozish ko'nikmasi"
    },
    {
      rank: '3',
      title: 'Professional Usta',
      speed: '61 - 90 WPM',
      icon: '🥇',
      color: 'border-yellow-500/50 bg-yellow-950/20 text-yellow-400',
      desc: "Ofis va dasturchilar darajasi"
    },
    {
      rank: '4',
      title: 'Kiber Chempion',
      speed: '91 - 110 WPM',
      icon: '💎',
      color: 'border-cyan-400/50 bg-cyan-950/20 text-cyan-300',
      desc: "O'zbekistonning Top 5% tezkorlari"
    },
    {
      rank: '5',
      title: 'Afsonaviy Tezkorlik',
      speed: '110+ WPM',
      icon: '👑',
      color: 'border-rose-400/60 bg-rose-950/20 text-rose-300',
      desc: "Absolyut rekordchilar ligasi"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-8">
      {/* 1. Header Section for Modes Hub */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--sub-alt)]/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--sub-alt)]/70 border border-[var(--sub-alt)] text-[var(--main-color)] text-xs font-mono font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {uiLanguage === 'ru' ? 'Выбирайте режим и прокачивайте WPM' : uiLanguage === 'en' ? 'Choose Mode & Level Up Your WPM' : 'Rejimni Tanlang va Mahoratingizni Oshiring'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-color)] tracking-tight">
            {uiLanguage === 'ru' ? 'Игровые Режимы и Тренировки' : uiLanguage === 'en' ? 'Interactive Modes & Arena Hub' : 'Tezkor Sinov Rejimlari va Jang Maydoni'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--sub-color)] mt-1">
            {uiLanguage === 'ru'
              ? 'Выберите подходящий формат — от молниеносного 15с спринта до реальной 1v1 дуэли.'
              : uiLanguage === 'en'
              ? 'Pick your battle format — from lightning 15s blitz sprints to live 1v1 PvP duels.'
              : "15 soniyalik chaqqon sprintlardan tortib real vaqtdagi 1v1 do'stlar dueliga qadar."}
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToLeaderboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-bold border border-[var(--sub-alt)] transition-all cursor-pointer self-start sm:self-auto shrink-0 group"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{uiLanguage === 'ru' ? 'Milliy Reyting (Top 100)' : uiLanguage === 'en' ? 'Top 100 Leaderboard' : 'Milliy Reyting (Top 100)'}</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 2. Grid of 6 Interactive Game Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              onClick={mode.onClick}
              className={`rounded-3xl bg-[var(--card-bg)] border ${mode.borderColor} p-5 sm:p-6 shadow-xs transition-colors cursor-pointer group flex flex-col justify-between select-none`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl bg-[var(--sub-alt)]/80 border border-[var(--sub-alt)] flex items-center justify-center ${mode.iconColor} shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${mode.badgeColor} uppercase tracking-wider`}>
                    {mode.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
                    {mode.title}
                  </h3>
                  <div className="text-[11px] font-mono font-semibold text-[var(--main-color)]">
                    {mode.subtitle}
                  </div>
                  <p className="text-xs text-[var(--sub-color)] leading-relaxed pt-1.5 font-normal">
                    {mode.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-5 mt-4 border-t border-[var(--sub-alt)]/50 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[var(--sub-color)] group-hover:text-[var(--text-color)] transition-colors">
                  {uiLanguage === 'ru' ? 'Нажмите для старта' : uiLanguage === 'en' ? 'Click to launch' : 'Boshlash uchun bosing'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[var(--sub-alt)]/80 text-[var(--text-color)] group-hover:bg-[var(--main-color)] group-hover:text-[var(--bg-color,#090d16)] flex items-center justify-center transition-colors shadow-xs">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Typing Mastery Tiers Showcase (Unvonlar & Darajalar) */}
      <div className="rounded-3xl bg-[var(--card-bg)]/85 border border-[var(--sub-alt)]/80 p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 mb-1">
              <Award className="w-4 h-4" />
              <span>{uiLanguage === 'ru' ? 'РАНГОВАЯ СИСТЕМА WPM' : uiLanguage === 'en' ? 'WPM RANKING TIERS' : 'WPM DARAJA VA UNVONLARI'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)]">
              {uiLanguage === 'ru' ? '5 Рангов Мастерства Печати' : uiLanguage === 'en' ? '5 Touch-Typing Mastery Ranks' : 'Klaviaturaning 5 ta Asosiy Unvoni'}
            </h3>
            <p className="text-xs text-[var(--sub-color)]">
              {uiLanguage === 'ru'
                ? 'Пройдите тест, чтобы определить свой текущий ранг и соревноваться за звание Легенды.'
                : uiLanguage === 'en'
                ? 'Take a test to reveal your current typing tier and grind your way to Legend.'
                : "Tezkorlik sinovini topshirib, o'z unvoningizni aniqlang va Afsonaviy ligaga ko'tariling."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onStartMode('30')}
            className="px-5 py-2.5 rounded-xl bg-[var(--main-color)] hover:brightness-110 text-[var(--bg-color,#090d16)] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[var(--main-color)]/20 active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{uiLanguage === 'ru' ? 'Узнать свой ранг' : uiLanguage === 'en' ? 'Check My Tier' : 'Darajangizni Sinang'}</span>
          </button>
        </div>

        {/* 5 Tier Cards Horizontal Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {tiers.map((tier) => (
            <div
              key={tier.rank}
              onClick={() => onStartMode('30')}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors cursor-pointer ${tier.color} shadow-xs`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tier.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/30">
                    Tier {tier.rank}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-[var(--text-color)]">
                  {tier.title}
                </div>
                <div className="text-[11px] font-mono font-extrabold mt-1">
                  {tier.speed}
                </div>
              </div>
              <div className="text-[10px] text-[var(--sub-color)] mt-2 pt-2 border-t border-white/10">
                {tier.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
