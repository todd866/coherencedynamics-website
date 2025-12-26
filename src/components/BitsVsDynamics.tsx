'use client';

/**
 * BitsVsDynamics — Jelly Dynamics + 3D Zero-Float Balloons (Bits)
 *
 * Right panel: "field jelly" Lorenz interaction
 * Left panel: 3D neutral-buoyancy balloons in normalized 3D space
 */

import { useCallback, useEffect, useRef } from 'react';

interface Bit3D {
  // normalized box coords: x,y,z all in [0,1]
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;     // radius in normalized units
  mass: number;
  color: string;
  s1: number;
  s2: number;
  s3: number;
}

interface LorenzPoint {
  x: number;
  y: number;
  z: number;
}

const COLORS = {
  BG: '#000000',
  WHITE: '#f1f5f9',
  RED: '#ef4444',
  GREEN: '#22c55e',
};

const SET1_COLORS = [
  '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
  '#ffff33', '#a65628', '#f781bf', '#999999'
];

const CSS_W = 580;
const CSS_H = 326;

const PANEL = {
  LEFT: { x: 0.03, y: 0.26, w: 0.44, h: 0.62 },
  RIGHT: { x: 0.53, y: 0.26, w: 0.44, h: 0.62 },
};

function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)); }

function smoothNoise(t: number, seed: number) {
  return (
    Math.sin(t * 0.9 + seed) * 0.6 +
    Math.sin(t * 0.37 + seed * 1.7) * 0.3 +
    Math.sin(t * 0.13 + seed * 3.1) * 0.1
  );
}

export default function BitsVsDynamics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const dprRef = useRef(1);
  const WRef = useRef(CSS_W);
  const HRef = useRef(CSS_H);

  // Bits + Lorenz state
  const bitsRef = useRef<Bit3D[]>([]);
  const lorenzRef = useRef<{ state: LorenzPoint; trail: LorenzPoint[]; speed: number }[]>([]);
  const rotationRef = useRef(0);

  // Pointer
  const pointerRef = useRef({
    raw: { x: 0, y: 0, down: false },
    smooth: { x: 0, y: 0 },
    v: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
  });

  // Interaction
  const interactionRef = useRef({
    stuckBitIndex: null as number | null,
    holdingDynamics: false,
    warp: 0,
  });

  // Right panel "jelly" field center + inertia
  const jellyRef = useRef({
    cx: 0,
    cy: 0,
    vx: 0,
    vy: 0,
  });

  // --- 3D projection for Lorenz ---
  const project3D = useCallback((x: number, y: number, z: number, rot: number) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    const rx = x * c - z * s;
    const rz = x * s + z * c;
    const fov = 420;
    const dist = 70;
    const k = fov / (fov + rz + dist);
    return { x: rx * k, y: y * k, depth: rz, k };
  }, []);

  // --- Bits 3D projection (normalized coords to screen) ---
  const projectBit = useCallback((b: Bit3D, LEFT: { x: number; y: number; w: number; h: number }) => {
    const minDim = Math.min(LEFT.w, LEFT.h);

    // z in [0,1] -> depth offset
    const dz = b.z - 0.5;

    // gentle perspective, clamped to safe range
    const k = clamp(1 + dz * 0.55, 0.78, 1.28);

    const sx = LEFT.x + b.x * LEFT.w;
    const sy = LEFT.y + b.y * LEFT.h;
    const rr = Math.max(1, b.r * minDim * k);

    return { sx, sy, rr, k, depth: b.z };
  }, []);

  // --- Bits 3D collisions (normalized space) ---
  const resolveCollision3D = useCallback((a: Bit3D, b: Bit3D, aIsDragged: boolean, bIsDragged: boolean) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;

    // Use larger collision radius for dragged bits (makes it easier to hit things)
    const aRadius = aIsDragged ? a.r * 2.5 : a.r;
    const bRadius = bIsDragged ? b.r * 2.5 : b.r;
    const r = aRadius + bRadius;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 <= 0 || d2 > r * r) return;

    const d = Math.sqrt(d2);
    const nx = dx / d;
    const ny = dy / d;
    const nz = dz / d;

    const overlap = r - d;
    const total = a.mass + b.mass;
    const pushA = (b.mass / total) * overlap;
    const pushB = (a.mass / total) * overlap;

    a.x -= nx * pushA;
    a.y -= ny * pushA;
    a.z -= nz * pushA;

    b.x += nx * pushB;
    b.y += ny * pushB;
    b.z += nz * pushB;

    const rvx = a.vx - b.vx;
    const rvy = a.vy - b.vy;
    const rvz = a.vz - b.vz;
    const vn = rvx * nx + rvy * ny + rvz * nz;

    if (vn > 0) return;

    const e = 0.88;
    let j = -(1 + e) * vn;
    j /= (1 / a.mass + 1 / b.mass);
    j = clamp(j, -0.02, 0.02);

    a.vx += (j * nx) / a.mass;
    a.vy += (j * ny) / a.mass;
    a.vz += (j * nz) / a.mass;

    b.vx -= (j * nx) / b.mass;
    b.vy -= (j * ny) / b.mass;
    b.vz -= (j * nz) / b.mass;
  }, []);

  // --- init bits + lorenz ---
  useEffect(() => {
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    // bits (3D normalized)
    const bits: Bit3D[] = [];
    const seed = 42;
    const N = 140;

    for (let i = 0; i < N; i++) {
      const u1 = seededRandom(seed + i * 2);
      const u2 = seededRandom(seed + i * 2 + 1);
      const gx = Math.sqrt(-2 * Math.log(Math.max(1e-6, u1))) * Math.cos(2 * Math.PI * u2);
      const gy = Math.sqrt(-2 * Math.log(Math.max(1e-6, u1))) * Math.sin(2 * Math.PI * u2);

      const r = 0.012 + seededRandom(seed + i * 7) * 0.010; // ~1.2–2.2% of box

      bits.push({
        x: clamp(0.5 + gx * 0.12, r, 1 - r),
        y: clamp(0.5 + gy * 0.12, r, 1 - r),
        z: clamp(0.5 + (seededRandom(seed + i * 19) - 0.5) * 0.6, r, 1 - r),
        vx: (seededRandom(seed + i * 4) - 0.5) * 0.004,
        vy: (seededRandom(seed + i * 5) - 0.5) * 0.004,
        vz: (seededRandom(seed + i * 23) - 0.5) * 0.002,
        r,
        mass: r * r,
        color: SET1_COLORS[i % SET1_COLORS.length],
        s1: seededRandom(seed + i * 11) * 10,
        s2: seededRandom(seed + i * 13) * 10,
        s3: seededRandom(seed + i * 17) * 10,
      });
    }
    bitsRef.current = bits;

    // lorenz
    const sigma = 10, rho = 28, beta = 8 / 3;
    const dt = 0.01;
    let x = 1, y = 1, z = 1;

    for (let i = 0; i < 600; i++) {
      x += (sigma * (y - x)) * dt;
      y += (x * (rho - z) - y) * dt;
      z += (x * y - beta * z) * dt;
    }

    const particles: { state: LorenzPoint; trail: LorenzPoint[]; speed: number }[] = [];
    for (let p = 0; p < 28; p++) {
      let sx = x + p * 0.18, sy = y + p * 0.18, sz = z + p * 0.18;
      for (let i = 0; i < 120 + p * 30; i++) {
        sx += (sigma * (sy - sx)) * dt;
        sy += (sx * (rho - sz) - sy) * dt;
        sz += (sx * sy - beta * sz) * dt;
      }

      const trail: LorenzPoint[] = [];
      for (let i = 0; i < 180; i++) {
        sx += (sigma * (sy - sx)) * dt;
        sy += (sx * (rho - sz) - sy) * dt;
        sz += (sx * sy - beta * sz) * dt;
        trail.push({ x: sx, y: sy, z: sz });
      }
      particles.push({ state: { x: sx, y: sy, z: sz }, trail, speed: 0 });
    }
    lorenzRef.current = particles;
  }, []);

  // --- HiDPI ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      dprRef.current = dpr;

      const cssW = rect.width || CSS_W;
      const cssH = rect.height || CSS_H;
      WRef.current = cssW;
      HRef.current = cssH;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // --- main loop ---
  useEffect(() => {
    let lastT = performance.now();

    const loop = (t: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dpr = dprRef.current;
      const W = WRef.current;
      const H = HRef.current;

      const dtMs = clamp(t - lastT, 8, 32);
      lastT = t;
      const dt = dtMs / 16.666;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // panels (current)
      const LEFT = { x: PANEL.LEFT.x * W, y: PANEL.LEFT.y * H, w: PANEL.LEFT.w * W, h: PANEL.LEFT.h * H };
      const RIGHT = { x: PANEL.RIGHT.x * W, y: PANEL.RIGHT.y * H, w: PANEL.RIGHT.w * W, h: PANEL.RIGHT.h * H };

      // pointer smoothing + velocity
      const P = pointerRef.current;
      P.smooth.x += (P.raw.x - P.smooth.x) * 0.18;
      P.smooth.y += (P.raw.y - P.smooth.y) * 0.18;

      const pvx = P.smooth.x - P.last.x;
      const pvy = P.smooth.y - P.last.y;
      P.v.x += (pvx - P.v.x) * 0.35;
      P.v.y += (pvy - P.v.y) * 0.35;
      P.last.x = P.smooth.x;
      P.last.y = P.smooth.y;

      const pointerSpeed = Math.sqrt(P.v.x * P.v.x + P.v.y * P.v.y);

      // capacitor warp
      const I = interactionRef.current;
      const warpTarget = I.holdingDynamics ? 1.25 : 0;
      I.warp += (warpTarget - I.warp) * (I.holdingDynamics ? 0.03 : 0.05);
      I.warp *= 0.999;
      const warp = I.warp;

      // rotation
      rotationRef.current += 0.0022 * dt;
      const rot = rotationRef.current;

      // ---- True black background
      ctx.fillStyle = COLORS.BG;
      ctx.fillRect(0, 0, W, H);

      // headers
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = COLORS.RED;
      ctx.font = `700 ${Math.round(16 + W * 0.03)}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('BITS', W * 0.25, H * 0.12);

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = 'rgba(241,245,249,0.85)';
      ctx.font = `500 ${Math.round(9 + W * 0.012)}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('Discrete · Atomic · Local', W * 0.25, H * 0.18);

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = COLORS.GREEN;
      ctx.font = `700 ${Math.round(16 + W * 0.03)}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('DYNAMICS', W * 0.75, H * 0.12);

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = 'rgba(241,245,249,0.85)';
      ctx.font = `500 ${Math.round(9 + W * 0.012)}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('Continuous · Fluid · Global', W * 0.75, H * 0.18);
      ctx.globalAlpha = 1;

      // subtle panel glass (very subtle)
      const rr = 14;
      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#fff';
      roundRect(LEFT.x, LEFT.y, LEFT.w, LEFT.h, rr); ctx.fill();
      roundRect(RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h, rr); ctx.fill();
      ctx.restore();

      // ==========================================
      // LEFT: 3D zero-float balloons (normalized)
      // ==========================================
      const bits = bitsRef.current;
      const stuck = I.stuckBitIndex;
      const time = t * 0.001;

      // drift and damping in normalized space
      const drift = 0.00006;
      const baseDamp = 0.996;

      for (let i = 0; i < bits.length; i++) {
        const b = bits[i];

        if (i === stuck && P.raw.down) {
          // convert pointer to normalized coords
          const targetX = (P.smooth.x - LEFT.x) / LEFT.w;
          const targetY = (P.smooth.y - LEFT.y) / LEFT.h;

          const dx = targetX - b.x;
          const dy = targetY - b.y;

          const k = 0.07;
          const d = 0.16;

          b.vx += dx * k;
          b.vy += dy * k;

          b.vx *= (1 - d);
          b.vy *= (1 - d);

          // velocity coupling (convert pointer velocity to normalized)
          b.vx += (P.v.x / LEFT.w) * 0.18;
          b.vy += (P.v.y / LEFT.h) * 0.18;

          // gentle z-centering
          b.vz += (0.5 - b.z) * 0.012;
          b.vz *= 0.92;
        } else {
          // band-limited drift in 3D
          b.vx += smoothNoise(time, b.s1) * drift;
          b.vy += smoothNoise(time, b.s2) * drift;
          b.vz += smoothNoise(time, b.s3) * (drift * 0.3);
        }

        // energy-aware damping
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
        const damp = baseDamp - clamp(sp * 0.5, 0, 0.012);
        b.vx *= damp;
        b.vy *= damp;
        b.vz *= damp;

        // integrate
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z += b.vz * dt;

        // walls in [0,1] normalized space
        const wallE = 0.9;

        if (b.x < b.r) { b.x = b.r; b.vx *= -wallE; }
        if (b.x > 1 - b.r) { b.x = 1 - b.r; b.vx *= -wallE; }
        if (b.y < b.r) { b.y = b.r; b.vy *= -wallE; }
        if (b.y > 1 - b.r) { b.y = 1 - b.r; b.vy *= -wallE; }
        if (b.z < b.r) { b.z = b.r; b.vz *= -wallE; }
        if (b.z > 1 - b.r) { b.z = 1 - b.r; b.vz *= -wallE; }
      }

      // collisions (3D normalized)
      const stuckIdx = I.stuckBitIndex;
      const isDragging = P.raw.down && stuckIdx !== null;
      for (let i = 0; i < bits.length; i++) {
        for (let j = i + 1; j < bits.length; j++) {
          const aIsDragged = isDragging && i === stuckIdx;
          const bIsDragged = isDragging && j === stuckIdx;
          resolveCollision3D(bits[i], bits[j], aIsDragged, bIsDragged);
        }
      }

      // render: depth-sort by z (far first)
      const order = [...bits].sort((a, b) => a.z - b.z);

      for (const b of order) {
        const proj = projectBit(b, LEFT);
        const rr2 = proj.rr;

        // depth cues: 0=far, 1=near
        const depth = b.z;
        const alpha = 0.45 + depth * 0.45;
        const glow = 6 + depth * 10;

        ctx.save();
        ctx.globalAlpha = alpha;

        // outer glow
        ctx.shadowColor = b.color;
        ctx.shadowBlur = glow;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, rr2, 0, Math.PI * 2);
        ctx.fill();

        // specular highlight
        ctx.shadowBlur = 0;
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.arc(proj.sx - rr2 * 0.25, proj.sy - rr2 * 0.25, rr2 * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // thin rim
        ctx.globalAlpha = alpha * 0.28;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, rr2 * 0.98, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // ==========================================
      // RIGHT: "jelly field" + Lorenz
      // ==========================================
      const cx = RIGHT.x + RIGHT.w / 2;
      const cy = RIGHT.y + RIGHT.h / 2;

      const J = jellyRef.current;
      if (J.cx === 0 && J.cy === 0) { J.cx = cx; J.cy = cy; }

      const targetCx = I.holdingDynamics ? P.smooth.x : cx;
      const targetCy = I.holdingDynamics ? P.smooth.y : cy;

      const spring = I.holdingDynamics ? 0.08 : 0.05;
      const damping = I.holdingDynamics ? 0.82 : 0.88;

      J.vx += (targetCx - J.cx) * spring;
      J.vy += (targetCy - J.cy) * spring;
      J.vx *= damping;
      J.vy *= damping;
      J.cx += J.vx * dt;
      J.cy += J.vy * dt;

      if (I.holdingDynamics) {
        J.cx += P.v.x * 0.45 * dt;
        J.cy += P.v.y * 0.45 * dt;
      }

      const speedBoost = clamp(pointerSpeed / 22, 0, 1);
      const jellyStrength = warp * (0.75 + 0.9 * speedBoost);

      const applyJellyWarp = (px: number, py: number) => {
        if (jellyStrength < 0.002) return { x: px, y: py };

        const dx = px - J.cx;
        const dy = py - J.cy;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-6;

        const R = Math.max(200, RIGHT.w * 0.95);
        if (dist > R) return { x: px, y: py };

        const u = 1 - dist / R;
        const fall = u * u;

        const suction = fall * (36 + 70 * jellyStrength) * jellyStrength;
        const swirl = fall * (18 + 60 * jellyStrength) * jellyStrength;
        const bulge = fall * (8 + 22 * jellyStrength) * jellyStrength;

        const nx = dx / dist;
        const ny = dy / dist;

        const handTurn = clamp((P.v.x * 0.05 - P.v.y * 0.05), -1, 1);
        const sx = -ny;
        const sy = nx;

        return {
          x: px - nx * suction + sx * swirl * handTurn + nx * bulge,
          y: py - ny * suction + sy * swirl * handTurn + ny * bulge
        };
      };

      const lorenz = lorenzRef.current;
      const sigma = 10, rho = 28, beta = 8 / 3;
      const ldt = 0.0065 * dt;
      const scale = 5.2;

      for (const p of lorenz) {
        let { x, y, z } = p.state;

        let dx = sigma * (y - x);
        let dy = x * (rho - z) - y;
        let dz = x * y - beta * z;

        if (I.holdingDynamics && jellyStrength > 0.01) {
          const pr = project3D(x, y, z - 25, rot);
          const sxp = cx + pr.x * scale;
          const syp = cy + pr.y * scale;

          const ddx = J.cx - sxp;
          const ddy = J.cy - syp;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          const R = Math.max(130, RIGHT.w * 0.55);
          if (dist < R) {
            const u = 1 - dist / R;
            const fall = u * u;
            const strength = fall * jellyStrength * 2.2;

            const pullX = (ddx / (scale * 1.25) - x * 0.02) * strength * 0.35;
            const pullY = (ddy / (scale * 1.25) - y * 0.02) * strength * 0.35;

            dx += pullX;
            dy += pullY;
            dz += (x * pullY - y * pullX) * 0.02;
          }
        }

        const sp = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
        const damp = 1 - clamp(sp * 0.00025, 0, 0.02);

        x += dx * ldt * damp;
        y += dy * ldt * damp;
        z += dz * ldt * damp;

        p.state = { x, y, z };

        const prev = p.trail[p.trail.length - 1];
        const dvx = x - prev.x, dvy = y - prev.y, dvz = z - prev.z;
        p.speed += (Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz) - p.speed) * 0.15;

        p.trail.push({ x, y, z });
        if (p.trail.length > 190) p.trail.shift();
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const p of lorenz) {
        if (p.trail.length < 3) continue;

        const a = 0.18 + clamp(p.speed * 2.4, 0, 0.42);
        ctx.strokeStyle = `rgba(34, 197, 94, ${a})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        const step = 2;

        for (let i = 0; i < p.trail.length; i += step) {
          const pt = p.trail[i];
          const pr = project3D(pt.x, pt.y, pt.z - 25, rot);
          let px = cx + pr.x * scale;
          let py = cy + pr.y * scale;

          const w = applyJellyWarp(px, py);
          px = w.x; py = w.y;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        const last = p.trail[p.trail.length - 1];
        const pr = project3D(last.x, last.y, last.z - 25, rot);
        let px = cx + pr.x * scale;
        let py = cy + pr.y * scale;
        const w = applyJellyWarp(px, py);
        px = w.x; py = w.y;

        const tipA = clamp(0.25 + p.speed * 3.2, 0.25, 0.8);
        ctx.fillStyle = `rgba(200,255,200,${tipA})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [project3D, projectBit, resolveCollision3D]);

  // --- Input ---
  const setPointerFromEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (!t) return;
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    pointerRef.current.raw.x = clientX - rect.left;
    pointerRef.current.raw.y = clientY - rect.top;
  }, []);

  const handleStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setPointerFromEvent(e);
    pointerRef.current.raw.down = true;

    const W = WRef.current;
    const H = HRef.current;
    const LEFT = { x: PANEL.LEFT.x * W, y: PANEL.LEFT.y * H, w: PANEL.LEFT.w * W, h: PANEL.LEFT.h * H };
    const rightX = PANEL.RIGHT.x * W;

    if (pointerRef.current.raw.x < rightX) {
      // pick closest balloon
      const bits = bitsRef.current;
      const mx = pointerRef.current.raw.x;
      const my = pointerRef.current.raw.y;

      let best = -1;
      let bestD = Infinity;

      for (let i = 0; i < bits.length; i++) {
        const b = bits[i];
        const proj = projectBit(b, LEFT);
        const dx = proj.sx - mx;
        const dy = proj.sy - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < proj.rr + 16 && d < bestD) { bestD = d; best = i; }
      }

      interactionRef.current.stuckBitIndex = best >= 0 ? best : null;
      interactionRef.current.holdingDynamics = false;
    } else {
      interactionRef.current.stuckBitIndex = null;
      interactionRef.current.holdingDynamics = true;
    }
  }, [setPointerFromEvent, projectBit]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setPointerFromEvent(e);
  }, [setPointerFromEvent]);

  const handleEnd = useCallback(() => {
    pointerRef.current.raw.down = false;
    interactionRef.current.holdingDynamics = false;
    interactionRef.current.stuckBitIndex = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        maxWidth: CSS_W,
        aspectRatio: `${CSS_W} / ${CSS_H}`,
        touchAction: 'none',
      }}
      className="rounded-xl cursor-crosshair"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    />
  );
}
