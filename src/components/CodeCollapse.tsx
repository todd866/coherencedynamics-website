'use client';

/**
 * CodeCollapse - "Geometric" Edition
 *
 * VISUAL MODES:
 * - 4D (HYPER-SOLID): Glowing gold wireframe tesseract, additive blending
 * - 3D (SHADOW): Blue wireframe, high visibility
 * - 2D (CODE): Green matrix characters along edges
 * - 1D (SINGULARITY): ONE single stable giant symbol
 *
 * PHYSICS:
 * - Drag: 3D rotation (yaw/pitch)
 * - Tap: Violent 4D impulse (XW plane inside-out spin)
 */

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';

const CHARS = '01λφψ{}[]<>∂∫∑∏xyz=+-*/#@&|~^:;';

interface Vec4 { x: number; y: number; z: number; w: number; }
interface Edge { from: number; to: number; type: 'spatial' | 'w'; }

export default function CodeCollapse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [targetDim, setTargetDim] = useState(4.0);

  const stateRef = useRef({
    time: 0,
    // 4D Rotation (Inside-Out) - the interesting one
    xwAngle: 0,
    xwVel: 0.008, // Idle 4D spin

    // 3D Rotation (Orientation)
    yawAngle: 0, pitchAngle: 0,
    yawVel: 0, pitchVel: 0,

    // Dimensional Physics
    currentDim: 4.0,
    dimVel: 0,

    // Interaction
    isDragging: false,
    lastX: 0, lastY: 0,
    dragStartTime: 0,
    dragDistance: 0,

    // Tap Visuals
    tapX: 0, tapY: 0, lastTapTime: 0,
  });

  const W = 1600;
  const H = 900;
  const VIEW_SCALE = 320;

  // Generate tesseract geometry: 16 vertices + 32 edges
  const { vertices, edges } = useMemo(() => {
    const verts: Vec4[] = [];
    for (let i = 0; i < 16; i++) {
      verts.push({
        x: (i & 1) ? 1 : -1,
        y: (i & 2) ? 1 : -1,
        z: (i & 4) ? 1 : -1,
        w: (i & 8) ? 1 : -1
      });
    }

    const lines: Edge[] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const v1 = verts[i], v2 = verts[j];
        const dx = v1.x !== v2.x ? 1 : 0;
        const dy = v1.y !== v2.y ? 1 : 0;
        const dz = v1.z !== v2.z ? 1 : 0;
        const dw = v1.w !== v2.w ? 1 : 0;
        const diff = dx + dy + dz + dw;
        if (diff === 1) {
          lines.push({ from: i, to: j, type: dw ? 'w' : 'spatial' });
        }
      }
    }
    return { vertices: verts, edges: lines };
  }, []);

  // 4D rotation: XW plane (inside-out) + 3D orientation (yaw/pitch)
  const rotate4D = useCallback((v: Vec4, xw: number, yaw: number, pitch: number): Vec4 => {
    let { x, y, z, w } = v;

    // XW rotation FIRST (4D inside-out from tap)
    let c = Math.cos(xw), s = Math.sin(xw);
    const nx1 = x * c - w * s;
    const nw1 = x * s + w * c;
    x = nx1; w = nw1;

    // Then 3D rotations for view orientation
    // Yaw (XZ)
    c = Math.cos(yaw); s = Math.sin(yaw);
    const nx2 = x * c - z * s;
    const nz2 = x * s + z * c;
    x = nx2; z = nz2;

    // Pitch (YZ)
    c = Math.cos(pitch); s = Math.sin(pitch);
    const ny3 = y * c - z * s;
    const nz3 = y * s + z * c;
    y = ny3; z = nz3;

    return { x, y, z, w };
  }, []);

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) { animationRef.current = requestAnimationFrame(loop); return; }
      const st = stateRef.current;
      st.time += 0.016;

      // === PHYSICS ===
      // Dimension spring
      const k = 0.08, damp = 0.82;
      st.dimVel += (targetDim - st.currentDim) * k;
      st.dimVel *= damp;
      st.currentDim += st.dimVel;

      // Rotation momentum
      if (!st.isDragging) {
        st.xwAngle += st.xwVel;
        st.yawAngle += st.yawVel;
        st.pitchAngle += st.pitchVel;

        // 4D coasts slowly, 3D stops fast
        st.xwVel *= 0.995;
        st.yawVel *= 0.92;
        st.pitchVel *= 0.92;

        // Minimum idle 4D spin
        if (Math.abs(st.xwVel) < 0.005) st.xwVel = 0.005;
      }

      // === RENDER ===
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      const D = st.currentDim;

      // Mode weights
      const starWeight = Math.max(0, Math.min(1, (D - 3.0) / 1.0)); // 3.0->4.0
      const codeWeight = Math.max(0, Math.min(1, 1 - Math.abs(D - 2.0) * 0.8)); // peaks at 2.0
      const shadowWeight = Math.max(0, Math.min(1, 1 - Math.abs(D - 3.0) * 0.8)); // peaks at 3.0
      const singularityWeight = Math.max(0, Math.min(1, (1.5 - D) * 2)); // < 1.5

      // === SINGULARITY MODE (D < 1.5) ===
      if (D < 1.5) {
        // Collapse all to center
        const collapse = Math.pow(singularityWeight, 2);

        // ONE GIANT STABLE SYMBOL
        const charIdx = singularityWeight > 0.8
          ? 7 // Stable char at full collapse
          : Math.floor(st.time * 8) % CHARS.length;
        const char = CHARS[charIdx];

        ctx.font = `bold ${150 + collapse * 50}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 60 * singularityWeight;
        ctx.shadowColor = '#d946ef';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + singularityWeight * 0.5})`;

        // Jitter decreases as we approach 1.0
        const jitter = (1 - singularityWeight) * 15;
        const jx = (Math.random() - 0.5) * jitter;
        const jy = (Math.random() - 0.5) * jitter;

        ctx.fillText(char, W/2 + jx, H/2 + jy);
        ctx.shadowBlur = 0;

        // At full singularity, skip drawing the tesseract
        if (D < 1.1) {
          animationRef.current = requestAnimationFrame(loop);
          return;
        }
      }

      // === PROJECT VERTICES ===
      const projected = vertices.map((v) => {
        const rotP = rotate4D(v, st.xwAngle, st.yawAngle, st.pitchAngle);

        // 4D perspective projection
        const dist4d = 3.0;
        const scale4d = 1 / (dist4d - rotP.w * 0.5);

        let sx = rotP.x * scale4d * VIEW_SCALE + W/2;
        let sy = rotP.y * scale4d * VIEW_SCALE + H/2;

        // Collapse toward center at low D
        if (D < 2.0) {
          const pull = Math.pow((2.0 - D), 2);
          sx = sx * (1 - pull) + (W/2) * pull;
          sy = sy * (1 - pull) + (H/2) * pull;
        }

        return { x: sx, y: sy, z: rotP.z, w: rotP.w, scale: scale4d };
      });

      // Sort edges by depth for proper occlusion
      const sortedEdges = [...edges].sort((a, b) => {
        const za = (projected[a.from].z + projected[a.to].z) / 2;
        const zb = (projected[b.from].z + projected[b.to].z) / 2;
        return za - zb; // Back to front
      });

      // === DRAW EDGES ===
      ctx.lineCap = 'round';

      sortedEdges.forEach(edge => {
        const p1 = projected[edge.from];
        const p2 = projected[edge.to];
        const avgW = (p1.w + p2.w) / 2;
        const avgZ = (p1.z + p2.z) / 2;

        // Depth-based alpha
        const depthAlpha = 0.4 + (avgZ + 1) * 0.3;

        let hue: number, sat: number, light: number, alpha: number, lineWidth: number;

        if (starWeight > 0.1) {
          // STAR MODE: Gold/fire, glowing
          hue = 35 + avgW * 25;
          sat = 100;
          light = 55 + avgW * 15;
          alpha = (0.6 + avgW * 0.3) * starWeight * depthAlpha;
          lineWidth = (edge.type === 'w' ? 4 : 5) * starWeight + 2;

          ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
          ctx.shadowBlur = 15 * starWeight;
        } else if (shadowWeight > 0.1) {
          // SHADOW MODE: Blue wireframe
          hue = 210 + avgW * 20;
          sat = 80;
          light = 55;
          alpha = (0.5 + avgW * 0.3) * depthAlpha;
          lineWidth = edge.type === 'w' ? 2 : 3;
          ctx.shadowBlur = 0;
        } else {
          // CODE MODE: Green matrix
          hue = 140;
          sat = 100;
          light = 50;
          alpha = (0.6 + avgW * 0.2) * depthAlpha;
          lineWidth = 2;
          ctx.shadowBlur = 0;
        }

        // W-edges glow in 4D mode
        if (edge.type === 'w' && starWeight > 0.1) {
          hue = 280 + Math.abs(st.xwVel) * 500; // Purple->pink when spinning fast
          alpha *= 1.5;
        }

        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${Math.min(1, alpha)})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Matrix characters along edges in CODE mode
        if (codeWeight > 0.2 && D > 1.5 && D < 3.0) {
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const steps = Math.floor(dist / 25);

          ctx.font = '14px monospace';
          ctx.fillStyle = `rgba(74, 222, 128, ${codeWeight * 0.9})`;

          for (let k = 1; k < steps; k++) {
            const t = k / steps;
            const cx = p1.x + (p2.x - p1.x) * t;
            const cy = p1.y + (p2.y - p1.y) * t;

            if (Math.random() > 0.6) {
              const charIdx = Math.floor((cx + cy + st.time * 15) % CHARS.length);
              ctx.fillText(CHARS[Math.abs(charIdx)], cx, cy);
            }
          }
        }
      });

      ctx.shadowBlur = 0;

      // === DRAW VERTICES ===
      if (D > 1.5) {
        projected.forEach(p => {
          const size = starWeight > 0.1
            ? (4 + p.w * 3) * (1 + starWeight)
            : 3 + p.w * 2;

          if (starWeight > 0.1) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `hsla(45, 100%, 70%, ${0.7 * starWeight})`;
          } else if (shadowWeight > 0.1) {
            ctx.fillStyle = `hsla(210, 80%, 60%, ${0.6})`;
          } else {
            ctx.fillStyle = `hsla(140, 100%, 50%, ${0.7})`;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
      }

      // === TAP RIPPLE ===
      const timeSinceTap = Date.now() - st.lastTapTime;
      if (timeSinceTap < 500) {
        const progress = timeSinceTap / 500;
        ctx.strokeStyle = `rgba(236, 72, 153, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(st.tapX, st.tapY, progress * 300, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [vertices, edges, targetDim, rotate4D]);

  // === HANDLERS ===
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const { x, y } = getCoords(e);
    const st = stateRef.current;
    st.isDragging = true;
    st.dragStartTime = Date.now();
    st.lastX = x;
    st.lastY = y;
    st.dragDistance = 0;
    // Kill 3D momentum on grab
    st.yawVel = 0;
    st.pitchVel = 0;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const st = stateRef.current;
    if (!st.isDragging) return;
    if (e.cancelable) e.preventDefault();

    const { x, y } = getCoords(e);
    const dx = x - st.lastX;
    const dy = y - st.lastY;
    st.dragDistance += Math.abs(dx) + Math.abs(dy);

    // 3D rotation from drag
    st.yawAngle += dx * 0.003;
    st.pitchAngle += dy * 0.003;
    st.yawVel = dx * 0.003;
    st.pitchVel = dy * 0.003;

    st.lastX = x;
    st.lastY = y;
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const st = stateRef.current;

    if (st.isDragging && st.dragDistance < 15) {
      // TAP DETECTED: Violent 4D impulse!
      st.xwVel += 0.08; // Big kick

      const { x, y } = getCoords(e);
      st.tapX = x || st.lastX;
      st.tapY = y || st.lastY;
      st.lastTapTime = Date.now();
    }

    st.isDragging = false;
  };

  const d = targetDim;
  const label = d > 3.5 ? 'HYPER-SOLID' : d > 2.5 ? 'SHADOW' : d > 1.5 ? 'CODE' : 'SINGULARITY';
  const color = d > 3.5 ? 'text-amber-400' : d > 2.5 ? 'text-blue-400' : d > 1.5 ? 'text-green-400' : 'text-fuchsia-400';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative select-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full object-cover touch-none cursor-grab active:cursor-grabbing outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onContextMenu={e => e.preventDefault()}
        />
      </div>

      <div className="w-full max-w-3xl mt-6 px-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-bold text-slate-500 tracking-widest">DIMENSIONALITY</label>
          <span className={`font-mono text-xl font-bold transition-colors ${color}`}>
            {targetDim.toFixed(1)}D — {label}
          </span>
        </div>
        <input
          type="range"
          min="1.0"
          max="4.0"
          step="0.1"
          value={targetDim}
          onChange={e => setTargetDim(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
        />
      </div>
    </div>
  );
}
