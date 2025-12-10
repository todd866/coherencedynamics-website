'use client';

/**
 * ObserverDemo - "Dimensional Collapse + Noise"
 *
 * A TRUE 4D Tesseract (hypercube) projected to 3D.
 * - 16 vertices in (x, y, z, w) space
 * - Direct drag on tesseract to rotate through 4D planes
 * - Slider controls for rotation speeds
 *
 * INTERACTION:
 * - Drag on the tesseract to rotate through 4D
 * - Use sliders to set continuous rotation speeds
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';

interface ObserverDemoProps {
  fullPage?: boolean;
}

const COLORS = {
  BG: '#000000',
  XW: '#ef4444', // Red
  YW: '#22c55e', // Green
  ZW: '#3b82f6', // Blue
  EDGE: 'rgba(100, 100, 100, 0.5)',
  VERTEX: '#ffffff',
  TEXT: '#94a3b8',
};

// 4D Vector
interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export default function ObserverDemo({ fullPage = false }: ObserverDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    time: 0,
    // 4D rotation angles
    xwAngle: 0,
    ywAngle: 0,
    zwAngle: 0,
    // Rotation speeds (controlled by sliders)
    xwSpeed: 0.3,
    ywSpeed: 0.0,
    zwSpeed: 0.0,
    // 4D noise intensity (perturbs W dimension before projection)
    noiseIntensity: 0.0,
    // 3D camera rotation
    cameraAngle: 0,
    // Drag state for tesseract
    isDraggingTesseract: false,
    lastMouseX: 0,
    lastMouseY: 0,
    // Drag state for sliders
    isDraggingSlider: null as string | null,
  });

  // Full page mode uses larger dimensions
  const SCALE = 2;
  const BASE_W = fullPage ? 900 : 700;
  const BASE_H = fullPage ? 700 : 500;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;

  // Layout: top 75% for 3D, bottom 25% for controls
  const VIEW_HEIGHT = H * 0.75;
  const CONTROL_HEIGHT = H * 0.25;

  // Generate tesseract vertices: all combinations of ±1 in 4D
  const tesseractVertices: Vec4[] = useMemo(() => {
    const verts: Vec4[] = [];
    for (let i = 0; i < 16; i++) {
      verts.push({
        x: (i & 1) ? 1 : -1,
        y: (i & 2) ? 1 : -1,
        z: (i & 4) ? 1 : -1,
        w: (i & 8) ? 1 : -1,
      });
    }
    return verts;
  }, []);

  // Find edges: vertices that differ by exactly 1 coordinate
  const edges: [number, number][] = useMemo(() => {
    const e: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const v1 = tesseractVertices[i];
        const v2 = tesseractVertices[j];
        let diff = 0;
        if (v1.x !== v2.x) diff++;
        if (v1.y !== v2.y) diff++;
        if (v1.z !== v2.z) diff++;
        if (v1.w !== v2.w) diff++;
        if (diff === 1) e.push([i, j]);
      }
    }
    return e;
  }, [tesseractVertices]);

  // 4D rotation in a plane
  const rotate4D = useCallback((v: Vec4, angle: number, plane: string): Vec4 => {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const result = { ...v };

    if (plane === 'xw') {
      result.x = v.x * c - v.w * s;
      result.w = v.x * s + v.w * c;
    } else if (plane === 'yw') {
      result.y = v.y * c - v.w * s;
      result.w = v.y * s + v.w * c;
    } else if (plane === 'zw') {
      result.z = v.z * c - v.w * s;
      result.w = v.z * s + v.w * c;
    }
    return result;
  }, []);

  // 4D → 3D stereographic projection
  const project4Dto3D = useCallback((v: Vec4): { x: number; y: number; z: number; depth: number } => {
    const distance = 3;
    const scale = 1 / (distance - v.w);
    return {
      x: v.x * scale,
      y: v.y * scale,
      z: v.z * scale,
      depth: v.w,
    };
  }, []);

  // 3D → 2D perspective projection with camera rotation
  const project3Dto2D = useCallback(
    (x: number, y: number, z: number, cameraAngle: number): { x: number; y: number; scale: number } => {
      // Rotate around Y axis
      const rx = x * Math.cos(cameraAngle) - z * Math.sin(cameraAngle);
      const rz = x * Math.sin(cameraAngle) + z * Math.cos(cameraAngle);

      const fov = 4;
      const scale = fov / (fov + rz + 2);
      return {
        x: rx * scale,
        y: y * scale,
        scale,
      };
    },
    []
  );

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      const state = stateRef.current;

      // Update physics
      state.time += 0.016;
      state.xwAngle += state.xwSpeed * 0.02;
      state.ywAngle += state.ywSpeed * 0.02;
      state.zwAngle += state.zwSpeed * 0.02;
      if (!state.isDraggingTesseract) {
        state.cameraAngle += 0.003; // Slow auto-rotate when not dragging
      }

      // Clear
      ctx.fillStyle = COLORS.BG;
      ctx.fillRect(0, 0, W, H);

      // Divider line
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, VIEW_HEIGHT);
      ctx.lineTo(W, VIEW_HEIGHT);
      ctx.stroke();

      // --- TITLE ---
      ctx.fillStyle = '#eee';
      ctx.font = `bold ${18 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('4D Tesseract Shadow', 20 * SCALE, 30 * SCALE);
      ctx.fillStyle = '#666';
      ctx.font = `${12 * SCALE}px system-ui`;
      ctx.fillText('Drag the tesseract to rotate through 4D', 20 * SCALE, 50 * SCALE);

      // --- RENDER 3D VIEW ---
      const centerX = W / 2;
      const centerY = VIEW_HEIGHT / 2;
      const renderScale = (fullPage ? 120 : 80) * SCALE;

      // Transform all vertices
      const projected: { x: number; y: number; scale: number; depth: number }[] = [];
      for (const v of tesseractVertices) {
        // Apply 4D rotations
        let p = { ...v };
        p = rotate4D(p, state.xwAngle, 'xw');
        p = rotate4D(p, state.ywAngle, 'yw');
        p = rotate4D(p, state.zwAngle, 'zw');

        // Apply 4D NOISE - perturb W dimension before projection
        // This proves that "unseen" noise in 4D causes visible 3D distortion
        if (state.noiseIntensity > 0.001) {
          const jitterW = (Math.random() - 0.5) * state.noiseIntensity * 2.0;
          p.w += jitterW;
        }

        // 4D → 3D
        const p3 = project4Dto3D(p);

        // 3D → 2D
        const p2 = project3Dto2D(p3.x, p3.y, p3.z, state.cameraAngle);
        projected.push({
          x: centerX + p2.x * renderScale,
          y: centerY - p2.y * renderScale, // flip Y
          scale: p2.scale,
          depth: p3.depth,
        });
      }

      // Draw edges
      ctx.lineWidth = 1.5 * SCALE;
      for (const [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];

        // Fade edges based on 4D depth
        const avgDepth = (tesseractVertices[i].w + tesseractVertices[j].w) / 2;
        const alpha = 0.2 + (avgDepth + 1) * 0.3;
        ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw vertices
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const v = tesseractVertices[i];

        // Size based on 4D depth (closer in 4D = bigger)
        const size = (3 + v.w) * 2 * SCALE;

        // Color based on 4D depth
        const brightness = Math.floor(150 + (v.w + 1) * 50);
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(2, size), 0, Math.PI * 2);
        ctx.fill();
      }

      // --- RENDER SLIDER CONTROLS ---
      const sliderY = VIEW_HEIGHT + CONTROL_HEIGHT / 2;
      const sliderWidth = (W - 120 * SCALE) / 4; // Now 4 sliders
      const sliderHeight = 8 * SCALE;
      const handleRadius = 10 * SCALE;

      const sliders = [
        { key: 'xw', label: 'XW Rotation', color: COLORS.XW, value: state.xwSpeed, max: 2 },
        { key: 'yw', label: 'YW Rotation', color: COLORS.YW, value: state.ywSpeed, max: 2 },
        { key: 'zw', label: 'ZW Rotation', color: COLORS.ZW, value: state.zwSpeed, max: 2 },
        { key: 'noise', label: '4D Noise', color: '#f59e0b', value: state.noiseIntensity, max: 1 },
      ];

      sliders.forEach((slider, index) => {
        const sliderX = 20 * SCALE + index * (sliderWidth + 15 * SCALE);

        // Label
        ctx.fillStyle = slider.color;
        ctx.font = `bold ${12 * SCALE}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText(slider.label, sliderX, sliderY - 25 * SCALE);

        // Value display
        ctx.fillStyle = '#888';
        ctx.font = `${10 * SCALE}px system-ui`;
        ctx.textAlign = 'right';
        ctx.fillText(`${slider.value.toFixed(2)}`, sliderX + sliderWidth, sliderY - 25 * SCALE);

        // Track background
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(sliderX, sliderY - sliderHeight / 2, sliderWidth, sliderHeight, sliderHeight / 2);
        ctx.fill();

        // Track fill
        const fillWidth = (slider.value / slider.max) * sliderWidth;
        ctx.fillStyle = slider.color;
        ctx.beginPath();
        ctx.roundRect(sliderX, sliderY - sliderHeight / 2, fillWidth, sliderHeight, sliderHeight / 2);
        ctx.fill();

        // Handle
        const handleX = sliderX + fillWidth;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(handleX, sliderY, handleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Handle border
        ctx.strokeStyle = slider.color;
        ctx.lineWidth = 2 * SCALE;
        ctx.beginPath();
        ctx.arc(handleX, sliderY, handleRadius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Instructions
      ctx.fillStyle = '#555';
      ctx.font = `${11 * SCALE}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('Drag sliders to control 4D rotation speeds', W / 2, VIEW_HEIGHT + CONTROL_HEIGHT - 15 * SCALE);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotate4D, project4Dto3D, project3Dto2D, tesseractVertices, edges, W, H, VIEW_HEIGHT, CONTROL_HEIGHT, fullPage]);

  // --- INTERACTION ---
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

  const getSliderAtPoint = useCallback((x: number, y: number): string | null => {
    const sliderY = VIEW_HEIGHT + CONTROL_HEIGHT / 2;
    const sliderWidth = (W - 120 * SCALE) / 4; // Now 4 sliders
    const hitRadius = 30 * SCALE;

    // Check if near slider area
    if (Math.abs(y - sliderY) > hitRadius) return null;

    const sliders = ['xw', 'yw', 'zw', 'noise'];
    for (let i = 0; i < 4; i++) {
      const sliderX = 20 * SCALE + i * (sliderWidth + 15 * SCALE);
      if (x >= sliderX - hitRadius && x <= sliderX + sliderWidth + hitRadius) {
        return sliders[i];
      }
    }
    return null;
  }, [W, VIEW_HEIGHT, CONTROL_HEIGHT]);

  const handleStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);

      // Check if clicking on slider
      const slider = getSliderAtPoint(x, y);
      if (slider) {
        stateRef.current.isDraggingSlider = slider;
        // Update slider value immediately
        const sliderWidth = (W - 120 * SCALE) / 4;
        const sliders = ['xw', 'yw', 'zw', 'noise'];
        const index = sliders.indexOf(slider);
        const sliderX = 20 * SCALE + index * (sliderWidth + 15 * SCALE);
        const maxVal = slider === 'noise' ? 1 : 2;
        const value = Math.max(0, Math.min(maxVal, (x - sliderX) / sliderWidth * maxVal));

        if (slider === 'xw') stateRef.current.xwSpeed = value;
        else if (slider === 'yw') stateRef.current.ywSpeed = value;
        else if (slider === 'zw') stateRef.current.zwSpeed = value;
        else if (slider === 'noise') stateRef.current.noiseIntensity = value;
      } else if (y < VIEW_HEIGHT) {
        // Clicking on tesseract area
        stateRef.current.isDraggingTesseract = true;
        stateRef.current.lastMouseX = x;
        stateRef.current.lastMouseY = y;
      }
    },
    [getCanvasCoords, getSliderAtPoint, W, VIEW_HEIGHT]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      const state = stateRef.current;

      if (state.isDraggingSlider) {
        // Update slider value
        const sliderWidth = (W - 120 * SCALE) / 4;
        const sliders = ['xw', 'yw', 'zw', 'noise'];
        const index = sliders.indexOf(state.isDraggingSlider);
        const sliderX = 20 * SCALE + index * (sliderWidth + 15 * SCALE);
        const maxVal = state.isDraggingSlider === 'noise' ? 1 : 2;
        const value = Math.max(0, Math.min(maxVal, (x - sliderX) / sliderWidth * maxVal));

        if (state.isDraggingSlider === 'xw') state.xwSpeed = value;
        else if (state.isDraggingSlider === 'yw') state.ywSpeed = value;
        else if (state.isDraggingSlider === 'zw') state.zwSpeed = value;
        else if (state.isDraggingSlider === 'noise') state.noiseIntensity = value;
      } else if (state.isDraggingTesseract) {
        // Rotate tesseract based on drag
        const dx = x - state.lastMouseX;
        const dy = y - state.lastMouseY;

        // Horizontal drag = XW rotation, Vertical drag = YW rotation
        state.xwAngle += dx * 0.003;
        state.ywAngle += dy * 0.003;

        state.lastMouseX = x;
        state.lastMouseY = y;
      }
    },
    [getCanvasCoords, W]
  );

  const handleEnd = useCallback(() => {
    stateRef.current.isDraggingTesseract = false;
    stateRef.current.isDraggingSlider = null;
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
