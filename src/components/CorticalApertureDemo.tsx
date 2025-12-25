'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  className?: string;
  compact?: boolean;
}

export default function CorticalApertureDemo({ className = '', compact = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interfaceK, setInterfaceK] = useState(3);
  const [showPR, setShowPR] = useState(true);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const canvasWidth = compact ? 320 : 700;
  const canvasHeight = compact ? 180 : 220;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    timeRef.current += 0.02;
    const t = timeRef.current;

    ctx.clearRect(0, 0, W, H);

    // Three panels
    const panelWidth = W / 3;
    const panelHeight = H - 40;
    const panelY = 30;

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = compact ? '10px system-ui' : '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Substrate (high PR)', panelWidth / 2, 18);
    ctx.fillText('Interface (k=' + interfaceK + ')', panelWidth + panelWidth / 2, 18);
    ctx.fillText('Expressed', 2 * panelWidth + panelWidth / 2, 18);

    // Panel backgrounds
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.fillRect(5, panelY, panelWidth - 10, panelHeight);
    ctx.fillRect(panelWidth + 5, panelY, panelWidth - 10, panelHeight);
    ctx.fillRect(2 * panelWidth + 5, panelY, panelWidth - 10, panelHeight);

    // === PANEL 1: Substrate (many oscillators) ===
    const nOscillators = 24;
    const cx1 = panelWidth / 2;
    const cy1 = panelY + panelHeight / 2;
    const radius = compact ? 50 : 65;

    // Slow mode: all oscillators in sync (high PR)
    const slowPhase = t * 0.5;

    for (let i = 0; i < nOscillators; i++) {
      const angle = (i / nOscillators) * Math.PI * 2;
      const x = cx1 + Math.cos(angle) * radius;
      const y = cy1 + Math.sin(angle) * radius;

      // Oscillator amplitude based on slow mode participation
      const participation = 0.8 + 0.2 * Math.sin(slowPhase + angle * 0.1);
      const oscSize = compact ? 4 : 6;
      const brightness = Math.floor(150 + participation * 100);

      // Draw oscillator
      ctx.beginPath();
      ctx.arc(x, y, oscSize * participation, 0, Math.PI * 2);
      ctx.fillStyle = showPR
        ? `rgb(${brightness}, ${Math.floor(brightness * 0.7)}, ${Math.floor(brightness * 0.3)})`
        : '#60a5fa';
      ctx.fill();

      // Connection lines (coherence)
      if (showPR && i > 0) {
        const prevAngle = ((i - 1) / nOscillators) * Math.PI * 2;
        const px = cx1 + Math.cos(prevAngle) * radius;
        const py = cy1 + Math.sin(prevAngle) * radius;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(251, 191, 36, ${participation * 0.5})`;
        ctx.lineWidth = participation * 2;
        ctx.stroke();
      }
    }

    // Close the ring
    if (showPR) {
      const firstAngle = 0;
      const lastAngle = ((nOscillators - 1) / nOscillators) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx1 + Math.cos(lastAngle) * radius, cy1 + Math.sin(lastAngle) * radius);
      ctx.lineTo(cx1 + Math.cos(firstAngle) * radius, cy1 + Math.sin(firstAngle) * radius);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // PR label
    ctx.fillStyle = '#fbbf24';
    ctx.font = compact ? '9px system-ui' : '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PR ≈ ' + nOscillators, cx1, cy1 + (compact ? 8 : 10));

    // === PANEL 2: Interface (k-dimensional bottleneck) ===
    const cx2 = panelWidth + panelWidth / 2;
    const cy2 = panelY + panelHeight / 2;

    // Draw funnel/aperture
    ctx.beginPath();
    ctx.moveTo(cx2 - 40, panelY + 10);
    ctx.lineTo(cx2 - 15, cy2);
    ctx.lineTo(cx2 - 40, panelY + panelHeight - 10);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx2 + 40, panelY + 10);
    ctx.lineTo(cx2 + 15, cy2);
    ctx.lineTo(cx2 + 40, panelY + panelHeight - 10);
    ctx.stroke();

    // Aperture opening (scales with k)
    const apertureHeight = 8 + interfaceK * 12;
    ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.fillRect(cx2 - 15, cy2 - apertureHeight / 2, 30, apertureHeight);

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx2 - 15, cy2 - apertureHeight / 2, 30, apertureHeight);

    // k value in aperture
    ctx.fillStyle = '#e0e7ff';
    ctx.font = compact ? 'bold 12px system-ui' : 'bold 14px system-ui';
    ctx.fillText('k=' + interfaceK, cx2, cy2 + 4);

    // === PANEL 3: Expressed structure ===
    const cx3 = 2 * panelWidth + panelWidth / 2;
    const cy3 = panelY + panelHeight / 2;

    if (interfaceK === 1) {
      // k=1: Just a point (scalar readout)
      ctx.beginPath();
      ctx.arc(cx3, cy3, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.fillStyle = '#fecaca';
      ctx.font = compact ? '8px system-ui' : '9px system-ui';
      ctx.fillText('Scalar', cx3, cy3 + 25);
      ctx.fillText('(no dynamics)', cx3, cy3 + 36);
    } else if (interfaceK === 2) {
      // k=2: Circle with collisions (cycle aliasing)
      const r = compact ? 35 : 45;
      const nPoints = 60;

      // Draw circle trajectory
      ctx.beginPath();
      for (let i = 0; i <= nPoints; i++) {
        const theta = (i / nPoints) * Math.PI * 4; // 2 cycles
        const x = cx3 + Math.cos(theta) * r;
        const y = cy3 + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Collision markers
      for (let i = 0; i < 4; i++) {
        const theta = (i / 4) * Math.PI * 2;
        const x = cx3 + Math.cos(theta) * r;
        const y = cy3 + Math.sin(theta) * r;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        // X mark
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 4);
        ctx.lineTo(x + 4, y + 4);
        ctx.moveTo(x + 4, y - 4);
        ctx.lineTo(x - 4, y + 4);
        ctx.stroke();
      }

      ctx.fillStyle = '#fecaca';
      ctx.font = compact ? '8px system-ui' : '9px system-ui';
      ctx.fillText('Cycle aliasing', cx3, cy3 + (compact ? 55 : 65));
    } else {
      // k≥3: Helix (continuous dynamics preserved)
      const r = compact ? 30 : 40;
      const zRange = compact ? 50 : 70;
      const nPoints = 80;

      // Draw helix
      ctx.beginPath();
      for (let i = 0; i <= nPoints; i++) {
        const progress = i / nPoints;
        const theta = progress * Math.PI * 4;
        const x = cx3 + Math.cos(theta + t) * r;
        const z = (progress - 0.5) * zRange;
        const y = cy3 + Math.sin(theta + t) * r * 0.4 + z;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add gradient coloring for depth
      for (let i = 0; i <= nPoints; i += 4) {
        const progress = i / nPoints;
        const theta = progress * Math.PI * 4;
        const x = cx3 + Math.cos(theta + t) * r;
        const z = (progress - 0.5) * zRange;
        const y = cy3 + Math.sin(theta + t) * r * 0.4 + z;

        const brightness = Math.floor(120 + progress * 135);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.floor(brightness * 0.2)}, ${brightness}, ${Math.floor(brightness * 0.4)})`;
        ctx.fill();
      }

      ctx.fillStyle = '#bbf7d0';
      ctx.font = compact ? '8px system-ui' : '9px system-ui';
      ctx.fillText('Continuous', cx3, cy3 + (compact ? 55 : 65));
      ctx.fillText('(no aliasing)', cx3, cy3 + (compact ? 66 : 76));
    }

    // Arrow from panel 1 to 2
    ctx.beginPath();
    ctx.moveTo(panelWidth - 20, cy1);
    ctx.lineTo(panelWidth + 10, cy2);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(panelWidth + 10, cy2);
    ctx.lineTo(panelWidth + 2, cy2 - 5);
    ctx.lineTo(panelWidth + 2, cy2 + 5);
    ctx.closePath();
    ctx.fillStyle = '#4b5563';
    ctx.fill();

    // Arrow from panel 2 to 3
    ctx.beginPath();
    ctx.moveTo(2 * panelWidth - 20, cy2);
    ctx.lineTo(2 * panelWidth + 10, cy3);
    ctx.strokeStyle = '#4b5563';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2 * panelWidth + 10, cy3);
    ctx.lineTo(2 * panelWidth + 2, cy3 - 5);
    ctx.lineTo(2 * panelWidth + 2, cy3 + 5);
    ctx.closePath();
    ctx.fill();

    animationRef.current = requestAnimationFrame(render);
  }, [interfaceK, showPR, compact]);

  useEffect(() => {
    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  const getMessage = () => {
    if (interfaceK === 1) {
      return 'k=1: Scalar readout loses all dynamics. Pure affect—no nuance.';
    } else if (interfaceK === 2) {
      return 'k=2: Cycles collide. System forced into discrete categories.';
    } else {
      return 'k≥3: Helix preserves temporal structure. Continuous dynamics possible.';
    }
  };

  return (
    <div className={`${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="bg-gray-900 rounded-lg w-full"
      />

      <div className={`mt-3 ${compact ? 'space-y-2' : 'flex items-center gap-6'}`}>
        {/* Interface k slider */}
        <div className={compact ? '' : 'flex-1'}>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Interface Dimension (k)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((k) => (
              <button
                key={k}
                onClick={() => setInterfaceK(k)}
                className={`flex-1 px-2 py-1 rounded text-sm ${
                  interfaceK === k
                    ? k <= 2 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* PR toggle */}
        {!compact && (
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Show Coherence
            </label>
            <button
              onClick={() => setShowPR(!showPR)}
              className={`px-3 py-1 rounded text-sm ${
                showPR ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {showPR ? 'On' : 'Off'}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      <div className={`mt-3 p-2 rounded text-xs ${
        interfaceK <= 2 ? 'bg-red-900/30 text-red-200 border border-red-800'
                        : 'bg-green-900/30 text-green-200 border border-green-800'
      }`}>
        {getMessage()}
      </div>
    </div>
  );
}
