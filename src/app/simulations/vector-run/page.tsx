import Link from 'next/link';

export default function VectorRunPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/simulations" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
        &larr; Back to Simulations
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-white">Vector Run: Ascension</h1>
      <p className="text-gray-500 text-sm mb-4">
        A dimensional rhythm game where you ascend from 0D to infinity through chromatic resonance.
      </p>

      {/* Desktop only warning */}
      <div className="border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-3 mb-6 md:hidden">
        <p className="text-yellow-400 text-sm">
          This game requires a keyboard and is designed for desktop browsers only.
        </p>
      </div>

      <div className="hidden md:block border border-yellow-700/50 bg-yellow-900/20 rounded-lg p-3 mb-6">
        <p className="text-yellow-400 text-sm">
          Desktop only. Requires keyboard for controls.
        </p>
      </div>

      {/* Game iframe */}
      <div className="border border-gray-800 rounded-lg overflow-hidden mb-6 bg-black">
        <iframe
          src="/vector-run/index.html"
          className="w-full"
          style={{ height: '680px' }}
          title="Vector Run: Ascension"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Controls</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Cycle Color</span>
              <span className="text-white font-mono">Q / E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Move (2D+)</span>
              <span className="text-white font-mono">Arrow Keys</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rotate (3D)</span>
              <span className="text-white font-mono">A / D</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Scale (4D)</span>
              <span className="text-white font-mono">W / S</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Start / Phase</span>
              <span className="text-white font-mono">Space</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">The Resonance System</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              <span className="text-white">White</span> &mdash; Universal harmony. Heals, matches everything.
            </p>
            <p>
              <span className="text-red-400">R</span><span className="text-green-400">G</span><span className="text-blue-400">B</span> &mdash; Matter. Match to maintain. Mismatch drains saturation.
            </p>
            <p>
              <span className="text-gray-600">Black</span> &mdash; Entropy. Cannot match. Instant dimensional drop.
            </p>
          </div>
        </div>

        <div className="border border-gray-800 rounded-lg p-4 md:col-span-2">
          <h3 className="text-sm text-gray-500 mb-3">Dimensions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-cyan-400">0D</span>
              <span className="text-gray-400"> &mdash; The Pulse</span>
              <p className="text-gray-500 text-xs mt-1">Sync colors on beat</p>
            </div>
            <div>
              <span className="text-cyan-400">1D</span>
              <span className="text-gray-400"> &mdash; The Collision</span>
              <p className="text-gray-500 text-xs mt-1">Match before impact</p>
            </div>
            <div>
              <span className="text-cyan-400">2D</span>
              <span className="text-gray-400"> &mdash; The Weaver</span>
              <p className="text-gray-500 text-xs mt-1">Navigate + match zones</p>
            </div>
            <div>
              <span className="text-cyan-400">3D</span>
              <span className="text-gray-400"> &mdash; The Tumble</span>
              <p className="text-gray-500 text-xs mt-1">Rotate through tunnel</p>
            </div>
            <div>
              <span className="text-cyan-400">4D</span>
              <span className="text-gray-400"> &mdash; Hyper-Tunnel</span>
              <p className="text-gray-500 text-xs mt-1">Expand into 4th dimension</p>
            </div>
            <div>
              <span className="text-cyan-400">5D</span>
              <span className="text-gray-400"> &mdash; The Cloud</span>
              <p className="text-gray-500 text-xs mt-1">Color, shape, density</p>
            </div>
            <div>
              <span className="text-cyan-400">&infin;D</span>
              <span className="text-gray-400"> &mdash; The Stillness</span>
              <p className="text-gray-500 text-xs mt-1">Let go</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
