import { DioramaWorldSpec } from "./types";

/**
 * Spesifikasi default untuk Diorama Bawah Laut ala Studio Ghibli.
 * Menggunakan teknik layered-cutout diorama dengan susunan layer di sepanjang sumbu Z
 * untuk menghasilkan efek parallax 6DoF mendalam saat kamera bergerak fisik.
 */
export const oceanDioramaSpec: DioramaWorldSpec = {
  id: "ghibli-ocean-portal",
  title: "Lembah Karang Biru Ghibli",
  description: "Paper-theater diorama bawah laut bertingkat dengan pencahayaan hangat dan satwa berenang",
  fog: {
    // Fog hangat teal-cream yang membaurkan layer kejauhan secara lembut
    color: "#236573",
    density: 0.32,
  },
  lighting: {
    ambientColor: "#b2e6ea",
    ambientIntensity: 1.2,
    sunPosition: [1.5, 3.5, 0.5],
    sunColor: "#fff8db",
    sunIntensity: 1.6,
  },
  layers: [
    // LAYER 1: Backdrop berkas cahaya matahari laut (paling jauh)
    {
      id: "layer-backdrop-sunbeams",
      name: "Sunbeams & Deep Ocean",
      category: "backdrop",
      textureUrl: "/textures/diorama/backdrop-sunbeams.svg",
      position: [0, 0, -2.4],
      scale: [2.5, 2.0],
      alphaTest: 0.02,
      opacity: 0.95,
      billboard: "none",
    },

    // LAYER 2: Tebing karang & siluet kejauhan
    {
      id: "layer-distant-reef",
      name: "Distant Reef Ridge",
      category: "scenery",
      textureUrl: "/textures/diorama/distant-reef.svg",
      position: [0, -0.15, -1.9],
      scale: [2.2, 1.35],
      alphaTest: 0.05,
      opacity: 0.9,
      billboard: "none",
    },

    // LAYER 3: Ikan Pari Utama (Manta Hero) yang berenang santai di kedalaman tengah
    {
      id: "layer-hero-manta",
      name: "Gentle Manta Ray",
      category: "fish",
      textureUrl: "/textures/diorama/fish-hero-manta.svg",
      position: [-0.15, 0.18, -1.5],
      scale: [0.95, 0.62],
      alphaTest: 0.05,
      billboard: "horizontal", // Tetap tegak, rotasi yaw mengikuti arah kamera
      motion: {
        speed: 1.1,
        amplitudeY: 0.045, // Mengambang naik turun lembut
        amplitudeX: 0.06,  // Meluncur kiri kanan
        swayZ: 0.05,       // Kemiringan sayap saat meluncur
        phase: 0.5,
      },
    },

    // LAYER 4: Karang Utama (Midground Coral Arch & Anemon)
    {
      id: "layer-midground-coral",
      name: "Main Coral Arch",
      category: "scenery",
      textureUrl: "/textures/diorama/midground-coral-arch.svg",
      position: [0, -0.22, -1.2],
      scale: [1.8, 1.17],
      alphaTest: 0.08,
      opacity: 1.0,
      billboard: "none",
    },

    // LAYER 5: Gerombolan Ikan Kecil (Fish School) berenang di atas karang
    {
      id: "layer-fish-school",
      name: "Tropical Fish School",
      category: "fish",
      textureUrl: "/textures/diorama/fish-school.svg",
      position: [0.28, 0.05, -0.95],
      scale: [0.65, 0.38],
      alphaTest: 0.05,
      billboard: "horizontal",
      motion: {
        speed: 1.8,
        amplitudeY: 0.035,
        amplitudeX: 0.08,
        swayZ: 0.03,
        phase: 2.2,
      },
    },

    // LAYER 6: Rumput Laut Kiri Depan (Foreground Kelp Left)
    {
      id: "layer-foreground-seaweed-left",
      name: "Foreground Seaweed Left",
      category: "prop",
      textureUrl: "/textures/diorama/foreground-seaweed-left.svg",
      position: [-0.48, -0.12, -0.68],
      scale: [0.65, 1.05],
      alphaTest: 0.08,
      billboard: "none",
    },

    // LAYER 7: Rumput Laut Kanan Depan (Foreground Kelp Right)
    {
      id: "layer-foreground-seaweed-right",
      name: "Foreground Seaweed Right",
      category: "prop",
      textureUrl: "/textures/diorama/foreground-seaweed-right.svg",
      position: [0.5, -0.14, -0.62],
      scale: [0.62, 1.0],
      alphaTest: 0.08,
      billboard: "none",
    },
  ],
};
