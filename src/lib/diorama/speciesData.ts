/**
 * Kamus Data & Taksonomi Satwa Laut Ekosistem Karang 3D
 * Digunakan oleh Sistem Inspeksi Hologram Interaktif (Milestone 6)
 */

export interface SpeciesInfo {
  key: string;
  commonName: string;
  scientificName: string;
  icon: string;
  category: "Pelagis" | "Ikan Karang" | "Kawanan Ikan" | "Terumbu Karang";
  habitatDepth: string;
  avgSpeed: string;
  diet: string;
  conservationStatus: string;
  description: string;
  funFact: string;
  glowColor: string;
  primaryColor: string;
}

export const SPECIES_CATALOG: Record<string, SpeciesInfo> = {
  manta: {
    key: "manta",
    commonName: "Pari Manta Samudra",
    scientificName: "Mobula birostris",
    icon: "🌊",
    category: "Pelagis",
    habitatDepth: "0.5m – 4.0m (Kolom Air Bebas)",
    avgSpeed: "1.4 m/s (Gliding & Banking)",
    diet: "Plankton & Krill Mikro",
    conservationStatus: "Rentan (Vulnerable)",
    description:
      "Raksasa laut yang anggun dengan rentang sayap lebar. Mengarungi kolom air terbuka dengan kepakan sayap lembut dan manuver kemiringan tubuh hidrodinamis saat berbelok.",
    funFact:
      "Pari manta memiliki rasio otak terhadap massa tubuh terbesar di antara seluruh spesies ikan bertulang rawan!",
    glowColor: "#ff70a6",
    primaryColor: "#2c0914",
  },
  "blue-angel": {
    key: "blue-angel",
    commonName: "Ikan Bidadari Emas-Biru",
    scientificName: "Pomacanthus xanthometopon",
    icon: "🐠",
    category: "Ikan Karang",
    habitatDepth: "0.1m – 0.8m (Sela Ranting Karang)",
    avgSpeed: "0.85 m/s (Patroli Teritorial)",
    diet: "Spons Mikro & Alga Karang",
    conservationStatus: "Risiko Rendah (Least Concern)",
    description:
      "Penghuni setia terumbu karang bercabang. Memiliki tubuh pipih tegak berwarna kuning keemasan dengan aksen biru safir yang memudahkan bermanuver di celah-celah karang staghorn.",
    funFact:
      "Ikan bidadari hidup berpasangan dan sangat setia menjaga wilayah terumbu karang rumahnya dari predator kecil.",
    glowColor: "#38bdf8",
    primaryColor: "#f59e0b",
  },
  "round-tang": {
    key: "round-tang",
    commonName: "Ikan Tang Bulat Emas",
    scientificName: "Zebrasoma flavescens",
    icon: "🐡",
    category: "Ikan Karang",
    habitatDepth: "0.2m – 1.0m (Lereng Pasir & Karang Meja)",
    avgSpeed: "0.95 m/s (Foraging Aktif)",
    diet: "Biofilm Alga & Detritus Laut",
    conservationStatus: "Risiko Rendah (Least Concern)",
    description:
      "Ikan pemakan alga dengan tubuh membulat dinamis dan moncong runcing. Memiliki garis putih mutiara kontras yang berfungsi sebagai kamuflase pantulan bias sinar matahari laut.",
    funFact:
      "Peran ikan tang sangat krusial bagi ekosistem laut: mereka membersihkan alga berlebih agar karang dapat terus bertunas.",
    glowColor: "#fbbf24",
    primaryColor: "#ea580c",
  },
  school: {
    key: "school",
    commonName: "Kawanan Minnow Samudra",
    scientificName: "Atheriniformes sp.",
    icon: "✨",
    category: "Kawanan Ikan",
    habitatDepth: "0.1m – 0.6m (Cekungan Pasir Tengah)",
    avgSpeed: "1.2 m/s (Sinkronisasi Boids)",
    diet: "Fitoplankton & Zooplankton",
    conservationStatus: "Melimpah (Abundant)",
    description:
      "Ikan-ikan mungil bercahaya yang berenang dalam kelompok terkoordinasi rapi menggunakan prinsip algoritma boids alami (Separation, Alignment, dan Cohesion).",
    funFact:
      "Saat predator atau riak air mendekat, kawanan ini dapat berpencar dalam 0.1 detik dan bersatu kembali dalam sekejap!",
    glowColor: "#f43f5e",
    primaryColor: "#ffd56b",
  },
  "coral-staghorn": {
    key: "coral-staghorn",
    commonName: "Karang Tanduk Merah Marun",
    scientificName: "Acropora cervicornis",
    icon: "🪸",
    category: "Terumbu Karang",
    habitatDepth: "Dasar Laut (0.0m – 0.5m)",
    avgSpeed: "Statis (Tumbuh 8cm/tahun)",
    diet: "Simbiosis Fotosintesis Zooxanthellae",
    conservationStatus: "Kritis (Critically Endangered)",
    description:
      "Formasi karang bercabang organik 3-tingkat yang kokoh. Menjadi pondasi pelindung bagi ikan-ikan kecil untuk mencari makan dan berlindung dari arus deras.",
    funFact:
      "Warna merah marun dan ungu tua dihasilkan oleh pigmen fluoresens alami yang melindungi jaringan karang dari radiasi ultraviolet laut.",
    glowColor: "#e11d48",
    primaryColor: "#880d2e",
  },
};

export interface ActiveInspection {
  creatureId: string;
  speciesKey: string;
  position: [number, number, number];
  timestamp: number;
}

type InspectionListener = (inspection: ActiveInspection | null) => void;

class CreatureInspectionManager {
  private activeInspection: ActiveInspection | null = null;
  private listeners: Set<InspectionListener> = new Set();

  public subscribe(listener: InspectionListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getActive(): ActiveInspection | null {
    return this.activeInspection;
  }

  public inspect(creatureId: string, speciesKey: string, position: [number, number, number]) {
    this.activeInspection = {
      creatureId,
      speciesKey,
      position: [...position],
      timestamp: Date.now(),
    };
    this.notify();
  }

  public updatePosition(position: [number, number, number]) {
    if (this.activeInspection) {
      this.activeInspection.position = [...position];
      this.notify();
    }
  }

  public clear() {
    this.activeInspection = null;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activeInspection));
  }
}

export const creatureInspection = new CreatureInspectionManager();
