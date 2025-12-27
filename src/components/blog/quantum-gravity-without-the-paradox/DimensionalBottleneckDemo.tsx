'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

interface Particle {
  // Position in the "flow" (0 = left high-D, 0.5 = bottleneck, 1 = right high-D)
  t: number;
  // Offset in the transverse dimensions (many in high-D regions, compressed at bottleneck)
  dims: number[]; // 8 dimensions, compressed to ~3 at bottleneck
  phase: number;
  speed: number;
}

export default function DimensionalBottleneckDemo({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flowSpeed, setFlowSpeed] = useState(0.3);
  const [showLabels, setShowLabels] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Create particles
    const numParticles = 40;
    const particles: Particle[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        t: Math.random(),
        dims: Array(8).fill(0).map(() => (Math.random() - 0.5) * 2),
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.002,
      });
    }

    let animationFrameId: number;
    let time = 0;

    // Calculate the "squeeze factor" - how much dimensions are compressed
    // 1.0 = full high-D, approaching 0 = squeezed to 3D
    const squeezeFactor = (t: number): number => {
      // Gaussian-like squeeze centered at t=0.5
      const distFromCenter = Math.abs(t - 0.5);
      const squeeze = Math.exp(-Math.pow(distFromCenter * 4, 2));
      return 1 - squeeze * 0.85; // Never fully squeeze to 0
    };

    // Project particle position to 2D canvas
    const projectParticle = (p: Particle): { x: number; y: number; size: number; alpha: number } => {
      const x = p.t * w;

      // At the bottleneck, dimensions collapse
      const squeeze = squeezeFactor(p.t);

      // Combine dimensions with squeeze-dependent weights
      let y = h / 2;
      const dimContributions: number[] = [];

      for (let d = 0; d < 8; d++) {
        // First 3 dimensions always visible (spatial), rest fade at bottleneck
        const dimWeight = d < 3 ? 1.0 : squeeze;
        const contribution = p.dims[d] * dimWeight * 80 * Math.sin(time * 2 + p.phase + d * 0.5);
        dimContributions.push(contribution);
      }

      // Sum contributions
      y += dimContributions.reduce((a, b) => a + b, 0) / Math.sqrt(8);

      // Size represents "spread" in hidden dimensions
      const hiddenSpread = dimContributions.slice(3).reduce((a, b) => a + Math.abs(b), 0);
      const size = 3 + hiddenSpread * 0.05 * squeeze;

      // Alpha based on coherence
      const alpha = 0.4 + 0.4 * squeeze;

      return { x, y, size, alpha };
    };

    const render = () => {
      if (!isPaused) {
        time += 0.016 * flowSpeed;
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // Draw the hourglass/bottleneck shape
      ctx.beginPath();
      ctx.moveTo(0, h * 0.1);

      // Top edge - curves inward at center
      for (let x = 0; x <= w; x += 5) {
        const t = x / w;
        const squeeze = squeezeFactor(t);
        const edgeY = h * 0.1 + (h * 0.35) * (1 - squeeze);
        ctx.lineTo(x, edgeY);
      }

      // Right side
      ctx.lineTo(w, h * 0.1);
      ctx.lineTo(w, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();

      // Bottom edge
      ctx.beginPath();
      ctx.moveTo(0, h * 0.9);

      for (let x = 0; x <= w; x += 5) {
        const t = x / w;
        const squeeze = squeezeFactor(t);
        const edgeY = h * 0.9 - (h * 0.35) * (1 - squeeze);
        ctx.lineTo(x, edgeY);
      }

      ctx.lineTo(w, h * 0.9);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();

      // Draw dimension indicator curves (faint)
      ctx.strokeStyle = 'rgba(100, 100, 140, 0.15)';
      ctx.lineWidth = 1;

      for (let d = 0; d < 8; d++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const t = x / w;
          const squeeze = squeezeFactor(t);
          const dimWeight = d < 3 ? 1.0 : squeeze;
          const yOffset = Math.sin(x * 0.02 + time + d * 0.7) * 40 * dimWeight;
          const y = h / 2 + yOffset;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Update and draw particles
      for (const p of particles) {
        if (!isPaused) {
          p.t += p.speed * flowSpeed;
          if (p.t > 1) {
            p.t = 0;
            p.dims = Array(8).fill(0).map(() => (Math.random() - 0.5) * 2);
          }

          // Evolve dimensions (oscillate)
          for (let d = 0; d < 8; d++) {
            p.dims[d] += Math.sin(time * 3 + p.phase + d) * 0.01;
            p.dims[d] = Math.max(-2, Math.min(2, p.dims[d]));
          }
        }

        const { x, y, size, alpha } = projectParticle(p);

        // Color based on position (blue in high-D, cyan at bottleneck)
        const squeeze = squeezeFactor(p.t);
        const r = Math.round(20 + (1 - squeeze) * 30);
        const g = Math.round(150 + squeeze * 50);
        const b = Math.round(200 + (1 - squeeze) * 55);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Draw "diffraction trails" after bottleneck
        if (p.t > 0.55) {
          const spread = (p.t - 0.55) * 3;
          for (let trail = 0; trail < 3; trail++) {
            const trailY = y + (trail - 1) * 20 * spread * Math.sin(time + p.phase + trail);
            ctx.beginPath();
            ctx.arc(x, trailY, size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`;
            ctx.fill();
          }
        }
      }

      // Labels
      if (showLabels) {
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';

        // Left region
        ctx.fillStyle = '#6b8cce';
        ctx.fillText('High-D Hilbert Space', w * 0.15, 25);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#8899bb';
        ctx.fillText('N dimensions', w * 0.15, 40);
        ctx.fillText('(quantum state)', w * 0.15, 53);

        // Center
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.fillText('3+1D Bottleneck', w * 0.5, 25);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#66aa88';
        ctx.fillText('classical spacetime', w * 0.5, 40);

        // Right region
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#c490e4';
        ctx.fillText('Entanglement Diffraction', w * 0.85, 25);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#aa88cc';
        ctx.fillText('correlations spread', w * 0.85, 40);
        ctx.fillText('into environment', w * 0.85, 53);

        // Visible degrees of freedom indicator
        ctx.font = '9px monospace';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.fillText('Visible DoF: high', 10, h - 10);
        ctx.textAlign = 'center';
        ctx.fillText('Visible DoF: 3', w * 0.5, h - 10);
        ctx.textAlign = 'right';
        ctx.fillText('Visible DoF: spreading', w - 10, h - 10);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [flowSpeed, showLabels, isPaused]);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-white">The Dimensional Bottleneck</h3>
        <p className="text-xs text-gray-500">Is 3+1D spacetime a constriction in a higher-dimensional flow?</p>
      </div>

      <div className="border border-gray-800 rounded bg-black mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={250}
          className="w-full block"
        />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-4 py-2 text-sm rounded transition-all ${
            isPaused
              ? 'bg-green-800 text-green-200'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>

        <div className="flex-1">
          <label className="text-xs text-gray-400 block mb-1">
            Flow speed: {flowSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={flowSpeed}
            onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`px-3 py-2 text-sm rounded transition-all ${
            showLabels
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Labels
        </button>
      </div>

      <div className="p-3 bg-gray-800 rounded text-sm text-gray-300">
        <p>
          <strong className="text-cyan-400">The analogy:</strong> Just as neural dynamics get pinned through
          slow-wave constrictions before diffracting back into high-D states, quantum dynamics may pass through
          a 3D spatial aperture. Classical spacetime isn&apos;t where things happen—it&apos;s the bottleneck where
          high-D correlations get squeezed into observable geometry.
        </p>
        <p className="mt-2 text-gray-500 text-xs">
          On the far side, entanglement with the environment spreads correlations back into effectively infinite dimensions.
        </p>
      </div>
    </div>
  );
}
