import { ThemeMode } from '../types';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  description: string;
  bg: string;
  cardBg: string;
  subAlt: string;
  textColor: string;
  subColor: string;
  mainColor: string;
  errorColor: string;
  correctColor: string;
  extraColor: string;
  caretColor: string;
}

export const themes: Record<ThemeMode, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Qora tema (Dark)',
    description: 'Chiroyli to\'q fon, toza oq matn va ko\'zga qulay kontrast',
    bg: '#0f172a',
    cardBg: '#1e293b',
    subAlt: '#334155',
    textColor: '#f8fafc',
    subColor: '#94a3b8',
    mainColor: '#38bdf8',
    errorColor: '#ef4444',
    correctColor: '#cbd5e1',
    extraColor: '#f59e0b',
    caretColor: '#38bdf8',
  },
  light: {
    id: 'light',
    name: 'Oq tema (Light)',
    description: 'TypingMaster uslubidagi toza oq fon va yuqori darajada tiniq matn',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    subAlt: '#e2e8f0',
    textColor: '#0f172a',
    subColor: '#64748b',
    mainColor: '#2563eb',
    errorColor: '#dc2626',
    correctColor: '#0f172a',
    extraColor: '#ea580c',
    caretColor: '#2563eb',
  },
};

// Safe helper that always guarantees a valid ThemeConfig
export const getSafeThemeConfig = (themeKey?: string): ThemeConfig => {
  if (themeKey === 'light') return themes.light;
  return themes.dark;
};
