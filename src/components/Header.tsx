import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Info,
  Check,
  AlertCircle,
  MessageSquare,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { languagesList, t } from '../config/languages';
import { themes } from '../config/themes';
import { LanguageCode, ThemeMode } from '../types';
import { maskEmail } from '../utils/maskEmail';
import { isOwnerUser, isAdminSessionActive, checkOwnerBackend } from '../utils/ownerAuth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { user, profile, logout, notifications, markNotificationRead, clearNotifications } = useAuth();
  const { language, setLanguage, theme, setTheme, headerIconSize } = useSettings();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifSection, setShowNotifSection] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBackendOwner, setIsBackendOwner] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkOwnerBackend(user.email).then((res) => {
        setIsBackendOwner(res);
      });
    } else {
      setIsBackendOwner(false);
    }
  }, [user?.email]);

  const iconDimensions = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  }[headerIconSize || 'medium'];

  const iconBtnPadding = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-2.5',
  }[headerIconSize || 'medium'];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isOwnerAdmin = Boolean(
    (user?.email && (user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' || user.email.toLowerCase().startsWith('yuldashivagavharoy'))) ||
    profile?.role === 'admin' ||
    profile?.role === 'owner' ||
    isBackendOwner ||
    isOwnerUser(user?.email) ||
    isAdminSessionActive()
  );

  const navItems = [
    { id: 'typing', label: 'Yozish Testi', enLabel: 'Typing Test', icon: Keyboard },
    { id: 'languages', label: 'Tillar & Lug\'atlar', enLabel: 'Languages', icon: Globe },
    { id: 'lessons', label: 'Saboqlar & Mashqlar', enLabel: 'Lessons', icon: GraduationCap },
    { id: 'battle', label: 'Battle Arena', enLabel: 'Battle Arena', icon: Swords },
    { id: 'dashboard', label: 'Boshqaruv Paneli', enLabel: 'Dashboard', icon: BarChart2 },
    { id: 'leaderboard', label: 'Peshqadamlar', enLabel: 'Leaderboard', icon: Trophy },
    { id: 'statistics', label: 'Statistika', enLabel: 'Statistics', icon: Clock },
    { id: 'achievements', label: 'Yutuqlar', enLabel: 'Achievements', icon: Award },
    { id: 'challenges', label: 'Muvaffaqiyatlar', enLabel: 'Challenges', icon: Target },
    { id: 'partners', label: 'Hamkorlarimiz', enLabel: 'Partners', icon: Handshake },
    { id: 'owner', label: 'Sayt Haqida & Muallif', enLabel: 'About & Creator', icon: Sparkles },
    ...(isOwnerAdmin ? [{ id: atob('YWRtaW4='), label: 'Admin Panel', enLabel: 'Admin Panel', icon: ShieldAlert }] : []),
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
      <header className="sticky top-0 z-40 w-full bg-[var(--card-bg)] border-b border-[var(--sub-alt)] px-3 sm:px-4 py-2.5 safe-top transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Side: Brand Logo & Navigation Icons */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* 3-lines Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-[var(--sub-alt)]/60 text-[var(--sub-color)] hover:text-[var(--main-color)] border border-[var(--sub-alt)] transition-colors flex items-center gap-2 cursor-pointer"
              title="Menyu"
            >
              <Menu className="w-4 h-4 text-[var(--main-color)]" />
              <span className="text-xs font-bold hidden sm:inline text-[var(--text-color)]">Menyu</span>
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('typing')}>
              <img
                src="/yolnoma_icon.svg"
                alt="Yolnoma Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <div className="flex items-baseline gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[var(--text-color)]">
                  Yolnoma
                </h1>
                <span className="text-[var(--main-color)] font-mono text-[10px] font-bold">typing</span>
              </div>
            </div>

            {/* Quick Icon Links (Monkeytype style) */}
            <div className="hidden md:flex items-center gap-1.5 text-[var(--sub-color)]">
              <button
                onClick={() => setActiveTab('typing')}
                className={`${iconBtnPadding} rounded-xl transition-all cursor-pointer ${
                  activeTab === 'typing' ? 'text-[var(--main-color)] bg-[var(--sub-alt)]/70' : 'hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                }`}
                title="Yozish Testi"
              >
                <Keyboard className={iconDimensions} />
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`${iconBtnPadding} rounded-xl transition-all cursor-pointer ${
                  activeTab === 'leaderboard' ? 'text-[var(--main-color)] bg-[var(--sub-alt)]/70' : 'hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                }`}
                title="Peshqadamlar"
              >
                <Crown className={iconDimensions} />
              </button>

              <button
                onClick={() => setActiveTab('languages')}
                className={`${iconBtnPadding} rounded-xl transition-all cursor-pointer ${
                  activeTab === 'languages' ? 'text-[var(--main-color)] bg-[var(--sub-alt)]/70' : 'hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                }`}
                title="125+ Jahon Tillari"
              >
                <Globe className={iconDimensions} />
              </button>

              <button
                onClick={() => setActiveTab('lessons')}
                className={`${iconBtnPadding} rounded-xl transition-all cursor-pointer ${
                  activeTab === 'lessons' ? 'text-[var(--main-color)] bg-[var(--sub-alt)]/70' : 'hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                }`}
                title="Saboqlar"
              >
                <GraduationCap className={iconDimensions} />
              </button>

              <button
                onClick={() => setActiveTab('battle')}
                className={`${iconBtnPadding} rounded-xl transition-all cursor-pointer ${
                  activeTab === 'battle' ? 'text-[var(--main-color)] bg-[var(--sub-alt)]/70' : 'hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                }`}
                title="Battle Arena"
              >
                <Swords className={iconDimensions} />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`${iconBtnPadding} rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'text-[var(--main-color)] bg-[var(--sub-alt)]/70' : 'hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/30'
                }`}
                title="Sozlamalar"
              >
                <Settings className={iconDimensions} />
              </button>
            </div>
          </div>

          {/* Right Side: Circular Profile Avatar with Dropdown */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                {/* Circular Profile Avatar Button */}
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative p-0.5 rounded-full border-2 border-[var(--main-color)]/60 hover:border-[var(--main-color)] bg-[var(--sub-alt)] transition-colors cursor-pointer"
                  title="Profil menyusi"
                >
                  <img
                    src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] flex items-center justify-center border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl shadow-xl z-50 p-4 text-xs space-y-3 divide-y divide-[var(--sub-alt)]">
                    {/* User Info Header */}
                    <div className="pb-3 flex items-center gap-3">
                      <img
                        src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                        alt="avatar"
                        className="w-11 h-11 rounded-full object-cover border-2 border-[var(--main-color)] p-0.5"
                      />
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-sm text-[var(--text-color)] truncate">
                          {profile?.displayName || 'Foydalanuvchi'}
                        </h3>
                        <p className="text-[11px] text-[var(--sub-color)] truncate font-mono">
                          {user.email ? maskEmail(user.email) : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--main-color)]/15 text-[var(--main-color)] font-bold text-[10px] flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {profile?.highestWpm || 0} WPM
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-bold text-[10px] flex items-center gap-1 font-mono">
                            <Award className="w-3 h-3" /> LVL {profile?.level || 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="pt-3 space-y-2">
                      <button
                        onClick={() => setShowNotifSection(!showNotifSection)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:bg-[var(--sub-alt)]/80 transition-colors font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[var(--main-color)]" />
                          <span>Habarnomalar</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {unreadCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-mono font-bold">
                              {unreadCount} yangi
                            </span>
                          ) : (
                            <span className="text-[10px] text-[var(--sub-color)] font-normal">
                              ({notifications.length})
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 text-[var(--sub-color)] transition-transform duration-150 ${
                              showNotifSection ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {showNotifSection && (
                        <div className="max-h-72 overflow-y-auto space-y-2 p-1.5 bg-[var(--sub-alt)]/30 rounded-xl border border-[var(--sub-alt)]">
                          <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase tracking-wider flex items-center gap-1.5">
                              <Bell className="w-3 h-3 text-[var(--main-color)]" />
                              <span>Bildirishnomalar</span>
                            </span>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearNotifications}
                                className="text-[10px] text-[var(--sub-color)] hover:text-rose-500 font-bold transition-colors cursor-pointer"
                              >
                                Tozalash
                              </button>
                            )}
                          </div>

                          {notifications.length > 0 ? (
                            notifications.map((n) => {
                              const isUnread = !n.read;
                              let badgeColor = 'bg-sky-500/15 text-sky-400 border-sky-500/20';
                              let icon = <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />;

                              if (n.type === 'success') {
                                badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
                                icon = <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
                              } else if (n.type === 'warning') {
                                badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
                                icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
                              } else if (n.type === 'achievement' || n.type === 'level_up') {
                                badgeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/20';
                                icon = <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
                              }

                              return (
                                <div
                                  key={n.id}
                                  onClick={() => markNotificationRead(n.id)}
                                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer relative ${
                                    isUnread
                                      ? 'bg-[var(--card-bg)] border-[var(--main-color)]/60'
                                      : 'bg-[var(--card-bg)]/80 border-[var(--sub-alt)] opacity-85 hover:opacity-100'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      {icon}
                                      <span className="font-bold text-xs text-[var(--text-color)] truncate">
                                        {n.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isUnread && (
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                      )}
                                      <span className="text-[9px] text-[var(--sub-color)] font-mono">
                                        {new Date(n.timestamp).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-[11px] text-[var(--text-color)]/90 leading-relaxed whitespace-pre-wrap pl-5">
                                    {n.message}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center text-[var(--sub-color)] py-4 text-xs font-medium">
                              Hozircha bildirishnoma yo'q
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Navigation Menu Links */}
                    <div className="pt-3 space-y-1">
                      <button
                        onClick={() => handleSelectTab('profile')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-colors font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserIcon className="w-4 h-4 text-[var(--main-color)]" />
                          <span>Profilni Tahrirlash</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)]" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('statistics')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-colors font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <BarChart2 className="w-4 h-4 text-emerald-500" />
                          <span>Mening Statistikam</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)]" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('achievements')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-colors font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Yutuqlarim</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)]" />
                      </button>

                      <button
                        onClick={() => handleSelectTab('settings')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-colors font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-4 h-4 text-indigo-400" />
                          <span>Sozlamalar</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--sub-color)]" />
                      </button>

                      {isOwnerAdmin && (
                        <button
                          onClick={() => handleSelectTab('admin')}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)] text-rose-400 hover:text-rose-300 transition-colors font-bold bg-rose-500/5 border border-rose-500/20 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span>Admin Panel</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-rose-400 opacity-70" />
                        </button>
                      )}

                      <button
                        onClick={() => handleSelectTab('owner')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)] text-[var(--text-color)] transition-colors font-bold bg-[var(--main-color)]/5 border border-[var(--main-color)]/20 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-[var(--main-color)]" />
                          <span className="text-[var(--main-color)]">Sayt Haqida & Muallif</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--main-color)] opacity-70" />
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors font-bold text-xs cursor-pointer"
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
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--main-color)] text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
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
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-80 sm:w-88 max-w-[90vw] bg-[var(--card-bg)] text-[var(--text-color)] border-r border-[var(--sub-alt)] h-full z-50 p-4 sm:p-5 flex flex-col justify-between shadow-xl overflow-y-auto safe-top safe-bottom">
            {/* Top Drawer Section */}
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--sub-alt)]">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => handleSelectTab('typing')}
                >
                  <img
                    src="/yolnoma_icon.svg"
                    alt="Yolnoma Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <h2 className="text-base font-black tracking-tight text-[var(--text-color)]">
                      Yolnoma <span className="text-[var(--main-color)] text-xs font-bold">Typing</span>
                    </h2>
                    <p className="text-[10px] text-[var(--sub-color)] font-medium">O'zbekiston №1 Tez Yozish Platformasi</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer"
                  title="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Clean Navigation Menu Links */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-[var(--sub-color)] tracking-wider">
                  Bo'limlar
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const displayLabel = language.startsWith('uz') ? item.label : item.enLabel;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 group ${
                        isActive
                          ? 'bg-[var(--main-color)] text-white shadow-lg shadow-[var(--main-color)]/25 scale-[1.01]'
                          : 'text-[var(--text-color)] hover:bg-[var(--sub-alt)]/70 hover:text-[var(--main-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-[var(--sub-color)] group-hover:text-[var(--main-color)]'
                          }`}
                        />
                        <span className="text-sm font-extrabold tracking-wide">{displayLabel}</span>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? 'text-white translate-x-0.5'
                            : 'opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Minimalist User Footer */}
            <div className="pt-5 border-t border-[var(--sub-alt)]/60 mt-5">
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={
                        profile?.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`
                      }
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border-2 border-[var(--main-color)]/60"
                    />
                    <div className="text-xs truncate">
                      <div className="font-black text-sm text-[var(--text-color)] truncate max-w-[150px]">
                        {profile?.displayName || 'Foydalanuvchi'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold">
                        <span className="text-[var(--main-color)]">{profile?.highestWpm || 0} WPM</span>
                        <span className="text-amber-500">• LVL {profile?.level || 1}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-[var(--sub-color)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    title="Chiqish"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3 rounded-2xl bg-[var(--main-color)] text-white font-extrabold text-sm shadow-md shadow-[var(--main-color)]/25 flex items-center justify-center gap-2.5 hover:opacity-95 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Tizimga Kirish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

