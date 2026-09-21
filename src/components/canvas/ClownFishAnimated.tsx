"use client";

import { useGLTF } from "@react-three/drei";
import { AnimatedFish, FishModelConfig } from "./AnimatedFish";

/**
 * Spesifikasi Default Ikan Badut (Clownfish Model Specification)
 */
export const CLOWNFISH_CONFIG: FishModelConfig = {
  modelPath: "/models/clown_fish_low_poly_animated.glb",
  visualScale: 1.20,
  initialPosition: [0.0, 0.12, -0.95],
  baseCruisingSpeed: 0.22, // ~22 cm/s
  maxSprintSpeed: 0.52,    // ~52 cm/s
  turnSpeed: 6.2,         // ~355°/s respon lincah
  biteDistance: 0.11,
  detectionRadius: 1.85,
  pauseDurationMin: 2.0,
  pauseDurationMax: 4.5,
  swimDurationMin: 6.0,
  swimDurationMax: 11.0,
  clipNames: {
    swim: "swim",
    idle: "idle",
    bite: "bite",
  },
  roughness: 0.35,
  metalness: 0.05,
};

// Preload model GLTF
useGLTF.preload(CLOWNFISH_CONFIG.modelPath);

/**
 * Komponen Ikan Badut Beranimasi 3D
 * Menggunakan core reusable AnimatedFish dengan konfigurasi CLOWNFISH_CONFIG.
 */
export function ClownFishAnimated({
  overrideConfig,
}: {
  overrideConfig?: Partial<FishModelConfig>;
} = {}) {
  const mergedConfig: FishModelConfig = {
    ...CLOWNFISH_CONFIG,
    ...overrideConfig,
    clipNames: {
      ...CLOWNFISH_CONFIG.clipNames,
      ...overrideConfig?.clipNames,
    },
    bounds: {
      ...CLOWNFISH_CONFIG.bounds,
      ...overrideConfig?.bounds,
    },
  };

  return <AnimatedFish config={mergedConfig} />;
}
