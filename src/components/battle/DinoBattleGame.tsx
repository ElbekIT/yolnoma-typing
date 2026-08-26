import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, Volume2, VolumeX, RotateCcw, Trophy, Skull, Crown, Sparkles, Zap } from 'lucide-react';
import { dinoSound } from '../dino/dinoSound';
import { DinoBattlePlayerState } from '../../types';
import { rtdb } from '../../config/firebase';
import { ref, update, onValue } from 'firebase/database';

interface DinoBattleGameProps {
  roomId?: string;
  isHost: boolean;
  isBotMatch: boolean;
  myInfo: DinoBattlePlayerState;
  opponentInfo: DinoBattlePlayerState;
  onFinish: (winnerId: string, myFinalScore: number, oppFinalScore: number) => void;
  onExit: () => void;
}

export const DinoBattleGame: React.FC<DinoBattleGameProps> = ({
  roomId,
  isHost,
  isBotMatch,
  myInfo,
  opponentInfo,
  onFinish,
  onExit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound Mute State
  const [isMuted, setIsMuted] = useState(false);

  // Local React mirror states for UI
  const [myLiveState, setMyLiveState] = useState<DinoBattlePlayerState>(myInfo);
  const [oppLiveState, setOppLiveState] = useState<DinoBattlePlayerState>(opponentInfo);

  // Refs for zero-latency game loop
  const myLiveRef = useRef<DinoBattlePlayerState>(myInfo);
  const oppLiveRef = useRef<DinoBattlePlayerState>(opponentInfo);
  const isFinishedRef = useRef(false);

  // Game Engine Internal Variables
  const gameRef = useRef<{
    animationFrameId: number | null;
    lastTime: number;
    speed: number;
    baseSpeed: number;
    maxSpeed: number;
    gravity: number;
    jumpVelocity: number;
    groundY: number;
    nightOpacity: number;
    obstaclesDodged: number;

    // My Dino
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
      isAlive: boolean;
      legStep: number;
      legTimer: number;
    };

    // Opponent Ghost Dino
    oppDino: {
      x: number;
      y: number;
      vy: number;
      isJumping: boolean;
      isDucking: boolean;
      isAlive: boolean;
      legStep: number;
      crashDistance: number;
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
    nextObstacleDist: number;
    obstacleIdCounter: number;

    // Bot intelligence
    botReactionTimer: number;
    botErrorChance: number;

    // Background
    clouds: Array<{ x: number; y: number; speed: number; width: number }>;
    groundPebbles: Array<{ x: number; size: number }>;
    syncTimer: number;
  }>({
    animationFrameId: null,
    lastTime: 0,
    speed: 7.2,
    baseSpeed: 7.2,
    maxSpeed: 15.0,
    gravity: 0.70,
    jumpVelocity: -12.4,
    groundY: 190,
    nightOpacity: 0,
    obstaclesDodged: 0,

    dino: {
      x: 60,
      y: 146,
      width: 44,
      height: 44,
      standHeight: 44,
      duckHeight: 28,
      vy: 0,
      isJumping: false,
      isDucking: false,
      isAlive: true,
      legStep: 0,
      legTimer: 0
    },

    oppDino: {
      x: 130, // Ghost dino rendered slightly ahead or side-by-side
      y: 146,
      vy: 0,
      isJumping: false,
      isDucking: false,
      isAlive: true,
      legStep: 0,
      crashDistance: 0
    },

    obstacles: [],
    nextObstacleDist: 300,
    obstacleIdCounter: 1,

    botReactionTimer: 0,
    botErrorChance: 0.05, // 5% chance bot makes mistake for natural difficulty

    clouds: [
      { x: 100, y: 30, speed: 0.7, width: 46 },
      { x: 320, y: 15, speed: 0.5, width: 54 },
      { x: 580, y: 40, speed: 0.8, width: 42 },
      { x: 800, y: 22, speed: 0.6, width: 48 }
    ],
    groundPebbles: [
      { x: 30, size: 2 },
      { x: 120, size: 3 },
      { x: 250, size: 2 },
      { x: 390, size: 4 },
      { x: 540, size: 2 },
      { x: 700, size: 3 },
      { x: 860, size: 2 }
    ],
    syncTimer: 0
  });

  // Sound toggle
  const handleToggleMute = () => {
    const muted = dinoSound.toggleMute();
    setIsMuted(muted);
  };

  // Jump Action
  const jumpAction = useCallback(() => {
    const g = gameRef.current;
    if (!g.dino.isAlive || isFinishedRef.current) return;

    if (!g.dino.isJumping) {
      dinoSound.playJump();
      g.dino.vy = g.jumpVelocity;
      g.dino.isJumping = true;
      if (g.dino.isDucking) {
        g.dino.isDucking = false;
        g.dino.height = g.dino.standHeight;
      }
    }
  }, []);

  // Duck Action
  const duckAction = useCallback((isDucking: boolean) => {
    const g = gameRef.current;
    if (!g.dino.isAlive || isFinishedRef.current) return;

    if (isDucking) {
      if (!g.dino.isDucking) {
        dinoSound.playDuck();
        g.dino.isDucking = true;
        g.dino.height = g.dino.duckHeight;
        if (g.dino.isJumping) {
          g.dino.vy += 6.5; // Fast-fall
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

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jumpAction();
      } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        duckAction(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        duckAction(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jumpAction, duckAction]);

  // Real-time Firebase Room Sync for Opponent
  useEffect(() => {
    if (!roomId || isBotMatch) return;

    const oppRole = isHost ? 'guest' : 'host';
    const oppRef = ref(rtdb, `battles/rooms/${roomId}/${oppRole}`);

    const unsubscribe = onValue(oppRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const oppData: DinoBattlePlayerState = {
          ...oppLiveRef.current,
          score: val.score || 0,
          distance: val.distance || 0,
          obstaclesDodged: val.obstaclesDodged || 0,
          isAlive: val.isAlive !== undefined ? val.isAlive : true,
          dinoY: val.dinoY,
          isJumping: val.isJumping,
          isDucking: val.isDucking
        };

        oppLiveRef.current = oppData;
        setOppLiveState(oppData);

        const g = gameRef.current;
        g.oppDino.isAlive = oppData.isAlive;
        g.oppDino.isJumping = !!oppData.isJumping;
        g.oppDino.isDucking = !!oppData.isDucking;
        if (typeof oppData.dinoY === 'number') {
          g.oppDino.y = oppData.dinoY;
        }

        // Check if both crashed
        if (!g.dino.isAlive && !oppData.isAlive && !isFinishedRef.current) {
          isFinishedRef.current = true;
          const winner =
            myLiveRef.current.score >= oppData.score
              ? myLiveRef.current.id
              : oppData.id;
          onFinish(winner, myLiveRef.current.score, oppData.score);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, isHost, isBotMatch, onFinish]);

  // Main Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const g = gameRef.current;
    g.lastTime = performance.now();
    dinoSound.playJump();

    const render = (time: number) => {
      if (!isRunning) return;

      const dt = Math.min(32, time - (g.lastTime || time)) / 16.66;
      g.lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      g.groundY = height - 28;

      // 1. UPDATE MY DINO & GAME IF ALIVE
      if (g.dino.isAlive && !isFinishedRef.current) {
        myLiveRef.current.distance += (g.speed * 0.08) * dt;
        myLiveRef.current.score = Math.floor(myLiveRef.current.distance * 1.5);

        // Speed curve
        if (g.speed < g.maxSpeed) {
          g.speed += 0.0012 * dt;
        }

        // Day / Night transition
        const cycle = Math.floor(myLiveRef.current.score / 700) % 2;
        if (cycle === 1 && g.nightOpacity < 1) {
          g.nightOpacity = Math.min(1, g.nightOpacity + 0.02 * dt);
        } else if (cycle === 0 && g.nightOpacity > 0) {
          g.nightOpacity = Math.max(0, g.nightOpacity - 0.02 * dt);
        }

        // Dino Jump Physics
        if (g.dino.isJumping) {
          g.dino.y += g.dino.vy * dt;
          g.dino.vy += g.gravity * dt;

          const targetGround = g.groundY - g.dino.height;
          if (g.dino.y >= targetGround) {
            g.dino.y = targetGround;
            g.dino.vy = 0;
            g.dino.isJumping = false;
          }
        } else {
          g.dino.y = g.groundY - g.dino.height;
          g.dino.legTimer += dt;
          if (g.dino.legTimer > 4.2) {
            g.dino.legStep = (g.dino.legStep + 1) % 2;
            g.dino.legTimer = 0;
          }
        }

        // Background moving
        g.clouds.forEach((cloud) => {
          cloud.x -= (cloud.speed * (g.speed / g.baseSpeed) * 0.7) * dt;
          if (cloud.x < -cloud.width) {
            cloud.x = width + Math.random() * 80;
            cloud.y = 15 + Math.random() * 35;
          }
        });

        g.groundPebbles.forEach((pebble) => {
          pebble.x -= g.speed * dt;
          if (pebble.x < -20) {
            pebble.x = width + Math.random() * 50;
          }
        });

        // Obstacles Spawn
        g.nextObstacleDist -= g.speed * dt;
        if (g.nextObstacleDist <= 0) {
          const rand = Math.random();
          let type: 'cactus_small' | 'cactus_large' | 'cactus_group' | 'bird' = 'cactus_small';

          if (myLiveRef.current.score > 350 && rand < 0.35) {
            type = 'bird';
          } else if (rand < 0.35) {
            type = 'cactus_small';
          } else if (rand < 0.7) {
            type = 'cactus_large';
          } else {
            type = 'cactus_group';
          }

          let obsW = 18;
          let obsH = 34;
          let obsY = g.groundY - 34;

          if (type === 'cactus_large') {
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
            const bVariant = Math.random();
            obsY = bVariant < 0.33 ? g.groundY - 74 : bVariant < 0.66 ? g.groundY - 50 : g.groundY - 26;
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

          const minGap = Math.max(160, 260 - (g.speed - g.baseSpeed) * 12);
          const maxGap = Math.max(300, 480 - (g.speed - g.baseSpeed) * 15);
          g.nextObstacleDist = minGap + Math.random() * (maxGap - minGap);
        }

        // Move Obstacles & Collision Check
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

          if (!obs.dodged && obs.x + obs.width < g.dino.x) {
            obs.dodged = true;
            g.obstaclesDodged += 1;
            myLiveRef.current.obstaclesDodged = g.obstaclesDodged;
          }

          // Hitbox
          const dinoBox = {
            x: g.dino.x + 6,
            y: g.dino.y + 4,
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
            // MY DINO CRASHED!
            dinoSound.playGameOver();
            g.dino.isAlive = false;
            myLiveRef.current.isAlive = false;
            setMyLiveState({ ...myLiveRef.current });

            // Sync to RTDB
            if (roomId && !isBotMatch) {
              const myRole = isHost ? 'host' : 'guest';
              update(ref(rtdb, `battles/rooms/${roomId}/${myRole}`), {
                isAlive: false,
                score: myLiveRef.current.score,
                distance: myLiveRef.current.distance,
                obstaclesDodged: myLiveRef.current.obstaclesDodged
              }).catch(() => {});
            }

            // If in bot match, resolve match promptly
            if (isBotMatch && !isFinishedRef.current) {
              setTimeout(() => {
                if (!isFinishedRef.current) {
                  isFinishedRef.current = true;
                  const winner =
                    oppLiveRef.current.isAlive || oppLiveRef.current.score > myLiveRef.current.score
                      ? oppLiveRef.current.id
                      : myLiveRef.current.id;
                  onFinish(winner, myLiveRef.current.score, oppLiveRef.current.score);
                }
              }, 700);
            } else if (!oppLiveRef.current.isAlive && !isFinishedRef.current) {
              // If opponent is already dead, end match immediately!
              isFinishedRef.current = true;
              const winner =
                myLiveRef.current.score >= oppLiveRef.current.score
                  ? myLiveRef.current.id
                  : oppLiveRef.current.id;
              onFinish(winner, myLiveRef.current.score, oppLiveRef.current.score);
            } else if (!isFinishedRef.current) {
              // Live match: if opponent is alive, set failsafe timeout so it never hangs
              setTimeout(() => {
                if (!isFinishedRef.current) {
                  isFinishedRef.current = true;
                  const winner =
                    oppLiveRef.current.score >= myLiveRef.current.score
                      ? oppLiveRef.current.id
                      : myLiveRef.current.id;
                  onFinish(winner, myLiveRef.current.score, oppLiveRef.current.score);
                }
              }, 2500);
            }
            break;
          }

          if (obs.x < -80) {
            g.obstacles.splice(i, 1);
          }
        }
      }

      // 2. BOT LOGIC (If Bot match)
      if (isBotMatch && oppLiveRef.current.isAlive) {
        oppLiveRef.current.distance += (g.speed * 0.08) * dt;
        oppLiveRef.current.score = Math.floor(oppLiveRef.current.distance * 1.5);

        // Bot AI: Check nearest obstacle ahead
        const nextObs = g.obstacles.find((o) => o.x > g.oppDino.x && o.x < g.oppDino.x + 160);
        if (nextObs) {
          if (nextObs.type === 'bird' && nextObs.y > g.groundY - 55) {
            // Duck under high/mid bird
            g.oppDino.isDucking = true;
          } else if (!g.oppDino.isJumping) {
            // Jump over cactus or low bird
            g.oppDino.isJumping = true;
            g.oppDino.vy = g.jumpVelocity;
          }
        } else {
          g.oppDino.isDucking = false;
        }

        // Random bot crash risk after 350 score
        if (oppLiveRef.current.score > 350 && Math.random() < 0.0009 * dt) {
          oppLiveRef.current.isAlive = false;
          g.oppDino.isAlive = false;
          setOppLiveState({ ...oppLiveRef.current });

          if (!g.dino.isAlive && !isFinishedRef.current) {
            isFinishedRef.current = true;
            const winner =
              myLiveRef.current.score >= oppLiveRef.current.score
                ? myLiveRef.current.id
                : oppLiveRef.current.id;
            onFinish(winner, myLiveRef.current.score, oppLiveRef.current.score);
          } else if (g.dino.isAlive && !isFinishedRef.current) {
            // Player is alive and bot crashed! Player automatically wins after a short victory celebration
            setTimeout(() => {
              if (!isFinishedRef.current) {
                isFinishedRef.current = true;
                onFinish(myLiveRef.current.id, myLiveRef.current.score, oppLiveRef.current.score);
              }
            }, 1800);
          }
        }
      }

      // Opponent Jump Physics
      if (g.oppDino.isJumping) {
        g.oppDino.y += g.oppDino.vy * dt;
        g.oppDino.vy += g.gravity * dt;
        const targetGround = g.groundY - 44;
        if (g.oppDino.y >= targetGround) {
          g.oppDino.y = targetGround;
          g.oppDino.vy = 0;
          g.oppDino.isJumping = false;
        }
      } else {
        g.oppDino.y = g.groundY - (g.oppDino.isDucking ? 28 : 44);
      }

      // Periodically sync to React state & Firebase RTDB (every 6 frames / 100ms)
      g.syncTimer += dt;
      if (g.syncTimer > 6) {
        g.syncTimer = 0;
        setMyLiveState({ ...myLiveRef.current });
        setOppLiveState({ ...oppLiveRef.current });

        if (roomId && !isBotMatch && g.dino.isAlive) {
          const myRole = isHost ? 'host' : 'guest';
          update(ref(rtdb, `battles/rooms/${roomId}/${myRole}`), {
            score: myLiveRef.current.score,
            distance: myLiveRef.current.distance,
            obstaclesDodged: myLiveRef.current.obstaclesDodged,
            dinoY: g.dino.y,
            isJumping: g.dino.isJumping,
            isDucking: g.dino.isDucking,
            isAlive: g.dino.isAlive
          }).catch(() => {});
        }
      }

      // ================= DRAWING SECTION =================
      ctx.clearRect(0, 0, width, height);

      // 1. Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Night overlay
      if (g.nightOpacity > 0) {
        ctx.fillStyle = '#030712';
        ctx.globalAlpha = g.nightOpacity * 0.8;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
      }

      // Clouds
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      g.clouds.forEach((c) => {
        ctx.fillRect(Math.floor(c.x), Math.floor(c.y) + 4, c.width, 8);
        ctx.fillRect(Math.floor(c.x) + 8, Math.floor(c.y), c.width - 16, 12);
      });

      // Ground Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, g.groundY);
      ctx.lineTo(width, g.groundY);
      ctx.stroke();

      // Ground Pebbles
      ctx.fillStyle = '#0284c7';
      g.groundPebbles.forEach((p) => {
        ctx.fillRect(Math.floor(p.x), g.groundY + 4, p.size * 2, 2);
      });

      // 2. Obstacles
      ctx.fillStyle = '#38bdf8';
      g.obstacles.forEach((obs) => {
        const ox = Math.floor(obs.x);
        const oy = Math.floor(obs.y);

        if (obs.type === 'cactus_small' || obs.type === 'cactus_large' || obs.type === 'cactus_group') {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(ox + 6, oy, obs.width - 12, obs.height);
          ctx.fillRect(ox, oy + 8, obs.width, 8);
        } else if (obs.type === 'bird') {
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(ox + 6, oy + 6, 20, 8);
          if (obs.birdFrame === 0) {
            ctx.fillRect(ox + 12, oy, 8, 6);
          } else {
            ctx.fillRect(ox + 12, oy + 12, 8, 6);
          }
        }
      });

      // 3. DRAW OPPONENT GHOST DINO (Semi-transparent / Amber Hologram)
      if (oppLiveRef.current.isAlive) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#f59e0b'; // Amber Ghost

        const ox = Math.floor(g.oppDino.x);
        const oy = Math.floor(g.oppDino.y);

        // Name tag above ghost
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(oppLiveRef.current.name, ox + 22, oy - 10);

        if (g.oppDino.isDucking) {
          ctx.fillRect(ox, oy + 10, 36, 14);
          ctx.fillRect(ox + 36, oy + 6, 18, 12);
        } else {
          ctx.fillRect(ox + 12, oy + 14, 18, 18);
          ctx.fillRect(ox + 20, oy + 6, 12, 14);
          ctx.fillRect(ox + 24, oy, 18, 14);
          ctx.fillRect(ox + 14, oy + 32, 4, 12);
          ctx.fillRect(ox + 22, oy + 32, 4, 12);
        }
        ctx.restore();
      } else {
        // Opponent Crash Marker
        ctx.save();
        ctx.font = 'bold 11px font-mono';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText(`💥 ${oppLiveRef.current.name} Yiqildi!`, width / 2, 40);
        ctx.restore();
      }

      // 4. DRAW MY DINO (Full Vibrant Cyan / Hero)
      ctx.save();
      const dx = Math.floor(g.dino.x);
      const dy = Math.floor(g.dino.y);

      if (!g.dino.isAlive) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dx + 12, dy + 14, 18, 18);
        ctx.fillRect(dx + 24, dy, 18, 14);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('X', dx + 30, dy + 12);
      } else {
        ctx.fillStyle = '#06b6d4'; // Cyan Hero Dino
        // Tag above my dino
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('SIZ', dx + 22, dy - 10);

        ctx.fillStyle = '#06b6d4';
        if (g.dino.isDucking) {
          ctx.fillRect(dx, dy + 10, 36, 14);
          ctx.fillRect(dx + 36, dy + 6, 18, 12);
          ctx.fillRect(dx + 44, dy + 14, 10, 4);
          ctx.fillRect(dx - 4, dy + 14, 6, 6);
        } else {
          ctx.fillRect(dx + 12, dy + 14, 18, 18);
          ctx.fillRect(dx + 6, dy + 18, 8, 12);
          ctx.fillRect(dx + 20, dy + 6, 12, 14);
          ctx.fillRect(dx + 24, dy, 18, 14);
          ctx.fillRect(dx + 34, dy + 8, 8, 6);

          if (g.dino.isJumping) {
            ctx.fillRect(dx + 14, dy + 32, 4, 8);
            ctx.fillRect(dx + 22, dy + 32, 4, 6);
          } else if (g.dino.legStep === 0) {
            ctx.fillRect(dx + 14, dy + 32, 4, 12);
            ctx.fillRect(dx + 22, dy + 32, 4, 6);
          } else {
            ctx.fillRect(dx + 14, dy + 32, 4, 6);
            ctx.fillRect(dx + 22, dy + 32, 4, 12);
          }
        }
      }
      ctx.restore();

      g.animationFrameId = requestAnimationFrame(render);
    };

    gameRef.current.animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (gameRef.current.animationFrameId) {
        cancelAnimationFrame(gameRef.current.animationFrameId);
      }
    };
  }, [roomId, isHost, isBotMatch, onFinish]);

  return (
    <div className="space-y-4">
      {/* Top HUD Telemetry Comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* My Card */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border-2 border-cyan-500/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={myLiveState.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=me`}
              alt="me"
              className="w-8 h-8 rounded-full border border-cyan-400"
            />
            <div>
              <span className="text-[9px] uppercase font-mono text-cyan-400 block font-bold">Siz (Hero)</span>
              <h4 className="text-xs font-black text-white truncate">{myLiveState.name}</h4>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-lg font-black text-cyan-300">{myLiveState.score}</span>
            <span className="block text-[9px] text-slate-400 uppercase font-bold">{Math.floor(myLiveState.distance)} m</span>
          </div>
        </div>

        {/* Opponent Card */}
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={oppLiveState.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=opp`}
              alt="opp"
              className="w-8 h-8 rounded-full border border-amber-400"
            />
            <div>
              <span className="text-[9px] uppercase font-mono text-amber-400 block font-bold">Raqib</span>
              <h4 className="text-xs font-black text-white truncate">{oppLiveState.name}</h4>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-lg font-black text-amber-400">{oppLiveState.score}</span>
            <span className="block text-[9px] text-slate-400 uppercase font-bold">
              {oppLiveState.isAlive ? `${Math.floor(oppLiveState.distance)} m` : '💥 Yiqildi'}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-950">
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

        {/* Touch Action Controls */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                jumpAction();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer touch-manipulation"
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
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-black text-sm uppercase tracking-wider shadow active:scale-95 cursor-pointer touch-manipulation"
            >
              <ArrowDown className="w-4 h-4 text-cyan-400" />
              <span>EGILISH (↓ DUCK)</span>
            </button>
          </div>

          <button
            onClick={handleToggleMute}
            className="p-3 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
            title="Ovoz"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
