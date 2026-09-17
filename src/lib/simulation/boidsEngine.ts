import {
  FishState,
  MarineSpecies,
  SPECIES_CONFIGS,
  OCEAN_BOUNDS,
} from "./boidsConfig";
import { StaticObstacle, STATIC_OBSTACLES } from "./obstacles";
import { getTerrainHeight } from "../terrain/terrainHeight";
import { feedingSystem, FoodPellet } from "./feedingSystem";

/**
 * Generator seeded pseudo-random deterministik (mulberry32).
 * Memastikan setiap instance ikan konsisten menghasilkan variasi yang sama
 * tanpa menggunakan Math.random() setiap frame.
 */
export function createSeededRandom(seed: number) {
  let s = Math.floor(Math.abs(seed)) + 1;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Struktur Data Agen Satwa Laut Boids 3D
 */
export interface BoidAgent {
  id: string;
  clusterId: string; // ID kelompok flock (hanya boids dengan clusterId sama yang beriringan)
  species: MarineSpecies;

  // Transformasi & Kinematika 3D
  position: [number, number, number];
  velocity: [number, number, number];
  acceleration: [number, number, number];
  headingYaw: number;
  pitch: number;
  roll: number;

  // Variasi Per-Instance (Dihitung 1 kali saat inisialisasi)
  instanceSeed: number;
  speedMultiplier: number;
  swayPhaseOffset: number;
  swayFreqMultiplier: number;
  bobAmplitude: number;
  scale: number;
  collisionRadius: number;

  // Titik Rumah / Jangkar Karang (Home Anchor)
  homeAnchor: [number, number, number];
  anchorRadius: number;

  // State Machine Dinamis (wandering | pausing | darting)
  state: FishState;
  stateTimer: number;
  dartDirection: [number, number, number];
  wanderAngle: number;
}

export interface CreateBoidOptions {
  id: string;
  clusterId: string;
  species: MarineSpecies;
  initialPosition: [number, number, number];
  initialVelocity?: [number, number, number];
  homeAnchor?: [number, number, number];
  anchorRadius?: number;
  seed: number;
}

/**
 * Membuat satu agen satwa laut dengan parameter variasi per-instance
 */
export function createBoidAgent(opts: CreateBoidOptions): BoidAgent {
  const cfg = SPECIES_CONFIGS[opts.species];
  const rand = createSeededRandom(opts.seed);

  // Variasi unik per-instance:
  const speedMultiplier = 0.85 + rand() * 0.35; // 85% - 120% kecepatan
  const swayPhaseOffset = rand() * Math.PI * 2;
  const swayFreqMultiplier = 0.9 + rand() * 0.25;
  const bobAmplitude = 0.02 + rand() * 0.04;
  const scale = cfg.baseScale * (0.88 + rand() * 0.24); // variasi ukuran +/- 12%
  const collisionRadius = cfg.collisionRadius * (scale / cfg.baseScale);

  // Pastikan posisi awal Y selalu di atas terrain dengan clearance aman
  const terrainAtSpawn = getTerrainHeight(opts.initialPosition[0], opts.initialPosition[2]);
  const safeInitialY = Math.max(opts.initialPosition[1], terrainAtSpawn + cfg.minTerrainClearance + 0.08);

  // Kecepatan awal
  const angle = rand() * Math.PI * 2;
  const initSpeed = cfg.speeds.wandering * speedMultiplier;
  const vx = opts.initialVelocity ? opts.initialVelocity[0] : Math.sin(angle) * initSpeed;
  const vz = opts.initialVelocity ? opts.initialVelocity[2] : Math.cos(angle) * initSpeed;
  const vy = opts.initialVelocity ? opts.initialVelocity[1] : (rand() - 0.5) * 0.04;

  // State awal
  const wanderDurRange = cfg.stateDurations.wandering;
  const initialTimer = wanderDurRange[0] + rand() * (wanderDurRange[1] - wanderDurRange[0]);

  return {
    id: opts.id,
    clusterId: opts.clusterId,
    species: opts.species,
    position: [opts.initialPosition[0], safeInitialY, opts.initialPosition[2]],
    velocity: [vx, vy, vz],
    acceleration: [0, 0, 0],
    headingYaw: Math.atan2(vx, vz),
    pitch: 0,
    roll: 0,
    instanceSeed: opts.seed,
    speedMultiplier,
    swayPhaseOffset,
    swayFreqMultiplier,
    bobAmplitude,
    scale,
    collisionRadius,
    homeAnchor: opts.homeAnchor || [opts.initialPosition[0], safeInitialY, opts.initialPosition[2]],
    anchorRadius: opts.anchorRadius || 0.8,
    state: "wandering",
    stateTimer: initialTimer,
    dartDirection: [vx, vy, vz],
    wanderAngle: rand() * Math.PI * 2,
  };
}

/**
 * Mesin Simulasi Boids Flocking 3D dengan 4 Gaya & Penghindaran Rintangan Statis
 */
export class BoidsSimulationEngine {
  public agents: BoidAgent[] = [];
  public obstacles: StaticObstacle[] = STATIC_OBSTACLES;

  constructor(agents: BoidAgent[] = [], obstacles: StaticObstacle[] = STATIC_OBSTACLES) {
    this.agents = agents;
    this.obstacles = obstacles;
  }

  /**
   * Menambahkan agen baru ke simulasi
   */
  public addAgent(agent: BoidAgent) {
    this.agents.push(agent);
  }

  /**
   * Update seluruh simulasi per frame (60 / 120 FPS)
   */
  public update(dt: number, elapsed: number) {
    const clampedDt = Math.min(dt, 0.08);
    const count = this.agents.length;

    // ------------------------------------------------------------------------
    // Langkah 1: Update State Machine untuk Tiap Agen
    // ------------------------------------------------------------------------
    for (let i = 0; i < count; i++) {
      this.updateStateMachine(this.agents[i], clampedDt);
    }

    // ------------------------------------------------------------------------
    // Langkah 2: Hitung 4 Gaya Boids:
    // (1) Separation, (2) Alignment, (3) Cohesion, (4) Obstacle Avoidance
    // ------------------------------------------------------------------------
    for (let i = 0; i < count; i++) {
      const a = this.agents[i];
      const cfg = SPECIES_CONFIGS[a.species];

      // Reset percepatan
      a.acceleration[0] = 0;
      a.acceleration[1] = 0;
      a.acceleration[2] = 0;

      // Gaya ke-4 (Obstacle Avoidance terhadap karang & batu)
      const obsForce = this.calculateObstacleAvoidance(a);

      // Gaya ke-5 (Terrain Proximity Avoidance - dorongan menjauh dari permukaan pasir)
      const terPushUp = this.calculateTerrainProximityForce(a);

      if (a.state === "pausing") {
        // Saat pausing, redam kecepatan dan tetap hindari rintangan jika terlalu dekat
        a.velocity[0] *= 0.94;
        a.velocity[1] *= 0.92;
        a.velocity[2] *= 0.94;

        a.acceleration[0] += obsForce[0] * cfg.obstacleAvoidanceWeight * 0.8;
        a.acceleration[1] += (obsForce[1] * cfg.obstacleAvoidanceWeight + terPushUp) * 0.8;
        a.acceleration[2] += obsForce[2] * cfg.obstacleAvoidanceWeight * 0.8;

        a.position[1] += Math.sin(elapsed * 1.8 + a.swayPhaseOffset) * 0.0006;
      } else if (a.state === "darting") {
        // Saat darting, semburan cepat namun rintangan tetap diprioritaskan
        const dartTargetSpeed = cfg.speeds.darting * a.speedMultiplier;
        const dx = a.dartDirection[0] * dartTargetSpeed - a.velocity[0];
        const dy = a.dartDirection[1] * dartTargetSpeed - a.velocity[1];
        const dz = a.dartDirection[2] * dartTargetSpeed - a.velocity[2];

        a.acceleration[0] += dx * 3.5 + obsForce[0] * cfg.obstacleAvoidanceWeight * 1.5;
        a.acceleration[1] += dy * 2.0 + (obsForce[1] * cfg.obstacleAvoidanceWeight + terPushUp) * 1.5;
        a.acceleration[2] += dz * 3.5 + obsForce[2] * cfg.obstacleAvoidanceWeight * 1.5;
      } else {
        // State "wandering": Kalkulasi Flocking Boids Penuh (4 Gaya Utama)
        const sep = this.calculateSeparation(a);
        const ali = this.calculateAlignment(a);
        const coh = this.calculateCohesion(a);
        const wnd = this.calculateWander(a, elapsed);
        const anc = this.calculateHomeAnchor(a);

        // Jumlahkan 4 gaya boids dengan bobot prioritas
        // obstacleAvoidanceWeight memiliki bobot paling kuat agar tabrakan selalu dihindari
        a.acceleration[0] +=
          sep[0] * cfg.separationWeight +
          ali[0] * cfg.alignmentWeight +
          coh[0] * cfg.cohesionWeight +
          obsForce[0] * cfg.obstacleAvoidanceWeight +
          wnd[0] * cfg.wanderWeight +
          anc[0] * 1.1;

        a.acceleration[1] +=
          sep[1] * cfg.separationWeight +
          ali[1] * (cfg.alignmentWeight * 0.5) +
          coh[1] * (cfg.cohesionWeight * 0.5) +
          obsForce[1] * cfg.obstacleAvoidanceWeight +
          terPushUp * cfg.terrainAvoidanceWeight +
          wnd[1] * (cfg.wanderWeight * 0.4) +
          anc[1] * 1.3;

        a.acceleration[2] +=
          sep[2] * cfg.separationWeight +
          ali[2] * cfg.alignmentWeight +
          coh[2] * cfg.cohesionWeight +
          obsForce[2] * cfg.obstacleAvoidanceWeight +
          wnd[2] * cfg.wanderWeight +
          anc[2] * 1.1;
      }

      // Gaya Pembatas Lingkungan Laut (Ceiling & Perimeter Avoidance)
      const bnd = this.calculateBoundaryAvoidance(a);
      a.acceleration[0] += bnd[0] * cfg.boundaryWeight;
      a.acceleration[1] += bnd[1] * cfg.boundaryWeight;
      a.acceleration[2] += bnd[2] * cfg.boundaryWeight;

      // ----------------------------------------------------------------------
      // Interaksi Milestone 5: Reaksi Kaget (Startle Reflex) terhadap Riak Air
      // ----------------------------------------------------------------------
      for (let rIdx = 0; rIdx < feedingSystem.ripples.length; rIdx++) {
        const rip = feedingSystem.ripples[rIdx];
        if (rip.age < 0.4) {
          const rx = a.position[0] - rip.center[0];
          const ry = a.position[1] - rip.center[1];
          const rz = a.position[2] - rip.center[2];
          const rDistSq = rx * rx + ry * ry + rz * rz;
          if (rDistSq < 0.48 * 0.48 && rDistSq > 0.0001) {
            const rDist = Math.sqrt(rDistSq);
            a.state = "darting";
            a.stateTimer = 1.2;
            a.dartDirection = [rx / rDist, Math.abs(ry / rDist) * 0.6, rz / rDist];
            a.velocity[0] = a.dartDirection[0] * cfg.speeds.darting * 1.3;
            a.velocity[1] = a.dartDirection[1] * cfg.speeds.darting * 0.8;
            a.velocity[2] = a.dartDirection[2] * cfg.speeds.darting * 1.3;
          }
        }
      }

      // ----------------------------------------------------------------------
      // Interaksi Milestone 5: Gaya Tarik Pakan (Food Attraction & Foraging)
      // ----------------------------------------------------------------------
      if (a.state !== "darting" && a.species !== "manta" && feedingSystem.pellets.length > 0) {
        let nearestPellet: FoodPellet | null = null;
        let nearestDistSq = Infinity;
        const forageRadiusSq = 2.4 * 2.4;

        for (let pIdx = 0; pIdx < feedingSystem.pellets.length; pIdx++) {
          const p = feedingSystem.pellets[pIdx];
          if (p.consumed) continue;
          const px = p.position[0] - a.position[0];
          const py = p.position[1] - a.position[1];
          const pz = p.position[2] - a.position[2];
          const distSq = px * px + py * py + pz * pz;
          if (distSq < forageRadiusSq && distSq < nearestDistSq) {
            nearestDistSq = distSq;
            nearestPellet = p;
          }
        }

        if (nearestPellet) {
          const dist = Math.sqrt(nearestDistSq);
          const eatDist = a.collisionRadius + nearestPellet.scale + 0.09;

          if (dist <= eatDist) {
            // Ikan memakan pakan!
            feedingSystem.consumePellet(nearestPellet.id);
            a.state = "pausing";
            a.stateTimer = 1.1;
            a.velocity[0] *= 0.25;
            a.velocity[1] *= 0.25;
            a.velocity[2] *= 0.25;
          } else {
            // Berenang cepat menuju pakan
            const px = nearestPellet.position[0] - a.position[0];
            const py = nearestPellet.position[1] - a.position[1];
            const pz = nearestPellet.position[2] - a.position[2];
            const foodSteerWeight = 3.2;
            a.acceleration[0] += (px / dist) * foodSteerWeight;
            a.acceleration[1] += (py / dist) * (foodSteerWeight * 0.9);
            a.acceleration[2] += (pz / dist) * foodSteerWeight;
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // Langkah 3: Integrasi Kecepatan & Posisi
    // ------------------------------------------------------------------------
    for (let i = 0; i < count; i++) {
      const a = this.agents[i];
      const cfg = SPECIES_CONFIGS[a.species];
      const maxSpd =
        (a.state === "darting" ? cfg.speeds.darting : cfg.speeds.wandering) *
        a.speedMultiplier;
      const maxFrc = cfg.maxForce[a.state];

      // Batasi akselerasi maksimum
      const accLen = Math.sqrt(
        a.acceleration[0] * a.acceleration[0] +
        a.acceleration[1] * a.acceleration[1] +
        a.acceleration[2] * a.acceleration[2]
      );
      if (accLen > maxFrc && accLen > 0.0001) {
        a.acceleration[0] = (a.acceleration[0] / accLen) * maxFrc;
        a.acceleration[1] = (a.acceleration[1] / accLen) * maxFrc;
        a.acceleration[2] = (a.acceleration[2] / accLen) * maxFrc;
      }

      // v = v + a * dt
      a.velocity[0] += a.acceleration[0] * clampedDt;
      a.velocity[1] += a.acceleration[1] * clampedDt;
      a.velocity[2] += a.acceleration[2] * clampedDt;

      // Batasi kecepatan maksimum
      const spd = Math.sqrt(
        a.velocity[0] * a.velocity[0] +
        a.velocity[1] * a.velocity[1] +
        a.velocity[2] * a.velocity[2]
      );
      if (spd > maxSpd && spd > 0.0001) {
        a.velocity[0] = (a.velocity[0] / spd) * maxSpd;
        a.velocity[1] = (a.velocity[1] / spd) * maxSpd;
        a.velocity[2] = (a.velocity[2] / spd) * maxSpd;
      }

      // p = p + v * dt
      a.position[0] += a.velocity[0] * clampedDt;
      a.position[1] += a.velocity[1] * clampedDt;
      a.position[2] += a.velocity[2] * clampedDt;
    }

    // ------------------------------------------------------------------------
    // Langkah 4: Kerangka Anti-Penetrasi Rintangan & Ground Clamping
    // ------------------------------------------------------------------------
    for (let i = 0; i < count; i++) {
      const a = this.agents[i];
      const cfg = SPECIES_CONFIGS[a.species];

      // A. Hard Obstacle Penetration Solver (Mencegah ikan menembus karang)
      for (let k = 0; k < this.obstacles.length; k++) {
        const obs = this.obstacles[k];
        const dx = a.position[0] - obs.pos[0];
        const dy = a.position[1] - (obs.pos[1] + obs.height * 0.4);
        const dz = a.position[2] - obs.pos[2];
        const distSq = dx * dx + dy * dy + dz * dz;

        const hardRadius = obs.radius + a.collisionRadius;
        if (distSq < hardRadius * hardRadius && distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const pushOut = (hardRadius - dist) / dist;

          // Dorong ikan keluar dari fisik karang
          a.position[0] += dx * pushOut * 1.05;
          a.position[1] += Math.max(dy * pushOut, 0.04);
          a.position[2] += dz * pushOut * 1.05;

          // Redam kecepatan yang mengarah ke dalam rintangan
          const dot = a.velocity[0] * dx + a.velocity[1] * dy + a.velocity[2] * dz;
          if (dot < 0) {
            a.velocity[0] -= (dx / dist) * (dot / dist) * 1.2;
            a.velocity[1] -= (dy / dist) * (dot / dist) * 1.2;
            a.velocity[2] -= (dz / dist) * (dot / dist) * 1.2;
          }
        }
      }

      // B. Hard Floor Clamping (Sample Height dari Terrain Kontinu)
      // Menjamin posisi Y tidak pernah turun di bawah permukaan pasir di (X, Z) itu
      const yGround = getTerrainHeight(a.position[0], a.position[2]);
      const minYAllowed = yGround + cfg.minTerrainClearance;

      if (a.position[1] < minYAllowed) {
        a.position[1] = minYAllowed;
        // Jika sedang bergerak ke bawah, belokkan ke atas
        if (a.velocity[1] < 0) {
          a.velocity[1] = Math.abs(a.velocity[1]) * 0.35 + 0.08;
        }
      }

      // C. Hard Ceiling Clamping
      if (a.position[1] > OCEAN_BOUNDS.maxY) {
        a.position[1] = OCEAN_BOUNDS.maxY;
        if (a.velocity[1] > 0) a.velocity[1] = -0.05;
      }
    }

    // ------------------------------------------------------------------------
    // Langkah 5: Kerangka Anti-Tabrakan Antar Ikan (Pairwise Hard Collision)
    // ------------------------------------------------------------------------
    for (let i = 0; i < count; i++) {
      const a1 = this.agents[i];
      for (let j = i + 1; j < count; j++) {
        const a2 = this.agents[j];
        const minDist = a1.collisionRadius + a2.collisionRadius;

        const dx = a1.position[0] - a2.position[0];
        const dy = a1.position[1] - a2.position[1];
        const dz = a1.position[2] - a2.position[2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < minDist * minDist && distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          const push = (overlap / dist) * 0.5;

          a1.position[0] += dx * push;
          a1.position[1] += dy * push * 0.4;
          a1.position[2] += dz * push;

          a2.position[0] -= dx * push;
          a2.position[1] -= dy * push * 0.4;
          a2.position[2] -= dz * push;
        }
      }
    }

    // ------------------------------------------------------------------------
    // Langkah 6: Hitung Orientasi Arah Hadap (Heading, Pitch, & Roll)
    // ------------------------------------------------------------------------
    for (let i = 0; i < count; i++) {
      const a = this.agents[i];
      const vx = a.velocity[0];
      const vy = a.velocity[1];
      const vz = a.velocity[2];
      const hSpeed = Math.sqrt(vx * vx + vz * vz);

      if (hSpeed > 0.01) {
        const targetYaw = Math.atan2(vx, vz);
        const prevYaw = a.headingYaw;
        let diffYaw = targetYaw - prevYaw;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
        a.headingYaw += diffYaw * Math.min(1.0, clampedDt * 8.0);

        a.pitch = Math.atan2(-vy, hSpeed);

        const turnRate = diffYaw / clampedDt;
        const targetRoll = -Math.min(0.45, Math.max(-0.45, turnRate * 0.25));
        a.roll += (targetRoll - a.roll) * Math.min(1.0, clampedDt * 6.0);
      }
    }
  }

  // ==========================================================================
  // KALKULASI GAYA-GAYA BOIDS
  // ==========================================================================

  /**
   * 1. Separation: Menghindar dari sesama ikan yang terlalu dekat
   */
  private calculateSeparation(a: BoidAgent): [number, number, number] {
    const cfg = SPECIES_CONFIGS[a.species];
    const desired = cfg.desiredSeparation;
    let steerX = 0, steerY = 0, steerZ = 0;
    let neighborCount = 0;

    for (let i = 0; i < this.agents.length; i++) {
      const other = this.agents[i];
      if (other.id === a.id) continue;

      const dx = a.position[0] - other.position[0];
      const dy = a.position[1] - other.position[1];
      const dz = a.position[2] - other.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > 0 && dist < desired) {
        const factor = (desired - dist) / dist;
        steerX += dx * factor;
        steerY += dy * factor;
        steerZ += dz * factor;
        neighborCount++;
      }
    }

    if (neighborCount > 0) {
      steerX /= neighborCount;
      steerY /= neighborCount;
      steerZ /= neighborCount;
    }

    return [steerX, steerY, steerZ];
  }

  /**
   * 2. Alignment: Menyelaraskan arah dengan kawanan sejenis
   */
  private calculateAlignment(a: BoidAgent): [number, number, number] {
    const cfg = SPECIES_CONFIGS[a.species];
    let avgVx = 0, avgVy = 0, avgVz = 0;
    let count = 0;

    for (let i = 0; i < this.agents.length; i++) {
      const other = this.agents[i];
      if (other.id === a.id || other.clusterId !== a.clusterId) continue;

      const dx = a.position[0] - other.position[0];
      const dy = a.position[1] - other.position[1];
      const dz = a.position[2] - other.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < cfg.neighborRadius && other.state !== "pausing") {
        avgVx += other.velocity[0];
        avgVy += other.velocity[1];
        avgVz += other.velocity[2];
        count++;
      }
    }

    if (count > 0) {
      avgVx /= count;
      avgVy /= count;
      avgVz /= count;
      return [avgVx - a.velocity[0], avgVy - a.velocity[1], avgVz - a.velocity[2]];
    }

    return [0, 0, 0];
  }

  /**
   * 3. Cohesion: Menuju titik tengah kawanan
   */
  private calculateCohesion(a: BoidAgent): [number, number, number] {
    const cfg = SPECIES_CONFIGS[a.species];
    let centerX = 0, centerY = 0, centerZ = 0;
    let count = 0;

    for (let i = 0; i < this.agents.length; i++) {
      const other = this.agents[i];
      if (other.id === a.id || other.clusterId !== a.clusterId) continue;

      const dx = a.position[0] - other.position[0];
      const dy = a.position[1] - other.position[1];
      const dz = a.position[2] - other.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < cfg.neighborRadius) {
        centerX += other.position[0];
        centerY += other.position[1];
        centerZ += other.position[2];
        count++;
      }
    }

    if (count > 0) {
      centerX /= count;
      centerY /= count;
      centerZ /= count;
      return [centerX - a.position[0], centerY - a.position[1], centerZ - a.position[2]];
    }

    return [0, 0, 0];
  }

  /**
   * 4. GAYA KE-4: PENGHINDARAN RINTANGAN STATIS (Static Obstacle Avoidance)
   *
   * Untuk tiap ikan:
   * - Cek jarak ke obstacle terdekat dalam radius deteksi tertentu
   * - Jika masuk radius itu, tambahkan gaya dorong menjauh dari pusat obstacle
   * - Arah menjauhi obstacle, dibobot lebih kuat dari gaya boids lain
   */
  private calculateObstacleAvoidance(a: BoidAgent): [number, number, number] {
    const cfg = SPECIES_CONFIGS[a.species];
    let steerX = 0;
    let steerY = 0;
    let steerZ = 0;
    let hitCount = 0;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      // Vektor dari pusat rintangan ke ikan
      const dx = a.position[0] - obs.pos[0];
      // Pusat rintangan berada sedikit di atas pangkal batu karang
      const obsCenterY = obs.pos[1] + obs.height * 0.45;
      const dy = a.position[1] - obsCenterY;
      const dz = a.position[2] - obs.pos[2];

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const detectionDist = obs.radius + cfg.obstacleDetectionRadius;

      if (dist < detectionDist && dist > 0.001) {
        // Semakin dekat ikan ke rintangan, semakin kuat gaya dorongnya (kuadratik)
        const proximity = (detectionDist - dist) / detectionDist;
        const pushForce = proximity * proximity * 4.0;

        // Vektor satuan menjauhi obstacle
        const dirX = dx / dist;
        // Berikan sedikit bias ke atas agar ikan cenderung meluncur naik melompati karang
        const dirY = Math.max(dy / dist, 0.35);
        const dirZ = dz / dist;

        steerX += dirX * pushForce;
        steerY += dirY * pushForce;
        steerZ += dirZ * pushForce;
        hitCount++;
      }
    }

    if (hitCount > 0) {
      steerX /= hitCount;
      steerY /= hitCount;
      steerZ /= hitCount;
    }

    return [steerX, steerY, steerZ];
  }

  /**
   * 5. Gaya Proksimitas Dasar Laut (Terrain Proximity Force)
   * Memberikan gaya dorong halus ke atas saat ikan mendekati kontur pasir
   */
  private calculateTerrainProximityForce(a: BoidAgent): number {
    const cfg = SPECIES_CONFIGS[a.species];
    const yGround = getTerrainHeight(a.position[0], a.position[2]);
    const cushion = cfg.minTerrainClearance + 0.22;
    const distanceAboveGround = a.position[1] - yGround;

    if (distanceAboveGround < cushion) {
      const t = Math.max(0, (cushion - distanceAboveGround) / cushion);
      return t * t * 3.5;
    }

    return 0;
  }

  /**
   * 6. Wander Force: Gerakan jelajah acak yang halus
   */
  private calculateWander(a: BoidAgent, elapsed: number): [number, number, number] {
    a.wanderAngle += (Math.sin(elapsed * 1.4 + a.swayPhaseOffset) - 0.2) * 0.12;

    const forwardX = Math.sin(a.headingYaw);
    const forwardZ = Math.cos(a.headingYaw);

    const circleDist = 0.5;
    const circleRadius = 0.25;
    const cx = a.position[0] + forwardX * circleDist;
    const cz = a.position[2] + forwardZ * circleDist;

    const targetX = cx + Math.cos(a.wanderAngle) * circleRadius;
    const targetZ = cz + Math.sin(a.wanderAngle) * circleRadius;

    const bobY = Math.sin(elapsed * 2.0 * a.swayFreqMultiplier + a.swayPhaseOffset) * a.bobAmplitude;

    return [targetX - a.position[0], bobY, targetZ - a.position[2]];
  }

  /**
   * 7. Home Anchor: Menjaga ikan agar tidak menyimpang terlalu jauh dari karang asal
   */
  private calculateHomeAnchor(a: BoidAgent): [number, number, number] {
    const dx = a.homeAnchor[0] - a.position[0];
    const dy = a.homeAnchor[1] - a.position[1];
    const dz = a.homeAnchor[2] - a.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > a.anchorRadius) {
      const pull = (dist - a.anchorRadius) * 0.8;
      return [(dx / dist) * pull, dy * 0.5, (dz / dist) * pull];
    }

    return [0, 0, 0];
  }

  /**
   * 8. Boundary Avoidance: Menjaga ikan di dalam batas laut horizontal & atas
   */
  private calculateBoundaryAvoidance(a: BoidAgent): [number, number, number] {
    let steerX = 0, steerY = 0, steerZ = 0;

    // Batas ketinggian Y atas (permukaan air)
    if (a.position[1] > OCEAN_BOUNDS.maxY - 0.15) {
      steerY -= (a.position[1] - (OCEAN_BOUNDS.maxY - 0.15)) * 4.0;
    }

    // Batas radius horizontal luar
    const r = Math.sqrt(a.position[0] * a.position[0] + a.position[2] * a.position[2]);
    if (r > OCEAN_BOUNDS.maxRadius - 0.35) {
      const pushIn = (r - (OCEAN_BOUNDS.maxRadius - 0.35)) * 3.5;
      steerX -= (a.position[0] / r) * pushIn;
      steerZ -= (a.position[2] / r) * pushIn;
    }

    return [steerX, steerY, steerZ];
  }

  /**
   * Update State Machine & Countdown Timer untuk Tiap Ikan
   */
  private updateStateMachine(a: BoidAgent, dt: number) {
    a.stateTimer -= dt;
    if (a.stateTimer > 0) return;

    const cfg = SPECIES_CONFIGS[a.species];
    const rand = Math.random();

    let nextState: FishState = "wandering";

    if (a.state === "wandering") {
      const chances = cfg.transitionChances.fromWandering;
      if (rand < chances.pausing) {
        nextState = "pausing";
      } else {
        nextState = "darting";
      }
    } else if (a.state === "pausing") {
      const chances = cfg.transitionChances.fromPausing;
      if (rand < chances.wandering) {
        nextState = "wandering";
      } else {
        nextState = "darting";
      }
    } else if (a.state === "darting") {
      const chances = cfg.transitionChances.fromDarting;
      if (rand < chances.wandering) {
        nextState = "wandering";
      } else {
        nextState = "pausing";
      }
    }

    const durationRange = cfg.stateDurations[nextState];
    const nextDuration = durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]);

    a.state = nextState;
    a.stateTimer = nextDuration;

    if (nextState === "darting") {
      const spreadAngle = (Math.random() - 0.5) * 0.8;
      const dartAngle = a.headingYaw + spreadAngle;
      const dartY = (Math.random() - 0.5) * 0.25;
      a.dartDirection = [Math.sin(dartAngle), dartY, Math.cos(dartAngle)];
    }
  }
}
