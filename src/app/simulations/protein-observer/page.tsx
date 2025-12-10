'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Residue {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hydrophobic: boolean;
}

const NUM_RESIDUES = 30;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;

export default function ProteinObserver() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [residues, setResidues] = useState<Residue[]>([]);
  const [phase, setPhase] = useState<'folding' | 'crystallized'>('folding');
  const [foldProgress, setFoldProgress] = useState(0);
  const [uncertainty, setUncertainty] = useState(1.0); // 1.0 = max blur, 0 = crystallized
  const [measurementCount, setMeasurementCount] = useState(0);
  const [crystallizedEarly, setCrystallizedEarly] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Initialize protein as extended chain
  const initProtein = useCallback(() => {
    const res: Residue[] = [];
    for (let i = 0; i < NUM_RESIDUES; i++) {
      // Hydrophobic pattern (simplified - every 3-4 residues)
      const hydrophobic = i % 4 < 2;
      res.push({
        x: 50 + i * 14,
        y: CANVAS_HEIGHT / 2,
        targetX: 50 + i * 14,
        targetY: CANVAS_HEIGHT / 2,
        hydrophobic,
      });
    }
    return res;
  }, []);

  const reset = useCallback(() => {
    setResidues(initProtein());
    setPhase('folding');
    setFoldProgress(0);
    setUncertainty(1.0);
    setMeasurementCount(0);
    setCrystallizedEarly(false);
    setIsRunning(true);
    timeRef.current = 0;
  }, [initProtein]);

  useEffect(() => {
    reset();
  }, [reset]);

  // Calculate folded target positions (simplified helix + collapse)
  const calculateFoldedPositions = useCallback((progress: number) => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    return residues.map((r, i) => {
      // Extended position
      const extX = 50 + i * 14;
      const extY = CANVAS_HEIGHT / 2;

      // Folded position: helix that collapses into globule
      const helixAngle = i * 0.6;
      const helixRadius = 30 + (r.hydrophobic ? -10 : 10); // Hydrophobic core
      const verticalSpread = (i - NUM_RESIDUES / 2) * 3;

      const foldedX = centerX + Math.cos(helixAngle) * helixRadius * (1 - progress * 0.3);
      const foldedY = centerY + Math.sin(helixAngle) * helixRadius * 0.5 + verticalSpread * (1 - progress * 0.5);

      // Interpolate between extended and folded
      return {
        ...r,
        targetX: extX + (foldedX - extX) * progress,
        targetY: extY + (foldedY - extY) * progress,
      };
    });
  }, [residues]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      timeRef.current += 0.016; // ~60fps

      if (phase === 'folding') {
        // Natural folding progress (slow)
        setFoldProgress(prev => {
          const newProgress = Math.min(prev + 0.002, 1.0);
          if (newProgress >= 1.0) {
            setPhase('crystallized');
            setUncertainty(0);
          }
          return newProgress;
        });
      }

      // Update residue positions with noise
      setResidues(prev => {
        const withTargets = calculateFoldedPositions(foldProgress);
        return withTargets.map((r, i) => {
          // Add thermal noise based on uncertainty
          const noise = uncertainty * 15;
          const noiseX = (Math.sin(timeRef.current * 3 + i * 0.5) + Math.random() - 0.5) * noise;
          const noiseY = (Math.cos(timeRef.current * 2.5 + i * 0.7) + Math.random() - 0.5) * noise;

          // Smooth movement toward target
          const dx = r.targetX - prev[i].x;
          const dy = r.targetY - prev[i].y;

          return {
            ...r,
            x: prev[i].x + dx * 0.05 + noiseX,
            y: prev[i].y + dy * 0.05 + noiseY,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, phase, foldProgress, uncertainty, calculateFoldedPositions]);

  // Draw protein
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || residues.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply blur based on uncertainty
    const blurAmount = uncertainty * 4;
    ctx.filter = `blur(${blurAmount}px)`;

    // Draw backbone as smooth curve
    ctx.strokeStyle = phase === 'crystallized'
      ? (crystallizedEarly ? '#f97316' : '#22c55e')
      : '#4a5568';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(residues[0].x, residues[0].y);

    // Smooth bezier curve through points
    for (let i = 1; i < residues.length - 1; i++) {
      const xc = (residues[i].x + residues[i + 1].x) / 2;
      const yc = (residues[i].y + residues[i + 1].y) / 2;
      ctx.quadraticCurveTo(residues[i].x, residues[i].y, xc, yc);
    }
    ctx.lineTo(residues[residues.length - 1].x, residues[residues.length - 1].y);
    ctx.stroke();

    // Draw residues
    residues.forEach((r, i) => {
      // Hydrophobic = warm colors (want to be inside), hydrophilic = cool colors
      if (r.hydrophobic) {
        ctx.fillStyle = phase === 'crystallized' ? '#dc2626' : '#ef4444';
      } else {
        ctx.fillStyle = phase === 'crystallized' ? '#2563eb' : '#3b82f6';
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, phase === 'crystallized' ? 5 : 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Reset filter for text
    ctx.filter = 'none';

    // Status text
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (phase === 'folding') {
      ctx.fillText(`Folding: ${(foldProgress * 100).toFixed(0)}%`, 10, 25);
      ctx.fillText(`Uncertainty: ${(uncertainty * 100).toFixed(0)}%`, 10, 42);
    } else {
      ctx.fillStyle = crystallizedEarly ? '#f97316' : '#22c55e';
      ctx.fillText(crystallizedEarly ? 'CRYSTALLIZED EARLY' : 'NATIVE FOLD', 10, 25);
    }

  }, [residues, phase, uncertainty, crystallizedEarly, foldProgress]);

  // Measurement - reduces uncertainty, may crystallize early
  const measure = () => {
    if (phase === 'crystallized') return;

    setMeasurementCount(prev => prev + 1);

    // Each measurement reduces uncertainty
    setUncertainty(prev => {
      const newUncertainty = prev * 0.6;

      // If uncertainty drops below threshold, crystallize (possibly wrong structure)
      if (newUncertainty < 0.15 || (newUncertainty < 0.3 && Math.random() < 0.4)) {
        setPhase('crystallized');
        setCrystallizedEarly(foldProgress < 0.8);
        return 0;
      }

      return newUncertainty;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Protein Observer</h1>
      <p className="text-gray-500 text-sm mb-6">
        Companion to{' '}
        <Link href="/papers/falsifiability" className="text-blue-400 hover:text-blue-300">
          The Limits of Falsifiability
        </Link>
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <div>
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={measure}
              disabled={phase === 'crystallized'}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                phase === 'crystallized'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-600 text-black hover:bg-yellow-500'
              }`}
            >
              Measure
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

          {/* Legend */}
          <div className="flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Hydrophobic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Hydrophilic</span>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">System State</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-mono text-white">{measurementCount}</div>
                <div className="text-gray-500 text-sm">Measurements</div>
              </div>
              <div>
                <div className="text-2xl font-mono text-white">{(foldProgress * 100).toFixed(0)}%</div>
                <div className="text-gray-500 text-sm">Fold Progress</div>
              </div>
            </div>
          </div>

          {phase === 'crystallized' && (
            <div className={`border rounded-lg p-4 ${
              crystallizedEarly
                ? 'border-orange-700 bg-orange-900/20'
                : 'border-green-700 bg-green-900/20'
            }`}>
              <h3 className={`font-medium mb-2 ${crystallizedEarly ? 'text-orange-400' : 'text-green-400'}`}>
                {crystallizedEarly ? 'Misfolded!' : 'Native Fold Achieved'}
              </h3>
              <p className="text-sm text-gray-400">
                {crystallizedEarly
                  ? `Measurement forced crystallization at ${(foldProgress * 100).toFixed(0)}% progress. The protein locked into a non-native conformation.`
                  : 'The protein reached its native fold without premature measurement interference.'}
              </p>
            </div>
          )}

          <div className="border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
            <p className="mb-3">
              <strong className="text-white">The blur represents uncertainty.</strong> We don&apos;t
              know the exact energy landscape the protein is exploring. Multiple folding pathways
              are possible simultaneously.
            </p>
            <p className="mb-3">
              <strong className="text-white">Measurement collapses this uncertainty.</strong> Each
              observation forces the system to commit to a definite state—but if the protein
              hasn&apos;t finished exploring, it may lock into a misfolded structure.
            </p>
            <p>
              <strong className="text-white">The paradox:</strong> You can&apos;t know if a protein
              is correctly folded without measuring it, but measuring it changes the folding process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
