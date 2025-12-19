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
  const gridCoordinationRef = useRef(0);
  const oscSyncRef = useRef(0);
  const oscillatorsRef = useRef<Oscillator[]>([]);
  const gridRef = useRef<number[][]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Initialize oscillators and grid
  useEffect(() => {
    const numOscillators = 12;
    oscillatorsRef.current = Array.from({ length: numOscillators }, (_, i) => ({
      phase: Math.random() * 2 * Math.PI,
      naturalFreq: 1.5 + Math.random() * 0.5,
      x: 80 + (i % 4) * 60,
      y: 80 + Math.floor(i / 4) * 60,
    }));

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

  // Calculate grid coordination (how uniform is it?)
  const getGridCoordination = useCallback(() => {
    const grid = gridRef.current;
    if (grid.length === 0) return 0;

    let ones = 0, total = 0;
    for (const row of grid) {
      for (const cell of row) {
        ones += cell;
        total++;
      }
    }
    // Coordination = how far from 50/50 (max at all 0s or all 1s)
    const ratio = ones / total;
    return Math.abs(ratio - 0.5) * 2; // 0 = perfectly mixed, 1 = all same
  }, []);

  // Force all grid cells to same value
  const forceGridSync = () => {
    gridRef.current = gridRef.current.map(row => row.map(() => 1));
  };

  // Randomize grid
  const randomizeGrid = () => {
    gridRef.current = gridRef.current.map(row =>
      row.map(() => Math.random() > 0.5 ? 1 : 0)
    );
  };

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

      // Occasionally flip random grid cells (discrete, uncoupled - entropy wins)
      if (Math.random() < 0.05) {
        const grid = gridRef.current;
        const row = Math.floor(Math.random() * grid.length);
        const col = Math.floor(Math.random() * grid[0].length);
        grid[row][col] = 1 - grid[row][col];
      }

      // Update metrics for display
      const orderParam = getOrderParameter();
      const gridCoord = getGridCoordination();
      oscSyncRef.current = orderParam;
      gridCoordinationRef.current = gridCoord;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw dividing line
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, height);
      ctx.stroke();

      // Draw big A and B labels
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4a9eff';
      ctx.fillText('A', 25, 35);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('B', midX + 25, 35);

      // Draw section labels
      ctx.fillStyle = '#888';
      ctx.font = '12px Arial';
      ctx.fillText('Coupled Oscillators', midX / 2, 25);
      ctx.fillText('Independent Switches', midX + midX / 2, 25);

      // Draw connections between oscillators
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.15 * coupling})`;
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

        ctx.beginPath();
        ctx.arc(osc.x, osc.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.stroke();

        const indicatorX = osc.x + radius * 0.8 * Math.cos(osc.phase);
        const indicatorY = osc.y + radius * 0.8 * Math.sin(osc.phase);
        ctx.beginPath();
        ctx.moveTo(osc.x, osc.y);
        ctx.lineTo(indicatorX, indicatorY);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(osc.x, osc.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#4a9eff';
        ctx.fill();
      }

      // Draw coordination bars - MATCHING STYLE for A vs B comparison
      const barY = height - 45;
      const barHeight = 20;
      const barWidth = midX - 60;

      // A: Oscillator sync bar
      ctx.fillStyle = '#222';
      ctx.fillRect(30, barY, barWidth, barHeight);
      ctx.fillStyle = orderParam > 0.8 ? '#22c55e' : orderParam > 0.5 ? '#eab308' : '#ef4444';
      ctx.fillRect(30, barY, barWidth * orderParam, barHeight);
      ctx.strokeStyle = '#4a9eff';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, barY, barWidth, barHeight);

      // B: Grid coordination bar
      ctx.fillStyle = '#222';
      ctx.fillRect(midX + 30, barY, barWidth, barHeight);
      ctx.fillStyle = gridCoord > 0.8 ? '#22c55e' : gridCoord > 0.5 ? '#eab308' : '#ef4444';
      ctx.fillRect(midX + 30, barY, barWidth * gridCoord, barHeight);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(midX + 30, barY, barWidth, barHeight);

      // Labels above bars
      ctx.fillStyle = '#aaa';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Coordination: ${(orderParam * 100).toFixed(0)}%`, 30, barY - 5);
      ctx.fillText(`Coordination: ${(gridCoord * 100).toFixed(0)}%`, midX + 30, barY - 5);

      // Draw discrete grid (right side)
      const grid = gridRef.current;
      const cellSize = 28;
      const gridWidth = grid[0].length * cellSize;
      const gridHeight = grid.length * cellSize;
      const gridStartX = midX + (midX - gridWidth) / 2;
      const gridStartY = 50 + (height - 100 - gridHeight) / 2;

      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const x = gridStartX + col * cellSize;
          const y = gridStartY + row * cellSize;

          ctx.fillStyle = grid[row][col] ? '#22c55e' : '#1a1a1a';
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          ctx.fillStyle = grid[row][col] ? '#000' : '#444';
          ctx.font = '11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(grid[row][col].toString(), x + cellSize / 2, y + cellSize / 2 + 4);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [coupling, isRunning, getOrderParameter, getGridCoordination]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full border border-gray-800 rounded-lg bg-black"
      />

      {/* Side-by-side controls */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        {/* A controls */}
        <div className="border border-blue-900/50 rounded p-3 bg-blue-950/20">
          <div className="text-blue-400 font-medium mb-2">A: Soup</div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-gray-400">Coupling:</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={coupling}
              onChange={(e) => setCoupling(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-gray-500 w-6">{coupling.toFixed(1)}</span>
          </div>
          <button
            onClick={() => {
              oscillatorsRef.current.forEach(osc => {
                osc.phase = Math.random() * 2 * Math.PI;
              });
            }}
            className="w-full px-2 py-1 border border-gray-700 rounded hover:border-gray-500 text-gray-400"
          >
            Randomize Phases
          </button>
          <p className="text-gray-600 text-xs mt-2">
            Physics does the work. Just add coupling.
          </p>
        </div>

        {/* B controls */}
        <div className="border border-green-900/50 rounded p-3 bg-green-950/20">
          <div className="text-green-400 font-medium mb-2">B: Sparks</div>
          <button
            onClick={forceGridSync}
            className="w-full px-2 py-1 mb-2 border border-gray-700 rounded hover:border-gray-500 text-gray-400"
          >
            Force All to 1 (Sync)
          </button>
          <button
            onClick={randomizeGrid}
            className="w-full px-2 py-1 border border-gray-700 rounded hover:border-gray-500 text-gray-400"
          >
            Randomize
          </button>
          <p className="text-gray-600 text-xs mt-2">
            Watch forced sync decay. No coupling = entropy wins.
          </p>
        </div>
      </div>

      {/* Unified controls */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-1 text-sm border border-gray-700 rounded hover:border-gray-500 text-gray-400"
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Comparison insight */}
      <div className="mt-4 p-3 border border-gray-800 rounded bg-gray-900/50 text-center">
        <p className="text-gray-400 text-sm">
          <span className="text-blue-400">A</span> self-organizes through coupling.
          <span className="text-green-400 ml-2">B</span> requires external intervention—and immediately decays.
        </p>
      </div>
    </div>
  );
}
