import Link from 'next/link';
import CodeCollapse from '@/components/CodeCollapse';

export default function CodeCollapsePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Observer Window</h1>
      <p className="text-gray-500 text-sm mb-6">
        Companion to{' '}
        <Link href="/papers/high-dimensional-coherence" className="text-blue-400 hover:text-blue-300">
          High-Dimensional Coherence
        </Link>
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4 bg-black">
            <CodeCollapse fullPage />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>4D Chaos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>3D Shadow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>2D Code</span>
            </div>
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Core Insight</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">You&apos;re not collapsing the object&mdash;you&apos;re collapsing the observer.</strong>{' '}
              The 4D structure exists unchanged. What varies is the dimensionality of your observation window.
            </p>
            <p className="text-gray-400 text-sm">
              As your perceptual apparatus narrows from 4D to 2D, chaotic geometry is forced to
              &quot;quantize&quot; into discrete grid positions. The code that emerges isn&apos;t
              created&mdash;it&apos;s what high-dimensional structure looks like through a low-dimensional lens.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Meaning From the Unseen</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">The W-coordinate determines the character.</strong> Each symbol
              you see is selected based on its position in the 4th dimension&mdash;a coordinate you
              cannot directly observe.
            </p>
            <p className="text-gray-400 text-sm">
              This demonstrates that the &quot;meaning&quot; of collapsed representations comes from
              dimensions that are hidden from view. The syntax encodes information from spaces you
              can&apos;t access.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Controls</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <strong className="text-white">Topology:</strong> Switch between 4D polytopes&mdash;Tesseract,
                5-Cell (simplex), 16-Cell (cross-polytope), 24-Cell (unique to 4D), and Glome (hypersphere).
              </li>
              <li>
                <strong className="text-white">Rotation Injection:</strong> Set velocity for each of the 6
                rotation planes. Center = stopped, left = reverse, right = forward.
              </li>
              <li>
                <strong className="text-white">Observation Dimensionality:</strong> Slide from 4D (chaos)
                to 2D (code). Watch the non-linear snap&mdash;it resists, then suddenly crystallizes.
              </li>
            </ul>
          </div>

          <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm text-yellow-400 mb-2">Key Experiment</h3>
            <p className="text-gray-300 text-sm">
              Set observation to 2D (full code), then slowly rotate using the XW or YW sliders. Watch
              the &quot;code&quot; shift&mdash;the same structure produces different syntax depending on
              viewing angle. The representation is a projection, not the thing itself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
