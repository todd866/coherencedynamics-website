export default function FrameworkPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-4 text-white">Framework</h1>
      <p className="text-xl text-gray-400 mb-12">
        The theoretical foundation of this research program
      </p>

      {/* The Big Picture */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-8 mb-8">
          <p className="text-xl text-gray-300 mb-6">
            The first digital revolution was the idea that things can have <strong className="text-white">information</strong> that&apos;s
            abstracted from the thing itself.
          </p>
          <p className="text-xl text-gray-300">
            The next revolution is the idea that systems can have <strong className="text-white">dimensionality</strong> that&apos;s
            abstracted from the system itself.
          </p>
        </div>
        <p className="text-gray-400">
          Shannon showed that information exists independent of what the message means or what carries it.
          That abstraction enabled digital computing—you can manipulate information without caring about
          the physical substrate.
        </p>
        <p className="text-gray-400 mt-4">
          Dimensionality is the next abstraction. It exists independent of what space the system lives in
          or what implements it. And it explains why digital computing has limits: dimensionality is what
          gets lost when you project to bits, and you can&apos;t get it back without paying thermodynamic costs.
        </p>
      </section>

      {/* Core Concept */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">What is Dimensionality?</h2>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <p className="text-gray-300 text-lg">
            <strong className="text-white">Dimensionality</strong> means the effective degrees of freedom
            of accessible dynamics—not geometric embedding dimension.
          </p>
          <p className="text-gray-400 mt-4">
            This is the ML/complex-systems usage: participation ratio, effective rank of covariance spectra,
            intrinsic dimensionality of data manifolds. The measure of how many independent directions
            the system can actually explore.
          </p>
        </div>

        <div className="space-y-6 text-gray-300">
          <p>
            The entire research program lives in the gap between:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
            <li><strong className="text-gray-300">Total degrees of freedom</strong> — everything physically present in the system</li>
            <li><strong className="text-gray-300">Coherently accessible degrees of freedom</strong> — what can move together as a usable manifold</li>
          </ul>
          <p>
            High-dimensional systems are hard to control, resist compression, admit many orthogonal
            trajectories, and generate undecidable behavior. These are exactly the properties we study.
          </p>
        </div>
      </section>

      {/* Key Insight */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">Measurement is Dimensional Collapse</h2>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <p className="text-gray-300 text-lg">
            Every measurement projects a high-dimensional state onto a low-dimensional readout.
            The act of observing <em>is</em> dimensional reduction.
          </p>
        </div>

        <div className="space-y-4 text-gray-300">
          <p>
            This isn&apos;t a metaphor. When you measure a neural population with an electrode,
            you&apos;re projecting a million-dimensional dynamical system onto a handful of voltage traces.
            When you evaluate an AI system with a benchmark, you&apos;re projecting its full behavioral
            manifold onto a scalar score. When a cell reads out its environment through receptors,
            it&apos;s projecting the chemical state of the universe onto a finite set of binding events.
          </p>
          <p>
            The projection has costs. Information is lost. Distinctions that matter in the high-dimensional
            space become invisible in the low-dimensional readout. This is where most of the interesting
            phenomena come from.
          </p>
        </div>
      </section>

      {/* Distinction */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">Dimensionality ≠ Entropy</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Entropy</h3>
            <p className="text-gray-400">
              Counts compatible microstates. How many configurations are consistent with a given
              macroscopic description.
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Dimensionality</h3>
            <p className="text-gray-400">
              Counts what can move together coherently. How many degrees of freedom remain accessible
              under the current constraints.
            </p>
          </div>
        </div>

        <p className="text-gray-300">
          Entropy is about counting. Dimensionality is about coordination. A system can have high entropy
          (many compatible microstates) but low dimensionality (those microstates can&apos;t be independently
          accessed or controlled). The distinction matters for understanding biological control, neural
          computation, and the limits of measurement.
        </p>
      </section>

      {/* Applications */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">Where This Applies</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-white">Neuroscience</h3>
              <p className="text-gray-400 text-sm">
                Neural populations are high-dimensional, but measurements collapse them to
                low-dimensional recordings. What can and can&apos;t be inferred from limited data?
              </p>
            </div>
            <div className="border-l-2 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-white">Biology</h3>
              <p className="text-gray-400 text-sm">
                Cells navigate high-dimensional molecular spaces with low-dimensional control
                interfaces. How do they maintain coherent function?
              </p>
            </div>
            <div className="border-l-2 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-white">Medicine</h3>
              <p className="text-gray-400 text-sm">
                Clinical measurements project patient state onto sparse diagnostics.
                What are the validity limits of low-dimensional medical inference?
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-yellow-500 pl-4">
              <h3 className="text-lg font-semibold text-white">Physics</h3>
              <p className="text-gray-400 text-sm">
                Thermodynamic limits on observation. When does coarse-graining destroy
                the structure you&apos;re trying to measure?
              </p>
            </div>
            <div className="border-l-2 border-red-500 pl-4">
              <h3 className="text-lg font-semibold text-white">AI Alignment</h3>
              <p className="text-gray-400 text-sm">
                AI systems are high-dimensional; evaluation is low-dimensional.
                Geometric limits on rule-based control and certification.
              </p>
            </div>
            <div className="border-l-2 border-cyan-500 pl-4">
              <h3 className="text-lg font-semibold text-white">Philosophy</h3>
              <p className="text-gray-400 text-sm">
                What does it mean for something to be &quot;unmeasurable in principle&quot;?
                The epistemology of high-dimensional systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Physics */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">The Physics Statement</h2>

        <div className="space-y-4 text-gray-300">
          <p>
            At its core, this is statistical mechanics of partially observed, high-dimensional,
            far-from-equilibrium systems. The formal structure:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-400 ml-4">
            <li>Physical systems exist with large state dimension <em>N</em> (many coupled degrees of freedom)</li>
            <li>Observers access only low-dimensional projections (few channels, coarse-graining)</li>
            <li>The combination produces generic, testable phenomena:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Concentration of measure / apparent smoothness</li>
                <li>Projection aliasing (different states mapping to same observation)</li>
                <li>Attractor steering by small control signals</li>
                <li>Non-closure under coarse-graining</li>
                <li>Limits on identifiability from finite measurements</li>
              </ul>
            </li>
          </ol>
          <p className="mt-4">
            Biology happens to operate in this regime. But the constraints are universal across substrates.
          </p>
        </div>
      </section>

      {/* Start Here */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">Start Here</h2>

        <div className="space-y-4">
          <p className="text-gray-400 mb-6">
            Suggested reading order, depending on your background:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3">For the math/physics reader</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                <li><a href="/papers/falsifiability" className="text-blue-400 hover:text-blue-300">Limits of Falsifiability</a> — the core thermodynamic argument</li>
                <li><a href="/papers/minimal-embedding" className="text-blue-400 hover:text-blue-300">Minimal Embedding Dimension</a> — why 3D is special</li>
                <li><a href="/simulations/dimensional-collapse" className="text-blue-400 hover:text-blue-300">Dimensional Collapse simulation</a> — see it happen</li>
              </ol>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3">For the biology/neuro reader</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                <li><a href="/papers/timing-inaccessibility" className="text-blue-400 hover:text-blue-300">Timing Inaccessibility</a> — Maxwell&apos;s Demon in biology</li>
                <li><a href="/papers/cortical-oscillations" className="text-blue-400 hover:text-blue-300">Cortical Oscillations</a> — neural dimensionality bounds</li>
                <li><a href="/simulations/bits-vs-dynamics" className="text-blue-400 hover:text-blue-300">Bits vs Dynamics simulation</a> — the core distinction</li>
              </ol>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3">For the philosophy reader</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                <li><a href="/blog/quantum-mechanics-without-math" className="text-blue-400 hover:text-blue-300">Quantum Mechanics Without the Math</a> — accessible intro</li>
                <li><a href="/papers/falsifiability" className="text-blue-400 hover:text-blue-300">Limits of Falsifiability</a> — epistemology of measurement</li>
                <li><a href="/papers/processual-agency" className="text-blue-400 hover:text-blue-300">Processual Agency</a> — what this means for agency</li>
              </ol>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3">For the AI/ML reader</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                <li><a href="/papers/legibility-capability" className="text-blue-400 hover:text-blue-300">Legibility-Capability Bound</a> — limits of rule-based control</li>
                <li><a href="/simulations/coupling-sync" className="text-blue-400 hover:text-blue-300">Coupling Identification simulation</a> — when can you infer structure?</li>
                <li><a href="/papers/minimal-embedding" className="text-blue-400 hover:text-blue-300">Minimal Embedding Dimension</a> — geometric constraints</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Link to papers */}
      <section className="border-t border-gray-800 pt-8">
        <p className="text-gray-400">
          The papers develop these ideas formally across different domains.
          See the <a href="/papers" className="text-blue-400 hover:text-blue-300">papers page</a> for
          the full list, or explore the <a href="/simulations" className="text-blue-400 hover:text-blue-300">interactive simulations</a>.
        </p>
      </section>
    </div>
  );
}
