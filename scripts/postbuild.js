import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('[postbuild] Warning: dist/index.html not found, skipping route generation.');
  process.exit(0);
}

const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// All recognized SPA routes in Yolnoma Typing
const routes = [
  'languages',
  'tillar',
  'language',
  'til',
  'leaderboard',
  'reyting',
  'rating',
  'battle',
  'arena',
  'duel',
  'lessons',
  'darslar',
  'statistics',
  'statistika',
  'stats',
  'profile',
  'profil',
  'settings',
  'sozlamalar',
  'achievements',
  'yutuqlar',
  'challenges',
  'musobaqalar',
  'partners',
  'hamkorlar',
  'about',
  'owner',
  'haqida',
  'dashboard',
  'typing'
];

console.log(`[postbuild] Generating physical static fallbacks for ${routes.length} routes...`);

for (const route of routes) {
  // 1. Create route/index.html (e.g., dist/languages/index.html)
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);

  // 2. Create route.html for cleanUrls / static web server matches (e.g., dist/languages.html)
  fs.writeFileSync(path.join(distDir, `${route}.html`), indexHtml);
}

// 3. Make dist/404.html an exact clone of index.html so any unmatched server-side 404 serves the SPA!
fs.writeFileSync(path.join(distDir, '404.html'), indexHtml);

console.log('[postbuild] Successfully generated static route fallbacks and 404.html SPA clone.');
