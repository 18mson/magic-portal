"use client";

import { useMemo } from "react";
import { DoubleSide, Mesh, MeshStandardMaterial } from "three";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { STATIC_OBSTACLES, StaticObstacle } from "@/lib/simulation/obstacles";
import { getTerrainHeight } from "@/lib/terrain/terrainHeight";
import { PastelAnemone } from "./PastelAnemone";

// ============================================================================
// 1. KOMPONEN 3D MODEL FAN CORAL ASLI (Fan Coral 3D dari /models/fan_coral_med.glb)
// Menggantikan seluruh model terumbu karang silinder/low-poly prosedural lama
// ============================================================================

interface FanCoral3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  tint?: string;
}

export function FanCoral3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 6.0,
  tint,
}: FanCoral3DProps) {
  const { scene } = useGLTF("/models/fan_coral_med.glb");

  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);

    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = false;
        child.receiveShadow = true;
        child.frustumCulled = true;

        if (child.material) {
          const origMat = child.material as MeshStandardMaterial;
          const mat = origMat.clone();
          mat.roughness = 0.55;
          mat.metalness = 0.05;
          mat.side = DoubleSide;

          if (tint) {
            mat.color.set(tint);
          }

          child.material = mat;
        }
      }
    });

    return clone;
  }, [scene, tint]);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload model fan coral med
useGLTF.preload("/models/fan_coral_med.glb");

// ============================================================================
// 2. FORMASI TERUMBU KARANG ALAMI (MODULAR 3D REEF FORMATION)
// Menggabungkan 3D Fan Coral dan Pastel Anemone fotorealistik di atas dasar laut
// ============================================================================

interface CoralClusterProps {
  obstacle: StaticObstacle;
}

function SingleOrganicCoralFormation({ obstacle }: CoralClusterProps) {
  const s = obstacle.scale;

  // Variasi formasi organik berdasarkan ID
  const formationVariant = Math.abs(
    obstacle.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % 3;

  // Base scale untuk fan coral (~0.40m - 0.58m tinggi, ~0.78m - 1.05m lebar)
  const coralScale = s * 6.2;

  return (
    <group position={obstacle.pos} rotation={[0, obstacle.rotY, 0]}>
      {/* 1. Rumpun Utama Model 3D Fan Coral (Kipas Karang Alami) */}
      <FanCoral3D scale={coralScale} position={[0, 0, 0]} />

      {/* 2. Vegetasi Anemon Pendamping dengan Variasi Rona Warna */}
      {formationVariant === 0 && (
        <PastelAnemone
          scale={s * 0.038}
          position={[0.22, 0.02, 0.18]}
          tentacleTint="#c4ede5"
          glowColor="#6ee7b7"
        />
      )}

      {formationVariant === 1 && (
        <PastelAnemone
          scale={s * 0.035}
          position={[-0.20, 0.02, 0.16]}
          tentacleTint="#ffd1dc"
          glowColor="#f472b6"
        />
      )}

      {formationVariant === 2 && (
        <PastelAnemone
          scale={s * 0.036}
          position={[0.18, 0.02, -0.20]}
          tentacleTint="#fed7aa"
          glowColor="#fb923c"
        />
      )}
    </group>
  );
}

// ============================================================================
// 3. KOMPONEN UTAMA EKOSISTEM TERUMBU KARANG 3D AKUARIUM AR
// ============================================================================

export function CoralReef3D() {
  const classicHomeY = useMemo(() => getTerrainHeight(-0.60, -0.95), []);
  const pastelHomeY = useMemo(() => getTerrainHeight(0.60, -0.95), []);

  return (
    <group>
      {/* 1. Formasi Terumbu Karang 3D Statis (12 Gugusan Karang Kipas Alami) */}
      {STATIC_OBSTACLES.map((obs) => (
        <SingleOrganicCoralFormation key={obs.id} obstacle={obs} />
      ))}

      {/* 2. Ekosistem Rumah Utama Ikan Badut Klasik (Sayap Kiri Depan) */}
      {/* Model 3D Fan Coral sebagai latar belakang karang megah */}
      <FanCoral3D
        position={[-0.72, classicHomeY, -0.98]}
        rotation={[0, 0.45, 0]}
        scale={4.8}
      />
      {/* Rumpun Anemon Rumah Utama yang ditinggali kawanan ikan badut klasik */}
      <PastelAnemone
        position={[-0.60, classicHomeY, -0.95]}
        scale={0.044}
        tentacleTint="#c4ede5"
        glowColor="#6ee7b7"
      />

      {/* 3. Ekosistem Rumah Utama Ikan Badut Pastel (Sayap Kanan Depan) */}
      {/* Model 3D Fan Coral sebagai latar belakang karang megah */}
      <FanCoral3D
        position={[0.72, pastelHomeY, -0.98]}
        rotation={[0, -0.55, 0]}
        scale={4.8}
      />
      {/* Rumpun Anemon Rumah Utama yang ditinggali kawanan ikan badut pastel */}
      <PastelAnemone
        position={[0.60, pastelHomeY, -0.95]}
        scale={0.042}
        tentacleTint="#ffd1dc"
        glowColor="#f472b6"
      />
    </group>
  );
}

export { STATIC_OBSTACLES } from "@/lib/simulation/obstacles";
