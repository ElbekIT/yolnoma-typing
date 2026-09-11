import React from 'react';
import { LeaderboardView } from '../components/leaderboard/LeaderboardView';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

interface LeaderboardPageProps {
  onOpenLogin?: () => void;
  onBackToHome?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  onOpenLogin,
  onBackToHome
}) => {
  const { t } = useI18n();

  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in">
      {onBackToHome && (
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/50 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToHome')}</span>
          </button>
        </div>
      )}

      <LeaderboardView onOpenLogin={onOpenLogin} />
    </div>
  );
};
