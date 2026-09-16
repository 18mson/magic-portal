"use client";

import { useMemo } from "react";

interface CoralClusterConfig {
  pos: [number, number, number];
  rotY: number;
  scale: number;
}

function SingleCoralFormation({ config }: { config: CoralClusterConfig }) {
  const s = config.scale;

  return (
    <group position={config.pos} rotation={[0, config.rotY, 0]} scale={[s, s, s]}>
      {/* Batu karang dasar utama (Dark Teal Reef Rock) */}
      <mesh position={[0, 0.15, 0]}>
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#1e545e" roughness={0.9} />
      </mesh>

      {/* Bongkahan karang bulat kedua (Orange Coral Rock) */}
      <mesh position={[-0.22, 0.22, 0.1]}>
        <dodecahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color="#d4614a" roughness={0.8} />
      </mesh>

      {/* Bongkahan karang ketiga (Warm Peach Branch Rock) */}
      <mesh position={[0.25, 0.18, -0.08]}>
        <dodecahedronGeometry args={[0.26, 1]} />
        <meshStandardMaterial color="#e8765e" roughness={0.8} />
      </mesh>

      {/* Koloni anemon bulat cerah (Turquoise Sea Anemone Cluster) */}
      <group position={[0.05, 0.48, 0.05]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#55e2c5" roughness={0.5} />
        </mesh>
        <mesh position={[-0.09, -0.04, 0.07]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#6bead1" roughness={0.5} />
        </mesh>
        <mesh position={[0.08, -0.03, -0.06]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#40c4a9" roughness={0.5} />
        </mesh>
      </group>

      {/* Koloni anemon merah muda (Coral Pink Anemone) */}
      <group position={[-0.2, 0.42, 0.12]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#f78c98" roughness={0.5} />
        </mesh>
        <mesh position={[0.07, -0.02, 0.05]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial color="#ffabb4" roughness={0.5} />
        </mesh>
      </group>

      {/* Spons tabung laut (Yellow-Orange Tube Sponges) */}
      <group position={[0.22, 0.38, 0.08]}>
        <mesh position={[0, 0.1, 0]} rotation={[0.1, 0, -0.15]}>
          <cylinderGeometry args={[0.04, 0.055, 0.28, 10]} />
          <meshStandardMaterial color="#f0964d" roughness={0.7} />
        </mesh>
        <mesh position={[-0.07, 0.06, -0.05]} rotation={[-0.1, 0, 0.2]}>
          <cylinderGeometry args={[0.035, 0.048, 0.22, 10]} />
          <meshStandardMaterial color="#e07d3b" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Komponen Formasi Karang 3D Nyata (3D Coral Reef Formations):
 * - Objek 3D solid bervolume nyata yang tertancap di atas lantai pasir.
 * - Menggantikan plane 2D tipis sehingga tidak pernah gepeng saat dilihat dari sudut samping manapun.
 */
export function CoralReef3D() {
  // 8 gugusan karang 3D bervolume ditanam melingkar di sekeliling cekungan pasir
  const coralFormations: CoralClusterConfig[] = useMemo(() => {
    const rawAngles = [
      { deg: 10,  r: 1.8, y: -0.55, sc: 1.15, rot: 0.2 },
      { deg: 55,  r: 2.1, y: -0.52, sc: 1.25, rot: 1.1 },
      { deg: 100, r: 1.9, y: -0.54, sc: 1.1,  rot: 2.0 },
      { deg: 145, r: 2.2, y: -0.51, sc: 1.3,  rot: 2.9 },
      { deg: 190, r: 1.85, y: -0.55, sc: 1.15, rot: 3.8 },
      { deg: 235, r: 2.15, y: -0.52, sc: 1.25, rot: 4.7 },
      { deg: 280, r: 1.95, y: -0.53, sc: 1.2,  rot: 5.4 },
      { deg: 325, r: 2.3, y: -0.50, sc: 1.35, rot: 0.8 },
    ];

    return rawAngles.map((c) => {
      const rad = (c.deg * Math.PI) / 180;
      const x = Number((c.r * Math.sin(rad)).toFixed(3));
      const z = Number((-c.r * Math.cos(rad)).toFixed(3));
      return {
        pos: [x, c.y, z] as [number, number, number],
        rotY: c.rot,
        scale: c.sc,
      };
    });
  }, []);

  return (
    <group>
      {coralFormations.map((cfg, i) => (
        <SingleCoralFormation key={i} config={cfg} />
      ))}
    </group>
  );
}
