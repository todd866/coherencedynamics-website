import Link from 'next/link';
import ObserverDemo from '@/components/ObserverDemo';

export default function DimensionalCollapsePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">4D Tesseract Shadow</h1>
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
            <ObserverDemo fullPage />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>XW Rotation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>YW Rotation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>ZW Rotation</span>
            </div>
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">What You&apos;re Seeing</h3>
            <p className="text-gray-300 text-sm mb-3">
              A <strong className="text-white">true 4-dimensional hypercube</strong> (tesseract)
              projected down to your 2D screen. The 3D shape you see is a &quot;shadow&quot; of a
              4D object&mdash;just as a 2D shadow of a 3D cube is a flat hexagon.
            </p>
            <p className="text-gray-400 text-sm">
              The tesseract has 16 vertices (all combinations of &plusmn;1 in 4 dimensions)
              and 32 edges. What looks like distortion is actually a faithful projection
              of a perfectly regular structure.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Physics</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">Dimensional collapse</strong> is what happens when you
              measure a high-dimensional system. You pick which dimensions to record, and the rest
              is lost. The projection is the measurement.
            </p>
            <p className="text-gray-400 text-sm">
              The three sine waves control rotation through the 4th dimension (XW, YW, ZW planes).
              This &quot;noise&quot; in 4D space manifests as apparent shape changes in the 3D
              shadow&mdash;the same information, viewed from different angles.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Try This</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <strong className="text-white">Drag the waves:</strong> Pull up/down on any wave
                to change its amplitude. Higher amplitude = faster rotation through that 4D plane.
              </li>
              <li>
                <strong className="text-white">Zero all rotations:</strong> Drag all waves to the
                center line. The tesseract &quot;stops&quot;&mdash;you see a static 3D projection.
              </li>
              <li>
                <strong className="text-white">Max one axis:</strong> Drag one wave high, others zero.
                Watch the tesseract rotate purely in one 4D plane.
              </li>
            </ul>
          </div>

          <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm text-yellow-400 mb-2">Key Insight</h3>
            <p className="text-gray-300 text-sm">
              The 3D shape isn&apos;t &quot;morphing&quot;&mdash;the 4D tesseract is perfectly rigid.
              What you see as deformation is your measurement apparatus (the projection) collapsing
              4D structure into 3D. The information isn&apos;t lost in the object; it&apos;s lost
              in the observation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
