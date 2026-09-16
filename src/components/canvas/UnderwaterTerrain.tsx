"use client";

import { useMemo } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
} from "three";

/**
 * Komponen Dasar Laut Pasir & Bukit Terumbu Karang 3D Nyata:
 * - Menutup lubang di tengah secara 100% dengan lantai dasar pasir laut (sandy seabed basin).
 * - Lantai pasir di tengah melandai lembut dengan riak pasir alami, kemudian naik membentuk
 *   lereng bukit terumbu karang 3D melingkar 360° yang solid dan tebing panorama di kejauhan.
 * - Gradien warna Ghibli: pasir turquoise-gold di tengah, lereng teal di bukit, dan puncak kehijauan.
 */
export function UnderwaterTerrain() {
  // Geometri dasar laut utuh dari radius 0 (tengah) hingga 5.2m (tebing luar)
  const terrainGeometry = useMemo(() => {
    const geo = new BufferGeometry();

    const radialSegments = 72; // Segmen melingkar
    const rings = 18;          // Jumlah cincin konsentris dari pusat ke luar
    const maxRadius = 5.2;

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Palet warna alami Studio Ghibli
    const sandCenterColor = new Color("#4a9e96"); // Lantai pasir tengah
    const sandRippleColor = new Color("#5dbdae"); // Bias riak pasir terkena cahaya
    const slopeColor = new Color("#256a77");      // Lereng bukit teal
    const crestColor = new Color("#5ebca9");      // Puncak bukit karang
    const floorDark = new Color("#0e2f38");       // Palung dasar bukit luar
    const tempColor = new Color();

    // 1. Vertex Pusat (Pusat lantai pasir di bawah kaki user, r = 0)
    vertices.push(0, -0.58, 0);
    colors.push(sandCenterColor.r, sandCenterColor.g, sandCenterColor.b);

    // 2. Vertex Cincin Konsentris (r = 1 sampai rings)
    for (let r = 1; r <= rings; r++) {
      const ringRatio = r / rings;
      const radius = ringRatio * maxRadius;

      for (let s = 0; s < radialSegments; s++) {
        const angle = (s / radialSegments) * Math.PI * 2;
        const x = Number((radius * Math.sin(angle)).toFixed(4));
        const z = Number((-radius * Math.cos(angle)).toFixed(4));

        let y = -0.58;

        if (radius < 1.7) {
          // Zona Lantai Pasir Tengah (Sandy Basin):
          // Landai halus dengan riak gelombang mikro di dasar pasir
          const sandRipples =
            Math.sin(radius * 7.0 + angle * 2.0) * 0.02 +
            Math.cos(x * 5.0 + z * 5.0) * 0.015;
          y = -0.58 + sandRipples + (radius / 1.7) * 0.05;

          const rippleFactor = (sandRipples + 0.03) / 0.06;
          tempColor.copy(sandCenterColor).lerp(sandRippleColor, Math.max(0, Math.min(1, rippleFactor)));
        } else {
          // Zona Bukit Karang 3D (Coral Dunes & Hills):
          // Mulai naik dari lantai pasir membentuk bukit melingkar bervolume
          const hillRatio = (radius - 1.7) / (maxRadius - 1.7); // 0 di bibir pasir, 1 di luar
          const elevationCurve = Math.sin(hillRatio * Math.PI);

          const wave1 = Math.sin(angle * 4.0) * 0.42;
          const wave2 = Math.cos(angle * 2.0 + 0.8) * 0.3;
          const wave3 = Math.sin(angle * 7.0 + 1.2) * 0.16;
          const hillWave = wave1 + wave2 + wave3;

          y = -0.53 + (hillWave + 0.5) * elevationCurve * 1.3;

          const heightFactor = Math.min(Math.max((y + 0.53) / 1.2, 0), 1);
          if (heightFactor > 0.45) {
            tempColor.copy(slopeColor).lerp(crestColor, (heightFactor - 0.45) / 0.55);
          } else {
            tempColor.copy(floorDark).lerp(slopeColor, heightFactor / 0.45);
          }
        }

        vertices.push(x, y, z);
        colors.push(tempColor.r, tempColor.g, tempColor.b);
      }
    }

    // 3. Indeks Segitiga Pusat (Hubungkan titik tengah index 0 ke Ring 1)
    for (let s = 0; s < radialSegments; s++) {
      const nextS = (s + 1) % radialSegments;
      const vCurrent = 1 + s;
      const vNext = 1 + nextS;
      // Triangle Fan dari titik pusat
      indices.push(0, vNext, vCurrent);
    }

    // 4. Indeks Quad-Strips untuk Cincin-cincin Berikutnya
    for (let r = 1; r < rings; r++) {
      const currentRingStart = 1 + (r - 1) * radialSegments;
      const nextRingStart = 1 + r * radialSegments;

      for (let s = 0; s < radialSegments; s++) {
        const nextS = (s + 1) % radialSegments;

        const c0 = currentRingStart + s;
        const c1 = currentRingStart + nextS;
        const n0 = nextRingStart + s;
        const n1 = nextRingStart + nextS;

        indices.push(c0, n1, c1);
        indices.push(c0, n0, n1);
      }
    }

    geo.setIndex(indices);
    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, []);

  // Cincin Tebing Melingkar Kejauhan (Curved Panoramic Cliff Ring 360°)
  const distantCliffGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    const segments = 64;
    const radius = 5.3;
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const cliffTopColor = new Color("#3c929a");
    const cliffBaseColor = new Color("#103a43");
    const tempCol = new Color();

    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const x = radius * Math.sin(angle);
      const z = -radius * Math.cos(angle);

      const cliffPeak =
        Math.sin(angle * 5.0) * 0.45 +
        Math.cos(angle * 3.0 + 1.2) * 0.35 +
        Math.sin(angle * 9.0) * 0.18;

      const yBottom = -0.65;
      const yTop = 0.55 + cliffPeak;

      vertices.push(x, yBottom, z);
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
    <group position={[0, -0.05, 0]}>
      {/* Dasar Laut Pasir Utuh & Bukit Karang 3D (Zero Hole) */}
      <mesh geometry={terrainGeometry}>
        <meshStandardMaterial
          vertexColors={true}
          roughness={0.88}
          metalness={0.04}
          side={DoubleSide}
        />
      </mesh>

      {/* Siluet Tebing Melingkar Kejauhan 360° */}
      <mesh geometry={distantCliffGeometry}>
        <meshStandardMaterial
          vertexColors={true}
          roughness={0.92}
          metalness={0.0}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
