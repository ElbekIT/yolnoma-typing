// Web Audio API Retro 8-bit Sound Synthesizer for Dino Runner Game with zero-latency audio

class DinoSoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Proactively initialize on first user interaction or module load
    if (typeof window !== 'undefined') {
      const initAudio = () => {
        this.initCtx();
        window.removeEventListener('keydown', initAudio);
        window.removeEventListener('pointerdown', initAudio);
        window.removeEventListener('touchstart', initAudio);
      };
      window.addEventListener('keydown', initAudio, { once: true, passive: true });
      window.addEventListener('pointerdown', initAudio, { once: true, passive: true });
      window.addEventListener('touchstart', initAudio, { once: true, passive: true });
    }
  }

  public initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // Jump sound: Instant 8-bit crisp rising beep
  public playJump() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Fallback
    }
  }

  // 100-Point Milestone: High pitch double-chime
  public playScoreMilestone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0.14, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.23);
    } catch {}
  }

  // Duck / Swoosh sound
  public playDuck() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // Crash / Game Over
  public playGameOver() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.29);
    } catch {}
  }

  // Triumphant Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [
        { f: 523.25, time: 0, dur: 0.12 },     // C5
        { f: 659.25, time: 0.12, dur: 0.12 },  // E5
        { f: 783.99, time: 0.24, dur: 0.14 },  // G5
        { f: 1046.50, time: 0.38, dur: 0.45 }  // C6
      ];

      const now = this.ctx.currentTime;
      notes.forEach(({ f, time, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + time);

        gain.gain.setValueAtTime(0.18, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {}
  }

  // Dramatic Defeat Sound
  public playDefeat() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [
        { f: 311.13, time: 0, dur: 0.18 },     // Eb4
        { f: 293.66, time: 0.18, dur: 0.18 },  // D4
        { f: 277.18, time: 0.36, dur: 0.20 },  // Db4
        { f: 196.00, time: 0.56, dur: 0.45 }   // G3 (Low bass)
      ];

      const now = this.ctx.currentTime;
      notes.forEach(({ f, time, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + time);

        gain.gain.setValueAtTime(0.15, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {}
  }

  // Countdown Beep
  public playCountdownBeep(isFinal = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.25 : 0.12));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.26 : 0.13));
    } catch {}
  }
}

export const dinoSound = new DinoSoundManager();
