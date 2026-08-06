import { ThemeMode } from '../types';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
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
    name: 'Classic Dark',
    bg: '#0f172a',
    cardBg: '#1e293b',
    subAlt: '#111827',
    textColor: '#f8fafc',
    subColor: '#64748b',
    mainColor: '#38bdf8',
    errorColor: '#f43f5e',
    correctColor: '#e2e8f0',
    extraColor: '#f97316',
    caretColor: '#38bdf8',
  },
  light: {
    id: 'light',
    name: 'Paper Light',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    subAlt: '#f1f5f9',
    textColor: '#0f172a',
    subColor: '#94a3b8',
    mainColor: '#2563eb',
    errorColor: '#dc2626',
    correctColor: '#1e293b',
    extraColor: '#ea580c',
    caretColor: '#2563eb',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    bg: '#120e17',
    cardBg: '#1f1a24',
    subAlt: '#2d1b36',
    textColor: '#ffe600',
    subColor: '#8a7b9c',
    mainColor: '#00f0ff',
    errorColor: '#ff0055',
    correctColor: '#ffffff',
    extraColor: '#ff00aa',
    caretColor: '#00f0ff',
  },
  serene: {
    id: 'serene',
    name: 'Serene Cream',
    bg: '#faf8f5',
    cardBg: '#ffffff',
    subAlt: '#f3efea',
    textColor: '#2d3748',
    subColor: '#a0aec0',
    mainColor: '#319795',
    errorColor: '#e53e3e',
    correctColor: '#1a202c',
    extraColor: '#dd6b20',
    caretColor: '#319795',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    cardBg: '#44475a',
    subAlt: '#21222c',
    textColor: '#f8f8f2',
    subColor: '#6272a4',
    mainColor: '#bd93f9',
    errorColor: '#ff5555',
    correctColor: '#f8f8f2',
    extraColor: '#ffb86c',
    caretColor: '#ff79c6',
  },
  nord: {
    id: 'nord',
    name: 'Nordic Snow',
    bg: '#2e3440',
    cardBg: '#3b4252',
    subAlt: '#242933',
    textColor: '#eceff4',
    subColor: '#4c566a',
    mainColor: '#88c0d0',
    errorColor: '#bf616a',
    correctColor: '#e5e9f0',
    extraColor: '#d08770',
    caretColor: '#88c0d0',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Code',
    bg: '#040d04',
    cardBg: '#091c09',
    subAlt: '#020802',
    textColor: '#00ff41',
    subColor: '#005a16',
    mainColor: '#00ff41',
    errorColor: '#ff3333',
    correctColor: '#88ff88',
    extraColor: '#ccff00',
    caretColor: '#00ff41',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    bg: '#1c1326',
    cardBg: '#2a1a3a',
    subAlt: '#140c1c',
    textColor: '#f3e8ff',
    subColor: '#7e6b8f',
    mainColor: '#f43f5e',
    errorColor: '#fb923c',
    correctColor: '#ffffff',
    extraColor: '#e11d48',
    caretColor: '#f43f5e',
  },
};
