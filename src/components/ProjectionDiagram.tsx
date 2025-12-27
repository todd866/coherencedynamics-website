'use client';

import React, { useState } from 'react';

interface Props {
  className?: string;
}

export default function ProjectionDiagram({ className = '' }: Props) {
  const [angle, setAngle] = useState<'front' | 'side' | 'top'>('front');

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm">A cylinder looks completely different depending on your viewpoint.</p>
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

        {/* 3D cylinder (always shown, faded) */}
        <g transform="translate(80, 100)">
          <text x="0" y="-70" textAnchor="middle" fill="#6b7280" fontSize="10">The 3D object</text>

          {/* Simple 3D cylinder representation */}
          <ellipse cx="0" cy="-40" rx="30" ry="10" fill="#374151" stroke="#6b7280" strokeWidth="1" />
          <rect x="-30" y="-40" width="60" height="60" fill="#374151" />
          <ellipse cx="0" cy="20" rx="30" ry="10" fill="#4b5563" stroke="#6b7280" strokeWidth="1" />
          <line x1="-30" y1="-40" x2="-30" y2="20" stroke="#6b7280" strokeWidth="1" />
          <line x1="30" y1="-40" x2="30" y2="20" stroke="#6b7280" strokeWidth="1" />
        </g>

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
          <text x="0" y="-70" textAnchor="middle" fill="#6b7280" fontSize="10">What you see</text>

          {angle === 'front' && (
            <>
              <rect x="-30" y="-40" width="60" height="80" fill="#06b6d4" opacity="0.8" rx="2" />
              <text x="0" y="60" textAnchor="middle" fill="#06b6d4" fontSize="11">Rectangle</text>
            </>
          )}

          {angle === 'side' && (
            <>
              <rect x="-30" y="-40" width="60" height="80" fill="#f97316" opacity="0.8" rx="2" />
              <text x="0" y="60" textAnchor="middle" fill="#f97316" fontSize="11">Rectangle</text>
            </>
          )}

          {angle === 'top' && (
            <>
              <circle cx="0" cy="0" r="35" fill="#22c55e" opacity="0.8" />
              <text x="0" y="60" textAnchor="middle" fill="#22c55e" fontSize="11">Circle</text>
            </>
          )}
        </g>
      </svg>

      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300 text-center">
        {angle === 'front' && "From the front: a rectangle. Is the cylinder really 'rectangular'?"}
        {angle === 'side' && "From the side: also a rectangle. Same shape, different angle."}
        {angle === 'top' && "From above: a circle! Completely different. Same cylinder."}
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        None of these views is &quot;wrong.&quot; But you can&apos;t see them all at once—and combining them requires knowing about the 3D object they came from.
      </p>
    </div>
  );
}
