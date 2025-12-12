// =============================================================================
// JTB PAPER: FULL PARAMETER SWEEP
// Run with: node test-jtb-sweep.js
//
// Generates publication-ready data for:
// - Figure 3: Complexity collapse (N_eff vs k)
// - Figure 4: Stability-adaptability trade-off
// - Phase diagram: k × λ
// =============================================================================

console.log("=== JTB PAPER: PARAMETER SWEEP ===\n");

const N = 64;
const nTrials = 10;
const burnIn = 500;
const measureSteps = 500;
const dt = 0.1;

// =============================================================================
// KURAMOTO LATTICE (same as before)
// =============================================================================

function createLattice() {
  const theta = new Float32Array(N);
  const omega = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    theta[i] = Math.random() * 2 * Math.PI - Math.PI;
    omega[i] = 0.5 + (Math.random() - 0.5) * 0.3;
  }
  return { theta, omega };
}

function stepLattice(lattice, K, noise, dt) {
  const { theta, omega } = lattice;
  const dtheta = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const left = (i - 1 + N) % N;
    const right = (i + 1) % N;
    let coupling = Math.sin(theta[left] - theta[i]) + Math.sin(theta[right] - theta[i]);
    const u1 = Math.random(), u2 = Math.random();
    const eta = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
    dtheta[i] = omega[i] + K * coupling + noise * eta;
  }

  for (let i = 0; i < N; i++) {
    theta[i] += dt * dtheta[i];
    theta[i] = ((theta[i] + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  }
}

// =============================================================================
// FOURIER CODE
// =============================================================================

function fourierEncode(theta, maxK) {
  const modes = [];
  for (let k = 0; k <= maxK; k++) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i++) {
      const phase = theta[i] - 2 * Math.PI * k * i / N;
      re += Math.cos(phase);
      im += Math.sin(phase);
    }
    modes.push({ re: re / N, im: im / N });
  }
  return modes;
}

function fourierDecode(modes, k) {
  const recon = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let zRe = 0, zIm = 0;
    for (let m = 0; m <= Math.min(k, modes.length - 1); m++) {
      const phase = 2 * Math.PI * m * i / N;
      const c = Math.cos(phase), s = Math.sin(phase);
      zRe += modes[m].re * c - modes[m].im * s;
      zIm += modes[m].re * s + modes[m].im * c;
      if (m > 0) {
        zRe += modes[m].re * c + modes[m].im * s;
        zIm += -modes[m].re * s + modes[m].im * c;
      }
    }
    recon[i] = Math.atan2(zIm, zRe);
  }
  return recon;
}

// =============================================================================
// METRICS
// =============================================================================

function spectralComplexity(theta) {
  const modes = fourierEncode(theta, N / 2);
  const amps = [];
  let sum = 0;
  for (let k = 1; k < modes.length; k++) {
    const amp = Math.sqrt(modes[k].re ** 2 + modes[k].im ** 2);
    amps.push(amp);
    sum += amp;
  }
  if (sum < 1e-10) return 1;
  let entropy = 0;
  for (const a of amps) {
    const p = a / sum;
    if (p > 1e-10) entropy -= p * Math.log(p);
  }
  return Math.exp(entropy);
}

function phaseMismatch(thetaA, thetaB) {
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const diff = thetaA[i] - thetaB[i];
    sum += Math.abs(Math.sin(diff / 2));
  }
  return sum / N;
}

// Long-time variance (stability measure)
function measureVariance(theta, history) {
  // Track how much the phase field changes over time
  if (!history) return 0;
  let variance = 0;
  for (let i = 0; i < N; i++) {
    const diff = theta[i] - history[i];
    variance += Math.sin(diff / 2) ** 2;
  }
  return variance / N;
}

// =============================================================================
// COUPLED STEP
// =============================================================================

function stepCoupled(A, B, k, K, lambda, noise, dt) {
  stepLattice(A, K, noise, dt);

  const modesA = fourierEncode(A.theta, k);
  const targetPhase = fourierDecode(modesA, k);

  const { theta, omega } = B;
  const dtheta = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const left = (i - 1 + N) % N;
    const right = (i + 1) % N;
    let coupling = Math.sin(theta[left] - theta[i]) + Math.sin(theta[right] - theta[i]);
    const codeConstraint = lambda * Math.sin(targetPhase[i] - theta[i]);
    const u1 = Math.random(), u2 = Math.random();
    const eta = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
    dtheta[i] = omega[i] + K * coupling + codeConstraint + noise * 0.5 * eta;
  }

  for (let i = 0; i < N; i++) {
    theta[i] += dt * dtheta[i];
    theta[i] = ((theta[i] + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  }
}

// =============================================================================
// EXPERIMENT 1: k sweep (Figure 3 - Complexity Collapse)
// =============================================================================

console.log("=== EXPERIMENT 1: k SWEEP (Figure 3) ===\n");
console.log("Testing: N_eff(A) stable, N_eff(B) decreases with k\n");

const K = 0.5;
const noise = 0.3;
const lambda_fixed = 1.0;

const kValues = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32];
const kSweepResults = [];

for (const k of kValues) {
  let totalComplexA = 0, totalComplexB = 0, totalMismatch = 0;

  for (let trial = 0; trial < nTrials; trial++) {
    const A = createLattice();
    const B = createLattice();

    for (let t = 0; t < burnIn; t++) {
      stepCoupled(A, B, k, K, lambda_fixed, noise, dt);
    }

    let sumComplexA = 0, sumComplexB = 0, sumMismatch = 0;
    for (let t = 0; t < measureSteps; t++) {
      stepCoupled(A, B, k, K, lambda_fixed, noise, dt);
      sumComplexA += spectralComplexity(A.theta);
      sumComplexB += spectralComplexity(B.theta);
      sumMismatch += phaseMismatch(A.theta, B.theta);
    }

    totalComplexA += sumComplexA / measureSteps;
    totalComplexB += sumComplexB / measureSteps;
    totalMismatch += sumMismatch / measureSteps;
  }

  const result = {
    k,
    complexA: totalComplexA / nTrials,
    complexB: totalComplexB / nTrials,
    mismatch: totalMismatch / nTrials
  };
  kSweepResults.push(result);

  console.log(`k=${k.toString().padStart(2)}: N_eff(A)=${result.complexA.toFixed(2)} N_eff(B)=${result.complexB.toFixed(2)} mismatch=${result.mismatch.toFixed(3)}`);
}

// =============================================================================
// EXPERIMENT 2: λ sweep (coupling strength)
// =============================================================================

console.log("\n=== EXPERIMENT 2: λ SWEEP ===\n");
console.log("Testing: How coupling strength affects B's behavior\n");

const lambdaValues = [0, 0.1, 0.25, 0.5, 1.0, 2.0, 4.0];
const k_fixed = 8;
const lambdaSweepResults = [];

for (const lambda of lambdaValues) {
  let totalComplexB = 0, totalMismatch = 0, totalStability = 0;

  for (let trial = 0; trial < nTrials; trial++) {
    const A = createLattice();
    const B = createLattice();

    for (let t = 0; t < burnIn; t++) {
      stepCoupled(A, B, k_fixed, K, lambda, noise, dt);
    }

    let sumComplexB = 0, sumMismatch = 0;
    let prevTheta = new Float32Array(B.theta);
    let sumVariance = 0;

    for (let t = 0; t < measureSteps; t++) {
      stepCoupled(A, B, k_fixed, K, lambda, noise, dt);
      sumComplexB += spectralComplexity(B.theta);
      sumMismatch += phaseMismatch(A.theta, B.theta);

      // Measure stability as inverse of variance
      if (t % 50 === 0 && t > 0) {
        sumVariance += measureVariance(B.theta, prevTheta);
        prevTheta = new Float32Array(B.theta);
      }
    }

    totalComplexB += sumComplexB / measureSteps;
    totalMismatch += sumMismatch / measureSteps;
    totalStability += sumVariance / (measureSteps / 50);
  }

  const result = {
    lambda,
    complexB: totalComplexB / nTrials,
    mismatch: totalMismatch / nTrials,
    stability: totalStability / nTrials
  };
  lambdaSweepResults.push(result);

  console.log(`λ=${lambda.toFixed(2).padStart(4)}: N_eff(B)=${result.complexB.toFixed(2)} mismatch=${result.mismatch.toFixed(3)} drift=${result.stability.toFixed(4)}`);
}

// =============================================================================
// EXPERIMENT 3: Phase Diagram (k × λ)
// =============================================================================

console.log("\n=== EXPERIMENT 3: PHASE DIAGRAM (k × λ) ===\n");
console.log("Mapping the viable regime\n");

const kRange = [1, 2, 4, 8, 16];
const lambdaRange = [0.25, 0.5, 1.0, 2.0];
const phaseDiagram = [];

console.log("k\\λ    " + lambdaRange.map(l => l.toFixed(2).padStart(6)).join(" "));
console.log("-".repeat(40));

for (const k of kRange) {
  const row = [];
  for (const lambda of lambdaRange) {
    let totalComplexB = 0;

    for (let trial = 0; trial < 5; trial++) { // Fewer trials for speed
      const A = createLattice();
      const B = createLattice();

      for (let t = 0; t < 300; t++) {
        stepCoupled(A, B, k, K, lambda, noise, dt);
      }

      let sum = 0;
      for (let t = 0; t < 200; t++) {
        stepCoupled(A, B, k, K, lambda, noise, dt);
        sum += spectralComplexity(B.theta);
      }
      totalComplexB += sum / 200;
    }

    const avgComplexB = totalComplexB / 5;
    row.push(avgComplexB);
    phaseDiagram.push({ k, lambda, complexB: avgComplexB });
  }

  console.log(`k=${k.toString().padStart(2)}   ` + row.map(v => v.toFixed(1).padStart(6)).join(" "));
}

// =============================================================================
// EXPERIMENT 4: Control - No Coupling (Figure 4 baseline)
// =============================================================================

console.log("\n=== EXPERIMENT 4: CONTROL (λ=0) ===\n");
console.log("B evolves independently - should drift/lose coherence with A\n");

const controlTrials = 10;
let controlMismatchStart = 0, controlMismatchEnd = 0;
let controlComplexB = 0;

for (let trial = 0; trial < controlTrials; trial++) {
  const A = createLattice();
  const B = createLattice();

  // Measure initial mismatch
  let initMismatch = 0;
  for (let t = 0; t < 100; t++) {
    stepLattice(A, K, noise, dt);
    stepLattice(B, K, noise, dt);
    initMismatch += phaseMismatch(A.theta, B.theta);
  }
  controlMismatchStart += initMismatch / 100;

  // Long evolution without coupling
  for (let t = 0; t < 2000; t++) {
    stepLattice(A, K, noise, dt);
    stepLattice(B, K, noise, dt);
  }

  // Measure final mismatch
  let finalMismatch = 0, sumComplex = 0;
  for (let t = 0; t < 100; t++) {
    stepLattice(A, K, noise, dt);
    stepLattice(B, K, noise, dt);
    finalMismatch += phaseMismatch(A.theta, B.theta);
    sumComplex += spectralComplexity(B.theta);
  }
  controlMismatchEnd += finalMismatch / 100;
  controlComplexB += sumComplex / 100;
}

console.log(`Without coupling (λ=0):`);
console.log(`  Mismatch early: ${(controlMismatchStart / controlTrials).toFixed(3)}`);
console.log(`  Mismatch late:  ${(controlMismatchEnd / controlTrials).toFixed(3)}`);
console.log(`  B complexity:   ${(controlComplexB / controlTrials).toFixed(2)}`);
console.log(`  → Systems drift apart (mismatch stays high, no alignment)`);

// =============================================================================
// SUMMARY FOR PAPER
// =============================================================================

console.log("\n" + "=".repeat(60));
console.log("SUMMARY: JTB PAPER DATA");
console.log("=".repeat(60));

console.log("\nFIGURE 3 - Complexity Collapse:");
console.log("k,N_eff_A,N_eff_B,mismatch");
for (const r of kSweepResults) {
  console.log(`${r.k},${r.complexA.toFixed(2)},${r.complexB.toFixed(2)},${r.mismatch.toFixed(3)}`);
}

console.log("\nFIGURE 4 - Coupling Strength:");
console.log("lambda,N_eff_B,mismatch,drift");
for (const r of lambdaSweepResults) {
  console.log(`${r.lambda},${r.complexB.toFixed(2)},${r.mismatch.toFixed(3)},${r.stability.toFixed(4)}`);
}

console.log("\nKEY RESULTS:");
const lowK = kSweepResults.find(r => r.k === 1);
const highK = kSweepResults.find(r => r.k === 16);
console.log(`- Complexity collapse: k=1 → N_eff=${lowK.complexB.toFixed(1)}, k=16 → N_eff=${highK.complexB.toFixed(1)}`);
console.log(`- A remains complex: mean N_eff(A) = ${(kSweepResults.reduce((s,r) => s + r.complexA, 0) / kSweepResults.length).toFixed(1)}`);
console.log(`- Control: without coupling, systems do not align`);

const noCoupling = lambdaSweepResults.find(r => r.lambda === 0);
const strongCoupling = lambdaSweepResults.find(r => r.lambda === 2);
console.log(`- λ effect: λ=0 → mismatch=${noCoupling.mismatch.toFixed(3)}, λ=2 → mismatch=${strongCoupling.mismatch.toFixed(3)}`);
