import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Crown, ShieldCheck, ExternalLink, X, Zap } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose?: () => void;
  userId: string;
  userEmail?: string;
  isLimitReached?: boolean;
}

export type PlanType = 'daily' | 'weekly' | 'yearly';

interface PlanDetails {
  id: PlanType;
  title: string;
  price: number;
  priceLabel: string;
  durationLabel: string;
  badge?: string;
  popular?: boolean;
  description: string;
}

const PLANS: PlanDetails[] = [
  {
    id: 'daily',
    title: 'Kunlik Sinov',
    price: 10000,
    priceLabel: "10,000 so'm",
    durationLabel: "24 soat to'liq kirish",
    badge: "Sinab ko'rish",
    description: "Barcha 35 ta dars va IELTS 9 mashqlari 24 soatga"
  },
  {
    id: 'weekly',
    title: 'Haftalik Obuna',
    price: 15000,
    priceLabel: "15,000 so'm",
    durationLabel: "7 kun to'liq kirish",
    popular: true,
    badge: "Eng Ommabop 🔥",
    description: "1 hafta davomida to'liq cheksiz inglizcha yozib o'rganish"
  },
  {
    id: 'yearly',
    title: 'Yillik Cheksiz',
    price: 350000,
    priceLabel: "350,000 so'm",
    durationLabel: "365 kun VIP kirish",
    badge: "Katta Tejamkorlik",
    description: "To'liq 1 yil barcha yangi darajalar va VIP tezlik tahlili"
  }
];

export const EnglishPremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  isLimitReached = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('weekly');
  const [clickConfig, setClickConfig] = useState<{ service_id: string; merchant_id: string } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    // Fetch Click service_id & merchant_id safely from server config
    fetch('/api/click/config')
      .then(res => res.json())
      .then(data => {
        if (data?.success) {
          setClickConfig({
            service_id: data.service_id,
            merchant_id: data.merchant_id
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handlePayWithClick = () => {
    setIsRedirecting(true);

    const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];

    const serviceId = clickConfig?.service_id || '38827';
    const merchantId = clickConfig?.merchant_id || '29603';

    // Unique transaction parameter passing user and plan
    // Format: userId__planId__timestamp
    const actualUserId = (userId || userEmail || 'guest_' + Math.floor(1000 + Math.random() * 9000)).toLowerCase();
    const transactionParam = `${actualUserId}__${plan.id}__${Date.now()}`;
    const returnUrl = `${window.location.origin}/english?payment=success&plan=${plan.id}`;

    // Click official checkout URL
    const clickUrl = new URL('https://my.click.uz/services/pay');
    clickUrl.searchParams.append('service_id', serviceId);
    clickUrl.searchParams.append('merchant_id', merchantId);
    clickUrl.searchParams.append('amount', plan.price.toFixed(2));
    clickUrl.searchParams.append('transaction_param', transactionParam);
    clickUrl.searchParams.append('return_url', returnUrl);

    // Redirect user to Click payment gateway
    window.location.href = clickUrl.toString();
  };

  const currentPlan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900 via-[#0e1628] to-slate-950 border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-center">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Crown Icon with glowing shadow */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-4 animate-pulse">
          <Crown className="w-9 h-9 stroke-[2.5]" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLimitReached ? "3 ta Bepul Mashq Yakunlandi" : "Yolnoma English VIP"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            English Kursini To'liq Oching!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Klaviaturada yozish orqali <strong>0 dan IELTS 9 gacha</strong> barcha 35 ta dars, jonli muloqot va professional fonetik talaffuz.
          </p>
        </div>

        {/* 3 Pricing Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-xl scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  {plan.badge && (
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full inline-block mb-2 ${
                      plan.popular ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-300'
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                  <div className="text-xs font-bold text-white">{plan.title}</div>
                  <div className="text-base sm:text-lg font-black text-amber-400 font-mono mt-1">
                    {plan.priceLabel}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight font-sans">
                    {plan.durationLabel}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                    {isSelected ? 'Tanlandi' : 'Tanlash'}
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Checklist */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left text-xs mb-6 space-y-1.5 font-sans">
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Barcha 7 ta Unit va 35 ta dars (0 dan IELTS 9 gacha)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Klaviaturada tez yozish va so'zma-so'z interaktiv tekshiruv</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Ovozli nutq (Speech Synthesis) va fonetik transkripsiyalar</span>
          </div>
        </div>

        {/* Click Pay Button */}
        <div className="space-y-3">
          <button
            onClick={handlePayWithClick}
            disabled={isRedirecting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 hover:brightness-110 active:scale-95 text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>Click orqali to'lash ({currentPlan.priceLabel})</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>To'lov rasmiy Click Merchant xavfsiz tizimi orqali himoyalangan</span>
          </p>
        </div>

      </div>
    </div>
  );
};
