'use client';

/**
 * ObserverDemo - "The Map is Not The Territory"
 *
 * A visible 3D Torus (Donut) rotates.
 * - LEFT (Dynamics): The full object - high-dimensional, coherent.
 * - RIGHT (Observer): 1D projections (shadow width/height).
 *
 * INTERACTION:
 * - Hover: Rotates the Torus. Charts show smooth sine waves.
 * - Click & Hold: Deforms the mesh. Charts show noise/chaos.
 */

import { useRef, useEffect, useCallback } from 'react';

const COLORS = {
  BG: '#000000',
  DYNAMICS: '#22c55e', // Bright Green
  SENSOR_A: '#06b6d4', // Cyan
  SENSOR_B: '#f97316', // Orange
  GRID: '#333333',
  TEXT_SUB: '#94a3b8',
};

export default function ObserverDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    time: 0,
    rotationY: 0,
    rotationX: 0,
    targetRotY: 0,
    targetRotX: 0,
    distortion: 0,
    isDistorting: false,
    historyA: new Array(300).fill(0.5),
    historyB: new Array(300).fill(0.5),
  });

  const SCALE = 2;
  const W = 640 * SCALE;
  const H = 360 * SCALE;

  // Layout
  const SPLIT_X = W * 0.5;
  const CHART_X = SPLIT_X + 60 * SCALE;
  const CHART_W = W - CHART_X - 40 * SCALE;
  const CHART_H = 80 * SCALE;

  // === GEOMETRY: STANDARD TORUS (DONUT) ===
  const getTorusPoint = useCallback(
    (u: number, v: number, distortion: number) => {
      // R = Major Radius (Distance from center to tube center)
      // r = Minor Radius (Tube radius)
      const R = 70 * SCALE;
      let r = 30 * SCALE;

      // DISTORTION:
      // If holding click, we vibrate the tube radius
      if (distortion > 0.01) {
        // High frequency noise
        const noise = Math.sin(u * 20 + v * 10 + Math.random()) * distortion * 10 * SCALE;
        r += noise;
      }

      // Standard Torus Formula
      // x = (R + r cos v) cos u
      // y = (R + r cos v) sin u
      // z = r sin v
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);

      return { x, y, z };
    },
    [SCALE]
  );

  const rotate = useCallback((x: number, y: number, z: number, rx: number, ry: number) => {
    // Rotate Y
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = x * Math.sin(ry) + z * Math.cos(ry);
    // Rotate X
    const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
    return { x: x1, y: y2, z: z2 };
  }, []);

  const project = useCallback((x: number, y: number, z: number) => {
    const fov = 500;
    const scale = fov / (fov + z + 400);
    return { x: x * scale, y: y * scale, scale };
  }, []);

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;

      // Update Physics
      state.time += 0.01;
      state.rotationY += (state.targetRotY - state.rotationY) * 0.05 + 0.005;
      state.rotationX += (state.targetRotX - state.rotationX) * 0.05;

      const targetDist = state.isDistorting ? 1.0 : 0.0;
      state.distortion += (targetDist - state.distortion) * 0.2;

      // Clear BG
      ctx.fillStyle = COLORS.BG;
      ctx.fillRect(0, 0, W, H);

      // --- LABELS ---
      ctx.textAlign = 'center';

      // Left
      ctx.fillStyle = COLORS.DYNAMICS;
      ctx.font = `bold ${32 * SCALE}px system-ui`;
      ctx.fillText('DYNAMICS', SPLIT_X / 2, 50 * SCALE);
      ctx.fillStyle = COLORS.TEXT_SUB;
      ctx.font = `${14 * SCALE}px system-ui`;
      ctx.fillText('High-dimensional · Coherent', SPLIT_X / 2, 80 * SCALE);

      // Right
      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${32 * SCALE}px system-ui`;
      ctx.fillText('OBSERVATIONS', SPLIT_X + (W - SPLIT_X) / 2, 50 * SCALE);
      ctx.fillStyle = COLORS.TEXT_SUB;
      ctx.font = `${14 * SCALE}px system-ui`;
      ctx.fillText('Low-dimensional · Projected', SPLIT_X + (W - SPLIT_X) / 2, 80 * SCALE);

      // Footer
      ctx.fillStyle = '#666';
      ctx.font = `italic ${14 * SCALE}px system-ui`;
      ctx.fillText(
        '"Structure is lost in projection. The map is not the territory."',
        W / 2,
        H - 20 * SCALE
      );

      // Arrow
      ctx.save();
      ctx.translate(SPLIT_X, H / 2);
      ctx.fillStyle = '#444';
      ctx.font = `bold ${12 * SCALE}px system-ui`;
      ctx.fillText('MEASURE', 0, -10 * SCALE);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2 * SCALE;
      ctx.beginPath();
      ctx.moveTo(-20 * SCALE, 5 * SCALE);
      ctx.lineTo(20 * SCALE, 5 * SCALE);
      ctx.lineTo(15 * SCALE, 0);
      ctx.moveTo(20 * SCALE, 5 * SCALE);
      ctx.lineTo(15 * SCALE, 10 * SCALE);
      ctx.stroke();
      ctx.restore();

      // --- RENDER DYNAMICS (LEFT) ---
      const centerX = SPLIT_X / 2;
      const centerY = H / 2;

      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;

      ctx.lineWidth = 1 * SCALE;
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.4 + state.distortion * 0.4})`; // Green

      // DRAW RINGS (The Wireframe)
      const uSteps = 40; // Number of rings (Major steps)
      const vSteps = 20; // Resolution of each ring (Minor steps)

      for (let i = 0; i < uSteps; i++) {
        const u = (i / uSteps) * Math.PI * 2;

        ctx.beginPath();
        for (let j = 0; j <= vSteps; j++) {
          const v = (j / vSteps) * Math.PI * 2;

          // 1. Get Point
          const p = getTorusPoint(u, v, state.distortion);

          // 2. Rotate
          const r = rotate(p.x, p.y, p.z, state.rotationX, state.rotationY);

          // 3. Project
          const proj = project(r.x, r.y, r.z);
          const sx = centerX + proj.x;
          const sy = centerY + proj.y;

          // Draw Line
          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);

          // Track Bounds for Sensors
          if (proj.x < minX) minX = proj.x;
          if (proj.x > maxX) maxX = proj.x;
          if (proj.y < minY) minY = proj.y;
          if (proj.y > maxY) maxY = proj.y;
        }
        ctx.stroke();
      }

      // --- SENSORS (RIGHT) ---
      const widthVal = maxX - minX;
      const heightVal = maxY - minY;

      const range = 220 * SCALE;
      const sigA = Math.min(1, Math.max(0, widthVal / range));
      const sigB = Math.min(1, Math.max(0, heightVal / range));

      state.historyA.push(sigA);
      state.historyA.shift();
      state.historyB.push(sigB);
      state.historyB.shift();

      // --- RENDER CHARTS ---
      const drawChart = (data: number[], yOff: number, color: string) => {
        // Box
        ctx.strokeStyle = COLORS.GRID;
        ctx.lineWidth = 1 * SCALE;
        ctx.strokeRect(CHART_X, yOff, CHART_W, CHART_H);
        // Center line
        ctx.beginPath();
        ctx.strokeStyle = '#222';
        ctx.moveTo(CHART_X, yOff + CHART_H / 2);
        ctx.lineTo(CHART_X + CHART_W, yOff + CHART_H / 2);
        ctx.stroke();

        // Wave
        ctx.beginPath();
        ctx.lineWidth = 2 * SCALE;
        ctx.strokeStyle = color;
        for (let k = 0; k < data.length; k++) {
          const x = CHART_X + (k / data.length) * CHART_W;
          const val = data[k] - 0.5;
          const y = yOff + CHART_H / 2 - val * CHART_H * 0.8;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawChart(state.historyA, H / 2 - CHART_H - 20 * SCALE, COLORS.SENSOR_A);
      drawChart(state.historyB, H / 2 + 20 * SCALE, COLORS.SENSOR_B);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [getTorusPoint, rotate, project, SCALE]);

  // --- INTERACTION ---
  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const nx = ((cx - rect.left) / rect.width - 0.5) * 2;
      const ny = ((cy - rect.top) / rect.height - 0.5) * 2;

      stateRef.current.targetRotY = nx * Math.PI;
      stateRef.current.targetRotX = ny * Math.PI * 0.5;
    },
    []
  );

  const handleStart = useCallback(() => {
    stateRef.current.isDistorting = true;
  }, []);
  const handleEnd = useCallback(() => {
    stateRef.current.isDistorting = false;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        width: '100%',
        maxWidth: W / SCALE,
        aspectRatio: `${W} / ${H}`,
        touchAction: 'none',
      }}
      className="rounded-xl cursor-crosshair bg-black shadow-2xl"
      onMouseMove={handleMove}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    />
  );
}
