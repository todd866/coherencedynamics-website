import Link from 'next/link';
import CodeCollapse from '@/components/CodeCollapse';

export default function CodeCollapsePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Dimensional Collapse → Code</h1>
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
              <span>Spatial (3D/4D)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Linear (2D Code)</span>
            </div>
          </div>
        </div>

        {/* Info panel - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">The Core Idea</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">Code is a 2D slice of higher-dimensional thought.</strong> What
              you see as &quot;lines of code&quot; is a projection&mdash;a lossy compression of a much richer
              geometric structure.
            </p>
            <p className="text-gray-400 text-sm">
              The 4D tesseract represents the full &quot;idea space.&quot; As you collapse dimensions,
              the chaotic cloud of symbols organizes into the flat, linear format we call &quot;syntax.&quot;
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">What the Slider Does</h3>
            <p className="text-gray-300 text-sm mb-3">
              <strong className="text-white">0% (Left):</strong> Full spatial representation. The characters
              float in a 3D cloud, rotating through 4D space. This is the &quot;uncollapsed&quot; thought.
            </p>
            <p className="text-gray-400 text-sm mb-3">
              <strong className="text-white">100% (Right):</strong> Full dimensional collapse. The Z-axis
              vanishes. The Y-axis snaps to discrete rows. The X-axis quantizes to character positions.
              The mess becomes syntax.
            </p>
            <p className="text-gray-400 text-sm">
              Watch the characters literally &quot;fall into lines&quot; as you slide right.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-3">Try This</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <strong className="text-white">Slow collapse:</strong> Drag the slider slowly from left
                to right. Watch the transition from &quot;cloud&quot; to &quot;code.&quot;
              </li>
              <li>
                <strong className="text-white">Rotate while collapsed:</strong> At 100%, drag the
                visualization. Notice how the &quot;code&quot; distorts&mdash;the hidden dimensions are
                still there.
              </li>
              <li>
                <strong className="text-white">Snap back:</strong> Pull the slider to 0% and watch the
                orderly rows explode back into chaotic geometry.
              </li>
            </ul>
          </div>

          <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm text-yellow-400 mb-2">Key Insight</h3>
            <p className="text-gray-300 text-sm">
              The information isn&apos;t &quot;created&quot; when you write code&mdash;it&apos;s
              <em> projected</em>. The 4D tesseract is rigid. The apparent simplicity of linear code is
              an artifact of the projection, not a property of the underlying structure. Programming is
              dimensional collapse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
