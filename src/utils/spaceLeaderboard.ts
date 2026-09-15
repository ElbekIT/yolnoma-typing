import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { db, rtdb, ensureFirebaseAuth } from '../config/firebase';

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
  // Ensure valid authenticated session (user or anonymous guest)
  const authUser = await ensureFirebaseAuth();
  if (authUser?.uid) {
    record.uid = authUser.uid;
  }

  // Sanitize & bound parameters according to anti-cheat limits
  record.score = Math.min(5000000, Math.max(0, Math.round(Number(record.score) || 0)));
  record.wave = Math.min(200, Math.max(1, Math.round(Number(record.wave) || 1)));
  record.wpm = Math.min(350, Math.max(0, Math.round(Number(record.wpm) || 0)));
  record.accuracy = Math.min(100, Math.max(0, Math.round(Number(record.accuracy) || 0)));
  record.enemiesKilled = Math.max(0, Math.round(Number(record.enemiesKilled) || 0));
  record.createdAt = Date.now();

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
 * Har bir o'yinchining faqat bitta — eng yuqori rekordi olinishini ta'minlaydi (shaxsiy eng yaxshi natija)
 */
export function deduplicateSpaceScores(rawScores: SpaceScoreRecord[]): SpaceScoreRecord[] {
  const map = new Map<string, SpaceScoreRecord>();

  for (const s of rawScores) {
    if (!s || typeof s.score !== 'number' || isNaN(s.score)) continue;

    const cleanUid = (s.uid || '').trim();
    const cleanName = (s.playerName || '').trim().toLowerCase();

    // Haqiqiy UID bo'lsa UID bo'yicha, aks holda taxallus bo'yicha identifikatsiya qilamiz
    let key = '';
    if (cleanUid && !cleanUid.startsWith('guest_') && cleanUid.length > 5) {
      key = `uid_${cleanUid}`;
    } else if (cleanName) {
      key = `name_${cleanName}`;
    } else if (cleanUid) {
      key = `uid_${cleanUid}`;
    } else {
      key = `id_${s.id || Math.random()}`;
    }

    const existing = map.get(key);
    if (!existing) {
      map.set(key, s);
    } else {
      // Eng yuqori ballni saqlab qolamiz
      if ((s.score || 0) > (existing.score || 0)) {
        map.set(key, s);
      } else if ((s.score || 0) === (existing.score || 0)) {
        // Teng bo'lsa: yuqoriroq to'lqin, ko'proq aniqlik, keyin yangiroq sana
        if (
          (s.wave || 1) > (existing.wave || 1) ||
          ((s.wave || 1) === (existing.wave || 1) && (s.accuracy || 0) > (existing.accuracy || 0)) ||
          ((s.accuracy || 0) === (existing.accuracy || 0) && (s.createdAt || 0) > (existing.createdAt || 0))
        ) {
          map.set(key, s);
        }
      }
    }
  }

  // Qo'shimcha tekshiruv: agar bir xil taxallusdagi ishtirokchilar bo'lsa, ularni birlashtirib eng zo'rini qoldirish
  const finalNameMap = new Map<string, SpaceScoreRecord>();
  for (const item of map.values()) {
    const nameKey = (item.playerName || '').trim().toLowerCase();
    if (!nameKey) {
      finalNameMap.set(`item_${item.id || Math.random()}`, item);
      continue;
    }
    const existing = finalNameMap.get(nameKey);
    if (!existing) {
      finalNameMap.set(nameKey, item);
    } else {
      if ((item.score || 0) > (existing.score || 0)) {
        finalNameMap.set(nameKey, item);
      }
    }
  }

  const result = Array.from(finalNameMap.values());
  result.sort((a, b) => (b.score || 0) - (a.score || 0));
  return result;
}

/**
 * Top Koinot Qahramonlari ro'yxatini yuklaydi.
 * Har bir o'yinchidan faqat bitta eng yaxshi rekord olinadi (takrorlanishlarga yo'l qo'yilmaydi).
 */
export async function getTopSpaceScores(
  limitCount: number = 100,
  onlyBestPerPlayer: boolean = true
): Promise<SpaceScoreRecord[]> {
  const scores: SpaceScoreRecord[] = [];

  // 1. Firestore dan urinish
  try {
    const colRef = collection(db, 'space_scores');
    const q = query(colRef, orderBy('score', 'desc'), limit(limitCount * 3));
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
          const item = val[k];
          if (item && typeof item.score === 'number') {
            scores.push({
              id: k,
              ...item
            });
          }
        });
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

  // 4. Faqat har bir ishtirokchidan bitta eng zo'r natija qoldirish
  if (onlyBestPerPlayer) {
    const uniqueScores = deduplicateSpaceScores(scores);
    return uniqueScores.slice(0, limitCount);
  }

  // Saralash va eng yaxshi N tasini qaytarish
  scores.sort((a, b) => (b.score || 0) - (a.score || 0));
  return scores.slice(0, limitCount);
}
