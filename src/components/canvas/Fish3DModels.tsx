"use client";

import { useRef, useMemo } from "react";
import { Group, DoubleSide, Shape } from "three";
import { useFrame } from "@react-three/fiber";

// ============================================================================
// 1. 3D HERO MANTA RAY (Pari Manta Raksasa 3D - Velvet Burgundy & Luminous White)
// ============================================================================
export interface MantaMesh3DProps {
  scale?: number;
  speed?: number;
  phase?: number;
}

export function MantaMesh3D({ scale = 1.0, speed = 1.0, phase = 0 }: MantaMesh3DProps) {
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);

  // Bentuk sayap melengkung ala Manta Ray
  const wingShape = useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.65, 0.15, 1.25, -0.15);
    s.quadraticCurveTo(0.85, -0.65, 0.2, -0.75);
    s.quadraticCurveTo(0.05, -0.35, 0, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const flap = Math.sin(t * (speed * 2.2) + phase) * 0.22;

    if (leftWingRef.current) {
      leftWingRef.current.rotation.y = flap * 0.8;
      leftWingRef.current.rotation.z = flap * 0.35;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.y = -flap * 0.8;
      rightWingRef.current.rotation.z = -flap * 0.35;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * (speed * 2.2) + phase) * 0.15;
    }
  });

  return (
    <group scale={scale}>
      {/* 1. Badan Tengah Aerodinamis (Dark Velvet Burgundy) */}
      <mesh position={[0, 0, 0]} scale={[0.42, 0.12, 0.65]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial
          color="#380410"
          roughness={0.45}
          metalness={0.06}
        />
      </mesh>

      {/* Perut Bawah Putih Bersinar (Luminous Cream-White Belly) */}
      <mesh position={[0, -0.025, 0]} scale={[0.39, 0.09, 0.62]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial
          color="#fff5f7"
          roughness={0.3}
          metalness={0.04}
        />
      </mesh>

      {/* Bintik Punggung Khas Rose-Coral Glow */}
      <group position={[0, 0.065, -0.05]}>
        {[-0.08, 0, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0, (i % 2) * 0.08]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color="#f472b6" />
          </mesh>
        ))}
      </group>

      {/* 2. Tanduk Sefalik Depan (Cephalic Horns) */}
      <group position={[-0.12, -0.01, 0.42]} rotation={[0.2, -0.25, 0]}>
        <mesh scale={[0.045, 0.03, 0.14]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color="#4d0718" roughness={0.5} />
        </mesh>
      </group>
      <group position={[0.12, -0.01, 0.42]} rotation={[0.2, 0.25, 0]}>
        <mesh scale={[0.045, 0.03, 0.14]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color="#4d0718" roughness={0.5} />
        </mesh>
      </group>

      {/* 3. Sayap Kiri Berartikulasi */}
      <group ref={leftWingRef} position={[-0.15, 0, 0.05]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <mesh scale={[0.7, 0.65, 0.7]}>
          <extrudeGeometry args={[wingShape, extrudeSettings]} />
          <meshStandardMaterial
            color="#3d0512"
            roughness={0.45}
            metalness={0.06}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. Sayap Kanan Berartikulasi */}
      <group ref={rightWingRef} position={[0.15, 0, 0.05]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh scale={[0.7, 0.65, 0.7]}>
          <extrudeGeometry args={[wingShape, extrudeSettings]} />
          <meshStandardMaterial
            color="#3d0512"
            roughness={0.45}
            metalness={0.06}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* 5. Ekor Cambuk Panjang Meruncing */}
      <group ref={tailRef} position={[0, -0.01, -0.42]} rotation={[0.05, 0, 0]}>
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.003, 0.9, 8]} />
          <meshStandardMaterial color="#210309" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 2. 3D GOLDEN BUTTERFLY-ANGELFISH (Ikan Bidadari Kuning Bergaris Putih & Marun)
// Sesuai Persis dengan Ikan Utama di Ilustrasi Referensi
// ============================================================================
export interface BlueAngelMesh3DProps {
  scale?: number;
  speed?: number;
  phase?: number;
}

export function BlueAngelMesh3D({ scale = 1.0, speed = 1.0, phase = 0 }: BlueAngelMesh3DProps) {
  const tailGroupRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const wiggle = Math.sin(t * (speed * 4.2) + phase) * 0.28;
    if (tailGroupRef.current) {
      tailGroupRef.current.rotation.y = wiggle;
    }
  });

  return (
    <group scale={scale}>
      {/* 1. Badan Utama Pipih Oval - Vibrant Golden Yellow */}
      <mesh position={[0, 0, 0]} scale={[0.09, 0.36, 0.44]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Garis Tebal Putih Kontras Melintang di Badan (White Band khas ilustrasi) */}
      <mesh position={[0, -0.02, 0.06]} scale={[0.095, 0.35, 0.14]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
        />
      </mesh>

      {/* Aksen Punggung Atas Merah Marun Gelap (Burgundy Dorsal Cap) */}
      <mesh position={[0, 0.16, -0.06]} scale={[0.092, 0.18, 0.26]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#4c0519" roughness={0.4} />
      </mesh>

      {/* 2. Moncong Mulut Putih Cerah */}
      <mesh position={[0, -0.04, 0.38]} scale={[0.045, 0.055, 0.1]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>

      {/* 3. Mata Bulat Hitam dengan Cincin Putih (Kiri & Kanan) */}
      <group position={[-0.088, 0.05, 0.22]}>
        <mesh scale={[0.02, 0.055, 0.055]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.012, 0, 0]} scale={[0.012, 0.035, 0.035]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#111827" />
        </mesh>
      </group>
      <group position={[0.088, 0.05, 0.22]}>
        <mesh scale={[0.02, 0.055, 0.055]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.012, 0, 0]} scale={[0.012, 0.035, 0.035]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#111827" />
        </mesh>
      </group>

      {/* 4. Sirip Punggung Atas Menjulang Kuning Keemasan dengan Lis Marun */}
      <mesh position={[0, 0.35, -0.05]} rotation={[-0.45, 0, 0]} scale={[0.02, 0.24, 0.16]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.4}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.22, 0.08]} rotation={[-0.25, 0, 0]} scale={[0.025, 0.16, 0.22]}>
        <coneGeometry args={[1, 1.6, 8]} />
        <meshStandardMaterial color="#4c0519" roughness={0.4} />
      </mesh>

      {/* 5. Sirip Bawah Anus (Anal Fin) */}
      <mesh position={[0, -0.32, -0.08]} rotation={[0.4, 0, 0]} scale={[0.02, 0.2, 0.14]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.4}
          side={DoubleSide}
        />
      </mesh>

      {/* 6. Sungut / Sirip Dada Kuning Cerah */}
      <mesh position={[-0.04, -0.34, 0.1]} rotation={[0.25, 0, -0.15]}>
        <cylinderGeometry args={[0.006, 0.002, 0.42, 6]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
      <mesh position={[0.04, -0.34, 0.1]} rotation={[0.25, 0, 0.15]}>
        <cylinderGeometry args={[0.006, 0.002, 0.42, 6]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>

      {/* 7. Ekor Kipas Kuning dengan Lis Putih */}
      <group ref={tailGroupRef} position={[0, 0, -0.32]}>
        <mesh scale={[0.035, 0.12, 0.14]} position={[0, 0, -0.06]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.22]} rotation={[0, Math.PI / 2, 0]} scale={[0.28, 0.32, 0.02]}>
          <coneGeometry args={[1, 1.4, 10]} />
          <meshStandardMaterial
            color="#facc15"
            roughness={0.35}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 3. 3D GOLDEN TANG (Ikan Bulat Kuning-Putih Montok)
// ============================================================================
export interface RoundTangMesh3DProps {
  scale?: number;
  speed?: number;
  phase?: number;
}

export function RoundTangMesh3D({ scale = 1.0, speed = 1.0, phase = 0 }: RoundTangMesh3DProps) {
  const tailRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const wiggle = Math.sin(t * (speed * 7.5) + phase) * 0.32;
    if (tailRef.current) {
      tailRef.current.rotation.y = wiggle;
    }
  });

  return (
    <group scale={scale}>
      {/* 1. Badan Bulat Montok - Kuning Keemasan Hangat */}
      <mesh position={[0, 0, 0]} scale={[0.16, 0.36, 0.38]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Garis Horizontal Putih Bersih di Samping Badan (Khas Ilustrasi) */}
      <mesh position={[0, -0.02, 0.02]} scale={[0.166, 0.15, 0.36]}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
        />
      </mesh>

      {/* Punggung Atas Aksen Marun Hangat */}
      <mesh position={[0, 0.16, -0.04]} scale={[0.15, 0.18, 0.28]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#57081b" roughness={0.4} />
      </mesh>

      {/* 2. Mata Bulat Besar */}
      <group position={[-0.14, 0.08, 0.16]}>
        <mesh scale={[0.025, 0.07, 0.07]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.015, 0, 0]} scale={[0.015, 0.045, 0.045]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
      </group>
      <group position={[0.14, 0.08, 0.16]}>
        <mesh scale={[0.025, 0.07, 0.07]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.015, 0, 0]} scale={[0.015, 0.045, 0.045]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* 3. Sirip Punggung Bulat Kuning */}
      <mesh position={[0, 0.28, -0.05]} rotation={[-0.2, 0, 0]} scale={[0.02, 0.12, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.4}
          side={DoubleSide}
        />
      </mesh>

      {/* 4. Sirip Perut */}
      <mesh position={[0, -0.28, -0.06]} rotation={[0.2, 0, 0]} scale={[0.02, 0.1, 0.22]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.4}
          side={DoubleSide}
        />
      </mesh>

      {/* 5. Sirip Dada Putih/Kuning */}
      <mesh position={[-0.15, -0.05, 0.02]} rotation={[0.3, 0.4, -0.2]} scale={[0.015, 0.07, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} side={DoubleSide} />
      </mesh>
      <mesh position={[0.15, -0.05, 0.02]} rotation={[0.3, -0.4, 0.2]} scale={[0.015, 0.07, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} side={DoubleSide} />
      </mesh>

      {/* 6. Ekor Berartikulasi Kuning Cerah */}
      <group ref={tailRef} position={[0, 0, -0.3]}>
        <mesh scale={[0.04, 0.12, 0.1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.16]} rotation={[0, Math.PI / 2, 0]} scale={[0.22, 0.26, 0.02]}>
          <coneGeometry args={[1, 1.3, 8]} />
          <meshStandardMaterial
            color="#facc15"
            roughness={0.35}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 4. 3D SCHOOL MINNOW (Ikan Kecil Kawanan: Varian Kuning Emas & Pink Cerah)
// Menyerupai kawanan ikan kuning dan gerombolan krill pink di ilustrasi
// ============================================================================
export interface SchoolMinnowMesh3DProps {
  scale?: number;
  speed?: number;
  phase?: number;
  variant?: "gold" | "teal";
}

export function SchoolMinnowMesh3D({
  scale = 1.0,
  speed = 1.0,
  phase = 0,
  variant = "gold",
}: SchoolMinnowMesh3DProps) {
  const tailRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const wiggle = Math.sin(t * (speed * 6.5) + phase) * 0.35;
    if (tailRef.current) {
      tailRef.current.rotation.y = wiggle;
    }
  });

  // Varian Gold = Ikan Kuning Bergaris Putih
  // Varian Teal (di-repurpose) = Ikan Pink Cerah Khas Krill Ilustrasi
  const mainColor = variant === "gold" ? "#facc15" : "#f472b6";
  const lightColor = "#ffffff";
  const darkColor = variant === "gold" ? "#d97706" : "#db2777";

  return (
    <group scale={scale}>
      {/* 1. Badan Ramping Torpedo */}
      <mesh position={[0, 0, 0]} scale={[0.08, 0.16, 0.42]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={mainColor} roughness={0.35} />
      </mesh>

      {/* Garis Putih Perut Khas Ilustrasi */}
      <mesh position={[0, -0.04, 0.02]} scale={[0.075, 0.08, 0.38]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color={lightColor} roughness={0.3} />
      </mesh>

      {/* 2. Mata 3D (Kiri & Kanan) */}
      <mesh position={[-0.075, 0.03, 0.25]} scale={[0.015, 0.03, 0.03]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
      <mesh position={[0.075, 0.03, 0.25]} scale={[0.015, 0.03, 0.03]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#111827" />
      </mesh>

      {/* 3. Sirip Punggung Tipis */}
      <mesh position={[0, 0.14, -0.05]} rotation={[-0.3, 0, 0]} scale={[0.012, 0.08, 0.14]}>
        <coneGeometry args={[1, 1.2, 6]} />
        <meshStandardMaterial color={mainColor} side={DoubleSide} />
      </mesh>

      {/* 4. Ekor Bercabang Berartikulasi */}
      <group ref={tailRef} position={[0, 0, -0.3]}>
        <mesh position={[0, 0, -0.1]} rotation={[0, Math.PI / 2, 0]} scale={[0.15, 0.18, 0.015]}>
          <coneGeometry args={[1, 1.2, 6]} />
          <meshStandardMaterial color={darkColor} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 5. 3D SCHOOL CLUSTER (Gugusan Kawanan 3 Ikan Kecil 3D)
// ============================================================================
export interface SchoolCluster3DProps {
  scale?: number;
  speed?: number;
  phase?: number;
}

export function SchoolCluster3D({
  scale = 1.0,
  speed = 1.0,
  phase = 0,
}: SchoolCluster3DProps) {
  return (
    <group scale={scale}>
      <group position={[0, 0, 0]}>
        <SchoolMinnowMesh3D scale={0.72} speed={speed} phase={phase} variant="gold" />
      </group>
      <group position={[0.18, 0.08, -0.14]}>
        <SchoolMinnowMesh3D scale={0.56} speed={speed * 1.1} phase={phase + 1.2} variant="teal" />
      </group>
      <group position={[-0.16, -0.07, -0.18]}>
        <SchoolMinnowMesh3D scale={0.6} speed={speed * 0.95} phase={phase + 2.4} variant="gold" />
      </group>
    </group>
  );
}
