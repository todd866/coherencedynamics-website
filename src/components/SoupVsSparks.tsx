'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Oscillator {
  phase: number;
  naturalFreq: number;
  x: number;
  y: number;
}

export default function SoupVsSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coupling, setCoupling] = useState(0.5);
  const [isRunning, setIsRunning] = useState(true);
  const oscillatorsRef = useRef<Oscillator[]>([]);
  const gridRef = useRef<number[][]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Initialize oscillators and grid
  useEffect(() => {
    const numOscillators = 12;
    oscillatorsRef.current = Array.from({ length: numOscillators }, (_, i) => ({
      phase: Math.random() * 2 * Math.PI,
      naturalFreq: 1.5 + Math.random() * 0.5, // Slightly different frequencies
      x: 80 + (i % 4) * 60,
      y: 80 + Math.floor(i / 4) * 60,
    }));

    // Initialize 6x6 binary grid
    gridRef.current = Array.from({ length: 6 }, () =>
      Array.from({ length: 6 }, () => Math.random() > 0.5 ? 1 : 0)
    );
  }, []);

  // Calculate order parameter (synchronization measure)
  const getOrderParameter = useCallback(() => {
    const oscillators = oscillatorsRef.current;
    if (oscillators.length === 0) return 0;

    let sumCos = 0, sumSin = 0;
    for (const osc of oscillators) {
      sumCos += Math.cos(osc.phase);
      sumSin += Math.sin(osc.phase);
    }
    return Math.sqrt(sumCos * sumCos + sumSin * sumSin) / oscillators.length;
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = 0.03;
    const width = canvas.width;
    const height = canvas.height;
    const midX = width / 2;

    const animate = () => {
      if (!isRunning) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += dt;
      const oscillators = oscillatorsRef.current;

      // Update oscillators (Kuramoto model)
      const N = oscillators.length;
      const newPhases = oscillators.map((osc, i) => {
        let sumSin = 0;
        for (let j = 0; j < N; j++) {
          if (i !== j) {
            sumSin += Math.sin(oscillators[j].phase - osc.phase);
          }
        }
        return osc.phase + dt * (osc.naturalFreq + (coupling / N) * sumSin);
      });

      oscillators.forEach((osc, i) => {
        osc.phase = newPhases[i] % (2 * Math.PI);
      });

      // Occasionally flip random grid cells (discrete, uncoupled)
      if (Math.random() < 0.05) {
        const grid = gridRef.current;
        const row = Math.floor(Math.random() * grid.length);
        const col = Math.floor(Math.random() * grid[0].length);
        grid[row][col] = 1 - grid[row][col];
      }

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw dividing line
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, height);
      ctx.stroke();

      // Draw labels
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SOUP (Coupled Oscillators)', midX / 2, 25);
      ctx.fillText('SPARKS (Discrete Switches)', midX + midX / 2, 25);

      // Draw oscillators (left side)
      const orderParam = getOrderParameter();

      // Draw connections between oscillators (faint)
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.1 * coupling})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < oscillators.length; i++) {
        for (let j = i + 1; j < oscillators.length; j++) {
          ctx.beginPath();
          ctx.moveTo(oscillators[i].x, oscillators[i].y);
          ctx.lineTo(oscillators[j].x, oscillators[j].y);
          ctx.stroke();
        }
      }

      // Draw each oscillator
      for (const osc of oscillators) {
        const radius = 20;

        // Oscillator body
        ctx.beginPath();
        ctx.arc(osc.x, osc.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Phase indicator (rotating line)
        const indicatorX = osc.x + radius * 0.8 * Math.cos(osc.phase);
        const indicatorY = osc.y + radius * 0.8 * Math.sin(osc.phase);
        ctx.beginPath();
        ctx.moveTo(osc.x, osc.y);
        ctx.lineTo(indicatorX, indicatorY);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(osc.x, osc.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#4a9eff';
        ctx.fill();
      }

      // Draw order parameter bar
      ctx.fillStyle = '#333';
      ctx.fillRect(20, height - 40, midX - 40, 15);
      ctx.fillStyle = orderParam > 0.8 ? '#22c55e' : orderParam > 0.5 ? '#eab308' : '#ef4444';
      ctx.fillRect(20, height - 40, (midX - 40) * orderParam, 15);
      ctx.fillStyle = '#888';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Sync: ${(orderParam * 100).toFixed(0)}%`, 20, height - 50);

      // Draw discrete grid (right side)
      const grid = gridRef.current;
      const cellSize = 30;
      const gridWidth = grid[0].length * cellSize;
      const gridHeight = grid.length * cellSize;
      const gridStartX = midX + (midX - gridWidth) / 2;
      const gridStartY = (height - gridHeight) / 2;

      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const x = gridStartX + col * cellSize;
          const y = gridStartY + row * cellSize;

          ctx.fillStyle = grid[row][col] ? '#22c55e' : '#1a1a1a';
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          // Binary label
          ctx.fillStyle = grid[row][col] ? '#000' : '#444';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(grid[row][col].toString(), x + cellSize / 2, y + cellSize / 2 + 4);
        }
      }

      // Label for grid
      ctx.fillStyle = '#888';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Random flips (no coupling)', midX + midX / 2, height - 50);
      ctx.fillStyle = '#555';
      ctx.fillText('Each cell independent', midX + midX / 2, height - 35);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [coupling, isRunning, getOrderParameter]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full border border-gray-800 rounded-lg bg-black"
      />
      <div className="flex flex-wrap gap-4 mt-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Coupling:</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={coupling}
            onChange={(e) => setCoupling(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-gray-500 text-sm w-8">{coupling.toFixed(1)}</span>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-3 py-1 text-sm border border-gray-700 rounded hover:border-gray-500 text-gray-400"
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            oscillatorsRef.current.forEach(osc => {
              osc.phase = Math.random() * 2 * Math.PI;
            });
          }}
          className="px-3 py-1 text-sm border border-gray-700 rounded hover:border-gray-500 text-gray-400"
        >
          Randomize Phases
        </button>
      </div>
    </div>
  );
}
