import { LanguageInfo, languagesList } from '../config/languages';
import { rtdb } from '../config/firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';

export interface CustomTextEntry {
  id: string;
  languageCode: string;
  title?: string;
  content: string;
  words: string[];
  createdAt: number;
}

const CUSTOM_LANG_KEY = 'yolnoma_owner_custom_languages';
const CUSTOM_TEXT_KEY = 'yolnoma_owner_custom_texts';

let inMemoryLanguages: LanguageInfo[] = [];
let inMemoryTexts: CustomTextEntry[] = [];
let isFirebaseSynced = false;

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

export function saveCustomLanguages(langs: LanguageInfo[]): void {
  inMemoryLanguages = langs;
  try {
    localStorage.setItem(CUSTOM_LANG_KEY, JSON.stringify(langs));
  } catch (err) {
    console.error('Failed to save custom languages:', err);
  }
}

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

  try {
    const langRef = ref(rtdb, `global_owner_content/languages/${newLang.code}`);
    set(langRef, newLang);
  } catch (e) {
    console.warn('Firebase sync error for addCustomLanguage:', e);
  }
  return true;
}

export function removeCustomLanguage(code: string): void {
  const customLangs = getStoredCustomLanguages();
  const filtered = customLangs.filter((l) => l.code.toLowerCase() !== code.toLowerCase());
  saveCustomLanguages(filtered);

  try {
    const langRef = ref(rtdb, `global_owner_content/languages/${code}`);
    remove(langRef);
  } catch (e) {
    console.warn('Firebase sync error for removeCustomLanguage:', e);
  }
}

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

export function saveCustomTexts(texts: CustomTextEntry[]): void {
  inMemoryTexts = texts;
  try {
    localStorage.setItem(CUSTOM_TEXT_KEY, JSON.stringify(texts));
  } catch (err) {
    console.error('Failed to save custom texts:', err);
  }
}

export function addCustomTextForLanguage(
  languageCode: string,
  content: string,
  title?: string
): CustomTextEntry {
  const customTexts = getStoredCustomTexts();
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

  try {
    const textRef = ref(rtdb, `global_owner_content/texts/${newEntry.id}`);
    set(textRef, newEntry);
  } catch (e) {
    console.warn('Firebase sync error for addCustomTextForLanguage:', e);
  }

  return newEntry;
}

export function removeCustomText(id: string): void {
  const customTexts = getStoredCustomTexts();
  const filtered = customTexts.filter((t) => t.id !== id);
  saveCustomTexts(filtered);

  try {
    const textRef = ref(rtdb, `global_owner_content/texts/${id}`);
    remove(textRef);
  } catch (e) {
    console.warn('Firebase sync error for removeCustomText:', e);
  }
}

export function getCustomTextsForLanguage(languageCode: string): CustomTextEntry[] {
  const customTexts = getStoredCustomTexts();
  return customTexts.filter(
    (t) => t.languageCode.toLowerCase() === languageCode.toLowerCase()
  );
}

export function getWordsForLanguage(languageCode: string): string[] {
  const customTexts = getCustomTextsForLanguage(languageCode);
  let ownerWords: string[] = [];
  customTexts.forEach((ct) => {
    ownerWords = ownerWords.concat(ct.words);
  });
  const langObj = languagesList.find((l) => l.code === languageCode) || languagesList[0];
  const defaultWords = langObj ? langObj.words : [];
  if (ownerWords.length > 0) {
    return [...ownerWords, ...defaultWords];
  }
  return defaultWords;
}

export function initGlobalContentSync(onUpdated?: () => void) {
  if (isFirebaseSynced) return;
  isFirebaseSynced = true;
  try {
    const contentRef = ref(rtdb, 'global_owner_content');
    onValue(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.languages) {
          const langMap = val.languages;
          const langList: LanguageInfo[] = Object.values(langMap);
          saveCustomLanguages(langList);
        }
        if (val.texts) {
          const textMap = val.texts;
          const textList: CustomTextEntry[] = Object.values(textMap);
          textList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveCustomTexts(textList);
        }
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('custom-content-updated'));
        if (onUpdated) onUpdated();
      }
    });
  } catch (err) {
    console.warn('Firebase RTDB global content listener error:', err);
  }
}

initGlobalContentSync();
