'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

export default function GravityWellDemo({ className = '' }: Props) {
  const [mode, setMode] = useState<'paradox' | 'substrate'>('paradox');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid settings
      const cols = 25;
      const rows = 12;
      const spacingX = w / cols;
      const spacingY = h / rows;

      // Superposition centers
      const center1 = { x: w * 0.35, y: h * 0.4 };
      const center2 = { x: w * 0.65, y: h * 0.4 };

      // Draw grid lines
      ctx.lineWidth = 1;

      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.strokeStyle = mode === 'paradox' ? '#4b5563' : '#374151';

        for (let c = 0; c <= cols; c++) {
          const x = c * spacingX;
          const baseY = r * spacingY;

          let distortion = 0;

          if (mode === 'paradox') {
            // Paradox: Grid snaps violently between two geometries
            const dx1 = x - center1.x;
            const dy1 = baseY - center1.y;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            const dx2 = x - center2.x;
            const dy2 = baseY - center2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            // Binary snap - no smooth transition
            const isLeft = Math.sin(t * 8) > 0;

            const distortion1 = 3000 / (dist1 * dist1 + 800);
            const distortion2 = 3000 / (dist2 * dist2 + 800);

            distortion = isLeft ? distortion1 : distortion2;

            // Deterministic wobble instead of random jitter
            distortion += 2 * Math.sin(t * 17 + c * 0.3 + r * 0.5);

          } else {
            // Substrate: Smooth sum of both wells
            const dx1 = x - center1.x;
            const dy1 = baseY - center1.y;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            const dx2 = x - center2.x;
            const dy2 = baseY - center2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            distortion = (2000 / (dist1 * dist1 + 800)) + (2000 / (dist2 * dist2 + 800));
          }

          const drawY = baseY + distortion * 25;

          if (c === 0) ctx.moveTo(x, drawY);
          else ctx.lineTo(x, drawY);
        }
        ctx.stroke();
      }

      // Draw vertical grid lines
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.strokeStyle = mode === 'paradox' ? '#374151' : '#2d3748';

        for (let r = 0; r <= rows; r++) {
          const x = c * spacingX;
          const baseY = r * spacingY;

          let distortion = 0;

          if (mode === 'paradox') {
            const dx1 = x - center1.x;
            const dy1 = baseY - center1.y;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            const dx2 = x - center2.x;
            const dy2 = baseY - center2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            const isLeft = Math.sin(t * 8) > 0;

            const distortion1 = 3000 / (dist1 * dist1 + 800);
            const distortion2 = 3000 / (dist2 * dist2 + 800);

            distortion = isLeft ? distortion1 : distortion2;
            distortion += 2 * Math.sin(t * 17 + c * 0.3 + r * 0.5);
          } else {
            const dx1 = x - center1.x;
            const dy1 = baseY - center1.y;
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            const dx2 = x - center2.x;
            const dy2 = baseY - center2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            distortion = (2000 / (dist1 * dist1 + 800)) + (2000 / (dist2 * dist2 + 800));
          }

          const drawY = baseY + distortion * 25;

          if (r === 0) ctx.moveTo(x, drawY);
          else ctx.lineTo(x, drawY);
        }
        ctx.stroke();
      }

      // Draw masses
      const massY1 = center1.y + (mode === 'substrate' ? 35 : 20);
      const massY2 = center2.y + (mode === 'substrate' ? 35 : 20);

      if (mode === 'paradox') {
        // Flickering ghosts
        const alpha = 0.3 + 0.3 * Math.abs(Math.sin(t * 4));

        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(center1.x, massY1, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(239, 68, 68, ${1 - alpha + 0.3})`;
        ctx.beginPath();
        ctx.arc(center2.x, massY2, 12, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('|L⟩', center1.x, massY1 + 25);
        ctx.fillText('|R⟩', center2.x, massY2 + 25);

      } else {
        // Stable wavefunction density
        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.beginPath();
        ctx.arc(center1.x, massY1, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(center2.x, massY2, 12, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#06b6d4';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('|ψ|²', center1.x, massY1 + 25);
        ctx.fillText('|ψ|²', center2.x, massY2 + 25);
      }

      // Status indicator
      if (mode === 'paradox') {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ No single classical geometry', w / 2, 20);
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Stable geometry', w / 2, 20);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode]);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-white">Gravity & Superposition</h3>
        <p className="text-xs text-gray-500">How does spacetime curve when mass is in two places?</p>
        <p className="text-xs text-gray-600 mt-1">Toggle modes. Watch whether the grid has a single stable geometry. (Stylized—illustrates the conceptual demand, not a literal prediction.)</p>
      </div>

      <div className="border border-gray-800 rounded bg-black mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full block"
        />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setMode('paradox')}
          className={`flex-1 py-2 text-sm rounded transition-all ${
            mode === 'paradox'
              ? 'bg-red-900/40 text-red-200 ring-1 ring-red-500'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Paradox View
          <span className="block text-[10px] opacity-70">Gravity sees particle</span>
        </button>
        <button
          onClick={() => setMode('substrate')}
          className={`flex-1 py-2 text-sm rounded transition-all ${
            mode === 'substrate'
              ? 'bg-cyan-900/40 text-cyan-200 ring-1 ring-cyan-500'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Substrate View
          <span className="block text-[10px] opacity-70">Gravity sees wave</span>
        </button>
      </div>

      <div className="p-3 bg-gray-800 rounded text-sm text-gray-300">
        {mode === 'paradox' ? (
          <p>
            <strong className="text-red-400">The problem:</strong> If gravity couples to the <em>particle</em>,
            a superposition means no single classical geometry. The metric description fails.
          </p>
        ) : (
          <p>
            <strong className="text-cyan-400">The resolution:</strong> If gravity couples to the <em>quantum mass-energy distribution</em>,
            the well is stable. It curves around the energy—which happens to have two lobes.
          </p>
        )}
      </div>
    </div>
  );
}
