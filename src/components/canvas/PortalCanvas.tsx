"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, NotInXR, XRDomOverlay } from "@react-three/xr";
import { ACESFilmicToneMapping, Mesh } from "three";
import { xrStore } from "@/lib/xrStore";
import { SceneEnvironment } from "./SceneEnvironment";
import { PostProcessingAtmosphere } from "./PostProcessingAtmosphere";

interface PortalCanvasProps {
  isARSessionActive?: boolean;
  onExitAR?: () => void;
  isMuted?: boolean;
  onToggleAudio?: () => void;
  worldScale?: number;
  onCycleScale?: () => void;
  atmosphereMode?: "crimson" | "abyssal";
  onToggleAtmosphere?: () => void;
}

export function PortalCanvas({
  isARSessionActive = false,
  onExitAR,
  isMuted = true,
  onToggleAudio,
  worldScale = 1.0,
  onCycleScale,
  atmosphereMode = "crimson",
  onToggleAtmosphere,
}: PortalCanvasProps) {
  const sunRef = useRef<Mesh | null>(null);

  return (
    <div
      className={`w-full h-full relative transition-colors duration-500 ${
        isARSessionActive ? "bg-transparent" : "bg-slate-950"
      }`}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 0.5], fov: 60, near: 0.05, far: 500 }}
        className="w-full h-full touch-none"
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          scene.background = null;
        }}
      >
        <XR store={xrStore}>
          {/* Kontrol Orbit dan Postprocessing HANYA aktif saat di luar sesi XR untuk stabilitas WebXR di HP */}
          <NotInXR>
            <OrbitControls
              target={[0, 0, -1.4]}
              enableDamping
              dampingFactor={0.05}
              minDistance={0.3}
              maxDistance={4.0}
            />
            <PostProcessingAtmosphere sunRef={sunRef} />
          </NotInXR>

          {/* Objek World-Space: Layered Cutout Diorama */}
          <SceneEnvironment
            sunRef={sunRef}
            worldScale={worldScale}
            atmosphereMode={atmosphereMode}
          />

          {/* WebXR DOM Overlay untuk kontrol in-AR di layar HP */}
          <XRDomOverlay className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 pb-8 z-50 select-none">
            <div className="self-center bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-teal-500/40 text-center shadow-2xl">
              <p className="text-xs font-bold text-teal-400">✨ Sesi AR Aktif (6DoF)</p>
              <p className="text-[11px] text-slate-300">
                Ketuk air untuk pakan &amp; riak gelombang
              </p>
            </div>

            <div className="self-center flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
              {onToggleAtmosphere && (
                <button
                  onClick={onToggleAtmosphere}
                  className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{atmosphereMode === "crimson" ? "☀️ Crimson" : "🌙 Abyssal"}</span>
                </button>
              )}

              {onCycleScale && (
                <button
                  onClick={onCycleScale}
                  className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>📐 {worldScale}x Skala</span>
                </button>
              )}

              <button
                onClick={onToggleAudio}
                className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{isMuted ? "🔇" : "🔊"}</span>
                <span>{isMuted ? "Mute" : "Audio On"}</span>
              </button>

              <button
                onClick={onExitAR}
                className="px-4 py-2 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                Keluar ✕
              </button>
            </div>
          </XRDomOverlay>
        </XR>
      </Canvas>
    </div>
  );
}
