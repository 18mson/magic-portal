"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, DoubleSide } from "three";
import { creatureInspection, ActiveInspection, SPECIES_CATALOG } from "@/lib/diorama/speciesData";

/**
 * Cincin Fokus Hologram 3D (Holographic Creature Reticle):
 * Menyorot posisi ikan yang sedang diinspeksi secara real-time di world-space
 */
export function CreatureInspectionReticle() {
  const [inspection, setInspection] = useState<ActiveInspection | null>(null);
  const ringRef1 = useRef<Mesh>(null);
  const ringRef2 = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    return creatureInspection.subscribe((active) => {
      setInspection(active);
    });
  }, []);

  useFrame((state) => {
    if (!inspection || !groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Rotasi berlawanan arah dari 2 cincin hologram
    if (ringRef1.current) ringRef1.current.rotation.z = t * 1.5;
    if (ringRef2.current) ringRef2.current.rotation.z = -t * 1.0;

    // Halus mengikuti posisi ikan
    groupRef.current.position.set(
      inspection.position[0],
      inspection.position[1],
      inspection.position[2]
    );
  });

  if (!inspection) return null;

  const info = SPECIES_CATALOG[inspection.speciesKey];
  const glow = info?.glowColor ?? "#38bdf8";

  return (
    <group ref={groupRef}>
      {/* Cincin Luar Berputar */}
      <mesh ref={ringRef1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.35, 32]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.7}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Cincin Dalam Berputar Terbalik */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.28, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Cahaya Titik Penyorot Fokus */}
      <pointLight color={glow} intensity={0.8} distance={1.2} decay={2} />
    </group>
  );
}
