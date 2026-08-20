import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Send,
  Sparkles,
  AlertCircle,
  ExternalLink,
  CheckCheck,
  Eye,
  EyeOff,
  Filter,
  Trophy,
  Zap,
  Shield,
  CornerDownRight,
  X
} from 'lucide-react';
import { rtdb } from '../../config/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { AdminInboxMessage, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AdminInboxTabProps {
  onReplyToUser?: (user: UserProfile) => void;
}

export const AdminInboxTab: React.FC<AdminInboxTabProps> = () => {
  const { sendAdminNotification } = useAuth();
  const [messages, setMessages] = useState<AdminInboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState<AdminInboxMessage | null>(null);
  const [replyTitle, setReplyTitle] = useState('Admin javobi / Murojaatingiz bo\'yicha');
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  // Realtime Firebase RTDB listener for admin messages
  useEffect(() => {
    const messagesRef = ref(rtdb, 'admin_messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded: AdminInboxMessage[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        // Sort newest first
        loaded.sort((a, b) => b.timestamp - a.timestamp);
        setMessages(loaded);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteMessage = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" tomonidan yuborilgan murojaatni o'chirib tashlamoqchimisiz?`)) {
      return;
    }
    try {
      await remove(ref(rtdb, `admin_messages/${id}`));
    } catch (err) {
      alert('Xabarni o\'chirishda xatolik: ' + err);
    }
  };

  const handleToggleRead = async (msg: AdminInboxMessage) => {
    try {
      await update(ref(rtdb, `admin_messages/${msg.id}`), {
        isRead: !msg.isRead,
        status: !msg.isRead ? 'read' : 'unread'
      });
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadMsgs = messages.filter((m) => !m.isRead);
    if (unreadMsgs.length === 0) return;

    try {
      const updates: Record<string, any> = {};
      unreadMsgs.forEach((m) => {
        updates[`admin_messages/${m.id}/isRead`] = true;
        updates[`admin_messages/${m.id}/status`] = 'read';
      });
      await update(ref(rtdb), updates);
    } catch (err) {
      alert('Barchasini o\'qilgan deb belgilashda xatolik: ' + err);
    }
  };

  const handleClearAllRead = async () => {
    const readMsgs = messages.filter((m) => m.isRead);
    if (readMsgs.length === 0) {
      alert('O\'chirish uchun o\'qilgan xabarlar mavjud emas.');
      return;
    }
    if (!window.confirm(`Barcha o'qilgan (${readMsgs.length} ta) xabarlarni tozalashni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      const updates: Record<string, any> = {};
      readMsgs.forEach((m) => {
        updates[`admin_messages/${m.id}`] = null;
      });
      await update(ref(rtdb), updates);
    } catch (err) {
      alert('Xabarlarni tozalashda xatolik: ' + err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const targetUid = replyTarget.userContext?.uid;
      if (targetUid) {
        // Send system notification to user
        await sendAdminNotification(
          replyTitle.trim(),
          replyText.trim(),
          'info',
          targetUid,
          replyTarget.userContext?.displayName || replyTarget.name
        );
      }

      // Mark message as replied in RTDB
      await update(ref(rtdb, `admin_messages/${replyTarget.id}`), {
        isRead: true,
        status: 'replied',
        adminReply: {
          text: replyText.trim(),
          timestamp: Date.now()
        }
      });

      setReplySuccess(true);
      setTimeout(() => {
        setReplySuccess(false);
        setReplyTarget(null);
        setReplyText('');
      }, 1800);
    } catch (err) {
      alert('Javob yuborishda xatolik: ' + err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const membersCount = messages.filter((m) => m.userContext?.isAuth).length;
  const guestsCount = messages.filter((m) => !m.userContext?.isAuth).length;

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.userContext?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.userContext?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'unread') return !msg.isRead;
    if (filterStatus === 'read') return msg.isRead;
    return true;
  });

  const formatDate = (ts: number) => {
    if (!ts) return 'Noma\'lum sana';
    return new Date(ts).toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] uppercase tracking-wider block">
              Jami Murojaatlar
            </span>
            <span className="text-2xl font-mono font-black text-white">{messages.length}</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] uppercase tracking-wider block">
              Yangi / O'qilmagan
            </span>
            <span className="text-2xl font-mono font-black text-amber-400">
              {unreadCount}
            </span>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl relative">
            <Sparkles className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] uppercase tracking-wider block">
              A'zolar Murojaati
            </span>
            <span className="text-2xl font-mono font-black text-emerald-400">{membersCount}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--sub-color)] uppercase tracking-wider block">
              Mehmonlar
            </span>
            <span className="text-2xl font-mono font-black text-slate-300">{guestsCount}</span>
          </div>
          <div className="p-3 bg-slate-500/10 text-slate-300 rounded-xl">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--sub-alt)] p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--sub-color)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Murojaatlarni qidirish (ism, xabar, telefon)..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-[var(--text-color)] focus:outline-none focus:border-[var(--main-color)]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
          <div className="flex items-center gap-1 bg-[var(--bg-color)] p-1 rounded-xl border border-[var(--sub-alt)]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-white'
              }`}
            >
              Barchasi ({messages.length})
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filterStatus === 'unread'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-white'
              }`}
            >
              Yangi ({unreadCount})
            </button>
            <button
              onClick={() => setFilterStatus('read')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filterStatus === 'read'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-[var(--sub-color)] hover:text-white'
              }`}
            >
              O'qilgan ({messages.length - unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-2 bg-[var(--sub-alt)] text-[var(--text-color)] hover:text-amber-400 border border-[var(--sub-alt)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Barcha yangi xabarlarni o'qilgan deb belgilash"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Barchasini O'qilgan Qilish</span>
            </button>
          )}

          {messages.some((m) => m.isRead) && (
            <button
              onClick={handleClearAllRead}
              className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="O'qilgan xabarlarni tozalash"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>O'qilganlarni Tozalash</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages List Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs text-[var(--sub-color)] font-medium">Murojaatlar yuklanmoqda...</span>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-2xl text-center space-y-3">
          <div className="p-4 bg-slate-800/40 text-slate-400 rounded-full">
            <MessageSquare className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-sm font-bold text-white">Hech qanday murojaat topilmadi</h3>
          <p className="text-xs text-[var(--sub-color)] max-w-sm">
            {searchTerm
              ? 'Qidiruv bo\'yicha biror bir xabar topilmadi. Qidiruv so\'zini o\'zgartirib ko\'ring.'
              : 'Hozircha foydalanuvchilar tomonidan yangi xabarlar qoldirilmagan.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const isMember = msg.userContext?.isAuth === true;
            return (
              <div
                key={msg.id}
                className={`bg-[var(--card-bg)] border transition-all rounded-2xl p-5 shadow-lg relative overflow-hidden ${
                  !msg.isRead
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-[var(--card-bg)] to-[var(--card-bg)]'
                    : 'border-[var(--sub-alt)] hover:border-slate-700'
                }`}
              >
                {/* Unread Accent Bar */}
                {!msg.isRead && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
                )}

                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  {/* Sender Profile Header */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        {msg.name}
                      </h4>

                      {/* Status Badges */}
                      {isMember ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                          <UserCheck className="w-3 h-3" />
                          <span>Aʼzo (LVL {msg.userContext?.level || 1})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 font-mono text-[10px] font-bold">
                          <UserX className="w-3 h-3" />
                          <span>Mehmon</span>
                        </span>
                      )}

                      {!msg.isRead ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[10px] uppercase tracking-wider">
                          YANGI
                        </span>
                      ) : msg.status === 'replied' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[10px]">
                          Javob berilgan
                        </span>
                      ) : null}

                      <span className="text-[11px] text-[var(--sub-color)] flex items-center gap-1 ml-auto md:ml-0 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(msg.timestamp)}</span>
                      </span>
                    </div>

                    {/* Member Stats / Email */}
                    <div className="flex items-center gap-4 text-xs text-[var(--sub-color)] flex-wrap">
                      {msg.phone && (
                        <span className="flex items-center gap-1 text-slate-300 font-medium bg-[var(--bg-color)] px-2.5 py-1 rounded-lg border border-[var(--sub-alt)]">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{msg.phone}</span>
                        </span>
                      )}

                      {msg.userContext?.email && (
                        <span className="flex items-center gap-1 text-slate-300 font-mono bg-[var(--bg-color)] px-2.5 py-1 rounded-lg border border-[var(--sub-alt)]">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span>{msg.userContext.email}</span>
                        </span>
                      )}

                      {isMember && (
                        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span>{msg.userContext?.wpm || 0} WPM</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>{msg.userContext?.tests || 0} ta test</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="mt-3 p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.message}
                    </div>

                    {/* Previous Admin Reply if exists */}
                    {(msg as any).adminReply && (
                      <div className="mt-2 p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
                        <CornerDownRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-blue-400">Yuborilgan Admin Javobi:</span>
                          <p className="mt-0.5 text-slate-300">{(msg as any).adminReply.text}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[var(--sub-alt)]">
                    {/* Reply Button (Only for registered members with UID) */}
                    {isMember && (
                      <button
                        onClick={() => {
                          setReplyTarget(msg);
                          setReplyTitle(`Murojaatingiz bo'yicha javob (${msg.name})`);
                          setReplyText('');
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Javob Yozish</span>
                      </button>
                    )}

                    {/* Toggle Read */}
                    <button
                      onClick={() => handleToggleRead(msg)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        msg.isRead
                          ? 'bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white border-[var(--sub-alt)]'
                          : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                      }`}
                      title={msg.isRead ? 'O\'qilmagan deb belgilash' : 'O\'qilgan deb belgilash'}
                    >
                      {msg.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="hidden sm:inline">
                        {msg.isRead ? 'O\'qilmagan' : 'O\'qildi'}
                      </span>
                    </button>

                    {/* Delete Message Button */}
                    <button
                      onClick={() => handleDeleteMessage(msg.id, msg.name)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Xabarni butunlay o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">O'chirish</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card-bg)] border border-amber-500/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Foydalanuvchiga Javob Yuborish
                  </h3>
                  <p className="text-xs text-[var(--sub-color)]">
                    Qabul qiluvchi: <span className="text-white font-bold">{replyTarget.name}</span> ({replyTarget.userContext?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyTarget(null)}
                className="p-2 hover:bg-[var(--sub-alt)] text-[var(--sub-color)] hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original message quote */}
            <div className="p-3 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-slate-300">
              <span className="text-[10px] font-bold text-[var(--sub-color)] uppercase block mb-1">
                Foydalanuvchi xabari:
              </span>
              <p className="line-clamp-3 italic">"{replyTarget.message}"</p>
            </div>

            {replySuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Javobingiz foydalanuvchiga tizim xabarnomasi orqali yuborildi!</span>
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[var(--sub-color)] block mb-1">
                    Xabarnoma Sarlavhasi
                  </label>
                  <input
                    type="text"
                    value={replyTitle}
                    onChange={(e) => setReplyTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--sub-color)] block mb-1">
                    Javob Matni
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    placeholder="Foydalanuvchiga javobingizni yozing..."
                    className="w-full px-4 py-2.5 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReplyTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--sub-alt)] text-xs font-bold text-[var(--sub-color)] hover:text-white cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSendingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Yuborilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Javobni Yuborish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
