import Link from 'next/link';
import CodeForming from '@/components/CodeForming';

export default function CodeCollapsePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-4 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Code Constraint</h1>
      <p className="text-gray-500 text-sm mb-4">
        Low-dimensional codes constrain high-dimensional dynamics
      </p>

      {/* Links to paper resources */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm">
        <Link
          href="/papers/code-constraint"
          className="px-3 py-1.5 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
        >
          Paper Overview
        </Link>
        <Link
          href="/papers/code-constraint/full"
          className="px-3 py-1.5 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
        >
          Paper Summary (HTML)
        </Link>
        <a
          href="https://github.com/todd866/code-constraint"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
        >
          GitHub Repository ↗
        </a>
        <a
          href="https://github.com/todd866/code-constraint/blob/main/code_formation.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 border border-blue-700/50 bg-blue-900/20 rounded-lg text-blue-300 hover:text-blue-200 hover:border-blue-600 transition-colors"
        >
          PDF ↗
        </a>
      </div>

      {/* Full-width visualization */}
      <div className="border border-gray-800 rounded-lg overflow-hidden mb-6 bg-black">
        <CodeForming fullPage />
      </div>

      {/* Info panels below */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Two Coupled Systems</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">System A drives System B through a code.</strong>{' '}
            Both are Kuramoto oscillator lattices with nearest-neighbor coupling. A runs freely
            with noise; B tracks A but only sees what passes through the bandwidth bottleneck.
          </p>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Structured vs Unstructured</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Toggle Fourier vs Random projection.</strong>{' '}
            Fourier modes (low-frequency) cause N_eff collapse. Random projections cause
            whitening&mdash;B stays high-dimensional but loses structure. This is the key finding.
          </p>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">N_eff Collapse</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Watch N_eff (effective dimensionality).</strong>{' '}
            A&apos;s N_eff stays high (~17). B&apos;s N_eff collapses as k drops with Fourier,
            but stays high with random projection. Biology uses structured constraints.
          </p>
        </div>

        <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
          <h3 className="text-sm text-yellow-400 mb-2">Key Experiment</h3>
          <p className="text-gray-300 text-sm">
            1. Drag slider from k=32 to k=4 (Fourier)&mdash;watch B collapse.
            2. Click toggle to Random&mdash;B stays complex but uncorrelated.
            The constraint must match the structure to constrain without destroying.
          </p>
        </div>
      </div>
    </div>
  );
}
