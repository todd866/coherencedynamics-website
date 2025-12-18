'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  className?: string;
}

// -----------------------------------------------------------------------------
// PHYSICS ENGINE
// -----------------------------------------------------------------------------

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
      if (externalCoupling) dtheta[i] += externalCoupling[i];
      dtheta[i] += this.noiseStd * Math.sqrt(this.dt) * (Math.random() - 0.5) * 3.46;
    }
    for (let i = 0; i < this.N; i++) this.theta[i] += dtheta[i] * this.dt;
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
    for (let i = 0; i < this.N; i++) this.omega[i] = other.omega[i];
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

// -----------------------------------------------------------------------------
// VISUALIZER COMPONENT
// -----------------------------------------------------------------------------

export default function CouplingVsMeasurementDemo({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // React State (for UI controls only)
  const [isRunning, setIsRunning] = useState(true);
  const [couplingEnabled, setCouplingEnabled] = useState(true);
  const [similarStructure, setSimilarStructure] = useState(true);
  const [observerBandwidth, setObserverBandwidth] = useState(4);
  const [couplingStrength, setCouplingStrength] = useState(0.8);

  // UI Display State (throttled)
  const [displayStats, setDisplayStats] = useState({
    coherence: 0,
    observerConf: 0,
    step: 0,
    syncStatus: 'Diverged',
    observerStatus: 'Cannot detect',
  });

  // Refs for Simulation Engine (Mutable, no re-renders)
  const engineRef = useRef({
    latticeA: null as KuramotoLattice | null,
    latticeB: null as KuramotoLattice | null,
    latticeC: null as KuramotoLattice | null,
    step: 0,
    coherenceHistory: [] as number[],
    observerHistory: [] as number[],
    smoothedConf: 0,
  });

  // Ref to hold current parameter values for the loop
  const paramsRef = useRef({
    isRunning,
    couplingEnabled,
    observerBandwidth,
    couplingStrength,
    similarStructure
  });

  // Keep paramsRef in sync with state
  useEffect(() => {
    paramsRef.current = {
      isRunning,
      couplingEnabled,
      observerBandwidth,
      couplingStrength,
      similarStructure
    };
  }, [isRunning, couplingEnabled, observerBandwidth, couplingStrength, similarStructure]);

  const animationFrameRef = useRef<number>();

  // Initialization
  const initLattices = useCallback(() => {
    const N = 32, K = 2.0, omegaSpread = 0.1, noiseStd = 0.15, dt = 0.1;
    const A = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);
    const B = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);
    const C = new KuramotoLattice(N, K, omegaSpread, noiseStd, dt);

    if (paramsRef.current.similarStructure) {
      B.copyOmegaFrom(A);
    }

    engineRef.current = {
      latticeA: A,
      latticeB: B,
      latticeC: C,
      step: 0,
      coherenceHistory: [],
      observerHistory: [],
      smoothedConf: 0,
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initLattices();
  }, [initLattices]);

  // Main Render Loop
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { latticeA, latticeB, latticeC } = engineRef.current;
    if (!latticeA || !latticeB || !latticeC) return;

    const params = paramsRef.current;
    const W = canvas.width;
    const H = canvas.height;

    // --- PHYSICS STEP ---
    if (params.isRunning) {
      if (params.couplingEnabled) {
        const couplingAtoB = new Float64Array(latticeA.N);
        for (let i = 0; i < latticeA.N; i++) {
          couplingAtoB[i] = params.couplingStrength * Math.sin(latticeA.theta[i] - latticeB.theta[i]);
        }
        latticeA.step();
        latticeB.step(couplingAtoB);
      } else {
        latticeA.step();
        latticeB.step();
      }
      latticeC.step();
      engineRef.current.step++;

      // Metrics
      const coherence = crossCoherence(latticeA, latticeB);

      // Observer Logic
      const modesA = latticeA.getFourierModes(params.observerBandwidth);
      const modesB = latticeB.getFourierModes(params.observerBandwidth);
      const modesC = latticeC.getFourierModes(params.observerBandwidth);

      let distAB = 0, distAC = 0;
      for (let k = 0; k < params.observerBandwidth; k++) {
        distAB += (modesA[k] - modesB[k]) ** 2;
        distAC += (modesA[k] - modesC[k]) ** 2;
      }
      distAB = Math.sqrt(distAB);
      distAC = Math.sqrt(distAC);

      const rawSignal = distAC / (distAB + distAC + 0.01);
      const integrationRate = 0.01 + (params.observerBandwidth / 16) * 0.04;

      engineRef.current.smoothedConf = (1 - integrationRate) * engineRef.current.smoothedConf + integrationRate * rawSignal;
      const observerConf = engineRef.current.smoothedConf;

      // History Buffers
      const { coherenceHistory, observerHistory } = engineRef.current;
      coherenceHistory.push(coherence);
      observerHistory.push(observerConf);
      if (coherenceHistory.length > 400) {
        coherenceHistory.shift();
        observerHistory.shift();
      }

      // Throttle React State Updates (Every 5 frames)
      if (engineRef.current.step % 5 === 0) {
        const syncThreshold = 0.7;
        const detectThreshold = 0.5;
        let observerStatus = 'Cannot detect';
        if (observerConf > detectThreshold) observerStatus = 'Detecting coupling';
        else if (coherence > syncThreshold) observerStatus = 'BLIND SPOT';

        setDisplayStats({
          coherence,
          observerConf,
          step: engineRef.current.step,
          syncStatus: coherence > syncThreshold ? 'Synchronized' : 'Diverged',
          observerStatus,
        });
      }
    }

    // --- DRAWING ---
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // 1. Draw Oscillators (Rings)
    const drawLattice = (lat: KuramotoLattice, cx: number, cy: number, label: string) => {
      const R = 60;
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy - R - 15);

      for (let i = 0; i < lat.N; i++) {
        const angle = (2 * Math.PI * i) / lat.N - Math.PI / 2;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        const hue = ((lat.theta[i] % (2 * Math.PI)) / (2 * Math.PI)) * 360;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fill();
      }
    };

    drawLattice(latticeA, W * 0.25, 100, 'System A');
    drawLattice(latticeB, W * 0.75, 100, 'System B');

    // Coupling Line
    if (paramsRef.current.couplingEnabled) {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + displayStats.coherence * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(W * 0.25 + 70, 100);
      ctx.lineTo(W * 0.75 - 70, 100);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '10px monospace';
      ctx.fillText('A → B', W / 2, 92);
    }

    // 2. Draw Oscilloscope (Time Series)
    const plotX = 20, plotY = 200, plotW = W - 40, plotH = 120;

    ctx.fillStyle = '#111';
    ctx.fillRect(plotX, plotY, plotW, plotH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    const { coherenceHistory, observerHistory } = engineRef.current;

    // Find crossing points for highlighting
    let tSync = -1, tMeas = -1;
    for (let i = 0; i < coherenceHistory.length; i++) {
      if (tSync < 0 && coherenceHistory[i] > 0.7) tSync = i;
      if (tMeas < 0 && observerHistory[i] > 0.5) tMeas = i;
    }

    // Red Blind Spot Highlight
    if (tSync >= 0 && tMeas > tSync) {
      const x1 = plotX + (tSync / 400) * plotW;
      const x2 = plotX + (tMeas / 400) * plotW;
      const gradient = ctx.createLinearGradient(x1, plotY, x2, plotY);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x1, plotY, x2 - x1, plotH);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`BLIND: ${tMeas - tSync} steps`, (x1 + x2) / 2, plotY + 20);
    }

    // Thresholds
    const ySync = plotY + plotH * 0.3;
    const yDet = plotY + plotH * 0.5;

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#22c55e44';
    ctx.beginPath();
    ctx.moveTo(plotX, ySync);
    ctx.lineTo(plotX + plotW, ySync);
    ctx.stroke();
    ctx.strokeStyle = '#f9731644';
    ctx.beginPath();
    ctx.moveTo(plotX, yDet);
    ctx.lineTo(plotX + plotW, yDet);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Lines
    const drawLine = (data: number[], color: string) => {
      if (data.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < data.length; i++) {
        const x = plotX + (i / 400) * plotW;
        const y = plotY + plotH * (1 - data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawLine(coherenceHistory, '#22c55e');
    drawLine(observerHistory, '#f97316');

    // Legend
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Sync', plotX + plotW - 35, plotY + 15);
    ctx.fillStyle = '#f97316';
    ctx.fillText('Obs', plotX + plotW - 35, plotY + 28);

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [displayStats.coherence]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [renderLoop]);

  const handleReset = () => {
    initLattices();
    setDisplayStats({ coherence: 0, observerConf: 0, step: 0, syncStatus: 'Diverged', observerStatus: 'Cannot detect' });
  };

  const handleStructureToggle = (val: boolean) => {
    setSimilarStructure(val);
    setTimeout(handleReset, 0);
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      <canvas ref={canvasRef} width={500} height={340} className="bg-gray-900 rounded-lg" />

      <div className="w-full lg:w-64 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 px-3 py-2 rounded text-sm ${isRunning ? 'bg-yellow-600' : 'bg-green-600'} text-white`}>
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button onClick={handleReset} className="flex-1 px-3 py-2 rounded text-sm bg-gray-700 text-white hover:bg-gray-600">
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setCouplingEnabled(true)}
            className={`flex-1 px-3 py-2 rounded text-sm ${couplingEnabled ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Coupled
          </button>
          <button onClick={() => setCouplingEnabled(false)}
            className={`flex-1 px-3 py-2 rounded text-sm ${!couplingEnabled ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Uncoupled
          </button>
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase mb-2">Structure</label>
          <div className="flex gap-2">
            <button onClick={() => handleStructureToggle(true)}
              className={`flex-1 px-2 py-1 text-xs rounded ${similarStructure ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              Similar (Fast)
            </button>
            <button onClick={() => handleStructureToggle(false)}
              className={`flex-1 px-2 py-1 text-xs rounded ${!similarStructure ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              Mismatch (Slow)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Coupling: <span className="text-white">{couplingStrength.toFixed(1)}</span>
          </label>
          <input type="range" min={0.1} max={1.5} step={0.1} value={couplingStrength}
            onChange={(e) => setCouplingStrength(parseFloat(e.target.value))} className="w-full accent-blue-600" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Observer k: <span className="text-white">{observerBandwidth}</span>
          </label>
          <input type="range" min={1} max={16} step={1} value={observerBandwidth}
            onChange={(e) => setObserverBandwidth(parseInt(e.target.value))} className="w-full accent-blue-600" />
        </div>

        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Step</span>
            <span className="text-white">{displayStats.step}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sync r</span>
            <span className="text-green-400">{displayStats.coherence.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Observer</span>
            <span className="text-orange-400">{displayStats.observerConf.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={
              displayStats.observerStatus === 'BLIND SPOT'
                ? 'text-red-400 font-bold'
                : displayStats.observerStatus === 'Detecting coupling'
                  ? 'text-orange-400'
                  : 'text-gray-400'
            }>
              {displayStats.observerStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
