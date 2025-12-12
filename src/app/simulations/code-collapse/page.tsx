import Link from 'next/link';
import CodeForming from '@/components/CodeForming';

export default function CodeCollapsePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-4 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Code Formation</h1>
      <p className="text-gray-500 text-sm mb-4">
        How bandwidth-limited codes constrain downstream dynamics
      </p>

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
          <h3 className="text-sm text-gray-500 mb-2">Fourier Bandwidth Bottleneck</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">The code is a truncated Fourier representation.</strong>{' '}
            Only the lowest k frequency modes pass through. High-frequency structure in A
            is invisible to B. This is lossy compression&mdash;not noise, but structured filtering.
          </p>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Complexity Collapse</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Reducing k collapses B&apos;s complexity.</strong>{' '}
            A stays complex regardless of bandwidth. B&apos;s wave smooths out as k drops&mdash;it
            can only express what the code allows. The code constrains without enabling prediction.
          </p>
        </div>

        <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
          <h3 className="text-sm text-yellow-400 mb-2">Key Experiment</h3>
          <p className="text-gray-300 text-sm">
            Drag the slider from k=32 (full bandwidth) down to k=1. Watch B&apos;s wave collapse
            from jagged to smooth while A stays complex. This is how biology stabilizes
            organization: low-D codes constrain high-D dynamics.
          </p>
        </div>
      </div>
    </div>
  );
}
