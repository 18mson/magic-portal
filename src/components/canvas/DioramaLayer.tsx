"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Billboard } from "@react-three/drei";
import { DoubleSide, Group } from "three";
import { DioramaLayerSpec } from "@/lib/diorama/types";

interface DioramaLayerProps {
  layer: DioramaLayerSpec;
}

export function DioramaLayer({ layer }: DioramaLayerProps) {
  const groupRef = useRef<Group>(null);

  // Memuat tekstur PNG/SVG transparan
  const texture = useTexture(layer.textureUrl);

  // Resolusi dimensi plane
  const [width, height] = Array.isArray(layer.scale)
    ? layer.scale
    : [layer.scale, layer.scale];

  // Animasi idle sway (khusus ikan atau layer dengan konfigurasi motion)
  useFrame((state) => {
    if (!groupRef.current || !layer.motion) return;

    const t = state.clock.getElapsedTime();
    const speed = layer.motion.speed ?? 1.0;
    const phase = layer.motion.phase ?? 0;
    const ampY = layer.motion.amplitudeY ?? 0.04;
    const ampX = layer.motion.amplitudeX ?? 0.06;
    const swayZ = layer.motion.swayZ ?? 0.04;

    const time = t * speed + phase;

    // Gerak vertikal bergelombang halus (sway naik-turun)
    groupRef.current.position.y = layer.position[1] + Math.sin(time) * ampY;

    // Gerak horizontal mengalir santai (sway kiri-kanan)
    groupRef.current.position.x =
      layer.position[0] + Math.cos(time * 0.75) * ampX;

    // Kemiringan badan / sirip saat meluncur
    const baseRotZ = layer.rotation?.[2] ?? 0;
    groupRef.current.rotation.z = baseRotZ + Math.sin(time) * swayZ;
  });

  const shouldBillboardHorizontal =
    layer.billboard === "horizontal" ||
    (layer.category === "fish" && layer.billboard !== "none");

  const shouldBillboardFull = layer.billboard === "all";

  // Konten mesh bidang 2D cutout
  const planeContent = (
    <mesh
      scale={layer.flipX ? [-1, 1, 1] : undefined}
      rotation={
        shouldBillboardHorizontal || shouldBillboardFull
          ? undefined
          : layer.rotation
      }
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={layer.alphaTest ?? 0.05}
        depthWrite={true}
        roughness={0.65}
        metalness={0.05}
        opacity={layer.opacity ?? 1.0}
        side={DoubleSide}
      />
    </mesh>
  );

  return (
    <group
      ref={groupRef}
      position={layer.position}
      rotation={layer.rotation}
    >
      {shouldBillboardHorizontal ? (
        // Billboard parsial: hanya rotasi yaw (sumbu Y), mengunci X dan Z
        <Billboard follow={true} lockX={true} lockZ={true}>
          {planeContent}
        </Billboard>
      ) : shouldBillboardFull ? (
        // Billboard penuh
        <Billboard follow={true}>
          {planeContent}
        </Billboard>
      ) : (
        planeContent
      )}
    </group>
  );
}
