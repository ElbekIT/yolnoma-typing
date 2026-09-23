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
 * - Robust Global & Script Injection: sets atOptions on window and as inline script for maximum compatibility
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

    adWrapper.appendChild(confScript);
    adWrapper.appendChild(invokeScript);
    container.appendChild(adWrapper);

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
