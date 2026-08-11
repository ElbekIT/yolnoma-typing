import { LanguageInfo, languagesList } from '../config/languages';

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

// Load stored custom languages
export function getStoredCustomLanguages(): LanguageInfo[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LANG_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse custom languages:', err);
    return [];
  }
}

// Save stored custom languages
export function saveCustomLanguages(langs: LanguageInfo[]): void {
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

// Add a new custom language
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
  return true;
}

// Remove a custom language
export function removeCustomLanguage(code: string): void {
  const customLangs = getStoredCustomLanguages();
  const filtered = customLangs.filter((l) => l.code.toLowerCase() !== code.toLowerCase());
  saveCustomLanguages(filtered);
}

// Load stored custom texts
export function getStoredCustomTexts(): CustomTextEntry[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEXT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse custom texts:', err);
    return [];
  }
}

// Save custom texts array
export function saveCustomTexts(texts: CustomTextEntry[]): void {
  try {
    localStorage.setItem(CUSTOM_TEXT_KEY, JSON.stringify(texts));
  } catch (err) {
    console.error('Failed to save custom texts:', err);
  }
}

// Add a custom text or word list for a specific language
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
  return newEntry;
}

// Remove custom text by ID
export function removeCustomText(id: string): void {
  const customTexts = getStoredCustomTexts();
  const filtered = customTexts.filter((t) => t.id !== id);
  saveCustomTexts(filtered);
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
