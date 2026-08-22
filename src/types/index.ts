export type LanguageCode =
  | 'en' | 'uz-latn' | 'uz-cyrl' | 'ru' | 'ar' | 'tr' | 'kk' | 'ky'
  | 'tg' | 'tk' | 'az' | 'uk' | 'be' | 'de' | 'fr' | 'es' | 'pt'
  | 'it' | 'nl' | 'pl' | 'cs' | 'sk' | 'ro' | 'hu' | 'fi' | 'sv'
  | 'no' | 'da' | 'el' | 'he' | 'fa' | 'ur' | 'hi' | 'bn' | 'ta'
  | 'te' | 'ml' | 'kn' | 'pa' | 'gu' | 'mr' | 'zh-hans' | 'zh-hant'
  | 'ja' | 'ko' | 'th' | 'vi' | 'id' | 'ms' | (string & {});

export type TextMode = 'words' | 'sentences' | 'quotes' | 'code' | 'numbers' | 'symbols' | 'story' | 'custom';
export type TimeMode = 15 | 30 | 60 | 120 | 300 | 0; // 0 for custom/word-count
export type WordCountMode = 100 | 200 | 300 | 400 | 500 | 10 | 25 | 50 | 0; // 0 for time-based
export type DifficultyMode = 'easy' | 'medium' | 'hard' | 'expert';

export type CaretStyle = 'line' | 'block' | 'underline' | 'outline';
export type SoundProfile = 'off' | 'cherry-blue' | 'cherry-red' | 'thock' | 'typewriter' | 'soft-bubble';
export type ThemeMode = 'dark' | 'light' | 'cyberpunk' | 'serene' | 'dracula' | 'nord' | 'matrix' | 'sunset';

export interface UserSocialLinks {
  twitter?: string;
  github?: string;
  discord?: string;
  website?: string;
}

export interface UserPrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  allowMessages: 'everyone' | 'friends' | 'none';
  showOnlineStatus: boolean;
  showStats: boolean;
  allowFollow: boolean;
}

export interface UserNotificationSettings {
  emailAlerts: boolean;
  achievementAlerts: boolean;
  streakReminders: boolean;
}

export interface UserNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'level_up';
  sender?: string;
  target?: 'all' | string;
  targetName?: string;
}

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

  // Level & XP
  xp: number;
  level: number;
  rankTitle: string;

  // Moderation & Verification
  isVerified?: boolean;
  isBanned?: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  isSuspended?: boolean;
  role: 'user' | 'admin';

  // Username changes
  usernameChangesLeft: number;

  // Social & Privacy
  socialLinks?: UserSocialLinks;
  privacy: UserPrivacySettings;
  notificationsConfig?: UserNotificationSettings;

  // Social connections
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  pinnedAchievements: string[];

  // Stats
  unlockedAchievements: string[];
  totalTests: number;
  totalTimeTypedSeconds: number;
  totalWordsTyped: number;
  totalCharsTyped: number;
  highestWpm: number;
  time15Wpm?: number;
  time30Wpm?: number;
  time60Wpm?: number;
  time120Wpm?: number;
  highestAccuracy: number;
  averageWpm: number;
  currentStreak: number;
  longestStreak: number;
  lastTestDate?: string; // YYYY-MM-DD
  preferredLanguage?: LanguageCode;
  isPublic: boolean;

  // Leaderboard dynamics
  rankChange?: 'up' | 'down' | 'same';
  rankChangeAmount?: number;
  profileVisitorsCount?: number;

  // Dino Runner Stats
  dinoHighScore?: number;
  dinoGamesPlayed?: number;
  dinoMaxDistance?: number;
}

export interface DinoLeaderboardEntry {
  uid: string;
  username: string;
  displayName: string;
  score: number;
  distance?: number;
  obstaclesDodged?: number;
  avatarUrl?: string;
  level?: number;
  rankTitle?: string;
  country?: string;
  timestamp: number;
  isBanned?: boolean;
  isBlocked?: boolean;
  rank?: number;
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

export type BattleGameType = 'speedway' | 'dino';

export interface DinoBattlePlayerState {
  id: string;
  name: string;
  avatarUrl?: string;
  score: number;
  distance: number;
  obstaclesDodged: number;
  isAlive: boolean;
  isWinner?: boolean;
  isBot?: boolean;
  dinoY?: number;
  isJumping?: boolean;
  isDucking?: boolean;
}

export interface AdminInboxMessage {
  id: string;
  name: string;
  phone?: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  status?: 'unread' | 'read' | 'replied';
  userContext?: {
    isAuth: boolean;
    email?: string;
    displayName?: string;
    wpm?: number;
    tests?: number;
    level?: number;
    uid?: string;
  };
}
