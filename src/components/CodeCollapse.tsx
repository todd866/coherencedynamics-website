'use client';

/**
 * CodeCollapse - "From Hypercube to Syntax"
 *
 * CONCEPT:
 * - 4D Object (The Idea) -> Rotating Tesseract
 * - 3D Projection (The World) -> Point Cloud of characters
 * - 2D Collapse (The Code) -> ASCII Grid snapping to rows
 *
 * INTERACTION:
 * - "Collapse" Slider: Crushes the Z-axis.
 * When Z is 0 (Fully collapsed), the chaotic particles form flat "lines of text".
 *
 * This visualizes that "Code is just a flattened, limited slice of a much more
 * complex geometric reality."
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';

// === CONFIG ===
const FONT_SIZE = 14;
const GRID_SPACING = 14;
const CHARS = '01xyz{}[]<>/;:=+*#@&|~^';

interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface CodeCollapseProps {
  fullPage?: boolean;
}

export default function CodeCollapse({ fullPage = false }: CodeCollapseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    angleXW: 0,
    angleYW: 0,
    angleZW: 0,
    collapse: 0.0, // 0 = Full 3D, 1 = Flat 2D (Code mode)
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    isDraggingSlider: false,
  });

  const SCALE = 2;
  const BASE_W = fullPage ? 900 : 700;
  const BASE_H = fullPage ? 650 : 500;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;

  // Layout
  const VIEW_HEIGHT = H * 0.85;
  const CONTROL_HEIGHT = H * 0.15;

  // Generate tesseract vertices with interpolated edge points
  const particles = useMemo(() => {
    const verts: Vec4[] = [];
    const baseVerts: Vec4[] = [];

    // Generate 16 corners
    for (let i = 0; i < 16; i++) {
      baseVerts.push({
        x: (i & 1) ? 1 : -1,
        y: (i & 2) ? 1 : -1,
        z: (i & 4) ? 1 : -1,
        w: (i & 8) ? 1 : -1,
      });
    }

    // Interpolate points along edges to create "strings" of code
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const v1 = baseVerts[i];
        const v2 = baseVerts[j];

        // Check if edge exists (differs by 1 dimension)
        let diff = 0;
        if (v1.x !== v2.x) diff++;
        if (v1.y !== v2.y) diff++;
        if (v1.z !== v2.z) diff++;
        if (v1.w !== v2.w) diff++;

        if (diff === 1) {
          // Add interpolated points (The "Characters" on the line)
          const segments = 8;
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
    return verts;
  }, []);

  // 4D rotation
  const rotate4D = useCallback((v: Vec4, angXW: number, angYW: number, angZW: number): Vec4 => {
    let { x, y, z, w } = v;

    // Rotate XW
    let s = Math.sin(angXW), c = Math.cos(angXW);
    const nx = x * c - w * s;
    let nw = x * s + w * c;
    x = nx; w = nw;

    // Rotate YW
    s = Math.sin(angYW); c = Math.cos(angYW);
    const ny = y * c - w * s;
    nw = y * s + w * c;
    y = ny; w = nw;

    // Rotate ZW
    s = Math.sin(angZW); c = Math.cos(angZW);
    const nz = z * c - w * s;
    nw = z * s + w * c;
    z = nz; w = nw;

    return { x, y, z, w };
  }, []);

  // Project 4D -> 2D with collapse
  const project = useCallback((v: Vec4, collapse: number) => {
    // 1. 4D -> 3D Projection (Perspective from W)
    const distance = 3;
    const invW = 1 / (distance - v.w);

    let px = v.x * invW;
    let py = v.y * invW;
    let pz = v.z * invW;

    // 2. DIMENSIONAL COLLAPSE (The Key Mechanic)
    // As collapse -> 1, Z approaches 0.
    // Also "quantize" Y to simulate lines of code forming
    if (collapse > 0.1) {
      pz = pz * (1 - collapse); // Flatten depth

      // Snap Y to "Text Lines" as we collapse
      const lineSnapStrength = collapse * collapse; // Exponential snap
      const rowHeight = 0.12;
      const snappedY = Math.round(py / rowHeight) * rowHeight;
      py = py * (1 - lineSnapStrength) + snappedY * lineSnapStrength;

      // Also snap X to character grid when highly collapsed
      if (collapse > 0.7) {
        const charWidth = 0.08;
        const charSnapStrength = (collapse - 0.7) / 0.3;
        const snappedX = Math.round(px / charWidth) * charWidth;
        px = px * (1 - charSnapStrength) + snappedX * charSnapStrength;
      }
    }

    // 3. 3D -> 2D Screen
    const fov = 600;
    const scale = fov / (fov - pz * 200);

    return {
      x: px * scale * 200 + W / 2,
      y: py * scale * 200 + VIEW_HEIGHT / 2,
      scale: scale,
      depth: pz,
    };
  }, [W, VIEW_HEIGHT]);

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;
      const { angleXW, angleYW, angleZW, collapse } = state;

      // Auto-rotate (slower when collapsed)
      const rotationSpeed = 1 - collapse * 0.8;
      if (!state.isDragging) {
        state.angleXW += 0.005 * rotationSpeed;
        state.angleYW += 0.003 * rotationSpeed;
        state.angleZW += 0.002 * rotationSpeed;
      }

      // Clear (Matrix Green / Dark Mode)
      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, W, H);

      // Title
      ctx.fillStyle = '#22c55e';
      ctx.font = `bold ${18 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('Dimensional Collapse → Code', 20 * SCALE, 30 * SCALE);
      ctx.fillStyle = '#555';
      ctx.font = `${12 * SCALE}px system-ui`;
      ctx.fillText('Drag the visualization • Use slider to collapse dimensions', 20 * SCALE, 50 * SCALE);

      // Divider
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, VIEW_HEIGHT);
      ctx.lineTo(W, VIEW_HEIGHT);
      ctx.stroke();

      // Render Particles as CHARACTERS
      ctx.font = `${FONT_SIZE * SCALE}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Sort by depth for proper layering
      const projectedParticles = particles.map((p, i) => {
        const rotP = rotate4D(p, angleXW, angleYW, angleZW);
        const proj = project(rotP, collapse);
        return { ...proj, index: i, original: p };
      });

      projectedParticles.sort((a, b) => a.depth - b.depth);

      projectedParticles.forEach(({ x, y, depth, index }) => {
        // Pick a character based on "hash" of index + time
        const charIndex = (index + Math.floor(Date.now() / 150)) % CHARS.length;
        const char = CHARS[charIndex];

        // Opacity based on depth (or constant if collapsed)
        const depthAlpha = Math.max(0.15, 1 - Math.abs(depth) * 0.8);
        const finalAlpha = depthAlpha * (1 - collapse) + 0.95 * collapse;

        // Color Shift: Cyan/Blue (Space) -> Green (Code)
        const r = Math.floor(50 * (1 - collapse));
        const g = Math.floor(200 + 55 * collapse);
        const b = Math.floor(255 * (1 - collapse * 0.7));

        ctx.fillStyle = `rgba(${r},${g},${b}, ${finalAlpha})`;

        // If fully collapsed, force monospace grid alignment
        let dx = x;
        let dy = y;

        if (collapse > 0.8) {
          dx = Math.round(x / (GRID_SPACING * SCALE)) * (GRID_SPACING * SCALE);
          dy = Math.round(y / (GRID_SPACING * SCALE * 1.2)) * (GRID_SPACING * SCALE * 1.2);
        }

        ctx.fillText(char, dx, dy);
      });

      // Mode indicator
      const modeText = collapse < 0.3 ? '4D HYPERCUBE' :
                       collapse < 0.7 ? '3D PROJECTION' :
                       'LINEAR CODE';
      ctx.fillStyle = collapse < 0.5 ? '#3b82f6' : '#22c55e';
      ctx.font = `bold ${14 * SCALE}px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText(modeText, W - 20 * SCALE, 30 * SCALE);

      // --- SLIDER CONTROL ---
      const sliderY = VIEW_HEIGHT + CONTROL_HEIGHT / 2;
      const sliderX = 100 * SCALE;
      const sliderWidth = W - 200 * SCALE;
      const sliderHeight = 10 * SCALE;
      const handleRadius = 14 * SCALE;

      // Labels
      ctx.fillStyle = '#3b82f6';
      ctx.font = `bold ${12 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('SPATIAL (3D/4D)', sliderX, sliderY - 25 * SCALE);

      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'right';
      ctx.fillText('LINEAR (2D CODE)', sliderX + sliderWidth, sliderY - 25 * SCALE);

      // Track background
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(sliderX, sliderY - sliderHeight / 2, sliderWidth, sliderHeight, sliderHeight / 2);
      ctx.fill();

      // Gradient fill
      const gradient = ctx.createLinearGradient(sliderX, 0, sliderX + sliderWidth, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#22c55e');

      const fillWidth = collapse * sliderWidth;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(sliderX, sliderY - sliderHeight / 2, fillWidth, sliderHeight, sliderHeight / 2);
      ctx.fill();

      // Handle
      const handleX = sliderX + fillWidth;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(handleX, sliderY, handleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Handle glow
      const handleColor = collapse < 0.5 ? '#3b82f6' : '#22c55e';
      ctx.strokeStyle = handleColor;
      ctx.lineWidth = 3 * SCALE;
      ctx.beginPath();
      ctx.arc(handleX, sliderY, handleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Percentage
      ctx.fillStyle = '#888';
      ctx.font = `${11 * SCALE}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(collapse * 100)}% collapsed`, W / 2, sliderY + 30 * SCALE);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [particles, project, rotate4D, W, H, VIEW_HEIGHT, CONTROL_HEIGHT]);

  // Interaction handlers
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

      // Check if clicking on slider
      const sliderY = VIEW_HEIGHT + CONTROL_HEIGHT / 2;
      const sliderX = 100 * SCALE;
      const sliderWidth = W - 200 * SCALE;

      if (Math.abs(y - sliderY) < 30 * SCALE && x >= sliderX - 20 * SCALE && x <= sliderX + sliderWidth + 20 * SCALE) {
        state.isDraggingSlider = true;
        state.collapse = Math.max(0, Math.min(1, (x - sliderX) / sliderWidth));
      } else if (y < VIEW_HEIGHT) {
        state.isDragging = true;
        state.lastMouseX = x;
        state.lastMouseY = y;
      }
    },
    [getCanvasCoords, W, VIEW_HEIGHT, CONTROL_HEIGHT]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const state = stateRef.current;

      if (state.isDraggingSlider) {
        const sliderX = 100 * SCALE;
        const sliderWidth = W - 200 * SCALE;
        state.collapse = Math.max(0, Math.min(1, (x - sliderX) / sliderWidth));
      } else if (state.isDragging) {
        const dx = x - state.lastMouseX;
        const dy = y - state.lastMouseY;

        state.angleXW += dx * 0.003;
        state.angleYW += dy * 0.003;

        state.lastMouseX = x;
        state.lastMouseY = y;
      }
    },
    [getCanvasCoords, W]
  );

  const handleEnd = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.isDraggingSlider = false;
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
