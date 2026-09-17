import { getTerrainHeight } from "../terrain/terrainHeight";
import { underwaterAudio } from "../audio/underwaterAudio";

export interface FoodPellet {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  age: number;
  lifespan: number;
  consumed: boolean;
  color: string;
  glowColor: string;
  scale: number;
}

export interface WaterRipple {
  id: string;
  center: [number, number, number];
  radius: number;
  maxRadius: number;
  opacity: number;
  age: number;
  lifespan: number;
}

export interface BurstBubble {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  scale: number;
  opacity: number;
  age: number;
  lifespan: number;
}

export interface FeedingStats {
  totalFeedCount: number;
  totalEatenCount: number;
}

type Listener = () => void;

class FeedingSystemManager {
  public pellets: FoodPellet[] = [];
  public ripples: WaterRipple[] = [];
  public burstBubbles: BurstBubble[] = [];
  public stats: FeedingStats = {
    totalFeedCount: 0,
    totalEatenCount: 0,
  };

  private listeners: Set<Listener> = new Set();
  private pelletIdCounter = 0;
  private rippleIdCounter = 0;
  private burstIdCounter = 0;

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Menjatuhkan butiran pakan di posisi 3D tertentu (dari tap/click raycast)
   */
  public dropPellet(worldPos: [number, number, number]): FoodPellet {
    const id = `pellet-${++this.pelletIdCounter}`;

    // Variasi warna mutiara bercahaya (emas, amber hangat, mutiara bioluminescent)
    const colors = [
      { color: "#ffd56b", glow: "#ffb703" },
      { color: "#ffffff", glow: "#ff70a6" },
      { color: "#ffeedb", glow: "#ff9770" },
    ];
    const picked = colors[this.pelletIdCounter % colors.length];

    const pellet: FoodPellet = {
      id,
      position: [worldPos[0], worldPos[1], worldPos[2]],
      velocity: [
        (Math.random() - 0.5) * 0.08, // sedikit drift horizontal
        -0.12 - Math.random() * 0.05, // meluncur turun perlahan dalam air
        (Math.random() - 0.5) * 0.08,
      ],
      age: 0,
      lifespan: 14.0, // bertahan hingga 14 detik jika tidak dimakan
      consumed: false,
      color: picked.color,
      glowColor: picked.glow,
      scale: 0.038 + Math.random() * 0.015,
    };

    this.pellets.push(pellet);
    this.stats.totalFeedCount++;

    // Memicu riak air di titik jatuh
    this.createRipple([worldPos[0], worldPos[1], worldPos[2]], 0.85);

    // Memicu suara tetesan kristal (Web Audio)
    underwaterAudio.triggerFeedDrop();

    this.notify();
    return pellet;
  }

  /**
   * Membuat gelombang riak air melingkar
   */
  public createRipple(center: [number, number, number], maxRadius = 0.7) {
    const id = `ripple-${++this.rippleIdCounter}`;
    this.ripples.push({
      id,
      center: [center[0], center[1], center[2]],
      radius: 0.04,
      maxRadius,
      opacity: 0.85,
      age: 0,
      lifespan: 1.6,
    });
    this.notify();
  }

  /**
   * Dipanggil saat ikan memakan pakan
   */
  public consumePellet(pelletId: string) {
    const idx = this.pellets.findIndex((p) => p.id === pelletId);
    if (idx === -1) return;

    const p = this.pellets[idx];
    p.consumed = true;
    this.stats.totalEatenCount++;

    // Memicu letupan gelembung halus (bubble sparkle burst)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 0.15 + Math.random() * 0.18;
      this.burstBubbles.push({
        id: `burst-${++this.burstIdCounter}`,
        position: [p.position[0], p.position[1], p.position[2]],
        velocity: [
          Math.cos(angle) * speed,
          0.12 + Math.random() * 0.20, // gelembung melesat ke atas
          Math.sin(angle) * speed,
        ],
        scale: 0.02 + Math.random() * 0.02,
        opacity: 0.9,
        age: 0,
        lifespan: 0.8 + Math.random() * 0.4,
      });
    }

    // Suara kunyahan / letupan gelembung
    underwaterAudio.triggerFishBite();

    // Hapus pakan dari array
    this.pellets.splice(idx, 1);
    this.notify();
  }

  /**
   * Update per frame (animasi gerak jatuh, hambatan air, pemudaran riak)
   */
  public update(delta: number) {
    const dt = Math.min(delta, 0.1);

    // 1. Update Pellets
    for (let i = this.pellets.length - 1; i >= 0; i--) {
      const p = this.pellets[i];
      p.age += dt;

      // Hambatan air (drag)
      p.velocity[0] *= 0.96;
      p.velocity[2] *= 0.96;

      p.position[0] += p.velocity[0] * dt;
      p.position[1] += p.velocity[1] * dt;
      p.position[2] += p.velocity[2] * dt;

      // Cek apakah pakan mendarat di permukaan terrain pasir
      const groundY = getTerrainHeight(p.position[0], p.position[2]);
      if (p.position[1] <= groundY + 0.03) {
        p.position[1] = groundY + 0.03;
        p.velocity[0] = 0;
        p.velocity[1] = 0;
        p.velocity[2] = 0;
      }

      // Hapus jika sudah kedaluwarsa
      if (p.age >= p.lifespan) {
        this.pellets.splice(i, 1);
      }
    }

    // 2. Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.age += dt;
      const progress = r.age / r.lifespan;

      r.radius = 0.04 + (r.maxRadius - 0.04) * Math.sin(progress * (Math.PI / 2));
      r.opacity = Math.max(0, 0.85 * (1 - progress));

      if (r.age >= r.lifespan) {
        this.ripples.splice(i, 1);
      }
    }

    // 3. Update Burst Bubbles
    for (let i = this.burstBubbles.length - 1; i >= 0; i--) {
      const b = this.burstBubbles[i];
      b.age += dt;
      const progress = b.age / b.lifespan;

      b.position[0] += b.velocity[0] * dt;
      b.position[1] += b.velocity[1] * dt;
      b.position[2] += b.velocity[2] * dt;

      b.velocity[0] *= 0.92;
      b.velocity[2] *= 0.92;
      b.velocity[1] += 0.05 * dt; // gaya apung (buoyancy)

      b.opacity = Math.max(0, 0.9 * (1 - progress));

      if (b.age >= b.lifespan) {
        this.burstBubbles.splice(i, 1);
      }
    }
  }
}

export const feedingSystem = new FeedingSystemManager();
