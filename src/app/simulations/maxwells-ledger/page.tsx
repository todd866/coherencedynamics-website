'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  time: number;
  value: number;
}

interface Path {
  id: number;
  events: number[];
  active: boolean;
}

export default function MaxwellsLedger() {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [digitalEnergy, setDigitalEnergy] = useState(0);
  const [biologicalEnergy, setBiologicalEnergy] = useState(0);
  const [, setPaths] = useState<Path[]>([]);
  const [output, setOutput] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'collecting' | 'committing' | 'done'>('idle');
  const [speed, setSpeed] = useState(1);
  const eventIdRef = useRef(0);
  const pathIdRef = useRef(0);

  const LANDAUER_COST = 0.003; // kT ln(2) in arbitrary units
  const EVENTS_TO_COLLECT = 8;

  const reset = useCallback(() => {
    setEvents([]);
    setDigitalEnergy(0);
    setBiologicalEnergy(0);
    setPaths([]);
    setOutput(null);
    setPhase('idle');
    setIsRunning(false);
    eventIdRef.current = 0;
    pathIdRef.current = 0;
  }, []);

  const start = useCallback(() => {
    reset();
    setIsRunning(true);
    setPhase('collecting');
  }, [reset]);

  // Generate events
  useEffect(() => {
    if (!isRunning || phase !== 'collecting') return;
    if (events.length >= EVENTS_TO_COLLECT) {
      setPhase('committing');
      return;
    }

    const interval = setInterval(() => {
      const newEvent: Event = {
        id: eventIdRef.current++,
        time: Date.now(),
        value: Math.random() > 0.5 ? 1 : 0,
      };

      setEvents(prev => [...prev, newEvent]);

      // Digital system pays immediately for timestamp + value
      setDigitalEnergy(prev => prev + LANDAUER_COST * 2);

      // Generate branching paths (exponential growth of possibilities)
      setPaths(prev => {
        if (prev.length === 0) {
          return [
            { id: pathIdRef.current++, events: [newEvent.value], active: true },
            { id: pathIdRef.current++, events: [1 - newEvent.value], active: true },
          ];
        }
        // Each existing path branches into 2 (showing timing ambiguity)
        const newPaths: Path[] = [];
        prev.forEach(path => {
          if (path.active && path.events.length < 6) { // Limit visual complexity
            newPaths.push({
              id: pathIdRef.current++,
              events: [...path.events, newEvent.value],
              active: true
            });
            newPaths.push({
              id: pathIdRef.current++,
              events: [...path.events, 1 - newEvent.value],
              active: true
            });
          } else {
            newPaths.push({ ...path, events: [...path.events, newEvent.value] });
          }
        });
        return newPaths.slice(0, 64); // Cap at 64 paths for performance
      });
    }, 800 / speed);

    return () => clearInterval(interval);
  }, [isRunning, phase, events.length, speed]);

  // Commitment phase
  useEffect(() => {
    if (phase !== 'committing') return;

    const timeout = setTimeout(() => {
      // Calculate final output (sum of event values)
      const sum = events.reduce((acc, e) => acc + e.value, 0);
      setOutput(sum);

      // Biological system pays only now - for the final output
      // Cost is logarithmic in the number of distinguishable outputs
      const outputBits = Math.ceil(Math.log2(EVENTS_TO_COLLECT + 1));
      setBiologicalEnergy(LANDAUER_COST * outputBits);

      // Collapse paths to show they all led here
      setPaths(prev => prev.map(p => ({ ...p, active: false })));

      setPhase('done');
      setIsRunning(false);
    }, 1000 / speed);

    return () => clearTimeout(timeout);
  }, [phase, events, speed]);

  const pathDegeneracy = Math.pow(2, Math.min(events.length, 6));
  const efficiencyRatio = digitalEnergy > 0 ? digitalEnergy / Math.max(biologicalEnergy, LANDAUER_COST) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/simulations" className="text-gray-400 hover:text-white mb-8 inline-block">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-3xl font-bold mb-2 text-white">Maxwell&apos;s Ledger</h1>
      <p className="text-gray-400 mb-8">
        Companion to{' '}
        <Link href="/papers/timing-inaccessibility" className="text-blue-400 hover:text-blue-300">
          Timing Inaccessibility and the Projection Bound
        </Link>
      </p>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={isRunning ? reset : start}
          className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {isRunning ? 'Reset' : phase === 'done' ? 'Run Again' : 'Start'}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-gray-400 text-sm">{speed}x</span>
        </div>
      </div>

      {/* Main visualization */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Digital System */}
        <div className="border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Digital Computer
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Records timestamp + value for every event. Pays immediately.
          </p>

          {/* Event log */}
          <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm mb-4">
            {events.length === 0 ? (
              <span className="text-gray-600">Waiting for events...</span>
            ) : (
              events.map((e, i) => (
                <div key={e.id} className="text-green-400">
                  [{i.toString().padStart(2, '0')}] t={e.time % 10000} val={e.value}
                  <span className="text-red-400 ml-2">-{(LANDAUER_COST * 2).toFixed(3)} kT</span>
                </div>
              ))
            )}
          </div>

          <div className="text-right">
            <span className="text-gray-400">Energy spent: </span>
            <span className="text-red-400 font-mono">{digitalEnergy.toFixed(3)} kT</span>
          </div>
        </div>

        {/* Biological System */}
        <div className="border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Biological System
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Integrates signals reversibly. Pays only at commitment.
          </p>

          {/* Path visualization */}
          <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-hidden relative mb-4">
            {phase === 'idle' && (
              <span className="text-gray-600">Waiting for events...</span>
            )}
            {(phase === 'collecting' || phase === 'committing') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {pathDegeneracy.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-sm">possible paths</div>
                  <div className="text-gray-600 text-xs mt-1">
                    (all indistinguishable from outside)
                  </div>
                </div>
              </div>
            )}
            {phase === 'done' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-500 text-sm mb-2">All paths collapsed to:</div>
                  <div className="text-4xl font-bold text-green-400">
                    output = {output}
                  </div>
                  <div className="text-gray-600 text-xs mt-2">
                    {pathDegeneracy.toLocaleString()} paths &rarr; 1 observable
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-gray-400">Energy spent: </span>
            <span className="text-green-400 font-mono">{biologicalEnergy.toFixed(3)} kT</span>
            {phase === 'collecting' && (
              <span className="text-gray-600 text-sm ml-2">(deferred)</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {phase === 'done' && (
        <div className="border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-white">Results</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-400">{digitalEnergy.toFixed(3)} kT</div>
              <div className="text-gray-500 text-sm">Digital cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{biologicalEnergy.toFixed(3)} kT</div>
              <div className="text-gray-500 text-sm">Biological cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{efficiencyRatio.toFixed(0)}x</div>
              <div className="text-gray-500 text-sm">Efficiency gap</div>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="prose prose-invert max-w-none">
        <h3 className="text-lg font-semibold mb-3 text-white">What&apos;s happening?</h3>
        <div className="text-gray-400 space-y-3">
          <p>
            <strong className="text-white">Digital:</strong> Records exactly when each event occurred
            and what value it had. This requires erasing the previous state—Landauer&apos;s principle says
            that costs at least kT ln(2) per bit. Every measurement, every timestamp, every bit costs energy.
          </p>
          <p>
            <strong className="text-white">Biological:</strong> Evolves through a high-dimensional state
            space where many micro-trajectories are possible. Below the Landauer threshold, the system
            can&apos;t record which path it took—but it doesn&apos;t need to. All paths that lead to the
            same output are thermodynamically equivalent.
          </p>
          <p>
            <strong className="text-white">The key insight:</strong> The biological system only pays the
            thermodynamic cost when it commits to an observable output. The path degeneracy (10<sup>50</sup>
            to 10<sup>100</sup> for real neural systems) represents &quot;free&quot; computation—exploration
            that happens below the measurement threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
