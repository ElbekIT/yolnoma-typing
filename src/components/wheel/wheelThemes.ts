export type WheelThemeId = 'classic' | 'gold' | 'cyberpunk' | 'national' | 'pastel' | 'stealth';

export interface WheelTheme {
  id: WheelThemeId;
  name: string;
  description: string;
  colors: string[];
  hubColor: string;
  hubBorderColor: string;
  hubTextColor: string;
  outerBorderColor: string;
  outerBorderSecondary: string;
  pointerColor: string;
  pointerAccent: string;
  glowColor: string;
}

export const WHEEL_THEMES: Record<WheelThemeId, WheelTheme> = {
  classic: {
    id: 'classic',
    name: "🌈 Klassik Kamalak",
    description: "Wheel of Names uslubidagi yorqin va quvnoq ranglar",
    colors: [
      '#2563eb', // Blue
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#84cc16', // Lime
      '#f97316', // Orange
      '#6366f1'  // Indigo
    ],
    hubColor: '#ffffff',
    hubBorderColor: '#e2e8f0',
    hubTextColor: '#0f172a',
    outerBorderColor: '#ffffff',
    outerBorderSecondary: '#cbd5e1',
    pointerColor: '#f59e0b',
    pointerAccent: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.4)'
  },
  gold: {
    id: 'gold',
    name: "👑 Oltin VIP",
    description: "Hashamatli oltin va qora premium gradientlar",
    colors: [
      '#d97706',
      '#1e1b4b',
      '#f59e0b',
      '#312e81',
      '#fbbf24',
      '#0f172a',
      '#b45309',
      '#1e293b'
    ],
    hubColor: '#fbbf24',
    hubBorderColor: '#d97706',
    hubTextColor: '#78350f',
    outerBorderColor: '#f59e0b',
    outerBorderSecondary: '#78350f',
    pointerColor: '#fbbf24',
    pointerAccent: '#b45309',
    glowColor: 'rgba(251, 191, 36, 0.5)'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: "⚡ Neon Kiberpunk",
    description: "Yorqin neon, firuza va binafsharang zamonaviy dizayn",
    colors: [
      '#06b6d4', // Neon Cyan
      '#8b5cf6', // Violet
      '#ec4899', // Neon Pink
      '#3b82f6', // Electric Blue
      '#10b981', // Neon Green
      '#f43f5e'  // Rose Red
    ],
    hubColor: '#090d16',
    hubBorderColor: '#06b6d4',
    hubTextColor: '#06b6d4',
    outerBorderColor: '#8b5cf6',
    outerBorderSecondary: '#06b6d4',
    pointerColor: '#06b6d4',
    pointerAccent: '#ec4899',
    glowColor: 'rgba(6, 182, 212, 0.5)'
  },
  national: {
    id: 'national',
    name: "🇺🇿 O'zbekiston Milliy",
    description: "Moviy osmon, zumrad yashil, oq va tillarang naqshlar",
    colors: [
      '#0099b8', // Sky Blue
      '#10b981', // Emerald Green
      '#ffffff', // Pure White
      '#eab308', // Gold
      '#0284c7', // Deep Sky
      '#059669', // Forest Green
      '#f43f5e', // Crimson Red
      '#fbbf24'  // Amber
    ],
    hubColor: '#ffffff',
    hubBorderColor: '#0099b8',
    hubTextColor: '#0099b8',
    outerBorderColor: '#0099b8',
    outerBorderSecondary: '#10b981',
    pointerColor: '#eab308',
    pointerAccent: '#ca8a04',
    glowColor: 'rgba(0, 153, 184, 0.45)'
  },
  pastel: {
    id: 'pastel',
    name: "🎨 Shirin Pastel",
    description: "Yumshoq, ko'zni charchatmaydigan yoqimli ranglar",
    colors: [
      '#93c5fd', // Soft Blue
      '#86efac', // Soft Green
      '#fde047', // Soft Yellow
      '#fca5a5', // Soft Red
      '#d8b4fe', // Soft Purple
      '#a5f3fc', // Soft Cyan
      '#fed7aa'  // Soft Peach
    ],
    hubColor: '#ffffff',
    hubBorderColor: '#e2e8f0',
    hubTextColor: '#334155',
    outerBorderColor: '#f1f5f9',
    outerBorderSecondary: '#cbd5e1',
    pointerColor: '#f43f5e',
    pointerAccent: '#e11d48',
    glowColor: 'rgba(147, 197, 253, 0.4)'
  },
  stealth: {
    id: 'stealth',
    name: "🌑 Qora Stealth",
    description: "Yolnoma qora tun va oltin aksentli IT uslub",
    colors: [
      '#1e293b',
      '#334155',
      '#475569',
      '#0f172a',
      '#27272a',
      '#3f3f46'
    ],
    hubColor: '#0f172a',
    hubBorderColor: '#f59e0b',
    hubTextColor: '#f59e0b',
    outerBorderColor: '#334155',
    outerBorderSecondary: '#f59e0b',
    pointerColor: '#f59e0b',
    pointerAccent: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.35)'
  }
};

// Helper: gets contrasting text color (white or dark) for a slice background hex
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#0f172a' : '#ffffff';
}
