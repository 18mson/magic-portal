export type LayerCategory = "backdrop" | "scenery" | "prop" | "fish";

export type BillboardMode = "none" | "horizontal" | "all";

export interface DioramaLayerMotion {
  /** Kecepatan osilasi animasi per detik (default: 1.0) */
  speed?: number;
  /** Jarak gerak vertikal sumbu Y dalam meter (default: 0.05) */
  amplitudeY?: number;
  /** Jarak gerak horizontal sumbu X dalam meter (default: 0.08) */
  amplitudeX?: number;
  /** Derajat rotasi roll kemiringan sumbu Z dalam radian (default: 0.04) */
  swayZ?: number;
  /** Offset fase waktu awal agar gerakan antar ikan tidak sinkron kaku */
  phase?: number;
}

export interface DioramaLayerSpec {
  /** Identifier unik untuk layer */
  id: string;
  /** Nama deskriptif layer */
  name: string;
  /** Kategori objek: backdrop, scenery, prop, atau fish */
  category: LayerCategory;
  /** URL ke tekstur PNG atau SVG transparan */
  textureUrl: string;
  /** Posisi world-space [x, y, z]. Sumbu Z menentukan kedalaman parallax */
  position: [x: number, y: number, z: number];
  /** Dimensi plane: [lebar, tinggi] atau angka tunggal (lebar = tinggi) */
  scale: [width: number, height: number] | number;
  /** Rotasi opsional [x, y, z] dalam radian */
  rotation?: [x: number, y: number, z: number];
  /** Nilai threshold alphaTest untuk eliminasi piksel transparan (default: 0.05) */
  alphaTest?: number;
  /** Opasitas keseluruhan layer (0 - 1) */
  opacity?: number;
  /**
   * Mode billboard menghadap kamera:
   * - 'none': diam mengikuti rotasi world/parent
   * - 'horizontal': hanya rotasi yaw pada sumbu Y (menghadap kamera tanpa mendongak/tunduk)
   * - 'all': menghadap kamera sepenuhnya
   */
  billboard?: BillboardMode;
  /** Konfigurasi gerak animasi idle untuk kategori ikan atau objek dinamis */
  motion?: DioramaLayerMotion;
}

export interface DioramaWorldSpec {
  id: string;
  title: string;
  description?: string;
  fog: {
    color: string;
    density: number;
  };
  lighting: {
    ambientColor: string;
    ambientIntensity: number;
    sunPosition: [number, number, number];
    sunColor: string;
    sunIntensity: number;
  };
  layers: DioramaLayerSpec[];
}
