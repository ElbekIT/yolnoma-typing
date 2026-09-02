import { ref, update } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

type DevToolsListener = (isOpen: boolean) => void;

class AntiCheatSystem {
  private keyTimes: number[] = [];
  private onCheatCallback: ((reason: string) => void) | null = null;
  private isListening = false;
  private currentUserId: string | null = null;
  private devToolsCheckInterval: any = null;
  private _isDevToolsOpen = false;
  private devToolsListeners: Set<DevToolsListener> = new Set();
  private consecutiveDetections = 0;
  private consecutiveClean = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachGlobalSecurityListeners();
      this.startDevToolsProtection();
      this.deployHoneypotTraps();
      this.detectHeadlessBots();
    }
  }

  public init(onCheat?: (reason: string) => void, userId?: string | null) {
    if (onCheat) this.onCheatCallback = onCheat;
    if (userId) this.currentUserId = userId;
    if (!this.isListening) {
      this.isListening = true;
      this.attachGlobalSecurityListeners();
      this.startDevToolsProtection();
      this.deployHoneypotTraps();
    }
  }

  public setUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  public isDeviceBanned(): { banned: boolean; reason: string | null } {
    try {
      const banned = localStorage.getItem('yolnoma_device_banned') === 'true';
      const reason = localStorage.getItem('yolnoma_ban_reason');
      return { banned, reason };
    } catch {
      return { banned: false, reason: null };
    }
  }

  public clearDeviceBan() {
    try {
      localStorage.removeItem('yolnoma_device_banned');
      localStorage.removeItem('yolnoma_ban_reason');
    } catch (e) {
      console.warn('LocalStorage unban error:', e);
    }
  }

  public banDeviceAndUser(reason: string) {
    try {
      localStorage.setItem('yolnoma_device_banned', 'true');
      localStorage.setItem('yolnoma_ban_reason', reason);
    } catch (e) {
      console.warn('LocalStorage ban error:', e);
    }

    if (this.currentUserId) {
      try {
        update(ref(rtdb, `users/${this.currentUserId}`), {
          isBanned: true,
          blockReason: reason,
          bannedAt: Date.now(),
        }).catch(() => {});
      } catch (err) {
        console.warn('RTDB ban user error:', err);
      }
    }

    this.triggerCheat(reason);
  }

  public resetTest() {
    this.keyTimes = [];
  }

  public reset() {
    this.resetTest();
  }


  public registerKeystroke(e: ReactKeyboardEvent<HTMLInputElement> | KeyboardEvent, typedLength: number): boolean {
    if (e.isTrusted === false) {
      this.banDeviceAndUser('Avto-Typer (Grom/Google Chrome) kengaytmasi yoki dasturiy harakat aniqlandi!');
      return false;
    }

    const now = performance.now();
    if (this.keyTimes.length > 0) {
      const lastTime = this.keyTimes[this.keyTimes.length - 1];
      const delta = now - lastTime;
      if (delta < 5) {
        this.keyTimes.push(now);
        if (this.keyTimes.length > 8) {
          const recent = this.keyTimes.slice(-8);
          const totalDuration = recent[recent.length - 1] - recent[0];
          if (totalDuration < 25) {
            this.banDeviceAndUser('Robotik tezlik (Auto-Typer Bot) aniqlandi va kirish bloklandi!');
            return false;
          }
        }
      } else {
        this.keyTimes.push(now);
      }
    } else {
      this.keyTimes.push(now);
    }

    if (this.keyTimes.length > 20) {
      this.keyTimes.shift();
    }
    return true;
  }

  public validateTypingResult(wpm: number, accuracy: number, durationSeconds: number, charCount: number): boolean {
    if (wpm < 0 || wpm > 260) {
      return false;
    }
    if (accuracy < 0 || accuracy > 100) {
      return false;
    }
    const maxPossibleChars = durationSeconds * 25;
    if (charCount > maxPossibleChars && durationSeconds > 5) {
      return false;
    }
    return true;
  }

  public validateDinoScore(score: number, distance: number, obstaclesDodged: number): boolean {
    if (score < 0 || distance < 0 || obstaclesDodged < 0) return false;
    if (score > 100000) return false;
    if (distance > 0 && score > distance * 5) return false;
    return true;
  }

  private triggerCheat(reason: string) {
    if (this.onCheatCallback) {
      this.onCheatCallback(reason);
    }
  }

  private deployHoneypotTraps() {
    if (typeof window === 'undefined') return;
    const trapNames = ['__firebase_keys__', 'firebase_secret_key', '__FIREBASE_CONFIG__', 'admin_override_key'];
    trapNames.forEach((trap) => {
      try {
        Object.defineProperty(window, trap, {
          get: () => {
            this.banDeviceAndUser('Taqiqlangan tizim xavfsizlik skanerlash urinishi aniqlandi.');
            return null;
          },
          set: () => {
            this.banDeviceAndUser("Taqiqlangan tizim parametrlarini o'zgartirish urinishi.");
          },
          configurable: false
        });
      } catch {}
    });
  }

  private detectHeadlessBots() {
    if (typeof window === 'undefined') return;
    try {
      if ((navigator as any).webdriver || (window as any)._phantom || (window as any).__nightmare) {
        this.banDeviceAndUser('Avtomatlashtirilgan bot dasturi (Headless Browser) aniqlandi!');
      }
    } catch {}
  }

  public isDevToolsOpen(): boolean {
    return this._isDevToolsOpen;
  }

  public subscribeDevTools(listener: DevToolsListener): () => void {
    this.devToolsListeners.add(listener);
    listener(this._isDevToolsOpen);
    return () => {
      this.devToolsListeners.delete(listener);
    };
  }

  private setDevToolsState(isOpen: boolean) {
    if (this._isDevToolsOpen !== isOpen) {
      this._isDevToolsOpen = isOpen;
      this.devToolsListeners.forEach((fn) => {
        try {
          fn(isOpen);
        } catch {}
      });
    }
  }

  public checkDevToolsNow(): boolean {
    if (typeof window === 'undefined') return false;
    let detected = false;
    const isTopLevel = window.self === window.top;

    const isPhysicalMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
      (('ontouchstart' in window && window.screen.width <= 768) || typeof window.orientation !== 'undefined');

    if (isTopLevel && !isPhysicalMobile) {
      try {
        const dpr = window.devicePixelRatio || 1;
        const outerW = window.outerWidth;
        const outerH = window.outerHeight;
        const physicalInnerW = window.innerWidth * dpr;
        const physicalInnerH = window.innerHeight * dpr;

        if (outerW > 450 && outerH > 350) {
          const widthDiff = outerW - physicalInnerW;
          const heightDiff = outerH - physicalInnerH;
          if (widthDiff > 280 || heightDiff > 340) {
            detected = true;
          }
        }
      } catch {}
    }

    if (detected) {
      this.consecutiveDetections++;
      this.consecutiveClean = 0;
      if (this.consecutiveDetections >= 2) {
        this.setDevToolsState(true);
      }
    } else {
      this.consecutiveClean++;
      this.consecutiveDetections = 0;
      if (this.consecutiveClean >= 1) {
        this.setDevToolsState(false);
      }
    }

    return this._isDevToolsOpen;
  }

  private startDevToolsProtection() {
    if (this.devToolsCheckInterval) return;
    this.devToolsCheckInterval = setInterval(() => {
      this.checkDevToolsNow();
    }, 600);

    window.addEventListener('resize', () => {
      this.checkDevToolsNow();
    }, { passive: true });
  }

  private isForbiddenKeyCombo(e: KeyboardEvent): boolean {
    const key = e.key || '';
    const code = e.code || '';
    const keyCode = e.keyCode || e.which || 0;

    if (key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      return false;
    }

    if (
      (keyCode >= 112 && keyCode <= 135) ||
      code.startsWith('F1') ||
      code.startsWith('F2') ||
      code.startsWith('F3') ||
      code.startsWith('F4') ||
      code.startsWith('F5') ||
      code.startsWith('F6') ||
      code.startsWith('F7') ||
      code.startsWith('F8') ||
      code.startsWith('F9') ||
      /^F([1-9]|1[0-9]|2[0-4])$/i.test(key)
    ) {
      return true;
    }

    const lowerKey = key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (['i', 'j', 'c', 'k', 'm', 'e', 's', 'p', 'd'].includes(lowerKey)) {
        return true;
      }
    }

    if (e.metaKey && e.altKey) {
      if (['i', 'j', 'c', 'k', 'm', 'u', 's', 'p', 'e'].includes(lowerKey)) {
        return true;
      }
    }

    if ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(lowerKey)) {
      return true;
    }

    if (lowerKey === 'printscreen' || lowerKey === 'prtscr' || lowerKey === 'snapshot') {
      return true;
    }

    return false;
  }

  private blockEvent(e: KeyboardEvent | MouseEvent) {
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch {}
  }

  private attachGlobalSecurityListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener(
      'contextmenu',
      (e: MouseEvent) => {
        this.blockEvent(e);
      },
      { capture: true, passive: false }
    );

    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (this.isForbiddenKeyCombo(e)) {
          this.blockEvent(e);
          const lowerKey = (e.key || '').toLowerCase();
          if (lowerKey === 'printscreen' || lowerKey === 'prtscr' || lowerKey === 'snapshot') {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText('');
            }
          }
        }
      },
      { capture: true, passive: false }
    );
  }
}

export const antiCheatManager = new AntiCheatSystem();
