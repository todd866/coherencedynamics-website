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

type ShapeType = 'tesseract' | '16-cell' | '24-cell' | '4d-wrench';

interface Shape {
  vertices: Vec4[];
  edges: { from: number; to: number }[];
  faces?: number[][]; // For solid rendering - indices forming triangles/quads
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

  // Faces: tesseract has 24 square faces (8 cubic cells, 6 faces each, but shared)
  // Each face is defined by 4 vertices where 2 coords are fixed
  const faces: number[][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      for (let k = j + 1; k < 16; k++) {
        for (let l = k + 1; l < 16; l++) {
          // Check if these 4 vertices form a face (differ in exactly 2 coords)
          const v = [vertices[i], vertices[j], vertices[k], vertices[l]];
          const sameX = v.every(p => p.x === v[0].x);
          const sameY = v.every(p => p.y === v[0].y);
          const sameZ = v.every(p => p.z === v[0].z);
          const sameW = v.every(p => p.w === v[0].w);
          const fixedCount = (sameX ? 1 : 0) + (sameY ? 1 : 0) + (sameZ ? 1 : 0) + (sameW ? 1 : 0);
          if (fixedCount === 2) {
            faces.push([i, j, k, l]);
          }
        }
      }
    }
  }

  return { vertices, edges, faces, name: 'Tesseract' };
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

/**
 * 4D Wrench - A wrench extruded into 4D with asymmetric moments of inertia
 *
 * Structure:
 * - Handle: long thin rectangular prism (extends in x)
 * - Head: hexagonal opening (in y-z plane) at one end
 * - W dimension: thin for handle, thicker for head
 *
 * This creates I_x < I_y < I_z < I_w (all different) for Dzhanibekov effect
 */
function generate4DWrench(): Shape {
  const vertices: Vec4[] = [];
  const edges: { from: number; to: number }[] = [];

  // Handle dimensions: long in x, thin in y/z, very thin in w
  const handleLength = 1.8;
  const handleWidth = 0.25;
  const handleDepth = 0.15;
  const handleW = 0.1;

  // Head dimensions: shorter in x, thicker in w
  const headLength = 0.5;
  // headWidth and headDepth defined by hexRadius
  const headW = 0.35;

  // Hex opening parameters
  const hexRadius = 0.35;
  const hexInnerRadius = 0.2;

  // === HANDLE (box vertices) ===
  // 16 vertices for the 4D box handle
  const handleStartIdx = vertices.length;
  for (let i = 0; i < 16; i++) {
    const sx = (i & 1) ? 1 : -1;
    const sy = (i & 2) ? 1 : -1;
    const sz = (i & 4) ? 1 : -1;
    const sw = (i & 8) ? 1 : -1;
    vertices.push({
      x: -0.3 + sx * handleLength / 2,  // Offset handle to left
      y: sy * handleWidth / 2,
      z: sz * handleDepth / 2,
      w: sw * handleW / 2,
    });
  }

  // Handle edges (connect vertices differing by 1 bit)
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if (diff === 1 || diff === 2 || diff === 4 || diff === 8) {
        edges.push({ from: handleStartIdx + i, to: handleStartIdx + j });
      }
    }
  }

  // === HEAD (hexagonal prism extruded in w) ===
  // Outer hex ring + inner hex ring, at two w positions
  const headStartIdx = vertices.length;
  const headX = handleLength / 2 + headLength / 2 - 0.3;  // Position at end of handle

  // Generate hex vertices at two w levels
  for (let wLevel = 0; wLevel < 2; wLevel++) {
    const wPos = (wLevel === 0) ? -headW / 2 : headW / 2;

    // Outer hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      vertices.push({
        x: headX,
        y: Math.cos(angle) * hexRadius,
        z: Math.sin(angle) * hexRadius,
        w: wPos,
      });
    }

    // Inner hexagon (the opening)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6; // Offset by 30 degrees
      vertices.push({
        x: headX,
        y: Math.cos(angle) * hexInnerRadius,
        z: Math.sin(angle) * hexInnerRadius,
        w: wPos,
      });
    }
  }

  // Head edges
  // Connect outer hex at each w level
  for (let wLevel = 0; wLevel < 2; wLevel++) {
    const baseIdx = headStartIdx + wLevel * 12;
    // Outer ring
    for (let i = 0; i < 6; i++) {
      edges.push({ from: baseIdx + i, to: baseIdx + ((i + 1) % 6) });
    }
    // Inner ring
    for (let i = 0; i < 6; i++) {
      edges.push({ from: baseIdx + 6 + i, to: baseIdx + 6 + ((i + 1) % 6) });
    }
    // Connect outer to inner (spokes)
    for (let i = 0; i < 6; i++) {
      edges.push({ from: baseIdx + i, to: baseIdx + 6 + i });
      edges.push({ from: baseIdx + i, to: baseIdx + 6 + ((i + 5) % 6) });
    }
  }

  // Connect the two w levels
  for (let i = 0; i < 12; i++) {
    edges.push({ from: headStartIdx + i, to: headStartIdx + 12 + i });
  }

  // === Connect handle to head ===
  // Find handle vertices at the +x end and connect to head
  const handleEndVertices = [1, 3, 5, 7, 9, 11, 13, 15].map(i => handleStartIdx + i);

  // Connect to nearest head vertices
  for (const hv of handleEndVertices) {
    // Find closest head vertex
    let minDist = Infinity;
    let closest = headStartIdx;
    for (let i = headStartIdx; i < vertices.length; i++) {
      const dx = vertices[hv].x - vertices[i].x;
      const dy = vertices[hv].y - vertices[i].y;
      const dz = vertices[hv].z - vertices[i].z;
      const dw = vertices[hv].w - vertices[i].w;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    if (minDist < 1.0) {
      edges.push({ from: hv, to: closest });
    }
  }

  return { vertices, edges, name: '4D Wrench' };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CodeForming({ fullPage = false }: CodeFormingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [shapeType, setShapeType] = useState<ShapeType>('tesseract');

  const [renderMode, setRenderMode] = useState<'wireframe' | 'solid'>('wireframe');
  const [basinDepth, setBasinDepth] = useState(0.5); // 0 = free cycling, 1 = deep attractors

  // Track current symbolic state with hysteresis
  const symbolState = useRef({
    currentBase: 'A' as Base,
    baseStrength: 0, // How long we've been in this base
    baseCounts: { A: 0, C: 0, G: 0, T: 0 } as Record<Base, number>,
  });

  const shape = useMemo(() => {
    switch (shapeType) {
      case 'tesseract': return generateTesseract();
      case '16-cell': return generate16Cell();
      case '24-cell': return generate24Cell();
      case '4d-wrench': return generate4DWrench();
      default: return generateTesseract();
    }
  }, [shapeType]);

  // Compute shape asymmetry from moments of inertia
  // Returns 0 for perfectly symmetric, 1 for highly asymmetric
  const shapeAsymmetry = useMemo(() => {
    const verts = shape.vertices;
    // Compute second moments (proxy for inertia tensor eigenvalues)
    let Ix = 0, Iy = 0, Iz = 0, Iw = 0;
    for (const v of verts) {
      // Each moment sums squared distances from that axis
      Ix += v.y * v.y + v.z * v.z + v.w * v.w;
      Iy += v.x * v.x + v.z * v.z + v.w * v.w;
      Iz += v.x * v.x + v.y * v.y + v.w * v.w;
      Iw += v.x * v.x + v.y * v.y + v.z * v.z;
    }
    const moments = [Ix, Iy, Iz, Iw].sort((a, b) => a - b);
    const total = moments.reduce((s, m) => s + m, 0);
    if (total === 0) return 0;
    // Asymmetry: coefficient of variation of moments
    const mean = total / 4;
    const variance = moments.reduce((s, m) => s + (m - mean) ** 2, 0) / 4;
    const cv = Math.sqrt(variance) / mean;
    // Normalize to 0-1 range (cv typically 0-1 for these shapes)
    return Math.min(1, cv * 2);
  }, [shape]);

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
      // Draw faces (solid mode) or edges (wireframe mode)
      // -----------------------------------------------------------------------

      if (collapseFactor < 0.8) {
        if (renderMode === 'solid' && shape.faces) {
          // Sort faces by average Z for painter's algorithm
          const sortedFaces = [...shape.faces].map(face => {
            const avgZ = face.reduce((sum, idx) => sum + projected[idx].z, 0) / face.length;
            const avgW = face.reduce((sum, idx) => sum + projected[idx].w, 0) / face.length;
            return { face, avgZ, avgW };
          }).sort((a, b) => a.avgZ - b.avgZ);

          for (const { face, avgW } of sortedFaces) {
            const base = getBaseFromW(avgW);
            const color = BASE_COLORS[base];
            const alpha = (0.15 + (avgW + 1.5) * 0.15) * (1 - collapseFactor);

            // Need to sort face vertices for proper rendering
            // Find centroid and sort by angle
            const centroidX = face.reduce((s, i) => s + projected[i].x, 0) / face.length;
            const centroidY = face.reduce((s, i) => s + projected[i].y, 0) / face.length;
            const sorted = [...face].sort((a, b) => {
              const angleA = Math.atan2(projected[a].y - centroidY, projected[a].x - centroidX);
              const angleB = Math.atan2(projected[b].y - centroidY, projected[b].x - centroidX);
              return angleA - angleB;
            });

            ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.moveTo(projected[sorted[0]].x, projected[sorted[0]].y);
            for (let i = 1; i < sorted.length; i++) {
              ctx.lineTo(projected[sorted[i]].x, projected[sorted[i]].y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw edges on faces
            ctx.strokeStyle = color + Math.floor(alpha * 0.8 * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1 * SCALE;
            ctx.stroke();
          }
        } else {
          // Wireframe mode
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
      // Compute dominant base with attractor dynamics
      // -----------------------------------------------------------------------

      // Count bases in current projection
      const baseCounts = { A: 0, C: 0, G: 0, T: 0 };
      const baseWeights = { A: 0, C: 0, G: 0, T: 0 };
      projected.forEach(p => {
        baseCounts[p.base]++;
        // Weight by how "deep" in that quadrant (distance from boundary)
        const wNorm = (p.w + 1.5) / 3;
        const distFromBoundary = Math.min(wNorm % 0.25, 0.25 - (wNorm % 0.25)) * 4;
        baseWeights[p.base] += 1 - distFromBoundary;
      });

      // Effective basin depth = user control * shape asymmetry
      const effectiveBasinDepth = basinDepth * (0.3 + shapeAsymmetry * 0.7);

      // Find the instantaneous dominant base
      let maxWeight = 0;
      let instantBase: Base = 'A';
      for (const b of BASES) {
        if (baseWeights[b] > maxWeight) {
          maxWeight = baseWeights[b];
          instantBase = b;
        }
      }

      // Apply hysteresis based on basin depth
      const sym = symbolState.current;
      if (instantBase === sym.currentBase) {
        // Reinforce current state
        sym.baseStrength = Math.min(100, sym.baseStrength + 1 + effectiveBasinDepth * 3);
      } else {
        // Decay toward new state - slower with deeper basins
        const decayRate = 1 + (1 - effectiveBasinDepth) * 2;
        sym.baseStrength -= decayRate;
        if (sym.baseStrength <= 0) {
          sym.currentBase = instantBase;
          sym.baseStrength = 10;
        }
      }

      // Apply symbolic attractor force back to rotation (bidirectional coupling)
      if (collapseFactor > 0.3 && effectiveBasinDepth > 0.2) {
        const attractorStrength = effectiveBasinDepth * collapseFactor * 0.002;
        // Each base corresponds to a preferred W orientation
        const targetW: Record<Base, number> = { A: -1, C: -0.33, G: 0.33, T: 1 };
        const target = targetW[sym.currentBase];

        // Nudge rotation toward attractor
        const currentAvgW = projected.reduce((s, p) => s + p.w, 0) / projected.length;
        const wError = target - currentAvgW;
        state.omegaXW += wError * attractorStrength;
        state.omegaYW += wError * attractorStrength * 0.5;
      }

      // -----------------------------------------------------------------------
      // At high collapse, show dominant letter
      // -----------------------------------------------------------------------

      if (collapseFactor > 0.7) {
        const dominantBase = sym.currentBase;
        const color = BASE_COLORS[dominantBase];
        const stability = sym.baseStrength / 100;

        ctx.save();
        const fontSize = 80 + collapseFactor * 100 + stability * 50;
        ctx.font = `bold ${fontSize * SCALE}px monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.min(1, (collapseFactor - 0.7) * 3 * (0.5 + stability * 0.5));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = (20 + stability * 30) * SCALE;
        ctx.fillText(dominantBase, centerX, centerY);
        ctx.restore();

        // Show stability indicator
        ctx.fillStyle = '#444';
        ctx.font = `${10 * SCALE}px monospace`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = (collapseFactor - 0.7) * 3;
        ctx.fillText(`stability: ${(stability * 100).toFixed(0)}%`, centerX, centerY + 80 * SCALE);
        ctx.globalAlpha = 1;
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

        const shapes: ShapeType[] = ['tesseract', '16-cell', '24-cell', '4d-wrench'];
        const shapeLabels = ['Tesseract', '16-Cell', '24-Cell', '4D Wrench'];
        const btnWidth = 75 * SCALE;

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

        // Render mode toggle (right side)
        const renderModeX = W - padding - 140 * SCALE;
        ctx.fillStyle = '#555';
        ctx.font = `${9 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('RENDER', renderModeX, panelY);

        const modes: ('wireframe' | 'solid')[] = ['wireframe', 'solid'];
        const modeLabels = ['Wire', 'Solid'];
        const modeBtnWidth = 65 * SCALE;

        modes.forEach((m, i) => {
          const bx = renderModeX + i * modeBtnWidth;
          const by = panelY + 8 * SCALE;
          const isActive = renderMode === m;

          ctx.fillStyle = isActive ? '#3b82f6' : '#1a1a1a';
          ctx.beginPath();
          ctx.roundRect(bx, by, modeBtnWidth - 8 * SCALE, 22 * SCALE, 4 * SCALE);
          ctx.fill();

          if (!isActive) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.fillStyle = isActive ? '#fff' : '#777';
          ctx.font = `${9 * SCALE}px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText(modeLabels[i], bx + (modeBtnWidth - 8 * SCALE) / 2, by + 14 * SCALE);
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

      // -----------------------------------------------------------------------
      // Basin Depth Slider (fullPage only)
      // -----------------------------------------------------------------------

      if (fullPage) {
        const basinY = dimSliderY + dimSliderH + 36 * SCALE;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${10 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('ATTRACTOR BASIN DEPTH', padding, basinY);

        // Show effective depth (includes shape asymmetry)
        const effectiveDepth = basinDepth * (0.3 + shapeAsymmetry * 0.7);
        ctx.fillStyle = effectiveDepth > 0.5 ? '#f472b6' : '#94a3b8';
        ctx.textAlign = 'right';
        ctx.font = `bold ${9 * SCALE}px monospace`;
        const depthLabel = effectiveDepth < 0.3 ? 'CYCLING' :
                          effectiveDepth < 0.6 ? 'METASTABLE' : 'LOCKED';
        ctx.fillText(`${depthLabel} (${(effectiveDepth * 100).toFixed(0)}%)`, W - padding, basinY);

        const basinSliderY = basinY + 14 * SCALE;

        // Track
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(dimSliderX, basinSliderY, dimSliderW, dimSliderH, 6 * SCALE);
        ctx.fill();

        // Fill
        const basinGradient = ctx.createLinearGradient(dimSliderX, 0, dimSliderX + dimSliderW, 0);
        basinGradient.addColorStop(0, '#64748b');
        basinGradient.addColorStop(0.5, '#a855f7');
        basinGradient.addColorStop(1, '#f472b6');
        ctx.fillStyle = basinGradient;
        ctx.beginPath();
        ctx.roundRect(dimSliderX, basinSliderY, basinDepth * dimSliderW, dimSliderH, 6 * SCALE);
        ctx.fill();

        // Handle
        const basinHandleX = dimSliderX + basinDepth * dimSliderW;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(basinHandleX, basinSliderY + dimSliderH / 2, 10 * SCALE, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = effectiveDepth > 0.5 ? '#f472b6' : '#a855f7';
        ctx.lineWidth = 3 * SCALE;
        ctx.stroke();

        // Labels
        ctx.font = `${8 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.fillText('FREE CYCLING', dimSliderX, basinSliderY + dimSliderH + 14 * SCALE);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#f472b6';
        ctx.fillText('DEEP ATTRACTORS', dimSliderX + dimSliderW, basinSliderY + dimSliderH + 14 * SCALE);

        // Shape asymmetry indicator
        ctx.fillStyle = '#555';
        ctx.font = `${8 * SCALE}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`shape asymmetry: ${(shapeAsymmetry * 100).toFixed(0)}%`, dimSliderX + dimSliderW / 2, basinSliderY + dimSliderH + 14 * SCALE);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, getBaseFromW, shape, shapeType, renderMode, basinDepth, shapeAsymmetry, W, H, VIEW_HEIGHT, RENDER_SCALE, fullPage]);

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
      const btnWidth = 75 * SCALE;
      if (y >= btnY && y <= btnY + 22 * SCALE) {
        // Check shape buttons
        const shapes: ShapeType[] = ['tesseract', '16-cell', '24-cell', '4d-wrench'];
        for (let i = 0; i < shapes.length; i++) {
          const bx = padding + i * btnWidth;
          if (x >= bx && x <= bx + btnWidth - 8 * SCALE) {
            setShapeType(shapes[i]);
            return;
          }
        }

        // Check render mode buttons
        const renderModeX = W - padding - 140 * SCALE;
        const modeBtnWidth = 65 * SCALE;
        const modes: ('wireframe' | 'solid')[] = ['wireframe', 'solid'];
        for (let i = 0; i < modes.length; i++) {
          const bx = renderModeX + i * modeBtnWidth;
          if (x >= bx && x <= bx + modeBtnWidth - 8 * SCALE) {
            setRenderMode(modes[i]);
            return;
          }
        }
      }
    }

    // Dimensionality slider
    const dimY = fullPage ? panelY + 42 * SCALE + 14 * SCALE : panelY + 14 * SCALE;
    const dimSliderW = W - padding * 2;
    const dimSliderH = 12 * SCALE;
    if (y >= dimY - 15 * SCALE && y <= dimY + 30 * SCALE) {
      state.isDragging = true;
      state.activeControl = 'dim';
      const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
      state.observerDim = 2.0 + norm * 2.0;
      return;
    }

    // Basin depth slider (fullPage only)
    if (fullPage) {
      const basinSliderY = dimY + dimSliderH + 36 * SCALE + 14 * SCALE;
      if (y >= basinSliderY - 15 * SCALE && y <= basinSliderY + 30 * SCALE) {
        state.isDragging = true;
        state.activeControl = 'basin';
        const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
        setBasinDepth(norm);
        return;
      }
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
    } else if (state.activeControl === 'basin') {
      const dimSliderW = W - padding * 2;
      const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
      setBasinDepth(norm);
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
