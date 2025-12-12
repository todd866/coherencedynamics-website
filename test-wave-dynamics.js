// =============================================================================
// WAVE DYNAMICS TEST
// Run with: node test-wave-dynamics.js
//
// Testing candidate systems for "high-D coherent dynamics":
// 1. Damped driven wave equation
// 2. Gray-Scott reaction-diffusion
// 3. Kuramoto oscillator field
//
// Goal: find something with rich multi-scale structure that evolves interestingly
// =============================================================================

console.log("=== WAVE DYNAMICS TEST ===\n");

const N = 64; // grid size

// =============================================================================
// 1. DAMPED DRIVEN WAVE EQUATION
// =============================================================================
// u_tt = c^2 * laplacian(u) - gamma * u_t + F(x,t)
// Classic wave with damping and driving force

console.log("=== 1. DAMPED DRIVEN WAVE ===\n");

function testWaveEquation() {
  const u = new Float32Array(N * N);     // displacement
  const v = new Float32Array(N * N);     // velocity
  const c = 0.5;      // wave speed
  const gamma = 0.02; // damping
  const dt = 0.5;

  // Initialize with some structure
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const idx = i * N + j;
      u[idx] = Math.sin(2 * Math.PI * i / N) * Math.sin(2 * Math.PI * j / N);
    }
  }

  function laplacian(arr, i, j) {
    const idx = i * N + j;
    const up = ((i - 1 + N) % N) * N + j;
    const down = ((i + 1) % N) * N + j;
    const left = i * N + ((j - 1 + N) % N);
    const right = i * N + ((j + 1) % N);
    return arr[up] + arr[down] + arr[left] + arr[right] - 4 * arr[idx];
  }

  function step(driving) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        const lap = laplacian(u, i, j);
        const force = driving ? 0.1 * Math.sin(0.3 * i + step.t * 0.1) * Math.sin(0.2 * j) : 0;
        v[idx] += dt * (c * c * lap - gamma * v[idx] + force);
      }
    }
    for (let i = 0; i < N * N; i++) {
      u[i] += dt * v[i];
    }
    step.t = (step.t || 0) + 1;
  }

  // Run and measure complexity
  function measureComplexity() {
    let energy = 0;
    let maxVal = 0;
    let minVal = 0;
    for (let i = 0; i < N * N; i++) {
      energy += u[i] * u[i] + v[i] * v[i];
      maxVal = Math.max(maxVal, u[i]);
      minVal = Math.min(minVal, u[i]);
    }
    return { energy: energy / (N * N), range: maxVal - minVal };
  }

  // Test without driving
  console.log("Without driving (should decay):");
  for (let t = 0; t < 500; t++) step(false);
  let m = measureComplexity();
  console.log("  t=500: energy=" + m.energy.toFixed(6) + " range=" + m.range.toFixed(4));

  for (let t = 0; t < 500; t++) step(false);
  m = measureComplexity();
  console.log("  t=1000: energy=" + m.energy.toFixed(6) + " range=" + m.range.toFixed(4));

  // Reset and test with driving
  for (let i = 0; i < N * N; i++) { u[i] = 0; v[i] = 0; }
  step.t = 0;

  console.log("\nWith driving (should sustain):");
  for (let t = 0; t < 500; t++) step(true);
  m = measureComplexity();
  console.log("  t=500: energy=" + m.energy.toFixed(6) + " range=" + m.range.toFixed(4));

  for (let t = 0; t < 500; t++) step(true);
  m = measureComplexity();
  console.log("  t=1000: energy=" + m.energy.toFixed(6) + " range=" + m.range.toFixed(4));
}

testWaveEquation();

// =============================================================================
// 2. GRAY-SCOTT REACTION-DIFFUSION
// =============================================================================
// du/dt = Du * laplacian(u) - u*v^2 + F*(1-u)
// dv/dt = Dv * laplacian(v) + u*v^2 - (F+k)*v
// Classic pattern-forming system

console.log("\n=== 2. GRAY-SCOTT REACTION-DIFFUSION ===\n");

function testGrayScott() {
  const u = new Float32Array(N * N);
  const v = new Float32Array(N * N);

  // Parameters (coral-like patterns)
  const Du = 0.16;
  const Dv = 0.08;
  const F = 0.035;
  const k = 0.065;
  const dt = 1.0;

  // Initialize: u=1 everywhere, v=0 with a seed
  for (let i = 0; i < N * N; i++) {
    u[i] = 1;
    v[i] = 0;
  }
  // Seed in center
  for (let i = N/2 - 5; i < N/2 + 5; i++) {
    for (let j = N/2 - 5; j < N/2 + 5; j++) {
      const idx = i * N + j;
      u[idx] = 0.5;
      v[idx] = 0.25 + 0.1 * Math.random();
    }
  }

  function laplacian(arr, i, j) {
    const idx = i * N + j;
    const up = ((i - 1 + N) % N) * N + j;
    const down = ((i + 1) % N) * N + j;
    const left = i * N + ((j - 1 + N) % N);
    const right = i * N + ((j + 1) % N);
    return arr[up] + arr[down] + arr[left] + arr[right] - 4 * arr[idx];
  }

  function step() {
    const newU = new Float32Array(N * N);
    const newV = new Float32Array(N * N);

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        const lapU = laplacian(u, i, j);
        const lapV = laplacian(v, i, j);
        const uvv = u[idx] * v[idx] * v[idx];

        newU[idx] = u[idx] + dt * (Du * lapU - uvv + F * (1 - u[idx]));
        newV[idx] = v[idx] + dt * (Dv * lapV + uvv - (F + k) * v[idx]);
      }
    }

    for (let i = 0; i < N * N; i++) {
      u[i] = newU[i];
      v[i] = newV[i];
    }
  }

  function measurePattern() {
    let vSum = 0, vMax = 0, vMin = 1;
    let nonZero = 0;
    for (let i = 0; i < N * N; i++) {
      vSum += v[i];
      vMax = Math.max(vMax, v[i]);
      vMin = Math.min(vMin, v[i]);
      if (v[i] > 0.1) nonZero++;
    }
    return {
      vMean: vSum / (N * N),
      vRange: vMax - vMin,
      coverage: nonZero / (N * N)
    };
  }

  console.log("Gray-Scott evolution:");
  for (let epoch = 0; epoch < 5; epoch++) {
    for (let t = 0; t < 500; t++) step();
    const m = measurePattern();
    console.log("  t=" + ((epoch + 1) * 500) + ": vMean=" + m.vMean.toFixed(4) +
      " vRange=" + m.vRange.toFixed(4) + " coverage=" + (m.coverage * 100).toFixed(1) + "%");
  }
}

testGrayScott();

// =============================================================================
// 3. KURAMOTO OSCILLATOR FIELD (2D)
// =============================================================================
// d(theta)/dt = omega + K * sum(sin(theta_neighbor - theta))
// Phase oscillators with local coupling

console.log("\n=== 3. KURAMOTO FIELD ===\n");

function testKuramoto() {
  const theta = new Float32Array(N * N);
  const omega = new Float32Array(N * N);

  const K = 0.5;  // coupling
  const dt = 0.1;

  // Initialize with random phases and slightly spread frequencies
  for (let i = 0; i < N * N; i++) {
    theta[i] = Math.random() * 2 * Math.PI - Math.PI;
    omega[i] = 0.5 + (Math.random() - 0.5) * 0.2;
  }

  function step() {
    const dtheta = new Float32Array(N * N);

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        const up = ((i - 1 + N) % N) * N + j;
        const down = ((i + 1) % N) * N + j;
        const left = i * N + ((j - 1 + N) % N);
        const right = i * N + ((j + 1) % N);

        let coupling = 0;
        coupling += Math.sin(theta[up] - theta[idx]);
        coupling += Math.sin(theta[down] - theta[idx]);
        coupling += Math.sin(theta[left] - theta[idx]);
        coupling += Math.sin(theta[right] - theta[idx]);

        dtheta[idx] = omega[idx] + K * coupling;
      }
    }

    for (let i = 0; i < N * N; i++) {
      theta[i] += dt * dtheta[i];
      // Wrap to [-pi, pi]
      theta[i] = ((theta[i] + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    }
  }

  function measureSync() {
    // Order parameter: r = |mean(e^(i*theta))|
    let sumCos = 0, sumSin = 0;
    for (let i = 0; i < N * N; i++) {
      sumCos += Math.cos(theta[i]);
      sumSin += Math.sin(theta[i]);
    }
    const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / (N * N);

    // Local variance (how much neighbors differ)
    let localVar = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        const right = i * N + ((j + 1) % N);
        const down = ((i + 1) % N) * N + j;
        localVar += Math.abs(Math.sin((theta[right] - theta[idx]) / 2));
        localVar += Math.abs(Math.sin((theta[down] - theta[idx]) / 2));
      }
    }
    localVar /= (2 * N * N);

    return { orderParam: r, localVar: localVar };
  }

  console.log("Kuramoto field evolution:");
  for (let epoch = 0; epoch < 5; epoch++) {
    for (let t = 0; t < 200; t++) step();
    const m = measureSync();
    console.log("  t=" + ((epoch + 1) * 200) + ": order=" + m.orderParam.toFixed(4) +
      " localVar=" + m.localVar.toFixed(4));
  }

  // Test: add defects/waves
  console.log("\nAfter injecting spiral defect:");
  // Create spiral
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const idx = i * N + j;
      const dx = i - N/2;
      const dy = j - N/2;
      theta[idx] = Math.atan2(dy, dx);
    }
  }

  for (let epoch = 0; epoch < 3; epoch++) {
    for (let t = 0; t < 200; t++) step();
    const m = measureSync();
    console.log("  t=" + ((epoch + 1) * 200) + ": order=" + m.orderParam.toFixed(4) +
      " localVar=" + m.localVar.toFixed(4));
  }
}

testKuramoto();

// =============================================================================
// 4. SIMPLE TURBULENT-ISH: Coupled map lattice
// =============================================================================
// x_i(t+1) = (1-eps)*f(x_i) + (eps/4)*sum(f(x_neighbors))
// where f is the logistic map: f(x) = r*x*(1-x)

console.log("\n=== 4. COUPLED MAP LATTICE ===\n");

function testCoupledMap() {
  const x = new Float32Array(N * N);
  const r = 3.8;    // chaos parameter
  const eps = 0.3;  // coupling

  // Initialize random
  for (let i = 0; i < N * N; i++) {
    x[i] = Math.random();
  }

  function logistic(val) {
    return r * val * (1 - val);
  }

  function step() {
    const newX = new Float32Array(N * N);

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        const up = ((i - 1 + N) % N) * N + j;
        const down = ((i + 1) % N) * N + j;
        const left = i * N + ((j - 1 + N) % N);
        const right = i * N + ((j + 1) % N);

        const local = logistic(x[idx]);
        const neighborSum = logistic(x[up]) + logistic(x[down]) +
                           logistic(x[left]) + logistic(x[right]);

        newX[idx] = (1 - eps) * local + (eps / 4) * neighborSum;
      }
    }

    for (let i = 0; i < N * N; i++) {
      x[i] = newX[i];
    }
  }

  function measureStats() {
    let sum = 0, sumSq = 0;
    let min = 1, max = 0;
    for (let i = 0; i < N * N; i++) {
      sum += x[i];
      sumSq += x[i] * x[i];
      min = Math.min(min, x[i]);
      max = Math.max(max, x[i]);
    }
    const mean = sum / (N * N);
    const variance = sumSq / (N * N) - mean * mean;
    return { mean, variance, range: max - min };
  }

  console.log("Coupled map lattice evolution:");
  for (let epoch = 0; epoch < 5; epoch++) {
    for (let t = 0; t < 100; t++) step();
    const m = measureStats();
    console.log("  t=" + ((epoch + 1) * 100) + ": mean=" + m.mean.toFixed(4) +
      " var=" + m.variance.toFixed(4) + " range=" + m.range.toFixed(4));
  }
}

testCoupledMap();

// =============================================================================
// CONCLUSION
// =============================================================================

console.log("\n=== CONCLUSIONS ===\n");
console.log("For coherent high-D dynamics that looks interesting:");
console.log("");
console.log("1. WAVE EQUATION: Decays without driving. With driving, sustains");
console.log("   but patterns are simple (standing waves). Not very 'alive'.");
console.log("");
console.log("2. GRAY-SCOTT: Creates beautiful patterns but SLOW to develop");
console.log("   (needs ~2000+ steps). Patterns are static once formed.");
console.log("   Good for still images, bad for real-time dynamics.");
console.log("");
console.log("3. KURAMOTO: Forms spiral waves, domain walls. Continuously");
console.log("   evolving. Good balance of structure and dynamics.");
console.log("   Probably best for real-time visualization.");
console.log("");
console.log("4. COUPLED MAP: Chaotic, spatially structured. Very fast.");
console.log("   But maybe TOO noisy/chaotic to look coherent.");
console.log("");
console.log("RECOMMENDATION: Kuramoto field with occasional perturbations.");
console.log("It naturally forms traveling waves and spiral defects that");
console.log("evolve continuously. Easy to compute, visually coherent.");
