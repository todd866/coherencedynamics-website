import Link from 'next/link';
import InteractiveHero from '@/components/InteractiveHero';

export default function BitsVsDynamicsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Bits vs Dynamics</h1>
      <p className="text-gray-500 text-sm mb-6">
        Companion to{' '}
        <Link href="/papers/dimensional-landauer" className="text-blue-400 hover:text-blue-300">
          Dimensional Landauer Bound
        </Link>
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4 bg-black">
            <InteractiveHero />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Left: Billiard balls (bits)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span>Right: Lorenz attractor (dynamics)</span>
            </div>
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Two Kinds of Systems</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">Left: Bits</strong>&mdash;Billiard balls that interact
              locally, lose energy at every collision, and eventually stop. Each ball has a precise
              position you can measure without changing anything fundamental.
            </p>
            <p className="text-gray-400 text-sm">
              <strong className="text-white">Right: Dynamics</strong>&mdash;A Lorenz attractor where
              every point affects every other point. The system never settles into a repeating pattern,
              yet it stays bounded. Structure without bits.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Energy Difference</h3>
            <p className="text-gray-300 text-sm mb-3">
              Digital computers pay <strong className="text-white">kT ln 2 per bit, per clock cycle</strong>.
              That&apos;s Landauer&apos;s bound&mdash;the thermodynamic cost of erasing information.
            </p>
            <p className="text-gray-400 text-sm">
              Biological systems pay <strong className="text-white">per dimension, deferred until commitment</strong>.
              A protein exploring 10,000 conformations doesn&apos;t pay energy for each one&mdash;it pays
              once, when it folds.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Try This</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <strong className="text-white">Left panel:</strong> Click to spawn new balls.
                Drag the spacetime warp slider to bend the table. Watch collisions dissipate energy.
              </li>
              <li>
                <strong className="text-white">Right panel:</strong> Click and hold to create a
                measurement constraint. Watch the attractor respond&mdash;not by stopping, but by
                reorganizing around your probe.
              </li>
              <li>
                <strong className="text-white">Compare:</strong> The billiard balls run out of
                energy. The attractor never does. Same fundamental physics, different organization.
              </li>
            </ul>
          </div>

          <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm text-yellow-400 mb-2">Key Insight</h3>
            <p className="text-gray-300 text-sm">
              The difference isn&apos;t complexity&mdash;it&apos;s <em>coherence</em>. Bits are independent
              by design (that&apos;s what makes them addressable). Dynamics are coupled by physics
              (that&apos;s what makes them efficient). You can&apos;t have both. You have to choose
              your trade-off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
