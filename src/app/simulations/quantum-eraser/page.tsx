import Link from 'next/link';
import QuantumEraserDemo from '@/components/QuantumEraserDemo';

export default function QuantumEraserPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Back link */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/simulations" className="text-gray-500 hover:text-white text-sm">
          &larr; Back to Simulations
        </Link>
      </div>

      {/* Main visualization */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Delayed-Choice Quantum Eraser</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            The past wasn&apos;t changed. You just chose which slice of the data to look at.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Companion to{' '}
            <Link href="/blog/quantum-mechanics-without-math" className="text-blue-400 hover:text-blue-300">
              Quantum Mechanics Without the Math
            </Link>
          </p>
        </div>

        <QuantumEraserDemo className="max-w-2xl w-full" />

        {/* Info cards below */}
        <div className="max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-cyan-400 mb-2">The Setup</h3>
            <p className="text-gray-400 text-sm">
              Entangled photon pairs. Signal hits the screen first. Idler measured later.
              Four detectors: D1/D2 erase which-path info, D3/D4 preserve it.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-orange-400 mb-2">The &quot;Paradox&quot;</h3>
            <p className="text-gray-400 text-sm">
              Sorting by D1 shows fringes. Sorting by D3 shows blobs.
              Did the later measurement change what the earlier photon did?
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-green-400 mb-2">The Resolution</h3>
            <p className="text-gray-400 text-sm">
              No. The raw data never changes. You&apos;re postselecting—choosing which
              correlated subset to examine. The patterns were always in the joint state.
            </p>
          </div>
        </div>

        {/* Additional explanation */}
        <div className="max-w-2xl mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Notice: D1+D2 together shows no pattern (fringes and anti-fringes cancel).
            This is why you can&apos;t send information backward in time—the unconditional
            signal data contains no trace of the idler measurement choice.
          </p>
        </div>
      </div>
    </div>
  );
}
