'use client';

import React, { useState, useMemo } from 'react';

interface PhotonData {
  x: number;           // Signal photon position on screen
  idlerOutcome: 'D1' | 'D2' | 'D3' | 'D4';  // Which idler detector fired
  whichPath: 'erased' | 'preserved';         // Whether which-path info is available
}

// Generate synthetic quantum eraser data
function generatePhotonData(n: number): PhotonData[] {
  const data: PhotonData[] = [];

  for (let i = 0; i < n; i++) {
    // Randomly assign idler detector (determines if which-path is erased or preserved)
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
      // Which-path preserved: two gaussian blobs (no interference)
      const slit = Math.random() < 0.5 ? -1 : 1;
      x = slit * 0.3 + (Math.random() - 0.5) * 0.4;
    } else {
      // Which-path erased: interference pattern
      // Use rejection sampling to create interference fringes
      let accepted = false;
      while (!accepted) {
        x = (Math.random() - 0.5) * 2;
        // Interference pattern: cos^2 with some envelope
        const envelope = Math.exp(-x * x * 2);
        const fringes = Math.cos(x * 12) ** 2;
        const probability = envelope * fringes;
        if (Math.random() < probability) {
          accepted = true;
        }
      }
      // D1 and D2 have opposite phase
      if (idlerOutcome === 'D2') {
        x = x + 0.13; // Phase shift for anti-fringes
      }
    }

    data.push({ x, idlerOutcome, whichPath });
  }

  return data;
}

type ViewMode = 'all' | 'D1' | 'D2' | 'D3' | 'D4' | 'erased' | 'preserved';

interface Props {
  className?: string;
}

export default function QuantumEraserDemo({ className = '' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showExplanation, setShowExplanation] = useState(true);

  // Generate data once
  const photonData = useMemo(() => generatePhotonData(2000), []);

  // Filter data based on view mode
  const visibleData = useMemo(() => {
    switch (viewMode) {
      case 'all':
        return photonData;
      case 'D1':
        return photonData.filter(p => p.idlerOutcome === 'D1');
      case 'D2':
        return photonData.filter(p => p.idlerOutcome === 'D2');
      case 'D3':
        return photonData.filter(p => p.idlerOutcome === 'D3');
      case 'D4':
        return photonData.filter(p => p.idlerOutcome === 'D4');
      case 'erased':
        return photonData.filter(p => p.whichPath === 'erased');
      case 'preserved':
        return photonData.filter(p => p.whichPath === 'preserved');
      default:
        return photonData;
    }
  }, [photonData, viewMode]);

  // Create histogram for visualization
  const histogram = useMemo(() => {
    const bins = 60;
    const counts = new Array(bins).fill(0);
    const binWidth = 2 / bins;

    visibleData.forEach(p => {
      const binIndex = Math.floor((p.x + 1) / binWidth);
      if (binIndex >= 0 && binIndex < bins) {
        counts[binIndex]++;
      }
    });

    const maxCount = Math.max(...counts, 1);
    return counts.map(c => c / maxCount);
  }, [visibleData]);

  const getButtonClass = (mode: ViewMode) => {
    const isActive = viewMode === mode;
    const baseClass = "px-3 py-1.5 text-xs rounded transition-all ";

    if (isActive) {
      if (mode === 'all') return baseClass + "bg-gray-600 text-white";
      if (mode === 'erased' || mode === 'D1' || mode === 'D2') return baseClass + "bg-cyan-600 text-white";
      return baseClass + "bg-orange-600 text-white";
    }
    return baseClass + "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white";
  };

  const explanations: Record<ViewMode, string> = {
    all: "All 2000 photon detections. No pattern visible — just noise. This is what you see before postselection.",
    D1: "Postselected on detector D1 (which-path erased). Interference fringes appear!",
    D2: "Postselected on detector D2 (which-path erased). Anti-fringes — shifted by half a wavelength from D1.",
    D3: "Postselected on detector D3 (which-path preserved). No interference — just two blobs from the two slits.",
    D4: "Postselected on detector D4 (which-path preserved). Same as D3 — no interference.",
    erased: "All 'which-path erased' detections (D1 + D2). Fringes and anti-fringes cancel — back to no pattern!",
    preserved: "All 'which-path preserved' detections (D3 + D4). Two-slit pattern without interference.",
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Delayed-Choice Quantum Eraser</h3>
        <p className="text-gray-400 text-sm">Same data. Different slices. Different patterns.</p>
      </div>

      {/* Histogram display */}
      <div className="relative h-48 mb-4 bg-black rounded overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center gap-px px-2">
          {histogram.map((height, i) => (
            <div
              key={i}
              className="flex-1 transition-all duration-300"
              style={{
                height: `${height * 100}%`,
                backgroundColor: viewMode === 'all' ? '#6b7280' :
                  (viewMode === 'erased' || viewMode === 'D1' || viewMode === 'D2') ? '#06b6d4' : '#f97316',
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* Screen label */}
        <div className="absolute bottom-1 left-2 text-xs text-gray-600">Detection Screen</div>
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          {visibleData.length} / {photonData.length} photons
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setViewMode('all')} className={getButtonClass('all')}>
            All Data
          </button>
          <span className="text-gray-600 self-center">|</span>
          <button onClick={() => setViewMode('D1')} className={getButtonClass('D1')}>
            D1 (erased)
          </button>
          <button onClick={() => setViewMode('D2')} className={getButtonClass('D2')}>
            D2 (erased)
          </button>
          <button onClick={() => setViewMode('D3')} className={getButtonClass('D3')}>
            D3 (preserved)
          </button>
          <button onClick={() => setViewMode('D4')} className={getButtonClass('D4')}>
            D4 (preserved)
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setViewMode('erased')} className={getButtonClass('erased')}>
            All Erased (D1+D2)
          </button>
          <button onClick={() => setViewMode('preserved')} className={getButtonClass('preserved')}>
            All Preserved (D3+D4)
          </button>
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300 text-center">
          {explanations[viewMode]}
        </div>
      )}

      {/* Key insight */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          {showExplanation ? 'Hide' : 'Show'} explanation
        </button>
      </div>

      <div className="mt-4 border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-500 text-center">
          <strong className="text-gray-400">The trick:</strong> The dots never move.
          You&apos;re just choosing which subset to look at.
          The correlations were always there — in the joint high-dimensional state.
        </p>
      </div>
    </div>
  );
}
