'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
}

export default function DelayedChoiceDiagram({ className = '' }: Props) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { label: 'Start', description: 'A photon hits a crystal and splits into two entangled twins: the signal (cyan) and the idler (orange).' },
    { label: 'Signal detected', description: 'The signal photon hits the screen and its position is recorded. Which slit did it go through? We don\'t know yet.' },
    { label: 'Idler traveling', description: 'The idler photon is still traveling through beam splitters toward four possible detectors.' },
    { label: 'Idler detected', description: 'The idler finally hits a detector. D1/D2 erase path info. D3/D4 preserve it.' },
    { label: 'Sort the data', description: 'Sorting signal data by idler outcome reveals hidden patterns—fringes or blobs—that were invisible before.' },
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

  // Animation timing
  const showSignalTraveling = step === 0;
  const showSignalDetected = step >= 1;
  const showIdlerTraveling = step >= 0 && step <= 2;
  const showIdlerDetected = step >= 3;
  const showSorting = step === 4;

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <svg viewBox="0 0 480 280" className="w-full max-w-2xl mx-auto">
        {/* Background */}
        <rect width="480" height="280" fill="#111" />

        {/* Title for each section */}
        <text x="100" y="25" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">
          Signal path (fast)
        </text>
        <text x="100" y="175" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">
          Idler path (slow)
        </text>

        {/* ===== SIGNAL PATH (TOP) ===== */}
        <g transform="translate(0, 40)">
          {/* Source */}
          <circle cx="25" cy="50" r="10" fill="#fbbf24">
            {step === 0 && <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />}
          </circle>
          <text x="25" y="75" textAnchor="middle" fill="#9ca3af" fontSize="8">Source</text>

          {/* Crystal */}
          <polygon points="55,42 75,50 55,58" fill="#8b5cf6" />
          <text x="65" y="35" textAnchor="middle" fill="#8b5cf6" fontSize="8">Crystal</text>

          {/* Signal traveling */}
          {showSignalTraveling && (
            <g>
              <circle cx="90" cy="50" r="4" fill="#06b6d4">
                <animate attributeName="cx" values="75;145" dur="1s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Double slit */}
          <rect x="100" y="30" width="5" height="15" fill="#4b5563" />
          <rect x="100" y="50" width="5" height="20" fill="#4b5563" />
          <rect x="100" y="75" width="5" height="15" fill="#4b5563" />
          <text x="93" y="50" textAnchor="end" fill="#6b7280" fontSize="7">A</text>
          <text x="93" y="73" textAnchor="end" fill="#6b7280" fontSize="7">B</text>

          {/* Path lines (always shown, faded) */}
          <path d="M105 47 Q130 40 150 50" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.2" />
          <path d="M105 73 Q130 80 150 50" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.2" />

          {/* Detection screen */}
          <rect x="150" y="30" width="6" height="60" fill="#374151" />
          <text x="153" y="25" textAnchor="middle" fill="#9ca3af" fontSize="8">Screen</text>

          {/* Signal detection */}
          {showSignalDetected && (
            <g>
              <circle cx="153" cy="55" r="6" fill="#06b6d4">
                {step === 1 && <animate attributeName="r" values="4;10;6" dur="0.4s" fill="freeze" />}
              </circle>
              <text x="153" y="100" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">
                ✓ RECORDED
              </text>
            </g>
          )}
        </g>

        {/* ===== IDLER PATH (BOTTOM) ===== */}
        <g transform="translate(0, 140)">
          {/* Path from crystal area */}
          <path d="M65 -50 L65 30" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />

          {/* Idler traveling */}
          {showIdlerTraveling && (
            <circle cx="65" cy="30" r="4" fill="#f97316">
              <animate
                attributeName="cx"
                values={step <= 1 ? "65;100" : "100;190"}
                dur={step <= 1 ? "1.5s" : "2s"}
                repeatCount="indefinite"
              />
              {step >= 1 && (
                <animate
                  attributeName="cy"
                  values="30;30;45;45"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          )}

          {/* Beam splitter */}
          <rect x="95" y="25" width="10" height="10" fill="#6366f1" transform="rotate(45 100 30)" />
          <text x="100" y="50" textAnchor="middle" fill="#6b7280" fontSize="7">BS</text>

          {/* Paths to detectors */}
          <path d="M105 30 L150 15" stroke="#f97316" strokeWidth="1" opacity="0.3" />
          <path d="M105 30 L150 45" stroke="#f97316" strokeWidth="1" opacity="0.3" />
          <path d="M150 15 L190 10" stroke="#f97316" strokeWidth="1" opacity="0.3" />
          <path d="M150 15 L190 25" stroke="#f97316" strokeWidth="1" opacity="0.3" />
          <path d="M150 45 L190 50" stroke="#f97316" strokeWidth="1" opacity="0.3" />
          <path d="M150 45 L190 65" stroke="#f97316" strokeWidth="1" opacity="0.3" />

          {/* Additional beam splitters */}
          <rect x="147" y="12" width="6" height="6" fill="#6366f1" transform="rotate(45 150 15)" />
          <rect x="147" y="42" width="6" height="6" fill="#6366f1" transform="rotate(45 150 45)" />

          {/* Detectors */}
          <g>
            {/* D1 */}
            <rect x="190" y="2" width="25" height="14" rx="2"
              fill={showIdlerDetected ? "#06b6d4" : "#1e3a4a"} />
            <text x="202" y="12" textAnchor="middle" fill="white" fontSize="8">D1</text>

            {/* D2 */}
            <rect x="190" y="18" width="25" height="14" rx="2"
              fill={showIdlerDetected ? "#06b6d4" : "#1e3a4a"} />
            <text x="202" y="28" textAnchor="middle" fill="white" fontSize="8">D2</text>

            {/* D3 */}
            <rect x="190" y="42" width="25" height="14" rx="2"
              fill={showIdlerDetected ? "#f97316" : "#4a2a1a"} />
            <text x="202" y="52" textAnchor="middle" fill="white" fontSize="8">D3</text>

            {/* D4 */}
            <rect x="190" y="58" width="25" height="14" rx="2"
              fill={showIdlerDetected ? "#f97316" : "#4a2a1a"} />
            <text x="202" y="68" textAnchor="middle" fill="white" fontSize="8">D4</text>

            {/* Labels */}
            <text x="225" y="20" fill="#06b6d4" fontSize="7">path erased</text>
            <text x="225" y="55" fill="#f97316" fontSize="7">path known</text>

            {/* Detection flash */}
            {step === 3 && (
              <circle cx="202" cy="35" r="15" fill="#f97316" opacity="0.4">
                <animate attributeName="r" values="5;25;5" dur="0.6s" fill="freeze" />
                <animate attributeName="opacity" values="0.6;0;0" dur="0.6s" fill="freeze" />
              </circle>
            )}
          </g>
        </g>

        {/* ===== TIMELINE ANNOTATION ===== */}
        <g transform="translate(260, 0)">
          {/* Timeline bar */}
          <rect x="0" y="40" width="4" height="180" fill="#374151" rx="2" />

          {/* Signal marker */}
          <circle cx="2" cy={step >= 1 ? "70" : "50"} r="6" fill="#06b6d4">
            {step === 1 && <animate attributeName="cy" values="50;70" dur="0.3s" fill="freeze" />}
          </circle>
          <text x="15" y="73" fill="#06b6d4" fontSize="8">Signal detected</text>
          {step >= 1 && (
            <text x="15" y="83" fill="#22c55e" fontSize="7">t = 0</text>
          )}

          {/* Idler marker */}
          <circle cx="2" cy={step >= 3 ? "150" : (step >= 1 ? "120" : "100")} r="6" fill="#f97316">
            {step === 1 && <animate attributeName="cy" values="100;120" dur="0.5s" fill="freeze" />}
            {step === 3 && <animate attributeName="cy" values="120;150" dur="0.3s" fill="freeze" />}
          </circle>
          <text x="15" y="153" fill="#f97316" fontSize="8">Idler detected</text>
          {step >= 3 && (
            <text x="15" y="163" fill="#9ca3af" fontSize="7">t = later</text>
          )}

          {/* Key insight */}
          {step >= 1 && step < 4 && (
            <g>
              <rect x="10" y="185" width="90" height="30" fill="#1f2937" rx="3" />
              <text x="55" y="200" textAnchor="middle" fill="#fbbf24" fontSize="8">Signal recorded</text>
              <text x="55" y="210" textAnchor="middle" fill="#fbbf24" fontSize="8">BEFORE idler!</text>
            </g>
          )}
        </g>

        {/* ===== SORTED DATA (STEP 5) ===== */}
        {showSorting && (
          <g transform="translate(355, 40)">
            <rect x="0" y="0" width="120" height="200" fill="#1f2937" rx="5" />
            <text x="60" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
              Signal Data
            </text>
            <text x="60" y="32" textAnchor="middle" fill="#6b7280" fontSize="8">
              (sorted by idler)
            </text>

            {/* D1 - fringes */}
            <text x="10" y="55" fill="#06b6d4" fontSize="9">D1:</text>
            {[0,1,2,3,4,5].map(i => (
              <rect key={i} x={35 + i*12} y="45" width={i%2===0 ? 8 : 3} height="14"
                fill="#06b6d4" opacity={i%2===0 ? 0.9 : 0.3} rx="1" />
            ))}

            {/* D2 - anti-fringes */}
            <text x="10" y="80" fill="#06b6d4" fontSize="9">D2:</text>
            {[0,1,2,3,4,5].map(i => (
              <rect key={i} x={35 + i*12} y="70" width={i%2===1 ? 8 : 3} height="14"
                fill="#06b6d4" opacity={i%2===1 ? 0.9 : 0.3} rx="1" />
            ))}

            <line x1="10" y1="95" x2="110" y2="95" stroke="#374151" strokeWidth="1" />

            {/* D3 - blobs */}
            <text x="10" y="115" fill="#f97316" fontSize="9">D3:</text>
            <ellipse cx="50" cy="112" rx="12" ry="8" fill="#f97316" opacity="0.7" />
            <ellipse cx="85" cy="112" rx="12" ry="8" fill="#f97316" opacity="0.7" />

            {/* D4 - blobs */}
            <text x="10" y="140" fill="#f97316" fontSize="9">D4:</text>
            <ellipse cx="50" cy="137" rx="12" ry="8" fill="#f97316" opacity="0.7" />
            <ellipse cx="85" cy="137" rx="12" ry="8" fill="#f97316" opacity="0.7" />

            <line x1="10" y1="155" x2="110" y2="155" stroke="#374151" strokeWidth="1" />

            {/* All - noise */}
            <text x="10" y="175" fill="#6b7280" fontSize="9">All:</text>
            <rect x="35" y="165" width="72" height="14" fill="#4b5563" opacity="0.5" rx="2" />
            <text x="60" y="190" textAnchor="middle" fill="#6b7280" fontSize="7">noise (patterns cancel)</text>
          </g>
        )}
      </svg>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => { setIsPlaying(false); setStep(Math.max(0, step - 1)); }}
          disabled={step === 0}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-30"
        >
          ← Prev
        </button>

        <div className="flex gap-1">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => { setIsPlaying(false); setStep(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-cyan-500 w-4' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={s.label}
            />
          ))}
        </div>

        <button
          onClick={() => { setIsPlaying(false); setStep(Math.min(steps.length - 1, step + 1)); }}
          disabled={step === steps.length - 1}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-30"
        >
          Next →
        </button>

        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
        >
          {isPlaying ? '▶ Playing' : '▶ Auto'}
        </button>
      </div>

      {/* Step description */}
      <div className="mt-3 p-3 bg-gray-800 rounded text-center">
        <p className="text-sm text-gray-300">{steps[step].description}</p>
      </div>
    </div>
  );
}
