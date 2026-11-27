import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DeviceProfile, DEVICE_PROFILES, autoDetectDevice } from '../data/devices';

interface DeviceContextType {
  currentDevice: DeviceProfile;
  isCalibrated: boolean;
  setCalibrated: (calibrated: boolean) => void;
  recalibrate: () => void;
}

const STORAGE_CALIBRATED_KEY = 'yolnoma_device_calibrated_session';

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Automatically detect the device from the browser hardware
  const [currentDevice, setCurrentDevice] = useState<DeviceProfile>(() => {
    return autoDetectDevice();
  });

  // Track calibration completion
  const [isCalibrated, setIsCalibratedState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_CALIBRATED_KEY) === 'true';
    } catch {}
    return false;
  });

  // Apply device properties to CSS variables
  const applyDeviceCSS = useCallback((device: DeviceProfile) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--device-width', `${device.width}px`);
      document.documentElement.style.setProperty('--device-height', `${device.height}px`);
      document.documentElement.style.setProperty('--device-font-size', `${device.optimalFontSize}px`);

      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
        );
      }
    }
  }, []);

  const setCalibrated = useCallback((calibrated: boolean) => {
    setIsCalibratedState(calibrated);
    try {
      sessionStorage.setItem(STORAGE_CALIBRATED_KEY, calibrated ? 'true' : 'false');
    } catch {}
  }, []);

  const recalibrate = useCallback(() => {
    const detected = autoDetectDevice();
    setCurrentDevice(detected);
    applyDeviceCSS(detected);
    setCalibrated(false);
  }, [applyDeviceCSS, setCalibrated]);

  // Window resize listener (debounced to prevent scroll/keyboard lag on mobile)
  useEffect(() => {
    const detected = autoDetectDevice();
    setCurrentDevice(detected);
    applyDeviceCSS(detected);

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const updated = autoDetectDevice();
        setCurrentDevice(updated);
        applyDeviceCSS(updated);
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [applyDeviceCSS]);

  return (
    <DeviceContext.Provider
      value={{
        currentDevice,
        isCalibrated,
        setCalibrated,
        recalibrate
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
