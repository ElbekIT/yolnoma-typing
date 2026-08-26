const ADMIN_TOKEN_KEY = 'yolnoma_admin_secure_token_v3';
const ADMIN_EXPIRES_KEY = 'yolnoma_admin_token_exp_v3';

export interface AdminLoginResponse {
  success: boolean;
  error?: string;
  lockoutRemainingSec?: number;
  remainingAttempts?: number;
}

/**
 * Executes a secure, server-side authentication request.
 * Passwords and 2FA credentials are NEVER stored or validated on the client.
 */
export async function loginAdminBackend(
  username: string,
  password: string,
  pin: string
): Promise<AdminLoginResponse> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim(),
        pin: pin.trim()
      })
    });

    const rawText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      return {
        success: false,
        error: res.status === 429
          ? "Ko'p marotaba urinish tufayli kirish vaqtincha bloklandi."
          : `Server bilan bog'lanishda xatolik yuz berdi (${res.status}). Iltimos qaytadan urinib ko'ring.`
      };
    }

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Autentifikatsiyada xatolik yuz berdi",
        lockoutRemainingSec: data.lockoutRemainingSec,
        remainingAttempts: data.remainingAttempts
      };
    }

    if (data.token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      if (data.expiresAt) {
        sessionStorage.setItem(ADMIN_EXPIRES_KEY, String(data.expiresAt));
      }
      return { success: true };
    }

    return { success: false, error: "Serverdan yaroqsiz javob olindi" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server bilan bog\'lanishda xatolik';
    return { success: false, error: msg };
  }
}

/**
 * Returns the active admin bearer token from session storage if valid.
 */
export function getAdminToken(): string | null {
  try {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expStr = sessionStorage.getItem(ADMIN_EXPIRES_KEY);
    if (!token) return null;

    if (expStr) {
      const exp = Number(expStr);
      if (Date.now() > exp) {
        clearAdminSession();
        return null;
      }
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Checks if the current local browser session has an unexpired admin token
 */
export function isAdminSessionActive(): boolean {
  return !!getAdminToken();
}

/**
 * Verifies the admin token cryptographically against the backend server.
 */
export async function verifyAdminSessionBackend(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });

    if (!res.ok) {
      clearAdminSession();
      return false;
    }

    const rawText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      clearAdminSession();
      return false;
    }
    if (data.valid) {
      return true;
    } else {
      clearAdminSession();
      return false;
    }
  } catch {
    // If offline or network issue, maintain local check if not expired
    return isAdminSessionActive();
  }
}

/**
 * Terminates the admin session and informs the backend to revoke the token
 */
export async function logoutAdminBackend(): Promise<void> {
  const token = getAdminToken();
  clearAdminSession();

  if (token) {
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

/**
 * Local helper to clear admin session storage
 */
export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_EXPIRES_KEY);
  } catch {}
}

/**
 * Checks if the current user profile has owner badge privileges
 */
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
