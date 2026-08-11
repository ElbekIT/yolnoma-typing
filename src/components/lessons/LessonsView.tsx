import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  HelpCircle,
  Hand
} from 'lucide-react';
import { soundSynth } from '../../utils/audio';

interface Lesson {
  id: number;
  title: string;
  description: string;
  targetText: string;
  focusKeys: string[];
  fingerGuide: string;
}

const LESSONS_DATA: Lesson[] = [
  {
    id: 1,
    title: '1-DARS: Asosiy Qatlam (Home Row)',
    description: 'Boshlangʻich holat: Barmoqlaringizni F va J boʻrtiqchalariga joylashtiring.',
    targetText: 'fj dk sl a; fj dk sl a; fjdk sl a; fjdk sl a;',
    focusKeys: ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'],
    fingerGuide: 'Chap koʻrsatkich F da, Oʻng koʻrsatkich J da boʻlishi shart!'
  },
  {
    id: 2,
    title: '2-DARS: Yuqori Qatlam (Top Row)',
    description: 'Koʻrsatkich va oʻrta barmoqlarni yuqoriga choʻzib yozishni oʻrganing.',
    targetText: 'ru ei wo qp ru ei wo qp f j r u e i w o q p',
    focusKeys: ['r', 'u', 'e', 'i', 'w', 'o', 'q', 'p'],
    fingerGuide: 'Har bir barmoq faqat oʻz ustunidagi harfga javob beradi.'
  },
  {
    id: 3,
    title: '3-DARS: Pastki Qatlam (Bottom Row)',
    description: 'Pastki qatlam harflarini klaviaturaga qaramasdan topish.',
    targetText: 'vm cn x b z vm cn x b z f j v m c n x b z',
    focusKeys: ['v', 'm', 'c', 'n', 'x', 'b', 'z'],
    fingerGuide: 'Pastga tushganda barmoq tirsagidan yengil harakatlanadi.'
  },
  {
    id: 4,
    title: '4-DARS: Bosh Harflar & Shift',
    description: 'Shift tugmasi va bosh harflarni toʻgʻri bosish usuli.',
    targetText: 'Fj Dk Sl A; Ru Ei Wo Qp Vm Cn Xb Z',
    focusKeys: ['Shift', 'F', 'J', 'D', 'K', 'S', 'L'],
    fingerGuide: 'Oʻng harf uchun chap Shift, Chap harf uchun oʻng Shift bosiladi.'
  },
  {
    id: 5,
    title: '5-DARS: Soʻzlar Mashqi (Soʻz birikmalari)',
    description: 'Kichik soʻzlarni barmoqlar xotirasi bilan tezkor yozish.',
    targetText: 'dunyo bilak ilm ziyo qalam kitob vatan navo safo',
    focusKeys: ['d', 'u', 'n', 'y', 'o', 'b', 'i', 'l', 'a', 'k'],
    fingerGuide: 'Klaviaturaga mutlaqo qaramang, ekrandagi harflarga diqqat qiling!'
  },
  {
    id: 6,
    title: '6-DARS: Mukammal Yozish (Toʻliq Jumla)',
    description: 'Barcha qoidalar asosida mukammal Oʻzbekcha matn yozish.',
    targetText: 'Bilim va maʼrifat insonning eng buyuk boyligidir.',
    focusKeys: ['all'],
    fingerGuide: 'Tabriklaymiz! Siz haqiqiy Pro yozuvchiga aylanasiz.'
  }
];

const FINGER_MAP: Record<string, { hand: 'left' | 'right'; fingerName: string; color: string }> = {
  a: { hand: 'left', fingerName: 'Chap Jimjiloq', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  q: { hand: 'left', fingerName: 'Chap Jimjiloq', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  z: { hand: 'left', fingerName: 'Chap Jimjiloq', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },

  s: { hand: 'left', fingerName: 'Chap Nomunsiz', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  w: { hand: 'left', fingerName: 'Chap Nomunsiz', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  x: { hand: 'left', fingerName: 'Chap Nomunsiz', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },

  d: { hand: 'left', fingerName: 'Chap Oʻrta', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  e: { hand: 'left', fingerName: 'Chap Oʻrta', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  c: { hand: 'left', fingerName: 'Chap Oʻrta', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },

  f: { hand: 'left', fingerName: 'Chap Koʻrsatkich (Asosiy F)', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  r: { hand: 'left', fingerName: 'Chap Koʻrsatkich', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  v: { hand: 'left', fingerName: 'Chap Koʻrsatkich', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  g: { hand: 'left', fingerName: 'Chap Koʻrsatkich', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  t: { hand: 'left', fingerName: 'Chap Koʻrsatkich', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  b: { hand: 'left', fingerName: 'Chap Koʻrsatkich', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },

  j: { hand: 'right', fingerName: 'Oʻng Koʻrsatkich (Asosiy J)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  u: { hand: 'right', fingerName: 'Oʻng Koʻrsatkich', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  m: { hand: 'right', fingerName: 'Oʻng Koʻrsatkich', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  h: { hand: 'right', fingerName: 'Oʻng Koʻrsatkich', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  y: { hand: 'right', fingerName: 'Oʻng Koʻrsatkich', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  n: { hand: 'right', fingerName: 'Oʻng Koʻrsatkich', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },

  k: { hand: 'right', fingerName: 'Oʻng Oʻrta', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  i: { hand: 'right', fingerName: 'Oʻng Oʻrta', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },

  l: { hand: 'right', fingerName: 'Oʻng Nomunsiz', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  o: { hand: 'right', fingerName: 'Oʻng Nomunsiz', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },

  ';': { hand: 'right', fingerName: 'Oʻng Jimjiloq', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  p: { hand: 'right', fingerName: 'Oʻng Jimjiloq', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },

  ' ': { hand: 'left', fingerName: 'Bosh Barmoq (Probel)', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' }
};

export const LessonsView: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1]);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentLesson = LESSONS_DATA.find((l) => l.id === activeLessonId) || LESSONS_DATA[0];

  useEffect(() => {
    setTypedText('');
    setStartTime(0);
    setErrorsCount(0);
    setIsFinished(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeLessonId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;

    if (val.length === 1 && typedText.length === 0) {
      setStartTime(Date.now());
    }

    // Count errors
    if (val.length > typedText.length) {
      const addedChar = val[val.length - 1];
      const targetChar = currentLesson.targetText[val.length - 1];
      if (addedChar !== targetChar) {
        setErrorsCount((prev) => prev + 1);
        soundSynth.playErrorSound();
      } else {
        soundSynth.playKeyPress('cherry-blue');
      }
    }

    setTypedText(val);

    // Check completion
    if (val === currentLesson.targetText) {
      setIsFinished(true);
      if (!completedLessons.includes(activeLessonId + 1) && activeLessonId < LESSONS_DATA.length) {
        setCompletedLessons((prev) => [...prev, activeLessonId + 1]);
      }
    }
  };

  const nextChar = currentLesson.targetText[typedText.length] || '';
  const fingerInfo = FINGER_MAP[nextChar.toLowerCase()] || {
    hand: 'right',
    fingerName: 'Tegishli barmoq',
    color: 'text-slate-300 bg-slate-800 border-slate-700'
  };

  // Stats
  const elapsedSec = startTime > 0 ? Math.max(1, (Date.now() - startTime) / 1000) : 1;
  const wpm = Math.round((typedText.length / 5) / (elapsedSec / 60));
  const accuracy = typedText.length > 0 ? Math.max(0, Math.round(((typedText.length - errorsCount) / typedText.length) * 100)) : 100;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-color)] tracking-tight">
              Klaviaturaga Qaramasdan Yozish Saboqlari
            </h1>
            <p className="text-xs text-[var(--sub-color)] mt-1 font-medium">
              Barmoqlar oʻrnini toʻgʻri qoʻyib, 100+ WPM tezlikka erishish uchun interaktiv mashqlar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[var(--sub-alt)]/60 p-3 rounded-2xl border border-[var(--sub-alt)]">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs font-bold">
            <span className="text-[var(--sub-color)]">Jami Oʻtilgan: </span>
            <span className="text-[var(--main-color)]">{completedLessons.length} / {LESSONS_DATA.length} Dars</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Lessons Navigation & Right Interactive Practice Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Lessons Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[var(--sub-color)] px-2">
            Bosqichli Mashqlar Roʻyxati
          </h2>

          <div className="space-y-2">
            {LESSONS_DATA.map((lesson) => {
              const isUnlocked = completedLessons.includes(lesson.id);
              const isActive = lesson.id === activeLessonId;

              return (
                <button
                  key={lesson.id}
                  disabled={!isUnlocked}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[var(--main-color)]/10 border-[var(--main-color)] text-[var(--text-color)] shadow-md'
                      : isUnlocked
                      ? 'bg-[var(--card-bg)] border-[var(--sub-alt)] hover:border-[var(--main-color)]/50 text-[var(--text-color)]'
                      : 'bg-[var(--card-bg)]/40 border-transparent opacity-50 cursor-not-allowed text-[var(--sub-color)]'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--main-color)]">
                        #{lesson.id}
                      </span>
                      <h3 className="font-extrabold text-xs truncate">{lesson.title}</h3>
                    </div>
                    <p className="text-[11px] text-[var(--sub-color)] truncate">{lesson.description}</p>
                  </div>

                  {isUnlocked ? (
                    isActive ? (
                      <Sparkles className="w-5 h-5 text-[var(--main-color)] shrink-0 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )
                  ) : (
                    <Lock className="w-4 h-4 text-[var(--sub-color)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Lesson Stage (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Lesson Header & Finger Placement Banner */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--main-color)] bg-[var(--sub-alt)] px-3 py-1 rounded-full border border-[var(--main-color)]/20">
                  {currentLesson.title}
                </span>
                <p className="text-sm font-semibold text-[var(--text-color)] mt-2">
                  {currentLesson.description}
                </p>
              </div>

              <button
                onClick={() => {
                  setTypedText('');
                  setIsFinished(false);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="p-2.5 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] transition-colors"
                title="Qayta boshlash"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* LIVE FINGER Placement Guidance Badge */}
            {!isFinished && nextChar && (
              <div className={`p-4 rounded-2xl border ${fingerInfo.color} flex items-center justify-between gap-4 animate-in fade-in duration-200 shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-black/20 shrink-0 font-mono text-xl font-black uppercase">
                    {nextChar === ' ' ? 'PROBEL' : nextChar}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                      Boʻlajak tugma uchun masʼul barmoq:
                    </p>
                    <h4 className="text-sm font-black tracking-tight">{fingerInfo.fingerName}</h4>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-black/30">
                  <Hand className="w-4 h-4 text-amber-400" />
                  <span>{currentLesson.fingerGuide}</span>
                </div>
              </div>
            )}

            {/* Typing Display Box */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="relative p-6 bg-[var(--bg-color)]/80 border-2 border-[var(--sub-alt)] rounded-2xl min-h-[140px] cursor-text font-mono text-xl tracking-wider leading-relaxed select-none overflow-hidden"
            >
              <input
                ref={inputRef}
                type="text"
                value={typedText}
                onChange={handleInputChange}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                disabled={isFinished}
                className="absolute inset-0 opacity-0 cursor-text"
              />

              {/* Characters rendering */}
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {currentLesson.targetText.split('').map((char, idx) => {
                  const typed = typedText[idx];
                  const isCurrent = idx === typedText.length;

                  let charClass = 'relative inline-block transition-all rounded px-0.5 ';
                  if (typed === undefined) {
                    charClass += 'text-[var(--sub-color)] opacity-40';
                  } else if (typed === char) {
                    charClass += 'text-emerald-400 font-bold bg-emerald-500/10';
                  } else {
                    charClass += 'text-rose-400 font-bold bg-rose-500/20';
                  }

                  return (
                    <span key={idx} className={charClass}>
                      {isCurrent && !isFinished && (
                        <span className="absolute left-0 bottom-0 top-0 w-1 bg-[var(--main-color)] animate-pulse rounded-full" />
                      )}
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Completion Screen */}
            {isFinished && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
                <Sparkles className="w-12 h-12 text-emerald-400 animate-bounce" />
                <div>
                  <h3 className="text-xl font-black">Ajoyib! Mashq Muvaffaqiyatli Bajarildi!</h3>
                  <p className="text-xs text-emerald-300 mt-1">
                    Tezlik: <strong>{wpm} WPM</strong> | Aniqlik: <strong>{accuracy}%</strong>
                  </p>
                </div>

                {activeLessonId < LESSONS_DATA.length ? (
                  <button
                    onClick={() => setActiveLessonId((prev) => prev + 1)}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <span>Keyingi Darsga Oʻtish</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <p className="text-xs font-bold text-amber-300">
                    🏆 Barcha saboqlarni yakunladingiz! Endi yozish testlarida oʻz mahoratingizni koʻrsating.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Visual Hands & Finger Chart Guide */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--sub-color)] flex items-center gap-2">
              <Info className="w-4 h-4 text-[var(--main-color)]" />
              Barmoqlar Joylashuvi Xaritasi
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Chap Jimjiloq</span>
                <p className="font-mono text-sm font-black">Q, A, Z, 1, Shift</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Chap Nomunsiz</span>
                <p className="font-mono text-sm font-black">W, S, X, 2</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Chap Oʻrta</span>
                <p className="font-mono text-sm font-black">E, D, C, 3</p>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Chap Koʻrsatkich</span>
                <p className="font-mono text-sm font-black">R, T, F, G, V, B</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Oʻng Koʻrsatkich</span>
                <p className="font-mono text-sm font-black">Y, U, H, J, N, M</p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Oʻng Oʻrta</span>
                <p className="font-mono text-sm font-black">I, K, 8</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Oʻng Nomunsiz</span>
                <p className="font-mono text-sm font-black">O, L, 9</p>
              </div>

              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 space-y-1">
                <span className="font-bold text-[10px] uppercase block">Oʻng Jimjiloq</span>
                <p className="font-mono text-sm font-black">P, ;, Enter, 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
