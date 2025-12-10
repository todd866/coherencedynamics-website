'use client';

/**
 * InteractiveHero - Homepage hero visualization for coherencedynamics.com
 *
 * Demonstrates the conceptual difference between "BITS" (discrete, isolated) and
 * "DYNAMICS" (continuous, coherent) through interactive canvas animations.
 *
 * PHYSICS:
 * - BITS: Elastic collision with impulse-based bouncing, Brownian jiggle
 * - DYNAMICS: Lorenz attractor with render-time spacetime warp (math untouched)
 *
 * JUICE (polish):
 * - Elastic warp spring - smooth stretch and bounce-back
 * - Neon glow trails via additive blending
 * - Reactive bits - nudge away from cursor on hover
 * - Hot-head trails - bright tips showing flow direction
 */

import { useRef, useEffect, useCallback } from 'react';

// === TYPES ===
interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  mass: number;
}

interface LorenzPoint {
  x: number;
  y: number;
  z: number;
}

// === CONSTANTS ===
const COLORS = {
  BLACK: '#050505', // Slightly off-black for warmth
  WHITE: '#f1f5f9',
  RED: '#ef4444',
  GREEN: '#22c55e',
};

const SET1_COLORS = [
  '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
  '#ffff33', '#a65628', '#f781bf', '#999999'
];

export default function InteractiveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // === PHYSICS STATE ===
  const bitsRef = useRef<Bit[]>([]);
  const lorenzParticlesRef = useRef<{ state: LorenzPoint; trail: LorenzPoint[] }[]>([]);

  // Interaction State
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const interactionRef = useRef({
    isHoldingDynamics: false,
    stuckBitIndex: null as number | null,
    warpIntensity: 0, // 0 = normal, 1 = fully warped (spring physics)
  });

  const rotationRef = useRef(0);

  // Dimensions
  const SCALE = 2;
  const W = 580 * SCALE;
  const H = 326 * SCALE;

  // Panels
  const LEFT_PANEL = { x: 0.03 * W, y: 0.26 * H, width: 0.44 * W, height: 0.62 * H };
  const RIGHT_PANEL = { x: 0.53 * W, y: 0.26 * H, width: 0.44 * W, height: 0.62 * H };

  // === INITIALIZATION ===
  useEffect(() => {
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    // 1. Init Bits
    const initialBits: Bit[] = [];
    const seed = 42;
    for (let i = 0; i < 180; i++) {
      const size = (3 + seededRandom(seed + i * 7) * 5) * SCALE;
      // Box-Muller dist for organic spread
      const u1 = seededRandom(seed + i * 2);
      const u2 = seededRandom(seed + i * 2 + 1);
      const randX = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.9;
      const randY = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2) * 0.9;

      initialBits.push({
        x: LEFT_PANEL.x + LEFT_PANEL.width / 2 + randX * (LEFT_PANEL.width / 5),
        y: LEFT_PANEL.y + LEFT_PANEL.height / 2 + randY * (LEFT_PANEL.height / 5),
        vx: (seededRandom(seed + i * 4) - 0.5) * 0.5,
        vy: (seededRandom(seed + i * 5) - 0.5) * 0.5,
        color: SET1_COLORS[i % SET1_COLORS.length],
        size: size,
        mass: size * size,
      });
    }
    bitsRef.current = initialBits;

    // 2. Init Lorenz
    const particles: { state: LorenzPoint; trail: LorenzPoint[] }[] = [];
    let x = 1, y = 1, z = 1;
    const dt = 0.01;
    const sigma = 10, rho = 28, beta = 8 / 3;

    // Warmup
    for (let i = 0; i < 500; i++) {
      x += (sigma * (y - x)) * dt;
      y += (x * (rho - z) - y) * dt;
      z += (x * y - beta * z) * dt;
    }

    // Spawn trails
    for (let p = 0; p < 25; p++) {
      let sx = x + p * 0.2, sy = y + p * 0.2, sz = z + p * 0.2;
      // Diversify start positions
      for (let i = 0; i < 100 + p * 50; i++) {
        sx += (sigma * (sy - sx)) * dt;
        sy += (sx * (rho - sz) - sy) * dt;
        sz += (sx * sy - beta * sz) * dt;
      }

      const trail: LorenzPoint[] = [];
      // Fill initial trail
      for (let i = 0; i < 250; i++) {
        sx += (sigma * (sy - sx)) * dt;
        sy += (sx * (rho - sz) - sy) * dt;
        sz += (sx * sy - beta * sz) * dt;
        trail.push({ x: sx, y: sy, z: sz });
      }
      particles.push({ state: { x: sx, y: sy, z: sz }, trail });
    }
    lorenzParticlesRef.current = particles;
  }, []);

  // === PHYSICS HELPERS ===
  const resolveCollision = useCallback((b1: Bit, b2: Bit) => {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const distSq = dx * dx + dy * dy;
    const minDist = b1.size + b2.size;

    if (distSq < minDist * minDist && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;

      // Soft separation
      const k = 0.5;
      b1.x -= nx * overlap * k;
      b1.y -= ny * overlap * k;
      b2.x += nx * overlap * k;
      b2.y += ny * overlap * k;

      // Elastic Impulse
      const dvx = b1.vx - b2.vx;
      const dvy = b1.vy - b2.vy;
      const vn = dvx * nx + dvy * ny;
      if (vn > 0) return;

      const restitution = 0.95; // Super bouncy
      let j = -(1 + restitution) * vn;
      j /= (1 / b1.mass + 1 / b2.mass);

      const ix = j * nx;
      const iy = j * ny;
      b1.vx += ix / b1.mass;
      b1.vy += iy / b1.mass;
      b2.vx -= ix / b2.mass;
      b2.vy -= iy / b2.mass;
    }
  }, []);

  const project3D = useCallback((x: number, y: number, z: number, rotation: number) => {
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const rx = x * cosR - z * sinR;
    const rz = x * sinR + z * cosR;
    const fov = 400;
    const distance = 70;
    const scale = fov / (fov + rz + distance);
    return { x: rx * scale, y: y * scale, scale, depth: rz };
  }, []);

  // === ANIMATION LOOP ===
  useEffect(() => {
    const FRICTION = 0.985;
    const JIGGLE = 0.04;

    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const mousePos = mousePosRef.current;
      const { isHoldingDynamics, stuckBitIndex } = interactionRef.current;

      // Smoothly interpolate warp intensity (Spring Effect)
      const targetWarp = isHoldingDynamics ? 1.0 : 0.0;
      interactionRef.current.warpIntensity += (targetWarp - interactionRef.current.warpIntensity) * 0.1;
      const currentWarp = interactionRef.current.warpIntensity;

      rotationRef.current += 0.0025;
      const rotation = rotationRef.current;

      // Clean Slate
      ctx.fillStyle = COLORS.BLACK;
      ctx.fillRect(0, 0, W, H);

      // --- LABELS ---
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.RED;
      ctx.font = `bold ${32 * SCALE}px system-ui, sans-serif`;
      ctx.fillText('BITS', 0.25 * W, 0.12 * H);
      ctx.font = `${16 * SCALE}px system-ui, sans-serif`;
      ctx.globalAlpha = 0.6;
      ctx.fillText('Discrete · Isolated · O(n) cost', 0.25 * W, 0.18 * H);

      ctx.fillStyle = COLORS.GREEN;
      ctx.font = `bold ${32 * SCALE}px system-ui, sans-serif`;
      ctx.globalAlpha = 1.0;
      ctx.fillText('DYNAMICS', 0.75 * W, 0.12 * H);
      ctx.font = `${16 * SCALE}px system-ui, sans-serif`;
      ctx.globalAlpha = 0.6;
      ctx.fillText('Continuous · Coherent · O(1) cost', 0.75 * W, 0.18 * H);
      ctx.globalAlpha = 1.0;

      // ==========================================
      // LEFT PANEL: REACTIVE BITS
      // ==========================================
      const bits = bitsRef.current;

      for (let i = 0; i < bits.length; i++) {
        const b = bits[i];

        if (i === stuckBitIndex && mousePos) {
          // Dragging logic
          const ddx = mousePos.x - b.x;
          const ddy = mousePos.y - b.y;
          b.vx += ddx * 0.1;
          b.vy += ddy * 0.1;
          b.vx *= 0.7; // Heavy damping
          b.vy *= 0.7;
        } else {
          // Brownian Heat
          b.vx += (Math.random() - 0.5) * JIGGLE;
          b.vy += (Math.random() - 0.5) * JIGGLE;

          // Mouse Repulsion (Personal Space) - bits nudge away from cursor
          if (mousePos && !isHoldingDynamics && mousePos.x < RIGHT_PANEL.x) {
            const ddx = b.x - mousePos.x;
            const ddy = b.y - mousePos.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);
            const range = 80 * SCALE;
            if (dist < range && dist > 0) {
              const force = (1 - dist / range) * 0.5; // Gentle push
              b.vx += (ddx / dist) * force;
              b.vy += (ddy / dist) * force;
            }
          }

          // Soft gravity to center (nonlinear - stronger at edges)
          const cx = LEFT_PANEL.x + LEFT_PANEL.width / 2;
          const cy = LEFT_PANEL.y + LEFT_PANEL.height / 2;
          const ddx = cx - b.x;
          const ddy = cy - b.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          b.vx += ddx * 0.00005 * (dist / 100);
          b.vy += ddy * 0.00005 * (dist / 100);
        }

        b.vx *= FRICTION;
        b.vy *= FRICTION;
        b.x += b.vx;
        b.y += b.vy;

        // Boundaries
        if (b.x < LEFT_PANEL.x + b.size) { b.x = LEFT_PANEL.x + b.size; b.vx *= -0.8; }
        if (b.x > LEFT_PANEL.x + LEFT_PANEL.width - b.size) { b.x = LEFT_PANEL.x + LEFT_PANEL.width - b.size; b.vx *= -0.8; }
        if (b.y < LEFT_PANEL.y + b.size) { b.y = LEFT_PANEL.y + b.size; b.vy *= -0.8; }
        if (b.y > LEFT_PANEL.y + LEFT_PANEL.height - b.size) { b.y = LEFT_PANEL.y + LEFT_PANEL.height - b.size; b.vy *= -0.8; }
      }

      // Collisions
      for (let i = 0; i < bits.length; i++) {
        for (let j = i + 1; j < bits.length; j++) {
          resolveCollision(bits[i], bits[j]);
        }
      }

      // Draw Bits
      bits.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // ==========================================
      // RIGHT PANEL: NEON DYNAMICS
      // ==========================================
      const lorenzParticles = lorenzParticlesRef.current;
      const lorenzScale = 5 * SCALE;
      const rcx = RIGHT_PANEL.x + RIGHT_PANEL.width / 2;
      const rcy = RIGHT_PANEL.y + RIGHT_PANEL.height / 2;
      const dt = 0.007;
      const sigma = 10, rho = 28, beta = 8 / 3;

      // Update Math (PURE - no interaction forces)
      lorenzParticles.forEach(p => {
        let { x, y, z } = p.state;
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        p.state = { x, y, z };
        p.trail.push({ x, y, z });
        if (p.trail.length > 250) p.trail.shift();
      });

      // Render Trails with Glow (additive blending)
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Helper to apply warp to a point
      const applyWarp = (sx: number, sy: number): [number, number] => {
        if (currentWarp > 0.01 && mousePos) {
          const wdx = mousePos.x - sx;
          const wdy = mousePos.y - sy;
          const dist = Math.sqrt(wdx * wdx + wdy * wdy);
          const radius = 300 * SCALE;

          if (dist < radius) {
            const strength = Math.pow(1 - dist / radius, 3) * 60 * SCALE * currentWarp;
            const angle = Math.atan2(wdy, wdx);
            sx += Math.cos(angle) * strength;
            sy += Math.sin(angle) * strength;
          }
        }
        return [sx, sy];
      };

      lorenzParticles.forEach(p => {
        if (p.trail.length < 3) return;

        const step = 2;
        ctx.beginPath();

        for (let i = 0; i < p.trail.length; i += step) {
          const pt = p.trail[i];
          const proj = project3D(pt.x, pt.y, pt.z - 25, rotation);

          let sx = rcx + proj.x * lorenzScale;
          let sy = rcy + proj.y * lorenzScale;

          // Apply elastic spacetime warp
          [sx, sy] = applyWarp(sx, sy);

          if (i === 0) {
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }

        // Base trail color
        ctx.strokeStyle = `rgba(34, 197, 94, 0.4)`;
        ctx.lineWidth = 1 * SCALE;
        ctx.stroke();

        // Draw the "Head" (current position) brighter - hot tip effect
        if (p.trail.length > 0) {
          const last = p.trail[p.trail.length - 1];
          const proj = project3D(last.x, last.y, last.z - 25, rotation);
          let sx = rcx + proj.x * lorenzScale;
          let sy = rcy + proj.y * lorenzScale;
          [sx, sy] = applyWarp(sx, sy);

          // Glowing head - depth-faded
          const alpha = Math.max(0.2, 1 - (proj.depth + 20) / 100);
          ctx.fillStyle = `rgba(200, 255, 200, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5 * SCALE, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalCompositeOperation = 'source-over'; // Reset blending

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [resolveCollision, project3D]);

  // === HANDLERS ===
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    mousePosRef.current = coords;

    if (coords.x < RIGHT_PANEL.x) {
      let closestIdx = -1;
      let minDst = Infinity;
      bitsRef.current.forEach((b, i) => {
        const d = Math.sqrt((b.x - coords.x) ** 2 + (b.y - coords.y) ** 2);
        if (d < b.size + 15 * SCALE && d < minDst) {
          minDst = d;
          closestIdx = i;
        }
      });
      interactionRef.current.stuckBitIndex = closestIdx;
    } else {
      interactionRef.current.isHoldingDynamics = true;
    }
  }, [getCanvasCoords]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    mousePosRef.current = getCanvasCoords(e);
  }, [getCanvasCoords]);

  const handleEnd = useCallback(() => {
    interactionRef.current.isHoldingDynamics = false;
    interactionRef.current.stuckBitIndex = null;
    mousePosRef.current = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: W / SCALE, height: H / SCALE, touchAction: 'none' }}
      className="rounded-xl cursor-crosshair"
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
