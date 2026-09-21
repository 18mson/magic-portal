"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  ShaderMaterial,
} from "three";

interface ShaftConfig {
  pos: [number, number, number];
  rot: [number, number, number];
  topRadius: number;
  bottomRadius: number;
  height: number;
  intensity: number;
  speed: number;
  phase: number;
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  uniform float time;
  uniform float intensity;
  uniform float phase;
  uniform float speed;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // vUv.y: 0.0 di atas (asal sinar), 1.0 di bawah (kedalaman air)
    // Gunakan power 2.2 agar berkas memudar lembut di air sebelum menyentuh dasar laut
    // Ini mencegah penumpukan cahaya putih pekat di lantai/rumput laut
    float verticalFade = pow(1.0 - vUv.y, 2.2) * smoothstep(0.0, 0.08, vUv.y);

    // Lembutkan pinggiran silinder (fresnel falloff) agar menyerupai kabut cahaya volumetrik
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = abs(dot(normal, viewDir));
    float edgeSoftness = pow(fresnel, 0.7);

    // Animasi gelombang bias air laut halus
    float wave = 0.88 + 0.12 * sin(time * speed + phase + vUv.y * 6.0);

    float alpha = verticalFade * edgeSoftness * intensity * wave;

    gl_FragColor = vec4(color, alpha);
  }
`;

function SingleShaft({
  config,
  sharedTime,
}: {
  config: ShaftConfig;
  sharedTime: { current: number };
}) {
  const matRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      // Warna keemasan hangat pastel khas Abzû (kontras elegan dengan teal laut)
      color: { value: new Color("#fff1cc") },
      time: { value: 0 },
      intensity: { value: config.intensity },
      speed: { value: config.speed },
      phase: { value: config.phase },
    }),
    [config]
  );

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = sharedTime.current;
    }
  });

  return (
    <group position={config.pos} rotation={config.rot}>
      <mesh position={[0, -config.height / 2, 0]}>
        <cylinderGeometry
          args={[config.topRadius, config.bottomRadius, config.height, 32, 1, true]}
        />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Komponen Berkas Cahaya Matahari Volumetrik 3D Ala Abzû:
 * - Berkas sinar matahari menembus dari bukaan air di atas (y = 4.8m - 5.2m)
 *   menyerong lembut ke arah ekosistem karang dan dasar laut.
 * - Rona keemasan hangat pastel (#fff1cc / #ffe3a1) yang subtle, memberikan depth
 *   dan kehangatan visual tanpa menutupi visibilitas ikan maupun terumbu karang.
 * - Efisiensi tinggi: kalkulasi shader murni GPU, aman dan stabil 60 FPS di WebXR AR HP Android.
 */
export function VolumetricLightShafts() {
  const groupRef = useRef<Group>(null);
  const sharedTime = useRef(0);

  useFrame((state) => {
    sharedTime.current = state.clock.getElapsedTime();
  });

  // Berkas sinar matahari menembus dari permukaan air atas ke dalam air
  const shafts: ShaftConfig[] = useMemo(() => {
    return [
      // 1. Berkas Utama: Dari bukaan surya atas menembus ke pusat diorama
      {
        pos: [0.8, 4.8, -1.0],
        rot: [0.18, 0.25, -0.15],
        topRadius: 0.15,
        bottomRadius: 1.1,
        height: 6.2,
        intensity: 0.15, // Subtle & dreamy
        speed: 1.0,
        phase: 0.0,
      },
      {
        pos: [1.3, 4.9, -1.4],
        rot: [0.12, 0.1, -0.22],
        topRadius: 0.2,
        bottomRadius: 1.3,
        height: 6.4,
        intensity: 0.13,
        speed: 1.15,
        phase: 1.8,
      },
      {
        pos: [0.4, 4.7, -0.7],
        rot: [0.22, 0.35, -0.08],
        topRadius: 0.12,
        bottomRadius: 0.95,
        height: 6.0,
        intensity: 0.14,
        speed: 0.9,
        phase: 3.2,
      },

      // 2. Berkas Sekunder: Membiaskan sinar ke area karang depan & samping
      {
        pos: [-0.6, 4.6, -1.1],
        rot: [0.15, -0.2, 0.18],
        topRadius: 0.15,
        bottomRadius: 1.05,
        height: 5.8,
        intensity: 0.12,
        speed: 1.05,
        phase: 0.9,
      },
      {
        pos: [1.8, 4.8, -0.5],
        rot: [0.08, 0.4, -0.25],
        topRadius: 0.18,
        bottomRadius: 1.15,
        height: 6.1,
        intensity: 0.12,
        speed: 1.2,
        phase: 2.4,
      },

      // 3. Berkas Atmosferik Lingkar Luar: Memberikan kedalaman 360°
      {
        pos: [-1.4, 4.5, -2.0],
        rot: [0.2, -0.3, 0.15],
        topRadius: 0.15,
        bottomRadius: 1.0,
        height: 5.9,
        intensity: 0.11,
        speed: 0.95,
        phase: 4.1,
      },
      {
        pos: [2.1, 4.7, -2.2],
        rot: [0.18, 0.3, -0.2],
        topRadius: 0.2,
        bottomRadius: 1.2,
        height: 6.3,
        intensity: 0.11,
        speed: 1.1,
        phase: 5.3,
      },
    ];
  }, []);

  return (
    <group ref={groupRef}>
      {/* Berkas sinar matahari tembus air ala Abzû */}
      {shafts.map((shaft, i) => (
        <SingleShaft key={i} config={shaft} sharedTime={sharedTime} />
      ))}

      {/* Partikel debu plankton / bias air laut keemasan */}
      <Sparkles
        count={70}
        scale={[7.0, 4.5, 7.0]}
        position={[0.5, 1.2, -1.0]}
        size={2.8}
        speed={0.25}
        opacity={0.45}
        color="#fef3c7" // Warm sunlit plankton dust
      />
    </group>
  );
}
