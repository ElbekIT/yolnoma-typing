import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TypingTestView } from './components/typing/TypingTestView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { DashboardView } from './components/dashboard/DashboardView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/about/AboutModal';
import { OwnerModal } from './components/owner/OwnerModal';
import { BlockedScreen } from './components/BlockedScreen';
import { DevToolsBlockedScreen } from './components/DevToolsBlockedScreen';
import { LoginPage } from './components/LoginPage';
import { antiCheatManager } from './utils/antiCheat';

const MainAppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { theme } = useSettings();
  const [activeTab, setActiveTab] = useState<'typing' | 'leaderboard' | 'dashboard' | 'achievements' | 'settings' | 'profile'>('typing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isDevToolsBlocked, setIsDevToolsBlocked] = useState(false);

  // Anti-cheat devtools monitor
  useEffect(() => {
    antiCheatManager.init();
    const handleDevToolsToggle = (e: any) => {
      setIsDevToolsBlocked(e.detail?.isOpen ?? false);
    };
    window.addEventListener('yolnoma-devtools-toggle', handleDevToolsToggle);
    return () => {
      window.removeEventListener('yolnoma-devtools-toggle', handleDevToolsToggle);
    };
  }, []);

  // If user is permanently blocked in database
  if (profile?.isBlocked) {
    return <BlockedScreen reason={profile.blockReason} />;
  }

  // If DevTools is open and active
  if (isDevToolsBlocked) {
    return <DevToolsBlockedScreen />;
  }

  // If not logged in, show the modern LoginPage
  if (!loading && !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col justify-between selection:bg-[var(--main-color)] selection:text-white transition-colors duration-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        {activeTab === 'typing' && <TypingTestView />}
        {activeTab === 'leaderboard' && <LeaderboardView onOpenAuth={() => setIsAuthOpen(true)} />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'profile' && (
          <ProfileView
            onOpenAuth={() => setIsAuthOpen(true)}
            onSavedHome={() => setActiveTab('typing')}
          />
        )}
      </main>

      <Footer
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenOwner={() => setIsOwnerOpen(true)}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <OwnerModal isOpen={isOwnerOpen} onClose={() => setIsOwnerOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainAppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
