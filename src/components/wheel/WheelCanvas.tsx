import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WheelTheme, getContrastColor } from './wheelThemes';
import { wheelAudio } from './wheelAudio';
import confetti from 'canvas-confetti';

interface WheelCanvasProps {
  entries: string[];
  theme: WheelTheme;
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: string, index: number) => void;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  entries,
  theme,
  isSpinning,
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

    // 1. Draw outer ambient shadow & rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = theme.outerBorderColor;
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 24;
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

      // Ensure adjacent slices don't have matching color
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
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

    // Hub Outer Ring
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = theme.hubColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = theme.hubBorderColor;
    ctx.stroke();

    // Inner Button Ring
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius * 0.76, 0, 2 * Math.PI);
    ctx.fillStyle = theme.hubBorderColor;
    ctx.fill();

    // Hub Text "AYLANTIR"
    ctx.fillStyle = theme.hubColor;
    const hubFontSize = Math.max(10, Math.floor(hubRadius * 0.32));
    ctx.font = `900 ${hubFontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AYLANTIR', 0, 0);

    ctx.restore();

    // 4. Draw Right Pointer Arrow (at 3 o'clock, pointing leftwards)
    // Ticker angle deflection simulates physical click peg
    const pointerDeflection = pointerDeflectionRef.current;
    ctx.save();
    const pointerTipX = centerX + outerRadius + 2;
    const pointerTipY = centerY;

    ctx.translate(pointerTipX, pointerTipY);
    ctx.rotate(pointerDeflection);

    ctx.beginPath();
    // Wedge pointing leftwards into the wheel
    ctx.moveTo(0, 0);
    ctx.lineTo(24, -14);
    ctx.lineTo(28, -10);
    ctx.lineTo(28, 10);
    ctx.lineTo(24, 14);
    ctx.closePath();

    ctx.fillStyle = theme.pointerColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = theme.pointerAccent;
    ctx.stroke();

    // Pointer pivot pin
    ctx.beginPath();
    ctx.arc(22, 0, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }, [canvasSize, entries, theme]);

  // Redraw whenever canvas size, theme, or entries change
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Physical Spin Animation Routine
  const spinWheel = useCallback(() => {
    if (isSpinning || entries.length === 0) return;

    onSpinStart();

    const count = entries.length;
    const arc = (2 * Math.PI) / count;

    // Pick random target winner
    const winningIndex = Math.floor(Math.random() * count);

    // Calculate target angle so the winning slice lands at pointer (3 o'clock / angle 0)
    // Pointer is at angle 0. Slice i covers [i*arc, (i+1)*arc].
    // Center of slice i is (i + 0.5) * arc.
    // To land slice center at 0, wheel rotation mod 2PI must be: 2PI - (i + 0.5)*arc
    const currentAngle = rotationRef.current;
    const currentBase = currentAngle % (2 * Math.PI);
    const targetSliceCenter = (winningIndex + 0.5) * arc;
    const targetOffset = (2 * Math.PI) - targetSliceCenter;

    // Spin multiple full revolutions for drama (between 6 and 9 full turns)
    const fullSpins = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);

    // Total delta angle to rotate
    let deltaAngle = (targetOffset - currentBase) + fullSpins;
    if (deltaAngle < fullSpins) deltaAngle += (2 * Math.PI);

    const startAngle = currentAngle;
    const finalAngle = startAngle + deltaAngle;
    const duration = 6500; // 6.5 seconds smooth realistic spin
    const startTime = performance.now();

    // Spring physics for ticker pointer bounce
    let pointerVelocity = 0;
    let pointerAngle = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic with slight deceleration curve
      // f(t) = 1 - (1 - t)^3.6
      const easeProgress = 1 - Math.pow(1 - progress, 3.6);
      const angleNow = startAngle + deltaAngle * easeProgress;
      rotationRef.current = angleNow;

      // Calculate instantaneous angular velocity
      const speedRatio = Math.max(0, (1 - progress) * 2.5);

      // Check which sector boundary is passing pointer (3 o'clock = angle 0)
      const normalized = ((2 * Math.PI) - (angleNow % (2 * Math.PI))) % (2 * Math.PI);
      const currentSector = Math.floor(normalized / arc);

      if (currentSector !== lastSectorRef.current) {
        lastSectorRef.current = currentSector;
        // Trigger mechanical tick sound
        wheelAudio.playTick(speedRatio);

        // Pointer bounces upwards when sector line strikes peg
        pointerVelocity = -0.32 * Math.min(speedRatio + 0.4, 1.2);
      }

      // Pointer spring physics
      pointerAngle += pointerVelocity;
      pointerVelocity += (0 - pointerAngle) * 0.28; // Spring force towards 0
      pointerVelocity *= 0.72; // Damping
      pointerDeflectionRef.current = pointerAngle;

      drawWheel();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        rotationRef.current = finalAngle;
        pointerDeflectionRef.current = 0;
        drawWheel();

        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: theme.colors
        });

        // Play victory sound
        wheelAudio.playVictory();

        // Notify parent
        const winner = entries[winningIndex] || `Variant ${winningIndex + 1}`;
        onSpinEnd(winner, winningIndex);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [entries, isSpinning, onSpinStart, onSpinEnd, drawWheel, theme.colors]);

  // Clean up animation on unmount
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
        className={`w-full h-full block rounded-full transition-transform ${
          isSpinning ? 'cursor-wait' : 'cursor-pointer hover:scale-[1.01]'
        }`}
        style={{ touchAction: 'none' }}
        title="Barabanni aylantirish uchun bosing!"
      />
    </div>
  );
};
