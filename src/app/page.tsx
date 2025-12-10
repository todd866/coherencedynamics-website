import Link from 'next/link';
import InteractiveHero from '@/components/InteractiveHero';
import ObserverDemo from '@/components/ObserverDemo';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero with interactive visualization */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
          {/* Left: Text content */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white">
              Coherence Dynamics
            </h1>
            <p className="text-2xl text-gray-300 mb-4 font-light">
              High-dimensional systems are coherent systems.
            </p>
            <p className="text-2xl text-gray-500 mb-6 font-light">
              Bits are incoherent.
            </p>
            <p className="text-lg text-gray-400 mb-6">
              Research exploring the physics of biological organization—why living systems
              can do things digital computers cannot, and what that means for computation,
              measurement, and the limits of knowledge.
            </p>
            <div className="flex gap-4">
              <Link
                href="/papers"
                className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
          </div>

          {/* Right: Interactive visualization */}
          <div className="flex justify-end">
            <InteractiveHero />
          </div>
        </div>
      </section>

      {/* Why Coherence Dynamics */}
      <section className="mb-20 py-12 border-y border-gray-800">
        <h2 className="text-2xl font-bold mb-8 text-white">Why &quot;Coherence Dynamics&quot;?</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              When you measure a high-dimensional system—a protein folding, a neuron firing,
              an embryo developing—you collapse it into bits. You pick which dimensions to record,
              and you lose everything else.
            </p>
            <p className="text-gray-300 leading-relaxed">
              But the original system wasn&apos;t made of bits. It was <em>coherent</em>: all its
              dimensions moved together, coupled by physics, constrained by thermodynamics.
              The measurement broke that coherence.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This has consequences. Digital computers pay energy costs <em>per bit</em>,
              at every clock cycle. Biological systems pay energy costs <em>per dimension</em>,
              deferred until the system reaches a boundary. That&apos;s not a small difference—it&apos;s
              the difference between O(n) and O(1) scaling.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <ObserverDemo />
          </div>
        </div>
      </section>

      {/* Featured sections */}
      <section className="grid md:grid-cols-3 gap-8 mb-20">
        <Link href="/papers" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
          <h2 className="text-lg font-semibold mb-3 text-white">Research Papers</h2>
          <p className="text-gray-400 mb-4">
            17 papers spanning biological physics, information theory, and computational limits.
            2 published, 11 under review.
          </p>
          <span className="text-sm font-medium text-gray-300">
            View all papers &rarr;
          </span>
        </Link>

        <Link href="/simulations" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-white">Interactive Simulations</h2>
            <span className="text-xs px-2 py-0.5 bg-amber-900/50 text-amber-400 rounded">Early Alpha</span>
          </div>
          <p className="text-gray-400 mb-4">
            Play with the ideas. Simulations that let you explore coherence dynamics,
            nonergodic development, and clinical decision-making.
          </p>
          <span className="text-sm font-medium text-gray-300">
            Explore simulations &rarr;
          </span>
        </Link>

        <Link href="/about" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
          <h2 className="text-lg font-semibold mb-3 text-white">Core Ideas</h2>
          <p className="text-gray-400 mb-4">
            High-dimensional systems, dimensional collapse, coherence gates,
            and the physics of biological organization.
          </p>
          <span className="text-sm font-medium text-gray-300">
            Learn more &rarr;
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

          <Link href="/papers/lsd-dimensionality" className="block p-6 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-yellow-900 text-yellow-300 rounded">
                Under Review
              </span>
              <span className="text-sm text-gray-500">Nature Communications</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Psychedelics as Dimensionality Modulators
            </h3>
            <p className="text-gray-400">
              A cortical reservoir theory of serotonergic plasticity—why psychedelics expand neural dimensionality.
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
