import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  ArrowLeft,
  CheckCircle2,
  Upload,
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
  Gamepad2
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

const DESIGN_CATEGORIES: CategoryItem[] = [
  {
    id: 'youtube',
    name: 'YouTube Uchun',
    badge: 'Trend',
    description: 'Kanalingiz obunachilarini jalb qiluvchi yuqori CTR va 4K grafik dizaynlar',
    services: [
      {
        id: 'yt-banner',
        name: 'YouTube Bosh Banner (Muqova)',
        price: 45000,
        description: 'Barcha qurilmalarga (TV, Kompyuter, Telefon) mukammal mos 2560x1440 o\'lchamdagi professional banner.',
        deliverTime: '24 soat ichida',
        specs: ['2560x1440 Ultra HD', 'Barcha qurilmalar safe-zone', 'Manbali PSD/PNG fayl']
      },
      {
        id: 'yt-avatar',
        name: 'YouTube Avatarka / Logo',
        price: 15000,
        description: 'Kanal identifikatsiyasi uchun zamonaviy profil rasmi (vektorli va 3D elementlar).',
        deliverTime: '12 soat ichida',
        specs: ['1000x1000 Yuqori tiniqlik', 'Dumaloq ramkaga mos', 'PNG shaffof fon']
      },
      {
        id: 'yt-preview',
        name: 'YouTube Preview / Muqova (Thumbnail)',
        price: 65000,
        description: 'Ko\'ruvchilar e\'tiborini darhol tortuvchi, kliklar foizini (CTR) oshiruvchi jozibador muqova.',
        recommended: true,
        deliverTime: '18 soat ichida',
        specs: ['1920x1080 Full HD', 'Yuqori CTR kompozitsiya', 'Fotoshopda chizilgan']
      },
      {
        id: 'yt-full-pack',
        name: 'YouTube VIP Komplekt (Banner + Avatarka + 2 ta Preview)',
        price: 110000,
        description: 'Kanalni noldan yulduzli darajaga ko\'tarish uchun to\'liq professional dizayn to\'plami.',
        deliverTime: '24-48 soat ichida',
        specs: ['1 ta Asosiy Banner', '1 ta Logo / Avatarka', '2 ta VIP Video Preview', 'Bepul tuzatishlar']
      }
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram Uchun',
    badge: 'Ommabop',
    description: 'Telegram kanallar, guruhlar va shaxsiy brendlar uchun zamonaviy dizaynlar',
    services: [
      {
        id: 'tg-avatar',
        name: 'Telegram Kanal / Guruh Avatarkasi',
        price: 20000,
        description: 'Kanal nomiga mos premium minimalist yoki 3D logotip avatarka.',
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
        id: 'ig-full-pack',
        name: 'Instagram VIP Paket (Profil + Highlights + 3 ta Post)',
        price: 95000,
        description: 'Instagram sahifani professional tijoriy brend darajasiga olib chiquvchi to\'liq to\'plam.',
        deliverTime: '24-48 soat ichida',
        specs: ['1 ta Avatarka', '5 ta Highlights', '3 ta Post Shabloni', 'PSD manbalar']
      }
    ]
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile Uchun',
    badge: 'Kibersport',
    description: 'Klanlar, turnir jamoalari va o\'yinchilar uchun jangovar kibersport dizaynlari',
    services: [
      {
        id: 'pubg-clan-logo',
        name: 'Klan Logotipi (E-Sports Mascot)',
        price: 35000,
        description: 'Jamoangiz sharafini himoya qiluvchi kibersport uslubidagi yirtqich/jangchi mascot logotipi.',
        recommended: true,
        deliverTime: '24 soat ichida',
        specs: ['Vektorli E-sports Mascot', 'Klan nomiga moslashtirilgan', 'Tiniq HD format']
      },
      {
        id: 'pubg-roster',
        name: 'Turnir / Roster Posteri',
        price: 45000,
        description: 'Jamoa tarkibi (roster), o\'yinchilar niki va yutuqlari aks etgan professional poster.',
        deliverTime: '24 soat ichida',
        specs: ['Kibersport effekti', 'O\'yinchilar fotosi bilan', 'Turnirlar uchun rasmiy format']
      },
      {
        id: 'pubg-avatars',
        name: 'Klan A\'zolari Avatarkalari (4 ta)',
        price: 60000,
        description: 'Asosiy to\'rtlik (Squad) a\'zolari uchun nomlari yozilgan maxsus avatarkalar.',
        deliverTime: '24 soat ichida',
        specs: ['4 ta alohida avatarka', 'Jamoaviy yagona uslub', 'O\'yin ichiga mos']
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

interface ElbekDesignViewProps {
  onBackToHome?: () => void;
  onGoToTyping?: () => void;
  onOpenAuth?: () => void;
}

export const ElbekDesignView: React.FC<ElbekDesignViewProps> = ({
  onBackToHome,
  onGoToTyping
}) => {
  // Existing site auth (if user is already logged in on the site, their info is utilized)
  const { user, profile } = useAuth();

  // Stepper: 1 - Kategoriya, 2 - Xizmat & Narx, 3 - Ma'lumotlar & Joylashuv, 4 - To'lov & Chek
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  // Step 4 Payment & Receipt State
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isCopiedCard, setIsCopiedCard] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Guard: If somehow in step 4 without mandatory location, return to step 3
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

  const CARD_NUMBER = '4073 4200 8456 9577';
  const CARD_HOLDER = 'Elbek Qoriyev';

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

  // Geolocation trigger (MANDATORY GPS detection)
  const handleGetLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Brauzeringizda GPS qo'llab-quvvatlanmadi. Iltimos manzilingizni yozing.");
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
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = "Lokatsiyani aniqlashda ruxsat berilmadi yoki xatolik yuz berdi.";
        if (err.code === 1) {
          errorMsg = "Brauzeringizda geolokatsiyaga ruxsat berilmadi. Iltimos ruxsat bering yoki aniq manzilingizni kiriting.";
        } else if (err.code === 2) {
          errorMsg = "Qurilmangizda joylashuvni aniqlab bo'lmadi. Iltimos GPS-ni yoqing yoki manzilingizni yozing.";
        } else if (err.code === 3) {
          errorMsg = "Lokatsiyani aniqlash vaqti tugadi. Qayta urinib ko'ring yoki manzilingizni yozing.";
        }
        setLocationError(errorMsg);
        setShowManualInput(true);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
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
      setLocationError("Lokatsiyani qo'shish majburiydir! Lokatsiyani kiritmasdan yoki yoqmasdan to'lovga o'tib bo'lmaydi.");
      alert("Lokatsiyani qo'shish majburiy!\n\nLokatsiyani qo'shmasdan to'lovga o'tish va buyurtma berish mumkin emas.\n\nIltimos, GPS tugmasini bosing yoki aniq manzilingizni kiriting.");
      locationSectionRef.current?.scrollIntoView({ block: 'center' });
      return;
    }

    setLocationError(null);
    setCurrentStep(4);
  };

  // Receipt File upload handler
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Iltimos, faqat rasm faylini (JPG, PNG, WebP) yuklang.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Rasm hajmi 8 MB dan oshmasligi kerak.");
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Order to Server -> Telegram Bot
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
          receiptImage: receiptImage || undefined,
          userId: user?.uid || undefined,
          userEmail: user?.email || undefined,
          authProvider: user ? userProvider : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderSuccessId(data.orderId || `ED-${Math.floor(1000 + Math.random() * 9000)}`);
        setCooldownRemaining(30);
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
        setSubmitError(data.error || "Buyurtmani yuborishda xatolik yuz berdi.");
      }
    } catch {
      setSubmitError("Server bilan bog'lanishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
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
      {/* 1. Header: Elbek Design Studio (Minimalist & Ultra-lightweight) */}
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

      {/* 2. Stepper Progress: 4 Distinct Dedicated Steps */}
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
          <span className="truncate">4. To'lov & Chek</span>
        </button>
      </div>

      {/* SUCCESS SCREEN */}
      {orderSuccessId && (
        <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-emerald-500 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <span className="text-xs font-mono font-bold text-emerald-400 block">
              Buyurtma ID: #{orderSuccessId}
            </span>
            <h2 className="text-xl font-bold text-white">
              Buyurtmangiz Muvaffaqiyatli Qabul Qilindi!
            </h2>
            <p className="text-xs text-slate-300">
              Barcha ma'lumotlar va chek Telegram botimizga yuborildi. Tez orada siz bilan bog'lanamiz.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] max-w-md mx-auto text-left font-mono text-xs space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Kategoriya:</span>
              <span className="text-white font-bold">{currentCategory.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Xizmat:</span>
              <span className="text-white font-bold">{currentService.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Summa:</span>
              <span className="text-amber-400 font-bold">{currentService.price.toLocaleString('uz-UZ')} so'm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mijoz:</span>
              <span className="text-white">{clientName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setOrderSuccessId(null);
                setCurrentStep(1);
                setReceiptImage(null);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-white font-bold text-xs font-mono cursor-pointer"
            >
              Yangi Buyurtma Berish
            </button>

            {onGoToTyping && (
              <button
                onClick={onGoToTyping}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Klaviaturada Mashq Qilish</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: CATEGORY SELECTION ONLY (ALOHIDA SAHIFA)                          */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 1 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)]">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-color)]">
              1-Bosqich: Dizayn yo'nalishini tanlang
            </h2>
            <p className="text-xs text-[var(--sub-color)] mt-0.5">
              Qaysi platforma uchun dizayn kerak bo'lsa, tanlang va keyingi sahifaga o'ting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DESIGN_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const minPrice = Math.min(...cat.services.map((s) => s.price));

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedServiceId(cat.services[0].id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--card-bg)] border-amber-400'
                      : 'bg-[var(--card-bg)] border-[var(--sub-alt)] hover:border-amber-400/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--sub-alt)] flex items-center justify-center">
                          {renderCategoryIcon(cat.id)}
                        </div>
                        <h3 className="text-base font-bold text-[var(--text-color)]">
                          {cat.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--sub-color)] font-semibold">
                        {cat.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--sub-alt)]/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--sub-color)] block font-mono">
                        Boshlang'ich narx:
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {minPrice.toLocaleString('uz-UZ')} so'mdan
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      isSelected ? 'bg-amber-400 text-slate-950' : 'bg-[var(--sub-alt)] text-[var(--text-color)]'
                    }`}>
                      {isSelected ? 'Tanlandi ✓' : 'Tanlash'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-[10px] font-mono text-[var(--sub-color)] block">Tanlangan Kategoriya:</span>
              <strong className="text-sm text-[var(--text-color)]">{currentCategory.name}</strong>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Keyingisi (Xizmatlar)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SERVICES & PRICING FOR CHOSEN CATEGORY (ALOHIDA SAHIFA)           */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 2 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold">
                2-Bosqich • {currentCategory.name}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-color)]">
                Kerakli xizmat turini tanlang
              </h2>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-mono flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kategoriyalarga qaytish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentCategory.services.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--card-bg)] border-amber-400'
                      : 'bg-[var(--card-bg)] border-[var(--sub-alt)] hover:border-amber-400/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-[var(--text-color)]">
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

                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      isSelected ? 'text-amber-400' : 'text-[var(--sub-color)]'
                    }`}>
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
      {/* STEP 3: CLIENT INFO & MANDATORY LOCATION (ALOHIDA SAHIFA)                 */}
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

            {/* Geolocation Section (STRICTLY MANDATORY) */}
            <div ref={locationSectionRef} className="pt-2 space-y-2 border-t border-[var(--sub-alt)]">
              <div
                className={`p-3 rounded-lg border ${
                  clientLocation.trim()
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-[var(--bg-color)] border-rose-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        className={`w-4 h-4 ${
                          clientLocation.trim() ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      />
                      <span className="text-xs font-mono font-bold text-[var(--text-color)]">
                        Geolokatsiya
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded">
                        Majburiy *
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--sub-color)]">
                      {clientLocation.trim() ? (
                        <span className="text-emerald-400">✓ Lokatsiya biriktirildi. To'lovga o'tishingiz mumkin.</span>
                      ) : (
                        <span className="text-rose-300">Lokatsiyasiz to'lovga o'tish va buyurtma berish mumkin emas!</span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                      clientLocation.trim()
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {isLocating
                        ? 'Aniqlanmoqda...'
                        : clientLocation.trim()
                        ? 'Yangilash (GPS) ✓'
                        : "Lokatsiyani Aniqlash (GPS) *"}
                    </span>
                  </button>
                </div>

                {/* Detected Location Display */}
                {clientLocation.trim() && (
                  <div className="p-2 rounded bg-[var(--card-bg)] border border-emerald-500/30 flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 text-[11px] truncate">
                        {clientLocation}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {clientLocation.startsWith('http') && (
                        <a
                          href={clientLocation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] flex items-center gap-1"
                        >
                          <span>Xarita</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowManualInput(!showManualInput)}
                        className="px-1.5 py-0.5 rounded bg-[var(--sub-alt)] text-[var(--sub-color)] text-[10px]"
                      >
                        {showManualInput ? 'Yopish' : 'Tahrir'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {locationError && (
                  <div className="mt-2 p-2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{locationError}</p>
                      <p className="text-[10px] text-rose-300/80">
                        GPS ishlamasa, manzilingizni pastda yozma kiritishingiz mumkin.
                      </p>
                    </div>
                  </div>
                )}

                {/* Manual Address Input */}
                {(showManualInput || !clientLocation.trim()) && (
                  <div className="mt-2 pt-2 border-t border-[var(--sub-alt)]/40 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--sub-color)]">
                      <span>Manzil (shahar, tuman, ko'cha):</span>
                      {!showManualInput && (
                        <button
                          type="button"
                          onClick={() => setShowManualInput(true)}
                          className="text-amber-400 underline cursor-pointer"
                        >
                          Qo'lda kiritish
                        </button>
                      )}
                    </div>
                    {showManualInput && (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Toshkent, Chilonzor, 15-uy..."
                          value={clientLocation}
                          onChange={(e) => {
                            setClientLocation(e.target.value);
                            if (e.target.value.trim()) setLocationError(null);
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-color)] border border-[var(--sub-alt)] text-xs text-[var(--text-color)] focus:outline-none focus:border-amber-400 font-sans"
                        />
                        {clientLocation.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowManualInput(false);
                              setLocationError(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold"
                          >
                            Saqlash
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
              className={`px-5 py-2 rounded-lg font-bold text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer ${
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
      {/* STEP 4: PAYMENT & RECEIPT (ALOHIDA SAHIFA)                                 */}
      {/* ========================================================================= */}
      {!orderSuccessId && currentStep === 4 && (
        <div className="space-y-3 max-w-xl mx-auto">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--sub-color)]">Xulosa:</span>
                <div className="font-bold text-[var(--text-color)]">{currentCategory.name} — {currentService.name}</div>
                <div className="text-[var(--sub-color)] mt-0.5">
                  Mijoz: <span className="text-[var(--text-color)]">{clientName}</span> ({clientPhone})
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
                <span className="text-slate-300 truncate">{clientLocation}</span>
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
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-amber-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">To'lov Uchun Karta</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Click / Payme / Uzum
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-color)] border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-base font-bold font-mono tracking-wider text-amber-300">
                  {CARD_NUMBER}
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Egasi: {CARD_HOLDER}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCard}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1 cursor-pointer"
              >
                {isCopiedCard ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedCard ? 'Nusxa Olindi ✓' : 'Nusxa Olish'}</span>
              </button>
            </div>
          </div>

          {/* Receipt Upload Card */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] space-y-2.5">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[var(--text-color)] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>To'lov Cheki (Skrinshot yoki Rasm) *</span>
              </h4>
              <p className="text-[11px] text-[var(--sub-color)]">
                Chek rasmi to'g'ridan-to'g'ri Telegram botimizga yuboriladi.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReceiptUpload}
            />

            {!receiptImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-lg border border-dashed border-[var(--sub-alt)] hover:border-amber-400 bg-[var(--bg-color)] flex flex-col items-center justify-center text-center cursor-pointer space-y-1"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold text-[var(--text-color)]">
                  Chek rasmini yuklash uchun bosing
                </p>
                <p className="text-[10px] text-[var(--sub-color)]">
                  JPG, PNG, WebP (Maksimal 8 MB)
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-[var(--bg-color)] border border-emerald-500/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={receiptImage}
                    alt="Chek"
                    className="w-10 h-10 rounded object-cover border border-emerald-500/30 shrink-0"
                  />
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-emerald-400 block truncate">Chek yuklandi</span>
                    <span className="text-[10px] text-[var(--sub-color)] font-mono truncate block">
                      {receiptFileName || 'chek.jpg'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReceiptImage(null);
                    setReceiptFileName('');
                  }}
                  className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-mono cursor-pointer"
                >
                  O'chirish
                </button>
              </div>
            )}
          </div>

          {submitError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Stepper Buttons & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[var(--sub-alt)] text-[var(--text-color)] text-xs font-mono flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orqaga</span>
            </button>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cooldownRemaining > 0}
              className="w-full sm:w-auto px-6 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Botga yuborilmoqda..."
                  : cooldownRemaining > 0
                  ? `Kuting (${cooldownRemaining}s)`
                  : "Buyurtmani Yuborish (Telegram Bot)"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
