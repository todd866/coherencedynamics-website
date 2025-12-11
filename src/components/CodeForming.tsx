'use client';

/**
 * =============================================================================
 * CodeForming - Dimensional Observer Window
 * =============================================================================
 *
 * CORE INSIGHT:
 * You're not collapsing the OBJECT - you're collapsing the OBSERVER.
 * The 4D/3D structure exists. Your observation apparatus has limited dimensionality.
 *
 * THE PHYSICS:
 * - Same rigid body physics as TesseractSimple
 * - Euler's equations for Dzhanibekov effect on asymmetric 3D bodies
 * - Proper angular momentum conservation
 *
 * THE VISUALIZATION:
 * - 4.0D Window: Full perception - particles/vertices visible
 * - 3.0D Window: Depth emerges, scanlines appear
 * - 2.0D Window: QUANTIZATION - structure becomes CODE
 *
 * MEANING FROM THE UNSEEN:
 * At low dimensionality, the hidden coordinates determine the character.
 * For 4D: W-coordinate → character
 * For 3D: Angular momentum state → character (symbolic representation of Dzhanibekov)
 *
 * =============================================================================
 */

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

// =============================================================================
// CONSTANTS
// =============================================================================

const CHARS = '01λφψ{}[]<>∂∫∑∏xyz=+-*/#@&|~^:;';
const GRID_SIZE = 14;
const FONT_SIZE = 12;

// Physics constants (matching TesseractSimple)
const DAMPING = 0.003;
const VELOCITY_EPSILON = 0.00005;
const DRAG_SENSITIVITY = 0.006;
const FLICK_BOOST = 2.0;
const TAP_IMPULSE = 0.06;
const EULER_COUPLING = 0.15;

// =============================================================================
// TYPES
// =============================================================================

interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

type ShapeType = 'tesseract' | '16-cell' | '24-cell' | 'wrench' | 'book';

interface Shape {
  vertices: Vec4[];
  edges: { from: number; to: number }[];
  particles: Vec4[];  // Additional particles for volume/density
  is4D: boolean;
  inertia: { I1: number; I2: number; I3: number };
  name: string;
}

interface PhysicsState {
  // Angles (radians)
  angleXY: number;
  angleXZ: number;
  angleYZ: number;
  angleXW: number;
  angleYW: number;
  angleZW: number;

  // Angular velocities (radians/frame)
  omegaXY: number;
  omegaXZ: number;
  omegaYZ: number;
  omegaXW: number;
  omegaYW: number;
  omegaZW: number;

  // Angular momentum (for 3D Euler physics)
  Lx: number;
  Ly: number;
  Lz: number;

  // Observer dimensionality: 4.0 (chaos) → 2.0 (code)
  observerDim: number;

  // Interaction state
  isDragging: boolean;
  isHolding: boolean;
  holdStartTime: number;
  lastMouseX: number;
  lastMouseY: number;
  lastMoveTime: number;
  dragStartX: number;
  dragStartY: number;
  dragDistance: number;
  lastTapTime: number;
  tapX: number;
  tapY: number;
  activeControl: string | null;
}

interface CodeCollapseProps {
  fullPage?: boolean;
}

// =============================================================================
// SHAPE GENERATORS
// =============================================================================

function generateTesseract(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];
  const particles: Vec4[] = [];

  // 16 vertices of tesseract
  for (let i = 0; i < 16; i++) {
    vertices.push({
      x: (i & 1) ? 1 : -1,
      y: (i & 2) ? 1 : -1,
      z: (i & 4) ? 1 : -1,
      w: (i & 8) ? 1 : -1,
    });
  }

  // 32 edges
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

  // Edge particles for density
  for (const edge of edges) {
    const v1 = vertices[edge.from];
    const v2 = vertices[edge.to];
    for (let t = 0.2; t <= 0.8; t += 0.2) {
      particles.push({
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t,
        z: v1.z + (v2.z - v1.z) * t,
        w: v1.w + (v2.w - v1.w) * t,
      });
    }
  }

  // Volume particles
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
      w: (Math.random() - 0.5) * 2,
    });
  }

  return {
    vertices,
    edges,
    particles,
    is4D: true,
    inertia: { I1: 1.0, I2: 1.0, I3: 1.0 },
    name: 'Tesseract',
  };
}

function generate16Cell(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];
  const particles: Vec4[] = [];
  const scale = 1.5;

  // 8 vertices (4D cross-polytope)
  vertices.push(
    { x: scale, y: 0, z: 0, w: 0 },
    { x: -scale, y: 0, z: 0, w: 0 },
    { x: 0, y: scale, z: 0, w: 0 },
    { x: 0, y: -scale, z: 0, w: 0 },
    { x: 0, y: 0, z: scale, w: 0 },
    { x: 0, y: 0, z: -scale, w: 0 },
    { x: 0, y: 0, z: 0, w: scale },
    { x: 0, y: 0, z: 0, w: -scale },
  );

  // 24 edges (each vertex connects to all non-opposite)
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (Math.floor(i / 2) !== Math.floor(j / 2)) {
        edges.push({ from: i, to: j });
      }
    }
  }

  // Edge particles
  for (const edge of edges) {
    const v1 = vertices[edge.from];
    const v2 = vertices[edge.to];
    for (let t = 0.33; t <= 0.67; t += 0.34) {
      particles.push({
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t,
        z: v1.z + (v2.z - v1.z) * t,
        w: v1.w + (v2.w - v1.w) * t,
      });
    }
  }

  // Diamond-distributed volume
  for (let i = 0; i < 40; i++) {
    const x = Math.random() - 0.5;
    const y = Math.random() - 0.5;
    const z = Math.random() - 0.5;
    const w = Math.random() - 0.5;
    const d = (Math.abs(x) + Math.abs(y) + Math.abs(z) + Math.abs(w)) / scale;
    particles.push({ x: x/d, y: y/d, z: z/d, w: w/d });
  }

  return {
    vertices,
    edges,
    particles,
    is4D: true,
    inertia: { I1: 0.8, I2: 1.0, I3: 1.2 },
    name: '16-Cell',
  };
}

function generate24Cell(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];
  const particles: Vec4[] = [];
  const scale = 1.2;

  // 8 axis vertices
  const axes = [
    { x: 1, y: 0, z: 0, w: 0 }, { x: -1, y: 0, z: 0, w: 0 },
    { x: 0, y: 1, z: 0, w: 0 }, { x: 0, y: -1, z: 0, w: 0 },
    { x: 0, y: 0, z: 1, w: 0 }, { x: 0, y: 0, z: -1, w: 0 },
    { x: 0, y: 0, z: 0, w: 1 }, { x: 0, y: 0, z: 0, w: -1 },
  ];
  axes.forEach(v => vertices.push({
    x: v.x * scale, y: v.y * scale, z: v.z * scale, w: v.w * scale
  }));

  // 16 tesseract vertices (scaled)
  const s = scale * 0.707;
  for (let i = 0; i < 16; i++) {
    vertices.push({
      x: ((i & 1) ? s : -s),
      y: ((i & 2) ? s : -s),
      z: ((i & 4) ? s : -s),
      w: ((i & 8) ? s : -s),
    });
  }

  // Edges at distance sqrt(2) * scale
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

  // Edge particles
  for (const edge of edges) {
    const v1 = vertices[edge.from];
    const v2 = vertices[edge.to];
    particles.push({
      x: (v1.x + v2.x) / 2,
      y: (v1.y + v2.y) / 2,
      z: (v1.z + v2.z) / 2,
      w: (v1.w + v2.w) / 2,
    });
  }

  return {
    vertices,
    edges,
    particles,
    is4D: true,
    inertia: { I1: 1.0, I2: 1.0, I3: 1.0 },
    name: '24-Cell',
  };
}

function generateWrench(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];
  const particles: Vec4[] = [];

  const handleLength = 2.0;
  const handleRadius = 0.15;
  const segments = 8;

  // Handle rings
  for (let ring = 0; ring <= 4; ring++) {
    const y = -handleLength/2 + (ring / 4) * handleLength;
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

  // Handle edges
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

  // Head (perpendicular bar)
  const headLength = 1.2;
  const headRadius = 0.2;
  const headY = handleLength / 2;
  const headStart = vertices.length;

  for (let ring = 0; ring <= 3; ring++) {
    const x = -headLength/2 + (ring / 3) * headLength;
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

  // Head edges
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
      to: headStart + 3 * segments + ((i + 1) % segments)
    });
  }

  // Particles along handle and head
  for (let y = -handleLength/2; y <= handleLength/2; y += 0.3) {
    particles.push({ x: 0, y, z: 0, w: 0 });
  }
  for (let x = -headLength/2; x <= headLength/2; x += 0.2) {
    particles.push({ x, y: headY, z: 0, w: 0 });
  }

  return {
    vertices,
    edges,
    particles,
    is4D: false,
    inertia: { I1: 0.3, I2: 1.0, I3: 1.8 },  // Dzhanibekov!
    name: 'Wrench',
  };
}

function generateBook(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];
  const particles: Vec4[] = [];

  // Dimensions: thin × medium × long
  const dx = 0.3;
  const dy = 0.8;
  const dz = 1.5;

  // 8 corners
  for (let i = 0; i < 8; i++) {
    vertices.push({
      x: (i & 1) ? dx : -dx,
      y: (i & 2) ? dy : -dy,
      z: (i & 4) ? dz : -dz,
      w: 0,
    });
  }

  // 12 edges
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      const diff = ((vertices[i].x !== vertices[j].x) ? 1 : 0) +
                   ((vertices[i].y !== vertices[j].y) ? 1 : 0) +
                   ((vertices[i].z !== vertices[j].z) ? 1 : 0);
      if (diff === 1) {
        edges.push({ from: i, to: j });
      }
    }
  }

  // Face particles
  const facePoints = [-0.5, 0, 0.5];
  // XY faces (z = ±dz)
  for (const fx of facePoints) {
    for (const fy of facePoints) {
      particles.push({ x: fx * dx * 2, y: fy * dy * 2, z: dz, w: 0 });
      particles.push({ x: fx * dx * 2, y: fy * dy * 2, z: -dz, w: 0 });
    }
  }
  // XZ faces (y = ±dy)
  for (const fx of facePoints) {
    for (const fz of facePoints) {
      particles.push({ x: fx * dx * 2, y: dy, z: fz * dz * 2, w: 0 });
      particles.push({ x: fx * dx * 2, y: -dy, z: fz * dz * 2, w: 0 });
    }
  }

  return {
    vertices,
    edges,
    particles,
    is4D: false,
    inertia: { I1: 0.4, I2: 1.0, I3: 2.2 },  // Dzhanibekov!
    name: 'Book',
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CodeForming({ fullPage = false }: CodeCollapseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [shapeType, setShapeType] = useState<ShapeType>('tesseract');

  const shape = useMemo(() => {
    switch (shapeType) {
      case 'tesseract': return generateTesseract();
      case '16-cell': return generate16Cell();
      case '24-cell': return generate24Cell();
      case 'wrench': return generateWrench();
      case 'book': return generateBook();
      default: return generateTesseract();
    }
  }, [shapeType]);

  const SCALE = 2;
  const BASE_W = fullPage ? 1100 : 700;
  const BASE_H = fullPage ? 850 : 550;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;
  const VIEW_HEIGHT = fullPage ? H * 0.72 : H * 0.88;

  const physics = useRef<PhysicsState>({
    angleXY: 0, angleXZ: 0, angleYZ: 0,
    angleXW: 0, angleYW: 0, angleZW: 0,
    omegaXY: 0, omegaXZ: 0, omegaYZ: 0,
    omegaXW: 0.003, omegaYW: 0, omegaZW: 0,
    Lx: 0, Ly: 0.05, Lz: 0.001,
    observerDim: 4.0,
    isDragging: false, isHolding: false, holdStartTime: 0,
    lastMouseX: 0, lastMouseY: 0, lastMoveTime: 0,
    dragStartX: 0, dragStartY: 0, dragDistance: 0,
    lastTapTime: 0, tapX: 0, tapY: 0,
    activeControl: null,
  });

  // Reset physics when shape changes
  useEffect(() => {
    const state = physics.current;
    state.angleXY = 0; state.angleXZ = 0; state.angleYZ = 0;
    state.angleXW = 0; state.angleYW = 0; state.angleZW = 0;
    state.omegaXY = 0; state.omegaXZ = 0; state.omegaYZ = 0;
    state.omegaXW = shape.is4D ? 0.003 : 0;
    state.omegaYW = 0; state.omegaZW = 0;

    if (!shape.is4D && shape.inertia.I1 !== shape.inertia.I2) {
      state.Lx = 0.001;
      state.Ly = 0.08;
      state.Lz = 0.002;
    } else {
      state.Lx = 0; state.Ly = 0; state.Lz = 0;
    }
  }, [shape]);

  // ---------------------------------------------------------------------------
  // 4D ROTATION
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
  // PROJECTION
  // ---------------------------------------------------------------------------

  const project4Dto3D = useCallback((v: Vec4): { x: number; y: number; z: number; w: number } => {
    const distance = 2.5;
    const scale = 1 / (distance - v.w * 0.5);
    return { x: v.x * scale, y: v.y * scale, z: v.z * scale, w: v.w };
  }, []);

  const project3Dto2D = useCallback((x: number, y: number, z: number) => {
    const fov = 3;
    const scale = fov / (fov + z + 1.5);
    return { x: x * scale, y: y * scale, scale, z };
  }, []);

  // ---------------------------------------------------------------------------
  // ANIMATION LOOP
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
      const { I1, I2, I3 } = shape.inertia;

      // -----------------------------------------------------------------------
      // PHYSICS UPDATE
      // -----------------------------------------------------------------------

      if (state.isDragging && state.isHolding) {
        state.omegaXZ = 0; state.omegaYZ = 0; state.omegaXY = 0;
        state.omegaXW = 0; state.omegaYW = 0; state.omegaZW = 0;
        state.Lx = 0; state.Ly = 0; state.Lz = 0;
      } else if (!state.isDragging || state.activeControl === 'dim') {
        if (shape.is4D) {
          // 4D: Simple damped rotation
          state.omegaXZ *= (1 - DAMPING);
          state.omegaYZ *= (1 - DAMPING);
          state.omegaXW *= (1 - DAMPING);
          state.omegaYW *= (1 - DAMPING);

          if (Math.abs(state.omegaXZ) < VELOCITY_EPSILON) state.omegaXZ = 0;
          if (Math.abs(state.omegaYZ) < VELOCITY_EPSILON) state.omegaYZ = 0;
          if (Math.abs(state.omegaXW) < VELOCITY_EPSILON) state.omegaXW = 0;
          if (Math.abs(state.omegaYW) < VELOCITY_EPSILON) state.omegaYW = 0;

          state.angleXZ += state.omegaXZ;
          state.angleYZ += state.omegaYZ;
          state.angleXW += state.omegaXW;
          state.angleYW += state.omegaYW;
        } else {
          // 3D: Euler's equations for Dzhanibekov
          let omegaX = state.Lx / I1;
          let omegaY = state.Ly / I2;
          let omegaZ = state.Lz / I3;

          const dOmegaX = EULER_COUPLING * (I2 - I3) * omegaY * omegaZ / I1;
          const dOmegaY = EULER_COUPLING * (I3 - I1) * omegaZ * omegaX / I2;
          const dOmegaZ = EULER_COUPLING * (I1 - I2) * omegaX * omegaY / I3;

          state.Lx = (state.Lx + dOmegaX * I1) * (1 - DAMPING * 0.5);
          state.Ly = (state.Ly + dOmegaY * I2) * (1 - DAMPING * 0.5);
          state.Lz = (state.Lz + dOmegaZ * I3) * (1 - DAMPING * 0.5);

          omegaX = state.Lx / I1;
          omegaY = state.Ly / I2;
          omegaZ = state.Lz / I3;

          state.omegaYZ = omegaX;
          state.omegaXZ = omegaY;
          state.omegaXY = omegaZ;

          if (Math.abs(state.Lx) < VELOCITY_EPSILON * I1) state.Lx = 0;
          if (Math.abs(state.Ly) < VELOCITY_EPSILON * I2) state.Ly = 0;
          if (Math.abs(state.Lz) < VELOCITY_EPSILON * I3) state.Lz = 0;

          state.angleYZ += state.omegaYZ;
          state.angleXZ += state.omegaXZ;
          state.angleXY += state.omegaXY;
        }
      }

      // -----------------------------------------------------------------------
      // RENDERING
      // -----------------------------------------------------------------------

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      // Collapse factor: 4.0→2.0 maps to 0→1
      const collapseFactor = Math.max(0, Math.min(1, (4.0 - state.observerDim) / 2.0));
      const snapStrength = Math.pow(collapseFactor, 3);

      // Header
      const dimLabel = state.observerDim > 3.5 ? (shape.is4D ? '4D HYPERCHAOS' : '3D DYNAMICS') :
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

      // Scanlines (intermediate collapse)
      if (collapseFactor > 0.2 && collapseFactor < 0.9) {
        ctx.fillStyle = `rgba(34, 197, 94, ${collapseFactor * 0.03})`;
        for (let i = 40 * SCALE; i < VIEW_HEIGHT; i += 4 * SCALE) {
          ctx.fillRect(0, i, W, 1 * SCALE);
        }
      }

      // -----------------------------------------------------------------------
      // TRANSFORM AND RENDER
      // -----------------------------------------------------------------------

      const centerX = W / 2;
      const centerY = VIEW_HEIGHT / 2;
      const renderScale = fullPage ? 220 * SCALE : 280 * SCALE;

      // Combine vertices and particles for rendering
      const allPoints = [...shape.vertices, ...shape.particles];

      const projected = allPoints.map((v, i) => {
        let p = { ...v };

        if (shape.is4D) {
          p = rotate4D(p, state.angleXW, 'xw');
          p = rotate4D(p, state.angleYW, 'yw');
          p = rotate4D(p, state.angleXZ, 'xz');
          p = rotate4D(p, state.angleYZ, 'yz');

          const p3 = project4Dto3D(p);
          const zInfluence = p3.z * (1 - snapStrength);
          const fov = 600;
          const screenScale = fov / (fov - zInfluence * 200);

          let sx = p3.x * screenScale * renderScale + centerX;
          let sy = p3.y * screenScale * renderScale + centerY;

          // Quantization
          if (snapStrength > 0.01) {
            const gx = Math.round(sx / (GRID_SIZE * SCALE)) * (GRID_SIZE * SCALE);
            const gy = Math.round(sy / (GRID_SIZE * SCALE * 1.3)) * (GRID_SIZE * SCALE * 1.3);
            const extremeSnap = Math.max(0, (snapStrength - 0.8) / 0.2);
            const targetX = gx * (1 - extremeSnap) + centerX * extremeSnap;
            const targetY = gy * (1 - extremeSnap) + centerY * extremeSnap;
            sx = sx * (1 - snapStrength) + targetX * snapStrength;
            sy = sy * (1 - snapStrength) + targetY * snapStrength;
          }

          return { x: sx, y: sy, z: p3.z, w: p3.w, index: i, scale: screenScale, isVertex: i < shape.vertices.length };
        } else {
          // 3D rotation
          p = rotate4D(p, state.angleXY, 'xy');
          p = rotate4D(p, state.angleXZ, 'xz');
          p = rotate4D(p, state.angleYZ, 'yz');

          const zInfluence = p.z * (1 - snapStrength);
          const fov = 600;
          const screenScale = fov / (fov - zInfluence * 200);

          let sx = p.x * screenScale * renderScale + centerX;
          let sy = p.y * screenScale * renderScale + centerY;

          // Quantization
          if (snapStrength > 0.01) {
            const gx = Math.round(sx / (GRID_SIZE * SCALE)) * (GRID_SIZE * SCALE);
            const gy = Math.round(sy / (GRID_SIZE * SCALE * 1.3)) * (GRID_SIZE * SCALE * 1.3);
            const extremeSnap = Math.max(0, (snapStrength - 0.8) / 0.2);
            const targetX = gx * (1 - extremeSnap) + centerX * extremeSnap;
            const targetY = gy * (1 - extremeSnap) + centerY * extremeSnap;
            sx = sx * (1 - snapStrength) + targetX * snapStrength;
            sy = sy * (1 - snapStrength) + targetY * snapStrength;
          }

          // For 3D shapes, encode angular momentum in w for character selection
          const Lmag = Math.sqrt(state.Lx*state.Lx + state.Ly*state.Ly + state.Lz*state.Lz);
          const Ldir = Lmag > 0.001 ? Math.atan2(state.Ly, state.Lx) : 0;
          const wEncoded = (Ldir / Math.PI) + (p.z * 0.5);

          return { x: sx, y: sy, z: p.z, w: wEncoded, index: i, scale: screenScale, isVertex: i < shape.vertices.length };
        }
      });

      // Sort by depth
      projected.sort((a, b) => a.z - b.z);

      // Draw edges (for geometric shapes)
      if (snapStrength < 0.7) {
        ctx.lineCap = 'round';
        for (const edge of shape.edges) {
          const p1Idx = projected.findIndex(p => p.index === edge.from);
          const p2Idx = projected.findIndex(p => p.index === edge.to);
          if (p1Idx === -1 || p2Idx === -1) continue;

          const p1 = projected[p1Idx];
          const p2 = projected[p2Idx];

          const avgZ = (p1.z + p2.z) / 2;
          const avgW = (p1.w + p2.w) / 2;
          const alpha = shape.is4D
            ? (0.3 + (avgW + 1) * 0.35) * (1 - snapStrength)
            : (0.4 + (1 - avgZ) * 0.3) * (1 - snapStrength);

          const hue = shape.is4D ? 200 + avgW * 40 : 200;

          ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.lineWidth = 1.5 * SCALE;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw points/characters
      ctx.font = `${FONT_SIZE * SCALE}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // At extreme collapse (very close to 2D), show single symbol
      if (collapseFactor > 0.95) {
        // Single symbol representing the entire collapsed state
        // Symbol encodes angular momentum direction for 3D, or 4D phase for 4D
        let symbolChar: string;
        if (shape.is4D) {
          // 4D: symbol based on XW angle phase
          const phase = ((state.angleXW % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const phaseIdx = Math.floor((phase / (Math.PI * 2)) * 8);
          const phaseSymbols = ['⟨', '⊕', '⟩', '⊗', '⟨', '⊖', '⟩', '⊘'];
          symbolChar = phaseSymbols[phaseIdx];
        } else {
          // 3D: symbol based on angular momentum direction
          const Lmag = Math.sqrt(state.Lx*state.Lx + state.Ly*state.Ly + state.Lz*state.Lz);
          if (Lmag < 0.01) {
            symbolChar = '○';  // At rest
          } else {
            // Encode dominant axis
            const maxL = Math.max(Math.abs(state.Lx), Math.abs(state.Ly), Math.abs(state.Lz));
            if (Math.abs(state.Lx) === maxL) symbolChar = state.Lx > 0 ? '⟲' : '⟳';
            else if (Math.abs(state.Ly) === maxL) symbolChar = state.Ly > 0 ? '↺' : '↻';
            else symbolChar = state.Lz > 0 ? '⤾' : '⤿';
          }
        }

        // Large centered symbol
        ctx.save();
        ctx.font = `bold ${120 * SCALE}px system-ui`;
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 30 * SCALE;
        ctx.fillText(symbolChar, centerX, centerY);
        ctx.restore();

        // Small label
        ctx.font = `${10 * SCALE}px monospace`;
        ctx.fillStyle = '#22c55e88';
        ctx.fillText(shape.is4D ? 'PHASE ENCODED' : 'MOMENTUM ENCODED', centerX, centerY + 80 * SCALE);
      } else {
        // Normal rendering
        projected.forEach(({ x, y, z, w, index, scale, isVertex }) => {
          if (y < 35 * SCALE || y > VIEW_HEIGHT - 10) return;

          // Character from w-dimension (or encoded momentum for 3D)
          const wNorm = (w + 1.5) / 3;
          const charIdx = Math.floor(wNorm * CHARS.length + index) % CHARS.length;
          const char = CHARS[charIdx];

          const depthAlpha = Math.max(0.2, 1 - Math.abs(z) * 0.5);
          const finalAlpha = depthAlpha * (1 - snapStrength * 0.3) + snapStrength * 0.85;

          // Color transition
          if (snapStrength > 0.85) {
            ctx.fillStyle = `rgba(34, 197, 94, ${finalAlpha})`;
          } else if (snapStrength > 0.3) {
            const g = 150 + 105 * snapStrength;
            const r = 100 * (1 - snapStrength);
            ctx.fillStyle = `rgba(${r}, ${g}, 50, ${finalAlpha})`;
          } else {
            const hue = shape.is4D ? 200 + w * 40 : 200 + (state.Ly > 0 ? 60 : -20);
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${finalAlpha})`;
          }

          if (snapStrength > 0.7) {
            ctx.fillText(char, x, y);
          } else if (snapStrength > 0.3) {
            ctx.font = `${(FONT_SIZE - 2) * SCALE}px "Courier New", monospace`;
            ctx.fillText(char, x, y);
            ctx.font = `${FONT_SIZE * SCALE}px "Courier New", monospace`;
          } else {
            const size = isVertex ? 3 * scale * SCALE : 2 * scale * SCALE;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // -----------------------------------------------------------------------
      // CONTROL PANEL
      // -----------------------------------------------------------------------

      const panelY = VIEW_HEIGHT + 12 * SCALE;
      const padding = 20 * SCALE;

      // Shape buttons (only in fullPage mode)
      if (fullPage) {
        ctx.fillStyle = '#555';
        ctx.font = `${9 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('SHAPE', padding, panelY);

        const shapes: ShapeType[] = ['tesseract', '16-cell', '24-cell', 'wrench', 'book'];
        const shapeLabels = ['4D Tesseract', '4D 16-Cell', '4D 24-Cell', '3D Wrench', '3D Book'];
        const btnWidth = 85 * SCALE;

        shapes.forEach((s, i) => {
          const bx = padding + i * btnWidth;
          const by = panelY + 10 * SCALE;
          const isActive = shapeType === s;
          const is3D = s === 'wrench' || s === 'book';

          ctx.fillStyle = isActive ? (is3D ? '#ffaa66' : '#22c55e') : '#1a1a1a';
          ctx.beginPath();
          ctx.roundRect(bx, by, btnWidth - 6 * SCALE, 20 * SCALE, 3 * SCALE);
          ctx.fill();

          if (!isActive) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.fillStyle = isActive ? '#000' : (is3D ? '#aa7744' : '#777');
          ctx.font = `${8 * SCALE}px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText(shapeLabels[i], bx + (btnWidth - 6 * SCALE) / 2, by + 12 * SCALE);
        });

        // Dzhanibekov warning for asymmetric 3D shapes
        if (!shape.is4D && shape.inertia.I1 !== shape.inertia.I2) {
          ctx.fillStyle = '#ffaa66';
          ctx.font = `${9 * SCALE}px system-ui`;
          ctx.textAlign = 'left';
          ctx.fillText('⚠ Dzhanibekov unstable - intermediate axis rotation', padding, panelY + 38 * SCALE);
        }
      }

      // Observer dimensionality slider
      const dimY = fullPage ? panelY + 54 * SCALE : panelY;
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('OBSERVATION DIMENSIONALITY', padding, dimY);

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

      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimSliderW, dimSliderH, 6 * SCALE);
      ctx.fill();

      const gradient = ctx.createLinearGradient(dimSliderX, 0, dimSliderX + dimSliderW, 0);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.5, '#eab308');
      gradient.addColorStop(1, '#3b82f6');

      const dimNorm = (state.observerDim - 2.0) / 2.0;
      const dimFillW = dimNorm * dimSliderW;

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimFillW, dimSliderH, 6 * SCALE);
      ctx.fill();

      const dimHandleX = dimSliderX + dimFillW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(dimHandleX, dimSliderY + dimSliderH / 2, 10 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 3 * SCALE;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = `${8 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('2D CODE', dimSliderX, dimSliderY + dimSliderH + 12 * SCALE);

      ctx.fillStyle = '#eab308';
      ctx.textAlign = 'center';
      ctx.fillText('3D SHADOW', dimSliderX + dimSliderW / 2, dimSliderY + dimSliderH + 12 * SCALE);

      ctx.fillStyle = '#3b82f6';
      ctx.textAlign = 'right';
      ctx.fillText(shape.is4D ? '4D CHAOS' : '3D DYNAMICS', dimSliderX + dimSliderW, dimSliderY + dimSliderH + 12 * SCALE);

      // Angular momentum meter (for 3D shapes)
      if (!shape.is4D && fullPage) {
        const meterY = dimSliderY + dimSliderH + 28 * SCALE;
        const Lmag = Math.sqrt(state.Lx*state.Lx + state.Ly*state.Ly + state.Lz*state.Lz);
        const normalizedL = Math.min(1, Lmag / 0.15);

        ctx.fillStyle = '#555';
        ctx.font = `${9 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('ANGULAR MOMENTUM', padding, meterY);

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(padding, meterY + 8 * SCALE, dimSliderW, 6 * SCALE, 3 * SCALE);
        ctx.fill();

        ctx.fillStyle = `hsla(${30 + normalizedL * 60}, 80%, 50%, 0.8)`;
        ctx.beginPath();
        ctx.roundRect(padding, meterY + 8 * SCALE, normalizedL * dimSliderW, 6 * SCALE, 3 * SCALE);
        ctx.fill();
      }

      // Tap ripple
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
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, project4Dto3D, project3Dto2D, shape, shapeType, W, H, VIEW_HEIGHT, fullPage]);

  // ---------------------------------------------------------------------------
  // INPUT HANDLING
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
    const panelY = VIEW_HEIGHT + 12 * SCALE;
    const padding = 20 * SCALE;

    // Shape buttons (only in fullPage mode)
    if (fullPage) {
      const btnY = panelY + 10 * SCALE;
      const btnWidth = 85 * SCALE;
      if (y >= btnY && y <= btnY + 20 * SCALE) {
        const shapes: ShapeType[] = ['tesseract', '16-cell', '24-cell', 'wrench', 'book'];
        for (let i = 0; i < shapes.length; i++) {
          const bx = padding + i * btnWidth;
          if (x >= bx && x <= bx + btnWidth - 6 * SCALE) {
            setShapeType(shapes[i]);
            return;
          }
        }
      }
    }

    // Dimensionality slider
    const dimY = fullPage ? panelY + 54 * SCALE + 12 * SCALE : panelY + 12 * SCALE;
    const dimSliderW = W - padding * 2;
    if (y >= dimY - 15 * SCALE && y <= dimY + 25 * SCALE && x >= padding - 15 * SCALE && x <= padding + dimSliderW + 15 * SCALE) {
      state.isDragging = true;
      state.activeControl = 'dim';
      const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
      state.observerDim = 2.0 + norm * 2.0;
      return;
    }

    // Visualization drag
    if (y < VIEW_HEIGHT) {
      state.isDragging = true;
      state.isHolding = true;
      state.holdStartTime = Date.now();
      state.activeControl = 'viz';
      state.dragStartX = x;
      state.dragStartY = y;
      state.lastMouseX = x;
      state.lastMouseY = y;
      state.lastMoveTime = Date.now();
      state.dragDistance = 0;
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
      const now = Date.now();
      const dt = Math.max(1, now - state.lastMoveTime);
      const dx = x - state.lastMouseX;
      const dy = y - state.lastMouseY;

      state.dragDistance += Math.abs(dx) + Math.abs(dy);
      if (state.dragDistance > 5) state.isHolding = false;

      if (!state.isHolding) {
        if (shape.is4D) {
          state.angleXZ += dx * DRAG_SENSITIVITY;
          state.angleYZ += dy * DRAG_SENSITIVITY;
          state.omegaXZ = (dx * DRAG_SENSITIVITY) / dt * 16;
          state.omegaYZ = (dy * DRAG_SENSITIVITY) / dt * 16;
        } else {
          state.Lx += dy * DRAG_SENSITIVITY * 0.5 * shape.inertia.I1;
          state.Ly += dx * DRAG_SENSITIVITY * 0.5 * shape.inertia.I2;
        }
      }

      state.lastMouseX = x;
      state.lastMouseY = y;
      state.lastMoveTime = now;
    }
  }, [getCanvasCoords, W, shape]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const state = physics.current;
    const holdDuration = Date.now() - state.holdStartTime;
    const timeSinceLastMove = Date.now() - state.lastMoveTime;

    if (state.activeControl === 'viz') {
      const isTap = state.dragDistance < 10 && holdDuration < 200;
      const isFlick = state.dragDistance > 10 && timeSinceLastMove < 50;

      if (isTap) {
        let tapX = state.dragStartX;
        let tapY = state.dragStartY;

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

        if (shape.is4D) {
          state.omegaYW += TAP_IMPULSE;
        } else {
          state.Lx += (Math.random() - 0.5) * 0.02;
          state.Ly += TAP_IMPULSE * shape.inertia.I2;
          state.Lz += (Math.random() - 0.5) * 0.02;
        }

        state.lastTapTime = Date.now();
        state.tapX = tapX;
        state.tapY = tapY;
      } else if (isFlick) {
        if (shape.is4D) {
          state.omegaXZ *= FLICK_BOOST;
          state.omegaYZ *= FLICK_BOOST;
        } else {
          state.Lx *= FLICK_BOOST;
          state.Ly *= FLICK_BOOST;
          state.Lz *= FLICK_BOOST;
        }
      }
    }

    state.isDragging = false;
    state.isHolding = false;
    state.activeControl = null;
  }, [shape]);

  // ---------------------------------------------------------------------------
  // RENDER
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
