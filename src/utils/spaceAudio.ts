/**
 * Web Audio API orqali sof sintetik tovushlar generatori
 * Tashqi fayllar talab qilinmaydi, 0ms kechikish bilan 60 FPS o'yinda silliq yangraydi
 */

class SpaceSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private musicInterval: any = null;
  private musicStep: number = 0;

  constructor() {
    // AudioContext user gesture bilan birinchi marta ishga tushiriladi
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (!this.isMuted) {
      this.startMusic();
    }
  }

  public getIsMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  /**
   * Lazer otish tovushi (Pew-pew)
   */
  public playLaser(frequency: number = 850) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * Dushman kemasi portlashi tovushi (White noise + deep rumble)
   */
  public playExplosion(isBig: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = isBig ? 0.8 : 0.4;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Shovqin (White noise)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isBig ? 450 : 320, now);
      filter.frequency.exponentialRampToValueAtTime(40, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isBig ? 0.35 : 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.05);

      // Past sub-bass to'lqini
      const osc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isBig ? 130 : 90, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + duration);

      subGain.gain.setValueAtTime(isBig ? 0.3 : 0.18, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(subGain);
      subGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {}
  }

  /**
   * EMP Super Bomba portlashi
   */
  public playEmpBomb() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);

      // Portlash effekti
      this.playExplosion(true);
    } catch {}
  }

  /**
   * Noto'g'ri harf bosilganda xato signali
   */
  public playError() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.setValueAtTime(100, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * To'lqin yakunlanganda (Wave Clear) g'alaba akkordi
   */
  public playWaveClear() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.36);
        } catch {}
      }, idx * 75);
    });
  }

  /**
   * Boss paydo bo'lganda ogohlantiruvchi signal
   */
  public playBossAlert() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.22);
        } catch {}
      }, i * 220);
    }
  }

  /**
   * Sokin kosmik fon musiqasi (Minimalist retro synth arpeggio)
   */
  public startMusic() {
    if (this.isMuted || !this.isMusicEnabled || this.musicInterval) return;
    this.initCtx();

    const scale = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25]; // A minor pentatonic/diatonic
    const bassScale = [110, 130.81, 146.83, 164.81];

    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.isMusicEnabled || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const noteIdx = (this.musicStep % scale.length);
        const freq = scale[noteIdx];

        // Lead synth note
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);

        // Bass pulse every 4 steps
        if (this.musicStep % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFreq = bassScale[(Math.floor(this.musicStep / 4)) % bassScale.length];

          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          bassGain.gain.setValueAtTime(0.05, now);
          bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);

          bassOsc.start(now);
          bassOsc.stop(now + 0.65);
        }

        this.musicStep++;
      } catch {}
    }, 280);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public stopAll() {
    this.stopMusic();
  }
}

export const spaceAudio = new SpaceSoundEngine();
