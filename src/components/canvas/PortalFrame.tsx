"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";

/**
 * Bingkai Ambang Pintu Portal Magis (Magic Window Portal Frame)
 *
 * Memberikan efek ambang batas estetik di depan pandangan kamera:
 * - Cincin portal bundar elips dengan motif caustic & pendaran bioluminescent
 * - Butiran partikel ambang pintu yang berputar lembut
 */
export function PortalFrame() {
  const frameRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <group ref={frameRef} position={[0, 0, -0.45]}>
      {/* Cincin Luar Berpendar (Outer Luminous Portal Ring) */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.35, 1.42, 64]} />
        <meshBasicMaterial
          color="#ff70a6"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Cincin Dalam Emas Halus (Inner Golden Caustic Rim) */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[1.32, 1.35, 64]} />
        <meshBasicMaterial
          color="#ffd56b"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* 4 Permata Aksen Sudut Portal (Coral Gem Relics) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
        const x = Math.cos(angle) * 1.37;
        const y = Math.sin(angle) * 1.37;
        return (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffb703"
                emissiveIntensity={2.0}
                roughness={0.2}
              />
            </mesh>
            <pointLight color="#ffb703" intensity={0.4} distance={0.5} />
          </group>
        );
      })}
    </group>
  );
}
