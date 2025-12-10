'use client';

/**
 * SurfaceCurvatureDemo
 *
 * A zero-dependency 3D particle simulation on a parametric surface.
 * Demonstrates that maintaining a 2D constraint in 3D space costs energy
 * proportional to the Mean Curvature squared (H^2).
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
  vx: number;
  vy: number;
  heat: number;
}

// === CONSTANTS ===
const N_PARTICLES = 600;
const GRID_RES = 24; // Wireframe density
const DAMPING = 0.92;
const TEMPERATURE = 0.5; // Brownian kick
const FOV = 400; // Field of view for projection

export default function SurfaceCurvatureDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Interaction State
  const [curvature, setCurvature] = useState(0);
  const targetCurvatureRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rotationRef = useRef({ x: 0.8, y: 0.6 }); // Initial camera angle
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<number[]>(new Array(100).fill(0));

  // Physics State
  const particlesRef = useRef<Particle3D[]>([]);

  // === INITIALIZATION ===
  useEffect(() => {
    const p: Particle3D[] = [];
    for (let i = 0; i < N_PARTICLES; i++) {
      p.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        heat: 0,
      });
    }
    particlesRef.current = p;
  }, []);

  // === 3D MATH HELPERS ===
  const project = useCallback(
    (p: Point3D, width: number, height: number, rotX: number, rotY: number) => {
      // 1. Rotate Y (Azimuth)
      const cx = Math.cos(rotY);
      const sx = Math.sin(rotY);
      const x = p.x * cx - p.z * sx;
      let z = p.x * sx + p.z * cx;
      let y = p.y;

      // 2. Rotate X (Elevation)
      const cy = Math.cos(rotX);
      const sy = Math.sin(rotX);
      const y_new = y * cy - z * sy;
      z = y * sy + z * cy;
      y = y_new;

      // 3. Project to 2D
      const cameraZ = 600;
      const scale = FOV / (FOV + z + cameraZ);

      return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale,
        scale: scale,
        z: z,
      };
    },
    []
  );

  const getSurfaceZ = useCallback((x: number, y: number, amp: number) => {
    // Surface: z = A * sin(kx) * cos(ky) - "Egg Crate" landscape
    const k = 0.025;
    return amp * 80 * Math.sin(x * k) * Math.cos(y * k);
  }, []);

  const getMeanCurvature = useCallback(
    (x: number, y: number, amp: number) => {
      // Approximate Mean Curvature H for coloring
      const k = 0.025;
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

      // 1. Smooth Curvature Interpolation
      const approach = (current: number, target: number, speed: number) =>
        current + (target - current) * speed;

      const target = isDraggingRef.current ? targetCurvatureRef.current : 0;
      const newCurv = approach(curvature, target, 0.05);
      setCurvature(newCurv);

      // 2. Physics Update
      let totalDissipation = 0;

      particlesRef.current.forEach((p) => {
        // Brownian motion
        p.vx += (Math.random() - 0.5) * TEMPERATURE;
        p.vy += (Math.random() - 0.5) * TEMPERATURE;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Update Position
        p.x += p.vx;
        p.y += p.vy;

        // Boundary Wrap
        const limit = 200;
        if (p.x > limit) p.x = -limit;
        if (p.x < -limit) p.x = limit;
        if (p.y > limit) p.y = -limit;
        if (p.y < -limit) p.y = limit;

        // Calculate Heat (Thermodynamic Cost)
        // Cost ~ Mean Curvature squared (H^2) + centrifugal term
        const H_val = getMeanCurvature(p.x, p.y, newCurv);
        const kinetic = p.vx * p.vx + p.vy * p.vy;
        p.heat = Math.min(1, H_val * 400 + H_val * kinetic * 100);
        totalDissipation += p.heat;
      });

      // 3. Rendering
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      // A. Draw Wireframe Surface
      ctx.lineWidth = 1;
      const grid: { x: number; y: number; scale: number; z: number }[][] = [];
      const range = 200;
      const step = (range * 2) / GRID_RES;

      for (let i = 0; i <= GRID_RES; i++) {
        const x = -range + i * step;
        const row: { x: number; y: number; scale: number; z: number }[] = [];
        for (let j = 0; j <= GRID_RES; j++) {
          const y = -range + j * step;
          const z = getSurfaceZ(x, y, newCurv);
          row.push(project({ x, y, z }, W, H, rotX, rotY));
        }
        grid.push(row);
      }

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + newCurv * 0.1})`;
      ctx.beginPath();
      // Horizontal lines
      for (let i = 0; i <= GRID_RES; i++) {
        for (let j = 0; j < GRID_RES; j++) {
          const p1 = grid[i][j];
          const p2 = grid[i][j + 1];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      // Vertical lines
      for (let i = 0; i < GRID_RES; i++) {
        for (let j = 0; j <= GRID_RES; j++) {
          const p1 = grid[i][j];
          const p2 = grid[i + 1][j];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();

      // B. Draw Particles (sorted by depth)
      const screenParticles = particlesRef.current.map((p) => {
        const z = getSurfaceZ(p.x, p.y, newCurv);
        return {
          ...p,
          ...project({ x: p.x, y: p.y, z }, W, H, rotX, rotY),
        };
      });

      screenParticles.sort((a, b) => b.z - a.z);

      screenParticles.forEach((p) => {
        const r = Math.floor(50 + p.heat * 205);
        const g = Math.floor(150 - p.heat * 100);
        const b = Math.floor(255 - p.heat * 205);
        const alpha = Math.max(0.2, p.scale);

        ctx.fillStyle = `rgba(${r},${g},${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.scale + p.heat * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Render Dissipation Graph
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
        gCtx.moveTo(0, 60 - historyRef.current[0] * 50);
        for (let i = 1; i < 100; i++) {
          gCtx.lineTo(i * 2, 60 - historyRef.current[i] * 50);
        }
        const severity = historyRef.current[99];
        gCtx.strokeStyle = severity > 0.5 ? '#ef4444' : '#22c55e';
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
  }, [curvature, project, getSurfaceZ, getMeanCurvature]);

  // === HANDLERS ===
  const handleStart = useCallback((clientX: number, clientY: number) => {
    dragStartRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = true;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const xRel = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    targetCurvatureRef.current = xRel;
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const xRel = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    targetCurvatureRef.current = xRel;

    // Tilt camera with Y movement
    const yRel = (clientY - rect.top) / rect.height;
    rotationRef.current.x = 0.5 + yRel * 1.0;
  }, []);

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
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
            2D Manifold in 3D Space
          </h2>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500">DIMENSIONAL WORK</span>
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
        className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 cursor-crosshair select-none"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-auto block"
        />

        {/* Interaction Prompt */}
        <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-0">
          <span className="bg-slate-800/80 text-slate-200 px-3 py-1 rounded-full text-xs border border-slate-600">
            DRAG TO BEND SURFACE (X) + TILT VIEW (Y)
          </span>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                curvature > 0.4 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span
              className={
                curvature > 0.4 ? 'text-red-400' : 'text-emerald-400'
              }
            >
              {curvature > 0.4 ? 'HIGH MEAN CURVATURE' : 'FLAT GEOMETRY'}
            </span>
          </div>
          <div className="text-slate-500 text-xs">
            Amplitude: {curvature.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-4 text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
        <strong>3D Brownian motion confined to a 2D surface.</strong>{' '}
        Drag horizontally to increase surface amplitude (egg-crate geometry).
        Particles heat up (<span className="text-red-400">red</span>) at peaks and
        troughs where mean curvature H is high. The thermodynamic cost scales as
        H&sup2;&mdash;the same geometric work principle, one dimension higher.
      </p>
    </div>
  );
}
