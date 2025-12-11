'use client';

/**
 * TesseractHero - Dramatic 4D Tesseract Visualization
 *
 * A visually stunning tesseract with:
 * - Glowing edges color-coded by 4D plane
 * - Inner/outer cube highlighting
 * - Momentum-based drag interaction
 * - Particle trails
 * - Hypnotic multi-axis auto-rotation
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';

interface TesseractHeroProps {
  className?: string;
}

interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// Edge types based on which coordinate differs
type EdgeType = 'x' | 'y' | 'z' | 'w';

export default function TesseractHero({ className = '' }: TesseractHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    time: 0,
    // 4D rotation angles
    xwAngle: 0,
    ywAngle: 0,
    zwAngle: 0,
    // Rotation velocities (with momentum)
    xwVel: 0.4,
    ywVel: 0.25,
    zwVel: 0.15,
    // 3D camera
    cameraAngle: 0,
    // Drag state
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    dragVelX: 0,
    dragVelY: 0,
    // Particles
    particles: [] as Particle[],
    // Pulse phase
    pulsePhase: 0,
  });

  // Canvas dimensions
  const W = 1200;
  const H = 800;

  // Colors
  const COLORS = {
    bg: '#000000',
    // Edge colors by type
    edgeX: '#ff3366',  // Pink-red for X edges
    edgeY: '#33ff99',  // Cyan-green for Y edges
    edgeZ: '#3399ff',  // Blue for Z edges
    edgeW: '#ffaa33',  // Orange for W edges (4th dimension!)
    // Glow
    glowInner: '#00ffff',
    glowOuter: '#ff00ff',
    // Vertices
    vertexFront: '#ffffff',
    vertexBack: '#666688',
  };

  // Generate tesseract vertices
  const tesseractVertices: Vec4[] = useMemo(() => {
    const verts: Vec4[] = [];
    for (let i = 0; i < 16; i++) {
      verts.push({
        x: (i & 1) ? 1 : -1,
        y: (i & 2) ? 1 : -1,
        z: (i & 4) ? 1 : -1,
        w: (i & 8) ? 1 : -1,
      });
    }
    return verts;
  }, []);

  // Find edges with their types
  const edges: { from: number; to: number; type: EdgeType }[] = useMemo(() => {
    const e: { from: number; to: number; type: EdgeType }[] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const v1 = tesseractVertices[i];
        const v2 = tesseractVertices[j];

        const dx = v1.x !== v2.x ? 1 : 0;
        const dy = v1.y !== v2.y ? 1 : 0;
        const dz = v1.z !== v2.z ? 1 : 0;
        const dw = v1.w !== v2.w ? 1 : 0;

        if (dx + dy + dz + dw === 1) {
          let type: EdgeType = 'x';
          if (dy) type = 'y';
          if (dz) type = 'z';
          if (dw) type = 'w';
          e.push({ from: i, to: j, type });
        }
      }
    }
    return e;
  }, [tesseractVertices]);

  // 4D rotation
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
  const project4Dto3D = useCallback((v: Vec4): { x: number; y: number; z: number; w: number } => {
    const distance = 2.5;
    const scale = 1 / (distance - v.w * 0.5);
    return {
      x: v.x * scale,
      y: v.y * scale,
      z: v.z * scale,
      w: v.w,
    };
  }, []);

  // 3D → 2D perspective
  const project3Dto2D = useCallback((x: number, y: number, z: number, cameraAngle: number) => {
    const rx = x * Math.cos(cameraAngle) - z * Math.sin(cameraAngle);
    const rz = x * Math.sin(cameraAngle) + z * Math.cos(cameraAngle);
    const fov = 3;
    const scale = fov / (fov + rz + 1.5);
    return { x: rx * scale, y: y * scale, scale, z: rz };
  }, []);

  // Get edge color
  const getEdgeColor = useCallback((type: EdgeType, alpha: number, glow: boolean = false) => {
    const colors: Record<EdgeType, string> = {
      x: COLORS.edgeX,
      y: COLORS.edgeY,
      z: COLORS.edgeZ,
      w: COLORS.edgeW,
    };
    const base = colors[type];
    if (glow) return base;

    // Parse hex and apply alpha
    const r = parseInt(base.slice(1, 3), 16);
    const g = parseInt(base.slice(3, 5), 16);
    const b = parseInt(base.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;

      // Physics update
      state.time += 0.016;
      state.pulsePhase += 0.03;

      // Apply rotation velocities
      state.xwAngle += state.xwVel * 0.015;
      state.ywAngle += state.ywVel * 0.015;
      state.zwAngle += state.zwVel * 0.015;

      // Slow auto-rotate camera when not dragging
      if (!state.isDragging) {
        state.cameraAngle += 0.002;
        // Friction on drag velocity
        state.dragVelX *= 0.98;
        state.dragVelY *= 0.98;
        state.xwVel += state.dragVelX * 0.01;
        state.ywVel += state.dragVelY * 0.01;
      }

      // Clamp velocities
      state.xwVel = Math.max(-2, Math.min(2, state.xwVel));
      state.ywVel = Math.max(-2, Math.min(2, state.ywVel));
      state.zwVel = Math.max(-2, Math.min(2, state.zwVel));

      // Clear with slight trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, W, H);

      const centerX = W / 2;
      const centerY = H / 2;
      const renderScale = 200;
      const pulse = 1 + Math.sin(state.pulsePhase) * 0.02;

      // Transform vertices
      const projected: { x: number; y: number; scale: number; w: number; z: number }[] = [];
      for (const v of tesseractVertices) {
        let p = { ...v };
        p = rotate4D(p, state.xwAngle, 'xw');
        p = rotate4D(p, state.ywAngle, 'yw');
        p = rotate4D(p, state.zwAngle, 'zw');

        const p3 = project4Dto3D(p);
        const p2 = project3Dto2D(p3.x, p3.y, p3.z, state.cameraAngle);

        projected.push({
          x: centerX + p2.x * renderScale * pulse,
          y: centerY - p2.y * renderScale * pulse,
          scale: p2.scale,
          w: p3.w,
          z: p2.z,
        });
      }

      // Sort edges by average depth for proper rendering
      const sortedEdges = [...edges].sort((a, b) => {
        const aDepth = (projected[a.from].z + projected[a.to].z) / 2;
        const bDepth = (projected[b.from].z + projected[b.to].z) / 2;
        return bDepth - aDepth; // Back to front
      });

      // Draw edges with glow
      for (const edge of sortedEdges) {
        const p1 = projected[edge.from];
        const p2 = projected[edge.to];
        const v1 = tesseractVertices[edge.from];
        const v2 = tesseractVertices[edge.to];

        // Depth-based alpha (edges in front of W are brighter)
        const avgW = (v1.w + v2.w) / 2;
        const alpha = 0.3 + (avgW + 1) * 0.35;

        // W edges (4th dimension) get special treatment
        const isWEdge = edge.type === 'w';
        const lineWidth = isWEdge ? 3 : 2;
        const glowSize = isWEdge ? 15 : 8;

        // Glow layer
        ctx.save();
        ctx.shadowColor = getEdgeColor(edge.type, 1, true);
        ctx.shadowBlur = glowSize;
        ctx.strokeStyle = getEdgeColor(edge.type, alpha * 0.5);
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();

        // Main edge
        ctx.strokeStyle = getEdgeColor(edge.type, alpha);
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw vertices
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const v = tesseractVertices[i];

        // Size based on W depth (front in 4D = bigger)
        const size = 4 + (v.w + 1) * 3;

        // Color: cyan for front cube (w=1), magenta for back cube (w=-1)
        const t = (v.w + 1) / 2; // 0 to 1
        const r = Math.floor(100 + t * 155);
        const g = Math.floor(255 - t * 100);
        const b = Math.floor(255);

        // Glow
        ctx.save();
        ctx.shadowColor = v.w > 0 ? COLORS.glowInner : COLORS.glowOuter;
        ctx.shadowBlur = 12;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Spawn particles occasionally from front vertices
        if (v.w > 0.5 && Math.random() < 0.05) {
          state.particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            color: COLORS.glowInner,
          });
        }
      }

      // Update and draw particles
      ctx.save();
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Limit particles
      if (state.particles.length > 100) {
        state.particles = state.particles.slice(-100);
      }

      // Legend (subtle)
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.font = '12px system-ui';
      const legendY = H - 60;
      const legendItems = [
        { color: COLORS.edgeW, label: 'W edges (4th dimension)' },
        { color: COLORS.glowInner, label: 'Front in 4D (w=+1)' },
        { color: COLORS.glowOuter, label: 'Back in 4D (w=-1)' },
      ];
      legendItems.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.fillRect(20, legendY + i * 18, 12, 12);
        ctx.fillStyle = '#888';
        ctx.fillText(item.label, 40, legendY + i * 18 + 10);
      });
      ctx.restore();

      // Instructions
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Drag to spin through 4D space', centerX, H - 20);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, project4Dto3D, project3Dto2D, tesseractVertices, edges, getEdgeColor]);

  // Interaction handlers
  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    stateRef.current.isDragging = true;
    stateRef.current.lastMouseX = x;
    stateRef.current.lastMouseY = y;
    stateRef.current.dragVelX = 0;
    stateRef.current.dragVelY = 0;
    // "Catch" the tesseract - heavily dampen velocities when grabbing
    stateRef.current.xwVel *= 0.3;
    stateRef.current.ywVel *= 0.3;
    stateRef.current.zwVel *= 0.5;
  }, [getCanvasCoords]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!stateRef.current.isDragging) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const state = stateRef.current;

    const dx = x - state.lastMouseX;
    const dy = y - state.lastMouseY;

    // Direct rotation
    state.xwAngle += dx * 0.005;
    state.ywAngle += dy * 0.005;

    // Track velocity for momentum
    state.dragVelX = dx;
    state.dragVelY = dy;

    state.lastMouseX = x;
    state.lastMouseY = y;
  }, [getCanvasCoords]);

  const handleEnd = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        width: '100%',
        maxWidth: W,
        aspectRatio: `${W} / ${H}`,
        touchAction: 'none',
      }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
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
