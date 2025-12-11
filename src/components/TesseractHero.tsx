'use client';

/**
 * TesseractHero - Mobile Hardened Edition
 *
 * MOBILE FIXES:
 * 1. `touch-action: none` (CSS) prevents scrolling/zooming while dragging.
 * 2. `onContextMenu` prevention stops the "Save Image / Copy" popup on long-press.
 * 3. `select-none` prevents text highlighting.
 * 4. `-webkit-tap-highlight-color: transparent` prevents the blue flash on tap.
 */

import { useRef, useEffect, useMemo } from 'react';

interface TesseractHeroProps {
  className?: string;
}

interface Vec4 { x: number; y: number; z: number; w: number; }
type EdgeType = 'x' | 'y' | 'z' | 'w';

export default function TesseractHero({ className = '' }: TesseractHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const stateRef = useRef({
    time: 0,
    xwAngle: 0, ywAngle: 0, zwAngle: 0,
    xwVel: 0.02, ywVel: 0, zwVel: 0,

    // Interaction
    isDragging: false,
    isHolding: false,
    lastX: 0, lastY: 0,
    dragStartTime: 0,
    holdStartTime: 0,
    dragDistance: 0,

    // Tap Visuals
    tapX: 0, tapY: 0, lastTapTime: 0,
  });

  const W = 1600;
  const H = 900;

  // 1. GEOMETRY
  const { vertices, edges } = useMemo(() => {
    const verts: Vec4[] = [];
    for (let i = 0; i < 16; i++) {
      verts.push({ x: (i&1)?1:-1, y: (i&2)?1:-1, z: (i&4)?1:-1, w: (i&8)?1:-1 });
    }
    const edgesList: { from: number; to: number; type: EdgeType }[] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const v1 = verts[i], v2 = verts[j];
        const diff = (v1.x!==v2.x?1:0) + (v1.y!==v2.y?1:0) + (v1.z!==v2.z?1:0) + (v1.w!==v2.w?1:0);
        if (diff === 1) {
          let type: EdgeType = 'x';
          if (v1.y !== v2.y) type = 'y'; if (v1.z !== v2.z) type = 'z'; if (v1.w !== v2.w) type = 'w';
          edgesList.push({ from: i, to: j, type });
        }
      }
    }
    return { vertices: verts, edges: edgesList };
  }, []);

  // 2. MATH & PROJECTION
  // Order matters! 3D rotations first, then 4D rotation LAST for clean inside-out effect
  const rotate4D = (v: Vec4, xw: number, yw: number, zw: number): Vec4 => {
    let { x, y, z, w } = v;

    // 3D rotations first (so the view orientation is established)
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

    // XW rotation LAST (4D inside-out from tap) - clean hypercube inversion
    c = Math.cos(xw); s = Math.sin(xw);
    nx = x * c - w * s;
    const nw = x * s + w * c;
    x = nx; w = nw;

    return { x, y, z, w };
  };

  const project = (v: Vec4) => {
    const dist4d = 3.2;
    const scale4d = 1 / (dist4d - v.w);
    const x3 = v.x * scale4d, y3 = v.y * scale4d, z3 = v.z * scale4d;
    const dist3d = 4.0;
    const scale3d = 900 / (dist3d - z3);
    return { x: W/2 + x3 * scale3d, y: H/2 + y3 * scale3d, scale: scale3d, w: v.w, z: z3 };
  };

  // 3. ANIMATION LOOP
  useEffect(() => {
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) { animationRef.current = requestAnimationFrame(loop); return; }
      const s = stateRef.current;

      // PHYSICS: Hold logic
      if (s.isDragging && s.isHolding) {
          const holdDuration = Date.now() - s.holdStartTime;
          // If holding > 100ms, start freezing/snapping
          if (holdDuration > 100) {
              s.xwVel = 0; s.ywVel = 0; s.zwVel = 0;
              const snapSpeed = 0.08;
              const targetXW = Math.round(s.xwAngle / (Math.PI/2)) * (Math.PI/2);
              s.xwAngle += (targetXW - s.xwAngle) * snapSpeed;
              s.ywAngle += (0 - s.ywAngle) * snapSpeed;
              s.zwAngle += (0 - s.zwAngle) * snapSpeed;
          }
      } else {
          // Normal Momentum - unified with CodeCollapse
          // 4D persists much longer than 3D for exploration
          s.xwAngle += s.xwVel; s.ywAngle += s.ywVel; s.zwAngle += s.zwVel;
          s.xwVel *= 0.998;  // 4D: very slow decay - keeps spinning
          s.ywVel *= 0.96;   // 3D: moderate decay
          s.zwVel *= 0.96;
          // Idle 4D spin (minimum)
          if (Math.abs(s.xwVel) < 0.003) s.xwVel = 0.003;
          if (Math.abs(s.ywVel) < 0.0001) s.ywVel = 0;
          if (Math.abs(s.zwVel) < 0.0001) s.zwVel = 0;
      }

      // RENDER
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      const projected = vertices.map(v => {
        const rv = rotate4D(v, s.xwAngle, s.ywAngle, s.zwAngle);
        return project(rv);
      });

      // Sort Edges by Z
      const sortedEdges = [...edges].sort((a, b) => {
          const za = (projected[a.from].z + projected[a.to].z) / 2;
          const zb = (projected[b.from].z + projected[b.to].z) / 2;
          return zb - za;
      });

      ctx.lineCap = 'round';
      sortedEdges.forEach(e => {
        const p1 = projected[e.from], p2 = projected[e.to];
        const speed4D = Math.min(1, Math.abs(s.xwVel) / 0.05);

        // Color Logic
        let hue, sat, light, alpha, glow;
        if (e.type === 'w') {
            hue = 280 + speed4D * 60; // Purple -> Pink
            sat = 80 + speed4D * 20; light = 60 + speed4D * 20;
            alpha = 0.5 + speed4D * 0.5; glow = speed4D * 20;
        } else {
            const pW = (p1.w + p2.w) / 2;
            hue = 200 + pW * 30; // Cyan -> Blue
            sat = 70; light = 50; alpha = 0.4 + pW * 0.2; glow = 0;
        }

        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
        ctx.lineWidth = e.type === 'w' ? 3 : 4;
        if (glow > 0) {
            ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = glow;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      });

      // Vertices
      ctx.shadowBlur = 0;
      projected.forEach(p => {
        const size = 6 + (p.w + 1) * 4;
        ctx.fillStyle = p.w > 0 ? '#60a5fa' : '#34d399';
        ctx.globalAlpha = 0.7 + p.w * 0.3;
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // TAP RIPPLE
      const timeSinceTap = Date.now() - s.lastTapTime;
      if (timeSinceTap < 500) {
          const progress = timeSinceTap / 500;
          const alpha = 1 - progress;
          ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(s.tapX, s.tapY, progress * 200, 0, Math.PI*2);
          ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [vertices, edges]);

  // === INPUT HANDLERS ===
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if(!rect) return {x:0, y:0};
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
      return { x: (cx - rect.left)*scaleX, y: (cy - rect.top)*scaleY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      if(e.cancelable) e.preventDefault();

      const { x, y } = getCoords(e);
      const s = stateRef.current;

      s.isDragging = true;
      s.isHolding = true;
      s.dragStartTime = Date.now();
      s.holdStartTime = Date.now();
      s.lastX = x; s.lastY = y;
      s.dragDistance = 0;

      // Stop 3D spin on grab
      s.ywVel = 0; s.zwVel = 0;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      if(e.cancelable) e.preventDefault();

      const { x, y } = getCoords(e);
      const dx = x - s.lastX;
      const dy = y - s.lastY;

      s.dragDistance += Math.abs(dx) + Math.abs(dy);
      if (s.dragDistance > 5) s.isHolding = false;

      if (!s.isHolding) {
          s.ywAngle += dx * 0.003; s.zwAngle += dy * 0.003;
          s.ywVel = dx * 0.003; s.zwVel = dy * 0.003;
      }
      s.lastX = x; s.lastY = y;
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
      const s = stateRef.current;
      const duration = Date.now() - s.dragStartTime;

      // TAP DETECTION
      if (s.dragDistance < 20 && duration < 300) {
          const { x, y } = getCoords(e);
          s.tapX = x; s.tapY = y;
          s.lastTapTime = Date.now();

          // IMPULSE
          s.ywVel = 0; s.zwVel = 0; // Freeze 3D
          s.xwVel += 0.04; // Add 4D
      }

      s.isDragging = false;
      s.isHolding = false;
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
                onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>

        {/* CONTROLS GUIDE (Mobile Friendly) */}
        <div className="w-full max-w-2xl mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg">↔</div>
                <div>
                    <strong className="text-slate-200 block">3D ORBIT</strong>
                    <span className="hidden sm:inline">Drag to rotate the shadow</span>
                    <span className="sm:hidden">Drag to rotate</span>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-lg">⚡</div>
                <div>
                    <strong className="text-slate-200 block">4D IMPULSE</strong>
                    <span className="hidden sm:inline">Tap/Click to spin inside-out</span>
                    <span className="sm:hidden">Tap to spin 4D</span>
                </div>
            </div>
        </div>
    </div>
  );
}
