'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
}

export default function DelayedChoiceDiagram({ className = '' }: Props) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { label: 'Start', description: 'A photon enters and splits into an entangled pair at the crystal.' },
    { label: 'Signal hits screen', description: 'The signal photon hits the detection screen. Where did it land? We record the position.' },
    { label: 'Idler still traveling', description: 'Meanwhile, the idler photon is still traveling through the maze of beam splitters...' },
    { label: 'Idler detected', description: 'The idler finally hits one of four detectors. Which one determines if we "know" which path the signal took.' },
    { label: 'Sort the data', description: 'Now we sort. Group signal positions by which idler detector fired. Patterns emerge from noise.' },
  ];

  useEffect(() => {
    if (isPlaying && step < steps.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 2500);
      return () => clearTimeout(timer);
    } else if (isPlaying && step === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step, steps.length]);

  const handlePlay = () => {
    if (step === steps.length - 1) setStep(0);
    setIsPlaying(true);
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <svg viewBox="0 0 500 280" className="w-full max-w-2xl mx-auto">
        {/* Background */}
        <rect width="500" height="280" fill="#111" />

        {/* Photon source */}
        <circle cx="30" cy="140" r="12" fill="#fbbf24" opacity={step >= 0 ? 1 : 0.3} />
        <text x="30" y="170" textAnchor="middle" fill="#9ca3af" fontSize="9">Source</text>

        {/* Path to crystal */}
        <line x1="42" y1="140" x2="80" y2="140" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" opacity={step >= 0 ? 0.8 : 0.2} />

        {/* BBO Crystal */}
        <polygon points="80,125 100,140 80,155" fill="#8b5cf6" opacity={step >= 0 ? 1 : 0.3} />
        <text x="90" y="115" textAnchor="middle" fill="#8b5cf6" fontSize="8">Crystal</text>
        <text x="90" y="175" textAnchor="middle" fill="#6b7280" fontSize="7">(splits photon)</text>

        {/* Signal photon path (goes up) */}
        <line
          x1="100" y1="130" x2="180" y2="60"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray={step >= 1 ? "0" : "4,4"}
          opacity={step >= 1 ? 1 : 0.4}
        />
        <text x="130" y="80" fill="#06b6d4" fontSize="8">Signal</text>

        {/* Double slit for signal */}
        <rect x="180" y="35" width="6" height="20" fill="#4b5563" />
        <rect x="180" y="65" width="6" height="20" fill="#4b5563" />

        {/* Signal to screen */}
        <line
          x1="186" y1="55" x2="250" y2="55"
          stroke="#06b6d4"
          strokeWidth="2"
          opacity={step >= 1 ? 1 : 0.2}
        />
        <line
          x1="186" y1="65" x2="250" y2="65"
          stroke="#06b6d4"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity={step >= 1 ? 0.5 : 0.1}
        />

        {/* Detection screen */}
        <rect x="250" y="30" width="8" height="60" fill="#374151" />
        <text x="254" y="25" textAnchor="middle" fill="#9ca3af" fontSize="8">Screen</text>

        {/* Signal detection marker */}
        {step >= 1 && (
          <circle cx="254" cy="55" r="4" fill="#06b6d4">
            <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* TIME MARKER */}
        {step === 1 && (
          <text x="254" y="100" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">
            ✓ DETECTED
          </text>
        )}

        {/* Idler photon path (goes down) */}
        <line
          x1="100" y1="150" x2="150" y2="200"
          stroke="#f97316"
          strokeWidth="2"
          strokeDasharray={step >= 2 ? "0" : "4,4"}
          opacity={step >= 2 ? 1 : 0.4}
        />
        <text x="110" y="190" fill="#f97316" fontSize="8">Idler</text>

        {/* Beam splitter 1 */}
        <rect x="150" y="195" width="15" height="15" fill="#6366f1" opacity={step >= 2 ? 1 : 0.3} transform="rotate(45 157.5 202.5)" />
        <text x="157" y="225" textAnchor="middle" fill="#6b7280" fontSize="7">BS</text>

        {/* Paths from BS1 */}
        <line x1="165" y1="200" x2="230" y2="180" stroke="#f97316" strokeWidth="1.5" opacity={step >= 2 ? 0.7 : 0.2} />
        <line x1="165" y1="205" x2="230" y2="240" stroke="#f97316" strokeWidth="1.5" opacity={step >= 2 ? 0.7 : 0.2} />

        {/* Beam splitter 2 (top path) */}
        <rect x="230" y="173" width="12" height="12" fill="#6366f1" opacity={step >= 2 ? 1 : 0.3} transform="rotate(45 236 179)" />

        {/* Beam splitter 3 (bottom path) */}
        <rect x="230" y="233" width="12" height="12" fill="#6366f1" opacity={step >= 2 ? 1 : 0.3} transform="rotate(45 236 239)" />

        {/* Detectors */}
        {/* D1 and D2 - which-path ERASED */}
        <rect x="280" y="155" width="30" height="18" rx="3" fill="#06b6d4" opacity={step >= 3 ? 1 : 0.3} />
        <text x="295" y="167" textAnchor="middle" fill="white" fontSize="9">D1</text>

        <rect x="280" y="185" width="30" height="18" rx="3" fill="#06b6d4" opacity={step >= 3 ? 1 : 0.3} />
        <text x="295" y="197" textAnchor="middle" fill="white" fontSize="9">D2</text>

        {/* D3 and D4 - which-path PRESERVED */}
        <rect x="280" y="220" width="30" height="18" rx="3" fill="#f97316" opacity={step >= 3 ? 1 : 0.3} />
        <text x="295" y="232" textAnchor="middle" fill="white" fontSize="9">D3</text>

        <rect x="280" y="250" width="30" height="18" rx="3" fill="#f97316" opacity={step >= 3 ? 1 : 0.3} />
        <text x="295" y="262" textAnchor="middle" fill="white" fontSize="9">D4</text>

        {/* Paths to detectors */}
        <line x1="242" y1="175" x2="280" y2="164" stroke="#f97316" strokeWidth="1" opacity={step >= 3 ? 0.6 : 0.1} />
        <line x1="242" y1="183" x2="280" y2="194" stroke="#f97316" strokeWidth="1" opacity={step >= 3 ? 0.6 : 0.1} />
        <line x1="242" y1="235" x2="280" y2="229" stroke="#f97316" strokeWidth="1" opacity={step >= 3 ? 0.6 : 0.1} />
        <line x1="242" y1="243" x2="280" y2="259" stroke="#f97316" strokeWidth="1" opacity={step >= 3 ? 0.6 : 0.1} />

        {/* Labels for detector types */}
        <text x="340" y="178" fill="#06b6d4" fontSize="8">Which-path</text>
        <text x="340" y="188" fill="#06b6d4" fontSize="8">ERASED</text>

        <text x="340" y="243" fill="#f97316" fontSize="8">Which-path</text>
        <text x="340" y="253" fill="#f97316" fontSize="8">PRESERVED</text>

        {/* Timing annotation */}
        {step >= 2 && step < 4 && (
          <>
            <text x="220" y="130" fill="#22c55e" fontSize="9">Signal already detected!</text>
            <text x="220" y="142" fill="#6b7280" fontSize="8">Idler still traveling...</text>
          </>
        )}

        {/* Final sorting visualization */}
        {step === 4 && (
          <>
            <rect x="380" y="30" width="100" height="240" fill="#1f2937" rx="5" />
            <text x="430" y="50" textAnchor="middle" fill="white" fontSize="10">Sorted Data</text>

            {/* D1 subset - fringes */}
            <text x="400" y="75" fill="#06b6d4" fontSize="8">D1:</text>
            <rect x="420" y="68" width="3" height="8" fill="#06b6d4" />
            <rect x="428" y="68" width="5" height="8" fill="#06b6d4" />
            <rect x="438" y="68" width="3" height="8" fill="#06b6d4" />
            <rect x="448" y="68" width="5" height="8" fill="#06b6d4" />
            <rect x="458" y="68" width="3" height="8" fill="#06b6d4" />

            {/* D2 subset - anti-fringes */}
            <text x="400" y="100" fill="#06b6d4" fontSize="8">D2:</text>
            <rect x="423" y="93" width="5" height="8" fill="#06b6d4" />
            <rect x="433" y="93" width="3" height="8" fill="#06b6d4" />
            <rect x="443" y="93" width="5" height="8" fill="#06b6d4" />
            <rect x="453" y="93" width="3" height="8" fill="#06b6d4" />

            {/* D3 subset - blobs */}
            <text x="400" y="130" fill="#f97316" fontSize="8">D3:</text>
            <ellipse cx="430" cy="127" rx="8" ry="5" fill="#f97316" opacity="0.7" />
            <ellipse cx="455" cy="127" rx="8" ry="5" fill="#f97316" opacity="0.7" />

            {/* D4 subset - blobs */}
            <text x="400" y="160" fill="#f97316" fontSize="8">D4:</text>
            <ellipse cx="430" cy="157" rx="8" ry="5" fill="#f97316" opacity="0.7" />
            <ellipse cx="455" cy="157" rx="8" ry="5" fill="#f97316" opacity="0.7" />

            {/* All data */}
            <text x="400" y="200" fill="#9ca3af" fontSize="8">All:</text>
            <rect x="420" y="193" width="50" height="8" fill="#6b7280" opacity="0.5" />
            <text x="430" y="220" fill="#6b7280" fontSize="7">No pattern</text>
            <text x="430" y="230" fill="#6b7280" fontSize="7">(noise)</text>
          </>
        )}
      </svg>

      {/* Step indicator and controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0 || isPlaying}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-30"
        >
          ←
        </button>

        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIsPlaying(false); setStep(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-cyan-500 w-4' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1 || isPlaying}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-30"
        >
          →
        </button>

        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
        >
          {isPlaying ? 'Playing...' : 'Play'}
        </button>
      </div>

      {/* Step description */}
      <div className="mt-3 text-center">
        <p className="text-gray-400 text-sm">{steps[step].description}</p>
      </div>
    </div>
  );
}
