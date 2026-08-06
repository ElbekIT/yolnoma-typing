import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, CaretStyle, SoundProfile, LanguageCode } from '../types';
import { themes, ThemeConfig } from '../config/themes';
import { soundSynth } from '../utils/audio';

interface SettingsContextType {
  theme: ThemeMode;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeMode) => void;
  caretStyle: CaretStyle;
  setCaretStyle: (style: CaretStyle) => void;
  smoothCaret: boolean;
  setSmoothCaret: (smooth: boolean) => void;
  soundProfile: SoundProfile;
  setSoundProfile: (profile: SoundProfile) => void;
  volume: number;
  setVolume: (vol: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  showKeyboard: boolean;
  setShowKeyboard: (show: boolean) => void;
  showLiveWpm: boolean;
  setShowLiveWpm: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('yolnoma_theme') as ThemeMode) || 'dark';
  });
  const [caretStyle, setCaretStyleState] = useState<CaretStyle>(() => {
    return (localStorage.getItem('yolnoma_caret') as CaretStyle) || 'line';
  });
  const [smoothCaret, setSmoothCaretState] = useState<boolean>(() => {
    return localStorage.getItem('yolnoma_smooth_caret') !== 'false';
  });
  const [soundProfile, setSoundProfileState] = useState<SoundProfile>(() => {
    return (localStorage.getItem('yolnoma_sound') as SoundProfile) || 'thock';
  });
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('yolnoma_volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [fontFamily, setFontFamilyState] = useState<string>(() => {
    return localStorage.getItem('yolnoma_font') || 'JetBrains Mono';
  });
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('yolnoma_fontsize');
    return saved ? parseInt(saved, 10) : 20;
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('yolnoma_lang') as LanguageCode) || 'en';
  });
  const [showKeyboard, setShowKeyboardState] = useState<boolean>(() => {
    return localStorage.getItem('yolnoma_keyboard') === 'true';
  });
  const [showLiveWpm, setShowLiveWpmState] = useState<boolean>(() => {
    return localStorage.getItem('yolnoma_live_wpm') !== 'false';
  });

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem('yolnoma_theme', t);
  };

  const setCaretStyle = (s: CaretStyle) => {
    setCaretStyleState(s);
    localStorage.setItem('yolnoma_caret', s);
  };

  const setSmoothCaret = (sc: boolean) => {
    setSmoothCaretState(sc);
    localStorage.setItem('yolnoma_smooth_caret', String(sc));
  };

  const setSoundProfile = (sp: SoundProfile) => {
    setSoundProfileState(sp);
    localStorage.setItem('yolnoma_sound', sp);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    soundSynth.setVolume(v);
    localStorage.setItem('yolnoma_volume', String(v));
  };

  const setFontFamily = (f: string) => {
    setFontFamilyState(f);
    localStorage.setItem('yolnoma_font', f);
  };

  const setFontSize = (fs: number) => {
    setFontSizeState(fs);
    localStorage.setItem('yolnoma_fontsize', String(fs));
  };

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    localStorage.setItem('yolnoma_lang', l);
  };

  const setShowKeyboard = (sk: boolean) => {
    setShowKeyboardState(sk);
    localStorage.setItem('yolnoma_keyboard', String(sk));
  };

  const setShowLiveWpm = (lw: boolean) => {
    setShowLiveWpmState(lw);
    localStorage.setItem('yolnoma_live_wpm', String(lw));
  };

  useEffect(() => {
    soundSynth.setVolume(volume);
  }, [volume]);

  // Apply theme styling to root element
  useEffect(() => {
    const curTheme = themes[theme] || themes.dark;
    const root = document.documentElement;
    root.style.setProperty('--bg-color', curTheme.bg);
    root.style.setProperty('--card-bg', curTheme.cardBg);
    root.style.setProperty('--sub-alt', curTheme.subAlt);
    root.style.setProperty('--text-color', curTheme.textColor);
    root.style.setProperty('--sub-color', curTheme.subColor);
    root.style.setProperty('--main-color', curTheme.mainColor);
    root.style.setProperty('--error-color', curTheme.errorColor);
    root.style.setProperty('--correct-color', curTheme.correctColor);
    root.style.setProperty('--extra-color', curTheme.extraColor);
    root.style.setProperty('--caret-color', curTheme.caretColor);
  }, [theme]);

  const activeThemeConfig = themes[theme] || themes.dark;

  return (
    <SettingsContext.Provider
      value={{
        theme,
        themeConfig: activeThemeConfig,
        setTheme,
        caretStyle,
        setCaretStyle,
        smoothCaret,
        setSmoothCaret,
        soundProfile,
        setSoundProfile,
        volume,
        setVolume,
        fontFamily,
        setFontFamily,
        fontSize,
        setFontSize,
        language,
        setLanguage,
        showKeyboard,
        setShowKeyboard,
        showLiveWpm,
        setShowLiveWpm
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
