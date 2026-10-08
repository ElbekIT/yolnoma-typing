import React, { useState, useEffect } from 'react';
import { MessageSquareMore } from 'lucide-react';

interface SiteFeedbackFloatingButtonProps {
  onClick: () => void;
}

export const SiteFeedbackFloatingButton: React.FC<SiteFeedbackFloatingButtonProps> = ({
  onClick
}) => {
  const [hasCooldown, setHasCooldown] = useState(false);

  // Check if user recently submitted (for badge tinting)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('yolnoma_site_feedback_timestamp');
      if (stored) {
        const elapsed = Date.now() - parseInt(stored, 10);
        if (elapsed < 24 * 60 * 60 * 1000) {
          setHasCooldown(true);
        }
      }
    } catch {}
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip on hover */}
      <div className="hidden sm:flex items-center mr-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
        <span>Sayt haqida o'z fikringizni bildiring</span>
      </div>

      {/* Main Circular (Dumaloq) 3-Dots SMS Action Button */}
      <button
        onClick={onClick}
        type="button"
        title="Sayt haqida o'z fikringizni bildiring"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg cursor-pointer border-2 border-amber-300/50 relative active:scale-95 transition-transform"
        aria-label="Sayt haqida o'z fikringizni bildiring"
      >
        {/* Speech Bubble with 3 Dots */}
        <div className="relative flex items-center justify-center">
          <MessageSquareMore className="w-6 h-6 stroke-[2.3] text-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
        </div>
      </button>
    </div>
  );
};
