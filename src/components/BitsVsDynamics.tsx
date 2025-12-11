'use client';

/**
 * InteractiveHero - "Discrete vs Continuous"
 *
 * LEFT PANEL (BITS):
 * - Concept: "Atomic" / Discrete / Local
 * - Physics: Hard elastic collisions only. No field forces. No gravity.
 * - Interaction: Drag only (Direct manipulation).
 *
 * RIGHT PANEL (DYNAMICS):
 * - Concept: "Field" / Continuous / Global
 * - Physics: Lorenz Attractor (Strange Attractor geometry).
 * - Interaction: Spacetime Warp (Global distortion).
 * - Feel: "Capacitor" - slow charge up on hold, slow viscous discharge on release.
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
  BLACK: '#050505',
  WHITE: '#f1f5f9',
  RED: '#ef4444',
  GREEN: '#22c55e',
};

const SET1_COLORS = [
  '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
  '#ffff33', '#a65628', '#f781bf', '#999999'
];

export default function BitsVsDynamics() {
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
    warpIntensity: 0,
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
    for (let i = 0; i < 160; i++) {
      const size = (3 + seededRandom(seed + i * 7) * 5) * SCALE;
      // Box-Muller dist for organic spread
      const u1 = seededRandom(seed + i * 2);
      const u2 = seededRandom(seed + i * 2 + 1);
      const randX = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.9;
      const randY = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2) * 0.9;

      initialBits.push({
        x: LEFT_PANEL.x + LEFT_PANEL.width / 2 + randX * (LEFT_PANEL.width / 5),
        y: LEFT_PANEL.y + LEFT_PANEL.height / 2 + randY * (LEFT_PANEL.height / 5),
        vx: (seededRandom(seed + i * 4) - 0.5) * 2.0, // Higher initial energy
        vy: (seededRandom(seed + i * 5) - 0.5) * 2.0,
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
    for (let p = 0; p < 30; p++) {
      let sx = x + p * 0.2, sy = y + p * 0.2, sz = z + p * 0.2;
      for (let i = 0; i < 100 + p * 50; i++) {
        sx += (sigma * (sy - sx)) * dt;
        sy += (sx * (rho - sz) - sy) * dt;
        sz += (sx * sy - beta * sz) * dt;
      }

      const trail: LorenzPoint[] = [];
      for (let i = 0; i < 200; i++) {
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

      // Hard separation (No squish)
      const k = 0.5;
      b1.x -= nx * overlap * k;
      b1.y -= ny * overlap * k;
      b2.x += nx * overlap * k;
      b2.y += ny * overlap * k;

      const dvx = b1.vx - b2.vx;
      const dvy = b1.vy - b2.vy;
      const vn = dvx * nx + dvy * ny;
      if (vn > 0) return;

      const restitution = 0.98; // Very high bounce (Billiards)
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
    const FRICTION = 0.995; // Almost no air resistance
    const JIGGLE = 0.03;

    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const mousePos = mousePosRef.current;
      const { isHoldingDynamics, stuckBitIndex } = interactionRef.current;

      // === DYNAMICS WARP (CAPACITOR LOGIC) ===
      if (isHoldingDynamics) {
         // Slow charge up (Gravity increasing)
         interactionRef.current.warpIntensity = Math.min(1.2, interactionRef.current.warpIntensity + 0.005);
      } else {
         // Slow viscous snap-back
         interactionRef.current.warpIntensity += (0 - interactionRef.current.warpIntensity) * 0.03;
      }
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
      ctx.fillText('Discrete · Atomic · Local', 0.25 * W, 0.18 * H);

      ctx.fillStyle = COLORS.GREEN;
      ctx.font = `bold ${32 * SCALE}px system-ui, sans-serif`;
      ctx.globalAlpha = 1.0;
      ctx.fillText('DYNAMICS', 0.75 * W, 0.12 * H);
      ctx.font = `${16 * SCALE}px system-ui, sans-serif`;
      ctx.globalAlpha = 0.6;
      ctx.fillText('Continuous · Fluid · Global', 0.75 * W, 0.18 * H);
      ctx.globalAlpha = 1.0;

      // ==========================================
      // LEFT PANEL: DISCRETE BITS
      // ==========================================
      const bits = bitsRef.current;

      for (let i = 0; i < bits.length; i++) {
        const b = bits[i];

        if (i === stuckBitIndex && mousePos) {
          // Dragging (External Force)
          const ddx = mousePos.x - b.x;
          const ddy = mousePos.y - b.y;
          b.vx += ddx * 0.1;
          b.vy += ddy * 0.1;
          b.vx *= 0.7;
          b.vy *= 0.7;
        } else {
          // Brownian Heat (Temperature)
          b.vx += (Math.random() - 0.5) * JIGGLE;
          b.vy += (Math.random() - 0.5) * JIGGLE;

          // NO long-range forces here.
          // Pure Newtonian inertia.
        }

        b.vx *= FRICTION;
        b.vy *= FRICTION;
        b.x += b.vx;
        b.y += b.vy;

        // Hard Walls (Billiard Table)
        if (b.x < LEFT_PANEL.x + b.size) { b.x = LEFT_PANEL.x + b.size; b.vx *= -0.9; }
        if (b.x > LEFT_PANEL.x + LEFT_PANEL.width - b.size) { b.x = LEFT_PANEL.x + LEFT_PANEL.width - b.size; b.vx *= -0.9; }
        if (b.y < LEFT_PANEL.y + b.size) { b.y = LEFT_PANEL.y + b.size; b.vy *= -0.9; }
        if (b.y > LEFT_PANEL.y + LEFT_PANEL.height - b.size) { b.y = LEFT_PANEL.y + LEFT_PANEL.height - b.size; b.vy *= -0.9; }
      }

      // Collisions (Atomic Interactions)
      for (let i = 0; i < bits.length; i++) {
        for (let j = i + 1; j < bits.length; j++) {
          resolveCollision(bits[i], bits[j]);
        }
      }

      // Draw Bits
      bits.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.9; // Solid
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // ==========================================
      // RIGHT PANEL: WAVE DYNAMICS
      // ==========================================
      const lorenzParticles = lorenzParticlesRef.current;
      const lorenzScale = 5 * SCALE;
      const rcx = RIGHT_PANEL.x + RIGHT_PANEL.width / 2;
      const rcy = RIGHT_PANEL.y + RIGHT_PANEL.height / 2;
      const dt = 0.007;
      const sigma = 10, rho = 28, beta = 8 / 3;

      // Update Math - now with field interaction!
      lorenzParticles.forEach(p => {
        let { x, y, z } = p.state;
        let dx = sigma * (y - x);
        let dy = x * (rho - z) - y;
        let dz = x * y - beta * z;

        // FIELD INTERACTION: Mouse acts as force field on the differential equations
        // This makes the chaos "react" to you, not just bend the image
        if (isHoldingDynamics && mousePos && currentWarp > 0.01) {
          // Project current 3D state to screen coords to calculate distance
          const proj = project3D(x, y, z - 25, rotation);
          const screenX = rcx + proj.x * lorenzScale;
          const screenY = rcy + proj.y * lorenzScale;

          const distToMouse = Math.sqrt(
            (screenX - mousePos.x) ** 2 + (screenY - mousePos.y) ** 2
          );

          const influenceRadius = 200 * SCALE;
          if (distToMouse < influenceRadius) {
            // Perturb the derivatives based on mouse position
            // This creates a "gravity well" in phase space
            const strength = (1 - distToMouse / influenceRadius) * currentWarp * 2;

            // Add perturbation to pull attractor toward/around mouse
            // Using screen coords mapped back to phase space (simplified)
            const pullX = ((mousePos.x - rcx) / lorenzScale - x) * strength * 0.5;
            const pullY = ((mousePos.y - rcy) / lorenzScale - y) * strength * 0.5;

            dx += pullX;
            dy += pullY;
            // Add some chaos to Z to make it more dramatic
            dz += (Math.random() - 0.5) * strength * 5;
          }
        }

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        p.state = { x, y, z };
        p.trail.push({ x, y, z });
        if (p.trail.length > 200) p.trail.shift();
      });

      // Render Trails
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Global Warp Function
      const applyWarp = (sx: number, sy: number): [number, number] => {
        if (currentWarp > 0.001 && mousePos) {
          const wdx = mousePos.x - sx;
          const wdy = mousePos.y - sy;
          const dist = Math.sqrt(wdx * wdx + wdy * wdy);
          const radius = 350 * SCALE; // Large field of influence

          if (dist < radius) {
            // Gravity Well: Pulls the entire geometry towards the singularity
            const strength = Math.pow(1 - dist / radius, 2) * 50 * SCALE * currentWarp;
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

          [sx, sy] = applyWarp(sx, sy);

          if (i === 0) {
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }

        ctx.strokeStyle = `rgba(34, 197, 94, 0.5)`;
        ctx.lineWidth = 1 * SCALE;
        ctx.stroke();

        // Hot Tips (Flow Direction)
        if (p.trail.length > 0) {
          const last = p.trail[p.trail.length - 1];
          const proj = project3D(last.x, last.y, last.z - 25, rotation);
          let sx = rcx + proj.x * lorenzScale;
          let sy = rcy + proj.y * lorenzScale;
          [sx, sy] = applyWarp(sx, sy);

          const alpha = Math.max(0.1, 1 - (proj.depth + 20) / 100);
          ctx.fillStyle = `rgba(200, 255, 200, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5 * SCALE, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalCompositeOperation = 'source-over';

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
      style={{
        width: '100%',
        maxWidth: W / SCALE,
        aspectRatio: `${W} / ${H}`,
        touchAction: 'none'
      }}
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
