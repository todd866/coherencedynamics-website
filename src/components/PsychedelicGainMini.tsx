'use client';

/**
 * PsychedelicGainMini - Compact version for embedding in paper pages
 *
 * Same physics as PsychedelicGainDemo but smaller canvas, no metrics panel.
 * Optimized with ImageData for 60fps on mobile.
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

  const [gain, setGain] = useState(0.15);
  const [latentSignal, setLatentSignal] = useState(false);
  const isDraggingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize
  useEffect(() => {
    for (let i = 0; i < N_OSCILLATORS; i++) {
      phasesRef.current[i] = Math.random() * Math.PI * 2;
      frequenciesRef.current[i] = 1.0 + (Math.random() - 0.5) * 0.3;
    }

    // Mandala pattern
    const cx = GRID_SIZE / 2;
    const cy = GRID_SIZE / 2;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j;
        const x = j - cx;
        const y = i - cy;
        const r = Math.sqrt(x * x + y * y) / (GRID_SIZE / 2);
        const val = Math.sin(r * 15) * 0.5 + Math.cos(Math.atan2(y, x) * 6) * 0.5;
        latentPatternRef.current[idx] = val;
      }
    }

    setIsInitialized(true);
  }, []);

  // Physics + Render loop
  useEffect(() => {
    if (!isInitialized) return;

    let frameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const loop = () => {
      const K = BASE_COUPLING * (1 - gain * 0.9);
      const noiseStr = gain * 0.6;
      const signalStrength = latentSignal ? 2.0 : 0;

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
      const width = canvas.width;
      const height = canvas.height;

      const imgData = ctx.createImageData(GRID_SIZE, GRID_SIZE);
      const data = imgData.data;

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

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = GRID_SIZE;
      tempCanvas.height = GRID_SIZE;
      tempCanvas.getContext('2d')?.putImageData(imgData, 0, 0);

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, width, height);
      ctx.restore();

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gain, latentSignal, isInitialized]);

  const handleInput = (clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setGain(x);
  };

  return (
    <div className="w-full font-mono text-xs select-none">
      {/* Controls */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setLatentSignal(!latentSignal)}
          className={`px-2 py-1 rounded text-xs transition-all ${
            latentSignal
              ? 'bg-amber-900/80 text-amber-200 border border-amber-600'
              : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
          }`}
        >
          {latentSignal ? 'SIGNAL ON' : 'INJECT SIGNAL'}
        </button>
        <span className={`px-2 py-1 rounded text-xs ${
          gain > 0.6
            ? 'bg-purple-900/80 text-purple-200'
            : gain > 0.3
            ? 'bg-indigo-900/60 text-indigo-200'
            : 'bg-slate-800 text-slate-400'
        }`}>
          {gain > 0.6 ? 'PSYCHEDELIC' : gain > 0.3 ? 'TRANSITIONAL' : 'BASELINE'}
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
        {latentSignal && gain > 0.65 && (
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
          style={{ width: `${gain * 100}%` }}
        />
      </div>
      <p className="text-slate-500 text-center mt-1">Drag to modulate 5-HT2A gain</p>
    </div>
  );
}
