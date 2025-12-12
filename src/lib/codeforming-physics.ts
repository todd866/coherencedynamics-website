/**
 * =============================================================================
 * Code-Forming Physics Engine (Headless)
 * =============================================================================
 *
 * Models how high-dimensional continuous dynamics collapse into discrete codes
 * as dimensionality is reduced.
 *
 * Core insight: Codes both REFLECT and CONSTRAIN dynamics.
 * - Reflect: Many high-D states map to one symbol (lossy compression)
 * - Constrain: Once formed, codes channel future dynamics into their basins
 *
 * =============================================================================
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Vec {
  components: number[];
}

export interface Basin {
  id: string;
  center: Vec;        // Center point in state space
  strength: number;   // How strongly it attracts (grows as code solidifies)
  occupancy: number;  // How long system has been in this basin
}

export interface CodeState {
  // Current position in state space
  position: Vec;

  // Velocity in state space
  velocity: Vec;

  // Available dimensionality (0-1, where 1 = full dimensions available)
  dimensionality: number;

  // Emergent basins (codes) - these form as dimensionality drops
  basins: Basin[];

  // Which basin (if any) the system is currently in
  currentBasin: string | null;

  // History of basin transitions (the "code sequence")
  codeHistory: string[];

  // Metrics
  entropy: number;           // How spread out the dynamics are
  codeStrength: number;      // How crystallized the code has become
  transitionRate: number;    // How often basin transitions occur
}

export interface PhysicsConfig {
  // Number of dimensions in the full state space
  dimensions: number;

  // Number of basins that can form
  numBasins: number;

  // How fast the system moves
  baseSpeed: number;

  // How strongly basins attract when formed
  basinStrength: number;

  // Noise/temperature - keeps system from getting stuck
  temperature: number;

  // How quickly basins strengthen when occupied
  basinLearningRate: number;

  // How much codes constrain dynamics (0 = pure reflection, 1 = full constraint)
  constraintStrength: number;
}

// =============================================================================
// VECTOR MATH
// =============================================================================

function vecCreate(dimensions: number, fill: number = 0): Vec {
  return { components: new Array(dimensions).fill(fill) };
}

function vecRandom(dimensions: number, magnitude: number = 1): Vec {
  const components = [];
  for (let i = 0; i < dimensions; i++) {
    components.push((Math.random() - 0.5) * 2 * magnitude);
  }
  return { components };
}

function vecRandomOnSphere(dimensions: number, radius: number = 1): Vec {
  // Generate random point on n-sphere using Gaussian method
  const components = [];
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    // Box-Muller for Gaussian
    const u1 = Math.random();
    const u2 = Math.random();
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    components.push(g);
    sumSq += g * g;
  }
  const norm = radius / Math.sqrt(sumSq);
  return { components: components.map(c => c * norm) };
}

function vecAdd(a: Vec, b: Vec): Vec {
  return {
    components: a.components.map((v, i) => v + (b.components[i] || 0))
  };
}

function vecSub(a: Vec, b: Vec): Vec {
  return {
    components: a.components.map((v, i) => v - (b.components[i] || 0))
  };
}

function vecScale(v: Vec, s: number): Vec {
  return { components: v.components.map(c => c * s) };
}

function vecMagnitude(v: Vec): number {
  return Math.sqrt(v.components.reduce((sum, c) => sum + c * c, 0));
}

function vecNormalize(v: Vec, targetMag: number = 1): Vec {
  const mag = vecMagnitude(v);
  if (mag < 0.0001) return v;
  return vecScale(v, targetMag / mag);
}

function vecDot(a: Vec, b: Vec): number {
  return a.components.reduce((sum, c, i) => sum + c * (b.components[i] || 0), 0);
}

function vecDistance(a: Vec, b: Vec): number {
  return vecMagnitude(vecSub(a, b));
}

// Project vector onto first N dimensions, zeroing the rest
function vecProject(v: Vec, activeDimensions: number): Vec {
  return {
    components: v.components.map((c, i) => i < activeDimensions ? c : 0)
  };
}

// Smoothly interpolate dimensionality (dimensions fade rather than snap)
function vecProjectSmooth(v: Vec, dimensionality: number): Vec {
  const fullDims = v.components.length;
  return {
    components: v.components.map((c, i) => {
      // Each dimension fades out as dimensionality drops
      // Higher dimensions fade first
      const dimThreshold = (fullDims - i) / fullDims;
      // dimStrength computed but unused - keeping comment for reference
      void dimThreshold;
      // Simpler: linear fade based on dimension index
      const fadePoint = i / fullDims;
      const fade = dimensionality > fadePoint
        ? 1
        : Math.max(0, dimensionality / fadePoint);
      return c * fade;
    })
  };
}

// =============================================================================
// BASIN GENERATION
// =============================================================================

function generateBasins(config: PhysicsConfig): Basin[] {
  const basins: Basin[] = [];
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Place basins roughly evenly distributed on unit sphere
  for (let i = 0; i < config.numBasins; i++) {
    // Use deterministic-ish placement for reproducibility
    const phi = (i / config.numBasins) * Math.PI * 2;
    const theta = Math.acos(1 - 2 * ((i + 0.5) / config.numBasins));

    // For higher dimensions, we'll just use random placement
    const center = config.dimensions <= 3
      ? {
          components: [
            Math.sin(theta) * Math.cos(phi),
            Math.sin(theta) * Math.sin(phi),
            Math.cos(theta),
            ...new Array(Math.max(0, config.dimensions - 3)).fill(0)
          ].slice(0, config.dimensions)
        }
      : vecRandomOnSphere(config.dimensions, 1);

    basins.push({
      id: labels[i] || `B${i}`,
      center,
      strength: 0.1,  // Start weak, strengthen as occupied
      occupancy: 0
    });
  }

  return basins;
}

// =============================================================================
// PHYSICS ENGINE
// =============================================================================

export class CodeFormingPhysics {
  private config: PhysicsConfig;
  private state: CodeState;
  private time: number = 0;
  private lastBasinChange: number = 0;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = {
      dimensions: 4,
      numBasins: 4,
      baseSpeed: 0.02,
      basinStrength: 0.5,
      temperature: 0.1,
      basinLearningRate: 0.01,
      constraintStrength: 0.5,
      ...config
    };

    this.state = this.createInitialState();
  }

  private createInitialState(): CodeState {
    return {
      position: vecRandomOnSphere(this.config.dimensions, 1),
      velocity: vecRandom(this.config.dimensions, this.config.baseSpeed),
      dimensionality: 1.0,  // Start with full dimensions
      basins: generateBasins(this.config),
      currentBasin: null,
      codeHistory: [],
      entropy: 1.0,
      codeStrength: 0,
      transitionRate: 0
    };
  }

  // Set dimensionality (0-1)
  setDimensionality(d: number): void {
    this.state.dimensionality = Math.max(0.05, Math.min(1, d));
  }

  getDimensionality(): number {
    return this.state.dimensionality;
  }

  getState(): CodeState {
    return this.state;
  }

  getConfig(): PhysicsConfig {
    return this.config;
  }

  // Main physics step
  step(dt: number = 1): void {
    this.time += dt;
    const { dimensionality, position, velocity, basins } = this.state;
    const { temperature, basinStrength, baseSpeed, basinLearningRate, constraintStrength } = this.config;

    // === 1. COMPUTE EFFECTIVE POSITION (projected to available dimensions) ===
    const effectivePos = vecProjectSmooth(position, dimensionality);

    // === 2. FIND NEAREST BASIN AND COMPUTE BASIN FORCES ===
    let nearestBasin: Basin | null = null;
    let nearestDist = Infinity;
    let basinForce = vecCreate(this.config.dimensions);

    // Basin influence scales with dimensionality collapse
    // More collapsed = stronger basin attraction
    const basinInfluence = (1 - dimensionality) * basinStrength;

    for (const basin of basins) {
      const basinPos = vecProjectSmooth(basin.center, dimensionality);
      const dist = vecDistance(effectivePos, basinPos);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestBasin = basin;
      }

      // Attraction force toward basin (stronger when closer and when collapsed)
      if (dist > 0.01) {
        const dir = vecNormalize(vecSub(basinPos, effectivePos));
        const strength = basinInfluence * basin.strength / (dist * dist + 0.1);
        basinForce = vecAdd(basinForce, vecScale(dir, strength));
      }
    }

    // === 3. UPDATE CURRENT BASIN ===
    const basinThreshold = 0.3 + dimensionality * 0.4; // Easier to be "in" a basin when collapsed

    if (nearestBasin && nearestDist < basinThreshold) {
      if (this.state.currentBasin !== nearestBasin.id) {
        // Basin transition!
        this.state.currentBasin = nearestBasin.id;
        this.state.codeHistory.push(nearestBasin.id);

        // Keep history bounded
        if (this.state.codeHistory.length > 100) {
          this.state.codeHistory = this.state.codeHistory.slice(-50);
        }

        // Update transition rate
        const timeSinceLastChange = this.time - this.lastBasinChange;
        this.state.transitionRate = 1 / Math.max(1, timeSinceLastChange);
        this.lastBasinChange = this.time;
      }

      // Strengthen this basin (code learning)
      nearestBasin.occupancy += dt;
      nearestBasin.strength = Math.min(2, nearestBasin.strength + basinLearningRate * dt);

      // Codes CONSTRAIN dynamics: when in a basin, velocity gets channeled
      if (constraintStrength > 0 && dimensionality < 0.8) {
        // Project velocity to be tangent to basin boundary (can orbit but not escape easily)
        const toCenter = vecSub(nearestBasin.center, position);
        const radialComponent = vecScale(toCenter, vecDot(velocity, toCenter) / (vecDot(toCenter, toCenter) + 0.01));
        const constrainedVel = vecSub(velocity, vecScale(radialComponent, constraintStrength * (1 - dimensionality)));
        this.state.velocity = constrainedVel;
      }
    } else {
      this.state.currentBasin = null;
    }

    // === 4. COMPUTE AUTONOMOUS DYNAMICS ===
    // Free rotation on the hypersphere (geodesic motion)
    let autonomousForce = vecCreate(this.config.dimensions);

    // Add tangential velocity to stay on sphere
    const radial = vecNormalize(position);
    const radialVel = vecScale(radial, vecDot(velocity, radial));
    void vecSub(velocity, radialVel); // tangentVel computed for reference

    // Small centripetal correction to stay on unit sphere
    const distFromSphere = vecMagnitude(position) - 1;
    const centripetal = vecScale(radial, -distFromSphere * 0.5);
    autonomousForce = vecAdd(autonomousForce, centripetal);

    // === 5. ADD THERMAL NOISE ===
    const noise = vecRandom(this.config.dimensions, temperature * (0.5 + dimensionality * 0.5));

    // === 6. INTEGRATE ===
    // Combine forces
    let totalForce = vecAdd(vecAdd(autonomousForce, basinForce), noise);

    // Project force to available dimensions
    totalForce = vecProjectSmooth(totalForce, dimensionality);

    // Update velocity
    this.state.velocity = vecAdd(velocity, vecScale(totalForce, dt));

    // Damping (more damping when collapsed = stickier basins)
    const damping = 0.98 - (1 - dimensionality) * 0.1;
    this.state.velocity = vecScale(this.state.velocity, damping);

    // Speed limit
    const speed = vecMagnitude(this.state.velocity);
    if (speed > baseSpeed * 3) {
      this.state.velocity = vecScale(this.state.velocity, baseSpeed * 3 / speed);
    }

    // Update position
    this.state.position = vecAdd(position, vecScale(this.state.velocity, dt));

    // Renormalize to unit sphere
    this.state.position = vecNormalize(this.state.position, 1);

    // === 7. UPDATE METRICS ===
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const { dimensionality, basins, velocity } = this.state;

    // Entropy: high when moving freely, low when stuck in basin
    const speed = vecMagnitude(velocity);
    const speedEntropy = Math.min(1, speed / this.config.baseSpeed);
    const dimEntropy = dimensionality;
    this.state.entropy = speedEntropy * 0.5 + dimEntropy * 0.5;

    // Code strength: how crystallized are the basins?
    const avgBasinStrength = basins.reduce((s, b) => s + b.strength, 0) / basins.length;
    void Math.max(...basins.map(b => b.occupancy)); // maxOccupancy computed for reference
    this.state.codeStrength = Math.min(1, avgBasinStrength * 0.5 + (1 - dimensionality) * 0.5);
  }

  // Get the effective (projected) position for rendering
  getEffectivePosition(): Vec {
    return vecProjectSmooth(this.state.position, this.state.dimensionality);
  }

  // Get basin info for rendering
  getBasinInfo(): { id: string; center: Vec; strength: number; isActive: boolean }[] {
    void this.getEffectivePosition(); // effectivePos computed for reference
    return this.state.basins.map(b => ({
      id: b.id,
      center: vecProjectSmooth(b.center, this.state.dimensionality),
      strength: b.strength,
      isActive: b.id === this.state.currentBasin
    }));
  }

  // Reset to initial state
  reset(): void {
    this.state = this.createInitialState();
    this.time = 0;
    this.lastBasinChange = 0;
  }

  // Get recent code sequence
  getRecentCode(length: number = 10): string[] {
    return this.state.codeHistory.slice(-length);
  }

  // Diagnostic string
  toString(): string {
    const { dimensionality, currentBasin, entropy, codeStrength, transitionRate } = this.state;
    const pos = this.getEffectivePosition().components.slice(0, 3).map(c => c.toFixed(2)).join(', ');
    const code = this.getRecentCode(5).join('');
    return [
      `dim=${dimensionality.toFixed(2)}`,
      `pos=(${pos})`,
      `basin=${currentBasin || '-'}`,
      `entropy=${entropy.toFixed(2)}`,
      `codeStr=${codeStrength.toFixed(2)}`,
      `rate=${transitionRate.toFixed(3)}`,
      `code=[${code}]`
    ].join(' | ');
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createCodeFormingPhysics(config?: Partial<PhysicsConfig>): CodeFormingPhysics {
  return new CodeFormingPhysics(config);
}

// Export vector utilities for testing
export const vec = {
  create: vecCreate,
  random: vecRandom,
  randomOnSphere: vecRandomOnSphere,
  add: vecAdd,
  sub: vecSub,
  scale: vecScale,
  magnitude: vecMagnitude,
  normalize: vecNormalize,
  dot: vecDot,
  distance: vecDistance,
  project: vecProject,
  projectSmooth: vecProjectSmooth
};
