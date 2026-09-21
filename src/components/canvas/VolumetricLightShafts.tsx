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
    // 1. Penetrasi Cahaya Vertikal: Menembus ke kedalaman air secara halus
    float topFade = smoothstep(0.0, 0.05, vUv.y);
    float bottomFade = smoothstep(1.0, 0.82, vUv.y);
    float verticalPenetration = pow(1.0 - vUv.y * 0.75, 1.25) * topFade * bottomFade;

    // 2. Lembutkan pinggiran silinder (volumetric fresnel falloff halus)
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = abs(dot(normal, viewDir));
    float edgeSoftness = pow(fresnel, 0.68);

    // 3. Garis-garis bias caustics dinamis dalam berkas cahaya matahari (sunbeam caustics streaks)
    float caustics = 0.82 + 0.18 * sin(vUv.x * 24.0 + time * speed * 0.8 + phase) * sin(vUv.y * 7.0 - time * 0.25);
    float pulse = 0.92 + 0.08 * sin(time * speed * 1.1 + phase);

    // 4. Alpha komposit elegan tanpa memutihkan air laut
    float alpha = verticalPenetration * edgeSoftness * intensity * caustics * pulse;

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
      // Rona keemasan hangat surya tropis (Sunlit Golden Glow)
      color: { value: new Color("#fff4cc") },
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
 * Komponen Berkas Cahaya Matahari Volumetrik 3D:
 * - Jumlah berkas ramping (5 berkas tunggal), tidak menumpuk di tengah.
 * - Menyebar luas melintasi seluruh bentang eksplorasi samudra 24 meter:
 *   1. Sisi Barat / Hutan Kelp (X = -2.6)
 *   2. Palung Horizon Barat Laut / Jalur Hiu (X = -3.8, Z = -3.6)
 *   3. Pusat Karang Utama (X = +0.6, Z = -1.3, satu berkas bersih)
 *   4. Sisi Timur / Gugusan Karang Kanan (X = +2.2)
 *   5. Horizon Samudra Timur Laut / Jalur Orca (X = +3.8, Z = -3.8)
 */
export function VolumetricLightShafts() {
  const groupRef = useRef<Group>(null);
  const sharedTime = useRef(0);

  useFrame((state) => {
    sharedTime.current = state.clock.getElapsedTime();
  });

  // 5 berkas cahaya terdistribusi jauh lebih renggang ke seluruh penjuru samudra (lebar renggang ~4-6 meter antar berkas)
  const shafts: ShaftConfig[] = useMemo(() => {
    return [
      // 1. Berkas Jauh Barat: Menembus ke area hutan kelp & kanopi karang barat kejauhan
      {
        pos: [-5.2, 5.1, -2.8],
        rot: [0.12, -0.28, 0.22],
        topRadius: 0.16,
        bottomRadius: 1.05,
        height: 7.2,
        intensity: 0.22,
        speed: 1.0,
        phase: 0.8,
      },

      // 2. Berkas Palung Barat Laut: Menembus ke palung laut dalam jalur patroli hiu
      {
        pos: [-4.2, 5.2, -6.2],
        rot: [0.22, -0.18, 0.14],
        topRadius: 0.18,
        bottomRadius: 1.15,
        height: 7.8,
        intensity: 0.19,
        speed: 0.85,
        phase: 2.3,
      },

      // 3. Berkas Pusat Karang Utama: SATU berkas ramping terfokus anggun di celah karang tengah
      {
        pos: [0.2, 5.1, -1.8],
        rot: [0.14, 0.05, -0.06],
        topRadius: 0.18,
        bottomRadius: 0.95,
        height: 7.0,
        intensity: 0.25,
        speed: 1.1,
        phase: 0.0,
      },

      // 4. Berkas Jauh Timur: Menembus ke gugusan karang anemon pastel timur kejauhan
      {
        pos: [4.8, 5.1, -2.6],
        rot: [0.10, 0.30, -0.22],
        topRadius: 0.16,
        bottomRadius: 1.05,
        height: 7.2,
        intensity: 0.22,
        speed: 1.05,
        phase: 3.1,
      },

      // 5. Berkas Palung Timur Laut: Menembus ke samudra lepas cakrawala jalur Orca
      {
        pos: [4.6, 5.2, -6.5],
        rot: [0.20, 0.22, -0.14],
        topRadius: 0.18,
        bottomRadius: 1.15,
        height: 7.8,
        intensity: 0.19,
        speed: 0.95,
        phase: 4.5,
      },
    ];
  }, []);

  return (
    <group ref={groupRef}>
      {/* Berkas sinar matahari tembus air bersih & anggun */}
      {shafts.map((shaft, i) => (
        <SingleShaft key={i} config={shaft} sharedTime={sharedTime} />
      ))}

      {/* Partikel debu plankton keemasan lembut */}
      <Sparkles
        count={65}
        scale={[18.0, 5.5, 18.0]}
        position={[0.0, 1.5, -2.5]}
        size={2.6}
        speed={0.22}
        opacity={0.35}
        color="#fef3c7"
      />
    </group>
  );
}
