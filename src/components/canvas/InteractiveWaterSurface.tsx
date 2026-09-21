"use client";

import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Group, Mesh, MeshBasicMaterial } from "three";
import { feedingSystem, FoodPellet, WaterRipple, BurstBubble } from "@/lib/simulation/feedingSystem";

/**
 * Komponen Butiran Pakan (Food Pellet) dengan Animasi Tenggelam 60 FPS
 */
function FoodPelletItem({ pellet }: { pellet: FoodPellet }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Sinkronkan posisi 3D tiap frame saat meluncur turun dalam air
      groupRef.current.position.set(pellet.position[0], pellet.position[1], pellet.position[2]);
      // Melayang & berotasi pelan saat tenggelam
      groupRef.current.rotation.y += 0.03;
      groupRef.current.rotation.x = Math.sin(pellet.age * 3.8) * 0.18;
    }
  });

  return (
    <group ref={groupRef} position={pellet.position}>
      {/* Inti Pakan Mutiara Bercahaya */}
      <mesh>
        <sphereGeometry args={[pellet.scale, 16, 16]} />
        <meshStandardMaterial
          color={pellet.color}
          emissive={pellet.glowColor}
          emissiveIntensity={2.2}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* Halo Pendaran Lembut */}
      <mesh>
        <sphereGeometry args={[pellet.scale * 1.7, 12, 12]} />
        <meshBasicMaterial
          color={pellet.glowColor}
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>

      {/* Cahaya Titik Lokal Menerangi Pasir & Ikan di Dekatnya */}
      <pointLight
        color={pellet.glowColor}
        intensity={0.45}
        distance={0.5}
        decay={2}
      />
    </group>
  );
}

/**
 * Komponen Gelembung Partikel / Jejak Buih Pakan
 */
function BubbleItem({ bubble }: { bubble: BurstBubble }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(bubble.position[0], bubble.position[1], bubble.position[2]);
    }
  });

  return (
    <mesh ref={meshRef} position={bubble.position}>
      <sphereGeometry args={[bubble.scale, 10, 10]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffd56b"
        emissiveIntensity={1.3}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={bubble.opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Komponen Riak Air (Water Ripple Wave) 60/120 FPS
 * Memperbarui matriks skala GPU langsung di useFrame tanpa alokasi ulang geometri tiap frame.
 */
function RippleItem({ ripple }: { ripple: WaterRipple }) {
  const groupRef = useRef<Group>(null);
  const ring1MatRef = useRef<MeshBasicMaterial>(null);
  const ring2MatRef = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Skala lingkar riak diperbarui tiap frame secara kontinyu dan mulus
      const s = Math.max(0.001, ripple.radius);
      groupRef.current.scale.set(s, s, 1);
    }
    if (ring1MatRef.current) {
      ring1MatRef.current.opacity = ripple.opacity * 0.85;
    }
    if (ring2MatRef.current) {
      ring2MatRef.current.opacity = ripple.opacity * 0.45;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[ripple.center[0], ripple.center[1] + 0.01, ripple.center[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* Cincin Utama (Puncak Gelombang Luar) */}
      <mesh>
        <ringGeometry args={[0.93, 1.0, 64]} />
        <meshBasicMaterial
          ref={ring1MatRef}
          color="#ffeedb"
          transparent
          opacity={0.85}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Cincin Sekunder (Gelombang Lembut yang Mengekor di Dalam) */}
      <mesh>
        <ringGeometry args={[0.70, 0.78, 64]} />
        <meshBasicMaterial
          ref={ring2MatRef}
          color="#ff9770"
          transparent
          opacity={0.45}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Komponen Visual Interaktif:
 * 1. Merender butiran pakan bercahaya yang meluncur turun ke dasar laut
 * 2. Merender gelombang riak air akustik di permukaan (Mulus 60 FPS)
 * 3. Merender letupan & jejak gelembung partikel
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
    // Sinkronkan daftar jika ada partikel yang ditambah atau dihapus
    if (
      pellets.length !== feedingSystem.pellets.length ||
      ripples.length !== feedingSystem.ripples.length ||
      bursts.length !== feedingSystem.burstBubbles.length
    ) {
      setPellets([...feedingSystem.pellets]);
      setRipples([...feedingSystem.ripples]);
      setBursts([...feedingSystem.burstBubbles]);
    }
  });

  return (
    <group>
      {/* 1. Butiran Pakan Bercahaya yang Tenggelam Perlahan */}
      {pellets.map((p) => (
        <FoodPelletItem key={p.id} pellet={p} />
      ))}

      {/* 2. Cincin Riak Air Akustik Bertingkat (Mulus 60 FPS) */}
      {ripples.map((r) => (
        <RippleItem key={r.id} ripple={r} />
      ))}

      {/* 3. Letupan & Jejak Gelembung Partikel */}
      {bursts.map((b) => (
        <BubbleItem key={b.id} bubble={b} />
      ))}

      {/* 4. Bidang Penangkap Sentuhan Raycast Interaktif (Touch & Click Raycaster) */}
      <mesh
        position={[0, 0.22, -1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          // Lepaskan butiran pakan dari lapisan atas air laut (Y: ~0.38)
          const spawnY = Math.max(e.point.y + 0.16, 0.38);
          feedingSystem.dropPellet([
            e.point.x,
            spawnY,
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

