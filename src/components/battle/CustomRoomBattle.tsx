import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Users,
  Copy,
  Check,
  Send,
  Play,
  RotateCcw,
  Trophy,
  Crown,
  Clock,
  Globe,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { RaceTrack, RacerProgress } from './RaceTrack';
import { useAuth } from '../../context/AuthContext';
import { rtdb, db, auth } from '../../config/firebase';
import { signInAnonymously } from 'firebase/auth';
import { ref, set, onValue, update, get } from 'firebase/database';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { calculateWpm, calculateAccuracy } from '../../utils/typingEngine';
import { getRandomBattleText } from '../../data/battleTexts';

// Generate 6-char clean alphanumeric room code (e.g., "UZ829F")
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

export type BattleDuration = 15 | 30 | 60;
export type BattleLanguage = 'uz-latn' | 'uz-cyrl' | 'en' | 'ru' | 'code';

interface CustomRoomBattleProps {
  initialRoomCode?: string | null;
  onClose?: () => void;
}

export const CustomRoomBattle: React.FC<CustomRoomBattleProps> = ({
  initialRoomCode,
  onClose
}) => {
  const { user, profile, addXp } = useAuth();

  const currentUid = user?.uid || localStorage.getItem('yolnoma_guest_id') || `guest_${Math.random().toString(36).substring(2, 7)}`;
  const currentDisplayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'Siz');
  const currentAvatar = profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUid}`;

  // Room config state (for host)
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode?.toUpperCase() || '');
  const [selectedDuration, setSelectedDuration] = useState<BattleDuration>(30);
  const [selectedLanguage, setSelectedLanguage] = useState<BattleLanguage>('uz-latn');

  // Game flow
  const [step, setStep] = useState<'lobby' | 'waiting_friend' | 'countdown' | 'racing' | 'result'>(
    initialRoomCode ? 'waiting_friend' : 'lobby'
  );
  const [isHost, setIsHost] = useState<boolean>(!initialRoomCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // In-Game state
  const [countdown, setCountdown] = useState<number>(3);
  const [battleText, setBattleText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  // Racers
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

  const [friendProgress, setFriendProgress] = useState<RacerProgress>({
    id: 'friend_placeholder',
    name: "Do'stingiz kutilmoqda...",
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Friend',
    progressPercent: 0,
    wpm: 0,
    accuracy: 100,
    carColor: 'red',
    isWinner: false,
    isBot: false
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  const rtdbUnsubRef = useRef<(() => void) | null>(null);
  const firestoreUnsubRef = useRef<(() => void) | null>(null);

  // Ensure Firebase Auth session for Guest and logged-in racers
  const ensureFirebaseAuth = async () => {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
        console.log('[Firebase Auth] Guest anonim muvaffaqiyatli autentifikatsiyadan oʻtdi:', auth.currentUser?.uid);
      } catch (err: any) {
        console.warn('[Firebase Auth Warning]:', err?.code, err?.message);
      }
    }
  };

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      if (rtdbUnsubRef.current) rtdbUnsubRef.current();
      if (firestoreUnsubRef.current) firestoreUnsubRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle URL code auto-join
  useEffect(() => {
    if (initialRoomCode && step === 'lobby') {
      handleJoinRoom(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Host creates a new room
  const handleCreateRoom = async () => {
    await ensureFirebaseAuth();

    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setJoinError(null);

    // 2-VAZIFA: 50+ random matnlar bazasidan tasodifiy matn tanlanadi
    const generatedText = getRandomBattleText(selectedLanguage);
    setBattleText(generatedText);
    setTimeLeft(selectedDuration);

    const hostInitialData: RacerProgress = {
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

    setMyProgress(hostInitialData);
    setFriendProgress({
      id: 'friend_placeholder',
      name: "Do'stingiz kutilmoqda...",
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=FriendWaiting',
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      carColor: 'red',
      isWinner: false,
      isBot: false
    });

    const roomData = {
      code,
      roomId: code,
      status: 'waiting',
      duration: selectedDuration,
      language: selectedLanguage,
      text: generatedText,
      selectedText: generatedText,
      createdAt: Date.now(),
      host: hostInitialData,
      guest: null,
      winner: null,
      rematchRequested: false
    };

    let saveSuccess = false;
    let detailedError: any = null;

    // 1. Write to RTDB (both battle_rooms and private_battle_rooms)
    try {
      await set(ref(rtdb, `battle_rooms/${code}`), roomData);
      await set(ref(rtdb, `private_battle_rooms/${code}`), roomData);
      saveSuccess = true;
      console.log('[RTDB Room Created]:', code);
    } catch (err: any) {
      console.warn('[RTDB Write Warning]:', err?.code || err?.message || err);
      detailedError = err;
    }

    // 2. Write to Firestore as dual resilient synchronization
    try {
      await setDoc(doc(db, 'battle_rooms', code), roomData);
      saveSuccess = true;
      console.log('[Firestore Room Created]:', code);
    } catch (err: any) {
      console.warn('[Firestore Write Warning]:', err?.code || err?.message || err);
      if (!detailedError) detailedError = err;
    }

    if (saveSuccess) {
      setStep('waiting_friend');
      listenToRoom(code, true);
    } else {
      console.error('[Create Room Error Details]:', detailedError);
      setJoinError(`Xona yaratishda xatolik yuz berdi (${detailedError?.code || 'Tarmoq/Baza xatosi'}). Iltimos qayta urining.`);
    }
  };

  // Join existing room
  const handleJoinRoom = async (codeToJoin?: string) => {
    await ensureFirebaseAuth();

    const code = (codeToJoin || joinCodeInput).toUpperCase().trim();
    if (!code || code.length < 4) {
      setJoinError("Iltimos, 6 xonali xona kodini to'g'ri kiriting.");
      return;
    }

    setJoinError(null);
    setRoomCode(code);
    setIsHost(false);

    let roomData: any = null;

    // 1. Check RTDB first
    try {
      const snap = await get(ref(rtdb, `battle_rooms/${code}`));
      if (snap.exists()) {
        roomData = snap.val();
      } else {
        const snap2 = await get(ref(rtdb, `private_battle_rooms/${code}`));
        if (snap2.exists()) roomData = snap2.val();
      }
    } catch (err) {
      console.warn('RTDB read fallback to Firestore:', err);
    }

    // 2. Check Firestore
    if (!roomData) {
      try {
        const fSnap = await getDoc(doc(db, 'battle_rooms', code));
        if (fSnap.exists()) {
          roomData = fSnap.data();
        }
      } catch (err) {
        console.warn('Firestore read error:', err);
      }
    }

    if (!roomData) {
      console.warn('[Join Room Not Found]:', code);
      setJoinError(`"${code}" kodli xona topilmadi yoki yopilgan.`);
      return;
    }

    if (roomData.status !== 'waiting' && roomData.status !== 'ready') {
      setJoinError("Bu duel allaqachon boshlangan yoki yakunlangan.");
      return;
    }

    const roomText = roomData.selectedText || roomData.text || getRandomBattleText('uz-latn');
    setBattleText(roomText);
    setTimeLeft(roomData.duration || 30);
    setSelectedDuration(roomData.duration || 30);
    setSelectedLanguage(roomData.language || 'uz-latn');

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

    const updatePayload = {
      guest: guestData,
      status: 'ready'
    };

    // Update in RTDB
    try {
      await update(ref(rtdb, `battle_rooms/${code}`), updatePayload);
      await update(ref(rtdb, `private_battle_rooms/${code}`), updatePayload);
    } catch {}

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'battle_rooms', code), updatePayload);
    } catch {}

    setStep('waiting_friend');
    listenToRoom(code, false);
  };

  // Real-time listener for room events (Dual Engine RTDB + Firestore)
  const listenToRoom = (code: string, amHost: boolean) => {
    if (rtdbUnsubRef.current) rtdbUnsubRef.current();
    if (firestoreUnsubRef.current) firestoreUnsubRef.current();

    const handleDataUpdate = (val: any) => {
      if (!val) return;

      if (val.selectedText || val.text) {
        setBattleText(val.selectedText || val.text);
      }

      // Track friend's presence & progress
      const opponentData = amHost ? val.guest : val.host;
      if (opponentData) {
        setFriendProgress(opponentData);
      }

      // If status became 'ready' -> trigger countdown
      if (val.status === 'ready' && step === 'waiting_friend') {
        startCountdownFlow(val.selectedText || val.text, val.duration || selectedDuration);
      }

      // In-game progress updates from opponent
      if (val.status === 'racing') {
        if (opponentData) {
          setFriendProgress(opponentData);
          if (opponentData.progressPercent >= 100 && !val.winner) {
            handleFinishRace(opponentData.id, opponentData.name);
          }
        }
      }

      // Check if rematch was triggered
      if (val.status === 'waiting' && step === 'result') {
        setBattleText(val.selectedText || val.text);
        setTimeLeft(val.duration || 30);
        setUserInput('');
        setWinnerName(null);
        setStep('waiting_friend');
      }
    };

    // 1. Listen via RTDB
    try {
      const roomRef = ref(rtdb, `battle_rooms/${code}`);
      rtdbUnsubRef.current = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          handleDataUpdate(snapshot.val());
        }
      });
    } catch (e) {
      console.warn('RTDB listen error:', e);
    }

    // 2. Listen via Firestore
    try {
      firestoreUnsubRef.current = onSnapshot(doc(db, 'battle_rooms', code), (docSnap) => {
        if (docSnap.exists()) {
          handleDataUpdate(docSnap.data());
        }
      });
    } catch (e) {
      console.warn('Firestore listen error:', e);
    }
  };

  // 3, 2, 1 Countdown
  const startCountdownFlow = (text: string, duration: number) => {
    setStep('countdown');
    setCountdown(3);
    setBattleText(text);
    setTimeLeft(duration);
    setUserInput('');

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(0);
        // Start Racing
        setStep('racing');
        setStartTime(Date.now());
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 50);
      }
    }, 1000);
  };

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step !== 'racing') return;

    const val = e.target.value;
    setUserInput(val);

    const target = battleText;
    const correctChars = val.split('').filter((c, i) => c === target[i]).length;
    const progressPct = Math.min(100, Math.round((correctChars / target.length) * 100));

    const elapsedSec = startTime ? Math.max(1, (Date.now() - startTime) / 1000) : 1;
    const curWpm = calculateWpm(correctChars, elapsedSec, val.length);
    const curAccuracy = calculateAccuracy(correctChars, val.length);

    const updatedMyProgress: RacerProgress = {
      ...myProgress,
      progressPercent: progressPct,
      wpm: curWpm,
      accuracy: curAccuracy
    };

    setMyProgress(updatedMyProgress);

    // Sync to Realtime Database & Firestore
    if (roomCode) {
      const myRole = isHost ? 'host' : 'guest';
      const syncPayload = {
        [myRole]: updatedMyProgress,
        status: 'racing'
      };

      try {
        update(ref(rtdb, `battle_rooms/${roomCode}`), syncPayload);
        update(ref(rtdb, `private_battle_rooms/${roomCode}`), syncPayload);
      } catch {}

      try {
        updateDoc(doc(db, 'battle_rooms', roomCode), syncPayload);
      } catch {}
    }

    // Check if reached finish line
    if (progressPct >= 100 || val === target) {
      handleFinishRace(currentUid, currentDisplayName);
    }
  };

  // Finish race & declare winner
  const handleFinishRace = async (winUid: string, winName: string) => {
    setStep('result');
    setWinnerName(winName);

    if (roomCode) {
      const finishPayload = {
        status: 'finished',
        winner: { uid: winUid, name: winName }
      };

      try {
        update(ref(rtdb, `battle_rooms/${roomCode}`), finishPayload);
        update(ref(rtdb, `private_battle_rooms/${roomCode}`), finishPayload);
      } catch {}

      try {
        updateDoc(doc(db, 'battle_rooms', roomCode), finishPayload);
      } catch {}
    }

    if (winUid === currentUid && addXp) {
      addXp(150, "1v1 Do'st bilan duelda g'alaba!");
    }
  };

  // Rematch button (Selects a fresh random text from 50+ pool)
  const handleRematch = async () => {
    if (!roomCode) return;
    const freshText = getRandomBattleText(selectedLanguage);
    setBattleText(freshText);
    setUserInput('');
    setWinnerName(null);

    const resetMy: RacerProgress = {
      ...myProgress,
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      isWinner: false
    };
    setMyProgress(resetMy);

    const rematchPayload = {
      status: 'ready',
      text: freshText,
      selectedText: freshText,
      winner: null,
      [isHost ? 'host' : 'guest']: resetMy
    };

    try {
      await update(ref(rtdb, `battle_rooms/${roomCode}`), rematchPayload);
      await update(ref(rtdb, `private_battle_rooms/${roomCode}`), rematchPayload);
    } catch {}

    try {
      await updateDoc(doc(db, 'battle_rooms', roomCode), rematchPayload);
    } catch {}
  };

  // Copy share invite link
  const inviteLink = `https://www.yolnoma.uz/battle?room=${roomCode}`;
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send invite via Telegram
  const handleSendTelegramInvite = () => {
    const text = `🔥 Do'stim! Men bilan "Yolnoma Typing"da 1v1 jonli klaviatura duelida bellashishga tayyormisan?\n\n🎮 Xona kodi: ${roomCode}\n👉 Havola: ${inviteLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl relative overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Do'st Bilan Xususiy Jang (1v1)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                REAL-TIME DUEL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Xususiy xona oching, havolani do'stingizga yuboring va jonli bellashing!
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Yopish
          </button>
        )}
      </div>

      {/* STEP 1: LOBBY (Create or Join) */}
      {step === 'lobby' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          {/* Create Room Box */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <Crown className="w-4 h-4" />
                <span>Yangi Duel Xonasini Yaratish</span>
              </div>
              <p className="text-xs text-slate-400">
                Vaqt va tilni sozlang, do'stingiz uchun xona kodi generatsiya qilinadi.
              </p>

              {/* Duration selector */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Davomiyligi:</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {([15, 30, 60] as BattleDuration[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDuration(d)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedDuration === d
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Language selector */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Til va matn toifasi:</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  {[
                    { id: 'uz-latn', label: "O'zbekcha (Lotin)" },
                    { id: 'uz-cyrl', label: 'Ўзбекча (Кирилл)' },
                    { id: 'en', label: 'Ingliz tili' },
                    { id: 'code', label: 'Dasturlash kodi' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedLanguage(l.id as BattleLanguage)}
                      className={`py-2 px-2.5 rounded-xl text-xs transition-all cursor-pointer truncate text-left ${
                        selectedLanguage === l.id
                          ? 'bg-blue-600 text-white font-bold shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Xonani Ochish</span>
            </button>
          </div>

          {/* Join Existing Room Box */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                <Users className="w-4 h-4" />
                <span>Mavjud Xonaga Qo'shilish</span>
              </div>
              <p className="text-xs text-slate-400">
                Do'stingiz yuborgan 6 xonali kodni kiriting va darhol duelga ulaning.
              </p>

              <div className="mt-6 space-y-3">
                <label className="text-xs font-mono text-slate-300">Xona Kodi:</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Masalan: UZ829F"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-black text-xl tracking-widest text-blue-400 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 uppercase"
                />

                {joinError && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/15 text-rose-300 text-xs border border-rose-500/30">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{joinError}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleJoinRoom()}
              disabled={joinCodeInput.trim().length < 4}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Jangga Kirish</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: WAITING FOR FRIEND */}
      {step === 'waiting_friend' && (
        <div className="py-6 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
            <Users className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Do'stingiz kutilmoqda...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Do'stingiz ushbu kod yoki havola orqali xonaga kirishi bilanoq duel avtomatik boshlanadi.
            </p>
          </div>

          {/* Big Room Code Badge */}
          <div className="inline-block p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-blue-500/50">
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Sizning Xona Kodingiz:</span>
            <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-amber-400">
              {roomCode}
            </span>
          </div>

          {/* Share Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendTelegramInvite}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Havolani Telegramga Yuborish</span>
            </button>

            <button
              type="button"
              onClick={handleCopyInvite}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Havola nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Havolani nusxalash</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Kutilayotgan o'yinchilar: <span className="text-blue-400 font-bold">{myProgress.name}</span> vs{' '}
            <span className="text-amber-400 font-bold">{friendProgress.name}</span>
          </div>
        </div>
      )}

      {/* STEP 3: COUNTDOWN 3, 2, 1 */}
      {step === 'countdown' && (
        <div className="py-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400">
            O'yinchilar tayyor! Duel boshlanishiga:
          </span>
          <div className="text-7xl sm:text-8xl font-black font-mono text-amber-400 animate-bounce">
            {countdown}
          </div>
          <p className="text-xs text-slate-400 font-mono">Klaviaturaga qo'llarni tayyorlang...</p>
        </div>
      )}

      {/* STEP 4: RACING JONLI POYGA */}
      {step === 'racing' && (
        <div className="space-y-4 py-2">
          {/* Race Track Cars */}
          <RaceTrack racers={[myProgress, friendProgress]} />

          {/* Target Text Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none">
            {battleText.split('').map((char, index) => {
              let color = 'text-slate-500';
              if (index < userInput.length) {
                color = userInput[index] === char ? 'text-emerald-400 font-bold' : 'text-rose-500 bg-rose-950/50 underline';
              }
              const isCaret = index === userInput.length;
              return (
                <span key={index} className={`${color} ${isCaret ? 'border-b-2 border-blue-400 animate-pulse' : ''}`}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* Input Box */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Matnni shu yerga tezkor tering..."
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 border-2 border-blue-500/40 font-mono text-base text-white focus:outline-none focus:border-blue-400 shadow-inner"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
            <span>Sizning tezligingiz: <strong className="text-blue-400">{myProgress.wpm} WPM</strong></span>
            <span>Do'stingiz tezligi: <strong className="text-rose-400">{friendProgress.wpm} WPM</strong></span>
          </div>
        </div>
      )}

      {/* STEP 5: RESULT / WINNER */}
      {step === 'result' && (
        <div className="py-6 text-center space-y-5">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              {winnerName === currentDisplayName ? "🎉 Siz G'alaba Qozondingiz!" : `🏆 G'olib: ${winnerName}!`}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {winnerName === currentDisplayName
                ? "Ajoyib tezlik va aniqlik namoyish etildi! +150 XP berildi."
                : "Qoyilmaqom bellashuv bo'ldi! Qayta o'ynab revansh oling."}
            </p>
          </div>

          {/* Scores Comparison */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30">
              <span className="text-[10px] font-mono uppercase text-slate-400">Siz</span>
              <div className="text-2xl font-black font-mono text-blue-400">{myProgress.wpm} <span className="text-xs">WPM</span></div>
              <span className="text-xs text-emerald-400 font-bold">{myProgress.accuracy}% aniqlik</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30">
              <span className="text-[10px] font-mono uppercase text-slate-400">Do'stingiz</span>
              <div className="text-2xl font-black font-mono text-rose-400">{friendProgress.wpm} <span className="text-xs">WPM</span></div>
              <span className="text-xs text-emerald-400 font-bold">{friendProgress.accuracy}% aniqlik</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleRematch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta O'ynash (Rematch)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('lobby');
                setRoomCode('');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Lobbiyga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
