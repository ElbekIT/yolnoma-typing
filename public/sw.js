// Yolnoma Typing - High Performance Progressive Web App Service Worker
const CACHE_NAME = 'yolnoma-v3.2-cache';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/yolnoma_icon.svg',
  '/yolnoma_logo.svg',
  '/hero_mascot.svg',
  '/hero_mascot_girl.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/og-banner.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service worker pre-caching partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only process GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // -------------------------------------------------------------
  // CRITICAL: NEVER INTERCEPT CROSS-ORIGIN REQUESTS!
  // Google Auth (apis.google.com, accounts.google.com, *.google.com),
  // Firebase Auth & Firestore (*.googleapis.com, *.firebaseio.com),
  // 3rd-party OAuth, and ad networks MUST bypass the Service Worker
  // completely and connect directly to the native browser network.
  // -------------------------------------------------------------
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip local backend API endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (HTML pages) - Network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html').then((cached) => cached || caches.match('/'));
      })
    );
    return;
  }

  // 2. Static Same-Origin Assets (Images, Fonts, Scripts, Styles) - Stale-while-revalidate / Cache-first
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. All other same-origin requests: network fetch with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
