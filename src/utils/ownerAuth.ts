export const OWNER_EMAIL = 'yuldashivagavharoy@gmail.com';
export const ADMIN_USERNAME = 'YOSHLARTYPING';
export const ADMIN_PASSWORD = '79178195327gG';
export const ADMIN_2FA_PIN = '178195327';

const ADMIN_SESSION_KEY = 'yolnoma_admin_session_auth_v2';

/**
 * Validates the admin username / login
 */
export function verifyAdminUsername(username: string): boolean {
  return username.trim() === ADMIN_USERNAME;
}

/**
 * Validates the admin master password
 */
export function verifyAdminPassword(password: string): boolean {
  return password.trim() === ADMIN_PASSWORD;
}

/**
 * Validates the secondary 2FA PIN
 */
export function verifyAdmin2FA(pin: string): boolean {
  return pin.trim() === ADMIN_2FA_PIN;
}

/**
 * Marks the active browser session as authenticated for Admin Panel operations
 */
export function setAdminSession(): void {
  try {
    const payload = JSON.stringify({
      auth: true,
      timestamp: Date.now(),
      token: btoa(`yolnoma_admin_${Date.now()}`)
    });
    sessionStorage.setItem(ADMIN_SESSION_KEY, payload);
    localStorage.setItem('yolnoma_admin_last_login', String(Date.now()));
  } catch (e) {
    console.warn('Set admin session error:', e);
  }
}

/**
 * Checks if the current session is verified with Password + 2FA
 */
export function isAdminSessionActive(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data && data.auth === true && data.token) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * Terminates and locks the admin session
 */
export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
}

/**
 * Checks if the current user has owner/admin privileges
 */
export function isOwnerUser(): boolean {
  try {
    const rawUser = localStorage.getItem('yolnoma_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (
        parsed?.email &&
        (parsed.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() ||
         parsed.email.trim().toLowerCase() === 'elbekqoriyev2008@gmail.com')
      ) {
        return true;
      }
    }

    const activeEmail = localStorage.getItem('yolnoma_active_email');
    if (
      activeEmail &&
      (activeEmail.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() ||
       activeEmail.trim().toLowerCase() === 'elbekqoriyev2008@gmail.com')
    ) {
      return true;
    }
  } catch (e) {
    console.error('Error checking owner status:', e);
  }

  return false;
}

export function setOwnerSession(email: string) {
  if (email && email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    localStorage.setItem('yolnoma_active_email', OWNER_EMAIL);
    const existingUser = localStorage.getItem('yolnoma_user');
    if (!existingUser) {
      localStorage.setItem(
        'yolnoma_user',
        JSON.stringify({
          name: 'Gavharoy (Owner)',
          email: OWNER_EMAIL,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: 'owner'
        })
      );
    }
    window.dispatchEvent(new Event('storage'));
  }
}
