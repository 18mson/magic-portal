"use client";

import { forwardRef } from "react";
import { Mesh, DoubleSide, AdditiveBlending } from "three";

interface UnderwaterSunApertureProps {
  position?: [number, number, number];
  radius?: number;
  color?: string;
}

/**
 * Komponen Sumber Cahaya Permukaan Air (Underwater Sun Aperture):
 * - Ditempatkan di bagian atas permukaan air (y ~ 5.0m) di mana sinar matahari menembus ke kedalaman.
 * - Berfungsi ganda:
 *   1. Objek visual pendaran matahari hangat di permukaan air laut ala Abzû.
 *   2. Target referensi mesh (sun={ref}) untuk GodRaysEffect dari @react-three/postprocessing.
 */
export const UnderwaterSunAperture = forwardRef<Mesh, UnderwaterSunApertureProps>(
  function UnderwaterSunAperture(
    {
      position = [0.8, 5.0, -1.3],
      radius = 0.85,
      color = "#fffbf0",
    },
    ref
  ) {
    return (
      <group position={position}>
        {/* Inti sumber sinar matahari untuk kalkulasi occluding god rays */}
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, 32]} />
          <meshBasicMaterial
            color={color}
            side={DoubleSide}
            transparent={true}
            opacity={0.88}
            depthWrite={false}
          />
        </mesh>

        {/* Lingkar pendaran cahaya hangat di sekeliling aperture */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius * 1.8, 32]} />
          <meshBasicMaterial
            color="#fed7aa"
            side={DoubleSide}
            transparent={true}
            opacity={0.28}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Korona atmosferik keemasan lembut */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius * 2.8, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            side={DoubleSide}
            transparent={true}
            opacity={0.10}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    );
  }
);
