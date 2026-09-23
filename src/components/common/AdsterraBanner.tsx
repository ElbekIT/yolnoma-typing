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
 */
export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  className = '',
  isTyping = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous child nodes to prevent script duplication
    container.innerHTML = '';

    const atOptionsData = {
      key: '8779945a54853d6bc5f0b76958ce6e69',
      format: 'iframe',
      height: 90,
      width: 728,
      params: {}
    };

    try {
      (window as unknown as { atOptions: typeof atOptionsData }).atOptions = atOptionsData;
    } catch {
      // Ignore if frozen
    }

    const adWrapper = document.createElement('div');
    adWrapper.id = 'adsterra-slot-wrapper';
    adWrapper.style.width = '100%';
    adWrapper.style.maxWidth = '728px';
    adWrapper.style.minHeight = '90px';
    adWrapper.style.display = 'flex';
    adWrapper.style.justifyContent = 'center';
    adWrapper.style.alignItems = 'center';

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
          id="adsterra-banner-inner"
          className="w-full max-w-[728px] min-h-[90px] mx-auto flex justify-center items-center rounded-xl bg-[var(--sub-alt-color)]/20 border border-[var(--sub-alt-color)]/30 shadow-inner overflow-hidden"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
};

export default AdsterraBanner;
