"use client";

import { useMemo } from "react";
import { DoubleSide } from "three";
import { STATIC_OBSTACLES, StaticObstacle } from "@/lib/simulation/obstacles";

// ============================================================================
// 1. ORGANIC BRANCHING STAGHORN CORAL (Karang Tanduk Marun Bercabang Alami)
// ============================================================================
interface BranchProps {
  pos: [number, number, number];
  rot: [number, number, number];
  length: number;
  rBottom: number;
  rTop: number;
  color: string;
}

function BranchSegment({ pos, rot, length, rBottom, rTop, color }: BranchProps) {
  return (
    <group position={pos} rotation={rot}>
      {/* Batang silinder meruncing */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[rTop, rBottom, length, 8]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      {/* Ujung kubah bulat halus */}
      <mesh position={[0, length, 0]}>
        <sphereGeometry args={[rTop * 1.08, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Karang Tanduk Ranting Merah Marun (Deep Burgundy Staghorn):
 * Memiliki percabangan hierarkis 3 tingkat (Trunk -> Primary Branches -> Secondary Twigs)
 * yang meliuk mekar ke atas secara organik seperti pohon karang asli.
 */
function OrganicBurgundyStaghorn({ scale = 1.0, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Batang Pokok Utama */}
      <mesh position={[0, 0.14, 0]} rotation={[0.04, 0.1, -0.05]}>
        <cylinderGeometry args={[0.038, 0.065, 0.28, 8]} />
        <meshStandardMaterial color="#7a0a27" roughness={0.7} />
      </mesh>

      {/* 2. Cabang Primer Kiri */}
      <group position={[-0.04, 0.26, 0.02]} rotation={[0.15, 0.2, 0.42]}>
        <BranchSegment pos={[0, 0, 0]} rot={[0, 0, 0]} length={0.28} rBottom={0.032} rTop={0.022} color="#941337" />
        {/* Sub-ranting Kiri A */}
        <BranchSegment pos={[0, 0.22, 0.01]} rot={[0.1, 0.2, 0.35]} length={0.20} rBottom={0.018} rTop={0.012} color="#b31d45" />
        {/* Sub-ranting Kiri B */}
        <BranchSegment pos={[0, 0.16, -0.02]} rot={[-0.2, -0.3, -0.32]} length={0.18} rBottom={0.018} rTop={0.012} color="#a6173e" />
      </group>

      {/* 3. Cabang Primer Kanan */}
      <group position={[0.05, 0.25, -0.02]} rotation={[-0.1, -0.25, -0.38]}>
        <BranchSegment pos={[0, 0, 0]} rot={[0, 0, 0]} length={0.32} rBottom={0.034} rTop={0.022} color="#941337" />
        {/* Sub-ranting Kanan A */}
        <BranchSegment pos={[0, 0.24, 0.02]} rot={[-0.15, 0.1, -0.3]} length={0.22} rBottom={0.018} rTop={0.012} color="#ba2049" />
        {/* Sub-ranting Kanan B (Tegak ke atas) */}
        <BranchSegment pos={[0, 0.20, -0.02]} rot={[0.25, 0.3, 0.28]} length={0.24} rBottom={0.019} rTop={0.013} color="#a6173e" />
      </group>

      {/* 4. Cabang Depan Tengah */}
      <group position={[0.01, 0.27, 0.06]} rotation={[0.35, -0.15, 0.1]}>
        <BranchSegment pos={[0, 0, 0]} rot={[0, 0, 0]} length={0.25} rBottom={0.028} rTop={0.018} color="#a6173e" />
        <BranchSegment pos={[0, 0.19, 0.01]} rot={[0.2, 0.1, 0.25]} length={0.16} rBottom={0.015} rTop={0.010} color="#c72855" />
      </group>

      {/* 5. Cabang Belakang Menjulang Tinggi */}
      <group position={[-0.01, 0.28, -0.05]} rotation={[-0.32, 0.2, -0.08]}>
        <BranchSegment pos={[0, 0, 0]} rot={[0, 0, 0]} length={0.34} rBottom={0.030} rTop={0.018} color="#8c1132" />
        <BranchSegment pos={[0, 0.26, 0.01]} rot={[-0.15, -0.2, 0.2]} length={0.18} rBottom={0.015} rTop={0.010} color="#b31d45" />
      </group>
    </group>
  );
}

// ============================================================================
// 2. ORGANIC GLOWING WHITE ANTLER BUSH (Rumpun Karang Kipas Putih Tulang)
// ============================================================================

/**
 * Karang Ranting Kipas Putih Tulang (White Antler Coral Fan):
 * Rumpun cabang-cabang putih gading anggun dengan pucuk blushing pink lembut,
 * mekar menyebar ke atas persis seperti di ilustrasi referensi.
 */
function OrganicWhiteAntlerBush({ scale = 1.0, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  const branches = useMemo(
    () => [
      // Kumpulan cabang yang mekar menyebar melingkar 360°
      { x: -0.06, z: 0.04,  rotX: 0.18,  rotZ: 0.32,  len: 0.42, rB: 0.024, rT: 0.012, col: "#ffffff" },
      { x: 0.07,  z: -0.03, rotX: -0.12, rotZ: -0.36, len: 0.46, rB: 0.026, rT: 0.013, col: "#ffffff" },
      { x: 0.02,  z: 0.08,  rotX: 0.38,  rotZ: 0.08,  len: 0.38, rB: 0.022, rT: 0.011, col: "#fff2f5" },
      { x: -0.04, z: -0.07, rotX: -0.34, rotZ: -0.12, len: 0.40, rB: 0.023, rT: 0.012, col: "#ffffff" },
      // Cabang tengah menjulang tinggi
      { x: 0.00,  z: 0.01,  rotX: 0.05,  rotZ: -0.04, len: 0.52, rB: 0.028, rT: 0.014, col: "#ffffff" },
      // Ranting-ranting samping mekar
      { x: -0.11, z: 0.02,  rotX: 0.10,  rotZ: 0.55,  len: 0.32, rB: 0.018, rT: 0.009, col: "#ffe8ee" },
      { x: 0.12,  z: 0.03,  rotX: 0.12,  rotZ: -0.52, len: 0.34, rB: 0.018, rT: 0.009, col: "#ffe8ee" },
      { x: 0.05,  z: -0.10, rotX: -0.45, rotZ: 0.15,  len: 0.30, rB: 0.017, rT: 0.008, col: "#ffdbe4" },
    ],
    []
  );

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Pangkal batang putih menyatu */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.045, 0.065, 0.12, 8]} />
        <meshStandardMaterial color="#fff5f7" roughness={0.5} />
      </mesh>

      {branches.map((b, i) => (
        <group key={i} position={[b.x, 0.08, b.z]} rotation={[b.rotX, 0, b.rotZ]}>
          <mesh position={[0, b.len / 2, 0]}>
            <cylinderGeometry args={[b.rT, b.rB, b.len, 8]} />
            <meshStandardMaterial color={b.col} roughness={0.45} />
          </mesh>
          <mesh position={[0, b.len, 0]}>
            <sphereGeometry args={[b.rT * 1.15, 8, 8]} />
            <meshStandardMaterial color={b.col} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// 3. LAYERED SHELF PLATE CORAL (Karang Meja / Piringan Bertingkat)
// ============================================================================

function ShelfPlate({ y, radius, rot }: { y: number; radius: number; rot: [number, number, number] }) {
  return (
    <group position={[0, y, 0]} rotation={rot}>
      {/* Lempeng piringan bergelombang tipis */}
      <mesh scale={[radius, 0.02, radius * 0.85]}>
        <cylinderGeometry args={[1, 0.92, 1, 16]} />
        <meshStandardMaterial color="#a82142" roughness={0.7} side={DoubleSide} />
      </mesh>
      {/* Garis pinggiran bibir putih/krem berkilau khas karang meja */}
      <mesh scale={[radius * 1.02, 0.022, radius * 0.87]}>
        <cylinderGeometry args={[1, 0.98, 1, 16]} />
        <meshStandardMaterial color="#ffe4ec" roughness={0.6} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function LayeredShelfCoral({ scale = 1.0, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Batang penopang lempeng */}
      <mesh position={[0, 0.12, 0]} rotation={[0.08, 0, -0.1]}>
        <cylinderGeometry args={[0.05, 0.07, 0.24, 8]} />
        <meshStandardMaterial color="#5a091c" roughness={0.8} />
      </mesh>
      {/* Lempeng bertingkat 1 (Bawah - Besar) */}
      <ShelfPlate y={0.14} radius={0.24} rot={[0.1, 0.3, -0.15]} />
      {/* Lempeng bertingkat 2 (Tengah - Menjulang ke samping) */}
      <ShelfPlate y={0.24} radius={0.19} rot={[-0.15, -0.4, 0.18]} />
      {/* Lempeng bertingkat 3 (Atas - Kecil mekar) */}
      <ShelfPlate y={0.32} radius={0.14} rot={[0.05, 0.8, -0.08]} />
    </group>
  );
}

// ============================================================================
// 4. HOLLOW TUBE SPONGE CLUSTER (Spons Laut Tabung Berongga Nyata)
// ============================================================================

function SingleHollowTube({ height, radius, pos, rot }: { height: number; radius: number; pos: [number, number, number]; rot: [number, number, number] }) {
  return (
    <group position={pos} rotation={rot}>
      {/* Dinding tabung luar berwarna emas-amber */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 0.85, height, 12, 1, true]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.7} side={DoubleSide} />
      </mesh>
      {/* Bibir mulut tabung melengkung */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, radius * 0.14, 8, 16]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.65} />
      </mesh>
      {/* Rongga interior dalam gelap (shadow cavity) */}
      <mesh position={[0, height * 0.55, 0]}>
        <cylinderGeometry args={[radius * 0.88, radius * 0.75, height * 0.9, 10]} />
        <meshStandardMaterial color="#2d0603" roughness={0.95} />
      </mesh>
    </group>
  );
}

function HollowTubeSpongeCluster({ scale = 1.0, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tabung utama tinggi */}
      <SingleHollowTube height={0.32} radius={0.042} pos={[0, 0, 0]} rot={[0.08, 0, -0.06]} />
      {/* Tabung sekunder sedang */}
      <SingleHollowTube height={0.24} radius={0.036} pos={[-0.05, 0, 0.03]} rot={[-0.12, 0.3, 0.18]} />
      {/* Tabung ketiga pendek */}
      <SingleHollowTube height={0.16} radius={0.028} pos={[0.05, 0, -0.03]} rot={[0.15, -0.2, -0.15]} />
    </group>
  );
}

// ============================================================================
// 5. TENTACLED SEA ANEMONE CLUSTER (Bunga Karang Anemon Berumbai Tentakel)
// ============================================================================

function TentacledAnemone({ scale = 1.0, position = [0, 0, 0], color = "#fb7185" }: { scale?: number; position?: [number, number, number]; color?: string }) {
  const tentacles = useMemo(() => {
    const arr = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const flare = 0.35 + (i % 3) * 0.1;
      const len = 0.11 + (i % 2) * 0.04;
      arr.push({ angle, flare, len });
    }
    return arr;
  }, []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Piringan pusat anemon */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.04, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Tentakel-tentakel ramping mekar melengkung keluar */}
      {tentacles.map((t, idx) => (
        <group key={idx} rotation={[0, t.angle, 0]}>
          <mesh position={[0.03, t.len / 2, 0]} rotation={[0, 0, -t.flare]}>
            <cylinderGeometry args={[0.005, 0.009, t.len, 6]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0.03 + Math.sin(t.flare) * t.len, Math.cos(t.flare) * t.len, 0]}>
            <sphereGeometry args={[0.007, 6, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// 6. LOW REEF BEDROCK (Batu Karang Landai Pipih / Tertanam Pasir)
// BUKAN BOLA MENGGUMPAL! Berupa lempeng batuan pipih yang menyatu dengan dasar laut
// ============================================================================

function LowReefBedrock({ scale = 1.0 }: { scale: number }) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Plat landasan karang pipih rendah (tinggi hanya ~0.08m) */}
      <mesh position={[0, 0.04, 0]} scale={[0.62, 0.08, 0.52]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#2d050e" roughness={0.96} metalness={0.0} />
      </mesh>
      {/* Tonjolan batu kedua yang melandai */}
      <mesh position={[0.18, 0.05, -0.1]} scale={[0.38, 0.07, 0.32]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#3d0714" roughness={0.96} metalness={0.0} />
      </mesh>
      {/* Tonjolan batu ketiga samping */}
      <mesh position={[-0.16, 0.04, 0.12]} scale={[0.34, 0.06, 0.30]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#470918" roughness={0.96} metalness={0.0} />
      </mesh>
    </group>
  );
}

// ============================================================================
// 7. KOMPONEN FORMASI TERUMBU KARANG UTUH (ORGANIC MODULAR REEF FORMATION)
// ============================================================================

interface CoralClusterProps {
  obstacle: StaticObstacle;
}

function SingleOrganicCoralFormation({ obstacle }: CoralClusterProps) {
  const s = obstacle.scale;

  // Variasi formasi organik berdasarkan ID agar kaya keanekaragaman hayati
  const formationVariant = Math.abs(
    obstacle.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % 3;

  return (
    <group position={obstacle.pos} rotation={[0, obstacle.rotY, 0]}>
      {/* 1. Landasan Batu Karang Pipih Landai (Bukan Bola Menggumpal!) */}
      <LowReefBedrock scale={s} />

      {/* 2. Vegetasi Karang Berdasarkan Variasi */}
      {formationVariant === 0 && (
        <>
          {/* Karang Kipas Putih Tulang Utama */}
          <OrganicWhiteAntlerBush scale={s * 1.15} position={[0.04, 0.06, -0.02]} />
          {/* Karang Tanduk Marun Pendamping */}
          <OrganicBurgundyStaghorn scale={s * 0.75} position={[-0.18, 0.05, 0.08]} />
          {/* Anemon Pink Berumbai */}
          <TentacledAnemone scale={s * 1.1} position={[0.16, 0.08, 0.14]} color="#fb7185" />
          {/* Spons Tabung Kuning */}
          <HollowTubeSpongeCluster scale={s * 0.85} position={[-0.14, 0.05, -0.12]} />
        </>
      )}

      {formationVariant === 1 && (
        <>
          {/* Karang Tanduk Ranting Merah Marun Utama Menjulang */}
          <OrganicBurgundyStaghorn scale={s * 1.25} position={[-0.02, 0.06, 0.02]} />
          {/* Karang Meja Bertingkat */}
          <LayeredShelfCoral scale={s * 1.05} position={[0.20, 0.05, -0.04]} />
          {/* Karang Kipas Putih Kecil */}
          <OrganicWhiteAntlerBush scale={s * 0.65} position={[-0.16, 0.06, -0.12]} />
          {/* Anemon Mutiara Putih Berumbai */}
          <TentacledAnemone scale={s * 0.95} position={[0.12, 0.07, 0.16]} color="#ffffff" />
        </>
      )}

      {formationVariant === 2 && (
        <>
          {/* Karang Meja Bertingkat Utama */}
          <LayeredShelfCoral scale={s * 1.2} position={[0.05, 0.06, 0.02]} />
          {/* Karang Kipas Putih Menyala */}
          <OrganicWhiteAntlerBush scale={s * 0.95} position={[-0.15, 0.06, 0.06]} />
          {/* Spons Tabung Kuning Keemasan Rimbun */}
          <HollowTubeSpongeCluster scale={s * 1.15} position={[0.18, 0.05, -0.14]} />
          {/* Anemon Pink Menyala */}
          <TentacledAnemone scale={s * 1.05} position={[-0.08, 0.07, -0.16]} color="#f43f5e" />
        </>
      )}
    </group>
  );
}

/**
 * Komponen Formasi Terumbu Karang 3D Alami (Organic 3D Coral Reefs):
 * - Mengganti total tumpukan bola/dodecahedron kaku dengan arsitektur karang bercabang nyata.
 * - Menggabungkan Karang Ranting Marun, Kipas Putih Tulang, Karang Meja, dan Spons Tabung Berongga.
 * - Tertanam rapi dan alami di atas permukaan pasir dasar laut.
 */
export function CoralReef3D() {
  return (
    <group>
      {STATIC_OBSTACLES.map((obs) => (
        <SingleOrganicCoralFormation key={obs.id} obstacle={obs} />
      ))}
    </group>
  );
}

export { STATIC_OBSTACLES } from "@/lib/simulation/obstacles";
