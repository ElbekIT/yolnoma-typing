import React from 'react';
import { ArrowRight, Globe, Shield, Zap, Languages, Sparkles } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface HeroSectionProps {
  onStartTyping: () => void;
  onGoToBattle: () => void;
  onOpenLogin: () => void;
  onGoToLessons?: () => void;
  onGoToLeaderboard?: () => void;
  onGoToEnglish?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartTyping,
  onGoToBattle,
  onGoToLessons,
  onGoToEnglish
}) => {
  const { uiLanguage } = useI18n();

  return (
    <section className="relative w-full max-w-7xl mx-auto pt-2 sm:pt-4 pb-6 sm:pb-8 px-2 sm:px-4 lg:px-6">
      {/* Clean Panoramic Hero Banner without heavy 3D mascots or laggy art */}
      <div className="relative w-full rounded-3xl lg:rounded-4xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--sub-alt)]/20 to-[var(--card-bg)] border border-[var(--sub-alt)]/70 p-6 sm:p-8 lg:p-10 shadow-lg">
        
        {/* Center Content */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-6">
          
          {/* Top Pill Kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--sub-alt)]/85 backdrop-blur-md border border-[var(--sub-alt)] text-[var(--main-color)] text-xs font-mono font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
                {uiLanguage === 'ru'
                  ? '⚡️ Платформа №1 скоростной печати в Узбекистане'
                  : uiLanguage === 'en'
                  ? '⚡️ #1 Touch Typing Platform in Uzbekistan'
                  : "⚡️ O'zbekistonda #1 Tezkor Yozuv Platformasi"}
              </span>
            </div>

            {/* Main Catchy Title */}
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-[42px] font-black text-[var(--text-color)] tracking-tight leading-[1.2]">
              {uiLanguage === 'ru' ? (
                <>
                  Проверьте скорость печати и освойте{' '}
                  <span className="text-[var(--main-color)]">10-пальцевый метод</span>
                </>
              ) : uiLanguage === 'en' ? (
                <>
                  Test Your Typing Speed & Master{' '}
                  <span className="text-[var(--main-color)]">10-Finger Technique</span>
                </>
              ) : (
                <>
                  Klaviaturada <span className="text-[var(--main-color)]">Tez Yozish</span> va{' '}
                  <span className="text-[var(--main-color)]">
                    10 Barmoq
                  </span>{' '}
                  Mashqlari
                </>
              )}
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-[var(--sub-color)] leading-relaxed max-w-xl font-normal">
              {uiLanguage === 'ru'
                ? 'Определите свою скорость на клавиатуре с Yolnoma, соревнуйтесь 1 на 1 с друзьями и возглавьте национальный рейтинг.'
                : uiLanguage === 'en'
                ? 'Discover your typing speed with Yolnoma, race 1v1 with friends in real-time, and dominate the national leaderboard.'
                : "Yolnoma yordamida klaviaturadagi tezligingizni aniqlang, do'stlaringiz bilan 1v1 poyga qiling va milliy reytingda peshqadam bo'ling."}
            </p>

            {/* 3 Action Buttons with Expressive Graphic Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 pt-1 w-full">
              {/* 1. Boshlash Button with 3D Rocket Badge */}
              <button
                type="button"
                onClick={onStartTyping}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-sm sm:text-base transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md hover:brightness-105 active:scale-95 border border-amber-200/60 group select-none"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
                  <img
                    src="/btn_badge_rocket.svg"
                    alt=""
                    className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="tracking-wide">
                    {uiLanguage === 'ru' ? 'Начать тест' : uiLanguage === 'en' ? 'Start Test' : 'Boshlash'}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-800 opacity-80">
                    {uiLanguage === 'ru' ? 'Быстрый старт' : uiLanguage === 'en' ? 'Quick Start' : 'Tezkor Sinov'}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 stroke-[3] ml-1" />
              </button>

              {/* 2. 1v1 Battle Arenasi Button with Dual Swords & Shield Badge */}
              <button
                type="button"
                onClick={onGoToBattle}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border border-rose-500/50 text-rose-100 font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md hover:border-rose-400 active:scale-95 group select-none"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
                  <img
                    src="/btn_badge_swords.svg"
                    alt=""
                    className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="tracking-wide text-rose-100">
                      {uiLanguage === 'ru'
                        ? '1v1 Арена Битв'
                        : uiLanguage === 'en'
                        ? '1v1 Battle Arena'
                        : '1v1 Battle Arenasi'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-mono text-[9px] font-extrabold uppercase">
                      LIVE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300/80">
                    {uiLanguage === 'ru' ? 'Гонка с друзьями' : uiLanguage === 'en' ? 'Race with friends' : "Do'stlar bilan poyga"}
                  </span>
                </div>
              </button>

              {/* 3. 10 Barmoq Saboqlari Button with Academy Emblem Badge */}
              {onGoToLessons && (
                <button
                  type="button"
                  onClick={onGoToLessons}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-950/80 via-indigo-950/80 to-slate-900 border border-sky-500/50 text-sky-100 font-bold text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md hover:border-sky-400 active:scale-95 group select-none"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
                    <img
                      src="/btn_badge_academy.svg"
                      alt=""
                      className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
                      draggable={false}
                    />
                  </div>
                  <div className="flex flex-col items-start leading-tight text-left">
                    <span className="tracking-wide text-sky-100">
                      {uiLanguage === 'ru'
                        ? 'Уроки 10 пальцев'
                        : uiLanguage === 'en'
                        ? '10-Finger Lessons'
                        : '10 Barmoq Saboqlari'}
                    </span>
                    <span className="text-[10px] font-mono text-sky-300/80">
                      {uiLanguage === 'ru' ? 'Интерактивный курс' : uiLanguage === 'en' ? 'Interactive course' : 'Interaktiv ta\'lim'}
                    </span>
                  </div>
                </button>
              )}

              {/* 4. English Course Button (100% Free) */}
              {onGoToEnglish && (
                <button
                  type="button"
                  onClick={onGoToEnglish}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-950/85 via-teal-950/85 to-slate-900 border border-emerald-500/50 text-emerald-100 font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:border-emerald-400 active:scale-95 group select-none"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start leading-tight text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="tracking-wide text-emerald-200">
                        {uiLanguage === 'ru' ? 'English Курс' : uiLanguage === 'en' ? 'English Course' : 'English Kursi'}
                      </span>
                      <span className="badge-free px-1.5 py-0.2 rounded-md font-mono text-[9px] font-black">
                        BEPUL
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300/80">
                      0 dan IELTS 9 gacha (35 Dars)
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* 4 Core Highlights (125+ Til, 1v1 Arena, English Kursi, 100% Bepul) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-[var(--sub-alt)]/60 w-full max-w-2xl text-xs">
              {/* Highlight 1: 125+ Til */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--sub-alt)]/50 backdrop-blur-md border border-[var(--sub-alt)]/70 text-left hover:border-cyan-400/50 transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-[var(--text-color)] font-bold text-xs">
                    125+ Til
                  </strong>
                  <span className="text-[9px] text-[var(--sub-color)] block leading-tight">
                    {uiLanguage === 'ru' ? 'Узбек, Рус, Код' : "O'zbek, Rus, Kod"}
                  </span>
                </div>
              </div>

              {/* Highlight 2: 1v1 Arena */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--sub-alt)]/50 backdrop-blur-md border border-[var(--sub-alt)]/70 text-left hover:border-rose-400/50 transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-[var(--text-color)] font-bold text-xs">
                    1v1 PvP
                  </strong>
                  <span className="text-[9px] text-[var(--sub-color)] block leading-tight">
                    Real-vaqtda duel
                  </span>
                </div>
              </div>

              {/* Highlight 3: English */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--sub-alt)]/50 backdrop-blur-md border border-[var(--sub-alt)]/70 text-left hover:border-emerald-400/50 transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Languages className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-[var(--text-color)] font-bold text-xs">
                    IELTS 9
                  </strong>
                  <span className="text-[9px] text-emerald-400 block leading-tight font-medium">
                    35 ta bepul dars
                  </span>
                </div>
              </div>

              {/* Highlight 4: 100% Bepul */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--sub-alt)]/50 backdrop-blur-md border border-emerald-500/30 text-left hover:border-emerald-400/60 transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-emerald-400 font-bold text-xs">
                    100% Bepul
                  </strong>
                  <span className="text-[9px] text-[var(--sub-color)] block leading-tight">
                    Cheksiz kirish
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
    </section>
  );
};
