'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface AminoAcid {
  x: number;
  y: number;
  // Hidden dimensions (not visible but affect dynamics)
  hiddenState: number[];
}

interface Measurement {
  id: number;
  time: number;
  foldedness: number;
  verdict: 'folded' | 'unfolded' | 'ambiguous';
  disturbance: number;
}

const NUM_RESIDUES = 20;
const HIDDEN_DIMENSIONS = 50; // Each residue has 50 hidden DOF
const TOTAL_DOF = NUM_RESIDUES * (2 + HIDDEN_DIMENSIONS); // 2 visible + 50 hidden per residue

export default function ProteinObserver() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [residues, setResidues] = useState<AminoAcid[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [foldedness, setFoldedness] = useState(0);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [totalDisturbance, setTotalDisturbance] = useState(0);
  const [hypothesis, setHypothesis] = useState<'folded' | 'unfolded' | null>(null);
  const [hypothesisConfidence, setHypothesisConfidence] = useState(0);
  const measurementIdRef = useRef(0);

  // Initialize protein
  useEffect(() => {
    const initial: AminoAcid[] = [];
    for (let i = 0; i < NUM_RESIDUES; i++) {
      initial.push({
        x: 200 + i * 15,
        y: 150 + Math.sin(i * 0.5) * 30,
        hiddenState: Array(HIDDEN_DIMENSIONS).fill(0).map(() => Math.random() * 2 - 1),
      });
    }
    setResidues(initial);
  }, []);

  // Calculate foldedness (how compact the structure is)
  const calculateFoldedness = useCallback((res: AminoAcid[]) => {
    if (res.length < 2) return 0;

    // Calculate radius of gyration
    const cx = res.reduce((s, r) => s + r.x, 0) / res.length;
    const cy = res.reduce((s, r) => s + r.y, 0) / res.length;
    const rg = Math.sqrt(res.reduce((s, r) => s + (r.x - cx) ** 2 + (r.y - cy) ** 2, 0) / res.length);

    // Also factor in hidden state coherence
    const hiddenCoherence = res.reduce((sum, r) => {
      const magnitude = Math.sqrt(r.hiddenState.reduce((s, h) => s + h * h, 0));
      return sum + magnitude;
    }, 0) / res.length;

    // Lower radius = more folded, higher coherence = more structured
    const maxRg = 150;
    const normalizedRg = 1 - Math.min(rg / maxRg, 1);
    const normalizedCoherence = hiddenCoherence / Math.sqrt(HIDDEN_DIMENSIONS);

    return (normalizedRg * 0.6 + normalizedCoherence * 0.4);
  }, []);

  // Protein dynamics - continuous evolution
  useEffect(() => {
    if (!isRunning || residues.length === 0) return;

    const interval = setInterval(() => {
      setResidues(prev => {
        const newRes = prev.map((r, i) => {
          // Visible dimensions evolve
          const neighbors = [prev[i - 1], prev[i + 1]].filter(Boolean);
          let fx = 0, fy = 0;

          // Spring forces to neighbors
          neighbors.forEach(n => {
            const dx = n.x - r.x;
            const dy = n.y - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const targetDist = 15;
            const force = (dist - targetDist) * 0.1;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          });

          // Hydrophobic collapse tendency (towards center)
          const cx = prev.reduce((s, p) => s + p.x, 0) / prev.length;
          const cy = prev.reduce((s, p) => s + p.y, 0) / prev.length;
          fx += (cx - r.x) * 0.01;
          fy += (cy - r.y) * 0.01;

          // Random thermal motion
          fx += (Math.random() - 0.5) * 2;
          fy += (Math.random() - 0.5) * 2;

          // Hidden dimensions evolve independently (coupled oscillators)
          const newHidden = r.hiddenState.map((h, j) => {
            const coupling = neighbors.reduce((sum, n) => sum + (n?.hiddenState[j] || 0) * 0.1, 0);
            return h * 0.99 + coupling + (Math.random() - 0.5) * 0.1;
          });

          return {
            x: r.x + fx,
            y: r.y + fy,
            hiddenState: newHidden,
          };
        });

        setFoldedness(calculateFoldedness(newRes));
        return newRes;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, residues.length, calculateFoldedness]);

  // Draw protein
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || residues.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw backbone
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    residues.forEach((r, i) => {
      if (i === 0) ctx.moveTo(r.x, r.y);
      else ctx.lineTo(r.x, r.y);
    });
    ctx.stroke();

    // Draw residues with color based on hidden state
    residues.forEach((r, i) => {
      const hiddenMagnitude = Math.sqrt(r.hiddenState.reduce((s, h) => s + h * h, 0));
      const hue = (hiddenMagnitude * 30) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Residue number
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), r.x, r.y + 3);
    });

    // Draw "hidden dimension" indicator
    ctx.fillStyle = '#333';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Hidden state (${HIDDEN_DIMENSIONS}D per residue):`, 10, 290);

    // Visualize first few hidden dimensions as a heatmap
    const heatmapWidth = 380;
    const heatmapHeight = 20;
    const cellWidth = heatmapWidth / NUM_RESIDUES;
    const cellHeight = heatmapHeight / 5;

    for (let i = 0; i < NUM_RESIDUES; i++) {
      for (let j = 0; j < 5; j++) {
        const val = residues[i].hiddenState[j];
        const intensity = Math.floor((val + 1) * 127);
        ctx.fillStyle = `rgb(${intensity}, ${intensity * 0.5}, ${255 - intensity})`;
        ctx.fillRect(10 + i * cellWidth, 300 + j * cellHeight, cellWidth - 1, cellHeight - 1);
      }
    }

    ctx.fillStyle = '#555';
    ctx.fillText('(showing 5 of 50 hidden dimensions...)', 10, 330);

  }, [residues]);

  // Perform measurement (disturbs the system)
  const measure = () => {
    const currentFoldedness = foldedness;

    // Measurement disturbs the hidden states
    const disturbance = 0.3 + Math.random() * 0.2; // 30-50% perturbation

    setResidues(prev => prev.map(r => ({
      ...r,
      // Visible dimensions get slight kick
      x: r.x + (Math.random() - 0.5) * 5,
      y: r.y + (Math.random() - 0.5) * 5,
      // Hidden dimensions get significantly disturbed
      hiddenState: r.hiddenState.map(h =>
        h * (1 - disturbance) + (Math.random() - 0.5) * disturbance * 2
      ),
    })));

    // Record measurement
    const verdict: 'folded' | 'unfolded' | 'ambiguous' =
      currentFoldedness > 0.6 ? 'folded' :
      currentFoldedness < 0.4 ? 'unfolded' : 'ambiguous';

    const measurement: Measurement = {
      id: measurementIdRef.current++,
      time: Date.now(),
      foldedness: currentFoldedness,
      verdict,
      disturbance,
    };

    setMeasurements(prev => [...prev.slice(-9), measurement]);
    setMeasurementCount(prev => prev + 1);
    setTotalDisturbance(prev => prev + disturbance);

    // Update hypothesis confidence
    if (hypothesis === null) {
      setHypothesis(verdict === 'ambiguous' ? 'folded' : verdict);
      setHypothesisConfidence(verdict === 'ambiguous' ? 0.5 : 0.6);
    } else {
      if (verdict === hypothesis) {
        setHypothesisConfidence(prev => Math.min(prev + 0.05, 0.95));
      } else if (verdict !== 'ambiguous') {
        setHypothesisConfidence(prev => Math.max(prev - 0.15, 0.1));
        if (hypothesisConfidence < 0.3) {
          setHypothesis(verdict);
        }
      }
    }
  };

  const reset = () => {
    setMeasurements([]);
    setMeasurementCount(0);
    setTotalDisturbance(0);
    setHypothesis(null);
    setHypothesisConfidence(0);
    measurementIdRef.current = 0;

    // Re-initialize protein
    const initial: AminoAcid[] = [];
    for (let i = 0; i < NUM_RESIDUES; i++) {
      initial.push({
        x: 200 + i * 15,
        y: 150 + Math.sin(i * 0.5) * 30,
        hiddenState: Array(HIDDEN_DIMENSIONS).fill(0).map(() => Math.random() * 2 - 1),
      });
    }
    setResidues(initial);
  };

  const infoLoss = (1 - (1 / TOTAL_DOF)) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/simulations" className="text-gray-400 hover:text-white mb-8 inline-block">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-3xl font-bold mb-2 text-white">Protein Observer</h1>
      <p className="text-gray-400 mb-8">
        Companion to{' '}
        <Link href="/papers/falsifiability" className="text-blue-400 hover:text-blue-300">
          The Limits of Falsifiability
        </Link>
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Protein visualization */}
        <div>
          <div className="border border-gray-800 rounded-xl overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={340}
              className="w-full"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={measure}
              className="flex-1 px-6 py-3 bg-yellow-600 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              Measure (disturbs system)
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center border border-gray-800 rounded-xl p-4">
            <div>
              <div className="text-2xl font-mono text-white">{TOTAL_DOF.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">Total DOF</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-white">1</div>
              <div className="text-gray-500 text-sm">Binary question</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-red-400">{infoLoss.toFixed(1)}%</div>
              <div className="text-gray-500 text-sm">Info discarded</div>
            </div>
          </div>
        </div>

        {/* Right: Measurements and hypothesis */}
        <div>
          {/* Current state */}
          <div className="border border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-sm text-gray-500 mb-2">Current Observable State</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-900 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                  style={{ width: `${foldedness * 100}%` }}
                />
              </div>
              <div className="text-white font-mono w-16 text-right">
                {(foldedness * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Unfolded</span>
              <span>Folded</span>
            </div>
          </div>

          {/* Hypothesis test */}
          <div className="border border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-sm text-gray-500 mb-2">Binary Hypothesis Test</h3>
            <div className="text-lg text-white mb-2">
              H₀: Protein is{' '}
              <span className={hypothesis === 'folded' ? 'text-green-400' : 'text-red-400'}>
                {hypothesis || '???'}
              </span>
            </div>
            {hypothesis && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Confidence:</span>
                <div className="flex-1 bg-gray-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${hypothesisConfidence * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm font-mono">
                  {(hypothesisConfidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {measurementCount > 5 && hypothesisConfidence < 0.7 && (
              <p className="text-yellow-500 text-sm mt-2">
                Confidence not converging despite {measurementCount} measurements...
              </p>
            )}
          </div>

          {/* Measurement log */}
          <div className="border border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-sm text-gray-500 mb-2">Measurement Log</h3>
            <div className="bg-gray-900 rounded-lg p-3 h-48 overflow-y-auto font-mono text-sm">
              {measurements.length === 0 ? (
                <span className="text-gray-600">Click &quot;Measure&quot; to sample the protein state...</span>
              ) : (
                measurements.map(m => (
                  <div key={m.id} className="mb-1">
                    <span className="text-gray-500">[{m.id.toString().padStart(2, '0')}]</span>
                    <span className={
                      m.verdict === 'folded' ? 'text-green-400' :
                      m.verdict === 'unfolded' ? 'text-red-400' : 'text-yellow-400'
                    }> {m.verdict.padEnd(9)}</span>
                    <span className="text-gray-500"> ({(m.foldedness * 100).toFixed(0)}%)</span>
                    <span className="text-orange-400"> ↯{(m.disturbance * 100).toFixed(0)}%</span>
                  </div>
                ))
              )}
            </div>
            {measurementCount > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                Total disturbance: <span className="text-orange-400">{(totalDisturbance * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Key insight */}
          <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-400">
            <p className="mb-2">
              <strong className="text-white">The paradox:</strong> Each measurement tells you something
              about a {TOTAL_DOF.toLocaleString()}-dimensional system, but also perturbs it.
              The protein after measurement is not the same protein you measured.
            </p>
            <p>
              Binary hypothesis testing assumes you can repeatedly sample the same object.
              High-dimensional systems don&apos;t work that way—measurement and existence are entangled.
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 prose prose-invert max-w-none">
        <h3 className="text-lg font-semibold mb-3 text-white">What this demonstrates</h3>
        <div className="text-gray-400 space-y-3">
          <p>
            <strong className="text-white">The protein</strong> has {TOTAL_DOF.toLocaleString()} degrees
            of freedom ({NUM_RESIDUES} residues × {2 + HIDDEN_DIMENSIONS} dimensions each). You see a 2D
            projection. The hidden dimensions (shown as a heatmap) affect the dynamics but can&apos;t be
            directly observed.
          </p>
          <p>
            <strong className="text-white">The question &quot;Is it folded?&quot;</strong> projects all
            {TOTAL_DOF.toLocaleString()} dimensions onto a single bit. This discards {infoLoss.toFixed(1)}%
            of the information. Even if you measure perfectly, you&apos;re throwing away almost everything.
          </p>
          <p>
            <strong className="text-white">Measurement backaction</strong> means each observation perturbs
            the hidden states. The protein you measure at t=1 is not the same protein at t=2. Repeated
            measurements don&apos;t converge to certainty—they explore a trajectory through state space.
          </p>
          <p>
            <strong className="text-white">The implication:</strong> Popper&apos;s falsifiability assumes
            you can repeatedly test the same hypothesis against the same system. For high-dimensional
            biological systems, this assumption fails. The system, the measurement, and the hypothesis
            are all entangled.
          </p>
        </div>
      </div>
    </div>
  );
}
