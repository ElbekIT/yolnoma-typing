import React, { useMemo, useState, useEffect, memo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Eye, EyeOff, Sparkles, HelpCircle } from 'lucide-react';

interface InteractiveHandsGuideProps {
  activeChar?: string;
  onToggleGuide?: () => void;
}

type FingerId =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'left-thumb'
  | 'right-thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

interface KeyCoord {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  finger: FingerId;
}

// Finger anatomical info for UI
const FINGER_NAMES: Record<FingerId, { uz: string; hand: string }> = {
  'left-pinky': { uz: 'Jimjiloq', hand: 'Chap qoʻl' },
  'left-ring': { uz: 'Nomsiz barmoq', hand: 'Chap qoʻl' },
  'left-middle': { uz: 'Oʻrta barmoq', hand: 'Chap qoʻl' },
  'left-index': { uz: 'Koʻrsatkich barmoq', hand: 'Chap qoʻl' },
  'left-thumb': { uz: 'Bosh barmoq', hand: 'Chap qoʻl' },
  'right-thumb': { uz: 'Bosh barmoq', hand: 'Oʻng qoʻl' },
  'right-index': { uz: 'Koʻrsatkich barmoq', hand: 'Oʻng qoʻl' },
  'right-middle': { uz: 'Oʻrta barmoq', hand: 'Oʻng qoʻl' },
  'right-ring': { uz: 'Nomsiz barmoq', hand: 'Oʻng qoʻl' },
  'right-pinky': { uz: 'Jimjiloq', hand: 'Oʻng qoʻl' }
};

// Finger wrist/knuckle base anchor coordinates on SVG canvas (viewBox 0 0 1000 440)
const FINGER_BASE_ANCHORS: Record<FingerId, { wristX: number; wristY: number; knuckleX: number; knuckleY: number; homeX: number; homeY: number }> = {
  'left-pinky':  { wristX: 200, wristY: 430, knuckleX: 230, knuckleY: 330, homeX: 250, homeY: 205 }, // A
  'left-ring':   { wristX: 230, wristY: 430, knuckleX: 275, knuckleY: 310, homeX: 300, homeY: 205 }, // S
  'left-middle': { wristX: 260, wristY: 430, knuckleX: 325, knuckleY: 300, homeX: 350, homeY: 205 }, // D
  'left-index':  { wristX: 290, wristY: 430, knuckleX: 375, knuckleY: 305, homeX: 400, homeY: 205 }, // F
  'left-thumb':  { wristX: 330, wristY: 430, knuckleX: 410, knuckleY: 360, homeX: 440, homeY: 290 }, // Space Left

  'right-thumb':  { wristX: 670, wristY: 430, knuckleX: 590, knuckleY: 360, homeX: 560, homeY: 290 }, // Space Right
  'right-index':  { wristX: 710, wristY: 430, knuckleX: 625, knuckleY: 305, homeX: 600, homeY: 205 }, // J
  'right-middle': { wristX: 740, wristY: 430, knuckleX: 675, knuckleY: 300, homeX: 650, homeY: 205 }, // K
  'right-ring':   { wristX: 770, wristY: 430, knuckleX: 725, knuckleY: 310, homeX: 700, homeY: 205 }, // L
  'right-pinky':  { wristX: 800, wristY: 430, knuckleX: 770, knuckleY: 330, homeX: 750, homeY: 205 }  // ;
};

// Generate standard keyboard layout keys with pixel-precise centers
function buildKeyboardKeys(): KeyCoord[] {
  const keys: KeyCoord[] = [];
  const startX = 145;
  const startY = 85;
  const keyW = 44;
  const keyH = 40;
  const gap = 6;

  // Row 0: Numbers
  const r0 = [
    { id: '`', label: '`', f: 'left-pinky' },
    { id: '1', label: '1', f: 'left-pinky' },
    { id: '2', label: '2', f: 'left-ring' },
    { id: '3', label: '3', f: 'left-middle' },
    { id: '4', label: '4', f: 'left-index' },
    { id: '5', label: '5', f: 'left-index' },
    { id: '6', label: '6', f: 'right-index' },
    { id: '7', label: '7', f: 'right-index' },
    { id: '8', label: '8', f: 'right-middle' },
    { id: '9', label: '9', f: 'right-ring' },
    { id: '0', label: '0', f: 'right-pinky' },
    { id: '-', label: '-', f: 'right-pinky' },
    { id: '=', label: '=', f: 'right-pinky' },
    { id: 'backspace', label: '⌫', f: 'right-pinky', w: 70 }
  ];
  let curX = startX;
  r0.forEach((k) => {
    const w = (k as any).w || keyW;
    keys.push({ id: k.id, label: k.label, x: curX, y: startY, w, h: keyH, finger: k.f as FingerId });
    curX += w + gap;
  });

  // Row 1: QWERTY
  const r1 = [
    { id: 'tab', label: 'Tab', f: 'left-pinky', w: 65 },
    { id: 'q', label: 'q', f: 'left-pinky' },
    { id: 'w', label: 'w', f: 'left-ring' },
    { id: 'e', label: 'e', f: 'left-middle' },
    { id: 'r', label: 'r', f: 'left-index' },
    { id: 't', label: 't', f: 'left-index' },
    { id: 'y', label: 'y', f: 'right-index' },
    { id: 'u', label: 'u', f: 'right-index' },
    { id: 'i', label: 'i', f: 'right-middle' },
    { id: 'o', label: 'o', f: 'right-ring' },
    { id: 'p', label: 'p', f: 'right-pinky' },
    { id: '[', label: '[', f: 'right-pinky' },
    { id: ']', label: ']', f: 'right-pinky' },
    { id: '\\', label: '\\', f: 'right-pinky', w: 49 }
  ];
  curX = startX;
  const y1 = startY + keyH + gap;
  r1.forEach((k) => {
    const w = (k as any).w || keyW;
    keys.push({ id: k.id, label: k.label, x: curX, y: y1, w, h: keyH, finger: k.f as FingerId });
    curX += w + gap;
  });

  // Row 2: ASDF (Home row)
  const r2 = [
    { id: 'caps', label: 'Caps', f: 'left-pinky', w: 75 },
    { id: 'a', label: 'a', f: 'left-pinky' },
    { id: 's', label: 's', f: 'left-ring' },
    { id: 'd', label: 'd', f: 'left-middle' },
    { id: 'f', label: 'f', f: 'left-index' },
    { id: 'g', label: 'g', f: 'left-index' },
    { id: 'h', label: 'h', f: 'right-index' },
    { id: 'j', label: 'j', f: 'right-index' },
    { id: 'k', label: 'k', f: 'right-middle' },
    { id: 'l', label: 'l', f: 'right-ring' },
    { id: ';', label: ';', f: 'right-pinky' },
    { id: "'", label: "'", f: 'right-pinky' },
    { id: 'enter', label: 'Enter', f: 'right-pinky', w: 89 }
  ];
  curX = startX;
  const y2 = y1 + keyH + gap;
  r2.forEach((k) => {
    const w = (k as any).w || keyW;
    keys.push({ id: k.id, label: k.label, x: curX, y: y2, w, h: keyH, finger: k.f as FingerId });
    curX += w + gap;
  });

  // Row 3: ZXCV
  const r3 = [
    { id: 'shift_l', label: 'Shift', f: 'left-pinky', w: 98 },
    { id: 'z', label: 'z', f: 'left-pinky' },
    { id: 'x', label: 'x', f: 'left-ring' },
    { id: 'c', label: 'c', f: 'left-middle' },
    { id: 'v', label: 'v', f: 'left-index' },
    { id: 'b', label: 'b', f: 'left-index' },
    { id: 'n', label: 'n', f: 'right-index' },
    { id: 'm', label: 'm', f: 'right-index' },
    { id: ',', label: ',', f: 'right-middle' },
    { id: '.', label: '.', f: 'right-ring' },
    { id: '/', label: '/', f: 'right-pinky' },
    { id: 'shift_r', label: 'Shift', f: 'right-pinky', w: 116 }
  ];
  curX = startX;
  const y3 = y2 + keyH + gap;
  r3.forEach((k) => {
    const w = (k as any).w || keyW;
    keys.push({ id: k.id, label: k.label, x: curX, y: y3, w, h: keyH, finger: k.f as FingerId });
    curX += w + gap;
  });

  // Row 4: Space bar row
  const y4 = y3 + keyH + gap;
  keys.push({ id: 'ctrl_l', label: 'Ctrl', x: startX, y: y4, w: 60, h: keyH, finger: 'left-pinky' });
  keys.push({ id: 'alt_l', label: 'Alt', x: startX + 66, y: y4, w: 55, h: keyH, finger: 'left-thumb' });
  keys.push({ id: 'space', label: 'Space', x: startX + 127, y: y4, w: 295, h: keyH, finger: 'left-thumb' });
  keys.push({ id: 'alt_r', label: 'Alt', x: startX + 428, y: y4, w: 55, h: keyH, finger: 'right-thumb' });
  keys.push({ id: 'ctrl_r', label: 'Ctrl', x: startX + 489, y: y4, w: 60, h: keyH, finger: 'right-pinky' });

  return keys;
}

const ALL_KEYS = buildKeyboardKeys();

export const InteractiveHandsGuide: React.FC<InteractiveHandsGuideProps> = memo(({
  activeChar,
  onToggleGuide
}) => {
  const { handsGuide, setHandsGuide } = useSettings();
  const [pressedKeyId, setPressedKeyId] = useState<string | null>(null);

  // Normalize target active char to match standard keyboard keys
  const targetKeyInfo = useMemo(() => {
    if (!activeChar) return null;
    const ch = activeChar.toLowerCase();

    if (ch === ' ' || ch === '\u00A0') {
      return { keyId: 'space', finger: 'right-thumb' as FingerId, char: 'Boʻshliq' };
    }

    // Uzbek letters mapping
    if (ch === 'ç') return { keyId: 'c', finger: 'left-middle' as FingerId, char: 'ç (c)' };
    if (ch === 'ş') return { keyId: 's', finger: 'left-ring' as FingerId, char: 'ş (s)' };
    if (ch === 'ğ') return { keyId: 'g', finger: 'left-index' as FingerId, char: 'ğ (g)' };
    if (ch === 'õ' || ch === 'ö') return { keyId: 'o', finger: 'right-ring' as FingerId, char: 'õ (o)' };

    // Apostrophe variants
    if ("'ʻʼ`´’‘".includes(ch)) {
      return { keyId: "'", finger: 'right-pinky' as FingerId, char: "'" };
    }

    // Cyrillic to phonetic / Latin equivalent keys for hands guidance
    const cyrillicMap: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'j',
      з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
      ч: 'c', ш: 's', щ: 's', ъ: "'", ь: "'", э: 'e', ю: 'u', я: 'a',
      ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h'
    };
    const mappedCh = cyrillicMap[ch] || ch;

    const found = ALL_KEYS.find((k) => k.id === mappedCh || k.label.toLowerCase() === mappedCh);
    if (found) {
      return { keyId: found.id, finger: found.finger, char: activeChar };
    }

    return null;
  }, [activeChar]);

  // Real-time hardware keypress listening for physical feedback
  useEffect(() => {
    if (!handsGuide) return;

    let timer: NodeJS.Timeout;
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const pressedId = k === ' ' ? 'space' : k;
      setPressedKeyId(pressedId);

      clearTimeout(timer);
      timer = setTimeout(() => {
        setPressedKeyId(null);
      }, 140);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [handsGuide]);

  if (!handsGuide) {
    return null;
  }

  // Find active key coordinates
  const activeKeyCoord = targetKeyInfo
    ? ALL_KEYS.find((k) => k.id === targetKeyInfo.keyId)
    : null;

  const activeFinger = targetKeyInfo?.finger || null;
  const activeFingerDetails = activeFinger ? FINGER_NAMES[activeFinger] : null;

  // Compute glowing path from wrist/knuckle base to active key center
  const highlightPathD = useMemo(() => {
    if (!activeKeyCoord || !activeFinger) return null;
    const base = FINGER_BASE_ANCHORS[activeFinger];
    const targetCenterX = activeKeyCoord.x + activeKeyCoord.w / 2;
    const targetCenterY = activeKeyCoord.y + activeKeyCoord.h / 2;

    // Smooth cubic bezier from wrist -> knuckle -> target key
    const cp1X = base.wristX + (base.knuckleX - base.wristX) * 0.4;
    const cp1Y = base.wristY - 40;
    const cp2X = base.knuckleX;
    const cp2Y = base.knuckleY + (targetCenterY - base.knuckleY) * 0.5;

    return `M ${base.wristX} ${base.wristY} Q ${cp1X} ${cp1Y}, ${base.knuckleX} ${base.knuckleY} T ${targetCenterX} ${targetCenterY}`;
  }, [activeKeyCoord, activeFinger]);

  return (
    <div className="w-full max-w-4xl mx-auto my-3 select-none transition-all duration-300">
      {/* Top Header Controls: Finger Indicator & Quick Close */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-1 rounded-xl bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)] text-xs text-[var(--sub-color)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-[var(--text-color)] text-xs flex items-center gap-1 font-sans">
              <span>🙌 10 Barmoq Vizualizatori</span>
            </span>
          </div>

          {activeFingerDetails && activeKeyCoord && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium text-[11px]">
              <span>Tugma:</span>
              <strong className="font-mono text-white bg-blue-600 px-1.5 py-0.2 rounded font-bold uppercase">
                {targetKeyInfo?.char}
              </strong>
              <span>→</span>
              <span>
                {activeFingerDetails.hand}: <strong className="text-white">{activeFingerDetails.uz}</strong>
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (onToggleGuide) onToggleGuide();
            else setHandsGuide(false);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)] transition-colors text-[11px] font-semibold cursor-pointer"
          title="Qoʻllar vizualizatorini yashirish"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Yashirish</span>
        </button>
      </div>

      {/* Main SVG Keyboard & Hands Container */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#f8fafc] dark:bg-[#0f141c] border border-[var(--sub-alt)]">
        <svg
          viewBox="120 70 760 365"
          className="w-full h-auto max-h-[340px]"
          preserveAspectRatio="xMidYMid meet"
        >

          {/* Keyboard Chassis Outline */}
          <rect
            x="135"
            y="75"
            width="730"
            height="250"
            rx="18"
            ry="18"
            className="fill-white/80 dark:fill-[#1e2430]/90 stroke-slate-300 dark:stroke-slate-700/80"
            strokeWidth="2"
          />

          {/* Keyboard Keys */}
          {ALL_KEYS.map((k) => {
            const isTarget = targetKeyInfo?.keyId === k.id;
            const isPressed = pressedKeyId === k.id;
            const isHomeRow = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'].includes(k.id);

            return (
              <g key={k.id} className="transition-all duration-75">
                {/* Active Key Subtle Highlight Ring */}
                {isTarget && (
                  <circle
                    cx={k.x + k.w / 2}
                    cy={k.y + k.h / 2}
                    r="28"
                    className="fill-blue-500/20 dark:fill-blue-400/20"
                  />
                )}

                {/* Keycap Body */}
                <rect
                  x={k.x}
                  y={k.y}
                  width={k.w}
                  height={k.h}
                  rx="7"
                  ry="7"
                  className={
                    isTarget
                      ? 'fill-blue-600 stroke-blue-400 dark:stroke-blue-300'
                      : isPressed
                      ? 'fill-slate-400 dark:fill-slate-600 stroke-slate-500'
                      : isHomeRow
                      ? 'fill-slate-50 dark:fill-[#283042] stroke-slate-300 dark:stroke-slate-600/70 hover:fill-slate-100 dark:hover:fill-[#323d54]'
                      : 'fill-slate-50 dark:fill-[#222938] stroke-slate-200 dark:stroke-slate-700/70'
                  }
                  strokeWidth={isTarget ? '2.5' : '1.5'}
                />

                {/* Keycap Label */}
                <text
                  x={k.x + k.w / 2}
                  y={k.y + k.h / 2 + 5}
                  textAnchor="middle"
                  className={`font-mono text-[13px] select-none font-semibold ${
                    isTarget
                      ? 'fill-white font-black text-[15px]'
                      : isPressed
                      ? 'fill-white font-bold'
                      : isHomeRow
                      ? 'fill-slate-700 dark:fill-slate-200 font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {k.label}
                </text>
              </g>
            );
          })}

          {/* ================================================================= */}
          {/* HANDS OVERLAY: Elegant Vector Outline matching the user's image */}
          {/* ================================================================= */}

          {/* LEFT HAND OUTLINE */}
          <g
            className="transition-opacity duration-300"
            style={{ pointerEvents: 'none' }}
          >
            {/* Left Palm & Hand Contour Path */}
            <path
              d="
                M 170 440
                C 175 390, 185 330, 205 280
                C 215 250, 225 215, 250 205
                C 260 200, 268 215, 265 240
                C 270 215, 280 195, 300 195
                C 310 195, 316 210, 312 240
                C 318 210, 330 190, 350 190
                C 362 190, 368 208, 363 240
                C 370 215, 385 200, 400 200
                C 412 200, 418 218, 412 250
                C 410 270, 400 280, 415 295
                C 430 310, 445 320, 440 335
                C 435 348, 420 350, 395 345
                C 375 365, 360 400, 345 440
                Z
              "
              className="fill-transparent stroke-slate-400 dark:stroke-slate-500/80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Left Knuckle & Finger Dividing Lines (subtle hand interior creases) */}
            <path
              d="M 265 240 C 265 270, 268 300, 275 330"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
            <path
              d="M 312 240 C 314 275, 318 300, 325 330"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
            <path
              d="M 363 240 C 365 270, 368 295, 375 325"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
            <path
              d="M 395 345 C 385 325, 380 295, 412 250"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
          </g>

          {/* RIGHT HAND OUTLINE */}
          <g
            className="transition-opacity duration-300"
            style={{ pointerEvents: 'none' }}
          >
            {/* Right Palm & Hand Contour Path (Mirrored) */}
            <path
              d="
                M 830 440
                C 825 390, 815 330, 795 280
                C 785 250, 775 215, 750 205
                C 740 200, 732 215, 735 240
                C 730 215, 720 195, 700 195
                C 690 195, 684 210, 688 240
                C 682 210, 670 190, 650 190
                C 638 190, 632 208, 637 240
                C 630 215, 615 200, 600 200
                C 588 200, 582 218, 588 250
                C 590 270, 600 280, 585 295
                C 570 310, 555 320, 560 335
                C 565 348, 580 350, 605 345
                C 625 365, 640 400, 655 440
                Z
              "
              className="fill-transparent stroke-slate-400 dark:stroke-slate-500/80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Right Knuckle & Finger Dividing Lines */}
            <path
              d="M 735 240 C 735 270, 732 300, 725 330"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
            <path
              d="M 688 240 C 686 275, 682 300, 675 330"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
            <path
              d="M 637 240 C 635 270, 632 295, 625 325"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
            <path
              d="M 605 345 C 615 325, 620 295, 588 250"
              className="fill-none stroke-slate-300 dark:stroke-slate-600/70"
              strokeWidth="1.8"
            />
          </g>

          {/* ================================================================= */}
          {/* ACTIVE FINGER HIGHLIGHT TRAJECTORY (THE VIBRANT BLUE BONE LINE)   */}
          {/* Exactly matching the blue highlighted finger line in the image!  */}
          {/* ================================================================= */}
          {highlightPathD && (
            <g>
              {/* Soft outer highlight line */}
              <path
                d={highlightPathD}
                className="fill-none stroke-blue-500/25 dark:stroke-blue-400/25"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Core solid vibrant blue line */}
              <path
                d={highlightPathD}
                className="fill-none stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Finger Tip Target Dot */}
              {activeKeyCoord && (
                <circle
                  cx={activeKeyCoord.x + activeKeyCoord.w / 2}
                  cy={activeKeyCoord.y + activeKeyCoord.h / 2}
                  r="4.5"
                  className="fill-white"
                />
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
});
