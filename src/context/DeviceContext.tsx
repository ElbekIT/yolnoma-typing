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

  // Window resize listener to keep device auto-adapted
  useEffect(() => {
    const detected = autoDetectDevice();
    setCurrentDevice(detected);
    applyDeviceCSS(detected);

    const handleResize = () => {
      const updated = autoDetectDevice();
      setCurrentDevice(updated);
      applyDeviceCSS(updated);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
