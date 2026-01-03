import Link from 'next/link';
import { getPublishedPapers, getSubmittedPapers, getInPrepPapers, Paper, PaperCategory } from '@/data/papers';

const categoryColors: Record<PaperCategory, string> = {
  biology: 'text-green-400 border-green-400/30 bg-green-400/10',
  neuroscience: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  physics: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  math: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  philosophy: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  methods: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
};

function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link
      href={`/papers/${paper.slug}`}
      className="block p-4 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded border ${categoryColors[paper.category]}`}>
          {paper.category}
        </span>
        {paper.doi && <span className="text-xs text-green-400">Published</span>}
        {paper.ssrn && <span className="text-xs text-blue-400">Preprint</span>}
      </div>
      <h3 className="font-medium text-white">{paper.title}</h3>
      <p className="text-gray-500 text-sm mt-1">
        {paper.journal}
      </p>
    </Link>
  );
}

export default function PapersPage() {
  const published = getPublishedPapers();
  const submitted = getSubmittedPapers();
  const inPrep = getInPrepPapers();

  // Count papers by category
  const allPapers = [...published, ...submitted, ...inPrep];
  const categoryCounts: Record<string, number> = {};
  allPapers.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Research Papers</h1>
        <p className="text-gray-400 mb-8">
          Formal development of dimensionality theory across domains.
        </p>

        {/* Category overview */}
        <div className="flex flex-wrap gap-2 mb-12">
          {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <span key={cat} className={`text-xs px-3 py-1 rounded-full border ${categoryColors[cat as PaperCategory]}`}>
              {cat} ({count})
            </span>
          ))}
        </div>

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
          <div className="space-y-4">
            {inPrep.map(paper => (
              <PaperCard key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
