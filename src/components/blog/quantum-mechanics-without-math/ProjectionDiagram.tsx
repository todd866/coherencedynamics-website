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

        {/* 3D coffee mug (always shown, faded) */}
        <g transform="translate(80, 100)">
          <text x="0" y="-70" textAnchor="middle" fill="#6b7280" fontSize="10">The 3D object</text>

          {/* Mug body - cylinder */}
          <ellipse cx="0" cy="-35" rx="25" ry="8" fill="#374151" stroke="#6b7280" strokeWidth="1" />
          <rect x="-25" y="-35" width="50" height="50" fill="#374151" />
          <ellipse cx="0" cy="15" rx="25" ry="8" fill="#4b5563" stroke="#6b7280" strokeWidth="1" />
          <line x1="-25" y1="-35" x2="-25" y2="15" stroke="#6b7280" strokeWidth="1" />
          <line x1="25" y1="-35" x2="25" y2="15" stroke="#6b7280" strokeWidth="1" />

          {/* Handle - on the right side */}
          <ellipse cx="38" cy="-10" rx="12" ry="20" fill="none" stroke="#6b7280" strokeWidth="4" />
          <ellipse cx="38" cy="-10" rx="12" ry="20" fill="#111" stroke="#111" strokeWidth="2"
            clipPath="polygon(0 0, 50% 0, 50% 100%, 0 100%)" />
          <path d="M 25 -25 Q 50 -25 50 -10 Q 50 5 25 5" fill="none" stroke="#6b7280" strokeWidth="3" />
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
              {/* Rectangle (mug body from front, no handle visible) */}
              <rect x="-25" y="-35" width="50" height="50" fill="#06b6d4" opacity="0.8" rx="2" />
              <text x="0" y="35" textAnchor="middle" fill="#06b6d4" fontSize="11">Rectangle</text>
            </>
          )}

          {angle === 'side' && (
            <>
              {/* Rectangle with handle bump */}
              <rect x="-25" y="-35" width="50" height="50" fill="#f97316" opacity="0.8" rx="2" />
              {/* Handle as a bump on the side */}
              <ellipse cx="35" cy="-10" rx="10" ry="18" fill="#f97316" opacity="0.8" />
              <text x="0" y="35" textAnchor="middle" fill="#f97316" fontSize="11">Rectangle + handle</text>
            </>
          )}

          {angle === 'top' && (
            <>
              {/* Circle with handle */}
              <circle cx="0" cy="0" r="28" fill="#22c55e" opacity="0.8" />
              {/* Inner circle (the opening) */}
              <circle cx="0" cy="0" r="20" fill="#111" opacity="0.8" />
              {/* Handle from top */}
              <ellipse cx="38" cy="0" rx="10" ry="6" fill="#22c55e" opacity="0.8" />
              <text x="0" y="50" textAnchor="middle" fill="#22c55e" fontSize="11">Circle with hole</text>
            </>
          )}
        </g>
      </svg>

      <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300 text-center">
        {angle === 'front' && "From the front: a simple rectangle. Where's the handle?"}
        {angle === 'side' && "From the side: rectangle with a handle. Now it looks like a mug."}
        {angle === 'top' && "From above: a circle with a hole! Completely different shape."}
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        None of these views is wrong. But you can&apos;t see them all at once—and if you only ever saw 2D shadows, you might think the mug &quot;paradoxically&quot; changes shape.
      </p>
    </div>
  );
}
