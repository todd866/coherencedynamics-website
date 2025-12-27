'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function TimeApertureDemo({ className = '' }: Props) {
  const [aperture, setAperture] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);
  const [wallClock, setWallClock] = useState(0);
  const [systemClock, setSystemClock] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      p.push({
        x: Math.random() * 400,
        y: 25 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: `hsl(${180 + Math.random() * 60}, 70%, 60%)`
      });
    }
    particlesRef.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const particles = particlesRef.current;

      // Clear
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Calculate aperture boundaries
      const centerY = height / 2;
      const currentHeight = 160 * aperture + 20;
      const topY = centerY - currentHeight / 2;
      const bottomY = centerY + currentHeight / 2;

      // Draw squeezed regions
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, topY);
      ctx.fillRect(0, bottomY, width, height - bottomY);

      // Draw aperture edges
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(width, topY);
      ctx.moveTo(0, bottomY);
      ctx.lineTo(width, bottomY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Physics and state accumulation
      let totalStateChange = 0;

      if (!isPaused) {
        particles.forEach(p => {
          // Move with aperture-dependent vertical velocity
          p.x += p.vx;
          const effectiveVy = p.vy * aperture;
          p.y += effectiveVy;

          // Bounce X
          if (p.x < 5) { p.x = 5; p.vx *= -1; }
          if (p.x > width - 5) { p.x = width - 5; p.vx *= -1; }

          // Bounce Y (constrained by aperture)
          if (p.y < topY + 5) { p.y = topY + 5; p.vy *= -1; }
          if (p.y > bottomY - 5) { p.y = bottomY - 5; p.vy *= -1; }

          // State change = distance traveled in phase space
          const ds = Math.sqrt(p.vx * p.vx + effectiveVy * effectiveVy);
          totalStateChange += ds;
        });

        // Update clocks
        setWallClock(prev => prev + 1);

        // System clock ticks based on total state change
        const normalization = 50 * 2.5;
        const timeDilationFactor = totalStateChange / normalization;
        setSystemClock(prev => prev + timeDilationFactor);
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Draw k_eff label
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = aperture < 0.3 ? '#ef4444' : '#06b6d4';
      ctx.textAlign = 'right';
      ctx.fillText(`k_eff ≈ ${(1 + aperture).toFixed(1)}`, width - 10, 20);

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [aperture, isPaused]);

  const fmt = (n: number) => Math.floor(n).toString().padStart(5, '0');
  const ratio = wallClock > 0 ? (systemClock / wallClock) : 1;

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-white">Time as State-Space Exploration</h3>
        <p className="text-xs text-gray-500">Squeeze dimensions → reduce possible changes → slow the clock</p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-grow">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full rounded border border-gray-700"
          />
        </div>

        <div className="w-28 flex flex-col gap-3 justify-center text-center">
          <div className="bg-gray-800 p-2 rounded border border-gray-700">
            <div className="text-[10px] text-gray-500">External (t)</div>
            <div className="font-mono text-lg text-white">{fmt(wallClock)}</div>
          </div>

          <div className="bg-gray-800 p-2 rounded border border-cyan-800">
            <div className="text-[10px] text-cyan-400">System (τ)</div>
            <div className="font-mono text-lg text-cyan-300">{fmt(systemClock)}</div>
          </div>

          <div className="text-xs">
            <span className="text-gray-500">τ/t = </span>
            <span className={ratio < 0.7 ? 'text-red-400 font-bold' : 'text-green-400'}>
              {ratio.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Squeezed (k→1)</span>
            <span>Open (k=2)</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={aperture}
            onChange={(e) => setAperture(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
          >
            {isPaused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button
            onClick={() => { setWallClock(0); setSystemClock(0); }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
        <p>
          <strong className="text-cyan-400">The mechanism:</strong> Time = accumulated state change.
          When the aperture squeezes, particles lose degrees of freedom. Less change is possible per tick.
          The system clock slows relative to the external clock.
        </p>
        <p className="mt-2 text-gray-500 text-xs">
          This is time dilation from the inside. The system isn&apos;t &ldquo;moving slower&rdquo;—it has less room to change.
        </p>
      </div>
    </div>
  );
}
