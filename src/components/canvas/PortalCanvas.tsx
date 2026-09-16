"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, NotInXR, XRDomOverlay } from "@react-three/xr";
import { xrStore } from "@/lib/xrStore";
import { SceneEnvironment } from "./SceneEnvironment";

interface PortalCanvasProps {
  isARSessionActive?: boolean;
  onExitAR?: () => void;
}

export function PortalCanvas({
  isARSessionActive = false,
  onExitAR,
}: PortalCanvasProps) {
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
          scene.background = null;
        }}
      >
        <XR store={xrStore}>
          {/* Kontrol Orbit HANYA aktif saat di luar sesi XR */}
          <NotInXR>
            <OrbitControls
              target={[0, 0, -1.4]}
              enableDamping
              dampingFactor={0.05}
              minDistance={0.3}
              maxDistance={4.0}
            />
          </NotInXR>

          {/* Objek World-Space: Layered Cutout Diorama */}
          <SceneEnvironment />

          {/* WebXR DOM Overlay untuk kontrol in-AR di layar HP */}
          <XRDomOverlay className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 pb-8 z-50 select-none">
            <div className="self-center bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-teal-500/40 text-center shadow-2xl">
              <p className="text-xs font-bold text-teal-400">✨ Sesi AR Aktif (6DoF)</p>
              <p className="text-[11px] text-slate-300">
                Geser HP ke samping/maju/mundur untuk merasakan kedalaman parallax diorama
              </p>
            </div>

            <div className="self-center pointer-events-auto">
              <button
                onClick={onExitAR}
                className="px-6 py-2.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-sm font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                Keluar AR ✕
              </button>
            </div>
          </XRDomOverlay>
        </XR>
      </Canvas>
    </div>
  );
}
