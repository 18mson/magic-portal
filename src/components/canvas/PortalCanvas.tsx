"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, NotInXR } from "@react-three/xr";
import { xrStore } from "@/lib/xrStore";
import { SceneEnvironment } from "./SceneEnvironment";

interface PortalCanvasProps {
  isARSessionActive?: boolean;
}

export function PortalCanvas({ isARSessionActive = false }: PortalCanvasProps) {
  return (
    <div
      className={`w-full h-full relative transition-colors duration-500 ${
        isARSessionActive ? "bg-transparent" : "bg-slate-950"
      }`}
    >
      <Canvas
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 0.5], fov: 60 }}
        className="w-full h-full touch-none"
      >
        <XR store={xrStore}>
          {/* Pencahayaan Scene */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[2, 5, 2]} intensity={1.5} />

          {/* Kontrol Orbit HANYA aktif saat di luar sesi XR */}
          <NotInXR>
            <OrbitControls enableDamping dampingFactor={0.05} />
          </NotInXR>

          {/* Objek World-Space */}
          <SceneEnvironment />
        </XR>
      </Canvas>
    </div>
  );
}
