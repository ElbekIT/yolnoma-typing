export const OWNER_EMAIL = 'yuldashivagavharoy@gmail.com';

/**
 * Strictly checks if the currently logged-in user is the verified owner (yuldashivagavharoy@gmail.com).
 * Returns false for all other emails or guests.
 */
export function isOwnerUser(): boolean {
  try {
    // Check yolnoma_user
    const rawUser = localStorage.getItem('yolnoma_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (
        parsed?.email &&
        parsed.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()
      ) {
        return true;
      }
    }

    // Check active email
    const activeEmail = localStorage.getItem('yolnoma_active_email');
    if (activeEmail && activeEmail.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      return true;
    }

    // Check typeflow_user or generic user
    const typeflowRaw = localStorage.getItem('typeflow_user') || localStorage.getItem('user');
    if (typeflowRaw) {
      const parsed = JSON.parse(typeflowRaw);
      if (
        parsed?.email &&
        parsed.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()
      ) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking owner status:', e);
  }

  return false;
}

/**
 * Sets owner session only when the email strictly matches OWNER_EMAIL
 */
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
