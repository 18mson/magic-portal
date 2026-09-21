"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

interface SceneLoadingScreenProps {
  onLoaded?: () => void;
}

/**
 * Layar Preloading 3D Elegan & Responsif:
 * - Menggunakan `useProgress` dari @react-three/drei untuk memantau unduhan model GLTF,
 *   tekstur, dan aset WebGL secara real-time (0% - 100%).
 * - Animasi progress bar toska-cyan berpendar ala Studio Ghibli / Abzû.
 * - Efek fade-out transisi halus setelah seluruh aset selesai diinisialisasi ke memori GPU.
 */
export function SceneLoadingScreen({ onLoaded }: SceneLoadingScreenProps) {
  const { active, progress, item, loaded, total } = useProgress();
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animasi lerp halus untuk angka persentase agar tidak melompat kasar
  useEffect(() => {
    const target = Math.round(progress);
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          return Math.min(target, prev + Math.max(1, Math.round((target - prev) * 0.25)));
        }
        return prev;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [progress]);

  // Transisi selesai saat seluruh aset 100% termuat
  useEffect(() => {
    if (!active && progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        const hideTimer = setTimeout(() => {
          setShowOverlay(false);
          onLoaded?.();
        }, 600);
        return () => clearTimeout(hideTimer);
      }, 400);

      return () => clearTimeout(fadeTimer);
    }
  }, [active, progress, onLoaded]);

  if (!showOverlay) {
    return null;
  }

  // Ringkas nama file aset yang sedang dimuat
  const currentFileName = item ? item.split("/").pop() || "Aset 3D" : "Menyiapkan dunia bawah air...";

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-lg px-6 transition-opacity duration-600 select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      <div className="w-full max-w-sm flex flex-col items-center space-y-5 text-center">
        {/* Ikon Portal Bercahaya */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-teal-500/20 blur-xl animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl bg-linear-to-tr from-teal-500/30 to-cyan-400/20 border border-teal-400/40 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-2xl animate-bounce">🌊</span>
          </div>
        </div>

        {/* Judul & Deskripsi */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Memuat Ekosistem 3D</span>
          </h2>
          <p className="text-xs text-slate-400">
            Mempersiapkan satwa laut, karang, dan atmosfer samudra
          </p>
        </div>

        {/* Progress Bar Persentase */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold px-1">
            <span className="text-slate-400">
              {loaded} / {total > 0 ? total : "…"} Aset
            </span>
            <span className="text-teal-400 tabular-nums text-sm font-bold">
              {displayProgress}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-linear-to-r from-teal-500 via-cyan-400 to-sky-400 rounded-full transition-all duration-200 ease-out shadow-lg shadow-cyan-500/50"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        {/* Detail Aset Berjalan */}
        <div className="h-4 flex items-center justify-center">
          <p className="text-[11px] text-slate-500 truncate max-w-xs font-mono">
            {currentFileName}
          </p>
        </div>

        {/* Tips Pengoptimalan */}
        <div className="pt-3 border-t border-slate-900 w-full text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          <span>Optimalisasi WebXR 60 FPS untuk Smartphone aktif</span>
        </div>
      </div>
    </div>
  );
}
