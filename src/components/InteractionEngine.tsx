'use client';

/**
 * =============================================================================
 * InteractionEngine - High-D to Low-D to High-D Communication
 * =============================================================================
 *
 * VISUALIZING THE "INTERFACE THEORY":
 * Two complex dynamical systems can only communicate through a low-dimensional
 * code. This is the fundamental constraint that creates biological signaling.
 *
 * =============================================================================
 * THE VISUALIZATION:
 * =============================================================================
 *
 * 1. LEFT (Sender): A complex dynamical system (user interactable).
 *    - Options: Lorenz attractor, Neural network, Harmonic oscillator
 *    - Has internal high-dimensional state
 *
 * 2. MIDDLE (Bottleneck): A "Quantizer" that samples the Left system.
 *    - Converts analog state -> Discrete Symbols (Packets)
 *    - This is where code forms
 *
 * 3. RIGHT (Receiver): A different dynamical system.
 *    - Receives symbols and converts them back into Forces/Energy
 *    - Demonstrates that the receiver reconstructs meaning from code
 *
 * =============================================================================
 * THE MESSAGE:
 * =============================================================================
 *
 * "Code is the protocol that allows two disparate complex systems to couple."
 *
 * This is how biology works:
 * - Neurons communicate through action potentials (discrete spikes)
 * - Cells communicate through signaling molecules (discrete binding events)
 * - Organisms communicate through language (discrete symbols)
 *
 * The continuous internal dynamics of each system are inaccessible to the other.
 * Only the quantized, low-dimensional projection can cross the interface.
 *
 * =============================================================================
 */

import { useRef, useEffect, useState, useCallback } from 'react';

type SystemType = 'LORENZ' | 'NEURAL' | 'OSCILLATOR';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  id: number;
  connections?: number[];
}

interface Packet {
  x: number; y: number;
  val: number;
  symbol: string;
  active: boolean;
}

export default function InteractionEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  const [senderType, setSenderType] = useState<SystemType>('LORENZ');
  const [receiverType, setReceiverType] = useState<SystemType>('NEURAL');
  const [bandwidth, setBandwidth] = useState(0.5);

  const senderRef = useRef<Particle[]>([]);
  const receiverRef = useRef<Particle[]>([]);
  const packetsRef = useRef<Packet[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  const W = 900;
  const H = 400;
  const GAP = 100;
  const SENDER_W = (W - GAP) / 2;
  const RECEIVER_X = SENDER_W + GAP;

  const initSystem = useCallback((type: SystemType, isRight: boolean): Particle[] => {
    const particles: Particle[] = [];
    const offsetX = isRight ? RECEIVER_X : 0;

    if (type === 'LORENZ') {
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: offsetX + SENDER_W / 2 + (Math.random() - 0.5) * 100,
          y: H / 2 + (Math.random() - 0.5) * 100,
          vx: 0, vy: 0, id: i
        });
      }
    } else if (type === 'NEURAL') {
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: offsetX + Math.random() * SENDER_W,
          y: Math.random() * H,
          vx: 0, vy: 0, id: i,
          connections: [Math.floor(Math.random() * 40), Math.floor(Math.random() * 40)]
        });
      }
    } else if (type === 'OSCILLATOR') {
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: offsetX + (i / 50) * SENDER_W,
          y: H / 2,
          vx: 0, vy: 0, id: i
        });
      }
    }
    return particles;
  }, [SENDER_W, RECEIVER_X, H]);

  useEffect(() => {
    senderRef.current = initSystem(senderType, false);
    receiverRef.current = initSystem(receiverType, true);
    packetsRef.current = [];
  }, [senderType, receiverType, initSystem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lorenzStep = (p: Particle, dt: number, centerX: number) => {
      const sigma = 10, rho = 28;
      const x = (p.x - centerX) / 10;
      const y = (p.y - H / 2) / 10;
      const z = 20;

      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;

      p.vx += dx * dt;
      p.vy += dy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
    };

    const neuralStep = (p: Particle, particles: Particle[]) => {
      p.connections?.forEach(targetId => {
        const target = particles[targetId];
        if (target) {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          p.vx += dx * 0.001;
          p.vy += dy * 0.001;
        }
      });

      particles.forEach(other => {
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30 && dist > 0) {
          p.vx += (dx / dist) * 0.5;
          p.vy += (dy / dist) * 0.5;
        }
      });

      if (Math.random() < 0.05) {
        p.vx += (Math.random() - 0.5) * 2;
        p.vy += (Math.random() - 0.5) * 2;
      }

      p.vx *= 0.9;
      p.vy *= 0.9;
    };

    const loop = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Draw Interface Walls
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(SENDER_W - 2, 0, 4, H);
      ctx.fillRect(RECEIVER_X - 2, 0, 4, H);

      // Draw bottleneck channel
      const channelHeight = H * bandwidth;
      const channelY = (H - channelHeight) / 2;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(SENDER_W, 0, GAP, channelY);
      ctx.fillRect(SENDER_W, channelY + channelHeight, GAP, channelY);

      // === LEFT SYSTEM (SENDER) ===
      let signalAccumulator = 0;

      senderRef.current.forEach(p => {
        if (mouseRef.current.active && mouseRef.current.x < SENDER_W) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.vx += dx * 0.01;
            p.vy += dy * 0.01;
          }
        }

        if (senderType === 'LORENZ') {
          lorenzStep(p, 0.01, SENDER_W / 2);
        } else if (senderType === 'NEURAL') {
          neuralStep(p, senderRef.current);
        } else {
          const targetY = H / 2 + Math.sin(p.x * 0.05 + Date.now() * 0.005) * 50;
          p.vy += (targetY - p.y) * 0.1;
          p.vy *= 0.8;
          if (mouseRef.current.active && mouseRef.current.x < SENDER_W) {
            p.vy += (Math.random() - 0.5) * 5;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = 0;
        if (p.x > SENDER_W) p.x = SENDER_W;
        if (p.y < 0) p.y = 0;
        if (p.y > H) p.y = H;

        // Draw sender particles
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (senderType === 'NEURAL' && p.connections) {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
          p.connections.forEach(cid => {
            const target = senderRef.current[cid];
            if (target) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(target.x, target.y);
              ctx.stroke();
            }
          });
        }

        if (p.x > SENDER_W * 0.8) {
          signalAccumulator += p.vy;
        }
      });

      // === THE BOTTLENECK (ENCODING) ===
      if (Math.abs(signalAccumulator) > (1.0 - bandwidth) * 5 && Math.random() > 0.8) {
        const val = Math.tanh(signalAccumulator);
        let symbol = '0';
        if (val > 0.5) symbol = '1';
        else if (val < -0.5) symbol = '0';
        else symbol = Math.random() > 0.5 ? 'A' : 'T';

        packetsRef.current.push({
          x: SENDER_W,
          y: H / 2 + (Math.random() - 0.5) * channelHeight * 0.8,
          val: val,
          symbol: symbol,
          active: true
        });
      }

      // Process and render packets
      packetsRef.current.forEach(pkt => {
        if (!pkt.active) return;
        pkt.x += 4;

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = pkt.val > 0 ? '#34d399' : '#f472b6';
        ctx.fillText(pkt.symbol, pkt.x, pkt.y);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.beginPath();
        ctx.moveTo(pkt.x - 15, pkt.y);
        ctx.lineTo(pkt.x - 5, pkt.y);
        ctx.stroke();

        if (pkt.x >= RECEIVER_X) {
          pkt.active = false;
          receiverRef.current.forEach(p => {
            const dist = Math.abs(p.y - pkt.y);
            if (dist < 100) {
              if (receiverType === 'LORENZ') {
                p.vx += pkt.val * 2;
                p.vy += pkt.val * 2;
              } else if (receiverType === 'NEURAL') {
                p.vx += pkt.val * 5;
                p.vy += (Math.random() - 0.5) * 5;
              } else {
                p.vy += pkt.val * 10;
              }
            }
          });
        }
      });

      packetsRef.current = packetsRef.current.filter(p => p.active || p.x < W);

      // === RIGHT SYSTEM (RECEIVER) ===
      receiverRef.current.forEach(p => {
        if (receiverType === 'LORENZ') {
          lorenzStep(p, 0.01, RECEIVER_X + SENDER_W / 2);
        } else if (receiverType === 'NEURAL') {
          neuralStep(p, receiverRef.current);
        } else {
          const k = 0.02;
          p.vy += (H / 2 - p.y) * k;
          p.vy *= 0.95;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < RECEIVER_X) p.x = RECEIVER_X;
        if (p.x > W) p.x = W;
        if (p.y < 0) p.y = 0;
        if (p.y > H) p.y = H;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const alpha = Math.min(1, 0.3 + speed * 0.2);
        ctx.fillStyle = `rgba(244, 114, 182, ${alpha})`;

        if (receiverType === 'NEURAL' && p.connections) {
          ctx.strokeStyle = `rgba(244, 114, 182, ${alpha * 0.3})`;
          p.connections.forEach(cid => {
            const target = receiverRef.current[cid];
            if (target) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(target.x, target.y);
              ctx.stroke();
            }
          });
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Labels
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('SENDER', SENDER_W / 2, H - 10);
      ctx.fillText('CODE', SENDER_W + GAP / 2, H - 10);
      ctx.fillText('RECEIVER', RECEIVER_X + SENDER_W / 2, H - 10);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current!);
  }, [senderType, receiverType, bandwidth, W, H, SENDER_W, RECEIVER_X, GAP]);

  const handleMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top) * (H / rect.height),
        active: true
      };
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-3 bg-slate-900/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <select
            value={senderType}
            onChange={(e) => setSenderType(e.target.value as SystemType)}
            className="bg-slate-800 text-cyan-400 text-xs font-mono py-1 px-2 rounded border border-slate-700 outline-none hover:border-cyan-500/50 transition-colors"
          >
            <option value="LORENZ">Lorenz (Chaos)</option>
            <option value="NEURAL">Neural (Network)</option>
            <option value="OSCILLATOR">Harmonic (Wave)</option>
          </select>
        </div>

        <div className="flex flex-col items-center gap-1 w-32">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Bandwidth</span>
          <input
            type="range" min="0.2" max="0.9" step="0.1"
            value={bandwidth}
            onChange={(e) => setBandwidth(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={receiverType}
            onChange={(e) => setReceiverType(e.target.value as SystemType)}
            className="bg-slate-800 text-pink-400 text-xs font-mono py-1 px-2 rounded border border-slate-700 outline-none hover:border-pink-500/50 transition-colors"
          >
            <option value="LORENZ">Lorenz (Chaos)</option>
            <option value="NEURAL">Neural (Network)</option>
            <option value="OSCILLATOR">Harmonic (Wave)</option>
          </select>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full aspect-[9/4] bg-black rounded-lg overflow-hidden border border-slate-800 group">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={handleMove}
          onMouseLeave={() => mouseRef.current.active = false}
          className="w-full h-full cursor-crosshair"
        />

        <div className="absolute top-3 left-3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-slate-500">Drag to perturb</p>
        </div>
      </div>
    </div>
  );
}
