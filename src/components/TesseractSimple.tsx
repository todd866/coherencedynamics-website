'use client';

/**
 * =============================================================================
 * TesseractSimple - 3D/4D Rigid Body Physics with Dzhanibekov Effect
 * =============================================================================
 *
 * PHYSICS MODEL:
 * --------------
 * Rigid body rotation with proper inertia tensors. Asymmetric objects exhibit
 * the Dzhanibekov (intermediate axis) effect - spontaneous flipping when
 * rotating near an unstable axis.
 *
 * 3D SHAPES: Rotate in 3 planes (XY, XZ, YZ) with 3x3 inertia tensor
 * 4D SHAPES: Rotate in 6 planes with 4D stereographic projection
 *
 * EULER'S EQUATIONS (simplified for visualization):
 * -------------------------------------------------
 * For a rigid body with principal moments I1 < I2 < I3:
 * - Rotation around I1 (smallest): STABLE
 * - Rotation around I2 (intermediate): UNSTABLE (Dzhanibekov!)
 * - Rotation around I3 (largest): STABLE
 *
 * The instability arises because small perturbations grow exponentially
 * when rotating near the intermediate axis.
 *
 * =============================================================================
 */

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface TesseractSimpleProps {
  className?: string;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

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
  is4D: boolean;
  // Principal moments of inertia (normalized, I1 < I2 < I3)
  inertia: { I1: number; I2: number; I3: number };
  name: string;
}

interface PhysicsState {
  // Angles (radians) - 6 rotation planes for full generality
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

  // Angular momentum (conserved in absence of torque)
  // For Dzhanibekov, we track L and derive ω from L and I
  Lx: number;
  Ly: number;
  Lz: number;

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
}

// =============================================================================
// PHYSICS CONSTANTS
// =============================================================================

const DAMPING = 0.003;  // Lower damping - let it spin longer
const VELOCITY_EPSILON = 0.00005;
const DRAG_SENSITIVITY = 0.006;
const FLICK_BOOST = 2.0;
const TAP_IMPULSE = 0.06;
const TAP_MAX_DURATION = 200;
const TAP_MAX_DISTANCE = 10;
const HOLD_THRESHOLD = 100;

// Dzhanibekov coupling strength - how strongly the instability manifests
const EULER_COUPLING = 0.15;

// =============================================================================
// CANVAS DIMENSIONS
// =============================================================================

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const RENDER_SCALE = 350;

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

  return {
    vertices,
    edges,
    is4D: true,
    inertia: { I1: 1.0, I2: 1.0, I3: 1.0 },  // Symmetric - stable
    name: 'Tesseract',
  };
}

function generate16Cell(): Shape {
  // 16-cell: 4D cross-polytope (analog of octahedron)
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

  // Each vertex connects to all others except its opposite
  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      // Skip opposite pairs (0-1, 2-3, 4-5, 6-7)
      if (Math.floor(i / 2) !== Math.floor(j / 2)) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return {
    vertices,
    edges,
    is4D: true,
    inertia: { I1: 0.8, I2: 1.0, I3: 1.2 },  // Slightly asymmetric
    name: '16-Cell',
  };
}

function generate24Cell(): Shape {
  // 24-cell: unique to 4D, self-dual
  const vertices: Vec4[] = [];
  const scale = 1.2;

  // 8 vertices from 16-cell
  const axes = [
    { x: 1, y: 0, z: 0, w: 0 }, { x: -1, y: 0, z: 0, w: 0 },
    { x: 0, y: 1, z: 0, w: 0 }, { x: 0, y: -1, z: 0, w: 0 },
    { x: 0, y: 0, z: 1, w: 0 }, { x: 0, y: 0, z: -1, w: 0 },
    { x: 0, y: 0, z: 0, w: 1 }, { x: 0, y: 0, z: 0, w: -1 },
  ];
  axes.forEach(v => vertices.push({
    x: v.x * scale, y: v.y * scale, z: v.z * scale, w: v.w * scale
  }));

  // 16 vertices from tesseract (scaled down)
  const s = scale * 0.707;
  for (let i = 0; i < 16; i++) {
    vertices.push({
      x: ((i & 1) ? s : -s),
      y: ((i & 2) ? s : -s),
      z: ((i & 4) ? s : -s),
      w: ((i & 8) ? s : -s),
    });
  }

  // Connect vertices at distance sqrt(2) * scale
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

  return {
    vertices,
    edges,
    is4D: true,
    inertia: { I1: 1.0, I2: 1.0, I3: 1.0 },  // Highly symmetric
    name: '24-Cell',
  };
}

function generateWrench(): Shape {
  // T-handle / wrench shape - classic Dzhanibekov demo
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];

  // Handle (along Y axis)
  const handleLength = 2.0;
  const handleRadius = 0.15;
  const segments = 8;

  // Create handle as a series of rings
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

  // Connect handle rings
  for (let ring = 0; ring < 4; ring++) {
    for (let i = 0; i < segments; i++) {
      const curr = ring * segments + i;
      const next = ring * segments + ((i + 1) % segments);
      const above = (ring + 1) * segments + i;
      edges.push({ from: curr, to: next });
      edges.push({ from: curr, to: above });
    }
  }
  // Top ring
  for (let i = 0; i < segments; i++) {
    edges.push({ from: 4 * segments + i, to: 4 * segments + ((i + 1) % segments) });
  }

  // Head (perpendicular bar along X axis at top of handle)
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

  // Connect head rings
  for (let ring = 0; ring < 3; ring++) {
    for (let i = 0; i < segments; i++) {
      const curr = headStart + ring * segments + i;
      const next = headStart + ring * segments + ((i + 1) % segments);
      const above = headStart + (ring + 1) * segments + i;
      edges.push({ from: curr, to: next });
      edges.push({ from: curr, to: above });
    }
  }
  // End cap
  for (let i = 0; i < segments; i++) {
    edges.push({
      from: headStart + 3 * segments + i,
      to: headStart + 3 * segments + ((i + 1) % segments)
    });
  }

  return {
    vertices,
    edges,
    is4D: false,
    // Classic Dzhanibekov inertia: I1 < I2 < I3
    // Rotation around I2 (intermediate) is UNSTABLE
    inertia: { I1: 0.3, I2: 1.0, I3: 1.8 },
    name: 'Wrench',
  };
}

function generateBook(): Shape {
  // Rectangular prism - textbook tennis racket theorem demo
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];

  // Dimensions: thin (x) × medium (y) × long (z)
  const dx = 0.3;  // Thin
  const dy = 0.8;  // Medium - INTERMEDIATE AXIS (unstable!)
  const dz = 1.5;  // Long

  // 8 corners of the box
  for (let i = 0; i < 8; i++) {
    vertices.push({
      x: (i & 1) ? dx : -dx,
      y: (i & 2) ? dy : -dy,
      z: (i & 4) ? dz : -dz,
      w: 0,
    });
  }

  // 12 edges of the box
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

  return {
    vertices,
    edges,
    is4D: false,
    // For a rectangular prism: I = m(a² + b²)/12 for each axis
    // Thin × Medium × Long means:
    // Around X (thin): I_x = (dy² + dz²) = large (stable)
    // Around Y (medium): I_y = (dx² + dz²) = intermediate (UNSTABLE!)
    // Around Z (long): I_z = (dx² + dy²) = small (stable)
    inertia: { I1: 0.4, I2: 1.0, I3: 2.2 },
    name: 'Book',
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function TesseractSimple({ className = '' }: TesseractSimpleProps) {
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

  const physics = useRef<PhysicsState>({
    angleXY: 0, angleXZ: 0, angleYZ: 0,
    angleXW: 0, angleYW: 0, angleZW: 0,
    omegaXY: 0, omegaXZ: 0, omegaYZ: 0,
    omegaXW: 0.003, omegaYW: 0, omegaZW: 0,
    Lx: 0, Ly: 0.05, Lz: 0.001,  // Initial angular momentum - mostly around Y
    isDragging: false, isHolding: false, holdStartTime: 0,
    lastMouseX: 0, lastMouseY: 0, lastMoveTime: 0,
    dragStartX: 0, dragStartY: 0, dragDistance: 0,
    lastTapTime: 0, tapX: 0, tapY: 0,
  });

  // Reset physics when shape changes
  useEffect(() => {
    const state = physics.current;
    state.angleXY = 0; state.angleXZ = 0; state.angleYZ = 0;
    state.angleXW = 0; state.angleYW = 0; state.angleZW = 0;
    state.omegaXY = 0; state.omegaXZ = 0; state.omegaYZ = 0;
    state.omegaXW = shape.is4D ? 0.003 : 0;
    state.omegaYW = 0; state.omegaZW = 0;
    // Give asymmetric shapes some initial spin for Dzhanibekov
    if (!shape.is4D && shape.inertia.I1 !== shape.inertia.I2) {
      state.Lx = 0.001;
      state.Ly = 0.08;  // Mostly around intermediate axis
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

  const project4Dto3D = useCallback((v: Vec4): Vec3 & { w: number } => {
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
        // Freeze
        state.omegaXZ = 0; state.omegaYZ = 0; state.omegaXY = 0;
        state.omegaXW = 0; state.omegaYW = 0; state.omegaZW = 0;
        state.Lx = 0; state.Ly = 0; state.Lz = 0;
      } else if (!state.isDragging) {
        if (shape.is4D) {
          // 4D physics - simple damped rotation
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
          // 3D physics with EULER'S EQUATIONS for Dzhanibekov effect
          // dL/dt = 0 (angular momentum conserved)
          // But ω = I^(-1) L, and the body rotates, so ω in body frame changes!

          // Euler's equations (simplified):
          // dωx/dt = (I2 - I3) * ωy * ωz / I1
          // dωy/dt = (I3 - I1) * ωz * ωx / I2
          // dωz/dt = (I1 - I2) * ωx * ωy / I3

          // Convert L to ω (ω = L / I)
          let omegaX = state.Lx / I1;
          let omegaY = state.Ly / I2;
          let omegaZ = state.Lz / I3;

          // Euler coupling terms
          const dOmegaX = EULER_COUPLING * (I2 - I3) * omegaY * omegaZ / I1;
          const dOmegaY = EULER_COUPLING * (I3 - I1) * omegaZ * omegaX / I2;
          const dOmegaZ = EULER_COUPLING * (I1 - I2) * omegaX * omegaY / I3;

          // Update angular momentum (with damping)
          state.Lx = (state.Lx + dOmegaX * I1) * (1 - DAMPING * 0.5);
          state.Ly = (state.Ly + dOmegaY * I2) * (1 - DAMPING * 0.5);
          state.Lz = (state.Lz + dOmegaZ * I3) * (1 - DAMPING * 0.5);

          // Recalculate ω
          omegaX = state.Lx / I1;
          omegaY = state.Ly / I2;
          omegaZ = state.Lz / I3;

          // Map to rotation planes
          // X rotation (around X axis) = YZ plane rotation
          // Y rotation (around Y axis) = XZ plane rotation
          // Z rotation (around Z axis) = XY plane rotation
          state.omegaYZ = omegaX;
          state.omegaXZ = omegaY;
          state.omegaXY = omegaZ;

          // Clamp tiny values
          if (Math.abs(state.Lx) < VELOCITY_EPSILON * I1) state.Lx = 0;
          if (Math.abs(state.Ly) < VELOCITY_EPSILON * I2) state.Ly = 0;
          if (Math.abs(state.Lz) < VELOCITY_EPSILON * I3) state.Lz = 0;

          // Integrate angles
          state.angleYZ += state.omegaYZ;
          state.angleXZ += state.omegaXZ;
          state.angleXY += state.omegaXY;
        }
      }

      // -----------------------------------------------------------------------
      // RENDERING
      // -----------------------------------------------------------------------

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const centerX = CANVAS_WIDTH / 2;
      const centerY = CANVAS_HEIGHT / 2;

      // Speed for visual effects
      const totalSpeed = shape.is4D
        ? Math.abs(state.omegaXZ) + Math.abs(state.omegaYZ) + Math.abs(state.omegaXW) + Math.abs(state.omegaYW)
        : Math.sqrt(state.Lx*state.Lx + state.Ly*state.Ly + state.Lz*state.Lz);
      const speedFactor = Math.min(1, totalSpeed / 0.12);

      // Transform vertices
      const projected: { x: number; y: number; z: number; w: number }[] = [];

      for (const v of shape.vertices) {
        let p = { ...v };

        if (shape.is4D) {
          // 4D rotations
          p = rotate4D(p, state.angleXW, 'xw');
          p = rotate4D(p, state.angleYW, 'yw');
          p = rotate4D(p, state.angleXZ, 'xz');
          p = rotate4D(p, state.angleYZ, 'yz');

          const p3 = project4Dto3D(p);
          const p2 = project3Dto2D(p3.x, p3.y, p3.z);
          projected.push({
            x: centerX + p2.x * RENDER_SCALE,
            y: centerY - p2.y * RENDER_SCALE,
            z: p2.z,
            w: p3.w,
          });
        } else {
          // 3D rotations
          p = rotate4D(p, state.angleXY, 'xy');
          p = rotate4D(p, state.angleXZ, 'xz');
          p = rotate4D(p, state.angleYZ, 'yz');

          const p2 = project3Dto2D(p.x, p.y, p.z);
          projected.push({
            x: centerX + p2.x * RENDER_SCALE,
            y: centerY - p2.y * RENDER_SCALE,
            z: p2.z,
            w: 0,
          });
        }
      }

      // Draw edges (no sorting - negligible visual impact, big perf win)
      ctx.lineCap = 'round';

      // Quantized hue bands (reduces shimmer, feels more designed)
      const speedBand = speedFactor < 0.33 ? 0 : speedFactor < 0.66 ? 1 : 2;
      const hueBase4D = [60, 180, 300][speedBand];
      const hueBase3D = [200, 240, 280][speedBand];
      const saturation = 70 + speedBand * 15;
      const lightness = 50 + speedBand * 10;

      // GLOW PASS - one save/restore for all edges
      ctx.save();
      ctx.shadowBlur = 10 + speedFactor * 15;
      ctx.lineWidth = 2;

      for (const edge of shape.edges) {
        const p1 = projected[edge.from];
        const p2 = projected[edge.to];
        const avgZ = (p1.z + p2.z) / 2;
        const avgW = (p1.w + p2.w) / 2;

        const alpha = shape.is4D
          ? 0.3 + (avgW + 1) * 0.35
          : 0.4 + (1 - avgZ) * 0.3;
        const hue = shape.is4D ? hueBase4D + avgW * 20 : hueBase3D;

        ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.5 + speedFactor * 0.5})`;
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();

      // MAIN PASS - no save/restore needed
      ctx.lineWidth = 2;
      for (const edge of shape.edges) {
        const p1 = projected[edge.from];
        const p2 = projected[edge.to];
        const avgZ = (p1.z + p2.z) / 2;
        const avgW = (p1.w + p2.w) / 2;

        const alpha = shape.is4D
          ? 0.3 + (avgW + 1) * 0.35
          : 0.4 + (1 - avgZ) * 0.3;
        const hue = shape.is4D ? hueBase4D + avgW * 20 : hueBase3D;

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw vertices - no per-vertex save/restore, no shadow (sharper, faster)
      const vertexSize = shape.is4D ? 4 : 2;
      const vertexHue4D = speedBand === 0 ? 180 : speedBand === 1 ? 200 : 220;
      const vertexHue3D = hueBase3D;

      for (const p of projected) {
        const size = vertexSize + (shape.is4D ? (p.w + 1) * 2 : (1 - p.z) * 2);
        const hue = shape.is4D ? (p.w > 0 ? vertexHue4D : vertexHue4D + 120) : vertexHue3D;

        ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
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

      // HUD
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = '#fff';
      ctx.fillText(shape.name.toUpperCase(), 24, 30);

      ctx.font = '11px system-ui';
      ctx.fillStyle = '#888';
      ctx.fillText(shape.is4D ? '4D Polytope' : '3D Rigid Body', 24, 46);

      if (!shape.is4D && shape.inertia.I1 !== shape.inertia.I2) {
        ctx.fillStyle = '#ffaa66';
        ctx.fillText('⚠ Dzhanibekov unstable', 24, 62);
      }

      ctx.font = '12px system-ui';
      ctx.fillStyle = '#88aacc';
      ctx.fillText('DRAG', 24, CANVAS_HEIGHT - 50);
      ctx.fillStyle = '#aaa';
      ctx.fillText(' → Spin', 58, CANVAS_HEIGHT - 50);

      ctx.fillStyle = '#ffaa66';
      ctx.fillText('TAP', 24, CANVAS_HEIGHT - 32);
      ctx.fillStyle = '#aaa';
      ctx.fillText(shape.is4D ? ' → 4D Flip' : ' → Kick', 50, CANVAS_HEIGHT - 32);
      ctx.restore();

      // Velocity meter
      const meterWidth = 200;
      const meterX = centerX - meterWidth / 2;
      const meterY = CANVAS_HEIGHT - 60;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(meterX, meterY, meterWidth, 4);

      const fillWidth = speedFactor * meterWidth;
      const meterHue = shape.is4D ? 30 + speedFactor * 290 : 200 + speedFactor * 100;
      ctx.fillStyle = `hsla(${meterHue}, 100%, 60%, 0.8)`;
      ctx.fillRect(meterX, meterY, fillWidth, 4);

      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('ANGULAR MOMENTUM', centerX, meterY + 18);
      ctx.restore();

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, project4Dto3D, project3Dto2D, shape]);

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

    state.isDragging = true;
    state.isHolding = true;
    state.holdStartTime = Date.now();
    state.dragStartX = x;
    state.dragStartY = y;
    state.lastMouseX = x;
    state.lastMouseY = y;
    state.lastMoveTime = Date.now();
    state.dragDistance = 0;
  }, [getCanvasCoords]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const state = physics.current;
    if (!state.isDragging) return;
    e.preventDefault();

    const { x, y } = getCanvasCoords(e);
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
        // For 3D, add to angular momentum
        state.Lx += dy * DRAG_SENSITIVITY * 0.5 * shape.inertia.I1;
        state.Ly += dx * DRAG_SENSITIVITY * 0.5 * shape.inertia.I2;
      }
    }

    state.lastMouseX = x;
    state.lastMouseY = y;
    state.lastMoveTime = now;
  }, [getCanvasCoords, shape]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const state = physics.current;
    const holdDuration = Date.now() - state.holdStartTime;
    const timeSinceLastMove = Date.now() - state.lastMoveTime;

    const isTap = state.dragDistance < TAP_MAX_DISTANCE && holdDuration < TAP_MAX_DURATION;
    const isFlick = state.dragDistance > TAP_MAX_DISTANCE && timeSinceLastMove < 50;

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
        // Kick - add perpendicular momentum to induce instability
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
    } else if (timeSinceLastMove > HOLD_THRESHOLD) {
      if (shape.is4D) {
        state.omegaXZ = 0;
        state.omegaYZ = 0;
      }
      // Don't kill L for 3D - let it keep spinning
    }

    state.isDragging = false;
    state.isHolding = false;
  }, [shape]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          maxWidth: CANVAS_WIDTH,
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
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

      {/* Shape selector */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        {(['tesseract', '16-cell', '24-cell', 'wrench', 'book'] as ShapeType[]).map((s) => (
          <button
            key={s}
            onClick={() => setShapeType(s)}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              shapeType === s
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {s === 'tesseract' ? '4D Tesseract' :
             s === '16-cell' ? '4D 16-Cell' :
             s === '24-cell' ? '4D 24-Cell' :
             s === 'wrench' ? '3D Wrench' :
             '3D Book'}
          </button>
        ))}
      </div>
    </div>
  );
}
