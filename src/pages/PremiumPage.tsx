import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  ShieldCheck,
  ExternalLink,
  Zap,
  ArrowRight,
  BookOpen,
  Volume2,
  Award,
  Lock,
  HelpCircle,
  ChevronDown,
  Languages,
  Clock,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface PremiumPageProps {
  onGoToEnglish?: () => void;
  onOpenAuth?: () => void;
}

export type PlanType = 'daily' | 'weekly' | 'yearly';

interface PlanCard {
  id: PlanType;
  title: string;
  price: number;
  priceLabel: string;
  durationLabel: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

const PLANS: PlanCard[] = [
  {
    id: 'daily',
    title: "Pre-A1 & A1 Boshlang'ich",
    price: 0,
    priceLabel: "0 so'm (100% Bepul)",
    durationLabel: "To'liq va cheksiz ochiq",
    badge: "Boshlang'ich",
    features: [
      "Barcha boshlang'ich 10 ta dars ochiq",
      "Alifbo va sodda kundalik so'zlar",
      "Inglizcha jonli talaffuz (Speech Synthesis)",
      "Klaviaturada tez yozish tahlili"
    ]
  },
  {
    id: 'weekly',
    title: 'A2 & B1 Kundalik Muloqot',
    price: 0,
    priceLabel: "0 so'm (100% Bepul)",
    durationLabel: "To'liq va cheksiz ochiq",
    popular: true,
    badge: "Eng Ommabop 🔥",
    features: [
      "Cheksiz o'rganish va mashq qilish",
      "Kundalik iboralar va suhbat jumlalari",
      "Julebu.ai uslubidagi interaktiv mashqlar",
      "So'zma-so'z tekshirish va ovozli talaffuz",
      "Kunlik streak va yulduzchalar hisobi"
    ]
  },
  {
    id: 'yearly',
    title: 'B2 & IELTS 9.0 Akademik',
    price: 0,
    priceLabel: "0 so'm (100% Bepul)",
    durationLabel: "To'liq va cheksiz ochiq",
    badge: "Eng Yuqori Bosqich",
    features: [
      "IELTS 8.5–9.0 akademik insho jumlalari",
      "Murakkab grammatik strukturalar",
      "Kelgusida qo'shiladigan barcha yangi darslar",
      "Sertifikat olish imkoniyati",
      "100% bepul ochiq platforma"
    ]
  }
];

export const PremiumPage: React.FC<PremiumPageProps> = ({
  onGoToEnglish,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('weekly');
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [clickConfig, setClickConfig] = useState<{ service_id: string; merchant_id: string } | null>(null);

  // User subscription status
  const [subscription, setSubscription] = useState<{
    active: boolean;
    planId?: string;
    expiresAt?: number;
    remainingDays?: number;
    isOwner?: boolean;
  } | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fetch Click config and user subscription
  useEffect(() => {
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

    const queryUser = user?.uid || user?.email;
    if (queryUser) {
      fetch(`/api/user/subscription?userId=${encodeURIComponent(queryUser)}`)
        .then(res => res.json())
        .then(data => {
          if (data) setSubscription(data);
        })
        .catch(() => {});
    }
  }, [user]);

  // Free access handler (Click removed)
  const handlePay = (_planId: PlanType) => {
    if (onGoToEnglish) {
      onGoToEnglish();
    }
  };

  const FAQS = [
    {
      q: "To'lov qanday kartalar orqali qabul qilinadi?",
      a: "To'lov rasmiy Click Merchant xizmati orqali Uzcard, Humo hamda O'zbekiston banklarining Visa/Mastercard kartalari orqali xavfsiz amalga oshiriladi."
    },
    {
      q: "To'lov qilgach Premium obuna qancha vaqtda faollashadi?",
      a: "Avtomatik tarzda bir zumda (1-2 soniyada)! Click to'lovni tasdiqlashi bilan sizning hisobingizga Premium ochiladi va darslar to'liq ishga tushadi."
    },
    {
      q: "Boshqa telefondan yoki kompyuterdan kirsam ham ishlaydimi?",
      a: "Albatta! Saytga o'z hisobingiz (Google yoki email) bilan kirsangiz, istalgan kompyuter yoki telefonda obunangiz avtomatik saqlanib turadi."
    },
    {
      q: "Agar 3 ta bepul mashqdan so'ng to'lamasam nima bo'ladi?",
      a: "3 ta bepul mashqdan so'ng tizim to'xtaydi. Boshqa darslarni ochish va ingliz tilini davom ettirish uchun tariflardan birini tanlab to'lov qilishingiz kerak bo'ladi."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12 select-none animate-in fade-in duration-300">
      
      {/* ============================================================
          TOP HERO BANNER
          ============================================================ */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-[#0e1628] to-slate-950 p-8 sm:p-12 text-center overflow-hidden">
        {/* Glow ambient spots */}

        {/* Crown Badge */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 mb-6 animate-pulse">
          <Crown className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Main Title & Subtitle */}
        <div className="space-y-4 max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Yolnoma English VIP & Premium</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Ingliz Tilini 0 dan IELTS 9 gacha Yozib O'rganing!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Quruq yodlash emas — klaviaturada harfma-harf terib yozish, interaktiv tekshirish va jonli ovozli talaffuz orqali so'z boyligingizni oshiring.
          </p>

          {/* User Subscription Status Notice if Active */}
          {subscription?.active && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/15 text-emerald-300 inline-flex items-center gap-3 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {subscription.isOwner 
                  ? "Sizda Muallif Rejimi (VIP) faol. Barcha darslar cheksiz ochiq!" 
                  : `Premium Obunangiz Faol: ${subscription.planId?.toUpperCase()} (${subscription.remainingDays} kun qoldi)`}
              </span>
            </div>
          )}
        </div>

        {/* Quick Link to English Arena */}
        {onGoToEnglish && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={onGoToEnglish}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-amber-400" />
              <span>English Mashqlar Maydoniga O'tish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================
          3 PRICING PLANS SECTION
          ============================================================ */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Qulay Tarifni Tanlang
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Click to'lov tizimi orqali 1 daqiqada xavfsiz faollashtiring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  plan.popular
                    ? 'bg-gradient-to-b from-slate-900 via-[#101930] to-slate-950 border-amber-400/80 shadow-sm md:-translate-y-2 ring-1 ring-amber-400/50'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {/* Popular or Savings Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-md ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950'
                        : 'bg-slate-800 border border-amber-500/40 text-amber-300'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="space-y-4 pt-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.durationLabel}</p>
                  </div>

                  <div className="pt-2">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                      {plan.priceLabel}
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2.5 pt-4 text-xs font-sans">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div className="mt-8 pt-6 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePay(plan.id);
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Darslarni Boshlash (100% Bepul)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-[10px] text-center text-emerald-400 font-mono font-bold">
                    Hech qanday to'lov talab qilinmaydi &bull; 100% Bepul
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          COMPARISON TABLE: BEPUL VS PREMIUM
          ============================================================ */}
      <div className="rounded-3xl bg-[#0e121d] p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Bepul va Premium Imkoniyatlar Farqi
          </h3>
          <p className="text-xs text-slate-400">
            Nega foydalanuvchilar Premium obunani tanlashadi?
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-bold">Xususiyat</th>
                <th className="pb-3 font-bold text-center">Bepul Sinov</th>
                <th className="pb-3 font-bold text-center text-amber-400">Yolnoma Premium VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-3 text-slate-300">Mashqlar soni</td>
                <td className="py-3 text-center text-slate-400 font-mono">Faqat 3 ta so'z/gap</td>
                <td className="py-3 text-center font-bold text-emerald-400 font-mono">Cheksiz (Barcha 35 dars)</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-300">Darajalar diapazoni</td>
                <td className="py-3 text-center text-slate-400">Pre-A1 (faqat boshlanishi)</td>
                <td className="py-3 text-center font-bold text-amber-400">Pre-A1 dan IELTS 9.0 gacha</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-300">Ovozli talaffuz (Speech Synthesis)</td>
                <td className="py-3 text-center text-slate-400">Cheklangan</td>
                <td className="py-3 text-center font-bold text-emerald-400">To'liq cheksiz</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-300">Klaviaturada yozib o'rganish (Julebu uslubi)</td>
                <td className="py-3 text-center text-slate-400">3 ta urinish</td>
                <td className="py-3 text-center font-bold text-emerald-400">Cheksiz</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-300">Shaxsiy profilga VIP Nishon</td>
                <td className="py-3 text-center text-slate-500">&mdash;</td>
                <td className="py-3 text-center font-bold text-amber-400">Oltin VIP Nishon 👑</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          FAQ SECTION
          ============================================================ */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Ko'p Beriladigan Savollar
          </h3>
          <p className="text-xs text-slate-400">
            To'lov va obuna bo'yicha barcha savollarga javoblar
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-800/40"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-200">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Payment Footer Badge */}
      <div className="text-center pt-4 pb-8 text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Barcha to'lovlar Click Merchant xavfsiz shifrlangan protokoli orqali kafolatlangan</span>
      </div>

    </div>
  );
};
