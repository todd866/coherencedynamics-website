'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  className?: string;
}

// Kuramoto oscillator lattice
class KuramotoLattice {
  N: number;
  theta: Float64Array;
  omega: Float64Array;
  K: number;
  dt: number;
  noiseStd: number;
  private _buffer: Float64Array; // Pre-allocated for performance

  constructor(N: number, K: number, omegaSpread: number, noiseStd: number, dt: number) {
    this.N = N;
    this.K = K;
    this.dt = dt;
    this.noiseStd = noiseStd;
    this.theta = new Float64Array(N);
    this.omega = new Float64Array(N);
    this._buffer = new Float64Array(N);

    // Random initial phases and shared frequencies
    for (let i = 0; i < N; i++) {
      this.theta[i] = Math.random() * 2 * Math.PI;
      this.omega[i] = omegaSpread * (Math.random() - 0.5) * 2;
    }
  }

  step(externalCoupling?: Float64Array) {
    const dtheta = this._buffer; // Reuse pre-allocated buffer

    for (let i = 0; i < this.N; i++) {
      // Natural frequency
      dtheta[i] = this.omega[i];

      // Nearest-neighbor coupling (ring topology)
      const left = (i - 1 + this.N) % this.N;
      const right = (i + 1) % this.N;
      dtheta[i] += (this.K / 2) * (
        Math.sin(this.theta[left] - this.theta[i]) +
        Math.sin(this.theta[right] - this.theta[i])
      );

      // External coupling from other lattice
      if (externalCoupling) {
        dtheta[i] += externalCoupling[i];
      }

      // Noise
      dtheta[i] += this.noiseStd * Math.sqrt(this.dt) * (Math.random() - 0.5) * 2 * 1.73;
    }

    // Euler step
    for (let i = 0; i < this.N; i++) {
      this.theta[i] += dtheta[i] * this.dt;
    }
  }

  // Get low-k Fourier mode magnitudes (what observer sees)
  getFourierModes(kMax: number): number[] {
    const modes: number[] = [];
    for (let k = 0; k < kMax; k++) {
      let re = 0, im = 0;
      for (let i = 0; i < this.N; i++) {
        const phase = (2 * Math.PI * k * i) / this.N;
        re += Math.cos(this.theta[i]) * Math.cos(phase) - Math.sin(this.theta[i]) * Math.sin(phase);
        im += Math.cos(this.theta[i]) * Math.sin(phase) + Math.sin(this.theta[i]) * Math.cos(phase);
      }
      modes.push(Math.sqrt(re * re + im * im) / this.N);
    }
    return modes;
  }

  copyOmegaFrom(other: KuramotoLattice) {
    for (let i = 0; i < this.N; i++) {
      this.omega[i] = other.omega[i];
    }
  }
}

// Compute cross-coherence r_AB
function crossCoherence(A: KuramotoLattice, B: KuramotoLattice): number {
  let re = 0, im = 0;
  for (let i = 0; i < A.N; i++) {
    const diff = A.theta[i] - B.theta[i];
    re += Math.cos(diff);
    im += Math.sin(diff);
  }
  return Math.sqrt(re * re + im * im) / A.N;
}


export default function CouplingVsMeasurementDemo({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [couplingEnabled, setCouplingEnabled] = useState(true);
  const [similarStructure, setSimilarStructure] = useState(true); // Paper mode: shared omegas
  const [observerBandwidth, setObserverBandwidth] = useState(4);
  const [couplingStrength, setCouplingStrength] = useState(0.8);
  const [stats, setStats] = useState({
    coherence: 0,
    observerConf: 0,
    step: 0,
    syncStatus: 'Diverged',
    observerStatus: 'Cannot detect',
  });

  const stateRef = useRef<{
    latticeA: KuramotoLattice | null;
    latticeB: KuramotoLattice | null;
    latticeC: KuramotoLattice | null; // Uncoupled control
    step: number;
    coherenceHistory: number[];
    observerHistory: number[];
    smoothedConf: number; // Integration lag for observer (simulates T_meas)
  }>({
    latticeA: null,
    latticeB: null,
    latticeC: null,
    step: 0,
    coherenceHistory: [],
    observerHistory: [],
    smoothedConf: 0,
  });

  const animationRef = useRef<number>();

  // Initialize lattices
  const initLattices = useCallback(() => {
    const N = 32;
    const K = 2.0;
    const omegaSpread = 0.1;  // Natural frequency spread
    const noiseStd = 0.15;    // Noise level
    const dt = 0.1;

    const A = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);
    const B = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);
    const C = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);

    if (similarStructure) {
      // Paper mode: A and B share natural frequencies (structural similarity)
      // This enables fast synchronization via coupling
      // C has different frequencies (gives observer a distinguishable baseline)
      B.copyOmegaFrom(A);
      // C keeps its own random omegas - observer can tell it's different
    }
    // else: all have independent frequencies (harder for everyone)

    stateRef.current = {
      latticeA: A,
      latticeB: B,
      latticeC: C,
      step: 0,
      coherenceHistory: [],
      observerHistory: [],
      smoothedConf: 0,
    };
  }, [similarStructure]);

  useEffect(() => {
    initLattices();
  }, [initLattices]);

  const reset = useCallback(() => {
    initLattices();
    setStats({
      coherence: 0,
      observerConf: 0,
      step: 0,
      syncStatus: 'Diverged',
      observerStatus: 'Cannot detect',
    });
  }, [initLattices]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state.latticeA || !state.latticeB || !state.latticeC) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Simulation step
    if (isRunning) {
      const { latticeA, latticeB, latticeC } = state;
      const epsilon = couplingStrength;

      // Unidirectional coupling: A evolves autonomously, B is driven by A
      // This matches the paper's conditional Lyapunov exponent framing
      if (couplingEnabled) {
        const couplingAtoB = new Float64Array(latticeA.N);
        for (let i = 0; i < latticeA.N; i++) {
          couplingAtoB[i] = epsilon * Math.sin(latticeA.theta[i] - latticeB.theta[i]);
        }
        latticeA.step(); // A evolves autonomously (driver)
        latticeB.step(couplingAtoB); // B is driven by A (response)
      } else {
        latticeA.step();
        latticeB.step();
      }
      latticeC.step(); // Control always uncoupled

      state.step++;

      // Compute metrics
      const coherence = crossCoherence(latticeA, latticeB);

      // Observer: bandwidth-limited Fourier measurement (NOT the oracle)
      // The observer sees only low-k Fourier MAGNITUDES, not phases
      const modesA = latticeA.getFourierModes(observerBandwidth);
      const modesB = latticeB.getFourierModes(observerBandwidth);
      const modesC = latticeC.getFourierModes(observerBandwidth);

      // Compute Fourier magnitude distances
      let distAB = 0, distAC = 0;
      for (let k = 0; k < observerBandwidth; k++) {
        distAB += (modesA[k] - modesB[k]) ** 2;
        distAC += (modesA[k] - modesC[k]) ** 2;
      }
      distAB = Math.sqrt(distAB);
      distAC = Math.sqrt(distAC);

      // Raw evidence: is B closer to A than C is?
      // When coupled and synced, A-B distance shrinks
      const rawSignal = distAC / (distAB + distAC + 0.01);

      // Integration rate scales with bandwidth (more modes = faster inference)
      // But keep it slow enough to show the lag
      const integrationRate = 0.01 + (observerBandwidth / 16) * 0.04; // 0.01 to 0.05
      state.smoothedConf = (1 - integrationRate) * state.smoothedConf + integrationRate * rawSignal;
      const observerConf = state.smoothedConf;

      // Store history
      state.coherenceHistory.push(coherence);
      state.observerHistory.push(observerConf);
      if (state.coherenceHistory.length > 400) {
        state.coherenceHistory.shift();
        state.observerHistory.shift();
      }

      // Determine status
      const syncThreshold = 0.7;
      const detectThreshold = 0.5;
      const syncStatus = coherence > syncThreshold ? 'Synchronized' : 'Diverged';
      let observerStatus: string;
      if (observerConf > detectThreshold) {
        observerStatus = 'Detecting coupling';
      } else if (coherence > syncThreshold) {
        observerStatus = 'BLIND SPOT';
      } else {
        observerStatus = 'Cannot detect';
      }

      setStats({
        coherence,
        observerConf,
        step: state.step,
        syncStatus,
        observerStatus,
      });
    }

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    const { latticeA, latticeB, coherenceHistory, observerHistory } = state;

    // Draw lattice rings
    const ringRadius = 60;
    const ringCenterY = 100;
    const latticeAx = W * 0.25;
    const latticeBx = W * 0.75;

    // Phase to color (HSL)
    const phaseToColor = (phase: number, saturation = 70, lightness = 50) => {
      const hue = ((phase % (2 * Math.PI)) / (2 * Math.PI)) * 360;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Draw lattice A
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('System A', latticeAx, ringCenterY - ringRadius - 15);

    for (let i = 0; i < latticeA!.N; i++) {
      const angle = (2 * Math.PI * i) / latticeA!.N - Math.PI / 2;
      const x = latticeAx + Math.cos(angle) * ringRadius;
      const y = ringCenterY + Math.sin(angle) * ringRadius;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = phaseToColor(latticeA!.theta[i]);
      ctx.fill();
    }

    // Draw lattice B
    ctx.fillStyle = '#666';
    ctx.fillText('System B', latticeBx, ringCenterY - ringRadius - 15);

    for (let i = 0; i < latticeB!.N; i++) {
      const angle = (2 * Math.PI * i) / latticeB!.N - Math.PI / 2;
      const x = latticeBx + Math.cos(angle) * ringRadius;
      const y = ringCenterY + Math.sin(angle) * ringRadius;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = phaseToColor(latticeB!.theta[i]);
      ctx.fill();
    }

    // Draw coupling indicator
    if (couplingEnabled) {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + stats.coherence * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(latticeAx + ringRadius + 10, ringCenterY);
      ctx.lineTo(latticeBx - ringRadius - 10, ringCenterY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#3b82f6';
      ctx.font = '10px monospace';
      ctx.fillText('A → B', W / 2, ringCenterY - 8);
    }

    // Draw time series plot
    const plotY = 200;
    const plotH = 120;
    const plotW = W - 40;
    const plotX = 20;

    // Plot background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(plotX, plotY, plotW, plotH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // Find first crossing points
    const histLen = coherenceHistory.length;
    let tSync = -1; // First time coherence > 0.7
    let tMeas = -1; // First time observer > 0.5
    for (let i = 0; i < histLen; i++) {
      if (tSync < 0 && coherenceHistory[i] > 0.7) tSync = i;
      if (tMeas < 0 && observerHistory[i] > 0.5) tMeas = i;
    }

    // Highlight blind spot region FIRST (so lines draw on top)
    if (tSync >= 0 && tMeas > tSync) {
      const x1 = plotX + (tSync / 400) * plotW;
      const x2 = plotX + (tMeas / 400) * plotW;
      // Red gradient fill
      const gradient = ctx.createLinearGradient(x1, plotY, x2, plotY);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x1, plotY, x2 - x1, plotH);
    }

    // Threshold lines
    const syncThreshY = plotY + plotH * (1 - 0.7);
    const detectThreshY = plotY + plotH * (1 - 0.5);

    // Sync threshold (green, dashed)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX, syncThreshY);
    ctx.lineTo(plotX + plotW, syncThreshY);
    ctx.stroke();

    // Detection threshold (orange, dashed)
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
    ctx.beginPath();
    ctx.moveTo(plotX, detectThreshY);
    ctx.lineTo(plotX + plotW, detectThreshY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('0.7', plotX - 4, syncThreshY + 3);
    ctx.fillStyle = '#f97316';
    ctx.fillText('0.5', plotX - 4, detectThreshY + 3);

    // Plot coherence history (green line)
    if (coherenceHistory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < coherenceHistory.length; i++) {
        const x = plotX + (i / 400) * plotW;
        const y = plotY + plotH * (1 - coherenceHistory[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Plot observer confidence (orange line)
    if (observerHistory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < observerHistory.length; i++) {
        const x = plotX + (i / 400) * plotW;
        const y = plotY + plotH * (1 - observerHistory[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw T_sync marker (vertical green line)
    if (tSync >= 0) {
      const xSync = plotX + (tSync / 400) * plotW;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(xSync, plotY);
      ctx.lineTo(xSync, plotY + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('T_sync', xSync, plotY + plotH + 12);
    }

    // Draw T_meas marker (vertical orange line)
    if (tMeas >= 0) {
      const xMeas = plotX + (tMeas / 400) * plotW;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(xMeas, plotY);
      ctx.lineTo(xMeas, plotY + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('T_meas', xMeas, plotY + plotH + 12);
    }

    // Show the gap annotation
    if (tSync >= 0 && tMeas > tSync) {
      const xSync = plotX + (tSync / 400) * plotW;
      const xMeas = plotX + (tMeas / 400) * plotW;
      const midX = (xSync + xMeas) / 2;

      // Bracket showing the gap
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xSync, plotY + 15);
      ctx.lineTo(xSync, plotY + 8);
      ctx.lineTo(xMeas, plotY + 8);
      ctx.lineTo(xMeas, plotY + 15);
      ctx.stroke();

      // Gap label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      const gap = tMeas - tSync;
      ctx.fillText('BLIND: ' + gap + ' steps', midX, plotY + 28);
    }

    // Legend (top right)
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(plotX + plotW - 95, plotY + 8, 8, 8);
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Sync', plotX + plotW - 83, plotY + 15);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(plotX + plotW - 95, plotY + 20, 8, 8);
    ctx.fillStyle = '#666';
    ctx.fillText('Observer', plotX + plotW - 83, plotY + 27);

    animationRef.current = requestAnimationFrame(render);
  }, [isRunning, couplingEnabled, observerBandwidth, couplingStrength, stats.coherence]);

  useEffect(() => {
    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      <canvas
        ref={canvasRef}
        width={500}
        height={340}
        className="bg-gray-900 rounded-lg"
      />

      <div className="w-full lg:w-64 space-y-4">
        {/* Play/Pause and Reset */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 px-3 py-2 rounded text-sm ${
              isRunning
                ? 'bg-yellow-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="flex-1 px-3 py-2 rounded text-sm bg-gray-700 text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Coupling toggle */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Cross-System Coupling
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setCouplingEnabled(true)}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                couplingEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Coupled
            </button>
            <button
              onClick={() => setCouplingEnabled(false)}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                !couplingEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Uncoupled
            </button>
          </div>
        </div>

        {/* Structural similarity toggle */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Structural Similarity
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => { setSimilarStructure(true); initLattices(); }}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                similarStructure
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Similar
            </button>
            <button
              onClick={() => { setSimilarStructure(false); initLattices(); }}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                !similarStructure
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Mismatched
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {similarStructure ? 'A & B share ω (paper mode)' : 'A & B have different ω'}
          </p>
        </div>

        {/* Observer bandwidth slider */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Observer Bandwidth (k): <span className="text-white">{observerBandwidth}</span>
          </label>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={observerBandwidth}
            onChange={(e) => setObserverBandwidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-gray-600 mt-1">
            More modes = faster detection
          </p>
        </div>

        {/* Coupling strength slider */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Coupling Strength (ε): <span className="text-white">{couplingStrength.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={1.2}
            step={0.05}
            value={couplingStrength}
            onChange={(e) => setCouplingStrength(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Step</span>
            <span className="text-white">{stats.step}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Coherence r<sub>AB</sub></span>
            <span className={stats.coherence > 0.7 ? 'text-green-400' : 'text-gray-400'}>
              {stats.coherence.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sync Status</span>
            <span className={stats.syncStatus === 'Synchronized' ? 'text-green-400' : 'text-gray-400'}>
              {stats.syncStatus}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Observer</span>
            <span className={
              stats.observerStatus === 'BLIND SPOT'
                ? 'text-red-400 font-bold'
                : stats.observerStatus === 'Detecting coupling'
                  ? 'text-orange-400'
                  : 'text-gray-400'
            }>
              {stats.observerStatus}
            </span>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-gray-800/50 border-l-2 border-blue-600 rounded-r-lg p-3">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-green-400">Green line</span>: Systems synchronize via coupling (fast).
            <br />
            <span className="text-orange-400">Orange line</span>: Observer&apos;s ability to detect coupling (slow).
            <br />
            <span className="text-red-400">Red zone</span>: Blind spot where sync has occurred but observer can&apos;t detect it.
          </p>
        </div>
      </div>
    </div>
  );
}
