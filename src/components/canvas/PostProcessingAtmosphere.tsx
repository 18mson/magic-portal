"use client";

import { useEffect, useState, RefObject } from "react";
import { EffectComposer, GodRays } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Mesh } from "three";

interface PostProcessingAtmosphereProps {
  sunRef: RefObject<Mesh | null>;
}

/**
 * Komponen Postprocessing Atmosferik (God Rays ala Abzû):
 * - Menggunakan GodRays dari @react-three/postprocessing untuk menghasilkan berkas
 *   cahaya radial screen-space ketika user memandang ke arah permukaan air atas.
 * - Dikonfigurasi lembut (subtle): rona keemasan hangat, tidak menyilaukan,
 *   dan tidak menutupi visibilitas kawanan ikan maupun terumbu karang.
 * - Di PortalCanvas, komponen ini diwadahi dalam <NotInXR> sehingga otomatis dinonaktifkan
 *   saat sesi WebXR AR aktif, menjaga stabilitas framebuffer WebXR di HP Android.
 */
export function PostProcessingAtmosphere({ sunRef }: PostProcessingAtmosphereProps) {
  const [sunMesh, setSunMesh] = useState<Mesh | null>(null);

  useEffect(() => {
    if (sunRef.current) {
      setSunMesh(sunRef.current);
    }
  }, [sunRef]);

  if (!sunMesh) {
    return null;
  }

  return (
    <EffectComposer autoClear={false} multisampling={0}>
      <GodRays
        sun={sunMesh}
        blendFunction={BlendFunction.SCREEN}
        samples={36}          // Ringan untuk GPU smartphone
        density={0.93}
        decay={0.92}
        weight={0.24}         // Nilai halus agar tidak dominan
        exposure={0.36}       // Subtle atmospheric depth
        clampMax={0.85}
        kernelSize={KernelSize.SMALL}
        blur={true}
      />
    </EffectComposer>
  );
}
