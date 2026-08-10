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
    name: 'Cyber Slate',
    bg: '#0b0f19',
    cardBg: '#131b2e',
    subAlt: '#1d283f',
    textColor: '#f1f5f9',
    subColor: '#64748b',
    mainColor: '#06b6d4',
    errorColor: '#f43f5e',
    correctColor: '#cbd5e1',
    extraColor: '#f97316',
    caretColor: '#06b6d4',
  },
  light: {
    id: 'light',
    name: 'Paper Pure',
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
    name: 'Cyberpunk Neon',
    bg: '#0a0a12',
    cardBg: '#141424',
    subAlt: '#1f1f38',
    textColor: '#00ffcc',
    subColor: '#8a7b9c',
    mainColor: '#ff007f',
    errorColor: '#ff0055',
    correctColor: '#ffffff',
    extraColor: '#e0a96d',
    caretColor: '#ff007f',
  },
  serene: {
    id: 'serene',
    name: 'Serene Emerald',
    bg: '#061712',
    cardBg: '#0d2820',
    subAlt: '#153a30',
    textColor: '#e6f4f1',
    subColor: '#5c8a7e',
    mainColor: '#10b981',
    errorColor: '#f43f5e',
    correctColor: '#a7f3d0',
    extraColor: '#f59e0b',
    caretColor: '#10b981',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Dark',
    bg: '#181824',
    cardBg: '#222234',
    subAlt: '#2c2c44',
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
    name: 'Nordic Frost',
    bg: '#1e222a',
    cardBg: '#282c34',
    subAlt: '#323844',
    textColor: '#eceff4',
    subColor: '#68738d',
    mainColor: '#88c0d0',
    errorColor: '#bf616a',
    correctColor: '#e5e9f0',
    extraColor: '#d08770',
    caretColor: '#88c0d0',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Code',
    bg: '#030a03',
    cardBg: '#081708',
    subAlt: '#0e260e',
    textColor: '#00ff41',
    subColor: '#006618',
    mainColor: '#00ff41',
    errorColor: '#ff3333',
    correctColor: '#88ff88',
    extraColor: '#ccff00',
    caretColor: '#00ff41',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Velvet',
    bg: '#120a17',
    cardBg: '#1f1228',
    subAlt: '#2e193c',
    textColor: '#f3e8ff',
    subColor: '#836b94',
    mainColor: '#f43f5e',
    errorColor: '#fb923c',
    correctColor: '#ffffff',
    extraColor: '#e11d48',
    caretColor: '#f43f5e',
  },
};
