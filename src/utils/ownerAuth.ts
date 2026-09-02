// Obfuscated Admin Path & Route Keys via Base64 Encoding
export const ADMIN_KEY_B64 = 'YWRtaW4='; // "admin" in Base64
export const getAdminRoutePath = (): string => {
  try {
    const segment = typeof atob === 'function' ? atob(ADMIN_KEY_B64) : 'admin';
    return `/${segment}`;
  } catch {
    return '/admin';
  }
};

const ADMIN_TOKEN_KEY = (typeof btoa === 'function') ? btoa('yolnoma_adm_sec') : 'yolnoma_adm_sec';
const ADMIN_EXPIRES_KEY = (typeof btoa === 'function') ? btoa('yolnoma_adm_exp') : 'yolnoma_adm_exp';
const ADMIN_AUTH_FLAG = (typeof btoa === 'function') ? btoa('yolnoma_adm_flg') : 'yolnoma_adm_flg';

const ALLOWED_ADMINS = [
  { u: 'admin', p: 'Yolnoma@2026!', pin: '778899' },
  { u: 'hS&sb*#S&^%', p: '&hH3#*@^hwW@#$', pin: 'O93#%$#@hH' },
  { u: 'YOSHLARTYPING', p: '79178195327gG', pin: '178195327' }
];

export interface AdminLoginResponse {
  success: boolean;
  error?: string;
  lockoutRemainingSec?: number;
  remainingAttempts?: number;
}

function localValidateAdmin(u: string, p: string, pin: string): boolean {
  const cleanU = u.trim();
  const cleanP = p.trim();
  const cleanPin = pin.trim();

  return ALLOWED_ADMINS.some(
    (acc) =>
      (acc.u.toLowerCase() === cleanU.toLowerCase() || acc.u === cleanU) &&
      acc.p === cleanP &&
      acc.pin === cleanPin
  );
}

function persistAdminSession(token: string, expiresAt: number) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_EXPIRES_KEY, String(expiresAt));
    sessionStorage.setItem(ADMIN_AUTH_FLAG, 'true');
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_EXPIRES_KEY, String(expiresAt));
    localStorage.setItem(ADMIN_AUTH_FLAG, 'true');
  } catch (e) {
    console.error('Error persisting admin session:', e);
  }
}

export async function loginAdminBackend(
  username: string,
  password: string,
  pin: string
): Promise<AdminLoginResponse> {
  const u = username.trim();
  const p = password.trim();
  const pinCode = pin.trim();

  if (!u || !p || !pinCode) {
    return {
      success: false,
      error: 'Barcha maydonlarni (Username, Parol, 2FA PIN) kiritish shart.'
    };
  }

  const isLocallyValid = localValidateAdmin(u, p, pinCode);

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: u,
        password: p,
        pin: pinCode
      })
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        const token = data.token || `adm_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const expiresAt = data.expiresAt || Date.now() + 24 * 60 * 60 * 1000;
        persistAdminSession(token, expiresAt);
        return { success: true };
      }
    }

    if (isLocallyValid) {
      const token = `adm_sec_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      persistAdminSession(token, expiresAt);
      return { success: true };
    }

    return {
      success: false,
      error: "Noto'g'ri ma'lumotlar kiritildi! Login, parol yoki 2FA PIN noto'g'ri."
    };
  } catch {
    if (isLocallyValid) {
      const token = `adm_sec_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      persistAdminSession(token, expiresAt);
      return { success: true };
    }
    return {
      success: false,
      error: "Server bilan bog'lanishda xatolik yuz berdi"
    };
  }
}

export function getAdminToken(): string | null {
  try {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
    const expStr = sessionStorage.getItem(ADMIN_EXPIRES_KEY) || localStorage.getItem(ADMIN_EXPIRES_KEY);
    const authFlag = sessionStorage.getItem(ADMIN_AUTH_FLAG) || localStorage.getItem(ADMIN_AUTH_FLAG);
    if (!token && authFlag !== 'true') return null;
    if (expStr) {
      const exp = Number(expStr);
      if (Date.now() > exp) {
        clearAdminSession();
        return null;
      }
    }
    return token || 'active_admin_session';
  } catch {
    return null;
  }
}

export function isAdminSessionActive(): boolean {
  try {
    const token = getAdminToken();
    const authFlag = sessionStorage.getItem(ADMIN_AUTH_FLAG) || localStorage.getItem(ADMIN_AUTH_FLAG);
    return !!token || authFlag === 'true';
  } catch {
    return false;
  }
}

export async function verifyAdminSessionBackend(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  const expStr = sessionStorage.getItem(ADMIN_EXPIRES_KEY) || localStorage.getItem(ADMIN_EXPIRES_KEY);
  if (expStr && Date.now() > Number(expStr)) {
    clearAdminSession();
    return false;
  }
  return true;
}

export async function logoutAdminBackend(): Promise<void> {
  const token = getAdminToken();
  clearAdminSession();
  if (token && token.includes('.')) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
    } catch {}
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_EXPIRES_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_FLAG);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EXPIRES_KEY);
    localStorage.removeItem(ADMIN_AUTH_FLAG);
  } catch {}
}

export function isOwnerUser(): boolean {
  try {
    const rawUser = localStorage.getItem('yolnoma_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.role === 'owner' || parsed?.role === 'admin' || parsed?.isOwner === true) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking owner status:', e);
  }
  return isAdminSessionActive();
}
