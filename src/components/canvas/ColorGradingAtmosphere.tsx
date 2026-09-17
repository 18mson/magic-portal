"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, DoubleSide } from "three";

/**
 * Komponen Color Grading & Atmosfer Bawah Laut Studio Ghibli (WebXR Compatible):
 * - Memposisikan bidang lensa (atmospheric grading veil) tepat di depan kamera secara presisi
 *   setiap frame, mengikuti orientasi 6DoF dan translasi kepala user di HP / desktop.
 * - Menerapkan soft oceanic teal tint (#164e59) dan soft vignette painterly di tepian layar:
 *   Mengikat seluruh render (terrain, bukit, karang, ikan, rumput laut) ke dalam satu palet
 *   warna air laut yang seragam dan kohesif, meniadakan kesan objek terpisah.
 */
export function ColorGradingAtmosphere() {
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo(
    () => ({
      tintColor: { value: new Color("#660b24") },    // Soft crimson-rose veil
      vignetteDark: { value: new Color("#2b020c") }, // Deep velvet burgundy edge
    }),
    []
  );

  // Kunci posisi dan rotasi tepat di depan kamera setiap frame
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.translateZ(-0.12);
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={9999}>
      <planeGeometry args={[0.32, 0.32]} />
      <shaderMaterial
        transparent={true}
        depthTest={false}
        depthWrite={false}
        side={DoubleSide}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 tintColor;
          uniform vec3 vignetteDark;
          varying vec2 vUv;

          void main() {
            vec2 centerCoord = vUv - vec2(0.5);
            float distFromCenter = length(centerCoord);

            // 1. Soft underwater atmospheric tint di area tengah
            float centerTintAlpha = 0.09;

            // 2. Painterly edge vignette di pinggiran layar
            float vignette = smoothstep(0.26, 0.72, distFromCenter);
            vec3 blendedTone = mix(tintColor, vignetteDark, vignette * 0.7);

            float totalAlpha = centerTintAlpha + vignette * 0.16;

            gl_FragColor = vec4(blendedTone, totalAlpha);
          }
        `}
      />
    </mesh>
  );
}
