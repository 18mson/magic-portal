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
  Object3D,
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
  navigationPattern?: "wander" | "orbital";
  orbitRadius?: number;       // Radius putaran orbit (meter, default: 1.6)
  orbitHubDuration?: number;  // Durasi melingkar di satu area sebelum migrasi ke area baru (detik, default: 18.0)
  orbitDirection?: 1 | -1;    // Arah putaran orbit: 1 (searah jarum jam) atau -1 (berlawanan)
  roughness?: number;
  metalness?: number;
}

/**
 * Titik-titik daya tarik terumbu karang default akuarium (Reef POIs) menyebar luas
 */
const DEFAULT_REEF_POIS = [
  new Vector3(-1.80, 0.25, -1.80), // Formasi karang barat
  new Vector3(0.00, 0.20, -1.40),  // Pusat taman terumbu karang tersorot surya
  new Vector3(1.80, 0.30, -1.90),  // Formasi karang timur
  new Vector3(-0.90, 0.45, -2.60), // Arus terbuka utara-barat
  new Vector3(1.10, 0.50, -2.80),  // Arus terbuka utara-timur
  new Vector3(0.00, 0.65, -1.10),  // Lapisan perairan atas tengah
  new Vector3(-2.40, 0.15, -2.80), // Perimeter karang jauh barat
  new Vector3(2.40, 0.15, -2.80),  // Perimeter karang jauh timur
];

/**
 * Memilih koordinat destinasi jelajah dinamis (kombinasi POIs terumbu dan eksplorasi bebas 3D)
 * Didesain agar ikan menyebar luas di seluruh volume air, tidak bertumpuk di satu titik saja.
 */
function pickReefDestination(
  pois: Vector3[],
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
): Vector3 {
  // 60% peluang eksplorasi bebas di seluruh volume 3D teritorial (menyebar luas secara dinamis)
  if (Math.random() < 0.60 || pois.length === 0) {
    return new Vector3(
      bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ)
    );
  }

  // 40% peluang menjelajah di sekitar POI dengan variasi sebaran luas (tidak mengumpul kaku)
  const idx = Math.floor(Math.random() * pois.length);
  const base = pois[idx];
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const spanZ = bounds.maxZ - bounds.minZ;

  // Jitter proporsional dengan bentang area ikan (mencegah penumpukan)
  const jitterX = (Math.random() - 0.5) * (spanX * 0.65);
  const jitterY = (Math.random() - 0.5) * (spanY * 0.55);
  const jitterZ = (Math.random() - 0.5) * (spanZ * 0.65);

  return new Vector3(
    Math.max(bounds.minX, Math.min(bounds.maxX, base.x + jitterX)),
    Math.max(bounds.minY, Math.min(bounds.maxY, base.y + jitterY)),
    Math.max(bounds.minZ, Math.min(bounds.maxZ, base.z + jitterZ))
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
    navigationPattern,
    orbitRadius = 1.6,
    orbitHubDuration = 18.0,
    orbitDirection = 1,
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
  const isLargeCreature = useMemo(() => {
    const s = (species || "").toLowerCase();
    const i = (id || "").toLowerCase();
    return (
      s.includes("shark") ||
      s.includes("hiu") ||
      s.includes("orca") ||
      s.includes("paus") ||
      s.includes("whale") ||
      s.includes("dolphin") ||
      s.includes("lumba") ||
      s.includes("stingray") ||
      s.includes("pari") ||
      s.includes("turtle") ||
      s.includes("penyu") ||
      s.includes("kura") ||
      i.includes("shark") ||
      i.includes("orca") ||
      i.includes("whale") ||
      i.includes("dolphin") ||
      i.includes("stingray") ||
      i.includes("turtle") ||
      i.includes("penyu") ||
      i.includes("kura")
    );
  }, [species, id]);

  const isTurtle = useMemo(() => {
    const s = (species || "").toLowerCase();
    const i = (id || "").toLowerCase();
    return s.includes("turtle") || s.includes("penyu") || s.includes("kura") || i.includes("turtle") || i.includes("penyu");
  }, [species, id]);

  const isWhale = useMemo(() => {
    const s = (species || "").toLowerCase();
    const i = (id || "").toLowerCase();
    return s.includes("whale") || s.includes("paus") || s.includes("orca") || i.includes("whale") || i.includes("paus") || i.includes("orca");
  }, [species, id]);

  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = isLargeCreature;
        child.receiveShadow = true;
        // PENTING: Jangan aktifkan frustum culling pada SkinnedMesh/model beranimasi 3D.
        // Three.js tidak mengupdate bounding sphere secara otomatis saat tulang bersinkronisasi di GPU,
        // sehingga jika frustumCulled = true, mesh akan hilang seketika saat sudut pandang kamera bergeser.
        child.frustumCulled = false;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              if (m && "roughness" in m) (m as MeshStandardMaterial).roughness = roughness;
              if (m && "metalness" in m) (m as MeshStandardMaterial).metalness = metalness;
              m.needsUpdate = true;
            });
          } else {
            const mat = child.material as MeshStandardMaterial | MeshPhysicalMaterial;
            if ("roughness" in mat) mat.roughness = roughness;
            if ("metalness" in mat) mat.metalness = metalness;
            mat.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene, roughness, metalness, isLargeCreature]);

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
        clip.duration = Math.max(0.2, maxTime - minTime);
        clip.resetDuration();
      } else {
        clip.duration = Math.max(0.2, clip.duration);
        clip.resetDuration();
      }

      acts[clip.name] = m.clipAction(clip, clonedScene);
    });

    return { mixer: m, actions: acts };
  }, [clonedScene, animations]);

  // Reference action aktif
  const activeActionRef = useRef<AnimationAction | null>(null);
  const activeClipNameRef = useRef<string>(swimClipKey);

  // Cache bone references untuk secondary procedural animation (misal tukik / bayi penyu)
  const turtleBonesRef = useRef<{
    head: Object3D | null;
    tail1: Object3D | null;
    tail2: Object3D | null;
    tail3: Object3D | null;
    flipperL: Object3D | null;
    flipperR: Object3D | null;
    flipperBL: Object3D | null;
    flipperBR: Object3D | null;
  } | null>(null);

  useEffect(() => {
    const isTurtle =
      species.toLowerCase().includes("turtle") ||
      species.toLowerCase().includes("penyu") ||
      id?.toLowerCase().includes("turtle");
    if (isTurtle) {
      turtleBonesRef.current = {
        head: clonedScene.getObjectByName("Head_029") || null,
        tail1: clonedScene.getObjectByName("tail001_06") || null,
        tail2: clonedScene.getObjectByName("tail002_07") || null,
        tail3: clonedScene.getObjectByName("tail003_08") || null,
        flipperL:
          clonedScene.getObjectByName("Foot_F02_L_018") ||
          clonedScene.getObjectByName("Thigh_F01_L_017") ||
          null,
        flipperR:
          clonedScene.getObjectByName("Foot_F02_R_023") ||
          clonedScene.getObjectByName("Thigh_F01_R_022") ||
          null,
        flipperBL: clonedScene.getObjectByName("Foot_B_L002_010") || null,
        flipperBR: clonedScene.getObjectByName("Foot_B_R002_014") || null,
      };
    } else {
      turtleBonesRef.current = null;
    }
  }, [clonedScene, species, id]);

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
  const currentPitchVelRef = useRef<number>(0);         // Kecepatan sudut pitch menukik/mendongak (rad/s smoothed)
  const currentRollRef = useRef<number>(0);             // Kemiringan badan (procedural banking roll)
  const currentAngularVelRef = useRef<number>(0);       // Kecepatan putar sudut (rad/s smoothed)
  const surgeTimerRef = useRef<number>(0);

  // Pola navigasi melingkar otonom (orbital loitering & migrating) untuk koloni ikan pari di permukaan air
  const isOrbital = useMemo(() => {
    const s = (species || "").toLowerCase();
    const i = (id || "").toLowerCase();
    return (
      navigationPattern === "orbital" ||
      s.includes("stingray") ||
      s.includes("pari") ||
      i.includes("stingray") ||
      i.includes("pari")
    );
  }, [navigationPattern, species, id]);

  const orbitHubIdxRef = useRef<number>(0);
  const orbitAngleRef = useRef<number>(
    initialHeading !== undefined ? initialHeading + Math.PI / 2 : 0
  );
  const orbitTimerRef = useRef<number>(orbitHubDuration);
  const isMigratingToHubRef = useRef<boolean>(false);

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

  // Inisialisasi awal animasi renang & timer (efek samping murni di dalam useEffect, aman untuk React Compiler)
  useEffect(() => {
    if (initialHeading === undefined) {
      currentHeadingRef.current = (Math.random() * 2 - 1) * Math.PI;
      orbitAngleRef.current = Math.random() * Math.PI * 2;
    }
    orbitHubIdxRef.current = Math.floor(Math.random() * Math.max(1, pointsOfInterest.length));
    orbitTimerRef.current = orbitHubDuration + Math.random() * 6.0;
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
  }, [
    actions,
    mixer,
    swimClipKey,
    swimDurationMin,
    initialHeading,
    orbitHubDuration,
    pointsOfInterest.length,
  ]);

  // Main render loop
  useFrame((_, delta) => {
    // Hindari delta 0 atau tak terhingga yang dapat menyebabkan pembagian NaN/Infinity
    const clampedDelta = Math.min(Math.max(delta, 0.0005), 0.1);
    const safeDelta = Math.max(0.001, clampedDelta);
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

      // 2b. Filter batas teritorial (ikan karang mengejar pakan dalam perimeter teritorialnya yang luas)
      if (
        p.position[0] < safeBounds.minX - 0.60 ||
        p.position[0] > safeBounds.maxX + 0.60 ||
        p.position[2] < safeBounds.minZ - 0.60 ||
        p.position[2] > safeBounds.maxZ + 0.60
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
    let targetPitch = 0;

    // Batas sudut menukik (pitch down/up) & laju kemudi pitch spesifik morfologi satwa
    const maxPitchAngle = isWhale ? 0.32 : isLargeCreature ? 0.45 : isTurtle ? 0.58 : 0.72;
    const pitchTurnRate = turnSpeed ? turnSpeed * 0.75 : isWhale ? 2.2 : isLargeCreature ? 3.0 : isTurtle ? 3.8 : 5.2;

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

      // Belokkan kepala dengan kemudi sigap namun halus ke arah pakan
      const effectiveTurn = turnSpeed ?? (isLargeCreature ? 1.8 : 4.5);
      const maxTurn = effectiveTurn * clampedDelta;
      const clampedTurn = MathUtils.clamp(diffYaw, -maxTurn, maxTurn);

      const targetAngularVel = clampedTurn / safeDelta;
      currentAngularVelRef.current = MathUtils.lerp(
        currentAngularVelRef.current,
        targetAngularVel,
        Math.min(1.0, clampedDelta * (isLargeCreature ? 5.0 : 8.0))
      );
      currentHeadingRef.current += currentAngularVelRef.current * clampedDelta;

      // Kemudi pitch 3D membidik pelet pakan:
      const feedingMaxPitch = Math.min(0.85, maxPitchAngle * 1.25);
      const desiredPitchToPellet = Math.atan2(-toPelletY, Math.max(0.12, distHoriz));
      targetPitch = MathUtils.clamp(desiredPitchToPellet, -feedingMaxPitch, feedingMaxPitch);

      // Inersia sudut menukik: kepala menukik/mendongak terlebih dahulu
      const diffPitch = targetPitch - currentPitchRef.current;
      const maxPitchTurn = pitchTurnRate * 1.2 * clampedDelta;
      const clampedPitchTurn = MathUtils.clamp(diffPitch, -maxPitchTurn, maxPitchTurn);
      const targetPitchVel = clampedPitchTurn / safeDelta;
      currentPitchVelRef.current = MathUtils.lerp(
        currentPitchVelRef.current,
        targetPitchVel,
        Math.min(1.0, clampedDelta * (isLargeCreature ? 4.5 : 8.0))
      );
      currentPitchRef.current += currentPitchVelRef.current * clampedDelta;

      const forwardX_flat = Math.sin(currentHeadingRef.current);
      const forwardZ_flat = Math.cos(currentHeadingRef.current);
      const dirPelletX = distHoriz > 0.001 ? toPelletX / distHoriz : forwardX_flat;
      const dirPelletZ = distHoriz > 0.001 ? toPelletZ / distHoriz : forwardZ_flat;
      const dotAlignment = forwardX_flat * dirPelletX + forwardZ_flat * dirPelletZ;

      // Hanya melaju kencang jika kepala sudah mengarah (Forward-only)
      if (dotAlignment < 0.80) {
        moveSpeed = baseCruisingSpeed * 0.35; // Melaju pelan agar belokan melengkung
      } else {
        const sprintFactor = Math.pow((dotAlignment - 0.80) / 0.20, 1.4);
        const sprint = MathUtils.clamp(distHoriz * 1.3, baseCruisingSpeed * 1.3, maxSprintSpeed);
        moveSpeed = sprint * sprintFactor;
      }

      // Pergerakan maju 3D murni didorong sepanjang orientasi sudut badan (Pitch & Yaw)
      const curPitch = currentPitchRef.current;
      const cosPitch = Math.cos(curPitch);
      const sinPitch = Math.sin(curPitch);

      const forwardX = Math.sin(currentHeadingRef.current) * cosPitch;
      const forwardZ = Math.cos(currentHeadingRef.current) * cosPitch;
      const forwardY = -sinPitch;

      currentPosRef.current.x += forwardX * moveSpeed * clampedDelta;
      currentPosRef.current.z += forwardZ * moveSpeed * clampedDelta;

      const deltaY = forwardY * moveSpeed * clampedDelta;
      if (toPelletY < 0) {
        currentPosRef.current.y = Math.max(nearestPellet.position[1], currentPosRef.current.y + deltaY);
      } else if (toPelletY > 0) {
        currentPosRef.current.y = Math.min(nearestPellet.position[1], currentPosRef.current.y + deltaY);
      } else {
        currentPosRef.current.y += deltaY;
      }

      // Santap pelet pakan
      if (minPelletDist < biteDistance) {
        feedingSystem.consumePellet(nearestPellet.id);
        biteTimerRef.current = 1.3;
        behaviorStateRef.current = isOrbital ? "swimming" : "pausing";
        stateTimerRef.current = pauseDurationMin;
        if (!isOrbital) {
          wanderTargetRef.current = pickReefDestination(pointsOfInterest, safeBounds);
        }
      }
    } else if (behaviorStateRef.current === "pausing" && !isOrbital) {
      // Redam laju putar saat istirahat
      currentAngularVelRef.current = MathUtils.lerp(
        currentAngularVelRef.current,
        0,
        Math.min(1.0, clampedDelta * 3.5)
      );

      // Ratakan kepala kembali ke horizontal saat istirahat (level floating)
      targetPitch = 0;
      currentPitchVelRef.current = MathUtils.lerp(
        currentPitchVelRef.current,
        0,
        Math.min(1.0, clampedDelta * 4.0)
      );
      currentPitchRef.current = MathUtils.lerp(
        currentPitchRef.current,
        0,
        Math.min(1.0, clampedDelta * 3.5)
      );

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
      // 3.a. Navigasi Melingkar (Orbital Loitering) atau Jelajah Bebas
      if (isOrbital && pointsOfInterest.length > 0) {
        // Logika patroli melingkar di dekat permukaan laut
        orbitTimerRef.current -= clampedDelta;

        if (orbitTimerRef.current <= 0) {
          // Waktu di area ini habis, beralih migrasi ke area / hub permukaan baru
          orbitHubIdxRef.current =
            (orbitHubIdxRef.current + 1 + Math.floor(Math.random() * (pointsOfInterest.length - 1))) %
            pointsOfInterest.length;
          orbitTimerRef.current = orbitHubDuration + (Math.random() * 8.0 - 4.0);
          isMigratingToHubRef.current = true;
        }

        const curHub = pointsOfInterest[orbitHubIdxRef.current % pointsOfInterest.length];
        const hubX = curHub.x;
        const hubY = curHub.y;
        const hubZ = curHub.z;

        if (isMigratingToHubRef.current) {
          const distToNewHub = Math.hypot(currentPosRef.current.x - hubX, currentPosRef.current.z - hubZ);
          if (distToNewHub <= orbitRadius * 1.35) {
            // Sudah sampai di lingkar luar area baru, mulai berputar melingkar di area ini
            isMigratingToHubRef.current = false;
            orbitAngleRef.current = Math.atan2(
              currentPosRef.current.z - hubZ,
              currentPosRef.current.x - hubX
            );
          } else {
            // Meluncur anggun menuju perimeter hub baru, tetap di perairan atas dekat permukaan
            wanderTargetRef.current.x = hubX;
            wanderTargetRef.current.y = MathUtils.clamp(
              hubY + Math.sin(surgeTimerRef.current * 0.8) * 0.035,
              safeBounds.minY,
              safeBounds.maxY
            );
            wanderTargetRef.current.z = hubZ;
          }
        }

        if (!isMigratingToHubRef.current) {
          // Mengorbit mulus di sekitar hub permukaan saat ini
          const angularSpeed = (baseCruisingSpeed / Math.max(0.6, orbitRadius)) * orbitDirection;
          orbitAngleRef.current += angularSpeed * clampedDelta;

          // Lead-angle ke depan pada lingkaran orbit untuk menghasilkan kemudi belok yang mulus
          const leadAngle = orbitAngleRef.current + 0.42 * Math.sign(orbitDirection);
          wanderTargetRef.current.x = hubX + Math.cos(leadAngle) * orbitRadius;
          // Ketinggian tetap terkunci di lapisan atas dekat permukaan laut (dengan gelombang kepakan anggun)
          wanderTargetRef.current.y = MathUtils.clamp(
            hubY + Math.sin(orbitAngleRef.current * 1.6) * 0.035,
            safeBounds.minY,
            safeBounds.maxY
          );
          wanderTargetRef.current.z = hubZ + Math.sin(leadAngle) * orbitRadius;
        }
      }

      // Berenang jelajah otonom menuju target
      const toTargetX = wanderTargetRef.current.x - currentPosRef.current.x;
      const toTargetY = wanderTargetRef.current.y - currentPosRef.current.y;
      const toTargetZ = wanderTargetRef.current.z - currentPosRef.current.z;
      const distHoriz = Math.hypot(toTargetX, toTargetZ);
      const distTotal = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY + toTargetZ * toTargetZ);

      // Kemudi Yaw (Arah Kompas Horizontal)
      if (distHoriz > 0.04) {
        targetYaw = Math.atan2(toTargetX, toTargetZ);
        let diffYaw = targetYaw - currentHeadingRef.current;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

        // Kecepatan belok terukur: makhluk besar berbelok anggun & melengkung
        const effectiveTurn = turnSpeed ?? (isLargeCreature ? 1.5 : 3.2);
        const maxTurn = effectiveTurn * clampedDelta;
        const clampedTurn = MathUtils.clamp(diffYaw, -maxTurn, maxTurn);

        // Smoothing percepatan sudut (menghilangkan sentakan/patah tiba-tiba)
        const targetAngularVel = clampedTurn / safeDelta;
        currentAngularVelRef.current = MathUtils.lerp(
          currentAngularVelRef.current,
          targetAngularVel,
          Math.min(1.0, clampedDelta * (isLargeCreature ? 3.5 : 6.0))
        );
        currentHeadingRef.current += currentAngularVelRef.current * clampedDelta;
      } else {
        currentAngularVelRef.current = MathUtils.lerp(
          currentAngularVelRef.current,
          0,
          Math.min(1.0, clampedDelta * 4.0)
        );
      }

      // Kemudi Pitch 3D (Animasi Ikan Menukik Dulu / Kepala ke Bawah Dulu):
      // toTargetY < 0 (target lebih dalam): sudut menukik positif (kepala condong ke bawah)
      // toTargetY > 0 (target lebih tinggi): sudut mendaki negatif (kepala mendongak ke atas)
      const depthDiff = Math.abs(toTargetY);
      // Leveling anticipation: saat mendekati kedalaman target (< 0.16m), ratakan kepala secara mulus
      const approachDamp = MathUtils.clamp(depthDiff / 0.16, 0.0, 1.0);
      const rawPitch = Math.atan2(-toTargetY, Math.max(0.15, distHoriz));
      targetPitch = MathUtils.clamp(rawPitch, -maxPitchAngle, maxPitchAngle) * approachDamp;

      // Inersia kemudi pitch: kepala menunduk/menukik terlebih dahulu dengan percepatan halus
      const effectivePitchSpeed = turnSpeed ? turnSpeed * 0.65 : pitchTurnRate;
      const diffPitch = targetPitch - currentPitchRef.current;
      const maxPitchTurn = effectivePitchSpeed * clampedDelta;
      const clampedPitchTurn = MathUtils.clamp(diffPitch, -maxPitchTurn, maxPitchTurn);
      const targetPitchVel = clampedPitchTurn / safeDelta;
      currentPitchVelRef.current = MathUtils.lerp(
        currentPitchVelRef.current,
        targetPitchVel,
        Math.min(1.0, clampedDelta * (isLargeCreature ? 3.2 : 5.5))
      );
      currentPitchRef.current += currentPitchVelRef.current * clampedDelta;

      // Dinamika laju renang busur belok (curved turn arc)
      let currentYawDiff = targetYaw - currentHeadingRef.current;
      while (currentYawDiff > Math.PI) currentYawDiff -= Math.PI * 2;
      while (currentYawDiff < -Math.PI) currentYawDiff += Math.PI * 2;

      const turnArcFactor = isLargeCreature
        ? MathUtils.clamp(1.0 - (Math.abs(currentYawDiff) / Math.PI) * 0.32, 0.68, 1.0)
        : MathUtils.clamp(1.0 - (Math.abs(currentYawDiff) / Math.PI) * 0.22, 0.78, 1.0);

      const tailFreq = isLargeCreature ? 2.2 : 3.8;
      const surgeAmp = isLargeCreature ? 0.10 : 0.16;
      const surgePulse = 1.0 + Math.sin(surgeTimerRef.current * tailFreq) * surgeAmp;
      moveSpeed = baseCruisingSpeed * surgePulse * turnArcFactor;

      // Pergerakan Maju 3D Berbasis Orientasi Tubuh:
      // Translasi fisik di sumbu Y murni didorong oleh gaya renang maju searah sudut menukik!
      // Bila kepala belum menukik (pitch ~ 0), ikan tidak jatuh vertikal secara instan.
      // Begitu kepala menunduk, badan meluncur menukik dengan laju proporsional berenang datar.
      const curPitch = currentPitchRef.current;
      const cosPitch = Math.cos(curPitch);
      const sinPitch = Math.sin(curPitch);

      const forwardX = Math.sin(currentHeadingRef.current) * cosPitch;
      const forwardZ = Math.cos(currentHeadingRef.current) * cosPitch;
      const forwardY = -sinPitch;

      currentPosRef.current.x += forwardX * moveSpeed * clampedDelta;
      currentPosRef.current.z += forwardZ * moveSpeed * clampedDelta;

      const deltaY = forwardY * moveSpeed * clampedDelta;
      if (toTargetY < 0) {
        currentPosRef.current.y = Math.max(wanderTargetRef.current.y, currentPosRef.current.y + deltaY);
      } else if (toTargetY > 0) {
        currentPosRef.current.y = Math.min(wanderTargetRef.current.y, currentPosRef.current.y + deltaY);
      } else {
        currentPosRef.current.y += deltaY;
      }

      if (!isOrbital && (distTotal < 0.18 || stateTimerRef.current <= 0)) {
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
    currentPosRef.current.y += separation.y * 0.35 * clampedDelta;
    currentPosRef.current.z += separation.z * clampedDelta;

    // Belokkan kemudi halus jika berpapasan dekat agar berbelok menyamping
    const sepHp = Math.hypot(separation.x, separation.z);
    if (sepHp > 0.06) {
      const sepAngle = Math.atan2(separation.x, separation.z);
      let diffSep = sepAngle - currentHeadingRef.current;
      while (diffSep > Math.PI) diffSep -= Math.PI * 2;
      while (diffSep < -Math.PI) diffSep += Math.PI * 2;
      const sepTurn = MathUtils.clamp(diffSep, -2.5 * clampedDelta, 2.5 * clampedDelta);
      currentHeadingRef.current += sepTurn;
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

    // 4. Orientasi 3D Halus (Procedural Banking Roll & Buoyancy Sway)
    // Kemiringan tubuh saat berbelok (roll)
    const bankStrength = isLargeCreature ? 0.32 : 0.22;
    const maxBankAngle = isLargeCreature ? 0.52 : 0.65; // ~30° - 37°
    const targetRoll = -MathUtils.clamp(currentAngularVelRef.current * bankStrength, -maxBankAngle, maxBankAngle);

    // Inersia roll dinamis
    const rollInertiaSpeed = isLargeCreature ? 3.0 : 4.8;
    currentRollRef.current = MathUtils.lerp(
      currentRollRef.current,
      targetRoll,
      Math.min(1.0, clampedDelta * rollInertiaSpeed)
    );

    // Buoyancy mikro sway alami mengikuti dorongan sirip ekor
    const tailFreq = isLargeCreature ? 2.2 : 3.8;
    const swimSway = Math.sin(surgeTimerRef.current * tailFreq) * (isLargeCreature ? 0.022 : 0.038);

    // Safeguard mutlak terhadap nilai NaN jika terjadi frame hitch atau tab suspend
    if (isNaN(currentPosRef.current.x) || isNaN(currentPosRef.current.y) || isNaN(currentPosRef.current.z)) {
      currentPosRef.current.set(initialPosition[0], initialPosition[1], initialPosition[2]);
      currentAngularVelRef.current = 0;
      currentPitchVelRef.current = 0;
    }
    if (isNaN(currentHeadingRef.current)) currentHeadingRef.current = initialHeading ?? 0;
    if (isNaN(currentPitchRef.current)) currentPitchRef.current = 0;
    if (isNaN(currentRollRef.current)) currentRollRef.current = 0;

    targetEuler.set(currentPitchRef.current, currentHeadingRef.current, currentRollRef.current + swimSway, "YXZ");
    targetQuat.setFromEuler(targetEuler);
    root.quaternion.copy(targetQuat);

    const bob = Math.sin(surgeTimerRef.current * tailFreq) * 0.005;
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

    // 8. Procedural Secondary Animation untuk Bayi Penyu (Sirip Mendayung, Ekor Bergoyang Lincah, & Kepala Menoleh)
    const tb = turtleBonesRef.current;
    if (tb) {
      const isPaused = behaviorStateRef.current === "pausing";
      const flapSpeed = isPaused ? 3.0 : (moveSpeed > 0.08 ? 7.2 : 5.0);
      const flapPhase = surgeTimerRef.current * flapSpeed;

      // Kibasan sirip depan lincah (breaststroke flipper wave)
      const flipperFlap = Math.sin(flapPhase) * (isPaused ? 0.15 : 0.42);
      const flipperPitch = Math.cos(flapPhase) * (isPaused ? 0.10 : 0.26);
      if (tb.flipperL) {
        tb.flipperL.rotation.z += flipperFlap;
        tb.flipperL.rotation.x += flipperPitch;
      }
      if (tb.flipperR) {
        tb.flipperR.rotation.z -= flipperFlap;
        tb.flipperR.rotation.x += flipperPitch;
      }

      // Dayungan sirip belakang
      const rearFlap = Math.sin(flapPhase - 1.2) * (isPaused ? 0.10 : 0.28);
      if (tb.flipperBL) tb.flipperBL.rotation.z += rearFlap;
      if (tb.flipperBR) tb.flipperBR.rotation.z -= rearFlap;

      // Kibasan ekor bergoyang aktif & lincah
      const tailWag = Math.sin(surgeTimerRef.current * (isPaused ? 4.5 : 9.2)) * 0.38;
      if (tb.tail1) tb.tail1.rotation.y += tailWag;
      if (tb.tail2) tb.tail2.rotation.y += tailWag * 0.8;
      if (tb.tail3) tb.tail3.rotation.y += tailWag * 0.6;

      // Kepala mengangguk & menoleh penasaran
      const headBob = Math.sin(surgeTimerRef.current * 4.0) * 0.16;
      const headLook = Math.sin(surgeTimerRef.current * 1.8) * 0.24;
      if (tb.head) {
        tb.head.rotation.x += headBob;
        tb.head.rotation.y += headLook;
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
