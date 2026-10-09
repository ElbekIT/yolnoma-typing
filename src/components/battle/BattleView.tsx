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
  Clock,
  Globe,
  Settings,
  Hourglass,
  XCircle,
  ChevronRight,
  ShieldAlert
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

  // Room custom configurations (Host selects before creating)
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 15, 30, 60, 120 (0 = cheksiz)
  const [selectedLanguage, setSelectedLanguage] = useState<'uz-latn' | 'uz-cyrl' | 'en' | 'ru' | 'code'>('uz-latn');
  const roomDurationRef = useRef<number>(30);
  const roomLanguageRef = useRef<string>('uz-latn');

  // Active match timer (remaining seconds for timed matches)
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const remainingTimeRef = useRef<number>(30);

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

  // Racers Progress & Error Counting
  const [myMistakes, setMyMistakes] = useState(0);
  const [oppMistakes, setOppMistakes] = useState(0);

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
  const opponentProgressRef = useRef<RacerProgress>(opponentProgress);

  // Typing state
  const [userInput, setUserInput] = useState('');
  const userInputRef = useRef('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [finishReason, setFinishReason] = useState<'completed' | 'timeout'>('completed');

  // Timers and listener refs
  const inputRef = useRef<HTMLInputElement>(null);
  const botTimerRef = useRef<any>(null);
  const roomUnsubRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);
  const matchTimerRef = useRef<any>(null);

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
    opponentProgressRef.current = opponentProgress;
  }, [opponentProgress]);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    roomDurationRef.current = selectedDuration;
  }, [selectedDuration]);

  useEffect(() => {
    roomLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (roomUnsubRef.current) roomUnsubRef.current();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    };
  }, []);

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

          Object.keys(val).forEach((uid) => {
            if (uid !== currentUid) {
              const p = val[uid];
              items.push({
                uid,
                displayName: p.displayName || p.name || 'Poygachi',
                username: p.username || 'user',
                highestWpm: Number(p.wpm || p.highestWpm || 45),
                highestAccuracy: Number(p.accuracy || 98),
                avatarUrl: p.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}`,
                level: Number(p.level || 1)
              });
            }
          });

          // Sort by highest WPM
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
  const playSoundSafe = useCallback((type: 'tick' | 'go' | 'key' | 'error' | 'win' | 'lose') => {
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
      } else if (type === 'lose') {
        soundSynth.playErrorSound();
      }
    } catch {}
  }, [soundProfile]);

  // Finish match with winner evaluation
  const concludeMatch = useCallback((winnerUid: string | null, reason: 'completed' | 'timeout') => {
    if (gameStateRef.current === 'finished') return;

    if (matchTimerRef.current) {
      clearInterval(matchTimerRef.current);
      matchTimerRef.current = null;
    }
    if (botTimerRef.current) {
      clearInterval(botTimerRef.current);
      botTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setFinishReason(reason);
    setWinnerId(winnerUid);
    updateGameState('finished');

    const amIWinner = winnerUid === currentUid;
    if (amIWinner) {
      playSoundSafe('win');
      if (addXp) addXp(150);
    } else {
      playSoundSafe('lose');
      if (addXp) addXp(50);
    }

    if (saveTestResult && myProgressRef.current) {
      const now = Date.now();
      const testSeconds = Math.max(1, Math.round((now - (startTimeRef.current || now)) / 1000));
      saveTestResult({
        wpm: myProgressRef.current.wpm,
        cpm: myProgressRef.current.wpm * 5,
        accuracy: myProgressRef.current.accuracy,
        rawWpm: myProgressRef.current.wpm,
        consistency: 95,
        time: testSeconds,
        mode: 'time',
        language: roomLanguageRef.current === 'uz-cyrl' ? 'uzbek-cyrillic' : roomLanguageRef.current === 'en' ? 'english' : 'uzbek'
      });
    }

    const code = activeRoomCodeRef.current;
    if (!isBotMatchRef.current && code) {
      try {
        update(ref(rtdb, `battle_rooms/${code}`), {
          winner: winnerUid,
          status: 'finished',
          finishReason: reason
        }).catch(() => {});

        fetch('/api/battle/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            winner: winnerUid,
            status: 'finished',
            finishReason: reason
          })
        }).catch(() => {});
      } catch {}
    }
  }, [currentUid, addXp, saveTestResult, playSoundSafe, updateGameState]);

  // Handle Match Timeout (Vaqt tugaganda kim oldinda bo'lsa o'sha yutadi)
  const handleMatchTimeout = useCallback(() => {
    const myProg = myProgressRef.current.progressPercent;
    const oppProg = opponentProgressRef.current.progressPercent;
    const myW = myProgressRef.current.wpm;
    const oppW = opponentProgressRef.current.wpm;

    let declaredWinner: string | null = null;
    if (myProg > oppProg) {
      declaredWinner = currentUid;
    } else if (oppProg > myProg) {
      declaredWinner = opponentProgressRef.current.id;
    } else {
      // If same progress, winner by higher WPM
      if (myW >= oppW) {
        declaredWinner = currentUid;
      } else {
        declaredWinner = opponentProgressRef.current.id;
      }
    }

    concludeMatch(declaredWinner, 'timeout');
  }, [currentUid, concludeMatch]);

  // Cyber Bot simulation engine (natural variance, realistic typing rhythm)
  const startBotEngine = useCallback(() => {
    let botProgress = 0;
    const botWpm = 55 + Math.floor(Math.random() * 25); // 55-80 WPM
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
        concludeMatch('bot_cyber', 'completed');
      }
    }, intervalMs);
  }, [concludeMatch]);

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
    setMyMistakes(0);
    setOppMistakes(0);

    let count = 3;
    playSoundSafe('tick');

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

        // Set up match duration countdown timer
        const durationSec = roomDurationRef.current || 30;
        setRemainingTime(durationSec);
        remainingTimeRef.current = durationSec;

        if (matchTimerRef.current) clearInterval(matchTimerRef.current);
        matchTimerRef.current = setInterval(() => {
          remainingTimeRef.current -= 1;
          const left = remainingTimeRef.current;
          setRemainingTime(left);

          if (left <= 0) {
            if (matchTimerRef.current) {
              clearInterval(matchTimerRef.current);
              matchTimerRef.current = null;
            }
            handleMatchTimeout();
          }
        }, 1000);

        // Notify server and RTDB that match is now 'racing'
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
  }, [updateGameState, playSoundSafe, startBotEngine, handleMatchTimeout]);

  // Apply synchronized room state update (NO stale closures)
  const applyRoomUpdate = useCallback((data: any) => {
    if (!data) return;

    if (data.text && data.text !== battleTextRef.current) {
      battleTextRef.current = data.text;
      setBattleText(data.text);
    }

    if (data.duration && data.duration !== roomDurationRef.current) {
      roomDurationRef.current = Number(data.duration);
      setSelectedDuration(Number(data.duration));
      setRemainingTime(Number(data.duration));
    }

    if (data.language && data.language !== roomLanguageRef.current) {
      roomLanguageRef.current = String(data.language);
      setSelectedLanguage(data.language as any);
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
    if (data.status === 'countdown') {
      if (currentStatus === 'ready_screen') {
        startCountdownSequence();
      }
    }

    // Remote racing trigger:
    if (data.status === 'racing') {
      if (currentStatus === 'ready_screen') {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        const now = data.startedAt || Date.now();
        updateGameState('racing');
        setStartTime(now);

        const dur = data.duration || roomDurationRef.current || 30;
        const elapsed = Math.floor((Date.now() - now) / 1000);
        const rem = Math.max(0, dur - elapsed);
        setRemainingTime(rem);
        remainingTimeRef.current = rem;

        if (matchTimerRef.current) clearInterval(matchTimerRef.current);
        matchTimerRef.current = setInterval(() => {
          remainingTimeRef.current -= 1;
          const left = remainingTimeRef.current;
          setRemainingTime(left);
          if (left <= 0) {
            if (matchTimerRef.current) {
              clearInterval(matchTimerRef.current);
              matchTimerRef.current = null;
            }
            handleMatchTimeout();
          }
        }, 1000);

        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }

    // Remote winner completion
    if (data.winner) {
      setWinnerId(data.winner);
      setFinishReason(data.finishReason || 'completed');
      updateGameState('finished');
      if (matchTimerRef.current) {
        clearInterval(matchTimerRef.current);
        matchTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (botTimerRef.current) {
        clearInterval(botTimerRef.current);
        botTimerRef.current = null;
      }
    }
  }, [updateGameState, startCountdownSequence, handleMatchTimeout]);

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
    setFinishReason('completed');

    const randomText = getRandomBattleText(selectedLanguage);
    setBattleText(randomText);
    battleTextRef.current = randomText;
    setRemainingTime(selectedDuration);
    remainingTimeRef.current = selectedDuration;

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

  // 2. ⚔️ Create Room (Do'st bilan 1v1 xona yaratish - tanlangan voqt va til bilan)
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
    setFinishReason('completed');

    const randomText = getRandomBattleText(selectedLanguage);
    setBattleText(randomText);
    battleTextRef.current = randomText;
    setRemainingTime(selectedDuration);
    remainingTimeRef.current = selectedDuration;

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
      duration: selectedDuration,
      language: selectedLanguage,
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
    setFinishReason('completed');

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

      if (roomVal.duration) {
        setSelectedDuration(Number(roomVal.duration));
        roomDurationRef.current = Number(roomVal.duration);
        setRemainingTime(Number(roomVal.duration));
      }
      if (roomVal.language) {
        setSelectedLanguage(roomVal.language);
        roomLanguageRef.current = roomVal.language;
      }

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

    const randomText = getRandomBattleText(selectedLanguage);
    setBattleText(randomText);
    battleTextRef.current = randomText;
    setRemainingTime(selectedDuration);
    remainingTimeRef.current = selectedDuration;

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
      duration: selectedDuration,
      language: selectedLanguage,
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
        duration: selectedDuration,
        language: selectedLanguage,
        timestamp: Date.now()
      }).catch(() => {});
    } catch {}
  };

  // Start match trigger (HOST ONLY triggers match start)
  const handleTriggerStartMatch = async () => {
    if (!isHostRef.current) return;

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

    // Audio feedback & mistakes tracking
    let mistakes = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== targetText[i]) mistakes++;
    }
    setMyMistakes(mistakes);

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

    // Check if player won by typing entire text before time runs out
    if (isFinished) {
      concludeMatch(currentUid, 'completed');
    }
  };

  // Rematch with fresh random text
  const handleRematch = async () => {
    const freshText = getRandomBattleText(selectedLanguage);
    setBattleText(freshText);
    battleTextRef.current = freshText;
    setUserInput('');
    setWinnerId(null);
    setFinishReason('completed');
    setMyMistakes(0);
    setOppMistakes(0);
    setRemainingTime(selectedDuration);
    remainingTimeRef.current = selectedDuration;

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
              Robot bilan mashq qiling yoki vaqt va tilni belgilab do'stingiz bilan 1v1 xona oching!
            </p>
          </div>
        </div>

        {gameState !== 'lobby' && (
          <button
            onClick={() => {
              if (botTimerRef.current) clearInterval(botTimerRef.current);
              if (roomUnsubRef.current) roomUnsubRef.current();
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              if (matchTimerRef.current) clearInterval(matchTimerRef.current);
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
            className="text-cyan-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LOBBY SCREEN: SOZLAMALAR, XONA YARATISH, VA KIRISH */}
      {/* ======================================================== */}
      {gameState === 'lobby' && (
        <div className="space-y-6">
          {/* Room Customization Banner (Host tanlaydigan Vaqt va Til parametrlari) */}
          <div className="bg-[var(--card-bg)] border border-[var(--sub-alt)] p-5 sm:p-6 rounded-3xl space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-[var(--sub-alt)] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-black text-[var(--text-color)] uppercase tracking-wider">
                  Jang Parametrlari (Xona Vaqti va Matn Tili)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                {selectedDuration} sekund • {selectedLanguage.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Vaqt (Necha sekundlik duel) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--sub-color)] flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Jang Davomiyligi (Vaqt tanlang):</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedDuration(sec)}
                      className={`py-2.5 px-2 rounded-2xl font-mono font-bold text-xs transition-all border text-center cursor-pointer ${
                        selectedDuration === sec
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30 scale-[1.02]'
                          : 'bg-[var(--bg-color)] border-[var(--sub-alt)] text-[var(--text-color)] hover:border-amber-400/50'
                      }`}
                    >
                      {sec} sek
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Matn Tili (Qaysi tildagi matn) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--sub-color)] flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Matn Tili (Qaysi tilda yoziladi):</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'uz-latn', label: "O'zbekcha" },
                    { id: 'uz-cyrl', label: "Ўзбекча" },
                    { id: 'en', label: 'English' },
                    { id: 'ru', label: 'Русский' },
                    { id: 'code', label: '</> Kod' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.id as any)}
                      className={`py-2 px-1.5 rounded-2xl font-sans font-bold text-[11px] transition-all border text-center truncate cursor-pointer ${
                        selectedLanguage === lang.id
                          ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30 scale-[1.02]'
                          : 'bg-[var(--bg-color)] border-[var(--sub-alt)] text-[var(--text-color)] hover:border-cyan-400/50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
                  Kutmasdan tanlangan vaqt ({selectedDuration}s) va tilda sun'iy intellektli Robot bilan duelga kiring.
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
                  Belgilangan {selectedDuration} soniya va {selectedLanguage} tilida yangi xona oching va kod oling.
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
                  Do'stingiz ochgan xona kodini kiriting va uning shartlari bilan duelga qo'shiling.
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
                : isHost
                ? 'Do\'stingiz xonaga kirgandan so\'ng, siz "JANGNI BOSHLASH" tugmasini bosing:'
                : 'Siz xonaga ulandingiz. Xona egasi (host) jangni boshlashini kuting...'}
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
                <div className="text-[11px] font-mono text-[var(--sub-color)] mt-1.5 flex items-center justify-center gap-2">
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/20 font-bold">
                    ⏱️ {selectedDuration} soniya
                  </span>
                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 font-bold">
                    🌐 {selectedLanguage.toUpperCase()}
                  </span>
                </div>
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
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                {isHost ? 'Siz (Xona Egasi 👑)' : 'Siz (Mehmon ⚔️)'}
              </span>
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
                  <CheckCircle2 className="w-4 h-4" /> Do'stingiz xonaga muvaffaqiyatli ulandi!
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" /> Do'stingiz xona kodini kiritishi kutilmoqda...
                </span>
              )}
            </div>
          )}

          {/* Start Battle Trigger Button: ONLY HOST HAS THIS BUTTON! GUEST SEES WAITING BADGE */}
          <div className="pt-2">
            {isHost ? (
              <button
                onClick={handleTriggerStartMatch}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/25 active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>JANGNI BOSHLASH ⚔️</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs shadow-inner animate-pulse">
                <Hourglass className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Xona egasi (host) jangni boshlashi kutilmoqda...</span>
              </div>
            )}
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
              timeLeft={remainingTime}
              totalDuration={selectedDuration}
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
                    : 'text-rose-400 scale-125 drop-shadow-[0_0_30px_rgba(244,63,94,0.7)]'
                }`}
              >
                {countdown}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Tayyor turing! Barmoqlaringizni klaviaturaga qo'ying.
              </p>
            </div>
          )}

          {/* Racing Typing Box */}
          {gameState === 'racing' && (
            <div className="bg-[var(--card-bg)] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl animate-in fade-in">
              {/* Header Info: Timer & Text details */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-[var(--sub-alt)] pb-2.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Matnni xatosiz va tez tering!</span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-lg border ${
                      remainingTime <= 5
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    ⏱️ Qolgan vaqt: {remainingTime}s
                  </span>
                  <span className="text-[var(--sub-color)] font-bold">
                    Xatolar: <span className="text-rose-400">{myMistakes}</span>
                  </span>
                </div>
              </div>

              {/* Full Text Display with highlight */}
              <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--sub-alt)] text-sm sm:text-base font-mono leading-relaxed tracking-wide select-none">
                {battleText.split('').map((char, idx) => {
                  let cls = 'text-slate-400';
                  if (idx < userInput.length) {
                    cls =
                      userInput[idx] === char
                        ? 'text-cyan-400 font-bold bg-cyan-500/10'
                        : 'text-rose-400 bg-rose-500/20 underline font-bold';
                  } else if (idx === userInput.length) {
                    cls = 'text-white bg-cyan-500/40 px-0.5 rounded animate-pulse font-bold';
                  }
                  return (
                    <span key={idx} className={cls}>
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

          {/* Finished Victory / Defeat Screen with Detailed Stats */}
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
                    {finishReason === 'timeout'
                      ? (isWin
                        ? `⏱️ Vaqt tugadi! Siz raqibdan ko'proq progress va yuqori tezlik ko'rsatib g'olib bo'ldingiz! (+150 XP)`
                        : `⏱️ Vaqt tugadi! Dushman ko'proq progress va tezlik bilan oldinga chiqdi. Qayta o'ynab revansh oling!`)
                      : (isWin
                        ? "Matnni raqibingizdan tezroq va xatosiz to'liq terib birinchi bo'lib marraga yetdingiz! (+150 XP)"
                        : "Raqib butun matnni birinchi bo'lib yozib tugatdi. Qayta o'ynab revansh oling!")}
                  </p>
                </div>

                {/* Match Stats Comparison: Sizniki va Dushmaniki (WPM, Acc, Xatolar, Progress) */}
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                  {/* SIZNIKI */}
                  <div className={`space-y-2 text-left border-r border-slate-800 pr-3 ${isWin ? 'bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold flex items-center gap-1">
                        <span>Sizning Natijangiz</span>
                      </span>
                      {isWin && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">{myProgress.wpm} <span className="text-xs text-cyan-400 font-normal">WPM</span></p>
                    <div className="text-xs font-mono space-y-1 text-slate-300">
                      <p>Aniqlik (Acc): <span className="text-white font-bold">{myProgress.accuracy}%</span></p>
                      <p>Progress: <span className="text-cyan-400 font-bold">{myProgress.progressPercent}%</span></p>
                      <p>Xatolar: <span className="text-rose-400 font-bold">{myMistakes} ta</span></p>
                    </div>
                  </div>

                  {/* DUSHMANIKI */}
                  <div className={`space-y-2 text-left pl-3 ${!isWin ? 'bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-mono uppercase font-bold flex items-center gap-1">
                        <span>Dushman Natijasi</span>
                      </span>
                      {!isWin && <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-2xl sm:text-3xl font-black font-mono text-amber-300">{opponentProgress.wpm} <span className="text-xs text-amber-400 font-normal">WPM</span></p>
                    <div className="text-xs font-mono space-y-1 text-slate-300">
                      <p>Aniqlik (Acc): <span className="text-white font-bold">{opponentProgress.accuracy}%</span></p>
                      <p>Progress: <span className="text-amber-400 font-bold">{opponentProgress.progressPercent}%</span></p>
                      <p>Xatolar: <span className="text-slate-400 font-bold">~{Math.round((100 - opponentProgress.accuracy) / 2)} ta</span></p>
                    </div>
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
