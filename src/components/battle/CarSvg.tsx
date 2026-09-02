import React from 'react';

interface CarSvgProps {
  color?: 'blue' | 'red' | 'gold' | 'green' | 'purple';
  isMoving?: boolean;
  className?: string;
}

export const CarSvg: React.FC<CarSvgProps> = ({ color = 'blue', isMoving = false, className = 'w-24 h-10' }) => {
  // Color presets for body gradient and accents
  const colors = {
    blue: {
      gradStart: '#0066FF',
      gradMid: '#00D2FF',
      gradEnd: '#003399',
      glow: '#00A2FF',
      bodyDark: '#001940'
    },
    red: {
      gradStart: '#FF2A4D',
      gradMid: '#FF6B00',
      gradEnd: '#99001A',
      glow: '#FF3355',
      bodyDark: '#3A000A'
    },
    gold: {
      gradStart: '#FFD700',
      gradMid: '#FFA500',
      gradEnd: '#B8860B',
      glow: '#FFE066',
      bodyDark: '#3D3000'
    },
    green: {
      gradStart: '#00E676',
      gradMid: '#00B0FF',
      gradEnd: '#006633',
      glow: '#00FF88',
      bodyDark: '#00331A'
    },
    purple: {
      gradStart: '#A855F7',
      gradMid: '#EC4899',
      gradEnd: '#581C87',
      glow: '#C084FC',
      bodyDark: '#2E1065'
    }
  };

  const currentTheme = colors[color] || colors.blue;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Motion exhaust smoke glow when moving */}
      {isMoving && (
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-4 bg-gradient-to-l from-cyan-500/40 via-amber-500/20 to-transparent blur-xs animate-pulse pointer-events-none rounded-full" />
      )}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 120"
        fill="none"
        className="w-full h-full drop-shadow-lg"
      >
        <defs>
          {/* Main Car Body Gradient */}
          <linearGradient id={`carGrad_${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.gradStart} />
            <stop offset="50%" stopColor={currentTheme.gradMid} />
            <stop offset="100%" stopColor={currentTheme.gradEnd} />
          </linearGradient>

          {/* Roof & Glass Tint */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
          </linearGradient>

          {/* Rim Gradient */}
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Headlight Glow Filter */}
          <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow Under Car */}
        <ellipse cx="160" cy="110" rx="140" ry="8" fill="#000000" opacity="0.45" />

        {/* CAR BODY - Aerodynamic Sports Coupe / Dodge Viper Silhouette */}
        {/* Main Body Shell */}
        <path
          d="M 20 85 
             C 15 70, 25 50, 45 42 
             C 70 34, 110 20, 150 15 
             C 190 10, 240 25, 275 45 
             C 295 55, 310 70, 312 85 
             C 314 95, 305 102, 290 102 
             L 25 102 
             C 18 102, 15 95, 20 85 Z"
          fill={`url(#carGrad_${color})`}
        />

        {/* Dark Lower Side Skirt */}
        <path
          d="M 20 92 L 305 92 L 295 102 L 30 102 Z"
          fill={currentTheme.bodyDark}
        />

        {/* Front Bumper Air Scoop */}
        <path
          d="M 270 75 Q 295 78 305 88 L 270 92 Z"
          fill="#0F172A"
        />

        {/* Side Racing Stripe / Accent */}
        <path
          d="M 45 52 C 90 45, 180 32, 270 58"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* WINDSHIELD & CABIN GLASS */}
        <path
          d="M 115 22 
             C 145 18, 185 18, 215 30 
             C 235 38, 250 50, 252 52 
             L 125 52 
             Z"
          fill="url(#glassGrad)"
          stroke={currentTheme.gradMid}
          strokeWidth="1.5"
        />

        {/* Side Mirror */}
        <path
          d="M 120 50 Q 110 46 115 42 Q 125 44 125 50 Z"
          fill={currentTheme.gradStart}
        />

        {/* REAR SPOILER */}
        <path
          d="M 15 52 L 32 40 L 40 46 L 25 58 Z"
          fill={currentTheme.gradEnd}
        />

        {/* TAILLIGHT */}
        <path
          d="M 18 70 Q 14 75 18 80 L 25 80 Q 22 75 22 70 Z"
          fill="#FF0033"
        />

        {/* HEADLIGHT (LED Neon Glow) */}
        <path
          d="M 285 58 Q 305 65 308 72 L 290 74 Z"
          fill="#00FFFF"
        />
        <circle cx="298" cy="68" r="10" fill="url(#headlightGlow)" />

        {/* WHEEL ARCHES & WHEELS */}
        {/* Rear Wheel Arch */}
        <path
          d="M 50 102 A 28 28 0 0 1 106 102 Z"
          fill="#090D16"
        />
        {/* Front Wheel Arch */}
        <path
          d="M 215 102 A 28 28 0 0 1 271 102 Z"
          fill="#090D16"
        />

        {/* REAR WHEEL */}
        <g transform="translate(78, 92)">
          {/* Tire Outer */}
          <circle cx="0" cy="0" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          {/* Rim */}
          <circle cx="0" cy="0" r="14" fill="url(#rimGrad)" />
          {/* Rim Spokes */}
          <g stroke="#334155" strokeWidth="2.5" className={isMoving ? 'animate-spin' : ''}>
            <line x1="-12" y1="0" x2="12" y2="0" />
            <line x1="0" y1="-12" x2="0" y2="12" />
            <line x1="-8" y1="-8" x2="8" y2="8" />
            <line x1="-8" y1="8" x2="8" y2="-8" />
          </g>
          {/* Center Cap */}
          <circle cx="0" cy="0" r="4" fill={currentTheme.gradStart} />
        </g>

        {/* FRONT WHEEL */}
        <g transform="translate(243, 92)">
          {/* Tire Outer */}
          <circle cx="0" cy="0" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          {/* Rim */}
          <circle cx="0" cy="0" r="14" fill="url(#rimGrad)" />
          {/* Rim Spokes */}
          <g stroke="#334155" strokeWidth="2.5" className={isMoving ? 'animate-spin' : ''}>
            <line x1="-12" y1="0" x2="12" y2="0" />
            <line x1="0" y1="-12" x2="0" y2="12" />
            <line x1="-8" y1="-8" x2="8" y2="8" />
            <line x1="-8" y1="8" x2="8" y2="-8" />
          </g>
          {/* Center Cap */}
          <circle cx="0" cy="0" r="4" fill={currentTheme.gradStart} />
        </g>
      </svg>
    </div>
  );
};
