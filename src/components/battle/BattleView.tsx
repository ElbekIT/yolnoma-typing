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
  ShieldAlert,
  Flame,
  CheckCircle2,
  Copy,
  PlusCircle,
  Share2,
  Target,
  UserCheck,
  Bot
} from 'lucide-react';
import { RaceTrack, RacerProgress } from './RaceTrack';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getLanguageInfo } from '../../config/languages';
import { calculateWpm, calculateAccuracy } from '../../utils/typingEngine';
import { rtdb } from '../../config/firebase';
import { ref, set, onValue, update, remove, push } from 'firebase/database';

interface BattleViewProps {
  onStartAlone?: () => void;
}

// Sample Online Leaderboard Users for Inviting
const SAMPLE_ONLINE_PLAYERS = [
  { uid: 'player_01', name: 'Jasur_SpeedKing', wpm: 124, rank: 1, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Jasur', status: 'online' },
  { uid: 'player_02', name: 'Anvar_Dev99', wpm: 110, rank: 2, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Anvar', status: 'online' },
  { uid: 'player_03', name: 'Madina_Typist', wpm: 98, rank: 3, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Madina', status: 'online' },
  { uid: 'player_04', name: 'Sardor_Viper', wpm: 92, rank: 4, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Sardor', status: 'online' },
  { uid: 'player_05', name: 'Dilnoza_Fast', wpm: 87, rank: 5, avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Dilnoza', status: 'online' },
  { uid: 'player_06', name: 'Bot_CyberRacer', wpm: 85, rank: 6, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBot', status: 'bot' }
];

export const BattleView: React.FC<BattleViewProps> = () => {
  const { user, profile } = useAuth();
  const { language, soundProfile } = useSettings();

  // Match States: 'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'>('lobby');

  const [roomId, setRoomId] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(5);

  // Text & Typing Engine
  const [targetText, setTargetText] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');

  // Player Stats
  const [myProgress, setMyProgress] = useState<RacerProgress>({
    id: user?.uid || 'guest_user',
    name: profile?.displayName || 'Siz (Sizning Moshinangiz)',
    avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.uid || 'guest'}`,
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
  const [invitedPlayerName, setInvitedPlayerName] = useState<string | null>(null);
  const [inviteSentStatus, setInviteSentStatus] = useState<string | null>(null);

  // Time & Refs
  const startTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize room or target text
  const generateBattleText = () => {
    const langInfo = getLanguageInfo(language);
    const sentences = langInfo.sentences && langInfo.sentences.length > 0 ? langInfo.sentences : langInfo.words;
    // Pick 2 random sentences or 25 random words for race text
    if (langInfo.sentences && langInfo.sentences.length >= 2) {
      const shuffled = [...langInfo.sentences].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2).join(' ');
    }
    return langInfo.words.slice(0, 25).join(' ');
  };

  // Start Quick Match vs Bot or Online Player
  const startQuickMatch = (opponentName = 'Pro_Racer_Bot', isBot = true, wpmTarget = 85) => {
    const text = generateBattleText();
    setTargetText(text);
    setTypedInput('');
    setWinnerId(null);

    const generatedRoomId = 'room_' + Math.floor(100000 + Math.random() * 900000);
    setRoomId(generatedRoomId);

    setMyProgress({
      id: user?.uid || 'me',
      name: profile?.displayName || 'Siz',
      avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.uid || 'me'}`,
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'blue'
    });

    setOpponentProgress({
      id: isBot ? 'bot_id' : 'opponent_user',
      name: opponentName,
      avatarUrl: isBot
        ? `https://api.dicebear.com/7.x/bottts/svg?seed=${opponentName}`
        : `https://api.dicebear.com/7.x/identicon/svg?seed=${opponentName}`,
      wpm: 0,
      accuracy: 100,
      progressPercent: 0,
      carColor: 'red',
      isBot
    });

    // Go to 5-second countdown!
    start5SecCountdown(text, isBot, wpmTarget);
  };

  // Invite Leaderboard Player
  const handleInvitePlayer = (p: typeof SAMPLE_ONLINE_PLAYERS[0]) => {
    setInvitedPlayerName(p.name);
    setInviteSentStatus(`⚔️ ${p.name}ga taklifnoma yuborildi! Kutilmoqda...`);

    // Write to Realtime DB if logged in
    if (user && p.uid) {
      try {
        const inviteRef = ref(rtdb, `battles/invites/${p.uid}`);
        set(inviteRef, {
          inviteId: 'inv_' + Date.now(),
          roomId: 'room_' + Math.floor(100000 + Math.random() * 900000),
          inviterUid: user.uid,
          inviterName: profile?.displayName || 'Yolnoma User',
          inviterAvatar: profile?.avatarUrl || '',
          inviterWpm: profile?.highestWpm || 85,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('Firebase DB invite error:', err);
      }
    }

    // Auto launch 3s simulation if bot or player accepts
    setTimeout(() => {
      setInviteSentStatus(`✅ ${p.name} taklifni qabul qildi! Poyga boshlanmoqda...`);
      setTimeout(() => {
        setInviteSentStatus(null);
        startQuickMatch(p.name, p.status === 'bot', p.wpm);
      }, 1200);
    }, 2000);
  };

  // 5-Second Countdown Logic
  const start5SecCountdown = (text: string, isBot: boolean, botTargetWpm = 85) => {
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

        // Focus typing input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

        // If opponent is Bot, simulate bot typing progress
        if (isBot) {
          startBotEngine(text, botTargetWpm);
        }
      }
    }, 1000);
  };

  // AI Bot typing simulation along the race track
  const startBotEngine = (text: string, botTargetWpm: number) => {
    if (botTimerRef.current) clearInterval(botTimerRef.current);

    const totalChars = text.length;
    // Estimated time in seconds = (chars / 5) / (wpm / 60)
    const durationSeconds = (totalChars / 5) / (botTargetWpm / 60);
    const intervalMs = 200; // Update 5 times per sec
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
        // Bot finished
        setGameState((currentGameState) => {
          if (currentGameState === 'racing') {
            setWinnerId('bot_id');
            setOpponentProgress((prev) => ({ ...prev, isWinner: true }));
            return 'finished';
          }
          return currentGameState;
        });
      }
    }, intervalMs);
  };

  // Handle My Typing Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'racing') return;

    const val = e.target.value;
    setTypedInput(val);

    const elapsedSeconds = Math.max(1, (Date.now() - startTimeRef.current) / 1000);

    // Calculate correct chars
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

    setMyProgress((prev) => ({
      ...prev,
      wpm: liveWpm,
      accuracy: liveAcc,
      progressPercent: progress
    }));

    // Check if player finished the race text!
    if (val.length >= targetText.length) {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
      setGameState('finished');
      setWinnerId(user?.uid || 'me');
      setMyProgress((prev) => ({ ...prev, isWinner: true }));
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Page Title Header */}
      <div className="bg-gradient-to-r from-[#0c1322] via-[#11192e] to-[#0c1322] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Swords className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              BATTLE ARENA <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">1v1 PvP POYGA</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Real vaqt rejimida moshinangiz bilan klaviatura tezligi va aniqligi bo'yicha duelga kirishing!
            </p>
          </div>
        </div>

        {gameState !== 'lobby' && (
          <button
            onClick={() => {
              if (botTimerRef.current) clearInterval(botTimerRef.current);
              setGameState('lobby');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Lobbiyga Qaytish</span>
          </button>
        )}
      </div>

      {/* Global Status Banner Notification if Invite Sent */}
      {inviteSentStatus && (
        <div className="bg-cyan-950/90 border-2 border-cyan-500 text-cyan-200 px-5 py-3 rounded-2xl text-xs font-black font-mono flex items-center justify-between shadow-xl animate-bounce">
          <span>{inviteSentStatus}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        </div>
      )}

      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Match & Room Creation Box */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-[#0e1626] border border-cyan-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white font-black text-sm uppercase font-mono border-b border-slate-800 pb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Tezkor O'yin / Xona</span>
              </div>

              {/* Quick Start Button */}
              <button
                onClick={() => startQuickMatch('Cyber_Racer_Bot', true, 85)}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>TASODIFIY BOT RAQIB 🎲</span>
              </button>

              {/* Room Code Join Box */}
              <div className="pt-2 space-y-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Xona Kodi Bilan Kirish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    placeholder="Masalan: ROOM123"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => {
                      if (inputRoomCode.trim()) {
                        startQuickMatch(`Player_${inputRoomCode}`, false, 90);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-all"
                  >
                    Kirish
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Online Players & Leaderboard Invites */}
          <div className="md:col-span-2 bg-[#0e1626] border border-cyan-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="font-black text-sm text-white uppercase font-mono">
                  Online O'yinchilar Va Peshqadamlar
                </h3>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> 6 Online
              </span>
            </div>

            {/* List of Online Leaderboard Players to Challenge */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {SAMPLE_ONLINE_PLAYERS.map((p) => (
                <div
                  key={p.uid}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-500 w-5">#{p.rank}</span>
                    <div className="relative">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.status === 'bot' && (
                          <span className="text-[9px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                            BOT
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-amber-400 font-mono font-semibold">
                        ⚡ {p.wpm} WPM Best
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInvitePlayer(p)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>CHAQIRISH ⚔️</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COUNTDOWN STATE (5, 4, 3, 2, 1, GO!) */}
      {gameState === 'countdown' && (
        <div className="bg-[#0d1322] border-2 border-cyan-500/50 rounded-3xl p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black uppercase font-mono tracking-wider text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 animate-spin" /> BATTLE TAYYORGARLIGI!
            </h2>
            <p className="text-xs text-slate-400">
              Barmoqlaringizni klaviaturaga qo'ying! 5 soniyadan so'ng poyga boshlanadi!
            </p>
          </div>

          {/* Giant Countdown Number */}
          <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-amber-500/20 border-4 border-cyan-400 text-6xl font-black font-mono text-cyan-300 shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-bounce">
            {countdown}
          </div>

          {/* Player vs Opponent Preview Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-4 border-t border-slate-800">
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-cyan-500/30 flex items-center gap-3">
              <img src={myProgress.avatarUrl} alt="my" className="w-10 h-10 rounded-full" />
              <div className="text-left overflow-hidden">
                <span className="text-[10px] text-cyan-400 uppercase font-mono block">Siz</span>
                <span className="text-xs font-bold text-white truncate block">{myProgress.name}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-2xl border border-rose-500/30 flex items-center gap-3">
              <img src={opponentProgress.avatarUrl} alt="opp" className="w-10 h-10 rounded-full" />
              <div className="text-left overflow-hidden">
                <span className="text-[10px] text-rose-400 uppercase font-mono block">Raqib</span>
                <span className="text-xs font-bold text-white truncate block">{opponentProgress.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RACING & 4. FINISHED STATE */}
      {(gameState === 'racing' || gameState === 'finished') && (
        <div className="space-y-6">
          {/* Animated Race Track with Moving Cars */}
          <RaceTrack racers={[myProgress, opponentProgress]} isRacing={gameState === 'racing'} />

          {/* Typing Engine Card */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="bg-[#0c1220] border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative cursor-text"
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
            <div className="text-lg sm:text-xl md:text-2xl font-mono leading-relaxed tracking-wide select-none p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-h-36 flex flex-wrap items-center">
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

            <p className="text-center text-xs text-slate-400 font-mono italic">
              💡 Yozishni davom ettirish uchun matn ustiga bosing va harflarni kiriting!
            </p>
          </div>

          {/* Victory Modal Overlay if Finished */}
          {gameState === 'finished' && (
            <div className="bg-gradient-to-br from-[#0c1322] to-[#131d33] border-2 border-amber-500/60 rounded-3xl p-8 text-center text-white space-y-6 shadow-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-400 mb-2 animate-bounce">
                <Crown className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black uppercase font-mono tracking-wider text-amber-400">
                  {winnerId === (user?.uid || 'me') ? "Siz G'olib Bo'ldingiz! 🏆" : "Raqib Birinchi Yakunladi! 🏁"}
                </h2>
                <p className="text-xs text-slate-300">
                  Ajoyib poyga natijasi! Shaxsiy tezligingiz va aniqligingiz qayd etildi.
                </p>
              </div>

              {/* Match Stats Comparison Grid */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1 text-left border-r border-slate-800 pr-3">
                  <span className="text-[10px] text-cyan-400 font-mono block">Sizning Natijangiz</span>
                  <p className="text-lg font-black font-mono text-white">{myProgress.wpm} WPM</p>
                  <p className="text-xs font-mono text-emerald-400">{myProgress.accuracy}% Accuracy</p>
                </div>

                <div className="space-y-1 text-left pl-3">
                  <span className="text-[10px] text-rose-400 font-mono block">Raqib Natijasi</span>
                  <p className="text-lg font-black font-mono text-white">{opponentProgress.wpm} WPM</p>
                  <p className="text-xs font-mono text-emerald-400">{opponentProgress.accuracy}% Accuracy</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => startQuickMatch(opponentProgress.name, opponentProgress.isBot || false, 85)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>QAYTA O'YNASH (Rematch)</span>
                </button>

                <button
                  onClick={() => setGameState('lobby')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700"
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
