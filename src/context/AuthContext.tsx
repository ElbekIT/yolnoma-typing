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
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ref, set, update, push } from 'firebase/database';
import { auth, db, rtdb, googleProvider } from '../config/firebase';
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
      title: 'Welcome to Yolnoma Typing! ⚡',
      message: 'Practice your speed, earn XP, unlock badges, and compete globally.',
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

  // Load local results for guests or offline
  const getLocalResults = (): TypingResult[] => {
    try {
      const saved = localStorage.getItem('yolnoma_results_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveLocalResults = (results: TypingResult[]) => {
    localStorage.setItem('yolnoma_results_history', JSON.stringify(results.slice(0, 100)));
  };

  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        // Merge missing defaults if profile is legacy
        const merged: UserProfile = {
          ...data,
          usernameChangesLeft: data.usernameChangesLeft ?? 2,
          xp: data.xp ?? 250,
          level: data.level ?? 1,
          rankTitle: data.rankTitle || 'Typing Novice',
          role: data.role || (firebaseUser.email?.includes('admin') ? 'admin' : 'user'),
          followers: data.followers || [],
          following: data.following || [],
          pinnedAchievements: data.pinnedAchievements || [],
          privacy: data.privacy || {
            profileVisibility: 'public',
            allowMessages: 'everyone',
            showOnlineStatus: true,
            showStats: true,
            allowFollow: true
          },
          socialLinks: data.socialLinks || { twitter: '', github: '', discord: '', website: '' },
          lastActive: Date.now()
        };

        await updateDoc(userDocRef, { lastActive: Date.now() }).catch(() => {});
        return merged;
      }
    } catch {
      // Offline fallback profile
    }

    // Default new profile
    const username = firebaseUser.displayName
      ? firebaseUser.displayName.toLowerCase().replace(/\s+/g, '_').substring(0, 18)
      : firebaseUser.email
      ? firebaseUser.email.split('@')[0]
      : `typer_${Math.floor(1000 + Math.random() * 9000)}`;

    const newProfile: UserProfile = {
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
      isPublic: true
    };

    try {
      await setDoc(userDocRef, newProfile);
      await set(ref(rtdb, `users/${firebaseUser.uid}`), newProfile);
      await set(ref(rtdb, `leaderboard/${firebaseUser.uid}`), {
        uid: firebaseUser.uid,
        displayName: newProfile.displayName,
        username: newProfile.username,
        highestWpm: newProfile.highestWpm,
        highestAccuracy: newProfile.highestAccuracy,
        country: newProfile.country || '🇺🇿 Uzbekistan',
        level: newProfile.level,
        rankTitle: newProfile.rankTitle,
        bio: newProfile.bio || '',
        avatarUrl: newProfile.avatarUrl || '',
        lastActive: Date.now()
      });
    } catch {
      // Storage offline catch
    }

    return newProfile;
  };

  const refreshHistory = async () => {
    if (!user) {
      setUserResultsHistory(getLocalResults());
      return;
    }
    try {
      const q = query(
        collection(db, 'typingResults'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const items: TypingResult[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as TypingResult);
      });
      setUserResultsHistory(items);
    } catch {
      setUserResultsHistory(getLocalResults());
    }
  };

  useEffect(() => {
    // Check redirect result on mount
    getRedirectResult(auth)
      .then(async (res) => {
        if (res && res.user) {
          const p = await fetchOrCreateProfile(res.user);
          setProfile(p);
          addNotification('Google Login Successful', `Welcome back, ${p.displayName}!`);
        }
      })
      .catch((err) => console.error('Redirect result error:', err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await fetchOrCreateProfile(firebaseUser);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
        setUserResultsHistory(getLocalResults());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshHistory();
    } else {
      setUserResultsHistory(getLocalResults());
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const p = await fetchOrCreateProfile(res.user);
        setProfile(p);
        addNotification('Google Login Successful', `Welcome back, ${p.displayName}!`);
      }
    } catch (err: any) {
      console.warn('Google Popup Sign In Error, attempting redirect fallback:', err);
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/unauthorized-domain'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          console.error('Google Redirect Error:', redirectErr);
          throw redirectErr;
        }
      } else {
        throw err;
      }
    }
  };

  const registerWithEmail = async (email: string, pass: string, username: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: username });
      const p = await fetchOrCreateProfile(res.user);
      p.username = username;
      p.displayName = username;
      setProfile(p);
      try {
        await updateDoc(doc(db, 'users', res.user.uid), { username, displayName: username });
      } catch {
        // Handle offline
      }
      addNotification('Account Created!', `Welcome to Yolnoma Typing, @${username}!`);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      const p = await fetchOrCreateProfile(res.user);
      setProfile(p);
      addNotification('Welcome Back!', `Signed in as ${p.displayName}`);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    addNotification('Password Reset Sent', `Check ${email} for password reset instructions.`);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setUserResultsHistory(getLocalResults());
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (updates.username && updates.username !== profile.username) {
      addNotification('Username Changed', `Your username was changed to @${updates.username}.`);
    }

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
      } catch (err) {
        console.error('Update profile firestore error:', err);
      }
      try {
        await update(ref(rtdb, `users/${user.uid}`), updates);
        await update(ref(rtdb, `leaderboard/${user.uid}`), {
          uid: user.uid,
          displayName: updated.displayName,
          username: updated.username,
          highestWpm: updated.highestWpm,
          highestAccuracy: updated.highestAccuracy,
          country: updated.country || '🇺🇿 Uzbekistan',
          level: updated.level,
          rankTitle: updated.rankTitle || 'Typing Novice',
          bio: updated.bio || '',
          avatarUrl: updated.avatarUrl || '',
          lastActive: Date.now()
        });
      } catch (err) {
        console.error('Update profile RTDB error:', err);
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

    addNotification(
      isFollowing ? 'Unfollowed User' : 'Following User',
      isFollowing ? 'You unfollowed this user.' : 'You are now following this user!'
    );
  };

  const unfollowUser = async (targetUid: string) => {
    await followUser(targetUid);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      addNotification('Account Deleted', 'Your account and data were permanently removed.', 'warning');
      await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});
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

    addNotification('Data Export Completed', 'Your personal account JSON file has been downloaded.');
  };

  const adminUpdateUser = async (targetUid: string, updates: Partial<UserProfile>) => {
    try {
      await updateDoc(doc(db, 'users', targetUid), updates);
      if (profile && profile.uid === targetUid) {
        setProfile({ ...profile, ...updates });
      }
      addNotification('Admin Update Executed', `Successfully updated profile for UID: ${targetUid.slice(0, 8)}...`);
    } catch (err) {
      console.error('Admin update failed:', err);
    }
  };

  const saveTestResult = async (rawResult: Omit<TypingResult, 'userId' | 'username'>): Promise<TypingResult> => {
    const userId = user ? user.uid : 'guest';
    const username = profile ? profile.username : 'Guest Typer';

    // Check personal best
    const existingPBest = profile ? profile.highestWpm : (getLocalResults()[0]?.wpm || 0);
    const isPersonalBest = rawResult.wpm > existingPBest;

    if (isPersonalBest) {
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
      // Save result document in Firestore and Realtime Database
      try {
        const docRef = await addDoc(collection(db, 'typingResults'), fullResult);
        fullResult.id = docRef.id;

        // Save to RTDB
        const rtdbResultRef = push(ref(rtdb, `results/${userId}`));
        await set(rtdbResultRef, fullResult);

        // Also push to leaderboards
        await addDoc(collection(db, 'leaderboards'), {
          resultId: docRef.id,
          userId,
          username,
          wpm: fullResult.wpm,
          accuracy: fullResult.accuracy,
          language: fullResult.language,
          timeMode: fullResult.timeMode,
          timestamp: fullResult.timestamp,
          country: profile.country || '🇺🇿 Uzbekistan'
        });

        // Recalculate User Profile Stats + XP Gain
        const xpEarned = Math.round(fullResult.wpm * (fullResult.accuracy / 100) * 2) + 25;
        const newXp = profile.xp + xpEarned;
        const newLevel = Math.floor(newXp / 500) + 1;

        if (newLevel > profile.level) {
          addNotification('LEVEL UP! 🎉', `Congratulations! You reached Level ${newLevel}!`, 'level_up');
        }

        let rankTitle = 'Typing Novice';
        if (newLevel >= 5) rankTitle = 'Keyboard Warrior';
        if (newLevel >= 10) rankTitle = 'Speed Demon';
        if (newLevel >= 20) rankTitle = 'Cyber Legend';

        const newTotalTests = profile.totalTests + 1;
        const newTimeTyped = profile.totalTimeTypedSeconds + fullResult.testTimeSeconds;
        const newWordsTyped = profile.totalWordsTyped + Math.round(fullResult.correctChars / 5);
        const newCharsTyped = profile.totalCharsTyped + fullResult.correctChars;
        const newHighestWpm = Math.max(profile.highestWpm, fullResult.wpm);
        const newHighestAccuracy = Math.max(profile.highestAccuracy, fullResult.accuracy);
        const newAvgWpm = Math.round((profile.averageWpm * profile.totalTests + fullResult.wpm) / newTotalTests);

        const profileUpdates: Partial<UserProfile> = {
          totalTests: newTotalTests,
          totalTimeTypedSeconds: newTimeTyped,
          totalWordsTyped: newWordsTyped,
          totalCharsTyped: newCharsTyped,
          highestWpm: newHighestWpm,
          highestAccuracy: newHighestAccuracy,
          averageWpm: newAvgWpm,
          xp: newXp,
          level: newLevel,
          rankTitle,
          lastActive: Date.now()
        };

        await updateUserProfile(profileUpdates);
      } catch (err) {
        console.error('Save to firestore error:', err);
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
