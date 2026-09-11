import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Send,
  Copy,
  Check,
  Sparkles,
  Trophy,
  Zap,
  Target,
  Clock,
  Globe,
  Share2,
  Smartphone,
  Layout
} from 'lucide-react';
import { TypingResult } from '../../types';
import { getLanguageInfo } from '../../config/languages';

interface ShareResultCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TypingResult | null;
  displayName?: string;
}

export function getWpmTitle(wpm: number): { title: string; badge: string; color: string } {
  if (wpm >= 100) {
    return { title: 'Kiber Chaqmoq', badge: '⚡️ AFSONAVIY', color: '#f59e0b' };
  } else if (wpm >= 80) {
    return { title: 'Tezkor Qilich', badge: '⚔️ MASTER', color: '#8b5cf6' };
  } else if (wpm >= 60) {
    return { title: 'Tezlik Ustasi', badge: '🚀 EKSPERT', color: '#3b82f6' };
  } else if (wpm >= 40) {
    return { title: 'Umidli Mergan', badge: '🎯 MAHORATLI', color: '#10b981' };
  } else if (wpm >= 20) {
    return { title: "Boshlang'ich Yuguruvchi", badge: '🏃‍♂️ AMALIYOTCHI', color: '#06b6d4' };
  } else {
    return { title: 'Klaviaturaga Yangi Kelgan', badge: '🌱 BOSHLANG\'ICH', color: '#64748b' };
  }
}

export const ShareResultCertificateModal: React.FC<ShareResultCertificateModalProps> = ({
  isOpen,
  onClose,
  result,
  displayName = 'Tezkor Yozuvchi'
}) => {
  const [format, setFormat] = useState<'story' | 'landscape'>('story');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen || !result) return null;

  const wpm = result.wpm || 0;
  const accuracy = Math.round(result.accuracy || 100);
  const duration = result.testTimeSeconds || 30;
  const langInfo = getLanguageInfo(result.language || 'uz-latn');
  const { title: rankTitle, badge: rankBadge, color: rankColor } = getWpmTitle(wpm);

  // Generate dynamic canvas image
  const drawCertificate = (targetCanvas: HTMLCanvasElement, isStoryMode: boolean) => {
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = isStoryMode ? 1080 : 1200;
    const height = isStoryMode ? 1920 : 630;
    targetCanvas.width = width;
    targetCanvas.height = height;

    // 1. Deep Rich Cyber Dark Gradient Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#050811');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Glow orbs
    const glowOrb = (cx: number, cy: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    glowOrb(width * 0.2, height * 0.15, isStoryMode ? 500 : 300, 'rgba(59, 130, 246, 0.25)');
    glowOrb(width * 0.8, height * 0.75, isStoryMode ? 600 : 350, 'rgba(245, 158, 11, 0.18)');
    glowOrb(width * 0.5, height * 0.45, isStoryMode ? 400 : 250, 'rgba(139, 92, 246, 0.2)');

    // 3. Grid accent pattern overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = isStoryMode ? 60 : 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 4. Main Glassmorphic Container Card
    const cardPad = isStoryMode ? 70 : 50;
    const cardW = width - cardPad * 2;
    const cardH = height - cardPad * 2;
    const radius = 36;

    // Card Glass Background
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardPad, cardPad, cardW, cardH, radius);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fill();
    ctx.lineWidth = 2;
    const borderGradient = ctx.createLinearGradient(cardPad, cardPad, cardPad + cardW, cardPad + cardH);
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    borderGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
    borderGradient.addColorStop(1, 'rgba(245, 158, 11, 0.35)');
    ctx.strokeStyle = borderGradient;
    ctx.stroke();
    ctx.restore();

    if (isStoryMode) {
      // === INSTAGRAM STORY (9:16) LAYOUT ===
      // Top Brand Header
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Logo icon & Title
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('⌨️ YOLNOMA TYPING', width / 2, cardPad + 90);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 24px monospace';
      ctx.fillText('RASMIY NATIJA SERTIFIKATI', width / 2, cardPad + 140);

      // User name & Rank pill
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText(displayName, width / 2, cardPad + 220);

      // Rank Badge Pill
      const pillY = cardPad + 300;
      ctx.fillStyle = `${rankColor}22`;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 180, pillY, 360, 54, 27);
      ctx.fill();
      ctx.strokeStyle = rankColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = rankColor;
      ctx.font = 'bold 24px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText(rankBadge, width / 2, pillY + 27);

      // Main Big WPM Hero Block
      ctx.textBaseline = 'top';
      const heroY = cardPad + 410;
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 220px monospace';
      ctx.fillText(`${wpm}`, width / 2, heroY);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('SO\'Z / DAQIQA (WPM)', width / 2, heroY + 225);

      // Title accolade
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(`"${rankTitle}"`, width / 2, heroY + 295);

      // Stats 3-Grid Boxes
      const gridY = heroY + 410;
      const boxW = (cardW - 80) / 3;
      const boxH = 170;

      const stats = [
        { label: 'ANIQLIK', val: `${accuracy}%`, color: '#10b981', icon: '🎯' },
        { label: 'DAVOMIYLIK', val: `${duration}s`, color: '#38bdf8', icon: '⏱️' },
        { label: 'TIL', val: langInfo.nativeName.slice(0, 10), color: '#fbbf24', icon: '🌐' }
      ];

      stats.forEach((st, i) => {
        const bx = cardPad + 30 + i * (boxW + 10);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.beginPath();
        ctx.roundRect(bx, gridY, boxW, boxH, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${st.icon} ${st.label}`, bx + boxW / 2, gridY + 28);

        ctx.fillStyle = st.color;
        ctx.font = '900 42px monospace';
        ctx.fillText(st.val, bx + boxW / 2, gridY + 85);
      });

      // Verification seal & QR box at bottom
      const footerY = height - cardPad - 250;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 280, footerY, 560, 140, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Siz ham sinab ko\'ring:', width / 2, footerY + 30);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 34px monospace';
      ctx.fillText('www.yolnoma.uz', width / 2, footerY + 75);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px monospace';
      ctx.fillText('O\'zbekiston №1 Klaviatura Trenajyori', width / 2, height - cardPad - 45);

    } else {
      // === LANDSCAPE (1200x630) BANNER LAYOUT ===
      // Left side: WPM Hero, Right side: Details & QR
      ctx.textBaseline = 'top';

      // Header Brand
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('⌨️ YOLNOMA TYPING — SERTIFIKAT', cardPad + 40, cardPad + 40);

      // Hero WPM Number on Left
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 150px monospace';
      ctx.fillText(`${wpm}`, cardPad + 40, cardPad + 85);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('WPM — SO\'Z / DAQIQA', cardPad + 45, cardPad + 250);

      // User & Rank
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(displayName, cardPad + 45, cardPad + 310);

      ctx.fillStyle = rankColor;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`Unvon: "${rankTitle}" (${rankBadge})`, cardPad + 45, cardPad + 365);

      // Stats on Right side
      const rightX = width / 2 + 60;
      const statsList = [
        { label: 'Aniqlik ko\'rsatkichi:', val: `${accuracy}%`, color: '#10b981' },
        { label: 'Sinov davomiyligi:', val: `${duration} soniya`, color: '#38bdf8' },
        { label: 'Topshirilgan til:', val: langInfo.nativeName, color: '#fbbf24' }
      ];

      statsList.forEach((st, idx) => {
        const sy = cardPad + 110 + idx * 75;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.beginPath();
        ctx.roundRect(rightX, sy, 460, 60, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 20px monospace';
        ctx.fillText(st.label, rightX + 25, sy + 18);

        ctx.fillStyle = st.color;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(st.val, rightX + 435, sy + 18);
        ctx.textAlign = 'left';
      });

      // Footer bar
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.roundRect(rightX, cardPad + 355, 460, 75, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Bellashuvga qo\'shiling:', rightX + 25, cardPad + 372);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px monospace';
      ctx.fillText('https://www.yolnoma.uz', rightX + 25, cardPad + 400);
    }
  };

  // Re-draw canvas on format change
  useEffect(() => {
    if (canvasRef.current) {
      drawCertificate(canvasRef.current, format === 'story');
    }
  }, [format, result, displayName]);

  // 1-Tap Download PNG
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    try {
      // Re-draw onto a clean export canvas
      const exportCanvas = document.createElement('canvas');
      drawCertificate(exportCanvas, format === 'story');

      const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `yolnoma-${wpm}wpm-certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download certificate error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Telegram share
  const handleShareTelegram = () => {
    const shareText = `⚡️ Klaviaturada qanchalik tez yoza olasiz?\n\nBugun "Yolnoma Typing"da o'z tezligimni sinab ko'rdim:\n🏆 Natijam: ${wpm} WPM (${rankTitle})\n🎯 Aniqlik: ${accuracy}%\n⏱️ Vaqt: ${duration}s (${langInfo.nativeName})\n\nQani, mening rekordimni yangilab ko'ring-chi!\n👉 https://www.yolnoma.uz/?wpm=${wpm}&acc=${accuracy}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://www.yolnoma.uz/')}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Copy Link with result
  const handleCopyLink = () => {
    const textToCopy = `Mening Yolnoma Typing natijam: ${wpm} WPM (${accuracy}% aniqlik, "${rankTitle}"). Siz ham sinab ko'ring: https://www.yolnoma.uz/?wpm=${wpm}&acc=${accuracy}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border-2 border-blue-500/30 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Natija Sertifikat-Kartochkasi</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {rankTitle}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Instagram Story, Telegram va do'stlarga yuborish uchun tayyor rasm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center justify-between gap-3 mb-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-xs font-mono font-medium text-slate-400 pl-2">Format:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFormat('story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                format === 'story'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instagram Story (9:16)</span>
            </button>
            <button
              onClick={() => setFormat('landscape')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                format === 'landscape'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Katta Banner (16:9)</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-slate-950/80 rounded-2xl border border-slate-800/80 p-3 relative group">
          <canvas
            ref={canvasRef}
            className={`max-h-[380px] sm:max-h-[420px] w-auto h-auto rounded-xl shadow-2xl object-contain border border-slate-700/50 transition-transform duration-200 group-hover:scale-[1.01]`}
          />
        </div>

        {/* Actions Bar */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Yuklanmoqda...' : 'PNG Yuklab Olish'}</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1e8bc0] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Telegramda Ulashish</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
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
      </div>
    </div>
  );
};
