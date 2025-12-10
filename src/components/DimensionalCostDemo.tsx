'use client';

/**
 * DimensionalCostDemo - "The Cost of Curvature"
 *
 * Visualization for "Thermodynamic costs of dimensional reduction"
 *
 * PHYSICS:
 * - 2D Brownian Motion confined to a 1D manifold y = A * sin(kx).
 * - "Control Force" is applied perpendicular to the manifold to suppress orthogonal fluctuations.
 * - VISUAL: Particles glow hotter (Blue -> Red) proportional to the instantaneous work
 *   required to keep them on the manifold.
 *
 * INTERACTION:
 * - User drags to bend the manifold (increase curvature).
 * - Observe the "Thermodynamic Bill" (Heat dissipation graph) spike.
 */

import { useRef, useEffect, useState, useCallback } from 'react';

// === TYPES ===
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heat: number; // 0 to 1, represents instantaneous dissipation
}

// === CONSTANTS ===
const N_PARTICLES = 400;
const DAMPING = 0.90; // Overdamped-ish
const TEMPERATURE = 0.35; // Strength of Brownian kick
const STIFFNESS = 0.15; // Strength of confinement potential
const MANIFOLD_SPEED = 2.0; // Flow speed along manifold

export default function DimensionalCostDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Physics State
  const particlesRef = useRef<Particle[]>([]);
  const historyRef = useRef<number[]>(new Array(100).fill(0)); // Rolling graph data

  // Interaction State
  const [curvature, setCurvature] = useState(0); // 0 (Line) to 1 (High freq/amp)
  const targetCurvatureRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Dimensions
  const W = 800;
  const H = 400;

  // === INITIALIZATION ===
  useEffect(() => {
    // Spawn particles in a cloud
    const p: Particle[] = [];
    for (let i = 0; i < N_PARTICLES; i++) {
      p.push({
        x: Math.random() * W,
        y: H / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        heat: 0,
      });
    }
    particlesRef.current = p;
  }, []);

  // === ANIMATION LOOP ===
  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      const graphCanvas = graphRef.current;
      const ctx = canvas?.getContext('2d');
      const gCtx = graphCanvas?.getContext('2d');

      if (!canvas || !ctx || !graphCanvas || !gCtx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      // 1. Smoothly interpolate curvature based on user input
      const approach = (current: number, target: number, speed: number) => {
        return current + (target - current) * speed;
      };
      // Auto-relax to 0 if not interacting
      const target = isDraggingRef.current ? targetCurvatureRef.current : 0;
      const newCurv = approach(curvature, target, 0.05);
      setCurvature(newCurv);

      // Define Manifold: y = H/2 + Amp * sin(freq * x)
      const amplitude = newCurv * 120;
      const freq = (Math.PI * 2 * (1 + newCurv * 3)) / W;

      const getManifoldY = (x: number) => H / 2 + amplitude * Math.sin(freq * x + Date.now() * 0.002);

      // 2. Physics Update
      let totalDissipation = 0;

      particlesRef.current.forEach(p => {
        // A. Flow along X (Transport)
        p.vx += (MANIFOLD_SPEED - p.vx) * 0.05;
        p.x += p.vx;

        // Wrap around screen
        if (p.x > W) p.x = 0;
        if (p.x < 0) p.x = W;

        // B. Manifold Confinement (The Dimensional Work)
        const targetY = getManifoldY(p.x);
        const distY = p.y - targetY;

        // Force required to keep it on the line = -k * dist
        const forceY = -STIFFNESS * distY;

        // Add Brownian Noise (The "Eroding Force")
        const noiseX = (Math.random() - 0.5) * TEMPERATURE;
        const noiseY = (Math.random() - 0.5) * TEMPERATURE;

        p.vx += noiseX;
        p.vy += forceY + noiseY;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        p.y += p.vy;

        // C. Calculate Thermodynamic Cost
        // Work is proportional to the magnitude of the control force squared (Joule heating)
        // High curvature -> steeper potential -> higher avg force to maintain confinement
        const instantaneousWork = Math.abs(forceY) * 5;
        p.heat = Math.min(1, instantaneousWork);
        totalDissipation += p.heat;
      });

      // 3. Render Main View
      ctx.fillStyle = '#0f172a'; // Slate-900
      ctx.fillRect(0, 0, W, H);

      // Draw Manifold (Ghostly)
      ctx.beginPath();
      ctx.moveTo(0, getManifoldY(0));
      for (let x = 0; x < W; x+=10) {
        ctx.lineTo(x, getManifoldY(x));
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + newCurv * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Particles
      particlesRef.current.forEach(p => {
        // Color Mapping: Blue (Cold/Low Work) -> Red (Hot/High Work)
        // R: 50 -> 255
        // G: 150 -> 50
        // B: 255 -> 50
        const r = Math.floor(50 + p.heat * 205);
        const g = Math.floor(150 - p.heat * 100);
        const b = Math.floor(255 - p.heat * 205);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        const size = 2 + p.heat * 3; // Swell when hot
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Render Dissipation Graph (The "Lab Equipment" view)
      historyRef.current.shift();
      historyRef.current.push(totalDissipation / N_PARTICLES);

      gCtx.clearRect(0, 0, 200, 60);
      gCtx.fillStyle = '#0f172a';
      gCtx.fillRect(0, 0, 200, 60);

      // Grid lines
      gCtx.strokeStyle = '#1e293b';
      gCtx.lineWidth = 1;
      gCtx.beginPath();
      gCtx.moveTo(0, 30); gCtx.lineTo(200, 30);
      gCtx.stroke();

      // Signal
      gCtx.beginPath();
      gCtx.moveTo(0, 60 - historyRef.current[0] * 50);
      for(let i=1; i<100; i++) {
        gCtx.lineTo(i*2, 60 - historyRef.current[i] * 50);
      }
      // Color graph based on severity
      const severity = historyRef.current[99];
      gCtx.strokeStyle = severity > 0.5 ? '#ef4444' : '#22c55e';
      gCtx.lineWidth = 2;
      gCtx.stroke();

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [curvature]);

  // === HANDLERS ===
  const handleInput = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    targetCurvatureRef.current = x;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-sm">

      {/* HUD Header */}
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <h3 className="text-slate-400 text-xs tracking-widest uppercase">Simulation</h3>
          <h2 className="text-slate-100 font-bold text-lg">Manifold Projection Cost</h2>
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
        className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
        onMouseDown={(e) => handleInput(e.clientX)}
        onMouseMove={(e) => {
            if(e.buttons === 1) handleInput(e.clientX)
        }}
        onMouseUp={() => { isDraggingRef.current = false; }}
        onMouseLeave={() => { isDraggingRef.current = false; }}
        onTouchStart={(e) => handleInput(e.touches[0].clientX)}
        onTouchMove={(e) => handleInput(e.touches[0].clientX)}
        onTouchEnd={() => { isDraggingRef.current = false; }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto block cursor-col-resize active:cursor-grabbing"
        />

        {/* Interaction Prompt Overlay */}
        <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-0">
          <span className="bg-slate-800/80 text-slate-200 px-3 py-1 rounded-full text-xs border border-slate-600">
            DRAG TO BEND MANIFOLD
          </span>
        </div>

        {/* Real-time Stats Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${curvature > 0.5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className={curvature > 0.5 ? 'text-red-400' : 'text-emerald-400'}>
              {curvature > 0.5 ? 'HIGH DISSIPATION' : 'OPTIMAL TRANSPORT'}
            </span>
          </div>
          <div className="text-slate-500 text-xs">
            Curvature: {curvature.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-4 text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
        <strong>The cost of maintaining a low-dimensional representation.</strong>{' '}
        Particles (microstates) are confined to a 1D manifold. Bending the manifold (drag left/right) increases
        geometric curvature, requiring larger control forces to suppress orthogonal fluctuations.
        This manifests as increased thermodynamic work, visualized by the <span className="text-red-400">red shift</span>.
      </p>
    </div>
  );
}
