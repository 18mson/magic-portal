import { Vector3 } from "three";

export interface RegisteredMarineLife {
  id: string;
  species: string;
  position: Vector3;
  radius: number;
  targetPelletId: string | null;
  targetPelletDist: number;
}

class MarineLifeRegistry {
  private creatures: Map<string, RegisteredMarineLife> = new Map();

  public register(id: string, species: string, initialPos: Vector3, radius: number) {
    this.creatures.set(id, {
      id,
      species,
      position: initialPos.clone(),
      radius,
      targetPelletId: null,
      targetPelletDist: Infinity,
    });
  }

  public unregister(id: string) {
    this.creatures.delete(id);
  }

  public updatePosition(
    id: string,
    pos: Vector3,
    targetPelletId: string | null,
    targetPelletDist: number
  ) {
    const entry = this.creatures.get(id);
    if (entry) {
      entry.position.copy(pos);
      entry.targetPelletId = targetPelletId;
      entry.targetPelletDist = targetPelletDist;
    }
  }

  public getCreature(id: string): RegisteredMarineLife | undefined {
    return this.creatures.get(id);
  }

  /**
   * Mencari ikan badut terdekat dari posisi tertentu secara real-time.
   */
  public getClosestClownfish(pos: Vector3): RegisteredMarineLife | null {
    let closestDistSq = Infinity;
    let closest: RegisteredMarineLife | null = null;

    for (const creature of this.creatures.values()) {
      if (
        creature.id.startsWith("clownfish") ||
        creature.species.toLowerCase().includes("clownfish")
      ) {
        const dSq = pos.distanceToSquared(creature.position);
        if (dSq < closestDistSq) {
          closestDistSq = dSq;
          closest = creature;
        }
      }
    }

    return closest;
  }

  /**
   * Menghitung gaya tolak anti-tabrakan (Boid Separation & Steering Deflection)
   * Mencegah ikan saling bertumpuk atau menembus satu sama lain.
   */
  public getSeparationForce(
    myId: string,
    myPos: Vector3,
    myRadius: number,
    outVec: Vector3
  ): Vector3 {
    outVec.set(0, 0, 0);

    for (const [otherId, other] of this.creatures.entries()) {
      if (otherId === myId) continue;

      const dx = myPos.x - other.position.x;
      const dy = myPos.y - other.position.y;
      const dz = myPos.z - other.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      // Ambang batas jarak aman (jarak gabungan radius kedua ikan + margin toleransi)
      const minDist = myRadius + other.radius + 0.12;
      const minDistSq = minDist * minDist;

      if (distSq < minDistSq && distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        // Gaya tolak semakin kuat saat semakin dekat (inverse quadratic)
        const overlap = (minDist - dist) / minDist;
        const pushMag = overlap * overlap * 1.8;

        // Komponen tolak normal
        outVec.x += (dx / dist) * pushMag;
        outVec.y += (dy / dist) * pushMag * 0.75; // Dorongan vertikal sedikit lebih lembut
        outVec.z += (dz / dist) * pushMag;

        // Defleksi lateral (belokan menyamping otomatis agar tidak bertabrakan adu kepala)
        outVec.x += -(dz / dist) * pushMag * 0.35;
        outVec.z += (dx / dist) * pushMag * 0.35;
      }
    }

    return outVec;
  }

  /**
   * Mengecek apakah butiran pakan sudah diincar oleh ikan lain yang posisinya jauh lebih dekat.
   * Mencegah semua ikan beramai-ramai menumpuk ke satu butir pakan yang sama.
   */
  public isPelletClaimedByCloser(pelletId: string, myId: string, myDist: number): boolean {
    for (const [otherId, other] of this.creatures.entries()) {
      if (otherId === myId) continue;
      if (other.targetPelletId === pelletId) {
        // Jika ikan lain sudah mengincar dan jaraknya lebih dekat minimal 0.12m
        if (other.targetPelletDist < myDist - 0.12) {
          return true;
        }
      }
    }
    return false;
  }
}

export const marineLifeRegistry = new MarineLifeRegistry();
