import React, { useRef, useEffect, useState, useCallback } from 'react';
import { wheelAudio } from './wheelAudio';
import confetti from 'canvas-confetti';
import { Sparkles, User, RefreshCw, Volume2, VolumeX, Play } from 'lucide-react';

interface CharacterRevealProps {
  entries: string[];
  onWinnerSelected: (winner: string, index: number) => void;
}

type CharacterType = 'boy' | 'girl';
type AnimationPhase = 'idle' | 'walking' | 'unfurling' | 'writing' | 'revealed';

export const CharacterRevealCanvas: React.FC<CharacterRevealProps> = ({
  entries,
  onWinnerSelected
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [character, setCharacter] = useState<CharacterType>('boy');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [winnerName, setWinnerName] = useState<string>('');
  const [winningIndex, setWinningIndex] = useState<number>(-1);
  const [revealedCharsCount, setRevealedCharsCount] = useState<number>(0);

  // Animation internal variables
  const animStateRef = useRef({
    charX: -120, // starts offscreen left
    charY: 0,
    targetX: 250,
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
    setWinnerName(chosenWinner);
    setRevealedCharsCount(0);

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
    wheelAudio.playDrumRoll(3200);
  }, [entries, phase]);

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

      // 1. Draw Spotlight & Stage Floor
      // Stage gradient
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
        // Walk for 2.2 seconds to reach center stage
        const walkProgress = Math.min(elapsed / 2200, 1);
        s.charX = 40 + (s.targetX - 40) * (1 - Math.pow(1 - walkProgress, 2));
        s.walkCycle = elapsed * 0.012;

        if (walkProgress >= 1) {
          s.phase = 'unfurling';
          s.startTime = time;
          setPhase('unfurling');
          wheelAudio.playScrollUnfurl();
        }
      } else if (s.phase === 'unfurling') {
        const elapsed = time - s.startTime;
        const unfurlProgress = Math.min(elapsed / 1200, 1);
        s.scrollOpenProgress = 1 - Math.pow(1 - unfurlProgress, 3);

        if (unfurlProgress >= 1) {
          s.phase = 'writing';
          s.startTime = time;
          setPhase('writing');
        }
      } else if (s.phase === 'writing') {
        const elapsed = time - s.startTime;
        const writeDuration = 1800;
        const writeProgress = Math.min(elapsed / writeDuration, 1);
        s.penProgress = writeProgress;

        // Animate writing sound intermittently
        if (Math.random() < 0.25) {
          wheelAudio.playWriting();
        }

        const winnerLen = s.winner.length || 1;
        const currentChars = Math.floor(writeProgress * winnerLen);
        setRevealedCharsCount(currentChars);

        if (writeProgress >= 1) {
          s.phase = 'revealed';
          s.startTime = time;
          setPhase('revealed');

          // Grand victory moment!
          wheelAudio.playVictory();
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']
          });

          onWinnerSelected(s.winner, winningIndex);
        }
      } else if (s.phase === 'revealed') {
        const elapsed = time - s.startTime;
        s.liftProgress = Math.min(elapsed / 600, 1);
      }

      // Draw Character
      const currentX = s.phase === 'idle' ? width / 2 : s.charX;
      const currentY = height - 120;
      const isWalking = s.phase === 'walking';
      const bobbing = isWalking ? Math.sin(s.walkCycle * 2) * 6 : Math.sin(time * 0.003) * 2;

      ctx.save();
      ctx.translate(currentX, currentY + bobbing);

      // 2. Character Body & Outfit
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
      ctx.fillStyle = isBoy ? '#2563eb' : '#db2777'; // Blue blazer for boy, magenta dress for girl
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
      ctx.fillStyle = '#fed7aa'; // Natural skin tone
      ctx.beginPath();
      ctx.roundRect(-7, -35, 14, 14, 4);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, -56, 26, 0, 2 * Math.PI);
      ctx.fillStyle = '#fed7aa';
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e1b4b'; // Dark black hair
      if (isBoy) {
        // Boy hair + Traditional Uzbek Do'ppi!
        ctx.beginPath();
        ctx.arc(0, -62, 26, Math.PI, 2 * Math.PI);
        ctx.fill();

        // Do'ppi (Tubeteika) with Uzbek white almond/bodom pattern!
        ctx.beginPath();
        ctx.roundRect(-22, -88, 44, 24, [8, 8, 2, 2]);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Do'ppi White bodom embroidery
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-11, -76, 3, 0, 2 * Math.PI);
        ctx.arc(0, -78, 3.5, 0, 2 * Math.PI);
        ctx.arc(11, -76, 3, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Girl hair with cute side braids and head accessory
        ctx.beginPath();
        ctx.arc(0, -60, 28, Math.PI * 0.9, 2.1 * Math.PI);
        ctx.fill();

        // Left Braid
        ctx.beginPath();
        ctx.roundRect(-28, -50, 10, 48, 5);
        ctx.fill();

        // Right Braid
        ctx.beginPath();
        ctx.roundRect(18, -50, 10, 48, 5);
        ctx.fill();

        // Cute gold hair ribbon
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -80, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Friendly Face: Eyes, Blush, Smile
      // Eyes (sparkling)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-8, -56, 3, 0, 2 * Math.PI);
      ctx.arc(8, -56, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-9, -57, 1.2, 0, 2 * Math.PI);
      ctx.arc(7, -57, 1.2, 0, 2 * Math.PI);
      ctx.fill();

      // Cheerful blush
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(-14, -50, 4, 0, 2 * Math.PI);
      ctx.arc(14, -50, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Warm Smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -48, 7, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // 3. Parchment / Scroll Reveal Animation
      const openProg = s.scrollOpenProgress;
      const liftProg = s.liftProgress;

      // Scroll dimensions
      const scrollMaxW = 260;
      const scrollMaxH = 150;
      const currentScrollW = 40 + (scrollMaxW - 40) * openProg;
      const currentScrollH = 40 + (scrollMaxH - 40) * openProg;

      // When character reveals, they lift it up towards camera!
      const scrollYOffset = -15 - (liftProg * 45);
      const scrollScale = 1 + (liftProg * 0.25);

      ctx.save();
      ctx.translate(0, scrollYOffset);
      ctx.scale(scrollScale, scrollScale);

      // Draw Parchment Paper (Golden Antique Parchment)
      ctx.beginPath();
      ctx.roundRect(-currentScrollW / 2, -currentScrollH / 2, currentScrollW, currentScrollH, 10);
      ctx.fillStyle = '#fef3c7'; // Warm parchment amber
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18;
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
        const charsToShow = s.phase === 'revealed' ? fullWinner.length : Math.max(1, Math.floor(s.penProgress * fullWinner.length));
        const partialName = fullWinner.slice(0, charsToShow);

        // Header Title
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌟 GʻOLIB TANLANDI 🌟', 0, -currentScrollH / 2 + 28);

        // Winner Name (Ornate Calligraphy)
        ctx.fillStyle = '#1e1b4b';
        let nameFontSize = 26;
        if (fullWinner.length > 20) nameFontSize = 16;
        else if (fullWinner.length > 12) nameFontSize = 20;

        ctx.font = `bold ${nameFontSize}px "Georgia", serif, system-ui`;
        ctx.fillText(partialName, 0, 4);

        // Lucky badge/emblem on parchment
        if (s.phase === 'revealed') {
          ctx.fillStyle = '#d97706';
          ctx.font = '900 11px system-ui, sans-serif';
          ctx.fillText('🏆 TABRIKLAYMIZ! 🏆', 0, currentScrollH / 2 - 20);
        }

        // Feather Quill Pen Animation during writing phase
        if (s.phase === 'writing') {
          const penX = ctx.measureText(partialName).width / 2 + 10;
          const penY = 4 + Math.sin(time * 0.04) * 6;

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
        ctx.fillStyle = '#dc2626'; // Red wax seal
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
  }, [character, winningIndex, onWinnerSelected]);

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
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-base sm:text-lg font-black rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none animate-pulse"
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
