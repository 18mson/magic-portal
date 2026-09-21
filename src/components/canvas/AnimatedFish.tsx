"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  Vector3,
  Euler,
  Quaternion,
  MathUtils,
  AnimationMixer,
  AnimationAction,
} from "three";
import { SkeletonUtils } from "three-stdlib";
import { feedingSystem } from "@/lib/simulation/feedingSystem";
import { marineLifeRegistry } from "@/lib/simulation/marineLifeRegistry";

/**
 * Konfigurasi Spesifikasi Model & Perilaku Ikan (Reusable Fish Spec)
 */
export interface FishModelConfig {
  id?: string;
  species?: string;
  modelPath: string;
  visualScale?: number;
  modelRotation?: [number, number, number]; // Rotasi koreksi sumbu model [X, Y, Z] (misal [0, Math.PI / 2, 0])
  modelOffset?: [number, number, number];   // Offset posisi pusat model [X, Y, Z]
  initialPosition?: [number, number, number];
  initialHeading?: number;                  // Sudut orientasi awal (radian)
  collisionRadius?: number;                 // Radius fisik deteksi anti-tabrakan (meter, default: 0.20)
  feedingDepthRange?: [number, number];     // Rentang kedalaman pakan spesifik spesies [minY, maxY]
  baseCruisingSpeed?: number; // Kecepatan jelajah standar (m/s, default: 0.22)
  maxSprintSpeed?: number;    // Kecepatan melesat saat mengejar pakan (m/s, default: 0.52)
  turnSpeed?: number;         // Kecepatan putar kepala saat mengincar (rad/s, default: 6.2)
  biteDistance?: number;      // Jarak santap pakan dari mulut (m, default: 0.16)
  detectionRadius?: number;   // Jarak pandang deteksi pakan (m, default: 1.85)
  pauseDurationMin?: number;  // Durasi minimal istirahat di karang (detik, default: 2.0)
  pauseDurationMax?: number;  // Durasi maksimal istirahat di karang (detik, default: 4.5)
  swimDurationMin?: number;   // Durasi jelajah sebelum istirahat (detik, default: 6.0)
  swimDurationMax?: number;   // Durasi jelajah maksimal (detik, default: 11.0)
  clipNames?: {
    swim?: string;            // Nama clip renang maju (default: "swim")
    idle?: string;            // Nama clip mengapung santai (default: "idle")
    bite?: string;            // Nama clip makan/gigit (default: "bite")
  };
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
  };
  pointsOfInterest?: Vector3[];
  roughness?: number;
  metalness?: number;
}

/**
 * Titik-titik daya tarik terumbu karang default akuarium (Reef POIs)
 */
const DEFAULT_REEF_POIS = [
  new Vector3(0.0, 0.14, -0.95),   // Tengah depan tersorot cahaya surya
  new Vector3(0.34, 0.06, -1.05),  // Karang tanduk marun kanan
  new Vector3(0.18, -0.03, -1.20), // Melayang di atas celah karang meja
  new Vector3(-0.26, -0.02, -1.18),// Formasi suaka anemon laut kiri
  new Vector3(-0.34, 0.10, -0.96), // Arus terbuka kiri depan
];

/**
 * Memilih koordinat destinasi jelajah dinamis (kombinasi POIs terumbu dan eksplorasi bebas 3D)
 */
function pickReefDestination(
  pois: Vector3[],
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
): Vector3 {
  // 65% peluang memilih titik POI terumbu karang dengan variasi luas
  if (pois.length > 0 && Math.random() < 0.65) {
    const idx = Math.floor(Math.random() * pois.length);
    const base = pois[idx];
    const spanX = bounds.maxX - bounds.minX;
    const spanY = bounds.maxY - bounds.minY;
    const spanZ = bounds.maxZ - bounds.minZ;
    const jitterX = (Math.random() - 0.5) * Math.min(0.35, spanX * 0.45);
    const jitterY = (Math.random() - 0.5) * Math.min(0.16, spanY * 0.45);
    const jitterZ = (Math.random() - 0.5) * Math.min(0.30, spanZ * 0.45);

    return new Vector3(
      Math.max(bounds.minX, Math.min(bounds.maxX, base.x + jitterX)),
      Math.max(bounds.minY, Math.min(bounds.maxY, base.y + jitterY)),
      Math.max(bounds.minZ, Math.min(bounds.maxZ, base.z + jitterZ))
    );
  }

  // 35% peluang eksplorasi bebas di seluruh volume 3D teritorial (vertikalitas penuh atas - dasar)
  return new Vector3(
    bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
    bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ)
  );
}

/**
 * Komponen Reusable Core Ikan Beranimasi 3D (AnimatedFish)
 * Menangani kloning skeleton, normalisasi timeline animation clip ke t=0,
 * navigasi otonom terumbu karang, interaksi pakan sigap, dan orientasi tegap bebas lompatan.
 */
export function AnimatedFish({ config }: { config: FishModelConfig }) {
  const {
    id,
    species = "MarineCreature",
    modelPath,
    visualScale = 2.8,
    modelRotation,
    modelOffset,
    initialPosition = [0.0, 0.12, -0.95],
    initialHeading,
    collisionRadius = 0.20,
    feedingDepthRange,
    baseCruisingSpeed = 0.22,
    maxSprintSpeed = 0.52,
    turnSpeed = 6.2,
    biteDistance = 0.16,
    detectionRadius = 1.85,
    pauseDurationMin = 2.0,
    pauseDurationMax = 4.5,
    swimDurationMin = 6.0,
    swimDurationMax = 11.0,
    clipNames = {},
    bounds = {
      minX: -0.40,
      maxX: 0.40,
      minY: -0.08,
      maxY: 0.18,
      minZ: -1.28,
      maxZ: -0.88,
    },
    pointsOfInterest = DEFAULT_REEF_POIS,
    roughness = 0.35,
    metalness = 0.05,
  } = config;

  const swimClipKey = clipNames.swim || "swim";
  const idleClipKey = clipNames.idle || "idle";
  const biteClipKey = clipNames.bite || "bite";

  const rootGroupRef = useRef<Group>(null);
  const meshGroupRef = useRef<Group>(null);

  const { scene, animations } = useGLTF(modelPath);

  // 1. Kloning scene & skeleton unik tiap instansi ikan
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        if (child.material) {
          const mat = child.material as MeshStandardMaterial | MeshPhysicalMaterial;
          if ("roughness" in mat) mat.roughness = roughness;
          if ("metalness" in mat) mat.metalness = metalness;
          mat.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene, roughness, metalness]);

  // 2. Normalisasi timeline animasi clip ke t = 0.0 (Zero-Indexed Keyframes)
  // Menghindari freeze keyframe jika diexport dari timeline NLA panjang Blender
  const { mixer, actions } = useMemo(() => {
    const m = new AnimationMixer(clonedScene);
    const acts: Record<string, AnimationAction> = {};

    animations.forEach((origClip) => {
      let minTime = Infinity;
      let maxTime = -Infinity;

      origClip.tracks.forEach((track) => {
        if (track.times.length > 0) {
          if (track.times[0] < minTime) minTime = track.times[0];
          if (track.times[track.times.length - 1] > maxTime) {
            maxTime = track.times[track.times.length - 1];
          }
        }
      });

      const clip = origClip.clone();
      if (minTime !== Infinity && minTime > 0) {
        clip.tracks.forEach((track) => {
          const times = track.times;
          for (let i = 0; i < times.length; i++) {
            times[i] -= minTime;
          }
        });
        clip.duration = Math.max(0.1, maxTime - minTime);
        clip.resetDuration();
      }

      acts[clip.name] = m.clipAction(clip, clonedScene);
    });

    return { mixer: m, actions: acts };
  }, [clonedScene, animations]);

  // Reference action aktif
  const activeActionRef = useRef<AnimationAction | null>(null);
  const activeClipNameRef = useRef<string>(swimClipKey);

  // Batas area aman akuarium
  const safeBounds = useMemo(
    () => ({
      minX: bounds.minX ?? -0.40,
      maxX: bounds.maxX ?? 0.40,
      minY: bounds.minY ?? -0.08,
      maxY: bounds.maxY ?? 0.18,
      minZ: bounds.minZ ?? -1.28,
      maxZ: bounds.maxZ ?? -0.88,
    }),
    [bounds]
  );

  // State navigasi & posisi ikan
  const wanderTargetRef = useRef<Vector3>(
    new Vector3(initialPosition[0], initialPosition[1], initialPosition[2])
  );
  const currentPosRef = useRef<Vector3>(
    new Vector3(initialPosition[0], initialPosition[1], initialPosition[2])
  );
  const currentHeadingRef = useRef<number>(initialHeading ?? 0);
  const currentPitchRef = useRef<number>(0);
  const surgeTimerRef = useRef<number>(0);

  // State perilaku (Swimming, Pausing, Feeding)
  const behaviorStateRef = useRef<"swimming" | "pausing" | "feeding">("swimming");
  const stateTimerRef = useRef<number>(swimDurationMin);
  const biteTimerRef = useRef<number>(0);

  // Objek reusable kalkulasi (0 GC per frame)
  const targetEuler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const targetQuat = useMemo(() => new Quaternion(), []);
  const tempVec = useMemo(() => new Vector3(), []);
  const tempSeparationVec = useMemo(() => new Vector3(), []);

  // ID Unik deterministik untuk koordinasi spasial
  const fishId = useMemo(
    () => id || `${modelPath}-${initialPosition[0]}_${initialPosition[1]}_${initialPosition[2]}`,
    [id, modelPath, initialPosition]
  );

  // Registrasi ikan ke Marine Life Registry untuk koordinasi anti-tabrakan
  useEffect(() => {
    marineLifeRegistry.register(fishId, species, currentPosRef.current, collisionRadius);
    return () => {
      marineLifeRegistry.unregister(fishId);
    };
  }, [fishId, species, collisionRadius]);

  // Inisialisasi awal animasi renang & timer
  useEffect(() => {
    if (initialHeading === undefined) {
      currentHeadingRef.current = (Math.random() * 2 - 1) * Math.PI;
    }
    surgeTimerRef.current = Math.random() * 10.0;
    stateTimerRef.current = swimDurationMin + Math.random() * 4.0;

    const startClip = actions[swimClipKey] || actions[Object.keys(actions)[0]];
    if (startClip) {
      startClip.reset();
      startClip.setEffectiveWeight(1.0);
      startClip.setEffectiveTimeScale(1.0);
      startClip.play();
      activeActionRef.current = startClip;
      activeClipNameRef.current = startClip.getClip().name;
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer, swimClipKey, swimDurationMin, initialHeading]);

  // Main render loop
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    const root = rootGroupRef.current;
    if (!root) return;

    surgeTimerRef.current += clampedDelta;

    // 1. Update Mixer Skeletal Animation
    mixer.update(clampedDelta);

    // 2. Deteksi Pelet Pakan Terdekat (Dipersonalisasi sesuai kebiasaan spesies & batas jelajah)
    const activePellets = feedingSystem.pellets.filter((p) => !p.consumed);
    let nearestPellet = null;
    let minPelletDist = detectionRadius;

    for (let i = 0; i < activePellets.length; i++) {
      const p = activePellets[i];

      // 2a. Filter stratum kedalaman pakan spesifik spesies (pari hanya di dasar, lumba-lumba di permukaan)
      if (feedingDepthRange) {
        if (p.position[1] < feedingDepthRange[0] || p.position[1] > feedingDepthRange[1]) {
          continue;
        }
      }

      // 2b. Filter batas teritorial (ikan karang tidak mengejar pakan yang jauh di luar terumbu karangnya)
      if (
        p.position[0] < safeBounds.minX - 0.28 ||
        p.position[0] > safeBounds.maxX + 0.28 ||
        p.position[2] < safeBounds.minZ - 0.28 ||
        p.position[2] > safeBounds.maxZ + 0.28
      ) {
        continue;
      }

      const d = currentPosRef.current.distanceTo(tempVec.set(p.position[0], p.position[1], p.position[2]));
      if (d < minPelletDist) {
        // 2c. Hindari penumpukan: jika ikan lain sudah sangat dekat ke butir ini, cari yang lain
        if (!marineLifeRegistry.isPelletClaimedByCloser(p.id, fishId, d)) {
          minPelletDist = d;
          nearestPellet = p;
        }
      }
    }

    if (nearestPellet && biteTimerRef.current <= 0) {
      behaviorStateRef.current = "feeding";
    }

    // 3. State Machine Gerak & Kemudi
    stateTimerRef.current -= clampedDelta;
    if (biteTimerRef.current > 0) {
      biteTimerRef.current = Math.max(0, biteTimerRef.current - clampedDelta);
    }

    let moveSpeed = baseCruisingSpeed;
    let targetYaw = currentHeadingRef.current;

    if (behaviorStateRef.current === "feeding" && nearestPellet) {
      const toPelletX = nearestPellet.position[0] - currentPosRef.current.x;
      const toPelletY = nearestPellet.position[1] - currentPosRef.current.y;
      const toPelletZ = nearestPellet.position[2] - currentPosRef.current.z;
      const distHoriz = Math.hypot(toPelletX, toPelletZ);

      if (distHoriz > 0.001) {
        targetYaw = Math.atan2(toPelletX, toPelletZ);
      }

      let diffYaw = targetYaw - currentHeadingRef.current;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

      // Belokkan kepala dengan sigap ke arah pakan
      const maxTurn = turnSpeed * clampedDelta;
      currentHeadingRef.current += MathUtils.clamp(diffYaw, -maxTurn, maxTurn);

      const forwardX = Math.sin(currentHeadingRef.current);
      const forwardZ = Math.cos(currentHeadingRef.current);
      const dirPelletX = distHoriz > 0.001 ? toPelletX / distHoriz : forwardX;
      const dirPelletZ = distHoriz > 0.001 ? toPelletZ / distHoriz : forwardZ;
      const dotAlignment = forwardX * dirPelletX + forwardZ * dirPelletZ;

      // Hanya melaju jika kepala sudah mengarah (Forward-only, tidak ada gerakan mundur)
      if (dotAlignment < 0.82) {
        moveSpeed = 0.0;
      } else {
        const sprintFactor = Math.pow((dotAlignment - 0.82) / 0.18, 1.4);
        const sprint = MathUtils.clamp(distHoriz * 1.3, baseCruisingSpeed * 1.3, maxSprintSpeed);
        moveSpeed = sprint * sprintFactor;
      }

      currentPosRef.current.x += forwardX * moveSpeed * clampedDelta;
      currentPosRef.current.z += forwardZ * moveSpeed * clampedDelta;
      currentPosRef.current.y += toPelletY * Math.min(1.0, 3.2 * clampedDelta);

      // Santap pelet pakan
      if (minPelletDist < biteDistance) {
        feedingSystem.consumePellet(nearestPellet.id);
        biteTimerRef.current = 1.3;
        behaviorStateRef.current = "pausing";
        stateTimerRef.current = pauseDurationMin;
        wanderTargetRef.current = pickReefDestination(pointsOfInterest, safeBounds);
      }
    } else if (behaviorStateRef.current === "pausing") {
      // Mengapung santai di tempat saat ini (idle breathing hover)
      const idleMicroDrift = Math.sin(stateTimerRef.current * 2.2) * 0.003;
      const forwardX = Math.sin(currentHeadingRef.current);
      const forwardZ = Math.cos(currentHeadingRef.current);
      currentPosRef.current.x += forwardX * idleMicroDrift * clampedDelta;
      currentPosRef.current.z += forwardZ * idleMicroDrift * clampedDelta;
      moveSpeed = 0.02;

      if (stateTimerRef.current <= 0) {
        behaviorStateRef.current = "swimming";
        wanderTargetRef.current = pickReefDestination(pointsOfInterest, safeBounds);
        stateTimerRef.current = swimDurationMin + Math.random() * (swimDurationMax - swimDurationMin);
      }
    } else {
      // Berenang jelajah otonom menuju target acak
      const toTargetX = wanderTargetRef.current.x - currentPosRef.current.x;
      const toTargetY = wanderTargetRef.current.y - currentPosRef.current.y;
      const toTargetZ = wanderTargetRef.current.z - currentPosRef.current.z;
      const distHoriz = Math.hypot(toTargetX, toTargetZ);
      const distTotal = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY + toTargetZ * toTargetZ);

      if (distHoriz > 0.04) {
        targetYaw = Math.atan2(toTargetX, toTargetZ);
        let diffYaw = targetYaw - currentHeadingRef.current;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
        currentHeadingRef.current += diffYaw * Math.min(1.0, clampedDelta * 3.2);
      }

      const surgePulse = 1.0 + Math.sin(surgeTimerRef.current * 3.8) * 0.16;
      moveSpeed = baseCruisingSpeed * surgePulse;

      const forwardX = Math.sin(currentHeadingRef.current);
      const forwardZ = Math.cos(currentHeadingRef.current);
      currentPosRef.current.x += forwardX * moveSpeed * clampedDelta;
      currentPosRef.current.z += forwardZ * moveSpeed * clampedDelta;
      currentPosRef.current.y += toTargetY * Math.min(1.0, 2.5 * clampedDelta);

      if (distTotal < 0.18 || stateTimerRef.current <= 0) {
        if (Math.random() < 0.5) {
          behaviorStateRef.current = "pausing";
          stateTimerRef.current = pauseDurationMin + Math.random() * (pauseDurationMax - pauseDurationMin);
        } else {
          wanderTargetRef.current = pickReefDestination(pointsOfInterest, safeBounds);
          stateTimerRef.current = swimDurationMin + Math.random() * (swimDurationMax - swimDurationMin);
        }
      }
    }

    // 3.b. Gaya Tolak Anti-Tabrakan Antar Ikan (Collision Avoidance / Boid Separation)
    const separation = marineLifeRegistry.getSeparationForce(
      fishId,
      currentPosRef.current,
      collisionRadius,
      tempSeparationVec
    );

    // Menerapkan dorongan tolak halus agar ikan tidak saling menumpuk
    currentPosRef.current.x += separation.x * clampedDelta;
    currentPosRef.current.y += separation.y * clampedDelta;
    currentPosRef.current.z += separation.z * clampedDelta;

    // Belokkan kemudi halus jika berpapasan dekat agar berbelok menyamping
    const sepHp = Math.hypot(separation.x, separation.z);
    if (sepHp > 0.06) {
      const sepAngle = Math.atan2(separation.x, separation.z);
      let diffSep = sepAngle - currentHeadingRef.current;
      while (diffSep > Math.PI) diffSep -= Math.PI * 2;
      while (diffSep < -Math.PI) diffSep += Math.PI * 2;
      currentHeadingRef.current += diffSep * Math.min(1.0, 3.2 * clampedDelta);
    }

    // Batasi posisi tetap berada di dalam teritorial safeBounds spesies
    currentPosRef.current.x = MathUtils.clamp(currentPosRef.current.x, safeBounds.minX, safeBounds.maxX);
    currentPosRef.current.y = MathUtils.clamp(currentPosRef.current.y, safeBounds.minY, safeBounds.maxY);
    currentPosRef.current.z = MathUtils.clamp(currentPosRef.current.z, safeBounds.minZ, safeBounds.maxZ);

    // Sinkronisasi status spasial ke registry
    marineLifeRegistry.updatePosition(
      fishId,
      currentPosRef.current,
      nearestPellet ? nearestPellet.id : null,
      nearestPellet ? minPelletDist : Infinity
    );

    // 4. Orientasi 3D Halus (Yaw Kemudi + Pitch Menukik/Mendaki Dinamis)
    let targetPitch = 0;
    if (behaviorStateRef.current === "feeding" && nearestPellet) {
      const toPelletY = nearestPellet.position[1] - currentPosRef.current.y;
      const toPelletX = nearestPellet.position[0] - currentPosRef.current.x;
      const toPelletZ = nearestPellet.position[2] - currentPosRef.current.z;
      const dHoriz = Math.hypot(toPelletX, toPelletZ);
      if (dHoriz > 0.05) {
        targetPitch = -MathUtils.clamp(Math.atan2(toPelletY, dHoriz), -0.42, 0.42);
      }
    } else if (behaviorStateRef.current === "swimming") {
      const toTargetX = wanderTargetRef.current.x - currentPosRef.current.x;
      const toTargetY = wanderTargetRef.current.y - currentPosRef.current.y;
      const toTargetZ = wanderTargetRef.current.z - currentPosRef.current.z;
      const dHoriz = Math.hypot(toTargetX, toTargetZ);
      if (dHoriz > 0.05) {
        targetPitch = -MathUtils.clamp(Math.atan2(toTargetY, dHoriz), -0.36, 0.36);
      }
    }
    currentPitchRef.current += (targetPitch - currentPitchRef.current) * Math.min(1.0, clampedDelta * 3.0);

    targetEuler.set(currentPitchRef.current, currentHeadingRef.current, 0, "YXZ");
    targetQuat.setFromEuler(targetEuler);
    root.quaternion.copy(targetQuat);

    const bob = Math.sin(surgeTimerRef.current * 3.8) * 0.005;
    root.position.set(
      currentPosRef.current.x,
      currentPosRef.current.y + bob,
      currentPosRef.current.z
    );

    // 5. Pemilihan Clip & Crossfade
    let targetClip = swimClipKey;
    if (biteTimerRef.current > 0 && actions[biteClipKey]) {
      targetClip = biteClipKey;
    } else if (behaviorStateRef.current === "pausing" && actions[idleClipKey]) {
      targetClip = idleClipKey;
    } else if (actions[swimClipKey]) {
      targetClip = swimClipKey;
    } else {
      const firstAvailableKey = Object.keys(actions)[0];
      if (firstAvailableKey) targetClip = firstAvailableKey;
    }

    // 6. Sinkronisasi Kecepatan Kibasan Animasi dengan Laju Fisik
    let targetTimeScale = 1.0;
    if (behaviorStateRef.current === "pausing") {
      targetTimeScale = actions[idleClipKey] ? 0.85 : 0.45;
    } else if (behaviorStateRef.current === "feeding" && moveSpeed < 0.05) {
      targetTimeScale = 1.2;
    } else {
      targetTimeScale = MathUtils.clamp(moveSpeed / baseCruisingSpeed, 0.75, 2.2);
    }

    // 7. Crossfade Halus
    const nextAction = actions[targetClip];
    const prevAction = activeActionRef.current;

    if (nextAction) {
      if (activeClipNameRef.current !== targetClip || !nextAction.isRunning()) {
        nextAction.reset();
        nextAction.setEffectiveTimeScale(targetTimeScale);
        nextAction.setEffectiveWeight(1.0);
        nextAction.play();

        if (prevAction && prevAction !== nextAction) {
          nextAction.crossFadeFrom(prevAction, 0.25, false);
        }

        activeActionRef.current = nextAction;
        activeClipNameRef.current = targetClip;
      } else {
        nextAction.setEffectiveTimeScale(targetTimeScale);
      }
    }
  });

  return (
    <group ref={rootGroupRef}>
      <group
        ref={meshGroupRef}
        scale={[visualScale, visualScale, visualScale]}
        rotation={modelRotation}
        position={modelOffset}
      >
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}
