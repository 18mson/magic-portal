import { getTerrainHeight } from "../terrain/terrainHeight";

export interface StaticObstacle {
  id: string;
  name: string;
  pos: [number, number, number];
  radius: number; // Radius fisik rintangan untuk deteksi tabrakan (meter)
  height: number; // Ketinggian fisik rintangan di atas terrain (meter)
  type: "coral" | "rock" | "kelp";
  scale: number;
  rotY: number;
}

/**
 * Daftar Rintangan Statis Lengkap (Batu Karang & Rumpun Terumbu):
 * - 8 Gugusan Karang Lingkar Luar (r = 1.8m - 2.3m)
 * - 4 Gugusan Karang & Batu di Area Tengah (r = 0.55m - 0.95m)
 *
 * Seluruh titik koordinat Y diikatkan secara presisi ke getTerrainHeight(x, z).
 */
export function generateStaticObstacles(): StaticObstacle[] {
  const obstacles: StaticObstacle[] = [];

  // 1. Gugusan Karang & Formasi Batu di Area Tengah (Center / Inner Reef Formations)
  const innerReefs = [
    { deg: 35,  r: 0.85, sc: 1.0,  rot: 0.4, type: "coral" as const, rad: 0.42, h: 0.48 },
    { deg: 150, r: 0.95, sc: 0.95, rot: 1.8, type: "coral" as const, rad: 0.40, h: 0.45 },
    { deg: 220, r: 0.75, sc: 0.85, rot: 3.2, type: "rock"  as const, rad: 0.38, h: 0.42 },
    { deg: 335, r: 0.55, sc: 0.90, rot: 5.0, type: "coral" as const, rad: 0.38, h: 0.44 },
  ];

  innerReefs.forEach((reef, idx) => {
    const rad = (reef.deg * Math.PI) / 180;
    const x = Number((reef.r * Math.sin(rad)).toFixed(3));
    const z = Number((-reef.r * Math.cos(rad)).toFixed(3));
    const y = Number(getTerrainHeight(x, z).toFixed(3));

    obstacles.push({
      id: `reef-center-${idx}`,
      name: `Center Coral Rock #${idx + 1}`,
      pos: [x, y, z],
      radius: reef.rad * reef.sc,
      height: reef.h * reef.sc,
      type: reef.type,
      scale: reef.sc,
      rotY: reef.rot,
    });
  });

  // 2. Gugusan Karang Lingkar Luar (Outer Reef Formations)
  const outerReefs = [
    { deg: 10,  r: 1.80, sc: 1.15, rot: 0.2, type: "coral" as const, rad: 0.48, h: 0.58 },
    { deg: 55,  r: 2.10, sc: 1.25, rot: 1.1, type: "coral" as const, rad: 0.52, h: 0.62 },
    { deg: 100, r: 1.90, sc: 1.10, rot: 2.0, type: "coral" as const, rad: 0.46, h: 0.54 },
    { deg: 145, r: 2.20, sc: 1.30, rot: 2.9, type: "coral" as const, rad: 0.55, h: 0.65 },
    { deg: 190, r: 1.85, sc: 1.15, rot: 3.8, type: "coral" as const, rad: 0.48, h: 0.58 },
    { deg: 235, r: 2.15, sc: 1.25, rot: 4.7, type: "coral" as const, rad: 0.52, h: 0.62 },
    { deg: 280, r: 1.95, sc: 1.20, rot: 5.4, type: "coral" as const, rad: 0.50, h: 0.60 },
    { deg: 325, r: 2.30, sc: 1.35, rot: 0.8, type: "coral" as const, rad: 0.56, h: 0.68 },
  ];

  outerReefs.forEach((reef, idx) => {
    const rad = (reef.deg * Math.PI) / 180;
    const x = Number((reef.r * Math.sin(rad)).toFixed(3));
    const z = Number((-reef.r * Math.cos(rad)).toFixed(3));
    const y = Number(getTerrainHeight(x, z).toFixed(3));

    obstacles.push({
      id: `reef-outer-${idx}`,
      name: `Outer Coral Reef #${idx + 1}`,
      pos: [x, y, z],
      radius: reef.rad * reef.sc,
      height: reef.h * reef.sc,
      type: reef.type,
      scale: reef.sc,
      rotY: reef.rot,
    });
  });

  return obstacles;
}

/**
 * Daftar rintangan statis singleton yang dievaluasi satu kali untuk scene
 */
export const STATIC_OBSTACLES = generateStaticObstacles();
