'use client';

/**
 * ObserverDemo - "Dimensional Collapse + Noise"
 *
 * A TRUE 4D Tesseract (hypercube) projected to 3D.
 * - 16 vertices in (x, y, z, w) space
 * - Sine waves control rotations through 4D planes (XW, YW, ZW)
 * - 3D "shadow" shows the collapse artifact
 *
 * INTERACTION:
 * - Drag sine waves to inject 4D rotation (noise)
 * - Watch the 3D shadow morph as 4D structure is collapsed
 */

import { useRef, useEffect, useCallback } from 'react';

const COLORS = {
  BG: '#000000',
  XW: '#ef4444', // Red
  YW: '#22c55e', // Green
  ZW: '#3b82f6', // Blue
  EDGE: 'rgba(100, 100, 100, 0.5)',
  VERTEX: '#ffffff',
  TEXT: '#94a3b8',
};

// 4D Vector
interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export default function ObserverDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    time: 0,
    // 4D rotation angles
    xwAngle: 0,
    ywAngle: 0,
    zwAngle: 0,
    // Rotation speeds (controlled by dragging)
    xwSpeed: 0.3,
    ywSpeed: 0.0,
    zwSpeed: 0.0,
    // 3D camera rotation
    cameraAngle: 0,
    // Drag state
    isDragging: false,
    dragAxis: null as string | null,
  });

  const SCALE = 2;
  const W = 700 * SCALE;
  const H = 500 * SCALE;

  // Layout: top 60% for 3D, bottom 40% for waves
  const VIEW_HEIGHT = H * 0.6;
  const WAVE_HEIGHT = H * 0.4;
  const WAVE_ROW = WAVE_HEIGHT / 3;

  // Generate tesseract vertices: all combinations of ±1 in 4D
  const tesseractVertices: Vec4[] = [];
  for (let i = 0; i < 16; i++) {
    tesseractVertices.push({
      x: (i & 1) ? 1 : -1,
      y: (i & 2) ? 1 : -1,
      z: (i & 4) ? 1 : -1,
      w: (i & 8) ? 1 : -1,
    });
  }

  // Find edges: vertices that differ by exactly 1 coordinate
  const edges: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const v1 = tesseractVertices[i];
      const v2 = tesseractVertices[j];
      let diff = 0;
      if (v1.x !== v2.x) diff++;
      if (v1.y !== v2.y) diff++;
      if (v1.z !== v2.z) diff++;
      if (v1.w !== v2.w) diff++;
      if (diff === 1) edges.push([i, j]);
    }
  }

  // 4D rotation in a plane
  const rotate4D = useCallback((v: Vec4, angle: number, plane: string): Vec4 => {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const result = { ...v };

    if (plane === 'xw') {
      result.x = v.x * c - v.w * s;
      result.w = v.x * s + v.w * c;
    } else if (plane === 'yw') {
      result.y = v.y * c - v.w * s;
      result.w = v.y * s + v.w * c;
    } else if (plane === 'zw') {
      result.z = v.z * c - v.w * s;
      result.w = v.z * s + v.w * c;
    }
    return result;
  }, []);

  // 4D → 3D stereographic projection
  const project4Dto3D = useCallback((v: Vec4): { x: number; y: number; z: number; depth: number } => {
    const distance = 3;
    const scale = 1 / (distance - v.w);
    return {
      x: v.x * scale,
      y: v.y * scale,
      z: v.z * scale,
      depth: v.w,
    };
  }, []);

  // 3D → 2D perspective projection with camera rotation
  const project3Dto2D = useCallback(
    (x: number, y: number, z: number, cameraAngle: number): { x: number; y: number; scale: number } => {
      // Rotate around Y axis
      const rx = x * Math.cos(cameraAngle) - z * Math.sin(cameraAngle);
      const rz = x * Math.sin(cameraAngle) + z * Math.cos(cameraAngle);

      const fov = 4;
      const scale = fov / (fov + rz + 2);
      return {
        x: rx * scale,
        y: y * scale,
        scale,
      };
    },
    []
  );

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;

      // Update physics
      state.time += 0.016;
      state.xwAngle += state.xwSpeed * 0.02;
      state.ywAngle += state.ywSpeed * 0.02;
      state.zwAngle += state.zwSpeed * 0.02;
      state.cameraAngle += 0.003; // Slow auto-rotate

      // Clear
      ctx.fillStyle = COLORS.BG;
      ctx.fillRect(0, 0, W, H);

      // Divider line
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, VIEW_HEIGHT);
      ctx.lineTo(W, VIEW_HEIGHT);
      ctx.stroke();

      // --- TITLE ---
      ctx.fillStyle = '#eee';
      ctx.font = `bold ${18 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('4D Tesseract Shadow', 20 * SCALE, 30 * SCALE);
      ctx.fillStyle = '#666';
      ctx.font = `${12 * SCALE}px system-ui`;
      ctx.fillText('Drag the waves to inject 4D rotation noise', 20 * SCALE, 50 * SCALE);

      // --- RENDER 3D VIEW ---
      const centerX = W / 2;
      const centerY = VIEW_HEIGHT / 2;
      const renderScale = 80 * SCALE;

      // Transform all vertices
      const projected: { x: number; y: number; scale: number; depth: number }[] = [];
      for (const v of tesseractVertices) {
        // Apply 4D rotations
        let p = { ...v };
        p = rotate4D(p, state.xwAngle, 'xw');
        p = rotate4D(p, state.ywAngle, 'yw');
        p = rotate4D(p, state.zwAngle, 'zw');

        // 4D → 3D
        const p3 = project4Dto3D(p);

        // 3D → 2D
        const p2 = project3Dto2D(p3.x, p3.y, p3.z, state.cameraAngle);
        projected.push({
          x: centerX + p2.x * renderScale,
          y: centerY - p2.y * renderScale, // flip Y
          scale: p2.scale,
          depth: p3.depth,
        });
      }

      // Draw edges
      ctx.strokeStyle = COLORS.EDGE;
      ctx.lineWidth = 1.5 * SCALE;
      for (const [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];

        // Fade edges based on 4D depth
        const avgDepth = (tesseractVertices[i].w + tesseractVertices[j].w) / 2;
        const alpha = 0.2 + (avgDepth + 1) * 0.3;
        ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw vertices
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const v = tesseractVertices[i];

        // Size based on 4D depth (closer in 4D = bigger)
        const size = (3 + v.w) * 2 * SCALE;

        // Color based on 4D depth
        const brightness = Math.floor(150 + (v.w + 1) * 50);
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(2, size), 0, Math.PI * 2);
        ctx.fill();
      }

      // --- RENDER WAVE CONTROLS ---
      const axes = [
        { key: 'xw', label: 'XW Rotation', color: COLORS.XW, speed: state.xwSpeed },
        { key: 'yw', label: 'YW Rotation', color: COLORS.YW, speed: state.ywSpeed },
        { key: 'zw', label: 'ZW Rotation', color: COLORS.ZW, speed: state.zwSpeed },
      ];

      axes.forEach((axis, index) => {
        const yBase = VIEW_HEIGHT + index * WAVE_ROW;
        const yCenter = yBase + WAVE_ROW / 2;

        // Center line
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, yCenter);
        ctx.lineTo(W, yCenter);
        ctx.stroke();

        // Draw sine wave
        ctx.beginPath();
        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 2 * SCALE;

        for (let x = 0; x < W; x += 2) {
          const t = state.time + x * 0.003;
          const val = Math.sin(t) * axis.speed * 30 * SCALE;
          const y = yCenter - val;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = axis.color;
        ctx.font = `bold ${14 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText(axis.label, 15 * SCALE, yBase + 20 * SCALE);

        // Speed indicator
        ctx.fillStyle = '#666';
        ctx.font = `${12 * SCALE}px system-ui`;
        ctx.fillText(`Speed: ${axis.speed.toFixed(1)}`, 15 * SCALE, yBase + 38 * SCALE);
      });

      // Instructions
      ctx.fillStyle = '#555';
      ctx.font = `${11 * SCALE}px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText('Drag waves up/down to change 4D rotation speed', W - 15 * SCALE, H - 15 * SCALE);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, project4Dto3D, project3Dto2D, tesseractVertices, edges]);

  // --- INTERACTION ---
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const cy = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      return {
        x: (cx - rect.left) * scaleX,
        y: (cy - rect.top) * scaleY,
      };
    },
    []
  );

  const handleStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { y } = getCanvasCoords(e);

      // Check if in wave area
      if (y > VIEW_HEIGHT) {
        const waveIndex = Math.floor((y - VIEW_HEIGHT) / WAVE_ROW);
        const axes = ['xw', 'yw', 'zw'];
        if (waveIndex >= 0 && waveIndex < 3) {
          stateRef.current.isDragging = true;
          stateRef.current.dragAxis = axes[waveIndex];
        }
      }
    },
    [getCanvasCoords]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!stateRef.current.isDragging || !stateRef.current.dragAxis) return;

      const { y } = getCanvasCoords(e);
      const axis = stateRef.current.dragAxis;
      const waveIndex = ['xw', 'yw', 'zw'].indexOf(axis);
      const yBase = VIEW_HEIGHT + waveIndex * WAVE_ROW;
      const yCenter = yBase + WAVE_ROW / 2;

      // Distance from center = speed
      const speed = Math.abs(yCenter - y) / (15 * SCALE);
      const clampedSpeed = Math.min(2, Math.max(0, speed));

      if (axis === 'xw') stateRef.current.xwSpeed = clampedSpeed;
      else if (axis === 'yw') stateRef.current.ywSpeed = clampedSpeed;
      else if (axis === 'zw') stateRef.current.zwSpeed = clampedSpeed;
    },
    [getCanvasCoords]
  );

  const handleEnd = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.dragAxis = null;
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
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    />
  );
}
