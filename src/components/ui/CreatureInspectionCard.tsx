"use client";

import { useEffect, useState } from "react";
import { creatureInspection, ActiveInspection, SPECIES_CATALOG, SpeciesInfo } from "@/lib/diorama/speciesData";
import { underwaterAudio } from "@/lib/audio/underwaterAudio";

export function CreatureInspectionCard() {
  const [inspection, setInspection] = useState<ActiveInspection | null>(null);

  useEffect(() => {
    return creatureInspection.subscribe((active) => {
      setInspection(active);
      if (active) {
        underwaterAudio.triggerBubblePop(1.4); // Suara resonansi mikro saat kartu terbuka
      }
    });
  }, []);

  if (!inspection) return null;

  const info: SpeciesInfo | undefined = SPECIES_CATALOG[inspection.speciesKey];
  if (!info) return null;

  return (
    <div className="absolute top-20 right-4 z-40 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-slate-950/85 backdrop-blur-xl border border-teal-500/40 rounded-2xl p-4 shadow-2xl text-white space-y-3.5 relative overflow-hidden">
        {/* Glow Ambient Bar di atas */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r"
          style={{
            backgroundImage: `linear-gradient(to right, ${info.glowColor}, #38bdf8)`,
          }}
        />

        {/* Header Kartu: Ikon, Nama, dan Tombol Tutup */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/20"
              style={{ backgroundColor: `${info.glowColor}25` }}
            >
              {info.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white">
                  {info.commonName}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                  {info.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                {info.scientificName}
              </p>
            </div>
          </div>

          <button
            onClick={() => creatureInspection.clear()}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors text-xs font-bold cursor-pointer"
            title="Tutup Inspeksi"
          >
            ✕
          </button>
        </div>

        {/* Grid Metrik Parameter Fisik Satwa */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Kecepatan Jelajah
            </p>
            <p className="text-xs font-bold text-teal-300 mt-0.5">
              {info.avgSpeed}
            </p>
          </div>

          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Kedalaman Habitat
            </p>
            <p className="text-xs font-bold text-amber-300 mt-0.5">
              {info.habitatDepth}
            </p>
          </div>
        </div>

        {/* Info Makanan & Konservasi */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Diet Alami:</span>
            <span className="font-semibold text-slate-200">{info.diet}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Status Konservasi:</span>
            <span className="font-semibold text-emerald-300">{info.conservationStatus}</span>
          </div>
        </div>

        {/* Deskripsi & Fakta Menarik */}
        <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
          <p className="text-[11px] text-slate-300">
            {info.description}
          </p>
          <div className="mt-2 p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-200 flex items-start gap-1.5">
            <span className="text-xs">💡</span>
            <p>{info.funFact}</p>
          </div>
        </div>

        {/* Petunjuk Interaksi */}
        <p className="text-[10px] text-center text-slate-400 border-t border-slate-800/80 pt-2">
          Ketuk satwa lain di dalam air untuk memeriksa profil biologisnya
        </p>
      </div>
    </div>
  );
}
