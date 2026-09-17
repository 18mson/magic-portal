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

function SingleShaft({ config }: { config: ShaftConfig }) {
  const matRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      // Warna hangat pink-gold khas ilustrasi
      color: { value: new Color("#ffd4df") },
      time: { value: 0 },
      intensity: { value: config.intensity },
      speed: { value: config.speed },
      phase: { value: config.phase },
    }),
    [config]
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = state.clock.getElapsedTime();
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
 * Mengonversi sudut derajat, radius jarak dari tengah user, dan tinggi Y
 * untuk menaruh titik asal berkas cahaya secara tersebar melingkar 360°.
 */
function polarToXYZ(
  deg: number,
  radius: number,
  y: number
): [number, number, number] {
  const rad = (deg * Math.PI) / 180;
  return [
    Number((radius * Math.sin(rad)).toFixed(3)),
    y,
    Number((-radius * Math.cos(rad)).toFixed(3)),
  ];
}

/**
 * Komponen Berkas Cahaya Matahari Volumetrik 3D:
 * Berkas cahaya disebar merata di sekeliling 360 derajat dengan jarak radius aman (2.2m – 3.8m)
 * sehingga tidak menumpuk di 1 titik dan memberikan suasana tembus cahaya dari segala arah.
 */
export function VolumetricLightShafts() {
  const groupRef = useRef<Group>(null);

  // 10 berkas cahaya tersebar di 360 derajat (North, NE, East, SE, South, SW, West, NW)
  const shafts: ShaftConfig[] = useMemo(() => {
    const rawConfigs = [
      // Sektor Depan (Jarak jauh di belakang karang utama, bukan di depan mata)
      { deg: 350, r: 3.2, y: 3.6, rot: [0.12, 0.05, -0.06], in: 0.18, spd: 1.1 },
      { deg: 25,  r: 2.8, y: 3.5, rot: [0.08, 0.15, -0.1],  in: 0.17, spd: 1.3 },
      { deg: 320, r: 3.0, y: 3.6, rot: [0.1, -0.12, 0.08],  in: 0.16, spd: 1.0 },

      // Sektor Kanan (East / North-East)
      { deg: 65,  r: 3.4, y: 3.7, rot: [0.05, 0.25, -0.15], in: 0.19, spd: 1.2 },
      { deg: 105, r: 2.9, y: 3.5, rot: [-0.06, 0.2, -0.12], in: 0.17, spd: 1.4 },

      // Sektor Belakang (South / South-East)
      { deg: 150, r: 3.3, y: 3.6, rot: [-0.14, 0.15, -0.08], in: 0.18, spd: 1.0 },
      { deg: 190, r: 3.1, y: 3.5, rot: [-0.16, -0.05, 0.06], in: 0.17, spd: 1.3 },

      // Sektor Kiri (West / South-West)
      { deg: 235, r: 3.2, y: 3.6, rot: [-0.08, -0.22, 0.14], in: 0.18, spd: 1.1 },
      { deg: 275, r: 3.5, y: 3.7, rot: [0.04, -0.25, 0.15],  in: 0.19, spd: 1.2 },

      // Berkas vertikal lembut di atas kuadran luar
      { deg: 15,  r: 4.0, y: 3.9, rot: [0.06, 0.1, -0.08],   in: 0.15, spd: 0.9 },
    ];

    return rawConfigs.map((c, idx) => ({
      pos: polarToXYZ(c.deg, c.r, c.y),
      rot: c.rot as [number, number, number],
      topRadius: 0.1,
      bottomRadius: 0.85,
      height: 5.8,
      intensity: c.in,
      speed: c.spd,
      phase: (idx * 1.6) % (Math.PI * 2),
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {/* 10 berkas cahaya tersebar merata 360° */}
      {shafts.map((shaft, i) => (
        <SingleShaft key={i} config={shaft} />
      ))}

      {/* Partikel debu laut / plankton melayang merata di sekeliling 360 derajat */}
      <Sparkles
        count={80}
        scale={[8.0, 4.0, 8.0]}
        position={[0, 0.3, 0]}
        size={3.0}
        speed={0.3}
        opacity={0.5}
        color="#fbcfe8"
      />
    </group>
  );
}
