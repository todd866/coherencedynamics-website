'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
}

export default function DelayedChoiceDiagram({ className = '' }: Props) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const steps = [
    { label: 'Start', description: 'A photon enters and splits into an entangled pair at the crystal. Watch the wave spread through both paths simultaneously.' },
    { label: 'Signal hits screen', description: 'The signal photon hits the detection screen first. Its position is recorded—but which slit did it go through?' },
    { label: 'Idler still traveling', description: 'The idler is still a wave, spreading through the beam splitter maze. It hasn\'t "decided" which detector yet.' },
    { label: 'Idler detected', description: 'The idler wave collapses onto one detector. Which one determines whether we can know the signal\'s path.' },
    { label: 'Sort the data', description: 'Now we sort the already-recorded signal data by idler outcome. Patterns emerge from what looked like noise.' },
  ];

  // Animation loop for wave motion
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 1) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPlaying && step < steps.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 3000);
      return () => clearTimeout(timer);
    } else if (isPlaying && step === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step, steps.length]);

  const handlePlay = () => {
    if (step === steps.length - 1) setStep(0);
    setIsPlaying(true);
  };

  // Wave animation helpers
  const waveOffset = animationPhase * 2;
  const pulseOpacity = 0.3 + 0.3 * Math.sin(animationPhase * 0.2);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <svg viewBox="0 0 500 300" className="w-full max-w-2xl mx-auto">
        {/* Background */}
        <rect width="500" height="300" fill="#111" />

        {/* Photon source */}
        <circle cx="30" cy="150" r="12" fill="#fbbf24" opacity={step >= 0 ? 1 : 0.3}>
          {step === 0 && (
            <animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="30" y="180" textAnchor="middle" fill="#9ca3af" fontSize="9">Source</text>

        {/* Incoming wave/photon */}
        {step === 0 && (
          <g>
            {/* Animated wavefronts approaching crystal */}
            {[0, 15, 30].map((offset, i) => (
              <circle
                key={i}
                cx={30 + ((waveOffset + offset) % 50)}
                cy="150"
                r="3"
                fill="#fbbf24"
                opacity={0.8 - i * 0.2}
              />
            ))}
          </g>
        )}

        {/* BBO Crystal */}
        <polygon points="80,135 105,150 80,165" fill="#8b5cf6" opacity={step >= 0 ? 1 : 0.3} />
        <text x="92" y="125" textAnchor="middle" fill="#8b5cf6" fontSize="8">Crystal</text>
        <text x="92" y="185" textAnchor="middle" fill="#6b7280" fontSize="7">(entangles)</text>

        {/* Signal photon path - WAVE spreading through both slits */}
        {step >= 0 && step < 2 && (
          <g opacity={step === 0 ? pulseOpacity + 0.3 : 0.8}>
            {/* Wave spreading from crystal toward slits */}
            <ellipse
              cx={105 + (step === 0 ? (waveOffset % 40) : 60)}
              cy="90"
              rx="15"
              ry="8"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.6"
            />
            {/* Through both slits simultaneously */}
            <path
              d="M130 75 Q160 75 180 60 M130 75 Q160 75 180 80"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="4,2"
              opacity="0.5"
            >
              <animate attributeName="stroke-dashoffset" values="0;-12" dur="0.5s" repeatCount="indefinite" />
            </path>
            <path
              d="M130 105 Q160 105 180 100 M130 105 Q160 105 180 120"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="4,2"
              opacity="0.5"
            >
              <animate attributeName="stroke-dashoffset" values="0;-12" dur="0.5s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* Double slit for signal */}
        <rect x="175" y="45" width="6" height="25" fill="#4b5563" />
        <rect x="175" y="80" width="6" height="30" fill="#4b5563" />
        <rect x="175" y="120" width="6" height="25" fill="#4b5563" />
        <text x="160" y="72" fill="#9ca3af" fontSize="7">A</text>
        <text x="160" y="112" fill="#9ca3af" fontSize="7">B</text>

        {/* Signal continuing to screen as wave */}
        {step >= 0 && step < 2 && (
          <g>
            {/* Interfering wavefronts */}
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M181 ${70 + i * 5} Q210 ${60 + i * 10} 240 ${50 + i * 15}`}
                stroke="#06b6d4"
                strokeWidth="1.5"
                fill="none"
                opacity={0.4 - i * 0.1}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-20"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>
            ))}
            {[0, 1, 2].map((i) => (
              <path
                key={i + 3}
                d={`M181 ${110 - i * 5} Q210 ${100 - i * 10} 240 ${90 - i * 15}`}
                stroke="#06b6d4"
                strokeWidth="1.5"
                fill="none"
                opacity={0.4 - i * 0.1}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-20"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>
        )}

        {/* Detection screen */}
        <rect x="245" y="35" width="8" height="90" fill="#374151" />
        <text x="249" y="30" textAnchor="middle" fill="#9ca3af" fontSize="8">Screen</text>

        {/* Signal detection marker - collapse! */}
        {step >= 1 && (
          <g>
            <circle cx="249" cy="75" r="5" fill="#06b6d4">
              {step === 1 && (
                <animate attributeName="r" values="3;8;5" dur="0.5s" fill="freeze" />
              )}
            </circle>
            {step === 1 && (
              <text x="249" y="140" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">
                DETECTED!
              </text>
            )}
          </g>
        )}

        {/* Idler photon path - WAVE through beam splitter maze */}
        <g transform="translate(0, 20)">
          {/* Path from crystal */}
          {step >= 0 && step < 4 && (
            <g opacity={step < 2 ? pulseOpacity + 0.3 : 0.8}>
              {/* Wave spreading toward beam splitters */}
              {step <= 2 && (
                <>
                  <ellipse
                    cx={105 + ((step === 0 ? waveOffset : 40) % 50)}
                    cy="190"
                    rx="12"
                    ry="6"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                </>
              )}
            </g>
          )}

          {/* Beam splitter 1 */}
          <rect x="145" y="175" width="12" height="12" fill="#6366f1" opacity={step >= 1 ? 1 : 0.4} transform="rotate(45 151 181)" />

          {/* Paths splitting from BS1 - wave goes BOTH ways */}
          {step >= 2 && step < 4 && (
            <g>
              {/* Upper path wave */}
              <path
                d="M157 178 Q180 165 210 158"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4,2"
                fill="none"
                opacity="0.6"
              >
                <animate attributeName="stroke-dashoffset" values="0;-12" dur="0.5s" repeatCount="indefinite" />
              </path>
              {/* Lower path wave */}
              <path
                d="M157 184 Q180 197 210 210"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4,2"
                fill="none"
                opacity="0.6"
              >
                <animate attributeName="stroke-dashoffset" values="0;-12" dur="0.5s" repeatCount="indefinite" />
              </path>
            </g>
          )}

          {/* Beam splitter 2 (erasing path) */}
          <rect x="210" y="150" width="10" height="10" fill="#6366f1" opacity={step >= 2 ? 1 : 0.4} transform="rotate(45 215 155)" />

          {/* Beam splitter 3 (preserving path) */}
          <rect x="210" y="205" width="10" height="10" fill="#6366f1" opacity={step >= 2 ? 1 : 0.4} transform="rotate(45 215 210)" />

          {/* Wave continuing to all 4 detectors */}
          {step === 2 && (
            <g opacity="0.5">
              <path d="M220 152 L255 140" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,2">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.4s" repeatCount="indefinite" />
              </path>
              <path d="M220 158 L255 165" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,2">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.4s" repeatCount="indefinite" />
              </path>
              <path d="M220 207 L255 195" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,2">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.4s" repeatCount="indefinite" />
              </path>
              <path d="M220 213 L255 230" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,2">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.4s" repeatCount="indefinite" />
              </path>
            </g>
          )}

          {/* Detectors */}
          {/* D1 and D2 - which-path ERASED */}
          <rect x="255" y="132" width="28" height="16" rx="3" fill={step >= 3 ? "#06b6d4" : "#1e3a4a"} opacity={step >= 3 ? 1 : 0.5} />
          <text x="269" y="143" textAnchor="middle" fill="white" fontSize="8">D1</text>

          <rect x="255" y="157" width="28" height="16" rx="3" fill={step >= 3 ? "#06b6d4" : "#1e3a4a"} opacity={step >= 3 ? 1 : 0.5} />
          <text x="269" y="168" textAnchor="middle" fill="white" fontSize="8">D2</text>

          {/* D3 and D4 - which-path PRESERVED */}
          <rect x="255" y="187" width="28" height="16" rx="3" fill={step >= 3 ? "#f97316" : "#4a2a1a"} opacity={step >= 3 ? 1 : 0.5} />
          <text x="269" y="198" textAnchor="middle" fill="white" fontSize="8">D3</text>

          <rect x="255" y="222" width="28" height="16" rx="3" fill={step >= 3 ? "#f97316" : "#4a2a1a"} opacity={step >= 3 ? 1 : 0.5} />
          <text x="269" y="233" textAnchor="middle" fill="white" fontSize="8">D4</text>

          {/* Detector type labels */}
          <text x="310" y="155" fill="#06b6d4" fontSize="7">paths merge</text>
          <text x="310" y="165" fill="#06b6d4" fontSize="7">→ erased</text>

          <text x="310" y="210" fill="#f97316" fontSize="7">paths separate</text>
          <text x="310" y="220" fill="#f97316" fontSize="7">→ preserved</text>

          {/* Collapse animation on detection */}
          {step === 3 && (
            <circle cx="269" cy="165" r="20" fill="#f97316" opacity="0.3">
              <animate attributeName="r" values="5;25;5" dur="0.8s" fill="freeze" />
              <animate attributeName="opacity" values="0.8;0;0" dur="0.8s" fill="freeze" />
            </circle>
          )}
        </g>

        {/* Timing annotation */}
        {step === 1 && (
          <g>
            <text x="180" y="160" fill="#22c55e" fontSize="9" fontWeight="bold">Signal detected FIRST</text>
            <text x="180" y="172" fill="#6b7280" fontSize="8">Idler still a wave...</text>
          </g>
        )}

        {step === 2 && (
          <g>
            <text x="130" y="20" fill="#22c55e" fontSize="9">Signal already recorded!</text>
            <text x="130" y="32" fill="#6b7280" fontSize="8">Idler spreading through ALL paths</text>
          </g>
        )}

        {/* Final sorting visualization */}
        {step === 4 && (
          <g>
            <rect x="360" y="30" width="130" height="240" fill="#1f2937" rx="5" />
            <text x="425" y="50" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Sorted Signal Data</text>

            {/* D1 subset - fringes */}
            <text x="375" y="80" fill="#06b6d4" fontSize="9">D1:</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={405 + i * 12} y="70" width={i % 2 === 0 ? 8 : 3} height="12" fill="#06b6d4" opacity={i % 2 === 0 ? 0.9 : 0.4} />
            ))}
            <text x="470" y="80" fill="#06b6d4" fontSize="7">fringes!</text>

            {/* D2 subset - anti-fringes */}
            <text x="375" y="110" fill="#06b6d4" fontSize="9">D2:</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={405 + i * 12} y="100" width={i % 2 === 1 ? 8 : 3} height="12" fill="#06b6d4" opacity={i % 2 === 1 ? 0.9 : 0.4} />
            ))}
            <text x="470" y="110" fill="#06b6d4" fontSize="7">anti-fringes</text>

            {/* D3 subset - blobs */}
            <text x="375" y="150" fill="#f97316" fontSize="9">D3:</text>
            <ellipse cx="420" cy="147" rx="10" ry="8" fill="#f97316" opacity="0.7" />
            <ellipse cx="455" cy="147" rx="10" ry="8" fill="#f97316" opacity="0.7" />
            <text x="470" y="150" fill="#f97316" fontSize="7">two blobs</text>

            {/* D4 subset - blobs */}
            <text x="375" y="180" fill="#f97316" fontSize="9">D4:</text>
            <ellipse cx="420" cy="177" rx="10" ry="8" fill="#f97316" opacity="0.7" />
            <ellipse cx="455" cy="177" rx="10" ry="8" fill="#f97316" opacity="0.7" />
            <text x="470" y="180" fill="#f97316" fontSize="7">two blobs</text>

            {/* All data */}
            <text x="375" y="220" fill="#9ca3af" fontSize="9">All:</text>
            <rect x="405" y="210" width="60" height="12" fill="#6b7280" opacity="0.5" />
            <text x="425" y="240" fill="#6b7280" fontSize="8">Just noise</text>
            <text x="425" y="252" fill="#6b7280" fontSize="7">(patterns cancel)</text>
          </g>
        )}
      </svg>

      {/* Step indicator and controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => { setIsPlaying(false); setStep(Math.max(0, step - 1)); }}
          disabled={step === 0}
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
          onClick={() => { setIsPlaying(false); setStep(Math.min(steps.length - 1, step + 1)); }}
          disabled={step === steps.length - 1}
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
