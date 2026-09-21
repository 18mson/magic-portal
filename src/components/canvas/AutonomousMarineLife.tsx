"use client";

import { Vector3 } from "three";
import { useGLTF } from "@react-three/drei";
import { AnimatedFish, FishModelConfig } from "./AnimatedFish";

// ============================================================================
// KELUARGA IKAN BADUT KLASIK (Rumpun Anemon Kiri: X = -0.60, Z = -0.95)
// Ukuran diperkecil realistis (3.8cm - 9cm), bersarang & bermain di dalam anemon
// ============================================================================

export const CLOWNFISH_CLASSIC_ALPHA_CONFIG: FishModelConfig = {
  id: "clownfish-classic-alpha",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.52, // Induk Utama (~9cm panjang)
  initialPosition: [-0.60, -0.42, -0.95], // Bersarang di dalam rumbai anemon (dasar karang Y = -0.56)
  initialHeading: -Math.PI * 0.35,
  collisionRadius: 0.05,
  feedingDepthRange: [-0.55, -0.24],
  baseCruisingSpeed: 0.16,
  maxSprintSpeed: 0.38,
  turnSpeed: 7.2,
  biteDistance: 0.07,
  detectionRadius: 0.55,
  pauseDurationMin: 2.5,
  pauseDurationMax: 5.5,
  swimDurationMin: 4.0,
  swimDurationMax: 8.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -0.76,
    maxX: -0.44,
    minY: -0.52, // Sangat rendah di dekat dasar tentakel karang
    maxY: -0.26, // Tidak melayang ke atas, tetap di mahkota anemon
    minZ: -1.10,
    maxZ: -0.80,
  },
  pointsOfInterest: [
    new Vector3(-0.60, -0.42, -0.95), // Masuk ke dalam pusat rumbai anemon
    new Vector3(-0.55, -0.38, -0.92), // Menyibak tentakel depan
    new Vector3(-0.65, -0.40, -0.98), // Meliuk di tentakel belakang
    new Vector3(-0.58, -0.30, -0.94), // Mengapung di atas mahkota anemon
  ],
  roughness: 0.32,
  metalness: 0.05,
};

export const CLOWNFISH_CLASSIC_BETA_CONFIG: FishModelConfig = {
  id: "clownfish-classic-beta",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.42, // Pasangan Sedang (~7cm panjang)
  initialPosition: [-0.56, -0.40, -0.92],
  initialHeading: Math.PI * 0.50,
  collisionRadius: 0.04,
  feedingDepthRange: [-0.55, -0.24],
  baseCruisingSpeed: 0.17,
  maxSprintSpeed: 0.39,
  turnSpeed: 7.6,
  biteDistance: 0.06,
  detectionRadius: 0.50,
  pauseDurationMin: 2.2,
  pauseDurationMax: 5.0,
  swimDurationMin: 3.5,
  swimDurationMax: 7.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -0.74,
    maxX: -0.46,
    minY: -0.52,
    maxY: -0.28,
    minZ: -1.08,
    maxZ: -0.82,
  },
  pointsOfInterest: [
    new Vector3(-0.58, -0.44, -0.94),
    new Vector3(-0.62, -0.40, -0.96),
    new Vector3(-0.54, -0.34, -0.90),
    new Vector3(-0.60, -0.45, -0.95),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

export const CLOWNFISH_CLASSIC_JUNIOR_CONFIG: FishModelConfig = {
  id: "clownfish-classic-junior",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.28, // Anak Mungil (~5cm panjang)
  initialPosition: [-0.62, -0.44, -0.96],
  initialHeading: -Math.PI * 0.80,
  collisionRadius: 0.03,
  feedingDepthRange: [-0.55, -0.28],
  baseCruisingSpeed: 0.14,
  maxSprintSpeed: 0.35,
  turnSpeed: 8.5,
  biteDistance: 0.05,
  detectionRadius: 0.40,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.5,
  swimDurationMin: 3.0,
  swimDurationMax: 6.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -0.70,
    maxX: -0.50,
    minY: -0.53,
    maxY: -0.32,
    minZ: -1.04,
    maxZ: -0.86,
  },
  pointsOfInterest: [
    new Vector3(-0.60, -0.46, -0.95), // Suka bersembunyi di dalam rumbai
    new Vector3(-0.61, -0.43, -0.93),
    new Vector3(-0.59, -0.45, -0.97),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

export const CLOWNFISH_CLASSIC_TINY_CONFIG: FishModelConfig = {
  id: "clownfish-classic-tiny",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.22, // Bayi Super Mungil (~3.8cm panjang)
  initialPosition: [-0.59, -0.46, -0.94],
  initialHeading: Math.PI * 0.20,
  collisionRadius: 0.025,
  feedingDepthRange: [-0.55, -0.32],
  baseCruisingSpeed: 0.12,
  maxSprintSpeed: 0.30,
  turnSpeed: 9.0,
  biteDistance: 0.04,
  detectionRadius: 0.35,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.0,
  swimDurationMin: 2.5,
  swimDurationMax: 5.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -0.68,
    maxX: -0.52,
    minY: -0.54,
    maxY: -0.36,
    minZ: -1.02,
    maxZ: -0.88,
  },
  pointsOfInterest: [
    new Vector3(-0.60, -0.47, -0.95),
    new Vector3(-0.58, -0.45, -0.94),
    new Vector3(-0.62, -0.46, -0.96),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// ============================================================================
// KELUARGA IKAN BADUT PASTEL (Rumpun Anemon Kanan: X = 0.60, Z = -0.95)
// Ukuran diperkecil realistis (3.8cm - 8.8cm), bersarang & bermain di dalam anemon
// ============================================================================

export const CLOWNFISH_PASTEL_ALPHA_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-alpha",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.50, // Induk Utama (~8.8cm panjang)
  initialPosition: [0.60, -0.41, -0.95], // Bersarang di dalam rumbai anemon kanan (dasar karang Y = -0.55)
  initialHeading: Math.PI * 0.70,
  collisionRadius: 0.05,
  feedingDepthRange: [-0.54, -0.23],
  baseCruisingSpeed: 0.16,
  maxSprintSpeed: 0.38,
  turnSpeed: 7.2,
  biteDistance: 0.07,
  detectionRadius: 0.55,
  pauseDurationMin: 2.5,
  pauseDurationMax: 5.5,
  swimDurationMin: 4.0,
  swimDurationMax: 8.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.44,
    maxX: 0.76,
    minY: -0.51,
    maxY: -0.25,
    minZ: -1.10,
    maxZ: -0.80,
  },
  pointsOfInterest: [
    new Vector3(0.60, -0.41, -0.95), // Masuk ke dalam pusat rumbai anemon
    new Vector3(0.55, -0.37, -0.92),
    new Vector3(0.65, -0.39, -0.98),
    new Vector3(0.58, -0.29, -0.94),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

export const CLOWNFISH_PASTEL_BETA_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-beta",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.40, // Pasangan Sedang (~7cm panjang)
  initialPosition: [0.56, -0.39, -0.92],
  initialHeading: -Math.PI * 0.40,
  collisionRadius: 0.04,
  feedingDepthRange: [-0.54, -0.23],
  baseCruisingSpeed: 0.17,
  maxSprintSpeed: 0.39,
  turnSpeed: 7.6,
  biteDistance: 0.06,
  detectionRadius: 0.50,
  pauseDurationMin: 2.2,
  pauseDurationMax: 5.0,
  swimDurationMin: 3.5,
  swimDurationMax: 7.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.46,
    maxX: 0.74,
    minY: -0.51,
    maxY: -0.27,
    minZ: -1.08,
    maxZ: -0.82,
  },
  pointsOfInterest: [
    new Vector3(0.58, -0.43, -0.94),
    new Vector3(0.62, -0.39, -0.96),
    new Vector3(0.54, -0.33, -0.90),
    new Vector3(0.60, -0.44, -0.95),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

export const CLOWNFISH_PASTEL_JUNIOR_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-junior",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.27, // Anak Mungil (~4.8cm panjang)
  initialPosition: [0.62, -0.43, -0.96],
  initialHeading: Math.PI * 0.85,
  collisionRadius: 0.03,
  feedingDepthRange: [-0.54, -0.27],
  baseCruisingSpeed: 0.14,
  maxSprintSpeed: 0.35,
  turnSpeed: 8.5,
  biteDistance: 0.05,
  detectionRadius: 0.40,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.5,
  swimDurationMin: 3.0,
  swimDurationMax: 6.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.50,
    maxX: 0.70,
    minY: -0.52,
    maxY: -0.31,
    minZ: -1.04,
    maxZ: -0.86,
  },
  pointsOfInterest: [
    new Vector3(0.60, -0.45, -0.95), // Suka bersembunyi di dalam rumbai
    new Vector3(0.61, -0.42, -0.93),
    new Vector3(0.59, -0.44, -0.97),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

export const CLOWNFISH_PASTEL_TINY_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-tiny",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.22, // Bayi Super Mungil (~3.8cm panjang)
  initialPosition: [0.59, -0.45, -0.94],
  initialHeading: -Math.PI * 0.25,
  collisionRadius: 0.025,
  feedingDepthRange: [-0.54, -0.31],
  baseCruisingSpeed: 0.12,
  maxSprintSpeed: 0.30,
  turnSpeed: 9.0,
  biteDistance: 0.04,
  detectionRadius: 0.35,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.0,
  swimDurationMin: 2.5,
  swimDurationMax: 5.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.52,
    maxX: 0.68,
    minY: -0.53,
    maxY: -0.35,
    minZ: -1.02,
    maxZ: -0.88,
  },
  pointsOfInterest: [
    new Vector3(0.60, -0.46, -0.95),
    new Vector3(0.58, -0.44, -0.94),
    new Vector3(0.62, -0.45, -0.96),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// Aliases kompatibilitas
export const CLOWNFISH_CLASSIC_CONFIG = CLOWNFISH_CLASSIC_ALPHA_CONFIG;
export const CLOWNFISH_PASTEL_CONFIG = CLOWNFISH_PASTEL_ALPHA_CONFIG;

/**
 * 3. Ikan Nila (Tilapia)
 * Habitat: Zona batu karang tengah belakang & celah gua.
 * Karakter: Penjelajah celah batu yang aktif di kedalaman sedang.
 */
export const NILA_FISH_CONFIG: FishModelConfig = {
  id: "nila-fish",
  species: "Nila Fish",
  modelPath: "/models/nila_ikan.glb",
  visualScale: 0.052, // 6.97m * 0.052 = ~0.36m
  modelRotation: [0, -Math.PI / 2, 0], // Putar -90° Y agar kepala menghadap maju ke +Z (bebas bug mundur)
  initialPosition: [0.05, 0.02, -1.35], // Celah batu tengah belakang
  initialHeading: Math.PI * 0.15,
  collisionRadius: 0.16,
  feedingDepthRange: [-0.10, 0.16],
  baseCruisingSpeed: 0.20,
  maxSprintSpeed: 0.46,
  turnSpeed: 5.8,
  biteDistance: 0.16,
  detectionRadius: 1.40,
  pauseDurationMin: 1.8,
  pauseDurationMax: 4.0,
  swimDurationMin: 6.0,
  swimDurationMax: 11.0,
  clipNames: {
    swim: "metarig|Berenang Santai",
  },
  bounds: {
    minX: -0.65,
    maxX: 0.65,
    minY: -0.08,
    maxY: 0.14,
    minZ: -1.65,
    maxZ: -1.05,
  },
  pointsOfInterest: [
    new Vector3(0.0, 0.04, -1.30),
    new Vector3(-0.35, -0.02, -1.45),
    new Vector3(0.40, 0.02, -1.25),
    new Vector3(-0.15, 0.08, -1.15),
  ],
  roughness: 0.38,
  metalness: 0.08,
};

/**
 * 4. Ikan Pari (Stingray)
 * Habitat: Seluruh kolom air samudra (Vertikalitas Penuh: Melayang tinggi di angkasa air hingga menukik ke lantai pasir).
 * Karakter: Diperbesar megah, bentang sayap lebar, berenang naik-turun dan berkeliling luas.
 */
export const STINGRAY_CONFIG: FishModelConfig = {
  id: "stingray",
  species: "Stingray",
  modelPath: "/models/stingray_-_animated_low_poly.glb",
  visualScale: 0.52, // Diperbesar megah (~1.04m panjang, ~0.45m rentang sayap)
  modelOffset: [0, 0, 0.22],
  initialPosition: [0.30, 0.72, -1.30], // Mulai melayang tinggi di atas
  initialHeading: -Math.PI * 0.45,
  collisionRadius: 0.35,
  feedingDepthRange: [-0.20, 0.95], // Menyantap pakan di semua ketinggian (atas maupun dasar)
  baseCruisingSpeed: 0.20, // Meluncur tenang dan gagah berkeliling luas
  maxSprintSpeed: 0.42,
  turnSpeed: 3.2, // Belokan sapuan lebar yang megah
  biteDistance: 0.24,
  detectionRadius: 2.20,
  pauseDurationMin: 2.5,
  pauseDurationMax: 5.5,
  swimDurationMin: 9.0,
  swimDurationMax: 16.0,
  clipNames: {
    swim: "Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Stingray_swim",
  },
  bounds: {
    minX: -2.40,
    maxX: 2.40,
    minY: -0.15, // Mampu menukik sampai menyentuh lantai pasir dasar laut
    maxY: 0.85,  // Mampu melambung tinggi jauh di atas terumbu karang
    minZ: -2.60,
    maxZ: -0.65,
  },
  pointsOfInterest: [
    // Lapisan tinggi (sky / high canopy)
    new Vector3(-1.40, 0.75, -1.40),
    new Vector3(1.40, 0.75, -1.40),
    new Vector3(0.0, 0.82, -1.00),
    // Lapisan dasar laut (benthic sand floor)
    new Vector3(-0.80, -0.13, -1.25),
    new Vector3(0.80, -0.13, -1.65),
    new Vector3(0.0, -0.14, -2.10),
    // Lapisan tengah meliuk (mid-depth diagonal swoops)
    new Vector3(-1.60, 0.35, -1.90),
    new Vector3(1.50, 0.35, -0.95),
  ],
  roughness: 0.42,
  metalness: 0.02,
};

/**
 * 5. Lumba-Lumba (Dolphin)
 * Habitat: Perairan samudra bebas dengan vertikalitas dinamis (Menukik dalam ke karang & melambung ke permukaan).
 * Karakter: Sangat gesit, akrobatik, meliuk melintasi seluruh sudut akuarium.
 */
export const DOLPHIN_CONFIG: FishModelConfig = {
  id: "dolphin",
  species: "Dolphin",
  modelPath: "/models/dolphin_-_animated_low_poly.glb",
  visualScale: 0.26, // ~0.52m panjang
  initialPosition: [-0.90, 0.65, -1.15],
  initialHeading: Math.PI * 0.80,
  collisionRadius: 0.24,
  feedingDepthRange: [-0.15, 0.95], // Memburu pakan di lapisan atas maupun bawah
  baseCruisingSpeed: 0.28,
  maxSprintSpeed: 0.65,
  turnSpeed: 5.8,
  biteDistance: 0.20,
  detectionRadius: 2.40,
  pauseDurationMin: 1.2,
  pauseDurationMax: 3.0,
  swimDurationMin: 7.0,
  swimDurationMax: 14.0,
  clipNames: {
    swim: "Dolphin_Rig|Dolphin_Rig|move",
  },
  bounds: {
    minX: -2.50,
    maxX: 2.50,
    minY: -0.12, // Menukik mendekati dasar terumbu karang
    maxY: 0.88,  // Melambung tinggi ke puncak permukaan air
    minZ: -2.70,
    maxZ: -0.60,
  },
  pointsOfInterest: [
    // Puncak permukaan air (surface dash)
    new Vector3(0.0, 0.85, -0.80),
    new Vector3(-1.60, 0.80, -1.30),
    new Vector3(1.60, 0.80, -1.30),
    // Jalur tengah akrobatik (mid acrobatic arcs)
    new Vector3(-0.90, 0.40, -1.90),
    new Vector3(0.90, 0.45, -1.10),
    // Menukik ke dasar karang (deep seabed dive)
    new Vector3(0.0, -0.10, -1.60),
    new Vector3(-1.10, -0.12, -1.20),
    new Vector3(1.10, -0.12, -1.70),
  ],
  roughness: 0.25,
  metalness: 0.12,
};

/**
 * 6. Hiu Karang (Reef Shark)
 * Habitat: Perimeter luar laut lepas sisi kiri & dalam (Perairan luas dari langit air hingga palung dasar).
 * Karakter: Predator anggun, berpatroli dari puncak atas lalu menukik menyapu dasar karang.
 */
export const SHARK_CONFIG: FishModelConfig = {
  id: "reef-shark",
  species: "Reef Shark",
  modelPath: "/models/shark_-_animated_low_poly.glb",
  visualScale: 0.115, // ~0.58m panjang, sirip dada ~0.31m
  initialPosition: [-1.40, 0.60, -1.90],
  initialHeading: -Math.PI * 0.70,
  collisionRadius: 0.28,
  feedingDepthRange: [-0.15, 0.92],
  baseCruisingSpeed: 0.24,
  maxSprintSpeed: 0.54,
  turnSpeed: 3.8,
  biteDistance: 0.22,
  detectionRadius: 2.20,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 8.5,
  swimDurationMax: 16.0,
  clipNames: {
    swim: "Shark_Rig|Shark_Rig|shark_swim",
  },
  bounds: {
    minX: -2.60,
    maxX: 0.80,
    minY: -0.12, // Menukik mengintai dasar laut
    maxY: 0.80,  // Berpatroli di ketinggian atas perairan terbuka
    minZ: -2.80,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    // Patroli atas (high ocean patrol)
    new Vector3(-1.80, 0.75, -2.10),
    new Vector3(-0.30, 0.72, -1.30),
    // Jelajah tengah (mid reef cruising)
    new Vector3(-1.40, 0.30, -1.60),
    new Vector3(0.40, 0.25, -1.20),
    // Mengintai dasar (deep floor prowl)
    new Vector3(-1.60, -0.11, -1.90),
    new Vector3(-0.60, -0.12, -1.40),
    // Horizon kejauhan (far deep horizon)
    new Vector3(-2.30, 0.50, -2.50),
  ],
  roughness: 0.30,
  metalness: 0.08,
};

/**
 * 7. Paus Pembunuh (Orca)
 * Habitat: Samudra dalam sisi kanan hingga kejauhan (Meluncur megah dari langit air hingga palung pasir).
 * Karakter: Megah dan gagah, menjelajah radius laut yang sangat luas dan dalam.
 */
export const ORCA_CONFIG: FishModelConfig = {
  id: "orca",
  species: "Orca",
  modelPath: "/models/orca_-_animated_low_poly.glb",
  visualScale: 0.24, // ~0.58m panjang, sirip punggung ~0.54m
  initialPosition: [1.40, 0.65, -2.10],
  initialHeading: Math.PI * 0.30,
  collisionRadius: 0.28,
  feedingDepthRange: [-0.15, 0.95],
  baseCruisingSpeed: 0.23,
  maxSprintSpeed: 0.50,
  turnSpeed: 3.5,
  biteDistance: 0.24,
  detectionRadius: 2.20,
  pauseDurationMin: 2.2,
  pauseDurationMax: 4.8,
  swimDurationMin: 8.0,
  swimDurationMax: 15.0,
  clipNames: {
    swim: "Orca_Rig|Orca_Rig|swim",
    idle: "Orca_Rig|Orca_Rig|idle",
  },
  bounds: {
    minX: -0.60,
    maxX: 2.70,
    minY: -0.12, // Menyelam dalam ke dasar samudra
    maxY: 0.85,  // Meluncur anggun di lapisan atas
    minZ: -2.90,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    // Lapisan atas samudra (high ocean cruising)
    new Vector3(1.70, 0.80, -2.10),
    new Vector3(0.30, 0.72, -1.40),
    // Lintasan tengah laut lepas (mid oceanic transit)
    new Vector3(1.30, 0.35, -1.60),
    new Vector3(2.10, 0.48, -2.40),
    // Menyelam ke dasar laut (deep seabed floor dive)
    new Vector3(1.50, -0.11, -2.00),
    new Vector3(0.40, -0.12, -1.50),
    // Horizon kejauhan (far horizon ocean sweep)
    new Vector3(2.40, 0.65, -2.70),
  ],
  roughness: 0.28,
  metalness: 0.10,
};

// Preload semua model GLTF ke memori browser untuk performa mulus
useGLTF.preload(CLOWNFISH_CLASSIC_CONFIG.modelPath);
useGLTF.preload(CLOWNFISH_PASTEL_CONFIG.modelPath);
useGLTF.preload(NILA_FISH_CONFIG.modelPath);
useGLTF.preload(STINGRAY_CONFIG.modelPath);
useGLTF.preload(DOLPHIN_CONFIG.modelPath);
useGLTF.preload(SHARK_CONFIG.modelPath);
useGLTF.preload(ORCA_CONFIG.modelPath);

/**
 * Komponen Ekosistem Satwa Laut Lengkap Akuarium AR:
 * - Anti-Collision / Boid Separation System: Ikan saling menghindar otomatis tanpa tabrakan.
 * - Distributed Spawns & Strata: Tiap spesies memiliki zona jelajah dan kedalaman alami masing-masing.
 * - Variasi Pola Makan (Feeding Habits):
 *   - Lumba-lumba: pemakan permukaan (surface feeder).
 *   - Ikan Pari: pemakan dasar laut (benthic feeder).
 *   - Ikan Badut: teritorial karang.
 *   - Hiu & Orca: patroli laut dalam.
 * - Anti-Clustering Feeding: Mencegah ikan beramai-ramai menumpuk ke satu titik pakan yang sama.
 */
export function AutonomousMarineLife() {
  return (
    <group>
      {/* 1. Keluarga Ikan Badut Klasik (Rumpun Anemon Kiri: Alpha, Beta, Junior, Tiny) */}
      <AnimatedFish config={CLOWNFISH_CLASSIC_ALPHA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_CLASSIC_BETA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_CLASSIC_JUNIOR_CONFIG} />
      <AnimatedFish config={CLOWNFISH_CLASSIC_TINY_CONFIG} />

      {/* 2. Keluarga Ikan Badut Pastel (Rumpun Anemon Kanan: Alpha, Beta, Junior, Tiny) */}
      <AnimatedFish config={CLOWNFISH_PASTEL_ALPHA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_PASTEL_BETA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_PASTEL_JUNIOR_CONFIG} />
      <AnimatedFish config={CLOWNFISH_PASTEL_TINY_CONFIG} />

      {/* 3. Ikan Nila (Celah Karang Tengah) */}
      <AnimatedFish config={NILA_FISH_CONFIG} />

      {/* 4. Ikan Pari (Dasar Lantai Pasir) */}
      <AnimatedFish config={STINGRAY_CONFIG} />

      {/* 5. Lumba-Lumba (Kolom Air Atas) */}
      <AnimatedFish config={DOLPHIN_CONFIG} />

      {/* 6. Hiu Karang (Perimeter Laut Kiri Belakang) */}
      <AnimatedFish config={SHARK_CONFIG} />

      {/* 7. Paus Pembunuh (Perimeter Laut Kanan Belakang) */}
      <AnimatedFish config={ORCA_CONFIG} />
    </group>
  );
}
