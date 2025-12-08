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
        <h2 className="text-xl font-semibold mb-4 text-white">The Research</h2>
        <p className="text-gray-300 mb-4">
          The core of this work is novel information theory: understanding how high-dimensional
          systems compress into low-dimensional observations, and what that compression costs
          thermodynamically. This framework applies broadly—to neuroscience, medicine, evolution,
          physics, AI—which is why I&apos;m applying it to everything.
        </p>
        <p className="text-gray-300 mb-4">
          All papers are sole-authored, but I&apos;m always interested in collaboration. If you
          see connections to your own work or want to apply dimensional methods to a new domain,
          get in touch.
        </p>
      </section>

      <section className="mb-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Workflow</h2>
        <p className="text-gray-300 mb-4">
          Current papers (late 2025 onwards) use an AI-assisted research workflow:
          Claude Code with Opus 4.5 handles primary drafting and simulation code,
          while Gemini 3 Pro and GPT-5.1 provide review and feedback.
          Final responsibility for all claims remains mine.
        </p>
        <p className="text-gray-400 text-sm">
          Earlier papers used different (and less sophisticated) workflows. As tooling evolves,
          I&apos;ll document the methodology for each paper more precisely.
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
