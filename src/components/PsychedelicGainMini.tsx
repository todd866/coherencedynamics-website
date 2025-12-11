'use client';

/**
 * PsychedelicGainMini - Compact version for paper page embeds
 *
 * Same physics as PsychedelicGainDemo but:
 * - Smaller canvas (300x300)
 * - No metrics panel
 * - Ref-based loop (decoupled from React)
 * - Smooth latent lerp
 */

import { useRef, useEffect, useState } from 'react';

const GRID_SIZE = 50;
const N_OSCILLATORS = GRID_SIZE * GRID_SIZE;
const BASE_COUPLING = 3.0;
const DT = 0.04;

export default function PsychedelicGainMini() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phasesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const frequenciesRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));
  const latentPatternRef = useRef<Float32Array>(new Float32Array(N_OSCILLATORS));

  // Physics Refs (Decoupled from React)
  const gainRef = useRef(0.15);
  const latentTargetRef = useRef(0);
  const latentCurrentRef = useRef(0);

  // UI State
  const [uiGain, setUiGain] = useState(0.15);
  const [uiLatent, setUiLatent] = useState(false);
  const isDraggingRef = useRef(false);

  // Initialize
  useEffect(() => {
    for (let i = 0; i < N_OSCILLATORS; i++) {
      phasesRef.current[i] = Math.random() * Math.PI * 2;
      frequenciesRef.current[i] = 1.0 + (Math.random() - 0.5) * 0.3;
    }

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

  // Physics + Render loop (decoupled)
  useEffect(() => {
    let frameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Pre-allocate buffers
    const imgData = ctx.createImageData(GRID_SIZE, GRID_SIZE);
    const data = imgData.data;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = GRID_SIZE;
    tempCanvas.height = GRID_SIZE;
    const tempCtx = tempCanvas.getContext('2d');

    const loop = () => {
      // Smooth lerp for latent signal
      latentCurrentRef.current += (latentTargetRef.current - latentCurrentRef.current) * 0.05;

      const gain = gainRef.current;
      const K = BASE_COUPLING * (1 - gain * 0.9);
      const noiseStr = gain * 0.6;
      const signalStrength = latentCurrentRef.current * 2.5;

      const newPhases = new Float32Array(N_OSCILLATORS);

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const idx = i * GRID_SIZE + j;

          let couplingSum = 0;
          const neighbors = [
            ((i - 1 + GRID_SIZE) % GRID_SIZE) * GRID_SIZE + j,
            ((i + 1) % GRID_SIZE) * GRID_SIZE + j,
            i * GRID_SIZE + ((j - 1 + GRID_SIZE) % GRID_SIZE),
            i * GRID_SIZE + ((j + 1) % GRID_SIZE)
          ];

          for (const nIdx of neighbors) {
            couplingSum += Math.sin(phasesRef.current[nIdx] - phasesRef.current[idx]);
          }

          const latentDrive = latentPatternRef.current[idx] * signalStrength * gain;
          const noise = (Math.random() - 0.5) * noiseStr;
          const dTheta = (frequenciesRef.current[idx] + noise + latentDrive + (K / 4) * couplingSum) * DT;
          newPhases[idx] = (phasesRef.current[idx] + dTheta + Math.PI * 2) % (Math.PI * 2);
        }
      }
      phasesRef.current = newPhases;

      // Render with ImageData
      for (let i = 0; i < N_OSCILLATORS; i++) {
        const p = phasesRef.current[i];
        const r = Math.sin(p) * 127 + 128;
        const g = Math.sin(p + 2.094) * 127 + 128;
        const b = Math.sin(p + 4.189) * 127 + 128;

        const ptr = i * 4;
        data[ptr] = r;
        data[ptr + 1] = g;
        data[ptr + 2] = b;
        data[ptr + 3] = 255;
      }

      tempCtx?.putImageData(imgData, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []); // Empty dependency = loop never restarts

  const handleInput = (clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    gainRef.current = x;
    setUiGain(x);
  };

  const toggleLatent = () => {
    const newVal = !uiLatent;
    setUiLatent(newVal);
    latentTargetRef.current = newVal ? 1 : 0;
  };

  return (
    <div className="w-full font-mono text-xs select-none">
      {/* Controls */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={toggleLatent}
          className={`px-2 py-1 rounded text-xs transition-all ${
            uiLatent
              ? 'bg-amber-900/80 text-amber-200 border border-amber-600'
              : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
          }`}
        >
          {uiLatent ? 'SIGNAL ON' : 'INJECT SIGNAL'}
        </button>
        <span className={`px-2 py-1 rounded text-xs ${
          uiGain > 0.6
            ? 'bg-purple-900/80 text-purple-200'
            : uiGain > 0.3
            ? 'bg-indigo-900/60 text-indigo-200'
            : 'bg-slate-800 text-slate-400'
        }`}>
          {uiGain > 0.6 ? 'CRITICAL' : uiGain > 0.3 ? 'TRANSITIONAL' : 'BASELINE'}
        </span>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-lg overflow-hidden border border-slate-700 cursor-col-resize"
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
          width={300}
          height={300}
          className="w-full h-auto block"
        />

        {/* Pattern revealed indicator */}
        {uiLatent && uiGain > 0.65 && (
          <div className="absolute top-2 right-2 pointer-events-none animate-pulse">
            <span className="bg-amber-900/90 text-amber-200 px-2 py-1 rounded border border-amber-600 text-xs">
              REVEALED
            </span>
          </div>
        )}
      </div>

      {/* Gain bar */}
      <div className="mt-2 h-2 bg-slate-800 rounded overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all"
          style={{ width: `${uiGain * 100}%` }}
        />
      </div>
      <p className="text-slate-500 text-center mt-1">Drag to modulate 5-HT2A gain</p>
    </div>
  );
}
