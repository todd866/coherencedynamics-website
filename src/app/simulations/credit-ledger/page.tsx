'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Binary entropy function
function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
}

export default function CreditLedgerPage() {
  // State for sliders
  const [bias, setBias] = useState(0.5); // p = P(X=1)
  const [mutualInfo, setMutualInfo] = useState(0); // I(X;Y) in bits
  const [protocolDuration, setProtocolDuration] = useState(10); // tau in relaxation times
  const [thermoLength, setThermoLength] = useState(1.5); // L (dimensionless)

  // Derived quantities
  const calculations = useMemo(() => {
    const H_X = binaryEntropy(bias);
    const H_max = 1; // 1 bit register
    const negentropy = H_max - H_X;

    // Cap mutual info at H(X)
    const I_capped = Math.min(mutualInfo, H_X);

    const C_state = negentropy + I_capped;
    const W_rev = H_max - C_state; // in units of kT ln2
    const W_irr = (thermoLength * thermoLength) / (2 * protocolDuration); // in units of kT

    // Convert W_rev to kT units (multiply by ln2 ≈ 0.693)
    const W_rev_kT = W_rev * Math.LN2;
    const W_total_kT = W_rev_kT + W_irr;

    // Naive Landauer for comparison
    const W_naive_kT = Math.LN2; // kT ln2 for 1 bit

    return {
      H_X,
      negentropy,
      I_capped,
      C_state,
      W_rev, // bits
      W_rev_kT,
      W_irr,
      W_total_kT,
      W_naive_kT,
      savings: ((W_naive_kT - W_total_kT) / W_naive_kT) * 100,
    };
  }, [bias, mutualInfo, protocolDuration, thermoLength]);

  const maxBarWidth = calculations.W_naive_kT * 1.1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">The Credit Ledger</h1>
      <p className="text-gray-500 text-sm mb-6">
        Companion to{' '}
        <Link href="/papers/information-credit" className="text-blue-400 hover:text-blue-300">
          State Credit and Protocol Efficiency
        </Link>
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-4">State Credit</h3>

            {/* Bias slider */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Bias p = P(X=1)</span>
                <span className="text-white font-mono">{bias.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={bias}
                onChange={(e) => setBias(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>biased (low H)</span>
                <span>uniform</span>
                <span>biased (low H)</span>
              </div>
            </div>

            {/* Mutual info slider */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Mutual info I(X;Y)</span>
                <span className="text-white font-mono">{calculations.I_capped.toFixed(2)} bits</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={mutualInfo}
                onChange={(e) => setMutualInfo(parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="text-xs text-gray-600 mt-1">
                Capped at H(X) = {calculations.H_X.toFixed(2)} bits
              </div>
            </div>

            {/* Derived credit values */}
            <div className="bg-gray-900 rounded p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Entropy H(X)</span>
                <span className="text-white font-mono">{calculations.H_X.toFixed(3)} bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Negentropy (1 - H)</span>
                <span className="text-blue-400 font-mono">{calculations.negentropy.toFixed(3)} bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Correlation credit</span>
                <span className="text-green-400 font-mono">{calculations.I_capped.toFixed(3)} bits</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-white">Total state credit</span>
                <span className="text-yellow-400 font-mono font-bold">{calculations.C_state.toFixed(3)} bits</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-4">Protocol Efficiency</h3>

            {/* Protocol duration slider */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Duration &tau;</span>
                <span className="text-white font-mono">{protocolDuration} relaxation times</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={protocolDuration}
                onChange={(e) => setProtocolDuration(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Thermo length slider */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Thermodynamic length L</span>
                <span className="text-white font-mono">{thermoLength.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={thermoLength}
                onChange={(e) => setThermoLength(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="text-xs text-gray-600 mt-1">
                Geodesic = 1.0, naive axis-aligned &asymp; 5.0
              </div>
            </div>
          </div>
        </div>

        {/* Results visualization */}
        <div className="space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-4">Work Decomposition</h3>

            {/* Bar chart */}
            <div className="space-y-3">
              {/* Naive Landauer reference */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Naive Landauer (kT ln 2)</span>
                  <span className="text-gray-500 font-mono">{calculations.W_naive_kT.toFixed(3)} kT</span>
                </div>
                <div className="h-6 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-gray-600"
                    style={{ width: `${(calculations.W_naive_kT / maxBarWidth) * 100}%` }}
                  />
                </div>
              </div>

              {/* W_rev */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400">W_rev (after credit)</span>
                  <span className="text-blue-400 font-mono">{calculations.W_rev_kT.toFixed(3)} kT</span>
                </div>
                <div className="h-6 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(calculations.W_rev_kT / maxBarWidth) * 100}%` }}
                  />
                </div>
              </div>

              {/* W_irr */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-400">W_irr (protocol)</span>
                  <span className="text-purple-400 font-mono">{calculations.W_irr.toFixed(3)} kT</span>
                </div>
                <div className="h-6 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${(calculations.W_irr / maxBarWidth) * 100}%` }}
                  />
                </div>
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium">Total Work</span>
                  <span className="text-white font-mono font-bold">{calculations.W_total_kT.toFixed(3)} kT</span>
                </div>
                <div className="h-8 bg-gray-800 rounded overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(calculations.W_rev_kT / maxBarWidth) * 100}%` }}
                  />
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${(calculations.W_irr / maxBarWidth) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Savings summary */}
            <div className="mt-4 p-3 bg-gray-900 rounded">
              <div className="text-center">
                <span className="text-gray-400 text-sm">Savings vs naive Landauer: </span>
                <span className={`font-mono font-bold text-lg ${calculations.savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {calculations.savings.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Equations */}
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Combined Bound</h3>
            <div className="bg-gray-900 rounded p-3 font-mono text-sm text-center">
              <div className="text-gray-300">
                W &ge; kT ln 2 &middot; [H<sub>max</sub> - C<sub>state</sub>] + kT L&sup2;/(2&tau;)
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p className="mb-2">
                <strong className="text-blue-400">State credit</strong> (negentropy + correlations) reduces W<sub>rev</sub>.
              </p>
              <p>
                <strong className="text-purple-400">Protocol efficiency</strong> (thermodynamic length) reduces W<sub>irr</sub>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Try this section */}
      <div className="mt-6 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Try This</h3>
        <ul className="text-gray-400 text-sm space-y-2">
          <li>
            <strong className="text-white">Maximum credit:</strong> Set p = 0.1 (biased) and I = 0.47 (max for that H).
            Watch total work drop to ~17% of naive.
          </li>
          <li>
            <strong className="text-white">Fast vs slow:</strong> With p = 0.5, compare &tau; = 2 vs &tau; = 50.
            Short protocols waste energy on irreversible dissipation.
          </li>
          <li>
            <strong className="text-white">Geodesic advantage:</strong> With L = 1 (optimal) vs L = 5 (naive),
            see how poor protocols cost ~25&times; more W<sub>irr</sub>.
          </li>
        </ul>
      </div>
    </div>
  );
}
