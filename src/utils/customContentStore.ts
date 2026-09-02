import { LanguageInfo, languagesList } from '../config/languages';
import { rtdb } from '../config/firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';

export interface CustomTextEntry {
  id: string;
  languageCode: string;
  title?: string;
  content: string; // The full custom text or wordlist
  words: string[]; // Cleaned array of words
  createdAt: number;
}

const CUSTOM_LANG_KEY = 'yolnoma_owner_custom_languages';
const CUSTOM_TEXT_KEY = 'yolnoma_owner_custom_texts';

// In-memory memory cache
let inMemoryLanguages: LanguageInfo[] = [];
let inMemoryTexts: CustomTextEntry[] = [];
let isFirebaseSynced = false;

// Load stored custom languages from localStorage
export function getStoredCustomLanguages(): LanguageInfo[] {
  if (inMemoryLanguages.length > 0) {
    return inMemoryLanguages;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_LANG_KEY);
    if (raw) {
      inMemoryLanguages = JSON.parse(raw);
      return inMemoryLanguages;
    }
  } catch (err) {
    console.error('Failed to parse custom languages:', err);
  }
  return [];
}

// Save stored custom languages to localStorage
export function saveCustomLanguages(langs: LanguageInfo[]): void {
  inMemoryLanguages = langs;
  try {
    localStorage.setItem(CUSTOM_LANG_KEY, JSON.stringify(langs));
  } catch (err) {
    console.error('Failed to save custom languages:', err);
  }
}

// Get all languages merged (defaults + custom)
export function getAllLanguages(): LanguageInfo[] {
  const customLangs = getStoredCustomLanguages();
  const merged = [...languagesList];

  customLangs.forEach((cL) => {
    if (!merged.some((mL) => mL.code.toLowerCase() === cL.code.toLowerCase())) {
      merged.push(cL);
    }
  });

  return merged;
}

// Add a new custom language (saves to localStorage AND Firebase RTDB globally)
export function addCustomLanguage(newLang: LanguageInfo): boolean {
  const customLangs = getStoredCustomLanguages();
  const exists = getAllLanguages().some(
    (l) => l.code.toLowerCase() === newLang.code.toLowerCase()
  );

  if (exists) {
    return false;
  }

  const updated = [...customLangs, newLang];
  saveCustomLanguages(updated);

  // Sync to Firebase Realtime DB globally for ALL users
  try {
    const langRef = ref(rtdb, `global_owner_content/languages/${newLang.code}`);
    set(langRef, newLang);
  } catch (e) {
    console.warn('Firebase sync error for addCustomLanguage:', e);
  }

  return true;
}

// Remove a custom language (removes from localStorage AND Firebase RTDB)
export function removeCustomLanguage(code: string): void {
  const customLangs = getStoredCustomLanguages();
  const filtered = customLangs.filter((l) => l.code.toLowerCase() !== code.toLowerCase());
  saveCustomLanguages(filtered);

  // Sync to Firebase Realtime DB
  try {
    const langRef = ref(rtdb, `global_owner_content/languages/${code}`);
    remove(langRef);
  } catch (e) {
    console.warn('Firebase sync error for removeCustomLanguage:', e);
  }
}

// Load stored custom texts from localStorage
export function getStoredCustomTexts(): CustomTextEntry[] {
  if (inMemoryTexts.length > 0) {
    return inMemoryTexts;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_TEXT_KEY);
    if (raw) {
      inMemoryTexts = JSON.parse(raw);
      return inMemoryTexts;
    }
  } catch (err) {
    console.error('Failed to parse custom texts:', err);
  }
  return [];
}

// Save custom texts array to localStorage
export function saveCustomTexts(texts: CustomTextEntry[]): void {
  inMemoryTexts = texts;
  try {
    localStorage.setItem(CUSTOM_TEXT_KEY, JSON.stringify(texts));
  } catch (err) {
    console.error('Failed to save custom texts:', err);
  }
}

// Add a custom text or word list for a specific language (saves to localStorage AND Firebase RTDB globally)
export function addCustomTextForLanguage(
  languageCode: string,
  content: string,
  title?: string
): CustomTextEntry {
  const customTexts = getStoredCustomTexts();

  // Clean and split words
  const words = content
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const newEntry: CustomTextEntry = {
    id: 'ct_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    languageCode,
    title: title || `Matn #${customTexts.length + 1}`,
    content,
    words,
    createdAt: Date.now()
  };

  const updated = [newEntry, ...customTexts];
  saveCustomTexts(updated);

  // Sync to Firebase Realtime DB globally for ALL users
  try {
    const textRef = ref(rtdb, `global_owner_content/texts/${newEntry.id}`);
    set(textRef, newEntry);
  } catch (e) {
    console.warn('Firebase sync error for addCustomTextForLanguage:', e);
  }

  return newEntry;
}

// Remove custom text by ID (removes from localStorage AND Firebase RTDB)
export function removeCustomText(id: string): void {
  const customTexts = getStoredCustomTexts();
  const filtered = customTexts.filter((t) => t.id !== id);
  saveCustomTexts(filtered);

  // Sync to Firebase Realtime DB
  try {
    const textRef = ref(rtdb, `global_owner_content/texts/${id}`);
    remove(textRef);
  } catch (e) {
    console.warn('Firebase sync error for removeCustomText:', e);
  }
}

// Get custom texts for a specific language
export function getCustomTextsForLanguage(languageCode: string): CustomTextEntry[] {
  const customTexts = getStoredCustomTexts();
  return customTexts.filter(
    (t) => t.languageCode.toLowerCase() === languageCode.toLowerCase()
  );
}

// Get all words for a language (combining owner custom words + default words database)
export function getWordsForLanguage(languageCode: string): string[] {
  const customTexts = getCustomTextsForLanguage(languageCode);

  let ownerWords: string[] = [];
  customTexts.forEach((ct) => {
    ownerWords = ownerWords.concat(ct.words);
  });

  const langObj = languagesList.find((l) => l.code === languageCode) || languagesList[0];
  const defaultWords = langObj ? langObj.words : [];

  if (ownerWords.length > 0) {
    // Return owner custom words first
    return [...ownerWords, ...defaultWords];
  }

  return defaultWords;
}

/**
 * Realtime Global Firebase Sync:
 * Attaches a listener to Firebase Realtime Database 'global_owner_content' node.
 * Whenever the Owner adds or deletes texts or languages, ALL visitors on the website
 * automatically receive the updated texts/languages in real-time!
 */
export function initGlobalContentSync(onUpdated?: () => void) {
  if (isFirebaseSynced) return;
  isFirebaseSynced = true;

  try {
    const contentRef = ref(rtdb, 'global_owner_content');
    onValue(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();

        // 1. Parse languages
        if (val.languages) {
          const langMap = val.languages;
          const langList: LanguageInfo[] = Object.values(langMap);
          saveCustomLanguages(langList);
        }

        // 2. Parse texts
        if (val.texts) {
          const textMap = val.texts;
          const textList: CustomTextEntry[] = Object.values(textMap);
          // Sort by createdAt descending
          textList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveCustomTexts(textList);
        }

        // Dispatch storage events for UI re-render
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('custom-content-updated'));
        if (onUpdated) onUpdated();
      }
    });
  } catch (err) {
    console.warn('Firebase RTDB global content listener error:', err);
  }
}

// Auto init sync on module load
initGlobalContentSync();
