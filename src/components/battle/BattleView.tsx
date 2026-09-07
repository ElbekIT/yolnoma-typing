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
  Link as LinkIcon,
  Check,
  AlertCircle,
  Skull,
  Award,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { RaceTrack, RacerProgress } from './RaceTrack';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getLanguageInfo } from '../../config/languages';
import {
  calculateWpm,
  calculateAccuracy,
  calculateNetWpm,
  getLockedMinLength,
  getNextWordStartIndexOnSpace
} from '../../utils/typingEngine';
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

// Generate clean 6-character uppercase room code (e.g. "K7N9XP")
const generateCleanRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Uzbek & English sentences for battle tests
const BATTLE_TEXTS = [
  "Har bir muvaffaqiyat tinimsiz mehnat va sabr-toqat orqali qo'lga kiritiladi.",
  "Tez va aniq yozish ko'nikmasi zamonaviy dunyoda eng muhim malakalardan biridir.",
  "Bilim o'rganish hech qachon kech emas, har bir yangi kun yangi imkoniyatdir.",
  "Dasturlash va axborot texnologiyalari orqali dunyoni yaxshiroq qilishimiz mumkin.",
  "O'zbekiston yoshlari har sohada yetakchi bo'lishga qodir va intiluvchandir.",
  "The quick brown fox jumps over the lazy dog in a swift typing battle.",
  "Speed and precision are the true marks of a master keyboard typist.",
  "Never stop learning and improving your skills every single day."
];

interface BattleViewProps {
  initialRoomCode?: string | null;
  onClearInitialRoomCode?: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  initialRoomCode,
  onClearInitialRoomCode
}) => {
  const { user, profile, saveTestResult, addXp } = useAuth();
  const { soundEnabled } = useSettings();

  // Active user data
  const currentUid = user?.uid || localStorage.getItem('yolnoma_guest_id') || 'guest_racer';
  const currentDisplayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'Mehmon Racer');
  const currentUsername = profile?.username || 'racer';
  const currentAvatar = profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUid}`;

  // Game Lifecycle State
  const [gameState, setGameState] = useState<'lobby' | 'ready_screen' | 'countdown' | 'racing' | 'finished'>('lobby');
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [battleText, setBattleText] = useState(BATTLE_TEXTS[0]);

  // Online Users for Direct Invite
  const [onlinePlayers, setOnlinePlayers] = useState<RealPlayerItem[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [inviteSentStatus, setInviteSentStatus] = useState<string | null>(null);

  // Manual Room Code Input
  const [joinInputCode, setJoinInputCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Racer Progress
  const [myProgress, setMyProgress] = useState<RacerProgress>({
    id: currentUid,
    name: currentDisplayName,
    avatarUrl: currentAvatar,
    progressPercent: 0,
    wpm: 0,
    accuracy: 100,
    carColor: 'blue',
    isWinner: false,
    isBot: false
  });

  const [opponentProgress, setOpponentProgress] = useState<RacerProgress>({
    id: 'opp',
    name: 'Kutilmoqda...',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Waiting',
    progressPercent: 0,
    wpm: 0,
    accuracy: 100,
    carColor: 'red',
    isWinner: false,
    isBot: false
  });

  // Typing state
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [disqualifiedReason, setDisqualifiedReason] = useState<string | null>(null);

  // Refs for tracking and timers
  const inputRef = useRef<HTMLInputElement>(null);
  const botTimerRef = useRef<any>(null);
  const roomUnsubRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  // Auto handle deep link / URL room code
  useEffect(() => {
    if (initialRoomCode && gameState === 'lobby') {
      handleJoinRoom(initialRoomCode.toUpperCase().trim());
      if (onClearInitialRoomCode) onClearInitialRoomCode();
    }
  }, [initialRoomCode]);

  // Listen to Active Online Players from RTDB Leaderboard
  useEffect(() => {
    setIsLoadingPlayers(true);
    let unsub: (() => void) | null = null;

    try {
      const lbRef = ref(rtdb, 'leaderboard');
      unsub = onValue(lbRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const items: RealPlayerItem[] = [];

          Object.keys(val).forEach((k) => {
            const p = val[k];
            if (k !== currentUid && p && !p.isBlocked) {
              items.push({
                uid: k,
                displayName: p.displayName || p.username || 'Racer',
                username: p.username || k.slice(0, 6),
                highestWpm: Number(p.highestWpm) || 45,
                highestAccuracy: Number(p.highestAccuracy) || 98,
                avatarUrl: p.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${k}`,
                lastActive: p.lastActive || Date.now(),
                country: p.country || '🇺🇿 Uzbekistan',
                level: p.level || 1
              });
            }
          });

          items.sort((a, b) => b.highestWpm - a.highestWpm);
          setOnlinePlayers(items.slice(0, 12));
        }
        setIsLoadingPlayers(false);
      });
    } catch (e) {
      console.warn('Real players load failed:', e);
      setIsLoadingPlayers(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [currentUid]);

  // Create a new Multiplayer Room
  const handleCreateRoom = async () => {
    const code = generateCleanRoomCode();
    setActiveRoomCode(code);
    setIsHost(true);
    setIsBotMatch(false);
    setJoinError(null);
    setDisqualifiedReason(null);

    const randomText = BATTLE_TEXTS[Math.floor(Math.random() * BATTLE_TEXTS.length)];
    setBattleText(randomText);

    const initialHostData: RacerProgress = {
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      carColor: 'blue',
      isWinner: false,
      isBot: false
    };

    setMyProgress(initialHostData);
    setOpponentProgress({
      id: 'opp_waiting',
      name: 'Raqib kutilmoqda...',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Waiting',
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      carColor: 'red',
      isWinner: false,
      isBot: false
    });

    try {
      const roomRef = ref(rtdb, `battle_rooms/${code}`);
      await set(roomRef, {
        code,
        gameType: 'speedway',
        text: randomText,
        status: 'waiting',
        createdAt: Date.now(),
        host: initialHostData,
        guest: null,
        winner: null
      });

      setGameState('ready_screen');
      listenToRoom(code, true);
    } catch (err) {
      console.error('Failed to create RTDB room:', err);
      setJoinError("Xona yaratishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  // Join Existing Room by Code
  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = (codeToJoin || joinInputCode).toUpperCase().trim();
    if (!code || code.length < 4) {
      setJoinError("Iltimos, haqiqiy xona kodini kiriting (masalan: 6 ta belgi).");
      return;
    }

    setJoinError(null);
    setActiveRoomCode(code);
    setIsHost(false);
    setIsBotMatch(false);
    setDisqualifiedReason(null);

    try {
      const roomRef = ref(rtdb, `battle_rooms/${code}`);
      const snap = await get(roomRef);

      if (!snap.exists()) {
        setJoinError(`"${code}" kodli xona topilmadi yoki yopilgan.`);
        return;
      }

      const roomVal = snap.val();
      if (roomVal.status !== 'waiting' && roomVal.status !== 'ready') {
        setJoinError("Bu xonadagi o'yin allaqachon boshlangan yoki yakunlangan.");
        return;
      }

      setBattleText(roomVal.text || BATTLE_TEXTS[0]);

      const guestData: RacerProgress = {
        id: currentUid,
        name: currentDisplayName,
        avatarUrl: currentAvatar,
        progressPercent: 0,
        wpm: 0,
        accuracy: 100,
        carColor: 'red',
        isWinner: false,
        isBot: false
      };

      setMyProgress(guestData);
      setOpponentProgress(roomVal.host);

      await update(roomRef, {
        guest: guestData,
        status: 'ready'
      });

      setGameState('ready_screen');
      listenToRoom(code, false);
    } catch (err) {
      console.error('Failed to join RTDB room:', err);
      setJoinError("Xonaga ulanishda xatolik yuz berdi.");
    }
  };

  // Listen to Firebase RTDB Room updates
  const listenToRoom = (code: string, amIHost: boolean) => {
    if (roomUnsubRef.current) roomUnsubRef.current();

    const roomRef = ref(rtdb, `battle_rooms/${code}`);
    roomUnsubRef.current = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();

      if (data.text) setBattleText(data.text);

      const opponentRoleData = amIHost ? data.guest : data.host;
      if (opponentRoleData) {
        setOpponentProgress(opponentRoleData);
      }

      // Check for start countdown
      if (data.status === 'countdown' && gameState !== 'countdown' && gameState !== 'racing' && gameState !== 'finished') {
        startCountdownSequence();
      }

      // Check for Winner
      if (data.winner) {
        setWinnerId(data.winner);
        setGameState('finished');
      }
    });
  };

  // Send Direct Invitation to an Online Player
  const handleInvitePlayer = async (player: RealPlayerItem) => {
    const code = generateCleanRoomCode();
    setInviteSentStatus(`⚔️ @${player.username} ga 🏎️ Speedway taklifi yuborildi (Kodi: ${code}). Kutilmoqda...`);

    setActiveRoomCode(code);
    setIsHost(true);
    setIsBotMatch(false);
    setJoinError(null);

    const randomText = BATTLE_TEXTS[Math.floor(Math.random() * BATTLE_TEXTS.length)];
    setBattleText(randomText);

    const initialHostData: RacerProgress = {
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      carColor: 'blue',
      isWinner: false,
      isBot: false
    };

    setMyProgress(initialHostData);

    try {
      const roomRef = ref(rtdb, `battle_rooms/${code}`);
      await set(roomRef, {
        code,
        gameType: 'speedway',
        text: randomText,
        status: 'waiting',
        createdAt: Date.now(),
        host: initialHostData,
        guest: null,
        winner: null,
        targetPlayerUid: player.uid
      });

      // Write direct notification to target user in RTDB
      const notifRef = ref(rtdb, `user_notifications/${player.uid}/${code}`);
      await set(notifRef, {
        id: code,
        fromUid: currentUid,
        fromName: currentDisplayName,
        fromAvatar: currentAvatar,
        roomCode: code,
        gameType: 'speedway',
        timestamp: Date.now()
      });

      setGameState('ready_screen');
      listenToRoom(code, true);
    } catch (e) {
      console.warn('Invite send failed:', e);
    }
  };

  // Start Offline Bot Match (Cyber Bot)
  const handleStartBotMatch = () => {
    setIsBotMatch(true);
    setIsHost(true);
    setActiveRoomCode('BOT_ARENA');
    setJoinError(null);
    setDisqualifiedReason(null);

    const randomText = BATTLE_TEXTS[Math.floor(Math.random() * BATTLE_TEXTS.length)];
    setBattleText(randomText);

    setMyProgress({
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      carColor: 'blue',
      isWinner: false,
      isBot: false
    });

    setOpponentProgress({
      id: 'bot_ai_speedway',
      name: 'Cyber Bot 🤖 (Speed 65 WPM)',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberSpeedBot',
      progressPercent: 0,
      wpm: 65,
      accuracy: 99,
      carColor: 'purple',
      isWinner: false,
      isBot: true
    });

    setGameState('ready_screen');
  };

  // Start Countdown Sequence
  const handleTriggerStartMatch = async () => {
    if (!isBotMatch && activeRoomCode) {
      const roomRef = ref(rtdb, `battle_rooms/${activeRoomCode}`);
      await update(roomRef, { status: 'countdown' });
    }
    startCountdownSequence();
  };

  const startCountdownSequence = () => {
    setGameState('countdown');
    setCountdown(3);
    setUserInput('');
    setStartTime(null);
    setWinnerId(null);

    let currentCount = 3;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);

      if (currentCount <= 0) {
        clearInterval(countdownTimerRef.current);
        setGameState('racing');
        setStartTime(Date.now());

        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 50);

        // Start Bot Movement if Bot match
        if (isBotMatch) {
          startBotEngine();
        }
      }
    }, 1000);
  };

  // Bot Engine Simulation
  const startBotEngine = () => {
    let botProgress = 0;
    const botTargetWpm = 55 + Math.floor(Math.random() * 25); // 55-80 WPM
    const intervalMs = 250;
    const stepIncrement = (botTargetWpm / 60) * 5 * (intervalMs / 1000);

    if (botTimerRef.current) clearInterval(botTimerRef.current);

    botTimerRef.current = setInterval(() => {
      botProgress += stepIncrement;
      const boundedProgress = Math.min(100, Math.round(botProgress));

      setOpponentProgress((prev) => ({
        ...prev,
        progressPercent: boundedProgress,
        wpm: botTargetWpm,
        isWinner: boundedProgress >= 100
      }));

      if (boundedProgress >= 100) {
        clearInterval(botTimerRef.current);
        setWinnerId((current) => current || 'bot_ai_speedway');
        setGameState('finished');
      }
    }, intervalMs);
  };

  // Handle Typing Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return;
    const val = e.target.value;
    setUserInput(val);

    const targetLength = battleText.length;
    const correctCount = val.split('').filter((char, idx) => char === battleText[idx]).length;
    const calculatedProgress = Math.min(100, Math.round((correctCount / targetLength) * 100));

    const timeSpentMinutes = Math.max(0.01, (Date.now() - (startTime || Date.now())) / 60000);
    const calculatedWpm = Math.round(val.length / 5 / timeSpentMinutes);

    const updatedMyState: RacerProgress = {
      ...myProgress,
      progressPercent: calculatedProgress,
      wpm: calculatedWpm,
      accuracy: Math.round((correctCount / Math.max(1, val.length)) * 100),
      isWinner: val === battleText
    };

    setMyProgress(updatedMyState);

    // Sync progress with RTDB
    if (!isBotMatch && activeRoomCode) {
      const field = isHost ? 'host' : 'guest';
      const progressRef = ref(rtdb, `battle_rooms/${activeRoomCode}/${field}`);
      update(progressRef, updatedMyState);
    }

    // Check if user won
    if (val === battleText) {
      if (botTimerRef.current) clearInterval(botTimerRef.current);

      setWinnerId(currentUid);
      setGameState('finished');

      // Save user XP & result
      if (addXp) addXp(150);
      if (saveTestResult) {
        saveTestResult({
          wpm: calculatedWpm,
          cpm: calculatedWpm * 5,
          accuracy: updatedMyState.accuracy,
          rawWpm: calculatedWpm,
          consistency: 95,
          time: Math.round((Date.now() - (startTime || Date.now())) / 1000),
          mode: 'time',
          language: 'uzbek'
        });
      }

      if (!isBotMatch && activeRoomCode) {
        const roomRef = ref(rtdb, `battle_rooms/${activeRoomCode}`);
        update(roomRef, {
          winner: currentUid,
          status: 'finished'
        });
      }
    }
  };

  // Rematch Handler
  const handleRematch = () => {
    handleTriggerStartMatch();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      if (roomUnsubRef.current) roomUnsubRef.current();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Sleek Header Title */}
      <div className="bg-gradient-to-r from-[#0c1322] via-[#11192e] to-[#0c1322] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              BATTLE ARENA{' '}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                1v1 SPEEDWAY
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Ishtirokchilar yoki Cyber Bot bilan real vaqt rejimida tezkor yozish dueliga kirishing!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gameState !== 'lobby' && (
            <button
              onClick={() => {
                if (botTimerRef.current) clearInterval(botTimerRef.current);
                if (roomUnsubRef.current) roomUnsubRef.current();
                setGameState('lobby');
                setActiveRoomCode('');
                setInviteSentStatus(null);
                setJoinError(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lobbiyga Qaytish</span>
            </button>
          )}
        </div>
      </div>

      {/* Invite Notification Banner */}
      {inviteSentStatus && (
        <div className="p-3 bg-cyan-950/70 border border-cyan-500/50 rounded-2xl text-cyan-200 text-xs flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
            <span>{inviteSentStatus}</span>
          </div>
          <button
            onClick={() => setInviteSentStatus(null)}
            className="text-cyan-400 hover:text-white font-bold ml-2 text-xs"
          >
            Yopish
          </button>
        </div>
      )}

      {/* VIEW 1: LOBBY & MATCHMAKING */}
      {gameState === 'lobby' && (
        <div className="space-y-6">
          {/* Main Action Cards: Create Room vs Join Room vs Bot Match */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Create Room Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-cyan-500/50 p-5 rounded-3xl space-y-4 transition-all shadow-md group flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <span>🏎️ Speedway Xonasi</span>
                </h3>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Yangi duel xonasi yarating va do'stingizga xona kodini yuboring.
                </p>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>XONA YARATISH ✨</span>
              </button>
            </div>

            {/* Join Room by Code Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-amber-500/50 p-5 rounded-3xl space-y-4 transition-all shadow-md flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[var(--text-color)]">
                  Kod Orqali Ulanish
                </h3>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Do'stingiz yuborgan 6 xonali xona kodini kiriting.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinInputCode}
                    onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                    placeholder="Masalan: K7N9XP"
                    maxLength={10}
                    className="w-full px-3 py-2 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl font-mono text-center font-bold text-xs text-[var(--text-color)] uppercase focus:border-amber-500 outline-none"
                  />
                  <button
                    onClick={() => handleJoinRoom()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                  >
                    KIRISH
                  </button>
                </div>
                {joinError && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{joinError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Play with Cyber Bot Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-purple-500/50 p-5 rounded-3xl space-y-4 transition-all shadow-md flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-[var(--text-color)]">
                  Cyber Bot Bilan O'ynash
                </h3>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Kutmasdan darhol sun'iy intellektli Cyber Bot bilan mashq qiling.
                </p>
              </div>

              <button
                onClick={handleStartBotMatch}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Cyber Bot Bilan O'ynash 🤖</span>
              </button>
            </div>
          </div>

          {/* Quick Invite Online Typists */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider">
                  Tezkor Duelga Taklif Qilish
                </h3>
              </div>
              <span className="text-[10px] text-[var(--sub-color)] font-mono">
                Peshqadamlar ({onlinePlayers.length} ta)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {isLoadingPlayers ? (
                <div className="col-span-3 py-6 text-center text-xs text-[var(--sub-color)]">
                  Ishtirokchilar ro'yxati yuklanmoqda...
                </div>
              ) : onlinePlayers.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-xs text-[var(--sub-color)]">
                  Ayni paytda boshqa foydalanuvchilar topilmadi. Cyber Bot bilan o'ynang yoki do'stingizga xona kodini ulashing!
                </div>
              ) : (
                onlinePlayers.map((p) => (
                  <div
                    key={p.uid}
                    className="p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] flex items-center justify-between gap-2 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.avatarUrl}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover shrink-0 bg-[var(--sub-alt)]"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--text-color)] truncate">
                          {p.displayName}
                        </h4>
                        <div className="text-[10px] font-mono text-[var(--main-color)] font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{p.highestWpm} WPM</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvitePlayer(p)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black font-mono font-bold text-[10px] transition-all border border-cyan-500/30 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jang ⚔️</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: READY SCREEN / ROOM CREATED */}
      {gameState === 'ready_screen' && (
        <div className="bg-[var(--card-bg)] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)] tracking-tight font-mono">
              BATTLE XONASI TAYYOR!
            </h2>
            <p className="text-xs text-[var(--sub-color)] max-w-md mx-auto">
              {isBotMatch
                ? 'Cyber Bot bilan mashq qilishga tayyormisiz? Pastdagi "JANGNI BOSHLASH" tugmasini bosing.'
                : 'Ushbu xona kodini do\'stingizga yuboring yoki havolani nusxalang:'}
            </p>
          </div>

          {/* Clean Room Code Box */}
          {!isBotMatch && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] flex items-center justify-between gap-3 shadow-inner">
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-[var(--sub-color)] block">XONA KODI</span>
                <span className="text-2xl font-black font-mono tracking-widest text-cyan-400">
                  {activeRoomCode}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoomCode);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Nusxalandi!' : 'Kodni Nusxalash'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VS Matchup Card */}
          <div className="max-w-lg mx-auto grid grid-cols-3 items-center gap-2 p-4 rounded-3xl bg-[var(--bg-color)] border border-[var(--sub-alt)]">
            {/* Player 1 */}
            <div className="text-center space-y-1.5">
              <img
                src={myProgress.avatarUrl}
                alt="my avatar"
                className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-cyan-400 shadow-md bg-[var(--sub-alt)]"
              />
              <p className="text-xs font-bold text-[var(--text-color)] truncate max-w-[100px] mx-auto">
                {myProgress.name}
              </p>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">Siz (1-ishtirokchi)</span>
            </div>

            {/* VS Badge */}
            <div className="text-center">
              <span className="px-3 py-1.5 rounded-2xl bg-amber-500 text-black font-black font-mono text-xs shadow-lg shadow-amber-500/20">
                VS
              </span>
            </div>

            {/* Player 2 */}
            <div className="text-center space-y-1.5">
              <img
                src={opponentProgress.avatarUrl}
                alt="opp avatar"
                className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-amber-400 shadow-md bg-[var(--sub-alt)]"
              />
              <p className="text-xs font-bold text-[var(--text-color)] truncate max-w-[100px] mx-auto">
                {opponentProgress.name}
              </p>
              <span className="text-[10px] font-mono text-amber-400 font-bold block">
                {isBotMatch ? 'Cyber Bot' : 'Raqib (2-ishtirokchi)'}
              </span>
            </div>
          </div>

          {/* Start Battle Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleTriggerStartMatch}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>JANGNI BOSHLASH ⚔️</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: COUNTDOWN & ACTIVE SPEEDWAY BATTLE */}
      {(gameState === 'countdown' || gameState === 'racing' || gameState === 'finished') && (
        <div className="space-y-4">
          {/* Speedway Race Track */}
          <RaceTrack
            racers={[myProgress, opponentProgress]}
            isRacing={gameState === 'racing'}
          />

          {/* 3-2-1 Countdown Overlay */}
          {gameState === 'countdown' && (
            <div className="bg-slate-900/90 border border-cyan-500/50 rounded-3xl p-8 text-center text-white space-y-2 animate-in zoom-in-95">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                BATTLE BOSHLANMOQDA
              </span>
              <div className="text-6xl font-black font-mono text-amber-400 animate-pulse">
                {countdown > 0 ? countdown : 'GO!'}
              </div>
              <p className="text-xs text-slate-400">Klaviatura tayyormi? Matnni xatosiz va tezroq tering!</p>
            </div>
          )}

          {/* Active Speedway Typing Box */}
          {gameState === 'racing' && (
            <div className="bg-[var(--card-bg)] border border-cyan-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
              {/* Reference Text Display with Highlight */}
              <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-sm sm:text-base font-mono leading-relaxed select-none">
                {battleText.split('').map((char, index) => {
                  let colorClass = 'text-[var(--sub-color)] opacity-70';
                  if (index < userInput.length) {
                    colorClass =
                      userInput[index] === char
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-500 bg-rose-500/20 rounded';
                  } else if (index === userInput.length) {
                    colorClass = 'text-cyan-400 underline font-extrabold animate-pulse';
                  }
                  return (
                    <span key={index} className={colorClass}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Typing Input */}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Bu yerga yuqoridagi matnni tering..."
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-color)] border-2 border-cyan-500/50 text-[var(--text-color)] font-mono text-sm sm:text-base outline-none focus:border-cyan-400 shadow-inner"
              />
            </div>
          )}

          {/* Finished Victory / Defeat Modal */}
          {gameState === 'finished' && (() => {
            const isWin = winnerId === currentUid;
            return (
              <div
                className={`border-2 rounded-3xl p-6 sm:p-8 text-center text-white space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 ${
                  isWin
                    ? 'bg-gradient-to-br from-[#0a1628] via-[#0f213d] to-[#1e1338] border-emerald-400/90 shadow-emerald-500/20'
                    : 'bg-gradient-to-br from-[#1c0e15] via-[#29131d] to-[#161224] border-rose-500/80 shadow-rose-500/20'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl border mb-1 shadow-lg ${
                    isWin
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-bounce'
                      : 'bg-rose-500/20 border-rose-400 text-rose-400'
                  }`}
                >
                  {isWin ? <Crown className="w-9 h-9" /> : <Skull className="w-8 h-8" />}
                </div>

                <div className="space-y-1.5">
                  <h2
                    className={`text-2xl sm:text-3xl font-black uppercase font-mono tracking-wider ${
                      isWin
                        ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                        : 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    }`}
                  >
                    {isWin ? '🏆 SIZ YUTDINGIZ! G\'ALABA!' : '💥 SIZ YUTQAZDINGIZ!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    {isWin
                      ? 'Matnni raqibingizdan tezroq va aniqroq terib g\'alaba qozondingiz!'
                      : 'Raqib marraga birinchi bo\'lib yetib keldi. Qayta urinib ko\'ring!'}
                  </p>
                </div>

                {/* Match Stats Comparison */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                  <div className={`space-y-1 text-left border-r border-slate-800 pr-3 ${isWin ? 'bg-emerald-950/20 p-2 rounded-xl' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold">
                        Sizning Natijangiz
                      </span>
                      {isWin && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-xl font-black font-mono text-cyan-300">{myProgress.wpm} WPM</p>
                    <p className="text-xs font-mono text-slate-300">
                      Aniqlik: <span className="text-white font-bold">{myProgress.accuracy}%</span>
                    </p>
                  </div>

                  <div className={`space-y-1 text-left pl-3 ${!isWin ? 'bg-rose-950/20 p-2 rounded-xl' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">
                        Raqib Natijasi
                      </span>
                      {!isWin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-xl font-black font-mono text-amber-300">{opponentProgress.wpm} WPM</p>
                    <p className="text-xs font-mono text-slate-300">
                      Aniqlik: <span className="text-white font-bold">{opponentProgress.accuracy}%</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRematch}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>⚡ QAYTA DUEL BOSHLASH</span>
                  </button>

                  <button
                    onClick={() => {
                      setGameState('lobby');
                      setActiveRoomCode('');
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95 cursor-pointer"
                  >
                    <span>LOBBIYGA QAYTISH</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
