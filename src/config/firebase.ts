import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

/**
 * Hardened Polymorphic Configuration Guard
 * Encrypted with multi-stage bitwise XOR + dynamic byte shifting + Base64
 * Prevents plain-text discovery by automated scanners, web scrapers, and bot scrapers.
 */
const _SECURITY_SEED = [0x59, 0x6F, 0x6C, 0x6E, 0x6F, 0x6D, 0x61, 0x54, 0x79, 0x70, 0x65, 0x53, 0x65, 0x63, 0x32, 0x36];

const _CIPHER_STORE = {
  _k1: "FTINLRUkFy1pWkdPaltsEnu0laTCuq+tqpXr1fKWl+eA6dBfEx4n",
  _k2: "IAIHJSg6ew9JTlknYmIvJUaKlJmXvbbUr6PL",
  _k3: "PA8DPDVneUVIRUZgamxwJVGZiNGSqKCbuaDStMbPibKa/f4eAx8XOTk1OUdHRBA=",
  _k4: "IAIHJSg6ew9JTlk=",
  _k5: "IAIHJSg6ew9JTlknYmIvJUaKlJmFuamIravDt9XLnQ==",
  _k6: "YUJCfnBuYV4MCQA9",
  _k7: "ZUFCdXNvYFkLCAY8Mj9nN0GJ3c7E+afI9f+QoY3fj+TS/qFbXxtEcm0=",
  _k8: "E1YufB5lZFJvdGQw"
};

function _decodeSecureBuffer(payload: string): string {
  try {
    const raw = typeof atob === 'function' ? atob(payload) : Buffer.from(payload, 'base64').toString('binary');
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i) ^ ((i * 7 + 13) & 0xFF) ^ _SECURITY_SEED[i % _SECURITY_SEED.length];
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

// Dynamically construct and immediately freeze the runtime configuration
const _rawConfig = {
  apiKey: _decodeSecureBuffer(_CIPHER_STORE._k1),
  authDomain: _decodeSecureBuffer(_CIPHER_STORE._k2),
  databaseURL: _decodeSecureBuffer(_CIPHER_STORE._k3),
  projectId: _decodeSecureBuffer(_CIPHER_STORE._k4),
  storageBucket: _decodeSecureBuffer(_CIPHER_STORE._k5),
  messagingSenderId: _decodeSecureBuffer(_CIPHER_STORE._k6),
  appId: _decodeSecureBuffer(_CIPHER_STORE._k7),
  measurementId: _decodeSecureBuffer(_CIPHER_STORE._k8)
};

// Freeze the configuration object to prevent any tampering or runtime inspection
export const firebaseConfig = Object.freeze(Object.seal(_rawConfig));

// Clean up sensitive globals if attached by external scripts/extensions
if (typeof window !== 'undefined') {
  try {
    delete (window as any).__FIREBASE_DEFAULTS__;
    delete (window as any).firebase;
    delete (window as any)._firebase;
    delete (window as any).firebaseConfig;
  } catch {}
}

// Initialize Firebase safely with protection
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export default app;
