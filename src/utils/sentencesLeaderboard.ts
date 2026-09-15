import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref, set, get, update } from 'firebase/database';
import { db, rtdb } from '../config/firebase';

export interface SentenceScoreRecord {
  id?: string;
  uid: string;
  playerName: string;
  playerAvatar: string;
  wpm: number;
  accuracy: number;
  sentencesCompleted: number;
  maxCombo: number;
  category: 'all' | 'daily' | 'business' | 'tech' | 'ielts' | 'custom';
  level: string;
  userLevel?: number; // Level 1 - 1,000,000+
  ieltsBand?: string; // e.g. "IELTS 9.0", "IELTS 7.5", "IELTS 1.0"
  score: number;
  createdAt: number;
}

/**
 * Jumlalar trenajyori natijasini Firebase va LocalStorage ga saqlaydi
 */
export async function saveSentenceScore(record: SentenceScoreRecord): Promise<void> {
  // 1. Mahalliy saqlash (offline fallback)
  try {
    const localKey = 'yolnoma_sentence_scores_history';
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    existing.unshift(record);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 30)));
  } catch {}

  const scoreId = `sentence_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 2. Firestore ga saqlash
  try {
    const colRef = collection(db, 'sentence_scores');
    await addDoc(colRef, {
      ...record,
      scoreId
    });
  } catch (err) {
    console.warn('[Firestore] Sentence score yozishda ogohlantirish:', err);
  }

  // 3. Realtime Database ga saqlash
  try {
    const rtdbRef = ref(rtdb, `sentence_scores/${scoreId}`);
    await set(rtdbRef, record);

    // Foydalanuvchi profiliga ham sentence darajasi va IELTS bandini yangilash
    if (record.uid && !record.uid.startsWith('guest_')) {
      const userRef = ref(rtdb, `users/${record.uid}`);
      await update(userRef, {
        sentenceLevel: record.userLevel || 1,
        sentenceIeltsBand: record.ieltsBand || 'IELTS 1.0',
        sentencesMasteredCount: record.sentencesCompleted || 0,
        highestSentenceScore: record.score || 0,
        highestSentenceCombo: record.maxCombo || 0,
        lastActive: Date.now()
      });
    }
  } catch (err) {
    console.warn('[RTDB] Sentence score yozishda ogohlantirish:', err);
  }
}

/**
 * Peshqadamlar reytingi uchun eng yuqori natijalarni oladi
 */
export async function getTopSentenceScores(limitCount: number = 25): Promise<SentenceScoreRecord[]> {
  const recordsMap = new Map<string, SentenceScoreRecord>();

  // 1. RTDB dan tekshirish
  try {
    const rtdbRef = ref(rtdb, 'sentence_scores');
    const snapshot = await get(rtdbRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const item = data[key];
        const uniqueKey = item.uid ? `${item.uid}_${item.score}` : key;
        recordsMap.set(uniqueKey, {
          id: key,
          ...item
        });
      });
    }
  } catch (err) {
    console.warn('[RTDB] Sentence scores olishda xato:', err);
  }

  // 2. Firestore orqali zaxira qidirish
  try {
    const colRef = collection(db, 'sentence_scores');
    const q = query(colRef, orderBy('score', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const item = doc.data() as Omit<SentenceScoreRecord, 'id'>;
        const uniqueKey = item.uid ? `${item.uid}_${item.score}` : doc.id;
        if (!recordsMap.has(uniqueKey)) {
          recordsMap.set(uniqueKey, {
            id: doc.id,
            ...item
          });
        }
      });
    }
  } catch (err) {
    console.warn('[Firestore] Sentence scores olishda xato:', err);
  }

  // 3. LocalStorage dan foydalanuvchining shaxsiy mashq natijalarini qo'shish
  try {
    const localKey = 'yolnoma_sentence_scores_history';
    const localScores: SentenceScoreRecord[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    localScores.forEach((ls) => {
      const uniqueKey = ls.uid ? `${ls.uid}_${ls.score}` : `${ls.createdAt}_${ls.score}`;
      if (!recordsMap.has(uniqueKey)) {
        recordsMap.set(uniqueKey, ls);
      }
    });
  } catch {}

  const allRecords = Array.from(recordsMap.values());
  // Ball bo'yicha yuqoridan pastga saralash
  allRecords.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Faqat real foydalanuvchilar natijalarini qaytarish (sun'iy foydalanuvchilarsiz)
  return allRecords.slice(0, limitCount);
}
