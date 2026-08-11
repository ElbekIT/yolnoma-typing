import React, { useEffect, useState, memo } from 'react';
import { useSettings } from '../context/SettingsContext';

interface VirtualKeyboardProps {
  activeChar?: string;
}

const KeyCap = memo(({ keyLabel, isPressed, isActiveTarget }: { keyLabel: string; isPressed: boolean; isActiveTarget: boolean }) => {
  let base = 'h-9 px-2.5 rounded-lg flex items-center justify-center font-mono text-xs font-semibold uppercase border transition-colors duration-75 ';

  if (isActiveTarget) {
    base += 'bg-[var(--main-color)] text-white border-[var(--main-color)] ring-2 ring-[var(--main-color)]/30 ';
  } else if (isPressed) {
    base += 'bg-[var(--sub-color)] text-[var(--bg-color)] border-transparent ';
  } else {
    base += 'bg-[var(--sub-alt)]/60 text-[var(--text-color)] border-[var(--sub-alt)] ';
  }

  return (
    <div className={`${base} ${keyLabel === 'space' ? 'w-64' : ''}`}>
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
    <div className="w-full max-w-2xl mx-auto p-3 bg-[var(--card-bg)]/40 border border-[var(--sub-alt)]/60 rounded-xl my-4 opacity-75 hover:opacity-100 transition-opacity">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex gap-1.5">
          {row1.map((k) => (
            <KeyCap
              key={k}
              keyLabel={k}
              isPressed={pressedKey === k}
              isActiveTarget={normalizedActive === k}
            />
          ))}
        </div>

        <div className="flex gap-1.5">
          {row2.map((k) => (
            <KeyCap
              key={k}
              keyLabel={k}
              isPressed={pressedKey === k}
              isActiveTarget={normalizedActive === k}
            />
          ))}
        </div>

        <div className="flex gap-1.5">
          {row3.map((k) => (
            <KeyCap
              key={k}
              keyLabel={k}
              isPressed={pressedKey === k}
              isActiveTarget={normalizedActive === k}
            />
          ))}
        </div>

        <div className="flex gap-1.5 w-full justify-center mt-1">
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
