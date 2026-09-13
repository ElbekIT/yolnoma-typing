import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  Zap,
  Shield,
  Trophy,
  Flame,
  ArrowLeft,
  Share2,
  Check,
  Play,
  Pause,
  HelpCircle,
  Sparkles,
  Swords,
  Globe,
  Heart,
  Keyboard as KeyboardIcon
} from 'lucide-react';
import { SPACE_WORDS, SpaceLanguage, generateWaveEnemies } from '../../data/spaceWords';
import { spaceAudio } from '../../utils/spaceAudio';
import { saveSpaceScore } from '../../utils/spaceLeaderboard';
import { SpaceLeaderboardModal } from './SpaceLeaderboardModal';
import { SpaceVirtualKeyboard } from './SpaceVirtualKeyboard';
import { useAuth } from '../../context/AuthContext';

// Types for Canvas Game Entities
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

interface Laser {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  color: string;
}

interface EnemyBullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  sourceEnemyId: string;
}

interface Enemy {
  id: string;
  word: string;
  typedIndex: number; // Qaysi harfgacha to'g'ri terildi
  x: number;
  y: number;
  targetX: number;
  speed: number;
  type: 'interceptor' | 'cruiser' | 'asteroid' | 'boss';
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  subWords?: string[]; // Qalqon/bosqich uchun qo'shimcha so'zlar
  angle: number;
  lastShootTime: number;
  shootCooldown: number;
}

interface SpaceShooterProps {
  onBackToHome?: () => void;
  onGoToTyping?: () => void;
  onGoToLeaderboard?: () => void;
}

export const SpaceShooter: React.FC<SpaceShooterProps> = ({
  onBackToHome,
  onGoToTyping,
  onGoToLeaderboard
}) => {
  const { user, profile } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Settings & State
  const [language, setLanguage] = useState<SpaceLanguage>('uz');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Mobile virtual keyboard detection & toggle
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window;
  });

  // Next expected char of active target for virtual keyboard highlight
  const [nextExpectedChar, setNextExpectedChar] = useState<string | null>(null);

  // Stats
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('yolnoma_space_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [empCharges, setEmpCharges] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState(0);
  const [waveBanner, setWaveBanner] = useState<string | null>(null);

  // Game Engine Mutable Refs (60 FPS zero-allocation loop)
  const gameStateRef = useRef({
    score: 0,
    wave: 1,
    lives: 3,
    empCharges: 1,
    streak: 0,
    maxStreak: 0,
    enemiesKilled: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    activeTargetId: null as string | null,
    playerX: 0,
    playerY: 0,
    playerAngle: -Math.PI / 2,
    invulnerableTimer: 0, // Secs of invulnerability after damage
    isSpawningWave: false,
    screenShake: 0,
    empFlash: 0,
    hitFlash: 0,
    isPlaying: false,
    isPaused: false
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Responsive device check
  useEffect(() => {
    const handleCheckMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
      if (mobile) {
        setShowVirtualKeyboard(true);
      }
    };
    handleCheckMobile();
    window.addEventListener('resize', handleCheckMobile);
    return () => window.removeEventListener('resize', handleCheckMobile);
  }, []);

  // Initialize Stars
  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    const count = Math.floor((width * height) / 7500);
    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: depth > 0.8 ? 2.4 : depth > 0.4 ? 1.5 : 0.8,
        speed: depth > 0.8 ? 1.6 : depth > 0.4 ? 0.9 : 0.4,
        brightness: Math.random() * 0.7 + 0.3,
        color: depth > 0.8 ? '#38bdf8' : depth > 0.6 ? '#818cf8' : '#f8fafc'
      });
    }
    starsRef.current = stars;
  }, []);

  // Start new Wave
  const startWave = useCallback((waveNum: number, currentLang: SpaceLanguage) => {
    gameStateRef.current.wave = waveNum;
    setWave(waveNum);
    gameStateRef.current.isSpawningWave = true;
    gameStateRef.current.activeTargetId = null;
    setNextExpectedChar(null);

    const isBoss = waveNum % 5 === 0;
    const bannerText = isBoss ? `⚠️ BOSS JANGI: TO'LQIN ${waveNum} ⚠️` : `TO'LQIN ${waveNum}`;
    setWaveBanner(bannerText);

    if (isBoss) {
      spaceAudio.playBossAlert();
    } else {
      spaceAudio.playWaveClear();
    }

    setTimeout(() => {
      setWaveBanner(null);
    }, 2200);

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width / Math.min(window.devicePixelRatio || 1, 2) : 800;

    const waveData = generateWaveEnemies(waveNum, currentLang);
    const newEnemies: Enemy[] = [];
    const now = performance.now();

    if (waveData.isBossWave && waveData.bossWords.length > 0) {
      // 1. Gigant Boss Flagman (4 qavatli so'z va katta HP)
      const primaryWord = waveData.bossWords[0];
      const remainingWords = waveData.bossWords.slice(1);
      const bossHp = waveData.bossWords.length;

      // X-Clamping
      const bossX = width / 2;

      newEnemies.push({
        id: `boss_${Date.now()}`,
        word: primaryWord,
        typedIndex: 0,
        x: bossX,
        y: -100,
        targetX: bossX,
        speed: 0.3,
        type: 'boss',
        radius: 46,
        hp: bossHp,
        maxHp: bossHp,
        color: '#ec4899',
        subWords: remainingWords,
        angle: 0,
        lastShootTime: now + 1500,
        shootCooldown: 2800 // Boss tez-tez o'q otadi
      });

      // Boss himoyachi dronlari
      waveData.regularWords.forEach((word, idx) => {
        // 1-VAZIFA: Chegaralarni to'g'rilash (Clamping)
        const rawX = ((idx + 1) / (waveData.regularWords.length + 1)) * width;
        const clampedX = Math.max(80, Math.min(rawX, width - 150));

        newEnemies.push({
          id: `escort_${Date.now()}_${idx}`,
          word: word,
          typedIndex: 0,
          x: clampedX,
          y: -180 - idx * 65,
          targetX: clampedX,
          speed: 0.65,
          type: 'interceptor',
          radius: 20,
          hp: 1,
          maxHp: 1,
          color: '#f97316',
          angle: 0,
          lastShootTime: now + 2000 + idx * 800,
          shootCooldown: 4500
        });
      });
    } else {
      // 2. Regular Wave Enemies
      const categories = SPACE_WORDS[currentLang] || SPACE_WORDS.uz;
      const mediumPool = categories.medium || categories.short;

      waveData.regularWords.forEach((word, idx) => {
        // 1-VAZIFA: Chegaralarni to'g'rilash (Clamping)
        const rawX = Math.random() * (width - 240) + 120;
        const xPos = Math.max(80, Math.min(rawX, width - 150));

        const speed = 0.45 + Math.min(1.4, waveNum * 0.1) + (Math.random() * 0.2 - 0.1);

        // O'rta dushmanlar (Cruiser) - 2 qavatli qalqon (Shield) bilan, ustida 2 ta so'z
        const isCruiser = word.length >= 7 || (waveNum >= 2 && idx % 3 === 0);
        const isAsteroid = !isCruiser && idx % 4 === 1;
        const type: Enemy['type'] = isCruiser ? 'cruiser' : isAsteroid ? 'asteroid' : 'interceptor';

        // Cruiser uchun 2-so'z
        const secondWord = isCruiser
          ? mediumPool[Math.floor(Math.random() * mediumPool.length)]
          : undefined;

        const maxHp = isCruiser ? 2 : 1;
        const color = isCruiser ? '#a855f7' : isAsteroid ? '#f59e0b' : '#06b6d4';

        newEnemies.push({
          id: `enemy_${waveNum}_${idx}_${Date.now()}`,
          word,
          typedIndex: 0,
          x: xPos,
          y: -60 - idx * 75,
          targetX: xPos + (Math.random() * 60 - 30),
          speed,
          type,
          radius: isCruiser ? 28 : isAsteroid ? 22 : 18,
          hp: maxHp,
          maxHp,
          color,
          subWords: secondWord ? [secondWord] : undefined,
          angle: 0,
          lastShootTime: now + 2500 + Math.random() * 3000,
          shootCooldown: isCruiser ? 3600 : 5000 + Math.random() * 2000
        });
      });
    }

    enemiesRef.current = newEnemies;
    gameStateRef.current.isSpawningWave = false;
  }, []);

  // Spawn Particle Explosion
  const createExplosion = (x: number, y: number, color: string, isBig: boolean = false) => {
    const particleCount = isBig ? 45 : 22;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 1.5) * (isBig ? 1.6 : 1);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015
      });
    }

    // Shockwave ring
    shockwavesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: isBig ? 90 : 45,
      color,
      alpha: 0.9,
      lineWidth: isBig ? 3.5 : 2
    });

    // Screen shake
    gameStateRef.current.screenShake = isBig ? 14 : 6;
  };

  // Trigger EMP Bomb
  const triggerEmpBomb = useCallback(() => {
    if (gameStateRef.current.empCharges <= 0 || !gameStateRef.current.isPlaying || gameStateRef.current.isPaused) return;

    gameStateRef.current.empCharges -= 1;
    setEmpCharges(gameStateRef.current.empCharges);

    gameStateRef.current.empFlash = 1.0;
    gameStateRef.current.screenShake = 18;
    spaceAudio.playEmpBomb();

    // Dushmanlarning barcha o'qlarini tozalaymiz
    enemyBulletsRef.current = [];

    const enemies = enemiesRef.current;
    let earnedScore = 0;

    enemies.forEach((enemy) => {
      createExplosion(enemy.x, enemy.y, '#38bdf8', enemy.type === 'boss');
      earnedScore += enemy.word.length * 20;
    });

    gameStateRef.current.enemiesKilled += enemies.length;
    setEnemiesKilled(gameStateRef.current.enemiesKilled);

    gameStateRef.current.score += earnedScore;
    setScore(gameStateRef.current.score);

    enemiesRef.current = [];
    gameStateRef.current.activeTargetId = null;
    setNextExpectedChar(null);

    // Keyingi to'lqinni ishga tushiramiz
    setTimeout(() => {
      startWave(gameStateRef.current.wave + 1, language);
    }, 1200);
  }, [language, startWave]);

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setWave(1);
    setLives(3);
    setEmpCharges(1);
    setStreak(0);
    setMaxStreak(0);
    setEnemiesKilled(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setStartTime(Date.now());
    setNextExpectedChar(null);

    gameStateRef.current = {
      score: 0,
      wave: 1,
      lives: 3,
      empCharges: 1,
      streak: 0,
      maxStreak: 0,
      enemiesKilled: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      activeTargetId: null,
      playerX: 0,
      playerY: 0,
      playerAngle: -Math.PI / 2,
      invulnerableTimer: 0,
      isSpawningWave: false,
      screenShake: 0,
      empFlash: 0,
      hitFlash: 0,
      isPlaying: true,
      isPaused: false
    };

    enemiesRef.current = [];
    enemyBulletsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    shockwavesRef.current = [];

    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;
      // 1-VAZIFA: Pastki kema har doim ekranning pastidan 80px yuqorida, markazda!
      gameStateRef.current.playerX = logicalWidth / 2;
      gameStateRef.current.playerY = logicalHeight - 80;
    }

    startWave(1, language);
    if (isMusicOn && !isMuted) {
      spaceAudio.startMusic();
    }
  }, [language, isMusicOn, isMuted, startWave]);

  // End Game (Game Over)
  const triggerGameOver = useCallback(() => {
    setIsGameOver(true);
    setIsPlaying(false);
    gameStateRef.current.isPlaying = false;
    setNextExpectedChar(null);

    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    setFinalTime(timeSpent);

    spaceAudio.playExplosion(true);
    spaceAudio.stopMusic();

    const currentScore = gameStateRef.current.score;
    const currentWave = gameStateRef.current.wave;
    const currentStreak = gameStateRef.current.maxStreak;
    const currentEnemies = gameStateRef.current.enemiesKilled;
    const totalKeys = gameStateRef.current.totalKeystrokes;
    const correctKeys = gameStateRef.current.correctKeystrokes;

    const finalAccuracy = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;
    const finalMinutes = Math.max(0.1, timeSpent / 60);
    const finalWpm = Math.round(correctKeys / 5 / finalMinutes);

    // High Score Check
    if (currentScore > highScore) {
      setHighScore(currentScore);
      try {
        localStorage.setItem('yolnoma_space_highscore', String(currentScore));
      } catch {}
    }

    // 4-VAZIFA: Natijani Firebase va Peshqadamlar bazasiga saqlash
    if (currentScore > 0) {
      const playerName = profile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Kosmik Mergan');
      const playerAvatar = profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`;
      const uid = user?.uid || localStorage.getItem('yolnoma_guest_id') || `guest_${Date.now()}`;

      saveSpaceScore({
        score: currentScore,
        wave: currentWave,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        enemiesKilled: currentEnemies,
        maxStreak: currentStreak,
        language,
        playerName,
        playerAvatar,
        uid,
        createdAt: Date.now()
      }).catch((err) => console.error('Save space score error:', err));
    }
  }, [startTime, highScore, profile, user, language]);

  // Central Character Input Engine (shared between physical keyboard and virtual keyboard)
  const handleInputChar = useCallback(
    (char: string) => {
      if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused || isGameOver) return;

      gameStateRef.current.totalKeystrokes += 1;
      setTotalKeystrokes(gameStateRef.current.totalKeystrokes);

      const enemies = enemiesRef.current;
      let activeTarget = enemies.find((en) => en.id === gameStateRef.current.activeTargetId);

      // Agar hozir nishon olinmagan bo'lsa: birinchi harfi mos keladigan eng pastdagi (xavfli) dushmanni tanlaymiz
      if (!activeTarget) {
        const candidates = enemies
          .filter((en) => en.y > 0 && en.word[0].toLowerCase() === char)
          .sort((a, b) => b.y - a.y);

        if (candidates.length > 0) {
          activeTarget = candidates[0];
          gameStateRef.current.activeTargetId = activeTarget.id;
        }
      }

      // Faol nishon mavjud bo'lsa
      if (activeTarget) {
        const expectedChar = activeTarget.word[activeTarget.typedIndex]?.toLowerCase();

        if (char === expectedChar) {
          // TO'G'RI HARF!
          activeTarget.typedIndex += 1;
          gameStateRef.current.correctKeystrokes += 1;
          setCorrectKeystrokes(gameStateRef.current.correctKeystrokes);

          // Keyingi kutilayotgan harfni virtual klaviaturaga uzatamiz
          const nextChar = activeTarget.word[activeTarget.typedIndex]?.toLowerCase() || null;
          setNextExpectedChar(nextChar);

          // Streak oshishi
          gameStateRef.current.streak += 1;
          if (gameStateRef.current.streak > gameStateRef.current.maxStreak) {
            gameStateRef.current.maxStreak = gameStateRef.current.streak;
            setMaxStreak(gameStateRef.current.streak);
          }
          setStreak(gameStateRef.current.streak);

          // Ball qo'shish (Streak multiplikatori bilan)
          const multiplier = 1 + Math.min(3, Math.floor(gameStateRef.current.streak / 10) * 0.5);
          const earned = Math.round(12 * multiplier);
          gameStateRef.current.score += earned;
          setScore(gameStateRef.current.score);

          // Kema burchagini dushmanga yo'naltirish
          const angle = Math.atan2(
            activeTarget.y - gameStateRef.current.playerY,
            activeTarget.x - gameStateRef.current.playerX
          );
          gameStateRef.current.playerAngle = angle;

          // Lazer otish
          lasersRef.current.push({
            x: gameStateRef.current.playerX,
            y: gameStateRef.current.playerY - 24,
            targetX: activeTarget.x,
            targetY: activeTarget.y,
            progress: 0,
            color: activeTarget.color
          });

          spaceAudio.playLaser(760 + activeTarget.typedIndex * 45);

          // So'z to'liq terib tugatildimi?
          if (activeTarget.typedIndex >= activeTarget.word.length) {
            // Agar dushmanning qo'shimcha qalqon/so'zlari qolgan bo'lsa (Cruiser yoki Boss)
            if (activeTarget.subWords && activeTarget.subWords.length > 0) {
              const nextWord = activeTarget.subWords.shift()!;
              activeTarget.word = nextWord;
              activeTarget.typedIndex = 0;
              activeTarget.hp -= 1;

              // Qalqon parchalanishi ovozi va zarralari
              spaceAudio.playShieldBreak();
              createExplosion(activeTarget.x, activeTarget.y, '#38bdf8', false);

              // Ball bonusi
              gameStateRef.current.score += 200;
              setScore(gameStateRef.current.score);

              // Virtual klaviaturada yangi so'zning birinchi harfini ko'rsatamiz
              setNextExpectedChar(nextWord[0].toLowerCase());
            } else {
              // Dushman butunlay yo'q qilindi!
              createExplosion(activeTarget.x, activeTarget.y, activeTarget.color, activeTarget.type === 'boss');
              spaceAudio.playExplosion(activeTarget.type === 'boss');

              // 3-VAZIFA: So'z to'g'ri yozilsa, ushbu dushmanning o'qlari ham havoda yo'q bo'ladi
              enemyBulletsRef.current = enemyBulletsRef.current.filter(
                (b) => b.sourceEnemyId !== activeTarget!.id
              );

              // Ball bonusi
              const wordBonus = activeTarget.word.length * 25 + (activeTarget.type === 'boss' ? 500 : 50);
              gameStateRef.current.score += wordBonus;
              setScore(gameStateRef.current.score);

              gameStateRef.current.enemiesKilled += 1;
              setEnemiesKilled(gameStateRef.current.enemiesKilled);

              // Dushmanni o'chirish
              enemiesRef.current = enemiesRef.current.filter((en) => en.id !== activeTarget!.id);
              gameStateRef.current.activeTargetId = null;
              setNextExpectedChar(null);

              // To'lqindagi barcha dushmanlar yo'q qilindimi?
              if (enemiesRef.current.length === 0 && !gameStateRef.current.isSpawningWave) {
                // Har 3 to'lqinda qo'shimcha EMP bomba
                if (gameStateRef.current.wave % 3 === 0 && gameStateRef.current.empCharges < 3) {
                  gameStateRef.current.empCharges += 1;
                  setEmpCharges(gameStateRef.current.empCharges);
                }

                setTimeout(() => {
                  startWave(gameStateRef.current.wave + 1, language);
                }, 1000);
              }
            }
          }
        } else {
          // NOTO'G'RI HARF!
          gameStateRef.current.streak = 0;
          setStreak(0);
          spaceAudio.playError();
        }
      } else {
        // Mos keladigan dushman topilmadi
        gameStateRef.current.streak = 0;
        setStreak(0);
        spaceAudio.playError();
      }
    },
    [isGameOver, language, startWave]
  );

  // Handle Physical Keyboard Events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Space or Enter triggers EMP Bomb
      if (e.code === 'Space' || e.code === 'Enter') {
        if (gameStateRef.current.isPlaying && !gameStateRef.current.isPaused) {
          e.preventDefault();
          triggerEmpBomb();
          return;
        }
      }

      // Escape toggles Pause
      if (e.key === 'Escape') {
        if (gameStateRef.current.isPlaying && !isGameOver) {
          e.preventDefault();
          setIsPaused((prev) => {
            const next = !prev;
            gameStateRef.current.isPaused = next;
            if (next) {
              spaceAudio.stopMusic();
            } else if (isMusicOn && !isMuted) {
              spaceAudio.startMusic();
            }
            return next;
          });
          return;
        }
      }

      if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused || isGameOver) return;

      const char = e.key.toLowerCase();
      if (char.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      e.preventDefault();
      handleInputChar(char);
    },
    [handleInputChar, isGameOver, isMusicOn, isMuted, triggerEmpBomb]
  );

  // Bind Keyboard Events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 1-VAZIFA: To'liq moslashuvchan Canvas (Responsive Full-Screen Fit)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // 1-VAZIFA TALABI: Pastki kema (Player Ship) har doim ekranning pastki qismidan 80px yuqorida, markazda!
      gameStateRef.current.playerX = rect.width / 2;
      gameStateRef.current.playerY = rect.height - 80;

      initStars(rect.width, rect.height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [initStars]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // Update Player Y position ensuring 80px above bottom
      gameStateRef.current.playerX = width / 2;
      gameStateRef.current.playerY = height - 80;

      // Update invulnerability timer
      if (gameStateRef.current.invulnerableTimer > 0) {
        gameStateRef.current.invulnerableTimer = Math.max(0, gameStateRef.current.invulnerableTimer - dt);
      }

      // Clear Canvas with Deep Cosmic Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(1, '#080d24');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Screen Shake translation
      ctx.save();
      if (gameStateRef.current.screenShake > 0) {
        const shake = gameStateRef.current.screenShake;
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        gameStateRef.current.screenShake = Math.max(0, shake - dt * 28);
      }

      // 1. Draw Starfield (Parallax Background)
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.y += star.speed * (gameStateRef.current.isPlaying && !gameStateRef.current.isPaused ? 1.5 : 0.6);
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.brightness;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
      ctx.globalAlpha = 1.0;

      // 2. Draw Lasers
      const lasers = lasersRef.current;
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.progress += dt * 6.5;

        const currentX = laser.x + (laser.targetX - laser.x) * Math.min(1, laser.progress);
        const currentY = laser.y + (laser.targetY - laser.y) * Math.min(1, laser.progress);
        const prevX = laser.x + (laser.targetX - laser.x) * Math.max(0, laser.progress - 0.25);
        const prevY = laser.y + (laser.targetY - laser.y) * Math.max(0, laser.progress - 0.25);

        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        if (laser.progress >= 1) {
          lasers.splice(i, 1);
        }
      }

      // 3. Update & Draw Enemy Bullets (3-VAZIFA: Dushmanlar o'q otishi)
      const bullets = enemyBulletsRef.current;
      const playerX = gameStateRef.current.playerX;
      const playerY = gameStateRef.current.playerY;
      const isInvulnerable = gameStateRef.current.invulnerableTimer > 0;

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (gameStateRef.current.isPlaying && !gameStateRef.current.isPaused) {
          b.x += b.vx * (dt * 60);
          b.y += b.vy * (dt * 60);
        }

        // Draw Bullet (Glowing Red Plasma Orb)
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Hot Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Check Collision with Player Ship
        const distToPlayer = Math.hypot(b.x - playerX, b.y - playerY);
        if (distToPlayer < 28 && gameStateRef.current.isPlaying) {
          bullets.splice(i, 1);

          if (!isInvulnerable) {
            // O'yinchi zarba qabul qildi!
            gameStateRef.current.lives -= 1;
            const remainingLives = gameStateRef.current.lives;
            setLives(remainingLives);

            spaceAudio.playPlayerHit();
            gameStateRef.current.screenShake = 18;
            gameStateRef.current.hitFlash = 1.0;
            gameStateRef.current.invulnerableTimer = 1.5;

            // Zarba zarralari
            createExplosion(playerX, playerY, '#ef4444', false);

            if (remainingLives <= 0) {
              triggerGameOver();
              return;
            }
          }
          continue;
        }

        // Out of screen bounds
        if (b.y > height + 20 || b.x < -20 || b.x > width + 20) {
          bullets.splice(i, 1);
        }
      }

      // 4. Update and Draw Enemies
      const enemies = enemiesRef.current;
      const currentTime = performance.now();

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (gameStateRef.current.isPlaying && !gameStateRef.current.isPaused) {
          enemy.y += enemy.speed * (dt * 60);

          // 1-VAZIFA: Horizontal harakat va chegara nazorati (Clamping)
          enemy.angle += dt * 2;
          if (enemy.type === 'interceptor') {
            enemy.x += Math.sin(enemy.angle) * 0.9;
          }
          enemy.x = Math.max(75, Math.min(enemy.x, width - 75));

          // 3-VAZIFA: Dushmanlar o'q otishi
          if (
            enemy.y > 50 &&
            enemy.y < height - 120 &&
            currentTime - enemy.lastShootTime > enemy.shootCooldown
          ) {
            enemy.lastShootTime = currentTime;

            if (enemy.type === 'boss') {
              // Boss 3 ta tarqoq plazma o'q otadi
              spaceAudio.playEnemyShoot();
              [-0.8, 0, 0.8].forEach((spreadX, bulletIdx) => {
                enemyBulletsRef.current.push({
                  id: `b_${Date.now()}_${bulletIdx}`,
                  x: enemy.x,
                  y: enemy.y + enemy.radius + 5,
                  vx: spreadX,
                  vy: 2.1,
                  color: '#ec4899',
                  radius: 5.5,
                  sourceEnemyId: enemy.id
                });
              });
            } else if (enemy.type === 'cruiser') {
              // Cruiser o'q otishi
              spaceAudio.playEnemyShoot();
              const dx = playerX - enemy.x;
              const vx = Math.max(-1.0, Math.min(1.0, dx * 0.003));
              enemyBulletsRef.current.push({
                id: `b_${Date.now()}`,
                x: enemy.x,
                y: enemy.y + enemy.radius + 4,
                vx,
                vy: 1.85,
                color: '#f43f5e',
                radius: 4.5,
                sourceEnemyId: enemy.id
              });
            } else if (enemy.type === 'interceptor' && Math.random() > 0.4) {
              // Tezkor interceptor ba'zida o'q otadi
              spaceAudio.playEnemyShoot();
              enemyBulletsRef.current.push({
                id: `b_${Date.now()}`,
                x: enemy.x,
                y: enemy.y + enemy.radius + 4,
                vx: 0,
                vy: 1.95,
                color: '#f97316',
                radius: 4,
                sourceEnemyId: enemy.id
              });
            }
          }
        }

        // Draw Enemy Body
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        const isTargeted = enemy.id === gameStateRef.current.activeTargetId;

        // Draw Targeting Reticle
        if (isTargeted) {
          ctx.strokeStyle = '#00ffcc';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.radius + 12, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle Crosshairs
          const r = enemy.radius + 17;
          ctx.beginPath();
          ctx.moveTo(-r, 0);
          ctx.lineTo(-r + 7, 0);
          ctx.moveTo(r, 0);
          ctx.lineTo(r - 7, 0);
          ctx.moveTo(0, -r);
          ctx.lineTo(0, -r + 7);
          ctx.moveTo(0, r);
          ctx.lineTo(0, r - 7);
          ctx.stroke();
        }

        // Enemy Ship Design
        if (enemy.type === 'boss') {
          // Boss Ship (Giant Alien Flagship)
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 3.5;

          ctx.beginPath();
          ctx.moveTo(0, 36);
          ctx.lineTo(46, 10);
          ctx.lineTo(36, -26);
          ctx.lineTo(16, -36);
          ctx.lineTo(-16, -36);
          ctx.lineTo(-36, -26);
          ctx.lineTo(-46, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Boss Glowing Core
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();

          // Boss Energy Shield Ring
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (enemy.type === 'cruiser') {
          // Heavy Cruiser (2 qavatli qalqon bilan)
          ctx.fillStyle = '#2e1065';
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(0, 22);
          ctx.lineTo(28, -6);
          ctx.lineTo(14, -24);
          ctx.lineTo(-14, -24);
          ctx.lineTo(-28, -6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cruiser Shield Bubble if HP > 1
          if (enemy.hp > 1) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius + 6, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (enemy.type === 'asteroid') {
          // Rotating Asteroid
          ctx.fillStyle = '#451a03';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.rotate(enemy.angle);

          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(12, 14);
          ctx.lineTo(-6, 18);
          ctx.lineTo(-18, 6);
          ctx.lineTo(-14, -14);
          ctx.lineTo(8, -16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Fast Interceptor Drone
          ctx.fillStyle = '#083344';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(0, 18);
          ctx.lineTo(18, -12);
          ctx.lineTo(0, -6);
          ctx.lineTo(-18, -12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();

        // 3-VAZIFA: Dushmanlarning Joni (HP / Health Bar)
        if (enemy.maxHp > 1) {
          const hpBarWidth = enemy.type === 'boss' ? 70 : 44;
          const hpBarHeight = 5;
          const hpBarY = enemy.y + enemy.radius + 10;
          const hpPct = enemy.hp / enemy.maxHp;

          // Bar Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(enemy.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

          // Bar Fill
          ctx.fillStyle = enemy.type === 'boss' ? '#ec4899' : '#38bdf8';
          ctx.fillRect(enemy.x - hpBarWidth / 2, hpBarY, hpBarWidth * hpPct, hpBarHeight);

          // Bar Border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(enemy.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);
        }

        // 1-VAZIFA & 4: Word Label Clamping (Hech qachon ekrandan chiqib ketmaydi!)
        const word = enemy.word;
        const typedIdx = enemy.typedIndex;

        ctx.font = 'bold 15px monospace';
        const fullWidth = ctx.measureText(word).width;
        const halfWidth = fullWidth / 2 + 10;

        // 1-VAZIFA: So'z x-koordinatasi ekranning chetidan chiqib ketmasligi uchun qat'iy chegaralanadi!
        const clampedLabelX = Math.max(halfWidth + 10, Math.min(enemy.x, width - halfWidth - 10));
        const labelY = enemy.y - enemy.radius - 18;

        // Background pill behind word
        ctx.fillStyle = isTargeted ? 'rgba(0, 0, 0, 0.9)' : 'rgba(5, 8, 20, 0.8)';
        ctx.strokeStyle = isTargeted ? '#00ffcc' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = isTargeted ? 1.5 : 1;

        const padX = 8;
        const padY = 4;
        ctx.beginPath();
        ctx.roundRect(clampedLabelX - fullWidth / 2 - padX, labelY - 10 - padY, fullWidth + padX * 2, 20 + padY * 2, 6);
        ctx.fill();
        ctx.stroke();

        // Draw Typed (Neon Green/Cyan) vs Remaining (White) Letters
        let curX = clampedLabelX - fullWidth / 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        for (let j = 0; j < word.length; j++) {
          const ch = word[j];
          const chWidth = ctx.measureText(ch).width;

          if (j < typedIdx) {
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = isTargeted ? '#ffffff' : '#cbd5e1';
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          ctx.fillText(ch, curX, labelY);
          curX += chWidth;
        }
        ctx.shadowBlur = 0;

        // Direct Collision with Player Spaceship
        const dist = Math.hypot(enemy.x - playerX, enemy.y - playerY);
        if (dist < enemy.radius + 26 || enemy.y > height - 30) {
          createExplosion(enemy.x, enemy.y, enemy.color, true);
          enemies.splice(i, 1);

          if (gameStateRef.current.isPlaying) {
            gameStateRef.current.lives -= 1;
            setLives(gameStateRef.current.lives);
            spaceAudio.playPlayerHit();
            gameStateRef.current.screenShake = 20;
            gameStateRef.current.hitFlash = 1.0;

            if (gameStateRef.current.lives <= 0) {
              triggerGameOver();
              return;
            }
          }
        }
      }

      // 5. Draw Player Spaceship (1-VAZIFA TALABI: Markazda, yong'in va neon chiqarib, aniq ko'rinib turadi)
      ctx.save();
      ctx.translate(playerX, playerY);

      // Smooth rotate towards target if available
      let targetAngle = -Math.PI / 2;
      const activeEnemy = enemies.find((en) => en.id === gameStateRef.current.activeTargetId);
      if (activeEnemy) {
        targetAngle = Math.atan2(activeEnemy.y - playerY, activeEnemy.x - playerX) + Math.PI / 2;
      }
      ctx.rotate(targetAngle);

      // Invulnerability blink effect
      if (isInvulnerable && Math.floor(currentTime / 80) % 2 === 0) {
        ctx.globalAlpha = 0.35;
      }

      // 1-VAZIFA: Ultra-Neon Twin Rocket Thruster Flame (Har doim lovullab turadi)
      const isAlive = gameStateRef.current.isPlaying && !gameStateRef.current.isPaused;
      const flameHeight = isAlive ? 22 + Math.random() * 12 : 12;

      // Outer Cyan Plasma Flame
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;

      // Left nozzle flame
      ctx.beginPath();
      ctx.moveTo(-9, 16);
      ctx.lineTo(-6, 16 + flameHeight);
      ctx.lineTo(-3, 16);
      ctx.closePath();
      ctx.fill();

      // Right nozzle flame
      ctx.beginPath();
      ctx.moveTo(3, 16);
      ctx.lineTo(6, 16 + flameHeight);
      ctx.lineTo(9, 16);
      ctx.closePath();
      ctx.fill();

      // Inner White-Hot Core Flame
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(-8, 16);
      ctx.lineTo(-6, 16 + flameHeight * 0.6);
      ctx.lineTo(-4, 16);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(4, 16);
      ctx.lineTo(6, 16 + flameHeight * 0.6);
      ctx.lineTo(8, 16);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // Spaceship Body (Futuristic Neon Interceptor)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(0, -32); // Ship Nose
      ctx.lineTo(22, 18); // Right Wing
      ctx.lineTo(8, 14);
      ctx.lineTo(0, 20);
      ctx.lineTo(-8, 14);
      ctx.lineTo(-22, 18); // Left Wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Neon Wing Strips
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, 12);
      ctx.lineTo(-5, -6);
      ctx.moveTo(16, 12);
      ctx.lineTo(5, -6);
      ctx.stroke();

      // Glowing Cockpit
      ctx.fillStyle = '#00ffcc';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -7, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dynamic Shield Aura (Lives indicator aura)
      const currentLives = gameStateRef.current.lives;
      const shieldColor =
        currentLives === 3
          ? 'rgba(56, 189, 248, 0.45)'
          : currentLives === 2
          ? 'rgba(234, 179, 8, 0.45)'
          : 'rgba(239, 68, 68, 0.6)';

      ctx.strokeStyle = shieldColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -3, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // 6. Draw Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 7. Draw Shockwaves
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += dt * 180;
        sw.alpha -= dt * 2.2;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = sw.color;
        ctx.lineWidth = sw.lineWidth;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 8. EMP Flash Effect
      if (gameStateRef.current.empFlash > 0) {
        ctx.fillStyle = `rgba(56, 189, 248, ${gameStateRef.current.empFlash * 0.45})`;
        ctx.fillRect(0, 0, width, height);
        gameStateRef.current.empFlash = Math.max(0, gameStateRef.current.empFlash - dt * 3.5);
      }

      // 9. Player Hit Red Flash Effect
      if (gameStateRef.current.hitFlash > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${gameStateRef.current.hitFlash * 0.35})`;
        ctx.fillRect(0, 0, width, height);
        gameStateRef.current.hitFlash = Math.max(0, gameStateRef.current.hitFlash - dt * 3);
      }

      ctx.restore(); // Screen shake restore

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [triggerGameOver]);

  // Audio Toggles
  const handleToggleMute = () => {
    const next = spaceAudio.toggleMute();
    setIsMuted(next);
  };

  const handleToggleMusic = () => {
    const next = !isMusicOn;
    setIsMusicOn(next);
    spaceAudio.setMusicEnabled(next);
  };

  // Calculations for Result Modal
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const elapsedMinutes = Math.max(0.1, finalTime / 60);
  const calculatedWpm = Math.round(correctKeystrokes / 5 / elapsedMinutes);

  const handleShareResult = () => {
    const shareText = `🚀 Men Yolnoma "Koinot Jangi" (Space Shooter) da ${score.toLocaleString()} ball to'pladim! (To'lqin: ${wave}, Aniqlik: ${accuracy}%, WPM: ${calculatedWpm}). Koinotni siz ham himoya qiling: https://www.yolnoma.uz/space`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 space-y-3 animate-in fade-in duration-200">
      {/* Top Header Controls (ZType HUD Style) */}
      <div className="w-full bg-slate-950/85 border border-cyan-500/40 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-cyan-950/50 backdrop-blur-md">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-2.5">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Bosh sahifaga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-1.5">
                <span>KOINOT JANGI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                  2D ARKADA
                </span>
              </h1>
              <p className="text-[11px] text-cyan-300/70 hidden sm:block">
                ZType uslubidagi kosmik klaviatura mergani
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Stats HUD */}
        <div className="flex items-center gap-3 sm:gap-5 font-mono">
          {/* Lives (3-VAZIFA: Jon tizimi) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase">Jon</span>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3].map((heartIdx) => (
                <Heart
                  key={heartIdx}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                    heartIdx <= lives
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
                      : 'text-slate-700 fill-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase">Ball</span>
            <span className="text-base sm:text-xl font-black text-amber-400 tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase">To'lqin</span>
            <span className="text-base sm:text-xl font-black text-cyan-400 tracking-wider">
              WAVE {wave}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase">Streak</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              x{streak}
            </span>
          </div>
        </div>

        {/* Right: Actions, Leaderboard, Audio, Language */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 4-VAZIFA: Peshqadamlar Reytingi Tugmasi */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="🏆 Koinot Qahramonlari (Top 10)"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reyting</span>
          </button>

          {/* Virtual Keyboard Toggle */}
          <button
            onClick={() => setShowVirtualKeyboard((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showVirtualKeyboard
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
            title="Virtual Klaviatura"
          >
            <KeyboardIcon className="w-4 h-4" />
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-xl p-0.5 text-xs font-bold">
            <button
              onClick={() => setLanguage('uz')}
              disabled={isPlaying}
              className={`px-2 py-1 rounded-lg transition-colors ${
                language === 'uz' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
              title="O'zbek tili"
            >
              UZ
            </button>
            <button
              onClick={() => setLanguage('en')}
              disabled={isPlaying}
              className={`px-2 py-1 rounded-lg transition-colors ${
                language === 'en' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
              title="Ingliz tili"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ru')}
              disabled={isPlaying}
              className={`px-2 py-1 rounded-lg transition-colors ${
                language === 'ru' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
              title="Rus tili"
            >
              RU
            </button>
          </div>

          {/* EMP Bomb Button */}
          <button
            onClick={triggerEmpBomb}
            disabled={empCharges <= 0 || !isPlaying || isPaused}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
              empCharges > 0 && isPlaying && !isPaused
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95'
                : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="EMP Bomba (Space yoki Enter)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>EMP: {empCharges}</span>
          </button>

          {/* Audio Controls */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            title={isMuted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={handleToggleMusic}
            className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer ${
              isMusicOn ? 'text-indigo-400' : 'text-slate-500'
            }`}
            title={isMusicOn ? "Fon musiqasini o'chirish" : 'Fon musiqasini yoqish'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            title="Qo'llanma"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Main Canvas Gaming Viewport (1-VAZIFA: Responsive Full-Screen Fit) */}
      <div
        ref={containerRef}
        className="relative w-full h-[480px] sm:h-[560px] md:h-[620px] max-h-[700px] rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/70 bg-[#030712] flex-shrink-0 select-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair touch-none" />

        {/* Wave Banner Floating Overlay */}
        {waveBanner && (
          <div className="absolute inset-x-0 top-16 flex justify-center pointer-events-none animate-in zoom-in-95 duration-300">
            <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/40 to-cyan-500/20 border border-cyan-400/80 text-white font-mono font-black text-lg sm:text-2xl shadow-2xl tracking-widest backdrop-blur-md">
              {waveBanner}
            </div>
          </div>
        )}

        {/* Start Game Screen Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in duration-200">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-2xl">
                <Zap className="w-10 h-10 fill-current" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                KOINOT JANGI 🚀
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dushman kemalaridagi so'zlarni tering va ularni lazer bilan yo'q qiling!
                Dushmanlar o'q uzishidan ehtiyot bo'ling va 3 ta joningizni asrang.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-cyan-300/80">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                ⌨️ Harflarni tering
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                ❤️ 3 ta Jon
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                ⚡ [Space] EMP Bomba
              </span>
            </div>

            {highScore > 0 && (
              <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Mening rekordim: {highScore.toLocaleString()} ball</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartGame}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>JANGNI BOSHLASH</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 transition-all cursor-pointer shadow-lg"
                title="🏆 Koinot Qahramonlari"
              >
                <Trophy className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Paused Screen Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-150">
            <h3 className="text-2xl font-black text-white tracking-widest font-mono">
              O'YIN TO'XTATILDI (PAUSE)
            </h3>
            <p className="text-xs text-slate-400 font-mono">Davom etish uchun [Esc] tugmasini bosing</p>
            <button
              onClick={() => {
                setIsPaused(false);
                gameStateRef.current.isPaused = false;
                if (isMusicOn && !isMuted) spaceAudio.startMusic();
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
            >
              Davom etish
            </button>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-xl">
              <Swords className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                KEMA PORTLADI! (GAME OVER)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Siz koinot himoyasida mardonavor jang qildingiz! Natijangiz peshqadamlar jadvaliga saqlandi.
              </p>
            </div>

            {/* Scoreboard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">To'plangan Ball</div>
                <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                  {score.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Erishilgan To'lqin</div>
                <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
                  Wave {wave}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Tezlik (WPM)</div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                  {calculatedWpm} WPM
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Aniqlik</div>
                <div className="text-lg sm:text-xl font-black text-purple-400 font-mono">
                  {accuracy}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartGame}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta o'ynash</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 text-xs sm:text-sm font-bold text-amber-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>🏆 Koinot Qahramonlari</span>
              </button>

              <button
                onClick={handleShareResult}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-xs sm:text-sm font-bold text-white flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Natijani ulashish</span>
                  </>
                )}
              </button>

              {onGoToTyping && (
                <button
                  onClick={onGoToTyping}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Yozish testiga o'tish
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2-VAZIFA: Telefonlar va planshetlar uchun Zamonaviy Virtual Klaviatura (Mobile UX) */}
      {showVirtualKeyboard && isPlaying && !isGameOver && (
        <div className="w-full animate-in slide-in-from-bottom-3 duration-200">
          <SpaceVirtualKeyboard
            language={language}
            nextExpectedChar={nextExpectedChar}
            empCharges={empCharges}
            onKeyPress={(char) => handleInputChar(char)}
            onEmpPress={triggerEmpBomb}
          />
        </div>
      )}

      {/* 4-VAZIFA: Koinot Qahramonlari Leaderboard Modal */}
      <SpaceLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUserId={user?.uid}
      />

      {/* Quick Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-md w-full bg-slate-950 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Koinot Jangi Qo'llanmasi</span>
              </h4>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-cyan-400 block mb-1">🎯 1. Nishon va Lazer:</strong>
                Klaviaturada harfni bossangiz, birinchi harfi mos kelgan dushmanga avtomatik nishon olinadi va lazer uzatiladi.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-rose-400 block mb-1">❤️ 2. Dushmanlar o'qi va 3 ta Jon:</strong>
                Dushmanlar pastga qarab qizil plazma lazerlarini otadi. So'zni tezroq tugatib dushmanni yo'q qilsangiz, uning o'qlari ham havoda yo'q bo'ladi!
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-amber-400 block mb-1">⚡ 3. EMP Super Bomba:</strong>
                Qiyin paytda <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">[Space]</kbd> tugmasini bosing — ekrandagi hamma dushmanlar va ularning o'qlari bir zumda portlaydi!
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-purple-400 block mb-1">👑 4. Qalqonli Cruiserlar va Boss:</strong>
                O'rta dushmanlar 2 qavatli qalqonga ega (2 ta so'z). Har 5-to'lqinda esa gigant Flagman kema (Boss) hujum qiladi.
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Tushundim, jangga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
