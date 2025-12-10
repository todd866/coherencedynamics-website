import Link from 'next/link';
import DimensionalCostDemo from '@/components/DimensionalCostDemo';

export default function CurvatureCostPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">The Cost of Curvature</h1>
      <p className="text-gray-500 text-sm mb-6">
        Companion to{' '}
        <Link href="/papers/dimensional-landauer" className="text-blue-400 hover:text-blue-300">
          Dimensional Landauer Bound
        </Link>
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Visualization - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4 bg-slate-900">
            <DimensionalCostDemo />
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Physics</h3>
            <p className="text-gray-300 text-sm mb-3">
              Particles undergo <strong className="text-white">2D Brownian motion</strong> but are
              constrained to a <strong className="text-white">1D manifold</strong> (the white curve).
              This is dimensional reduction in action&mdash;projecting high-dimensional dynamics
              onto a lower-dimensional representation.
            </p>
            <p className="text-gray-400 text-sm">
              The <strong className="text-white">control force</strong> required to keep particles
              on the manifold depends on the manifold&apos;s curvature. Higher curvature = more
              force = more heat dissipated.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Dimensional Landauer Bound</h3>
            <p className="text-gray-300 text-sm mb-3">
              Standard Landauer says erasing a bit costs <strong className="text-white">kT ln 2</strong>.
              But there&apos;s a second cost: the <strong className="text-white">geometric contraction cost</strong>
              of projecting dynamics onto a lower-dimensional manifold.
            </p>
            <p className="text-gray-400 text-sm font-mono">
              W = kT ln 2 &times; bits + kT &times; C<sub>&Phi;</sub>
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Try This</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <strong className="text-white">Straight manifold:</strong> Drag to the left edge.
                Particles flow smoothly with minimal dissipation (green status).
              </li>
              <li>
                <strong className="text-white">Curved manifold:</strong> Drag to the right edge.
                Watch particles heat up (turn red) as control forces fight to keep them on track.
              </li>
              <li>
                <strong className="text-white">Release:</strong> The manifold relaxes back to flat.
                Dissipation drops. This is why biology favours coherent, low-curvature dynamics.
              </li>
            </ul>
          </div>

          <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm text-yellow-400 mb-2">Key Insight</h3>
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Curvature = Heat.</strong> When you bend a manifold,
              you&apos;re not just changing coordinates&mdash;you&apos;re increasing the thermodynamic
              cost of maintaining that representation against thermal noise. This explains why
              neural systems use oscillatory synchronization: coherent dynamics naturally flatten
              the effective manifold, reducing dissipation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
