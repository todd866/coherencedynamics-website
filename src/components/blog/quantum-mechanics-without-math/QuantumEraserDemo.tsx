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
      const slit = Math.random() < 0.5 ? -1 : 1;
      x = slit * 0.3 + (Math.random() - 0.5) * 0.4;
    } else {
      let accepted = false;
      while (!accepted) {
        x = (Math.random() - 0.5) * 2;
        const envelope = Math.exp(-x * x * 2);
        const fringes = Math.cos(x * 12) ** 2;
        const probability = envelope * fringes;
        if (Math.random() < probability) {
          accepted = true;
        }
      }
      if (idlerOutcome === 'D2') {
        x = x + 0.13;
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

  // eslint-disable-next-line react-hooks/exhaustive-deps -- seed change triggers resample intentionally
  const photonData = useMemo(() => generatePhotonData(2500), [seed]);

  const handleResample = () => setSeed(s => s + 1);

  const { histogramLayers } = useMemo(() => {
    const bins = 60;
    const normalize = (counts: number[], max: number) => counts.map(c => c / max);

    if (viewMode === 'compare') {
      const d1Data = photonData.filter(p => p.idlerOutcome === 'D1');
      const d2Data = photonData.filter(p => p.idlerOutcome === 'D2');

      const counts1 = getHistogramCounts(d1Data, bins);
      const counts2 = getHistogramCounts(d2Data, bins);

      const localMax = Math.max(...counts1, ...counts2, 1);

      return {
        histogramLayers: {
          primary: normalize(counts1, localMax),
          secondary: normalize(counts2, localMax)
        }
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
        histogramLayers: {
          primary: normalize(counts, localMax),
          secondary: null
        }
      };
    }
  }, [photonData, viewMode]);

  const getButtonClass = (mode: ViewMode) => {
    const isActive = viewMode === mode;
    const baseClass = "px-3 py-1.5 text-xs rounded transition-all border border-transparent ";

    if (isActive) {
      if (mode === 'compare') return baseClass + "bg-indigo-900 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]";
      if (mode === 'all') return baseClass + "bg-gray-600 text-white";
      if (mode === 'erased' || mode === 'D1' || mode === 'D2') return baseClass + "bg-cyan-600 text-white";
      return baseClass + "bg-orange-600 text-white";
    }
    return baseClass + "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white";
  };

  const explanations: Record<ViewMode, string> = {
    all: "All photons. No interference fringes — the hidden patterns cancel each other out.",
    D1: "Detector D1 only (erased). Interference fringes appear!",
    D2: "Detector D2 only (erased). Anti-fringes — shifted to fill the gaps of D1.",
    D3: "Detector D3 (preserved). No interference — just two blobs.",
    D4: "Detector D4 (preserved). Same as D3 — no interference.",
    erased: "All erased (D1 + D2). The fringes and anti-fringes add up to a flat line.",
    preserved: "All preserved (D3 + D4). Two-slit pattern without interference.",
    compare: "Comparing D1 (Cyan) vs D2 (Fuchsia). See how the peaks of one fit the troughs of the other? When you add them, the pattern disappears.",
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Delayed-Choice Quantum Eraser</h3>
        <p className="text-gray-400 text-sm">Sorting the noise reveals the signal.</p>
      </div>

      {/* Histogram display */}
      <div className="relative h-48 mb-4 bg-black rounded overflow-hidden border border-gray-800">
        <div className="absolute inset-0 flex items-end justify-center gap-px px-2">
          {histogramLayers.primary.map((h1, i) => {
             const h2 = histogramLayers.secondary ? histogramLayers.secondary[i] : 0;
             return (
              <div key={i} className="flex-1 h-full flex items-end relative">
                {/* Secondary Bar (D2 in compare mode) */}
                {histogramLayers.secondary && (
                  <div
                    className="absolute bottom-0 w-full bg-fuchsia-500 transition-all duration-300 opacity-80"
                    style={{ height: `${h2 * 90}%` }}
                  />
                )}

                {/* Primary Bar */}
                <div
                  className="w-full relative z-10 transition-all duration-300"
                  style={{
                    height: `${h1 * 90}%`,
                    backgroundColor: viewMode === 'all' ? '#6b7280' :
                      viewMode === 'compare' ? '#06b6d4' :
                      (viewMode === 'erased' || viewMode === 'D1' || viewMode === 'D2') ? '#06b6d4' : '#f97316',
                    opacity: viewMode === 'compare' ? 0.7 : 0.8,
                    mixBlendMode: viewMode === 'compare' ? 'screen' : 'normal',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="absolute bottom-1 left-2 text-xs text-gray-600">Screen Position</div>
        {viewMode === 'compare' && (
          <div className="absolute top-2 left-2 text-xs flex gap-3 bg-black/50 p-1 rounded">
            <span className="text-cyan-400 font-bold">● D1 (Fringes)</span>
            <span className="text-fuchsia-500 font-bold">● D2 (Anti-fringes)</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setViewMode('all')} className={getButtonClass('all')}>
            All Data
          </button>
          <span className="text-gray-700 self-center">|</span>
          <button onClick={() => setViewMode('D1')} className={getButtonClass('D1')}>
            D1
          </button>
          <button onClick={() => setViewMode('D2')} className={getButtonClass('D2')}>
            D2
          </button>
          <span className="text-gray-700 self-center">|</span>
          <button onClick={() => setViewMode('D3')} className={getButtonClass('D3')}>
            D3
          </button>
          <button onClick={() => setViewMode('D4')} className={getButtonClass('D4')}>
            D4
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center items-center">
           <button onClick={() => setViewMode('compare')} className={getButtonClass('compare')}>
            ⚡ Compare D1 vs D2
          </button>
          <span className="text-gray-700 self-center text-sm">or view sums:</span>
          <button onClick={() => setViewMode('erased')} className={getButtonClass('erased')}>
            D1 + D2
          </button>
          <button onClick={() => setViewMode('preserved')} className={getButtonClass('preserved')}>
            D3 + D4
          </button>
        </div>
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className={`mt-4 p-3 rounded text-sm text-center transition-colors ${
          viewMode === 'compare' ? 'bg-indigo-900/30 text-indigo-200 border border-indigo-900' : 'bg-gray-800 text-gray-300'
        }`}>
          {explanations[viewMode]}
        </div>
      )}

      <div className="mt-2 text-center flex justify-center gap-4">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          {showExplanation ? 'Hide' : 'Show'} explanation
        </button>
        <button
          onClick={handleResample}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          ↻ New sample
        </button>
      </div>

      <div className="mt-4 border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-500 text-center">
          <strong className="text-gray-400">The punchline:</strong> The dots never move.
          You&apos;re choosing which subset to examine. The correlations were always there.
        </p>
      </div>
    </div>
  );
}
