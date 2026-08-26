import { TextMode, DifficultyMode, LanguageCode } from '../types';
import { getLanguageInfo, codeSnippets } from '../config/languages';
import { getCustomTextsForLanguage } from './customContentStore';

export interface GeneratedText {
  rawText: string;
  wordsList: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateTestText(
  mode: TextMode,
  language: LanguageCode,
  difficulty: DifficultyMode,
  wordCount: number = 25,
  customText?: string
): GeneratedText {
  // If explicitly in custom mode with customText provided
  if (mode === 'custom' && customText && customText.trim().length > 0) {
    const raw = customText.trim();
    return {
      rawText: raw,
      wordsList: raw.split(/\s+/)
    };
  }

  const langInfo = getLanguageInfo(language);

  // Custom texts added by owner
  const customTexts = getCustomTextsForLanguage(language);

  if (mode === 'custom') {
    if (customTexts && customTexts.length > 0) {
      const chosen = customTexts[Math.floor(Math.random() * customTexts.length)];
      const raw = chosen.content.trim();
      return {
        rawText: raw,
        wordsList: raw.split(/\s+/)
      };
    }
  }

  if (mode === 'code') {
    const snippets = codeSnippets.javascript.concat(codeSnippets.python, codeSnippets.html);
    const selected = snippets[Math.floor(Math.random() * snippets.length)];
    const clean = selected.replace(/\n/g, ' ');
    return {
      rawText: clean,
      wordsList: clean.split(' ')
    };
  }

  if (mode === 'quotes') {
    const quoteList = langInfo.quotes && langInfo.quotes.length > 0 ? langInfo.quotes : getLanguageInfo('uz-latn').quotes;
    const quote = quoteList[Math.floor(Math.random() * quoteList.length)];
    const text = `${quote.text} — ${quote.author}`;
    return {
      rawText: text,
      wordsList: text.split(' ')
    };
  }

  if (mode === 'story') {
    const storiesList = langInfo.stories && langInfo.stories.length > 0 ? langInfo.stories : getLanguageInfo('uz-latn').stories;
    if (storiesList && storiesList.length > 0) {
      const story = storiesList[Math.floor(Math.random() * storiesList.length)];
      return {
        rawText: story,
        wordsList: story.split(' ')
      };
    }
  }

  if (mode === 'sentences') {
    const sentencesList = langInfo.sentences && langInfo.sentences.length > 0 ? langInfo.sentences : getLanguageInfo('uz-latn').sentences;
    // Pick 2-3 random sentences freshly shuffled
    const shuffled = shuffleArray(sentencesList);
    const selectedSentences = shuffled.slice(0, Math.min(3, shuffled.length)).join(' ');
    return {
      rawText: selectedSentences,
      wordsList: selectedSentences.split(' ')
    };
  }

  // Base words pool - merge default language words with any owner custom words
  let wordsPool = [...langInfo.words];

  if (customTexts && customTexts.length > 0) {
    customTexts.forEach((ct) => {
      if (ct.words && ct.words.length > 0) {
        ct.words.forEach((w) => {
          const clean = w.trim().toLowerCase();
          if (clean.length > 1 && !wordsPool.includes(clean)) {
            wordsPool.push(clean);
          }
        });
      }
    });
  }

  if (mode === 'words') {
    // In Monkeytype-style words mode: ensure all words are lowercase and clean
    wordsPool = wordsPool.map((w) => w.trim().toLowerCase()).filter((w) => w.length > 0);
  } else if (langInfo.sentences && langInfo.sentences.length > 0) {
    // Mix in clean words from sentences for other modes
    langInfo.sentences.forEach((s) => {
      s.split(/\s+/).forEach((w) => {
        const clean = w.replace(/[^a-zA-Zʻʼo'g'O'G'а-яА-ЯўЎқҚғҒҳҲ]/g, '').toLowerCase();
        if (clean.length > 2 && clean.length <= 10 && !wordsPool.includes(clean)) {
          wordsPool.push(clean);
        }
      });
    });
  }

  if (mode === 'numbers') {
    wordsPool = Array.from({ length: 80 }, () => Math.floor(Math.random() * 10000).toString());
  } else if (mode === 'symbols') {
    const syms = ['!@#$', '%^&*', '()_+', '{}[]', ':;"\'', '<>,.?', '/|\\-'];
    wordsPool = wordsPool.map((w, idx) => (idx % 2 === 0 ? w + syms[idx % syms.length] : w));
  }

  // Difficulty adjustment
  if (difficulty === 'hard' || difficulty === 'expert') {
    wordsPool = wordsPool.filter((w) => w.length >= 5);
  } else if (difficulty === 'easy') {
    // In easy mode, prefer smooth natural typing words (length 2-8)
    const easyWords = wordsPool.filter((w) => w.length <= 8);
    if (easyWords.length >= 30) {
      wordsPool = easyWords;
    }
  }

  const count = wordCount > 0 ? wordCount : 250;
  const selectedWords: string[] = [];

  let currentShuffle = shuffleArray(wordsPool);
  let shuffleIndex = 0;

  for (let i = 0; i < count; i++) {
    if (shuffleIndex >= currentShuffle.length) {
      currentShuffle = shuffleArray(wordsPool);
      shuffleIndex = 0;
    }

    let word = currentShuffle[shuffleIndex++];
    // Prevent consecutive identical words
    if (selectedWords.length > 0 && selectedWords[selectedWords.length - 1] === word && currentShuffle.length > 1) {
      if (shuffleIndex < currentShuffle.length) {
        word = currentShuffle[shuffleIndex];
      }
    }
    selectedWords.push(word);
  }

  const rawText = selectedWords.join(' ');
  return {
    rawText,
    wordsList: selectedWords
  };
}

export function calculateWpm(
  correctCharsCount: number,
  elapsedSeconds: number,
  totalTypedCharsCount?: number
): number {
  if (elapsedSeconds <= 0) return 0;
  const timeInMinutes = elapsedSeconds / 60;

  if (totalTypedCharsCount !== undefined && totalTypedCharsCount > 0) {
    const incorrectCount = Math.max(0, totalTypedCharsCount - correctCharsCount);
    // Errors penalize score: subtract 2.0 penalty chars per error
    // Making mistakes directly drops WPM down!
    const netCorrectChars = Math.max(0, correctCharsCount - incorrectCount * 2.0);
    const wordsTyped = netCorrectChars / 5;
    return Math.max(0, Math.round(wordsTyped / timeInMinutes));
  }

  const wordsTyped = correctCharsCount / 5;
  return Math.max(0, Math.round(wordsTyped / timeInMinutes));
}

export function calculateNetWpm(
  correctCharsCount: number,
  totalTypedCharsCount: number,
  elapsedSeconds: number
): number {
  return calculateWpm(correctCharsCount, elapsedSeconds, totalTypedCharsCount);
}

export function calculateCpm(typedCharsCount: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const timeInMinutes = elapsedSeconds / 60;
  return Math.max(0, Math.round(typedCharsCount / timeInMinutes));
}

export function calculateAccuracy(correctChars: number, totalTypedChars: number): number {
  if (totalTypedChars <= 0) return 100;
  if (correctChars <= 0) return 0;

  const wrongChars = Math.max(0, totalTypedChars - correctChars);
  // Errors add a 1.5x penalty to total count, causing Accuracy to drop sharply on mistakes
  const effectiveTotal = correctChars + wrongChars * 1.5;
  const acc = (correctChars / effectiveTotal) * 100;
  return Math.max(0, Math.min(100, Math.round(acc)));
}

/**
 * Calculates the locked minimum input length for word boundary protection.
 * Once a space in typedInput is typed, or a space in targetText is passed,
 * backspace cannot delete past spaceIndex + 1 into previous words.
 */
export function getLockedMinLength(targetText: string, typedInput: string): number {
  if (!targetText || !typedInput) return 0;

  // 1. Check last space typed in typedInput
  const lastSpaceIdx = typedInput.lastIndexOf(' ');
  let lockedMin = lastSpaceIdx !== -1 ? lastSpaceIdx + 1 : 0;

  // 2. Check spaces in targetText that have been passed by typedInput
  for (let i = 0; i < targetText.length; i++) {
    if (targetText[i] === ' ') {
      if (typedInput.length > i) {
        lockedMin = Math.max(lockedMin, i + 1);
      } else {
        break;
      }
    }
  }

  return lockedMin;
}

/**
 * Calculates target index to jump/pad to when Space key is pressed.
 */
export function getNextWordStartIndexOnSpace(targetText: string, typedInput: string): number | null {
  if (!targetText) return null;
  const words = targetText.split(' ');
  let charOffset = 0;

  for (let i = 0; i < words.length; i++) {
    const wordLen = words[i].length;
    const spaceIdx = charOffset + wordLen;

    if (typedInput.length <= spaceIdx) {
      return spaceIdx + 1;
    }
    charOffset += wordLen + 1;
  }

  return null;
}
