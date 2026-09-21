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
  CatmullRomCurve3,
  AnimationMixer,
  AnimationAction,
} from "three";
import { SkeletonUtils } from "three-stdlib";
import { feedingSystem } from "@/lib/simulation/feedingSystem";

const MODEL_PATH = "/models/clown_fish_low_poly_animated.glb";

// Preload model GLTF 3D rigged bertekstur
useGLTF.preload(MODEL_PATH);

/**
 * Waypoints Jalur Jelajah Organik Ikan Badut (Aquatic Patrol Spline):
 * Berada tepat di perairan terbuka yang tersorot sinar matahari (God Rays),
 * meliuk di antara batu karang meja dan karang ranting marun,
 * selalu berada dalam frustum kamera utama (Z: -0.85 s/d -1.25, X: -0.40 s/d +0.40).
 */
const PATROL_POINTS = [
  new Vector3(0.0, 0.12, -0.92),   // Tengah depan, di bawah sorotan cahaya keemasan
  new Vector3(0.38, 0.05, -1.06),  // Meluncur ke kanan mendekati karang tanduk
  new Vector3(0.16, -0.04, -1.24), // Meliuk anggun di atas celah karang meja
  new Vector3(-0.24, 0.02, -1.20), // Berbelok ke kiri melintasi formasi anemon
  new Vector3(-0.36, 0.14, -0.98), // Naik perlahan ke arus terbuka kiri
];

export function ClownFishAnimated() {
  const rootGroupRef = useRef<Group>(null);
  const meshGroupRef = useRef<Group>(null);

  const { scene, animations } = useGLTF(MODEL_PATH);

  // 1. Kloning scene & skeleton unik via three-stdlib
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        if (child.material) {
          const mat = child.material as MeshStandardMaterial | MeshPhysicalMaterial;
          if ("roughness" in mat) mat.roughness = 0.35;
          if ("metalness" in mat) mat.metalness = 0.05;
          mat.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene]);

  // 2. NORMALISASI TIMELINE ANIMATION CLIP KE t = 0.0 (Zero-Indexed Keyframes)
  // File GLTF asal diexport dari satu timeline panjang di Blender (swim di 5.7s-7.1s, bite di 20.6s-22.3s).
  // Tanpa shifting waktu ini, Three.js membeku di frame 0 selama 5.7 s/d 19 detik!
  // Normalisasi ini membuat setiap clip ("swim", "idle", "bite") langsung aktif berulang tanpa jeda beku.
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

  // Reference action yang sedang aktif diputar
  const activeActionRef = useRef<AnimationAction | null>(null);
  const activeClipNameRef = useRef<string>("swim");

  // Kurva jelajah 3D Catmull-Rom tertutup (smooth looping curve)
  const patrolCurve = useMemo(() => {
    return new CatmullRomCurve3(PATROL_POINTS, true, "centripetal");
  }, []);

  // State navigasi internal
  const progressRef = useRef<number>(0.0);
  const currentPosRef = useRef<Vector3>(PATROL_POINTS[0].clone());
  const currentHeadingRef = useRef<number>(0);

  // State perilaku (Swimming, Pausing, Feeding)
  const behaviorStateRef = useRef<"swimming" | "pausing" | "feeding">("swimming");
  const stateTimerRef = useRef<number>(6.0);
  const biteTimerRef = useRef<number>(0);
  const targetedPelletIdRef = useRef<string | null>(null);

  // Timer debug logging
  const debugTimerRef = useRef<number>(0);

  // Objek reusable untuk kalkulasi di useFrame (0 GC allocation)
  const targetEuler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const targetQuat = useMemo(() => new Quaternion(), []);
  const tempVec = useMemo(() => new Vector3(), []);

  // Inisialisasi awal: Aktifkan clip "swim" yang sudah dinormalisasi (looping 1.37s)
  useEffect(() => {
    if (actions.swim) {
      const initialAction = actions.swim;
      initialAction.reset();
      initialAction.setEffectiveWeight(1.0);
      initialAction.setEffectiveTimeScale(1.0);
      initialAction.play();
      activeActionRef.current = initialAction;
      activeClipNameRef.current = "swim";
      console.log("[ClownFish] Animasi 'swim' dinormalisasi (0s s/d 1.37s) aktif dengan weight 1.0");
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  // Loop update setiap frame (60 / 120 FPS)
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    const root = rootGroupRef.current;
    if (!root) return;

    // ========================================================================
    // 1. UPDATE ANIMATION MIXER DI TIAP FRAME
    // ========================================================================
    mixer.update(clampedDelta);

    // ========================================================================
    // 2. Interaktivitas Pakan: Deteksi pelet pakan terdekat dari user
    // ========================================================================
    const activePellets = feedingSystem.pellets.filter((p) => !p.consumed);
    let nearestPellet = null;
    let minPelletDist = 1.85;

    for (let i = 0; i < activePellets.length; i++) {
      const p = activePellets[i];
      const d = currentPosRef.current.distanceTo(tempVec.set(p.position[0], p.position[1], p.position[2]));
      if (d < minPelletDist) {
        minPelletDist = d;
        nearestPellet = p;
      }
    }

    if (nearestPellet && biteTimerRef.current <= 0) {
      behaviorStateRef.current = "feeding";
      targetedPelletIdRef.current = nearestPellet.id;
    }

    // ========================================================================
    // 3. State Machine Gerak & Kemudi Arah Hadap (Heading Orientation)
    // Sesuai permintaan: Saat ada pakan, kepala ikan membelok & mengarah ke
    // pakan terlebih dahulu, baru kemudian ikan melaju mendekat dengan kecepatan yang sesuai.
    // ========================================================================
    stateTimerRef.current -= clampedDelta;
    if (biteTimerRef.current > 0) {
      biteTimerRef.current = Math.max(0, biteTimerRef.current - clampedDelta);
    }

    const baseCruisingSpeed = 0.22; // Kecepatan renang jelajah normal (~22 cm/s)
    let moveSpeed = baseCruisingSpeed;
    let targetYaw = currentHeadingRef.current;

    if (behaviorStateRef.current === "feeding" && nearestPellet) {
      // Vektor selisih ke target pakan
      const toPelletX = nearestPellet.position[0] - currentPosRef.current.x;
      const toPelletY = nearestPellet.position[1] - currentPosRef.current.y;
      const toPelletZ = nearestPellet.position[2] - currentPosRef.current.z;
      const distHoriz = Math.hypot(toPelletX, toPelletZ);

      // Hitung sudut target ke pakan
      if (distHoriz > 0.001) {
        targetYaw = Math.atan2(toPelletX, toPelletZ);
      }

      // Hitung selisih sudut heading ikan terhadap pakan
      let diffYaw = targetYaw - currentHeadingRef.current;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
      const absDiffYaw = Math.abs(diffYaw);

      // FASE 1: Belokkan kepala dengan sigap dan lincah ke arah pakan
      const turnSpeed = 5.5; // ~315 derajat per detik untuk respon lincah
      const maxTurn = turnSpeed * clampedDelta;
      currentHeadingRef.current += MathUtils.clamp(diffYaw, -maxTurn, maxTurn);

      // FASE 2: Cek apakah kepala sudah mengarah ke makanan
      // Kosinus selisih sudut: 1.0 jika tepat lurus menghadap pakan, <= 0 jika membelakangi/tegak lurus
      const alignment = Math.max(0, Math.cos(diffYaw));
      const isFacingPellet = absDiffYaw < MathUtils.degToRad(35);

      if (!isFacingPellet) {
        // Belum menghadap: Ikan memutar badan di tempat / meluncur minimal sambil menoleh
        moveSpeed = 0.04;
      } else {
        // Sudah mengarah: Ikan melesat maju mengejar pakan secara proporsional
        const sprintSpeed = MathUtils.clamp(distHoriz * 1.4, 0.32, 0.55);
        moveSpeed = sprintSpeed * Math.pow(alignment, 2);
      }

      // Gerak maju mengikuti vektor hadap kepala aktual (bukan sliding menyamping)
      const forwardX = Math.sin(currentHeadingRef.current);
      const forwardZ = Math.cos(currentHeadingRef.current);
      currentPosRef.current.x += forwardX * moveSpeed * clampedDelta;
      currentPosRef.current.z += forwardZ * moveSpeed * clampedDelta;
      currentPosRef.current.y += toPelletY * Math.min(1.0, 3.5 * clampedDelta);

      // FASE 3: Ikan memakan pelet saat sudah berada di dekat mulut
      if (minPelletDist < 0.16) {
        feedingSystem.consumePellet(nearestPellet.id);
        biteTimerRef.current = 1.3; // Mainkan animasi gigit/kunyah pakan
        behaviorStateRef.current = "pausing";
        stateTimerRef.current = 1.8;

        // Cari titik kurva patrol terdekat agar setelah makan tidak melompat
        let bestT = progressRef.current;
        let bestDist = Infinity;
        for (let s = 0; s < 24; s++) {
          const tTest = s / 24;
          const pt = patrolCurve.getPointAt(tTest);
          const d = pt.distanceTo(currentPosRef.current);
          if (d < bestDist) {
            bestDist = d;
            bestT = tTest;
          }
        }
        progressRef.current = bestT;
      }
    } else if (behaviorStateRef.current === "pausing") {
      // Mengapung santai di tempat (idle)
      moveSpeed = 0.02;
      if (stateTimerRef.current <= 0) {
        behaviorStateRef.current = "swimming";
        stateTimerRef.current = 8.0 + Math.random() * 6.0;
      }
    } else {
      // Berenang jelajah sepanjang kurva patrol
      if (stateTimerRef.current <= 0) {
        behaviorStateRef.current = "pausing";
        stateTimerRef.current = 2.5 + Math.random() * 2.0;
      }

      // Ikan mengibas mendorong air lalu meluncur seirama
      const surgePulse = 1.0 + Math.sin(progressRef.current * Math.PI * 6.0) * 0.18;
      moveSpeed = baseCruisingSpeed * surgePulse;

      // Majukan titik kurva patrol
      progressRef.current = (progressRef.current + (moveSpeed / patrolCurve.getLength()) * clampedDelta) % 1.0;
      const targetPoint = patrolCurve.getPointAt(progressRef.current);
      const tangent = patrolCurve.getTangentAt(progressRef.current);

      // Kemudi arah hadap mengikuti tangen kurva jelajah
      targetYaw = Math.atan2(tangent.x, tangent.z);
      let diffYaw = targetYaw - currentHeadingRef.current;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
      currentHeadingRef.current += diffYaw * Math.min(1.0, clampedDelta * 3.8);

      const posDamping = 1.0 - Math.exp(-3.5 * clampedDelta);
      currentPosRef.current.lerp(targetPoint, posDamping);
    }

    // ========================================================================
    // 4. IKAN TETAP TEGAP, TIDAK MIRING (Roll = 0, Pitch = 0)
    // Sesuai permintaan: Kepala lurus tegap menghadap depan, orientasi seimbang di air
    // ========================================================================
    targetEuler.set(0, currentHeadingRef.current, 0, "YXZ");
    targetQuat.setFromEuler(targetEuler);

    const rotDamping = 1.0 - Math.exp(-6.0 * clampedDelta);
    root.quaternion.slerp(targetQuat, rotDamping);

    // Ayunan bernapas halus di air (subtle breathing bob)
    const bob = Math.sin(progressRef.current * Math.PI * 6.0) * 0.005;
    root.position.set(
      currentPosRef.current.x,
      currentPosRef.current.y + bob,
      currentPosRef.current.z
    );

    // ========================================================================
    // 6. PEMILIHAN CLIP ALAMI:
    // - Saat melaju: Clip "swim" (badan & ekor mengibas ke kiri dan kanan)
    // - Saat santai/berhenti: Clip "idle" (mengapung santai)
    // - Saat makan: Clip "bite"
    // ========================================================================
    let targetClip = "swim";
    if (biteTimerRef.current > 0) {
      targetClip = "bite";
    } else if (behaviorStateRef.current === "pausing") {
      targetClip = "idle";
    } else {
      targetClip = "swim";
    }

    // ========================================================================
    // 7. SINKRONISASI KECEPATAN KIBASAN BADAN & EKOR DENGAN KECEPATAN GERAK
    // Semakin cepat ikan melaju, semakin cepat dan intens badan & ekor mengibas
    // ========================================================================
    let targetTimeScale = 1.0;
    if (behaviorStateRef.current === "pausing") {
      targetTimeScale = 0.85; // Gerakan sirip santai saat mengapung diam
    } else {
      // timeScale proporsional terhadap rasio kecepatan aktual vs kecepatan dasar
      targetTimeScale = MathUtils.clamp(moveSpeed / baseCruisingSpeed, 0.75, 2.2);
    }

    // ========================================================================
    // 8. CROSSFADE HALUS & PENJAGAAN BOBOT PENUH (Weight = 1.0)
    // ========================================================================
    const nextAction = actions[targetClip];
    const prevAction = activeActionRef.current;

    if (nextAction) {
      if (activeClipNameRef.current !== targetClip || !nextAction.isRunning()) {
        const prevClipName = activeClipNameRef.current;

        nextAction.reset();
        nextAction.setEffectiveTimeScale(targetTimeScale);
        nextAction.setEffectiveWeight(1.0);
        nextAction.play();

        if (prevAction && prevAction !== nextAction) {
          nextAction.crossFadeFrom(prevAction, 0.25, false);
        }

        activeActionRef.current = nextAction;
        activeClipNameRef.current = targetClip;

        console.log(
          `[ClownFish] 🔄 Crossfade: ${prevClipName} -> ${targetClip} | TimeScale: ${targetTimeScale.toFixed(2)}`
        );
      } else {
        // Update timeScale dinamis tiap frame sesuai laju renang
        nextAction.setEffectiveTimeScale(targetTimeScale);
      }
    }

    // ========================================================================
    // 9. CONSOLE LOGGING STATUS (Setiap 2 Detik)
    // ========================================================================
    debugTimerRef.current += clampedDelta;
    if (debugTimerRef.current >= 2.0) {
      debugTimerRef.current = 0;
      const currentAction = activeActionRef.current;
      const weight = currentAction ? currentAction.getEffectiveWeight().toFixed(2) : "0.00";
      const actualTimeScale = currentAction ? currentAction.getEffectiveTimeScale().toFixed(2) : "1.00";
      console.log(
        `[ClownFish Debug] State: ${behaviorStateRef.current} | Clip: ${activeClipNameRef.current} | Weight: ${weight} | TimeScale: ${actualTimeScale} | Speed: ${(moveSpeed * 100).toFixed(0)}cm/s`
      );
    }
  });

  // Skala visual (~45cm) agar proporsional dan jelas terlihat di tengah akuarium
  const visualScale = 2.8;

  return (
    <group ref={rootGroupRef}>
      <group ref={meshGroupRef} scale={[visualScale, visualScale, visualScale]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}
