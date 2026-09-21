"use client";

import { useSyncExternalStore } from "react";
import { Vector3 } from "three";
import { useGLTF } from "@react-three/drei";
import { AnimatedFish, FishModelConfig } from "./AnimatedFish";

// ============================================================================
// KELUARGA IKAN BADUT KLASIK (Rumpun Anemon Kiri: X = -0.60, Z = -0.95)
// Ukuran diperkecil realistis (3.8cm - 9cm), bersarang & bermain di dalam anemon
// ============================================================================

// ============================================================================
// KELUARGA IKAN BADUT KLASIK (Sisi Karang Kiri: 8 Ekor dengan Peran Beragam)
// ============================================================================

// 1. Induk Utama Kiri (Dominant Alpha) - Menjaga Sarang Anemon Kiri
export const CLOWNFISH_CLASSIC_ALPHA_CONFIG: FishModelConfig = {
  id: "clownfish-classic-alpha",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.52, // ~9cm panjang
  initialPosition: [-0.60, -0.42, -0.95],
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
    minX: -0.95,
    maxX: -0.35,
    minY: -0.52,
    maxY: -0.15,
    minZ: -1.30,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    new Vector3(-0.60, -0.42, -0.95),
    new Vector3(-0.48, -0.35, -0.85),
    new Vector3(-0.75, -0.38, -1.05),
    new Vector3(-0.55, -0.22, -0.90),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 2. Pasangan Kiri (Beta Partner) - Menjelajah Gugusan Karang Barat Tengah
export const CLOWNFISH_CLASSIC_BETA_CONFIG: FishModelConfig = {
  id: "clownfish-classic-beta",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.42, // ~7cm panjang
  initialPosition: [-1.45, -0.35, -1.35],
  initialHeading: Math.PI * 0.40,
  collisionRadius: 0.04,
  feedingDepthRange: [-0.52, -0.20],
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
    minX: -1.90,
    maxX: -1.00,
    minY: -0.50,
    maxY: -0.15,
    minZ: -1.75,
    maxZ: -1.00,
  },
  pointsOfInterest: [
    new Vector3(-1.45, -0.35, -1.35),
    new Vector3(-1.65, -0.38, -1.50),
    new Vector3(-1.25, -0.28, -1.15),
    new Vector3(-1.10, -0.32, -1.40),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 3. Anakan Lincah Kiri (Playful Junior) - Berkeliling Karang Luar Barat Laut
export const CLOWNFISH_CLASSIC_JUNIOR_CONFIG: FishModelConfig = {
  id: "clownfish-classic-junior",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.28, // ~5cm panjang
  initialPosition: [-1.20, -0.30, -1.70],
  initialHeading: -Math.PI * 0.60,
  collisionRadius: 0.03,
  feedingDepthRange: [-0.50, -0.20],
  baseCruisingSpeed: 0.15,
  maxSprintSpeed: 0.36,
  turnSpeed: 8.5,
  biteDistance: 0.05,
  detectionRadius: 0.40,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.5,
  swimDurationMin: 3.0,
  swimDurationMax: 6.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -1.70,
    maxX: -0.75,
    minY: -0.48,
    maxY: -0.10,
    minZ: -2.15,
    maxZ: -1.30,
  },
  pointsOfInterest: [
    new Vector3(-1.20, -0.30, -1.70),
    new Vector3(-1.45, -0.25, -1.90),
    new Vector3(-0.90, -0.32, -1.50),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 4. Bayi Mungil Kiri (Tiny Baby) - Berlindung di Celah Karang Kipas Tengah
export const CLOWNFISH_CLASSIC_TINY_CONFIG: FishModelConfig = {
  id: "clownfish-classic-tiny",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.22, // ~3.8cm panjang
  initialPosition: [-0.25, -0.38, -1.25],
  initialHeading: Math.PI * 0.20,
  collisionRadius: 0.025,
  feedingDepthRange: [-0.50, -0.25],
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
    minX: -0.55,
    maxX: 0.05,
    minY: -0.50,
    maxY: -0.22,
    minZ: -1.55,
    maxZ: -1.00,
  },
  pointsOfInterest: [
    new Vector3(-0.25, -0.38, -1.25),
    new Vector3(-0.15, -0.35, -1.35),
    new Vector3(-0.38, -0.40, -1.15),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 5. Perenang Tinggi Kiri (High Canopy Swimmer) - Melambung tinggi di zona cahaya matahari barat
export const CLOWNFISH_CLASSIC_HIGH_CONFIG: FishModelConfig = {
  id: "clownfish-classic-high",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.46, // ~8cm panjang
  initialPosition: [-0.95, 0.20, -1.10],
  initialHeading: Math.PI * 0.60,
  collisionRadius: 0.05,
  feedingDepthRange: [-0.15, 0.50],
  baseCruisingSpeed: 0.22,
  maxSprintSpeed: 0.45,
  turnSpeed: 6.8,
  biteDistance: 0.08,
  detectionRadius: 0.85,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 5.0,
  swimDurationMax: 9.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -1.85,
    maxX: -0.20,
    minY: -0.15,
    maxY: 0.50, // Melambung tinggi di air terang bersorot cahaya
    minZ: -1.90,
    maxZ: -0.65,
  },
  pointsOfInterest: [
    new Vector3(-0.95, 0.25, -1.10),
    new Vector3(-1.50, 0.35, -1.40),
    new Vector3(-0.40, 0.18, -0.85),
    new Vector3(-1.20, 0.40, -1.60),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 6. Penjelajah Dasar Pasir (Seabed Sand Skimmer) - Menyusuri lantai pasir dari barat ke tengah
export const CLOWNFISH_CLASSIC_BOTTOM_CONFIG: FishModelConfig = {
  id: "clownfish-classic-bottom",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.38, // ~6.5cm
  initialPosition: [-0.85, -0.52, -1.10],
  initialHeading: -Math.PI * 0.40,
  collisionRadius: 0.04,
  feedingDepthRange: [-0.56, -0.42],
  baseCruisingSpeed: 0.14,
  maxSprintSpeed: 0.34,
  turnSpeed: 8.0,
  biteDistance: 0.05,
  detectionRadius: 0.45,
  pauseDurationMin: 2.5,
  pauseDurationMax: 6.0,
  swimDurationMin: 3.0,
  swimDurationMax: 7.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -1.60,
    maxX: -0.20,
    minY: -0.55,
    maxY: -0.42,
    minZ: -1.65,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    new Vector3(-0.85, -0.52, -1.10),
    new Vector3(-1.30, -0.53, -1.35),
    new Vector3(-0.45, -0.51, -0.90),
    new Vector3(-0.30, -0.52, -1.20),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 7. Pengembara Luar Anemon (Reef Roamer / Scout) - Menjelajah karang terbuka barat laut luas
export const CLOWNFISH_CLASSIC_ROAMER_CONFIG: FishModelConfig = {
  id: "clownfish-classic-roamer",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.48, // ~8.2cm
  initialPosition: [-0.80, -0.20, -1.80],
  initialHeading: Math.PI * 0.25,
  collisionRadius: 0.05,
  feedingDepthRange: [-0.48, 0.25],
  baseCruisingSpeed: 0.21,
  maxSprintSpeed: 0.46,
  turnSpeed: 5.5,
  biteDistance: 0.08,
  detectionRadius: 1.10,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 6.0,
  swimDurationMax: 12.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -3.20,
    maxX: 0.40,
    minY: -0.48,
    maxY: 0.30,
    minZ: -3.60,
    maxZ: -0.60,
  },
  pointsOfInterest: [
    new Vector3(-0.80, -0.20, -1.80),
    new Vector3(-2.20, -0.15, -2.40),
    new Vector3(-1.50, 0.10, -1.30),
    new Vector3(-0.30, -0.25, -1.50),
    new Vector3(-2.60, -0.30, -1.80),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// 8. Spesialis Nuzzle (Deep Anemone Snuggler) - Selalu di dalam rumbai anemon kiri
export const CLOWNFISH_CLASSIC_NUZZLER_CONFIG: FishModelConfig = {
  id: "clownfish-classic-nuzzler",
  species: "Clownfish Classic",
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 0.32, // ~5.5cm
  initialPosition: [-0.60, -0.45, -0.95],
  initialHeading: -Math.PI * 0.10,
  collisionRadius: 0.03,
  feedingDepthRange: [-0.52, -0.36],
  baseCruisingSpeed: 0.11,
  maxSprintSpeed: 0.28,
  turnSpeed: 8.5,
  biteDistance: 0.04,
  detectionRadius: 0.32,
  pauseDurationMin: 3.5,
  pauseDurationMax: 7.5,
  swimDurationMin: 2.0,
  swimDurationMax: 4.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -0.75,
    maxX: -0.45,
    minY: -0.50,
    maxY: -0.35,
    minZ: -1.08,
    maxZ: -0.82,
  },
  pointsOfInterest: [
    new Vector3(-0.60, -0.45, -0.95),
    new Vector3(-0.58, -0.43, -0.94),
    new Vector3(-0.62, -0.44, -0.96),
  ],
  roughness: 0.32,
  metalness: 0.05,
};

// ============================================================================
// KELUARGA IKAN BADUT PASTEL (Sisi Karang Kanan: 8 Ekor Menyebar di Berbagai Terumbu)
// ============================================================================

// 9. Induk Utama Kanan (Dominant Alpha) - Menjaga Sarang Anemon Kanan
export const CLOWNFISH_PASTEL_ALPHA_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-alpha",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.50, // ~8.8cm
  initialPosition: [0.60, -0.41, -0.95],
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
    minX: 0.35,
    maxX: 0.95,
    minY: -0.52,
    maxY: -0.15,
    minZ: -1.30,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    new Vector3(0.60, -0.41, -0.95),
    new Vector3(0.48, -0.35, -0.85),
    new Vector3(0.75, -0.38, -1.05),
    new Vector3(0.55, -0.22, -0.90),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 10. Pasangan Kanan (Beta Partner) - Menjelajah Gugusan Karang Timur Tengah
export const CLOWNFISH_PASTEL_BETA_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-beta",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.40, // ~7cm
  initialPosition: [1.45, -0.35, -1.35],
  initialHeading: -Math.PI * 0.40,
  collisionRadius: 0.04,
  feedingDepthRange: [-0.52, -0.20],
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
    minX: 1.00,
    maxX: 1.90,
    minY: -0.50,
    maxY: -0.15,
    minZ: -1.75,
    maxZ: -1.00,
  },
  pointsOfInterest: [
    new Vector3(1.45, -0.35, -1.35),
    new Vector3(1.65, -0.38, -1.50),
    new Vector3(1.25, -0.28, -1.15),
    new Vector3(1.10, -0.32, -1.40),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 11. Anakan Lincah Kanan (Playful Junior) - Berkeliling Karang Luar Timur Laut
export const CLOWNFISH_PASTEL_JUNIOR_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-junior",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.27, // ~4.8cm
  initialPosition: [1.20, -0.30, -1.70],
  initialHeading: Math.PI * 0.70,
  collisionRadius: 0.03,
  feedingDepthRange: [-0.50, -0.20],
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
    minX: 0.75,
    maxX: 1.70,
    minY: -0.48,
    maxY: -0.10,
    minZ: -2.15,
    maxZ: -1.30,
  },
  pointsOfInterest: [
    new Vector3(1.20, -0.30, -1.70),
    new Vector3(1.45, -0.25, -1.90),
    new Vector3(0.90, -0.32, -1.50),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 12. Bayi Mungil Kanan (Tiny Baby) - Menjelajahi Tonjolan Karang Tengah-Timur
export const CLOWNFISH_PASTEL_TINY_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-tiny",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.22, // ~3.8cm
  initialPosition: [0.25, -0.38, -1.25],
  initialHeading: -Math.PI * 0.25,
  collisionRadius: 0.025,
  feedingDepthRange: [-0.50, -0.25],
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
    minX: -0.05,
    maxX: 0.55,
    minY: -0.50,
    maxY: -0.22,
    minZ: -1.55,
    maxZ: -1.00,
  },
  pointsOfInterest: [
    new Vector3(0.25, -0.38, -1.25),
    new Vector3(0.15, -0.35, -1.35),
    new Vector3(0.38, -0.40, -1.15),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 13. Perenang Tinggi Kanan (High Canopy Swimmer) - Melambung di zona cahaya matahari timur
export const CLOWNFISH_PASTEL_HIGH_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-high",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.45,
  initialPosition: [0.95, 0.20, -1.10],
  initialHeading: -Math.PI * 0.55,
  collisionRadius: 0.05,
  feedingDepthRange: [-0.15, 0.50],
  baseCruisingSpeed: 0.22,
  maxSprintSpeed: 0.45,
  turnSpeed: 6.8,
  biteDistance: 0.08,
  detectionRadius: 0.85,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 5.0,
  swimDurationMax: 9.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.20,
    maxX: 1.85,
    minY: -0.15,
    maxY: 0.50,
    minZ: -1.90,
    maxZ: -0.65,
  },
  pointsOfInterest: [
    new Vector3(0.95, 0.25, -1.10),
    new Vector3(1.50, 0.35, -1.40),
    new Vector3(0.40, 0.18, -0.85),
    new Vector3(1.20, 0.40, -1.60),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 14. Penjelajah Dasar Pasir Kanan (Seabed Sand Skimmer) - Menyusuri lantai pasir dari tengah ke timur
export const CLOWNFISH_PASTEL_BOTTOM_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-bottom",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.37,
  initialPosition: [0.85, -0.52, -1.10],
  initialHeading: Math.PI * 0.40,
  collisionRadius: 0.04,
  feedingDepthRange: [-0.56, -0.42],
  baseCruisingSpeed: 0.14,
  maxSprintSpeed: 0.34,
  turnSpeed: 8.0,
  biteDistance: 0.05,
  detectionRadius: 0.45,
  pauseDurationMin: 2.5,
  pauseDurationMax: 6.0,
  swimDurationMin: 3.0,
  swimDurationMax: 7.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.20,
    maxX: 1.60,
    minY: -0.55,
    maxY: -0.42,
    minZ: -1.65,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    new Vector3(0.85, -0.52, -1.10),
    new Vector3(1.30, -0.53, -1.35),
    new Vector3(0.45, -0.51, -0.90),
    new Vector3(0.30, -0.52, -1.20),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 15. Pengembara Luar Anemon Kanan (Reef Roamer / Scout) - Menjelajah karang terbuka timur laut luas
export const CLOWNFISH_PASTEL_ROAMER_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-roamer",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.47,
  initialPosition: [0.80, -0.20, -1.80],
  initialHeading: -Math.PI * 0.30,
  collisionRadius: 0.05,
  feedingDepthRange: [-0.48, 0.25],
  baseCruisingSpeed: 0.21,
  maxSprintSpeed: 0.46,
  turnSpeed: 5.5,
  biteDistance: 0.08,
  detectionRadius: 1.10,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 6.0,
  swimDurationMax: 12.0,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: -0.40,
    maxX: 3.20,
    minY: -0.48,
    maxY: 0.30,
    minZ: -3.60,
    maxZ: -0.60,
  },
  pointsOfInterest: [
    new Vector3(0.80, -0.20, -1.80),
    new Vector3(2.20, -0.15, -2.40),
    new Vector3(1.50, 0.10, -1.30),
    new Vector3(0.30, -0.25, -1.50),
    new Vector3(2.60, -0.30, -1.80),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

// 16. Spesialis Nuzzle Kanan (Deep Anemone Snuggler) - Selalu di dalam rumbai anemon kanan
export const CLOWNFISH_PASTEL_NUZZLER_CONFIG: FishModelConfig = {
  id: "clownfish-pastel-nuzzler",
  species: "Clownfish Pastel",
  modelPath: "/models/clown_fish_pastel_animated.glb",
  visualScale: 0.30,
  initialPosition: [0.60, -0.44, -0.95],
  initialHeading: Math.PI * 0.15,
  collisionRadius: 0.03,
  feedingDepthRange: [-0.52, -0.36],
  baseCruisingSpeed: 0.11,
  maxSprintSpeed: 0.28,
  turnSpeed: 8.5,
  biteDistance: 0.04,
  detectionRadius: 0.32,
  pauseDurationMin: 3.5,
  pauseDurationMax: 7.5,
  swimDurationMin: 2.0,
  swimDurationMax: 4.5,
  clipNames: { swim: "swim", idle: "idle", bite: "bite" },
  bounds: {
    minX: 0.45,
    maxX: 0.75,
    minY: -0.50,
    maxY: -0.35,
    minZ: -1.08,
    maxZ: -0.82,
  },
  pointsOfInterest: [
    new Vector3(0.60, -0.44, -0.95),
    new Vector3(0.58, -0.42, -0.94),
    new Vector3(0.62, -0.43, -0.96),
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
    minX: -2.80,
    maxX: 2.80,
    minY: -0.25,
    maxY: 0.45,
    minZ: -3.80,
    maxZ: -0.80,
  },
  pointsOfInterest: [
    new Vector3(0.0, 0.10, -1.30),
    new Vector3(-1.80, -0.05, -2.40),
    new Vector3(1.80, 0.15, -2.20),
    new Vector3(-0.90, 0.25, -1.60),
    new Vector3(0.90, -0.05, -3.10),
    new Vector3(0.0, 0.30, -2.50),
    new Vector3(-2.20, 0.10, -1.80),
    new Vector3(2.20, 0.20, -1.80),
  ],
  roughness: 0.38,
  metalness: 0.08,
};

/**
 * 4. Ikan Pari (Stingray)
/**
 * 4. KELUARGA / KOLONI IKAN PARI PERMUKAAN (Surface Fever of Stingrays)
 * Habitat: Lapisan atas dekat permukaan laut samudra (Y ~ 0.60 - 0.88m, tidak pernah menukik ke dasar laut).
 * Karakteristik Pergerakan Otonom:
 * - Berenang bersama sebagai koloni (squadron / fever) yang anggun di dekat permukaan.
 * - Berkeliling melingkar (orbital loitering) memutari area hub tertentu di dekat permukaan air.
 * - Setelah beberapa saat, bersama-sama berpindah (migrasi) menuju area hub baru dan berputar melingkar lagi.
 * - Kemiringan sayap (procedural banking roll) miring ke dalam secara spektakuler saat berbelok melingkar.
 */

const STINGRAY_SURFACE_HUBS: Vector3[] = [
  new Vector3(0.15, 1.75, -1.40),   // Hub 1: Angkasa Laut Tengah / Terang Surya (Sunlit Upper Portal)
  new Vector3(-2.80, 1.65, -2.10),  // Hub 2: Angkasa Laut Barat Tinggi (West High Canopy)
  new Vector3(2.80, 1.70, -2.20),   // Hub 3: Angkasa Laut Timur Tinggi (East High Canopy)
  new Vector3(-0.80, 1.85, -3.80),  // Hub 4: Samudra Lepas Utara Tinggi Jauh (North Pelagic High)
  new Vector3(2.40, 1.80, -3.90),   // Hub 5: Cakrawala Samudra Timur Laut Tinggi (Northeast High Horizon)
];

const STINGRAY_SURFACE_BOUNDS = {
  minX: -5.40,
  maxX: 5.40,
  minY: 1.35, // Jauh lebih tinggi di atas terumbu karang dan satwa laut lainnya
  maxY: 2.25, // Melayang bebas tinggi di bawah permukaan air laut
  minZ: -5.80,
  maxZ: -0.60,
};

// 4.a. Pemimpin Koloni Pari (Alpha Ray)
export const STINGRAY_ALPHA_CONFIG: FishModelConfig = {
  id: "stingray-alpha",
  species: "Stingray Alpha",
  modelPath: "/models/stingray_-_animated_low_poly.glb",
  visualScale: 0.48, // ~0.96m panjang, ~0.42m rentang sayap
  modelOffset: [0, 0, 0.22],
  initialPosition: [0.20, 1.75, -1.40],
  initialHeading: -Math.PI * 0.45,
  collisionRadius: 0.32,
  feedingDepthRange: [1.30, 2.50],
  baseCruisingSpeed: 0.20,
  maxSprintSpeed: 0.40,
  turnSpeed: 1.8,
  biteDistance: 0.22,
  detectionRadius: 2.20,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.0,
  swimDurationMin: 12.0,
  swimDurationMax: 22.0,
  clipNames: {
    swim: "Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Stingray_swim",
  },
  bounds: STINGRAY_SURFACE_BOUNDS,
  pointsOfInterest: STINGRAY_SURFACE_HUBS,
  navigationPattern: "orbital",
  orbitRadius: 1.65,
  orbitHubDuration: 18.0,
  orbitDirection: 1,
  roughness: 0.42,
  metalness: 0.02,
};

// 4.b. Pari Sayap Kiri (Beta Ray)
export const STINGRAY_BETA_CONFIG: FishModelConfig = {
  id: "stingray-beta",
  species: "Stingray Beta",
  modelPath: "/models/stingray_-_animated_low_poly.glb",
  visualScale: 0.40, // ~0.80m panjang
  modelOffset: [0, 0, 0.22],
  initialPosition: [-0.55, 1.68, -1.70],
  initialHeading: -Math.PI * 0.35,
  collisionRadius: 0.28,
  feedingDepthRange: [1.30, 2.50],
  baseCruisingSpeed: 0.19,
  maxSprintSpeed: 0.38,
  turnSpeed: 1.9,
  biteDistance: 0.20,
  detectionRadius: 2.00,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.0,
  swimDurationMin: 12.0,
  swimDurationMax: 22.0,
  clipNames: {
    swim: "Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Stingray_swim",
  },
  bounds: STINGRAY_SURFACE_BOUNDS,
  pointsOfInterest: STINGRAY_SURFACE_HUBS,
  navigationPattern: "orbital",
  orbitRadius: 1.35,
  orbitHubDuration: 19.5,
  orbitDirection: 1,
  roughness: 0.42,
  metalness: 0.02,
};

// 4.c. Pari Sayap Kanan (Gamma Ray)
export const STINGRAY_GAMMA_CONFIG: FishModelConfig = {
  id: "stingray-gamma",
  species: "Stingray Gamma",
  modelPath: "/models/stingray_-_animated_low_poly.glb",
  visualScale: 0.44, // ~0.88m panjang
  modelOffset: [0, 0, 0.22],
  initialPosition: [0.85, 1.80, -1.30],
  initialHeading: -Math.PI * 0.55,
  collisionRadius: 0.30,
  feedingDepthRange: [1.30, 2.50],
  baseCruisingSpeed: 0.21,
  maxSprintSpeed: 0.42,
  turnSpeed: 1.7,
  biteDistance: 0.22,
  detectionRadius: 2.10,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.0,
  swimDurationMin: 12.0,
  swimDurationMax: 22.0,
  clipNames: {
    swim: "Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Stingray_swim",
  },
  bounds: STINGRAY_SURFACE_BOUNDS,
  pointsOfInterest: STINGRAY_SURFACE_HUBS,
  navigationPattern: "orbital",
  orbitRadius: 1.95,
  orbitHubDuration: 17.0,
  orbitDirection: 1,
  roughness: 0.42,
  metalness: 0.02,
};

// 4.d. Pari Muda / Pengintai (Delta Ray)
export const STINGRAY_DELTA_CONFIG: FishModelConfig = {
  id: "stingray-delta",
  species: "Stingray Delta",
  modelPath: "/models/stingray_-_animated_low_poly.glb",
  visualScale: 0.34, // ~0.68m panjang
  modelOffset: [0, 0, 0.22],
  initialPosition: [0.10, 1.65, -2.10],
  initialHeading: -Math.PI * 0.40,
  collisionRadius: 0.24,
  feedingDepthRange: [1.30, 2.50],
  baseCruisingSpeed: 0.22,
  maxSprintSpeed: 0.44,
  turnSpeed: 2.1,
  biteDistance: 0.18,
  detectionRadius: 1.90,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.0,
  swimDurationMin: 12.0,
  swimDurationMax: 22.0,
  clipNames: {
    swim: "Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Animal_3045_Rig|Stingray_swim",
  },
  bounds: STINGRAY_SURFACE_BOUNDS,
  pointsOfInterest: STINGRAY_SURFACE_HUBS,
  navigationPattern: "orbital",
  orbitRadius: 1.50,
  orbitHubDuration: 16.0,
  orbitDirection: 1,
  roughness: 0.42,
  metalness: 0.02,
};

// Kompatibilitas alias untuk import lama
export const STINGRAY_CONFIG: FishModelConfig = STINGRAY_ALPHA_CONFIG;

/**
 * 5. Lumba-Lumba (Dolphin)
 * Habitat: Perairan samudra bebas dengan vertikalitas dinamis luas 2x lipat.
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
  turnSpeed: 2.6, // Lincah dan akrobatik dengan kurva luwes
  biteDistance: 0.20,
  detectionRadius: 2.80,
  pauseDurationMin: 1.2,
  pauseDurationMax: 3.0,
  swimDurationMin: 7.0,
  swimDurationMax: 16.0,
  clipNames: {
    swim: "Dolphin_Rig|Dolphin_Rig|move",
  },
  bounds: {
    minX: -5.00,
    maxX: 5.00,
    minY: -0.14, // Menukik mendekati dasar terumbu karang
    maxY: 0.95,  // Melambung tinggi ke puncak permukaan air
    minZ: -5.40,
    maxZ: -0.55,
  },
  pointsOfInterest: [
    // Puncak permukaan air (surface dash)
    new Vector3(0.0, 0.90, -1.20),
    new Vector3(-3.20, 0.85, -2.60),
    new Vector3(3.20, 0.85, -2.60),
    // Jalur tengah akrobatik (mid acrobatic arcs luas)
    new Vector3(-1.80, 0.45, -3.80),
    new Vector3(1.80, 0.50, -2.20),
    // Menukik ke dasar karang (deep seabed dive)
    new Vector3(0.0, -0.10, -3.20),
    new Vector3(-2.20, -0.12, -2.40),
    new Vector3(2.20, -0.12, -3.40),
  ],
  roughness: 0.25,
  metalness: 0.12,
};

/**
 * 6. Hiu Karang (Reef Shark)
 * Habitat: Perimeter luar laut lepas sisi kiri & palung dalam luas 2x lipat.
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
  turnSpeed: 1.8, // Belokan melengkung anggun predator samudra
  biteDistance: 0.22,
  detectionRadius: 2.60,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 8.5,
  swimDurationMax: 18.0,
  clipNames: {
    swim: "Shark_Rig|Shark_Rig|shark_swim",
  },
  bounds: {
    minX: -5.20,
    maxX: 1.80,
    minY: -0.14, // Menukik mengintai dasar laut
    maxY: 0.92,  // Berpatroli di ketinggian atas perairan terbuka
    minZ: -5.60,
    maxZ: -0.60,
  },
  pointsOfInterest: [
    // Patroli atas (high ocean patrol luas)
    new Vector3(-3.60, 0.80, -4.20),
    new Vector3(-0.60, 0.75, -2.40),
    // Jelajah tengah (mid reef cruising)
    new Vector3(-2.80, 0.35, -3.20),
    new Vector3(0.80, 0.30, -2.40),
    // Mengintai dasar (deep floor prowl)
    new Vector3(-3.20, -0.11, -3.80),
    new Vector3(-1.20, -0.12, -2.60),
    // Horizon kejauhan (far deep horizon)
    new Vector3(-4.60, 0.55, -4.80),
  ],
  roughness: 0.30,
  metalness: 0.08,
};

/**
 * 7. Paus Pembunuh (Orca)
 * Habitat: Samudra dalam sisi kanan hingga kejauhan diperluas 2x lipat.
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
  turnSpeed: 1.4, // Belokan busur megah berbobot paus samudra
  biteDistance: 0.24,
  detectionRadius: 2.60,
  pauseDurationMin: 2.2,
  pauseDurationMax: 4.8,
  swimDurationMin: 8.0,
  swimDurationMax: 18.0,
  clipNames: {
    swim: "Orca_Rig|Orca_Rig|swim",
    idle: "Orca_Rig|Orca_Rig|idle",
  },
  bounds: {
    minX: -1.50,
    maxX: 5.50,
    minY: -0.14, // Menyelam dalam ke dasar samudra
    maxY: 0.95,  // Meluncur anggun di lapisan atas
    minZ: -5.80,
    maxZ: -0.60,
  },
  pointsOfInterest: [
    // Lapisan atas samudra (high ocean cruising luas)
    new Vector3(3.40, 0.85, -4.20),
    new Vector3(0.60, 0.75, -2.60),
    // Lintasan tengah laut lepas (mid oceanic transit)
    new Vector3(2.60, 0.40, -3.20),
    new Vector3(4.20, 0.55, -4.60),
    // Menyelam ke dasar laut (deep seabed floor dive)
    new Vector3(3.00, -0.11, -3.80),
    new Vector3(0.80, -0.12, -2.80),
    // Horizon kejauhan (far horizon ocean sweep)
    new Vector3(4.80, 0.70, -5.20),
  ],
  roughness: 0.28,
  metalness: 0.10,
};

/**
 * 8. Penyu Laut Dewasa (Green Sea Turtle)
 * Habitat: Lapisan tengah hingga dasar laut luas 2x lipat (Benthic & Pelagic forager).
 * Karakter: Berenang tenang dan damai, sesekali naik ke permukaan lalu meluncur turun mengikis alga karang.
 */
export const SEA_TURTLE_CONFIG: FishModelConfig = {
  id: "sea-turtle",
  species: "Sea Turtle",
  modelPath: "/models/sea_turtle_-_animated_low_poly.glb",
  visualScale: 0.28, // ~0.42m panjang tempurung
  initialPosition: [-0.65, 0.36, -1.35],
  initialHeading: Math.PI * 0.35,
  collisionRadius: 0.28,
  feedingDepthRange: [-0.15, 0.90],
  baseCruisingSpeed: 0.16, // Kepakan sirip tenang dan anggun
  maxSprintSpeed: 0.38,
  turnSpeed: 1.4, // Belokan santai dan melengkung alami
  biteDistance: 0.22,
  detectionRadius: 2.40,
  pauseDurationMin: 3.0,
  pauseDurationMax: 6.5,
  swimDurationMin: 8.5,
  swimDurationMax: 18.0,
  clipNames: {
    swim: "Animal_3121_Rig|Animal_3121_Rig|Animal_3121_Rig|Turtle_swim",
    idle: "Animal_3121_Rig|Animal_3121_Rig|Animal_3121_Rig|Turtle_idle",
    bite: "Animal_3121_Rig|Animal_3121_Rig|Animal_3121_Rig|Turtle_eat",
  },
  bounds: {
    minX: -4.40,
    maxX: 4.40,
    minY: -0.14, // Menyentuh dasar pasir karang
    maxY: 0.90,  // Naik ke dekat permukaan air
    minZ: -4.80,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    // Melayang di celah karang utama (coral forage)
    new Vector3(-0.35, 0.05, -1.15),
    new Vector3(0.45, 0.10, -1.25),
    // Menjelajah lapisan tengah terbuka (mid ocean glide luas)
    new Vector3(-2.20, 0.50, -3.20),
    new Vector3(1.80, 0.45, -2.80),
    // Naik ke permukaan air menghirup udara (surface breath)
    new Vector3(0.20, 0.85, -2.00),
    // Menyelam santai di dasar pasir (sandy floor rest)
    new Vector3(-1.20, -0.11, -2.80),
    new Vector3(1.40, -0.11, -3.60),
  ],
  roughness: 0.35,
  metalness: 0.05,
};

/**
 * 9. Kawanan Anak Penyu / Tukik (Baby Sea Turtle Pod - Beragam Ukuran & Peran)
 * Dilengkapi animasi aktif (kepak sirip mendayung, ekor bergoyang, kepala menoleh)
 */

// 9a. Tukik Sulung (Leader Baby Turtle) - Ukuran ~22cm, memimpin di kolom karang tengah
export const BABY_TURTLE_LEADER_CONFIG: FishModelConfig = {
  id: "baby-turtle-leader",
  species: "Baby Sea Turtle",
  modelPath: "/models/seaturtle_baby_-_animated_low_poly.glb",
  visualScale: 0.38, // ~22cm panjang
  initialPosition: [-0.45, 0.38, -1.25],
  initialHeading: Math.PI * 0.45,
  collisionRadius: 0.22,
  feedingDepthRange: [-0.10, 0.88],
  baseCruisingSpeed: 0.20,
  maxSprintSpeed: 0.44,
  turnSpeed: 2.4,
  biteDistance: 0.12,
  detectionRadius: 2.20,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.5,
  swimDurationMin: 7.0,
  swimDurationMax: 14.0,
  clipNames: {
    swim: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|run",
    idle: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|idle",
  },
  bounds: {
    minX: -3.20,
    maxX: 3.20,
    minY: -0.12,
    maxY: 0.85,
    minZ: -3.80,
    maxZ: -0.75,
  },
  pointsOfInterest: [
    new Vector3(-0.25, 0.20, -1.10),
    new Vector3(0.30, 0.25, -1.20),
    new Vector3(-1.40, 0.42, -2.50),
    new Vector3(0.30, 0.75, -1.80),
    new Vector3(1.20, 0.30, -2.20),
  ],
  roughness: 0.38,
  metalness: 0.04,
};

// 9b. Tukik Sedang (Medium Baby Turtle) - Ukuran ~16cm, lincah menyusuri karang timur
export const BABY_TURTLE_MEDIUM_CONFIG: FishModelConfig = {
  id: "baby-turtle-medium",
  species: "Baby Sea Turtle",
  modelPath: "/models/seaturtle_baby_-_animated_low_poly.glb",
  visualScale: 0.28, // ~16cm panjang
  initialPosition: [0.65, 0.25, -1.35],
  initialHeading: -Math.PI * 0.40,
  collisionRadius: 0.18,
  feedingDepthRange: [-0.12, 0.85],
  baseCruisingSpeed: 0.18,
  maxSprintSpeed: 0.40,
  turnSpeed: 2.6,
  biteDistance: 0.10,
  detectionRadius: 2.00,
  pauseDurationMin: 1.8,
  pauseDurationMax: 4.0,
  swimDurationMin: 6.5,
  swimDurationMax: 13.0,
  clipNames: {
    swim: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|run",
    idle: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|idle",
  },
  bounds: {
    minX: -0.50,
    maxX: 3.50,
    minY: -0.15,
    maxY: 0.82,
    minZ: -3.60,
    maxZ: -0.80,
  },
  pointsOfInterest: [
    new Vector3(0.65, 0.25, -1.35),
    new Vector3(1.50, 0.35, -2.10),
    new Vector3(0.40, 0.50, -1.60),
    new Vector3(1.80, 0.20, -2.80),
    new Vector3(0.10, 0.15, -1.20),
  ],
  roughness: 0.38,
  metalness: 0.04,
};

// 9c. Tukik Mungil Baru Menetas (Tiny Hatchling) - Ukuran ~11cm, mungil imut di lapisan air terang
export const BABY_TURTLE_TINY_CONFIG: FishModelConfig = {
  id: "baby-turtle-tiny",
  species: "Baby Sea Turtle",
  modelPath: "/models/seaturtle_baby_-_animated_low_poly.glb",
  visualScale: 0.19, // ~11cm panjang (sangat mungil & menggemaskan)
  initialPosition: [0.10, 0.65, -1.10],
  initialHeading: Math.PI * 0.20,
  collisionRadius: 0.12,
  feedingDepthRange: [0.15, 0.92],
  baseCruisingSpeed: 0.15,
  maxSprintSpeed: 0.35,
  turnSpeed: 3.0,
  biteDistance: 0.08,
  detectionRadius: 1.80,
  pauseDurationMin: 1.5,
  pauseDurationMax: 3.5,
  swimDurationMin: 6.0,
  swimDurationMax: 12.0,
  clipNames: {
    swim: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|run",
    idle: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|idle",
  },
  bounds: {
    minX: -2.20,
    maxX: 2.20,
    minY: 0.25, // Gemar bermain di air dangkal/terang dekat permukaan bersorot matahari
    maxY: 0.90,
    minZ: -2.80,
    maxZ: -0.70,
  },
  pointsOfInterest: [
    new Vector3(0.10, 0.65, -1.10),
    new Vector3(-0.80, 0.72, -1.50),
    new Vector3(0.70, 0.68, -1.60),
    new Vector3(0.00, 0.82, -1.90),
    new Vector3(-0.40, 0.55, -1.20),
  ],
  roughness: 0.38,
  metalness: 0.04,
};

// 9d. Tukik Penjelajah Karang Luar (Reef Explorer Hatchling) - Ukuran ~19cm di gugusan karang barat
export const BABY_TURTLE_CORAL_CONFIG: FishModelConfig = {
  id: "baby-turtle-coral",
  species: "Baby Sea Turtle",
  modelPath: "/models/seaturtle_baby_-_animated_low_poly.glb",
  visualScale: 0.33, // ~19cm panjang
  initialPosition: [-1.20, 0.22, -1.65],
  initialHeading: -Math.PI * 0.65,
  collisionRadius: 0.20,
  feedingDepthRange: [-0.14, 0.75],
  baseCruisingSpeed: 0.19,
  maxSprintSpeed: 0.42,
  turnSpeed: 2.5,
  biteDistance: 0.12,
  detectionRadius: 2.10,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.5,
  swimDurationMin: 7.0,
  swimDurationMax: 15.0,
  clipNames: {
    swim: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|run",
    idle: "BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|BabyturtleChocolate_Rig|idle",
  },
  bounds: {
    minX: -3.80,
    maxX: 0.60,
    minY: -0.15,
    maxY: 0.78,
    minZ: -3.80,
    maxZ: -0.80,
  },
  pointsOfInterest: [
    new Vector3(-1.20, 0.22, -1.65),
    new Vector3(-2.20, 0.35, -2.40),
    new Vector3(-0.60, 0.18, -1.30),
    new Vector3(-1.80, 0.50, -1.80),
    new Vector3(-2.60, 0.10, -2.80),
  ],
  roughness: 0.38,
  metalness: 0.04,
};

// Kompatibilitas alias
export const BABY_TURTLE_CONFIG = BABY_TURTLE_LEADER_CONFIG;

// Preload semua model GLTF ke memori browser untuk performa mulus
useGLTF.preload(CLOWNFISH_CLASSIC_CONFIG.modelPath);
useGLTF.preload(CLOWNFISH_PASTEL_CONFIG.modelPath);
useGLTF.preload(NILA_FISH_CONFIG.modelPath);
useGLTF.preload(STINGRAY_CONFIG.modelPath);
useGLTF.preload(DOLPHIN_CONFIG.modelPath);
useGLTF.preload(SHARK_CONFIG.modelPath);
useGLTF.preload(ORCA_CONFIG.modelPath);
useGLTF.preload(SEA_TURTLE_CONFIG.modelPath);
useGLTF.preload(BABY_TURTLE_CONFIG.modelPath);

/**
 * Komponen Ekosistem Satwa Laut Lengkap Akuarium AR:
 * - Anti-Collision / Boid Separation System: Ikan saling menghindar otomatis tanpa tabrakan.
 * - Distributed Spawns & Strata: Tiap spesies memiliki zona jelajah dan kedalaman alami masing-masing.
 * - Variasi Pola Makan (Feeding Habits):
 *   - Lumba-lumba: pemakan permukaan (surface feeder).
 *   - Ikan Pari: pemakan dasar laut (benthic feeder).
 *   - Ikan Badut: teritorial karang.
 *   - Hiu & Orca: patroli laut dalam.
 *   - Penyu Laut (Dewasa & Tukik): penjelajah anggun terumbu karang.
 * - Adaptive Population: Menyesuaikan jumlah kawanan ikan badut di smartphone (8 ekor) vs desktop (16 ekor)
 *   serta kawanan bayi penyu (2 ekor di HP, 4 ekor di Desktop) untuk menjaga performa 60 FPS tetap mulus tanpa stuttering.
 */
export function AutonomousMarineLife() {
  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 768 || "ontouchstart" in window,
    () => false
  );

  return (
    <group>
      {/* 1. Koloni Ikan Badut Klasik Oranye-Putih (Anemon Kiri: 4 ekor di HP, 8 ekor di Desktop) */}
      <AnimatedFish config={CLOWNFISH_CLASSIC_ALPHA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_CLASSIC_BETA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_CLASSIC_JUNIOR_CONFIG} />
      <AnimatedFish config={CLOWNFISH_CLASSIC_ROAMER_CONFIG} />
      {!isMobile && (
        <>
          <AnimatedFish config={CLOWNFISH_CLASSIC_TINY_CONFIG} />
          <AnimatedFish config={CLOWNFISH_CLASSIC_HIGH_CONFIG} />
          <AnimatedFish config={CLOWNFISH_CLASSIC_BOTTOM_CONFIG} />
          <AnimatedFish config={CLOWNFISH_CLASSIC_NUZZLER_CONFIG} />
        </>
      )}

      {/* 2. Koloni Ikan Badut Pastel Pink-Putih (Anemon Kanan: 4 ekor di HP, 8 ekor di Desktop) */}
      <AnimatedFish config={CLOWNFISH_PASTEL_ALPHA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_PASTEL_BETA_CONFIG} />
      <AnimatedFish config={CLOWNFISH_PASTEL_JUNIOR_CONFIG} />
      <AnimatedFish config={CLOWNFISH_PASTEL_ROAMER_CONFIG} />
      {!isMobile && (
        <>
          <AnimatedFish config={CLOWNFISH_PASTEL_TINY_CONFIG} />
          <AnimatedFish config={CLOWNFISH_PASTEL_HIGH_CONFIG} />
          <AnimatedFish config={CLOWNFISH_PASTEL_BOTTOM_CONFIG} />
          <AnimatedFish config={CLOWNFISH_PASTEL_NUZZLER_CONFIG} />
        </>
      )}

      {/* 3. Ikan Nila (Celah Karang Tengah) */}
      <AnimatedFish config={NILA_FISH_CONFIG} />

      {/* 4. Koloni Ikan Pari di Permukaan Laut (Fever of Stingrays: Berenang Anggun Melingkari Area Tertentu lalu Berpindah Bersama) */}
      <AnimatedFish config={STINGRAY_ALPHA_CONFIG} />
      <AnimatedFish config={STINGRAY_BETA_CONFIG} />
      {!isMobile && (
        <>
          <AnimatedFish config={STINGRAY_GAMMA_CONFIG} />
          <AnimatedFish config={STINGRAY_DELTA_CONFIG} />
        </>
      )}

      {/* 5. Lumba-Lumba (Kolom Air Atas) */}
      <AnimatedFish config={DOLPHIN_CONFIG} />

      {/* 6. Hiu Karang (Perimeter Laut Kiri Belakang & Patroli Dalam) */}
      <AnimatedFish config={SHARK_CONFIG} />

      {/* 7. Paus Pembunuh (Perimeter Laut Kanan Belakang & Menyelam Bebas) */}
      <AnimatedFish config={ORCA_CONFIG} />

      {/* 8. Penyu Laut Dewasa (Jelajah Anggun Terumbu Karang & Permukaan) */}
      <AnimatedFish config={SEA_TURTLE_CONFIG} />

      {/* 9. Kawanan Bayi Penyu / Tukik Bervariasi Ukuran (2 di HP, 4 di Desktop) */}
      <AnimatedFish config={BABY_TURTLE_LEADER_CONFIG} />
      <AnimatedFish config={BABY_TURTLE_MEDIUM_CONFIG} />
      {!isMobile && (
        <>
          <AnimatedFish config={BABY_TURTLE_TINY_CONFIG} />
          <AnimatedFish config={BABY_TURTLE_CORAL_CONFIG} />
        </>
      )}
    </group>
  );
}

