import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
  isTyping?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = 'auto',
  className = '',
  isTyping = false,
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const isDevOrPreview =
          window.location.hostname.includes('run.app') ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('webcontainer') ||
          window.location.hostname.includes('google');

        if (!isDevOrPreview) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  return (
    <div
      className={`my-4 flex justify-center items-center overflow-hidden transition-opacity duration-300 ${
        isTyping ? 'opacity-20 pointer-events-none' : 'opacity-100'
      } ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '90px' }}
        data-ad-client="ca-pub-9645960579894278"
        data-ad-slot={slotId || '1234567890'}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
