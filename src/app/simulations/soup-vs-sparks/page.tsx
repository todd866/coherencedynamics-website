import Link from 'next/link';
import SoupVsSparks from '@/components/SoupVsSparks';

export default function SoupVsSparksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Soup vs Sparks</h1>
      <p className="text-gray-500 text-sm mb-6">
        Companion to{' '}
        <Link href="/blog/coherence-dynamics-circa-1890" className="text-blue-400 hover:text-blue-300">
          Coherence Dynamics Circa 1890
        </Link>
      </p>

      <div className="mb-8">
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-black p-4">
          <SoupVsSparks />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-cyan-400 mb-3">Left: The &ldquo;Soup&rdquo;</h3>
          <p className="text-gray-300 text-sm mb-3">
            Coupled oscillators (Kuramoto model). Each oscillator has its own natural frequency,
            but through coupling, they <strong className="text-white">spontaneously synchronize</strong>.
          </p>
          <p className="text-gray-400 text-sm">
            No central controller tells them what to do. The synchronization emerges from the
            physics of coupling. The high-dimensional dynamics are <em>native</em> to the substrate.
          </p>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-green-400 mb-3">Right: The &ldquo;Sparks&rdquo;</h3>
          <p className="text-gray-300 text-sm mb-3">
            Independent binary switches. Each cell flips randomly with no connection to its neighbors.
          </p>
          <p className="text-gray-400 text-sm">
            To achieve coordination, you&apos;d need an <strong className="text-white">external program</strong> that
            explicitly reads each cell, computes the desired state, and writes it back. The coordination
            must be <em>simulated</em>, not instantiated.
          </p>
        </div>
      </div>

      <div className="mt-6 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">The Key Difference</h3>
        <p className="text-gray-300 text-sm mb-3">
          <strong className="text-white">Increase coupling</strong> on the left and watch synchronization
          emerge. The oscillators find each other through physics&mdash;no step-by-step calculation required.
        </p>
        <p className="text-gray-400 text-sm">
          The &ldquo;sparks&rdquo; (right) could in principle be programmed to simulate the same pattern,
          but they would need to explicitly calculate each state transition. That&apos;s the difference
          between <em>faking</em> the manifold and <em>being</em> the manifold.
        </p>
      </div>

      <div className="mt-6 border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
        <h3 className="text-sm text-yellow-400 mb-2">Block&apos;s Question Answered</h3>
        <p className="text-gray-300 text-sm">
          Why did evolution favor the slow, messy &ldquo;soup&rdquo; over fast, reliable &ldquo;sparks&rdquo;?
          Because electrochemical systems provide a <strong className="text-white">high-dimensional
          manifold</strong> that can be steered. Electrical gap junctions are fast but offer limited
          controllability. Chemical synapses are slow but expose many tunable parameters&mdash;a
          rich control surface for navigating dynamical regimes.
        </p>
      </div>
    </div>
  );
}
