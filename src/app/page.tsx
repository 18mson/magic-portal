import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          WebXR 6DoF Experience
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Jendela Dunia Lain
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Ubah layar perangkat Anda menjadi &ldquo;jendela tembus pandang&rdquo; ke dunia virtual
          dengan tracking 6DoF (rotasi dan translasi fisik) melalui WebXR Device API.
        </p>

        <div className="pt-2">
          <Link
            href="/ar"
            className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-sky-500/25 active:scale-[0.98]"
          >
            Buka Halaman AR / Test Scene →
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-left text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-400">Milestone Saat Ini: M1 (Setup Dasar)</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Next.js App Router + TypeScript + Tailwind</li>
            <li>Three.js, React Three Fiber, Drei, &amp; @react-three/xr</li>
            <li>Render pipeline desktop siap diverifikasi di <code className="text-sky-400 font-mono">/ar</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
