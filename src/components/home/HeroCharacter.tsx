import React from 'react';

interface HeroCharacterProps {
  character: 'boy' | 'girl';
  side: 'left' | 'right';
  className?: string;
}

export const HeroCharacter: React.FC<HeroCharacterProps> = ({
  character,
  side,
  className = ''
}) => {
  const isGirl = character === 'girl';
  const isLeft = side === 'left';

  const imageSrc = isGirl ? '/hero_mascot_girl.svg' : '/hero_mascot.svg';
  const altText = isGirl
    ? 'Yolnoma Qahramoni - Qiz bola (10 Barmoq Ustasi)'
    : "Yolnoma Qahramoni - O'g'il bola (10 Barmoq Ustasi)";

  // Left girl faces center naturally. Right boy faces center when flipped.
  const shouldFlip = !isLeft;

  return (
    <div
      className={`relative w-full h-[360px] sm:h-[420px] lg:h-[460px] xl:h-[490px] flex items-end justify-center select-none pointer-events-none ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* Ground Stage Shadow */}
      <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-6 rounded-full bg-black/25 pointer-events-none" />

      {/* Character Image Container - strictly non-draggable and non-clickable, clean and lightweight */}
      <div
        className="relative z-10 w-full h-full max-w-[260px] sm:max-w-[290px] lg:max-w-[320px] flex items-end justify-center pointer-events-none select-none"
        style={{
          transform: shouldFlip ? 'scaleX(-1)' : 'none'
        }}
      >
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
          loading="eager"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={
            {
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitUserDrag: 'none',
              pointerEvents: 'none'
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
};
