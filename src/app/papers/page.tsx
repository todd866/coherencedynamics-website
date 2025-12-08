import Link from 'next/link';
import { getPublishedPapers, getSubmittedPapers, getInPrepPapers, Paper } from '@/data/papers';

function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link
      href={`/papers/${paper.slug}`}
      className="block p-4 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/50 transition-colors"
    >
      <h3 className="font-medium text-white">{paper.title}</h3>
      <p className="text-gray-500 text-sm mt-1">
        {paper.journal} ({paper.year})
        {paper.doi && <span className="ml-2 text-green-400">Published</span>}
        {paper.ssrn && <span className="ml-2 text-blue-400">Preprint</span>}
        {paper.github && <span className="ml-2 text-purple-400">GitHub</span>}
      </p>
    </Link>
  );
}

export default function PapersPage() {
  const published = getPublishedPapers();
  const submitted = getSubmittedPapers();
  const inPrep = getInPrepPapers();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Research Papers</h1>
        <p className="text-gray-400 mb-12">
          Publications on coherence dynamics, dimensional collapse, and biological computation.
        </p>

        {/* Published Papers */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            Published ({published.length})
          </h2>
          <div className="space-y-4">
            {published.map(paper => (
              <PaperCard key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>

        {/* Under Review */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">
            Under Review ({submitted.length})
          </h2>
          <div className="space-y-4">
            {submitted.map(paper => (
              <PaperCard key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>

        {/* In Preparation */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-500">
            In Preparation ({inPrep.length})
          </h2>
          <div className="space-y-4 opacity-60">
            {inPrep.map(paper => (
              <div
                key={paper.slug}
                className="block p-4 border border-gray-800 rounded-lg"
              >
                <h3 className="font-medium text-white">{paper.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Target: {paper.journal}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-gray-500 text-sm">
          <Link href="https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=8484972"
                className="hover:text-white transition-colors"
                target="_blank">
            Full publication list on SSRN &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
