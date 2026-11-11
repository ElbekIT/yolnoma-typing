import React, { useRef, useEffect, useState, useCallback } from 'react';
import { wheelAudio } from './wheelAudio';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Play, Gauge } from 'lucide-react';

export type RevealSpeed = 'fast' | 'normal' | 'slow';

interface CharacterRevealProps {
  entries: string[];
  speed?: RevealSpeed;
  onWinnerSelected: (winner: string, index: number) => void;
}

type CharacterType = 'boy' | 'girl';
type AnimationPhase = 'idle' | 'walking' | 'unfurling' | 'writing' | 'revealed';

// Helper: Word wrap text into lines fitting within maxLineWidth
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  // Split by words first
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);

      // If single word itself exceeds maxWidth, break it into character chunks
      if (ctx.measureText(word).width > maxWidth) {
        let chunk = '';
        for (let c = 0; c < word.length; c++) {
          const char = word[c];
          if (ctx.measureText(chunk + char).width <= maxWidth) {
            chunk += char;
          } else {
            if (chunk) lines.push(chunk);
            chunk = char;
          }
        }
        currentLine = chunk;
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

export const CharacterRevealCanvas: React.FC<CharacterRevealProps> = ({
  entries,
  speed = 'normal',
  onWinnerSelected
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [character, setCharacter] = useState<CharacterType>('boy');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [winningIndex, setWinningIndex] = useState<number>(-1);

  // Speed timings in ms
  const speedTimings = {
    fast: { walk: 900, unfurl: 500, write: 1000, drum: 1800 },
    normal: { walk: 2000, unfurl: 900, write: 1800, drum: 3200 },
    slow: { walk: 3400, unfurl: 1400, write: 2800, drum: 5000 }
  }[speed];

  // Animation internal variables
  const animStateRef = useRef({
    charX: 40,
    targetX: 260,
    walkCycle: 0,
    scrollOpenProgress: 0,
    liftProgress: 0,
    penProgress: 0,
    startTime: 0,
    phase: 'idle' as AnimationPhase,
    winner: ''
  });

  // Start the Reveal Sequence
  const handleStartReveal = useCallback(() => {
    if (phase !== 'idle' && phase !== 'revealed') return;
    if (entries.length === 0) return;

    // Pick random winner
    const randIdx = Math.floor(Math.random() * entries.length);
    const chosenWinner = entries[randIdx];
    setWinningIndex(randIdx);

    const s = animStateRef.current;
    s.charX = 40;
    s.targetX = 260;
    s.walkCycle = 0;
    s.scrollOpenProgress = 0;
    s.liftProgress = 0;
    s.penProgress = 0;
    s.startTime = performance.now();
    s.phase = 'walking';
    s.winner = chosenWinner;
    setPhase('walking');

    // Suspenseful drumroll starts
    wheelAudio.playDrumRoll(speedTimings.drum);
  }, [entries, phase, speedTimings.drum]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 480;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const s = animStateRef.current;

      // 1. Draw Spotlight & Stage Floor (Smooth and zero lag)
      const stageGrad = ctx.createRadialGradient(width / 2, height - 80, 20, width / 2, height - 80, 320);
      stageGrad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
      stageGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.12)');
      stageGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = stageGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor ellipse podium
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 70, 240, 50, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.stroke();

      // Spotlight beam from ceiling
      const spotGrad = ctx.createLinearGradient(width / 2, 0, width / 2, height - 70);
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      spotGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.18)');
      spotGrad.addColorStop(1, 'rgba(251, 191, 36, 0.02)');
      ctx.beginPath();
      ctx.moveTo(width / 2 - 40, 0);
      ctx.lineTo(width / 2 + 40, 0);
      ctx.lineTo(width / 2 + 200, height - 70);
      ctx.lineTo(width / 2 - 200, height - 70);
      ctx.closePath();
      ctx.fillStyle = spotGrad;
      ctx.fill();
      ctx.restore();

      // State machine logic
      if (s.phase === 'walking') {
        const elapsed = time - s.startTime;
        const walkProgress = Math.min(elapsed / speedTimings.walk, 1);
        s.charX = 40 + (s.targetX - 40) * (1 - Math.pow(1 - walkProgress, 2));
        s.walkCycle = elapsed * 0.014;

        if (walkProgress >= 1) {
          s.phase = 'unfurling';
          s.startTime = time;
          setPhase('unfurling');
          wheelAudio.playScrollUnfurl();
        }
      } else if (s.phase === 'unfurling') {
        const elapsed = time - s.startTime;
        const unfurlProgress = Math.min(elapsed / speedTimings.unfurl, 1);
        s.scrollOpenProgress = 1 - Math.pow(1 - unfurlProgress, 3);

        if (unfurlProgress >= 1) {
          s.phase = 'writing';
          s.startTime = time;
          setPhase('writing');
        }
      } else if (s.phase === 'writing') {
        const elapsed = time - s.startTime;
        const writeProgress = Math.min(elapsed / speedTimings.write, 1);
        s.penProgress = writeProgress;

        // Writing sound
        if (Math.random() < 0.25) {
          wheelAudio.playWriting();
        }

        if (writeProgress >= 1) {
          s.phase = 'revealed';
          s.startTime = time;
          setPhase('revealed');

          wheelAudio.playVictory();
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']
          });

          onWinnerSelected(s.winner, winningIndex);
        }
      } else if (s.phase === 'revealed') {
        const elapsed = time - s.startTime;
        s.liftProgress = Math.min(elapsed / 500, 1);
      }

      // Draw Character
      const currentX = s.phase === 'idle' ? width / 2 : s.charX;
      const currentY = height - 120;
      const isWalking = s.phase === 'walking';
      const bobbing = isWalking ? Math.sin(s.walkCycle * 2) * 5 : Math.sin(time * 0.003) * 2;

      ctx.save();
      ctx.translate(currentX, currentY + bobbing);

      const isBoy = character === 'boy';

      // Character shadow
      ctx.beginPath();
      ctx.ellipse(0, 45, 36, 12, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // Feet / Shoes
      const leftLegAngle = isWalking ? Math.sin(s.walkCycle) * 0.4 : 0;
      const rightLegAngle = isWalking ? -Math.sin(s.walkCycle) * 0.4 : 0;

      // Left Foot
      ctx.save();
      ctx.translate(-14, 25);
      ctx.rotate(leftLegAngle);
      ctx.fillStyle = isBoy ? '#1e293b' : '#be185d';
      ctx.beginPath();
      ctx.roundRect(-7, 0, 14, 22, 6);
      ctx.fill();
      ctx.restore();

      // Right Foot
      ctx.save();
      ctx.translate(14, 25);
      ctx.rotate(rightLegAngle);
      ctx.fillStyle = isBoy ? '#1e293b' : '#be185d';
      ctx.beginPath();
      ctx.roundRect(-7, 0, 14, 22, 6);
      ctx.fill();
      ctx.restore();

      // Torso / Clothing
      ctx.beginPath();
      ctx.roundRect(-24, -25, 48, 54, 12);
      ctx.fillStyle = isBoy ? '#2563eb' : '#db2777';
      ctx.fill();

      // Uzbek national vest embroidery or collar accent
      ctx.beginPath();
      ctx.roundRect(-16, -25, 32, 48, 6);
      ctx.fillStyle = isBoy ? '#1e40af' : '#be185d';
      ctx.fill();

      // Golden embroidery buttons
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -12, 2.5, 0, 2 * Math.PI);
      ctx.arc(0, 0, 2.5, 0, 2 * Math.PI);
      ctx.arc(0, 12, 2.5, 0, 2 * Math.PI);
      ctx.fill();

      // Head & Neck
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.roundRect(-7, -35, 14, 14, 4);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, -56, 26, 0, 2 * Math.PI);
      ctx.fillStyle = '#fed7aa';
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e1b4b';
      if (isBoy) {
        ctx.beginPath();
        ctx.arc(0, -62, 26, Math.PI, 2 * Math.PI);
        ctx.fill();

        // Do'ppi with white embroidery
        ctx.beginPath();
        ctx.roundRect(-22, -88, 44, 24, [8, 8, 2, 2]);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-11, -76, 3, 0, 2 * Math.PI);
        ctx.arc(0, -78, 3.5, 0, 2 * Math.PI);
        ctx.arc(11, -76, 3, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, -60, 28, Math.PI * 0.9, 2.1 * Math.PI);
        ctx.fill();

        // Braids
        ctx.beginPath();
        ctx.roundRect(-28, -50, 10, 48, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(18, -50, 10, 48, 5);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -80, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Friendly Face
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-8, -56, 3, 0, 2 * Math.PI);
      ctx.arc(8, -56, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-9, -57, 1.2, 0, 2 * Math.PI);
      ctx.arc(7, -57, 1.2, 0, 2 * Math.PI);
      ctx.fill();

      // Blush
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(-14, -50, 4, 0, 2 * Math.PI);
      ctx.arc(14, -50, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -48, 7, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // 3. Parchment / Scroll Reveal Animation with Multi-line Wrapping
      const openProg = s.scrollOpenProgress;
      const liftProg = s.liftProgress;

      // Expandable Scroll Dimensions
      const scrollMaxW = 280;
      const scrollMaxH = 165;
      const currentScrollW = 40 + (scrollMaxW - 40) * openProg;
      const currentScrollH = 40 + (scrollMaxH - 40) * openProg;

      const scrollYOffset = -15 - (liftProg * 45);
      const scrollScale = 1 + (liftProg * 0.22);

      ctx.save();
      ctx.translate(0, scrollYOffset);
      ctx.scale(scrollScale, scrollScale);

      // Draw Parchment Paper
      ctx.beginPath();
      ctx.roundRect(-currentScrollW / 2, -currentScrollH / 2, currentScrollW, currentScrollH, 10);
      ctx.fillStyle = '#fef3c7'; // Warm parchment
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 16;
      ctx.fill();

      // Ornate Border on paper
      if (openProg > 0.4) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#d97706';
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
        ctx.strokeRect(-currentScrollW / 2 + 6, -currentScrollH / 2 + 6, currentScrollW - 12, currentScrollH - 12);
      }

      // Wooden scroll rollers on top and bottom
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-currentScrollW / 2 - 6, -currentScrollH / 2 - 5, currentScrollW + 12, 10, 4);
      ctx.roundRect(-currentScrollW / 2 - 6, currentScrollH / 2 - 5, currentScrollW + 12, 10, 4);
      ctx.fill();

      // Text written onto parchment:
      if (s.phase === 'writing' || s.phase === 'revealed') {
        const fullWinner = s.winner || 'Gʻolib';
        const charsToShow = s.phase === 'revealed'
          ? fullWinner.length
          : Math.max(1, Math.floor(s.penProgress * fullWinner.length));
        const partialName = fullWinner.slice(0, charsToShow);

        // Header Title
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌟 GʻOLIB TANLANDI 🌟', 0, -currentScrollH / 2 + 24);

        // Multi-line Word Wrap Calculation:
        // Available width inside paper
        const maxTextWidth = currentScrollW - 28;

        // Choose appropriate font size based on length
        let fontSize = 22;
        if (fullWinner.length > 50) fontSize = 12;
        else if (fullWinner.length > 30) fontSize = 14;
        else if (fullWinner.length > 18) fontSize = 16;
        else if (fullWinner.length > 10) fontSize = 18;

        ctx.font = `bold ${fontSize}px "Georgia", serif, system-ui`;
        const lines = wrapCanvasText(ctx, partialName, maxTextWidth);

        // Render each line centered vertically
        ctx.fillStyle = '#1e1b4b';
        const lineHeight = fontSize * 1.25;
        const totalTextHeight = lines.length * lineHeight;
        const startY = -(totalTextHeight / 2) + (lineHeight / 2) + 2;

        let lastLineX = 0;
        let lastLineY = 0;

        lines.forEach((lineText, idx) => {
          const lineY = startY + (idx * lineHeight);
          ctx.fillText(lineText, 0, lineY);
          if (idx === lines.length - 1) {
            lastLineX = ctx.measureText(lineText).width / 2;
            lastLineY = lineY;
          }
        });

        // Lucky badge/emblem on parchment
        if (s.phase === 'revealed') {
          ctx.fillStyle = '#d97706';
          ctx.font = '900 11px system-ui, sans-serif';
          ctx.fillText('🏆 TABRIKLAYMIZ! 🏆', 0, currentScrollH / 2 - 16);
        }

        // Feather Quill Pen Animation during writing phase
        if (s.phase === 'writing' && lines.length > 0) {
          const penX = lastLineX + 8;
          const penY = lastLineY + Math.sin(time * 0.04) * 4;

          ctx.save();
          ctx.translate(penX, penY);
          ctx.rotate(-0.4);

          // Golden feather quill
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.ellipse(8, -18, 5, 22, -0.3, 0, 2 * Math.PI);
          ctx.fill();

          // Pen Nib
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(4, -8);
          ctx.lineTo(-4, -8);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else if (openProg < 0.3) {
        // Sealed envelope badge
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore(); // end scroll scale

      // Character Hands holding the scroll
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(-currentScrollW / 2 + 8, scrollYOffset, 7, 0, 2 * Math.PI);
      ctx.arc(currentScrollW / 2 - 8, scrollYOffset, 7, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore(); // end character translation

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [character, winningIndex, onWinnerSelected, speedTimings]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full max-w-[640px] mx-auto select-none"
    >
      {/* Top Character Selector Controls */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--card-bg)] rounded-xl border border-[var(--sub-alt)]">
          <button
            type="button"
            onClick={() => setCharacter('boy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              character === 'boy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <span>👦</span>
            <span>Jasur (Yigit)</span>
          </button>
          <button
            type="button"
            onClick={() => setCharacter('girl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              character === 'girl'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <span>👧</span>
            <span>Laylo (Qiz)</span>
          </button>
        </div>

        <div className="text-xs text-[var(--sub-color)] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{entries.length} ta nomzod</span>
        </div>
      </div>

      {/* Main Animation Stage */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--sub-alt)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Start Button Overlay (when idle) */}
        {phase === 'idle' && (
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleStartReveal}
              disabled={entries.length === 0}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-base sm:text-lg font-black rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>GʻOLIBNI ANIQLASH (START)</span>
            </button>
          </div>
        )}

        {/* Revealed Winner Replay Button */}
        {phase === 'revealed' && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={handleStartReveal}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg hover:bg-amber-400 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yana bir bor tanlash</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
