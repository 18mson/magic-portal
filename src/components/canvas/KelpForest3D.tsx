"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  MeshStandardMaterial,
} from "three";
import { getTerrainHeight } from "@/lib/terrain/terrainHeight";

interface KelpClumpConfig {
  pos: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  rotY: number;
}

/**
 * Membangun geometri rumpun rumput laut 3D (Cross-ribbon kelp stalks):
 * Terdiri dari bilah-bilah daun bersilangan 90° dan meliuk vertikal,
 * memiliki ketebalan nyata dan rimbun dari sudut pandang manapun 360°.
 */
function create3DKelpGeometry(height: number, width: number) {
  const geo = new BufferGeometry();
  const segments = 14; // Subdivisi lebih rapat agar lengkungan vertex shader halus alami
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const baseColor = new Color("#360614");   // Akar dekat pasir plum gelap
  const midColor = new Color("#941838");    // Batang tengah magenta-crimson
  const tipColor = new Color("#f472b6");    // Pucuk daun rose-pink muda
  const tempCol = new Color();

  // Buat 2 bilah daun bersilangan membentuk tanda silang (+)
  for (let b = 0; b < 2; b++) {
    const vertexOffset = b * (segments + 1) * 2;
    const isZAxis = b === 1;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 di akar, 1 di puncak
      const y = t * height;

      // Liukan organik daun rumput laut
      const curl = Math.sin(t * Math.PI * 1.5) * (width * 0.35);

      // Lebar daun membesar di tengah dan mengecil di ujung
      const leafWidth = width * (1.0 - t * 0.45) * Math.sin(t * Math.PI * 0.9 + 0.1);

      const xOffset = isZAxis ? 0 : leafWidth * 0.5;
      const zOffset = isZAxis ? leafWidth * 0.5 : 0;
      const curlX = isZAxis ? 0 : curl;
      const curlZ = isZAxis ? curl : 0;

      // Sisi kiri bilah
      vertices.push(-xOffset + curlX, y, -zOffset + curlZ);
      // Sisi kanan bilah
      vertices.push(xOffset + curlX, y, zOffset + curlZ);

      // Pewarnaan gradien vertikal
      if (t < 0.5) {
        tempCol.copy(baseColor).lerp(midColor, t / 0.5);
      } else {
        tempCol.copy(midColor).lerp(tipColor, (t - 0.5) / 0.5);
      }

      colors.push(tempCol.r, tempCol.g, tempCol.b);
      colors.push(tempCol.r, tempCol.g, tempCol.b);
    }

    // Bangun segitiga quad bilah
    for (let i = 0; i < segments; i++) {
      const v0 = vertexOffset + i * 2;
      const v1 = v0 + 1;
      const v2 = v0 + 2;
      const v3 = v0 + 3;

      indices.push(v0, v1, v2);
      indices.push(v1, v3, v2);
    }
  }

  geo.setIndex(indices);
  geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  return geo;
}

function SingleKelpClump({
  config,
  geometry,
  material,
}: {
  config: KelpClumpConfig;
  geometry: BufferGeometry;
  material: MeshStandardMaterial;
}) {
  const s = config.scale;

  return (
    <group position={config.pos} rotation={[0, config.rotY, 0]}>
      <group scale={[s, s, s]}>
        <mesh geometry={geometry} material={material} />
      </group>
    </group>
  );
}

/**
 * Komponen Hutan Rumput Laut 3D Nyata (3D Volumetric Kelp Forest):
 * - Tumbuh tertancap langsung dari permukaan terrain baru (getTerrainHeight).
 * - Tersebar di area tengah dan sekeliling luar cekungan pasir.
 * - Memiliki bentuk 3D bersilangan penuh, meliuk lembut mengikuti arus air bawah laut.
 */
export function KelpForest3D() {
  const kelpGeo = useMemo(() => create3DKelpGeometry(1.25, 0.28), []);

  // Ref untuk uniforms yang dapat dimutasi setiap frame tanpa melanggar immutability rules React
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uKelpHeight: { value: 1.25 },
  });

  // Shared material tunggal dengan injeksi Vertex Shader GPU (onBeforeCompile)
  // Menjamin 0 kalkulasi CPU per-rumpun: seluruh deformasi liukan dihitung di GPU.
  const kelpMaterial = useMemo(() => {
    const mat = new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.7,
      metalness: 0.05,
      side: DoubleSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniformsRef.current.uTime;
      shader.uniforms.uKelpHeight = uniformsRef.current.uKelpHeight;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uKelpHeight;
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>

        // 1. Ketinggian relatif daun dari pangkal (0.0 di akar, 1.0 di pucuk tertinggi)
        float normH = clamp(position.y / uKelpHeight, 0.0, 1.0);

        // 2. Amplitude 0 di pangkal (akar diam total di pasir dengan smoothstep cutoff di dasar)
        float bendFactor = smoothstep(0.015, 0.85, normH) * pow(normH, 1.8);

        // 3. Posisi unik per-instance rumpun diekstrak dari kolom translasi modelMatrix (world XZ)
        vec2 clumpPos = vec2(modelMatrix[3].x, modelMatrix[3].z);

        // 4. Hash deterministik untuk phase offset acak & sedikit variasi frekuensi per instance
        float clumpRandomPhase = fract(sin(dot(clumpPos, vec2(127.1, 311.7))) * 43758.5453) * 6.283185;
        float clumpSpeed = 0.85 + fract(sin(dot(clumpPos, vec2(269.5, 183.3))) * 43758.5453) * 0.35;

        // 5. Traveling Wave (gelombang merambat dari pangkal menuju pucuk daun seiring normH)
        // Formula: wavePhase = (waktu * frekuensi) - (posisiVertikal * waveNumber) + phaseOffset
        float waveTime = uTime * (clumpSpeed * 0.95) + clumpRandomPhase;
        float stalkWaveX = sin(waveTime * 1.15 - normH * 2.6 + clumpPos.x * 0.3);
        float stalkWaveZ = cos(waveTime * 0.9 - normH * 2.1 + clumpPos.y * 0.3);

        // 6. Riak getar mikro (micro-flutter) hanya di dekat pucuk daun
        float microFlutter = sin(waveTime * 2.6 - normH * 3.8) * 0.22 * pow(normH, 1.5);

        // 7. Simpangan lentur horizontal & kompensasi tinggi
        float swayX = (stalkWaveX + microFlutter) * 0.26 * bendFactor;
        float swayZ = (stalkWaveZ + microFlutter * 0.5) * 0.20 * bendFactor;
        float heightSag = -0.055 * bendFactor * (swayX * swayX + swayZ * swayZ);

        transformed.x += swayX;
        transformed.y += heightSag;
        transformed.z += swayZ;
        `
      );
    };

    mat.customProgramCacheKey = () => "kelp-forest-vertex-sway-v1";

    return mat;
  }, []);

  // Update uniform waktu HANYA SEKALI per frame untuk seluruh hutan kelp di scene
  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.getElapsedTime();
  });

  const kelpClumps: KelpClumpConfig[] = useMemo(() => {
    const rawData = [
      // 1. Rumpun Rumput Laut di Area Tengah (Center / Inner Seabed Clumps)
      { deg: 25,  r: 0.70, sc: 0.90, spd: 1.3 },
      { deg: 110, r: 0.85, sc: 0.95, spd: 1.15 },
      { deg: 175, r: 0.60, sc: 0.85, spd: 1.35 },
      { deg: 260, r: 0.75, sc: 0.90, spd: 1.2 },
      { deg: 320, r: 0.50, sc: 0.80, spd: 1.4 },

      // 2. Rumpun Rumput Laut Lingkar Luar (Outer Perimeter Clumps)
      { deg: 20,  r: 1.4,  sc: 1.05, spd: 1.2 },
      { deg: 45,  r: 1.7,  sc: 1.20, spd: 1.0 },
      { deg: 75,  r: 1.5,  sc: 0.95, spd: 1.4 },
      { deg: 110, r: 1.8,  sc: 1.15, spd: 1.1 },
      { deg: 135, r: 1.45, sc: 1.00, spd: 1.3 },
      { deg: 165, r: 1.75, sc: 1.25, spd: 0.95 },
      { deg: 195, r: 1.5,  sc: 1.10, spd: 1.15 },
      { deg: 220, r: 1.8,  sc: 1.20, spd: 1.05 },
      { deg: 250, r: 1.4,  sc: 0.90, spd: 1.35 },
      { deg: 275, r: 1.65, sc: 1.15, spd: 1.1 },
      { deg: 305, r: 1.45, sc: 1.05, spd: 1.25 },
      { deg: 330, r: 1.7,  sc: 1.20, spd: 1.0 },
      // Rumpun dekat kaki user
      { deg: 350, r: 1.15, sc: 0.85, spd: 1.4 },
      { deg: 10,  r: 1.10, sc: 0.88, spd: 1.3 },
    ];

    return rawData.map((k, idx) => {
      const rad = (k.deg * Math.PI) / 180;
      const x = Number((k.r * Math.sin(rad)).toFixed(3));
      const z = Number((-k.r * Math.cos(rad)).toFixed(3));
      // Tanam akar tepat di permukaan elevasi terrain
      const y = Number(getTerrainHeight(x, z).toFixed(3));

      return {
        pos: [x, y, z] as [number, number, number],
        scale: k.sc,
        speed: k.spd,
        phase: (idx * 1.4) % (Math.PI * 2),
        rotY: (idx * 0.7) % (Math.PI * 2),
      };
    });
  }, []);

  return (
    <group>
      {kelpClumps.map((cfg, i) => (
        <SingleKelpClump
          key={i}
          config={cfg}
          geometry={kelpGeo}
          material={kelpMaterial}
        />
      ))}
    </group>
  );
}
