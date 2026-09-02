import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DinoGameViewProps {
  onBackToTyping: () => void;
}

export const DinoGameView: React.FC<DinoGameViewProps> = ({ onBackToTyping }) => {
  const { profile, saveDinoScore } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(profile?.dinoHighScore || 0);

  const gameState = useRef({
    dinoY: 150,
    dinoVelocityY: 0,
    isJumping: false,
    gravity: 0.6,
    jumpStrength: -11,
    groundY: 150,
    obstacles: [] as { x: number; width: number; height: number; speed: number }[],
    spawnTimer: 0,
    score: 0,
    animationId: 0
  });

  const jump = () => {
    if (!isPlaying) {
      startGame();
      return;
    }
    if (!gameState.current.isJumping) {
      gameState.current.dinoVelocityY = gameState.current.jumpStrength;
      gameState.current.isJumping = true;
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    gameState.current = {
      dinoY: 150,
      dinoVelocityY: 0,
      isJumping: false,
      gravity: 0.6,
      jumpStrength: -11,
      groundY: 150,
      obstacles: [],
      spawnTimer: 0,
      score: 0,
      animationId: 0
    };
    loop();
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Physics
    state.dinoVelocityY += state.gravity;
    state.dinoY += state.dinoVelocityY;
    if (state.dinoY > state.groundY) {
      state.dinoY = state.groundY;
      state.dinoVelocityY = 0;
      state.isJumping = false;
    }

    // Score
    state.score += 1;
    setScore(Math.floor(state.score / 10));

    // Ground line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY + 30);
    ctx.lineTo(canvas.width, state.groundY + 30);
    ctx.stroke();

    // Dino drawing
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(50, state.dinoY, 24, 30);
    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(66, state.dinoY + 4, 4, 4);

    // Obstacle spawn
    state.spawnTimer++;
    if (state.spawnTimer > 80 + Math.random() * 60) {
      state.obstacles.push({
        x: canvas.width,
        width: 14 + Math.random() * 8,
        height: 20 + Math.random() * 20,
        speed: 5 + Math.min(8, Math.floor(state.score / 400))
      });
      state.spawnTimer = 0;
    }

    // Update & draw obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obs = state.obstacles[i];
      obs.x -= obs.speed;

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(obs.x, state.groundY + 30 - obs.height, obs.width, obs.height);

      // Collision detection
      const dinoLeft = 50;
      const dinoRight = 50 + 24;
      const dinoTop = state.dinoY;
      const dinoBottom = state.dinoY + 30;

      const obsLeft = obs.x;
      const obsRight = obs.x + obs.width;
      const obsTop = state.groundY + 30 - obs.height;
      const obsBottom = state.groundY + 30;

      if (
        dinoRight > obsLeft &&
        dinoLeft < obsRight &&
        dinoBottom > obsTop &&
        dinoTop < obsBottom
      ) {
        // Game Over!
        setIsGameOver(true);
        setIsPlaying(false);
        const finalScore = Math.floor(state.score / 10);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          saveDinoScore(finalScore, Math.floor(finalScore * 1.5));
        }
        return;
      }

      if (obs.x + obs.width < 0) {
        state.obstacles.splice(i, 1);
      }
    }

    state.animationId = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(gameState.current.animationId);
    };
  }, [isPlaying]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTyping}
            className="p-2.5 rounded-2xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
              <span>🦖 T-Rex Runner Arena</span>
            </h2>
            <p className="text-xs text-[var(--sub-color)]">Press Space or Up Arrow to jump over obstacles</p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono font-bold">
          <div className="text-right">
            <span className="text-[10px] text-[var(--sub-color)] uppercase block">Score</span>
            <span className="text-xl text-[var(--text-color)]">{score}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-400 uppercase block">High Score</span>
            <span className="text-xl text-amber-400">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={700}
          height={240}
          className="w-full max-w-[700px] h-[240px] bg-slate-950/60 rounded-2xl border border-[var(--sub-alt)] cursor-pointer"
          onClick={jump}
        />

        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs rounded-3xl space-y-3">
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--main-color)] text-white font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5" />
              <span>Start Game (Press Space)</span>
            </button>
            <p className="text-xs text-slate-300 font-medium">Click or press Space to jump</p>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs rounded-3xl space-y-3 animate-in fade-in">
            <h3 className="text-2xl font-black text-rose-500 font-mono tracking-tight">GAME OVER</h3>
            <p className="text-sm font-bold text-white font-mono">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--main-color)] text-white font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again (Space)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
