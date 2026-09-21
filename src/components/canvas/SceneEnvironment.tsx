"use client";

import { Suspense } from "react";
import { DioramaWorldSpec, DioramaLayerSpec } from "@/lib/diorama/types";
import { crimsonTwilightSpec, abyssalMidnightSpec } from "@/lib/diorama/oceanSpec";
import { DioramaLayer } from "./DioramaLayer";
import { UnderwaterSkydome } from "./UnderwaterSkydome";
import { UnderwaterTerrain } from "./UnderwaterTerrain";
import { CoralReef3D } from "./CoralReef3D";
import { KelpForest3D } from "./KelpForest3D";
import { VolumetricLightShafts } from "./VolumetricLightShafts";
import { AutonomousMarineLife } from "./AutonomousMarineLife";

import { ColorGradingAtmosphere } from "./ColorGradingAtmosphere";
import { InteractiveWaterSurface } from "./InteractiveWaterSurface";
import { PortalFrame } from "./PortalFrame";
import { UnderwaterSunAperture } from "./UnderwaterSunAperture";
import { Mesh } from "three";
import { RefObject } from "react";

export interface SceneEnvironmentProps {
  /** Spesifikasi lengkap diorama (opsional) */
  spec?: DioramaWorldSpec;
  /** Daftar layer kustom (opsional) */
  layers?: DioramaLayerSpec[];
  /** Skala dunia diorama: 0.4 (Tabletop), 1.0 (Room-scale), 1.8 (Life-size) */
  worldScale?: number;
  /** Mode atmosfer ekosistem laut: crimson vs abyssal */
  atmosphereMode?: "crimson" | "abyssal";
  /** Referensi target sun mesh untuk God Rays postprocessing */
  sunRef?: RefObject<Mesh | null>;
}

export function SceneEnvironment({
  spec,
  layers,
  worldScale = 1.0,
  atmosphereMode = "crimson",
  sunRef,
}: SceneEnvironmentProps) {
  const activeSpec = spec ?? (atmosphereMode === "abyssal" ? abyssalMidnightSpec : crimsonTwilightSpec);
  const activeLayers = layers ?? activeSpec.layers;

  return (
    <group>
      {/* 
        Skydome 360 derajat Opaque:
        Membungkus pandangan 360° secara total dan mengikuti posisi kamera XR.
        Warna menyesuaikan secara dinamis antara mode Crimson Twilight vs Abyssal Midnight.
      */}
      <UnderwaterSkydome
        topColor={atmosphereMode === "abyssal" ? "#0284c7" : "#e64c6c"}
        midColor={atmosphereMode === "abyssal" ? "#0a192f" : "#a61438"}
        bottomColor={atmosphereMode === "abyssal" ? "#020617" : "#420412"}
      />

      {/* Kontainer Transformasi Skala Adaptif Dunia AR (0.4x Tabletop s/d 1.8x Life-Size) */}
      <group scale={[worldScale, worldScale, worldScale]}>
        {/* Dasar Laut Pasir & Bukit Karang 3D Nyata */}
        <UnderwaterTerrain />

        {/* Formasi Karang 3D Solid & Anemon Organik */}
        <CoralReef3D />

        {/* Hutan Rumput Laut 3D Nyata */}
        <KelpForest3D />

        {/* Sumber Penetrasi Sinar Matahari di Permukaan Air (Abzû Sun Aperture) */}
        <UnderwaterSunAperture ref={sunRef} position={[0.9, 4.9, -1.1]} />

        {/* Berkas Cahaya Matahari / Bulan Tembus Kedalaman Air */}
        <VolumetricLightShafts />

        {/* Simulasi Satwa Laut Hidup 360° (Autonomous Marine Life AI) */}
        <Suspense fallback={null}>
          <AutonomousMarineLife />
        </Suspense>

        {/* Interaktivitas Pakan Ikan, Riak Gelombang, & Letupan Gelembung */}
        <InteractiveWaterSurface />

        {/* Rangkaian Layer Cutout Tambahan jika ada */}
        {activeLayers.length > 0 && (
          <Suspense fallback={null}>
            {activeLayers.map((layer) => (
              <DioramaLayer key={layer.id} layer={layer} />
            ))}
          </Suspense>
        )}
      </group>

      {/* Fog atmosferik yang beradaptasi dengan mode siang/malam */}
      <fogExp2 attach="fog" args={[activeSpec.fog.color, activeSpec.fog.density]} />

      {/* Pencahayaan terarah & ambient alami */}
      <ambientLight
        color={activeSpec.lighting.ambientColor}
        intensity={activeSpec.lighting.ambientIntensity}
      />

      {/* Hemisphere Light: gradien cahaya kubah laut */}
      <hemisphereLight
        color={atmosphereMode === "abyssal" ? "#38bdf8" : "#e04868"}
        groundColor={atmosphereMode === "abyssal" ? "#020617" : "#3d0512"}
        intensity={atmosphereMode === "abyssal" ? 0.55 : 0.75}
      />

      <directionalLight
        position={activeSpec.lighting.sunPosition}
        color={activeSpec.lighting.sunColor}
        intensity={activeSpec.lighting.sunIntensity}
      />

      {/* Color Grading & Atmospheric Painterly Veil (WebXR Compatible) */}
      <ColorGradingAtmosphere />

      {/* Ambang Batas Pintu Portal Magis (Magic Window Portal Frame) */}
      <PortalFrame />
    </group>
  );
}
