import { DioramaWorldSpec, DioramaLayerSpec } from "./types";

/**
 * Mengonversi sudut derajat (0° = Depan, 90° = Kanan, 180° = Belakang, 270° = Kiri),
 * radius jarak dari user, dan ketinggian Y ke koordinat [X, Y, Z].
 */
function polarToXYZ(
  deg: number,
  radius: number,
  y: number
): [number, number, number] {
  const rad = (deg * Math.PI) / 180;
  // X = radius * sin(rad)
  // Z = -radius * cos(rad) (sehingga deg 0 berada di -Z = tepat di depan user)
  const x = Number((radius * Math.sin(rad)).toFixed(3));
  const z = Number((-radius * Math.cos(rad)).toFixed(3));
  return [x, y, z];
}

/**
 * Menghasilkan puluhan layer terdistribusi penuh 360 derajat mengelilingi user
 * dengan variasi jarak Z/X, tinggi Y, kecepatan ayunan, dan arah renang (flipX).
 */
export function generate360OceanLayers(): DioramaLayerSpec[] {
  const layers: DioramaLayerSpec[] = [];

  // ==========================================
  // 1. KAWANAN IKAN KECIL (FISH SCHOOLS) ~ 36 Kawanan Mengelilingi 360°
  // ==========================================
  const fishSchoolAngles = [
    { deg: 0, r: 1.1, y: 0.12, spd: 1.6, flip: false },
    { deg: 15, r: 2.2, y: 0.35, spd: 2.1, flip: true },
    { deg: 28, r: 0.95, y: -0.05, spd: 1.8, flip: false },
    { deg: 42, r: 1.8, y: 0.4, spd: 1.4, flip: true },
    { deg: 58, r: 2.5, y: -0.2, spd: 1.9, flip: false },
    { deg: 72, r: 1.3, y: 0.25, spd: 2.3, flip: true },
    { deg: 85, r: 2.1, y: 0.05, spd: 1.7, flip: false },
    { deg: 98, r: 1.6, y: -0.3, spd: 1.5, flip: true },
    { deg: 112, r: 2.7, y: 0.5, spd: 2.0, flip: false },
    { deg: 125, r: 1.4, y: 0.18, spd: 1.8, flip: true },
    { deg: 138, r: 2.3, y: -0.15, spd: 2.2, flip: false },
    { deg: 150, r: 1.2, y: 0.32, spd: 1.6, flip: true },
    { deg: 162, r: 2.8, y: 0.1, spd: 1.4, flip: false },
    { deg: 175, r: 1.5, y: -0.25, spd: 2.4, flip: true },
    { deg: 188, r: 2.0, y: 0.45, spd: 1.7, flip: false },
    { deg: 202, r: 1.1, y: 0.08, spd: 1.9, flip: true },
    { deg: 215, r: 2.6, y: -0.1, spd: 1.5, flip: false },
    { deg: 228, r: 1.7, y: 0.38, spd: 2.2, flip: true },
    { deg: 240, r: 2.2, y: 0.15, spd: 1.6, flip: false },
    { deg: 252, r: 1.3, y: -0.35, spd: 2.0, flip: true },
    { deg: 265, r: 2.9, y: 0.52, spd: 1.8, flip: false },
    { deg: 278, r: 1.5, y: 0.02, spd: 2.3, flip: true },
    { deg: 290, r: 2.4, y: -0.18, spd: 1.4, flip: false },
    { deg: 305, r: 1.2, y: 0.28, spd: 1.9, flip: true },
    { deg: 318, r: 2.7, y: 0.42, spd: 1.7, flip: false },
    { deg: 330, r: 1.6, y: -0.08, spd: 2.1, flip: true },
    { deg: 345, r: 2.3, y: 0.22, spd: 1.5, flip: false },
    // Kawanan ikan di elevasi tinggi (dekat permukaan berjemur cahaya)
    { deg: 20, r: 1.9, y: 0.85, spd: 2.0, flip: false },
    { deg: 80, r: 2.2, y: 0.92, spd: 1.8, flip: true },
    { deg: 140, r: 1.8, y: 0.78, spd: 2.2, flip: false },
    { deg: 200, r: 2.1, y: 0.88, spd: 1.7, flip: true },
    { deg: 260, r: 1.7, y: 0.82, spd: 2.1, flip: false },
    { deg: 320, r: 2.3, y: 0.95, spd: 1.9, flip: true },
  ];

  fishSchoolAngles.forEach((cfg, idx) => {
    const scaleFactor = 0.45 + (idx % 4) * 0.08;
    layers.push({
      id: `school-fish-${idx}`,
      name: `Fish School #${idx + 1}`,
      category: "fish",
      textureUrl: "/textures/diorama/fish-school.svg",
      position: polarToXYZ(cfg.deg, cfg.r, cfg.y),
      scale: [scaleFactor, scaleFactor * 0.58],
      alphaTest: 0.05,
      billboard: "horizontal",
      flipX: cfg.flip,
      motion: {
        speed: cfg.spd,
        amplitudeY: 0.035 + (idx % 3) * 0.015,
        amplitudeX: 0.07 + (idx % 2) * 0.03,
        swayZ: 0.03 + (idx % 3) * 0.01,
        phase: (idx * 1.37) % (Math.PI * 2),
      },
    });
  });

  // ==========================================
  // 2. IKAN PARI ANGGUN (HERO MANTA RAYS) ~ 8 Ekor Berkelana 360°
  // ==========================================
  const mantaConfigs = [
    { deg: 345, r: 1.5, y: 0.18, spd: 1.1, sc: 0.95, flip: false },
    { deg: 45, r: 2.4, y: 0.45, spd: 0.95, sc: 1.1, flip: true },
    { deg: 90, r: 2.1, y: -0.12, spd: 1.25, sc: 0.85, flip: false },
    { deg: 140, r: 2.7, y: 0.6, spd: 1.0, sc: 1.2, flip: true },
    { deg: 185, r: 1.9, y: 0.25, spd: 1.15, sc: 0.9, flip: false },
    { deg: 230, r: 2.5, y: -0.2, spd: 0.9, sc: 1.05, flip: true },
    { deg: 275, r: 2.0, y: 0.35, spd: 1.2, sc: 0.88, flip: false },
    { deg: 315, r: 2.8, y: 0.7, spd: 1.05, sc: 1.25, flip: true },
  ];

  mantaConfigs.forEach((m, idx) => {
    layers.push({
      id: `hero-manta-${idx}`,
      name: `Manta Ray #${idx + 1}`,
      category: "fish",
      textureUrl: "/textures/diorama/fish-hero-manta.svg",
      position: polarToXYZ(m.deg, m.r, m.y),
      scale: [m.sc, m.sc * 0.65],
      alphaTest: 0.05,
      billboard: "horizontal",
      flipX: m.flip,
      motion: {
        speed: m.spd,
        amplitudeY: 0.05,
        amplitudeX: 0.08,
        swayZ: 0.06,
        phase: idx * 0.9,
      },
    });
  });

  return layers;
}

/**
 * Spesifikasi Dunia Laut 360 Derajat Studio Ghibli.
 * Berisi puluhan kawanan ikan, pari manta, rumput laut, dan formasi karang
 * yang melingkari user 360° secara merata.
 */
export const oceanDioramaSpec: DioramaWorldSpec = {
  id: "ghibli-ocean-360",
  title: "Samudera Karang Merah Crimson Ghibli",
  description: "Diorama bawah laut crimson dan rose-pink dengan ikan kuning bergaris dan karang ranting artistik",
  fog: {
    color: "#7d0e29",
    density: 0.20,
  },
  lighting: {
    ambientColor: "#f28599",
    ambientIntensity: 0.95,
    sunPosition: [2, 6, 2],
    sunColor: "#fff2db",
    sunIntensity: 1.20,
  },
  layers: [],
};

export const crimsonTwilightSpec = oceanDioramaSpec;

export const abyssalMidnightSpec: DioramaWorldSpec = {
  id: "abyssal-midnight-360",
  title: "Palung Laut Malam Bioluminescent",
  description: "Diorama palung laut malam dengan pendaran neon cyan, bioluminesensi ungu, dan karang menyala",
  fog: {
    color: "#030a14",
    density: 0.22,
  },
  lighting: {
    ambientColor: "#1e3a8a",
    ambientIntensity: 0.70,
    sunPosition: [1, 7, -1],
    sunColor: "#38bdf8",
    sunIntensity: 0.85,
  },
  layers: [],
};

