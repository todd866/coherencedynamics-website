import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-12 text-white">About</h1>

      <section className="mb-12">
        <p className="text-xl text-gray-300 mb-4">
          Ian Todd is a third year medical student from Sydney.
        </p>
        <p className="text-gray-400 mb-8">
          ian@coherencedynamics.com
        </p>
      </section>

      <section className="mb-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-white">The Research Program</h2>
        <p className="text-gray-300 mb-4">
          This is a research program about <strong>dimensionality</strong>: the effective degrees
          of freedom of accessible dynamics. High-dimensional systems are hard to control, resist
          compression, and generate undecidable behavior. Measurement collapses them into
          low-dimensional observations, losing information in ways that have thermodynamic costs.
        </p>
        <p className="text-gray-300 mb-4">
          The framework applies across domains—neuroscience, medicine, biology, physics, AI alignment,
          philosophy—because the constraints are mathematical, not domain-specific. I&apos;m applying
          it to everything because the same structure keeps appearing.
        </p>
        <p className="text-gray-400 mb-4">
          See the <Link href="/framework" className="text-blue-400 hover:text-blue-300">Framework</Link> page
          for the theoretical foundation, or browse the <Link href="/papers" className="text-blue-400 hover:text-blue-300">papers</Link> for
          formal development.
        </p>
      </section>

      <section className="mb-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Collaboration</h2>
        <p className="text-gray-300 mb-4">
          All papers are sole-authored, but I&apos;m interested in collaboration. If you
          see connections to your own work or want to apply dimensional methods to a new domain,
          get in touch.
        </p>
      </section>

      <section className="mb-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Workflow</h2>
        <p className="text-gray-300 mb-4">
          Current papers (late 2025 onwards) use an AI-assisted research workflow:
          Claude Code with Opus 4.5 handles primary drafting and simulation code,
          while other models provide review and feedback.
          Final responsibility for all claims remains mine.
        </p>
        <p className="text-gray-400 text-sm">
          Earlier papers used different workflows. The methodology is evolving with the tooling.
        </p>
      </section>

      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Coherence Dynamics Australia Pty Ltd</h2>
        <p className="text-gray-400">
          Sydney, Australia
        </p>
      </section>
    </div>
  );
}
