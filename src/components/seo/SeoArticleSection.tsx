import React, { useState } from 'react';
import { 
  Keyboard, 
  Gauge, 
  Award, 
  HelpCircle, 
  ChevronDown, 
  CheckCircle2, 
  Zap, 
  Target, 
  BrainCircuit, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: "Klaviaturada tez yozish nima va nima uchun 10 barmoq texnikasi kerak?",
    answer: "Klaviaturada tez yozish (touch typing yoki ko'r-ko'rona yozish) — klaviatura tugmalariga qaramasdan, mushak xotirasi (muscle memory) orqali barcha 10 barmoq bilan matn terish mahoratidir. Ushbu texnika orqali yozish tezligingiz 2-3 baravarga oshadi (daqiqasiga 60-100+ so'zgacha), diqqatni klaviaturaga emas, to'g'ridan-to'g'ri fikrlaringizga qaratasiz, ko'z va bo'yin charchog'i esa 70% ga kamayadi."
  },
  {
    question: "WPM va CPM nima, ular bir-biridan qanday farq qiladi?",
    answer: "WPM (Words Per Minute) — bir daqiqada xatosiz terilgan so'zlar sonini bildiradi. Xalqaro standart bo'yicha 1 ta so'z 5 ta bosilgan belgiga teng deb olinadi. CPM (Characters Per Minute) esa bir daqiqada bosilgan sof belgilar (harflar, belgilar va bo'shliqlar) sonidir. Masalan, 300 CPM tezlik taxminan 60 WPM ga teng bo'ladi (300 / 5 = 60)."
  },
  {
    question: "Yolnoma Typing platformasida shug'ullanish bepulmi?",
    answer: "Ha, Yolnoma Typing barcha foydalanuvchilar, o'quvchilar, talabalar va IT mutaxassislari uchun 100% mutlaqo bepul. Platformada 125 dan ortiq jahon tillari, 10 barmoq saboqlari, shaxsiy statistika tahlili, Speedway Battle janglari va O'zbekiston milliy reytingida cheklovlarsiz ishtirok etishingiz mumkin."
  },
  {
    question: "Yozish tezligini 20 WPM dan 80+ WPM ga oshirish uchun qancha vaqt kerak?",
    answer: "Har kuni atigi 15-25 daqiqa muntazam mashq qilish orqali aksariyat foydalanuvchilar 2-4 hafta ichida 40-50 WPM ga, 2-3 oy davomida esa barqaror 70-90+ WPM professional ko'rsatkichga erishadilar. Eng muhim qoida: boshida tezlikka emas, 96-98%+ aniqlikka e'tibor berishdir. Tezlik aniqlik ortidan avtomatik ravishda o'sib boradi."
  },
  {
    question: "O'zbek tilida (Lotin va Kirill alifbolarida) mashq qilsa bo'ladimi?",
    answer: "Albatta! Yolnoma Typing O'zbekiston foydalanuvchilari uchun maxsus moslashtirilgan. Siz O'zbek tili Lotin (o'zbekcha so'z boyligi, O', G', Sh, Ch harflari bilan) hamda O'zbek tili Kirill alifbolarida, shuningdek Rus, Ingliz va dasturlash tillarida (HTML, CSS, JavaScript, Python) mashqlarni bemalol bajarishingiz mumkin."
  }
];

export const SeoArticleSection: React.FC<{ onStartPractice?: () => void }> = ({ onStartPractice }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 pt-10 border-t border-[var(--sub-alt)]/60 text-[var(--text-color)] font-sans">
      {/* Article Header */}
      <header className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-[var(--main-color)]/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Foydali Qo'llanma & Yo'riqnoma</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-color)] leading-tight mb-4">
          Klaviaturada Tez Yozish va 10 Barmoq Mashqlari — Yolnoma Typing
        </h1>
        <p className="text-base sm:text-lg text-[var(--sub-color)] max-w-3xl leading-relaxed">
          O'zbekistonda klaviaturada ko'r-ko'rona tez yozish (touch typing) madaniyatini rivojlantirish, barmoqlarni to'g'ri joylashtirish, WPM tezligini oshirish va professional darajaga chiqish bo'yicha to'liq qo'llanma.
        </p>
      </header>

      {/* 2-Column Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)]/60 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--main-color)]/15 text-[var(--main-color)] flex items-center justify-center mb-4">
              <Keyboard className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2.5 text-[var(--text-color)]">
              10 Barmoq Bilan Ko'r-Ko'rona Yozish Metodikasi
            </h2>
            <p className="text-sm text-[var(--sub-color)] leading-relaxed mb-4">
              Ko'pchilik klaviaturaga qarab, atigi 2 yoki 4 barmoq bilan daqiqasiga 20-35 so'z terishga o'rganib qolgan. 
              10 barmoq qoidasi esa har bir barmoqqa aniq klavishlar hududini biriktirish orqali yozish tezligini 
              daqiqasiga 80-120+ so'zgacha olib chiqadi. Bu har qanday dasturchi, kopirayter, talaba va ofis xodimi uchun kuniga kamida 1.5-2 soat vaqtni tejaydi.
            </p>
          </div>
          <div className="pt-3 border-t border-[var(--sub-alt)]/40 flex items-center justify-between text-xs text-[var(--sub-color)] font-mono">
            <span>Standart: ASDF - JKL;</span>
            <span className="text-[var(--main-color)] font-bold">100% Mushak Xotirasi</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--sub-alt)]/25 border border-[var(--sub-alt)]/60 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Gauge className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2.5 text-[var(--text-color)]">
              WPM va CPM: Tezlikni To'g'ri O'lchash Formulalari
            </h2>
            <p className="text-sm text-[var(--sub-color)] leading-relaxed mb-4">
              Tezlikni baholashda ikkita asosiy metrika qo'llaniladi:
              <br />
              <strong className="text-[var(--text-color)] font-mono">• WPM (Words Per Minute):</strong> Bir daqiqada yozilgan toza so'zlar soni. Xalqaro qoidaga ko'ra, har 5 ta belgi (jumladan probel) 1 ta so'z hisoblanadi. Formula: <code className="text-xs bg-[var(--bg-color)] px-1.5 py-0.5 rounded text-[var(--main-color)]">WPM = (Jami belgilar / 5) / Sarflangan daqiqa</code>.
              <br />
              <strong className="text-[var(--text-color)] font-mono">• CPM (Characters Per Minute):</strong> Bir daqiqada bosilgan jami aniq belgilar soni. O'rtacha hisobda 50 WPM ≈ 250 CPM ga to'g'ri keladi.
            </p>
          </div>
          <div className="pt-3 border-t border-[var(--sub-alt)]/40 flex items-center justify-between text-xs text-[var(--sub-color)] font-mono">
            <span>O'rtacha ko'rsatkich: 40 WPM</span>
            <span className="text-emerald-400 font-bold">Pro: 80+ WPM</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Content: Home Row and Finger Placement */}
      <article className="space-y-10 mb-14 text-sm sm:text-base leading-relaxed text-[var(--sub-color)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2.5">
            <Target className="w-6 h-6 text-[var(--main-color)] shrink-0" />
            Boshlang'ich Holat: ASDF va JKL; Qatori ("Home Row") Qoidasi
          </h2>
          <p className="mb-4">
            Har qanday professional tipistning siri — qo'llarning doimiy asosiy qatorga (Home Row) qaytishidadir. 
            Standart QWERTY klaviaturalarida <strong className="text-[var(--text-color)]">F</strong> va <strong className="text-[var(--text-color)]">J</strong> klavishlarida maxsus bo'rtiqchalar (taktil belgilar) mavjud. Ushbu bo'rtiqchalar ko'zingizni ekrandan uzmasdan ko'rsatkich barmoqlaringizni to'g'ri joylashtirish uchun mo'ljallangan.
          </p>

          <div className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] mb-4 font-mono text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/40">
                <span className="text-[var(--main-color)] font-bold block mb-1.5">🖐️ Chap Qo'l Joylashuvi:</span>
                <ul className="space-y-1 text-xs sm:text-sm">
                  <li>• Kichik barmoq (chittak): <strong className="text-[var(--text-color)]">A</strong> klavishi</li>
                  <li>• Nomsiz barmoq: <strong className="text-[var(--text-color)]">S</strong> klavishi</li>
                  <li>• O'rta barmoq: <strong className="text-[var(--text-color)]">D</strong> klavishi</li>
                  <li>• Ko'rsatkich barmoq: <strong className="text-[var(--text-color)]">F</strong> klavishi (bo'rtiqcha bilan)</li>
                  <li>• Katta barmoq: <strong className="text-[var(--text-color)]">Space (Bo'shliq)</strong> tugmasi</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/40">
                <span className="text-[var(--main-color)] font-bold block mb-1.5">🖐️ O'ng Qo'l Joylashuvi:</span>
                <ul className="space-y-1 text-xs sm:text-sm">
                  <li>• Ko'rsatkich barmoq: <strong className="text-[var(--text-color)]">J</strong> klavishi (bo'rtiqcha bilan)</li>
                  <li>• O'rta barmoq: <strong className="text-[var(--text-color)]">K</strong> klavishi</li>
                  <li>• Nomsiz barmoq: <strong className="text-[var(--text-color)]">L</strong> klavishi</li>
                  <li>• Kichik barmoq (chittak): <strong className="text-[var(--text-color)]">;</strong> yoki <strong className="text-[var(--text-color)]">'</strong> klavishi</li>
                  <li>• Katta barmoq: <strong className="text-[var(--text-color)]">Space (Bo'shliq)</strong> tugmasi</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[var(--sub-color)]/90">
            Har bir harfni bosgach, barmoqlaringiz darhol o'zining asosiy bazaviy holatiga qaytishi lozim. Bu mashq mushak xotirasini shakllantiradi va vaqt o'tishi bilan miyangiz klavish qayerdaligini o'ylab o'tirmasdan, avtomatik tarzda buyruq beradi.
          </p>
        </div>

        {/* 5 Professional Tips to go from 20 WPM to 80+ WPM */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400 shrink-0" />
            Tezlikni 20 WPM dan 80+ WPM ga Oshirish Bo'yicha 5 Ta Oltin Qoida
          </h2>
          <div className="space-y-3.5">
            <div className="p-4 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/50 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-color)] mb-1">
                  Klaviaturaga Mutlaqo Qaramang
                </h3>
                <p className="text-sm text-[var(--sub-color)]">
                  Boshlanishida adashasiz va sekin yozasiz — bu tabiiy jarayon. Agar barmoq qaysi klavishdaligini bilmasa, ekrandagi virtual klaviaturaga qarang, lekin aslo qo'lingizga qaramang. Faqat shundagina miya taktil sezgi va oraliq masofani eslab qoladi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/50 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-color)] mb-1">
                  Aniqlik (Accuracy) — Tezlikdan Ustun
                </h3>
                <p className="text-sm text-[var(--sub-color)]">
                  Tez yozishga shoshilmang! Har bir xatoni to'g'irlash uchun Backspace tugmasini bosish sizdan kamida 1-2 soniya olib qo'yadi. Agar aniqligingiz 97% dan past bo'lsa, tezlikni sekinlashtiring va xatosiz yozishga odatlaning. Aniqlik barqaror bo'lgach, tezlik o'z-o'zidan oshadi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/50 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-color)] mb-1">
                  Bir Maromda (Ritmik) Yozishga O'rganing
                </h3>
                <p className="text-sm text-[var(--sub-color)]">
                  Har bir klavishni bir xil vaqt oralig'ida (metronom kabi) bosing: "taq... taq... taq...". Oson harflarni tez bosib, qiyinlarida to'xtab qolish xatoliklarga sabab bo'ladi. Bir tekis ritm bilan yozish charchoqni oldini oladi va yozish jarayonini meditatsiyaga aylantiradi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/50 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-color)] mb-1">
                  To'g'ri Qad-Qomat va Ergonomika
                </h3>
                <p className="text-sm text-[var(--sub-color)]">
                  Stulda tik o'tiring, oyoqlaringiz polga to'liq tegib tursin. Tirsaklaringiz 90 daraja burchak ostida bo'lishi, bilaklar esa klaviatura yoki stol ustiga qattiq bosilmasdan erkin, yengil havoda turishi kerak. Bu bilakdagi tunnel sindromi (CTS) xavfini keskin kamaytiradi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--sub-alt)]/20 border border-[var(--sub-alt)]/50 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                5
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-color)] mb-1">
                  Kuniga 15-20 Daqiqa Muntazamlik
                </h3>
                <p className="text-sm text-[var(--sub-color)]">
                  Haftada bir marta 2 soat shug'ullangandan ko'ra, har kuni 15 daqiqadan Yolnoma platformasida test topshirish 10 barobar samaraliroq. Har kuni ertalab yoki ish oldidan 3-4 ta test topshiring, o'z statistikangizni kuzating va o'zbek tili lug'atidagi qiyin harflar ustida ishlang.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Speedway Battle & Community */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--main-color)]/10 via-[var(--sub-alt)]/20 to-transparent border border-[var(--main-color)]/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-color)] mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Jonli 1v1 Speedway Battle va Milliy Reyting
              </h2>
              <p className="text-xs sm:text-sm text-[var(--sub-color)] max-w-xl">
                O'zbekistonning eng iqtidorli tez yozuvchilari bilan real-vaqtda bellashing. Do'stlaringizga xona kodini yuborib musobaqa qiling, ballar to'plang va milliy chempionlar ro'yxatidan joy oling!
              </p>
            </div>
            {onStartPractice && (
              <button
                onClick={onStartPractice}
                className="px-5 py-2.5 rounded-xl bg-[var(--main-color)] text-white text-xs sm:text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0 font-mono"
              >
                <span>Sinab Ko'rish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </article>

      {/* FAQ Accordion Section with Rich Snippets (Schema.org friendly) */}
      <section className="mt-12 pt-8 border-t border-[var(--sub-alt)]/40" id="faq">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-[var(--main-color)]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-color)]">
            Ko'p Beriladigan Savollar (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_LIST.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--sub-alt)]/60 bg-[var(--sub-alt)]/15 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--sub-alt)]/25 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-[var(--text-color)]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--sub-color)] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[var(--main-color)]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[var(--sub-color)] leading-relaxed border-t border-[var(--sub-alt)]/30 animate-in fade-in duration-150">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SEO Footer Meta Stamp */}
      <div className="mt-10 pt-6 border-t border-[var(--sub-alt)]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--sub-color)] font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Yolnoma Typing — O'zbekistonda Tez Yozish Rasmiy Portali</span>
        </div>
        <div>
          <span>Rasmiy kanal: </span>
          <a
            href="https://t.me/yolnoma_uz1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--main-color)] hover:underline font-bold"
          >
            @yolnoma_uz1
          </a>
        </div>
      </div>
    </section>
  );
};
