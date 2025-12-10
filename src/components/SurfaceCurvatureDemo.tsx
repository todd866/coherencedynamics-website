'use client';

/**
 * SurfaceCurvatureDemo
 *
 * 3D particle simulation demonstrating the thermodynamic cost of
 * confining particles to a curved 2D surface.
 *
 * Controls:
 * - Confinement slider: how strongly particles are attracted to surface
 * - Click & drag on canvas: bend the surface (increase amplitude)
 * - Arrow buttons: rotate the view
 */

import { useRef, useEffect, useState, useCallback } from 'react';

// === TYPES ===
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  heat: number;
}

// === CONSTANTS ===
const N_PARTICLES = 400;
const DAMPING = 0.94;
const TEMPERATURE = 0.3;
const FOV = 500;

export default function SurfaceCurvatureDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Controls
  const [confinement, setConfinement] = useState(0.5);
  const [curvature, setCurvature] = useState(0);
  const [rotation, setRotation] = useState({ x: 0.6, y: 0.4 });

  // Interaction - camera drag
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef<number[]>(new Array(100).fill(0));

  // Physics State
  const particlesRef = useRef<Particle3D[]>([]);

  // === INITIALIZATION ===
  useEffect(() => {
    const p: Particle3D[] = [];
    for (let i = 0; i < N_PARTICLES; i++) {
      p.push({
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        heat: 0,
      });
    }
    particlesRef.current = p;
  }, []);

  // === 3D MATH HELPERS ===
  const project = useCallback(
    (p: Point3D, width: number, height: number, rotX: number, rotY: number) => {
      // Rotate Y (Azimuth)
      const cx = Math.cos(rotY);
      const sx = Math.sin(rotY);
      const x = p.x * cx - p.z * sx;
      let z = p.x * sx + p.z * cx;
      let y = p.y;

      // Rotate X (Elevation)
      const cy = Math.cos(rotX);
      const sy = Math.sin(rotX);
      const y_new = y * cy - z * sy;
      z = y * sy + z * cy;
      y = y_new;

      // Project to 2D (more zoomed in)
      const cameraZ = 400;
      const scale = FOV / (FOV + z + cameraZ);

      return {
        x: width / 2 + x * scale * 1.5,
        y: height / 2 + y * scale * 1.5,
        scale: scale,
        z: z,
      };
    },
    []
  );

  const getSurfaceZ = useCallback((x: number, y: number, amp: number) => {
    const k = 0.03;
    return amp * 60 * Math.sin(x * k) * Math.cos(y * k);
  }, []);

  const getMeanCurvature = useCallback(
    (x: number, y: number, amp: number) => {
      const k = 0.03;
      const z = getSurfaceZ(x, y, amp);
      return Math.abs(z * k * k);
    },
    [getSurfaceZ]
  );

  // === ANIMATION LOOP ===
  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      const graphCanvas = graphRef.current;
      const ctx = canvas?.getContext('2d');
      const gCtx = graphCanvas?.getContext('2d');

      if (!canvas || !ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;

      // Use curvature directly from slider
      const newAmp = curvature;

      // Physics Update
      let totalDissipation = 0;
      const baseStiffness = confinement * 0.15;

      particlesRef.current.forEach((p) => {
        // Brownian motion in 3D
        p.vx += (Math.random() - 0.5) * TEMPERATURE;
        p.vy += (Math.random() - 0.5) * TEMPERATURE;
        p.vz += (Math.random() - 0.5) * TEMPERATURE;

        // Local curvature at particle position
        const H_val = getMeanCurvature(p.x, p.y, newAmp);

        // KEY INSIGHT: Curvature makes confinement EASIER (less force needed)
        // The curved geometry naturally guides particles toward the surface
        // Like a ball rolling into a valley - curvature provides a restoring force
        const curvatureAssist = 1 + H_val * 30; // Curvature amplifies effective stiffness
        const effectiveStiffness = baseStiffness * curvatureAssist;

        // Surface confinement force (easier at curved regions)
        const surfaceZ = getSurfaceZ(p.x, p.y, newAmp);
        const distFromSurface = p.z - surfaceZ;
        const forceZ = -effectiveStiffness * distFromSurface;
        p.vz += forceZ;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.vz *= DAMPING;

        // Update Position
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundary wrap (x, y only)
        const limit = 120;
        if (p.x > limit) p.x = -limit;
        if (p.x < -limit) p.x = limit;
        if (p.y > limit) p.y = -limit;
        if (p.y < -limit) p.y = limit;

        // Calculate Heat (two distinct sources)
        // 1. Confinement work: force * distance (one-time cost to get ON the surface)
        const confinementWork = Math.abs(forceZ * distFromSurface) * 0.5;

        // 2. Curvature cost: ONGOING cost that scales with velocity (centrifugal dissipation)
        // Moving fast along a curved path = more heat
        const tangentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const curvatureWork = H_val * tangentSpeed * confinement * 50;

        p.heat = Math.min(1, confinementWork + curvatureWork);
        totalDissipation += p.heat;
      });

      // Rendering
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      const rotX = rotation.x;
      const rotY = rotation.y;

      // Draw Wireframe Surface
      const gridRes = 20;
      const range = 120;
      const step = (range * 2) / gridRes;
      const grid: { x: number; y: number; scale: number; z: number }[][] = [];

      for (let i = 0; i <= gridRes; i++) {
        const x = -range + i * step;
        const row: { x: number; y: number; scale: number; z: number }[] = [];
        for (let j = 0; j <= gridRes; j++) {
          const y = -range + j * step;
          const z = getSurfaceZ(x, y, newAmp);
          row.push(project({ x, y, z }, W, H, rotX, rotY));
        }
        grid.push(row);
      }

      ctx.strokeStyle = `rgba(100, 150, 255, ${0.15 + newAmp * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= gridRes; i++) {
        for (let j = 0; j < gridRes; j++) {
          const p1 = grid[i][j];
          const p2 = grid[i][j + 1];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      for (let i = 0; i < gridRes; i++) {
        for (let j = 0; j <= gridRes; j++) {
          const p1 = grid[i][j];
          const p2 = grid[i + 1][j];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();

      // Draw Particles (sorted by depth)
      const screenParticles = particlesRef.current.map((p) => ({
        ...p,
        ...project({ x: p.x, y: p.y, z: p.z }, W, H, rotX, rotY),
      }));

      screenParticles.sort((a, b) => b.z - a.z);

      screenParticles.forEach((p) => {
        const r = Math.floor(50 + p.heat * 205);
        const g = Math.floor(150 - p.heat * 100);
        const b = Math.floor(255 - p.heat * 205);
        const alpha = Math.max(0.3, Math.min(1, p.scale + 0.2));

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        const size = Math.max(2, 3 * p.scale + p.heat * 2);
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Dissipation Graph
      historyRef.current.shift();
      historyRef.current.push(totalDissipation / N_PARTICLES);

      if (gCtx && graphCanvas) {
        gCtx.clearRect(0, 0, 200, 60);
        gCtx.fillStyle = '#0f172a';
        gCtx.fillRect(0, 0, 200, 60);

        gCtx.strokeStyle = '#1e293b';
        gCtx.lineWidth = 1;
        gCtx.beginPath();
        gCtx.moveTo(0, 30);
        gCtx.lineTo(200, 30);
        gCtx.stroke();

        gCtx.beginPath();
        gCtx.moveTo(0, 60 - historyRef.current[0] * 60);
        for (let i = 1; i < 100; i++) {
          gCtx.lineTo(i * 2, 60 - historyRef.current[i] * 60);
        }
        const severity = historyRef.current[99];
        gCtx.strokeStyle = severity > 0.6 ? '#ef4444' : severity > 0.3 ? '#f59e0b' : '#22c55e';
        gCtx.lineWidth = 2;
        gCtx.stroke();
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [curvature, confinement, rotation, project, getSurfaceZ, getMeanCurvature]);

  // === HANDLERS ===
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Rotate camera (increased sensitivity)
    setRotation(r => ({
      x: Math.max(-0.5, Math.min(1.5, r.x + dy * 0.008)),
      y: r.y + dx * 0.008,
    }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-sm">
      {/* HUD Header */}
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <h3 className="text-slate-400 text-xs tracking-widest uppercase">
            3D Surface
          </h3>
          <h2 className="text-slate-100 font-bold text-lg">
            2D Manifold Confinement
          </h2>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500">DISSIPATION</span>
            <canvas
              ref={graphRef}
              width={200}
              height={60}
              className="border border-slate-700 rounded bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-auto block"
        />

        {/* Stats Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                curvature > 0.4 && confinement > 0.3
                  ? 'bg-red-500 animate-pulse'
                  : confinement > 0.3
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span
              className={
                curvature > 0.4 && confinement > 0.3
                  ? 'text-red-400'
                  : confinement > 0.3
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {curvature > 0.4 && confinement > 0.3
                ? 'HIGH GEOMETRIC COST'
                : confinement > 0.3
                ? 'CONFINED TO SURFACE'
                : 'FREE DIFFUSION'}
            </span>
          </div>
          <div className="text-slate-500 text-xs">
            Curvature: {curvature.toFixed(2)} | Confinement: {confinement.toFixed(2)}
          </div>
        </div>

        {/* Prompt */}
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <span className="bg-slate-800/80 text-slate-400 px-2 py-1 rounded text-xs border border-slate-700">
            Drag to rotate view
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-slate-400 text-sm w-28">
            Confinement:
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confinement}
            onChange={(e) => setConfinement(parseFloat(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="text-slate-300 text-sm w-12 text-right font-mono">
            {confinement.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-slate-400 text-sm w-28">
            Curvature:
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={curvature}
            onChange={(e) => setCurvature(parseFloat(e.target.value))}
            className="flex-1 accent-orange-500"
          />
          <span className="text-slate-300 text-sm w-12 text-right font-mono">
            {curvature.toFixed(2)}
          </span>
        </div>
        <p className="text-slate-500 text-xs">
          <strong className="text-slate-400">Confinement:</strong> How strongly particles are bound to the surface.{' '}
          <strong className="text-slate-400">Curvature:</strong> How bent the surface geometry is.
        </p>
      </div>

      {/* Caption */}
      <p className="mt-4 text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
        <strong>The curvature tradeoff:</strong>{' '}
        Bending makes confinement <em>easier</em> (curved geometry guides particles onto the surface),
        but increases <em>ongoing</em> costs (centrifugal dissipation as particles move along curved paths).
        Particles turn <span className="text-red-400">red</span> when moving fast through high-curvature regions.
      </p>
    </div>
  );
}
