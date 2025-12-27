'use client';

import React, { useState } from 'react';

interface Props {
  className?: string;
}

export default function DelayedChoiceDiagram({ className = '' }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Photon enters crystal',
      desc: 'A single photon hits a special crystal and splits into two entangled twins.',
    },
    {
      title: 'Signal reaches screen FIRST',
      desc: 'The signal photon travels fast. It hits the screen. Position recorded. Done.',
    },
    {
      title: 'Idler still traveling...',
      desc: 'Meanwhile, the idler photon is still bouncing through beam splitters.',
    },
    {
      title: 'Idler reaches detector LATER',
      desc: 'Finally the idler hits D1, D2, D3, or D4. D1/D2 erase path info. D3/D4 preserve it.',
    },
    {
      title: 'Sort the data → Patterns!',
      desc: 'Go back to the SAVED signal data. Sort by idler outcome. Interference appears!',
    },
  ];

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Delayed-Choice Quantum Eraser</h3>
        <p className="text-xs text-gray-500">The idler measurement happens AFTER the signal is recorded</p>
      </div>

      {/* Main visualization - taller for clarity */}
      <svg viewBox="0 0 500 280" className="w-full bg-black rounded border border-gray-800">
        {/* ===== ROW 1: SIGNAL PATH (y=20-80) ===== */}
        <g>
          <text x="20" y="15" fill="#06b6d4" fontSize="11" fontWeight="bold">
            SIGNAL PHOTON (fast path)
          </text>

          {/* Source */}
          <circle cx="40" cy="55" r="12" fill="#fbbf24" opacity={step >= 0 ? 1 : 0.3}>
            {step === 0 && <animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite" />}
          </circle>
          <text x="40" y="80" textAnchor="middle" fill="#9ca3af" fontSize="9">source</text>

          {/* Arrow */}
          <path d="M55 55 L75 55" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 0 ? 0.8 : 0.3} />

          {/* Crystal */}
          <polygon points="80,45 100,55 80,65" fill="#8b5cf6" />
          <text x="90" y="80" textAnchor="middle" fill="#8b5cf6" fontSize="9">crystal</text>

          {/* Arrow to slits */}
          <path d="M102 55 L130 55" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrowCyan)" opacity={step >= 0 ? 0.8 : 0.3} />

          {/* Double slit representation */}
          <rect x="135" y="35" width="6" height="12" fill="#4b5563" />
          <rect x="135" y="52" width="6" height="6" fill="transparent" stroke="#4b5563" strokeWidth="1" />
          <rect x="135" y="63" width="6" height="12" fill="#4b5563" />
          <text x="138" y="95" textAnchor="middle" fill="#6b7280" fontSize="8">slits</text>

          {/* Paths through both slits */}
          <path d="M141 47 Q160 45 180 55" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="3,2" />
          <path d="M141 68 Q160 70 180 55" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="3,2" />

          {/* Detection screen */}
          <rect x="185" y="30" width="8" height="55" fill="#374151" rx="2" />

          {/* Detection flash */}
          {step >= 1 && (
            <g>
              <circle cx="189" cy="55" r="8" fill="#06b6d4">
                {step === 1 && <animate attributeName="opacity" values="1;0.5;1" dur="0.5s" repeatCount="3" />}
              </circle>
              <text x="189" y="58" textAnchor="middle" fill="black" fontSize="8" fontWeight="bold">!</text>
            </g>
          )}
        </g>

        {/* ===== "SAVED" BOX (appears at step 1) ===== */}
        {step >= 1 && (
          <g>
            <rect x="205" y="35" width="75" height="40" fill="#166534" rx="4" stroke="#22c55e" strokeWidth="1" />
            <text x="242" y="52" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">DATA SAVED</text>
            <text x="242" y="65" textAnchor="middle" fill="#86efac" fontSize="8">position recorded</text>
          </g>
        )}

        {/* Divider line */}
        <line x1="20" y1="105" x2="295" y2="105" stroke="#374151" strokeWidth="1" />

        {/* ===== ROW 2: IDLER PATH (y=110-180) ===== */}
        <g>
          <text x="20" y="120" fill="#f97316" fontSize="11" fontWeight="bold">
            IDLER PHOTON (slow path)
          </text>

          {/* From crystal - arrow down */}
          <path d="M90 65 L90 140" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />

          {/* Traveling photon indicator */}
          {step >= 0 && step <= 2 && (
            <circle cx="90" r="5" fill="#f97316">
              <animate attributeName="cy" values="75;140" dur="2s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Beam splitter maze (simplified) */}
          <rect x="85" y="145" width="10" height="10" fill="#6366f1" transform="rotate(45 90 150)" />
          <text x="90" y="175" textAnchor="middle" fill="#6b7280" fontSize="8">BS</text>

          {/* Branching paths */}
          <path d="M95 155 L140 140" stroke="#f97316" strokeWidth="1" opacity="0.5" />
          <path d="M95 155 L140 170" stroke="#f97316" strokeWidth="1" opacity="0.5" />

          {/* Second layer beam splitters */}
          <rect x="140" y="135" width="8" height="8" fill="#6366f1" transform="rotate(45 144 139)" />
          <rect x="140" y="165" width="8" height="8" fill="#6366f1" transform="rotate(45 144 169)" />

          {/* Final paths to detectors */}
          <path d="M150 137 L185 130" stroke="#f97316" strokeWidth="1" opacity="0.4" />
          <path d="M150 142 L185 148" stroke="#f97316" strokeWidth="1" opacity="0.4" />
          <path d="M150 167 L185 162" stroke="#f97316" strokeWidth="1" opacity="0.4" />
          <path d="M150 172 L185 180" stroke="#f97316" strokeWidth="1" opacity="0.4" />

          {/* Four detectors */}
          <g>
            {/* D1, D2 - path erased */}
            <rect x="188" y="122" width="30" height="16" rx="3"
              fill={step >= 3 ? "#06b6d4" : "#1e3a4a"}
              stroke={step >= 3 ? "#06b6d4" : "#374151"} strokeWidth="1" />
            <text x="203" y="133" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">D1</text>

            <rect x="188" y="142" width="30" height="16" rx="3"
              fill={step >= 3 ? "#06b6d4" : "#1e3a4a"}
              stroke={step >= 3 ? "#06b6d4" : "#374151"} strokeWidth="1" />
            <text x="203" y="153" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">D2</text>

            {/* D3, D4 - path preserved */}
            <rect x="188" y="162" width="30" height="16" rx="3"
              fill={step >= 3 ? "#f97316" : "#3d2314"}
              stroke={step >= 3 ? "#f97316" : "#374151"} strokeWidth="1" />
            <text x="203" y="173" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">D3</text>

            <rect x="188" y="182" width="30" height="16" rx="3"
              fill={step >= 3 ? "#f97316" : "#3d2314"}
              stroke={step >= 3 ? "#f97316" : "#374151"} strokeWidth="1" />
            <text x="203" y="193" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">D4</text>

            {/* Labels */}
            <text x="225" y="145" fill="#06b6d4" fontSize="8">← erased</text>
            <text x="225" y="183" fill="#f97316" fontSize="8">← preserved</text>
          </g>

          {/* Detection flash for idler */}
          {step === 3 && (
            <circle cx="203" cy="155" r="25" fill="#f97316" opacity="0.3">
              <animate attributeName="r" values="15;35;15" dur="0.6s" fill="freeze" />
              <animate attributeName="opacity" values="0.4;0;0" dur="0.6s" fill="freeze" />
            </circle>
          )}
        </g>

        {/* ===== RIGHT SIDE: TIMELINE (x=310-380) ===== */}
        <g transform="translate(315, 20)">
          <text x="50" y="0" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">
            TIME →
          </text>

          {/* Timeline bar */}
          <rect x="48" y="15" width="4" height="140" fill="#374151" rx="2" />

          {/* t=0: Signal detected */}
          <g transform={`translate(0, ${step >= 1 ? 45 : 30})`}>
            <circle cx="50" cy="0" r="10" fill="#06b6d4" stroke="#0a0a0a" strokeWidth="2">
              {step === 1 && <animate attributeName="cy" values="-15;0" dur="0.3s" fill="freeze" />}
            </circle>
            <text x="65" y="3" fill="#06b6d4" fontSize="9">Signal detected</text>
            {step >= 1 && <text x="65" y="14" fill="#22c55e" fontSize="8" fontWeight="bold">t = 0 (FIRST)</text>}
          </g>

          {/* t=later: Idler detected */}
          <g transform={`translate(0, ${step >= 3 ? 115 : (step >= 1 ? 85 : 60)})`}>
            <circle cx="50" cy="0" r="10" fill="#f97316" stroke="#0a0a0a" strokeWidth="2">
              {step === 3 && <animate attributeName="cy" values="-20;0" dur="0.3s" fill="freeze" />}
            </circle>
            <text x="65" y="3" fill="#f97316" fontSize="9">Idler detected</text>
            {step >= 3 && <text x="65" y="14" fill="#9ca3af" fontSize="8">t = later (SECOND)</text>}
          </g>

          {/* The paradox callout */}
          {step >= 1 && step < 4 && (
            <g transform="translate(-10, 160)">
              <rect x="0" y="0" width="115" height="35" fill="#422006" rx="4" stroke="#f97316" strokeWidth="1" />
              <text x="57" y="15" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">
                Signal ALREADY recorded!
              </text>
              <text x="57" y="27" textAnchor="middle" fill="#fbbf24" fontSize="7">
                Idler choice comes LATER
              </text>
            </g>
          )}
        </g>

        {/* ===== STEP 5: SORTED DATA RESULTS ===== */}
        {step === 4 && (
          <g transform="translate(305, 25)">
            <rect x="0" y="0" width="185" height="180" fill="#1f2937" rx="4" stroke="#4b5563" strokeWidth="1" />
            <text x="92" y="18" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
              Sort saved data by idler:
            </text>

            {/* D1 - fringes */}
            <g transform="translate(10, 30)">
              <text x="0" y="10" fill="#06b6d4" fontSize="10">D1:</text>
              <g transform="translate(30, 0)">
                {[0,1,2,3,4,5,6,7].map(i => (
                  <rect key={i} x={i * 15} y="0" width={i % 2 === 0 ? 12 : 3} height="14"
                    fill="#06b6d4" opacity={i % 2 === 0 ? 0.9 : 0.2} rx="1" />
                ))}
              </g>
              <text x="165" y="10" textAnchor="end" fill="#22c55e" fontSize="9">fringes!</text>
            </g>

            {/* D2 - anti-fringes */}
            <g transform="translate(10, 52)">
              <text x="0" y="10" fill="#06b6d4" fontSize="10">D2:</text>
              <g transform="translate(30, 0)">
                {[0,1,2,3,4,5,6,7].map(i => (
                  <rect key={i} x={i * 15} y="0" width={i % 2 === 1 ? 12 : 3} height="14"
                    fill="#06b6d4" opacity={i % 2 === 1 ? 0.9 : 0.2} rx="1" />
                ))}
              </g>
              <text x="165" y="10" textAnchor="end" fill="#22c55e" fontSize="9">anti-fringes</text>
            </g>

            <line x1="10" y1="72" x2="175" y2="72" stroke="#4b5563" strokeWidth="1" />

            {/* D3 - two blobs */}
            <g transform="translate(10, 80)">
              <text x="0" y="10" fill="#f97316" fontSize="10">D3:</text>
              <ellipse cx="60" cy="8" rx="18" ry="10" fill="#f97316" opacity="0.7" />
              <ellipse cx="120" cy="8" rx="18" ry="10" fill="#f97316" opacity="0.7" />
              <text x="165" y="10" textAnchor="end" fill="#9ca3af" fontSize="9">two blobs</text>
            </g>

            {/* D4 - two blobs */}
            <g transform="translate(10, 102)">
              <text x="0" y="10" fill="#f97316" fontSize="10">D4:</text>
              <ellipse cx="60" cy="8" rx="18" ry="10" fill="#f97316" opacity="0.7" />
              <ellipse cx="120" cy="8" rx="18" ry="10" fill="#f97316" opacity="0.7" />
              <text x="165" y="10" textAnchor="end" fill="#9ca3af" fontSize="9">two blobs</text>
            </g>

            <line x1="10" y1="122" x2="175" y2="122" stroke="#4b5563" strokeWidth="1" />

            {/* All combined - noise */}
            <g transform="translate(10, 130)">
              <text x="0" y="10" fill="#6b7280" fontSize="10">All:</text>
              <rect x="30" y="0" width="120" height="14" fill="#4b5563" opacity="0.5" rx="2" />
              <text x="165" y="10" textAnchor="end" fill="#6b7280" fontSize="9">no pattern</text>
            </g>

            {/* Punchline */}
            <text x="92" y="162" textAnchor="middle" fill="#9ca3af" fontSize="9">
              Patterns were always there—
            </text>
            <text x="92" y="174" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
              sorting reveals them!
            </text>
          </g>
        )}

        {/* Arrow marker definitions */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#fbbf24" />
          </marker>
          <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#06b6d4" />
          </marker>
        </defs>
      </svg>

      {/* Step buttons */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
              i === step
                ? 'bg-cyan-600 text-white ring-2 ring-cyan-400'
                : i < step
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current step description */}
      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
        <p className="text-sm font-medium text-white text-center">{steps[step].title}</p>
        <p className="text-xs text-gray-400 text-center mt-1">{steps[step].desc}</p>
      </div>

      {/* Always-visible punchline */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          <strong className="text-gray-400">The resolution:</strong> Nothing was rewritten.
          The later measurement sorts data that was always correlated.
        </p>
      </div>
    </div>
  );
}
