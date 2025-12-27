'use client';

import React, { useState } from 'react';

interface Props {
  className?: string;
}

export default function ProjectionDiagram({ className = '' }: Props) {
  const [angle, setAngle] = useState<'front' | 'side' | 'top'>('front');

  // Isometric mug component - cleaner 3D representation
  const IsometricMug = () => (
    <g transform="translate(80, 100)">
      <text x="0" y="-75" textAnchor="middle" fill="#6b7280" fontSize="10">The 3D object</text>

      {/* Shadow/base ellipse */}
      <ellipse cx="0" cy="30" rx="30" ry="10" fill="#1f2937" opacity="0.5" />

      {/* Mug body - back wall */}
      <path
        d="M -28 -40 L -28 20 A 28 10 0 0 0 28 20 L 28 -40"
        fill="#4b5563"
        stroke="#6b7280"
        strokeWidth="1"
      />

      {/* Mug body - front face */}
      <ellipse cx="0" cy="20" rx="28" ry="10" fill="#374151" stroke="#6b7280" strokeWidth="1" />

      {/* Mug interior - top opening */}
      <ellipse cx="0" cy="-40" rx="28" ry="10" fill="#1f2937" stroke="#6b7280" strokeWidth="1" />

      {/* Mug rim highlight */}
      <ellipse cx="0" cy="-40" rx="24" ry="8" fill="none" stroke="#9ca3af" strokeWidth="0.5" />

      {/* Handle - clean arc on right side */}
      <path
        d="M 28 -30
           C 55 -30, 55 10, 28 10"
        fill="none"
        stroke="#6b7280"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 28 -30
           C 50 -30, 50 10, 28 10"
        fill="none"
        stroke="#4b5563"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm">A coffee mug looks completely different depending on your viewpoint.</p>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => setAngle('front')}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            angle === 'front' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Front view
        </button>
        <button
          onClick={() => setAngle('side')}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            angle === 'side' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Side view
        </button>
        <button
          onClick={() => setAngle('top')}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            angle === 'top' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Top view
        </button>
      </div>

      <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto">
        {/* Background */}
        <rect width="400" height="200" fill="#111" />

        {/* 3D coffee mug (always shown) */}
        <IsometricMug />

        {/* Arrow */}
        <path d="M150 100 L200 100" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>
        <text x="175" y="90" textAnchor="middle" fill="#6b7280" fontSize="9">project</text>

        {/* 2D projection */}
        <g transform="translate(300, 100)">
          <text x="0" y="-75" textAnchor="middle" fill="#6b7280" fontSize="10">What you see</text>

          {angle === 'front' && (
            <>
              {/* Rectangle (mug body from front, handle hidden behind) */}
              <rect x="-30" y="-45" width="60" height="65" fill="#06b6d4" opacity="0.8" rx="3" />
              {/* Slight rim indication */}
              <rect x="-26" y="-45" width="52" height="4" fill="#0891b2" opacity="0.6" rx="1" />
              <text x="0" y="40" textAnchor="middle" fill="#06b6d4" fontSize="11">Rectangle</text>
            </>
          )}

          {angle === 'side' && (
            <>
              {/* Mug body from side */}
              <rect x="-25" y="-45" width="50" height="65" fill="#f97316" opacity="0.8" rx="3" />
              {/* Handle clearly visible */}
              <path
                d="M 25 -35 C 50 -35, 50 10, 25 10"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.8"
              />
              <text x="5" y="40" textAnchor="middle" fill="#f97316" fontSize="11">Rectangle + handle</text>
            </>
          )}

          {angle === 'top' && (
            <>
              {/* Outer rim */}
              <circle cx="0" cy="-5" r="32" fill="#22c55e" opacity="0.8" />
              {/* Inner opening */}
              <circle cx="0" cy="-5" r="24" fill="#111" opacity="0.9" />
              {/* Handle from top - extends to the right */}
              <ellipse cx="42" cy="-5" rx="12" ry="8" fill="#22c55e" opacity="0.8" />
              {/* Connection to mug body */}
              <rect x="30" y="-11" width="12" height="12" fill="#22c55e" opacity="0.8" />
              <text x="0" y="50" textAnchor="middle" fill="#22c55e" fontSize="11">Circle with hole</text>
            </>
          )}
        </g>
      </svg>

      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300 text-center">
        {angle === 'front' && "From the front: a simple rectangle. The handle is hidden behind."}
        {angle === 'side' && "From the side: now you see the handle. Same mug, different projection."}
        {angle === 'top' && "From above: a ring with a bump. You'd never guess it was a mug."}
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        None of these views is wrong. But you can&apos;t see them all at once—and if you only ever saw 2D shadows, you might think the mug &quot;paradoxically&quot; changes shape.
      </p>
    </div>
  );
}
