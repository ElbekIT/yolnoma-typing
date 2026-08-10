import { TextMode, DifficultyMode, LanguageCode } from '../types';
import { getLanguageInfo, codeSnippets } from '../config/languages';

export interface GeneratedText {
  rawText: string;
  wordsList: string[];
}

export function generateTestText(
  mode: TextMode,
  language: LanguageCode,
  difficulty: DifficultyMode,
  wordCount: number = 25,
  customText?: string
): GeneratedText {
  if (mode === 'custom' && customText && customText.trim().length > 0) {
    const raw = customText.trim();
    return {
      rawText: raw,
      wordsList: raw.split(/\s+/)
    };
  }

  const langInfo = getLanguageInfo(language);

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

  if (mode === 'sentences' || mode === 'story') {
    if (mode === 'story' && langInfo.stories && langInfo.stories.length > 0) {
      const story = langInfo.stories[Math.floor(Math.random() * langInfo.stories.length)];
      return {
        rawText: story,
        wordsList: story.split(' ')
      };
    }

    const sentencesList = langInfo.sentences && langInfo.sentences.length > 0 ? langInfo.sentences : getLanguageInfo('uz-latn').sentences;
    // Pick 1-2 random sentences for rich typing
    const shuffled = [...sentencesList].sort(() => 0.5 - Math.random());
    const selectedSentences = shuffled.slice(0, Math.min(2, shuffled.length)).join(' ');
    return {
      rawText: selectedSentences,
      wordsList: selectedSentences.split(' ')
    };
  }

  // Base words pool
  let wordsPool = [...langInfo.words];
  if (langInfo.sentences && langInfo.sentences.length > 0) {
    // Mix in words from rich sentences
    langInfo.sentences.forEach((s) => {
      s.split(/\s+/).forEach((w) => {
        const clean = w.replace(/[^a-zA-Zʻʼo'g'O'G'а-яА-ЯўЎқҚғҒҳҲ]/g, '');
        if (clean.length > 2) wordsPool.push(clean);
      });
    });
  }

  if (mode === 'numbers') {
    wordsPool = Array.from({ length: 50 }, () => Math.floor(Math.random() * 10000).toString());
  } else if (mode === 'symbols') {
    const syms = ['!@#$', '%^&*', '()_+', '{}[]', ':;"\'', '<>,.?', '/|\\-'];
    wordsPool = wordsPool.map((w, idx) => (idx % 2 === 0 ? w + syms[idx % syms.length] : w));
  }

  // Difficulty adjustment
  if (difficulty === 'hard' || difficulty === 'expert') {
    wordsPool = wordsPool.filter((w) => w.length >= 5);
  }

  const count = wordCount > 0 ? wordCount : 40;
  const selectedWords: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomWord = wordsPool[Math.floor(Math.random() * wordsPool.length)];
    selectedWords.push(randomWord);
  }

  const rawText = selectedWords.join(' ');
  return {
    rawText,
    wordsList: selectedWords
  };
}

export function calculateWpm(correctCharsCount: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const timeInMinutes = elapsedSeconds / 60;
  const wordsTyped = correctCharsCount / 5;
  return Math.max(0, Math.round(wordsTyped / timeInMinutes));
}

export function calculateCpm(typedCharsCount: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const timeInMinutes = elapsedSeconds / 60;
  return Math.max(0, Math.round(typedCharsCount / timeInMinutes));
}

export function calculateAccuracy(correctChars: number, totalTypedChars: number): number {
  if (totalTypedChars <= 0) return 100;
  const acc = (correctChars / totalTypedChars) * 100;
  return Math.max(0, Math.min(100, Math.round(acc)));
}
