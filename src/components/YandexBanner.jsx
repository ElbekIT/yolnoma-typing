import React, { useEffect, useRef } from 'react';

/**
 * Yandex Ads (РСЯ - Рекламная сеть Яндекса) Reklama Bloki
 * Ad Unit: R-A-20102778-1
 * Container ID: yandex_rtb_R-A-20102778-1
 * 
 * Imkoniyatlari:
 * - Anti-Layout-Shift (CLS 0): Kamida 90px balandlik kafolatlangan
 * - Xavfsiz React hayot sikli: useRef + useEffect bilan toza render va cleanup
 * - Tez yozish paytida chalg'itmaslik: isTyping vaqtida pointer-events o'chiriladi va xiralashtiriladi
 * - Markazlashtirilgan, zamonaviy dizayn
 */
export const YandexBanner = ({ className = '', isTyping = false }) => {
  const containerRef = useRef(null);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Har safar toza div hosil qilish
    container.innerHTML = '';
    const adDiv = document.createElement('div');
    adDiv.id = 'yandex_rtb_R-A-20102778-1';
    adDiv.style.width = '100%';
    adDiv.style.minHeight = '90px';
    adDiv.style.display = 'flex';
    adDiv.style.justifyContent = 'center';
    adDiv.style.alignItems = 'center';
    container.appendChild(adDiv);

    // Yandex callback massivini ishga tushirish
    window.yaContextCb = window.yaContextCb || [];

    const renderAd = () => {
      try {
        if (window.Ya && window.Ya.Context && window.Ya.Context.AdvManager) {
          window.Ya.Context.AdvManager.render({
            blockId: 'R-A-20102778-1',
            renderTo: 'yandex_rtb_R-A-20102778-1'
          });
          isRenderedRef.current = true;
        } else {
          // Agar skript hali yuklanmagan bo'lsa, navbatga qo'yish
          window.yaContextCb.push(() => {
            try {
              if (window.Ya && window.Ya.Context && window.Ya.Context.AdvManager) {
                window.Ya.Context.AdvManager.render({
                  blockId: 'R-A-20102778-1',
                  renderTo: 'yandex_rtb_R-A-20102778-1'
                });
                isRenderedRef.current = true;
              }
            } catch (err) {
              console.debug('Yandex RTB render queue error:', err);
            }
          });
        }
      } catch (err) {
        console.debug('Yandex RTB render direct error:', err);
      }
    };

    renderAd();

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      isRenderedRef.current = false;
    };
  }, []);

  return (
    <div
      id="yandex-banner-container"
      className={`w-full flex flex-col justify-center items-center my-6 overflow-hidden transition-all duration-300 ${
        isTyping ? 'opacity-20 pointer-events-none' : 'opacity-100'
      } ${className}`}
      aria-label="Yandex Ads Hamkorlik Reklamasi"
    >
      <div className="w-full max-w-[728px] mx-auto flex justify-between items-center px-2 mb-1 text-[10px] text-[var(--sub-color)]/60 uppercase tracking-widest font-mono select-none">
        <span>Hamkorlik / Reklama (РСЯ)</span>
        <span>Yandex Ads</span>
      </div>

      <div className="w-full max-w-full flex justify-center items-center overflow-hidden">
        <div
          ref={containerRef}
          className="w-full max-w-[728px] min-h-[90px] mx-auto flex justify-center items-center rounded-xl bg-[var(--sub-alt-color)]/20 border border-[var(--sub-alt-color)]/30 shadow-inner overflow-hidden"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
};

export default YandexBanner;
