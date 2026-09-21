"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Color,
  IUniform,
} from "three";
import { SkeletonUtils } from "three-stdlib";
import { marineLifeRegistry } from "@/lib/simulation/marineLifeRegistry";

interface PastelAnemoneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  tentacleTint?: string; // Variasi rona warna tentakel (default: #c4ede5)
  glowColor?: string;    // Warna pendaran bioluminescent saat berinteraksi
}

/**
 * Komponen Anemon Laut Pastel 3D Nyata (Pastel Anemone):
 * - Menggunakan model 3D realistis `anemone_pastel.glb` menggantikan aset silinder low-poly lama.
 * - Animasi Arus Samudra Prosedural (Harmonic Vertex Wave):
 *   Tentakel meliuk gemulai mengikuti ritme arus bawah laut tanpa skeletal overhead.
 * - Interaksi Simbiosis dengan Ikan Badut (Clownfish Nuzzling & Brushing):
 *   Saat ikan badut mendekat atau bersarang di dalam rumbai, tentakel menyibak lembut,
 *   merespons dengan getaran riak halus, dan memancarkan pendaran bioluminescent hangat.
 */
export function PastelAnemone({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.042,
  tentacleTint,
}: PastelAnemoneProps) {
  const groupRef = useRef<Group>(null);
  const tentacleMeshRef = useRef<Mesh | null>(null);

  // Load GLTF Model
  const { scene } = useGLTF("/models/anemone_pastel.glb");

  // Uniforms shader untuk animasi tentakel & interaksi
  const uniformsRef = useRef<{
    uTime: IUniform<number>;
    uLocalFishPos: IUniform<Vector3>;
    uClownfishProximity: IUniform<number>;
  }>({
    uTime: { value: 0 },
    uLocalFishPos: { value: new Vector3(999, 999, 999) },
    uClownfishProximity: { value: 0 },
  });

  // Nilai lerp interaksi halus
  const currentProximityRef = useRef<number>(0);
  const tempWorldPosRef = useRef<Vector3>(new Vector3());
  const tempLocalFishRef = useRef<Vector3>(new Vector3());

  // Kloning scene independen untuk tiap rumpun anemon
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);

    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = false;
        child.receiveShadow = true;
        child.frustumCulled = true;

        // Kloning material agar tiap rumpun memiliki warna & pengaturan unik
        if (child.material) {
          const origMat = child.material as MeshStandardMaterial;
          const mat = origMat.clone();

          if (child.name === "Node-Mesh") {
            if (tentacleTint) {
              mat.color = new Color(tentacleTint);
            }
            mat.roughness = 0.35;
            mat.metalness = 0.05;
          } else {
            mat.roughness = 0.85;
            mat.metalness = 0.02;
          }

          child.material = mat;
        }
      }
    });

    return clone;
  }, [scene, tentacleTint]);

  // Injeksi shader vertex & fragment setelah kloning terpasang (Outside render)
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof Mesh && child.name === "Node-Mesh") {
        tentacleMeshRef.current = child;

        const mat = child.material as MeshStandardMaterial;
        if (mat) {
          mat.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = uniformsRef.current.uTime;
            shader.uniforms.uLocalFishPos = uniformsRef.current.uLocalFishPos;
            shader.uniforms.uClownfishProximity = uniformsRef.current.uClownfishProximity;

            shader.vertexShader = `
              uniform float uTime;
              uniform vec3 uLocalFishPos;
              uniform float uClownfishProximity;
              ${shader.vertexShader}
            `;

            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              `
              #include <begin_vertex>

              // 1. Gelombang Arus Air Bawah Laut (Harmonic Ocean Current Sway)
              // Pangkal bawah (y ~ 0) menempel kokoh, ujung atas tentakel meliuk fleksibel
              float hNorm = clamp(position.y / 6.8, 0.0, 1.0);
              float waveAmp = hNorm * hNorm * 0.42;

              float swayX = sin(uTime * 1.5 + position.x * 0.5 + position.z * 0.4) * waveAmp;
              float swayZ = cos(uTime * 1.2 + position.x * 0.4 - position.z * 0.5) * waveAmp;
              float swayY = sin(uTime * 2.0 + position.x * 0.6) * waveAmp * 0.22;

              transformed += vec3(swayX, swayY, swayZ);

              // 2. Interaksi Sentuhan Ikan Badut (Clownfish Brushing & Nuzzling)
              if (uClownfishProximity > 0.001) {
                float distToFish = distance(position, uLocalFishPos);
                float touchRadius = 8.8; // Radius interaksi dalam satuan ruang lokal model (~0.37m dunia)

                if (distToFish < touchRadius) {
                  float touchFactor = (1.0 - (distToFish / touchRadius)) * uClownfishProximity;
                  vec3 pushDir = normalize(position - uLocalFishPos + vec3(0.0001));

                  // Tentakel menyibak lembut saat ditembus tubuh ikan
                  transformed += pushDir * touchFactor * hNorm * 1.35;

                  // Riak getaran halus tentakel (tentacle brushing tickle)
                  float ripple = sin(uTime * 7.5 + position.y * 2.5) * 0.18 * touchFactor * hNorm;
                  transformed.x += ripple;
                  transformed.z += ripple;
                }
              }
              `
            );

            // Tambahkan pendaran bioluminescent hangat saat ikan badut bersarang
            shader.fragmentShader = `
              uniform float uClownfishProximity;
              ${shader.fragmentShader}
            `;

            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <emissivemap_fragment>",
              `
              #include <emissivemap_fragment>
              if (uClownfishProximity > 0.01) {
                // Pendaran hangat toska/pastel saat ikan badut menyentuh anemon
                vec3 snuggleGlow = vec3(0.12, 0.42, 0.38) * uClownfishProximity * 0.8;
                totalEmissiveRadiance += snuggleGlow;
              }
              `
            );
          };
          mat.needsUpdate = true;
        }
      }
    });
  }, [clonedScene]);

  // Loop pembaruan per frame (60 FPS, 0 Garbage Collection)
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    const grp = groupRef.current;
    if (!grp) return;

    // 1. Pembaruan Waktu Shader
    uniformsRef.current.uTime.value += clampedDelta;

    // 2. Deteksi Jarak Ikan Badut Terdekat (Mendukung semua ikan badut di akuarium)
    const tempWorldPos = tempWorldPosRef.current;
    const tempLocalFish = tempLocalFishRef.current;
    grp.getWorldPosition(tempWorldPos);

    const closestClown = marineLifeRegistry.getClosestClownfish(tempWorldPos);
    let closestDist = Infinity;
    let closestFishPos: Vector3 | null = null;

    if (closestClown) {
      closestDist = tempWorldPos.distanceTo(closestClown.position);
      closestFishPos = closestClown.position;
    }

    // 3. Menghitung Tingkat Interaksi Simbiosis (Proximity)
    const interactionThreshold = 0.48; // Jarak interaksi (~48cm)
    let targetProximity = 0;

    if (closestFishPos && closestDist < interactionThreshold) {
      targetProximity = Math.pow(1.0 - closestDist / interactionThreshold, 1.2);

      // Konversi koordinat dunia ikan badut ke koordinat lokal mesh anemon
      if (tentacleMeshRef.current) {
        tempLocalFish.copy(closestFishPos);
        tentacleMeshRef.current.worldToLocal(tempLocalFish);
        uniformsRef.current.uLocalFishPos.value.copy(tempLocalFish);
      }
    }

    // Lerp mulus agar transisi menyibak & mengembang alami
    currentProximityRef.current +=
      (targetProximity - currentProximityRef.current) * Math.min(1.0, clampedDelta * 4.5);
    uniformsRef.current.uClownfishProximity.value = currentProximityRef.current;

    // 4. Ritme Bernapas Halus Rumpun Anemon (Subtle Ocean Breathing Pulse)
    const t = uniformsRef.current.uTime.value;
    const breathe = 1.0 + Math.sin(t * 1.6) * 0.015;
    grp.scale.set(scale * breathe, scale * breathe, scale * breathe);
    grp.rotation.z = rotation[2] + Math.sin(t * 1.1) * 0.02;
    grp.rotation.x = rotation[0] + Math.cos(t * 0.9) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload model anemone pastel
useGLTF.preload("/models/anemone_pastel.glb");
