import React, { useState, useEffect, useRef } from 'react';
import { useDevice } from '../../context/DeviceContext';
import { useSettings } from '../../context/SettingsContext';

interface DeviceAutoCalibrationScreenProps {
  isAppLoading?: boolean;
  onComplete?: () => void;
}

export const DeviceAutoCalibrationScreen: React.FC<DeviceAutoCalibrationScreenProps> = ({
  isAppLoading = false,
  onComplete
}) => {
  const { currentDevice, isCalibrated, setCalibrated } = useDevice();
  const { setFontSize, setModeBarScale } = useSettings();

  const [minDelayDone, setMinDelayDone] = useState(isCalibrated);
  const [isVisible, setIsVisible] = useState(!isCalibrated);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completedRef = useRef(isCalibrated);

  // Silent device optimization + lightweight minimum splash (450ms)
  useEffect(() => {
    if (isCalibrated) {
      setIsVisible(false);
      return;
    }

    setFontSize(currentDevice.optimalFontSize);
    setModeBarScale(currentDevice.optimalModeScale);

    const timer = setTimeout(() => {
      setMinDelayDone(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [isCalibrated, currentDevice.optimalFontSize, currentDevice.optimalModeScale, setFontSize, setModeBarScale]);

  // Fade out cleanly once both splash delay and auth loading finish
  useEffect(() => {
    if (!isVisible || completedRef.current) return;
    if (!minDelayDone || isAppLoading) return;

    completedRef.current = true;
    setIsFadingOut(true);

    const hideTimer = setTimeout(() => {
      setCalibrated(true);
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 200);

    return () => clearTimeout(hideTimer);
  }, [isVisible, minDelayDone, isAppLoading, setCalibrated, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-[var(--bg-color)] select-none transition-opacity duration-200 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'var(--bg-color, #090d16)'
      }}
      aria-label="Yuklanmoqda"
    >
      <div className="w-full max-w-[220px] flex flex-col items-center text-center gap-5">
        {/* Clean Minimal Brand Mark */}
        <div className="flex items-center gap-2.5">
          <img
            src="/yolnoma_icon.svg"
            alt="Yolnoma"
            className="w-9 h-9 object-contain"
          />
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold tracking-tight text-[var(--text-color)]">
              Yolnoma
            </span>
            <span className="text-xs font-mono font-bold text-[var(--main-color)]">
              typing
            </span>
          </div>
        </div>

        {/* Ultra-clean 2px sliding progress line (pure CSS GPU transform) */}
        <div className="w-full h-[2.5px] rounded-full bg-[var(--sub-alt)]/70 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-[var(--main-color)] yolnoma-loader-bar" />
        </div>

        <p className="text-[11px] font-mono text-[var(--sub-color)] tracking-wide">
          Sayt yuklanmoqda...
        </p>
      </div>
    </div>
  );
};
