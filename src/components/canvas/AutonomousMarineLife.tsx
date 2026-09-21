"use client";

import { ClownFishAnimated } from "./ClownFishAnimated";

/**
 * Komponen Ekosistem Satwa Laut Akuarium AR:
 * Menampilkan Ikan Badut 3D Rigged Beranimasi Skinned Mesh (swim, idle, bite, turn).
 */
export function AutonomousMarineLife() {
  return (
    <group>
      <ClownFishAnimated />
    </group>
  );
}
