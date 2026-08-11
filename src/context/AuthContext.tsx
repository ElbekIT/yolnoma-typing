import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { ref, set, update, push, get, child, onValue } from 'firebase/database';
import { auth, rtdb, googleProvider } from '../config/firebase';
import { UserProfile, TypingResult, LanguageCode, UserNotificationItem } from '../types';
import confetti from 'canvas-confetti';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  notifications: UserNotificationItem[];
  addNotification: (title: string, message: string, type?: UserNotificationItem['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  followUser: (targetUid: string) => Promise<void>;
  unfollowUser: (targetUid: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportPersonalData: () => void;
  adminUpdateUser: (targetUid: string, updates: Partial<UserProfile>) => Promise<void>;
  saveTestResult: (result: Omit<TypingResult, 'userId' | 'username'>) => Promise<TypingResult>;
  userResultsHistory: TypingResult[];
  refreshHistory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userResultsHistory, setUserResultsHistory] = useState<TypingResult[]>([]);
  const [notifications, setNotifications] = useState<UserNotificationItem[]>([
    {
      id: 'welcome-1',
      title: 'Yolnoma Typing Platformaga Xush Kelibsiz! ⚡',
      message: 'Klaviatura tezligingizni oshiring, darajangizni yuksaltiring va reytingda 1-o\'rinni egallang.',
      timestamp: Date.now() - 60000,
      read: false,
      type: 'info'
    }
  ]);

  const addNotification = (title: string, message: string, type: UserNotificationItem['type'] = 'info') => {
    const newItem: UserNotificationItem = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      type
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Local Storage Helpers
  const getLocalResults = (): TypingResult[] => {
    try {
      const saved = localStorage.getItem('yolnoma_results_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveLocalResults = (results: TypingResult[]) => {
    try {
      localStorage.setItem('yolnoma_results_history', JSON.stringify(results.slice(0, 100)));
    } catch (e) {
      console.warn('LocalStorage save results error:', e);
    }
  };

  const getSavedLocalProfile = (uid: string): UserProfile | null => {
    try {
      const saved = localStorage.getItem(`yolnoma_user_profile_${uid}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const saveLocalProfile = (uid: string, prof: UserProfile) => {
    try {
      localStorage.setItem(`yolnoma_user_profile_${uid}`, JSON.stringify(prof));
    } catch (e) {
      console.warn('LocalStorage save profile error:', e);
    }
  };

  const createDefaultProfile = (firebaseUser: User): UserProfile => {
    const cached = getSavedLocalProfile(firebaseUser.uid);
    if (cached) return cached;

    const username = firebaseUser.displayName
      ? firebaseUser.displayName.toLowerCase().replace(/\s+/g, '_').substring(0, 18)
      : firebaseUser.email
      ? firebaseUser.email.split('@')[0]
      : `typer_${Math.floor(1000 + Math.random() * 9000)}`;

    const fresh: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      username,
      displayName: firebaseUser.displayName || username,
      avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${firebaseUser.uid}`,
      bannerColor: '#38bdf8',
      createdAt: Date.now(),
      lastActive: Date.now(),
      xp: 250,
      level: 1,
      rankTitle: 'Typing Novice',
      role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
      isVerified: false,
      usernameChangesLeft: 2,
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      pinnedAchievements: [],
      privacy: {
        profileVisibility: 'public',
        allowMessages: 'everyone',
        showOnlineStatus: true,
        showStats: true,
        allowFollow: true
      },
      socialLinks: { twitter: '', github: '', discord: '', website: '' },
      notificationsConfig: { emailAlerts: true, achievementAlerts: true, streakReminders: true },
      unlockedAchievements: ['first_test'],
      totalTests: 0,
      totalTimeTypedSeconds: 0,
      totalWordsTyped: 0,
      totalCharsTyped: 0,
      highestWpm: 0,
      highestAccuracy: 0,
      averageWpm: 0,
      currentStreak: 1,
      longestStreak: 1,
      isPublic: true,
      country: '🇺🇿 Uzbekistan',
      bio: 'Yolnoma typing ishtirokchisi'
    };

    saveLocalProfile(firebaseUser.uid, fresh);
    return fresh;
  };

  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const local = getSavedLocalProfile(firebaseUser.uid);
    const fallback = local || createDefaultProfile(firebaseUser);

    // Sync from Realtime Database in background
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `users/${firebaseUser.uid}`));
      if (snapshot.exists()) {
        const remoteData = snapshot.val() as UserProfile;
        const merged: UserProfile = {
          ...fallback,
          ...remoteData,
          lastActive: Date.now()
        };
        saveLocalProfile(firebaseUser.uid, merged);
        return merged;
      } else {
        // Save fallback to RTDB
        await set(ref(rtdb, `users/${firebaseUser.uid}`), fallback);
        await set(ref(rtdb, `leaderboard/${firebaseUser.uid}`), {
          uid: fallback.uid,
          displayName: fallback.displayName,
          username: fallback.username,
          highestWpm: fallback.highestWpm || 0,
          highestAccuracy: fallback.highestAccuracy || 0,
          country: fallback.country || '🇺🇿 Uzbekistan',
          level: fallback.level || 1,
          rankTitle: fallback.rankTitle || 'Typing Novice',
          bio: fallback.bio || '',
          avatarUrl: fallback.avatarUrl || '',
          totalTests: fallback.totalTests || 0,
          lastActive: Date.now()
        });
      }
    } catch (e) {
      console.warn('RTDB profile sync fallback:', e);
    }

    return fallback;
  };

  const refreshHistory = async () => {
    setUserResultsHistory(getLocalResults());
  };

  useEffect(() => {
    // Handle OAuth redirect result if any
    getRedirectResult(auth)
      .then(async (res) => {
        if (res && res.user) {
          const p = await fetchOrCreateProfile(res.user);
          setProfile(p);
          addNotification('Xush kelibsiz!', `Salom, ${p.displayName}!`);
        }
      })
      .catch((err) => console.error('Redirect result error:', err));

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    let rtdbUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (rtdbUnsub) {
        rtdbUnsub();
        rtdbUnsub = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        const instantProfile = createDefaultProfile(firebaseUser);
        setProfile(instantProfile);
        setLoading(false);

        // Live Realtime listener for Instant Bans / Admin Updates
        try {
          const userRef = ref(rtdb, `users/${firebaseUser.uid}`);
          rtdbUnsub = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const liveData = snapshot.val() as Partial<UserProfile>;
              setProfile((prev) => {
                if (!prev) return liveData as UserProfile;
                return {
                  ...prev,
                  ...liveData,
                  isBanned: !!liveData.isBanned,
                  blockReason: liveData.blockReason || prev.blockReason
                };
              });
            }
          });
        } catch (err) {
          console.warn('Realtime profile listener error:', err);
        }

        // Fetch & sync full RTDB profile in background
        fetchOrCreateProfile(firebaseUser)
          .then((p) => {
            if (p) setProfile(p);
          })
          .catch((err) => console.warn('Async RTDB profile sync:', err));
      } else {
        setUser(null);
        setProfile(null);
        setUserResultsHistory(getLocalResults());
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      if (rtdbUnsub) rtdbUnsub();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const p = await fetchOrCreateProfile(res.user);
        setProfile(p);
        addNotification('Google orqali kirdingiz', `Xush kelibsiz, ${p.displayName}!`);
      }
    } catch (err: any) {
      console.warn('Google Popup error, fallback to redirect:', err);
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/unauthorized-domain'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const registerWithEmail = async (email: string, pass: string, username: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: username });
      const p = createDefaultProfile(res.user);
      p.username = username;
      p.displayName = username;
      saveLocalProfile(res.user.uid, p);
      setProfile(p);

      // Async write to RTDB
      set(ref(rtdb, `users/${res.user.uid}`), p).catch(() => {});
      set(ref(rtdb, `leaderboard/${res.user.uid}`), {
        uid: p.uid,
        displayName: p.displayName,
        username: p.username,
        highestWpm: 0,
        highestAccuracy: 0,
        country: p.country,
        level: p.level,
        rankTitle: p.rankTitle,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        totalTests: 0,
        lastActive: Date.now()
      }).catch(() => {});

      addNotification('Ro\'yhatdan o\'tildi!', `Xush kelibsiz, @${username}!`);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      const p = await fetchOrCreateProfile(res.user);
      setProfile(p);
      addNotification('Xush kelibsiz!', `Tizimga kirdingiz: ${p.displayName}`);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    addNotification('Parol tiklash yuborildi', `${email} pochtangizni tekshiring.`);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setUserResultsHistory(getLocalResults());
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = { ...profile, ...updates, lastActive: Date.now() };
    setProfile(updated);

    if (user) {
      saveLocalProfile(user.uid, updated);

      // Sync directly to Realtime Database
      try {
        await update(ref(rtdb, `users/${user.uid}`), updates);
        await update(ref(rtdb, `leaderboard/${user.uid}`), {
          uid: user.uid,
          displayName: updated.displayName,
          username: updated.username,
          highestWpm: updated.highestWpm || 0,
          time15Wpm: updated.time15Wpm || 0,
          time30Wpm: updated.time30Wpm || 0,
          time60Wpm: updated.time60Wpm || 0,
          time120Wpm: updated.time120Wpm || 0,
          highestAccuracy: updated.highestAccuracy || 0,
          country: updated.country || '🇺🇿 Uzbekistan',
          level: updated.level || 1,
          xp: updated.xp || 250,
          rankTitle: updated.rankTitle || 'Typing Novice',
          bio: updated.bio || '',
          avatarUrl: updated.avatarUrl || '',
          totalTests: updated.totalTests || 0,
          lastActive: Date.now()
        });
      } catch (err) {
        console.warn('Update profile RTDB error:', err);
      }
    }
  };

  const followUser = async (targetUid: string) => {
    if (!profile || !user) return;
    const isFollowing = profile.following.includes(targetUid);
    const newFollowing = isFollowing
      ? profile.following.filter((id) => id !== targetUid)
      : [...profile.following, targetUid];

    await updateUserProfile({
      following: newFollowing,
      followingCount: newFollowing.length
    });
  };

  const unfollowUser = async (targetUid: string) => {
    await followUser(targetUid);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      addNotification('Hisob o\'chirildi', 'Hisobingiz muvaffaqiyatli o\'chirildi.', 'warning');
      localStorage.removeItem(`yolnoma_user_profile_${user.uid}`);
      await deleteUser(user);
      setUser(null);
      setProfile(null);
      setUserResultsHistory([]);
      localStorage.removeItem('yolnoma_results_history');
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  };

  const exportPersonalData = () => {
    if (!profile) return;
    const exportObject = {
      profile,
      typingHistory: userResultsHistory,
      exportDate: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `yolnoma_data_${profile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addNotification('Ma\'lumotlar yuklab olindi', 'Profilingiz fayli saqlandi.');
  };

  const adminUpdateUser = async (targetUid: string, updates: Partial<UserProfile>) => {
    try {
      await update(ref(rtdb, `users/${targetUid}`), updates);
      if (profile && profile.uid === targetUid) {
        setProfile({ ...profile, ...updates });
      }
      addNotification('Admin Update', `User updated: ${targetUid.slice(0, 8)}`);
    } catch (err) {
      console.error('Admin update failed:', err);
    }
  };

  const getGuestId = (): string => {
    try {
      let gid = localStorage.getItem('yolnoma_guest_id');
      if (!gid) {
        gid = `guest_${Math.floor(10000 + Math.random() * 90000)}`;
        localStorage.setItem('yolnoma_guest_id', gid);
      }
      return gid;
    } catch {
      return `guest_${Math.floor(10000 + Math.random() * 90000)}`;
    }
  };

  const saveTestResult = async (rawResult: Omit<TypingResult, 'userId' | 'username'>): Promise<TypingResult> => {
    const guestId = getGuestId();
    const userId = user ? user.uid : guestId;
    const username = profile ? profile.username : `guest_${guestId.replace('guest_', '')}`;

    const existingPBest = profile ? profile.highestWpm : Number(localStorage.getItem('yolnoma_guest_best_wpm') || 0);
    const isPersonalBest = rawResult.wpm > existingPBest;

    if (isPersonalBest) {
      if (!profile) {
        localStorage.setItem('yolnoma_guest_best_wpm', String(rawResult.wpm));
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti safeguard
      }
    }

    const fullResult: TypingResult = {
      ...rawResult,
      userId,
      username,
      isPersonalBest,
      timestamp: Date.now()
    };

    // Update local history
    const currentLocal = getLocalResults();
    const newLocal = [fullResult, ...currentLocal];
    saveLocalResults(newLocal);
    setUserResultsHistory(newLocal);

    if (user && profile) {
      // Calculate updated stats
      const xpEarned = Math.round(fullResult.wpm * (fullResult.accuracy / 100) * 2) + 25;
      const newXp = profile.xp + xpEarned;
      const newLevel = Math.floor(newXp / 500) + 1;

      if (newLevel > profile.level) {
        addNotification('YANGI DARAJA! 🎉', `Tabriklaymiz! ${newLevel}-darajaga erishdingiz!`, 'level_up');
      }

      let rankTitle = 'Typing Novice';
      if (newLevel >= 5) rankTitle = 'Keyboard Warrior';
      if (newLevel >= 10) rankTitle = 'Speed Demon';
      if (newLevel >= 20) rankTitle = 'Cyber Legend';

      const newTotalTests = profile.totalTests + 1;
      const newTimeTyped = profile.totalTimeTypedSeconds + fullResult.testTimeSeconds;
      const newWordsTyped = profile.totalWordsTyped + Math.round(fullResult.correctChars / 5);
      const newCharsTyped = profile.totalCharsTyped + fullResult.correctChars;
      const newHighestWpm = Math.max(profile.highestWpm || 0, fullResult.wpm);

      const newTime15 = fullResult.timeMode === 15 ? Math.max(profile.time15Wpm || 0, fullResult.wpm) : (profile.time15Wpm || 0);
      const newTime30 = fullResult.timeMode === 30 ? Math.max(profile.time30Wpm || 0, fullResult.wpm) : (profile.time30Wpm || 0);
      const newTime60 = fullResult.timeMode === 60 ? Math.max(profile.time60Wpm || 0, fullResult.wpm) : (profile.time60Wpm || 0);
      const newTime120 = fullResult.timeMode === 120 ? Math.max(profile.time120Wpm || 0, fullResult.wpm) : (profile.time120Wpm || 0);

      const newHighestAccuracy = isPersonalBest || !profile.highestAccuracy ? fullResult.accuracy : profile.highestAccuracy;
      const newAvgWpm = Math.round((profile.averageWpm * profile.totalTests + fullResult.wpm) / newTotalTests);

      const profileUpdates: Partial<UserProfile> = {
        totalTests: newTotalTests,
        totalTimeTypedSeconds: newTimeTyped,
        totalWordsTyped: newWordsTyped,
        totalCharsTyped: newCharsTyped,
        highestWpm: newHighestWpm,
        time15Wpm: newTime15,
        time30Wpm: newTime30,
        time60Wpm: newTime60,
        time120Wpm: newTime120,
        highestAccuracy: newHighestAccuracy,
        averageWpm: newAvgWpm,
        xp: newXp,
        level: newLevel,
        rankTitle,
        lastActive: Date.now()
      };

      await updateUserProfile(profileUpdates);

      // Save result in RTDB
      try {
        const resultRef = push(ref(rtdb, `results/${userId}`));
        await set(resultRef, fullResult);
      } catch (err) {
        console.warn('RTDB save result error:', err);
      }
    } else {
      // Guest User - Push live score to RTDB Leaderboard
      try {
        const guestBest = Math.max(rawResult.wpm, Number(localStorage.getItem('yolnoma_guest_best_wpm') || 0));
        const guest15 = rawResult.timeMode === 15 ? Math.max(rawResult.wpm, Number(localStorage.getItem('yolnoma_guest_15_wpm') || 0)) : Number(localStorage.getItem('yolnoma_guest_15_wpm') || 0);
        const guest30 = rawResult.timeMode === 30 ? Math.max(rawResult.wpm, Number(localStorage.getItem('yolnoma_guest_30_wpm') || 0)) : Number(localStorage.getItem('yolnoma_guest_30_wpm') || 0);
        const guest60 = rawResult.timeMode === 60 ? Math.max(rawResult.wpm, Number(localStorage.getItem('yolnoma_guest_60_wpm') || 0)) : Number(localStorage.getItem('yolnoma_guest_60_wpm') || 0);
        const guest120 = rawResult.timeMode === 120 ? Math.max(rawResult.wpm, Number(localStorage.getItem('yolnoma_guest_120_wpm') || 0)) : Number(localStorage.getItem('yolnoma_guest_120_wpm') || 0);

        if (rawResult.timeMode === 15) localStorage.setItem('yolnoma_guest_15_wpm', String(guest15));
        if (rawResult.timeMode === 30) localStorage.setItem('yolnoma_guest_30_wpm', String(guest30));
        if (rawResult.timeMode === 60) localStorage.setItem('yolnoma_guest_60_wpm', String(guest60));
        if (rawResult.timeMode === 120) localStorage.setItem('yolnoma_guest_120_wpm', String(guest120));

        await set(ref(rtdb, `leaderboard/${guestId}`), {
          uid: guestId,
          displayName: `Mehmon (${guestId.replace('guest_', '')})`,
          username: guestId,
          highestWpm: guestBest,
          time15Wpm: guest15,
          time30Wpm: guest30,
          time60Wpm: guest60,
          time120Wpm: guest120,
          highestAccuracy: rawResult.accuracy,
          country: '🇺🇿 Uzbekistan',
          level: 1,
          rankTitle: 'Mehmon Typer',
          bio: 'Tezkor Mehmon Foydalanuvchi',
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${guestId}`,
          lastActive: Date.now(),
          totalTests: (getLocalResults().length || 1)
        });
      } catch (e) {
        console.warn('Guest RTDB sync error:', e);
      }
    }

    return fullResult;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        notifications,
        addNotification,
        markNotificationRead,
        clearNotifications,
        signInWithGoogle,
        registerWithEmail,
        loginWithEmail,
        resetPassword,
        logout,
        updateUserProfile,
        followUser,
        unfollowUser,
        deleteAccount,
        exportPersonalData,
        adminUpdateUser,
        saveTestResult,
        userResultsHistory,
        refreshHistory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

