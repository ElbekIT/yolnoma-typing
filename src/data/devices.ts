export type DeviceCategory = 'desktop' | 'phone' | 'iphone' | 'tablet';

export interface DeviceProfile {
  id: string;
  name: string;
  brand: string;
  category: DeviceCategory;
  width: number;
  height: number;
  aspectRatio: string;
  dpr: number;
  icon: string;
  popular?: boolean;
  optimalFontSize: number;
  optimalModeScale: 'small' | 'medium' | 'large';
  optimalPadding: string;
  hasPhysicalKeyboard: boolean;
  description: string;
}

export const DEVICE_PROFILES: DeviceProfile[] = [
  // ================= 1. KOMPYUTER (PC / NOUTBUK) =================
  {
    id: 'desktop-universal',
    name: 'Kompyuter (PC / Noutbuk)',
    brand: 'Universal',
    category: 'desktop',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    dpr: 1.0,
    icon: '💻',
    popular: true,
    optimalFontSize: 25,
    optimalModeScale: 'medium',
    optimalPadding: 'px-8',
    hasPhysicalKeyboard: true,
    description: 'Barcha desktop kompyuterlar, monitorlar va noutbuklar uchun to‘liq moslashuv'
  },

  // ================= 2. ANDROID SMARTFONLAR =================
  {
    id: 'samsung-a22-5g',
    name: 'Samsung Galaxy A22 5G / A22s',
    brand: 'Samsung',
    category: 'phone',
    width: 412,
    height: 915,
    aspectRatio: '20:9',
    dpr: 2.62,
    icon: '📱',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.6" FHD+ 90Hz, 412x915px ekran uchun maxsus drayver'
  },
  {
    id: 'samsung-a54-5g',
    name: 'Samsung Galaxy A54 / A55 5G',
    brand: 'Samsung',
    category: 'phone',
    width: 412,
    height: 915,
    aspectRatio: '20:9',
    dpr: 2.62,
    icon: '📱',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.4" Super AMOLED 120Hz'
  },
  {
    id: 'samsung-a34-5g',
    name: 'Samsung Galaxy A34 / A35 5G',
    brand: 'Samsung',
    category: 'phone',
    width: 412,
    height: 915,
    aspectRatio: '19.5:9',
    dpr: 2.62,
    icon: '📱',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.6" Super AMOLED 120Hz'
  },
  {
    id: 'samsung-a24-5g',
    name: 'Samsung Galaxy A24 / A25 5G',
    brand: 'Samsung',
    category: 'phone',
    width: 412,
    height: 915,
    aspectRatio: '19.5:9',
    dpr: 2.62,
    icon: '📱',
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.5" Super AMOLED'
  },
  {
    id: 'samsung-a14-5g',
    name: 'Samsung Galaxy A14 / A15',
    brand: 'Samsung',
    category: 'phone',
    width: 412,
    height: 915,
    aspectRatio: '20:9',
    dpr: 2.4,
    icon: '📱',
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.5" FHD+ 90Hz'
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra / S23 Ultra',
    brand: 'Samsung',
    category: 'phone',
    width: 412,
    height: 919,
    aspectRatio: '19.5:9',
    dpr: 3.5,
    icon: '📱',
    popular: true,
    optimalFontSize: 20,
    optimalModeScale: 'small',
    optimalPadding: 'px-4',
    hasPhysicalKeyboard: false,
    description: '6.8" Dynamic AMOLED 2X QHD+'
  },
  {
    id: 'samsung-s24-base',
    name: 'Samsung Galaxy S24 / S23 / S22',
    brand: 'Samsung',
    category: 'phone',
    width: 384,
    height: 832,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.2" Dynamic AMOLED 2X'
  },
  {
    id: 'samsung-z-fold',
    name: 'Samsung Galaxy Z Fold 5 / Fold 6',
    brand: 'Samsung',
    category: 'phone',
    width: 373,
    height: 905,
    aspectRatio: '23.1:9',
    dpr: 3.0,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: 'Buklanuvchi ekran (Tashqi va Ichki rejim)'
  },
  {
    id: 'redmi-note-13-pro',
    name: 'Xiaomi Redmi Note 13 Pro / 13 Pro+',
    brand: 'Xiaomi',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20:9',
    dpr: 3.0,
    icon: '📱',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.67" 1.5K CrystalRes AMOLED 120Hz'
  },
  {
    id: 'redmi-note-12-11',
    name: 'Xiaomi Redmi Note 12 / 11 Pro',
    brand: 'Xiaomi',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20:9',
    dpr: 2.75,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.67" FHD+ AMOLED 120Hz'
  },
  {
    id: 'poco-x6-pro',
    name: 'Xiaomi POCO X6 Pro / F5 / F6',
    brand: 'Xiaomi',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20:9',
    dpr: 3.0,
    icon: '📱',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.67" Flow AMOLED 120Hz'
  },
  {
    id: 'xiaomi-14-ultra',
    name: 'Xiaomi 14 Ultra / 13 Pro',
    brand: 'Xiaomi',
    category: 'phone',
    width: 412,
    height: 915,
    aspectRatio: '20:9',
    dpr: 3.5,
    icon: '📱',
    optimalFontSize: 20,
    optimalModeScale: 'small',
    optimalPadding: 'px-4',
    hasPhysicalKeyboard: false,
    description: '6.73" LTPO AMOLED WQHD+'
  },
  {
    id: 'google-pixel-9',
    name: 'Google Pixel 9 Pro / 8 Pro / 7',
    brand: 'Google',
    category: 'phone',
    width: 412,
    height: 923,
    aspectRatio: '20:9',
    dpr: 3.0,
    icon: '📱',
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: 'Super Actua OLED 120Hz'
  },
  {
    id: 'honor-90-magic',
    name: 'Honor 90 / Magic 6 Pro / X9b',
    brand: 'Honor',
    category: 'phone',
    width: 400,
    height: 890,
    aspectRatio: '20:9',
    dpr: 3.0,
    icon: '📱',
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.78" AMOLED 120Hz'
  },
  {
    id: 'vivo-v29-y36',
    name: 'Vivo V29 / V30 / Y36 / Y27',
    brand: 'Vivo',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20:9',
    dpr: 2.75,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.78" 3D Curved AMOLED'
  },
  {
    id: 'oppo-reno-11',
    name: 'Oppo Reno 11 / A78 / A58',
    brand: 'Oppo',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20:9',
    dpr: 2.75,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.7" OLED 120Hz'
  },
  {
    id: 'realme-12-11',
    name: 'Realme 12 Pro / 11 Pro / C55',
    brand: 'Realme',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20:9',
    dpr: 2.75,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.7" Curved Vision 120Hz'
  },
  {
    id: 'infinix-tecno',
    name: 'Infinix Note 30 / Hot 40 / Tecno Camon 30',
    brand: 'Infinix / Tecno',
    category: 'phone',
    width: 393,
    height: 873,
    aspectRatio: '20.5:9',
    dpr: 2.5,
    icon: '📱',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.78" FHD+ 120Hz'
  },
  {
    id: 'android-universal',
    name: 'Boshqa Android Telefon (Universal)',
    brand: 'Android',
    category: 'phone',
    width: 393,
    height: 852,
    aspectRatio: '20:9',
    dpr: 2.6,
    icon: '📱',
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: 'Barcha Android smartfonlar uchun universal adaptiv rejim'
  },

  // ================= 3. APPLE IPHONE =================
  {
    id: 'iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'iphone',
    width: 440,
    height: 956,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    popular: true,
    optimalFontSize: 20,
    optimalModeScale: 'small',
    optimalPadding: 'px-4',
    hasPhysicalKeyboard: false,
    description: '6.9" Super Retina XDR ProMotion, Dynamic Island'
  },
  {
    id: 'iphone-16-pro',
    name: 'Apple iPhone 16 Pro',
    brand: 'Apple',
    category: 'iphone',
    width: 402,
    height: 874,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.3" Super Retina XDR ProMotion 120Hz'
  },
  {
    id: 'iphone-16-base',
    name: 'Apple iPhone 16 / 16 Plus',
    brand: 'Apple',
    category: 'iphone',
    width: 393,
    height: 852,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.1" / 6.7" Super Retina XDR, Camera Control'
  },
  {
    id: 'iphone-15-pro-max',
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'iphone',
    width: 430,
    height: 932,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    popular: true,
    optimalFontSize: 20,
    optimalModeScale: 'small',
    optimalPadding: 'px-4',
    hasPhysicalKeyboard: false,
    description: '6.7" Titan korpus, Super Retina XDR'
  },
  {
    id: 'iphone-15-pro',
    name: 'Apple iPhone 15 Pro / 15',
    brand: 'Apple',
    category: 'iphone',
    width: 393,
    height: 852,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    popular: true,
    optimalFontSize: 19,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.1" Dynamic Island OLED Retina'
  },
  {
    id: 'iphone-14-pro-max',
    name: 'Apple iPhone 14 Pro Max / 14 Plus',
    brand: 'Apple',
    category: 'iphone',
    width: 430,
    height: 932,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    optimalFontSize: 20,
    optimalModeScale: 'small',
    optimalPadding: 'px-4',
    hasPhysicalKeyboard: false,
    description: '6.7" OLED ProMotion'
  },
  {
    id: 'iphone-14-13',
    name: 'Apple iPhone 14 / 13 / 13 Pro',
    brand: 'Apple',
    category: 'iphone',
    width: 390,
    height: 844,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    popular: true,
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.1" Super Retina XDR OLED'
  },
  {
    id: 'iphone-12-pro-max',
    name: 'Apple iPhone 12 Pro Max / 12',
    brand: 'Apple',
    category: 'iphone',
    width: 390,
    height: 844,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '6.1" / 6.7" OLED Retina'
  },
  {
    id: 'iphone-11-xr',
    name: 'Apple iPhone 11 / 11 Pro / XR',
    brand: 'Apple',
    category: 'iphone',
    width: 414,
    height: 896,
    aspectRatio: '19.5:9',
    dpr: 2.0,
    icon: '🍏',
    optimalFontSize: 18,
    optimalModeScale: 'small',
    optimalPadding: 'px-3.5',
    hasPhysicalKeyboard: false,
    description: '6.1" Liquid Retina HD'
  },
  {
    id: 'iphone-xs-x',
    name: 'Apple iPhone XS / X / 8 Plus',
    brand: 'Apple',
    category: 'iphone',
    width: 375,
    height: 812,
    aspectRatio: '19.5:9',
    dpr: 3.0,
    icon: '🍏',
    optimalFontSize: 17,
    optimalModeScale: 'small',
    optimalPadding: 'px-3',
    hasPhysicalKeyboard: false,
    description: '5.8" Super Retina OLED'
  },
  {
    id: 'iphone-se-8',
    name: 'Apple iPhone SE (2022/2020) / 8 / 7',
    brand: 'Apple',
    category: 'iphone',
    width: 375,
    height: 667,
    aspectRatio: '16:9',
    dpr: 2.0,
    icon: '🍏',
    optimalFontSize: 17,
    optimalModeScale: 'small',
    optimalPadding: 'px-2.5',
    hasPhysicalKeyboard: false,
    description: '4.7" Retina HD ixcham klassik ekran'
  },

  // ================= 4. PLANSHETLAR (IPAD & TABLETS) =================
  {
    id: 'ipad-pro-13',
    name: 'Apple iPad Pro 13" / 12.9" (M4 / M2)',
    brand: 'Apple',
    category: 'tablet',
    width: 1024,
    height: 1366,
    aspectRatio: '4:3',
    dpr: 2.0,
    icon: '📟',
    popular: true,
    optimalFontSize: 24,
    optimalModeScale: 'medium',
    optimalPadding: 'px-8',
    hasPhysicalKeyboard: false,
    description: '13" Ultra Retina Tandem OLED ProMotion'
  },
  {
    id: 'ipad-pro-11',
    name: 'Apple iPad Pro 11" (M4 / M2)',
    brand: 'Apple',
    category: 'tablet',
    width: 834,
    height: 1210,
    aspectRatio: '4:3',
    dpr: 2.0,
    icon: '📟',
    popular: true,
    optimalFontSize: 22,
    optimalModeScale: 'medium',
    optimalPadding: 'px-6',
    hasPhysicalKeyboard: false,
    description: '11" Ultra Retina Tandem OLED'
  },
  {
    id: 'ipad-air-11',
    name: 'Apple iPad Air / iPad 10.9" (10th/9th gen)',
    brand: 'Apple',
    category: 'tablet',
    width: 820,
    height: 1180,
    aspectRatio: '4:3',
    dpr: 2.0,
    icon: '📟',
    popular: true,
    optimalFontSize: 22,
    optimalModeScale: 'medium',
    optimalPadding: 'px-6',
    hasPhysicalKeyboard: false,
    description: '10.9" Liquid Retina'
  },
  {
    id: 'ipad-mini-6',
    name: 'Apple iPad Mini (6th gen)',
    brand: 'Apple',
    category: 'tablet',
    width: 744,
    height: 1133,
    aspectRatio: '3:2',
    dpr: 2.0,
    icon: '📟',
    optimalFontSize: 20,
    optimalModeScale: 'small',
    optimalPadding: 'px-5',
    hasPhysicalKeyboard: false,
    description: '8.3" Liquid Retina ixcham planshet'
  },
  {
    id: 'samsung-tab-s9',
    name: 'Samsung Galaxy Tab S9 Ultra / S9+ / S8',
    brand: 'Samsung',
    category: 'tablet',
    width: 900,
    height: 1440,
    aspectRatio: '16:10',
    dpr: 2.0,
    icon: '📟',
    popular: true,
    optimalFontSize: 24,
    optimalModeScale: 'medium',
    optimalPadding: 'px-8',
    hasPhysicalKeyboard: false,
    description: '14.6" Dynamic AMOLED 2X, DeX rejimi'
  },
  {
    id: 'samsung-tab-a9',
    name: 'Samsung Galaxy Tab A9+ / A8 / A7',
    brand: 'Samsung',
    category: 'tablet',
    width: 800,
    height: 1280,
    aspectRatio: '16:10',
    dpr: 1.5,
    icon: '📟',
    optimalFontSize: 21,
    optimalModeScale: 'medium',
    optimalPadding: 'px-5',
    hasPhysicalKeyboard: false,
    description: '11" 90Hz FHD+ ekran'
  },
  {
    id: 'xiaomi-pad-6',
    name: 'Xiaomi Pad 6 / Pad 5 / Redmi Pad SE',
    brand: 'Xiaomi',
    category: 'tablet',
    width: 800,
    height: 1280,
    aspectRatio: '16:10',
    dpr: 2.0,
    icon: '📟',
    optimalFontSize: 22,
    optimalModeScale: 'medium',
    optimalPadding: 'px-6',
    hasPhysicalKeyboard: false,
    description: '11" 144Hz 2.8K ekran'
  }
];

export const DEVICE_CATEGORIES: {
  id: DeviceCategory;
  name: string;
  icon: string;
  desc: string;
}[] = [
  { id: 'desktop', name: 'Kompyuter', icon: '💻', desc: 'Desktop PC & Noutbuklar (Avto-kirish)' },
  { id: 'phone', name: 'Telefon (Android)', icon: '📱', desc: 'Samsung Galaxy, Xiaomi, Pixel...' },
  { id: 'iphone', name: 'iPhone (Apple)', icon: '🍏', desc: 'iPhone 16, 15, 14, 13, 12, SE...' },
  { id: 'tablet', name: 'Planshet', icon: '📟', desc: 'Apple iPad, Galaxy Tab, Xiaomi Pad...' }
];

export function autoDetectDevice(): DeviceProfile {
  if (typeof window === 'undefined') return DEVICE_PROFILES[0];

  const ua = navigator.userAgent.toLowerCase();
  const maxTouch = navigator.maxTouchPoints || 0;
  const isTouch = maxTouch > 0 || 'ontouchstart' in window;
  const width = window.innerWidth;

  // 1. Apple iPad
  if (/ipad/.test(ua) || (navigator.platform === 'MacIntel' && maxTouch > 1)) {
    if (width >= 1000) return DEVICE_PROFILES.find((d) => d.id === 'ipad-pro-13')!;
    return DEVICE_PROFILES.find((d) => d.id === 'ipad-air-11')!;
  }

  // 2. Apple iPhone
  if (/iphone|ipod/.test(ua)) {
    if (width >= 430) return DEVICE_PROFILES.find((d) => d.id === 'iphone-16-pro-max')!;
    if (width >= 400) return DEVICE_PROFILES.find((d) => d.id === 'iphone-16-pro')!;
    if (width <= 375) return DEVICE_PROFILES.find((d) => d.id === 'iphone-se-8')!;
    return DEVICE_PROFILES.find((d) => d.id === 'iphone-15-pro')!;
  }

  // 3. Android
  if (/android/.test(ua)) {
    if (Math.min(window.screen.width, window.screen.height) >= 600 || width >= 700) {
      return DEVICE_PROFILES.find((d) => d.id === 'samsung-tab-s9')!;
    }
    // Specific Samsung detection
    if (/samsung|sm-a22|sm-a|galaxy/i.test(ua)) {
      return DEVICE_PROFILES.find((d) => d.id === 'samsung-a22-5g')!;
    }
    if (/redmi|xiaomi|poco/i.test(ua)) {
      return DEVICE_PROFILES.find((d) => d.id === 'redmi-note-13-pro')!;
    }
    return DEVICE_PROFILES.find((d) => d.id === 'samsung-a22-5g')!;
  }

  // 4. Default: Desktop / Laptop
  return DEVICE_PROFILES[0];
}
