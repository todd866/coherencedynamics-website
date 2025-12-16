import Link from 'next/link';
import EmbeddingDimensionDemo from '@/components/EmbeddingDimensionDemo';

export default function DimensionalCollapsePage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Minimal Embedding Dimension</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Phase-preserving embeddings of cyclic processes require k ≥ 3 to remain temporally distinct.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Implements{' '}
            <Link href="/papers/minimal-embedding" className="text-blue-400 hover:text-blue-300">
              Theorem 10
            </Link>
            : k = 2 collapses meta-time; k = 3 separates it.
          </p>
        </div>

        <EmbeddingDimensionDemo className="max-w-4xl" />

        {/* Info cards below */}
        <div className="max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-cyan-400 mb-2">The Obstruction</h3>
            <p className="text-gray-400 text-sm">
              In 2D, phase-preserving maps force cyclic trajectories onto a circle.
              Different cycles must overlap—collisions are geometrically unavoidable.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-cyan-400 mb-2">Why Not Spiral?</h3>
            <p className="text-gray-400 text-sm">
              Spirals avoid collisions by encoding time in radius. But this violates
              bounded recurrence—the system drifts rather than cycles. Toggle to see.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-yellow-400 mb-2">Key Insight</h3>
            <p className="text-gray-400 text-sm">
              When k &lt; 3, systems cannot distinguish <em>when</em>, only <em>what</em>.
              This forces categorical representations—continuous dynamics become discrete symbols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
