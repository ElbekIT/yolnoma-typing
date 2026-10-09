import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Swords,
  Users,
  Bot,
  PlusCircle,
  Copy,
  Check,
  Share2,
  Play,
  RotateCcw,
  Trophy,
  Crown,
  Skull,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sparkles,
  Link as LinkIcon,
  Send,
  Flame,
  ArrowRight,
  Volume2
} from 'lucide-react';
import { DualBattleDrumView, RacerProgress } from './DualBattleDrumView';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { soundSynth } from '../../utils/audio';
import { rtdb, db } from '../../config/firebase';
import { ref, set, onValue, update, get } from 'firebase/database';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getRandomBattleText } from '../../data/battleTexts';
import { sanitizeRoomCode, sanitizeText } from '../../utils/security';

interface RealPlayerItem {
  uid: string;
  displayName: string;
  username: string;
  highestWpm: number;
  highestAccuracy: number;
  avatarUrl: string;
  lastActive?: number;
  level?: number;
}

// Generate clean 6-character uppercase room code (e.g. "UZB742", "K9N2XP")
const generateCleanRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface BattleViewProps {
  initialRoomCode?: string | null;
  onClearInitialRoomCode?: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  initialRoomCode,
  onClearInitialRoomCode
}) => {
  const { user, profile, saveTestResult, addXp } = useAuth();
  const { soundProfile } = useSettings();

  // Active user data
  const currentUid = user?.uid || localStorage.getItem('yolnoma_guest_id') || `guest_${Math.random().toString(36).substring(2, 7)}`;
  const rawDisplayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'Mehmon');
  const currentDisplayName = sanitizeText(rawDisplayName, 25);
  const currentAvatar = profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUid}`;

  // Game Lifecycle State: 'lobby' | 'ready_screen' | 'countdown' | 'racing' | 'finished'
  const [gameState, setGameState] = useState<'lobby' | 'ready_screen' | 'countdown' | 'racing' | 'finished'>('lobby');
  const gameStateRef = useRef<'lobby' | 'ready_screen' | 'countdown' | 'racing' | 'finished'>('lobby');

  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const activeRoomCodeRef = useRef<string>('');

  const [isHost, setIsHost] = useState(false);
  const isHostRef = useRef<boolean>(false);

  const [isBotMatch, setIsBotMatch] = useState(false);
  const isBotMatchRef = useRef<boolean>(false);

  const [countdown, setCountdown] = useState(3);
  const [battleText, setBattleText] = useState(() => getRandomBattleText('uz-latn'));
  const battleTextRef = useRef<string>(battleText);

  // Online Players for direct invite
  const [onlinePlayers, setOnlinePlayers] = useState<RealPlayerItem[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [inviteSentStatus, setInviteSentStatus] = useState<string | null>(null);

  // Join Room by Code input
  const [joinInputCode, setJoinInputCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Racers Progress
  const [myProgress, setMyProgress] = useState<RacerProgress>({
    id: currentUid,
    name: currentDisplayName,
    avatarUrl: currentAvatar,
    progressPercent: 0,
    wpm: 0,
    accuracy: 100,
    isWinner: false,
    isBot: false
  });
  const myProgressRef = useRef<RacerProgress>(myProgress);

  const [opponentProgress, setOpponentProgress] = useState<RacerProgress>({
    id: 'opp_waiting',
    name: "Do'stingiz kutilmoqda...",
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Waiting',
    progressPercent: 0,
    wpm: 0,
    accuracy: 100,
    isWinner: false,
    isBot: false
  });

  // Typing state
  const [userInput, setUserInput] = useState('');
  const userInputRef = useRef('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Timers and listener refs
  const inputRef = useRef<HTMLInputElement>(null);
  const botTimerRef = useRef<any>(null);
  const roomUnsubRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);
  const elapsedTimerRef = useRef<any>(null);

  // Helper to synchronously update gameState
  const updateGameState = useCallback((newState: 'lobby' | 'ready_screen' | 'countdown' | 'racing' | 'finished') => {
    gameStateRef.current = newState;
    setGameState(newState);
  }, []);

  // Sync refs when state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    activeRoomCodeRef.current = activeRoomCode;
  }, [activeRoomCode]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    isBotMatchRef.current = isBotMatch;
  }, [isBotMatch]);

  useEffect(() => {
    battleTextRef.current = battleText;
  }, [battleText]);

  useEffect(() => {
    myProgressRef.current = myProgress;
  }, [myProgress]);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (roomUnsubRef.current) roomUnsubRef.current();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Track active elapsed seconds during race
  useEffect(() => {
    if (gameState === 'racing' && startTime) {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } else if (gameState !== 'racing') {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (gameState === 'lobby') setElapsedSeconds(0);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [gameState, startTime]);

  // Keep input focused during race
  useEffect(() => {
    if (gameState === 'racing') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Auto-focus input on keydown when racing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'racing') {
        if (
          document.activeElement !== inputRef.current &&
          !['Tab', 'Escape', 'Alt', 'Control', 'Meta', 'Shift'].includes(e.key)
        ) {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handle URL code or prop deep-link auto join (?room=CODE)
  useEffect(() => {
    if (initialRoomCode && gameStateRef.current === 'lobby') {
      handleJoinRoom(initialRoomCode.toUpperCase().trim());
      if (onClearInitialRoomCode) onClearInitialRoomCode();
    } else {
      try {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room') || params.get('battleRoom');
        if (roomParam && gameStateRef.current === 'lobby') {
          handleJoinRoom(roomParam.toUpperCase().trim());
        }
      } catch {}
    }
  }, [initialRoomCode]);

  // Fetch online typists from RTDB leaderboard for direct invite
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
            if (
              !k ||
              k === currentUid ||
              !p ||
              p.isBlocked ||
              p.isBanned ||
              p.isGuest ||
              p.isBot ||
              p.isDummy ||
              k.startsWith('guest_') ||
              k.startsWith('bot_') ||
              k.startsWith('ai_') ||
              k.startsWith('seed_') ||
              k.startsWith('dummy_')
            ) {
              return;
            }
            const userWpm = Number(p.highestWpm) || 0;
            if (userWpm > 0 && userWpm <= 280) {
              items.push({
                uid: k,
                displayName: p.displayName || p.username || 'Foydalanuvchi',
                username: p.username || k.slice(0, 6),
                highestWpm: userWpm,
                highestAccuracy: Number(p.highestAccuracy) || 98,
                avatarUrl: p.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${k}`,
                lastActive: p.lastActive || Date.now(),
                level: Number(p.level) || 1
              });
            }
          });

          items.sort((a, b) => b.highestWpm - a.highestWpm);
          setOnlinePlayers(items.slice(0, 8));
        }
        setIsLoadingPlayers(false);
      });
    } catch {
      setIsLoadingPlayers(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [currentUid]);

  // Sound play helper
  const playSoundSafe = useCallback((type: 'tick' | 'go' | 'key' | 'error' | 'win') => {
    if (soundProfile === 'off') return;
    try {
      if (type === 'tick') {
        soundSynth.playKeyPress('thock');
      } else if (type === 'go') {
        soundSynth.playCoinSound();
      } else if (type === 'key') {
        soundSynth.playKeyPress(soundProfile || 'cherry-blue');
      } else if (type === 'error') {
        soundSynth.playErrorSound();
      } else if (type === 'win') {
        soundSynth.playCoinSound();
      }
    } catch {}
  }, [soundProfile]);

  // Cyber Bot simulation engine (natural variance, realistic typing rhythm)
  const startBotEngine = useCallback(() => {
    let botProgress = 0;
    const botWpm = 58 + Math.floor(Math.random() * 20); // 58-78 WPM
    const intervalMs = 200;
    const stepIncrement = (botWpm / 60) * 5 * (intervalMs / 1000);

    if (botTimerRef.current) clearInterval(botTimerRef.current);

    botTimerRef.current = setInterval(() => {
      botProgress += stepIncrement;
      const bounded = Math.min(100, Math.round(botProgress));

      setOpponentProgress((prev) => ({
        ...prev,
        progressPercent: bounded,
        wpm: botWpm,
        isWinner: bounded >= 100
      }));

      if (bounded >= 100) {
        if (botTimerRef.current) {
          clearInterval(botTimerRef.current);
          botTimerRef.current = null;
        }
        setWinnerId('bot_cyber');
        updateGameState('finished');
      }
    }, intervalMs);
  }, [updateGameState]);

  // Robust 3-2-1 Countdown Sequence
  const startCountdownSequence = useCallback(() => {
    // If we are ALREADY racing or finished, do not restart
    if (gameStateRef.current === 'racing' || gameStateRef.current === 'finished') {
      return;
    }
    // If timer is already running, avoid duplicating
    if (countdownTimerRef.current) {
      return;
    }

    updateGameState('countdown');
    setCountdown(3);
    setUserInput('');
    setStartTime(null);
    setWinnerId(null);
    playSoundSafe('tick');

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count > 0) {
        playSoundSafe('tick');
      }

      if (count <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }

        const raceNow = Date.now();
        updateGameState('racing');
        setStartTime(raceNow);
        playSoundSafe('go');

        // CRITICAL: Notify server and RTDB that match is now 'racing'
        // This stops anyone from re-triggering 'countdown'!
        const code = activeRoomCodeRef.current;
        if (!isBotMatchRef.current && code) {
          try {
            update(ref(rtdb, `battle_rooms/${code}`), {
              status: 'racing',
              startedAt: raceNow
            }).catch(() => {});

            fetch('/api/battle/update-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, status: 'racing', startedAt: raceNow })
            }).catch(() => {});
          } catch {}
        }

        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 50);

        if (isBotMatchRef.current) {
          startBotEngine();
        }
      }
    }, 1000);
  }, [updateGameState, playSoundSafe, startBotEngine]);

  // Apply synchronized room state update (NO stale closures)
  const applyRoomUpdate = useCallback((data: any) => {
    if (!data) return;

    if (data.text && data.text !== battleTextRef.current) {
      battleTextRef.current = data.text;
      setBattleText(data.text);
    }

    const amIHost = isHostRef.current;
    const opponentRoleData = amIHost ? data.guest : data.host;
    if (opponentRoleData) {
      setOpponentProgress((prev) => ({
        ...prev,
        ...opponentRoleData
      }));
    }

    const currentStatus = gameStateRef.current;

    // Remote countdown trigger:
    // ONLY start countdown if we are waiting in 'ready_screen'!
    // Never restart if already in countdown, racing, or finished!
    if (data.status === 'countdown') {
      if (currentStatus === 'ready_screen') {
        startCountdownSequence();
      }
    }

    // Remote racing trigger:
    // If the room transitioned to 'racing' while we were still waiting in 'ready_screen'
    if (data.status === 'racing') {
      if (currentStatus === 'ready_screen') {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        const now = data.startedAt || Date.now();
        updateGameState('racing');
        setStartTime(now);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }

    // Remote winner completion
    if (data.winner) {
      setWinnerId(data.winner);
      updateGameState('finished');
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (botTimerRef.current) {
        clearInterval(botTimerRef.current);
        botTimerRef.current = null;
      }
    }
  }, [updateGameState, startCountdownSequence]);

  // Listen to room updates via RTDB + Server Polling
  const listenToRoom = useCallback((code: string, amIHost: boolean) => {
    if (roomUnsubRef.current) roomUnsubRef.current();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    isHostRef.current = amIHost;
    activeRoomCodeRef.current = code;

    // 1. RTDB live listener
    try {
      const roomRef = ref(rtdb, `battle_rooms/${code}`);
      roomUnsubRef.current = onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) return;
        applyRoomUpdate(snapshot.val());
      });
    } catch {}

    // 2. High-speed server polling (every 600ms) ensuring instant room connection even without RTDB
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/battle/room/${code}`);
        if (res.ok) {
          const sData = await res.json();
          if (sData.success && sData.room) {
            applyRoomUpdate(sData.room);
          }
        }
      } catch {}
    }, 600);
  }, [applyRoomUpdate]);

  // 1. 🤖 Play vs Robot (Cyber Bot)
  const handleStartBotMatch = () => {
    setIsBotMatch(true);
    isBotMatchRef.current = true;
    setIsHost(true);
    isHostRef.current = true;
    setActiveRoomCode('BOT_ARENA');
    activeRoomCodeRef.current = 'BOT_ARENA';
    setJoinError(null);
    setWinnerId(null);

    const randomText = getRandomBattleText('uz-latn');
    setBattleText(randomText);
    battleTextRef.current = randomText;

    const hostData: RacerProgress = {
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false,
      isBot: false
    };

    const botData: RacerProgress = {
      id: 'bot_cyber',
      name: 'Cyber Bot 🤖',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBotBattle',
      progressPercent: 0,
      wpm: 65,
      accuracy: 99,
      isWinner: false,
      isBot: true
    };

    setMyProgress(hostData);
    setOpponentProgress(botData);
    updateGameState('ready_screen');
  };

  // 2. ⚔️ Create Room (Do'st bilan 1v1 xona yaratish)
  const handleCreateRoom = async () => {
    const code = generateCleanRoomCode();
    setActiveRoomCode(code);
    activeRoomCodeRef.current = code;
    setIsHost(true);
    isHostRef.current = true;
    setIsBotMatch(false);
    isBotMatchRef.current = false;
    setJoinError(null);
    setWinnerId(null);

    const randomText = getRandomBattleText('uz-latn');
    setBattleText(randomText);
    battleTextRef.current = randomText;

    const hostInitialData: RacerProgress = {
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false,
      isBot: false
    };

    setMyProgress(hostInitialData);
    setOpponentProgress({
      id: 'opp_waiting',
      name: "Do'stingiz kutilmoqda...",
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=FriendWaiting',
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false,
      isBot: false
    });

    const roomPayload = {
      code,
      roomId: code,
      gameType: 'drum_duel',
      text: randomText,
      selectedText: randomText,
      status: 'waiting',
      createdAt: Date.now(),
      host: hostInitialData,
      guest: null,
      winner: null
    };

    // Immediate UI transition
    updateGameState('ready_screen');
    listenToRoom(code, true);

    // Sync to Server API
    try {
      fetch('/api/battle/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomPayload)
      }).catch(() => {});
    } catch {}

    // Parallel sync to RTDB & Firestore
    try {
      set(ref(rtdb, `battle_rooms/${code}`), roomPayload).catch(() => {});
      setDoc(doc(db, 'battle_rooms', code), roomPayload).catch(() => {});
    } catch {}
  };

  // 3. 🔑 Join Room with 6-digit Code (Do'stining xonasiga kirish)
  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = sanitizeRoomCode(codeToJoin || joinInputCode);
    if (!code || code.length < 4) {
      setJoinError("Iltimos, 6 xonali xona kodini kiriting (masalan: UZB842).");
      return;
    }

    setJoinError(null);
    setActiveRoomCode(code);
    activeRoomCodeRef.current = code;
    setIsHost(false);
    isHostRef.current = false;
    setIsBotMatch(false);
    isBotMatchRef.current = false;
    setWinnerId(null);

    const guestData: RacerProgress = {
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false,
      isBot: false
    };

    setMyProgress(guestData);

    try {
      let roomVal: any = null;

      // 1. Join Server API (instant & authoritative)
      try {
        const sRes = await fetch('/api/battle/join-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, guest: guestData })
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.success && sData.room) roomVal = sData.room;
        }
      } catch {}

      // 2. Also write guest to RTDB and Firestore
      try {
        const roomRef = ref(rtdb, `battle_rooms/${code}`);
        const snap = await get(roomRef);
        if (snap.exists()) {
          if (!roomVal) roomVal = snap.val();
          update(roomRef, { guest: guestData, status: 'ready' }).catch(() => {});
        }
      } catch {}

      try {
        updateDoc(doc(db, 'battle_rooms', code), { guest: guestData, status: 'ready' }).catch(() => {});
      } catch {}

      if (!roomVal) {
        setJoinError(`"${code}" kodli xona topilmadi. Kodni tekshirib qayta kiriting.`);
        return;
      }

      const textToUse = roomVal.selectedText || roomVal.text || getRandomBattleText('uz-latn');
      setBattleText(textToUse);
      battleTextRef.current = textToUse;

      if (roomVal.host) {
        setOpponentProgress(roomVal.host);
      }

      updateGameState('ready_screen');
      listenToRoom(code, false);
    } catch {
      setJoinError("Xonaga ulanishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  // 4. 👥 Direct Invite Online Player (Do'stini chaqirish)
  const handleInvitePlayer = async (targetPlayer: RealPlayerItem) => {
    const code = generateCleanRoomCode();
    setActiveRoomCode(code);
    activeRoomCodeRef.current = code;
    setIsHost(true);
    isHostRef.current = true;
    setIsBotMatch(false);
    isBotMatchRef.current = false;
    setJoinError(null);

    const randomText = getRandomBattleText('uz-latn');
    setBattleText(randomText);
    battleTextRef.current = randomText;

    const hostData: RacerProgress = {
      id: currentUid,
      name: currentDisplayName,
      avatarUrl: currentAvatar,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false,
      isBot: false
    };

    setMyProgress(hostData);
    setOpponentProgress({
      id: targetPlayer.uid,
      name: targetPlayer.displayName,
      avatarUrl: targetPlayer.avatarUrl,
      progressPercent: 0,
      wpm: targetPlayer.highestWpm,
      accuracy: targetPlayer.highestAccuracy,
      isWinner: false,
      isBot: false
    });

    setInviteSentStatus(`${targetPlayer.displayName} ga duel taklifnomasi yuborildi!`);
    updateGameState('ready_screen');
    listenToRoom(code, true);

    const roomPayload = {
      code,
      roomId: code,
      gameType: 'drum_duel',
      text: randomText,
      selectedText: randomText,
      status: 'waiting',
      createdAt: Date.now(),
      host: hostData,
      guest: null,
      winner: null
    };

    try {
      fetch('/api/battle/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomPayload)
      }).catch(() => {});

      set(ref(rtdb, `battles/invites/${targetPlayer.uid}`), {
        id: code,
        fromUid: currentUid,
        fromName: currentDisplayName,
        fromAvatar: currentAvatar,
        roomCode: code,
        timestamp: Date.now()
      }).catch(() => {});
    } catch {}
  };

  // Start match trigger (Host or Guest triggers match start)
  const handleTriggerStartMatch = async () => {
    const code = activeRoomCodeRef.current;
    if (!isBotMatchRef.current && code) {
      try {
        update(ref(rtdb, `battle_rooms/${code}`), { status: 'countdown' }).catch(() => {});
        fetch('/api/battle/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, status: 'countdown' })
        }).catch(() => {});
      } catch {}
    }
    startCountdownSequence();
  };

  // User typing input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameStateRef.current !== 'racing') return;
    const val = e.target.value;
    const targetText = battleTextRef.current;

    // Do not allow typing beyond text length
    if (val.length > targetText.length) return;

    setUserInput(val);

    // Audio feedback
    if (val.length > 0) {
      const lastIndex = val.length - 1;
      const isCorrectChar = val[lastIndex] === targetText[lastIndex];
      playSoundSafe(isCorrectChar ? 'key' : 'error');
    }

    const targetLength = targetText.length;
    const correctCount = val.split('').filter((c, i) => c === targetText[i]).length;
    const calculatedProgress = Math.min(100, Math.round((correctCount / targetLength) * 100));

    const timeMinutes = Math.max(0.01, (Date.now() - (startTimeRef.current || Date.now())) / 60000);
    const calculatedWpm = Math.round(val.length / 5 / timeMinutes);
    const accuracy = val.length === 0 ? 100 : Math.round((correctCount / val.length) * 100);

    const isFinished = val === targetText;

    const updatedState: RacerProgress = {
      ...myProgress,
      progressPercent: calculatedProgress,
      wpm: calculatedWpm,
      accuracy,
      isWinner: isFinished
    };

    setMyProgress(updatedState);

    // Sync progress in real time
    const code = activeRoomCodeRef.current;
    if (!isBotMatchRef.current && code) {
      const role = isHostRef.current ? 'host' : 'guest';
      try {
        update(ref(rtdb, `battle_rooms/${code}/${role}`), updatedState).catch(() => {});
        fetch('/api/battle/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            role,
            progress: updatedState
          })
        }).catch(() => {});
      } catch {}
    }

    // Check if player won
    if (isFinished) {
      if (botTimerRef.current) {
        clearInterval(botTimerRef.current);
        botTimerRef.current = null;
      }

      setWinnerId(currentUid);
      updateGameState('finished');
      playSoundSafe('win');

      if (addXp) addXp(150);
      if (saveTestResult) {
        saveTestResult({
          wpm: calculatedWpm,
          cpm: calculatedWpm * 5,
          accuracy,
          rawWpm: calculatedWpm,
          consistency: 96,
          time: Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000),
          mode: 'time',
          language: 'uzbek'
        });
      }

      if (!isBotMatchRef.current && code) {
        try {
          update(ref(rtdb, `battle_rooms/${code}`), {
            winner: currentUid,
            status: 'finished'
          }).catch(() => {});

          fetch('/api/battle/update-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              winner: currentUid,
              status: 'finished'
            })
          }).catch(() => {});
        } catch {}
      }
    }
  };

  // Rematch with fresh random text
  const handleRematch = async () => {
    const freshText = getRandomBattleText('uz-latn');
    setBattleText(freshText);
    battleTextRef.current = freshText;
    setUserInput('');
    setWinnerId(null);

    const resetMyData: RacerProgress = {
      ...myProgress,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false
    };
    setMyProgress(resetMyData);

    const code = activeRoomCodeRef.current;
    if (!isBotMatchRef.current && code) {
      try {
        const payload = {
          text: freshText,
          selectedText: freshText,
          winner: null,
          status: 'ready'
        };
        await update(ref(rtdb, `battle_rooms/${code}`), payload);
        await fetch('/api/battle/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            text: freshText,
            winner: null,
            status: 'ready'
          })
        });
      } catch {}
    }

    updateGameState('ready_screen');
  };

  const isFriendJoined = !isBotMatch && opponentProgress.id !== 'opp_waiting';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Sleek Battle Header */}
      <div className="bg-gradient-to-r from-[#0b1324] via-[#111c38] to-[#0b1324] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-amber-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              BATTLE ARENA{' '}
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                2X BARABAN DUELI
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Robot bilan mashq qiling yoki do'stingiz bilan 1v1 xona ochib bir xil matnda bellashing!
            </p>
          </div>
        </div>

        {gameState !== 'lobby' && (
          <button
            onClick={() => {
              if (botTimerRef.current) clearInterval(botTimerRef.current);
              if (roomUnsubRef.current) roomUnsubRef.current();
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              updateGameState('lobby');
              setActiveRoomCode('');
              setInviteSentStatus(null);
              setJoinError(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lobbiyga Qaytish</span>
          </button>
        )}
      </div>

      {/* Invite Notification Banner */}
      {inviteSentStatus && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-500/50 rounded-2xl text-cyan-200 text-xs flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
            <span>{inviteSentStatus}</span>
          </div>
          <button
            onClick={() => setInviteSentStatus(null)}
            className="text-cyan-400 hover:text-white font-bold ml-2 text-xs cursor-pointer"
          >
            Yopish
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LOBBY SCREEN: ROBOT, XONA YARATISH, VA KOD BILAN KIRISH */}
      {/* ======================================================== */}
      {gameState === 'lobby' && (
        <div className="space-y-6">
          {/* Main 3 Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: 🤖 Robot Bilan O'ynash (Cyber Bot) */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-purple-500/60 p-5 sm:p-6 rounded-3xl space-y-4 transition-all shadow-lg flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <span>Robot Bilan O'ynash</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    CYBER BOT
                  </span>
                </h3>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Hech kimni kutmasdan, hoziroq sun'iy intellektli Robot bilan tezkor yozish dueliga kiring.
                </p>
              </div>

              <button
                onClick={handleStartBotMatch}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>ROBOT BILAN O'YNASH 🤖</span>
              </button>
            </div>

            {/* Card 2: ⚔️ Alohida Do'st Bilan O'ynash (Xona Yaratish) */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-cyan-500/60 p-5 sm:p-6 rounded-3xl space-y-4 transition-all shadow-lg flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <span>Do'st Bilan 1v1</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    XONA YARATISH
                  </span>
                </h3>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Yangi duel xonasi oching. Do'stingizga xona kodini yoki havolani yuboring va birga o'ynang.
                </p>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>XONA YARATISH ✨</span>
              </button>
            </div>

            {/* Card 3: 🔑 Xona Kodi Bilan Kirish */}
            <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] hover:border-amber-500/60 p-5 sm:p-6 rounded-3xl space-y-4 transition-all shadow-lg flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-105 transition-transform">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <span>Xona Kodi Bilan Kirish</span>
                </h3>
                <p className="text-xs text-[var(--sub-color)] leading-relaxed">
                  Do'stingiz yuborgan 6 xonali xona kodini kiriting va darhol uning dueliga qo'shiling.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinInputCode}
                    onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleJoinRoom();
                    }}
                    placeholder="Masalan: UZB842"
                    maxLength={10}
                    className="w-full px-3 py-2.5 bg-[var(--bg-color)] border border-[var(--sub-alt)] rounded-xl font-mono text-center font-bold text-xs text-[var(--text-color)] uppercase focus:border-amber-500 outline-none shadow-inner"
                  />
                  <button
                    onClick={() => handleJoinRoom()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                  >
                    KIRISH
                  </button>
                </div>
                {joinError && (
                  <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{joinError}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: 👥 Do'stini Chaqirish (Faol Foydalanuvchilar Ro'yxati) */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] uppercase tracking-wider">
                  Do'stini Chaqirish / Faol Foydalanuvchilar
                </h3>
              </div>
              <span className="text-[10px] text-[var(--sub-color)] font-mono">
                {onlinePlayers.length} ta ishtirokchi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {isLoadingPlayers ? (
                <div className="col-span-full py-6 text-center text-xs text-[var(--sub-color)]">
                  Foydalanuvchilar ro'yxati yuklanmoqda...
                </div>
              ) : onlinePlayers.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs text-[var(--sub-color)]">
                  Ayni damda boshqa faol foydalanuvchilar topilmadi. Robot bilan o'ynang yoki do'stingizga xona kodini ulashing!
                </div>
              ) : (
                onlinePlayers.map((p) => (
                  <div
                    key={p.uid}
                    className="p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] flex items-center justify-between gap-2.5 hover:border-cyan-500/40 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={p.avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover shrink-0 bg-[var(--sub-alt)] border border-cyan-500/30"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--text-color)] truncate">
                          {p.displayName}
                        </h4>
                        <div className="text-[10px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span>{p.highestWpm} WPM</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvitePlayer(p)}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black font-mono font-bold text-[10px] transition-all border border-cyan-500/30 shrink-0 cursor-pointer"
                    >
                      Chaqirish ⚔️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. READY SCREEN / XONA KUTISH LOBBISI */}
      {/* ======================================================== */}
      {gameState === 'ready_screen' && (
        <div className="bg-[var(--card-bg)] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1 shadow-md">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] tracking-tight font-mono">
              {isBotMatch ? "ROBOT BILAN DUEL TAYYOR!" : "BATTLE XONASI TAYYOR!"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--sub-color)] max-w-lg mx-auto">
              {isBotMatch
                ? 'Cyber Bot bilan mashq qilishga tayyormisiz? Pastdagi "JANGNI BOSHLASH" tugmasini bosing.'
                : 'Ushbu 6 xonali xona kodini do\'stingizga yuboring yoki havolani nusxalang:'}
            </p>
          </div>

          {/* Clean Room Code Box & Sharing Buttons */}
          {!isBotMatch && (
            <div className="max-w-md mx-auto p-5 rounded-3xl bg-[var(--bg-color)] border border-[var(--sub-alt)] space-y-4 shadow-inner">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--sub-color)] tracking-widest block mb-1">
                  XONA KODI (6 BELGILI)
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {activeRoomCode}
                </span>
              </div>

              {/* Share & Copy Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoomCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Nusxalandi!' : 'Kodni Nusxalash'}</span>
                </button>

                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoomCode}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Havola Nusxalandi!' : 'Havolani Nusxalash'}</span>
                </button>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?room=${activeRoomCode}`)}&text=${encodeURIComponent(`Menga tez yozish dueliga qo'shil! Xona kodi: ${activeRoomCode}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-mono text-xs font-bold border border-sky-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          )}

          {/* VS Matchup Card */}
          <div className="max-w-lg mx-auto grid grid-cols-3 items-center gap-2 p-5 rounded-3xl bg-[var(--bg-color)] border border-[var(--sub-alt)] shadow-md">
            {/* Player 1 (Siz) */}
            <div className="text-center space-y-2">
              <img
                src={myProgress.avatarUrl}
                alt="my avatar"
                className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-cyan-400 shadow-md bg-[var(--sub-alt)]"
              />
              <p className="text-xs sm:text-sm font-bold text-[var(--text-color)] truncate max-w-[110px] mx-auto">
                {myProgress.name}
              </p>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">Siz (1-ishtirokchi)</span>
            </div>

            {/* VS Badge */}
            <div className="text-center">
              <span className="px-3.5 py-1.5 rounded-2xl bg-amber-500 text-black font-black font-mono text-xs shadow-lg shadow-amber-500/30">
                VS
              </span>
            </div>

            {/* Player 2 (Raqib yoki Robot) */}
            <div className="text-center space-y-2">
              <img
                src={opponentProgress.avatarUrl}
                alt="opp avatar"
                className={`w-14 h-14 rounded-full mx-auto object-cover border-2 shadow-md bg-[var(--sub-alt)] ${
                  isFriendJoined ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-amber-400'
                }`}
              />
              <p className="text-xs sm:text-sm font-bold text-[var(--text-color)] truncate max-w-[110px] mx-auto">
                {opponentProgress.name}
              </p>
              <span className="text-[10px] font-mono text-amber-400 font-bold block">
                {isBotMatch ? 'Cyber Bot 🤖' : isFriendJoined ? 'Raqib Ulandi ✅' : "Kutilmoqda..."}
              </span>
            </div>
          </div>

          {/* Connection Status Helper */}
          {!isBotMatch && (
            <div className="text-xs font-mono">
              {isFriendJoined ? (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Do'stingiz xonaga muvaffaqiyatli ulandi! Jangni boshlashingiz mumkin.
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" /> Do'stingiz xona kodini kiritishi kutilmoqda...
                </span>
              )}
            </div>
          )}

          {/* Start Battle Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleTriggerStartMatch}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/25 active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>JANGNI BOSHLASH ⚔️</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACTIVE SPEEDWAY BATTLE: YONMA-YON 2 TA BARABAN */}
      {/* ======================================================== */}
      {(gameState === 'countdown' || gameState === 'racing' || gameState === 'finished') && (
        <div className="space-y-4">
          {/* 2X Dual Rotary Drums (Yonma-yon 2 ta Baraban, Bir Xil Matn) */}
          <div onClick={() => inputRef.current?.focus()} className="cursor-text">
            <DualBattleDrumView
              player1={myProgress}
              player2={opponentProgress}
              targetText={battleText}
              player1TypedLen={userInput.length}
              player2TypedLen={Math.floor((opponentProgress.progressPercent / 100) * (battleText.length || 1))}
              player1Input={userInput}
              timeLeft={elapsedSeconds}
              isRacing={gameState === 'racing'}
            />
          </div>

          {/* 3-2-1 Countdown Overlay */}
          {gameState === 'countdown' && (
            <div className="bg-slate-900/95 border-2 border-cyan-500/60 rounded-3xl p-8 text-center text-white space-y-2 animate-in zoom-in-95 shadow-2xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                BATTLE BOSHLANMOQDA
              </span>
              <div
                className={`text-6xl sm:text-7xl font-black font-mono transition-transform duration-200 ${
                  countdown === 3
                    ? 'text-amber-400 scale-105 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                    : countdown === 2
                    ? 'text-orange-400 scale-110 drop-shadow-[0_0_25px_rgba(251,146,60,0.6)]'
                    : countdown === 1
                    ? 'text-rose-500 scale-115 drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                    : 'text-emerald-400 scale-125 drop-shadow-[0_0_30px_rgba(52,211,153,0.7)]'
                }`}
              >
                {countdown > 0 ? countdown : 'GO! BOSHLANDI!'}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Klaviaturaga qo'llarni tayyorlang! Matnni xatosiz tering!
              </p>
            </div>
          )}

          {/* Active Typing Input Box */}
          {gameState === 'racing' && (
            <div
              onClick={() => inputRef.current?.focus()}
              className="bg-[var(--card-bg)] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl cursor-text transition-all hover:border-cyan-400"
            >
              {/* Reference Text with Dynamic Character Highlights */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-sm sm:text-base font-mono leading-relaxed select-none shadow-inner tracking-wide">
                {battleText.split('').map((char, index) => {
                  let colorClass = 'text-[var(--sub-color)] opacity-70';
                  if (index < userInput.length) {
                    colorClass =
                      userInput[index] === char
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-500 bg-rose-500/25 px-0.5 rounded font-bold';
                  } else if (index === userInput.length) {
                    colorClass = 'text-cyan-400 underline font-black bg-cyan-500/20 px-0.5 rounded animate-pulse';
                  }
                  return (
                    <span key={index} className={colorClass}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Typing Input Field */}
              <div className="relative">
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
                  placeholder="Shu yerga tering... (to'xtovsiz yozing!)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-color)] border-2 border-cyan-500 text-[var(--text-color)] font-mono text-sm sm:text-base outline-none focus:ring-4 focus:ring-cyan-500/20 shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/30">
                  {userInput.length} / {battleText.length}
                </span>
              </div>
            </div>
          )}

          {/* Finished Victory / Defeat Screen */}
          {gameState === 'finished' && (() => {
            const isWin = winnerId === currentUid;
            return (
              <div
                className={`border-2 rounded-3xl p-6 sm:p-8 text-center text-white space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 ${
                  isWin
                    ? 'bg-gradient-to-br from-[#0a1628] via-[#0f213d] to-[#1e1338] border-emerald-400/90 shadow-emerald-500/25'
                    : 'bg-gradient-to-br from-[#1c0e15] via-[#29131d] to-[#161224] border-rose-500/80 shadow-rose-500/25'
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
                    {isWin ? "🏆 SIZ YUTDINGIZ! G'ALABA!" : "💥 SIZ YUTQAZDINGIZ!"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    {isWin
                      ? "Matnni raqibingizdan tezroq va aniqroq terib g'alaba qozondingiz! +150 XP berildi."
                      : "Raqib marraga birinchi bo'lib yetib keldi. Qayta o'ynab revansh oling!"}
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
                    <p className="text-2xl font-black font-mono text-cyan-300">{myProgress.wpm} WPM</p>
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
                    <p className="text-2xl font-black font-mono text-amber-300">{opponentProgress.wpm} WPM</p>
                    <p className="text-xs font-mono text-slate-300">
                      Aniqlik: <span className="text-white font-bold">{opponentProgress.accuracy}%</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRematch}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>⚡ QAYTA DUEL BOSHLASH</span>
                  </button>

                  <button
                    onClick={() => {
                      updateGameState('lobby');
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
