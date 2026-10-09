import React, { useMemo } from 'react';
import { Disc, Zap, Flame, Trophy, Crown, User, Bot, Target } from 'lucide-react';

export interface RacerProgress {
  id: string;
  name: string;
  avatarUrl: string;
  progressPercent: number;
  wpm: number;
  accuracy: number;
  carColor?: string;
  isWinner: boolean;
  isBot?: boolean;
}

interface SingleDrumProps {
  label: string;
  isPlayer: boolean;
  racer: RacerProgress;
  targetText: string;
  typedLen: number;
  typedInput?: string;
  accentColor: 'cyan' | 'amber' | 'purple';
}

const SingleBattleDrum: React.FC<SingleDrumProps> = ({
  label,
  isPlayer,
  racer,
  targetText,
  typedLen,
  typedInput = '',
  accentColor
}) => {
  const svgSize = 340;
  const center = svgSize / 2;
  const radius = 135;
  const hubRadius = 88;
  const angularStep = 6.2; // degrees per character

  // Target text length & progress
  const currentTyped = Math.max(0, Math.min(targetText.length, typedLen));
  const totalChars = targetText.length || 1;
  const progressPercent = Math.min(100, Math.round((currentTyped / totalChars) * 100));

  // Current active word being typed
  const activeWord = useMemo(() => {
    if (!targetText) return '';
    const safeIdx = Math.min(targetText.length - 1, Math.max(0, currentTyped));
    const before = targetText.slice(0, safeIdx);
    const after = targetText.slice(safeIdx);
    const lastSpace = before.lastIndexOf(' ');
    const nextSpace = after.indexOf(' ');
    const start = lastSpace === -1 ? 0 : lastSpace + 1;
    const end = nextSpace === -1 ? targetText.length : safeIdx + nextSpace;
    const word = targetText.slice(start, end).trim();
    return word.length > 10 ? word.slice(0, 9) + '…' : word;
  }, [targetText, currentTyped]);

  // Wheel angle puts current character directly at 12 o'clock (-90 degrees)
  const wheelAngle = -(currentTyped * angularStep);

  // Circular progress stroke
  const hubCircumference = 2 * Math.PI * (hubRadius - 5);
  const strokeDashoffset = hubCircumference - (hubCircumference * progressPercent) / 100;

  // Window of visible characters
  const windowChars = useMemo(() => {
    const behind = 16;
    const ahead = 28;
    const start = Math.max(0, currentTyped - behind);
    const end = Math.min(targetText.length, currentTyped + ahead);

    const items = [];
    for (let i = start; i < end; i++) {
      const char = targetText[i];
      const isTyped = i < currentTyped;
      const isCurrent = i === currentTyped;
      const typedChar = isPlayer ? typedInput[i] : undefined;
      const isCorrect = isTyped && (isPlayer ? typedChar === char : true);
      const isWrong = isTyped && isPlayer && typedChar !== undefined && typedChar !== char;

      const angle = i * angularStep - 90;
      const rad = (angle * Math.PI) / 180;
      const x = center + radius * Math.cos(rad);
      const y = center + radius * Math.sin(rad);
      const rotation = angle + 90;

      items.push({
        index: i,
        char,
        isTyped,
        isCurrent,
        isCorrect,
        isWrong,
        x,
        y,
        rotation
      });
    }
    return items;
  }, [targetText, typedInput, currentTyped, isPlayer, center, radius]);

  // Outer chronograph ticks
  const tickMarks = useMemo(() => {
    const ticks = [];
    const count = 60;
    const rOuter = radius + 18;
    const rInner = radius + 10;
    for (let i = 0; i < count; i++) {
      const deg = (i * 360) / count;
      const rad = (deg * Math.PI) / 180;
      ticks.push({
        x1: center + rOuter * Math.cos(rad),
        y1: center + rOuter * Math.sin(rad),
        x2: center + rInner * Math.cos(rad),
        y2: center + rInner * Math.sin(rad),
        isMajor: i % 5 === 0
      });
    }
    return ticks;
  }, [center, radius]);

  const colorStyles = {
    cyan: {
      ring: 'border-cyan-500/40',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      stroke: '#06b6d4',
      glow: 'shadow-cyan-500/20'
    },
    amber: {
      ring: 'border-amber-500/40',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      stroke: '#f59e0b',
      glow: 'shadow-amber-500/20'
    },
    purple: {
      ring: 'border-purple-500/40',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      stroke: '#a855f7',
      glow: 'shadow-purple-500/20'
    }
  }[accentColor];

  return (
    <div className="flex flex-col items-center flex-1 min-w-[280px] max-w-[420px] w-full">
      {/* Player Header Card */}
      <div className="w-full mb-2.5 p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={racer.avatarUrl}
              alt={racer.name}
              className={`w-10 h-10 rounded-full object-cover border-2 ${colorStyles.ring} bg-[var(--sub-alt)]`}
            />
            {racer.isBot && (
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-purple-600 rounded-full text-white">
                <Bot className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black border ${colorStyles.badge}`}>
                {label}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[var(--text-color)] truncate">
                {racer.name}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--sub-color)] mt-0.5">
              <span>Aniqlik: <strong className="text-[var(--text-color)]">{racer.accuracy}%</strong></span>
            </div>
          </div>
        </div>

        {/* Live WPM & Progress Pill */}
        <div className="text-right shrink-0">
          <div className="text-lg sm:text-xl font-black font-mono text-[var(--text-color)] tracking-tight">
            {racer.wpm} <span className="text-[11px] font-normal text-[var(--sub-color)]">WPM</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[var(--main-color)]">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Rotary Drum SVG Canvas */}
      <div className="relative flex items-center justify-center p-1">
        {/* 12 O'Clock Reticle Pointer (Top Center Indicator) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"
            style={{ borderTopColor: colorStyles.stroke }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: colorStyles.stroke }}
          />
        </div>

        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="overflow-visible select-none max-w-full h-auto drop-shadow-md"
        >
          <defs>
            <radialGradient id={`hubGrad-${accentColor}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--card-bg)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--sub-alt)" stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* Outer Wheel Housing Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 20}
            fill="none"
            stroke="var(--sub-alt)"
            strokeWidth="3"
            opacity="0.6"
          />

          {/* Precision Chronograph Ticks */}
          {tickMarks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="var(--sub-color)"
              strokeWidth={tick.isMajor ? 1.5 : 0.8}
              opacity={tick.isMajor ? 0.5 : 0.25}
            />
          ))}

          {/* Rotary Drum Track (Character Belt Circle) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--sub-color)"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.35"
          />

          {/* Rotating Text Group (Smooth Real-time Motion) */}
          <g
            style={{
              transformOrigin: `${center}px ${center}px`,
              transform: `rotate(${wheelAngle}deg)`,
              transition: 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)'
            }}
          >
            {windowChars.map((item) => {
              let fill = 'var(--sub-color)';
              let weight = '500';
              let scale = 1;

              if (item.isCurrent) {
                fill = colorStyles.stroke;
                weight = '900';
                scale = 1.35;
              } else if (item.isCorrect) {
                fill = '#10b981'; // Emerald
                weight = '700';
              } else if (item.isWrong) {
                fill = '#f43f5e'; // Rose
                weight = '900';
              }

              return (
                <text
                  key={item.index}
                  x={item.x}
                  y={item.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={fill}
                  fontSize={item.isCurrent ? '16' : '13'}
                  fontWeight={weight}
                  fontFamily="monospace"
                  transform={`rotate(${item.rotation}, ${item.x}, ${item.y}) scale(${scale})`}
                  style={{
                    textShadow: item.isCurrent ? `0 0 10px ${colorStyles.stroke}` : 'none'
                  }}
                >
                  {item.char === ' ' ? '␣' : item.char}
                </text>
              );
            })}
          </g>

          {/* Central Hub Disc */}
          <circle
            cx={center}
            cy={center}
            r={hubRadius}
            fill={`url(#hubGrad-${accentColor})`}
            stroke="var(--sub-color)"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />

          {/* Circular Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={hubRadius - 5}
            fill="none"
            stroke={colorStyles.stroke}
            strokeWidth="3.5"
            strokeDasharray={hubCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              transition: 'stroke-dashoffset 0.12s linear',
              filter: `drop-shadow(0 0 4px ${colorStyles.stroke})`
            }}
          />

          {/* Center Hub Metrics */}
          <text
            x={center}
            y={center - 32}
            textAnchor="middle"
            fill="var(--sub-color)"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="1"
          >
            {label.toUpperCase()}
          </text>

          {activeWord && (
            <text
              x={center}
              y={center - 16}
              textAnchor="middle"
              fill={colorStyles.stroke}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {`"${activeWord}"`}
            </text>
          )}

          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            fill="var(--text-color)"
            fontSize="26"
            fontFamily="monospace"
            fontWeight="900"
          >
            {racer.wpm}
          </text>

          <text
            x={center}
            y={center + 24}
            textAnchor="middle"
            fill="var(--sub-color)"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            WPM TEZLIK
          </text>

          <text
            x={center}
            y={center + 42}
            textAnchor="middle"
            fill={colorStyles.stroke}
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {currentTyped} / {totalChars} belgi
          </text>
        </svg>
      </div>
    </div>
  );
};

interface DualBattleDrumViewProps {
  player1: RacerProgress;
  player2: RacerProgress;
  targetText: string;
  player1TypedLen: number;
  player2TypedLen: number;
  player1Input?: string;
  timeLeft?: number;
  totalDuration?: number;
  isRacing: boolean;
}

export const DualBattleDrumView: React.FC<DualBattleDrumViewProps> = ({
  player1,
  player2,
  targetText,
  player1TypedLen,
  player2TypedLen,
  player1Input = '',
  timeLeft,
  totalDuration,
  isRacing
}) => {
  const wpmDiff = Math.abs(player1.wpm - player2.wpm);
  const player1Leading = player1.wpm > player2.wpm;
  const player2Leading = player2.wpm > player1.wpm;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Central Duel Status Bar */}
      <div className="w-full max-w-xl mx-auto px-4 py-2.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30">
            <Disc className="w-3.5 h-3.5 animate-spin [animation-duration:8s]" />
            <span>2X BARABAN DUELI</span>
          </span>
          <span className="hidden sm:inline text-[var(--sub-color)]">
            • Bir xil matn, teng shartlar
          </span>
        </div>

        {/* Live Race Gap & Timer Indicator */}
        <div className="flex items-center gap-3">
          {timeLeft !== undefined && (
            <span
              className={`font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                totalDuration && timeLeft <= 5
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className="text-xs">⏱️</span>
              <span>
                {timeLeft}s
                {totalDuration ? ` / ${totalDuration}s` : ''}
              </span>
            </span>
          )}

          {isRacing && (
            <span className="font-bold">
              {player1Leading && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Siz +{wpmDiff} WPM oldindasiz!
                </span>
              )}
              {player2Leading && (
                <span className="text-rose-400 flex items-center gap-1">
                  Raqib +{wpmDiff} WPM oldinda
                </span>
              )}
              {!player1Leading && !player2Leading && (
                <span className="text-cyan-400">Tengma-teng kurash!</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Main Dual Drum Stage: Side-by-Side Containers */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 max-w-6xl mx-auto">
        {/* 1. Player 1 Drum (Siz / Host) */}
        <SingleBattleDrum
          label="Siz"
          isPlayer={true}
          racer={player1}
          targetText={targetText}
          typedLen={player1TypedLen}
          typedInput={player1Input}
          accentColor="cyan"
        />

        {/* Central VS Divider Badge */}
        <div className="shrink-0 flex flex-col items-center justify-center my-2 md:my-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-slate-950 font-black font-mono text-sm flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50">
            VS
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--sub-color)] mt-1 uppercase tracking-widest">
            BATTLE
          </span>
        </div>

        {/* 2. Player 2 Drum (Raqib / Dushman / Cyber Bot) */}
        <SingleBattleDrum
          label={player2.isBot ? 'Cyber Bot' : 'Raqib'}
          isPlayer={false}
          racer={player2}
          targetText={targetText}
          typedLen={player2TypedLen}
          accentColor={player2.isBot ? 'purple' : 'amber'}
        />
      </div>
    </div>
  );
};
