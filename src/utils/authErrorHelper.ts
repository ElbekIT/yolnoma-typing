/**
 * Firebase Authentication Error Formatter & Diagnostics
 * Converts cryptic Firebase error codes into actionable, user-friendly messages.
 */

export interface FormattedAuthError {
  code: string;
  userMessage: string;
  actionHint?: string;
  isIframeBlocked?: boolean;
}

export function formatAuthError(err: unknown): FormattedAuthError {
  const errorObj = err as any;
  const code: string = errorObj?.code || errorObj?.name || 'unknown';
  const rawMessage: string = errorObj?.message || String(err || '');

  // Log full diagnostics for developer inspection
  console.error('[Firebase Auth Diagnostics]:', {
    code,
    message: rawMessage,
    customData: errorObj?.customData,
    stack: errorObj?.stack
  });

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  switch (code) {
    case 'auth/internal-error':
      return {
        code,
        userMessage: isInIframe
          ? "Google orqali kirishda iframe cheklovi yuz berdi (auth/internal-error)."
          : "Google orqali kirishda tizim xatoligi yuz berdi (auth/internal-error).",
        actionHint: isInIframe
          ? "Ilovani yangi tabda (oynada) ochib ko'ring yoki email orqali kiring. Shuningdek, Firebase Console'da ushbu domen (Authorized Domains) ro'yxatiga kiritilganini tekshiring."
          : "Iltimos, sahifani yangilab qayta urinib ko'ring yoki email/parol orqali kiring.",
        isIframeBlocked: isInIframe
      };

    case 'auth/unauthorized-domain':
      return {
        code,
        userMessage: "Ushbu domen Firebase ruxsat etilgan domenlar (Authorized Domains) ro'yxatiga kiritilmagan.",
        actionHint: "Firebase Console -> Authentication -> Settings -> Authorized Domains bo'limiga ushbu domenni qo'shing yoki rasmiy domendan (yolnoma.uz) kiring."
      };

    case 'auth/popup-blocked':
      return {
        code,
        userMessage: "Brauzer avtorizatsiya oynasi (popup) ochilishini blokladi.",
        actionHint: "Iltimos, brauzer qidiruv qatoridagi popup belgisini bosib, oynalar ochilishiga ruxsat bering."
      };

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return {
        code,
        userMessage: "Kirish oynasi yakunlanmasdan yopildi.",
        actionHint: "Qayta urinish uchun tugmani yana bir bor bosing."
      };

    case 'auth/account-exists-with-different-credential':
      return {
        code,
        userMessage: "Ushbu email bilan boshqa usul (masalan, Email yoki GitHub) orqali hisob ochilgan.",
        actionHint: "Iltimos, avval ro'yxatdan o'tgan usulingiz bilan tizimga kiring."
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

    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return {
        code,
        userMessage: "Email yoki parol noto'g'ri kiritildi.",
        actionHint: "Ma'lumotlarni qayta tekshirib kiritib ko'ring yoki parolni tiklang."
      };

    default:
      // If the error message already has a readable text
      if (rawMessage && !rawMessage.includes('auth/')) {
        return { code, userMessage: rawMessage };
      }
      return {
        code,
        userMessage: "Kirishda kutilmagan xatolik yuz berdi.",
        actionHint: isInIframe
          ? "Ilovani to'liq yangi tabda ochib ko'ring."
          : "Birozdan so'ng qayta urinib ko'ring yoki email orqali kiring."
      };
  }
}
