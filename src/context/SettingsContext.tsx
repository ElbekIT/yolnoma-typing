import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, CaretStyle, TapeMode, SoundProfile, LanguageCode } from '../types';
import { themes, ThemeConfig } from '../config/themes';
import { soundSynth } from '../utils/audio';

export type HeaderIconSize = 'small' | 'medium' | 'large';
export type ModeBarWidth = 'compact' | 'standard' | 'wide' | 'full';
export type ModeBarScale = 'small' | 'medium' | 'large';
export type TypingAnimation = 'none' | 'jump' | 'bounce' | 'glow' | 'wave' | 'slide' | 'pulse';
export type TypingAnimationSpeed = 'ultra_fast' | 'fast' | 'normal' | 'slow' | 'very_slow' | 'super_slow';

interface SettingsContextType {
  theme: ThemeMode;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeMode) => void;
  caretStyle: CaretStyle;
  setCaretStyle: (style: CaretStyle) => void;
  smoothCaret: boolean;
  setSmoothCaret: (smooth: boolean) => void;
  tapeMode: TapeMode;
  setTapeMode: (mode: TapeMode) => void;
  typingAnimation: TypingAnimation;
  setTypingAnimation: (anim: TypingAnimation) => void;
  typingAnimationSpeed: TypingAnimationSpeed;
  setTypingAnimationSpeed: (speed: TypingAnimationSpeed) => void;
  typingAnimDurationMs: number;
  setTypingAnimDurationMs: (ms: number) => void;
  soundProfile: SoundProfile;
  setSoundProfile: (profile: SoundProfile) => void;
  volume: number;
  setVolume: (vol: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  headerIconSize: HeaderIconSize;
  setHeaderIconSize: (size: HeaderIconSize) => void;
  modeBarWidth: ModeBarWidth;
  setModeBarWidth: (width: ModeBarWidth) => void;
  modeBarScale: ModeBarScale;
  setModeBarScale: (scale: ModeBarScale) => void;
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

  const [tapeMode, setTapeModeState] = useState<TapeMode>(() => {
    return (localStorage.getItem('yolnoma_tape_mode') as TapeMode) || 'off';
  });

  const [typingAnimation, setTypingAnimationState] = useState<TypingAnimation>(() => {
    return (localStorage.getItem('yolnoma_typing_animation') as TypingAnimation) || 'jump';
  });

  const [typingAnimationSpeed, setTypingAnimationSpeedState] = useState<TypingAnimationSpeed>(() => {
    return (localStorage.getItem('yolnoma_typing_anim_speed') as TypingAnimationSpeed) || 'normal';
  });

  const [typingAnimDurationMs, setTypingAnimDurationMsState] = useState<number>(() => {
    const saved = localStorage.getItem('yolnoma_typing_anim_duration');
    return saved ? parseInt(saved, 10) : 260;
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

  const [headerIconSize, setHeaderIconSizeState] = useState<HeaderIconSize>(() => {
    return (localStorage.getItem('yolnoma_header_icon_size') as HeaderIconSize) || 'medium';
  });

  const [modeBarWidth, setModeBarWidthState] = useState<ModeBarWidth>(() => {
    return (localStorage.getItem('yolnoma_mode_bar_width') as ModeBarWidth) || 'standard';
  });

  const [modeBarScale, setModeBarScaleState] = useState<ModeBarScale>(() => {
    return (localStorage.getItem('yolnoma_mode_bar_scale') as ModeBarScale) || 'medium';
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('yolnoma_lang') as LanguageCode) || 'uz-latn';
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

  const setTapeMode = (tm: TapeMode) => {
    setTapeModeState(tm);
    localStorage.setItem('yolnoma_tape_mode', tm);
  };

  const setTypingAnimation = (anim: TypingAnimation) => {
    setTypingAnimationState(anim);
    localStorage.setItem('yolnoma_typing_animation', anim);
  };

  const speedToMsMap: Record<TypingAnimationSpeed, number> = {
    ultra_fast: 120,
    fast: 180,
    normal: 260,
    slow: 500,
    very_slow: 800,
    super_slow: 1200
  };

  const setTypingAnimationSpeed = (speed: TypingAnimationSpeed) => {
    setTypingAnimationSpeedState(speed);
    localStorage.setItem('yolnoma_typing_anim_speed', speed);
    const ms = speedToMsMap[speed] || 260;
    setTypingAnimDurationMsState(ms);
    localStorage.setItem('yolnoma_typing_anim_duration', String(ms));
  };

  const setTypingAnimDurationMs = (ms: number) => {
    setTypingAnimDurationMsState(ms);
    localStorage.setItem('yolnoma_typing_anim_duration', String(ms));
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

  const setHeaderIconSize = (size: HeaderIconSize) => {
    setHeaderIconSizeState(size);
    localStorage.setItem('yolnoma_header_icon_size', size);
  };

  const setModeBarWidth = (width: ModeBarWidth) => {
    setModeBarWidthState(width);
    localStorage.setItem('yolnoma_mode_bar_width', width);
  };

  const setModeBarScale = (scale: ModeBarScale) => {
    setModeBarScaleState(scale);
    localStorage.setItem('yolnoma_mode_bar_scale', scale);
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

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--typing-anim-duration', `${typingAnimDurationMs}ms`);
  }, [typingAnimDurationMs]);

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
        tapeMode,
        setTapeMode,
        typingAnimation,
        setTypingAnimation,
        typingAnimationSpeed,
        setTypingAnimationSpeed,
        typingAnimDurationMs,
        setTypingAnimDurationMs,
        soundProfile,
        setSoundProfile,
        volume,
        setVolume,
        fontFamily,
        setFontFamily,
        fontSize,
        setFontSize,
        headerIconSize,
        setHeaderIconSize,
        modeBarWidth,
        setModeBarWidth,
        modeBarScale,
        setModeBarScale,
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
