'use client';

/**
 * =============================================================================
 * CodeForming - Bidirectional Code-Dynamics Coupling
 * =============================================================================
 *
 * CORE INSIGHT:
 * Code doesn't just passively represent dynamics - it CONSTRAINS them.
 * Each symbol (A, C, G, T) corresponds to a rotation attractor.
 * As dimensionality collapses, the code stabilizes AND pulls the dynamics
 * toward the associated rotation.
 *
 * THE PHYSICS:
 * - Rotation phase determines which base gets assigned
 * - Once assigned (with hysteresis), the base pulls dynamics toward its attractor
 * - At full collapse: single letter completely controls rotation
 *
 * THE ENCODING:
 * - A = phase 0 (rightward)
 * - C = phase π/2 (upward)
 * - G = phase π (leftward)
 * - T = phase 3π/2 (downward)
 *
 * =============================================================================
 */

import { useRef, useEffect, useCallback } from 'react';

// =============================================================================
// CONSTANTS
// =============================================================================

const BASES = ['A', 'C', 'G', 'T'] as const;
type Base = typeof BASES[number];

// Each base corresponds to a rotation phase attractor
const BASE_PHASES: Record<Base, number> = {
  'A': 0,
  'C': Math.PI / 2,
  'G': Math.PI,
  'T': (3 * Math.PI) / 2,
};

const BASE_COLORS: Record<Base, string> = {
  'A': '#22c55e',  // Green - Adenine
  'C': '#3b82f6',  // Blue - Cytosine
  'G': '#f59e0b',  // Amber - Guanine
  'T': '#ef4444',  // Red - Thymine
};

// Physics
const DAMPING = 0.002;
const CODE_FEEDBACK_STRENGTH = 0.08;  // How strongly code pulls dynamics
const HYSTERESIS = 0.3;  // Noise threshold before switching bases

interface CodeFormingProps {
  fullPage?: boolean;
}

interface PhysicsState {
  // Main rotation angle (the "phase" that encodes to bases)
  angle: number;
  omega: number;  // Angular velocity

  // Current assigned base (with hysteresis)
  currentBase: Base;
  baseStability: number;  // 0-1, how stable the current assignment is

  // Observer dimensionality: 4.0 (free dynamics) → 2.0 (code-locked)
  observerDim: number;

  // Interaction
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;
  lastMoveTime: number;
  activeControl: string | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CodeForming({ fullPage = false }: CodeFormingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const SCALE = 2;
  const BASE_W = fullPage ? 900 : 700;
  const BASE_H = fullPage ? 700 : 500;
  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;
  const VIEW_HEIGHT = fullPage ? H * 0.75 : H * 0.85;

  const physics = useRef<PhysicsState>({
    angle: Math.random() * Math.PI * 2,
    omega: 0.02,
    currentBase: 'A',
    baseStability: 0,
    observerDim: 4.0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    lastMoveTime: 0,
    activeControl: null,
  });

  // Particle positions for the shape visualization
  const particles = useRef<{ x: number; y: number; basePhase: number }[]>([]);

  // Initialize particles
  useEffect(() => {
    const pts: { x: number; y: number; basePhase: number }[] = [];
    // Create a rotating structure
    for (let i = 0; i < 60; i++) {
      const r = 0.3 + Math.random() * 0.7;
      const theta = (i / 60) * Math.PI * 2;
      pts.push({
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        basePhase: theta,  // Each particle has an inherent phase offset
      });
    }
    // Add some inner particles
    for (let i = 0; i < 20; i++) {
      const r = Math.random() * 0.3;
      const theta = Math.random() * Math.PI * 2;
      pts.push({
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        basePhase: theta,
      });
    }
    particles.current = pts;
  }, []);

  // ---------------------------------------------------------------------------
  // Determine base from angle
  // ---------------------------------------------------------------------------
  const getBaseFromAngle = useCallback((angle: number): Base => {
    // Normalize angle to [0, 2π)
    const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Each base covers a quadrant
    if (norm < Math.PI / 2) return 'A';
    if (norm < Math.PI) return 'C';
    if (norm < 3 * Math.PI / 2) return 'G';
    return 'T';
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

      // -----------------------------------------------------------------------
      // PHYSICS UPDATE
      // -----------------------------------------------------------------------

      if (!state.isDragging || state.activeControl === 'dim') {
        // Determine what base the current angle maps to
        const naturalBase = getBaseFromAngle(state.angle);

        // Update base assignment with hysteresis
        if (naturalBase !== state.currentBase) {
          state.baseStability -= 0.02;
          if (state.baseStability < -HYSTERESIS) {
            state.currentBase = naturalBase;
            state.baseStability = 0;
          }
        } else {
          state.baseStability = Math.min(1, state.baseStability + 0.05);
        }

        // CODE FEEDBACK: The assigned base pulls the dynamics toward its attractor
        // Strength increases with collapse
        const targetPhase = BASE_PHASES[state.currentBase];
        let phaseDiff = targetPhase - (state.angle % (Math.PI * 2));

        // Normalize to [-π, π]
        while (phaseDiff > Math.PI) phaseDiff -= Math.PI * 2;
        while (phaseDiff < -Math.PI) phaseDiff += Math.PI * 2;

        // Apply feedback force (stronger at higher collapse)
        const feedbackStrength = CODE_FEEDBACK_STRENGTH * collapseFactor * collapseFactor;
        state.omega += phaseDiff * feedbackStrength;

        // Damping
        state.omega *= (1 - DAMPING);

        // At extreme collapse, lock to the attractor
        if (collapseFactor > 0.95) {
          state.omega *= 0.8;  // Strong damping
          state.angle += (targetPhase - state.angle) * 0.1;  // Snap toward attractor
        }

        // Integrate
        state.angle += state.omega;
      }

      // -----------------------------------------------------------------------
      // RENDERING
      // -----------------------------------------------------------------------

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      const centerX = W / 2;
      const centerY = VIEW_HEIGHT / 2;
      const radius = Math.min(W, VIEW_HEIGHT) * 0.35;

      // Current base color
      const baseColor = BASE_COLORS[state.currentBase];

      // -----------------------------------------------------------------------
      // Draw rotating structure
      // -----------------------------------------------------------------------

      if (collapseFactor < 0.9) {
        // Draw particles
        particles.current.forEach((p) => {
          // Rotate particle by current angle
          const rotatedX = p.x * Math.cos(state.angle) - p.y * Math.sin(state.angle);
          const rotatedY = p.x * Math.sin(state.angle) + p.y * Math.cos(state.angle);

          const screenX = centerX + rotatedX * radius;
          const screenY = centerY + rotatedY * radius;

          // Particle's phase determines its color (which base it would encode)
          const particleAngle = (state.angle + p.basePhase) % (Math.PI * 2);
          const particleBase = getBaseFromAngle(particleAngle);
          const particleColor = BASE_COLORS[particleBase];

          // Size and alpha based on collapse
          const size = (3 + (1 - collapseFactor) * 3) * SCALE;
          const alpha = 0.4 + (1 - collapseFactor) * 0.6;

          // At higher collapse, particles drift toward center
          const driftFactor = collapseFactor * collapseFactor;
          const driftX = screenX * (1 - driftFactor) + centerX * driftFactor;
          const driftY = screenY * (1 - driftFactor) + centerY * driftFactor;

          ctx.fillStyle = particleColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.arc(driftX, driftY, size, 0, Math.PI * 2);
          ctx.fill();

          // At medium collapse, show the base letter on each particle
          if (collapseFactor > 0.3 && collapseFactor < 0.9) {
            ctx.font = `${(10 + collapseFactor * 8) * SCALE}px monospace`;
            ctx.fillStyle = particleColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particleBase, driftX, driftY);
          }
        });

        // Draw rotation indicator
        const indicatorX = centerX + Math.cos(state.angle) * radius * 0.5;
        const indicatorY = centerY + Math.sin(state.angle) * radius * 0.5;

        ctx.strokeStyle = baseColor + '88';
        ctx.lineWidth = 2 * SCALE;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(indicatorX, indicatorY);
        ctx.stroke();

        // Arrow head
        const arrowSize = 15 * SCALE;
        const arrowAngle = state.angle;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(indicatorX, indicatorY);
        ctx.lineTo(
          indicatorX - Math.cos(arrowAngle - 0.3) * arrowSize,
          indicatorY - Math.sin(arrowAngle - 0.3) * arrowSize
        );
        ctx.lineTo(
          indicatorX - Math.cos(arrowAngle + 0.3) * arrowSize,
          indicatorY - Math.sin(arrowAngle + 0.3) * arrowSize
        );
        ctx.closePath();
        ctx.fill();
      }

      // -----------------------------------------------------------------------
      // Draw the dominant base (grows with collapse)
      // -----------------------------------------------------------------------

      const baseSize = 40 + collapseFactor * 160;
      const baseAlpha = 0.3 + collapseFactor * 0.7;

      ctx.save();
      ctx.font = `bold ${baseSize * SCALE}px monospace`;
      ctx.fillStyle = baseColor;
      ctx.globalAlpha = baseAlpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Glow effect
      if (collapseFactor > 0.5) {
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 30 * SCALE * collapseFactor;
      }

      ctx.fillText(state.currentBase, centerX, centerY);
      ctx.restore();

      // -----------------------------------------------------------------------
      // Phase indicator ring
      // -----------------------------------------------------------------------

      const ringRadius = radius * 1.1;
      const ringWidth = 8 * SCALE;

      // Draw base regions
      BASES.forEach((base, i) => {
        const startAngle = (i * Math.PI / 2) - Math.PI / 4;
        const endAngle = startAngle + Math.PI / 2;

        ctx.strokeStyle = BASE_COLORS[base] + (base === state.currentBase ? 'cc' : '44');
        ctx.lineWidth = base === state.currentBase ? ringWidth * 1.5 : ringWidth;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
        ctx.stroke();

        // Label
        const labelAngle = startAngle + Math.PI / 4;
        const labelR = ringRadius + 25 * SCALE;
        ctx.font = `bold ${14 * SCALE}px monospace`;
        ctx.fillStyle = BASE_COLORS[base] + (base === state.currentBase ? 'ff' : '66');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(base, centerX + Math.cos(labelAngle) * labelR, centerY + Math.sin(labelAngle) * labelR);
      });

      // Current angle marker
      const markerAngle = state.angle - Math.PI / 4;  // Offset to align with regions
      const markerR = ringRadius;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(
        centerX + Math.cos(markerAngle) * markerR,
        centerY + Math.sin(markerAngle) * markerR,
        6 * SCALE,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // -----------------------------------------------------------------------
      // Header
      // -----------------------------------------------------------------------

      const modeLabel = collapseFactor < 0.3 ? 'FREE DYNAMICS' :
                        collapseFactor < 0.7 ? 'ENCODING' :
                        collapseFactor < 0.95 ? 'CODE FEEDBACK' : 'LOCKED';

      ctx.fillStyle = baseColor;
      ctx.font = `bold ${14 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('CODE FORMING', 20 * SCALE, 24 * SCALE);

      ctx.fillStyle = '#666';
      ctx.font = `${11 * SCALE}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${state.observerDim.toFixed(2)}D → ${modeLabel}`, W - 20 * SCALE, 24 * SCALE);

      // Stability indicator
      ctx.fillStyle = '#444';
      ctx.font = `${10 * SCALE}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`STABILITY: ${(state.baseStability * 100).toFixed(0)}%`, 20 * SCALE, 44 * SCALE);

      // Feedback strength
      const feedbackPct = (collapseFactor * collapseFactor * 100).toFixed(0);
      ctx.fillText(`FEEDBACK: ${feedbackPct}%`, 20 * SCALE, 60 * SCALE);

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

      const panelY = VIEW_HEIGHT + 20 * SCALE;
      const padding = 20 * SCALE;

      // Dimensionality slider
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('OBSERVATION DIMENSIONALITY', padding, panelY);

      const statusText = collapseFactor > 0.9 ? '>> LOCKED <<' :
                         collapseFactor > 0.5 ? '>> ENCODING <<' : '>> FREE <<';
      ctx.fillStyle = baseColor;
      ctx.textAlign = 'right';
      ctx.font = `bold ${9 * SCALE}px monospace`;
      ctx.fillText(statusText, W - padding, panelY);

      const dimSliderX = padding;
      const dimSliderW = W - padding * 2;
      const dimSliderY = panelY + 16 * SCALE;
      const dimSliderH = 14 * SCALE;

      // Track
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimSliderW, dimSliderH, 7 * SCALE);
      ctx.fill();

      // Gradient fill
      const gradient = ctx.createLinearGradient(dimSliderX, 0, dimSliderX + dimSliderW, 0);
      gradient.addColorStop(0, BASE_COLORS[state.currentBase]);
      gradient.addColorStop(0.5, '#666');
      gradient.addColorStop(1, '#3b82f6');

      const dimNorm = (state.observerDim - 2.0) / 2.0;
      const dimFillW = dimNorm * dimSliderW;

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(dimSliderX, dimSliderY, dimFillW, dimSliderH, 7 * SCALE);
      ctx.fill();

      // Handle
      const dimHandleX = dimSliderX + dimFillW;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(dimHandleX, dimSliderY + dimSliderH / 2, 12 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 3 * SCALE;
      ctx.stroke();

      // Labels
      ctx.font = `${9 * SCALE}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillStyle = BASE_COLORS[state.currentBase];
      ctx.fillText('2D LOCKED', dimSliderX, dimSliderY + dimSliderH + 16 * SCALE);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText('3D ENCODING', dimSliderX + dimSliderW / 2, dimSliderY + dimSliderH + 16 * SCALE);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('4D FREE', dimSliderX + dimSliderW, dimSliderY + dimSliderH + 16 * SCALE);

      // -----------------------------------------------------------------------
      // Instructions
      // -----------------------------------------------------------------------

      if (fullPage) {
        ctx.fillStyle = '#444';
        ctx.font = `${10 * SCALE}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(
          'Drag to spin • Slider to collapse dimensionality • Watch code form and feedback into dynamics',
          centerX,
          VIEW_HEIGHT + 80 * SCALE
        );
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [getBaseFromAngle, W, H, VIEW_HEIGHT, fullPage]);

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
    const panelY = VIEW_HEIGHT + 20 * SCALE;
    const padding = 20 * SCALE;

    // Dimensionality slider
    const dimSliderY = panelY + 16 * SCALE;
    const dimSliderW = W - padding * 2;
    if (y >= dimSliderY - 15 * SCALE && y <= dimSliderY + 30 * SCALE) {
      state.isDragging = true;
      state.activeControl = 'dim';
      const norm = Math.max(0, Math.min(1, (x - padding) / dimSliderW));
      state.observerDim = 2.0 + norm * 2.0;
      return;
    }

    // Visualization drag
    if (y < VIEW_HEIGHT) {
      state.isDragging = true;
      state.activeControl = 'viz';
      state.lastMouseX = x;
      state.lastMouseY = y;
      state.lastMoveTime = Date.now();
    }
  }, [getCanvasCoords, W, VIEW_HEIGHT]);

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
    } else if (state.activeControl === 'viz') {
      const dx = x - state.lastMouseX;

      // Horizontal drag controls rotation
      state.omega += dx * 0.0001;

      state.lastMouseX = x;
      state.lastMouseY = y;
      state.lastMoveTime = Date.now();
    }
  }, [getCanvasCoords, W]);

  const handleEnd = useCallback(() => {
    const state = physics.current;
    state.isDragging = false;
    state.activeControl = null;
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
