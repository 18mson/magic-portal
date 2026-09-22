"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { PortalCanvas } from "@/components/canvas/PortalCanvas";
import { xrStore, checkARSupport, ARSupportStatus } from "@/lib/xrStore";
import { underwaterAudio } from "@/lib/audio/underwaterAudio";

export default function ARPage() {
  // Track client mounting safely without cascading re-renders
  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
  const [supportStatus, setSupportStatus] = useState<ARSupportStatus>("CHECKING");
  const [isARActive, setIsARActive] = useState(false);
  const [isEnteringAR, setIsEnteringAR] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [worldScale, setWorldScale] = useState(1.0);
  const [atmosphereMode, setAtmosphereMode] = useState<"crimson" | "abyssal">("crimson");
  const [showWaterHint, setShowWaterHint] = useState(true);
  const [showARCard, setShowARCard] = useState(true);

  // Otomatis sembunyikan petunjuk air laut dan kartu AR setelah 2 detik pada awal load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWaterHint(false);
      setShowARCard(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = underwaterAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleCycleScale = () => {
    setWorldScale((prev) => (prev === 1.0 ? 0.4 : prev === 0.4 ? 1.8 : 1.0));
  };

  const handleToggleAtmosphere = () => {
    setAtmosphereMode((prev) => (prev === "crimson" ? "abyssal" : "crimson"));
  };

  useEffect(() => {
    // Cek kapabilitas WebXR AR
    checkARSupport().then((status) => {
      setSupportStatus(status);
    });

    // Subscribe ke perubahan session XR
    const unsubscribe = xrStore.subscribe((state) => {
      const active = Boolean(state.session);
      setIsARActive(active);
      if (active) {
        document.documentElement.classList.add("ar-session-active");
        document.body.classList.add("ar-session-active");
      } else {
        document.documentElement.classList.remove("ar-session-active");
        document.body.classList.remove("ar-session-active");
        setIsEnteringAR(false);
      }
    });

    return () => {
      unsubscribe();
      document.documentElement.classList.remove("ar-session-active");
      document.body.classList.remove("ar-session-active");
    };
  }, []);

  const handleEnterAR = async () => {
    try {
      setIsEnteringAR(true);
      setErrorMessage(null);
      const session = await xrStore.enterAR();
      if (!session) {
        setErrorMessage("Tidak dapat memulai sesi AR. Pastikan izin kamera diberikan.");
        setIsEnteringAR(false);
      }
    } catch (err) {
      console.error("Gagal masuk AR:", err);
      setErrorMessage(err instanceof Error ? err.message : "Gagal menginisialisasi sesi AR");
      setIsEnteringAR(false);
    }
  };

  const handleExitAR = () => {
    try {
      const session = xrStore.getState().session;
      if (session) {
        session.end();
      }
    } catch (err) {
      console.error("Gagal mengakhiri sesi AR:", err);
    }
  };

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-300">Memuat Portal 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`w-screen h-screen overflow-hidden relative select-none transition-colors duration-300 ${isARActive ? "bg-transparent" : "bg-slate-950"
        }`}
    >
      {/* 3D Canvas with WebXR */}
      <PortalCanvas
        isARSessionActive={isARActive}
        onExitAR={handleExitAR}
        isMuted={isMuted}
        onToggleAudio={handleToggleAudio}
        worldScale={worldScale}
        onCycleScale={handleCycleScale}
        atmosphereMode={atmosphereMode}
        onToggleAtmosphere={handleToggleAtmosphere}
      />

      {/* Header navigasi (hanya saat tidak di dalam AR penuh) */}
      {!isARActive && (
        <>
          <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-white shadow-lg pointer-events-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-400 tracking-wider uppercase">
                Milestone 6
              </span>
              <span className="text-xs text-slate-400">Atmospheric Deep Immersion</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
              <button
                onClick={handleToggleAtmosphere}
                className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-xs font-medium text-white transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                title="Beralih Suasana Ekosistem"
              >
                <span>{atmosphereMode === "crimson" ? "☀️ Crimson" : "🌙 Abyssal"}</span>
              </button>

              <button
                onClick={handleCycleScale}
                className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-xs font-medium text-white transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                title="Ubah Skala Diorama (0.4x Meja / 1.0x Ruang / 1.8x Penuh)"
              >
                <span>📐 {worldScale}x Skala</span>
              </button>

              <button
                onClick={handleToggleAudio}
                className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-xs font-medium text-white transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                title="Toggle Suara Bawah Air"
              >
                <span>{isMuted ? "🔇" : "🔊"}</span>
                <span className="hidden sm:inline">{isMuted ? "Suara Bisu" : "Suara Aktif"}</span>
              </button>

              {/* Tombol pemicu / toggle popup AR card di desktop atau mobile */}
              <button
                onClick={() => setShowARCard((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-medium transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer ${showARCard
                    ? "bg-teal-500/20 border-teal-500/50 text-teal-300"
                    : "bg-slate-900/85 hover:bg-slate-800 border-slate-800 text-teal-400 hover:text-teal-300"
                  }`}
                title="Buka / Tutup Panel Info Mode AR"
              >
                <span>🥽</span>
                <span>Mode AR</span>
              </button>

              <Link
                href="/"
                className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-xs font-medium text-white transition-colors shadow-lg"
              >
                ← Beranda
              </Link>
            </div>
          </header>

          {/* Petunjuk pakan air laut (tampil 2 detik pertama) */}
          <div
            className={`absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-700 ease-out ${showWaterHint
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-2 scale-95"
              }`}
          >
            <div className="bg-slate-950/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-teal-500/30 text-center shadow-lg text-[11px] text-teal-300">
              ✨ Ketuk air laut untuk memberi pakan &amp; menciptakan riak gelombang
            </div>
          </div>
        </>
      )}

      {/* Pesan Error Banner jika ada */}
      {errorMessage && (
        <div className="absolute top-16 left-4 right-4 z-40 p-3 bg-red-950/90 border border-red-500/60 rounded-xl text-white text-xs backdrop-blur-md shadow-xl flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-red-300">Pemberitahuan</p>
            <p className="mt-0.5 text-slate-300">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white text-base px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* In-Session AR Controls (tampil saat AR aktif) */}
      {isARActive && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 pb-8">
          <div className="self-center bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-teal-500/40 text-center shadow-2xl">
            <p className="text-xs font-bold text-teal-400">✨ Sesi AR Aktif (6DoF)</p>
            <p className="text-[11px] text-slate-300">
              Geser HP ke samping/maju/mundur untuk menikmati kedalaman parallax diorama
            </p>
          </div>

          <div className="self-center pointer-events-auto">
            <button
              onClick={handleExitAR}
              className="px-6 py-2.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-sm font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              Keluar AR ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Panel (saat di luar AR, auto-hide 2 detik atau dibuka via tombol Mode AR) */}
      {!isARActive && (
        <div
          className={`absolute bottom-6 left-4 right-4 z-20 flex flex-col items-center transition-all duration-500 ease-out ${showARCard
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
            }`}
        >
          <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3">
            {/* Tombol Tutup Kartu */}
            <button
              onClick={() => setShowARCard(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Tutup Kartu"
            >
              ✕
            </button>
            {/* Status: Periksa Dukungan WebXR */}
            {supportStatus === "CHECKING" && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span>Memeriksa dukungan WebXR AR...</span>
              </div>
            )}

            {/* Status: Didukung (SUPPORTED) */}
            {supportStatus === "SUPPORTED" && (
              <div className="space-y-2">
                <button
                  onClick={handleEnterAR}
                  disabled={isEnteringAR}
                  className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isEnteringAR ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Mempersiapkan AR Session...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Masuk Mode AR (6DoF)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Kamera akan aktif. Diorama laut bertingkat akan melayang tetap di world-space ruangan Anda.
                </p>
              </div>
            )}

            {/* Status: Insecure Context (Buka via plain HTTP bukan localhost) */}
            {supportStatus === "INSECURE_CONTEXT" && (
              <div className="space-y-2 text-xs text-left">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span>⚠️</span>
                  <span>Koneksi Non-Secure Terdeteksi</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  WebXR Device API (<code className="text-teal-400">navigator.xr</code>) dinonaktifkan oleh Chrome karena halaman diakses via IP HTTP biasa.
                </p>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                  <p className="font-semibold text-slate-300">Cara mengaktifkan di HP:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Colok HP ke laptop via kabel USB &amp; aktifkan USB Debugging.</li>
                    <li>Di Chrome laptop, buka <code className="text-cyan-400">chrome://inspect/#devices</code>.</li>
                    <li>Set Port forwarding: <code className="text-cyan-400">3000</code> ke <code className="text-cyan-400">localhost:3000</code>.</li>
                    <li>Buka <code className="text-teal-400">http://localhost:3000/ar</code> di Chrome HP.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Status: Tidak Didukung (Desktop browser tanpa XR atau iOS Safari tanpa WebXR) */}
            {(supportStatus === "NO_XR" || supportStatus === "NO_AR_SESSION") && (
              <div className="space-y-1.5 text-xs text-left">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span>ℹ️</span>
                  <span>WebXR AR Belum Tersedia di Browser Ini</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Mode AR 6DoF memerlukan browser yang mendukung WebXR Device API (`immersive-ar`), seperti <strong>Google Chrome di Android</strong> dengan <strong>ARCore</strong> aktif.
                </p>
                <p className="text-[11px] text-slate-500">
                  Di desktop, Anda tetap dapat memeriksa dan memutar kubus uji menggunakan mouse/trackpad.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
