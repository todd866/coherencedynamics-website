'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  locked: boolean;
  lockTime?: number;
}

const NUM_PARTICLES = 500;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

export default function MaxwellsLedger() {
  const digitalCanvasRef = useRef<HTMLCanvasElement>(null);
  const bioCanvasRef = useRef<HTMLCanvasElement>(null);
  const [digitalParticles, setDigitalParticles] = useState<Particle[]>([]);
  const [bioParticles, setBioParticles] = useState<Particle[]>([]);
  const [phase, setPhase] = useState<'idle' | 'running' | 'collapsing' | 'done'>('idle');
  const [eventCount, setEventCount] = useState(0);
  const [digitalEnergy, setDigitalEnergy] = useState(0);
  const [bioEnergy, setBioEnergy] = useState(0);
  const [output, setOutput] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const lastEventRef = useRef<number>(0);

  const TOTAL_EVENTS = 12;
  const LANDAUER_COST = 0.003;
  const EVENT_INTERVAL = 600; // ms between events

  // Initialize particles
  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 100 + 50;
      particles.push({
        x: CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
        y: CANVAS_HEIGHT / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        locked: false,
      });
    }
    return particles;
  }, []);

  const reset = useCallback(() => {
    setDigitalParticles(initParticles());
    setBioParticles(initParticles());
    setPhase('idle');
    setEventCount(0);
    setDigitalEnergy(0);
    setBioEnergy(0);
    setOutput(null);
    lastEventRef.current = 0;
  }, [initParticles]);

  useEffect(() => {
    reset();
  }, [reset]);

  const start = () => {
    reset();
    setTimeout(() => {
      setPhase('running');
      lastEventRef.current = performance.now();
    }, 100);
  };

  // Main animation loop
  useEffect(() => {
    if (phase === 'idle') return;

    const animate = (time: number) => {
      // Handle events during running phase
      if (phase === 'running' && time - lastEventRef.current > EVENT_INTERVAL) {
        lastEventRef.current = time;
        setEventCount(prev => {
          const newCount = prev + 1;
          if (newCount >= TOTAL_EVENTS) {
            setPhase('collapsing');
          }
          return newCount;
        });

        // Digital: lock some particles and pay cost
        setDigitalParticles(prev => {
          const unlocked = prev.filter(p => !p.locked);
          const toLock = Math.floor(unlocked.length * 0.15);
          const indices = new Set<number>();
          while (indices.size < toLock && indices.size < unlocked.length) {
            indices.add(Math.floor(Math.random() * unlocked.length));
          }
          let lockIdx = 0;
          return prev.map(p => {
            if (!p.locked) {
              if (indices.has(lockIdx++)) {
                return { ...p, locked: true, lockTime: time };
              }
            }
            return p;
          });
        });
        setDigitalEnergy(prev => prev + LANDAUER_COST * 2);
      }

      // Update digital particles
      setDigitalParticles(prev => prev.map(p => {
        if (p.locked) {
          // Locked particles drift slowly to edges and fade
          const age = time - (p.lockTime || 0);
          const drift = Math.min(age / 2000, 1);
          const centerX = CANVAS_WIDTH / 2;
          const centerY = CANVAS_HEIGHT / 2;
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          return {
            ...p,
            x: p.x + (dx / dist) * drift * 0.5,
            y: p.y + (dy / dist) * drift * 0.5,
          };
        }
        // Free particles move randomly
        let { x, y, vx, vy } = p;
        vx += (Math.random() - 0.5) * 0.3;
        vy += (Math.random() - 0.5) * 0.3;
        vx *= 0.98;
        vy *= 0.98;
        x += vx;
        y += vy;
        // Soft boundaries
        const margin = 50;
        if (x < margin) vx += 0.5;
        if (x > CANVAS_WIDTH - margin) vx -= 0.5;
        if (y < margin) vy += 0.5;
        if (y > CANVAS_HEIGHT - margin) vy -= 0.5;
        return { ...p, x, y, vx, vy };
      }));

      // Update biological particles
      setBioParticles(prev => {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;

        return prev.map(p => {
          let { x, y, vx, vy } = p;

          if (phase === 'collapsing') {
            // Collapse to center
            const dx = centerX - x;
            const dy = centerY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              vx = dx * 0.08;
              vy = dy * 0.08;
            } else {
              vx = 0;
              vy = 0;
              x = centerX + (Math.random() - 0.5) * 10;
              y = centerY + (Math.random() - 0.5) * 10;
            }
          } else {
            // Free movement - swarm behavior
            vx += (Math.random() - 0.5) * 0.4;
            vy += (Math.random() - 0.5) * 0.4;
            // Gentle pull toward center
            vx += (centerX - x) * 0.001;
            vy += (centerY - y) * 0.001;
            vx *= 0.97;
            vy *= 0.97;
          }

          x += vx;
          y += vy;
          // Keep in bounds
          x = Math.max(20, Math.min(CANVAS_WIDTH - 20, x));
          y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, y));

          return { ...p, x, y, vx, vy };
        });
      });

      // Check if collapse is complete
      if (phase === 'collapsing') {
        const allCollapsed = bioParticles.every(p => {
          const dx = CANVAS_WIDTH / 2 - p.x;
          const dy = CANVAS_HEIGHT / 2 - p.y;
          return Math.sqrt(dx * dx + dy * dy) < 20;
        });
        if (allCollapsed || time - lastEventRef.current > 2000) {
          setPhase('done');
          setOutput(Math.floor(Math.random() * (TOTAL_EVENTS + 1)));
          setBioEnergy(LANDAUER_COST * Math.ceil(Math.log2(TOTAL_EVENTS + 1)));
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [phase, bioParticles]);

  // Draw digital canvas
  useEffect(() => {
    const canvas = digitalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw particles
    digitalParticles.forEach(p => {
      if (p.locked) {
        const age = performance.now() - (p.lockTime || 0);
        const alpha = Math.max(0.1, 1 - age / 5000);
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Count indicator
    const unlocked = digitalParticles.filter(p => !p.locked).length;
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${unlocked} states remaining`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);

  }, [digitalParticles]);

  // Draw biological canvas
  useEffect(() => {
    const canvas = bioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw particles with glow effect when collapsing
    if (phase === 'collapsing' || phase === 'done') {
      // Glow at center
      const gradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80
      );
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    bioParticles.forEach(p => {
      ctx.fillStyle = phase === 'done'
        ? 'rgba(34, 197, 94, 0.9)'
        : 'rgba(34, 197, 94, 0.7)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, phase === 'done' ? 2 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Label
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    if (phase === 'done') {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`output = ${output}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
    } else {
      ctx.fillText(`${NUM_PARTICLES} possible paths`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
    }

  }, [bioParticles, phase, output]);

  const lockedCount = digitalParticles.filter(p => p.locked).length;
  const efficiencyRatio = phase === 'done' && bioEnergy > 0
    ? (digitalEnergy / bioEnergy).toFixed(0)
    : '-';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Maxwell&apos;s Ledger</h1>
      <p className="text-gray-500 text-sm mb-8">
        Companion to{' '}
        <Link href="/papers/timing-inaccessibility" className="text-blue-400 hover:text-blue-300">
          Timing Inaccessibility
        </Link>
      </p>

      {/* Main visualization */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Digital */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-white font-medium">Digital Computer</span>
            <span className="text-gray-600 text-sm ml-auto">pays per bit</span>
          </div>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <canvas
              ref={digitalCanvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full"
            />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Bits recorded: <span className="text-red-400">{lockedCount}</span></span>
            <span className="text-gray-500">Energy: <span className="text-red-400">{digitalEnergy.toFixed(3)} kT</span></span>
          </div>
        </div>

        {/* Biological */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-white font-medium">Biological System</span>
            <span className="text-gray-600 text-sm ml-auto">pays at commitment</span>
          </div>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <canvas
              ref={bioCanvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full"
            />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Events: <span className="text-green-400">{eventCount}/{TOTAL_EVENTS}</span></span>
            <span className="text-gray-500">Energy: <span className="text-green-400">{bioEnergy.toFixed(3)} kT</span></span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={phase === 'idle' || phase === 'done' ? start : reset}
          className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {phase === 'idle' ? 'Start' : phase === 'done' ? 'Run Again' : 'Reset'}
        </button>

        {phase === 'done' && (
          <div className="text-gray-400">
            Efficiency gap: <span className="text-yellow-400 font-mono">{efficiencyRatio}×</span>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="border-t border-gray-800 pt-6 text-sm text-gray-400 space-y-3">
        <p>
          <strong className="text-white">Digital:</strong> Every time a signal arrives, the computer
          records its timestamp and value. Each bit erased costs energy (Landauer&apos;s principle).
          Watch the white particles turn red and drift away—those are committed bits.
        </p>
        <p>
          <strong className="text-white">Biological:</strong> The system maintains a cloud of possible
          states. It doesn&apos;t record which path it&apos;s taking until it has to commit to an output.
          All {NUM_PARTICLES} paths collapse to one point, but the thermodynamic cost is only paid once.
        </p>
        <p>
          <strong className="text-white">The insight:</strong> Both systems produce the same output.
          But the digital system paid O(n) in energy while the biological system paid O(log n).
          The &quot;extra&quot; computation—exploring all those paths—was thermodynamically free.
        </p>
      </div>
    </div>
  );
}
