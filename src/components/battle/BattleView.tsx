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
  ShieldAlert,
  Gamepad2
} from 'lucide-react';
import { RaceTrack, RacerProgress } from './RaceTrack';
import { DinoBattleTrack } from './DinoBattleTrack';
import { DinoBattleGame } from './DinoBattleGame';
import { dinoSound } from '../dino/dinoSound';
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
import { BattleGameType, DinoBattlePlayerState } from '../../types';
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
  dinoHighScore?: number;
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

interface BattleViewProps {
  initialRoomCode?: string | null;
  onClearInitialRoomCode?: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  initialRoomCode,
  onClearInitialRoomCode
}) => {
  const { user, profile } = useAuth();
  const { language } = useSettings();

  // Active Mode: 'speedway' (Typing 1v1) or 'dino' (Dino Runner 1v1)
  const [battleType, setBattleType] = useState<BattleGameType>('speedway');

  // Match States: 'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'>('lobby');
  const gameStateRef = useRef<string>('lobby');

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number>(5);
  const isCountingDownRef = useRef<boolean>(false);

  // Speedway Typing State
  const [targetText, setTargetText] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');

  // Real Players from RTDB
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
  const currentName = profile?.displayName || user?.displayName || `Mehmon_${currentUid.slice(-4)}`;
  const currentAvatar = profile?.avatarUrl || user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUid}`;

  // Speedway Player Stats
  const [myProgress, setMyProgress] = useState<RacerProgress>({
    id: currentUid,
    name: currentName,
    avatarUrl: currentAvatar,
    wpm: 0,
    accuracy: 0,
    progressPercent: 0,
    carColor: 'blue'
  });

  const [opponentProgress, setOpponentProgress] = useState<RacerProgress>({
    id: 'opponent_id',
    name: 'Raqib (Kutilmoqda)',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Opponent',
    wpm: 0,
    accuracy: 0,
    progressPercent: 0,
    carColor: 'red',
    isBot: false
  });

  // Dino Battle Player Stats
  const [myDinoState, setMyDinoState] = useState<DinoBattlePlayerState>({
    id: currentUid,
    name: currentName,
    avatarUrl: currentAvatar,
    score: 0,
    distance: 0,
    obstaclesDodged: 0,
    isAlive: true
  });

  const [opponentDinoState, setOpponentDinoState] = useState<DinoBattlePlayerState>({
    id: 'dino_opp',
    name: 'Raqib (Kutilmoqda)',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DinoOpp',
    score: 0,
    distance: 0,
    obstaclesDodged: 0,
    isAlive: true,
    isBot: false
  });

  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [disqualifiedReason, setDisqualifiedReason] = useState<string | null>(null);
  const [inviteSentStatus, setInviteSentStatus] = useState<string | null>(null);
  const [isBotMatch, setIsBotMatch] = useState<boolean>(false);

  // Time & Refs
  const startTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const roomUnsubRef = useRef<(() => void) | null>(null);

  // Check URL parameters for room code on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      const cleanCode = roomParam.trim().toUpperCase();
      setInputRoomCode(cleanCode);
    }
  }, []);

  // Handle incoming initialRoomCode from props
  useEffect(() => {
    if (initialRoomCode) {
      const cleanCode = initialRoomCode.trim().toUpperCase();
      setInputRoomCode(cleanCode);
      handleJoinRoom(cleanCode);
      if (onClearInitialRoomCode) {
        onClearInitialRoomCode();
      }
    }
  }, [initialRoomCode]);

  // Join Room using Room Code
  const handleJoinRoom = async (codeToJoin?: string) => {
    const rawCode = codeToJoin || inputRoomCode;
    const code = rawCode.trim().toUpperCase();

    if (!code) {
      setJoinError('Iltimos, xona kodini kiriting!');
      return;
    }

    setJoinError(null);
    try {
      let snapshot = await get(ref(rtdb, `battles/rooms/${code}`));
      if (!snapshot.exists()) {
        await new Promise((res) => setTimeout(res, 400));
        snapshot = await get(ref(rtdb, `battles/rooms/${code}`));
      }

      if (!snapshot.exists()) {
        setJoinError(`"${code}" kodi bo'yicha xona topilmadi! Kodni tekshirib qayta kiriting.`);
        return;
      }

      const roomVal = snapshot.val();
      if (roomVal.status !== 'waiting' && roomVal.status !== 'countdown' && roomVal.guest?.id !== currentUid) {
        setJoinError("Bu xonada poyga allaqachon boshlangan yoki xona to'la!");
        return;
      }

      const roomGameType: BattleGameType = roomVal.gameType || 'speedway';
      setBattleType(roomGameType);
      setActiveRoomCode(code);
      setIsHost(false);
      setIsBotMatch(false);
      setWinnerId(null);
      setDisqualifiedReason(null);

      if (roomGameType === 'speedway') {
        setTargetText(roomVal.targetText || '');
        setTypedInput('');

        const guestData: RacerProgress = {
          id: currentUid,
          name: currentName,
          avatarUrl: currentAvatar,
          wpm: 0,
          accuracy: 0,
          progressPercent: 0,
          carColor: 'red'
        };

        setMyProgress(guestData);
        setOpponentProgress(roomVal.host);

        await update(ref(rtdb, `battles/rooms/${code}`), {
          guest: guestData,
          status: 'countdown'
        });

        start5SecCountdown(false, roomVal.targetText);
      } else {
        // Dino Game Type
        const guestDinoData: DinoBattlePlayerState = {
          id: currentUid,
          name: currentName,
          avatarUrl: currentAvatar,
          score: 0,
          distance: 0,
          obstaclesDodged: 0,
          isAlive: true
        };

        setMyDinoState(guestDinoData);
        setOpponentDinoState(roomVal.host);

        await update(ref(rtdb, `battles/rooms/${code}`), {
          guest: guestDinoData,
          status: 'countdown'
        });

        start5SecCountdown(false);
      }

      listenToRoom(code, false, roomGameType);
    } catch (err) {
      console.error('Error joining RTDB room:', err);
      setJoinError("Xonaga ulanishda xatolik yuz berdi. Kodni to'g'ri kiritganingizni tekshiring.");
    }
  };

  // Load Real Users from Firebase RTDB Leaderboard
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
                level: p.level || 1,
                dinoHighScore: p.dinoHighScore || 0
              });
            }
          });
          items.sort((a, b) => (battleType === 'dino' ? (b.dinoHighScore || 0) - (a.dinoHighScore || 0) : b.highestWpm - a.highestWpm));
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
  }, [currentUid, battleType]);

  // Generate random race text
  const generateBattleText = () => {
    const langInfo = getLanguageInfo(language);
    if (langInfo.sentences && langInfo.sentences.length >= 2) {
      const shuffled = [...langInfo.sentences].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2).join(' ');
    }
    return langInfo.words.slice(0, 22).join(' ');
  };

  // Create Custom Room
  const handleCreateRoom = async (mode: BattleGameType = battleType) => {
    setJoinError(null);
    const code = generateCleanRoomCode();
    setActiveRoomCode(code);
    setIsHost(true);
    setIsBotMatch(false);
    setGameState('waiting');
    setBattleType(mode);

    if (mode === 'speedway') {
      const text = generateBattleText();
      setTargetText(text);

      const initialHostData: RacerProgress = {
        id: currentUid,
        name: currentName,
        avatarUrl: currentAvatar,
        wpm: 0,
        accuracy: 0,
        progressPercent: 0,
        carColor: 'blue'
      };

      setMyProgress(initialHostData);
      setOpponentProgress({
        id: 'waiting',
        name: 'Raqib kutilmoqda...',
        avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=waiting',
        wpm: 0,
        accuracy: 0,
        progressPercent: 0,
        carColor: 'red'
      });

      try {
        await set(ref(rtdb, `battles/rooms/${code}`), {
          code,
          gameType: 'speedway',
          host: initialHostData,
          guest: null,
          targetText: text,
          status: 'waiting',
          winnerUid: null,
          createdAt: Date.now()
        });
        listenToRoom(code, true, 'speedway');
      } catch (err) {
        console.error('Failed to create RTDB room:', err);
        setJoinError("Xona yaratishda xatolik yuz berdi. Internetingizni tekshirib qayta urinib ko'ring.");
      }
    } else {
      // Dino Room Creation
      const initialHostDino: DinoBattlePlayerState = {
        id: currentUid,
        name: currentName,
        avatarUrl: currentAvatar,
        score: 0,
        distance: 0,
        obstaclesDodged: 0,
        isAlive: true
      };

      setMyDinoState(initialHostDino);
      setOpponentDinoState({
        id: 'waiting',
        name: 'Raqib kutilmoqda...',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=waiting',
        score: 0,
        distance: 0,
        obstaclesDodged: 0,
        isAlive: true
      });

      try {
        await set(ref(rtdb, `battles/rooms/${code}`), {
          code,
          gameType: 'dino',
          host: initialHostDino,
          guest: null,
          status: 'waiting',
          winnerUid: null,
          createdAt: Date.now()
        });
        listenToRoom(code, true, 'dino');
      } catch (err) {
        console.error('Failed to create RTDB dino room:', err);
        setJoinError("Xona yaratishda xatolik yuz berdi.");
      }
    }
  };

  // Real-time listener for Room updates
  const listenToRoom = (code: string, amIHost: boolean, currentType: BattleGameType) => {
    if (roomUnsubRef.current) roomUnsubRef.current();

    const roomRef = ref(rtdb, `battles/rooms/${code}`);
    const unsub = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();

      const opponentRoleData = amIHost ? data.guest : data.host;
      if (opponentRoleData) {
        if (currentType === 'speedway') {
          setOpponentProgress(opponentRoleData);
        } else {
          setOpponentDinoState(opponentRoleData);
        }
      }

      // Handle status transitions
      if (data.status === 'countdown' && (gameStateRef.current === 'waiting' || gameStateRef.current === 'lobby')) {
        start5SecCountdown(false, data.targetText);
      }

      if (data.status === 'racing' && gameStateRef.current === 'countdown') {
        setGameState('racing');
        startTimeRef.current = Date.now();
        if (currentType === 'speedway') {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }

      if (data.status === 'finished') {
        setGameState('finished');
        if (data.winnerUid) {
          setWinnerId(data.winnerUid);
        }
      }
    });

    roomUnsubRef.current = unsub;
  };

  // Invite Player from List
  const handleInvitePlayer = async (player: RealPlayerItem) => {
    const code = generateCleanRoomCode();
    setInviteSentStatus(`⚔️ @${player.username} ga ${battleType === 'dino' ? '🦖 Dino Dueli' : '🏎️ Speedway'} taklifi yuborildi (Kodi: ${code}). Kutilmoqda...`);

    // Create room
    await handleCreateRoom(battleType);

    // Write invite into target user's RTDB inbox
    try {
      await set(ref(rtdb, `battles/invites/${player.uid}`), {
        inviteId: 'inv_' + Date.now(),
        roomId: code,
        inviterUid: currentUid,
        inviterName: currentName,
        inviterAvatar: currentAvatar,
        inviterWpm: profile?.highestWpm || 85,
        gameType: battleType,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('Invite send error:', err);
    }
  };

  // Start Solo Practice vs AI Bot
  const startBotMatch = () => {
    setWinnerId(null);
    setDisqualifiedReason(null);
    setIsBotMatch(true);

    const generatedCode = generateCleanRoomCode();
    setActiveRoomCode(generatedCode);

    if (battleType === 'speedway') {
      const text = generateBattleText();
      setTargetText(text);
      setTypedInput('');

      setMyProgress({
        id: currentUid,
        name: currentName,
        avatarUrl: currentAvatar,
        wpm: 0,
        accuracy: 0,
        progressPercent: 0,
        carColor: 'blue'
      });

      setOpponentProgress({
        id: 'bot_id',
        name: 'Cyber_Racer_Bot',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBot',
        wpm: 0,
        accuracy: 0,
        progressPercent: 0,
        carColor: 'red',
        isBot: true
      });

      start5SecCountdown(true, text);
    } else {
      // Dino Bot Match
      setMyDinoState({
        id: currentUid,
        name: currentName,
        avatarUrl: currentAvatar,
        score: 0,
        distance: 0,
        obstaclesDodged: 0,
        isAlive: true
      });

      setOpponentDinoState({
        id: 'bot_dino_id',
        name: 'Cyber_Dino_Bot',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberDinoBot',
        score: 0,
        distance: 0,
        obstaclesDodged: 0,
        isAlive: true,
        isBot: true
      });

      start5SecCountdown(true);
    }
  };

  // 5-Second Countdown Logic
  const start5SecCountdown = (isBot = false, textToUse?: string) => {
    if (isCountingDownRef.current && gameStateRef.current === 'countdown') return;
    isCountingDownRef.current = true;

    setGameState('countdown');
    setCountdown(5);

    let currentCount = 5;
    const interval = setInterval(() => {
      currentCount--;
      setCountdown(currentCount);

      if (currentCount <= 0) {
        clearInterval(interval);
        isCountingDownRef.current = false;
        setGameState('racing');
        startTimeRef.current = Date.now();

        if (battleType === 'speedway') {
          setTimeout(() => inputRef.current?.focus(), 100);
          if (isBot || isBotMatch) {
            startBotEngine(textToUse || targetText, 85);
          }
        }
      }
    }, 1000);
  };

  // Speedway AI Bot engine
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

  // Speedway KeyDown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return;

    if (e.key === 'Backspace') {
      const minLen = getLockedMinLength(targetText, typedInput);
      if (typedInput.length <= minLen) {
        e.preventDefault();
        return;
      }
    }

    if (e.key === ' ') {
      const targetNextIdx = getNextWordStartIndexOnSpace(targetText, typedInput);
      if (targetNextIdx && typedInput.length < targetNextIdx) {
        e.preventDefault();
        const paddedInput = typedInput.padEnd(targetNextIdx, ' ');
        setTypedInput(paddedInput);
        processTypedInputUpdate(paddedInput);
        return;
      }
    }
  };

  // Process Speedway progress
  const processTypedInputUpdate = (val: string) => {
    const elapsedSeconds = Math.max(1, (Date.now() - startTimeRef.current) / 1000);

    let correctCount = 0;
    const targetArr = targetText.split('');
    const typedArr = val.split('');

    typedArr.forEach((ch, i) => {
      if (i < targetArr.length && ch === targetArr[i]) {
        correctCount++;
      }
    });

    const liveWpm = calculateNetWpm(correctCount, val.length, elapsedSeconds);
    const liveAcc = calculateAccuracy(correctCount, val.length);
    const progress = Math.min(100, (val.length / Math.max(1, targetText.length)) * 100);

    const updatedMyProgress: RacerProgress = {
      ...myProgress,
      wpm: liveWpm,
      accuracy: liveAcc,
      progressPercent: progress
    };

    setMyProgress(updatedMyProgress);

    if (activeRoomCode && !isBotMatch) {
      const roleKey = isHost ? 'host' : 'guest';
      update(ref(rtdb, `battles/rooms/${activeRoomCode}/${roleKey}`), {
        wpm: liveWpm,
        accuracy: liveAcc,
        progressPercent: progress
      }).catch(() => {});
    }

    if (val.length >= targetText.length) {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      setGameState('finished');

      const errorsCount = val.length - correctCount;
      const isDisqualified = liveAcc < 80 || liveWpm === 0 || errorsCount > Math.max(5, targetText.length * 0.2);

      if (isDisqualified) {
        const reasonText = `Juda ko'p xatolar qilindi! Aniqligingiz ${liveAcc}% (minimum 80% talab qilinadi). Ataylab noto'g'ri yozganingiz uchun mag'lubiyat berildi!`;
        setDisqualifiedReason(reasonText);
        const actualWinner = opponentProgress.id;
        setWinnerId(actualWinner);
        setOpponentProgress((prev) => ({ ...prev, isWinner: true }));

        if (activeRoomCode && !isBotMatch) {
          update(ref(rtdb, `battles/rooms/${activeRoomCode}`), {
            status: 'finished',
            winnerUid: actualWinner
          }).catch(() => {});
        }
      } else {
        setDisqualifiedReason(null);
        setWinnerId(currentUid);
        setMyProgress((prev) => ({ ...prev, isWinner: true }));

        if (activeRoomCode && !isBotMatch) {
          update(ref(rtdb, `battles/rooms/${activeRoomCode}`), {
            status: 'finished',
            winnerUid: currentUid
          }).catch(() => {});
        }
      }
    }
  };

  // Speedway Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return;
    const val = e.target.value;

    const minLen = getLockedMinLength(targetText, typedInput);
    if (val.length < minLen) {
      return;
    }

    setTypedInput(val);
    processTypedInputUpdate(val);
  };

  // Dino Battle Finish Handler
  const handleDinoFinish = (winningPlayerId: string, myFinalScore: number, oppFinalScore: number) => {
    setWinnerId(winningPlayerId);
    setGameState('finished');

    setMyDinoState((prev) => ({
      ...prev,
      score: myFinalScore,
      isWinner: winningPlayerId === currentUid
    }));

    setOpponentDinoState((prev) => ({
      ...prev,
      score: oppFinalScore,
      isWinner: winningPlayerId !== currentUid
    }));

    if (activeRoomCode && !isBotMatch) {
      update(ref(rtdb, `battles/rooms/${activeRoomCode}`), {
        status: 'finished',
        winnerUid: winningPlayerId
      }).catch(() => {});
    }
  };

  // Sound triggers for countdown and finished states
  useEffect(() => {
    if (gameState === 'countdown') {
      dinoSound.playCountdownBeep(countdown <= 1);
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (winnerId === currentUid && !disqualifiedReason) {
        dinoSound.playVictory();
      } else {
        dinoSound.playDefeat();
      }
    }
  }, [gameState, winnerId, currentUid, disqualifiedReason]);

  // Rematch action
  const handleRematch = async () => {
    setWinnerId(null);
    setDisqualifiedReason(null);

    if (isBotMatch || !activeRoomCode) {
      startBotMatch();
      return;
    }

    if (battleType === 'speedway') {
      const text = generateBattleText();
      setTargetText(text);
      setTypedInput('');

      try {
        await update(ref(rtdb, `battles/rooms/${activeRoomCode}`), {
          status: 'countdown',
          winnerUid: null,
          targetText: text,
          'host/wpm': 0,
          'host/accuracy': 100,
          'host/progressPercent': 0,
          'host/isWinner': false,
          'guest/wpm': 0,
          'guest/accuracy': 100,
          'guest/progressPercent': 0,
          'guest/isWinner': false
        });
        start5SecCountdown(false, text);
      } catch {
        startBotMatch();
      }
    } else {
      try {
        await update(ref(rtdb, `battles/rooms/${activeRoomCode}`), {
          status: 'countdown',
          winnerUid: null,
          'host/score': 0,
          'host/distance': 0,
          'host/obstaclesDodged': 0,
          'host/isAlive': true,
          'host/isWinner': false,
          'guest/score': 0,
          'guest/distance': 0,
          'guest/obstaclesDodged': 0,
          'guest/isAlive': true,
          'guest/isWinner': false
        });
        start5SecCountdown(false);
      } catch {
        startBotMatch();
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

  const handleCopyLink = () => {
    if (activeRoomCode) {
      const directUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoomCode}`;
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
      {/* Sleek Header Title with Mode Switcher */}
      <div className="bg-gradient-to-r from-[#0c1322] via-[#11192e] to-[#0c1322] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            {battleType === 'dino' ? <span className="text-xl">🦖</span> : <Swords className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              BATTLE ARENA{' '}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                1v1 REAL TIME
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {battleType === 'dino'
                ? 'Do\'stlar yoki bot bilan T-Rex Dino Runner rekord va omon qolish dueliga kiring!'
                : 'Ishtirokchilar bilan real vaqt rejimida tezkor yozish dueliga kirishing!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Lobby Mode Toggle Tabs if in Lobby */}
          {gameState === 'lobby' && (
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBattleType('speedway')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                  battleType === 'speedway'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🏎️</span>
                <span>Speedway</span>
              </button>
              <button
                onClick={() => setBattleType('dino')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                  battleType === 'dino'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🦖</span>
                <span>Dino Duel</span>
              </button>
            </div>
          )}

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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lobbiyga Qaytish</span>
            </button>
          )}
        </div>
      </div>

      {/* Invite Notification Banner */}
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
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{battleType === 'dino' ? '🦖 Dino Duel Xonasi' : '🏎️ Speedway Xonasi'}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  {battleType === 'dino' ? 'DINO BATTLE' : 'SPEEDWAY'}
                </span>
              </div>

              {/* Create Custom Room Button */}
              <button
                onClick={() => handleCreateRoom(battleType)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md active:scale-95 ${
                  battleType === 'dino'
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 shadow-cyan-500/20'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{battleType === 'dino' ? '🦖 DINO XONA YARATISH ✨' : 'XONA YARATISH ✨'}</span>
              </button>

              {/* Room Code Join Box */}
              <div className="pt-2 space-y-2 border-t border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Xona Kodi Bilan Kirish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    placeholder="Kodni kiriting (masalan: K7N9XP)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleJoinRoom()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    Kirish
                  </button>
                </div>
                {joinError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1 bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{joinError}</span>
                  </p>
                )}
              </div>

              {/* Solo AI Bot Duel Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={startBotMatch}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 hover:text-cyan-200 font-bold text-xs border border-cyan-500/30 transition-all shadow-inner active:scale-95"
                >
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>
                    {battleType === 'dino'
                      ? 'Cyber Dino Bot Bilan O\'ynash 🤖'
                      : 'Cyber Bot Bilan Mashq 🤖'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Rules Card */}
            <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-400 space-y-1.5">
              <h4 className="font-bold text-slate-300 uppercase font-mono text-[10px] flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> Arena Qoidalari
              </h4>
              {battleType === 'dino' ? (
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li>Ikkala o'yinchi bir vaqtda to'siqlardan sakrab yuguradi!</li>
                  <li>Space / W / ↑ - Sakrash, S / ↓ - Egilish.</li>
                  <li>Kim ko'p masofa va ball to'plasa mutlaq g'olib bo'ladi!</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li>Xona yaratib kodni do'stingizga bering yoki taklif qiling.</li>
                  <li>Poygada xatolarga jarima hisoblanadi (aniqlik kamida 80%).</li>
                  <li>Marra chizig'iga birinchi yetib borgan haydovchi g'olib bo'ladi!</li>
                </ul>
              )}
            </div>
          </div>

          {/* Real Players List & Live Invite Column */}
          <div className="md:col-span-7 space-y-3">
            <div className="bg-[#0e1626] border border-cyan-500/20 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Onlayn Foydalanuvchilar & Duel Chaqiruvi</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {realPlayers.length} ta ishtirokchi
                </span>
              </div>

              {loadingPlayers ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono animate-pulse">
                  Foydalanuvchilar yuklanmoqda...
                </div>
              ) : realPlayers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono space-y-2">
                  <p>Hozircha boshqa onlayn ishtirokchilar topilmadi.</p>
                  <p className="text-[11px] text-cyan-400">
                    Do'stingizga yuqoridagi "XONA YARATISH" orqali kod ulashishingiz mumkin!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {realPlayers.map((p) => (
                    <div
                      key={p.uid}
                      className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.avatarUrl}
                          alt={p.displayName}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate max-w-[130px] sm:max-w-[180px]">
                              {p.displayName}
                            </span>
                            <span className="text-[9px] font-mono text-cyan-400 font-bold">
                              Lvl {p.level || 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                            {battleType === 'dino' ? (
                              <span className="text-amber-400 font-bold">
                                🦖 Dino: {p.dinoHighScore || 0} pts
                              </span>
                            ) : (
                              <>
                                <span className="text-cyan-400 font-bold">{p.highestWpm} WPM</span>
                                <span>{p.highestAccuracy}% Acc</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInvitePlayer(p)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Duelga Chorlash</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. WAITING FOR OPPONENT STATE */}
      {gameState === 'waiting' && (
        <div className="bg-[#0e1626] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 text-center text-white space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-1 animate-pulse">
              {battleType === 'dino' ? <span className="text-2xl">🦖</span> : <Share2 className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-black uppercase font-mono tracking-wider text-amber-400">
              {battleType === 'dino' ? '🦖 DINO BATTLE XONASI TAYYOR!' : 'BATTLE XONASI TAYYOR!'}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Quyidagi xona kodini do'stingizga berishingiz yoki to'g'ridan-to'g'ri ssilkani ulashishingiz mumkin! U kirgan zahoti duel avtomatik boshlanadi.
            </p>
          </div>

          {/* Room Code Display Box */}
          <div className="bg-slate-950/90 border-2 border-cyan-400/80 p-5 rounded-2xl max-w-md mx-auto space-y-3 shadow-inner">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              XONA KODI
            </span>
            <div className="text-4xl font-black font-mono tracking-widest text-amber-400 flex items-center justify-center gap-3">
              <span>{activeRoomCode}</span>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase font-mono transition-all active:scale-95 shadow-md"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Nusxalandi! ✅' : 'Kodni Nusxalash'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase font-mono transition-all active:scale-95 shadow-md"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <LinkIcon className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Ssilka Nusxalandi! ✅' : 'Ssilkani Nusxalash'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Kutilmoqda... Do'stingiz "Xona kodi bilan kirish" joyiga kiritishi kerak.</span>
          </div>
        </div>
      )}

      {/* 3. COUNTDOWN STATE */}
      {gameState === 'countdown' && (
        <div className="bg-[#0d1322] border-2 border-cyan-500/50 rounded-2xl p-8 text-center text-white space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase font-mono tracking-wider text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />{' '}
              {battleType === 'dino' ? '🦖 DINO BATTLE TAYYORGARLIGI!' : '🏎️ BATTLE TAYYORGARLIGI!'}
            </h2>
            <p className="text-xs text-slate-400">
              Tayyor turing! Soniyalar tugagach, duel start oladi!
            </p>
          </div>

          {/* Countdown Number */}
          <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-amber-500/20 border-4 border-cyan-400 text-5xl font-black font-mono text-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-bounce">
            {countdown}
          </div>

          {/* Player vs Opponent Preview Cards */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2 border-t border-slate-800">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-2.5">
              <img
                src={battleType === 'dino' ? myDinoState.avatarUrl : myProgress.avatarUrl}
                alt="my"
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="text-left overflow-hidden">
                <span className="text-[9px] text-cyan-400 uppercase font-mono block">Siz</span>
                <span className="text-xs font-bold text-white truncate block">
                  {battleType === 'dino' ? myDinoState.name : myProgress.name}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-2.5">
              <img
                src={battleType === 'dino' ? opponentDinoState.avatarUrl : opponentProgress.avatarUrl}
                alt="opp"
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="text-left overflow-hidden">
                <span className="text-[9px] text-rose-400 uppercase font-mono block">Raqib</span>
                <span className="text-xs font-bold text-white truncate block">
                  {battleType === 'dino' ? opponentDinoState.name : opponentProgress.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RACING & 5. FINISHED STATE */}
      {(gameState === 'racing' || gameState === 'finished') && (
        <div className="space-y-4">
          {/* SPEEDWAY MODE */}
          {battleType === 'speedway' ? (
            <>
              {/* Compact Race Track */}
              <RaceTrack racers={[myProgress, opponentProgress]} isRacing={gameState === 'racing'} />

              {/* Typing Engine Card */}
              <div
                onClick={() => inputRef.current?.focus()}
                className="bg-[#0c1220] border-2 border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative cursor-text"
              >
                {/* Hidden Input field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={typedInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={gameState === 'finished'}
                  className="absolute opacity-0 pointer-events-none"
                  autoFocus
                />

                {/* Target Text Display - CLEAN NATURAL SPACES (NO UGLY PROBEL SYMBOL) */}
                <div className="text-base sm:text-lg font-mono leading-relaxed tracking-wide select-none p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 min-h-28 flex flex-wrap items-center whitespace-pre-wrap">
                  {targetText.split('').map((char, index) => {
                    let colorClass = 'text-slate-500';
                    const isSpace = char === ' ';
                    const isTyped = index < typedInput.length;
                    const isCurrent = index === typedInput.length;

                    if (isTyped) {
                      if (typedInput[index] === char) {
                        colorClass = 'text-emerald-400 font-bold';
                      } else {
                        colorClass = isSpace
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'text-rose-400 font-bold bg-rose-950/60 rounded underline decoration-rose-500';
                      }
                    } else if (isCurrent) {
                      colorClass = isSpace
                        ? 'border-b-2 border-cyan-400 text-slate-500'
                        : 'text-white font-black bg-cyan-500/20 underline decoration-cyan-400 rounded-sm';
                    }

                    return (
                      <span key={index} className={`inline-block ${colorClass}`}>
                        {isSpace ? ' ' : char}
                      </span>
                    );
                  })}
                </div>

                <p className="text-center text-[11px] text-slate-400 font-mono italic">
                  💡 Yozish uchun matn ustiga bosing va tugmalarni ketma-ket bosing!
                </p>
              </div>

              {/* Speedway Victory / Result Overlay */}
              {gameState === 'finished' && (() => {
                const isWin = winnerId === currentUid && !disqualifiedReason;
                return (
                  <div
                    className={`border-2 rounded-3xl p-6 sm:p-8 text-center text-white space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 ${
                      disqualifiedReason
                        ? 'bg-gradient-to-br from-[#1a0808] via-[#2d0f0f] to-[#1a0808] border-rose-500 shadow-rose-500/20'
                        : isWin
                          ? 'bg-gradient-to-br from-[#07191d] via-[#0b292e] to-[#12233b] border-emerald-400/90 shadow-emerald-500/20'
                          : 'bg-gradient-to-br from-[#1c0e15] via-[#29131d] to-[#161224] border-rose-500/80 shadow-rose-500/20'
                    }`}
                  >
                    {/* Visual Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl border-2 mb-1 shadow-lg ${
                        disqualifiedReason
                          ? 'bg-rose-500/20 border-rose-400 text-rose-400 animate-pulse'
                          : isWin
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-bounce'
                            : 'bg-rose-500/20 border-rose-400 text-rose-400'
                      }`}
                    >
                      {disqualifiedReason ? (
                        <ShieldAlert className="w-9 h-9" />
                      ) : isWin ? (
                        <Crown className="w-9 h-9" />
                      ) : (
                        <Skull className="w-8 h-8" />
                      )}
                    </div>

                    {/* Headline and Message */}
                    <div className="space-y-1.5">
                      <h2
                        className={`text-2xl sm:text-3xl font-black uppercase font-mono tracking-wider ${
                          disqualifiedReason
                            ? 'text-rose-400'
                            : isWin
                              ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                              : 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                        }`}
                      >
                        {disqualifiedReason
                          ? '❌ SIZ YUTQAZDINGIZ! (DISKVALIFIKATSIYA)'
                          : isWin
                            ? '🏆 SIZ YUTDINGIZ! G\'ALABA!'
                            : '💥 SIZ YUTQAZDINGIZ!'}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                        {disqualifiedReason
                          ? 'Poygada juda ko\'p xatolar va past aniqlik sababli diskvalifikatsiya qilindingiz.'
                          : isWin
                            ? 'Ajoyib tezlik va aniqlik! Raqibingizni mahorat bilan mag\'lub etdingiz.'
                            : 'Raqibingiz marraga birinchi yetib keldi. Keyingi raundda qasos oling!'}
                      </p>
                    </div>

                    {/* XP Bonus Tag */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className={isWin ? 'text-emerald-400' : 'text-amber-400'}>
                        {isWin ? '+150 XP G\'alaba Mukofoti' : '+50 XP Tajriba'}
                      </span>
                    </div>

                    {disqualifiedReason && (
                      <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-3 text-rose-200 text-xs font-mono max-w-md mx-auto shadow-inner text-center">
                        ⚠️ {disqualifiedReason}
                      </div>
                    )}

                    {/* Match Stats Comparison Grid */}
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                      <div className={`space-y-1 text-left border-r border-slate-800 pr-3 ${isWin ? 'bg-emerald-950/20 p-2 rounded-xl' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Sizning Natijangiz</span>
                          {isWin && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-xl font-black font-mono text-white">{myProgress.wpm} WPM</p>
                        <p
                          className={`text-xs font-mono ${
                            myProgress.accuracy < 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'
                          }`}
                        >
                          {myProgress.accuracy}% Aniqlik
                        </p>
                      </div>

                      <div className={`space-y-1 text-left pl-3 ${!isWin && !disqualifiedReason ? 'bg-rose-950/20 p-2 rounded-xl' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">Raqib Natijasi</span>
                          {!isWin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-xl font-black font-mono text-white">{opponentProgress.wpm} WPM</p>
                        <p className="text-xs font-mono text-emerald-400">{opponentProgress.accuracy}% Aniqlik</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={handleRematch}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{isWin ? '⚡ QAYTA O\'YNASH (REMATCH)' : '🔥 QASOS DUELI (REMATCH)'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setGameState('lobby');
                          setDisqualifiedReason(null);
                          setActiveRoomCode('');
                        }}
                        className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95"
                      >
                        <span>LOBBIYGA QAYTISH</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            /* DINO RUNNER BATTLE MODE */
            <>
              {/* Dino Telemetry Track */}
              <DinoBattleTrack
                player1={myDinoState}
                player2={opponentDinoState}
                isRacing={gameState === 'racing'}
              />

              {/* Dino Battle Live Canvas & Controls */}
              {gameState === 'racing' && (
                <DinoBattleGame
                  roomId={activeRoomCode}
                  isHost={isHost}
                  isBotMatch={isBotMatch}
                  myInfo={myDinoState}
                  opponentInfo={opponentDinoState}
                  onFinish={handleDinoFinish}
                  onExit={() => setGameState('lobby')}
                />
              )}

              {/* Dino Battle Finished Screen */}
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
                        {isWin
                          ? '🦖 SIZ YUTDINGIZ! G\'ALABA! 🏆'
                          : '💥 SIZ YUTQAZDINGIZ!'}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                        {isWin
                          ? 'Dino to\'siqlarini ajoyib tarzda yengib o\'tdingiz va g\'olib bo\'ldingiz!'
                          : 'To\'siqqa urildingiz! Raqib bu safar ustun keldi. Qayta urinib ko\'ring!'}
                      </p>
                    </div>

                    {/* XP Tag */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className={isWin ? 'text-emerald-400' : 'text-amber-400'}>
                        {isWin ? '+150 XP G\'alaba Mukofoti' : '+50 XP Tajriba'}
                      </span>
                    </div>

                    {/* Dino Match Stats Comparison */}
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-950/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                      <div className={`space-y-1 text-left border-r border-slate-800 pr-3 ${isWin ? 'bg-emerald-950/20 p-2 rounded-xl' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold">
                            Sizning Natijangiz
                          </span>
                          {isWin && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-xl font-black font-mono text-cyan-300">{myDinoState.score} ball</p>
                        <p className="text-xs font-mono text-slate-300">
                          Masofa: <span className="text-white font-bold">{Math.floor(myDinoState.distance)}m</span>
                        </p>
                        <p className="text-xs font-mono text-emerald-400">
                          To'siqlar: <span className="font-bold">{myDinoState.obstaclesDodged}</span>
                        </p>
                      </div>

                      <div className={`space-y-1 text-left pl-3 ${!isWin ? 'bg-rose-950/20 p-2 rounded-xl' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">
                            Raqib Natijasi
                          </span>
                          {!isWin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-xl font-black font-mono text-amber-300">{opponentDinoState.score} ball</p>
                        <p className="text-xs font-mono text-slate-300">
                          Masofa: <span className="text-white font-bold">{Math.floor(opponentDinoState.distance)}m</span>
                        </p>
                        <p className="text-xs font-mono text-emerald-400">
                          To'siqlar: <span className="font-bold">{opponentDinoState.obstaclesDodged}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={handleRematch}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{isWin ? '⚡ QAYTA DUEL BOSHLASH' : '🔥 QASOS DUELI (REMATCH)'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setGameState('lobby');
                          setActiveRoomCode('');
                        }}
                        className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95"
                      >
                        <span>LOBBIYGA QAYTISH</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
};
