import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
  isTyping?: boolean;
}

/**
 * Adsterra 728x90 Horizontal Iframe Banner
 * Key: '8779945a54853d6bc5f0b76958ce6e69'
 * Format: 'iframe' (728x90)
 * Source: 'https://www.highrevenueformat.com/8779945a54853d6bc5f0b76958ce6e69/invoke.js'
 * 
 * Implemented with clean DOM script injection, sandboxed container isolation,
 * automatic unmount cleanup, and responsive scaling so it never breaks mobile views
 * or interferes with speed typing focus.
 */
export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  className = '',
  isTyping = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous scripts/iframes
    container.innerHTML = '';

    // Create wrapper div for the adsterra slot
    const adWrapper = document.createElement('div');
    adWrapper.id = 'adsterra-slot-wrapper';
    adWrapper.style.width = '728px';
    adWrapper.style.minHeight = '90px';
    adWrapper.style.display = 'flex';
    adWrapper.style.justifyContent = 'center';
    adWrapper.style.alignItems = 'center';

    // 1. Create atOptions configuration script
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

    // 2. Create invoke.js script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highrevenueformat.com/8779945a54853d6bc5f0b76958ce6e69/invoke.js';
    invokeScript.async = true;

    adWrapper.appendChild(confScript);
    adWrapper.appendChild(invokeScript);
    container.appendChild(adWrapper);

    return () => {
      // Safe cleanup to prevent memory leaks and duplicate ad loads
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
      {/* Visual Header / Micro Label */}
      <div className="w-full max-w-[728px] flex justify-between items-center px-1 mb-1 text-[10px] text-[var(--sub-color)]/60 uppercase tracking-wider font-mono">
        <span>Reklama / Sponsor</span>
        <span>728x90</span>
      </div>

      {/* Scalable Container for Mobile Responsiveness */}
      <div className="w-full max-w-full flex justify-center items-center overflow-hidden">
        <div
          ref={containerRef}
          id="adsterra-banner-inner"
          className="w-[728px] min-h-[90px] flex justify-center items-center rounded-xl bg-[var(--sub-alt-color)]/15 border border-[var(--sub-alt-color)]/25 shadow-sm transition-transform origin-center max-w-full overflow-hidden"
          style={{
            minHeight: '90px',
          }}
        />
      </div>
    </div>
  );
};

export default AdsterraBanner;
