"use client";

import { useEffect, useState, useSyncExternalStore, RefObject } from "react";
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

  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 768 || "ontouchstart" in window,
    () => false
  );

  useEffect(() => {
    if (sunRef.current) {
      setSunMesh(sunRef.current);
    }
  }, [sunRef]);

  // Pada perangkat mobile, lewati GodRays full-screen pass untuk menjaga 60 FPS stabil
  if (!sunMesh || isMobile) {
    return null;
  }

  return (
    <EffectComposer autoClear={false} multisampling={0}>
      <GodRays
        sun={sunMesh}
        blendFunction={BlendFunction.SCREEN}
        samples={28}
        density={0.93}
        decay={0.92}
        weight={0.24}
        exposure={0.36}
        clampMax={0.85}
        kernelSize={KernelSize.SMALL}
        blur={true}
      />
    </EffectComposer>
  );
}
