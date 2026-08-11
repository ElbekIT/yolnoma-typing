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
  Bell,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Zap,
  Handshake,
  Crown,
  Swords,
  GraduationCap,
  ShieldAlert
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
  const { user, profile, logout, notifications, markNotificationRead, clearNotifications } = useAuth();
  const { language, setLanguage, theme, setTheme } = useSettings();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifSection, setShowNotifSection] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isOwnerAdmin = user?.email?.toLowerCase() === 'yuldashivagavharoy@gmail.com' || profile?.role === 'admin';

  const navItems = [
    { id: 'typing', label: 'Yozish Testi', enLabel: 'Typing Test', icon: Keyboard, badge: 'Pro' },
    { id: 'lessons', label: 'Saboqlar & Mashqlar', enLabel: 'Lessons', icon: GraduationCap, badge: 'Yangi 🔥' },
    { id: 'battle', label: 'Battle Arena', enLabel: 'Battle Arena', icon: Swords, badge: '1v1 🔥' },
    { id: 'dashboard', label: 'Boshqaruv Paneli', enLabel: 'Dashboard', icon: BarChart2 },
    { id: 'leaderboard', label: 'Peshqadamlar', enLabel: 'Leaderboard', icon: Trophy, badge: 'Live' },
    { id: 'statistics', label: 'Statistika', enLabel: 'Statistics', icon: Clock },
    { id: 'achievements', label: 'Yutuqlar', enLabel: 'Achievements', icon: Award },
    { id: 'challenges', label: 'Muvaffaqiyatlar', enLabel: 'Challenges', icon: Target },
    { id: 'partners', label: 'Hamkorlarimiz', enLabel: 'Partners', icon: Handshake, badge: 'Homiy' },
    ...(isOwnerAdmin ? [{ id: 'admin', label: 'Admin Panel', enLabel: 'Admin Panel', icon: ShieldAlert, badge: 'Owner' }] : []),
    { id: 'profile', label: 'Profil', enLabel: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Sozlamalar', enLabel: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsDrawerOpen(false);
    setShowProfileMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--card-bg)]/85 backdrop-blur-md border-b border-[var(--sub-alt)] px-4 py-3 transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Side: 3-lines Hamburger Menu & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* 3-lines Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-2xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:text-[var(--main-color)] border border-[var(--sub-color)]/20 hover:border-[var(--main-color)] transition-all flex items-center gap-2 group hover:scale-105 active:scale-95"
              title="Menyu bo'limini ochish"
            >
              <Menu className="w-5 h-5 text-[var(--main-color)] group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-xs font-bold hidden sm:inline text-[var(--text-color)]">Menyu</span>
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setActiveTab('typing')}>
              <img
                src="/yolnoma_icon.svg"
                alt="Yolnoma Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-md"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-color)] flex items-center gap-1.5">
                  Yolnoma <span className="text-[var(--main-color)] font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-[var(--sub-alt)] border border-[var(--main-color)]/30 tracking-wider">TYPING</span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-[var(--sub-color)] font-semibold tracking-wide hidden lg:block">O'zbekistondagi №1 Tez Yozish Platformasi</p>
              </div>
            </div>
          </div>

          {/* Right Side: Circular Profile Avatar with Dropdown */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                {/* Circular Profile Avatar Button */}
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative group p-0.5 rounded-full border-2 border-[var(--main-color)]/60 hover:border-[var(--main-color)] bg-[var(--sub-alt)] transition-all hover:scale-105 active:scale-95 shadow-md"
                  title="Profil menyusi"
                >
                  <img
                    src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] flex items-center justify-center animate-pulse border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl shadow-2xl z-50 p-4 text-xs space-y-3 divide-y divide-[var(--sub-alt)] animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="pb-3 flex items-center gap-3">
                      <img
                        src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-[var(--main-color)] p-0.5"
                      />
                      <div className="overflow-hidden">
                        <h3 className="font-black text-sm text-[var(--text-color)] truncate">
                          {profile?.displayName || 'Foydalanuvchi'}
                        </h3>
                        <p className="text-[11px] text-[var(--sub-color)] truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[var(--main-color)]/15 text-[var(--main-color)] font-bold text-[10px] flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {profile?.highestWpm || 0} WPM Best
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold text-[10px] flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Pro
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notifications (Habarnomalar) Section */}
                    <div className="pt-3 space-y-2">
                      <button
                        onClick={() => setShowNotifSection(!showNotifSection)}
                        className="w-full flex items-center justify-between p-2 rounded-2xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:bg-[var(--sub-alt)]/80 transition-all font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[var(--main-color)]" />
                          <span>Habarnomalar</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {unreadCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-extrabold">
                              {unreadCount} yangi
                            </span>
                          ) : (
                            <span className="text-[10px] text-[var(--sub-color)] font-normal">
                              ({notifications.length})
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 text-[var(--sub-color)] transition-transform duration-200 ${
                              showNotifSection ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {showNotifSection && (
                        <div className="max-h-56 overflow-y-auto space-y-2 p-1 bg-[var(--sub-alt)]/30 rounded-2xl border border-[var(--sub-alt)]">
                          <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase tracking-wider">
                              Bildirishnomalar
                            </span>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearNotifications}
                                className="text-[10px] text-[var(--sub-color)] hover:text-rose-500 font-semibold"
                              >
                                Tozalash
                              </button>
                            )}
                          </div>

                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  n.read
                                    ? 'bg-[var(--card-bg)] border-[var(--sub-alt)] text-[var(--sub-color)]'
                                    : 'bg-[var(--card-bg)] border-[var(--main-color)]/40 text-[var(--text-color)] font-medium shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold mb-1">
                                  <span>{n.title}</span>
                                  <span className="text-[9px] text-[var(--sub-color)] font-mono">
                                    {new Date(n.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-[11px] leading-snug">{n.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-[var(--sub-color)] py-3 text-xs">
                              Hozircha yangi bildirishnoma yo'q
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Navigation Menu Links */}
                    <div className="pt-3 space-y-1">
                      <button
                        onClick={() => handleSelectTab('profile')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-all font-bold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserIcon className="w-4 h-4 text-[var(--main-color)]" />
                          <span>Profilni Tahrirlash</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('statistics')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-all font-bold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <BarChart2 className="w-4 h-4 text-emerald-500" />
                          <span>Mening Statistikam</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('achievements')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-all font-bold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Yutuqlarim</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('settings')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-all font-bold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-4 h-4 text-indigo-400" />
                          <span>Sozlamalar</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-extrabold text-xs shadow-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Tizimdan Chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[var(--main-color)] to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-[var(--main-color)]/25 hover:opacity-95 transition-all hover:scale-105 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Kirish</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Side Drawer Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-80 sm:w-96 max-w-[85vw] bg-[var(--card-bg)] text-[var(--text-color)] border-r border-[var(--sub-alt)] h-full z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Top Drawer Section */}
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--sub-alt)]">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelectTab('typing')}>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--main-color)] via-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[var(--main-color)]/30">
                    Y
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-[var(--text-color)]">Yolnoma Typing</h2>
                    <p className="text-[11px] text-[var(--sub-color)] font-semibold">Boshqaruv va Navigatsiya</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--error-color)]/20 hover:text-rose-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Menu Links */}
              <div className="space-y-1.5">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-[var(--sub-color)] tracking-wider">
                  Asosiy Bo'limlar
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const displayLabel = language.startsWith('uz') ? item.label : item.enLabel;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                        isActive
                          ? 'bg-[var(--main-color)] text-white shadow-lg shadow-[var(--main-color)]/30 scale-[1.01]'
                          : 'text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[var(--sub-alt)] text-[var(--main-color)] group-hover:bg-[var(--main-color)] group-hover:text-white transition-colors'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold tracking-wide">{displayLabel}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-black ${
                            isActive ? 'bg-white text-[var(--main-color)]' : 'bg-[var(--main-color)]/20 text-[var(--main-color)]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Settings Section inside Drawer */}
              <div className="mt-8 pt-6 border-t border-[var(--sub-alt)] space-y-4">
                <div className="px-3 text-[10px] font-black uppercase text-[var(--sub-color)] tracking-wider">
                  Tezkor Sozlamalar
                </div>

                {/* Theme Pills */}
                <div className="bg-[var(--sub-alt)]/50 p-3 rounded-2xl border border-[var(--sub-alt)] space-y-2">
                  <div className="text-[11px] font-bold text-[var(--sub-color)] flex items-center justify-between">
                    <span>Mavzuni Tanlang</span>
                    <Palette className="w-3.5 h-3.5 text-[var(--main-color)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.values(themes).slice(0, 4).map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setTheme(th.id as ThemeMode)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all ${
                          theme === th.id
                            ? 'bg-[var(--main-color)] text-white shadow-sm font-bold'
                            : 'bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
                        }`}
                      >
                        <span className="truncate">{th.name}</span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.mainColor }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-[var(--sub-alt)]/30 p-3 rounded-2xl border border-[var(--sub-alt)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[var(--sub-color)] font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tezkor Qayta Boshlash:</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
                    <kbd className="px-2 py-0.5 rounded-md bg-[var(--card-bg)] border border-[var(--sub-color)]/30">Tab</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-0.5 rounded-md bg-[var(--card-bg)] border border-[var(--sub-color)]/30">Enter</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Drawer User Card */}
            <div className="pt-6 border-t border-[var(--sub-alt)] mt-6">
              {user ? (
                <div className="bg-[var(--sub-alt)] p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border border-[var(--main-color)]"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-[var(--text-color)] truncate max-w-[120px]">{profile?.displayName || 'User'}</div>
                      <div className="text-[10px] text-[var(--main-color)] font-mono font-bold">WPM Best: {profile?.highestWpm || 0}</div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl bg-[var(--card-bg)] text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold"
                    title="Chiqish"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--main-color)] to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-[var(--main-color)]/30 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tizimga Kirish / Ro'yxatdan O'tish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

