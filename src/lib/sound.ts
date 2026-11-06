/**
 * Sound & Vibration Service
 * Uses Web Audio API to generate notification sounds without external files.
 * All sounds are synthesized programmatically for maximum compatibility.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }

  /** Resume context if suspended (required by browsers after user gesture) */
  private async resumeCtx(): Promise<AudioContext | null> {
    try {
      const ctx = this.getCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return ctx;
    } catch {
      return null;
    }
  }

  /**
   * Core tone generator
   * @param frequency Hz
   * @param duration  seconds
   * @param volume    0–1  (will be amplified; keep <= 1)
   * @param type      oscillator wave type
   * @param delay     start delay in seconds
   */
  private playTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
    delay = 0
  ) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    // Envelope: quick attack → sustain → fast release
    const startTime = ctx.currentTime + delay;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.setValueAtTime(volume, startTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /** 🔔 New deposit / transfer proof received — alert ding-ding-ding (ascending) */
  async playNewDeposit() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.85;
    this.playTone(ctx, 880, 0.18, vol, 'sine', 0);
    this.playTone(ctx, 1100, 0.18, vol, 'sine', 0.20);
    this.playTone(ctx, 1320, 0.22, vol, 'sine', 0.40);
    this.playTone(ctx, 1760, 0.30, vol, 'sine', 0.60);
    this.vibrate([200, 80, 200, 80, 300]);
  }

  /** 💸 New withdrawal request — two-tone alert */
  async playNewWithdrawal() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.85;
    this.playTone(ctx, 660, 0.20, vol, 'square', 0);
    this.playTone(ctx, 550, 0.20, vol, 'square', 0.22);
    this.playTone(ctx, 660, 0.20, vol, 'square', 0.44);
    this.playTone(ctx, 880, 0.28, vol, 'sine', 0.66);
    this.vibrate([150, 60, 150, 60, 400]);
  }

  /** ✅ Approved — cheerful ascending chord */
  async playApproved() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.80;
    this.playTone(ctx, 523, 0.15, vol, 'sine', 0);     // C5
    this.playTone(ctx, 659, 0.15, vol, 'sine', 0.14);  // E5
    this.playTone(ctx, 784, 0.15, vol, 'sine', 0.28);  // G5
    this.playTone(ctx, 1047, 0.30, vol, 'sine', 0.42); // C6
    this.vibrate([100, 50, 100, 50, 200]);
  }

  /** ❌ Rejected — descending tone */
  async playRejected() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.80;
    this.playTone(ctx, 500, 0.20, vol, 'sawtooth', 0);
    this.playTone(ctx, 380, 0.20, vol, 'sawtooth', 0.22);
    this.playTone(ctx, 280, 0.30, vol, 'sawtooth', 0.44);
    this.vibrate([300, 100, 300]);
  }

  /** 🎉 Points unlocked — festive melody */
  async playPointsUnlocked() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.80;
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      this.playTone(ctx, freq, 0.18, vol, 'sine', i * 0.17);
    });
    this.vibrate([100, 50, 100, 50, 100, 50, 500]);
  }

  /** ⏰ Points countdown milestone — 10 days remaining (gentle reminder) */
  async playMilestone10Days() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.75;
    this.playTone(ctx, 740, 0.18, vol, 'sine', 0);
    this.playTone(ctx, 880, 0.22, vol, 'sine', 0.20);
    this.vibrate([150, 80, 150]);
  }

  /** ⚠️ Points countdown milestone — 5 days remaining (urgent notice) */
  async playMilestone5Days() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.80;
    this.playTone(ctx, 660, 0.16, vol, 'sine', 0);
    this.playTone(ctx, 880, 0.16, vol, 'sine', 0.18);
    this.playTone(ctx, 1100, 0.24, vol, 'sine', 0.36);
    this.vibrate([200, 80, 200, 80, 200]);
  }

  /** 🚨 Points countdown milestone — 1 day remaining (alarm) */
  async playMilestone1Day() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    const vol = 0.85;
    // Repeating urgent alarm pattern
    this.playTone(ctx, 1000, 0.12, vol, 'square', 0);
    this.playTone(ctx, 800,  0.12, vol, 'square', 0.14);
    this.playTone(ctx, 1000, 0.12, vol, 'square', 0.28);
    this.playTone(ctx, 800,  0.12, vol, 'square', 0.42);
    this.playTone(ctx, 1320, 0.30, vol, 'sine',   0.58);
    this.vibrate([300, 100, 300, 100, 600]);
  }

  /** Generic soft ping */
  async playPing() {
    const ctx = await this.resumeCtx();
    if (!ctx) return;
    this.playTone(ctx, 1000, 0.22, 0.70, 'sine', 0);
    this.vibrate([100]);
  }

  /** Vibration pattern — silently ignored on desktop */
  vibrate(pattern: number | number[]) {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors (e.g., unsupported)
    }
  }

  /** Unlock AudioContext on first user interaction (call once globally) */
  unlock() {
    try {
      this.getCtx();
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService();
