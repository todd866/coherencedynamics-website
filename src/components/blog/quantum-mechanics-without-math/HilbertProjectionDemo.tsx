'use client';

import React, { useState, useMemo } from 'react';

interface Props {
  className?: string;
}

export default function HilbertProjectionDemo({ className = '' }: Props) {
  const [theta, setTheta] = useState(45); // State angle in degrees
  const [basisAngle, setBasisAngle] = useState(0); // Measurement basis angle
  const [showProjection, setShowProjection] = useState(false);

  const rad = (deg: number) => (deg * Math.PI) / 180;

  const stateVec = useMemo(() => ({
    x: Math.cos(rad(theta)),
    y: Math.sin(rad(theta)),
  }), [theta]);

  const basisVec = useMemo(() => ({
    x: Math.cos(rad(basisAngle)),
    y: Math.sin(rad(basisAngle)),
  }), [basisAngle]);

  const orthoBasisVec = useMemo(() => ({
    x: -Math.sin(rad(basisAngle)),
    y: Math.cos(rad(basisAngle)),
  }), [basisAngle]);

  // Projection of state onto basis
  const dotProduct = stateVec.x * basisVec.x + stateVec.y * basisVec.y;
  const projectionLength = dotProduct;
  const projectedVec = {
    x: projectionLength * basisVec.x,
    y: projectionLength * basisVec.y,
  };

  // Probability of measuring in this basis
  const probability = dotProduct * dotProduct;

  // SVG coordinates (flip y for standard math coords)
  const scale = 100;
  const cx = 180, cy = 150;
  const toSvg = (v: { x: number; y: number }) => ({
    x: cx + v.x * scale,
    y: cy - v.y * scale,
  });

  const stateEnd = toSvg(stateVec);
  const basisEnd = toSvg(basisVec);
  const projEnd = toSvg(projectedVec);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Measurement as Projection</h3>
        <p className="text-xs text-gray-500">Drag the sliders to see how measurement works geometrically</p>
      </div>

      <div className="flex gap-4">
        {/* SVG Visualization */}
        <svg viewBox="0 0 360 300" className="w-2/3 bg-black rounded border border-gray-800">
          {/* Grid */}
          <line x1={cx - 130} y1={cy} x2={cx + 130} y2={cy} stroke="#374151" strokeWidth="1" />
          <line x1={cx} y1={cy - 130} x2={cx} y2={cy + 130} stroke="#374151" strokeWidth="1" />

          {/* Unit circle (faint) */}
          <circle cx={cx} cy={cy} r={scale} fill="none" stroke="#374151" strokeWidth="0.5" strokeDasharray="4,4" />

          {/* Measurement basis axes */}
          <line
            x1={cx - basisVec.x * 120}
            y1={cy + basisVec.y * 120}
            x2={cx + basisVec.x * 120}
            y2={cy - basisVec.y * 120}
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="6,3"
          />
          <line
            x1={cx - orthoBasisVec.x * 120}
            y1={cy + orthoBasisVec.y * 120}
            x2={cx + orthoBasisVec.x * 120}
            y2={cy - orthoBasisVec.y * 120}
            stroke="#8b5cf640"
            strokeWidth="1"
            strokeDasharray="6,3"
          />

          {/* Projection line (state to projection point) */}
          {showProjection && (
            <line
              x1={stateEnd.x}
              y1={stateEnd.y}
              x2={projEnd.x}
              y2={projEnd.y}
              stroke="#22c55e"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
          )}

          {/* Projected vector */}
          {showProjection && (
            <line
              x1={cx}
              y1={cy}
              x2={projEnd.x}
              y2={projEnd.y}
              stroke="#22c55e"
              strokeWidth="3"
            />
          )}

          {/* State vector |ψ⟩ */}
          <line
            x1={cx}
            y1={cy}
            x2={stateEnd.x}
            y2={stateEnd.y}
            stroke="#06b6d4"
            strokeWidth="2.5"
          />
          <circle cx={stateEnd.x} cy={stateEnd.y} r="5" fill="#06b6d4" />

          {/* Basis vector */}
          <circle cx={basisEnd.x} cy={basisEnd.y} r="4" fill="#8b5cf6" />

          {/* Labels */}
          <text x={stateEnd.x + 8} y={stateEnd.y - 8} fill="#06b6d4" fontSize="12" fontWeight="bold">
            |ψ⟩
          </text>
          <text x={basisEnd.x + 8} y={basisEnd.y} fill="#8b5cf6" fontSize="11">
            |m⟩
          </text>
          {showProjection && (
            <text x={projEnd.x + 8} y={projEnd.y + 15} fill="#22c55e" fontSize="10">
              P|ψ⟩
            </text>
          )}

          {/* Origin label */}
          <text x={cx - 25} y={cy + 15} fill="#6b7280" fontSize="9">origin</text>

          {/* Angle arc */}
          <path
            d={`M${cx + 25} ${cy} A25 25 0 ${theta > 180 ? 1 : 0} 0 ${cx + 25 * Math.cos(rad(theta))} ${cy - 25 * Math.sin(rad(theta))}`}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
          />
          <text x={cx + 35} y={cy - 10} fill="#06b6d4" fontSize="9">θ</text>
        </svg>

        {/* Controls and Math */}
        <div className="w-1/3 space-y-4">
          {/* State angle control */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              State angle θ: <span className="text-cyan-400 font-mono">{theta}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={theta}
              onChange={(e) => setTheta(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Basis angle control */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Measurement basis: <span className="text-purple-400 font-mono">{basisAngle}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="180"
              value={basisAngle}
              onChange={(e) => setBasisAngle(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Show projection toggle */}
          <button
            onClick={() => setShowProjection(!showProjection)}
            className={`w-full py-2 rounded text-sm font-medium transition-all ${
              showProjection
                ? 'bg-green-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {showProjection ? 'Hide' : 'Show'} Projection
          </button>

          {/* Math display */}
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <p className="text-xs text-gray-400">The math:</p>
            <p className="text-sm font-mono text-white">
              |ψ⟩ = ({stateVec.x.toFixed(2)}, {stateVec.y.toFixed(2)})
            </p>
            <p className="text-sm font-mono text-purple-300">
              |m⟩ = ({basisVec.x.toFixed(2)}, {basisVec.y.toFixed(2)})
            </p>
            {showProjection && (
              <>
                <p className="text-sm font-mono text-green-300">
                  ⟨m|ψ⟩ = {dotProduct.toFixed(3)}
                </p>
                <p className="text-sm font-mono text-yellow-300">
                  P(m) = |⟨m|ψ⟩|² = {(probability * 100).toFixed(1)}%
                </p>
              </>
            )}
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setTheta(45); setBasisAngle(0); }}
              className="text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
            >
              45° state, 0° basis
            </button>
            <button
              onClick={() => { setTheta(45); setBasisAngle(45); }}
              className="text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
            >
              Aligned (100%)
            </button>
            <button
              onClick={() => { setTheta(45); setBasisAngle(135); }}
              className="text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
            >
              Orthogonal (0%)
            </button>
            <button
              onClick={() => { setTheta(60); setBasisAngle(30); }}
              className="text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
            >
              30° difference
            </button>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
        <p>
          <strong className="text-white">What this shows:</strong> The quantum state |ψ⟩ (cyan) is a vector.
          When you measure in the basis |m⟩ (purple), you project |ψ⟩ onto that axis.
          The probability of getting that outcome is the squared length of the projection: |⟨m|ψ⟩|².
        </p>
        <p className="mt-2 text-gray-400 text-xs">
          This is all that Born&apos;s rule says. The &ldquo;collapse&rdquo; is just: after measurement, the state becomes the projection.
        </p>
        <p className="mt-1 text-gray-500 text-xs">
          (Probabilities depend on relative angle; rotating by 180° flips the sign but not |⟨m|ψ⟩|².)
        </p>
      </div>
    </div>
  );
}
