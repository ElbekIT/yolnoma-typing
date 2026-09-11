import React from 'react';
import { Flame, AlertTriangle, CheckCircle2, Play, Sparkles } from 'lucide-react';

interface KeyboardHeatmapProps {
  charStats?: Record<string, { total: number; errors: number }>;
  onStartTargetedPractice?: (keys: string[]) => void;
}

// Key to Finger mapping for touch typing ergonomic recommendations
const KEY_FINGER_MAP: Record<string, { finger: string; hand: string }> = {
  // Left Hand
  q: { finger: 'jimjiloq (pinky)', hand: 'Chap qo\'l' },
  a: { finger: 'jimjiloq (pinky)', hand: 'Chap qo\'l' },
  z: { finger: 'jimjiloq (pinky)', hand: 'Chap qo\'l' },
  '1': { finger: 'jimjiloq (pinky)', hand: 'Chap qo\'l' },

  w: { finger: 'nomsiz barmoq (ring)', hand: 'Chap qo\'l' },
  s: { finger: 'nomsiz barmoq (ring)', hand: 'Chap qo\'l' },
  x: { finger: 'nomsiz barmoq (ring)', hand: 'Chap qo\'l' },
  '2': { finger: 'nomsiz barmoq (ring)', hand: 'Chap qo\'l' },

  e: { finger: 'o\'rta barmoq (middle)', hand: 'Chap qo\'l' },
  d: { finger: 'o\'rta barmoq (middle)', hand: 'Chap qo\'l' },
  c: { finger: 'o\'rta barmoq (middle)', hand: 'Chap qo\'l' },
  '3': { finger: 'o\'rta barmoq (middle)', hand: 'Chap qo\'l' },

  r: { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  f: { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  v: { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  t: { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  g: { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  b: { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  '4': { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },
  '5': { finger: 'ko\'rsatkich barmoq (index)', hand: 'Chap qo\'l' },

  // Right Hand
  y: { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  u: { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  h: { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  j: { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  n: { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  m: { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  '6': { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },
  '7': { finger: 'ko\'rsatkich barmoq (index)', hand: 'O\'ng qo\'l' },

  i: { finger: 'o\'rta barmoq (middle)', hand: 'O\'ng qo\'l' },
  k: { finger: 'o\'rta barmoq (middle)', hand: 'O\'ng qo\'l' },
  '8': { finger: 'o\'rta barmoq (middle)', hand: 'O\'ng qo\'l' },

  o: { finger: 'nomsiz barmoq (ring)', hand: 'O\'ng qo\'l' },
  l: { finger: 'nomsiz barmoq (ring)', hand: 'O\'ng qo\'l' },
  '9': { finger: 'nomsiz barmoq (ring)', hand: 'O\'ng qo\'l' },

  p: { finger: 'jimjiloq (pinky)', hand: 'O\'ng qo\'l' },
  ';': { finger: 'jimjiloq (pinky)', hand: 'O\'ng qo\'l' },
  "'": { finger: 'jimjiloq (pinky)', hand: 'O\'ng qo\'l' },
  '0': { finger: 'jimjiloq (pinky)', hand: 'O\'ng qo\'l' },
  '[': { finger: 'jimjiloq (pinky)', hand: 'O\'ng qo\'l' },
  ']': { finger: 'jimjiloq (pinky)', hand: 'O\'ng qo\'l' },

  // Thumb
  ' ': { finger: 'bosh barmoq (thumb)', hand: 'Ikkala qo\'l' }
};

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['space']
];

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({
  charStats = {},
  onStartTargetedPractice
}) => {
  // Normalize stats (case-insensitive for letters)
  const normalizedStats: Record<string, { total: number; errors: number }> = {};
  let totalErrors = 0;
  let totalTyped = 0;

  const statsEntries = Object.entries(charStats) as [string, { total: number; errors: number }][];
  statsEntries.forEach(([char, stat]) => {
    const key = char === ' ' ? 'space' : char.toLowerCase();
    if (!normalizedStats[key]) {
      normalizedStats[key] = { total: 0, errors: 0 };
    }
    normalizedStats[key].total += stat.total;
    normalizedStats[key].errors += stat.errors;
    totalErrors += stat.errors;
    totalTyped += stat.total;
  });

  // Calculate top troubled keys (sorted by error count descending)
  const troubledKeys = Object.entries(normalizedStats)
    .filter(([_, stat]) => stat.errors > 0)
    .sort((a, b) => b[1].errors - a[1].errors)
    .map(([char]) => char);

  // Determine key color based on heat
  const getKeyStyle = (rawChar: string) => {
    const stat = normalizedStats[rawChar];
    if (!stat || stat.total === 0) {
      return 'bg-[var(--sub-alt)]/30 text-[var(--sub-color)]/40 border-[var(--sub-alt)]';
    }

    const errorRate = stat.errors / stat.total;
    if (stat.errors === 0) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs shadow-emerald-500/10 font-bold';
    } else if (errorRate < 0.2) {
      return 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-xs shadow-amber-500/20 font-bold';
    } else if (errorRate < 0.5) {
      return 'bg-orange-500/35 text-orange-200 border-orange-500/60 shadow-xs shadow-orange-500/30 font-bold';
    } else {
      return 'bg-rose-600/40 text-rose-200 border-rose-500 shadow-xs shadow-rose-500/40 font-black animate-pulse';
    }
  };

  // Generate personalized ergonomic recommendation
  const getErgonomicTip = () => {
    if (troubledKeys.length === 0) {
      return 'Barcha tugmalar juda aniq va toza bosildi! Mushak xotirangiz mukammal ishlamoqda.';
    }

    const firstError = troubledKeys[0];
    const fingerInfo = KEY_FINGER_MAP[firstError];
    if (fingerInfo) {
      return `Eng ko'p adashilgan "${firstError.toUpperCase()}" tugmasi ${fingerInfo.hand}ning ${fingerInfo.finger}iga to'g'ri keladi. Ushbu barmoq harakatini erkinroq qiling va klaviaturaga qaramaslikka e'tibor qarating.`;
    }

    return "Tavsiya: Asosiy uy qatori (ASDF - JKL;) bo'yicha barmoqlarni qimirlatmay ushlashni davom ettiring.";
  };

  return (
    <div className="w-full bg-[var(--sub-alt)]/30 border border-[var(--sub-alt)] rounded-2xl p-3 sm:p-4 my-4 text-left space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-color)] flex items-center gap-1.5">
              <span>Klaviatura Heatmap & Xatolar Tahlili</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--sub-alt)] text-[var(--sub-color)]">
                {troubledKeys.length} ta zaif tugma
              </span>
            </h4>
            <p className="text-[10px] text-[var(--sub-color)]">
              Qaysi tugmalarda xatolik yuz berganini issiqlik xaritasi orqali ko'ring
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-[var(--sub-color)]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/50" />
            100% aniq
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/50" />
            kam xato
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500" />
            ko'p xato
          </span>
        </div>
      </div>

      {/* Mini Virtual Keyboard Layout */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="min-w-[480px] max-w-xl mx-auto flex flex-col items-center gap-1 font-mono select-none">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1 w-full justify-center">
              {row.map((k) => {
                const isSpace = k === 'space';
                const style = getKeyStyle(k);
                const stat = normalizedStats[k];

                return (
                  <div
                    key={k}
                    className={`h-7 sm:h-8 flex items-center justify-center rounded-md border text-[11px] uppercase transition-all relative ${style} ${
                      isSpace ? 'w-48 sm:w-64' : 'w-7 sm:w-8'
                    }`}
                    title={
                      stat
                        ? `${k.toUpperCase()}: ${stat.total} marta bosildi, ${stat.errors} ta xato`
                        : `${k.toUpperCase()}`
                    }
                  >
                    <span>{isSpace ? 'Space' : k}</span>
                    {stat && stat.errors > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center font-bold">
                        {stat.errors}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Advice and Action Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[var(--sub-alt)]/60 text-xs">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {troubledKeys.length > 0
                ? `Eng ko'p xato qilingan tugmalar: [ ${troubledKeys
                    .slice(0, 5)
                    .map((k) => k.toUpperCase())
                    .join(', ')} ]`
                : 'Ajoyib natija! Xatoliklar qayd etilmadi.'}
            </span>
          </div>
          <p className="text-[11px] text-[var(--sub-color)] leading-relaxed">
            {getErgonomicTip()}
          </p>
        </div>

        {troubledKeys.length > 0 && onStartTargetedPractice && (
          <button
            onClick={() => onStartTargetedPractice(troubledKeys.slice(0, 5))}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Maxsus mashqni boshlash</span>
          </button>
        )}
      </div>
    </div>
  );
};
