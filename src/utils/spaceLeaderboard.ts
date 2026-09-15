import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { db, rtdb } from '../config/firebase';

export interface SpaceScoreRecord {
  id?: string;
  score: number;
  wave: number;
  wpm: number;
  accuracy: number;
  enemiesKilled: number;
  maxStreak: number;
  language: string;
  playerName: string;
  playerAvatar: string;
  uid: string;
  createdAt: number;
}

/**
 * Koinot Jangi natijasini Firebase Firestore, RTDB va LocalStorage ga saqlaydi
 */
export async function saveSpaceScore(record: SpaceScoreRecord): Promise<void> {
  // 1. Mahalliy saqlash (offline / tezkor fallback)
  try {
    const localKey = 'yolnoma_space_scores_history';
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    existing.unshift(record);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 30)));
  } catch {}

  const scoreId = `space_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 2. Firestore ga yozish
  try {
    const colRef = collection(db, 'space_scores');
    await addDoc(colRef, {
      ...record,
      scoreId
    });
    console.log('[Firestore] Space score saqlandi:', record.score);
  } catch (err) {
    console.warn('[Firestore] Space score yozishda ogohlantirish:', err);
  }

  // 3. Realtime Database ga ham yozish (dual resilience)
  try {
    const rtdbRef = ref(rtdb, `space_scores/${scoreId}`);
    await set(rtdbRef, record);
    console.log('[RTDB] Space score saqlandi:', record.score);
  } catch (err) {
    console.warn('[RTDB] Space score yozishda ogohlantirish:', err);
  }
}

/**
 * Top 10 Koinot Qahramonlari ro'yxatini yuklaydi
 */
export async function getTopSpaceScores(limitCount: number = 100): Promise<SpaceScoreRecord[]> {
  const scores: SpaceScoreRecord[] = [];

  // 1. Firestore dan urinish
  try {
    const colRef = collection(db, 'space_scores');
    const q = query(colRef, orderBy('score', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    if (!snap.empty) {
      snap.forEach((doc) => {
        const data = doc.data() as SpaceScoreRecord;
        scores.push({
          id: doc.id,
          ...data
        });
      });
    }
  } catch (err) {
    console.warn('[Firestore] Space scores yuklashda xatolik, RTDB ga o\'tildi:', err);
  }

  // 2. Agar Firestore bo'sh bo'lsa yoki xato bersa, RTDB dan olish
  if (scores.length === 0) {
    try {
      const snap = await get(ref(rtdb, 'space_scores'));
      if (snap.exists()) {
        const val = snap.val();
        Object.keys(val).forEach((k) => {
          scores.push({
            id: k,
            ...val[k]
          });
        });
        scores.sort((a, b) => b.score - a.score);
      }
    } catch (err) {
      console.warn('[RTDB] Space scores yuklash xatosi:', err);
    }
  }

  // 3. LocalStorage dan ham o'yinchining shaxsiy natijalarini qo'shish
  try {
    const localKey = 'yolnoma_space_scores_history';
    const localScores: SpaceScoreRecord[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    localScores.forEach((ls) => {
      if (!scores.some((s) => (s.uid && s.uid === ls.uid && s.score === ls.score) || (s.id && s.id === ls.id))) {
        scores.push(ls);
      }
    });
  } catch {}

  // Saralash va eng yaxshi N tasini qaytarish (sun'iy foydalanuvchilarsiz, faqat real natijalar)
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, limitCount);
}
