"use client";

import { Suspense } from "react";
import { DioramaWorldSpec, DioramaLayerSpec } from "@/lib/diorama/types";
import { oceanDioramaSpec } from "@/lib/diorama/oceanSpec";
import { DioramaLayer } from "./DioramaLayer";

export interface SceneEnvironmentProps {
  /** Spesifikasi lengkap diorama (opsional, default: oceanDioramaSpec) */
  spec?: DioramaWorldSpec;
  /** Daftar layer kustom (opsional, jika ingin override array layers saja) */
  layers?: DioramaLayerSpec[];
}

export function SceneEnvironment({
  spec = oceanDioramaSpec,
  layers,
}: SceneEnvironmentProps) {
  const activeLayers = layers ?? spec.layers;

  return (
    <group>
      {/* 
        Fog hangat (THREE.FogExp2) berwarna teal-cream ala Studio Ghibli.
        Menyatukan layer kejauhan secara lembut dengan kedalaman air laut.
      */}
      <fogExp2 attach="fog" args={[spec.fog.color, spec.fog.density]} />

      {/* Pencahayaan terarah & ambient alami sesuai spesifikasi dunia */}
      <ambientLight
        color={spec.lighting.ambientColor}
        intensity={spec.lighting.ambientIntensity}
      />
      <directionalLight
        position={spec.lighting.sunPosition}
        color={spec.lighting.sunColor}
        intensity={spec.lighting.sunIntensity}
      />

      {/* Rangkaian Layer Cutout Diorama dengan kedalaman Z bertingkat */}
      <Suspense fallback={null}>
        {activeLayers.map((layer) => (
          <DioramaLayer key={layer.id} layer={layer} />
        ))}
      </Suspense>
    </group>
  );
}
