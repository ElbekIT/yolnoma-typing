import './utils/antiCheat';
import React, { StrictMode, ReactNode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorFallbackProps {
  children: ReactNode;
}

function SafeAppWrapper({ children }: ErrorFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.warn('Unhandled runtime error captured:', event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 text-2xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold mb-2">Sahifa qayta yuklanmoqda</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          Dastur komponentlarini yangilash uchun tugmani bosing yoki sahifani yangilang.
        </p>
        <button
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeAppWrapper>
      <App />
    </SafeAppWrapper>
  </StrictMode>,
);


