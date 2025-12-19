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
  const [fieldCoupling, setFieldCoupling] = useState(0); // Coupling for hidden field behind grid
  const [crossCoupling, setCrossCoupling] = useState(0); // Coupling between A and B
  const [isRunning, setIsRunning] = useState(true);
  const gridCoordinationRef = useRef(0);
  const oscSyncRef = useRef(0);
  const oscillatorsRef = useRef<Oscillator[]>([]);
  const gridRef = useRef<number[][]>([]);
  const fieldRef = useRef<number[][]>([]); // Hidden field behind the switches
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Initialize oscillators, grid, and hidden field
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

    // Initialize hidden field (continuous values 0-1)
    fieldRef.current = Array.from({ length: 6 }, () =>
      Array.from({ length: 6 }, () => Math.random())
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
    const ratio = ones / total;
    return Math.abs(ratio - 0.5) * 2;
  }, []);

  // Force all grid cells to same value
  const forceGridSync = () => {
    gridRef.current = gridRef.current.map(row => row.map(() => 1));
    fieldRef.current = fieldRef.current.map(row => row.map(() => 1));
  };

  // Randomize grid and field
  const randomizeGrid = () => {
    gridRef.current = gridRef.current.map(row =>
      row.map(() => Math.random() > 0.5 ? 1 : 0)
    );
    fieldRef.current = fieldRef.current.map(row =>
      row.map(() => Math.random())
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

      // Calculate mean phase of oscillators (for cross-coupling)
      let sumCosPhase = 0, sumSinPhase = 0;
      for (const osc of oscillators) {
        sumCosPhase += Math.cos(osc.phase);
        sumSinPhase += Math.sin(osc.phase);
      }
      const meanPhase = Math.atan2(sumSinPhase, sumCosPhase);

      // Calculate mean field value (for cross-coupling)
      const field = fieldRef.current;
      let fieldSum = 0, fieldCount = 0;
      for (const row of field) {
        for (const val of row) {
          fieldSum += val;
          fieldCount++;
        }
      }
      const meanField = fieldCount > 0 ? fieldSum / fieldCount : 0.5;

      // Update oscillators (Kuramoto model + cross-coupling from B)
      const N = oscillators.length;
      const newPhases = oscillators.map((osc, i) => {
        let sumSin = 0;
        for (let j = 0; j < N; j++) {
          if (i !== j) {
            sumSin += Math.sin(oscillators[j].phase - osc.phase);
          }
        }
        // Cross-coupling: field mean biases oscillator toward phase 0 or π
        const fieldBias = crossCoupling * (meanField - 0.5) * 2 * Math.sin(-osc.phase);
        return osc.phase + dt * (osc.naturalFreq + (coupling / N) * sumSin + fieldBias);
      });

      oscillators.forEach((osc, i) => {
        osc.phase = newPhases[i] % (2 * Math.PI);
      });

      // Update hidden field with diffusion/coupling
      const grid = gridRef.current;

      // Cross-coupling from A: oscillator phase biases field toward 0 or 1
      // Mean phase near 0 → push field toward 1; mean phase near π → push toward 0
      const oscInfluence = crossCoupling > 0 ? (Math.cos(meanPhase) + 1) / 2 : 0.5;

      if (fieldCoupling > 0 || crossCoupling > 0) {
        // Diffusive coupling between neighbors + cross-coupling from oscillators
        const newField = field.map((row, r) =>
          row.map((val, c) => {
            let neighborSum = 0;
            let neighborCount = 0;
            // Check 4 neighbors
            if (r > 0) { neighborSum += field[r-1][c]; neighborCount++; }
            if (r < 5) { neighborSum += field[r+1][c]; neighborCount++; }
            if (c > 0) { neighborSum += field[r][c-1]; neighborCount++; }
            if (c < 5) { neighborSum += field[r][c+1]; neighborCount++; }
            const neighborAvg = neighborSum / neighborCount;
            // Move toward neighbor average based on coupling strength
            let newVal = val + fieldCoupling * dt * 2 * (neighborAvg - val);
            // Cross-coupling: oscillator phases bias the field
            newVal += crossCoupling * dt * (oscInfluence - val);
            return Math.max(0, Math.min(1, newVal));
          })
        );
        fieldRef.current = newField;

        // Update grid based on field (threshold at 0.5)
        gridRef.current = fieldRef.current.map(row =>
          row.map(val => val > 0.5 ? 1 : 0)
        );
      } else {
        // No field coupling - random flips (entropy)
        if (Math.random() < 0.05) {
          const row = Math.floor(Math.random() * grid.length);
          const col = Math.floor(Math.random() * grid[0].length);
          grid[row][col] = 1 - grid[row][col];
          field[row][col] = grid[row][col]; // Keep field in sync
        }
      }

      // Add small noise to field
      if (fieldCoupling > 0 || crossCoupling > 0) {
        fieldRef.current = fieldRef.current.map(row =>
          row.map(val => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.02)))
        );
      }

      // Update metrics
      const orderParam = getOrderParameter();
      const gridCoord = getGridCoordination();
      oscSyncRef.current = orderParam;
      gridCoordinationRef.current = gridCoord;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw dividing line (purple if cross-coupled)
      ctx.strokeStyle = crossCoupling > 0 ? `rgba(168, 85, 247, ${0.3 + crossCoupling * 0.2})` : '#444';
      ctx.lineWidth = crossCoupling > 0 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, height);
      ctx.stroke();

      // Draw cross-coupling indicator arrows if active
      if (crossCoupling > 0) {
        const arrowY = height / 2;
        const arrowLen = 15;
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 + crossCoupling * 0.15})`;
        ctx.lineWidth = 2;
        // Arrow pointing right (A → B)
        ctx.beginPath();
        ctx.moveTo(midX - 5, arrowY - 10);
        ctx.lineTo(midX + arrowLen, arrowY - 10);
        ctx.lineTo(midX + arrowLen - 5, arrowY - 15);
        ctx.moveTo(midX + arrowLen, arrowY - 10);
        ctx.lineTo(midX + arrowLen - 5, arrowY - 5);
        ctx.stroke();
        // Arrow pointing left (B → A)
        ctx.beginPath();
        ctx.moveTo(midX + 5, arrowY + 10);
        ctx.lineTo(midX - arrowLen, arrowY + 10);
        ctx.lineTo(midX - arrowLen + 5, arrowY + 15);
        ctx.moveTo(midX - arrowLen, arrowY + 10);
        ctx.lineTo(midX - arrowLen + 5, arrowY + 5);
        ctx.stroke();
      }

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
      const bLabel = crossCoupling > 0 ? 'Cross-Coupled Field' : (fieldCoupling > 0 ? 'Switches + Hidden Field' : 'Independent Switches');
      ctx.fillText(bLabel, midX + midX / 2, 25);

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

      // Draw coordination bars
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
      const cellSize = 28;
      const gridWidth = grid[0].length * cellSize;
      const gridHeight = grid.length * cellSize;
      const gridStartX = midX + (midX - gridWidth) / 2;
      const gridStartY = 50 + (height - 100 - gridHeight) / 2;

      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const x = gridStartX + col * cellSize;
          const y = gridStartY + row * cellSize;

          // If field coupling or cross-coupling is on, show field intensity as background
          const showField = fieldCoupling > 0 || crossCoupling > 0;
          if (showField) {
            const fieldVal = fieldRef.current[row][col];
            const intensity = Math.floor(fieldVal * 60);
            // Purple tint if cross-coupled, blue if just field-coupled
            if (crossCoupling > 0) {
              ctx.fillStyle = `rgb(${intensity + 20}, ${intensity}, ${intensity + 40})`;
            } else {
              ctx.fillStyle = `rgb(${intensity}, ${intensity + 20}, ${intensity + 40})`;
            }
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          }

          ctx.fillStyle = grid[row][col] ? '#22c55e' : '#1a1a1a';
          ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

          ctx.strokeStyle = showField ? (crossCoupling > 0 ? '#648' : '#446') : '#333';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

          ctx.fillStyle = grid[row][col] ? '#000' : '#444';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(grid[row][col].toString(), x + cellSize / 2, y + cellSize / 2 + 3);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [coupling, fieldCoupling, crossCoupling, isRunning, getOrderParameter, getGridCoordination]);

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
          <div className="flex items-center gap-2 mb-2">
            <label className="text-gray-400 text-xs">Hidden field:</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={fieldCoupling}
              onChange={(e) => setFieldCoupling(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-gray-500 w-6">{fieldCoupling.toFixed(1)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={forceGridSync}
              className="px-2 py-1 border border-gray-700 rounded hover:border-gray-500 text-gray-400 text-xs"
            >
              Force Sync
            </button>
            <button
              onClick={randomizeGrid}
              className="px-2 py-1 border border-gray-700 rounded hover:border-gray-500 text-gray-400 text-xs"
            >
              Randomize
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2">
            {fieldCoupling > 0
              ? "Field couples the switches. Watch them coordinate."
              : "No field = entropy wins. Add a hidden field →"}
          </p>
        </div>
      </div>

      {/* Cross-coupling controls */}
      <div className="mt-3 border border-purple-900/50 rounded p-3 bg-purple-950/20">
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-medium text-sm">A ↔ B</span>
          <label className="text-gray-400 text-sm">Cross-coupling:</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={crossCoupling}
            onChange={(e) => setCrossCoupling(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-gray-500 w-6 text-sm">{crossCoupling.toFixed(1)}</span>
        </div>
        <p className="text-gray-600 text-xs mt-2">
          {crossCoupling > 0
            ? "A's phase steers B's field. B's field biases A's oscillators. They coordinate through the coupling."
            : "A and B are independent. Add cross-coupling to link them →"}
        </p>
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
          {crossCoupling > 0 ? (
            <>
              <span className="text-purple-400">A ↔ B</span>: Two different substrates coordinating through a shared field.
              <span className="text-gray-500 ml-1">The oscillators steer the field; the field biases the oscillators.</span>
            </>
          ) : fieldCoupling > 0 ? (
            <>
              <span className="text-green-400">B</span> now has a hidden field—and the switches coordinate.
              <span className="text-gray-500 ml-1">The switches are the public face; the field does the thinking.</span>
            </>
          ) : (
            <>
              <span className="text-blue-400">A</span> self-organizes through coupling.
              <span className="text-green-400 ml-2">B</span> decays to entropy.
              <span className="text-gray-500 ml-1">Try adding a hidden field to B →</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
