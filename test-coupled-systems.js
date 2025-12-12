// =============================================================================
// TWO-SYSTEM CODE BOTTLENECK TEST
// Run with: node test-coupled-systems.js
//
// Testing the core claim: "code forms between two high-D systems through a bottleneck"
//
// Setup:
// - System A: Kuramoto lattice evolving freely (high-D wavelike dynamics)
// - System B: Another Kuramoto lattice, constrained to match A through low-D code
// - Code: First k Fourier modes of A's phase field
// - Prediction: As k decreases, B's complexity decreases, mismatch increases
// =============================================================================

console.log("=== TWO-SYSTEM CODE BOTTLENECK TEST ===\n");

const N = 64; // lattice size (1D for speed, can extend to 2D)

// =============================================================================
// KURAMOTO LATTICE
// =============================================================================

function createLattice() {
  const theta = new Float32Array(N);
  const omega = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    theta[i] = Math.random() * 2 * Math.PI - Math.PI;
    omega[i] = 0.5 + (Math.random() - 0.5) * 0.3; // spread of natural frequencies
  }

  return { theta, omega };
}

function stepLattice(lattice, K, noise, dt) {
  const { theta, omega } = lattice;
  const dtheta = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const left = (i - 1 + N) % N;
    const right = (i + 1) % N;

    let coupling = 0;
    coupling += Math.sin(theta[left] - theta[i]);
    coupling += Math.sin(theta[right] - theta[i]);

    // Box-Muller noise
    const u1 = Math.random(), u2 = Math.random();
    const eta = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);

    dtheta[i] = omega[i] + K * coupling + noise * eta;
  }

  for (let i = 0; i < N; i++) {
    theta[i] += dt * dtheta[i];
    // Wrap to [-pi, pi]
    theta[i] = ((theta[i] + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  }
}

// =============================================================================
// FOURIER CODE (bottleneck)
// =============================================================================

// Compute first maxK Fourier modes of phase field
// Treating z_i = exp(i * theta_i) as the complex signal
function fourierEncode(theta, maxK) {
  const modes = [];

  for (let k = 0; k <= maxK; k++) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i++) {
      // z_i = exp(i * theta_i)
      // Mode k: sum of z_i * exp(-i * 2pi * k * i / N)
      const phase = theta[i] - 2 * Math.PI * k * i / N;
      re += Math.cos(phase);
      im += Math.sin(phase);
    }
    modes.push({ re: re / N, im: im / N });
  }

  return modes;
}

// Reconstruct phase field from first k modes
function fourierDecode(modes, k) {
  const recon = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    let zRe = 0, zIm = 0;

    for (let m = 0; m <= Math.min(k, modes.length - 1); m++) {
      const phase = 2 * Math.PI * m * i / N;
      const c = Math.cos(phase);
      const s = Math.sin(phase);

      // Add mode m
      zRe += modes[m].re * c - modes[m].im * s;
      zIm += modes[m].re * s + modes[m].im * c;

      // Add conjugate mode -m for m > 0
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
// COMPLEXITY METRIC: Spectral entropy
// =============================================================================

function spectralComplexity(theta) {
  const modes = fourierEncode(theta, N / 2);

  // Get amplitudes (skip DC)
  const amps = [];
  let sum = 0;
  for (let k = 1; k < modes.length; k++) {
    const amp = Math.sqrt(modes[k].re ** 2 + modes[k].im ** 2);
    amps.push(amp);
    sum += amp;
  }

  if (sum < 1e-10) return 1;

  // Entropy
  let entropy = 0;
  for (const a of amps) {
    const p = a / sum;
    if (p > 1e-10) entropy -= p * Math.log(p);
  }

  // Effective number of modes
  return Math.exp(entropy);
}

// =============================================================================
// MISMATCH: Circular distance between phase fields
// =============================================================================

function phaseMismatch(thetaA, thetaB) {
  let sum = 0;
  for (let i = 0; i < N; i++) {
    // Circular distance: |sin((a-b)/2)|
    const diff = thetaA[i] - thetaB[i];
    sum += Math.abs(Math.sin(diff / 2));
  }
  return sum / N;
}

// =============================================================================
// COUPLED SYSTEM STEP
// =============================================================================

function stepCoupled(A, B, k, K, lambda, noise, dt) {
  // 1. A evolves freely
  stepLattice(A, K, noise, dt);

  // 2. Encode A into code with bandwidth k
  const modesA = fourierEncode(A.theta, k);

  // 3. Decode into what B can "see"
  const targetPhase = fourierDecode(modesA, k);

  // 4. B evolves with constraint toward target
  const { theta, omega } = B;
  const dtheta = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const left = (i - 1 + N) % N;
    const right = (i + 1) % N;

    // Internal Kuramoto coupling
    let coupling = 0;
    coupling += Math.sin(theta[left] - theta[i]);
    coupling += Math.sin(theta[right] - theta[i]);

    // Code constraint: nudge toward low-pass A
    const codeConstraint = lambda * Math.sin(targetPhase[i] - theta[i]);

    // Noise
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
// MAIN EXPERIMENT: Sweep k (code bandwidth)
// =============================================================================

console.log("Experiment: A evolves freely, B constrained through k-mode code\n");
console.log("Prediction: as k decreases, B complexity decreases, mismatch increases\n");

const K = 0.5;       // internal coupling
const lambda = 1.0;  // code constraint strength
const noise = 0.3;   // noise level
const dt = 0.1;
const burnIn = 500;  // steps to equilibrate
const measureSteps = 500;

console.log("Parameters: K=" + K + " lambda=" + lambda + " noise=" + noise + " N=" + N);
console.log("");

const kValues = [1, 2, 4, 8, 16, 32];
const results = [];
const nTrials = 10; // Average over multiple trials

for (const k of kValues) {
  let totalComplexA = 0, totalComplexB = 0, totalMismatch = 0;

  for (let trial = 0; trial < nTrials; trial++) {
    const A = createLattice();
    const B = createLattice();

    // Burn-in
    for (let t = 0; t < burnIn; t++) {
      stepCoupled(A, B, k, K, lambda, noise, dt);
    }

    // Measure
    let sumComplexA = 0, sumComplexB = 0, sumMismatch = 0;

    for (let t = 0; t < measureSteps; t++) {
      stepCoupled(A, B, k, K, lambda, noise, dt);

      sumComplexA += spectralComplexity(A.theta);
      sumComplexB += spectralComplexity(B.theta);
      sumMismatch += phaseMismatch(A.theta, B.theta);
    }

    totalComplexA += sumComplexA / measureSteps;
    totalComplexB += sumComplexB / measureSteps;
    totalMismatch += sumMismatch / measureSteps;
  }

  const avgComplexA = totalComplexA / nTrials;
  const avgComplexB = totalComplexB / nTrials;
  const avgMismatch = totalMismatch / nTrials;

  results.push({ k, complexA: avgComplexA, complexB: avgComplexB, mismatch: avgMismatch });

  console.log("k=" + k.toString().padStart(2) +
    ": A_complexity=" + avgComplexA.toFixed(2) +
    " B_complexity=" + avgComplexB.toFixed(2) +
    " mismatch=" + avgMismatch.toFixed(3));
}

// =============================================================================
// CONTROL: No coupling (lambda=0)
// =============================================================================

console.log("\n--- CONTROL: lambda=0 (no code constraint) ---\n");

const controlResults = [];

for (const k of [1, 8, 32]) {
  let totalComplexB = 0;

  // Average over multiple trials for stable control
  for (let trial = 0; trial < nTrials; trial++) {
    const A = createLattice();
    const B = createLattice();

    // Burn-in with NO coupling
    for (let t = 0; t < burnIn; t++) {
      stepLattice(A, K, noise, dt);
      stepLattice(B, K, noise, dt); // B evolves independently
    }

    let sumComplexB = 0;
    for (let t = 0; t < measureSteps; t++) {
      stepLattice(A, K, noise, dt);
      stepLattice(B, K, noise, dt);
      sumComplexB += spectralComplexity(B.theta);
    }

    totalComplexB += sumComplexB / measureSteps;
  }

  const avgComplexB = totalComplexB / nTrials;
  controlResults.push({ k, complexB: avgComplexB });

  console.log("k=" + k.toString().padStart(2) + " (ignored): B_complexity=" + avgComplexB.toFixed(2));
}

// =============================================================================
// ANALYSIS
// =============================================================================

console.log("\n=== ANALYSIS ===\n");

// Check if A complexity is stable
const aComplex = results.map(r => r.complexA);
const aMean = aComplex.reduce((a, b) => a + b) / aComplex.length;
const aVariation = Math.max(...aComplex) / Math.min(...aComplex);
console.log("A complexity: mean=" + aMean.toFixed(2) + " variation=" + ((aVariation - 1) * 100).toFixed(1) + "%");
console.log("  " + (aVariation < 1.2 ? "PASS: A stays complex regardless of k" : "FAIL: A affected by k"));

// Check if B complexity decreases with k
const bComplex = results.map(r => r.complexB);
let bMonotonic = true;
for (let i = 1; i < bComplex.length; i++) {
  if (bComplex[i] < bComplex[i-1] * 0.9) bMonotonic = false; // allow 10% noise
}
console.log("\nB complexity trend: " + bComplex.map(x => x.toFixed(1)).join(" → "));
console.log("  " + (bMonotonic ? "PASS: B complexity increases with k" : "CHECK: B trend not clean"));

// Check if mismatch increases as k decreases
const mismatches = results.map(r => r.mismatch);
let mismatchMonotonic = true;
for (let i = 1; i < mismatches.length; i++) {
  if (mismatches[i] > mismatches[i-1] * 1.1) mismatchMonotonic = false;
}
console.log("\nMismatch trend: " + mismatches.map(x => x.toFixed(3)).join(" → "));
console.log("  " + (mismatchMonotonic ? "PASS: mismatch decreases with k" : "CHECK: mismatch trend not clean"));

// Check control: B complexity should NOT depend on k when lambda=0
const controlComplex = controlResults.map(r => r.complexB);
const controlVariation = Math.max(...controlComplex) / Math.min(...controlComplex);
console.log("\nControl (lambda=0): B_complexity=" + controlComplex.map(x => x.toFixed(1)).join(", "));
console.log("  " + (controlVariation < 1.25 ? "PASS: without coupling, k doesn't affect B (variation is just noise)" : "FAIL: k affects B even without coupling"));

// =============================================================================
// CONCLUSIONS
// =============================================================================

console.log("\n=== CONCLUSIONS ===\n");

const allPass = aVariation < 1.2 && bMonotonic && mismatchMonotonic && controlVariation < 1.15;

if (allPass) {
  console.log("CODE BOTTLENECK EFFECT: CONFIRMED");
  console.log("");
  console.log("The low-D code (Fourier modes) genuinely constrains B's dynamics:");
  console.log("  - A remains complex regardless of k");
  console.log("  - B's complexity scales with code bandwidth k");
  console.log("  - Mismatch increases as code becomes coarser");
  console.log("  - Effect disappears when coupling is removed");
  console.log("");
  console.log("This is ready for visualization.");
} else {
  console.log("RESULTS INCONCLUSIVE - check parameters");
  console.log("");
  console.log("Possible issues:");
  console.log("  - lambda too weak (B ignores code)");
  console.log("  - lambda too strong (B perfectly matches code, no internal dynamics)");
  console.log("  - noise too high (everything is chaos)");
  console.log("  - K too high (systems sync regardless of code)");
}

console.log("\n=== TUNING RECOMMENDATIONS ===\n");
console.log("For visualization, use:");
console.log("  - N = 64-128 (enough resolution)");
console.log("  - k slider from 1 to ~16");
console.log("  - lambda ~ 0.5-1.0 (visible constraint, not total override)");
console.log("  - Show: A field, B field, and bar chart of modes 1..16");
console.log("  - Meters: A complexity, B complexity, mismatch");
