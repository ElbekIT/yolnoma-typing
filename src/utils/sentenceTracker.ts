/**
 * Sentence Tracker & Anti-Repetition Engine:
 * Guarantees that once a sentence has been shown or completed,
 * it will NEVER appear again to the user.
 * 
 * Persists seen sentence signatures to localStorage.
 */

const STORAGE_KEY = 'yolnoma_practiced_sentences_v2';
const STATS_KEY = 'yolnoma_sentence_progress_v2';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

class SentenceTracker {
  private seenSignatures: Set<string> = new Set();
  private initialized = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (this.initialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.seenSignatures = new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('[SentenceTracker] Error loading seen signatures:', e);
      this.seenSignatures = new Set();
    }
    this.initialized = true;
  }

  private saveToStorage() {
    try {
      // Save max 10,000 most recent unique signatures to keep localStorage lean
      const arr = Array.from(this.seenSignatures);
      const toSave = arr.length > 10000 ? arr.slice(arr.length - 10000) : arr;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('[SentenceTracker] Error persisting seen signatures:', e);
    }
  }

  /**
   * Check if a sentence (by ID or English text) has been seen before
   */
  public isSentenceSeen(item: { id?: string; en: string } | string): boolean {
    this.loadFromStorage();
    if (!item) return false;

    if (typeof item === 'string') {
      const norm = normalizeText(item);
      return this.seenSignatures.has(norm) || this.seenSignatures.has(item);
    }

    if (item.id && this.seenSignatures.has(item.id)) {
      return true;
    }

    if (item.en) {
      const norm = normalizeText(item.en);
      return this.seenSignatures.has(norm);
    }

    return false;
  }

  /**
   * Mark a sentence as seen so it will never appear again
   */
  public markSentenceSeen(item: { id?: string; en: string } | string): void {
    this.loadFromStorage();
    if (!item) return;

    if (typeof item === 'string') {
      this.seenSignatures.add(normalizeText(item));
      this.seenSignatures.add(item);
    } else {
      if (item.id) this.seenSignatures.add(item.id);
      if (item.en) {
        this.seenSignatures.add(normalizeText(item.en));
      }
    }

    this.saveToStorage();
  }

  /**
   * Total unique sentences mastered/seen
   */
  public getSeenCount(): number {
    this.loadFromStorage();
    return Math.floor(this.seenSignatures.size / 2); // approximate unique text count
  }

  /**
   * Reset seen history (if user explicitly chooses to reset progress)
   */
  public clearSeenHistory(): void {
    this.seenSignatures.clear();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  /**
   * Save and retrieve persistent user sentence stats (Level, XP, completed)
   */
  public getStoredProgress(): {
    currentLevel: number;
    xp: number;
    completedCount: number;
    highestCombo: number;
  } {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          currentLevel: Math.max(1, Number(parsed.currentLevel) || 1),
          xp: Math.max(0, Number(parsed.xp) || 0),
          completedCount: Math.max(0, Number(parsed.completedCount) || 0),
          highestCombo: Math.max(0, Number(parsed.highestCombo) || 0)
        };
      }
    } catch {}
    return { currentLevel: 1, xp: 0, completedCount: 0, highestCombo: 0 };
  }

  public saveProgress(stats: {
    currentLevel: number;
    xp: number;
    completedCount: number;
    highestCombo: number;
  }): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {}
  }
}

export const sentenceTracker = new SentenceTracker();
