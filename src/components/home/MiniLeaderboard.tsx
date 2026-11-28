import React, { useState, useEffect } from 'react';
import { Trophy, Crown, ArrowRight, LogIn, Flame, UserCheck } from 'lucide-react';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';

interface LeaderboardEntry {
 uid: string;
 name: string;
 username: string;
 avatar?: string;
 wpm: number;
 accuracy: number;
}

let cachedMiniList: LeaderboardEntry[] | null = null;
let lastMiniFetchTime = 0;

interface MiniLeaderboardProps {
 onViewFullLeaderboard: () => void;
 onOpenLogin: () => void;
}

export const MiniLeaderboard = React.memo<MiniLeaderboardProps>(({
 onViewFullLeaderboard,
 onOpenLogin
}) => {
 const { user, profile, signInWithGoogle } = useAuth();
 const { t } = useI18n();
 const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>(() => cachedMiniList || []);

 useEffect(() => {
 if (cachedMiniList && Date.now() - lastMiniFetchTime < 120000) {
 return;
 }

 let isMounted = true;
 const fetchTop = async () => {
 try {
 try {
 const apiRes = await fetch('/api/leaderboard?limit=5');
 if (apiRes.ok) {
 const apiJson = await apiRes.json();
 if (apiJson.success && Array.isArray(apiJson.leaderboard) && apiJson.leaderboard.length > 0) {
 const formatted: LeaderboardEntry[] = apiJson.leaderboard.slice(0, 5).map((u: any) => ({
 uid: u.uid,
 name: u.displayName || u.username || 'Foydalanuvchi',
 username: u.username || 'user',
 avatar: u.avatarUrl || u.photoURL,
 wpm: u.highestWpm,
 accuracy: u.highestAccuracy || 98
 }));
 cachedMiniList = formatted;
 lastMiniFetchTime = Date.now();
 if (isMounted) setTopUsers(formatted);
 }
 }
 } catch {}

 const entryMap = new Map<string, LeaderboardEntry>();
 if (cachedMiniList && cachedMiniList.length > 0) {
 cachedMiniList.forEach((e) => entryMap.set(e.uid, e));
 }

 try {
 let lbSnap;
 try {
 const lbQuery = query(ref(rtdb, 'leaderboard'), orderByChild('highestWpm'), limitToLast(10));
 lbSnap = await get(lbQuery);
 } catch {
 lbSnap = await get(ref(rtdb, 'leaderboard'));
 }

 if (lbSnap && lbSnap.exists()) {
 const lbVal = lbSnap.val() || {};
 Object.keys(lbVal).forEach((uid) => {
 if (!uid || uid.startsWith('guest_') || uid.startsWith('bot_') || uid.startsWith('ai_') || uid.startsWith('seed_') || uid.startsWith('dummy_') || uid.startsWith('fake_') || uid === 'guest') {
 return;
 }
 const lb = lbVal[uid] || {};
 if (lb.isGuest || lb.isBot || lb.isBanned || lb.isBlocked) return;
 const wpm = Number(lb.highestWpm || lb.wpm || 0);
 if (wpm <= 0 || wpm > 280) return;
 const existing = entryMap.get(uid);
 entryMap.set(uid, {
 uid,
 name: lb.displayName || lb.username || existing?.name || 'Foydalanuvchi',
 username: lb.username || existing?.username || 'user',
 avatar: lb.avatarUrl || lb.photoURL || existing?.avatar,
 wpm: Math.max(wpm, existing?.wpm || 0),
 accuracy: Math.min(100, Math.max(0, Number(lb.highestAccuracy || existing?.accuracy || 98)))
 });
 });
 }
 } catch {}

 if (user?.uid && !user.uid.startsWith('bot_')) {
 const myWpm = Math.max(Number(profile?.highestWpm || 0), Number(profile?.averageWpm || 0));
 if (myWpm > 0 && myWpm <= 280) {
 const existing = entryMap.get(user.uid);
 entryMap.set(user.uid, {
 uid: user.uid,
 name: profile?.displayName || profile?.username || existing?.name || 'Siz',
 username: profile?.username || existing?.username || 'siz',
 avatar: profile?.avatarUrl || profile?.photoURL || existing?.avatar,
 wpm: Math.max(myWpm, existing?.wpm || 0),
 accuracy: Math.min(100, Math.max(0, Number(profile?.highestAccuracy || existing?.accuracy || 98)))
 });
 }
 }

 const list = Array.from(entryMap.values()).sort((a, b) => b.wpm - a.wpm).slice(0, 5);
 if (list.length > 0) {
 cachedMiniList = list;
 lastMiniFetchTime = Date.now();
 if (isMounted) setTopUsers(list);
 }
 } catch {}
 };

 fetchTop();
 return () => { isMounted = false; };
 }, [user, profile]);

 const userPersonalBest = profile?.highestWpm || 0;

 return (
 <div className="rounded-2xl bg-[var(--card-bg)] p-5 flex flex-col justify-between space-y-4">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-[var(--sub-alt)]/80 flex items-center justify-center text-amber-400">
 <Trophy className="w-4 h-4"/>
 </div>
 <div>
 <h3 className="text-sm font-bold text-[var(--text-color)]">{t('miniLeaderboardTitle')}</h3>
 <p className="text-[11px] text-[var(--sub-color)] line-clamp-1">{t('miniLeaderboardSub')}</p>
 </div>
 </div>

 <button
 onClick={onViewFullLeaderboard}
 className="text-xs font-mono font-semibold text-[var(--main-color)] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
 >
 <span>Barchasi</span>
 <ArrowRight className="w-3.5 h-3.5"/>
 </button>
 </div>

 {/* Top 5 Rows (Borderless) */}
 {topUsers.length === 0 ? (
 <div className="py-8 px-4 rounded-xl bg-[var(--sub-alt)]/30 text-center space-y-1">
 <Trophy className="w-5 h-5 text-amber-400 mx-auto"/>
 <p className="text-xs font-bold text-[var(--text-color)] font-mono">Hozircha natijalar yo'q</p>
 <p className="text-[11px] text-[var(--sub-color)]">Test topshiring va 1-o'rinni egallang!</p>
 </div>
 ) : (
 <div className="space-y-1.5">
 {topUsers.map((item, idx) => {
 const isCurrentUser = user && user.uid === item.uid;
 return (
 <div
 key={item.uid || idx}
 className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
 isCurrentUser
 ? 'bg-[var(--main-color)]/15'
 : 'bg-[var(--sub-alt)]/35 hover:bg-[var(--sub-alt)]/60'
 }`}
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <span className="w-5 text-center font-mono text-xs font-bold text-amber-400 shrink-0">
 {idx === 0 ? <Crown className="w-3.5 h-3.5 inline text-amber-400"/> : `${idx + 1}`}
 </span>

 <div className="w-6 h-6 rounded-full bg-[var(--sub-alt)] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[var(--main-color)] shrink-0">
 {item.avatar ? (
 <img src={item.avatar} alt={item.name} className="w-full h-full object-cover"referrerPolicy="no-referrer"loading="lazy"/>
 ) : (
 <span>{item.name.slice(0, 1).toUpperCase()}</span>
 )}
 </div>

 <div className="min-w-0">
 <div className="text-xs font-bold text-[var(--text-color)] truncate">{item.name}</div>
 <div className="text-[10px] text-[var(--sub-color)] font-mono">
 @{item.username.replace('@', '')} • {item.accuracy}%
 </div>
 </div>
 </div>

 <div className="flex items-center gap-1 shrink-0 pl-2 font-mono">
 <Flame className="w-3 h-3 text-amber-400"/>
 <span className="text-xs font-extrabold text-[var(--main-color)]">{item.wpm}</span>
 <span className="text-[9px] text-[var(--sub-color)]">WPM</span>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Footer CTA */}
 {user ? (
 <div className="flex items-center justify-between bg-[var(--sub-alt)]/40 rounded-xl px-3 py-2 text-xs">
 <div className="flex items-center gap-2">
 <UserCheck className="w-3.5 h-3.5 text-emerald-400"/>
 <span className="font-bold text-[var(--text-color)]">{profile?.displayName || 'Siz'}</span>
 <span className="text-emerald-400 font-mono font-bold">
 {userPersonalBest > 0 ? `${userPersonalBest} WPM`: 'Yangi'}
 </span>
 </div>
 <button onClick={onViewFullLeaderboard} className="text-[11px] font-mono text-[var(--main-color)] hover:underline cursor-pointer">
 Reyting →
 </button>
 </div>
 ) : (
 <div className="flex items-center justify-between gap-2 bg-[var(--sub-alt)]/40 rounded-xl px-3 py-2">
 <span className="text-[11px] text-[var(--sub-color)] truncate">{t('joinLeaderboardText')}</span>
 <button
 onClick={() => signInWithGoogle().catch(() => onOpenLogin())}
 className="px-3 py-1.5 rounded-lg bg-[var(--main-color)] text-[var(--bg-color,#090d16)] font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
 >
 <LogIn className="w-3 h-3"/>
 <span>Kirish</span>
 </button>
 </div>
 )}
 </div>
 );
});
