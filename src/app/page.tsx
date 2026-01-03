import Link from 'next/link';
import BitsVsDynamics from '@/components/BitsVsDynamics';
import TesseractSimple from '@/components/TesseractSimple';
import CodeForming from '@/components/CodeForming';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero text */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white">
          Coherence Dynamics
        </h1>
        <p className="text-2xl text-gray-300 mb-4 font-light">
          Measurement is dimensional collapse.
        </p>
        <p className="text-2xl text-gray-500 mb-6 font-light">
          High-dimensional systems resist it.
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
          Research on dimensionality: the effective degrees of freedom of accessible dynamics.
          Why living systems do things digital computers cannot, and what that means for
          computation, measurement, and the limits of knowledge.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/framework"
            className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            The Framework
          </Link>
          <Link
            href="/papers"
            className="inline-flex items-center px-6 py-3 border border-gray-700 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            Read the Research
          </Link>
          <Link
            href="/simulations"
            className="inline-flex items-center px-6 py-3 border border-gray-700 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            Try the Simulations
          </Link>
        </div>
      </section>

      {/* Interactive visualization - Bits vs Dynamics (InteractiveHero) */}
      <section className="mb-20 flex justify-center">
        <BitsVsDynamics />
      </section>

      {/* Why Coherence Dynamics - with TesseractHero */}
      <section className="mb-20 py-12 border-y border-gray-800">
        <h2 className="text-2xl font-bold mb-8 text-white">Dimensionality is Real</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              A protein folding, a neuron firing, an embryo developing—these are high-dimensional
              systems. When you measure them, you collapse that dimensionality into bits. You pick
              which dimensions to record, and you lose everything else.
            </p>
            <p className="text-gray-300 leading-relaxed">
              But the original system wasn&apos;t made of bits. It was <em>coherent</em>: all its
              degrees of freedom moved together, coupled by physics, constrained by thermodynamics.
              The dimensionality was real. The measurement destroyed it.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This matters because digital computers pay energy costs <em>per bit</em>, at every
              clock cycle. Coherent systems pay energy costs <em>per dimension</em>, deferred until
              they hit a boundary. That&apos;s the difference between O(n) and O(1) scaling—and it
              explains why biology can do things silicon cannot.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <TesseractSimple className="rounded-xl w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* Code Formation - with CodeCollapse */}
      <section className="mb-20 py-12 border-y border-gray-800">
        <h2 className="text-2xl font-bold mb-8 text-white">Dimensional Collapse Creates Code</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex items-center justify-center order-2 md:order-1">
            <CodeForming />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <p className="text-gray-300 leading-relaxed">
              DNA, proteins, neural signals—all are low-dimensional codes that represent
              high-dimensional physical processes. Biology is the study of how these codes form.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Codes emerge from dimensional collapse. The high-dimensional state of a
              neural population becomes a discrete spike train. The continuous molecular
              dynamics of a cell become a sequence of gene expression states. Measurement creates the code.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This isn&apos;t information loss—it&apos;s <em>information creation</em>. The code
              carries meaning precisely because it discards the high-dimensional details.
              Tap the visualization to induce 4D rotation, then slide to collapse dimensions
              and watch code form from chaos.
            </p>
          </div>
        </div>
      </section>

      {/* Featured sections */}
      <section className="grid md:grid-cols-3 gap-8 mb-20">
        <Link href="/framework" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
          <h2 className="text-lg font-semibold mb-3 text-white">Framework</h2>
          <p className="text-gray-400 mb-4">
            The theoretical foundation. Dimensionality, measurement collapse, and the gap
            between total and accessible degrees of freedom.
          </p>
          <span className="text-sm font-medium text-gray-300">
            Learn the concepts &rarr;
          </span>
        </Link>

        <Link href="/papers" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
          <h2 className="text-lg font-semibold mb-3 text-white">Research Papers</h2>
          <p className="text-gray-400 mb-4">
            Formal development across neuroscience, biology, physics, and philosophy.
            2 published, 7 under review.
          </p>
          <span className="text-sm font-medium text-gray-300">
            View all papers &rarr;
          </span>
        </Link>

        <Link href="/simulations" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
          <h2 className="text-lg font-semibold text-white mb-3">Interactive Simulations</h2>
          <p className="text-gray-400 mb-4">
            Play with the ideas. Explore coherence dynamics, dimensional collapse,
            and information costs.
          </p>
          <span className="text-sm font-medium text-gray-300">
            Explore simulations &rarr;
          </span>
        </Link>
      </section>

      {/* Recent/Featured papers */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8 text-white">Featured Research</h2>
        <div className="space-y-6">
          <Link href="/papers/falsifiability" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-green-900 text-green-300 rounded">
                Published
              </span>
              <span className="text-sm text-gray-500">BioSystems</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              The Limits of Falsifiability
            </h3>
            <p className="text-gray-400">
              Dimensionality, measurement thresholds, and the sub-Landauer domain in biological systems.
            </p>
          </Link>

          <Link href="/papers/timing-inaccessibility" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-green-900 text-green-300 rounded">
                Published
              </span>
              <span className="text-sm text-gray-500">BioSystems</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Timing Inaccessibility and the Projection Bound
            </h3>
            <p className="text-gray-400">
              Resolving Maxwell&apos;s Demon for continuous biological substrates.
            </p>
          </Link>

          <Link href="/papers/minimal-embedding" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-blue-900 text-blue-300 rounded">
                Under Review
              </span>
              <span className="text-sm text-gray-500">Information Geometry</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Minimal Embedding Dimension for Recurrent Processes
            </h3>
            <p className="text-gray-400">
              Why you need at least 3 dimensions for continuous cyclic dynamics—below that, trajectories collide.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
        <p>Coherence Dynamics Australia Pty Ltd &bull; Sydney, Australia</p>
      </footer>
    </div>
  );
}
