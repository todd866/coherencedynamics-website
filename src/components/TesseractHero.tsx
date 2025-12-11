'use client';

/**
 * TesseractHero - "Impulse" Interaction Model
 *
 * CONCEPT:
 * - Drag: Standard 3D Orbit (X/Y rotation). Natural object manipulation.
 * - Click/Tap: Injects "4D Momentum". Like flicking a spinner.
 *   Each tap accelerates the "Inside-Out" rotation.
 *
 * PHYSICS:
 * - 4D rotation decays (friction) unless "kept alive" by taps.
 * - 3D rotation tracks mouse movement 1:1.
 * - Color shifts from cool (slow) to hot (fast) based on 4D velocity.
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

type EdgeType = 'x' | 'y' | 'z' | 'w';

export default function TesseractHero({ className = '' }: TesseractHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    time: 0,
    // Angles
    xwAngle: 0, // 4D (Inside-Out)
    ywAngle: 0, // 3D Y-rotation
    zwAngle: 0, // 3D X-rotation

    // ALL rotations are momentum-based now
    xwVel: 0.008, // 4D velocity - start with gentle drift
    ywVel: 0,     // 3D horizontal velocity
    zwVel: 0,     // 3D vertical velocity

    // Interaction
    isDragging: false,
    isHolding: false, // True when holding still (not moving)
    holdStartTime: 0,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    lastMoveTime: 0,
    dragDistance: 0,

    // Tap effect
    lastTapTime: 0,
    tapX: 0,
    tapY: 0,
  });

  const W = 1200;
  const H = 800;

  // Tesseract vertices
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

  // Edges
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

  // 4D rotation (single plane)
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
    } else if (plane === 'xy') {
      result.x = v.x * c - v.y * s;
      result.y = v.x * s + v.y * c;
    } else if (plane === 'xz') {
      result.x = v.x * c - v.z * s;
      result.z = v.x * s + v.z * c;
    } else if (plane === 'yz') {
      result.y = v.y * c - v.z * s;
      result.z = v.y * s + v.z * c;
    }
    return result;
  }, []);

  // 4D → 3D stereographic
  const project4Dto3D = useCallback((v: Vec4): { x: number; y: number; z: number; w: number } => {
    const distance = 2.5;
    const scale = 1 / (distance - v.w * 0.5);
    return { x: v.x * scale, y: v.y * scale, z: v.z * scale, w: v.w };
  }, []);

  // 3D → 2D perspective
  const project3Dto2D = useCallback((x: number, y: number, z: number) => {
    const fov = 3;
    const scale = fov / (fov + z + 1.5);
    return { x: x * scale, y: y * scale, scale, z };
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
      state.time += 0.016;

      // HOLD TO SETTLE: If holding (not moving), snap to canonical orientation
      if (state.isDragging && state.isHolding) {
        const holdDuration = Date.now() - state.holdStartTime;

        // After 100ms of holding, start settling
        if (holdDuration > 100) {
          // Freeze all velocities
          state.xwVel = 0;
          state.ywVel = 0;
          state.zwVel = 0;

          // Snap all angles toward nearest canonical orientation
          const snapSpeed = 0.08;

          // Snap XW angle to nearest 90°
          const targetXW = Math.round(state.xwAngle / (Math.PI / 2)) * (Math.PI / 2);
          state.xwAngle += (targetXW - state.xwAngle) * snapSpeed;

          // Snap 3D angles back to zero (canonical view)
          state.ywAngle += (0 - state.ywAngle) * snapSpeed;
          state.zwAngle += (0 - state.zwAngle) * snapSpeed;
        }
      } else {
        // PHYSICS: Apply all velocities
        state.xwAngle += state.xwVel;
        state.ywAngle += state.ywVel;
        state.zwAngle += state.zwVel;

        // Very light friction - slow decay (0.997 = ~18% decay per second at 60fps)
        const friction = 0.997;
        state.xwVel *= friction;
        state.ywVel *= friction;
        state.zwVel *= friction;

        // Stop completely when very slow (prevents infinite tiny spinning)
        if (Math.abs(state.xwVel) < 0.0001) state.xwVel = 0;
        if (Math.abs(state.ywVel) < 0.0001) state.ywVel = 0;
        if (Math.abs(state.zwVel) < 0.0001) state.zwVel = 0;
      }

      // Speed factor for visual effects (0-1, clamped)
      const speedFactor = Math.min(1, Math.abs(state.xwVel) / 0.1);

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      const centerX = W / 2;
      const centerY = H / 2;
      const renderScale = 200;

      // Transform vertices
      const projected: { x: number; y: number; scale: number; w: number; z: number }[] = [];
      for (const v of tesseractVertices) {
        let p = { ...v };
        // 4D rotation (momentum-based)
        p = rotate4D(p, state.xwAngle, 'xw');
        // 3D rotations (direct control)
        p = rotate4D(p, state.ywAngle, 'xz'); // Horizontal drag
        p = rotate4D(p, state.zwAngle, 'yz'); // Vertical drag

        const p3 = project4Dto3D(p);
        const p2 = project3Dto2D(p3.x, p3.y, p3.z);

        projected.push({
          x: centerX + p2.x * renderScale,
          y: centerY - p2.y * renderScale,
          scale: p2.scale,
          w: p3.w,
          z: p2.z,
        });
      }

      // Sort edges by depth
      const sortedEdges = [...edges].sort((a, b) => {
        const aDepth = (projected[a.from].z + projected[a.to].z) / 2;
        const bDepth = (projected[b.from].z + projected[b.to].z) / 2;
        return bDepth - aDepth;
      });

      // Draw edges
      ctx.lineCap = 'round';
      for (const edge of sortedEdges) {
        const p1 = projected[edge.from];
        const p2 = projected[edge.to];
        const v1 = tesseractVertices[edge.from];
        const v2 = tesseractVertices[edge.to];

        const avgW = (v1.w + v2.w) / 2;
        const alpha = 0.3 + (avgW + 1) * 0.35;

        const isWEdge = edge.type === 'w';
        const lineWidth = isWEdge ? 3 : 2;
        const glowSize = isWEdge ? 15 : 8;

        // Color based on edge type + speed
        // Cool (idle) -> Hot (fast spinning)
        let hue: number;
        if (edge.type === 'w') {
          // W edges: Orange (idle) -> Pink/Magenta (fast)
          hue = 30 + speedFactor * 290; // 30 -> 320
        } else if (edge.type === 'x') {
          // X: Pink -> Purple
          hue = 340 + speedFactor * 40;
        } else if (edge.type === 'y') {
          // Y: Green -> Cyan
          hue = 140 - speedFactor * 20;
        } else {
          // Z: Blue -> Indigo
          hue = 220 + speedFactor * 30;
        }

        const saturation = 70 + speedFactor * 30;
        const lightness = 50 + speedFactor * 20;

        // Glow (stronger when fast)
        ctx.save();
        ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.5 + speedFactor * 0.5})`;
        ctx.shadowBlur = glowSize + speedFactor * 20;
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.5})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();

        // Main edge
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
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
        const size = 4 + (v.w + 1) * 3;

        // Color: shift hue based on speed
        const baseHue = v.w > 0 ? 180 : 300; // Cyan vs Magenta
        const hue = baseHue + speedFactor * 40;

        ctx.save();
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
        ctx.shadowBlur = 12 + speedFactor * 10;
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${0.6 + (v.w + 1) * 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // TAP RIPPLE EFFECT
      const timeSinceTap = Date.now() - state.lastTapTime;
      if (timeSinceTap < 600) {
        const progress = timeSinceTap / 600;
        const radius = progress * 150;
        const rippleAlpha = (1 - progress) * 0.6;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 200, 100, ${rippleAlpha})`;
        ctx.lineWidth = 3 * (1 - progress);
        ctx.beginPath();
        ctx.arc(state.tapX, state.tapY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha * 0.5})`;
        ctx.lineWidth = 2 * (1 - progress);
        ctx.beginPath();
        ctx.arc(state.tapX, state.tapY, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4D VELOCITY METER (subtle bar at bottom)
      const meterWidth = 200;
      const meterHeight = 4;
      const meterX = centerX - meterWidth / 2;
      const meterY = H - 50;

      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

      // Fill (velocity)
      const fillWidth = Math.min(1, Math.abs(state.xwVel) / 0.15) * meterWidth;
      const meterHue = 30 + speedFactor * 290;
      ctx.fillStyle = `hsla(${meterHue}, 100%, 60%, 0.8)`;
      ctx.fillRect(meterX, meterY, fillWidth, meterHeight);

      // HUD
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = '#fff';
      ctx.fillText('TESSERACT', 24, 30);

      ctx.font = '12px system-ui';
      ctx.fillStyle = '#88aacc';
      ctx.fillText('FLICK', 24, 52);
      ctx.fillStyle = '#aaa';
      ctx.fillText(' → Spin 3D', 62, 52);

      ctx.fillStyle = '#ffaa66';
      ctx.fillText('TAP', 24, 70);
      ctx.fillStyle = '#aaa';
      ctx.fillText(' → Spin 4D', 50, 70);

      ctx.fillStyle = '#66ff88';
      ctx.fillText('HOLD', 24, 88);
      ctx.fillStyle = '#aaa';
      ctx.fillText(' → Freeze & Settle', 58, 88);

      // Speed label
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('4D ENERGY', centerX, meterY + 20);
      ctx.restore();

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, project4Dto3D, project3Dto2D, tesseractVertices, edges]);

  // Get canvas coordinates
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
    const state = stateRef.current;

    state.isDragging = true;
    state.isHolding = true; // Start as holding (until they move)
    state.holdStartTime = Date.now();
    state.dragStartX = x;
    state.dragStartY = y;
    state.lastX = x;
    state.lastY = y;
    state.lastMoveTime = Date.now();
    state.dragDistance = 0;
    // Don't freeze velocity - let it keep spinning until they hold
  }, [getCanvasCoords]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const state = stateRef.current;
    if (!state.isDragging) return;
    e.preventDefault();

    const { x, y } = getCanvasCoords(e);
    const now = Date.now();
    const dt = Math.max(1, now - state.lastMoveTime); // ms since last move
    const dx = x - state.lastX;
    const dy = y - state.lastY;

    // Track total drag distance (to distinguish tap from drag)
    state.dragDistance += Math.abs(dx) + Math.abs(dy);

    // If moved enough, no longer holding
    if (state.dragDistance > 5) {
      state.isHolding = false;
    }

    // Apply rotation directly while dragging (for responsiveness)
    // AND track velocity for release
    if (!state.isHolding) {
      const rotationScale = 0.005;
      state.ywAngle += dx * rotationScale;
      state.zwAngle += dy * rotationScale;

      // Track instantaneous velocity (pixels/ms -> radians/frame)
      // We'll use this on release to impart momentum
      state.ywVel = (dx * rotationScale) / dt * 16; // Convert to per-frame
      state.zwVel = (dy * rotationScale) / dt * 16;
    }

    state.lastX = x;
    state.lastY = y;
    state.lastMoveTime = now;
  }, [getCanvasCoords]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const state = stateRef.current;
    const holdDuration = Date.now() - state.holdStartTime;
    const timeSinceLastMove = Date.now() - state.lastMoveTime;

    // If this was a quick tap (minimal drag AND short hold), add 4D impulse
    if (state.dragDistance < 10 && holdDuration < 200) {
      // Get tap position for ripple
      let tapX = state.dragStartX;
      let tapY = state.dragStartY;

      // For touch end, use last known position
      if ('changedTouches' in e && e.changedTouches.length > 0) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          tapX = (e.changedTouches[0].clientX - rect.left) * scaleX;
          tapY = (e.changedTouches[0].clientY - rect.top) * scaleY;
        }
      }

      // STRONG 4D impulse on tap!
      state.xwVel += 0.08;
      state.lastTapTime = Date.now();
      state.tapX = tapX;
      state.tapY = tapY;
    } else if (state.dragDistance > 10 && timeSinceLastMove < 50) {
      // This was a flick! Velocity was set in handleMove, just let it fly.
      // Boost the velocity a bit for a satisfying flick feel
      state.ywVel *= 1.5;
      state.zwVel *= 1.5;
    } else {
      // Long hold or stopped moving - kill velocity
      if (timeSinceLastMove > 100) {
        state.ywVel = 0;
        state.zwVel = 0;
      }
    }

    state.isDragging = false;
    state.isHolding = false;
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
