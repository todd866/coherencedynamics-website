'use client';

/**
 * =============================================================================
 * CodeForming - Hypercube with Dimensional Collapse to ACGT
 * =============================================================================
 *
 * Same physics as TesseractSimple, but with a dimensionality slider.
 * As you collapse from 4D → 2D, the vertices encode to ACGT symbols.
 * At full collapse: single letter that feeds back into the rotation.
 *
 * THE ENCODING:
 * - Each vertex's W coordinate determines its base (A, C, G, T)
 * - At low-D, vertices snap to grid and become letters
 * - The assigned base creates an attractor that pulls the rotation
 *
 * =============================================================================
 */

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

type ShapeType = 'tesseract' | '16-cell' | '24-cell';

interface Shape {
  vertices: Vec4[];
  edges: { from: number; to: number }[];
  name: string;
}

interface PhysicsState {
  angleXY: number;
  angleXZ: number;
  angleYZ: number;
  angleXW: number;
  angleYW: number;
  angleZW: number;
  omegaXY: number;
  omegaXZ: number;
  omegaYZ: number;
  omegaXW: number;
  omegaYW: number;
  omegaZW: number;
  observerDim: number;
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;
  lastMoveTime: number;
  activeControl: string | null;
}

interface CodeFormingProps {
  fullPage?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BASES = ['A', 'C', 'G', 'T'] as const;
type Base = typeof BASES[number];

const BASE_COLORS: Record<Base, string> = {
  'A': '#22c55e',  // Green
  'C': '#3b82f6',  // Blue
  'G': '#f59e0b',  // Amber
  'T': '#ef4444',  // Red
};

const DAMPING = 0.003;
const DRAG_SENSITIVITY = 0.006;

// =============================================================================
// SHAPE GENERATORS
// =============================================================================

function generateTesseract(): Shape {
  const vertices: Vec4[] = [];
  for (let i = 0; i < 16; i++) {
    vertices.push({
      x: (i & 1) ? 1 : -1,
      y: (i & 2) ? 1 : -1,
      z: (i & 4) ? 1 : -1,
      w: (i & 8) ? 1 : -1,
    });
  }

  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const diff = (v1.x !== v2.x ? 1 : 0) + (v1.y !== v2.y ? 1 : 0) +
                   (v1.z !== v2.z ? 1 : 0) + (v1.w !== v2.w ? 1 : 0);
      if (diff === 1) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return { vertices, edges, name: 'Tesseract' };
}

function generate16Cell(): Shape {
  const scale = 1.5;
  const vertices: Vec4[] = [
    { x: scale, y: 0, z: 0, w: 0 },
    { x: -scale, y: 0, z: 0, w: 0 },
    { x: 0, y: scale, z: 0, w: 0 },
    { x: 0, y: -scale, z: 0, w: 0 },
    { x: 0, y: 0, z: scale, w: 0 },
    { x: 0, y: 0, z: -scale, w: 0 },
    { x: 0, y: 0, z: 0, w: scale },
    { x: 0, y: 0, z: 0, w: -scale },
  ];

  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (Math.floor(i / 2) !== Math.floor(j / 2)) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return { vertices, edges, name: '16-Cell' };
}

function generate24Cell(): Shape {
  const vertices: Vec4[] = [];
  const scale = 1.2;

  const axes = [
    { x: 1, y: 0, z: 0, w: 0 }, { x: -1, y: 0, z: 0, w: 0 },
    { x: 0, y: 1, z: 0, w: 0 }, { x: 0, y: -1, z: 0, w: 0 },
    { x: 0, y: 0, z: 1, w: 0 }, { x: 0, y: 0, z: -1, w: 0 },
    { x: 0, y: 0, z: 0, w: 1 }, { x: 0, y: 0, z: 0, w: -1 },
  ];
  axes.forEach(v => vertices.push({
    x: v.x * scale, y: v.y * scale, z: v.z * scale, w: v.w * scale
  }));

  const s = scale * 0.707;
  for (let i = 0; i < 16; i++) {
    vertices.push({
      x: ((i & 1) ? s : -s),
      y: ((i & 2) ? s : -s),
      z: ((i & 4) ? s : -s),
      w: ((i & 8) ? s : -s),
    });
  }

  const edges: { from: number; to: number }[] = [];
  const targetDist = Math.sqrt(2) * scale;
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i].x - vertices[j].x;
      const dy = vertices[i].y - vertices[j].y;
      const dz = vertices[i].z - vertices[j].z;
      const dw = vertices[i].w - vertices[j].w;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
      if (Math.abs(dist - targetDist) < 0.01) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return { vertices, edges, name: '24-Cell' };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CodeForming({ fullPage = false }: CodeFormingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [shapeType, setShapeType] = useState<ShapeType>('tesseract');

  const shape = useMemo(() => {
    switch (shapeType) {
      case 'tesseract': return generateTesseract();
      case '16-cell': return generate16Cell();
      case '24-cell': return generate24Cell();
      default: return generateTesseract();
    }
  }, [shapeType]);

  const SCALE = 2;
  const BASE_W = fullPage ? 1000 : 700;
  const BASE_H = fullPage ? 750 : 500;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;
  const VIEW_HEIGHT = fullPage ? H * 0.78 : H * 0.85;
  const RENDER_SCALE = fullPage ? 280 * SCALE : 320 * SCALE;

  const physics = useRef<PhysicsState>({
    angleXY: 0, angleXZ: 0, angleYZ: 0,
    angleXW: 0, angleYW: 0, angleZW: 0,
    omegaXY: 0, omegaXZ: 0, omegaYZ: 0,
    omegaXW: 0.008, omegaYW: 0.005, omegaZW: 0.003,
    observerDim: 4.0,
    isDragging: false,
    lastMouseX: 0, lastMouseY: 0, lastMoveTime: 0,
    activeControl: null,
  });

  // Reset on shape change
  useEffect(() => {
    const state = physics.current;
    state.angleXY = 0; state.angleXZ = 0; state.angleYZ = 0;
    state.angleXW = 0; state.angleYW = 0; state.angleZW = 0;
    state.omegaXW = 0.008; state.omegaYW = 0.005; state.omegaZW = 0.003;
  }, [shape]);

  // ---------------------------------------------------------------------------
  // 4D Rotation
  // ---------------------------------------------------------------------------

  const rotate4D = useCallback((v: Vec4, angle: number, plane: string): Vec4 => {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const result = { ...v };

    switch (plane) {
      case 'xy':
        result.x = v.x * c - v.y * s;
        result.y = v.x * s + v.y * c;
        break;
      case 'xz':
        result.x = v.x * c - v.z * s;
        result.z = v.x * s + v.z * c;
        break;
      case 'xw':
        result.x = v.x * c - v.w * s;
        result.w = v.x * s + v.w * c;
        break;
      case 'yz':
        result.y = v.y * c - v.z * s;
        result.z = v.y * s + v.z * c;
        break;
      case 'yw':
        result.y = v.y * c - v.w * s;
        result.w = v.y * s + v.w * c;
        break;
      case 'zw':
        result.z = v.z * c - v.w * s;
        result.w = v.z * s + v.w * c;
        break;
    }
    return result;
  }, []);

  // ---------------------------------------------------------------------------
  // Get base from W coordinate
  // ---------------------------------------------------------------------------

  const getBaseFromW = useCallback((w: number): Base => {
    // W ranges from -1.5 to 1.5 roughly, map to 4 bases
    const norm = (w + 1.5) / 3;  // 0 to 1
    const idx = Math.floor(norm * 4);
    return BASES[Math.max(0, Math.min(3, idx))];
  }, []);

  // ---------------------------------------------------------------------------
  // Animation Loop
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const state = physics.current;

      // Collapse factor: 4.0→2.0 maps to 0→1
      const collapseFactor = Math.max(0, Math.min(1, (4.0 - state.observerDim) / 2.0));
      const snapStrength = Math.pow(collapseFactor, 2);

      // -----------------------------------------------------------------------
      // PHYSICS UPDATE
      // -----------------------------------------------------------------------

      if (!state.isDragging || state.activeControl === 'dim') {
        // Damping
        state.omegaXZ *= (1 - DAMPING);
        state.omegaYZ *= (1 - DAMPING);
        state.omegaXW *= (1 - DAMPING);
        state.omegaYW *= (1 - DAMPING);
        state.omegaZW *= (1 - DAMPING);

        // Integrate angles
        state.angleXZ += state.omegaXZ;
        state.angleYZ += state.omegaYZ;
        state.angleXW += state.omegaXW;
        state.angleYW += state.omegaYW;
        state.angleZW += state.omegaZW;
      }

      // -----------------------------------------------------------------------
      // RENDERING
      // -----------------------------------------------------------------------

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      const centerX = W / 2;
      const centerY = VIEW_HEIGHT / 2;

      // -----------------------------------------------------------------------
      // Transform vertices
      // -----------------------------------------------------------------------

      const projected: { x: number; y: number; z: number; w: number; base: Base }[] = [];

      for (const v of shape.vertices) {
        let p = { ...v };

        // 4D rotations
        p = rotate4D(p, state.angleXW, 'xw');
        p = rotate4D(p, state.angleYW, 'yw');
        p = rotate4D(p, state.angleZW, 'zw');
        p = rotate4D(p, state.angleXZ, 'xz');
        p = rotate4D(p, state.angleYZ, 'yz');

        // Determine base from W (before projection loses it)
        const base = getBaseFromW(p.w);

        // 4D → 3D stereographic projection
        const distance = 2.5;
        const scale4D = 1 / (distance - p.w * 0.5);
        const x3 = p.x * scale4D;
        const y3 = p.y * scale4D;
        const z3 = p.z * scale4D;

        // 3D → 2D perspective
        const fov = 3;
        const scale3D = fov / (fov + z3 + 1.5);

        let sx = x3 * scale3D * RENDER_SCALE + centerX;
        let sy = y3 * scale3D * RENDER_SCALE + centerY;

        // At higher collapse, snap to grid
        if (snapStrength > 0.1) {
          const gridSize = 40 * SCALE;
          const gx = Math.round(sx / gridSize) * gridSize;
          const gy = Math.round(sy / gridSize) * gridSize;

          // At extreme collapse, pull toward center
          const extremeSnap = Math.max(0, (snapStrength - 0.8) / 0.2);
          const targetX = gx * (1 - extremeSnap) + centerX * extremeSnap;
          const targetY = gy * (1 - extremeSnap) + centerY * extremeSnap;

          sx = sx * (1 - snapStrength) + targetX * snapStrength;
          sy = sy * (1 - snapStrength) + targetY * snapStrength;
        }

        projected.push({ x: sx, y: sy, z: z3, w: p.w, base });
      }

      // -----------------------------------------------------------------------
      // Draw edges (fade out with collapse)
      // -----------------------------------------------------------------------

      if (collapseFactor < 0.8) {
        ctx.lineCap = 'round';
        for (const edge of shape.edges) {
          const p1 = projected[edge.from];
          const p2 = projected[edge.to];

          const avgW = (p1.w + p2.w) / 2;
          const alpha = (0.3 + (avgW + 1) * 0.35) * (1 - collapseFactor);

          // Color based on average W
          const avgBase = getBaseFromW(avgW);
          const color = BASE_COLORS[avgBase];

          ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 2 * SCALE;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // -----------------------------------------------------------------------
      // Draw vertices / letters
      // -----------------------------------------------------------------------

      // Sort by depth
      const sorted = [...projected].sort((a, b) => a.z - b.z);

      sorted.forEach((p) => {
        const color = BASE_COLORS[p.base];
        const alpha = 0.4 + (p.w + 1) * 0.3;

        if (collapseFactor > 0.5) {
          // Draw as letters
          const fontSize = 16 + collapseFactor * 24;
          ctx.font = `bold ${fontSize * SCALE}px monospace`;
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.min(1, alpha + collapseFactor * 0.5);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Glow
          if (collapseFactor > 0.7) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10 * SCALE * collapseFactor;
          }

          ctx.fillText(p.base, p.x, p.y);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        } else {
          // Draw as points
          const size = (4 + (p.w + 1) * 2) * SCALE;

          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 8 * SCALE;
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // -----------------------------------------------------------------------
      // At extreme collapse, show single dominant letter
      // -----------------------------------------------------------------------

      if (collapseFactor > 0.9) {
        // Average W to get dominant base
        const avgW = shape.vertices.reduce((sum, v) => {
          let p = { ...v };
          p = rotate4D(p, state.angleXW, 'xw');
          return sum + p.w;
        }, 0) / shape.vertices.length;

        const dominantBase = getBaseFromW(avgW + 0.5);  // Slight bias
        const color = BASE_COLORS[dominantBase];

        ctx.save();
        ctx.font = `bold ${180 * SCALE}px monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = (collapseFactor - 0.9) * 10;  // Fade in
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 40 * SCALE;
        ctx.fillText(dominantBase, centerX, centerY);
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // Header
      // -----------------------------------------------------------------------

      const modeLabel = collapseFactor < 0.3 ? '4D HYPERCUBE' :
                        collapseFactor < 0.6 ? 'PROJECTING' :
                        collapseFactor < 0.9 ? 'ENCODING' : 'CODIFIED';

      ctx.fillStyle = collapseFactor > 0.6 ? '#22c55e' : '#3b82f6';
      ctx.font = `bold ${14 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('CODE FORMING', 20 * SCALE, 24 * SCALE);

      ctx.fillStyle = '#666';
      ctx.font = `${11 * SCALE}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${state.observerDim.toFixed(2)}D → ${modeLabel}`, W - 20 * SCALE, 24 * SCALE);

      // Shape name
      ctx.fillStyle = '#444';
      ctx.font = `${10 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(shape.name.toUpperCase(), 20 * SCALE, 44 * SCALE);

      // -----------------------------------------------------------------------
      // Divider
      // -----------------------------------------------------------------------

      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, VIEW_HEIGHT);
      ctx.lineTo(W, VIEW_HEIGHT);
      ctx.stroke();

      // -----------------------------------------------------------------------
      // Control Panel
      // -----------------------------------------------------------------------

      const panelY = VIEW_HEIGHT + 16 * SCALE;
      const padding = 20 * SCALE;

      // Shape buttons (only fullPage)
      if (fullPage) {
        ctx.fillStyle = '#555';
        ctx.font = `${9 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('SHAPE', padding, panelY);

        const shapes: ShapeType[] = ['tesseract', '16-cell', '24-cell'];
        const shapeLabels = ['Tesseract', '16-Cell', '24-Cell'];
        const btnWidth = 90 * SCALE;

        shapes.forEach((s, i) => {
          const bx = padding + i * btnWidth;
          const by = panelY + 8 * SCALE;
          const isActive = shapeType === s;

          ctx.fillStyle = isActive ? '#22c55e' : '#1a1a1a';
          ctx.beginPath();
          ctx.roundRect(bx, by, btnWidth - 8 * SCALE, 22 * SCALE, 4 * SCALE);
          ctx.fill();

          if (!isActive) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.fillStyle = isActive ? '#000' : '#777';
          ctx.font = `${9 * SCALE}px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText(shapeLabels[i], bx + (btnWidth - 8 * SCALE) / 2, by + 14 * SCALE);
        });
      }

      // Dimensionality slider
      const dimY = fullPage ? panelY + 42 * SCALE : panelY;
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('OBSERVATION DIMENSIONALITY', padding, dimY);

      const statusText = collapseFactor > 0.9 ? '>> CODIFIED <<' :
                         collapseFactor > 0.5 ? '>> ENCODING <<' : '>> HYPERCUBE <<';
      ctx.fillStyle = collapseFactor > 0.6 ? '#22c55e' : '#3b82f6';
      ctx.textAlign = 'right';
      ctx.font = `bold ${9 * SCALE}px monospace`;
      ctx.fillText(statusText, W - padding, dimY);

      const dimSliderX = padding;
      const dimSliderW = W - padding * 2;
      const dimSliderY = dimY + 14 * SCALE;
      const dimSliderH = 12 * SCALE;

      // Track
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimSliderW, dimSliderH, 6 * SCALE);
      ctx.fill();

      // Gradient
      const gradient = ctx.createLinearGradient(dimSliderX, 0, dimSliderX + dimSliderW, 0);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.5, '#eab308');
      gradient.addColorStop(1, '#3b82f6');

      const dimNorm = (state.observerDim - 2.0) / 2.0;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimNorm * dimSliderW, dimSliderH, 6 * SCALE);
      ctx.fill();

      // Handle
      const dimHandleX = dimSliderX + dimNorm * dimSliderW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(dimHandleX, dimSliderY + dimSliderH / 2, 10 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = collapseFactor > 0.6 ? '#22c55e' : '#3b82f6';
      ctx.lineWidth = 3 * SCALE;
      ctx.stroke();

      // Labels
      ctx.font = `${8 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('2D CODE', dimSliderX, dimSliderY + dimSliderH + 14 * SCALE);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#eab308';
      ctx.fillText('3D SHADOW', dimSliderX + dimSliderW / 2, dimSliderY + dimSliderH + 14 * SCALE);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('4D HYPERCUBE', dimSliderX + dimSliderW, dimSliderY + dimSliderH + 14 * SCALE);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, getBaseFromW, shape, shapeType, W, H, VIEW_HEIGHT, RENDER_SCALE, fullPage]);

  // ---------------------------------------------------------------------------
  // Input Handling
  // ---------------------------------------------------------------------------

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const state = physics.current;
    const panelY = VIEW_HEIGHT + 16 * SCALE;
    const padding = 20 * SCALE;

    // Shape buttons (fullPage only)
    if (fullPage) {
      const btnY = panelY + 8 * SCALE;
      const btnWidth = 90 * SCALE;
      if (y >= btnY && y <= btnY + 22 * SCALE) {
        const shapes: ShapeType[] = ['tesseract', '16-cell', '24-cell'];
        for (let i = 0; i < shapes.length; i++) {
          const bx = padding + i * btnWidth;
          if (x >= bx && x <= bx + btnWidth - 8 * SCALE) {
            setShapeType(shapes[i]);
            return;
          }
        }
      }
    }

    // Dimensionality slider
    const dimY = fullPage ? panelY + 42 * SCALE + 14 * SCALE : panelY + 14 * SCALE;
    const dimSliderW = W - padding * 2;
    if (y >= dimY - 15 * SCALE && y <= dimY + 30 * SCALE) {
      state.isDragging = true;
      state.activeControl = 'dim';
      const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
      state.observerDim = 2.0 + norm * 2.0;
      return;
    }

    // Viz drag
    if (y < VIEW_HEIGHT) {
      state.isDragging = true;
      state.activeControl = 'viz';
      state.lastMouseX = x;
      state.lastMouseY = y;
      state.lastMoveTime = Date.now();
    }
  }, [getCanvasCoords, W, VIEW_HEIGHT, fullPage]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const state = physics.current;
    if (!state.isDragging) return;
    e.preventDefault();

    const { x, y } = getCanvasCoords(e);
    const padding = 20 * SCALE;

    if (state.activeControl === 'dim') {
      const dimSliderW = W - padding * 2;
      const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
      state.observerDim = 2.0 + norm * 2.0;
    } else if (state.activeControl === 'viz') {
      const dx = x - state.lastMouseX;
      const dy = y - state.lastMouseY;

      state.angleXZ += dx * DRAG_SENSITIVITY;
      state.angleYZ += dy * DRAG_SENSITIVITY;
      state.omegaXZ = dx * DRAG_SENSITIVITY * 0.5;
      state.omegaYZ = dy * DRAG_SENSITIVITY * 0.5;

      state.lastMouseX = x;
      state.lastMouseY = y;
      state.lastMoveTime = Date.now();
    }
  }, [getCanvasCoords, W]);

  const handleEnd = useCallback(() => {
    physics.current.isDragging = false;
    physics.current.activeControl = null;
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
