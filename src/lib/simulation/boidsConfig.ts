/**
 * Konfigurasi Terpusat Sistem Boids Flocking, Variasi Per-Instance,
 * dan State Machine Satwa Laut.
 *
 * Semua parameter perilaku dapat di-tune dari satu tempat ini.
 */

export type FishState = "wandering" | "pausing" | "darting";

export type MarineSpecies = "manta" | "blue-angel" | "round-tang" | "school";

export interface SpeciesBoidsConfig {
  /** Jarak tetangga untuk perhitungan alignment & cohesion (meter) */
  neighborRadius: number;
  /** Jarak minimal pemisahan fisik (separation) antar ikan (meter) */
  desiredSeparation: number;
  /** Bobot gaya Separation (menjaga jarak antar ikan) */
  separationWeight: number;
  /** Bobot gaya Alignment (menyamakan arah/kecepatan) */
  alignmentWeight: number;
  /** Bobot gaya Cohesion (menuju titik tengah kelompok) */
  cohesionWeight: number;

  // ==========================================================================
  // GAYA KE-4: PENGHINDARAN RINTANGAN STATIS & DASAR LAUT (OBSTACLE AVOIDANCE)
  // ==========================================================================
  /** Bobot gaya penghindaran rintangan statis (karang, batu) - Prioritas tertinggi */
  obstacleAvoidanceWeight: number;
  /** Radius deteksi dini rintangan sebelum mendekati batas fisik (meter) */
  obstacleDetectionRadius: number;
  /** Bobot gaya dorong vertikal menjauh dari permukaan dasar laut */
  terrainAvoidanceWeight: number;
  /** Jarak minimal aman posisi Y ikan di atas permukaan terrain (meter) */
  minTerrainClearance: number;

  /** Bobot gaya jelajah acak (Wander force) */
  wanderWeight: number;
  /** Bobot gaya penahan batas laut (Containment / boundary avoidance) */
  boundaryWeight: number;

  /** Kecepatan maksimum per status gerak (meter per detik) */
  speeds: {
    wandering: number;
    pausing: number;
    darting: number;
  };

  /** Batas gaya kemudi maksimum per frame */
  maxForce: {
    wandering: number;
    pausing: number;
    darting: number;
  };

  /** Rentang durasi tiap state [minDetik, maxDetik] */
  stateDurations: {
    wandering: [number, number];
    pausing: [number, number];
    darting: [number, number];
  };

  /** Probabilitas transisi ke state berikutnya dari status saat ini */
  transitionChances: {
    fromWandering: { pausing: number; darting: number };
    fromPausing: { wandering: number; darting: number };
    fromDarting: { wandering: number; pausing: number };
  };

  /** Radius kerangka fisik tabrakan (meter) */
  collisionRadius: number;

  /** Skala visual dasar model 3D */
  baseScale: number;
}

/**
 * Batas Ruang Lingkungan Bawah Laut 3D
 */
export interface OceanBoundaryConfig {
  maxY: number;
  maxRadius: number;
}

export const OCEAN_BOUNDS: OceanBoundaryConfig = {
  maxY: 0.95,     // Di bawah permukaan air atas
  maxRadius: 4.2, // Batas tebing terumbu karang kejauhan
};

/**
 * Konfigurasi Spesifik per Spesies Ikan
 */
export const SPECIES_CONFIGS: Record<MarineSpecies, SpeciesBoidsConfig> = {
  // ==========================================================================
  // 1. KAWANAN IKAN KECIL (School Minnow Cluster) - Flocking Kuat & Padat
  // ==========================================================================
  school: {
    neighborRadius: 0.95,
    desiredSeparation: 0.22,
    separationWeight: 2.2,
    alignmentWeight: 1.5,
    cohesionWeight: 1.4,
    // Gaya ke-4 & Ketinggian Terrain
    obstacleAvoidanceWeight: 4.2,
    obstacleDetectionRadius: 0.45,
    terrainAvoidanceWeight: 3.6,
    minTerrainClearance: 0.14,
    wanderWeight: 0.45,
    boundaryWeight: 1.8,
    speeds: {
      wandering: 0.42,
      pausing: 0.06,
      darting: 1.15,
    },
    maxForce: {
      wandering: 0.65,
      pausing: 0.85,
      darting: 2.2,
    },
    stateDurations: {
      wandering: [3.5, 7.0],
      pausing: [1.2, 2.8],
      darting: [0.7, 1.4],
    },
    transitionChances: {
      fromWandering: { pausing: 0.4, darting: 0.6 },
      fromPausing: { wandering: 0.75, darting: 0.25 },
      fromDarting: { wandering: 0.7, pausing: 0.3 },
    },
    collisionRadius: 0.14,
    baseScale: 0.32,
  },

  // ==========================================================================
  // 2. IKAN BIDADARI BIRU (Blue Angelfish) - Flocking Anggun & Lebih Sering Pausing
  // ==========================================================================
  "blue-angel": {
    neighborRadius: 1.25,
    desiredSeparation: 0.28,
    separationWeight: 2.0,
    alignmentWeight: 1.1,
    cohesionWeight: 0.95,
    // Gaya ke-4 & Ketinggian Terrain
    obstacleAvoidanceWeight: 4.4,
    obstacleDetectionRadius: 0.52,
    terrainAvoidanceWeight: 3.8,
    minTerrainClearance: 0.18,
    wanderWeight: 0.55,
    boundaryWeight: 1.6,
    speeds: {
      wandering: 0.32,
      pausing: 0.04,
      darting: 0.90,
    },
    maxForce: {
      wandering: 0.50,
      pausing: 0.70,
      darting: 1.7,
    },
    stateDurations: {
      wandering: [4.0, 8.5],
      pausing: [2.0, 4.5], // Suka melayang tenang di sekitar karang
      darting: [0.6, 1.2],
    },
    transitionChances: {
      fromWandering: { pausing: 0.65, darting: 0.35 },
      fromPausing: { wandering: 0.85, darting: 0.15 },
      fromDarting: { wandering: 0.8, pausing: 0.2 },
    },
    collisionRadius: 0.16,
    baseScale: 0.30,
  },

  // ==========================================================================
  // 3. IKAN BULAT KUNING-CYAN (Round Tang) - Lincah, Suka Darting & Mematuk
  // ==========================================================================
  "round-tang": {
    neighborRadius: 0.85,
    desiredSeparation: 0.24,
    separationWeight: 2.1,
    alignmentWeight: 1.2,
    cohesionWeight: 1.0,
    // Gaya ke-4 & Ketinggian Terrain
    obstacleAvoidanceWeight: 4.5,
    obstacleDetectionRadius: 0.48,
    terrainAvoidanceWeight: 3.6,
    minTerrainClearance: 0.16,
    wanderWeight: 0.60,
    boundaryWeight: 1.7,
    speeds: {
      wandering: 0.36,
      pausing: 0.05,
      darting: 1.05,
    },
    maxForce: {
      wandering: 0.60,
      pausing: 0.80,
      darting: 2.0,
    },
    stateDurations: {
      wandering: [3.0, 6.0],
      pausing: [1.0, 2.5],
      darting: [0.8, 1.8],
    },
    transitionChances: {
      fromWandering: { pausing: 0.35, darting: 0.65 },
      fromPausing: { wandering: 0.6, darting: 0.4 },
      fromDarting: { wandering: 0.65, pausing: 0.35 },
    },
    collisionRadius: 0.13,
    baseScale: 0.25,
  },

  // ==========================================================================
  // 4. PARI MANTA RAKSASA (Hero Manta) - Solo/Pair Wide Gliders, Sangat Anggun
  // ==========================================================================
  manta: {
    neighborRadius: 2.8,
    desiredSeparation: 0.65,
    separationWeight: 2.5,
    alignmentWeight: 0.8,
    cohesionWeight: 0.6,
    // Gaya ke-4 & Ketinggian Terrain
    obstacleAvoidanceWeight: 5.0,
    obstacleDetectionRadius: 0.90,
    terrainAvoidanceWeight: 4.2,
    minTerrainClearance: 0.30,
    wanderWeight: 0.40,
    boundaryWeight: 2.0,
    speeds: {
      wandering: 0.45,
      pausing: 0.15,
      darting: 0.85,
    },
    maxForce: {
      wandering: 0.35,
      pausing: 0.45,
      darting: 0.95,
    },
    stateDurations: {
      wandering: [6.0, 12.0],
      pausing: [2.5, 5.0],
      darting: [1.5, 3.0],
    },
    transitionChances: {
      fromWandering: { pausing: 0.45, darting: 0.55 },
      fromPausing: { wandering: 0.8, darting: 0.2 },
      fromDarting: { wandering: 0.85, pausing: 0.15 },
    },
    collisionRadius: 0.32,
    baseScale: 0.60,
  },
};
