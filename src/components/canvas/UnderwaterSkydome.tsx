"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color, Mesh } from "three";

interface UnderwaterSkydomeProps {
  /** Radius kubah bola 360 (default: 60) */
  radius?: number;
  /** Warna bagian atas kubah (permukaan laut berjemur cahaya) */
  topColor?: string;
  /** Warna bagian tengah kubah (kedalaman air laut teal Studio Ghibli) */
  midColor?: string;
  /** Warna bagian bawah kubah (kedalaman palung laut gelap) */
  bottomColor?: string;
}

/**
 * Komponen Skydome 360 derajat Bawah Laut:
 * - Membungkus seluruh scene dalam bola raksasa dengan material BackSide opaque.
 * - Mengunci posisi tepat di posisi kamera setiap frame sehingga user tidak pernah bisa keluar dari kubah.
 * - Menutupi 100% video feed kamera fisik di WebXR AR sehingga seluruh pandangan 360° adalah dunia virtual murni,
 *   sementara WebXR 6DoF tetap aktif melacak pergerakan translasi & rotasi fisik user.
 */
export function UnderwaterSkydome({
  radius = 60,
  topColor = "#e64c6c",     // Surface coral-rose waters
  midColor = "#a61438",     // Mid-depth rich crimson ocean
  bottomColor = "#420412",  // Deep velvet burgundy abyss
}: UnderwaterSkydomeProps) {
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(topColor) },
      midColor: { value: new Color(midColor) },
      bottomColor: { value: new Color(bottomColor) },
    }),
    [topColor, midColor, bottomColor]
  );

  // Selalu ikuti posisi kamera (XR maupun desktop) setiap frame
  // dan pastikan warna seragam terupdate saat props berubah
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      uniforms.topColor.value.set(topColor);
      uniforms.midColor.value.set(midColor);
      uniforms.bottomColor.value.set(bottomColor);
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={-1000}>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 midColor;
          uniform vec3 bottomColor;
          varying vec3 vNormal;

          void main() {
            // vNormal.y berkisar dari -1.0 (kutub bawah) ke +1.0 (kutub atas)
            float y = vNormal.y;
            vec3 finalColor;
            if (y > 0.0) {
              finalColor = mix(midColor, topColor, pow(y, 0.75));
            } else {
              finalColor = mix(midColor, bottomColor, pow(-y, 0.85));
            }
            // 100% fully opaque - tidak ada celah kamera pass-through terlihat
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
  );
}
