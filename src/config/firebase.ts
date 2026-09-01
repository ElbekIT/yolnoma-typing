import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

/**
 * Enterprise Dynamic Server-Injected Configuration Engine
 * No keys, secrets, tokens, or cipher payloads are stored in the frontend codebase bundle.
 * Configuration is dynamically served by the backend at runtime.
 */
function resolveRuntimeConfig() {
  let runtimeCfg: Record<string, any> | null = null;

  // 1. Check Backend Bootstrap Injection from /api/system/bootstrap.js
  if (typeof window !== 'undefined' && (window as any).__YOLNOMA_BOOTSTRAP__?.cfg) {
    runtimeCfg = (window as any).__YOLNOMA_BOOTSTRAP__.cfg;
    try {
      delete (window as any).__YOLNOMA_BOOTSTRAP__;
    } catch {}
  }

  // 2. Fallback: Synchronous fetch from backend endpoint
  if (!runtimeCfg && typeof window !== 'undefined' && typeof XMLHttpRequest !== 'undefined') {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/system/client-config', false);
      xhr.send(null);
      if (xhr.status === 200) {
        const parsed = JSON.parse(xhr.responseText);
        if (parsed && parsed.config) {
          runtimeCfg = parsed.config;
        }
      }
    } catch (e) {
      console.warn('Backend dynamic config fallback resolution:', e);
    }
  }

  return runtimeCfg || {};
}

const _resolvedConfig = resolveRuntimeConfig();

// Freeze runtime configuration
export const firebaseConfig = Object.freeze(Object.seal({ ..._resolvedConfig }));

// Clean up sensitive globals
if (typeof window !== 'undefined') {
  try {
    delete (window as any).__FIREBASE_DEFAULTS__;
    delete (window as any).firebase;
    delete (window as any)._firebase;
    delete (window as any).firebaseConfig;
  } catch {}
}

// Initialize Firebase safely
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
