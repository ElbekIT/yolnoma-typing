import { UserCodingProgress, CodingLeaderboardEntry } from '../types/coding';
import { CODING_PROBLEMS } from '../data/codingProblems';
import { rtdb } from '../config/firebase';
import { ref, get, set, update } from 'firebase/database';

const LOCAL_STORAGE_KEY = 'yolnoma_coding_progress_v1';

export function getLocalCodingProgress(): UserCodingProgress {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load coding progress:', err);
  }

  return {
    solvedProblemIds: [],
    totalScore: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    codeDrafts: {}
  };
}

export function saveLocalCodingProgress(progress: UserCodingProgress): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save coding progress:', err);
  }
}

export function markProblemSolved(
  problemId: string,
  userUid?: string,
  userProfile?: { displayName?: string; username?: string; avatarUrl?: string }
): { isNewSolve: boolean; pointsAwarded: number; updatedProgress: UserCodingProgress } {
  const current = getLocalCodingProgress();
  const problem = CODING_PROBLEMS.find((p) => p.id === problemId);
  const points = problem ? problem.points : 10;

  const isNewSolve = !current.solvedProblemIds.includes(problemId);

  let newSolvedList = current.solvedProblemIds;
  let newScore = current.totalScore;

  if (isNewSolve) {
    newSolvedList = [...newSolvedList, problemId];
    newScore += points;
  }

  const updatedProgress: UserCodingProgress = {
    ...current,
    solvedProblemIds: newSolvedList,
    totalScore: newScore,
    totalSubmissions: current.totalSubmissions + 1,
    acceptedSubmissions: current.acceptedSubmissions + 1,
    lastSolvedAt: Date.now()
  };

  saveLocalCodingProgress(updatedProgress);

  // Sync to Firebase if user is logged in
  if (userUid) {
    try {
      const userRef = ref(rtdb, `coding_leaderboard/${userUid}`);
      update(userRef, {
        uid: userUid,
        displayName: userProfile?.displayName || 'Dasturchi',
        username: userProfile?.username || 'coder',
        avatarUrl: userProfile?.avatarUrl || '',
        score: newScore,
        solvedCount: newSolvedList.length,
        lastSolvedAt: Date.now()
      }).catch(() => {});
    } catch {}
  }

  return {
    isNewSolve,
    pointsAwarded: isNewSolve ? points : 0,
    updatedProgress
  };
}

export function saveCodeDraft(problemId: string, language: 'javascript' | 'python', code: string): void {
  const current = getLocalCodingProgress();
  const drafts = current.codeDrafts || {};
  const problemDrafts = drafts[problemId] || {};

  drafts[problemId] = {
    ...problemDrafts,
    [language]: code
  };

  saveLocalCodingProgress({
    ...current,
    codeDrafts: drafts
  });
}

export function getCodeDraft(problemId: string, language: 'javascript' | 'python'): string | null {
  const current = getLocalCodingProgress();
  return current.codeDrafts?.[problemId]?.[language] || null;
}

// Initial default high-score coders to seed leaderboard
export const SEED_CODING_LEADERBOARD: CodingLeaderboardEntry[] = [
  {
    uid: 'seed-1',
    displayName: 'Javohir Toshmatov',
    username: 'javohir_dev',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=javohir',
    rank: 1,
    score: 600,
    solvedCount: 30,
    rankBadge: 'Grandmaster 🏆',
    streak: 15
  },
  {
    uid: 'seed-2',
    displayName: 'Gavharoy Yuldashiva',
    username: 'gavharoy_ai',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=gavharoy',
    rank: 2,
    score: 580,
    solvedCount: 29,
    rankBadge: 'Master ⚡',
    streak: 12
  },
  {
    uid: 'seed-3',
    displayName: 'Bobur Mirzo',
    username: 'bobur_algo',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bobur',
    rank: 3,
    score: 520,
    solvedCount: 26,
    rankBadge: 'Master ⚡',
    streak: 9
  },
  {
    uid: 'seed-4',
    displayName: 'Madina Alimova',
    username: 'madina_code',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=madina',
    rank: 4,
    score: 440,
    solvedCount: 22,
    rankBadge: 'Senior Coder 🚀',
    streak: 7
  },
  {
    uid: 'seed-5',
    displayName: 'Rustam Karimov',
    username: 'rustam_py',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=rustam',
    rank: 5,
    score: 390,
    solvedCount: 20,
    rankBadge: 'Senior Coder 🚀',
    streak: 6
  },
  {
    uid: 'seed-6',
    displayName: 'Shaxzod Bek',
    username: 'shaxzod_js',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=shaxzod',
    rank: 6,
    score: 310,
    solvedCount: 16,
    rankBadge: 'Middle Dev 💻',
    streak: 4
  },
  {
    uid: 'seed-7',
    displayName: 'Dilnoza Karimova',
    username: 'dilnoza_tech',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=dilnoza',
    rank: 7,
    score: 250,
    solvedCount: 14,
    rankBadge: 'Middle Dev 💻',
    streak: 3
  },
  {
    uid: 'seed-8',
    displayName: 'Azizbek Saidov',
    username: 'aziz_frontend',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=aziz',
    rank: 8,
    score: 180,
    solvedCount: 10,
    rankBadge: 'Junior Coder 🌱',
    streak: 2
  }
];

export function getRankBadge(score: number): string {
  if (score >= 550) return 'Grandmaster 🏆';
  if (score >= 400) return 'Master ⚡';
  if (score >= 300) return 'Senior Coder 🚀';
  if (score >= 150) return 'Middle Dev 💻';
  if (score >= 50) return 'Junior Coder 🌱';
  return 'Boshlang\'ich 🐣';
}
