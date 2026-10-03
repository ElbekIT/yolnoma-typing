import React, { useEffect, useRef } from 'react';

/**
 * Adsterra 728x90 Banner Component
 * Ad Unit: Banner 728x90
 * Key: '8779945a54853d6bc5f0b76958ce6e69'
 * Format: 'iframe'
 * Height: 90, Width: 728
 * Script Source: 'https://www.highrevenueformat.com/8779945a54853d6bc5f0b76958ce6e69/invoke.js'
 * 
 * Features:
 * - Anti-Layout-Shift (CLS 0): Pre-allocated fixed height (90px) and max-width (728px)
 * - Safe memory lifecycle: useRef + useEffect with DOM cleanup to prevent duplicated ads or memory leaks
 * - Environment awareness: prevents invalid impressions and script errors in preview/headless test runners
 * - Zero interference with speed typing: ignores pointer events and lowers opacity during active typing
 * - Responsive centering: perfectly centered in layout with aesthetic border matching Yolnoma dark mode
 */
export const AdsterraBanner = ({ className = '', isTyping = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous child nodes to prevent script duplication
    container.innerHTML = '';

    // Check if running in a sandbox, localhost or GCP preview environment
    const isDevOrPreview =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('run.app') ||
       window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('webcontainer') ||
       window.location.hostname.includes('google'));

    // In dev / preview environments, render an elegant banner placeholder to protect ad account and prevent script error
    if (isDevOrPreview) {
      const previewPlaceholder = document.createElement('div');
      previewPlaceholder.className = 'w-full h-[90px] flex flex-col items-center justify-center p-3 text-center select-none';
      previewPlaceholder.innerHTML = `
        <div class="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
          <span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Yolnoma Hamkorlik Reklamasi (Adsterra 728×90)
        </div>
        <p class="text-[11px] text-gray-400 mt-1 font-mono">
          Ushbu reklama bloki <span class="text-cyan-300 font-medium">yolnoma.uz</span> asosiy domenida faol ishlaydi.
        </p>
      `;
      container.appendChild(previewPlaceholder);
      return;
    }

    try {
      // Assign atOptions to global window object for Adsterra invoke script
      const atOptionsData = {
        key: '8779945a54853d6bc5f0b76958ce6e69',
        format: 'iframe',
        height: 90,
        width: 728,
        params: {}
      };

      try {
        window.atOptions = atOptionsData;
      } catch {
        // Ignored if window is frozen
      }

      const adWrapper = document.createElement('div');
      adWrapper.id = 'adsterra-slot-728x90';
      adWrapper.style.width = '100%';
      adWrapper.style.maxWidth = '728px';
      adWrapper.style.minHeight = '90px';
      adWrapper.style.display = 'flex';
      adWrapper.style.justifyContent = 'center';
      adWrapper.style.alignItems = 'center';

      // 1. atOptions configuration script tag
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '8779945a54853d6bc5f0b76958ce6e69',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      // 2. invoke.js script tag
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highrevenueformat.com/8779945a54853d6bc5f0b76958ce6e69/invoke.js';
      invokeScript.async = true;
      invokeScript.onerror = () => {
        // Safe fallback if script fails to load
      };

      adWrapper.appendChild(confScript);
      adWrapper.appendChild(invokeScript);
      container.appendChild(adWrapper);
    } catch {
      // Fallback cleanly
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      id="adsterra-banner-container"
      className={`w-full flex flex-col justify-center items-center my-6 transition-all duration-300 ${
        isTyping ? 'opacity-20 pointer-events-none' : 'opacity-100'
      } ${className}`}
      aria-label="Hamkorlik va Reklama"
    >
      <div className="w-full max-w-[728px] mx-auto flex justify-between items-center px-2 mb-1 text-[10px] text-[var(--sub-color)]/60 uppercase tracking-widest font-mono select-none">
        <span>Hamkorlik / Reklama</span>
        <span>728×90</span>
      </div>

      <div className="w-full flex justify-center items-center overflow-hidden">
        <div
          ref={containerRef}
          className="w-full max-w-[728px] min-h-[90px] mx-auto flex justify-center items-center rounded-xl bg-[var(--sub-alt-color)]/20 border border-[var(--sub-alt-color)]/30 shadow-inner overflow-hidden"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
};

export default AdsterraBanner;
