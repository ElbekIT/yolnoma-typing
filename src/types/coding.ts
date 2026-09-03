export type CodingLanguage = 'javascript' | 'python';

export interface TestCase {
  id: number;
  inputDisplay: string; // e.g. "a = 5, b = 10" or "s = 'salom'"
  args: any[];          // Arguments passed directly to the function
  expected: any;        // Expected return value
  isHidden?: boolean;   // Tests 7-10 are hidden/edge cases
}

export interface TestResult {
  testId: number;
  inputDisplay: string;
  expected: any;
  actual: any;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
  logs?: string[];
  isHidden?: boolean;
}

export interface CodingProblem {
  id: string;
  stage: 1 | 2 | 3;
  stageName: string;
  number: number; // 1 to 10 in stage
  title: string;
  slug: string;
  difficulty: 'Oson' | "O'rta" | 'Qiyin';
  points: number;
  category: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
  };
  functionName: string;
  hint?: string;
  testCases: TestCase[]; // exactly 10 test cases
}

export interface UserCodingProgress {
  solvedProblemIds: string[];
  totalScore: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  lastSolvedAt?: number;
  codeDrafts?: Record<string, { javascript?: string; python?: string }>;
}

export interface CodingLeaderboardEntry {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  rank: number;
  score: number;
  solvedCount: number;
  rankBadge: string;
  streak: number;
  isCurrentUser?: boolean;
}
