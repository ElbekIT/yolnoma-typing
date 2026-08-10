import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Trophy,
  Zap,
  Users,
  Play,
  RotateCcw,
  Crown,
  Sparkles,
  Flame,
  CheckCircle2,
  Copy,
  PlusCircle,
  Share2,
  Target,
  Bot,
  Link,
  Check,
  AlertCircle
} from 'lucide-react';
import { RaceTrack, RacerProgress } from './RaceTrack';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getLanguageInfo } from '../../config/languages';
import { calculateWpm, calculateAccuracy } from '../../utils/typingEngine';
import { rtdb } from '../../config/firebase';
import { ref, set, onValue, update, remove, get } from 'firebase/database';

interface RealPlayerItem {
  uid: string;
  displayName: string;
  username: string;
  highestWpm: number;
  highestAccuracy: number;
  avatarUrl: string;
  lastActive?: number;
  country?: string;
  level?: number;
}

// Generate 8-character custom room code (e.g. "14shH4$s")
const generate8CharRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!$#@';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const BattleView: React.FC = () => {
  const { user, profile } = useAuth();
  const { language } = useSettings();

  // Match States: 'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'>('lobby');

  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number>(5);

  // Text & Typing Engine
  const [targetText, setTargetText] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');

  // Real Players from Firebase RTDB
  const [realPlayers, setRealPlayers] = useState<RealPlayerItem[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);

  // Guest ID fallback
  const getGuestId = () => {
    let gid = localStorage.getItem('yolnoma_guest_id');
    if (!gid) {
      gid = `guest_${Math.floor(10000 + Math.random() * 90000)}`;
      localStorage.setItem('yolnoma_guest_id', gid);
    }
    return gid;
  };

  const currentUid = user?.uid || getGuestId();
  const currentName = profile?.displayName || `Mehmon_${currentUid.slice(-4)}`;
  const currentAvatar = profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUid}`;

  // Player Stats
  const [myProgress, setMyProgress] = useState<RacerProgress>({
    id: currentUid,
    name: currentName,
    avatarUrl: currentAvatar,
    wpm: 0,
    accuracy: 100,
    progressPercent: 0,
    carColor: 'blue'
  });

  const [opponentProgress, setOpponentProgress] = useState<RacerProgress>({
    id: 'opponent_id',
    name: 'Raqib (Kutilmoqda)',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Opponent',
    wpm: 0,
    accuracy: 100,
    progressPercent: 0,
    carColor: 'red',
    isBot: false
  });

  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [inviteSentStatus, setInviteSentStatus] = useState<string | null>(null);
  const [isBotMatch, setIsBotMatch] = useState<boolean>(false);

  // Time & Refs
  const startTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const roomUnsubRef = useRef<(() => void) | null>(null);

  // Load Real Users from Firebase RTDB Leaderboard node
  useEffect(() => {
    try {
      const leaderboardRef = ref(rtdb, 'leaderboard');
      const unsub = onValue(leaderboardRef, (snapshot) => {
        setLoadingPlayers(false);
        if (snapshot.exists()) {
          const val = snapshot.val();
          const items: RealPlayerItem[] = [];
          Object.keys(val).forEach((key) => {
            const p = val[key];
            if (p && key !== currentUid) {
              items.push({
                uid: key,
                displayName: p.displayName || p.username || 'Typer',
                username: p.username || 'typer',
                highestWpm: p.highestWpm || 0,
                highestAccuracy: p.highestAccuracy || 0,
                avatarUrl: p.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`,
                lastActive: p.lastActive || Date.now(),
                country: p.country || '🇺🇿 Uzbekistan',
                level: p.level || 1
              });
            }
          });
          // Sort by WPM descending
          items.sort((a, b) => b.highestWpm - a.highestWpm);
          setRealPlayers(items);
        } else {
          setRealPlayers([]);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Load RTDB real players error:', e);
      setLoadingPlayers(false);
    }
  }, [currentUid]);

  // Generate random race text
  const generateBattleText = () => {
    const langInfo = getLanguageInfo(language);
    if (langInfo.sentences && langInfo.sentences.length >= 2) {
      const shuffled = [...langInfo.sentences].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2).join(' ');
    }
    return langInfo.words.slice(0, 22).join(' ');
  };

  // 1. Create a Custom 8-Character Room (e.g. "14shH4$s")
  const handleCreateRoom = async () => {
    setJoinError(null);
    const code = generate8CharRoomCode();
    const text = generateBattleText();

    setActiveRoomCode(code);
    setTargetText(text);
    setIsHost(true);
    setIsBotMatch(false);
    setGameState('waiting');

    const initialHostData: RacerProgress = {
      id: currentUid,
      name: currentName,
      avatarUrl: currentAvatar,
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'blue'
    };

    setMyProgress(initialHostData);
    setOpponentProgress({
      id: 'waiting',
      name: "Ikkinchi O'yinchini Kutilmoqda...",
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=waiting',
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'red'
    });

    // Write room to Firebase Realtime Database
    try {
      await set(ref(rtdb, `battles/rooms/${code}`), {
        code,
        host: initialHostData,
        guest: null,
        targetText: text,
        status: 'waiting',
        winnerUid: null,
        createdAt: Date.now()
      });

      // Listen to room updates
      listenToRoom(code, true);
    } catch (err) {
      console.error('Failed to create RTDB room:', err);
    }
  };

  // 2. Join Room using 8-Character Code
  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = (codeToJoin || inputRoomCode).trim();
    if (!code) {
      setJoinError('Iltimos, 8 xonali xona kodini kiriting!');
      return;
    }

    setJoinError(null);
    try {
      const snapshot = await get(ref(rtdb, `battles/rooms/${code}`));
      if (!snapshot.exists()) {
        setJoinError(`"${code}" kodi bo'yicha xona topilmadi! Kodni tekshirib qayta kiriting.`);
        return;
      }

      const roomVal = snapshot.val();
      if (roomVal.status !== 'waiting' && roomVal.guest?.id !== currentUid) {
        setJoinError('Bu xonada poyga allaqachon boshlangan yoki to\'la!');
        return;
      }

      setActiveRoomCode(code);
      setTargetText(roomVal.targetText);
      setIsHost(false);
      setIsBotMatch(false);

      const guestData: RacerProgress = {
        id: currentUid,
        name: currentName,
        avatarUrl: currentAvatar,
        wpm: 0,
        accuracy: 100,
        progressPercent: 0,
        carColor: 'red'
      };

      setMyProgress(guestData);
      setOpponentProgress(roomVal.host);

      // Join room in Firebase & set status to 'countdown'
      await update(ref(rtdb, `battles/rooms/${code}`), {
        guest: guestData,
        status: 'countdown'
      });

      // Listen to room updates
      listenToRoom(code, false);
    } catch (err) {
      console.error('Error joining RTDB room:', err);
      setJoinError('Xonaga ulanishda xatolik yuz berdi.');
    }
  };

  // Real-time listener for Room updates
  const listenToRoom = (code: string, amIHost: boolean) => {
    if (roomUnsubRef.current) roomUnsubRef.current();

    const roomRef = ref(rtdb, `battles/rooms/${code}`);
    const unsub = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();

      const myRoleData = amIHost ? data.host : data.guest;
      const opponentRoleData = amIHost ? data.guest : data.host;

      if (opponentRoleData) {
        setOpponentProgress(opponentRoleData);
      }

      // Handle status transitions
      if (data.status === 'countdown' && gameState === 'waiting') {
        start5SecCountdown();
      }

      if (data.status === 'racing' && gameState === 'countdown') {
        setGameState('racing');
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      if (data.status === 'finished') {
        setGameState('finished');
        setWinnerId(data.winnerUid);
      }
    });

    roomUnsubRef.current = unsub;
  };

  // 3. Invite a Real Registered Player from the List
  const handleInvitePlayer = async (player: RealPlayerItem) => {
    const code = generate8CharRoomCode();
    setInviteSentStatus(`⚔️ @${player.username} ga taklifnoma yuborildi (Kodi: ${code}). Kutilmoqda...`);

    // Create room
    await handleCreateRoomWithCode(code);

    // Write invite into target user's Firebase RTDB inbox
    try {
      await set(ref(rtdb, `battles/invites/${player.uid}`), {
        inviteId: 'inv_' + Date.now(),
        roomId: code,
        inviterUid: currentUid,
        inviterName: currentName,
        inviterAvatar: currentAvatar,
        inviterWpm: profile?.highestWpm || 85,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('Invite send error:', err);
    }
  };

  const handleCreateRoomWithCode = async (code: string) => {
    const text = generateBattleText();
    setActiveRoomCode(code);
    setTargetText(text);
    setIsHost(true);
    setIsBotMatch(false);
    setGameState('waiting');

    const initialHostData: RacerProgress = {
      id: currentUid,
      name: currentName,
      avatarUrl: currentAvatar,
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'blue'
    };

    setMyProgress(initialHostData);

    try {
      await set(ref(rtdb, `battles/rooms/${code}`), {
        code,
        host: initialHostData,
        guest: null,
        targetText: text,
        status: 'waiting',
        winnerUid: null,
        createdAt: Date.now()
      });
      listenToRoom(code, true);
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Start Solo Practice match vs AI Bot
  const startBotMatch = () => {
    const text = generateBattleText();
    setTargetText(text);
    setTypedInput('');
    setWinnerId(null);
    setIsBotMatch(true);

    const generatedCode = generate8CharRoomCode();
    setActiveRoomCode(generatedCode);

    setMyProgress({
      id: currentUid,
      name: currentName,
      avatarUrl: currentAvatar,
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'blue'
    });

    setOpponentProgress({
      id: 'bot_id',
      name: 'Cyber_Racer_Bot',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBot',
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'red',
      isBot: true
    });

    start5SecCountdown(true, text);
  };

  // 5-Second Countdown Logic
  const start5SecCountdown = (isBot = false, textToUse?: string) => {
    setGameState('countdown');
    setCountdown(5);

    let currentCount = 5;
    const interval = setInterval(() => {
      currentCount--;
      setCountdown(currentCount);

      if (currentCount <= 0) {
        clearInterval(interval);
        setGameState('racing');
        startTimeRef.current = Date.now();

        setTimeout(() => inputRef.current?.focus(), 100);

        if (isBot || isBotMatch) {
          startBotEngine(textToUse || targetText, 85);
        }
      }
    }, 1000);
  };

  // AI Bot engine
  const startBotEngine = (text: string, botTargetWpm = 85) => {
    if (botTimerRef.current) clearInterval(botTimerRef.current);

    const totalChars = text.length;
    const durationSeconds = (totalChars / 5) / (botTargetWpm / 60);
    const intervalMs = 200;
    const steps = (durationSeconds * 1000) / intervalMs;
    let stepCount = 0;

    botTimerRef.current = setInterval(() => {
      stepCount++;
      const currentProgress = Math.min(100, (stepCount / steps) * 100);
      const elapsedSec = Math.max(1, (stepCount * intervalMs) / 1000);
      const charsTyped = Math.floor((currentProgress / 100) * totalChars);
      const liveBotWpm = calculateWpm(charsTyped, elapsedSec);

      setOpponentProgress((prev) => ({
        ...prev,
        progressPercent: currentProgress,
        wpm: liveBotWpm || botTargetWpm,
        accuracy: 98
      }));

      if (currentProgress >= 100) {
        if (botTimerRef.current) clearInterval(botTimerRef.current);
        setGameState((cg) => {
          if (cg === 'racing') {
            setWinnerId('bot_id');
            setOpponentProgress((prev) => ({ ...prev, isWinner: true }));
            return 'finished';
          }
          return cg;
        });
      }
    }, intervalMs);
  };

  // Handle My Typing Input & RTDB update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return;

    const val = e.target.value;
    setTypedInput(val);

    const elapsedSeconds = Math.max(1, (Date.now() - startTimeRef.current) / 1000);

    let correctCount = 0;
    const targetArr = targetText.split('');
    const typedArr = val.split('');

    typedArr.forEach((ch, i) => {
      if (i < targetArr.length && ch === targetArr[i]) {
        correctCount++;
      }
    });

    const liveWpm = calculateWpm(correctCount, elapsedSeconds);
    const liveAcc = calculateAccuracy(correctCount, val.length);
    const progress = Math.min(100, (val.length / Math.max(1, targetText.length)) * 100);

    const updatedMyProgress: RacerProgress = {
      ...myProgress,
      wpm: liveWpm,
      accuracy: liveAcc,
      progressPercent: progress
    };

    setMyProgress(updatedMyProgress);

    // Sync to Realtime Database if in 1v1 Room
    if (activeRoomCode && !isBotMatch) {
      const roleKey = isHost ? 'host' : 'guest';
      update(ref(rtdb, `battles/rooms/${activeRoomCode}/${roleKey}`), {
        wpm: liveWpm,
        accuracy: liveAcc,
        progressPercent: progress
      }).catch(() => {});
    }

    // Check if finished race
    if (val.length >= targetText.length) {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      setGameState('finished');
      setWinnerId(currentUid);
      setMyProgress((prev) => ({ ...prev, isWinner: true }));

      if (activeRoomCode && !isBotMatch) {
        update(ref(rtdb, `battles/rooms/${activeRoomCode}`), {
          status: 'finished',
          winnerUid: currentUid
        }).catch(() => {});
      }
    }
  };

  const handleCopyCode = () => {
    if (activeRoomCode) {
      navigator.clipboard.writeText(activeRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      if (roomUnsubRef.current) roomUnsubRef.current();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Sleek Compact Title Header */}
      <div className="bg-gradient-to-r from-[#0c1322] via-[#11192e] to-[#0c1322] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              BATTLE ARENA <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">1v1 REAL TIME</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Ishtirokchilar bilan real vaqt rejimida yozish poygasiga kirishing!
            </p>
          </div>
        </div>

        {gameState !== 'lobby' && (
          <button
            onClick={() => {
              if (botTimerRef.current) clearInterval(botTimerRef.current);
              if (roomUnsubRef.current) roomUnsubRef.current();
              setGameState('lobby');
              setActiveRoomCode('');
              setInviteSentStatus(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lobbiyga Qaytish</span>
          </button>
        )}
      </div>

      {/* Global Status Banner Notification if Invite Sent */}
      {inviteSentStatus && (
        <div className="bg-cyan-950/90 border border-cyan-500 text-cyan-200 px-4 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-between shadow-lg animate-pulse">
          <span>{inviteSentStatus}</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
      )}

      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Room Creation & Code Join Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="bg-[#0e1626] border border-cyan-500/20 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Xona Yaratish Va Kirish</span>
              </div>

              {/* Create 8-Char Custom Code Room Button */}
              <button
                onClick={handleCreateRoom}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>8-XONALI XONA YARATISH ✨</span>
              </button>

              {/* Room Code Join Box */}
              <div className="pt-2 space-y-2 border-t border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  8-Xonali Kod Bilan Kirish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value)}
                    placeholder="Masalan: 14shH4$s"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleJoinRoom()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all"
                  >
                    Kirish
                  </button>
                </div>
                {joinError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {joinError}
                  </p>
                )}
              </div>

              {/* Bot Match Fallback */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={startBotMatch}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-bold text-xs transition-all border border-slate-700"
                >
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>KIBER BOT BILAN AMALIYOT 🤖</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real Registered Players from Firebase Realtime Database */}
          <div className="md:col-span-7 bg-[#0e1626] border border-cyan-500/20 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs text-white uppercase font-mono">
                  Real Ishtirokchilar (Firebase DB)
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {realPlayers.length} Ishtirokchi
              </span>
            </div>

            {/* List of Real Players */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {loadingPlayers ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Firebase Ma'lumotlar Bazasi Yuklanmoqda...
                </div>
              ) : realPlayers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Hozircha bazada boshqa real ishtirokchilar topilmadi.
                  <p className="text-[11px] text-cyan-400 mt-1">Yuqoridagi 8-Xonali kod bilan do'stingizni poygaga taklif qiling!</p>
                </div>
              ) : (
                realPlayers.map((p, idx) => {
                  const isRecentActive = Boolean(p.lastActive && (Date.now() - p.lastActive) < 15 * 60 * 1000);

                  return (
                    <div
                      key={p.uid}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="font-mono text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                        <div className="relative shrink-0">
                          <img
                            src={p.avatarUrl}
                            alt={p.displayName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                              isRecentActive ? 'bg-emerald-500' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs text-white truncate flex items-center gap-1">
                            <span>{p.displayName}</span>
                          </h4>
                          <p className="text-[10px] text-amber-400 font-mono">
                            ⚡ {p.highestWpm} WPM Best
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInvitePlayer(p)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-[10px] uppercase tracking-wider transition-all shrink-0 active:scale-95 shadow-sm"
                      >
                        <Swords className="w-3 h-3" />
                        <span>CHAQIRISH ⚔️</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. WAITING FOR OPPONENT STATE (8-Char Code Share Screen) */}
      {gameState === 'waiting' && (
        <div className="bg-[#0e1626] border-2 border-cyan-500/50 rounded-2xl p-6 text-center text-white space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase font-mono tracking-wider text-cyan-300 flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-amber-400 animate-pulse" /> XONA YARATILDI — RIVAL KUTILMOQDA...
            </h2>
            <p className="text-xs text-slate-400">
              Quyidagi 8 xonali xona kodini nusxalab do'stingizga yuboring! U kirgach, poyga avtomobil rejimida avtomatcha boshlanadi!
            </p>
          </div>

          {/* Giant 8-Char Room Code Box */}
          <div className="bg-slate-950/90 border-2 border-cyan-400/80 p-4 rounded-2xl max-w-sm mx-auto space-y-2 shadow-inner">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              XONA KODI (8 XONALI)
            </span>
            <div className="text-3xl font-black font-mono tracking-wider text-amber-400 flex items-center justify-center gap-3">
              <span>{activeRoomCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase font-mono transition-all"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Nusxalandi! ✅' : 'Kodni Nusxalash'}</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Kutilmoqda... Do'stingiz "8-xonali kod bilan kirish" tugmasiga bu kodni kiritsin.</span>
          </div>
        </div>
      )}

      {/* 3. COUNTDOWN STATE (5, 4, 3, 2, 1) */}
      {gameState === 'countdown' && (
        <div className="bg-[#0d1322] border-2 border-cyan-500/50 rounded-2xl p-8 text-center text-white space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase font-mono tracking-wider text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" /> BATTLE TAYYORGARLIGI!
            </h2>
            <p className="text-xs text-slate-400">
              Barmoqlaringizni klaviaturaga qo'ying! 5 soniyadan so'ng poyga boshlanadi!
            </p>
          </div>

          {/* Countdown Number */}
          <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-amber-500/20 border-4 border-cyan-400 text-5xl font-black font-mono text-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-bounce">
            {countdown}
          </div>

          {/* Player vs Opponent Preview Cards */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2 border-t border-slate-800">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-2.5">
              <img src={myProgress.avatarUrl} alt="my" className="w-8 h-8 rounded-full shrink-0" />
              <div className="text-left overflow-hidden">
                <span className="text-[9px] text-cyan-400 uppercase font-mono block">Siz</span>
                <span className="text-xs font-bold text-white truncate block">{myProgress.name}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-2.5">
              <img src={opponentProgress.avatarUrl} alt="opp" className="w-8 h-8 rounded-full shrink-0" />
              <div className="text-left overflow-hidden">
                <span className="text-[9px] text-rose-400 uppercase font-mono block">Raqib</span>
                <span className="text-xs font-bold text-white truncate block">{opponentProgress.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RACING & 5. FINISHED STATE */}
      {(gameState === 'racing' || gameState === 'finished') && (
        <div className="space-y-4">
          {/* Animated Compact Race Track */}
          <RaceTrack racers={[myProgress, opponentProgress]} isRacing={gameState === 'racing'} />

          {/* Typing Engine Card */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="bg-[#0c1220] border-2 border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative cursor-text"
          >
            {/* Hidden Input field for capturing key strokes */}
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={handleInputChange}
              disabled={gameState === 'finished'}
              className="absolute opacity-0 pointer-events-none"
              autoFocus
            />

            {/* Target Text Display */}
            <div className="text-base sm:text-lg font-mono leading-relaxed tracking-wide select-none p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 min-h-28 flex flex-wrap items-center">
              {targetText.split('').map((char, index) => {
                let colorClass = 'text-slate-500';
                if (index < typedInput.length) {
                  if (typedInput[index] === char) {
                    colorClass = 'text-emerald-400 font-bold bg-emerald-950/40 rounded px-0.5';
                  } else {
                    colorClass = 'text-rose-400 font-bold bg-rose-950/60 rounded underline decoration-rose-500 px-0.5';
                  }
                } else if (index === typedInput.length) {
                  colorClass = 'text-cyan-300 font-black bg-cyan-500/30 animate-pulse underline decoration-cyan-400 px-0.5';
                }

                return (
                  <span key={index} className={colorClass}>
                    {char === ' ' ? '␣' : char}
                  </span>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-slate-400 font-mono italic">
              💡 Yozish uchun matn ustiga bosing va harflarni ketma-ket kiriting!
            </p>
          </div>

          {/* Victory Modal Overlay if Finished */}
          {gameState === 'finished' && (
            <div className="bg-gradient-to-br from-[#0c1322] to-[#131d33] border-2 border-amber-500/60 rounded-2xl p-6 text-center text-white space-y-4 shadow-2xl">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-400 mb-1 animate-bounce">
                <Crown className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase font-mono tracking-wider text-amber-400">
                  {winnerId === currentUid ? "Siz G'olib Bo'ldingiz! 🏆" : "Raqib Birinchi Yakunladi! 🏁"}
                </h2>
                <p className="text-xs text-slate-300">
                  Ajoyib poyga natijasi! Shaxsiy tezligingiz va aniqligingiz qayd etildi.
                </p>
              </div>

              {/* Match Stats Comparison Grid */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="space-y-0.5 text-left border-r border-slate-800 pr-2">
                  <span className="text-[9px] text-cyan-400 font-mono block">Sizning Natijangiz</span>
                  <p className="text-base font-black font-mono text-white">{myProgress.wpm} WPM</p>
                  <p className="text-[11px] font-mono text-emerald-400">{myProgress.accuracy}% Accuracy</p>
                </div>

                <div className="space-y-0.5 text-left pl-2">
                  <span className="text-[9px] text-rose-400 font-mono block">Raqib Natijasi</span>
                  <p className="text-base font-black font-mono text-white">{opponentProgress.wpm} WPM</p>
                  <p className="text-[11px] font-mono text-emerald-400">{opponentProgress.accuracy}% Accuracy</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setGameState('lobby')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700"
                >
                  <span>LOBBIYGA QAYTISH</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

