'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  className?: string;
}

// Coupled oscillator system
const N_OSCILLATORS = 20;
const DT = 0.02;
const COUPLING = 0.3;

interface ObserverState {
  kEff: number;
  correlationRate: number;
  accumulatedTime: number;
  sAcc: number; // Accessible entropy: (1/2) log det C
  qCumulative: number; // Cumulative thermodynamic cost of erasure
}

export default function BlackHoleObserversDemo({ className = '' }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [radius, setRadius] = useState(1.0);
  const [wallTime, setWallTime] = useState(0);
  const [externalObs, setExternalObs] = useState<ObserverState>({
    kEff: N_OSCILLATORS,
    correlationRate: 1,
    accumulatedTime: 0,
    sAcc: 0,
    qCumulative: 0,
  });
  const [infallingObs, setInfallingObs] = useState<ObserverState>({
    kEff: N_OSCILLATORS,
    correlationRate: 1,
    accumulatedTime: 0,
    sAcc: 0,
    qCumulative: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ positions: number[]; velocities: number[] }>({
    positions: Array(N_OSCILLATORS).fill(0).map(() => (Math.random() - 0.5) * 2),
    velocities: Array(N_OSCILLATORS).fill(0).map(() => (Math.random() - 0.5) * 0.5),
  });
  const animationRef = useRef<number>();
  const prevSAccRef = useRef<{ external: number; infalling: number }>({
    external: 0,
    infalling: 0,
  });

  // Compute aperture weights for external observer based on radius
  const getExternalAperture = useCallback((r: number): number[] => {
    const weights = [];
    for (let i = 0; i < N_OSCILLATORS; i++) {
      const modeFreq = (i + 1) / N_OSCILLATORS;
      const visibility = Math.pow(r, modeFreq * 3);
      weights.push(visibility);
    }
    return weights;
  }, []);

  // Compute effective dimension (participation ratio)
  const computeKEff = useCallback((weights: number[]): number => {
    const sum = weights.reduce((a, b) => a + b, 0);
    const sumSq = weights.reduce((a, b) => a + b * b, 0);
    if (sumSq === 0) return 0;
    return (sum * sum) / sumSq;
  }, []);

  // Compute accessible entropy: S_acc = (1/2) log det C
  // Simplified: use weighted variance as proxy for eigenvalues
  const computeSAcc = useCallback((
    positions: number[],
    velocities: number[],
    weights: number[]
  ): number => {
    // Compute weighted covariance proxy (diagonal approximation)
    let logDet = 0;
    const epsilon = 1e-10; // Regularization
    for (let i = 0; i < N_OSCILLATORS; i++) {
      const variance = (positions[i] * positions[i] + velocities[i] * velocities[i]) * weights[i] + epsilon;
      logDet += Math.log(variance);
    }
    return 0.5 * logDet;
  }, []);

  // Compute correlation rate
  const computeCorrelationRate = useCallback((
    positions: number[],
    velocities: number[],
    weights: number[]
  ): number => {
    let weightedVelocitySq = 0;
    let totalWeight = 0;
    for (let i = 0; i < N_OSCILLATORS; i++) {
      weightedVelocitySq += weights[i] * velocities[i] * velocities[i];
      totalWeight += weights[i];
    }
    if (totalWeight === 0) return 0;
    return Math.sqrt(weightedVelocitySq / totalWeight);
  }, []);

  // Physics step
  const step = useCallback(() => {
    const { positions, velocities } = stateRef.current;
    const newPositions = [...positions];
    const newVelocities = [...velocities];

    for (let i = 0; i < N_OSCILLATORS; i++) {
      let force = -positions[i];
      if (i > 0) force += COUPLING * (positions[i - 1] - positions[i]);
      if (i < N_OSCILLATORS - 1) force += COUPLING * (positions[i + 1] - positions[i]);
      force -= 0.01 * velocities[i];

      newVelocities[i] = velocities[i] + force * DT;
      newPositions[i] = positions[i] + newVelocities[i] * DT;
    }

    stateRef.current = { positions: newPositions, velocities: newVelocities };
    return { positions: newPositions, velocities: newVelocities };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const { positions, velocities } = step();

      // External observer
      const extWeights = getExternalAperture(radius);
      const extKEff = computeKEff(extWeights);
      const extRate = computeCorrelationRate(positions, velocities, extWeights);
      const extSAcc = computeSAcc(positions, velocities, extWeights);

      // Infalling observer (full access)
      const infWeights = Array(N_OSCILLATORS).fill(1);
      const infKEff = computeKEff(infWeights);
      const infRate = computeCorrelationRate(positions, velocities, infWeights);
      const infSAcc = computeSAcc(positions, velocities, infWeights);

      // Normalize rates
      const normalizedExtRate = infRate > 0 ? extRate / infRate : 0;

      // Compute thermodynamic cost (Landauer): Q = max(0, S_prev - S_current)
      const extDeltaS = Math.max(0, prevSAccRef.current.external - extSAcc);
      const infDeltaS = Math.max(0, prevSAccRef.current.infalling - infSAcc);

      prevSAccRef.current = { external: extSAcc, infalling: infSAcc };

      setWallTime(prev => prev + 1);
      setExternalObs(prev => ({
        kEff: extKEff,
        correlationRate: normalizedExtRate,
        accumulatedTime: prev.accumulatedTime + normalizedExtRate,
        sAcc: extSAcc,
        qCumulative: prev.qCumulative + extDeltaS,
      }));
      setInfallingObs(prev => ({
        kEff: infKEff,
        correlationRate: 1,
        accumulatedTime: prev.accumulatedTime + 1,
        sAcc: infSAcc,
        qCumulative: prev.qCumulative + infDeltaS,
      }));

      drawCanvas(positions, extWeights);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, radius, step, getExternalAperture, computeKEff, computeCorrelationRate, computeSAcc]);

  const drawCanvas = (positions: number[], extWeights: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const spacing = width / (N_OSCILLATORS + 1);
    const centerY = height / 2;

    // Draw connections
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < N_OSCILLATORS - 1; i++) {
      const x1 = spacing * (i + 1);
      const y1 = centerY + positions[i] * 30;
      const x2 = spacing * (i + 2);
      const y2 = centerY + positions[i + 1] * 30;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // Draw oscillators
    for (let i = 0; i < N_OSCILLATORS; i++) {
      const x = spacing * (i + 1);
      const y = centerY + positions[i] * 30;

      // Infalling sees all (outer ring)
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fill();

      // External sees based on weight (inner dot)
      const alpha = extWeights[i];
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      ctx.fill();
    }

    // Draw horizon indicator
    const horizonX = width * (1 - radius) * 0.8 + width * 0.1;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(horizonX, 10);
    ctx.lineTo(horizonX, height - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('horizon', horizonX, height - 5);
  };

  const reset = () => {
    stateRef.current = {
      positions: Array(N_OSCILLATORS).fill(0).map(() => (Math.random() - 0.5) * 2),
      velocities: Array(N_OSCILLATORS).fill(0).map(() => (Math.random() - 0.5) * 0.5),
    };
    prevSAccRef.current = { external: 0, infalling: 0 };
    setWallTime(0);
    setExternalObs({ kEff: N_OSCILLATORS, correlationRate: 1, accumulatedTime: 0, sAcc: 0, qCumulative: 0 });
    setInfallingObs({ kEff: N_OSCILLATORS, correlationRate: 1, accumulatedTime: 0, sAcc: 0, qCumulative: 0 });
  };

  const fmt = (n: number) => n.toFixed(1);
  const fmt2 = (n: number) => n.toFixed(2);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-white">Black Hole Aperture Demo</h3>
        <p className="text-xs text-gray-500">Same dynamics, different observers, different clocks</p>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={120}
        className="w-full rounded border border-gray-700 mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* External Observer */}
        <div className="bg-gray-800 p-3 rounded border border-red-900">
          <div className="text-xs text-red-400 font-semibold mb-2">External Observer</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-500">k_eff</div>
              <div className="font-mono text-red-300">{fmt(externalObs.kEff)}</div>
            </div>
            <div>
              <div className="text-gray-500">τ rate</div>
              <div className="font-mono text-red-300">{fmt2(externalObs.correlationRate)}</div>
            </div>
            <div>
              <div className="text-gray-500">S_acc</div>
              <div className="font-mono text-red-300">{fmt(externalObs.sAcc)}</div>
            </div>
            <div>
              <div className="text-gray-500">Q (cost)</div>
              <div className="font-mono text-orange-400">{fmt(externalObs.qCumulative)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-gray-500">Accumulated τ</div>
              <div className="font-mono text-lg text-red-400">{fmt(externalObs.accumulatedTime)}</div>
            </div>
          </div>
        </div>

        {/* Infalling Observer */}
        <div className="bg-gray-800 p-3 rounded border border-cyan-900">
          <div className="text-xs text-cyan-400 font-semibold mb-2">Infalling Observer</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-500">k_eff</div>
              <div className="font-mono text-cyan-300">{fmt(infallingObs.kEff)}</div>
            </div>
            <div>
              <div className="text-gray-500">τ rate</div>
              <div className="font-mono text-cyan-300">{fmt2(infallingObs.correlationRate)}</div>
            </div>
            <div>
              <div className="text-gray-500">S_acc</div>
              <div className="font-mono text-cyan-300">{fmt(infallingObs.sAcc)}</div>
            </div>
            <div>
              <div className="text-gray-500">Q (cost)</div>
              <div className="font-mono text-cyan-300">{fmt(infallingObs.qCumulative)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-gray-500">Accumulated τ</div>
              <div className="font-mono text-lg text-cyan-400">{fmt(infallingObs.accumulatedTime)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>At horizon (r=0)</span>
            <span>Far away (r=1)</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="text-center text-xs text-gray-500 mt-1">
            Radius: {fmt2(radius)} | Wall time: {wallTime}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
          >
            {isRunning ? '⏸ Pause' : '▶ Run'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
        <p>
          <strong className="text-cyan-400">Cyan:</strong> Infalling observer (full access).
          <strong className="text-red-400 ml-2">Red:</strong> External observer (fades near horizon).
        </p>
        <p className="mt-2 text-xs text-gray-400">
          <strong>k_eff:</strong> Effective dimension (participation ratio).
          <strong className="ml-2">S_acc:</strong> Accessible entropy (log det C).
          <strong className="ml-2">Q:</strong> Thermodynamic cost of erasure (Landauer).
        </p>
        <p className="mt-2 text-gray-500 text-xs">
          As radius → 0: external k_eff drops, S_acc drops, Q accumulates, τ rate → 0.
          The infalling observer sees none of this—their aperture never closes.
        </p>
      </div>
    </div>
  );
}
