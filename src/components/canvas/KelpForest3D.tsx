"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
} from "three";

interface KelpClumpConfig {
  pos: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  rotY: number;
}

/**
 * Membangun geometri rumpun rumput laut 3D (Cross-ribbon kelp stalks):
 * Terdiri dari bilah-bilah daun rumput laut bersilangan 90° dan meliuk vertikal,
 * sehingga memiliki ketebalan nyata dan terlihat rimbun dari sudut pandang manapun 360°.
 */
function create3DKelpGeometry(height: number, width: number) {
  const geo = new BufferGeometry();
  const segments = 8;
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const baseColor = new Color("#165440");   // Akar dekat pasir
  const midColor = new Color("#35a37e");    // Batang tengah
  const tipColor = new Color("#7ce2b8");    // Pucuk daun muda
  const tempCol = new Color();

  // Buat 2 bilah daun bersilangan membentuk tanda silang (+)
  // Bilah 1 pada bidang X-Y, Bilah 2 pada bidang Z-Y
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
}: {
  config: KelpClumpConfig;
  geometry: BufferGeometry;
}) {
  const groupRef = useRef<Group>(null);

  // Animasi liukan lembut rumput laut mengikuti arus air (akar tetap di pasir)
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const time = t * config.speed + config.phase;

    // Ayunan meliuk di pucuk
    groupRef.current.rotation.z = Math.sin(time) * 0.12;
    groupRef.current.rotation.x = Math.cos(time * 0.8) * 0.08;
  });

  const s = config.scale;

  return (
    <group position={config.pos} rotation={[0, config.rotY, 0]}>
      <group ref={groupRef} scale={[s, s, s]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            vertexColors={true}
            roughness={0.7}
            metalness={0.05}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Komponen Hutan Rumput Laut 3D Nyata (3D Volumetric Kelp Forest):
 * - Tumbuh tertancap langsung dari dasar lantai pasir.
 * - Memiliki bentuk 3D bersilangan penuh, tidak akan pernah terlihat tipis seperti kertas.
 * - Meliuk lembut mengikuti arus air bawah laut.
 */
export function KelpForest3D() {
  const kelpGeo = useMemo(() => create3DKelpGeometry(1.25, 0.28), []);

  // 14 rumpun rumput laut 3D tertanam melingkar di sekeliling lantai pasir
  const kelpClumps: KelpClumpConfig[] = useMemo(() => {
    const rawData = [
      { deg: 20,  r: 1.3, y: -0.56, sc: 1.05, spd: 1.2 },
      { deg: 45,  r: 1.6, y: -0.54, sc: 1.2,  spd: 1.0 },
      { deg: 75,  r: 1.4, y: -0.55, sc: 0.95, spd: 1.4 },
      { deg: 110, r: 1.7, y: -0.53, sc: 1.15, spd: 1.1 },
      { deg: 135, r: 1.35, y: -0.56, sc: 1.0, spd: 1.3 },
      { deg: 165, r: 1.65, y: -0.53, sc: 1.25, spd: 0.95 },
      { deg: 195, r: 1.4, y: -0.55, sc: 1.1,  spd: 1.15 },
      { deg: 220, r: 1.7, y: -0.53, sc: 1.2,  spd: 1.05 },
      { deg: 250, r: 1.3, y: -0.56, sc: 0.9,  spd: 1.35 },
      { deg: 275, r: 1.55, y: -0.54, sc: 1.15, spd: 1.1 },
      { deg: 305, r: 1.35, y: -0.56, sc: 1.05, spd: 1.25 },
      { deg: 330, r: 1.6, y: -0.54, sc: 1.2,  spd: 1.0 },
      // 2 rumpun di bibir pasir depan dekat user
      { deg: 350, r: 1.15, y: -0.57, sc: 0.85, spd: 1.4 },
      { deg: 10,  r: 1.1, y: -0.57, sc: 0.88, spd: 1.3 },
    ];

    return rawData.map((k, idx) => {
      const rad = (k.deg * Math.PI) / 180;
      const x = Number((k.r * Math.sin(rad)).toFixed(3));
      const z = Number((-k.r * Math.cos(rad)).toFixed(3));
      return {
        pos: [x, k.y, z] as [number, number, number],
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
        <SingleKelpClump key={i} config={cfg} geometry={kelpGeo} />
      ))}
    </group>
  );
}
