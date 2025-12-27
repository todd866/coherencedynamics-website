'use client';

import React, { useState, useCallback } from 'react';

interface Props {
  className?: string;
}

type Measurement = 'X' | 'Z';

interface State {
  label: string;
  coords: { x: number; y: number };
  color: string;
}

// States in the Bloch sphere visualization (simplified 2D slice)
const states: Record<string, State> = {
  'z+': { label: '|0⟩', coords: { x: 0, y: 1 }, color: '#06b6d4' },
  'z-': { label: '|1⟩', coords: { x: 0, y: -1 }, color: '#f97316' },
  'x+': { label: '|+⟩', coords: { x: 1, y: 0 }, color: '#22c55e' },
  'x-': { label: '|-⟩', coords: { x: -1, y: 0 }, color: '#ef4444' },
};

export default function NoncommutationDemo({ className = '' }: Props) {
  const [currentState, setCurrentState] = useState<string>('z+');
  const [history, setHistory] = useState<Array<{ action: string; result: string }>>([
    { action: 'Initialize', result: '|0⟩ (spin up)' }
  ]);
  const [lastMeasurement, setLastMeasurement] = useState<string | null>(null);

  const reset = useCallback(() => {
    setCurrentState('z+');
    setHistory([{ action: 'Initialize', result: '|0⟩ (spin up)' }]);
    setLastMeasurement(null);
  }, []);

  const measure = useCallback((basis: Measurement) => {
    let result: string;
    let outcome: string;

    if (basis === 'Z') {
      // Measuring Z: projects onto z+ or z-
      if (currentState === 'z+' || currentState === 'z-') {
        // Already in Z eigenstates - definite outcome
        result = currentState;
        outcome = currentState === 'z+' ? '|0⟩ (definite)' : '|1⟩ (definite)';
      } else {
        // In X eigenstate - 50/50 random
        result = Math.random() < 0.5 ? 'z+' : 'z-';
        outcome = result === 'z+' ? '|0⟩ (random 50%)' : '|1⟩ (random 50%)';
      }
    } else {
      // Measuring X: projects onto x+ or x-
      if (currentState === 'x+' || currentState === 'x-') {
        // Already in X eigenstates - definite outcome
        result = currentState;
        outcome = currentState === 'x+' ? '|+⟩ (definite)' : '|-⟩ (definite)';
      } else {
        // In Z eigenstate - 50/50 random
        result = Math.random() < 0.5 ? 'x+' : 'x-';
        outcome = result === 'x+' ? '|+⟩ (random 50%)' : '|-⟩ (random 50%)';
      }
    }

    setCurrentState(result);
    setHistory(h => [...h, { action: `Measure ${basis}`, result: outcome }]);
    setLastMeasurement(basis);
  }, [currentState]);

  const state = states[currentState];
  const scale = 60;
  const cx = 100, cy = 100;

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Noncommuting Measurements</h3>
        <p className="text-xs text-gray-500">Try measuring Z then X, vs X then Z. The order matters!</p>
      </div>

      <div className="flex gap-4">
        {/* Bloch sphere slice visualization */}
        <div className="flex-1">
          <svg viewBox="0 0 200 200" className="w-full bg-black rounded border border-gray-800">
            {/* Axes */}
            <line x1={cx - 80} y1={cy} x2={cx + 80} y2={cy} stroke="#22c55e" strokeWidth="1" opacity="0.5" />
            <line x1={cx} y1={cy - 80} x2={cx} y2={cy + 80} stroke="#06b6d4" strokeWidth="1" opacity="0.5" />

            {/* Axis labels */}
            <text x={cx + 75} y={cy - 5} fill="#22c55e" fontSize="10">X</text>
            <text x={cx + 5} y={cy - 70} fill="#06b6d4" fontSize="10">Z</text>

            {/* State circle */}
            <circle cx={cx} cy={cy} r={scale} fill="none" stroke="#374151" strokeWidth="1" />

            {/* Basis states */}
            <circle cx={cx} cy={cy - scale} r="5" fill="#06b6d4" opacity="0.3" />
            <text x={cx + 10} y={cy - scale + 4} fill="#06b6d4" fontSize="9" opacity="0.6">|0⟩</text>

            <circle cx={cx} cy={cy + scale} r="5" fill="#f97316" opacity="0.3" />
            <text x={cx + 10} y={cy + scale + 4} fill="#f97316" fontSize="9" opacity="0.6">|1⟩</text>

            <circle cx={cx + scale} cy={cy} r="5" fill="#22c55e" opacity="0.3" />
            <text x={cx + scale + 8} y={cy + 4} fill="#22c55e" fontSize="9" opacity="0.6">|+⟩</text>

            <circle cx={cx - scale} cy={cy} r="5" fill="#ef4444" opacity="0.3" />
            <text x={cx - scale - 18} y={cy + 4} fill="#ef4444" fontSize="9" opacity="0.6">|-⟩</text>

            {/* Current state vector */}
            <line
              x1={cx}
              y1={cy}
              x2={cx + state.coords.x * scale}
              y2={cy - state.coords.y * scale}
              stroke={state.color}
              strokeWidth="3"
            />
            <circle
              cx={cx + state.coords.x * scale}
              cy={cy - state.coords.y * scale}
              r="8"
              fill={state.color}
            />

            {/* State label */}
            <text
              x={cx + state.coords.x * scale + (state.coords.x >= 0 ? 12 : -25)}
              y={cy - state.coords.y * scale + (state.coords.y >= 0 ? -8 : 15)}
              fill={state.color}
              fontSize="14"
              fontWeight="bold"
            >
              {state.label}
            </text>
          </svg>
        </div>

        {/* Controls and history */}
        <div className="flex-1 space-y-3">
          {/* Measurement buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => measure('Z')}
              className={`py-3 rounded font-medium transition-all ${
                lastMeasurement === 'Z'
                  ? 'bg-cyan-700 text-white ring-2 ring-cyan-400'
                  : 'bg-cyan-900 text-cyan-300 hover:bg-cyan-800'
              }`}
            >
              Measure Z
              <span className="block text-xs opacity-70">↑ or ↓</span>
            </button>
            <button
              onClick={() => measure('X')}
              className={`py-3 rounded font-medium transition-all ${
                lastMeasurement === 'X'
                  ? 'bg-green-700 text-white ring-2 ring-green-400'
                  : 'bg-green-900 text-green-300 hover:bg-green-800'
              }`}
            >
              Measure X
              <span className="block text-xs opacity-70">← or →</span>
            </button>
          </div>

          <button
            onClick={reset}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 text-sm"
          >
            Reset to |0⟩
          </button>

          {/* History */}
          <div className="bg-gray-800 rounded p-2 h-40 overflow-y-auto">
            <p className="text-xs text-gray-500 mb-2">Measurement history:</p>
            {history.map((h, i) => (
              <div key={i} className="text-xs py-0.5">
                <span className="text-gray-500">{i}.</span>{' '}
                <span className="text-white">{h.action}:</span>{' '}
                <span className={
                  h.result.includes('random')
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }>{h.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <p className="text-sm text-gray-300">
          <strong className="text-white">The key insight:</strong> Measuring Z puts the state into |0⟩ or |1⟩.
          From there, measuring X gives a random result. But if you measure X first, <em>then</em> Z,
          you get a different random sequence.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Mathematically: [Z, X] ≠ 0. The measurements don&apos;t commute.
          The order you ask questions determines what answers are possible.
        </p>
      </div>

      {/* Try this */}
      <div className="mt-3 p-2 bg-purple-900/30 rounded border border-purple-800">
        <p className="text-xs text-purple-200">
          <strong>Try this:</strong> Reset, then measure Z → X → Z. Notice the second Z measurement is random even though the first was definite.
          The X measurement in between &ldquo;disturbed&rdquo; the Z information.
        </p>
      </div>
    </div>
  );
}
