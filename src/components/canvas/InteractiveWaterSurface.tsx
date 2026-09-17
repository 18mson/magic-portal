"use client";

import { useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import { feedingSystem, FoodPellet, WaterRipple, BurstBubble } from "@/lib/simulation/feedingSystem";

/**
 * Komponen Visual Interaktif:
 * 1. Merender butiran pakan bercahaya (Bioluminescent Pearl Food Pellets)
 * 2. Merender gelombang riak air akustik (Expanding Concentric Wave Rings)
 * 3. Merender letupan gelembung partikel saat pakan dimakan (Sparkle Bubble Bursts)
 */
export function InteractiveWaterSurface() {
  const [pellets, setPellets] = useState<FoodPellet[]>([]);
  const [ripples, setRipples] = useState<WaterRipple[]>([]);
  const [bursts, setBursts] = useState<BurstBubble[]>([]);

  useEffect(() => {
    const unsub = feedingSystem.subscribe(() => {
      setPellets([...feedingSystem.pellets]);
      setRipples([...feedingSystem.ripples]);
      setBursts([...feedingSystem.burstBubbles]);
    });
    return unsub;
  }, []);

  useFrame((_, delta) => {
    feedingSystem.update(delta);
    // Update local references jika ada partikel aktif
    if (feedingSystem.pellets.length > 0 || feedingSystem.ripples.length > 0 || feedingSystem.burstBubbles.length > 0) {
      setPellets([...feedingSystem.pellets]);
      setRipples([...feedingSystem.ripples]);
      setBursts([...feedingSystem.burstBubbles]);
    }
  });

  return (
    <group>
      {/* 1. Butiran Pakan Bercahaya */}
      {pellets.map((p) => (
        <group key={p.id} position={p.position}>
          {/* Inti Pakan */}
          <mesh>
            <sphereGeometry args={[p.scale, 16, 16]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.glowColor}
              emissiveIntensity={1.8}
              roughness={0.15}
              metalness={0.8}
            />
          </mesh>

          {/* Halo Pendaran Lembut */}
          <mesh>
            <sphereGeometry args={[p.scale * 2.2, 12, 12]} />
            <meshBasicMaterial
              color={p.glowColor}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>

          {/* Cahaya Titik Lokal Menerangi Pasir & Ikan di Dekatnya */}
          <pointLight
            color={p.glowColor}
            intensity={0.6}
            distance={0.8}
            decay={2}
          />
        </group>
      ))}

      {/* 2. Cincin Riak Air Akustik Bertingkat */}
      {ripples.map((r) => (
        <group key={r.id} position={[r.center[0], r.center[1] + 0.01, r.center[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Cincin Utama */}
          <mesh>
            <ringGeometry args={[Math.max(0.01, r.radius - 0.018), r.radius, 32]} />
            <meshBasicMaterial
              color="#ffeedb"
              transparent
              opacity={r.opacity * 0.7}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Cincin Luar Halus */}
          <mesh>
            <ringGeometry args={[Math.max(0.01, r.radius * 0.75 - 0.012), r.radius * 0.75, 32]} />
            <meshBasicMaterial
              color="#ff70a6"
              transparent
              opacity={r.opacity * 0.4}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* 3. Letupan Gelembung Partikel saat Pakan Dimakan */}
      {bursts.map((b) => (
        <mesh key={b.id} position={b.position}>
          <sphereGeometry args={[b.scale, 10, 10]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffd56b"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={b.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 4. Bidang Penangkap Sentuhan Raycast Interaktif (Touch & Click Raycaster) */}
      <mesh
        position={[0, 0.22, -1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          // Lepaskan butiran pakan di titik koordinat sentuhan 3D
          feedingSystem.dropPellet([
            e.point.x,
            Math.max(e.point.y, 0.32),
            e.point.z,
          ]);
        }}
      >
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
