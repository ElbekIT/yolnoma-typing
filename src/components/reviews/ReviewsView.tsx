import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Send,
  ArrowLeft,
  Sparkles,
  Quote,
  Copy,
  Check,
  Swords,
  Code2,
  ExternalLink,
  ChevronRight,
  Heart,
  Users
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export interface UserReview {
  id: string;
  name: string;
  telegramUsername: string;
  telegramUrl: string;
  role: string;
  roleIcon: 'code' | 'battle';
  avatarInitials: string;
  rating: number;
  text: string;
  tags: string[];
  date: string;
}

// Qat'iy kod ichida saqlangan haqiqiy foydalanuvchilar fikri (Firebase EMAS, toza kod)
export const COMMUNITY_REVIEWS: UserReview[] = [
  {
    id: 'jasurbek-haydarov',
    name: 'Jasurbek Haydarov',
    telegramUsername: '@KanYonA',
    telegramUrl: 'https://t.me/KanYonA',
    role: 'Dasturchi / Web Developer',
    roleIcon: 'code',
    avatarInitials: 'JH',
    rating: 5,
    text: "YOLNOMA.UZ zo‘r chiqibdi, ayniqsa o‘zbek tilida typing mashq qilish mumkinligi yoqdi. Dasturchi sifatida bunaqa loyihalarni ko‘rish xursand qiladi, ortida ancha mehnat borligi bilinib turibdi. Omad, bro, bundanam zo‘r bo‘lsin! 🔥",
    tags: ["O'zbekcha Typing", "Trenajyor", "Dasturchi"],
    date: '2026-yil'
  },
  {
    id: 'maqsud-baxtiyorov',
    name: 'Maqsud </> Baxtiyorov',
    telegramUsername: '@maqsud_baxtiyorov',
    telegramUrl: 'https://t.me/maqsud_baxtiyorov',
    role: 'Speedway Bellashuvchisi',
    roleIcon: 'battle',
    avatarInitials: 'MB',
    rating: 5,
    text: "menga battle qo'shilganligi yoqdi chunki singlim ikkimiz mazza qilib bellashamiz. Raxmat ✊",
    tags: ["Speedway Battle", "1v1 Bellashuv", "Oilaviy Poyga"],
    date: '2026-yil'
  }
];

interface ReviewsViewProps {
  onBackToHome?: () => void;
  onStartTyping?: () => void;
  onGoToBattle?: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  onBackToHome,
  onStartTyping,
  onGoToBattle
}) => {
  const { uiLanguage } = useI18n();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyQuote = (review: UserReview) => {
    const textToCopy = `«${review.text}» — ${review.name} (${review.telegramUsername})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(review.id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {});
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--sub-alt)]/60 pb-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{uiLanguage === 'ru' ? 'Главная' : uiLanguage === 'en' ? 'Back to Home' : 'Bosh Sahifa'}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-bold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Haqiqiy Foydalanuvchilar Fikrlari</span>
        </div>
      </div>

      {/* Main Header Presentation */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20 mb-1">
          <Quote className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-color)] tracking-tight">
          Sayt Haqida Foydalanuvchilar Fikri
        </h1>

        <p className="text-sm sm:text-base text-[var(--sub-color)] leading-relaxed">
          Yolnoma platformasida har kuni mashq qilayotgan va bellashayotgan dasturchilar hamda o'rganuvchilarning samimiy fikrlari.
        </p>

        {/* Quick Highlights Counters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[var(--sub-color)]">Jami fikrlar:</span>
            <strong className="text-[var(--text-color)]">{COMMUNITY_REVIEWS.length} ta</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-xs font-mono">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[var(--sub-color)]">O'rtacha baho:</span>
            <strong className="text-amber-400 font-bold">5.0 / 5.0</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--sub-alt)] text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">100% Haqiqiy Shaxslar</span>
          </div>
        </div>
      </div>

      {/* Reviews Grid (Crisp, High-Quality Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {COMMUNITY_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-amber-500/40 shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            {/* Top Row: User Avatar, Name, Verified Badge & Telegram */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar with role icon badge */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[var(--sub-alt)] to-rose-500/20 border border-[var(--sub-alt)] flex items-center justify-center font-mono font-black text-base text-[var(--text-color)] shadow-sm">
                      {review.avatarInitials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-[var(--card-bg)] border border-[var(--sub-alt)] flex items-center justify-center text-[var(--main-color)]">
                      {review.roleIcon === 'code' ? (
                        <Code2 className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <Swords className="w-3 h-3 text-rose-400" />
                      )}
                    </div>
                  </div>

                  {/* Name and role */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm sm:text-base text-[var(--text-color)] group-hover:text-[var(--main-color)] transition-colors">
                        {review.name}
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" title="Tasdiqlangan foydalanuvchi" />
                    </div>
                    <p className="text-[11px] font-mono text-[var(--sub-color)]">
                      {review.role}
                    </p>
                  </div>
                </div>

                {/* Rating 5 stars */}
                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Quote Body */}
              <div className="relative bg-[var(--sub-alt)]/25 rounded-2xl p-4 border border-[var(--sub-alt)]/60">
                <Quote className="w-5 h-5 text-amber-400/40 mb-1.5" />
                <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed font-medium">
                  {review.text}
                </p>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-lg bg-[var(--sub-alt)]/40 border border-[var(--sub-alt)] text-[10px] font-mono text-[var(--sub-color)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Footer of Card: Telegram Profile Link & Copy Action */}
            <div className="pt-4 mt-4 border-t border-[var(--sub-alt)]/60 flex items-center justify-between gap-2">
              <a
                href={review.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-bold font-mono transition-all"
                title={`${review.name} ning Telegram profilini ochish`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{review.telegramUsername}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => handleCopyQuote(review)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--sub-alt)]/40 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Fikr matnini nusxalash"
              >
                {copiedId === review.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-bold hidden sm:inline">Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Nusxalash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Feedback Banner: Community invite */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--card-bg)] to-amber-500/10 border border-[var(--sub-alt)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-black text-sm sm:text-base text-[var(--text-color)]">
              Siz ham Yolnoma haqida o'z fikringizni bildirmoqchimisiz?
            </h4>
          </div>
          <p className="text-xs text-[var(--sub-color)] leading-relaxed">
            Bizga Telegram orqali o'z fikringiz, tavsiyalaringiz yoki taassurotlaringizni yuboring. Eng sara fikrlar sahifaga rasmiy kiritiladi!
          </p>
        </div>

        <a
          href="https://t.me/yolnoma_uz1"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white font-bold text-xs shadow-md shadow-[#229ED9]/25 transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Telegram'da Fikr Qoldirish</span>
        </a>
      </div>

      {/* Action Buttons to Keep Typing */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onStartTyping && (
          <button
            onClick={onStartTyping}
            className="px-6 py-3 rounded-2xl bg-[var(--main-color)] hover:brightness-105 text-white font-black text-sm shadow-lg shadow-[var(--main-color)]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>Tez Yozish Trenajyori</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {onGoToBattle && (
          <button
            onClick={onGoToBattle}
            className="px-5 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Swords className="w-4 h-4 text-rose-400" />
            <span>Speedway Battle Arenasi</span>
          </button>
        )}
      </div>
    </div>
  );
};
