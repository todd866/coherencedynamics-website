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
        How dimensional collapse creates discrete symbols from continuous dynamics
      </p>

      {/* Full-width visualization */}
      <div className="border border-gray-800 rounded-lg overflow-hidden mb-6 bg-black">
        <CodeForming fullPage />
      </div>

      {/* Info panels below */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">The Dzhanibekov Effect</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Asymmetric objects flip spontaneously.</strong>{' '}
            A wrench spinning in space will periodically reverse its orientation&mdash;intermediate
            axes of rotation are unstable. In 4D, there are more axes to be unstable around.
          </p>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Symbolic Attractors</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Basin depth determines stability.</strong>{' '}
            Symmetric shapes (tesseract) cycle freely through bases. Asymmetric shapes (4D wrench)
            lock onto single symbols. The attractor landscape emerges from geometry.
          </p>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Bidirectional Coupling</h3>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Code constrains dynamics.</strong>{' '}
            As observation collapses toward 2D, the symbolic attractor pulls back on the rotation.
            The code isn&apos;t just a readout&mdash;it actively shapes what states are accessible.
          </p>
        </div>

        <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
          <h3 className="text-sm text-yellow-400 mb-2">Key Experiment</h3>
          <p className="text-gray-300 text-sm">
            Select <strong>4D Wrench</strong>, set basin depth to maximum, and collapse to 2D.
            The asymmetric moments of inertia create a deep attractor&mdash;the system locks
            onto a single base and resists perturbation.
          </p>
        </div>
      </div>
    </div>
  );
}
