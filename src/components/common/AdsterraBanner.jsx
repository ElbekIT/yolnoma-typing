import React, { useEffect, useRef } from 'react';

/**
 * Adsterra 728x90 Banner Component (JavaScript / JSX version)
 * Key: '8779945a54853d6bc5f0b76958ce6e69'
 * Format: 'iframe' (728x90)
 * Source: 'https://www.highrevenueformat.com/8779945a54853d6bc5f0b76958ce6e69/invoke.js'
 */
export const AdsterraBanner = ({ className = '', isTyping = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const adWrapper = document.createElement('div');
    adWrapper.id = 'adsterra-slot-wrapper';
    adWrapper.style.width = '728px';
    adWrapper.style.minHeight = '90px';
    adWrapper.style.display = 'flex';
    adWrapper.style.justifyContent = 'center';
    adWrapper.style.alignItems = 'center';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.innerHTML = `
      atOptions = {
        'key' : '8779945a54853d6bc5f0b76958ce6e69',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

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
      id="adsterra-banner-outer"
      className={`w-full flex flex-col justify-center items-center my-4 overflow-hidden transition-all duration-300 ${
        isTyping ? 'opacity-25 pointer-events-none' : 'opacity-100'
      } ${className}`}
    >
      <div className="w-full max-w-[728px] flex justify-between items-center px-1 mb-1 text-[10px] text-[var(--sub-color)]/60 uppercase tracking-wider font-mono">
        <span>Reklama / Sponsor</span>
        <span>728x90</span>
      </div>

      <div className="w-full max-w-full flex justify-center items-center overflow-hidden">
        <div
          ref={containerRef}
          id="adsterra-banner-inner"
          className="w-[728px] min-h-[90px] flex justify-center items-center rounded-xl bg-[var(--sub-alt-color)]/15 border border-[var(--sub-alt-color)]/25 shadow-sm transition-transform origin-center max-w-full overflow-hidden"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
};

export default AdsterraBanner;
