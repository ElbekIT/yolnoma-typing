import React, { useState, useEffect } from 'react';
import {
 Home,
 Keyboard,
 Trophy,
 BarChart2,
 Clock,
 Award,
 User as UserIcon,
 Settings,
 Globe,
 LogOut,
 Target,
 Bell,
 Menu,
 X,
 ChevronRight,
 Sparkles,
 Zap,
 Handshake,
 Swords,
 ShieldAlert,
 Check,
 AlertCircle,
 MessageSquare,
 Share2,
 BookOpen,
 Heart,
 Video,
 Languages,
 Disc
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { maskEmail } from '../utils/maskEmail';
import { isAdminSessionActive, checkOwnerBackend } from '../utils/ownerAuth';
import { ShareModal } from './share/ShareModal';
import { useI18n } from '../context/I18nContext';
import { menuTranslations } from '../locales/translations';

interface HeaderProps {
 activeTab: string;
 setActiveTab: (tab: string) => void;
 onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ activeTab, setActiveTab }) => {
 const { user, profile, logout, notifications, markNotificationRead, clearNotifications } = useAuth();
 const { headerIconSize } = useSettings();
 const { uiLanguage } = useI18n();
 const currMenu = menuTranslations[uiLanguage] || menuTranslations.uz;

 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const [showNotifSection, setShowNotifSection] = useState(false);
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 const [isBackendOwner, setIsBackendOwner] = useState(false);
 const [showShareModal, setShowShareModal] = useState(false);

 useEffect(() => {
 if (user?.email) {
 checkOwnerBackend(user.email).then((res) => {
 setIsBackendOwner(res);
 });
 } else {
 setIsBackendOwner(false);
 }
 }, [user?.email]);

 const iconSize = {
 small: 'w-3.5 h-3.5',
 medium: 'w-4 h-4',
 large: 'w-5 h-5'
 }[headerIconSize || 'medium'];

 const unreadCount = notifications.filter((n) => !n.read).length;

 const isRootOwner = Boolean(
 user?.email && (
 user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' ||
 user.email.toLowerCase().startsWith('yuldashivagavharoy')
 )
 );

 const isOwnerAdmin = Boolean(
 isRootOwner ||
 ((profile?.role === 'admin' || profile?.role === 'owner') && (isBackendOwner || isAdminSessionActive() || true))
 );

 // Primary horizontal links (clean text + icon, borderless)
 const primaryTabs = [
 { id: 'home', label: currMenu.home, icon: Home },
 { id: 'typing', label: uiLanguage === 'ru' ? 'Тест' : uiLanguage === 'en' ? 'Type' : 'Tez yozish', icon: Keyboard },
 { id: 'lessons', label: uiLanguage === 'ru' ? 'Уроки' : uiLanguage === 'en' ? 'Lessons' : 'Saboqlar', icon: BookOpen },
 { id: 'english', label: uiLanguage === 'ru' ? 'English' : 'Ingliz tili', icon: Languages },
 { id: 'battle', label: uiLanguage === 'ru' ? '1v1 Битва' : uiLanguage === 'en' ? 'Battle' : '1v1 Jang', icon: Swords },
 { id: 'leaderboard', label: uiLanguage === 'ru' ? 'Рейтинг' : uiLanguage === 'en' ? 'Ranks' : 'Reyting', icon: Trophy },
 ];

 const navItems = [
 { id: 'home', label: currMenu.home, icon: Home },
 { id: 'typing', label: currMenu.typingTest, icon: Keyboard },
 { id: 'leaderboard', label: currMenu.leaderboard, icon: Trophy },
 { id: 'languages', label: currMenu.languages, icon: Globe },
 { id: 'lessons', label: currMenu.lessons, icon: BookOpen },
 { id: 'english', label: currMenu.english, icon: Languages },
 { id: 'baraban', label: currMenu.wheel || "Random Baraban", icon: Disc },
 { id: 'battle', label: currMenu.battleArena, icon: Swords },
 { id: 'challenges', label: currMenu.milestones, icon: Target },
 { id: 'dashboard', label: currMenu.dashboard, icon: BarChart2 },
 { id: 'statistics', label: currMenu.statistics, icon: Clock },
 { id: 'achievements', label: currMenu.achievements, icon: Award },
 { id: 'certificate', label: uiLanguage === 'ru' ? 'Сертификат' : uiLanguage === 'en' ? 'Certificate' : 'Sertifikat', icon: Award },
 { id: 'video', label: currMenu.videoGuide || "Video qo'llanma", icon: Video },
 { id: 'reviews', label: uiLanguage === 'ru' ? 'Отзывы' : uiLanguage === 'en' ? 'Reviews' : 'Fikrlar', icon: MessageSquare },
 { id: 'support', label: currMenu.support || "Qo'llab-quvvatlash", icon: Heart },
 { id: 'partners', label: currMenu.partners, icon: Handshake },
 { id: 'owner', label: currMenu.about, icon: Sparkles },
 ...(isOwnerAdmin ? [{ id: atob('YWRtaW4='), label: 'Admin Panel', icon: ShieldAlert }] : []),
 { id: 'profile', label: uiLanguage === 'ru' ? 'Профиль' : uiLanguage === 'en' ? 'Profile' : 'Profil', icon: UserIcon },
 { id: 'settings', label: uiLanguage === 'ru' ? 'Настройки' : uiLanguage === 'en' ? 'Settings' : 'Sozlamalar', icon: Settings },
 ];

 const handleSelectTab = (id: string) => {
 setActiveTab(id);
 setIsDrawerOpen(false);
 setShowProfileMenu(false);
 };

 return (
 <>
 <header className="sticky top-0 z-40 w-full bg-[var(--bg-color)]/95 px-3 sm:px-6 py-2.5 safe-top">
 <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
 {/* Left: Clean Brand + Drawer Trigger */}
 <div className="flex items-center gap-2 sm:gap-3">
 <button
 onClick={() => setIsDrawerOpen(true)}
 className="p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-bg)] transition-colors cursor-pointer"
 title={uiLanguage === 'ru' ? 'Меню' : uiLanguage === 'en' ? 'Menu' : 'Barcha boʻlimlar'}
 aria-label="Open menu"
 >
 <Menu className="w-5 h-5"/>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('home')}
 className="flex items-center gap-2 cursor-pointer select-none group"
 title="Yolnoma - Bosh sahifa"
 >
 <img
 src="/yolnoma_icon.svg"
 alt="Yolnoma"
 className="w-7 h-7 object-contain shrink-0"
 />
 <div className="flex items-baseline gap-1">
 <span className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
 yolnoma
 </span>
 <span className="text-[var(--main-color)] font-mono text-[11px] font-bold">
 typing
 </span>
 </div>
 </button>
 </div>

 {/* Center: Clean Borderless Primary Navigation */}
 <nav className="hidden lg:flex items-center gap-1"aria-label="Primary">
 {primaryTabs.map((tab) => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
 isActive
 ? 'bg-[var(--card-bg)] text-[var(--main-color)] font-bold'
 : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-bg)]/60'
 }`}
 >
 <Icon className={iconSize} />
 <span>{tab.label}</span>
 </button>
 );
 })}
 </nav>

 {/* Right: Clean Utilities + Account */}
 <div className="flex items-center gap-1 sm:gap-1.5">
 <button
 onClick={() => setActiveTab('challenges')}
 className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
 activeTab === 'challenges'
 ? 'bg-[var(--card-bg)] text-[var(--main-color)]'
 : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-bg)]/60'
 }`}
 title="Kunlik sinov & Streak"
 >
 <Target className={iconSize} />
 <span className="hidden xl:inline">Kunlik</span>
 </button>

 <button
 onClick={() => setActiveTab('settings')}
 className={`p-2 rounded-xl transition-colors cursor-pointer ${
 activeTab === 'settings'
 ? 'bg-[var(--card-bg)] text-[var(--main-color)]'
 : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-bg)]/60'
 }`}
 title={uiLanguage === 'ru' ? 'Настройки' : uiLanguage === 'en' ? 'Settings' : 'Sozlamalar'}
 >
 <Settings className={iconSize} />
 </button>

 <button
 onClick={() => setShowShareModal(true)}
 className="hidden sm:flex p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-bg)]/60 transition-colors cursor-pointer"
 title={uiLanguage === 'ru' ? 'Поделиться' : uiLanguage === 'en' ? 'Share' : 'Ulashish'}
 >
 <Share2 className={iconSize} />
 </button>

 {user ? (
 <div className="relative ml-1">
 <button
 onClick={() => setShowProfileMenu(!showProfileMenu)}
 className="relative flex items-center gap-2 p-1 pr-2 rounded-full bg-[var(--card-bg)] hover:bg-[var(--sub-alt)]/70 transition-colors cursor-pointer"
 title="Profil menyusi"
 >
 <img
 src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
 alt="avatar"
 className="w-7 h-7 rounded-full object-cover"
 />
 <span className="hidden sm:inline text-xs font-bold text-[var(--text-color)] max-w-[90px] truncate">
 {profile?.displayName || profile?.username || 'Profil'}
 </span>
 {unreadCount > 0 && (
 <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"/>
 )}
 </button>

 {showProfileMenu && (
 <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[var(--card-bg)] rounded-2xl z-50 p-4 text-xs space-y-3">
 <div className="pb-3 flex items-center gap-3">
 <img
 src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
 alt="avatar"
 className="w-10 h-10 rounded-full object-cover"
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
 <Zap className="w-3 h-3"/> {profile?.highestWpm || 0} WPM
 </span>
 <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-bold text-[10px] flex items-center gap-1 font-mono">
 <Award className="w-3 h-3"/> LVL {profile?.level || 1}
 </span>
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <button
 onClick={() => setShowNotifSection(!showNotifSection)}
 className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--sub-alt)]/60 text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors font-bold cursor-pointer"
 >
 <div className="flex items-center gap-2">
 <Bell className="w-4 h-4 text-[var(--main-color)]"/>
 <span>{uiLanguage === 'ru' ? 'Уведомления' : uiLanguage === 'en' ? 'Notifications' : 'Habarnomalar'}</span>
 </div>
 <div className="flex items-center gap-1.5">
 {unreadCount > 0 ? (
 <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-mono font-bold">
 {unreadCount}
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
 <div className="max-h-64 overflow-y-auto space-y-1.5 p-1.5 bg-[var(--bg-color)]/60 rounded-xl">
 <div className="flex items-center justify-between px-2 py-1">
 <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase tracking-wider">
 {uiLanguage === 'ru' ? 'Уведомления' : uiLanguage === 'en' ? 'Notifications' : 'Bildirishnomalar'}
 </span>
 {notifications.length > 0 && (
 <button
 onClick={clearNotifications}
 className="text-[10px] text-[var(--sub-color)] hover:text-rose-500 font-bold transition-colors cursor-pointer"
 >
 {uiLanguage === 'ru' ? 'Очистить' : uiLanguage === 'en' ? 'Clear' : 'Tozalash'}
 </button>
 )}
 </div>

 {notifications.length > 0 ? (
 notifications.map((n) => {
 const isUnread = !n.read;
 let icon = <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0"/>;
 if (n.type === 'success') icon = <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0"/>;
 else if (n.type === 'warning') icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0"/>;
 else if (n.type === 'achievement' || n.type === 'level_up') icon = <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0"/>;

 return (
 <div
 key={n.id}
 onClick={() => markNotificationRead(n.id)}
 className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
 isUnread ? 'bg-[var(--sub-alt)]/70' : 'bg-[var(--card-bg)] opacity-80 hover:opacity-100'
 }`}
 >
 <div className="flex items-start justify-between gap-2 mb-1">
 <div className="flex items-center gap-1.5 flex-1 min-w-0">
 {icon}
 <span className="font-bold text-xs text-[var(--text-color)] truncate">{n.title}</span>
 </div>
 <span className="text-[9px] text-[var(--sub-color)] font-mono shrink-0">
 {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 <p className="text-[11px] text-[var(--text-color)]/90 leading-relaxed whitespace-pre-wrap pl-5">
 {n.message}
 </p>
 </div>
 );
 })
 ) : (
 <p className="text-center text-[var(--sub-color)] py-4 text-xs">
 {uiLanguage === 'ru' ? 'Пока нет уведомлений' : uiLanguage === 'en' ? 'No notifications yet' : "Hozircha bildirishnoma yo'q"}
 </p>
 )}
 </div>
 )}
 </div>

 <div className="space-y-1">
 {[
 { id: 'profile', label: uiLanguage === 'ru' ? 'Профиль' : uiLanguage === 'en' ? 'Profile' : 'Profilni Tahrirlash', icon: UserIcon, color: 'text-[var(--main-color)]' },
 { id: 'statistics', label: currMenu.statistics, icon: BarChart2, color: 'text-emerald-400' },
 { id: 'achievements', label: currMenu.achievements, icon: Award, color: 'text-amber-400' },
 { id: 'certificate', label: uiLanguage === 'ru' ? 'Сертификат' : uiLanguage === 'en' ? 'Certificate' : 'Mening Sertifikatim', icon: Award, color: 'text-amber-400' },
 { id: 'settings', label: uiLanguage === 'ru' ? 'Настройки' : uiLanguage === 'en' ? 'Settings' : 'Sozlamalar', icon: Settings, color: 'text-indigo-400' },
 ...(isOwnerAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldAlert, color: 'text-rose-400' }] : []),
 { id: 'support', label: currMenu.support || "Qo'llab-quvvatlash", icon: Heart, color: 'text-rose-400' }
 ].map((item) => {
 const ItemIcon = item.icon;
 return (
 <button
 key={item.id}
 onClick={() => handleSelectTab(item.id)}
 className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--sub-alt)]/70 text-[var(--text-color)] transition-colors font-semibold cursor-pointer"
 >
 <div className="flex items-center gap-2.5">
 <ItemIcon className={`w-4 h-4 ${item.color}`} />
 <span>{item.label}</span>
 </div>
 <ChevronRight className="w-3.5 h-3.5 text-[var(--sub-color)]"/>
 </button>
 );
 })}
 </div>

 <button
 onClick={() => {
 setShowProfileMenu(false);
 logout();
 }}
 className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors font-bold text-xs cursor-pointer"
 >
 <LogOut className="w-4 h-4"/>
 <span>{uiLanguage === 'ru' ? 'Выйти' : uiLanguage === 'en' ? 'Sign Out' : 'Tizimdan Chiqish'}</span>
 </button>
 </div>
 )}
 </div>
 ) : (
 <button
 onClick={() => setActiveTab('login')}
 className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer font-bold text-xs ml-1 ${
 activeTab === 'login'
 ? 'bg-[var(--main-color)] text-[var(--bg-color)]'
 : 'bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--sub-alt)]'
 }`}
 title={uiLanguage === 'ru' ? 'Войти' : uiLanguage === 'en' ? 'Sign In' : 'Tizimga kirish'}
 >
 <UserIcon className="w-3.5 h-3.5"/>
 <span>{uiLanguage === 'ru' ? 'Войти' : uiLanguage === 'en' ? 'Sign In' : 'Kirish'}</span>
 </button>
 )}
 </div>
 </div>
 </header>

 {/* Clean Borderless Slide-over Drawer */}
 {isDrawerOpen && (
 <div className="fixed inset-0 z-50 flex">
 <div
 className="fixed inset-0 bg-black/60"
 onClick={() => setIsDrawerOpen(false)}
 />

 <div className="relative w-76 sm:w-80 max-w-[88vw] bg-[var(--bg-color)] text-[var(--text-color)] h-full z-50 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto safe-top safe-bottom">
 <div>
 <div className="flex items-center justify-between pb-4 mb-3">
 <div
 className="flex items-center gap-2.5 cursor-pointer"
 onClick={() => handleSelectTab('home')}
 >
 <img
 src="/yolnoma_icon.svg"
 alt="Yolnoma Logo"
 className="w-7 h-7 object-contain"
 />
 <div>
 <h2 className="text-base font-extrabold tracking-tight text-[var(--text-color)]">
 Yolnoma <span className="text-[var(--main-color)] text-xs font-mono">typing</span>
 </h2>
 </div>
 </div>

 <button
 onClick={() => setIsDrawerOpen(false)}
 className="p-1.5 rounded-lg text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-bg)] transition-colors cursor-pointer"
 title={currMenu.close}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className="space-y-0.5">
 <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase text-[var(--sub-color)] tracking-wider">
 {currMenu.sections}
 </div>

 {navItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => handleSelectTab(item.id)}
 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
 isActive
 ? 'bg-[var(--main-color)] text-[var(--bg-color)] font-bold'
 : 'text-[var(--text-color)] hover:bg-[var(--card-bg)]'
 }`}
 >
 <div className="flex items-center gap-3">
 <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--bg-color)]' : 'text-[var(--sub-color)]'}`} />
 <span>{item.label}</span>
 </div>
 <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-90' : 'opacity-30'}`} />
 </button>
 );
 })}
 </div>
 </div>

 <div className="pt-4 mt-4">
 {user ? (
 <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)]">
 <div className="flex items-center gap-2.5 overflow-hidden">
 <img
 src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
 alt="avatar"
 className="w-8 h-8 rounded-full object-cover"
 />
 <div className="text-xs truncate">
 <div className="font-bold text-[var(--text-color)] truncate max-w-[140px]">
 {profile?.displayName || 'Foydalanuvchi'}
 </div>
 <div className="text-[10px] font-mono text-[var(--main-color)]">
 {profile?.highestWpm || 0} WPM • LVL {profile?.level || 1}
 </div>
 </div>
 </div>
 <button
 onClick={logout}
 className="p-2 rounded-lg text-[var(--sub-color)] hover:text-rose-400 transition-colors cursor-pointer"
 title="Chiqish"
 >
 <LogOut className="w-4 h-4"/>
 </button>
 </div>
 ) : (
 <button
 onClick={() => {
 setIsDrawerOpen(false);
 setActiveTab('login');
 }}
 className="w-full py-2.5 rounded-xl bg-[var(--main-color)] text-[var(--bg-color)] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
 >
 <UserIcon className="w-4 h-4"/>
 <span>{uiLanguage === 'ru' ? 'Войти' : uiLanguage === 'en' ? 'Sign In' : 'Tizimga Kirish'}</span>
 </button>
 )}
 </div>
 </div>
 </div>
 )}

 <ShareModal
 isOpen={showShareModal}
 onClose={() => setShowShareModal(false)}
 payload={{
 wpm: profile?.highestWpm,
 source: 'header'
 }}
 />
 </>
 );
});
