export type CodeLanguage = 'javascript' | 'python' | 'html_css' | 'cpp_go';

export interface CodeSnippetItem {
  id: string;
  language: CodeLanguage;
  title: string;
  code: string;
  description: string;
}

export const CODE_SNIPPETS: CodeSnippetItem[] = [
  // JavaScript / TypeScript
  {
    id: 'js-1',
    language: 'javascript',
    title: 'Array Filter and Map',
    code: 'const activeUsers = users.filter(u => u.isActive && u.score > 50).map(u => ({ id: u.id, name: u.name }));',
    description: 'Zamonaviy massiv filtrlash va obyektga o\'zgartirish'
  },
  {
    id: 'js-2',
    language: 'javascript',
    title: 'Async Fetch with Error Handling',
    code: 'async function fetchUserData(userId) { try { const res = await fetch(`/api/users/${userId}`); return await res.json(); } catch (err) { console.error("Xatolik:", err); } }',
    description: 'Asinxron tarmoq so\'rovi va xatoliklarni ushlash'
  },
  {
    id: 'js-3',
    language: 'javascript',
    title: 'TypeScript Interface & Generic Function',
    code: 'interface Result<T> { data: T; status: number; success: boolean; } const parseResponse = <T>(payload: string): Result<T> => JSON.parse(payload);',
    description: 'TypeScript generic funksiya va interfeys'
  },
  {
    id: 'js-4',
    language: 'javascript',
    title: 'Debounce Utility Hook',
    code: 'const useDebounce = (value, delay = 300) => { const [debounced, setDebounced] = useState(value); useEffect(() => { const timer = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(timer); }, [value, delay]); return debounced; };',
    description: 'React debounce utility hook'
  },
  {
    id: 'js-5',
    language: 'javascript',
    title: 'Object Destructuring & Spread',
    code: 'const updateProfile = (prev, updates) => ({ ...prev, ...updates, updatedAt: Date.now(), isModified: true });',
    description: 'Spread operatori orqali immutable holatni yangilash'
  },

  // Python
  {
    id: 'py-1',
    language: 'python',
    title: 'List Comprehension and Dict',
    code: 'even_squares = {x: x ** 2 for x in range(20) if x % 2 == 0 and x > 0}',
    description: 'Python list va dict comprehension sintaksisi'
  },
  {
    id: 'py-2',
    language: 'python',
    title: 'Fibonacci Generator Function',
    code: 'def fibonacci_gen(limit): a, b = 0, 1; while a < limit: yield a; a, b = b, a + b',
    description: 'Python generator va yield operatori'
  },
  {
    id: 'py-3',
    language: 'python',
    title: 'Class with Decorator',
    code: 'class TypingStats: @property def wpm(self): return round((self.chars / 5) / (self.time_seconds / 60))',
    description: 'Klass xususiyati va property dekoratori'
  },
  {
    id: 'py-4',
    language: 'python',
    title: 'File Reading with Context Manager',
    code: 'with open("results.json", "r", encoding="utf-8") as f: data = json.load(f); print(f"Jami testlar: {len(data)}")',
    description: 'Context manager yordamida xavfsiz fayl o\'qish'
  },
  {
    id: 'py-5',
    language: 'python',
    title: 'Lambda & Sorted Function',
    code: 'sorted_leaders = sorted(players, key=lambda p: (p["wpm"], p["accuracy"]), reverse=True)',
    description: 'Ko\'p mezonli saralash va lambda funksiya'
  },

  // HTML / CSS
  {
    id: 'html-1',
    language: 'html_css',
    title: 'Responsive Flexbox Card',
    code: '<div class="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-blue-500/30 shadow-xl">',
    description: 'Tailwind CSS yordamida kartochka layouti'
  },
  {
    id: 'html-2',
    language: 'html_css',
    title: 'CSS Grid Layout',
    code: 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; place-items: center;',
    description: 'Zamonaviy responsiv CSS Grid qoidalari'
  },
  {
    id: 'html-3',
    language: 'html_css',
    title: 'Glassmorphism Background FX',
    code: 'backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);',
    description: 'Muzlatilgan shisha (glassmorphism) effekti'
  },
  {
    id: 'html-4',
    language: 'html_css',
    title: 'Accessible Button with Aria',
    code: '<button type="button" aria-label="Restart typing test" class="px-5 py-2.5 font-mono text-sm font-bold transition-all">',
    description: 'Accessible tugma va semantik atributlar'
  },

  // C++ / Go
  {
    id: 'cpp-1',
    language: 'cpp_go',
    title: 'C++ Fast I/O and Vector Sorting',
    code: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() { ios_base::sync_with_stdio(false); cin.tie(NULL); vector<int> v = {4, 1, 8, 3}; sort(v.begin(), v.end()); return 0; }',
    description: 'C++ tezkor kirish-chiqish va vektor saralash'
  },
  {
    id: 'cpp-2',
    language: 'cpp_go',
    title: 'Go Goroutines and Channel',
    code: 'package main; import ("fmt"); func worker(ch chan int) { ch <- 42 }; func main() { ch := make(chan int); go worker(ch); fmt.Println(<-ch); }',
    description: 'Go kanallari va goroutinalar orqali parallelizm'
  },
  {
    id: 'cpp-3',
    language: 'cpp_go',
    title: 'Go Struct and JSON Tag',
    code: 'type UserResult struct { WPM int `json:"wpm"`; Accuracy float64 `json:"accuracy"`; Time int `json:"time"` }',
    description: 'Go struktura va JSON serializatsiyasi'
  },
  {
    id: 'cpp-4',
    language: 'cpp_go',
    title: 'C++ Binary Search Function',
    code: 'int binarySearch(const vector<int>& arr, int target) { int l = 0, r = arr.size() - 1; while (l <= r) { int m = l + (r - l) / 2; if (arr[m] == target) return m; if (arr[m] < target) l = m + 1; else r = m - 1; } return -1; }',
    description: 'C++ ikkilik qidiruv algoritmi'
  }
];

export function getRandomCodeSnippet(lang?: CodeLanguage): CodeSnippetItem {
  const pool = lang ? CODE_SNIPPETS.filter((s) => s.language === lang) : CODE_SNIPPETS;
  return pool[Math.floor(Math.random() * pool.length)];
}
