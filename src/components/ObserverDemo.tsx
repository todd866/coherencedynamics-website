'use client';

/**
 * ObserverDemo - "The Map is Not The Territory"
 *
 * LEFT: 4D Hyper-Object (Clifford Torus). Coherent, continuous math.
 * RIGHT: 2D Sensor Projections. Reduced, noisy observations.
 *
 * INTERACTION:
 * - Move Mouse: Rotates the object in 4D space (turns inside out).
 * - Click & Hold: "Perturbs" the system (adds noise/distortion).
 */

import { useRef, useEffect, useCallback } from 'react';

const COLORS = {
  BG: '#000000',
  DYNAMICS: '#22c55e', // Bright Green
  SENSOR_A: '#06b6d4', // Cyan (Top wave)
  SENSOR_B: '#f97316', // Orange (Bottom wave)
  GRID: '#333333',
  TEXT_MAIN: '#ffffff',
  TEXT_SUB: '#94a3b8',
};

export default function ObserverDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Mutable state for high-performance animation
  const stateRef = useRef({
    time: 0,
    rotXY: 0, // Rotation in 3D plane
    rotZW: 0, // Rotation in 4th dimension
    targetRotXY: 0,
    targetRotZW: 0,
    distortion: 0, // 0.0 to 1.0 (Perturbation amount)
    isDistorting: false,
    // Sensor history (Signal buffers)
    historyA: new Array(300).fill(0.5),
    historyB: new Array(300).fill(0.5),
  });

  // Dimensions
  const SCALE = 2; // Retina scaling
  const W = 640 * SCALE;
  const H = 360 * SCALE;

  // Layout Constants
  const SPLIT_X = W * 0.5; // Vertical divider
  const CHART_X = SPLIT_X + 60 * SCALE;
  const CHART_W = W - CHART_X - 40 * SCALE;
  const CHART_H = 80 * SCALE;

  // === 4D MATH ===
  // 1. Clifford Torus Parametric Eq (4D)
  const getCliffordPoint = useCallback((u: number, v: number, distortion: number) => {
    // Add "noise" to radius if distorted
    const noise = distortion > 0.01 ? Math.sin(u * 20 + v * 10) * distortion * 0.2 : 0;
    const r = 100 * SCALE * (1 + noise);

    // x, y, z, w coordinates on unit 3-sphere
    return {
      x: r * Math.cos(u),
      y: r * Math.sin(u),
      z: r * Math.cos(v),
      w: r * Math.sin(v),
    };
  }, []);

  // 2. 4D Rotation (Double Rotation)
  const rotate4D = useCallback(
    (p: { x: number; y: number; z: number; w: number }, tXY: number, tZW: number) => {
      // XY Plane
      const x1 = p.x * Math.cos(tXY) - p.y * Math.sin(tXY);
      const y1 = p.x * Math.sin(tXY) + p.y * Math.cos(tXY);
      // ZW Plane (The "Inside Out" rotation)
      const z1 = p.z * Math.cos(tZW) - p.w * Math.sin(tZW);
      const w1 = p.z * Math.sin(tZW) + p.w * Math.cos(tZW);
      return { x: x1, y: y1, z: z1, w: w1 };
    },
    []
  );

  // 3. Project 4D -> 3D -> 2D
  const projectToScreen = useCallback((p4: { x: number; y: number; z: number; w: number }) => {
    // Stereographic 4D -> 3D
    const camDist4D = 300 * SCALE;
    const s4 = camDist4D / (camDist4D - p4.w);
    const p3 = { x: p4.x * s4, y: p4.y * s4, z: p4.z * s4 };

    // Perspective 3D -> 2D
    const camDist3D = 500;
    const s3 = camDist3D / (camDist3D + p3.z + 400); // 400 = z-offset

    return {
      x: p3.x * s3,
      y: p3.y * s3,
      scale: s3,
    };
  }, []);

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;

      // --- PHYSICS UPDATE ---
      state.time += 0.015;
      // Smooth rotation interpolation
      state.rotXY += (state.targetRotXY - state.rotXY) * 0.05;
      state.rotZW += (state.targetRotZW - state.rotZW) * 0.05;

      // Distortion Spring
      const targetDist = state.isDistorting ? 0.8 : 0.0;
      state.distortion += (targetDist - state.distortion) * 0.1;

      // --- DRAW BACKGROUND ---
      ctx.fillStyle = COLORS.BG;
      ctx.fillRect(0, 0, W, H);

      // --- LABELS ---
      ctx.textAlign = 'center';

      // Left Header
      ctx.fillStyle = COLORS.DYNAMICS;
      ctx.font = `bold ${32 * SCALE}px system-ui`;
      ctx.fillText('DYNAMICS', SPLIT_X / 2, 50 * SCALE);
      ctx.fillStyle = COLORS.TEXT_SUB;
      ctx.font = `${14 * SCALE}px system-ui`;
      ctx.fillText('High-dimensional · Coherent', SPLIT_X / 2, 80 * SCALE);

      // Right Header
      ctx.fillStyle = '#f59e0b'; // Amber for title
      ctx.font = `bold ${32 * SCALE}px system-ui`;
      ctx.fillText('OBSERVATIONS', SPLIT_X + (W - SPLIT_X) / 2, 50 * SCALE);
      ctx.fillStyle = COLORS.TEXT_SUB;
      ctx.font = `${14 * SCALE}px system-ui`;
      ctx.fillText('Low-dimensional · Projected', SPLIT_X + (W - SPLIT_X) / 2, 80 * SCALE);

      // Footer Quote
      ctx.fillStyle = '#666';
      ctx.font = `italic ${14 * SCALE}px system-ui`;
      ctx.fillText(
        '"Structure is lost in projection. The map is not the territory."',
        W / 2,
        H - 20 * SCALE
      );

      // "MEASURE" Arrow
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

      ctx.lineWidth = 1.5 * SCALE;
      ctx.lineJoin = 'round';

      // Draw wireframe rings
      const rings = 30;
      const segs = 40;

      for (let i = 0; i < rings; i++) {
        const u = (i / rings) * Math.PI * 2 + state.time * 0.2;

        ctx.beginPath();
        for (let j = 0; j <= segs; j++) {
          const v = (j / segs) * Math.PI * 2;

          // 4D -> 3D -> 2D
          const p4 = getCliffordPoint(u, v, state.distortion);
          const p4rot = rotate4D(p4, state.rotXY, state.rotZW);
          const p2 = projectToScreen(p4rot);

          const sx = centerX + p2.x;
          const sy = centerY + p2.y;

          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);

          // Track Bounds (Simulate Sensors)
          if (p2.x < minX) minX = p2.x;
          if (p2.x > maxX) maxX = p2.x;
          if (p2.y < minY) minY = p2.y;
          if (p2.y > maxY) maxY = p2.y;
        }

        // Dynamic Green Color (Alpha based on depth/w)
        ctx.strokeStyle = `rgba(34, 197, 94, 0.4)`;
        ctx.stroke();
      }

      // --- UPDATE SENSORS (RIGHT) ---
      // We simulate a sensor reading the projected width/height
      // Add a tiny bit of random sensor noise for realism
      const sensorNoise = (Math.random() - 0.5) * 5 * SCALE;

      const widthVal = maxX - minX + sensorNoise;
      const heightVal = maxY - minY + sensorNoise;

      // Normalize to 0..1 range (approximate)
      const range = 250 * SCALE;
      const signalA = Math.min(1, Math.max(0, widthVal / range));
      const signalB = Math.min(1, Math.max(0, heightVal / range));

      state.historyA.push(signalA);
      state.historyA.shift();
      state.historyB.push(signalB);
      state.historyB.shift();

      // --- RENDER CHARTS ---
      const drawChart = (data: number[], yOffset: number, color: string) => {
        // Frame
        ctx.strokeStyle = COLORS.GRID;
        ctx.lineWidth = 1 * SCALE;
        ctx.strokeRect(CHART_X, yOffset, CHART_W, CHART_H);

        // Center Line (Zero)
        ctx.beginPath();
        ctx.moveTo(CHART_X, yOffset + CHART_H / 2);
        ctx.lineTo(CHART_X + CHART_W, yOffset + CHART_H / 2);
        ctx.stroke();

        // Waveform
        ctx.beginPath();
        ctx.lineWidth = 2 * SCALE;
        ctx.strokeStyle = color;

        for (let k = 0; k < data.length; k++) {
          const x = CHART_X + (k / data.length) * CHART_W;
          // Invert Y so up is positive, scale to fit box
          const val = data[k] - 0.6; // shift baseline
          const y = yOffset + CHART_H / 2 - val * CHART_H;

          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      // Draw Top Chart (Cyan)
      drawChart(state.historyA, H / 2 - CHART_H - 20 * SCALE, COLORS.SENSOR_A);

      // Draw Bottom Chart (Orange)
      drawChart(state.historyB, H / 2 + 20 * SCALE, COLORS.SENSOR_B);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [getCliffordPoint, rotate4D, projectToScreen]);

  // --- INTERACTION ---
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Normalize -1 to 1
      const nx = ((cx - rect.left) / rect.width - 0.5) * 2;
      const ny = ((cy - rect.top) / rect.height - 0.5) * 2;

      stateRef.current.targetRotXY = nx * Math.PI;
      stateRef.current.targetRotZW = ny * Math.PI;
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
        maxWidth: 640,
        aspectRatio: `${W} / ${H}`,
        touchAction: 'none',
      }}
      className="rounded-xl cursor-move bg-black shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleEnd}
    />
  );
}
