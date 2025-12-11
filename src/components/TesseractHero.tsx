'use client';

/**
 * TesseractHero - Clean Geometric Tesseract
 *
 * INTERACTIONS:
 * - Drag: 3D rotation (yaw/pitch) - reorient the view
 * - Tap: Violent 4D impulse (XW plane) - inside-out tumbling
 *
 * PHYSICS:
 * - 4D rotation (xwVel) decays slowly, coasts for exploration
 * - 3D rotation (yaw/pitch) decays fast, settles quickly
 * - Tap ADDS to 4D momentum (compound rotations)
 */

import { useRef, useEffect, useMemo } from 'react';

interface TesseractHeroProps {
  className?: string;
}

interface Vec4 { x: number; y: number; z: number; w: number; }
interface Edge { from: number; to: number; type: 'spatial' | 'w'; }

export default function TesseractHero({ className = '' }: TesseractHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    // 4D Rotation (Inside-Out)
    xwAngle: 0,
    xwVel: 0.012, // Idle 4D spin

    // 3D Rotation (Orientation)
    yawAngle: 0.3, // Start slightly rotated for depth
    pitchAngle: 0.2,
    yawVel: 0,
    pitchVel: 0,

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
  const VIEW_SCALE = 280;

  // Generate tesseract: 16 vertices + 32 edges
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
        if (dx + dy + dz + dw === 1) {
          lines.push({ from: i, to: j, type: dw ? 'w' : 'spatial' });
        }
      }
    }
    return { vertices: verts, edges: lines };
  }, []);

  // 4D rotation: XW first (inside-out), then 3D orientation
  const rotate4D = (v: Vec4, xw: number, yaw: number, pitch: number): Vec4 => {
    let { x, y, z, w } = v;

    // XW rotation FIRST (4D inside-out)
    let c = Math.cos(xw), s = Math.sin(xw);
    const nx1 = x * c - w * s;
    const nw1 = x * s + w * c;
    x = nx1; w = nw1;

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
  };

  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) { animationRef.current = requestAnimationFrame(loop); return; }
      const st = stateRef.current;

      // === PHYSICS ===
      if (!st.isDragging) {
        st.xwAngle += st.xwVel;
        st.yawAngle += st.yawVel;
        st.pitchAngle += st.pitchVel;

        // 4D coasts slowly, 3D stops fast
        st.xwVel *= 0.995;
        st.yawVel *= 0.92;
        st.pitchVel *= 0.92;

        // Minimum idle 4D spin
        if (Math.abs(st.xwVel) < 0.008) st.xwVel = 0.008;
      }

      // === RENDER ===
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Project vertices
      const projected = vertices.map(v => {
        const rotP = rotate4D(v, st.xwAngle, st.yawAngle, st.pitchAngle);

        // 4D perspective projection
        const dist4d = 3.0;
        const scale4d = 1 / (dist4d - rotP.w * 0.5);

        return {
          x: rotP.x * scale4d * VIEW_SCALE + W/2,
          y: rotP.y * scale4d * VIEW_SCALE + H/2,
          z: rotP.z,
          w: rotP.w,
          scale: scale4d
        };
      });

      // Sort edges by depth
      const sortedEdges = [...edges].sort((a, b) => {
        const za = (projected[a.from].z + projected[a.to].z) / 2;
        const zb = (projected[b.from].z + projected[b.to].z) / 2;
        return za - zb;
      });

      // Speed indicator for W-edge glow
      const speed4D = Math.min(1, Math.abs(st.xwVel) / 0.06);

      // Draw edges
      ctx.lineCap = 'round';

      sortedEdges.forEach(edge => {
        const p1 = projected[edge.from];
        const p2 = projected[edge.to];
        const avgW = (p1.w + p2.w) / 2;
        const avgZ = (p1.z + p2.z) / 2;

        // Depth-based visibility
        const depthAlpha = 0.5 + (avgZ + 1) * 0.25;

        let hue: number, sat: number, light: number, alpha: number, lineWidth: number;

        if (edge.type === 'w') {
          // W-edges: Purple->Pink when spinning fast
          hue = 280 + speed4D * 40;
          sat = 80 + speed4D * 20;
          light = 55 + speed4D * 15;
          alpha = (0.5 + speed4D * 0.5) * depthAlpha;
          lineWidth = 2 + speed4D * 2;

          if (speed4D > 0.2) {
            ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
            ctx.shadowBlur = speed4D * 20;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          // Spatial edges: Blue/Cyan
          hue = 200 + avgW * 30;
          sat = 75;
          light = 55;
          alpha = (0.4 + avgW * 0.25) * depthAlpha;
          lineWidth = 3;
          ctx.shadowBlur = 0;
        }

        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${Math.min(1, alpha)})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      ctx.shadowBlur = 0;

      // Draw vertices
      projected.forEach(p => {
        const size = 4 + (p.w + 1) * 2.5;

        // Color by W: inner cube (w=-1) green, outer cube (w=+1) blue
        if (p.w > 0) {
          ctx.fillStyle = `hsla(210, 80%, 60%, ${0.6 + p.w * 0.2})`;
        } else {
          ctx.fillStyle = `hsla(160, 80%, 50%, ${0.6 - p.w * 0.2})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Tap ripple
      const timeSinceTap = Date.now() - st.lastTapTime;
      if (timeSinceTap < 500) {
        const progress = timeSinceTap / 500;
        ctx.strokeStyle = `rgba(236, 72, 153, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(st.tapX, st.tapY, progress * 250, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [vertices, edges]);

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
      // TAP: Add violent 4D impulse
      st.xwVel += 0.06;

      const { x, y } = getCoords(e);
      st.tapX = x || st.lastX;
      st.tapY = y || st.lastY;
      st.lastTapTime = Date.now();
    }

    st.isDragging = false;
  };

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
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
      <div className="w-full max-w-2xl mt-4 flex justify-center gap-8 text-xs font-mono text-slate-500">
        <span className="flex items-center gap-2">
          <span className="text-blue-400">↔</span> DRAG TO ORBIT
        </span>
        <span className="flex items-center gap-2">
          <span className="text-pink-400">⚡</span> TAP FOR 4D SPIN
        </span>
      </div>
    </div>
  );
}
