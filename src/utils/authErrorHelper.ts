/**
 * Firebase Authentication Error Formatter & Diagnostics
 * Converts cryptic Firebase error codes into actionable, user-friendly Uzbek messages.
 */

export interface FormattedAuthError {
  code: string;
  userMessage: string;
  actionHint?: string;
  isIframeBlocked?: boolean;
  suggestRegister?: boolean;
  suggestLogin?: boolean;
  suggestReset?: boolean;
}

export function formatAuthError(err: unknown): FormattedAuthError {
  const errorObj = err as any;
  let code: string = errorObj?.code || errorObj?.name || 'unknown';
  const rawMessage: string = errorObj?.message || String(err || '');

  // Map REST / Identity Platform error strings if present
  if (rawMessage.includes('INVALID_LOGIN_CREDENTIALS') || code === 'auth/invalid-login-credentials') {
    code = 'auth/invalid-credential';
  } else if (rawMessage.includes('EMAIL_EXISTS')) {
    code = 'auth/email-already-in-use';
  } else if (rawMessage.includes('OPERATION_NOT_ALLOWED')) {
    code = 'auth/operation-not-allowed';
  } else if (rawMessage.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
    code = 'auth/too-many-requests';
  } else if (rawMessage.includes('EMAIL_NOT_FOUND')) {
    code = 'auth/user-not-found';
  } else if (rawMessage.includes('INVALID_PASSWORD')) {
    code = 'auth/wrong-password';
  } else if (rawMessage.includes('WEAK_PASSWORD')) {
    code = 'auth/weak-password';
  } else if (rawMessage.includes('INVALID_EMAIL')) {
    code = 'auth/invalid-email';
  }

  // Log full diagnostics for developer inspection
  console.error('[Firebase Auth Diagnostics]:', {
    code,
    message: rawMessage,
    customData: errorObj?.customData,
    stack: errorObj?.stack
  });

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return {
        code,
        userMessage: "Email yoki parol noto'g'ri kiritildi.",
        actionHint: "Agar saytda hali hisob ochmagan bo'lsangiz, 'Ro'yxatdan o'tish' bo'limi orqali yangi hisob yarating yoki parolingizni tiklang.",
        suggestRegister: true,
        suggestReset: true
      };

    case 'auth/user-not-found':
      return {
        code,
        userMessage: "Ushbu email bilan hisob topilmadi.",
        actionHint: "Iltimos, avval 'Ro'yxatdan o'tish' orqali yangi hisob oching yoki Google orqali kiring.",
        suggestRegister: true
      };

    case 'auth/wrong-password':
      return {
        code,
        userMessage: "Parol noto'g'ri kiritildi.",
        actionHint: "Parolingizni tekshirib qayta kiriting yoki 'Parolni tiklash' tugmasi orqali parolni yangilang.",
        suggestReset: true
      };

    case 'auth/email-already-in-use':
      return {
        code,
        userMessage: "Ushbu email bilan allaqachon hisob ochilgan.",
        actionHint: "Iltimos, 'Kirish' bo'limiga o'tib tizimga kiring yoki parolingizni tiklang.",
        suggestLogin: true,
        suggestReset: true
      };

    case 'auth/invalid-email':
      return {
        code,
        userMessage: "Email manzili formati noto'g'ri.",
        actionHint: "Iltimos, to'g'ri email manzilini kiriting (masalan: ism@example.com). Bo'sh joylar (probel) bo'lmasligi kerak."
      };

    case 'auth/weak-password':
      return {
        code,
        userMessage: "Parol juda oddiy yoki qisqa.",
        actionHint: "Xavfsizlik talablariga ko'ra, parol kamida 6 ta belgidan iborat bo'lishi kerak."
      };

    case 'auth/missing-password':
      return {
        code,
        userMessage: "Parol kiritilmadi.",
        actionHint: "Iltimos, hisobingiz parolini kiriting."
      };

    case 'auth/missing-email':
      return {
        code,
        userMessage: "Email kiritilmadi.",
        actionHint: "Iltimos, email pochtangizni kiriting."
      };

    case 'auth/too-many-requests':
      return {
        code,
        userMessage: "Juda ko'p muvaffaqiyatsiz urinish qayd etildi.",
        actionHint: "Xavfsizlik maqsadida tizim vaqtincha bloklandi. 1-2 daqiqa kutib qayta urinib ko'ring yoki parolingizni tiklang.",
        suggestReset: true
      };

    case 'auth/operation-not-allowed':
      return {
        code,
        userMessage: "Email va parol orqali kirish tizimda faollashtirilmagan.",
        actionHint: "Firebase Console -> Authentication -> Sign-in method bo'limida Email/Password provayderi yoqilganligini tekshiring."
      };

    case 'auth/network-request-failed':
      return {
        code,
        userMessage: "Internet aloqasida uzilish yuz berdi.",
        actionHint: "Tarmoq ulanishini tekshiring va qayta urinib ko'ring."
      };

    case 'auth/user-disabled':
      return {
        code,
        userMessage: "Ushbu hisob administrator tomonidan vaqtincha to'xtatilgan.",
        actionHint: "Yordam uchun admin@yolnoma.uz bilan bog'laning."
      };

    case 'auth/account-exists-with-different-credential':
      return {
        code,
        userMessage: "Ushbu email bilan boshqa usul orqali (masalan, Google) hisob ochilgan.",
        actionHint: "Iltimos, avval ro'yxatdan o'tgan usulingiz bilan tizimga kiring."
      };

    case 'auth/popup-blocked':
      return {
        code,
        userMessage: "Brauzer avtorizatsiya oynasi (popup) ochilishini blokladi.",
        actionHint: "Iltimos, brauzer qidiruv qatoridagi popup belgisini bosib, oynalar ochilishiga ruxsat bering.",
        isIframeBlocked: isInIframe
      };

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return {
        code,
        userMessage: "Kirish oynasi yakunlanmasdan yopildi.",
        actionHint: "Qayta urinish uchun tugmani yana bir bor bosing."
      };

    case 'auth/unauthorized-domain':
      return {
        code,
        userMessage: "Ushbu domen Firebase ruxsat etilgan domenlar (Authorized Domains) ro'yxatiga kiritilmagan.",
        actionHint: "Firebase Console -> Authentication -> Settings -> Authorized Domains bo'limiga ushbu domenni qo'shing yoki rasmiy domendan (yolnoma.uz) kiring."
      };

    case 'auth/internal-error':
      return {
        code,
        userMessage: isInIframe
          ? "Google orqali kirishda iframe cheklovi yuz berdi (auth/internal-error)."
          : "Kirishda tizim xatoligi yuz berdi (auth/internal-error).",
        actionHint: isInIframe
          ? "Ilovani yangi oynada ochib ko'ring yoki email/parol orqali kiring."
          : "Sahifani yangilab qayta urinib ko'ring yoki email/parol orqali kiring.",
        isIframeBlocked: isInIframe
      };

    case 'auth/expired-action-code':
      return {
        code,
        userMessage: "Parolni tiklash havolasining muddati tugagan.",
        actionHint: "Iltimos, qaytadan yangi parol tiklash so'rovini yuboring."
      };

    case 'auth/invalid-action-code':
      return {
        code,
        userMessage: "Parol tiklash havolasi yaroqsiz yoki allaqachon ishlatilgan.",
        actionHint: "Qaytadan parol tiklash so'rovini yuboring."
      };

    default:
      // If the error message already has a readable text and isn't a raw Firebase error code
      if (rawMessage && !rawMessage.includes('auth/') && !rawMessage.includes('FIREBASE') && !rawMessage.includes('Firebase:')) {
        return { code, userMessage: rawMessage };
      }
      return {
        code,
        userMessage: "Kirishda xatolik yuz berdi.",
        actionHint: "Iltimos, kiritilgan ma'lumotlarni tekshiring va qayta urinib ko'ring yoki parolingizni tiklang.",
        suggestReset: true
      };
  }
}
