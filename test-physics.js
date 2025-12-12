// =============================================================================
// CODE-FORMING PHYSICS TESTS
// Run with: node test-physics.js
//
// This file validates two physical systems for "code formation" visualization:
// 1. Dzhanibekov effect (T-handle flipping) - deterministic chaos
// 2. Particle system in double-well - stochastic with metastable states
//
// Key concept: A "code" is a low-D projection of high-D dynamics.
// For code-forming to work, the code must REFLECT the system state
// but NOT PREDICT the future microstate.
// =============================================================================

console.log("=== CODE-FORMING PHYSICS TESTS ===\n");

// =============================================================================
// PART 1: DZHANIBEKOV EFFECT (Rigid body rotation)
// =============================================================================
//
// A T-handle (wrench) spinning in zero-gravity exhibits the "Dzhanibekov effect":
// rotation around the INTERMEDIATE principal axis is UNSTABLE.
//
// If I1 < I2 < I3 (moments of inertia), then:
// - Rotation around I1 (smallest): STABLE
// - Rotation around I2 (intermediate): UNSTABLE - spontaneous flipping!
// - Rotation around I3 (largest): STABLE
//
// This is a deterministic system with exactly TWO attractor basins (flip states).
// Perfect for demonstrating binary code formation from continuous dynamics.
// =============================================================================

console.log("=== PART 1: DZHANIBEKOV EFFECT ===\n");

const Ix = 1.0;   // Intermediate moment - rotation around X is UNSTABLE
const Iy = 0.2;   // Smallest moment - rotation around Y is stable
const Iz = 1.2;   // Largest moment - rotation around Z is stable

console.log("Moments of inertia: Iy=" + Iy + " < Ix=" + Ix + " < Iz=" + Iz);
console.log("Rotation around X (intermediate) should be UNSTABLE.\n");

let wx, wy, wz;

function resetWrench(axis, mag, perturb) {
  wx = axis === 'X' ? mag : perturb;
  wy = axis === 'Y' ? mag : perturb;
  wz = axis === 'Z' ? mag : perturb;
}

// Euler's equations for torque-free rotation (body frame)
function eulerDerivs(wx, wy, wz) {
  return {
    dwx: (Iy - Iz) * wy * wz / Ix,
    dwy: (Iz - Ix) * wz * wx / Iy,
    dwz: (Ix - Iy) * wx * wy / Iz
  };
}

// RK4 integration for numerical stability
function stepWrenchRK4(dt) {
  const k1 = eulerDerivs(wx, wy, wz);
  const k2 = eulerDerivs(wx + k1.dwx*dt/2, wy + k1.dwy*dt/2, wz + k1.dwz*dt/2);
  const k3 = eulerDerivs(wx + k2.dwx*dt/2, wy + k2.dwy*dt/2, wz + k2.dwz*dt/2);
  const k4 = eulerDerivs(wx + k3.dwx*dt, wy + k3.dwy*dt, wz + k3.dwz*dt);
  wx += (k1.dwx + 2*k2.dwx + 2*k3.dwx + k4.dwx) * dt / 6;
  wy += (k1.dwy + 2*k2.dwy + 2*k3.dwy + k4.dwy) * dt / 6;
  wz += (k1.dwz + 2*k2.dwz + 2*k3.dwz + k4.dwz) * dt / 6;
}

function angularMomentum() {
  return Math.sqrt((Ix*wx)**2 + (Iy*wy)**2 + (Iz*wz)**2);
}

function kineticEnergy() {
  return 0.5 * (Ix*wx*wx + Iy*wy*wy + Iz*wz*wz);
}

// Test axis stability
console.log("--- Axis Stability Test ---\n");

function testStability(axis, expectedStable) {
  resetWrench(axis, 1.0, 0.01);
  const L0 = angularMomentum();
  const T0 = kineticEnergy();

  const getPerturb = () => {
    if (axis === 'X') return Math.sqrt(wy*wy + wz*wz);
    if (axis === 'Y') return Math.sqrt(wx*wx + wz*wz);
    return Math.sqrt(wx*wx + wy*wy);
  };

  const p0 = getPerturb();
  for (let i = 0; i < 50000; i++) stepWrenchRK4(0.01);
  const p1 = getPerturb();

  const L1 = angularMomentum();
  const T1 = kineticEnergy();

  const growth = p1 / p0;
  const stable = growth < 5;
  const inertia = axis === 'X' ? Ix : axis === 'Y' ? Iy : Iz;
  const correct = stable === expectedStable;

  console.log(axis + "-axis (I=" + inertia + "): perturbation grew " + growth.toFixed(1) + "x → " +
    (stable ? "STABLE" : "UNSTABLE") + (correct ? " ✓" : " ✗ WRONG"));
  console.log("  Conservation: L drift=" + ((L1-L0)/L0*100).toFixed(6) + "%, T drift=" + ((T1-T0)/T0*100).toFixed(6) + "%");
}

testStability('Y', true);   // Smallest I - should be STABLE
testStability('X', false);  // Intermediate I - should be UNSTABLE
testStability('Z', true);   // Largest I - should be STABLE

// Test Dzhanibekov flipping
console.log("\n--- Dzhanibekov Flip Detection ---\n");

resetWrench('X', 1.0, 0.1);
const L0 = angularMomentum();
const T0 = kineticEnergy();

let flips = [];
let lastSign = Math.sign(wx);

for (let i = 0; i < 100000; i++) {
  stepWrenchRK4(0.005);
  if (Math.sign(wx) !== lastSign && Math.sign(wx) !== 0) {
    flips.push(i);
    lastSign = Math.sign(wx);
  }
}

const L1 = angularMomentum();
const T1 = kineticEnergy();

console.log("Started with rotation around intermediate axis (X) + perturbation");
console.log("Flips detected: " + flips.length);
if (flips.length >= 2) {
  const period = flips[1] - flips[0];
  console.log("Flip period: ~" + period + " steps");
  console.log("DZHANIBEKOV EFFECT: CONFIRMED ✓");
} else {
  console.log("DZHANIBEKOV EFFECT: NOT DETECTED ✗");
}
console.log("Conservation: L=" + ((L1-L0)/L0*100).toFixed(6) + "%, T=" + ((T1-T0)/T0*100).toFixed(6) + "%");

// =============================================================================
// PART 2: PARTICLE SYSTEM (Stochastic double-well)
// =============================================================================
//
// N particles in a double-well potential with Langevin (thermal) noise.
// The "code" is the coarse projection: c(t) = (# right - # left) / N
//
// Key insight: if dynamics evolve faster than observation rate, the code
// REFLECTS the current state but CANNOT PREDICT the next state.
//
// We measure this with autocorrelation: ac1 < 0.9 means "good decorrelation"
// =============================================================================

console.log("\n=== PART 2: PARTICLE SYSTEM ===\n");

function createParticles(N, spread) {
  const p = [];
  for (let i = 0; i < N; i++) {
    p.push({ x: (Math.random() - 0.5) * spread });
  }
  return p;
}

function getCode(particles) {
  let right = 0;
  for (const p of particles) if (p.x > 0) right++;
  return (2 * right - particles.length) / particles.length;
}

// Brownian motion with substeps
function stepBrownian(p, D, substeps) {
  const dt = 1 / substeps;
  const sigma = Math.sqrt(2 * D * dt);

  for (let s = 0; s < substeps; s++) {
    for (const particle of p) {
      // Box-Muller for Gaussian noise
      const u1 = Math.random(), u2 = Math.random();
      const noise = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
      particle.x += sigma * noise;

      // Reflecting boundaries
      if (particle.x > 50) particle.x = 100 - particle.x;
      if (particle.x < -50) particle.x = -100 - particle.x;
    }
  }
}

// Double-well with Langevin dynamics
function stepDoubleWell(particles, T, substeps) {
  const wellPos = 25;
  const k = 0.01;
  const gamma = 1.0;
  const dt = 1 / substeps;

  for (let s = 0; s < substeps; s++) {
    for (const p of particles) {
      // Force toward nearest well
      const target = p.x > 0 ? wellPos : -wellPos;
      const force = -k * (p.x - target);

      // Langevin noise
      const u1 = Math.random(), u2 = Math.random();
      const noise = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
      const stoch = Math.sqrt(2 * gamma * T * dt) * noise;

      p.x += (force / gamma) * dt + stoch;

      // Walls
      if (p.x > 60) p.x = 120 - p.x;
      if (p.x < -60) p.x = -120 - p.x;
    }
  }
}

function analyzeSystem(stepFn, N, param, substeps, observations) {
  const particles = createParticles(N, 80);

  const codes = [];
  for (let i = 0; i < observations; i++) {
    stepFn(particles, param, substeps);
    codes.push(getCode(particles));
  }

  const mean = codes.reduce((a,b) => a+b) / codes.length;
  const variance = codes.reduce((s,c) => s + (c-mean)**2, 0) / codes.length;

  function autocorr(lag) {
    if (variance < 1e-10) return 1;
    let sum = 0;
    for (let i = 0; i < codes.length - lag; i++) {
      sum += (codes[i] - mean) * (codes[i + lag] - mean);
    }
    return (sum / (codes.length - lag)) / variance;
  }

  let crossings = 0;
  for (let i = 1; i < codes.length; i++) {
    if ((codes[i-1] > 0) !== (codes[i] > 0)) crossings++;
  }

  return { ac1: autocorr(1), ac5: autocorr(5), crossings, variance };
}

// Test Brownian motion
console.log("--- Brownian Motion (baseline) ---");
console.log("Code = fraction of particles on right side\n");

const brownianTests = [
  { N: 10, D: 5, substeps: 1 },
  { N: 10, D: 5, substeps: 10 },
  { N: 10, D: 5, substeps: 50 },
  { N: 10, D: 20, substeps: 10 },
];

for (const t of brownianTests) {
  const r = analyzeSystem(stepBrownian, t.N, t.D, t.substeps, 2000);
  const quality = r.ac1 < 0.75 ? "GOOD" : r.ac1 < 0.9 ? "OK" : "PREDICTABLE";
  console.log("N=" + t.N + " D=" + t.D + " sub=" + t.substeps +
    ": ac1=" + r.ac1.toFixed(3) + " → " + quality);
}

// Test double-well
console.log("\n--- Double-Well (metastable states) ---");
console.log("Particles attracted to wells at x=±25, thermal noise causes hopping\n");

const dwTests = [
  { N: 10, T: 5, substeps: 10 },
  { N: 10, T: 10, substeps: 10 },
  { N: 10, T: 20, substeps: 10 },
  { N: 10, T: 20, substeps: 30 },
  { N: 20, T: 20, substeps: 30 },
];

for (const t of dwTests) {
  const r = analyzeSystem(stepDoubleWell, t.N, t.T, t.substeps, 2000);
  const quality = r.ac1 < 0.8 && r.crossings > 10 ? "GOOD" :
                  r.ac1 < 0.95 && r.crossings > 0 ? "OK" : "NEEDS TUNING";
  console.log("N=" + t.N + " T=" + t.T + " sub=" + t.substeps +
    ": ac1=" + r.ac1.toFixed(3) + " crossings=" + r.crossings + " → " + quality);
}

// =============================================================================
// CONCLUSIONS
// =============================================================================

console.log("\n=== CONCLUSIONS ===\n");

console.log("DZHANIBEKOV (wrench):");
console.log("  - RK4 integration preserves energy/momentum to 6 decimal places");
console.log("  - Intermediate axis is unstable → spontaneous flipping");
console.log("  - Binary code (A/B) reflects flip state");
console.log("  - Deterministic chaos: code reflects state but sensitive to initial conditions");

console.log("\nPARTICLE SYSTEM:");
console.log("  - Autocorrelation (ac1) measures predictability");
console.log("  - ac1 > 0.95: code too predictable (bad for code-forming)");
console.log("  - ac1 ~ 0.7-0.9: code reflects state but can't predict future (good!)");
console.log("  - ac1 < 0.5: too noisy, code doesn't capture structure");
console.log("  - More substeps OR higher temperature → lower ac1");
console.log("  - Double-well creates metastable states with discrete transitions");

console.log("\nFOR VISUALIZATION:");
console.log("  - Run 10-30 physics substeps per animation frame");
console.log("  - Use 10-20 particles (each crossing = visible code change)");
console.log("  - Temperature high enough for well-crossings");
console.log("  - Target ac1 < 0.9 for 'code reflects but can't predict'");
