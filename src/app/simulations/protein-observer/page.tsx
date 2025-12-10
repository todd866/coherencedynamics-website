'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Residue {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hydrophobic: boolean;
  observed: boolean;
}

interface MeasurementPulse {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

const NUM_RESIDUES = 24;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;

export default function ProteinObserver() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [residues, setResidues] = useState<Residue[]>([]);
  const [phase, setPhase] = useState<'folding' | 'crystallized'>('folding');
  const [foldProgress, setFoldProgress] = useState(0);
  const [uncertainty, setUncertainty] = useState(1.0);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [crystallizedEarly, setCrystallizedEarly] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [pulses, setPulses] = useState<MeasurementPulse[]>([]);
  const [hoveredResidue, setHoveredResidue] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Initialize protein as extended chain
  const initProtein = useCallback(() => {
    const res: Residue[] = [];
    const startX = 80;
    const spacing = 18;
    for (let i = 0; i < NUM_RESIDUES; i++) {
      const hydrophobic = i % 4 < 2;
      res.push({
        x: startX + i * spacing,
        y: CANVAS_HEIGHT / 2,
        targetX: startX + i * spacing,
        targetY: CANVAS_HEIGHT / 2,
        hydrophobic,
        observed: false,
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
    setPulses([]);
    setHoveredResidue(null);
    timeRef.current = 0;
  }, [initProtein]);

  useEffect(() => {
    reset();
  }, [reset]);

  // Calculate folded target positions
  const calculateFoldedPositions = useCallback((progress: number) => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    return residues.map((r, i) => {
      const startX = 80;
      const spacing = 18;
      const extX = startX + i * spacing;
      const extY = CANVAS_HEIGHT / 2;

      // Folded position: tight helix that collapses
      const helixAngle = i * 0.65;
      const baseRadius = 80;
      const helixRadius = baseRadius + (r.hydrophobic ? -20 : 20);
      const verticalSpread = (i - NUM_RESIDUES / 2) * 6;

      // Collapse factor increases with progress
      const collapse = progress * 0.4;
      const foldedX = centerX + Math.cos(helixAngle) * helixRadius * (1 - collapse);
      const foldedY = centerY + Math.sin(helixAngle) * helixRadius * 0.6 + verticalSpread * (1 - collapse);

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
      timeRef.current += 0.016;

      if (phase === 'folding') {
        setFoldProgress(prev => {
          const newProgress = Math.min(prev + 0.0015, 1.0);
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
          const noise = uncertainty * 12;
          const noiseX = (Math.sin(timeRef.current * 3 + i * 0.5) + Math.random() - 0.5) * noise;
          const noiseY = (Math.cos(timeRef.current * 2.5 + i * 0.7) + Math.random() - 0.5) * noise;

          const dx = r.targetX - prev[i].x;
          const dy = r.targetY - prev[i].y;

          return {
            ...r,
            x: prev[i].x + dx * 0.05 + noiseX,
            y: prev[i].y + dy * 0.05 + noiseY,
            observed: prev[i].observed,
          };
        });
      });

      // Update pulses
      setPulses(prev => prev
        .map(p => ({
          ...p,
          radius: p.radius + 3,
          opacity: p.opacity - 0.02,
        }))
        .filter(p => p.opacity > 0)
      );

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

    // Draw measurement pulses
    pulses.forEach(pulse => {
      ctx.strokeStyle = `rgba(250, 204, 21, ${pulse.opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Apply blur based on uncertainty
    const blurAmount = uncertainty * 3;
    ctx.filter = `blur(${blurAmount}px)`;

    // Draw backbone
    ctx.strokeStyle = phase === 'crystallized'
      ? (crystallizedEarly ? '#f97316' : '#22c55e')
      : '#4a5568';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(residues[0].x, residues[0].y);

    for (let i = 1; i < residues.length - 1; i++) {
      const xc = (residues[i].x + residues[i + 1].x) / 2;
      const yc = (residues[i].y + residues[i + 1].y) / 2;
      ctx.quadraticCurveTo(residues[i].x, residues[i].y, xc, yc);
    }
    ctx.lineTo(residues[residues.length - 1].x, residues[residues.length - 1].y);
    ctx.stroke();

    // Draw residues
    residues.forEach((r, i) => {
      const isHovered = hoveredResidue === i;
      const baseSize = phase === 'crystallized' ? 8 : 10;
      const size = isHovered ? baseSize + 4 : baseSize;

      // Draw glow for hovered residue
      if (isHovered && phase !== 'crystallized') {
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
        ctx.beginPath();
        ctx.arc(r.x, r.y, size + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = `blur(${blurAmount}px)`;
      }

      // Observed residues are brighter
      if (r.hydrophobic) {
        ctx.fillStyle = r.observed
          ? '#fca5a5'
          : (phase === 'crystallized' ? '#dc2626' : '#ef4444');
      } else {
        ctx.fillStyle = r.observed
          ? '#93c5fd'
          : (phase === 'crystallized' ? '#2563eb' : '#3b82f6');
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.filter = 'none';

    // Status overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 160, 55);

    ctx.fillStyle = '#888';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';

    if (phase === 'folding') {
      ctx.fillText(`Folding: ${(foldProgress * 100).toFixed(0)}%`, 20, 32);
      ctx.fillStyle = uncertainty > 0.5 ? '#fbbf24' : '#22c55e';
      ctx.fillText(`Uncertainty: ${(uncertainty * 100).toFixed(0)}%`, 20, 52);
    } else {
      ctx.fillStyle = crystallizedEarly ? '#f97316' : '#22c55e';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(crystallizedEarly ? 'MISFOLDED' : 'NATIVE FOLD', 20, 42);
    }

    // Instruction hint
    if (phase === 'folding') {
      ctx.fillStyle = '#555';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click on residues to measure', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
    }

  }, [residues, phase, uncertainty, crystallizedEarly, foldProgress, pulses, hoveredResidue]);

  // Find nearest residue to a point
  const findNearestResidue = (x: number, y: number): number | null => {
    let minDist = Infinity;
    let nearest: number | null = null;

    residues.forEach((r, i) => {
      const dist = Math.sqrt((r.x - x) ** 2 + (r.y - y) ** 2);
      if (dist < minDist && dist < 40) {
        minDist = dist;
        nearest = i;
      }
    });

    return nearest;
  };

  // Handle canvas click - measure nearest residue
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase === 'crystallized') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const nearestIdx = findNearestResidue(x, y);
    if (nearestIdx === null) return;

    const residue = residues[nearestIdx];

    // Add measurement pulse
    setPulses(prev => [...prev, {
      x: residue.x,
      y: residue.y,
      radius: 10,
      opacity: 0.8,
    }]);

    // Mark residue as observed
    setResidues(prev => prev.map((r, i) =>
      i === nearestIdx ? { ...r, observed: true } : r
    ));

    setMeasurementCount(prev => prev + 1);

    // Each measurement reduces uncertainty
    setUncertainty(prev => {
      const newUncertainty = prev * 0.7;

      // If uncertainty drops below threshold, crystallize
      if (newUncertainty < 0.12 || (newUncertainty < 0.25 && Math.random() < 0.35)) {
        setPhase('crystallized');
        setCrystallizedEarly(foldProgress < 0.75);
        return 0;
      }

      return newUncertainty;
    });
  };

  // Handle mouse move for hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase === 'crystallized') {
      setHoveredResidue(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setHoveredResidue(findNearestResidue(x, y));
  };

  const handleMouseLeave = () => {
    setHoveredResidue(null);
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm"
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-yellow-400"></div>
              <span>Measured</span>
            </div>
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
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

            {/* Uncertainty bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uncertainty</span>
                <span>{(uncertainty * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${uncertainty * 100}%`,
                    backgroundColor: uncertainty > 0.5 ? '#fbbf24' : '#22c55e'
                  }}
                />
              </div>
            </div>
          </div>

          {phase === 'crystallized' && (
            <div className={`border rounded-lg p-4 ${
              crystallizedEarly
                ? 'border-orange-700 bg-orange-900/20'
                : 'border-blue-700 bg-blue-900/20'
            }`}>
              <h3 className={`font-medium mb-2 ${crystallizedEarly ? 'text-orange-400' : 'text-blue-400'}`}>
                {crystallizedEarly ? 'Structure Locked Early' : 'Structure Resolved'}
              </h3>
              <p className="text-sm text-gray-400">
                {crystallizedEarly
                  ? `Measurement collapsed the system at ${(foldProgress * 100).toFixed(0)}% progress. The path taken is now fixed—but was it the path it would have taken without observation?`
                  : `The protein reached a stable configuration. But which of the many possible paths led here? The measurement history changed the energy landscape—you observed a different process than would have occurred unobserved.`}
              </p>
            </div>
          )}

          <div className="border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
            <p className="mb-3">
              <strong className="text-white">Click on residues to measure them.</strong> Each measurement
              collapses uncertainty—but the protein may have taken many paths to get here.
            </p>
            <p className="mb-3">
              <strong className="text-white">Path degeneracy:</strong> Even if the protein folds correctly,
              you can&apos;t know which of the many possible paths it took. The blur represents
              this irreducible uncertainty about energy flows.
            </p>
            <p>
              <strong className="text-white">The paradox:</strong> You can&apos;t measure energy flows
              without changing them. The act of observation doesn&apos;t just risk a different outcome—it
              means you can never know what would have happened without observation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
