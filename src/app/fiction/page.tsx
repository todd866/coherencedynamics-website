import Link from 'next/link';

export default function FictionPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-4 text-white">Fiction</h1>
      <p className="text-gray-400 mb-12 text-lg">
        Short stories exploring the ideas behind the research—what happens when
        high-dimensional systems meet human institutions, when coherence breaks down,
        and when measurement changes what you&apos;re trying to measure.
      </p>

      <div className="space-y-8">
        <p className="text-gray-500 text-center py-12 border border-dashed border-gray-700 rounded-xl">
          Coming soon.
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-800">
        <Link href="/" className="text-gray-400 hover:text-white">
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
