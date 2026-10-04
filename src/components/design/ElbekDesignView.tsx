import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Send,
  MapPin,
  Clock,
  Phone,
  User,
  MessageSquare,
  CreditCard,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Keyboard,
  Lock,
  AlertTriangle,
  Video,
  Camera,
  Gamepad2,
  Navigation,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
  recommended?: boolean;
  deliverTime: string;
  specs: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  services: ServiceItem[];
}

export const DESIGN_CATEGORIES: CategoryItem[] = [
  {
    id: 'youtube',
    name: 'YouTube Uchun',
    badge: 'Trend',
    description: 'YouTube kanalingiz uchun yuqori sifatli va tomoshabinlarni jalb qiluvchi vizual dizaynlar',
    services: [
      {
        id: 'yt-banner',
        name: 'YouTube Bosh Banner (Muqova)',
        price: 45000,
        description: 'Kompyuter, planshet va smartfonlarga to\'liq moslashtirilgan professional bosh banner.',
        recommended: true,
        deliverTime: '24 soat ichida',
        specs: ['2560x1440 HD format', 'Mobil & Desktop moslashuv', '3 ta bepul tuzatish']
      },
      {
        id: 'yt-avatar',
        name: 'YouTube Kanal Avatarkasi (Logo)',
        price: 25000,
        description: 'Kanalingiz mavzusiga mos, oson eslab qolinadigan va jozibali logotip/avatarka.',
        deliverTime: '12 soat ichida',
        specs: ['800x800 Yuqori tiniqlik', 'Yorqin ranglar', 'Vektorli format']
      },
      {
        id: 'yt-preview',
        name: 'YouTube Video Preview (Prevyu/Presh)',
        price: 30000,
        description: 'CTR (bosishlar foizi)ni oshiruvchi, e\'tiborni tortadigan video muqovasi (Thumbnail).',
        recommended: true,
        deliverTime: '12-24 soat ichida',
        specs: ['1280x720 60fps sifat', 'Yuqori CTR kafolati', 'Emotsional dizayn']
      },
      {
        id: 'yt-full-pack',
        name: 'YouTube To\'liq Komplekt (Banner + Logo + 2 ta Prevyu)',
        price: 95000,
        description: 'Kanalingizni noldan eng yuqori darajada bezatish uchun maxsus chegirmali komplekt.',
        deliverTime: '48 soat ichida',
        specs: ['100% Yagona uslub', 'VIP qulaylik', 'Tezkor tayyorlash']
      }
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram Uchun',
    badge: 'Ommabop',
    description: 'Telegram kanal va guruhlaringiz uchun rasmiy va zamonaviy grafik ishlanmalar',
    services: [
      {
        id: 'tg-avatar',
        name: 'Telegram Kanal / Guruh Avatarkasi',
        price: 25000,
        description: 'Mijoz va obunachilar ko\'ziga darhol tashlanadigan brend avatarka.',
        deliverTime: '12 soat ichida',
        specs: ['1000x1000 Kvadrat', 'Tiniq va o\'qilishi oson', 'Premium ramka']
      },
      {
        id: 'tg-banner',
        name: 'Telegram Kanal Bosh Banneri',
        price: 40000,
        description: 'Kanal havolasi ulashilganda ko\'rinadigan jozibali preview banner.',
        deliverTime: '24 soat ichida',
        specs: ['Gorizontal format', 'Reklama havolalariga mos', 'Yuqori konversiya']
      },
      {
        id: 'tg-post-template',
        name: 'Telegram Post Shabloni / Infografika',
        price: 35000,
        description: 'Postlaringiz uchun brendlashtirilgan o\'zgacha rasmiy fotoshoblon.',
        recommended: true,
        deliverTime: '18 soat ichida',
        specs: ['Brend ranglaringizda', 'Matn va rasm bloklari', 'Qayta ishlatishga qulay']
      },
      {
        id: 'tg-vip-pack',
        name: 'Telegram VIP Brand Komplekt',
        price: 85000,
        description: 'Kanal avatarkasi + Bosh banner + 2 xil post shabloni to\'plami.',
        deliverTime: '24 soat ichida',
        specs: ['To\'liq brending', 'Kanalga tashrif buyuruvchilarni jalb qilish', 'VIP status']
      }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram Uchun',
    badge: 'Estetika',
    description: 'Instagram sahifangizni zamonaviy va professional ko\'rinishga keltiruvchi vizual dizaynlar',
    services: [
      {
        id: 'ig-avatar',
        name: 'Instagram Profil Avatarkasi',
        price: 25000,
        description: 'Biznes yoki shaxsiy profil uchun zamonaviy estetik avatarka logotip.',
        deliverTime: '12 soat ichida',
        specs: ['1080x1080 Yuqori sifat', 'Estetik tipografika', 'Minimalist uslub']
      },
      {
        id: 'ig-highlights',
        name: 'Instagram Highlights Muqovalari (5 ta)',
        price: 35000,
        description: 'Aktual hikoyalar uchun yagona uslubdagi 5 ta piktogrammali chiroyli muqova.',
        deliverTime: '18 soat ichida',
        specs: ['5 xil aktual muqovasi', 'Vektorli ikonikalar', 'Brend ranglariga mos']
      },
      {
        id: 'ig-post-carusel',
        name: 'Instagram Post / Karusel Shabloni',
        price: 45000,
        description: 'Ekspertlik va savdo postlari uchun ko\'p qismli karusel va vizual shablon.',
        recommended: true,
        deliverTime: '24 soat ichida',
        specs: ['1080x1350 portret format', 'Karusel sahifalar', 'Brend identifikatsiyasi']
      },
      {
        id: 'ig-full-grid',
        name: 'Instagram VIP Vizual Gridi (9 ta Post)',
        price: 110000,
        description: 'Profil tasmasini yagona mozaika shaklida tutashtiruvchi 9 ta dabdabali post dizayni.',
        deliverTime: '48 soat ichida',
        specs: ['9 qismli mozaik kompozitsiya', 'Profil estetikasini oshirish', 'PSD / PNG manba fayllar']
      }
    ]
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile Uchun',
    badge: 'E-Sports',
    description: 'PUBG Mobile klanlari, geymerlar va turnirlar uchun agressiv kibersport uslubidagi dizaynlar',
    services: [
      {
        id: 'pubg-avatar',
        name: 'PUBG Mascot / Klan Avatarkasi',
        price: 35000,
        description: 'Mascot qahramon yoki klan nomingiz yozilgan professional kiber-sport avatarkasi.',
        recommended: true,
        deliverTime: '18 soat ichida',
        specs: ['Mascot / 3D effekt', 'Geymer ramkasi', 'Profilga mos kvadrat format']
      },
      {
        id: 'pubg-banner',
        name: 'PUBG Klan Bosh Banneri / Afisha',
        price: 45000,
        description: 'Klan a\'zolari, yutuqlar va turnir g\'alabalari uchun daxshatli banner.',
        deliverTime: '24 soat ichida',
        specs: ['Neon effektlar', 'Klan shiori va logosi', 'Telegram/YouTube/Discordga mos']
      },
      {
        id: 'pubg-roster',
        name: 'PUBG Turnir Rosteri (Tarkib Jadvali)',
        price: 50000,
        description: 'Scrims va rasmiy turnirlar uchun o\'yinchilar ID si va rollari aks etgan grafik ro\'yxat.',
        deliverTime: '24 soat ichida',
        specs: ['Line-up grafik jadvali', 'Tiniq shriftlar', 'Turnir hakamlariga taqdim etishga tayyor']
      },
      {
        id: 'pubg-vip-pack',
        name: 'PUBG E-Sports VIP Paket',
        price: 140000,
        description: 'Asosiy Klan Logotipi + Turnir Rosteri + 4 ta O\'yinchi Avatarkasi to\'liq paketi.',
        deliverTime: '48 soat ichida',
        specs: ['Mukammal klan brendingi', 'Turnir va scrimslarda ajralib turish', 'Cheksiz tahrirlash']
      }
    ]
  }
];

const UZ_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  'Andijon',
  'Farg\'ona',
  'Namangan',
  'Buxoro',
  'Qashqadaryo',
  'Surxondaryo',
  'Xorazm',
  'Navoiy',
  'Jizzax',
  'Sirdaryo',
  'Qoraqalpog\'iston'
];

interface ElbekDesignViewProps {
  onBackToHome?: () => void;
  onGoToTyping?: () => void;
  onOpenAuth?: () => void;
}

export const ElbekDesignView: React.FC<ElbekDesignViewProps> = ({
  onBackToHome,
  onGoToTyping
}) => {
  const { user, profile } = useAuth();

  // Stepper: 1 - Kategoriya, 2 - Xizmat & Narx, 3 - Ma'lumotlar & Joylashuv, 4 - To'lov & Tasdiqlash
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Category & Service
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('youtube');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('yt-banner');

  // Step 3 Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+998 ');
  const [clientTelegram, setClientTelegram] = useState('@');
  const [clientNotes, setClientNotes] = useState('');
  const [clientLocation, setClientLocation] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  // Step 4 State
  const [isCopiedCard, setIsCopiedCard] = useState(false);
  const [isCopiedTelegram, setIsCopiedTelegram] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const locationSectionRef = useRef<HTMLDivElement>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const TELEGRAM_USERNAME = 'elbekdesign_va_webdasturchi_uz';
  const TELEGRAM_LINK = 'https://t.me/elbekdesign_va_webdasturchi_uz';
  const CARD_NUMBER = '4073 4200 8456 9577';
  const CARD_HOLDER = 'Elbek Qoriyev';

  // Conveniently pre-fill clientName with user's name if logged in on the site
  useEffect(() => {
    if (user && !clientName) {
      const name = user.displayName || profile?.username || '';
      if (name) setClientName(name);
    }
  }, [user, profile]);

  // Clean up cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Guard: If in step 4 without mandatory location, return to step 3
  useEffect(() => {
    if (currentStep === 4 && !clientLocation.trim()) {
      setCurrentStep(3);
      setLocationError("Lokatsiyani qo'shish majburiy! Lokatsiyasiz to'lov sahifasiga o'tib bo'lmaydi.");
    }
  }, [currentStep, clientLocation]);

  // Current category & service helpers
  const currentCategory = DESIGN_CATEGORIES.find((c) => c.id === selectedCategoryId) || DESIGN_CATEGORIES[0];
  const currentService =
    currentCategory.services.find((s) => s.id === selectedServiceId) ||
    currentCategory.services[0];

  const userProvider = user?.providerData?.[0]?.providerId === 'github.com' ? 'GitHub' : 'Google';

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER.replace(/\s+/g, ''));
    } catch {
      // Fallback
    }
    setIsCopiedCard(true);
    setTimeout(() => setIsCopiedCard(false), 2000);
  };

  const handleCopyTelegram = async () => {
    try {
      await navigator.clipboard.writeText(TELEGRAM_LINK);
    } catch {
      // Fallback
    }
    setIsCopiedTelegram(true);
    setTimeout(() => setIsCopiedTelegram(false), 2000);
  };

  // Robust, high-precision geolocation detection
  const handleGetLocation = () => {
    setLocationError(null);
    setLocationSuccessMsg(null);

    if (!navigator.geolocation) {
      setLocationError("Brauzeringizda GPS qo'llab-quvvatlanmadi. Iltimos, hududingizni tanlang yoki manzilingizni yozing.");
      setShowManualInput(true);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
        setClientLocation(mapsLink);
        setIsLocating(false);
        setLocationError(null);
        setLocationSuccessMsg(`GPS Koordinata muvaffaqiyatli aniqlandi (${lat}, ${lon})`);
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = "Lokatsiyani aniqlashda ruxsat berilmadi yoki xatolik yuz berdi.";
        if (err.code === 1) {
          errorMsg = "GPS-ga ruxsat berilmadi. Quyidagi viloyatlardan birini tanlang yoki manzilingizni yozing.";
        } else if (err.code === 2) {
          errorMsg = "Joylashuvni aniqlab bo'lmadi. GPS yoqilganini tekshiring yoki manzilingizni yozing.";
        } else if (err.code === 3) {
          errorMsg = "GPS aniqlash vaqti tugadi. Qayta urinib ko'ring yoki manzilingizni tanlang.";
        }
        setLocationError(errorMsg);
        setShowManualInput(true);
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Quick region selection helper
  const handleSelectRegion = (region: string) => {
    setClientLocation(region);
    setLocationError(null);
    setLocationSuccessMsg(`Joylashuv belgilandi: ${region}`);
  };

  // Transition from Step 3 to Step 4: Strictly enforce Location only
  const handleProceedToPayment = () => {
    if (!clientName.trim()) {
      alert("Iltimos, ism va familiyangizni kiriting.");
      return;
    }

    if (!clientPhone.trim() || clientPhone.trim() === '+998') {
      alert("Iltimos, telefon raqamingizni to'liq kiriting.");
      return;
    }

    // MANDATORY LOCATION CHECK
    if (!clientLocation.trim()) {
      setLocationError("Lokatsiyani qo'shish majburiydir! Lokatsiyani kiritmasdan yoki tanlamasdan to'lovga o'tib bo'lmaydi.");
      alert("Lokatsiyani qo'shish majburiy!\n\nIltimos, «GPS Lokatsiyani Aniqlash» tugmasini bosing yoki hududingizni tanlang.");
      locationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLocationError(null);
    setCurrentStep(4);
  };

  // Submit Order to Server -> Telegram Bot directly
  const handleSubmitOrder = async () => {
    if (cooldownRemaining > 0) {
      alert(`Iltimos, qayta yuborish uchun ${cooldownRemaining} soniya kuting.`);
      return;
    }

    if (!clientName.trim()) {
      alert("Iltimos, ism va familiyangizni kiriting.");
      setCurrentStep(3);
      return;
    }

    if (!clientPhone.trim() || clientPhone.trim() === '+998') {
      alert("Iltimos, telefon raqamingizni to'liq kiriting.");
      setCurrentStep(3);
      return;
    }

    // STRICT MANDATORY LOCATION CHECK ON SUBMISSION
    if (!clientLocation.trim()) {
      alert("Xatolik: Lokatsiyani qo'shish majburiydir! Lokatsiyasiz buyurtma berish mumkin emas.");
      setCurrentStep(3);
      setLocationError("Lokatsiyani qo'shish majburiy!");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('/api/design-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: currentCategory.name,
          serviceName: currentService.name,
          price: currentService.price,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          clientTelegram: clientTelegram.trim(),
          notes: clientNotes.trim(),
          location: clientLocation.trim(),
          userId: user?.uid || undefined,
          userEmail: user?.email || undefined,
          authProvider: user ? userProvider : undefined
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server javobi noto'g'ri bo'ldi (${response.status})`);
      }

      if (response.ok && data.success) {
        setOrderSuccessId(data.orderId || `ED-${Math.floor(1000 + Math.random() * 9000)}`);
        setCooldownRemaining(10);
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = setInterval(() => {
          setCooldownRemaining((prev) => {
            if (prev <= 1) {
              if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setSubmitError(data.error || `Server xatolik qaytardi (${response.status}). Iltimos qayta urinib ko'ring.`);
      }
    } catch (err: any) {
      console.error("Design order submission error:", err);
      if (err.name === 'AbortError') {
        setSubmitError("So'rov vaqti tugadi (Timeout). Iltimos internetingizni tekshirib qayta urinib ko'ring.");
      } else {
        setSubmitError(err?.message || "Server bilan bog'lanishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryIcon = (catId: string) => {
    if (catId === 'youtube') return <Video className="w-5 h-5 text-red-400 shrink-0" />;
    if (catId === 'telegram') return <Send className="w-5 h-5 text-sky-400 shrink-0" />;
    if (catId === 'instagram') return <Camera className="w-5 h-5 text-pink-400 shrink-0" />;
    return <Gamepad2 className="w-5 h-5 text-amber-400 shrink-0" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 sm:px-4 select-none font-sans space-y-3.5">
      {/* 1. Header: Elbek Design Studio */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shrink-0">
            ED
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[var(--text-color)]">
                Elbek Design
              </h1>
              <span className="text-[10px] font-mono uppercase text-amber-400/90 font-semibold">
                Buyurtma Berish
              </span>
            </div>
            <p className="text-xs text-[var(--sub-color)]">
              YouTube, Telegram, Instagram va PUBG Mobile dizayn xizmatlari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onGoToTyping && (
            <button
              onClick={onGoToTyping}
              className="px-3 py-1.5 rounded-lg bg-[var(--sub-alt)]/60 hover:bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Klaviaturada Mashq</span>
            </button>
          )}

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 rounded-lg bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bosh sahifa</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Logged-in Account indicator if user is already authenticated on the site */}
      {user && (
        <div className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                ✓
              </div>
            )}
            <span className="text-[var(--sub-color)] truncate">
              Kirilgan akkount: <strong className="text-[var(--text-color)]">{user.displayName || profile?.username || user.email}</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0 font-semibold">
            ✓ Bog'langan
          </span>
        </div>
      )}

      {/* 2. Stepper Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
            currentStep === 1
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 font-bold'
              : currentStep > 1
              ? 'bg-[var(--card-bg)] border-emerald-500/40 text-emerald-400'
              : 'bg-[var(--card-bg)] border-[var(--sub-alt)] text-[var(--sub-color)]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] bg-black/30 shrink-0">
            {currentStep > 1 ? '✓' : '1'}
          </span>
          <span className="truncate">1. Kategoriya</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (selectedCategoryId) setCurrentStep(2);
          }}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
            currentStep === 2
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 font-bold'
              : currentStep > 2
              ? 'bg-[var(--card-bg)] border-emerald-500/40 text-emerald-400'
              : 'bg-[var(--card-bg)] border-[var(--sub-alt)] text-[var(--sub-color)]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] bg-black/30 shrink-0">
            {currentStep > 2 ? '✓' : '2'}
          </span>
          <span className="truncate">2. Xizmat & Narx</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (selectedServiceId) setCurrentStep(3);
          }}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
            currentStep === 3
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 font-bold'
              : currentStep > 3
              ? 'bg-[var(--card-bg)] border-emerald-500/40 text-emerald-400'
              : 'bg-[var(--card-bg)] border-[var(--sub-alt)] text-[var(--sub-color)]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] bg-black/30 shrink-0">
            {currentStep > 3 ? '✓' : '3'}
          </span>
          <span className="truncate">3. Ma'lumot & Joy</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (clientName && clientPhone && clientLocation.trim()) setCurrentStep(4);
          }}
          className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
            currentStep === 4
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 font-bold'
              : 'bg-[var(--card-bg)] border-[var(--sub-alt)] text-[var(--sub-color)]'
          }`}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] bg-black/30 shrink-0">
            4
          </span>
          <span className="truncate">4. To'lov & Tasdiq</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUCCESS SCREEN (BUYURTMA BERILGANDA KO'RINADIGAN OYNA)                      */}
      {/* ========================================================================= */}
      {orderSuccessId && (
        <div className="p-5 sm:p-7 rounded-2xl bg-[var(--card-bg)] border-2 border-emerald-500 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 inline-block">
              Buyurtma ID: #{orderSuccessId} ✓
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Buyurtmangiz Muvaffaqiyatli Qabul Qilindi!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Barcha buyurtma tafsilotlari to'g'ridan-to'g'ri Telegram botimizga yetkazildi.
            </p>
          </div>

          {/* TELEGRAM NOTICE CARD */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-sky-950/80 via-slate-900 to-sky-900/60 border-2 border-sky-400/80 text-left space-y-3 max-w-xl mx-auto shadow-lg">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Send className="w-5 h-5 shrink-0" />
              <span>To'lov chekini quyidagi Telegram manzilimizga yuboring:</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              To'lov qilganingizdan so'ng, chek rasmini (skrinshotini) bizning rasmiy Telegram lichkamizga tashlang.
              Mutaxassislarimiz chekni va buyurtmangizni tekshirib, <strong>tez orada siz bilan bog'lanishadi va javob berishadi!</strong>
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>Chekni Telegramga Tashlash (@{TELEGRAM_USERNAME})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyTelegram}
                className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer border border-sky-500/30"
              >
                {isCopiedTelegram ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedTelegram ? 'Nusxalandi ✓' : 'Linkni nusxalash'}</span>
              </button>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] max-w-xl mx-auto text-left font-mono text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between border-b border-[var(--sub-alt)]/60 pb-1.5">
              <span className="text-slate-400">Xizmat:</span>
              <span className="text-white font-bold text-right">{currentCategory.name} — {currentService.name}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--sub-alt)]/60 pb-1.5">
              <span className="text-slate-400">Summa:</span>
              <span className="text-amber-400 font-bold">{currentService.price.toLocaleString('uz-UZ')} so'm</span>
            </div>
            <div className="flex justify-between border-b border-[var(--sub-alt)]/60 pb-1.5">
              <span className="text-slate-400">Buyurtmachi:</span>
              <span className="text-white">{clientName} ({clientPhone})</span>
            </div>
            {clientTelegram && clientTelegram !== '@' && (
              <div className="flex justify-between border-b border-[var(--sub-alt)]/60 pb-1.5">
                <span className="text-slate-400">Telegram:</span>
                <span className="text-sky-400">{clientTelegram}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Lokatsiya:</span>
              <span className="text-emerald-400 truncate max-w-[240px] text-right">{clientLocation}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setOrderSuccessId(null);
                setCurrentStep(1);
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-white font-bold text-xs font-mono cursor-pointer"
            >
              Yangi Buyurtma Berish
            </button>

            {onGoToTyping && (
              <button
                onClick={onGoToTyping}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Keyboard className="w-4 h-4" />
                <span>Klaviaturada Mashq Qilish</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: CATEGORY SELECTION ONLY                                           */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 1 && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-color)]">
              1-Bosqich: Yo'nalishni Tanlang
            </span>
            <span className="text-[11px] font-mono text-[var(--sub-color)]">
              4 xil yo'nalish mavjud
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DESIGN_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedServiceId(cat.services[0].id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-[var(--card-bg)] border-[var(--sub-alt)] hover:border-[var(--text-color)]/30'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderCategoryIcon(cat.id)}
                        <h3 className="text-sm font-bold text-[var(--text-color)]">
                          {cat.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                        {cat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--sub-alt)]/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--sub-color)] text-[11px]">
                      {cat.services.length} ta xizmat turi
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isSelected ? 'text-amber-400' : 'text-[var(--sub-color)]'
                      }`}
                    >
                      {isSelected ? 'Tanlandi ✓' : 'Tanlash'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom navigation */}
          <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between">
            <div className="text-xs">
              <span className="text-[var(--sub-color)]">Tanlangan: </span>
              <strong className="text-[var(--text-color)]">{currentCategory.name}</strong>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>Keyingisi (Xizmatlar)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SERVICE SELECTION & PRICING                                       */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 2 && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {renderCategoryIcon(currentCategory.id)}
              <span className="font-bold text-[var(--text-color)]">
                2-Bosqich: {currentCategory.name} xizmatlaridan birini tanlang
              </span>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-mono text-[var(--sub-color)] hover:text-amber-400 underline cursor-pointer"
            >
              Kategoriyani o'zgartirish
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentCategory.services.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-[var(--card-bg)] border-[var(--sub-alt)] hover:border-[var(--text-color)]/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-[var(--text-color)] leading-snug">
                        {service.name}
                      </h4>
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-sm font-bold text-amber-400">
                          {service.price.toLocaleString('uz-UZ')}
                        </span>
                        <span className="text-[10px] text-[var(--sub-color)] block">so'm</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-1">
                      {service.specs.map((spec, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)]/60 text-[10px] font-mono text-[var(--text-color)]"
                        >
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-[var(--sub-alt)]/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--sub-color)] flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{service.deliverTime}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isSelected ? 'text-amber-400' : 'text-[var(--sub-color)]'
                      }`}
                    >
                      {isSelected ? 'Tanlandi ✓' : 'Tanlash'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-mono flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orqaga</span>
            </button>

            <div className="text-center sm:text-right text-xs">
              <span className="text-[10px] text-[var(--sub-color)] font-mono block">Tanlangan Xizmat:</span>
              <span className="font-bold text-[var(--text-color)]">{currentService.name}</span>{' '}
              <span className="text-amber-400 font-mono font-bold">
                ({currentService.price.toLocaleString('uz-UZ')} so'm)
              </span>
            </div>

            <button
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Keyingisi (Ma'lumotlar)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CLIENT INFO & MANDATORY LOCATION                                  */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 3 && (
        <div className="space-y-3 max-w-xl mx-auto">
          {/* Selected Service Bar */}
          <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-mono text-[var(--sub-color)] block uppercase">Xizmat:</span>
              <strong className="text-[var(--text-color)]">{currentCategory.name} — {currentService.name}</strong>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-amber-400 block">
                {currentService.price.toLocaleString('uz-UZ')} so'm
              </span>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-[10px] text-[var(--sub-color)] hover:text-amber-400 underline cursor-pointer"
              >
                O'zgartirish
              </button>
            </div>
          </div>

          {/* Client Details Form */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-color)] pb-2 border-b border-[var(--sub-alt)]">
              3-Bosqich: Buyurtmachi Ma'lumotlari & Joylashuv
            </h3>

            {/* Ism & Familiya */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-[var(--text-color)] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Ism va Familiyangiz *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Jasur Alimov"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            {/* Telefon & Telegram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-[var(--text-color)] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Telefon Raqam *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs font-mono text-[var(--text-color)] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-[var(--text-color)] flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Telegram (@username)</span>
                </label>
                <input
                  type="text"
                  placeholder="@foydalanuvchi"
                  value={clientTelegram}
                  onChange={(e) => setClientTelegram(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs font-mono text-[var(--text-color)] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Fikr / Talablar */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-[var(--text-color)] flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Dizayn haqida fikr va talablaringiz</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ranglar, matnlar va logotip talablari..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-amber-400 resize-none font-sans"
              />
            </div>

            {/* Geolocation Section (MANDATORY & ENHANCED WITH REGION/MANUAL FALLBACK) */}
            <div ref={locationSectionRef} className="pt-2 space-y-2.5 border-t border-[var(--sub-alt)]">
              <div
                className={`p-3.5 rounded-xl border ${
                  clientLocation.trim()
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-[var(--bg-color)] border-amber-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        className={`w-4 h-4 ${
                          clientLocation.trim() ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                      <span className="text-xs font-mono font-bold text-[var(--text-color)]">
                        Joylashuv (Lokatsiya)
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                        Majburiy *
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--sub-color)]">
                      {clientLocation.trim() ? (
                        <span className="text-emerald-400 font-semibold">✓ Joylashuv muvaffaqiyatli biriktirildi.</span>
                      ) : (
                        <span className="text-amber-300">GPS tugmasini bosing yoki hududingizni tanlang.</span>
                      )}
                    </p>
                  </div>

                  {/* GPS Detection Button */}
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                      clientLocation.trim()
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                    }`}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>
                      {isLocating
                        ? 'GPS aniqlanmoqda...'
                        : clientLocation.trim()
                        ? 'Qayta Aniqlash (GPS)'
                        : 'Mening Joylashuvim (GPS)'}
                    </span>
                  </button>
                </div>

                {/* Detected Location Display */}
                {clientLocation.trim() && (
                  <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-emerald-500/40 flex items-center justify-between gap-2 text-xs font-mono mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 text-xs truncate">
                        {clientLocation}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {clientLocation.startsWith('http') ? (
                        <a
                          href={clientLocation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/30 cursor-pointer"
                        >
                          <span>Xaritada Ko'rish</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(clientLocation)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/30 cursor-pointer"
                        >
                          <span>Xaritada Ochish</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowManualInput(!showManualInput)}
                        className="px-2 py-1 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white text-[11px] cursor-pointer"
                      >
                        {showManualInput ? 'Yopish' : 'Tahrirlash'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Message Banner */}
                {locationSuccessMsg && (
                  <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{locationSuccessMsg}</span>
                  </div>
                )}

                {/* Error Banner */}
                {locationError && (
                  <div className="p-2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{locationError}</p>
                      <p className="text-[10px] text-rose-300/80">
                        GPS ishlamasa, quyidagi viloyatlardan birini bosish yoki manzilingizni yozish kifoya.
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Region Selector (Viloyatlar orqali 1 bosishda tanlash) */}
                <div className="pt-2 border-t border-[var(--sub-alt)]/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--sub-color)]">
                    <span>Viloyat / Shaharni tezkor tanlash:</span>
                    <button
                      type="button"
                      onClick={() => setShowManualInput(!showManualInput)}
                      className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showManualInput ? 'Yopish' : 'Aniq manzil yozish'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {UZ_REGIONS.map((reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => handleSelectRegion(reg)}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                          clientLocation === reg
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-[var(--card-bg)] hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] border border-[var(--sub-alt)]'
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>

                  {/* Manual Address Input */}
                  {(showManualInput || !clientLocation.trim()) && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-mono text-[var(--sub-color)] block">
                        Yoki aniq ko'cha, tuman va uy raqamingiz:
                      </span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Masalan: Toshkent, Chilonzor 9, 14-uy..."
                          value={clientLocation.startsWith('http') ? '' : clientLocation}
                          onChange={(e) => {
                            setClientLocation(e.target.value);
                            if (e.target.value.trim()) {
                              setLocationError(null);
                              setLocationSuccessMsg(null);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-amber-400 font-sans"
                        />
                        {clientLocation.trim() && !clientLocation.startsWith('http') && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowManualInput(false);
                              setLocationError(null);
                              setLocationSuccessMsg("Manzil saqlandi ✓");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-mono font-bold cursor-pointer"
                          >
                            Saqlash
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orqaga</span>
            </button>

            <button
              onClick={handleProceedToPayment}
              className={`px-5 py-2 rounded-lg font-bold text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer shadow-md ${
                clientLocation.trim()
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {!clientLocation.trim() && <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>
                {!clientLocation.trim()
                  ? "To'lovga O'tish (Lokatsiya Majburiy)"
                  : "To'lovga O'tish"}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: PAYMENT & ORDER CONFIRMATION (CHEK YUKLASH SHART EMAS)            */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 4 && (
        <div className="space-y-3.5 max-w-xl mx-auto">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--sub-color)]">Buyurtma Xulosasi:</span>
                <div className="font-bold text-[var(--text-color)]">{currentCategory.name} — {currentService.name}</div>
                <div className="text-[var(--sub-color)] mt-0.5">
                  Mijoz: <span className="text-[var(--text-color)] font-semibold">{clientName}</span> ({clientPhone})
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-bold text-amber-400">
                  {currentService.price.toLocaleString('uz-UZ')}
                </span>
                <span className="text-[10px] text-[var(--sub-color)] block">so'm</span>
              </div>
            </div>

            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold shrink-0">Lokatsiya:</span>
                <span className="text-slate-200 truncate">{clientLocation}</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-[10px] text-emerald-400 underline font-semibold shrink-0 cursor-pointer"
              >
                O'zgartirish
              </button>
            </div>
          </div>

          {/* Payment Card Box */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-amber-500/40 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">To'lov Uchun Karta</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Click / Payme / Uzum Bank
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-color)] border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="text-base sm:text-lg font-bold font-mono tracking-wider text-amber-300">
                  {CARD_NUMBER}
                </div>
                <div className="text-xs font-mono text-slate-300 mt-0.5">
                  Karta egasi: <strong className="text-white">{CARD_HOLDER}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCard}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1 cursor-pointer transition-all shadow"
              >
                {isCopiedCard ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedCard ? 'Nusxa Olindi ✓' : 'Karta Raqamini Olish'}</span>
              </button>
            </div>
          </div>

          {/* CHEK YUKLASH SHART EMAS TUSHUNTIRISH BLOKI */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/60 via-[var(--card-bg)] to-sky-900/40 border border-sky-500/40 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Chek yuklash shart emas!</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Saytga chek rasmini yuklash talab etilmaydi. Pastdagi <strong>«Buyurtmani Berish»</strong> tugmasini bosishingiz bilan buyurtma tafsilotlari Telegram botimizga yuboriladi.
            </p>

            <div className="p-2.5 rounded-lg bg-black/40 border border-sky-500/20 text-xs text-slate-300 space-y-1">
              <p>
                To'lov chekini esa to'g'ridan-to'g'ri Telegram orqali lichkamizga tashlaysiz:
              </p>
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-300 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>{TELEGRAM_LINK}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-[11px] text-slate-400 pt-0.5">
                Mutaxassislarimiz chekni tekshirib, tez orada sizga javob berishadi.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Stepper Buttons & Submit to Telegram Bot */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-mono flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orqaga</span>
            </button>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cooldownRemaining > 0}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Botga yuborilmoqda..."
                  : cooldownRemaining > 0
                  ? `Kuting (${cooldownRemaining}s)`
                  : "Buyurtma Berish (Telegram Botga)"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
