export type LanguageCode =
  | 'en' | 'uz-latn' | 'uz-cyrl' | 'ru' | 'ar' | 'tr' | 'kk' | 'ky'
  | 'tg' | 'tk' | 'az' | 'uk' | 'be' | 'de' | 'fr' | 'es' | 'pt'
  | 'it' | 'nl' | 'pl' | 'cs' | 'sk' | 'ro' | 'hu' | 'fi' | 'sv'
  | 'no' | 'da' | 'el' | 'he' | 'fa' | 'ur' | 'hi' | 'bn' | 'ta'
  | 'te' | 'ml' | 'kn' | 'pa' | 'gu' | 'mr' | 'zh-hans' | 'zh-hant'
  | 'ja' | 'ko' | 'th' | 'vi' | 'id' | 'ms';

export type TextMode = 'words' | 'sentences' | 'quotes' | 'code' | 'numbers' | 'symbols' | 'story' | 'custom';
export type TimeMode = 15 | 30 | 60 | 120 | 300 | 0; // 0 for custom/word-count
export type WordCountMode = 10 | 25 | 50 | 100 | 200 | 0; // 0 for time-based
export type DifficultyMode = 'easy' | 'medium' | 'hard' | 'expert';

export type CaretStyle = 'line' | 'block' | 'underline' | 'outline';
export type SoundProfile = 'off' | 'cherry-blue' | 'cherry-red' | 'thock' | 'typewriter' | 'soft-bubble';
export type ThemeMode = 'dark' | 'light' | 'cyberpunk' | 'serene' | 'dracula' | 'nord' | 'matrix' | 'sunset';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  country?: string;
  avatarUrl?: string;
  bannerColor?: string;
  createdAt: number;
  lastActive: number;
  followersCount: number;
  followingCount: number;
  unlockedAchievements: string[];
  totalTests: number;
  totalTimeTypedSeconds: number;
  totalWordsTyped: number;
  totalCharsTyped: number;
  highestWpm: number;
  highestAccuracy: number;
  averageWpm: number;
  currentStreak: number;
  longestStreak: number;
  lastTestDate?: string; // YYYY-MM-DD
  preferredLanguage?: LanguageCode;
  isPublic: boolean;
}

export interface TypingResult {
  id?: string;
  userId: string;
  username: string;
  wpm: number;
  cpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  wrongChars: number;
  extraChars: number;
  missedChars: number;
  backspaceCount: number;
  testTimeSeconds: number;
  mode: TextMode;
  timeMode: TimeMode;
  wordCountMode: WordCountMode;
  difficulty: DifficultyMode;
  language: LanguageCode;
  timestamp: number;
  wpmHistory: { time: number; wpm: number; rawWpm: number; errors: number }[];
  isPersonalBest?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'speed' | 'accuracy' | 'volume' | 'streak' | 'special';
  icon: string;
  unlockedAt?: number;
  progress: number; // 0 to 100
  targetValue: number;
  currentValue: number;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  language: LanguageCode;
  targetWpm: number;
  targetAccuracy: number;
  mode: TextMode;
  rewardXP: number;
  participantsCount: number;
}

export interface CharacterStat {
  char: string;
  totalTyped: number;
  errors: number;
  accuracy: number;
}
