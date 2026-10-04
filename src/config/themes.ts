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
    name: 'Oltin Qora (Cyber Obsidian)',
    description: 'Chuqur kosmik qora fon, tiniq yozuv va oltin nurli kursor',
    bg: '#090b11',
    cardBg: '#121622',
    subAlt: '#1c2336',
    textColor: '#f8fafc',
    subColor: '#637289',
    mainColor: '#f59e0b',
    errorColor: '#f43f5e',
    correctColor: '#f8fafc',
    extraColor: '#fb923c',
    caretColor: '#f59e0b',
  },
  light: {
    id: 'light',
    name: 'Yorug\' Qor (Porcelain Clean)',
    description: 'Ultra toza oq fon, qora tiniq harflar va zamonaviy ko\'k aksent',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    subAlt: '#e2e8f0',
    textColor: '#090d16',
    subColor: '#64748b',
    mainColor: '#2563eb',
    errorColor: '#e11d48',
    correctColor: '#090d16',
    extraColor: '#ea580c',
    caretColor: '#2563eb',
  },
};

// Safe helper that always guarantees a valid ThemeConfig
export const getSafeThemeConfig = (themeKey?: string): ThemeConfig => {
  if (themeKey === 'light') return themes.light;
  return themes.dark;
};
