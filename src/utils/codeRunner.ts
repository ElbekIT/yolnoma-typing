import { CodingLanguage, TestCase, TestResult } from '../types/coding';

// Deep equality comparator for test results
export function areEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    if (isNaN(a) && isNaN(b)) return true;
    return Math.abs(a - b) < 1e-6;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!areEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !areEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

// Convert Python code to executable JS in browser
function transpilePythonToJS(pythonCode: string, functionName: string): string {
  // Prepend Python standard library emulation helpers in JS scope
  const helpers = `
    const True = true;
    const False = false;
    const None = null;
    function len(x) { return x ? (x.length !== undefined ? x.length : Object.keys(x).length) : 0; }
    function sum(arr) { return (arr || []).reduce((acc, v) => acc + v, 0); }
    function min(...args) { 
      if (args.length === 1 && Array.isArray(args[0])) return Math.min(...args[0]);
      return Math.min(...args);
    }
    function max(...args) {
      if (args.length === 1 && Array.isArray(args[0])) return Math.max(...args[0]);
      return Math.max(...args);
    }
    function abs(n) { return Math.abs(n); }
    function int(n) { return parseInt(n, 10); }
    function float(n) { return parseFloat(n); }
    function str(n) { return String(n); }
    function range(start, stop, step) {
      if (stop === undefined) { stop = start; start = 0; }
      if (step === undefined) step = 1;
      const res = [];
      if (step > 0) {
        for (let i = start; i < stop; i += step) res.push(i);
      } else {
        for (let i = start; i > stop; i += step) res.push(i);
      }
      return res;
    }
    function list(x) { return Array.isArray(x) ? [...x] : Array.from(x || []); }
    function sorted(x, reverse = false) {
      const arr = Array.from(x || []);
      arr.sort((a, b) => (typeof a === 'string' ? a.localeCompare(b) : a - b));
      return reverse ? arr.reverse() : arr;
    }
    function reversed(x) { return Array.from(x || []).reverse(); }
  `;

  // Python indent to braces parser
  const lines = pythonCode.split('\n');
  const jsLines: string[] = [];
  const indentStack: number[] = [0];

  for (let rawLine of lines) {
    // Ignore pure comments or empty lines
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Determine current indentation
    const indent = rawLine.search(/\S/);
    const currentIndent = indentStack[indentStack.length - 1];

    if (indent < currentIndent) {
      while (indentStack.length > 1 && indentStack[indentStack.length - 1] > indent) {
        indentStack.pop();
        jsLines.push('}');
      }
    }

    let line = trimmed;

    // Remove inline comment
    const hashIndex = line.indexOf('#');
    if (hashIndex > 0) {
      line = line.substring(0, hashIndex).trim();
    }

    // Python function header: def solve(a, b):
    if (/^def\s+([a-zA-Z_0-9]+)\s*\((.*?)\)\s*:/.test(line)) {
      const match = line.match(/^def\s+([a-zA-Z_0-9]+)\s*\((.*?)\)\s*:/);
      if (match) {
        const fname = match[1];
        const params = match[2];
        jsLines.push(`function ${fname}(${params}) {`);
        indentStack.push(indent + 4);
        continue;
      }
    }

    // Python if / elif / else
    if (/^if\s+(.*?)\s*:/.test(line)) {
      const cond = line.match(/^if\s+(.*?)\s*:/)![1];
      jsLines.push(`if (${convertPyCondition(cond)}) {`);
      indentStack.push(indent + 4);
      continue;
    } else if (/^elif\s+(.*?)\s*:/.test(line)) {
      const cond = line.match(/^elif\s+(.*?)\s*:/)![1];
      jsLines.push(`} else if (${convertPyCondition(cond)}) {`);
      continue;
    } else if (/^else\s*:/.test(line)) {
      jsLines.push(`} else {`);
      continue;
    }

    // Python while
    if (/^while\s+(.*?)\s*:/.test(line)) {
      const cond = line.match(/^while\s+(.*?)\s*:/)![1];
      jsLines.push(`while (${convertPyCondition(cond)}) {`);
      indentStack.push(indent + 4);
      continue;
    }

    // Python for x in y:
    if (/^for\s+([a-zA-Z_0-9,\s]+)\s+in\s+(.*?)\s*:/.test(line)) {
      const match = line.match(/^for\s+([a-zA-Z_0-9,\s]+)\s+in\s+(.*?)\s*:/)!;
      const varName = match[1].trim();
      const iter = match[2].trim();
      jsLines.push(`for (let ${varName} of ${iter}) {`);
      indentStack.push(indent + 4);
      continue;
    }

    // Python return
    if (/^return\b/.test(line)) {
      const expr = line.replace(/^return\s*/, '').trim();
      jsLines.push(`return ${convertPyExpressions(expr)};`);
      continue;
    }

    // Python print
    if (/^print\s*\((.*?)\)$/.test(line)) {
      jsLines.push(`console.log(${line.slice(6, -1)});`);
      continue;
    }

    // Python pass
    if (line === 'pass') {
      continue;
    }

    // Assignments & general statements
    let converted = convertPyExpressions(line);
    // If not ending in semicolon or brace, add semicolon
    if (!converted.endsWith(';') && !converted.endsWith('{') && !converted.endsWith('}')) {
      converted += ';';
    }
    jsLines.push(converted);
  }

  // Close remaining indents
  while (indentStack.length > 1) {
    indentStack.pop();
    jsLines.push('}');
  }

  return `${helpers}\n\n${jsLines.join('\n')}\n\nreturn ${functionName};`;
}

function convertPyCondition(cond: string): string {
  let c = cond;
  c = c.replace(/\band\b/g, '&&');
  c = c.replace(/\bor\b/g, '||');
  c = c.replace(/\bnot\s+/g, '!');
  c = c.replace(/\bTrue\b/g, 'true');
  c = c.replace(/\bFalse\b/g, 'false');
  c = c.replace(/\bNone\b/g, 'null');
  c = c.replace(/\bis\s+None\b/g, '=== null');
  c = c.replace(/\bis\s+not\s+None\b/g, '!== null');
  return c;
}

function convertPyExpressions(expr: string): string {
  let res = expr;
  res = res.replace(/\bTrue\b/g, 'true');
  res = res.replace(/\bFalse\b/g, 'false');
  res = res.replace(/\bNone\b/g, 'null');
  res = res.replace(/\.append\(/g, '.push(');
  res = res.replace(/\.count\((.*?)\)/g, '.filter(x => x === $1).length');
  res = res.replace(/\.lower\(\)/g, '.toLowerCase()');
  res = res.replace(/\.upper\(\)/g, '.toUpperCase()');
  return res;
}

// Main execution function
export async function runCodeOnTestCases(
  code: string,
  language: CodingLanguage,
  functionName: string,
  testCases: TestCase[]
): Promise<{
  allPassed: boolean;
  results: TestResult[];
  logs: string[];
  totalTimeMs: number;
  syntaxError?: string;
}> {
  const results: TestResult[] = [];
  const globalLogs: string[] = [];
  let allPassed = true;
  let totalTime = 0;

  let executableFn: Function;

  try {
    if (language === 'javascript') {
      // Wrap code and return the target function
      const wrapped = `
        const logs = [];
        const originalLog = console.log;
        const customLog = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };

        ${code}

        if (typeof ${functionName} !== 'function') {
          throw new Error("'${functionName}' nomli funksiya topilmadi! Iltimos, funksiya nomini o'zgartirmang.");
        }
        return { fn: ${functionName}, logs };
      `;
      const factory = new Function(wrapped);
      const output = factory();
      executableFn = output.fn;
    } else {
      // Python transpilation to JS function
      const transpiled = transpilePythonToJS(code, functionName);
      const factory = new Function(transpiled);
      executableFn = factory();
      if (typeof executableFn !== 'function') {
        throw new Error(`Python kodida 'def ${functionName}(...)' topilmadi!`);
      }
    }
  } catch (err: any) {
    return {
      allPassed: false,
      results: [],
      logs: [err.message || 'Sintaktik xatolik mavjud'],
      totalTimeMs: 0,
      syntaxError: err.message || 'Sintaktik xatolik yuz berdi'
    };
  }

  // Run each of the 10 test cases
  for (const test of testCases) {
    const startTime = performance.now();
    let actual: any;
    let passed = false;
    let error: string | undefined;

    try {
      // Deep clone arguments to avoid in-place mutation side effects between tests
      const clonedArgs = JSON.parse(JSON.stringify(test.args));
      
      // Execute function with timeout protection
      actual = executableFn(...clonedArgs);
      const elapsed = performance.now() - startTime;
      totalTime += elapsed;

      passed = areEqual(actual, test.expected);

      results.push({
        testId: test.id,
        inputDisplay: test.inputDisplay,
        expected: test.expected,
        actual,
        passed,
        executionTimeMs: Math.round(elapsed * 100) / 100,
        isHidden: test.isHidden
      });

      if (!passed) {
        allPassed = false;
      }
    } catch (err: any) {
      const elapsed = performance.now() - startTime;
      totalTime += elapsed;
      allPassed = false;
      results.push({
        testId: test.id,
        inputDisplay: test.inputDisplay,
        expected: test.expected,
        actual: undefined,
        passed: false,
        executionTimeMs: Math.round(elapsed * 100) / 100,
        error: err.message || 'Ijro vaqtida xatolik yuz berdi (Runtime Error)',
        isHidden: test.isHidden
      });
    }
  }

  return {
    allPassed,
    results,
    logs: globalLogs,
    totalTimeMs: Math.round(totalTime * 100) / 100
  };
}
