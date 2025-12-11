'use client';

/**
 * HyperDimensionalCode - "Observer Window"
 *
 * CORE INSIGHT:
 * You're not collapsing the OBJECT - you're collapsing the OBSERVER.
 * The 4D structure exists. Your observation apparatus has limited dimensionality.
 *
 * THE PHYSICS:
 * - 4.0D Window: Raw chaos. Full hyperdimensional perception.
 * - 3.0D Window: Depth emerges. Scanlines appear.
 * - 2.0D Window: QUANTIZATION. Points snap to grid. Code forms.
 *
 * MEANING FROM THE UNSEEN:
 * The W-coordinate (4th dimension) determines which CHARACTER appears.
 * The "meaning" of the code comes from the dimension you can't see.
 */

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

// === CONFIG ===
const CHARS = '01λφψ{}[]<>∂∫∑∏xyz=+-*/#@&|~^:;';
const GRID_SIZE = 14;
const FONT_SIZE = 12;

interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

type ShapeType = 'tesseract' | '5-cell' | '16-cell' | '24-cell' | 'hypersphere';

interface CodeCollapseProps {
  fullPage?: boolean;
}

// === SHAPE GENERATORS ===

const generateTesseract = (): Vec4[] => {
  const verts: Vec4[] = [];
  const baseVerts: Vec4[] = [];

  for (let i = 0; i < 16; i++) {
    baseVerts.push({
      x: (i & 1) ? 1 : -1,
      y: (i & 2) ? 1 : -1,
      z: (i & 4) ? 1 : -1,
      w: (i & 8) ? 1 : -1,
    });
  }

  // Edges with interpolation
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const v1 = baseVerts[i];
      const v2 = baseVerts[j];
      let diff = 0;
      if (v1.x !== v2.x) diff++;
      if (v1.y !== v2.y) diff++;
      if (v1.z !== v2.z) diff++;
      if (v1.w !== v2.w) diff++;

      if (diff === 1) {
        const segments = 5;
        for (let k = 0; k <= segments; k++) {
          const t = k / segments;
          verts.push({
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t,
            z: v1.z + (v2.z - v1.z) * t,
            w: v1.w + (v2.w - v1.w) * t,
          });
        }
      }
    }
  }

  // Add volume particles for density
  for (let i = 0; i < 80; i++) {
    verts.push({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
      w: (Math.random() - 0.5) * 2,
    });
  }

  return verts;
};

const generate5Cell = (): Vec4[] => {
  const verts: Vec4[] = [];
  const sqrt5 = Math.sqrt(5);

  const baseVerts: Vec4[] = [
    { x: 1, y: 1, z: 1, w: -1/sqrt5 },
    { x: 1, y: -1, z: -1, w: -1/sqrt5 },
    { x: -1, y: 1, z: -1, w: -1/sqrt5 },
    { x: -1, y: -1, z: 1, w: -1/sqrt5 },
    { x: 0, y: 0, z: 0, w: sqrt5 - 1/sqrt5 },
  ];

  baseVerts.forEach(v => {
    const len = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z + v.w*v.w);
    v.x = (v.x / len) * 1.5;
    v.y = (v.y / len) * 1.5;
    v.z = (v.z / len) * 1.5;
    v.w = (v.w / len) * 1.5;
  });

  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      const v1 = baseVerts[i];
      const v2 = baseVerts[j];
      const segments = 6;
      for (let k = 0; k <= segments; k++) {
        const t = k / segments;
        verts.push({
          x: v1.x + (v2.x - v1.x) * t,
          y: v1.y + (v2.y - v1.y) * t,
          z: v1.z + (v2.z - v1.z) * t,
          w: v1.w + (v2.w - v1.w) * t,
        });
      }
    }
  }

  // Volume particles
  for (let i = 0; i < 60; i++) {
    const r = Math.random();
    const idx = Math.floor(Math.random() * 5);
    const v = baseVerts[idx];
    verts.push({
      x: v.x * r + (Math.random() - 0.5) * 0.5,
      y: v.y * r + (Math.random() - 0.5) * 0.5,
      z: v.z * r + (Math.random() - 0.5) * 0.5,
      w: v.w * r + (Math.random() - 0.5) * 0.5,
    });
  }

  return verts;
};

const generate16Cell = (): Vec4[] => {
  const verts: Vec4[] = [];
  const scale = 1.5;

  const baseVerts: Vec4[] = [
    { x: scale, y: 0, z: 0, w: 0 },
    { x: -scale, y: 0, z: 0, w: 0 },
    { x: 0, y: scale, z: 0, w: 0 },
    { x: 0, y: -scale, z: 0, w: 0 },
    { x: 0, y: 0, z: scale, w: 0 },
    { x: 0, y: 0, z: -scale, w: 0 },
    { x: 0, y: 0, z: 0, w: scale },
    { x: 0, y: 0, z: 0, w: -scale },
  ];

  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (Math.floor(i/2) === Math.floor(j/2)) continue;
      const v1 = baseVerts[i];
      const v2 = baseVerts[j];
      const segments = 5;
      for (let k = 0; k <= segments; k++) {
        const t = k / segments;
        verts.push({
          x: v1.x + (v2.x - v1.x) * t,
          y: v1.y + (v2.y - v1.y) * t,
          z: v1.z + (v2.z - v1.z) * t,
          w: v1.w + (v2.w - v1.w) * t,
        });
      }
    }
  }

  // Diamond-distributed volume
  for (let i = 0; i < 80; i++) {
    const x = Math.random() - 0.5;
    const y = Math.random() - 0.5;
    const z = Math.random() - 0.5;
    const w = Math.random() - 0.5;
    const d = (Math.abs(x) + Math.abs(y) + Math.abs(z) + Math.abs(w)) / scale;
    verts.push({ x: x/d, y: y/d, z: z/d, w: w/d });
  }

  return verts;
};

const generate24Cell = (): Vec4[] => {
  const verts: Vec4[] = [];
  const scale = 1.2;
  const baseVerts: Vec4[] = [];

  const coords = [scale, -scale];
  for (const c of coords) {
    baseVerts.push({ x: c, y: 0, z: 0, w: 0 });
    baseVerts.push({ x: 0, y: c, z: 0, w: 0 });
    baseVerts.push({ x: 0, y: 0, z: c, w: 0 });
    baseVerts.push({ x: 0, y: 0, z: 0, w: c });
  }

  const s = scale / Math.sqrt(2);
  for (let i = 0; i < 16; i++) {
    baseVerts.push({
      x: (i & 1) ? s : -s,
      y: (i & 2) ? s : -s,
      z: (i & 4) ? s : -s,
      w: (i & 8) ? s : -s,
    });
  }

  const targetDist = Math.sqrt(2) * scale;
  for (let i = 0; i < baseVerts.length; i++) {
    for (let j = i + 1; j < baseVerts.length; j++) {
      const v1 = baseVerts[i];
      const v2 = baseVerts[j];
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const dz = v2.z - v1.z;
      const dw = v2.w - v1.w;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);

      if (Math.abs(dist - targetDist) < 0.01) {
        const segments = 3;
        for (let k = 0; k <= segments; k++) {
          const t = k / segments;
          verts.push({
            x: v1.x + dx * t,
            y: v1.y + dy * t,
            z: v1.z + dz * t,
            w: v1.w + dw * t,
          });
        }
      }
    }
  }
  return verts;
};

const generateHypersphere = (): Vec4[] => {
  const verts: Vec4[] = [];
  const n = 350;
  const scale = 1.5;

  for (let i = 0; i < n; i++) {
    // Gaussian normalization for uniform sphere distribution
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const z = (Math.random() - 0.5) * 2;
    const w = (Math.random() - 0.5) * 2;
    const m = Math.sqrt(x*x + y*y + z*z + w*w);
    verts.push({
      x: (x / m) * scale,
      y: (y / m) * scale,
      z: (z / m) * scale,
      w: (w / m) * scale,
    });
  }
  return verts;
};

export default function CodeCollapse({ fullPage = false }: CodeCollapseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [shape, setShape] = useState<ShapeType>('tesseract');

  // Animation state
  const stateRef = useRef({
    // 6 rotation velocities (used by sliders)
    velXY: 0.0,
    velXZ: 0.0,
    velXW: 0.008,
    velYZ: 0.0,
    velYW: 0.005,
    velZW: 0.003,

    // Current angles
    angXY: 0, angXZ: 0, angXW: 0,
    angYZ: 0, angYW: 0, angZW: 0,

    // DRAG MOMENTUM (for viz drag interaction)
    dragVelXW: 0,
    dragVelYW: 0,

    // OBSERVATION DIMENSIONALITY: 4.0 (chaos) → 2.0 (code)
    observerDim: 4.0,

    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    lastMoveTime: 0,
    activeControl: null as string | null,
  });

  const SCALE = 2;
  const BASE_W = fullPage ? 1100 : 700;
  const BASE_H = fullPage ? 850 : 550;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;

  const VIEW_HEIGHT = H * 0.72;
  const CONTROL_HEIGHT = H * 0.28;

  const particles = useMemo(() => {
    switch (shape) {
      case 'tesseract': return generateTesseract();
      case '5-cell': return generate5Cell();
      case '16-cell': return generate16Cell();
      case '24-cell': return generate24Cell();
      case 'hypersphere': return generateHypersphere();
      default: return generateTesseract();
    }
  }, [shape]);

  // Full 4D rotation
  const rotate4D = useCallback((v: Vec4, s: typeof stateRef.current): Vec4 => {
    let { x, y, z, w } = v;

    // XY
    let sin = Math.sin(s.angXY), cos = Math.cos(s.angXY);
    let nx = x * cos - y * sin;
    let ny = x * sin + y * cos;
    x = nx; y = ny;

    // XZ
    sin = Math.sin(s.angXZ); cos = Math.cos(s.angXZ);
    nx = x * cos - z * sin;
    const nz1 = x * sin + z * cos;
    x = nx; z = nz1;

    // YZ
    sin = Math.sin(s.angYZ); cos = Math.cos(s.angYZ);
    ny = y * cos - z * sin;
    const nz2 = y * sin + z * cos;
    y = ny; z = nz2;

    // XW (4D)
    sin = Math.sin(s.angXW); cos = Math.cos(s.angXW);
    nx = x * cos - w * sin;
    let nw = x * sin + w * cos;
    x = nx; w = nw;

    // YW (4D)
    sin = Math.sin(s.angYW); cos = Math.cos(s.angYW);
    ny = y * cos - w * sin;
    nw = y * sin + w * cos;
    y = ny; w = nw;

    // ZW (4D)
    sin = Math.sin(s.angZW); cos = Math.cos(s.angZW);
    const nz3 = z * cos - w * sin;
    nw = z * sin + w * cos;
    z = nz3; w = nw;

    return { x, y, z, w };
  }, []);

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;

      // Update angles from velocities
      if (state.activeControl !== 'viz') {
        state.angXY += state.velXY;
        state.angXZ += state.velXZ;
        state.angXW += state.velXW;
        state.angYZ += state.velYZ;
        state.angYW += state.velYW;
        state.angZW += state.velZW;
      }

      // Clear
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      // === COLLAPSE FACTOR ===
      // 4.0 → 2.0 maps to 0.0 → 1.0
      const collapseFactor = Math.max(0, Math.min(1, (4.0 - state.observerDim) / 2.0));

      // NON-LINEAR SNAP: Starts weak, snaps HARD at the end
      const snapStrength = Math.pow(collapseFactor, 3);

      // === HEADER ===
      const dimLabel = state.observerDim > 3.5 ? '4D HYPERCHAOS' :
                       state.observerDim > 3.0 ? '3.5D PROJECTION' :
                       state.observerDim > 2.5 ? '3D SHADOW' :
                       state.observerDim > 2.1 ? '2.5D SCANLINES' : '2D CODE';

      ctx.fillStyle = collapseFactor > 0.8 ? '#22c55e' : collapseFactor > 0.4 ? '#eab308' : '#3b82f6';
      ctx.font = `bold ${15 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('OBSERVER WINDOW', 20 * SCALE, 24 * SCALE);

      ctx.fillStyle = '#666';
      ctx.font = `${11 * SCALE}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${state.observerDim.toFixed(2)}D → ${dimLabel}`, W - 20 * SCALE, 24 * SCALE);

      // Divider
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, VIEW_HEIGHT);
      ctx.lineTo(W, VIEW_HEIGHT);
      ctx.stroke();

      // === SCANLINES (intermediate collapse) ===
      if (collapseFactor > 0.2 && collapseFactor < 0.9) {
        ctx.fillStyle = `rgba(34, 197, 94, ${collapseFactor * 0.03})`;
        for (let i = 40 * SCALE; i < VIEW_HEIGHT; i += 4 * SCALE) {
          ctx.fillRect(0, i, W, 1 * SCALE);
        }
      }

      // === RENDER PARTICLES ===
      ctx.font = `${FONT_SIZE * SCALE}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const projected = particles.map((p, i) => {
        const rotP = rotate4D(p, state);

        // 4D → 3D perspective projection
        const distW = 3;
        const scaleW = 1 / (distW - rotP.w);
        const px = rotP.x * scaleW;
        const py = rotP.y * scaleW;
        const pz = rotP.z * scaleW;

        // Z-influence diminishes as we collapse
        const zInfluence = pz * (1 - snapStrength);

        // 3D → 2D screen
        const fov = 600;
        const screenScale = fov / (fov - zInfluence * 200);

        let sx = px * screenScale * 180 + W / 2;
        let sy = py * screenScale * 180 + VIEW_HEIGHT / 2;

        // === QUANTIZATION (The Code Forming) ===
        if (snapStrength > 0.01) {
          const gx = Math.round(sx / (GRID_SIZE * SCALE)) * (GRID_SIZE * SCALE);
          const gy = Math.round(sy / (GRID_SIZE * SCALE * 1.3)) * (GRID_SIZE * SCALE * 1.3);
          sx = sx * (1 - snapStrength) + gx * snapStrength;
          sy = sy * (1 - snapStrength) + gy * snapStrength;
        }

        return {
          x: sx,
          y: sy,
          z: pz,
          w: rotP.w,
          index: i,
          scale: screenScale,
        };
      });

      // Sort by depth
      projected.sort((a, b) => a.z - b.z);

      projected.forEach(({ x, y, z, w, index, scale }) => {
        if (y < 35 * SCALE || y > VIEW_HEIGHT - 10) return;

        // === CHARACTER FROM W-DIMENSION ===
        // The "meaning" comes from the 4th dimension you can't see
        const wNorm = (w + 1.5) / 3; // Normalize to 0-1
        const charIdx = Math.floor(wNorm * CHARS.length + index) % CHARS.length;
        const char = CHARS[charIdx];

        // Alpha based on depth
        const depthAlpha = Math.max(0.2, 1 - Math.abs(z) * 0.5);
        const finalAlpha = depthAlpha * (1 - snapStrength * 0.3) + snapStrength * 0.85;

        // Color transition
        if (snapStrength > 0.85) {
          // Full code mode: green
          ctx.fillStyle = `rgba(34, 197, 94, ${finalAlpha})`;
        } else if (snapStrength > 0.3) {
          // Transitioning: yellow-green
          const g = 150 + 105 * snapStrength;
          const r = 100 * (1 - snapStrength);
          ctx.fillStyle = `rgba(${r}, ${g}, 50, ${finalAlpha})`;
        } else {
          // Chaos mode: blue/purple based on W
          const hue = 200 + w * 40;
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${finalAlpha})`;
        }

        if (snapStrength > 0.7) {
          // Text mode
          ctx.fillText(char, x, y);
        } else if (snapStrength > 0.3) {
          // Hybrid: small text
          ctx.font = `${(FONT_SIZE - 2) * SCALE}px "Courier New", monospace`;
          ctx.fillText(char, x, y);
          ctx.font = `${FONT_SIZE * SCALE}px "Courier New", monospace`;
        } else {
          // Particle mode
          ctx.beginPath();
          ctx.arc(x, y, 2 * scale * SCALE, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // === CONTROL PANEL ===
      const panelY = VIEW_HEIGHT + 12 * SCALE;
      const padding = 20 * SCALE;

      // Shape buttons
      ctx.fillStyle = '#555';
      ctx.font = `${9 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('TOPOLOGY', padding, panelY);

      const shapes: ShapeType[] = ['tesseract', '5-cell', '16-cell', '24-cell', 'hypersphere'];
      const shapeLabels = ['Tesseract', '5-Cell', '16-Cell', '24-Cell', 'Glome'];
      const btnWidth = 68 * SCALE;

      shapes.forEach((s, i) => {
        const bx = padding + i * btnWidth;
        const by = panelY + 10 * SCALE;
        const isActive = shape === s;

        ctx.fillStyle = isActive ? '#22c55e' : '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(bx, by, btnWidth - 6 * SCALE, 20 * SCALE, 3 * SCALE);
        ctx.fill();

        if (!isActive) {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = isActive ? '#000' : '#777';
        ctx.font = `${8 * SCALE}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(shapeLabels[i], bx + (btnWidth - 6 * SCALE) / 2, by + 12 * SCALE);
      });

      // === ROTATION VELOCITIES ===
      const rotY = panelY + 42 * SCALE;
      ctx.fillStyle = '#555';
      ctx.font = `${9 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('ROTATION INJECTION', padding, rotY);

      const rotations = [
        { key: 'XY', color: '#ef4444', vel: state.velXY },
        { key: 'XZ', color: '#f97316', vel: state.velXZ },
        { key: 'XW', color: '#eab308', vel: state.velXW },
        { key: 'YZ', color: '#22c55e', vel: state.velYZ },
        { key: 'YW', color: '#06b6d4', vel: state.velYW },
        { key: 'ZW', color: '#8b5cf6', vel: state.velZW },
      ];

      const rotSliderW = (W - padding * 2 - 30 * SCALE) / 6;
      rotations.forEach((rot, i) => {
        const rx = padding + i * rotSliderW;
        const ry = rotY + 12 * SCALE;
        const sw = rotSliderW - 12 * SCALE;

        // Label
        ctx.fillStyle = rot.color;
        ctx.font = `bold ${9 * SCALE}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(rot.key, rx + sw / 2, ry);

        // Track
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(rx, ry + 6 * SCALE, sw, 5 * SCALE, 2 * SCALE);
        ctx.fill();

        // Fill from center (velocity can be negative)
        const norm = (rot.vel + 0.03) / 0.06; // -0.03 to 0.03 → 0 to 1
        const center = rx + sw / 2;
        const fillStart = norm < 0.5 ? rx + sw * norm : center;
        const fillEnd = norm < 0.5 ? center : rx + sw * norm;

        ctx.fillStyle = rot.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.roundRect(fillStart, ry + 6 * SCALE, fillEnd - fillStart, 5 * SCALE, 2 * SCALE);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Handle
        const hx = rx + sw * norm;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(hx, ry + 8.5 * SCALE, 5 * SCALE, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rot.color;
        ctx.lineWidth = 1.5 * SCALE;
        ctx.stroke();
      });

      // === OBSERVER DIMENSIONALITY (THE CORE SLIDER) ===
      const dimY = rotY + 42 * SCALE;
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('OBSERVATION DIMENSIONALITY', padding, dimY);

      // Status
      const statusColor = collapseFactor > 0.9 ? '#22c55e' : collapseFactor > 0.5 ? '#eab308' : '#3b82f6';
      const statusText = collapseFactor > 0.9 ? '>> CODIFIED <<' : '>> ANALOG <<';
      ctx.fillStyle = statusColor;
      ctx.textAlign = 'right';
      ctx.font = `bold ${9 * SCALE}px monospace`;
      ctx.fillText(statusText, W - padding, dimY);

      const dimSliderX = padding;
      const dimSliderW = W - padding * 2;
      const dimSliderY = dimY + 12 * SCALE;
      const dimSliderH = 12 * SCALE;

      // Track
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimSliderW, dimSliderH, 6 * SCALE);
      ctx.fill();

      // Gradient fill
      const gradient = ctx.createLinearGradient(dimSliderX, 0, dimSliderX + dimSliderW, 0);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.5, '#eab308');
      gradient.addColorStop(1, '#3b82f6');

      // Fill amount (4.0 = right, 2.0 = left)
      const dimNorm = (state.observerDim - 2.0) / 2.0; // 0 at 2D, 1 at 4D
      const dimFillW = dimNorm * dimSliderW;

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimFillW, dimSliderH, 6 * SCALE);
      ctx.fill();

      // Handle
      const dimHandleX = dimSliderX + dimFillW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(dimHandleX, dimSliderY + dimSliderH / 2, 10 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 3 * SCALE;
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#22c55e';
      ctx.font = `${8 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('2D CODE', dimSliderX, dimSliderY + dimSliderH + 12 * SCALE);

      ctx.fillStyle = '#eab308';
      ctx.textAlign = 'center';
      ctx.fillText('3D SHADOW', dimSliderX + dimSliderW / 2, dimSliderY + dimSliderH + 12 * SCALE);

      ctx.fillStyle = '#3b82f6';
      ctx.textAlign = 'right';
      ctx.fillText('4D CHAOS', dimSliderX + dimSliderW, dimSliderY + dimSliderH + 12 * SCALE);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [particles, rotate4D, W, H, VIEW_HEIGHT, CONTROL_HEIGHT, shape]);

  // === INTERACTION ===
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
      const { x, y } = getCanvasCoords(e);
      const state = stateRef.current;
      const panelY = VIEW_HEIGHT + 12 * SCALE;
      const padding = 20 * SCALE;

      // Shape buttons
      const btnY = panelY + 10 * SCALE;
      const btnWidth = 68 * SCALE;
      if (y >= btnY && y <= btnY + 20 * SCALE) {
        const shapes: ShapeType[] = ['tesseract', '5-cell', '16-cell', '24-cell', 'hypersphere'];
        for (let i = 0; i < shapes.length; i++) {
          const bx = padding + i * btnWidth;
          if (x >= bx && x <= bx + btnWidth - 6 * SCALE) {
            setShape(shapes[i]);
            return;
          }
        }
      }

      // Rotation sliders
      const rotY = panelY + 42 * SCALE + 12 * SCALE;
      const rotSliderW = (W - padding * 2 - 30 * SCALE) / 6;
      if (y >= rotY && y <= rotY + 20 * SCALE) {
        const keys = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'] as const;
        for (let i = 0; i < keys.length; i++) {
          const rx = padding + i * rotSliderW;
          const sw = rotSliderW - 12 * SCALE;
          if (x >= rx && x <= rx + sw) {
            state.isDragging = true;
            state.activeControl = `rot${keys[i]}`;
            const norm = Math.max(0, Math.min(1, (x - rx) / sw));
            const vel = (norm - 0.5) * 0.06; // -0.03 to 0.03
            const key = keys[i];
            if (key === 'XY') state.velXY = vel;
            else if (key === 'XZ') state.velXZ = vel;
            else if (key === 'XW') state.velXW = vel;
            else if (key === 'YZ') state.velYZ = vel;
            else if (key === 'YW') state.velYW = vel;
            else if (key === 'ZW') state.velZW = vel;
            return;
          }
        }
      }

      // Dimensionality slider
      const dimY = panelY + 42 * SCALE + 42 * SCALE + 12 * SCALE;
      const dimSliderW = W - padding * 2;
      if (y >= dimY - 15 * SCALE && y <= dimY + 25 * SCALE && x >= padding - 15 * SCALE && x <= padding + dimSliderW + 15 * SCALE) {
        state.isDragging = true;
        state.activeControl = 'dim';
        const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
        state.observerDim = 2.0 + norm * 2.0; // 2.0 to 4.0
        return;
      }

      // Visualization drag
      if (y < VIEW_HEIGHT) {
        state.isDragging = true;
        state.activeControl = 'viz';
        state.lastMouseX = x;
        state.lastMouseY = y;
      }
    },
    [getCanvasCoords, W, VIEW_HEIGHT]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const state = stateRef.current;

      if (!state.isDragging) return;

      const padding = 20 * SCALE;

      if (state.activeControl?.startsWith('rot')) {
        const key = state.activeControl.slice(3);
        const keys = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'];
        const idx = keys.indexOf(key);
        const rotSliderW = (W - padding * 2 - 30 * SCALE) / 6;
        const rx = padding + idx * rotSliderW;
        const sw = rotSliderW - 12 * SCALE;
        const norm = Math.max(0, Math.min(1, (x - rx) / sw));
        const vel = (norm - 0.5) * 0.06;
        if (key === 'XY') state.velXY = vel;
        else if (key === 'XZ') state.velXZ = vel;
        else if (key === 'XW') state.velXW = vel;
        else if (key === 'YZ') state.velYZ = vel;
        else if (key === 'YW') state.velYW = vel;
        else if (key === 'ZW') state.velZW = vel;
      } else if (state.activeControl === 'dim') {
        const dimSliderW = W - padding * 2;
        const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
        state.observerDim = 2.0 + norm * 2.0;
      } else if (state.activeControl === 'viz') {
        const dx = x - state.lastMouseX;
        const dy = y - state.lastMouseY;
        state.angXW += dx * 0.005;
        state.angYW += dy * 0.005;
        state.lastMouseX = x;
        state.lastMouseY = y;
      }
    },
    [getCanvasCoords, W, VIEW_HEIGHT]
  );

  const handleEnd = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.activeControl = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        width: '100%',
        maxWidth: BASE_W,
        aspectRatio: `${W} / ${H}`,
        touchAction: 'none',
      }}
      className="rounded-xl cursor-grab active:cursor-grabbing bg-black shadow-2xl"
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
