import { ref, get, set, update, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from '../config/firebase';
import { getLanguageInfo } from '../config/languages';
import { LanguageCode } from '../types';

export interface DailyChallengeLocalState {
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  todayDate: string;
  todayCompleted: boolean;
  todayBestWpm: number;
  todayBestAcc: number;
}

export interface DailyLeaderboardEntry {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  wpm: number;
  accuracy: number;
  streak: number;
  timestamp: number;
}

const DAILY_STORAGE_KEY = 'yolnoma_daily_challenge_v1';

export function getTodayDateKey(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getTodayDateKey(d);
}

// Fast deterministic hash + Mulberry32 PRNG so every user gets the exact same daily challenge text
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a deterministic daily challenge text for the given date & language.
 * Everyone on the same day gets the exact same text.
 */
export function generateDailyChallengeText(
  language: LanguageCode,
  dateKey: string = getTodayDateKey()
): string {
  const langInfo = getLanguageInfo(language);
  const sentences =
    langInfo.sentences && langInfo.sentences.length > 0
      ? langInfo.sentences
      : getLanguageInfo('uz-latn').sentences || [];

  const rng = createSeededRng(hashString(`yolnoma-daily-${dateKey}-${language}`));

  if (sentences.length >= 2) {
    const pool = [...sentences];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(3, pool.length)).join(' ').trim();
  }

  // Fallback to deterministic word selection
  const words = (langInfo.words || []).filter((w) => w && w.trim().length > 1);
  const picked: string[] = [];
  for (let i = 0; i < 32 && words.length > 0; i++) {
    const idx = Math.floor(rng() * words.length);
    picked.push(words[idx].trim().toLowerCase());
  }
  return picked.join(' ');
}

export function getDailyChallengeState(): DailyChallengeLocalState {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();

  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const lastDate: string | null = parsed.lastCompletedDate || null;
      const isToday = lastDate === today;
      const isActiveStreak = lastDate === today || lastDate === yesterday;
      const effectiveStreak = isActiveStreak ? Number(parsed.streak || 0) : 0;

      return {
        streak: effectiveStreak,
        bestStreak: Math.max(effectiveStreak, Number(parsed.bestStreak || 0)),
        lastCompletedDate: lastDate,
        todayDate: today,
        todayCompleted: isToday,
        todayBestWpm: isToday ? Number(parsed.todayBestWpm || 0) : 0,
        todayBestAcc: isToday ? Number(parsed.todayBestAcc || 0) : 0
      };
    }
  } catch {}

  return {
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    todayDate: today,
    todayCompleted: false,
    todayBestWpm: 0,
    todayBestAcc: 0
  };
}

export async function recordDailyChallengeResult(params: {
  wpm: number;
  accuracy: number;
  uid?: string | null;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
}): Promise<DailyChallengeLocalState> {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();
  const prev = getDailyChallengeState();

  let newStreak = 1;
  if (prev.lastCompletedDate === today) {
    newStreak = Math.max(1, prev.streak);
  } else if (prev.lastCompletedDate === yesterday) {
    newStreak = prev.streak + 1;
  }

  const newBestStreak = Math.max(prev.bestStreak, newStreak);
  const bestWpmToday = prev.todayCompleted ? Math.max(prev.todayBestWpm, params.wpm) : params.wpm;
  const bestAccToday = prev.todayCompleted ? Math.max(prev.todayBestAcc, params.accuracy) : params.accuracy;

  const nextState: DailyChallengeLocalState = {
    streak: newStreak,
    bestStreak: newBestStreak,
    lastCompletedDate: today,
    todayDate: today,
    todayCompleted: true,
    todayBestWpm: bestWpmToday,
    todayBestAcc: bestAccToday
  };

  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(nextState));
    localStorage.setItem('yolnoma_guest_streak', String(newStreak));
  } catch {}

  window.dispatchEvent(new CustomEvent('yolnoma_daily_updated', { detail: nextState }));

  // Persist to Firebase RTDB for authenticated users
  if (params.uid && params.wpm > 0 && params.wpm <= 280) {
    try {
      const entryRef = ref(rtdb, `dailyChallenges/${today}/leaderboard/${params.uid}`);
      const existingSnap = await get(entryRef).catch(() => null);
      const prevRemoteWpm = existingSnap?.exists() ? Number(existingSnap.val()?.wpm || 0) : 0;

      if (bestWpmToday >= prevRemoteWpm) {
        await set(entryRef, {
          uid: params.uid,
          displayName: params.displayName || params.username || 'Foydalanuvchi',
          username: params.username || 'user',
          avatarUrl: params.avatarUrl || '',
          wpm: bestWpmToday,
          accuracy: bestAccToday,
          streak: newStreak,
          timestamp: Date.now()
        });
      }

      await update(ref(rtdb, `users/${params.uid}`), {
        currentStreak: newStreak,
        longestStreak: newBestStreak,
        lastTestDate: today
      }).catch(() => {});
    } catch {}
  }

  return nextState;
}

export async function fetchDailyChallengeLeaderboard(
  dateKey: string = getTodayDateKey()
): Promise<DailyLeaderboardEntry[]> {
  try {
    const q = query(
      ref(rtdb, `dailyChallenges/${dateKey}/leaderboard`),
      orderByChild('wpm'),
      limitToLast(15)
    );
    const snap = await get(q);
    if (!snap.exists()) return [];

    const val = snap.val() || {};
    const list: DailyLeaderboardEntry[] = Object.keys(val)
      .map((uid) => ({
        uid,
        displayName: val[uid]?.displayName || val[uid]?.username || 'Foydalanuvchi',
        username: val[uid]?.username || 'user',
        avatarUrl: val[uid]?.avatarUrl || '',
        wpm: Number(val[uid]?.wpm || 0),
        accuracy: Number(val[uid]?.accuracy || 0),
        streak: Number(val[uid]?.streak || 1),
        timestamp: Number(val[uid]?.timestamp || 0)
      }))
      .filter((e) => e.wpm > 0 && e.wpm <= 280)
      .sort((a, b) => b.wpm - a.wpm);

    return list.slice(0, 10);
  } catch {
    return [];
  }
}
