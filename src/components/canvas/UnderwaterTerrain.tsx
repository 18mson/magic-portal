"use client";

import { useMemo } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  PlaneGeometry,
} from "three";
import {
  getTerrainHeight,
  getTerrainVertexColor,
} from "@/lib/terrain/terrainHeight";

/**
 * Komponen Dasar Laut Pasir & Bukit Terumbu Karang 3D Nyata:
 * - SATU MESH UTUH MENYATU PENUH (Zero Hole, Zero Ring):
 *   Menggunakan satu plane besar beresolusi halus (12m x 12m, 96x96 segmen)
 *   yang di-displace menggunakan fungsi 2D Simplex & Multi-octave Harmonic Noise.
 * - Membentuk kontur naik-turun alami ala dasar laut: lembah lembut, punggung bukit pasir,
 *   dan riak gumuk pasir samudra berkesinambungan dari titik tengah (0,0) hingga kejauhan.
 * - Gradien warna Studio Ghibli: palung teal dalam (#143847), lereng toska (#2e7380),
 *   dan pasir keemasan terkena bias sinar matahari (#52a69e / #75ccb8).
 */
export function UnderwaterTerrain() {
  // 1. Satu mesh dasar laut utuh tak terputus (Single Continuous Displaced Plane)
  const terrainGeometry = useMemo(() => {
    // Plane 12m x 12m dengan subdivisi 96x96 (~9.400 vertices untuk kontur halus)
    const plane = new PlaneGeometry(12.0, 12.0, 96, 96);
    // Putar plane dari bidang XY ke bidang XZ (lantai horizontal)
    plane.rotateX(-Math.PI / 2);

    const posAttr = plane.attributes.position;
    const vertexCount = posAttr.count;
    const colors = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Hitung ketinggian dasar laut menggunakan fungsi noise kontinu
      const y = getTerrainHeight(x, z);
      posAttr.setY(i, y);

      // Hitung warna vertex Studio Ghibli berdasarkan elevasi dan riak cahaya
      const col = getTerrainVertexColor(x, z, y);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    posAttr.needsUpdate = true;
    plane.setAttribute("color", new Float32BufferAttribute(colors, 3));
    plane.computeVertexNormals();

    return plane;
  }, []);

  // 2. Cincin Tebing Melingkar Kejauhan 360° (Curved Panoramic Horizon Cliff)
  // Menutup perimeter horizon di kejauhan agar menyatu lembut dengan kabut air laut
  const distantCliffGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    const segments = 72;
    const radius = 5.6;
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const cliffTopColor = new Color("#8f1230");
    const cliffBaseColor = new Color("#470514");
    const tempCol = new Color();

    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const x = radius * Math.sin(angle);
      const z = -radius * Math.cos(angle);

      // Sambungkan dasar tebing tepat di elevasi tepi luar terrain
      const yBase = getTerrainHeight(x, z) - 0.05;

      const cliffPeak =
        Math.sin(angle * 5.0) * 0.45 +
        Math.cos(angle * 3.0 + 1.2) * 0.35 +
        Math.sin(angle * 9.0) * 0.18;

      const yTop = 0.65 + cliffPeak;

      vertices.push(x, yBase, z);
      colors.push(cliffBaseColor.r, cliffBaseColor.g, cliffBaseColor.b);

      vertices.push(x, yTop, z);
      tempCol.copy(cliffBaseColor).lerp(cliffTopColor, 0.9);
      colors.push(tempCol.r, tempCol.g, tempCol.b);
    }

    for (let s = 0; s < segments; s++) {
      const v0 = s * 2;
      const v1 = v0 + 1;
      const v2 = (s + 1) * 2;
      const v3 = v2 + 1;

      indices.push(v0, v1, v2);
      indices.push(v2, v1, v3);
    }

    geo.setIndex(indices);
    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Satu Mesh Dasar Laut Pasir Menyatu Penuh (Unified Ocean Floor) */}
      <mesh geometry={terrainGeometry}>
        <meshStandardMaterial
          vertexColors={true}
          roughness={0.96}
          metalness={0.0}
          side={DoubleSide}
        />
      </mesh>

      {/* 2. Siluet Tebing Melingkar Kejauhan 360° */}
      <mesh geometry={distantCliffGeometry}>
        <meshStandardMaterial
          vertexColors={true}
          roughness={0.96}
          metalness={0.0}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
export { getTerrainHeight } from "@/lib/terrain/terrainHeight";
