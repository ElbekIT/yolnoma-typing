import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

interface VirtualKeyboardProps {
  activeChar?: string;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeChar }) => {
  const { showKeyboard } = useSettings();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key.toLowerCase());
    };
    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (!showKeyboard) return null;

  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

  const normalizedActive = activeChar ? activeChar.toLowerCase() : '';

  const getKeyClass = (key: string) => {
    const isPressed = pressedKey === key || (key === 'space' && pressedKey === ' ');
    const isActiveTarget =
      normalizedActive === key || (key === 'space' && normalizedActive === ' ');

    let base =
      'h-9 px-2.5 rounded-lg flex items-center justify-center font-mono text-xs font-semibold uppercase transition-all duration-75 border shadow-sm ';

    if (isActiveTarget) {
      base += 'bg-[var(--main-color)] text-white border-[var(--main-color)] ring-2 ring-[var(--main-color)]/50 scale-105 ';
    } else if (isPressed) {
      base += 'bg-[var(--sub-color)] text-[var(--bg-color)] border-transparent scale-95 ';
    } else {
      base += 'bg-[var(--sub-alt)] text-[var(--text-color)] border-[var(--sub-color)]/20 ';
    }

    return base;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl shadow-md my-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-1.5">
        {/* Row 1 */}
        <div className="flex gap-1.5">
          {row1.map((k) => (
            <div key={k} className={getKeyClass(k)}>
              {k}
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex gap-1.5">
          {row2.map((k) => (
            <div key={k} className={getKeyClass(k)}>
              {k}
            </div>
          ))}
        </div>

        {/* Row 3 */}
        <div className="flex gap-1.5">
          {row3.map((k) => (
            <div key={k} className={getKeyClass(k)}>
              {k}
            </div>
          ))}
        </div>

        {/* Spacebar Row */}
        <div className="flex gap-1.5 w-full justify-center mt-1">
          <div className={`${getKeyClass('space')} w-64`}>space</div>
        </div>
      </div>
    </div>
  );
};
