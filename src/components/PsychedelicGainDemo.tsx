'use client';

/**
 * PsychedelicGainDemo - "The Desynchronization Engine"
 *
 * PHYSICS:
 * - A grid of Kuramoto oscillators with local coupling.
 * - "5-HT2A Gain" increases intrinsic frequency variance and reduces coupling strength.
 * - LATENT SIGNAL UNMASKING: A hidden pattern is suppressed by alpha synchrony.
 *   When coupling breaks, the latent signal is revealed.
 *
 * VISUAL:
 * - Heatmap of phase (0 to 2PI).
 * - Low Gain = Large coherent waves (Alpha).
 * - High Gain = Salt-and-pepper noise (High Entropy/Dimensionality).
 * - With latent signal: Hidden mandala emerges as gain increases.
 *
 * Based on: "Psychedelics as Dimensionality Modulators" (Todd, 2025)
 */

import { useRef, useEffect, useState } from 'react';

// === CONSTANTS ===
const GRID_SIZE = 60;  // Increased for finer pattern detail
const N_OSCILLATORS = GRID_SIZE * GRID_SIZE;
const BASE_COUPLING = 3.0;  // Stronger baseline coupling
const DT = 0.04;
const HISTORY_LENGTH = 80;

export default function PsychedelicGainDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation State
  const phasesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const frequenciesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const latentPatternRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));

  // Metrics History
  const historyRef = useRef<{coherence: number[], dim: number[]}>({
    coherence: new Array(HISTORY_LENGTH).fill(0.5),
    dim: new Array(HISTORY_LENGTH).fill(3)
  });

  // Interaction State
  const [gain, setGain] = useState(0.15); // Start slightly above zero for visible waves
  const [latentSignal, setLatentSignal] = useState(false); // Latent signal toggle
  const isDraggingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // === INITIALIZATION ===
  useEffect(() => {
    // Random initial phases and intrinsic frequencies (alpha-band centered)
    for (let i = 0; i < N_OSCILLATORS; i++) {
      phasesRef.current[i] = Math.random() * Math.PI * 2;
      // Natural frequency around 10Hz (alpha) with small variance
      frequenciesRef.current[i] = 1.0 + (Math.random() - 0.5) * 0.3;
    }

    // Generate latent pattern (mandala: concentric rings + angular symmetry)
    const cx = GRID_SIZE / 2;
    const cy = GRID_SIZE / 2;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j;
        const x = j - cx;
        const y = i - cy;
        const r = Math.sqrt(x * x + y * y) / (GRID_SIZE / 2);
        // Mandala: radial rings + 6-fold angular symmetry
        const val = Math.sin(r * 15) * 0.5 + Math.cos(Math.atan2(y, x) * 6) * 0.5;
        latentPatternRef.current[idx] = val;
      }
    }

    setIsInitialized(true);
  }, []);

  // === PHYSICS LOOP ===
  useEffect(() => {
    if (!isInitialized) return;

    let frameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const loop = () => {
      // 1. UPDATE PHYSICS
      // Effective Coupling decreases as Gain increases (Desynchronization)
      const K = BASE_COUPLING * (1 - gain * 0.9);
      // Intrinsic variance/noise increases with Gain (Excitability)
      const noiseStr = gain * 0.6;
      // Latent signal strength (only active when toggled)
      const signalStrength = latentSignal ? 2.0 : 0;

      const newPhases = new Float32Array(N_OSCILLATORS);
      let orderParamX = 0;
      let orderParamY = 0;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const idx = i * GRID_SIZE + j;

          // Calculate local coupling (Nearest neighbors with wrap)
          let couplingSum = 0;
          const neighbors = [
            ((i - 1 + GRID_SIZE) % GRID_SIZE) * GRID_SIZE + j, // Up
            ((i + 1) % GRID_SIZE) * GRID_SIZE + j,             // Down
            i * GRID_SIZE + ((j - 1 + GRID_SIZE) % GRID_SIZE), // Left
            i * GRID_SIZE + ((j + 1) % GRID_SIZE)              // Right
          ];

          for (const nIdx of neighbors) {
            couplingSum += Math.sin(phasesRef.current[nIdx] - phasesRef.current[idx]);
          }

          // LATENT SIGNAL: Pattern is amplified by gain
          // At low gain, coupling dominates and signal is suppressed
          // At high gain, coupling breaks and the latent pattern emerges
          const latentDrive = latentPatternRef.current[idx] * signalStrength * gain;

          // Kuramoto Update with noise and latent drive
          const noise = (Math.random() - 0.5) * noiseStr;
          const dTheta = (frequenciesRef.current[idx] + noise + latentDrive + (K / 4) * couplingSum) * DT;
          newPhases[idx] = (phasesRef.current[idx] + dTheta + Math.PI * 2) % (Math.PI * 2);

          // Accumulate global order parameter (Kuramoto R)
          orderParamX += Math.cos(newPhases[idx]);
          orderParamY += Math.sin(newPhases[idx]);
        }
      }
      phasesRef.current = newPhases;

      // 2. COMPUTE METRICS
      // Coherence (R): 0 to 1
      const R = Math.sqrt(orderParamX ** 2 + orderParamY ** 2) / N_OSCILLATORS;

      // Dimensionality Proxy: inverse of synchronization
      // In real MEG, D_eff correlates inversely with oscillatory coherence
      const Deff = (1 - R) * 8 + 2; // Map to roughly 2-10 scale

      // Update History (rolling window)
      historyRef.current.coherence.push(R);
      historyRef.current.dim.push(Deff);
      if (historyRef.current.coherence.length > HISTORY_LENGTH) {
        historyRef.current.coherence.shift();
        historyRef.current.dim.shift();
      }

      // 3. RENDER
      const width = canvas.width;
      const height = canvas.height;
      const cellW = width / GRID_SIZE;
      const cellH = (height - 140) / GRID_SIZE; // Leave space for graphs

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw oscillator grid
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const idx = i * GRID_SIZE + j;
          const p = phasesRef.current[idx];

          // Sinebow color mapping (smooth phase wrap)
          const r = Math.sin(p) * 127 + 128;
          const g = Math.sin(p + 2.094) * 127 + 128; // 2π/3 offset
          const b = Math.sin(p + 4.189) * 127 + 128; // 4π/3 offset

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(j * cellW, i * cellH, cellW + 0.5, cellH + 0.5);
        }
      }

      // 4. DRAW METRICS PANEL
      const panelY = height - 130;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, panelY, width, 130);

      // Divider line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, panelY);
      ctx.lineTo(width, panelY);
      ctx.stroke();

      // Draw graphs
      const graphW = width / 2 - 40;
      const graphH = 50;
      const graphY = panelY + 55;

      const drawGraph = (
        vals: number[],
        color: string,
        xOffset: number,
        label: string,
        minVal: number,
        maxVal: number,
        unit: string
      ) => {
        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(label, xOffset, panelY + 20);

        // Current value
        const currentVal = vals[vals.length - 1];
        ctx.fillStyle = color;
        ctx.font = 'bold 18px ui-monospace, monospace';
        ctx.fillText(currentVal.toFixed(2) + unit, xOffset, panelY + 42);

        // Graph background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(xOffset, graphY, graphW, graphH);

        // Graph line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        vals.forEach((v, i) => {
          const x = xOffset + (i / (HISTORY_LENGTH - 1)) * graphW;
          const normalized = (v - minVal) / (maxVal - minVal);
          const y = graphY + graphH - normalized * graphH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Current value dot
        const lastX = xOffset + graphW;
        const lastNorm = (currentVal - minVal) / (maxVal - minVal);
        const lastY = graphY + graphH - lastNorm * graphH;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
      };

      drawGraph(historyRef.current.coherence, '#ef4444', 20, 'OSCILLATORY COHERENCE', 0, 1, '');
      drawGraph(historyRef.current.dim, '#22c55e', width / 2 + 20, 'EFFECTIVE DIMENSIONALITY', 0, 10, '');

      // 5. GAIN INDICATOR
      const gainBarY = height - 12;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, gainBarY, width, 12);

      // Gradient bar
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#3b82f6');    // Blue (baseline)
      gradient.addColorStop(0.5, '#8b5cf6');  // Purple
      gradient.addColorStop(1, '#ec4899');    // Pink (psychedelic)
      ctx.fillStyle = gradient;
      ctx.fillRect(0, gainBarY, width * gain, 12);

      // Gain label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.fillText(`5-HT2A GAIN: ${(gain * 100).toFixed(0)}%`, 8, gainBarY + 9);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gain, latentSignal, isInitialized]);

  // === HANDLERS ===
  const handleInput = (clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setGain(x);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-sm select-none">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-3 px-1">
        <div>
          <h3 className="text-slate-500 text-xs tracking-widest uppercase">Kuramoto Oscillator Field</h3>
          <h2 className="text-slate-100 font-bold text-lg">Cortical Desynchronization</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Latent Signal Toggle */}
          <button
            onClick={() => setLatentSignal(!latentSignal)}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-all ${
              latentSignal
                ? 'bg-amber-900/80 text-amber-200 border border-amber-600 shadow-lg shadow-amber-900/50'
                : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
            }`}
          >
            {latentSignal ? 'LATENT SIGNAL ON' : 'INJECT LATENT SIGNAL'}
          </button>
          {/* State indicator */}
          <span
            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
              gain > 0.6
                ? 'bg-purple-900/80 text-purple-200 border border-purple-700'
                : gain > 0.3
                ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-700'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {gain > 0.6 ? 'PSYCHEDELIC STATE' : gain > 0.3 ? 'TRANSITIONAL' : 'BASELINE (ALPHA)'}
          </span>
        </div>
      </div>

      {/* VIEWPORT */}
      <div
        className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl cursor-col-resize"
        onMouseDown={(e) => {
          isDraggingRef.current = true;
          handleInput(e.clientX);
        }}
        onMouseMove={(e) => {
          if (isDraggingRef.current) handleInput(e.clientX);
        }}
        onMouseUp={() => (isDraggingRef.current = false)}
        onMouseLeave={() => (isDraggingRef.current = false)}
        onTouchStart={(e) => {
          isDraggingRef.current = true;
          handleInput(e.touches[0].clientX);
        }}
        onTouchMove={(e) => handleInput(e.touches[0].clientX)}
        onTouchEnd={() => (isDraggingRef.current = false)}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={540}
          className="w-full h-auto block"
        />

        {/* OVERLAY HINT */}
        <div className="absolute top-4 left-0 w-full text-center pointer-events-none opacity-70 group-hover:opacity-0 transition-opacity duration-300">
          <span className="bg-slate-900/90 text-slate-300 px-4 py-2 rounded-full border border-slate-600 text-xs">
            ← DRAG LEFT/RIGHT TO MODULATE 5-HT2A GAIN →
          </span>
        </div>

        {/* PATTERN REVEALED overlay */}
        {latentSignal && gain > 0.65 && (
          <div className="absolute top-4 right-4 pointer-events-none animate-pulse">
            <span className="bg-amber-900/90 text-amber-200 px-3 py-1.5 rounded border border-amber-600 text-xs font-bold">
              PATTERN REVEALED
            </span>
          </div>
        )}

        {/* Suppressed pattern indicator */}
        {latentSignal && gain < 0.35 && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="bg-slate-800/90 text-slate-500 px-3 py-1.5 rounded border border-slate-700 text-xs">
              PATTERN SUPPRESSED BY ALPHA
            </span>
          </div>
        )}
      </div>

      {/* CAPTION */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="space-y-2">
          <p>
            <strong className="text-blue-400">Low Gain (Left):</strong> Strong coupling creates large,
            synchronized alpha waves. The cortex is locked in a low-dimensional attractor.
          </p>
          <p className="text-slate-500">
            This is the &quot;default mode&quot; — efficient but constrained.
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong className="text-purple-400">High Gain (Right):</strong> 5-HT2A activation breaks the
            oscillatory constraints. Local populations desynchronize.
          </p>
          <p className="text-slate-500">
            MEG coherence drops as the system explores off-manifold configurations.
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong className="text-amber-400">Latent Signal:</strong> A hidden pattern exists in the cortex
            but is suppressed by alpha synchrony. When gain breaks coupling, the signal emerges.
          </p>
          <p className="text-slate-500">
            Models how psychedelics reveal &quot;locked away&quot; mental states.
          </p>
        </div>
      </div>

      {/* PAPER LINK */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500">
        <p>
          Based on MEG analysis of 136 sessions showing mechanism-specific dissociation:
          psilocybin desynchronizes (−15%, p=0.003), ketamine does not.
          <br />
          <span className="text-slate-400">Todd (2025) &quot;Psychedelics as Dimensionality Modulators&quot;</span>
        </p>
      </div>
    </div>
  );
}
