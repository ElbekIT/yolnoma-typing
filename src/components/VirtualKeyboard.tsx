import React, { useEffect, useState, memo } from 'react';
import { useSettings } from '../context/SettingsContext';

interface VirtualKeyboardProps {
  activeChar?: string;
}

const KeyCap = memo(({ keyLabel, isPressed, isActiveTarget }: { keyLabel: string; isPressed: boolean; isActiveTarget: boolean }) => {
  let base = 'h-7 sm:h-8 px-2 rounded flex items-center justify-center font-mono text-[10px] sm:text-xs font-semibold uppercase border transition-colors duration-75 shrink-0 ';

  if (isActiveTarget) {
    base += 'bg-[var(--main-color)] text-white border-[var(--main-color)] ';
  } else if (isPressed) {
    base += 'bg-[var(--sub-color)] text-[var(--bg-color)] border-transparent ';
  } else {
    base += 'bg-[var(--sub-alt)]/50 text-[var(--text-color)] border-[var(--sub-alt)] ';
  }

  return (
    <div className={`${base} ${keyLabel === 'space' ? 'w-44 sm:w-60' : 'min-w-[22px] sm:min-w-[28px]'}`}>
      {keyLabel}
    </div>
  );
});

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = memo(({ activeChar }) => {
  const { showKeyboard } = useSettings();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!showKeyboard) return;

    let timer: NodeJS.Timeout;
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key.toLowerCase());
      clearTimeout(timer);
      timer = setTimeout(() => {
        setPressedKey(null);
      }, 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [showKeyboard]);

  if (!showKeyboard) return null;

  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

  const normalizedActive = activeChar ? activeChar.toLowerCase() : '';

  return (
    <div className="w-full max-w-2xl mx-auto p-2 bg-[var(--card-bg)]/40 border border-[var(--sub-alt)] rounded-xl my-3 opacity-85 hover:opacity-100 transition-opacity overflow-x-auto no-scrollbar">
      <div className="flex flex-col items-center gap-1 min-w-[320px]">
        <div className="flex gap-1 sm:gap-1.5">
          {row1.map((k) => (
            <KeyCap
              key={k}
              keyLabel={k}
              isPressed={pressedKey === k}
              isActiveTarget={normalizedActive === k}
            />
          ))}
        </div>

        <div className="flex gap-1 sm:gap-1.5">
          {row2.map((k) => (
            <KeyCap
              key={k}
              keyLabel={k}
              isPressed={pressedKey === k}
              isActiveTarget={normalizedActive === k}
            />
          ))}
        </div>

        <div className="flex gap-1 sm:gap-1.5">
          {row3.map((k) => (
            <KeyCap
              key={k}
              keyLabel={k}
              isPressed={pressedKey === k}
              isActiveTarget={normalizedActive === k}
            />
          ))}
        </div>

        <div className="flex gap-1 sm:gap-1.5 w-full justify-center mt-0.5">
          <KeyCap
            keyLabel="space"
            isPressed={pressedKey === ' '}
            isActiveTarget={normalizedActive === ' '}
          />
        </div>
      </div>
    </div>
  );
});
