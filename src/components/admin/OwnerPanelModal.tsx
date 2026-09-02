import React, { useState } from 'react';
import {
  Crown,
  Globe,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  FileText,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { LanguageInfo } from '../../config/languages';
import {
  getAllLanguages,
  addCustomLanguage,
  removeCustomLanguage,
  getStoredCustomTexts,
  addCustomTextForLanguage,
  removeCustomText,
  CustomTextEntry
} from '../../utils/customContentStore';

interface OwnerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentUpdated: (selectedLangCode?: string) => void;
}

export const OwnerPanelModal: React.FC<OwnerPanelModalProps> = ({
  isOpen,
  onClose,
  onContentUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'texts' | 'languages'>('texts');

  // Languages list state
  const [languages, setLanguages] = useState<LanguageInfo[]>(getAllLanguages());

  // Custom texts list state
  const [customTexts, setCustomTexts] = useState<CustomTextEntry[]>(getStoredCustomTexts());

  // Form states for adding language
  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');
  const [newLangNative, setNewLangNative] = useState('');
  const [newLangFlag, setNewLangFlag] = useState('🌐');
  const [newLangScript, setNewLangScript] = useState('Latin');
  const [newLangDir, setNewLangDir] = useState<'ltr' | 'rtl'>('ltr');
  const [langError, setLangError] = useState('');
  const [langSuccess, setLangSuccess] = useState('');

  // Form states for adding text
  const [selectedLangCode, setSelectedLangCode] = useState(
    languages.length > 0 ? languages[0].code : 'uz-latn'
  );
  const [textTitle, setTextTitle] = useState('');
  const [textRawContent, setTextRawContent] = useState('');
  const [textError, setTextError] = useState('');
  const [textSuccess, setTextSuccess] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const refreshAll = (selectCode?: string) => {
    const updatedLangs = getAllLanguages();
    setLanguages(updatedLangs);
    setCustomTexts(getStoredCustomTexts());
    onContentUpdated(selectCode);
  };

  // Add new language handler
  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    setLangError('');
    setLangSuccess('');

    if (!newLangCode.trim() || !newLangName.trim() || !newLangNative.trim()) {
      setLangError("Iltimos, barcha zarur maydonlarni (Kod, Nomi, Mahalliy nomi) to'ldiring!");
      return;
    }

    const codeClean = newLangCode.trim().toLowerCase();

    const success = addCustomLanguage({
      code: codeClean as any,
      name: newLangName.trim(),
      nativeName: newLangNative.trim(),
      flag: newLangFlag.trim() || '🌐',
      script: newLangScript.trim() || 'Latin',
      dir: newLangDir,
      words: [],
      sentences: [],
      quotes: []
    });

    if (!success) {
      setLangError(`'${codeClean}' kodi allaqachon mavjud! Boshqa kod kiriting.`);
      return;
    }

    setLangSuccess(`Yangi til (${newLangNative}) muvaffaqiyatli qo'shildi!`);
    setSelectedLangCode(codeClean);
    setNewLangCode('');
    setNewLangName('');
    setNewLangNative('');
    setNewLangFlag('🌐');
    refreshAll(codeClean);

    setTimeout(() => setLangSuccess(''), 3000);
  };

  // Delete language handler
  const handleDeleteLanguage = (code: string) => {
    if (confirm(`Rostdan ham '${code}' tilini o'chirmoqchimisiz?`)) {
      removeCustomLanguage(code);
      refreshAll();
    }
  };

  // Add new custom text handler
  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    setTextError('');
    setTextSuccess('');

    if (!textRawContent.trim()) {
      setTextError("Iltimos, tez yozish uchun matn yoki so'zlarni kiriting!");
      return;
    }

    const entry = addCustomTextForLanguage(
      selectedLangCode,
      textRawContent,
      textTitle.trim() || undefined
    );

    setTextSuccess(
      `Muvaffaqiyatli saqlandi! (${entry.words.length} ta so'z ${selectedLangCode} tiliga qo'shildi)`
    );
    setTextTitle('');
    setTextRawContent('');
    refreshAll(selectedLangCode);

    setTimeout(() => {
      setTextSuccess('');
      onClose();
    }, 1200);
  };

  // Delete custom text handler
  const handleDeleteText = (id: string) => {
    if (confirm("Ushbu saqlangan matnni o'chirmoqchimisiz?")) {
      removeCustomText(id);
      refreshAll();
    }
  };

  // Filtered texts
  const filteredTexts = customTexts.filter((ct) => {
    const q = searchQuery.toLowerCase();
    return (
      ct.languageCode.toLowerCase().includes(q) ||
      ct.content.toLowerCase().includes(q) ||
      (ct.title && ct.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl shadow-2xl p-6 z-50 text-xs flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--sub-alt)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-[var(--text-color)]">
                  Owner Boshqaruv Paneli
                </h2>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase font-mono">
                  Owner Mode
                </span>
              </div>
              <p className="text-[11px] text-[var(--sub-color)] font-medium">
                Tez yozish uchun tillar va cheksiz matnlar qo'shish tizimi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 shrink-0 border-b border-[var(--sub-alt)]/60">
          <button
            onClick={() => setActiveTab('texts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition-all cursor-pointer ${
              activeTab === 'texts'
                ? 'bg-[var(--main-color)] text-white shadow-lg shadow-[var(--main-color)]/25'
                : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Matnlar & So'zlar Kiratish</span>
            <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
              {customTexts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition-all cursor-pointer ${
              activeTab === 'languages'
                ? 'bg-[var(--main-color)] text-white shadow-lg shadow-[var(--main-color)]/25'
                : 'bg-[var(--sub-alt)]/50 text-[var(--sub-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Tillar Boshqaruvi</span>
            <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
              {languages.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-6">
          {/* TAB 1: TEXTS & WORDS MANAGEMENT */}
          {activeTab === 'texts' && (
            <div className="space-y-6">
              {/* Form to Add New Text */}
              <form
                onSubmit={handleAddText}
                className="bg-[var(--sub-alt)]/40 p-5 rounded-2xl border border-[var(--sub-alt)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-color)]">
                    <Sparkles className="w-4 h-4 text-[var(--main-color)]" />
                    <span>Yangi Matn yoki So'zlar Qo'shish</span>
                  </div>
                  <span className="text-[11px] text-[var(--sub-color)] font-mono">
                    Cheksiz uzunlikdagi matn
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Target Language Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--sub-color)] mb-1">
                      Qaysi til uchun:
                    </label>
                    <select
                      value={selectedLangCode}
                      onChange={(e) => setSelectedLangCode(e.target.value)}
                      className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)] cursor-pointer"
                    >
                      {languages.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.nativeName} ({l.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title / Label */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--sub-color)] mb-1">
                      Matn Nomi / Sarlavha (Ixtiyoriy):
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Maxsus Mashq #1"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>
                </div>

                {/* Text Content Field (No limit) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-[var(--sub-color)]">
                      Matn yoki So'zlar (Cheklanmagan Hajm):
                    </label>
                    <span className="text-[10px] font-mono text-[var(--main-color)] font-bold">
                      So'zlar soni:{' '}
                      {textRawContent.trim() ? textRawContent.trim().split(/\s+/).length : 0} ta
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Bu yerga istalgan uzunlikdagi matn, hikoya yoki so'zlarni kiriting..."
                    value={textRawContent}
                    onChange={(e) => setTextRawContent(e.target.value)}
                    className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl p-3 text-xs font-mono text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)] resize-y"
                  />
                </div>

                {textError && (
                  <p className="text-red-400 font-bold text-xs bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    {textError}
                  </p>
                )}

                {textSuccess && (
                  <p className="text-emerald-400 font-bold text-xs bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{textSuccess}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--main-color)] text-white font-extrabold text-xs shadow-lg shadow-[var(--main-color)]/30 hover:opacity-90 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash & Foydalanuvchilarga Chiqarish</span>
                </button>
              </form>

              {/* Saved Custom Texts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-[var(--sub-color)]">
                    Saqlangan Maxsus Matnlar Ro'yxati
                  </h3>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-[var(--sub-color)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Izlash..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 rounded-lg bg-[var(--sub-alt)]/60 border border-[var(--sub-alt)] text-[11px] text-[var(--text-color)] placeholder-[var(--sub-color)] focus:outline-none"
                    />
                  </div>
                </div>

                {filteredTexts.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {filteredTexts.map((ct) => {
                      const langObj = languages.find((l) => l.code === ct.languageCode);
                      return (
                        <div
                          key={ct.id}
                          className="bg-[var(--sub-alt)]/40 p-3.5 rounded-2xl border border-[var(--sub-alt)] flex items-start justify-between gap-3 hover:border-[var(--main-color)]/40 transition-all"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{langObj?.flag || '🌐'}</span>
                              <span className="font-extrabold text-xs text-[var(--text-color)]">
                                {ct.title}
                              </span>
                              <span className="text-[10px] font-mono bg-[var(--main-color)]/15 text-[var(--main-color)] px-1.5 py-0.5 rounded font-black">
                                {ct.languageCode}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--sub-color)]">
                                {ct.words.length} ta so'z
                              </span>
                            </div>

                            <p className="text-[11px] text-[var(--sub-color)] line-clamp-2 font-mono leading-relaxed bg-[var(--card-bg)]/60 p-2 rounded-xl">
                              "{ct.content}"
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteText(ct.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer shrink-0"
                            title="Matnni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-[var(--sub-alt)] text-center text-[var(--sub-color)] space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto opacity-40 text-[var(--main-color)]" />
                    <p className="text-xs font-bold">Hozircha saqlangan maxsus matnlar yo'q</p>
                    <p className="text-[11px]">Yuqoridagi forma orqali birinchi matningizni qo'shing.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LANGUAGES MANAGEMENT */}
          {activeTab === 'languages' && (
            <div className="space-y-6">
              {/* Form to Add New Language */}
              <form
                onSubmit={handleAddLanguage}
                className="bg-[var(--sub-alt)]/40 p-5 rounded-2xl border border-[var(--sub-alt)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-color)]">
                    <Globe className="w-4 h-4 text-[var(--main-color)]" />
                    <span>Yangi Til Qo'shish</span>
                  </div>
                  <span className="text-[11px] text-[var(--sub-color)] font-mono">
                    Istalgan til va alifbo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Language Code */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--sub-color)] mb-1">
                      Til kodi (Unikal kiritilsin, masalan: uz-kr, tr, de):
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: uz-kr"
                      value={newLangCode}
                      onChange={(e) => setNewLangCode(e.target.value)}
                      className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>

                  {/* Native Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--sub-color)] mb-1">
                      Mahalliy Nomi (Native Name):
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Ўзбекcha (Кирилл)"
                      value={newLangNative}
                      onChange={(e) => setNewLangNative(e.target.value)}
                      className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>

                  {/* English Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--sub-color)] mb-1">
                      Inglizcha Nomi:
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Uzbek (Cyrillic)"
                      value={newLangName}
                      onChange={(e) => setNewLangName(e.target.value)}
                      className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>

                  {/* Flag Emoji */}
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--sub-color)] mb-1">
                      Bayroq Emojisi:
                    </label>
                    <input
                      type="text"
                      placeholder="🇺🇿"
                      value={newLangFlag}
                      onChange={(e) => setNewLangFlag(e.target.value)}
                      className="w-full bg-[var(--sub-alt)] border border-[var(--sub-alt)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-color)] placeholder-[var(--sub-color)]/60 focus:outline-none focus:border-[var(--main-color)]"
                    />
                  </div>
                </div>

                {langError && (
                  <p className="text-red-400 font-bold text-xs bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    {langError}
                  </p>
                )}

                {langSuccess && (
                  <p className="text-emerald-400 font-bold text-xs bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{langSuccess}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--main-color)] text-white font-extrabold text-xs shadow-lg shadow-[var(--main-color)]/30 hover:opacity-90 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Tilni Tizimga Qo'shish</span>
                </button>
              </form>

              {/* Current Languages List */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-[var(--sub-color)]">
                  Mavjud Tillar Ro'yxati ({languages.length} ta)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {languages.map((l) => (
                    <div
                      key={l.code}
                      className="bg-[var(--sub-alt)]/40 p-3 rounded-2xl border border-[var(--sub-alt)] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">{l.flag}</span>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-[var(--text-color)] truncate">
                            {l.nativeName}
                          </div>
                          <div className="text-[10px] text-[var(--sub-color)] font-mono">
                            {l.code} • {l.name}
                          </div>
                        </div>
                      </div>

                      {/* Allow deleting custom languages only */}
                      {l.code !== 'uz-latn' && l.code !== 'uz-cyrl' && l.code !== 'en' && l.code !== 'ru' && (
                        <button
                          onClick={() => handleDeleteLanguage(l.code)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer shrink-0"
                          title="Tilni o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
