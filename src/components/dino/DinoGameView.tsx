import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronRight,
  User,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dinoSound } from './dinoSound';
import { rtdb } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';
import { DinoLeaderboardEntry } from '../../types';

interface DinoGameViewProps {
  onGoToLeaderboard: () => void;
}

type DinoTheme = 'classic' | 'theme' | 'neon';

export const DinoGameView: React.FC<DinoGameViewProps> = ({ onGoToLeaderboard }) => {
  const { user, profile, saveDinoScore } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // HUD DOM element refs for 0-latency, 0-rerender direct updates
  const scoreTextRef = useRef<HTMLSpanElement | null>(null);
  const distTextRef = useRef<HTMLSpanElement | null>(null);
  const dodgedTextRef = useRef<HTMLSpanElement | null>(null);
  const recordTextRef = useRef<HTMLSpanElement | null>(null);

  // High-level React States (only changed on major lifecycle events, NOT every frame)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [highScore, setHighScore] = useState<number>(() => {
    return profile?.dinoHighScore || Number(localStorage.getItem('yolnoma_guest_dino_best') || 0);
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<DinoTheme>('theme');
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Top 10 Dino players
  const [topDinoPlayers, setTopDinoPlayers] = useState<DinoLeaderboardEntry[]>([]);
  const [loadingTop, setLoadingTop] = useState<boolean>(true);

  // Sync high score with profile changes
  useEffect(() => {
    if (profile?.dinoHighScore && profile.dinoHighScore > highScore) {
      setHighScore(profile.dinoHighScore);
    }
  }, [profile?.dinoHighScore, highScore]);

  // Fetch real-time Dino Leaderboard from Firebase
  useEffect(() => {
    setLoadingTop(true);
    try {
      const dinoRef = ref(rtdb, 'dino_leaderboard');
      const unsubscribe = onValue(dinoRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: DinoLeaderboardEntry[] = Object.keys(val).map((k) => ({
            ...val[k],
            uid: k
          }));
          list.sort((a, b) => (b.score || 0) - (a.score || 0));
          const ranked = list.slice(0, 10).map((p, idx) => ({ ...p, rank: idx + 1 }));
          setTopDinoPlayers(ranked);
        } else {
          setTopDinoPlayers([]);
        }
        setLoadingTop(false);
      });
      return () => unsubscribe();
    } catch {
      setLoadingTop(false);
    }
  }, []);

  // Audio mute toggle
  const handleToggleSound = () => {
    const muted = dinoSound.toggleMute();
    setIsMuted(muted);
  };

  // Game Engine Internal Variables via Refs
  const gameRef = useRef<{
    animationFrameId: number | null;
    lastTime: number;
    score: number;
    highScore: number;
    distance: number;
    speed: number;
    baseSpeed: number;
    maxSpeed: number;
    gravity: number;
    jumpVelocity: number;
    groundY: number;
    nightCycle: number;
    nightOpacity: number;
    milestoneFlash: number;
    obstaclesDodged: number;
    jumpBuffered: boolean;
    jumpBufferTimer: number;

    // Dino state
    dino: {
      x: number;
      y: number;
      width: number;
      height: number;
      standHeight: number;
      duckHeight: number;
      vy: number;
      isJumping: boolean;
      isDucking: boolean;
      legStep: number;
      legTimer: number;
      blinkTimer: number;
      eyeOpen: boolean;
    };

    // Obstacles
    obstacles: Array<{
      id: number;
      type: 'cactus_small' | 'cactus_large' | 'cactus_group' | 'bird';
      x: number;
      y: number;
      width: number;
      height: number;
      birdFrame?: number;
      birdTimer?: number;
      dodged?: boolean;
    }>;
    nextObstacleDistance: number;
    obstacleIdCounter: number;

    // Background elements
    clouds: Array<{ x: number; y: number; speed: number; width: number }>;
    stars: Array<{ x: number; y: number; radius: number; alpha: number }>;
    groundPebbles: Array<{ x: number; size: number }>;

    // Key states
    keys: {
      jump: boolean;
      duck: boolean;
    };
  }>({
    animationFrameId: null,
    lastTime: 0,
    score: 0,
    highScore: 0,
    distance: 0,
    speed: 7.2,
    baseSpeed: 7.2,
    maxSpeed: 15.0,
    gravity: 0.70,
    jumpVelocity: -12.4,
    groundY: 184,
    nightCycle: 0,
    nightOpacity: 0,
    milestoneFlash: 0,
    obstaclesDodged: 0,
    jumpBuffered: false,
    jumpBufferTimer: 0,

    dino: {
      x: 50,
      y: 140,
      width: 44,
      height: 44,
      standHeight: 44,
      duckHeight: 28,
      vy: 0,
      isJumping: false,
      isDucking: false,
      legStep: 0,
      legTimer: 0,
      blinkTimer: 0,
      eyeOpen: true
    },

    obstacles: [],
    nextObstacleDistance: 0,
    obstacleIdCounter: 1,

    clouds: [
      { x: 120, y: 35, speed: 0.8, width: 46 },
      { x: 340, y: 20, speed: 0.6, width: 54 },
      { x: 600, y: 45, speed: 0.9, width: 40 },
      { x: 800, y: 25, speed: 0.7, width: 50 }
    ],
    stars: [
      { x: 80, y: 20, radius: 1.5, alpha: 0.8 },
      { x: 220, y: 40, radius: 1.2, alpha: 0.9 },
      { x: 400, y: 15, radius: 2, alpha: 0.7 },
      { x: 620, y: 30, radius: 1.4, alpha: 0.85 },
      { x: 750, y: 18, radius: 1.8, alpha: 0.75 }
    ],
    groundPebbles: [
      { x: 40, size: 2 },
      { x: 140, size: 3 },
      { x: 260, size: 2 },
      { x: 380, size: 4 },
      { x: 520, size: 2 },
      { x: 680, size: 3 },
      { x: 820, size: 2 }
    ],

    keys: {
      jump: false,
      duck: false
    }
  });

  // Reference to gameState for handlers
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Start / Reset Game Engine
  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.score = 0;
    g.distance = 0;
    g.speed = g.baseSpeed;
    g.obstacles = [];
    g.nextObstacleDistance = 320;
    g.nightCycle = 0;
    g.nightOpacity = 0;
    g.milestoneFlash = 0;
    g.obstaclesDodged = 0;
    g.jumpBuffered = false;
    g.jumpBufferTimer = 0;

    g.dino.y = g.groundY - g.dino.standHeight;
    g.dino.height = g.dino.standHeight;
    g.dino.vy = 0;
    g.dino.isJumping = false;
    g.dino.isDucking = false;
    g.dino.legStep = 0;

    // Instant HUD reset
    if (scoreTextRef.current) scoreTextRef.current.textContent = '00000';
    if (distTextRef.current) distTextRef.current.textContent = '0 m';
    if (dodgedTextRef.current) dodgedTextRef.current.textContent = '0';

    setIsNewRecord(false);
    setGameState('playing');

    // Instant jump sound & action on start
    dinoSound.playJump();
    g.dino.vy = g.jumpVelocity;
    g.dino.isJumping = true;
    g.lastTime = performance.now();
  }, []);

  // Instant Jump Action (Zero latency)
  const jumpAction = useCallback(() => {
    const currentStatus = gameStateRef.current;
    const g = gameRef.current;

    if (currentStatus === 'idle' || currentStatus === 'gameover') {
      startGame();
      return;
    }

    if (currentStatus !== 'playing') return;

    if (!g.dino.isJumping) {
      dinoSound.playJump();
      g.dino.vy = g.jumpVelocity;
      g.dino.isJumping = true;
      g.jumpBuffered = false;
      if (g.dino.isDucking) {
        g.dino.isDucking = false;
        g.dino.height = g.dino.standHeight;
      }
    } else {
      // Buffer jump if near ground (within 40px)
      const distToGround = (g.groundY - g.dino.height) - g.dino.y;
      if (distToGround < 45 && g.dino.vy > 0) {
        g.jumpBuffered = true;
        g.jumpBufferTimer = 12; // 12 frames window
      }
    }
  }, [startGame]);

  // Instant Duck Action
  const duckAction = useCallback((isDucking: boolean) => {
    const currentStatus = gameStateRef.current;
    const g = gameRef.current;

    if (currentStatus !== 'playing') return;

    if (isDucking) {
      if (!g.dino.isDucking) {
        dinoSound.playDuck();
        g.dino.isDucking = true;
        g.dino.height = g.dino.duckHeight;
        // Fast drop when airborne
        if (g.dino.isJumping) {
          g.dino.vy += 6.5;
        }
      }
    } else {
      if (g.dino.isDucking) {
        g.dino.isDucking = false;
        g.dino.height = g.dino.standHeight;
        if (!g.dino.isJumping) {
          g.dino.y = g.groundY - g.dino.standHeight;
        }
      }
    }
  }, []);

  // End Game & Score Save
  const handleGameOver = useCallback(
    async (finalScore: number, finalDistance: number, dodged: number) => {
      dinoSound.playGameOver();
      setGameState('gameover');

      try {
        const { isPersonalBest, bestScore } = await saveDinoScore(
          finalScore,
          finalDistance,
          dodged
        );
        if (isPersonalBest) {
          setIsNewRecord(true);
          setHighScore(bestScore);
          if (recordTextRef.current) {
            recordTextRef.current.textContent = String(bestScore).padStart(5, '0');
          }
        }
      } catch (err) {
        console.warn('Error saving dino score:', err);
      }
    },
    [saveDinoScore]
  );

  // Stable input actions ref to avoid re-binding listeners
  const actionsRef = useRef({
    jump: jumpAction,
    duck: duckAction,
    start: startGame
  });
  actionsRef.current = {
    jump: jumpAction,
    duck: duckAction,
    start: startGame
  };

  // Keyboard Event Handlers attached ONCE with zero lag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        actionsRef.current.jump();
      } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        actionsRef.current.duck(true);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameStateRef.current === 'playing') setGameState('paused');
        else if (gameStateRef.current === 'paused') setGameState('playing');
      } else if (e.code === 'KeyR') {
        actionsRef.current.start();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        actionsRef.current.duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Animation Loop (Zero-render overhead)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      const g = gameRef.current;
      const dt = Math.min(32, time - (g.lastTime || time)) / 16.66; // Delta frame
      g.lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      g.groundY = height - 28;

      // Update logic only when playing
      if (gameStateRef.current === 'playing') {
        // Increment Score and Distance
        g.distance += (g.speed * 0.08) * dt;
        const currentScore = Math.floor(g.distance * 1.5);

        // Milestone beep every 100 points
        if (Math.floor(currentScore / 100) > Math.floor(g.score / 100) && currentScore > 0) {
          dinoSound.playScoreMilestone();
          g.milestoneFlash = 30;
        }

        g.score = currentScore;

        // Direct DOM update (ZERO React re-renders during gameplay!)
        if (scoreTextRef.current) {
          scoreTextRef.current.textContent = String(g.score).padStart(5, '0');
        }
        if (distTextRef.current) {
          distTextRef.current.textContent = `${Math.floor(g.distance)} m`;
        }

        // Speed increases smoothly
        if (g.speed < g.maxSpeed) {
          g.speed += 0.0012 * dt;
        }

        // Day / Night Cycle Logic (Every 700 points)
        const cycle = Math.floor(g.score / 700) % 2;
        if (cycle === 1 && g.nightOpacity < 1) {
          g.nightOpacity = Math.min(1, g.nightOpacity + 0.02 * dt);
        } else if (cycle === 0 && g.nightOpacity > 0) {
          g.nightOpacity = Math.max(0, g.nightOpacity - 0.02 * dt);
        }

        if (g.milestoneFlash > 0) {
          g.milestoneFlash -= dt;
        }

        // Jump buffer countdown
        if (g.jumpBuffered) {
          g.jumpBufferTimer -= dt;
          if (g.jumpBufferTimer <= 0) {
            g.jumpBuffered = false;
          }
        }

        // Dino Physics
        if (g.dino.isJumping) {
          g.dino.y += g.dino.vy * dt;
          g.dino.vy += g.gravity * dt;

          const targetGround = g.groundY - g.dino.height;
          if (g.dino.y >= targetGround) {
            g.dino.y = targetGround;
            g.dino.vy = 0;
            g.dino.isJumping = false;

            // Trigger buffered jump instantly
            if (g.jumpBuffered) {
              g.jumpBuffered = false;
              dinoSound.playJump();
              g.dino.vy = g.jumpVelocity;
              g.dino.isJumping = true;
            }
          }
        } else {
          g.dino.y = g.groundY - g.dino.height;
          // Leg running animation
          g.dino.legTimer += dt;
          if (g.dino.legTimer > 4.2) {
            g.dino.legStep = (g.dino.legStep + 1) % 2;
            g.dino.legTimer = 0;
          }
        }

        // Dino Eye Blink
        g.dino.blinkTimer += dt;
        if (g.dino.blinkTimer > 180) {
          g.dino.eyeOpen = false;
          if (g.dino.blinkTimer > 190) {
            g.dino.eyeOpen = true;
            g.dino.blinkTimer = 0;
          }
        }

        // Move Background Clouds
        g.clouds.forEach((cloud) => {
          cloud.x -= (cloud.speed * (g.speed / g.baseSpeed) * 0.7) * dt;
          if (cloud.x < -cloud.width) {
            cloud.x = width + Math.random() * 80;
            cloud.y = 15 + Math.random() * 35;
          }
        });

        // Move Ground Pebbles
        g.groundPebbles.forEach((pebble) => {
          pebble.x -= g.speed * dt;
          if (pebble.x < -20) {
            pebble.x = width + Math.random() * 50;
          }
        });

        // Obstacles Spawn Logic
        g.nextObstacleDistance -= g.speed * dt;
        if (g.nextObstacleDistance <= 0) {
          const rand = Math.random();
          let type: 'cactus_small' | 'cactus_large' | 'cactus_group' | 'bird' = 'cactus_small';

          if (g.score > 350 && rand < 0.35) {
            type = 'bird';
          } else if (rand < 0.35) {
            type = 'cactus_small';
          } else if (rand < 0.7) {
            type = 'cactus_large';
          } else {
            type = 'cactus_group';
          }

          let obsW = 20;
          let obsH = 36;
          let obsY = g.groundY - 36;

          if (type === 'cactus_small') {
            obsW = 18;
            obsH = 34;
            obsY = g.groundY - 34;
          } else if (type === 'cactus_large') {
            obsW = 24;
            obsH = 46;
            obsY = g.groundY - 46;
          } else if (type === 'cactus_group') {
            obsW = 48;
            obsH = 36;
            obsY = g.groundY - 36;
          } else if (type === 'bird') {
            obsW = 40;
            obsH = 28;
            const birdHeightVariant = Math.random();
            if (birdHeightVariant < 0.33) {
              obsY = g.groundY - 74; // High
            } else if (birdHeightVariant < 0.66) {
              obsY = g.groundY - 50; // Mid
            } else {
              obsY = g.groundY - 26; // Low
            }
          }

          g.obstacles.push({
            id: g.obstacleIdCounter++,
            type,
            x: width + 20,
            y: obsY,
            width: obsW,
            height: obsH,
            birdFrame: 0,
            birdTimer: 0,
            dodged: false
          });

          // Next obstacle interval
          const minGap = Math.max(160, 260 - (g.speed - g.baseSpeed) * 12);
          const maxGap = Math.max(300, 480 - (g.speed - g.baseSpeed) * 15);
          g.nextObstacleDistance = minGap + Math.random() * (maxGap - minGap);
        }

        // Move Obstacles & Check Collisions
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed * dt;

          if (obs.type === 'bird') {
            obs.birdTimer = (obs.birdTimer || 0) + dt;
            if (obs.birdTimer > 7) {
              obs.birdFrame = ((obs.birdFrame || 0) + 1) % 2;
              obs.birdTimer = 0;
            }
          }

          // Count dodged
          if (!obs.dodged && obs.x + obs.width < g.dino.x) {
            obs.dodged = true;
            g.obstaclesDodged += 1;
            if (dodgedTextRef.current) {
              dodgedTextRef.current.textContent = String(g.obstaclesDodged);
            }
          }

          // Hitbox check
          const dinoBox = {
            x: g.dino.x + 6,
            y: g.dino.y + (g.dino.isDucking ? 4 : 4),
            w: g.dino.width - 12,
            h: g.dino.height - 8
          };

          const obsBox = {
            x: obs.x + 4,
            y: obs.y + 4,
            w: obs.width - 8,
            h: obs.height - 8
          };

          const isColliding =
            dinoBox.x < obsBox.x + obsBox.w &&
            dinoBox.x + dinoBox.w > obsBox.x &&
            dinoBox.y < obsBox.y + obsBox.h &&
            dinoBox.y + dinoBox.h > obsBox.y;

          if (isColliding) {
            handleGameOver(g.score, Math.floor(g.distance), g.obstaclesDodged);
            break;
          }

          if (obs.x < -80) {
            g.obstacles.splice(i, 1);
          }
        }
      }

      // ================= DRAWING SECTION =================
      ctx.clearRect(0, 0, width, height);

      // 1. Background Fill & Day/Night Transition
      let dayBg = '#f7f7f7';
      let nightBg = '#1c1c1f';
      let dayColor = '#535353';
      let nightColor = '#e3e3e3';

      if (selectedTheme === 'theme') {
        dayBg = '#202124';
        nightBg = '#111215';
        dayColor = '#f59e0b';
        nightColor = '#fbbf24';
      } else if (selectedTheme === 'neon') {
        dayBg = '#0b0f19';
        nightBg = '#030712';
        dayColor = '#06b6d4';
        nightColor = '#ec4899';
      }

      ctx.fillStyle = dayBg;
      ctx.fillRect(0, 0, width, height);

      if (g.nightOpacity > 0) {
        ctx.fillStyle = nightBg;
        ctx.globalAlpha = g.nightOpacity;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
      }

      // Stars & Moon
      if (g.nightOpacity > 0.2) {
        ctx.save();
        ctx.globalAlpha = g.nightOpacity * 0.9;
        ctx.fillStyle = '#ffffff';
        g.stars.forEach((star) => {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        // Moon
        ctx.beginPath();
        ctx.arc(width - 90, 35, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width - 85, 32, 10, 0, Math.PI * 2);
        ctx.fillStyle = nightBg;
        ctx.fill();
        ctx.restore();
      }

      // 2. Clouds
      ctx.fillStyle = g.nightOpacity > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(120,120,120,0.3)';
      g.clouds.forEach((cloud) => {
        const cx = Math.floor(cloud.x);
        const cy = Math.floor(cloud.y);
        ctx.fillRect(cx, cy + 4, cloud.width, 8);
        ctx.fillRect(cx + 8, cy, cloud.width - 16, 12);
        ctx.fillRect(cx + 14, cy - 4, cloud.width - 28, 16);
      });

      const activeColor = g.nightOpacity > 0.5 ? nightColor : dayColor;
      ctx.fillStyle = activeColor;
      ctx.strokeStyle = activeColor;

      // 3. Ground Line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, g.groundY);
      ctx.lineTo(width, g.groundY);
      ctx.stroke();

      // Ground Pebbles
      g.groundPebbles.forEach((pebble) => {
        const px = Math.floor(pebble.x);
        ctx.fillRect(px, g.groundY + 4, pebble.size * 2, 2);
        ctx.fillRect(px + 6, g.groundY + 8, pebble.size, 2);
      });

      // 4. Obstacles
      g.obstacles.forEach((obs) => {
        const ox = Math.floor(obs.x);
        const oy = Math.floor(obs.y);

        if (obs.type === 'cactus_small') {
          ctx.fillRect(ox + 6, oy, 6, obs.height);
          ctx.fillRect(ox, oy + 10, 6, 14);
          ctx.fillRect(ox, oy + 10, 6, 4);
          ctx.fillRect(ox + 12, oy + 6, 6, 14);
          ctx.fillRect(ox + 12, oy + 6, 6, 4);
        } else if (obs.type === 'cactus_large') {
          ctx.fillRect(ox + 8, oy, 8, obs.height);
          ctx.fillRect(ox, oy + 12, 8, 18);
          ctx.fillRect(ox + 16, oy + 8, 8, 18);
        } else if (obs.type === 'cactus_group') {
          ctx.fillRect(ox + 4, oy + 4, 6, obs.height - 4);
          ctx.fillRect(ox + 18, oy, 7, obs.height);
          ctx.fillRect(ox + 32, oy + 6, 6, obs.height - 6);
          ctx.fillRect(ox + 12, oy + 12, 6, 10);
          ctx.fillRect(ox + 25, oy + 14, 7, 10);
        } else if (obs.type === 'bird') {
          ctx.fillRect(ox + 8, oy + 8, 22, 10);
          ctx.fillRect(ox, oy + 4, 10, 8);
          ctx.fillRect(ox + 28, oy + 10, 8, 4);

          if (obs.birdFrame === 0) {
            ctx.fillRect(ox + 14, oy, 8, 8);
            ctx.fillRect(ox + 18, oy - 6, 6, 6);
          } else {
            ctx.fillRect(ox + 14, oy + 16, 8, 8);
            ctx.fillRect(ox + 18, oy + 22, 6, 6);
          }
        }
      });

      // 5. Dino Sprite
      const d = g.dino;
      const dx = Math.floor(d.x);
      const dy = Math.floor(d.y);
      ctx.save();

      if (d.isDucking) {
        ctx.fillRect(dx, dy + 10, 36, 14);
        ctx.fillRect(dx + 36, dy + 6, 18, 12);
        ctx.fillRect(dx + 44, dy + 14, 10, 4);
        ctx.fillRect(dx - 4, dy + 14, 6, 6);

        if (gameStateRef.current === 'gameover') {
          ctx.fillStyle = g.nightOpacity > 0.5 ? '#111' : '#fff';
          ctx.fillText('X', dx + 42, dy + 12);
        } else if (d.eyeOpen) {
          ctx.fillStyle = g.nightOpacity > 0.5 ? '#111' : '#fff';
          ctx.fillRect(dx + 42, dy + 8, 3, 3);
        }

        ctx.fillStyle = activeColor;
        if (d.legStep === 0) {
          ctx.fillRect(dx + 10, dy + 24, 4, 4);
          ctx.fillRect(dx + 24, dy + 24, 8, 4);
        } else {
          ctx.fillRect(dx + 10, dy + 24, 8, 4);
          ctx.fillRect(dx + 24, dy + 24, 4, 4);
        }
      } else {
        ctx.fillRect(dx + 12, dy + 14, 18, 18);
        ctx.fillRect(dx + 6, dy + 18, 8, 12);
        ctx.fillRect(dx, dy + 22, 8, 8);

        ctx.fillRect(dx + 20, dy + 6, 12, 14);
        ctx.fillRect(dx + 24, dy, 18, 14);
        ctx.fillRect(dx + 34, dy + 8, 8, 6);

        ctx.fillRect(dx + 30, dy + 18, 6, 3);
        ctx.fillRect(dx + 34, dy + 18, 2, 6);

        if (gameStateRef.current === 'gameover') {
          ctx.fillStyle = g.nightOpacity > 0.5 ? '#111' : '#fff';
          ctx.fillRect(dx + 30, dy + 3, 4, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(dx + 31, dy + 4, 2, 2);
        } else if (d.eyeOpen) {
          ctx.fillStyle = g.nightOpacity > 0.5 ? '#111' : '#fff';
          ctx.fillRect(dx + 30, dy + 3, 4, 4);
        }

        ctx.fillStyle = activeColor;
        if (d.isJumping) {
          ctx.fillRect(dx + 14, dy + 32, 4, 8);
          ctx.fillRect(dx + 22, dy + 32, 4, 6);
        } else if (d.legStep === 0) {
          ctx.fillRect(dx + 14, dy + 32, 4, 12);
          ctx.fillRect(dx + 14, dy + 42, 6, 2);
          ctx.fillRect(dx + 22, dy + 32, 4, 6);
        } else {
          ctx.fillRect(dx + 14, dy + 32, 4, 6);
          ctx.fillRect(dx + 22, dy + 32, 4, 12);
          ctx.fillRect(dx + 22, dy + 42, 6, 2);
        }
      }
      ctx.restore();

      // 6. Retro Score in Canvas Header
      ctx.save();
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillStyle = activeColor;

      const formattedScore = String(g.score).padStart(5, '0');
      const formattedHigh = String(Math.max(g.score, highScore)).padStart(5, '0');

      const showScore = g.milestoneFlash <= 0 || Math.floor(g.milestoneFlash / 4) % 2 === 0;
      if (showScore) {
        ctx.fillText(`HI ${formattedHigh}  ${formattedScore}`, width - 180, 28);
      } else {
        ctx.fillText(`HI ${formattedHigh}`, width - 180, 28);
      }
      ctx.restore();

      // 7. Idle / Start Overlay
      if (gameStateRef.current === 'idle') {
        ctx.save();
        ctx.fillStyle = activeColor;
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE YOKI BOSHQATDAN BOSING (PRESS SPACE TO PLAY)', width / 2, height / 2 - 10);
        ctx.font = '12px sans-serif';
        ctx.fillText('Sakrash: [Space] yoki [↑]  |  Egilish: [↓] yoki [S]', width / 2, height / 2 + 16);
        ctx.restore();
      }

      // 8. Game Over Overlay
      if (gameStateRef.current === 'gameover') {
        ctx.save();
        ctx.fillStyle = activeColor;
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('G A M E   O V E R', width / 2, height / 2 - 16);

        ctx.beginPath();
        ctx.arc(width / 2, height / 2 + 18, 16, 0, Math.PI * 2);
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '12px "Courier New", monospace';
        ctx.fillText('↻ Qayta o\'ynash uchun SPACE bosing', width / 2, height / 2 + 52);
        ctx.restore();
      }

      g.animationFrameId = requestAnimationFrame(render);
    };

    gameRef.current.animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (gameRef.current.animationFrameId) {
        cancelAnimationFrame(gameRef.current.animationFrameId);
      }
    };
  }, [highScore, selectedTheme, handleGameOver]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-xs font-black uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4" />
            <span>Retro Chrome Dino Runner O'yini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
            T-Rex Dino Runner & Reyting
          </h2>
          <p className="text-xs text-[var(--sub-color)] max-w-xl">
            To'siqlar va qushlardan sakrab o'ting, rekord o'rnating va butun O'zbekiston bo'ylab Dino masterlar reytingida 1-o'ringa chiqing!
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-2xl border cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-[var(--sub-alt)] border-[var(--sub-color)]/20 text-[var(--text-color)] hover:border-[var(--main-color)]'
            }`}
            title="Ovozni yoqish/o'chirish"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[var(--main-color)]" />}
            <span className="hidden sm:inline">{isMuted ? 'Ovoz O\'chirilgan' : 'Ovoz Yoqiq'}</span>
          </button>

          <button
            onClick={onGoToLeaderboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs shadow-md cursor-pointer hover:opacity-95"
          >
            <Trophy className="w-4 h-4" />
            <span>Dino Reytingi</span>
          </button>
        </div>
      </div>

      {/* Main Game Stage + Live Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive Game Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {/* Game Stats HUD Bar (Zero-lag DOM text updating) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)] block">Joriy Ball</span>
              <span ref={scoreTextRef} className="text-xl sm:text-2xl font-black text-[var(--text-color)] font-mono">
                00000
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)] block flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Shaxsiy Rekord</span>
              </span>
              <span ref={recordTextRef} className="text-xl sm:text-2xl font-black text-amber-500 font-mono">
                {String(highScore).padStart(5, '0')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)] block">Masofa</span>
              <span ref={distTextRef} className="text-xl sm:text-2xl font-black text-[var(--main-color)] font-mono">
                0 m
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--sub-color)] block">O'tilgan To'siqlar</span>
              <span ref={dodgedTextRef} className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                0
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[var(--sub-alt)] shadow-md bg-[var(--card-bg)]">
            <canvas
              ref={canvasRef}
              width={800}
              height={220}
              onPointerDown={(e) => {
                e.preventDefault();
                jumpAction();
              }}
              className="w-full h-auto cursor-pointer block select-none touch-none"
            />

            {/* Instant Touch Buttons (Zero 300ms latency on mobile/tablets) */}
            <div className="p-3 bg-[var(--card-bg)] border-t border-[var(--sub-alt)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    jumpAction();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--main-color)] text-white font-black text-sm uppercase tracking-wider shadow-md select-none touch-manipulation cursor-pointer hover:opacity-90 active:opacity-75"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>SAKRASH (SPACE)</span>
                </button>

                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    duckAction(true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    duckAction(false);
                  }}
                  onPointerLeave={() => duckAction(false)}
                  onPointerCancel={() => duckAction(false)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--sub-alt)] text-[var(--text-color)] font-black text-sm uppercase tracking-wider border border-[var(--sub-color)]/20 select-none touch-manipulation cursor-pointer hover:border-[var(--main-color)]"
                >
                  <ArrowDown className="w-4 h-4 text-[var(--main-color)]" />
                  <span>EGILISH (↓ DUCK)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {gameState === 'playing' ? (
                  <button
                    onClick={() => setGameState('paused')}
                    className="p-3 rounded-2xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:text-[var(--main-color)]"
                    title="To'xtatish (Pause)"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : gameState === 'paused' ? (
                  <button
                    onClick={() => setGameState('playing')}
                    className="p-3 rounded-2xl bg-[var(--main-color)] text-white"
                    title="Davom ettirish"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  onClick={startGame}
                  className="p-3 rounded-2xl bg-[var(--sub-alt)] text-[var(--text-color)] hover:text-[var(--main-color)]"
                  title="Qayta boshlash"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tips & Instructions */}
          <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--sub-color)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-color)]">Tugmalar:</span>
              <kbd className="px-2 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--text-color)] font-mono font-bold">Space</kbd> /
              <kbd className="px-2 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--text-color)] font-mono font-bold">↑</kbd> Sakrash,
              <kbd className="px-2 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--text-color)] font-mono font-bold">↓</kbd> Qushlar tagidan egilish
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Har 700 ball da tun/kun almashadi!</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Real-time Live Dino Leaderboard (Top 10) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm text-[var(--text-color)]">Top Dino Masterlar</h3>
              </div>
              <button
                onClick={onGoToLeaderboard}
                className="text-[11px] font-bold text-[var(--main-color)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>To'liq Reyting</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {loadingTop ? (
              <div className="py-8 text-center text-xs text-[var(--sub-color)]">
                Reyting yuklanmoqda...
              </div>
            ) : topDinoPlayers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--sub-color)] space-y-1">
                <p>Hozircha rekordlar yo'q.</p>
                <p className="text-[10px]">Birinchi bo'lib rekord o'rnating!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {topDinoPlayers.map((player, idx) => {
                  const isCurrent = player.uid === user?.uid;
                  return (
                    <div
                      key={player.uid || idx}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                        isCurrent
                          ? 'bg-[var(--main-color)]/10 border-[var(--main-color)]/50'
                          : 'bg-[var(--sub-alt)] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-amber-500 text-black shadow-sm'
                              : idx === 1
                              ? 'bg-slate-300 text-black'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-[var(--sub-color)]/20 text-[var(--sub-color)]'
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <img
                          src={player.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${player.uid}`}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--sub-color)]/20"
                        />

                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-[var(--text-color)] truncate">
                            {player.displayName || player.username}
                          </h4>
                          <span className="text-[10px] text-[var(--sub-color)]">
                            {player.distance || 0} m masofa
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-amber-500 font-mono">
                          {player.score || 0}
                        </span>
                        <span className="block text-[9px] uppercase font-bold text-[var(--sub-color)]">ball</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Player Status Bar */}
            <div className="p-3 rounded-2xl bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--main-color)]" />
                <span className="font-bold text-[var(--text-color)]">
                  {user ? (profile?.displayName || 'Siz') : 'Mehmon'}
                </span>
              </div>
              <div className="font-mono font-black text-amber-500">
                Rekord: {highScore}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
