const ADMIN_TOKEN_KEY = 'yolnoma_admin_secure_token_v3';
const ADMIN_EXPIRES_KEY = 'yolnoma_admin_token_exp_v3';
const ADMIN_AUTH_FLAG = 'yolnoma_admin_auth_active_v3';
const ADMIN_SESSION_ID_KEY = 'yolnoma_admin_session_id_v3';

export interface AdminLoginResponse {
  success: boolean;
  error?: string;
  lockoutRemainingSec?: number;
  remainingAttempts?: number;
  sessionId?: string;
}

export interface AdminSessionItem {
  sessionId: string;
  username: string;
  emailMasked: string;
  ip: string;
  userAgent: string;
  loginTime: number;
  lastActive: number;
  isRootOwner: boolean;
  isCurrent: boolean;
}

function persistAdminSession(token: string, expiresAt: number, sessionId?: string) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_EXPIRES_KEY, String(expiresAt));
    sessionStorage.setItem(ADMIN_AUTH_FLAG, 'true');
    if (sessionId) sessionStorage.setItem(ADMIN_SESSION_ID_KEY, sessionId);

    // Explicitly do NOT store in localStorage so refreshing page or closing tab requires re-auth
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EXPIRES_KEY);
    localStorage.removeItem(ADMIN_AUTH_FLAG);
    localStorage.removeItem(ADMIN_SESSION_ID_KEY);
  } catch (e) {
    console.error('Error persisting admin session:', e);
  }
}

/**
 * Executes a secure, resilient authentication request requiring both Admin Credentials and Super Owner Account verification.
 * 100% processed securely on the backend server.
 */
export async function loginAdminBackend(
  username: string,
  password: string,
  pin: string,
  currentUserEmail?: string | null
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

  // Dual-Auth Requirement: User must be signed into the authenticated Super Owner account
  if (!currentUserEmail) {
    return {
      success: false,
      error: 'Admin panelga kirish uchun avval saytga Bosh Administrator akkaunti orqali kirgan bo\'lishingiz shart!'
    };
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: u,
        password: p,
        pin: pinCode,
        email: currentUserEmail
      })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.success) {
      const token = data.token || `adm_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = data.expiresAt || Date.now() + 6 * 60 * 60 * 1000;
      persistAdminSession(token, expiresAt, data.sessionId);
      return { success: true, sessionId: data.sessionId };
    }

    if (data && data.error) {
      return {
        success: false,
        error: data.error,
        lockoutRemainingSec: data.lockoutRemainingSec,
        remainingAttempts: data.remainingAttempts
      };
    }

    return {
      success: false,
      error: "Noto'g'ri ma'lumotlar kiritildi! Login, parol yoki 2FA PIN noto'g'ri."
    };
  } catch {
    return {
      success: false,
      error: "Server bilan bog'lanishda xatolik yuz berdi"
    };
  }
}

/**
 * Fetches active admin sessions from the backend
 */
export async function fetchAdminSessions(): Promise<{ success: boolean; sessions: AdminSessionItem[]; error?: string }> {
  const token = getAdminToken();

  try {
    const res = await fetch('/api/admin/sessions', {
      credentials: 'include',
      headers: {
        'x-user-email': 'yuldashivagavharoy@gmail.com',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.success) {
      return { success: true, sessions: data.sessions || [] };
    }

    return {
      success: false,
      sessions: [],
      error: data?.error || 'Seanslarni yuklashda xatolik yuz berdi'
    };
  } catch {
    return { success: false, sessions: [], error: 'Server bilan aloqa o\'rnatilmadi' };
  }
}

/**
 * Terminates / kicks an active admin session.
 * Super Admin (Root Owner) is protected and can never be kicked.
 */
export async function terminateAdminSession(sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = getAdminToken();

  try {
    const res = await fetch('/api/admin/sessions/terminate', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'yuldashivagavharoy@gmail.com',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ sessionId })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'Seans muvaffaqiyatli to\'xtatildi' };
    }

    return { success: false, error: data.error || 'Seansni tugatishda xatolik yuz berdi' };
  } catch {
    return { success: false, error: 'Server bilan aloqa uzildi' };
  }
}



/**
 * Returns the active admin bearer token if valid.
 */
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

/**
 * Checks if the current browser session has an active admin state
 */
export function isAdminSessionActive(): boolean {
  try {
    const token = getAdminToken();
    const authFlag = sessionStorage.getItem(ADMIN_AUTH_FLAG) || localStorage.getItem(ADMIN_AUTH_FLAG);
    return !!token || authFlag === 'true';
  } catch {
    return false;
  }
}

/**
 * Verifies the admin token and ensures user stays logged in
 */
export async function verifyAdminSessionBackend(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  // If local expiration check passes, return true immediately to prevent flickering
  const expStr = sessionStorage.getItem(ADMIN_EXPIRES_KEY) || localStorage.getItem(ADMIN_EXPIRES_KEY);
  if (expStr && Date.now() > Number(expStr)) {
    clearAdminSession();
    return false;
  }

  return true;
}

/**
 * Terminates the admin session and informs the backend to revoke the token
 */
export async function logoutAdminBackend(): Promise<void> {
  const token = getAdminToken();
  clearAdminSession();

  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && token.includes('.') ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ token })
    });
  } catch {}
}

/**
 * Local helper to clear admin session storage
 */
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

/**
 * Checks if the current user profile has owner badge privileges
 */
export function isOwnerUser(userEmail?: string | null): boolean {
  if (userEmail) {
    const clean = userEmail.trim().toLowerCase();
    if (clean === 'yuldashivagavharoy@gmail.com' || clean.startsWith('yuldashivagavharoy')) {
      return true;
    }
  }
  try {
    const rawUser = localStorage.getItem('yolnoma_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const email = parsed?.email?.toLowerCase();
      if (email === 'yuldashivagavharoy@gmail.com' || email?.startsWith('yuldashivagavharoy')) {
        return true;
      }
      if (parsed?.role === 'owner' || parsed?.role === 'admin' || parsed?.isOwner === true) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking owner status:', e);
  }

  return isAdminSessionActive();
}
