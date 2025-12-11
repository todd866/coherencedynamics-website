import Link from 'next/link';
import InteractionEngine from '@/components/InteractionEngine';

export default function InteractionEnginePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Interaction Engine</h1>
      <p className="text-gray-500 text-sm mb-6">
        High-dimensional systems communicating through low-dimensional code
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4 bg-slate-950 p-4">
            <InteractionEngine />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
              <span>Sender System</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Code (positive)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
              <span>Code (negative) / Receiver</span>
            </div>
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Core Insight</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">Complex systems cannot directly access each other&apos;s internal states.</strong>{' '}
              They can only communicate through a low-dimensional interface.
            </p>
            <p className="text-gray-400 text-sm">
              The sender&apos;s high-dimensional dynamics are sampled and quantized into discrete symbols.
              The receiver reconstructs meaning from these symbols&mdash;but never sees the original dynamics.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Bottleneck Creates Code</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">Watch the center channel.</strong> Continuous motion on the left
              becomes discrete symbols (0, 1, A, T) that traverse the gap.
            </p>
            <p className="text-gray-400 text-sm">
              The &quot;bandwidth&quot; slider controls how much of the sender&apos;s state can pass through.
              Narrow bandwidth = more aggressive quantization = more discrete code.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Controls</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <strong className="text-white">System Types:</strong> Choose different dynamical systems
                for sender and receiver. Lorenz (chaos), Neural (network), Harmonic (wave).
              </li>
              <li>
                <strong className="text-white">Bandwidth:</strong> How much information can pass through
                the bottleneck. Lower = more quantization.
              </li>
              <li>
                <strong className="text-white">Mouse:</strong> Drag on the left side to perturb the
                sender system and watch the code change.
              </li>
            </ul>
          </div>

          <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm text-yellow-400 mb-2">Key Experiment</h3>
            <p className="text-gray-300 text-sm">
              Set both systems to &quot;Neural&quot; and reduce bandwidth to minimum. Perturb the left system
              and watch how the right system&apos;s response is delayed and discretized&mdash;it only reacts
              when a code packet arrives, not to your continuous motion.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Biological Parallels</h3>
            <p className="text-gray-400 text-sm">
              <strong className="text-white">Neurons:</strong> Continuous membrane dynamics &rarr; discrete action potentials &rarr; postsynaptic response.<br/>
              <strong className="text-white">Cells:</strong> Internal metabolism &rarr; signaling molecules &rarr; receptor activation.<br/>
              <strong className="text-white">Organisms:</strong> Thoughts &rarr; language &rarr; understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
