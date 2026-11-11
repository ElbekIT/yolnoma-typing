import React, { useRef, useEffect, useState, useCallback } from 'react';
import { wheelAudio } from './wheelAudio';
import confetti from 'canvas-confetti';
import { RefreshCw, Play, Trash2 } from 'lucide-react';

export type RevealSpeed = 'fast' | 'normal' | 'slow';

interface CharacterRevealProps {
  entries: string[];
  speed?: RevealSpeed;
  onWinnerSelected: (winner: string, index: number) => void;
  onRemoveWinner?: (index: number) => void;
}

type CharacterType = 'boy' | 'girl';
type AnimationPhase =
  | 'idle'
  | 'depositing'
  | 'closing'
  | 'shaking'
  | 'opening'
  | 'drawing'
  | 'unfurling'
  | 'writing'
  | 'revealed';

// Word wrap helper for canvas
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
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
  onWinnerSelected,
  onRemoveWinner
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [character, setCharacter] = useState<CharacterType>('boy');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [winningIndex, setWinningIndex] = useState<number>(-1);

  // Speed timings in ms
  const speedTimings = {
    fast: { deposit: 800, close: 400, shake: 1400, open: 500, draw: 600, unfurl: 500, write: 900 },
    normal: { deposit: 1400, close: 600, shake: 2400, open: 700, draw: 900, unfurl: 800, write: 1600 },
    slow: { deposit: 2200, close: 800, shake: 3600, open: 1000, draw: 1200, unfurl: 1100, write: 2400 }
  }[speed];

  // Animation state ref
  const animStateRef = useRef({
    startTime: 0,
    phase: 'idle' as AnimationPhase,
    winner: '',
    winnerIndex: -1,
    chestLidAngle: 1.2, // open angle (radians)
    chestShakeAngle: 0,
    chestShakeY: 0,
    chestLocked: false,
    lightBeamIntensity: 0,
    drawnPaperY: 0,
    scrollOpenProgress: 0,
    liftProgress: 0,
    penProgress: 0,
    depositProgress: 0
  });

  // Start the Treasure Chest Draw Sequence
  const handleStartDraw = useCallback(() => {
    if (phase !== 'idle' && phase !== 'revealed') return;
    if (entries.length === 0) return;

    // Pick random winner from entries
    const randIdx = Math.floor(Math.random() * entries.length);
    const chosenWinner = entries[randIdx];
    setWinningIndex(randIdx);

    const s = animStateRef.current;
    s.winner = chosenWinner;
    s.winnerIndex = randIdx;
    s.chestLidAngle = 1.3;
    s.chestShakeAngle = 0;
    s.chestShakeY = 0;
    s.chestLocked = false;
    s.lightBeamIntensity = 0;
    s.drawnPaperY = 0;
    s.scrollOpenProgress = 0;
    s.liftProgress = 0;
    s.penProgress = 0;
    s.depositProgress = 0;
    s.startTime = performance.now();
    s.phase = 'depositing';
    setPhase('depositing');

    wheelAudio.playScrollUnfurl();
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

      // 1. Stage Floor & Spotlight
      const stageGrad = ctx.createRadialGradient(width / 2, height - 70, 20, width / 2, height - 70, 340);
      stageGrad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
      stageGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.12)');
      stageGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = stageGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor ellipse podium
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 60, 250, 48, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
      ctx.stroke();

      // Spotlight beam from ceiling
      const spotGrad = ctx.createLinearGradient(width / 2, 0, width / 2, height - 60);
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      spotGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.18)');
      spotGrad.addColorStop(1, 'rgba(251, 191, 36, 0.02)');
      ctx.beginPath();
      ctx.moveTo(width / 2 - 40, 0);
      ctx.lineTo(width / 2 + 40, 0);
      ctx.lineTo(width / 2 + 220, height - 60);
      ctx.lineTo(width / 2 - 220, height - 60);
      ctx.closePath();
      ctx.fillStyle = spotGrad;
      ctx.fill();
      ctx.restore();

      // State Machine Transitions
      if (s.phase === 'depositing') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.deposit, 1);
        s.depositProgress = p;

        if (p >= 1) {
          s.phase = 'closing';
          s.startTime = time;
          setPhase('closing');
          wheelAudio.playChestClose();
        }
      } else if (s.phase === 'closing') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.close, 1);
        // Lid slams shut
        s.chestLidAngle = 1.3 * (1 - p);
        if (p >= 0.8) {
          s.chestLocked = true;
        }

        if (p >= 1) {
          s.phase = 'shaking';
          s.startTime = time;
          setPhase('shaking');
          wheelAudio.playDrumRoll(speedTimings.shake);
        }
      } else if (s.phase === 'shaking') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.shake, 1);

        // Chest shaking & rotation in character's hands
        const shakeFreq = 0.035;
        s.chestShakeAngle = Math.sin(elapsed * shakeFreq) * 0.22;
        s.chestShakeY = Math.abs(Math.sin(elapsed * shakeFreq * 2)) * -24;

        if (Math.random() < 0.2) {
          wheelAudio.playChestShake();
        }

        if (p >= 1) {
          s.phase = 'opening';
          s.startTime = time;
          s.chestShakeAngle = 0;
          s.chestShakeY = 0;
          s.chestLocked = false;
          setPhase('opening');
          wheelAudio.playMagicChime();
        }
      } else if (s.phase === 'opening') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.open, 1);
        // Lid opens wide
        s.chestLidAngle = 1.3 * Math.min(p * 1.2, 1);
        s.lightBeamIntensity = Math.min(p * 1.5, 1);

        if (p >= 1) {
          s.phase = 'drawing';
          s.startTime = time;
          setPhase('drawing');
          wheelAudio.playScrollUnfurl();
        }
      } else if (s.phase === 'drawing') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.draw, 1);
        // Paper floats up from inside chest
        s.drawnPaperY = p * 90;

        if (p >= 1) {
          s.phase = 'unfurling';
          s.startTime = time;
          setPhase('unfurling');
        }
      } else if (s.phase === 'unfurling') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.unfurl, 1);
        s.scrollOpenProgress = 1 - Math.pow(1 - p, 3);

        if (p >= 1) {
          s.phase = 'writing';
          s.startTime = time;
          setPhase('writing');
        }
      } else if (s.phase === 'writing') {
        const elapsed = time - s.startTime;
        const p = Math.min(elapsed / speedTimings.write, 1);
        s.penProgress = p;

        if (Math.random() < 0.22) {
          wheelAudio.playWriting();
        }

        if (p >= 1) {
          s.phase = 'revealed';
          s.startTime = time;
          setPhase('revealed');

          wheelAudio.playVictory();
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']
          });

          onWinnerSelected(s.winner, s.winnerIndex);
        }
      } else if (s.phase === 'revealed') {
        const elapsed = time - s.startTime;
        s.liftProgress = Math.min(elapsed / 500, 1);
      }

      // ============================================================
      // 2. DRAW MAGIC TREASURE CHEST (SEHRLI SANDIQ)
      // ============================================================
      const chestBaseX = width / 2 + 75;
      const chestBaseY = height - 105;
      const isShaking = s.phase === 'shaking';

      ctx.save();
      // When shaking, chest is lifted and tilted in hands
      if (isShaking) {
        ctx.translate(width / 2, chestBaseY + s.chestShakeY - 30);
        ctx.rotate(s.chestShakeAngle);
      } else {
        ctx.translate(chestBaseX, chestBaseY);
      }

      // Magical Light Beam from inside open chest
      if (s.lightBeamIntensity > 0 || (s.phase === 'idle' && s.chestLidAngle > 0.5)) {
        const beamAlpha = s.phase === 'idle' ? 0.35 : s.lightBeamIntensity * 0.75;
        const beamGrad = ctx.createLinearGradient(0, -20, 0, -280);
        beamGrad.addColorStop(0, `rgba(251, 191, 36, ${beamAlpha})`);
        beamGrad.addColorStop(0.6, `rgba(245, 158, 11, ${beamAlpha * 0.4})`);
        beamGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

        ctx.beginPath();
        ctx.moveTo(-45, -15);
        ctx.lineTo(45, -15);
        ctx.lineTo(85, -280);
        ctx.lineTo(-85, -280);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();

        // Sparkles rising from chest
        for (let i = 0; i < 4; i++) {
          const sparkY = -30 - ((time * 0.08 + i * 50) % 200);
          const sparkX = Math.sin(time * 0.005 + i) * 35;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();
        }
      }

      // Chest Bottom Box (Mahogany Wood)
      ctx.beginPath();
      ctx.roundRect(-55, -20, 110, 52, [4, 4, 8, 8]);
      ctx.fillStyle = '#78350f'; // Rich wood
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Wood plank stripes
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-55, -4);
      ctx.lineTo(55, -4);
      ctx.moveTo(-55, 14);
      ctx.lineTo(55, 14);
      ctx.stroke();

      // Golden Brass Corner Braces & Straps
      ctx.fillStyle = '#fbbf24';
      // Left strap
      ctx.fillRect(-45, -20, 10, 52);
      // Right strap
      ctx.fillRect(35, -20, 10, 52);
      // Center lock plate
      ctx.fillRect(-12, -20, 24, 22);

      // Brass Rivets
      ctx.fillStyle = '#d97706';
      [-40, 40].forEach((rx) => {
        [-12, 4, 20].forEach((ry) => {
          ctx.beginPath();
          ctx.arc(rx, ry, 1.8, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // Padlock / Latch
      ctx.fillStyle = s.chestLocked ? '#d97706' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -6, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-1.5, -6, 3, 5);

      // Chest Hinged Lid
      const lidAngle = s.chestLidAngle;
      ctx.save();
      ctx.translate(0, -20);
      // Rotate lid backward when open
      ctx.rotate(-lidAngle);

      // Curved arched lid
      ctx.beginPath();
      ctx.roundRect(-56, -24, 112, 24, [12, 12, 2, 2]);
      ctx.fillStyle = '#92400e';
      ctx.fill();

      // Golden lid straps
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-45, -24, 10, 24);
      ctx.fillRect(35, -24, 10, 24);
      ctx.fillRect(-10, -8, 20, 8);

      ctx.restore(); // end lid

      ctx.restore(); // end chest

      // ============================================================
      // 3. DRAW CHARACTER (JASUR or LAYLO)
      // ============================================================
      const charX = isShaking ? width / 2 - 70 : width / 2 - 75;
      const charY = height - 120;
      const bobbing = Math.sin(time * 0.004) * 2;

      ctx.save();
      ctx.translate(charX, charY + bobbing);

      const isBoy = character === 'boy';

      // Character Shadow
      ctx.beginPath();
      ctx.ellipse(0, 48, 36, 12, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // Feet / Shoes
      ctx.fillStyle = isBoy ? '#1e293b' : '#be185d';
      ctx.beginPath();
      ctx.roundRect(-18, 25, 14, 22, 6);
      ctx.roundRect(4, 25, 14, 22, 6);
      ctx.fill();

      // Torso / Clothing
      ctx.beginPath();
      ctx.roundRect(-24, -25, 48, 54, 12);
      ctx.fillStyle = isBoy ? '#2563eb' : '#db2777';
      ctx.fill();

      // Uzbek national vest
      ctx.beginPath();
      ctx.roundRect(-16, -25, 32, 48, 6);
      ctx.fillStyle = isBoy ? '#1e40af' : '#be185d';
      ctx.fill();

      // Buttons
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

        // Do'ppi
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

        ctx.beginPath();
        ctx.roundRect(-28, -50, 10, 48, 5);
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

      // Highlights
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

      // Arms / Hands
      ctx.fillStyle = '#fed7aa';
      if (s.phase === 'depositing') {
        // Hand throwing papers into chest
        ctx.beginPath();
        ctx.arc(32, -10, 7, 0, 2 * Math.PI);
        ctx.fill();
      } else if (isShaking) {
        // Both hands gripping chest
        ctx.beginPath();
        ctx.arc(38, -15, 7, 0, 2 * Math.PI);
        ctx.arc(58, -15, 7, 0, 2 * Math.PI);
        ctx.fill();
      } else if (s.phase === 'drawing') {
        // Arm reaching into chest
        ctx.beginPath();
        ctx.arc(42, -5, 7, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Resting hands
        ctx.beginPath();
        ctx.arc(-26, 4, 6, 0, 2 * Math.PI);
        ctx.arc(26, 4, 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore(); // end character

      // ============================================================
      // 4. ANIMATED PAPERS DEPOSITING INTO CHEST
      // ============================================================
      if (s.phase === 'depositing') {
        const depP = s.depositProgress;
        const totalPapers = Math.min(entries.length, 6);

        for (let i = 0; i < totalPapers; i++) {
          const itemProgress = Math.min(Math.max((depP * 1.5) - (i * 0.15), 0), 1);
          if (itemProgress > 0 && itemProgress < 1) {
            // Paper arc path: from character's hand to inside chest
            const startPx = charX + 32;
            const startPy = charY - 15;
            const endPx = chestBaseX;
            const endPy = chestBaseY - 15;

            const curPx = startPx + (endPx - startPx) * itemProgress;
            const curPy = startPy + (endPy - startPy) * itemProgress - Math.sin(itemProgress * Math.PI) * 45;

            ctx.save();
            ctx.translate(curPx, curPy);
            ctx.rotate(itemProgress * 4);

            ctx.beginPath();
            ctx.roundRect(-10, -6, 20, 12, 2);
            ctx.fillStyle = '#fef3c7';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
          }
        }
      }

      // ============================================================
      // 5. DRAWN SCROLL REVEAL & MULTI-LINE WINNER WRITING
      // ============================================================
      if (s.phase === 'drawing' || s.phase === 'unfurling' || s.phase === 'writing' || s.phase === 'revealed') {
        const openProg = s.scrollOpenProgress;
        const liftProg = s.liftProgress;

        // Position of drawn paper
        const paperX = width / 2;
        let paperY = (height / 2) - 10;
        if (s.phase === 'drawing') {
          paperY = chestBaseY - s.drawnPaperY;
        }

        const scrollMaxW = 280;
        const scrollMaxH = 165;
        const currentScrollW = 38 + (scrollMaxW - 38) * openProg;
        const currentScrollH = 38 + (scrollMaxH - 38) * openProg;

        const scrollYOffset = paperY - (liftProg * 35);
        const scrollScale = 1 + (liftProg * 0.2);

        ctx.save();
        ctx.translate(paperX, scrollYOffset);
        ctx.scale(scrollScale, scrollScale);

        // Parchment Paper
        ctx.beginPath();
        ctx.roundRect(-currentScrollW / 2, -currentScrollH / 2, currentScrollW, currentScrollH, 10);
        ctx.fillStyle = '#fef3c7';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 16;
        ctx.fill();

        // Ornate Border
        if (openProg > 0.4) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#d97706';
          ctx.stroke();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
          ctx.strokeRect(-currentScrollW / 2 + 6, -currentScrollH / 2 + 6, currentScrollW - 12, currentScrollH - 12);
        }

        // Wooden scroll rollers
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-currentScrollW / 2 - 6, -currentScrollH / 2 - 5, currentScrollW + 12, 10, 4);
        ctx.roundRect(-currentScrollW / 2 - 6, currentScrollH / 2 - 5, currentScrollW + 12, 10, 4);
        ctx.fill();

        // Text & Calligraphy
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
          ctx.fillText('🌟 SANDIQDAN TANLANDI 🌟', 0, -currentScrollH / 2 + 24);

          // Multi-line Word Wrap Calculation:
          const maxTextWidth = currentScrollW - 28;

          let fontSize = 22;
          if (fullWinner.length > 50) fontSize = 12;
          else if (fullWinner.length > 30) fontSize = 14;
          else if (fullWinner.length > 18) fontSize = 16;
          else if (fullWinner.length > 10) fontSize = 18;

          ctx.font = `bold ${fontSize}px "Georgia", serif, system-ui`;
          const lines = wrapCanvasText(ctx, partialName, maxTextWidth);

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

          // Footer Badge
          if (s.phase === 'revealed') {
            ctx.fillStyle = '#d97706';
            ctx.font = '900 11px system-ui, sans-serif';
            ctx.fillText('🏆 TABRIKLAYMIZ! 🏆', 0, currentScrollH / 2 - 16);
          }

          // Feather Quill Pen Animation
          if (s.phase === 'writing' && lines.length > 0) {
            const penX = lastLineX + 8;
            const penY = lastLineY + Math.sin(time * 0.04) * 4;

            ctx.save();
            ctx.translate(penX, penY);
            ctx.rotate(-0.4);

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(8, -18, 5, 22, -0.3, 0, 2 * Math.PI);
            ctx.fill();

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
          // Sealed envelope wax
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.restore(); // end scroll scale
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [character, speedTimings, entries, onWinnerSelected]);

  // Remove winner and immediately draw next or reset
  const handleRemoveAndNext = () => {
    if (winningIndex >= 0 && onRemoveWinner) {
      onRemoveWinner(winningIndex);
    }
    setPhase('idle');
  };

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

        <div className="text-xs text-[var(--sub-color)] flex items-center gap-1.5">
          <span className="text-amber-400">📦</span>
          <span>Sandiqdagi ismlar: <strong>{entries.length} ta</strong></span>
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
              onClick={handleStartDraw}
              disabled={entries.length === 0}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-base sm:text-lg font-black rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>SANDIQNI AYLANTIRISH (START)</span>
            </button>
          </div>
        )}

        {/* Revealed Winner Actions (Remove Winner or Next) */}
        {phase === 'revealed' && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 px-3 flex-wrap">
            <button
              type="button"
              onClick={handleRemoveAndNext}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs"
              title="G'olibni o'chirib, qolganlar bilan davom etish"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Gʻolibni olib tashlab, davom etish</span>
            </button>

            <button
              type="button"
              onClick={handleStartDraw}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Qoldirib, yana aylantirish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
