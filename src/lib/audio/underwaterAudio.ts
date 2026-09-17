/**
 * Generator Audio Prosedural Bawah Air (Zero-Asset Web Audio API)
 *
 * Menggunakan Web Audio API native tanpa memerlukan aset file audio eksternal (.mp3/.wav):
 * 1. Deep Ocean Rumble: Deru frekuensi rendah tekanan air laut via lowpass pink noise + LFO
 * 2. Coral Bubble Pops: Letupan gelembung mikro naik dari sela karang
 * 3. Water Droplet Chime: Suara tetesan kristal saat butiran pakan dilepaskan ke air
 * 4. Fish Nibble Pop: Resonansi gelembung lembut saat ikan memakan pakan
 */

class UnderwaterAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private bubbleTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Lazy initialization saat interaksi pertama
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  /**
   * Mengubah status mute/unmute
   */
  public toggleMute(): boolean {
    this.initContext();
    if (!this.ctx) return true;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (!this.isMuted) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }

    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Memulai deru suasana tenang dasar laut (Sub-bass Ambient Rumble)
   */
  private startAmbient() {
    if (!this.ctx || this.isMuted) return;

    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.5);
      return;
    }

    try {
      // 1. Buat buffer pink noise berdurasi 4 detik (di-loop)
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      // 2. Filter Lowpass ganda untuk nuansa air teredam (muffled underwater acoustics)
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(140, this.ctx.currentTime);
      lowpass.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // LFO lembut untuk dinamika arus air laut
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // 0.18 Hz ayunan ombak
      lfoGain.gain.setValueAtTime(45, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);
      lfo.start();

      // Master gain ambience
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 1.2);

      this.noiseNode.connect(lowpass);
      lowpass.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      this.noiseNode.start();

      // Mulai timer gelembung berkala
      this.startBubbleInterval();
    } catch (e) {
      console.warn("Gagal memulai Web Audio ambience:", e);
    }
  }

  private stopAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    this.ambientGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    if (this.bubbleTimer) {
      clearInterval(this.bubbleTimer);
      this.bubbleTimer = null;
    }
  }

  private startBubbleInterval() {
    if (this.bubbleTimer) clearInterval(this.bubbleTimer);
    this.bubbleTimer = setInterval(() => {
      if (!this.isMuted && Math.random() < 0.65) {
        this.triggerBubblePop();
      }
    }, 2800);
  }

  /**
   * Efek gelembung udara mikro naik (Resonant pop chirp)
   */
  public triggerBubblePop(pitchMod: number = 1.0) {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = (380 + Math.random() * 220) * pitchMod;
      const endFreq = startFreq * (1.8 + Math.random() * 0.5);

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Abaikan error audio background
    }
  }

  /**
   * Efek suara tetesan pakan kristal saat menyentuh air (Droplet Chime)
   */
  public triggerFeedDrop() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    try {
      const now = this.ctx.currentTime;

      // 1. Nada kristal primer
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(784, now); // G5
      osc1.frequency.exponentialRampToValueAtTime(1174, now + 0.06); // D6
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      // 2. Harmoni riak sekunder
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318, now + 0.04); // E6
      gain2.gain.setValueAtTime(0.08, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.36);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.42);
    } catch {
      // ignore
    }
  }

  /**
   * Efek letupan halus saat ikan memakan butiran pakan (Nibble Pop)
   */
  public triggerFishBite() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(620 + Math.random() * 100, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // ignore
    }
  }
}

// Singleton audio controller
export const underwaterAudio = new UnderwaterAudioController();
