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
function generate360OceanLayers(): DioramaLayerSpec[] {
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

  // ==========================================
  // 3. TERUMBU KARANG UTAMA (CORAL ARCHES & REEFS) ~ 8 Formasi Melingkar
  // ==========================================
  const coralAngles = [
    { deg: 0, r: 1.4, y: -0.25, sc: 1.8, flip: false },
    { deg: 45, r: 2.2, y: -0.3, sc: 2.1, flip: true },
    { deg: 90, r: 1.6, y: -0.28, sc: 1.9, flip: false },
    { deg: 135, r: 2.4, y: -0.35, sc: 2.3, flip: true },
    { deg: 180, r: 1.5, y: -0.26, sc: 1.85, flip: false },
    { deg: 225, r: 2.3, y: -0.32, sc: 2.2, flip: true },
    { deg: 270, r: 1.7, y: -0.27, sc: 1.95, flip: false },
    { deg: 315, r: 2.5, y: -0.36, sc: 2.4, flip: true },
  ];

  coralAngles.forEach((c, idx) => {
    // Rotasi yaw agar menghadap ke arah tengah user
    const yawAngle = (c.deg * Math.PI) / 180;
    layers.push({
      id: `mid-coral-${idx}`,
      name: `Coral Formation #${idx + 1}`,
      category: "scenery",
      textureUrl: "/textures/diorama/midground-coral-arch.svg",
      position: polarToXYZ(c.deg, c.r, c.y),
      scale: [c.sc, c.sc * 0.65],
      rotation: [0, yawAngle, 0],
      alphaTest: 0.08,
      flipX: c.flip,
      billboard: "none",
    });
  });

  // ==========================================
  // 4. RUMPUN RUMPUT LAUT (FOREGROUND KELP) ~ 16 Rumpun di Sekeliling Dekat User
  // ==========================================
  for (let i = 0; i < 16; i++) {
    const deg = i * 22.5; // Membagi 360° secara rata tiap 22.5 derajat
    const r = 0.75 + (i % 3) * 0.25; // Jarak dekat: 0.75m - 1.25m untuk efek parallax tajam
    const isLeftTexture = i % 2 === 0;
    const yawAngle = (deg * Math.PI) / 180;

    layers.push({
      id: `seaweed-360-${i}`,
      name: `Kelp Forest #${i + 1}`,
      category: "prop",
      textureUrl: isLeftTexture
        ? "/textures/diorama/foreground-seaweed-left.svg"
        : "/textures/diorama/foreground-seaweed-right.svg",
      position: polarToXYZ(deg, r, -0.15 - (i % 2) * 0.05),
      scale: [0.65, 1.05],
      rotation: [0, yawAngle, 0],
      alphaTest: 0.08,
      billboard: "none",
    });
  }

  // ==========================================
  // 5. SILUET TEBING KEJAUHAN (DISTANT REEF) ~ 6 Siluet Mengelilingi Radius Luar
  // ==========================================
  const distantAngles = [0, 60, 120, 180, 240, 300];
  distantAngles.forEach((deg, idx) => {
    const yawAngle = (deg * Math.PI) / 180;
    layers.push({
      id: `distant-reef-${idx}`,
      name: `Distant Cliff #${idx + 1}`,
      category: "scenery",
      textureUrl: "/textures/diorama/distant-reef.svg",
      position: polarToXYZ(deg, 3.6, -0.2),
      scale: [3.4, 2.1],
      rotation: [0, yawAngle, 0],
      alphaTest: 0.05,
      opacity: 0.85,
      billboard: "none",
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
  title: "Samudera Karang Biru 360° Ghibli",
  description: "Diorama bawah laut 360 derajat penuh dengan puluhan ikan, pari manta, dan rumput laut di sekeliling user",
  fog: {
    color: "#236573",
    density: 0.26,
  },
  lighting: {
    ambientColor: "#b2e6ea",
    ambientIntensity: 1.3,
    sunPosition: [2, 6, 2],
    sunColor: "#fff8db",
    sunIntensity: 1.7,
  },
  layers: generate360OceanLayers(),
};
