'use client';

/**
 * =============================================================================
 * CodeForming - Dimensional Collapse Creates Discrete Symbols
 * =============================================================================
 *
 * Shows how reducing observer dimensionality creates attractor basins.
 * LEFT: Full 3D/4D view of the shape
 * RIGHT: Flattened view showing dimensional collapse → discrete symbols
 *
 * Two sliders:
 * 1. BASINS: How many discrete states (1→4→coherent)
 * 2. DEPTH: How deep the attractor wells are
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

type ShapeType = 'tesseract' | '16-cell' | '3d-cube' | '3d-wrench';

interface Shape {
  vertices: Vec4[];
  edges: { from: number; to: number }[];
  name: string;
  is4D: boolean;
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
  Lx: number;
  Ly: number;
  Lz: number;
  isDragging: boolean;
  activePanel: 'left' | 'right' | null;
  draggingSlider: 'flatten' | 'depth' | null;
  lastMouseX: number;
  lastMouseY: number;
}

interface CodeFormingProps {
  fullPage?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

type Base = 'A' | 'C' | 'G' | 'T';

const BASE_COLORS: Record<Base, string> = {
  A: '#22c55e',
  C: '#3b82f6',
  G: '#f59e0b',
  T: '#ef4444',
};

const DAMPING = 0.003;
const DRAG_SENSITIVITY = 0.006;
const EULER_COUPLING = 0.15;  // Match TesseractSimple for proper Dzhanibekov

// Canvas dimensions (no SCALE multiplier - native resolution)
const W = 1200;
const H = 700;
const RENDER_SCALE = 280;

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
      const diff =
        (v1.x !== v2.x ? 1 : 0) +
        (v1.y !== v2.y ? 1 : 0) +
        (v1.z !== v2.z ? 1 : 0) +
        (v1.w !== v2.w ? 1 : 0);
      if (diff === 1) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return { vertices, edges, name: 'Tesseract', is4D: true };
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

  return { vertices, edges, name: '16-Cell', is4D: true };
}

function generate3DCube(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];

  for (let i = 0; i < 8; i++) {
    vertices.push({
      x: (i & 1) ? 1 : -1,
      y: (i & 2) ? 1 : -1,
      z: (i & 4) ? 1 : -1,
      w: 0,
    });
  }

  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      const diff = i ^ j;
      if (diff === 1 || diff === 2 || diff === 4) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return { vertices, edges, name: '3D Cube', is4D: false };
}

function generate3DWrench(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];

  const handleLength = 2.0;
  const handleRadius = 0.15;
  const segments = 8;
  const headLength = 1.2;
  const headRadius = 0.2;

  // Handle rings
  for (let ring = 0; ring <= 4; ring++) {
    const y = -handleLength / 2 + (ring / 4) * handleLength;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push({
        x: Math.cos(angle) * handleRadius,
        y: y,
        z: Math.sin(angle) * handleRadius,
        w: 0,
      });
    }
  }

  // Connect handle
  for (let ring = 0; ring < 4; ring++) {
    for (let i = 0; i < segments; i++) {
      const curr = ring * segments + i;
      const next = ring * segments + ((i + 1) % segments);
      const above = (ring + 1) * segments + i;
      edges.push({ from: curr, to: next });
      edges.push({ from: curr, to: above });
    }
  }
  for (let i = 0; i < segments; i++) {
    edges.push({ from: 4 * segments + i, to: 4 * segments + ((i + 1) % segments) });
  }

  // Head
  const headY = handleLength / 2;
  const headStart = vertices.length;

  for (let ring = 0; ring <= 3; ring++) {
    const x = -headLength / 2 + (ring / 3) * headLength;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push({
        x: x,
        y: headY + Math.cos(angle) * headRadius,
        z: Math.sin(angle) * headRadius,
        w: 0,
      });
    }
  }

  for (let ring = 0; ring < 3; ring++) {
    for (let i = 0; i < segments; i++) {
      const curr = headStart + ring * segments + i;
      const next = headStart + ring * segments + ((i + 1) % segments);
      const above = headStart + (ring + 1) * segments + i;
      edges.push({ from: curr, to: next });
      edges.push({ from: curr, to: above });
    }
  }
  for (let i = 0; i < segments; i++) {
    edges.push({
      from: headStart + 3 * segments + i,
      to: headStart + 3 * segments + ((i + 1) % segments),
    });
  }

  return { vertices, edges, name: '3D Wrench', is4D: false };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CodeForming({ fullPage = false }: CodeFormingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [shapeType, setShapeType] = useState<ShapeType>('3d-wrench');

  // Use refs for slider values to avoid re-renders that freeze animation
  const flattenRef = useRef(0);  // Start at 0 = full 3D (slider on right)
  const depthRef = useRef(0.5);

  const symbolState = useRef({
    currentBase: 'A' as Base,
    baseStrength: 0,
  });

  const shape = useMemo(() => {
    switch (shapeType) {
      case 'tesseract':
        return generateTesseract();
      case '16-cell':
        return generate16Cell();
      case '3d-cube':
        return generate3DCube();
      case '3d-wrench':
        return generate3DWrench();
      default:
        return generateTesseract();
    }
  }, [shapeType]);

  // Compute shape asymmetry
  const shapeAsymmetry = useMemo(() => {
    const verts = shape.vertices;
    const maxW = Math.max(...verts.map((v) => Math.abs(v.w)));
    const is3D = maxW < 0.01;

    let Ix = 0,
      Iy = 0,
      Iz = 0,
      Iw = 0;
    for (const v of verts) {
      Ix += v.y * v.y + v.z * v.z + v.w * v.w;
      Iy += v.x * v.x + v.z * v.z + v.w * v.w;
      Iz += v.x * v.x + v.y * v.y + v.w * v.w;
      Iw += v.x * v.x + v.y * v.y + v.z * v.z;
    }

    const moments = is3D ? [Ix, Iy, Iz].sort((a, b) => a - b) : [Ix, Iy, Iz, Iw].sort((a, b) => a - b);
    const total = moments.reduce((s, m) => s + m, 0);
    if (total === 0) return 0;

    const mean = total / moments.length;
    const variance = moments.reduce((s, m) => s + (m - mean) ** 2, 0) / moments.length;
    return Math.min(1, (Math.sqrt(variance) / mean) * 2);
  }, [shape]);

  // Inertia for Dzhanibekov
  const inertia = useMemo(() => {
    if (shape.is4D) return { I1: 1, I2: 1, I3: 1 };
    if (shapeType === '3d-wrench') return { I1: 0.3, I2: 1.0, I3: 1.8 };
    return { I1: 1, I2: 1, I3: 1 };
  }, [shape, shapeType]);

  const physics = useRef<PhysicsState>({
    angleXY: 0,
    angleXZ: 0,
    angleYZ: 0,
    angleXW: 0,
    angleYW: 0,
    angleZW: 0,
    omegaXY: 0,
    omegaXZ: 0,
    omegaYZ: 0,
    omegaXW: 0.008,
    omegaYW: 0.005,
    omegaZW: 0.003,
    Lx: 0.001,
    Ly: 0.08,  // Mostly around intermediate axis for Dzhanibekov
    Lz: 0.002,
    isDragging: false,
    activePanel: null,
    draggingSlider: null,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // Reset on shape change
  useEffect(() => {
    const state = physics.current;
    state.angleXY = 0;
    state.angleXZ = 0;
    state.angleYZ = 0;
    state.angleXW = 0;
    state.angleYW = 0;
    state.angleZW = 0;

    if (shape.is4D) {
      state.omegaXW = 0.008;
      state.omegaYW = 0.005;
      state.Lx = 0;
      state.Ly = 0;
      state.Lz = 0;
    } else {
      // Match TesseractSimple initial conditions for proper Dzhanibekov
      state.omegaXW = 0;
      state.omegaYW = 0;
      state.Lx = 0.001;
      state.Ly = 0.08;  // Mostly around intermediate axis (unstable!)
      state.Lz = 0.002;
    }
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
      const { I1, I2, I3 } = inertia;

      // -----------------------------------------------------------------------
      // PHYSICS UPDATE
      // -----------------------------------------------------------------------

      if (!state.isDragging) {
        if (shape.is4D) {
          // 4D: Simple damped rotation
          state.omegaXZ *= 1 - DAMPING;
          state.omegaYZ *= 1 - DAMPING;
          state.omegaXW *= 1 - DAMPING;
          state.omegaYW *= 1 - DAMPING;

          state.angleXZ += state.omegaXZ;
          state.angleYZ += state.omegaYZ;
          state.angleXW += state.omegaXW;
          state.angleYW += state.omegaYW;
        } else {
          // 3D: Euler's equations for Dzhanibekov
          let omegaX = state.Lx / I1;
          let omegaY = state.Ly / I2;
          let omegaZ = state.Lz / I3;

          const dOmegaX = (EULER_COUPLING * (I2 - I3) * omegaY * omegaZ) / I1;
          const dOmegaY = (EULER_COUPLING * (I3 - I1) * omegaZ * omegaX) / I2;
          const dOmegaZ = (EULER_COUPLING * (I1 - I2) * omegaX * omegaY) / I3;

          state.Lx = (state.Lx + dOmegaX * I1) * (1 - DAMPING * 0.5);
          state.Ly = (state.Ly + dOmegaY * I2) * (1 - DAMPING * 0.5);
          state.Lz = (state.Lz + dOmegaZ * I3) * (1 - DAMPING * 0.5);

          omegaX = state.Lx / I1;
          omegaY = state.Ly / I2;
          omegaZ = state.Lz / I3;

          state.omegaYZ = omegaX;
          state.omegaXZ = omegaY;
          state.omegaXY = omegaZ;

          state.angleYZ += state.omegaYZ;
          state.angleXZ += state.omegaXZ;
          state.angleXY += state.omegaXY;
        }
      }

      // -----------------------------------------------------------------------
      // BASIN DYNAMICS
      // -----------------------------------------------------------------------

      // Read from refs (no re-render on change!)
      const flattenAmount = flattenRef.current;
      const basinDepth = depthRef.current;

      // effectiveDepth combines slider depth with shape asymmetry
      const effectiveDepth = basinDepth * (0.3 + shapeAsymmetry * 0.7);
      // isCoherent: fully unflattened (flattenAmount = 0)
      const isCoherent = flattenAmount < 0.05;

      // Apply basin damping based on flattenAmount and depth
      // More flattened + deeper basins = more damping = stickier attractors
      if (!isCoherent && effectiveDepth > 0.05) {
        const depthFactor = effectiveDepth * effectiveDepth;
        // flattenAmount directly controls how much damping is applied
        const basinDamping = depthFactor * flattenAmount * 0.03;
        const dampMult = 1 - basinDamping;

        if (shape.is4D) {
          state.omegaXZ *= dampMult;
          state.omegaYZ *= dampMult;
          state.omegaXW *= dampMult;
          state.omegaYW *= dampMult;
        } else {
          state.Lx *= dampMult;
          state.Ly *= dampMult;
          state.Lz *= dampMult;
        }
      }

      // -----------------------------------------------------------------------
      // RENDERING
      // -----------------------------------------------------------------------

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      const panelW = fullPage ? W / 2 - 10 : W;
      const leftCenterX = fullPage ? panelW / 2 : W / 2;
      const rightCenterX = fullPage ? panelW + 20 + panelW / 2 : 0;
      const centerY = H / 2 - 30;

      // Divider
      if (fullPage) {
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(panelW + 10, 20);
        ctx.lineTo(panelW + 10, H - 100);
        ctx.stroke();
      }

      // -----------------------------------------------------------------------
      // Transform vertices
      // -----------------------------------------------------------------------

      const transformedVerts: Vec4[] = [];
      for (const v of shape.vertices) {
        let p = { ...v };

        if (shape.is4D) {
          p = rotate4D(p, state.angleXW, 'xw');
          p = rotate4D(p, state.angleYW, 'yw');
          p = rotate4D(p, state.angleXZ, 'xz');
          p = rotate4D(p, state.angleYZ, 'yz');
        } else {
          p = rotate4D(p, state.angleXY, 'xy');
          p = rotate4D(p, state.angleXZ, 'xz');
          p = rotate4D(p, state.angleYZ, 'yz');
        }

        transformedVerts.push(p);
      }

      // -----------------------------------------------------------------------
      // Project to 2D (full view)
      // -----------------------------------------------------------------------

      const projectFull = (v: Vec4, cx: number): { x: number; y: number; z: number; w: number } => {
        let x3, y3, z3;
        if (shape.is4D) {
          const dist = 2.5;
          const scale4D = 1 / (dist - v.w * 0.5);
          x3 = v.x * scale4D;
          y3 = v.y * scale4D;
          z3 = v.z * scale4D;
        } else {
          x3 = v.x;
          y3 = v.y;
          z3 = v.z;
        }

        const fov = 3;
        const scale3D = fov / (fov + z3 + 1.5);
        return {
          x: cx + x3 * scale3D * RENDER_SCALE,
          y: centerY - y3 * scale3D * RENDER_SCALE,
          z: z3,
          w: v.w,
        };
      };

      // -----------------------------------------------------------------------
      // Project to 2D (flattened view - collapse Z dimension)
      // -----------------------------------------------------------------------

      // flattenAmount is now a continuous slider (0 = 3D/4D, 1 = flat 2D)
      // Use it directly for the Z-collapse

      const projectFlat = (v: Vec4, cx: number): { x: number; y: number; z: number; w: number } => {
        let x3, y3, z3;

        // Collapse Z dimension based on flattenAmount
        // At 1 basin (flattenAmount=1): Z is nearly 0, view is 2D
        // At 4 basins (flattenAmount=0.25): Z is mostly preserved
        // At coherent (flattenAmount=0): Full 3D
        const zScale = 1 - flattenAmount * 0.95;

        if (shape.is4D) {
          // For 4D shapes, also collapse W
          const wScale = 1 - flattenAmount * 0.8;
          const dist = 2.5;
          const effectiveW = v.w * wScale;
          const scale4D = 1 / (dist - effectiveW * 0.5);
          x3 = v.x * scale4D;
          y3 = v.y * scale4D;
          z3 = v.z * scale4D * zScale;
        } else {
          x3 = v.x;
          y3 = v.y;
          z3 = v.z * zScale;
        }

        const fov = 3;
        const scale3D = fov / (fov + z3 + 1.5);
        return {
          x: cx + x3 * scale3D * RENDER_SCALE,
          y: centerY - y3 * scale3D * RENDER_SCALE,
          z: z3,
          w: v.w,
        };
      };

      // -----------------------------------------------------------------------
      // Draw edges helper
      // -----------------------------------------------------------------------

      const drawShape = (
        projected: { x: number; y: number; z: number; w: number }[],
        alpha: number
      ) => {
        // Sort edges by depth
        const sortedEdges = [...shape.edges].sort((a, b) => {
          const aD = (projected[a.from].z + projected[a.to].z) / 2;
          const bD = (projected[b.from].z + projected[b.to].z) / 2;
          return bD - aD;
        });

        ctx.lineCap = 'round';

        for (const edge of sortedEdges) {
          const p1 = projected[edge.from];
          const p2 = projected[edge.to];

          const avgW = (p1.w + p2.w) / 2;
          const avgZ = (p1.z + p2.z) / 2;
          const edgeAlpha = shape.is4D ? 0.3 + (avgW + 1) * 0.35 : 0.4 + (1 - avgZ) * 0.3;

          const hue = shape.is4D ? 30 + avgW * 30 : 200;

          // Glow
          ctx.save();
          ctx.shadowColor = `hsla(${hue}, 80%, 60%, ${alpha * 0.5})`;
          ctx.shadowBlur = 8;
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${edgeAlpha * alpha * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();

          // Main line
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${edgeAlpha * alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Vertices
        for (const p of projected) {
          const size = shape.is4D ? 3 + (p.w + 1) * 1.5 : 2 + (1 - p.z) * 1.5;
          const hue = shape.is4D ? (p.w > 0 ? 180 : 300) : 200;

          ctx.save();
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${alpha * 0.8})`;
          ctx.shadowBlur = 6;
          ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };

      // -----------------------------------------------------------------------
      // LEFT PANEL: Full 3D/4D view
      // -----------------------------------------------------------------------

      const leftProj = transformedVerts.map((v) => projectFull(v, leftCenterX));
      drawShape(leftProj, 1);

      // Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(shape.is4D ? '4D VIEW' : '3D VIEW', leftCenterX, 24);

      // -----------------------------------------------------------------------
      // RIGHT PANEL: Flattened view + Symbol
      // -----------------------------------------------------------------------

      if (fullPage) {
        const rightProj = transformedVerts.map((v) => projectFlat(v, rightCenterX));

        // Shape stays fully visible - flattening IS the visual effect
        // The Z-collapse in projectFlat makes it pancake-like
        drawShape(rightProj, 1.0);

        // Compute shape's angular momentum direction from physics state
        // This is what the "symbol" actually represents - which rotational basin
        const { Lx, Ly, Lz } = state;
        const Lmag = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz);

        // Which axis dominates? This determines the "basin"
        // For wrench: I1 < I2 < I3, stable around I1 and I3, unstable around I2
        let dominantAxis = 'Y'; // intermediate (unstable)
        if (Lmag > 0.001) {
          const normLx = Math.abs(Lx) / Lmag;
          const normLy = Math.abs(Ly) / Lmag;
          const normLz = Math.abs(Lz) / Lmag;

          // Find which axis has most angular momentum
          if (normLx > normLy && normLx > normLz) {
            dominantAxis = 'X';  // stable (smallest I)
          } else if (normLz > normLy && normLz > normLx) {
            dominantAxis = 'Z';  // stable (largest I)
          } else {
            dominantAxis = 'Y';  // intermediate (flipping - Dzhanibekov!)
          }
        }

        // Update symbol state based on actual physics
        const sym = symbolState.current;
        const axisToBase: Record<string, Base> = { X: 'A', Y: 'C', Z: 'G' };
        const instantBase = axisToBase[dominantAxis] || 'T';

        if (instantBase === sym.currentBase) {
          sym.baseStrength = Math.min(100, sym.baseStrength + 1 + effectiveDepth * 2);
        } else {
          sym.baseStrength -= 2 + (1 - effectiveDepth) * 3;
          if (sym.baseStrength <= 0) {
            sym.currentBase = instantBase;
            sym.baseStrength = 10;
          }
        }

        // Only show symbol indicator when significantly flattened
        // Keep it subtle - just a small label, the shape IS the visualization
        if (flattenAmount > 0.6) {
          const cx = rightProj.reduce((s, p) => s + p.x, 0) / rightProj.length;
          const cy = rightProj.reduce((s, p) => s + p.y, 0) / rightProj.length;

          const symbolAlpha = (flattenAmount - 0.6) / 0.4;  // 0 at 0.6, 1 at 1.0
          const color = BASE_COLORS[sym.currentBase];
          const stability = sym.baseStrength / 100;

          // Small, tasteful symbol at bottom of shape
          const fontSize = 16 + flattenAmount * 12 + stability * 8;  // 16-36px max

          ctx.save();
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.fillStyle = color;
          ctx.globalAlpha = symbolAlpha * (0.5 + stability * 0.5);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sym.currentBase, cx, cy + 80);  // Below the shape
          ctx.restore();

          // Stability indicator bar
          if (flattenAmount > 0.8) {
            const barWidth = 60;
            const barHeight = 4;
            const barX = cx - barWidth / 2;
            const barY = cy + 100;

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = color;
            ctx.globalAlpha = symbolAlpha * 0.8;
            ctx.fillRect(barX, barY, barWidth * stability, barHeight);
          }
        }

        // Panel label - show continuous dimensionality
        const dim = shape.is4D ? 4 - flattenAmount * 2 : 3 - flattenAmount;
        const dimLabel = dim.toFixed(1) + 'D';
        ctx.fillStyle = isCoherent ? '#3b82f6' : '#22c55e';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${dimLabel} VIEW`, rightCenterX, 24);
      }

      // -----------------------------------------------------------------------
      // Controls (bottom area)
      // -----------------------------------------------------------------------

      const ctrlY = H - 85;

      // Shape buttons
      ctx.fillStyle = '#555';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('SHAPE', 20, ctrlY);

      const shapes: ShapeType[] = ['tesseract', '16-cell', '3d-cube', '3d-wrench'];
      const shapeLabels = ['Tesseract', '16-Cell', '3D Cube', '3D Wrench'];
      const btnW = 70;

      shapes.forEach((s, i) => {
        const bx = 20 + i * btnW;
        const by = ctrlY + 6;
        const isActive = shapeType === s;

        ctx.fillStyle = isActive ? '#22c55e' : '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(bx, by, btnW - 6, 20, 3);
        ctx.fill();

        if (!isActive) {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = isActive ? '#000' : '#777';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(shapeLabels[i], bx + (btnW - 6) / 2, by + 13);
      });

      // Flatten slider (continuous 0 to 1)
      // Left = flat (2D), Right = full 3D/4D
      // Display is INVERTED: slider position = (1 - flattenAmount)
      const sliderX = 320;
      const sliderW = 350;
      const sliderY = ctrlY + 10;
      const displayPos = 1 - flattenAmount;  // Invert for display

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('DIMENSIONALITY', sliderX, ctrlY);

      // Track
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(sliderX, sliderY, sliderW, 10, 5);
      ctx.fill();

      // Gradient fill: left = green (2D/flat), right = blue (3D/4D)
      const grad = ctx.createLinearGradient(sliderX, 0, sliderX + sliderW, 0);
      grad.addColorStop(0, '#22c55e');  // 2D (flat) - left
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#3b82f6');  // 3D/4D (coherent) - right

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(sliderX, sliderY, displayPos * sliderW, 10, 5);
      ctx.fill();

      // Handle
      const handleX = sliderX + displayPos * sliderW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(handleX, sliderY + 5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = flattenAmount > 0.9 ? '#22c55e' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels: left = 2D, right = 3D/4D
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('2D', sliderX, sliderY + 24);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(shape.is4D ? '4D' : '3D', sliderX + sliderW, sliderY + 24);

      // Depth slider
      const depthX = sliderX + sliderW + 40;
      const depthW = W - depthX - 20;
      const depthY = ctrlY + 10;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('DEPTH', depthX, ctrlY);

      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(depthX, depthY, depthW, 10, 5);
      ctx.fill();

      const depthGrad = ctx.createLinearGradient(depthX, 0, depthX + depthW, 0);
      depthGrad.addColorStop(0, '#64748b');
      depthGrad.addColorStop(1, '#f472b6');
      ctx.fillStyle = depthGrad;
      ctx.beginPath();
      ctx.roundRect(depthX, depthY, basinDepth * depthW, 10, 5);
      ctx.fill();

      const depthHandleX = depthX + basinDepth * depthW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(depthHandleX, depthY + 5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = basinDepth > 0.5 ? '#f472b6' : '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.fillText('FLAT', depthX, depthY + 24);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#f472b6';
      ctx.fillText('DEEP', depthX + depthW, depthY + 24);

      // Header
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('CODE FORMING', 20, H - 12);

      ctx.fillStyle = '#555';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      const stateLabel = isCoherent ? 'COHERENT' : `${Math.round((1 - flattenAmount) * 100)}% coherent`;
      ctx.fillText(`${shape.name} • ${stateLabel}`, W - 20, H - 12);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, shape, shapeType, shapeAsymmetry, inertia, fullPage]);

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

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const state = physics.current;

      const ctrlY = H - 85;

      // Shape buttons
      const btnW = 70;
      const shapes: ShapeType[] = ['tesseract', '16-cell', '3d-cube', '3d-wrench'];
      if (y >= ctrlY + 6 && y <= ctrlY + 26) {
        for (let i = 0; i < shapes.length; i++) {
          const bx = 20 + i * btnW;
          if (x >= bx && x <= bx + btnW - 6) {
            setShapeType(shapes[i]);
            return;
          }
        }
      }

      // Dimensionality slider - write to ref, no re-render!
      // Left = 2D (flat), Right = 3D/4D
      // So we INVERT: position 0 (left) = flattenAmount 1, position 1 (right) = flattenAmount 0
      const sliderX = 320;
      const sliderW = 350;
      const sliderY = ctrlY + 10;
      if (y >= sliderY - 10 && y <= sliderY + 30 && x >= sliderX - 10 && x <= sliderX + sliderW + 10) {
        const norm = Math.max(0, Math.min(1, (x - sliderX) / sliderW));
        flattenRef.current = 1 - norm;  // INVERT: left = flat (1), right = 3D (0)
        state.draggingSlider = 'flatten';
        return;
      }

      // Depth slider - write to ref, no re-render!
      const depthX = sliderX + sliderW + 40;
      const depthW = W - depthX - 20;
      const depthY = ctrlY + 10;
      if (y >= depthY - 10 && y <= depthY + 30 && x >= depthX - 10 && x <= depthX + depthW + 10) {
        const norm = Math.max(0, Math.min(1, (x - depthX) / depthW));
        depthRef.current = norm;  // No setState = no re-render!
        state.draggingSlider = 'depth';
        return;
      }

      // Viz drag
      if (y < H - 100) {
        state.isDragging = true;
        state.activePanel = fullPage && x > W / 2 ? 'right' : 'left';
        state.lastMouseX = x;
        state.lastMouseY = y;
      }
    },
    [getCanvasCoords, fullPage]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const state = physics.current;
      const { x } = getCanvasCoords(e);

      // Slider drag - use dedicated draggingSlider flag
      if (state.draggingSlider === 'flatten') {
        e.preventDefault();
        const sliderX = 320;
        const sliderW = 350;
        const norm = Math.max(0, Math.min(1, (x - sliderX) / sliderW));
        flattenRef.current = 1 - norm;  // INVERT: left = flat (1), right = 3D (0)
        return;
      }

      if (state.draggingSlider === 'depth') {
        e.preventDefault();
        const sliderX = 320;
        const sliderW = 350;
        const depthX = sliderX + sliderW + 40;
        const depthW = W - depthX - 20;
        const norm = Math.max(0, Math.min(1, (x - depthX) / depthW));
        depthRef.current = norm;
        return;
      }

      // Viz drag
      if (!state.isDragging || !state.activePanel) return;
      e.preventDefault();

      const { y } = getCanvasCoords(e);
      const dx = x - state.lastMouseX;
      const dy = y - state.lastMouseY;

      if (shape.is4D) {
        state.angleXZ += dx * DRAG_SENSITIVITY;
        state.angleYZ += dy * DRAG_SENSITIVITY;
        state.omegaXZ = dx * DRAG_SENSITIVITY * 0.5;
        state.omegaYZ = dy * DRAG_SENSITIVITY * 0.5;
      } else {
        state.Lx += dy * DRAG_SENSITIVITY * 0.3 * inertia.I1;
        state.Ly += dx * DRAG_SENSITIVITY * 0.3 * inertia.I2;
      }

      state.lastMouseX = x;
      state.lastMouseY = y;
    },
    [getCanvasCoords, shape, inertia]
  );

  const handleEnd = useCallback(() => {
    physics.current.isDragging = false;
    physics.current.activePanel = null;
    physics.current.draggingSlider = null;
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
        maxWidth: W,
        aspectRatio: `${W} / ${H}`,
        touchAction: 'none',
      }}
      className="rounded-xl cursor-grab active:cursor-grabbing bg-black"
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
