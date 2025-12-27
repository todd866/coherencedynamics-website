'use client';

import React, { useState, useMemo } from 'react';

interface PhotonData {
  x: number;
  idlerOutcome: 'D1' | 'D2' | 'D3' | 'D4';
  whichPath: 'erased' | 'preserved';
}

function generatePhotonData(n: number): PhotonData[] {
  const data: PhotonData[] = [];

  for (let i = 0; i < n; i++) {
    const detectorRoll = Math.random();
    let idlerOutcome: 'D1' | 'D2' | 'D3' | 'D4';
    let whichPath: 'erased' | 'preserved';

    if (detectorRoll < 0.25) {
      idlerOutcome = 'D1';
      whichPath = 'erased';
    } else if (detectorRoll < 0.5) {
      idlerOutcome = 'D2';
      whichPath = 'erased';
    } else if (detectorRoll < 0.75) {
      idlerOutcome = 'D3';
      whichPath = 'preserved';
    } else {
      idlerOutcome = 'D4';
      whichPath = 'preserved';
    }

    let x = 0;

    if (whichPath === 'preserved') {
      // Two distinct blobs at -0.4 and +0.4 (more separated)
      const slit = Math.random() < 0.5 ? -1 : 1;
      x = slit * 0.4 + (Math.random() - 0.5) * 0.3;
    } else {
      // Interference pattern with rejection sampling
      let accepted = false;
      while (!accepted) {
        x = (Math.random() - 0.5) * 1.8;
        const envelope = Math.exp(-x * x * 3);
        const fringes = Math.cos(x * 15) ** 2;
        const probability = envelope * fringes;
        if (Math.random() < probability) {
          accepted = true;
        }
      }
      // D2 is phase-shifted (anti-fringes)
      if (idlerOutcome === 'D2') {
        x = x + 0.105; // half-period shift
      }
    }

    data.push({ x, idlerOutcome, whichPath });
  }

  return data;
}

function getHistogramCounts(data: PhotonData[], bins: number): number[] {
  const counts = new Array(bins).fill(0);
  const binWidth = 2 / bins;

  data.forEach(p => {
    const binIndex = Math.floor((p.x + 1) / binWidth);
    if (binIndex >= 0 && binIndex < bins) {
      counts[binIndex]++;
    }
  });
  return counts;
}

type ViewMode = 'all' | 'D1' | 'D2' | 'D3' | 'D4' | 'erased' | 'preserved' | 'compare';

interface Props {
  className?: string;
}

export default function QuantumEraserDemo({ className = '' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showExplanation, setShowExplanation] = useState(true);
  const [seed, setSeed] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- seed triggers resample
  const photonData = useMemo(() => generatePhotonData(2000), [seed]);

  const handleResample = () => setSeed(s => s + 1);

  const bins = 50;
  const { primary, secondary, subsetCount } = useMemo(() => {
    const normalize = (counts: number[], max: number) => counts.map(c => c / max);

    if (viewMode === 'compare') {
      const d1Data = photonData.filter(p => p.idlerOutcome === 'D1');
      const d2Data = photonData.filter(p => p.idlerOutcome === 'D2');

      const counts1 = getHistogramCounts(d1Data, bins);
      const counts2 = getHistogramCounts(d2Data, bins);

      const localMax = Math.max(...counts1, ...counts2, 1);

      return {
        primary: normalize(counts1, localMax),
        secondary: normalize(counts2, localMax),
        subsetCount: d1Data.length + d2Data.length
      };
    } else {
      let subset = photonData;
      switch (viewMode) {
        case 'D1': subset = photonData.filter(p => p.idlerOutcome === 'D1'); break;
        case 'D2': subset = photonData.filter(p => p.idlerOutcome === 'D2'); break;
        case 'D3': subset = photonData.filter(p => p.idlerOutcome === 'D3'); break;
        case 'D4': subset = photonData.filter(p => p.idlerOutcome === 'D4'); break;
        case 'erased': subset = photonData.filter(p => p.whichPath === 'erased'); break;
        case 'preserved': subset = photonData.filter(p => p.whichPath === 'preserved'); break;
        default: subset = photonData;
      }

      const counts = getHistogramCounts(subset, bins);
      const localMax = Math.max(...counts, 1);

      return {
        primary: normalize(counts, localMax),
        secondary: null as number[] | null,
        subsetCount: subset.length
      };
    }
  }, [photonData, viewMode]);

  const getButtonClass = (mode: ViewMode) => {
    const isActive = viewMode === mode;
    const base = "px-2.5 py-1 text-xs rounded transition-all ";

    if (isActive) {
      if (mode === 'compare') return base + "bg-purple-700 text-white ring-1 ring-purple-400";
      if (mode === 'all') return base + "bg-gray-600 text-white";
      if (mode === 'erased' || mode === 'D1' || mode === 'D2') return base + "bg-cyan-600 text-white";
      return base + "bg-orange-600 text-white";
    }
    return base + "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white";
  };

  const getBarColor = () => {
    if (viewMode === 'all') return '#6b7280';
    if (viewMode === 'compare') return '#06b6d4';
    if (viewMode === 'erased' || viewMode === 'D1' || viewMode === 'D2') return '#06b6d4';
    return '#f97316';
  };

  const explanations: Record<ViewMode, string> = {
    all: "All 2000 photons. No interference fringes — the patterns cancel out.",
    D1: "D1 subset only. Interference fringes appear!",
    D2: "D2 subset only. Anti-fringes — peaks where D1 has troughs.",
    D3: "D3 subset. No interference — two distinct blobs from the two slits.",
    D4: "D4 subset. Same as D3 — two blobs, no fringes.",
    erased: "D1 + D2 combined. Fringes and anti-fringes cancel → flat envelope.",
    preserved: "D3 + D4 combined. Two-blob pattern (which-path info preserved).",
    compare: "D1 (cyan) vs D2 (magenta). Notice how peaks align with troughs!",
  };

  // SVG dimensions
  const svgW = 400;
  const svgH = 160;
  const margin = { top: 20, right: 15, bottom: 25, left: 15 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;
  const barW = plotW / bins;

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">Quantum Eraser: Postselection Demo</h3>
          <p className="text-gray-500 text-xs">Same data, different subsets → different patterns</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">n = {subsetCount}</span>
        </div>
      </div>

      {/* SVG Histogram */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full bg-black rounded border border-gray-800"
        style={{ maxHeight: '200px' }}
      >
        {/* Plot area background */}
        <rect
          x={margin.left}
          y={margin.top}
          width={plotW}
          height={plotH}
          fill="#0a0a0a"
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(frac => (
          <line
            key={frac}
            x1={margin.left}
            y1={margin.top + plotH * (1 - frac)}
            x2={margin.left + plotW}
            y2={margin.top + plotH * (1 - frac)}
            stroke="#1f2937"
            strokeWidth="0.5"
          />
        ))}

        {/* Secondary bars (D2 in compare mode) */}
        {secondary && secondary.map((h, i) => (
          <rect
            key={`s-${i}`}
            x={margin.left + i * barW + 1}
            y={margin.top + plotH * (1 - h)}
            width={barW - 1}
            height={plotH * h}
            fill="#d946ef"
            opacity={0.6}
          />
        ))}

        {/* Primary bars */}
        {primary.map((h, i) => (
          <rect
            key={`p-${i}`}
            x={margin.left + i * barW + 1}
            y={margin.top + plotH * (1 - h)}
            width={barW - 1}
            height={plotH * h}
            fill={getBarColor()}
            opacity={viewMode === 'compare' ? 0.7 : 0.85}
            style={{ mixBlendMode: viewMode === 'compare' ? 'screen' : 'normal' }}
          />
        ))}

        {/* X-axis label */}
        <text
          x={margin.left + plotW / 2}
          y={svgH - 5}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="10"
        >
          Screen Position
        </text>

        {/* X-axis ticks */}
        <text x={margin.left} y={svgH - 12} textAnchor="start" fill="#4b5563" fontSize="8">-1</text>
        <text x={margin.left + plotW / 2} y={svgH - 12} textAnchor="middle" fill="#4b5563" fontSize="8">0</text>
        <text x={margin.left + plotW} y={svgH - 12} textAnchor="end" fill="#4b5563" fontSize="8">+1</text>

        {/* Compare mode legend */}
        {viewMode === 'compare' && (
          <g>
            <rect x={margin.left + 5} y={margin.top + 5} width="90" height="28" fill="#000" opacity="0.7" rx="3" />
            <circle cx={margin.left + 15} cy={margin.top + 15} r="4" fill="#06b6d4" />
            <text x={margin.left + 23} y={margin.top + 18} fill="#06b6d4" fontSize="9">D1 (fringes)</text>
            <circle cx={margin.left + 15} cy={margin.top + 27} r="4" fill="#e879f9" />
            <text x={margin.left + 23} y={margin.top + 30} fill="#e879f9" fontSize="9">D2 (anti-fringes)</text>
          </g>
        )}

        {/* Mode indicator */}
        <text
          x={margin.left + plotW - 5}
          y={margin.top + 12}
          textAnchor="end"
          fill={getBarColor()}
          fontSize="10"
          fontWeight="bold"
        >
          {viewMode === 'all' ? 'ALL' :
           viewMode === 'compare' ? 'COMPARE' :
           viewMode === 'erased' ? 'D1+D2' :
           viewMode === 'preserved' ? 'D3+D4' :
           viewMode.toUpperCase()}
        </text>
      </svg>

      {/* Controls */}
      <div className="mt-3 space-y-2">
        {/* Row 1: Individual detectors */}
        <div className="flex flex-wrap gap-1.5 justify-center items-center">
          <button onClick={() => setViewMode('all')} className={getButtonClass('all')}>
            All
          </button>
          <span className="text-gray-700 mx-1">│</span>
          <span className="text-cyan-600 text-xs mr-1">erased:</span>
          <button onClick={() => setViewMode('D1')} className={getButtonClass('D1')}>D1</button>
          <button onClick={() => setViewMode('D2')} className={getButtonClass('D2')}>D2</button>
          <span className="text-gray-700 mx-1">│</span>
          <span className="text-orange-500 text-xs mr-1">preserved:</span>
          <button onClick={() => setViewMode('D3')} className={getButtonClass('D3')}>D3</button>
          <button onClick={() => setViewMode('D4')} className={getButtonClass('D4')}>D4</button>
        </div>

        {/* Row 2: Combinations */}
        <div className="flex flex-wrap gap-1.5 justify-center items-center">
          <button onClick={() => setViewMode('compare')} className={getButtonClass('compare')}>
            ⚡ Compare D1 vs D2
          </button>
          <button onClick={() => setViewMode('erased')} className={getButtonClass('erased')}>
            D1 + D2
          </button>
          <button onClick={() => setViewMode('preserved')} className={getButtonClass('preserved')}>
            D3 + D4
          </button>
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`mt-3 p-2.5 rounded text-xs text-center ${
          viewMode === 'compare'
            ? 'bg-purple-900/30 text-purple-200 border border-purple-800'
            : 'bg-gray-800 text-gray-300'
        }`}>
          {explanations[viewMode]}
        </div>
      )}

      {/* Footer controls */}
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-gray-500 hover:text-gray-300"
        >
          {showExplanation ? 'Hide' : 'Show'} explanation
        </button>
        <button
          onClick={handleResample}
          className="text-gray-500 hover:text-gray-300"
        >
          ↻ Resample
        </button>
      </div>

      {/* Punchline */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          <strong className="text-gray-400">Key insight:</strong> The data never changes.
          You&apos;re choosing which correlated subset to highlight.
        </p>
      </div>
    </div>
  );
}
