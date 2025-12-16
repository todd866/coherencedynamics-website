'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  className?: string;
  compact?: boolean;
}

export default function EmbeddingDimensionDemo({ className = '', compact = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimension, setDimension] = useState<3 | 2>(3);
  const [constraint, setConstraint] = useState<'phase' | 'spiral'>('phase');
  const [cycles, setCycles] = useState(3);
  const [epsilon, setEpsilon] = useState(12);
  const [stats, setStats] = useState({ status: 'Distinct', collisions: 0, space: 'ℝ³ (helix)' });

  const rotationRef = useRef({ x: 0.35, y: 0.5 });
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });
  const dimBlendRef = useRef(1.0);
  const autoRotateRef = useRef(true);
  const animationRef = useRef<number>();

  const canvasSize = compact ? 300 : 500;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Auto-rotate
    if (autoRotateRef.current && !dragRef.current.isDragging) {
      rotationRef.current.y += 0.008;
    }

    // Animate dimension blend
    const targetBlend = dimension === 3 ? 1.0 : 0.0;
    dimBlendRef.current += (targetBlend - dimBlendRef.current) * 0.12;

    ctx.clearRect(0, 0, W, H);

    // Generate points
    const points: { x: number; y: number; z: number; tau: number; index: number }[] = [];
    const n = Math.floor(cycles * 80);
    const scale = compact ? 0.6 : 1;

    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const theta = t * cycles * Math.PI * 2;
      const tau = t;

      let x: number, y: number, z: number;

      if (constraint === 'phase') {
        x = Math.cos(theta) * 100 * scale;
        y = Math.sin(theta) * 100 * scale;
        z = tau * 120 * (cycles / 3) * scale;
      } else {
        const r = (50 + tau * 70) * scale;
        x = Math.cos(theta) * r;
        y = Math.sin(theta) * r;
        z = 0;
      }

      points.push({ x, y, z, tau, index: i });
    }

    // Project points
    const dimBlend = dimBlendRef.current;
    const { x: rotX, y: rotY } = rotationRef.current;

    const project = (p: typeof points[0]) => {
      const x = p.x;
      const y = p.y;
      const z = p.z * dimBlend;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspScale = 350 / (350 + z2);
      return {
        x: cx + x1 * perspScale,
        y: cy - y1 * perspScale,
        z: z2,
        scale: perspScale,
        tau: p.tau,
        index: p.index,
      };
    };

    const projected = points.map(project);
    const sorted = [...projected].sort((a, b) => a.z - b.z);

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100,100,100,0.4)';
    ctx.lineWidth = 1.5;
    projected.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw points
    const getColor = (tau: number) => {
      const r = Math.floor(59 + tau * 186);
      const g = Math.floor(130 - tau * 32);
      const b = Math.floor(246 - tau * 229);
      return `rgb(${r},${g},${b})`;
    };

    for (const p of sorted) {
      const radius = Math.max(2, (compact ? 3 : 4) * p.scale);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = getColor(p.tau);
      ctx.fill();
    }

    // Find collisions
    const collisions: { x: number; y: number }[] = [];
    if (dimBlend < 0.3 && constraint === 'phase') {
      const minGap = 30;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + minGap; j < projected.length; j++) {
          const pi = projected[i];
          const pj = projected[j];
          const dist = Math.hypot(pi.x - pj.x, pi.y - pj.y);
          if (dist < epsilon) {
            collisions.push({ x: (pi.x + pj.x) / 2, y: (pi.y + pj.y) / 2 });
            j += 15;
          }
        }
      }
    }

    // Draw collisions
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    for (const c of collisions) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x - 7, c.y - 7);
      ctx.lineTo(c.x + 7, c.y + 7);
      ctx.moveTo(c.x + 7, c.y - 7);
      ctx.lineTo(c.x - 7, c.y + 7);
      ctx.stroke();
    }

    // Start/end markers
    const startP = projected[0];
    ctx.beginPath();
    ctx.arc(startP.x, startP.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    const endP = projected[projected.length - 1];
    ctx.beginPath();
    ctx.arc(endP.x, endP.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Update stats
    const is3D = dimBlend > 0.5;
    const isSpiral = constraint === 'spiral';

    setStats({
      status: collisions.length > 0 ? 'Collapsed' : 'Distinct',
      collisions: collisions.length,
      space: isSpiral
        ? (is3D ? 'ℝ³ (spiral)' : 'ℝ² (spiral)')
        : (is3D ? 'ℝ³ (helix)' : 'ℝ² (circle)'),
    });

    animationRef.current = requestAnimationFrame(render);
  }, [dimension, constraint, cycles, epsilon, compact]);

  useEffect(() => {
    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    autoRotateRef.current = false;
    dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    rotationRef.current.y += dx * 0.01;
    rotationRef.current.x += dy * 0.01;
    rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  const noteText = constraint === 'spiral'
    ? 'Spiral: Meta-time τ encoded in radius. No collisions, but violates phase-preservation (bounded recurrence).'
    : dimension === 3
      ? 'k=3 (Helix): Cycles separated by meta-time τ. Temporal distinctness preserved.'
      : 'k=2 (Circle): Trajectory collapses. Different cycles overlap—system cannot distinguish when, only what.';

  return (
    <div className={`flex ${compact ? 'flex-col' : 'flex-col lg:flex-row'} gap-4 items-start ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="bg-gray-900 rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className={`${compact ? 'w-full' : 'w-full lg:w-64'} space-y-4`}>
        {/* Dimension toggle */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Embedding Dimension (k)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDimension(3)}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                dimension === 3
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              k = 3
            </button>
            <button
              onClick={() => setDimension(2)}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                dimension === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              k = 2
            </button>
          </div>
        </div>

        {/* Constraint toggle */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Constraint Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setConstraint('phase')}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                constraint === 'phase'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Phase-Preserving
            </button>
            <button
              onClick={() => setConstraint('spiral')}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                constraint === 'spiral'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Spiral
            </button>
          </div>
        </div>

        {/* Cycles slider */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
            Cycles: <span className="text-white">{cycles}</span>
          </label>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={cycles}
            onChange={(e) => setCycles(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Epsilon slider */}
        {!compact && (
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
              Collision ε: <span className="text-white">{epsilon}px</span>
            </label>
            <input
              type="range"
              min={4}
              max={30}
              step={2}
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        )}

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={stats.status === 'Distinct' ? 'text-green-400' : 'text-red-400'}>
              {stats.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Collisions</span>
            <span className={stats.collisions === 0 ? 'text-green-400' : 'text-red-400'}>
              {stats.collisions}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Space</span>
            <span className="text-white">{stats.space}</span>
          </div>
        </div>

        {/* Note */}
        <div className="bg-gray-800/50 border-l-2 border-blue-600 rounded-r-lg p-3">
          <p className="text-xs text-gray-400 leading-relaxed">{noteText}</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>τ=0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span>τ=T</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Collision</span>
          </div>
        </div>
      </div>
    </div>
  );
}
