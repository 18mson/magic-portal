/**
 * Modul Topografi Dasar Laut & Fungsi Noise 2D (Simplex/Harmonic Noise)
 *
 * Digunakan bersama oleh:
 * 1. Geometry generator UnderwaterTerrain (mesh dasar laut 3D kontinu utuh)
 * 2. Peletakan jangkar batu karang & rumput laut di atas permukaan pasir
 * 3. Mesin fisika Boids untuk ground avoidance & hard clamping satwa laut
 */

// ============================================================================
// Implementasi Cepat 2D Simplex Noise (Deterministik, Zero Allocation)
// ============================================================================

const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

// Tabel permutasi deterministik standar
const p = new Uint8Array([
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
  234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
  88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
  134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
  230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
  1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
  116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
  124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
  47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2,
  44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253,
  19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
  251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235,
  249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176,
  115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29,
  24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
]);

// Tabel gradien 2D
const grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [1, 0], [-1, 0],
  [0, 1], [0, -1], [0, 1], [0, -1],
];

/**
 * 2D Simplex Noise murni menghasilkan nilai kontinyu [-1.0, 1.0]
 */
export function simplex2D(xin: number, yin: number): number {
  let n0 = 0;
  let n1 = 0;
  let n2 = 0;

  // Skew space input
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  // Tentukan simplex mana yang kita tempati
  let i1 = 0;
  let j1 = 0;
  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  // Hash koordinat cell simplex
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = p[(ii + p[jj]) & 255] % 12;
  const gi1 = p[(ii + i1 + p[(jj + j1) & 255]) & 255] % 12;
  const gi2 = p[(ii + 1 + p[(jj + 1) & 255]) & 255] % 12;

  // Kontribusi sudut 0
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) {
    t0 *= t0;
    n0 = t0 * t0 * (grad2[gi0][0] * x0 + grad2[gi0][1] * y0);
  }

  // Kontribusi sudut 1
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) {
    t1 *= t1;
    n1 = t1 * t1 * (grad2[gi1][0] * x1 + grad2[gi1][1] * y1);
  }

  // Kontribusi sudut 2
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) {
    t2 *= t2;
    n2 = t2 * t2 * (grad2[gi2][0] * x2 + grad2[gi2][1] * y2);
  }

  // Skala ke rentang [-1, 1]
  return 70.0 * (n0 + n1 + n2);
}

// ============================================================================
// Fungsi Topografi Elevasi Dasar Laut (Unified Continuous Seabed Height)
// ============================================================================

/**
 * Menghitung elevasi Y dasar laut di sembarang titik koordinat (x, z).
 * Membentuk kontur naik-turun alami ala dasar laut:
 * - Lembah dan cekungan pasir lembut (depth -0.72m s/d -0.58m)
 * - Punggung bukit & gumuk pasir landai (depth -0.52m s/d -0.38m)
 * - Lereng luar yang melandai naik ke perimeter tebing (r > 2.6m)
 */
export function getTerrainHeight(x: number, z: number): number {
  const r = Math.sqrt(x * x + z * z);

  // Elevasi dasar datum
  const baseDepth = -0.58;

  // Oktaf 1: Gelombang bukit-lembah utama laut dalam (skala makro luas)
  const d1 = simplex2D(x * 0.42, z * 0.42) * 0.16;

  // Oktaf 2: Gundukan & kelokan pasir organik (skala medium)
  const d2 = simplex2D(x * 0.95 + 1.8, z * 0.95 - 2.4) * 0.08;

  // Oktaf 3: Riak pasir laut alami (dune ripples mikro)
  const d3 = simplex2D(x * 2.2 + 3.1, z * 2.2 + 0.7) * 0.025;

  // Variasi radial alami di area luar (r > 5.2m) agar melandai naik ke tebing panorama
  let rimElevation = 0;
  if (r > 5.2) {
    const rimFactor = (r - 5.2) / 5.2;
    const clampedFactor = Math.min(1.0, Math.max(0.0, rimFactor));
    const angle = Math.atan2(x, z);
    const rimWaviness = Math.sin(angle * 4.0) * 0.12 + Math.cos(angle * 2.0 + 0.8) * 0.08;
    rimElevation = (clampedFactor * clampedFactor) * (0.45 + rimWaviness);
  }

  return baseDepth + d1 + d2 + d3 + rimElevation;
}

// ============================================================================
// Pewarnaan Harmonis Studio Ghibli untuk Permukaan Dasar Laut
// (Turunan Palet Bukit Teal-Hijau Gelap & Pasir Cream-Sage Hangat)
// ============================================================================

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Menghasilkan warna vertex yang selaras 100% dengan ilustrasi referensi:
 * - Palung / Depresi Rendah: Burgundy pekat mendalam (#520719, #6b0c23)
 * - Lereng Bukit: Muted rose-crimson (#9e1837, #b82346)
 * - Punggung Bukit & Gumuk Pasir: Blushing rose-coral (#cf385c, #e04b6f)
 * - Pita Ombak Putih Berkelok (White Ribbon Wave): Saluran pasir berombak putih-krem cerah
 *   seperti di ilustrasi yang membelah samudera secara dinamis.
 */
export function getTerrainVertexColor(x: number, z: number, y: number): RGBColor {
  // Palet Ilustrasi Referensi:
  const trenchBurgundy = { r: 0.322, g: 0.027, b: 0.098 }; // #520719
  const slopeCrimson   = { r: 0.620, g: 0.094, b: 0.216 }; // #9e1837
  const crestRose      = { r: 0.812, g: 0.220, b: 0.361 }; // #cf385c
  const ribbonWhite    = { r: 0.980, g: 0.945, b: 0.955 }; // #faf1f3 (Ivory White Ribbon)

  // Normalisasi tinggi (berkisar antara -0.72 s/d -0.22)
  const normY = Math.max(0.0, Math.min(1.0, (y + 0.72) / 0.50));

  // Noise variasi organik
  const patchNoise = simplex2D(x * 0.8 + 1.2, z * 0.8 - 0.9) * 0.16;
  const rippleNoise = simplex2D(x * 2.8 + 0.5, z * 2.8 + 2.1) * 0.05;
  const organicFactor = Math.max(0.0, Math.min(1.0, normY + patchNoise + rippleNoise));

  let r = 0, g = 0, b = 0;

  if (organicFactor < 0.35) {
    const t = organicFactor / 0.35;
    r = trenchBurgundy.r + (slopeCrimson.r - trenchBurgundy.r) * t;
    g = trenchBurgundy.g + (slopeCrimson.g - trenchBurgundy.g) * t;
    b = trenchBurgundy.b + (slopeCrimson.b - trenchBurgundy.b) * t;
  } else {
    const t = (organicFactor - 0.35) / 0.65;
    r = slopeCrimson.r + (crestRose.r - slopeCrimson.r) * t;
    g = slopeCrimson.g + (crestRose.g - slopeCrimson.g) * t;
    b = slopeCrimson.b + (crestRose.b - slopeCrimson.b) * t;
  }

  // Pita Ombak Putih Berkelok (Winding White Wave Ribbon khas ilustrasi)
  // Menembus lanskap dasar laut secara organik
  const waveCoord = x * 0.42 + z * 0.68 + Math.sin(x * 1.2 + z * 0.4) * 0.6;
  const distFromRibbon = Math.abs(waveCoord - 0.15);
  const ribbonWidth = 0.32;

  if (distFromRibbon < ribbonWidth) {
    const ribbonStrength = Math.pow(1.0 - distFromRibbon / ribbonWidth, 1.8);
    r = r * (1.0 - ribbonStrength) + ribbonWhite.r * ribbonStrength;
    g = g * (1.0 - ribbonStrength) + ribbonWhite.g * ribbonStrength;
    b = b * (1.0 - ribbonStrength) + ribbonWhite.b * ribbonStrength;
  }

  // Shading kedalaman air laut
  const depthShading = 0.92 + normY * 0.10;

  return {
    r: Math.max(0, Math.min(1, r * depthShading)),
    g: Math.max(0, Math.min(1, g * depthShading)),
    b: Math.max(0, Math.min(1, b * depthShading)),
  };
}
