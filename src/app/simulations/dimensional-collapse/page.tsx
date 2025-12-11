import Link from 'next/link';
import TesseractHero from '@/components/TesseractHero';

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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">4D Tesseract Shadow</h1>
          <p className="text-gray-500 text-sm">
            Companion to{' '}
            <Link href="/papers/high-dimensional-coherence" className="text-blue-400 hover:text-blue-300">
              High-Dimensional Coherence
            </Link>
          </p>
        </div>

        <TesseractHero className="rounded-xl shadow-2xl" />

        {/* Info cards below */}
        <div className="max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-cyan-400 mb-2">What You&apos;re Seeing</h3>
            <p className="text-gray-400 text-sm">
              A true 4D hypercube projected to your screen. The orange &quot;W edges&quot; connect
              identical points at different positions in the 4th dimension.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-cyan-400 mb-2">Inner vs Outer</h3>
            <p className="text-gray-400 text-sm">
              Cyan vertices are &quot;in front&quot; in 4D (w=+1). Magenta are &quot;behind&quot; (w=-1).
              They&apos;re the same size—the difference is dimensional perspective.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-yellow-400 mb-2">Key Insight</h3>
            <p className="text-gray-400 text-sm">
              The tesseract isn&apos;t morphing—it&apos;s rigid in 4D. What you see as deformation
              is your observation collapsing 4D structure into 3D.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
