import React from 'react';
import {
  Code2,
  FileEdit,
  Hash,
  BookOpen,
  Swords,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export type ThematicActionType = 'code' | 'uzbek-drills' | 'symbols' | 'quotes' | 'battle';

interface ThematicTestsProps {
  onSelectAction: (action: ThematicActionType) => void;
}

export const ThematicTests: React.FC<ThematicTestsProps> = ({ onSelectAction }) => {
  const { t } = useI18n();

  const cards = [
    {
      id: 'code' as ThematicActionType,
      title: t('cardCodeTitle'),
      desc: t('cardCodeDesc'),
      icon: Code2,
      accentColor: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
      iconColor: 'text-cyan-400',
      badgeText: 'Dev Mode',
      actionText: t('startPractice')
    },
    {
      id: 'uzbek-drills' as ThematicActionType,
      title: t('cardUzbekTitle'),
      desc: t('cardUzbekDesc'),
      icon: FileEdit,
      accentColor: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
      iconColor: 'text-emerald-400',
      badgeText: "Oʻ Gʻ Sh Ch",
      actionText: t('startPractice')
    },
    {
      id: 'symbols' as ThematicActionType,
      title: t('cardSymbolsTitle'),
      desc: t('cardSymbolsDesc'),
      icon: Hash,
      accentColor: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30 hover:border-purple-400/60',
      iconColor: 'text-purple-400',
      badgeText: 'Shift & Numbers',
      actionText: t('startPractice')
    },
    {
      id: 'quotes' as ThematicActionType,
      title: t('cardQuotesTitle'),
      desc: t('cardQuotesDesc'),
      icon: BookOpen,
      accentColor: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30 hover:border-amber-400/60',
      iconColor: 'text-amber-400',
      badgeText: 'Navoiy & Qodiriy',
      actionText: t('startPractice')
    },
    {
      id: 'battle' as ThematicActionType,
      title: t('cardBattleTitle'),
      desc: t('cardBattleDesc'),
      icon: Swords,
      accentColor: 'from-rose-500/20 to-red-500/20',
      borderColor: 'border-rose-500/30 hover:border-rose-400/60',
      iconColor: 'text-rose-400',
      badgeText: 'Multiplayer 1v1',
      actionText: t('enterBattle')
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto my-12 sm:my-16 px-3 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Yo'naltirilgan Mashqlar</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('thematicTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">
          {t('thematicSubtitle')}
        </p>
      </div>

      {/* Grid of 5 Thematic Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          const isFullWidthOnLarge = index === 4; // 5th card spans 2 columns or nicely centers on large screens
          return (
            <div
              key={card.id}
              onClick={() => onSelectAction(card.id)}
              className={`group relative rounded-2xl bg-[#101726]/80 hover:bg-[#131d31] border ${card.borderColor} p-6 transition-all duration-200 shadow-lg shadow-black/40 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden ${
                isFullWidthOnLarge ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Subtle Ambient Hover Glow */}
              <div
                className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${card.accentColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div>
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.accentColor} border border-white/10 flex items-center justify-center ${card.iconColor} shadow-inner group-hover:scale-105 transition-transform`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 font-semibold tracking-wide">
                    {card.badgeText}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-3 mb-6">
                  {card.desc}
                </p>
              </div>

              {/* Bottom Call To Action Link */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>{card.actionText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
