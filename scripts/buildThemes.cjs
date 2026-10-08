const fs = require('fs');
const path = require('path');

// Helper to create RGBA glow
const glow = (hex, opacity = 0.25) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// 10 Classic Existing Core Themes (Preserved 100% identically)
const classicThemes = [
  {
    id: 'dark',
    name: 'Cyber Neo Cyan (Kiber Sian)',
    category: 'cyber',
    categoryName: 'Kiber & Neon',
    description: 'Chuqur kosmik okean, elektr sian neon nur va ultra-tiniq yozuv',
    bg: '#060913',
    cardBg: '#0b1220',
    subAlt: '#152238',
    textColor: '#f8fafc',
    subColor: '#627899',
    mainColor: '#06b6d4',
    errorColor: '#f43f5e',
    correctColor: '#e2e8f0',
    extraColor: '#38bdf8',
    caretColor: '#00f0ff',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    isDark: true,
    tags: ['cyber', 'neon', 'cyan', 'popular', 'default']
  },
  {
    id: 'emerald',
    name: 'Nordic Emerald (Zumrad Kecha)',
    category: 'nature',
    categoryName: 'Tabiat & Zumrad',
    description: 'Qutb yog\'dusi, chuqur zumrad qorong\'ulik va yashil neon kursor',
    bg: '#040d0e',
    cardBg: '#09181a',
    subAlt: '#132c2e',
    textColor: '#f0fdf4',
    subColor: '#5e8381',
    mainColor: '#10b981',
    errorColor: '#f43f5e',
    correctColor: '#ecfdf5',
    extraColor: '#34d399',
    caretColor: '#10b981',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    isDark: true,
    tags: ['nature', 'green', 'emerald', 'arctic']
  },
  {
    id: 'tokyo',
    name: 'Tokyo Synthwave (Tokio Neon)',
    category: 'cyber',
    categoryName: 'Kiber & Neon',
    description: 'Tokio tungi osmoni, yorqin neon binafsha va elektr pushti nur',
    bg: '#0a0815',
    cardBg: '#131026',
    subAlt: '#221d42',
    textColor: '#f5f3ff',
    subColor: '#7c779d',
    mainColor: '#a855f7',
    errorColor: '#f43f5e',
    correctColor: '#faf5ff',
    extraColor: '#e879f9',
    caretColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    isDark: true,
    tags: ['neon', 'purple', 'tokyo', 'popular']
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire (Kechki Safir)',
    category: 'luxury',
    categoryName: 'Hashamat & Safir',
    description: 'Moviy kosmik dengiz, qirollik safir ko\'ki va muzdek moviy aksent',
    bg: '#070e1c',
    cardBg: '#0e1a33',
    subAlt: '#1a2d54',
    textColor: '#f8fafc',
    subColor: '#6b84ac',
    mainColor: '#38bdf8',
    errorColor: '#f43f5e',
    correctColor: '#f0f9ff',
    extraColor: '#60a5fa',
    caretColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    isDark: true,
    tags: ['blue', 'royal', 'sapphire']
  },
  {
    id: 'magma',
    name: 'Crimson Magma (Qizil Vulqon)',
    category: 'fire',
    categoryName: 'Olov & Vulqon',
    description: 'Qora grafit fon, yonayotgan qizil olov va otashin geymer dizayni',
    bg: '#0e090a',
    cardBg: '#191113',
    subAlt: '#2c1c20',
    textColor: '#fff1f2',
    subColor: '#92757a',
    mainColor: '#f43f5e',
    errorColor: '#e11d48',
    correctColor: '#ffe4e6',
    extraColor: '#fb7185',
    caretColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    isDark: true,
    tags: ['fire', 'red', 'gaming']
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon (Oltin Ufq)',
    category: 'fire',
    categoryName: 'Olov & Quyosh',
    description: 'Kechki quyosh botishi, iliq to\'q fon va yorqin qahrabo olov nuri',
    bg: '#0e0a08',
    cardBg: '#1a120e',
    subAlt: '#2e1e17',
    textColor: '#fff7ed',
    subColor: '#96796c',
    mainColor: '#f97316',
    errorColor: '#f43f5e',
    correctColor: '#ffedd5',
    extraColor: '#fb923c',
    caretColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.25)',
    isDark: true,
    tags: ['orange', 'sunset', 'warm']
  },
  {
    id: 'forest',
    name: 'Matcha Zen (Bambuk O\'rmoni)',
    category: 'nature',
    categoryName: 'Tabiat & Bog\'',
    description: 'Tinchlantiruvchi chuqur tabiat, yapon bambuki va ko\'zga orom beruvchi yashillik',
    bg: '#070e0a',
    cardBg: '#0f1a12',
    subAlt: '#1b2e21',
    textColor: '#f0fdf4',
    subColor: '#688673',
    mainColor: '#22c55e',
    errorColor: '#f43f5e',
    correctColor: '#dcfce7',
    extraColor: '#4ade80',
    caretColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.25)',
    isDark: true,
    tags: ['nature', 'zen', 'green']
  },
  {
    id: 'gold',
    name: 'Cyber Obsidian (Oltin Qora)',
    category: 'luxury',
    categoryName: 'Hashamat & Oltin',
    description: 'Klassik qora obsidian va hashamatli oltin sariq ranglar uyg\'unligi',
    bg: '#090b11',
    cardBg: '#121622',
    subAlt: '#1c2336',
    textColor: '#f8fafc',
    subColor: '#637289',
    mainColor: '#f59e0b',
    errorColor: '#f43f5e',
    correctColor: '#f8fafc',
    extraColor: '#fb923c',
    caretColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    isDark: true,
    tags: ['gold', 'obsidian', 'luxury']
  },
  {
    id: 'light',
    name: 'Porcelain Clean (Ultra Yorug\')',
    category: 'light',
    categoryName: 'Minimal & Yorug\'',
    description: 'Ultra toza oq qog\'oz, qora tiniq harflar va zamonaviy ko\'k sapfir aksent',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    subAlt: '#e2e8f0',
    textColor: '#0f172a',
    subColor: '#64748b',
    mainColor: '#0284c7',
    errorColor: '#e11d48',
    correctColor: '#0f172a',
    extraColor: '#ea580c',
    caretColor: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.15)',
    isDark: false,
    tags: ['light', 'clean', 'white', 'popular']
  },
  {
    id: 'sepia',
    name: 'Retro Coffee (Qahva & Pergament)',
    category: 'light',
    categoryName: 'Minimal & Yorug\'',
    description: 'Qadimiy issiq pergament qog\'oz, qahva espressosi va retro klassika',
    bg: '#f5ede2',
    cardBg: '#fcf6ee',
    subAlt: '#e5dac8',
    textColor: '#261e1b',
    subColor: '#7c6f66',
    mainColor: '#8c532b',
    errorColor: '#be123c',
    correctColor: '#261e1b',
    extraColor: '#c2410c',
    caretColor: '#8c532b',
    glowColor: 'rgba(140, 83, 43, 0.15)',
    isDark: false,
    tags: ['light', 'sepia', 'coffee', 'vintage']
  }
];

// Rich Curated Masterpieces
const curatedDeveloperThemes = [
  { id: 'dracula_official', name: 'Dracula Pro Official', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Mashhur binafsha va pushti dasturchi muhiti', bg: '#282a36', card: '#343746', subAlt: '#44475a', text: '#f8f8f2', sub: '#6272a4', main: '#bd93f9', caret: '#ff79c6', extra: '#50fa7b', err: '#ff5555', dark: true, tag: 'code' },
  { id: 'monokai_classic', name: 'Monokai Classic', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Sublime Text afsonaviy sariq va yashil kodi', bg: '#272822', card: '#383a30', subAlt: '#49483e', text: '#f8f8f2', sub: '#75715e', main: '#e6db74', caret: '#a6e22e', extra: '#fd971f', err: '#f92672', dark: true, tag: 'code' },
  { id: 'nord_deep', name: 'Nord Frost Arctic', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Arktika sovuq ko\'k va moviy Skandinaviya palitrasi', bg: '#2e3440', card: '#3b4252', subAlt: '#434c5e', text: '#eceff4', sub: '#d8dee9', main: '#88c0d0', caret: '#81a1c1', extra: '#8fbcbb', err: '#bf616a', dark: true, tag: 'code' },
  { id: 'one_dark_pro', name: 'One Dark Pro', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Atom va VS Code ning eng sevimli to\'q mavzusi', bg: '#21252b', card: '#282c34', subAlt: '#3a3f4b', text: '#abb2bf', sub: '#5c6370', main: '#61afef', caret: '#98c379', extra: '#e5c07b', err: '#e06c75', dark: true, tag: 'code' },
  { id: 'catppuccin_mocha', name: 'Catppuccin Mocha', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Zamonaviy mayin pastel va yoqimli lavanda', bg: '#1e1e2e', card: '#24273a', subAlt: '#313244', text: '#cdd6f4', sub: '#6c7086', main: '#cba6f7', caret: '#f5c2e7', extra: '#89b4fa', err: '#f38ba8', dark: true, tag: 'code' },
  { id: 'catppuccin_macchiato', name: 'Catppuccin Macchiato', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Iliq qahvali pastel binafsha va moviy palitra', bg: '#24273a', card: '#2a2e45', subAlt: '#363a56', text: '#cad3f5', sub: '#8087a2', main: '#c6a0f6', caret: '#f0c6c6', extra: '#8aadf4', err: '#ed8796', dark: true, tag: 'code' },
  { id: 'catppuccin_latte', name: 'Catppuccin Latte', category: 'light', categoryName: 'Minimal & Yorug\'', desc: 'Yorug\' va muloyim sutli qahva estetikasi', bg: '#eff1f5', card: '#e6e9ef', subAlt: '#ccd0da', text: '#4c4f69', sub: '#8c8fa1', main: '#8839ef', caret: '#ea76cb', extra: '#1e66f5', err: '#d20f39', dark: false, tag: 'code' },
  { id: 'gruvbox_dark', name: 'Gruvbox Retro Hard', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Retro iliq jigarrang va qadimiy terminal uslubi', bg: '#282828', card: '#32302f', subAlt: '#3c3836', text: '#ebdbb2', sub: '#928374', main: '#fe8019', caret: '#fabd2f', extra: '#b8bb26', err: '#fb4934', dark: true, tag: 'code' },
  { id: 'gruvbox_light', name: 'Gruvbox Light Warm', category: 'light', categoryName: 'Minimal & Yorug\'', desc: 'Qadimiy qog\'oz, sarg\'ish iliq kursor va kontrastli kod', bg: '#fbf1c7', card: '#f2e5bc', subAlt: '#d5c4a1', text: '#3c3836', sub: '#7c6f64', main: '#af3a03', caret: '#d79921', extra: '#79740e', err: '#cc241d', dark: false, tag: 'code' },
  { id: 'github_dark_dimmed', name: 'GitHub Dark Dimmed', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'GitHub rasmiy to\'q kulrang va tiniq moviy kodi', bg: '#1c2128', card: '#22272e', subAlt: '#2d333b', text: '#adbac7', sub: '#768390', main: '#539bf5', caret: '#57ab5a', extra: '#6cb6ff', err: '#f47067', dark: true, tag: 'code' },
  { id: 'github_light_clean', name: 'GitHub Light Official', category: 'light', categoryName: 'Minimal & Yorug\'', desc: 'GitHub rasmiy oq foni va klassik ko\'k havolalari', bg: '#ffffff', card: '#f6f8fa', subAlt: '#d0d7de', text: '#24292f', sub: '#57606a', main: '#0969da', caret: '#1a7f37', extra: '#8250df', err: '#cf222e', dark: false, tag: 'code' },
  { id: 'solarized_dark', name: 'Solarized Dark Pro', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Ilmiy asoslangan ko\'zni toliqtirmaydigan moviy-yashil', bg: '#002b36', card: '#073642', subAlt: '#0e4552', text: '#839496', sub: '#586e75', main: '#2aa198', caret: '#268bd2', extra: '#b58900', err: '#dc322f', dark: true, tag: 'code' },
  { id: 'solarized_light', name: 'Solarized Light Pro', category: 'light', categoryName: 'Minimal & Yorug\'', desc: 'Ilmiy och sarg\'ish fon, ko\'zni charchatmaslik uchun maxsus', bg: '#fdf6e3', card: '#eee8d5', subAlt: '#e0d6be', text: '#657b83', sub: '#93a1a1', main: '#2aa198', caret: '#268bd2', extra: '#b58900', err: '#dc322f', dark: false, tag: 'code' },
  { id: 'rose_pine_main', name: 'Rosé Pine Soho', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Nafis qora fon, atirgul pushtisi va yashil archa', bg: '#191724', card: '#1f1d2e', subAlt: '#26233a', text: '#e0def4', sub: '#6e6a86', main: '#eb6f92', caret: '#f6c177', extra: '#9ccfd8', err: '#eb6f92', dark: true, tag: 'code' },
  { id: 'rose_pine_dawn', name: 'Rosé Pine Dawn', category: 'light', categoryName: 'Minimal & Yorug\'', desc: 'Tonggi shafaq, oppoq krem va nozik qizil atirgul', bg: '#faf4ed', card: '#fffaf3', subAlt: '#f2e9de', text: '#575279', sub: '#9893a5', main: '#b4637a', caret: '#ea9d34', extra: '#56949f', err: '#b4637a', dark: false, tag: 'code' },
  { id: 'kanagawa_wave', name: 'Kanagawa Wave', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Yapon qadimiy san\'ati, to\'lqin moviyligi va kuz barglari', bg: '#1f1f28', card: '#252535', subAlt: '#2a2a37', text: '#dcd7ba', sub: '#727169', main: '#7e9cd8', caret: '#ffa066', extra: '#98bb6c', err: '#e82424', dark: true, tag: 'code' },
  { id: 'everforest_dark', name: 'Everforest Mystic', category: 'nature', categoryName: 'Tabiat & Zumrad', desc: 'Mox bosgan sokin o\'rmon, iliq yashil va ko\'zga yengil', bg: '#2d353b', card: '#343f44', subAlt: '#3d484d', text: '#d3c6aa', sub: '#859289', main: '#a7c080', caret: '#dbbc7f', extra: '#7fbbb3', err: '#e67e80', dark: true, tag: 'nature' },
  { id: 'tokyonight_storm', name: 'Tokyo Night Storm', category: 'cyber', categoryName: 'Kiber & Neon', desc: 'Bo\'ronli Tokio kechasi, elektr moviy va neon siyohrang', bg: '#24283b', card: '#292e42', subAlt: '#343b58', text: '#c0caf5', sub: '#565f89', main: '#7aa2f7', caret: '#bb9af7', extra: '#7dcfff', err: '#f7768e', dark: true, tag: 'cyber' },
  { id: 'synthwave_84', name: 'Synthwave \'84 Neon', category: 'cyber', categoryName: 'Kiber & Neon', desc: '80-yillar kodi, neon pushti kursor va nurli sian', bg: '#241b2f', card: '#2b213a', subAlt: '#3a2d4f', text: '#f92aad', sub: '#848bbd', main: '#ff7edb', caret: '#36f9f6', extra: '#fe4450', err: '#fe4450', dark: true, tag: 'cyber' },
  { id: 'night_owl', name: 'Night Owl Midnight', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Sarah Drasnerning mashhur VS Code tungi boyo\'g\'lisi', bg: '#011627', card: '#0b253a', subAlt: '#113552', text: '#d6deeb', sub: '#5f7e97', main: '#82aaff', caret: '#ecc48d', extra: '#7fdbca', err: '#ef5350', dark: true, tag: 'code' },
  { id: 'material_ocean', name: 'Material Ocean Deep', category: 'nature', categoryName: 'Tabiat & Okean', desc: 'Chuqur okean moviyligi va tiniq sian yulduzlar', bg: '#0f111a', card: '#161925', subAlt: '#202436', text: '#8f93a2', sub: '#4b526d', main: '#80cbc4', caret: '#82aaff', extra: '#c792ea', err: '#ff5370', dark: true, tag: 'code' },
  { id: 'poimandres', name: 'Poimandres Minimal', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Sokin zumrad va ko\'k to\'q fonli zamonaviy dizayn', bg: '#1b1e28', card: '#222634', subAlt: '#2e3446', text: '#a6accd', sub: '#506477', main: '#5de4c7', caret: '#add7ff', extra: '#d0679d', err: '#d0679d', dark: true, tag: 'code' },
  { id: 'palenight', name: 'Palenight Elegant', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Mayin binafsha va oqlangan silliq yozuv muhiti', bg: '#292d3e', card: '#32374d', subAlt: '#444267', text: '#a6accd', sub: '#676e95', main: '#c792ea', caret: '#82aaff', extra: '#89ddff', err: '#ff5370', dark: true, tag: 'code' },
  { id: 'ayu_dark', name: 'Ayu Dark Gold', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Oltin zarg\'aldoq va chuqur qora kontrastli kod', bg: '#0b0e14', card: '#131721', subAlt: '#1f2430', text: '#b3b1ad', sub: '#565b66', main: '#e6b450', caret: '#ff8f40', extra: '#73b752', err: '#d95757', dark: true, tag: 'code' },
  { id: 'ayu_mirage', name: 'Ayu Mirage Slate', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Sersoya kulrang-moviy va iliq apelsin kursor', bg: '#1f2430', card: '#242936', subAlt: '#2d3342', text: '#cbccc6', sub: '#707a8c', main: '#ffcc66', caret: '#ffaa33', extra: '#73d0ff', err: '#f28779', dark: true, tag: 'code' },
  { id: 'shades_of_purple', name: 'Shades of Purple', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Ahmad Awaisning mashhur yorqin binafsha va sariq kodi', bg: '#2d2b55', card: '#3b386e', subAlt: '#494489', text: '#e3dfff', sub: '#a599e9', main: '#fad000', caret: '#ff7200', extra: '#b362ff', err: '#ec3a37', dark: true, tag: 'code' },
  { id: 'cobalt2_official', name: 'Cobalt2 Official', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Wes Bosning afsonaviy kobalt ko\'ki va sariq kursori', bg: '#193549', card: '#1f425b', subAlt: '#275270', text: '#ffffff', sub: '#0088ff', main: '#ffc600', caret: '#0088ff', extra: '#3ad900', err: '#ff0000', dark: true, tag: 'code' },
  { id: 'cyberpunk_2077', name: 'Cyberpunk 2077 Night City', category: 'cyber', categoryName: 'Kiber & Neon', desc: 'Night City elektr sariq va qora kiber fon', bg: '#08080a', card: '#121217', subAlt: '#21212c', text: '#fcee0a', sub: '#717182', main: '#fcee0a', caret: '#00f0ff', extra: '#ff003c', err: '#ff003c', dark: true, tag: 'cyber' },
  { id: 'matrix_hacker', name: 'The Matrix Neo Terminal', category: 'cyber', categoryName: 'Kiber & Neon', desc: 'Yashil fosfor, raqamli yomg\'ir va qora terminal', bg: '#030804', card: '#071409', subAlt: '#0f2412', text: '#00ff41', sub: '#1a5c24', main: '#00ff41', caret: '#39ff14', extra: '#008f11', err: '#ff0055', dark: true, tag: 'cyber' },
  { id: 'amoled_pure_black', name: 'AMOLED Void Pitch Black', category: 'code', categoryName: 'Dasturchi & Kod', desc: 'Mutlaq nol pikselli qora OLED ekran, maksimal energiya tejash', bg: '#000000', card: '#0d0d0d', subAlt: '#1a1a1a', text: '#ffffff', sub: '#525252', main: '#38bdf8', caret: '#00f0ff', extra: '#22c55e', err: '#f43f5e', dark: true, tag: 'amoled' },
  { id: 'amoled_gold_luxe', name: 'AMOLED Imperial Gold', category: 'luxury', categoryName: 'Hashamat & Oltin', desc: 'Toza 100% qora OLED fon ustida sof oltin jilosi', bg: '#000000', card: '#0f0e08', subAlt: '#1f1c10', text: '#fef08a', sub: '#854d0e', main: '#eab308', caret: '#fde047', extra: '#f59e0b', err: '#ef4444', dark: true, tag: 'luxury' },
  { id: 'gameboy_classic', name: 'Game Boy DMG-01 Vintage', category: 'retro', categoryName: 'Retro & O\'yinlar', desc: '1989-yilgi afsonaviy sariq-yashil pikselli ekran', bg: '#1b2612', card: '#253519', subAlt: '#374f25', text: '#8bac0f', sub: '#306230', main: '#9bbc0f', caret: '#8bac0f', extra: '#0f380f', err: '#ff0033', dark: true, tag: 'retro' }
];

const allThemes = [...classicThemes];
const existingIds = new Set(allThemes.map(t => t.id));

for (const cur of curatedDeveloperThemes) {
  if (!existingIds.has(cur.id)) {
    existingIds.add(cur.id);
    allThemes.push({
      id: cur.id,
      name: cur.name,
      category: cur.category,
      categoryName: cur.categoryName,
      description: cur.desc,
      bg: cur.bg,
      cardBg: cur.card,
      subAlt: cur.subAlt,
      textColor: cur.text,
      subColor: cur.sub,
      mainColor: cur.main,
      errorColor: cur.err || '#f43f5e',
      correctColor: cur.text,
      extraColor: cur.extra || cur.main,
      caretColor: cur.caret || cur.main,
      glowColor: glow(cur.main, cur.dark ? 0.25 : 0.15),
      isDark: cur.dark,
      tags: [cur.category, cur.tag || cur.category, cur.dark ? 'dark' : 'light']
    });
  }
}

console.log('Curated baseline themes count:', allThemes.length);

// 36 Diverse & Captivating Color Harmonies
const colorHarmonies = [
  { name: 'Cyber Neon Cyan', main: '#00f0ff', caret: '#38bdf8', extra: '#818cf8', sub: '#475569' },
  { name: 'Nordic Emerald', main: '#10b981', caret: '#34d399', extra: '#6ee7b7', sub: '#406050' },
  { name: 'Tokyo Ultraviolet', main: '#a855f7', caret: '#c084fc', extra: '#e879f9', sub: '#685988' },
  { name: 'Crimson Magma', main: '#f43f5e', caret: '#fb7185', extra: '#fda4af', sub: '#78454f' },
  { name: 'Solar Amber', main: '#f59e0b', caret: '#fbbf24', extra: '#fde047', sub: '#786040' },
  { name: 'Royal Sapphire', main: '#0284c7', caret: '#38bdf8', extra: '#7dd3fc', sub: '#455870' },
  { name: 'Electric Indigo', main: '#6366f1', caret: '#818cf8', extra: '#a5b4fc', sub: '#505080' },
  { name: 'Lime Acid Voltage', main: '#84cc16', caret: '#a3e635', extra: '#bef264', sub: '#556635' },
  { name: 'Turquoise Lagoon', main: '#14b8a6', caret: '#2dd4bf', extra: '#5eead4', sub: '#3e6360' },
  { name: 'Rose Petal Glow', main: '#ec4899', caret: '#f472b6', extra: '#fbcfe8', sub: '#7a4260' },
  { name: 'Sunset Tangerine', main: '#f97316', caret: '#fb923c', extra: '#fdba74', sub: '#785038' },
  { name: 'Imperial Gold Bar', main: '#eab308', caret: '#facc15', extra: '#fef08a', sub: '#756835' },
  { name: 'Obsidian Cyan Ray', main: '#06b6d4', caret: '#22d3ee', extra: '#67e8f9', sub: '#486875' },
  { name: 'Fuchsia Laser Pulse', main: '#d946ef', caret: '#e879f9', extra: '#f0abfc', sub: '#6e4575' },
  { name: 'Glacier Mint Ice', main: '#059669', caret: '#10b981', extra: '#6ee7b7', sub: '#3a5e4d' },
  { name: 'Amethyst Velvet', main: '#9333ea', caret: '#c084fc', extra: '#e9d5ff', sub: '#653094' },
  { name: 'Coral Sunrise', main: '#fb7185', caret: '#f43f5e', extra: '#fecdd3', sub: '#854250' },
  { name: 'Matcha Blossom', main: '#4ade80', caret: '#86efac', extra: '#bbf7d0', sub: '#386345' },
  { name: 'Hot Magenta Zap', main: '#ff007f', caret: '#ff77bb', extra: '#ff99cc', sub: '#802050' },
  { name: 'Cosmic Lavender', main: '#c084fc', caret: '#e879f9', extra: '#f3e8ff', sub: '#704f90' },
  { name: 'Honey Cinnamon', main: '#d97706', caret: '#f59e0b', extra: '#fde68a', sub: '#7c5424' },
  { name: 'Oceanic Cobalt', main: '#2563eb', caret: '#60a5fa', extra: '#93c5fd', sub: '#394d80' },
  { name: 'Toxic Phosphor', main: '#22c55e', caret: '#4ade80', extra: '#86efac', sub: '#2b603a' },
  { name: 'Champagne Pearl', main: '#fde047', caret: '#fef08a', extra: '#ffffff', sub: '#7a703a' },
  { name: 'Ruby Dragon', main: '#e11d48', caret: '#fb7185', extra: '#fda4af', sub: '#7a1c32' },
  { name: 'Aquamarine Breeze', main: '#06b6d4', caret: '#67e8f9', extra: '#a5f3fc', sub: '#295b66' },
  { name: 'Espresso Caramel', main: '#a16207', caret: '#ca8a04', extra: '#fef08a', sub: '#64431e' },
  { name: 'Cotton Candy Pop', main: '#f472b6', caret: '#38bdf8', extra: '#c084fc', sub: '#7e4875' },
  { name: 'Laser Wave Violet', main: '#7c3aed', caret: '#a78bfa', extra: '#c4b5fd', sub: '#542f9a' },
  { name: 'Spring Blossom Jade', main: '#10b981', caret: '#6ee7b7', extra: '#a7f3d0', sub: '#33624f' },
  { name: 'Supernova Gold', main: '#fbbf24', caret: '#fde047', extra: '#fef3c7', sub: '#826027' },
  { name: 'Arctic Blue Ice', main: '#38bdf8', caret: '#7dd3fc', extra: '#e0f2fe', sub: '#37617c' },
  { name: 'Phoenix Flare', main: '#ea580c', caret: '#f97316', extra: '#fdba74', sub: '#7a3e1b' },
  { name: 'Midnight Iris', main: '#818cf8', caret: '#a5b4fc', extra: '#e0e7ff', sub: '#4c5294' },
  { name: 'Sakura Petal Breeze', main: '#f43f5e', caret: '#fb7185', extra: '#fce7f3', sub: '#78354c' },
  { name: 'Platinum Silver', main: '#cbd5e1', caret: '#f1f5f9', extra: '#ffffff', sub: '#64748b' }
];

// 20 High-Quality Background Tones (Dark, OLED, Deep, and Soft Light)
const backgroundTones = [
  { tone: 'Deep Carbon', bg: '#07090e', card: '#0e121b', subAlt: '#171e2c', isDark: true },
  { tone: 'Abyssal Void', bg: '#040508', card: '#090c12', subAlt: '#121824', isDark: true },
  { tone: 'Midnight Navy', bg: '#060b14', card: '#0b1526', subAlt: '#12223c', isDark: true },
  { tone: 'Space Violet', bg: '#080612', card: '#110d24', subAlt: '#1c163a', isDark: true },
  { tone: 'AMOLED Pure Pitch', bg: '#000000', card: '#0c0c0c', subAlt: '#1a1a1a', isDark: true },
  { tone: 'Forest Shadow', bg: '#050906', card: '#0b140d', subAlt: '#132217', isDark: true },
  { tone: 'Volcano Dark', bg: '#090505', card: '#130c0c', subAlt: '#221414', isDark: true },
  { tone: 'Dracula Slate', bg: '#181920', card: '#22232e', subAlt: '#303242', isDark: true },
  { tone: 'Nord Frost Dark', bg: '#1b1f27', card: '#252b36', subAlt: '#333b49', isDark: true },
  { tone: 'Gruvbox Charcoal', bg: '#1c1b1a', card: '#262423', subAlt: '#363331', isDark: true },
  { tone: 'Tokyo Twilight', bg: '#13141f', card: '#1c1e2e', subAlt: '#282b40', isDark: true },
  { tone: 'Espresso Barista', bg: '#110b08', card: '#1c130f', subAlt: '#2c1e18', isDark: true },
  { tone: 'Emerald Depths', bg: '#040a08', card: '#081410', subAlt: '#0e241d', isDark: true },
  { tone: 'Cyber Shadow 99', bg: '#08090f', card: '#10121d', subAlt: '#1b1e2f', isDark: true },
  { tone: 'Paper Clean White', bg: '#fafbfc', card: '#ffffff', subAlt: '#e6ebf1', isDark: false },
  { tone: 'Cream Minimal Warm', bg: '#fdfbf7', card: '#ffffff', subAlt: '#efe9df', isDark: false },
  { tone: 'Soft Mist Slate', bg: '#f3f4f6', card: '#ffffff', subAlt: '#e5e7eb', isDark: false },
  { tone: 'Sakura Petal Pale', bg: '#fff5f7', card: '#ffffff', subAlt: '#fedfe5', isDark: false },
  { tone: 'Pastel Mint Breeze', bg: '#f2fbf6', card: '#ffffff', subAlt: '#daf3e5', isDark: false },
  { tone: 'Lavender Cloud Light', bg: '#f8f5ff', card: '#ffffff', subAlt: '#ebdfff', isDark: false }
];

const adjectives = [
  'Hyper', 'Quantum', 'Nebula', 'Eclipse', 'Polar', 'Chrono', 'Starlight', 'Galactic',
  'Zenith', 'Phantom', 'Cosmic', 'Solar', 'Lunar', 'Astral', 'Aurora', 'Titan',
  'Vanguard', 'Apex', 'Matrix', 'Horizon', 'Prism', 'Spectral', 'Velocity', 'Radiant',
  'Mystic', 'Celestial', 'Blaze', 'Mirage', 'Echo', 'Vortex', 'Kvant', 'Orbital',
  'Super', 'Valiant', 'Infinite', 'Oasis', 'Shadow', 'Sovereign', 'Absolute', 'Pulse',
  'Alanga', 'Yashin', 'Simurg\'', 'Zilzila', 'Afsona', 'Qaqnus', 'Sayyora', 'Zamondosh',
  'Shabboda', 'Jiloli', 'Marvarid', 'Feruza', 'Nilufar', 'Chashma', 'Samoviy', 'Durrona',
  'Burchak', 'Koinot', 'Zangori', 'Moviy', 'Charog\'on', 'Tojdor', 'Brilliant', 'Alvon'
];

const nouns = [
  'Sian', 'Zumrad', 'Safir', 'Yoqut', 'Plazma', 'Lazer', 'Olov', 'To\'lqin',
  'Muzlik', 'Dengiz', 'Sahro', 'Yulduz', 'Ufq', 'Quyosh', 'Shom', 'Tong',
  'Bulut', 'Tog\'', 'Vodiy', 'Chashma', 'Shamol', 'Zarba', 'Neon', 'Kristal',
  'Brilliant', 'Koinot', 'Qafas', 'Kamalak', 'Binafsha', 'Pushti', 'Tilla', 'Sim',
  'Girdob', 'Ummon', 'Zulmat', 'Nur', 'Qoya', 'Mash\'ala', 'Ko\'lanka', 'Chaqmoq',
  'Sharshara', 'Barg', 'Gulshan', 'Kahrabo', 'Firuza', 'Sadaf', 'Lola', 'Gilos'
];

const catKeys = ['cyber', 'code', 'space', 'nature', 'fire', 'pastel', 'luxury', 'light', 'retro'];
const catNameMap = {
  cyber: 'Kiber & Neon',
  code: 'Dasturchi & Kod',
  space: 'Kosmos & Galaktika',
  nature: 'Tabiat & Okean',
  fire: 'Olov & Quyosh',
  pastel: 'Pastel & Shirin',
  luxury: 'Hashamat & Oltin',
  light: 'Minimal & Yorug\'',
  retro: 'Retro & O\'yinlar'
};

// Target: 1000 unique, rich, curated and procedurally crafted themes!
// 1000 gives massive variety across all categories
const TARGET_COUNT = 1000;
let genIndex = 1;

while (allThemes.length < TARGET_COUNT) {
  const harm = colorHarmonies[genIndex % colorHarmonies.length];
  const bgTone = backgroundTones[Math.floor(genIndex / 3) % backgroundTones.length];
  const adj = adjectives[genIndex % adjectives.length];
  const noun = nouns[(genIndex * 3 + Math.floor(genIndex / adjectives.length)) % nouns.length];
  const cat = bgTone.isDark ? catKeys[genIndex % (catKeys.length - 1)] : 'light';

  const cleanNoun = noun.toLowerCase().replace(/[^a-z0-9]/g, '');
  const id = `yolnoma_th_${genIndex}_${cat}_${cleanNoun}`;
  
  if (!existingIds.has(id)) {
    existingIds.add(id);
    const isDark = bgTone.isDark;
    const textCol = isDark ? '#f8fafc' : '#0f172a';
    const subCol = isDark ? harm.sub : '#64748b';

    allThemes.push({
      id,
      name: `${adj} ${noun} #${genIndex}`,
      category: cat,
      categoryName: catNameMap[cat] || 'Kiber & Neon',
      description: `${harm.name} uyg'unligi, ${bgTone.tone} foni va ultra-tiniq aksent`,
      bg: bgTone.bg,
      cardBg: bgTone.card,
      subAlt: bgTone.subAlt,
      textColor: textCol,
      subColor: subCol,
      mainColor: harm.main,
      errorColor: '#f43f5e',
      correctColor: textCol,
      extraColor: harm.extra,
      caretColor: harm.caret,
      glowColor: glow(harm.main, isDark ? 0.25 : 0.15),
      isDark,
      tags: [cat, isDark ? 'dark' : 'light', 'custom']
    });
  }
  genIndex++;
}

console.log(`TOTAL THEMES GENERATED: ${allThemes.length}`);

// Output to src/config/themesData.ts
const outputTs = `// Rich Curated & Generated ${allThemes.length} Distinct Themes for Yolnoma
export interface ThemeConfig {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  description: string;
  bg: string;
  cardBg: string;
  subAlt: string;
  textColor: string;
  subColor: string;
  mainColor: string;
  errorColor: string;
  correctColor: string;
  extraColor: string;
  caretColor: string;
  glowColor: string;
  isDark: boolean;
  tags: string[];
}

export const THEME_LIST: ThemeConfig[] = ${JSON.stringify(allThemes, null, 2)};

export const themes: Record<string, ThemeConfig> = {};
for (const t of THEME_LIST) {
  themes[t.id] = t;
}

export const getSafeThemeConfig = (themeKey?: string): ThemeConfig => {
  if (themeKey && themes[themeKey]) return themes[themeKey];
  return themes.dark || THEME_LIST[0];
};
`;

fs.writeFileSync(path.join(__dirname, '../src/config/themesData.ts'), outputTs, 'utf8');
console.log('Successfully wrote src/config/themesData.ts with', allThemes.length, 'themes!');
