import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('[postbuild] Warning: dist/index.html not found, skipping route generation.');
  process.exit(0);
}

const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Distinct SEO & OpenGraph configurations for each major feature/page
const ROUTE_CONFIGS = {
  home: {
    title: "Tez Yozish - Klaviaturada Tez Yozish Testi & 10 Barmoq Mashqlari | Yolnoma",
    description: "Klaviaturada tez yozishni o'rganing! Bepul 10 barmoq mashqlari, WPM tezlik testi, real-vaqt musobaqalar va O'zbekiston milliy reytingi. Tez yozish bo'yicha №1 platforma.",
    image: "https://www.yolnoma.uz/og-banner.jpg",
    slug: ""
  },
  typing: {
    title: "Tez Yozish Testi - WPM & Aniqlikni Sinash | Yolnoma Typing",
    description: "Klaviatura tezligingizni real vaqtda sinab ko'ring. 15, 30, 60 va 120 soniyalik testlar, batafsil WPM va CPM tahlili.",
    image: "https://www.yolnoma.uz/og-banner.jpg",
    slug: "typing"
  },
  languages: {
    title: "125+ Jahon Tillari - Klaviaturada Tez Yozish | Yolnoma Typing",
    description: "O'zbekcha (Lotin va Kirill), Ingliz, Rus va 125 dan ortiq dunyo tillarida yozish tezligingizni sinab ko'ring va oshiring!",
    image: "https://www.yolnoma.uz/og-languages.jpg",
    slug: "languages"
  },
  battle: {
    title: "1v1 Speedway Battle - Jonli Tez Yozish Musobaqasi | Yolnoma Typing",
    description: "Do'stlaringiz va butun dunyo bo'yicha haqiqiy raqiblar bilan 1ga 1 real-vaqt klaviatura poygasi. Eng tezkor teruvchini aniqlang!",
    image: "https://www.yolnoma.uz/og-battle.jpg",
    slug: "battle"
  },
  leaderboard: {
    title: "O'zbekiston Milliy Reytingi - Peshqadamlar | Yolnoma Typing",
    description: "Eng yuqori WPM tezlikka ega teruvchilar reytingi. Milliy chempionlar ro'yxatida o'z o'rningizni egallang!",
    image: "https://www.yolnoma.uz/og-leaderboard.jpg",
    slug: "leaderboard"
  },
  lessons: {
    title: "10 Barmoq Darslari - Ko'r-ko'rona Yozish Metodikasi | Yolnoma",
    description: "Klaviaturaga qaramasdan 10 barmoq bilan tez yozishni bosqichma-bosqich o'rganing. Bepul interaktiv darslar.",
    image: "https://www.yolnoma.uz/og-lessons.jpg",
    slug: "lessons"
  },
  support: {
    title: "Loyihani Qo'llab-quvvatlash - Hissa Qo'shing | Yolnoma Typing",
    description: "Yolnoma platformasini rivojlantirishga o'z hissangizni qo'shing. O'zbekistonda tez yozish madaniyatini birga yuksaltiramiz!",
    image: "https://www.yolnoma.uz/og-banner.jpg",
    slug: "support"
  },
  video: {
    title: "Sayt Haqida Video Qo'llanma - Yolnoma Typing",
    description: "Yolnoma platformasidan to'liq foydalanish bo'yicha video qo'llanma: saytga kirish, ro'yxatdan o'tish, tez yozish testi va milliy reyting.",
    image: "https://www.yolnoma.uz/og-banner.jpg",
    slug: "video"
  },
  statistics: {
    title: "Shaxsiy Statistika & Tahlil - Tezlik O'sish Grafigi | Yolnoma",
    description: "Barcha topshirilgan testlar tarixi, WPM va aniqlik dinamikasi, eng ko'p adashilgan harflar tahlili.",
    image: "https://www.yolnoma.uz/og-banner.jpg",
    slug: "statistics"
  }
};

// Aliases mapping to base config keys
const ALIAS_MAP = {
  tillar: 'languages',
  language: 'languages',
  til: 'languages',
  reyting: 'leaderboard',
  top: 'leaderboard',
  peshqadamlar: 'leaderboard',
  rating: 'leaderboard',
  leaders: 'leaderboard',
  arena: 'battle',
  duel: 'battle',
  jang: 'battle',
  darslar: 'lessons',
  saboqlar: 'lessons',
  test: 'typing',
  tests: 'typing',
  statistika: 'statistics',
  stats: 'statistics',
  donate: 'support',
  ehson: 'support',
  'qollab-quvvatlash': 'support',
  sponsor: 'support',
  tutorial: 'video',
  qollanma: 'video'
};

function injectMetadata(template, meta, currentUrl) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  html = html.replace(/<meta name="title" content="[\s\S]*?" \/>/i, `<meta name="title" content="${meta.title}" />`);
  html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/i, `<meta name="description" content="${meta.description}" />`);
  html = html.replace(/<link rel="canonical" href="[\s\S]*?" \/>/i, `<link rel="canonical" href="${currentUrl}" />`);
  html = html.replace(/<meta property="og:url" content="[\s\S]*?" \/>/i, `<meta property="og:url" content="${currentUrl}" />`);
  html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/i, `<meta property="og:title" content="${meta.title}" />`);
  html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/i, `<meta property="og:description" content="${meta.description}" />`);
  html = html.replace(/<meta property="og:image" content="[\s\S]*?" \/>/i, `<meta property="og:image" content="${meta.image}" />`);
  html = html.replace(/<meta property="og:image:secure_url" content="[\s\S]*?" \/>/i, `<meta property="og:image:secure_url" content="${meta.image}" />`);
  html = html.replace(/<meta name="twitter:url" content="[\s\S]*?" \/>/i, `<meta name="twitter:url" content="${currentUrl}" />`);
  html = html.replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/i, `<meta name="twitter:title" content="${meta.title}" />`);
  html = html.replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/i, `<meta name="twitter:description" content="${meta.description}" />`);
  html = html.replace(/<meta name="twitter:image" content="[\s\S]*?" \/>/i, `<meta name="twitter:image" content="${meta.image}" />`);
  html = html.replace(/<meta name="twitter:image:src" content="[\s\S]*?" \/>/i, `<meta name="twitter:image:src" content="${meta.image}" />`);
  return html;
}

function writeStaticHtml(targetRelPath, content) {
  const fullPath = path.join(distDir, targetRelPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
}

console.log('[postbuild] Generating customized OpenGraph and SEO routes...');

// 1. Generate language root pages: /uz, /ru, /en
const languages = ['uz', 'ru', 'en'];
for (const lang of languages) {
  const url = `https://www.yolnoma.uz/${lang}`;
  const customHtml = injectMetadata(indexHtml, ROUTE_CONFIGS.home, url);
  writeStaticHtml(`${lang}/index.html`, customHtml);
  writeStaticHtml(`${lang}.html`, customHtml);
}

// 2. Generate each route (both root and localized /uz/route, /ru/route, /en/route)
const allRouteKeys = Object.keys(ROUTE_CONFIGS).concat(Object.keys(ALIAS_MAP));

for (const routeKey of allRouteKeys) {
  if (routeKey === 'home') continue;
  const configKey = ALIAS_MAP[routeKey] || routeKey;
  const meta = ROUTE_CONFIGS[configKey] || ROUTE_CONFIGS.home;

  // Root route: e.g. /languages/index.html and /languages.html
  const rootUrl = `https://www.yolnoma.uz/${routeKey}`;
  const rootHtml = injectMetadata(indexHtml, meta, rootUrl);
  writeStaticHtml(`${routeKey}/index.html`, rootHtml);
  writeStaticHtml(`${routeKey}.html`, rootHtml);

  // Localized routes: e.g. /uz/languages/index.html, /uz/languages.html
  for (const lang of languages) {
    const localizedUrl = `https://www.yolnoma.uz/${lang}/${routeKey}`;
    const localizedHtml = injectMetadata(indexHtml, meta, localizedUrl);
    writeStaticHtml(`${lang}/${routeKey}/index.html`, localizedHtml);
    writeStaticHtml(`${lang}/${routeKey}.html`, localizedHtml);
  }
}

// 3. Make dist/404.html an exact clone of index.html
fs.writeFileSync(path.join(distDir, '404.html'), indexHtml);

console.log('[postbuild] Successfully generated specialized OpenGraph routes for Telegram, Google, and Social previews!');
