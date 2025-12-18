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
  private _buffer: Float64Array;

  constructor(N: number, K: number, omegaSpread: number, noiseStd: number, dt: number) {
    this.N = N;
    this.K = K;
    this.dt = dt;
    this.noiseStd = noiseStd;
    this.theta = new Float64Array(N);
    this.omega = new Float64Array(N);
    this._buffer = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      this.theta[i] = Math.random() * 2 * Math.PI;
      this.omega[i] = omegaSpread * (Math.random() - 0.5) * 2;
    }
  }

  step(externalCoupling?: Float64Array) {
    const dtheta = this._buffer;

    for (let i = 0; i < this.N; i++) {
      dtheta[i] = this.omega[i];
      const left = (i - 1 + this.N) % this.N;
      const right = (i + 1) % this.N;
      dtheta[i] += (this.K / 2) * (
        Math.sin(this.theta[left] - this.theta[i]) +
        Math.sin(this.theta[right] - this.theta[i])
      );
      if (externalCoupling) {
        dtheta[i] += externalCoupling[i];
      }
      dtheta[i] += this.noiseStd * Math.sqrt(this.dt) * (Math.random() - 0.5) * 2 * 1.73;
    }

    for (let i = 0; i < this.N; i++) {
      this.theta[i] += dtheta[i] * this.dt;
    }
  }

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
  const [couplingStrength, setCouplingStrength] = useState(0.8);
  const [observerBandwidth, setObserverBandwidth] = useState(4);
  const [stats, setStats] = useState({
    step: 0,
    coherence: 0,
    observerConf: 0,
    tSync: -1,
    tMeas: -1,
    inBlindSpot: false,
  });

  const stateRef = useRef<{
    latticeA: KuramotoLattice | null;
    latticeB: KuramotoLattice | null;
    latticeC: KuramotoLattice | null;
    step: number;
    smoothedConf: number;
    tSync: number;
    tMeas: number;
  }>({
    latticeA: null,
    latticeB: null,
    latticeC: null,
    step: 0,
    smoothedConf: 0,
    tSync: -1,
    tMeas: -1,
  });

  const animationRef = useRef<number>();

  const initLattices = useCallback(() => {
    const N = 32;
    const K = 2.0;
    const omegaSpread = 0.1;
    const noiseStd = 0.15;
    const dt = 0.1;

    const A = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);
    const B = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);
    const C = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);

    // A and B share structure (enables fast sync)
    // C is different (baseline for observer)
    B.copyOmegaFrom(A);

    stateRef.current = {
      latticeA: A,
      latticeB: B,
      latticeC: C,
      step: 0,
      smoothedConf: 0,
      tSync: -1,
      tMeas: -1,
    };
  }, []);

  useEffect(() => {
    initLattices();
  }, [initLattices]);

  const reset = useCallback(() => {
    initLattices();
    setStats({
      step: 0,
      coherence: 0,
      observerConf: 0,
      tSync: -1,
      tMeas: -1,
      inBlindSpot: false,
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

      if (couplingEnabled) {
        const couplingAtoB = new Float64Array(latticeA.N);
        for (let i = 0; i < latticeA.N; i++) {
          couplingAtoB[i] = epsilon * Math.sin(latticeA.theta[i] - latticeB.theta[i]);
        }
        latticeA.step();
        latticeB.step(couplingAtoB);
      } else {
        latticeA.step();
        latticeB.step();
      }
      latticeC.step();

      state.step++;

      // Compute coherence (ground truth)
      const coherence = crossCoherence(latticeA, latticeB);

      // Observer: Fourier magnitude distance
      const modesA = latticeA.getFourierModes(observerBandwidth);
      const modesB = latticeB.getFourierModes(observerBandwidth);
      const modesC = latticeC.getFourierModes(observerBandwidth);

      let distAB = 0, distAC = 0;
      for (let k = 0; k < observerBandwidth; k++) {
        distAB += (modesA[k] - modesB[k]) ** 2;
        distAC += (modesA[k] - modesC[k]) ** 2;
      }
      distAB = Math.sqrt(distAB);
      distAC = Math.sqrt(distAC);

      const rawSignal = distAC / (distAB + distAC + 0.01);
      const integrationRate = 0.01 + (observerBandwidth / 16) * 0.04;
      state.smoothedConf = (1 - integrationRate) * state.smoothedConf + integrationRate * rawSignal;

      // Track first crossing times
      if (state.tSync < 0 && coherence > 0.7) {
        state.tSync = state.step;
      }
      if (state.tMeas < 0 && state.smoothedConf > 0.5) {
        state.tMeas = state.step;
      }

      const inBlindSpot = coherence > 0.7 && state.smoothedConf < 0.5;

      setStats({
        step: state.step,
        coherence,
        observerConf: state.smoothedConf,
        tSync: state.tSync,
        tMeas: state.tMeas,
        inBlindSpot,
      });
    }

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    const { latticeA, latticeB } = state;

    // Draw lattice rings
    const ringRadius = 70;
    const ringCenterY = H / 2;
    const latticeAx = W * 0.25;
    const latticeBx = W * 0.75;

    const phaseToColor = (phase: number) => {
      const hue = ((phase % (2 * Math.PI)) / (2 * Math.PI)) * 360;
      return `hsl(${hue}, 70%, 50%)`;
    };

    // System A
    ctx.fillStyle = '#888';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('System A', latticeAx, ringCenterY - ringRadius - 20);
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.fillText('(driver)', latticeAx, ringCenterY - ringRadius - 6);

    for (let i = 0; i < latticeA!.N; i++) {
      const angle = (2 * Math.PI * i) / latticeA!.N - Math.PI / 2;
      const x = latticeAx + Math.cos(angle) * ringRadius;
      const y = ringCenterY + Math.sin(angle) * ringRadius;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = phaseToColor(latticeA!.theta[i]);
      ctx.fill();
    }

    // System B
    ctx.fillStyle = '#888';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('System B', latticeBx, ringCenterY - ringRadius - 20);
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.fillText('(response)', latticeBx, ringCenterY - ringRadius - 6);

    for (let i = 0; i < latticeB!.N; i++) {
      const angle = (2 * Math.PI * i) / latticeB!.N - Math.PI / 2;
      const x = latticeBx + Math.cos(angle) * ringRadius;
      const y = ringCenterY + Math.sin(angle) * ringRadius;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = phaseToColor(latticeB!.theta[i]);
      ctx.fill();
    }

    // Coupling arrow
    if (couplingEnabled) {
      const arrowY = ringCenterY;
      const arrowStartX = latticeAx + ringRadius + 15;
      const arrowEndX = latticeBx - ringRadius - 15;

      ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 + stats.coherence * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(arrowEndX - 10, arrowY);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = `rgba(59, 130, 246, ${0.4 + stats.coherence * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowY);
      ctx.lineTo(arrowEndX - 12, arrowY - 6);
      ctx.lineTo(arrowEndX - 12, arrowY + 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3b82f6';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('coupling', (arrowStartX + arrowEndX) / 2, arrowY - 12);
    }

    animationRef.current = requestAnimationFrame(render);
  }, [isRunning, couplingEnabled, couplingStrength, observerBandwidth, stats.coherence]);

  useEffect(() => {
    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  const blindGap = stats.tSync >= 0 && stats.tMeas > stats.tSync ? stats.tMeas - stats.tSync : null;

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      <canvas
        ref={canvasRef}
        width={450}
        height={220}
        className="bg-gray-900 rounded-lg"
      />

      <div className="w-full lg:w-72 space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
              isRunning ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="flex-1 px-3 py-2 rounded text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Coupling toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setCouplingEnabled(true)}
            className={`flex-1 px-3 py-2 rounded text-sm ${
              couplingEnabled ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Coupled
          </button>
          <button
            onClick={() => setCouplingEnabled(false)}
            className={`flex-1 px-3 py-2 rounded text-sm ${
              !couplingEnabled ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Uncoupled
          </button>
        </div>

        {/* Sliders */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Coupling Strength: <span className="text-white">{couplingStrength.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={1.2}
            step={0.1}
            value={couplingStrength}
            onChange={(e) => setCouplingStrength(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Observer Bandwidth: <span className="text-white">{observerBandwidth}</span>
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
        </div>

        {/* Key metrics */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Timescales</div>

          <div className="flex justify-between items-center">
            <span className="text-green-400 font-mono text-sm">T_sync</span>
            <span className="text-white font-mono">
              {stats.tSync >= 0 ? `${stats.tSync} steps` : '—'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-orange-400 font-mono text-sm">T_meas</span>
            <span className="text-white font-mono">
              {stats.tMeas >= 0 ? `${stats.tMeas} steps` : '—'}
            </span>
          </div>

          {blindGap !== null && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-red-400 font-mono text-sm">Blind gap</span>
              <span className="text-red-400 font-mono font-bold">{blindGap} steps</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className={`rounded-lg p-4 text-center ${
          stats.inBlindSpot
            ? 'bg-red-900/50 border border-red-500'
            : stats.coherence > 0.7
              ? 'bg-green-900/30 border border-green-600'
              : 'bg-gray-800'
        }`}>
          {stats.inBlindSpot ? (
            <>
              <div className="text-red-400 font-bold text-lg">BLIND SPOT</div>
              <div className="text-red-300 text-xs mt-1">Synced but observer can&apos;t tell</div>
            </>
          ) : stats.coherence > 0.7 ? (
            <>
              <div className="text-green-400 font-bold">SYNCHRONIZED</div>
              <div className="text-green-300 text-xs mt-1">r = {stats.coherence.toFixed(2)}</div>
            </>
          ) : (
            <>
              <div className="text-gray-400">Diverged</div>
              <div className="text-gray-500 text-xs mt-1">r = {stats.coherence.toFixed(2)}</div>
            </>
          )}
        </div>

        {/* Step counter */}
        <div className="text-center text-gray-600 text-xs">
          Step {stats.step}
        </div>
      </div>
    </div>
  );
}
