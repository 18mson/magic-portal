"use client";

import { Suspense } from "react";
import { DioramaWorldSpec, DioramaLayerSpec } from "@/lib/diorama/types";
import { oceanDioramaSpec } from "@/lib/diorama/oceanSpec";
import { DioramaLayer } from "./DioramaLayer";
import { UnderwaterSkydome } from "./UnderwaterSkydome";
import { UnderwaterTerrain } from "./UnderwaterTerrain";
import { CoralReef3D } from "./CoralReef3D";
import { KelpForest3D } from "./KelpForest3D";
import { VolumetricLightShafts } from "./VolumetricLightShafts";

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
        Skydome 360 derajat Opaque:
        Membungkus pandangan 360° secara total dan mengikuti posisi kamera XR
        sehingga video kamera fisik tertutup 100% dari semua sudut,
        sementara 6DoF tracking tetap bekerja.
      */}
      <UnderwaterSkydome />

      {/* 
        Dasar Laut Pasir & Bukit Karang 3D Nyata (Seabed Basin & Hills):
        Menutup lubang tengah dengan lantai pasir utuh, riak pasir alami, dan bukit bervolume.
      */}
      <UnderwaterTerrain />

      {/* 
        Formasi Karang 3D Solid & Anemon:
        Batu karang peach, orange, dan anemon turquoise 3D yang tertanam di atas pasir.
      */}
      <CoralReef3D />

      {/* 
        Hutan Rumput Laut 3D Nyata (3D Volumetric Kelp Forest):
        Bilah daun rumput laut 3D bersilangan yang tertancap di pasir dan meliuk mengikuti arus.
      */}
      <KelpForest3D />

      {/* 
        Berkas Cahaya Matahari 3D Asli (3D Volumetric Sunbeams / Godrays):
        Menyorot tembus ke kedalaman air dengan depth 3D nyata dan partikel debu laut bersinar.
      */}
      <VolumetricLightShafts />

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
