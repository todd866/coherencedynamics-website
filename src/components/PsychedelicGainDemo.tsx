'use client';

/**
 * PsychedelicGainDemo - Publication Grade
 *
 * PHYSICS:
 * - Kuramoto oscillators with local coupling
 * - 5-HT2A gain modulates coupling strength and noise
 * - Demonstrates fast-timescale desynchronization
 *
 * OPTIMIZATIONS:
 * 1. REF-BASED LOOP: Decoupled from React renders for 144Hz smoothness
 * 2. ImageData pixel buffer: 1 draw call vs 3600 fillRect
 * 3. Smooth latent lerp: No snapping on toggle
 *
 * METRICS:
 * - Coherence (R): Kuramoto order parameter
 *
 * Companion to: "Timescale-Dependent Cortical Dynamics" (Todd, 2025)
 */

import { useRef, useEffect, useState } from 'react';

// === CONSTANTS ===
const GRID_SIZE = 60;
const N_OSCILLATORS = GRID_SIZE * GRID_SIZE;
const BASE_COUPLING = 3.0;
const DT = 0.04;
const HISTORY_LENGTH = 100;

export default function PsychedelicGainDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation State
  const phasesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const nextPhasesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const frequenciesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const latentPatternRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));

  // Physics Refs (Decoupled from React State)
  const gainRef = useRef(0.15);
  const latentTargetRef = useRef(0); // 0 or 1
  const latentCurrentRef = useRef(0); // Lerped value

  // Metrics History (R only)
  const historyRef = useRef<{coherence: number[]}>({
    coherence: new Array(HISTORY_LENGTH).fill(0.5)
  });

  // UI State (Only for rendering DOM elements)
  const [uiLatent, setUiLatent] = useState(false);
  const [currentR, setCurrentR] = useState(0.5);
  const isDraggingRef = useRef(false);

  // === INITIALIZATION ===
  useEffect(() => {
    // Initialize Oscillators
    for (let i = 0; i < N_OSCILLATORS; i++) {
      phasesRef.current[i] = Math.random() * Math.PI * 2;
      frequenciesRef.current[i] = 1.0 + (Math.random() - 0.5) * 0.3;
    }

    // Initialize Pattern (Mandala)
    const cx = GRID_SIZE / 2;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j;
        const x = j - cx;
        const y = i - cx;
        const r = Math.sqrt(x * x + y * y) / cx;
        latentPatternRef.current[idx] = Math.sin(r * 15) * 0.5 + Math.cos(Math.atan2(y, x) * 6) * 0.5;
      }
    }
  }, []);

  // === PHYSICS LOOP (Decoupled from React) ===
  useEffect(() => {
    let frameId: number;
    let frameCount = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Pre-allocate buffers (avoid GC)
    const imgData = ctx.createImageData(GRID_SIZE, GRID_SIZE);
    const data = imgData.data;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = GRID_SIZE;
    tempCanvas.height = GRID_SIZE;
    const tempCtx = tempCanvas.getContext('2d');

    const loop = () => {
      // 1. UPDATE PHYSICS PARAMETERS
      // Smooth lerp for latent signal (no snapping)
      latentCurrentRef.current += (latentTargetRef.current - latentCurrentRef.current) * 0.05;

      const gain = gainRef.current; // Read from Ref (no re-render)
      const K = BASE_COUPLING * (1 - gain * 0.9);
      const noiseStr = gain * 0.6;
      const signalStrength = latentCurrentRef.current * 2.5;

      const phases = phasesRef.current;
      const nextPhases = nextPhasesRef.current;
      let orderParamX = 0;
      let orderParamY = 0;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const idx = i * GRID_SIZE + j;

          // Local coupling (4-neighbor)
          let couplingSum = 0;
          const n1 = ((i - 1 + GRID_SIZE) % GRID_SIZE) * GRID_SIZE + j;
          const n2 = ((i + 1) % GRID_SIZE) * GRID_SIZE + j;
          const n3 = i * GRID_SIZE + ((j - 1 + GRID_SIZE) % GRID_SIZE);
          const n4 = i * GRID_SIZE + ((j + 1) % GRID_SIZE);

          couplingSum += Math.sin(phases[n1] - phases[idx]);
          couplingSum += Math.sin(phases[n2] - phases[idx]);
          couplingSum += Math.sin(phases[n3] - phases[idx]);
          couplingSum += Math.sin(phases[n4] - phases[idx]);

          // Latent drive: amplified by gain, suppressed by coupling
          const latentDrive = latentPatternRef.current[idx] * signalStrength * gain;
          const noise = (Math.random() - 0.5) * noiseStr;
          const dTheta = (frequenciesRef.current[idx] + noise + latentDrive + (K / 4) * couplingSum) * DT;
          nextPhases[idx] = (phases[idx] + dTheta + Math.PI * 2) % (Math.PI * 2);

          // Accumulate order parameter
          orderParamX += Math.cos(nextPhases[idx]);
          orderParamY += Math.sin(nextPhases[idx]);
        }
      }

      // Swap buffers
      phasesRef.current = nextPhases;
      nextPhasesRef.current = phases;

      // 2. COMPUTE METRICS
      const R = Math.sqrt(orderParamX ** 2 + orderParamY ** 2) / N_OSCILLATORS;

      // Update coherence history
      const history = historyRef.current;
      history.coherence.push(R);
      if (history.coherence.length > HISTORY_LENGTH) history.coherence.shift();

      // Update React state for R display (throttled)
      frameCount++;
      if (frameCount % 10 === 0) {
        setCurrentR(R);
      }

      // 3. RENDER PIXELS (ImageData buffer)
      const currentPhases = phasesRef.current;
      for (let i = 0; i < N_OSCILLATORS; i++) {
        const p = currentPhases[i];
        const r = Math.sin(p) * 127 + 128;
        const g = Math.sin(p + 2.094) * 127 + 128;
        const b = Math.sin(p + 4.189) * 127 + 128;
        const ptr = i * 4;
        data[ptr] = r;
        data[ptr + 1] = g;
        data[ptr + 2] = b;
        data[ptr + 3] = 255;
      }

      // Blit to canvas
      tempCtx?.putImageData(imgData, 0, 0);
      const width = canvas.width;
      const height = canvas.height;
      const gridDrawHeight = height - 130;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, width, gridDrawHeight);

      // 4. DRAW METRICS PANEL
      const panelY = height - 130;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, panelY, width, 130);

      // Divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, panelY);
      ctx.lineTo(width, panelY);
      ctx.stroke();

      const graphW = width - 80;
      const graphH = 50;
      const graphY = panelY + 55;
      const xOffset = 40;

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillText('ORDER PARAMETER R (Global Synchrony)', xOffset, panelY + 20);

      // Current value
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px ui-monospace, monospace';
      ctx.fillText(R.toFixed(3), xOffset, panelY + 42);

      // Graph background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(xOffset, graphY, graphW, graphH);

      // Graph line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      history.coherence.forEach((v, i) => {
        const x = xOffset + (i / (HISTORY_LENGTH - 1)) * graphW;
        const y = graphY + graphH - v * graphH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Current value dot
      const lastX = xOffset + graphW;
      const lastY = graphY + graphH - R * graphH;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();

      // 5. GAIN BAR
      const barY = height - 12;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, barY, width, 12);

      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, barY, width * gain, 12);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.fillText(`5-HT2A GAIN: ${(gain * 100).toFixed(0)}%`, 8, barY + 9);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []); // Empty dependency = loop never restarts!

  // === HANDLERS ===
  const handleInput = (clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    // Update Ref for physics (instant)
    gainRef.current = x;
  };

  const toggleLatent = () => {
    const newVal = !uiLatent;
    setUiLatent(newVal);
    latentTargetRef.current = newVal ? 1 : 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-sm select-none">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-3 px-1">
        <div>
          <h3 className="text-slate-500 text-xs tracking-widest uppercase">Cortical Oscillators</h3>
          <h2 className="text-slate-100 font-bold text-lg">5-HT2A Gain Modulation <span className="text-slate-500 font-normal text-sm">(Fast Timescale)</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs">R = <span className="text-red-400 font-bold">{currentR.toFixed(2)}</span></span>
          <button
            onClick={toggleLatent}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-all ${
              uiLatent
                ? 'bg-amber-900/80 text-amber-200 border border-amber-600 shadow-lg shadow-amber-900/50'
                : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
            }`}
          >
            {uiLatent ? 'EXTERNAL DRIVE ON' : 'INJECT EXTERNAL DRIVE'}
          </button>
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

        {/* HINT OVERLAY */}
        <div className="absolute top-4 left-0 w-full text-center pointer-events-none opacity-70 group-hover:opacity-0 transition-opacity duration-300">
          <span className="bg-slate-900/90 text-slate-300 px-4 py-2 rounded-full border border-slate-600 text-xs">
            ← DRAG TO MODULATE GAIN →
          </span>
        </div>

        {/* STATE OVERLAY */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <span className={`text-xs px-2 py-1 rounded font-bold border ${
            currentR < 0.3
              ? 'bg-purple-900/80 border-purple-500 text-purple-200'
              : 'bg-slate-800/80 border-slate-600 text-slate-400'
          }`}>
            {currentR < 0.3 ? 'DESYNCHRONIZED' : 'SYNCHRONIZED'}
          </span>
        </div>

        {/* DRIVE DOMINANT */}
        {uiLatent && currentR < 0.25 && (
          <div className="absolute bottom-36 right-4 pointer-events-none animate-pulse">
            <span className="bg-amber-900/90 text-amber-200 px-3 py-1.5 rounded border border-amber-600 text-xs font-bold">
              DRIVE DOMINANT
            </span>
          </div>
        )}
      </div>

      {/* CAPTION */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-400 border-t border-slate-800 pt-4">
        <p>
          <strong className="text-blue-400">Synchronized:</strong> Low gain creates strong coupling.
          Oscillators lock to shared phase (high R). The cortex is constrained.
        </p>
        <p>
          <strong className="text-purple-400">Desynchronized:</strong> High gain weakens coupling.
          Oscillators decouple (low R). More independent modes become active.
        </p>
        <p>
          <strong className="text-amber-400">External Drive:</strong> When synchronization is weak,
          external inputs can drive the system more easily.
        </p>
      </div>

      {/* PAPER LINK */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500">
        <p>
          MEG analyses show serotonergic psychedelics increase effective dimensionality (D<sub>eff</sub> +15%, p=0.003).
          This demo visualizes the fast-timescale desynchronization via the Kuramoto order parameter R.
          At slow hemodynamic timescales, the effect reverses.
        </p>
      </div>
    </div>
  );
}
