'use client';

import React, { useState } from 'react';

interface Props {
  className?: string;
}

export default function DoubleSlitDiagram({ className = '' }: Props) {
  const [mode, setMode] = useState<'interference' | 'which-path'>('interference');

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setMode('interference')}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            mode === 'interference'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          No detector
        </button>
        <button
          onClick={() => setMode('which-path')}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            mode === 'which-path'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          With detector
        </button>
      </div>

      <svg viewBox="0 0 400 200" className="w-full max-w-lg mx-auto">
        {/* Background */}
        <rect width="400" height="200" fill="#111" />

        {/* Photon source */}
        <circle cx="30" cy="100" r="15" fill="#fbbf24" opacity="0.8" />
        <text x="30" y="140" textAnchor="middle" fill="#9ca3af" fontSize="10">
          Photon
        </text>

        {/* Photon path to slits */}
        <line x1="45" y1="100" x2="120" y2="100" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />

        {/* Barrier with slits */}
        <rect x="120" y="20" width="10" height="65" fill="#4b5563" />
        <rect x="120" y="115" width="10" height="65" fill="#4b5563" />
        <text x="125" y="15" textAnchor="middle" fill="#9ca3af" fontSize="10">
          Barrier
        </text>

        {/* Slit labels */}
        <text x="145" y="95" fill="#9ca3af" fontSize="9">Slit A</text>
        <text x="145" y="115" fill="#9ca3af" fontSize="9">Slit B</text>

        {/* Which-path detector (conditional) */}
        {mode === 'which-path' && (
          <>
            <rect x="135" y="80" width="20" height="12" fill="#f97316" rx="2" />
            <rect x="135" y="108" width="20" height="12" fill="#f97316" rx="2" />
            <text x="175" y="75" fill="#f97316" fontSize="9">Detectors</text>
            <text x="175" y="85" fill="#f97316" fontSize="8">(which slit?)</text>
          </>
        )}

        {/* Paths through slits */}
        {mode === 'interference' ? (
          <>
            {/* Interference: waves spread and overlap */}
            <path
              d="M130 90 Q200 70 280 60 M130 90 Q200 90 280 90 M130 90 Q200 110 280 120 M130 90 Q200 130 280 150"
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M130 110 Q200 90 280 60 M130 110 Q200 110 280 90 M130 110 Q200 130 280 120 M130 110 Q200 150 280 150"
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </>
        ) : (
          <>
            {/* Which-path: distinct trajectories */}
            <line x1="130" y1="90" x2="280" y2="70" stroke="#f97316" strokeWidth="2" opacity="0.6" />
            <line x1="130" y1="110" x2="280" y2="130" stroke="#f97316" strokeWidth="2" opacity="0.6" />
          </>
        )}

        {/* Detection screen */}
        <rect x="280" y="30" width="8" height="140" fill="#374151" />
        <text x="284" y="25" textAnchor="middle" fill="#9ca3af" fontSize="10">
          Screen
        </text>

        {/* Detection pattern */}
        {mode === 'interference' ? (
          <>
            {/* Interference fringes */}
            {[40, 60, 80, 100, 120, 140, 160].map((y, i) => (
              <rect
                key={y}
                x="290"
                y={y - 4}
                width={i % 2 === 0 ? 15 : 5}
                height="8"
                fill="#06b6d4"
                opacity={i % 2 === 0 ? 0.9 : 0.3}
              />
            ))}
            <text x="330" y="105" fill="#06b6d4" fontSize="10">
              Stripes!
            </text>
          </>
        ) : (
          <>
            {/* Two blobs */}
            <ellipse cx="300" cy="70" rx="12" ry="20" fill="#f97316" opacity="0.7" />
            <ellipse cx="300" cy="130" rx="12" ry="20" fill="#f97316" opacity="0.7" />
            <text x="330" y="105" fill="#f97316" fontSize="10">
              Two blobs
            </text>
          </>
        )}
      </svg>

      <p className="text-center text-gray-400 text-sm mt-4">
        {mode === 'interference' ? (
          <>Without knowing which slit, the photon interferes with itself. You get stripes.</>
        ) : (
          <>With detectors recording which slit, interference vanishes. You get two blobs.</>
        )}
      </p>
    </div>
  );
}
