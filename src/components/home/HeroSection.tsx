import React from 'react';
import { ArrowRight, Globe, Shield, Zap, Languages } from 'lucide-react';
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
      <div className="relative w-full rounded-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)]/60 p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-6">
          {/* Top Pill Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--sub-alt)]/70 text-[var(--main-color)] text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {uiLanguage === 'ru'
                ? '⚡️ Платформа №1 скоростной печати в Узбекистане'
                : uiLanguage === 'en'
                ? '⚡️ #1 Touch Typing Platform in Uzbekistan'
                : "⚡️ O'zbekistonda #1 Tezkor Yozuv Platformasi"}
            </span>
          </div>

          {/* Main Title */}
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
                <span className="text-[var(--main-color)]">10 Barmoq</span> Mashqlari
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base text-[var(--sub-color)] leading-relaxed max-w-xl font-normal">
            {uiLanguage === 'ru'
              ? 'Определите свою скорость на клавиатуре с Yolnoma, соревнуйтесь 1 на 1 с друзьями и возглавьте национальный рейтинг.'
              : uiLanguage === 'en'
              ? 'Discover your typing speed with Yolnoma, race 1v1 with friends in real-time, and dominate the national leaderboard.'
              : "Yolnoma yordamida klaviaturadagi tezligingizni aniqlang, do'stlaringiz bilan 1v1 poyga qiling va milliy reytingda peshqadam bo'ling."}
          </p>

          {/* Action Buttons (Clean, flat, zero protruding borders/shadows) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 w-full">
            <button
              type="button"
              onClick={onStartTyping}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base transition-colors flex items-center justify-center gap-3 cursor-pointer select-none"
            >
              <img
                src="/btn_badge_rocket.svg"
                alt=""
                className="w-7 h-7 object-contain shrink-0 pointer-events-none"
                draggable={false}
              />
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

            <button
              type="button"
              onClick={onGoToBattle}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-3 cursor-pointer select-none"
            >
              <img
                src="/btn_badge_swords.svg"
                alt=""
                className="w-7 h-7 object-contain shrink-0 pointer-events-none"
                draggable={false}
              />
              <div className="flex flex-col items-start leading-tight text-left">
                <div className="flex items-center gap-1.5">
                  <span className="tracking-wide">
                    {uiLanguage === 'ru'
                      ? '1v1 Арена Битв'
                      : uiLanguage === 'en'
                      ? '1v1 Battle Arena'
                      : '1v1 Battle Arenasi'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-mono text-[9px] font-extrabold uppercase">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--sub-color)]">
                  {uiLanguage === 'ru' ? 'Гонка с друзьями' : uiLanguage === 'en' ? 'Race with friends' : "Do'stlar bilan poyga"}
                </span>
              </div>
            </button>

            {onGoToLessons && (
              <button
                type="button"
                onClick={onGoToLessons}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-bold text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer select-none"
              >
                <img
                  src="/btn_badge_academy.svg"
                  alt=""
                  className="w-7 h-7 object-contain shrink-0 pointer-events-none"
                  draggable={false}
                />
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="tracking-wide">
                    {uiLanguage === 'ru'
                      ? 'Уроки 10 пальцев'
                      : uiLanguage === 'en'
                      ? '10-Finger Lessons'
                      : '10 Barmoq Saboqlari'}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--sub-color)]">
                    {uiLanguage === 'ru' ? 'Интерактивный курс' : uiLanguage === 'en' ? 'Interactive course' : "Interaktiv ta'lim"}
                  </span>
                </div>
              </button>
            )}

            {onGoToEnglish && (
              <button
                type="button"
                onClick={onGoToEnglish}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--sub-alt)] hover:bg-[var(--sub-alt)]/80 text-[var(--text-color)] font-bold text-sm transition-colors flex items-center justify-center gap-3 cursor-pointer select-none"
              >
                <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Languages className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="tracking-wide text-emerald-400">
                      {uiLanguage === 'ru' ? 'English Курс' : uiLanguage === 'en' ? 'English Course' : 'English Kursi'}
                    </span>
                    <span className="badge-free px-1.5 py-0.2 rounded font-mono text-[9px] font-black">
                      BEPUL
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--sub-color)]">
                    0 dan IELTS 9 gacha (35 Dars)
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* 4 Core Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 border-t border-[var(--sub-alt)]/50 w-full max-w-2xl text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--sub-alt)]/40 text-left">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-[var(--text-color)] font-bold text-xs">125+ Til</strong>
                <span className="text-[9px] text-[var(--sub-color)] block leading-tight">
                  {uiLanguage === 'ru' ? 'Узбек, Рус, Код' : "O'zbek, Rus, Kod"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--sub-alt)]/40 text-left">
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-[var(--text-color)] font-bold text-xs">1v1 PvP</strong>
                <span className="text-[9px] text-[var(--sub-color)] block leading-tight">Real-vaqtda duel</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--sub-alt)]/40 text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Languages className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-[var(--text-color)] font-bold text-xs">IELTS 9</strong>
                <span className="text-[9px] text-emerald-400 block leading-tight font-medium">35 ta bepul dars</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--sub-alt)]/40 text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-emerald-400 font-bold text-xs">100% Bepul</strong>
                <span className="text-[9px] text-[var(--sub-color)] block leading-tight">Cheksiz kirish</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
