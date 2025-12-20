'use client';

/**
 * =============================================================================
 * CodeConstraint - Two-System Code Constraint Visualization
 * =============================================================================
 *
 * Based on the paper "The Code-Constraint Problem in Biological Systems"
 *
 * VISUAL DESIGN:
 * - TOP: System A as a complex wave (high-frequency + low-frequency components)
 * - MIDDLE: The CODE - truncated Fourier representation (only k modes)
 * - BOTTOM: System B tracking through code (wave smooths out at low k)
 * - SLIDER: Bandwidth k
 * - TOGGLE: Fourier (structured) vs Random (unstructured) projection
 *
 * THE KEY INSIGHT:
 * As bandwidth k decreases:
 * - System A keeps all its complexity (high N_eff)
 * - System B's N_eff collapses (only sees low-frequency modes)
 * - B tracks A but with "blurred vision"
 * - Random projections cause WHITENING (N_eff increases), not collapse
 *
 * =============================================================================
 */

import { useRef, useEffect, useCallback, useState } from 'react';

// =============================================================================
// CONSTANTS
// =============================================================================

const N = 64;              // Number of oscillators (larger for better waves)
const K_COUPLING = 0.15;   // Weaker coupling = more chaotic A
const NOISE_A = 0.12;      // Higher noise in A = more complex
const NOISE_B = 0.02;      // Lower noise in B
const TRACK_STRENGTH = 1.2; // How strongly B tracks code(A)

const SCALE = 2;

type ProjectionMode = 'fourier' | 'random';

interface CodeFormingProps {
  fullPage?: boolean;
}

// =============================================================================
// KURAMOTO LATTICE SYSTEM
// =============================================================================

interface KuramotoState {
  theta: Float64Array;
  omega: Float64Array;
}

function initKuramoto(seed: number): KuramotoState {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const theta = new Float64Array(N);
  const omega = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    theta[i] = rand() * 2 * Math.PI;
    // Varied frequencies for more interesting dynamics
    omega[i] = 0.3 + rand() * 0.8;
  }

  return { theta, omega };
}

function stepKuramoto(state: KuramotoState, dt: number, noiseLevel: number): void {
  const { theta, omega } = state;
  const dtheta = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    let coupling = 0;
    const left = (i - 1 + N) % N;
    const right = (i + 1) % N;
    coupling += Math.sin(theta[left] - theta[i]);
    coupling += Math.sin(theta[right] - theta[i]);

    const noise = (Math.random() - 0.5) * noiseLevel;
    dtheta[i] = omega[i] + K_COUPLING * coupling + noise;
  }

  for (let i = 0; i < N; i++) {
    theta[i] += dtheta[i] * dt;
  }
}

// =============================================================================
// FOURIER CODE (BANDWIDTH-LIMITED PROJECTION)
// =============================================================================

function computeFourierCode(theta: Float64Array, bandwidth: number): Float64Array {
  const k = Math.max(1, Math.min(Math.floor(N / 2), bandwidth));
  const code = new Float64Array(k * 2);

  for (let m = 0; m < k; m++) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i++) {
      const angle = (2 * Math.PI * m * i) / N;
      re += Math.cos(theta[i]) * Math.cos(angle) + Math.sin(theta[i]) * Math.sin(angle);
      im += Math.sin(theta[i]) * Math.cos(angle) - Math.cos(theta[i]) * Math.sin(angle);
    }
    code[m * 2] = re / N;
    code[m * 2 + 1] = im / N;
  }

  return code;
}

function reconstructFromCode(code: Float64Array): Float64Array {
  const k = code.length / 2;
  const reconstructed = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    let val = 0;
    for (let m = 0; m < k; m++) {
      const angle = (2 * Math.PI * m * i) / N;
      val += code[m * 2] * Math.cos(angle) - code[m * 2 + 1] * Math.sin(angle);
    }
    reconstructed[i] = val;
  }

  return reconstructed;
}

// =============================================================================
// RANDOM PROJECTION (UNSTRUCTURED)
// =============================================================================

// Seeded PRNG for reproducible random projections
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Generate a fixed random projection matrix (cached)
let randomProjectionMatrix: Float64Array[] | null = null;
let randomProjectionK = 0;

function getRandomProjectionMatrix(k: number): Float64Array[] {
  if (randomProjectionMatrix && randomProjectionK === k) {
    return randomProjectionMatrix;
  }

  const rand = createSeededRandom(12345); // Fixed seed for reproducibility
  const matrix: Float64Array[] = [];

  for (let m = 0; m < k; m++) {
    const row = new Float64Array(N);
    // Random unit vector
    let norm = 0;
    for (let i = 0; i < N; i++) {
      row[i] = rand() * 2 - 1;
      norm += row[i] * row[i];
    }
    norm = Math.sqrt(norm);
    for (let i = 0; i < N; i++) {
      row[i] /= norm;
    }
    matrix.push(row);
  }

  randomProjectionMatrix = matrix;
  randomProjectionK = k;
  return matrix;
}

function computeRandomCode(theta: Float64Array, bandwidth: number): Float64Array {
  const k = Math.max(1, Math.min(Math.floor(N / 2), bandwidth));
  const code = new Float64Array(k);
  const matrix = getRandomProjectionMatrix(k);

  for (let m = 0; m < k; m++) {
    let val = 0;
    for (let i = 0; i < N; i++) {
      val += Math.sin(theta[i]) * matrix[m][i];
    }
    code[m] = val;
  }

  return code;
}

function reconstructFromRandomCode(code: Float64Array): Float64Array {
  const k = code.length;
  const reconstructed = new Float64Array(N);
  const matrix = getRandomProjectionMatrix(k);

  // Pseudo-inverse reconstruction (transpose for orthogonal-ish matrix)
  for (let i = 0; i < N; i++) {
    let val = 0;
    for (let m = 0; m < k; m++) {
      val += code[m] * matrix[m][i];
    }
    reconstructed[i] = val;
  }

  return reconstructed;
}

function stepSystemB(
  stateB: KuramotoState,
  codeTarget: Float64Array,
  dt: number,
  noiseLevel: number
): void {
  const { theta, omega } = stateB;
  const dtheta = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    let coupling = 0;
    const left = (i - 1 + N) % N;
    const right = (i + 1) % N;
    coupling += Math.sin(theta[left] - theta[i]);
    coupling += Math.sin(theta[right] - theta[i]);

    // Track the code target (force toward reconstructed target)
    const targetPhase = Math.atan2(Math.sin(codeTarget[i] * 2), Math.cos(codeTarget[i] * 2));
    const trackForce = TRACK_STRENGTH * Math.sin(targetPhase - theta[i]);

    const noise = (Math.random() - 0.5) * noiseLevel;
    dtheta[i] = omega[i] + K_COUPLING * coupling + trackForce + noise;
  }

  for (let i = 0; i < N; i++) {
    theta[i] += dtheta[i] * dt;
  }
}

// =============================================================================
// METRICS
// =============================================================================

function computeNeff(values: Float64Array): number {
  const k = Math.floor(N / 2);
  const power = new Float64Array(k);
  let totalPower = 0;

  for (let m = 0; m < k; m++) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i++) {
      const angle = (2 * Math.PI * m * i) / N;
      re += values[i] * Math.cos(angle);
      im += values[i] * Math.sin(angle);
    }
    power[m] = (re * re + im * im) / (N * N);
    totalPower += power[m];
  }

  if (totalPower < 0.0001) return 1;

  let sumSq = 0;
  for (let m = 0; m < k; m++) {
    const p = power[m] / totalPower;
    sumSq += p * p;
  }

  return Math.min(k, 1 / sumSq);
}

function computeComplexity(theta: Float64Array): number {
  // Compute variance of phase differences (higher = more complex)
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < N; i++) {
    const next = (i + 1) % N;
    let diff = theta[next] - theta[i];
    // Wrap to [-π, π]
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    sum += diff;
    sumSq += diff * diff;
  }
  const mean = sum / N;
  const variance = sumSq / N - mean * mean;
  return Math.sqrt(variance);
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CodeForming({ fullPage = false }: CodeFormingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const maxBandwidth = Math.floor(N / 2);
  const defaultBandwidth = Math.floor(N / 4); // Start with visible constraint
  const [bandwidth, setBandwidth] = useState(defaultBandwidth);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('fourier');
  const systemA = useRef<KuramotoState>(initKuramoto(42));
  const systemB = useRef<KuramotoState>(initKuramoto(137));

  const metricsRef = useRef({
    complexityA: 0,
    complexityB: 0,
    neffA: 0,
    neffB: 0,
  });

  const BASE_W = fullPage ? 1100 : 700;
  const BASE_H = fullPage ? 700 : 480;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;

  const dragState = useRef({
    isDragging: false,
    activeControl: null as string | null,
  });

  // ---------------------------------------------------------------------------
  // DRAW WAVE
  // ---------------------------------------------------------------------------

  const drawWave = useCallback((
    ctx: CanvasRenderingContext2D,
    values: Float64Array | number[],
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    label: string,
    metric: number,
    metricLabel: string
  ) => {
    const arr = values instanceof Float64Array ? Array.from(values) : values;

    // Find range for normalization
    let min = Infinity, max = -Infinity;
    for (const v of arr) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = Math.max(0.1, max - min);

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8 * SCALE);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.fillStyle = color;
    ctx.font = `bold ${11 * SCALE}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 10 * SCALE, y + 18 * SCALE);

    // Metric
    ctx.fillStyle = '#666';
    ctx.font = `${9 * SCALE}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`${metricLabel}: ${metric.toFixed(1)}`, x + width - 10 * SCALE, y + 18 * SCALE);

    // Center line
    const centerY = y + height / 2;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 10 * SCALE, centerY);
    ctx.lineTo(x + width - 10 * SCALE, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wave
    const padding = 15 * SCALE;
    const waveWidth = width - padding * 2;
    const waveHeight = height - 50 * SCALE;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * SCALE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    for (let i = 0; i < arr.length; i++) {
      const px = x + padding + (i / (arr.length - 1)) * waveWidth;
      const normalized = (arr[i] - min) / range - 0.5;
      const py = centerY - normalized * waveHeight * 0.8;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Draw dots at each oscillator position
    ctx.fillStyle = color;
    for (let i = 0; i < arr.length; i += 2) {
      const px = x + padding + (i / (arr.length - 1)) * waveWidth;
      const normalized = (arr[i] - min) / range - 0.5;
      const py = centerY - normalized * waveHeight * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 3 * SCALE, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // DRAW SPECTRUM BAR
  // ---------------------------------------------------------------------------

  const drawSpectrumBar = useCallback((
    ctx: CanvasRenderingContext2D,
    code: Float64Array,
    bandwidth: number,
    x: number,
    y: number,
    width: number,
    height: number,
    mode: ProjectionMode
  ) => {
    const k = mode === 'fourier' ? code.length / 2 : code.length;
    const barWidth = (width - 20 * SCALE) / maxBandwidth;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6 * SCALE);
    ctx.fill();

    // Label
    ctx.fillStyle = mode === 'fourier' ? '#888' : '#f97316';
    ctx.font = `bold ${9 * SCALE}px system-ui`;
    ctx.textAlign = 'center';
    const codeLabel = mode === 'fourier'
      ? `CODE: ${bandwidth} Fourier modes`
      : `CODE: ${bandwidth} random projections`;
    ctx.fillText(codeLabel, x + width / 2, y + 14 * SCALE);

    // Draw frequency bars
    const barAreaY = y + 22 * SCALE;
    const barAreaH = height - 28 * SCALE;

    // Find max magnitude for normalization
    let maxMag = 0;
    for (let m = 0; m < k; m++) {
      const mag = Math.sqrt(code[m * 2] * code[m * 2] + code[m * 2 + 1] * code[m * 2 + 1]);
      if (mag > maxMag) maxMag = mag;
    }
    maxMag = Math.max(0.1, maxMag);

    for (let m = 0; m < maxBandwidth; m++) {
      const bx = x + 10 * SCALE + m * barWidth;

      if (m < k) {
        // Active mode
        const mag = Math.sqrt(code[m * 2] * code[m * 2] + code[m * 2 + 1] * code[m * 2 + 1]);
        const barH = (mag / maxMag) * barAreaH * 0.8;

        // Gradient based on frequency
        const hue = 200 - (m / maxBandwidth) * 150; // Blue to yellow
        ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
        ctx.fillRect(bx, barAreaY + barAreaH - barH, barWidth - 2, barH);
      } else {
        // Filtered out mode (grayed out)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(bx, barAreaY + barAreaH * 0.2, barWidth - 2, barAreaH * 0.6);

        // X mark
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 2, barAreaY + barAreaH * 0.3);
        ctx.lineTo(bx + barWidth - 4, barAreaY + barAreaH * 0.7);
        ctx.moveTo(bx + barWidth - 4, barAreaY + barAreaH * 0.3);
        ctx.lineTo(bx + 2, barAreaY + barAreaH * 0.7);
        ctx.stroke();
      }
    }

    // Frequency labels
    ctx.fillStyle = '#444';
    ctx.font = `${7 * SCALE}px system-ui`;
    ctx.textAlign = 'left';
    if (mode === 'fourier') {
      ctx.fillText('low freq', x + 10 * SCALE, y + height - 3 * SCALE);
      ctx.textAlign = 'right';
      ctx.fillText('high freq', x + width - 10 * SCALE, y + height - 3 * SCALE);
    } else {
      ctx.fillText('dim 1', x + 10 * SCALE, y + height - 3 * SCALE);
      ctx.textAlign = 'right';
      ctx.fillText(`dim ${bandwidth}`, x + width - 10 * SCALE, y + height - 3 * SCALE);
    }
  }, [maxBandwidth]);

  // ---------------------------------------------------------------------------
  // ANIMATION LOOP
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dt = 0.04;

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      // -----------------------------------------------------------------------
      // PHYSICS UPDATE
      // -----------------------------------------------------------------------

      stepKuramoto(systemA.current, dt, NOISE_A);

      // Compute code based on projection mode
      let code: Float64Array;
      let codeTarget: Float64Array;

      if (projectionMode === 'fourier') {
        code = computeFourierCode(systemA.current.theta, bandwidth);
        codeTarget = reconstructFromCode(code);
      } else {
        code = computeRandomCode(systemA.current.theta, bandwidth);
        codeTarget = reconstructFromRandomCode(code);
      }

      stepSystemB(systemB.current, codeTarget, dt, NOISE_B);

      // Convert phases to wave values (sin of phase)
      const waveA = new Float64Array(N);
      const waveB = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        waveA[i] = Math.sin(systemA.current.theta[i]);
        waveB[i] = Math.sin(systemB.current.theta[i]);
      }

      // Compute metrics
      const complexityA = computeComplexity(systemA.current.theta);
      const complexityB = computeComplexity(systemB.current.theta);
      metricsRef.current.complexityA = complexityA;
      metricsRef.current.complexityB = complexityB;
      metricsRef.current.neffA = computeNeff(waveA);
      metricsRef.current.neffB = computeNeff(waveB);

      // -----------------------------------------------------------------------
      // RENDERING
      // -----------------------------------------------------------------------

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      // Header
      ctx.fillStyle = '#3b82f6';
      ctx.font = `bold ${16 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('CODE CONSTRAINT', 20 * SCALE, 28 * SCALE);

      // Projection mode indicator
      ctx.fillStyle = projectionMode === 'fourier' ? '#22c55e' : '#f97316';
      ctx.font = `${10 * SCALE}px system-ui`;
      const modeText = projectionMode === 'fourier' ? 'Fourier (structured)' : 'Random (unstructured)';
      ctx.fillText(modeText, 165 * SCALE, 28 * SCALE);

      ctx.fillStyle = '#666';
      ctx.font = `${11 * SCALE}px system-ui`;
      ctx.textAlign = 'right';
      const statusText = bandwidth === maxBandwidth ? 'Full bandwidth' :
                         bandwidth <= 3 ? 'Severe compression' : 'Partial bandwidth';
      ctx.fillText(statusText, W - 20 * SCALE, 28 * SCALE);

      // Divider
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 40 * SCALE);
      ctx.lineTo(W, 40 * SCALE);
      ctx.stroke();

      // -----------------------------------------------------------------------
      // LAYOUT
      // -----------------------------------------------------------------------

      const padding = 20 * SCALE;
      const contentTop = 50 * SCALE;
      const waveHeight = fullPage ? 110 * SCALE : 90 * SCALE;
      const spectrumHeight = fullPage ? 70 * SCALE : 55 * SCALE;
      const gap = 12 * SCALE;
      const waveWidth = W - padding * 2;

      // System A wave
      drawWave(ctx, waveA, padding, contentTop, waveWidth, waveHeight,
        '#3b82f6', 'SYSTEM A (Driving)', metricsRef.current.neffA, 'N_eff');

      // Code spectrum
      const specY = contentTop + waveHeight + gap;
      drawSpectrumBar(ctx, code, bandwidth, padding, specY, waveWidth, spectrumHeight, projectionMode);

      // Arrow indicating information flow
      const arrowX = padding + waveWidth / 2;
      const arrowY1 = contentTop + waveHeight + 3 * SCALE;
      const arrowY2 = specY - 3 * SCALE;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2 * SCALE;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY1);
      ctx.lineTo(arrowX, arrowY2);
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY2 + 2);
      ctx.lineTo(arrowX - 6 * SCALE, arrowY1 + 2);
      ctx.lineTo(arrowX + 6 * SCALE, arrowY1 + 2);
      ctx.closePath();
      ctx.fill();

      // System B wave (reconstructed from code)
      const bWaveY = specY + spectrumHeight + gap;
      drawWave(ctx, waveB, padding, bWaveY, waveWidth, waveHeight,
        '#22c55e', 'SYSTEM B (Responding)', metricsRef.current.neffB, 'N_eff');

      // Arrow from spectrum to B
      const arrowY3 = specY + spectrumHeight + 3 * SCALE;
      const arrowY4 = bWaveY - 3 * SCALE;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2 * SCALE;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY3);
      ctx.lineTo(arrowX, arrowY4);
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY4 + 2);
      ctx.lineTo(arrowX - 6 * SCALE, arrowY3 + 8 * SCALE);
      ctx.lineTo(arrowX + 6 * SCALE, arrowY3 + 8 * SCALE);
      ctx.closePath();
      ctx.fill();

      // -----------------------------------------------------------------------
      // INSIGHT TEXT
      // -----------------------------------------------------------------------

      const textY = bWaveY + waveHeight + 15 * SCALE;

      let insight: string;
      if (projectionMode === 'fourier') {
        insight = bandwidth >= maxBandwidth - 2
          ? 'Full bandwidth: B perfectly tracks A\'s complex dynamics'
          : bandwidth > maxBandwidth / 2
          ? 'High bandwidth: B captures most of A\'s structure'
          : bandwidth > 4
          ? 'Medium bandwidth: B loses fine details, keeps overall pattern'
          : bandwidth > 2
          ? 'Low bandwidth: B\'s N_eff collapses—only sees slow modes'
          : 'Minimal bandwidth: B collapses to single mode';
      } else {
        insight = bandwidth >= maxBandwidth - 2
          ? 'Random projection: B whitens—high N_eff, no structure'
          : bandwidth > maxBandwidth / 2
          ? 'Random projection: B stays complex but uncorrelated with A'
          : bandwidth > 4
          ? 'Random projection: N_eff stays high (unlike Fourier!)'
          : bandwidth > 2
          ? 'Random projection: whitening, not collapse'
          : 'Random projection: even 1D preserves variance, not structure';
      }

      ctx.fillStyle = projectionMode === 'fourier' ? '#888' : '#f97316';
      ctx.font = `${10 * SCALE}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(insight, W / 2, textY);

      // -----------------------------------------------------------------------
      // BANDWIDTH SLIDER
      // -----------------------------------------------------------------------

      const sliderY = textY + 20 * SCALE;
      const sliderW = W - padding * 2;
      const sliderH = 14 * SCALE;

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('BANDWIDTH k (code dimensionality)', padding, sliderY);

      const sliderTrackY = sliderY + 15 * SCALE;

      // Track
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(padding, sliderTrackY, sliderW, sliderH, 7 * SCALE);
      ctx.fill();

      // Fill gradient
      const gradient = ctx.createLinearGradient(padding, 0, padding + sliderW, 0);
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(0.3, '#eab308');
      gradient.addColorStop(1, '#22c55e');

      const fillW = ((bandwidth - 1) / (maxBandwidth - 1)) * sliderW;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(padding, sliderTrackY, fillW, sliderH, 7 * SCALE);
      ctx.fill();

      // Handle
      const handleX = padding + fillW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(handleX, sliderTrackY + sliderH / 2, 12 * SCALE, 0, Math.PI * 2);
      ctx.fill();

      const handleColor = bandwidth <= 3 ? '#ef4444' : bandwidth < maxBandwidth / 2 ? '#eab308' : '#22c55e';
      ctx.strokeStyle = handleColor;
      ctx.lineWidth = 3 * SCALE;
      ctx.stroke();

      // Value in handle
      ctx.fillStyle = '#000';
      ctx.font = `bold ${8 * SCALE}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bandwidth.toString(), handleX, sliderTrackY + sliderH / 2);
      ctx.textBaseline = 'alphabetic';

      // Labels
      ctx.fillStyle = '#ef4444';
      ctx.font = `${8 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('k=1 (collapsed)', padding, sliderTrackY + sliderH + 14 * SCALE);

      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'right';
      ctx.fillText(`k=${maxBandwidth} (full)`, padding + sliderW, sliderTrackY + sliderH + 14 * SCALE);

      // -----------------------------------------------------------------------
      // COMPARISON BAR (fullPage only)
      // -----------------------------------------------------------------------

      if (fullPage) {
        const barY = sliderTrackY + sliderH + 35 * SCALE;
        const barW = W * 0.5;
        const barH = 18 * SCALE;
        const barX = (W - barW) / 2;

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.roundRect(barX - 15 * SCALE, barY - 25 * SCALE, barW + 30 * SCALE, 80 * SCALE, 8 * SCALE);
        ctx.fill();

        ctx.fillStyle = '#666';
        ctx.font = `${9 * SCALE}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText('N_eff COMPARISON (effective dimensionality)', W / 2, barY - 10 * SCALE);

        // A bar - N_eff ranges from 1 to ~maxBandwidth
        const neffA = metricsRef.current.neffA;
        const neffB = metricsRef.current.neffB;

        ctx.fillStyle = '#1a3a5c';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 4 * SCALE);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        const aW = Math.min(1, neffA / maxBandwidth) * barW;
        ctx.beginPath();
        ctx.roundRect(barX, barY, aW, barH, 4 * SCALE);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = `${9 * SCALE}px system-ui`;
        ctx.textAlign = 'right';
        ctx.fillText(`A: ${neffA.toFixed(1)}`, barX - 8 * SCALE, barY + 12 * SCALE);

        // B bar
        const barY2 = barY + barH + 6 * SCALE;
        ctx.fillStyle = '#1a3a2c';
        ctx.beginPath();
        ctx.roundRect(barX, barY2, barW, barH, 4 * SCALE);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        const bW = Math.min(1, neffB / maxBandwidth) * barW;
        ctx.beginPath();
        ctx.roundRect(barX, barY2, bW, barH, 4 * SCALE);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`B: ${neffB.toFixed(1)}`, barX - 8 * SCALE, barY2 + 12 * SCALE);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [bandwidth, W, H, fullPage, drawWave, drawSpectrumBar, maxBandwidth, projectionMode]);

  // ---------------------------------------------------------------------------
  // INPUT HANDLING
  // ---------------------------------------------------------------------------

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const updateBandwidth = useCallback((x: number) => {
    const padding = 20 * SCALE;
    const sliderW = W - padding * 2;
    const norm = Math.max(0, Math.min(1, (x - padding) / sliderW));
    const newBandwidth = Math.round(1 + norm * (maxBandwidth - 1));
    setBandwidth(newBandwidth);
  }, [W, maxBandwidth]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const padding = 20 * SCALE;

    // Calculate slider position dynamically based on layout
    const contentTop = 50 * SCALE;
    const waveHeight = fullPage ? 110 * SCALE : 90 * SCALE;
    const spectrumHeight = fullPage ? 70 * SCALE : 55 * SCALE;
    const gap = 12 * SCALE;
    const textY = contentTop + waveHeight * 2 + spectrumHeight + gap * 2 + 15 * SCALE;
    const sliderY = textY + 20 * SCALE + 15 * SCALE;
    const sliderH = 14 * SCALE;
    const sliderW = W - padding * 2;

    if (y >= sliderY - 20 * SCALE && y <= sliderY + sliderH + 20 * SCALE &&
        x >= padding - 15 * SCALE && x <= padding + sliderW + 15 * SCALE) {
      dragState.current.isDragging = true;
      dragState.current.activeControl = 'bandwidth';
      updateBandwidth(x);
    }
  }, [getCanvasCoords, W, fullPage, updateBandwidth]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.current.isDragging) return;
    e.preventDefault();
    const { x } = getCanvasCoords(e);
    if (dragState.current.activeControl === 'bandwidth') {
      updateBandwidth(x);
    }
  }, [getCanvasCoords, updateBandwidth]);

  const handleEnd = useCallback(() => {
    dragState.current.isDragging = false;
    dragState.current.activeControl = null;
  }, []);

  const toggleProjectionMode = useCallback(() => {
    setProjectionMode(m => m === 'fourier' ? 'random' : 'fourier');
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: '100%',
          maxWidth: BASE_W,
          aspectRatio: `${W} / ${H}`,
          touchAction: 'none',
        }}
        className="rounded-xl cursor-pointer bg-black shadow-2xl"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      <div className="flex justify-center gap-2">
        <button
          onClick={toggleProjectionMode}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            projectionMode === 'fourier'
              ? 'bg-green-900 text-green-300 hover:bg-green-800'
              : 'bg-orange-900 text-orange-300 hover:bg-orange-800'
          }`}
        >
          {projectionMode === 'fourier' ? '→ Switch to Random Projection' : '→ Switch to Fourier (Structured)'}
        </button>
      </div>
    </div>
  );
}
