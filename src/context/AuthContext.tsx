import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { UserProfile, TypingResult, LanguageCode } from '../types';
import confetti from 'canvas-confetti';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
        // Update lastActive
        await updateDoc(userDocRef, { lastActive: Date.now() }).catch(() => {});
        return { ...data, lastActive: Date.now() };
      }
    } catch {
      // Offline fallback profile
    }

    // Default new profile
    const username = firebaseUser.displayName
      ? firebaseUser.displayName.toLowerCase().replace(/\s+/g, '_')
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
      followersCount: 0,
      followingCount: 0,
      unlockedAchievements: [],
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
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
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
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      const p = await fetchOrCreateProfile(res.user);
      setProfile(p);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
      } catch (err) {
        console.error('Update profile error:', err);
      }
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
      // Save result document in Firestore
      try {
        const docRef = await addDoc(collection(db, 'typingResults'), fullResult);
        fullResult.id = docRef.id;

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
          country: profile.country || 'Global'
        });

        // Recalculate User Profile Stats
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
        signInWithGoogle,
        registerWithEmail,
        loginWithEmail,
        resetPassword,
        logout,
        updateUserProfile,
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
