import React from 'react';
import {
 Code2,
 FileEdit,
 Hash,
 BookOpen,
 Swords,
 ArrowRight,
 Sparkles,
 Languages
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export type ThematicActionType = 'code' | 'uzbek-drills' | 'uzbek-new-drills' | 'symbols' | 'quotes' | 'battle' | 'english';

interface ThematicTestsProps {
 onSelectAction: (action: ThematicActionType) => void;
}

export const ThematicTests: React.FC<ThematicTestsProps> = ({ onSelectAction }) => {
 const { t } = useI18n();

 const cards = [
 {
 id: 'uzbek-new-drills' as ThematicActionType,
 title: t('cardUzbekNewTitle'),
 desc: 'Ç, Ş, Ğ va Õ harflarida maxsus mashq',
 icon: Sparkles,
 iconColor: 'text-amber-400',
 badgeText: 'Ç Ş Ğ Õ'
 },
 {
 id: 'uzbek-drills' as ThematicActionType,
 title: t('cardUzbekTitle'),
 desc: "Oʻ, Gʻ, Sh, Ch harflari tezligi",
 icon: FileEdit,
 iconColor: 'text-emerald-400',
 badgeText: "Oʻ Gʻ"
 },
 {
 id: 'code' as ThematicActionType,
 title: t('cardCodeTitle'),
 desc: 'JS, Python, C++ va HTML sintaksisi',
 icon: Code2,
 iconColor: 'text-cyan-400',
 badgeText: 'DEV'
 },
 {
 id: 'symbols' as ThematicActionType,
 title: t('cardSymbolsTitle'),
 desc: 'Raqamlar va Shift belgilari mashqi',
 icon: Hash,
 iconColor: 'text-purple-400',
 badgeText: '123 & #$'
 },
 {
 id: 'quotes' as ThematicActionType,
 title: t('cardQuotesTitle'),
 desc: 'Navoiy, Qodiriy va allomalar hikmati',
 icon: BookOpen,
 iconColor: 'text-amber-300',
 badgeText: 'IQTIBOS'
 },
 {
 id: 'english' as ThematicActionType,
 title: 'Ingliz Tili (0 → IELTS 9)',
 desc: '35 ta darsni klaviaturada yozib oʻrganing',
 icon: Languages,
 iconColor: 'text-emerald-400',
 badgeText: 'BEPUL'
 },
 {
 id: 'battle' as ThematicActionType,
 title: t('cardBattleTitle'),
 desc: "Do'stlar bilan real-vaqt 1v1 poyga",
 icon: Swords,
 iconColor: 'text-rose-400',
 badgeText: '1v1'
 }
 ];

 return (
 <div className="rounded-2xl bg-[var(--card-bg)] p-5 space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm sm:text-base font-bold text-[var(--text-color)]">{t('thematicTitle')}</h3>
 <p className="text-[11px] text-[var(--sub-color)]">{t('thematicSubtitle')}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 {cards.map((card) => {
 const IconComponent = card.icon;
 return (
 <button
 key={card.id}
 type="button"
 onClick={() => onSelectAction(card.id)}
 className="text-left p-3.5 rounded-xl bg-[var(--sub-alt)]/35 hover:bg-[var(--sub-alt)]/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className={`w-9 h-9 rounded-lg bg-[var(--card-bg)] flex items-center justify-center ${card.iconColor} shrink-0`}>
 <IconComponent className="w-4 h-4"/>
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-bold text-[var(--text-color)] truncate group-hover:text-[var(--main-color)] transition-colors">
 {card.title}
 </span>
 <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--card-bg)] text-[var(--sub-color)] shrink-0">
 {card.badgeText}
 </span>
 </div>
 <p className="text-[11px] text-[var(--sub-color)] truncate mt-0.5">{card.desc}</p>
 </div>
 </div>
 <ArrowRight className="w-3.5 h-3.5 text-[var(--sub-color)] group-hover:text-[var(--main-color)] shrink-0"/>
 </button>
 );
 })}
 </div>
 </div>
 );
};
