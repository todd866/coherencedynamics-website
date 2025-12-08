export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-12 text-white">About</h1>

      <section className="mb-12">
        <p className="text-xl text-gray-300 mb-8">
          Ian Todd is a third year medical student from Sydney.
        </p>
        <p className="text-gray-400">
          ian@coherencedynamics.com
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
