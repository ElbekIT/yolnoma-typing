import { CodingProblem } from '../types/coding';

export const CODING_PROBLEMS: CodingProblem[] = [
  // ==========================================
  // BOSQICH 1: BOSHLANG'ICH (10 TA MASALA)
  // ==========================================
  {
    id: 'p1',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 1,
    title: "Ikkita son yig'indisi",
    slug: 'two-sum-simple',
    difficulty: 'Oson',
    points: 10,
    category: 'Matematika',
    description: "Sizga ikkita butun son `a` va `b` beriladi. Ularning yig'indisini hisoblab qaytaruvchi funksiya yozing.",
    inputFormat: "Ikkita butun son: a va b",
    outputFormat: "Yig'indi (butun son)",
    constraints: ["-10^9 <= a, b <= 10^9"],
    examples: [
      { input: "a = 5, b = 10", output: "15", explanation: "5 + 10 = 15" },
      { input: "a = -3, b = 7", output: "4", explanation: "-3 + 7 = 4" }
    ],
    starterCode: {
      javascript: `// Ikkita son yig'indisini qaytaring\nfunction solve(a, b) {\n  // Kodingizni shu yerga yozing\n  return a + b;\n}`,
      python: `# Ikkita son yig'indisini qaytaring\ndef solve(a, b):\n    # Kodingizni shu yerga yozing\n    return a + b`
    },
    functionName: 'solve',
    hint: "Ikkita sonni shunchaki `+` operatori orqali qo'shing va natijani `return` qiling.",
    testCases: [
      { id: 1, inputDisplay: "a = 5, b = 10", args: [5, 10], expected: 15 },
      { id: 2, inputDisplay: "a = 0, b = 0", args: [0, 0], expected: 0 },
      { id: 3, inputDisplay: "a = -5, b = 15", args: [-5, 15], expected: 10 },
      { id: 4, inputDisplay: "a = 120, b = 80", args: [120, 80], expected: 200 },
      { id: 5, inputDisplay: "a = -40, b = -60", args: [-40, -60], expected: -100 },
      { id: 6, inputDisplay: "a = 999, b = 1", args: [999, 1], expected: 1000 },
      { id: 7, inputDisplay: "a = 2500, b = 7500", args: [2500, 7500], expected: 10000, isHidden: true },
      { id: 8, inputDisplay: "a = -12345, b = 12345", args: [-12345, 12345], expected: 0, isHidden: true },
      { id: 9, inputDisplay: "a = 55555, b = 44445", args: [55555, 44445], expected: 100000, isHidden: true },
      { id: 10, inputDisplay: "a = 1000000, b = 2000000", args: [1000000, 2000000], expected: 3000000, isHidden: true }
    ]
  },
  {
    id: 'p2',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 2,
    title: "Juft yoki toq son",
    slug: 'is-even',
    difficulty: 'Oson',
    points: 10,
    category: 'Mantiq',
    description: "Berilgan `n` butun soni juft bo'lsa `true`, toq bo'lsa `false` qaytaring.",
    inputFormat: "Butun son: n",
    outputFormat: "Mantiqiy qiymat (boolean): true yoki false",
    constraints: ["-10^9 <= n <= 10^9"],
    examples: [
      { input: "n = 4", output: "true", explanation: "4 soni 2 ga qoldiqsiz bo'linadi, shuning uchun juft." },
      { input: "n = 7", output: "false", explanation: "7 soni toq." }
    ],
    starterCode: {
      javascript: `// Son juft bo'lsa true, toq bo'lsa false qaytaring\nfunction is_even(n) {\n  return n % 2 === 0;\n}`,
      python: `# Son juft bo'lsa true, toq bo'lsa false qaytaring\ndef is_even(n):\n    return n % 2 == 0`
    },
    functionName: 'is_even',
    hint: "Qoldiq olish `%` operatoridan foydalaning: `n % 2 === 0`.",
    testCases: [
      { id: 1, inputDisplay: "n = 4", args: [4], expected: true },
      { id: 2, inputDisplay: "n = 7", args: [7], expected: false },
      { id: 3, inputDisplay: "n = 0", args: [0], expected: true },
      { id: 4, inputDisplay: "n = -2", args: [-2], expected: true },
      { id: 5, inputDisplay: "n = -5", args: [-5], expected: false },
      { id: 6, inputDisplay: "n = 100", args: [100], expected: true },
      { id: 7, inputDisplay: "n = 1001", args: [1001], expected: false, isHidden: true },
      { id: 8, inputDisplay: "n = 888888", args: [888888], expected: true, isHidden: true },
      { id: 9, inputDisplay: "n = -99999", args: [-99999], expected: false, isHidden: true },
      { id: 10, inputDisplay: "n = 2026", args: [2026], expected: true, isHidden: true }
    ]
  },
  {
    id: 'p3',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 3,
    title: "Matn uzunligini aniqlash",
    slug: 'string-length',
    difficulty: 'Oson',
    points: 10,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` matnining belgilar sonini (uzunligini) aniqlab qaytaring.",
    inputFormat: "Satr (string): s",
    outputFormat: "Uzunlik (butun son)",
    constraints: ["0 <= s.length <= 10000"],
    examples: [
      { input: "s = 'Salom'", output: "5" },
      { input: "s = ''", output: "0" }
    ],
    starterCode: {
      javascript: `function get_length(s) {\n  return s.length;\n}`,
      python: `def get_length(s):\n    return len(s)`
    },
    functionName: 'get_length',
    hint: "JavaScript-da `s.length`, Python-da `len(s)` yordam beradi.",
    testCases: [
      { id: 1, inputDisplay: "s = 'Salom'", args: ['Salom'], expected: 5 },
      { id: 2, inputDisplay: "s = ''", args: [''], expected: 0 },
      { id: 3, inputDisplay: "s = 'Yolnoma'", args: ['Yolnoma'], expected: 7 },
      { id: 4, inputDisplay: "s = 'Uzbekistan'", args: ['Uzbekistan'], expected: 10 },
      { id: 5, inputDisplay: "s = ' '", args: [' '], expected: 1 },
      { id: 6, inputDisplay: "s = 'Coding Arena'", args: ['Coding Arena'], expected: 12 },
      { id: 7, inputDisplay: "s = '1234567890'", args: ['1234567890'], expected: 10, isHidden: true },
      { id: 8, inputDisplay: "s = 'Frontend Developer'", args: ['Frontend Developer'], expected: 18, isHidden: true },
      { id: 9, inputDisplay: "s = 'Tez yozish arenasi'", args: ['Tez yozish arenasi'], expected: 18, isHidden: true },
      { id: 10, inputDisplay: "s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'", args: ['ABCDEFGHIJKLMNOPQRSTUVWXYZ'], expected: 26, isHidden: true }
    ]
  },
  {
    id: 'p4',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 4,
    title: "Teskari matn",
    slug: 'reverse-string',
    difficulty: 'Oson',
    points: 10,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` matnini teskari tartibda qaytaring. Masalan, 'salom' -> 'molas'.",
    inputFormat: "Satr (string): s",
    outputFormat: "Teskari satr (string)",
    constraints: ["0 <= s.length <= 1000"],
    examples: [
      { input: "s = 'salom'", output: "'molas'" },
      { input: "s = 'dunyo'", output: "'oynud'" }
    ],
    starterCode: {
      javascript: `function reverse_str(s) {\n  return s.split('').reverse().join('');\n}`,
      python: `def reverse_str(s):\n    return s[::-1]`
    },
    functionName: 'reverse_str',
    hint: "Satrni massivga ajratib teskari o'giring yoki sikl orqali oxiridan boshiga o'qing.",
    testCases: [
      { id: 1, inputDisplay: "s = 'salom'", args: ['salom'], expected: 'molas' },
      { id: 2, inputDisplay: "s = 'dunyo'", args: ['dunyo'], expected: 'oynud' },
      { id: 3, inputDisplay: "s = 'a'", args: ['a'], expected: 'a' },
      { id: 4, inputDisplay: "s = ''", args: [''], expected: '' },
      { id: 5, inputDisplay: "s = '12345'", args: ['12345'], expected: '54321' },
      { id: 6, inputDisplay: "s = 'yolnoma'", args: ['yolnoma'], expected: 'amonlyo' },
      { id: 7, inputDisplay: "s = 'level'", args: ['level'], expected: 'level', isHidden: true },
      { id: 8, inputDisplay: "s = 'code'", args: ['code'], expected: 'edoc', isHidden: true },
      { id: 9, inputDisplay: "s = 'toshkent'", args: ['toshkent'], expected: 'tnekhsot', isHidden: true },
      { id: 10, inputDisplay: "s = 'dasturchi'", args: ['dasturchi'], expected: 'ihcrutsad', isHidden: true }
    ]
  },
  {
    id: 'p5',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 5,
    title: "Uchta sonning eng kattasi",
    slug: 'max-of-three',
    difficulty: 'Oson',
    points: 10,
    category: 'Mantiq',
    description: "Sizga uchta son `a`, `b`, `c` beriladi. Ularning orasida eng katta qiymatga ega sonni qaytaring.",
    inputFormat: "Uchta butun son: a, b, c",
    outputFormat: "Eng katta son",
    constraints: ["-10^9 <= a, b, c <= 10^9"],
    examples: [
      { input: "a = 3, b = 7, c = 5", output: "7" },
      { input: "a = 10, b = 10, c = 2", output: "10" }
    ],
    starterCode: {
      javascript: `function max_three(a, b, c) {\n  return Math.max(a, b, c);\n}`,
      python: `def max_three(a, b, c):\n    return max(a, b, c)`
    },
    functionName: 'max_three',
    hint: "Math.max(a, b, c) yoki if/else shartlaridan foydalaning.",
    testCases: [
      { id: 1, inputDisplay: "a = 3, b = 7, c = 5", args: [3, 7, 5], expected: 7 },
      { id: 2, inputDisplay: "a = 10, b = 2, c = 8", args: [10, 2, 8], expected: 10 },
      { id: 3, inputDisplay: "a = -5, b = -2, c = -9", args: [-5, -2, -9], expected: -2 },
      { id: 4, inputDisplay: "a = 4, b = 4, c = 4", args: [4, 4, 4], expected: 4 },
      { id: 5, inputDisplay: "a = 0, b = -10, c = 10", args: [0, -10, 10], expected: 10 },
      { id: 6, inputDisplay: "a = 100, b = 50, c = 120", args: [100, 50, 120], expected: 120 },
      { id: 7, inputDisplay: "a = 999, b = 998, c = 997", args: [999, 998, 997], expected: 999, isHidden: true },
      { id: 8, inputDisplay: "a = -100, b = -50, c = 0", args: [-100, -50, 0], expected: 0, isHidden: true },
      { id: 9, inputDisplay: "a = 77, b = 77, c = 12", args: [77, 77, 12], expected: 77, isHidden: true },
      { id: 10, inputDisplay: "a = 1234, b = 5678, c = 3456", args: [1234, 5678, 3456], expected: 5678, isHidden: true }
    ]
  },
  {
    id: 'p6',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 6,
    title: "Haroratni o'girish (Celsius to Fahrenheit)",
    slug: 'celsius-to-fahrenheit',
    difficulty: 'Oson',
    points: 10,
    category: 'Matematika',
    description: "Selsiy bo'yicha berilgan `c` haroratini Farengeytga o'tkazing. Formula: F = C * 1.8 + 32.",
    inputFormat: "Son (float yoki int): c",
    outputFormat: "Farengeyt qiymati (son)",
    constraints: ["-273 <= c <= 1000"],
    examples: [
      { input: "c = 0", output: "32" },
      { input: "c = 100", output: "212" }
    ],
    starterCode: {
      javascript: `function c_to_f(c) {\n  return c * 1.8 + 32;\n}`,
      python: `def c_to_f(c):\n    return c * 1.8 + 32`
    },
    functionName: 'c_to_f',
    hint: "`c * 1.8 + 32` formulasini qo'llang.",
    testCases: [
      { id: 1, inputDisplay: "c = 0", args: [0], expected: 32 },
      { id: 2, inputDisplay: "c = 100", args: [100], expected: 212 },
      { id: 3, inputDisplay: "c = -40", args: [-40], expected: -40 },
      { id: 4, inputDisplay: "c = 25", args: [25], expected: 77 },
      { id: 5, inputDisplay: "c = 37", args: [37], expected: 98.6 },
      { id: 6, inputDisplay: "c = -10", args: [-10], expected: 14 },
      { id: 7, inputDisplay: "c = 50", args: [50], expected: 122, isHidden: true },
      { id: 8, inputDisplay: "c = 20", args: [20], expected: 68, isHidden: true },
      { id: 9, inputDisplay: "c = 30", args: [30], expected: 86, isHidden: true },
      { id: 10, inputDisplay: "c = -20", args: [-20], expected: -4, isHidden: true }
    ]
  },
  {
    id: 'p7',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 7,
    title: "Faktorial hisoblash",
    slug: 'factorial',
    difficulty: 'Oson',
    points: 10,
    category: 'Matematika',
    description: "Berilgan manfiy bo'lmagan `n` butun sonining faktorialini (n!) hisoblang. Masalan: 5! = 5 * 4 * 3 * 2 * 1 = 120. Eslatma: 0! = 1.",
    inputFormat: "Butun son: n (0 <= n <= 12)",
    outputFormat: "Faktorial qiymati",
    constraints: ["0 <= n <= 12"],
    examples: [
      { input: "n = 5", output: "120" },
      { input: "n = 0", output: "1" }
    ],
    starterCode: {
      javascript: `function factorial(n) {\n  let res = 1;\n  for (let i = 2; i <= n; i++) res *= i;\n  return res;\n}`,
      python: `def factorial(n):\n    res = 1\n    for i in range(2, n + 1):\n        res *= i\n    return res`
    },
    functionName: 'factorial',
    hint: "1 dan n gacha sonlarni ko'paytirib boring. n=0 bo'lsa 1 qaytaring.",
    testCases: [
      { id: 1, inputDisplay: "n = 5", args: [5], expected: 120 },
      { id: 2, inputDisplay: "n = 0", args: [0], expected: 1 },
      { id: 3, inputDisplay: "n = 1", args: [1], expected: 1 },
      { id: 4, inputDisplay: "n = 3", args: [3], expected: 6 },
      { id: 5, inputDisplay: "n = 4", args: [4], expected: 24 },
      { id: 6, inputDisplay: "n = 6", args: [6], expected: 720 },
      { id: 7, inputDisplay: "n = 7", args: [7], expected: 5040, isHidden: true },
      { id: 8, inputDisplay: "n = 8", args: [8], expected: 40320, isHidden: true },
      { id: 9, inputDisplay: "n = 9", args: [9], expected: 362880, isHidden: true },
      { id: 10, inputDisplay: "n = 10", args: [10], expected: 3628800, isHidden: true }
    ]
  },
  {
    id: 'p8',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 8,
    title: "Palindrom so'z tekshiruvi",
    slug: 'is-palindrome',
    difficulty: 'Oson',
    points: 10,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` so'zi o'ngdan ham, chapdan ham bir xil o'qilsa (palindrom bo'lsa) `true`, aks holda `false` qaytaring. Katta-kichik harflar e'tiborga olinmasin.",
    inputFormat: "Satr: s",
    outputFormat: "boolean (true / false)",
    constraints: ["1 <= s.length <= 1000"],
    examples: [
      { input: "s = 'radar'", output: "true" },
      { input: "s = 'salom'", output: "false" }
    ],
    starterCode: {
      javascript: `function is_palindrome(s) {\n  const clean = s.toLowerCase();\n  return clean === clean.split('').reverse().join('');\n}`,
      python: `def is_palindrome(s):\n    clean = s.lower()\n    return clean == clean[::-1]`
    },
    functionName: 'is_palindrome',
    hint: "Avval so'zni kichik harflarga o'tkazing va teskarisi bilan tengligini solishtiring.",
    testCases: [
      { id: 1, inputDisplay: "s = 'radar'", args: ['radar'], expected: true },
      { id: 2, inputDisplay: "s = 'salom'", args: ['salom'], expected: false },
      { id: 3, inputDisplay: "s = 'Kiyik'", args: ['Kiyik'], expected: true },
      { id: 4, inputDisplay: "s = 'a'", args: ['a'], expected: true },
      { id: 5, inputDisplay: "s = 'Madam'", args: ['Madam'], expected: true },
      { id: 6, inputDisplay: "s = 'yolnoma'", args: ['yolnoma'], expected: false },
      { id: 7, inputDisplay: "s = '12321'", args: ['12321'], expected: true, isHidden: true },
      { id: 8, inputDisplay: "s = '12345'", args: ['12345'], expected: false, isHidden: true },
      { id: 9, inputDisplay: "s = 'Rotator'", args: ['Rotator'], expected: true, isHidden: true },
      { id: 10, inputDisplay: "s = 'developer'", args: ['developer'], expected: false, isHidden: true }
    ]
  },
  {
    id: 'p9',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 9,
    title: "Unli harflar soni",
    slug: 'vowel-count',
    difficulty: 'Oson',
    points: 10,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` matnidagi unli harflar (a, e, i, o, u) sonini hisoblang. Katta va kichik harflar hisobga olinsin.",
    inputFormat: "Satr: s",
    outputFormat: "Unlilar soni (butun son)",
    constraints: ["0 <= s.length <= 10000"],
    examples: [
      { input: "s = 'salom'", output: "2", explanation: "'a' va 'o' unli." },
      { input: "s = 'sky'", output: "0" }
    ],
    starterCode: {
      javascript: `function count_vowels(s) {\n  const vowels = 'aeiouAEIOU';\n  let count = 0;\n  for (let ch of s) {\n    if (vowels.includes(ch)) count++;\n  }\n  return count;\n}`,
      python: `def count_vowels(s):\n    vowels = 'aeiouAEIOU'\n    count = 0\n    for ch in s:\n        if ch in vowels:\n            count += 1\n    return count`
    },
    functionName: 'count_vowels',
    hint: "Har bir harfni tekshirib, 'aeiouAEIOU' to'plamida bor-yo'qligini sanang.",
    testCases: [
      { id: 1, inputDisplay: "s = 'salom'", args: ['salom'], expected: 2 },
      { id: 2, inputDisplay: "s = 'sky'", args: ['sky'], expected: 0 },
      { id: 3, inputDisplay: "s = 'Uzbekistan'", args: ['Uzbekistan'], expected: 4 },
      { id: 4, inputDisplay: "s = 'aeiou'", args: ['aeiou'], expected: 5 },
      { id: 5, inputDisplay: "s = ''", args: [''], expected: 0 },
      { id: 6, inputDisplay: "s = 'HELLO WORLD'", args: ['HELLO WORLD'], expected: 3 },
      { id: 7, inputDisplay: "s = 'Dasturchi'", args: ['Dasturchi'], expected: 3, isHidden: true },
      { id: 8, inputDisplay: "s = 'Algorithms'", args: ['Algorithms'], expected: 3, isHidden: true },
      { id: 9, inputDisplay: "s = 'Yolnoma Typing Arena'", args: ['Yolnoma Typing Arena'], expected: 7, isHidden: true },
      { id: 10, inputDisplay: "s = 'bcdfghjklmnpqrstvwxyz'", args: ['bcdfghjklmnpqrstvwxyz'], expected: 0, isHidden: true }
    ]
  },
  {
    id: 'p10',
    stage: 1,
    stageName: "1-Bosqich: Boshlang'ich asoslar",
    number: 10,
    title: "Massiv elementlari yig'indisi",
    slug: 'array-sum',
    difficulty: 'Oson',
    points: 10,
    category: 'Massivlar (Arrays)',
    description: "Berilgan `nums` butun sonlar massividagi barcha elementlarning yig'indisini hisoblab qaytaring. Agar massiv bo'sh bo'lsa, 0 qaytaring.",
    inputFormat: "Sonlar massivi: nums",
    outputFormat: "Yig'indi (butun son)",
    constraints: ["0 <= nums.length <= 1000", "-10^6 <= nums[i] <= 10^6"],
    examples: [
      { input: "nums = [1, 2, 3, 4, 5]", output: "15" },
      { input: "nums = []", output: "0" }
    ],
    starterCode: {
      javascript: `function array_sum(nums) {\n  return nums.reduce((acc, v) => acc + v, 0);\n}`,
      python: `def array_sum(nums):\n    return sum(nums)`
    },
    functionName: 'array_sum',
    hint: "Sikl yoki `reduce` / `sum` funksiyasidan foydalaning.",
    testCases: [
      { id: 1, inputDisplay: "nums = [1, 2, 3, 4, 5]", args: [[1, 2, 3, 4, 5]], expected: 15 },
      { id: 2, inputDisplay: "nums = []", args: [[]], expected: 0 },
      { id: 3, inputDisplay: "nums = [10, -10, 5]", args: [[10, -10, 5]], expected: 5 },
      { id: 4, inputDisplay: "nums = [100]", args: [[100]], expected: 100 },
      { id: 5, inputDisplay: "nums = [-1, -2, -3]", args: [[-1, -2, -3]], expected: -6 },
      { id: 6, inputDisplay: "nums = [0, 0, 0, 0]", args: [[0, 0, 0, 0]], expected: 0 },
      { id: 7, inputDisplay: "nums = [5, 15, 25, 35, 45]", args: [[5, 15, 25, 35, 45]], expected: 125, isHidden: true },
      { id: 8, inputDisplay: "nums = [1000, 2000, 3000]", args: [[1000, 2000, 3000]], expected: 6000, isHidden: true },
      { id: 9, inputDisplay: "nums = [-50, 50, -25, 25, 10]", args: [[-50, 50, -25, 25, 10]], expected: 10, isHidden: true },
      { id: 10, inputDisplay: "nums = [1, 3, 5, 7, 9, 11]", args: [[1, 3, 5, 7, 9, 11]], expected: 36, isHidden: true }
    ]
  },

  // ==========================================
  // BOSQICH 2: O'RTA DARAJA (10 TA MASALA)
  // ==========================================
  {
    id: 'p11',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 1,
    title: "Tub sonni aniqlash",
    slug: 'is-prime',
    difficulty: "O'rta",
    points: 20,
    category: 'Matematika',
    description: "Berilgan `n` butun soni tub son (faqat 1 ga va o'ziga bo'linadigan son) bo'lsa `true`, aks holda `false` qaytaring. Eslatma: 1 tub son emas.",
    inputFormat: "Butun son: n",
    outputFormat: "boolean (true / false)",
    constraints: ["1 <= n <= 10^7"],
    examples: [
      { input: "n = 7", output: "true" },
      { input: "n = 4", output: "false" }
    ],
    starterCode: {
      javascript: `function is_prime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i * i <= n; i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}`,
      python: `def is_prime(n):\n    if n <= 1:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True`
    },
    functionName: 'is_prime',
    hint: "2 dan ildiz(n) gacha bo'lgan sonlarga bo'lib ko'ring.",
    testCases: [
      { id: 1, inputDisplay: "n = 7", args: [7], expected: true },
      { id: 2, inputDisplay: "n = 4", args: [4], expected: false },
      { id: 3, inputDisplay: "n = 1", args: [1], expected: false },
      { id: 4, inputDisplay: "n = 2", args: [2], expected: true },
      { id: 5, inputDisplay: "n = 13", args: [13], expected: true },
      { id: 6, inputDisplay: "n = 25", args: [25], expected: false },
      { id: 7, inputDisplay: "n = 97", args: [97], expected: true, isHidden: true },
      { id: 8, inputDisplay: "n = 100", args: [100], expected: false, isHidden: true },
      { id: 9, inputDisplay: "n = 541", args: [541], expected: true, isHidden: true },
      { id: 10, inputDisplay: "n = 1000", args: [1000], expected: false, isHidden: true }
    ]
  },
  {
    id: 'p12',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 2,
    title: "Fibonachchi soni",
    slug: 'fibonacci',
    difficulty: "O'rta",
    points: 20,
    category: 'Matematika',
    description: "Fibonachchi ketma-ketligining `n`-elementini qaytaring. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
    inputFormat: "Butun son: n (0 <= n <= 30)",
    outputFormat: "Fibonachchi soni (butun son)",
    constraints: ["0 <= n <= 30"],
    examples: [
      { input: "n = 6", output: "8", explanation: "Ketma-ketlik: 0, 1, 1, 2, 3, 5, 8" },
      { input: "n = 2", output: "1" }
    ],
    starterCode: {
      javascript: `function fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    let c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}`,
      python: `def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`
    },
    functionName: 'fibonacci',
    hint: "Ikkita o'zgaruvchi bilan 2 dan n gacha oldingi ikkitasini qo'shib boring.",
    testCases: [
      { id: 1, inputDisplay: "n = 6", args: [6], expected: 8 },
      { id: 2, inputDisplay: "n = 0", args: [0], expected: 0 },
      { id: 3, inputDisplay: "n = 1", args: [1], expected: 1 },
      { id: 4, inputDisplay: "n = 3", args: [3], expected: 2 },
      { id: 5, inputDisplay: "n = 5", args: [5], expected: 5 },
      { id: 6, inputDisplay: "n = 10", args: [10], expected: 55 },
      { id: 7, inputDisplay: "n = 12", args: [12], expected: 144, isHidden: true },
      { id: 8, inputDisplay: "n = 15", args: [15], expected: 610, isHidden: true },
      { id: 9, inputDisplay: "n = 20", args: [20], expected: 6765, isHidden: true },
      { id: 10, inputDisplay: "n = 25", args: [25], expected: 75025, isHidden: true }
    ]
  },
  {
    id: 'p13',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 3,
    title: "Anagramma tekshiruvi",
    slug: 'anagram-check',
    difficulty: "Oson",
    points: 20,
    category: 'Satrlar (Strings)',
    description: "Ikkita `s1` va `s2` satrlari berilgan. Agar ular bir-biriga anagramma bo'lsa (bir xil harflardan tashkil topgan bo'lsa), `true` qaytaring, aks holda `false`.",
    inputFormat: "Ikkita satr: s1 va s2",
    outputFormat: "boolean (true / false)",
    constraints: ["1 <= s1.length, s2.length <= 10^4"],
    examples: [
      { input: "s1 = 'silent', s2 = 'listen'", output: "true" },
      { input: "s1 = 'olma', s2 = 'anor'", output: "false" }
    ],
    starterCode: {
      javascript: `function is_anagram(s1, s2) {\n  if (s1.length !== s2.length) return false;\n  return s1.split('').sort().join('') === s2.split('').sort().join('');\n}`,
      python: `def is_anagram(s1, s2):\n    if len(s1) != len(s2):\n        return False\n    return sorted(s1) == sorted(s2)`
    },
    functionName: 'is_anagram',
    hint: "Ikkala satrni harflar bo'yicha saralab (sort) tengligini tekshiring.",
    testCases: [
      { id: 1, inputDisplay: "s1 = 'silent', s2 = 'listen'", args: ['silent', 'listen'], expected: true },
      { id: 2, inputDisplay: "s1 = 'olma', s2 = 'anor'", args: ['olma', 'anor'], expected: false },
      { id: 3, inputDisplay: "s1 = 'rat', s2 = 'car'", args: ['rat', 'car'], expected: false },
      { id: 4, inputDisplay: "s1 = 'a', s2 = 'a'", args: ['a', 'a'], expected: true },
      { id: 5, inputDisplay: "s1 = 'ab', s2 = 'ba'", args: ['ab', 'ba'], expected: true },
      { id: 6, inputDisplay: "s1 = 'aabb', s2 = 'bbaa'", args: ['aabb', 'bbaa'], expected: true },
      { id: 7, inputDisplay: "s1 = 'hello', s2 = 'bello'", args: ['hello', 'bello'], expected: false, isHidden: true },
      { id: 8, inputDisplay: "s1 = 'triangle', s2 = 'integral'", args: ['triangle', 'integral'], expected: true, isHidden: true },
      { id: 9, inputDisplay: "s1 = 'yolnoma', s2 = 'amonlyo'", args: ['yolnoma', 'amonlyo'], expected: true, isHidden: true },
      { id: 10, inputDisplay: "s1 = 'dastur', s2 = 'rustad'", args: ['dastur', 'rustad'], expected: true, isHidden: true }
    ]
  },
  {
    id: 'p14',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 4,
    title: "Takrorlanmagan birinchi belgi",
    slug: 'first-non-repeating',
    difficulty: "O'rta",
    points: 20,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` satrida faqat bitta marta qatnashgan birinchi belgini qaytaring. Agar barcha belgilar takrorlansa, bo'sh satr `''` qaytaring.",
    inputFormat: "Satr: s",
    outputFormat: "Belgi (string)",
    constraints: ["1 <= s.length <= 10^5"],
    examples: [
      { input: "s = 'leetcode'", output: "'l'" },
      { input: "s = 'loveleetcode'", output: "'v'" }
    ],
    starterCode: {
      javascript: `function first_unique_char(s) {\n  for (let ch of s) {\n    if (s.indexOf(ch) === s.lastIndexOf(ch)) return ch;\n  }\n  return '';\n}`,
      python: `def first_unique_char(s):\n    for ch in s:\n        if s.count(ch) == 1:\n            return ch\n    return ''`
    },
    functionName: 'first_unique_char',
    hint: "Satrda birinchi va oxirgi uchrash indeksi teng bo'lsa (indexOf === lastIndexOf), u faqat bir marta qatnashgan.",
    testCases: [
      { id: 1, inputDisplay: "s = 'leetcode'", args: ['leetcode'], expected: 'l' },
      { id: 2, inputDisplay: "s = 'loveleetcode'", args: ['loveleetcode'], expected: 'v' },
      { id: 3, inputDisplay: "s = 'aabb'", args: ['aabb'], expected: '' },
      { id: 4, inputDisplay: "s = 'x'", args: ['x'], expected: 'x' },
      { id: 5, inputDisplay: "s = 'abac'", args: ['abac'], expected: 'b' },
      { id: 6, inputDisplay: "s = 'salom'", args: ['salom'], expected: 's' },
      { id: 7, inputDisplay: "s = 'yolnoma'", args: ['yolnoma'], expected: 'y', isHidden: true },
      { id: 8, inputDisplay: "s = 'noon'", args: ['noon'], expected: '', isHidden: true },
      { id: 9, inputDisplay: "s = 'developer'", args: ['developer'], expected: 'v', isHidden: true },
      { id: 10, inputDisplay: "s = 'a1b1c'", args: ['a1b1c'], expected: 'a', isHidden: true }
    ]
  },
  {
    id: 'p15',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 5,
    title: "Har bir so'zni katta harf qilish",
    slug: 'capitalize-words',
    difficulty: "Oson",
    points: 20,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` jumlasidagi har bir so'zning birinchi harfini bosh harfga aylantiring. Masalan: 'salom dunyo' -> 'Salom Dunyo'.",
    inputFormat: "Satr: s",
    outputFormat: "Natijaviy satr",
    constraints: ["1 <= s.length <= 1000"],
    examples: [
      { input: "s = 'salom dunyo'", output: "'Salom Dunyo'" },
      { input: "s = 'yolnoma tez yozish'", output: "'Yolnoma Tez Yozish'" }
    ],
    starterCode: {
      javascript: `function capitalize(s) {\n  return s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : '').join(' ');\n}`,
      python: `def capitalize(s):\n    return ' '.join([w.capitalize() for w in s.split(' ')])`
    },
    functionName: 'capitalize',
    hint: "Satrni bo'sh joy bo'yicha ajratib, har bir so'zning birinchi harfini toUpperCase() qiling.",
    testCases: [
      { id: 1, inputDisplay: "s = 'salom dunyo'", args: ['salom dunyo'], expected: 'Salom Dunyo' },
      { id: 2, inputDisplay: "s = 'yolnoma tez yozish'", args: ['yolnoma tez yozish'], expected: 'Yolnoma Tez Yozish' },
      { id: 3, inputDisplay: "s = 'frontend'", args: ['frontend'], expected: 'Frontend' },
      { id: 4, inputDisplay: "s = 'a b c'", args: ['a b c'], expected: 'A B C' },
      { id: 5, inputDisplay: "s = 'dasturlash juda qiziq'", args: ['dasturlash juda qiziq'], expected: 'Dasturlash Juda Qiziq' },
      { id: 6, inputDisplay: "s = 'salom'", args: ['salom'], expected: 'Salom' },
      { id: 7, inputDisplay: "s = 'web dasturchi bo\\'laman'", args: ["web dasturchi bo'laman"], expected: "Web Dasturchi Bo'laman", isHidden: true },
      { id: 8, inputDisplay: "s = 'speed typing arena'", args: ['speed typing arena'], expected: 'Speed Typing Arena', isHidden: true },
      { id: 9, inputDisplay: "s = 'bir ikki uch'", args: ['bir ikki uch'], expected: 'Bir Ikki Uch', isHidden: true },
      { id: 10, inputDisplay: "s = 'ozbekiston kelajagi buyuk'", args: ['ozbekiston kelajagi buyuk'], expected: 'Ozbekiston Kelajagi Buyuk', isHidden: true }
    ]
  },
  {
    id: 'p16',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 6,
    title: "Ikki massiv kesishmasi",
    slug: 'array-intersection',
    difficulty: "O'rta",
    points: 20,
    category: 'Massivlar (Arrays)',
    description: "Ikkita sonlar massivi `arr1` va `arr2` berilgan. Ikkala massivda ham mavjud bo'lgan takrorlanmas elementlar massivini o'sish tartibida saralab qaytaring.",
    inputFormat: "Ikkita massiv: arr1 va arr2",
    outputFormat: "Saralangan kesishma massivi",
    constraints: ["0 <= arr1.length, arr2.length <= 1000"],
    examples: [
      { input: "arr1 = [1, 2, 2, 1], arr2 = [2, 2]", output: "[2]" },
      { input: "arr1 = [4, 9, 5], arr2 = [9, 4, 9, 8, 4]", output: "[4, 9]" }
    ],
    starterCode: {
      javascript: `function intersect(arr1, arr2) {\n  const s2 = new Set(arr2);\n  const res = Array.from(new Set(arr1.filter(x => s2.has(x))));\n  return res.sort((a, b) => a - b);\n}`,
      python: `def intersect(arr1, arr2):\n    res = list(set(arr1) & set(arr2))\n    return sorted(res)`
    },
    functionName: 'intersect',
    hint: "Set to'plamidan foydalanib, ikkala to'plamda bor qiymatlarni oling va saralang.",
    testCases: [
      { id: 1, inputDisplay: "arr1 = [1, 2, 2, 1], arr2 = [2, 2]", args: [[1, 2, 2, 1], [2, 2]], expected: [2] },
      { id: 2, inputDisplay: "arr1 = [4, 9, 5], arr2 = [9, 4, 9, 8, 4]", args: [[4, 9, 5], [9, 4, 9, 8, 4]], expected: [4, 9] },
      { id: 3, inputDisplay: "arr1 = [1, 2, 3], arr2 = [4, 5, 6]", args: [[1, 2, 3], [4, 5, 6]], expected: [] },
      { id: 4, inputDisplay: "arr1 = [1], arr2 = [1]", args: [[1], [1]], expected: [1] },
      { id: 5, inputDisplay: "arr1 = [], arr2 = [1, 2]", args: [[], [1, 2]], expected: [] },
      { id: 6, inputDisplay: "arr1 = [7, 5, 3], arr2 = [3, 5, 7]", args: [[7, 5, 3], [3, 5, 7]], expected: [3, 5, 7] },
      { id: 7, inputDisplay: "arr1 = [10, 20, 30], arr2 = [20, 40]", args: [[10, 20, 30], [20, 40]], expected: [20], isHidden: true },
      { id: 8, inputDisplay: "arr1 = [5, 5, 5], arr2 = [5, 5]", args: [[5, 5, 5], [5, 5]], expected: [5], isHidden: true },
      { id: 9, inputDisplay: "arr1 = [1, 3, 5, 7, 9], arr2 = [3, 6, 9]", args: [[1, 3, 5, 7, 9], [3, 6, 9]], expected: [3, 9], isHidden: true },
      { id: 10, inputDisplay: "arr1 = [-5, 0, 5], arr2 = [0, 10]", args: [[-5, 0, 5], [0, 10]], expected: [0], isHidden: true }
    ]
  },
  {
    id: 'p17',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 7,
    title: "FizzBuzz qatori",
    slug: 'fizz-buzz',
    difficulty: "Oson",
    points: 20,
    category: 'Mantiq',
    description: "1 dan `n` gacha sonlar uchun qoida bo'yicha massiv qaytaring: 3 ga bo'linsa 'Fizz', 5 ga bo'linsa 'Buzz', 3 va 5 ga bo'linsa 'FizzBuzz', aks holda sonning o'zi satr sifatida.",
    inputFormat: "Butun son: n (1 <= n <= 50)",
    outputFormat: "Satrlar massivi: string[]",
    constraints: ["1 <= n <= 50"],
    examples: [
      { input: "n = 5", output: "['1', '2', 'Fizz', '4', 'Buzz']" }
    ],
    starterCode: {
      javascript: `function fizz_buzz(n) {\n  const res = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) res.push('FizzBuzz');\n    else if (i % 3 === 0) res.push('Fizz');\n    else if (i % 5 === 0) res.push('Buzz');\n    else res.push(String(i));\n  }\n  return res;\n}`,
      python: `def fizz_buzz(n):\n    res = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            res.append('FizzBuzz')\n        elif i % 3 == 0:\n            res.append('Fizz')\n        elif i % 5 == 0:\n            res.append('Buzz')\n        else:\n            res.append(str(i))\n    return res`
    },
    functionName: 'fizz_buzz',
    hint: "Avval 15 ga (3 va 5 ga) bo'linishini tekshiring, so'ngra 3 va 5 ga.",
    testCases: [
      { id: 1, inputDisplay: "n = 5", args: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      { id: 2, inputDisplay: "n = 1", args: [1], expected: ['1'] },
      { id: 3, inputDisplay: "n = 3", args: [3], expected: ['1', '2', 'Fizz'] },
      { id: 4, inputDisplay: "n = 6", args: [6], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz'] },
      { id: 5, inputDisplay: "n = 10", args: [10], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz'] },
      { id: 6, inputDisplay: "n = 15", args: [15], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] },
      { id: 7, inputDisplay: "n = 8", args: [8], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8'], isHidden: true },
      { id: 8, inputDisplay: "n = 16", args: [16], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz', '16'], isHidden: true },
      { id: 9, inputDisplay: "n = 2", args: [2], expected: ['1', '2'], isHidden: true },
      { id: 10, inputDisplay: "n = 20", args: [20], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz', '16', '17', 'Fizz', '19', 'Buzz'], isHidden: true }
    ]
  },
  {
    id: 'p18',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 8,
    title: "Ikkinchi eng katta son",
    slug: 'second-largest',
    difficulty: "O'rta",
    points: 20,
    category: 'Massivlar (Arrays)',
    description: "Berilgan `nums` massividagi takrorlanmas qiymatlar orasidan ikkinchi eng katta sonni qaytaring.",
    inputFormat: "Kamida 2 ta turli sonli massiv: nums",
    outputFormat: "Ikkinchi eng katta son",
    constraints: ["2 <= nums.length <= 1000"],
    examples: [
      { input: "nums = [10, 5, 20, 8]", output: "10" },
      { input: "nums = [1, 2, 2]", output: "1" }
    ],
    starterCode: {
      javascript: `function second_largest(nums) {\n  const unique = Array.from(new Set(nums)).sort((a, b) => b - a);\n  return unique[1];\n}`,
      python: `def second_largest(nums):\n    unique = sorted(list(set(nums)), reverse=True)\n    return unique[1]`
    },
    functionName: 'second_largest',
    hint: "Massivdan takrorlanganlarni olib tashlab, kamayish tartibida saralang va 1-indeksni oling.",
    testCases: [
      { id: 1, inputDisplay: "nums = [10, 5, 20, 8]", args: [[10, 5, 20, 8]], expected: 10 },
      { id: 2, inputDisplay: "nums = [1, 2, 2]", args: [[1, 2, 2]], expected: 1 },
      { id: 3, inputDisplay: "nums = [-5, -2, -10]", args: [[-5, -2, -10]], expected: -5 },
      { id: 4, inputDisplay: "nums = [100, 200]", args: [[100, 200]], expected: 100 },
      { id: 5, inputDisplay: "nums = [3, 1, 4, 1, 5, 9, 2, 6]", args: [[3, 1, 4, 1, 5, 9, 2, 6]], expected: 6 },
      { id: 6, inputDisplay: "nums = [50, 50, 40, 30]", args: [[50, 50, 40, 30]], expected: 40 },
      { id: 7, inputDisplay: "nums = [0, -1, 1]", args: [[0, -1, 1]], expected: 0, isHidden: true },
      { id: 8, inputDisplay: "nums = [777, 888, 999]", args: [[777, 888, 999]], expected: 888, isHidden: true },
      { id: 9, inputDisplay: "nums = [12, 34, 56, 78, 90]", args: [[12, 34, 56, 78, 90]], expected: 78, isHidden: true },
      { id: 10, inputDisplay: "nums = [5, 2, 8, 9, 1]", args: [[5, 2, 8, 9, 1]], expected: 8, isHidden: true }
    ]
  },
  {
    id: 'p19',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 9,
    title: "Matndagi so'zlar soni",
    slug: 'count-words',
    difficulty: "Oson",
    points: 20,
    category: 'Satrlar (Strings)',
    description: "Berilgan `s` jumlasidagi so'zlar sonini hisoblang. Ortiqcha bo'sh joylar (spaces) inobatga olinmasin.",
    inputFormat: "Satr: s",
    outputFormat: "So'zlar soni (butun son)",
    constraints: ["0 <= s.length <= 10000"],
    examples: [
      { input: "s = 'Salom, qandaysiz?'", output: "2" },
      { input: "s = '   '", output: "0" }
    ],
    starterCode: {
      javascript: `function count_words(s) {\n  const trimmed = s.trim();\n  if (!trimmed) return 0;\n  return trimmed.split(/\\s+/).length;\n}`,
      python: `def count_words(s):\n    words = s.strip().split()\n    return len(words)`
    },
    functionName: 'count_words',
    hint: "Satrni trim qiling va bir yoki bir nechta bo'sh joy bo'yicha ajrating.",
    testCases: [
      { id: 1, inputDisplay: "s = 'Salom, qandaysiz?'", args: ['Salom, qandaysiz?'], expected: 2 },
      { id: 2, inputDisplay: "s = '   '", args: ['   '], expected: 0 },
      { id: 3, inputDisplay: "s = ''", args: [''], expected: 0 },
      { id: 4, inputDisplay: "s = 'Yolnoma'", args: ['Yolnoma'], expected: 1 },
      { id: 5, inputDisplay: "s = 'Frontend va Backend dasturchi'", args: ['Frontend va Backend dasturchi'], expected: 4 },
      { id: 6, inputDisplay: "s = ' Bir   ikki   uch '", args: [' Bir   ikki   uch '], expected: 3 },
      { id: 7, inputDisplay: "s = 'Test 1 2 3'", args: ['Test 1 2 3'], expected: 4, isHidden: true },
      { id: 8, inputDisplay: "s = 'A B C D E'", args: ['A B C D E'], expected: 5, isHidden: true },
      { id: 9, inputDisplay: "s = 'Klaviatura tezligini oshirish arenasi'", args: ['Klaviatura tezligini oshirish arenasi'], expected: 4, isHidden: true },
      { id: 10, inputDisplay: "s = 'BirinchiIkkinchiUchinchi'", args: ['BirinchiIkkinchiUchinchi'], expected: 1, isHidden: true }
    ]
  },
  {
    id: 'p20',
    stage: 2,
    stageName: "2-Bosqich: Shartlar va Sikllar",
    number: 10,
    title: "To'g'ri qavslar ketma-ketligi",
    slug: 'valid-parentheses',
    difficulty: "O'rta",
    points: 20,
    category: 'Stack / Tuzilmalar',
    description: "Faqat '(', ')', '{', '}', '[', ']' belgilaridan iborat `s` satri berilgan. Qavslar to'g'ri ochilib yopilgan bo'lsa `true`, aks holda `false` qaytaring.",
    inputFormat: "Satr: s",
    outputFormat: "boolean (true / false)",
    constraints: ["0 <= s.length <= 1000"],
    examples: [
      { input: "s = '()[]{}'", output: "true" },
      { input: "s = '(]'", output: "false" }
    ],
    starterCode: {
      javascript: `function is_valid_parentheses(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let ch of s) {\n    if (ch === '(' || ch === '{' || ch === '[') {\n      stack.push(ch);\n    } else {\n      if (stack.pop() !== pairs[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def is_valid_parentheses(s):\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for ch in s:\n        if ch in '({[':\n            stack.append(ch)\n        else:\n            if not stack or stack.pop() != pairs.get(ch):\n                return False\n    return len(stack) == 0`
    },
    functionName: 'is_valid_parentheses',
    hint: "Stack ma'lumotlar tuzilmasidan foydalanib, ochuvchi qavslarni yig'ib boring va yopuvchisiga tekshiring.",
    testCases: [
      { id: 1, inputDisplay: "s = '()[]{}'", args: ['()[]{}'], expected: true },
      { id: 2, inputDisplay: "s = '(]'", args: ['(]'], expected: false },
      { id: 3, inputDisplay: "s = '()'", args: ['()'], expected: true },
      { id: 4, inputDisplay: "s = '([)]'", args: ['([)]'], expected: false },
      { id: 5, inputDisplay: "s = '{[]}'", args: ['{[]}'], expected: true },
      { id: 6, inputDisplay: "s = ''", args: [''], expected: true },
      { id: 7, inputDisplay: "s = '('", args: ['('], expected: false, isHidden: true },
      { id: 8, inputDisplay: "s = ')'", args: [')'], expected: false, isHidden: true },
      { id: 9, inputDisplay: "s = '((()))'", args: ['((()))'], expected: true, isHidden: true },
      { id: 10, inputDisplay: "s = '{[()()]}'", args: ['{[()()]}'], expected: true, isHidden: true }
    ]
  },

  // ==========================================
  // BOSQICH 3: MURAKKAB ALGORITMLAR (10 TA MASALA)
  // ==========================================
  {
    id: 'p21',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 1,
    title: "Two Sum: Yig'indi indekslari",
    slug: 'two-sum-indices',
    difficulty: "Qiyin",
    points: 30,
    category: 'Xesh-jadval / Qidiruv',
    description: "Butun sonlar massivi `nums` va butun son `target` berilgan. Yig'indisi `target` ga teng bo'lgan ikkita sonning indekslarini `[index1, index2]` ko'rinishida qaytaring.",
    inputFormat: "nums massivi va target soni",
    outputFormat: "Ikkita indeks massivi [i, j]",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i], target <= 10^9"],
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" }
    ],
    starterCode: {
      javascript: `function two_sum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def two_sum(nums, target):\n    seen = {}\n    for i in range(len(nums)):\n        diff = target - nums[i]\n        if diff in seen:\n            return [seen[diff], i]\n        seen[nums[i]] = i\n    return []`
    },
    functionName: 'two_sum',
    hint: "O(N) vaqtda ishlashi uchun xesh-jadval (Map yoki lug'at) dan foydalaning.",
    testCases: [
      { id: 1, inputDisplay: "nums = [2, 7, 11, 15], target = 9", args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { id: 2, inputDisplay: "nums = [3, 2, 4], target = 6", args: [[3, 2, 4], 6], expected: [1, 2] },
      { id: 3, inputDisplay: "nums = [3, 3], target = 6", args: [[3, 3], 6], expected: [0, 1] },
      { id: 4, inputDisplay: "nums = [1, 5, 8, 3], target = 13", args: [[1, 5, 8, 3], 13], expected: [1, 2] },
      { id: 5, inputDisplay: "nums = [-3, 4, 3, 90], target = 0", args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
      { id: 6, inputDisplay: "nums = [10, 20, 30, 40], target = 50", args: [[10, 20, 30, 40], 50], expected: [0, 3] },
      { id: 7, inputDisplay: "nums = [1, 2, 3, 4, 5], target = 9", args: [[1, 2, 3, 4, 5], 9], expected: [3, 4], isHidden: true },
      { id: 8, inputDisplay: "nums = [100, -50, 20, 30], target = 50", args: [[100, -50, 20, 30], 50], expected: [0, 1], isHidden: true },
      { id: 9, inputDisplay: "nums = [0, 4, 3, 0], target = 0", args: [[0, 4, 3, 0], 0], expected: [0, 3], isHidden: true },
      { id: 10, inputDisplay: "nums = [5, 75, 25], target = 100", args: [[5, 75, 25], 100], expected: [1, 2], isHidden: true }
    ]
  },
  {
    id: 'p22',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 2,
    title: "Massivni K qadamga o'ngga siljitish",
    slug: 'rotate-array',
    difficulty: "O'rta",
    points: 30,
    category: 'Massivlar (Arrays)',
    description: "Berilgan `nums` massivini `k` qadamga o'ngga siklik siljiting va yangi massivni qaytaring.",
    inputFormat: "nums massivi va k butun soni",
    outputFormat: "Siljitilgan massiv",
    constraints: ["1 <= nums.length <= 10^5", "0 <= k <= 10^5"],
    examples: [
      { input: "nums = [1, 2, 3, 4, 5], k = 2", output: "[4, 5, 1, 2, 3]" },
      { input: "nums = [1, 2], k = 3", output: "[2, 1]" }
    ],
    starterCode: {
      javascript: `function rotate(nums, k) {\n  const step = k % nums.length;\n  if (step === 0) return nums;\n  return nums.slice(-step).concat(nums.slice(0, nums.length - step));\n}`,
      python: `def rotate(nums, k):\n    step = k % len(nums)\n    if step == 0:\n        return nums\n    return nums[-step:] + nums[:-step]`
    },
    functionName: 'rotate',
    hint: "k = k % nums.length qilib, oxirgi k ta elementni boshiga o'tkazing.",
    testCases: [
      { id: 1, inputDisplay: "nums = [1, 2, 3, 4, 5], k = 2", args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
      { id: 2, inputDisplay: "nums = [1, 2], k = 3", args: [[1, 2], 3], expected: [2, 1] },
      { id: 3, inputDisplay: "nums = [1, 2, 3], k = 0", args: [[1, 2, 3], 0], expected: [1, 2, 3] },
      { id: 4, inputDisplay: "nums = [10, 20, 30], k = 1", args: [[10, 20, 30], 1], expected: [30, 10, 20] },
      { id: 5, inputDisplay: "nums = [5], k = 10", args: [[5], 10], expected: [5] },
      { id: 6, inputDisplay: "nums = [1, 2, 3, 4], k = 4", args: [[1, 2, 3, 4], 4], expected: [1, 2, 3, 4] },
      { id: 7, inputDisplay: "nums = [9, 8, 7, 6], k = 2", args: [[9, 8, 7, 6], 2], expected: [7, 6, 9, 8], isHidden: true },
      { id: 8, inputDisplay: "nums = [1, 2, 3, 4, 5, 6], k = 3", args: [[1, 2, 3, 4, 5, 6], 3], expected: [4, 5, 6, 1, 2, 3], isHidden: true },
      { id: 9, inputDisplay: "nums = [0, 1], k = 5", args: [[0, 1], 5], expected: [1, 0], isHidden: true },
      { id: 10, inputDisplay: "nums = [10, 20, 30, 40, 50], k = 7", args: [[10, 20, 30, 40, 50], 7], expected: [40, 50, 10, 20, 30], isHidden: true }
    ]
  },
  {
    id: 'p23',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 3,
    title: "Takrorlanganlarni olib tashlash",
    slug: 'remove-duplicates',
    difficulty: "Oson",
    points: 30,
    category: 'Massivlar (Arrays)',
    description: "Berilgan `nums` massividagi barcha dublikat (takrorlangan) elementlarni olib tashlab, elementlar tartibini saqlagan holda unikal massivni qaytaring.",
    inputFormat: "Massiv: nums",
    outputFormat: "Unikal massiv",
    constraints: ["0 <= nums.length <= 10^5"],
    examples: [
      { input: "nums = [1, 2, 2, 3, 4, 4, 5]", output: "[1, 2, 3, 4, 5]" },
      { input: "nums = [5, 5, 5]", output: "[5]" }
    ],
    starterCode: {
      javascript: `function unique(nums) {\n  return Array.from(new Set(nums));\n}`,
      python: `def unique(nums):\n    return list(dict.fromkeys(nums))`
    },
    functionName: 'unique',
    hint: "Set to'plami yoki lug'at kalitlaridan foydalanib tartibni saqlang.",
    testCases: [
      { id: 1, inputDisplay: "nums = [1, 2, 2, 3, 4, 4, 5]", args: [[1, 2, 2, 3, 4, 4, 5]], expected: [1, 2, 3, 4, 5] },
      { id: 2, inputDisplay: "nums = [5, 5, 5]", args: [[5, 5, 5]], expected: [5] },
      { id: 3, inputDisplay: "nums = []", args: [[]], expected: [] },
      { id: 4, inputDisplay: "nums = [1, 2, 3]", args: [[1, 2, 3]], expected: [1, 2, 3] },
      { id: 5, inputDisplay: "nums = [10, 20, 10, 30, 20]", args: [[10, 20, 10, 30, 20]], expected: [10, 20, 30] },
      { id: 6, inputDisplay: "nums = [-1, -1, 0, 1]", args: [[-1, -1, 0, 1]], expected: [-1, 0, 1] },
      { id: 7, inputDisplay: "nums = [4, 4, 2, 2, 1, 1]", args: [[4, 4, 2, 2, 1, 1]], expected: [4, 2, 1], isHidden: true },
      { id: 8, inputDisplay: "nums = [100]", args: [[100]], expected: [100], isHidden: true },
      { id: 9, inputDisplay: "nums = [9, 8, 9, 8, 7]", args: [[9, 8, 9, 8, 7]], expected: [9, 8, 7], isHidden: true },
      { id: 10, inputDisplay: "nums = [3, 3, 3, 2, 2, 1]", args: [[3, 3, 3, 2, 2, 1]], expected: [3, 2, 1], isHidden: true }
    ]
  },
  {
    id: 'p24',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 4,
    title: "Qatorni siqish (Run-Length Encoding)",
    slug: 'string-compression',
    difficulty: "O'rta",
    points: 30,
    category: 'Satrlar (Strings)',
    description: "Ketma-ket kelgan takroriy harflarni harf va uning soni bilan almashtirib siqing. Masalan: 'aabcccccaaa' -> 'a2b1c5a3'. Bo'sh satr bo'lsa '' qaytaring.",
    inputFormat: "Satr: s",
    outputFormat: "Siqilgan satr",
    constraints: ["0 <= s.length <= 10^4"],
    examples: [
      { input: "s = 'aabcccccaaa'", output: "'a2b1c5a3'" },
      { input: "s = 'abcd'", output: "'a1b1c1d1'" }
    ],
    starterCode: {
      javascript: `function compress(s) {\n  if (!s) return '';\n  let res = '', count = 1;\n  for (let i = 1; i <= s.length; i++) {\n    if (i < s.length && s[i] === s[i - 1]) {\n      count++;\n    } else {\n      res += s[i - 1] + count;\n      count = 1;\n    }\n  }\n  return res;\n}`,
      python: `def compress(s):\n    if not s:\n        return ''\n    res = ''\n    count = 1\n    for i in range(1, len(s) + 1):\n        if i < len(s) and s[i] == s[i - 1]:\n            count += 1\n        else:\n            res += s[i - 1] + str(count)\n            count = 1\n    return res`
    },
    functionName: 'compress',
    hint: "Bitta hisoblagich bilan ketma-ket bir xil harflarni sanab boring va o'zgarganda natijaga qo'shing.",
    testCases: [
      { id: 1, inputDisplay: "s = 'aabcccccaaa'", args: ['aabcccccaaa'], expected: 'a2b1c5a3' },
      { id: 2, inputDisplay: "s = 'abcd'", args: ['abcd'], expected: 'a1b1c1d1' },
      { id: 3, inputDisplay: "s = ''", args: [''], expected: '' },
      { id: 4, inputDisplay: "s = 'a'", args: ['a'], expected: 'a1' },
      { id: 5, inputDisplay: "s = 'aaaaa'", args: ['aaaaa'], expected: 'a5' },
      { id: 6, inputDisplay: "s = 'aabbcc'", args: ['aabbcc'], expected: 'a2b2c2' },
      { id: 7, inputDisplay: "s = 'zzzzzyy'", args: ['zzzzzyy'], expected: 'z5y2', isHidden: true },
      { id: 8, inputDisplay: "s = 'qwert'", args: ['qwert'], expected: 'q1w1e1r1t1', isHidden: true },
      { id: 9, inputDisplay: "s = 'aaabbbaaa'", args: ['aaabbbaaa'], expected: 'a3b3a3', isHidden: true },
      { id: 10, inputDisplay: "s = '111223'", args: ['111223'], expected: '132231', isHidden: true }
    ]
  },
  {
    id: 'p25',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 5,
    title: "Ikki saralangan massivni birlashtirish",
    slug: 'merge-sorted-arrays',
    difficulty: "O'rta",
    points: 30,
    category: 'Saralash (Sorting)',
    description: "Ikkita o'sish tartibida saralangan `arr1` va `arr2` massivlarini birlashtirib, bitta o'sish tartibidagi massiv qaytaring.",
    inputFormat: "Ikkita saralangan massiv: arr1 va arr2",
    outputFormat: "Birlashtirilgan saralangan massiv",
    constraints: ["0 <= arr1.length, arr2.length <= 10^4"],
    examples: [
      { input: "arr1 = [1, 3, 5], arr2 = [2, 4, 6]", output: "[1, 2, 3, 4, 5, 6]" },
      { input: "arr1 = [], arr2 = [1, 2]", output: "[1, 2]" }
    ],
    starterCode: {
      javascript: `function merge_sorted(arr1, arr2) {\n  return [...arr1, ...arr2].sort((a, b) => a - b);\n}`,
      python: `def merge_sorted(arr1, arr2):\n    return sorted(arr1 + arr2)`
    },
    functionName: 'merge_sorted',
    hint: "Ikkala massivni birlashtirib saralashingiz yoki two-pointer usulidan foydalanishingiz mumkin.",
    testCases: [
      { id: 1, inputDisplay: "arr1 = [1, 3, 5], arr2 = [2, 4, 6]", args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { id: 2, inputDisplay: "arr1 = [], arr2 = [1, 2]", args: [[], [1, 2]], expected: [1, 2] },
      { id: 3, inputDisplay: "arr1 = [5, 10], arr2 = []", args: [[5, 10], []], expected: [5, 10] },
      { id: 4, inputDisplay: "arr1 = [1, 2, 3], arr2 = [4, 5, 6]", args: [[1, 2, 3], [4, 5, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { id: 5, inputDisplay: "arr1 = [2], arr2 = [1]", args: [[2], [1]], expected: [1, 2] },
      { id: 6, inputDisplay: "arr1 = [0, 10], arr2 = [-5, 5, 15]", args: [[0, 10], [-5, 5, 15]], expected: [-5, 0, 5, 10, 15] },
      { id: 7, inputDisplay: "arr1 = [1, 1], arr2 = [1, 1]", args: [[1, 1], [1, 1]], expected: [1, 1, 1, 1], isHidden: true },
      { id: 8, inputDisplay: "arr1 = [100], arr2 = [50, 75]", args: [[100], [50, 75]], expected: [50, 75, 100], isHidden: true },
      { id: 9, inputDisplay: "arr1 = [-10, -5], arr2 = [-7, 0]", args: [[-10, -5], [-7, 0]], expected: [-10, -7, -5, 0], isHidden: true },
      { id: 10, inputDisplay: "arr1 = [2, 4, 8, 16], arr2 = [1, 3, 9]", args: [[2, 4, 8, 16], [1, 3, 9]], expected: [1, 2, 3, 4, 8, 9, 16], isHidden: true }
    ]
  },
  {
    id: 'p26',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 6,
    title: "Eng katta qism-massiv yig'indisi (Kadane)",
    slug: 'max-subarray-sum',
    difficulty: "Qiyin",
    points: 30,
    category: 'Dinamik Dasturlash',
    description: "Berilgan `nums` butun sonlar massivida qo'shni elementlardan iborat qism-massivlar orasida eng katta yig'indini toping (Kadane algoritmi).",
    inputFormat: "Sonlar massivi: nums",
    outputFormat: "Eng katta yig'indi (butun son)",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", explanation: "[4, -1, 2, 1] yig'indisi = 6" },
      { input: "nums = [1]", output: "1" }
    ],
    starterCode: {
      javascript: `function max_sub_array(nums) {\n  let maxSoFar = nums[0];\n  let current = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);\n    maxSoFar = Math.max(maxSoFar, current);\n  }\n  return maxSoFar;\n}`,
      python: `def max_sub_array(nums):\n    max_so_far = nums[0]\n    current = nums[0]\n    for i in range(1, len(nums)):\n        current = max(nums[i], current + nums[i])\n        max_so_far = max(max_so_far, current)\n    return max_so_far`
    },
    functionName: 'max_sub_array',
    hint: "Har bir qadamda yangi elementdan boshlash yaxshiroqmi yoki joriysiga qo'shishmi: `Math.max(x, current + x)`.",
    testCases: [
      { id: 1, inputDisplay: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { id: 2, inputDisplay: "nums = [1]", args: [[1]], expected: 1 },
      { id: 3, inputDisplay: "nums = [5, 4, -1, 7, 8]", args: [[5, 4, -1, 7, 8]], expected: 23 },
      { id: 4, inputDisplay: "nums = [-1, -2, -3]", args: [[-1, -2, -3]], expected: -1 },
      { id: 5, inputDisplay: "nums = [0, 0, 0]", args: [[0, 0, 0]], expected: 0 },
      { id: 6, inputDisplay: "nums = [-2, -1]", args: [[-2, -1]], expected: -1 },
      { id: 7, inputDisplay: "nums = [1, 2, 3, 4, 5]", args: [[1, 2, 3, 4, 5]], expected: 15, isHidden: true },
      { id: 8, inputDisplay: "nums = [10, -2, 3, -1, 5]", args: [[10, -2, 3, -1, 5]], expected: 15, isHidden: true },
      { id: 9, inputDisplay: "nums = [-3, 2, -1, 4, -2]", args: [[-3, 2, -1, 4, -2]], expected: 5, isHidden: true },
      { id: 10, inputDisplay: "nums = [2, -1, 2, 3, 4, -5]", args: [[2, -1, 2, 3, 4, -5]], expected: 10, isHidden: true }
    ]
  },
  {
    id: 'p27',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 7,
    title: "Eng uzun umumiy prefiks",
    slug: 'longest-common-prefix',
    difficulty: "O'rta",
    points: 30,
    category: 'Satrlar (Strings)',
    description: "Satrlar massivida barcha satrlar uchun eng uzun umumiy prefiks (boshlang'ich qism)ni toping. Agar umumiy prefiks bo'lmasa, bo'sh satr `''` qaytaring.",
    inputFormat: "Satrlar massivi: strs",
    outputFormat: "Umumiy prefiks satri",
    constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200"],
    examples: [
      { input: "strs = ['flower', 'flow', 'flight']", output: "'fl'" },
      { input: "strs = ['dog', 'racecar', 'car']", output: "''" }
    ],
    starterCode: {
      javascript: `function longest_prefix(strs) {\n  if (!strs || strs.length === 0) return '';\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (!strs[i].startsWith(prefix)) {\n      prefix = prefix.slice(0, -1);\n      if (!prefix) return '';\n    }\n  }\n  return prefix;\n}`,
      python: `def longest_prefix(strs):\n    if not strs:\n        return ''\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix:\n                return ''\n    return prefix`
    },
    functionName: 'longest_prefix',
    hint: "Birinchi so'zni prefiks deb oling va boshqa so'zlarda to'liq mos kelgunicha oxiridan harf qisqartirib boring.",
    testCases: [
      { id: 1, inputDisplay: "strs = ['flower', 'flow', 'flight']", args: [['flower', 'flow', 'flight']], expected: 'fl' },
      { id: 2, inputDisplay: "strs = ['dog', 'racecar', 'car']", args: [['dog', 'racecar', 'car']], expected: '' },
      { id: 3, inputDisplay: "strs = ['interspecies', 'interstellar', 'interstate']", args: [['interspecies', 'interstellar', 'interstate']], expected: 'inters' },
      { id: 4, inputDisplay: "strs = ['throne', 'throne']", args: [['throne', 'throne']], expected: 'throne' },
      { id: 5, inputDisplay: "strs = ['a']", args: [['a']], expected: 'a' },
      { id: 6, inputDisplay: "strs = ['', 'b']", args: [['', 'b']], expected: '' },
      { id: 7, inputDisplay: "strs = ['yolnoma', 'yolchi', 'yol']", args: [['yolnoma', 'yolchi', 'yol']], expected: 'yol', isHidden: true },
      { id: 8, inputDisplay: "strs = ['ab', 'a']", args: [['ab', 'a']], expected: 'a', isHidden: true },
      { id: 9, inputDisplay: "strs = ['cir', 'car']", args: [['cir', 'car']], expected: 'c', isHidden: true },
      { id: 10, inputDisplay: "strs = ['code', 'coder', 'coding']", args: [['code', 'coder', 'coding']], expected: 'cod', isHidden: true }
    ]
  },
  {
    id: 'p28',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 8,
    title: "Yo'qolgan sonni topish (0 dan N gacha)",
    slug: 'missing-number',
    difficulty: "Oson",
    points: 30,
    category: 'Matematika / Massivlar',
    description: "`0` dan `n` gacha bo'lgan `n` ta son berilgan massivda bitta son tushib qolgan. Shu yetishmayotgan sonni aniqlab qaytaring.",
    inputFormat: "nums massivi",
    outputFormat: "Yo'qolgan son (butun son)",
    constraints: ["n == nums.length", "1 <= n <= 10^4"],
    examples: [
      { input: "nums = [3, 0, 1]", output: "2", explanation: "0 dan 3 gacha sonlar: 0, 1, 2, 3. 2 tushib qolgan." },
      { input: "nums = [0, 1]", output: "2" }
    ],
    starterCode: {
      javascript: `function missing_number(nums) {\n  const n = nums.length;\n  const expectedSum = (n * (n + 1)) / 2;\n  const actualSum = nums.reduce((a, b) => a + b, 0);\n  return expectedSum - actualSum;\n}`,
      python: `def missing_number(nums):\n    n = len(nums)\n    expected_sum = (n * (n + 1)) // 2\n    return expected_sum - sum(nums)`
    },
    functionName: 'missing_number',
    hint: "Gauss formulasidan foydalaning: 0 dan n gacha sonlar yig'indisi n*(n+1)/2 ga teng. Undan mavjud sonlar yig'indisini ayiring.",
    testCases: [
      { id: 1, inputDisplay: "nums = [3, 0, 1]", args: [[3, 0, 1]], expected: 2 },
      { id: 2, inputDisplay: "nums = [0, 1]", args: [[0, 1]], expected: 2 },
      { id: 3, inputDisplay: "nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]", args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { id: 4, inputDisplay: "nums = [0]", args: [[0]], expected: 1 },
      { id: 5, inputDisplay: "nums = [1]", args: [[1]], expected: 0 },
      { id: 6, inputDisplay: "nums = [1, 2]", args: [[1, 2]], expected: 0 },
      { id: 7, inputDisplay: "nums = [0, 2, 3]", args: [[0, 2, 3]], expected: 1, isHidden: true },
      { id: 8, inputDisplay: "nums = [5, 3, 1, 2, 0]", args: [[5, 3, 1, 2, 0]], expected: 4, isHidden: true },
      { id: 9, inputDisplay: "nums = [0, 1, 2, 3, 5]", args: [[0, 1, 2, 3, 5]], expected: 4, isHidden: true },
      { id: 10, inputDisplay: "nums = [6, 4, 2, 1, 3, 5]", args: [[6, 4, 2, 1, 3, 5]], expected: 0, isHidden: true }
    ]
  },
  {
    id: 'p29',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 9,
    title: "To'g'ri IPv4 manzilini tekshirish",
    slug: 'valid-ip',
    difficulty: "Qiyin",
    points: 30,
    category: 'Satrlar / Tarmoq',
    description: "Berilgan `ip` satri to'g'ri IPv4 manzili ekanligini tekshiring. Qoidalar: nuqta bilan ajratilgan 4 ta qism bo'lishi kerak; har bir qism 0 dan 255 gacha butun son bo'lishi kerak; noldan boshlangan sonlar (masalan, '01', '00') ruxsat etilmaydi (faqat '0' o'zi bo'lishi mumkin).",
    inputFormat: "Satr: ip",
    outputFormat: "boolean (true / false)",
    constraints: ["1 <= ip.length <= 50"],
    examples: [
      { input: "ip = '192.168.1.1'", output: "true" },
      { input: "ip = '256.100.0.1'", output: "false" },
      { input: "ip = '192.168.01.1'", output: "false" }
    ],
    starterCode: {
      javascript: `function is_valid_ip(ip) {\n  const parts = ip.split('.');\n  if (parts.length !== 4) return false;\n  for (let p of parts) {\n    if (!/^\\d+$/.test(p)) return false;\n    if (p.length > 1 && p[0] === '0') return false;\n    const num = Number(p);\n    if (num < 0 || num > 255) return false;\n  }\n  return true;\n}`,
      python: `def is_valid_ip(ip):\n    parts = ip.split('.')\n    if len(parts) != 4:\n        return False\n    for p in parts:\n        if not p.isdigit():\n            return False\n        if len(p) > 1 and p[0] == '0':\n            return False\n        num = int(p)\n        if num < 0 or num > 255:\n            return False\n    return True`
    },
    functionName: 'is_valid_ip',
    hint: "Nuqta bo'yicha 4 ta bo'lakka ajrating, har bir bo'lak son ekanligini, 0-255 oralig'idaligini va yetakchi 0 yo'qligini tekshiring.",
    testCases: [
      { id: 1, inputDisplay: "ip = '192.168.1.1'", args: ['192.168.1.1'], expected: true },
      { id: 2, inputDisplay: "ip = '256.100.0.1'", args: ['256.100.0.1'], expected: false },
      { id: 3, inputDisplay: "ip = '192.168.01.1'", args: ['192.168.01.1'], expected: false },
      { id: 4, inputDisplay: "ip = '0.0.0.0'", args: ['0.0.0.0'], expected: true },
      { id: 5, inputDisplay: "ip = '255.255.255.255'", args: ['255.255.255.255'], expected: true },
      { id: 6, inputDisplay: "ip = '192.168.1'", args: ['192.168.1'], expected: false },
      { id: 7, inputDisplay: "ip = '192.168.1.1.1'", args: ['192.168.1.1.1'], expected: false, isHidden: true },
      { id: 8, inputDisplay: "ip = '127.0.0.1'", args: ['127.0.0.1'], expected: true, isHidden: true },
      { id: 9, inputDisplay: "ip = 'abc.def.gha.bcd'", args: ['abc.def.gha.bcd'], expected: false, isHidden: true },
      { id: 10, inputDisplay: "ip = '10.0.0.1'", args: ['10.0.0.1'], expected: true, isHidden: true }
    ]
  },
  {
    id: 'p30',
    stage: 3,
    stageName: "3-Bosqich: Murakkab Algoritmlar",
    number: 10,
    title: "Ikki darajasi ekanligini tekshirish",
    slug: 'power-of-two',
    difficulty: "Oson",
    points: 30,
    category: 'Bit amallari (Bitwise)',
    description: "Berilgan `n` butun soni 2 ning biror darajasi (masalan: 1, 2, 4, 8, 16, ...) bo'lsa `true`, aks holda `false` qaytaring.",
    inputFormat: "Butun son: n",
    outputFormat: "boolean (true / false)",
    constraints: ["-2^31 <= n <= 2^31 - 1"],
    examples: [
      { input: "n = 16", output: "true", explanation: "2^4 = 16" },
      { input: "n = 3", output: "false" }
    ],
    starterCode: {
      javascript: `function is_power_of_two(n) {\n  if (n <= 0) return false;\n  return (n & (n - 1)) === 0;\n}`,
      python: `def is_power_of_two(n):\n    if n <= 0:\n        return False\n    return (n & (n - 1)) == 0`
    },
    functionName: 'is_power_of_two',
    hint: "Bit amali: agar n > 0 bo'lsa, `(n & (n - 1)) === 0` ifodasi 2 ning darajasi uchun har doim rost bo'ladi.",
    testCases: [
      { id: 1, inputDisplay: "n = 16", args: [16], expected: true },
      { id: 2, inputDisplay: "n = 3", args: [3], expected: false },
      { id: 3, inputDisplay: "n = 1", args: [1], expected: true },
      { id: 4, inputDisplay: "n = 4", args: [4], expected: true },
      { id: 5, inputDisplay: "n = 0", args: [0], expected: false },
      { id: 6, inputDisplay: "n = -16", args: [-16], expected: false },
      { id: 7, inputDisplay: "n = 64", args: [64], expected: true, isHidden: true },
      { id: 8, inputDisplay: "n = 100", args: [100], expected: false, isHidden: true },
      { id: 9, inputDisplay: "n = 1024", args: [1024], expected: true, isHidden: true },
      { id: 10, inputDisplay: "n = 218", args: [218], expected: false, isHidden: true }
    ]
  }
];
