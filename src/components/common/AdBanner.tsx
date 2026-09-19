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
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
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
