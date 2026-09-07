import React, { useState, useEffect } from 'react';
import { X, Shield, HelpCircle, FileText, Zap, ShieldAlert, Users, UserX, Crown, Clock, Wrench, Sparkles, AlertTriangle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'faq' | 'privacy' | 'terms' | 'updates';
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, initialTab = 'faq' }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'privacy' | 'terms' | 'updates'>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-8 shadow-2xl text-[var(--text-color)] max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--main-color)] text-white flex items-center justify-center font-bold text-lg shadow-md">
            Y
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Yolnoma Typing Platform</h2>
            <p className="text-xs text-[var(--sub-color)]">Multi-Language Touch Typing & Fair Competition Ecosystem</p>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--sub-alt)] mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('updates')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'updates'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Yangilanishlar (v2.7)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-black text-[9px]">
              Yangi
            </span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'faq'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Savol-Javoblar (FAQ)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Maxfiylik Siyosati</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Qoidalar & Shartlar</span>
          </button>
        </div>

        {/* Tab Content: UPDATES (v2.7 Changelog) */}
        {activeTab === 'updates' && (
          <div className="space-y-4 text-xs">
            {/* Version 2.7 - LATEST */}
            <div className="p-4.5 rounded-2xl bg-[var(--sub-alt)] border border-amber-500/40 space-y-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-[var(--text-color)]">v2.7</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Eng Soʻnggi Reliz
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[var(--sub-color)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2026-yil Mart</span>
                </div>
              </div>

              <h4 className="font-bold text-[var(--text-color)] text-xs sm:text-sm">
                Sababli Bloklash Tizimi, Toʻliq Admin Nazorati & Yangilanish Rejimi
              </h4>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 text-[var(--sub-color)]">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-color)]">Foydalanuvchini Sababi Bilan Bloklash:</strong> Admin foydalanuvchini bloklaganda kiritilgan aniq sabab darhol foydalanuvchi ekranida qizil kiber-kartochkada koʻrinadi. Barcha seanslar uziladi va saytga kirish toʻxtatiladi.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[var(--sub-color)]">
                  <Users className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-color)]">Adminlar Roʻyxati & Tezkor Filtr:</strong> Barcha tayinlangan administratorlar alohida "Adminlar" filtrida koʻrinadi. Ularning roli, maxsus lavozimi va ruxsatnomalari toʻliq sinxronlashadi.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[var(--sub-color)]">
                  <UserX className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-color)]">Admindan Chiqarish (Demote) Mexanizmi:</strong> Har bir admin roʻyxatida va boshqaruv panelida "Admindan Chiqarish" tugmasi mavjud. Chiqarilgan shaxsning Admin Panelga kirishi darhol bekor qilinadi.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[var(--sub-color)]">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-color)]">Sayt Yangilanishi (Maintenance Mode):</strong> Saytda texnik yangilanish ketayotganda bir tugma orqali barcha oddiy foydalanuvchilarga sayt yopiladi va yangilanish haqida jonli xabarnoma koʻrsatiladi. Bosh Administrator uchun sayt ochiq qoladi.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[var(--sub-color)]">
                  <Crown className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-color)]">Bosh Administrator Mutlaq Daxlsizligi:</strong> Asosiy Bosh Administrator (<code className="text-amber-400 font-mono">yuldashivagavharoy@gmail.com</code>) server va maʼlumotlar bazasi darajasida bloklanish va kamsitilishdan himoyalangan.
                  </div>
                </div>
              </div>
            </div>

            {/* Version 2.6 */}
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[var(--text-color)]">v2.6</span>
                <span className="text-[10px] font-mono text-[var(--sub-color)]">2026-yil Fevral</span>
              </div>
              <p className="text-[var(--sub-color)] leading-relaxed">
                <strong className="text-[var(--text-color)]">Kiber-Xavfsizlik & Anti-Cheat:</strong> Avto-kliker va sunʼiy botlarga qarshi apparat darajasidagi klaviatura dinamikasi tekshiruvi va avtomatik himoya filtrlari.
              </p>
            </div>

            {/* Version 2.5 */}
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[var(--text-color)]">v2.5</span>
                <span className="text-[10px] font-mono text-[var(--sub-color)]">2026-yil Fevral</span>
              </div>
              <p className="text-[var(--sub-color)] leading-relaxed">
                <strong className="text-[var(--text-color)]">Battle Arena & PUBG Taklifnomalari:</strong> Koʻp ishtirokchili real-vaqt klaviatura poygalari va onlayn doʻstlarga bir bosishda jang taklifnomasi yuborish imkoniyati.
              </p>
            </div>

            {/* Version 2.0 */}
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[var(--text-color)]">v2.0</span>
                <span className="text-[10px] font-mono text-[var(--sub-color)]">2026-yil Yanvar</span>
              </div>
              <p className="text-[var(--sub-color)] leading-relaxed">
                <strong className="text-[var(--text-color)]">10 Barmoq Saboqlari & Mexanik Audio:</strong> Touch typing oʻrganish metodikasi va haqiqiy mexanik klaviatura (Cherry MX) tovushlari.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-color)]">WPM qanday hisoblanadi?</h4>
              <p className="text-[var(--sub-color)] leading-relaxed">
                Words Per Minute (WPM) toʻgʻri kiritilgan barcha belgilarni 5 ga boʻlish va sarflangan daqiqaga boʻlish orqali aniqlanadi: <code className="font-mono bg-black/20 px-1 py-0.5 rounded text-[var(--main-color)]">((Toʻgʻri Belgilar / 5) / Daqiqa)</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-color)]">Oʻngdan chapga yoziladigan (RTL) tillar bormi?</h4>
              <p className="text-[var(--sub-color)] leading-relaxed">
                Ha! Arab, Fors, Ibroniy va Urdu tillari toʻliq RTL yoʻnalishida, toʻgʻri harakatlanuvchi kursor va maxsus shriftlar bilan ishlaydi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-color)]">Qanday tezkor tugmalar mavjud?</h4>
              <p className="text-[var(--sub-color)] leading-relaxed">
                Testni qayta boshlash uchun <span className="font-bold text-[var(--text-color)]">Tab + Enter</span> tugmalarini bosing. Kursor yoki matndan chiqish uchun <span className="font-bold text-[var(--text-color)]">Esc</span> tugmasidan foydalaning.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: PRIVACY */}
        {activeTab === 'privacy' && (
          <div className="space-y-3 text-xs text-[var(--sub-color)] leading-relaxed">
            <p>
              Sizning maxfiyligingiz biz uchun muhim. Yolnoma Typing platformasi barcha foydalanuvchi hisoblarini va test natijalarini xavfsiz shifrlangan maʼlumotlar bazasida saqlaydi.
            </p>
            <p>
              Parollar Firebase Authentication xizmati orqali xavfsiz himoyalanadi va hech kim, hatto tizim maʼmurlari ham parolingizni ochiq koʻra olmaydi.
            </p>
          </div>
        )}

        {/* Tab Content: TERMS */}
        {activeTab === 'terms' && (
          <div className="space-y-3 text-xs text-[var(--sub-color)] leading-relaxed">
            <p>
              Yolnoma Typing platformasidan foydalanish orqali siz halol musobaqa qoidalariga rioya qilishga, brauzer orqali cheat skriptlar yoki avto-kliker bot dasturlarini ishlatmaslikka rozilik bildirasiz.
            </p>
            <p>
              Noloyiq usullar orqali qoʻlga kiritilgan reyting natijalari avtomatik tarzda yoki adminlar tomonidan oʻchirib tashlanadi va hisob darhol bloklanadi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
