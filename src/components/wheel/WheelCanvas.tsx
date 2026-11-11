import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WheelTheme, getContrastColor } from './wheelThemes';
import { wheelAudio } from './wheelAudio';
import confetti from 'canvas-confetti';

export type SpinSpeed = 'fast' | 'normal' | 'slow';

interface WheelCanvasProps {
  entries: string[];
  theme: WheelTheme;
  isSpinning: boolean;
  spinSpeed?: SpinSpeed;
  onSpinStart: () => void;
  onSpinEnd: (winner: string, index: number) => void;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  entries,
  theme,
  isSpinning,
  spinSpeed = 'normal',
  onSpinStart,
  onSpinEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Wheel physics state
  const rotationRef = useRef<number>(0);
  const lastSectorRef = useRef<number>(-1);
  const pointerDeflectionRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Responsive size
  const [canvasSize, setCanvasSize] = useState<number>(560);

  // Update canvas dimensions on container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const availableHeight = window.innerHeight * 0.65;
        const size = Math.min(containerWidth - 16, availableHeight, 620);
        setCanvasSize(Math.max(size, 300));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main drawing function
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvasSize;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = (size / 2) - 22;
    const hubRadius = Math.max(38, outerRadius * 0.18);

    const count = Math.max(entries.length, 1);
    const arc = (2 * Math.PI) / count;
    const currentRotation = rotationRef.current;

    // 1. Draw outer rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = theme.outerBorderColor;
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 18;
    ctx.fill();

    // Outer ring accent
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.outerBorderSecondary;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Wheel Slices
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    const palette = theme.colors;
    for (let i = 0; i < count; i++) {
      const sliceStartAngle = i * arc;
      const sliceEndAngle = sliceStartAngle + arc;

      let colorIndex = i % palette.length;
      if (i === count - 1 && colorIndex === 0 && count > 1) {
        colorIndex = (palette.length > 2) ? 1 : 0;
      }
      const sliceColor = palette[colorIndex];

      // Draw Sector Arc
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, sliceStartAngle, sliceEndAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColor;
      ctx.fill();

      // Border between slices
      ctx.lineWidth = count > 60 ? 1 : 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();

      // Draw Sector Text
      const text = entries[i] || `Variant ${i + 1}`;
      const textColor = getContrastColor(sliceColor);

      ctx.save();
      ctx.rotate(sliceStartAngle + (arc / 2));
      ctx.fillStyle = textColor;

      // Font size dynamically based on slice count
      let fontSize = 18;
      if (count > 80) fontSize = 9;
      else if (count > 50) fontSize = 11;
      else if (count > 30) fontSize = 13;
      else if (count > 16) fontSize = 15;
      else if (count > 8) fontSize = 17;
      else fontSize = 20;

      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Text max width check & truncate
      const maxTextWidth = outerRadius - hubRadius - 16;
      let displayStr = text;
      if (ctx.measureText(displayStr).width > maxTextWidth) {
        while (displayStr.length > 2 && ctx.measureText(displayStr + '..').width > maxTextWidth) {
          displayStr = displayStr.slice(0, -1);
        }
        displayStr += '..';
      }

      ctx.fillText(displayStr, outerRadius - 14, 0);
      ctx.restore();
    }
    ctx.restore();

    // 3. Draw Center Hub (Clickable Spin Button)
    ctx.save();
    ctx.translate(centerX, centerY);

    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = theme.hubColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = theme.hubBorderColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, hubRadius * 0.76, 0, 2 * Math.PI);
    ctx.fillStyle = theme.hubBorderColor;
    ctx.fill();

    ctx.fillStyle = theme.hubColor;
    const hubFontSize = Math.max(10, Math.floor(hubRadius * 0.32));
    ctx.font = `900 ${hubFontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AYLANTIR', 0, 0);

    ctx.restore();

    // 4. Draw Right Pointer Arrow (at 3 o'clock, pointing leftwards)
    const pointerDeflection = pointerDeflectionRef.current;
    ctx.save();
    const pointerTipX = centerX + outerRadius + 2;
    const pointerTipY = centerY;

    ctx.translate(pointerTipX, pointerTipY);
    ctx.rotate(pointerDeflection);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, -14);
    ctx.lineTo(28, -10);
    ctx.lineTo(28, 10);
    ctx.lineTo(24, 14);
    ctx.closePath();

    ctx.fillStyle = theme.pointerColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = theme.pointerAccent;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(22, 0, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }, [canvasSize, entries, theme]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Physical Spin Animation Routine with Speed Settings
  const spinWheel = useCallback(() => {
    if (isSpinning || entries.length === 0) return;

    onSpinStart();

    const count = entries.length;
    const arc = (2 * Math.PI) / count;
    const winningIndex = Math.floor(Math.random() * count);

    const currentAngle = rotationRef.current;
    const currentBase = currentAngle % (2 * Math.PI);
    const targetSliceCenter = (winningIndex + 0.5) * arc;
    const targetOffset = (2 * Math.PI) - targetSliceCenter;

    // Speed configuration
    let duration = 6000;
    let minSpins = 7;
    if (spinSpeed === 'fast') {
      duration = 3200;
      minSpins = 4;
    } else if (spinSpeed === 'slow') {
      duration = 9800;
      minSpins = 11;
    }

    const fullSpins = (minSpins + Math.floor(Math.random() * 2)) * (2 * Math.PI);

    let deltaAngle = (targetOffset - currentBase) + fullSpins;
    if (deltaAngle < fullSpins) deltaAngle += (2 * Math.PI);

    const startAngle = currentAngle;
    const finalAngle = startAngle + deltaAngle;
    const startTime = performance.now();

    let pointerVelocity = 0;
    let pointerAngle = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3.5);
      const angleNow = startAngle + deltaAngle * easeProgress;
      rotationRef.current = angleNow;

      const speedRatio = Math.max(0, (1 - progress) * 2.5);

      const normalized = ((2 * Math.PI) - (angleNow % (2 * Math.PI))) % (2 * Math.PI);
      const currentSector = Math.floor(normalized / arc);

      if (currentSector !== lastSectorRef.current) {
        lastSectorRef.current = currentSector;
        wheelAudio.playTick(speedRatio);
        pointerVelocity = -0.3 * Math.min(speedRatio + 0.4, 1.2);
      }

      pointerAngle += pointerVelocity;
      pointerVelocity += (0 - pointerAngle) * 0.28;
      pointerVelocity *= 0.72;
      pointerDeflectionRef.current = pointerAngle;

      drawWheel();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = finalAngle;
        pointerDeflectionRef.current = 0;
        drawWheel();

        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: theme.colors
        });

        wheelAudio.playVictory();

        const winner = entries[winningIndex] || `Variant ${winningIndex + 1}`;
        onSpinEnd(winner, winningIndex);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [entries, isSpinning, onSpinStart, onSpinEnd, drawWheel, theme.colors, spinSpeed]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full max-w-[620px] aspect-square mx-auto select-none"
    >
      <canvas
        ref={canvasRef}
        onClick={spinWheel}
        className={`w-full h-full block rounded-full ${
          isSpinning ? 'cursor-wait' : 'cursor-pointer hover:scale-[1.01] transition-transform'
        }`}
        style={{ touchAction: 'none' }}
        title="Barabanni aylantirish uchun bosing!"
      />
    </div>
  );
};
