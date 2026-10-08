import React, { useState, useEffect, useRef } from 'react';
import { useDevice } from '../../context/DeviceContext';
import { useSettings } from '../../context/SettingsContext';

interface DeviceAutoCalibrationScreenProps {
  onComplete?: () => void;
}

export const DeviceAutoCalibrationScreen: React.FC<DeviceAutoCalibrationScreenProps> = ({ onComplete }) => {
  const { currentDevice, isCalibrated, setCalibrated } = useDevice();
  const { setFontSize, setModeBarScale } = useSettings();

  const [progress, setProgress] = useState(1);
  const [statusMessage, setStatusMessage] = useState('Qurilma apparati aniqlanmoqda...');
  const [isVisible, setIsVisible] = useState(!isCalibrated);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const completedRef = useRef(false);

  useEffect(() => {
    // If already calibrated in this session, don't show
    if (isCalibrated) {
      setIsVisible(false);
      return;
    }

    const startTime = Date.now();
    const duration = 1400; // 1.4 seconds smooth calibration

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(rawProgress);

      if (rawProgress < 30) {
        setStatusMessage('Ekran o‘lchami va drayverlar tekshirilmoqda...');
      } else if (rawProgress < 65) {
        setStatusMessage(`${currentDevice.name} aniqlandi (${currentDevice.width}×${currentDevice.height}px)...`);
      } else if (rawProgress < 95) {
        setStatusMessage('Klaviatura, shriftlar va interfeys 100% moslashtirilmoqda...');
      } else {
        setStatusMessage('✅ Tayyor! Sayt muvaffaqiyatli moslashtirildi.');
      }

      if (rawProgress >= 100 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(timer);

        // Apply optimal settings
        setFontSize(currentDevice.optimalFontSize);
        setModeBarScale(currentDevice.optimalModeScale);

        // Fade out smoothly
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setCalibrated(true);
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 350);
        }, 200);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [isCalibrated, currentDevice, setCalibrated, setFontSize, setModeBarScale, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-[var(--bg-color)] select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'var(--bg-color, #111827)'
      }}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--main-color)]/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* Animated Device Icon Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[var(--sub-alt)]/80 border-2 border-[var(--main-color)]/40 shadow-xl flex items-center justify-center text-4xl shadow-[var(--main-color)]/10">
            <span className="animate-bounce [animation-duration:1.5s]">{currentDevice.icon}</span>
          </div>
          <div className="absolute -inset-1 rounded-3xl border border-[var(--main-color)]/30 animate-ping opacity-40 [animation-duration:2s]" />
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--main-color)]/15 border border-[var(--main-color)]/30 text-[var(--main-color)] text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-ping" />
            <span>QURILMAGA MOSLASHUV</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] tracking-tight">
            Qurilmangizga moslashmoqda...
          </h2>
          <p className="text-xs text-[var(--sub-color)] font-mono min-h-[1.5rem] transition-all">
            {statusMessage}
          </p>
        </div>

        {/* 1% to 100% Progress Display */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-color)] px-1">
            <span className="text-[var(--sub-color)]">Moslashuv:</span>
            <span className="text-[var(--main-color)] text-sm">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3 bg-[var(--sub-alt)] rounded-full overflow-hidden border border-[var(--sub-color)]/20 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[var(--main-color)] via-amber-400 to-[var(--main-color)] rounded-full transition-all duration-75 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Device Hardware Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-[var(--sub-color)]">
          <span className="px-2.5 py-1 rounded-lg bg-[var(--sub-alt)]/60 border border-[var(--sub-color)]/15">
            📱 {currentDevice.name.split('/')[0].trim()}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--sub-alt)]/60 border border-[var(--sub-color)]/15">
            📐 {currentDevice.width} × {currentDevice.height}px
          </span>
        </div>
      </div>
    </div>
  );
};
