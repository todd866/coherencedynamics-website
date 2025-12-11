'use client';

/**
 * CodeCollapse - Fluid Physics Edition
 *
 * FEATURES:
 * 1. SPRING PHYSICS: Dimension slider has mass/inertia - drags through phases smoothly
 * 2. CONTINUOUS BLENDING: All modes mix based on weighted opacity (no if/else switches)
 * 3. CORRECT ROTATION ORDER: 3D orientation first, then 4D inside-out last
 * 4. MOBILE HARDENED: Context menu, touch selection blocked
 */

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

const CHARS = '01λφψ{}[]<>∂∫∑∏xyz=+-*/#@&|~^:;';
const DNA = 'ACGT';  // 4-letter code for singularity

interface Vec4 { x: number; y: number; z: number; w: number; }

interface CodeCollapseProps {
  fullPage?: boolean;
}

// Shape Generator - Tesseract vertices + volumetric dust
const generateTesseract = (): Vec4[] => {
  const verts: Vec4[] = [];
  // Structural vertices (16 hypercube corners)
  for (let i = 0; i < 16; i++) {
    verts.push({
      x: (i & 1) ? 1 : -1,
      y: (i & 2) ? 1 : -1,
      z: (i & 4) ? 1 : -1,
      w: (i & 8) ? 1 : -1
    });
  }
  // Volumetric filler (the "dust")
  for (let i = 0; i < 300; i++) {
    const r = () => (Math.random() - 0.5) * 2.2;
    verts.push({ x: r(), y: r(), z: r(), w: r() });
  }
  return verts;
};

export default function CodeCollapse({}: CodeCollapseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // UI State - where user wants to go
  const [targetDim, setTargetDim] = useState(4.0);

  // Physics State (Refs for speed)
  const stateRef = useRef({
    time: 0,
    // Rotation angles
    xwAngle: 0, ywAngle: 0, zwAngle: 0,
    // Rotation velocities
    xwVel: 0.02, ywVel: 0, zwVel: 0,

    // Dimensional spring physics
    currentDim: 4.0,  // Actual value used for rendering (lags behind target)
    dimVel: 0,        // Velocity of dimension transition

    // Interaction
    isDragging: false,
    isHolding: false,
    lastX: 0, lastY: 0,
    dragStartTime: 0,
    holdStartTime: 0,
    dragDistance: 0,

    // Tap visuals
    tapX: 0, tapY: 0, lastTapTime: 0,
  });

  const W = 1600;
  const H = 900;

  const particles = useMemo(() => generateTesseract(), []);

  // 4D Rotation - ORDER MATTERS!
  // 3D orientation first, then 4D inside-out last for clean hypercube inversion
  const rotate4D = useCallback((v: Vec4, xw: number, yw: number, zw: number): Vec4 => {
    let { x, y, z, w } = v;

    // STEP 1: 3D rotations (establishes view orientation)
    // XZ rotation (yaw - horizontal spin from drag)
    let c = Math.cos(yw), s = Math.sin(yw);
    let nx = x * c - z * s;
    let nz = x * s + z * c;
    x = nx; z = nz;

    // YZ rotation (pitch - vertical tilt from drag)
    c = Math.cos(zw); s = Math.sin(zw);
    const ny = y * c - z * s;
    nz = y * s + z * c;
    y = ny; z = nz;

    // STEP 2: XW rotation LAST (4D inside-out from tap)
    // This ensures the morph always flows cleanly in view space
    c = Math.cos(xw); s = Math.sin(xw);
    nx = x * c - w * s;
    const nw = x * s + w * c;
    x = nx; w = nw;

    return { x, y, z, w };
  }, []);

  // Animation Loop
  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) { animationRef.current = requestAnimationFrame(loop); return; }
      const s = stateRef.current;
      s.time += 0.01;

      // === PHYSICS UPDATE ===

      // A. Dimensional Spring (Elasticity)
      // Pull currentDim towards targetDim with spring physics
      const k = 0.06;  // Spring stiffness
      const d = 0.82;  // Damping
      const force = (targetDim - s.currentDim) * k;
      s.dimVel += force;
      s.dimVel *= d;
      s.currentDim += s.dimVel;

      // B. Rotation Physics (unified with TesseractHero)
      if (s.isDragging && s.isHolding) {
        const holdDuration = Date.now() - s.holdStartTime;
        if (holdDuration > 100) {
          // Freeze and snap when holding
          s.xwVel = 0; s.ywVel = 0; s.zwVel = 0;
          const snapSpeed = 0.08;
          const targetXW = Math.round(s.xwAngle / (Math.PI / 2)) * (Math.PI / 2);
          s.xwAngle += (targetXW - s.xwAngle) * snapSpeed;
          s.ywAngle += (0 - s.ywAngle) * snapSpeed;
          s.zwAngle += (0 - s.zwAngle) * snapSpeed;
        }
      } else {
        // Normal momentum - 4D persists much longer than 3D
        s.xwAngle += s.xwVel; s.ywAngle += s.ywVel; s.zwAngle += s.zwVel;
        s.xwVel *= 0.998;  // 4D: very slow decay - keeps spinning
        s.ywVel *= 0.96;   // 3D: moderate decay
        s.zwVel *= 0.96;
        // Idle 4D spin (minimum)
        if (Math.abs(s.xwVel) < 0.003) s.xwVel = 0.003;
        if (Math.abs(s.ywVel) < 0.0001) s.ywVel = 0;
        if (Math.abs(s.zwVel) < 0.0001) s.zwVel = 0;
      }

      // === CALCULATE BLEND WEIGHTS ===
      const D = s.currentDim;

      // Smooth weights based on dimension (no hard switches)
      // Range: 1.0 (Singularity) -> 2.0 (Code) -> 3.0 (Shadow) -> 4.0 (Star)
      const starWeight = Math.max(0, Math.min(1, (D - 3.0)));           // 3.0 -> 4.0
      const shadowWeight = Math.max(0, Math.min(1, 1 - Math.abs(D - 3.0))); // Peak at 3.0
      const codeWeight = Math.max(0, Math.min(1, 1 - Math.abs(D - 2.0)));   // Peak at 2.0
      const fluxWeight = Math.max(0, Math.min(1, (2.0 - D)));           // 2.0 -> 1.0

      // Grid magnetism (strongest at 2.0D - quantization force)
      const gridMagnetism = Math.max(0, 1 - Math.abs(D - 2.0) * 1.5);

      // === RENDER ===
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      const centerX = W / 2;
      const centerY = H / 2;

      // Project all particles
      const projected = particles.map((p, i) => {
        const rotP = rotate4D(p, s.xwAngle, s.ywAngle, s.zwAngle);
        const dist = 3.5;
        const scale = 1 / (dist - rotP.w);

        let sx = rotP.x * scale * 400 + centerX;
        let sy = rotP.y * scale * 400 + centerY;

        // Apply magnetic grid snap (quantization force)
        if (gridMagnetism > 0.01) {
          const g = 25;
          const snappedX = Math.round(sx / g) * g;
          const snappedY = Math.round(sy / (g * 1.2)) * (g * 1.2);
          sx = sx + (snappedX - sx) * gridMagnetism;
          sy = sy + (snappedY - sy) * gridMagnetism;
        }

        // Singularity collapse (black hole pull)
        if (D < 1.5) {
          const collapse = Math.pow((1.5 - D) / 0.5, 2);
          sx = sx * (1 - collapse) + centerX * collapse;
          sy = sy * (1 - collapse) + centerY * collapse;
        }

        return { x: sx, y: sy, z: rotP.z, w: rotP.w, i, scale };
      });

      projected.sort((a, b) => a.z - b.z);

      // --- LAYER 1: THE CODE (Matrix / Wireframe) ---
      // Renders at Dim 1.0 -> 3.5, fades as star takes over
      if (codeWeight + shadowWeight + fluxWeight > 0.01) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        projected.forEach(p => {
          // Character selection based on W + Time
          const charIdx = Math.abs(Math.floor((p.w + s.time) * 5 + p.i)) % CHARS.length;
          const char = CHARS[charIdx];

          // Dynamic font size based on depth
          const size = Math.max(8, 20 * p.scale);
          ctx.font = `${size}px monospace`;

          // Color blend based on weights
          let r = 0, g = 0, b = 0;
          if (fluxWeight > 0) { r += 236 * fluxWeight; g += 72 * fluxWeight; b += 153 * fluxWeight; }  // Pink
          if (codeWeight > 0) { r += 74 * codeWeight; g += 222 * codeWeight; b += 128 * codeWeight; }  // Green
          if (shadowWeight > 0) { r += 96 * shadowWeight; g += 165 * shadowWeight; b += 250 * shadowWeight; } // Blue

          // Alpha based on depth W, fades as star takes over
          const alpha = (0.3 + p.w * 0.2) * (1 - starWeight);

          if (alpha > 0.01) {
            ctx.fillStyle = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${alpha})`;
            ctx.fillText(char, p.x, p.y);
          }
        });
      }

      // --- LAYER 2: THE STAR (Hyper-Solid) ---
      // Renders at Dim 3.0 -> 4.0 with additive blending
      if (starWeight > 0.01) {
        ctx.globalCompositeOperation = 'lighter';
        projected.forEach(p => {
          const size = (30 * p.scale + 4) * starWeight;
          const hue = 30 + p.w * 30;  // Gold/White/Fire
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.6 * starWeight})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Central halo
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
        grad.addColorStop(0, `rgba(255, 200, 100, ${0.15 * starWeight})`);
        grad.addColorStop(0.5, `rgba(200, 150, 255, ${0.05 * starWeight})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'source-over';
      }

      // --- LAYER 3: THE SINGULARITY (Central symbol + DNA orbit) ---
      // High-alphabet symbol in center, surrounded by 4-letter DNA code
      // As D drops, central symbol dissipates, more DNA appears
      if (D < 1.6) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // How much singularity effect (0 at 1.6, 1 at 1.0)
        const singularityWeight = Math.min(1, (1.6 - D) / 0.6);

        // Central symbol: fades as we approach pure 4-letter code
        // Visible from 1.6 down to ~1.1, then fades out
        const centralAlpha = D > 1.1 ? singularityWeight : Math.max(0, (D - 1.0) * 5);
        if (centralAlpha > 0.01) {
          // Slow flickering for the big-alphabet central symbol
          const flickerRate = 0.3;  // Much slower than before
          const charIdx = Math.floor(s.time * flickerRate) % CHARS.length;
          const char = CHARS[charIdx];

          const centralSize = 100 + (1.6 - D) * 40;  // Gets bigger as we compress
          ctx.font = `bold ${centralSize}px monospace`;

          ctx.fillStyle = `rgba(168, 85, 247, ${centralAlpha * 0.9})`;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 40 * centralAlpha;
          ctx.fillText(char, centerX, centerY);
          ctx.shadowBlur = 0;
        }

        // DNA orbit: number of letters increases as D drops
        // At 1.5D: 4 letters, at 1.0D: 20+ letters
        const dnaCount = Math.floor(4 + (1.5 - D) * 32);  // 4 to 20 letters
        const orbitRadius = 80 + (1.5 - D) * 100;  // Expands as D drops
        const dnaAlpha = Math.min(1, (1.5 - D) * 2);  // Fades in

        if (dnaAlpha > 0.01 && dnaCount > 0) {
          ctx.font = 'bold 28px monospace';

          for (let i = 0; i < dnaCount; i++) {
            // Orbit position (slowly rotating)
            const angle = (i / dnaCount) * Math.PI * 2 + s.time * 0.5;
            // Slight wobble in radius for organic feel
            const r = orbitRadius * (0.9 + 0.2 * Math.sin(angle * 3 + s.time));

            const dx = Math.cos(angle) * r;
            const dy = Math.sin(angle) * r * 0.6;  // Elliptical

            // Pick DNA letter based on position
            const dnaIdx = (i + Math.floor(s.time * 0.5)) % 4;
            const dnaChar = DNA[dnaIdx];

            // Color by base: A=green, C=blue, G=yellow, T=red
            const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171'];
            ctx.fillStyle = colors[dnaIdx];
            ctx.globalAlpha = dnaAlpha * 0.8;
            ctx.fillText(dnaChar, centerX + dx, centerY + dy);
          }
          ctx.globalAlpha = 1.0;
        }

        // At very low D (approaching 1.0), add more DNA in a grid pattern
        if (D < 1.2) {
          const gridAlpha = Math.min(1, (1.2 - D) * 5);
          ctx.font = 'bold 20px monospace';

          // Grid of DNA around center
          const gridSize = 5;  // 5x5 grid
          const spacing = 50;

          for (let gx = -gridSize; gx <= gridSize; gx++) {
            for (let gy = -gridSize; gy <= gridSize; gy++) {
              // Skip center area (already has main symbol)
              const dist = Math.sqrt(gx * gx + gy * gy);
              if (dist < 2) continue;

              const px = centerX + gx * spacing;
              const py = centerY + gy * spacing;

              // DNA letter based on position + time
              const dnaIdx = Math.abs((gx + gy + Math.floor(s.time * 0.8))) % 4;
              const dnaChar = DNA[dnaIdx];

              const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171'];
              ctx.fillStyle = colors[dnaIdx];
              ctx.globalAlpha = gridAlpha * 0.5 * (1 - dist / gridSize / 1.5);
              ctx.fillText(dnaChar, px, py);
            }
          }
          ctx.globalAlpha = 1.0;
        }
      }

      // --- TAP RIPPLE ---
      const timeSinceTap = Date.now() - s.lastTapTime;
      if (timeSinceTap < 600) {
        const progress = timeSinceTap / 600;
        const alpha = 1 - progress;
        ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.tapX, s.tapY, progress * 200, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [particles, rotate4D, targetDim]);

  // Input Handlers
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;

    let cx, cy;
    if ('touches' in e && e.touches.length > 0) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      cx = e.clientX; cy = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const { x, y } = getCoords(e);
    const s = stateRef.current;

    s.isDragging = true;
    s.isHolding = true;
    s.dragStartTime = Date.now();
    s.holdStartTime = Date.now();
    s.lastX = x; s.lastY = y;
    s.dragDistance = 0;
    s.ywVel = 0; s.zwVel = 0;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const s = stateRef.current;
    if (!s.isDragging) return;
    if (e.cancelable) e.preventDefault();

    const { x, y } = getCoords(e);
    const dx = x - s.lastX;
    const dy = y - s.lastY;

    s.dragDistance += Math.abs(dx) + Math.abs(dy);
    if (s.dragDistance > 5) s.isHolding = false;

    if (!s.isHolding) {
      s.ywAngle += dx * 0.002;
      s.zwAngle += dy * 0.002;
      s.ywVel = dx * 0.002;
      s.zwVel = dy * 0.002;
    }
    s.lastX = x; s.lastY = y;
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const s = stateRef.current;
    const duration = Date.now() - s.dragStartTime;

    // Tap detection
    if (s.dragDistance < 20 && duration < 300) {
      const { x, y } = getCoords(e);
      s.tapX = x; s.tapY = y;
      s.lastTapTime = Date.now();
      // Kill 3D, boost 4D
      s.ywVel = 0; s.zwVel = 0;
      s.xwVel += 0.04;
    }

    s.isDragging = false;
    s.isHolding = false;
  };

  // Mode label based on target (what user selected)
  const d = targetDim;
  const label = d > 3.5 ? 'HYPER-SOLID' :
                d > 2.5 ? 'SHADOW PROJECTION' :
                d > 1.5 ? 'QUANTIZED CODE' : 'SINGULARITY';

  const colorClass = d > 3.5 ? 'text-amber-400' :
                     d > 2.5 ? 'text-blue-400' :
                     d > 1.5 ? 'text-green-400' : 'text-purple-400';

  return (
    <div className="w-full flex flex-col items-center">
      {/* VIEWPORT */}
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative select-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full object-cover touch-none cursor-grab active:cursor-grabbing outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* CONTROLS */}
      <div className="w-full max-w-3xl mt-6 px-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-400">OBSERVER DIMENSIONALITY</label>
          <span className={`font-mono text-xl font-bold transition-colors duration-300 ${colorClass}`}>
            {targetDim.toFixed(1)}D — {label}
          </span>
        </div>

        <input
          type="range"
          min="1.0"
          max="4.0"
          step="0.1"
          value={targetDim}
          onChange={(e) => setTargetDim(parseFloat(e.target.value))}
          className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
        />

        <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
          <span className="text-purple-400">1D SINGULARITY</span>
          <span className="text-green-400">2D CODE</span>
          <span className="text-blue-400">3D SHADOW</span>
          <span className="text-amber-400">4D STAR</span>
        </div>
      </div>

      {/* INTERACTION HINTS */}
      <div className="w-full max-w-2xl mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg">↔</div>
          <div>
            <strong className="text-slate-200 block">3D ORBIT</strong>
            <span className="hidden sm:inline">Drag to rotate</span>
            <span className="sm:hidden">Drag</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-lg">⚡</div>
          <div>
            <strong className="text-slate-200 block">4D IMPULSE</strong>
            <span className="hidden sm:inline">Tap to spin inside-out</span>
            <span className="sm:hidden">Tap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
