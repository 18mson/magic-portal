"use client";

import { useMemo, useRef } from "react";
import { BoxGeometry } from "three";
import type { Mesh } from "three";

export function SceneEnvironment() {
  const meshRef = useRef<Mesh>(null);
  const edgeGeometry = useMemo(() => new BoxGeometry(0.301, 0.301, 0.301), []);

  return (
    <group position={[0, 0, -1.2]}>
      {/* 
        Cube berukuran 30cm (0.3 unit = 0.3 meter) diposisikan tetap di world-space.
        Koordinat [0, 0, -1.2] berarti 1.2 meter di depan titik asal kamera saat sesi AR dimulai.
        Kubus diam tanpa animasi agar user dapat memverifikasi translasi 6DoF (parallax) secara akurat.
      */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color="#06b6d4" // teal Ghibli tone
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Garis tepi luar agar sudut dan pergeseran perspektif lebih kontras terlihat */}
      <lineSegments>
        <edgesGeometry args={[edgeGeometry]} />
        <lineBasicMaterial color="#ffffff" />
      </lineSegments>
    </group>
  );
}
