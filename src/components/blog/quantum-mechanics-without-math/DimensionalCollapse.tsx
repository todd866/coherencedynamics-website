'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Props {
  className?: string;
}

export default function DimensionalCollapse({ className = '' }: Props) {
  const [rotation, setRotation] = useState(45);
  const [isAuto, setIsAuto] = useState(true);
  const requestRef = useRef<number>();

  // Generate a Helix path
  const points: Point3D[] = [];
  const numPoints = 120;
  const turns = 3;

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * turns * Math.PI * 2;
    points.push({
      x: Math.cos(t) * 35,
      y: (i / numPoints) * 100 - 50, // Height from -50 to 50
      z: Math.sin(t) * 35
    });
  }

  // Animation Loop
  useEffect(() => {
    if (!isAuto) return;

    const animate = () => {
      setRotation(r => (r + 0.3) % 360);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isAuto]);

  // 3D to 2D projection with rotation around Y axis
  const project = (p: Point3D, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;

    // Rotate around Y axis
    const rx = p.x * Math.cos(rad) - p.z * Math.sin(rad);
    const rz = p.x * Math.sin(rad) + p.z * Math.cos(rad);
    const ry = p.y;

    // Orthographic projection with slight perspective
    const perspective = 400;
    const scale = perspective / (perspective - rz * 0.5);
    const x2d = rx * scale + 200;
    const y2d = -ry * scale + 120;

    return { x: x2d, y: y2d, depth: rz };
  };

  // Generate main helix path
  const projectedPoints = points.map(p => project(p, rotation));
  const mainPath = projectedPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ');

  // Generate floor shadow (top-down projection - circle)
  const floorShadow = points.map((p, i) => {
    const proj = project({ x: p.x, y: 55, z: p.z }, rotation);
    return `${i === 0 ? 'M' : 'L'} ${proj.x.toFixed(1)},${proj.y.toFixed(1)}`;
  }).join(' ');

  // Generate wall shadow (side projection - sine wave)
  const wallShadow = points.map((p, i) => {
    // Project onto a back wall (fixed z, varying x and y)
    const wallX = 320;
    const wallY = -p.y + 120;
    const sinOffset = Math.sin((i / numPoints) * turns * Math.PI * 2) * 25;
    return `${i === 0 ? 'M' : 'L'} ${wallX + sinOffset},${wallY.toFixed(1)}`;
  }).join(' ');

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">Dimensional Collapse</h3>
          <p className="text-gray-400 text-xs">
            A 3D helix creates different &quot;truths&quot; when projected to 2D.
          </p>
        </div>
        <button
          onClick={() => setIsAuto(!isAuto)}
          className={`px-2 py-1 text-xs rounded border ${
            isAuto
              ? 'bg-cyan-900/50 border-cyan-700 text-cyan-200'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}
        >
          {isAuto ? '❚❚ Pause' : '▶ Rotate'}
        </button>
      </div>

      <svg viewBox="0 0 400 240" className="w-full max-w-lg mx-auto bg-gray-950 rounded-lg border border-gray-800">
        <defs>
          <linearGradient id="helixGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Floor plane hint */}
        <path
          d="M 80,200 L 320,200 L 350,180 L 110,180 Z"
          fill="#1f2937"
          opacity="0.3"
        />

        {/* Back wall hint */}
        <rect x="300" y="50" width="60" height="140" fill="#1f2937" opacity="0.2" />

        {/* Wall shadow (sine wave) */}
        <path
          d={wallShadow}
          fill="none"
          stroke="#4b5563"
          strokeWidth="2"
          opacity="0.4"
        />
        <text x="355" y="45" textAnchor="middle" fill="#6b7280" fontSize="9">Side view</text>
        <text x="355" y="205" textAnchor="middle" fill="#6b7280" fontSize="8">(sine wave)</text>

        {/* Floor shadow (circle/ellipse) */}
        <path
          d={floorShadow}
          fill="none"
          stroke="#4b5563"
          strokeWidth="2"
          opacity="0.4"
        />
        <text x="200" y="225" textAnchor="middle" fill="#6b7280" fontSize="9">Top view (circle)</text>

        {/* The 3D Helix */}
        <path
          d={mainPath}
          fill="none"
          stroke="url(#helixGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Labels */}
        <text x="200" y="25" textAnchor="middle" fill="#9ca3af" fontSize="11">
          The 3D object (helix)
        </text>

        {/* Crossing indicator */}
        <g opacity="0.7">
          <circle cx="330" cy="120" r="4" fill="#ef4444" />
          <text x="330" y="135" textAnchor="middle" fill="#ef4444" fontSize="7">crosses!</text>
        </g>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 text-center text-xs">
        <div className="p-2 bg-gray-800 rounded border border-gray-700">
          <span className="block text-cyan-400 font-semibold">Top → Circle</span>
          <span className="text-gray-400">Points overlap. Looks like a loop.</span>
        </div>
        <div className="p-2 bg-gray-800 rounded border border-gray-700">
          <span className="block text-orange-400 font-semibold">Side → Sine</span>
          <span className="text-gray-400">Trajectories cross. Looks like oscillation.</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        The helix never crosses itself. The &quot;crossings&quot; are artifacts of projection—just like quantum &quot;paradoxes.&quot;
      </p>
    </div>
  );
}
