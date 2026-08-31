import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle, X } from 'lucide-react';

export const NetworkStatusGuard: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const [isVpnDetected, setIsVpnDetected] = useState<boolean>(false);
  const [vpnDismissed, setVpnDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline不易 = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline不易);

    // Initial check
    if (!navigator.onLine) {
      setIsOnline(false);
    }

    // Heuristic VPN / Datacenter / Timezone discrepancy check
    try {
      const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // If user is accessing from unusual datacenter proxy timezone while operating in local Uzbek/Central Asian locale
      const userLang = navigator.language || '';
      if (
        (userLang.includes('uz') || userLang.includes('ru')) &&
        (clientTz.includes('Etc/GMT') || clientTz.includes('Iceland') || clientTz.includes('UTC'))
      ) {
        setIsVpnDetected(true);
      }
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline不易);
    };
  }, []);

  return (
    <>
      {/* Offline Alert Modal / Overlay when internet disconnects */}
      {!isOnline && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-center text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/30">
              <WifiOff className="w-10 h-10 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Internet Ulanishi Uzildi</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              Sizda Internet O'chish Muammosi Bor!
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Platforma real vaqt rejimida ishlashi uchun doimiy tarmoq talab qilinadi. Iltimos, Wi-Fi yoki mobil internetingizni tekshirib qayta ulaning.
            </p>

            <button
              onClick={() => {
                if (navigator.onLine) {
                  setIsOnline(true);
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-600/30 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Qayta Tekshirish</span>
            </button>
          </div>
        </div>
      )}

      {/* Online Restored Toast Notification */}
      {showRestored && isOnline && (
        <div className="fixed top-5 right-5 z-[9999] bg-emerald-950 border border-emerald-500/80 rounded-2xl px-4 py-3 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-300">Internet tiklandi!</p>
            <p className="text-[11px] text-slate-300">Sayt to'liq rejimda ishlamoqda.</p>
          </div>
        </div>
      )}

      {/* VPN / Proxy Detection Warning (Polite Top Banner) */}
      {isVpnDetected && !vpnDismissed && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9000] w-[95%] max-w-xl bg-amber-950/95 border border-amber-500/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                VPN yoki Proksi Ulanish Aniqlangan bo'lishi mumkin
              </p>
              <p className="text-[11px] text-slate-300">
                Reyting va testlarda aniqlik uchun iltimos, VPNni o'chirib kirishingiz tavsiya etiladi.
              </p>
            </div>
          </div>

          <button
            onClick={() => setVpnDismissed(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
