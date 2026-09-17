"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import {
  MantaMesh3D,
  BlueAngelMesh3D,
  RoundTangMesh3D,
  SchoolMinnowMesh3D,
} from "./Fish3DModels";
import {
  BoidsSimulationEngine,
  createBoidAgent,
  BoidAgent,
} from "@/lib/simulation/boidsEngine";
import { STATIC_OBSTACLES } from "@/lib/simulation/obstacles";
import { getTerrainHeight } from "@/lib/terrain/terrainHeight";
import { creatureInspection } from "@/lib/diorama/speciesData";

/**
 * Komponen Penggerak Seluruh Satwa Laut Hidup 360° Berbasis:
 * 1. 4 GAYA BOIDS (Separation, Alignment, Cohesion, dan OBSTACLE AVOIDANCE terbobot kuat)
 * 2. TERRAIN HEIGHT CLAMPING & GROUND AVOIDANCE (Ikan tidak pernah menembus dasar laut)
 * 3. VARIASI PER-INSTANCE DETERMINISTIK (Kecepatan, ayunan ekor, ukuran dinamis)
 * 4. STATE MACHINE DINAMIS (Wandering, Pausing, Darting)
 */
export function AutonomousMarineLife() {
  const { engine, agentList } = useMemo(() => {
    const agents: BoidAgent[] = [];
    let seedCounter = 101;

    // ========================================================================
    // A. 6 Ekor Pari Manta Raksasa (Hero Mantas)
    // Meluncur anggun mengitari kolom air tengah dan perimeter luas
    // ========================================================================
    const mantaSpawns = [
      { r: 2.1, deg: 30,  y: 0.45, cluster: "manta-flock-1" },
      { r: 2.4, deg: 45,  y: 0.52, cluster: "manta-flock-1" },
      { r: 2.6, deg: 150, y: 0.60, cluster: "manta-flock-2" },
      { r: 2.5, deg: 165, y: 0.55, cluster: "manta-flock-2" },
      { r: 1.8, deg: 260, y: 0.35, cluster: "manta-solo-1" }, // Meluncur dekat zona tengah
      { r: 2.8, deg: 330, y: 0.68, cluster: "manta-solo-2" },
    ];

    mantaSpawns.forEach((m, idx) => {
      const rad = (m.deg * Math.PI) / 180;
      const x = m.r * Math.sin(rad);
      const z = -m.r * Math.cos(rad);

      agents.push(
        createBoidAgent({
          id: `manta-${idx}`,
          clusterId: m.cluster,
          species: "manta",
          initialPosition: [x, m.y, z],
          homeAnchor: [0, m.y, 0],
          anchorRadius: 3.2,
          seed: seedCounter++,
        })
      );
    });

    // ========================================================================
    // B. Penghuni Karang 3D (Blue Angelfish & Round Tang)
    // Tersebar di 12 formasi karang: 4 di area tengah & 8 di lingkar luar
    // ========================================================================
    STATIC_OBSTACLES.forEach((obs, obsIdx) => {
      const cx = obs.pos[0];
      const cy = obs.pos[1];
      const cz = obs.pos[2];
      const anchor: [number, number, number] = [cx, cy + 0.35, cz];

      // 1-2 Ikan Bidadari Biru (Blue Angelfish) per karang
      for (let i = 0; i < 2; i++) {
        const offsetAngle = (i * Math.PI + obsIdx * 0.9) % (Math.PI * 2);
        const spawnX = cx + Math.sin(offsetAngle) * (obs.radius + 0.28);
        const spawnZ = cz + Math.cos(offsetAngle) * (obs.radius + 0.28);
        const groundAtSpawn = getTerrainHeight(spawnX, spawnZ);
        const spawnY = Math.max(cy + 0.32 + i * 0.12, groundAtSpawn + 0.22);

        agents.push(
          createBoidAgent({
            id: `angel-${obsIdx}-${i}`,
            clusterId: `coral-${obsIdx}-angelfish`,
            species: "blue-angel",
            initialPosition: [spawnX, spawnY, spawnZ],
            homeAnchor: anchor,
            anchorRadius: obs.radius + 0.85,
            seed: seedCounter++,
          })
        );
      }

      // 1 Ikan Bulat Kuning-Cyan (Round Tang) per karang
      const tangAngle = (obsIdx * 1.5 + 1.2) % (Math.PI * 2);
      const tangSpawnX = cx + Math.cos(tangAngle) * (obs.radius + 0.25);
      const tangSpawnZ = cz + Math.sin(tangAngle) * (obs.radius + 0.25);
      const groundAtTang = getTerrainHeight(tangSpawnX, tangSpawnZ);
      const tangSpawnY = Math.max(cy + 0.18, groundAtTang + 0.18);

      agents.push(
        createBoidAgent({
          id: `tang-${obsIdx}`,
          clusterId: `coral-${obsIdx}-tang`,
          species: "round-tang",
          initialPosition: [tangSpawnX, tangSpawnY, tangSpawnZ],
          homeAnchor: anchor,
          anchorRadius: obs.radius + 0.75,
          seed: seedCounter++,
        })
      );
    });

    // ========================================================================
    // C. 2 Kawanan Ikan Minnow 3D (Schooling Minnows ~ 5 ekor per kawanan)
    // Kawanan 1 berenang melintasi area tengah timur
    // ========================================================================
    const school1Center: [number, number, number] = [0.9, 0.12, -0.6];
    for (let i = 0; i < 5; i++) {
      const offsetX = Math.sin(i * 1.3) * 0.20;
      const offsetZ = Math.cos(i * 1.3) * 0.20;
      const offsetY = i % 2 === 0 ? 0.05 : -0.05;

      agents.push(
        createBoidAgent({
          id: `school-1-${i}`,
          clusterId: "school-cluster-1",
          species: "school",
          initialPosition: [
            school1Center[0] + offsetX,
            school1Center[1] + offsetY,
            school1Center[2] + offsetZ,
          ],
          homeAnchor: [0.7, 0.15, -0.4],
          anchorRadius: 1.6,
          seed: seedCounter++,
        })
      );
    }

    // Kawanan 2 berenang melintasi area tengah barat
    const school2Center: [number, number, number] = [-0.85, 0.08, 0.5];
    for (let i = 0; i < 5; i++) {
      const offsetX = Math.sin(i * 1.3) * 0.20;
      const offsetZ = Math.cos(i * 1.3) * 0.20;
      const offsetY = i % 2 === 0 ? 0.05 : -0.05;

      agents.push(
        createBoidAgent({
          id: `school-2-${i}`,
          clusterId: "school-cluster-2",
          species: "school",
          initialPosition: [
            school2Center[0] + offsetX,
            school2Center[1] + offsetY,
            school2Center[2] + offsetZ,
          ],
          homeAnchor: [-0.6, 0.10, 0.3],
          anchorRadius: 1.6,
          seed: seedCounter++,
        })
      );
    }

    const boidsEngine = new BoidsSimulationEngine(agents, STATIC_OBSTACLES);
    return { engine: boidsEngine, agentList: agents };
  }, []);

  const groupRefs = useRef<{ [key: string]: Group | null }>({});

  // --------------------------------------------------------------------------
  // Update Loop Simulasi Boids & State Machine per Frame (60/120 FPS)
  // --------------------------------------------------------------------------
  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    engine.update(delta, elapsed);

    // Sinkronisasi posisi & rotasi hasil fisika ke Three.js Scene Graph
    const activeInspect = creatureInspection.getActive();
    for (let i = 0; i < engine.agents.length; i++) {
      const a = engine.agents[i];
      const grp = groupRefs.current[a.id];
      if (grp) {
        grp.position.set(a.position[0], a.position[1], a.position[2]);
        grp.rotation.set(a.pitch, a.headingYaw, a.roll);
      }
      if (activeInspect && a.id === activeInspect.creatureId) {
        creatureInspection.updatePosition(a.position);
      }
    }
  });

  return (
    <group>
      {agentList.map((agent) => (
        <group
          key={agent.id}
          ref={(el) => {
            groupRefs.current[agent.id] = el;
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            creatureInspection.inspect(
              agent.id,
              agent.species,
              agent.position
            );
          }}
        >
          <BoidFishMeshRenderer agent={agent} />
        </group>
      ))}
    </group>
  );
}

/**
 * Komponen Renderer Mesh Ikan 3D Sesuai Spesies dan Status Gerak Aktif
 */
function BoidFishMeshRenderer({ agent }: { agent: BoidAgent }) {
  const animSpeedFactor =
    agent.state === "pausing"
      ? 0.4
      : agent.state === "darting"
      ? 2.4
      : 1.0;

  const dynamicSpeed = agent.speedMultiplier * animSpeedFactor;

  switch (agent.species) {
    case "manta":
      return (
        <MantaMesh3D
          scale={agent.scale}
          speed={dynamicSpeed}
          phase={agent.swayPhaseOffset}
        />
      );

    case "blue-angel":
      return (
        <BlueAngelMesh3D
          scale={agent.scale}
          speed={dynamicSpeed}
          phase={agent.swayPhaseOffset}
        />
      );

    case "round-tang":
      return (
        <RoundTangMesh3D
          scale={agent.scale}
          speed={dynamicSpeed}
          phase={agent.swayPhaseOffset}
        />
      );

    case "school":
      return (
        <SchoolMinnowMesh3D
          scale={agent.scale}
          speed={dynamicSpeed}
          phase={agent.swayPhaseOffset}
          variant={agent.instanceSeed % 2 === 0 ? "gold" : "teal"}
        />
      );

    default:
      return null;
  }
}
