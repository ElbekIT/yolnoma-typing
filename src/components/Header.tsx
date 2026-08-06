import React, { useState } from 'react';
import {
  Keyboard,
  Trophy,
  BarChart2,
  Clock,
  Award,
  User as UserIcon,
  Settings,
  Globe,
  Palette,
  LogIn,
  LogOut,
  Target,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { languagesList, t } from '../config/languages';
import { themes } from '../config/themes';
import { LanguageCode, ThemeMode } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { user, profile, logout } = useAuth();
  const { language, setLanguage, theme, setTheme } = useSettings();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const navItems = [
    { id: 'typing', label: t('typingTest', language), icon: Keyboard },
    { id: 'dashboard', label: t('dashboard', language), icon: BarChart2 },
    { id: 'leaderboard', label: t('leaderboard', language), icon: Trophy },
    { id: 'statistics', label: t('statistics', language), icon: Clock },
    { id: 'achievements', label: t('achievements', language), icon: Award },
    { id: 'challenges', label: t('challenges', language), icon: Target },
    { id: 'settings', label: t('settings', language), icon: Settings },
  ];

  const currentLangInfo = languagesList.find((l) => l.code === language) || languagesList[0];

  return (
    <header className="w-full bg-[var(--card-bg)] border-b border-[var(--sub-alt)] px-4 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('typing')}>
          <div className="w-10 h-10 rounded-xl bg-[var(--main-color)] flex items-center justify-center text-white shadow-md font-bold text-xl">
            Y
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
              Yolnoma <span className="text-[var(--main-color)] font-normal text-sm px-2 py-0.5 rounded-full bg-[var(--sub-alt)]">Typing</span>
            </h1>
            <p className="text-xs text-[var(--sub-color)] font-medium">Professional Multi-Lang Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--main-color)] text-white shadow-sm'
                    : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & User Auth */}
        <div className="flex items-center gap-2">
          {/* Quick Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--sub-alt)] text-[var(--text-color)] border border-[var(--sub-color)]/20 hover:border-[var(--main-color)] transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span>{currentLangInfo.flag}</span>
              <span className="hidden sm:inline">{currentLangInfo.nativeName}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl shadow-xl z-50 p-2 text-xs font-medium">
                <div className="px-2 py-1 text-[var(--sub-color)] font-semibold uppercase text-[10px] tracking-wider">
                  Select Language ({languagesList.length})
                </div>
                {languagesList.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as LanguageCode);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                      language === l.code
                        ? 'bg-[var(--main-color)] text-white font-semibold'
                        : 'text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </span>
                    <span className="text-[10px] opacity-70">({l.script})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] hover:text-[var(--main-color)] transition-all"
              title="Change Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-xl shadow-xl z-50 p-2 text-xs font-medium">
                <div className="px-2 py-1 text-[var(--sub-color)] font-semibold uppercase text-[10px] tracking-wider">
                  Select Theme
                </div>
                {Object.values(themes).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id as ThemeMode);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                      theme === th.id
                        ? 'bg-[var(--main-color)] text-white font-semibold'
                        : 'text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                    }`}
                  >
                    <span>{th.name}</span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: th.mainColor }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Button or Profile Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--sub-alt)] hover:bg-[var(--main-color)] hover:text-white transition-all text-xs font-semibold text-[var(--text-color)]"
              >
                <img
                  src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                  alt="avatar"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="hidden sm:inline">{profile?.displayName || 'User'}</span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-lg bg-[var(--sub-alt)] text-[var(--error-color)] hover:bg-[var(--error-color)] hover:text-white transition-all"
                title={t('signOut', language)}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--main-color)] text-white font-semibold text-xs shadow-md hover:opacity-90 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('signIn', language)}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
