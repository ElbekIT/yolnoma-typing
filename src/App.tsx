import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { I18nProvider, useI18n } from './context/I18nContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/about/AboutModal';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './pages/HomePage';
import { TypingPage } from './pages/TypingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ThematicActionType } from './components/home/ThematicTests';
import { PubgInviteModal, BattleInviteData } from './components/battle/PubgInviteModal';
import { rtdb } from './config/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { BlockedScreen } from './components/BlockedScreen';
import { DevToolsBlockedScreen } from './components/DevToolsBlockedScreen';
import { IpBlockedScreen } from './components/security/IpBlockedScreen';
import { VpnBlockedScreen } from './components/security/VpnBlockedScreen';
import { MaintenanceScreen } from './components/security/MaintenanceScreen';
import { UserBlockedScreen } from './components/security/UserBlockedScreen';
import { fetchIpSecurityStatus } from './utils/securityShield';
import { Wrench } from 'lucide-react';
import { antiCheatManager } from './utils/antiCheat';
import { updatePageSEO } from './utils/seo';

// Lazy-loaded secondary views for high performance & fast initial loading
const DashboardView = React.lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const LeaderboardView = React.lazy(() => import('./components/leaderboard/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const StatisticsView = React.lazy(() => import('./components/statistics/StatisticsView').then(m => ({ default: m.StatisticsView })));
const AchievementsView = React.lazy(() => import('./components/achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const ChallengesView = React.lazy(() => import('./components/challenges/ChallengesView').then(m => ({ default: m.ChallengesView })));
const ProfileView = React.lazy(() => import('./components/profile/ProfileView').then(m => ({ default: m.ProfileView })));
const SettingsView = React.lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })));
const PartnersView = React.lazy(() => import('./components/partners/PartnersView').then(m => ({ default: m.PartnersView })));
const BattleView = React.lazy(() => import('./components/battle/BattleView').then(m => ({ default: m.BattleView })));
const LessonsView = React.lazy(() => import('./components/lessons/LessonsView').then(m => ({ default: m.LessonsView })));
const AdminView = React.lazy(() => import('./components/admin/AdminView').then(m => ({ default: m.AdminView })));
const OwnerAboutView = React.lazy(() => import('./components/owner/OwnerAboutView').then(m => ({ default: m.OwnerAboutView })));
const LanguageSelectView = React.lazy(() => import('./components/languages/LanguageSelectView').then(m => ({ default: m.LanguageSelectView })));
const NotFoundView = React.lazy(() => import('./components/NotFoundView').then(m => ({ default: m.NotFoundView })));
const SeoArticleSection = React.lazy(() => import('./components/seo/SeoArticleSection').then(m => ({ default: m.SeoArticleSection })));

function ViewLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] w-full py-16 text-center animate-fade-in">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-500 animate-spin" />
      </div>
      <p className="text-xs font-mono font-bold tracking-widest text-cyan-400/90 uppercase">
        Yolnoma Yuklanmoqda...
      </p>
    </div>
  );
}

import {
  TextMode,
  TimeMode,
  WordCountMode,
  DifficultyMode,
  TypingResult
} from './types';
import { generateTestText, calculateWpm, calculateCpm, calculateAccuracy } from './utils/typingEngine';
import { CodeLanguage } from './data/codeSnippets';

function MainAppContent() {
  const { language } = useSettings();
  const { user, profile, loading, saveTestResult } = useAuth();
  const { uiLanguage, setUiLanguage } = useI18n();

  // Route to URL slug mapping
  const TAB_TO_PATH: Record<string, string> = {
    home: '',
    typing: 'test',
    languages: 'languages',
    leaderboard: 'leaderboard',
    battle: 'battle',
    lessons: 'lessons',
    statistics: 'statistics',
    profile: 'profile',
    settings: 'settings',
    login: 'login',
    achievements: 'achievements',
    challenges: 'challenges',
    partners: 'partners',
    owner: 'about',
    dashboard: 'dashboard',
    admin: atob('YWRtaW4=')
  };

  const TAB_TITLES: Record<string, string> = {
    home: "Yolnoma Typing - O'zbekistonda №1 Tez Yozish Platformasi",
    typing: 'Tez Yozish Trenajyori & WPM Arena - Yolnoma Typing',
    languages: '125+ Jahon Tillari - Yolnoma Typing',
    leaderboard: 'Peshqadamlar Reytingi - Yolnoma Typing',
    battle: 'Speedway Battle Arena - Yolnoma Typing',
    lessons: '10 Barmoq Mashqlari & Saboqlar - Yolnoma Typing',
    statistics: 'Shaxsiy Statistika & Tahlil - Yolnoma Typing',
    profile: 'Foydalanuvchi Profili - Yolnoma Typing',
    login: 'Kirish & Ro\'yxatdan o\'tish - Yolnoma Typing',
    settings: 'Sozlamalar - Yolnoma Typing',
    achievements: 'Yutuqlar & Unvonlar - Yolnoma Typing',
    challenges: 'Musobaqalar & Bellashuvlar - Yolnoma Typing',
    partners: 'Hamkorlar - Yolnoma Typing',
    owner: 'Sayt Haqida & Muallif - Yolnoma Typing',
    dashboard: 'Boshqaruv Paneli - Yolnoma Typing',
    admin: 'Admin Panel - Yolnoma Typing'
  };

  // Parse path into language and tab components (supports /:lang/... and /...)
  const parsePath = useCallback((rawPath: string): { lang: 'uz' | 'ru' | 'en'; tab: string } => {
    const pathname = (rawPath || '').replace(/^\/+|\/+$/g, '').toLowerCase().split('?')[0];
    const parts = pathname.split('/').filter(Boolean);

    let detectedLang: 'uz' | 'ru' | 'en' = 'uz';
    let subParts = parts;

    if (parts.length > 0 && (parts[0] === 'uz' || parts[0] === 'ru' || parts[0] === 'en')) {
      detectedLang = parts[0] as 'uz' | 'ru' | 'en';
      subParts = parts.slice(1);
    }

    const subpath = subParts.join('/');
    const _adm = atob('YWRtaW4=');

    if (!subpath || subpath === 'home' || subpath === 'index.html') return { lang: detectedLang, tab: 'home' };
    if (subpath === 'test' || subpath === 'typing' || subpath === 'arena' || subpath.startsWith('tests') || subpath.startsWith('test/')) return { lang: detectedLang, tab: 'typing' };
    if (subpath === _adm) return { lang: detectedLang, tab: _adm };
    if (['login', 'kirish', 'auth', 'signin', 'signup', 'register'].includes(subpath)) return { lang: detectedLang, tab: 'login' };
    if (['languages', 'tillar', 'language', 'til'].includes(subpath)) return { lang: detectedLang, tab: 'languages' };
    if (['leaderboard', 'rating', 'reyting', 'top'].includes(subpath)) return { lang: detectedLang, tab: 'leaderboard' };
    if (['battle', 'arena', 'duel', 'jang'].includes(subpath)) return { lang: detectedLang, tab: 'battle' };
    if (['lessons', 'darslar', 'saboqlar'].includes(subpath)) return { lang: detectedLang, tab: 'lessons' };
    if (['statistics', 'statistika', 'stats'].includes(subpath)) return { lang: detectedLang, tab: 'statistics' };
    if (['profile', 'profil'].includes(subpath)) return { lang: detectedLang, tab: 'profile' };
    if (['settings', 'sozlamalar'].includes(subpath)) return { lang: detectedLang, tab: 'settings' };
    if (['achievements', 'yutuqlar'].includes(subpath)) return { lang: detectedLang, tab: 'achievements' };
    if (['challenges', 'musobaqalar', 'muvaffaqiyatlar'].includes(subpath)) return { lang: detectedLang, tab: 'challenges' };
    if (['partners', 'hamkorlar'].includes(subpath)) return { lang: detectedLang, tab: 'partners' };
    if (['about', 'owner', 'haqida'].includes(subpath)) return { lang: detectedLang, tab: 'owner' };
    if (['dashboard'].includes(subpath)) return { lang: detectedLang, tab: 'dashboard' };
    return { lang: detectedLang, tab: 'home' };
  }, []);

  // Active navigation tab initialized from current browser route
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const _adm = atob('YWRtaW4=');
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);

      if (hostname.startsWith(`${_adm}.`) || searchParams.get('tab') === _adm) {
        return _adm;
      }

      const redirectRoute = searchParams.get('route') || sessionStorage.getItem('yolnoma_target_tab') || sessionStorage.getItem('yolnoma_redirect_route');
      if (sessionStorage.getItem('yolnoma_target_tab')) sessionStorage.removeItem('yolnoma_target_tab');
      if (sessionStorage.getItem('yolnoma_redirect_route')) sessionStorage.removeItem('yolnoma_redirect_route');

      const pathCandidate = redirectRoute || window.location.pathname;
      const { tab } = parsePath(pathCandidate);
      return tab;
    } catch {}
    return 'home';
  });
  const prevUserRef = useRef<string | null>(null);

  // Viral challenge link detector (?wpm=85 or ?challenge=85)
  const [challengeBanner, setChallengeBanner] = useState<{ wpm: number; acc?: number } | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const wpmVal = parseInt(params.get('wpm') || params.get('challenge') || '', 10);
        if (wpmVal > 0 && wpmVal <= 350) {
          const accVal = parseInt(params.get('acc') || '', 10) || undefined;
          return { wpm: wpmVal, acc: accVal };
        }
      }
    } catch {}
    return null;
  });

  // Synchronize browser address bar with language prefix (e.g. /uz, /ru, /en, /uz/test, /uz/leaderboard)
  useEffect(() => {
    try {
      const _adm = atob('YWRtaW4=');
      if (activeTab === _adm) {
        if (window.location.pathname !== `/${_adm}`) {
          window.history.pushState({ tab: _adm }, '', `/${_adm}`);
        }
        updatePageSEO(activeTab);
        return;
      }

      const slug = TAB_TO_PATH[activeTab] ?? (activeTab === 'home' ? '' : activeTab);
      const targetUrl = slug ? `/${uiLanguage}/${slug}` : `/${uiLanguage}`;
      const currentUrl = window.location.pathname;

      if (currentUrl !== targetUrl) {
        window.history.pushState({ tab: activeTab, lang: uiLanguage }, '', targetUrl);
      }

      // Update document title and dynamic SEO/OpenGraph meta tags
      updatePageSEO(activeTab);
    } catch {}
  }, [activeTab, uiLanguage]);

  // Handle browser Back & Forward history buttons seamlessly
  useEffect(() => {
    const handlePopState = () => {
      try {
        const { lang, tab } = parsePath(window.location.pathname);
        if (lang !== uiLanguage) {
          setUiLanguage(lang);
        }
        setActiveTab(tab);
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parsePath, uiLanguage, setUiLanguage]);

  // DevTools detection state
  const [isDevToolsBlocked, setIsDevToolsBlocked] = useState<boolean>(() => antiCheatManager.isDevToolsOpen());

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('navigate_tab', handleNav);
    return () => window.removeEventListener('navigate_tab', handleNav);
  }, []);

  useEffect(() => {
    const unsubscribe = antiCheatManager.subscribeDevTools((isOpen) => {
      setIsDevToolsBlocked(isOpen);
    });
    return () => unsubscribe();
  }, []);

  // Security Shields: IP Ban, VPN, Maintenance
  const [ipBanInfo, setIpBanInfo] = useState<{
    banned: boolean;
    ip?: string;
    reason?: string;
    attackType?: string;
    bannedAt?: number;
    unbanAt?: number;
  } | null>(null);

  const [vpnInfo, setVpnInfo] = useState<{
    isVpn: boolean;
    ip?: string;
    reason?: string;
  } | null>(null);

  // Real-time Account-level Ban state
  const [userBanInfo, setUserBanInfo] = useState<{
    banned: boolean;
    reason?: string;
    bannedAt?: number;
    displayName?: string;
    username?: string;
    email?: string;
  } | null>(null);

  const [maintenanceInfo, setMaintenanceInfo] = useState<{
    active: boolean;
    title: string;
    message: string;
    estimatedTime: string;
    whitelistEmails: string[];
    updatedAt: number;
  }>({
    active: false,
    title: 'Saytda Katta Yangilanish Ketmoqda! 🛠️',
    message: 'Hurmatli foydalanuvchilar, platformada muhim yangilanish olib borilmoqda. Tez orada barcha xizmatlar toʻliq qayta ishga tushadi.',
    estimatedTime: '15 daqiqa',
    whitelistEmails: ['yuldashivagavharoy@gmail.com'],
    updatedAt: Date.now()
  });

  // Listen for Realtime DB Maintenance Mode for instant live push across all active browser tabs!
  useEffect(() => {
    try {
      const maintRef = ref(rtdb, 'system/maintenance');
      const unsub = onValue(maintRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val.active === 'boolean') {
            setMaintenanceInfo(val);
          }
        }
      });
      return () => unsub();
    } catch {}
  }, []);

  // Fast 3-second poller for Maintenance Mode propagation to all clients worldwide
  useEffect(() => {
    let isMounted = true;
    const pollMaintenance = async () => {
      try {
        const res = await fetch('/api/maintenance/status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && typeof data.active === 'boolean') {
            setMaintenanceInfo((prev) => {
              if (prev.active !== data.active || prev.updatedAt !== data.updatedAt) {
                return data;
              }
              return prev;
            });
          }
        }
      } catch {}
    };

    pollMaintenance();
    const maintInterval = setInterval(pollMaintenance, 3000);
    return () => {
      isMounted = false;
      clearInterval(maintInterval);
    };
  }, []);

  // Listen for Account-level Ban in Firebase RTDB & Profile
  useEffect(() => {
    if (!user?.uid) {
      setUserBanInfo(null);
      return;
    }

    // Root Owner Immunity: Cannot ever be banned
    const isRootOwner = user.email && (
      user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' ||
      user.email.toLowerCase().startsWith('yuldashivagavharoy')
    );
    if (isRootOwner) {
      setUserBanInfo(null);
      return;
    }

    try {
      const banRef = ref(rtdb, `bannedUsers/${user.uid}`);
      const unsub = onValue(banRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          setUserBanInfo({
            banned: true,
            reason: val?.reason || profile?.blockReason || 'Administrator tomonidan hisob toʻxtatilgan',
            bannedAt: val?.bannedAt || Date.now(),
            displayName: profile?.displayName || user.displayName || '',
            username: profile?.username || '',
            email: user.email || ''
          });
        } else if (profile?.isBanned) {
          setUserBanInfo({
            banned: true,
            reason: profile?.blockReason || 'Administrator tomonidan hisob toʻxtatilgan',
            bannedAt: profile?.bannedAt || Date.now(),
            displayName: profile?.displayName || user.displayName || '',
            username: profile?.username || '',
            email: user.email || ''
          });
        } else {
          setUserBanInfo(null);
        }
      });

      // Also listen on bannedEmails if user has email
      let emailUnsub: (() => void) | undefined;
      if (user.email) {
        const emailKey = user.email.replace(/\./g, '_').toLowerCase();
        const emailBanRef = ref(rtdb, `bannedEmails/${emailKey}`);
        emailUnsub = onValue(emailBanRef, (eSnap) => {
          if (eSnap.exists()) {
            const eVal = eSnap.val();
            setUserBanInfo({
              banned: true,
              reason: eVal?.reason || 'Administrator tomonidan hisob toʻxtatilgan',
              bannedAt: eVal?.bannedAt || Date.now(),
              displayName: profile?.displayName || user.displayName || '',
              username: profile?.username || '',
              email: user.email || ''
            });
          }
        });
      }

      return () => {
        unsub();
        if (emailUnsub) emailUnsub();
      };
    } catch {}
  }, [user?.uid, user?.email, user?.displayName, profile?.isBanned, profile?.blockReason, profile?.displayName, profile?.username]);

  // Fast 3-second poller for live account ban / kick from server-side database
  useEffect(() => {
    if (!user?.uid && !user?.email) return;

    // Root Owner Immunity
    const isRootOwner = user.email && (
      user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' ||
      user.email.toLowerCase().startsWith('yuldashivagavharoy')
    );
    if (isRootOwner) return;

    let isMounted = true;
    const checkUserBanStatus = async () => {
      try {
        const query = new URLSearchParams();
        if (user.uid) query.set('uid', user.uid);
        if (user.email) query.set('email', user.email);
        if (profile?.username) query.set('username', profile.username);

        const res = await fetch(`/api/user/ban-status?${query.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data?.isBanned) {
              setUserBanInfo({
                banned: true,
                reason: data.banInfo?.reason || 'Administrator tomonidan akkaunt bloklandi',
                bannedAt: data.banInfo?.bannedAt || Date.now(),
                displayName: profile?.displayName || user.displayName || '',
                username: profile?.username || '',
                email: user.email || ''
              });
            }
          }
        }
      } catch {}
    };

    checkUserBanStatus();
    const banInterval = setInterval(checkUserBanStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(banInterval);
    };
  }, [user?.uid, user?.email, profile?.displayName, profile?.username]);

  // Periodic security verify with backend (IP ban, VPN, Maintenance)
  useEffect(() => {
    let isMounted = true;
    const verifySecurity = async () => {
      try {
        const res = await fetchIpSecurityStatus();
        if (!isMounted) return;

        if (res.banned) {
          setIpBanInfo({
            banned: true,
            ip: res.ip,
            reason: res.banReason || "Saytga ruxsatsiz soʻrovlar yoki DDoS/DRDoS hujumlari aniqlandi",
            attackType: res.attackType || 'DDoS/DRDoS Hujumi',
            bannedAt: res.bannedAt,
            unbanAt: res.unbanAt
          });
        } else {
          setIpBanInfo(null);
        }

        if (res.isVpn) {
          setVpnInfo({
            isVpn: true,
            ip: res.ip,
            reason: res.vpnReason || 'Anonimlashtiruvchi VPN yoki Proksi server aniqlandi'
          });
        } else {
          setVpnInfo(null);
        }

        if (res.maintenance && typeof res.maintenance.active === 'boolean') {
          setMaintenanceInfo(res.maintenance);
        }
      } catch {}
    };

    verifySecurity();
    const interval = setInterval(verifySecurity, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isOwnerWhitelisted = Boolean(
    user?.email &&
    (user.email.toLowerCase() === 'yuldashivagavharoy@gmail.com' ||
     user.email.toLowerCase() === 'elbek@yolnoma.uz' ||
     (maintenanceInfo.whitelistEmails || []).some(
       (e) => e.toLowerCase() === (user?.email || '').toLowerCase()
     ))
  );

  // Modals & Battle Invite
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [aboutModalTab, setAboutModalTab] = useState<'faq' | 'privacy' | 'terms' | 'updates'>('faq');
  const [incomingInvite, setIncomingInvite] = useState<BattleInviteData | null>(null);
  const [pendingBattleRoomCode, setPendingBattleRoomCode] = useState<string | null>(null);

  // Realtime Battle Invites listener (Supports both authenticated users and guests)
  useEffect(() => {
    let myUid = user?.uid;
    if (!myUid) {
      myUid = localStorage.getItem('yolnoma_guest_id') || undefined;
    }
    if (!myUid) return;

    try {
      const inviteRef = ref(rtdb, `battles/invites/${myUid}`);
      const unsubscribe = onValue(inviteRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setIncomingInvite(data as BattleInviteData);
        } else {
          setIncomingInvite(null);
        }
      });
      return () => unsubscribe();
    } catch {
      // Ignore firebase offline error
    }
  }, [user]);

  const handleAcceptInvite = (invite: BattleInviteData) => {
    const myUid = user?.uid || localStorage.getItem('yolnoma_guest_id');
    if (myUid) {
      try {
        remove(ref(rtdb, `battles/invites/${myUid}`));
      } catch {}
    }
    setIncomingInvite(null);
    if (invite.roomId) {
      setPendingBattleRoomCode(invite.roomId);
    }
    setActiveTab('battle');
  };

  const handleDeclineInvite = (invite: BattleInviteData) => {
    const myUid = user?.uid || localStorage.getItem('yolnoma_guest_id');
    if (myUid) {
      try {
        remove(ref(rtdb, `battles/invites/${myUid}`));
      } catch {}
    }
    setIncomingInvite(null);
  };

  // Test Configurations
  const [mode, setMode] = useState<TextMode>('words');
  const [timeMode, setTimeMode] = useState<TimeMode>(30);
  const [wordCountMode, setWordCountMode] = useState<WordCountMode>(0);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy');
  const [customText, setCustomText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('javascript');
  const [quoteMeta, setQuoteMeta] = useState<{ author: string; source?: string } | undefined>();
  const [codeLang, setCodeLang] = useState<string | undefined>();
  const charStatsRef = useRef<Record<string, { total: number; errors: number }>>({});

  // Test Runtime State
  const [targetText, setTargetText] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number; rawWpm: number; errors: number }[]>([]);
  const [finalResult, setFinalResult] = useState<TypingResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When user logs in, close modal and remember user
  useEffect(() => {
    if (user) {
      localStorage.setItem('yolnoma_auth_completed', 'true');
      setIsAuthOpen(false);
    }
    prevUserRef.current = user ? user.uid : null;
  }, [user]);

  const startTimeRef = useRef<number>(0);
  const typedInputRef = useRef<string>('');
  const targetTextRef = useRef<string>('');
  const totalMistakesCountRef = useRef<number>(0);

  typedInputRef.current = typedInput;
  targetTextRef.current = targetText;
  const totalKeystrokesRef = useRef<number>(0);
  const keyTimestampsRef = useRef<number[]>([]);

  // Initialize test text
  const initTestText = useCallback(() => {
    const wordCountToGenerate = timeMode > 0 ? Math.max(120, wordCountMode) : wordCountMode;
    const generated = generateTestText(
      mode,
      language,
      difficulty,
      wordCountToGenerate,
      customText,
      codeLanguage
    );
    setTargetText(generated.rawText);
    setQuoteMeta(generated.quoteMeta);
    setCodeLang(generated.codeLang);
    charStatsRef.current = {};
    setTypedInput('');
    setIsTestActive(false);
    setIsTestFinished(false);
    setFinalResult(null);
    setWpmHistory([]);
    setElapsedSeconds(0);
    startTimeRef.current = 0;
    totalKeystrokesRef.current = 0;
    totalMistakesCountRef.current = 0;
    keyTimestampsRef.current = [];

    const initialTime = timeMode > 0 ? timeMode : 60;
    setTimeLeft(initialTime);

    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, language, difficulty, wordCountMode, customText, timeMode, codeLanguage]);

  useEffect(() => {
    initTestText();

    const handleContentUpdate = () => {
      initTestText();
    };

    // Auto-refresh text when switching back to tab/window (Monkeytype style)
    const handleFocus = () => {
      if (!startTimeRef.current && typedInputRef.current.length === 0) {
        initTestText();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !startTimeRef.current && typedInputRef.current.length === 0) {
        initTestText();
      }
    };

    window.addEventListener('custom-content-updated', handleContentUpdate);
    window.addEventListener('storage', handleContentUpdate);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Shortcut for Admin Panel (Ctrl + Shift + A or Alt + A)
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setActiveTab('admin');
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);

    return () => {
      window.removeEventListener('custom-content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleContentUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [initTestText]);

  // Scroll to top immediately when switching views/tabs
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  // Handle finish test
  const finishTest = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);
    setIsTestFinished(true);

    const now = Date.now();
    const totalSeconds = startTimeRef.current > 0
      ? Math.max(1, Math.round((now - startTimeRef.current) / 1000))
      : (elapsedSeconds > 0 ? elapsedSeconds : 1);

    const targetChars = targetTextRef.current.split('');
    const typedChars = typedInputRef.current.split('');

    let correctCount = 0;
    let wrongCount = 0;

    typedChars.forEach((ch, idx) => {
      if (idx < targetChars.length) {
        if (ch === targetChars[idx]) correctCount++;
        else wrongCount++;
      } else {
        wrongCount++;
      }
    });

    const totalAttempts = Math.max(typedChars.length, correctCount + totalMistakesCountRef.current);
    const wpm = calculateWpm(correctCount, totalSeconds, typedChars.length);
    const cpm = calculateCpm(typedChars.length, totalSeconds);
    const rawWpm = calculateWpm(typedChars.length, totalSeconds);
    const accuracy = totalAttempts > 0 ? calculateAccuracy(correctCount, totalAttempts) : 0;
    const finalErrors = Math.max(wrongCount, totalMistakesCountRef.current);

    const resultObj: Omit<TypingResult, 'userId' | 'username'> = {
      wpm,
      cpm,
      rawWpm,
      accuracy,
      errors: finalErrors,
      correctChars: correctCount,
      wrongChars: finalErrors,
      extraChars: Math.max(0, typedChars.length - targetChars.length),
      missedChars: Math.max(0, targetChars.length - typedChars.length),
      backspaceCount: 0,
      testTimeSeconds: totalSeconds,
      mode,
      timeMode,
      wordCountMode,
      difficulty,
      language,
      timestamp: Date.now(),
      wpmHistory,
      charStats: { ...charStatsRef.current },
      quoteMeta,
      codeLang
    };

    const saved = await saveTestResult(resultObj);
    setFinalResult(saved);
  }, [elapsedSeconds, timeMode, mode, wordCountMode, difficulty, language, wpmHistory, quoteMeta, codeLang, saveTestResult]);

  // Timer loop (depends ONLY on isTestActive and timeMode)
  useEffect(() => {
    if (isTestActive) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.max(1, Math.floor((now - startTimeRef.current) / 1000));
        setElapsedSeconds(elapsed);

        if (timeMode > 0) {
          const remaining = Math.max(0, timeMode - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            finishTest();
          }
        }

        // Capture wpm history point with real correct chars and error counts
        const targetCharsArr = targetTextRef.current.split('');
        const typedCharsArr = typedInputRef.current.split('');
        let currentCorrect = 0;
        let currentErrors = 0;
        typedCharsArr.forEach((ch, idx) => {
          if (idx < targetCharsArr.length) {
            if (ch === targetCharsArr[idx]) currentCorrect++;
            else currentErrors++;
          } else {
            currentErrors++;
          }
        });

        const currentWpm = calculateWpm(currentCorrect, elapsed, typedCharsArr.length);
        const rawWpm = calculateWpm(typedCharsArr.length, elapsed);
        setWpmHistory((prev) => [
          ...prev,
          { time: elapsed, wpm: currentWpm, rawWpm, errors: currentErrors }
        ]);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, timeMode, finishTest]);

  // Feature 5: Targeted practice on error-prone keys (Hook declared before ANY early returns)
  const handleStartTargetedPractice = useCallback((keys: string[]) => {
    if (!keys || keys.length === 0) return;
    const wordsPool = [
      'qalam', 'soz', 'kitob', 'shahar', 'bilim', 'yoshlar', 'maktab', 'daryo', 'havo',
      'quyosh', 'yulduz', 'daraxt', 'orol', 'dunyo', 'mehnat', 'baxt', 'fikr',
      'xalq', 'tarix', 'til', 'madaniyat', 'ilm', 'hunar', 'odamiylik', 'sabr', 'matonat',
      'vaqt', 'hayot', 'yaxshilik', 'vatan', 'kelajak', 'orzu', 'maqsad', 'harakat',
      'samarali', 'intizom', 'guzal', 'ziyo', 'maqom', 'qalb', 'suhbat', 'sabot'
    ];
    const keyLower = keys.map((k) => k.toLowerCase());
    const matched = wordsPool.filter((w) => keyLower.some((k) => w.toLowerCase().includes(k)));
    const selected = matched.length >= 4 ? matched : wordsPool.slice(0, 10);
    const customContent = [...selected, ...selected].slice(0, 16).join(' ');
    setCustomText(customContent);
    setMode('custom');
    setTimeMode(0);
    setFinalResult(null);
    setIsTestFinished(false);
  }, []);

  const handleThematicAction = useCallback((action: ThematicActionType) => {
    const navigateToArena = () => {
      setActiveTab('typing');
      setTimeout(() => {
        const arena = document.getElementById('typing-arena');
        if (arena) {
          arena.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const input = document.getElementById('typing-input-field') || document.querySelector('input[type="text"]');
        if (input) {
          (input as HTMLInputElement).focus();
        }
      }, 100);
    };

    if (action === 'battle') {
      setActiveTab('battle');
      return;
    }

    if (action === 'code') {
      setMode('code');
      setCodeLanguage('javascript');
      navigateToArena();
      return;
    }

    if (action === 'quotes') {
      setMode('quotes');
      navigateToArena();
      return;
    }

    if (action === 'uzbek-drills') {
      const uzbekSpecialText = "Oʻzbekiston goʻzal va maʼnaviy boy vatan. Shijoatli, chechan va gʻayratli yoshlar yurtimiz bayrogʻini baland koʻtarmoqda. Oʻtkir qalam, chuqur tafakkur va sharafli mehnat insonni ulugʻlaydi. Oʻzbek tili maʼnolarga boy, ohangdor va ifodali tildir.";
      setCustomText(uzbekSpecialText);
      setMode('custom');
      setTimeMode(0);
      navigateToArena();
      return;
    }

    if (action === 'symbols') {
      const symbolsText = 'const calc = (wpm, acc) => { return `WPM: ${wpm * 1.5}% [Score: #1] & {CPM: 100%};`; }; /* 100% test */';
      setCustomText(symbolsText);
      setMode('custom');
      setTimeMode(0);
      navigateToArena();
      return;
    }
  }, []);

  const handleStartHero = useCallback((targetMode?: string) => {
    if (targetMode && typeof targetMode === 'string') {
      handleThematicAction(targetMode as ThematicActionType);
      return;
    }
    setActiveTab('typing');
    setTimeout(() => {
      const arena = document.getElementById('typing-arena');
      if (arena) {
        arena.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const input = document.getElementById('typing-input-field') || document.querySelector('input[type="text"]');
      if (input) {
        (input as HTMLInputElement).focus();
      }
    }, 100);
  }, [handleThematicAction]);

  // DevTools Security Gate (Runs before loading, login, and application screens)
  if (isDevToolsBlocked) {
    return <DevToolsBlockedScreen />;
  }

  // Loading state gate (AFTER ALL HOOKS)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center space-y-3">
        <img
          src="/yolnoma_icon.svg"
          alt="Yolnoma"
          className="w-12 h-12"
        />
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Yuklanmoqda...
        </p>
      </div>
    );
  }

  // Redirect to typing test if already logged in and on login tab
  if (user && activeTab === 'login') {
    setActiveTab('typing');
  }

  // Blocked / Banned User Gate (Cloud & Device Local Anti-Cheat)
  const deviceBan = antiCheatManager.isDeviceBanned();
  if (profile && !profile.isBanned && deviceBan.banned) {
    antiCheatManager.clearDeviceBan();
  }

  const isAccountBanned = Boolean(
    userBanInfo?.banned ||
    profile?.isBanned ||
    deviceBan.banned
  );

  if (isAccountBanned && !isOwnerWhitelisted) {
    const effectiveReason =
      userBanInfo?.reason ||
      profile?.blockReason ||
      deviceBan.reason ||
      'Qoidabuzarlik, sunʼiy avto-kliker dasturlaridan foydalanish yoki ruxsatsiz xatti-harakatlar aniqlangani sababli hisob toʻxtatildi.';
    const effectiveBannedAt =
      userBanInfo?.bannedAt ||
      profile?.bannedAt ||
      Date.now();

    return (
      <UserBlockedScreen
        reason={effectiveReason}
        bannedAt={effectiveBannedAt}
        displayName={userBanInfo?.displayName || profile?.displayName || user.displayName || 'Foydalanuvchi'}
        username={userBanInfo?.username || profile?.username || ''}
        email={userBanInfo?.email || profile?.email || user.email || ''}
      />
    );
  }

  // Input change handler
  const handleInputChange = (newInput: string) => {
    if (isTestFinished) return;

    const now = Date.now();
    keyTimestampsRef.current.push(now);

    // Anti-cheat Bot Detection Engine
    if (keyTimestampsRef.current.length >= 15) {
      const timestamps = keyTimestampsRef.current.slice(-20);
      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;

      // Bot rules:
      // 1. Average interval < 12ms (unrealistically fast > 1000 WPM)
      // 2. Variance == 0 (robotic constant timer)
      // 3. Impossibly high WPM (> 320 WPM)
      if (avgInterval < 12 || (variance === 0 && intervals.length > 10) || liveWpm > 320) {
        if (user) {
          const reason = 'Anti-Cheat: Avto-kliker yoki robot/bot dasturi ishlatilgani sababli akkauntingiz bloklandi.';
          try {
            update(ref(rtdb, `users/${user.uid}`), {
              isBanned: true,
              blockReason: reason
            });
          } catch {}
        }
        return;
      }
    }

    if (!isTestActive && newInput.length > 0) {
      startTimeRef.current = Date.now();
      setIsTestActive(true);
    }

    if (newInput.length > typedInput.length) {
      const addedCount = newInput.length - typedInput.length;
      totalKeystrokesRef.current += addedCount;

      // Track errors on newly typed characters and per-character statistics
      const startIndex = typedInput.length;
      for (let i = startIndex; i < newInput.length; i++) {
        const charTyped = newInput[i];
        const targetChar = targetText[i];
        const keyChar = (targetChar || charTyped || '').toLowerCase();

        if (keyChar) {
          if (!charStatsRef.current[keyChar]) {
            charStatsRef.current[keyChar] = { total: 0, errors: 0 };
          }
          charStatsRef.current[keyChar].total += 1;
        }

        if (targetChar === undefined || charTyped !== targetChar) {
          totalMistakesCountRef.current += 1;
          if (keyChar && charStatsRef.current[keyChar]) {
            charStatsRef.current[keyChar].errors += 1;
          }
        }
      }
    }

    setTypedInput(newInput);

    // Infinite Word Expansion for Time Mode
    if (timeMode > 0 && mode !== 'custom') {
      const remainingChars = targetText.length - newInput.length;
      if (remainingChars < 120) {
        const extraBatch = generateTestText(mode, language, difficulty, 60);
        setTargetText((prev) => prev + ' ' + extraBatch.rawText);
      }
    }

    // Finish test logic: for word count mode or custom text mode
    if (timeMode === 0 || mode === 'custom') {
      if (newInput.length >= targetText.length && targetText.length > 0) {
        finishTest();
      }
    }
  };

  // Live stats calculation with zero-allocation (ultra-fast, zero GC/CPU load)
  const hasStartedTyping = typedInput.length > 0 && isTestActive && startTimeRef.current > 0;
  const liveElapsed = hasStartedTyping
    ? Math.max(0.5, (Date.now() - startTimeRef.current) / 1000)
    : 0;

  let liveCorrect = 0;
  const typedLen = typedInput.length;
  for (let i = 0; i < typedLen; i++) {
    if (typedInput[i] === targetText[i]) {
      liveCorrect++;
    }
  }

  const totalAttemptedKeystrokes = Math.max(typedInput.length, liveCorrect + totalMistakesCountRef.current);
  const liveWpm = hasStartedTyping && typedInput.length > 0
    ? calculateWpm(liveCorrect, liveElapsed, typedInput.length)
    : 0;
  const liveCpm = hasStartedTyping && typedInput.length > 0
    ? calculateCpm(typedInput.length, liveElapsed)
    : 0;
  const liveAcc = totalAttemptedKeystrokes > 0 && liveCorrect > 0
    ? calculateAccuracy(liveCorrect, totalAttemptedKeystrokes)
    : (totalAttemptedKeystrokes > 0 && totalMistakesCountRef.current > 0 ? 0 : 0);
  const progressPercent = Math.min(100, (typedInput.length / Math.max(1, targetText.length)) * 100);

  const currentTargetChar = targetText[typedInput.length] || '';

  // 1. IP Ban check (Malicious DDoS/DRDoS attack IP blocked)
  if (ipBanInfo?.banned) {
    return (
      <IpBlockedScreen
        ip={ipBanInfo.ip}
        reason={ipBanInfo.reason}
        attackType={ipBanInfo.attackType}
        bannedAt={ipBanInfo.bannedAt}
        unbanAt={ipBanInfo.unbanAt}
      />
    );
  }

  // 2. Anti-VPN check (VPN detected)
  if (vpnInfo?.isVpn && !isOwnerWhitelisted) {
    return (
      <VpnBlockedScreen
        detectedIp={vpnInfo.ip}
        detectedReason={vpnInfo.reason}
      />
    );
  }

  // 3. Maintenance check (Site under maintenance, push to all users except owner)
  if (maintenanceInfo.active && !isOwnerWhitelisted) {
    return (
      <MaintenanceScreen
        title={maintenanceInfo.title}
        message={maintenanceInfo.message}
        estimatedTime={maintenanceInfo.estimatedTime}
        updatedAt={maintenanceInfo.updatedAt}
      />
    );
  }

  // 4. DevTools inspection block
  if (isDevToolsBlocked) {
    return <DevToolsBlockedScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-200 overflow-x-clip w-full">
      {/* Whitelisted Owner Notice during Active Maintenance */}
      {maintenanceInfo.active && isOwnerWhitelisted && (
        <div className="bg-rose-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-lg border-b border-rose-700">
          <Wrench className="w-4 h-4 animate-spin shrink-0" />
          <span>
            🛠️ Sayt yangilanish rejimida (Barcha oddiy foydalanuvchilarga yopilgan). Siz Bosh Administrator (<strong>{user?.email}</strong>) sifatida ishlamoqdasiz.
          </span>
        </div>
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setActiveTab('login')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 overflow-x-clip">
        {activeTab === 'home' && (
          <HomePage
            onStartTyping={handleStartHero}
            onGoToBattle={() => setActiveTab('battle')}
            onViewFullLeaderboard={() => setActiveTab('leaderboard')}
            onOpenLogin={() => setActiveTab('login')}
          />
        )}

        {activeTab === 'typing' && (
          <TypingPage
            mode={mode}
            setMode={setMode}
            timeMode={timeMode}
            setTimeMode={setTimeMode}
            wordCountMode={wordCountMode}
            setWordCountMode={setWordCountMode}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            customText={customText}
            setCustomText={setCustomText}
            codeLanguage={codeLanguage}
            setCodeLanguage={setCodeLanguage}
            isTestActive={isTestActive}
            isTestFinished={isTestFinished}
            setIsTestFinished={setIsTestFinished}
            targetText={targetText}
            typedInput={typedInput}
            handleInputChange={handleInputChange}
            initTestText={initTestText}
            quoteMeta={quoteMeta}
            codeLang={codeLang}
            currentTargetChar={currentTargetChar}
            liveWpm={liveWpm}
            liveCpm={liveCpm}
            liveAcc={liveAcc}
            timeLeft={timeLeft}
            elapsedSeconds={elapsedSeconds}
            progressPercent={progressPercent}
            finalResult={finalResult}
            challengeBanner={challengeBanner}
            setChallengeBanner={setChallengeBanner}
            onOpenLanguagePage={() => setActiveTab('languages')}
            onGoToLeaderboard={() => {
              setIsTestFinished(false);
              setActiveTab('leaderboard');
            }}
            onOpenLogin={() => {
              setIsTestFinished(false);
              setActiveTab('login');
            }}
            onStartTargetedPractice={handleStartTargetedPractice}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        <React.Suspense fallback={<ViewLoadingFallback />}>
          {activeTab === 'languages' && (
            <LanguageSelectView
              onConfirm={() => {
                initTestText();
                setActiveTab('typing');
              }}
              onCancel={() => setActiveTab('typing')}
            />
          )}

          {activeTab === 'lessons' && <LessonsView />}
          {activeTab === 'battle' && (
            <BattleView
              initialRoomCode={pendingBattleRoomCode}
              onClearInitialRoomCode={() => setPendingBattleRoomCode(null)}
            />
          )}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'leaderboard' && (
            <LeaderboardPage
              onOpenLogin={() => setActiveTab('login')}
              onBackToHome={() => setActiveTab('home')}
            />
          )}
          {activeTab === 'statistics' && <StatisticsView />}
          {activeTab === 'achievements' && <AchievementsView />}
          {activeTab === 'challenges' && <ChallengesView onStartChallenge={() => setActiveTab('typing')} />}
          {activeTab === 'partners' && <PartnersView />}
          {activeTab === 'owner' && (
            <OwnerAboutView
              onStartTyping={() => setActiveTab('typing')}
              onGoToBattle={() => setActiveTab('battle')}
              onGoToLessons={() => setActiveTab('lessons')}
              onGoToLeaderboard={() => setActiveTab('leaderboard')}
            />
          )}
          {activeTab === 'admin' && <AdminView />}
          {activeTab === 'profile' && (
            <ProfileView
              onOpenAuth={() => setActiveTab('login')}
              onSavedHome={() => setActiveTab('typing')}
            />
          )}
          {activeTab === 'login' && (
            <LoginPage
              onSuccess={() => setActiveTab('typing')}
              onBackToTyping={() => setActiveTab('typing')}
            />
          )}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'not_found' && (
            <NotFoundView
              onGoHome={() => setActiveTab('typing')}
              onNavigate={(tab) => setActiveTab(tab)}
              attemptedPath={window.location.pathname}
            />
          )}
        </React.Suspense>
      </main>

      <Footer
        onOpenAbout={() => {
          setAboutModalTab('faq');
          setIsAboutOpen(true);
        }}
        onOpenUpdates={() => {
          setAboutModalTab('updates');
          setIsAboutOpen(true);
        }}
        onOpenOwner={() => setActiveTab('owner')}
        onOpenAdmin={() => setActiveTab('admin')}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <PubgInviteModal
        invite={incomingInvite}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AboutModal
        isOpen={isAboutOpen}
        initialTab={aboutModalTab}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <I18nProvider>
          <MainAppContent />
        </I18nProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
