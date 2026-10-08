import React, { useMemo, useState } from 'react';
import { Disc, RotateCcw, Eye, Sparkles, ChevronRight, Gauge, Layers } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface DrumTapeViewProps {
  targetText: string;
  typedInput: string;
  parsedWords: Array<{
    wordIdx: number;
    chars: Array<{ char: string; globalIndex: number }>;
    spaceGlobalIndex: number | null;
  }>;
  currentTypedLen: number;
  activeWordIdx: number;
  isFocused: boolean;
  isTestFinished: boolean;
  onFocusRequest: () => void;
  onRestart: () => void;
  liveWpm?: number;
  isTestActive?: boolean;
}

export const DrumTapeView: React.FC<DrumTapeViewProps> = ({
  targetText,
  typedInput,
  parsedWords,
  currentTypedLen,
  activeWordIdx,
  isFocused,
  isTestFinished,
  onFocusRequest,
  onRestart,
  liveWpm,
  isTestActive
}) => {
  const { fontFamily, fontSize, smoothCaret } = useSettings();

  // Drum display settings: 3D perspective or flat dial, size mode
  const [drumPerspective3D, setDrumPerspective3D] = useState<boolean>(false);
  const [drumScale, setDrumScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [showWordHelper, setShowWordHelper] = useState<boolean>(true);

  // Wheel geometry calculations
  const radius = drumScale === 'sm' ? 145 : drumScale === 'lg' ? 195 : 170;
  const hubRadius = drumScale === 'sm' ? 95 : drumScale === 'lg' ? 135 : 115;
  const svgSize = drumScale === 'sm' ? 380 : drumScale === 'lg' ? 480 : 430;
  const center = svgSize / 2;

  // Angular spacing per character (degrees)
  const angularStep = drumScale === 'sm' ? 5.8 : drumScale === 'lg' ? 4.8 : 5.2;

  // Current wheel rotation angle (brings active character directly to 12 o'clock / -90°)
  const wheelAngle = -(currentTypedLen * angularStep);

  // Target text length & progress
  const totalChars = targetText.length || 1;
  const progressPercent = Math.min(100, Math.round((currentTypedLen / totalChars) * 100));

  // Circular progress stroke calculation for central hub
  const hubCircumference = 2 * Math.PI * (hubRadius - 6);
  const strokeDashoffset = hubCircumference - (hubCircumference * progressPercent) / 100;

  // Current active word for preview in hub
  const activeWord = parsedWords[activeWordIdx];

  // Visible character window around currentTypedLen (renders ~60 characters for peak GPU performance)
  const windowChars = useMemo(() => {
    const behind = drumScale === 'sm' ? 20 : 25;
    const ahead = drumScale === 'sm' ? 32 : 40;
    const start = Math.max(0, currentTypedLen - behind);
    const end = Math.min(targetText.length, currentTypedLen + ahead);

    const items = [];
    for (let i = start; i < end; i++) {
      const char = targetText[i];
      const typedChar = typedInput[i];
      const isTyped = i < currentTypedLen;
      const isCurrent = i === currentTypedLen;
      const isCorrect = isTyped && typedChar === char;
      const isWrong = isTyped && typedChar !== char;

      // Angular position on the unrotated wheel (0 deg is right, -90 deg is top)
      const angle = i * angularStep - 90;
      const rad = (angle * Math.PI) / 180;
      const x = center + radius * Math.cos(rad);
      const y = center + radius * Math.sin(rad);

      // Tangent rotation: so characters naturally curve along the perimeter
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
  }, [targetText, typedInput, currentTypedLen, angularStep, center, radius, drumScale]);

  // Tick marks around the outer perimeter (precision mechanical chronograph styling)
  const tickMarks = useMemo(() => {
    const ticks = [];
    const tickCount = 72; // every 5 degrees
    const rOuter = radius + 24;
    const rInnerMajor = radius + 14;
    const rInnerMinor = radius + 18;

    for (let i = 0; i < tickCount; i++) {
      const deg = (i * 360) / tickCount;
      const rad = (deg * Math.PI) / 180;
      const isMajor = i % 6 === 0; // every 30 degrees
      const isQuarter = i % 18 === 0; // 0, 90, 180, 270 deg
      const rIn = isMajor ? rInnerMajor : rInnerMinor;

      const x1 = center + rOuter * Math.cos(rad);
      const y1 = center + rOuter * Math.sin(rad);
      const x2 = center + rIn * Math.cos(rad);
      const y2 = center + rIn * Math.sin(rad);

      ticks.push({
        deg,
        x1,
        y1,
        x2,
        y2,
        isMajor,
        isQuarter
      });
    }
    return ticks;
  }, [center, radius]);

  // Live calculation of typed accuracy
  const accuracy = useMemo(() => {
    if (currentTypedLen === 0) return 100;
    let correct = 0;
    for (let i = 0; i < currentTypedLen; i++) {
      if (typedInput[i] === targetText[i]) correct++;
    }
    return Math.max(0, Math.round((correct / currentTypedLen) * 100));
  }, [typedInput, targetText, currentTypedLen]);

  return (
    <div
      onClick={onFocusRequest}
      className="relative flex flex-col items-center justify-center select-none py-2 w-full transition-all"
    >
      {/* Top Baraban Status & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-xl px-3 mb-2 text-xs font-mono text-[var(--sub-color)]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--sub-alt)]/60 border border-[var(--sub-color)]/20 text-[var(--text-color)] font-semibold">
            <Disc className="w-3.5 h-3.5 text-[var(--main-color)] animate-spin [animation-duration:12s]" />
            <span>BARABAN REJIMI</span>
          </span>
          <span className="hidden sm:inline-block opacity-60 text-[11px]">
            • Aylana bo‘ylab yozish
          </span>
        </div>

        {/* Mini Drum Toolbar */}
        <div className="flex items-center gap-1.5 bg-[var(--sub-alt)]/40 p-1 rounded-xl border border-[var(--sub-color)]/10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDrumPerspective3D((p) => !p);
            }}
            className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              drumPerspective3D
                ? 'bg-[var(--main-color)] text-white font-bold'
                : 'hover:text-[var(--text-color)]'
            }`}
            title="3D Silindr baraban perspektivasi"
          >
            {drumPerspective3D ? '3D Silindr' : '2D Disk'}
          </button>

          <span className="opacity-30">•</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDrumScale((s) => (s === 'sm' ? 'md' : s === 'md' ? 'lg' : 'sm'));
            }}
            className="px-2 py-0.5 rounded-md text-[11px] font-mono hover:text-[var(--text-color)] transition-colors cursor-pointer"
            title="Baraban o'lchami"
          >
            {drumScale === 'sm' ? 'Kichik' : drumScale === 'md' ? 'O‘rtacha' : 'Katta'}
          </button>

          <span className="opacity-30">•</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowWordHelper((h) => !h);
            }}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              showWordHelper ? 'text-[var(--main-color)]' : 'opacity-40 hover:opacity-80'
            }`}
            title="So'z ko'rsatkichi yordamchisi"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Baraban Mechanical Housing */}
      <div
        className="relative flex items-center justify-center overflow-visible my-1"
        style={{
          perspective: drumPerspective3D ? '850px' : 'none'
        }}
      >
        <div
          className="relative transition-transform duration-300 ease-out max-w-[92vw] sm:max-w-none flex items-center justify-center"
          style={{
            transform: drumPerspective3D ? 'rotateX(22deg) scale(0.96)' : 'none',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* SVG Drum Wheel */}
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="overflow-visible drop-shadow-md select-none max-w-full h-auto"
          >
            <defs>
              {/* Radial gradient for central hub (Monochrome / Ranglarsiz titanium glass) */}
              <radialGradient id="hubGlassGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--sub-alt)" stopOpacity="0.85" />
                <stop offset="75%" stopColor="var(--card-bg)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="var(--bg-color)" stopOpacity="0.98" />
              </radialGradient>

              {/* Subtle mechanical track gradient */}
              <radialGradient id="trackGradient" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="85%" stopColor="var(--sub-alt)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Monochrome reticle glow */}
              <filter id="reticleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* STATIC BACKGROUND: Outer Bezels & Mechanical Tick Dial */}
            {/* Outer Bezel Border */}
            <circle
              cx={center}
              cy={center}
              r={radius + 30}
              fill="none"
              stroke="var(--sub-color)"
              strokeOpacity="0.2"
              strokeWidth="1.2"
            />
            <circle
              cx={center}
              cy={center}
              r={radius + 28}
              fill="none"
              stroke="var(--sub-color)"
              strokeOpacity="0.1"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />

            {/* Circular Track Groove behind text */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#trackGradient)"
              strokeWidth={drumScale === 'sm' ? 28 : 34}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--sub-color)"
              strokeOpacity="0.12"
              strokeWidth="1"
              strokeDasharray="2 6"
            />

            {/* Outer Graduation Tick Marks */}
            <g opacity="0.45">
              {tickMarks.map((t, idx) => (
                <line
                  key={`tick-${idx}`}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.isQuarter ? 'var(--text-color)' : 'var(--sub-color)'}
                  strokeWidth={t.isQuarter ? 1.6 : t.isMajor ? 1.2 : 0.8}
                  strokeOpacity={t.isQuarter ? 0.9 : t.isMajor ? 0.6 : 0.3}
                />
              ))}
            </g>

            {/* Cardinal Degree Labels (Monochrome laser-etched markings) */}
            <g
              fontSize="8"
              fontFamily="monospace"
              fill="var(--sub-color)"
              opacity="0.5"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <text x={center} y={center - radius - 20}>000°</text>
              <text x={center + radius + 20} y={center + 3}>090°</text>
              <text x={center} y={center + radius + 22}>180°</text>
              <text x={center - radius - 20} y={center + 3}>270°</text>
            </g>

            {/* ROTATING DRUM WHEEL (GPU Accelerated Transform) */}
            <g
              transform={`rotate(${wheelAngle} ${center} ${center})`}
              style={{
                transition: smoothCaret
                  ? 'transform 95ms cubic-bezier(0.2, 0, 0, 1)'
                  : 'none',
                willChange: 'transform'
              }}
            >
              {/* Rotating fine radial spokes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={`spoke-${deg}`}
                  x1={center + hubRadius * Math.cos((deg * Math.PI) / 180)}
                  y1={center + hubRadius * Math.sin((deg * Math.PI) / 180)}
                  x2={center + (radius - 16) * Math.cos((deg * Math.PI) / 180)}
                  y2={center + (radius - 16) * Math.sin((deg * Math.PI) / 180)}
                  stroke="var(--sub-color)"
                  strokeOpacity="0.08"
                  strokeWidth="0.8"
                />
              ))}

              {/* Characters Placed on the Drum Perimeter */}
              {windowChars.map((item) => {
                // Formatting for space characters
                const isSpace = item.char === ' ';
                const displayChar = isSpace ? '·' : item.char;

                // Color & styling: strictly monochrome/clean theme palette
                let charFill = 'var(--text-color)';
                let charOpacity = 0.8;
                let fontWeight = '500';

                if (item.isCurrent) {
                  charFill = 'var(--text-color)';
                  charOpacity = 1;
                  fontWeight = '800';
                } else if (item.isCorrect) {
                  charFill = 'var(--sub-color)';
                  charOpacity = 0.45;
                } else if (item.isWrong) {
                  charFill = '#ef4444';
                  charOpacity = 1;
                  fontWeight = '700';
                } else if (!item.isTyped) {
                  charFill = 'var(--text-color)';
                  charOpacity = 0.75;
                }

                const charFontSize = item.isCurrent
                  ? Math.max(18, (fontSize || 22) + 2)
                  : Math.max(15, fontSize || 20);

                return (
                  <g
                    key={`c-${item.index}`}
                    transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation})`}
                  >
                    {/* Active letter background highlight capsule */}
                    {item.isCurrent && (
                      <rect
                        x="-12"
                        y="-16"
                        width="24"
                        height="32"
                        rx="6"
                        fill="var(--sub-alt)"
                        stroke="var(--sub-color)"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />
                    )}

                    {/* Wrong letter strike indicator */}
                    {item.isWrong && (
                      <line
                        x1="-7"
                        y1="12"
                        x2="7"
                        y2="12"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Character Text */}
                    <text
                      x="0"
                      y={isSpace ? '-1' : '5'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={charFill}
                      opacity={charOpacity}
                      fontWeight={fontWeight}
                      fontSize={charFontSize}
                      fontFamily={fontFamily || 'monospace'}
                      className="transition-opacity duration-75"
                    >
                      {displayChar}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* STATIC RETICLE: 12 O'CLOCK READING HEAD & FOCAL CALIPERS */}
            {/* Top focal capsule lens */}
            <g transform={`translate(${center}, ${center - radius})`}>
              {/* Vertical reticle needle tick pointing from top */}
              <line
                x1="0"
                y1="-22"
                x2="0"
                y2="-12"
                stroke="var(--text-color)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polygon
                points="-4,-12 4,-12 0,-7"
                fill="var(--text-color)"
              />

              {/* Caliper brackets around active letter [  ] */}
              <path
                d="M -14 -12 L -18 -12 L -18 12 L -14 12"
                fill="none"
                stroke="var(--text-color)"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />
              <path
                d="M 14 -12 L 18 -12 L 18 12 L 14 12"
                fill="none"
                stroke="var(--text-color)"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />

              {/* Bottom guide notch */}
              <line
                x1="0"
                y1="12"
                x2="0"
                y2="17"
                stroke="var(--text-color)"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />
            </g>

            {/* CENTRAL HUB (Minimalist Instrument Cluster) */}
            {/* Inner Hub Shadow Ring */}
            <circle
              cx={center}
              cy={center}
              r={hubRadius + 2}
              fill="none"
              stroke="var(--sub-color)"
              strokeOpacity="0.18"
              strokeWidth="1.5"
            />

            {/* Inner Hub Disc */}
            <circle
              cx={center}
              cy={center}
              r={hubRadius}
              fill="url(#hubGlassGradient)"
              stroke="var(--sub-alt)"
              strokeWidth="2"
            />

            {/* Progress Track Background Arc */}
            <circle
              cx={center}
              cy={center}
              r={hubRadius - 6}
              fill="none"
              stroke="var(--sub-alt)"
              strokeWidth="3"
            />

            {/* Active Progress Stroke Arc */}
            <circle
              cx={center}
              cy={center}
              r={hubRadius - 6}
              fill="none"
              stroke="var(--text-color)"
              strokeWidth="3.5"
              strokeDasharray={hubCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>

          {/* HTML CENTRAL HUB CONTENT (Positioned Absolutely in Center of Hub) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center"
            style={{
              padding: `${hubRadius * 0.25}px`
            }}
          >
            {/* Header: Progress or Baraban label */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-[var(--sub-color)] opacity-75 mb-0.5">
              <span>BARABAN</span>
              <span>•</span>
              <span>{progressPercent}%</span>
            </div>

            {/* Main Digital Readout: Current Target Char / Word Indicator */}
            {isTestFinished ? (
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold font-mono text-[var(--text-color)]">
                  YAKUNLANDI
                </span>
                <span className="text-xs font-mono text-[var(--sub-color)] mt-1">
                  {accuracy}% aniqlik
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Focal Character Badge */}
                <div className="flex items-center justify-center w-12 h-10 rounded-xl bg-[var(--sub-alt)]/70 border border-[var(--sub-color)]/25 mb-1.5 shadow-inner">
                  <span className="font-mono text-2xl font-black text-[var(--text-color)]">
                    {currentTypedLen < targetText.length
                      ? targetText[currentTypedLen] === ' '
                        ? '␣'
                        : targetText[currentTypedLen]
                      : '✓'}
                  </span>
                </div>

                {/* Subtext: Key hint */}
                <div className="text-[11px] font-mono text-[var(--sub-color)] flex items-center gap-1">
                  <span>
                    {currentTypedLen < targetText.length && targetText[currentTypedLen] === ' '
                      ? 'Probel (Space)'
                      : `Belgi #${currentTypedLen + 1}`}
                  </span>
                </div>
              </div>
            )}

            {/* Word Preview Helper in Hub (if enabled) */}
            {showWordHelper && activeWord && !isTestFinished && (
              <div className="mt-2.5 px-3 py-1 rounded-lg bg-[var(--bg-color)]/80 border border-[var(--sub-color)]/15 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                <div className="font-mono text-xs tracking-wide">
                  {activeWord.chars.map((c) => {
                    const isPassed = c.globalIndex < currentTypedLen;
                    const isCurr = c.globalIndex === currentTypedLen;
                    return (
                      <span
                        key={`w-h-${c.globalIndex}`}
                        className={`${
                          isCurr
                            ? 'text-[var(--text-color)] font-black underline decoration-2'
                            : isPassed
                            ? 'text-[var(--sub-color)]/50'
                            : 'text-[var(--text-color)]/80'
                        }`}
                      >
                        {c.char}
                      </span>
                    );
                  })}
                  {activeWord.spaceGlobalIndex !== null && (
                    <span
                      className={`text-[10px] ml-0.5 ${
                        activeWord.spaceGlobalIndex === currentTypedLen
                          ? 'text-[var(--text-color)] font-bold'
                          : 'text-[var(--sub-color)]/40'
                      }`}
                    >
                      ␣
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Minimalist Helper Strip */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 text-xs font-mono text-[var(--sub-color)] opacity-75">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[10px] text-[var(--text-color)]">
            ␣ Space
          </kbd>
          <span>so‘z orasi</span>
        </span>
        <span className="hidden sm:inline-block opacity-40">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] border border-[var(--sub-color)]/20 text-[10px] text-[var(--text-color)]">
            Tab
          </kbd>
          <span>qayta boshlash</span>
        </span>
        <span className="hidden sm:inline-block opacity-40">•</span>
        <span className="flex items-center gap-1">
          <span>{currentTypedLen} / {targetText.length} belgi</span>
        </span>
      </div>
    </div>
  );
};
