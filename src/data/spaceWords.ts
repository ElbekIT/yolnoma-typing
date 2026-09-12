/**
 * Space Typing Shooter (Koinot Jangi) uchun saralangan so'zlar bazasi
 * O'zbekcha (Lotin), Inglizcha va Ruscha
 */

export type SpaceLanguage = 'uz' | 'en' | 'ru';

export interface WordCategories {
  short: string[];   // 3-4 harfli (Wave 1-2)
  medium: string[];  // 5-7 harfli (Wave 3-4)
  long: string[];    // 8+ harfli (Wave 5+)
  boss: string[][];  // Boss uchun birikmalar yoki 3 bosqichli so'zlar
}

export const SPACE_WORDS: Record<SpaceLanguage, WordCategories> = {
  uz: {
    short: [
      'nur', 'yer', 'oy', 'kun', 'fan', 'til', 'kuch', 'vaqt', 'oq', 'saf',
      'ilm', 'aql', 'bog', 'yor', 'doz', 'shon', 'dars', 'yosh', 'tez', 'kor',
      'yol', 'sar', 'dov', 'zor', 'jon', 'qon', 'sado', 'olov', 'qush', 'tog',
      'yulduz', 'osmon', 'shamol', 'yomgir', 'daryo', 'dengiz', 'quyosh', 'zamin'
    ],
    medium: {
      // 5-7 harfli
      [Symbol.iterator]: function* () {},
      ...[
        'koinot', 'sayyora', 'galaktika', 'orbitada', 'teleskop', 'qoraora', 'fazogir',
        'chaqmoq', 'tumanlik', 'raketa', 'tezlik', 'mantiq', 'harakat', 'galaba',
        'jasorat', 'bilimdon', 'dastur', 'internet', 'kelajak', 'qudrat', 'parvoz',
        'matonat', 'hamkor', 'yolnoma', 'klaviatura', 'barmoq', 'aniqlik', 'yutuq',
        'yulduzlar', 'magnit', 'plazma', 'energiya', 'kosmodrom', 'gravitatsiya'
      ]
    } as any,
    long: [
      'gravitatsiya', 'astrofizika', 'koinotshunos', 'yulduzlararo', 'texnologiya',
      'suniyintellekt', 'elektromagnit', 'fazoviyparvoz', 'superyulduz', 'marifatparvar',
      'universitet', 'tezkorharakat', 'avtomatlashtirish', 'dasturlash', 'mukammallik',
      'strategiya', 'kristallanish', 'kiberxavfsizlik', 'neyrotarmoq', 'ekotizim'
    ],
    boss: [
      ['GALAKTIKA', 'HUKMDORI', 'KOSMOS'],
      ['KIBERNETIK', 'FLAGMAN', 'SAYYORA'],
      ['GRAVITATSIYA', 'ANOMALIYASI', 'YULDUZ'],
      ['KOSMIK', 'IMPERATOR', 'QUDROT'],
      ['SUPERNOVA', 'PORTLASHI', 'CHUQURLIK']
    ]
  },
  en: {
    short: [
      'star', 'moon', 'ship', 'warp', 'beam', 'nova', 'dark', 'void', 'glow',
      'core', 'dust', 'halo', 'helm', 'mars', 'orbit', 'pulse', 'ray', 'sky',
      'sun', 'tail', 'unit', 'vast', 'wave', 'wind', 'zero', 'zone', 'alien'
    ],
    medium: [
      'galaxy', 'cosmos', 'meteor', 'nebula', 'rocket', 'planet', 'gravity',
      'quantum', 'asteroid', 'universe', 'shuttle', 'station', 'eclipse',
      'pulsar', 'quasar', 'stellar', 'plasma', 'vacuum', 'vector', 'thrust',
      'booster', 'comet', 'horizon', 'infinity', 'voyager', 'odyssey'
    ],
    long: [
      'astronomy', 'interstellar', 'constellation', 'supermassive', 'astrophysics',
      'hyperspace', 'singularity', 'exoplanet', 'teleportation', 'supercluster',
      'gravitational', 'cybernetics', 'supercharged', 'electromagnetic'
    ],
    boss: [
      ['DREADNOUGHT', 'DESTROYER', 'NEXUS'],
      ['GALACTIC', 'OVERLORD', 'COLOSSUS'],
      ['CYBERNETIC', 'MOTHERSHIP', 'TITAN'],
      ['VOIDWALKER', 'SUPERNOVA', 'OMEGA']
    ]
  },
  ru: {
    short: [
      'луч', 'мир', 'щит', 'пуск', 'маяк', 'пульс', 'след', 'свет', 'гром',
      'зонд', 'пояс', 'узел', 'трап', 'борт', 'курс', 'круг', 'небо', 'звук'
    ],
    medium: [
      'космос', 'ракета', 'звезда', 'планета', 'орбита', 'комета', 'спутник',
      'галактика', 'пульсар', 'квазар', 'плазма', 'вакуум', 'кратер', 'сектор',
      'шаттл', 'астроном', 'корабль', 'скорость', 'градус', 'штурман', 'экипаж'
    ],
    long: [
      'вселенная', 'астероид', 'гравитация', 'астрофизика', 'телепортация',
      'межзвездный', 'сингулярность', 'космонавтика', 'созвездие', 'космодром'
    ],
    boss: [
      ['ФЛАГМАН', 'ТИХИЙ', 'ОКЕАН'],
      ['ГАЛАКТИЧЕСКИЙ', 'КРЕЙСЕР', 'ТИБЕРИЙ'],
      ['СВЕРХНОВАЯ', 'КАТАСТРОФА', 'КОСМОС']
    ]
  }
};

// To'g'rilangan o'zbekcha medium massivini toza string[] qilib eksport qilamiz
SPACE_WORDS.uz.medium = [
  'koinot', 'sayyora', 'galaktika', 'orbitada', 'teleskop', 'qoraora', 'fazogir',
  'chaqmoq', 'tumanlik', 'raketa', 'tezlik', 'mantiq', 'harakat', 'galaba',
  'jasorat', 'bilimdon', 'dastur', 'internet', 'kelajak', 'qudrat', 'parvoz',
  'matonat', 'hamkor', 'yolnoma', 'klaviatura', 'barmoq', 'aniqlik', 'yutuq',
  'yulduzlar', 'magnit', 'plazma', 'energiya', 'kosmodrom', 'gravitatsiya'
];

/**
 * Berilgan to'lqin (wave) raqamiga mos keluvchi dushman so'zlarini generatsiya qiladi
 */
export function generateWaveEnemies(wave: number, lang: SpaceLanguage = 'uz') {
  const categories = SPACE_WORDS[lang] || SPACE_WORDS.uz;
  const isBossWave = wave % 5 === 0;

  if (isBossWave) {
    const bossCombo = categories.boss[Math.floor(Math.random() * categories.boss.length)];
    return {
      isBossWave: true,
      bossWords: [...bossCombo],
      regularWords: Array.from({ length: 4 }, () => {
        const list = categories.short;
        return list[Math.floor(Math.random() * list.length)];
      })
    };
  }

  // Odatiy to'lqinlar
  // Wave 1: 5 ta qisqa
  // Wave 2: 7 ta qisqa va o'rta
  // Wave 3+: ko'proq va murakkab
  const count = Math.min(18, 4 + wave * 2);
  const words: string[] = [];
  const usedLetters = new Set<string>();

  for (let i = 0; i < count; i++) {
    let pool: string[];
    if (wave === 1) {
      pool = categories.short;
    } else if (wave === 2) {
      pool = Math.random() > 0.4 ? categories.short : categories.medium;
    } else if (wave <= 4) {
      pool = Math.random() > 0.5 ? categories.medium : categories.short;
    } else {
      const r = Math.random();
      pool = r > 0.6 ? categories.long : r > 0.2 ? categories.medium : categories.short;
    }

    // Bir vaqtning o'zida bir xil harf bilan boshlanadigan dushmanlar juda ko'p bo'lmasligi uchun filtr
    let candidate = pool[Math.floor(Math.random() * pool.length)];
    let attempts = 0;
    while (usedLetters.has(candidate[0]) && attempts < 8) {
      candidate = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    }
    usedLetters.add(candidate[0]);
    if (usedLetters.size > 8) usedLetters.clear();

    words.push(candidate);
  }

  return {
    isBossWave: false,
    bossWords: [] as string[],
    regularWords: words
  };
}
